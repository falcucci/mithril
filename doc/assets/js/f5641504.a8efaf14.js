"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[8665],{13691:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>d,frontMatter:()=>s,metadata:()=>o,toc:()=>h});var r=i(85893),n=i(3905);const s={sidebar_position:2,sidebar_label:"Mithril aggregator"},a="Mithril aggregator node",o={id:"mithril/mithril-network/aggregator",title:"Mithril aggregator node",description:"A Mithril aggregator is a trustless node responsible for coordinating the activities of Mithril signer nodes. It gathers the individual signatures from the signer nodes to generate Mithril multi-signatures along with their corresponding certificates. Additionally, the aggregator is in charge of creating and maintaining the archive for the ledger state snapshot.",source:"@site/versioned_docs/version-maintained/mithril/mithril-network/aggregator.md",sourceDirName:"mithril/mithril-network",slug:"/mithril/mithril-network/aggregator",permalink:"/doc/mithril/mithril-network/aggregator",draft:!1,unlisted:!1,editUrl:"https://github.com/input-output-hk/mithril/edit/main/docs/root/mithril/mithril-network/aggregator.md",tags:[],version:"maintained",sidebarPosition:2,frontMatter:{sidebar_position:2,sidebar_label:"Mithril aggregator"},sidebar:"mithrilSideBar",previous:{title:"Architecture",permalink:"/doc/mithril/mithril-network/architecture"},next:{title:"Mithril signer",permalink:"/doc/mithril/mithril-network/signer"}},l={},h=[{value:"Trustless orchestration",id:"trustless-orchestration",level:2},{value:"Multi-signature and certificate production",id:"multi-signature-and-certificate-production",level:2},{value:"Snapshot artifacts production",id:"snapshot-artifacts-production",level:2},{value:"Distribution of snapshot artifacts and certificates",id:"distribution-of-snapshot-artifacts-and-certificates",level:2},{value:"Under the hood",id:"under-the-hood",level:2}];function c(e){const t={a:"a",admonition:"admonition",em:"em",h1:"h1",h2:"h2",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,n.ah)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h1,{id:"mithril-aggregator-node",children:"Mithril aggregator node"}),"\n",(0,r.jsx)(t.admonition,{type:"info",children:(0,r.jsxs)(t.p,{children:["A ",(0,r.jsx)(t.strong,{children:"Mithril aggregator"})," is a trustless node responsible for coordinating the activities of ",(0,r.jsx)(t.strong,{children:"Mithril signer"})," nodes. It gathers the individual signatures from the signer nodes to generate Mithril multi-signatures along with their corresponding certificates. Additionally, the aggregator is in charge of creating and maintaining the archive for the ledger state snapshot."]})}),"\n",(0,r.jsx)(t.admonition,{type:"tip",children:(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:["For more information about the ",(0,r.jsx)(t.strong,{children:"Mithril protocol"}),", see the ",(0,r.jsx)(t.a,{href:"/doc/mithril/mithril-protocol/protocol",children:"protocol in depth"})," overview."]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:["For more information about the ",(0,r.jsx)(t.strong,{children:"Mithril aggregator"}),", see the ",(0,r.jsx)(t.a,{href:"/doc/manual/developer-docs/nodes/mithril-aggregator",children:"developer manual"}),"."]}),"\n"]}),"\n"]})}),"\n",(0,r.jsx)(t.h2,{id:"trustless-orchestration",children:"Trustless orchestration"}),"\n",(0,r.jsx)(t.p,{children:"The primary objective of the Mithril aggregator is to coordinate and synchronize the production of Mithril multi-signatures:"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:["When a new snapshot is ready to be produced (and certified), the Mithril aggregator generates and broadcasts a fresh ",(0,r.jsx)(t.strong,{children:"beacon"})," to inform Mithril signers of the specific time reference to employ in computing the message (or digest) for signing"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:["It is also responsible for advertising the ",(0,r.jsx)(t.strong,{children:"verification keys"})," (Mithril public keys) of all the registered Mithril signers"]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:["The beacon, the current protocol parameters, and the available verification keys are compiled and shared in a ",(0,r.jsx)(t.strong,{children:"pending certificate"})]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsx)(t.p,{children:"Mithril signers can register with it to participate in the signature process later on."}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(t.p,{children:"An important point to note is that the Mithril aggregator operates in a trustless manner:"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsx)(t.p,{children:"Anyone on the network can run an aggregator"}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:["The aggregator doesn't broadcast any ",(0,r.jsx)(t.em,{children:"sensitive"})," information, such as the ",(0,r.jsx)(t.em,{children:"message"})," requiring signing. The signer nodes handle the direct computation of this information from a ",(0,r.jsx)(t.strong,{children:"Cardano node"})," on which they operate."]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(t.p,{children:"Additionally, when it comes to aggregating individual signatures into Mithril multi-signatures, the aggregator doesn't need to represent a portion of the total stake within the Cardano network."}),"\n",(0,r.jsx)(t.h2,{id:"multi-signature-and-certificate-production",children:"Multi-signature and certificate production"}),"\n",(0,r.jsx)(t.p,{children:"The Mithril aggregator oversees the creation of Mithril multi-signatures along with their associated certificates for a part and/or the entirety of the ledger state (snapshots):"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsx)(t.p,{children:"Previously registered Mithril signers generate individual signatures. These signatures are then sent to the Mithril aggregator for validation and storage."}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:["Once the ",(0,r.jsx)(t.strong,{children:"quorum"})," of individual signatures has been reached, the Mithril aggregator can generate a multi-signature."]}),"\n"]}),"\n",(0,r.jsxs)(t.li,{children:["\n",(0,r.jsxs)(t.p,{children:["Subsequently, the Mithril aggregator combines the multi-signature with relevant metadata to create a ",(0,r.jsx)(t.strong,{children:"Mithril certificate"}),". This certificate will later be utilized by the ",(0,r.jsx)(t.strong,{children:"Mithril client"})," to authenticate a snapshot's legitimacy."]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(t.admonition,{type:"tip",children:(0,r.jsxs)(t.p,{children:["For more information about the ",(0,r.jsx)(t.strong,{children:"Mithril certificate chain"}),", see the ",(0,r.jsx)(t.a,{href:"/doc/mithril/mithril-protocol/certificates",children:"certificate chain"})," overview."]})}),"\n",(0,r.jsx)(t.h2,{id:"snapshot-artifacts-production",children:"Snapshot artifacts production"}),"\n",(0,r.jsx)(t.p,{children:"In its initial version, the Mithril aggregator also handles the production of artifacts associated with the snapshot (such as the snapshot archive, which will be used later by a Mithril client)."}),"\n",(0,r.jsx)(t.admonition,{type:"note",children:(0,r.jsxs)(t.p,{children:["It's important to note that this role is presently undertaken for the sake of convenience. However, it's planned that in the long run, the production of artifacts will be assigned to a distinct ",(0,r.jsx)(t.strong,{children:"Mithril snapshotter"})," node."]})}),"\n",(0,r.jsx)(t.p,{children:"Once the snapshot artifact is created, it can be synchronized on various locations:"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsx)(t.li,{children:"On the Mithril aggregator itself"}),"\n",(0,r.jsx)(t.li,{children:"On any cloud platform that offers a CDN"}),"\n",(0,r.jsxs)(t.li,{children:["On a distinct peer-to-peer network, such as ",(0,r.jsx)(t.strong,{children:"IPFS"})," or ",(0,r.jsx)(t.strong,{children:"BitTorrent"}),"."]}),"\n"]}),"\n",(0,r.jsx)(t.p,{children:"The Mithril certificate is part of a chain of certificates that are essential for snapshot authenticity verification and is stored in either of the following ways:"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsx)(t.li,{children:"On the Mithril aggregator itself"}),"\n",(0,r.jsx)(t.li,{children:"On any accessible storage, such as cloud storage, for instance."}),"\n"]}),"\n",(0,r.jsx)(t.h2,{id:"distribution-of-snapshot-artifacts-and-certificates",children:"Distribution of snapshot artifacts and certificates"}),"\n",(0,r.jsx)(t.p,{children:"If the Mithril aggregator stores the snapshot artifacts and/or the certificates, it can function as a distribution point for this data to remote clients. The clients can then use the artifacts as needed and verify their authenticity."}),"\n",(0,r.jsx)(t.h2,{id:"under-the-hood",children:"Under the hood"}),"\n",(0,r.jsx)(t.p,{children:"In its initial version, the Mithril aggregator comprises two main components:"}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["A REST API that allows Mithril signers to:","\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["Retrieve ",(0,r.jsx)(t.strong,{children:"verification keys"})," of other registered signers"]}),"\n",(0,r.jsx)(t.li,{children:"Register their own verification keys"}),"\n",(0,r.jsxs)(t.li,{children:["Register their ",(0,r.jsx)(t.strong,{children:"individual signatures"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(t.admonition,{type:"tip",children:(0,r.jsxs)(t.p,{children:["The Mithril aggregator's ",(0,r.jsx)(t.strong,{children:"REST API"})," documentation can be found ",(0,r.jsx)(t.a,{href:"/aggregator-api",children:"here"}),"."]})}),"\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsxs)(t.li,{children:["A runtime powered by a state machine:","\n",(0,r.jsxs)(t.ul,{children:["\n",(0,r.jsx)(t.li,{children:"The runtime operates synchronously and is scheduled to execute at regular intervals"}),"\n",(0,r.jsxs)(t.li,{children:["It encompasses three potential states: ",(0,r.jsx)(t.strong,{children:"IDLE"}),", ",(0,r.jsx)(t.strong,{children:"READY"}),", and ",(0,r.jsx)(t.strong,{children:"SIGNING"})]}),"\n",(0,r.jsx)(t.li,{children:"The runtime effectively manages state transitions"}),"\n",(0,r.jsx)(t.li,{children:"The runtime structure is illustrated in the diagram below:"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.img,{alt:"Aggregator Runtime",src:i(62404).Z+"",width:"627",height:"1593"})})]})}function d(e={}){const{wrapper:t}={...(0,n.ah)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(c,{...e})}):c(e)}},3905:(e,t,i)=>{i.d(t,{ah:()=>h});var r=i(67294);function n(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function s(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,r)}return i}function a(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?s(Object(i),!0).forEach((function(t){n(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):s(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function o(e,t){if(null==e)return{};var i,r,n=function(e,t){if(null==e)return{};var i,r,n={},s=Object.keys(e);for(r=0;r<s.length;r++)i=s[r],t.indexOf(i)>=0||(n[i]=e[i]);return n}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)i=s[r],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(n[i]=e[i])}return n}var l=r.createContext({}),h=function(e){var t=r.useContext(l),i=t;return e&&(i="function"==typeof e?e(t):a(a({},t),e)),i},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var i=e.components,n=e.mdxType,s=e.originalType,l=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),g=h(i),u=n,p=g["".concat(l,".").concat(u)]||g[u]||c[u]||s;return i?r.createElement(p,a(a({ref:t},d),{},{components:i})):r.createElement(p,a({ref:t},d))}));d.displayName="MDXCreateElement"},62404:(e,t,i)=>{i.d(t,{Z:()=>r});const r=i.p+"assets/images/aggregator-runtime-1dbf1f0259f9e9b6b42ef2cf4f3724d5.jpg"}}]);