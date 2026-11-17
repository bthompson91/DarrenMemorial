(function(root){
'use strict';
function escapeText(value){return String(value??'').replace(/\\/g,'\\\\').replace(/{/g,'\\{').replace(/}/g,'\\}').replace(/\r\n?|\n/g,'\\line ').replace(/[^\x20-\x7e]/g,c=>{const code=c.charCodeAt(0);return `\\u${code>32767?code-65536:code}?`;});}
function row(cells,widths,height,header){
 let position=0;
 const borders='\\clbrdrt\\brdrs\\brdrw10\\clbrdrl\\brdrs\\brdrw10\\clbrdrb\\brdrs\\brdrw10\\clbrdrr\\brdrs\\brdrw10';
 const definitions=widths.map(width=>{position+=width;return borders+'\\clvertalt\\cellx'+position;}).join('');
 const content=cells.map(cell=>`\\pard\\intbl\\f0\\fs20 ${cell.bold?'\\b ':''}${escapeText(cell.text)}${cell.bold?'\\b0':''}\\cell`).join('');
 return `\\trowd\\trgaph100${height?'\\trrh-'+height:''}${header?'\\trhdr':''}${definitions}${content}\\row\n`;
}
function create(data){
 const infoWidths=[2600,2633,2600,2633],itemWidths=[1300,4550,700,1958,1958];
 const cell=(text,bold=false)=>({text,bold}),info=[
  [cell('From Site',true),cell(data.fromSite),cell('To Site',true),cell(data.toSite)],
  [cell('From Site Address',true),cell(''),cell('To Site Address',true),cell('')],
  [cell('From Site Contact',true),cell(data.fromSiteContact),cell('To Site Contact',true),cell(data.toSiteContact)],
  [cell('Transfer Order Number',true),cell(data.orderNumber),cell(''),cell('')]
 ];
 const items=data.reliable?(data.items||[]).map(item=>[item.productId,item.itemDescription,item.quantity,item.date?`${item.date.slice(8,10)}-${item.date.slice(5,7)}-${item.date.slice(0,4)}`:'',item.returnDate?`${item.returnDate.slice(8,10)}-${item.returnDate.slice(5,7)}-${item.returnDate.slice(0,4)}`:'']):[];
 while(items.length<10)items.push(['','','','','']);
 return `{\\rtf1\\ansi\\deff0\\uc1
{\\fonttbl{\\f0 Arial;}}
\\viewkind4\\widowctrl\\paperw11906\\paperh16838\\margl720\\margr720\\margt720\\margb720
\\pard\\qc\\f0\\fs28\\b ENCORE UBER COURIER\\b0\\sa180\\par
${info.map(cells=>row(cells,infoWidths)).join('')}
\\pard\\sb180\\sa80\\f0\\fs22\\b Items\\b0\\par
${row(['Product ID','Item Description','Qty','Prep Date','Return Date'].map(text=>cell(text,true)),itemWidths,0,true)}
${items.map(values=>row(values.map(value=>cell(value)),itemWidths,600)).join('')}}`;
}
const api={create};
if(typeof module!=='undefined')module.exports=api;
root.MilkRunCourierRtf=api;
})(globalThis);
