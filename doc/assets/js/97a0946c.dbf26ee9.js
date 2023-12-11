"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[7327],{2065:(e,i,r)=>{r.r(i),r.d(i,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>a,metadata:()=>s,toc:()=>h});var t=r(85893),n=r(3905);const a={sidebar_position:1},o="Glossary",s={id:"glossary",title:"Glossary",description:"Below is a comprehensive list of definitions for some common terms used in the Mithril guide.",source:"@site/versioned_docs/version-maintained/glossary.md",sourceDirName:".",slug:"/glossary",permalink:"/doc/glossary",draft:!1,unlisted:!1,editUrl:"https://github.com/input-output-hk/mithril/edit/main/docs/root/glossary.md",tags:[],version:"maintained",sidebarPosition:1,frontMatter:{sidebar_position:1}},l={},h=[{value:"Beacon",id:"beacon",level:2},{value:"Cardano network",id:"cardano-network",level:2},{value:"Cardano node",id:"cardano-node",level:2},{value:"Cardano key pair",id:"cardano-key-pair",level:2},{value:"Certificate",id:"certificate",level:2},{value:"Epoch",id:"epoch",level:2},{value:"Immutable file number",id:"immutable-file-number",level:2},{value:"Individual signature",id:"individual-signature",level:2},{value:"Mithril aggregator",id:"mithril-aggregator",level:2},{value:"Mithril client",id:"mithril-client",level:2},{value:"Mithril network",id:"mithril-network",level:2},{value:"Mithril protocol",id:"mithril-protocol",level:2},{value:"Mithril signer",id:"mithril-signer",level:2},{value:"Multi-signature",id:"multi-signature",level:2},{value:"Snapshot",id:"snapshot",level:2},{value:"Stake distribution",id:"stake-distribution",level:2},{value:"Stake pool operator (SPO)",id:"stake-pool-operator-spo",level:2},{value:"Verification key",id:"verification-key",level:2}];function c(e){const i={a:"a",blockquote:"blockquote",em:"em",h1:"h1",h2:"h2",p:"p",...(0,n.ah)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(i.h1,{id:"glossary",children:"Glossary"}),"\n",(0,t.jsx)(i.p,{children:"Below is a comprehensive list of definitions for some common terms used in the Mithril guide."}),"\n",(0,t.jsx)(i.h2,{id:"beacon",children:"Beacon"}),"\n",(0,t.jsxs)(i.p,{children:["A beacon represents a point of the blockchain for which a ",(0,t.jsx)(i.a,{href:"#certificate",children:"Mithril certificate"})," is created. It embeds at least the version of the ",(0,t.jsx)(i.a,{href:"#cardano-network",children:"Cardano network"})," that is targeted, the associated ",(0,t.jsx)(i.a,{href:"#epoch",children:"epoch"}),", and the ",(0,t.jsx)(i.a,{href:"#immutable-file-number",children:"immutable file number"}),"."]}),"\n",(0,t.jsx)(i.h2,{id:"cardano-network",children:"Cardano network"}),"\n",(0,t.jsx)(i.p,{children:"The Cardano network is a proof-of-stake blockchain platform that supports the ada cryptocurrency."}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"https://docs.cardano.org/introduction",children:"introduction page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"cardano-node",children:"Cardano node"}),"\n",(0,t.jsxs)(i.p,{children:["A Cardano node is a node that runs in a ",(0,t.jsx)(i.a,{href:"#cardano-network",children:"Cardano network"}),". There are several types of nodes, among them Cardano full nodes that hold a copy of the whole blockchain. They can be used by wallets, ",(0,t.jsx)(i.a,{href:"#stake-pool-operator-spo",children:"stake pool operators"}),", exchanges or DApps. One of the uses of the ",(0,t.jsx)(i.a,{href:"#mithril-network",children:"Mithril network"})," is to rapidly bootstrap a Cardano full node."]}),"\n",(0,t.jsx)(i.h2,{id:"cardano-key-pair",children:"Cardano key pair"}),"\n",(0,t.jsxs)(i.p,{children:["A Cardano key pair is an asymmetric key pair used to identify a ",(0,t.jsx)(i.a,{href:"#stake-pool-operator-spo",children:"stake pool operator"})," on the ",(0,t.jsx)(i.a,{href:"#cardano-network",children:"Cardano network"}),"."]}),"\n",(0,t.jsx)(i.h2,{id:"certificate",children:"Certificate"}),"\n",(0,t.jsxs)(i.p,{children:["The Mithril aggregator combines the produced ",(0,t.jsx)(i.a,{href:"#multi-signature",children:"multi-signature"})," and some metadata into a Mithril certificate that will be later used by the ",(0,t.jsx)(i.a,{href:"#mithril-client",children:"Mithril client"})," to verify the authenticity of a ",(0,t.jsx)(i.a,{href:"#snapshot",children:"snapshot"}),". The certificates are chained so that the ",(0,t.jsx)(i.a,{href:"#stake-distribution",children:"stake distribution"})," used to create the signatures is verifiably genuine."]}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-protocol/certificates",children:"certificates page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"epoch",children:"Epoch"}),"\n",(0,t.jsxs)(i.p,{children:["The ",(0,t.jsx)(i.a,{href:"#cardano-network",children:"Cardano network"})," uses epochs to group blocks computed in a certain amount of time (approximately five days). It is part of the design of its proof-of-stake consensus Ouroboros. At the end of each epoch, the ",(0,t.jsx)(i.a,{href:"#stake-distribution",children:"stake distribution"})," of the ending epoch is computed."]}),"\n",(0,t.jsx)(i.h2,{id:"immutable-file-number",children:"Immutable file number"}),"\n",(0,t.jsxs)(i.p,{children:["Inside the database of a ",(0,t.jsx)(i.a,{href:"#cardano-node",children:"Cardano node"}),", the blockchain state is stored in immutable files which never change once committed. These immutable files are designed so that they are deterministically produced and thus are the same on any Cardano node. These files are created by following an incremental number, the immutable file number, and there are three different immutable files for each number (ie, ",(0,t.jsx)(i.em,{children:"chunk"}),", ",(0,t.jsx)(i.em,{children:"primary"}),", and ",(0,t.jsx)(i.em,{children:"secondary"}),"). Only the files up to the penultimate immutable file number are considered as committed and final, the last immutable file number files are constantly evolving. The ",(0,t.jsx)(i.a,{href:"#snapshot",children:"snapshots"})," produced by the ",(0,t.jsx)(i.a,{href:"#mithril-network",children:"Mithril network"})," rely on these immutable files."]}),"\n",(0,t.jsx)(i.h2,{id:"individual-signature",children:"Individual signature"}),"\n",(0,t.jsxs)(i.p,{children:["For each ",(0,t.jsx)(i.a,{href:"#beacon",children:"beacon"}),", the ",(0,t.jsx)(i.a,{href:"#mithril-signer",children:"Mithril signers"})," will compute on their end a message representing the blockchain state, and sign it with their verification keys to create an ",(0,t.jsx)(i.a,{href:"#individual-signature",children:"individual signature"}),". Upon winning one or more lotteries, the Mithril signer will be able to use this individual signature to participate in the creation of a ",(0,t.jsx)(i.a,{href:"#multi-signature",children:"multi-signature"}),"."]}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-protocol/protocol",children:"protocol page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"mithril-aggregator",children:"Mithril aggregator"}),"\n",(0,t.jsxs)(i.p,{children:["The Mithril aggregator is a trustless node of the ",(0,t.jsx)(i.a,{href:"#mithril-network",children:"Mithril network"})," that orchestrates the work of the ",(0,t.jsx)(i.a,{href:"#mithril-signer",children:"Mithril signer"})," nodes and gathers their ",(0,t.jsx)(i.a,{href:"#individual-signature",children:"individual signatures"})," to produce ",(0,t.jsx)(i.a,{href:"#multi-signature",children:"Mithril multi-signatures"})," and their associated ",(0,t.jsx)(i.a,{href:"#certificate",children:"certificates"}),"."]}),"\n",(0,t.jsxs)(i.p,{children:["It is also in charge of creating and storing the ",(0,t.jsx)(i.a,{href:"#snapshot",children:"snapshot"})," archive."]}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-network/aggregator",children:"aggregator page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"mithril-client",children:"Mithril client"}),"\n",(0,t.jsxs)(i.p,{children:["The Mithril client node within the ",(0,t.jsx)(i.a,{href:"#mithril-network",children:"Mithril network"})," is used to restore a ",(0,t.jsx)(i.a,{href:"#cardano-node",children:"Cardano full node"})," by retrieving, from a ",(0,t.jsx)(i.a,{href:"#mithril-aggregator",children:"Mithril aggregator"}),", a remote ",(0,t.jsx)(i.a,{href:"#snapshot",children:"snapshot"})," and its ",(0,t.jsx)(i.a,{href:"#certificate",children:"certificate"})," chain. Finally, it is used to verify snapshot and certificate validity using the Mithril cryptographic primitives."]}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-network/client",children:"client page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"mithril-network",children:"Mithril network"}),"\n",(0,t.jsxs)(i.p,{children:["In its current version, the Mithril network is a network of nodes responsible for creating ",(0,t.jsx)(i.a,{href:"#snapshot",children:"snapshots"})," and ",(0,t.jsx)(i.a,{href:"#certificate",children:"certificates"})," that enable fast bootstrap of a ",(0,t.jsx)(i.a,{href:"#cardano-node",children:"Cardano node"}),". It runs on top of the ",(0,t.jsx)(i.a,{href:"#cardano-network",children:"Cardano network"}),"."]}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-network/architecture",children:"architecture page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"mithril-protocol",children:"Mithril protocol"}),"\n",(0,t.jsx)(i.p,{children:"The Mithril protocol allows stakeholders in a proof-of-stake blockchain network to individually sign messages that are aggregated into a multi-signature which guarantees that they represent a minimum share of the total stake."}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-protocol/protocol",children:"protocol page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"mithril-signer",children:"Mithril signer"}),"\n",(0,t.jsxs)(i.p,{children:["The Mithril signer is a node of the ",(0,t.jsx)(i.a,{href:"#mithril-network",children:"Mithril network"})," that works transparently on top of the ",(0,t.jsx)(i.a,{href:"#stake-pool-operator-spo",children:"stake pool operator"})," Cardano nodes and which individually signs the ledger state."]}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-network/signer",children:"signer page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"multi-signature",children:"Multi-signature"}),"\n",(0,t.jsxs)(i.p,{children:["The Mithril multi-signature is an aggregate of ",(0,t.jsx)(i.a,{href:"#individual-signature",children:"individual signatures"}),", which guarantees that a minimum share of the total stake has participated in its creation."]}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-protocol/protocol",children:"protocol page"}),"."]}),"\n"]}),"\n",(0,t.jsx)(i.h2,{id:"snapshot",children:"Snapshot"}),"\n",(0,t.jsxs)(i.p,{children:["A Mithril snapshot is a signed archive of the blockchain state that can be used by ",(0,t.jsx)(i.a,{href:"#mithril-client",children:"Mithril clients"})," to restore a ",(0,t.jsx)(i.a,{href:"#cardano-node",children:"Cardano full node"}),". It is uniquely identified by its fingerprint or digest which is part of the message signed by the ",(0,t.jsx)(i.a,{href:"#mithril-network",children:"Mithril network"}),"."]}),"\n",(0,t.jsx)(i.h2,{id:"stake-distribution",children:"Stake distribution"}),"\n",(0,t.jsxs)(i.p,{children:["The Cardano stake distribution is the list of all the ",(0,t.jsx)(i.a,{href:"#stake-pool-operator-spo",children:"stake pool operators'"})," pool Id addresses and their associated share of the total stake of the ",(0,t.jsx)(i.a,{href:"#cardano-network",children:"Cardano network"}),"."]}),"\n",(0,t.jsxs)(i.p,{children:["The Mithril stake distribution is the list of all the ",(0,t.jsx)(i.a,{href:"#stake-pool-operator-spo",children:"stake pool operators'"})," (that are running a ",(0,t.jsx)(i.a,{href:"#mithril-signer",children:"Mithril signer"}),") pool Id addresses, their associated share of the total stake of the ",(0,t.jsx)(i.a,{href:"#cardano-network",children:"Cardano network"}),", and their signing ",(0,t.jsx)(i.a,{href:"#verification-key",children:"verification key"}),"."]}),"\n",(0,t.jsx)(i.h2,{id:"stake-pool-operator-spo",children:"Stake pool operator (SPO)"}),"\n",(0,t.jsxs)(i.p,{children:["A stake pool operator, also known as an SPO, represents a party that holds (via delegation) stake in the ",(0,t.jsx)(i.a,{href:"#cardano-network",children:"Cardano network"}),". The stake entitles it to participate in block production thanks to the Cardano consensus mechanism."]}),"\n",(0,t.jsx)(i.h2,{id:"verification-key",children:"Verification key"}),"\n",(0,t.jsxs)(i.p,{children:["To create ",(0,t.jsx)(i.a,{href:"#individual-signature",children:"individual signatures"}),", ",(0,t.jsx)(i.a,{href:"#mithril-signer",children:"Mithril signers"})," must register their signing public key: the verification key. To guarantee their genuineness, they are signed by the associated ",(0,t.jsx)(i.a,{href:"#cardano-key-pair",children:"Cardano key pair"}),". It is worth mentioning that a ",(0,t.jsx)(i.a,{href:"#mithril-signer",children:"Mithril signer"})," must be aware of the verification keys of all the other Mithril signers to produce valid individual signatures."]}),"\n",(0,t.jsxs)(i.blockquote,{children:["\n",(0,t.jsxs)(i.p,{children:["More information is available on the ",(0,t.jsx)(i.a,{href:"/doc/mithril/mithril-protocol/protocol",children:"protocol page"}),"."]}),"\n"]})]})}function d(e={}){const{wrapper:i}={...(0,n.ah)(),...e.components};return i?(0,t.jsx)(i,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},3905:(e,i,r)=>{r.d(i,{ah:()=>h});var t=r(67294);function n(e,i,r){return i in e?Object.defineProperty(e,i,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[i]=r,e}function a(e,i){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);i&&(t=t.filter((function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable}))),r.push.apply(r,t)}return r}function o(e){for(var i=1;i<arguments.length;i++){var r=null!=arguments[i]?arguments[i]:{};i%2?a(Object(r),!0).forEach((function(i){n(e,i,r[i])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(i){Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(r,i))}))}return e}function s(e,i){if(null==e)return{};var r,t,n=function(e,i){if(null==e)return{};var r,t,n={},a=Object.keys(e);for(t=0;t<a.length;t++)r=a[t],i.indexOf(r)>=0||(n[r]=e[r]);return n}(e,i);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)r=a[t],i.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var l=t.createContext({}),h=function(e){var i=t.useContext(l),r=i;return e&&(r="function"==typeof e?e(i):o(o({},i),e)),r},c={inlineCode:"code",wrapper:function(e){var i=e.children;return t.createElement(t.Fragment,{},i)}},d=t.forwardRef((function(e,i){var r=e.components,n=e.mdxType,a=e.originalType,l=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),p=h(r),u=n,f=p["".concat(l,".").concat(u)]||p[u]||c[u]||a;return r?t.createElement(f,o(o({ref:i},d),{},{components:r})):t.createElement(f,o({ref:i},d))}));d.displayName="MDXCreateElement"}}]);