(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[185],{5891:function(e,t,r){Promise.resolve().then(r.t.bind(r,413,23)),Promise.resolve().then(r.t.bind(r,8326,23)),Promise.resolve().then(r.t.bind(r,5858,23)),Promise.resolve().then(r.t.bind(r,6069,23)),Promise.resolve().then(r.t.bind(r,7891,23)),Promise.resolve().then(r.t.bind(r,8117,23)),Promise.resolve().then(r.bind(r,3620))},1447:function(e,t,r){"use strict";t.Z=["https://aggregator.release-mainnet.api.mithril.network/aggregator","https://aggregator.release-preprod.api.mithril.network/aggregator","https://aggregator.pre-release-preview.api.mithril.network/aggregator","https://aggregator.testing-preview.api.mithril.network/aggregator","http://localhost:8080/aggregator"]},4072:function(e,t,r){"use strict";r.d(t,{W:function(){return a}});let a="aggregator"},1118:function(e,t,r){"use strict";r.d(t,{Mj:function(){return g},Q9:function(){return l},Ux:function(){return n}});var a=r(64),o=r(6023);let n=(0,a.oM)({name:"pools",initialState:{list:[]},reducers:{},extraReducers:e=>e.addCase(l.fulfilled,(e,t)=>{if(t.payload.keep_cached_data)return;let r=i(e,t.payload.aggregator);r?(r.network=t.payload.network,r.pools=t.payload.pools,r.date=t.payload.date):e.list.push({aggregator:t.payload.aggregator,date:t.payload.date,network:t.payload.network,pools:t.payload.pools})})}),l=(0,a.hg)("pools/updateForAggregator",(e,t)=>{var r;let a=t.getState(),o=i(a.pools,e),n=Date.now(),l=n-(null!==(r=null==o?void 0:o.date)&&void 0!==r?r:0);return l>216e5?fetch("".concat(e,"/signers/tickers")).then(e=>200===e.status?e.json():{}).then(t=>{var r;return{aggregator:e,date:n,network:t.network,pools:null!==(r=t.signers)&&void 0!==r?r:[]}}):{keep_cached_data:!0}}),i=(e,t)=>e.list.find(e=>e.aggregator===t),g=(0,o.P1)([e=>e.pools,(e,t,r)=>({aggregator:t,poolId:r})],(e,t)=>{let r=i(e,t.aggregator),a=null==r?void 0:r.pools.find(e=>e.party_id===t.poolId);return{network:null==r?void 0:r.network,...a}});n.reducer},3620:function(e,t,r){"use strict";r.r(t),r.d(t,{Providers:function(){return v}});var a=r(7437),o=r(4072),n=r(64),l=r(1118),i=r(9718),g=r(1447),s=r(3513);let c="Explorer_State",u=e=>{var t;return(0,n.xC)({reducer:{settings:i.xj.reducer,pools:l.Ux.reducer},preloadedState:{...t=function(){if(localStorage){let e=localStorage.getItem(c);return e?JSON.parse(e):void 0}}(),settings:function(e,t){var r,a;let o,n=null!=e?e:i.E3,l=(r=n.availableAggregators,a=g.Z,o=r.filter(e=>!a.includes(e)),[...a,...o]);return t&&(0,s.checkUrl)(t)?(l.includes(t)||l.push(t),n={...n,selectedAggregator:t,availableAggregators:l,canRemoveSelected:!g.Z.includes(t)}):n={...n,availableAggregators:l},n}(null==t?void 0:t.settings,e)}})};var d=r(3198),p=r(4033),f=r(2265);function v(e){let{children:t}=e,r=(0,p.useSearchParams)(),n=r.get(o.W),[l,i]=(0,f.useState)(u(n));return l.subscribe(()=>{var e;return e=l.getState(),void(localStorage&&localStorage.setItem(c,JSON.stringify(e)))}),(0,a.jsx)(d.zt,{store:l,children:t})}},9718:function(e,t,r){"use strict";r.d(t,{E3:function(){return l},JV:function(){return g},OR:function(){return u},VT:function(){return c},k6:function(){return d},uI:function(){return s},xj:function(){return i}});var a=r(64),o=r(1447),n=r(3513);let l={autoUpdate:!0,updateInterval:1e4,selectedAggregator:o.Z[0],availableAggregators:o.Z,canRemoveSelected:!1},i=(0,a.oM)({name:"settings",initialState:l,reducers:{setUpdateInterval:(e,t)=>{e.updateInterval=t.payload},toggleAutoUpdate:e=>{e.autoUpdate=!e.autoUpdate},selectAggregator:(e,t)=>{if(!(0,n.checkUrl)(t.payload))return e;let r=e.availableAggregators.includes(t.payload)?e.availableAggregators:[...e.availableAggregators,t.payload];return{...e,selectedAggregator:t.payload,availableAggregators:r,canRemoveSelected:!o.Z.includes(t.payload)}},removeSelectedAggregator:e=>o.Z.includes(e.selectedAggregator)?e:{...e,selectedAggregator:e.availableAggregators.at(0),availableAggregators:e.availableAggregators.filter(t=>t!==e.selectedAggregator),canRemoveSelected:!o.Z.includes(e.availableAggregators.at(0))}}}),{setUpdateInterval:g,toggleAutoUpdate:s,selectAggregator:c,removeSelectedAggregator:u}=i.actions,d=e=>e.settings.selectedAggregator;i.reducer},3513:function(e){"use strict";let t=e=>e/1e6,r=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:2;return e.toLocaleString(void 0,{maximumFractionDigits:t})};e.exports={checkUrl:function(e){try{return new URL(e),!0}catch(e){return!1}},formatStake:function(e){let a=t(e),o=[{suffix:"B",value:1e9},{suffix:"M",value:1e6},{suffix:"K",value:1e3},{suffix:"",value:1}].find(e=>Math.abs(a)>=e.value-.001);return o?"".concat(r(a/o.value)).concat(o.suffix,"₳"):"".concat(r(a),"₳")},toAda:t,formatCurrency:r,formatBytes:function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:2;if(0===e)return"0 Bytes";let r=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,r)).toFixed(t<0?0:t))+" "+["Bytes","KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"][r]},formatPartyId:function(e){return("string"==typeof e||e instanceof String)&&e.length>15?e.slice(0,10)+"…"+e.slice(-5):e},getCExplorerUrlForPool:function(e,t){let r;let a="cexplorer.io/pool/".concat(t);switch(e){case"mainnet":r="https://".concat(a);break;case"preprod":r="https://preprod.".concat(a);break;case"preview":r="https://preview.".concat(a)}return r}}},7891:function(){},8117:function(){},6069:function(){},5858:function(e){e.exports={container:"explorer_container__e4y3J",main:"explorer_main__72BOO",footer:"explorer_footer__NDYaK",title:"explorer_title__4AQZM",code:"explorer_code__d9zj2",logo:"explorer_logo__qsx9l"}}},function(e){e.O(0,[428,621,913,971,472,744],function(){return e(e.s=5891)}),_N_E=e.O()}]);