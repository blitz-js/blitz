module.exports=(()=>{var e={573:(e,r,l)=>{const{Container:t}=l(43);class NestedDeclaration extends t{constructor(e){super(e);this.type="decl";this.isNested=true;if(!this.nodes)this.nodes=[]}}e.exports=NestedDeclaration},662:(e,r,l)=>{let{Input:t}=l(43);let i=l(949);e.exports=function scssParse(e,r){let l=new t(e,r);let f=new i(l);f.parse();return f.root}},949:(e,r,l)=>{let{Comment:t}=l(43);let i=l(552);let f=l(573);let a=l(457);class ScssParser extends i{createTokenizer(){this.tokenizer=a(this.input)}rule(e){let r=false;let l=0;let t="";for(let i of e){if(r){if(i[0]!=="comment"&&i[0]!=="{"){t+=i[1]}}else if(i[0]==="space"&&i[1].includes("\n")){break}else if(i[0]==="("){l+=1}else if(i[0]===")"){l-=1}else if(l===0&&i[0]===":"){r=true}}if(!r||t.trim()===""||/^[#:A-Za-z-]/.test(t)){super.rule(e)}else{e.pop();let r=new f;this.init(r,e[0][2]);let l;for(let r=e.length-1;r>=0;r--){if(e[r][0]!=="space"){l=e[r];break}}if(l[3]){let e=this.input.fromOffset(l[3]);r.source.end={offset:l[3],line:e.line,column:e.col}}else{let e=this.input.fromOffset(l[2]);r.source.end={offset:l[2],line:e.line,column:e.col}}while(e[0][0]!=="word"){r.raws.before+=e.shift()[1]}r.source.start={line:e[0][2],column:e[0][3]};r.prop="";while(e.length){let l=e[0][0];if(l===":"||l==="space"||l==="comment"){break}r.prop+=e.shift()[1]}r.raws.between="";let t;while(e.length){t=e.shift();if(t[0]===":"){r.raws.between+=t[1];break}else{r.raws.between+=t[1]}}if(r.prop[0]==="_"||r.prop[0]==="*"){r.raws.before+=r.prop[0];r.prop=r.prop.slice(1)}r.raws.between+=this.spacesAndCommentsFromStart(e);this.precheckMissedSemicolon(e);for(let l=e.length-1;l>0;l--){t=e[l];if(t[1]==="!important"){r.important=true;let t=this.stringFrom(e,l);t=this.spacesFromEnd(e)+t;if(t!==" !important"){r.raws.important=t}break}else if(t[1]==="important"){let t=e.slice(0);let i="";for(let e=l;e>0;e--){let r=t[e][0];if(i.trim().indexOf("!")===0&&r!=="space"){break}i=t.pop()[1]+i}if(i.trim().indexOf("!")===0){r.important=true;r.raws.important=i;e=t}}if(t[0]!=="space"&&t[0]!=="comment"){break}}this.raw(r,"value",e);if(r.value.includes(":")){this.checkMissedSemicolon(e)}this.current=r}}comment(e){if(e[4]==="inline"){let r=new t;this.init(r,e[2]);r.raws.inline=true;let l=this.input.fromOffset(e[3]);r.source.end={offset:e[3],line:l.line,column:l.col};let i=e[1].slice(2);if(/^\s*$/.test(i)){r.text="";r.raws.left=i;r.raws.right=""}else{let e=i.match(/^(\s*)([^]*\S)(\s*)$/);let l=e[2].replace(/(\*\/|\/\*)/g,"*//*");r.text=l;r.raws.left=e[1];r.raws.right=e[3];r.raws.text=e[2]}}else{super.comment(e)}}raw(e,r,l){super.raw(e,r,l);if(e.raws[r]){let t=e.raws[r].raw;e.raws[r].raw=l.reduce((e,r)=>{if(r[0]==="comment"&&r[4]==="inline"){let l=r[1].slice(2).replace(/(\*\/|\/\*)/g,"*//*");return e+"/*"+l+"*/"}else{return e+r[1]}},"");if(t!==e.raws[r].raw){e.raws[r].scss=t}}}}e.exports=ScssParser},671:(e,r,l)=>{let t=l(453);class ScssStringifier extends t{comment(e){let r=this.raw(e,"left","commentLeft");let l=this.raw(e,"right","commentRight");if(e.raws.inline){let t=e.raws.text||e.text;this.builder("//"+r+t+l,e)}else{this.builder("/*"+r+e.text+l+"*/",e)}}decl(e,r){if(!e.isNested){super.decl(e,r)}else{let r=this.raw(e,"between","colon");let l=e.prop+r+this.rawValue(e,"value");if(e.important){l+=e.raws.important||" !important"}this.builder(l+"{",e,"start");let t;if(e.nodes&&e.nodes.length){this.body(e);t=this.raw(e,"after")}else{t=this.raw(e,"after","emptyBody")}if(t)this.builder(t);this.builder("}",e,"end")}}rawValue(e,r){let l=e[r];let t=e.raws[r];if(t&&t.value===l){return t.scss?t.scss:t.raw}else{return l}}}e.exports=ScssStringifier},279:(e,r,l)=>{let t=l(671);e.exports=function scssStringify(e,r){let l=new t(r);l.stringify(e)}},225:(e,r,l)=>{let t=l(279);let i=l(662);e.exports={parse:i,stringify:t}},457:e=>{"use strict";const r="'".charCodeAt(0);const l='"'.charCodeAt(0);const t="\\".charCodeAt(0);const i="/".charCodeAt(0);const f="\n".charCodeAt(0);const a=" ".charCodeAt(0);const s="\f".charCodeAt(0);const w="\t".charCodeAt(0);const h="\r".charCodeAt(0);const o="[".charCodeAt(0);const n="]".charCodeAt(0);const u="(".charCodeAt(0);const c=")".charCodeAt(0);const b="{".charCodeAt(0);const m="}".charCodeAt(0);const y=";".charCodeAt(0);const p="*".charCodeAt(0);const C=":".charCodeAt(0);const A="@".charCodeAt(0);const d=",".charCodeAt(0);const O="#".charCodeAt(0);const g=/[\t\n\f\r "#'()/;[\\\]{}]/g;const D=/[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;const S=/.[\n"'(/\\]/;const q=/[\da-f]/i;const z=/[\n\f\r]/g;e.exports=function scssTokenize(e,F={}){let V=e.css.valueOf();let $=F.ignoreErrors;let k,B,I,M,_;let U,Z,j,G;let J=V.length;let X=0;let Y=[];let P=[];let v;function position(){return X}function unclosed(r){throw e.error("Unclosed "+r,X)}function endOfFile(){return P.length===0&&X>=J}function interpolation(){let e=1;let i=false;let f=false;while(e>0){B+=1;if(V.length<=B)unclosed("interpolation");k=V.charCodeAt(B);j=V.charCodeAt(B+1);if(i){if(!f&&k===i){i=false;f=false}else if(k===t){f=!U}else if(f){f=false}}else if(k===r||k===l){i=k}else if(k===m){e-=1}else if(k===O&&j===b){e+=1}}}function nextToken(e){if(P.length)return P.pop();if(X>=J)return;let F=e?e.ignoreUnclosed:false;k=V.charCodeAt(X);switch(k){case f:case a:case w:case h:case s:{B=X;do{B+=1;k=V.charCodeAt(B)}while(k===a||k===f||k===w||k===h||k===s);G=["space",V.slice(X,B)];X=B-1;break}case o:case n:case b:case m:case C:case y:case c:{let e=String.fromCharCode(k);G=[e,e,X];break}case d:{G=["word",",",X,X+1];break}case u:{Z=Y.length?Y.pop()[1]:"";j=V.charCodeAt(X+1);if(Z==="url"&&j!==r&&j!==l){v=1;U=false;B=X+1;while(B<=V.length-1){j=V.charCodeAt(B);if(j===t){U=!U}else if(j===u){v+=1}else if(j===c){v-=1;if(v===0)break}B+=1}M=V.slice(X,B+1);G=["brackets",M,X,B];X=B}else{B=V.indexOf(")",X+1);M=V.slice(X,B+1);if(B===-1||S.test(M)){G=["(","(",X]}else{G=["brackets",M,X,B];X=B}}break}case r:case l:{I=k;B=X;U=false;while(B<J){B++;if(B===J)unclosed("string");k=V.charCodeAt(B);j=V.charCodeAt(B+1);if(!U&&k===I){break}else if(k===t){U=!U}else if(U){U=false}else if(k===O&&j===b){interpolation()}}G=["string",V.slice(X,B+1),X,B];X=B;break}case A:{g.lastIndex=X+1;g.test(V);if(g.lastIndex===0){B=V.length-1}else{B=g.lastIndex-2}G=["at-word",V.slice(X,B+1),X,B];X=B;break}case t:{B=X;_=true;while(V.charCodeAt(B+1)===t){B+=1;_=!_}k=V.charCodeAt(B+1);if(_&&k!==i&&k!==a&&k!==f&&k!==w&&k!==h&&k!==s){B+=1;if(q.test(V.charAt(B))){while(q.test(V.charAt(B+1))){B+=1}if(V.charCodeAt(B+1)===a){B+=1}}}G=["word",V.slice(X,B+1),X,B];X=B;break}default:j=V.charCodeAt(X+1);if(k===O&&j===b){B=X;interpolation();M=V.slice(X,B+1);G=["word",M,X,B];X=B}else if(k===i&&j===p){B=V.indexOf("*/",X+2)+1;if(B===0){if($||F){B=V.length}else{unclosed("comment")}}G=["comment",V.slice(X,B+1),X,B];X=B}else if(k===i&&j===i){z.lastIndex=X+1;z.test(V);if(z.lastIndex===0){B=V.length-1}else{B=z.lastIndex-2}M=V.slice(X,B+1);G=["comment",M,X,B,"inline"];X=B}else{D.lastIndex=X+1;D.test(V);if(D.lastIndex===0){B=V.length-1}else{B=D.lastIndex-2}G=["word",V.slice(X,B+1),X,B];Y.push(G);X=B}break}X++;return G}function back(e){P.push(e)}return{back:back,nextToken:nextToken,endOfFile:endOfFile,position:position}}},453:e=>{"use strict";const r={colon:": ",indent:"    ",beforeDecl:"\n",beforeRule:"\n",beforeOpen:" ",beforeClose:"\n",beforeComment:"\n",after:"\n",emptyBody:"",commentLeft:" ",commentRight:" ",semicolon:false};function capitalize(e){return e[0].toUpperCase()+e.slice(1)}class Stringifier{constructor(e){this.builder=e}stringify(e,r){if(!this[e.type]){throw new Error("Unknown AST node type "+e.type+". "+"Maybe you need to change PostCSS stringifier.")}this[e.type](e,r)}root(e){this.body(e);if(e.raws.after)this.builder(e.raws.after)}comment(e){let r=this.raw(e,"left","commentLeft");let l=this.raw(e,"right","commentRight");this.builder("/*"+r+e.text+l+"*/",e)}decl(e,r){let l=this.raw(e,"between","colon");let t=e.prop+l+this.rawValue(e,"value");if(e.important){t+=e.raws.important||" !important"}if(r)t+=";";this.builder(t,e)}rule(e){this.block(e,this.rawValue(e,"selector"));if(e.raws.ownSemicolon){this.builder(e.raws.ownSemicolon,e,"end")}}atrule(e,r){let l="@"+e.name;let t=e.params?this.rawValue(e,"params"):"";if(typeof e.raws.afterName!=="undefined"){l+=e.raws.afterName}else if(t){l+=" "}if(e.nodes){this.block(e,l+t)}else{let i=(e.raws.between||"")+(r?";":"");this.builder(l+t+i,e)}}body(e){let r=e.nodes.length-1;while(r>0){if(e.nodes[r].type!=="comment")break;r-=1}let l=this.raw(e,"semicolon");for(let t=0;t<e.nodes.length;t++){let i=e.nodes[t];let f=this.raw(i,"before");if(f)this.builder(f);this.stringify(i,r!==t||l)}}block(e,r){let l=this.raw(e,"between","beforeOpen");this.builder(r+l+"{",e,"start");let t;if(e.nodes&&e.nodes.length){this.body(e);t=this.raw(e,"after")}else{t=this.raw(e,"after","emptyBody")}if(t)this.builder(t);this.builder("}",e,"end")}raw(e,l,t){let i;if(!t)t=l;if(l){i=e.raws[l];if(typeof i!=="undefined")return i}let f=e.parent;if(t==="before"){if(!f||f.type==="root"&&f.first===e){return""}}if(!f)return r[t];let a=e.root();if(!a.rawCache)a.rawCache={};if(typeof a.rawCache[t]!=="undefined"){return a.rawCache[t]}if(t==="before"||t==="after"){return this.beforeAfter(e,t)}else{let r="raw"+capitalize(t);if(this[r]){i=this[r](a,e)}else{a.walk(e=>{i=e.raws[l];if(typeof i!=="undefined")return false})}}if(typeof i==="undefined")i=r[t];a.rawCache[t]=i;return i}rawSemicolon(e){let r;e.walk(e=>{if(e.nodes&&e.nodes.length&&e.last.type==="decl"){r=e.raws.semicolon;if(typeof r!=="undefined")return false}});return r}rawEmptyBody(e){let r;e.walk(e=>{if(e.nodes&&e.nodes.length===0){r=e.raws.after;if(typeof r!=="undefined")return false}});return r}rawIndent(e){if(e.raws.indent)return e.raws.indent;let r;e.walk(l=>{let t=l.parent;if(t&&t!==e&&t.parent&&t.parent===e){if(typeof l.raws.before!=="undefined"){let e=l.raws.before.split("\n");r=e[e.length-1];r=r.replace(/\S/g,"");return false}}});return r}rawBeforeComment(e,r){let l;e.walkComments(e=>{if(typeof e.raws.before!=="undefined"){l=e.raws.before;if(l.includes("\n")){l=l.replace(/[^\n]+$/,"")}return false}});if(typeof l==="undefined"){l=this.raw(r,null,"beforeDecl")}else if(l){l=l.replace(/\S/g,"")}return l}rawBeforeDecl(e,r){let l;e.walkDecls(e=>{if(typeof e.raws.before!=="undefined"){l=e.raws.before;if(l.includes("\n")){l=l.replace(/[^\n]+$/,"")}return false}});if(typeof l==="undefined"){l=this.raw(r,null,"beforeRule")}else if(l){l=l.replace(/\S/g,"")}return l}rawBeforeRule(e){let r;e.walk(l=>{if(l.nodes&&(l.parent!==e||e.first!==l)){if(typeof l.raws.before!=="undefined"){r=l.raws.before;if(r.includes("\n")){r=r.replace(/[^\n]+$/,"")}return false}}});if(r)r=r.replace(/\S/g,"");return r}rawBeforeClose(e){let r;e.walk(e=>{if(e.nodes&&e.nodes.length>0){if(typeof e.raws.after!=="undefined"){r=e.raws.after;if(r.includes("\n")){r=r.replace(/[^\n]+$/,"")}return false}}});if(r)r=r.replace(/\S/g,"");return r}rawBeforeOpen(e){let r;e.walk(e=>{if(e.type!=="decl"){r=e.raws.between;if(typeof r!=="undefined")return false}});return r}rawColon(e){let r;e.walkDecls(e=>{if(typeof e.raws.between!=="undefined"){r=e.raws.between.replace(/[^\s:]/g,"");return false}});return r}beforeAfter(e,r){let l;if(e.type==="decl"){l=this.raw(e,null,"beforeDecl")}else if(e.type==="comment"){l=this.raw(e,null,"beforeComment")}else if(r==="before"){l=this.raw(e,null,"beforeRule")}else{l=this.raw(e,null,"beforeClose")}let t=e.parent;let i=0;while(t&&t.type!=="root"){i+=1;t=t.parent}if(l.includes("\n")){let r=this.raw(e,null,"indent");if(r.length){for(let e=0;e<i;e++)l+=r}}return l}rawValue(e,r){let l=e[r];let t=e.raws[r];if(t&&t.value===l){return t.raw}return l}}e.exports=Stringifier},43:e=>{"use strict";e.exports=require("postcss")},552:e=>{"use strict";e.exports=require("postcss/lib/parser")}};var r={};function __nccwpck_require__(l){if(r[l]){return r[l].exports}var t=r[l]={exports:{}};var i=true;try{e[l](t,t.exports,__nccwpck_require__);i=false}finally{if(i)delete r[l]}return t.exports}__nccwpck_require__.ab=__dirname+"/";return __nccwpck_require__(225)})();