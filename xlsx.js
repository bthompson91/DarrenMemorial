(function(root){'use strict';
// Minimal .xlsx reader, no dependency: the PowerBI export is a zip of XML
// files, with inline strings and Excel serial dates. Only the first sheet
// is read. Stored and deflate entries are supported.
function fail(message){throw Error(message);}
function text(bytes){return new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/,'');}
function unescapeXml(s){return s.replace(/&(#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g,(m,body)=>{if(body==='amp')return '&';if(body==='lt')return '<';if(body==='gt')return '>';if(body==='quot')return '"';if(body==='apos')return "'";if(body[0]==='#'){const code=body[1]==='x'?parseInt(body.slice(2),16):parseInt(body.slice(1),10);return Number.isFinite(code)?String.fromCodePoint(code):m;}return m;});}
function attr(attrs,name){const match=new RegExp(name+'="([^"]*)"').exec(attrs||'');return match?match[1]:null;}
async function inflateRaw(bytes){if(!bytes.length)return new Uint8Array(0);return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());}
function zipEntries(buffer){
 const view=new DataView(buffer.buffer,buffer.byteOffset,buffer.byteLength);
 const findEocd=()=>{const start=Math.max(0,buffer.length-65557);for(let i=buffer.length-22;i>=start;i--)if(view.getUint32(i,true)===0x06054b50)return i;return -1;};
 const eocd=findEocd();if(eocd<0)fail('Not a valid .xlsx file (zip directory not found)');
 const total=view.getUint16(eocd+10,true),offset=view.getUint32(eocd+16,true),entries=new Map();
 let pos=offset;
 for(let n=0;n<total;n++){
  if(view.getUint32(pos,true)!==0x02014b50)fail('Not a valid .xlsx file (zip directory is corrupt)');
  const method=view.getUint16(pos+10,true),compressed=view.getUint32(pos+20,true),nameLen=view.getUint16(pos+28,true),extraLen=view.getUint16(pos+30,true),commentLen=view.getUint16(pos+32,true),localOffset=view.getUint32(pos+42,true),name=text(buffer.subarray(pos+46,pos+46+nameLen));
  entries.set(name,{method,compressed,localOffset});
  pos+=46+nameLen+extraLen+commentLen;
 }
 return entries;
}
async function entryBytes(buffer,entries,name){
 const entry=entries.get(name);if(!entry)fail('Missing '+name+' in .xlsx file');
 const view=new DataView(buffer.buffer,buffer.byteOffset,buffer.byteLength),local=entry.localOffset;
 if(view.getUint32(local,true)!==0x04034b50)fail('Not a valid .xlsx file (entry '+name+' is corrupt)');
 const nameLen=view.getUint16(local+26,true),extraLen=view.getUint16(local+28,true),start=local+30+nameLen+extraLen,data=buffer.subarray(start,start+entry.compressed);
 if(entry.method===0)return data;
 if(entry.method===8)return inflateRaw(data);
 fail('Unsupported .xlsx compression method '+entry.method+' for '+name);
}
function sharedStrings(xml){
 const out=[],pattern=/<(?:[\w.-]+:)?si\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?si>/g;let match;
 while((match=pattern.exec(xml))){let value='';const texts=/<(?:[\w.-]+:)?t\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?t>/g;let text;while((text=texts.exec(match[1])))value+=unescapeXml(text[1]);out.push(value);}
 return out;
}
function columnIndex(ref){const letters=/^[A-Z]+/.exec(ref||'');if(!letters)return null;let index=0;for(const ch of letters[0])index=index*26+(ch.charCodeAt(0)-64);return index-1;}
function sheetRows(xml,shared){
 const rows=[],rowPattern=/<(?:[\w.-]+:)?row\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?row>/g;let rowMatch;
 while((rowMatch=rowPattern.exec(xml))){
  const row=[],cellPattern=/<(?:[\w.-]+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:[\w.-]+:)?c>)/g;let cellMatch,position=0;
  while((cellMatch=cellPattern.exec(rowMatch[1]))){
   const attrs=cellMatch[1]||'',content=cellMatch[2]||'',type=attr(attrs,'t'),ref=attr(attrs,'r'),index=columnIndex(ref)??position++;
   let value=null;
   if(type==='inlineStr'){let joined='';const texts=/<(?:[\w.-]+:)?t\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?t>/g;let text;while((text=texts.exec(content)))joined+=unescapeXml(text[1]);value=joined;}
   else{const raw=/<(?:[\w.-]+:)?v\b[^>]*>([\s\S]*?)<\/(?:[\w.-]+:)?v>/.exec(content);if(raw){const text=unescapeXml(raw[1]);value=type==='s'?shared[Number(text)]??'':/^-?\d+(\.\d+)?$/.test(text)?Number(text):text;}}
   while(row.length<=index)row.push(null);
   row[index]=value;
  }
  rows.push(row);
 }
 return rows;
}
function sheetPath(workbookXml,relsXml){
 const sheets=[...workbookXml.matchAll(/<(?:[\w.-]+:)?sheet\b([^>]*?)\/?>/g)].map(m=>({id:attr(m[1],'r:id')||attr(m[1],'id'),name:attr(m[1],'name')}));
 const rels=new Map([...relsXml.matchAll(/<(?:[\w.-]+:)?Relationship\b([^>]*?)\/?>/g)].map(m=>[attr(m[1],'Id'),attr(m[1],'Target')]));
 for(const sheet of sheets){const target=rels.get(sheet.id);if(!target)continue;const path=target.replace(/^\//,'');return path.startsWith('xl/')?path:'xl/'+path;}
 return 'xl/worksheets/sheet1.xml';
}
async function parse(arrayBuffer){
 const buffer=arrayBuffer instanceof Uint8Array?arrayBuffer:new Uint8Array(arrayBuffer),entries=zipEntries(buffer);
 let path='xl/worksheets/sheet1.xml';
 if(entries.has('xl/workbook.xml')){const workbook=text(await entryBytes(buffer,entries,'xl/workbook.xml'));let rels='';if(entries.has('xl/_rels/workbook.xml.rels'))rels=text(await entryBytes(buffer,entries,'xl/_rels/workbook.xml.rels'));path=sheetPath(workbook,rels);}
 const shared=entries.has('xl/sharedStrings.xml')?sharedStrings(text(await entryBytes(buffer,entries,'xl/sharedStrings.xml'))):[];
 return sheetRows(text(await entryBytes(buffer,entries,path)),shared);
}
const api={parse,sheetRows,sharedStrings,sheetPath};if(typeof module!=='undefined')module.exports=api;root.MilkRunXlsx=api;})(globalThis);
