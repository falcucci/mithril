(()=>{"use strict";var e,a,c,f,t,r={},d={};function o(e){var a=d[e];if(void 0!==a)return a.exports;var c=d[e]={id:e,loaded:!1,exports:{}};return r[e].call(c.exports,c,c.exports,o),c.loaded=!0,c.exports}o.m=r,o.c=d,e=[],o.O=(a,c,f,t)=>{if(!c){var r=1/0;for(i=0;i<e.length;i++){c=e[i][0],f=e[i][1],t=e[i][2];for(var d=!0,b=0;b<c.length;b++)(!1&t||r>=t)&&Object.keys(o.O).every((e=>o.O[e](c[b])))?c.splice(b--,1):(d=!1,t<r&&(r=t));if(d){e.splice(i--,1);var n=f();void 0!==n&&(a=n)}}return a}t=t||0;for(var i=e.length;i>0&&e[i-1][2]>t;i--)e[i]=e[i-1];e[i]=[c,f,t]},o.n=e=>{var a=e&&e.__esModule?()=>e.default:()=>e;return o.d(a,{a:a}),a},c=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,o.t=function(e,f){if(1&f&&(e=this(e)),8&f)return e;if("object"==typeof e&&e){if(4&f&&e.__esModule)return e;if(16&f&&"function"==typeof e.then)return e}var t=Object.create(null);o.r(t);var r={};a=a||[null,c({}),c([]),c(c)];for(var d=2&f&&e;"object"==typeof d&&!~a.indexOf(d);d=c(d))Object.getOwnPropertyNames(d).forEach((a=>r[a]=()=>e[a]));return r.default=()=>e,o.d(t,r),t},o.d=(e,a)=>{for(var c in a)o.o(a,c)&&!o.o(e,c)&&Object.defineProperty(e,c,{enumerable:!0,get:a[c]})},o.f={},o.e=e=>Promise.all(Object.keys(o.f).reduce(((a,c)=>(o.f[c](e,a),a)),[])),o.u=e=>"assets/js/"+({53:"935f2afb",301:"0dadd2c9",613:"5efc9d3d",1317:"315aa7a9",1971:"da6513d5",2307:"6759b17e",2535:"814f3328",2655:"4cd22fa7",2659:"346551de",2708:"5ee0e852",2852:"b1a5869c",3089:"a6aa9e1f",3148:"8bb94aa1",3511:"63969280",3608:"9e4087bc",3922:"3eb12003",4013:"01a85c17",4059:"3aecf4c2",4163:"1d3fbc77",4189:"23f2110f",4195:"c4f5d8e4",4354:"298e1cbf",4687:"646279b0",4885:"8e8f279c",5038:"e7e087cc",5782:"8d8b4977",5857:"d4f8d7b5",5968:"efe9c66f",6103:"ccc49370",6320:"3aa955b1",6430:"1dd8b324",6846:"319c539b",7338:"3488a21a",7485:"c7d749c3",7615:"2419ec42",7658:"c554d126",7695:"653f7965",7918:"17896441",8071:"73902fa9",8139:"012f7f96",8159:"bdc52102",8587:"bef1cd89",8610:"6875c492",8612:"f0ad3fbb",9387:"9494ffc1",9514:"1be78505",9518:"b48fcc4a",9697:"73fe69d8",9713:"470d070e",9743:"43040bd9",9817:"14eb3368"}[e]||e)+"."+{53:"3185821f",301:"a2d5f358",613:"77c49bfc",1317:"a9063249",1971:"627a1c50",2307:"8558e0ee",2535:"3acfc799",2655:"1de115ee",2659:"10968b1c",2708:"d123c30d",2852:"dfa1e08f",3089:"51fea4fd",3148:"b65a8482",3511:"12b795f0",3527:"7357f1a4",3608:"901ad7f9",3922:"2c1dea98",4013:"e708022d",4059:"50d82c20",4163:"a09a1cfd",4189:"b4eab903",4195:"fdb2bd48",4354:"813e6148",4687:"f36ba647",4885:"29bc08e9",4972:"8e77c60e",5038:"5b455dd9",5782:"a4757d31",5857:"a2e83e1a",5968:"e9f73b17",6048:"43073872",6103:"683a02ef",6320:"4ead673a",6430:"3eca41cd",6846:"aed20670",7036:"8817abd0",7338:"4ccf36e8",7485:"725aff62",7615:"c99c2345",7658:"0578cf26",7695:"31beff73",7918:"dbde19c7",8071:"dec6458b",8139:"61fa29c6",8159:"fd53d43e",8587:"78759492",8610:"8e7bd68e",8612:"1305652d",9387:"1a5b5180",9514:"e4c28954",9518:"dd47bdde",9697:"4cab8638",9713:"f28475bb",9743:"e1b78311",9817:"1e6c18a3"}[e]+".js",o.miniCssF=e=>{},o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=(e,a)=>Object.prototype.hasOwnProperty.call(e,a),f={},t="mithril-doc:",o.l=(e,a,c,r)=>{if(f[e])f[e].push(a);else{var d,b;if(void 0!==c)for(var n=document.getElementsByTagName("script"),i=0;i<n.length;i++){var l=n[i];if(l.getAttribute("src")==e||l.getAttribute("data-webpack")==t+c){d=l;break}}d||(b=!0,(d=document.createElement("script")).charset="utf-8",d.timeout=120,o.nc&&d.setAttribute("nonce",o.nc),d.setAttribute("data-webpack",t+c),d.src=e),f[e]=[a];var u=(a,c)=>{d.onerror=d.onload=null,clearTimeout(s);var t=f[e];if(delete f[e],d.parentNode&&d.parentNode.removeChild(d),t&&t.forEach((e=>e(c))),a)return a(c)},s=setTimeout(u.bind(null,void 0,{type:"timeout",target:d}),12e4);d.onerror=u.bind(null,d.onerror),d.onload=u.bind(null,d.onload),b&&document.head.appendChild(d)}},o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),o.p="/doc/",o.gca=function(e){return e={17896441:"7918",63969280:"3511","935f2afb":"53","0dadd2c9":"301","5efc9d3d":"613","315aa7a9":"1317",da6513d5:"1971","6759b17e":"2307","814f3328":"2535","4cd22fa7":"2655","346551de":"2659","5ee0e852":"2708",b1a5869c:"2852",a6aa9e1f:"3089","8bb94aa1":"3148","9e4087bc":"3608","3eb12003":"3922","01a85c17":"4013","3aecf4c2":"4059","1d3fbc77":"4163","23f2110f":"4189",c4f5d8e4:"4195","298e1cbf":"4354","646279b0":"4687","8e8f279c":"4885",e7e087cc:"5038","8d8b4977":"5782",d4f8d7b5:"5857",efe9c66f:"5968",ccc49370:"6103","3aa955b1":"6320","1dd8b324":"6430","319c539b":"6846","3488a21a":"7338",c7d749c3:"7485","2419ec42":"7615",c554d126:"7658","653f7965":"7695","73902fa9":"8071","012f7f96":"8139",bdc52102:"8159",bef1cd89:"8587","6875c492":"8610",f0ad3fbb:"8612","9494ffc1":"9387","1be78505":"9514",b48fcc4a:"9518","73fe69d8":"9697","470d070e":"9713","43040bd9":"9743","14eb3368":"9817"}[e]||e,o.p+o.u(e)},(()=>{var e={1303:0,532:0};o.f.j=(a,c)=>{var f=o.o(e,a)?e[a]:void 0;if(0!==f)if(f)c.push(f[2]);else if(/^(1303|532)$/.test(a))e[a]=0;else{var t=new Promise(((c,t)=>f=e[a]=[c,t]));c.push(f[2]=t);var r=o.p+o.u(a),d=new Error;o.l(r,(c=>{if(o.o(e,a)&&(0!==(f=e[a])&&(e[a]=void 0),f)){var t=c&&("load"===c.type?"missing":c.type),r=c&&c.target&&c.target.src;d.message="Loading chunk "+a+" failed.\n("+t+": "+r+")",d.name="ChunkLoadError",d.type=t,d.request=r,f[1](d)}}),"chunk-"+a,a)}},o.O.j=a=>0===e[a];var a=(a,c)=>{var f,t,r=c[0],d=c[1],b=c[2],n=0;if(r.some((a=>0!==e[a]))){for(f in d)o.o(d,f)&&(o.m[f]=d[f]);if(b)var i=b(o)}for(a&&a(c);n<r.length;n++)t=r[n],o.o(e,t)&&e[t]&&e[t][0](),e[t]=0;return o.O(i)},c=self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[];c.forEach(a.bind(null,0)),c.push=a.bind(null,c.push.bind(c))})()})();