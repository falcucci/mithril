"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[8159],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>s});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=a.createContext({}),p=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=p(e.components);return a.createElement(d.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,d=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),k=p(n),s=r,g=k["".concat(d,".").concat(s)]||k[s]||u[s]||l;return n?a.createElement(g,i(i({ref:t},m),{},{components:n})):a.createElement(g,i({ref:t},m))}));function s(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,i=new Array(l);i[0]=k;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o.mdxType="string"==typeof e?e:r,i[1]=o;for(var p=2;p<l;p++)i[p]=n[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"},6342:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>i,default:()=>u,frontMatter:()=>l,metadata:()=>o,toc:()=>p});var a=n(7462),r=(n(7294),n(3905));const l={sidebar_position:2},i="Mithril Signer Node",o={unversionedId:"manual/developer-docs/nodes/mithril-signer",id:"manual/developer-docs/nodes/mithril-signer",title:"Mithril Signer Node",description:"This is the node of the Mithril Network responsible for producing individual signatures that are collected and aggregated by the Mithril Aggregator.",source:"@site/root/manual/developer-docs/nodes/mithril-signer.md",sourceDirName:"manual/developer-docs/nodes",slug:"/manual/developer-docs/nodes/mithril-signer",permalink:"/doc/manual/developer-docs/nodes/mithril-signer",draft:!1,editUrl:"https://github.com/input-output-hk/mithril/edit/main/docs/root/manual/developer-docs/nodes/mithril-signer.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"docSideBar",previous:{title:"Mithril Aggregator Node",permalink:"/doc/manual/developer-docs/nodes/mithril-aggregator"},next:{title:"Mithril Client Node",permalink:"/doc/manual/developer-docs/nodes/mithril-client"}},d={},p=[{value:"Resources",id:"resources",level:2},{value:"Pre-requisites",id:"pre-requisites",level:2},{value:"Download source",id:"download-source",level:2},{value:"Development test and build",id:"development-test-and-build",level:2},{value:"Release build and run binary",id:"release-build-and-run-binary",level:2},{value:"Build and run Docker container",id:"build-and-run-docker-container",level:2},{value:"Configuration parameters",id:"configuration-parameters",level:2}],m={toc:p};function u(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"mithril-signer-node"},"Mithril Signer Node"),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"This is the node of the ",(0,r.kt)("strong",{parentName:"p"},"Mithril Network")," responsible for producing individual signatures that are collected and aggregated by the ",(0,r.kt)("strong",{parentName:"p"},"Mithril Aggregator"),".")),(0,r.kt)("admonition",{type:"tip"},(0,r.kt)("ul",{parentName:"admonition"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"For more information about the ",(0,r.kt)("strong",{parentName:"p"},"Mithril Network"),", please refer to the ",(0,r.kt)("a",{parentName:"p",href:"/doc/mithril/mithril-network/architecture"},"Architecture")," page.")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"For more information about the ",(0,r.kt)("strong",{parentName:"p"},"Mithril Signer"),", please refer to the ",(0,r.kt)("a",{parentName:"p",href:"/doc/mithril/mithril-network/signer"},"Signer Node")," page.")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},"Checkout the ",(0,r.kt)("a",{parentName:"p",href:"/doc/manual/getting-started/run-mithril-devnet"},(0,r.kt)("inlineCode",{parentName:"a"},"Run a Mithril Signer node (SPO)"))," guide.")))),(0,r.kt)("h2",{id:"resources"},"Resources"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"center"},"Node"),(0,r.kt)("th",{parentName:"tr",align:"center"},"Source Repository"),(0,r.kt)("th",{parentName:"tr",align:"center"},"Rust Documentation"),(0,r.kt)("th",{parentName:"tr",align:"center"},"Docker Packages"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("strong",{parentName:"td"},"Mithril Signer")),(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("a",{parentName:"td",href:"https://github.com/input-output-hk/mithril/tree/main/mithril-signer"},"\u2197\ufe0f")),(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("a",{parentName:"td",href:"https://mithril.network/mithril-signer/doc/mithril_signer/index.html"},"\u2197\ufe0f")),(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("a",{parentName:"td",href:"https://github.com/input-output-hk/mithril/pkgs/container/mithril-signer"},"\u2197\ufe0f"))))),(0,r.kt)("h2",{id:"pre-requisites"},"Pre-requisites"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Install a ",(0,r.kt)("a",{parentName:"li",href:"https://www.rust-lang.org/learn/get-started"},"correctly configured")," Rust toolchain (version 1.62.0+).")),(0,r.kt)("h2",{id:"download-source"},"Download source"),(0,r.kt)("p",null,"Download from Github (HTTPS)"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"git clone https://github.com/input-output-hk/mithril.git\n")),(0,r.kt)("p",null,"Or (SSH)"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"git clone git@github.com:input-output-hk/mithril.git\n")),(0,r.kt)("p",null,"Change directory"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"cd mithril/mithril-signer\n")),(0,r.kt)("h2",{id:"development-test-and-build"},"Development test and build"),(0,r.kt)("p",null,"Run tests"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"make test\n")),(0,r.kt)("p",null,"Create the help menu"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"make help\n")),(0,r.kt)("p",null,"Generate the Rust documentation"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"make doc\n")),(0,r.kt)("p",null,"Run in debug mode with default configuration"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"make debug\n")),(0,r.kt)("h2",{id:"release-build-and-run-binary"},"Release build and run binary"),(0,r.kt)("p",null,"Build and run in release with default configuration"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"make run\n")),(0,r.kt)("p",null,"Or, build only in release"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"make build\n")),(0,r.kt)("p",null,"Display the help menu"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"./mithril-signer --help\n")),(0,r.kt)("p",null,"You should see"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"mithril-signer \nAn implementation of a Mithril Signer\n\nUSAGE:\n    mithril-signer [OPTIONS]\n\nOPTIONS:\n    -h, --help                   Print help information\n    -r, --run-mode <RUN_MODE>    Run Mode [default: dev]\n    -v, --verbose                Verbosity level\n")),(0,r.kt)("p",null,"Run in release with default configuration"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"./mithril-signer\n")),(0,r.kt)("p",null,"Run in release with a specific mode"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"./mithril-signer -r testnet\n")),(0,r.kt)("p",null,"Run in release with a custom configuration via env vars"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"NETWORK=testnet AGGREGATOR_ENDPOINT=https://aggregator.api.mithril.network/aggregator ./mithril-signer\n")),(0,r.kt)("admonition",{type:"tip"},(0,r.kt)("p",{parentName:"admonition"},"If you want to dig deeper, you can get access to several level of logs from the Mithril Signer:"),(0,r.kt)("ul",{parentName:"admonition"},(0,r.kt)("li",{parentName:"ul"},"Add ",(0,r.kt)("inlineCode",{parentName:"li"},"-v")," for some logs (WARN)"),(0,r.kt)("li",{parentName:"ul"},"Add ",(0,r.kt)("inlineCode",{parentName:"li"},"-vv")," for more logs (INFO)"),(0,r.kt)("li",{parentName:"ul"},"Add ",(0,r.kt)("inlineCode",{parentName:"li"},"-vvv")," for even more logs (DEBUG)"),(0,r.kt)("li",{parentName:"ul"},"Add ",(0,r.kt)("inlineCode",{parentName:"li"},"-vvvv")," for all logs (TRACE)"))),(0,r.kt)("h2",{id:"build-and-run-docker-container"},"Build and run Docker container"),(0,r.kt)("p",null,"Build a local Docker image"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"make docker-build\n")),(0,r.kt)("p",null,"Run a local Docker container"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"make docker-run\n")),(0,r.kt)("h2",{id:"configuration-parameters"},"Configuration parameters"),(0,r.kt)("p",null,"The configuration parameters are set either:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"In a configuration file (depending on the ",(0,r.kt)("inlineCode",{parentName:"li"},"--run-mode")," parameter). If runtime mode is ",(0,r.kt)("inlineCode",{parentName:"li"},"testnet")," the file is located in ",(0,r.kt)("inlineCode",{parentName:"li"},"./conf/testnet.json"),"."),(0,r.kt)("li",{parentName:"ul"},"The value can be overriden by an environment variable whose name is the parameter name uppercased.")),(0,r.kt)("p",null,"Here is a list of the available parameters:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Parameter"),(0,r.kt)("th",{parentName:"tr",align:null},"Command Line (long)"),(0,r.kt)("th",{parentName:"tr",align:"center"},"Command Line (short)"),(0,r.kt)("th",{parentName:"tr",align:null},"Environment Variable"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"),(0,r.kt)("th",{parentName:"tr",align:null},"Default Value"),(0,r.kt)("th",{parentName:"tr",align:null},"Example"),(0,r.kt)("th",{parentName:"tr",align:"center"},"Mandatory"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"verbose")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"--verbose")),(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("inlineCode",{parentName:"td"},"-v")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"VERBOSE")),(0,r.kt)("td",{parentName:"tr",align:null},"Verbosity level"),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:null},"Parsed from number of occurences: ",(0,r.kt)("inlineCode",{parentName:"td"},"-v")," for ",(0,r.kt)("inlineCode",{parentName:"td"},"Warning"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"-vv")," for ",(0,r.kt)("inlineCode",{parentName:"td"},"Info"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"-vvv")," for ",(0,r.kt)("inlineCode",{parentName:"td"},"Debug")," and ",(0,r.kt)("inlineCode",{parentName:"td"},"-vvvv")," for ",(0,r.kt)("inlineCode",{parentName:"td"},"Trace")),(0,r.kt)("td",{parentName:"tr",align:"center"},"\u2714\ufe0f")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"run_mode")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"--run-mode")),(0,r.kt)("td",{parentName:"tr",align:"center"},(0,r.kt)("inlineCode",{parentName:"td"},"-r")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"RUN_MODE")),(0,r.kt)("td",{parentName:"tr",align:null},"Runtime mode"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"dev")),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:"center"},"\u2714\ufe0f")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"db_directory")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"--db-directory")),(0,r.kt)("td",{parentName:"tr",align:"center"},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"DB_DIRECTORY")),(0,r.kt)("td",{parentName:"tr",align:null},"Directory to snapshot from the ",(0,r.kt)("strong",{parentName:"td"},"Cardano Node")),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"/db")),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:"center"},"\u2714\ufe0f")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"network")),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:"center"},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"NETWORK")),(0,r.kt)("td",{parentName:"tr",align:null},"Cardano network"),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"testnet")," or ",(0,r.kt)("inlineCode",{parentName:"td"},"mainnet")," or ",(0,r.kt)("inlineCode",{parentName:"td"},"devnet")),(0,r.kt)("td",{parentName:"tr",align:"center"},"\u2714\ufe0f")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"network_magic")),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:"center"},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"NETWORK_MAGIC")),(0,r.kt)("td",{parentName:"tr",align:null},"Cardano Network Magic number (for ",(0,r.kt)("inlineCode",{parentName:"td"},"testnet")," and ",(0,r.kt)("inlineCode",{parentName:"td"},"devnet"),")"),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"1097911063")," or ",(0,r.kt)("inlineCode",{parentName:"td"},"42")),(0,r.kt)("td",{parentName:"tr",align:"center"},"-")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"party_id")),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:"center"},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"PARTY_ID")),(0,r.kt)("td",{parentName:"tr",align:null},"Party Id of the signer, usually the ",(0,r.kt)("inlineCode",{parentName:"td"},"PoolId")," of the SPO"),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"pool1pxaqe80sqpde7902er5kf6v0c7y0sv6d5g676766v2h829fvs3x")),(0,r.kt)("td",{parentName:"tr",align:"center"},"\u2714\ufe0f")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"run_interval")),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:"center"},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"RUN_INTERVAL")),(0,r.kt)("td",{parentName:"tr",align:null},"Interval between two runtime cycles in ms"),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"60000")),(0,r.kt)("td",{parentName:"tr",align:"center"},"\u2714\ufe0f")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"aggregator_endpoint")),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:"center"},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"AGGREGATOR_ENDPOINT")),(0,r.kt)("td",{parentName:"tr",align:null},"Aggregator node endpoint"),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"https://aggregator.api.mithril.network/aggregator")),(0,r.kt)("td",{parentName:"tr",align:"center"},"\u2714\ufe0f")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"data_stores_directory")),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:"center"},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"DATA_STORES_DIRECTORY")),(0,r.kt)("td",{parentName:"tr",align:null},"Directory to store signer data (Stakes, Protocol initializers, ...)"),(0,r.kt)("td",{parentName:"tr",align:null},"-"),(0,r.kt)("td",{parentName:"tr",align:null},(0,r.kt)("inlineCode",{parentName:"td"},"./mithril-signer/stores")),(0,r.kt)("td",{parentName:"tr",align:"center"},"\u2714\ufe0f")))))}u.isMDXComponent=!0}}]);