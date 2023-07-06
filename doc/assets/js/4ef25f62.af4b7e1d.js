"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[2156],{3905:(t,e,i)=>{i.d(e,{Zo:()=>h,kt:()=>u});var r=i(67294);function n(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function a(t,e){var i=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),i.push.apply(i,r)}return i}function o(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{};e%2?a(Object(i),!0).forEach((function(e){n(t,e,i[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(i)):a(Object(i)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e))}))}return t}function l(t,e){if(null==t)return{};var i,r,n=function(t,e){if(null==t)return{};var i,r,n={},a=Object.keys(t);for(r=0;r<a.length;r++)i=a[r],e.indexOf(i)>=0||(n[i]=t[i]);return n}(t,e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);for(r=0;r<a.length;r++)i=a[r],e.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(t,i)&&(n[i]=t[i])}return n}var s=r.createContext({}),p=function(t){var e=r.useContext(s),i=e;return t&&(i="function"==typeof t?t(e):o(o({},e),t)),i},h=function(t){var e=p(t.components);return r.createElement(s.Provider,{value:e},t.children)},c="mdxType",d={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},m=r.forwardRef((function(t,e){var i=t.components,n=t.mdxType,a=t.originalType,s=t.parentName,h=l(t,["components","mdxType","originalType","parentName"]),c=p(i),m=n,u=c["".concat(s,".").concat(m)]||c[m]||d[m]||a;return i?r.createElement(u,o(o({ref:e},h),{},{components:i})):r.createElement(u,o({ref:e},h))}));function u(t,e){var i=arguments,n=e&&e.mdxType;if("string"==typeof t||n){var a=i.length,o=new Array(a);o[0]=m;var l={};for(var s in e)hasOwnProperty.call(e,s)&&(l[s]=e[s]);l.originalType=t,l[c]="string"==typeof t?t:n,o[1]=l;for(var p=2;p<a;p++)o[p]=i[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,i)}m.displayName="MDXCreateElement"},92679:(t,e,i)=>{i.r(e),i.d(e,{assets:()=>s,contentTitle:()=>o,default:()=>d,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=i(87462),n=(i(67294),i(3905));const a={sidebar_position:4,sidebar_label:"Mithril Client"},o="Mithril Client Node",l={unversionedId:"mithril/mithril-network/client",id:"version-maintained/mithril/mithril-network/client",title:"Mithril Client Node",description:"Welcome to the Mithril Client Node guide!",source:"@site/versioned_docs/version-maintained/mithril/mithril-network/client.md",sourceDirName:"mithril/mithril-network",slug:"/mithril/mithril-network/client",permalink:"/doc/mithril/mithril-network/client",draft:!1,editUrl:"https://github.com/input-output-hk/mithril/edit/main/docs/root/mithril/mithril-network/client.md",tags:[],version:"maintained",sidebarPosition:4,frontMatter:{sidebar_position:4,sidebar_label:"Mithril Client"},sidebar:"mithrilSideBar",previous:{title:"Mithril Signer",permalink:"/doc/mithril/mithril-network/signer"}},s={},p=[{value:"Introduction",id:"introduction",level:2},{value:"Wallet restoration",id:"wallet-restoration",level:2},{value:"Certificate chain Verification",id:"certificate-chain-verification",level:3},{value:"Snapshot Artifacts Retrieval",id:"snapshot-artifacts-retrieval",level:3},{value:"Snapshot Restoration",id:"snapshot-restoration",level:3},{value:"Mithril Stake Distribution",id:"mithril-stake-distribution",level:2}],h={toc:p},c="wrapper";function d(t){let{components:e,...i}=t;return(0,n.kt)(c,(0,r.Z)({},h,i,{components:e,mdxType:"MDXLayout"}),(0,n.kt)("h1",{id:"mithril-client-node"},"Mithril Client Node"),(0,n.kt)("p",null,"Welcome to the Mithril Client Node guide!"),(0,n.kt)("h2",{id:"introduction"},"Introduction"),(0,n.kt)("admonition",{type:"info"},(0,n.kt)("p",{parentName:"admonition"},"The ",(0,n.kt)("strong",{parentName:"p"},"Mithril Client")," node is used to list, show or verify artifacts certified by ",(0,n.kt)("strong",{parentName:"p"},"Mithril certificates"),":"),(0,n.kt)("ol",{parentName:"admonition"},(0,n.kt)("li",{parentName:"ol"},"Cardano full node snapshots"),(0,n.kt)("li",{parentName:"ol"},"Stake Distribution involved in Mithril signatures."))),(0,n.kt)("admonition",{type:"tip"},(0,n.kt)("ul",{parentName:"admonition"},(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"For more information about the ",(0,n.kt)("strong",{parentName:"p"},"Mithril Protocol"),", please refer to the ",(0,n.kt)("a",{parentName:"p",href:"/doc/mithril/mithril-protocol/protocol"},"Protocol in depth")," page.")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("p",{parentName:"li"},"For more information about the ",(0,n.kt)("strong",{parentName:"p"},"Mithril Client"),", please refer to the ",(0,n.kt)("a",{parentName:"p",href:"/doc/manual/developer-docs/nodes/mithril-client"},"Developer Documentation")," page.")))),(0,n.kt)("h2",{id:"wallet-restoration"},"Wallet restoration"),(0,n.kt)("p",null,"At a first glance, a ",(0,n.kt)("strong",{parentName:"p"},"Mithril Client")," can be used by any user that needs to restore and bootstrap rapidly a ",(0,n.kt)("strong",{parentName:"p"},"Cardano full node"),":"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"A full node wallet such as ",(0,n.kt)("strong",{parentName:"li"},"Daedalus")),(0,n.kt)("li",{parentName:"ul"},"A node operator (SPO, Exchange, Dapp)")),(0,n.kt)("p",null,"On the long run, the ",(0,n.kt)("strong",{parentName:"p"},"Mithril Client")," is intended to be incorporated in ",(0,n.kt)("strong",{parentName:"p"},"Light Clients")," and ",(0,n.kt)("strong",{parentName:"p"},"Wallets"),"."),(0,n.kt)("h3",{id:"certificate-chain-verification"},"Certificate chain Verification"),(0,n.kt)("p",null,"The first thing the ",(0,n.kt)("strong",{parentName:"p"},"Mithril Client")," does is to download the associated ",(0,n.kt)("strong",{parentName:"p"},"Certificate Chain")," and for each ",(0,n.kt)("strong",{parentName:"p"},"Mithril Certificate")," verify that (in the following order):"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"The certificate is not tampered (by computing its hash and verifying that is is the same as the one used for downloading it)."),(0,n.kt)("li",{parentName:"ol"},"The locally computed ",(0,n.kt)("strong",{parentName:"li"},"message")," is the same as in the certificate."),(0,n.kt)("li",{parentName:"ol"},"The ",(0,n.kt)("strong",{parentName:"li"},"multi signature")," of the certificate is valid and computed with the certificate ",(0,n.kt)("strong",{parentName:"li"},"message"),"."),(0,n.kt)("li",{parentName:"ol"},"The stake distribution used to compute the multi signature is signed:",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"Into a multi signature of a previous certificate of the chain (if there is one available)."),(0,n.kt)("li",{parentName:"ul"},"Or by a valid ",(0,n.kt)("strong",{parentName:"li"},"Genesis Certificate")," (in case this is the first certificate of the chain).")))),(0,n.kt)("p",null,"The ",(0,n.kt)("strong",{parentName:"p"},"Mithril Aggregator")," is used as a provider for the ",(0,n.kt)("strong",{parentName:"p"},"Certificate Chain"),"."),(0,n.kt)("admonition",{type:"tip"},(0,n.kt)("p",{parentName:"admonition"},"For more information about the ",(0,n.kt)("strong",{parentName:"p"},"Mithril Certificate Chain"),", please refer to the ",(0,n.kt)("a",{parentName:"p",href:"/doc/mithril/mithril-protocol/certificates"},"Certificate Chain")," page.")),(0,n.kt)("h3",{id:"snapshot-artifacts-retrieval"},"Snapshot Artifacts Retrieval"),(0,n.kt)("p",null,"Once the certificate chain is verified, the ",(0,n.kt)("strong",{parentName:"p"},"Mithril Client")," will try to download a ",(0,n.kt)("strong",{parentName:"p"},"Full Cardano Node")," snapshot. The ",(0,n.kt)("strong",{parentName:"p"},"Mithril Aggregator")," is used as a provider for the ",(0,n.kt)("strong",{parentName:"p"},"Snapshots")," locations. The snapshots might be stored at several locations, the client will try the given locations until it founds one that responds OK. "),(0,n.kt)("p",null,"These artifacts are downloaded locally on a temporary directory and then uncompressed in the location given on the command line. The uncompressed files are used to compute the message that is then compared with the one that is signed by the ",(0,n.kt)("strong",{parentName:"p"},"Mithril Signers"),". If the verification fails, the uncompressed files are removed from the disk."),(0,n.kt)("h3",{id:"snapshot-restoration"},"Snapshot Restoration"),(0,n.kt)("p",null,"If the verification succeeds, the user can use these files to start a Cardano full node. At this point, the ",(0,n.kt)("strong",{parentName:"p"},"Cardano Node")," will take over and hopefully start adding new blocks to the ledger!"),(0,n.kt)("h2",{id:"mithril-stake-distribution"},"Mithril Stake Distribution"),(0,n.kt)("p",null,"The client can be also used to verify and download the ",(0,n.kt)("strong",{parentName:"p"},"Stake Distribution")," used for signatures at the upcoming Cardano's Epoch. As of Snapshots, the certificate chain is validated, then the signers ",(0,n.kt)("strong",{parentName:"p"},"Verification Keys")," are checked. If valid, a fingerprint of the stake distribution is computed and tested against the one used by the certificate. If it is different, the verification stops, otherwise, the JSON representation of the stake distribution is saved on the disk for further use."))}d.isMDXComponent=!0}}]);