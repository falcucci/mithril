"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[6130],{3795:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>a,default:()=>d,frontMatter:()=>s,metadata:()=>o,toc:()=>c});var i=n(85893),r=n(3905);const s={slug:3,title:"3. Release process and versioning\n",authors:[{name:"Mithril Team"}],tags:["Draft"],date:new Date("2022-10-21T00:00:00.000Z")},a=void 0,o={permalink:"/doc/adr/3",source:"@site/adr/003-release/index.md",title:"3. Release process and versioning\n",description:"Status",date:"2022-10-21T00:00:00.000Z",formattedDate:"October 21, 2022",tags:[{label:"Draft",permalink:"/doc/adr/tags/draft"}],readingTime:2.995,hasTruncateMarker:!1,authors:[{name:"Mithril Team"}],frontMatter:{slug:"3",title:"3. Release process and versioning\n",authors:[{name:"Mithril Team"}],tags:["Draft"],date:"2022-10-21T00:00:00.000Z"},unlisted:!1,prevItem:{title:"4. Mithril Network Upgrade Strategy\n",permalink:"/doc/adr/4"},nextItem:{title:"2. Use simple structured logging\n",permalink:"/doc/adr/2"}},l={authorsImageUrls:[void 0]},c=[{value:"Status",id:"status",level:2},{value:"Context",id:"context",level:2},{value:"Versioning",id:"versioning",level:3},{value:"Release process",id:"release-process",level:3},{value:"Decision",id:"decision",level:2},{value:"Release Process",id:"release-process-1",level:3},{value:"Hotfix Release",id:"hotfix-release",level:3}];function h(e){const t={a:"a",code:"code",h2:"h2",h3:"h3",img:"img",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...(0,r.ah)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(t.h2,{id:"status",children:"Status"}),"\n",(0,i.jsx)(t.p,{children:(0,i.jsx)(t.strong,{children:"draft"})}),"\n",(0,i.jsx)(t.h2,{id:"context",children:"Context"}),"\n",(0,i.jsx)(t.p,{children:"In order to deliver regularly the software to our users, we should implement a release process based on a predictable versioning scheme."}),"\n",(0,i.jsx)(t.h3,{id:"versioning",children:"Versioning"}),"\n",(0,i.jsx)(t.p,{children:"A Release Version determines a distribution of determined node versions and underlying libraries."}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsx)(t.li,{children:"Our softwares must be able to interact seamlessly with other Mithril software."}),"\n",(0,i.jsx)(t.li,{children:"Our softwares must be able to be hosted on crates.io."}),"\n",(0,i.jsx)(t.li,{children:"Our softwares must clearly indicate compatibility with other Mithril components to end users."}),"\n"]}),"\n",(0,i.jsx)(t.h3,{id:"release-process",children:"Release process"}),"\n",(0,i.jsx)(t.p,{children:"A Release is a software package that is built once and then promoted from the testing environment to the production environment. It can be signed."}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsx)(t.li,{children:"Keep it simple."}),"\n",(0,i.jsx)(t.li,{children:"Automated as much as possible: all points not requiring human decision shall be automated."}),"\n",(0,i.jsx)(t.li,{children:"Minimize the mean time to release."}),"\n"]}),"\n",(0,i.jsx)(t.h2,{id:"decision",children:"Decision"}),"\n",(0,i.jsx)(t.p,{children:"There are 3 versioned layers in the Mithril stack:"}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsx)(t.li,{children:"HTTP API protocol to ensure compatibility in the communication between nodes (use Semver)."}),"\n",(0,i.jsx)(t.li,{children:"Crate version: each node & library has its own version (use Semver). The commit digest is automatically added to the version by the CI pipeline."}),"\n",(0,i.jsxs)(t.li,{children:["Release Version: the distribution version (use version scheme ",(0,i.jsx)(t.strong,{children:"YYWW.patch"})," | ",(0,i.jsx)(t.strong,{children:"YYWW.patch-name"}),"). The VERSION file is computed by the pipeline from the tag release."]}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:"The documentation is tied to a Release Version."}),"\n",(0,i.jsx)(t.h3,{id:"release-process-1",children:"Release Process"}),"\n",(0,i.jsx)(t.p,{children:"Starting just after a new release has been made:"}),"\n",(0,i.jsxs)(t.ol,{children:["\n",(0,i.jsx)(t.li,{children:"Develop on a dedicated development branch."}),"\n",(0,i.jsxs)(t.li,{children:["When merging PR on main: update the ",(0,i.jsx)(t.code,{children:"Cargo.toml"})," files with version of the updated nodes."]}),"\n",(0,i.jsxs)(t.li,{children:["Once merged, the CI creates an ",(0,i.jsx)(t.code,{children:"unstable"})," tag & release which is deployed on testing environment."]}),"\n",(0,i.jsxs)(t.li,{children:["Push a tag using the distribution version format on this commit with a ",(0,i.jsx)(t.code,{children:"-prerelease"})," suffix."]}),"\n",(0,i.jsxs)(t.li,{children:["The CI gets the built artifacts associated with this commit and generates a named pre-release which is deployed on ",(0,i.jsx)(t.code,{children:"pre-release"})," for testing."]}),"\n",(0,i.jsxs)(t.li,{children:["Push a tag using the distribution version format on this commit without the ",(0,i.jsx)(t.code,{children:"-prerelease"})," suffix."]}),"\n",(0,i.jsxs)(t.li,{children:["The CI gets the built artifacts associated with this commit and generates a named release which is deployed on ",(0,i.jsx)(t.code,{children:"pre-release"})," for testing."]}),"\n",(0,i.jsxs)(t.li,{children:["In the release GitHub interface, edit the newly generated release, uncheck the ",(0,i.jsx)(t.code,{children:"This is a pre-release"})," checkbox."]}),"\n",(0,i.jsxs)(t.li,{children:["The CI gets the built artifacts associated with this commit and generates a named release which is deployed on ",(0,i.jsx)(t.code,{children:"release"}),"."]}),"\n",(0,i.jsxs)(t.li,{children:["Create a commit:","\n",(0,i.jsxs)(t.ol,{children:["\n",(0,i.jsx)(t.li,{children:"to promote the documentation website from future to current."}),"\n",(0,i.jsx)(t.li,{children:"to update the SQL schema with alterations from the previous release."}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(t.p,{children:(0,i.jsx)(t.a,{target:"_blank",href:n(40902).Z+"",children:(0,i.jsx)(t.img,{alt:"Release Process",src:n(74187).Z+"",width:"1220",height:"819"})})}),"\n",(0,i.jsx)(t.h3,{id:"hotfix-release",children:"Hotfix Release"}),"\n",(0,i.jsx)(t.p,{children:"\u200b\nIn case of a blocking issue (following a distribution release) on the release environment that requires an immediate fix:\n\u200b"}),"\n",(0,i.jsxs)(t.ol,{children:["\n",(0,i.jsxs)(t.li,{children:["Create a branch on the last release tag with the following scheme: ",(0,i.jsx)(t.code,{children:"hotfix/{last_distribution-version}.{last_patch_number + 1}"}),"."]}),"\n",(0,i.jsx)(t.li,{children:"Development of the fix is done on this branch."}),"\n",(0,i.jsxs)(t.li,{children:["After each commit on this branch, the CI creates an ",(0,i.jsx)(t.code,{children:"unstable"})," tag & release which is not deployed on testing environment (testing must be done on an ad hoc environment manually created)."]}),"\n",(0,i.jsxs)(t.li,{children:["Push a tag on the branch last commit using the branch distribution version with a ",(0,i.jsx)(t.code,{children:"-hotfix"})," suffix."]}),"\n",(0,i.jsxs)(t.li,{children:["The CI gets the built artifacts associated with this commit and generates a named pre-release which is deployed on ",(0,i.jsx)(t.code,{children:"pre-release"})," for testing."]}),"\n",(0,i.jsxs)(t.li,{children:["In the release GitHub interface, edit the newly generated release, uncheck the ",(0,i.jsx)(t.code,{children:"This is a pre-release"})," checkbox."]}),"\n",(0,i.jsxs)(t.li,{children:["The CI gets the built artifacts associated with this commit and generates a named release which is deployed on ",(0,i.jsx)(t.code,{children:"release"}),"."]}),"\n",(0,i.jsx)(t.li,{children:"Merge the hotfix branch on main branch (and adapt the changes if they are not compatible with the current main branch)."}),"\n"]})]})}function d(e={}){const{wrapper:t}={...(0,r.ah)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},3905:(e,t,n)=>{n.d(t,{ah:()=>c});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},s=Object.keys(e);for(i=0;i<s.length;i++)n=s[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(i=0;i<s.length;i++)n=s[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=i.createContext({}),c=function(e){var t=i.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},h={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},d=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,s=e.originalType,l=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=c(n),m=r,p=u["".concat(l,".").concat(m)]||u[m]||h[m]||s;return n?i.createElement(p,a(a({ref:t},d),{},{components:n})):i.createElement(p,a({ref:t},d))}));d.displayName="MDXCreateElement"},40902:(e,t,n)=>{n.d(t,{Z:()=>i});const i=n.p+"assets/files/release_process-a9ce55af510cd542b71e68a485251004.jpg"},74187:(e,t,n)=>{n.d(t,{Z:()=>i});const i=n.p+"assets/images/release_process-a9ce55af510cd542b71e68a485251004.jpg"}}]);