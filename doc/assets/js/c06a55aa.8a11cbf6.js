"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[4322],{79076:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>c,frontMatter:()=>o,metadata:()=>s,toc:()=>h});var r=i(85893),n=i(3905);const o={title:"Mithril internal stores switch to SQLite.",authors:[{name:"Mithril Team"}],tags:["store","sqlite","breaking-change"]},a=void 0,s={permalink:"/doc/dev-blog/2022/09/14/sqlite-stores",source:"@site/blog/2022-09-14-sqlite-stores.md",title:"Mithril internal stores switch to SQLite.",description:"What is that?",date:"2022-09-14T00:00:00.000Z",formattedDate:"September 14, 2022",tags:[{label:"store",permalink:"/doc/dev-blog/tags/store"},{label:"sqlite",permalink:"/doc/dev-blog/tags/sqlite"},{label:"breaking-change",permalink:"/doc/dev-blog/tags/breaking-change"}],readingTime:3.005,hasTruncateMarker:!1,authors:[{name:"Mithril Team"}],frontMatter:{title:"Mithril internal stores switch to SQLite.",authors:[{name:"Mithril Team"}],tags:["store","sqlite","breaking-change"]},unlisted:!1,prevItem:{title:"Mithril Keys Certification",permalink:"/doc/dev-blog/2022/10/11/keys-certification-badge"},nextItem:{title:"Stake Distribution retrieval fixed",permalink:"/doc/dev-blog/2022/09/13/stake-distribution-retrieval"}},l={authorsImageUrls:[void 0]},h=[{value:"What is that?",id:"what-is-that",level:2},{value:"How to migrate data from old storage system to SQLite stores?",id:"how-to-migrate-data-from-old-storage-system-to-sqlite-stores",level:2},{value:"Downloading",id:"downloading",level:3},{value:"Compiling",id:"compiling",level:3},{value:"Running the migration",id:"running-the-migration",level:3},{value:"Manual migration process",id:"manual-migration-process",level:3}];function d(e){const t={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",...(0,n.ah)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h2,{id:"what-is-that",children:"What is that?"}),"\n",(0,r.jsx)(t.p,{children:"Since almost the beginning of the Mithril project, the software used to rely on a store mechanism to save its different states allowing Signers and Aggregators to resume on correct state when switched on and off. This internal store mechanism used to be a bunch of JSON files saved in a given directory. Even though this does the job it still presents flaws: data are hard to query when debugging especially when crossing data (which signers have participated in this multi-signature?). Also, data are stored in different places which can be a problem when moving these files from one place to another. We also had to imagine what would be a migration scenario in case of a structure change. Switching to a file based SQL database solves these issues."}),"\n",(0,r.jsx)(t.p,{children:"The new release now uses SQLite stores in place of JSON file storage. This means that to continue running a Signer or an Aggregator node it is necessary to migrate from the old storage system to SQLite. This release comes with a tool to perform the migration which should be as straightforward as launching a command line (read below). The migration tool will be available only for a limited time in order to make Mithril beta testers able to migrate their existing data."}),"\n",(0,r.jsx)(t.h2,{id:"how-to-migrate-data-from-old-storage-system-to-sqlite-stores",children:"How to migrate data from old storage system to SQLite stores?"}),"\n",(0,r.jsx)(t.p,{children:"There are 2 ways of getting the new version and the associated migration tool. Either downloading binaries from GitHub or compiling them yourself."}),"\n",(0,r.jsx)(t.h3,{id:"downloading",children:"Downloading"}),"\n",(0,r.jsxs)(t.p,{children:["Download the new ",(0,r.jsx)(t.code,{children:"mithril-signer"})," and ",(0,r.jsx)(t.code,{children:"mithril-signer-migrate"})," files from the ",(0,r.jsx)(t.a,{href:"https://github.com/input-output-hk/mithril/releases/tag/unstable",children:"nightly builds page"}),". Make them executable:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"$> chmod +x mithril-signer*\n$> ls -1F mithril-signer*\nmithril-signer*\nmithril-signer-migrate*\n"})}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.em,{children:"note"}),": the suffix ",(0,r.jsx)(t.code,{children:"*"})," appended to the the entries output above indicates the file is executable. If it is not present, ensure the ",(0,r.jsx)(t.code,{children:"chmod"})," command does not produce any error."]}),"\n",(0,r.jsx)(t.h3,{id:"compiling",children:"Compiling"}),"\n",(0,r.jsxs)(t.p,{children:["If you used to compile your node as stated in the ",(0,r.jsx)(t.a,{href:"https://mithril.network/doc/manual/getting-started/run-signer-node",children:"guide"}),", you have to compile the migration tool as well:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"$> cd mithril-signer\n$> cargo build --all-targets --release\n  Compiling mithril-signer v0.1.0 (/home/somebody/shared/mithril/mithril-signer)\n    Finished release [optimized] target(s) in 4.56s\n$> ls -1F ../target/release/mithril-signer*\n../target/release/mithril-signer*\n../target/release/mithril-signer.d\n../target/release/mithril-signer-migrate*\n../target/release/mithril-signer-migrate.d\n"})}),"\n",(0,r.jsx)(t.h3,{id:"running-the-migration",children:"Running the migration"}),"\n",(0,r.jsxs)(t.p,{children:["The first step is to stop the running Mithril node if any. The ",(0,r.jsx)(t.code,{children:"mithril-signer-migrate"})," executable can perform the migration automatically once you know where your actual JSON files are located. Have a look in your configuration file (default ",(0,r.jsx)(t.code,{children:"/opt/mithril/mithril-signer.env"}),"), check the value associated with the ",(0,r.jsx)(t.code,{children:"DATA_STORES_DIRECTORY"})," key (default to ",(0,r.jsx)(t.code,{children:"/opt/mithril/stores"}),") and copy the path indicated here. Copy this path after the ",(0,r.jsx)(t.code,{children:"--db-dir"})," option on the following command line:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"$> ./mithril-signer-migrate automatic --db-dir /paste/the/data/stores/directory/here\nMithril Aggregator JSON \u2192 SQLite migration tool.\nMigrating protocol_initializer_store data\u2026\nOK \u2713\nMigrating stake_store data\u2026\nOK \u2713\n"})}),"\n",(0,r.jsxs)(t.p,{children:["At the end of this command, a file ",(0,r.jsx)(t.code,{children:"signer.sqlite3"})," (or ",(0,r.jsx)(t.code,{children:"aggregator.sqlite3"})," if you run an Aggregator) should be present in the specified base directory."]}),"\n",(0,r.jsx)(t.p,{children:"That should be enough, launch your upgraded mithril node."}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"Note:"})," The migration executable does not remove the old JSON files from the disk."]}),"\n",(0,r.jsx)(t.h3,{id:"manual-migration-process",children:"Manual migration process"}),"\n",(0,r.jsxs)(t.p,{children:["The executable also provides a ",(0,r.jsx)(t.code,{children:"manual"})," switch for migrating Mithril JSON store directories placed in custom directories. This is mainly intended for developers who work on tweaked environments. Each internal store has its own data structure. In order to correctly migrate and process data, the type of the store has to be given on the command line."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"$> ./mithril-signer-migrate manual --help\n"})}),"\n",(0,r.jsx)(t.p,{children:"The command above should give you all informations needed to run a custom store migration."}),"\n",(0,r.jsxs)(t.p,{children:["Feel free to reach out to us on the ",(0,r.jsx)(t.a,{href:"https://discord.gg/5kaErDKDRq",children:"Discord channel"})," for questions and/or help."]})]})}function c(e={}){const{wrapper:t}={...(0,n.ah)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},3905:(e,t,i)=>{i.d(t,{ah:()=>h});var r=i(67294);function n(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function o(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,r)}return i}function a(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?o(Object(i),!0).forEach((function(t){n(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):o(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function s(e,t){if(null==e)return{};var i,r,n=function(e,t){if(null==e)return{};var i,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)i=o[r],t.indexOf(i)>=0||(n[i]=e[i]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)i=o[r],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(n[i]=e[i])}return n}var l=r.createContext({}),h=function(e){var t=r.useContext(l),i=t;return e&&(i="function"==typeof e?e(t):a(a({},t),e)),i},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var i=e.components,n=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),g=h(i),m=n,u=g["".concat(l,".").concat(m)]||g[m]||d[m]||o;return i?r.createElement(u,a(a({ref:t},c),{},{components:i})):r.createElement(u,a({ref:t},c))}));c.displayName="MDXCreateElement"}}]);