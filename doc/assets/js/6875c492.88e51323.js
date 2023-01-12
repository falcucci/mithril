"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[8610],{9058:(e,t,a)=>{a.d(t,{Z:()=>P});var l=a(7294),n=a(6010),r=a(782),s=a(7524),o=a(9960),i=a(5999);const m="sidebar_re4s",c="sidebarItemTitle_pO2u",u="sidebarItemList_Yudw",g="sidebarItem__DBe",d="sidebarItemLink_mo7H",p="sidebarItemLinkActive_I1ZP";function E(e){let{sidebar:t}=e;return l.createElement("aside",{className:"col col--3"},l.createElement("nav",{className:(0,n.Z)(m,"thin-scrollbar"),"aria-label":(0,i.I)({id:"theme.blog.sidebar.navAriaLabel",message:"Blog recent posts navigation",description:"The ARIA label for recent posts in the blog sidebar"})},l.createElement("div",{className:(0,n.Z)(c,"margin-bottom--md")},t.title),l.createElement("ul",{className:(0,n.Z)(u,"clean-list")},t.items.map((e=>l.createElement("li",{key:e.permalink,className:g},l.createElement(o.Z,{isNavLink:!0,to:e.permalink,className:d,activeClassName:p},e.title)))))))}var h=a(3102);function b(e){let{sidebar:t}=e;return l.createElement("ul",{className:"menu__list"},t.items.map((e=>l.createElement("li",{key:e.permalink,className:"menu__list-item"},l.createElement(o.Z,{isNavLink:!0,to:e.permalink,className:"menu__link",activeClassName:"menu__link--active"},e.title)))))}function f(e){return l.createElement(h.Zo,{component:b,props:e})}function v(e){let{sidebar:t}=e;const a=(0,s.i)();return t?.items.length?"mobile"===a?l.createElement(f,{sidebar:t}):l.createElement(E,{sidebar:t}):null}function P(e){const{sidebar:t,toc:a,children:s,...o}=e,i=t&&t.items.length>0;return l.createElement(r.Z,o,l.createElement("div",{className:"container margin-vert--lg"},l.createElement("div",{className:"row"},l.createElement(v,{sidebar:t}),l.createElement("main",{className:(0,n.Z)("col",{"col--7":i,"col--9 col--offset-1":!i}),itemScope:!0,itemType:"http://schema.org/Blog"},s),a&&l.createElement("div",{className:"col col--2"},a))))}},9703:(e,t,a)=>{a.d(t,{Z:()=>s});var l=a(7294),n=a(5999),r=a(2244);function s(e){const{metadata:t}=e,{previousPage:a,nextPage:s}=t;return l.createElement("nav",{className:"pagination-nav","aria-label":(0,n.I)({id:"theme.blog.paginator.navAriaLabel",message:"Blog list page navigation",description:"The ARIA label for the blog pagination"})},a&&l.createElement(r.Z,{permalink:a,title:l.createElement(n.Z,{id:"theme.blog.paginator.newerEntries",description:"The label used to navigate to the newer blog posts page (previous page)"},"Newer Entries")}),s&&l.createElement(r.Z,{permalink:s,title:l.createElement(n.Z,{id:"theme.blog.paginator.olderEntries",description:"The label used to navigate to the older blog posts page (next page)"},"Older Entries"),isNext:!0}))}},390:(e,t,a)=>{a.d(t,{Z:()=>R});var l=a(7294),n=a(6010),r=a(9460),s=a(4996);function o(e){let{children:t,className:a}=e;const{frontMatter:n,assets:o}=(0,r.C)(),{withBaseUrl:i}=(0,s.C)(),m=o.image??n.image;return l.createElement("article",{className:a,itemProp:"blogPost",itemScope:!0,itemType:"http://schema.org/BlogPosting"},m&&l.createElement("meta",{itemProp:"image",content:i(m,{absolute:!0})}),t)}var i=a(9960);const m="title_f1Hy";function c(e){let{className:t}=e;const{metadata:a,isBlogPostPage:s}=(0,r.C)(),{permalink:o,title:c}=a,u=s?"h1":"h2";return l.createElement(u,{className:(0,n.Z)(m,t),itemProp:"headline"},s?c:l.createElement(i.Z,{itemProp:"url",to:o},c))}var u=a(5999),g=a(8824);const d="container_mt6G";function p(e){let{readingTime:t}=e;const a=function(){const{selectMessage:e}=(0,g.c)();return t=>{const a=Math.ceil(t);return e(a,(0,u.I)({id:"theme.blog.post.readingTime.plurals",description:'Pluralized label for "{readingTime} min read". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',message:"One min read|{readingTime} min read"},{readingTime:a}))}}();return l.createElement(l.Fragment,null,a(t))}function E(e){let{date:t,formattedDate:a}=e;return l.createElement("time",{dateTime:t,itemProp:"datePublished"},a)}function h(){return l.createElement(l.Fragment,null," \xb7 ")}function b(e){let{className:t}=e;const{metadata:a}=(0,r.C)(),{date:s,formattedDate:o,readingTime:i}=a;return l.createElement("div",{className:(0,n.Z)(d,"margin-vert--md",t)},l.createElement(E,{date:s,formattedDate:o}),void 0!==i&&l.createElement(l.Fragment,null,l.createElement(h,null),l.createElement(p,{readingTime:i})))}function f(e){return e.href?l.createElement(i.Z,e):l.createElement(l.Fragment,null,e.children)}function v(e){let{author:t,className:a}=e;const{name:r,title:s,url:o,imageURL:i,email:m}=t,c=o||m&&`mailto:${m}`||void 0;return l.createElement("div",{className:(0,n.Z)("avatar margin-bottom--sm",a)},i&&l.createElement(f,{href:c,className:"avatar__photo-link"},l.createElement("img",{className:"avatar__photo",src:i,alt:r})),r&&l.createElement("div",{className:"avatar__intro",itemProp:"author",itemScope:!0,itemType:"https://schema.org/Person"},l.createElement("div",{className:"avatar__name"},l.createElement(f,{href:c,itemProp:"url"},l.createElement("span",{itemProp:"name"},r))),s&&l.createElement("small",{className:"avatar__subtitle",itemProp:"description"},s)))}const P="authorCol_Hf19",N="imageOnlyAuthorRow_pa_O",Z="imageOnlyAuthorCol_G86a";function _(e){let{className:t}=e;const{metadata:{authors:a},assets:s}=(0,r.C)();if(0===a.length)return null;const o=a.every((e=>{let{name:t}=e;return!t}));return l.createElement("div",{className:(0,n.Z)("margin-top--md margin-bottom--sm",o?N:"row",t)},a.map(((e,t)=>l.createElement("div",{className:(0,n.Z)(!o&&"col col--6",o?Z:P),key:t},l.createElement(v,{author:{...e,imageURL:s.authorsImageUrls[t]??e.imageURL}})))))}function k(){return l.createElement("header",null,l.createElement(c,null),l.createElement(b,null),l.createElement(_,null))}var T=a(8780),w=a(7770);function C(e){let{children:t,className:a}=e;const{isBlogPostPage:s}=(0,r.C)();return l.createElement("div",{id:s?T.blogPostContainerID:void 0,className:(0,n.Z)("markdown",a),itemProp:"articleBody"},l.createElement(w.Z,null,t))}var I=a(4881),y=a(1526),B=a(7462);function L(){return l.createElement("b",null,l.createElement(u.Z,{id:"theme.blog.post.readMore",description:"The label used in blog post item excerpts to link to full blog posts"},"Read More"))}function x(e){const{blogPostTitle:t,...a}=e;return l.createElement(i.Z,(0,B.Z)({"aria-label":(0,u.I)({message:"Read more about {title}",id:"theme.blog.post.readMoreLabel",description:"The ARIA label for the link to full blog posts from excerpts"},{title:t})},a),l.createElement(L,null))}const A="blogPostFooterDetailsFull_mRVl";function M(){const{metadata:e,isBlogPostPage:t}=(0,r.C)(),{tags:a,title:s,editUrl:o,hasTruncateMarker:i}=e,m=!t&&i,c=a.length>0;return c||m||o?l.createElement("footer",{className:(0,n.Z)("row docusaurus-mt-lg",t&&A)},c&&l.createElement("div",{className:(0,n.Z)("col",{"col--9":m})},l.createElement(y.Z,{tags:a})),t&&o&&l.createElement("div",{className:"col margin-top--sm"},l.createElement(I.Z,{editUrl:o})),m&&l.createElement("div",{className:(0,n.Z)("col text--right",{"col--3":c})},l.createElement(x,{blogPostTitle:s,to:e.permalink}))):null}function R(e){let{children:t,className:a}=e;const s=function(){const{isBlogPostPage:e}=(0,r.C)();return e?void 0:"margin-bottom--xl"}();return l.createElement(o,{className:(0,n.Z)(s,a)},l.createElement(k,null),l.createElement(C,null,t),l.createElement(M,null))}},9985:(e,t,a)=>{a.d(t,{Z:()=>s});var l=a(7294),n=a(9460),r=a(390);function s(e){let{items:t,component:a=r.Z}=e;return l.createElement(l.Fragment,null,t.map((e=>{let{content:t}=e;return l.createElement(n.n,{key:t.metadata.permalink,content:t},l.createElement(a,null,l.createElement(t,null)))})))}},1714:(e,t,a)=>{a.r(t),a.d(t,{default:()=>b});var l=a(7294),n=a(6010),r=a(5999),s=a(8824),o=a(1944),i=a(5281),m=a(9960),c=a(9058),u=a(9703),g=a(197),d=a(9985);function p(e){const t=function(){const{selectMessage:e}=(0,s.c)();return t=>e(t,(0,r.I)({id:"theme.blog.post.plurals",description:'Pluralized label for "{count} posts". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',message:"One post|{count} posts"},{count:t}))}();return(0,r.I)({id:"theme.blog.tagTitle",description:"The title of the page for a blog tag",message:'{nPosts} tagged with "{tagName}"'},{nPosts:t(e.count),tagName:e.label})}function E(e){let{tag:t}=e;const a=p(t);return l.createElement(l.Fragment,null,l.createElement(o.d,{title:a}),l.createElement(g.Z,{tag:"blog_tags_posts"}))}function h(e){let{tag:t,items:a,sidebar:n,listMetadata:s}=e;const o=p(t);return l.createElement(c.Z,{sidebar:n},l.createElement("header",{className:"margin-bottom--xl"},l.createElement("h1",null,o),l.createElement(m.Z,{href:t.allTagsPath},l.createElement(r.Z,{id:"theme.tags.tagsPageLink",description:"The label of the link targeting the tag list page"},"View All Tags"))),l.createElement(d.Z,{items:a}),l.createElement(u.Z,{metadata:s}))}function b(e){return l.createElement(o.FG,{className:(0,n.Z)(i.k.wrapper.blogPages,i.k.page.blogTagPostListPage)},l.createElement(E,e),l.createElement(h,e))}},9460:(e,t,a)=>{a.d(t,{C:()=>o,n:()=>s});var l=a(7294),n=a(902);const r=l.createContext(null);function s(e){let{children:t,content:a,isBlogPostPage:n=!1}=e;const s=function(e){let{content:t,isBlogPostPage:a}=e;return(0,l.useMemo)((()=>({metadata:t.metadata,frontMatter:t.frontMatter,assets:t.assets,toc:t.toc,isBlogPostPage:a})),[t,a])}({content:a,isBlogPostPage:n});return l.createElement(r.Provider,{value:s},t)}function o(){const e=(0,l.useContext)(r);if(null===e)throw new n.i6("BlogPostProvider");return e}}}]);