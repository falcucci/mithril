"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[7755],{77423:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>a,contentTitle:()=>o,default:()=>h,frontMatter:()=>t,metadata:()=>l,toc:()=>c});var s=n(85893),i=n(3905);const t={title:"Mithril Release Process",authors:[{name:"Mithril Team"}],tags:["process"]},o=void 0,l={permalink:"/doc/dev-blog/2022/12/05/release-process",source:"@site/blog/2022-12-05-release-process/index.md",title:"Mithril Release Process",description:"Mithril follows a defined release process",date:"2022-12-05T00:00:00.000Z",formattedDate:"December 5, 2022",tags:[{label:"process",permalink:"/doc/dev-blog/tags/process"}],readingTime:3.54,hasTruncateMarker:!1,authors:[{name:"Mithril Team"}],frontMatter:{title:"Mithril Release Process",authors:[{name:"Mithril Team"}],tags:["process"]},unlisted:!1,prevItem:{title:"Mithril Era Switch",permalink:"/doc/dev-blog/2023/03/02/era-switch-feature"},nextItem:{title:"Mithril environments are updated",permalink:"/doc/dev-blog/2022/10/28/updated-environments"}},a={authorsImageUrls:[void 0]},c=[{value:"Mithril follows a defined release process",id:"mithril-follows-a-defined-release-process",level:3},{value:"Release Process",id:"release-process",level:3},{value:"Networks",id:"networks",level:3},{value:"Further Reading",id:"further-reading",level:3}];function d(e){const r={a:"a",code:"code",em:"em",h3:"h3",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,i.ah)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(r.h3,{id:"mithril-follows-a-defined-release-process",children:"Mithril follows a defined release process"}),"\n",(0,s.jsx)(r.p,{children:"As the Mithril project grew and more and more SPOs became involved in testing Mithril, it became obvious we need clearer identification of artifacts running on various parts of the network. Moreover, on our road towards mainnet availability we'll need to strengthen our testing process in order to validate Mithril network on more realistic environments."}),"\n",(0,s.jsx)(r.h3,{id:"release-process",children:"Release Process"}),"\n",(0,s.jsx)(r.p,{children:"We want our release process to follow some basic principles:"}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.em,{children:"Continuous Integration"}),": New code is integrated into the ",(0,s.jsx)(r.code,{children:"main"})," codeline frequently which triggers automated build and test process."]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.em,{children:"Continuous Deployment"}),": New artifacts produced by the build process are continuously deployed to a suitable ",(0,s.jsx)(r.em,{children:"environment"})," where it can be used and tested by an increasing number of parties."]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.em,{children:"Deployment Pipeline"}),": The deployment process is embodied in a ",(0,s.jsx)(r.em,{children:"pipeline"})," that describes and implements all the necessary steps to release a new version of Mithril."]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.em,{children:"Artifact Promotion"}),": An artifact is built ",(0,s.jsx)(r.em,{children:"once and only once"})," and is ",(0,s.jsx)(r.em,{children:"promoted"})," while travelling through the build pipeline."]}),"\n"]}),"\n",(0,s.jsx)(r.p,{children:"Here is a high-level picture of this process:"}),"\n",(0,s.jsx)(r.p,{children:(0,s.jsx)(r.a,{target:"_blank",href:n(99861).Z+"",children:(0,s.jsx)(r.img,{alt:"Release Process",src:n(40168).Z+"",width:"1220",height:"819"})})}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:["We will use a custom version based on ",(0,s.jsx)(r.a,{href:"https://semver.org",children:"SemVer"})," for all the crates, binaries and containers of the repository and for the GitHub release."]}),"\n",(0,s.jsxs)(r.li,{children:["We release a new distribution every 2 weeks (this duration is subject to changes as the project matures)","\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:["The released version is named after the year and its week number: ",(0,s.jsx)(r.strong,{children:"YYWW.patch"})," (e.g. ",(0,s.jsx)(r.code,{children:"2250.0"}),")."]}),"\n",(0,s.jsx)(r.li,{children:'In case of critical regressions happening in production, a patch version will be released in between "official" releases as a hotfix.'}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(r.li,{children:["A new version ",(0,s.jsx)(r.code,{children:"YYWW.0"})," will have the following life cycle:","\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:["A commit ",(0,s.jsx)(r.code,{children:"abc123"})," merged on ",(0,s.jsx)(r.code,{children:"main"})," branch is deployed on the network named ",(0,s.jsx)(r.code,{children:"testing-preview"}),"."]}),"\n",(0,s.jsxs)(r.li,{children:["A commit ",(0,s.jsx)(r.code,{children:"def456"})," tagged with ",(0,s.jsx)(r.code,{children:"YYWW.0-prerelease"})," is deployed on the network named ",(0,s.jsx)(r.code,{children:"pre-release-preview"}),"."]}),"\n",(0,s.jsxs)(r.li,{children:["A GitHub release ",(0,s.jsx)(r.code,{children:"YYWW.0-prerelease"})," is created and linked with the ",(0,s.jsx)(r.code,{children:"YYWW.0-prerelease"})," tag and marked as ",(0,s.jsx)(r.code,{children:"pre-release"}),"."]}),"\n",(0,s.jsxs)(r.li,{children:["A tag ",(0,s.jsx)(r.code,{children:"YYWW.0-prerelease"})," is qualified and selected for release or rejected (and replaced by a ",(0,s.jsx)(r.code,{children:"YYWW.1-prerelease"})," tag if necessary on a ",(0,s.jsx)(r.code,{children:"fed789"}),")."]}),"\n",(0,s.jsxs)(r.li,{children:["If the tag ",(0,s.jsx)(r.code,{children:"YYWW.0-prerelease"})," is selected, a new tag is created and name ",(0,s.jsx)(r.code,{children:"YYWW.0"})," on the same commit ",(0,s.jsx)(r.code,{children:"def456"}),"."]}),"\n",(0,s.jsxs)(r.li,{children:["A GitHub release ",(0,s.jsx)(r.code,{children:"YYWW.0"})," is created and linked to the ",(0,s.jsx)(r.code,{children:"YYWW.0"})," tag and marked as ",(0,s.jsx)(r.code,{children:"release"}),"."]}),"\n",(0,s.jsxs)(r.li,{children:["The commit ",(0,s.jsx)(r.code,{children:"def456"})," with tag ",(0,s.jsx)(r.code,{children:"YYWW.0"})," is deployed to the network named ",(0,s.jsx)(r.code,{children:"release-preprod"}),"."]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(r.li,{children:["The ",(0,s.jsx)(r.code,{children:"Cargo.toml"})," versions of the crates are updated (if required) just before creating the ",(0,s.jsx)(r.code,{children:"YYWW.0-prerelease"})," tag ."]}),"\n",(0,s.jsxs)(r.li,{children:["The documentation website is also updated at the same time where the ",(0,s.jsx)(r.code,{children:"next"})," version becomes the ",(0,s.jsx)(r.code,{children:"current"})," version, leaving future updates be appended to the ",(0,s.jsx)(r.code,{children:"next"})," version during the upcoming developments."]}),"\n",(0,s.jsxs)(r.li,{children:["In order to simplify the life of Mithril users, we have introduced a version of the ",(0,s.jsx)(r.code,{children:"Mithril API"})," used between client/signer and aggregators to check if the nodes are able to communicate together (following semver and considering the versions are compatible only if they share the same minor)."]}),"\n",(0,s.jsxs)(r.li,{children:["Our main distribution artefact is currently docker (OCI) images. We also provide more packages, eg. ",(0,s.jsx)(r.code,{children:".deb"})," packages or compiled binaries (some of them available on multiple platforms, e.g. Windows or macOS) to simplify users' life."]}),"\n",(0,s.jsxs)(r.li,{children:["We also publish some of our crates on the ",(0,s.jsx)(r.code,{children:"crates.io"})," registry whenever a new version is created (e.g. ",(0,s.jsx)(r.a,{href:"https://crates.io/crates/mithril-stm",children:(0,s.jsx)(r.code,{children:"mithril-stm"})}),")."]}),"\n"]}),"\n",(0,s.jsx)(r.h3,{id:"networks",children:"Networks"}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:["We maintain different Mithril networks (eg. servers, VMs, configurations...) to which artifacts are deployed at various stages of the process:","\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.code,{children:"testing-preview"}),": This is an internal environment based on the ",(0,s.jsx)(r.code,{children:"preview"})," cardano testnet where most of the automated tests happen. It is also used to test features as soon as they are merged on the ",(0,s.jsx)(r.code,{children:"main"})," branch."]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.code,{children:"pre-release-preview"}),": This is a persistent environment based on the ",(0,s.jsx)(r.code,{children:"preview"})," cardano testnet. SPOs which are active on preview are welcomed to take part in the Mithril signing process and to test new ",(0,s.jsx)(r.code,{children:"pre-release"})," distributions deployed there."]}),"\n",(0,s.jsxs)(r.li,{children:[(0,s.jsx)(r.code,{children:"release-preprod"}),": Another persistent environment, based on the ",(0,s.jsx)(r.code,{children:"preprod"})," cardano testnet, where more SPOs are expected to join and test, updated less frequently (on actual ",(0,s.jsx)(r.code,{children:"release"})," distributions)."]}),"\n",(0,s.jsxs)(r.li,{children:["(",(0,s.jsx)(r.em,{children:"LATER"}),") ",(0,s.jsx)(r.code,{children:"mainnet"}),": Production environment where new releases are deployed once qualifed on ",(0,s.jsx)(r.code,{children:"release-preprod"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(r.h3,{id:"further-reading",children:"Further Reading"}),"\n",(0,s.jsxs)(r.ul,{children:["\n",(0,s.jsxs)(r.li,{children:["The Mithril developers have redacted an ADR ",(0,s.jsx)(r.a,{href:"https://mithril.network/doc/adr/3/",children:"Release process and versioning"})," that also describes more technically this process."]}),"\n"]})]})}function h(e={}){const{wrapper:r}={...(0,i.ah)(),...e.components};return r?(0,s.jsx)(r,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},3905:(e,r,n)=>{n.d(r,{ah:()=>c});var s=n(67294);function i(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function t(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);r&&(s=s.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,s)}return n}function o(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?t(Object(n),!0).forEach((function(r){i(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):t(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,s,i=function(e,r){if(null==e)return{};var n,s,i={},t=Object.keys(e);for(s=0;s<t.length;s++)n=t[s],r.indexOf(n)>=0||(i[n]=e[n]);return i}(e,r);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);for(s=0;s<t.length;s++)n=t[s],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var a=s.createContext({}),c=function(e){var r=s.useContext(a),n=r;return e&&(n="function"==typeof e?e(r):o(o({},r),e)),n},d={inlineCode:"code",wrapper:function(e){var r=e.children;return s.createElement(s.Fragment,{},r)}},h=s.forwardRef((function(e,r){var n=e.components,i=e.mdxType,t=e.originalType,a=e.parentName,h=l(e,["components","mdxType","originalType","parentName"]),p=c(n),m=i,u=p["".concat(a,".").concat(m)]||p[m]||d[m]||t;return n?s.createElement(u,o(o({ref:r},h),{},{components:n})):s.createElement(u,o({ref:r},h))}));h.displayName="MDXCreateElement"},99861:(e,r,n)=>{n.d(r,{Z:()=>s});const s=n.p+"assets/files/release_process-a9ce55af510cd542b71e68a485251004.jpg"},40168:(e,r,n)=>{n.d(r,{Z:()=>s});const s=n.p+"assets/images/release_process-a9ce55af510cd542b71e68a485251004.jpg"}}]);