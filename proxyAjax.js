!function(){if("function"==typeof window.CustomEvent)return!1;function t(t,e){e=e||{bubbles:!1,cancelable:!1,detail:void 0};let n=document.createEvent("CustomEvent");return n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n}t.prototype=window.Event.prototype,window.CustomEvent=t}(),function(){function t(t){let e=new CustomEvent(t,{detail:this});window.dispatchEvent(e)}let e=window.XMLHttpRequest;if(!e)return console.error("不支持 XMLHttpRequest！ 请更换最新的 chrome 浏览器");function n(){let n=new e;n.addEventListener("abort",(function(){t.call(this,"ajaxAbort")}),!1),n.addEventListener("error",(function(){t.call(this,"ajaxError")}),!1),n.addEventListener("load",(function(){t.call(this,"ajaxLoad")}),!1),n.addEventListener("loadstart",(function(){t.call(this,"ajaxLoadStart")}),!1),n.addEventListener("progress",(function(){t.call(this,"ajaxProgress")}),!1),n.addEventListener("timeout",(function(){t.call(this,"ajaxTimeout")}),!1),n.addEventListener("loadend",(function(){t.call(this,"ajaxLoadEnd")}),!1),n.addEventListener("readystatechange",(function(){t.call(this,"ajaxReadyStateChange")}),!1);let a=n.send;n.send=function(...e){a.apply(n,e),n.body=e[0],t.call(n,"ajaxSend")};let o=n.open;n.open=function(...e){o.apply(n,e),n.method=e[0],n.orignUrl=e[1],n.async=e[2],t.call(n,"ajaxOpen")};let i=n.setRequestHeader;return n.requestHeader={},n.setRequestHeader=function(t,e){n.requestHeader[t]=e,i.call(n,t,e)},n}n.prototype=e.prototype,window.XMLHttpRequest=n}(),window.addEventListener("ajaxReadyStateChange",(function(t){let e=t.detail;const n={response:e?.response,responseType:e?.responseType,responseURL:e?.responseURL?e.responseURL:e?.orignUrl,status:e?.status,statusText:e?.statusText,readyState:e?.readyState,withCredentials:e?.withCredentials};if(4==e?.readyState&&200==e?.status){let t=new CustomEvent("ajaxGetData",{detail:n});window.dispatchEvent(t)}})),function(){let t=new CustomEvent("proxyScriptLoaded",{detail:{zhipin:{initialState:window.__INITIAL_STATE__},lagou:{initialState:window.__NEXT_DATA__}}});window.dispatchEvent(t)}();
//# sourceMappingURL=proxyAjax.js.map