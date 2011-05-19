/**
 * GameGolem v31.5.1116
 * http://rycochet.com/
 * http://code.google.com/p/game-golem/
 *
 * Copyright 2010-2011, Robin Cloutman
 * Licensed under the LGPL Version 3 license.
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Includes jQuery JavaScript Library & jQuery UI
 * http://jquery.com/
 */
/*!
 * jQuery JavaScript Library v1.6.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Thu May 12 15:04:36 2011 -0400
 */
(function(a,b){function cy(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cv(a){if(!cj[a]){var b=f("<"+a+">").appendTo("body"),d=b.css("display");b.remove();if(d==="none"||d===""){ck||(ck=c.createElement("iframe"),ck.frameBorder=ck.width=ck.height=0),c.body.appendChild(ck);if(!cl||!ck.createElement)cl=(ck.contentWindow||ck.contentDocument).document,cl.write("<!doctype><html><body></body></html>");b=cl.createElement(a),cl.body.appendChild(b),d=f.css(b,"display"),c.body.removeChild(ck)}cj[a]=d}return cj[a]}function cu(a,b){var c={};f.each(cp.concat.apply([],cp.slice(0,b)),function(){c[this]=a});return c}function ct(){cq=b}function cs(){setTimeout(ct,0);return cq=f.now()}function ci(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ch(){try{return new a.XMLHttpRequest}catch(b){}}function cb(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function ca(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function b_(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bF.test(a)?d(a,e):b_(a+"["+(typeof e=="object"||f.isArray(e)?b:"")+"]",e,c,d)});else if(!c&&b!=null&&typeof b=="object")for(var e in b)b_(a+"["+e+"]",b[e],c,d);else d(a,b)}function b$(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bU,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=b$(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=b$(a,c,d,e,"*",g));return l}function bZ(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bQ),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function bD(a,b,c){var d=b==="width"?bx:by,e=b==="width"?a.offsetWidth:a.offsetHeight;if(c==="border")return e;f.each(d,function(){c||(e-=parseFloat(f.css(a,"padding"+this))||0),c==="margin"?e+=parseFloat(f.css(a,"margin"+this))||0:e-=parseFloat(f.css(a,"border"+this+"Width"))||0});return e}function bn(a,b){b.src?f.ajax({url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bf,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)}function bm(a){f.nodeName(a,"input")?bl(a):a.getElementsByTagName&&f.grep(a.getElementsByTagName("input"),bl)}function bl(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bk(a){return"getElementsByTagName"in a?a.getElementsByTagName("*"):"querySelectorAll"in a?a.querySelectorAll("*"):[]}function bj(a,b){var c;if(b.nodeType===1){b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase();if(c==="object")b.outerHTML=a.outerHTML;else if(c!=="input"||a.type!=="checkbox"&&a.type!=="radio"){if(c==="option")b.selected=a.defaultSelected;else if(c==="input"||c==="textarea")b.defaultValue=a.defaultValue}else a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value);b.removeAttribute(f.expando)}}function bi(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c=f.expando,d=f.data(a),e=f.data(b,d);if(d=d[c]){var g=d.events;e=e[c]=f.extend({},d);if(g){delete e.handle,e.events={};for(var h in g)for(var i=0,j=g[h].length;i<j;i++)f.event.add(b,h+(g[h][i].namespace?".":"")+g[h][i].namespace,g[h][i],g[h][i].data)}}}}function bh(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function X(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(S.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function W(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function O(a,b){return(a&&a!=="*"?a+".":"")+b.replace(A,"`").replace(B,"&")}function N(a){var b,c,d,e,g,h,i,j,k,l,m,n,o,p=[],q=[],r=f._data(this,"events");if(!(a.liveFired===this||!r||!r.live||a.target.disabled||a.button&&a.type==="click")){a.namespace&&(n=new RegExp("(^|\\.)"+a.namespace.split(".").join("\\.(?:.*\\.)?")+"(\\.|$)")),a.liveFired=this;var s=r.live.slice(0);for(i=0;i<s.length;i++)g=s[i],g.origType.replace(y,"")===a.type?q.push(g.selector):s.splice(i--,1);e=f(a.target).closest(q,a.currentTarget);for(j=0,k=e.length;j<k;j++){m=e[j];for(i=0;i<s.length;i++){g=s[i];if(m.selector===g.selector&&(!n||n.test(g.namespace))&&!m.elem.disabled){h=m.elem,d=null;if(g.preType==="mouseenter"||g.preType==="mouseleave")a.type=g.preType,d=f(a.relatedTarget).closest(g.selector)[0],d&&f.contains(h,d)&&(d=h);(!d||d!==h)&&p.push({elem:h,handleObj:g,level:m.level})}}}for(j=0,k=p.length;j<k;j++){e=p[j];if(c&&e.level>c)break;a.currentTarget=e.elem,a.data=e.handleObj.data,a.handleObj=e.handleObj,o=e.handleObj.origHandler.apply(e.elem,arguments);if(o===!1||a.isPropagationStopped()){c=e.level,o===!1&&(b=!1);if(a.isImmediatePropagationStopped())break}}return b}}function L(a,c,d){var e=f.extend({},d[0]);e.type=a,e.originalEvent={},e.liveFired=b,f.event.handle.call(c,e),e.isDefaultPrevented()&&d[0].preventDefault()}function F(){return!0}function E(){return!1}function m(a,c,d){var e=c+"defer",g=c+"queue",h=c+"mark",i=f.data(a,e,b,!0);i&&(d==="queue"||!f.data(a,g,b,!0))&&(d==="mark"||!f.data(a,h,b,!0))&&setTimeout(function(){!f.data(a,g,b,!0)&&!f.data(a,h,b,!0)&&(f.removeData(a,e,!0),i.resolve())},0)}function l(a){for(var b in a)if(b!=="toJSON")return!1;return!0}function k(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(j,"$1-$2").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNaN(d)?i.test(d)?f.parseJSON(d):d:parseFloat(d)}catch(g){}f.data(a,c,d)}else d=b}return d}var c=a.document,d=a.navigator,e=a.location,f=function(){function H(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(H,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/\d/,n=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,o=/^[\],:{}\s]*$/,p=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,q=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,r=/(?:^|:|,)(?:\s*\[)+/g,s=/(webkit)[ \/]([\w.]+)/,t=/(opera)(?:.*version)?[ \/]([\w.]+)/,u=/(msie) ([\w.]+)/,v=/(mozilla)(?:.*? rv:([\w.]+))?/,w=d.userAgent,x,y,z,A=Object.prototype.toString,B=Object.prototype.hasOwnProperty,C=Array.prototype.push,D=Array.prototype.slice,E=String.prototype.trim,F=Array.prototype.indexOf,G={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=n.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.6.1",length:0,size:function(){return this.length},toArray:function(){return D.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?C.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),y.done(a);return this},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(D.apply(this,arguments),"slice",D.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:C,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;y.resolveWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").unbind("ready")}},bindReady:function(){if(!y){y=e._Deferred();if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",z,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",z),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&H()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a&&typeof a=="object"&&"setInterval"in a},isNaN:function(a){return a==null||!m.test(a)||isNaN(a)},type:function(a){return a==null?String(a):G[A.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;if(a.constructor&&!B.call(a,"constructor")&&!B.call(a.constructor.prototype,"isPrototypeOf"))return!1;var c;for(c in a);return c===b||B.call(a,c)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw a},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(o.test(b.replace(p,"@").replace(q,"]").replace(r,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(b,c,d){a.DOMParser?(d=new DOMParser,c=d.parseFromString(b,"text/xml")):(c=new ActiveXObject("Microsoft.XMLDOM"),c.async="false",c.loadXML(b)),d=c.documentElement,(!d||!d.nodeName||d.nodeName==="parsererror")&&e.error("Invalid XML: "+b);return c},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:E?function(a){return a==null?"":E.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?C.call(c,a):e.merge(c,a)}return c},inArray:function(a,b){if(F)return F.call(b,a);for(var c=0,d=b.length;c<d;c++)if(b[c]===a)return c;return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=D.call(arguments,2),g=function(){return a.apply(c,f.concat(D.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h){var i=a.length;if(typeof c=="object"){for(var j in c)e.access(a,j,c[j],f,g,d);return a}if(d!==b){f=!h&&f&&e.isFunction(d);for(var k=0;k<i;k++)g(a[k],c,f?d.call(a[k],k,g(a[k],c)):d,h);return a}return i?g(a[0],c):b},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=s.exec(a)||t.exec(a)||u.exec(a)||a.indexOf("compatible")<0&&v.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){G["[object "+b+"]"]=b.toLowerCase()}),x=e.uaMatch(w),x.browser&&(e.browser[x.browser]=!0,e.browser.version=x.version),e.browser.webkit&&(e.browser.safari=!0),j.test(" ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?z=function(){c.removeEventListener("DOMContentLoaded",z,!1),e.ready()}:c.attachEvent&&(z=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",z),e.ready())});return e}(),g="done fail isResolved isRejected promise then always pipe".split(" "),h=[].slice;f.extend({_Deferred:function(){var a=[],b,c,d,e={done:function(){if(!d){var c=arguments,g,h,i,j,k;b&&(k=b,b=0);for(g=0,h=c.length;g<h;g++)i=c[g],j=f.type(i),j==="array"?e.done.apply(e,i):j==="function"&&a.push(i);k&&e.resolveWith(k[0],k[1])}return this},resolveWith:function(e,f){if(!d&&!b&&!c){f=f||[],c=1;try{while(a[0])a.shift().apply(e,f)}finally{b=[e,f],c=0}}return this},resolve:function(){e.resolveWith(this,arguments);return this},isResolved:function(){return!!c||!!b},cancel:function(){d=1,a=[];return this}};return e},Deferred:function(a){var b=f._Deferred(),c=f._Deferred(),d;f.extend(b,{then:function(a,c){b.done(a).fail(c);return this},always:function(){return b.done.apply(b,arguments).fail.apply(this,arguments)},fail:c.done,rejectWith:c.resolveWith,reject:c.resolve,isRejected:c.isResolved,pipe:function(a,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[c,"reject"]},function(a,c){var e=c[0],g=c[1],h;f.isFunction(e)?b[a](function(){h=e.apply(this,arguments),h&&f.isFunction(h.promise)?h.promise().then(d.resolve,d.reject):d[g](h)}):b[a](d[g])})}).promise()},promise:function(a){if(a==null){if(d)return d;d=a={}}var c=g.length;while(c--)a[g[c]]=b[g[c]];return a}}),b.done(c.cancel).fail(b.cancel),delete b.cancel,a&&a.call(b,b);return b},when:function(a){function i(a){return function(c){b[a]=arguments.length>1?h.call(arguments,0):c,--e||g.resolveWith(g,h.call(b,0))}}var b=arguments,c=0,d=b.length,e=d,g=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred();if(d>1){for(;c<d;c++)b[c]&&f.isFunction(b[c].promise)?b[c].promise().then(i(c),g.reject):--e;e||g.resolveWith(g,b)}else g!==a&&g.resolveWith(g,d?[a]:[]);return g.promise()}}),f.support=function(){var a=c.createElement("div"),b=c.documentElement,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r;a.setAttribute("className","t"),a.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>",d=a.getElementsByTagName("*"),e=a.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};f=c.createElement("select"),g=f.appendChild(c.createElement("option")),h=a.getElementsByTagName("input")[0],j={leadingWhitespace:a.firstChild.nodeType===3,tbody:!a.getElementsByTagName("tbody").length,htmlSerialize:!!a.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55$/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,checkOn:h.value==="on",optSelected:g.selected,getSetAttribute:a.className!=="t",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0},h.checked=!0,j.noCloneChecked=h.cloneNode(!0).checked,f.disabled=!0,j.optDisabled=!g.disabled;try{delete a.test}catch(s){j.deleteExpando=!1}!a.addEventListener&&a.attachEvent&&a.fireEvent&&(a.attachEvent("onclick",function b(){j.noCloneEvent=!1,a.detachEvent("onclick",b)}),a.cloneNode(!0).fireEvent("onclick")),h=c.createElement("input"),h.value="t",h.setAttribute("type","radio"),j.radioValue=h.value==="t",h.setAttribute("checked","checked"),a.appendChild(h),k=c.createDocumentFragment(),k.appendChild(a.firstChild),j.checkClone=k.cloneNode(!0).cloneNode(!0).lastChild.checked,a.innerHTML="",a.style.width=a.style.paddingLeft="1px",l=c.createElement("body"),m={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"};for(q in m)l.style[q]=m[q];l.appendChild(a),b.insertBefore(l,b.firstChild),j.appendChecked=h.checked,j.boxModel=a.offsetWidth===2,"zoom"in a.style&&(a.style.display="inline",a.style.zoom=1,j.inlineBlockNeedsLayout=a.offsetWidth===2,a.style.display="",a.innerHTML="<div style='width:4px;'></div>",j.shrinkWrapBlocks=a.offsetWidth!==2),a.innerHTML="<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>",n=a.getElementsByTagName("td"),r=n[0].offsetHeight===0,n[0].style.display="",n[1].style.display="none",j.reliableHiddenOffsets=r&&n[0].offsetHeight===0,a.innerHTML="",c.defaultView&&c.defaultView.getComputedStyle&&(i=c.createElement("div"),i.style.width="0",i.style.marginRight="0",a.appendChild(i),j.reliableMarginRight=(parseInt((c.defaultView.getComputedStyle(i,null)||{marginRight:0}).marginRight,10)||0)===0),l.innerHTML="",b.removeChild(l);if(a.attachEvent)for(q in{submit:1,change:1,focusin:1})p="on"+q,r=p in a,r||(a.setAttribute(p,"return;"),r=typeof a[p]=="function"),j[q+"Bubbles"]=r;return j}(),f.boxModel=f.support.boxModel;var i=/^(?:\{.*\}|\[.*\])$/,j=/([a-z])([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!l(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g=f.expando,h=typeof c=="string",i,j=a.nodeType,k=j?f.cache:a,l=j?a[f.expando]:a[f.expando]&&f.expando;if((!l||e&&l&&!k[l][g])&&h&&d===b)return;l||(j?a[f.expando]=l=++f.uuid:l=f.expando),k[l]||(k[l]={},j||(k[l].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?k[l][g]=f.extend(k[l][g],c):k[l]=f.extend(k[l],c);i=k[l],e&&(i[g]||(i[g]={}),i=i[g]),d!==b&&(i[f.camelCase(c)]=d);if(c==="events"&&!i[c])return i[g]&&i[g].events;return h?i[f.camelCase(c)]:i}},removeData:function(b,c,d){if(!!f.acceptData(b)){var e=f.expando,g=b.nodeType,h=g?f.cache:b,i=g?b[f.expando]:f.expando;if(!h[i])return;if(c){var j=d?h[i][e]:h[i];if(j){delete j[c];if(!l(j))return}}if(d){delete h[i][e];if(!l(h[i]))return}var k=h[i][e];f.support.deleteExpando||h!=a?delete h[i]:h[i]=null,k?(h[i]={},g||(h[i].toJSON=f.noop),h[i][e]=k):g&&(f.support.deleteExpando?delete b[f.expando]:b.removeAttribute?b.removeAttribute(f.expando):b[f.expando]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d=null;if(typeof a=="undefined"){if(this.length){d=f.data(this[0]);if(this[0].nodeType===1){var e=this[0].attributes,g;for(var h=0,i=e.length;h<i;h++)g=e[h].name,g.indexOf("data-")===0&&(g=f.camelCase(g.substring(5)),k(this[0],g,d[g]))}}return d}if(typeof a=="object")return this.each(function(){f.data(this,a)});var j=a.split(".");j[1]=j[1]?"."+j[1]:"";if(c===b){d=this.triggerHandler("getData"+j[1]+"!",[j[0]]),d===b&&this.length&&(d=f.data(this[0],a),d=k(this[0],a,d));return d===b&&j[1]?this.data(j[0]):d}return this.each(function(){var b=f(this),d=[j[0],c];b.triggerHandler("setData"+j[1]+"!",d),f.data(this,a,c),b.triggerHandler("changeData"+j[1]+"!",d)})},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,c){a&&(c=(c||"fx")+"mark",f.data(a,c,(f.data(a,c,b,!0)||0)+1,!0))},_unmark:function(a,c,d){a!==!0&&(d=c,c=a,a=!1);if(c){d=d||"fx";var e=d+"mark",g=a?0:(f.data(c,e,b,!0)||1)-1;g?f.data(c,e,g,!0):(f.removeData(c,e,!0),m(c,d,"mark"))}},queue:function(a,c,d){if(a){c=(c||"fx")+"queue";var e=f.data(a,c,b,!0);d&&(!e||f.isArray(d)?e=f.data(a,c,f.makeArray(d),!0):e.push(d));return e||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e;d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),d.call(a,function(){f.dequeue(a,b)})),c.length||(f.removeData(a,b+"queue",!0),m(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){typeof a!="string"&&(c=a,a="fx");if(c===b)return f.queue(this[0],a);return this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(){var c=this;setTimeout(function(){f.dequeue(c,b)},a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f._Deferred(),!0))h++,l.done(m);m();return d.promise()}});var n=/[\n\t\r]/g,o=/\s+/,p=/\r/g,q=/^(?:button|input)$/i,r=/^(?:button|input|object|select|textarea)$/i,s=/^a(?:rea)?$/i,t=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,u=/\:/,v,w;f.fn.extend({attr:function(a,b){return f.access(this,a,b,!0,f.attr)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,a,b,!0,f.prop)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){if(f.isFunction(a))return this.each(function(b){var c=f(this);c.addClass(a.call(this,b,c.attr("class")||""))});if(a&&typeof a=="string"){var b=(a||"").split(o);for(var c=0,d=this.length;c<d;c++){var e=this[c];if(e.nodeType===1)if(!e.className)e.className=a;else{var g=" "+e.className+" ",h=e.className;for(var i=0,j=b.length;i<j;i++)g.indexOf(" "+b[i]+" ")<0&&(h+=" "+b[i]);e.className=f.trim(h)}}}return this},removeClass:function(a){if(f.isFunction(a))return this.each(function(b){var c=f(this);c.removeClass(a.call(this,b,c.attr("class")))});if(a&&typeof a=="string"||a===b){var c=(a||"").split(o);for(var d=0,e=this.length;d<e;d++){var g=this[d];if(g.nodeType===1&&g.className)if(a){var h=(" "+g.className+" ").replace(n," ");for(var i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){var d=f(this);d.toggleClass(a.call(this,c,d.attr("class"),b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(o);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ";for(var c=0,d=this.length;c<d;c++)if((" "+this[c].className+" ").replace(n," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e=this[0];if(!arguments.length){if(e){c=f.valHooks[e.nodeName.toLowerCase()]||f.valHooks[e.type];if(c&&"get"in c&&(d=c.get(e,"value"))!==b)return d;return(e.value||"").replace(p,"")}return b}var g=f.isFunction(a);return this.each(function(d){var e=f(this),h;if(this.nodeType===1){g?h=a.call(this,d,e.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.nodeName.toLowerCase()]||f.valHooks[this.type];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c=a.selectedIndex,d=[],e=a.options,g=a.type==="select-one";if(c<0)return null;for(var h=g?c:0,i=g?c+1:e.length;h<i;h++){var j=e[h];if(j.selected&&(f.support.optDisabled?!j.disabled:j.getAttribute("disabled")===null)&&(!j.parentNode.disabled||!f.nodeName(j.parentNode,"optgroup"))){b=f(j).val();if(g)return b;d.push(b)}}if(g&&!d.length&&e.length)return f(e[c]).val();return d},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attrFix:{tabindex:"tabIndex"},attr:function(a,c,d,e){var g=a.nodeType;if(!a||g===3||g===8||g===2)return b;if(e&&c in f.attrFn)return f(a)[c](d);if(!("getAttribute"in a))return f.prop(a,c,d);var h,i,j=g!==1||!f.isXMLDoc(a);c=j&&f.attrFix[c]||c,i=f.attrHooks[c],i||(!t.test(c)||typeof d!="boolean"&&d!==b&&d.toLowerCase()!==c.toLowerCase()?v&&(f.nodeName(a,"form")||u.test(c))&&(i=v):i=w);if(d!==b){if(d===null){f.removeAttr(a,c);return b}if(i&&"set"in i&&j&&(h=i.set(a,d,c))!==b)return h;a.setAttribute(c,""+d);return d}if(i&&"get"in i&&j)return i.get(a,c);h=a.getAttribute(c);return h===null?b:h},removeAttr:function(a,b){var c;a.nodeType===1&&(b=f.attrFix[b]||b,f.support.getSetAttribute?a.removeAttribute(b):(f.attr(a,b,""),a.removeAttributeNode(a.getAttributeNode(b))),t.test(b)&&(c=f.propFix[b]||b)in a&&(a[c]=!1))},attrHooks:{type:{set:function(a,b){if(q.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},tabIndex:{get:function(a){var c=a.getAttributeNode("tabIndex");return c&&c.specified?parseInt(c.value,10):r.test(a.nodeName)||s.test(a.nodeName)&&a.href?0:b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e=a.nodeType;if(!a||e===3||e===8||e===2)return b;var g,h,i=e!==1||!f.isXMLDoc(a);c=i&&f.propFix[c]||c,h=f.propHooks[c];return d!==b?h&&"set"in h&&(g=h.set(a,d,c))!==b?g:a[c]=d:h&&"get"in h&&(g=h.get(a,c))!==b?g:a[c]},propHooks:{}}),w={get:function(a,c){return a[f.propFix[c]||c]?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=b),a.setAttribute(c,c.toLowerCase()));return c}},f.attrHooks.value={get:function(a,b){if(v&&f.nodeName(a,"button"))return v.get(a,b);return a.value},set:function(a,b,c){if(v&&f.nodeName(a,"button"))return v.set(a,b,c);a.value=b}},f.support.getSetAttribute||(f.attrFix=f.propFix,v=f.attrHooks.name=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&d.nodeValue!==""?d.nodeValue:b},set:function(a,b,c){var d=a.getAttributeNode(c);if(d){d.nodeValue=b;return b}}},f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})})),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}})),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var x=Object.prototype.hasOwnProperty,y=/\.(.*)$/,z=/^(?:textarea|input|select)$/i,A=/\./g,B=/ /g,C=/[^\w\s.|`]/g,D=function(a){return a.replace(C,"\\$&")};f.event={add:function(a,c,d,e){if(a.nodeType!==3&&a.nodeType!==8){if(d===!1)d=E;else if(!d)return;var g,h;d.handler&&(g=d,d=g.handler),d.guid||(d.guid=f.guid++);var i=f._data(a);if(!i)return;var j=i.events,k=i.handle;j||(i.events=j={}),k||(i.handle=k=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.handle.apply(k.elem,arguments):b}),k.elem=a,c=c.split(" ");var l,m=0,n;while(l=c[m++]){h=g?f.extend({},g):{handler:d,data:e},l.indexOf(".")>-1?(n=l.split("."),l=n.shift(),h.namespace=n.slice(0).sort().join(".")):(n=[],h.namespace=""),h.type=l,h.guid||(h.guid=d.guid);var o=j[l],p=f.event.special[l]||{};if(!o){o=j[l]=[];if(!p.setup||p.setup.call(a,e,n,k)===!1)a.addEventListener?a.addEventListener(l,k,!1):a.attachEvent&&a.attachEvent("on"+l,k)}p.add&&(p.add.call(a,h),h.handler.guid||(h.handler.guid=d.guid)),o.push(h),f.event.global[l]=!0}a=null}},global:{},remove:function(a,c,d,e){if(a.nodeType!==3&&a.nodeType!==8){d===!1&&(d=E);var g,h,i,j,k=0,l,m,n,o,p,q,r,s=f.hasData(a)&&f._data(a),t=s&&s.events;if(!s||!t)return;c&&c.type&&(d=c.handler,c=c.type);if(!c||typeof c=="string"&&c.charAt(0)==="."){c=c||"";for(h in t)f.event.remove(a,h+c);return}c=c.split(" ");while(h=c[k++]){r=h,q=null,l=h.indexOf(".")<0,m=[],l||(m=h.split("."),h=m.shift(),n=new RegExp("(^|\\.)"+f.map(m.slice(0).sort(),D).join("\\.(?:.*\\.)?")+"(\\.|$)")),p=t[h];if(!p)continue;if(!d){for(j=0;j<p.length;j++){q=p[j];if(l||n.test(q.namespace))f.event.remove(a,r,q.handler,j),p.splice(j--,1)}continue}o=f.event.special[h]||{};for(j=e||0;j<p.length;j++){q=p[j];if(d.guid===q.guid){if(l||n.test(q.namespace))e==null&&p.splice(j--,1),o.remove&&o.remove.call(a,q);if(e!=null)break}}if(p.length===0||e!=null&&p.length===1)(!o.teardown||o.teardown.call(a,m)===!1)&&f.removeEvent(a,h,s.handle),g=null,delete t[h]}if(f.isEmptyObject(t)){var u=s.handle;u&&(u.elem=null),delete s.events,delete s.handle,f.isEmptyObject(s)&&f.removeData(a,b,!0)}}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){var h=c.type||c,i=[],j;h.indexOf("!")>=0&&(h=h.slice(0,-1),j=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if(!!e&&!f.event.customEvent[h]||!!f.event.global[h]){c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.exclusive=j,c.namespace=i.join("."),c.namespace_re=new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)");if(g||!e)c.preventDefault(),c.stopPropagation();if(!e){f.each(f.cache,function(){var a=f.expando,b=this[a];b&&b.events&&b.events[h]&&f.event.trigger(c,d,b.handle.elem
)});return}if(e.nodeType===3||e.nodeType===8)return;c.result=b,c.target=e,d=d?f.makeArray(d):[],d.unshift(c);var k=e,l=h.indexOf(":")<0?"on"+h:"";do{var m=f._data(k,"handle");c.currentTarget=k,m&&m.apply(k,d),l&&f.acceptData(k)&&k[l]&&k[l].apply(k,d)===!1&&(c.result=!1,c.preventDefault()),k=k.parentNode||k.ownerDocument||k===c.target.ownerDocument&&a}while(k&&!c.isPropagationStopped());if(!c.isDefaultPrevented()){var n,o=f.event.special[h]||{};if((!o._default||o._default.call(e.ownerDocument,c)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)){try{l&&e[h]&&(n=e[l],n&&(e[l]=null),f.event.triggered=h,e[h]())}catch(p){}n&&(e[l]=n),f.event.triggered=b}}return c.result}},handle:function(c){c=f.event.fix(c||a.event);var d=((f._data(this,"events")||{})[c.type]||[]).slice(0),e=!c.exclusive&&!c.namespace,g=Array.prototype.slice.call(arguments,0);g[0]=c,c.currentTarget=this;for(var h=0,i=d.length;h<i;h++){var j=d[h];if(e||c.namespace_re.test(j.namespace)){c.handler=j.handler,c.data=j.data,c.handleObj=j;var k=j.handler.apply(this,g);k!==b&&(c.result=k,k===!1&&(c.preventDefault(),c.stopPropagation()));if(c.isImmediatePropagationStopped())break}}return c.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(a){if(a[f.expando])return a;var d=a;a=f.Event(d);for(var e=this.props.length,g;e;)g=this.props[--e],a[g]=d[g];a.target||(a.target=a.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),!a.relatedTarget&&a.fromElement&&(a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement);if(a.pageX==null&&a.clientX!=null){var h=a.target.ownerDocument||c,i=h.documentElement,j=h.body;a.pageX=a.clientX+(i&&i.scrollLeft||j&&j.scrollLeft||0)-(i&&i.clientLeft||j&&j.clientLeft||0),a.pageY=a.clientY+(i&&i.scrollTop||j&&j.scrollTop||0)-(i&&i.clientTop||j&&j.clientTop||0)}a.which==null&&(a.charCode!=null||a.keyCode!=null)&&(a.which=a.charCode!=null?a.charCode:a.keyCode),!a.metaKey&&a.ctrlKey&&(a.metaKey=a.ctrlKey),!a.which&&a.button!==b&&(a.which=a.button&1?1:a.button&2?3:a.button&4?2:0);return a},guid:1e8,proxy:f.proxy,special:{ready:{setup:f.bindReady,teardown:f.noop},live:{add:function(a){f.event.add(this,O(a.origType,a.selector),f.extend({},a,{handler:N,guid:a.handler.guid}))},remove:function(a){f.event.remove(this,O(a.origType,a.selector),a)}},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}}},f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!this.preventDefault)return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?F:E):this.type=a,b&&f.extend(this,b),this.timeStamp=f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=F;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=F;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=F,this.stopPropagation()},isDefaultPrevented:E,isPropagationStopped:E,isImmediatePropagationStopped:E};var G=function(a){var b=a.relatedTarget;a.type=a.data;try{if(b&&b!==c&&!b.parentNode)return;while(b&&b!==this)b=b.parentNode;b!==this&&f.event.handle.apply(this,arguments)}catch(d){}},H=function(a){a.type=a.data,f.event.handle.apply(this,arguments)};f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]={setup:function(c){f.event.add(this,b,c&&c.selector?H:G,a)},teardown:function(a){f.event.remove(this,b,a&&a.selector?H:G)}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(a,b){if(!f.nodeName(this,"form"))f.event.add(this,"click.specialSubmit",function(a){var b=a.target,c=b.type;(c==="submit"||c==="image")&&f(b).closest("form").length&&L("submit",this,arguments)}),f.event.add(this,"keypress.specialSubmit",function(a){var b=a.target,c=b.type;(c==="text"||c==="password")&&f(b).closest("form").length&&a.keyCode===13&&L("submit",this,arguments)});else return!1},teardown:function(a){f.event.remove(this,".specialSubmit")}});if(!f.support.changeBubbles){var I,J=function(a){var b=a.type,c=a.value;b==="radio"||b==="checkbox"?c=a.checked:b==="select-multiple"?c=a.selectedIndex>-1?f.map(a.options,function(a){return a.selected}).join("-"):"":f.nodeName(a,"select")&&(c=a.selectedIndex);return c},K=function(c){var d=c.target,e,g;if(!!z.test(d.nodeName)&&!d.readOnly){e=f._data(d,"_change_data"),g=J(d),(c.type!=="focusout"||d.type!=="radio")&&f._data(d,"_change_data",g);if(e===b||g===e)return;if(e!=null||g)c.type="change",c.liveFired=b,f.event.trigger(c,arguments[1],d)}};f.event.special.change={filters:{focusout:K,beforedeactivate:K,click:function(a){var b=a.target,c=f.nodeName(b,"input")?b.type:"";(c==="radio"||c==="checkbox"||f.nodeName(b,"select"))&&K.call(this,a)},keydown:function(a){var b=a.target,c=f.nodeName(b,"input")?b.type:"";(a.keyCode===13&&!f.nodeName(b,"textarea")||a.keyCode===32&&(c==="checkbox"||c==="radio")||c==="select-multiple")&&K.call(this,a)},beforeactivate:function(a){var b=a.target;f._data(b,"_change_data",J(b))}},setup:function(a,b){if(this.type==="file")return!1;for(var c in I)f.event.add(this,c+".specialChange",I[c]);return z.test(this.nodeName)},teardown:function(a){f.event.remove(this,".specialChange");return z.test(this.nodeName)}},I=f.event.special.change.filters,I.focus=I.beforeactivate}f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){function e(a){var c=f.event.fix(a);c.type=b,c.originalEvent={},f.event.trigger(c,null,c.target),c.isDefaultPrevented()&&a.preventDefault()}var d=0;f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.each(["bind","one"],function(a,c){f.fn[c]=function(a,d,e){var g;if(typeof a=="object"){for(var h in a)this[c](h,d,a[h],e);return this}if(arguments.length===2||d===!1)e=d,d=b;c==="one"?(g=function(a){f(this).unbind(a,g);return e.apply(this,arguments)},g.guid=e.guid||f.guid++):g=e;if(a==="unload"&&c!=="one")this.one(a,d,e);else for(var i=0,j=this.length;i<j;i++)f.event.add(this[i],a,g,d);return this}}),f.fn.extend({unbind:function(a,b){if(typeof a=="object"&&!a.preventDefault)for(var c in a)this.unbind(c,a[c]);else for(var d=0,e=this.length;d<e;d++)f.event.remove(this[d],a,b);return this},delegate:function(a,b,c,d){return this.live(b,c,d,a)},undelegate:function(a,b,c){return arguments.length===0?this.unbind("live"):this.die(b,null,c,a)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f.data(this,"lastToggle"+a.guid)||0)%d;f.data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}});var M={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};f.each(["live","die"],function(a,c){f.fn[c]=function(a,d,e,g){var h,i=0,j,k,l,m=g||this.selector,n=g?this:f(this.context);if(typeof a=="object"&&!a.preventDefault){for(var o in a)n[c](o,d,a[o],m);return this}if(c==="die"&&!a&&g&&g.charAt(0)==="."){n.unbind(g);return this}if(d===!1||f.isFunction(d))e=d||E,d=b;a=(a||"").split(" ");while((h=a[i++])!=null){j=y.exec(h),k="",j&&(k=j[0],h=h.replace(y,""));if(h==="hover"){a.push("mouseenter"+k,"mouseleave"+k);continue}l=h,M[h]?(a.push(M[h]+k),h=h+k):h=(M[h]||h)+k;if(c==="live")for(var p=0,q=n.length;p<q;p++)f.event.add(n[p],"live."+O(h,m),{data:d,selector:m,handler:e,origType:h,origHandler:e,preType:l});else n.unbind("live."+O(h,m),e)}return this}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.bind(b,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0)}),function(){function u(a,b,c,d,e,f){for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i){var j=!1;i=i[a];while(i){if(i.sizcache===c){j=d[i.sizset];break}if(i.nodeType===1){f||(i.sizcache=c,i.sizset=g);if(typeof b!="string"){if(i===b){j=!0;break}}else if(k.filter(b,[i]).length>0){j=i;break}}i=i[a]}d[g]=j}}}function t(a,b,c,d,e,f){for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i){var j=!1;i=i[a];while(i){if(i.sizcache===c){j=d[i.sizset];break}i.nodeType===1&&!f&&(i.sizcache=c,i.sizset=g);if(i.nodeName.toLowerCase()===b){j=i;break}i=i[a]}d[g]=j}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d=0,e=Object.prototype.toString,g=!1,h=!0,i=/\\/g,j=/\W/;[0,0].sort(function(){h=!1;return 0});var k=function(b,d,f,g){f=f||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return f;var i,j,n,o,q,r,s,t,u=!0,w=k.isXML(d),x=[],y=b;do{a.exec(""),i=a.exec(y);if(i){y=i[3],x.push(i[1]);if(i[2]){o=i[3];break}}}while(i);if(x.length>1&&m.exec(b))if(x.length===2&&l.relative[x[0]])j=v(x[0]+x[1],d);else{j=l.relative[x[0]]?[d]:k(x.shift(),d);while(x.length)b=x.shift(),l.relative[b]&&(b+=x.shift()),j=v(b,j)}else{!g&&x.length>1&&d.nodeType===9&&!w&&l.match.ID.test(x[0])&&!l.match.ID.test(x[x.length-1])&&(q=k.find(x.shift(),d,w),d=q.expr?k.filter(q.expr,q.set)[0]:q.set[0]);if(d){q=g?{expr:x.pop(),set:p(g)}:k.find(x.pop(),x.length===1&&(x[0]==="~"||x[0]==="+")&&d.parentNode?d.parentNode:d,w),j=q.expr?k.filter(q.expr,q.set):q.set,x.length>0?n=p(j):u=!1;while(x.length)r=x.pop(),s=r,l.relative[r]?s=x.pop():r="",s==null&&(s=d),l.relative[r](n,s,w)}else n=x=[]}n||(n=j),n||k.error(r||b);if(e.call(n)==="[object Array]")if(!u)f.push.apply(f,n);else if(d&&d.nodeType===1)for(t=0;n[t]!=null;t++)n[t]&&(n[t]===!0||n[t].nodeType===1&&k.contains(d,n[t]))&&f.push(j[t]);else for(t=0;n[t]!=null;t++)n[t]&&n[t].nodeType===1&&f.push(j[t]);else p(n,f);o&&(k(o,h,f,g),k.uniqueSort(f));return f};k.uniqueSort=function(a){if(r){g=h,a.sort(r);if(g)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},k.matches=function(a,b){return k(a,null,null,b)},k.matchesSelector=function(a,b){return k(b,null,null,[a]).length>0},k.find=function(a,b,c){var d;if(!a)return[];for(var e=0,f=l.order.length;e<f;e++){var g,h=l.order[e];if(g=l.leftMatch[h].exec(a)){var j=g[1];g.splice(1,1);if(j.substr(j.length-1)!=="\\"){g[1]=(g[1]||"").replace(i,""),d=l.find[h](g,b,c);if(d!=null){a=a.replace(l.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},k.filter=function(a,c,d,e){var f,g,h=a,i=[],j=c,m=c&&c[0]&&k.isXML(c[0]);while(a&&c.length){for(var n in l.filter)if((f=l.leftMatch[n].exec(a))!=null&&f[2]){var o,p,q=l.filter[n],r=f[1];g=!1,f.splice(1,1);if(r.substr(r.length-1)==="\\")continue;j===i&&(i=[]);if(l.preFilter[n]){f=l.preFilter[n](f,j,d,i,e,m);if(!f)g=o=!0;else if(f===!0)continue}if(f)for(var s=0;(p=j[s])!=null;s++)if(p){o=q(p,f,s,j);var t=e^!!o;d&&o!=null?t?g=!0:j[s]=!1:t&&(i.push(p),g=!0)}if(o!==b){d||(j=i),a=a.replace(l.match[n],"");if(!g)return[];break}}if(a===h)if(g==null)k.error(a);else break;h=a}return j},k.error=function(a){throw"Syntax error, unrecognized expression: "+a};var l=k.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!j.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&k.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!j.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&k.filter(b,a,!0)}},"":function(a,b,c){var e,f=d++,g=u;typeof b=="string"&&!j.test(b)&&(b=b.toLowerCase(),e=b,g=t),g("parentNode",b,f,a,e,c)},"~":function(a,b,c){var e,f=d++,g=u;typeof b=="string"&&!j.test(b)&&(b=b.toLowerCase(),e=b,g=t),g("previousSibling",b,f,a,e,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(i,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(i,"")},TAG:function(a,b){return a[1].replace(i,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||k.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&k.error(a[0]);a[0]=d++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(i,"");!f&&l.attrMap[g]&&(a[1]=l.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(i,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=k(b[3],null,null,c);else{var g=k.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(l.match.POS.test(b[0])||l.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!k(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=l.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||k.getText([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}k.error(e)},CHILD:function(a,b){var c=b[1],d=a;switch(c){case"only":case"first":while(d=d.previousSibling)if(d.nodeType===1)return!1;if(c==="first")return!0;d=a;case"last":while(d=d.nextSibling)if(d.nodeType===1)return!1;return!0;case"nth":var e=b[2],f=b[3];if(e===1&&f===0)return!0;var g=b[0],h=a.parentNode;if(h&&(h.sizcache!==g||!a.nodeIndex)){var i=0;for(d=h.firstChild;d;d=d.nextSibling)d.nodeType===1&&(d.nodeIndex=++i);h.sizcache=g}var j=a.nodeIndex-f;return e===0?j===0:j%e===0&&j/e>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=l.attrHandle[c]?l.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=l.setFilters[e];if(f)return f(a,c,b,d)}}},m=l.match.POS,n=function(a,b){return"\\"+(b-0+1)};for(var o in l.match)l.match[o]=new RegExp(l.match[o].source+/(?![^\[]*\])(?![^\(]*\))/.source),l.leftMatch[o]=new RegExp(/(^(?:.|\r|\n)*?)/.source+l.match[o].source.replace(/\\(\d+)/g,n));var p=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(q){p=function(a,b){var c=0,d=b||[];if(e.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var f=a.length;c<f;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var r,s;c.documentElement.compareDocumentPosition?r=function(a,b){if(a===b){g=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(r=function(a,b){if(a===b){g=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],h=a.parentNode,i=b.parentNode,j=h;if(h===i)return s(a,b);if(!h)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return s(e[k],f[k]);return k===c?s(a,f[k],-1):s(e[k],b,1)},s=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),k.getText=function(a){var b="",c;for(var d=0;a[d];d++)c=a[d],c.nodeType===3||c.nodeType===4?b+=c.nodeValue:c.nodeType!==8&&(b+=k.getText(c.childNodes));return b},function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(l.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},l.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(l.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(l.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=k,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){k=function(b,e,f,g){e=e||c;if(!g&&!k.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return p(e.getElementsByTagName(b),f);if(h[2]&&l.find.CLASS&&e.getElementsByClassName)return p(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return p([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return p([],f);if(i.id===h[3])return p([i],f)}try{return p(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var m=e,n=e.getAttribute("id"),o=n||d,q=e.parentNode,r=/^\s*[+~]/.test(b);n?o=o.replace(/'/g,"\\$&"):e.setAttribute("id",o),r&&q&&(e=e.parentNode);try{if(!r||q)return p(e.querySelectorAll("[id='"+o+"'] "+b),f)}catch(s){}finally{n||m.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)k[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}k.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!k.isXML(a))try{if(e||!l.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return k(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;l.order.splice(1,0,"CLASS"),l.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?k.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?k.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:k.contains=function(){return!1},k.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var v=function(a,b){var c,d=[],e="",f=b.nodeType?[b]:b;while(c=l.match.PSEUDO.exec(a))e+=c[0],a=a.replace(l.match.PSEUDO,"");a=l.relative[a]?a+"*":a;for(var g=0,h=f.length;g<h;g++)k(a,f[g],d);return k.filter(e,d)};f.find=k,f.expr=k.selectors,f.expr[":"]=f.expr.filters,f.unique=k.uniqueSort,f.text=k.getText,f.isXMLDoc=k.isXML,f.contains=k.contains}();var P=/Until$/,Q=/^(?:parents|prevUntil|prevAll)/,R=/,/,S=/^.[^:#\[\.,]*$/,T=Array.prototype.slice,U=f.expr.match.POS,V={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(X(this,a,!1),"not",a)},filter:function(a){return this.pushStack(X(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h,i,j={},k=1;if(g&&a.length){for(d=0,e=a.length;d<e;d++)i=a[d],j[i]||(j[i]=U.test(i)?f(i,b||this.context):i);while(g&&g.ownerDocument&&g!==b){for(i in j)h=j[i],(h.jquery?h.index(g)>-1:f(g).is(h))&&c.push({selector:i,elem:g,level:k});g=g.parentNode,k++}}return c}var l=U.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(l?l.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a||typeof a=="string")return f.inArray(this[0],a?f(a):this.parent().children());return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(W(c[0])||W(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling(a.parentNode.firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c),g=T.call(arguments);P.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!V[a]?f.unique(e):e,(this.length>1||R.test(d))&&Q.test(a)&&(e=e.reverse());return this.pushStack(e,a,g.join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var Y=/ jQuery\d+="(?:\d+|null)"/g,Z=/^\s+/,$=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,_=/<([\w:]+)/,ba=/<tbody/i,bb=/<|&#?\w+;/,bc=/<(?:script|object|embed|option|style)/i,bd=/checked\s*(?:[^=]|=\s*.checked.)/i,be=/\/(java|ecma)script/i,bf=/^\s*<!(?:\[CDATA\[|\-\-)/,bg={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};bg.optgroup=bg.option,bg.tbody=bg.tfoot=bg.colgroup=bg.caption=bg.thead,bg.th=bg.td,f.support.htmlSerialize||(bg._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){if(f.isFunction(a))return this.each(function(b){var c=f(this);c.text(a.call(this,b,c.text()))});if(typeof a!="object"&&a!==b)return this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a));return f.text(this)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){return this.each(function(){f(this).wrapAll(a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f(arguments[0]);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,f(arguments[0]).toArray());return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){if(a===b)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(Y,""):null;if(typeof a=="string"&&!bc.test(a)&&(f.support.leadingWhitespace||!Z.test(a))&&!bg[(_.exec(a)||["",""])[1].toLowerCase()]){a=a.replace($,"<$1></$2>");try{for(var c=0,d=this.length;c<d;c++)this[c].nodeType===1&&(f.cleanData(this[c].getElementsByTagName("*")),this[c].innerHTML=a)}catch(e){this.empty().append(a)}}else f.isFunction(a)?this.each(function(b){var c=f(this);c.html(a.call(this,b,c.html()))}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bd.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bh(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,bn)}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i=b&&b[0]?b[0].ownerDocument||b[0]:c;a.length===1&&typeof a[0]=="string"&&a[0].length<512&&i===c&&a[0].charAt(0)==="<"&&!bc.test(a[0])&&(f.support.checkClone||!bd.test(a[0]))&&(g=!0,h=f.fragments[a[0]],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean(a,i,e,d)),g&&(f.fragments[a[0]]=h?e:1);return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d=a.cloneNode(!0),e,g,h;if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bj(a,d),e=bk(a),g=bk(d);for(h=0;e[h];++h)bj(e[h],g[h])}if(b){bi(a,d);if(c){e=bk(a),g=bk(d);for(h=0;e[h];++h)bi(e[h],g[h])}}return d},clean:function(a,b,d,e){var g;b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||
b[0]&&b[0].ownerDocument||c);var h=[],i;for(var j=0,k;(k=a[j])!=null;j++){typeof k=="number"&&(k+="");if(!k)continue;if(typeof k=="string")if(!bb.test(k))k=b.createTextNode(k);else{k=k.replace($,"<$1></$2>");var l=(_.exec(k)||["",""])[1].toLowerCase(),m=bg[l]||bg._default,n=m[0],o=b.createElement("div");o.innerHTML=m[1]+k+m[2];while(n--)o=o.lastChild;if(!f.support.tbody){var p=ba.test(k),q=l==="table"&&!p?o.firstChild&&o.firstChild.childNodes:m[1]==="<table>"&&!p?o.childNodes:[];for(i=q.length-1;i>=0;--i)f.nodeName(q[i],"tbody")&&!q[i].childNodes.length&&q[i].parentNode.removeChild(q[i])}!f.support.leadingWhitespace&&Z.test(k)&&o.insertBefore(b.createTextNode(Z.exec(k)[0]),o.firstChild),k=o.childNodes}var r;if(!f.support.appendChecked)if(k[0]&&typeof (r=k.length)=="number")for(i=0;i<r;i++)bm(k[i]);else bm(k);k.nodeType?h.push(k):h=f.merge(h,k)}if(d){g=function(a){return!a.type||be.test(a.type)};for(j=0;h[j];j++)if(e&&f.nodeName(h[j],"script")&&(!h[j].type||h[j].type.toLowerCase()==="text/javascript"))e.push(h[j].parentNode?h[j].parentNode.removeChild(h[j]):h[j]);else{if(h[j].nodeType===1){var s=f.grep(h[j].getElementsByTagName("script"),g);h.splice.apply(h,[j+1,0].concat(s))}d.appendChild(h[j])}}return h},cleanData:function(a){var b,c,d=f.cache,e=f.expando,g=f.event.special,h=f.support.deleteExpando;for(var i=0,j;(j=a[i])!=null;i++){if(j.nodeName&&f.noData[j.nodeName.toLowerCase()])continue;c=j[f.expando];if(c){b=d[c]&&d[c][e];if(b&&b.events){for(var k in b.events)g[k]?f.event.remove(j,k):f.removeEvent(j,k,b.handle);b.handle&&(b.handle.elem=null)}h?delete j[f.expando]:j.removeAttribute&&j.removeAttribute(f.expando),delete d[c]}}}});var bo=/alpha\([^)]*\)/i,bp=/opacity=([^)]*)/,bq=/-([a-z])/ig,br=/([A-Z]|^ms)/g,bs=/^-?\d+(?:px)?$/i,bt=/^-?\d/,bu=/^[+\-]=/,bv=/[^+\-\.\de]+/g,bw={position:"absolute",visibility:"hidden",display:"block"},bx=["Left","Right"],by=["Top","Bottom"],bz,bA,bB,bC=function(a,b){return b.toUpperCase()};f.fn.css=function(a,c){if(arguments.length===2&&c===b)return this;return f.access(this,a,c,!0,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)})},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bz(a,"opacity","opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{zIndex:!0,fontWeight:!0,opacity:!0,zoom:!0,lineHeight:!0,widows:!0,orphans:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d;if(h==="number"&&isNaN(d)||d==null)return;h==="string"&&bu.test(d)&&(d=+d.replace(bv,"")+parseFloat(f.css(a,c))),h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(bz)return bz(a,c)},swap:function(a,b,c){var d={};for(var e in b)d[e]=a.style[e],a.style[e]=b[e];c.call(a);for(e in b)a.style[e]=d[e]},camelCase:function(a){return a.replace(bq,bC)}}),f.curCSS=f.css,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){var e;if(c){a.offsetWidth!==0?e=bD(a,b,d):f.swap(a,bw,function(){e=bD(a,b,d)});if(e<=0){e=bz(a,b,b),e==="0px"&&bB&&(e=bB(a,b,b));if(e!=null)return e===""||e==="auto"?"0px":e}if(e<0||e==null){e=a.style[b];return e===""||e==="auto"?"0px":e}return typeof e=="string"?e:e+"px"}},set:function(a,b){if(!bs.test(b))return b;b=parseFloat(b);if(b>=0)return b+"px"}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return bp.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle;c.zoom=1;var e=f.isNaN(b)?"":"alpha(opacity="+b*100+")",g=d&&d.filter||c.filter||"";c.filter=bo.test(g)?g.replace(bo,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){var c;f.swap(a,{display:"inline-block"},function(){b?c=bz(a,"margin-right","marginRight"):c=a.style.marginRight});return c}})}),c.defaultView&&c.defaultView.getComputedStyle&&(bA=function(a,c){var d,e,g;c=c.replace(br,"-$1").toLowerCase();if(!(e=a.ownerDocument.defaultView))return b;if(g=e.getComputedStyle(a,null))d=g.getPropertyValue(c),d===""&&!f.contains(a.ownerDocument.documentElement,a)&&(d=f.style(a,c));return d}),c.documentElement.currentStyle&&(bB=function(a,b){var c,d=a.currentStyle&&a.currentStyle[b],e=a.runtimeStyle&&a.runtimeStyle[b],f=a.style;!bs.test(d)&&bt.test(d)&&(c=f.left,e&&(a.runtimeStyle.left=a.currentStyle.left),f.left=b==="fontSize"?"1em":d||0,d=f.pixelLeft+"px",f.left=c,e&&(a.runtimeStyle.left=e));return d===""?"auto":d}),bz=bA||bB,f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)});var bE=/%20/g,bF=/\[\]$/,bG=/\r?\n/g,bH=/#.*$/,bI=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bJ=/^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bK=/^(?:about|app|app\-storage|.+\-extension|file|widget):$/,bL=/^(?:GET|HEAD)$/,bM=/^\/\//,bN=/\?/,bO=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bP=/^(?:select|textarea)/i,bQ=/\s+/,bR=/([?&])_=[^&]*/,bS=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bT=f.fn.load,bU={},bV={},bW,bX;try{bW=e.href}catch(bY){bW=c.createElement("a"),bW.href="",bW=bW.href}bX=bS.exec(bW.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bT)return bT.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bO,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bP.test(this.nodeName)||bJ.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bG,"\r\n")}}):{name:b.name,value:c.replace(bG,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.bind(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?f.extend(!0,a,f.ajaxSettings,b):(b=a,a=f.extend(!0,f.ajaxSettings,b));for(var c in{context:1,url:1})c in b?a[c]=b[c]:c in f.ajaxSettings&&(a[c]=f.ajaxSettings[c]);return a},ajaxSettings:{url:bW,isLocal:bK.test(bX[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":"*/*"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML}},ajaxPrefilter:bZ(bU),ajaxTransport:bZ(bV),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a?4:0;var o,r,u,w=l?ca(d,v,l):b,x,y;if(a>=200&&a<300||a===304){if(d.ifModified){if(x=v.getResponseHeader("Last-Modified"))f.lastModified[k]=x;if(y=v.getResponseHeader("Etag"))f.etag[k]=y}if(a===304)c="notmodified",o=!0;else try{r=cb(d,w),c="success",o=!0}catch(z){c="parsererror",u=z}}else{u=c;if(!c||a)c="error",a<0&&(a=0)}v.status=a,v.statusText=c,o?h.resolveWith(e,[r,c,v]):h.rejectWith(e,[v,c,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.resolveWith(e,[v,c]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f._Deferred(),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bI.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.done,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bH,"").replace(bM,bX[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bQ),d.crossDomain==null&&(r=bS.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bX[1]&&r[2]==bX[2]&&(r[3]||(r[1]==="http:"?80:443))==(bX[3]||(bX[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),b$(bU,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bL.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bN.test(d.url)?"&":"?")+d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bR,"$1_="+x);d.url=y+(y===d.url?(bN.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", */*; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=b$(bV,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){status<2?w(-1,z):f.error(z)}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)b_(g,a[g],c,e);return d.join("&").replace(bE,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var cc=f.now(),cd=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+cc++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=b.contentType==="application/x-www-form-urlencoded"&&typeof b.data=="string";if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(cd.test(b.url)||e&&cd.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(cd,l),b.url===j&&(e&&(k=k.replace(cd,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var ce=a.ActiveXObject?function(){for(var a in cg)cg[a](0,1)}:!1,cf=0,cg;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ch()||ci()}:ch,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,ce&&delete cg[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n),m.text=h.responseText;try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++cf,ce&&(cg||(cg={},f(a).unload(ce)),cg[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var cj={},ck,cl,cm=/^(?:toggle|show|hide)$/,cn=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,co,cp=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],cq,cr=a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame||a.oRequestAnimationFrame;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(cu("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),e===""&&f.css(d,"display")==="none"&&f._data(d,"olddisplay",cv(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(cu("hide",3),a,b,c);for(var d=0,e=this.length;d<e;d++)if(this[d].style){var g=f.css(this[d],"display");g!=="none"&&!f._data(this[d],"olddisplay")&&f._data(this[d],"olddisplay",g)}for(d=0;d<e;d++)this[d].style&&(this[d].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(cu("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return this[e.queue===!1?"each":"queue"](function(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]),h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(f.support.inlineBlockNeedsLayout?(j=cv(this.nodeName),j==="inline"?this.style.display="inline-block":(this.style.display="inline",this.style.zoom=1)):this.style.display="inline-block"))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)k=new f.fx(this,b,i),h=a[i],cm.test(h)?k[h==="toggle"?d?"show":"hide":h]():(l=cn.exec(h),m=k.cur(),l?(n=parseFloat(l[2]),o=l[3]||(f.cssNumber[i]?"":"px"),o!=="px"&&(f.style(this,i,(n||1)+o),m=(n||1)/k.cur()*m,f.style(this,i,m+o)),l[1]&&(n=(l[1]==="-="?-1:1)*n+m),k.custom(m,n,o)):k.custom(m,h,""));return!0})},stop:function(a,b){a&&this.queue([]),this.each(function(){var a=f.timers,c=a.length;b||f._unmark(!0,this);while(c--)a[c].elem===this&&(b&&a[c](!0),a.splice(c,1))}),b||this.dequeue();return this}}),f.each({slideDown:cu("show",1),slideUp:cu("hide",1),slideToggle:cu("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default,d.old=d.complete,d.complete=function(a){d.queue!==!1?f.dequeue(this):a!==!1&&f._unmark(this),f.isFunction(d.old)&&d.old.call(this)};return d},easing:{linear:function(a,b,c,d){return c+d*a},swing:function(a,b,c,d){return(-Math.cos(a*Math.PI)/2+.5)*d+c}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,b,c){function h(a){return d.step(a)}var d=this,e=f.fx,g;this.startTime=cq||cs(),this.start=a,this.end=b,this.unit=c||this.unit||(f.cssNumber[this.prop]?"":"px"),this.now=this.start,this.pos=this.state=0,h.elem=this.elem,h()&&f.timers.push(h)&&!co&&(cr?(co=1,g=function(){co&&(cr(g),e.tick())},cr(g)):co=setInterval(e.tick,e.interval))},show:function(){this.options.orig[this.prop]=f.style(this.elem,this.prop),this.options.show=!0,this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b=cq||cs(),c=!0,d=this.elem,e=this.options,g,h;if(a||b>=e.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),e.animatedProperties[this.prop]=!0;for(g in e.animatedProperties)e.animatedProperties[g]!==!0&&(c=!1);if(c){e.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){d.style["overflow"+b]=e.overflow[a]}),e.hide&&f(d).hide();if(e.hide||e.show)for(var i in e.animatedProperties)f.style(d,i,e.orig[i]);e.complete.call(d)}return!1}e.duration==Infinity?this.now=b:(h=b-this.startTime,this.state=h/e.duration,this.pos=f.easing[e.animatedProperties[this.prop]](this.state,h,0,1,e.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){for(var a=f.timers,b=0;b<a.length;++b)a[b]()||a.splice(b--,1);a.length||f.fx.stop()},interval:13,stop:function(){clearInterval(co),co=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=(a.prop==="width"||a.prop==="height"?Math.max(0,a.now):a.now)+a.unit:a.elem[a.prop]=a.now}}}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cw=/^t(?:able|d|h)$/i,cx=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?f.fn.offset=function(a){var b=this[0],c;if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);try{c=b.getBoundingClientRect()}catch(d){}var e=b.ownerDocument,g=e.documentElement;if(!c||!f.contains(g,b))return c?{top:c.top,left:c.left}:{top:0,left:0};var h=e.body,i=cy(e),j=g.clientTop||h.clientTop||0,k=g.clientLeft||h.clientLeft||0,l=i.pageYOffset||f.support.boxModel&&g.scrollTop||h.scrollTop,m=i.pageXOffset||f.support.boxModel&&g.scrollLeft||h.scrollLeft,n=c.top+l-j,o=c.left+m-k;return{top:n,left:o}}:f.fn.offset=function(a){var b=this[0];if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);f.offset.initialize();var c,d=b.offsetParent,e=b,g=b.ownerDocument,h=g.documentElement,i=g.body,j=g.defaultView,k=j?j.getComputedStyle(b,null):b.currentStyle,l=b.offsetTop,m=b.offsetLeft;while((b=b.parentNode)&&b!==i&&b!==h){if(f.offset.supportsFixedPosition&&k.position==="fixed")break;c=j?j.getComputedStyle(b,null):b.currentStyle,l-=b.scrollTop,m-=b.scrollLeft,b===d&&(l+=b.offsetTop,m+=b.offsetLeft,f.offset.doesNotAddBorder&&(!f.offset.doesAddBorderForTableAndCells||!cw.test(b.nodeName))&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),e=d,d=b.offsetParent),f.offset.subtractsBorderForOverflowNotVisible&&c.overflow!=="visible"&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),k=c}if(k.position==="relative"||k.position==="static")l+=i.offsetTop,m+=i.offsetLeft;f.offset.supportsFixedPosition&&k.position==="fixed"&&(l+=Math.max(h.scrollTop,i.scrollTop),m+=Math.max(h.scrollLeft,i.scrollLeft));return{top:l,left:m}},f.offset={initialize:function(){var a=c.body,b=c.createElement("div"),d,e,g,h,i=parseFloat(f.css(a,"marginTop"))||0,j="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";f.extend(b.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"}),b.innerHTML=j,a.insertBefore(b,a.firstChild),d=b.firstChild,e=d.firstChild,h=d.nextSibling.firstChild.firstChild,this.doesNotAddBorder=e.offsetTop!==5,this.doesAddBorderForTableAndCells=h.offsetTop===5,e.style.position="fixed",e.style.top="20px",this.supportsFixedPosition=e.offsetTop===20||e.offsetTop===15,e.style.position=e.style.top="",d.style.overflow="hidden",d.style.position="relative",this.subtractsBorderForOverflowNotVisible=e.offsetTop===-5,this.doesNotIncludeMarginInBodyOffset=a.offsetTop!==i,a.removeChild(b),f.offset.initialize=f.noop},bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.offset.initialize(),f.offset.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=cx.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!cx.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each(["Left","Top"],function(a,c){var d="scroll"+c;f.fn[d]=function(c){var e,g;if(c===b){e=this[0];if(!e)return null;g=cy(e);return g?"pageXOffset"in g?g[a?"pageYOffset":"pageXOffset"]:f.support.boxModel&&g.document.documentElement[d]||g.document.body[d]:e[d]}return this.each(function(){g=cy(this),g?g.scrollTo(a?f(g).scrollLeft():c,a?c:f(g).scrollTop()):this[d]=c})}}),f.each(["Height","Width"],function(a,c){var d=c.toLowerCase();f.fn["inner"+c]=function(){return this[0]?parseFloat(f.css(this[0],d,"padding")):null},f.fn["outer"+c]=function(a){return this[0]?parseFloat(f.css(this[0],d,a?"margin":"border")):null},f.fn[d]=function(a){var e=this[0];if(!e)return a==null?null:this;if(f.isFunction(a))return this.each(function(b){var c=f(this);c[d](a.call(this,b,c[d]()))});if(f.isWindow(e)){var g=e.document.documentElement["client"+c];return e.document.compatMode==="CSS1Compat"&&g||e.document.body["client"+c]||g}if(e.nodeType===9)return Math.max(e.documentElement["client"+c],e.body["scroll"+c],e.documentElement["scroll"+c],e.body["offset"+c],e.documentElement["offset"+c]);if(a===b){var h=f.css(e,d),i=parseFloat(h);return f.isNaN(i)?h:i}return this.css(d,typeof a=="string"?a:a+"px")}}),a.jQuery=a.$=f})(window);/*!
 * jQuery UI 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function(c,j){function k(a){return!c(a).parents().andSelf().filter(function(){return c.curCSS(this,"visibility")==="hidden"||c.expr.filters.hidden(this)}).length}c.ui=c.ui||{};if(!c.ui.version){c.extend(c.ui,{version:"1.8.12",keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,
NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}});c.fn.extend({_focus:c.fn.focus,focus:function(a,b){return typeof a==="number"?this.each(function(){var d=this;setTimeout(function(){c(d).focus();b&&b.call(d)},a)}):this._focus.apply(this,arguments)},scrollParent:function(){var a;a=c.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(c.curCSS(this,
"position",1))&&/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0);return/fixed/.test(this.css("position"))||!a.length?c(document):a},zIndex:function(a){if(a!==j)return this.css("zIndex",a);if(this.length){a=c(this[0]);for(var b;a.length&&a[0]!==document;){b=a.css("position");
if(b==="absolute"||b==="relative"||b==="fixed"){b=parseInt(a.css("zIndex"),10);if(!isNaN(b)&&b!==0)return b}a=a.parent()}}return 0},disableSelection:function(){return this.bind((c.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}});c.each(["Width","Height"],function(a,b){function d(f,g,l,m){c.each(e,function(){g-=parseFloat(c.curCSS(f,"padding"+this,true))||0;if(l)g-=parseFloat(c.curCSS(f,
"border"+this+"Width",true))||0;if(m)g-=parseFloat(c.curCSS(f,"margin"+this,true))||0});return g}var e=b==="Width"?["Left","Right"]:["Top","Bottom"],h=b.toLowerCase(),i={innerWidth:c.fn.innerWidth,innerHeight:c.fn.innerHeight,outerWidth:c.fn.outerWidth,outerHeight:c.fn.outerHeight};c.fn["inner"+b]=function(f){if(f===j)return i["inner"+b].call(this);return this.each(function(){c(this).css(h,d(this,f)+"px")})};c.fn["outer"+b]=function(f,g){if(typeof f!=="number")return i["outer"+b].call(this,f);return this.each(function(){c(this).css(h,
d(this,f,true,g)+"px")})}});c.extend(c.expr[":"],{data:function(a,b,d){return!!c.data(a,d[3])},focusable:function(a){var b=a.nodeName.toLowerCase(),d=c.attr(a,"tabindex");if("area"===b){b=a.parentNode;d=b.name;if(!a.href||!d||b.nodeName.toLowerCase()!=="map")return false;a=c("img[usemap=#"+d+"]")[0];return!!a&&k(a)}return(/input|select|textarea|button|object/.test(b)?!a.disabled:"a"==b?a.href||!isNaN(d):!isNaN(d))&&k(a)},tabbable:function(a){var b=c.attr(a,"tabindex");return(isNaN(b)||b>=0)&&c(a).is(":focusable")}});
c(function(){var a=document.body,b=a.appendChild(b=document.createElement("div"));c.extend(b.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0});c.support.minHeight=b.offsetHeight===100;c.support.selectstart="onselectstart"in b;a.removeChild(b).style.display="none"});c.extend(c.ui,{plugin:{add:function(a,b,d){a=c.ui[a].prototype;for(var e in d){a.plugins[e]=a.plugins[e]||[];a.plugins[e].push([b,d[e]])}},call:function(a,b,d){if((b=a.plugins[b])&&a.element[0].parentNode)for(var e=0;e<b.length;e++)a.options[b[e][0]]&&
b[e][1].apply(a.element,d)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(a,b){if(c(a).css("overflow")==="hidden")return false;b=b&&b==="left"?"scrollLeft":"scrollTop";var d=false;if(a[b]>0)return true;a[b]=1;d=a[b]>0;a[b]=0;return d},isOverAxis:function(a,b,d){return a>b&&a<b+d},isOver:function(a,b,d,e,h,i){return c.ui.isOverAxis(a,d,h)&&c.ui.isOverAxis(b,e,i)}})}})(jQuery);
;/*!
 * jQuery UI Widget 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b,j){if(b.cleanData){var k=b.cleanData;b.cleanData=function(a){for(var c=0,d;(d=a[c])!=null;c++)b(d).triggerHandler("remove");k(a)}}else{var l=b.fn.remove;b.fn.remove=function(a,c){return this.each(function(){if(!c)if(!a||b.filter(a,[this]).length)b("*",this).add([this]).each(function(){b(this).triggerHandler("remove")});return l.call(b(this),a,c)})}}b.widget=function(a,c,d){var e=a.split(".")[0],f;a=a.split(".")[1];f=e+"-"+a;if(!d){d=c;c=b.Widget}b.expr[":"][f]=function(h){return!!b.data(h,
a)};b[e]=b[e]||{};b[e][a]=function(h,g){arguments.length&&this._createWidget(h,g)};c=new c;c.options=b.extend(true,{},c.options);b[e][a].prototype=b.extend(true,c,{namespace:e,widgetName:a,widgetEventPrefix:b[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);b.widget.bridge(a,b[e][a])};b.widget.bridge=function(a,c){b.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),h=this;d=!e&&f.length?b.extend.apply(null,[true,d].concat(f)):d;if(e&&d.charAt(0)==="_")return h;
e?this.each(function(){var g=b.data(this,a),i=g&&b.isFunction(g[d])?g[d].apply(g,f):g;if(i!==g&&i!==j){h=i;return false}}):this.each(function(){var g=b.data(this,a);g?g.option(d||{})._init():b.data(this,a,new c(d,this))});return h}};b.Widget=function(a,c){arguments.length&&this._createWidget(a,c)};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(a,c){b.data(c,this.widgetName,this);this.element=b(c);this.options=b.extend(true,{},this.options,
this._getCreateOptions(),a);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()});this._create();this._trigger("create");this._init()},_getCreateOptions:function(){return b.metadata&&b.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled ui-state-disabled")},
widget:function(){return this.element},option:function(a,c){var d=a;if(arguments.length===0)return b.extend({},this.options);if(typeof a==="string"){if(c===j)return this.options[a];d={};d[a]=c}this._setOptions(d);return this},_setOptions:function(a){var c=this;b.each(a,function(d,e){c._setOption(d,e)});return this},_setOption:function(a,c){this.options[a]=c;if(a==="disabled")this.widget()[c?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",c);return this},
enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(a,c,d){var e=this.options[a];c=b.Event(c);c.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();d=d||{};if(c.originalEvent){a=b.event.props.length;for(var f;a;){f=b.event.props[--a];c[f]=c.originalEvent[f]}}this.element.trigger(c,d);return!(b.isFunction(e)&&e.call(this.element[0],c,d)===false||c.isDefaultPrevented())}}})(jQuery);
;/*!
 * jQuery UI Mouse 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function(b){b.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var a=this;this.element.bind("mousedown."+this.widgetName,function(c){return a._mouseDown(c)}).bind("click."+this.widgetName,function(c){if(true===b.data(c.target,a.widgetName+".preventClickEvent")){b.removeData(c.target,a.widgetName+".preventClickEvent");c.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+this.widgetName)},_mouseDown:function(a){a.originalEvent=
a.originalEvent||{};if(!a.originalEvent.mouseHandled){this._mouseStarted&&this._mouseUp(a);this._mouseDownEvent=a;var c=this,e=a.which==1,f=typeof this.options.cancel=="string"?b(a.target).parents().add(a.target).filter(this.options.cancel).length:false;if(!e||f||!this._mouseCapture(a))return true;this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet)this._mouseDelayTimer=setTimeout(function(){c.mouseDelayMet=true},this.options.delay);if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)){this._mouseStarted=
this._mouseStart(a)!==false;if(!this._mouseStarted){a.preventDefault();return true}}true===b.data(a.target,this.widgetName+".preventClickEvent")&&b.removeData(a.target,this.widgetName+".preventClickEvent");this._mouseMoveDelegate=function(d){return c._mouseMove(d)};this._mouseUpDelegate=function(d){return c._mouseUp(d)};b(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);a.preventDefault();return a.originalEvent.mouseHandled=
true}},_mouseMove:function(a){if(b.browser.msie&&!(document.documentMode>=9)&&!a.button)return this._mouseUp(a);if(this._mouseStarted){this._mouseDrag(a);return a.preventDefault()}if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a))(this._mouseStarted=this._mouseStart(this._mouseDownEvent,a)!==false)?this._mouseDrag(a):this._mouseUp(a);return!this._mouseStarted},_mouseUp:function(a){b(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);
if(this._mouseStarted){this._mouseStarted=false;a.target==this._mouseDownEvent.target&&b.data(a.target,this.widgetName+".preventClickEvent",true);this._mouseStop(a)}return false},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return true}})})(jQuery);
;/*
 * jQuery UI Position 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Position
 */
(function(c){c.ui=c.ui||{};var n=/left|center|right/,o=/top|center|bottom/,t=c.fn.position,u=c.fn.offset;c.fn.position=function(b){if(!b||!b.of)return t.apply(this,arguments);b=c.extend({},b);var a=c(b.of),d=a[0],g=(b.collision||"flip").split(" "),e=b.offset?b.offset.split(" "):[0,0],h,k,j;if(d.nodeType===9){h=a.width();k=a.height();j={top:0,left:0}}else if(d.setTimeout){h=a.width();k=a.height();j={top:a.scrollTop(),left:a.scrollLeft()}}else if(d.preventDefault){b.at="left top";h=k=0;j={top:b.of.pageY,
left:b.of.pageX}}else{h=a.outerWidth();k=a.outerHeight();j=a.offset()}c.each(["my","at"],function(){var f=(b[this]||"").split(" ");if(f.length===1)f=n.test(f[0])?f.concat(["center"]):o.test(f[0])?["center"].concat(f):["center","center"];f[0]=n.test(f[0])?f[0]:"center";f[1]=o.test(f[1])?f[1]:"center";b[this]=f});if(g.length===1)g[1]=g[0];e[0]=parseInt(e[0],10)||0;if(e.length===1)e[1]=e[0];e[1]=parseInt(e[1],10)||0;if(b.at[0]==="right")j.left+=h;else if(b.at[0]==="center")j.left+=h/2;if(b.at[1]==="bottom")j.top+=
k;else if(b.at[1]==="center")j.top+=k/2;j.left+=e[0];j.top+=e[1];return this.each(function(){var f=c(this),l=f.outerWidth(),m=f.outerHeight(),p=parseInt(c.curCSS(this,"marginLeft",true))||0,q=parseInt(c.curCSS(this,"marginTop",true))||0,v=l+p+(parseInt(c.curCSS(this,"marginRight",true))||0),w=m+q+(parseInt(c.curCSS(this,"marginBottom",true))||0),i=c.extend({},j),r;if(b.my[0]==="right")i.left-=l;else if(b.my[0]==="center")i.left-=l/2;if(b.my[1]==="bottom")i.top-=m;else if(b.my[1]==="center")i.top-=
m/2;i.left=Math.round(i.left);i.top=Math.round(i.top);r={left:i.left-p,top:i.top-q};c.each(["left","top"],function(s,x){c.ui.position[g[s]]&&c.ui.position[g[s]][x](i,{targetWidth:h,targetHeight:k,elemWidth:l,elemHeight:m,collisionPosition:r,collisionWidth:v,collisionHeight:w,offset:e,my:b.my,at:b.at})});c.fn.bgiframe&&f.bgiframe();f.offset(c.extend(i,{using:b.using}))})};c.ui.position={fit:{left:function(b,a){var d=c(window);d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();b.left=
d>0?b.left-d:Math.max(b.left-a.collisionPosition.left,b.left)},top:function(b,a){var d=c(window);d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();b.top=d>0?b.top-d:Math.max(b.top-a.collisionPosition.top,b.top)}},flip:{left:function(b,a){if(a.at[0]!=="center"){var d=c(window);d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();var g=a.my[0]==="left"?-a.elemWidth:a.my[0]==="right"?a.elemWidth:0,e=a.at[0]==="left"?a.targetWidth:-a.targetWidth,h=-2*a.offset[0];b.left+=
a.collisionPosition.left<0?g+e+h:d>0?g+e+h:0}},top:function(b,a){if(a.at[1]!=="center"){var d=c(window);d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();var g=a.my[1]==="top"?-a.elemHeight:a.my[1]==="bottom"?a.elemHeight:0,e=a.at[1]==="top"?a.targetHeight:-a.targetHeight,h=-2*a.offset[1];b.top+=a.collisionPosition.top<0?g+e+h:d>0?g+e+h:0}}}};if(!c.offset.setOffset){c.offset.setOffset=function(b,a){if(/static/.test(c.curCSS(b,"position")))b.style.position="relative";var d=c(b),
g=d.offset(),e=parseInt(c.curCSS(b,"top",true),10)||0,h=parseInt(c.curCSS(b,"left",true),10)||0;g={top:a.top-g.top+e,left:a.left-g.left+h};"using"in a?a.using.call(b,g):d.css(g)};c.fn.offset=function(b){var a=this[0];if(!a||!a.ownerDocument)return null;if(b)return this.each(function(){c.offset.setOffset(this,b)});return u.call(this)}}})(jQuery);
;/*
 * jQuery UI Draggable 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.draggable",d.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:true,appendTo:"parent",axis:false,connectToSortable:false,containment:false,cursor:"auto",cursorAt:false,grid:false,handle:false,helper:"original",iframeFix:false,opacity:false,refreshPositions:false,revert:false,revertDuration:500,scope:"default",scroll:true,scrollSensitivity:20,scrollSpeed:20,snap:false,snapMode:"both",snapTolerance:20,stack:false,zIndex:false},_create:function(){if(this.options.helper==
"original"&&!/^(?:r|a|f)/.test(this.element.css("position")))this.element[0].style.position="relative";this.options.addClasses&&this.element.addClass("ui-draggable");this.options.disabled&&this.element.addClass("ui-draggable-disabled");this._mouseInit()},destroy:function(){if(this.element.data("draggable")){this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled");this._mouseDestroy();return this}},_mouseCapture:function(a){var b=
this.options;if(this.helper||b.disabled||d(a.target).is(".ui-resizable-handle"))return false;this.handle=this._getHandle(a);if(!this.handle)return false;return true},_mouseStart:function(a){var b=this.options;this.helper=this._createHelper(a);this._cacheHelperProportions();if(d.ui.ddmanager)d.ui.ddmanager.current=this;this._cacheMargins();this.cssPosition=this.helper.css("position");this.scrollParent=this.helper.scrollParent();this.offset=this.positionAbs=this.element.offset();this.offset={top:this.offset.top-
this.margins.top,left:this.offset.left-this.margins.left};d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this.position=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);b.containment&&this._setContainment();if(this._trigger("start",a)===false){this._clear();return false}this._cacheHelperProportions();
d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.helper.addClass("ui-draggable-dragging");this._mouseDrag(a,true);return true},_mouseDrag:function(a,b){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");if(!b){b=this._uiHash();if(this._trigger("drag",a,b)===false){this._mouseUp({});return false}this.position=b.position}if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||
this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);return false},_mouseStop:function(a){var b=false;if(d.ui.ddmanager&&!this.options.dropBehaviour)b=d.ui.ddmanager.drop(this,a);if(this.dropped){b=this.dropped;this.dropped=false}if((!this.element[0]||!this.element[0].parentNode)&&this.options.helper=="original")return false;if(this.options.revert=="invalid"&&!b||this.options.revert=="valid"&&b||this.options.revert===true||d.isFunction(this.options.revert)&&
this.options.revert.call(this.element,b)){var c=this;d(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){c._trigger("stop",a)!==false&&c._clear()})}else this._trigger("stop",a)!==false&&this._clear();return false},cancel:function(){this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear();return this},_getHandle:function(a){var b=!this.options.handle||!d(this.options.handle,this.element).length?true:false;d(this.options.handle,this.element).find("*").andSelf().each(function(){if(this==
a.target)b=true});return b},_createHelper:function(a){var b=this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a])):b.helper=="clone"?this.element.clone():this.element;a.parents("body").length||a.appendTo(b.appendTo=="parent"?this.element[0].parentNode:b.appendTo);a[0]!=this.element[0]&&!/(fixed|absolute)/.test(a.css("position"))&&a.css("position","absolute");return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||
0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],
this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-
(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),
height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[(a.containment=="document"?0:d(window).scrollLeft())-this.offset.relative.left-this.offset.parent.left,(a.containment=="document"?0:d(window).scrollTop())-this.offset.relative.top-this.offset.parent.top,(a.containment=="document"?0:d(window).scrollLeft())+d(a.containment=="document"?
document:window).width()-this.helperProportions.width-this.margins.left,(a.containment=="document"?0:d(window).scrollTop())+(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)&&a.containment.constructor!=Array){var b=d(a.containment)[0];if(b){a=d(a.containment).offset();var c=d(b).css("overflow")!="hidden";this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),
10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0),a.top+(parseInt(d(b).css("borderTopWidth"),10)||0)+(parseInt(d(b).css("paddingTop"),10)||0),a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),
10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom]}}else if(a.containment.constructor==Array)this.containment=a.containment},_convertPositionTo:function(a,b){if(!b)b=this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName);return{top:b.top+this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&
d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],
this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName),e=a.pageX,g=a.pageY;if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0])e=this.containment[0]+this.offset.click.left;if(a.pageY-this.offset.click.top<this.containment[1])g=this.containment[1]+this.offset.click.top;if(a.pageX-this.offset.click.left>this.containment[2])e=this.containment[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>this.containment[3])g=
this.containment[3]+this.offset.click.top}if(b.grid){g=this.originalPageY+Math.round((g-this.originalPageY)/b.grid[1])*b.grid[1];g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;e=this.originalPageX+Math.round((e-this.originalPageX)/b.grid[0])*b.grid[0];e=this.containment?!(e-this.offset.click.left<this.containment[0]||e-this.offset.click.left>this.containment[2])?
e:!(e-this.offset.click.left<this.containment[0])?e-b.grid[0]:e+b.grid[0]:e}}return{top:g-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop()),left:e-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():
f?0:c.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging");this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove();this.helper=null;this.cancelHelperRemoval=false},_trigger:function(a,b,c){c=c||this._uiHash();d.ui.plugin.call(this,a,[b,c]);if(a=="drag")this.positionAbs=this._convertPositionTo("absolute");return d.Widget.prototype._trigger.call(this,a,b,c)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,
offset:this.positionAbs}}});d.extend(d.ui.draggable,{version:"1.8.12"});d.ui.plugin.add("draggable","connectToSortable",{start:function(a,b){var c=d(this).data("draggable"),f=c.options,e=d.extend({},b,{item:c.element});c.sortables=[];d(f.connectToSortable).each(function(){var g=d.data(this,"sortable");if(g&&!g.options.disabled){c.sortables.push({instance:g,shouldRevert:g.options.revert});g.refreshPositions();g._trigger("activate",a,e)}})},stop:function(a,b){var c=d(this).data("draggable"),f=d.extend({},
b,{item:c.element});d.each(c.sortables,function(){if(this.instance.isOver){this.instance.isOver=0;c.cancelHelperRemoval=true;this.instance.cancelHelperRemoval=false;if(this.shouldRevert)this.instance.options.revert=true;this.instance._mouseStop(a);this.instance.options.helper=this.instance.options._helper;c.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})}else{this.instance.cancelHelperRemoval=false;this.instance._trigger("deactivate",a,f)}})},drag:function(a,b){var c=
d(this).data("draggable"),f=this;d.each(c.sortables,function(){this.instance.positionAbs=c.positionAbs;this.instance.helperProportions=c.helperProportions;this.instance.offset.click=c.offset.click;if(this.instance._intersectsWith(this.instance.containerCache)){if(!this.instance.isOver){this.instance.isOver=1;this.instance.currentItem=d(f).clone().appendTo(this.instance.element).data("sortable-item",true);this.instance.options._helper=this.instance.options.helper;this.instance.options.helper=function(){return b.helper[0]};
a.target=this.instance.currentItem[0];this.instance._mouseCapture(a,true);this.instance._mouseStart(a,true,true);this.instance.offset.click.top=c.offset.click.top;this.instance.offset.click.left=c.offset.click.left;this.instance.offset.parent.left-=c.offset.parent.left-this.instance.offset.parent.left;this.instance.offset.parent.top-=c.offset.parent.top-this.instance.offset.parent.top;c._trigger("toSortable",a);c.dropped=this.instance.element;c.currentItem=c.element;this.instance.fromOutside=c}this.instance.currentItem&&
this.instance._mouseDrag(a)}else if(this.instance.isOver){this.instance.isOver=0;this.instance.cancelHelperRemoval=true;this.instance.options.revert=false;this.instance._trigger("out",a,this.instance._uiHash(this.instance));this.instance._mouseStop(a,true);this.instance.options.helper=this.instance.options._helper;this.instance.currentItem.remove();this.instance.placeholder&&this.instance.placeholder.remove();c._trigger("fromSortable",a);c.dropped=false}})}});d.ui.plugin.add("draggable","cursor",
{start:function(){var a=d("body"),b=d(this).data("draggable").options;if(a.css("cursor"))b._cursor=a.css("cursor");a.css("cursor",b.cursor)},stop:function(){var a=d(this).data("draggable").options;a._cursor&&d("body").css("cursor",a._cursor)}});d.ui.plugin.add("draggable","iframeFix",{start:function(){var a=d(this).data("draggable").options;d(a.iframeFix===true?"iframe":a.iframeFix).each(function(){d('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+
"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1E3}).css(d(this).offset()).appendTo("body")})},stop:function(){d("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)})}});d.ui.plugin.add("draggable","opacity",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("opacity"))b._opacity=a.css("opacity");a.css("opacity",b.opacity)},stop:function(a,b){a=d(this).data("draggable").options;a._opacity&&d(b.helper).css("opacity",
a._opacity)}});d.ui.plugin.add("draggable","scroll",{start:function(){var a=d(this).data("draggable");if(a.scrollParent[0]!=document&&a.scrollParent[0].tagName!="HTML")a.overflowOffset=a.scrollParent.offset()},drag:function(a){var b=d(this).data("draggable"),c=b.options,f=false;if(b.scrollParent[0]!=document&&b.scrollParent[0].tagName!="HTML"){if(!c.axis||c.axis!="x")if(b.overflowOffset.top+b.scrollParent[0].offsetHeight-a.pageY<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop+
c.scrollSpeed;else if(a.pageY-b.overflowOffset.top<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop-c.scrollSpeed;if(!c.axis||c.axis!="y")if(b.overflowOffset.left+b.scrollParent[0].offsetWidth-a.pageX<c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft+c.scrollSpeed;else if(a.pageX-b.overflowOffset.left<c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft-c.scrollSpeed}else{if(!c.axis||c.axis!="x")if(a.pageY-d(document).scrollTop()<
c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()-c.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()+c.scrollSpeed);if(!c.axis||c.axis!="y")if(a.pageX-d(document).scrollLeft()<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()-c.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()+
c.scrollSpeed)}f!==false&&d.ui.ddmanager&&!c.dropBehaviour&&d.ui.ddmanager.prepareOffsets(b,a)}});d.ui.plugin.add("draggable","snap",{start:function(){var a=d(this).data("draggable"),b=a.options;a.snapElements=[];d(b.snap.constructor!=String?b.snap.items||":data(draggable)":b.snap).each(function(){var c=d(this),f=c.offset();this!=a.element[0]&&a.snapElements.push({item:this,width:c.outerWidth(),height:c.outerHeight(),top:f.top,left:f.left})})},drag:function(a,b){for(var c=d(this).data("draggable"),
f=c.options,e=f.snapTolerance,g=b.offset.left,n=g+c.helperProportions.width,m=b.offset.top,o=m+c.helperProportions.height,h=c.snapElements.length-1;h>=0;h--){var i=c.snapElements[h].left,k=i+c.snapElements[h].width,j=c.snapElements[h].top,l=j+c.snapElements[h].height;if(i-e<g&&g<k+e&&j-e<m&&m<l+e||i-e<g&&g<k+e&&j-e<o&&o<l+e||i-e<n&&n<k+e&&j-e<m&&m<l+e||i-e<n&&n<k+e&&j-e<o&&o<l+e){if(f.snapMode!="inner"){var p=Math.abs(j-o)<=e,q=Math.abs(l-m)<=e,r=Math.abs(i-n)<=e,s=Math.abs(k-g)<=e;if(p)b.position.top=
c._convertPositionTo("relative",{top:j-c.helperProportions.height,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:l,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:i-c.helperProportions.width}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:k}).left-c.margins.left}var t=p||q||r||s;if(f.snapMode!="outer"){p=Math.abs(j-m)<=e;q=Math.abs(l-o)<=e;r=Math.abs(i-g)<=e;s=Math.abs(k-n)<=e;if(p)b.position.top=
c._convertPositionTo("relative",{top:j,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:l-c.helperProportions.height,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:i}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:k-c.helperProportions.width}).left-c.margins.left}if(!c.snapElements[h].snapping&&(p||q||r||s||t))c.options.snap.snap&&c.options.snap.snap.call(c.element,a,d.extend(c._uiHash(),
{snapItem:c.snapElements[h].item}));c.snapElements[h].snapping=p||q||r||s||t}else{c.snapElements[h].snapping&&c.options.snap.release&&c.options.snap.release.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[h].item}));c.snapElements[h].snapping=false}}}});d.ui.plugin.add("draggable","stack",{start:function(){var a=d(this).data("draggable").options;a=d.makeArray(d(a.stack)).sort(function(c,f){return(parseInt(d(c).css("zIndex"),10)||0)-(parseInt(d(f).css("zIndex"),10)||0)});if(a.length){var b=
parseInt(a[0].style.zIndex)||0;d(a).each(function(c){this.style.zIndex=b+c});this[0].style.zIndex=b+a.length}}});d.ui.plugin.add("draggable","zIndex",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("zIndex"))b._zIndex=a.css("zIndex");a.css("zIndex",b.zIndex)},stop:function(a,b){a=d(this).data("draggable").options;a._zIndex&&d(b.helper).css("zIndex",a._zIndex)}})})(jQuery);
;/*
 * jQuery UI Droppable 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Droppables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.mouse.js
 *	jquery.ui.draggable.js
 */
(function(d){d.widget("ui.droppable",{widgetEventPrefix:"drop",options:{accept:"*",activeClass:false,addClasses:true,greedy:false,hoverClass:false,scope:"default",tolerance:"intersect"},_create:function(){var a=this.options,b=a.accept;this.isover=0;this.isout=1;this.accept=d.isFunction(b)?b:function(c){return c.is(b)};this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight};d.ui.ddmanager.droppables[a.scope]=d.ui.ddmanager.droppables[a.scope]||[];d.ui.ddmanager.droppables[a.scope].push(this);
a.addClasses&&this.element.addClass("ui-droppable")},destroy:function(){for(var a=d.ui.ddmanager.droppables[this.options.scope],b=0;b<a.length;b++)a[b]==this&&a.splice(b,1);this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable");return this},_setOption:function(a,b){if(a=="accept")this.accept=d.isFunction(b)?b:function(c){return c.is(b)};d.Widget.prototype._setOption.apply(this,arguments)},_activate:function(a){var b=d.ui.ddmanager.current;this.options.activeClass&&
this.element.addClass(this.options.activeClass);b&&this._trigger("activate",a,this.ui(b))},_deactivate:function(a){var b=d.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass);b&&this._trigger("deactivate",a,this.ui(b))},_over:function(a){var b=d.ui.ddmanager.current;if(!(!b||(b.currentItem||b.element)[0]==this.element[0]))if(this.accept.call(this.element[0],b.currentItem||b.element)){this.options.hoverClass&&this.element.addClass(this.options.hoverClass);
this._trigger("over",a,this.ui(b))}},_out:function(a){var b=d.ui.ddmanager.current;if(!(!b||(b.currentItem||b.element)[0]==this.element[0]))if(this.accept.call(this.element[0],b.currentItem||b.element)){this.options.hoverClass&&this.element.removeClass(this.options.hoverClass);this._trigger("out",a,this.ui(b))}},_drop:function(a,b){var c=b||d.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return false;var e=false;this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var g=
d.data(this,"droppable");if(g.options.greedy&&!g.options.disabled&&g.options.scope==c.options.scope&&g.accept.call(g.element[0],c.currentItem||c.element)&&d.ui.intersect(c,d.extend(g,{offset:g.element.offset()}),g.options.tolerance)){e=true;return false}});if(e)return false;if(this.accept.call(this.element[0],c.currentItem||c.element)){this.options.activeClass&&this.element.removeClass(this.options.activeClass);this.options.hoverClass&&this.element.removeClass(this.options.hoverClass);this._trigger("drop",
a,this.ui(c));return this.element}return false},ui:function(a){return{draggable:a.currentItem||a.element,helper:a.helper,position:a.position,offset:a.positionAbs}}});d.extend(d.ui.droppable,{version:"1.8.12"});d.ui.intersect=function(a,b,c){if(!b.offset)return false;var e=(a.positionAbs||a.position.absolute).left,g=e+a.helperProportions.width,f=(a.positionAbs||a.position.absolute).top,h=f+a.helperProportions.height,i=b.offset.left,k=i+b.proportions.width,j=b.offset.top,l=j+b.proportions.height;
switch(c){case "fit":return i<=e&&g<=k&&j<=f&&h<=l;case "intersect":return i<e+a.helperProportions.width/2&&g-a.helperProportions.width/2<k&&j<f+a.helperProportions.height/2&&h-a.helperProportions.height/2<l;case "pointer":return d.ui.isOver((a.positionAbs||a.position.absolute).top+(a.clickOffset||a.offset.click).top,(a.positionAbs||a.position.absolute).left+(a.clickOffset||a.offset.click).left,j,i,b.proportions.height,b.proportions.width);case "touch":return(f>=j&&f<=l||h>=j&&h<=l||f<j&&h>l)&&(e>=
i&&e<=k||g>=i&&g<=k||e<i&&g>k);default:return false}};d.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(a,b){var c=d.ui.ddmanager.droppables[a.options.scope]||[],e=b?b.type:null,g=(a.currentItem||a.element).find(":data(droppable)").andSelf(),f=0;a:for(;f<c.length;f++)if(!(c[f].options.disabled||a&&!c[f].accept.call(c[f].element[0],a.currentItem||a.element))){for(var h=0;h<g.length;h++)if(g[h]==c[f].element[0]){c[f].proportions.height=0;continue a}c[f].visible=c[f].element.css("display")!=
"none";if(c[f].visible){e=="mousedown"&&c[f]._activate.call(c[f],b);c[f].offset=c[f].element.offset();c[f].proportions={width:c[f].element[0].offsetWidth,height:c[f].element[0].offsetHeight}}}},drop:function(a,b){var c=false;d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(this.options){if(!this.options.disabled&&this.visible&&d.ui.intersect(a,this,this.options.tolerance))c=c||this._drop.call(this,b);if(!this.options.disabled&&this.visible&&this.accept.call(this.element[0],a.currentItem||
a.element)){this.isout=1;this.isover=0;this._deactivate.call(this,b)}}});return c},drag:function(a,b){a.options.refreshPositions&&d.ui.ddmanager.prepareOffsets(a,b);d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(!(this.options.disabled||this.greedyChild||!this.visible)){var c=d.ui.intersect(a,this,this.options.tolerance);if(c=!c&&this.isover==1?"isout":c&&this.isover==0?"isover":null){var e;if(this.options.greedy){var g=this.element.parents(":data(droppable):eq(0)");if(g.length){e=
d.data(g[0],"droppable");e.greedyChild=c=="isover"?1:0}}if(e&&c=="isover"){e.isover=0;e.isout=1;e._out.call(e,b)}this[c]=1;this[c=="isout"?"isover":"isout"]=0;this[c=="isover"?"_over":"_out"].call(this,b);if(e&&c=="isout"){e.isout=0;e.isover=1;e._over.call(e,b)}}}})}}})(jQuery);
;/*
 * jQuery UI Resizable 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Resizables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(e){e.widget("ui.resizable",e.ui.mouse,{widgetEventPrefix:"resize",options:{alsoResize:false,animate:false,animateDuration:"slow",animateEasing:"swing",aspectRatio:false,autoHide:false,containment:false,ghost:false,grid:false,handles:"e,s,se",helper:false,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1E3},_create:function(){var b=this,a=this.options;this.element.addClass("ui-resizable");e.extend(this,{_aspectRatio:!!a.aspectRatio,aspectRatio:a.aspectRatio,originalElement:this.element,
_proportionallyResizeElements:[],_helper:a.helper||a.ghost||a.animate?a.helper||"ui-resizable-helper":null});if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)){/relative/.test(this.element.css("position"))&&e.browser.opera&&this.element.css({position:"relative",top:"auto",left:"auto"});this.element.wrap(e('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),
top:this.element.css("top"),left:this.element.css("left")}));this.element=this.element.parent().data("resizable",this.element.data("resizable"));this.elementIsWrapper=true;this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")});this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0});this.originalResizeStyle=
this.originalElement.css("resize");this.originalElement.css("resize","none");this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"}));this.originalElement.css({margin:this.originalElement.css("margin")});this._proportionallyResize()}this.handles=a.handles||(!e(".ui-resizable-handle",this.element).length?"e,s,se":{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",
nw:".ui-resizable-nw"});if(this.handles.constructor==String){if(this.handles=="all")this.handles="n,e,s,w,se,sw,ne,nw";var c=this.handles.split(",");this.handles={};for(var d=0;d<c.length;d++){var f=e.trim(c[d]),g=e('<div class="ui-resizable-handle '+("ui-resizable-"+f)+'"></div>');/sw|se|ne|nw/.test(f)&&g.css({zIndex:++a.zIndex});"se"==f&&g.addClass("ui-icon ui-icon-gripsmall-diagonal-se");this.handles[f]=".ui-resizable-"+f;this.element.append(g)}}this._renderAxis=function(h){h=h||this.element;for(var i in this.handles){if(this.handles[i].constructor==
String)this.handles[i]=e(this.handles[i],this.element).show();if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var j=e(this.handles[i],this.element),k=0;k=/sw|ne|nw|se|n|s/.test(i)?j.outerHeight():j.outerWidth();j=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join("");h.css(j,k);this._proportionallyResize()}e(this.handles[i])}};this._renderAxis(this.element);this._handles=e(".ui-resizable-handle",this.element).disableSelection();
this._handles.mouseover(function(){if(!b.resizing){if(this.className)var h=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);b.axis=h&&h[1]?h[1]:"se"}});if(a.autoHide){this._handles.hide();e(this.element).addClass("ui-resizable-autohide").hover(function(){e(this).removeClass("ui-resizable-autohide");b._handles.show()},function(){if(!b.resizing){e(this).addClass("ui-resizable-autohide");b._handles.hide()}})}this._mouseInit()},destroy:function(){this._mouseDestroy();var b=function(c){e(c).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};
if(this.elementIsWrapper){b(this.element);var a=this.element;a.after(this.originalElement.css({position:a.css("position"),width:a.outerWidth(),height:a.outerHeight(),top:a.css("top"),left:a.css("left")})).remove()}this.originalElement.css("resize",this.originalResizeStyle);b(this.originalElement);return this},_mouseCapture:function(b){var a=false;for(var c in this.handles)if(e(this.handles[c])[0]==b.target)a=true;return!this.options.disabled&&a},_mouseStart:function(b){var a=this.options,c=this.element.position(),
d=this.element;this.resizing=true;this.documentScroll={top:e(document).scrollTop(),left:e(document).scrollLeft()};if(d.is(".ui-draggable")||/absolute/.test(d.css("position")))d.css({position:"absolute",top:c.top,left:c.left});e.browser.opera&&/relative/.test(d.css("position"))&&d.css({position:"relative",top:"auto",left:"auto"});this._renderProxy();c=m(this.helper.css("left"));var f=m(this.helper.css("top"));if(a.containment){c+=e(a.containment).scrollLeft()||0;f+=e(a.containment).scrollTop()||0}this.offset=
this.helper.offset();this.position={left:c,top:f};this.size=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalSize=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalPosition={left:c,top:f};this.sizeDiff={width:d.outerWidth()-d.width(),height:d.outerHeight()-d.height()};this.originalMousePosition={left:b.pageX,top:b.pageY};this.aspectRatio=typeof a.aspectRatio=="number"?a.aspectRatio:
this.originalSize.width/this.originalSize.height||1;a=e(".ui-resizable-"+this.axis).css("cursor");e("body").css("cursor",a=="auto"?this.axis+"-resize":a);d.addClass("ui-resizable-resizing");this._propagate("start",b);return true},_mouseDrag:function(b){var a=this.helper,c=this.originalMousePosition,d=this._change[this.axis];if(!d)return false;c=d.apply(this,[b,b.pageX-c.left||0,b.pageY-c.top||0]);if(this._aspectRatio||b.shiftKey)c=this._updateRatio(c,b);c=this._respectSize(c,b);this._propagate("resize",
b);a.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"});!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize();this._updateCache(c);this._trigger("resize",b,this.ui());return false},_mouseStop:function(b){this.resizing=false;var a=this.options,c=this;if(this._helper){var d=this._proportionallyResizeElements,f=d.length&&/textarea/i.test(d[0].nodeName);d=f&&e.ui.hasScroll(d[0],"left")?0:c.sizeDiff.height;
f=f?0:c.sizeDiff.width;f={width:c.helper.width()-f,height:c.helper.height()-d};d=parseInt(c.element.css("left"),10)+(c.position.left-c.originalPosition.left)||null;var g=parseInt(c.element.css("top"),10)+(c.position.top-c.originalPosition.top)||null;a.animate||this.element.css(e.extend(f,{top:g,left:d}));c.helper.height(c.size.height);c.helper.width(c.size.width);this._helper&&!a.animate&&this._proportionallyResize()}e("body").css("cursor","auto");this.element.removeClass("ui-resizable-resizing");
this._propagate("stop",b);this._helper&&this.helper.remove();return false},_updateCache:function(b){this.offset=this.helper.offset();if(l(b.left))this.position.left=b.left;if(l(b.top))this.position.top=b.top;if(l(b.height))this.size.height=b.height;if(l(b.width))this.size.width=b.width},_updateRatio:function(b){var a=this.position,c=this.size,d=this.axis;if(b.height)b.width=c.height*this.aspectRatio;else if(b.width)b.height=c.width/this.aspectRatio;if(d=="sw"){b.left=a.left+(c.width-b.width);b.top=
null}if(d=="nw"){b.top=a.top+(c.height-b.height);b.left=a.left+(c.width-b.width)}return b},_respectSize:function(b){var a=this.options,c=this.axis,d=l(b.width)&&a.maxWidth&&a.maxWidth<b.width,f=l(b.height)&&a.maxHeight&&a.maxHeight<b.height,g=l(b.width)&&a.minWidth&&a.minWidth>b.width,h=l(b.height)&&a.minHeight&&a.minHeight>b.height;if(g)b.width=a.minWidth;if(h)b.height=a.minHeight;if(d)b.width=a.maxWidth;if(f)b.height=a.maxHeight;var i=this.originalPosition.left+this.originalSize.width,j=this.position.top+
this.size.height,k=/sw|nw|w/.test(c);c=/nw|ne|n/.test(c);if(g&&k)b.left=i-a.minWidth;if(d&&k)b.left=i-a.maxWidth;if(h&&c)b.top=j-a.minHeight;if(f&&c)b.top=j-a.maxHeight;if((a=!b.width&&!b.height)&&!b.left&&b.top)b.top=null;else if(a&&!b.top&&b.left)b.left=null;return b},_proportionallyResize:function(){if(this._proportionallyResizeElements.length)for(var b=this.helper||this.element,a=0;a<this._proportionallyResizeElements.length;a++){var c=this._proportionallyResizeElements[a];if(!this.borderDif){var d=
[c.css("borderTopWidth"),c.css("borderRightWidth"),c.css("borderBottomWidth"),c.css("borderLeftWidth")],f=[c.css("paddingTop"),c.css("paddingRight"),c.css("paddingBottom"),c.css("paddingLeft")];this.borderDif=e.map(d,function(g,h){g=parseInt(g,10)||0;h=parseInt(f[h],10)||0;return g+h})}e.browser.msie&&(e(b).is(":hidden")||e(b).parents(":hidden").length)||c.css({height:b.height()-this.borderDif[0]-this.borderDif[2]||0,width:b.width()-this.borderDif[1]-this.borderDif[3]||0})}},_renderProxy:function(){var b=
this.options;this.elementOffset=this.element.offset();if(this._helper){this.helper=this.helper||e('<div style="overflow:hidden;"></div>');var a=e.browser.msie&&e.browser.version<7,c=a?1:0;a=a?2:-1;this.helper.addClass(this._helper).css({width:this.element.outerWidth()+a,height:this.element.outerHeight()+a,position:"absolute",left:this.elementOffset.left-c+"px",top:this.elementOffset.top-c+"px",zIndex:++b.zIndex});this.helper.appendTo("body").disableSelection()}else this.helper=this.element},_change:{e:function(b,
a){return{width:this.originalSize.width+a}},w:function(b,a){return{left:this.originalPosition.left+a,width:this.originalSize.width-a}},n:function(b,a,c){return{top:this.originalPosition.top+c,height:this.originalSize.height-c}},s:function(b,a,c){return{height:this.originalSize.height+c}},se:function(b,a,c){return e.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},sw:function(b,a,c){return e.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[b,a,
c]))},ne:function(b,a,c){return e.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},nw:function(b,a,c){return e.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[b,a,c]))}},_propagate:function(b,a){e.ui.plugin.call(this,b,[a,this.ui()]);b!="resize"&&this._trigger(b,a,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,
originalPosition:this.originalPosition}}});e.extend(e.ui.resizable,{version:"1.8.12"});e.ui.plugin.add("resizable","alsoResize",{start:function(){var b=e(this).data("resizable").options,a=function(c){e(c).each(function(){var d=e(this);d.data("resizable-alsoresize",{width:parseInt(d.width(),10),height:parseInt(d.height(),10),left:parseInt(d.css("left"),10),top:parseInt(d.css("top"),10),position:d.css("position")})})};if(typeof b.alsoResize=="object"&&!b.alsoResize.parentNode)if(b.alsoResize.length){b.alsoResize=
b.alsoResize[0];a(b.alsoResize)}else e.each(b.alsoResize,function(c){a(c)});else a(b.alsoResize)},resize:function(b,a){var c=e(this).data("resizable");b=c.options;var d=c.originalSize,f=c.originalPosition,g={height:c.size.height-d.height||0,width:c.size.width-d.width||0,top:c.position.top-f.top||0,left:c.position.left-f.left||0},h=function(i,j){e(i).each(function(){var k=e(this),q=e(this).data("resizable-alsoresize"),p={},r=j&&j.length?j:k.parents(a.originalElement[0]).length?["width","height"]:["width",
"height","top","left"];e.each(r,function(n,o){if((n=(q[o]||0)+(g[o]||0))&&n>=0)p[o]=n||null});if(e.browser.opera&&/relative/.test(k.css("position"))){c._revertToRelativePosition=true;k.css({position:"absolute",top:"auto",left:"auto"})}k.css(p)})};typeof b.alsoResize=="object"&&!b.alsoResize.nodeType?e.each(b.alsoResize,function(i,j){h(i,j)}):h(b.alsoResize)},stop:function(){var b=e(this).data("resizable"),a=b.options,c=function(d){e(d).each(function(){var f=e(this);f.css({position:f.data("resizable-alsoresize").position})})};
if(b._revertToRelativePosition){b._revertToRelativePosition=false;typeof a.alsoResize=="object"&&!a.alsoResize.nodeType?e.each(a.alsoResize,function(d){c(d)}):c(a.alsoResize)}e(this).removeData("resizable-alsoresize")}});e.ui.plugin.add("resizable","animate",{stop:function(b){var a=e(this).data("resizable"),c=a.options,d=a._proportionallyResizeElements,f=d.length&&/textarea/i.test(d[0].nodeName),g=f&&e.ui.hasScroll(d[0],"left")?0:a.sizeDiff.height;f={width:a.size.width-(f?0:a.sizeDiff.width),height:a.size.height-
g};g=parseInt(a.element.css("left"),10)+(a.position.left-a.originalPosition.left)||null;var h=parseInt(a.element.css("top"),10)+(a.position.top-a.originalPosition.top)||null;a.element.animate(e.extend(f,h&&g?{top:h,left:g}:{}),{duration:c.animateDuration,easing:c.animateEasing,step:function(){var i={width:parseInt(a.element.css("width"),10),height:parseInt(a.element.css("height"),10),top:parseInt(a.element.css("top"),10),left:parseInt(a.element.css("left"),10)};d&&d.length&&e(d[0]).css({width:i.width,
height:i.height});a._updateCache(i);a._propagate("resize",b)}})}});e.ui.plugin.add("resizable","containment",{start:function(){var b=e(this).data("resizable"),a=b.element,c=b.options.containment;if(a=c instanceof e?c.get(0):/parent/.test(c)?a.parent().get(0):c){b.containerElement=e(a);if(/document/.test(c)||c==document){b.containerOffset={left:0,top:0};b.containerPosition={left:0,top:0};b.parentData={element:e(document),left:0,top:0,width:e(document).width(),height:e(document).height()||document.body.parentNode.scrollHeight}}else{var d=
e(a),f=[];e(["Top","Right","Left","Bottom"]).each(function(i,j){f[i]=m(d.css("padding"+j))});b.containerOffset=d.offset();b.containerPosition=d.position();b.containerSize={height:d.innerHeight()-f[3],width:d.innerWidth()-f[1]};c=b.containerOffset;var g=b.containerSize.height,h=b.containerSize.width;h=e.ui.hasScroll(a,"left")?a.scrollWidth:h;g=e.ui.hasScroll(a)?a.scrollHeight:g;b.parentData={element:a,left:c.left,top:c.top,width:h,height:g}}}},resize:function(b){var a=e(this).data("resizable"),c=a.options,
d=a.containerOffset,f=a.position;b=a._aspectRatio||b.shiftKey;var g={top:0,left:0},h=a.containerElement;if(h[0]!=document&&/static/.test(h.css("position")))g=d;if(f.left<(a._helper?d.left:0)){a.size.width+=a._helper?a.position.left-d.left:a.position.left-g.left;if(b)a.size.height=a.size.width/c.aspectRatio;a.position.left=c.helper?d.left:0}if(f.top<(a._helper?d.top:0)){a.size.height+=a._helper?a.position.top-d.top:a.position.top;if(b)a.size.width=a.size.height*c.aspectRatio;a.position.top=a._helper?
d.top:0}a.offset.left=a.parentData.left+a.position.left;a.offset.top=a.parentData.top+a.position.top;c=Math.abs((a._helper?a.offset.left-g.left:a.offset.left-g.left)+a.sizeDiff.width);d=Math.abs((a._helper?a.offset.top-g.top:a.offset.top-d.top)+a.sizeDiff.height);f=a.containerElement.get(0)==a.element.parent().get(0);g=/relative|absolute/.test(a.containerElement.css("position"));if(f&&g)c-=a.parentData.left;if(c+a.size.width>=a.parentData.width){a.size.width=a.parentData.width-c;if(b)a.size.height=
a.size.width/a.aspectRatio}if(d+a.size.height>=a.parentData.height){a.size.height=a.parentData.height-d;if(b)a.size.width=a.size.height*a.aspectRatio}},stop:function(){var b=e(this).data("resizable"),a=b.options,c=b.containerOffset,d=b.containerPosition,f=b.containerElement,g=e(b.helper),h=g.offset(),i=g.outerWidth()-b.sizeDiff.width;g=g.outerHeight()-b.sizeDiff.height;b._helper&&!a.animate&&/relative/.test(f.css("position"))&&e(this).css({left:h.left-d.left-c.left,width:i,height:g});b._helper&&!a.animate&&
/static/.test(f.css("position"))&&e(this).css({left:h.left-d.left-c.left,width:i,height:g})}});e.ui.plugin.add("resizable","ghost",{start:function(){var b=e(this).data("resizable"),a=b.options,c=b.size;b.ghost=b.originalElement.clone();b.ghost.css({opacity:0.25,display:"block",position:"relative",height:c.height,width:c.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof a.ghost=="string"?a.ghost:"");b.ghost.appendTo(b.helper)},resize:function(){var b=e(this).data("resizable");
b.ghost&&b.ghost.css({position:"relative",height:b.size.height,width:b.size.width})},stop:function(){var b=e(this).data("resizable");b.ghost&&b.helper&&b.helper.get(0).removeChild(b.ghost.get(0))}});e.ui.plugin.add("resizable","grid",{resize:function(){var b=e(this).data("resizable"),a=b.options,c=b.size,d=b.originalSize,f=b.originalPosition,g=b.axis;a.grid=typeof a.grid=="number"?[a.grid,a.grid]:a.grid;var h=Math.round((c.width-d.width)/(a.grid[0]||1))*(a.grid[0]||1);a=Math.round((c.height-d.height)/
(a.grid[1]||1))*(a.grid[1]||1);if(/^(se|s|e)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a}else if(/^(ne)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a;b.position.top=f.top-a}else{if(/^(sw)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a}else{b.size.width=d.width+h;b.size.height=d.height+a;b.position.top=f.top-a}b.position.left=f.left-h}}});var m=function(b){return parseInt(b,10)||0},l=function(b){return!isNaN(parseInt(b,10))}})(jQuery);
;/*
 * jQuery UI Selectable 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Selectables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(e){e.widget("ui.selectable",e.ui.mouse,{options:{appendTo:"body",autoRefresh:true,distance:0,filter:"*",tolerance:"touch"},_create:function(){var c=this;this.element.addClass("ui-selectable");this.dragged=false;var f;this.refresh=function(){f=e(c.options.filter,c.element[0]);f.each(function(){var d=e(this),b=d.offset();e.data(this,"selectable-item",{element:this,$element:d,left:b.left,top:b.top,right:b.left+d.outerWidth(),bottom:b.top+d.outerHeight(),startselected:false,selected:d.hasClass("ui-selected"),
selecting:d.hasClass("ui-selecting"),unselecting:d.hasClass("ui-unselecting")})})};this.refresh();this.selectees=f.addClass("ui-selectee");this._mouseInit();this.helper=e("<div class='ui-selectable-helper'></div>")},destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item");this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable");this._mouseDestroy();return this},_mouseStart:function(c){var f=this;this.opos=[c.pageX,
c.pageY];if(!this.options.disabled){var d=this.options;this.selectees=e(d.filter,this.element[0]);this._trigger("start",c);e(d.appendTo).append(this.helper);this.helper.css({left:c.clientX,top:c.clientY,width:0,height:0});d.autoRefresh&&this.refresh();this.selectees.filter(".ui-selected").each(function(){var b=e.data(this,"selectable-item");b.startselected=true;if(!c.metaKey){b.$element.removeClass("ui-selected");b.selected=false;b.$element.addClass("ui-unselecting");b.unselecting=true;f._trigger("unselecting",
c,{unselecting:b.element})}});e(c.target).parents().andSelf().each(function(){var b=e.data(this,"selectable-item");if(b){var g=!c.metaKey||!b.$element.hasClass("ui-selected");b.$element.removeClass(g?"ui-unselecting":"ui-selected").addClass(g?"ui-selecting":"ui-unselecting");b.unselecting=!g;b.selecting=g;(b.selected=g)?f._trigger("selecting",c,{selecting:b.element}):f._trigger("unselecting",c,{unselecting:b.element});return false}})}},_mouseDrag:function(c){var f=this;this.dragged=true;if(!this.options.disabled){var d=
this.options,b=this.opos[0],g=this.opos[1],h=c.pageX,i=c.pageY;if(b>h){var j=h;h=b;b=j}if(g>i){j=i;i=g;g=j}this.helper.css({left:b,top:g,width:h-b,height:i-g});this.selectees.each(function(){var a=e.data(this,"selectable-item");if(!(!a||a.element==f.element[0])){var k=false;if(d.tolerance=="touch")k=!(a.left>h||a.right<b||a.top>i||a.bottom<g);else if(d.tolerance=="fit")k=a.left>b&&a.right<h&&a.top>g&&a.bottom<i;if(k){if(a.selected){a.$element.removeClass("ui-selected");a.selected=false}if(a.unselecting){a.$element.removeClass("ui-unselecting");
a.unselecting=false}if(!a.selecting){a.$element.addClass("ui-selecting");a.selecting=true;f._trigger("selecting",c,{selecting:a.element})}}else{if(a.selecting)if(c.metaKey&&a.startselected){a.$element.removeClass("ui-selecting");a.selecting=false;a.$element.addClass("ui-selected");a.selected=true}else{a.$element.removeClass("ui-selecting");a.selecting=false;if(a.startselected){a.$element.addClass("ui-unselecting");a.unselecting=true}f._trigger("unselecting",c,{unselecting:a.element})}if(a.selected)if(!c.metaKey&&
!a.startselected){a.$element.removeClass("ui-selected");a.selected=false;a.$element.addClass("ui-unselecting");a.unselecting=true;f._trigger("unselecting",c,{unselecting:a.element})}}}});return false}},_mouseStop:function(c){var f=this;this.dragged=false;e(".ui-unselecting",this.element[0]).each(function(){var d=e.data(this,"selectable-item");d.$element.removeClass("ui-unselecting");d.unselecting=false;d.startselected=false;f._trigger("unselected",c,{unselected:d.element})});e(".ui-selecting",this.element[0]).each(function(){var d=
e.data(this,"selectable-item");d.$element.removeClass("ui-selecting").addClass("ui-selected");d.selecting=false;d.selected=true;d.startselected=true;f._trigger("selected",c,{selected:d.element})});this._trigger("stop",c);this.helper.remove();return false}});e.extend(e.ui.selectable,{version:"1.8.12"})})(jQuery);
;/*
 * jQuery UI Sortable 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.sortable",d.ui.mouse,{widgetEventPrefix:"sort",options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1E3},_create:function(){this.containerCache={};this.element.addClass("ui-sortable");
this.refresh();this.floating=this.items.length?/left|right/.test(this.items[0].item.css("float"))||/inline|table-cell/.test(this.items[0].item.css("display")):false;this.offset=this.element.offset();this._mouseInit()},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");this._mouseDestroy();for(var a=this.items.length-1;a>=0;a--)this.items[a].item.removeData("sortable-item");return this},_setOption:function(a,b){if(a==="disabled"){this.options[a]=
b;this.widget()[b?"addClass":"removeClass"]("ui-sortable-disabled")}else d.Widget.prototype._setOption.apply(this,arguments)},_mouseCapture:function(a,b){if(this.reverting)return false;if(this.options.disabled||this.options.type=="static")return false;this._refreshItems(a);var c=null,e=this;d(a.target).parents().each(function(){if(d.data(this,"sortable-item")==e){c=d(this);return false}});if(d.data(a.target,"sortable-item")==e)c=d(a.target);if(!c)return false;if(this.options.handle&&!b){var f=false;
d(this.options.handle,c).find("*").andSelf().each(function(){if(this==a.target)f=true});if(!f)return false}this.currentItem=c;this._removeCurrentsFromItems();return true},_mouseStart:function(a,b,c){b=this.options;var e=this;this.currentContainer=this;this.refreshPositions();this.helper=this._createHelper(a);this._cacheHelperProportions();this._cacheMargins();this.scrollParent=this.helper.scrollParent();this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-
this.margins.left};this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};
this.helper[0]!=this.currentItem[0]&&this.currentItem.hide();this._createPlaceholder();b.containment&&this._setContainment();if(b.cursor){if(d("body").css("cursor"))this._storedCursor=d("body").css("cursor");d("body").css("cursor",b.cursor)}if(b.opacity){if(this.helper.css("opacity"))this._storedOpacity=this.helper.css("opacity");this.helper.css("opacity",b.opacity)}if(b.zIndex){if(this.helper.css("zIndex"))this._storedZIndex=this.helper.css("zIndex");this.helper.css("zIndex",b.zIndex)}if(this.scrollParent[0]!=
document&&this.scrollParent[0].tagName!="HTML")this.overflowOffset=this.scrollParent.offset();this._trigger("start",a,this._uiHash());this._preserveHelperProportions||this._cacheHelperProportions();if(!c)for(c=this.containers.length-1;c>=0;c--)this.containers[c]._trigger("activate",a,e._uiHash(this));if(d.ui.ddmanager)d.ui.ddmanager.current=this;d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(a);
return true},_mouseDrag:function(a){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");if(!this.lastPositionAbs)this.lastPositionAbs=this.positionAbs;if(this.options.scroll){var b=this.options,c=false;if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if(this.overflowOffset.top+this.scrollParent[0].offsetHeight-a.pageY<b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop+b.scrollSpeed;else if(a.pageY-this.overflowOffset.top<
b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop-b.scrollSpeed;if(this.overflowOffset.left+this.scrollParent[0].offsetWidth-a.pageX<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft+b.scrollSpeed;else if(a.pageX-this.overflowOffset.left<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft-b.scrollSpeed}else{if(a.pageY-d(document).scrollTop()<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()-
b.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()+b.scrollSpeed);if(a.pageX-d(document).scrollLeft()<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()-b.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()+b.scrollSpeed)}c!==false&&d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,
a)}this.positionAbs=this._convertPositionTo("absolute");if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";for(b=this.items.length-1;b>=0;b--){c=this.items[b];var e=c.item[0],f=this._intersectsWithPointer(c);if(f)if(e!=this.currentItem[0]&&this.placeholder[f==1?"next":"prev"]()[0]!=e&&!d.ui.contains(this.placeholder[0],e)&&(this.options.type=="semi-dynamic"?!d.ui.contains(this.element[0],
e):true)){this.direction=f==1?"down":"up";if(this.options.tolerance=="pointer"||this._intersectsWithSides(c))this._rearrange(a,c);else break;this._trigger("change",a,this._uiHash());break}}this._contactContainers(a);d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);this._trigger("sort",a,this._uiHash());this.lastPositionAbs=this.positionAbs;return false},_mouseStop:function(a,b){if(a){d.ui.ddmanager&&!this.options.dropBehaviour&&d.ui.ddmanager.drop(this,a);if(this.options.revert){var c=this;b=c.placeholder.offset();
c.reverting=true;d(this.helper).animate({left:b.left-this.offset.parent.left-c.margins.left+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollLeft),top:b.top-this.offset.parent.top-c.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){c._clear(a)})}else this._clear(a,b);return false}},cancel:function(){var a=this;if(this.dragging){this._mouseUp({target:null});this.options.helper=="original"?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):
this.currentItem.show();for(var b=this.containers.length-1;b>=0;b--){this.containers[b]._trigger("deactivate",null,a._uiHash(this));if(this.containers[b].containerCache.over){this.containers[b]._trigger("out",null,a._uiHash(this));this.containers[b].containerCache.over=0}}}if(this.placeholder){this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.options.helper!="original"&&this.helper&&this.helper[0].parentNode&&this.helper.remove();d.extend(this,{helper:null,
dragging:false,reverting:false,_noFinalSort:null});this.domPosition.prev?d(this.domPosition.prev).after(this.currentItem):d(this.domPosition.parent).prepend(this.currentItem)}return this},serialize:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};d(b).each(function(){var e=(d(a.item||this).attr(a.attribute||"id")||"").match(a.expression||/(.+)[-=_](.+)/);if(e)c.push((a.key||e[1]+"[]")+"="+(a.key&&a.expression?e[1]:e[2]))});!c.length&&a.key&&c.push(a.key+"=");return c.join("&")},
toArray:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};b.each(function(){c.push(d(a.item||this).attr(a.attribute||"id")||"")});return c},_intersectsWith:function(a){var b=this.positionAbs.left,c=b+this.helperProportions.width,e=this.positionAbs.top,f=e+this.helperProportions.height,g=a.left,h=g+a.width,i=a.top,k=i+a.height,j=this.offset.click.top,l=this.offset.click.left;j=e+j>i&&e+j<k&&b+l>g&&b+l<h;return this.options.tolerance=="pointer"||this.options.forcePointerForContainers||
this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>a[this.floating?"width":"height"]?j:g<b+this.helperProportions.width/2&&c-this.helperProportions.width/2<h&&i<e+this.helperProportions.height/2&&f-this.helperProportions.height/2<k},_intersectsWithPointer:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left,a.width);b=b&&a;a=this._getDragVerticalDirection();
var c=this._getDragHorizontalDirection();if(!b)return false;return this.floating?c&&c=="right"||a=="down"?2:1:a&&(a=="down"?2:1)},_intersectsWithSides:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top+a.height/2,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left+a.width/2,a.width);var c=this._getDragVerticalDirection(),e=this._getDragHorizontalDirection();return this.floating&&e?e=="right"&&a||e=="left"&&!a:c&&(c=="down"&&b||c=="up"&&!b)},
_getDragVerticalDirection:function(){var a=this.positionAbs.top-this.lastPositionAbs.top;return a!=0&&(a>0?"down":"up")},_getDragHorizontalDirection:function(){var a=this.positionAbs.left-this.lastPositionAbs.left;return a!=0&&(a>0?"right":"left")},refresh:function(a){this._refreshItems(a);this.refreshPositions();return this},_connectWith:function(){var a=this.options;return a.connectWith.constructor==String?[a.connectWith]:a.connectWith},_getItemsAsjQuery:function(a){var b=[],c=[],e=this._connectWith();
if(e&&a)for(a=e.length-1;a>=0;a--)for(var f=d(e[a]),g=f.length-1;g>=0;g--){var h=d.data(f[g],"sortable");if(h&&h!=this&&!h.options.disabled)c.push([d.isFunction(h.options.items)?h.options.items.call(h.element):d(h.options.items,h.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),h])}c.push([d.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):d(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),
this]);for(a=c.length-1;a>=0;a--)c[a][0].each(function(){b.push(this)});return d(b)},_removeCurrentsFromItems:function(){for(var a=this.currentItem.find(":data(sortable-item)"),b=0;b<this.items.length;b++)for(var c=0;c<a.length;c++)a[c]==this.items[b].item[0]&&this.items.splice(b,1)},_refreshItems:function(a){this.items=[];this.containers=[this];var b=this.items,c=[[d.isFunction(this.options.items)?this.options.items.call(this.element[0],a,{item:this.currentItem}):d(this.options.items,this.element),
this]],e=this._connectWith();if(e)for(var f=e.length-1;f>=0;f--)for(var g=d(e[f]),h=g.length-1;h>=0;h--){var i=d.data(g[h],"sortable");if(i&&i!=this&&!i.options.disabled){c.push([d.isFunction(i.options.items)?i.options.items.call(i.element[0],a,{item:this.currentItem}):d(i.options.items,i.element),i]);this.containers.push(i)}}for(f=c.length-1;f>=0;f--){a=c[f][1];e=c[f][0];h=0;for(g=e.length;h<g;h++){i=d(e[h]);i.data("sortable-item",a);b.push({item:i,instance:a,width:0,height:0,left:0,top:0})}}},refreshPositions:function(a){if(this.offsetParent&&
this.helper)this.offset.parent=this._getParentOffset();for(var b=this.items.length-1;b>=0;b--){var c=this.items[b];if(!(c.instance!=this.currentContainer&&this.currentContainer&&c.item[0]!=this.currentItem[0])){var e=this.options.toleranceElement?d(this.options.toleranceElement,c.item):c.item;if(!a){c.width=e.outerWidth();c.height=e.outerHeight()}e=e.offset();c.left=e.left;c.top=e.top}}if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(b=
this.containers.length-1;b>=0;b--){e=this.containers[b].element.offset();this.containers[b].containerCache.left=e.left;this.containers[b].containerCache.top=e.top;this.containers[b].containerCache.width=this.containers[b].element.outerWidth();this.containers[b].containerCache.height=this.containers[b].element.outerHeight()}return this},_createPlaceholder:function(a){var b=a||this,c=b.options;if(!c.placeholder||c.placeholder.constructor==String){var e=c.placeholder;c.placeholder={element:function(){var f=
d(document.createElement(b.currentItem[0].nodeName)).addClass(e||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];if(!e)f.style.visibility="hidden";return f},update:function(f,g){if(!(e&&!c.forcePlaceholderSize)){g.height()||g.height(b.currentItem.innerHeight()-parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10));g.width()||g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||
0,10))}}}}b.placeholder=d(c.placeholder.element.call(b.element,b.currentItem));b.currentItem.after(b.placeholder);c.placeholder.update(b,b.placeholder)},_contactContainers:function(a){for(var b=null,c=null,e=this.containers.length-1;e>=0;e--)if(!d.ui.contains(this.currentItem[0],this.containers[e].element[0]))if(this._intersectsWith(this.containers[e].containerCache)){if(!(b&&d.ui.contains(this.containers[e].element[0],b.element[0]))){b=this.containers[e];c=e}}else if(this.containers[e].containerCache.over){this.containers[e]._trigger("out",
a,this._uiHash(this));this.containers[e].containerCache.over=0}if(b)if(this.containers.length===1){this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}else if(this.currentContainer!=this.containers[c]){b=1E4;e=null;for(var f=this.positionAbs[this.containers[c].floating?"left":"top"],g=this.items.length-1;g>=0;g--)if(d.ui.contains(this.containers[c].element[0],this.items[g].item[0])){var h=this.items[g][this.containers[c].floating?"left":"top"];if(Math.abs(h-
f)<b){b=Math.abs(h-f);e=this.items[g]}}if(e||this.options.dropOnEmpty){this.currentContainer=this.containers[c];e?this._rearrange(a,e,null,true):this._rearrange(a,null,this.containers[c].element,true);this._trigger("change",a,this._uiHash());this.containers[c]._trigger("change",a,this._uiHash(this));this.options.placeholder.update(this.currentContainer,this.placeholder);this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}}},_createHelper:function(a){var b=
this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a,this.currentItem])):b.helper=="clone"?this.currentItem.clone():this.currentItem;a.parents("body").length||d(b.appendTo!="parent"?b.appendTo:this.currentItem[0].parentNode)[0].appendChild(a[0]);if(a[0]==this.currentItem[0])this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")};if(a[0].style.width==
""||b.forceHelperSize)a.width(this.currentItem.width());if(a[0].style.height==""||b.forceHelperSize)a.height(this.currentItem.height());return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=
this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a=
{top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.currentItem.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),
10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,d(a.containment=="document"?
document:window).width()-this.helperProportions.width-this.margins.left,(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)){var b=d(a.containment)[0];a=d(a.containment).offset();var c=d(b).css("overflow")!="hidden";this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0)-this.margins.left,a.top+(parseInt(d(b).css("borderTopWidth"),
10)||0)+(parseInt(d(b).css("paddingTop"),10)||0)-this.margins.top,a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}},_convertPositionTo:function(a,b){if(!b)b=
this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);return{top:b.top+this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&
this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0]))this.offset.relative=this._getRelativeOffset();
var f=a.pageX,g=a.pageY;if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0])f=this.containment[0]+this.offset.click.left;if(a.pageY-this.offset.click.top<this.containment[1])g=this.containment[1]+this.offset.click.top;if(a.pageX-this.offset.click.left>this.containment[2])f=this.containment[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>this.containment[3])g=this.containment[3]+this.offset.click.top}if(b.grid){g=this.originalPageY+Math.round((g-
this.originalPageY)/b.grid[1])*b.grid[1];g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;f=this.originalPageX+Math.round((f-this.originalPageX)/b.grid[0])*b.grid[0];f=this.containment?!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:!(f-this.offset.click.left<this.containment[0])?f-b.grid[0]:f+b.grid[0]:f}}return{top:g-
this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())}},_rearrange:function(a,b,c,e){c?c[0].appendChild(this.placeholder[0]):b.item[0].parentNode.insertBefore(this.placeholder[0],
this.direction=="down"?b.item[0]:b.item[0].nextSibling);this.counter=this.counter?++this.counter:1;var f=this,g=this.counter;window.setTimeout(function(){g==f.counter&&f.refreshPositions(!e)},0)},_clear:function(a,b){this.reverting=false;var c=[];!this._noFinalSort&&this.currentItem[0].parentNode&&this.placeholder.before(this.currentItem);this._noFinalSort=null;if(this.helper[0]==this.currentItem[0]){for(var e in this._storedCSS)if(this._storedCSS[e]=="auto"||this._storedCSS[e]=="static")this._storedCSS[e]=
"";this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();this.fromOutside&&!b&&c.push(function(f){this._trigger("receive",f,this._uiHash(this.fromOutside))});if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||this.domPosition.parent!=this.currentItem.parent()[0])&&!b)c.push(function(f){this._trigger("update",f,this._uiHash())});if(!d.ui.contains(this.element[0],this.currentItem[0])){b||c.push(function(f){this._trigger("remove",
f,this._uiHash())});for(e=this.containers.length-1;e>=0;e--)if(d.ui.contains(this.containers[e].element[0],this.currentItem[0])&&!b){c.push(function(f){return function(g){f._trigger("receive",g,this._uiHash(this))}}.call(this,this.containers[e]));c.push(function(f){return function(g){f._trigger("update",g,this._uiHash(this))}}.call(this,this.containers[e]))}}for(e=this.containers.length-1;e>=0;e--){b||c.push(function(f){return function(g){f._trigger("deactivate",g,this._uiHash(this))}}.call(this,
this.containers[e]));if(this.containers[e].containerCache.over){c.push(function(f){return function(g){f._trigger("out",g,this._uiHash(this))}}.call(this,this.containers[e]));this.containers[e].containerCache.over=0}}this._storedCursor&&d("body").css("cursor",this._storedCursor);this._storedOpacity&&this.helper.css("opacity",this._storedOpacity);if(this._storedZIndex)this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex);this.dragging=false;if(this.cancelHelperRemoval){if(!b){this._trigger("beforeStop",
a,this._uiHash());for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}return false}b||this._trigger("beforeStop",a,this._uiHash());this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.helper[0]!=this.currentItem[0]&&this.helper.remove();this.helper=null;if(!b){for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}this.fromOutside=false;return true},_trigger:function(){d.Widget.prototype._trigger.apply(this,arguments)===false&&this.cancel()},
_uiHash:function(a){var b=a||this;return{helper:b.helper,placeholder:b.placeholder||d([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:a?a.element:null}}});d.extend(d.ui.sortable,{version:"1.8.12"})})(jQuery);
;/*
 * jQuery UI Accordion 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(c){c.widget("ui.accordion",{options:{active:0,animated:"slide",autoHeight:true,clearStyle:false,collapsible:false,event:"click",fillSpace:false,header:"> li > :first-child,> :not(li):even",icons:{header:"ui-icon-triangle-1-e",headerSelected:"ui-icon-triangle-1-s"},navigation:false,navigationFilter:function(){return this.href.toLowerCase()===location.href.toLowerCase()}},_create:function(){var a=this,b=a.options;a.running=0;a.element.addClass("ui-accordion ui-widget ui-helper-reset").children("li").addClass("ui-accordion-li-fix");
a.headers=a.element.find(b.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all").bind("mouseenter.accordion",function(){b.disabled||c(this).addClass("ui-state-hover")}).bind("mouseleave.accordion",function(){b.disabled||c(this).removeClass("ui-state-hover")}).bind("focus.accordion",function(){b.disabled||c(this).addClass("ui-state-focus")}).bind("blur.accordion",function(){b.disabled||c(this).removeClass("ui-state-focus")});a.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");
if(b.navigation){var d=a.element.find("a").filter(b.navigationFilter).eq(0);if(d.length){var h=d.closest(".ui-accordion-header");a.active=h.length?h:d.closest(".ui-accordion-content").prev()}}a.active=a._findActive(a.active||b.active).addClass("ui-state-default ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");a.active.next().addClass("ui-accordion-content-active");a._createIcons();a.resize();a.element.attr("role","tablist");a.headers.attr("role","tab").bind("keydown.accordion",
function(f){return a._keydown(f)}).next().attr("role","tabpanel");a.headers.not(a.active||"").attr({"aria-expanded":"false","aria-selected":"false",tabIndex:-1}).next().hide();a.active.length?a.active.attr({"aria-expanded":"true","aria-selected":"true",tabIndex:0}):a.headers.eq(0).attr("tabIndex",0);c.browser.safari||a.headers.find("a").attr("tabIndex",-1);b.event&&a.headers.bind(b.event.split(" ").join(".accordion ")+".accordion",function(f){a._clickHandler.call(a,f,this);f.preventDefault()})},_createIcons:function(){var a=
this.options;if(a.icons){c("<span></span>").addClass("ui-icon "+a.icons.header).prependTo(this.headers);this.active.children(".ui-icon").toggleClass(a.icons.header).toggleClass(a.icons.headerSelected);this.element.addClass("ui-accordion-icons")}},_destroyIcons:function(){this.headers.children(".ui-icon").remove();this.element.removeClass("ui-accordion-icons")},destroy:function(){var a=this.options;this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role");this.headers.unbind(".accordion").removeClass("ui-accordion-header ui-accordion-disabled ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("aria-selected").removeAttr("tabIndex");
this.headers.find("a").removeAttr("tabIndex");this._destroyIcons();var b=this.headers.next().css("display","").removeAttr("role").removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active ui-accordion-disabled ui-state-disabled");if(a.autoHeight||a.fillHeight)b.css("height","");return c.Widget.prototype.destroy.call(this)},_setOption:function(a,b){c.Widget.prototype._setOption.apply(this,arguments);a=="active"&&this.activate(b);if(a=="icons"){this._destroyIcons();
b&&this._createIcons()}if(a=="disabled")this.headers.add(this.headers.next())[b?"addClass":"removeClass"]("ui-accordion-disabled ui-state-disabled")},_keydown:function(a){if(!(this.options.disabled||a.altKey||a.ctrlKey)){var b=c.ui.keyCode,d=this.headers.length,h=this.headers.index(a.target),f=false;switch(a.keyCode){case b.RIGHT:case b.DOWN:f=this.headers[(h+1)%d];break;case b.LEFT:case b.UP:f=this.headers[(h-1+d)%d];break;case b.SPACE:case b.ENTER:this._clickHandler({target:a.target},a.target);
a.preventDefault()}if(f){c(a.target).attr("tabIndex",-1);c(f).attr("tabIndex",0);f.focus();return false}return true}},resize:function(){var a=this.options,b;if(a.fillSpace){if(c.browser.msie){var d=this.element.parent().css("overflow");this.element.parent().css("overflow","hidden")}b=this.element.parent().height();c.browser.msie&&this.element.parent().css("overflow",d);this.headers.each(function(){b-=c(this).outerHeight(true)});this.headers.next().each(function(){c(this).height(Math.max(0,b-c(this).innerHeight()+
c(this).height()))}).css("overflow","auto")}else if(a.autoHeight){b=0;this.headers.next().each(function(){b=Math.max(b,c(this).height("").height())}).height(b)}return this},activate:function(a){this.options.active=a;a=this._findActive(a)[0];this._clickHandler({target:a},a);return this},_findActive:function(a){return a?typeof a==="number"?this.headers.filter(":eq("+a+")"):this.headers.not(this.headers.not(a)):a===false?c([]):this.headers.filter(":eq(0)")},_clickHandler:function(a,b){var d=this.options;
if(!d.disabled)if(a.target){a=c(a.currentTarget||b);b=a[0]===this.active[0];d.active=d.collapsible&&b?false:this.headers.index(a);if(!(this.running||!d.collapsible&&b)){var h=this.active;j=a.next();g=this.active.next();e={options:d,newHeader:b&&d.collapsible?c([]):a,oldHeader:this.active,newContent:b&&d.collapsible?c([]):j,oldContent:g};var f=this.headers.index(this.active[0])>this.headers.index(a[0]);this.active=b?c([]):a;this._toggle(j,g,e,b,f);h.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").children(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);
if(!b){a.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top").children(".ui-icon").removeClass(d.icons.header).addClass(d.icons.headerSelected);a.next().addClass("ui-accordion-content-active")}}}else if(d.collapsible){this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").children(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);this.active.next().addClass("ui-accordion-content-active");var g=this.active.next(),
e={options:d,newHeader:c([]),oldHeader:d.active,newContent:c([]),oldContent:g},j=this.active=c([]);this._toggle(j,g,e)}},_toggle:function(a,b,d,h,f){var g=this,e=g.options;g.toShow=a;g.toHide=b;g.data=d;var j=function(){if(g)return g._completed.apply(g,arguments)};g._trigger("changestart",null,g.data);g.running=b.size()===0?a.size():b.size();if(e.animated){d={};d=e.collapsible&&h?{toShow:c([]),toHide:b,complete:j,down:f,autoHeight:e.autoHeight||e.fillSpace}:{toShow:a,toHide:b,complete:j,down:f,autoHeight:e.autoHeight||
e.fillSpace};if(!e.proxied)e.proxied=e.animated;if(!e.proxiedDuration)e.proxiedDuration=e.duration;e.animated=c.isFunction(e.proxied)?e.proxied(d):e.proxied;e.duration=c.isFunction(e.proxiedDuration)?e.proxiedDuration(d):e.proxiedDuration;h=c.ui.accordion.animations;var i=e.duration,k=e.animated;if(k&&!h[k]&&!c.easing[k])k="slide";h[k]||(h[k]=function(l){this.slide(l,{easing:k,duration:i||700})});h[k](d)}else{if(e.collapsible&&h)a.toggle();else{b.hide();a.show()}j(true)}b.prev().attr({"aria-expanded":"false",
"aria-selected":"false",tabIndex:-1}).blur();a.prev().attr({"aria-expanded":"true","aria-selected":"true",tabIndex:0}).focus()},_completed:function(a){this.running=a?0:--this.running;if(!this.running){this.options.clearStyle&&this.toShow.add(this.toHide).css({height:"",overflow:""});this.toHide.removeClass("ui-accordion-content-active");if(this.toHide.length)this.toHide.parent()[0].className=this.toHide.parent()[0].className;this._trigger("change",null,this.data)}}});c.extend(c.ui.accordion,{version:"1.8.12",
animations:{slide:function(a,b){a=c.extend({easing:"swing",duration:300},a,b);if(a.toHide.size())if(a.toShow.size()){var d=a.toShow.css("overflow"),h=0,f={},g={},e;b=a.toShow;e=b[0].style.width;b.width(parseInt(b.parent().width(),10)-parseInt(b.css("paddingLeft"),10)-parseInt(b.css("paddingRight"),10)-(parseInt(b.css("borderLeftWidth"),10)||0)-(parseInt(b.css("borderRightWidth"),10)||0));c.each(["height","paddingTop","paddingBottom"],function(j,i){g[i]="hide";j=(""+c.css(a.toShow[0],i)).match(/^([\d+-.]+)(.*)$/);
f[i]={value:j[1],unit:j[2]||"px"}});a.toShow.css({height:0,overflow:"hidden"}).show();a.toHide.filter(":hidden").each(a.complete).end().filter(":visible").animate(g,{step:function(j,i){if(i.prop=="height")h=i.end-i.start===0?0:(i.now-i.start)/(i.end-i.start);a.toShow[0].style[i.prop]=h*f[i.prop].value+f[i.prop].unit},duration:a.duration,easing:a.easing,complete:function(){a.autoHeight||a.toShow.css("height","");a.toShow.css({width:e,overflow:d});a.complete()}})}else a.toHide.animate({height:"hide",
paddingTop:"hide",paddingBottom:"hide"},a);else a.toShow.animate({height:"show",paddingTop:"show",paddingBottom:"show"},a)},bounceslide:function(a){this.slide(a,{easing:a.down?"easeOutBounce":"swing",duration:a.down?1E3:200})}}})})(jQuery);
;/*
 * jQuery UI Autocomplete 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Autocomplete
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.position.js
 */
(function(d){var e=0;d.widget("ui.autocomplete",{options:{appendTo:"body",autoFocus:false,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null},pending:0,_create:function(){var a=this,b=this.element[0].ownerDocument,g;this.element.addClass("ui-autocomplete-input").attr("autocomplete","off").attr({role:"textbox","aria-autocomplete":"list","aria-haspopup":"true"}).bind("keydown.autocomplete",function(c){if(!(a.options.disabled||a.element.attr("readonly"))){g=
false;var f=d.ui.keyCode;switch(c.keyCode){case f.PAGE_UP:a._move("previousPage",c);break;case f.PAGE_DOWN:a._move("nextPage",c);break;case f.UP:a._move("previous",c);c.preventDefault();break;case f.DOWN:a._move("next",c);c.preventDefault();break;case f.ENTER:case f.NUMPAD_ENTER:if(a.menu.active){g=true;c.preventDefault()}case f.TAB:if(!a.menu.active)return;a.menu.select(c);break;case f.ESCAPE:a.element.val(a.term);a.close(c);break;default:clearTimeout(a.searching);a.searching=setTimeout(function(){if(a.term!=
a.element.val()){a.selectedItem=null;a.search(null,c)}},a.options.delay);break}}}).bind("keypress.autocomplete",function(c){if(g){g=false;c.preventDefault()}}).bind("focus.autocomplete",function(){if(!a.options.disabled){a.selectedItem=null;a.previous=a.element.val()}}).bind("blur.autocomplete",function(c){if(!a.options.disabled){clearTimeout(a.searching);a.closing=setTimeout(function(){a.close(c);a._change(c)},150)}});this._initSource();this.response=function(){return a._response.apply(a,arguments)};
this.menu=d("<ul></ul>").addClass("ui-autocomplete").appendTo(d(this.options.appendTo||"body",b)[0]).mousedown(function(c){var f=a.menu.element[0];d(c.target).closest(".ui-menu-item").length||setTimeout(function(){d(document).one("mousedown",function(h){h.target!==a.element[0]&&h.target!==f&&!d.ui.contains(f,h.target)&&a.close()})},1);setTimeout(function(){clearTimeout(a.closing)},13)}).menu({focus:function(c,f){f=f.item.data("item.autocomplete");false!==a._trigger("focus",c,{item:f})&&/^key/.test(c.originalEvent.type)&&
a.element.val(f.value)},selected:function(c,f){var h=f.item.data("item.autocomplete"),i=a.previous;if(a.element[0]!==b.activeElement){a.element.focus();a.previous=i;setTimeout(function(){a.previous=i;a.selectedItem=h},1)}false!==a._trigger("select",c,{item:h})&&a.element.val(h.value);a.term=a.element.val();a.close(c);a.selectedItem=h},blur:function(){a.menu.element.is(":visible")&&a.element.val()!==a.term&&a.element.val(a.term)}}).zIndex(this.element.zIndex()+1).css({top:0,left:0}).hide().data("menu");
d.fn.bgiframe&&this.menu.element.bgiframe()},destroy:function(){this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");this.menu.element.remove();d.Widget.prototype.destroy.call(this)},_setOption:function(a,b){d.Widget.prototype._setOption.apply(this,arguments);a==="source"&&this._initSource();if(a==="appendTo")this.menu.element.appendTo(d(b||"body",this.element[0].ownerDocument)[0]);a==="disabled"&&
b&&this.xhr&&this.xhr.abort()},_initSource:function(){var a=this,b,g;if(d.isArray(this.options.source)){b=this.options.source;this.source=function(c,f){f(d.ui.autocomplete.filter(b,c.term))}}else if(typeof this.options.source==="string"){g=this.options.source;this.source=function(c,f){a.xhr&&a.xhr.abort();a.xhr=d.ajax({url:g,data:c,dataType:"json",autocompleteRequest:++e,success:function(h){this.autocompleteRequest===e&&f(h)},error:function(){this.autocompleteRequest===e&&f([])}})}}else this.source=
this.options.source},search:function(a,b){a=a!=null?a:this.element.val();this.term=this.element.val();if(a.length<this.options.minLength)return this.close(b);clearTimeout(this.closing);if(this._trigger("search",b)!==false)return this._search(a)},_search:function(a){this.pending++;this.element.addClass("ui-autocomplete-loading");this.source({term:a},this.response)},_response:function(a){if(!this.options.disabled&&a&&a.length){a=this._normalize(a);this._suggest(a);this._trigger("open")}else this.close();
this.pending--;this.pending||this.element.removeClass("ui-autocomplete-loading")},close:function(a){clearTimeout(this.closing);if(this.menu.element.is(":visible")){this.menu.element.hide();this.menu.deactivate();this._trigger("close",a)}},_change:function(a){this.previous!==this.element.val()&&this._trigger("change",a,{item:this.selectedItem})},_normalize:function(a){if(a.length&&a[0].label&&a[0].value)return a;return d.map(a,function(b){if(typeof b==="string")return{label:b,value:b};return d.extend({label:b.label||
b.value,value:b.value||b.label},b)})},_suggest:function(a){var b=this.menu.element.empty().zIndex(this.element.zIndex()+1);this._renderMenu(b,a);this.menu.deactivate();this.menu.refresh();b.show();this._resizeMenu();b.position(d.extend({of:this.element},this.options.position));this.options.autoFocus&&this.menu.next(new d.Event("mouseover"))},_resizeMenu:function(){var a=this.menu.element;a.outerWidth(Math.max(a.width("").outerWidth(),this.element.outerWidth()))},_renderMenu:function(a,b){var g=this;
d.each(b,function(c,f){g._renderItem(a,f)})},_renderItem:function(a,b){return d("<li></li>").data("item.autocomplete",b).append(d("<a></a>").text(b.label)).appendTo(a)},_move:function(a,b){if(this.menu.element.is(":visible"))if(this.menu.first()&&/^previous/.test(a)||this.menu.last()&&/^next/.test(a)){this.element.val(this.term);this.menu.deactivate()}else this.menu[a](b);else this.search(null,b)},widget:function(){return this.menu.element}});d.extend(d.ui.autocomplete,{escapeRegex:function(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,
"\\$&")},filter:function(a,b){var g=new RegExp(d.ui.autocomplete.escapeRegex(b),"i");return d.grep(a,function(c){return g.test(c.label||c.value||c)})}})})(jQuery);
(function(d){d.widget("ui.menu",{_create:function(){var e=this;this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({role:"listbox","aria-activedescendant":"ui-active-menuitem"}).click(function(a){if(d(a.target).closest(".ui-menu-item a").length){a.preventDefault();e.select(a)}});this.refresh()},refresh:function(){var e=this;this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role","menuitem").children("a").addClass("ui-corner-all").attr("tabindex",
-1).mouseenter(function(a){e.activate(a,d(this).parent())}).mouseleave(function(){e.deactivate()})},activate:function(e,a){this.deactivate();if(this.hasScroll()){var b=a.offset().top-this.element.offset().top,g=this.element.attr("scrollTop"),c=this.element.height();if(b<0)this.element.attr("scrollTop",g+b);else b>=c&&this.element.attr("scrollTop",g+b-c+a.height())}this.active=a.eq(0).children("a").addClass("ui-state-hover").attr("id","ui-active-menuitem").end();this._trigger("focus",e,{item:a})},
deactivate:function(){if(this.active){this.active.children("a").removeClass("ui-state-hover").removeAttr("id");this._trigger("blur");this.active=null}},next:function(e){this.move("next",".ui-menu-item:first",e)},previous:function(e){this.move("prev",".ui-menu-item:last",e)},first:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length},last:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length},move:function(e,a,b){if(this.active){e=this.active[e+"All"](".ui-menu-item").eq(0);
e.length?this.activate(b,e):this.activate(b,this.element.children(a))}else this.activate(b,this.element.children(a))},nextPage:function(e){if(this.hasScroll())if(!this.active||this.last())this.activate(e,this.element.children(".ui-menu-item:first"));else{var a=this.active.offset().top,b=this.element.height(),g=this.element.children(".ui-menu-item").filter(function(){var c=d(this).offset().top-a-b+d(this).height();return c<10&&c>-10});g.length||(g=this.element.children(".ui-menu-item:last"));this.activate(e,
g)}else this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||this.last()?":first":":last"))},previousPage:function(e){if(this.hasScroll())if(!this.active||this.first())this.activate(e,this.element.children(".ui-menu-item:last"));else{var a=this.active.offset().top,b=this.element.height();result=this.element.children(".ui-menu-item").filter(function(){var g=d(this).offset().top-a+b-d(this).height();return g<10&&g>-10});result.length||(result=this.element.children(".ui-menu-item:first"));
this.activate(e,result)}else this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||this.first()?":last":":first"))},hasScroll:function(){return this.element.height()<this.element.attr("scrollHeight")},select:function(e){this._trigger("selected",e,{item:this.active})}})})(jQuery);
;/*
 * jQuery UI Button 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Button
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(a){var g,i=function(b){a(":ui-button",b.target.form).each(function(){var c=a(this).data("button");setTimeout(function(){c.refresh()},1)})},h=function(b){var c=b.name,d=b.form,f=a([]);if(c)f=d?a(d).find("[name='"+c+"']"):a("[name='"+c+"']",b.ownerDocument).filter(function(){return!this.form});return f};a.widget("ui.button",{options:{disabled:null,text:true,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",
i);if(typeof this.options.disabled!=="boolean")this.options.disabled=this.element.attr("disabled");this._determineButtonType();this.hasTitle=!!this.buttonElement.attr("title");var b=this,c=this.options,d=this.type==="checkbox"||this.type==="radio",f="ui-state-hover"+(!d?" ui-state-active":"");if(c.label===null)c.label=this.buttonElement.html();if(this.element.is(":disabled"))c.disabled=true;this.buttonElement.addClass("ui-button ui-widget ui-state-default ui-corner-all").attr("role","button").bind("mouseenter.button",
function(){if(!c.disabled){a(this).addClass("ui-state-hover");this===g&&a(this).addClass("ui-state-active")}}).bind("mouseleave.button",function(){c.disabled||a(this).removeClass(f)}).bind("focus.button",function(){a(this).addClass("ui-state-focus")}).bind("blur.button",function(){a(this).removeClass("ui-state-focus")});d&&this.element.bind("change.button",function(){b.refresh()});if(this.type==="checkbox")this.buttonElement.bind("click.button",function(){if(c.disabled)return false;a(this).toggleClass("ui-state-active");
b.buttonElement.attr("aria-pressed",b.element[0].checked)});else if(this.type==="radio")this.buttonElement.bind("click.button",function(){if(c.disabled)return false;a(this).addClass("ui-state-active");b.buttonElement.attr("aria-pressed",true);var e=b.element[0];h(e).not(e).map(function(){return a(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed",false)});else{this.buttonElement.bind("mousedown.button",function(){if(c.disabled)return false;a(this).addClass("ui-state-active");
g=this;a(document).one("mouseup",function(){g=null})}).bind("mouseup.button",function(){if(c.disabled)return false;a(this).removeClass("ui-state-active")}).bind("keydown.button",function(e){if(c.disabled)return false;if(e.keyCode==a.ui.keyCode.SPACE||e.keyCode==a.ui.keyCode.ENTER)a(this).addClass("ui-state-active")}).bind("keyup.button",function(){a(this).removeClass("ui-state-active")});this.buttonElement.is("a")&&this.buttonElement.keyup(function(e){e.keyCode===a.ui.keyCode.SPACE&&a(this).click()})}this._setOption("disabled",
c.disabled)},_determineButtonType:function(){this.type=this.element.is(":checkbox")?"checkbox":this.element.is(":radio")?"radio":this.element.is("input")?"input":"button";if(this.type==="checkbox"||this.type==="radio"){var b=this.element.parents().filter(":last"),c="label[for="+this.element.attr("id")+"]";this.buttonElement=b.find(c);if(!this.buttonElement.length){b=b.length?b.siblings():this.element.siblings();this.buttonElement=b.filter(c);if(!this.buttonElement.length)this.buttonElement=b.find(c)}this.element.addClass("ui-helper-hidden-accessible");
(b=this.element.is(":checked"))&&this.buttonElement.addClass("ui-state-active");this.buttonElement.attr("aria-pressed",b)}else this.buttonElement=this.element},widget:function(){return this.buttonElement},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible");this.buttonElement.removeClass("ui-button ui-widget ui-state-default ui-corner-all ui-state-hover ui-state-active  ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only").removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());
this.hasTitle||this.buttonElement.removeAttr("title");a.Widget.prototype.destroy.call(this)},_setOption:function(b,c){a.Widget.prototype._setOption.apply(this,arguments);if(b==="disabled")c?this.element.attr("disabled",true):this.element.removeAttr("disabled");this._resetButton()},refresh:function(){var b=this.element.is(":disabled");b!==this.options.disabled&&this._setOption("disabled",b);if(this.type==="radio")h(this.element[0]).each(function(){a(this).is(":checked")?a(this).button("widget").addClass("ui-state-active").attr("aria-pressed",
true):a(this).button("widget").removeClass("ui-state-active").attr("aria-pressed",false)});else if(this.type==="checkbox")this.element.is(":checked")?this.buttonElement.addClass("ui-state-active").attr("aria-pressed",true):this.buttonElement.removeClass("ui-state-active").attr("aria-pressed",false)},_resetButton:function(){if(this.type==="input")this.options.label&&this.element.val(this.options.label);else{var b=this.buttonElement.removeClass("ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only"),
c=a("<span></span>").addClass("ui-button-text").html(this.options.label).appendTo(b.empty()).text(),d=this.options.icons,f=d.primary&&d.secondary,e=[];if(d.primary||d.secondary){if(this.options.text)e.push("ui-button-text-icon"+(f?"s":d.primary?"-primary":"-secondary"));d.primary&&b.prepend("<span class='ui-button-icon-primary ui-icon "+d.primary+"'></span>");d.secondary&&b.append("<span class='ui-button-icon-secondary ui-icon "+d.secondary+"'></span>");if(!this.options.text){e.push(f?"ui-button-icons-only":
"ui-button-icon-only");this.hasTitle||b.attr("title",c)}}else e.push("ui-button-text-only");b.addClass(e.join(" "))}}});a.widget("ui.buttonset",{options:{items:":button, :submit, :reset, :checkbox, :radio, a, :data(button)"},_create:function(){this.element.addClass("ui-buttonset")},_init:function(){this.refresh()},_setOption:function(b,c){b==="disabled"&&this.buttons.button("option",b,c);a.Widget.prototype._setOption.apply(this,arguments)},refresh:function(){this.buttons=this.element.find(this.options.items).filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return a(this).button("widget")[0]}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass("ui-corner-left").end().filter(":last").addClass("ui-corner-right").end().end()},
destroy:function(){this.element.removeClass("ui-buttonset");this.buttons.map(function(){return a(this).button("widget")[0]}).removeClass("ui-corner-left ui-corner-right").end().button("destroy");a.Widget.prototype.destroy.call(this)}})})(jQuery);
;/*
 * jQuery UI Dialog 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.button.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 */
(function(c,l){var m={buttons:true,height:true,maxHeight:true,maxWidth:true,minHeight:true,minWidth:true,width:true},n={maxHeight:true,maxWidth:true,minHeight:true,minWidth:true},o=c.attrFn||{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true,click:true};c.widget("ui.dialog",{options:{autoOpen:true,buttons:{},closeOnEscape:true,closeText:"close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:false,maxWidth:false,minHeight:150,minWidth:150,modal:false,
position:{my:"center",at:"center",collision:"fit",using:function(a){var b=c(this).css(a).offset().top;b<0&&c(this).css("top",a.top-b)}},resizable:true,show:null,stack:true,title:"",width:300,zIndex:1E3},_create:function(){this.originalTitle=this.element.attr("title");if(typeof this.originalTitle!=="string")this.originalTitle="";this.options.title=this.options.title||this.originalTitle;var a=this,b=a.options,d=b.title||"&#160;",e=c.ui.dialog.getTitleId(a.element),g=(a.uiDialog=c("<div></div>")).appendTo(document.body).hide().addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+
b.dialogClass).css({zIndex:b.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(i){if(b.closeOnEscape&&i.keyCode&&i.keyCode===c.ui.keyCode.ESCAPE){a.close(i);i.preventDefault()}}).attr({role:"dialog","aria-labelledby":e}).mousedown(function(i){a.moveToTop(false,i)});a.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(g);var f=(a.uiDialogTitlebar=c("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(g),
h=c('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){h.addClass("ui-state-hover")},function(){h.removeClass("ui-state-hover")}).focus(function(){h.addClass("ui-state-focus")}).blur(function(){h.removeClass("ui-state-focus")}).click(function(i){a.close(i);return false}).appendTo(f);(a.uiDialogTitlebarCloseText=c("<span></span>")).addClass("ui-icon ui-icon-closethick").text(b.closeText).appendTo(h);c("<span></span>").addClass("ui-dialog-title").attr("id",
e).html(d).prependTo(f);if(c.isFunction(b.beforeclose)&&!c.isFunction(b.beforeClose))b.beforeClose=b.beforeclose;f.find("*").add(f).disableSelection();b.draggable&&c.fn.draggable&&a._makeDraggable();b.resizable&&c.fn.resizable&&a._makeResizable();a._createButtons(b.buttons);a._isOpen=false;c.fn.bgiframe&&g.bgiframe()},_init:function(){this.options.autoOpen&&this.open()},destroy:function(){var a=this;a.overlay&&a.overlay.destroy();a.uiDialog.hide();a.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");
a.uiDialog.remove();a.originalTitle&&a.element.attr("title",a.originalTitle);return a},widget:function(){return this.uiDialog},close:function(a){var b=this,d,e;if(false!==b._trigger("beforeClose",a)){b.overlay&&b.overlay.destroy();b.uiDialog.unbind("keypress.ui-dialog");b._isOpen=false;if(b.options.hide)b.uiDialog.hide(b.options.hide,function(){b._trigger("close",a)});else{b.uiDialog.hide();b._trigger("close",a)}c.ui.dialog.overlay.resize();if(b.options.modal){d=0;c(".ui-dialog").each(function(){if(this!==
b.uiDialog[0]){e=c(this).css("z-index");isNaN(e)||(d=Math.max(d,e))}});c.ui.dialog.maxZ=d}return b}},isOpen:function(){return this._isOpen},moveToTop:function(a,b){var d=this,e=d.options;if(e.modal&&!a||!e.stack&&!e.modal)return d._trigger("focus",b);if(e.zIndex>c.ui.dialog.maxZ)c.ui.dialog.maxZ=e.zIndex;if(d.overlay){c.ui.dialog.maxZ+=1;d.overlay.$el.css("z-index",c.ui.dialog.overlay.maxZ=c.ui.dialog.maxZ)}a={scrollTop:d.element.attr("scrollTop"),scrollLeft:d.element.attr("scrollLeft")};c.ui.dialog.maxZ+=
1;d.uiDialog.css("z-index",c.ui.dialog.maxZ);d.element.attr(a);d._trigger("focus",b);return d},open:function(){if(!this._isOpen){var a=this,b=a.options,d=a.uiDialog;a.overlay=b.modal?new c.ui.dialog.overlay(a):null;a._size();a._position(b.position);d.show(b.show);a.moveToTop(true);b.modal&&d.bind("keypress.ui-dialog",function(e){if(e.keyCode===c.ui.keyCode.TAB){var g=c(":tabbable",this),f=g.filter(":first");g=g.filter(":last");if(e.target===g[0]&&!e.shiftKey){f.focus(1);return false}else if(e.target===
f[0]&&e.shiftKey){g.focus(1);return false}}});c(a.element.find(":tabbable").get().concat(d.find(".ui-dialog-buttonpane :tabbable").get().concat(d.get()))).eq(0).focus();a._isOpen=true;a._trigger("open");return a}},_createButtons:function(a){var b=this,d=false,e=c("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),g=c("<div></div>").addClass("ui-dialog-buttonset").appendTo(e);b.uiDialog.find(".ui-dialog-buttonpane").remove();typeof a==="object"&&a!==null&&c.each(a,
function(){return!(d=true)});if(d){c.each(a,function(f,h){h=c.isFunction(h)?{click:h,text:f}:h;var i=c('<button type="button"></button>').click(function(){h.click.apply(b.element[0],arguments)}).appendTo(g);c.each(h,function(j,k){if(j!=="click")j in o?i[j](k):i.attr(j,k)});c.fn.button&&i.button()});e.appendTo(b.uiDialog)}},_makeDraggable:function(){function a(f){return{position:f.position,offset:f.offset}}var b=this,d=b.options,e=c(document),g;b.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",
handle:".ui-dialog-titlebar",containment:"document",start:function(f,h){g=d.height==="auto"?"auto":c(this).height();c(this).height(c(this).height()).addClass("ui-dialog-dragging");b._trigger("dragStart",f,a(h))},drag:function(f,h){b._trigger("drag",f,a(h))},stop:function(f,h){d.position=[h.position.left-e.scrollLeft(),h.position.top-e.scrollTop()];c(this).removeClass("ui-dialog-dragging").height(g);b._trigger("dragStop",f,a(h));c.ui.dialog.overlay.resize()}})},_makeResizable:function(a){function b(f){return{originalPosition:f.originalPosition,
originalSize:f.originalSize,position:f.position,size:f.size}}a=a===l?this.options.resizable:a;var d=this,e=d.options,g=d.uiDialog.css("position");a=typeof a==="string"?a:"n,e,s,w,se,sw,ne,nw";d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:e.maxWidth,maxHeight:e.maxHeight,minWidth:e.minWidth,minHeight:d._minHeight(),handles:a,start:function(f,h){c(this).addClass("ui-dialog-resizing");d._trigger("resizeStart",f,b(h))},resize:function(f,h){d._trigger("resize",
f,b(h))},stop:function(f,h){c(this).removeClass("ui-dialog-resizing");e.height=c(this).height();e.width=c(this).width();d._trigger("resizeStop",f,b(h));c.ui.dialog.overlay.resize()}}).css("position",g).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var a=this.options;return a.height==="auto"?a.minHeight:Math.min(a.minHeight,a.height)},_position:function(a){var b=[],d=[0,0],e;if(a){if(typeof a==="string"||typeof a==="object"&&"0"in a){b=a.split?a.split(" "):
[a[0],a[1]];if(b.length===1)b[1]=b[0];c.each(["left","top"],function(g,f){if(+b[g]===b[g]){d[g]=b[g];b[g]=f}});a={my:b.join(" "),at:b.join(" "),offset:d.join(" ")}}a=c.extend({},c.ui.dialog.prototype.options.position,a)}else a=c.ui.dialog.prototype.options.position;(e=this.uiDialog.is(":visible"))||this.uiDialog.show();this.uiDialog.css({top:0,left:0}).position(c.extend({of:window},a));e||this.uiDialog.hide()},_setOptions:function(a){var b=this,d={},e=false;c.each(a,function(g,f){b._setOption(g,f);
if(g in m)e=true;if(g in n)d[g]=f});e&&this._size();this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option",d)},_setOption:function(a,b){var d=this,e=d.uiDialog;switch(a){case "beforeclose":a="beforeClose";break;case "buttons":d._createButtons(b);break;case "closeText":d.uiDialogTitlebarCloseText.text(""+b);break;case "dialogClass":e.removeClass(d.options.dialogClass).addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+b);break;case "disabled":b?e.addClass("ui-dialog-disabled"):
e.removeClass("ui-dialog-disabled");break;case "draggable":var g=e.is(":data(draggable)");g&&!b&&e.draggable("destroy");!g&&b&&d._makeDraggable();break;case "position":d._position(b);break;case "resizable":(g=e.is(":data(resizable)"))&&!b&&e.resizable("destroy");g&&typeof b==="string"&&e.resizable("option","handles",b);!g&&b!==false&&d._makeResizable(b);break;case "title":c(".ui-dialog-title",d.uiDialogTitlebar).html(""+(b||"&#160;"));break}c.Widget.prototype._setOption.apply(d,arguments)},_size:function(){var a=
this.options,b,d,e=this.uiDialog.is(":visible");this.element.show().css({width:"auto",minHeight:0,height:0});if(a.minWidth>a.width)a.width=a.minWidth;b=this.uiDialog.css({height:"auto",width:a.width}).height();d=Math.max(0,a.minHeight-b);if(a.height==="auto")if(c.support.minHeight)this.element.css({minHeight:d,height:"auto"});else{this.uiDialog.show();a=this.element.css("height","auto").height();e||this.uiDialog.hide();this.element.height(Math.max(a,d))}else this.element.height(Math.max(a.height-
b,0));this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight())}});c.extend(c.ui.dialog,{version:"1.8.12",uuid:0,maxZ:0,getTitleId:function(a){a=a.attr("id");if(!a){this.uuid+=1;a=this.uuid}return"ui-dialog-title-"+a},overlay:function(a){this.$el=c.ui.dialog.overlay.create(a)}});c.extend(c.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:c.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(a){return a+".dialog-overlay"}).join(" "),
create:function(a){if(this.instances.length===0){setTimeout(function(){c.ui.dialog.overlay.instances.length&&c(document).bind(c.ui.dialog.overlay.events,function(d){if(c(d.target).zIndex()<c.ui.dialog.overlay.maxZ)return false})},1);c(document).bind("keydown.dialog-overlay",function(d){if(a.options.closeOnEscape&&d.keyCode&&d.keyCode===c.ui.keyCode.ESCAPE){a.close(d);d.preventDefault()}});c(window).bind("resize.dialog-overlay",c.ui.dialog.overlay.resize)}var b=(this.oldInstances.pop()||c("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),
height:this.height()});c.fn.bgiframe&&b.bgiframe();this.instances.push(b);return b},destroy:function(a){var b=c.inArray(a,this.instances);b!=-1&&this.oldInstances.push(this.instances.splice(b,1)[0]);this.instances.length===0&&c([document,window]).unbind(".dialog-overlay");a.remove();var d=0;c.each(this.instances,function(){d=Math.max(d,this.css("z-index"))});this.maxZ=d},height:function(){var a,b;if(c.browser.msie&&c.browser.version<7){a=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
b=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight);return a<b?c(window).height()+"px":a+"px"}else return c(document).height()+"px"},width:function(){var a,b;if(c.browser.msie&&c.browser.version<7){a=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);b=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth);return a<b?c(window).width()+"px":a+"px"}else return c(document).width()+"px"},resize:function(){var a=c([]);c.each(c.ui.dialog.overlay.instances,
function(){a=a.add(this)});a.css({width:0,height:0}).css({width:c.ui.dialog.overlay.width(),height:c.ui.dialog.overlay.height()})}});c.extend(c.ui.dialog.overlay.prototype,{destroy:function(){c.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);
;/*
 * jQuery UI Slider 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.slider",d.ui.mouse,{widgetEventPrefix:"slide",options:{animate:false,distance:0,max:100,min:0,orientation:"horizontal",range:false,step:1,value:0,values:null},_create:function(){var b=this,a=this.options;this._mouseSliding=this._keySliding=false;this._animateOff=true;this._handleIndex=null;this._detectOrientation();this._mouseInit();this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget ui-widget-content ui-corner-all");a.disabled&&this.element.addClass("ui-slider-disabled ui-disabled");
this.range=d([]);if(a.range){if(a.range===true){this.range=d("<div></div>");if(!a.values)a.values=[this._valueMin(),this._valueMin()];if(a.values.length&&a.values.length!==2)a.values=[a.values[0],a.values[0]]}else this.range=d("<div></div>");this.range.appendTo(this.element).addClass("ui-slider-range");if(a.range==="min"||a.range==="max")this.range.addClass("ui-slider-range-"+a.range);this.range.addClass("ui-widget-header")}d(".ui-slider-handle",this.element).length===0&&d("<a href='#'></a>").appendTo(this.element).addClass("ui-slider-handle");
if(a.values&&a.values.length)for(;d(".ui-slider-handle",this.element).length<a.values.length;)d("<a href='#'></a>").appendTo(this.element).addClass("ui-slider-handle");this.handles=d(".ui-slider-handle",this.element).addClass("ui-state-default ui-corner-all");this.handle=this.handles.eq(0);this.handles.add(this.range).filter("a").click(function(c){c.preventDefault()}).hover(function(){a.disabled||d(this).addClass("ui-state-hover")},function(){d(this).removeClass("ui-state-hover")}).focus(function(){if(a.disabled)d(this).blur();
else{d(".ui-slider .ui-state-focus").removeClass("ui-state-focus");d(this).addClass("ui-state-focus")}}).blur(function(){d(this).removeClass("ui-state-focus")});this.handles.each(function(c){d(this).data("index.ui-slider-handle",c)});this.handles.keydown(function(c){var e=true,f=d(this).data("index.ui-slider-handle"),h,g,i;if(!b.options.disabled){switch(c.keyCode){case d.ui.keyCode.HOME:case d.ui.keyCode.END:case d.ui.keyCode.PAGE_UP:case d.ui.keyCode.PAGE_DOWN:case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:e=
false;if(!b._keySliding){b._keySliding=true;d(this).addClass("ui-state-active");h=b._start(c,f);if(h===false)return}break}i=b.options.step;h=b.options.values&&b.options.values.length?(g=b.values(f)):(g=b.value());switch(c.keyCode){case d.ui.keyCode.HOME:g=b._valueMin();break;case d.ui.keyCode.END:g=b._valueMax();break;case d.ui.keyCode.PAGE_UP:g=b._trimAlignValue(h+(b._valueMax()-b._valueMin())/5);break;case d.ui.keyCode.PAGE_DOWN:g=b._trimAlignValue(h-(b._valueMax()-b._valueMin())/5);break;case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:if(h===
b._valueMax())return;g=b._trimAlignValue(h+i);break;case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:if(h===b._valueMin())return;g=b._trimAlignValue(h-i);break}b._slide(c,f,g);return e}}).keyup(function(c){var e=d(this).data("index.ui-slider-handle");if(b._keySliding){b._keySliding=false;b._stop(c,e);b._change(c,e);d(this).removeClass("ui-state-active")}});this._refreshValue();this._animateOff=false},destroy:function(){this.handles.remove();this.range.remove();this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider");
this._mouseDestroy();return this},_mouseCapture:function(b){var a=this.options,c,e,f,h,g;if(a.disabled)return false;this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()};this.elementOffset=this.element.offset();c=this._normValueFromMouse({x:b.pageX,y:b.pageY});e=this._valueMax()-this._valueMin()+1;h=this;this.handles.each(function(i){var j=Math.abs(c-h.values(i));if(e>j){e=j;f=d(this);g=i}});if(a.range===true&&this.values(1)===a.min){g+=1;f=d(this.handles[g])}if(this._start(b,
g)===false)return false;this._mouseSliding=true;h._handleIndex=g;f.addClass("ui-state-active").focus();a=f.offset();this._clickOffset=!d(b.target).parents().andSelf().is(".ui-slider-handle")?{left:0,top:0}:{left:b.pageX-a.left-f.width()/2,top:b.pageY-a.top-f.height()/2-(parseInt(f.css("borderTopWidth"),10)||0)-(parseInt(f.css("borderBottomWidth"),10)||0)+(parseInt(f.css("marginTop"),10)||0)};this.handles.hasClass("ui-state-hover")||this._slide(b,g,c);return this._animateOff=true},_mouseStart:function(){return true},
_mouseDrag:function(b){var a=this._normValueFromMouse({x:b.pageX,y:b.pageY});this._slide(b,this._handleIndex,a);return false},_mouseStop:function(b){this.handles.removeClass("ui-state-active");this._mouseSliding=false;this._stop(b,this._handleIndex);this._change(b,this._handleIndex);this._clickOffset=this._handleIndex=null;return this._animateOff=false},_detectOrientation:function(){this.orientation=this.options.orientation==="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(b){var a;
if(this.orientation==="horizontal"){a=this.elementSize.width;b=b.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)}else{a=this.elementSize.height;b=b.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)}a=b/a;if(a>1)a=1;if(a<0)a=0;if(this.orientation==="vertical")a=1-a;b=this._valueMax()-this._valueMin();return this._trimAlignValue(this._valueMin()+a*b)},_start:function(b,a){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=
this.values(a);c.values=this.values()}return this._trigger("start",b,c)},_slide:function(b,a,c){var e;if(this.options.values&&this.options.values.length){e=this.values(a?0:1);if(this.options.values.length===2&&this.options.range===true&&(a===0&&c>e||a===1&&c<e))c=e;if(c!==this.values(a)){e=this.values();e[a]=c;b=this._trigger("slide",b,{handle:this.handles[a],value:c,values:e});this.values(a?0:1);b!==false&&this.values(a,c,true)}}else if(c!==this.value()){b=this._trigger("slide",b,{handle:this.handles[a],
value:c});b!==false&&this.value(c)}},_stop:function(b,a){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(a);c.values=this.values()}this._trigger("stop",b,c)},_change:function(b,a){if(!this._keySliding&&!this._mouseSliding){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(a);c.values=this.values()}this._trigger("change",b,c)}},value:function(b){if(arguments.length){this.options.value=
this._trimAlignValue(b);this._refreshValue();this._change(null,0)}else return this._value()},values:function(b,a){var c,e,f;if(arguments.length>1){this.options.values[b]=this._trimAlignValue(a);this._refreshValue();this._change(null,b)}else if(arguments.length)if(d.isArray(arguments[0])){c=this.options.values;e=arguments[0];for(f=0;f<c.length;f+=1){c[f]=this._trimAlignValue(e[f]);this._change(null,f)}this._refreshValue()}else return this.options.values&&this.options.values.length?this._values(b):
this.value();else return this._values()},_setOption:function(b,a){var c,e=0;if(d.isArray(this.options.values))e=this.options.values.length;d.Widget.prototype._setOption.apply(this,arguments);switch(b){case "disabled":if(a){this.handles.filter(".ui-state-focus").blur();this.handles.removeClass("ui-state-hover");this.handles.attr("disabled","disabled");this.element.addClass("ui-disabled")}else{this.handles.removeAttr("disabled");this.element.removeClass("ui-disabled")}break;case "orientation":this._detectOrientation();
this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation);this._refreshValue();break;case "value":this._animateOff=true;this._refreshValue();this._change(null,0);this._animateOff=false;break;case "values":this._animateOff=true;this._refreshValue();for(c=0;c<e;c+=1)this._change(null,c);this._animateOff=false;break}},_value:function(){var b=this.options.value;return b=this._trimAlignValue(b)},_values:function(b){var a,c;if(arguments.length){a=this.options.values[b];
return a=this._trimAlignValue(a)}else{a=this.options.values.slice();for(c=0;c<a.length;c+=1)a[c]=this._trimAlignValue(a[c]);return a}},_trimAlignValue:function(b){if(b<=this._valueMin())return this._valueMin();if(b>=this._valueMax())return this._valueMax();var a=this.options.step>0?this.options.step:1,c=(b-this._valueMin())%a;alignValue=b-c;if(Math.abs(c)*2>=a)alignValue+=c>0?a:-a;return parseFloat(alignValue.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},
_refreshValue:function(){var b=this.options.range,a=this.options,c=this,e=!this._animateOff?a.animate:false,f,h={},g,i,j,l;if(this.options.values&&this.options.values.length)this.handles.each(function(k){f=(c.values(k)-c._valueMin())/(c._valueMax()-c._valueMin())*100;h[c.orientation==="horizontal"?"left":"bottom"]=f+"%";d(this).stop(1,1)[e?"animate":"css"](h,a.animate);if(c.options.range===true)if(c.orientation==="horizontal"){if(k===0)c.range.stop(1,1)[e?"animate":"css"]({left:f+"%"},a.animate);
if(k===1)c.range[e?"animate":"css"]({width:f-g+"%"},{queue:false,duration:a.animate})}else{if(k===0)c.range.stop(1,1)[e?"animate":"css"]({bottom:f+"%"},a.animate);if(k===1)c.range[e?"animate":"css"]({height:f-g+"%"},{queue:false,duration:a.animate})}g=f});else{i=this.value();j=this._valueMin();l=this._valueMax();f=l!==j?(i-j)/(l-j)*100:0;h[c.orientation==="horizontal"?"left":"bottom"]=f+"%";this.handle.stop(1,1)[e?"animate":"css"](h,a.animate);if(b==="min"&&this.orientation==="horizontal")this.range.stop(1,
1)[e?"animate":"css"]({width:f+"%"},a.animate);if(b==="max"&&this.orientation==="horizontal")this.range[e?"animate":"css"]({width:100-f+"%"},{queue:false,duration:a.animate});if(b==="min"&&this.orientation==="vertical")this.range.stop(1,1)[e?"animate":"css"]({height:f+"%"},a.animate);if(b==="max"&&this.orientation==="vertical")this.range[e?"animate":"css"]({height:100-f+"%"},{queue:false,duration:a.animate})}}});d.extend(d.ui.slider,{version:"1.8.12"})})(jQuery);
;/*
 * jQuery UI Tabs 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(d,p){function u(){return++v}function w(){return++x}var v=0,x=0;d.widget("ui.tabs",{options:{add:null,ajaxOptions:null,cache:false,cookie:null,collapsible:false,disable:null,disabled:[],enable:null,event:"click",fx:null,idPrefix:"ui-tabs-",load:null,panelTemplate:"<div></div>",remove:null,select:null,show:null,spinner:"<em>Loading&#8230;</em>",tabTemplate:"<li><a href='#{href}'><span>#{label}</span></a></li>"},_create:function(){this._tabify(true)},_setOption:function(b,e){if(b=="selected")this.options.collapsible&&
e==this.options.selected||this.select(e);else{this.options[b]=e;this._tabify()}},_tabId:function(b){return b.title&&b.title.replace(/\s/g,"_").replace(/[^\w\u00c0-\uFFFF-]/g,"")||this.options.idPrefix+u()},_sanitizeSelector:function(b){return b.replace(/:/g,"\\:")},_cookie:function(){var b=this.cookie||(this.cookie=this.options.cookie.name||"ui-tabs-"+w());return d.cookie.apply(null,[b].concat(d.makeArray(arguments)))},_ui:function(b,e){return{tab:b,panel:e,index:this.anchors.index(b)}},_cleanup:function(){this.lis.filter(".ui-state-processing").removeClass("ui-state-processing").find("span:data(label.tabs)").each(function(){var b=
d(this);b.html(b.data("label.tabs")).removeData("label.tabs")})},_tabify:function(b){function e(g,f){g.css("display","");!d.support.opacity&&f.opacity&&g[0].style.removeAttribute("filter")}var a=this,c=this.options,h=/^#.+/;this.list=this.element.find("ol,ul").eq(0);this.lis=d(" > li:has(a[href])",this.list);this.anchors=this.lis.map(function(){return d("a",this)[0]});this.panels=d([]);this.anchors.each(function(g,f){var i=d(f).attr("href"),l=i.split("#")[0],q;if(l&&(l===location.toString().split("#")[0]||
(q=d("base")[0])&&l===q.href)){i=f.hash;f.href=i}if(h.test(i))a.panels=a.panels.add(a.element.find(a._sanitizeSelector(i)));else if(i&&i!=="#"){d.data(f,"href.tabs",i);d.data(f,"load.tabs",i.replace(/#.*$/,""));i=a._tabId(f);f.href="#"+i;f=a.element.find("#"+i);if(!f.length){f=d(c.panelTemplate).attr("id",i).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").insertAfter(a.panels[g-1]||a.list);f.data("destroy.tabs",true)}a.panels=a.panels.add(f)}else c.disabled.push(g)});if(b){this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all");
this.list.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.lis.addClass("ui-state-default ui-corner-top");this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");if(c.selected===p){location.hash&&this.anchors.each(function(g,f){if(f.hash==location.hash){c.selected=g;return false}});if(typeof c.selected!=="number"&&c.cookie)c.selected=parseInt(a._cookie(),10);if(typeof c.selected!=="number"&&this.lis.filter(".ui-tabs-selected").length)c.selected=
this.lis.index(this.lis.filter(".ui-tabs-selected"));c.selected=c.selected||(this.lis.length?0:-1)}else if(c.selected===null)c.selected=-1;c.selected=c.selected>=0&&this.anchors[c.selected]||c.selected<0?c.selected:0;c.disabled=d.unique(c.disabled.concat(d.map(this.lis.filter(".ui-state-disabled"),function(g){return a.lis.index(g)}))).sort();d.inArray(c.selected,c.disabled)!=-1&&c.disabled.splice(d.inArray(c.selected,c.disabled),1);this.panels.addClass("ui-tabs-hide");this.lis.removeClass("ui-tabs-selected ui-state-active");
if(c.selected>=0&&this.anchors.length){a.element.find(a._sanitizeSelector(a.anchors[c.selected].hash)).removeClass("ui-tabs-hide");this.lis.eq(c.selected).addClass("ui-tabs-selected ui-state-active");a.element.queue("tabs",function(){a._trigger("show",null,a._ui(a.anchors[c.selected],a.element.find(a._sanitizeSelector(a.anchors[c.selected].hash))[0]))});this.load(c.selected)}d(window).bind("unload",function(){a.lis.add(a.anchors).unbind(".tabs");a.lis=a.anchors=a.panels=null})}else c.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"));
this.element[c.collapsible?"addClass":"removeClass"]("ui-tabs-collapsible");c.cookie&&this._cookie(c.selected,c.cookie);b=0;for(var j;j=this.lis[b];b++)d(j)[d.inArray(b,c.disabled)!=-1&&!d(j).hasClass("ui-tabs-selected")?"addClass":"removeClass"]("ui-state-disabled");c.cache===false&&this.anchors.removeData("cache.tabs");this.lis.add(this.anchors).unbind(".tabs");if(c.event!=="mouseover"){var k=function(g,f){f.is(":not(.ui-state-disabled)")&&f.addClass("ui-state-"+g)},n=function(g,f){f.removeClass("ui-state-"+
g)};this.lis.bind("mouseover.tabs",function(){k("hover",d(this))});this.lis.bind("mouseout.tabs",function(){n("hover",d(this))});this.anchors.bind("focus.tabs",function(){k("focus",d(this).closest("li"))});this.anchors.bind("blur.tabs",function(){n("focus",d(this).closest("li"))})}var m,o;if(c.fx)if(d.isArray(c.fx)){m=c.fx[0];o=c.fx[1]}else m=o=c.fx;var r=o?function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.hide().removeClass("ui-tabs-hide").animate(o,o.duration||"normal",
function(){e(f,o);a._trigger("show",null,a._ui(g,f[0]))})}:function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.removeClass("ui-tabs-hide");a._trigger("show",null,a._ui(g,f[0]))},s=m?function(g,f){f.animate(m,m.duration||"normal",function(){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");e(f,m);a.element.dequeue("tabs")})}:function(g,f){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");a.element.dequeue("tabs")};
this.anchors.bind(c.event+".tabs",function(){var g=this,f=d(g).closest("li"),i=a.panels.filter(":not(.ui-tabs-hide)"),l=a.element.find(a._sanitizeSelector(g.hash));if(f.hasClass("ui-tabs-selected")&&!c.collapsible||f.hasClass("ui-state-disabled")||f.hasClass("ui-state-processing")||a.panels.filter(":animated").length||a._trigger("select",null,a._ui(this,l[0]))===false){this.blur();return false}c.selected=a.anchors.index(this);a.abort();if(c.collapsible)if(f.hasClass("ui-tabs-selected")){c.selected=
-1;c.cookie&&a._cookie(c.selected,c.cookie);a.element.queue("tabs",function(){s(g,i)}).dequeue("tabs");this.blur();return false}else if(!i.length){c.cookie&&a._cookie(c.selected,c.cookie);a.element.queue("tabs",function(){r(g,l)});a.load(a.anchors.index(this));this.blur();return false}c.cookie&&a._cookie(c.selected,c.cookie);if(l.length){i.length&&a.element.queue("tabs",function(){s(g,i)});a.element.queue("tabs",function(){r(g,l)});a.load(a.anchors.index(this))}else throw"jQuery UI Tabs: Mismatching fragment identifier.";
d.browser.msie&&this.blur()});this.anchors.bind("click.tabs",function(){return false})},_getIndex:function(b){if(typeof b=="string")b=this.anchors.index(this.anchors.filter("[href$="+b+"]"));return b},destroy:function(){var b=this.options;this.abort();this.element.unbind(".tabs").removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible").removeData("tabs");this.list.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.anchors.each(function(){var e=
d.data(this,"href.tabs");if(e)this.href=e;var a=d(this).unbind(".tabs");d.each(["href","load","cache"],function(c,h){a.removeData(h+".tabs")})});this.lis.unbind(".tabs").add(this.panels).each(function(){d.data(this,"destroy.tabs")?d(this).remove():d(this).removeClass("ui-state-default ui-corner-top ui-tabs-selected ui-state-active ui-state-hover ui-state-focus ui-state-disabled ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide")});b.cookie&&this._cookie(null,b.cookie);return this},add:function(b,
e,a){if(a===p)a=this.anchors.length;var c=this,h=this.options;e=d(h.tabTemplate.replace(/#\{href\}/g,b).replace(/#\{label\}/g,e));b=!b.indexOf("#")?b.replace("#",""):this._tabId(d("a",e)[0]);e.addClass("ui-state-default ui-corner-top").data("destroy.tabs",true);var j=c.element.find("#"+b);j.length||(j=d(h.panelTemplate).attr("id",b).data("destroy.tabs",true));j.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide");if(a>=this.lis.length){e.appendTo(this.list);j.appendTo(this.list[0].parentNode)}else{e.insertBefore(this.lis[a]);
j.insertBefore(this.panels[a])}h.disabled=d.map(h.disabled,function(k){return k>=a?++k:k});this._tabify();if(this.anchors.length==1){h.selected=0;e.addClass("ui-tabs-selected ui-state-active");j.removeClass("ui-tabs-hide");this.element.queue("tabs",function(){c._trigger("show",null,c._ui(c.anchors[0],c.panels[0]))});this.load(0)}this._trigger("add",null,this._ui(this.anchors[a],this.panels[a]));return this},remove:function(b){b=this._getIndex(b);var e=this.options,a=this.lis.eq(b).remove(),c=this.panels.eq(b).remove();
if(a.hasClass("ui-tabs-selected")&&this.anchors.length>1)this.select(b+(b+1<this.anchors.length?1:-1));e.disabled=d.map(d.grep(e.disabled,function(h){return h!=b}),function(h){return h>=b?--h:h});this._tabify();this._trigger("remove",null,this._ui(a.find("a")[0],c[0]));return this},enable:function(b){b=this._getIndex(b);var e=this.options;if(d.inArray(b,e.disabled)!=-1){this.lis.eq(b).removeClass("ui-state-disabled");e.disabled=d.grep(e.disabled,function(a){return a!=b});this._trigger("enable",null,
this._ui(this.anchors[b],this.panels[b]));return this}},disable:function(b){b=this._getIndex(b);var e=this.options;if(b!=e.selected){this.lis.eq(b).addClass("ui-state-disabled");e.disabled.push(b);e.disabled.sort();this._trigger("disable",null,this._ui(this.anchors[b],this.panels[b]))}return this},select:function(b){b=this._getIndex(b);if(b==-1)if(this.options.collapsible&&this.options.selected!=-1)b=this.options.selected;else return this;this.anchors.eq(b).trigger(this.options.event+".tabs");return this},
load:function(b){b=this._getIndex(b);var e=this,a=this.options,c=this.anchors.eq(b)[0],h=d.data(c,"load.tabs");this.abort();if(!h||this.element.queue("tabs").length!==0&&d.data(c,"cache.tabs"))this.element.dequeue("tabs");else{this.lis.eq(b).addClass("ui-state-processing");if(a.spinner){var j=d("span",c);j.data("label.tabs",j.html()).html(a.spinner)}this.xhr=d.ajax(d.extend({},a.ajaxOptions,{url:h,success:function(k,n){e.element.find(e._sanitizeSelector(c.hash)).html(k);e._cleanup();a.cache&&d.data(c,
"cache.tabs",true);e._trigger("load",null,e._ui(e.anchors[b],e.panels[b]));try{a.ajaxOptions.success(k,n)}catch(m){}},error:function(k,n){e._cleanup();e._trigger("load",null,e._ui(e.anchors[b],e.panels[b]));try{a.ajaxOptions.error(k,n,b,c)}catch(m){}}}));e.element.dequeue("tabs");return this}},abort:function(){this.element.queue([]);this.panels.stop(false,true);this.element.queue("tabs",this.element.queue("tabs").splice(-2,2));if(this.xhr){this.xhr.abort();delete this.xhr}this._cleanup();return this},
url:function(b,e){this.anchors.eq(b).removeData("cache.tabs").data("load.tabs",e);return this},length:function(){return this.anchors.length}});d.extend(d.ui.tabs,{version:"1.8.12"});d.extend(d.ui.tabs.prototype,{rotation:null,rotate:function(b,e){var a=this,c=this.options,h=a._rotate||(a._rotate=function(j){clearTimeout(a.rotation);a.rotation=setTimeout(function(){var k=c.selected;a.select(++k<a.anchors.length?k:0)},b);j&&j.stopPropagation()});e=a._unrotate||(a._unrotate=!e?function(j){j.clientX&&
a.rotate(null)}:function(){t=c.selected;h()});if(b){this.element.bind("tabsshow",h);this.anchors.bind(c.event+".tabs",e);h()}else{clearTimeout(a.rotation);this.element.unbind("tabsshow",h);this.anchors.unbind(c.event+".tabs",e);delete this._rotate;delete this._unrotate}return this}})})(jQuery);
;/*
 * jQuery UI Datepicker 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Datepicker
 *
 * Depends:
 *	jquery.ui.core.js
 */
(function(d,A){function K(){this.debug=false;this._curInst=null;this._keyEvent=false;this._disabledInputs=[];this._inDialog=this._datepickerShowing=false;this._mainDivId="ui-datepicker-div";this._inlineClass="ui-datepicker-inline";this._appendClass="ui-datepicker-append";this._triggerClass="ui-datepicker-trigger";this._dialogClass="ui-datepicker-dialog";this._disableClass="ui-datepicker-disabled";this._unselectableClass="ui-datepicker-unselectable";this._currentClass="ui-datepicker-current-day";this._dayOverClass=
"ui-datepicker-days-cell-over";this.regional=[];this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su",
"Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:""};this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:false,hideIfNoPrevNext:false,navigationAsDateFormat:false,gotoCurrent:false,changeMonth:false,changeYear:false,yearRange:"c-10:c+10",showOtherMonths:false,selectOtherMonths:false,showWeek:false,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",
minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:true,showButtonPanel:false,autoSize:false};d.extend(this._defaults,this.regional[""]);this.dpDiv=d('<div id="'+this._mainDivId+'" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')}function F(a,b){d.extend(a,b);for(var c in b)if(b[c]==
null||b[c]==A)a[c]=b[c];return a}d.extend(d.ui,{datepicker:{version:"1.8.12"}});var y=(new Date).getTime();d.extend(K.prototype,{markerClassName:"hasDatepicker",log:function(){this.debug&&console.log.apply("",arguments)},_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(a){F(this._defaults,a||{});return this},_attachDatepicker:function(a,b){var c=null;for(var e in this._defaults){var f=a.getAttribute("date:"+e);if(f){c=c||{};try{c[e]=eval(f)}catch(h){c[e]=f}}}e=a.nodeName.toLowerCase();
f=e=="div"||e=="span";if(!a.id){this.uuid+=1;a.id="dp"+this.uuid}var i=this._newInst(d(a),f);i.settings=d.extend({},b||{},c||{});if(e=="input")this._connectDatepicker(a,i);else f&&this._inlineDatepicker(a,i)},_newInst:function(a,b){return{id:a[0].id.replace(/([^A-Za-z0-9_-])/g,"\\\\$1"),input:a,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:b,dpDiv:!b?this.dpDiv:d('<div class="'+this._inlineClass+' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')}},
_connectDatepicker:function(a,b){var c=d(a);b.append=d([]);b.trigger=d([]);if(!c.hasClass(this.markerClassName)){this._attachments(c,b);c.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp).bind("setData.datepicker",function(e,f,h){b.settings[f]=h}).bind("getData.datepicker",function(e,f){return this._get(b,f)});this._autoSize(b);d.data(a,"datepicker",b)}},_attachments:function(a,b){var c=this._get(b,"appendText"),e=this._get(b,"isRTL");b.append&&
b.append.remove();if(c){b.append=d('<span class="'+this._appendClass+'">'+c+"</span>");a[e?"before":"after"](b.append)}a.unbind("focus",this._showDatepicker);b.trigger&&b.trigger.remove();c=this._get(b,"showOn");if(c=="focus"||c=="both")a.focus(this._showDatepicker);if(c=="button"||c=="both"){c=this._get(b,"buttonText");var f=this._get(b,"buttonImage");b.trigger=d(this._get(b,"buttonImageOnly")?d("<img/>").addClass(this._triggerClass).attr({src:f,alt:c,title:c}):d('<button type="button"></button>').addClass(this._triggerClass).html(f==
""?c:d("<img/>").attr({src:f,alt:c,title:c})));a[e?"before":"after"](b.trigger);b.trigger.click(function(){d.datepicker._datepickerShowing&&d.datepicker._lastInput==a[0]?d.datepicker._hideDatepicker():d.datepicker._showDatepicker(a[0]);return false})}},_autoSize:function(a){if(this._get(a,"autoSize")&&!a.inline){var b=new Date(2009,11,20),c=this._get(a,"dateFormat");if(c.match(/[DM]/)){var e=function(f){for(var h=0,i=0,g=0;g<f.length;g++)if(f[g].length>h){h=f[g].length;i=g}return i};b.setMonth(e(this._get(a,
c.match(/MM/)?"monthNames":"monthNamesShort")));b.setDate(e(this._get(a,c.match(/DD/)?"dayNames":"dayNamesShort"))+20-b.getDay())}a.input.attr("size",this._formatDate(a,b).length)}},_inlineDatepicker:function(a,b){var c=d(a);if(!c.hasClass(this.markerClassName)){c.addClass(this.markerClassName).append(b.dpDiv).bind("setData.datepicker",function(e,f,h){b.settings[f]=h}).bind("getData.datepicker",function(e,f){return this._get(b,f)});d.data(a,"datepicker",b);this._setDate(b,this._getDefaultDate(b),
true);this._updateDatepicker(b);this._updateAlternate(b);b.dpDiv.show()}},_dialogDatepicker:function(a,b,c,e,f){a=this._dialogInst;if(!a){this.uuid+=1;this._dialogInput=d('<input type="text" id="'+("dp"+this.uuid)+'" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');this._dialogInput.keydown(this._doKeyDown);d("body").append(this._dialogInput);a=this._dialogInst=this._newInst(this._dialogInput,false);a.settings={};d.data(this._dialogInput[0],"datepicker",a)}F(a.settings,e||{});
b=b&&b.constructor==Date?this._formatDate(a,b):b;this._dialogInput.val(b);this._pos=f?f.length?f:[f.pageX,f.pageY]:null;if(!this._pos)this._pos=[document.documentElement.clientWidth/2-100+(document.documentElement.scrollLeft||document.body.scrollLeft),document.documentElement.clientHeight/2-150+(document.documentElement.scrollTop||document.body.scrollTop)];this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px");a.settings.onSelect=c;this._inDialog=true;this.dpDiv.addClass(this._dialogClass);
this._showDatepicker(this._dialogInput[0]);d.blockUI&&d.blockUI(this.dpDiv);d.data(this._dialogInput[0],"datepicker",a);return this},_destroyDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();d.removeData(a,"datepicker");if(e=="input"){c.append.remove();c.trigger.remove();b.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",
this._doKeyUp)}else if(e=="div"||e=="span")b.removeClass(this.markerClassName).empty()}},_enableDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();if(e=="input"){a.disabled=false;c.trigger.filter("button").each(function(){this.disabled=false}).end().filter("img").css({opacity:"1.0",cursor:""})}else if(e=="div"||e=="span")b.children("."+this._inlineClass).children().removeClass("ui-state-disabled");this._disabledInputs=d.map(this._disabledInputs,
function(f){return f==a?null:f})}},_disableDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();if(e=="input"){a.disabled=true;c.trigger.filter("button").each(function(){this.disabled=true}).end().filter("img").css({opacity:"0.5",cursor:"default"})}else if(e=="div"||e=="span")b.children("."+this._inlineClass).children().addClass("ui-state-disabled");this._disabledInputs=d.map(this._disabledInputs,function(f){return f==a?null:
f});this._disabledInputs[this._disabledInputs.length]=a}},_isDisabledDatepicker:function(a){if(!a)return false;for(var b=0;b<this._disabledInputs.length;b++)if(this._disabledInputs[b]==a)return true;return false},_getInst:function(a){try{return d.data(a,"datepicker")}catch(b){throw"Missing instance data for this datepicker";}},_optionDatepicker:function(a,b,c){var e=this._getInst(a);if(arguments.length==2&&typeof b=="string")return b=="defaults"?d.extend({},d.datepicker._defaults):e?b=="all"?d.extend({},
e.settings):this._get(e,b):null;var f=b||{};if(typeof b=="string"){f={};f[b]=c}if(e){this._curInst==e&&this._hideDatepicker();var h=this._getDateDatepicker(a,true),i=this._getMinMaxDate(e,"min"),g=this._getMinMaxDate(e,"max");F(e.settings,f);if(i!==null&&f.dateFormat!==A&&f.minDate===A)e.settings.minDate=this._formatDate(e,i);if(g!==null&&f.dateFormat!==A&&f.maxDate===A)e.settings.maxDate=this._formatDate(e,g);this._attachments(d(a),e);this._autoSize(e);this._setDateDatepicker(a,h);this._updateDatepicker(e)}},
_changeDatepicker:function(a,b,c){this._optionDatepicker(a,b,c)},_refreshDatepicker:function(a){(a=this._getInst(a))&&this._updateDatepicker(a)},_setDateDatepicker:function(a,b){if(a=this._getInst(a)){this._setDate(a,b);this._updateDatepicker(a);this._updateAlternate(a)}},_getDateDatepicker:function(a,b){(a=this._getInst(a))&&!a.inline&&this._setDateFromField(a,b);return a?this._getDate(a):null},_doKeyDown:function(a){var b=d.datepicker._getInst(a.target),c=true,e=b.dpDiv.is(".ui-datepicker-rtl");
b._keyEvent=true;if(d.datepicker._datepickerShowing)switch(a.keyCode){case 9:d.datepicker._hideDatepicker();c=false;break;case 13:c=d("td."+d.datepicker._dayOverClass+":not(."+d.datepicker._currentClass+")",b.dpDiv);c[0]?d.datepicker._selectDay(a.target,b.selectedMonth,b.selectedYear,c[0]):d.datepicker._hideDatepicker();return false;case 27:d.datepicker._hideDatepicker();break;case 33:d.datepicker._adjustDate(a.target,a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),
"M");break;case 34:d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M");break;case 35:if(a.ctrlKey||a.metaKey)d.datepicker._clearDate(a.target);c=a.ctrlKey||a.metaKey;break;case 36:if(a.ctrlKey||a.metaKey)d.datepicker._gotoToday(a.target);c=a.ctrlKey||a.metaKey;break;case 37:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,e?+1:-1,"D");c=a.ctrlKey||a.metaKey;if(a.originalEvent.altKey)d.datepicker._adjustDate(a.target,a.ctrlKey?
-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M");break;case 38:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,-7,"D");c=a.ctrlKey||a.metaKey;break;case 39:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,e?-1:+1,"D");c=a.ctrlKey||a.metaKey;if(a.originalEvent.altKey)d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M");break;case 40:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,
+7,"D");c=a.ctrlKey||a.metaKey;break;default:c=false}else if(a.keyCode==36&&a.ctrlKey)d.datepicker._showDatepicker(this);else c=false;if(c){a.preventDefault();a.stopPropagation()}},_doKeyPress:function(a){var b=d.datepicker._getInst(a.target);if(d.datepicker._get(b,"constrainInput")){b=d.datepicker._possibleChars(d.datepicker._get(b,"dateFormat"));var c=String.fromCharCode(a.charCode==A?a.keyCode:a.charCode);return a.ctrlKey||a.metaKey||c<" "||!b||b.indexOf(c)>-1}},_doKeyUp:function(a){a=d.datepicker._getInst(a.target);
if(a.input.val()!=a.lastVal)try{if(d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),a.input?a.input.val():null,d.datepicker._getFormatConfig(a))){d.datepicker._setDateFromField(a);d.datepicker._updateAlternate(a);d.datepicker._updateDatepicker(a)}}catch(b){d.datepicker.log(b)}return true},_showDatepicker:function(a){a=a.target||a;if(a.nodeName.toLowerCase()!="input")a=d("input",a.parentNode)[0];if(!(d.datepicker._isDisabledDatepicker(a)||d.datepicker._lastInput==a)){var b=d.datepicker._getInst(a);
d.datepicker._curInst&&d.datepicker._curInst!=b&&d.datepicker._curInst.dpDiv.stop(true,true);var c=d.datepicker._get(b,"beforeShow");F(b.settings,c?c.apply(a,[a,b]):{});b.lastVal=null;d.datepicker._lastInput=a;d.datepicker._setDateFromField(b);if(d.datepicker._inDialog)a.value="";if(!d.datepicker._pos){d.datepicker._pos=d.datepicker._findPos(a);d.datepicker._pos[1]+=a.offsetHeight}var e=false;d(a).parents().each(function(){e|=d(this).css("position")=="fixed";return!e});if(e&&d.browser.opera){d.datepicker._pos[0]-=
document.documentElement.scrollLeft;d.datepicker._pos[1]-=document.documentElement.scrollTop}c={left:d.datepicker._pos[0],top:d.datepicker._pos[1]};d.datepicker._pos=null;b.dpDiv.empty();b.dpDiv.css({position:"absolute",display:"block",top:"-1000px"});d.datepicker._updateDatepicker(b);c=d.datepicker._checkOffset(b,c,e);b.dpDiv.css({position:d.datepicker._inDialog&&d.blockUI?"static":e?"fixed":"absolute",display:"none",left:c.left+"px",top:c.top+"px"});if(!b.inline){c=d.datepicker._get(b,"showAnim");
var f=d.datepicker._get(b,"duration"),h=function(){d.datepicker._datepickerShowing=true;var i=b.dpDiv.find("iframe.ui-datepicker-cover");if(i.length){var g=d.datepicker._getBorders(b.dpDiv);i.css({left:-g[0],top:-g[1],width:b.dpDiv.outerWidth(),height:b.dpDiv.outerHeight()})}};b.dpDiv.zIndex(d(a).zIndex()+1);d.effects&&d.effects[c]?b.dpDiv.show(c,d.datepicker._get(b,"showOptions"),f,h):b.dpDiv[c||"show"](c?f:null,h);if(!c||!f)h();b.input.is(":visible")&&!b.input.is(":disabled")&&b.input.focus();d.datepicker._curInst=
b}}},_updateDatepicker:function(a){var b=this,c=d.datepicker._getBorders(a.dpDiv);a.dpDiv.empty().append(this._generateHTML(a));var e=a.dpDiv.find("iframe.ui-datepicker-cover");e.length&&e.css({left:-c[0],top:-c[1],width:a.dpDiv.outerWidth(),height:a.dpDiv.outerHeight()});a.dpDiv.find("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a").bind("mouseout",function(){d(this).removeClass("ui-state-hover");this.className.indexOf("ui-datepicker-prev")!=-1&&d(this).removeClass("ui-datepicker-prev-hover");
this.className.indexOf("ui-datepicker-next")!=-1&&d(this).removeClass("ui-datepicker-next-hover")}).bind("mouseover",function(){if(!b._isDisabledDatepicker(a.inline?a.dpDiv.parent()[0]:a.input[0])){d(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");d(this).addClass("ui-state-hover");this.className.indexOf("ui-datepicker-prev")!=-1&&d(this).addClass("ui-datepicker-prev-hover");this.className.indexOf("ui-datepicker-next")!=-1&&d(this).addClass("ui-datepicker-next-hover")}}).end().find("."+
this._dayOverClass+" a").trigger("mouseover").end();c=this._getNumberOfMonths(a);e=c[1];e>1?a.dpDiv.addClass("ui-datepicker-multi-"+e).css("width",17*e+"em"):a.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");a.dpDiv[(c[0]!=1||c[1]!=1?"add":"remove")+"Class"]("ui-datepicker-multi");a.dpDiv[(this._get(a,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl");a==d.datepicker._curInst&&d.datepicker._datepickerShowing&&a.input&&a.input.is(":visible")&&!a.input.is(":disabled")&&
a.input[0]!=document.activeElement&&a.input.focus();if(a.yearshtml){var f=a.yearshtml;setTimeout(function(){f===a.yearshtml&&a.dpDiv.find("select.ui-datepicker-year:first").replaceWith(a.yearshtml);f=a.yearshtml=null},0)}},_getBorders:function(a){var b=function(c){return{thin:1,medium:2,thick:3}[c]||c};return[parseFloat(b(a.css("border-left-width"))),parseFloat(b(a.css("border-top-width")))]},_checkOffset:function(a,b,c){var e=a.dpDiv.outerWidth(),f=a.dpDiv.outerHeight(),h=a.input?a.input.outerWidth():
0,i=a.input?a.input.outerHeight():0,g=document.documentElement.clientWidth+d(document).scrollLeft(),j=document.documentElement.clientHeight+d(document).scrollTop();b.left-=this._get(a,"isRTL")?e-h:0;b.left-=c&&b.left==a.input.offset().left?d(document).scrollLeft():0;b.top-=c&&b.top==a.input.offset().top+i?d(document).scrollTop():0;b.left-=Math.min(b.left,b.left+e>g&&g>e?Math.abs(b.left+e-g):0);b.top-=Math.min(b.top,b.top+f>j&&j>f?Math.abs(f+i):0);return b},_findPos:function(a){for(var b=this._get(this._getInst(a),
"isRTL");a&&(a.type=="hidden"||a.nodeType!=1||d.expr.filters.hidden(a));)a=a[b?"previousSibling":"nextSibling"];a=d(a).offset();return[a.left,a.top]},_hideDatepicker:function(a){var b=this._curInst;if(!(!b||a&&b!=d.data(a,"datepicker")))if(this._datepickerShowing){a=this._get(b,"showAnim");var c=this._get(b,"duration"),e=function(){d.datepicker._tidyDialog(b);this._curInst=null};d.effects&&d.effects[a]?b.dpDiv.hide(a,d.datepicker._get(b,"showOptions"),c,e):b.dpDiv[a=="slideDown"?"slideUp":a=="fadeIn"?
"fadeOut":"hide"](a?c:null,e);a||e();if(a=this._get(b,"onClose"))a.apply(b.input?b.input[0]:null,[b.input?b.input.val():"",b]);this._datepickerShowing=false;this._lastInput=null;if(this._inDialog){this._dialogInput.css({position:"absolute",left:"0",top:"-100px"});if(d.blockUI){d.unblockUI();d("body").append(this.dpDiv)}}this._inDialog=false}},_tidyDialog:function(a){a.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")},_checkExternalClick:function(a){if(d.datepicker._curInst){a=
d(a.target);a[0].id!=d.datepicker._mainDivId&&a.parents("#"+d.datepicker._mainDivId).length==0&&!a.hasClass(d.datepicker.markerClassName)&&!a.hasClass(d.datepicker._triggerClass)&&d.datepicker._datepickerShowing&&!(d.datepicker._inDialog&&d.blockUI)&&d.datepicker._hideDatepicker()}},_adjustDate:function(a,b,c){a=d(a);var e=this._getInst(a[0]);if(!this._isDisabledDatepicker(a[0])){this._adjustInstDate(e,b+(c=="M"?this._get(e,"showCurrentAtPos"):0),c);this._updateDatepicker(e)}},_gotoToday:function(a){a=
d(a);var b=this._getInst(a[0]);if(this._get(b,"gotoCurrent")&&b.currentDay){b.selectedDay=b.currentDay;b.drawMonth=b.selectedMonth=b.currentMonth;b.drawYear=b.selectedYear=b.currentYear}else{var c=new Date;b.selectedDay=c.getDate();b.drawMonth=b.selectedMonth=c.getMonth();b.drawYear=b.selectedYear=c.getFullYear()}this._notifyChange(b);this._adjustDate(a)},_selectMonthYear:function(a,b,c){a=d(a);var e=this._getInst(a[0]);e._selectingMonthYear=false;e["selected"+(c=="M"?"Month":"Year")]=e["draw"+(c==
"M"?"Month":"Year")]=parseInt(b.options[b.selectedIndex].value,10);this._notifyChange(e);this._adjustDate(a)},_clickMonthYear:function(a){var b=this._getInst(d(a)[0]);b.input&&b._selectingMonthYear&&setTimeout(function(){b.input.focus()},0);b._selectingMonthYear=!b._selectingMonthYear},_selectDay:function(a,b,c,e){var f=d(a);if(!(d(e).hasClass(this._unselectableClass)||this._isDisabledDatepicker(f[0]))){f=this._getInst(f[0]);f.selectedDay=f.currentDay=d("a",e).html();f.selectedMonth=f.currentMonth=
b;f.selectedYear=f.currentYear=c;this._selectDate(a,this._formatDate(f,f.currentDay,f.currentMonth,f.currentYear))}},_clearDate:function(a){a=d(a);this._getInst(a[0]);this._selectDate(a,"")},_selectDate:function(a,b){a=this._getInst(d(a)[0]);b=b!=null?b:this._formatDate(a);a.input&&a.input.val(b);this._updateAlternate(a);var c=this._get(a,"onSelect");if(c)c.apply(a.input?a.input[0]:null,[b,a]);else a.input&&a.input.trigger("change");if(a.inline)this._updateDatepicker(a);else{this._hideDatepicker();
this._lastInput=a.input[0];typeof a.input[0]!="object"&&a.input.focus();this._lastInput=null}},_updateAlternate:function(a){var b=this._get(a,"altField");if(b){var c=this._get(a,"altFormat")||this._get(a,"dateFormat"),e=this._getDate(a),f=this.formatDate(c,e,this._getFormatConfig(a));d(b).each(function(){d(this).val(f)})}},noWeekends:function(a){a=a.getDay();return[a>0&&a<6,""]},iso8601Week:function(a){a=new Date(a.getTime());a.setDate(a.getDate()+4-(a.getDay()||7));var b=a.getTime();a.setMonth(0);
a.setDate(1);return Math.floor(Math.round((b-a)/864E5)/7)+1},parseDate:function(a,b,c){if(a==null||b==null)throw"Invalid arguments";b=typeof b=="object"?b.toString():b+"";if(b=="")return null;var e=(c?c.shortYearCutoff:null)||this._defaults.shortYearCutoff;e=typeof e!="string"?e:(new Date).getFullYear()%100+parseInt(e,10);for(var f=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,h=(c?c.dayNames:null)||this._defaults.dayNames,i=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort,g=(c?
c.monthNames:null)||this._defaults.monthNames,j=c=-1,l=-1,u=-1,k=false,o=function(p){(p=z+1<a.length&&a.charAt(z+1)==p)&&z++;return p},m=function(p){var v=o(p);p=new RegExp("^\\d{1,"+(p=="@"?14:p=="!"?20:p=="y"&&v?4:p=="o"?3:2)+"}");p=b.substring(s).match(p);if(!p)throw"Missing number at position "+s;s+=p[0].length;return parseInt(p[0],10)},n=function(p,v,H){p=o(p)?H:v;for(v=0;v<p.length;v++)if(b.substr(s,p[v].length).toLowerCase()==p[v].toLowerCase()){s+=p[v].length;return v+1}throw"Unknown name at position "+
s;},r=function(){if(b.charAt(s)!=a.charAt(z))throw"Unexpected literal at position "+s;s++},s=0,z=0;z<a.length;z++)if(k)if(a.charAt(z)=="'"&&!o("'"))k=false;else r();else switch(a.charAt(z)){case "d":l=m("d");break;case "D":n("D",f,h);break;case "o":u=m("o");break;case "m":j=m("m");break;case "M":j=n("M",i,g);break;case "y":c=m("y");break;case "@":var w=new Date(m("@"));c=w.getFullYear();j=w.getMonth()+1;l=w.getDate();break;case "!":w=new Date((m("!")-this._ticksTo1970)/1E4);c=w.getFullYear();j=w.getMonth()+
1;l=w.getDate();break;case "'":if(o("'"))r();else k=true;break;default:r()}if(c==-1)c=(new Date).getFullYear();else if(c<100)c+=(new Date).getFullYear()-(new Date).getFullYear()%100+(c<=e?0:-100);if(u>-1){j=1;l=u;do{e=this._getDaysInMonth(c,j-1);if(l<=e)break;j++;l-=e}while(1)}w=this._daylightSavingAdjust(new Date(c,j-1,l));if(w.getFullYear()!=c||w.getMonth()+1!=j||w.getDate()!=l)throw"Invalid date";return w},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",
RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925))*24*60*60*1E7,formatDate:function(a,b,c){if(!b)return"";var e=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,f=(c?c.dayNames:null)||this._defaults.dayNames,h=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort;c=(c?c.monthNames:null)||this._defaults.monthNames;var i=function(o){(o=k+1<a.length&&
a.charAt(k+1)==o)&&k++;return o},g=function(o,m,n){m=""+m;if(i(o))for(;m.length<n;)m="0"+m;return m},j=function(o,m,n,r){return i(o)?r[m]:n[m]},l="",u=false;if(b)for(var k=0;k<a.length;k++)if(u)if(a.charAt(k)=="'"&&!i("'"))u=false;else l+=a.charAt(k);else switch(a.charAt(k)){case "d":l+=g("d",b.getDate(),2);break;case "D":l+=j("D",b.getDay(),e,f);break;case "o":l+=g("o",(b.getTime()-(new Date(b.getFullYear(),0,0)).getTime())/864E5,3);break;case "m":l+=g("m",b.getMonth()+1,2);break;case "M":l+=j("M",
b.getMonth(),h,c);break;case "y":l+=i("y")?b.getFullYear():(b.getYear()%100<10?"0":"")+b.getYear()%100;break;case "@":l+=b.getTime();break;case "!":l+=b.getTime()*1E4+this._ticksTo1970;break;case "'":if(i("'"))l+="'";else u=true;break;default:l+=a.charAt(k)}return l},_possibleChars:function(a){for(var b="",c=false,e=function(h){(h=f+1<a.length&&a.charAt(f+1)==h)&&f++;return h},f=0;f<a.length;f++)if(c)if(a.charAt(f)=="'"&&!e("'"))c=false;else b+=a.charAt(f);else switch(a.charAt(f)){case "d":case "m":case "y":case "@":b+=
"0123456789";break;case "D":case "M":return null;case "'":if(e("'"))b+="'";else c=true;break;default:b+=a.charAt(f)}return b},_get:function(a,b){return a.settings[b]!==A?a.settings[b]:this._defaults[b]},_setDateFromField:function(a,b){if(a.input.val()!=a.lastVal){var c=this._get(a,"dateFormat"),e=a.lastVal=a.input?a.input.val():null,f,h;f=h=this._getDefaultDate(a);var i=this._getFormatConfig(a);try{f=this.parseDate(c,e,i)||h}catch(g){this.log(g);e=b?"":e}a.selectedDay=f.getDate();a.drawMonth=a.selectedMonth=
f.getMonth();a.drawYear=a.selectedYear=f.getFullYear();a.currentDay=e?f.getDate():0;a.currentMonth=e?f.getMonth():0;a.currentYear=e?f.getFullYear():0;this._adjustInstDate(a)}},_getDefaultDate:function(a){return this._restrictMinMax(a,this._determineDate(a,this._get(a,"defaultDate"),new Date))},_determineDate:function(a,b,c){var e=function(h){var i=new Date;i.setDate(i.getDate()+h);return i},f=function(h){try{return d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),h,d.datepicker._getFormatConfig(a))}catch(i){}var g=
(h.toLowerCase().match(/^c/)?d.datepicker._getDate(a):null)||new Date,j=g.getFullYear(),l=g.getMonth();g=g.getDate();for(var u=/([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,k=u.exec(h);k;){switch(k[2]||"d"){case "d":case "D":g+=parseInt(k[1],10);break;case "w":case "W":g+=parseInt(k[1],10)*7;break;case "m":case "M":l+=parseInt(k[1],10);g=Math.min(g,d.datepicker._getDaysInMonth(j,l));break;case "y":case "Y":j+=parseInt(k[1],10);g=Math.min(g,d.datepicker._getDaysInMonth(j,l));break}k=u.exec(h)}return new Date(j,
l,g)};if(b=(b=b==null||b===""?c:typeof b=="string"?f(b):typeof b=="number"?isNaN(b)?c:e(b):new Date(b.getTime()))&&b.toString()=="Invalid Date"?c:b){b.setHours(0);b.setMinutes(0);b.setSeconds(0);b.setMilliseconds(0)}return this._daylightSavingAdjust(b)},_daylightSavingAdjust:function(a){if(!a)return null;a.setHours(a.getHours()>12?a.getHours()+2:0);return a},_setDate:function(a,b,c){var e=!b,f=a.selectedMonth,h=a.selectedYear;b=this._restrictMinMax(a,this._determineDate(a,b,new Date));a.selectedDay=
a.currentDay=b.getDate();a.drawMonth=a.selectedMonth=a.currentMonth=b.getMonth();a.drawYear=a.selectedYear=a.currentYear=b.getFullYear();if((f!=a.selectedMonth||h!=a.selectedYear)&&!c)this._notifyChange(a);this._adjustInstDate(a);if(a.input)a.input.val(e?"":this._formatDate(a))},_getDate:function(a){return!a.currentYear||a.input&&a.input.val()==""?null:this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay))},_generateHTML:function(a){var b=new Date;b=this._daylightSavingAdjust(new Date(b.getFullYear(),
b.getMonth(),b.getDate()));var c=this._get(a,"isRTL"),e=this._get(a,"showButtonPanel"),f=this._get(a,"hideIfNoPrevNext"),h=this._get(a,"navigationAsDateFormat"),i=this._getNumberOfMonths(a),g=this._get(a,"showCurrentAtPos"),j=this._get(a,"stepMonths"),l=i[0]!=1||i[1]!=1,u=this._daylightSavingAdjust(!a.currentDay?new Date(9999,9,9):new Date(a.currentYear,a.currentMonth,a.currentDay)),k=this._getMinMaxDate(a,"min"),o=this._getMinMaxDate(a,"max");g=a.drawMonth-g;var m=a.drawYear;if(g<0){g+=12;m--}if(o){var n=
this._daylightSavingAdjust(new Date(o.getFullYear(),o.getMonth()-i[0]*i[1]+1,o.getDate()));for(n=k&&n<k?k:n;this._daylightSavingAdjust(new Date(m,g,1))>n;){g--;if(g<0){g=11;m--}}}a.drawMonth=g;a.drawYear=m;n=this._get(a,"prevText");n=!h?n:this.formatDate(n,this._daylightSavingAdjust(new Date(m,g-j,1)),this._getFormatConfig(a));n=this._canAdjustMonth(a,-1,m,g)?'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_'+y+".datepicker._adjustDate('#"+a.id+"', -"+j+", 'M');\" title=\""+n+'"><span class="ui-icon ui-icon-circle-triangle-'+
(c?"e":"w")+'">'+n+"</span></a>":f?"":'<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+n+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"e":"w")+'">'+n+"</span></a>";var r=this._get(a,"nextText");r=!h?r:this.formatDate(r,this._daylightSavingAdjust(new Date(m,g+j,1)),this._getFormatConfig(a));f=this._canAdjustMonth(a,+1,m,g)?'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_'+y+".datepicker._adjustDate('#"+a.id+"', +"+j+", 'M');\" title=\""+r+'"><span class="ui-icon ui-icon-circle-triangle-'+
(c?"w":"e")+'">'+r+"</span></a>":f?"":'<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+r+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"w":"e")+'">'+r+"</span></a>";j=this._get(a,"currentText");r=this._get(a,"gotoCurrent")&&a.currentDay?u:b;j=!h?j:this.formatDate(j,r,this._getFormatConfig(a));h=!a.inline?'<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_'+y+'.datepicker._hideDatepicker();">'+this._get(a,
"closeText")+"</button>":"";e=e?'<div class="ui-datepicker-buttonpane ui-widget-content">'+(c?h:"")+(this._isInRange(a,r)?'<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_'+y+".datepicker._gotoToday('#"+a.id+"');\">"+j+"</button>":"")+(c?"":h)+"</div>":"";h=parseInt(this._get(a,"firstDay"),10);h=isNaN(h)?0:h;j=this._get(a,"showWeek");r=this._get(a,"dayNames");this._get(a,"dayNamesShort");var s=this._get(a,"dayNamesMin"),z=
this._get(a,"monthNames"),w=this._get(a,"monthNamesShort"),p=this._get(a,"beforeShowDay"),v=this._get(a,"showOtherMonths"),H=this._get(a,"selectOtherMonths");this._get(a,"calculateWeek");for(var L=this._getDefaultDate(a),I="",D=0;D<i[0];D++){for(var M="",E=0;E<i[1];E++){var N=this._daylightSavingAdjust(new Date(m,g,a.selectedDay)),t=" ui-corner-all",x="";if(l){x+='<div class="ui-datepicker-group';if(i[1]>1)switch(E){case 0:x+=" ui-datepicker-group-first";t=" ui-corner-"+(c?"right":"left");break;case i[1]-
1:x+=" ui-datepicker-group-last";t=" ui-corner-"+(c?"left":"right");break;default:x+=" ui-datepicker-group-middle";t="";break}x+='">'}x+='<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix'+t+'">'+(/all|left/.test(t)&&D==0?c?f:n:"")+(/all|right/.test(t)&&D==0?c?n:f:"")+this._generateMonthYearHeader(a,g,m,k,o,D>0||E>0,z,w)+'</div><table class="ui-datepicker-calendar"><thead><tr>';var B=j?'<th class="ui-datepicker-week-col">'+this._get(a,"weekHeader")+"</th>":"";for(t=0;t<7;t++){var q=
(t+h)%7;B+="<th"+((t+h+6)%7>=5?' class="ui-datepicker-week-end"':"")+'><span title="'+r[q]+'">'+s[q]+"</span></th>"}x+=B+"</tr></thead><tbody>";B=this._getDaysInMonth(m,g);if(m==a.selectedYear&&g==a.selectedMonth)a.selectedDay=Math.min(a.selectedDay,B);t=(this._getFirstDayOfMonth(m,g)-h+7)%7;B=l?6:Math.ceil((t+B)/7);q=this._daylightSavingAdjust(new Date(m,g,1-t));for(var O=0;O<B;O++){x+="<tr>";var P=!j?"":'<td class="ui-datepicker-week-col">'+this._get(a,"calculateWeek")(q)+"</td>";for(t=0;t<7;t++){var G=
p?p.apply(a.input?a.input[0]:null,[q]):[true,""],C=q.getMonth()!=g,J=C&&!H||!G[0]||k&&q<k||o&&q>o;P+='<td class="'+((t+h+6)%7>=5?" ui-datepicker-week-end":"")+(C?" ui-datepicker-other-month":"")+(q.getTime()==N.getTime()&&g==a.selectedMonth&&a._keyEvent||L.getTime()==q.getTime()&&L.getTime()==N.getTime()?" "+this._dayOverClass:"")+(J?" "+this._unselectableClass+" ui-state-disabled":"")+(C&&!v?"":" "+G[1]+(q.getTime()==u.getTime()?" "+this._currentClass:"")+(q.getTime()==b.getTime()?" ui-datepicker-today":
""))+'"'+((!C||v)&&G[2]?' title="'+G[2]+'"':"")+(J?"":' onclick="DP_jQuery_'+y+".datepicker._selectDay('#"+a.id+"',"+q.getMonth()+","+q.getFullYear()+', this);return false;"')+">"+(C&&!v?"&#xa0;":J?'<span class="ui-state-default">'+q.getDate()+"</span>":'<a class="ui-state-default'+(q.getTime()==b.getTime()?" ui-state-highlight":"")+(q.getTime()==u.getTime()?" ui-state-active":"")+(C?" ui-priority-secondary":"")+'" href="#">'+q.getDate()+"</a>")+"</td>";q.setDate(q.getDate()+1);q=this._daylightSavingAdjust(q)}x+=
P+"</tr>"}g++;if(g>11){g=0;m++}x+="</tbody></table>"+(l?"</div>"+(i[0]>0&&E==i[1]-1?'<div class="ui-datepicker-row-break"></div>':""):"");M+=x}I+=M}I+=e+(d.browser.msie&&parseInt(d.browser.version,10)<7&&!a.inline?'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>':"");a._keyEvent=false;return I},_generateMonthYearHeader:function(a,b,c,e,f,h,i,g){var j=this._get(a,"changeMonth"),l=this._get(a,"changeYear"),u=this._get(a,"showMonthAfterYear"),k='<div class="ui-datepicker-title">',
o="";if(h||!j)o+='<span class="ui-datepicker-month">'+i[b]+"</span>";else{i=e&&e.getFullYear()==c;var m=f&&f.getFullYear()==c;o+='<select class="ui-datepicker-month" onchange="DP_jQuery_'+y+".datepicker._selectMonthYear('#"+a.id+"', this, 'M');\" onclick=\"DP_jQuery_"+y+".datepicker._clickMonthYear('#"+a.id+"');\">";for(var n=0;n<12;n++)if((!i||n>=e.getMonth())&&(!m||n<=f.getMonth()))o+='<option value="'+n+'"'+(n==b?' selected="selected"':"")+">"+g[n]+"</option>";o+="</select>"}u||(k+=o+(h||!(j&&
l)?"&#xa0;":""));if(!a.yearshtml){a.yearshtml="";if(h||!l)k+='<span class="ui-datepicker-year">'+c+"</span>";else{g=this._get(a,"yearRange").split(":");var r=(new Date).getFullYear();i=function(s){s=s.match(/c[+-].*/)?c+parseInt(s.substring(1),10):s.match(/[+-].*/)?r+parseInt(s,10):parseInt(s,10);return isNaN(s)?r:s};b=i(g[0]);g=Math.max(b,i(g[1]||""));b=e?Math.max(b,e.getFullYear()):b;g=f?Math.min(g,f.getFullYear()):g;for(a.yearshtml+='<select class="ui-datepicker-year" onchange="DP_jQuery_'+y+".datepicker._selectMonthYear('#"+
a.id+"', this, 'Y');\" onclick=\"DP_jQuery_"+y+".datepicker._clickMonthYear('#"+a.id+"');\">";b<=g;b++)a.yearshtml+='<option value="'+b+'"'+(b==c?' selected="selected"':"")+">"+b+"</option>";a.yearshtml+="</select>";if(d.browser.mozilla)k+='<select class="ui-datepicker-year"><option value="'+c+'" selected="selected">'+c+"</option></select>";else{k+=a.yearshtml;a.yearshtml=null}}}k+=this._get(a,"yearSuffix");if(u)k+=(h||!(j&&l)?"&#xa0;":"")+o;k+="</div>";return k},_adjustInstDate:function(a,b,c){var e=
a.drawYear+(c=="Y"?b:0),f=a.drawMonth+(c=="M"?b:0);b=Math.min(a.selectedDay,this._getDaysInMonth(e,f))+(c=="D"?b:0);e=this._restrictMinMax(a,this._daylightSavingAdjust(new Date(e,f,b)));a.selectedDay=e.getDate();a.drawMonth=a.selectedMonth=e.getMonth();a.drawYear=a.selectedYear=e.getFullYear();if(c=="M"||c=="Y")this._notifyChange(a)},_restrictMinMax:function(a,b){var c=this._getMinMaxDate(a,"min");a=this._getMinMaxDate(a,"max");b=c&&b<c?c:b;return b=a&&b>a?a:b},_notifyChange:function(a){var b=this._get(a,
"onChangeMonthYear");if(b)b.apply(a.input?a.input[0]:null,[a.selectedYear,a.selectedMonth+1,a])},_getNumberOfMonths:function(a){a=this._get(a,"numberOfMonths");return a==null?[1,1]:typeof a=="number"?[1,a]:a},_getMinMaxDate:function(a,b){return this._determineDate(a,this._get(a,b+"Date"),null)},_getDaysInMonth:function(a,b){return 32-this._daylightSavingAdjust(new Date(a,b,32)).getDate()},_getFirstDayOfMonth:function(a,b){return(new Date(a,b,1)).getDay()},_canAdjustMonth:function(a,b,c,e){var f=this._getNumberOfMonths(a);
c=this._daylightSavingAdjust(new Date(c,e+(b<0?b:f[0]*f[1]),1));b<0&&c.setDate(this._getDaysInMonth(c.getFullYear(),c.getMonth()));return this._isInRange(a,c)},_isInRange:function(a,b){var c=this._getMinMaxDate(a,"min");a=this._getMinMaxDate(a,"max");return(!c||b.getTime()>=c.getTime())&&(!a||b.getTime()<=a.getTime())},_getFormatConfig:function(a){var b=this._get(a,"shortYearCutoff");b=typeof b!="string"?b:(new Date).getFullYear()%100+parseInt(b,10);return{shortYearCutoff:b,dayNamesShort:this._get(a,
"dayNamesShort"),dayNames:this._get(a,"dayNames"),monthNamesShort:this._get(a,"monthNamesShort"),monthNames:this._get(a,"monthNames")}},_formatDate:function(a,b,c,e){if(!b){a.currentDay=a.selectedDay;a.currentMonth=a.selectedMonth;a.currentYear=a.selectedYear}b=b?typeof b=="object"?b:this._daylightSavingAdjust(new Date(e,c,b)):this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay));return this.formatDate(this._get(a,"dateFormat"),b,this._getFormatConfig(a))}});d.fn.datepicker=
function(a){if(!this.length)return this;if(!d.datepicker.initialized){d(document).mousedown(d.datepicker._checkExternalClick).find("body").append(d.datepicker.dpDiv);d.datepicker.initialized=true}var b=Array.prototype.slice.call(arguments,1);if(typeof a=="string"&&(a=="isDisabled"||a=="getDate"||a=="widget"))return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this[0]].concat(b));if(a=="option"&&arguments.length==2&&typeof arguments[1]=="string")return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,
[this[0]].concat(b));return this.each(function(){typeof a=="string"?d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this].concat(b)):d.datepicker._attachDatepicker(this,a)})};d.datepicker=new K;d.datepicker.initialized=false;d.datepicker.uuid=(new Date).getTime();d.datepicker.version="1.8.12";window["DP_jQuery_"+y]=d})(jQuery);
;/*
 * jQuery UI Progressbar 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function(b,d){b.widget("ui.progressbar",{options:{value:0,max:100},min:0,_create:function(){this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({role:"progressbar","aria-valuemin":this.min,"aria-valuemax":this.options.max,"aria-valuenow":this._value()});this.valueDiv=b("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element);this.oldValue=this._value();this._refreshValue()},destroy:function(){this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");
this.valueDiv.remove();b.Widget.prototype.destroy.apply(this,arguments)},value:function(a){if(a===d)return this._value();this._setOption("value",a);return this},_setOption:function(a,c){if(a==="value"){this.options.value=c;this._refreshValue();this._value()===this.options.max&&this._trigger("complete")}b.Widget.prototype._setOption.apply(this,arguments)},_value:function(){var a=this.options.value;if(typeof a!=="number")a=0;return Math.min(this.options.max,Math.max(this.min,a))},_percentage:function(){return 100*
this._value()/this.options.max},_refreshValue:function(){var a=this.value(),c=this._percentage();if(this.oldValue!==a){this.oldValue=a;this._trigger("change")}this.valueDiv.toggle(a>this.min).toggleClass("ui-corner-right",a===this.options.max).width(c.toFixed(0)+"%");this.element.attr("aria-valuenow",a)}});b.extend(b.ui.progressbar,{version:"1.8.12"})})(jQuery);
;/*
 * jQuery UI Effects 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/
 */
jQuery.effects||function(f,j){function n(c){var a;if(c&&c.constructor==Array&&c.length==3)return c;if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c))return[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10)];if(a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c))return[parseFloat(a[1])*2.55,parseFloat(a[2])*2.55,parseFloat(a[3])*2.55];if(a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c))return[parseInt(a[1],
16),parseInt(a[2],16),parseInt(a[3],16)];if(a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c))return[parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16),parseInt(a[3]+a[3],16)];if(/rgba\(0, 0, 0, 0\)/.exec(c))return o.transparent;return o[f.trim(c).toLowerCase()]}function s(c,a){var b;do{b=f.curCSS(c,a);if(b!=""&&b!="transparent"||f.nodeName(c,"body"))break;a="backgroundColor"}while(c=c.parentNode);return n(b)}function p(){var c=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,
a={},b,d;if(c&&c.length&&c[0]&&c[c[0]])for(var e=c.length;e--;){b=c[e];if(typeof c[b]=="string"){d=b.replace(/\-(\w)/g,function(g,h){return h.toUpperCase()});a[d]=c[b]}}else for(b in c)if(typeof c[b]==="string")a[b]=c[b];return a}function q(c){var a,b;for(a in c){b=c[a];if(b==null||f.isFunction(b)||a in t||/scrollbar/.test(a)||!/color/i.test(a)&&isNaN(parseFloat(b)))delete c[a]}return c}function u(c,a){var b={_:0},d;for(d in a)if(c[d]!=a[d])b[d]=a[d];return b}function k(c,a,b,d){if(typeof c=="object"){d=
a;b=null;a=c;c=a.effect}if(f.isFunction(a)){d=a;b=null;a={}}if(typeof a=="number"||f.fx.speeds[a]){d=b;b=a;a={}}if(f.isFunction(b)){d=b;b=null}a=a||{};b=b||a.duration;b=f.fx.off?0:typeof b=="number"?b:b in f.fx.speeds?f.fx.speeds[b]:f.fx.speeds._default;d=d||a.complete;return[c,a,b,d]}function m(c){if(!c||typeof c==="number"||f.fx.speeds[c])return true;if(typeof c==="string"&&!f.effects[c])return true;return false}f.effects={};f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor",
"borderTopColor","borderColor","color","outlineColor"],function(c,a){f.fx.step[a]=function(b){if(!b.colorInit){b.start=s(b.elem,a);b.end=n(b.end);b.colorInit=true}b.elem.style[a]="rgb("+Math.max(Math.min(parseInt(b.pos*(b.end[0]-b.start[0])+b.start[0],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[1]-b.start[1])+b.start[1],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[2]-b.start[2])+b.start[2],10),255),0)+")"}});var o={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,
0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,
211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]},r=["add","remove","toggle"],t={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};f.effects.animateClass=function(c,a,b,
d){if(f.isFunction(b)){d=b;b=null}return this.queue("fx",function(){var e=f(this),g=e.attr("style")||" ",h=q(p.call(this)),l,v=e.attr("className");f.each(r,function(w,i){c[i]&&e[i+"Class"](c[i])});l=q(p.call(this));e.attr("className",v);e.animate(u(h,l),a,b,function(){f.each(r,function(w,i){c[i]&&e[i+"Class"](c[i])});if(typeof e.attr("style")=="object"){e.attr("style").cssText="";e.attr("style").cssText=g}else e.attr("style",g);d&&d.apply(this,arguments)});h=f.queue(this);l=h.splice(h.length-1,1)[0];
h.splice(1,0,l);f.dequeue(this)})};f.fn.extend({_addClass:f.fn.addClass,addClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{add:c},a,b,d]):this._addClass(c)},_removeClass:f.fn.removeClass,removeClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{remove:c},a,b,d]):this._removeClass(c)},_toggleClass:f.fn.toggleClass,toggleClass:function(c,a,b,d,e){return typeof a=="boolean"||a===j?b?f.effects.animateClass.apply(this,[a?{add:c}:{remove:c},b,d,e]):this._toggleClass(c,
a):f.effects.animateClass.apply(this,[{toggle:c},a,b,d])},switchClass:function(c,a,b,d,e){return f.effects.animateClass.apply(this,[{add:a,remove:c},b,d,e])}});f.extend(f.effects,{version:"1.8.12",save:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.data("ec.storage."+a[b],c[0].style[a[b]])},restore:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.css(a[b],c.data("ec.storage."+a[b]))},setMode:function(c,a){if(a=="toggle")a=c.is(":hidden")?"show":"hide";return a},getBaseline:function(c,
a){var b;switch(c[0]){case "top":b=0;break;case "middle":b=0.5;break;case "bottom":b=1;break;default:b=c[0]/a.height}switch(c[1]){case "left":c=0;break;case "center":c=0.5;break;case "right":c=1;break;default:c=c[1]/a.width}return{x:c,y:b}},createWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent();var a={width:c.outerWidth(true),height:c.outerHeight(true),"float":c.css("float")},b=f("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",
border:"none",margin:0,padding:0});c.wrap(b);b=c.parent();if(c.css("position")=="static"){b.css({position:"relative"});c.css({position:"relative"})}else{f.extend(a,{position:c.css("position"),zIndex:c.css("z-index")});f.each(["top","left","bottom","right"],function(d,e){a[e]=c.css(e);if(isNaN(parseInt(a[e],10)))a[e]="auto"});c.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})}return b.css(a).show()},removeWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent().replaceWith(c);
return c},setTransition:function(c,a,b,d){d=d||{};f.each(a,function(e,g){unit=c.cssUnit(g);if(unit[0]>0)d[g]=unit[0]*b+unit[1]});return d}});f.fn.extend({effect:function(c){var a=k.apply(this,arguments),b={options:a[1],duration:a[2],callback:a[3]};a=b.options.mode;var d=f.effects[c];if(f.fx.off||!d)return a?this[a](b.duration,b.callback):this.each(function(){b.callback&&b.callback.call(this)});return d.call(this,b)},_show:f.fn.show,show:function(c){if(m(c))return this._show.apply(this,arguments);
else{var a=k.apply(this,arguments);a[1].mode="show";return this.effect.apply(this,a)}},_hide:f.fn.hide,hide:function(c){if(m(c))return this._hide.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="hide";return this.effect.apply(this,a)}},__toggle:f.fn.toggle,toggle:function(c){if(m(c)||typeof c==="boolean"||f.isFunction(c))return this.__toggle.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="toggle";return this.effect.apply(this,a)}},cssUnit:function(c){var a=this.css(c),
b=[];f.each(["em","px","%","pt"],function(d,e){if(a.indexOf(e)>0)b=[parseFloat(a),e]});return b}});f.easing.jswing=f.easing.swing;f.extend(f.easing,{def:"easeOutQuad",swing:function(c,a,b,d,e){return f.easing[f.easing.def](c,a,b,d,e)},easeInQuad:function(c,a,b,d,e){return d*(a/=e)*a+b},easeOutQuad:function(c,a,b,d,e){return-d*(a/=e)*(a-2)+b},easeInOutQuad:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a+b;return-d/2*(--a*(a-2)-1)+b},easeInCubic:function(c,a,b,d,e){return d*(a/=e)*a*a+b},easeOutCubic:function(c,
a,b,d,e){return d*((a=a/e-1)*a*a+1)+b},easeInOutCubic:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a+b;return d/2*((a-=2)*a*a+2)+b},easeInQuart:function(c,a,b,d,e){return d*(a/=e)*a*a*a+b},easeOutQuart:function(c,a,b,d,e){return-d*((a=a/e-1)*a*a*a-1)+b},easeInOutQuart:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a+b;return-d/2*((a-=2)*a*a*a-2)+b},easeInQuint:function(c,a,b,d,e){return d*(a/=e)*a*a*a*a+b},easeOutQuint:function(c,a,b,d,e){return d*((a=a/e-1)*a*a*a*a+1)+b},easeInOutQuint:function(c,
a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a*a+b;return d/2*((a-=2)*a*a*a*a+2)+b},easeInSine:function(c,a,b,d,e){return-d*Math.cos(a/e*(Math.PI/2))+d+b},easeOutSine:function(c,a,b,d,e){return d*Math.sin(a/e*(Math.PI/2))+b},easeInOutSine:function(c,a,b,d,e){return-d/2*(Math.cos(Math.PI*a/e)-1)+b},easeInExpo:function(c,a,b,d,e){return a==0?b:d*Math.pow(2,10*(a/e-1))+b},easeOutExpo:function(c,a,b,d,e){return a==e?b+d:d*(-Math.pow(2,-10*a/e)+1)+b},easeInOutExpo:function(c,a,b,d,e){if(a==0)return b;if(a==
e)return b+d;if((a/=e/2)<1)return d/2*Math.pow(2,10*(a-1))+b;return d/2*(-Math.pow(2,-10*--a)+2)+b},easeInCirc:function(c,a,b,d,e){return-d*(Math.sqrt(1-(a/=e)*a)-1)+b},easeOutCirc:function(c,a,b,d,e){return d*Math.sqrt(1-(a=a/e-1)*a)+b},easeInOutCirc:function(c,a,b,d,e){if((a/=e/2)<1)return-d/2*(Math.sqrt(1-a*a)-1)+b;return d/2*(Math.sqrt(1-(a-=2)*a)+1)+b},easeInElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=
g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g))+b},easeOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*a)*Math.sin((a*e-c)*2*Math.PI/g)+d+b},easeInOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e/2)==2)return b+d;g||(g=e*0.3*1.5);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/
h);if(a<1)return-0.5*h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)+b;return h*Math.pow(2,-10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)*0.5+d+b},easeInBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;return d*(a/=e)*a*((g+1)*a-g)+b},easeOutBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;return d*((a=a/e-1)*a*((g+1)*a+g)+1)+b},easeInOutBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;if((a/=e/2)<1)return d/2*a*a*(((g*=1.525)+1)*a-g)+b;return d/2*((a-=2)*a*(((g*=1.525)+1)*a+g)+2)+b},easeInBounce:function(c,
a,b,d,e){return d-f.easing.easeOutBounce(c,e-a,0,d,e)+b},easeOutBounce:function(c,a,b,d,e){return(a/=e)<1/2.75?d*7.5625*a*a+b:a<2/2.75?d*(7.5625*(a-=1.5/2.75)*a+0.75)+b:a<2.5/2.75?d*(7.5625*(a-=2.25/2.75)*a+0.9375)+b:d*(7.5625*(a-=2.625/2.75)*a+0.984375)+b},easeInOutBounce:function(c,a,b,d,e){if(a<e/2)return f.easing.easeInBounce(c,a*2,0,d,e)*0.5+b;return f.easing.easeOutBounce(c,a*2-e,0,d,e)*0.5+d*0.5+b}})}(jQuery);
;/*
 * jQuery UI Effects Blind 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Blind
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.blind=function(c){return this.queue(function(){var a=b(this),g=["position","top","bottom","left","right"],f=b.effects.setMode(a,c.options.mode||"hide"),d=c.options.direction||"vertical";b.effects.save(a,g);a.show();var e=b.effects.createWrapper(a).css({overflow:"hidden"}),h=d=="vertical"?"height":"width";d=d=="vertical"?e.height():e.width();f=="show"&&e.css(h,0);var i={};i[h]=f=="show"?d:0;e.animate(i,c.duration,c.options.easing,function(){f=="hide"&&a.hide();b.effects.restore(a,
g);b.effects.removeWrapper(a);c.callback&&c.callback.apply(a[0],arguments);a.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Bounce 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Bounce
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(e){e.effects.bounce=function(b){return this.queue(function(){var a=e(this),l=["position","top","bottom","left","right"],h=e.effects.setMode(a,b.options.mode||"effect"),d=b.options.direction||"up",c=b.options.distance||20,m=b.options.times||5,i=b.duration||250;/show|hide/.test(h)&&l.push("opacity");e.effects.save(a,l);a.show();e.effects.createWrapper(a);var f=d=="up"||d=="down"?"top":"left";d=d=="up"||d=="left"?"pos":"neg";c=b.options.distance||(f=="top"?a.outerHeight({margin:true})/3:a.outerWidth({margin:true})/
3);if(h=="show")a.css("opacity",0).css(f,d=="pos"?-c:c);if(h=="hide")c/=m*2;h!="hide"&&m--;if(h=="show"){var g={opacity:1};g[f]=(d=="pos"?"+=":"-=")+c;a.animate(g,i/2,b.options.easing);c/=2;m--}for(g=0;g<m;g++){var j={},k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing);c=h=="hide"?c*2:c/2}if(h=="hide"){g={opacity:0};g[f]=(d=="pos"?"-=":"+=")+c;a.animate(g,i/2,b.options.easing,function(){a.hide();e.effects.restore(a,l);e.effects.removeWrapper(a);
b.callback&&b.callback.apply(this,arguments)})}else{j={};k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing,function(){e.effects.restore(a,l);e.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments)})}a.queue("fx",function(){a.dequeue()});a.dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Clip 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Clip
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.clip=function(e){return this.queue(function(){var a=b(this),i=["position","top","bottom","left","right","height","width"],f=b.effects.setMode(a,e.options.mode||"hide"),c=e.options.direction||"vertical";b.effects.save(a,i);a.show();var d=b.effects.createWrapper(a).css({overflow:"hidden"});d=a[0].tagName=="IMG"?d:a;var g={size:c=="vertical"?"height":"width",position:c=="vertical"?"top":"left"};c=c=="vertical"?d.height():d.width();if(f=="show"){d.css(g.size,0);d.css(g.position,
c/2)}var h={};h[g.size]=f=="show"?c:0;h[g.position]=f=="show"?0:c/2;d.animate(h,{queue:false,duration:e.duration,easing:e.options.easing,complete:function(){f=="hide"&&a.hide();b.effects.restore(a,i);b.effects.removeWrapper(a);e.callback&&e.callback.apply(a[0],arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Drop 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Drop
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.drop=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right","opacity"],e=c.effects.setMode(a,d.options.mode||"hide"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a);var f=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var g=d.options.distance||(f=="top"?a.outerHeight({margin:true})/2:a.outerWidth({margin:true})/2);if(e=="show")a.css("opacity",0).css(f,b=="pos"?-g:g);var i={opacity:e==
"show"?1:0};i[f]=(e=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+g;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){e=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Explode 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Explode
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(j){j.effects.explode=function(a){return this.queue(function(){var c=a.options.pieces?Math.round(Math.sqrt(a.options.pieces)):3,d=a.options.pieces?Math.round(Math.sqrt(a.options.pieces)):3;a.options.mode=a.options.mode=="toggle"?j(this).is(":visible")?"hide":"show":a.options.mode;var b=j(this).show().css("visibility","hidden"),g=b.offset();g.top-=parseInt(b.css("marginTop"),10)||0;g.left-=parseInt(b.css("marginLeft"),10)||0;for(var h=b.outerWidth(true),i=b.outerHeight(true),e=0;e<c;e++)for(var f=
0;f<d;f++)b.clone().appendTo("body").wrap("<div></div>").css({position:"absolute",visibility:"visible",left:-f*(h/d),top:-e*(i/c)}).parent().addClass("ui-effects-explode").css({position:"absolute",overflow:"hidden",width:h/d,height:i/c,left:g.left+f*(h/d)+(a.options.mode=="show"?(f-Math.floor(d/2))*(h/d):0),top:g.top+e*(i/c)+(a.options.mode=="show"?(e-Math.floor(c/2))*(i/c):0),opacity:a.options.mode=="show"?0:1}).animate({left:g.left+f*(h/d)+(a.options.mode=="show"?0:(f-Math.floor(d/2))*(h/d)),top:g.top+
e*(i/c)+(a.options.mode=="show"?0:(e-Math.floor(c/2))*(i/c)),opacity:a.options.mode=="show"?1:0},a.duration||500);setTimeout(function(){a.options.mode=="show"?b.css({visibility:"visible"}):b.css({visibility:"visible"}).hide();a.callback&&a.callback.apply(b[0]);b.dequeue();j("div.ui-effects-explode").remove()},a.duration||500)})}})(jQuery);
;/*
 * jQuery UI Effects Fade 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Fade
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.fade=function(a){return this.queue(function(){var c=b(this),d=b.effects.setMode(c,a.options.mode||"hide");c.animate({opacity:d},{queue:false,duration:a.duration,easing:a.options.easing,complete:function(){a.callback&&a.callback.apply(this,arguments);c.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Fold 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Fold
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.fold=function(a){return this.queue(function(){var b=c(this),j=["position","top","bottom","left","right"],d=c.effects.setMode(b,a.options.mode||"hide"),g=a.options.size||15,h=!!a.options.horizFirst,k=a.duration?a.duration/2:c.fx.speeds._default/2;c.effects.save(b,j);b.show();var e=c.effects.createWrapper(b).css({overflow:"hidden"}),f=d=="show"!=h,l=f?["width","height"]:["height","width"];f=f?[e.width(),e.height()]:[e.height(),e.width()];var i=/([0-9]+)%/.exec(g);if(i)g=parseInt(i[1],
10)/100*f[d=="hide"?0:1];if(d=="show")e.css(h?{height:0,width:g}:{height:g,width:0});h={};i={};h[l[0]]=d=="show"?f[0]:g;i[l[1]]=d=="show"?f[1]:0;e.animate(h,k,a.options.easing).animate(i,k,a.options.easing,function(){d=="hide"&&b.hide();c.effects.restore(b,j);c.effects.removeWrapper(b);a.callback&&a.callback.apply(b[0],arguments);b.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Highlight 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Highlight
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.highlight=function(c){return this.queue(function(){var a=b(this),e=["backgroundImage","backgroundColor","opacity"],d=b.effects.setMode(a,c.options.mode||"show"),f={backgroundColor:a.css("backgroundColor")};if(d=="hide")f.opacity=0;b.effects.save(a,e);a.show().css({backgroundImage:"none",backgroundColor:c.options.color||"#ffff99"}).animate(f,{queue:false,duration:c.duration,easing:c.options.easing,complete:function(){d=="hide"&&a.hide();b.effects.restore(a,e);d=="show"&&!b.support.opacity&&
this.style.removeAttribute("filter");c.callback&&c.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Pulsate 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Pulsate
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(d){d.effects.pulsate=function(a){return this.queue(function(){var b=d(this),c=d.effects.setMode(b,a.options.mode||"show");times=(a.options.times||5)*2-1;duration=a.duration?a.duration/2:d.fx.speeds._default/2;isVisible=b.is(":visible");animateTo=0;if(!isVisible){b.css("opacity",0).show();animateTo=1}if(c=="hide"&&isVisible||c=="show"&&!isVisible)times--;for(c=0;c<times;c++){b.animate({opacity:animateTo},duration,a.options.easing);animateTo=(animateTo+1)%2}b.animate({opacity:animateTo},duration,
a.options.easing,function(){animateTo==0&&b.hide();a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()}).dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Scale 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Scale
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.puff=function(b){return this.queue(function(){var a=c(this),e=c.effects.setMode(a,b.options.mode||"hide"),g=parseInt(b.options.percent,10)||150,h=g/100,i={height:a.height(),width:a.width()};c.extend(b.options,{fade:true,mode:e,percent:e=="hide"?g:100,from:e=="hide"?i:{height:i.height*h,width:i.width*h}});a.effect("scale",b.options,b.duration,b.callback);a.dequeue()})};c.effects.scale=function(b){return this.queue(function(){var a=c(this),e=c.extend(true,{},b.options),g=c.effects.setMode(a,
b.options.mode||"effect"),h=parseInt(b.options.percent,10)||(parseInt(b.options.percent,10)==0?0:g=="hide"?0:100),i=b.options.direction||"both",f=b.options.origin;if(g!="effect"){e.origin=f||["middle","center"];e.restore=true}f={height:a.height(),width:a.width()};a.from=b.options.from||(g=="show"?{height:0,width:0}:f);h={y:i!="horizontal"?h/100:1,x:i!="vertical"?h/100:1};a.to={height:f.height*h.y,width:f.width*h.x};if(b.options.fade){if(g=="show"){a.from.opacity=0;a.to.opacity=1}if(g=="hide"){a.from.opacity=
1;a.to.opacity=0}}e.from=a.from;e.to=a.to;e.mode=g;a.effect("size",e,b.duration,b.callback);a.dequeue()})};c.effects.size=function(b){return this.queue(function(){var a=c(this),e=["position","top","bottom","left","right","width","height","overflow","opacity"],g=["position","top","bottom","left","right","overflow","opacity"],h=["width","height","overflow"],i=["fontSize"],f=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"],k=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"],
p=c.effects.setMode(a,b.options.mode||"effect"),n=b.options.restore||false,m=b.options.scale||"both",l=b.options.origin,j={height:a.height(),width:a.width()};a.from=b.options.from||j;a.to=b.options.to||j;if(l){l=c.effects.getBaseline(l,j);a.from.top=(j.height-a.from.height)*l.y;a.from.left=(j.width-a.from.width)*l.x;a.to.top=(j.height-a.to.height)*l.y;a.to.left=(j.width-a.to.width)*l.x}var d={from:{y:a.from.height/j.height,x:a.from.width/j.width},to:{y:a.to.height/j.height,x:a.to.width/j.width}};
if(m=="box"||m=="both"){if(d.from.y!=d.to.y){e=e.concat(f);a.from=c.effects.setTransition(a,f,d.from.y,a.from);a.to=c.effects.setTransition(a,f,d.to.y,a.to)}if(d.from.x!=d.to.x){e=e.concat(k);a.from=c.effects.setTransition(a,k,d.from.x,a.from);a.to=c.effects.setTransition(a,k,d.to.x,a.to)}}if(m=="content"||m=="both")if(d.from.y!=d.to.y){e=e.concat(i);a.from=c.effects.setTransition(a,i,d.from.y,a.from);a.to=c.effects.setTransition(a,i,d.to.y,a.to)}c.effects.save(a,n?e:g);a.show();c.effects.createWrapper(a);
a.css("overflow","hidden").css(a.from);if(m=="content"||m=="both"){f=f.concat(["marginTop","marginBottom"]).concat(i);k=k.concat(["marginLeft","marginRight"]);h=e.concat(f).concat(k);a.find("*[width]").each(function(){child=c(this);n&&c.effects.save(child,h);var o={height:child.height(),width:child.width()};child.from={height:o.height*d.from.y,width:o.width*d.from.x};child.to={height:o.height*d.to.y,width:o.width*d.to.x};if(d.from.y!=d.to.y){child.from=c.effects.setTransition(child,f,d.from.y,child.from);
child.to=c.effects.setTransition(child,f,d.to.y,child.to)}if(d.from.x!=d.to.x){child.from=c.effects.setTransition(child,k,d.from.x,child.from);child.to=c.effects.setTransition(child,k,d.to.x,child.to)}child.css(child.from);child.animate(child.to,b.duration,b.options.easing,function(){n&&c.effects.restore(child,h)})})}a.animate(a.to,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){a.to.opacity===0&&a.css("opacity",a.from.opacity);p=="hide"&&a.hide();c.effects.restore(a,
n?e:g);c.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Shake 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Shake
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(d){d.effects.shake=function(a){return this.queue(function(){var b=d(this),j=["position","top","bottom","left","right"];d.effects.setMode(b,a.options.mode||"effect");var c=a.options.direction||"left",e=a.options.distance||20,l=a.options.times||3,f=a.duration||a.options.duration||140;d.effects.save(b,j);b.show();d.effects.createWrapper(b);var g=c=="up"||c=="down"?"top":"left",h=c=="up"||c=="left"?"pos":"neg";c={};var i={},k={};c[g]=(h=="pos"?"-=":"+=")+e;i[g]=(h=="pos"?"+=":"-=")+e*2;k[g]=
(h=="pos"?"-=":"+=")+e*2;b.animate(c,f,a.options.easing);for(e=1;e<l;e++)b.animate(i,f,a.options.easing).animate(k,f,a.options.easing);b.animate(i,f,a.options.easing).animate(c,f/2,a.options.easing,function(){d.effects.restore(b,j);d.effects.removeWrapper(b);a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()});b.dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Slide 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.slide=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right"],f=c.effects.setMode(a,d.options.mode||"show"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a).css({overflow:"hidden"});var g=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var e=d.options.distance||(g=="top"?a.outerHeight({margin:true}):a.outerWidth({margin:true}));if(f=="show")a.css(g,b=="pos"?isNaN(e)?"-"+e:-e:e);
var i={};i[g]=(f=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+e;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){f=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Transfer 1.8.12
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Transfer
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(e){e.effects.transfer=function(a){return this.queue(function(){var b=e(this),c=e(a.options.to),d=c.offset();c={top:d.top,left:d.left,height:c.innerHeight(),width:c.innerWidth()};d=b.offset();var f=e('<div class="ui-effects-transfer"></div>').appendTo(document.body).addClass(a.options.className).css({top:d.top,left:d.left,height:b.innerHeight(),width:b.innerWidth(),position:"absolute"}).animate(c,a.duration,a.options.easing,function(){f.remove();a.callback&&a.callback.apply(b[0],arguments);
b.dequeue()})})}})(jQuery);
;/**
 * GameGolem v31.5.1116
 * http://rycochet.com/
 * http://code.google.com/p/game-golem/
 *
 * Copyright 2010-2011, Robin Cloutman
 * Licensed under the LGPL Version 3 license.
 * http://www.gnu.org/licenses/lgpl.html
 *
 * Includes jQuery JavaScript Library & jQuery UI
 * http://jquery.com/
 */
(function($){var jQuery=$;/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
// Global variables only
// Shouldn't touch
var isRelease = false;
var script_started = Date.now();
// Version of the script
var version = "31.5";
var revision = 1116;
// Automatically filled from Worker:Main
var userID, imagepath, APP, APPID, APPID_, APPNAME, PREFIX, isFacebook; // All set from Worker:Main
// Detect browser - this is rough detection, mainly for updates - may use jQuery detection at a later point
var browser = 'unknown';
if (navigator.userAgent.indexOf('Chrome') >= 0) {
	browser = 'chrome';
} else if (navigator.userAgent.indexOf('Safari') >= 0) {
	browser = 'safari';
} else if (navigator.userAgent.indexOf('Opera') >= 0) {
	browser = 'opera';
} else if (navigator.userAgent.indexOf('Mozilla') >= 0) {
	browser = 'firefox';
	if (typeof GM_log === 'function') {
		browser = 'greasemonkey'; // Treating separately as Firefox will get a "real" extension at some point.
	}
}
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	browser, window, localStorage, console, chrome
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	version, revision, isRelease
	GM_setValue, GM_getValue, APP, APPID, PREFIX, log:true, debug, userID, imagepath
	length:true
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	Workers, makeImage:true
*/
// Utility functions

// Functions to check type of variable - here for javascript optimisations and readability, makes a miniscule difference using them

/**
 * Check if a passed object is an Array (not an Object)
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isArray = function(obj) {
	return obj && obj.constructor === Array;
};

/**
 * Check if a passed object is an Object (not an Array)
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isObject = function(obj) {
	return obj && obj.constructor === Object;
};

/**
 * Check if a passed object is an Boolean
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isBoolean = function(obj) {
	return obj === true || obj === false;
};

/**
 * Check if a passed object is a Function
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isFunction = function(obj) {
	return obj && obj.constructor === Function;
};

/**
 * Check if a passed object is a RegExp
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isRegExp = function(obj) {
	return obj && obj.constructor === RegExp;
};

/**
 * Check if a passed object is a Worker
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isWorker = function(obj) {
	return obj && obj.constructor === Worker;
};

/**
 * Check if a passed object is an Error
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isError = function(obj) {
	return !!(typeof obj === 'object' && obj.name && obj.message);
};

/**
 * Check if a passed object is a Number
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isNumber = function(obj) {
	return typeof obj === 'number';
};

/**
 * Check if a passed object is a String
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isString = function(obj) {
	return typeof obj === 'string';
};

/**
 * Check if a passed object is Undefined
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isUndefined = function(obj) {
	return typeof obj === 'undefined';
};

/**
 * Check if a passed object is Null
 * @param {*} obj The object we wish to check
 * @return {boolean} If it is or not
 */
var isNull = function(obj) {
	return obj === null;
};

/**
 * Log a message, can have various prefix parts
 * @param {(number|string)} level The level to use (or the txt if only one arg)
 * @param {string=} txt The message to log
 * NOTE: Will be replaced by Debug Worker if present!
 */
var LOG_INFO = 0;
var LOG_LOG = 1
var LOG_WARN = 2;
var LOG_ERROR = 3;
var LOG_DEBUG = 4;
var LOG_USER1 = 5;
var LOG_USER2 = 6;
var LOG_USER3 = 7;
var LOG_USER4 = 8;
var LOG_USER5 = 9;
var log = function(level, txt /*, obj, array etc*/){
	var level, args = Array.prototype.slice.call(arguments), prefix = [],
		date = [true, true, true, true, true, true, true, true, true, true],
		rev = [false, false, true, true, true, true, true, true, true, true],
		worker = [false, true, true, true, true, true, true, true, true, true];
	if (isNumber(args[0])) {
		level = Math.range(0, args.shift(), 9);
	} else if (isError(args[0])) {
		args.shift();
		level = LOG_ERROR;
	} else {
		level = LOG_LOG;
	}
	if (rev[level]) {
		prefix.push('[' + (isRelease ? 'v'+version : 'r'+revision) + ']');
	}
	if (date[level]) {
		prefix.push('[' + (new Date()).toLocaleTimeString() + ']');
	}
	if (worker[level]) {
		prefix.push(Worker.stack.length ? Worker.stack[0] : '');
	}
	args[0] = prefix.join(' ') + (prefix.length && args[0] ? ': ' : '') + (args[0] || '');
	try {
		console.log.apply(console.firebug ? window : console, args);
	} catch(e) { // FF4 fix - doesn't like .apply
		console.log(args);
	}
};

/**
 * Store data in localStorage
 * @param {string} n Name of the item to be stored (normally worker.type)
 * @param {string} v Value to be stored
 */
var setItem = function(n, v) {
	localStorage.setItem('golem.' + APP + '.' + n, v);
};

/**
 * Retreive data from localStorage
 * @param {string} n Name of the item to be stored (normally worker.type)
 * @return {string} Value to be retreived
 */
var getItem = function(n) {
	return localStorage.getItem('golem.' + APP + '.' + n);
};

/**
 * In Firefox / GreaseMonkey we currently use the GM storage area rather than localStorage...
 */
if (browser === 'greasemonkey') {
	setItem = GM_setValue;
	getItem = GM_getValue;
}

// Prototypes to ease functionality

String.prototype.trim = function(inside) {
	if (inside) {
		this.replace(/^\s+$/gm, ' ')
	}
	return this.replace(/^\s+|\s+$/gm, '');
};

String.prototype.filepart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(x+1);
	}
	return this;
};

String.prototype.pathpart = function() {
	var x = this.lastIndexOf('/');
	if (x >= 0) {
		return this.substr(0, x+1);
	}
	return this;
};

String.prototype.regex = function(r) {
	var a = this.match(r), i, rx;
	if (a) {
		if (r.global) {
			if (/(^|[^\\]|[^\\](\\\\)*)\([^?]/.test(r.source)) { // Try to match '(blah' but not '\(blah' or '(?:blah' - ignore invalid regexp
				rx = new RegExp(r.source, (r.ignoreCase ? 'i' : '') + (r.multiline ? 'm' : ''));
			}
		} else {
			a.shift();
		}
		i = a.length;
		while (i--) {
			if (a[i]) {
				if (rx) {
					a[i] = arguments.callee.call(a[i], rx);
				} else {
					if (a[i].search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i) >= 0) {
						a[i] = parseFloat(a[i]);
					}
				}
			}
		}
		if (!rx && a.length === 1) {
			return a[0];
		}
	}
	return a;
};

String.prototype.toNumber = function() {
	return parseFloat(this);
};

String.prototype.parseTimer = function() {
	var a = this.split(':'), b = 0, i;
	for (i=0; i<a.length; i++) {
		b = b * 60 + parseInt(a[i],10);
	}
	if (isNaN(b)) {
		b = 9999;
	}
	return b;
};

String.prototype.ucfirst = function() {
	return this.charAt(0).toUpperCase() + this.substr(1);
};

String.prototype.ucwords = function() {
	return this.replace(/^(.)|\s(.)/g, function($1){
		return $1.toUpperCase();
	});
};

String.prototype.html_escape = function() {
	return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

String.prototype.regexp_escape = function() {
	return this.replace(/([\\\^\$*+\[\]?{}.=!:(|)])/g, '\\$&');
//	return this.replace(/\\/g, '\\\\').replace(/\^/g, '\\^').replace(/\$/g, '\\$').replace(/\./g, '\\.').replace(/\+/g, '\\+').replace(/\*/g, '\\*').replace(/\?/g, '\\?').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\|/g, '\\|');
};

Number.prototype.round = function(dec) {
	return Math.round(this*Math.pow(10,(dec||0))) / Math.pow(10,(dec||0));
};

Number.prototype.SI = function(prec) {
	var a = Math.abs(this), u,
		p = Math.range(1, isNumber(prec) ? prec.round(0) : 3, 16);

	if (a >= 1e18) {
		return this.toExponential(Math.max(0, p - 1));
	}

	else if (a >= 1e17) {
		return (this / 1e15).round(Math.max(0, p - 3)) + 'q';
	} else if (a >= 1e16) {
		return (this / 1e15).round(Math.max(0, p - 2)) + 'q';
	} else if (a >= 1e15) {
		return (this / 1e15).round(Math.max(0, p - 1)) + 'q';
	}

	else if (a >= 1e14) {
		return (this / 1e12).round(Math.max(0, p - 3)) + 't';
	} else if (a >= 1e13) {
		return (this / 1e12).round(Math.max(0, p - 2)) + 't';
	} else if (a >= 1e12) {
		return (this / 1e12).round(Math.max(0, p - 1)) + 't';
	}

	else if (a >= 1e11) {
		return (this / 1e9).round(Math.max(0, p - 3)) + 'b';
	} else if (a >= 1e10) {
		return (this / 1e9).round(Math.max(0, p - 2)) + 'b';
	} else if (a >= 1e9) {
		return (this / 1e9).round(Math.max(0, p - 1)) + 'b';
	}

	else if (a >= 1e8) {
		return (this / 1e6).round(Math.max(0, p - 3)) + 'm';
	} else if (a >= 1e7) {
		return (this / 1e6).round(Math.max(0, p - 2)) + 'm';
	} else if (a >= 1e6) {
		return (this / 1e6).round(Math.max(0, p - 1)) + 'm';
	}

	else if (a >= 1e5) {
		return (this / 1e3).round(Math.max(0, p - 3)) + 'k';
	} else if (a >= 1e4) {
		return (this / 1e3).round(Math.max(0, p - 2)) + 'k';
	} else if (a >= 1e3) {
		return (this / 1e3).round(Math.max(0, p - 1)) + 'k';
	}

	else if (a >= 1e2) {
		return this.round(Math.max(0, p - 3));
	} else if (a >= 1e1) {
		return this.round(Math.max(0, p - 2));
	} else if (a >= 1) {
		return this.round(Math.max(0, p - 1));
	} else if (a === 0) {
		return this;
	}

	return this.toExponential(Math.max(0, p - 1));
};

Number.prototype.addCommas = function(digits) { // Add commas to a number, optionally converting to a Fixed point number
	var n = isNumber(digits) ? this.toFixed(digits) : this.toString(), rx = /^(.*\s)?(\d+)(\d{3}\b)/;
	return n === (n = n.replace(rx, '$1$2,$3')) ? n : arguments.callee.call(n);
};

Math.range = function(min, num, max) {
	return Math.max(min, Math.min(num, max));
};

Array.prototype.unique = function() { // Returns an array with only unique *values*, does not alter original array
	var o = {}, i, l = this.length, r = [];
	for (i = 0; i < l; i++) {
		o[this[i]] = this[i];
	}
	for (i in o) {
		r.push(o[i]);
	}
	return r;
};

Array.prototype.remove = function(value) { // Removes matching elements from an array, alters original
	var i = 0;
	while ((i = this.indexOf(value, i)) >= 0) {
		this.splice(i, 1);
	}
	return this;
};

Array.prototype.find = function(value) { // Returns if a value is found in an array
	return this.indexOf(value) >= 0;
};

Array.prototype.higher = function(value) { // return the lowest entry greater or equal to value, return -1 on failure
	var i = this.length, best = Number.POSITIVE_INFINITY;
	while (i--) {
		if (isNumber(this[i]) && this[i] >= value && this[i] < best) {
			best = this[i];
		}
	}
	return best === Number.POSITIVE_INFINITY ? -1 : best;
};

Array.prototype.lower = function(value) { // return the highest entry lower or equal to value, return -1 on failure
	var i = this.length, best = -1;
	while (i--) {
		if (isNumber(this[i]) && this[i] <= value && this[i] > best) {
			best = this[i];
		}
	}
	return best;
};

Array.prototype.trim = function() { // Remove empty entries
	var i = this.length, arr = [];
	while (i--) {
		if (this[i]) {
			arr.unshift(this[i]);
		}
	}
	return arr;
}

// Used for events in update(event, events)
var isEvent = function(event, worker, type, id) {
	if ((!worker || Worker.find(event.worker) === Worker.find(worker)) && (!type || event.type === type) && (!id || event.id === id)) {
		return true;
	}
	return false;
};
 
/**
 * Used for events in update(event, events)
 * This will leave the event on the events list for another search
 * @param {?string=} worker The worker name we're looking for
 * @param {?string=} type The event type we're looking for
 * @param {?string=} id The event id we're looking for
 * @return {?Object}
 */
Array.prototype.findEvent = function(worker, type, id) {
	if (worker || type || id) {
		this._worker = worker;
		this._type = type;
		this._id = id;
		this._index = -1;
	}
	var length = this.length;
	for (this._index++; this._index<length; this._index++) {
		if (isEvent(this[this._index], this._worker, this._type, this._id)) {
			return this[this._index];
		}
	}
	return null;
};

/**
 * Used for events in update(event, events)
 * This will remove the event from the events list
 * @param {?string=} worker The worker name we're looking for
 * @param {?string=} type The event type we're looking for
 * @param {?string=} id The event id we're looking for
 * @return {?Object}
 */
Array.prototype.getEvent = function(worker, type, id) {
	var event = this.findEvent(worker, type, id);
	if (this._index >= 0 && this._index < this.length) {
		this.splice(this._index--, 1);
	}
	return event;
};

//Array.prototype.inArray = function(value) {for (var i in this) if (this[i] === value) return true;return false;};

var makeTimer = function(sec) {
	var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = Math.floor(sec % 60);
	return (h ? h+':'+(m>9 ? m : '0'+m) : m) + ':' + (s>9 ? s : '0'+s);
};

var Divisor = function(number) { // Find a "nice" value that goes into number up to 20 times
	var num = number, step = 1;
	if (num < 20) {
		return 1;
	}
	while (num > 100) {
		num /= 10;
		step *= 10;
	}
	num -= num % 5;
	if ((number / step) > 40) {
		step *= 5;
	} else if ((number / step) > 20) {
		step *= 2.5;
	}
	return step;
};

var length = function(obj) { // Find the number of entries in an object (also works on arrays)
	if (isArray(obj)) {
		return obj.length;
	} else if (isObject(obj)) {
		var l = 0, i;
		for(i in obj) {
			if (obj.hasOwnProperty(i)) {
				l++;
			}
		}
		return l;
	}
	return 0;
};

var empty = function(x) { // Tests whether an object is empty (also useable for other types)
	var i;
	if (x === undefined || !x) {
		return true;
	} else if (isObject(x)) {
		for (i in x) {
			if (x.hasOwnProperty(i)) {
				return false;
			}
		}
		return true;
	} else if (isArray(x)) {
		return x.length === 0;
	}
	return false;
};

var sum = function(a) { // Adds the values of all array entries together
	var i, t = 0;
	if (isArray(a)) {
		i = a.length;
		while(i--) {
			t += arguments.callee(a[i]);
		}
	} else if (isObject(a)) {
		for(i in a) {
			t += arguments.callee(a[i]);
		}
	} else if (isNumber(a)) {
		return a;
	} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i) >= 0) {
		return parseFloat(a);
	}
	return t;
};

// Maximum numeric value in a tree of objects/arrays
var nmax = function(a) {
	var i, v = Number.NEGATIVE_INFINITY;
	if (arguments.length !== 1) {
		i = arguments.length;
		while (i--) {
			v = Math.max(v, arguments.callee(arguments[i]));
		}
	} else if (isArray(a)) {
		i = a.length;
		while (i--) {
			v = Math.max(v, arguments.callee(a[i]));
		}
	} else if (isObject(a)) {
		for(i in a) {
			v = Math.max(v, arguments.callee(a[i]));
		}
	} else if (isNumber(a)) {
		v = a;
	} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i) >= 0) {
		v = parseFloat(a);
	}
	return v;
};

// Minimum numeric value in a tree of objects/arrays
var nmin = function(a) {
	var i, v = Number.POSITIVE_INFINITY;
	if (arguments.length !== 1) {
		i = arguments.length;
		while (i--) {
			v = Math.min(v, arguments.callee(arguments[i]));
		}
	} else if (isArray(a)) {
		i = a.length;
		while (i--) {
			v = Math.min(v, arguments.callee(a[i]));
		}
	} else if (isObject(a)) {
		for(i in a) {
			v = Math.min(v, arguments.callee(a[i]));
		}
	} else if (isNumber(a)) {
		v = a;
	} else if (isString(a) && a.search(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i) >= 0) {
		v = parseFloat(a);
	}
	return v;
};

var compare = function(left, right) {
	var i;
	if (typeof left !== typeof right) {
		return false;
	}
	if (typeof left === 'object') {
		if (length(left) !== length(right)) {
			return false;
		}
		if (isArray(left)) {
			i = left.length;
			while (i--) {
				if (!compare(left[i], right[i])) {
					return false;
				}
			}
		} else {
			for (i in left) {
				if (left.hasOwnProperty(i)) {
					if (!right.hasOwnProperty(i)) {
						return false;
					} else if (!compare(left[i], right[i])) {
						return false;
					}
				}
			}
			for (i in right) {
				if (right.hasOwnProperty(i) && !left.hasOwnProperty(i)) {
					return false;
				}
			}
		}
	} else {
		return left === right;
	}
	return true;
};

var findInObject = function(obj, value, key) {
	var i;
	if (isObject(obj)) {
		if (isUndefined(key)) {
			for (i in obj) {
				if (obj[i] === value) {
					return i;
				}
			}
		} else {
			for (i in obj) {
				if (obj[i][key] === value) {
					return i;
				}
			}
		}
	}
	return null;
};

var objectIndex = function(obj, index) {
	var i;
	if (isObject(obj)) {
		for (i in obj) {
			if (index-- <= 0) {
				return i;
			}
		}
	}
	return null;
};

var getAttDefList = [];
var getAttDef = function(list, unitfunc, x, count, type, suffix) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], limit = 1e99, attack = 0, defend = 0, i, p, own, x2;
	if (type !== 'monster') {
		x2 = 'tot_' + x;
	}
	if (unitfunc) {
		for (i in list) {
			unitfunc(units, i, list);
		}
	} else {
		units = getAttDefList;
	}
	units.sort(function(a,b) {
		return (list[b][x2] || 0) - (list[a][x2] || 0)
			|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
			|| (list[a].cost || 0) - (list[b].cost || 0);
	});
	if (!suffix) { suffix = ''; }
	// hack for limits of 3 on war equipment
	if (count < 0) {
		limit = 3;
		count = Math.abs(count);
	}
	for (i=0; i<units.length; i++) {
		p = list[units[i]];
		own = isNumber(p.own) ? p.own : 0;
		if (type) {
			Resources.set(['data', '_'+units[i], type+suffix+'_'+x], Math.min(count, limit) || undefined);
			if (Math.min(count, own) > 0) {
				//log(LOG_WARN, 'Utility','Using: '+Math.min(count, own)+' x '+units[i]+' = '+JSON.stringify(p));
				if (!p['use'+suffix]) {
					p['use'+suffix] = {};
				}
				p['use'+suffix][type+suffix+'_'+x] = Math.min(count, own, limit);
			} else if (length(p['use'+suffix])) {
				delete p['use'+suffix][type+suffix+'_'+x];
				if (!length(p['use'+suffix])) {
					delete p['use'+suffix];
				}
			}
		}
		//if (count <= 0) {break;}
		own = Math.min(count, own, limit);
		attack += own * ((p.att || 0) + ((p.stats && p.stats.att) || 0));
		defend += own * ((p.def || 0) + ((p.stats && p.stats.def) || 0));
		count -= own;
	}
	getAttDefList = units;
	return (x==='att'?attack:(0.7*attack)) + (x==='def'?defend:(0.7*defend));
};

var tr = function(list, html, attr) {
	list.push('<tr' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</tr>');
};

var th = function(list, html, attr) {
	list.push('<th' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</th>');
};

var td = function(list, html, attr) {
	list.push('<td' + (attr ? ' ' + attr : '') + '>' + (html || '') + '</td>');
};

var plural = function(i) {
	return (i === 1 ? '' : 's');
};

var makeTime = function(time, format) {
	var d = new Date(time);
	return d.format(format !== undefined && format ? format : 'l g:i a' );
};

// Simulates PHP's date function
Date.prototype.format = function(format) {
	var i, curChar, returnStr = '', replace = Date.replaceChars;
	for (i = 0; i < format.length; i++) {
		curChar = format.charAt(i);
		if (replace[curChar]) {
			returnStr += replace[curChar].call(this);
		} else {
			returnStr += curChar;
		}
	}
	return returnStr;
};

Date.replaceChars = {
	shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	// Day
	d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
	D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
	j: function() { return this.getDate(); },
	l: function() { return Date.replaceChars.longDays[this.getDay()]; },
	N: function() { return this.getDay() + 1; },
	S: function() { return (this.getDate() % 10 === 1 && this.getDate() !== 11 ? 'st' : (this.getDate() % 10 === 2 && this.getDate() !== 12 ? 'nd' : (this.getDate() % 10 === 3 && this.getDate() !== 13 ? 'rd' : 'th'))); },
	w: function() { return this.getDay(); },
	z: function() { return "Not Yet Supported"; },
	R: function() {
		var i = (new Date() - this) / 1000;
		return (i < (24 * 60 * 60) ? 'Today' : i < (2 * 24 * 60 * 60) ? 'Yesterday' : i < (7 * 24 * 60 * 60) ? Math.floor(i / (24 * 60 * 60)) + ' Days Ago' : i < (31 * 24 * 60 * 60) ? Math.floor(i / (7 * 24 * 60 * 60)) + ' Weeks Ago' : i < (365 * 24 * 60 * 60) ? Math.floor(i / (31 * 24 * 60 * 60)) + ' Months Ago' : Math.floor(i / (365 * 24 * 60 * 60)) + ' Years Ago');
	},
	// Week
	W: function() { return "Not Yet Supported"; },
	// Month
	F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
	m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
	M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
	n: function() { return this.getMonth() + 1; },
	t: function() { return "Not Yet Supported"; },
	// Year
	L: function() { return (((this.getFullYear()%4===0)&&(this.getFullYear()%100!==0)) || (this.getFullYear()%400===0)) ? '1' : '0'; },
	o: function() { return "Not Supported"; },
	Y: function() { return this.getFullYear(); },
	y: function() { return ('' + this.getFullYear()).substr(2); },
	// Time
	a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
	A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
	B: function() { return "Not Yet Supported"; },
	g: function() { return this.getHours() % 12 || 12; },
	G: function() { return this.getHours(); },
	h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
	H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
	i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
	s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
	u: function() { return (this.getMilliseconds() < 100 ? '0' : '') + (this.getMilliseconds() < 10 ? '0' : '') + this.getMilliseconds(); },
	// Timezone
	e: function() { return "Not Yet Supported"; },
	I: function() { return "Not Supported"; },
	O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
	P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60)); },
	T: function() { var m = this.getMonth(), result; this.setMonth(0); result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
	Z: function() { return -this.getTimezoneOffset() * 60; },
	// Full Date/Time
	c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
	r: function() { return this.toString(); },
	U: function() { return this.getTime() / 1000; }
};

var calc_rolling_weighted_average = function(object, y_label, y_val, x_label, x_val, limit) {
	var name, label_list, y_label_list, x_label_list;
	name = y_label + '_per_' + x_label;
	object.rwa = object.rwa || {};
	label_list = object.rwa[name] = object.rwa[name] || {};
	y_label_list = label_list[y_label] = label_list[y_label] || [];
	x_label_list = label_list[x_label] = label_list[x_label] || [];
	y_label_list.unshift(y_val);
	x_label_list.unshift(x_val);
	while (y_label_list.length > (limit || 100)) {
		y_label_list.pop();
	}
	while (x_label_list.length > (limit || 100)) {
		x_label_list.pop();
	}
	object['avg_' + name] = sum(y_label_list) / sum(x_label_list);
};

var bestObjValue = function(obj, callback, filter) {// pass an object and a function to create a value from obj[key] - return the best key
	var i, best = null, bestval, val;
	for (i in obj) {
		if (isFunction(filter) && !filter(obj[i])) {
			continue;
		}
		val = callback(obj[i]);
		if (isNumber(val) && (!best || val > bestval)) {
			bestval = val;
			best = i;
		}
	}
	return best;
};

JSON.shallow = function(obj, depth, replacer, space) {
	return JSON.stringify((function(o,d) {
		var i, out;
		if (o && typeof o === 'object') {
			if (isNumber(o.length) && !o.propertyIsEnumerable('length')) {
				if (d > 0) {
					out = [];
					for (i=0; i<o.length; i++) {
						out[i] = arguments.callee(o[i],d-1);
					}
				} else {
					out = '[object Array]';
				}
			} else {
				if (isWorker(o)) {
					out = '[worker ' + o.name + ']';
				} else if (d > 0) {
					out = {};
					for (i in o) {
						out[i] = arguments.callee(o[i],d-1);
					}
				} else {
					out = '[object Object]';
				}
			}
		} else {
			//out = o === undefined ? 'undefined' : o === null ? 'null' : o.toString();
			out = o;
		}
		return out;
	}(obj, depth || 1)), replacer, space);
};

JSON.encode = function(obj, replacer, space, metrics) {
	var i, keys = {}, count = {}, next = 0, nextKey = null, first = true, getKey = function() {
		var key, digits = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length = digits.length;
		do {
			key = nextKey;
			nextKey = (next >= length ? digits[(Math.floor(next / length) - 1) % length] : '') + digits[next % length];
			next++;
		} while (count[nextKey]); // First time we're called we ignore "key", but already have count[] filled
		first = false;
		return key;
	}, check = function(obj) { // Count how many of each key - to decide if we replace them
		var i;
		if (isObject(obj)) {
			for (i in obj) {
				count[i] = (count[i] || 0) + 1;
				arguments.callee(obj[i]);
			}
		} else if (isArray(obj)) {
			for (i=0; i<obj.length; i++) {
				arguments.callee(obj[i]);
			}
		}
	}, encode = function(obj) { // Replace keys where the saved length is more than the used length
		var i, len, to;
		if (isObject(obj)) {
			to = {};
			for (i in obj) {
				len = i.length;
				if ((count[i] * len) > (((count[i] + 1) * nextKey.length) + len + (first ? 12 : 6))) { // total (length of key) > total (length of encoded key) + length of key translation
					if (!keys[i]) {
						keys[i] = getKey();
					}
					to[keys[i]] = arguments.callee(obj[i]);
				} else {
					to[i] = arguments.callee(obj[i]);
				}
			}
		} else if (isArray(obj)) {
			to = [];
			for (i=0; i<obj.length; i++) {
				to[i] = arguments.callee(obj[i]);
			}
		} else {
			to = obj;
		}
		return to;
	};
	if (isObject(obj) || isArray(obj)) {
		if (obj['$']) {
			log(LOG_ERROR, 'Trying to encode an object that already contains a "$" key!!!');
		}
		check(obj);
		getKey(); // Load up the first key, prevent key conflicts
		first = true; // For the "Should I?" check
		obj = encode(obj);
		if (!empty(keys)) {
			obj['$'] = {};
			for (i in keys) {
				obj['$'][keys[i]] = i;
			}
			if (isObject(metrics)) {
				metrics.oh = 6; // 7, -1 for first comma miscount
				metrics.mod = 0;
				metrics.num = length(keys);
				for (i in keys) {
					metrics.oh += i.length + keys[i].length + 6;
					metrics.mod += (keys[i].length - i.length) * count[i];
				}
			}
		}
	}
	return JSON.stringify(obj, replacer, space);
};

JSON.decode = function(str, metrics) {
	var obj = JSON.parse(str), keys = obj['$'], count = {}, decode = function(obj) {
		var i, to;
		if (isObject(obj)) {
			to = {};
			for (i in obj) {
				if (keys[i]) {
					to[keys[i].valueOf()] = arguments.callee(obj[i]);
					count[i] = (count[i] || 0) + 1;
				} else {
					to[i] = arguments.callee(obj[i]);
				}
			}
		} else if (isArray(obj)) {
			to = [];
			for (i=0; i<obj.length; i++) {
				to[i] = arguments.callee(obj[i]);
			}
		} else {
			to = obj;
		}
		return to;
	};
	if (keys) {
		delete obj['$'];
		obj = decode(obj);
		if (isObject(metrics) && !empty(keys)) {
			metrics.oh = 6; // 7, -1 for first comma miscount
			metrics.mod = 0;
			metrics.num = length(keys);
			for (i in keys) {
				metrics.oh += i.length + keys[i].length + 6;
				metrics.mod += (keys[i].length - i.length) * count[i];
			}
		}
	}
	return obj;
};

// Images - either on SVN, or via extension location

var getImage = function(name) {
	if (browser === 'chrome' && chrome && chrome.extension && chrome.extension.getURL) {
		return chrome.extension.getURL('images/'+name+'.png');
	}
	return 'http://game-golem.googlecode.com/svn/trunk/images/'+name+'.png';
};

var makeImage = function(name, title) {
	return '<img class="golem-image" title="' + (title || name.ucfirst()) + '" src="' + getImage(name) + '">';
};

var assert = function(test, msg, type) {
	if (!test) {
		throw {'name':type || 'Assert Error', 'message':msg};
	}
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, browser, localStorage, window,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, isUndefined, isNull, plural, makeTime,
	makeImage, getItem, setItem, empty, compare, error
*/
/* Worker Prototype
   ----------------
new Worker(name, pages, settings)

*** User data***
.id				- If we have a .display then this is the html #id of the worker
.name			- String, the same as our class name.
.pages			- String, list of pages that we want in the form "town.soldiers keep.stats"
.data			- Object, for public reading, automatically saved
.option			- Object, our options, changed from outide ourselves
.temp			- Object, temporary unsaved data for this instance only
.settings		- Object, various values for various sections, default is always false / blank
				system (true/false) - exists for all games
				unsortable (true/false) - stops a worker being sorted in the queue, prevents this.work(true)
				no_disable (true/false) - stops a worker getting disabled
				advanced (true/false) - only visible when "Advanced" is checked
				debug (true/false) - only visible when "Debug" is checked
				before (array of worker names) - never let these workers get before us when sorting
				after (array of worker names) - never let these workers get after us when sorting
				keep (true/false) - without this data is flushed when not used - only keep if other workers regularly access you
				important (true/false) - can interrupt stateful workers [false]
				stateful (true/false) - only interrupt when we return QUEUE_RELEASE from work(true)
				taint (true/false) - don't save unless data is marked as tainted - otherwise will perform a comparison between old and new data
				gm_only (true/false) - only enable worker if we're running under greasemonkey
.display		- Create the display object for the settings page.
.defaults		- Object filled with objects. Assuming in an APP called "castle_age" then myWorker.defaults['castle_age'].* gets copied to myWorker.*

*** User functions - should be in worker if needed ***
.init()			- After the script has loaded, but before anything else has run. Data has been filled, but nothing has been run.
				This is the bext place to put default actions etc...
				Cannot rely on other workers having their data filled out...
.parse(change)  - This can read data from the current page and cannot perform any actions.
				change = false - Not allowed to change *anything*, cannot read from other Workers.
				change = true - Can now change inline and read from other Workers.
				return true - We need to run again with status=1
				return QUEUE_RELEASE - We want to run again with status=1, but feel free to interrupt (makes us stateful)
				return false - We're finished
.work(state)    - Do anything we need to do when it's our turn - this includes page changes. This is part the of Queue worker.
				state = false - It's not our turn, don't start anything if we can't finish in this one call, this.data is null
				state = true - It's our turn, do everything - Only true if not interrupted, this.data is useable
				return true or QUEUE_RELEASE if we *want* to continue working, but can be interrupted
				return QUEUE_CONTINUE if we *need* to continue working and don't want to be interrupted
				return false or QUEUE_FINISH when someone else can work
.update(type,worker)	- Called when the data, options or runtime have been changed
				type = "data", "option", "runtime", "reminder", "watch" or null (only for first call after init())
				worker = null (for worker = this), otherwise another worker (due to _watch())
.get(what)		- Calls this._get(what)
				Official way to get any information from another worker
				Overload for "special" data, and pass up to _get if basic data
.set(what,value)- Calls this._set(what,value)
				Official way to set any information for another worker
				Overload for "special" data, and pass up to _set if basic data

NOTE: If there is a work() but no display() then work(false) will be called before anything on the queue, but it will never be able to have focus (ie, read only)

*** Private data ***
._loaded		- true once ._init() has run
._watching		- List of other workers that want to have .update() after this.update()
._reminders		- List of reminders in 'i...':interval or 't...':timeout format

*** Private functions - only overload if you're sure exactly what you're doing ***
._get(what,def,type)	- Returns the data requested, auto-loads if needed, what is 'path.to.data', default if not found
._set(what,val,type)	- Sets this.data[what] to value, auto-loading if needed. Deletes "empty" data sets (if you don't pass a value)
._push(what,val,type)	- Pushes value onto this.data[what] (as an array), auto-loading if needed.
._pop(what,def,type)	- Pops the data requested (from an array), auto-loads if needed, what is 'path.to.data', default if not found. ** CHANGES DATA **
._shift(what,def,type)	- Shifts the data requested (from an array), auto-loads if needed, what is 'path.to.data', default if not found. ** CHANGES DATA **
._unshift(what,val,type)- Unshifts value onto this.data[what] (as an array), auto-loading if needed.
._transaction(commit)	- Starts a transaction (no args) to allow multilpe _set calls to effectively queue and only write (or clear) with a true (or false) call.

._setup()				- Only ever called once - might even remove us from the list of workers, otherwise loads the data...
._init()				- Calls .init(), loads then saves data (for default values), delete this.data if !nokeep and settings.nodata, then removes itself from use

._load(type)			- Loads data / option from storage, merges with current values, calls .update(type) on change
._save(type)			- Saves data / option to storage, calls .update(type) on change

._flush()				- Calls this._save() then deletes this.data if !this.settings.keep ** PRIVATE **
._unflush()				- Loads .data if it's not there already

._parse(change)			- Calls this.parse(change) inside a try / catch block
._work(state)			- Calls this.work(state) inside a try / catch block

._update(event)			- Calls this.update(event), loading and flushing .data if needed. event = {worker:this, type:'init|data|option|runtime|reminder', [self:true], [id:'reminder id']}

._watch(worker[,path])	- Add a watcher to worker (safe to call multiple times). If anything under "path" is changed will update the watcher
._unwatch(worker[,path])- Removes a watcher from worker (safe to call if not watching). Will remove exact matches or all
._notify(path)			- Updates any workers watching this path or below

._remind(secs,id)		- Calls this._update({worker:this, type:'reminder', id:(id || null)}) after a specified delay. Replaces old 'id' if passed (so only one _remind() per id active)
._revive(secs,id)		- Calls this._update({worker:this, type:'reminder', id:(id || null)}) regularly. Replaces old 'id' if passed (so only one _revive() per id active)
._forget(id)			- Forgets all _remind() and _revive() with the same id
._timer(id)				- Checks if we have an active timer with id

._overload(name,fn)		- Overloads the member function 'name'. this._parent() becomes available for running the original code (it automatically has the same arguments unless passed others)

._pushStack()				- Pushes us onto the "active worker" list for debug messages etc
._popStack()					- Pops us off the "active worker" list
*/

var Workers = {};// 'name':worker

/**
 * Worker class
 * @constructor
 * @param {!string} name Name of the worker
 */
function Worker(name) {
	Workers[name] = this;

	// User data
	this.id = 'golem_panel_'+name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	this.name = name;

	this.defaults = {}; // {'APP':{data:{}, option:{}} - replaces with app-specific data, can be used for any this.* wanted...
	this.settings = {};

	// Data storage
	this['data'] = {};
	this['option'] = {};
	this['runtime'] = null;// {} - set to default runtime values in your worker!
	this['temp'] = {};// Temporary unsaved data for this instance only.
	// Datatypes - one key for each type above
	this._datatypes = {'data':true, 'option':true, 'runtime':true, 'temp':false}; // Used for set/get/save/load. If false then can't save/load.
	this._timestamps = {}; // timestamp of the last time each datatype has been saved
	this._storage = {}; // bytecount of storage, with compression = JSON.stringify(this[type]).length * 2
	this._rawsize = {}; // bytecount of storage, without compression = JSON.stringify(this[type]).length * 2
	this._numvars = {}; // number of keys compressed
	this._taint = {}; // Has anything changed that might need saving?
	this._saving = {}; // Prevent looping on save

	// Default functions - overload if needed, by default calls prototype function - these all affect storage
	this.add = this._add;
	this.get = this._get;
	this.set = this._set;
	this.toggle = this._toggle;
	this.push = this._push;
	this.pop = this._pop;
	this.shift = this._shift;
	this.unshift = this._unshift;

	// Private data
	this._rootpath = true; // Override save path, replaces userID + '.' with ''
	this._loaded = false;
	this._watching = {}; // Watching for changes, path:[workers]
	this._watching_ = {}; // Changes have happened, path:true
	this._reminders = {};
	this._transactions_ = null; // Will only be inside a transaction when this is an array of arrays - [[[path,to,data], value], ...]
	this._updates_ = []; // Pending update events, array of objects, key = .worker + .type
}

// Static Functions
/**
 * @param {(Worker|string)} name Name or ID of the worker. Can also accept a Worker for easier code use.
 * @return {Worker} The found worker
 */
Worker.find = function(name) {
	if (!name) {
		return null;
	}
	try {
		var i;
		if (isString(name)) {
			if (Workers[name]) {
				return Workers[name];
			}
			name = name.toLowerCase();
			for (i in Workers) {
				if (i.toLowerCase() === name || Workers[i].id === name) {
					return Workers[i];
				}
			}
		} else if (isWorker(name)) {
			return name;
		}
	} catch(e) {}
	return null;
};

/**
 * Automatically clear out any pending Update or Save actions. *MUST* be called to work.
 */
Worker.updates = {};
Worker.flushTimer = window.setTimeout(function(){Worker.flush();}, 250); // Kickstart everything running...
Worker.flush = function() {
	var i;
	window.clearTimeout(Worker.flushTimer); // Prevent a pending call from running
	Worker.flushTimer = window.setTimeout(Worker.flush, 1000); // Call flush again in another second
	for (i in Worker.updates) {
//		log(LOG_DEBUG, 'Worker.flush(): '+i+'._update('+JSON.stringify(Workers[i]._updates_)+')');
		Workers[i]._update(null, 'run');
	}
	for (i in Workers) {
//		log(LOG_DEBUG, 'Worker.flush(): '+i+'._flush()');
		Workers[i]._flush();
	}
};

// Static Data
Worker.stack = ['unknown'];// array of active workers, last at the start
Worker._triggers_ = [];// Used for this._trigger
Worker._resize_ = [];// Used for this._resize

// Private functions - only override if you know exactly what you're doing
/**
 * Save all changed datatypes then set a delay to delete this.data if possible
 * NOTE: You should never call this directly - let Worker.flush() handle it instead!
 * @protected
 */
Worker.prototype._flush = function() {
	if (this._loaded) {
		this._pushStack();
		this._save();
		if (this['data'] && !this.settings.keep) {
			delete this['data'];
		}
		this._popStack();
	}
};

/**
 * Adds a value to the current value of one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will add, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @return {*} The value we passed in
 * NOTE: Numbers and strings are old+new, arrays and objects have their contents merged, boolean will toggle the value (and return the new value)
 */
Worker.prototype._add = function(what, value, type, quiet) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_DEBUG, 'Bad type in ' + this.name + '.setAdd('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	if (isUndefined(value)) {
		this._set(what);
	} else if (isBoolean(value)) {
		this._set(what, function(old){
			value = (old = old ? (value ? false : undefined) : true) || false;
			return old;
		}, null, quiet);
	} else if (isNumber(value)) {
		this._set(what, function(old){
			return (isNumber(old) ? old : 0) + value;
		}, null, quiet);
	} else if (isString(value)) {
		this._set(what, function(old){
			return (isString(old) ? old : '') + value;
		}, null, quiet);
	} else if (isArray(value)) {
		this._set(what, function(old){
			return (isArray(old) ? old : []).concat(value);
		}, null, quiet);
	} else if (isObject(value)) {
		this._set(what, function(old){
			return $.extend({}, isObject(old) ? old : {}, value);
		}, null, quiet);
	}
	return value;
};

/**
 * Forget a _remind or _revive timer with a specific id
 * @param {string} id The id to forget
 * @return {boolean}
 */
Worker.prototype._forget = function(id) {
	var forgot = false;
	if (id) {
		if (this._reminders['i' + id]) {
			window.clearInterval(this._reminders['i' + id]);
			delete this._reminders['i' + id];
			forgot = true;
		}
		if (this._reminders['t' + id]) {
			window.clearTimeout(this._reminders['t' + id]);
			delete this._reminders['t' + id];
			forgot = true;
		}
	}
	return forgot;
};

/**
 * Get a value from one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want - (optionally [Object DATA, subpath, to, data] relative to DATA)
 * @param {*} def The default value to return if the path we want doesn't exist
 * @param {string=} type The typeof of data required (or return def)
 * @return {*} The value we want, or the default we passed in
 */
Worker.prototype._get = function(what, def, type) {
	try {
		var i, data, x = isArray(what) ? what.slice(0) : (isString(what) ? what.split('.') : []);
		if (x.length && (isObject(x[0]) || isArray(x[0]))) { // Object or Array
			data = x.shift();
		} else { // String, Number or Undefined etc
			if (!x.length || !(x[0] in this._datatypes)) {
				x.unshift('data');
			}
			if (x[0] === 'data') {
				this._unflush();
			}
			data = this;
			if (isArray(this._transactions_)) {
				for (i=0; i<this._transactions_.length; i++) {
					if (compare(this._transactions_[i][0], x)) {
						break;
					}
				}
				if (i<this._transactions_.length) {
					data = this._transactions_[i][1];
					x = [];
				}
			}
		}
		while (x.length && !isUndefined(data)) {
			data = data[x.shift()];
		}
		if (!isUndefined(data) && (!type || (isFunction(type) && type(data)) || (isString(type) && typeof data === type))) {
			return isNull(data) ? null : data.valueOf();
		}
//		if (!isUndefined(data)) { // NOTE: Without this expect spam on undefined data
//			log(LOG_WARN, 'Bad type in ' + this.name + '.get('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
//		}
	} catch(e) {
		log(e, e.name + ' in ' + this.name + '.get('+JSON.shallow(arguments,2)+'): ' + e.message);
	}
	return def;
};

/**
 * This is called after _setup. All data exists and our worker is valid for this APP
 */
Worker.prototype._init = function(old_revision) {
	if (this._loaded) {
		return;
	}
	this._pushStack();
	this._loaded = true;
	if (this.init) {
		try {
			this.init(old_revision);
		}catch(e) {
			log(e, e.name + ' in ' + this.name + '.init(): ' + e.message);
		}
	}
	this._popStack();
};

/**
 * Load _datatypes from storage, optionally merging wih current data
 * Save the amount of storage space used
 * Clear the _taint[type] value
 * @param {string=} type The _datatype we wish to load. If null then load all _datatypes
 * @param {boolean=} merge If we wish to merge with current data - normally only used in _setup
 */
Worker.prototype._load = function(type, merge) {
	var i, path, raw, data, metrics = {};
	if (!this._datatypes[type]) {
		if (!type) {
			for (i in this._datatypes) {
				if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
					this._load(i);
				}
			}
		}
		return;
	}
	this._pushStack();
	path = (this._rootpath ? userID + '.' : '') + type + '.' + this.name;
	raw = getItem(path);
	if (isString(raw)) { // JSON encoded string
		try {
			this._storage[type] = (path.length + raw.length) * 2; // x2 for unicode
			data = JSON.decode(raw, metrics);
			this._rawsize[type] = this._storage[type] + ((metrics.mod || 0) - (metrics.oh || 0)) * 2; // x2 for unicode
			this._numvars[type] = metrics.num || 0;
		} catch(e) {
			log(e, this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...');
		}
		if (merge && !compare(data, this[type])) {
			this[type] = $.extend(true, {}, this[type], data);
		} else {
			this[type] = data;
			this._taint[type] = false;
		}
	}
	this._popStack();
};

/**
 * Notify on a _watched path change. This can be called explicitely to force a notification, or automatically from _set
 * @param {(array|string)} path The path we want to notify on
 */
Worker.prototype._notify = function(path) {
	var i, j, txt = '';
	path = isArray(path) ? path : path.split('.');
	for (i=0; i<path.length; i++) {
		txt += (i ? '.' : '') + path[i];
		if (isArray(this._watching[txt])) {
			j = this._watching[txt].length;
			while (j--) {
				Workers[this._watching[txt][j]]._update({worker:this.name, type:'watch', id:txt, path:path.join('.')});
			}
		}
	}
};

/**
 * Overload a function allowing the original function to still exist as this._parent() within the new function.
 * @param {string} app The APP we will work on, otherwise will be for any
 * @param {string} name The function name that we are overloading
 * @param {function()} fn The new function
 */
Worker.prototype._overload = function(app, name, fn) {
	var newfn = function() {
		var a = arguments, r, x = this._parent;
		this._parent = function() {
			return arguments.callee._old.apply(this, arguments.length ? arguments : a);
		};
		this._parent._old = arguments.callee._old;
		r = arguments.callee._new.apply(this, a);
		this._parent = x;
		return r;
	};
	newfn._old = (app && this.defaults && this.defaults[app] && this.defaults[app][name] ? this.defaults[app][name] : null) || this[name] || function(){};
	newfn._old = newfn._old._orig || newfn._old; // Support Debug worker
	newfn._new = fn;
	if (app) {
		this.defaults[app] = this.defaults[app] || {};
		if (this.defaults[app][name] && this.defaults[app][name]._orig) { // Support Debug worker
			this.defaults[app][name]._orig = newfn;
		} else {
			this.defaults[app][name] = newfn;
		}
	}
	if (!app || this.defaults[app][name] === this[name]) { // If we've already run _setup
		if (this[name] && this[name]._orig) { // Support Debug worker
			this[name]._orig = newfn;
		} else {
			this[name] = newfn;
		}
	}
};

/**
 * Wrapper for a worker's .parse() function from Page
 * @param {boolean} change Whether the worker is allowed to make changes to the html on the page
 * return {boolean} If the worker wants to change the page
 */
Worker.prototype._parse = function(change) {
	this._pushStack();
	var result = false;
	if (this.parse) {
		try {
			this._unflush();
			result = this.parse(change);
		}catch(e) {
			log(e, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
		}
	}
	this._popStack();
	return result;
};

/**
 * Pops a value from an Array in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*} def The default value to return if the path we want doesn't exist
 * @param {string=} type The typeof of data required (or return def)
 * @return {*} The value we passed in
 * NOTE: This will change the data stored
 */
Worker.prototype._pop = function(what, def, type, quiet) {
	var data;
	this._set(what, function(old){
		old = isArray(old) ? old.slice(0) : [];
		data = old.pop();
		return old;
	}, null, quiet);
	if (!isUndefined(data) && (!type || (isFunction(type) && type(data)) || (isString(type) && typeof data === type))) {
		return isNull(data) ? null : data.valueOf();
	}
	return def;
};

/**
 * Pushes a value to an Array in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will push, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @return {*} The value we passed in
 * NOTE: Unlike _add() this will force the new value to be pushed onto the end of the old value (as an array)
 */
Worker.prototype._push = function(what, value, type, quiet) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_WARN, 'Bad type in ' + this.name + '.push('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	this._set(what, isUndefined(value) ? undefined : function(old){
		old = isArray(old) ? old : [];
		old.push(value);
		return old;
	}, null, quiet);
	return value;
};

/**
 * Removes the current worker from the stack of "Active" workers
 */
Worker.prototype._popStack = function() {
	Worker.stack.shift();
};

/**
 * Adds the current worker to the stack of "Active" workers
 */
Worker.prototype._pushStack = function() {
	Worker.stack.unshift(this.name);
};

/**
 * Starts a window.setInterval reminder event, optionally using an id to prevent multiple intervals with the same id
 * @param {number} seconds How long between events
 * @param {string=} id A unique identifier - trying to set the same id more than once will result in only the most recent timer running
 * @param {(function()|object)=} callback A function to call, or an event object to pass to _update
 * @return {number} The window.setInterval result
 */
Worker.prototype._revive = function(seconds, id, callback) {
	var name = this.name, fn;
	if (isFunction(callback)) {
		fn = function(){callback.apply(Workers[name]);};
	} else if (isObject(callback)) {
		fn = function(){Workers[name]._update(callback, 'run');};
	} else {
		fn = function(){Workers[name]._update({type:'reminder', id:(id || null)}, 'run');};
	}
	if (id && this._reminders['i' + id]) {
		window.clearInterval(this._reminders['i' + id]);
	}
	return (this._reminders['i' + (id || '')] = window.setInterval(fn, Math.max(0, seconds) * 1000));
};

/**
 * Starts a window.setTimeout reminder event, optionally using an id to prevent multiple intervals with the same id
 * @param {number} seconds How long before reminding us
 * @param {string=} id A unique identifier - trying to set the same id more than once will result in only the most recent reminder running
 * @param {(function()|object)=} callback A function to call, or an event object to pass to _update
 * @return {number} The window.setTimeout result
 */
Worker.prototype._remind = function(seconds, id, callback) {
	var name = this.name, fn;
	if (isFunction(callback)) {
		fn = function(){delete Workers[name]._reminders['t' + id];callback.apply(Workers[name]);};
	} else if (isObject(callback)) {
		fn = function(){delete Workers[name]._reminders['t' + id];Workers[name]._update(callback, 'run');};
	} else {
		fn = function(){delete Workers[name]._reminders['t' + id];Workers[name]._update({type:'reminder', id:(id || null)}, 'run');};
	}
	if (id && this._reminders['t' + id]) {
		window.clearTimeout(this._reminders['t' + id]);
	}
	return (this._reminders['t' + (id || '')] = window.setTimeout(fn, Math.max(0, seconds) * 1000));
};

/**
 * Replace _datatype with a completely new object, make sure any _watch notifications fire if the data changes
 * @param {string} type The _datatype to replace
 * @param {object} data The data to replace it with
 */
Worker.prototype._replace = function(type, data) {
	if (type === 'data') {
		this._unflush();
	}
	var i, x, val, old = this[type];
	this[type] = data;
	for (i in this._watching) {
		x = i.split('.');
		if (x[0] === type && this._get(x, 123) !== this._get([old].concat(x), 456)) {
			this._notify(i);
		}
	}
	this._taint[type] = true;
	this._save(type);
};

/**
 * Set up a notification on the window size changing.
 * @param {?Function} fn The function to call on a resize event, otherwise calls _update with type:'resize'
 */
Worker.prototype._resize = function(fn) {
	if (!Worker._resize_.length) {
		$(window).resize(function(){
			var i, w, l=Worker._resize_.length;
			for (i=0; i<l; i++) {
				w = Worker._resize_[i];
				if (isFunction(w)) {
					w();
				} else {
					Worker.find(w)._update('resize', 'run');
				}
			}
		});
	}
	if (isFunction(fn)) {
		Worker._resize_.unshift(fn); // Make sure that functions run before updates
	} else {
		Worker._resize_.push(this.name);
	}
};

/**
 * Save _datatypes to storage
 * Save the amount of storage space used
 * Clear the _taint[type] value
 * Make sure we _update() if we are going to save
 * @param {string=} type The _datatype we wish to save. If null then save all _datatypes
 * @return {boolean} Did we save or not
 */
Worker.prototype._save = function(type) {
	var i, n, v, metrics = {};
	if (this._loaded) {
		if (!type) {
			n = false;
			for (i in this._datatypes) {
				if (this._datatypes.hasOwnProperty(i) && this._datatypes[i]) {
					n = arguments.callee.call(this,i) || n; // Stop Debug noting it as multiple calls
				}
			}
			return n;
		}
		if (!this._datatypes[type] || this._saving[type] || this[type] === undefined || this[type] === null || (this.settings.taint && !this._taint[type])) {
			return false;
		}
		this._saving[type] = true;
		this._update(null, 'run'); // Make sure we flush any pending updates
		this._saving[type] = false;
		try {
			v = JSON.encode(this[type], metrics);
		} catch (e) {
			log(e, e.name + ' in ' + this.name + '.save(' + type + '): ' + e.message);
			return false; // exit so we don't try to save mangled data over good data
		}
		n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name;
		if (this._taint[type] || getItem(n) !== v) { // First two are to save the extra getItem from being called
			this._pushStack();
			this._taint[type] = false;
			this._timestamps[type] = Date.now();
			try {
				setItem(n, v);
				this._storage[type] = (n.length + v.length) * 2; // x2 for unicode
				this._rawsize[type] = this._storage[type] + ((metrics.mod || 0) - (metrics.oh || 0)) * 2; // x2 for unicode
				this._numvars[type] = metrics.num || 0;
			} catch (e2) {
				log(e2, e2.name + ' in ' + this.name + '.save(' + type + '): Saving: ' + e2.message);
			}
			this._popStack();
			return true;
		}
	}
	return false;
};

/**
 * Set a value in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will set it to, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @param {?Boolean} quiet Don't _notify on changes (use sparingly)
 * @return {*} The value we passed in
 */
Worker.prototype._set = function(what, value, type, quiet) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_WARN, 'Bad type in ' + this.name + '.set('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	var i, x = isArray(what) ? what.slice(0) : (isString(what) ? what.split('.') : []), fn = function(data, path, value, depth){
		var i = path[depth];
		switch ((path.length - depth) > 1) { // Can we go deeper?
			case true:
				if (!isObject(data[i])) {
					data[i] = {};
				}
				if (!arguments.callee.call(this, data[i], path, value, depth+1) && depth >= 1 && empty(data[i])) {// Can clear out empty trees completely...
					delete data[i];
					return false;
				}
				break;
			case false:
				if (!compare(value, data[i])) {
					if (!quiet) {
						this._notify(path);// Notify the watchers...
					}
					this._taint[path[0]] = true;
					this._update({type:path[0]});
					if (isUndefined(value)) {
						delete data[i];
						return false;
					} else {
						data[i] = value;
					}
				}
				break;
		}
		return true;
	};
	if (!x.length || !(x[0] in this._datatypes)) {
		x.unshift('data');
	}
	try {
		if (isFunction(value)) { // Transactions need to store the intermediate values in case a future _set within it changes the value again
			value = value.call(this, this._get(x));
		}
		if (isArray(this._transactions_)) { // *Cannot* set data directly while in a transaction
			for (i=0; i<this._transactions_.length; i++) {
				if (compare(this._transactions_[i][0], x)) {
					break;
				}
			}
			this._transactions_[i] = [x, value];
		} else {
			if (x[0] === 'data') {
				this._unflush();
			}
			fn.call(this, this, x, value, 0);
		}
	} catch(e) {
		log(e, e.name + ' in ' + this.name + '.set('+JSON.stringify(arguments,2)+'): ' + e.message);
	}
	return value;
};

/**
 * First function called in our worker. This is where we decide if we are to become an active worker, or should be deleted.
 * Calls .setup() for worker-specific setup.
 */
Worker.prototype._setup = function(old_revision) {
	this._pushStack();
	if (this.settings.system || empty(this.defaults) || this.defaults[APP]) {
		var i;
		if (this.defaults[APP]) {
			for (i in this.defaults[APP]) {
				if (isObject(this.defaults[APP][i]) && isObject(this[i])) {
					this[i] = $.extend(true, {}, this[i], this.defaults[APP][i]);
				} else {
					this[i] = this.defaults[APP][i];
				}
			}
		}
		// NOTE: Really need to move this into .init, and defer .init until when it's actually needed
		for (i in this._datatypes) {// Delete non-existant datatypes
			if (!this[i]) {
				delete this._datatypes[i];
				delete this[i]; // Make sure it's undefined and not null
			} else {
				this._load(i, true); // Merge with default data, first time only
			}
		}
		if (this.setup) {
			try {
				this.setup(old_revision);
			}catch(e) {
				log(e, e.name + ' in ' + this.name + '.setup(): ' + e.message);
			}
		}
	} else { // Get us out of the list!!!
		delete Workers[this.name];
	}
	this._popStack();
};

/**
 * Shifts a value from an Array in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*} def The default value to return if the path we want doesn't exist
 * @param {string=} type The typeof of data required (or return def)
 * @return {*} The value we passed in
 * NOTE: This will change the data stored
 */
Worker.prototype._shift = function(what, def, type, quiet) {
	var data;
	this._set(what, function(old){
		old = isArray(old) ? old.slice(0) : [];
		data = old.shift();
		return old;
	}, null, quiet);
	if (!isUndefined(data) && (!type || (isFunction(type) && type(data)) || (isString(type) && typeof data === type))) {
		return isNull(data) ? null : data.valueOf();
	}
	return def;
};

/**
 * Toggles a boolean value in of one of our _datatypes
 * This is an readability alias
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {?Boolean} keep Do we want to keep false values?
 * @return {*} The current state
 */
Worker.prototype._toggle = function(what, keep, type, quiet) {
	return this._add(what, keep ? true : false, null, quiet);
};

/**
 * Is there an active timer for a specific id?
 * @param {string} id The timer id to check.
 * @return {boolean} True if there is an active timer, false otherwise.
 */
Worker.prototype._timer = function(id) {
	if (id && (this._reminders['i' + id] || this._reminders['t' + id])) {
		return true;
	}
	return false;
};

/**
 * Defer _set changes to allow them to be flushed. While inside a transaction all _set and _get works as normal, however direct access returns pre-transaction data until committed.
 * this._transaction() - BEGIN
 * this._transaction(true) - COMMIT
 * this._transaction(false) - ROLLBACK
 * @param {boolean=} commit Whether to commit changes or not - undefined to begin
 */
Worker.prototype._transaction = function(commit) {
	if (isUndefined(commit)) { // Begin transaction
//		log(LOG_DEBUG, 'Begin Transaction:');
		this._transactions_ = [];
	} else {
		var i, list = this._transactions_;
		this._transactions_ = null; // Both rollback and commit clear current status
		if (commit && isArray(list)) { // Commit transaction
//			log(LOG_DEBUG, 'Commit Transaction:');
			for (i=0; i<list.length; i++) {
//				log(LOG_DEBUG, '...'+JSON.shallow(list[i],2));
				this._set(list[i][0], list[i][1]);
			}
		}
//		else log(LOG_DEBUG, 'Rollback Transaction:');
	}
};

/**
 * Set up a notification on the content of a DOM node changing.
 * Calls _update with the triggered event after short delay to prevent double-notifications
 * @param {(jQuery|string)} selector The selector to notify on
 * @param {string=} id The id we pass to _update, it will pass selector if not set
 */
Worker.prototype._trigger = function(selector, id) {
	if (!Worker._triggers_.length) {
		$('body').bind('DOMNodeInserted', function(event){
			var i, t = Worker._triggers_, $target = $(event.target);
			for (i=0; i<t.length; i++) {
				if ($target.is(t[i][1])) {
					t[i][0]._remind(0.5, '_trigger_'+id, {worker:t[i][0], type:'trigger', id:t[i][2], selector:t[i][1]});
				}
			}
		});
	}
	Worker._triggers_.push([this, selector, id || selector]);
};

/**
 * Make sure we have this.data in memory if needed
 */
Worker.prototype._unflush = function() {
	this._pushStack();
	if (!this._loaded) {
		this._init();
	}
	if (!this.settings.keep && !this.data && this._datatypes.data) {
		this._load('data');
	}
	this._popStack();
};

/**
 * Pushes a value to an Array in one of our _datatypes
 * @param {(string|array)} what The path.to.data / [path, to, data] we want
 * @param {*=} value The value we will push, undefined (not null!) will cause it to be deleted and any empty banches removed
 * @param {string=} type The typeof of data to be set (or return false and don't set anything)
 * @return {*} The value we passed in
 * NOTE: Unlike _add() this will force the new value to be pushed onto the end of the old value (as an array)
 */
Worker.prototype._unshift = function(what, value, type, quiet) {
	if (type && ((isFunction(type) && !type(value)) || (isString(type) && typeof value !== type))) {
//		log(LOG_DEBUG, 'Bad type in ' + this.name + '.unshift('+JSON.shallow(arguments,2)+'): Seen ' + (typeof data));
		return false;
	}
	this._set(what, isUndefined(value) ? undefined : function(old){
		old = isArray(old) ? old : [];
		old.unshift(value);
		return old;
	}, null, quiet);
	return value;
};

/**
 * Remove a _watch notification from a specific path
 * @param {(Worker|string)} worker The worker we wish to remove the notification from
 * @param {string=} path The path we wish to stop watching, or null for all from this
 */
Worker.prototype._unwatch = function(worker, path) {
	if (typeof worker === 'string') {
		worker = Worker.find(worker);
	}
	if (isWorker(worker)) {
		var i;
		if (isString(path)) {
			if (path in worker._watching) {
				worker._watching[path].remove(this.name);
			}
		} else {
			for (i in worker._watching) {
				worker._watching[i].remove(this.name);
			}
		}
		for (i in worker._watching) {
			if (!worker._watching[i].length) {
				delete worker._watching[i];
			}
		}
	}
};

/**
 * Wrapper function for .update()
 * Make sure the event passed is "clean", and be aware that event.worker is stored as a string, but passed to .update() as a Worker
 * If .update() returns true then delete all pending update events
 * @param {(object|string)} event The event that we will copy and pass on to .update(). If it is a string then parse out to event.type
 * @param {string=} action The type of update - "add" (default) will add to the update queue, "delete" will deleting matching events, "purge" will purge the queue completely (use with care), "run" will run through the queue and act on every one (automatically happens every 250ms)
 */
Worker.prototype._update = function(event, action) {
	if (this._loaded) {
		this._pushStack();
		var i, done = false, events, old;
		if (event) {
			if (isString(event)) {
				event = {type:event};
			} else if (!isObject(event)) {
				event = {};
			}
			action = action || 'add';
			if (event.type && (isFunction(this.update) || isFunction(this['update_'+event.type]))) {
				event.worker = isWorker(event.worker) ? event.worker.name : event.worker || this.name;
				if (action === 'add' || action === 'run' || action === 'delete') { // Delete from update queue
					this._updates_.getEvent(event.worker, event.type, event.id);
				}
				if (action === 'add' || action === 'run') { // Add to update queue, old key already deleted
					this._updates_.unshift($.extend({}, event));
				}
				if (action === 'purge') { // Purge the update queue immediately - don't do anything with the entries
					this._updates_ = [];
				}
				if (this._updates_.length) {
					Worker.updates[this.name] = true;
				} else {
					delete Worker.updates[this.name];
				}
			}
		}
		if (action === 'run' && Worker.updates[this.name]) { // Go through the event list and process each one
			this._unflush();
			old = this._updates_;
			this._updates_ = [];
			events = [];
			for (i=0; i<old.length; i++) {
				event = $.extend({}, old[i]);
				event.worker = Worker.find(event.worker || this);
				events.push(event);
			}
			while (!done && events.length) {
				try {
					if (isFunction(this['update_'+events[0].type])) {
						done = this['update_'+events[0].type](events[0], events);
					} else {
						done = this.update(events[0], events);
					}
				}catch(e) {
					log(e, e.name + ' in ' + this.name + '.update(' + JSON.shallow(events[0]) + '): ' + e.message);
				}
				if (done) {
					events = []; // Purely in case we need to add new events below
				} else {
					events.shift();
				}
				while (event = this._updates_.shift()) { // Prevent endless loops, while keeping anything we added
					if (!(event.type in this._datatypes) && !old.findEvent(event.worker, event.type, event.id)) {
						done = false;
						old.push($.extend({}, event));
						event.worker = Worker.find(event.worker || this);
						events.push(event);
					}
				}
			}
			delete Worker.updates[this.name];
		}
		this._popStack();
	}
};

/**
 * Add a _watch notification to a specific path
 * @param {(Worker|string)} worker The worker we wish to add the notification to
 * @param {string=} path The path we wish to watch, or null for 'data'
 */
Worker.prototype._watch = function(worker, path) {
	worker = Worker.find(worker);
	if (isWorker(worker)) {
		var i, x = isArray(path) ? path.join('.') : (isString(path) ? path : 'data');
		for (i in worker._datatypes) {
			if (x.indexOf(i) === 0) {
				worker._watching[x] = worker._watching[x] || [];
				if (worker._watching[x].indexOf(this.name) === -1) {
					worker._watching[x].push(this.name);
				}
				return true;
			}
		}
	}
	return false;
};

/**
 * Wrapper for a worker's .work() function from Queue
 * @param {boolean} state Whether the worker is allowed to work or should just return if it wants to
 * return {boolean} If the worker wants to work
 */
Worker.prototype._work = function(state) {
	this._pushStack();
	var result = false;
	try {
		result = this.work && this.work(state);
	}catch(e) {
		log(e, e.name + ' in ' + this.name + '.work(' + state + '): ' + e.message);
	}
	this._popStack();
	return result;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army:true, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Army **********
* Stores data by facebook userid for any worker that wants to use it.
* Data is stored as -
* Army.data.section.uid[...] = value
* section == 'Army' for general use of any workers with data useful for many
*/
var Army = new Worker('Army');
Army.data = {};

Army.settings = {
	system:true,
	taint:true
};

Army.option = {
	forget:14// Number of days to remember any userid
};

Army.runtime = {
	// Dashboard defaults:
	sort:0,rev:false,show:'Name',info:'uid'
};
/*
Army.display = [
	{
		id:'forget',
		label:'Forget after',
		select:[1,2,3,4,5,6,7,14,21,28],
		after:'days',
		help:'This will delete any userID that\'s not been seen for a length of time'
	}
];
*/

Army.setup = function(old_revision) {
	// BEGIN Change of storage from "data.uid.section.xyz" to "data.section.uid.xyz"
	if (old_revision <= 1113) {
		log('Updating Army...');
		var i, j;
		for (i in this.data) { // First change the layout
			if (isNumber(i) || !/[^\d]/.test(i)) {
				for (j in this.data[i]) {
					this._set(['data',j,i], this.data[i][j]);
					this._set(['data',i,j]);
				}
				this._set(['data',i]);
			}
		}
		this.data.Army = this.data.Army || {};
		for (i in this.data.Army) { // Second change the uid.Army bool to be Army.uid.member
			if (this.data.Army[i] === true) {
				this._set(['data','Army',i], this._get(['data','_info',i],{}));
				this._set(['data','_info',i])
				this._set(['data','Army',i,'member'], true);
			}
		}
		this.data._info = this.data._info || {};
		for (i in this.data._info) { // Finally remove _info into Army
			this._set(['data','Army',i], this._get(['data','_info',i],{}));
			this._set(['data','_info',i])
		}
		this._set(['data','_info'])
	}
	// END
};

Army.set = function(what) {
	var x = arguments[0] = isArray(what) ? what.slice(0) : (isString(what) ? what.split('.') : []);
	if (!x.length || isNumber(x[0]) || !/[^\d]/.test(x[0])) {
		x.unshift(Worker.stack[0]); // Section first - if it's not a valid section then use the current worker
	}
	return this._set.apply(this, arguments);
};

Army.get = function(what) {
	var x = arguments[0] = isArray(what) ? what.slice(0) : (isString(what) ? what.split('.') : []);
	if (!x.length || isNumber(x[0]) || !/[^\d]/.test(x[0])) {
		x.unshift(Worker.stack[0]); // Section first - if it's not a valid section then use the current worker
	}
	return this._get.apply(this, arguments);
};

Army.army_name = function(action, uid) {
	switch(action) {
	case 'title':
		return 'Name';
	case 'show':
		return Army._get(['Army',uid,'name'],'-').html_escape();
	case 'sort':
		return Army._get(['Army',uid,'name']);
	case 'click':
		if (uid) {
			Army._unflush();
			var i, obj = {};
			for (i in Army.data) {
				if (Army.data[i][uid]) {
					obj[i] = Army.data[i][uid];
				}
			}
			Config.makeTooltip(Army._get(['Army',uid,'name']) || uid, Page.makeLink('keep.php', 'user=' + uid, 'Visit Keep') + '<hr><b>userID: </b>' + uid + '<br><hr><b>Raw Data:</b><pre>' + JSON.stringify(obj, null, '   ') + '</pre>');
		}
		return true;
	}
};

Army.army = function(action, uid) {
	var i, tmp, value, list = [], info = 'UserID', infolist = {
		'UserID':'uid',
		'Level':'level',
		'FBName':'fbname',
		'Seen':'seen',
		'Changed':'changed',
		'Army Size':'army_size'
	};
	switch(action) {
	case 'title':
		return 'Info (' + this.get(['runtime','info'],'UserID') + ')';
	case 'info':
		if ($('#golem-army-info').length) {
			info = $('#golem-army-info').val();
		}
		this.set(['runtime','info'], info)
		for (i in infolist) {
			list.push('<option value="' + i + '"' + (i === info ? ' selected' : '') + '>' + i + '</option>');
		}
		return 'Info: <select id="golem-army-info">' + list.join('') + '</select>';
	case 'show':
		tmp = infolist[this.get(['runtime','info'],'UserID')];
		if (tmp === 'uid') {
			value = uid;
		} else {
			value = this.get(['Army',uid,tmp],'-');
			if (isNumber(value) && Math.abs(value - Date.now()) < (365 * 24 * 60 * 60 * 1000)) { // If it's probably a date
				value = makeTime(value, 'R');
			}
		}
		return value;
	case 'sort':
		return this.runtime.info === 'UserID' ? parseInt(uid,10) : this.get(['Army',uid,infolist[this.runtime.info]]);
	}
};

Army.order = [];
Army.dashboard = function(sort, rev) {
	var i, j, k, label, show = this.get(['runtime','show'],'*'), list = [], output = [], section = [], title = [], showinfo = [], army_fn = [];
	sort = isUndefined(sort) ? this.get(['runtime','sort'],0) : sort;
	rev = isUndefined(rev) ? this.get(['runtime','rev'],false) : rev;
	if ($('#golem-army-show').length) {
		show = $('#golem-army-show').val();
	}
	section.push('<option value="*"' + ('*' === show ? ' selected' : '') + '>All</option>');
	for (i in this.data) {
		section.push('<option value="' + i + '"' + (i === show ? ' selected' : '') + '>' + i + '</option>');
	}
	army_fn.push('*');
	showinfo.push(Army.army_name('info'));
	th(title, Army.army_name('title'));
	for (i in Workers) {
		if (Workers[i].army) {
			army_fn.push(i);
			showinfo.push(Workers[i].army('info'));
			th(title, Workers[i].army('title'));
		}
	}
	list.push('Limit entries to <select id="golem-army-show">' + section.join('') + '</select>, ' + showinfo.trim().join(', '));
	if (!this.order.length || this.runtime.show !== show || !arguments.length) {
		this.set(['runtime','show'], show);
		this.order = [];
		if (show === '*') {
			for (i in this.data) {
				for (j in this.data[i]) {
					this.order.push(j);
				}
			}
			this.order = this.order.unique();
		} else {
			for (i in this.data[show]) {
				this.order.push(i);
			}
		}
	}
	if (sort !== this.runtime.sort || rev !== this.runtime.rev || !arguments.length) {
		this.set(['runtime','sort'], sort);
		this.set(['runtime','rev'], rev);
		this.order.sort(function(a,b) {
			var aa = 0, bb = 0;
//			try {
				if (army_fn[sort] === '*') {
					aa = Army.army_name('sort', a);
					bb = Army.army_name('sort', b);
				} else {
					aa = Workers[army_fn[sort]].army('sort', a);
					bb = Workers[army_fn[sort]].army('sort', b);
				}
//			} catch(e) {}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
		});
	}

	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + title.join('') + '</tr></thead><tbody>');
	for (j=0; j<this.order.length; j++) {
		output = [];
		td(output, '<a>' + this.army_name('show', this.order[j]) + '</a>', 'id="golem_army_*_' + this.order[j] + '" style="cursor:pointer;"');
		for (i in Workers) {
			if (Workers[i].army) {
				try {
					k = Workers[i].army('show', this.order[j]) || '-';
					if (Workers[i].army('click')) {
						td(output, '<a>' + k + '</a>', 'id="golem_army_' + i + '_' + this.order[j] + '" style="cursor:pointer;"');
					} else {
						td(output, k);
					}
				} catch(e) {
					td(output, '-');
				}
			}
		}
		tr(list, output.join(''));//, 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Army').html(list.join(''));
	$('#golem-dashboard-Army td:first-child,#golem-dashboard-Army th:first-child').css('text-align', 'left');
	$('#golem-dashboard-Army select').change(function() {Army._notify('data');});// Force a redraw
	$('#golem-dashboard-Army thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-dashboard-Army td').click(function(e){
		var tmp = $(this).attr('id').regex(/^golem_army_(.*)_(\d+)$/i);
		if (tmp.length) {
			if (tmp[0] === '*') {
				Army.army_name('click', tmp[1])
			} else {
				Workers[tmp[0]]('click', tmp[1])
			}
		}
		e.stopImmediatePropagation();
		return false;
	});
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Coding:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, APPNAME,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, makeImage,
	GM_listValues, GM_deleteValue, localStorage
*/
/********** Worker.Coding **********
* Just some coding nifo about current workers - nothing special
*/
var Coding = new Worker('Coding');
Coding.data = Coding.option = Coding.runtime = Coding.temp = null;

Coding.settings = {
	system:true,
	debug:true,
	taint:true
};

Coding.dashboard = function() {
	var i, j, html, list = [], types = ['system', 'advanced', 'debug', 'taint', 'keep'], data = ['display', 'dashboard', 'data', 'option', 'runtime', 'temp'];

	for (i in Workers) {
		html = '';
		for (j=0; j<types.length; j++) {
			if (Workers[i].settings[types[j]]) {
				html += '<td class="green">true</td>';
			} else {
				html += '<td class="red">false</td>';
			}
		}
		if (isBoolean(Workers[i]._get(['option','_sleep']))) {
			html += '<td class="green">true</td>';
		} else {
			html += '<td class="red">false</td>';
		}
		for (j=0; j<data.length; j++) {
			if (Workers[i][data[j]]) {
				html += '<td class="green">true</td>';
			} else {
				html += '<td class="red">false</td>';
			}
		}
		list.push('<tr><th>' + i + '</th>' + html + '</tr>');
	}
	list.sort();
	html = '';
	for (j=0; j<types.length; j++) {
		html += '<th>' + types[j].ucfirst() + '</td>';
	}
	html += '<th>Sleep</th>';
	for (j=0; j<data.length; j++) {
		html += '<th>' + data[j].ucfirst() + '</td>';
	}
	$('#golem-dashboard-Coding').html('<table><thead><tr><th></th>' + html + '</tr></thead><tbody>' + list.join('') + '</tbody></table>');
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources, Script,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, getImage, log, warn, error, isUndefined
*/
/********** Worker.Config **********
* Has everything to do with the config
*/
var Config = new Worker('Config');

Config.settings = {
	system:true,
	keep:true,
	taint:true
};

Config.option = {
	display:true,
	fixed:false,
	advanced:false,
	debug:false,
	exploit:false
};

Config.temp = {
	require:[],
	menu:null
};

Config.init = function(old_revision) {
	var i, j, k, tmp, worker, multi_change_fn;
	// BEGIN: Changing this.option.display to a bool
	if (old_revision <= 1110) {
		if (this.option.display === 'block') {
			this.option.display = true;
		} else {
			delete this.option.display;
		}
	}
	// END
	// START: Only safe place to put this - temporary for deleting old queue enabled code...
	if (old_revision <= 1106) { // Not sure real revision
		for (i in Workers) {
			if (Workers[i].option && ('_enabled' in Workers[i].option)) {
				if (!Workers[i].option._enabled) {
					Workers[i].set(['option','_disabled'], true);
				}
				Workers[i].set(['option','_enabled']);
			}
		}
	}
	// END
	// START: Move active (unfolded) workers into individual worker.option._config._show
	if (old_revision <= 1106) { // Not sure real revision
		if (this.option.active) {
			for (i=0; i<this.option.active.length; i++) {
				worker = Worker.find(this.option.active[i]);
				if (worker) {
					worker.set(['option','_config','_show'], true);
				}
			}
			this.set(['option','active']);
		}
	}
	// END
	this.makeWindow(); // Creates all UI stuff
	multi_change_fn = function(el) {
		var $this = $(el), tmp, worker, val;
		if ($this.attr('id') && (tmp = $this.attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i)) && (worker = Worker.find(tmp[0]))) {
			val = [];
			$this.children().each(function(a,el){ val.push($(el).text()); });
			worker.get(['option', tmp[1]]);
			worker.set(['option', tmp[1]], val);
		}
	};

	$('input.golem_addselect').live('click.golem', function(){
		var i, value, values = $(this).prev().val().split(','), $multiple = $(this).parent().children().first();
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$multiple.append('<option>' + value + '</option>').change();
			}
		}
		multi_change_fn($multiple[0]);
		Worker.flush();
	});
	$('input.golem_delselect').live('click.golem', function(){
		var $multiple = $(this).parent().children().first();
		$multiple.children().selected().remove();
		multi_change_fn($multiple[0]);
		Worker.flush();
	});
	$('#golem_config input,textarea,select').live('change.golem', function(){
		var $this = $(this), tmp, worker, val, handled = false;
		if ($this.is('#golem_config :input:not(:button)') && $this.attr('id') && (tmp = $this.attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i)) && (worker = Worker.find(tmp[0]))) {
			if ($this.attr('type') === 'checkbox') {
				val = $this.prop('checked');
			} else if ($this.attr('multiple')) {
				multi_change_fn($this[0]);
				handled = true;
			} else {
				val = $this.prop('value') || $this.val() || null;
				if (val && val.search(/^[-+]?\d*\.?\d+$/) >= 0) {
					val = parseFloat(val);
				}
			}
			if (!handled) {
				worker.set('option.'+tmp[1], val, null, true);
				Worker.flush();
			}
		}
	});
	$('#golem').append('<div id="golem-menu" class="golem-menu golem-shadow"></div>');
	$('.golem-menu > div').live('click.golem', function(event) {
		var i, $this = $(this.wrappedJSObject || this), key = $this.attr('name').regex(/^([^.]*)\.([^.]*)\.(.*)/), worker = Worker.find(key[0]);
//		log(key[0] + '.menu(' + key[1] + ', ' + key[2] + ')');
		worker._unflush();
		worker.menu(Worker.find(key[1]), key[2]);
		Worker.flush();
	});
	$('.ui-accordion-header').live('click', function(){
		$(this).blur();
	});
	$('body').live('click.golem', function(event){ // Any click hides it, relevant handling done above
		Config.set(['temp','menu']);
		$('.golem-icon-menu-active').removeClass('golem-icon-menu-active');
		$('#golem-menu').hide();
		Worker.flush();
	});
	this._watch(this, 'option.advanced');
	this._watch(this, 'option.debug');
	this._watch(this, 'option.exploit');
};

Config.update = function(event, events) {
	var i, $el, $el2, worker, id, value, list, options = [];
	if (events.findEvent(this, 'show') || events.findEvent(this, 'init')) {
		if (this.option.display) {
			$('#golem_config').show();
		}
		$('#golem_config_frame').removeClass('ui-helper-hidden');// make sure everything is created before showing (css sometimes takes another second to load though)
	}
	for (event=events.findEvent(null, 'data'); event; event=events.findEvent()) { // Changing one of our dropdown lists
		list = [];
		value = this.get(event.path);
		if (isArray(value)) {
			for (i=0; i<value.length; i++) {
				list.push('<option value="' + value[i] + '">' + value[i] + '</option>');
			}
		} else if (isObject(value)) {
			for (i in value) {
				list.push('<option value="' + i + '">' + value[i] + '</option>');
			}
		}
		list = list.join('');
		$('select.golem_' + event.path.slice('data.'.length)).each(function(a,el){
			var worker = Worker.find($(el).closest('div.golem-panel').attr('id')), val = worker ? worker.get(['option', $(el).attr('id').regex(/_([^_]*)$/i)]) : null;
			$(el).html(list).val(val);
		});
	}
	if (events.getEvent(this, 'watch', 'option.advanced')
	 || events.getEvent(this, 'watch', 'option.debug')
	 || events.getEvent(this, 'watch', 'option.exploit')) {
		for (i in Workers) {
			if (Workers[i].settings.advanced || Workers[i].settings.debug || Workers[i].settings.exploit) {
				$('#'+Workers[i].id).css('display', ((!Workers[i].settings.advanced || this.option.advanced) && (!Workers[i].settings.debug || this.option.debug) && (!Workers[i].settings.exploit || this.option.exploit)) ? '' : 'none');
			}
		}
	}
	for (event=events.findEvent(null, 'watch'); event; event=events.findEvent()) {
		worker = event.worker;
		if (event.id === 'option._config') {
			if (event.path === 'option._config._show') { // Fold / unfold a config panel
				i = worker.get(event.path, false) && 0;
				id = worker.id;
			} else { // Fold / unfold a group panel
				i = worker.get(event.path, false) || 0;
				id = worker.id + '_' + event.path.slice('option._config.'.length);
			}
			if (i !== $('#' + id).accordion('option','active')) {
				$('#' + id).accordion('activate', i);
			}
		} else if (event.id === 'option._sleep') { // Show the ZZZ icon
//			log(LOG_LOG, worker.name + ' going to sleep...');
			$('#golem_sleep_' + worker.name).toggleClass('ui-helper-hidden');
		} else if (event.id) { // Some option changed, so make sure we show that
			id = event.id.slice('option.'.length);
			if (id && id.length && ($el = $('#'+this.makeID(worker, id))).length === 1) {
				if ($el.attr('type') === 'checkbox') {
					$el.prop('checked', worker.get(event.id, false));
				} else if ($el.attr('multiple')) {
					$el.empty();
					worker.get(event.id, [], isArray).forEach(function(val){
						$el.append('<option>'+val+'</option>');
					});
				} else if ($el.attr('value')) {
					$el.prop('value', worker.get(event.id));
				} else {
					$el.val(worker.get(event.id));
				}
			}
		}
	}
	this.checkRequire();
	return true;
};

Config.menu = function(worker, key) {
	if (!worker) {
		if (!key) {
			return [
				'fixed:' + (this.option.fixed ? '<img src="' + getImage('pin_down') + '">Fixed' : '<img src="' + getImage('pin_left') + '">Normal') + '&nbsp;Position',
				'advanced:' + (this.option.advanced ? '+' : '-') + 'Advanced&nbsp;Options',
				'debug:' + (this.option.debug ? '+' : '-') + 'Debug&nbsp;Options'
			];
		} else if (key) {
			switch (key) {
				case 'fixed':
					$('#golem_config_frame').toggleClass('ui-helper-fixed', this.toggle(['option','fixed']));
					break;
				case 'advanced':
					this.toggle(['option','advanced']);
					this.checkRequire();
					break;
				case 'debug':
					this.toggle(['option','debug']);
					this.checkRequire();
					break;
			}
		}
	}
};

Config.addButton = function(options) {
	if (options.advanced >= 0 && !Config.get(['option','advanced'],false)) {
		options.hide = true;
	}
	var html = $('<img class="golem-theme-button golem-button' + (options.active ? '-active' : '') + (options.advanced ? ' golem-advanced' : '') + (options.className ? ' '+options.className : '') + '" ' + (options.id ? 'id="'+options.id+'" ' : '') + (options.title ? 'title="'+options.title+'" ' : '') + (options.hide ? 'style="display:none;" ' : '') + 'src="' + getImage(options.image) + '">');
	if (options.prepend) {
		$('#golem_buttons').prepend(html);
	} else if (options.after) {
		$('#'+options.after).after(html);
	} else {
		$('#golem_buttons').append(html);
	}
	if (options.click) {
		html.click(options.click);
	}
}

Config.makeTooltip = function(title, content) {
	var el = $('<div class="ui-widget ui-widget-shadow ui-helper-fixed" style="left:100px;top:100px;z-index:999;">' + // High z-index due to Facebook search bar
		'<h3 class="ui-widget-header" style="padding:2px;cursor:move;">' + title +
			'<span class="ui-icon ui-icon-close" style="float:right;cursor:pointer;"></span>' +
		'</h3>' +
		'<div class="ui-widget-content" style="padding:4px;"><div></div></div>' +
	'</div>')
	.draggable({
		handle:'> h3',
		containment:'window',
		stack:'.tooltips'
	})
//	.resizable({ // Doesn't resize the widget-content properly
//		autoHide: true,
//		handles: 'se',
//		minHeight: 100,
//		minWidth: 100
//	})
	.appendTo('#golem');
	$('.ui-widget-header span', el).click(function(){el.remove();});
	$('.ui-widget-content > div', el).append(content);
	el.show();
};

Config.makeWindow = function() {  // Make use of the Facebook CSS for width etc - UIStandardFrame_SidebarAds
	var i, j, k, tmp, stop = false;
	$('#golem').prepend(tmp = $('<div id="golem_config_frame" class="ui-widget ui-helper-hidden' + (this.option.fixed?' ui-helper-fixed':'') + '" style="width:' + $('#golem').width() + 'px;">' +
		'<h3 class="ui-widget-header">' +
			'Game-Golem ' + (isRelease ? 'v'+version : 'r'+revision) +
		'</h3>' +
		'<div class="ui-widget-content" style="margin-top:-1px;padding:0 4px 4px 4px;">' +
			'<div id="golem_info" style="margin:0 -4px;">' +
				// Extra info goes in here
			'</div>' +
			'<div id="golem_buttons" style="padding-top:4px;">' +
				// All buttons go in here
			'</div>' +
			'<div id="golem_config" style="display:none;padding-top:4px;">' +
				// All config panels go in here
			'</div>' +
		'</div>' +
	'</div>'));
	this.addButton({
		id:'golem_options',
		image:'options',
		title:'Show Options',
		active:this.option.display,
		className:this.option.display ? 'green' : '',
		click:function(){
			$(this).toggleClass('golem-button golem-button-active green');
			Config.toggle(['option','display'], true);
			$('#golem_config').toggle('blind'); //Config.option.fixed?null:
		}
	});
	for (i in Workers) { // Propagate all before and after settings
		if (Workers[i].settings.before) {
			for (j=0; j<Workers[i].settings.before.length; j++) {
				k = Worker.find(Workers[i].settings.before[j]);
				if (k) {
					k.settings.after = k.settings.after || [];
					k.settings.after.push(Workers[i].name);
					k.settings.after = k.settings.after.unique();
//					log(LOG_WARN, 'Pushing '+k.name+' after '+Workers[i].name+' = '+k.settings.after);
				}
			}
		}
		if (Workers[i].settings.after) {
			for (j=0; j<Workers[i].settings.after.length; j++) {
				k = Worker.find(Workers[i].settings.after[j]);
				if (k) {
					k.settings.before = k.settings.before || [];
					k.settings.before.push(Workers[i].name);
					k.settings.before = k.settings.before.unique();
//					log(LOG_WARN, 'Pushing '+k.name+' before '+Workers[i].name+' = '+k.settings.before);
				}
			}
		}
	}
	for (i in Workers) {
		this.makePanel(Workers[i]);
	}
	$('#golem_config')
		.sortable({
			axis: 'y',
			containment: 'parent',
			distance: 15,
			handle: '> h3',
			items: 'div:not(.golem-unsortable)',
			tolerance: 'pointer',
			start: function(event) {
				$('#golem_config').data('stop', true);
			},
			stop: function(event) {
				var i, el, order = [];
				el = $('#golem_config > div');
				for (i=0; i<el.length; i++) {
					order.push($(el[i]).attr('name'));
				}
				Queue.set(['option','queue'], order.unique());
			}
		});
	$( "#golem_config > div > h3 > a" ).click(function(event) {
		if ($('#golem_config').data('stop')) {
			event.stopImmediatePropagation();
			event.preventDefault();
			$('#golem_config').data('stop', false);
		}
	});
	this._update('show');
};

Config.makePanel = function(worker, args) {
	if (!isWorker(worker)) {
		if (Worker.stack.length <= 1) {
			return;
		}
		args = worker;
		worker = Worker.get(Worker.stack[0]);
	}
	if (!args) {
		if (!worker.display) {
			return;
		}
		args = worker.display;
	}
	if (!$('#'+worker.id).length) {
		var name, tmp, display = (worker.settings.advanced && !this.option.advanced) || (worker.settings.debug && !this.option.debug) || (worker.settings.exploit && !this.option.exploit),
			disabled = worker.get(['option', '_disabled'], false) ? Theme.get('Queue_disabled', 'ui-state-disabled') : '',
			sleep = worker.get(['option','_sleep'], false) ? '' : ' ui-helper-hidden';
		$('#golem_config').append(tmp = $(
			'<div id="' + worker.id + '" name="' + worker.name + '" class="' + (worker.settings.unsortable ? 'golem-unsortable' : '') + '"' + (display ? ' style="display:none;"' : '') + '>' +
				'<h3 class="' + disabled + '">' +
					'<a href="#">' +
						(worker.settings.unsortable ? '<span class="ui-icon ui-icon-locked" style="float:left;margin-top:-2px;margin-left:-4px;"></span>' : '') +
						worker.name +
						'<img id="golem_sleep_' + worker.name + '" class="golem-image' + sleep + '" src="' + getImage('zzz') + '">' +
					'</a>' +
				'</h3>' +
				'<div class="' + (worker.settings.advanced ? 'red' : '') + (worker.settings.debug ? ' blue' : '') + (worker.settings.exploit ? ' purple' : '') + '" style="font-size:smaller;"></div>' +
			'</div>'
		));
		name = worker.name;
		$('#'+worker.id).accordion({
			collapsible: true,
			autoHeight: false,
			clearStyle: true,
			animated: 'blind',
			header: '> h3',
			active: worker.get(['option','_config','_show'], false) && 0,
			change: function(event, ui){
				Workers[name].set(['option','_config','_show'], ui.newHeader.length ? true : undefined, null, true); // Only set when *showing* panel
			}
		});
		this._watch(worker, 'option._config');
		this._watch(worker, 'option._sleep');
	} else {
		$('#'+worker.id+' > div').empty();
	}
	this.addOption(worker, args);
};

Config.makeID = function(worker, id) {
	return PREFIX + worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-') + '_' + id;
};

Config.clearPanel = function(selector) {
	this._init(); // Make sure we're properly loaded first!
	if (isWorker(selector)) {
		selector = '#'+selector.id+' > div';
	} else if (typeof selector === 'undefined' || !selector) {
		if (Worker.stack.length <= 1) {
			return;
		}
		selector = '#'+Workers[Worker.stack[0]].id+' > div';
	}
	$(selector).empty();
};

Config.addOption = function(selector, args) {
	this._init(); // Make sure we're properly loaded first!
	var worker;
	if (isWorker(selector)) {
		worker = selector;
		selector = '#'+selector.id+' > div';
	} else if (typeof args === 'undefined' || !args) {
		if (Worker.stack.length <= 1) {
			return;
		}
		worker = Workers[Worker.stack[0]];
		args = selector;
		selector = '#'+worker.id+' > div';
	}
	$(selector).append(this.makeOptions(worker, args));
};

Config.makeOptions = function(worker, args) {
	this._init(); // Make sure we're properly loaded first!
	if (isArray(args)) {
		var i, $output = $('<div></div>');
		for (i=0; i<args.length; i++) {
			$output = $output.append(this.makeOptions(worker, args[i]));
		}
		return $output;
	} else if (isObject(args)) {
		return this.makeOption(worker, args);
	} else if (isString(args)) {
		return this.makeOption(worker, {title:args});
	} else if (isFunction(args)) {
		try {
			return this.makeOptions(worker, args.call(worker));
		} catch(e) {
			log(LOG_WARN, e.name + ' in Config.makeOptions(' + worker.name + '.display()): ' + e.message);
		}
	} else {
		log(LOG_ERROR, worker.name+' is trying to add an unknown type of option: '+(typeof args));
	}
	return $([]);
};

Config.makeOption = function(worker, args) {
	var i, j, o, r, step, $option, tmp, name, txt = [], list = [];
	o = $.extend({}, {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 18,
		min: 0,
		max: 100,
		real_id: ''
	}, args);
	if (o.id) {
		if (!isArray(o.id)) {
			o.id = o.id.split('.');
		}
		if (o.id.length > 0 && Workers[o.id[0]]) {
			worker = Workers[o.id.shift()];
		}
		if (isUndefined(worker._datatypes[o.id[0]])) {
			o.id.unshift('option');
		}
		o.path = o.id;
		o.id = o.id.slice(1).join('.');
		this._watch(worker, o.path);
		o.real_id = ' id="' + this.makeID(worker, o.id) + '"';
		o.value = worker.get(o.path, null);
	}
	if (o.group) {
		if (o.title) {
			tmp = o.title.toLowerCase().replace(/[^a-z0-9]/g,'');
			name = worker.name;
			$option = $('<div class="' + (worker.settings.advanced ? 'red' : '') + (worker.settings.debug ? ' blue' : '') + (worker.settings.exploit ? ' purple' : '') + '" id="' + worker.id + '_' + tmp + '"><h3><a href="#">' + o.title + '</a></h3></div>').append(this.makeOptions(worker,o.group));
			$option.accordion({
				collapsible: true,
				autoHeight: false,
				clearStyle: true,
				animated: 'blind',
				active: worker.get(['option','_config',tmp], false) || 0,
				change: function(event, ui){
					Workers[name].set(['option','_config',tmp], ui.newHeader.length ? undefined : true, null, true); // Only set when *hiding* panel
				}
			});
		} else {
			$option = this.makeOptions(worker,o.group);
		}
	} else {
		o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
		if (o.hr) {
			txt.push('<br><hr style="clear:both;margin:0;">');
		}
		if (o.title) {
			txt.push('<h4 class="golem-group-title">' + o.title.replace(' ','&nbsp;') + '</h4>');
		}
		if (o.label && !o.button) {
			txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
			if (o.text || o.checkbox || o.select || o.number) {
				txt.push('<span style="float:right;">');
			} else if (o.multiple) {
				txt.push('<br>');
			}
		}
		if (o.before) {
			txt.push(o.before+' ');
		}
		// our different types of input elements
		if (o.info) { // only useful for externally changed
			if (o.id) {
				txt.push('<span style="float:right"' + o.real_id + '>' + (o.value || o.info) + '</span>');
			} else {
				txt.push(o.info);
			}
		} else if (o.text) {
			txt.push('<input type="text"' + o.real_id + (o.label || o.before || o.after ? '' : ' style="width:100%;"') + ' size="' + o.size + '" value="' + (o.value || isNumber(o.value) ? o.value : '') + '">');
		} else if (o.number) {
			txt.push('<input type="number"' + o.real_id + (o.label || o.before || o.after ? '' : ' style="width:100%;"') + ' size="6"' + (o.step ? ' step="'+o.step+'"' : '') + ' min="' + o.min + '" max="' + o.max + '" value="' + (isNumber(o.value) ? o.value : o.min) + '">');
		} else if (o.textarea) {
			txt.push('<textarea' + o.real_id + ' cols="23" rows="5">' + (o.value || '') + '</textarea>');
		} else if (o.checkbox) {
			txt.push('<input type="checkbox"' + o.real_id + (o.value ? ' checked' : '') + '>');
		} else if (o.button) {
			txt.push('<input type="button"' + o.real_id + ' value="' + o.label + '">');
		} else if (o.select) {
			if (typeof o.select === 'function') {
				o.select = o.select.call(worker, o.id);
			}
			switch (typeof o.select) {
				case 'number':
					step = Divisor(o.select);
					for (i=0; i<=o.select; i+=step) {
						list.push('<option' + (o.value==i ? ' selected' : '') + '>' + i + '</option>');
					}
					break;
				case 'string':
					o.className = ' class="golem_'+o.select+'"';
					if (this.data && this.data[o.select] && (typeof this.data[o.select] === 'array' || typeof this.data[o.select] === 'object')) {
						o.select = this.data[o.select];
					} else {
						break;
					} // deliberate fallthrough
				case 'array':
				case 'object':
					if (isArray(o.select)) {
						for (i=0; i<o.select.length; i++) {
							list.push('<option value="' + o.select[i] + '"' + (o.value==o.select[i] ? ' selected' : '') + '>' + o.select[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
						}
					} else {
						for (i in o.select) {
							list.push('<option value="' + i + '"' + (o.value==i ? ' selected' : '') + '>' + o.select[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
						}
					}
					break;
			}
			txt.push('<select' + o.real_id + o.className + o.alt + '>' + list.join('') + '</select>');
		} else if (o.multiple) {
			if (isArray(o.value)) {
				for (i = 0; i < o.value.length; i++) {
					list.push('<option>'+o.value[i]+'</option>');
				}
			} else if (isObject(o.value)) {
				for (i in o.value) {
					list.push('<option>'+o.value[i]+'</option>');
				}
			}
			txt.push('<select style="width:100%;clear:both;" class="golem_multiple" multiple' + o.real_id + '>' + list.join('') + '</select><br>');
			if (typeof o.multiple === 'string') {
				txt.push('<input class="golem_select" type="text" size="' + o.size + '">');
			} else {
				list = [];
				switch (typeof o.multiple) {
					case 'number':
						step = Divisor(o.select);
						for (i=0; i<=o.multiple; i+=step) {
							list.push('<option>' + i + '</option>');
						}
						break;
					case 'array':
					case 'object':
						if (isArray(o.multiple)) {
							for (i=0; i<o.multiple.length; i++) {
								list.push('<option value="' + o.multiple[i] + '">' + o.multiple[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
							}
						} else {
							for (i in o.multiple) {
								list.push('<option value="' + i + '">' + o.multiple[i] + (o.suffix ? ' '+o.suffix : '') + '</option>');
							}
						}
						break;
				}
				txt.push('<select class="golem_select">'+list.join('')+'</select>');
			}
			txt.push('<input type="button" class="golem_addselect" value="Add" /><input type="button" class="golem_delselect" value="Del" />');
		}
		if (o.after) {
			txt.push(' '+o.after);
		}
		if (o.label && (o.text || o.checkbox || o.select || o.multiple)) {
			txt.push('</span>');
		}
		$option = $('<div class="ui-helper-clearfix">' + txt.join('') + '</div>');
		if (o.require || o.advanced || o.debug || o.exploit) {
			try {
				r = {depth:0};
				r.require = {};
				if (o.advanced) {
					r.require.advanced = true;
					$option.addClass('red');
				}
				if (o.debug) {
					r.require.debug = true;
					$option.addClass('blue');
				}
				if (o.exploit) {
					r.require.exploit = true;
					$option.addClass('purple').css({border:'1px solid red'});
				}
				if (o.require) {
					r.require.x = Script.parse(worker, 'option', o.require);
				}
				this.temp.require.push(r.require);
				$option.attr('id', 'golem_require_'+(this.temp.require.length-1)).css('display', this.checkRequire(this.temp.require.length - 1) ? '' : 'none');
			} catch(e) {
				log(LOG_ERROR, e.name + ' in createRequire(' + o.require + '): ' + e.message);
			}
		}
	}
	if (o.help) {
		$option.attr('title', o.help);
	}
	return $option;
};

Config.checkRequire = function(id) {
	var i, show = true, require;
	if (!isNumber(id) || !(require = this.temp.require[id])) {
		for (i=0; i<this.temp.require.length; i++) {
			arguments.callee.call(this, i);
		}
		return;
	}
	if (require.advanced) {
		show = Config.option.advanced;
	}
	if (require.debug) {
		show = Config.option.debug;
	}
	if (show && require.exploit) {
		show = Config.option.exploit;
	}
	if (show && require.x) {
		show = Script.interpret(require.x);
	}
	if (require.show !== show) {
		require.show = show;
		$('#golem_require_'+id).css('display', show ? '' : 'none');
	}
	return show;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard');
Dashboard.temp = null;

Dashboard.settings = {
	taint:true
};

Dashboard.option = {
	display:true,
	expand:false,
	active:'Dashboard',
	width:600,
	height:183
};

Dashboard.init = function(old_revision) {
	// BEGIN: Changing this.option.display to a bool
	if (old_revision <= 1110) {
		if (this.option.display === 'block') {
			this.option.display = true;
		} else {
			delete this.option.display;
		}
	}
	// END
	var i, j, list = [], tabs = [], divs = [], active = this.option.active, hide, selected = 0;
	if (!Workers[active]) {
		this.set('option.active', active = this.name);
	}
	for (i in Workers) {
		if (i !== this.name && Workers[i].dashboard) {
			list.push(i);
		}
	}
	list.sort();
	list.unshift(this.name);
	for (j=0; j<list.length; j++) {
		i = list[j];
		hide = Workers[i]._get(['option','_hide_dashboard'], false) || (Workers[i].settings.advanced && !Config.option.advanced) || (Workers[i].settings.debug && !Config.option.debug);
		if (this.option.active === i) { // Make sure we can see the active worker
			if (hide) {
				this.set(['option','active'], this.name);
			} else {
				selected = j
			}
		}
		tabs.push('<li class="' + (hide ? 'ui-helper-hidden' : '') + (Workers[i].settings.advanced ? ' red' : Workers[i].settings.debug ? ' blue' : '') + '"><a href="#golem-dashboard-' + i + '">' + (i===this.name ? '&nbsp;*&nbsp;' : i) + '</a></li>');
		divs.push('<div id="golem-dashboard-' + i + '"></div>');
		this._watch(Workers[i], 'data');
		this._watch(Workers[i], 'option._hide_dashboard');
	}
	$('#golem').append('<div id="golem-dashboard" class="ui-corner-none" style="position:absolute;display:none;"><ul class="ui-corner-none">' + tabs.join('') + '</ul><div>' + divs.join('') + '</div></div>');
	$('<a style="position:absolute;top:3px;right:3px;" class="ui-icon ui-icon-circle-' + (this.option.expand ? 'minus' : 'plus') + '"></a>').click(function(event){
		$(this).toggleClass('ui-icon-circle-minus ui-icon-circle-plus');
		Dashboard.toggle(['option','expand']);
	}).appendTo('#golem-dashboard');
	$('#golem-dashboard')
		.tabs({
			fx: {opacity:'toggle', duration:100},
			selected: selected,
			show: function(event,ui) {
				Dashboard.set(['option','active'], Worker.find(ui.panel.id.slice('golem-dashboard-'.length)).name);
				Dashboard._update(null, 'run');
			}
		});
	Config.addButton({
		id:'golem_icon_dashboard',
		image:'dashboard',
		title:'Show Dashboard',
		active:this.option.display,
		className:this.option.display ? 'green' : '',
		click:function(){
			$(this).toggleClass('golem-button golem-button-active green');
			$('#golem-dashboard').stop()[Dashboard.toggle(['option','display'], true) ? 'fadeIn' : 'fadeOut']('fast');
			Dashboard._update(null, 'run');
		}
	});
	$('#golem-dashboard thead th').live('click', function(event){
		var $this = $(this), worker = Workers[Dashboard.option.active];
		worker._unflush();
		worker.dashboard($this.index(), $this.attr('name')==='sort');
	});
	this._resize();
	this._trigger('#'+APPID_+'app_body_container, #'+APPID_+'globalContainer', 'page_change');
	this._watch(this, 'option.active');
	this._watch(this, 'option.expand');
	this._watch(Config, 'option.advanced');
	this._watch(Config, 'option.debug');
};

Dashboard.update = function(event, events) {
	var i, advanced, debug, show, $el, offset, width, height, margin = 0;
	if (events.findEvent(Config, 'watch', 'option.advanced') || events.findEvent(Config, 'watch', 'option.debug') || events.findEvent(null, 'watch', 'option._hide_dashboard')) {
		advanced = Config.get(['option','advanced'], false);
		debug = Config.get(['option','debug'], false);
		for (i in Workers) {
			show = (!Workers[i].settings.advanced || advanced) && (!Workers[i].settings.debug || debug) && !Workers[i]._get(['option','_hide_dashboard'], false);
			$('#golem-dashboard .ui-tabs-nav a[href*="'+i+'"]').parent().toggleClass('ui-helper-hidden', !show);
			if (!show && this.option.active === i) {
				this.set(['option','active'], this.name);
			}
		}
		return;
	}
	if (events.findEvent(this, 'watch', 'option.active')
	 || events.findEvent(this.option.active, 'watch', 'data')
	 || events.findEvent(this, 'init')) {
		try {
			Workers[this.option.active]._unflush();
			Workers[this.option.active].dashboard();
		}catch(e) {
			log(LOG_ERROR, e.name + ' in ' + this.option.active + '.dashboard(): ' + e.message);
		}
	}
	if (events.findEvent(this, 'watch', 'option.active')) {
		$('#golem-dashboard').tabs('option', 'selected', $('#golem-dashboard-'+this.option.active).index());
	}
	if ((event = events.findEvent(this, 'resize'))
	 || (event = events.findEvent(this, 'trigger'))
	 || (event = events.findEvent(this, 'init'))
	 || events.findEvent(this, 'watch', 'option.expand')) { // Make sure we're always in the right place
		if (this.get(['option','expand'], false)) {
			$el = $('#contentArea,#globalcss').eq(0);
			width = $el.width();
			height = $el.height();
			margin = 10;
		} else {
			$el = $('#'+APPID_+'app_body_container');
			width = this.get(['option','width'], 0);
			height = this.get(['option','height'], 0);
		}
		offset = $el.offset();
		$('#golem-dashboard')[event ? 'css' : 'animate']({'top':offset.top + margin, 'left':offset.left + margin, 'width':width - (2 * margin), 'height':height - (2 * margin)});
	}
	if (events.findEvent(this, 'init') && this.option.display) {
		$('#golem-dashboard').show();
	}
	return true;
};

Dashboard.dashboard = function() {
	var i, list = [];
	for (i in this.data) {
		if (!Workers[i]._get(['option','_hide_status'], false)) {
			list.push('<tr><th>' + i + ':</th><td id="golem-status-' + i + '">' + this.data[i] + '</td></tr>');
		}
	}
	list.sort(); // Ok with plain text as first thing that can change is name
	$('#golem-dashboard-Dashboard').html('<table cellspacing="0" cellpadding="0" class="golem-status">' + list.join('') + '</table>');
};

Dashboard.status = function(worker, value) {
	var w = Worker.find(worker);
	if (w) {
		this.set(['data', w.name], value);
	}
};

Dashboard.menu = function(worker, key) {
	if (worker) {
		this._unflush();
		if (!key) {
			var keys = [];
			if (this.data[worker.name]) {
				keys.push('status:' + (worker.get(['option','_hide_status'], false) ? '-' : '+') + 'Show&nbsp;Status');
			}
			if (worker.dashboard) {
				keys.push('dashboard:' + (worker.get(['option','_hide_dashboard'], false) ? '-' : '+') + 'Show&nbsp;Dashboard');
			}
			return keys;
		} else {
			switch (key) {
				case 'status':		worker.set(['option','_hide_status'], worker.option._hide_status ? undefined : true);	break;
				case 'dashboard':	worker.set(['option','_hide_dashboard'], worker.option._hide_dashboard ? undefined : true);	break;
			}
			this._notify('data');
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player, Config,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, error:true, warn:true, log:true, getImage, isUndefined, script_started,
	makeImage
*/
/********** Worker.Debug **********
* Profiling information
*/
var Debug = new Worker('Debug');

Debug.settings = {
	system:true,
	unsortable:true,
	debug:true,
	taint:true
};

Debug.option = {
	timer:0,
	count:2,
	show:10,
	digits:1,
	total:false,
	prototypes:true,
	worker:'All',
	trace:4,
	logdef:LOG_LOG, // Default level when no LOG_* set...
	logexception:LOG_ERROR, // Default when it's an exception
	loglevel:LOG_INFO, // Maximum level to show (set by menu) - can turn off individual levels in Debug config
	logs:{
		0:{ /* LOG_INFO */	display:'info',	date:true,	revision:false,	worker:false,	stack:false,	prefix:''	},
		1:{ /* LOG_LOG */	display:'log',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		2:{ /* LOG_WARN */	display:'warn',	date:true,	revision:true,	worker:true,	stack:false,	prefix:''	},
		3:{ /* LOG_ERROR */	display:'error',date:true,	revision:true,	worker:true,	stack:true,		prefix:''	},
		4:{ /* LOG_DEBUG */	display:'debug',date:true,	revision:true,	worker:true,	stack:true,		prefix:''	},
		5:{ /* LOG_USER1 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		6:{ /* LOG_USER2 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		7:{ /* LOG_USER3 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		8:{ /* LOG_USER4 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	},
		9:{ /* LOG_USER5 */	display:'-',	date:true,	revision:false,	worker:true,	stack:false,	prefix:''	}
	}
};

Debug.runtime = {
	sort:2,
	rev:false,
	watch:false
};

Debug.display = [
	{
		title:'Function Profiling',
		group:[
			{
				id:'timer',
				label:'Refresh',
				select:{0:'Manual', 5:'5 seconds', 10:'10 seconds', 15:'15 seconds', 30:'30 seconds', 60:'1 minute'}
			},{
				id:'count',
				label:'Minimum Count',
				select:[0,1,2,3,4,5,10,15,20,25,50,100]
			},{
				id:'show',
				label:'Display Lines',
				select:{0:'All',10:10,20:20,30:30,40:40,50:50,60:60,70:70,80:80,90:90,100:100}
			},{
				id:'digits',
				label:'Time Digits',
				select:[1,2,3,4,5]
			},{
				id:'total',
				label:'Show Worker Totals',
				checkbox:true
			},{
				id:'prototypes',
				label:'Show Prototype Functions',
				checkbox:true
			},{
				id:'worker',
				label:'Worker',
				select:'worker_list'
			},{
				id:'trace',
				label:'Tracing',
				select:{0:'LOG_INFO', 1:'LOG_LOG', 2:'LOG_WARN', 3:'LOG_ERROR', 4:'LOG_DEBUG', 5:'LOG_USER1', 6:'LOG_USER2', 7:'LOG_USER3', 8:'LOG_USER4', 9:'LOG_USER5'}
			}
		]
	},{
		title:'Logging',
		group:[
			{
				id:'logdef',
				label:'Default log',
				select:{0:'LOG_INFO', 1:'LOG_LOG', 2:'LOG_WARN', 3:'LOG_ERROR', 4:'LOG_DEBUG', 5:'LOG_USER1', 6:'LOG_USER2', 7:'LOG_USER3', 8:'LOG_USER4', 9:'LOG_USER5'},
				help:'This is for log() lines that do not have an exception or LOG_* as the first argument'
			},{
				id:'logexception',
				label:'Default exception',
				select:{0:'LOG_INFO', 1:'LOG_LOG', 2:'LOG_WARN', 3:'LOG_ERROR', 4:'LOG_DEBUG', 5:'LOG_USER1', 6:'LOG_USER2', 7:'LOG_USER3', 8:'LOG_USER4', 9:'LOG_USER5'},
				help:'This is for log() lines that have an exception as the first argument'
			},{
				group:function() {
					var i, options = [], levels = ['Info', 'Log', 'Warn', 'Error', 'Debug', 'User1', 'User2', 'User3', 'User4', 'User5'];
					for (i=0; i<levels.length; i++) {
						options.push({
							title:i + ': ' + levels[i],
							group:[
								{
									id:'logs.'+i+'.display',
									label:'Display',
									select:{'-':'Disabled', 'info':'console.info()', 'log':'console.log()', 'warn':'console.warn()', 'error':'console.error()', 'debug':'console.debug()'}
								},{
									id:'logs.'+i+'.date',
									label:'Timestamp',
									select:{'-':'None', 'G:i':'13:24', 'G:i:s':'13:24:56', 'G:i:s.u':'13:24:56.001', 'D G:i':'Mon 13:24', 'D G:i:s':'Mon 13:24:56', 'D G:i:s.u':'Mon 13:24:56.001'}
								},{
									id:'logs.'+i+'.prefix',
									label:'Prefix',
									text:true
								},{
									id:'logs.'+i+'.revision',
									label:'Revision',
									checkbox:true
								},{
									id:'logs.'+i+'.worker',
									label:'Worker',
									checkbox:true
								},{
									id:'logs.'+i+'.stack',
									label:'Stack',
									checkbox:true
								}
							]
						});
					}
					return options;
				}
			}
		]
	}
];

Debug.stack = [];// Stack tracing = [[time, worker, function, args], ...]
Debug.setup = function(old_revision) {
	var i, j, p, wkr, fn;
	// BEGIN Change of log options
	if (old_revision <= 1111 && this.option.log) {
		this.set(['option','logs','0','display'], this.get(['option','log','0'], 'info'));
		this.set(['option','logs','1','display'], this.get(['option','log','1'], 'log'));
		this.set(['option','logs','2','display'], this.get(['option','log','2'], 'warn'));
		this.set(['option','logs','3','display'], this.get(['option','log','3'], 'error'));
		this.set(['option','logs','4','display'], this.get(['option','log','4'], 'debug'));
		this.set(['option','log']);
	}
	if (old_revision <= 1112 && this.option.logs) {
		for (i in this.option.logs) {
			if (isBoolean(this.option.logs[i].date)) {
				this.set(['option','logs',i,'date'], this.option.logs[i].date ? 'G:i:s' : '-');
			}
		}
	}
	if (old_revision <= 1112 && isBoolean(this.option.trace)) {
		this.set(['option','trace'], this.option.trace ? LOG_DEBUG : LOG_LOG);
	}
	// END
	// Go through every worker and replace their functions with a stub function
	Workers['__fake__'] = null;// Add a fake worker for accessing Worker.prototype
	for (i in Workers) {
		for (p=0; p<=1; p++) {
			wkr = (i === '__fake__' ? (p ? Worker.prototype : null) : (p ? Workers[i] : Workers[i].defaults[APP])) || {};
			for (j in wkr) {
				if (isFunction(wkr[j]) && wkr.hasOwnProperty(j) && !/^_.*_$/.test(j)) {// Don't overload functions using _blah_ names - they're speed conscious
					fn = wkr[j];
					wkr[j] = function() {
						var i, t, r, ac = arguments.callee, w = (ac._worker || (this ? this.name : null)), l = [], s;
						Debug.stack.unshift([0, w || '', arguments]);
						try {
							if (Debug.option._disabled) {
								r = ac._orig.apply(this, arguments);
							} else {
								if (w) {
									l = [w+'.'+ac._name, w];
								}
								if (!ac._worker) {
									l.push('_worker.'+ac._name);
								}
								t = Date.now();
								r = ac._orig.apply(this, arguments);
								t = Date.now() - t;
								if (Debug.stack.length > 1) {
									Debug.stack[1][0] += t;
								}
								while ((i = l.shift())) {
									w = Debug.temp[i] = Debug.temp[i] || [0,0,0,false];
									w[0]++;
									w[1] += t - Debug.stack[0][0];
									w[2] += t;
									if (Debug.temp[i][3]) {
										log(Debug.option.trace, i + '(' + JSON.shallow(arguments, 2).replace(/^\[?|\]?$/g, '') + ') => ' + JSON.shallow(isUndefined(r) ? null : r, 2).replace(/^\[?|\]?$/g, ''));
									}
								}
							}
						} catch(e) {
							log(e, isString(e) ? e : e.name + ': ' + e.message);
						}
						Debug.stack.shift();
						return r;
					};
					wkr[j]._name = j;
					wkr[j]._orig = fn;
					if (i !== '__fake__') {
						wkr[j]._worker = i;
						Debug.temp[i+'.'+j] = Debug.temp[i+'.'+j] || [0,0,0,false];
					}
				}
			}
		}
	}
	delete Workers['__fake__']; // Remove the fake worker
	// Replace the global logging function for better log reporting
	log = function(level, txt /*, obj, array etc*/){
		var i, j, worker, name, line = '', level, tmp, stack, args = Array.prototype.slice.call(arguments), prefix = [], suffix = [], display = '-';
		if (isNumber(args[0])) {
			level = Math.range(0, args.shift(), 9);
		} else if (isError(args[0])) {
			tmp = args.shift();
			if (browser === 'chrome' && isString(tmp.stack)) {
				stack = tmp.stack.split("\n");
			}
			level = Debug.get(['option','logexception'], LOG_ERROR);
		} else {
			level = Debug.get(['option','logdef'], LOG_LOG);
		}
		if (isNumber(level)
		 && level <= Debug.get(['option','loglevel'], LOG_LOG)
		 && (display = Debug.get(['option','logs',level,'display'], '-')) !== '-') {
			if ((tmp = Debug.get(['option','logs',level,'prefix'], false))) {
				prefix.push(tmp);
			}
			if (Debug.get(['option','logs',level,'revision'], false)) {
				prefix.push('[' + (isRelease ? 'v'+version : 'r'+revision) + ']');
			}
			if ((tmp = Debug.get(['option','logs',level,'date'], '-')) !== 'tmp') {
				prefix.push('[' + (new Date()).format(tmp) + ']');
			}
			if (Debug.get(['option','logs',level,'worker'], false)) {
				tmp = [];
				for (i=0; i<Debug.stack.length; i++) {
					if (!tmp.length || Debug.stack[i][1] !== tmp[0]) {
						tmp.unshift(Debug.stack[i][1]);
					}
				}
				prefix.push(tmp.join('->'));
			}
/*
e.stack contents by browser:
CHROME:
ReferenceError: abc is not defined
    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:251:6)
    at Worker.init (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:152:22)
    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:345:9)
    at Worker._init (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+debug.js:152:22)
    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker_+main.js:58:15)
    at Worker.<anonymous> (chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:931:19)
    at chrome-extension://pjopfpjfmcdkjjokkbijcehcjhmijhbm/worker.js:559:33

GREASEMONKEY:
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:4452,(1111)
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:4330,(1111)
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:2185,(1111)
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:4330,([object Object],[object Array])
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:4975,([object Object],"run")
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:2814,(215)
@jar:file:///C:/Users/Robin/AppData/Roaming/Mozilla/Firefox/Profiles/0cxznhqg.default/extensions/%7Be4a8a97b-f2ed-450b-b12d-ee082ba24781%7D.xpi!/components/greasemonkey.js:2401,@:0,
*/
			if (Debug.get(['option','logs',level,'stack'], false)) {
				for (i=0; i<Debug.stack.length; i++) {
					worker = Debug.stack[i][1];
					name = Debug.stack[i][2].callee._name;
					if (stack && browser === 'chrome') { // Chrome format stack trace
						while (tmp = stack.shift()) {
							if (tmp.indexOf('Worker.'+name+' ') >= 0 && tmp.indexOf(worker.toLowerCase()) >= 0) {
								break;
							}
							line = ' <' + tmp.regex(/\/([^\/]+:\d+:\d+)\)$/i) + '>'; // We're the anonymous function before the real call
						}
					}
					suffix.unshift('->' + worker + '.' + name + '(' + JSON.shallow(Debug.stack[i][2],2).replace(/^\[|\]$/g,'') + ')' + line);
					for (j=1; j<suffix.length; j++) {
						suffix[j] = '  ' + suffix[j];
					}
				}
				if (!suffix.length) { // Sometimes we're called from a handler
					suffix.push('-> unknown');
				}
				suffix.unshift(''); // Force an initial \n before the stack trace
				if (args.length > 1) {
					suffix.push(''); // Force an extra \n after the stack trace if there's more args
				}
			}
			if (!isString(args[0]) && !isNumber(args[0])) { // If we want to pass a single object for inspection
				args.unshift('');
			}
			args[0] = prefix.join(' ') + (prefix.length && args[0] ? ': ' : '') + (args[0] || '') + suffix.join("\n");
			try {
				console[display] ? console[display].apply(console.firebug ? window : console, args) : console.log.apply(console.firebug ? window : console, args);
			} catch(e) { // FF4 fix - doesn't like .apply
				console[display] ? console[display](args) : console.log(args);
			}
		}
	};
};

Debug.init = function(old_revision) {
	var i, list = [];
	// BEGIN: Change log message type from on/off to debug level
	if (old_revision <= 1097) {
		var type = ['info', 'log', 'warn', 'error', 'debug'];
		for (i in this.option.log) {
			if (this.option.log[i] === true) {
				this.option.log[i] = type[i];
			} else if (this.option.log[i] === false) {
				this.option.log[i] = '-';
			}
		}
		delete this.option.console;
	}
	// END
	for (i in Workers) {
		list.push(i);
	}
	Config.set('worker_list', ['All', '_worker'].concat(list.unique().sort()));
	Config.addButton({
		image:'bug',
		advanced:true,
		className:'blue',
		title:'Bug Reporting',
		click:function(){
			window.open('http://code.google.com/p/game-golem/wiki/BugReporting', '_blank'); 
		}
	});
};

Debug.update = function(event, events) {
	if (events.findEvent(this, 'init')
	 || events.findEvent(this, 'option')) {
		if (this.option.timer) {
			this._revive(this.option.timer, 'timer');
		} else {
			this._forget('timer');
		}
	}
	if (events.findEvent(this, 'init')
	 || events.findEvent(this, 'option')
	 || events.findEvent(this, 'reminder')) {
		this._notify('data'); // Any changes to options should force a dashboard update
	}
	return true;
};

Debug.work = function(){};// Stub so we can be disabled

Debug.menu = function(worker, key) {
	if (!worker) {
		if (!isUndefined(key)) {
			this.set(['option','loglevel'], parseInt(key, 10));
		} else if (Config.option.advanced || Config.option.debug) {
			var levels = [
				':<img src="' + getImage('bug') + '"><b>Log Level</b>',
				'0:' + (this.option.loglevel === 0 ? '=' : '') + 'Info',
				'1:' + (this.option.loglevel === 1 ? '=' : '') + 'Log',
				'2:' + (this.option.loglevel === 2 ? '=' : '') + 'Warn',
				'3:' + (this.option.loglevel === 3 ? '=' : '') + 'Error',
				'4:' + (this.option.loglevel === 4 ? '=' : '') + 'Debug'
			];
			if (Config.option.debug) {
				levels = levels.concat(
					'5:' + (this.option.loglevel === 5 ? '=' : '') + 'User1',
					'6:' + (this.option.loglevel === 6 ? '=' : '') + 'User2',
					'7:' + (this.option.loglevel === 7 ? '=' : '') + 'User3',
					'8:' + (this.option.loglevel === 8 ? '=' : '') + 'User4',
					'9:' + (this.option.loglevel === 9 ? '=' : '') + 'User5'
				);
			}
			return levels;
		}
	}
};

Debug.dashboard = function(sort, rev) {
	var i, o, list = [], order = [], output = [], data = this.temp, total = 0, rx = new RegExp('^'+this.option.worker);
	for (i in data) {
		if (data[i][0] >= this.option.count && (this.option.total || i.indexOf('.') !== -1) && (this.option.prototypes || !/^[^.]+\._/.test(i)) && (this.option.worker === 'All' || rx.test(i))) {
			order.push(i);
		}
		if (i.indexOf('.') === -1) {
			total += parseInt(data[i][1], 10);
		}
	}
	this.runtime.sort = sort = isUndefined(sort) ? (this.runtime.sort || 0) : sort;
	this.runtime.rev = rev = isUndefined(rev) ? (this.runtime.rev || false) : rev;
	order.sort(function(a,b) {
		switch (sort) {
			case 0:	return (a).localeCompare(b);
			case 1: return data[b][0] - data[a][0];
			case 2: return data[b][1] - data[a][1];
			case 3: return data[b][2] - data[a][2];
			case 4: return (data[b][1]/data[b][0]) - (data[a][1]/data[a][0]);
			case 5: return (data[b][2]/data[b][0]) - (data[a][2]/data[a][0]);
			case 6: return ((data[b][2]/data[b][0])-(data[a][1]/data[a][0])) - ((data[a][2]/data[a][0])-(data[b][1]/data[b][0]));
		}
	});
	if (rev) {
		order.reverse();
	}
	list.push('<b>Estimated CPU Time:</b> ' + total.addCommas() + 'ms, <b>Efficiency:</b> ' + (100 - (total / (Date.now() - script_started) * 100)).addCommas(2) + '% <span style="float:right;">' + (this.option.timer ? '' : '&nbsp;<a id="golem-profile-update">update</a>') + '&nbsp;<a id="golem-profile-reset" style="color:red;">reset</a>&nbsp;</span><br style="clear:both">');
	th(output, 'Function', 'style="text-align:left;"');
	th(output, 'Count', 'style="text-align:right;"');
	th(output, 'Time', 'style="text-align:right;"');
	th(output, '&Psi; Time', 'style="text-align:right;"');
	th(output, 'Average', 'style="text-align:right;"');
	th(output, '&Psi; Average', 'style="text-align:right;"');
	th(output, '&Psi; Diff', 'style="text-align:right;"');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (i=0; i<Math.min(this.option.show || Number.POSITIVE_INFINITY,order.length); i++) {
		output = [];
		o = order[i];
		th(output, '<input style="margin:0;" type="checkbox" name="'+o+'"' + (data[o][3] ? ' checked' : '') + (o.indexOf('.') >= 0 ? '' : ' disabled') + '> ' + o, 'style="text-align:left;"');
		o = data[o];
		td(output, o[0].addCommas(), 'style="text-align:right;"');
		td(output, o[1].addCommas() + 'ms', 'style="text-align:right;"');
		td(output, o[2].addCommas() + 'ms', 'style="text-align:right;"');
		td(output, (o[1]/o[0] || 0).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		td(output, (o[2]/o[0] || 0).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		td(output, ((o[2]/o[0] || 0)-(o[1]/o[0] || 0)).addCommas(this.option.digits) + 'ms', 'style="text-align:right;"');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Debug').html(list.join(''));
	$('#golem-dashboard-Debug thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	$('#golem-dashboard-Debug input').change(function() {
		var name = $(this).attr('name');
		Debug.temp[name][3] = !Debug.temp[name][3];
	});
	$('#golem-profile-update').click(function(){Debug._notify('data');});
	$('#golem-profile-reset').click(function(){Debug.temp={};Debug._notify('data');});
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Global:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Global **********
* Purely here for global options - save having too many system panels
*/
var Global = new Worker('Global');
Global.data = Global.runtime = Global.temp = null;
Global.option = {}; // Left in for config options

Global.settings = {
	system:true,
	unsortable:true,
	no_disable:true,
	taint:true
};

// Use .push() to add our own panel groups
Global.display = [];
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History:true, Page, Queue, Resources, Land,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, warn,
	makeImage
*/
/********** Worker.History **********
* History of anything we want.
* Dashboard is exp, income and bank.
*
* History.set('key', value); - sets the current hour's value
* History.set([hour, 'key'], value); - sets the specified hour's value
* History.add('key', value); - adds to the current hour's value (use negative value to subtract)
* History.add([hour, 'key'], value); - adds to the specified hour's value (use negative value to subtract)
*
* History.get('key') - gets current hour's value
* History.get([hour, 'key', 'maths', 'change', recent_hours]) - 'key' is the only non-optional. Must be in this order. Hour = start hour. Recent_hours is 1-168 and the number of hours to get.
* History.get('key.change') - gets change between this and last value (use for most entries to get relative rather than absolute values)
* History.get('key.average') - gets standard deviated mean average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Arithmetic_mean
* History.get('key.geometric') - gets geometric average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Geometric_mean
* History.get('key.harmonic') - gets harmonic average of values (use .change for average of changes etc) - http://en.wikipedia.org/wiki/Harmonic_mean
* History.get('key.mode') - gets the most common value (use .change again if needed)
* History.get('key.median') - gets the center value if all values sorted (use .change again etc)
* History.get('key.total') - gets total of all values added together
* History.get('key.max') - gets highest value (use .change for highest change in values)
* History.get('key.min') - gets lowest value
*/
var History = new Worker('History');
History.option = History.runtime = History.temp = null;

History.settings = {
	system:true,
	taint:true
};

History.dashboard = function() {
	var list = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', {prefix:'$', goal:{'Average Income':this.get('land.mean') + this.get('income.mean')}}));
	list.push(this.makeGraph('bank', 'Bank', {prefix:'$', goal:Land.runtime.best ? {'Next Land':Land.runtime.cost} : null})); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', {goal:{'Next Level':Player.get('maxexp')}}));
	list.push(this.makeGraph('favor points', 'Favor Points',{min:0}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', {min:0, goal:{'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change')}} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
};

History.update = function(event) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			this._set(['data',i]);
		}
	}
};

History.set = function(what, value, type) {
	var x = isArray(what) ? what.slice(0) : isString(what) ? what.split('.') : [];
	if (x.length && !(x[0] in this._datatypes)) {
		if (typeof x[0] !== 'number' && !/^\d+$/i.test(x[0])) {
			x.unshift(Math.floor(Date.now() / 3600000));
		}
		x.unshift('data');
	}
	return this._set(x, value, type);
};

History.add = function(what, value, type) {
	var x = isArray(what) ? what.slice(0) : isString(what) ? what.split('.') : [];
	if (x.length && !(x[0] in this._datatypes)) {
		if (typeof x[0] !== 'number' && !/^\d+$/i.test(x[0])) {
			x.unshift(Math.floor(Date.now() / 3600000));
		}
		x.unshift('data');
	}
	return this._add(x, value, type);
};

History.math = {
	stddev: function(list) {
		var i, l, listsum = 0, mean = this.mean(list);
		for (i = 0, l = list.length; i < l; i++) {
			listsum += Math.pow(list[i] - mean, 2);
		}
		listsum /= list.length;
		return Math.sqrt(listsum);
	},
	average: function(list) {
		var i, l, mean = this.mean(list), stddev = this.stddev(list);
		for (i = 0, l = list.length; i < l; i++) {
			if (Math.abs(list[i] - mean) > stddev * 2) { // The difference between the mean and the entry needs to be in there.
				delete list[i];
			}
		}
		return sum(list) / list.length;
	},
	mean: function(list) {
		return sum(list) / list.length;
	},
	harmonic: function(list) {
		var i, l, num = [];
		for (i = 0, l = list.length; i < l; i++) {
			if (list[i]) {
				num.push(1/list[i]);
			}
		}
		return num.length / sum(num);
	},
	geometric: function(list) {
		var i, l, num = 1;
		for (i = 0, l = list.length; i < l; i++) {
			num *= list[i] || 1;
		}
		return Math.pow(num, 1 / list.length);
	},
	median: function(list) {
		list.sort(function(a,b){return a-b;});
		if (list.length % 2) {
			return (list[Math.floor(list.length / 2)] + list[Math.ceil(list.length / 2)]) / 2;
		}
		return list[Math.floor(list.length / 2)];
	},
	mode: function(list) {
		var i = list.length, j = 0, count = 0, num = {}, max = 0;
		while (i--) {
			num[list[i]] = (num[list[i]] || 0) + 1;
		}
		for (i in num) {
			max = Math.max(max, num[i]);
		}
		for (i in num) {
			if (num[i] >= max) {
				j += i;
				count++;
			}
		}
		return j / count;
	},
	max: function(list) {
		list.sort(function(a,b){return b-a;});
		return list[0];
	},
	min: function(list) {
		list.sort(function(a,b){return a-b;});
		return list[0];
	}
};

History.get = function(what) {
	this._unflush();
	var i, j, value, last, list = [], data = this.data, x = isArray(what) ? what : isString(what) ? what.split('.') : [], hour, past, change = false;
	if (x.length && (isNumber(x[0]) || !x[0].regex(/\D/gi))) {
		hour = x.shift();
	} else {
		hour = Math.floor(Date.now() / 3600000);
	}
	if (x.length && (isNumber(x[x.length-1]) || !x[x.length-1].regex(/\D/gi))) {
		past = Math.range(1, parseInt(x.pop(), 10), 168);
	} else {
		past = 168;
	}
	if (x.length && x[x.length-1] === 'change') {
		x.pop();
		change = true;
	}
	if (!x.length) {
		return data;
	}
	if (x.length === 1) { // We want a single hourly value only
		past = change ? 1 : 0;
	}
	for (i=hour-past; i<=hour; i++) {
		if (data[i]) {
			last = value;
			value = null;
			for (j in data[i]) {
				if ((j === x[0] || j.indexOf(x[0] + '+') === 0) && isNumber(data[i][j])) {
					value = (value || 0) + data[i][j];
				}
			}
			if (x.length > 1 && isNumber(value)) {
				if (!change) {
					list.push(value);
				} else if (isNumber(last)) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						log(LOG_WARN, 'NaN: '+value+' - '+last);
					}
				}
			}
		}
	}
	if (x.length === 1) {
		return change ? value - last : value;
	}
	if (History.math[x[1]]) {
		return History.math[x[1]](list);
	}
	throw('Wanting to get unknown History type ' + x[1] + ' on ' + x[0]);
};

History.getTypes = function(what) {
	var i, list = [], types = {}, data = this.data, x = what + '+';
	for (i in data) {
		if (i.indexOf(x) === 0) {
			types[i] = true;
		}
	}
	for (i in types) {
		list.push(i);
	}
	return list;
};

History.makeGraph = function(type, title, options) {
	var i, j, count, min = isNumber(options.min) ? options.min : Number.POSITIVE_INFINITY, max = isNumber(options.max) ? options.max : Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), numbers, prefix = options.prefix || '', goal;
	if (isNumber(options.goal)) {
		goal = [options.goal];
	} else if (!isArray(options.goal) && !isObject(options.goal)) {
		goal = null;
	} else {
		goal = options.goal;
	}
	if (goal && length(goal)) {
		for (i in goal) {
			if (goal.hasOwnProperty(i)) {
				min = Math.min(min, goal[i]);
				max = Math.max(max, goal[i]);
			}
		}
	}
	if (isString(type)) {
		type = [type];
	}
	for (i=hour-72; i<=hour; i++) {
		value[i] = [0];
		if (this.data[i]) {
			for (j in type) {
				if (type.hasOwnProperty(j)) {
					value[i][j] = this.get(i + '.' + type[j]);
				}
			}
			if ((j = sum(value[i]))) {
				min = Math.min(min, j);
				max = Math.max(max, j);
			}
		}
	}
	if (max >= 1000000000) {
		divide = 1000000000;
		suffix = 'b';
	} else if (max >= 1000000) {
		divide = 1000000;
		suffix = 'm';
	} else if (max >= 1000) {
		divide = 1000;
		suffix = 'k';
	}
	max = Math.ceil(max / divide) * divide;
	max_s = prefix + (max / divide).addCommas() + suffix;
	min = Math.floor(min / divide) * divide;
	min_s = prefix + (min / divide).addCommas() + suffix;
	if (goal && length(goal)) {
		for (i in goal) {
			if (goal.hasOwnProperty(i)) {
				bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
				goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + prefix + (goal[i] / divide).addCommas(1) + suffix + '</div>');
			}
		}
		goalbars = '<div class="goal">' + bars.reverse().join('') + '</div>';
		goal_s.reverse();
	}
	th(list, '<div>' + max_s + '</div><div>' + title + '</div><div>' + min_s + '</div>');
	for (i=hour-72; i<=hour; i++) {
		bars = [];
		output = [];
		numbers = [];
		title = (hour - i) + ' hour' + ((hour - i)===1 ? '' : 's') +' ago';
		count = 0;
		for (j in value[i]) {
			if (value[i].hasOwnProperty(j)) {
				bars.push('<div style="height:' + Math.max(Math.ceil(100 * (value[i][j] - (!count ? min : 0)) / (max - min)), 0) + 'px;"></div>');
				count++;
				if (value[i][j]) {
					numbers.push((value[i][j] ? prefix + value[i][j].addCommas() : ''));
				}
			}
		}
		output.push('<div class="bars">' + bars.reverse().join('') + '</div>' + goalbars);
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + prefix + sum(value[i]).addCommas() : '');
		td(list, output.join(''), 'title="' + title + '"');
	}
	th(list, goal_s.join(''));
	return '<tr>' + list.join('') + '</tr>';
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$:true, Worker, Army, Main:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP:true, APPID:true, APPNAME:true, userID:true, imagepath:true, isRelease, version, revision, Workers, PREFIX:true, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, unsafeWindow, log, warn, error, chrome, GM_addStyle, GM_getResourceText
*/
/********** Worker.Main **********
* Initial kickstart of Golem.
*/
var Main = new Worker('Main');
Main.data = Main.option = Main.runtime = Main.temp = null;

Main.settings = {
	system:true,
	taint:true // Doesn't store any data, but still cleans it up lol
};

Main._apps_ = {};
Main._retry_ = 0;
Main._jQuery_ = false; // Only set if we're loading it

/**
 * Use this function to add more applications
 * @param {string} app The pathname of the app under facebook.com
 * @param {string} appid The facebook app id
 * @param {string} appname The human readable app name
 * @param {?RegExp=} alt An alternative domain for the app (make sure you include the protocol for security)
 * @param {?Function=} fn A function to call before _setup() when the app is recognised
 */
Main.add = function(app, appid, appname, alt, fn) {
	this._apps_[app] = [appid, appname, alt, fn];
};

Main.parse = function() {
	try {
		var newpath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart();
		if (newpath) {
			imagepath = newpath;
		}
	} catch(e) {}
};

Main.update = function(event, events) { // Using events with multiple returns because any of them are before normal running and are to stop Golem...
	var i, old_revision, head, a, b;
	if (events.findEvent(null,null,'kickstart')) {
		old_revision = parseInt(getItem('revision') || 1061, 10); // Added code to support Revision checking in 1062;
		if (old_revision > revision) {
			if (!confirm('GAME-GOLEM WARNING!!!' + "\n\n" +
				'You have reverted to an earlier version of GameGolem!' + "\n\n" +
				'This may result in errors or other unexpected actions!' + "\n\n" +
				'Are you sure you want to use this earlier version?' + "\n" +
				'(selecting "Cancel" will prevent Golem from running and preserve your current data)')) {
				return true;
			}
			log(LOG_INFO, 'GameGolem: Reverting from r' + old_revision + ' to r' + revision);
		} else if (old_revision < revision) {
			log(LOG_INFO, 'GameGolem: Updating ' + APPNAME + ' from r' + old_revision + ' to r' + revision);
		}
		$('#rightCol').prepend('<div id="golem" style="visibility:hidden;"></div>'); // Set the theme from Theme.update('init')
		for (i in Workers) {
			Workers[i]._setup(old_revision);
		}
		for (i in Workers) {
			Workers[i]._init(old_revision);
		}
		for (i in Workers) {
			Workers[i]._update('init', 'run');
		}
		if (old_revision !== revision) {
			setItem('revision', revision);
		}
		$('#golem').css({'visibility':'visible'});
	}
	if (events.findEvent(null,'startup')) {
		// Let's get jQuery running
		if (!$ || !$.support || !$.ui) {
			if (!this._jQuery_) {
				head = document.getElementsByTagName('head')[0] || document.documentElement;
				a = document.createElement('script');
				b = document.createElement('script');
				a.type = b.type = 'text/javascript';
				a.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js';
				b.src = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.12/jquery-ui.min.js';
				head.appendChild(a);
				head.appendChild(b);
				log(LOG_INFO, 'GameGolem: Loading jQuery & jQueryUI');
				this._jQuery_ = true;
			}
			if (!(unsafeWindow || window).jQuery || !(unsafeWindow || window).jQuery.support || !(unsafeWindow || window).jQuery.ui) {
				this._remind(0.1, 'startup');
				return true;
			}
			$ = (unsafeWindow || window).jQuery.noConflict(true);
		}
		// Identify Application
		if (!APP) {
			if (empty(this._apps_)) {
				log(LOG_INFO, 'GameGolem: No applications known...');
			}
			for (i in this._apps_) {
				if ((isFacebook = (window.location.pathname.indexOf(i) === 1)) || (isRegExp(this._apps_[i][2]) && this._apps_[i][2].test(window.location))) {
					APP = i;
					APPID = this._apps_[i][0];
					APPNAME = this._apps_[i][1];
					PREFIX = 'golem'+APPID+'_';
					if (isFacebook) {
						APPID_ = 'app' + APPID + '_';
					} else {
						APPID_ = '';
					}
					if (isFunction(this._apps_[APP][3])) {
						this._apps_[APP][3]();
					}
					log(LOG_INFO, 'GameGolem: Starting '+APPNAME);
					break;
				}
			}
			if (typeof APP === 'undefined') {
				log(LOG_INFO, 'GameGolem: Unknown application...');
				return true;
			}
		}
		// Once we hit this point we have our APP and can start things rolling
		try {
			//userID = (unsafeWindow || window).presence && parseInt((unsafeWindow || window).presence.user); //$('script').text().regex(/user:(\d+),/i);
			if (!userID || !isNumber(userID)) {
				userID = $('script').text().regex(/user:(\d+),/i);
			}
			if (!imagepath) {
				imagepath = $('#app_content_'+APPID+' img:eq(0)').attr('src').pathpart(); // #'+APPID_+'app_body_container
			}
		} catch(e) {
			if (Main._retry_++ < 5) {// Try 5 times before we give up...
				this._remind(1, 'startup');
				return true;
			}
		}
		if (!userID || !imagepath || !isNumber(userID)) {
			log(LOG_INFO, 'ERROR: Bad Page Load!!!');
			window.setTimeout(Page.reload, 5000); // Force reload without retrying
			return true;
		}
		// jQuery selector extensions
		$.expr[':'].css = function(obj, index, meta, stack) { // $('div:css(width=740)')
			var args = meta[3].regex(/([\w-]+)\s*([<>=]+)\s*(\d+)/), value = parseFloat($(obj).css(args[0]));
			switch(args[1]) {
				case '<':	return value < args[2];
				case '<=':	return value <= args[2];
				case '>':	return value > args[2];
				case '>=':	return value >= args[2];
				case '=':
				case '==':	return value === args[2];
				case '!=':	return value !== args[2];
				default:
					log(LOG_ERROR, 'Bad jQuery selector: $:css(' + args[0] + ' ' + args[1] + ' ' + args[2] + ')');
					return false;
			}
		};
		$.expr[':'].golem = function(obj, index, meta, stack) { // $('input:golem(worker,id)') - selects correct id
			var args = meta[3].toLowerCase().split(',');
			return $(obj).attr('id') === PREFIX + args[0].trim().replace(/[^0-9a-z]/g,'-') + '_' + args[1].trim();
		};
		$.expr[':'].regex = function(obj, index, meta, stack) { // $('div:regex(^\stest\s$)') - selects if the text() matches this
			var ac = arguments.callee, rx = ac['_'+meta[3]]; // Cache the regex - it's quite expensive to construct
			if (!rx) {
				rx = ac['_'+meta[3]] = new RegExp(meta[3],'i');
			}
			return rx.test($(obj).text());
		};
		// jQuery extra functions
		$.fn.autoSize = function() {
			function autoSize(e) {
				var p = (e = e.target || e), s;
				if ($(e).is(':visible')) {
					if (e.oldValueLength !== e.value.length) {
						while (p && !p.scrollTop) {p = p.parentNode;}
						if (p) {s = p.scrollTop;}
						e.style.height = '0px';
						e.style.height = Math.max(e.scrollHeight, 13) + 'px';
						if (p) {p.scrollTop = s;}
						e.oldValueLength = e.value.length;
					}
				} else {
					window.setTimeout(function(){autoSize(e);}, 50);
				}
				return true;
			}
			this.filter('textarea').each(function(){
				$(this).css({'resize':'none','overflow-y':'hidden'}).unbind('.autoSize').bind('keyup.autoSize keydown.autoSize change.autoSize', autoSize);
				autoSize(this);
			});
			return this;
		};
		$.fn.selected = function() {
			return $(this).filter(function(){return this.selected;});
		};
		// Now we're rolling
		if (browser === 'chrome' && chrome && chrome.extension && chrome.extension.getURL) {
			$('head').append('<link href="' + chrome.extension.getURL('golem.css') + '" rel="stylesheet" type="text/css">');
		} else if (browser === 'greasemonkey' && GM_addStyle && GM_getResourceText) {
			GM_addStyle(GM_getResourceText('stylesheet'));
		} else {
			$('head').append('<link href="http://game-golem.googlecode.com/svn/trunk/golem.css" rel="stylesheet" type="text/css">');
		}
	//	window.onbeforeunload = Worker.flush; // Make sure we've saved everything before quitting - not standard in all browsers
		this._remind(0.1, 'kickstart'); // Give a (tiny) delay for CSS files to finish loading etc
	}
	return true;
};

if (!Main.loaded) { // Prevent double-start
	log(LOG_INFO, 'GameGolem: Loading...');
	Main._loaded = true;// Otherwise .update() will never fire - no init needed for us as we're the one that calls it
	Main._update('startup');
}

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$:true, Worker, Army, Menu:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP:true, APPID:true, APPNAME:true, userID:true, imagepath:true, isRelease, version, revision, Workers, PREFIX:true, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, unsafeWindow, log, warn, error, chrome, GM_addStyle, GM_getResourceText
*/
/********** Worker.Menu **********
* Handles menu creation and selection for Config
*/
var Menu = new Worker('Menu');
Menu.data = Menu.runtime = Menu.option = Menu.temp = null;

Menu.settings = {
	system:true,
	taint:true
};

Menu.init = function() {
	Config._init(); // We patch into the output of Config.init so it must finish first
	$('<span class="ui-icon golem-menu-icon ui-icon-' + Theme.get('Menu_icon', 'gear') + '"></span>')
		.click(function(event) {
			var i, j, k, keys, hr = false, html = '', $this = $(this.wrappedJSObject || this), worker = Worker.find($this.closest('div').attr('name')), name = worker ? worker.name : '';
			if (Config.get(['temp','menu']) !== name) {
				Config.set(['temp','menu'], name);
				for (i in Workers) {
					if (Workers[i].menu) {
						hr = true;
						Workers[i]._unflush();
						keys = Workers[i].menu(worker) || [];
						for (j=0; j<keys.length; j++) {
							k = keys[j].regex(/([^:]*):?(.*)/);
							if (k[0] === '---') {
								hr = true;
							} else if (k[1]) {
								if (hr) {
									html += html ? '<hr>' : '';
									hr = false;
								}
								switch (k[1].charAt(0)) {
									case '!':	k[1] = '<img src="' + getImage('warning') + '">' + k[1].substr(1);	break;
									case '+':	k[1] = '<img src="' + getImage('tick') + '">' + k[1].substr(1);	break;
									case '-':	k[1] = '<img src="' + getImage('cross') + '">' + k[1].substr(1);	break;
									case '=':	k[1] = '<img src="' + getImage('dot') + '">' + k[1].substr(1);	break;
									default:	break;
								}
								html += '<div name="' + i + '.' + name + '.' + k[0] + '">' + k[1] + '</div>';
							}
						}
					}
				}
				$('#golem-menu').html(html || 'no&nbsp;options');
				$('#golem-menu').css({
					position:Config.get(['option','fixed']) ? 'fixed' : 'absolute',
					top:$this.offset().top + $this.height(),
					left:Math.min($this.offset().left, $('body').width() - $('#golem-menu').outerWidth(true) - 4)
				}).show();
			} else {// Need to stop it going up to the config panel, but still close the menu if needed
				Config.set(['temp','menu']);
				$('#golem-menu').hide();
			}
			Worker.flush();
			event.stopPropagation();
			return false;
		})
		.appendTo('#golem_config_frame > h3:first,#golem_config > div > h3 > a');
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
*/
/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	keep:true,
	taint:true
};

Page.option = {
	timeout:15,
	reload:5,
	nochat:false,
	refresh:250
};

Page.temp = {
	loading:false,
	last:'', // Last url we tried to load
	when:null,
	retry:0, // Number of times we tried before hitting option.reload
	checked:false, // Finished checking for new pages
	count:0,
	enabled:false // Set to true in .work(true) - otherwise Page.to() should throw an error
};

Page.lastclick = null;

Page.runtime = {
	delay:0, // Delay used for bad page load - reset in Page.clear(), otherwise double to a max of 5 minutes
	timers:{}, // Tickers being displayed
	stale:{}
};

Page.page = '';

Page.pageNames = {}; //id:{url:'...', image:'filename.jpg', selector:'jquery selector'}

Page.pageCheck = []; // List of selectors that *must* match for a valid page load

Global.display.push({
	title:'Page Loading',
	group:[
		{
			id:['Page','option','timeout'],
			label:'Retry after',
			select:[10, 15, 30, 60],
			after:'seconds'
		},{
			id:['Page','option','reload'],
			label:'Reload after',
			select:[3, 5, 7, 9, 11, 13, 15],
			after:'tries'
		},{
			id:['Page','option','nochat'],
			label:'Remove Facebook Chat',
			checkbox:true,
			help:'This does not log you out of chat, only hides it from display and attempts to stop it loading - you can still be online in other facebook windows'
		},{
			id:['Page','option','refresh'],
			label:'Refresh After',
			select:{0:'Never', 50:'50 Pages', 100:'100 Pages', 150:'150 Pages', 200:'200 Pages', 250:'250 Pages', 500:'500 Pages'}
		}
	]
});

// We want this to run on the Global context
Global._overload(null, 'work', function(state) {
	var i, l, list, found = null;
	if (!Page.temp.checked) {
		for (i in Workers) {
			if (isString(Workers[i].pages)) {
				list = Workers[i].pages.split(' ');
				for (l=0; l<list.length; l++) {
					if (list[l] !== '*' && list[l] !== 'facebook' && Page.pageNames[list[l]] && !Page.pageNames[list[l]].skip && !Page.data[list[l]] && list[l].indexOf('_active') === -1) {
						found = list[l];
						break;
					}
				}
			}
			if (found) {
				break;
			}
		}
		if (found) {
			if (!state) {
				return QUEUE_CONTINUE;
			}
			Page.to(found);
			Page._set(['data', found], Date.now()); // Even if it's broken, we need to think we've been there!
			return QUEUE_CONTINUE;
		}
	//	arguments.callee = new Function();// Only check when first loading, once we're running we never work() again :-P
		Page.set(['temp','checked'], true);
	}
	if (Page.option.refresh && Page.temp.count >= Page.option.refresh) {
		if (state) {
			if (!$('#reload_link').length) {
				$('body').append('<a id="reload_link" href="http://www.cloutman.com/reload.php">reload</a>');
			}
			Page.click('#reload_link');
		}
		return QUEUE_CONTINUE;
	}
	return this._parent();
});

Page.init = function() {
	// BEGIN: Fix for before Config supported path'ed set
	if (Global.get(['option','page'], false)) {
		this.set(['option','timeout'], Global.get(['option','page','timeout'], this.option.timeout));
		this.set(['option','reload'], Global.get(['option','page','reload'], this.option.reload));
		this.set(['option','nochat'], Global.get(['option','page','nochat'], this.option.nochat));
		this.set(['option','refresh'], Global.get(['option','page','refresh'], this.option.refresh));
		Global.set(['option','page']);
	}
	// END
	this._trigger('#'+APPID_+'app_body_container, #'+APPID_+'globalContainer', 'page_change');
	this._trigger('.generic_dialog_popup', 'facebook');
	if (this.option.nochat) {
		$('#fbDockChat').hide();
	}
	$('.golem-link').live('click', function(event){
		if (!Page.to($(this).attr('href'), null, false)) {
			return false;
		}
	});
	this._revive(1, 'timers');// update() once every second to update any timers
};

Page.update = function(event, events) {
	// Can use init as no system workers (which can come before us) care what page we are on
	var i, list, now = Date.now(), time;
	if (events.findEvent(null,'reminder','timers')) {
		for (i in this.runtime.timers) {
			time = (this.runtime.timers[i] - now) / 1000;
			if (time <= -604800) { // Delete old timers 1 week after "now?"
				this.set(['runtime','timers',i]);
			} else {
				$('#'+i).text(time > 0 ? makeTimer(time) : 'now?')
			}
		}
	}
	if (events.findEvent(null,'reminder','retry')) {
		this.retry();
	}
	if (events.findEvent(null,'init') || events.findEvent(null,'trigger','page_change')) {
		list = this.pageCheck;
//		log('Page change noticed...');
		this._forget('retry');
		this.set(['temp','loading'], false);
		for (i=0; i<list.length; i++) {
			if (!$(list[i]).length) {
				log(LOG_WARN, 'Bad page warning: Unabled to find '+list[i]);
				this.retry();
				return;
			}
		}
		// NOTE: Need a better function to identify pages, this lot is bad for CPU
		this.page = '';
		$('img', $('#'+APPID_+'app_body')).each(function(i,el){
			var i, filename = $(el).attr('src').filepart();
			for (i in Page.pageNames) {
				if (Page.pageNames[i].image && filename === Page.pageNames[i].image) {
					Page.page = i;
//					log(LOG_DEBUG, 'Page:' + Page.page);
					return;
				}
			}
		});
		if (this.page === '') {
			for (i in Page.pageNames) {
				if (Page.pageNames[i].selector && $(Page.pageNames[i].selector).length) {
//					log(LOG_DEBUG, 'Page:' + Page.page);
					Page.page = i;
				}
			}
		}
		if (this.page !== '') {
			this.set(['data',this.page], Date.now());
			this.set(['runtime', 'stale', this.page]);
		}
//		log(LOG_WARN, 'Page.update: ' + (this.page || 'Unknown page') + ' recognised');
		list = {};
		for (i in Workers) {
			if (Workers[i].pages
			 && Workers[i].pages.indexOf
			 && (Workers[i].pages.indexOf('*') >= 0 || (this.page !== '' && Workers[i].pages.indexOf(this.page) >= 0))
			 && Workers[i]._parse(false)) {
				list[i] = true;
			}
		}
		for (i in list) {
			Workers[i]._parse(true);
		}
	}
	if (events.findEvent(null,'trigger','facebook')) { // Need to act as if it's a page change
		this._forget('retry');
		this.set(['temp', 'loading'], false);
		for (i in Workers) {
			if (Workers[i].parse && Workers[i].pages && Workers[i].pages.indexOf('facebook') >= 0) {
				Workers[i]._parse('facebook');
			}
		}
	}
	return true;
};

Page.makeURL = function(url, args) {
	var abs = 'apps.facebook.com/' + APP + '/';
	if (url in this.pageNames) {
		url = this.pageNames[url].url;
	} else {
		if (url.indexOf(abs) !== -1) {// Absolute url within app
			url = url.substr(abs.length);
		}
	}
	if (isString(args) && args.length) {
		url += (/^\?/.test(args) ? '' : '?') + args;
	} else if (isObject(args)) {
		url += '?' + decodeURIComponent($.param(args));
	}
	return url;
};

Page.makeLink = function(url, args, content) {
	var page = this.makeURL(url, args);
	return '<a href="' + window.location.protocol + '//apps.facebook.com/' + APP + '/' + page + '" onclick="' + (APPID_==='' ? '' : 'a'+APPID+'_') + 'ajaxLinkSend(&#039;globalContainer&#039;,&#039;' + page + '&#039;);return false;' + '">' + content + '</a>';
};

/*
Page.to('index', ['args' | {arg1:val, arg2:val},] [true|false]
*/
Page.to = function(url, args, force) { // Force = true/false (allows to reload the same page again)
	if (!this.temp.enabled) {
		log(LOG_ERROR, 'BAD_FUNCTION_USE in Page.to('+JSON.shallow(arguments,2)+'): Not allowed to use Page.to() outside .work(true)');
		return true;
	}
	var page = this.makeURL(url, args);
//	if (Queue.option.pause) {
//		log(LOG_ERROR, 'Trying to load page when paused...');
//		return true;
//	}
	if (!page || (!force && page === (this.temp.last || this.page))) {
		return true;
	}
	if (page !== (this.temp.last || this.page)) {
		this.clear();
		this.set(['temp','last'], page);
		this.set(['temp','when'], Date.now());
		this.set(['temp','loading'], true);
		log('Navigating to ' + page);
	} else if (force) {
		window.location.href = 'javascript:void((function(){})())';// Force it to change
	}
	window.location.href = /^https?:/i.test(page) ? page : 'javascript:void(' + (APPID_==='' ? '' : 'a'+APPID+'_') + 'ajaxLinkSend("globalContainer","' + page + '"))';
	this._remind(this.option.timeout, 'retry');
	this.set(['temp','count'], this.get(['temp','count'], 0) + 1);
	return false;
};

Page.retry = function() {
	if (this.temp.reload || ++this.temp.retry >= this.option.reload) {
		this.reload();
	} else if (this.temp.last) {
		log(LOG_WARN, 'Page load timeout, retry '+this.temp.retry+'...');
		this.temp.enabled = true;
		this.to(this.temp.last, null, true);// Force
		this.temp.enabled = false;
	} else if (this.lastclick) {
		log(LOG_WARN, 'Page click timeout, retry '+this.temp.retry+'...');
		this.temp.enabled = true;
		this.click(this.lastclick);
		this.temp.enabled = false;
	} else {
		// Probably a bad initial page load...
		// Reload the page - but use an incrimental delay - every time we double it to a maximum of 5 minutes
		var delay = this.set(['runtime','delay'], Math.max((this.get(['runtime','delay'], 0) * 2) || this.get(['option','timeout'], 10), 300));
		this.set(['temp','reload'], true);
		this.set(['temp','loading'], true);
		this._remind(delay,'retry',{worker:this, type:'init'});// Fake it to force a re-check
		$('body').append('<div style="position:absolute;top:100;left:0;width:100%;"><div style="margin:auto;font-size:36px;color:red;">ERROR: Reloading in ' + Page.addTimer('reload',delay * 1000, true) + '</div></div>');
		log(LOG_ERROR, 'Unexpected retry event.');
	}
};
		
Page.reload = function() {
	log('Page.reload()');
	window.location.replace(window.location.href);
};

Page.clearFBpost = function(obj) {
	var i, output = [];
	for (i=0; i<obj.length; i++) {
		if (obj[i].name.indexOf('fb_') !== 0) {
			output.push(obj[i]);
		}
	}
	if (!output.bqh && $('input[name=bqh]').length) {
		output.push({name:'bqh', value:$('input[name=bqh]').first().val()});
	}
	return output;
};

Page.click = function(el) {
	if (!this.temp.enabled) {
		log(LOG_ERROR, 'BAD_FUNCTION_USE in Page.click('+JSON.shallow(arguments,2)+'): Not allowed to use Page.click() outside .work(true)');
		return true;
	}
	if (!$(el).length) {
		log(LOG_ERROR, 'Page.click: Unable to find element - '+el);
		return false;
	}
	var e, element = $(el).get(0);
	if (this.lastclick !== el) {
		this.clear();
	}
	this.set(['runtime', 'delay'], 0);
	this.lastclick = el; // Causes circular reference when watching...
	this.set(['temp','when'], Date.now());
	this.set(['temp','loading'], true);
	e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	(element.wrappedJSObject ? element.wrappedJSObject : element).dispatchEvent(e);
	this._remind(this.option.timeout, 'retry');
	this.set(['temp','count'], this.get(['temp','count'], 0) + 1);
	return true;
};

Page.clear = function() {
	this.lastclick = null;
	this.set(['temp','last'], null);
	this.set(['temp','when'], null);
	this.set(['temp','retry'], 0);
	this.set(['temp','reload'], 0);
	this.set(['temp','loading'], false);
	this.set(['runtime','delay'], 0);
};

Page.addTimer = function(id, time, relative) {
	if (relative) {
		time = Date.now() + time;
	}
	this.set(['runtime','timers','golem_timer_'+id], time);
	return '<span id="golem_timer_'+id+'">' + makeTimer((time - Date.now()) / 1000) + '</span>';
};

Page.delTimer = function(id) {
	this.set(['runtime','timers','golem_timer_'+id]);
};

/*
 * Set a value in one of our _datatypes
 * @param {string} page The page we need to visit
 * @param {number} age How long is it allowed to be stale before we need to visit it again (in seconds), use -1 for "now"
 * @param {boolean} go Automatically call Page.to(page)
 * @return {boolean} True if we don't need to visit the page, false if we do
 */
Page.stale = function(page, age, go) {
	if (age && (page in this.pageNames)) {
		var now = Date.now();
		if (this.data[page] < now - (age * 1000)) {
			if (go && !this.to(page)) {
				this.set(['data',page], now);
			}
			return false;
		}
	}
	return true;
};

/*
 * Mark a page as stale, hinting to relevant workers that it needs a visit.
 * @param {string} page The page to mark as stale
 * @param {number} [when=Date.now()] Optional point when the page became stale.
 */
Page.setStale = function(page, when) {
	var now = Date.now(),
		seen = this.get(['data',page], 0, 'number'),
		want = this.get(['runtime','stale',page], 0, 'number');

	// don't let this be negative (pre 1970) or future (past "now")
	if (!isNumber(when) || when < 0 || when > now || want > now) {
		when = now;
	}

	// maintain the later date if ours is older
	if (seen >= when && seen >= want) {
		this.set(['runtime','stale',page]);
	} else if (want < when || want > now) {
		this.set(['runtime','stale',page], Math.round(when));
	}
};

/*
 * Test if a page is considered stale.
 * @param {string} page The page to check for staleness
 * @param {number} [when] Optional check against a specific time.
 * @return {boolean} True if the page is considered stale.
 */
Page.isStale = function(page, when) {
	var seen = this.get(['data',page], 0, 'number'),
		want = this.get(['runtime','stale',page], 0, 'number');

	if (isNumber(when) && want < when) {
		want = when;
	}

	// never seen or older than our stale mark
	return !seen || seen < want;
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue:true, Resources, Window,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, window, browser,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue');
Queue.data = Queue.runtime = null;

// worker.work() return values for stateful - ie, only let other things interrupt when it's "safe"
var QUEUE_FINISH	= 0;// Finished everything, let something else work
var QUEUE_NO_ACTION	= QUEUE_FINISH;// Finished everything, let something else work
var QUEUE_CONTINUE	= 1;// Not finished at all, don't interrupt
var QUEUE_RELEASE	= 2;// Not quite finished, but safe to interrupt 
var QUEUE_INTERRUPT_OK	= QUEUE_RELEASE;// Not quite finished, but safe to interrupt 
// worker.work() can also return true/false for "continue"/"finish" - which means they can be interrupted at any time

Queue.settings = {
	system:true,
	keep:true,
	taint:true
};

// NOTE: ALL THIS CRAP MUST MOVE, Queue is a *SYSTEM* worker, so it must know nothing about CA workers or data
Queue.temp = {
	current:null
};

Queue.option = {
	queue: ['Global', 'Debug', 'Resources', 'Generals', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Guild', 'Festival', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Army', 'Idle', 'FP'], // Must match worker names exactly - even by case
	delay: 5,
	clickdelay: 5,
	pause: false
};

Queue.temp = {
	sleep:false // If we're currently sleeping, no workers can run...
};

Global.display.push({
	title:'Running',
	group:[
		{
			id:['Queue','option','delay'],
			label:'Delay Between Events',
			number:true,
			after:'secs',
			min:1,
			max:30
		},{
			id:['Queue','option','clickdelay'],
			label:'Delay After Mouse Click',
			number:true,
			after:'secs',
			min:1,
			max:60,
			help:'This should be a multiple of Event Delay'
		}
	]
});

Queue.init = function(old_revision) {
	Config._init(); // Make sure we're running after the display is created...
	var i, $btn, worker;
	// BEGIN: Moving stats into Resources
	if (old_revision <= 1095) {
		if (this.option.energy) {
			Resources.set(['option','reserve','energy'], this.option.energy);
			this.set(['option','energy']);
			this.set(['option','start_energy']);
		}
		if (this.option.stamina) {
			Resources.set(['option','reserve','stamina'], this.option.stamina);
			this.set(['option','stamina']);
			this.set(['option','start_stamina']);
		}
		this.set(['runtime','quest']);
		this.set(['runtime','general']);
		this.set(['runtime','action']);
		this.set(['runtime','stamina']);
		this.set(['runtime','energy']);
		this.set(['runtime','force']);
		this.set(['runtime','burn']);
		this.set(['runtime','big']);
		this.set(['runtime','basehit']);
		this.set(['runtime','levelup']);
	}
	// END
	this.option.queue = this.option.queue.unique();
	for (i in Workers) {
		if (Workers[i].work && Workers[i].display) {
			this._watch(Workers[i], 'option._disabled');// Keep an eye out for them going disabled
			if (!this.option.queue.find(i)) {// Add any new workers that have a display (ie, sortable)
				log('Adding '+i+' to Queue');
				this.option.queue[Workers[i].settings.unsortable ? 'unshift' : 'push'](i);
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {// Then put them in saved order
		worker = Workers[this.option.queue[i]];
		if (worker && worker.display) {
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).bind('click keypress', function(event){
		if (!event.target || !$(event.target).parents().is('#golem_config_frame,#golem-dashboard')) {
			Queue.set(['temp','sleep'], true);
			Queue._remind(Queue.get(['option','clickdelay'], 5), 'click');
		}
	});
	Config.addButton({
		id:'golem_pause',
		image:this.option.pause ? 'play' : 'pause',
		className:this.option.pause ? 'red' : 'green',
		prepend:true,
		title:'Pause',
		click:function() {
			var pause = Queue.toggle(['option','pause'], true);
			log(LOG_INFO, 'State: ' + (pause ? 'paused' : 'running'));
			$(this).toggleClass('red green').attr('src', getImage(pause ? 'play' : 'pause'));
			if (!pause) {
				$('#golem_step').hide();
			} else if (Config.get(['option','debug'], false)) {
				$('#golem_step').show();
			}
			Queue.set(['temp','current']);
		}
	});
	Config.addButton({
		id:'golem_step',
		image:'step',
		className:'green',
		after:'golem_pause',
		hide:!this.option.pause || !Config.get(['option','debug'], false),
		click:function() {
			$(this).toggleClass('red green');
			Queue._update({type:'step'}, 'run'); // A single shot
			$(this).toggleClass('red green');
		}
	});
	// Running the queue every second, options within it give more delay
	this._watch('Page', 'temp.loading');
	this._watch('Session', 'temp.active');
	this._watch(this, 'option.pause');
	this._watch(this, 'temp.current');
	this._watch(this, 'temp.sleep');
	Title.alias('pause', 'Queue:option.pause:(Pause) ');
	Title.alias('worker', 'Queue:temp.current::None');
	this._notify('temp.current');
};

Queue.update = function(event, events) {
	var i, worker, result, next, release = false;
	for (event=events.findEvent(null, 'watch', 'option._disabled'); event; event=events.findEvent()) { // A worker getting disabled / enabled
		worker = event.worker;
		i = worker._get(['option', '_disabled'], false);
		$('#'+worker.id+' > h3').toggleClass(Theme.get('Queue_disabled', 'ui-state-disabled'), i);
		if (i && this.temp.current === worker.name) {
			this.set(['temp','current'], null);
		}
	}
	if (events.getEvent(this, 'watch', 'temp.current')) {
		$('#golem_config > div > h3').removeClass(Theme.get('Queue_active', 'ui-state-highlight'));
		if (this.temp.current) {
			$('#'+Workers[this.temp.current].id+' > h3').addClass(Theme.get('Queue_active', 'ui-state-highlight'));
		}
	}
	if (this.temp.sleep
	 || events.findEvent(null, 'watch')
	 || events.findEvent(this, 'init')) { // loading a page, pausing, resuming after a mouse-click, or init
		if (this._get(['option','pause']) || Page._get(['temp','loading']) || !Session._get(['temp','active']) || this._timer('click')) {
			this.temp.sleep = true;
		} else {
			this.temp.sleep = false;
		}
	}
	if (this.temp.sleep) {
		while (events.getEvent(this,'reminder')) { // Only delete the run timer if it's been triggered when we're "busy"
			this._forget('run');
		}
	} else if (!this._timer('run')) {
		this._revive(this.option.delay, 'run');
	}
	if ((!this.temp.sleep && events.findEvent(this,'reminder')) || events.findEvent(this,'step')) { // Will fire on the "run" and "click" reminders if we're not sleeping, also on "step"
		for (i in Workers) { // Run any workers that don't have a display, can never get focus!!
			if (Workers[i].work && !Workers[i].display && !Workers[i]._get(['option', '_disabled'], false) && !Workers[i]._get(['option', '_sleep'], false)) {
//				log(LOG_DEBUG, Workers[i].name + '.work(false);');
				Workers[i]._unflush();
				Workers[i]._work(false);
			}
		}
		for (i=0; i<this.option.queue.length; i++) {
			worker = Workers[this.option.queue[i]];
			if (!worker || !worker.work || !worker.display || worker._get(['option', '_disabled'], false) || worker._get(['option', '_sleep'], false)) {
				if (worker && this.temp.current === worker.name) {
					this.set(['temp','current']);
				}
				continue;
			}
//			log(LOG_DEBUG, worker.name + '.work(' + (this.temp.current === worker.name) + ');');
			if (this.temp.current === worker.name) {
				worker._unflush();
				Page.temp.enabled = true;
				result = worker._work(true);
				Page.temp.enabled = false;
				if (result === QUEUE_RELEASE) {
					release = true;
				} else if (!result) {// false or QUEUE_FINISH
					this.set(['temp','current']);
				}
			} else {
				result = worker._work(false);
			}
			if (!worker.settings.stateful && typeof result === 'number') {// QUEUE_* are all numbers
				worker.settings.stateful = true;
			}
			if (!next && result) {
				next = worker; // the worker who wants to take over
			}
		}
		worker = Worker.find(this.temp.current);
		if (next !== worker && (!worker || !worker.settings.stateful || next.settings.important || release)) {// Something wants to interrupt...
			log(LOG_INFO, 'Trigger ' + next.name);
			this.set(['temp','current'], next.name);
		}
//		log(LOG_DEBUG, 'End Queue');
	}
	return true;
};

Queue.menu = function(worker, key) {
	if (worker) {
		if (!key) {
			if (worker.work && !worker.settings.no_disable) {
				return ['enable:' + (worker.get(['option','_disabled'], false) ? '-Disabled' : '+Enabled')];
			}
		} else if (key === 'enable') {
			worker.set(['option','_disabled'], worker.option._disabled ? undefined : true);
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Resources **********
* Store and report Resources

Workers can add a type of Resources that they supply - Player would supply Energy and Stamina when parsing etc
Workers request buckets of Resourcess during init() - each bucket gets a display in the normal Resources config panel.

Items can be added as a type - *however* - they should be added with an amount and not as a spendable type by only calling Resources.add(type,amount)
Convention for unspendable Resourcess is to prefix the name with an underscore, ie. "_someitemimage.jpg" (needs to be unique)

Data can be stored for types by using Resourec.set([type, key], value); etc - this makes it "safer" for workers to discuss needs ;-)
Data can be stored at multiple levels deep - simply add extra keys - [type, key1, key2]

Resources stores the buckets as well as an overflow bucket - the overflow is used during level up

Buckets may be either -
"Shared" buckets are like now - first-come, first-served from a single source
- or -
"Exclusive" buckets are filled by a drip system, forcing workers to share Resourcess

The Shared bucket has a priority of 0

When there is a combination of Shared and Exclusive, the relative priority of the buckets are used - total of all priorities / number of buckets.
Priority is displayed as Disabled, -4, -3, -2, -1, 0, +1, +2, +3, +4, +5

When a worker is disabled (worker.get(['option', '_disabled'], false)) then it's bucket is completely ignored and Resourcess are shared to other buckets.

Buckets are filled in priority order, in cases of same priority, alphabetical order is used
*/

var Resources = new Worker('Resources');
Resources.temp = null;

Resources.settings = {
	system:true,
	unsortable:true,
	no_disable:true
};

Resources.data = {// type:{data} - managed by any access...
};

Resources.option = {
	types:{},
	reserve:{},
	buckets:{}
};

Resources.runtime = {
	types:{},// {'Energy':true}
	buckets:{}
};

//Resources.display = 'Discovering Resources...';

Resources.display = function() {
	var type, group, worker, display = [];
	if (!length(this.runtime.types)) {
		return 'No Resources to be Used...';
	}
	display.push({title:'IMPORTANT', label:'Only the Reserve option is currently active...'});
	for (type in this.option.types) {
		group = [];
		for (worker in this.runtime.buckets) {
			if (type in this.runtime.buckets[worker]) {
				group.push({
					id:'buckets.'+worker+'.'+type,
					label:'...<b>'+worker+'</b> priority',
					select:{10:'+5',9:'+4',8:'+3',7:'+2',6:'+1',5:'0',4:'-1',3:'-2',2:'-3',1:'-4',0:'Disabled'}
				});
			}
		}
		if (group.length) {
			display.push({
				title:type,
				group:[
					{
						id:'reserve.'+type,
						label:'Reserve',
						number:true,
						min:0,
						max:500,
						step:10
					},{
						id:'types.'+type,
						label:type+' Use',
						select:{0:'None',1:'Shared',2:'Exclusive'}
					},{
						group:group,
						require:'types.'+type+'==2'
					}
				]
			});
		}
	}
	return display;
};

Resources.init = function() {
	this._watch(this, 'option');
};

Resources.update = function(event) {
	if (event.type === 'watch') {
		var worker, type, total = 0;
		for (type in this.option.types) {
			for (worker in this.runtime.buckets) {
				if (type in this.runtime.buckets[worker]) {
					if (this.option.types[type] === 2) {// Exclusive
						total += this.runtime.buckets[worker][type];
					} else {
						this.runtime.buckets[worker][type] = 0;
					}
				}
			}
			if (this.option.types[type] === 2 && Math.ceil(total) < Math.floor(this.runtime.types[type])) {// We've got an excess for Exclusive, so share
				total = this.runtime.types[type] - total;
				this.runtime.types[type] -= total;
				this.add(type, total);
			}
		}
	}
};

/***** Resources.add() *****
type = name of Resources
amount = amount to add
absolute = is an absolute amount, not relative
1a. If amount isn't set then add a type of Resources that can be spent
1b. Update the display with the new type
1c. Don't do anything else ;-)
2. Changing the amount:
2a. If absolute then get the relative amount and work from there
3. Save the new amount
NOTE: we can add() items etc here, by never calling with just the item name - so it won't ever be "spent"
*/
Resources.add = function(type, amount, absolute) {
	if (isUndefined(amount)) {// Setting up that we use this type
		this.set(['runtime','types',type], this.runtime.types[type] || 0);
		this.set(['option','types',type], this.option.types[type] || 1);
		this.set(['option','reserve',type], this.option.reserve[type] || 0);
	} else {// Telling of any changes to the amount
		var total = 0, worker;
		if (absolute) {
			amount -= this.runtime.types[type];
		}
		if (amount) {
			// Store the new value
			this.set(['runtime','types',type], this.runtime.types[type] + amount);
			// Now fill any pots...
			amount -= Math.max(0, this.runtime.types[type] - parseInt(this.option.reserve[type]));
			if (amount > 0 && this.option.types[type] === 2) {
				for (worker in this.option.buckets) {
					if (type in this.option.buckets[worker]) {
						total += this.option.buckets[worker][type];
					}
				}
				amount /= total;
				for (worker in this.option.buckets) {
					if (type in this.option.buckets[worker]) {
						this.set(['runtime','buckets',worker,type], this.runtime.buckets[worker][type] + amount * this.option.buckets[worker][type]);
					}
				}
			}		
		}
	}
};

/***** Resources.use() *****
Register to use a type of Resources that can be spent
Actually use a type of Resources (must register with no amount first)
type = name of Resources
amount = amount to use
use = are we using it, or just checking if we can?
*/
Resources.use = function(type, amount, use) {
	if (Worker.stack.length) {
		var worker = Worker.stack[0];
		if (isUndefined(amount)) {
			this.set(['runtime','buckets',worker,type], this.runtime.buckets[worker] && this.runtime.buckets[worker][type] || 0);
			this.set(['option','buckets',worker,type], this.option.buckets[worker] && this.option.buckets[worker][type] || 5);
		} else if (!amount) {
			return true;
		} else if (this.option.types[type] === 1 && this.runtime.types[type] >= amount) {// Shared
			if (use) {
				this.set(['runtime','types',type], this.runtime.types[type] - amount);
			}
			return true;
		} else if (this.option.types[type] === 2 && this.runtime.buckets[worker][type] >= amount) {// Exlusive
			if (use) {
				this.set(['runtime','types',type], this.runtime.types[type] - amount);
				this.set(['runtime','buckets',worker,type], this.runtime.buckets[worker][type] - amount);
			}
			return true;
		}
	}
	return false;
};

/***** Resources.has() *****
Check if we've got a certain number of a Resources in total - not on a per-worker basis
Use this to check on "non-spending" resources
*/
Resources.has = function(type, amount) {
	return isUndefined(amount) ? (this.runtime.types[type] || 0) : (this.runtime.types[type] || 0) >= amount;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global console, isString, isArray, isNumber, isUndefined, Workers, Worker, Settings, $ */
// Internal scripting language - never give access to eval() etc.

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [[false,"testing","blah"],"=",1234,"&",["yet","another","path"],"|",[false,"something"],"&",["test","me"],">",5]
// _operators - >,>=,=,==,<=,<,!=,!==,&,&&,|,||
// values = option, path.to.option, number, "string"
// components:
//	"[^"]*"								- string
//	'[^']*'								- string
//	\d*\.?\d+(?:[eE][-+]?\d+)?			- number
//	true|false							- boolean constants
//	[#A-Za-z_]\w*(?:\.\w+)*				- variable
//	[!=]==								- 3-char operators (comparators)
//	[-+*/%<>!=]=						- 2-char operators (comparators)
//	\|\|								- 2-char or operator
//	&&									- 2-char and operator
//	[-+*/%<>!=(){},;]					- 1-char operators

// '!testing.blah=1234 & yet.another.path | !something & test.me > 5'
// [["testing","blah"],"=",1234,"&",["yet","another","path"],"|",["something"],"&",["test","me"],">",5]

var Script = new Worker('Script');
Script.data = Script.runtime = null;

Script.option = {
	worker:'Player',
	type:'data'
};

Script.settings = {
	system:true,
	debug:true,
	taint:true
};

Script.temp = {}; // Used for variables only!!!

Script.dashboard = function() {
	var i, path = this.option.worker+'.'+this.option.type, html = '', list = [];
	html += '<input id="golem_script_run" type="button" value="Run">';
	html += ' Using: <select id="golem_script_worker">';
	for (i=1; i<Settings.temp.paths.length; i++) {
		html += '<option value="' + Settings.temp.paths[i] + '"' + (Settings.temp.paths[i] === path ? ' selected' : '') + '>' + Settings.temp.paths[i] + '</option>';
	}
	html += '</select>';
	html += ' Result: <input id="golem_script_result" type="text" value="" disabled>';
	html += '<input id="golem_script_clear" style="float:right;" type="button" value="Clear">';
	html += '<div class="ui-helper-clearfix" style="border:1px solid #bdc7d8;padding:2px;"><textarea id="golem_script_edit" placeholder="Enter code here" style="width:100%;" class="ui-helper-reset"></textarea></div>';
	html += '<div class="ui-helper-clearfix" style="border:1px solid #bdc7d8;padding:2px;"><textarea id="golem_script_source" placeholder="Compiled code" style="width:100%;" class="ui-helper-reset" disabled></textarea></div>';
	$('#golem-dashboard-Script').html(html);
	$('#golem_script_worker').change(function(){
		var path = $(this).val().regex(/([^.]*)\.?(.*)/);
		if (path[0] in Workers) {
			Script.option.worker = path[0];
			Script.option.type = path[1];
		} else {
			Script.option.worker = Script.option.type = null;
		}
	});
	$('#golem_script_source,#golem_script_edit').autoSize();
	$('#golem_script_run').click(function(){
		var script = Script.parse(Workers[Script.option.worker], Script.option.type, $('#golem_script_edit').val());
		$('#golem_script_source').val(script.length ? JSON.stringify(script, null, '   ') : '').autoSize();
		$('#golem_script_result').val(Script.interpret(script));
	});
	$('#golem_script_clear').click(function(){$('#golem_script_edit,#golem_script_source,#golem_script_result').val('');});
};

Script._find = function(op, table) {
	var i = table.length;
	while (i--) {
		if (table[i][0] === op) {
			return i;
		}
	}
	return -1;
};

Script._operators = [ // Order of precidence, [name, expand_args, function]
	// Unary/Prefix
	//['u++',	false,	function(l,r) {return this.temp[r] += 1;}],
	//['u--',	false,	function(l,r) {return this.temp[r] -= 1;}],
	['u+',	true,	function(l,r) {return r;}],
	['u-',	true,	function(l,r) {return -r;}],
	['u!',	true,	function(l,r) {return !r;}],
	['!',	true,	false],		// placeholder
	// Postfix
	//['p++',	false,	function(l) {var v = this.temp[l]; this.temp[l] += 1; return v;}],
	//['++',	false,	false],	// placeholder
	//['p--',	false,	function(l) {var v = this.temp[l]; this.temp[l] -= 1; return v;}],
	//['--',	false,	false],	// placeholder
	// Maths
	['*',	true,	function(l,r) {return l * r;}],
	['/',	true,	function(l,r) {return l / r;}],
	['%',	true,	function(l,r) {return l % r;}],
	['+',	true,	function(l,r) {return l + r;}],
	['-',	true,	function(l,r) {return l - r;}],
	// Equality
	['>',	true,	function(l,r) {return l > r;}],
	['>=',	true,	function(l,r) {return l >= r;}],
	['<=',	true,	function(l,r) {return l <= r;}],
	['<',	true,	function(l,r) {return l < r;}],
	['===',	true,	function(l,r) {return l === r;}],
	['!==',	true,	function(l,r) {return l !== r;}],
/*jslint eqeqeq:false */
	['==',	true,	function(l,r) {return l == r;}],
	['!=',	true,	function(l,r) {return l != r;}],
/*jslint eqeqeq:true */
	// Logical
	['&&',	true,	function(l,r) {return l && r;}],
	['||',	true,	function(l,r) {return l || r;}],
	// Assignment
	['=',	false,	function(l,r) {return (this.temp[l] = this._expand(r));}],
	['*=',	false,	function(l,r) {return (this.temp[l] *= this._expand(r));}],
	['/=',	false,	function(l,r) {return (this.temp[l] /= this._expand(r));}],
	['%=',	false,	function(l,r) {return (this.temp[l] %= this._expand(r));}],
	['+=',	false,	function(l,r) {return (this.temp[l] += this._expand(r));}],
	['-=',	false,	function(l,r) {return (this.temp[l] -= this._expand(r));}]
];

var FN_EXPAND = 0; // function(expand(args)), expanded variables -> values
var FN_RAW = 1; // function(args), unexpanded (so variable names are not changed to their values)
var FN_CUSTOM = 2; // function(script, value_list, op_list)

Script._functions = [ // [name, expand_args, function]
	['min',		FN_EXPAND,	function() {return Math.min.apply(Math, arguments);}],
	['max',		FN_EXPAND,	function() {return Math.max.apply(Math, arguments);}],
	['round',	FN_EXPAND,	function() {return Math.round.apply(Math, arguments);}],
	['floor',	FN_EXPAND,	function() {return Math.floor.apply(Math, arguments);}],
	['ceil',	FN_EXPAND,	function() {return Math.ceil.apply(Math, arguments);}],
	['if',		FN_CUSTOM,	function(script, value_list, op_list) { // if (test) {func} [else if (test) {func}]* [else {func}]?
		var x, fn = 'if', test = false;
		while (fn) {
			x = fn === 'if' ? script.shift() : null; // Should probably report some sort of error if not an array...
			fn = script.shift(); // Should probably report some sort of error if not an array...
			if (!test && (!x || (test = Script._interpret(x).pop()))) {
				value_list = value_list.concat(Script._interpret(fn));
			}
			if (script[0] !== 'else') {
				break;
			}
			fn = script.shift(); // 'else'
			if (script[0] === 'if') {
				fn = script.shift();
			}
		}
	}],
	['for',	FN_CUSTOM,	function(script, value_list, op_list) {
		var a, i = 0; x = [[],[],[]], tmp = script.shift(), fn = script.shift(), now = Date.now();
		while ((a = tmp.shift())) {
			if (a === ';') {
				x[++i] = [];
			} else {
				x[i].push(a);
			}
		}
		// Should probably report some sort of error if not an array...
		Script._interpret(x[0]);
		while (Script._interpret(x[1]).pop() && Date.now() - now < 3000) { // 3 second limit on loops
			Script._interpret(fn);
			Script._interpret(x[2]);
		}
	}],
	['while',	FN_CUSTOM,	function(script, value_list, op_list) {
		var x = script.shift(), fn = script.shift(), now = Date.now();
		while (Script._interpret(x).pop() && Date.now() - now < 3000) { // 3 second limit on loops
			Script._interpret(fn);
		}
	}],
	['return',	FN_CUSTOM,	function(script, value_list, op_list) {
		var x = script.shift();
		Script._return = Script._interpret(isArray(x) ? x : [x]);
	}]
];

Script._expand = function(variable) { // Expand variables into values
	if (variable) {
		if (isArray(variable)) {
			var i = variable.length;
			while (i--) {
				variable[i] = arguments.callee.call(this, variable[i]);
			}
		} else if (isString(variable) && variable[0] === '#') {
			return this.temp[variable];
		}
	}
	return variable;
};

// Perform any operations of lower precedence than "op"
// Both op_list and value_list are altered
Script._operate = function(op, op_list, value_list) {
	var i, tmp, fn, args;
	while (op_list.length && op_list[0][0] <= op) {
		tmp = op_list.shift();
		fn = this._operators[tmp[0]][2];
		if ((i = fn.length)) { // function takes set args
			args = value_list.splice(-i, i);
			// pad out values to the left, if missing
			while (args.length < i) {
				args.unshift(null);
			}
		} else {
			args = value_list.splice(tmp[1], value_list.length - tmp[1]); // Args from the end
		}
		if (this._operators[tmp[0]][1]) {
			args = this._expand(args);
		}
//		log(LOG_LOG, 'Perform: '+this._operators[tmp[0]][0]+'('+args+')');
		value_list.push(fn.apply(this, args));
	}
	if (this._operators[op]) {
		op_list.unshift([op, value_list.length]);
	}
};

Script._return = undefined;

// Interpret our script, return a single value
Script._interpret = function(_script) {
	var x, y, z, fn, value_list = [], op_list = [], script = _script.slice(0), test;
	while (!this._return && (x = script.shift()) !== null && !isUndefined(x)) {
		if (isArray(x)) {
			value_list = value_list.concat(arguments.callee.call(this, x));
		} else if (isString(x)) {
			if (x === ';') {
				this._operate(Number.MAX_VALUE, op_list, value_list);
				value_list = [];
				op_list = [];
			} else if ((fn = Script._find(x, this._operators)) >= 0) {
				this._operate(fn, op_list, value_list);
			} else if ((fn = Script._find(x, this._functions)) >= 0) {
				if (this._functions[fn][1] === FN_CUSTOM) {
					value_list.push(this._functions[fn][2].call(this, script, value_list, op_list));
				} else {
					x = script.shift(); // Should probably report some sort of error if not an array...
					x = arguments.callee.call(this, x);
					if (this._functions[fn][1] === FN_EXPAND) {
						x = this._expand(x);
					}
					value_list.push(this._functions[fn][2].apply(this, x));
				}
			} else if (/^[A-Z]\w*(?:\.\w+)*$/.test(x)) {
				x = x.split('.');
				value_list.push(Workers[x[0]]._get(x.slice(1), false));
			} else if (/^".*"$/.test(x)) {
				x = x.replace(/^"|"$/g, '');
				z = '';
				while (y = x.match(/^(.*)\\(.)(.*)$/)) {
					z = y[1] + y[2];
					x = y[3];
				}
				z += x;
				value_list.push(z);
			} else if (/^'.*'$/.test(x)) {
				x = x.replace(/^'|'$/g, '');
				z = '';
				while (y = x.match(/^(.*)\\(.)(.*)$/)) {
					z = y[1] + y[2];
					x = y[3];
				}
				z += x;
				value_list.push(z);
			} else if (x[0] === '#') {
				value_list.push(x);
			} else {
				log(LOG_ERROR, 'Bad string format: '+x);
				value_list.push(x); // Should never hit this...
			}
		} else { // number or boolean
			value_list.push(x);
		}
	}
	this._operate(Number.MAX_VALUE, op_list, value_list);
	return this._return || value_list;
};

Script.interpret = function(script) {
	this.temp = {};
	this._return = undefined;
	return this._expand((this._interpret(script)).pop());
};

Script.parse = function(worker, datatype, text, map) {
	var atoms = (text + ';').regex(new RegExp('\\s*(' +
	  '"(?:\\\\.|[^"])*"' +					// string quoted with "
	  "|'(?:\\\\.|[^'])*'" +				// string quoted with '
	  '|\\d*\\.?\\d+(?:[eE][-+]?\\d+)?' +	// number
	  '|\\btrue\\b|\\bfalse\\b' +			// boolean
	  '|[#A-Za-z_]\\w*(?:\\.\\w+)*\\b' +	// variable
	  '|[!=]==' +							// 3-char operator
	  '|[-+*/%<>!=]=' +						// 2-char operator
	  '|\\+\\+(?=\\s*[#A-Za-z_,;}])' +		// increment
	  '|--(?=\\s*[#A-Za-z_,;}])' +			// decrement
	  '|&&' +								// boolean and
	  '|\\|\\|' +							// boolean or
	  '|[-+*/%<>!=]' +						// 1-char operator
	  '|[(){};]' +							// grouping, separator, terminator
	  '|\\s+' +								// spaces
	  '|[^#\\w\\.\\s"]+' +					// other ?
	  ')', 'gm'));
	if (atoms === null || isUndefined(atoms)) {
		return []; // Empty script
	}
	map = map || {};
	return (function() {
		var atom, path, script = [], i;
		while ((atom = atoms.shift()) !== null && !isUndefined(atom)) {
			if (atom === '(' || atom === '{') {
				script.push(arguments.callee());
			} else if (atom === ')') {
				break;
			} else if (atom === '}') {
				if (!script.length || script[script.length-1] !== ';') {
					script.push(';');
				}
				break;
			} else if (atom === 'true') {
				script.push(true);
			} else if (atom === 'false') {
				script.push(false);
			} else if (atom === ';') { // newline (resets values)
				if (script.length && script[script.length-1] !== ';') {
					script.push(atom);
				}
			} else if ((i = Script._find(atom, Script._operators)) !== -1) { // operator
				// unary op
				if (!script.length || Script._find(script[script.length-1], Script._operators) !== -1) {
					if (Script._find('u' + atom, Script._operators) !== -1) {
						//log(LOG_WARN, 'unary/prefix [' + atom + ']');
						atom = 'u' + atom;
					} else {
						log(LOG_WARN, 'unary/prefix [' + atom + '] is not supported');
					}
				} else if (Script._operators[i][2] === false) {
					if (Script._find('p' + atom, Script._operators) !== -1) {
						//log(LOG_WARN, 'postifx [' + atom + ']');
						atom = 'p' + atom;
					} else {
						log(LOG_WARN, 'postifx [' + atom + '] is not supported');
					}
				}
				script.push(atom);
			} else if (atom[0] === '#' // variable
				|| isNumber(atom) // number
				|| /^".*"$/.test(atom) // string
				|| /^'.*'$/.test(atom) // string
				//|| Script._find(atom, Script._operators) !== -1 // operator
				|| Script._find(atom, Script._functions) !== -1) { // function
				script.push(atom);
			} else if (atom !== ',') { // if it's not a comma, then worker.datatype.key or path.to.key
				if (map[atom]) {
					path = map[atom].split('.');
				} else {
					path = atom.split('.');
				}
				if (!Workers[path[0]]) {
					if (isUndefined(worker._datatypes[path[0]])) {
						path.unshift(datatype);
					}
					path.unshift(worker.name);
				}
				script.push(path.join('.'));
			}
		}
//		log(LOG_DEBUG, 'Script section: '+JSON.stringify(script));
		if (script[script.length-1] === ';') {
			script.pop();
		}
		return script;
	}());
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Session **********
* Deals with multiple Tabs/Windows being open at the same time...
*/
var Session = new Worker('Session');
Session.runtime = null; // Don't save anything except global stuff
Session._rootpath = false; // Override save path so we don't get limited to per-user

Session.settings = {
	system:true,
	keep:true,// We automatically load when needed
	taint:true
};

Global.display.push({
//	advanced:true,
	title:'Multiple Tabs / Windows',
	group:[
		{
			id:['Session','option','timeout'],
			label:'Forget After',
			select:{5000:'5 Seconds', 10000:'10 Seconds', 15000:'15 Seconds', 20000:'20 Seconds', 25000:'25 Seconds', 30000:'30 Seconds'},
			help:'When you have multiple tabs open this is the length of time after closing all others that the Enabled/Disabled warning will remain.'
		}
	]
});

Session.option = {
	timeout:15000 // How long to give a tab to update itself before deleting it (ms)
};

Session.data = { // Shared between all windows
	_active:null, // Currently active session
	_sessions:{}, // List of available sessions
	_timestamps:{} // List of all last-saved timestamps from all workers
};

Session.temp = {
	active:false, // Are we the active tab (able to do anything)?
	warning:null, // If clicking the Disabled button when not able to go Enabled
	_id:null
};

Session.setup = function() {
	if (Global.get(['option','session'], false)) {
		this.set(['option','timeout'], Global.get(['option','session','timeout'], this.option.timeout));
		Global.set(['option','session']);
	}
	try {
		if (!(Session.temp._id = sessionStorage.getItem('golem.'+APP))) {
			sessionStorage.setItem('golem.'+APP, Session.temp._id = '#' + Date.now());
		}
	} catch(e) {// sessionStorage not available
		Session.temp._id = '#' + Date.now();
	}
};

/***** Session.init() *****
3. Add ourselves to this.data._sessions with the _active time
4. If no active worker (in the last 2 seconds) then make ourselves active
4a. Set this.temp.active, this.data._active, and immediately call this._save()
4b/5. Add the "Enabled/Disabled" button, hidden if necessary (hiding other elements if we're disabled)
6. Add a click handler for the Enable/Disable button
6a. Button only works when either active, or no active at all.
6b. If active, make inactive, update this.temp.active, this.data._active and hide other elements
6c. If inactive , make active, update this.temp.active, this.data._active and show other elements (if necessary)
7. Add a repeating reminder for every 1 second
*/
Session.init = function() {
	Config._init(); // Make sure Config has loaded first
	var now = Date.now();
	this.set(['data','_sessions',this.temp._id], now);
	$('#golem_info').append('<div id="golem_session" class="golem-info golem-theme-button green" style="display:none;padding:4px;">Enabled</div>');
	if (!this.data._active || typeof this.data._sessions[this.data._active] === 'undefined' || this.data._sessions[this.data._active] < now - this.option.timeout || this.data._active === this.temp._id) {
		this._set(['temp','active'], true);
		this._set(['data','_active'], this.temp._id);
		this._save('data');// Force it to save immediately - reduce the length of time it's waiting
	} else {
		$('#golem_session').html('<b>Disabled</b>').toggleClass('red green').show();
	}
	$('#golem_session').click(function(event){
		Session._unflush();
		if (Session.temp.active) {
			$(this).html('<b>Disabled</b>').toggleClass('red green');
			Session._set(['data','_active'], null);
			Session._set(['temp','active'], false);
		} else if (!Session.data._active || typeof Session.data._sessions[Session.data._active] === 'undefined' || Session.data._sessions[Session.data._active] < Date.now() - option.timeout) {
			$(this).html('Enabled').toggleClass('red green');
			Queue.set(['temp','current']);
			Session._set(['data','_active'], Session.temp._id);
			Session._set(['temp','active'], true);
		} else {// Not able to go active
			Queue.set(['temp','current']);
			$(this).html('<b>Disabled</b><br><span>Another instance running!</span>');
			if (!Session.temp.warning) {
				(function(){
					if ($('#golem_session span').length) {
						if ($('#golem_session span').css('color').indexOf('255') === -1) {
							$('#golem_session span').animate({'color':'red'},200,arguments.callee);
						} else {
							$('#golem_session span').animate({'color':'black'},200,arguments.callee);
						}
					}
				})();
			}
			window.clearTimeout(Session.temp.warning);
			Session.temp.warning = window.setTimeout(function(){if(!Session.temp.active){$('#golem_session').html('<b>Disabled</b>');}Session.temp.warning=null;}, 3000);
		}
		Session._save('data');
	});
	$(window).unload(function(){Session._update('unload', 'run');});
	this._revive(1); // Call us *every* 1 second - not ideal with loads of Session, but good enough for half a dozen or more
	Title.alias('disable', 'Session:temp.active::(Disabled) ');
};

/***** Session.update() *****
1. Update the timestamps in data._timestamps[type][worker]
2. Replace the relevant datatype with the updated (saved) version if it's newer
*/
Session.updateTimestamps = function() {
	var i, j, _old, _new, _ts;
	for (i in Workers) {
		if (i !== this.name) {
			for (j in Workers[i]._datatypes) {
				if (Workers[i]._datatypes[j]) {
					this.data._timestamps[j] = this.data._timestamps[j] || {};
					_ts = this.data._timestamps[j][i] || 0;
					if (Workers[i]._timestamps[j] === undefined) {
						Workers[i]._timestamps[j] = _ts;
					} else if (_ts > Workers[i]._timestamps[j]) {
//						log(LOG_DEBUG, 'Need to replace '+i+'.'+j+' with newer data');
						_old = Workers[i][j];
						Workers[i]._load(j);
						_new = Workers[i][j];
						Workers[i][j] = _old;
						Workers[i]._replace(j, _new);
						Workers[i]._timestamps[j] = _ts;
					}
					this.data._timestamps[j][i] = Workers[i]._timestamps[j];
				}
			}
		}
	}
};

/***** Session.update() *****
1. We don't care about any data, only about the regular reminder we've set, so return if not the reminder
2. Update data._sessions[id] to Date.now() so we're not removed
3. If no other open instances then make ourselves active (if not already) and remove the "Enabled/Disabled" button
4. If there are other open instances then show the "Enabled/Disabled" button
*/
Session.update = function(event, events) {
	var i, l, now = Date.now(), unload;
	if (events.findEvent(this,'reminder') || (unload = events.findEvent(this,'unload'))) {
		this._load('data');
		if (unload) {
			Queue._forget('run'); // Make sure we don't do anything else
			for (i in Workers) { // Make sure anything that needs saving is saved
				for (l in Workers[i]._taint) {
					if (Workers[i]._taint[l]) {
						Workers[i]._save(l);
					}
				}
				for (l in Workers[i]._reminders) {
					if (/^i/.test(l)) {
						window.clearInterval(Workers[i]._reminders[l]);
					} else if (/^t/.test(l)) {
						window.clearTimeout(Workers[i]._reminders[l]);
					}
				}
			}
			this.data._sessions[this.temp._id] = 0;
			if (this.data._active === this.temp._id) {
				this.data._active = null;
			}
			this.temp.active = false;
		} else {
			this.data._sessions[this.temp._id] = now;
		}
		now -= this.option.timeout;
		for(i in this.data._sessions) {
			if (this.data._sessions[i] < now) {
				this.data._sessions[i] = undefined;
			}
		}
		l = length(this.data._sessions);
		if (l === 1) {
			if (!this.temp.active) {
				this.updateTimestamps();
				$('#golem_session').stop().css('color','black').html('Enabled').addClass('green').removeClass('red');
				this.data._active = this.temp._id;
				this.set(['temp','active'], true);
			}
			$('#golem_session').hide();
		} else if (l > 1) {
			this.updateTimestamps();
			$('#golem_session').show();
		}
		this._taint.data = true;
		this._save('data');
	}
	return true;
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Settings:true,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH, APPNAME,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime, makeImage,
	GM_listValues, GM_deleteValue, localStorage
*/
/********** Worker.Settings **********
* Save and Load settings by name - never does anything to CA beyond Page.reload()
*/
var Settings = new Worker('Settings');
Settings._rootpath = false; // Override save path so we don't get limited to per-user
Settings.option = Settings.runtime = null;

Settings.settings = {
	system:true,
	unsortable:true,
	advanced:true,
	no_disable:true,
	taint:true
};

Settings.temp = {
	worker:null,
	edit:null,
	paths:['-']
};

Settings.init = function() {
	var i, j;
	for (i in Workers) {
		for (j in Workers[i]._datatypes) {
			this.temp.paths.push(i + '.' + j);
		}
	}
	this.temp.paths.sort();
	if (this.data['- default -']) {
		this.data = this.data['- default -'];
	}
};

Settings.menu = function(worker, key) {
	var i, keys = [];
	if (worker) {
		if (!key) {
			if (Config.option.advanced) {
				for (i in worker._datatypes) {
					keys.push(i+':' + (worker.name === this.temp.worker && i === this.temp.edit ? '=' : '') + 'Edit&nbsp;"' + worker.name + '.' + i + '"');
				}
				keys.push('---');
			}
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			return keys;
		} else if (key) {
			if (key === 'backup') {
				if (confirm("BACKUP WARNING!!!\n\nAbout to replace '+worker.name+' backup options.\n\nAre you sure?")) {
					this.set(['data', worker.name], $.extend(true, {}, worker.option));
				}
			} else if (key === 'restore') {
				if (confirm("RESTORE WARNING!!!\n\nAbout to restore '+worker.name+' options.\n\nAre you sure?")) {
					worker._replace('option', $.extend(true, {}, this.data[worker.name]));
				}
			} else if (this.temp.worker === worker.name && this.temp.edit === key) {
				this.temp.worker = this.temp.edit = null;
				this._notify('data');// Force dashboard update
			} else {
				this.temp.worker = worker.name;
				this.temp.edit = key;
				this._notify('data');// Force dashboard update
				Dashboard.set(['option','active'], this.name);
			}
		}
	} else {
		if (!key) {
			keys.push('backup:Backup&nbsp;Options');
			keys.push('restore:Restore&nbsp;Options');
			if (Config.option.advanced) {
				keys.push('---');
				keys.push('reset:!Reset&nbsp;Golem');
			}
			return keys;
		} else {
			if (key === 'backup') {
				if (confirm("BACKUP WARNING!!!\n\nAbout to replace backup options for all workers.\n\nAre you sure?")) {
					for (i in Workers) {
						this.set(['data',i], $.extend(true, {}, Workers[i].option));
					}
				}
			} else if (key === 'restore') {
				if (confirm("RESTORE WARNING!!!\n\nAbout to restore options for all workers.\n\nAre you sure?")) {
					for (i in Workers) {
						if (i in this.data) {
							Workers[i]._replace('option', $.extend(true, {}, this.data[i]));
						}
					}
				}
			} else if (key === 'reset') {
				if (confirm("IMPORTANT WARNING!!!\n\nAbout to delete all data for Golem on "+APPNAME+".\n\nAre you sure?")) {
					if (confirm("VERY IMPORTANT WARNING!!!\n\nThis will clear everything, reload the page, and make Golem act like it is the first time it has ever been used on "+APPNAME+".\n\nAre you REALLY sure??")) {
						// Well, they've had two chances...
						if (browser === 'greasemonkey') {
							keys = GM_listValues();
							while ((i = keys.pop())) {
								GM_deleteValue(i);
							}
						} else {
							for (i in localStorage) {
								if (i.indexOf('golem.' + APP + '.') === 0) {
									localStorage.removeItem(i);
								}
							}
						}
						window.location.replace(window.location.href);
					}
				}
			}
		}
	}
};

Settings.dashboard = function() {
	var i, j, o, x, y, z, total, rawtot, path = this.temp.worker+'.'+this.temp.edit, html = '', storage = [];
	html = '<select id="golem_settings_path">';
	for (i=0; i<this.temp.paths.length; i++) {
		html += '<option value="' + this.temp.paths[i] + '"' + (this.temp.paths[i] === path ? ' selected' : '') + '>' + this.temp.paths[i] + '</option>';
	}
	html += '</select>';
	html += '<input id="golem_settings_refresh" type="button" value="Refresh">';
	if (this.temp.worker && this.temp.edit) {
		if (this.temp.edit === 'data') {
			Workers[this.temp.worker]._unflush();
		}
	}
	if (!this.temp.worker) {
		total = rawtot = 0;
		o = [];
		for (i in Workers) {
		    o.push(i);
		}
		o.sort();
		for (i = 0; i < o.length; i++) {
			for (j in Workers[o[i]]._storage) {
				if (Workers[o[i]]._storage[j]) {
					x = Workers[o[i]]._storage[j] || 0;
					y = Workers[o[i]]._rawsize[j] || x;
					z = Workers[o[i]]._numvars[j] || 0;
					total += x;
					rawtot += y;
					storage.push('<tr>');
					storage.push('<th>' + o[i] + '.' + j + '</th>');
					storage.push('<td style="text-align:right;">' + x.addCommas() + ' bytes</td>');
					storage.push('<td style="text-align:right;">' + y.addCommas() + ' bytes</td>');
					storage.push('<td style="text-align:right;">' + (x !== y ? (x * 100 / y).SI() + '%' : '&nbsp;') + '</td>');
					storage.push('<td style="text-align:right;">' + (z ? z + ' key' + plural(z) : '&nbsp;') + '</td>');
					storage.push('</tr>');
				}
			}
		}
		html += ' No worker specified (total ' + total.addCommas();
		if (total !== rawtot) {
			html += '/' + rawtot.addCommas();
		}
		html += ' bytes';
		if (total !== rawtot) {
			html += ', ' + (total * 100 / rawtot).SI() + '%';
		}
		html += ')<br><table>' + storage.join('') + '</table>';
	} else if (!this.temp.edit) {
		html += ' No ' + this.temp.worker + ' element specified.';
	} else if (typeof Workers[this.temp.worker][this.temp.edit] === 'undefined') {
		html += ' The element is undefined.';
	} else if (Workers[this.temp.worker][this.temp.edit] === null) {
		html += ' The element is null.';
	} else if (typeof Workers[this.temp.worker][this.temp.edit] !== 'object') {
		html += ' The element is scalar.';
	} else {
		i = length(Workers[this.temp.worker][this.temp.edit]);
		html += ' The element contains ' + i + ' element' + plural(i);
		if (Workers[this.temp.worker]._storage[this.temp.edit]) {
			html += ' (' + (Workers[this.temp.worker]._storage[this.temp.edit]).addCommas() + ' bytes)';
		}
		html += '.';
	}
	if (this.temp.worker && this.temp.edit) {
		if (Config.option.advanced) {
			html += '<input style="float:right;" id="golem_settings_save" type="button" value="Save">';
		}
		html += '<div style="position:relative;"><textarea id="golem_settings_edit" style="position:absolute;top:0;left:0;right:0;">' + JSON.stringify(Workers[this.temp.worker][this.temp.edit], null, '   ') + '</textarea></div>';
	}
	$('#golem-dashboard-Settings').html(html);
	$('#golem_settings_refresh').click(function(){Settings.dashboard();});
	$('#golem_settings_save').click(function(){
		var data;
		try {
			data = JSON.parse($('#golem_settings_edit').val());
		} catch(e) {
			alert("ERROR!!!\n\nBadly formed JSON data.\n\nPlease check the data and try again!");
			return;
		}
		if (confirm("WARNING!!!\n\nReplacing internal data can be dangrous, only do this if you know exactly what you are doing.\n\nAre you sure you wish to replace "+Settings.temp.worker+'.'+Settings.temp.edit+"?")) {
			// Need to copy data over and then trigger any notifications
			Workers[Settings.temp.worker]._replace(Settings.temp.edit, data);
		}
	});
	$('#golem_settings_path').change(function(){
		var path = $(this).val().regex(/([^.]*)\.?(.*)/);
		if (path[0] in Workers) {
			Settings.temp.worker = path[0];
			Settings.temp.edit = path[1];
		} else {
			Settings.temp.worker = Settings.temp.edit = null;
		}
		Settings.dashboard();
	});
	$('#golem_settings_edit').autoSize();
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Title **********
* Changes the window title to user defined data.
* String may contain {stamina} or {Player:stamina} using the worker name (default Player)
*/
var Title = new Worker('Title');
Title.data = null;

Title.settings = {
	system:true,
	taint:true
};

Title.option = {
	enabled:false,
	title:"CA: {pause}{disable}{worker} | {energy}e | {stamina}s | {exp_needed}xp by {LevelUp:time}"
};

Title.temp = {
	old:null, // Old title, in case we ever have to change back
	alias:{} // name:'worker:path.to.data[:txt if true[:txt if false]]' - fill via Title.alias()
};

Global.display.push({
	title:'Window Title',
	group:[
		{
			id:['Title','option','enabled'],
			label:'Change Window Title',
			checkbox:true
		},{
			id:['Title','option','title'],
			text:true,
			size:30
		},{
			info:'{myname}<br>{energy} / {maxenergy}<br>{health} / {maxhealth}<br>{stamina} / {maxstamina}<br>{level}<br>{pause} - "(Paused) " when paused<br>{LevelUp:time} - Next level time<br>{worker} - Current worker<br>{bsi} / {lsi} / {csi}'
		}
	]
});

/***** Title.update() *****
* 1. Split option.title into sections containing at most one bit of text and one {value}
* 2. Output the plain text first
* 3. Split the {value} in case it's really {worker:value}
* 4. Output worker.get(value)
* 5. Watch worker for changes
*/
Title.update = function(event) {
	if (this.option.enabled && this.option.title) {
		var i, tmp, what, worker, value, output = '', parts = this.option.title.match(/([^}]+\}?)/g);// split into "text {option}"
		if (parts) {
			for (i=0; i<parts.length; i++) {
				tmp = parts[i].regex(/([^{]*)\{?([^}]*)\}?/);// now split to "text" "option"
				output += tmp[0];
				if (tmp[1]) {// We have an {option}
					what = (this.temp.alias[tmp[1]] || tmp[1]).split(':');// if option is "worker:value" then deal with it here
					worker = Worker.find(what.shift());
					if (worker) {
						this._watch(worker, what[0]); // Doesn't matter how often we add, it's only there once...
						value = worker.get(what[0], '');
						if (what[1] && value === true) {
							value = what[1];
						} else if (what[2] && !value) {
							value = what[2];
						}
						output += isNumber(value) ? value.addCommas() : isString(value) ? value : '';
					} else {
						log(LOG_WARN, 'Bad worker specified = "' + tmp[1] + '"');
					}
				}
			}
		}
		if (!this.temp.old) {
			this.set(['temp','old'], document.title);
		}
		if (!document.title || output !== document.title) {
			document.title = output;
		}
	} else if (this.temp.old) {
		document.title = this.temp.old;
		this.set(['temp','old'], null);
	}
};

/***** Title.alias() *****
* Pass a name and a string in the format "Worker:path.to.data[:txt if true[:txt if false]]"
*/
Title.alias = function(name,str) {
	this.set(['temp','alias',name], str);
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$:true, Worker, Army, Theme:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP:true, APPID:true, APPNAME:true, userID:true, imagepath:true, isRelease, version, revision, Workers, PREFIX:true, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, unsafeWindow, log, warn, error, chrome, GM_addStyle, GM_getResourceText
*/
/********** Worker.Theme **********
* Stores Theme-specific settings as well as allowing to change the theme.
*/
var Theme = new Worker('Theme');
Theme.runtime = Theme.temp = null;

Theme.settings = {
	system:true,
	taint:true
};

Theme.option = {
	theme: 'default',
	themes: { // Put in here so we can update it manually
		'default':{
			'Menu_icon':'gear',
			'Queue_disabled':'ui-state-disabled red',
			'Queue_active':'ui-priority-primary green'
		},
		'test':{}
	}
};

Theme.data = {}; // This is a copy of the current theme from Theme.option, doesn't exist until after .setup

Global.display.push({
	title:'Theming',
	group:[
		function() {
			var i, list = [], options = [];
			for (i in Theme.option.themes) {
				list.push(i);
			}
			for (i in Theme.option.themes['default']) {
				options.push({
					debug:true,
					id:['Theme','option','themes',Theme.option.theme,i],
					label:i,
					text:true
				});
			}
			options.unshift({
				id:['Theme','option','theme'],
				label:'Current Theme',
				select:list
			});
			return options;
		}
	]
});

Theme.setup = function() {
	this._replace('data', this.option.themes[this.option.theme]); // Needs to be here for anything wanting the theme in init()
};

Theme.update = function(event, events) {
	if (events.findEvent(null,'option') || events.findEvent(null,'init')) {
		var i, list = [];
		for (i in this.option.themes) {
			if (i !== this.option.theme) {
				list.push(i);
			}
		}
		this._replace('data', this.option.themes[this.option.theme]);
		$('#golem').removeClass(list.join(' ')).addClass('golem-theme golem-theme-' + this.option.theme);
		Config.makePanel(this);
	}
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease:true, version, revision, Workers, PREFIX, window, browser, GM_xmlhttpRequest,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = Update.option = null;

Update.settings = {
	system:true
};

Update.runtime = {
	installed:0,// Date this version was first seen
	current:'',// What is our current version
	lastcheck:0,// Date.now() = time since last check
	version:0,// Last ones we saw in a check
	revision:0,
	force:false// Have we clicked a button, or is it an automatic check
};

Update.temp = {
	version:0,
	revision:0,
	check:'',// Url to check for new versions
	url_1:'',// Url to download release
	url_2:''// Url to download revision
};

/***** Update.init() *****
1a. Add a "Update Now" button to the button bar at the top of Config
1b. If running a beta version then add a "beta" button - which makes us pretend to be a beta version before running the update check.
2. On clicking the button set Update.runtime.force to true - so we can work() immediately...
*/
Update.init = function() {
	this.set(['temp','version'], version);
	this.set(['temp','revision'], revision);
	this.set(['runtime','version'], this.runtime.version || version);
	this.set(['runtime','revision'], this.runtime.revision || revision);
	switch(browser) {
		case 'chrome':
			Update.temp.check = 'http://game-golem.googlecode.com/svn/trunk/chrome/_version.js';
			Update.temp.url_1 = 'http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.crx';
			Update.temp.url_2 = 'http://game-golem.googlecode.com/svn/trunk/chrome/GameGolem.crx';
			break;
		default:
			Update.temp.check = 'http://game-golem.googlecode.com/svn/trunk/_version.js';
			Update.temp.url_1 = 'http://game-golem.googlecode.com/svn/trunk/_release.user.js';
			Update.temp.url_2 = 'http://game-golem.googlecode.com/svn/trunk/_normal.user.js';
			break;
	}
	// Add an update button for everyone
	Config.addButton({
		id:'golem_icon_update',
		image:'update',
		title:'Check for Update',
		click:function(){
			$(this).addClass('red');
			Update.checkVersion(true);
		}
	});
	if (isRelease) { // Add an advanced "beta" button for official release versions
		Config.addButton({
			id:'golem_icon_beta',
			image:'beta',
			title:'Check for Beta Versions',
			advanced:true,
			click:function(){
				isRelease = false;// Isn't persistant, so nothing visible to the user except the beta release
				$(this).addClass('red');
				Update.checkVersion(true);
			}
		});
	}
	// Add a changelog advanced button
	Config.addButton({
		image:'log',
		advanced:true,
		className:'blue',
		title:'Changelog',
		click:function(){
			window.open('http://code.google.com/p/game-golem/source/list', '_blank'); 
		}
	});
	// Add a wiki button
	Config.addButton({
		image:'wiki',
		className:'blue',
		title:'GameGolem wiki',
		click:function(){
			window.open('http://code.google.com/p/game-golem/wiki/castle_age', '_blank'); 
		}
	});
	$('head').bind('DOMNodeInserted', function(event){
		if (event.target.nodeName === 'META' && $(event.target).attr('name') === 'golem-version') {
			tmp = $(event.target).attr('content').regex(/(\d+\.\d+)\.(\d+)/);
			if (tmp) {
				Update._remind(21600, 'check');// 6 hours
				Update.set(['runtime','lastcheck'], Date.now());
				Update.set(['runtime','version'], tmp[0]);
				Update.set(['runtime','revision'], tmp[1]);
				if (Update.get(['runtime','force']) && Update.get(['temp','version'], version) >= tmp[0] && (isRelease || Update.get(['temp','revision'], revision) >= tmp[1])) {
					$('<div class="golem-button golem-info red" style="passing:4px;">No Update Found</div>').animate({'z-index':0}, {duration:5000,complete:function(){$(this).remove();} }).appendTo('#golem_info');
				}
				Update.set(['runtime','force'], false);
				$('#golem_icon_update,#golem_icon_beta').removeClass('red');
			}
			event.stopImmediatePropagation();
			$('script.golem-script-version').remove();
			$(event.target).remove();
			return false;
		}
	});
	if (this.runtime.current !== (version + '.' + revision)) {
		this.set(['runtime','installed'], Date.now());
		this.set(['runtime','current'], version + '.' + revision);
	}
};

Update.checkVersion = function(force) {
	Update.set('runtime.lastcheck', Date.now() - 21600000 + 60000);// Don't check again for 1 minute - will get reset if we get a reply
	Update.set('runtime.force', force);
	window.setTimeout(function(){
		var s = document.createElement('script');
		s.setAttribute('type', 'text/javascript');
		s.className = 'golem-script-version';
		s.src = Update.temp.check + '?random=' + Date.now();
		document.getElementsByTagName('head')[0].appendChild(s);
	}, 100);
};

/***** Update.update() *****
1a. If it's more than 6 hours since our last check, then ask for the latest version file from the server
1b. In case of bad connection, say it's 6 hours - 1 minutes since we last checked
2. Check if there's a version response on the page
3a. If there's a response then parse it and clear it - remember the new numbers
3b. Display a notification if there's a new version
4. Set a reminder if there isn't
*/
Update.update = function(event) {
	if (event.type === 'reminder') {
		this.checkVersion(false);
	}
	if (event.type === 'init' || event.type === 'reminder') {
		var now = Date.now(), age = (now - this.runtime.installed) / 1000, time = (now - this.runtime.lastcheck) / 1000;
		if (age <= 21600) {time += 3600;}		// Every hour for 6 hours
		else if (age <= 64800) {time += 7200;}	// Every 2 hours for another 12 hours (18 total)
		else if (age <= 129600) {time += 10800;}// Every 3 hours for another 18 hours (36 total)
		else if (age <= 216000) {time += 14400;}// Every 4 hours for another 24 hours (60 total)
		else {time += 21600;}					// Every 6 hours normally
		this._remind(Math.max(0, time), 'check');
	}
	if (this.runtime.version > this.temp.version || (!isRelease && this.runtime.revision > this.temp.revision)) {
		log(LOG_INFO, 'New version available: ' + this.runtime.version + '.' + this.runtime.revision + ', currently on ' + this.runtime.current);
		if (this.runtime.version > this.temp.version) {
			$('#golem_info').append('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '" style="passing:4px;"><a href="' + this.temp.url_1 + '">New Version Available</a></div>');
		}
		if (!isRelease && this.runtime.revision > this.temp.revision) {
			$('#golem_info').append('<div class="golem-button golem-info green" title="' + this.runtime.version + '.' + this.runtime.revision + ' released, currently on ' + version + '.' + revision + '" style="passing:4px;"><a href="' + this.temp.url_2 + '">New Beta Available</a></div>');
		}
		this.set(['temp','version'], this.runtime.version);
		this.set(['temp','revision'], this.runtime.revision);
	}
};

// Add "Castle Age" to known applications
Main.add('castle_age', '46755028429', 'Castle Age', /^http:\/\/web3.castleagegame.com\/castle_ws\/index.php/i, function() {
	if (!isFacebook) {
		userID = $('#main_bntp img').attr('src').regex(/graph.facebook.com\/(\d+)\/picture/i);
		imagepath = 'http://image4.castleagegame.com/graphics/';
		var fn = function(){
			var left = Math.max(0, Math.floor(($('body').width() - 1030) / 2));
			$('#rightCol').css({'padding-left':(left + 781) + 'px'});
			$('center').css({'text-align':'left', 'padding-left':left+'px'});
		};
		$('body').prepend('<div id="rightCol" style="position:absolute;left:0;top:2px;width:244px;height:0;"></div>');
		fn();
		Main._resize(fn);
	}
});
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy');
Alchemy.temp = null;

Alchemy.settings = {
	taint:true
};

Alchemy.defaults['castle_age'] = {
	pages:'keep_alchemy keep_stats'
};

Alchemy.data = {
	ingredients:{},
	summons:{},
	recipe:{}
};

Alchemy.option = {
	perform:false,
	hearts:false,
	summon:false
};

Alchemy.runtime = {
	best:null,
	wait:0
};

Alchemy.display = [
	{
		id:'hearts',
		label:'Use Battle Hearts',
		checkbox:true
	},{
		id:'summon',
		label:'Use Summon Ingredients',
		checkbox:true
	}
];

Alchemy.parse = function(change) {
	var now = Date.now(), self = this, i, tmp,
		ipurge = {}, rpurge = {}, spurge = {};

	if (Page.page === 'keep_alchemy') {
		tmp = $('div.ingredientUnit');

		if (!tmp.length) {
			log(LOG_WARN, "Can't find any alchemy ingredients...");
			//Page.to('keep_alchemy', false); // Force reload
			//return false;
		} else {
			for (i in this.data.ingredients) {
				if (this.data.ingredients[i] !== 0) {
					ipurge[i] = true;
				}
			}
		}

		// ingredients list
		tmp.each(function(a, el) {
			var icon = ($('img', el).attr('src') || '').filepart();
			var c = ($(el).text() || '').regex(/\bx\s*(\d+)\b/im);
			ipurge[icon] = false;
			if (isNumber(c)) {
				self.set(['ingredients', icon], c);
			} else {
				log(LOG_WARN, 'Bad count ' + c + ' on ' + icon);
			}
		});

		tmp = $('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster');

		if (!tmp.length) {
			log(LOG_WARN, "Can't find any alchemy recipes...");
			//Page.to('keep_alchemy', false); // Force reload
			//return false;
		} else {
			for (i in this.data.recipe) {
				rpurge[i] = true;
			}
			for (i in this.data.summons) {
				spurge[i] = true;
			}
		}

		// recipe list
		tmp.each(function(a, el) {
			var name = ($('div.recipeTitle', el).text() || '').replace('RECIPES:','').replace(/\s+/gm, ' ').trim(),
				recipe = {}, i;
			if ((i = name.search(/\s*\(/m)) >= 0) {
				name = name.substr(0, i);
			}
			if ($(el).hasClass('alchemyQuestBack')) {
				recipe.type = 'Quest';
			} else if ($(el).hasClass('alchemyRecipeBack')) {
				recipe.type = 'Recipe';
			} else if ($(el).hasClass('alchemyRecipeBackMonster')) {
				recipe.type = 'Summons';
			}
			recipe.ingredients = {};
			$('div.recipeImgContainer', el).parent().each(function(b, el2) {
				var icon = ($('img', el2).attr('src') || '').filepart();
				var c = ($(el2).text() || '').regex(/\bx\s*(\d+)\b/im) || 1;
				recipe.ingredients[icon] = c;
				// Make sure we know an ingredient exists
				if (!(icon in self.data.ingredients)) {
					self.set(['ingredients', icon], 0);
					ipurge[icon] = false;
				}
				if (recipe.type === 'Summons') {
					spurge[icon] = false;
					self.set(['summons', icon], true);
				}
			});
			rpurge[name] = false;
			self.set(['recipe', name], recipe);
		});
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			// some ingredients are units
			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*UNITS\\s*$")').parent());
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
				var c = ($(el).text() || '').regex(/\bX\s*(\d+)\b/im);
				n = Town.qualify(n, i);
				if (i in this.data.ingredients) {
					if (isNumber(c)) {
						this.set(['ingredients', i], c);
					}
				}
			}

			// some ingredients are items
			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*ITEMS\\s*$)').parent());
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var n = ($(b).attr('title') || $(b).attr('alt') || '').trim();
				var c = ($(el).text() || '').regex(/\bX\s*(\d+)\b/im);
				n = Town.qualify(n, i);
				if (i in this.data.ingredients) {
					if (isNumber(c)) {
						this.set(['ingredients', i], c);
					}
				}
			}

			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*ALCHEMY INGREDIENTS\\s*$)').parent());
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				var b = $('a img[src]', el);
				var i = ($(b).attr('src') || '').filepart();
				var c = $(el).text().regex(/\bX\s*(\d+)\b/i);
				if (i) {
					this.set(['ingredients', i], c || 1);
				} else {
					Page.setStale('keep_alchemy', now);
				}
			}
		}
	}

	// purge (zero) any ingredients we didn't encounter.
	// Note: we need to leave placeholders for all known ingredients so keep
	// parsing knows which unit/item overlaps to watch.
	for (i in ipurge) {
		if (ipurge[i] && this.data.ingredients[i] !== 0) {
			log(LOG_WARN, 'Zero ingredient ' + i + ' [' + (this.data.ingredients[i] || 0) + ']');
			this.set(['data', 'ingredients', i], 0);
		}
	}

	// purge any recipes we didn't encounter.
	for (i in rpurge) {
		if (rpurge[i]) {
			log(LOG_DEBUG, 'Delete recipe ' + i);
			this.set(['recipe', i]);
		}
	}

	// purge any summons we didn't encounter.
	for (i in spurge) {
		if (spurge[i]) {
			log(LOG_DEBUG, 'Delete summon ' + i);
			this.set(['summons', i]);
		}
	}

	return false;
};

Alchemy.update = function(event) {
	var now = Date.now(), best = null, recipe = this.data.recipe, r, i, s;

	if (recipe) {
		for (r in recipe) {
			if (recipe[r].type === 'Recipe') {
				best = r;
				for (i in recipe[r].ingredients) {
					if ((!this.option.hearts && i === 'raid_hearts.gif') || (!this.option.summon && this.data.summons[i]) || recipe[r].ingredients[i] > this.data.ingredients[i]) {
						best = null;
						break;
					}
				}
				if (best) {break;}
			}
		}
	}

	s = undefined;
	if (!best) {
		s = 'Nothing to do.';
	} else {
		s = (this.option._disabled ? 'Would perform ' : 'Perform ') + best;
	}
	Dashboard.status(this, s);

	this.set('runtime.best', best);

	this.set('option._sleep', (this.runtime.wait || 0) > now || !best || Page.isStale('keep_alchemy'));
};

Alchemy.work = function(state) {
	var now = Date.now();

	if (!this.runtime.best && !Page.isStale('keep_alchemy')) {
		return QUEUE_FINISH;
	} else if (!state || !Page.to('keep_alchemy')) {
		return QUEUE_CONTINUE;
	} else {
		log(LOG_INFO, 'Perform - ' + this.runtime.best);
		if (!Page.click($('input[type="image"]', $('div.recipeTitle:contains("' + this.runtime.best + '")').next()))) {
			log(LOG_WARN, "Can't find the recipe - waiting a minute");
			this.set('runtime.wait', now + 60000);
			this._remind(60, 'wait');
		}
	}

	return QUEUE_RELEASE;
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker Army Extension **********
* This fills in your army information by overloading Worker.Army()
* We are only allowed to replace Army.work() and Army.parse() - all other Army functions should only be overloaded if really needed
* This is the CA version
*/
Army.defaults.castle_age = {
	temp:null,

	pages:'keep_stats army_viewarmy',

	// Careful not to hit any *real* army options
	option:{
		invite:false,
		recheck:0,
		auto:true,
		general:true
	},

	runtime:{
		count:-1, // How many people have we actively seen
		page:0, // Next page we want to look at 
		extra:1, // How many non-real army members are there (you are one of them)
		oldest:0, // Timestamp of when we last saw the oldest member
		check:false
	},
	
	display:[
		//Disabled until Army works correctly
		//{
		//	id:'invite',
		//	label:'Auto-Join New Armies',
		//	checkbox:true
		//},
		{
			id:'general',
			label:'Use Idle General',
			checkbox:true
		},{
			title:'Members',
			group:[
				{
					id:'auto',
					label:'Automatically Check',
					checkbox:true
				},{
					id:'recheck',
					label:'Manually Check',
					select:{
						0:'Never',
						86400000:'Daily',
						259200000:'3 Days',
						604800000:'Weekly',
						1209600000:'2 Weekly',
						2419200000:'4 Weekly'
					}
				}
			]
		}
	]
};

Army._overload('castle_age', 'init', function() {
	this.runtime.extra = Math.max(1, this.runtime.extra);
	this._watch(Player, 'data.armymax');
//	if (this.runtime.oldest && this.option.recheck) {
//		this._remind(Math.min(1, Date.now() - this.runtime.oldest + this.option.recheck) / 1000, 'recheck');
//	}
	this._parent();
});

Army._overload('castle_age', 'menu', function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['fill:Check&nbsp;Army&nbsp;Now'];
		} else if (key === 'fill') {
			this.set(['runtime','page'], 1);
			this.set(['runtime','check'], true);
		}
	}
});

Army._overload('castle_age', 'parse', function(change) {
	if (change && Page.page === 'keep_stats' && !$('.keep_attribute_section').length) { // Not our own keep
		var uid = $('.linkwhite a').attr('href').regex(/=(\d+)$/);
//		log('Not our keep, uid: '+uid);
		if (uid && Army.get(['Army', uid], false)) {
			$('.linkwhite').append(' ' + Page.makeLink('army_viewarmy', {action:'delete', player_id:uid}, 'Remove Member [x]'));
		}
	} else if (!change && Page.page === 'army_viewarmy') {
		var i, uid, who, page, start, now = Date.now(), count = 0, tmp, level, parent, spans;
		$tmp = $('table.layout table[width=740] div').first().children();
		page = $tmp.eq(1).html().regex(/\<div[^>]*\>(\d+)\<\/div\>/);
		start = $tmp.eq(2).text().regex(/Displaying: (\d+) - \d+/);
		tmp = $('td > a[href*="keep.php?casuser="]');
		for (i=0; i<tmp.length; i++) {
			try {
				this._transaction(); // BEGIN TRANSACTION
				uid = $(tmp[i]).attr('href').regex(/casuser=(\d*)$/i);
				parent = $(tmp[i]).closest('td').next()
				who = $(parent).find('a').eq(-1).text();
				spans = $(parent).find('span[style]');
				level = $(spans).eq(1).text().regex(/(\d+) Commander/i);
				assert(isNumber(uid) && uid !== userID, 'Bad uid: '+uid);
				this.set(['Army',uid,'member'], true);
				assert(this.set(['Army',uid,'name'], $(spans).eq(0).text().replace(/^ *"|"$/g,''), 'string') !== false, 'Bad name: '+uid);
				if (isFacebook) {
					assert(this.set(['Army',uid,'fbname'], who, 'string') !== false, 'Bad fbname: '+uid);
				} else { // Gave up trying to fight this thing - thanks non-standard fb:name node type that breaks jQuery...
					assert(this.set(['Army',uid,'fbname'], $(parent).find('a.fb_link').text() || 'Facebook User', 'string') !== false, 'Bad fbname: '+uid);
				}
				this.set(['Army',uid,'friend'], who !== 'Facebook User');
				if (!this.get(['Army',uid,'changed']) || this.get(['Army',uid,'level']) !== level) {
					this.set(['Army',uid,'changed'], now);
					this.set(['Army',uid,'level'], level);
				}
				this.set(['Army',uid,'seen'], now);
				this.set(['Army',uid,'page'], page);
				this.set(['Army',uid,'id'], start + i);
				this._transaction(true); // COMMIT TRANSACTION
//				log('Adding: ' + JSON.stringify(this.get(['Army',uid])));
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
		if (!i) {
			this._set(['runtime','page'], 0);// No real members on this page so stop looking.
			this._set(['runtime','check'], false);
		}
		tmp = $('img[src*="bonus_member.jpg"]').closest('tr');
		if (tmp.length) {
			this.set(['runtime','extra'], 1 + tmp.text().trim(true).regex(/Extra member x(\d+)/i));
//			log(LOG_DEBUG, 'Extra Army Members Found: '+Army.runtime.extra);
		}
		for (i in this.data.Army) {
			if (this.data.Army[i].member) {
				if (this.get(['Army',i,'page']) === page && this.get(['Army',i,'seen']) !== now) {
					this.set(['Army',i,'member']); // Forget this one, not found on the correct page
				} else {
					count++;// Lets count this one instead
				}
			}
		}
		this._set(['runtime','count'], count);
		if (this.runtime.page) {
			if (page !== this.runtime.page || (!this.runtime.check && Player.get('armymax',0) === (this.runtime.count + this.runtime.extra))) {
				this._set(['runtime','page'], 0);
				this._set(['runtime','check'], false);
			} else {
				this._set(['runtime','page'], page + 1);
			}
		}
//		log(LOG_DEBUG, 'parse: Army.runtime = '+JSON.stringify(this.runtime));
	}
	return this._parent() || true;
});

Army._overload('castle_age', 'update', function(event) {
	this._parent();
	if (event.type !== 'data' && (!this.runtime.page || (this.option.recheck && !this.runtime.oldest))) {
		var i, page = this.runtime.page, army = this.get('Army'), s, now = Date.now(), then = now - this.option.recheck, oldest = this.runtime.oldest;
		if (!page && this.option.auto && Player.get('armymax',0) !== (this.runtime.count + this.runtime.extra)) {
			log(LOG_WARN, 'Army size ('+Player.get('armymax',0)+') does not match cache ('+(this.runtime.count + this.runtime.extra)+'), checking from page 1');
			page = 1;
		}
		if (!page && this.option.recheck) {
			for (i in army) {
				s = this.get(['Army',i,'seen']);
				oldest = Math.min(oldest || Number.MAX_VALUE, s);
				if (!page && s < then) {
					page = Math.min(page || Number.MAX_VALUE, this.get(['Army',i,'page']));
					then = s;
				}
			}
			this._set(['runtime','oldest'], oldest);
		}
		this._set(['runtime','page'], page);
//		log(LOG_WARN, 'update('+JSON.shallow(event,1)+'): Army.runtime = '+JSON.stringify(this.runtime));
	}
	this._set(['option','_sleep'], !this.runtime.page);
});

Army._overload('castle_age', 'work', function(state) {
	if (this.runtime.page) {
		if (state && (!this.option.general || Generals.to(Idle.get('option.general','any')))) {
			Page.to('army_viewarmy', {page:this.runtime.page});
		}
		return true;
	}
	return this._parent();
});

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
Bank.data = null;

Bank.settings = {
	taint:true
};

Bank.defaults['castle_age'] = {};

Bank.option = {
	general:true,
	auto:true,
	above:10000,
	hand:0,
	keep:10000
};

Bank.temp = {
	force:false
};

Bank.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'auto',
		label:'Bank Automatically',
		checkbox:true
	},{
		id:'above',
		label:'Bank Above',
		text:true
	},{
		id:'hand',
		label:'Keep in Cash',
		text:true
	},{
		id:'keep',
		label:'Keep in Bank',
		text:true
	}
];

Bank.setup = function() {
	// BEGIN: Use global "Show Status" instead of custom option
	if ('status' in this.option) {
		this.set(['option','_hide_status'], !this.option.status);
		this.set(['option','status']);
	}
	// END
};

Bank.init = function() {
	this._watch('Player', 'data.cash');// We want other things too, but they all change in relation to this
};

Bank.work = function(state) {
	if (state) {
		this.stash();
	}
	return QUEUE_CONTINUE;
};

Bank.update = function(event) {
	Dashboard.status(this, makeImage('gold') + '$' + Player.get('worth', 0).addCommas() + ' (Upkeep ' + ((Player.get('upkeep', 0) / Player.get('maxincome', 1)) * 100).round(2) + '%)<br>');
	this.set('option._sleep', !(this.temp.force || (this.option.auto && Player.get('cash', 0) >= Math.max(10, this.option.above, this.option.hand))));
};

// Return true when finished
Bank.stash = function(amount) {
	var cash = Player.get('cash', 0);
	amount = (isNumber(amount) ? Math.min(cash, amount) : cash) - this.option.hand;
	if (!amount || amount <= 10) {
		return true;
	}
	if ((this.option.general && !Generals.to('bank')) || !Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(amount);
	Page.click('input[value="Stash"]');
	this.set(['temp','force'], false);
	return true;
};

// Return true when finished
Bank.retrieve = function(amount) {
	Worker.find(Queue.get('temp.current')).settings.bank = true;
	amount -= Player.get('cash', 0);
	if (amount <= 0 || (Player.get('bank', 0) - this.option.keep) < amount) {
		return true; // Got to deal with being poor exactly the same as having it in hand...
	}
	if (!Page.to('keep_stats')) {
		return false;
	}
	$('input[name="get_gold"]').val(amount.toString());
	Page.click('input[value="Retrieve"]');
	return false;
};

Bank.worth = function(amount) { // Anything withdrawing should check this first!
	var worth = Player.get('worth', 0) - this.option.keep;
	if (typeof amount === 'number') {
		return (amount <= worth);
	}
	return worth;
};

Bank.menu = function(worker, key) {
	if (worker === this) {
		if (!key && !this.option._disabled) {
			return ['bank:Bank&nbsp;Now'];
		} else if (key === 'bank') {
			this.set(['temp','force'], true);
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle:true, Generals, LevelUp, Monster, Player,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, getImage
*/
/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.settings = {
	taint:true
};

Battle.temp = null;

Battle.defaults['castle_age'] = {
	pages:'battle_rank battle_battle battle_war'
};

Battle.data = {
	user: {},
	rank: {},
	points: {},
	battle: {},
	war: {}
};

Battle.option = {
	general:true,
	general_choice:'any',
	points:'Invade',
	monster:true,
//	arena:false,
	losses:5,
	type:'Invade',
	bp:'Always',
	limit:0,
	chain:0,
	army:1.1,
	level:1.1,
	preferonly:'Sometimes',
	prefer:[],
	between:0,
	risk:false,
	stamina_reserve:0
};

Battle.runtime = {
	attacking:null,
	points:false,
	chain:0 // Number of times current target chained
};

Battle.symbol = { // Demi-Power symbols
	1:getImage('symbol_1'),
	2:getImage('symbol_2'),
	3:getImage('symbol_3'),
	4:getImage('symbol_4'),
	5:getImage('symbol_5')
};
Battle.demi = {
	1:'Ambrosia',
	2:'Malekus',
	3:'Corvintheus',
	4:'Aurora',
	5:'Azeron'
};

Battle.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'stamina_reserve',
		label:'Stamina Reserve',
		select:'stamina',
		help:'Keep this much stamina in reserve for other workers.'
	},{
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel', 'War'],
		help:'War needs level 100+, and is similar to Duel - though also uses 10 stamina'
	},{
		id:'points',
		label:'Get Demi-Points Type',
		select:['Never', 'Invade', 'Duel'],
		help:'This will make you attack specifically to get Demi-Points every day. War (above) will not earn Demi-Points, but otherwise you will gain them through normal battle - just not necessarily all ten a day'
	},{
		id:'losses',
		label:'Attack Until',
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
//		advanced:true,
//		id:'arena',
//		label:'Fight in Arena First',
//		checkbox:true,
//		help:'Only if the Arena is enabled!'
//	},{
		advanced:true,
		id:'monster',
		label:'Fight Monsters First',
		checkbox:true
	},{
		id:'bp',
		label:'Get Battle Points<br>(Clears Cache)',
		select:['Always', 'Never', 'Don\'t Care']
	},{
		advanced:true,
		id:'limit',
		before:'<center>Target Ranks</center>',
		require:'bp=="Always"',
		select:'limit_list',
		after: '<center>and above</center>',
		help:'When Get Battle Points is Always, only fights targets at selected rank and above yours.'
	},{
		advanced:true,
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	},{
		advanced:true,
		id:'between',
		label:'Time Between Attacks<br>(On same target)',
		select:{
			0:'none',
			300000:'5 mins',
			900000:'15 mins',
			1800000:'30 mins',
			3600000:'1 hour',
			7200000:'2 hours',
			21600000:'6 hours',
			43200000:'12 hours',
			86400000:'24 hours'
		},
		help:'Stop yourself from being as noticed, but may result in fewer attacks and slower advancement'
	},{
		advanced:true,
		id:'chain',
		label:'Chain after wins',
		select:[1,2,3,4,5,6,7,8,9,10],
		help:'How many times to chain before stopping'
	},{
		advanced:true,
		id:'risk',
		label:'Risk Death',
		checkbox:true,
		help:'The lowest health you can attack with is 10, but you can lose up to 12 health in an attack, so are you going to risk it???'
	},{
		id:'army',
		require:'type=="Invade"',
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
		require:'type!="Invade"',
		label:'Target Level Ratio<br>(Mainly used for Duel)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
	},{
		advanced:true,
		title:'Preferred Targets',
		group:[
			{
				id:'preferonly',
				label:'Fight Preferred',
				select:['Never', 'Sometimes', 'Only', 'Until Dead']
			},{
				id:'prefer',
				multiple:'userid'
			}
		]
	}
];

Battle.setup = function() {
	Resources.use('Stamina');
};

/***** Battle.init() *****
1. Watch Arena and Monster for changes so we can update our target if needed
*/
Battle.init = function() {
	var i, list, rank, data = this.data.user, mode = this.option.type === 'War' ? 'war' : 'battle';
//	this._watch(Arena);
	this._watch(Monster, 'runtime.attack');
	this._watch(this, 'option.prefer');
	if (typeof this.option.points === 'boolean') {
		this.set(['option','points'], this.option.points ? (this.option.type === 'War' ? 'Duel' : this.option.type) : 'Never');
		$(':golem(Battle,points)').val(this.option.points);
	}
/* Old fix for users stored directly in .data - breaks data.battle.rank
	for (i in data) {
		if (!/[^\d]/.test(i) && data[i].rank) {
			this.set(['data','user',i,'battle','rank'], data[i].rank);
			this.set(['data','user',i,'battle','win'], data[i].win);
			this.set(['data','user',i,'battle','loss'], data[i].loss);
			this.set(['data','user',i,'war','rank'], data[i].war);
			delete data[i].rank;
			delete data[i].win;
			delete data[i].loss;
		}
	}
	if (this.data.rank) {
		this.data.battle.rank = this.data.rank;
		delete this.data.rank;
	}
*/
//	this.option.arena = false;// ARENA!!!!!!
	// make a custom Config type of for rank, based on number so it carries forward on level ups
	list = {};
	if (this.get(['data',mode,'rank'])) {
		rank = Player.get(mode, 0);
		for (i in this.data[mode].rank){
			list[i - rank] = '(' + (i - rank) + ') ' + this.data[mode].rank[i].name;
		}
	} else {
		list[0] = '(0) Newbie';
	}
	Config.set('limit_list', list);

	// map old "(#) rank" string into the number
	i = this.get('option.limit');
	if (isString(i) && (i = i.regex(/\((-?\d+)\)/))) {
		this.set(['option','limit'], i);
	}

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set(['option','general_choice'], 'under max level');
	}
	// END

	$('.Battle-prefer-on').live('click', function(event) {
		Battle._unflush();
		var uid = $(this).attr('name');
		var prefs = Battle.get('option.prefer');
		if (uid && prefs.find(uid)) {
			prefs.remove(uid);
			Battle._taint['option'] = true;
			Battle._notify('option.prefer');
		}
		$(this).removeClass('Battle-prefer-on');
		$(this).attr('title', 'Click to remove from preferred list.');
		$(this).attr('src', getImage('star_off'));
		$(this).addClass('Battle-prefer-off');
	});

	$('.Battle-prefer-off').live('click', function(event) {
		Battle._unflush();
		var uid = $(this).attr('name');
		var prefs = Battle.get('option.prefer');
		if (uid && !prefs.find(uid)) {
			prefs.push(uid);
			Battle._taint['option'] = true;
			Battle._notify('option.prefer');
		}
		$(this).removeClass('Battle-prefer-off');
		$(this).attr('title', 'Click to add to preferred list.');
		$(this).attr('src', getImage('star_on'));
		$(this).addClass('Battle-prefer-on');
	});
};

/***** Battle.parse() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.parse = function(change) {
	var i, data, uid, info, $list, $el, tmp, rank, rank2, mode = this.option.type === 'War' ? 'war' : 'battle';
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el) {
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.set(['data','battle','rank'], data);
		this.set(['data','battle','bp'], $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with (\d+) Battle Points/i));
	} else if (Page.page === 'battle_war') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank (\d+) - (.*)\s*(\d+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.set(['data','war','bp'], $('span:contains("War Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with (\d+) War Points/i));
		this.set(['data','war','rank'], data);
	} else if (Page.page === 'battle_battle') {
		data = this.data.user;
		if ((uid = this.get(['runtime','attacking']))) {
			tmp = $('div.results').text();
			if ($('img[src*="battle_victory"]').length) {
				if (Player.get('general') === 'Zin'
						&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
					Generals.set(['data','Zin','charge'],Date.now() + 82800000);
				}
				if (mode === 'battle') {
					this.set(['data',mode,'bp'], $('span.result_body:contains(" Points.")').text().replace(/,/g, '').regex(/total of (\d+) Battle Points/i));
				}
				this.set(['data','user',uid,mode,'win'], this.get(['data','user',uid,mode,'win'], 0) + 1);
				this.set(['data','user',uid,'last'], Date.now());
				History.add('battle+win',1);
				if (this.option.chain && this.runtime.chain <= this.option.chain) {
					this.set(['runtime','chain'], this.runtime.chain + 1);
				} else { 
					this.set(['runtime','attacking'], null);
					this.set(['runtime','chain'], 0);
				}
			} else if (tmp.match(/You cannot battle someone in your army/i)
					 || tmp.match(/This trainee is too weak. Challenge someone closer to your level/i)
					 || tmp.match(/They are too high level for you to attack right now/i)
					 || tmp.match(/Their army is far greater than yours! Build up your army first before attacking this player!/i)) {
//				log(LOG_DEBUG, 'data[this.runtime.attacking].last ' + data[this.runtime.attacking].last+ ' Date.now() '+ Date.now()) + ' test ' + (data[this.runtime.attacking].last + 300000 < Date.now());
				this.set(['data','user',uid]);
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
			} else if (tmp.match(/Your opponent is dead or too weak/i)) {
				this.set(['data','user',uid,'hide'], this.get(['data','user',uid,'hide'], 0) + 1);
				this.set(['data','user',uid,'dead'], Date.now());
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
//			} else if (!$('div.results').text().match(new RegExp(data[uid].name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")+"( fought with:|'s Army of (\d+) fought with|'s Defense)",'i'))) {
//			} else if (!$('div.results').text().match(data[uid].name)) {
//				uid = null; // Don't remove target as we've hit someone else...
//				log(LOG_WARN, 'wrong ID');
			} else if ($('img[src*="battle_defeat"]').length) {
				if (Player.get('general') === 'Zin'
						&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
					Generals.set(['data','Zin','charge'],Date.now() + 82800000);
				}
				this.set(['runtime','attacking'], null);
				this.set(['runtime','chain'], 0);
				this.set(['data','user',uid,mode,'loss'], this.get(['data','user',uid,mode,'loss'], 0) + 1);
				this.set(['data','user',uid,'last'], Date.now());
				History.add('battle+loss',-1);
			}
		}
		this.set(['data','points'], $('#'+APPID_+'app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10(\d+)\/10/), isArray);
		rank = {
			battle: Player.get('battle',0),
			war: Player.get('war',0)
		}
		$list = $('#'+APPID_+'app_body table.layout table table tr:even');
		for (i=0; i<$list.length; i++) {
			$el = $list[i];
			uid = $('img[uid!=""]', $el).attr('uid');
			info = $('td.bluelink', $el).text().replace(/[ \t\n]+/g, ' ');
			rank2 = {
				battle: info.regex(/Battle:[^(]+\(Rank (\d+)\)/i),
				war: info.regex(/War:[^(]+\(Rank (\d+)\)/i)
			}
			if (uid && info && ((Battle.option.bp === 'Always' && rank2[mode] - rank[mode] >= this.option.limit) || (Battle.option.bp === 'Never' && rank[mode]- rank2[mode] >= 5) || Battle.option.bp === "Don't Care")) {
				this.set(['data','user',uid,'name'], $('a', $el).text().trim());
				this.set(['data','user',uid,'level'], info.regex(/\(Level (\d+)\)/i));
				this.set(['data','user',uid,'battle','rank'], rank2.battle);
				this.set(['data','user',uid,'war','rank'], rank2.war);
				this.set(['data','user',uid,'army'], $('td.bluelink', $el).next().text().regex(/(\d+)/));
				this.set(['data','user',uid,'align'], $('img[src*="graphics/symbol_"]', $el).attr('src').regex(/symbol_(\d)/i));
			}
		}
	}
	return false;
};

/***** Battle.update() *****
1. Delete targets who are now too high or too low in rank
2. If our target cache is longer than the user-set limit then prune it
2a. Add every target to an array
2b. Sort the array using weighted values - we want to keep people we win against etc
2c. While the list is too long, delete the extra entries
3. Check if we need to get Battle Points (points.length will be 0 if we don't)
4. Choose our next target
4a. If we don't want points and we want to fight in the arena, then skip
4b. If we don't want points and we want to fight monsters, then skip
4c. Loop through all preferred targets, and add them 10 times
4d. If we need to, now loop through all in target cache and add 1-5 times (more times for higher rank)
4e. Choose a random entry from our list (targets with more entries have more chance of being picked)
5. Update the Status line
*/
Battle.update = function(event) {
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army',0), level = Player.get('level'), mode = this.option.type === 'War' ? 'war' : 'battle', rank = Player.get(mode,0), count = 0, skip, limit, enabled = !this.get(['option', '_disabled'], false), tmp;
	tmp = this.get(['data',mode], {});
	status.push('Rank ' + rank + ' ' + this.get([tmp,'rank',rank,'name'], 'unknown', 'string') + ' with ' + this.get([tmp,'bp'], 0, 'number').addCommas() + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
	if (event.type === 'watch' && event.id === 'option.prefer') {
		this.dashboard();
		return;
	}
	if (this.option.points !== 'Never') {
		tmp = this.get(['data','points'],[]);
		status.push('Demi Points Earned Today: '
		+ '<img class="golem-image" src="' + this.symbol[1] +'" alt=" " title="'+this.demi[1]+'"> ' + this.get([tmp,0], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[2] +'" alt=" " title="'+this.demi[2]+'"> ' + this.get([tmp,1], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[3] +'" alt=" " title="'+this.demi[3]+'"> ' + this.get([tmp,2], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[4] +'" alt=" " title="'+this.demi[4]+'"> ' + this.get([tmp,3], 0) + '/10 '
		+ '<img class="golem-image" src="' + this.symbol[5] +'" alt=" " title="'+this.demi[5]+'"> ' + this.get([tmp,4], 0) + '/10');
	}
	// First make check our target list doesn't need reducing
	limit = this.get(['option','limit'], -4, isNumber);
	for (i in data) { // Forget low or high rank - no points or too many points
		tmp = this.get([data,i,mode,'rank'],0);
		if ((this.option.bp === 'Always' && tmp - rank < limit) || (this.option.bp === 'Never' && rank - tmp <= 5)) { // unknown rank never deleted
			this.set(['data','user',i]); // Would be nicer to just ignore "bad" targets until they're naturally pruned...
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		log('Pruning target cache');
		list = [];
		for (i in data) {
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0, aa = data[a], bb = data[b];
			if (((aa.win || 0) - (aa.loss || 0)) < ((bb.win || 0) - (bb.loss || 0))) {
				weight += 10;
			} else if (((aa.win || 0) - (aa.loss || 0)) > ((bb.win || 0) - (bb.loss || 0))) {
				weight -= 10;
			}
			if (Battle.option.bp === 'Always') {
				weight += ((bb.rank || 0) - (aa.rank || 0)) / 2;
			}
			if (Battle.option.bp === 'Never') {
				weight += ((aa.rank || 0) - (bb.rank || 0)) / 2;
			}
			weight += Math.range(-1, (bb.hide || 0) - (aa.hide || 0), 1);
			weight += Math.range(-10, (((aa.army || 0) - (bb.army || 0)) / 10), 10);
			weight += Math.range(-10, (((aa.level || 0) - (bb.level || 0)) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			this.set(['data','user',list.pop()]);
		}
	}
	// Check if we need Demi-points
//	log(LOG_WARN, 'Queue Logic = ' + enabled);
	points = this.set(['runtime','points'], this.option.points !== 'Never' && sum(this.get(['data','points'], [0])) < 50 && enabled);
	// Second choose our next target
/*	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else*/
	if (!points && (this.option.monster || LevelUp.runtime.big) && Monster.get('runtime.attack',false)) {
		this.set(['runtime','attacking'], null);
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) * (data[this.runtime.attacking].level / level) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)
		|| (this.option.type === 'War' && data[this.runtime.attacking].last && data[this.runtime.attacking].last + 300000 < Date.now())) {
			this.set(['runtime','attacking'], null);
		}
//		log(LOG_DEBUG, 'data[this.runtime.attacking].last ' + data[this.runtime.attacking].last+ ' Date.now() '+ Date.now()) + ' test ' + (data[this.runtime.attacking].last + 300000 < Date.now());
		skip = {};
		list = [];
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/\D/g.test(i)) {
				if (this.option.preferonly === 'Never') {
					skip[i] = true;
					continue;
				}
				data[i] = data[i] || {};
				if ((data[i].dead && data[i].dead + 300000 >= Date.now()) // If they're dead ignore them for 1hp = 5 mins
				|| (data[i].last && data[i].last + this.option.between >= Date.now()) // If we're spacing our attacks
				|| (typeof this.option.losses === 'number' && (data[i][mode].loss || 0) - (data[i][mode].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (points && data[i].align && this.data.points[data[i].align - 1] >= 10)) {
					continue;
				}
				list.push(i,i,i,i,i,i,i,i,i,i); // If on the list then they're worth at least 10 ;-)
				count++;
			}
		}
		if (this.option.preferonly === 'Never' || this.option.preferonly === 'Sometimes' || (this.option.preferonly === 'Only' && !this.option.prefer.length) || (this.option.preferonly === 'Until Dead' && !list.length)) {
			for (i in data) {
				if (skip[i] // If filtered out in preferred list
				|| (data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (data[i].last && data[i].last + this.option.between >= Date.now()) // If we're spacing our attacks
				|| (typeof this.option.losses === 'number' && (data[i][mode].loss || 0) - (data[i][mode].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && ((data[i].army || 0) / army) * (data[i].level || 0) / level > this.option.army && this.option.type === 'Invade')
				|| (this.option.level !== 'Any' && ((data[i].level || 0) / level) > this.option.level && this.option.type !== 'Invade')
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				if (Battle.option.bp === 'Always') {
					for (j=Math.range(1,(data[i][mode].rank || 0)-rank+1,5); j>0; j--) { // more than 1 time if it's more than 1 difference
						list.push(i);
					}
				} else {
					list.push(i);
				}
				count++;
			}
		}
		if (!this.runtime.attacking && list.length) {
			this.set(['runtime','attacking'], list[Math.floor(Math.random() * list.length)]);
		}
		if (this.runtime.attacking) {
			i = this.runtime.attacking;
			if (isString(data[i].name) && data[i].name.trim() !== '') {
				j = data[i].name.html_escape();
			} else {
				j = '<i>id:</i> ' + i;
			}
			status.push('Next Target: <img class="golem-image" src="' + this.symbol[data[i].align] +'" alt=" " title="'+this.demi[data[i].align]+'"> ' + j + ' (Level ' + data[i].level + (data[i][mode].rank && this.data[mode].rank[data[i][mode].rank] ? ' ' + this.data[mode].rank[data[i][mode].rank].name : '') + ' with ' + data[i].army + ' army)' + (count ? ', ' + count + ' valid target' + plural(count) : ''));
		} else {
			this.set(['runtime','attacking'], null);
			status.push('No valid targets found.');
			this._remind(60); // No targets, so check again in 1 minute...
		}
	}
	Dashboard.status(this, status.join('<br>'));
};

/***** Battle.work() *****
1. If we don't have a target, not enough health, or not enough stamina, return false
2. Otherwise
2a. Ask to work
2b. Get the correct General
2c. Go to the right page
3. Select our target
3a. Replace the first target on the page with the target we want to attack
3b. If we can't find any targets to replace / attack then force a reload
3c. Click the Invade / Dual attack button
*/
Battle.work = function(state) {
	var useable_stamina = LevelUp.runtime.force.stamina ? LevelUp.runtime.stamina : LevelUp.runtime.stamina - this.option.stamina_reserve;
	if (!this.runtime.attacking || Player.get('health',0) < (this.option.risk ? 10 : 13) 
			|| useable_stamina < (!this.runtime.points && this.option.type === 'War' ? 10 : 1)
			|| LevelUp.runtime.big) {
//		log(LOG_WARN, 'Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health',0) + ' (must be >=10), Burn Stamina: ' + useable_stamina + ' (must be >=1)');
		return QUEUE_FINISH;
	}
	if (!state || !Generals.to(Generals.runtime.zin || (this.option.general ? (this.runtime.points ? this.option.points : this.option.type) : this.option.general_choice)) || !Page.to('battle_battle')) {
		return QUEUE_CONTINUE;
	}
	/*jslint onevar:false*/
	var $symbol_rows = $('#'+APPID_+'app_body table.layout table table tr:even').has('img[src*="graphics/symbol_'+this.data.user[this.runtime.attacking].align+'"]');
	var $form = $('form input[alt="' + (this.runtime.points ? this.option.points : this.option.type) + '"]', $symbol_rows).first().parents('form');
	/*jslint onevar:true*/
	if (!$form.length) {
		log(LOG_WARN, 'Unable to find ' + (this.runtime.points ? this.option.points : this.option.type) + ' button, forcing reload');
		Page.to('index');
	} else {
		log(LOG_INFO, (this.runtime.points ? this.option.points : this.option.type) + ' ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return QUEUE_RELEASE;
};

Battle.rank = function(name) {
	var i, mode = this.get(['data',this.option.type === 'War' ? 'war' : 'battle','rank'],{});
	for (i in mode) {
		if (this.get([mode,i,'name']) === name) {
			return parseInt(i, 10);
		}
	}
	return 0;
};

Battle.order = [];
Battle.dashboard = function(sort, rev) {
	var i, o, points = [0, 0, 0, 0, 0, 0], list = [], output = [], sorttype = ['align', 'name', 'level', 'rank', 'army', '*pref', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army',0), level = Player.get('level',0), mode = this.option.type === 'War' ? 'war' : 'battle';
	for (i in data) {
		points[data[i].align]++;
	}
	var prefs = {};
	for (i = 0; i < this.option.prefer.length; i++) {
		prefs[this.option.prefer[i]] = 1;
	}
	var pref_img_on = '<img class="Battle-prefer-on" src="' + getImage('star_on') + '" title="Click to remove from preferred list." name="';
	var pref_img_off = '<img class="Battle-prefer-off" src="' + getImage('star_off') + '" title="Click to add to preferred list." name="';
	var pref_img_end = '">';
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	if (typeof sorttype[sort] === 'string') {
		var str = '';
		this.order.sort(function(a,b) {
			var aa, bb;
			if (sorttype[sort] === '*pref') {
				aa = prefs[a] || 0;
				bb = prefs[b] || 0;
				str += '\n' + a + ' = ' + aa;
				str += ', ' + b + ' = ' + bb;
			} else {
				aa = data[a][mode][sorttype[sort]] || data[a][sorttype[sort]] || 0;
				bb = data[b][mode][sorttype[sort]] || data[b][sorttype[sort]] || 0;
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + (this.data[mode].rank && this.data[mode].rank[Player.get(mode,0)] ? this.data[mode].rank[Player.get(mode,0)].name : 'unknown') + ' (' + Player.get(mode,0) + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img class="golem-image" src="' + this.symbol[i] +'" alt="'+this.demi[i]+'" title="'+this.demi[i]+'"> ' + points[i]);
	}
	list.push('</div><hr>');
	th(output, 'Align');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Rank');
	th(output, 'Army');
	th(output, 'Pref');
	th(output, 'Wins');
	th(output, 'Losses');
	th(output, 'Hides');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		data = this.data.user[this.order[o]];
		output = [];
		td(output, isNumber(data.align) ? '<img class="golem-image" src="' + this.symbol[data.align] + '" alt="' + this.demi[data.align] + '">' : '', isNumber(data.align) ? 'title="' + this.demi[data.align] + '"' : null);
		th(output, data.name.html_escape(), 'title="'+this.order[o]+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, this.get(['data',mode,'rank',data[mode].rank,'name'], '', 'string'));
		td(output, (this.option.army !== 'Any' && (data.army / army * data.level / level) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
		td(output, (prefs[this.order[o]] ? pref_img_on : pref_img_off) + this.order[o] + pref_img_end);
		td(output, data[mode].win || '');
		td(output, data[mode].loss || '');
		td(output, data.hide || '');
		tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Battle').html(list.join(''));
	$('#golem-dashboard-Battle tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Battle thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing');
Blessing.data = Blessing.temp = null;

Blessing.settings = {
	taint:true
};

Blessing.defaults['castle_age'] = {
	pages:'oracle_demipower'
};

Blessing.option = {
	which:'Stamina'
};

Blessing.runtime = {
	when:0
};

Blessing.which = ['None', 'Energy', 'Attack', 'Defense', 'Health', 'Stamina'];
Blessing.display = [
    {
		id:'which',
		label:'Which',
		select:Blessing.which
    }
];

Blessing.setup = function() {
	// BEGIN: Use global "Show Status" instead of custom option
	if ('display' in this.option) {
		this.set(['option','_hide_status'], !this.option.display);
		this.set(['option','display']);
	}
	// END
};

Blessing.init = function() {
	var when = this.get(['runtime','when'],0);
	if (when) {
		this._remind((when - Date.now()) / 1000, 'blessing');
	}
};

Blessing.parse = function(change) {
	var result = $('div.results'), time, when;
	if (result.length) {
		time = result.text().regex(/Please come back in: (\d+) hours and (\d+) minutes/i);
		if (time && time.length) {
			this.set(['runtime','when'], Date.now() + (((time[0] * 60) + time[1] + 1) * 60000));
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.set(['runtime','when'], Date.now() + 86460000); // 24 hours and 1 minute
		}
		if ((when = this.get(['runtime','when'],0))) {
			this._remind((when - Date.now()) / 1000, 'blessing');
		}
	}
	return false;
};

Blessing.update = function(event){
    var d, demi;
     if (this.option.which && this.option.which !== 'None'){
         d = new Date(this.runtime.when);
         switch(this.option.which){
             case 'Energy':
                 demi = '<img class="golem-image" src="'+getImage('symbol_1')+'"> Ambrosia (' + this.option.which + ')';
                 break;
             case 'Attack':
                 demi = '<img class="golem-image" src="'+getImage('symbol_2')+'"> Malekus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = '<img class="golem-image" src="'+getImage('symbol_3')+'"> Corvintheus (' + this.option.which + ')';
                 break;
             case 'Health':
                 demi = '<img class="golem-image" src="'+getImage('symbol_4')+'"> Aurora (' + this.option.which + ')';
                 break;
             case 'Stamina':
                 demi = '<img class="golem-image" src="'+getImage('symbol_5')+'"> Azeron (' + this.option.which + ')';
                 break;
             default:
                 demi = 'Unknown';
                 break;
         }
         Dashboard.status(this, '<span title="Next Blessing">' + 'Next Blessing performed on ' + d.format('l g:i a') + ' to ' + demi + ' </span>');
		 this.set(['option','_sleep'], Date.now() < this.runtime.when);
     } else {
         Dashboard.status(this);
 		 this.set(['option','_sleep'], true);
    }
};

Blessing.work = function(state) {
	if (!state || !Page.to('oracle_demipower')) {
		return QUEUE_CONTINUE;
	}
	Page.click('#'+APPID_+'symbols_form_'+this.which.indexOf(this.option.which)+' input.imgButton');
	return QUEUE_RELEASE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite');
Elite.data = Elite.temp = null;

Elite.settings = {
	taint:true
};

Elite.defaults['castle_age'] = {
	pages:'* keep_eliteguard army_viewarmy'
};

Elite.option = {
	every:12,
	friends:true,
	armyperpage:25 // Read only, but if they change it and I don't notice...
};

Elite.runtime = {
	waitelite:0,
	nextelite:0
};

Elite.display = [
	{
		id:'friends',
		label:'Facebook Friends Only',
		checkbox:true
	},{
		id:'every',
		label:'Check Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours',
		help:'Although people can leave your Elite Guard after 24 hours, after 12 hours you can re-confirm them'
	}
];

Elite.menu = function(worker, key) {
	if (worker === this) {
		if (!key) {
			return ['fill:Fill&nbsp;Elite&nbsp;Guard&nbsp;Now'];
		} else if (key === 'fill') {
			this.set('runtime.waitelite', 0);
		}
	}
};

Elite.parse = function(change) {
	if (Page.page === 'keep_eliteguard') {
		var i, txt, uid, el = $('span.result_body'), now = Date.now();
		for (i=0; i<el.length; i++) {
			txt = $(el[i]).text().trim(true);
			uid = $('img', el[i]).attr('uid');
			if (txt.match(/Elite Guard, and they have joined/i)) {
				log(LOG_INFO, 'Added ' + Army.get(['Army', uid, 'name'], uid) + ' to Elite Guard');
				Army.set(['Elite',uid, 'elite'], now + 86400000); // 24 hours
				Elite.set(['runtime','nextelite']);
			} else if (txt.match(/'s Elite Guard is FULL!/i)) {
				log(LOG_INFO, Army.get(['Army', uid, 'name'], uid) + '\'s Elite Guard is full');
				Army.set(['Elite',uid, 'full'], now + 1800000); // half hour
				Elite.set(['runtime','nextelite']);
			} else if (txt.match(/Sorry: You must be in Facebook User's Army to join their Elite Guard!/i)) {
				log(LOG_INFO, Army.get(['Army', uid, 'name'], uid) + ' is not in your army so can\'t join your Elite Guard');
				Army.set(['Army',i,'member']);
				Elite.set(['runtime','nextelite']);
			} else if (txt.match(/YOUR Elite Guard is FULL!/i)) {
				log(LOG_INFO, 'Elite guard full, wait '+Elite.option.every+' hours');
				Elite.set(['runtime','waitelite'], now);
				Elite.set(['runtime','nextelite']);
			}
		}
	} else {
		if ($('input[src*="elite_guard_add"]').length) {
			this.set(['runtime','waitelite'], 0);
		}
	}
	return false;
};

Elite.update = function(event) {
	var i, list, check, next, now = Date.now();
	list = Army.get('Elite');// Try to keep the same guards
	for (i in list) {
		check = list[i].elite || list[i].full || 0;
		if (check < now) {
			Army.set(['Elite',i,'elite']);// Delete the old timers if they exist...
			Army.set(['Elite',i,'full']);// Delete the old timers if they exist...
			if (Army.get(['Army',i,'member'], false)) {
				if (Army.get(['Elite',i,'prefer'], false)) {// Prefer takes precidence
					next = i;
					break;
				}
				if (!next && (!this.option.friends || Army.get(['Army',i,'friend'], false))) { // Only facebook friends unless we say otherwise
					next = i;// Earlier in our army rather than later
				}
			}
		}
	}
	if (!next) {
		list = Army.get('Army');// Otherwise lets just get anyone in the army
		for(i in list) {
			if (!list[i].elite && !list[i].full && Army.get(['Army',i,'member'], false) && (!this.option.friends || Army.get(['Army',i,'friend'], false))) {// Only try to add a non-member who's not already added
				next = i;
				break;
			}
		}
	}
	this.set(['runtime','nextelite'], next);
	check = ((this.runtime.waitelite + (this.option.every * 3600000)) - now) / 1000;
	if (next && this.runtime.waitelite) {
		this._remind(check, 'recheck');
	}
	this.set(['option','_sleep'], !next || (this.runtime.waitelite + (this.option.every * 3600000)) > now);
	Dashboard.status(this, 'Elite Guard: Check' + (check <= 0 ? 'ing now' : ' in ' + Page.addTimer('elite', check * 1000, true)) + (next ? ', Next: '+Army.get(['Army', next, 'name']) : ''));
	return true;
};

Elite.work = function(state) {
	if (state) {
//		log(LOG_LOG, 'Add ' + Army.get(['Army', this.runtime.nextelite, 'name'], this.runtime.nextelite) + ' to Elite Guard');
		Page.to('keep_eliteguard', {twt:'jneg' , jneg:true, user:this.runtime.nextelite});
	}
	return true;
};

Elite.army = function(action, uid) {
	switch(action) {
	case 'title':
		return 'Elite';
	case 'show':
		return (Army.get(['Elite',uid])
			? (Army.get(['Elite',uid,'prefer'])
				? '<span class="ui-icon golem-icon golem-icon-star-on" style="display:inline-block;"></span>'
				: '<span class="ui-icon golem-icon golem-icon-star-off" style="display:inline-block;"></span>')
			 + (Army.get(['Elite',uid,'elite'])
				? '<span class="ui-icon ui-icon-check" title="Member until: ' + makeTime(Army.get(['Elite',uid,'elite'])) + '" style="display:inline-block;"></span>'
				: '<span class="ui-icon" style="display:inline-block;"></span>')
			 + (Army.get(['Elite',uid,'full'])
				? '<span class="ui-icon ui-icon-clock" title="Full until: ' + makeTime(Army.get(['Elite',uid,'full'])) + '" style="display:inline-block;"></span>'
				: '<span class="ui-icon" style="display:inline-block;"></span>')
			: (Army.get(['Army',uid,'member'])
				? '<span class="ui-icon golem-icon golem-icon-star-off" style="display:inline-block;"></span>'
				: '<span class="ui-icon" style="display:inline-block;"></span>')
			 + '<span class="ui-icon" style="display:inline-block;"></span><span class="ui-icon" style="display:inline-block;"></span>'
			);
	case 'sort':
		var now = Date.now();
		if (!Army.get(['Elite',uid]) && !Army.get(['Army',uid,'member'])) {
			return 0;
		}
		return ((Army.get(['Elite',uid,'prefer'])
				? now
				: 0)
			+ (Army.get(['Elite',uid,'elite'])
				? now - parseInt(Army.get(['Elite',uid,'elite']), 10)
				: 0)
			+ (Army.get(['Elite',uid,'full'])
				? now - parseInt(Army.get(['Elite',uid,'full']), 10)
				: 0));
	case 'click':
		if (uid && Army.get(['Army',uid,'member'])) {
			Army.toggle(['Elite',uid,'prefer'])
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals:true, Idle, LevelUp, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, bestObjValue,
*/
/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.temp = null;

Generals.settings = {
	unsortable:true,
	taint:true
};

Generals.defaults['castle_age'] = {
	pages:'* heroes_generals heroes_heroes keep_stats'
};

Generals.option = {
	zin:false
};

Generals.display = [
	{
		id:'zin',
		label:'Automatically use Zin',
		checkbox:true
	}
];

Generals.runtime = {
	multipliers: {}, // Attack multipliers list for Orc King and Barbarus type generals
	force: false,
	armymax:1 // Don't force someone with a small army to buy a whole load of extra items...
};

Generals.init = function(old_revision) {
	if (!Player.get('attack') || !Player.get('defense')) { // Only need them the first time...
		this._watch(Player, 'data.attack');
		this._watch(Player, 'data.defense');
	}
	this._watch(Player, 'data.army');
	this._watch(Player, 'data.armymax');
	this._watch(Town, 'runtime.invade');
	this._watch(Town, 'runtime.duel');
	this._watch(Town, 'runtime.war');
	this._watch(Town, 'data'); // item counts

	// last recalc revision is behind the current, fire a reminder
	if (this.get('runtime.revision', 0, 'number') < revision) {
		this._remind(1, 'revision');
	} else if (this.get('runtime.force')) {
		this._remind(1, 'force');
	}
};

Generals.parse = function(change) {
	var now = Date.now(), self = this, i, j, seen = {}, el, el2, tmp, name, item, icon;

	if (($('div.results').text() || '').match(/has gained a level!/i)) {
		if ((name = Player.get('general'))) { // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
			this.add(['data',name,'level'], 1);
			if (Page.page !== (j = 'heroes_generals')) {
				Page.setStale(j, now);
			}
		}
	}

	if (Page.page === 'heroes_generals') {
		tmp = $('.generalSmallContainer2');
		for (i=0; i<tmp.length; i++) {
			el = tmp[i];
			try {
				this._transaction(); // BEGIN TRANSACTION
				name = $('.general_name_div3_padding', el).text().trim();
				assert(name && name.indexOf('\t') === -1 && name.length < 30, 'Bad general name - found tab character');
				seen[name] = true;
				assert(this.set(['data',name,'id'], parseInt($('input[name=item]', el).val()), 'number') !== false, 'Bad general id: '+name);
				assert(this.set(['data',name,'type'], parseInt($('input[name=itype]', el).val()), 'number') !== false, 'Bad general type: '+name);
				assert(this.set(['data',name,'img'], $('.imgButton', el).attr('src').filepart(), 'string'), 'Bad general image: '+name);
				assert(this.set(['data',name,'att'], $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/(\d+)/), 'number') !== false, 'Bad general attack: '+name);
				assert(this.set(['data',name,'def'], $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/(\d+)/), 'number') !== false, 'Bad general defense: '+name);
				this.set(['data',name,'progress'], j = parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: (\d*\.*\d+)%/im), 10));
				// If we just maxed level, remove the priority
				if ((j || 0) >= 100) {
					this.set(['data',name,'priority']);
				}
				this.set(['data',name,'skills'], $(el).children(':last').html().replace(/\<[^>]*\>|\s+/gm,' ').trim());
				j = parseInt($('div.generals_indv_stats', el).next().next().text().regex(/(\d*\.*\d+)% Charged!/im), 10);
				if (j) {
					this.set(['data',name,'charge'], Date.now() + Math.floor(3600000 * ((1-j/100) * this.data[name].skills.regex(/(\d*) Hour Cooldown/im))));
					//log(LOG_WARN, name + ' ' + makeTime(this.data[name].charge, 'g:i a'));
				}
				this.set(['data',name,'level'], parseInt($(el).text().regex(/Level (\d+)/im), 10));
				this.set(['data',name,'own'], 1);
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}

		// parse general equipment, including those not yet owned
		name = $('div.general_name_div3').first().text().trim();
		if (this.get(['data',name])) {
			tmp = $('div[style*="model_items.jpg"] img[title]');
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				item = $(el).attr('title');
				icon = ($(el).attr('src') || '').filepart();
				if (isString(item)) {
					item = item.replace('[not owned]', ' ').replace(/\<^>]*\>|\s+/gim, ' ').trim();
					if ((j = item.match(/^\s*([^:]*\w)\s*:\s*(.*\w)\s*$/i))) {
						item = Town.qualify(j[1], icon);
						Resources.set(['_'+item,'generals'], Math.max(1, Resources.get(['_'+item,'generals'], 0, 'number')));
						this.set(['data',name,'equip',item], j[2]);
					}
				}
			}
			i = ($('div.general_pic_div3 a img[title]').first().attr('title') || '').trim();
			if (i && (j = i.regex(/\bmax\.? (\d+)\b/im))) {
				this.set(['data', name, 'stats', 'cap'], j);
			}
			this.set(['data',name,'seen'], now);
		}

		// purge generals we didn't see
		for (i in this.data) {
			if (!seen[i]) {
				this.set(['data',i]);
			}
		}
	} else if (Page.page === 'heroes_heroes') {
		// parse upkeep
		if ((tmp = $('.mContTMainBack div:contains("Total Upkeep")')).length) {
			j = ($('b.negative', tmp).text() || '').replace(/,/gm, '');
			if (isNumber(i = j.regex(/^\s*-?\$(\d+)\s*$/m))) {
				Player.set('upkeep', i);
			}
		}

		// parse purchasable heroes
		tmp = $('.hero_buy_row');
		for (j = 0; j < tmp.length; j++) {
			el = tmp[j];
			el2 = $('.hero_buy_image img', el);
			name = ($(el2).attr('title') || '').trim();
			if (name) {
				try {
					self._transaction(); // BEGIN TRANSACTION
					icon = ($(el2).attr('src') || '').filepart();
					info = $('.hero_buy_info', el);
					stats = $('.hero_select_stats', el);
					costs = $('.hero_buy_costs', el);
					i = $('form', costs).attr('id') || '';
					if (isNumber(i = i.regex(/^app\d+_item(?:buy|sell)_(\d+)$/i))) {
						self.set(['data',name,'id'], i);
					}

					if (icon) {
						self.set(['data',name,'img'], icon);
					}

					// only use these atk/def values if we don't know this general
					if (!self.data[name]) {
						i = $('div:contains("Attack")', stats).text() || '';
						if (isNumber(i = i.regex(/\b(\d+)\s*Attack\b/im))) {
							self.set(['data',name,'att'], i);
						}

						i = $('div:contains("Defense")', stats).text() || '';
						if (isNumber(i = i.regex(/\b(\d+)\s*Defense\b/im))) {
							self.set(['data',name,'def'], i);
						}
					}

					i = $(costs).text() || '';
					if ((i = i.regex(/\bRecruited:\s*(\w+)\b/im))) {
						self.set(['data',name,'own'], i.toLowerCase() === 'yes' ? 1 : 0);
					}

					i = $('.gold', costs).text() || '';
					if (isNumber(i = i.replace(/,/gm, '').regex(/\$(\d+)\b/im))) {
						self.set(['data',name,'cost'], i);
					}

					i = $('div:contains("Upkeep") .negative', info).text() || '';
					if (isNumber(i = i.replace(/,/gm, '').regex(/\$(\d+)\b/im))) {
						self.set(['data',name,'upkeep'], i);
					}
					self._transaction(true); // COMMIT TRANSACTION
				} catch (e2) {
					self._transaction(false); // ROLLBACK TRANSACTION on any error
					log(LOG_ERROR, e2.name + ' in ' + self.name + '.parse(' + change + '): ' + e2.message);
				}
			}
		}
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			tmp = $('.statsT2 .statsTTitle:contains("HEROES")').not(function(a) {
				return !$(this).text().regex(/^\s*HEROES\s*$/im);
			});
			tmp = $('.statUnit', $(tmp).parent());
			for (i=0; i<tmp.length; i++) {
				el = $('a img[src]', tmp[i]);
				name = ($(el).attr('title') || $(el).attr('alt') || '').trim();

				// new general(s), trigger page visits
				if (name && !this.get(['data',name])) {
					Page.setStale('heroes_heroes', now);
					Page.setStale('heroes_generals', now);
					break;
				}
			}
		}
	}
	return false;
};

Generals.resource = function() {
	Generals.runtime.zin = false;
	if (Generals.option.zin && Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
		Generals.runtime.zin = 'Zin';
		LevelUp.runtime.force.stamina = true;
		return 'stamina';
	}
	return false;
};

Generals.update = function(event, events) {
	var data = this.data, i, j, k, o, p, pa, priority_list = [], list = [],
		pattack, pdefense, maxstamina, maxenergy, stamina, energy,
		army, armymax, gen_att, gen_def, war_att, war_def,
		invade = Town.get('runtime.invade'),
		duel = Town.get('runtime.duel'),
		war = Town.get('runtime.war'),
		attack, attack_bonus, att_when_att = 0, current_att,
		defend, defense_bonus, def_when_att = 0, current_def,
		monster_att = 0, monster_multiplier = 1,
		listpush = function(list,i){list.push(i);},
		skillcombo, calcStats = false, all_stats, bests;

	if (events.findEvent(this, 'init') || events.findEvent(this, 'data')) {
		bests = true;

		k = 0;
		for (i in data) {
			list.push(i);
			p = data[i];
			if ((isNumber(j = p.progress) ? j : 100) < 100) { // Take all existing priorities and change them to rank starting from 1 and keeping existing order.
				priority_list.push([i, p.priority]);
			}
			if (!p.stats) { // Force an update if stats not yet calculated
				this.set(['runtime','force'], true);
			}
			k += p.own || 0;
			if (p.skills) {
				var x, y, num = 0, cap = 0, item, str = null;
				if ((x = p.skills.regex(/\bevery (\d+) ([\w\s']*\w)/im))) {
					num = x[0];
					str = x[1];
				} else if ((x = p.skills.regex(/\bevery ([\w\s']*\w)/im))) {
					num = 1;
					str = x;
				}
				if (p.stats && p.stats.cap) {
					cap = Math.max(cap, p.stats.cap);
				}
				if ((x = p.skills.regex(/\bmax\.? (\d+)/i))) {
					cap = Math.max(cap, x);
				}
				if (str) {
					for (x = str.split(' '); x.length > 0; x.pop()) {
						str = x.join(' ');
						if ((y = str.regex(/^(.+)s$/i))) {
							if (Town.get(['data', y])) {
								item = y;
								break;
							}
						}
						if (Town.get(['data', str])) {
							item = str;
							break;
						}
					}
				}
				if (num && item) {
					Resources.set(['data', '_' + item, 'generals'], num * cap);
//					log(LOG_WARN, 'Save ' + (num * cap) + ' x ' + item + ' for General ' + i);
				}
			}
		}

		// need this since we now store unpurchased heroes also
		this.set('runtime.heroes', k);

		if ((i = priority_list.length)) {
			priority_list.sort(function(a,b) {
				return (a[1] - b[1]);
			});
			this.set(['runtime','max_priority'], i);
			while (i--) {
				this.set(['data',priority_list[i][0],'priority'], parseInt(i, 10)+1);
			}
		}
		// "any" MUST remain lower case - all real generals are capitalised so this provides the first and most obvious difference
		Config.set('generals', ['any','under max level'].concat(list.sort())); 
	}
	
	// busy stuff, so watch how often it runs
	// revision increases force a run via an event

	if ((invade && duel && war
	&& (this.runtime.force
		|| events.findEvent(null, 'data')
		|| events.findEvent(Town)
		|| events.findEvent(Player)))
	|| events.findEvent(this, 'reminder', 'revision')) {
		bests = true;
		this.set(['runtime','force'], false);

		pattack = Player.get('attack', 1, 'number');
		pdefense = Player.get('defense', 1, 'number');
		maxstamina = Player.get('maxstamina', 1, 'number');
		maxenergy = Player.get('maxenergy', 1, 'number');
		maxhealth = Player.get('maxhealth', 100, 'number');
		stamina = Player.get('stamina', 1, 'number');
		energy = Player.get('energy', 1, 'number');
		health = Player.get('health', 0, 'number');
		armymax = Player.get('armymax', 1, 'number');

		if (events.findEvent(Player) && pattack > 1 && pdefense > 1) {
			// Only need them the first time...
			this._unwatch(Player, 'data.attack');
			this._unwatch(Player, 'data.defense');
		}

		for (i in data) {
			p = data[i];

			this.set(['data',i,'invade']);
			this.set(['data',i,'duel']);
			this.set(['data',i,'war']);
			this.set(['data',i,'monster']);
			this.set(['data',i,'potential']);
			this.set(['data',i,'stats','stamina']);
			this.set(['data',i,'stats','energy']);

			// update the weapon bonus list
			s = '';
			if ((o = p.equip)) {
				for (j in o) {
					if (Town.get(['data',j,'own'], 0, 'number') > 0) {
						if (s !== '') { s += '; '; }
						s += j + ': ' + o[j];
					}
				}
			}
			if (s) {
				this.set(['data',i,'weaponbonus'], s);
			} else {
				this.set(['data',i,'weaponbonus']);
			}

			skillcombo = ';' + (p.skills || '') + ';' + s + ';';

			// .att
			// .def
			// .own
			// .cost
			// .upkeep
			// .stats
			//   .att (effective attack if different from att)
			//   .def (effective defense if different from def)
			//   .att_when_att
			//   .def_when_att
			//   .invade
			//     .att
			//     .def
			//     .raid
			//   .duel
			//     .att
			//     .def
			//     .raid
			//   .war
			//     .att
			//     .def
			//   .monster
			//     .att
			//     .def
			//   .cost
			//   .cash

			all_stats = sum(skillcombo.regex(/\bAll Stats by ([-+]?\d*\.?\d+)\b/gi)) || 0;

			k = {};
			if ((o = skillcombo.regex(/\bEvery (\d+) ([^;]*?\w)(?:\s*Increase|\s*Decrease)?(?:\s+Player)? (Attack|Defense) by ([-+]?\d*\.?\d+)/i))) {
				k['p'+o[2].toLowerCase()] = Math.floor(o[3] * Math.floor(Town.get(['data',o[1],'own'], 0, 'number') / (o[0] || 1)));
			} else if ((o = skillcombo.regex(/\bEvery ([^;]*?\w)(?:\s*Increase|\s*Decrease)?(?:\s+Player)? (Attack|Defense) by ([-+]?\d*\.?\d+)/i))) {
				k['p'+o[1].toLowerCase()] = Math.floor(o[2] * Town.get(['data',o[0],'own'], 0, 'number'));
			}

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Attack\b|\bPlayer Attack by ([-+]\d+)\b|\bConvert ([-+]?\d*\.?\d+) Attack\b/gi))
			  + sum(p.skills.regex(/([-+]?\d*\.?\d+) Player Attack for every Hero Owned|/gi)) * ((this.runtime.heroes || 0) - 1)
			  + all_stats + (k.pattack || 0));
			this.set(['data',i,'stats','patt'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Player Defense|Player Defense by ([-+]?\d*\.?\d+)/gi))
			  + (sum(p.skills.regex(/\bPlayer Defense by ([-+]?\d*\.?\d+) for every 3 Health\b/gi)) * maxhealth / 3)
			  + sum(p.skills.regex(/([-+]?\d*\.?\d+) Player Defense for every Hero Owned/gi)) * ((this.runtime.heroes || 0) - 1)
			  + all_stats + (k.pdefense || 0));
			this.set(['data',i,'stats','pdef'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) [Aa]ttack [Tt]o [A-Z]/g))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Attack when[^;]*equipped\b/gi)));
			this.set(['data',i,'stats','att'], j ? j : undefined);

			j = Math.floor(sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense to\b/gi))
			  + sum(skillcombo.regex(/([-+]?\d*\.?\d+) Defense when[^;]*equipped\b/gi)));
			this.set(['data',i,'stats','def'], j ? j : undefined);

			j = ((p.att || 0)
			  + ((p.stats && p.stats.att) || 0)
			  + ((p.def || 0)
			  + ((p.stats && p.stats.def) || 0)) * 0.7).round(1);
			this.set(['data',i,'tot_att'], j ? j : undefined);
			this.set(['data',i,'stats','tot_att']);

			j = (((p.att || 0)
			  + ((p.stats && p.stats.att) || 0)) * 0.7
			  + (p.def || 0)
			  + ((p.stats && p.stats.def) || 0)).round(1);
			this.set(['data',i,'tot_def'], j ? j : undefined);
			this.set(['data',i,'stats','tot_def']);

			j = sum(skillcombo.regex(/([-+]?\d+) Monster attack\b/gi));
			this.set(['data',i,'stats','matt'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bPlayer Attack when Defending by ([-+]?\d+)\b|([-+]?\d+) Attack when attacked\b/gi));
			this.set(['data',i,'stats','patt_when_att'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bPlayer Defense when Defending by ([-+]?\d+)\b|([-+]?\d+) Defense when attacked\b/gi));
			this.set(['data',i,'stats','pdef_when_att'], j ? j : undefined);

			army = Math.min(armymax + nmax(0, skillcombo.regex(/\b(\d+) Army members?/gi)), nmax(0, skillcombo.regex(/\bArmy Limit to (\d+)\b/gi)) || 501);

			gen_att = getAttDef(data, listpush, 'att', 1 + Math.floor((army - 1) / 5));
			gen_def = getAttDef(data, listpush, 'def', 1 + Math.floor((army - 1) / 5));

			war_att = getAttDef(data, listpush, 'att', 6);
			war_def = getAttDef(data, listpush, 'def', 6);

			monster_multiplier = 1.1 + sum(skillcombo.regex(/([-+]?\d+)% Critical\b/gi))/100;

			// invade calcs

			j = Math.floor((invade.attack || 0) + gen_att +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + (((p.stats && p.stats.patt) || 0)
			  + pattack) * army)
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + (((p.stats && p.stats.pdef) || 0)
			  + pdefense) * army) * 0.7);
			this.set(['data',i,'stats','invade','att'], j ? j : undefined);

			j = Math.floor((invade.defend || 0) + gen_def +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0))
			  + pattack) * army) * 0.7
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0))
			  + pdefense) * army));
			this.set(['data',i,'stats','invade','def'], j ? j : undefined);

			// duel calcs

			j = Math.floor((duel.attack || 0) +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + pattack)
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + pdefense) * 0.7);
			this.set(['data',i,'stats','duel','att'], j ? j : undefined);

			j = Math.floor((duel.defend || 0) +
			  + ((p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0)
			  + pattack) * 0.7
			  + ((p.def || 0) + ((p.stats && p.stats.def) || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0)
			  + pdefense));
			this.set(['data',i,'stats','duel','def'], j ? j : undefined);

			// war calcs

			j = Math.floor((duel.attack || 0) + war_att
			  + (((p.stats && p.stats.patt) || 0)
			  + pattack)
			  + (((p.stats && p.stats.pdef) || 0)
			  + pdefense) * 0.7);
			this.set(['data',i,'stats','war','att'], j ? j : undefined);

			j = Math.floor((duel.defend || 0) + war_def
			  + (((p.stats && p.stats.patt) || 0)
			  + ((p.stats && p.stats.patt_when_att) || 0)
			  + pattack) * 0.7
			  + (((p.stats && p.stats.pdef) || 0)
			  + ((p.stats && p.stats.pdef_when_att) || 0)
			  + pdefense));
			this.set(['data',i,'stats','war','def'], j ? j : undefined);

			// monster calcs

			// not quite right, gear defense not counted on monster attack
			j = Math.floor(((duel.attack || 0) +
			  + (p.att || 0) + ((p.stats && p.stats.att) || 0)
			  + ((p.stats && p.stats.patt) || 0)
			  + pattack
			  + ((p.stats && p.stats.matt) || 0))
			  * monster_multiplier);
			this.set(['data',i,'stats','monster','att'], j ? j : undefined);

			// not quite right, gear attack not counted on monster defense
			j = Math.floor((duel.defend || 0) +
			  + ((p.stats && p.stats.def) || p.att || 0)
			  + ((p.stats && p.stats.pdef) || 0)
			  + pdefense
			  + ((p.stats && p.stats.mdef) || 0));
			this.set(['data',i,'stats','monster','def'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/Increase Power Attacks by (\d+)/gi));
			this.set(['runtime','multipliers',i], j ? j : undefined);

			j = sum(skillcombo.regex(/\bMax Energy by ([-+]?\d+)\b|([-+]?\d+) Max Energy\b/gi))
			  - (sum(skillcombo.regex(/\bTransfer (\d+)% Max Energy to\b/gi)) * Player.get('maxenergy') / 100).round(0)
			  + (sum(skillcombo.regex(/\bTransfer (\d+)% Max Stamina to Max Energy/gi)) * Player.get('maxstamina') / 100*2).round(0)
			  + all_stats;
			this.set(['data',i,'stats','maxenergy'], j ? j : undefined);

			j = sum(skillcombo.regex(/\bMax Stamina by ([-+]?\d+)|([-+]?\d+) Max Stamina/gi))
			  - (sum(skillcombo.regex(/Transfer (\d+)% Max Stamina to\b/gi)) * maxstamina / 100).round(0)
			  + (sum(skillcombo.regex(/Transfer (\d+)% Max Energy to Max Stamina/gi)) * maxenergy / 200).round(0)
			  + all_stats;
			this.set(['data',i,'stats','maxstamina'], j ? j : undefined);

			j = all_stats;
			this.set(['data',i,'stats','maxhealth'], j ? j : undefined);

			j = skillcombo.regex(/Bank Fee/gi) ? 100 : 0;
			this.set(['data',i,'stats','bank'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bBonus \$?(\d+) Gold\b/gi));
			this.set(['data',i,'stats','cash'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bDecreases? Soldier Cost by (\d+)%/gi));
			this.set(['data',i,'stats','cost'], j ? j : undefined);

			j = skillcombo.regex(/Extra Demi Points/gi) ? 5 : 0;
			this.set(['data',i,'stats','demi'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bIncrease Income by (\d+)\b/gi));
			this.set(['data',i,'stats','income'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/\bInfluence (\d+)% Faster\b/gi));
			this.set(['data',i,'stats','influence'], j ? j : undefined);

			j = nmax(0, skillcombo.regex(/Chance ([-+]?\d+)% Drops|\bitems from quests by (\d+)%/gi));
			this.set(['data',i,'stats','item'], j ? j : undefined);

			this.set(['runtime','armymax'], Math.max(army, this.runtime.armymax));
		}

		this.set('runtime.revision', revision);
	}

	if (bests || !this.runtime.best) {
		bests = {};
		list = {};

		for (i in this.data) {
			p = this.data[i];
			if (p.stats && p.own) {
				for (j in p.stats) {
					if (isNumber(p.stats[j])) {
						if ((bests[j] || -1e99) < p.stats[j]) {
							bests[j] = p.stats[j];
							list[j] = i;
						}
					} else if (isObject(p.stats[j])) {
						for (k in p.stats[j]) {
							if (isNumber(p.stats[j][k])) {
								o = j + '-' + k;
								if ((bests[o] || -1e99) < p.stats[j][k]) {
									bests[o] = p.stats[j][k];
									list[o] = i;
								}
							}
						}
					}
				}
				if (isNumber(p[j = 'priority'])) {
					if ((bests[j] || 1e99) > p[j]) {
						bests[j] = p[j];
						list[j] = i;
					}
				}
			}
		}

		this.set(['runtime','best']);
		for (i in bests) {
			this.set(['runtime','best',i], list[i]);
		}
	}

	return true;
};

Generals.to = function(name) {
	this._unflush();
	if (name) {
		name = this.best(name);
	}
	if (!name || Player.get('general') === name || name.toLowerCase() === 'any') {
		return true;
	}
	if (!this.data[name]) {
		log(LOG_WARN, 'General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!this.test(name)) {
		log(LOG_INFO, 'General rejected due to energy or stamina loss: ' + Player.get('general') + ' to ' + name);
		return true;
	}
	log(LOG_WARN, 'General change: ' + Player.get('general') + ' to ' + name);
	var id = this.get(['data',name,'id']), type = this.get(['data',name,'type']);
	Page.to('heroes_generals', isNumber(id) && isNumber(type) ? {item:id, itype:type} : null, true);
	return false;
};

Generals.test = function(name) {
	Generals._unflush();
	var next = isObject(name) ? name : Generals.data[name];
	if (name === 'any') {
		return true;
	} else if (!name || !next) {
		return false;
	} else {
		return (Player.get('maxstamina') + ((next.stats && next.stats.stamina) || 0) >= Player.get('stamina') && Player.get('maxenergy') + ((next.stats && next.stats.energy) || 0) >= Player.get('energy'));
	}
};

Generals.best = function(type) {
	var best = 'any', i;

	if (type && isString(type)) {

		if (this.get(['data',type,'own'])) {
			best = type;
		}

		if ((!best || best === 'any') && (i = this.get(['runtime','best',type]))) {
			if (this.get(['data',i,'own'])) {
				best = i;
			}
		}

		if (!best || best === 'any') {
			switch (type.toLowerCase().replace('_', '-')) {
			case 'stamina':
				i = this.get(['runtime','best','maxstamina']);
				break;
			case 'energy':
				i = this.get(['runtime','best','maxenergy']);
				break;
			case 'health':
				i = this.get(['runtime','best','maxhealth']);
				break;
			case 'raid-duel':
			case 'duel':
			case 'duel-attack':
				i = this.get(['runtime','best','duel-att']);
				break;
			case 'defend':
			case 'duel-defend':
				i = this.get(['runtime','best','duel-def']);
				break;
			case 'raid-invade':
			case 'invade':
			case 'invade-attack':
				i = this.get(['runtime','best','invade-att']);
				break;
			case 'invade-defend':
				i = this.get(['runtime','best','invade-def']);
				break;
			case 'war':
			case 'war-attack':
				i = this.get(['runtime','best','war-att']);
				break;
			case 'war-defend':
				i = this.get(['runtime','best','war-def']);
				break;
			case 'monster':
			case 'monster-attack':
				i = this.get(['runtime','best','monster-att']);
				break;
			case 'monster-defend':
			case 'dispell':
				i = this.get(['runtime','best','monster-def']);
				break;
			case 'under max level':
				i = this.get(['runtime','best','priority']);
				break;
			default:
				i = null;
				break;
			}

			if (i && this.get(['data',i,'own'])) {
				best = i;
			}
		}
	}

	return best;
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var self = this, i, j, o, p, data, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0,
		sorttype = [
			'img',
			'name',
			'level',
			'priority',
			'stats.invade.att',
			'stats.invade.def',
			'stats.duel.att',
			'stats.duel.def',
			'stats.monster.att',
			'stats.monster.def'
		];

	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
			this.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = this.runtime.sort || 1;
	}
	if (typeof rev === 'undefined'){
		rev = this.runtime.rev || false;
	}
	this.set('runtime.sort', sort);
	this.set('runtime.rev', rev);
	if (typeof sort !== 'undefined') {
		this.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort === 1) {
				aa = a;
				bb = b;
			} else if (sort === 3) {
				aa = self.get(['data',a,'priority'], self.get(['data',a,'charge'], 1e9, 'number'), 'number');
				bb = self.get(['data',b,'priority'], self.get(['data',b,'charge'], 1e9, 'number'), 'number');
			} else if ((i = sorttype[sort])) {
				aa = self.get(['data',a].concat(i.split('.')), 0, 'number');
				bb = self.get(['data',b].concat(i.split('.')), 0, 'number');
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
			}
			return (rev ? aa - bb : bb - aa);
		});
	}

	for (i in this.data) {
		p = this.get(['data',i,'stats']) || {};
		iatt = Math.max(iatt, this.get([p,'invade','att'], 1, 'number'));
		idef = Math.max(idef, this.get([p,'invade','def'], 1, 'number'));
		datt = Math.max(datt, this.get([p,'duel','att'], 1, 'number'));
		ddef = Math.max(ddef, this.get([p,'duel','def'], 1, 'number'));
		matt = Math.max(matt, this.get([p,'monster','att'], 1, 'number'));
		mdef = Math.max(mdef, this.get([p,'monster','def'], 1, 'number'));
	}

	th(output, '');
	th(output, 'General');
	th(output, 'Level');
	th(output, 'Rank /<br>Timer');
	th(output, 'Invade<br>Attack');
	th(output, 'Invade<br>Defend');
	th(output, 'Duel<br>Attack');
	th(output, 'Duel<br>Defend');
	th(output, 'Monster<br>Attack');
	th(output, 'Fortify<br>Dispel');

	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');

	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		p = this.get(['data',i]) || {};
		output = [];
		j = this.get([p, 'weaponbonus']);
		td(output, '<a class="golem-link" href="generals.php?item=' + p.id + '&itype=' + p.type + '"><img src="' + imagepath + p.img + '" style="width:25px;height:25px;" title="Skills: ' + this.get([p,'skills'], 'none') + (j ? '; Weapon Bonus: ' + j : '') + '"></a>');
		td(output, i);
		td(output, '<div'+(isNumber(p.progress) ? ' title="'+p.progress+'%"' : '')+'>'+p.level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(p.progress || 0)+'%;"></div></div>');
		td(output, p.priority ? ((p.priority !== 1 ? '<a class="golem-moveup" name='+p.priority+'>&uarr;</a> ' : '&nbsp;&nbsp; ') + p.priority + (p.priority !== this.runtime.max_priority ? ' <a class="golem-movedown" name='+p.priority+'>&darr;</a>' : ' &nbsp;&nbsp;'))
				: !this.get([p,'charge'],0)
				? '&nbsp;&nbsp; '
				: (this.get([p,'charge'],0) <= Date.now()
				? 'Now'
				: makeTime(this.get([p,'charge'],0), 'g:i a')));
		td(output, (j = this.get([p,'stats','invade','att'],0,'number')).addCommas(), (iatt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','invade','def'],0,'number')).addCommas(), (idef === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','duel','att'],0,'number')).addCommas(), (datt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','duel','def'],0,'number')).addCommas(), (ddef === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','monster','att'],0,'number')).addCommas(), (matt === j ? 'style="font-weight:bold;"' : ''));
		td(output, (j = this.get([p,'stats','monster','def'],0,'number')).addCommas(), (mdef === j ? 'style="font-weight:bold;"' : ''));
 		tr(list, output.join(''));
	}

	list.push('</tbody></table>');

	$('a.golem-moveup').live('click', function(event){
		var i, gdown, gup, x = parseInt($(this).attr('name'), 10);
		Generals._unflush();
		for(i in Generals.data){
			if (Generals.data[i].priority === x){
				gup = i;
			}
			if (Generals.data[i].priority === (x-1)){
				gdown = i;
			}
		}
		if (gdown && gup) {
			log('Priority: Swapping '+gup+' with '+gdown);
			Generals.set(['data',gdown,'priority'], Generals.data[gdown].priority + 1);
			Generals.set(['data',gup,'priority'], Generals.data[gup].priority - 1);
		}
//		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var i, gdown, gup, x = parseInt($(this).attr('name'), 10);
		Generals._unflush();
		for(i in Generals.data){
			if (Generals.data[i].priority === x){
				gdown = i;
			}
			if (Generals.data[i].priority === (x+1)) {
				gup = i;
			}
		}
		if (gdown && gup) {
			log('Priority: Swapping '+gup+' with '+gdown);
			Generals.set(['data',gdown,'priority'], Generals.data[gdown].priority + 1);
			Generals.set(['data',gup,'priority'], Generals.data[gup].priority - 1);
		}
//		Generals.dashboard(sort,rev);
		return false;
	});
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

// vi: ts=4
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift');
Gift.temp = null;

Gift.defaults['castle_age'] = {
	pages:'* facebook index army_invite army_gifts gift_accept'
};

Gift.data = {
	received: [],
	todo: {},
	gifts: {}
};

Gift.option = {
	type:'None'
};

Gift.runtime = {
	work:false,
	gift_waiting:false,
	gift_delay:0,
	gift_sent:0,
	sent_id:null,
	gift:{
		sender_id:null,
		sender_ca_name:null,
		sender_fb_name:null,
		name:null,
		id:null
	}
};

Gift.display = [
	{
		label:'Work in progress...'
	},{
		id:'type',
		label:'Return Gifts',
		select:['None', 'Random', 'Same as Received']
	}
];

Gift.init = function() {
	delete this.data.uid;
	delete this.data.lastgift;
	if (length(this.data.gifts)) {
		var i, gift_ids = [], random_gift_id;
		for (i in this.data.gifts) {
			gift_ids.push(i);
		}
		for (i in this.data.todo) {
			if (!(/\D/g).test(i)) {	// If we have an old entry
				random_gift_id = Math.floor(Math.random() * gift_ids.length);
				if (!this.data.todo[gift_ids[random_gift_id]]) {
					this.data.todo[gift_ids[random_gift_id]] = [];
				}
				this.data.todo[gift_ids[random_gift_id]].push(i);
				delete this.data.todo[i];
			}
		}
	}
};

Gift.parse = function(change) {
/*
	if (change) {
		if (change === 'facebook') {
			log(LOG_DEBUG, 'Facebook popup parsed...');
		}
		return false;
	}
*/
	var i, j, id, $tmp, gifts = this.data.gifts, todo = this.data.todo, received = this.data.received;
	//alert('Gift.parse running');
	if (Page.page === 'index') {
		// We need to get the image of the gift from the index page.
//		log(LOG_DEBUG, 'Checking for a waiting gift and getting the id of the gift.');
		if ($('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			this.runtime.gift.sender_ca_name = $('span.result_body').text().regex(/[\t\n]*(.+) has sent you a gift/i);
			this.runtime.gift.name = $('span.result_body').text().regex(/has sent you a gift:\s+(.+)!/i);
			this.runtime.gift.id = $('span.result_body img').attr('src').filepart();
			log(LOG_WARN, this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you. (' + this.runtime.gift.id + ')');
			this.runtime.gift_waiting = true;
			return true;
		} else if ($('span.result_body').text().indexOf('warrior wants to join your Army') >= 0) {
			this.runtime.gift.sender_ca_name = 'A Warrior';
			this.runtime.gift.name = 'Random Soldier';
			this.runtime.gift.id = 'random_soldier';
			log(LOG_WARN, this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you.');
			this.runtime.gift_waiting = true;
			return true;
		} else {
//			log(LOG_WARN, 'No more waiting gifts. Did we miss the gift accepted page?');
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
	} else if (Page.page === 'army_invite') {
		// Accepted gift first
//		log(LOG_WARN, 'Checking for accepted gift.');
		if (this.runtime.gift.sender_id) { // if we have already determined the ID of the sender
			if ($('div.game').text().indexOf('accepted the gift') >= 0 || $('div.game').text().indexOf('have been awarded the gift') >= 0) { // and we have just accepted a gift
				log('Accepted ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
				received.push(this.runtime.gift); // add the gift to our list of received gifts.  We will use this to clear facebook notifications and possibly return gifts
				this.runtime.work = true;	// We need to clear our facebook notifications and/or return gifts
				this.runtime.gift = {}; // reset our runtime gift tracker
			}
		}
		// Check for gifts
//		log(LOG_WARN, 'Checking for waiting gifts and getting the id of the sender if we already have the sender\'s name.');
		if ($('div.messages').text().indexOf('a gift') >= 0) { // This will trigger if there are gifts waiting
			this.runtime.gift_waiting = true;
			if (!this.runtime.gift.id) { // We haven't gotten the info from the index page yet.
				return false;	// let the work function send us to the index page to get the info.
			}
//			log(LOG_WARN, 'Sender Name: ' + $('div.messages img[title*="' + this.runtime.gift.sender_ca_name + '"]').first().attr('title'));
			this.runtime.gift.sender_id = $('div.messages img[uid]').first().attr('uid'); // get the ID of the gift sender. (The sender listed on the index page should always be the first sender listed on the army page.)
			if (this.runtime.gift.sender_id) {
				this.runtime.gift.sender_fb_name = $('div.messages img[uid]').first().attr('title');
//				log(LOG_WARN, 'Found ' + this.runtime.gift.sender_fb_name + "'s ID. (" + this.runtime.gift.sender_id + ')');
			} else {
				log("Can't find the gift sender's ID: " + this.runtime.gift.sender_id);
			}
		} else {
//			log('No more waiting gifts. Did we miss the gift accepted page?');
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
	
	} else if (Page.page === 'gift_accept'){
		// Check for sent
//		log('Checking for sent gifts.');
		if (this.runtime.sent_id && $('div#'+APPID_+'results_main_wrapper').text().indexOf('You have sent') >= 0) {
			log(gifts[this.runtime.sent_id].name+' sent.');
			for (j=todo[this.runtime.sent_id].length-1; j >= Math.max(todo[this.runtime.sent_id].length - 30, 0); j--) {	// Remove the IDs from the list because we have sent them
				todo[this.runtime.sent_id].pop();
			}
			if (!todo[this.runtime.sent_id].length) {
				delete todo[this.runtime.sent_id];
			}
			this.runtime.sent_id = null;
			if (!todo.length) {
				this.runtime.work = false;
			}
		}
		
	} else if (Page.page === 'army_gifts') { // Parse for the current available gifts
//		log('Parsing gifts.');
		gifts = this.data.gifts = {};
		// Gifts start at 1
		for (i=1, $tmp=[0]; $tmp.length; i++) {
			$tmp = $('#'+APPID_+'gift'+i);
			if ($tmp.length) {
				id = $('img', $tmp).attr('src').filepart();
				gifts[id] = {slot:i, name: $tmp.text().trim().replace('!','')};
//				log('Adding: '+gifts[id].name+' ('+id+') to slot '+i);
			}
		}
	} else {
		if ($('div.result').text().indexOf('have exceed') !== -1){
			log('We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
		}
	}
	return false;
};

Gift.update = function(event) {
	this.runtime.work = length(this.data.todo) > 0 || length(this.data.received) > 0;
};

Gift.work = function(state) {
	if (!this.runtime.gift_waiting && (!this.runtime.work || this.runtime.gift_delay > Date.now())) {
		if (state && !Page.to('index')) {	// Force us to another page before giving up focus - hopefully fix reload issues
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	if (!state) {                
		if (this.runtime.gift_waiting || this.runtime.work) {	// We need to get our waiting gift or return gifts.
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	if (!Generals.to(Idle.option.general)){
		return QUEUE_CONTINUE;
	}
	if(this.runtime.gift_waiting && !this.runtime.gift.id) {	// We have a gift waiting, but we don't know the id.
		if (!Page.to('index')) {	// Get the gift id from the index page.
			return QUEUE_CONTINUE;
		}
	}
	if(this.runtime.gift.id && !this.runtime.gift.sender_id) {	// We have a gift id, but no sender id.
		if (!Page.to('army_invite')) {	// Get the sender id from the army_invite page.
			return QUEUE_CONTINUE;
		}
	}
	if (this.runtime.gift.sender_id) { // We have the sender id so we can receive the gift.
		if (!Page.to('army_invite')) {
			return QUEUE_CONTINUE;
		}
//		log('Accepting ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
		if (!Page.to('army_invite', {act:'acpt', rqtp:'gift', uid:this.runtime.gift.sender_id}) || this.runtime.gift.sender_id.length > 0) {	// Shortcut to accept gifts without going through Facebook's confirmation page
			return QUEUE_CONTINUE;
		}
	}
	
	var i, j, k, todo = this.data.todo, received = this.data.received, gift_ids = [], random_gift_id, temptype;

	if (!received.length && (!length(todo) || (this.runtime.gift_delay > Date.now()))) {
		this.runtime.work = false;
		Page.to('keep_alchemy');
		return QUEUE_INTERRUPT_OK;
	}
	
	// We have received gifts so we need to figure out what to send back.
	if (received.length) {
		Page.to('army_gifts');
		// Fill out our todo list with gifts to send, or not.
		for (i = received.length - 1; i >= 0; i--){
			temptype = this.option.type;
			if (typeof this.data.gifts[received[i].id] === 'undefined' && this.option.type !== 'None') {
				log(received[i].id+' was not found in our sendable gift list.');
				temptype = 'Random';
			}
			switch(temptype) {
				case 'Random':
					if (length(this.data.gifts)) {
						gift_ids = [];
						for (j in this.data.gifts) {
							gift_ids.push(j);
						}
						random_gift_id = Math.floor(Math.random() * gift_ids.length);
						log('Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' to ' + received[i].sender_ca_name);
						if (!todo[gift_ids[random_gift_id]]) {
							todo[gift_ids[random_gift_id]] = [];
						}
						todo[gift_ids[random_gift_id]].push(received[i].sender_id);
					}
					this.runtime.work = true;
					break;
				case 'Same as Received':
					log('Will return a ' + received[i].name + ' to ' + received[i].sender_ca_name);
					if (!todo[received[i].id]) {
						todo[received[i].id] = [];
					}
					todo[received[i].id].push(received[i].sender_id);
					this.runtime.work = true;
					break;
				case 'None':// deliberate fallthrough
				default:
					this.runtime.work = false;	// Since we aren't returning gifts, we don't need to do any more work.
					break;
			}
			received.pop();
		}
		
		// Clear the facebook notifications and empty the received list.
/*		for (i in received) {
			// Go to the facebook page and click the "ignore" button for this entry
			
			// Then delete the entry from the received list.
			received.shift();
		}*/
		
	}
	
	if (this.runtime.gift_sent > Date.now()) {	// We have sent gift(s) and are waiting for the fb popup
//		log('Waiting for FB popup.');
		if ($('div.dialog_buttons input[name="sendit"]').length){
			this.runtime.gift_sent = null;
			Page.click('div.dialog_buttons input[name="sendit"]');
		} else if ($('span:contains("Out of requests")').text().indexOf('Out of requests') >= 0) {
			log('We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
			Page.click('div.dialog_buttons input[name="ok"]');
		}
		return QUEUE_CONTINUE;
	} else if (this.runtime.gift_sent) {
		this.runtime.gift_sent = null;
	}
	if ($('div.dialog_buttons input[name="skip_ci_btn"]').length) {     // Eventually skip additional requests dialog
		Page.click('div.dialog_buttons input[name="skip_ci_btn"]');
		return QUEUE_CONTINUE;
	}
	
	// Give some gifts back
	if (length(todo) && (!this.runtime.gift_delay || (this.runtime.gift_delay < Date.now()))) {
		for (i in todo) {
			if (typeof this.data.gifts[i] === 'undefined'){	// The gift we want to send has been removed from the game
				for (j in this.data.gifts){
					if (this.data.gifts[j].slot === 1){
						if (typeof todo[j] === 'undefined'){
							todo[j] = todo[i];
						} else {
							todo[j] = todo[j].concat(todo[i]);
						}
						delete todo[i];
						break;
					}
				}
				continue;
			}
//			if (!Page.to('army_gifts', {app_friends:'c', giftSelection:this.data.gifts[i].slot}, true)) {	// forcing the page to load to fix issues with gifting getting interrupted while waiting for the popup confirmation dialog box which then causes the script to never find the popup.  Should also speed up gifting.
// Need to deal with the fb requests some other way - possibly an extra parse() option...
			if (!Page.to('army_gifts', {app_friends:'c', giftSelection:this.data.gifts[i].slot})) {
				return QUEUE_CONTINUE;
			}
			if (typeof this.data.gifts[i] === 'undefined') {  // Unknown gift in todo list
				gift_ids = [];
				for (j in this.data.gifts) {
					gift_ids.push(j);
				}
				random_gift_id = Math.floor(Math.random() * gift_ids.length);
				log(LOG_WARN, 'Unavaliable gift ('+i+') found in todo list. Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' instead.');
				if (!todo[gift_ids[random_gift_id]]) {
					todo[gift_ids[random_gift_id]] = [];
				}
				for (j in todo[i]) {
					todo[gift_ids[random_gift_id]].push(todo[i][j]);
				}
				delete todo[i];
				return QUEUE_CONTINUE;
			}
			if ($('div[style*="giftpage_select"] div a[href*="giftSelection='+this.data.gifts[i].slot+'"]').length) {
				if ($('img[src*="gift_invite_castle_on"]').length){
					if ($('div.unselected_list').children().length) {
						log('Sending out ' + this.data.gifts[i].name);
						k = 0;
						for (j=todo[i].length-1; j>=0; j--) {
							if (k< 10) {	// Need to limit to 10 at a time
								if (!$('div.unselected_list input[value=\'' + todo[i][j] + '\']').length){
//									log('User '+todo[i][j]+' wasn\'t in the CA friend list.');
									continue;
								}
								Page.click('div.unselected_list input[value="' + todo[i][j] + '"]');
								k++;
							}
						}
						if (k === 0) {
							delete todo[i];
							return QUEUE_CONTINUE;
						}
						this.runtime.sent_id = i;
						this.runtime.gift_sent = Date.now() + (60000);	// wait max 60 seconds for the popup.
						Page.click('input[name="send"]');
						return QUEUE_CONTINUE;
					} else {
						return QUEUE_CONTINUE;
					}
				} else if ($('div.tabBtn img.imgButton[src*="gift_invite_castle_off"]').length) {
					Page.click('div.tabBtn img.imgButton[src*="gift_invite_castle_off"]');
					return QUEUE_CONTINUE;
				} else {
					return QUEUE_CONTINUE;
				}
			} else if ($('div[style*="giftpage_select"]').length) {
				Page.click('a[href*="giftSelection='+this.data.gifts[i].slot+'"]:parent');
				return QUEUE_CONTINUE;
			} else {
				return QUEUE_CONTINUE;
			}
		}
	}
	
	return QUEUE_FINISH;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
var Heal = new Worker('Heal');
Heal.data = Heal.temp = null;

Heal.settings = {
	taint:true
};

Heal.defaults['castle_age'] = {};

Heal.option = {
	stamina: 0,
	health: 0
};

Heal.display = [
	{
		id:'stamina',
		label:'Heal Above',
		after:'stamina',
		select:'stamina'
	},{
		id:'health',
		label:'...And Below',
		after:'health',
		select:'health'
	}
];

Heal.init = function() {
	this._watch(Player, 'data.health');
	this._watch(Player, 'data.maxhealth');
	this._watch(Player, 'data.stamina');
};

Heal.update = function(event) {
	var health = Player.get('health', -1);
	this.set(['option','_sleep'], health >= Player.get('maxhealth') || Player.get('stamina') < this.option.stamina || health >= this.option.health);
};

Heal.work = function(state) {
	if (!state || this.me()) {
		return true;
	}
	return false;
};

Heal.me = function() {
	if (!Page.to('keep_stats')) {
		return true;
	}
	if ($('input[value="Heal Wounds"]').length) {
		log(LOG_INFO, 'Healing...');
		Page.click('input[value="Heal Wounds"]');
	} else {
		log(LOG_WARN, 'Unable to heal!');
//		this.set(['option','_disabled'], true);
	}
	return false;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.temp = Idle.data = null;

Idle.defaults['castle_age'] = {};

Idle.settings ={
	after:['LevelUp'],
	taint:true
};

Idle.option = {
	general:'any',
	index:86400000,
	generals:604800000,
	alchemy:86400000,
	quests:0,
	town:0,
	keep:0,
//	arena:0,
	battle:900000,
	guild:0,
	festival:0,
	monsters:3600000
//	collect:0
};

Idle.when = {
	0:			'Never',
	60000:		'Every Minute',
	900000:		'Quarter Hour',
	1800000:	'Half Hour',
	3600000:	'Every Hour',
	7200000:	'2 Hours',
	21600000:	'6 Hours',
	43200000:	'12 Hours',
	86400000:	'Daily',
	604800000:	'Weekly',
	1209600000:	'2 Weeks',
	2592000000:	'Monthly'
};

Idle.display = [
	{
		label:'<strong>NOTE:</strong> This worker will <strong>not</strong> release control!<br>Use this for disabling workers you do not use.'
	},{
		id:'general',
		label:'Idle General',
		select:'generals'
	},{
		title:'Check Pages',
		group:[
			{
				id:'index',
				label:'Home Page',
				select:Idle.when
			},{
				id:'generals',
				label:'Generals',
				select:Idle.when
			},{
				id:'alchemy',
				label:'Alchemy',
				select:Idle.when
			},{
				id:'quests',
				label:'Quests',
				select:Idle.when
			},{
				id:'town',
				label:'Town',
				select:Idle.when
			},{
				id:'keep',
				label:'Keep',
				select:Idle.when
		//	},{
		//		id:'arena',
		//		label:'Arena',
		//		select:Idle.when
			},{
				id:'battle',
				label:'Battle',
				select:Idle.when
			},{
				id:'monsters',
				label:'Monsters',
				select:Idle.when
			},{
				id:'guild',
				label:'Guild',
				select:Idle.when
			},{
				id:'festival',
				label:'Festival',
				select:Idle.when
		//	},{
		//		id:'collect',
		//		label:'Apprentice Reward',
		//		select:Idle.when
			}
		]
	}
];

Idle.pages = {
	index:['index'],
	generals:['heroes_heroes', 'heroes_generals'],
	alchemy:['keep_alchemy'],
	quests:[
		'quests_quest1',
		'quests_quest2',
		'quests_quest3',
		'quests_quest4',
		'quests_quest5',
		'quests_quest6',
		'quests_quest7',
		'quests_quest8',
		'quests_quest9',
		'quests_quest10',
		'quests_quest11',
		'quests_quest12',
		'quests_quest13',
		'quests_demiquests',
		'quests_atlantis'
	],
	town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
	keep:['keep_stats'],
//	arena:['battle_arena'],
	battle:['battle_battle'],
	guild:['battle_guild'],
	festival:['festival_guild'],
	monsters:['monster_monster_list', 'battle_raid', 'festival_monster_list']
//	collect:['apprentice_collect']
};

Idle.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general === 'under level 4') {
		this.set('option.general', 'under max level');
	}
	// END
};

Idle.work = function(state) {
	var now = Date.now(), i, j, p;

	if (!state) {
		return true;
	}

	// handle the generals tour first, to avoid thrashing with the Idle general
	if (this.option[i = 'generals'] && (p = Generals.get('data'))) {
		for (j in p) {
			if (p[j] && p[j].own && (p[j].seen || 0) + this.option[i] <= now) {
				if (Generals.to(j) === null) {
					// if we can't change the general now due to stats or error
					// just add an hour to the last seen time and try later
					Generals.set(['data',j,seen], Math.range((p[j].seen || 0), now + 3600000 - this.option[i], now));
				}
				return true;
			}
		}
	}

	if (!Generals.to(this.option.general)) {
		return true;
	}

	for (i in this.pages) {
		if (this.option[i]) {
			for (p=0; p<this.pages[i].length; p++) {
				if (Page.isStale(this.pages[i][p], now - this.option[i]) && (!Page.to(this.pages[i][p]))) {
					return true;
				}
			}
		}
	}

	return true;
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
var Income = new Worker('Income');
Income.data = Income.runtime = null;

Income.settings = {
	important:true,
	taint:true
};

Income.defaults['castle_age'] = {};

Income.option = {
	general:true,
	bank:true,
	margin:45
};

Income.temp = {
	income:false,
	bank:false
};

Income.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	},{
		advanced:true,
		id:'margin',
		label:'Safety Margin',
		select:[15,30,45,60],
		suffix:'seconds'
	}
];

Income.init = function(event) {
	this._watch(Player, 'data.cash_time');
};

Income.update = function(event) {
	var when = Player.get('cash_timer', 9999) - this.option.margin;
	if (when > 0) {
		this._remind(when, 'income');
	}
	if ((this.set(['temp','income'], when <= 0))) {
		this.set(['temp','bank'], true);
	}
	Dashboard.status(this, makeImage('gold') + '$' + (Player.get('income', 0) + History.get('income.average.24')).round(0).addCommas() + ' per hour (currently ' + makeImage('gold') + '$' + Player.get('income', 0).addCommas() + ' from land)');
	this.set(['option','_sleep'], !(this.option.general && this.temp.income) && !(this.option.bank && this.temp.bank));
};

Income.work = function(state) {
	if (state) {
		if (this.temp.income) {
			if (Generals.to('income')) {
				log(LOG_INFO, 'Waiting for Income... (' + Player.get('cash_timer') + ' seconds)');
			}
		} else if (this.temp.bank) {
			if (!Bank.stash()) {
				log(LOG_INFO, 'Banking Income...');
			} else {
				this.set(['temp','bank'], false);
			}
		}
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land');
Land.temp = null;

Land.settings = {
	taint: true
};

Land.defaults['castle_age'] = {
	pages:'town_land keep_stats'
};

Land.option = {
	enabled:true,
//	wait:48,
	onlyten:false,
	sell:false,
	land_exp:false,
	style:0
};

Land.runtime = {
	lastlevel:0,
	best:null,
	buy:0,
	cost:0,
	snooze:0
};

Land.display = [
	{
		id:'enabled',
		label:'Auto-Buy Land',
		checkbox:true
	},{
		id:'save_ahead',
		label:'Save for future Land',
		checkbox:true
	},{
		advanced:true,
		id:'sell',
		label:'Sell Extra Land',
		checkbox:true,
		help:'You can sell land above your Max at full price.'
	},{
		exploit:true,
		id:'land_exp',
		label:'Sell Extra Land 10 at a time',
		checkbox:true,
		help:'If you have extra lands, this will sell 10x.  The extra sold lands will be repurchased at a lower cost.'
	},{
		id:'style',
		label:'ROI Style',
		select:{0:'Percent', 1:'Daily'},
		help:'This changes the display when visiting the LanD page.'
	}
/*
	},{
		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours',
		help:'There has been a lot of testing in this code, it is the fastest way to increase your income despite appearances!'
	},{
		advanced:true,
		id:'onlyten',
		label:'Only buy 10x<br>NOTE: This is slower!!!',
		checkbox:true,
		help:'The standard method is guaranteed to be the most efficient.  Choosing this option will slow down your income.'
	}
*/
];

Land.setup = function(old_revision) {
	// BEGIN one time pre-r959 fix for bad land name "name"
	if (old_revision < 959) {
		if (this.data && this.data.name) {
			delete this.data.name;
		}
	}
	// END
	// BEGIN Remove old internal revision storage
	if (old_revision <= 1110) {
		this.set(['runtime','revision']);
	}
	// END
	Resources.use('Gold');
};

Land.init = function() {
	for (var i in this.data) {
		if (!this.data[i].id || !this.data[i].cost || isNumber(this.data[i].buy) || isNumber(this.data[i].sell)) {
			// force an initial visit if anything important is missing
			Page.set('town_land', 0);
			break;
		}
	}

	this._watch(Player, 'data.level');		// watch for level ups
	this._watch(Player, 'data.worth');		// watch for bank increases
	this._watch(Bank, 'option.keep');		// Watch for changing available amount
	this._watch(Page, 'data.town_land');	// watch for land triggers
};

Land.parse = function(change) {
	var i, tmp, name, txt, modify = false;

	if (Page.page === 'town_land') {
		$('div[style*="town_land_bar."],div[style*="town_land_bar_special."]').each(function(a, el) {
			if ((name = $('div img[alt]', el).attr('alt').trim())) {
				if (!change) {
					try {
						var txt = $(el).text().replace(/[,\s]+/g, '');
						Land._transaction(); // BEGIN TRANSACTION
						assert(Land.set(['data',name,'max'], txt.regex(/yourlevel:(\d+)/i), 'number'), 'Bad maximum: '+name);
						assert(Land.set(['data',name,'income'], txt.regex(/Income:\$(\d+)/), 'number'), 'Bad income: '+name);
						assert(Land.set(['data',name,'cost'], txt.regex(/Income:\$\d+\$(\d+)/), 'number'), 'Bad cost: '+name);
						assert(Land.set(['data',name,'own'], $('span:contains("Owned:")', el).text().replace(/[,\s]+/g, '').regex(/Owned:(\d+)/i), 'number'), 'Bad own count: '+name);
//						Land.set(['data',name,'id']);
						Land.set(['data',name,'buy']);
						if ((tmp = $('form[id*="_prop_"]', el)).length) {
							Land.set(['data',name,'id'], tmp.attr('id').regex(/_prop_(\d+)/i), 'number');
							$('select[name="amount"] option', tmp).each(function(b, el) {
								Land.push(['data',name,'buy'], parseFloat($(el).val()), 'number')
							});
						}
						Land.set(['data',name,'sell']);
						if ((tmp = $('form[id*="_propsell_"]', el)).length) {
							Land.set(['data',name,'id'], tmp.attr('id').regex(/_propsell_(\d+)/i), 'number');
							$('select[name="amount"] option', tmp).each(function(b, el) {
								Land.push(['data',name,'sell'], parseFloat($(el).val()), 'number')
							})
						}
						Land._transaction(true); // COMMIT TRANSACTION
					} catch(e) {
						Land._transaction(false); // ROLLBACK TRANSACTION on any error
						log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
					}
				} else if (Land.data[name]) {
					$('strong:first', el).after(' (<span title="Return On Investment - higher is better"><strong>ROI</strong>: ' + ((Land.data[name].income * 100 * (Land.option.style ? 24 : 1)) / Land.data[name].cost).round(3) + '%' + (Land.option.style ? ' / Day' : '') + '</span>)');
				}
			}
			modify = true;
		});
	} else if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			$('.statsTTitle:contains("LAND") + .statsTMain .statUnit').each(function(a, el) {
				var tmp = $('a img[src]', el), name = ($(tmp).attr('alt') || '').trim(), i = $(el).text().regex(/\bX\s*(\d+)\b/i);
				if (!Land.data[name]) {
					Page.set(['data','town_land'], 0);
				} else if (Land.data[name].own !== i) {
					Land.set(['data', name, 'own'], i);
				}
			});
		}
	}

	return modify;
};

Land.update = function(event, events) {
	var i, j, k, worth = Bank.worth(), income = Player.get('income', 0) + History.get('income.mean'), level = Player.get('level', 0), best, i_cost, b_cost, buy = 0, cost_increase, time_limit;
	
	if (event.type === 'option' && this.option.land_exp) {
		this.set(['option','sell'], true);
	}
	
	k = 0;
	if (this.option.save_ahead && this.option.enabled) {
		for (i in this.data) {
			if ((this.data[i].max || 0) > 0 && (this.data[i].own || 0) >= this.data[i].max) {
				j = Math.min(10, Math.max(0, this.data[i].max + 10 - this.data[i].own));
				k += j * (this.data[i].cost || 0);
			}
		}
	}
	this.set(['runtime', 'save_amount'], k);

	// don't sell into future buffer if save ahead is enabled
	k = this.option.save_ahead && !this.option.land_exp ? 10 : 0;
	for (i in this.data) {
		if (this.option.sell && this.data[i].sell.length && (this.data[i].max || 0) > 0 && (this.data[i].own || 0) > this.data[i].max + k) {
			best = i;
			buy = this.data[i].max + k - this.data[i].own;// Negative number means sell
			if (this.option.land_exp) {
				buy = -this.data[i].sell[this.data[i].sell.length - 1];
			}
			break;
		}

		if ((income || 0) > 0 && this.data[i].buy && this.data[i].buy.length) {
			b_cost = best ? (this.data[best].cost || 0) : 1e99;
			i_cost = (this.data[i].cost || 0);
			if (!best || ((b_cost / income) + (i_cost / (income + this.data[best].income))) > ((i_cost / income) + (b_cost / (income + this.data[i].income)))) {
				best = i;
			}
		}
	}

	this.set(['runtime','best'], null);
	this.set(['runtime','buy'], 0);
	this.set(['runtime','cost'], 0);

	if (best) {
		if (!buy) {
			//	This calculates the perfect time to switch the amounts to buy.
			//	If the added income from a smaller purchase will pay for the increase in price before you can afford to buy again, buy small.
			//	In other words, make the smallest purchase where the time to make the purchase is larger than the time to payoff the increased cost with the extra income.
			//	It's different for each land because each land has a different "time to payoff the increased cost".
			
			cost_increase = this.data[best].cost / (10 + this.data[best].own);		// Increased cost per purchased land.  (Calculated from the current price and the quantity owned, knowing that the price increases by 10% of the original price per purchase.)
			time_limit = cost_increase / this.data[best].income;		// How long it will take to payoff the increased cost with only the extra income from the purchase.  (This is constant per property no matter how many are owned.)
			time_limit = time_limit * 1.5;		// fudge factor to take into account that most of the time we won't be buying the same property twice in a row, so we will have a bit more time to recoup the extra costs.
//			if (this.option.onlyten || (this.data[best].cost * 10) <= worth) {}			// If we can afford 10, buy 10.  (Or if people want to only buy 10.)
			if ((this.data[best].cost * 10) <= worth) {			// If we can afford 10, buy 10.
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			} else if (this.data[best].cost / income > time_limit){		// If it will take longer to save for 1 land than it will take to payoff the increased cost, buy 1.
				buy = 1;
			} else if (this.data[best].cost * 5 / income > time_limit){	// If it will take longer to save for 5 lands than it will take to payoff the increased cost, buy 5.
				buy = Math.min(this.data[best].max - this.data[best].own, 5);
			} else {																	// Otherwise buy 10 because that's the max.
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			}
		}

		k = buy * this.data[best].cost; // May be negative if we're making money by selling
		if ((buy > 0 && this.option.enabled) || (buy < 0 && this.option.sell)) {
			this.set(['runtime','best'], best);
			this.set(['runtime','buy'], buy);
			this.set(['runtime','cost'], k);
		}
	}

	if (best && buy) {
		Dashboard.status(this, (buy > 0 ? (this.runtime.buy ? 'Buying ' : 'Want to buy ') : (this.runtime.buy ? 'Selling ' : 'Want to sell ')) + Math.abs(buy) + 'x ' + best + ' for $' + Math.abs(k).SI() + ' (Available Cash: $' + worth.SI() + ')');
	} else if (this.option.save_ahead && this.runtime.save_amount) {
		if (worth >= this.runtime.save_amount) {
			Dashboard.status(this, 'Saved $' + this.runtime.save_amount.SI() + ' for future land.');
		} else {
			Dashboard.status(this, 'Saved $' + worth.SI() + ' of $' + this.runtime.save_amount.SI() + ' for future land.');
		}
	} else {
		Dashboard.status(this, 'Nothing to do.');
	}

	this.set(['option','_sleep'],
		level === this.runtime.lastlevel
		&& (Page.get('town_land') || 0) > 0
		&& (!this.runtime.best
			|| !this.runtime.buy
			|| worth < this.runtime.cost
			|| this.runtime.snooze > Date.now()));
};

Land.work = function(state) {
	var o, q;
	if (!state) {
		return QUEUE_CONTINUE;
	} else if (this.runtime.cost > 0 && !Bank.retrieve(this.runtime.cost)) {
		return QUEUE_CONTINUE;
	} else if (!Page.to('town_land')) {
		return QUEUE_CONTINUE;
	} else {
		this.set('runtime.lastlevel', Player.get('level'));
		if (this.runtime.buy < 0) {
			if (!(o = $('form#app'+APPID+'_propsell_'+this.data[this.runtime.best].id)).length) {
				log(LOG_WARN, 'Can\'t find Land sell form for',
				  this.runtime.best,
				  'id[' + this.data[this.runtime.best].id + ']');
				this.set('runtime.snooze', Date.now() + 60000);
				this._remind(60.1, 'sell_land');
				return QUEUE_RELEASE;
			} else {
				q = this.data[this.runtime.best].sell.lower(Math.abs(this.runtime.buy));
				log(LOG_INFO, 'Selling ' + q + '/' + Math.abs(this.runtime.buy) + ' x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI());
				$('select[name="amount"]', o).val(q);
				Page.click($('input[name="Sell"]', o));
				return QUEUE_CONTINUE;
			}
		} else if (this.runtime.buy > 0) {
			if (!(o = $('form#app'+APPID+'_prop_'+this.data[this.runtime.best].id)).length) {
				log(LOG_WARN, 'Can\'t find Land buy form for ' + this.runtime.best + ' id[' + this.data[this.runtime.best].id + ']');
				this.set('runtime.snooze', Date.now() + 60000);
				this._remind(60.1, 'buy_land');
				return QUEUE_RELEASE;
			} else {
				q = this.data[this.runtime.best].buy.higher(this.runtime.buy);
				log(LOG_INFO, 'Buying ' + q + '/' + this.runtime.buy + ' x ' + this.runtime.best + ' for $' + Math.abs(this.runtime.cost).SI());
				$('select[name="amount"]', o).val(q);
				Page.click($('input[name="Buy"]', o));
				return QUEUE_CONTINUE;
			}
		}
	}

	return QUEUE_RELEASE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, Heal, Income, LevelUp:true, Monster, Player, Quest,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, calc_rolling_weighted_average
*/
/********** Worker.LevelUp **********
* Will give us a quicker level-up, optionally changing the general to gain extra stats
* 1. Switches generals to specified general
* 2. Changes the best Quest to the one that will get the most exp (rinse and repeat until no energy left) - and set Queue.burn.energy to max available
* 3. Will call Heal.me() function if current health is under 10 and there is any stamina available (So Battle/Arena/Monster can automatically use up the stamina.)
*/

var LevelUp = new Worker('LevelUp');
LevelUp.data = LevelUp.temp = null;

LevelUp.settings = {
	before:['Idle','Battle','Monster','Quest']
};

LevelUp.defaults['castle_age'] = {
	pages:'*'
};

LevelUp.option = {
	income:true,
	bank:true,
	general:'any',
	general_choice:'any',
	order:'stamina',
	algorithm:'Per Action',
	override:false
};

LevelUp.runtime = {
	heal_me:false,// we're active and want healing...
	last_energy:'quest',
	last_stamina:'attack',
	exp:0,
	exp_possible:0,
	avg_exp_per_energy:1.4,
	avg_exp_per_stamina:2.4,
	quests:[], // quests[energy] = [experience, [quest1, quest2, quest3]]
// Old Queue.runtime stuff
	quest: false, // Use for name of quest if over-riding quest
	general: false, // If necessary to specify a multiple general for attack
	action: false, // Level up action
	stamina:0, //How much stamina can be used by workers
	energy:0, //How much energy can be used by workers
	// Force is TRUE when energy/stamina is at max or needed to burn to level up,
	// used to tell workers to do anything necessary to use energy/stamina
	force: {
		energy:false,
		stamina:false
	}
};

LevelUp.display = [
	{
		title:'Important!',
		label:'This will spend Energy and Stamina to force you to level up quicker.'
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina', 'Manual'],
		help:'Select which type of general to use when leveling up.'
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'general=="Manual"',
		select:'generals'
	},{
		id:'order',
		label:'Spend first ',
		select:['Energy','Stamina'],
		help:'Select which resource you want to spend first when leveling up.'
	},{
		id:'algorithm',
		label:'Estimation Method',
		select:['Per Action', 'Per Hour', 'Manual'],
		help:"'Per Hour' uses your gain per hour. 'Per Action' uses your gain per action."
	},{
		id:'manual_exp_per_stamina',
		label:'Exp per stamina',
		require:'algorithm=="Manual"',
		text:true,
		help:'Experience per stamina point. Defaults to Per Action if 0 or blank.'
	},{
		id:'manual_exp_per_energy',
		label:'Exp per energy',
		require:'algorithm=="Manual"',
		text:true,
		help:'Experience per energy point. Defaults to Per Action if 0 or blank.'
	},{
		id:'override',
		label:'Override Monster<br>Avoid Lost-cause Option',
		checkbox:true,
		help:'Overrides Avoid Lost-cause Monster setting allowing LevelUp to burn stamina on behind monsters.'
	}
];

LevelUp.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END
	this._watch(Player, 'data.health');
	this._watch(Player, 'data.exp');
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.stamina');
	this._watch(Resources, 'option.reserve');
	this._watch(Quest, 'runtime.best');
	this._watch(this, 'runtime.force.energy');
	this._watch(this, 'runtime.force.stamina');
	this.runtime.exp = this.runtime.exp || Player.get('exp', 0); // Make sure we have a default...
};

LevelUp.parse = function(change) {
	if (change) {

//		$('#'+APPID_+'st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + this.get('exp_average').round(1).addCommas() + ' per hour').html(Player.get('exp_needed').addCommas() + '<span style="font-weight:normal;"><span style="color:rgb(25,123,48);" name="' + this.get('level_timer') + '"> ' + this.get('time') + '</span></span>');
		$('#'+APPID_+'st_2_5 strong').html('<span title="' + Player.get('exp', 0) + '/' + Player.get('maxexp', 1) + ' at ' + this.get('exp_average').round(1).addCommas() + ' per hour">' + Player.get('exp_needed', 0).addCommas() + '</span> <span style="font-weight:normal;color:rgb(25,123,48);" title="' + this.get('timer') + '">' + this.get('time') + '</span>');
	} else {
		$('.result_body').each(function(i,el){
			if (!$('img[src$="battle_victory.gif"]', el).length) {
				return;
			}
			var txt = $(el).text().replace(/,|\t/g, ''), x;
			x = txt.regex(/([+-]\d+) Experience/i);
			if (x) { History.add('exp+battle', x); }
			x = (txt.regex(/\+\$(\d+)/i) || 0) - (txt.regex(/\-\$(\d+)/i) || 0);
			if (x) { History.add('income+battle', x); }
			x = txt.regex(/([+-]\d+) Battle Points/i);
			if (x) { History.add('bp+battle', x); }
			x = txt.regex(/([+-]\d+) Stamina/i);
			if (x) { History.add('stamina+battle', x); }
			x = txt.regex(/([+-]\d+) Energy/i);
			if (x) { History.add('energy+battle', x); }
		});
	}
	return true;
};

LevelUp.update = function(event, events) {
	var i, energy = Player.get('energy',0), stamina = Player.get('stamina',0), exp = Player.get('exp',0);
	if (events.findEvent(this, 'watch', 'runtime.force.energy') && this.get(['runtime','force','energy'])) {
		log(LOG_INFO, 'At max energy, burning...');
	}
	if (events.findEvent(this, 'watch', 'runtime.force.stamina') && this.get(['runtime','force','stamina'])) {
		log(LOG_INFO, 'At max stamina, burning...');
	}
	if (this.option._disabled) {
		this.set(['runtime','running'], false);
		this.set(['runtime','force','energy'], false);
		this.set(['runtime','force','stamina'], false);
	} else if (events.findEvent('Player')) {
		// Check if stamina/energy is maxed and should be forced
		this.set(['runtime','force','energy'], energy >= Player.get('maxenergy',0));
		this.set(['runtime','force','stamina'], stamina >= Player.get('maxstamina',0));
		// Preserve independence of queue system worker by putting exception code into CA workers
		for (i in Workers) {
			if ((worker = Workers[i]) && isFunction(worker.resource) && !worker.get(['option', '_disabled'], false) && (stat = worker.resource())) { // && !worker.get(['option', '_sleep'], false)
				if (stat === 'energy') {
					this.set(['runtime','force','energy'], true);
				} else if (stat === 'stamina') {
					this.set(['runtime','force','stamina'], true);
				}
			}
		}
	}
	if (events.findEvent('Player') || !length(this.runtime.quests)) {
		if (exp > this.runtime.exp && $('span.result_body:contains("xperience")').length) {
			// Experience has increased...
			if (this.runtime.stamina > stamina) {
				this.set(['runtime','last_stamina'], (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'attack' : 'battle');
				calc_rolling_weighted_average(this.runtime, 'exp', exp - this.runtime.exp, 'stamina', this.runtime.stamina - stamina);
			}
			if (this.runtime.energy > energy) {
				this.set(['runtime','last_energy'], (Page.page === 'keep_monster_active' || Page.page === 'monster_battle_monster') ? 'defend' : 'quest');
				// Only need average for monster defense. Quest average is known.
				if (this.runtime.last_energy === 'defend') {
					calc_rolling_weighted_average(this.runtime, 'exp', exp - this.runtime.exp, 'energy', this.runtime.energy - energy);
				}
			}
		}
	}
	this.set(['runtime','energy'], Math.max(0, energy - (this.runtime.force.energy ? 0 : Resources.get(['option','reserve','Energy'], 0))));
	this.set(['runtime','stamina'], Math.max(0, stamina - (this.runtime.force.stamina ? 0 : Resources.get(['option','reserve','Stamina'], 0))));
	this.set(['runtime','exp'], exp);
	this.set(['runtime','heal_me'], !this.option._disabled && this.runtime.stamina && this.runtime.force.stamina && Player.get('health') < 13);
	//log(LOG_DEBUG, 'next action ' + LevelUp.findAction('best', energy, stamina, Player.get('exp_needed')).exp + ' big ' + LevelUp.findAction('big', energy, stamina, Player.get('exp_needed')).exp);
	if (this.runtime.running) {
		Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Hour: ' + this.get('exp_average').round(1).addCommas() + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">LevelUp Running Now!</span>');
	} else {
		Dashboard.status(this, '<span title="Exp Possible: ' + this.get('exp_possible') + ', per Energy: ' + this.get('exp_per_energy').round(2) + ', per Stamina: ' + this.get('exp_per_stamina').round(2) + '">' + this.get('time') + ' after ' +
			Page.addTimer('levelup', this.get('level_time')) + ' (' + makeImage('exp') + this.get('exp_average').round(1).addCommas() + ' per hour) (refills: ' +
			makeTimer((this.get('refill_energy') - Date.now()) / 1000) + ' per energy, ' +
			makeTimer((this.get('refill_stamina') - Date.now()) / 1000) + ' per stamina)</span>');
	}
	this.set(['option','_sleep'], !this.runtime.running || !this.runtime.heal_me);
	return true;
};

LevelUp.work = function(state) {
	Generals.set('runtime.disabled', false);
	if (!state || Heal.me()) {
		return QUEUE_CONTINUE;
	}
/*
	if (this.runtime.action && this.runtime.action.big) {
		Generals.set('runtime.disabled', false);
		if (Generals.to(this.option.general)) {
			//log('Disabling Generals because next action will level.');
			Generals.set('runtime.disabled', true);	// Lock the General again so we can level up.
		} else {
			return QUEUE_CONTINUE;	// Try to change generals again
		}
	}
*/
	return QUEUE_FINISH;
};

LevelUp.get = function(what,def) {
	switch(what) {
	case 'timer':		return makeTimer(this.get('level_timer'));
	case 'time':		return (new Date(this.get('level_time'))).format('D g:i a');
	case 'level_timer':	return Math.floor((this.get('level_time') - Date.now()) / 1000);
	case 'level_time':	return Date.now() + Math.floor(3600000 * ((Player.get('exp_needed', 0) - this.get('exp_possible')) / (this.get('exp_average') || 10)));
	case 'refill_energy':	return Date.now() + Math.floor(3600000 * ((Math.min(Player.get('maxenergy',0),2000) * this.get('exp_per_energy')) / (this.get('exp_average') || 10)));
	case 'refill_stamina':	return Date.now() + Math.floor(3600000 * ((Math.min(Player.get('maxstamina',0),1000) * this.get('exp_per_stamina')) / (this.get('exp_average') || 10)));
	case 'exp_average':
		if (this.option.algorithm === 'Per Hour') {
			return History.get('exp.average.change');
		}
		return (12 * (this.get('exp_per_stamina') + this.get('exp_per_energy'))).round(1);
	case 'exp_possible':
		return (Player.get('stamina', 0)*this.get('exp_per_stamina')
				+ Player.get('energy', 0) * this.get('exp_per_energy')).round(1);
	case 'exp_per_stamina':
		if (this.option.algorithm === 'Manual' && this.option.manual_exp_per_stamina) {
			return this.option.manual_exp_per_stamina.round(1);
		}
		return this.runtime.avg_exp_per_stamina.round(1);
	case 'exp_per_energy':
		if (this.option.algorithm === 'Manual' && this.option.manual_exp_per_energy) {
			return this.option.manual_exp_per_energy.round(1);
		}
		return ((this.runtime.defending || !Quest.get('runtime.best',false))
				? this.runtime.avg_exp_per_energy
				: (Quest.get(['id', Quest.get('runtime.best'), 'exp']) || 0) /
					(Quest.get(['id', Quest.get('runtime.best'), 'energy']) || 1)).round(1);
	default: return this._get(what,def);
	}
};

LevelUp.findAction = function(mode, energy, stamina, exp) {
	var options =[], i, check, quests, monsters, big, multiples, general = false, basehit, max, raid = false, defendAction, monsterAction, energyAction, staminaAction, questAction, stat = null, value = null, nothing = {stamina:0,energy:0,exp:0};
	defendAction = monsterAction = staminaAction = energyAction = questAction = 0;
	switch(mode) {
	case 'best':
		// Find the biggest exp quest or stamina return to push unusable exp into next level
		big = this.findAction('big',energy,stamina,0);
		if (this.option.order === 'Energy') {
			check = this.findAction('energy',energy-big.energy,0,exp);
			//log(LOG_WARN, ' levelup quest ' + energy + ' ' + exp);
			//log(LOG_WARN, 'this.runtime.last_energy ' + this.runtime.last_energy + ' checkexp ' + check.exp +' quest ' + check.quest);
			// Do energy first if defending a monster or doing the best quest, but not little 'use energy' quests
			if (check.exp && (check.quest === Quest.runtime.best || !check.quest)) {
				log(LOG_WARN, 'Doing regular quest ' + Quest.runtime.best);
				return check;
			}
		}
		check = this.findAction('attack',0,stamina - big.stamina,exp);
		if (check.exp) {
			log(LOG_WARN, 'Doing stamina attack');
			log(LOG_DEBUG, 'basehit0 ' + check.basehit);
			return check;
		}
		check = this.findAction('quest',energy - big.energy,0,exp);
		if (check.exp) {
			log(LOG_WARN, 'Doing little quest ' + check.quest);
			return check;
		}
		log(LOG_WARN, 'Doing big action to save exp');
		return (big.exp ? big : nothing);
	case 'big':
		// Should enable to look for other options than last stamina, energy?
		energyAction = this.findAction('energy',energy,stamina,0);
/*		check = this.findAction('energy',energyAction.energy - 1,stamina,0);
		if (energy - check.energy * energy ratio * 1.25 < exp) {
			energyAction = check;
		}
*/		staminaAction = this.findAction('attack',energy,stamina,0);
		if (energyAction.exp > staminaAction.exp) {
			log(LOG_WARN, 'Big action is energy. Exp use:' + energyAction.exp + '/' + exp);
			energyAction.big = true;
			return energyAction;
		} else if (staminaAction.exp) {
			//log(LOG_WARN, 'big stamina ' + staminaAction.exp + staminaAction.general);
			log(LOG_WARN, 'Big action is stamina. Exp use:' + staminaAction.exp + '/' + exp);
			staminaAction.big = true;
			return staminaAction;
		} else {
			log(LOG_WARN, 'Big action not found');
			return nothing;
		}
	case 'energy':
		//log(LOG_WARN, 'monster runtime defending ' + Monster.get('runtime.defending'));
		if ((Monster.get('runtime.defending')
			&& (Quest.option.monster === 'Wait for'
				|| Quest.option.monster === 'When able'
				|| Queue.option.queue.indexOf('Monster')
					< Queue.option.queue.indexOf('Quest')))
		|| (!exp && Monster.get('runtime.big',false))) {
			defendAction = this.findAction('defend',energy,0,exp);
			if (defendAction.exp) {
				log(LOG_WARN, 'Energy use defend');
				return defendAction;
			}
		}
		questAction = this.findAction('quest',energy,0,exp);
		log(LOG_WARN, 'Energy use quest' + (exp ? 'Normal' : 'Big') + ' QUEST ' + ' Energy use: ' + questAction.energy +'/' + energy + ' Exp use: ' + questAction.exp + '/' + exp + 'Quest ' + questAction.quest);
		return questAction;
	case 'quest':
		quests = Quest.get('id');
		if (Quest.runtime.best && quests[Quest.runtime.best].energy <= energy && quests[Quest.runtime.best].exp < exp) {
			i = Quest.runtime.best;
		} else {
			i = bestObjValue(quests, function(q) {
				return ((q.energy <= energy && (!exp || (q.exp < exp)))
						? q.exp / (exp ? q.energy : 1) : null);
			});
		}
		if (i) {
			log(LOG_WARN, (exp ? 'Normal' : 'Big') + ' QUEST ' + ' Energy use: ' + questAction.energy +'/' + energy + ' Exp use: ' + questAction.exp + '/' + exp + 'Quest ' + questAction.quest);
			return {
				energy : quests[i].energy,
				stamina : 0,
				exp : quests[i].exp,
				quest : i
			};
		} else {
			log(LOG_WARN, 'No appropriate quest found');
			return nothing;
		}
	case 'defend':
		stat = 'energy';
		value = energy;
		// Deliberate fall-through
	case 'attack':
		stat = stat || 'stamina';
		value = value || stamina;
		if (Monster.get(['option', '_disabled'], false)){
				return nothing;
		}
		options = Monster.get('runtime.values.'+mode);
		if (mode === 'defend' && !exp) {
			options = options.concat(Monster.get('runtime.big',[])).unique();
		} else if (mode === 'attack') { // Add 1 so it waits until it has a multiple of remaining stamina before doing the big quest.
			options = options.concat([1]).unique();
		}
		// Use 6 as a safe exp/stamina and 2.8 for exp/energy multiple
		max = Math.min((exp ? (exp / ((stat === 'energy') ? 2.8 : 6)) : value), value);
		monsterAction = basehit = options.lower(max);
		multiples = Generals.get('runtime.multipliers');
		for (i in multiples) {
			check = options.map(function(s){ return s * multiples[i]; } ).lower(max);
			if (check > monsterAction) {
				monsterAction = check;
				basehit = check / multiples[i];
				general = i;
			}
		}
		if (monsterAction < 0 && mode === 'attack' && !Battle.get(['option', '_disabled'], false) && Battle.runtime.attacking) {
			monsterAction = [(Battle.option.type === 'War' ? 10 : 1)].lower(max);
		}
		log(LOG_WARN, (exp ? 'Normal' : 'Big') + ' mode: ' + mode + ' ' + stat + ' use: ' + monsterAction +'/' + ((stat === 'stamina') ? stamina : energy) + ' Exp use: ' + monsterAction * this.get('exp_per_' + stat) + '/' + exp + ' Basehit ' + basehit + ' options ' + options + ' General ' + general);
		if (monsterAction > 0 ) {
			return {
				stamina : (stat === 'stamina') ? monsterAction : 0,
				energy : (stat === 'energy') ? monsterAction : 0,
				exp : monsterAction * this.get('exp_per_' + stat),
				general : general,
				basehit : basehit
			};
		}
		break;
	case 'battle':
		// Need to fill in later
	}
	return nothing;
};

LevelUp.resource = function() {
	var mode, stat, action;
	if (LevelUp.get('exp_possible') > Player.get('exp_needed')) {
		action = LevelUp.runtime.action = LevelUp.findAction('best', Player.get('energy'), Player.get('stamina'), Player.get('exp_needed'));
		if (action.exp) {
			Monster._remind(0,'levelup');
			this.runtime.levelup = true;
			mode = (action.energy ? 'defend' : 'attack');
			stat = (action.energy ? 'energy' : 'stamina');
			this.runtime[stat] = action[stat];
			if (action.quest) {
				this.runtime.quest = action.quest;
			}
			this.runtime.basehit = ((action.basehit < Monster.get('option.attack_min')) ? action.basehit : false);
			log(LOG_DEBUG, 'basehit1 ' + this.runtime.basehit);
			this.runtime.big = action.big;
			if (action.big) {
				this.runtime.basehit = action.basehit;
				log(LOG_DEBUG, 'basehit2 ' + this.runtime.basehit);
				this.runtime.general = action.general || (LevelUp.option.general === 'any'
						? false
						: LevelUp.option.general === 'Manual'
						? LevelUp.option.general_choice
						: LevelUp.option.general );
			} else if (action.basehit === action[stat] && !Monster.get('option.best_'+mode) && Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')) {
				log(LOG_WARN, 'Overriding manual general that multiplies attack/defense');
				this.runtime.general = (action.stamina ? 'monster_attack' : 'monster_defend');
			}
			this.runtime.force.stamina = (action.stamina !== 0);
			this.runtime.force.energy = (action.energy !== 0);
			log(LOG_WARN, 'Leveling up: force burn ' + (this.runtime.stamina ? 'stamina' : 'energy') + ' ' + (this.runtime.stamina || this.runtime.energy) + ' basehit ' + this.runtime.basehit);
			//log(LOG_WARN, 'Level up general ' + this.runtime.general + ' base ' + this.runtime.basehit + ' action[stat] ' + action[stat] + ' best ' + !Monster.get('option.best_'+mode) + ' muly ' + (Monster.get('option.general_' + mode) in Generals.get('runtime.multipliers')));
			LevelUp.set('runtime.running', true);
			return stat;
		}
	}
};/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, calc_rolling_weighted_average, bestObjValue
*/
/********** Worker.Monster **********
 * Automates Monster
 */
var Monster = new Worker('Monster');
Monster.temp = null;

Monster.defaults['castle_age'] = {
	pages:'monster_monster_list keep_monster_active monster_battle_monster battle_raid festival_monster_list festival_battle_monster monster_dead monster_remove_list'
};

Monster.option = {
	best_attack:true,
	best_defend:true,
	best_raid:true,
	general_defend:'any',
	general_attack:'any',
	general_raid:'any',
	defend: 80,
	//	quest_over: 90,
	min_to_attack: 20,
	defend_active:false,
	use_tactics:false,
	choice: 'Any',
	stop: 'Never',
	own: true,
	hide:false,
	armyratio: 'Any',
	levelratio: 'Any',
	force1: true,
	raid: 'Invade x5',
	assist: true,
	attack_max: 5,
	attack_min: 5,
	defend_max: 10,
	defend_min: 10,
//	monster_check:'Hourly',
	check_interval:3600000,
	avoid_lost_cause:false,
	lost_cause_hours:5,
	rescue:false,
	risk:false,
    points:false,
	remove:false
};

Monster.runtime = {
	check:false, // id of monster to check if needed, otherwise false
	attack:false, // id of monster if we have an attack target, otherwise false
	defend:false, // id of monster if we have a defend target, otherwise false
	secondary: false, // Is there a target for mage or rogue that is full or not in cycle?  Used to tell quest to wait if don't quest when fortifying is on.
	multiplier : {defend:1,attack:1}, // General multiplier like Orc King or Barbarus
	values : {defend:[],attack:[]}, // Attack/defend values available for levelup
	big : [], // Defend big values available for levelup
	energy: 0, // How much can be used for next attack
	stamina: 0, // How much can be used for next attack
	used:{stamina:0,energy:0}, // How much was used in last attack
	button: {attack: {pick:1, query:[]},  // Query - the jquery query for buttons, pick - which button to use
			defend: {pick:1, query:[]},
			count:1}, // How many attack/defend buttons can the player access?
	health:10, // minimum health to attack,
	mode: null, // Used by update to tell work if defending or attacking
	stat: null, // Used by update to tell work if using energy or stamina
	message: null, // Message to display on dash and log when removing or reviewing or collecting monsters
	
	levelupdefending : false, // Used to preserve the runtime.defending value even when in force.stamina mode
	page : null, // What page (battle or monster) the check page should go to
	monsters : {}, // Used for storing running weighted averages for monsters
	defending: false,	// hint for other workers as to whether we are potentially using energy to defend
	banthus : [], // Possible attack values for :ban condition crits
	banthusNow : false  // Set true when ready to use a Banthus crit
};

Monster.display = [
	{
		advanced:true,
		id:'remove',
		label:'Delete completed monsters',
		checkbox:true,
		help:'Check to have script remove completed monsters with rewards collected from the monster list.'
	},{
		title:'Attack',
		group:[
			{
				id:'best_attack',
				label:'Use Best General',
				checkbox:true
			},{
				advanced:true,
				id:'general_attack',
				label:'Attack General',
				require:'!best_attack',
				select:'generals'
			},{
				advanced:true,
				id:'hide',
				label:'Use Raids and Monsters to Hide',
				checkbox:true,
				require:'stop!="Priority List"',
				help:'Fighting Raids keeps your health down. Fight Monsters with remaining stamina.'
			},{
				advanced:true,
				id:'points',
				label:'Get Demi Points First',
				checkbox:true,
				help:'Use Battle to get Demi Points prior to attacking Monsters.'
			},{
				id:'min_to_attack',
				label:'Attack Over',
				text:1,
				help:'Attack if defense is over this value. Range of 0% to 100%.',
				after:'%'
			},{
				id:'use_tactics',
				label:'Use tactics',
				checkbox:true,
				help:'Use tactics to improve damage when it\'s available (may lower exp ratio)'
			},{
				id:'choice',
				label:'Attack',
				select:['Any', 'Strongest', 'Weakest', 'Shortest ETD', 'Longest ETD', 'Spread', 'Max Damage', 'Min Damage','ETD Maintain','Goal Maintain'],
				help:'Any selects a random monster.' +
					'\nStrongest and Weakest pick by monster health.' +
					'\nShortest and Longest ETD pick by estimated time the monster will die.' +
					'\nMin and Max Damage pick by your relative damage percent done to a monster.' +
					'\nETD Maintain picks based on the longest monster expiry time.' +
					'\nGoal Maintain picks by highest proportional damage needed to complete your damage goal in the time left on a monster.'
			},{
				id:'stop',
				label:'Stop',
				select:['Never', 'Achievement', '2X Achievement', 'Priority List', 'Continuous'],
				help:'Select when to stop attacking a target.'
			},{
				id:'priority',
				label:'Priority List',
				require:'stop=="Priority List"',
				textarea:true,
				help:'Prioritized list of which monsters to attack'
			},{
				advanced:true,
				id:'own',
				label:'Never stop on Your Monsters',
				require:'stop!="Priority List"',
				checkbox:true,
				help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
			},{
				advanced:true,
				id:'rescue',
				require:'stop!="Priority List"',
				label:'Rescue failing monsters',
				checkbox:true,
				help:'Attempts to rescue failing monsters even if damage is at or above Stop Optionby continuing to attack. Can be used in coordination with Lost-cause monsters setting to give up if monster is too far gone to be rescued.'
			},{
				advanced:true,
				id:'avoid_lost_cause',
				label:'Avoid Lost-cause Monsters',
				require:'stop!="Priority List"',
				checkbox:true,
				help:'Do not attack monsters that are a lost cause, i.e. the ETD is longer than the time remaining.'
			},{
				advanced:true,
				id:'lost_cause_hours',
				label:'Lost-cause if ETD is',
				require:'avoid_lost_cause',
				after:'hours after timer',
				text:true,
				help:'# of Hours Monster must be behind before preventing attacks.'
			},{
				id:'attack_min',
				label:'Min Stamina Cost',
				select:[1,5,10,20,50,100,200],
				help:'Select the minimum stamina for a single attack'
			},{
				id:'attack_max',
				label:'Max Stamina Cost',
				select:[1,5,10,20,50,100,200],
				help:'Select the maximum stamina for a single attack'
			}
		]
	},{
		title:'Defend',
		group:[
			{
				id:'defend_active',
				label:'Defend Active',
				checkbox:true,
				help:'Must be checked to defend.'
			},{
		//		id:'defend_group',
				require:'defend_active',
				group:[
					{
						id:'best_defend',
						label:'Use Best General',
						checkbox:true
					},{
						advanced:true,
						id:'general_defend',
						require:'!best_defend',
						label:'Defend General',
						select:'generals'
					},{
						id:'defend',
						label:'Defend Below',
						text:30,
						help:'Defend if defense is under this value. Range of 0% to 100%.',
						after:'%'
					},{
						id:'defend_min',
						label:'Min Energy Cost',
						select:[10,20,40,100,200],
						help:'Select the minimum energy for a single energy action'
					},{
						id:'defend_max',
						label:'Max Energy Cost',
						select:[10,20,40,100,200],
						help:'Select the maximum energy for a single energy action'
					}
				]
			}
		]
	},{
		title:'Raids',
		group:[
			{
				id:'best_raid',
				label:'Use Best General',
				checkbox:true
			},{
				advanced:true,
				id:'general_raid',
				label:'Raid General',
				require:'!best_raid',
				select:'generals'
			},{
				id:'raid',
				label:'Raid',
				select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
			},{
				advanced:true,
				id:'risk',
				label:'Risk Death',
				checkbox:true,
				help:'The lowest health you can raid with is 10, but you can lose up to 12 health in a raid, so are you going to risk it???'
			},{
				id:'armyratio',
				require:'raid!="Duel" && raid!="Duel x5"',
				label:'Target Army Ratio',
				select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
				help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
			},{
				id:'levelratio',
				require:'raid!="Invade" && raid!="Invade x5"',
				label:'Target Level Ratio',
				select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
				help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
			},{
				id:'force1',
				label:'Force +1',
				checkbox:true,
				help:'Force the first player in the list to aid.'
			}
		]
	},{
		title:'Siege Assist Options',
		group:[
			{
				id:'assist',
				label:'Assist with Sieges',
				help:'Spend stamina to assist with sieges.',
				checkbox:true
			},{
				id:'assist_links',
				label:'Use Assist Links in Dashboard',
				checkbox:true
			},{
				advanced:true,
				id:'check_interval',//monster_check
				label:'Monster Review',
				select:{
					900000:'15 Minutes',
					1800000:'30 Minutes',
					3600000:'Hourly',
					7200000:'2 Hours',
					21600000:'6 Hours',
					43200000:'12 Hours',
					86400000:'Daily',
					604800000:'Weekly'},
				help:'Sets how often to check Monster Stats.'
			}
		]
	}
];

Monster.types = {
	// Quest unlocks
	kull: {
		name:'Kull, the Orc Captain',
		list:'orc_captain_list.jpg',
		image:'orc_captain_large.jpg',
		dead:'orc_captain_dead.jpg',
		achievement:1000, // total guess
		timer:259200, // 72 hours
		mpool:4,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1]
	},
	minotaur: {
		name:'Karn, The Minotaur',
		list:'monster_minotaur_list.jpg',
		image:'monster_minotaur.jpg',
		dead:'monster_minotaur_dead.jpg',
		achievement:10000, // total guess
		timer:432000, // 120 hours
		mpool:4,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,6]
	},
	// Raids
	raid_easy: {
		name:'The Deathrune Siege',
		list:'deathrune_list1.jpg',
		image:'raid_title_raid_a1.jpg',
		image2:'raid_title_raid_a2.jpg',
		dead:'raid_1_large_victory.jpg',
		achievement:100,
		timer:216000, // 60 hours
		timer2:302400, // 84 hours
		raid:true
	},

	raid: {
		name:'The Deathrune Siege',
		list:'deathrune_list2.jpg',
		image:'raid_title_raid_b1.jpg',
		image2:'raid_title_raid_b2.jpg',
		dead:'raid_1_large_victory.jpg',
		achievement:100,
		timer:319920, // 88 hours, 52 minutes
		timer2:519960, // 144 hours, 26 minutes
		raid:true
	},
	// Epic Boss
	colossus: {
		name:'Colossus of Terra',
		list:'stone_giant_list.jpg',
		image:'stone_giant_large.jpg',
		dead:'stone_giant_dead.jpg',
		achievement:20000,
		timer:259200, // 72 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		festival_timer: 345600, // 96 hours
		festival: 'stonegiant'
	},
	gildamesh: {
		name:'Gildamesh, the Orc King',
		list:'orc_boss_list.jpg',
		image:'orc_boss.jpg',
		dead:'orc_boss_dead.jpg',
		achievement:15000,
		timer:259200, // 72 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		festival_timer: 345600, // 96 hours
		festival: 'orcking'
	},
	keira: {
		name:'Keira the Dread Knight',
		list:'boss_keira_list.jpg',
		image:'boss_keira.jpg',
		dead:'boss_keira_dead.jpg',
		achievement:30000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	lotus: {
		name:'Lotus Ravenmoore',
		list:'boss_lotus_list.jpg',
		image:'boss_lotus.jpg',
		dead:'boss_lotus_big_dead.jpg',
		achievement:500000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5]
	},
	mephistopheles: {
		name:'Mephistopheles',
		list:'boss_mephistopheles_list.jpg',
		image:'boss_mephistopheles_large.jpg',
		dead:'boss_mephistopheles_dead.jpg',
		achievement:100000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[1,5],
		festival_timer: 320400, // 89 hours
		festival: 'mephistopheles'
	},
	skaar: {
		name:'Skaar Deathrune',
		list:'death_list.jpg',
		image:'death_large.jpg',
		dead:'death_dead.jpg',
		achievement:1000000,
		timer:345000, // 95 hours, 50 minutes
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="dispel"]',
		defend:[10,10,20,40,100],
		defense_img:'shield_img',
		festival_timer: 432000, // 120 hours
		festival: 'skaar_boss'
	},
	sylvanus: {
		name:'Sylvana the Sorceress Queen',
		list:'boss_sylvanus_list.jpg',
		image:'boss_sylvanus_large.jpg',
		dead:'boss_sylvanus_dead.jpg',
		achievement:50000,
		timer:172800, // 48 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"]',
		attack:[1,5],
		festival_timer: 259200, // 72 hours
		festival: 'sylvanus'
	},
	// Epic Team
	dragon_emerald: {
		name:'Emerald Dragon',
		list:'dragon_list_green.jpg',
		image:'dragon_monster_green.jpg',
		dead:'dead_dragon_image_green.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival: 'dragon_green'
	},
	dragon_frost: {
		name:'Frost Dragon',
		list:'dragon_list_blue.jpg',
		image:'dragon_monster_blue.jpg',
		dead:'dead_dragon_image_blue.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_blue'
	},
	dragon_gold: {
		name:'Gold Dragon',
		list:'dragon_list_yellow.jpg',
		image:'dragon_monster_gold.jpg',
		dead:'dead_dragon_image_gold.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_yellow'
	},
	dragon_red: {
		name:'Ancient Red Dragon',
		list:'dragon_list_red.jpg',
		image:'dragon_monster_red.jpg',
		image2:'dragon_monster.jpg',
		dead:'dead_dragon_image_red.jpg',
		achievement:100000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[5,10],
		festival_timer: 345600, // 96 hours
		festival: 'dragon_red'
	},
	serpent_amethyst: { 
		name:'Amethyst Sea Serpent',
		list:'seamonster_list_purple.jpg',
		image:'seamonster_purple.jpg',
		dead:'seamonster_dead.jpg',
		title:'monster_header_amyserpent.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_purple'
	},
	serpent_ancient: { 
		name:'Ancient Sea Serpent',
		list:'seamonster_list_red.jpg',
		image:'seamonster_red.jpg',
		dead:'seamonster_dead.jpg',
		title:'monster_header_ancientserpent.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_red'
	},
	serpent_emerald: { 
		name:'Emerald Sea Serpent',
		list:'seamonster_list_green.jpg',
		image:'seamonster_green.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_emerald.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_green'
	},
	serpent_sapphire: {
		name:'Sapphire Sea Serpent',
		list:'seamonster_list_blue.jpg',
		image:'seamonster_blue.jpg',
		dead:'seamonster_dead.jpg',
		title:'seamonster_title_sapphire.jpg',
		achievement:250000,
		timer:259200, // 72 hours
		mpool:2,
		attack_button:'input[name="Attack Dragon"]',
		siege:false,
		attack:[10,20],
		defend_button:'input[name="Defend against Monster"]',
		defend:[10],
		festival_timer: 345600, // 96 hours
		festival: 'seamonster_blue'
	},
	// Epic World
	cronus: {
		name:'Cronus, The World Hydra',
		list:'hydra_head.jpg',
		image:'hydra_large.jpg',
		dead:'hydra_dead.jpg',
		achievement:500000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"]',
		attack:[10,20,50,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'hydra'
	},
	legion: {
		name:'Battle of the Dark Legion',
		list:'castle_siege_list.jpg',
		image:'castle_siege_large.jpg',
		dead:'castle_siege_dead.jpg',
		achievement:1000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="fortify"]',
		defend:[10,10,20,40,100],
		orcs:true
	},
	genesis: {
		name:'Genesis, The Earth Elemental',
		list:'earth_element_list.jpg',
		image:'earth_element_large.jpg',
		dead:'earth_element_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="fortify"]',
		defend:[10,10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'earth_element'
	},
	ragnarok: {
		name:'Ragnarok, The Ice Elemental',
		list:'water_list.jpg',
		image:'water_large.jpg',
		dead:'water_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="attack"]',
		attack:[1,5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="dispel"]',
		defend:[10,10,20,40,100],
		defense_img:'shield_img',
		festival_timer: 691200, // 192 hours
		festival: 'water_element'
	},
	gehenna: {
		name:'Gehenna',
		list:'nm_gehenna_list.jpg',
		image:'nm_gehenna_large.jpg',
		dead:'nm_gehenna_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'fire_element'
	},
	valhalla: {
		name:'Valhalla, The Air Elemental',
		list:'monster_valhalla_list.jpg',
		image:'monster_valhalla.jpg',
		dead:'monster_valhalla_dead.jpg',
		achievement:1000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival_timer: 691200, // 192 hours
		festival: 'air_element'
	},
	bahamut: {
		name:'Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list.jpg',
		image:'nm_volcanic_large.jpg',
		dead:'nm_volcanic_dead.jpg',
		achievement:2000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'volcanic_new'
	},
	alpha_bahamut: {
		name:'Alpha Bahamut, the Volcanic Dragon',
		list:'nm_volcanic_list_2.jpg',
		image:'nm_volcanic_large_2.jpg',
		dead:'nm_volcanic_dead_2.jpg',
		achievement:6000000, // Guesswork
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	azriel: {
		name:'Azriel, the Angel of Wrath',
		list:'nm_azriel_list.jpg',
		image:'nm_azriel_large2.jpg',
		dead:'nm_azriel_dead.jpg',
		achievement:6000000, // ~0.5%, 2X = ~1%
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'boss_azriel'
	},
	red_plains: {
		name:'War of the Red Plains',
		list:'nm_war_list.jpg',
		image:'nm_war_large.jpg',
		dead:'nm_war_dead.jpg',
		achievement:2500,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		tactics_button:'input[name="Attack Dragon"][src*="tactics"]',
		tactics:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		orcs:true
	},
	corvintheus: {
		name:'Corvintheus',
		list:'corv_list.jpg',
		image:'boss_corv.jpg',
		dead:'boss_corv_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	agamemnon: {
		name:'Agamemnon the Overseer',
		list:'boss_agamemnon_list.jpg',
		image:'boss_agamemnon_large.jpg',
		dead:'boss_agamemnon_dead.jpg',  // guess
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200],
		festival_timer: 691200, // 192 hours
		festival : 'agamemnon'
	},
	jahanna: {
		name:'Jahanna, Priestess of Aurora',
		list:'boss_jahanna_list.jpg',
		image:'boss_jahanna_large.jpg',
		dead:'boss_jahanna_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200]
	},
	aurora: {
		name:'Aurora',
		list:'boss_aurora_list.jpg',
		image:'boss_aurora_large.jpg',
		dead:'boss_aurora_dead.jpg',
		achievement:5000000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[10,20,50,100,200],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[20,40,100,200]
	},
	rebellion: {
		name:'Aurelius, Lion\'s Rebellion',
		list:'nm_aurelius_list.jpg',
		image:'nm_aurelius_large.jpg',
		dead:'nm_aurelius_large_dead.jpg',
		achievement:1000,
		timer:604800, // 168 hours
		mpool:1,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		tactics_button:'input[name="Attack Dragon"][src*="tactics"]',
		tactics:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		orcs:true
	},
	alpha_meph: {
		name:'Alpha Mephistopheles',
		list:'nm_alpha_mephistopheles_list.jpg',
		image:'nm_mephistopheles2_large.jpg',
		dead:'nm_mephistopheles2_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100],
		festival_timer: 691200, // 192 hours
		festival: 'alpha_mephistopheles',
		festival_mpool: 1
	},
	giant_kromash: {
		name:'Kromash',
		list:'monster_kromash_list.jpg',
		image:'monster_kromash_large.jpg',
		dead:'monster_kromash_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_glacius: {
		name:'Glacius',
		list:'monster_glacius_list.jpg',
		image:'monster_glacius_large.jpg',
		dead:'monster_glacius_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_shardros: {
		name:'Shardros',
		list:'monster_shardros_list.jpg',
		image:'monster_shardros_large.jpg',
		dead:'monster_shardros_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	},
	giant_magmos: {
		name:'Magmos',
		list:'monster_magmos_list.jpg',
		image:'monster_magmos_large.jpg',
		dead:'monster_magmos_dead.jpg',
		achievement:6000000,
		timer:604800, // 168 hours
		mpool:3,
		attack_button:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
		attack:[5,10,20,50],
		defend_button:'input[name="Attack Dragon"][src*="heal"]',
		defend:[10,20,40,100]
	}
};

Monster.health_img = ['img[src$="nm_red.jpg"]', 'img[src$="monster_health_background.jpg"]'];
Monster.shield_img = ['img[src$="bar_dispel.gif"]'];
Monster.defense_img = ['img[src$="nm_green.jpg"]', 'img[src$="seamonster_ship_health.jpg"]'];
Monster.secondary_img = 'img[src$="nm_stun_bar.gif"]';
Monster.class_img = ['div[style*="nm_bottom"] img[src$="nm_class_warrior.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_cleric.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_rogue.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_mage.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_ranger.jpg"]',
				'div[style*="nm_bottom"] img[src$="nm_class_warlock.jpg"]'];
Monster.class_name = ['Warrior', 'Cleric', 'Rogue', 'Mage', 'Ranger', 'Warlock'];
Monster.secondary_off = 'img[src$="nm_s_off_cripple.gif"],img[src$="nm_s_off_deflect.gif"]';
Monster.secondary_on = 'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"]';
Monster.warrior = 'input[name="Attack Dragon"][src*="strengthen"]';
Monster.raid_buttons = {
	'Invade':	'input[src$="raid_attack_button.gif"]:first',
	'Invade x5':'input[src$="raid_attack_button3.gif"]:first',
	'Duel':		'input[src$="raid_attack_button2.gif"]:first',
	'Duel x5':	'input[src$="raid_attack_button4.gif"]:first'};
Monster.name_re = null;
Monster.name2_re = /^\s*(.*\S)\s*'s\b/im; // secondary player/monster name match regexp

Monster.setup = function() {
	Resources.use('Energy');
	Resources.use('Stamina');
};

Monster.init = function() {
	var i, str;

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_attack === 'under level 4') {
		this.set('option.general_attack', 'under max level');
	}
	if (this.option.general_defend === 'under level 4') {
		this.set('option.general_defend', 'under max level');
	}
	if (this.option.general_raid === 'under level 4') {
		this.set('option.general_raid', 'under max level');
	}
	// END

	this._watch(Player, 'data.health');
	this._watch(LevelUp, 'runtime');
	this._revive(60);
	this.runtime.limit = 0;
	if (isNumber(this.runtime.multiplier)) {
		delete this.runtime.multiplier;
		this.runtime.multiplier = {defend:1,attack:1}; // General multiplier like Orc King or Barbarus
	}
	delete this.runtime.record;

	// generate a complete primary player/monster name match regexp
	str = '';
	for (i in this.types) {
		if (this.types[i].name) {
			if (str !== '') {
				str += '|';
			}
			str += this.types[i].name.regexp_escape();
		}
	}
	this.name_re = new RegExp("^\\s*(.*\\S)\\s*'s\\s+(?:" + str + ')\\s*$', 'im');
};

Monster.parse = function(change) {
	var i, uid, name, type, tmp, list, el, mid, type_label, $health, $defense, $dispel, $secondary, dead = false, monster, timer, ATTACKHISTORY = 20, data = this.data, types = this.types, now = Date.now(), ensta = ['energy','stamina'], x, festival, parent = $('#'+APPID_+'app_body'), $children;
	//log(LOG_WARN, 'Parsing ' + Page.page);
	if (['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(Page.page)>=0) { // In a monster or raid
		festival = Page.page === 'festival_battle_monster';
		uid = $('img[linked][size="square"]').attr('uid');
		//log(LOG_WARN, 'Parsing for Monster type');
		for (i in types) {
			if (types[i].dead && $('img[src$="'+types[i].dead+'"]', parent).length 
					&& (!types[i].title || $('div[style*="'+types[i].title+'"]').length 
						|| $('div[style*="'+types[i].image+'"]', parent).length)) {
//			if (types[i].dead && $('img[src$="'+types[i].dead+'"]', parent).length) {
				//log(LOG_WARN, 'Found a dead '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer;
				dead = true;
				break;
			} else if (types[i].image && $('img[src$="'+types[i].image+'"],div[style*="'+types[i].image+'"]', parent).length) {
				//log(LOG_WARN, 'Parsing '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer;
				break;
			} else if (types[i].image2 && $('img[src$="'+types[i].image2+'"],div[style*="'+types[i].image2+'"]', parent).length) {
				//log(LOG_WARN, 'Parsing second stage '+i);
				type_label = i;
				timer = (festival ? types[i].festival_timer : 0) || types[i].timer2 || types[i].timer;
				break;
			}
		}
		if (!uid || !type_label) {
			log(LOG_WARN, 'Unable to identify monster' + (!uid ? ' owner' : '') + (!type_label ? ' type' : ''));
			return false;
		}
		mid = uid+'_' + (Page.page === 'festival_battle_monster' ? 'f' : (types[i].mpool || 4));
		if (this.runtime.check === mid) {
			this.set(['runtime','check'], false);
		}
		//log(LOG_WARN, 'MID '+ mid);
		this.set(['data',mid,'type'],type_label);
		monster = data[mid];
		monster.button_fail = 0;
		type = types[type_label];
		monster.last = now;
		if (Page.page === 'festival_battle_monster') {
			monster.page = 'festival';
		} else {
			monster.page = 'keep';
		}
		monster.name = $('img[linked][size="square"]').parent().parent().parent().text().replace('\'s summoned','').replace(' Summoned','').replace(/Monster Code: \w+:\d/,'').trim();
		if (dead) {
			// Will this catch Raid format rewards?
			if ($('input[src*="collect_reward_button"]').length) {
				monster.state = 'reward';
			} else if ($('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser=' + userID + '"]').length) {
				if (!monster.dead) {
					History.add(type_label,1);
					monster.dead = true;
				}
				monster.state = 'complete';
				this.set(['data',mid,'remove'], true);
			} else {
				monster.state = null;
			}
			return false;
		}
		monster.stamina = monster.stamina || {};
		monster.damage = monster.damage || {};
		monster.damage.user = monster.damage.user || {};
		monster.energy = monster.energy || {};
		monster.defend = monster.defend || {};
		this.runtime.monsters[monster.type] = this.runtime.monsters[monster.type] || {};
		if ($('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
			if ($('span.result_body').text().match(/for your help in summoning/i)) {
				monster.assist = now;
			}
			monster.state = monster.state || 'assist';
		} else {
			for (i in ensta) {
				if (this.runtime.used[ensta[i]]) {
					if ($('span[class="positive"]').length && $('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,'')) {
						calc_rolling_weighted_average(this.runtime.monsters[monster.type]
								,'damage',Number($('span[class="positive"]').prevAll('span').text().replace(/[^0-9\/]/g,''))
								,ensta[i],this.runtime.used[ensta[i]],10);
						//log(LOG_WARN, 'Damage per ' + ensta[i] + ' = ' + this.runtime.monsters[monster.type]['avg_damage_per_' + ensta[i]]);
						if (Player.get('general') === 'Banthus Archfiend' 
								&& Generals.get(['data','Banthus Archfiend','charge'],1e99) < Date.now()) {
							Generals.set(['data','Banthus Archfiend','charge'],Date.now() + 4320000);
						}
						if (Player.get('general') === 'Zin'
								&& Generals.get(['data','Zin','charge'],1e99) < Date.now()) {
							Generals.set(['data','Zin','charge'],Date.now() + 82800000);
						}
					}
					this.runtime.used[ensta[i]] = 0;
					break;
				}
			}
		}
		if ($('img[src$="battle_victory"]').length) {
			History.add('raid+win',1);
		} else if ($('img[src$="battle_defeat"]').length) {
			History.add('raid+loss',-1);
		}
		// Check if variable number of button monster
		if (!type.raid && monster.state === 'engage' && type.attack.length > 2) {
			this.runtime.button.count = $(type.attack_button).length;
		}
		// Need to also parse what our class is for Bahamut.  (Can probably just look for the strengthen button to find warrior class.)
		for (i in Monster.class_img){
			if ($(Monster.class_img[i]).length){
				monster.mclass = i;
				break;
				//log(LOG_WARN, 'Monster class : '+Monster['class_name'][i]);
			}
		}
		if ($(Monster.warrior).length) {
			monster.warrior = true;
		}
		if ($(Monster.secondary_off).length) {
			monster.secondary = 100;
		} else if ($(Monster.secondary_on).length) {
			monster.secondary = 0.01; // Prevent from defaulting to false
			$secondary = $(Monster['secondary_img']);
			if ($secondary.length) {
				this.set(['data',mid,'secondary'], 100 * $secondary.width() / $secondary.parent().width());
				log(LOG_WARN, Monster['class_name'][monster.mclass]+" phase. Bar at "+monster.secondary+"%");
			}
		}
		// If we have some other class but no cleric button, then we can't heal.
		if ((monster.secondary || monster.warrior) && !$(type.defend_button).length) {
			monster.no_heal = true;
		}
		for (i in Monster['health_img']){
			if ($(Monster['health_img'][i]).length){
				$health = $(Monster['health_img'][i]).parent();
				monster.health = $health.length ? (100 * $health.width() / $health.parent().width()) : 0;
				break;
			}
		}
		if (!type.defense_img || type.defense_img === 'shield_img') {
			// If we know this monster should have a shield image and don't find it, assume 0
			if (type.defense_img === 'shield_img') {
				monster.defense = 100;
			}
			for (i in Monster['shield_img']){
				if ($(Monster['shield_img'][i]).length){
					$dispel = $(Monster['shield_img'][i]).parent();
					monster.defense = 100 * (1 - ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width())));
					break;
				}
			}
		}
		if (!type.defense_img || type.defense_img === 'defense_img') {
			// If we know this monster should have a defense image and don't find it, 
			for (i in Monster['defense_img']){
				if ($(Monster['defense_img'][i]).length){
					$defense = $(Monster['defense_img'][i]).parent();
					monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
					if ($defense.parent().width() < $defense.parent().parent().width()){
						monster.strength = 100 * $defense.parent().width() / $defense.parent().parent().width();
					} else {
						monster.strength = 100;
					}
					monster.defense = monster.defense * (monster.strength || 100) / 100;
					break;
				}
			}
		}
		monster.timer = $('#'+APPID_+'monsterTicker').text().parseTimer();
		monster.finish = now + (monster.timer * 1000);
		monster.damage.siege = 0;
		monster.damage.others = 0;
		if (!dead &&$('input[name*="help with"]').length && $('input[name*="help with"]').attr('title')) {
			//log(LOG_WARN, 'Current Siege Phase is: '+ this.data[mid].phase);
			monster.phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
			//log(LOG_WARN, 'Assisted on '+monster.phase+'.');
		}
		$('img[src*="siege_small"]').each(function(i,el){
			var /*siege = $(el).parent().next().next().next().children().eq(0).text(),*/ dmg = $(el).parent().next().next().next().children().eq(1).text().replace(/\D/g,'').regex(/(\d+)/);
			//log(LOG_WARN, 'Monster Siege',siege + ' did ' + dmg.addCommas() + ' amount of damage.');
			monster.damage.siege += dmg / (types[type_label].orcs ? 1000 : 1);
		});
		$('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?casuser="]').each(function(i,el){
			var user = $(el).attr('href').regex(/user=(\d+)/i), tmp, dmg, fort;
			if (types[type_label].raid){
				tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
			} else {
				tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
			}
			dmg = tmp.regex(/(\d+)/);
			fort = tmp.regex(/\/(\d+)/);
			if (user === userID){
				Monster.set(['data',mid,'damage','user','manual'], dmg - (monster.damage.user.script || 0));
				monster.defend.manual = fort - (monster.defend.script || 0);
				monster.stamina.manual = Math.round(monster.damage.user.manual / Monster.runtime.monsters[type_label].avg_damage_per_stamina);
			} else {
				monster.damage.others += dmg;
			}
		});
		// If we're doing our first attack then add them without having to visit list
		if (monster.state === 'assist' && sum(monster.damage && monster.damage.user)) {
			monster.state = 'engage';
		}
		if (!type.raid && $(type.attack_button).length && sum(monster.damage && monster.damage.user)) {
			monster.state = monster.state || 'engage';
		}
		monster.dps = sum(monster.damage) / (timer - monster.timer);
		if (types[type_label].raid) {
			monster.total = sum(monster.damage) + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/(\d+)/);
		} else {
			monster.total = Math.ceil(100 * sum(monster.damage) / (monster.health === 100 ? 0.1 : (100 - monster.health)));
		}
		monster.eta = now + (Math.floor((monster.total - sum(monster.damage)) / monster.dps) * 1000);
		this._taint[data] = true;
//		this.runtime.used.stamina = 0;
//		this.runtime.used.energy = 0;
	} else if (Page.page === 'monster_dead') {
		if (Queue.temp.current === 'Monster' && this.runtime.mid) { // Only if we went here ourselves...
			log(LOG_WARN, 'Deleting ' + data[this.runtime.mid].name + "'s " + data[this.runtime.mid].type);
			this.set(['data',this.runtime.mid]);
		} else {
			log(LOG_WARN, 'Unknown monster (timed out)');
		}
		this.set(['runtime','check'], false);
// Still need to do battle_raid
	} else if (Page.page === 'festival_monster_list') { // Check monster / raid list
		for (mid in data) {
			if (data[mid].page === 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		list = $('div[style*="festival_monster_list_middle.jpg"]')
		for (i=0; i<list.length; i++) {
			el = list[i];
			$children = $(el).children('div');
			try {
				this._transaction(); // BEGIN TRANSACTION
				assert(uid = $children.eq(3).find('a').attr('href').regex(/casuser=(\d+)/i), 'Unknown UserID');
				tmp = $children.eq(1).find('div').eq(0).attr('style').regex(/graphics\/([^.]*\....)/i);
				assert(type = findInObject(types, tmp, 'list'), 'Unknown monster type: '+tmp+ ' for ' + uid);
				assert(name = $children.eq(2).children().eq(0).text().replace(/'s$/i, ''), 'Unknown User Name');
//				log(LOG_WARN, 'Adding monster - uid: '+uid+', name: '+name+', image: "'+type+'"');
				mid = uid + '_f';
				this.set(['data',mid,'type'], type);
				this.set(['data',mid,'name'], name);
				this.set(['data',mid,'page'], 'festival');
				switch($children.eq(3).find('img').attr('src').filepart().regex(/(\w+)\.(gif|jpg)/)[0]) {
				case 'festival_monster_engagebtn':
					this.set(['data',mid,'state'], 'engage');
					break;
				case 'festival_monster_collectbtn':
					this.set(['data',mid,'state'], 'reward');
					break;
				case 'festival_monster_viewbtn':
					this.set(['data',mid,'state'], 'complete');
					break;
				default:
					this.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
	} else if (Page.page === 'monster_monster_list') { // Check monster / raid list
		for (mid in data) {
			if (!types[data[mid].type].raid && data[mid].page !== 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		list = $('div[style*="monsterlist_container.gif"]')
		for (i=0; i<list.length; i++) {
			el = list[i];
			$children = $(el).children('div');
			try {
				this._transaction(); // BEGIN TRANSACTION
				assert(uid = $children.eq(2).find('input[name="casuser"]').attr('value'), 'Unknown UserID');
				tmp = $children.eq(0).find('img').eq(0).attr('src').regex(/graphics\/([^.]*\....)/i);
				assert(type = findInObject(types, tmp, 'list'), 'Unknown monster type: '+tmp);
				assert(name = $children.eq(1).children().eq(0).text().replace(/'s$/i, ''), 'Unknown User Name');
//				log(LOG_WARN, 'Adding monster - uid: '+uid+', name: '+name+', image: "'+type+'"');
				mid = uid + '_' + (types[type].mpool || 4);
				this.set(['data',mid,'type'], type);
				this.set(['data',mid,'name'], name);
				switch($children.eq(2).find('input[type="image"]').attr('src').regex(/(\w+)\.(gif|jpg)/)[0]) {
				case 'monsterlist_button_engage':
					this.set(['data',mid,'state'], 'engage');
					break;
				case 'monster_button_collect':
					// Can't tell if complete or reward, so set to complete, and will find reward when next visited
					this.set(['data',mid,'state'], 'complete');
					break;
				default:
					this.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
				this._transaction(true); // COMMIT TRANSACTION
			} catch(e) {
				this._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		}
	} else if (Page.page === 'monster_remove_list') { // Check monster / raid list
		for (mid in data) {
			if (!types[data[mid].type].raid && data[mid].page !== 'festival'
					&& (data[mid].state !== 'assist' || data[mid].finish < now)) {
				data[mid].state = null;
			}
		}
		$('#app'+APPID+'_app_body div.imgButton').each(function(a,el) {
			var link = $('a', el).attr('href'), mid;
			if (link && link.regex(/casuser=([0-9]+)/i)) {
				mid = link.regex(/casuser=([0-9]+)/i)+'_'+link.regex(/mpool=([0-9])/i);
				log(LOG_WARN, 'MID '+ mid);
				switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
				case 2:
					Monster.set(['data',mid,'state'], 'reward');
					break;
				case 3:
					Monster.set(['data',mid,'state'], 'engage');
					break;
				case 4:
					Monster.set(['data',mid,'state'], 'complete');
					Monster.set(['data',mid,'remove'], true);
					break;
				default:
					Monster.set(['data',mid,'state'], 'unknown');
					break; // Should probably delete, but keep it on the list...
				}
			}
		});
	}
	return false;
};

Monster.resource = function() {
	if (Monster.runtime.banthus.length && Generals.get(['data','Banthus Archfiend','charge'],1e99) < Date.now()) {
		Monster.set(['runtime','banthusNow'], true);
		LevelUp.set(['runtime','basehit'], Monster.runtime.banthus.lower(LevelUp.get(['runtime','stamina'], 0)));
		LevelUp.set(['runtime','general'], 'Banthus Archfiend');
		return 'stamina';
	}
	Monster.set(['runtime','banthusNow'], false);
	return false;
};

Monster.update = function(event) {
	if (event.type === 'runtime' && event.worker.name !== 'LevelUp') {
		return;
	}
	var i, j, mid, uid, type, stat_req, req_stamina, req_health, req_energy, messages = [], fullname = {}, list = {}, listSortFunc, matched_mids = [], min, max, limit, filter, ensta = ['energy','stamina'], defatt = ['defend','attack'], button_count, monster, damage, target, now = Date.now(), waiting_ok;
	this.runtime.mode = this.runtime.stat = this.runtime.check = this.runtime.message = this.runtime.mid = null;
	this.runtime.big = this.runtime.values.attack = this.runtime.values.defend = [];
	limit = this.runtime.limit;
	if(!LevelUp.runtime.running && limit === 100){
		limit = 0;
	}
	list.defend = [];
	list.attack = [];
	// Flush stateless monsters
	for (mid in this.data) {
		if (!this.data[mid].state) {
			log(LOG_LOG, 'Deleted monster MID ' + mid + ' because state is ' + this.data[mid].state);
			delete this.data[mid];
		}
	}
	// Check for unviewed monsters
	for (mid in this.data) {
		if (!this.data[mid].last && !this.data[mid].ignore && this.data[mid].state === 'engage') {
			this.page(mid, 'Checking new monster ', 'casuser','');
			this.runtime.defending = true;
			this.data[mid].last = now; // Force it to only check once
			return;
		}
	}
	// Some generals use more stamina, but only in certain circumstances...
	defatt.forEach( function(mode) {
		Monster.runtime.multiplier[mode] = (Generals.get([LevelUp.runtime.general || (Generals.best(Monster.option['best_' + mode] ? ('monster_' + mode) : Monster.option['general_' + mode])), 'skills'], '').regex(/Increase Power Attacks by (\d+)/i) || 1);
		//log(LOG_WARN, 'mult ' + mode + ' X ' + Monster.runtime.multiplier[mode]);
	});
	waiting_ok = !this.option.hide && !LevelUp.runtime.force.stamina;
	if (this.option.stop === 'Priority List') {
		var condition, searchterm, attack_found = false, defend_found = false, attack_overach = false, defend_overach = false, o, suborder, p, defense_kind, button, order = [];
		this.runtime.banthus = [];
		if (this.option.priority) {
			order = this.option.priority.toLowerCase().replace(/ *[\n,]+ */g,',').replace(/[, ]*\|[, ]*/g,'|').split(',');
		}
		order.push('your ','\'s'); // Catch all at end in case no other match
		for (o=0; o<order.length; o++) {
			order[o] = order[o].trim();
			if (!order[o]) {
				continue;
			}
			if (order[o] === 'levelup') {
				if ((LevelUp.runtime.force.stamina && !list.attack.length) 
						|| (LevelUp.runtime.force.energy && !list.defend.length)) {
					matched_mids = [];
					continue;
				} else {
					break;
				}
			}
			suborder = order[o].split('|');
			for (p=0; p<suborder.length; p++) {
				suborder[p] = suborder[p].trim();
				if (!suborder[p]) {
					continue;
				}
				searchterm = suborder[p].match(new RegExp("^[^:]+")).toString().trim();
				condition = suborder[p].replace(new RegExp("^[^:]+"), '').toString().trim();
				//log(LOG_WARN, 'Priority order ' + searchterm +' condition ' + condition + ' o ' + o + ' p ' + p);
				for (mid in this.data) {
					monster = this.data[mid];
					type = this.types[monster.type];
					//If this monster does not match, skip to next one
					// Or if this monster is dead, skip to next one
					if (	matched_mids.indexOf(mid)>=0
							||((monster.name === 'You' ? 'Your' : monster.name + '\'s')
								+ ' ' + type.name).toLowerCase().indexOf(searchterm) < 0
							|| monster.ignore) {
						continue;
					}
					matched_mids.push(mid);
					monster.ac = /:ac\b/.test(condition);
					if (monster.state !== 'engage') {
						continue;
					}
					//Monster is a match so we set the conditions
					monster.max = this.conditions('max',condition);
					monster.ach = this.conditions('ach',condition) || type.achievement;
					// check for min/max stamina/energy overrides
					if ((i = this.conditions('smin',condition)) && isNumber(i) && !isNaN(i)) {
						monster.smin = i;
					} else if (monster.smin) {
						delete monster.smin;
					}
					if ((i = this.conditions('smax',condition)) && isNumber(i) && !isNaN(i)) {
						monster.smax = i;
					} else if (monster.smax) {
						delete monster.smax;
					}
					if ((i = this.conditions('emin',condition)) && isNumber(i) && !isNaN(i)) {
						monster.emin = i;
					} else if (monster.emin) {
						delete monster.emin;
					}
					if ((i = this.conditions('emax',condition)) && isNumber(i) && !isNaN(i)) {
						monster.emax = i;
					} else if (monster.emax) {
						delete monster.emax;
					}

					// check for pa ach/max overrides
					if ((i = this.conditions('achpa',condition)) && isNumber(i) && !isNaN(i)) {
						monster.achpa = i;
						if (isNumber(j = this.runtime.monsters[monster.type].avg_damage_per_stamina) && !isNaN(j)) {
							monster.ach = Math.ceil(i * 5 * j);
						}
					} else if (monster.achpa) {
						delete monster.achpa;
					}
					if ((i = this.conditions('maxpa',condition)) && isNumber(i) && !isNaN(i)) {
						monster.maxpa = i;
						if (isNumber(j = this.runtime.monsters[monster.type].avg_damage_per_stamina) && !isNaN(j)) {
							monster.max = Math.ceil(i * 5 * j);
						}
					} else if (monster.maxpa) {
						delete monster.maxpa;
					}

					monster.attack_min = this.conditions('a%',condition) || this.option.min_to_attack;
					if (isNumber(monster.ach) && !isNaN(monster.ach) && (!isNumber(monster.max) || isNaN(monster.max))) {
						monster.max = monster.ach;
					}
					if (isNumber(monster.max) && !isNaN(monster.max) && (!isNumber(monster.ach) || isNaN(monster.ach))) {
						monster.ach = monster.max;
					}
					if (isNumber(monster.max) && !isNaN(monster.max)) {
						monster.ach=Math.min(monster.ach, monster.max);
					}
					if (type.defend) {
						monster.defend_max = Math.min(this.conditions('f%',condition) || this.option.defend, (monster.strength || 100) - 1);
					}
					damage = 0;
					if (monster.damage && monster.damage.user) {
						damage += sum(monster.damage.user);
					}
					if (monster.defend) {
						damage += sum(monster.defend);
					}
					target = monster.max || monster.ach || 0;
					if(!type.raid){
						button_count = ((type.attack.length > 2) ? this.runtime.button.count : type.attack.length);
					}
					req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1	: 5)
							: Math.min(type.attack[Math.min(button_count, monster.smax || type.attack.length)-1], Math.max(type.attack[0], LevelUp.runtime.basehit || monster.smin || this.option.attack_min)) * this.runtime.multiplier.attack;
					req_health = type.raid ? (this.option.risk ? 13 : 10) : 10;
// Don't want to die when attacking a raid
					//log(LOG_WARN, 'monster name ' + type.name + ' basehit ' + LevelUp.runtime.basehit +' min ' + type.attack[Math.min(button_count, monster.smax || type.attack.length)-1]);
					if ((monster.defense || 100) >= monster.attack_min) {
// Set up this.values.attack for use in levelup calcs
						if (type.raid) {
							this.runtime.values.attack = this.runtime.values.attack.concat((this.option.raid.search('x5') < 0) ? 1 : 5).unique();
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
						} else {
							if (damage < this.conditions('ban',condition)) {
								this.runtime.banthus = this.runtime.banthus.concat(type.attack).unique();
							}
							if (type.defend && type.attack.indexOf(1) > -1) {
								this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(1,this.runtime.button.count)).unique();
							} else {
								this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(0,this.runtime.button.count)).unique();
							}
						}
						if ((attack_found === false || attack_found === o)
								&& (waiting_ok || (Player.get('health', 0) >= req_health
								&& LevelUp.runtime.stamina >= req_stamina))
								&& (!this.runtime.banthusNow	
									|| damage < this.conditions('ban',condition))
								&& (!LevelUp.runtime.basehit
									|| type.attack.indexOf(LevelUp.runtime.basehit)>= 0)) {
							button = type.attack_button;
							if (this.option.use_tactics && type.tactics) {
								button = type.tactics_button;
							}
							if (damage < monster.ach
									|| (this.runtime.banthusNow	
										&& damage < this.conditions('ban',condition))
									|| (LevelUp.runtime.basehit
										&& type.attack.indexOf(LevelUp.runtime.basehit)>= 0)) {
								attack_found = o;
								if (attack_found && attack_overach) {
									list.attack = [[mid, damage / sum(monster.damage), button, damage, target]];
									attack_overach = false;
								} else {
									list.attack.push([mid, damage / sum(monster.damage), button, damage, target]);
								}
								//log(LOG_WARN, 'ATTACK monster ' + monster.name + ' ' + type.name);
							} else if ((monster.max === false || damage < monster.max)
									&& !attack_found 
									&& (attack_overach === false || attack_overach === o)) {
								list.attack.push([mid, damage / sum(monster.damage), button, damage, target]);
								attack_overach = o;
							}
						}
					}
					// Possible defend target?
					if (!monster.no_heal && type.defend && this.option.defend_active
							&& (/:big\b/.test(condition)
								|| ((monster.defense || 100) < monster.defend_max))) {
						this.runtime.big = this.runtime.big.concat(type.defend.slice(0,this.runtime.button.count)).unique();
					}
					if (this.option.defend_active && (defend_found === false || defend_found === o)) {
						defense_kind = false;
						if (typeof monster.secondary !== 'undefined' && monster.secondary < 100) {
							//log(LOG_WARN, 'Secondary target found (' + monster.secondary + '%)');
							defense_kind = Monster.secondary_on;
						} else if (monster.warrior && (monster.strength || 100) < 100 && monster.defense < monster.strength - 1) {
							defense_kind = Monster.warrior;
						} else if (!monster.no_heal 
								&& ((/:big\b/.test(condition) && LevelUp.runtime.big)
									|| (monster.defense || 100) < monster.defend_max)) {
							defense_kind = type.defend_button;
						}
						if (defense_kind) {
							this.runtime.values.defend = this.runtime.values.defend.concat(type.defend.slice(0,this.runtime.button.count)).unique();
							//log(LOG_WARN, 'defend ok' + damage + ' ' + LevelUp.runtime.basehit+ ' ' + type.defend.indexOf(LevelUp.runtime.basehit));
							if (!LevelUp.runtime.basehit 
									|| type.defend.indexOf(LevelUp.runtime.basehit)>= 0) {
								if (damage < monster.ach
										|| (/:sec\b/.test(condition)
											&& defense_kind === Monster.secondary_on)) {
									//log(LOG_WARN, 'DEFEND monster ' + monster.name + ' ' + type.name);
									defend_found = o;
								} else if ((monster.max === false || damage < monster.max)
										&& !defend_found && (defend_overach === false  || defend_overach === o)) {
									defend_overach = o;
								} else {
									continue;
								}
								if (defend_found && defend_overach) {
									list.defend = [[mid, damage / sum(monster.damage), defense_kind, damage, target]];
									defend_overach = false;
								} else {
									list.defend.push([mid, damage / sum(monster.damage), defense_kind, damage, target]);
								}
							}
						}
					}
				}
			}
		}
		matched_mids = [];
	} else {
		// Make lists of the possible attack and defend targets
		for (mid in this.data) {
			monster = this.data[mid];
			type = this.types[monster.type];
                        if(!type.raid){
                                button_count = ((type.attack.length > 2) ? this.runtime.button.count : type.attack.length);
                        }
			req_stamina = type.raid ? (this.option.raid.search('x5') === -1 ? 1	: 5)
					: Math.min(type.attack[Math.min(button_count,type.attack.length)-1], Math.max(type.attack[0], LevelUp.runtime.basehit || monster.smin || this.option.attack_min)) * this.runtime.multiplier.attack;
			req_health = type.raid ? (this.option.risk ? 13 : 10) : 10; // Don't want to die when attacking a raid
			monster.ach = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement : (this.option.stop === 'Continuous') ? type.achievement :0;
			monster.max = (this.option.stop === 'Achievement') ? type.achievement : (this.option.stop === '2X Achievement') ? type.achievement*2 : (this.option.stop === 'Continuous') ? type.achievement*this.runtime.limit :0;
			if (	!monster.ignore
					&& monster.state === 'engage'
					&& monster.finish > Date.now()	) {
				uid = mid.replace(/_.+/,'');
				/*jslint eqeqeq:false*/
				if (uid == userID && this.option.own) {
				/*jslint eqeqeq:true*/
					// add own monster
				} else if (this.option.avoid_lost_cause
						&& (monster.eta - monster.finish)/3600000
							> this.option.lost_cause_hours && (!LevelUp.option.override || !LevelUp.runtime.running) && !monster.override) {
					continue;  // Avoid lost cause monster
				} else if (this.option.rescue
						&& (monster.eta
							>= monster.finish - this.option.check_interval)) {
					// Add monster to rescue
				} else if (this.option.stop === 'Achievement'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> (type.achievement || 0)) {
					continue; // Don't add monster over achievement
				} else if (this.option.stop === '2X Achievement'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> type.achievement * 2) {
					continue; // Don't add monster over 2X  achievement
				} else if (this.option.stop === 'Continuous'
						&& sum(monster.damage && monster.damage.user) + sum(monster.defend)
							> type.achievement * limit) {
					continue; // Don't add monster over 2X  achievement
				}
				damage = 0;
				if (monster.damage && monster.damage.user) {
					damage += sum(monster.damage.user);
				}
				if (monster.defend) {
					damage += sum(monster.defend);
				}
				/*jslint eqeqeq:false*/
				if ((uid == userID && this.option.own) || this.option.stop === 'Never') {
				/*jslint eqeqeq:true*/
					target = 1e99;
				} else if (this.option.stop === 'Achievement') {
					target = type.achievement || 0;
				} else if (this.option.stop === '2X Achievement') {
					target = (type.achievement || 0) * 2;
				} else if (this.option.stop === 'Continuous') {
					target = (type.achievement || 0) * limit;
				} else {
					target = 0;
				}
				// Possible attack target?
				if ((waiting_ok || (Player.get('health', 0) >= req_health && LevelUp.runtime.stamina >= req_stamina))
				 && (isNumber(monster.defense) ? monster.defense : 100) >= Math.max(this.option.min_to_attack,0.1)) {
// Set up this.values.attack for use in levelup calcs
					if (type.raid) {
						this.runtime.values.attack = this.runtime.values.attack.concat((this.option.raid.search('x5') < 0) ? 1 : 5).unique();
// If it's a defense monster, never hit for 1 damage.  Otherwise, 1 damage is ok.
					} else if (type.defend && type.attack.indexOf(1) > -1) {
						this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(1,this.runtime.button.count)).unique();
					} else {
						this.runtime.values.attack = this.runtime.values.attack.concat(type.attack.slice(0,this.runtime.button.count)).unique();
					}
					if (this.option.use_tactics && type.tactics) {
						list.attack.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.tactics_button, damage, target]);
					} else {
						list.attack.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.attack_button, damage, target]);
					}
				}
				// Possible defend target?
				if (this.option.defend_active) {
					if(type.defend) {
						this.runtime.values.defend = this.runtime.values.defend.concat(type.defend.slice(0,this.runtime.button.count)).unique();
					}
					if ((monster.secondary || 100) < 100) {
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), Monster.secondary_on, damage, target]);
					} else if (monster.warrior && (monster.strength || 100) < 100){
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), Monster.warrior, damage, target]);
					} else if ((monster.defense || 100) < Math.min(this.option.defend, (monster.strength -1 || 100))
                                                && !monster.no_heal) {
						list.defend.push([mid, (sum(monster.damage && monster.damage.user) + sum(monster.defend)) / sum(monster.damage), type.defend_button, damage, target]);
					}
				}
			}
		}
	}
	this.runtime.defending = list.defend && list.defend.length > 0;
	// If using the priority list and levelup settings, the script may oscillate between having something to defend when in level up, and then forgetting it when it goes to attack something because it doesn't pass levelup in the priority list and tries to quest, and then finds it again.  The following preserves the runtime.defending value even when in force.stamina mode
	if (LevelUp.runtime.force.stamina) {
		this.runtime.defending = this.runtime.levelupdefending;
	} else {
		this.runtime.levelupdefending = this.runtime.defending;
	}
	
	listSortFunc = function(a,b){
		var monster_a = Monster.data[a[0]], monster_b = Monster.data[b[0]], late_a, late_b, time_a, time_b, goal_a, goal_b;
		switch(Monster.option.choice) {
		case 'Any':
			return (Math.random()-0.5);
		case 'Strongest':
			return monster_b.health - monster_a.health;
		case 'Weakest':
			return monster_a.health - monster_b.health;
		case 'Shortest ETD':
			return monster_a.eta - monster_b.eta;
		case 'Longest ETD':
			return monster_b.eta - monster_a.eta;
		case 'Spread':
			return sum(monster_a.stamina) - sum(monster_b.stamina);
		case 'Max Damage':
			return b[1] - a[1];
		case 'Min Damage':
			return a[1] - b[1];
		case 'ETD Maintain':
			late_a = monster_a.eta - monster_a.finish;
			late_b = monster_b.eta - monster_b.finish;
			// this is what used to happen before r655
			//return late_a < late_b ? 1 : (late_a > late_b ? -1 : 0);
			// this should capture the same intent,
			// but continue provide sorting after monsters are caught up
			return late_b - late_a;
		case 'Goal Maintain':
			time_a = Math.max(1, now - Math.min(monster_a.eta || monster_a.finish, monster_a.finish));
			time_b = Math.max(1, now - Math.min(monster_b.eta || monster_b.finish, monster_b.finish));
			// aim a little before the end so we aren't caught short
			time_a = Math.max((time_a + now) / 2, time_a - 14400000); // 4 hours

			time_b = Math.max((time_b + now) / 2, time_b - 14400000);
			goal_a = Math.max(1, a[4] - a[3]);
			goal_b = Math.max(1, b[4] - b[3]);
			return (goal_b / time_b) - (goal_a / time_a);
		}
	};
	for (i in list) {
		// Find best target
		//log(LOG_WARN, 'list ' + i + ' is ' + length(list[i]));
		if (list[i].length) {
			if (list[i].length > 1) {
				list[i].sort(listSortFunc);
			}
			this.runtime[i] = mid = list[i][0][0];
			this.runtime.button[i].query = list[i][0][2];
			uid = mid.replace(/_.+/,'');
			type = this.types[this.data[mid].type];
			fullname[i] = (uid === userID ? 'your ': (this.data[mid].name + '\'s ')) + type.name;
		} else {
			this.runtime[i] = false;
		}
	}
	// Make the * dash messages for current attack and defend targets
	for (i in ensta) {
		if (this.runtime[defatt[i]]) {
			monster = this.data[this.runtime[defatt[i]]];
			type = this.types[monster.type];
			// Calculate what button for att/def and how much energy/stamina cost
			if (ensta[i] === 'stamina' && type.raid) {
				this.runtime[ensta[i]] = this.option.raid.search('x5') < 0 ? 1 : 5;
			} else {
				button_count = ((type.attack.length > 2) ? this.runtime.button.count : type[defatt[i]].length);
				min = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], Math.max(type[defatt[i]][0], LevelUp.runtime.basehit || this.option[defatt[i] + '_min']));
				max = Math.min(type[defatt[i]][Math.min(button_count,type[defatt[i]].length)-1], LevelUp.runtime.basehit || this.option[defatt[i] + '_max'], LevelUp.runtime[ensta[i]] / this.runtime.multiplier[defatt[i]]);
				damage = sum(monster.damage && monster.damage.user) + sum(monster.defend);
				limit = (LevelUp.runtime.big ? max : damage < (monster.ach || damage)
						? monster.ach : damage < (monster.max || damage)
						? monster.max : max);
				max = Math.min(max,(limit - damage)/(this.runtime.monsters[monster.type]['avg_damage_per_'+ensta[i]] || 1)/this.runtime.multiplier[defatt[i]]);
				//log(LOG_WARN, 'monster damage ' + damage + ' average damage ' + (this.runtime.monsters[monster.type]['avg_damage_per_'+ensta[i]] || 1).round(0) + ' limit ' + limit + ' max ' + ensta[i] + ' ' + max.round(1));
				filter = function(e) { return (e >= min && e <= max); };
				this.runtime.button[defatt[i]].pick = bestObjValue(type[defatt[i]], function(e) { return e; }, filter) || type[defatt[i]].indexOf(min);
				//log(LOG_WARN, ' ad ' + defatt[i] + ' min ' + min + ' max ' + max+ ' pick ' + this.runtime.button[defatt[i]].pick);
				//log(LOG_WARN, 'min detail '+ defatt[i] + ' # buttons   ' + Math.min(this.runtime.button.count,type[defatt[i]].length) +' button val ' +type[defatt[i]][Math.min(this.runtime.button.count,type[defatt[i]].length)-1] + ' max of type[0] ' + type[defatt[i]][0] + ' queue or option ' + (LevelUp.runtime.basehit || this.option[defatt[i] + '_min']));
				//log(LOG_WARN, 'max detail '+ defatt[i] + ' physical max ' + type[defatt[i]][Math.min(this.runtime.button.count,type[defatt[i]].length)-1] + ' basehit||option ' + (LevelUp.runtime.basehit || this.option[defatt[i]]) + ' stamina avail ' + (LevelUp.runtime[ensta[i]] / this.runtime.multiplier[defatt[i]]));
				this.runtime[ensta[i]] = type[defatt[i]][this.runtime.button[defatt[i]].pick] * this.runtime.multiplier[defatt[i]];
			}
			this.runtime.health = type.raid ? 13 : 10; // Don't want to die when attacking a raid
			req_health = (defatt[i] === 'attack' ? Math.max(0, this.runtime.health - Player.get('health', 0)) : 0);
			stat_req = Math.max(0, (this.runtime[ensta[i]] || 0) - LevelUp.runtime[ensta[i]]);
			if (stat_req || req_health) {
				messages.push('Waiting for ' + (stat_req ? makeImage(ensta[i]) + stat_req : '')
				+ (stat_req && req_health ? ' &amp; ' : '') + (req_health ? makeImage('health') + req_health : '')
				+ ' to ' + defatt[i] + ' ' + fullname[defatt[i]]
				+ ' (' + makeImage(ensta[i]) + (this.runtime[ensta[i]] || 0) + '+' + (stat_req && req_health ? ', ' : '') + (req_health ? makeImage('health') + req_health : '') + ')');
			} else {
				messages.push(defatt[i] + ' ' + fullname[defatt[i]] + ' (' + makeImage(ensta[i])
						+ (this.runtime[ensta[i]] || 0) + '+)');
				this.runtime.mode = this.runtime.mode || defatt[i];
				this.runtime.stat = this.runtime.stat || ensta[i];
			}
		}
	}
	if (this.runtime.mode === 'attack' && Battle.runtime.points && this.option.points && Battle.runtime.attacking) {
		this.runtime.mode = this.runtime.stat = null;
	}
	// Nothing to attack, so look for monsters we haven't reviewed for a while.
	//log(LOG_WARN, 'attack ' + this.runtime.attack + ' stat_req ' + stat_req + ' health ' + req_health);
	if ((!this.runtime.defend || LevelUp.runtime.energy < this.runtime.energy)
			&& (!this.runtime.attack || stat_req || req_health)) { // stat_req is last calculated in loop above, so ok
		for (mid in this.data) {
			monster = this.data[mid];
			if (!monster.ignore) {
				uid = mid.replace(/_.+/,'');
				type = this.types[monster.type];
				if (monster.state === 'reward' && monster.ac) {
					this.page(mid, 'Collecting Reward from ', 'casuser','&action=collectReward');
				} else if (monster.remove && this.option.remove && parseFloat(uid) !== userID
						&& monster.page !== 'festival') {
					//log(LOG_WARN, 'remove ' + mid + ' userid ' + userID + ' uid ' + uid + ' now ' + (uid === userID) + ' new ' + (parseFloat(uid) === userID));
					this.page(mid, 'Removing ', 'remove_list','');
				} else if (monster.last < Date.now() - this.option.check_interval * (monster.remove ? 5 : 1)) {
					this.page(mid, 'Reviewing ', 'casuser','');
				}
				if (this.runtime.message) {
					return;
				}
			}
		}
	}
	Dashboard.status(this, messages.length ? messages.join('<br>') : 'Nothing to do.');
	if(!Queue.option.pause){
		if(LevelUp.runtime.running){
			this.runtime.limit = 100;
		} else if (!this.runtime.attack){
			this.runtime.limit = (limit > 30)? 1: (limit + 1|0);
		}
	} else {
		this.runtime.limit = 0;
	}
	this._notify('data');// Temporary fix for Dashboard updating
};

Monster.work = function(state) {
	var i, j, target_info = [], battle_list, list = [], mid, uid, type, btn = null, b, mode = this.runtime.mode, stat = this.runtime.stat, monster, title;
	if (!this.runtime.check && !mode) {
		return QUEUE_NO_ACTION;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	if (this.runtime.check) {
		log(LOG_WARN, this.runtime.message);
		Page.to(this.runtime.page, this.runtime.check);
		this.runtime.check = this.runtime.limit = this.runtime.message = this.runtime.dead = false;
		return QUEUE_RELEASE;
	}
	if (mode === 'defend' && LevelUp.get('runtime.quest')) {
		return QUEUE_NO_ACTION;
	}	
	uid = this.runtime[mode].replace(/_\w+/,'');
	monster = this.data[this.runtime[mode]];
	type = this.types[monster.type];
//	if (this.runtime[stat] > LevelUp.runtime[stat] || (LevelUp.runtime.basehit && this.runtime[stat] !== LevelUp.runtime.basehit * this.runtime.multiplier[mode])) {
//		log(LOG_WARN, 'Check for ' + stat + ' burn to catch up ' + this.runtime[stat] + ' burn ' + LevelUp.runtime[stat]);
//		this._remind(0, 'levelup');
//		return QUEUE_RELEASE;
//	}
	if (!Generals.to(Generals.runtime.zin || LevelUp.runtime.general || (this.option['best_'+mode] 
			? (type.raid
				? ((this.option.raid.search('Invade') === -1) ? 'raid-duel' : 'raid-invade')
				: 'monster_' + mode)
			: this.option['general_'+mode]))) {
		return QUEUE_CONTINUE;
	}
	if (type.raid) { // Raid has different buttons
		btn = $(Monster.raid_buttons[this.option.raid]);
	} else {
		//Primary method of finding button.
		log(LOG_WARN, 'Try to ' + mode + ' ' + monster.name + '\'s ' + type.name + ' for ' + this.runtime[stat] + ' ' + stat);
		if (!$(this.runtime.button[mode].query).length || this.runtime.button[mode].pick >= $(this.runtime.button[mode].query).length) {
			//log(LOG_WARN, 'Unable to find '  + mode + ' button for ' + monster.name + '\'s ' + type.name);
		} else {
			//log(LOG_WARN, ' query ' + $(this.runtime.button[mode].query).length + ' ' + this.runtime.button[mode].pick);
			btn = $(this.runtime.button[mode].query).eq(this.runtime.button[mode].pick);
			this.runtime.used[stat] = this.runtime[stat];
		}
		if (!btn || !btn.length){
			monster.button_fail = (monster.button_fail || 0) + 1;
			if (monster.button_fail > 10){
				log(LOG_LOG, 'Ignoring Monster ' + monster.name + '\'s ' + type.name + ': Unable to locate ' + (this.runtime.button[mode].pick || 'unknown') + ' ' + mode + ' button ' + monster.button_fail + ' times!');
				monster.ignore = true;
				monster.button_fail = 0;
			}
		}
	}
	if (!btn || !btn.length 
			|| (['keep_monster_active', 'monster_battle_monster', 'festival_battle_monster'].indexOf(Page.page)<0)
			|| ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') !== uid
				&& $('div[style*="nm_top"] img[linked]').attr('uid') !== uid
				&& $('img[linked][size="square"]').attr('uid') !== uid)) {
		//log(LOG_WARN, 'Reloading page. Button = ' + btn.attr('name'));
		//log(LOG_WARN, 'Reloading page. Page.page = '+ Page.page);
		//log(LOG_WARN, 'Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
		this.page(this.runtime[mode],'','casuser','');
		Page.to(this.runtime.page,this.runtime.check);
		this.runtime.check = null;
		return QUEUE_CONTINUE; // Reload if we can't find the button or we're on the wrong page
	}
	if (type.raid) {
		battle_list = Battle.get('user');
		if (this.option.force1) { // Grab a list of valid targets from the Battle Worker to substitute into the Raid buttons for +1 raid attacks.
			for (i in battle_list) {
				list.push(i);
			}
			$('input[name*="target_id"]').val((list[Math.floor(Math.random() * (list.length))] || 0)); // Changing the ID for the button we're gonna push.
		}
		target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*(\d+).*Army: (\d+)/);
		if ((this.option.armyratio !== 'Any' && ((target_info[1]/Player.get('army')) > this.option.armyratio) && this.option.raid.indexOf('Invade') >= 0) || (this.option.levelratio !== 'Any' && ((target_info[0]/Player.get('level')) > this.option.levelratio) && this.option.raid.indexOf('Invade') === -1)){ // Check our target (first player in Raid list) against our criteria - always get this target even with +1
			log(LOG_LOG, 'No valid Raid target!');
			Page.to('battle_raid', ''); // Force a page reload to change the targets
			return QUEUE_CONTINUE;
		}
	}
	Page.click(btn);
	return QUEUE_RELEASE;
};

Monster.page = function(mid, message, prefix, suffix) {
	var uid, type, monster, mpool, mmid;
	monster = this.data[mid];
	this.runtime.mid = mid;
	uid = mid.replace(/_.+/,'');
	type = this.types[monster.type];
	if (message) {
		this.runtime.message = message + (monster.name ? (monster.name === 'You' ? 'your' : monster.name.html_escape() + '\'s') : '') + ' ' + type.name;
		Dashboard.status(this, this.runtime.message);
	}
	this.runtime.page = type.raid ? 'battle_raid' 
			: monster.page === 'festival' ? 'festival_battle_monster' 
			: 'monster_battle_monster';
	if (monster.page === 'festival') {
		mpool = type.festival_mpool || type.mpool;
		if (type.festival) {
			mmid = '&mid=' + type.festival;
			if (prefix.indexOf('remove_list') >= 0) {
				mmid += '&remove_monsterKey=' + type.festival;
			}
		}
	} else {
		mpool = type.mpool;
	}
	this.runtime.check = prefix + '=' + uid
			+ ((monster.phase && this.option.assist
				&& !LevelUp.runtime.levelup
				&& (monster.state === 'engage' || monster.state === 'assist'))
					? '&action=doObjective' : '')
			+ (mpool ? '&mpool=' + mpool : '')
			+ (mmid ? mmid : '')
			+ suffix;
};


Monster.order = null;
Monster.dashboard = function(sort, rev) {
	var i, j, o, type, monster, args, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
		engage:0,
		assist:1,
		reward:2,
		complete:3
	}, blank, image_url, color, mid, uid, title, v, vv, tt, cc;
	if (typeof sort === 'undefined') {
		this.order = [];
		for (mid in this.data) {
			this.order.push(mid);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	this.order.sort(function(a,b) {
		var aa, bb, data = Monster.data;
		if (state[data[a].state] > state[data[b].state]) {
			return 1;
		}
		if (state[data[a].state] < state[data[b].state]) {
			return -1;
		}
		if (typeof sorttype[sort] === 'string') {
			aa = data[a][sorttype[sort]];
			bb = data[b][sorttype[sort]];
		} else if (sort === 4) { // damage
//			aa = data[a].damage ? data[a].damage[userID] : 0;
//			bb = data[b].damage ? data[b].damage[userID] : 0;
			if (data[a].damage && data[a].damage.user) {
				aa = sum(data[a].damage.user) / sum(data[a].damage);
			}
			if (data[b].damage && data[b].damage.user) {
				bb = sum(data[b].damage.user) / sum(data[b].damage);
			}
		}
		if (typeof aa === 'undefined') {
			return 1;
		} else if (typeof bb === 'undefined') {
			return -1;
		}
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	if (this.option.stop === 'Continuous'){
		th(output, '<center>Continuous=' + this.runtime.limit + '</center>', 'title="Stop Multiplier"');
	} else {
		th(output, '');
	}
	th(output, 'User');
	th(output, 'Health', 'title="(estimated)"');
	th(output, 'Defense', 'title="Composite of Fortification or Dispel (0%...100%)."');
//	th(output, 'Shield');
	th(output, 'Activity');
	th(output, 'Time Left');
	th(output, 'Kill In (ETD)', 'title="(estimated)"');
//	th(output, '');
//	th(output, '');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		mid = this.order[o];
		uid = mid.replace(/_.+/,'');
		monster = this.data[mid];
		festival = monster.page === 'festival';
		type = this.types[monster.type];
		if (!type) {
			continue;
		}
		output = [];
		blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
		// http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
		// http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
		// http://apps.facebook.com/castle_age/raid.php?user=00000
		// http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
		args = '?casuser=' + uid + (type.mpool ? '&mpool=' + (monster.page === 'festival' && type.festival_mpool? type.festival_mpool  : type.mpool) : '') + (monster.page === 'festival' ? ('&mid=' + type.festival) : '');
		if (this.option.assist_links && (monster.state === 'engage' || monster.state === 'assist') && type.siege !== false ) {
			args += '&action=doObjective';
		}
		// link icon
		tt = type.name;
		if (isNumber(v = monster.ach || type.achievement)) {
		    tt += ' | Achievement: ';
			if (isNumber(monster.achpa)) {
				tt += monster.achpa + ' PA' + plural(monster.achpa) + ' (~' + v.SI() + ')';
			} else {
				tt += v.addCommas();
			}
		}
		if (isNumber(v = monster.max)) {
		    tt += ' | Max: ';
			if (isNumber(monster.maxpa)) {
				tt += monster.maxpa + ' PA' + plural(monster.maxpa) + ' (~' + v.SI() + ')';
			} else {
				tt += v.addCommas();
			}
		}
		td(output, Page.makeLink(type.raid ? 'raid.php' : monster.page === 'festival' ? 'festival_battle_monster.php' : 'battle_monster.php', args, '<img src="' + imagepath + type.list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + type.name + '"><strong class="overlay"' + (monster.page === 'festival' ? ' style="color:#ffff00;"' : '') + '>' + monster.state + '</strong>'), 'title="' + tt + '"');
		image_url = imagepath + type.list;
		//log(LOG_WARN, image_url);

		// user
		if (isString(monster.name)) {
			vv = monster.name.html_escape();
		} else {
			vv = '{id:' + uid + '}';
		}
		th(output, '<a class="golem-monster-ignore" name="'+mid+'" title="Toggle Active/Inactive"'+(monster.ignore ? ' style="text-decoration: line-through;"' : '')+'>' + vv + '</a>');

		// health
		td(output,
			blank
				? ''
				: monster.health === 100
					? '100%'
					: monster.health.round(1) + '%',
			blank
				? ''
				: 'title="' + (monster.total - sum(monster.damage)).addCommas() + '"');

		// defense
		vv = tt = cc = '';
		if (!blank && isNumber(monster.defense)) {
			vv = monster.defense.round(1) + '%';
			if (isNumber(monster.strength)) {
				tt = 'Max: ' + monster.strength.round(1) + '% | ';
			}
			tt += 'Attack Bonus: ' + (monster.defense - 50).round(1) + '%';
			if (this.option.defend_active && this.option.defend > monster.defense) {
				cc = 'green';
			} else if (this.option.min_to_attack >= monster.defense) {
				cc = 'blue';
			}
		}
		if (cc !== '') {
			vv = '<span style="color:' + cc + ';">' + vv + '</span>';
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		td(output, vv, tt);

		var activity = sum(monster.damage && monster.damage.user) + sum(monster.defend);
		if (monster.ach > 0 || monster.max > 0) {
			if (monster.max > 0 && activity >= monster.max) {
				color = 'red';
			} else if (monster.ach > 0 && activity >= monster.ach) {
				color = 'orange';
			} else {
				color = 'green';
			}
		} else {
			color = 'black';
		}

		// activity
		td(output,
			(blank || monster.state !== 'engage' || (typeof monster.damage === undefined || typeof monster.damage.user === 'undefined'))
				? ''
				: '<span style="color: ' + color + ';">' + activity.addCommas() + '</span>',
			blank
				? ''
				: 'title="' + ( sum(monster.damage && monster.damage.user) / monster.total * 100).round(2) + '% from ' + (sum(monster.stamina)/5 || 'an unknown number of') + ' PAs"');

		// time left
		td(output,
			blank
				? ''
				: monster.timer
					? Page.addTimer('monster_'+mid+'_finish', monster.finish)
					: '?');

		// etd
		td(output,
			blank
				? ''
				: Page.addTimer('monster_'+mid+'_eta', monster.health === 100 ? monster.finish : monster.eta));
		th(output, '<a class="golem-monster-delete" name="'+mid+'" title="Delete this Monster from the dashboard">[x]</a>');
		th(output, '<a class="golem-monster-override" name="'+mid+'" title="Override Lost Cause setting for this monster">'+(monster.override ? '[O]' : '[]')+'</a>');
                tr(list, output.join(''));
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Monster').html(list.join(''));
	$('a.golem-monster-delete').live('click', function(event){
		Monster.set(['data',$(this).attr('name')]);
		return false;
	});
	$('a.golem-monster-ignore').live('click', function(event){
		var x = $(this).attr('name');
		Monster.set(['data',x,'ignore'], !Monster.get(['data',x,'ignore'], false));
		return false;
	});
	$('a.golem-monster-override').live('click', function(event){
		var x = $(this).attr('name');
		Monster.set(['data',x,'override'], !Monster.get(['data',x,'override'], false));
		return false;
	});
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

Monster.conditions = function (type, conditions) {
	if (!conditions || conditions.toLowerCase().indexOf(':' + type) < 0) {
		return false;
	}
	var value = conditions.substring(conditions.indexOf(':' + type) + type.length + 1).replace(new RegExp(":.+"), ''), first, second;
	if (/k$/i.test(value) || /m$/i.test(value)) {
		first = /\d+k/i.test(value);
		second = /\d+m/i.test(value);
		value = parseFloat(value, 10) * 1000 * (first + second * 1000);
	}
	return parseInt(value, 10);
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.News **********
* Aggregate the news feed
*/
var News = new Worker('News');
News.data = News.temp = null;

News.settings = {
	taint:true
};

News.defaults['castle_age'] = {
	pages:'index'
};

News.runtime = {
	last:0
};

News.parse = function(change) {
	if (change) {
		var xp = 0, bp = 0, wp = 0, win = 0, lose = 0, deaths = 0, cash = 0, i, j, list = [], user = {}, sort = [], last_time = this.get(['runtime','last'], 0), killed = false;
		this.set(['runtime','last'], Date.now());
		$('#'+APPID_+'battleUpdateBox .alertsContainer .alert_content').each(function(i,el) {
			var uid, txt = $(el).text().replace(/,/g, ''), title = $(el).prev().text(), days = title.regex(/(\d+) days/i), hours = title.regex(/(\d+) hours/i), minutes = title.regex(/(\d+) minutes/i), seconds = title.regex(/(\d+) seconds/i), time, my_xp = 0, my_bp = 0, my_wp = 0, my_cash = 0, result;
			time = Date.now() - ((((((((days || 0) * 24) + (hours || 0)) * 60) + (minutes || 59)) * 60) + (seconds || 59)) * 1000);
			if (txt.regex(/You were killed/i)) {
				killed = true;
				deaths++;
			} else {
				uid = $('a:eq(0)', el).attr('href').regex(/user=(\d+)/i);
				user[uid] = user[uid] || {name:$('a:eq(0)', el).text(), win:0, lose:0, deaths:0};
				result = null;
				if (txt.regex(/Victory!/i)) {
					win++;
					user[uid].lose++;
					my_xp = txt.regex(/(\d+) experience/i);
					my_bp = txt.regex(/(\d+) Battle Points!/i);
					my_wp = txt.regex(/(\d+) War Points!/i);
					my_cash = txt.regex(/\$(\d+)/i);
					result = 'win';
				} else {
					lose++;
					user[uid].win++;
					my_xp = 0 - txt.regex(/(\d+) experience/i);
					my_bp = 0 - txt.regex(/(\d+) Battle Points!/i);
					my_wp = 0 - txt.regex(/(\d+) War Points!/i);
					my_cash = 0 - txt.regex(/\$(\d+)/i);
					result = 'loss';
				}
				if (killed) {
					user[uid].deaths++;
					killed = false;
				}
				if (time > last_time) {
//					log('Add to History (+battle): exp = '+my_xp+', bp = '+my_bp+', wp = '+my_wp+', income = '+my_cash);
					time = Math.floor(time / 3600000);
					History.add([time, 'exp+battle'], my_xp);
					History.add([time, 'bp+battle'], my_bp);
					History.add([time, 'wp+battle'], my_wp);
					History.add([time, 'income+battle'], my_cash);
					switch (result) {
						case 'win':
							History.add([time, 'battle+win'], 1);
							break;
						case 'loss':
							History.add([time, 'battle+loss'], -1);
							break;
					}
				}
				xp += my_xp;
				bp += my_bp;
				wp += my_wp;
				cash += my_cash;
				
			}
		});
		if (win || lose) {
			list.push('You were challenged <strong>' + (win + lose) + '</strong> times, winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
			list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(xp).addCommas() + '</span> experience points.');
			list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + Math.abs(cash).addCommas() + '</b></span>.');
			list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(bp).addCommas() + '</span> Battle Points.');
			list.push('You ' + (wp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(wp).addCommas() + '</span> War Points.');
			if (deaths) {
				list.push('You died ' + (deaths>1 ? deaths+' times' : 'once') + '!');
			}
			list.push('');
			for (i in user) {
				sort.push(i);
			}
			sort.sort(function(a,b){return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));});
			for (j=0; j<sort.length; j++) {
				i = sort[j];
				list.push(Page.makeLink('keep.php', {casuser:i}, user[i].name) + ' <a target="_blank" href="http://www.facebook.com/profile.php?id=' + i + '">' + makeImage('facebook') + '</a> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' + plural(user[i].win) : '') + (user[i].lose ? (user[i].win ? (user[i].deaths ? ', ' : ' and ') : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + plural(user[i].lose) : '') + (user[i].deaths ? (user[i].win || user[i].lose ? ' and ' : '') + 'killed you <span class="negative">' + user[i].deaths + '</span> time' + plural(user[i].deaths) : '') + '.');
			}
			$('#'+APPID_+'battleUpdateBox .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
		}
	}
	return true;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Global:true, History, Page:true, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Page for Castle Age **********
* Add defaults to Page for "Castle Age"
* This is the only safe place to change Page.setup, and is deliberately left open for it!
*/

Page.defaults.castle_age = {
	setup:function() {
		this.pageCheck = ['#'+APPID_+'globalContainer', '#'+APPID_+'globalcss', '#'+APPID_+'main_bntp', '#'+APPID_+'main_sts_container', '#'+APPID_+'app_body_container', '#'+APPID_+'nvbar', '#'+APPID_+'current_pg_url', '#'+APPID_+'current_pg_info'];
		// '#app_content_'+APPID, 
		this.pageNames = {
//			facebook:				- not real, but used in worker.pages for worker.parse('facebook') on fb popup dialogs
			index:					{url:'index.php', selector:'#'+APPID_+'indexNewFeaturesBox'},
			quests_quest:			{url:'quests.php', image:'tab_quest_on.gif'}, // If we ever get this then it means a new land...
			quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif'},
			quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif'},
			quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif'},
			quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif'},
			quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif'},
			quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif'},
			quests_quest7:			{url:'quests.php?land=7', image:'tab_underworld_big.gif'},
			quests_quest8:			{url:'quests.php?land=8', image:'tab_heaven_big2.gif'},
			quests_quest9:			{url:'quests.php?land=9', image:'tab_ivory_big.gif'},
			quests_quest10:			{url:'quests.php?land=10', image:'tab_earth2_big.gif'},
			quests_quest11:			{url:'quests.php?land=11', image:'tab_water2_big.gif'},
			quests_quest12:			{url:'quests.php?land=12', image:'tab_mist2_big.gif'},
			quests_quest13:			{url:'quests.php?land=13', image:'tab_mist3_big.gif'},
			quests_quest14:			{url:'quests.php?land=14', image:'tab_fire2_big.gif'},
			quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
			quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
			battle_battle:			{url:'battle.php', image:'battle_on.gif'},
			battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
			battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
			battle_war:				{url:'war_rank.php', image:'tab_war_on.gif'},
			battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
			battle_arena:			{url:'arena.php', image:'arena3_featurebuttonv2.jpg'},

			battle_arena_battle:	{url:'arena_battle.php', selector:'#'+APPID_+'arena_battle_banner_section', skip:true},
			festival_guild:			{url:'festival_battle_home.php', selector:'div[style*="festival_arena_home_background.jpg"]'},
			festival_guild_battle:	{url:'festival_guild_battle.php', selector:'#'+APPID_+'guild_battle_section', skip:true},
			battle_guild:			{url:'guild_current_battles.php', selector:'div[style*="guild_current_battles_title.gif"]'},
			battle_guild_battle:	{url:'guild_battle.php', selector:'#'+APPID_+'guild_battle_banner_section', skip:true},
			battle_war_council:		{url:'war_council.php', image:'war_select_banner.jpg'},
			monster_monster_list:	{url:'player_monster_list.php', image:'monster_button_yourmonster_on.jpg'},
			monster_remove_list:	{url:'player_monster_list.php', image:'mp_current_monsters.gif'},
			monster_battle_monster:	{url:'battle_monster.php', selector:'div[style*="monster_header"]'},
			keep_monster_active:	{url:'raid.php', image:'dragon_view_more.gif'},
			festival_monster_list:	{url:'festival_tower.php?tab=monster',  selector:'div[style*="festival_monster_list_middle.jpg"]'},
			festival_battle_monster:{url:'festival_battle_monster.php', image:'festival_monstertag_list.gif'},
			monster_dead:			{url:'battle_monster.php', selector:'div[style*="no_monster_back.jpg"]'},
			monster_summon:			{url:'monster_summon_list.php', image:'tab_summon_monster_on.gif'},
			monster_class:			{url:'view_class_progress.php', selector:'#'+APPID_+'choose_class_header'},
			heroes_heroes:			{url:'mercenary.php', image:'tab_heroes_on.gif'},
			heroes_generals:		{url:'generals.php', image:'tab_generals_on.gif'},
			town_soldiers:			{url:'soldiers.php', image:'tab_soldiers_on.gif'},
			town_blacksmith:		{url:'item.php', image:'tab_black_smith_on.gif'},
			town_magic:				{url:'magic.php', image:'tab_magic_on.gif'},
			town_land:				{url:'land.php', image:'tab_land_on.gif'},
			oracle_oracle:			{url:'oracle.php', image:'oracle_on.gif'},
			oracle_demipower:		{url:'symbols.php', image:'demi_on.gif'},
			oracle_treasurealpha:	{url:'treasure_chest.php', image:'tab_treasure_alpha_on.gif'},
//			oracle_treasurevanguard:{url:'treasure_chest.php?treasure_set=alpha', image:'tab_treasure_vanguard_on.gif'},
//			oracle_treasureonslaught:{url:'treasure_chest.php?treasure_set=onslaught', image:'tab_treasure_onslaught_on.gif'},
			keep_stats:				{url:'keep.php', image:'tab_stats_on.gif'},
			keep_eliteguard:		{url:'party.php', image:'tab_elite_guard_on.gif'},
			keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
			keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
			army_invite:			{url:'army.php', image:'invite_on.gif'},
			army_gifts:				{url:'gift.php', selector:'#'+APPID_+'giftContainer'},
			army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
			army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'},
			army_newsfeed:			{url:'army_news_feed.php', selector:'#'+APPID_+'army_feed_header'},
			gift_accept:			{url:'gift_accept.php', selector:'div[style*="gift_background.jpg"]'}
//			apprentice_collect:		{url:'apprentice.php?collect=true', image:'ma_view_progress2.gif'}
		}
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources, Window,
	Bank, Battle, Generals, LevelUp, Player:true, Title,
	APP, APPID, log, debug, script_started, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player');
Player.option = Player.runtime = Player.temp = null;

Player.settings = {
	keep:true,
	taint:true
};

Player.defaults['castle_age'] = {
	pages:'*'
};

Player.setup = function() {
	Resources.add('Energy');
	Resources.add('Stamina');
	Resources.add('Gold');
};

Player.init = function() {
	this._trigger('#'+APPID_+'gold_current_value', 'cash');
	this._trigger('#'+APPID_+'energy_current_value', 'energy');
	this._trigger('#'+APPID_+'stamina_current_value', 'stamina');
	this._trigger('#'+APPID_+'health_current_value', 'health');
	this._trigger('#'+APPID_+'gold_time_value', 'cash_timer');
	Title.alias('energy', 'Player:data.energy');
	Title.alias('maxenergy', 'Player:data.maxenergy');
	Title.alias('health', 'Player:data.health');
	Title.alias('maxhealth', 'Player:data.maxhealth');
	Title.alias('stamina', 'Player:data.stamina');
	Title.alias('maxstamina', 'Player:data.maxstamina');
	Title.alias('myname', 'Player:data.myname');
	Title.alias('level', 'Player:data.level');
	Title.alias('exp_needed', 'Player:exp_needed');
	Title.alias('bsi', 'Player:bsi');
	Title.alias('lsi', 'Player:lsi');
	Title.alias('csi', 'Player:csi');
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	this.set('cash_time', script_started + ($('*').html().regex(/gold_increase_ticker\((\d+),/) * 1000));
};

Player.parse = function(change) {
	if (change) {
		return false;
	}
	var i, data = this.data, keep, stats, tmp, $tmp, artifacts = {};
	if ($('#'+APPID_+'energy_current_value').length) {
		this.set('energy', $('#'+APPID_+'energy_current_value').text().regex(/(\d+)/) || 0);
		Resources.add('Energy', data.energy, true);
	}
	if ($('#'+APPID_+'stamina_current_value').length) {
		this.set('stamina', $('#'+APPID_+'stamina_current_value').text().regex(/(\d+)/) || 0);
		Resources.add('Stamina', data.stamina, true);
	}
	if ($('#'+APPID_+'health_current_value').length) {
		this.set('health', $('#'+APPID_+'health_current_value').text().regex(/(\d+)/) || 0);
	}
	if ($('#'+APPID_+'st_2_5 strong:not([title])').length) {
		tmp = $('#'+APPID_+'st_2_5').text().regex(/(\d+)\s*\/\s*(\d+)/);
		if (tmp) {
			this.set('exp', tmp[0]);
			this.set('maxexp', tmp[1]);
		}
	}
	this.set('cash', $('#'+APPID_+'gold_current_value').text().replace(/\D/g, '').regex(/(\d+)/));
	this.set('level', $('#'+APPID_+'st_5').text().regex(/Level: (\d+)!/i));
	this.set('armymax', $('a[href*="army.php"]', '#'+APPID_+'main_bntp').text().regex(/(\d+)/));
	this.set('army', Math.min(data.armymax, 501)); // XXX Need to check what max army is!
	this.set('upgrade', $('a[href*="keep.php"]', '#'+APPID_+'main_bntp').text().regex(/(\d+)/) || 0);
	this.set('general', $('div.general_name_div3').first().text().trim());
	this.set('imagepath', $('#'+APPID_+'globalContainer img:eq(0)').attr('src').pathpart());
	if (Page.page==='keep_stats') {
		keep = $('.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			this.set('myname', $('div.keep_stat_title_inc > span', keep).text().regex(/"(.*)"/));
			tmp = $('td.statsTMainback img[src*="rank_medals"]');
			if (tmp.length) {
				this.set('battle',tmp.attr('src').filepart().regex(/(\d+)/));
			}
			tmp = $('td.statsTMainback img[src*="rank_medals_war"]');
			if (tmp.length) {
				this.set('war', tmp.attr('src').filepart().regex(/(\d+)/));
			}
			stats = $('div.attribute_stat_container', keep);
			this.set('maxenergy', $(stats).eq(0).text().regex(/(\d+)/));
			this.set('maxstamina', $(stats).eq(1).text().regex(/(\d+)/));
			this.set('attack', $(stats).eq(2).text().regex(/(\d+)/));
			this.set('defense', $(stats).eq(3).text().regex(/(\d+)/));
			this.set('maxhealth', $(stats).eq(4).text().regex(/(\d+)/));
			this.set('bank', parseInt($('td.statsTMainback b.money').text().replace(/\D/g,''), 10));
			stats = $('.statsTB table table:contains("Total Income")').text().replace(/[^0-9$]/g,'').regex(/(\d+)\$(\d+)\$(\d+)/);
			this.set('maxincome', stats[0]);
			this.set('upkeep', stats[1]);
			this.set('income', stats[2]);
			Resources.add('Gold', data.bank + data.cash, true);

			// remember artifacts - useful for quest requirements
			$tmp = $('.statsTTitle:contains("ARTIFACTS") + div div div a img');
			if ($tmp.length) {
				$tmp.each(function(i,el){
					if ((tmp = ($(el).attr('title') || $(el).attr('alt') || '').trim())) {
						artifacts[tmp] = $(el).attr('src').filepart();
					}
				});
				this.set(['data','artifact'], artifacts);
			}
		}
	} else if (Page.page === 'town_land') {
		$tmp = $('.layout div[style*="town_header_land."]');
		if ($tmp.length && ($tmp = $('div div:contains("Land Income:")', $tmp)).length) {
			var o = {};
			$('div', $tmp.last().parent()).each(function(a, el) {
				if (!o[a]) o[a] = {};
				o[a].label = ($(el).text() || '').trim();
			});
			$('div', $tmp.last().parent().next()).each(function(a, el) {
				if (!o[a]) o[a] = {};
				o[a].value = ($(el).text() || '').trim();
			});
			//log(LOG_WARN, 'Land.income: ' + JSON.shallow(o, 2));
			for (i in o) {
				if (o[i].label && o[i].value) {
					if (o[i].label.match(/Land Income:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('maxincome', tmp);
						}
					} else if (o[i].label.match(/Upkeep:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('upkeep', tmp);
						}
					} else if (o[i].label.match(/Income per Hour:/i)) {
						if (isNumber(tmp = o[i].value.replace(/\D/g, '').regex(/(\d+)/))) {
							this.set('income', tmp);
						}
					}
				}
			}
		}
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$(\d+).*Cost|stealsGold:\+\$(\d+)|Youreceived\$(\d+)|Yougained\$(\d+)/i)));
		if (txt.regex(/incomepaymentof\$(\d+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$(\d+)gold|backinthemine:Extra(\d+)Gold|Yousuccessfullysold.*for$(\d+)/i)));
		}
	});
	this.set('worth', this.get('cash', 0) + this.get('bank', 0));
	$('#'+APPID_+'gold_current_value').attr('title', 'Cash in Bank: $' + this.get('bank', 0).addCommas());
	return false;
};

Player.update = function(event) {
	if (event.type === 'data' || event.type === 'init') {
		var i, j, types = ['stamina', 'energy', 'health'], list, step;
		for (j=0; j<types.length; j++) {
			list = [];
			step = Divisor(this.data['max'+types[j]]);
			for (i=0; i<=this.data['max'+types[j]]; i+=step) {
				list.push(i);
			}
			if (types[j] === 'stamina') {
				step = this.data['max' + types[j]] || 10;
				for (i in { 1:1, 5:1, 10:1, 20:1, 50:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			} else if (types[j] === 'energy') {
				step = this.data['max' + types[j]] || 15;
				for (i in { 10:1, 20:1, 40:1, 100:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			} else if (types[j] === 'health') {
				step = this.data['max' + types[j]] || 100;
				for (i in { 1:1, 9:1, 10:1, 11:1, 12:1, 13:1 }) {
					if (step >= i) {
						list.push(parseInt(i));
					}
				}
			}
			Config.set(types[j], list.sort(function(a,b){return a-b;}).unique());
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	} else if (event.type === 'trigger') {
		if (event.id === 'cash_timer') {
			this.set(['data', 'cash_time'], (Math.floor(Date.now() / 1000) + $('#'+APPID_+'gold_time_value').text().parseTimer()) * 1000);
		} else {
			this.set(['data', event.id], $(event.selector).text().replace(/\D/g, '').regex(/(\d+)/));
			switch (event.id) {
				case 'energy':	Resources.add('Energy', this.data[event.id], true);	break;
				case 'stamina':	Resources.add('Stamina', this.data[event.id], true);	break;
				case 'cash':	Resources.add('Gold', this.data[event.id], true);	break;
			}
		}
	}
	Dashboard.status(this);
};

Player.get = function(what, def) {
	var data = this.data;
	switch(what) {
		case 'cash_timer':		return (data.cash_time - Date.now()) / 1000;
		case 'energy_timer':	return $('#'+APPID_+'energy_time_value').text().parseTimer();
		case 'health_timer':	return $('#'+APPID_+'health_time_value').text().parseTimer();
		case 'stamina_timer':	return $('#'+APPID_+'stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'bank':			return (data.bank - Bank.option.keep > 0) ? data.bank - Bank.option.keep : 0;
		case 'bsi':				return ((data.attack + data.defense) / data.level).round(2);
		case 'lsi':				return (((data.maxstamina * 2) + data.maxenergy) / data.level).round(2);
		case 'csi':				return ((data.attack + data.defense + (data.maxstamina * 2) + data.maxenergy + data.maxhealth - 100) / data.level).round(2);
		default: return this._get.apply(this, arguments);
	}
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Potions **********
* Automatically drinks potions
*/
var Potions = new Worker('Potions');
Potions.temp = null;

Potions.settings = {
	taint:true
};

Potions.defaults['castle_age'] = {
	pages:'*'
};

Potions.data = {
	Energy:0,
	Stamina:0
};

Potions.option = {
	Energy:35,
	Stamina:35
};

Potions.runtime = {
	type:null,
	amount:0
};

Potions.display = function(){
	var i, opts = [];
	for (i in this.option) {
		if (i.charAt(0) !== '_') {
			opts.push({
				id:i,
				label:'Maximum '+i+' Potions',
				select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,39:39,infinite:'&infin;'},
				help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
			});
		}
	}
	return opts;
};

Potions.setup = function() {
	this.set(['option','energy']); // Remove old data
	this.set(['option','stamina']); // Remove old data
};

Potions.init = function() {
	$('a.golem-potion-drink').live('click', function(event) {
		if (/Do/.test($(this).text())) {
			Potions.set(['runtime','type'], null);
			Potions.set(['runtime','amount'], 0);
		} else {
			Potions.set(['runtime','type'], $(this).attr('name'));
			Potions.set(['runtime','amount'], 1);
		}
	});
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.maxenergy');
	this._watch(Player, 'data.stamina');
	this._watch(Player, 'data.maxstamina');
	this._watch(LevelUp, 'runtime.running');
};

Potions.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	var potions = $('.result_body:contains("You have acquired the Energy Potion!")');
	if (potions.length) {
		Potions.set(['data','Energy'], Potions.data['Energy'] + potions.length);
	}
	if (Page.page === 'keep_stats' && $('.keep_attribute_section').length) {// Only our own keep
		potions = {};
		$('.statsTTitle:contains("CONSUMABLES") + div > div').each(function(i,el){
			var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(\w+) Potion x (\d+)/i);
			if (info && info[0]) {
				potions[info[0]] = info[1];
				// Default only newly discovered potion types to 35
				if (isUndefined(Potions.option[info[0]]) || isNull(Potions.option[info[0]])) {
					Potions.set(['option',info[0]], Potions.option[info[0]] || 35);
				}
			}
		});
		this._replace(['data'], potions);
	}
	return false;
};

Potions.update = function(event) {
	var i, l, txt = [], levelup = LevelUp.get('runtime.running');
	for (i in this.data) {
		if (this.data[i]) {
			l = i.toLowerCase();
			txt.push(makeImage('potion_'+l) + this.data[i] + '/' + this.option[i] + (this.option._disabled ? '' : ' <a class="golem-potion-drink" name="'+i+'" title="Drink one of this potion">' + (this.runtime.type === i ? '[Don\'t Drink]' : '[Drink]') + '</a>'));
		}
		if (!levelup && isNumber(this.option[i]) && this.data[i] > this.option[i] && Player.get(l, 0) + 10 < Player.get('max' + l, 0)) {
			this.set(['runtime','type'], i);
			this.set(['runtime','amount'], 1);
		}
	}
	if (!this.option._disabled && this.runtime.type && this.runtime.amount){
		txt.push('Drinking ' + this.runtime.amount + 'x ' + this.runtime.type + ' potion');
	}
	Dashboard.status(this, txt.join(', '));
	this.set(['option','_sleep'], !this.runtime.type || !this.runtime.amount);
};

Potions.work = function(state) {
	if (state && this.runtime.type && this.runtime.amount && Page.to('keep_stats')) {
		log(LOG_WARN, 'Wanting to drink a ' + this.runtime.type + ' potion');
		Page.click('.statUnit:contains("' + this.runtime.type + '") form .imgButton input');
		this.set(['runtime','type'], null);
		this.set(['runtime','amount'], 0);
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Alchemy, Bank, Battle, Generals, LevelUp, Monster, Player, Town,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.settings = {
	//taint:true
};

Quest.defaults['castle_age'] = {
	pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_quest9 quests_quest10 quests_quest11 quests_quest12 quests_quest13 quests_quest14 quests_demiquests quests_atlantis'
};

Quest.option = {
	general:true,
	general_choice:'any',
	what:'Influence',
	ignorecomplete:true,
	unique:true,
	monster:'When able',
	bank:true,
	energy_reserve:0
};

Quest.runtime = {
	best:null,
	energy:0
};

Quest.data = {
	id: {}
};

Quest.temp = {
	order: []
};

Quest.land = [
	'Land of Fire',
	'Land of Earth',
	'Land of Mist',
	'Land of Water',
	'Demon Realm',
	'Undead Realm',
	'Underworld',
	'Kingdom of Heaven',
	'Ivory City',
	'Earth II',
	'Water II',
	'Mist II',
	'Mist III',
	'Fire II'
];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'energy_reserve',
		label:'Energy Reserve',
		select:'energy',
		help:'Keep this much energy in reserve for other workers.'
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward',
		help:'Cartigan will try to collect all items needed to summon Cartigan (via Alchemy), then cascades to Advancement.' +
		  ' Vampire Lord will try to collect 24 (for Calista), then cascades to Advancement.' +
		  ' Subquests (quick general levelling) will only run subquests under 100% influence, then cascades to Advancement.' +
		  ' Advancement will run viable quests to unlock all areas, then cascades to Influence.' +
		  ' Influence will run all viable influence gaining quests, then cascade to Experience.' +
		  ' Inf+Exp will run the best viable experience quests under 100% influence, then cascade to Experience.' +
		  ' Inf+Cash will run the best viable cash quests under 100% influence, then cascade to Cash.' +
		  ' Experience runs only the best experience quests.' +
		  ' Cash runs only the best cash quests.'
	},{
		advanced:true,
		id:'ignorecomplete',
		label:'Only do incomplete quests',
		checkbox:true,
		help:'Will only do quests that aren\'t at 100% influence',
		require:'what=="Cartigan" || what=="Vampire Lord"'
	},{
		id:'unique',
		label:'Get Unique Items First',
		checkbox:true
	},{
		id:'monster',
		label:'Fortify',
		select: ['Never','When able','Wait for']
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	}
];

Quest.setup = function() {
	Resources.use('Energy');
};

Quest.init = function() {
	var data = this.get('data'), runtime = this.get('runtime'), revision = this.get(['runtime','revision'], 0), i, j, r, x;
	// BEGIN: Fix for *old* bad page loads
	for (i in data) {
		if (i.indexOf('\t') !== -1) {
			delete data[i];
		}
	}
	// END
	// BEGIN: Fix for option type changes
	if (this.option.monster === true) {
		this.set(['option','monster'], 'When able');
	} else if (this.option.monster === false) {
		this.set(['option','monster'], 'Never');
	}
	// END
	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END
	// BEGIN: one time pre-r845 fix for erroneous values in m_c, m_d, reps, eff
	if (revision < 845) {
		for (i in data) {
			if (data[i].reps) {
				x = this.wiki_reps(data[i], true);
				if (data[i].reps < Math.round(x * 0.8) || data[i].reps > Math.round(x * 1.2)) {
					log(LOG_WARN, 'Quest.init: deleting metrics for: ' + i);
					delete data[i].m_c;
					delete data[i].m_d;
					delete data[i].reps;
					delete data[i].eff;
				}
			}
		}
	}
	// END
	// BEGIN: one time pre-r850 fix to map data by id instead of name
	if (revision < 850) {
		runtime.best = null;
		runtime.energy = 0;
		if (runtime.quest) {
			delete runtime.quest;
		}
		if (!('id' in data) && ('Pursuing Orcs' in data)) {
			x = {};

			if (!('id' in data)) {
				data.id = {};
			}

			for (i in data) {
				if (i === 'id' || i === 'q') {
					continue;
				}
				if ('id' in data[i]) {
					data.id[data[i].id] = data[i];
					delete data[i].id;
				} else {
					if (!('q' in data)) {
						data.q = {};
					}
					data.q[i] = data[i];
				}
				x[i] = 1;
			}

			for (i in x) {
				delete data[i];
			}
		}
	}
	// END
	this.set(['runtime','revision'], revision); // started r845 for historic reference
	this._watch(Player, 'data.energy');
	this._watch(Player, 'data.maxenergy');
};

Quest.parse = function(change) {
	var data = this.data, last_main = 0, area = null, land = null, i, j, m_c, m_d, m_l, m_i, reps, purge = {}, quests, el, id, name, level, influence, reward, energy, exp, tmp, type, units, item, icon, c;
	if (Page.page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest(\d+)/i) - 1;
	}
	for (i in data.id) {
		if (data.id[i].area === area && (area !== 'quest' || data.id[i].land === land)) {
			purge[i] = true;
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(Page.page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	quests = $('div.quests_background,div.quests_background_sub,div.quests_background_special');
	for (i=0; i<quests.length; i++) {
		el = quests[i];
		try {
			tmp = $('input[name="quest"]', el);
			if (!tmp.length || !tmp.val()) {
				continue;
			}
			assert(id = parseInt(tmp.val() || '0'), 'Bad quest id: '+tmp.val());
			this._transaction(); // BEGIN TRANSACTION
			delete purge[id]; // We've found it, and further errors shouldn't delete it
			name = undefined;
			type = undefined;
			level = undefined;
			influence = undefined;
			energy = undefined;
			exp = undefined;
			reward = undefined;
			if ($(el).hasClass('quests_background_sub')) { // Subquest
				name = $('.quest_sub_title', el).text().trim();
				assert((tmp = $('.qd_2_sub', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000')), 'Unknown rewards');
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
				energy = $('.quest_req_sub', el).text().regex(/\b(\d+)\s*Energy\b/im);
				tmp = $('.quest_sub_progress', el).text();
				level = tmp.regex(/\bLEVEL:?\s*(\d+)\b/im);
				influence = tmp.regex(/\bINFLUENCE:?\s*(\d+)%/im);
				type = 2;
			} else {
				name = $('.qd_1 b', el).text().trim();
				assert((tmp = $('.qd_2', el).text().replace(/\s+/gm, ' ').replace(/,/g, '').replace(/mil\b/gi, '000000')), 'Unknown rewards');
				exp = tmp.regex(/\b(\d+)\s*Exp\b/im);
				reward = tmp.regex(/\$\s*(\d+)\s*-\s*\$\s*(\d+)\b/im);
				energy = $('.quest_req', el).text().regex(/\b(\d+)\s*Energy\b/im);
				if ($(el).hasClass('quests_background')) { // Main quest
					last_main = id;
					tmp = $('.quest_progress', el).text();
					level = tmp.regex(/\bLEVEL:?\s*(\d+)\b/im);
					influence = tmp.regex(/\bINFLUENCE:?\s*(\d+)%/im);
					type = 1;
				} else { // Special / boss Quest
					type = 3;
				}
			}
			assert(name && name.indexOf('\t') === -1, 'Bad quest name - found tab character');
			this.set(['data','id',id,'button_fail'], 0);
			assert(this.set(['data','id',id,'name'], name, 'string'), 'Bad quest name: '+name);
			assert(this.set(['data','id',id,'area'], area, 'string'), 'Bad area name: '+area);
			assert(this.set(['data','id',id,'type'], type, 'number'), 'Unknown quest type: '+name);
			assert(this.set(['data','id',id,'exp'], exp, 'number'), 'Unknown exp reward');
			assert(this.set(['data','id',id,'reward'], (reward[0] + reward[1]) / 2), 'Bad money reward');
			this.set(['data','id',id,'energy'], energy);
			this.set(['data','id',id,'land'], isNumber(land) ? land : undefined);
			this.set(['data','id',id,'main'], type === 2 && last_main ? last_main : undefined);
			if (isNumber(influence)) {
				m_l = this.get(['data','id',id,'level'], 0, 'number'); // last influence value
				m_i = this.get(['data','id',id,'influence'], 0, 'number'); // last influence value
				this.set(['data','id',id,'level'], level || 0);
				this.set(['data','id',id,'influence'], influence);
				m_c = this.get(['data','id',id,'m_c'], 0, 'number'); // percentage count metric
				m_d = this.get(['data','id',id,'m_d'], 0, 'number'); // percentage delta metric
				reps = this.get(['data','id',id,'reps'], 0, 'number'); // average reps needed per level
				if (m_l === (level || 0) && m_i < influence && influence < 100) {
					m_d += influence - m_i;
					m_c++;
				}
				if (m_c && m_d) {
					this.set(['data','id',id,'m_c'], m_c);
					this.set(['data','id',id,'m_d'], m_d);
					reps = Math.ceil(m_c * 100 / m_d);
				}
				if (reps) {
					this.set(['data','id',id,'reps'], reps);
					this.set(['data','id',id,'eff'], energy * reps);
				}
			}
			if (type !== 2) { // That's everything for subquests
				this.set(['data','id',id,'unique'], type === 3 ? true : undefined); // Special / boss quests create unique items
				tmp = $('.qd_1 img', el).last();
				if (tmp.length && (item = tmp.attr('title'))) {
					item = item.replace(/\s+/gm, ' ').trim();
					icon = (tmp.attr('src') || '').filepart();
					item = Town.qualify(item, icon);
					this.set(['data','id',id,'item'], item);
					this.set(['data','id',id,'itemimg'], icon);
				}
				units = $('.quest_req >div >div >div', el);
				for (j=0; j<units.length; j++) {
					item = ($('img', units[j]).attr('title') || '').replace(/\s+/gm, ' ').trim();
					icon = ($('img', units[j]).attr('src') || '').filepart();
					item = Town.qualify(item, icon);
					c = ($(units[j]).text() || '').regex(/\bx\s*(\d+)\b/im);
					this.set(['data','id',id,'units',item], c);
				}
				tmp = $('.quest_act_gen img', el).attr('title');
				this.set(['data','id',id,'general'], tmp || undefined);
			}
			this._transaction(true); // COMMIT TRANSACTION
		} catch(e) {
			this._transaction(false); // ROLLBACK TRANSACTION on any error
			log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
		}
	}
	for (i in purge) {
		log(LOG_WARN, 'Deleting ' + i + '(' + (this.land[data.id[i].land] || data.id[i].area) + ')');
		this.set(['data','id',i]); // Delete unseen quests...
	}
	return false;
};

  // watch specific Generals if doing an alchemy quest giving a general
  // watch specific Town if doing an alchemy quest giving an item/unit
  // watch Generals if we passed up a preferred quest due to a missing req.
  // watch Town if we passed up a preferred quest due to a missing req.

Quest.update = function(event) {
	if (event.worker.name === 'Town' && event.type !== 'data') {
		return; // Missing quest requirements
	}
	var i, unit, own, need, noCanDo = false, best = null, best_cartigan = null, best_vampire = null, best_subquest = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, has_cartigan = false, has_vampire = false, list = [], items = {}, data = this.data, maxenergy = Player.get('maxenergy',999), eff, best_adv_eff = 1e10, best_inf_eff = 1e10, cmp, oi, ob;
	// First let's update the Quest dropdown list(s)...
	if (event.type === 'init' || event.type === 'data') {
		for (i in data.id) {
			if (data.id[i].item && data.id[i].type !== 3) {
				list.push(data.id[i].item);
			}
			for (unit in data.id[i].units) {
				items[unit] = Math.max(items[unit] || 0, data.id[i].units[unit]);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Cartigan', 'Vampire Lord', 'Subquests', 'Advancement', 'Influence', 'Inf+Exp', 'Experience', 'Inf+Cash', 'Cash'].concat(list.unique().sort()));
		for (unit in items) {
			if (Resources.get(['data','_'+unit,'quest'], -1) !== items[unit]) {
				Resources.set(['data','_'+unit,'quest'], items[unit]);
			}
		}
	}
	// Now choose the next quest...
	if (this.option.unique) {// Boss monster quests first - to unlock the next area
		for (i in data.id) {
			if (data.id[i].energy > maxenergy) {// Skip quests we can't afford
				continue;
			}
			if (data.id[i].type === 3 && !Alchemy.get(['ingredients', data.id[i].itemimg], 0, 'number') && (!best || data.id[i].energy < data.id[best].energy)) {
				best = i;
			}
		}
	}
	if (!best && this.option.what !== 'Nothing') {
		if (this.option.what !== 'Vampire Lord' || Town.get(['Vampire Lord', 'own'], 0, 'number') >= 24) {
			has_vampire = true; // Stop trying once we've got the required number of Vampire Lords
		}
		if (this.option.what !== 'Cartigan' || Generals.get(['data','Cartigan','own'], 0, 'number') || (Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') >= 3 && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') >= 3)) {
			// Sword of the Faithless x3 - The Long Path, Burning Gates
			// Crystal of Lament x3 - Fiery Awakening
			// Soul Eater x3 - Fire and Brimstone, Deathrune Castle
			has_cartigan = true; // Stop trying once we've got the general or the ingredients
		}
//		log(LOG_WARN, 'option = ' + this.option.what);
//		best = (this.runtime.best && data.id[this.runtime.best] && (data.id[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in data.id) {
			// Skip quests we can't afford or can't equip the general for
			oi = data.id[i];
			if (oi.energy > maxenergy 
					|| !Generals.test(oi.general || 'any')
					|| (LevelUp.runtime.general && oi.general)) {
				continue;
			}
			if (oi.units) {
				own = 0;
				need = 0;
				noCanDo = false;
				for (unit in oi.units) {
					need = oi.units[unit];
					if (!Player.get(['artifact', i]) || need !== 1) {
						own = Town.get([unit, 'own'], 0, 'number');
						if (need > own) {	// Need more than we own, skip this quest.
							noCanDo = true;	// set flag
							break;	// no need to check more prerequisites.
						}
					}
				}
				if (noCanDo) {
					continue;	// Skip to the next quest in the list
				}
			}
			eff = oi.eff || (oi.energy * this.wiki_reps(oi));
			if (0 < (oi.influence || 0) && (oi.influence || 0) < 100) {
				eff = Math.ceil(eff * (100 - oi.influence) / 100);
			}
			switch(this.option.what) { // Automatically fallback on type - but without changing option
				case 'Vampire Lord': // Main quests or last subquest (can't check) in Undead Realm
					ob = data.id[best_vampire];
					// order: inf<100, <energy, >exp, >cash (vampire)
					if (!has_vampire && isNumber(oi.land) &&
					  oi.land === 5 && oi.type === 1 &&
					  (!this.option.ignorecomplete || (isNumber(oi.influence) && oi.influence < 100)) &&
					  (!best_vampire ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_vampire = i;
					}// Deliberate fallthrough
				case 'Cartigan': // Random Encounters in various Underworld Quests
					ob = data.id[best_cartigan];
					// order: inf<100, <energy, >exp, >cash (cartigan)
					if (!has_cartigan && isNumber(oi.land) && data.id[i].land === 6 &&
					  (!this.option.ignorecomplete || (isNumber(oi.influence) && oi.influence < 100)) &&
					  (((data.id[oi.main || i].name === 'The Long Path' || data.id[oi.main || i].name === 'Burning Gates') && Alchemy.get(['ingredients', 'eq_underworld_sword.jpg'], 0, 'number') < 3) ||
					  ((data.id[oi.main || i].name === 'Fiery Awakening') && Alchemy.get(['ingredients', 'eq_underworld_amulet.jpg'], 0, 'number') < 3) ||
					  ((data.id[oi.main || i].name === 'Fire and Brimstone' || data.id[oi.main || i].name === 'Deathrune Castle') && Alchemy.get(['ingredients', 'eq_underworld_gauntlet.jpg'], 0, 'number') < 3)) &&
					  (!best_cartigan ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_cartigan = i;
					}// Deliberate fallthrough
				case 'Subquests': // Find the cheapest energy cost *sub*quest with influence under 100%
					ob = data.id[best_subquest];
					// order: <energy, >exp, >cash (subquests)
					if (oi.type === 2 && isNumber(oi.influence) && oi.influence < 100 &&
					  (!best_subquest ||
					  (cmp = oi.energy - ob.energy) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best_subquest = i;
					}// Deliberate fallthrough
				case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
					if (isNumber(oi.land) && oi.land > best_land) { // No need to revisit old lands - leave them to Influence
						best_land = oi.land;
						best_advancement = null;
						best_adv_eff = 1e10;
					}
					ob = data.id[best_advancement];
					// order: <effort, >exp, >cash, <energy (advancement)
					if (oi.type !== 2 && isNumber(oi.land) &&
					  //oi.level === 1 &&  // Need to check if necessary to do boss to unlock next land without requiring orb
					  oi.land >= best_land &&
					  ((isNumber(oi.influence) && Generals.test(oi.general) && oi.level <= 1 && oi.influence < 100) || (oi.type === 3 && !Alchemy.get(['ingredients', oi.itemimg], 0, 'number'))) &&
					  (!best_advancement ||
					  (cmp = eff - best_adv_eff) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0))) {
						best_land = Math.max(best_land, oi.land);
						best_advancement = i;
						best_adv_eff = eff;
					}// Deliberate fallthrough
				case 'Influence': // Find the cheapest energy cost quest with influence under 100%
					ob = data.id[best_influence];
					// order: <effort, >exp, >cash, <energy (influence)
					if (isNumber(oi.influence) &&
					  (!oi.general || Generals.test(oi.general)) &&
					  oi.influence < 100 &&
					  (!best_influence ||
					  (cmp = eff - best_inf_eff) < 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0))) {
						best_influence = i;
						best_inf_eff = eff;
					}// Deliberate fallthrough
				case 'Experience': // Find the best exp per energy quest
					ob = data.id[best_experience];
					// order: >exp, inf<100, >cash, <energy (experience)
					if (!best_experience ||
					  (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best_experience = i;
					}
					break;
				case 'Inf+Exp': // Find the best exp per energy quest, favouring quests needing influence
					ob = data.id[best_experience];
					// order: inf<100, >exp, >cash, <energy (inf+exp)
					if (!best_experience ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best_experience = i;
					}
					break;
				case 'Inf+Cash': // Find the best (average) cash per energy quest, favouring quests needing influence
					ob = data.id[best];
					// order: inf<100, >cash, >exp, <energy (inf+cash)
					if (!best ||
					  (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0 ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best = i;
					}
					break;
				case 'Cash': // Find the best (average) cash per energy quest
					ob = data.id[best];
					// order: >cash, inf<100, >exp, <energy (cash)
					if (!best ||
					  (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = oi.energy - ob.energy) < 0)) {
						best = i;
					}
					break;
				default: // For everything else, there's (cheap energy) items...
					ob = data.id[best];
					// order: <energy, inf<100, >exp, >cash (item)
					if (oi.item === this.option.what &&
					  (!best ||
					  (cmp = oi.energy - ob.energy) < 0 ||
					  (!cmp && (cmp = (isNumber(oi.influence) && oi.influence < 100 ? 1 : 0) - (isNumber(ob.influence) && ob.influence < 100 ? 1 : 0)) > 0) ||
					  (!cmp && (cmp = (oi.exp / oi.energy) - (ob.exp / ob.energy)) > 0) ||
					  (!cmp && (cmp = (oi.reward / oi.energy) - (ob.reward / ob.energy)) > 0))) {
						best = i;
					}
					break;
			}
		}
		switch(this.option.what) { // Automatically fallback on type - but without changing option
			case 'Vampire Lord':best = best_vampire || best_advancement || best_influence || best_experience;break;
			case 'Cartigan':	best = best_cartigan || best_advancement || best_influence || best_experience;break;
			case 'Subquests':	best = best_subquest || best_advancement || best_influence || best_experience;break;
			case 'Advancement':	best = best_advancement || best_influence || best_experience;break;
			case 'Influence':	best = best_influence || best_experience;break;
			case 'Inf+Exp':		best = best_experience;break;
			case 'Experience':	best = best_experience;break;
			default:break;
		}
	}
	if (best !== this.runtime.best) {
		this.set(['runtime','best'], best);
		if (best) {
			this.set(['runtime','energy'], data.id[best].energy);
			log(LOG_WARN, 'Wanting to perform - ' + data.id[best].name + ' in ' + (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ' (energy: ' + data.id[best].energy + ', experience: ' + data.id[best].exp + ', gold: $' + data.id[best].reward.SI() + ')');
		}
	}
	if (best) {
		Dashboard.status(this, (isNumber(data.id[best].land) ? this.land[data.id[best].land] : this.area[data.id[best].area]) + ': ' + data.id[best].name + ' (' + makeImage('energy') + data.id[best].energy + ' = ' + makeImage('exp') + data.id[best].exp + ' + ' + makeImage('gold') + '$' + data.id[best].reward.SI() + (data.id[best].item ? Town.get([data.id[best].item,'img'], null) ? ' + <img style="width:16px;height:16px;margin-bottom:-4px;" src="' + imagepath + Town.get([data.id[best].item, 'img']) + '" title="' + data.id[best].item + '">' : ' + ' + data.id[best].item : '') + (isNumber(data.id[best].influence) && data.id[best].influence < 100 ? (' @ ' + makeImage('percent','Influence') + data.id[best].influence + '%') : '') + ')');
	} else {
		Dashboard.status(this);
	}
//	this.set(['option','_sleep'], !this.runtime.best || this.runtime.energy < (LevelUp.runtime.force.energy ? LevelUp.runtime.energy : LevelUp.runtime.energy - this.option.energy_reserve));
};

Quest.work = function(state) {
	var mid, general = 'any', best = LevelUp.runtime.quest || this.runtime.best, useable_energy = LevelUp.runtime.force.energy ? LevelUp.runtime.energy : LevelUp.runtime.energy - this.option.energy_reserve, quest, button;
	if (!best || (!LevelUp.runtime.quest && this.runtime.energy > useable_energy)) {
		if (state && this.option.bank && !Bank.stash()) {
			return QUEUE_CONTINUE;
		}
		return QUEUE_FINISH;
	}
	// If holding for fortify, then don't quest if we have a secondary or defend target possible, unless we're forcing energy.
	if ((LevelUp.runtime.levelup && !LevelUp.runtime.quest)
			|| (!LevelUp.runtime.levelup 
				&& ((this.option.monster === 'When able' && Monster.get('runtime.defending')) 
					|| (this.option.monster === 'Wait for' && (Monster.get('runtime.defending')
						|| !LevelUp.runtime.force.energy))))) {
		return QUEUE_FINISH;
	}
	if (!state) {
		return QUEUE_CONTINUE;
	}
	 quest = this.data.id[best]
	if (this.option.general) {
		if (quest.general && isNumber(quest.influence) && quest.influence < 100) {
			general = quest.general;
		} else {
			general = Generals.best('under max level');
			switch(this.option.what) {
				case 'Vampire Lord':
				case 'Cartigan':
					if (quest.general) {
						general = quest.general;
					} else {
						if (general === 'any' && isNumber(quest.influence) && quest.influence < 100) {
							general = Generals.best('influence');
						}
						if (general === 'any') {
							general = Generals.best('item');
						}
					}
					break;
				case 'Subquests':
				case 'Advancement':
				case 'Influence':
				case 'Inf+Exp':
				case 'Experience':
				case 'Inf+Cash':
				case 'Cash':
					if (isNumber(quest.influence) && quest.influence < 100) {
						if (quest.general) {
							general = quest.general;
						} else if (general === 'any') {
							general = Generals.best('influence');
						}
					}
					break;
				default:
					if (isNumber(quest.influence) && quest.influence < 100) {
						if (quest.general) {
							general = quest.general;
						} else if (general === 'any') {
							general = Generals.best('influence');
						}
					}
					if (general === 'any') {
						general = Generals.best('item');
					}
					break;
			}
			if (general === 'any') {
				general = 'cash';
			}
		}
	} else {
		general = this.option.general_choice;
	}
	if (!Generals.to(LevelUp.runtime.general || general)) {
		return QUEUE_CONTINUE;
	}
	button = $('input[name="quest"][value="' + best + '"]').siblings('.imgButton').children('input[type="image"]');
	log(LOG_WARN, 'Performing - ' + quest.name + ' (energy: ' + quest.energy + ')');
	//log(LOG_WARN,'Quest ' + quest.name + ' general ' + quest.general + ' test ' + !Generals.test(quest.general || 'any') + ' this.data || '+ (quest.general || 'any') + ' queue ' + (LevelUp.runtime.general && quest.general));
	if (!button || !button.length) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		quest.button_fail = (quest.button_fail || 0) + 1;
		if (quest.button_fail > 5){
			log(LOG_WARN, 'Can\'t find button for ' + quest.name + ', so deleting and re-visiting page...');
			delete quest;
			this.runtime.best = null;
			Page.reload();
			return QUEUE_RELEASE;
		} else {
			switch(quest.area) {
			case 'quest':
				Page.to('quests_quest' + (quest.land + 1),null,true);
				return QUEUE_CONTINUE;
			case 'demiquest':
				Page.to('quests_demiquests',null,true);
				return QUEUE_CONTINUE;
			case 'atlantis':
				Page.to('quests_atlantis',null,true);
				return QUEUE_CONTINUE;
			default:
				log(LOG_LOG, 'Can\'t get to quest area!');
				return QUEUE_FINISH;
			}
		}
	}
	Page.click(button);
	LevelUp.set(['runtime','quest'], null);
	if (quest.type === 3) {// Just completed a boss quest
		if (!Alchemy.get(['ingredients', quest.itemimg], 0, 'number')) {// Add one as we've just gained it...
			Alchemy.set(['ingredients', quest.itemimg], 1);
		}
		// This won't work since we just clicked the quest above.
		if (this.option.what === 'Advancement' && Page.pageNames['quests_quest' + (quest.land + 2)]) {// If we just completed a boss quest, check for a new quest land.
			Page.to('quests_quest' + (quest.land + 2));// Go visit the next land as we've just unlocked it...
		}
	}
	return QUEUE_RELEASE;
};

Quest.dashboard = function(sort, rev) {
	var self = this, i, j, k, o, r, quest, list = [], output = [], vv, tt, cc, span, v, eff;
	if (typeof sort === 'undefined') {
		this.temp.order = [];
		for (i in this.data.id) {
			this.temp.order.push(i);
		}
	}
	if (typeof sort === 'undefined') {
		sort = (this.runtime.sort || 1);
	}
	if (typeof rev === 'undefined'){
		rev = (this.runtime.rev || false);
	}
	this.runtime.sort = sort;
	this.runtime.rev = rev;
	function getValue(q){
		var r, n, o = self.data.id[q];
		switch(sort) {
			case 0:	// general
				return o.general || 'zzz';
			case 1: // name
				return o.name || 'zzz';
			case 2: // area
				return isNumber(o.land) && typeof self.land[o.land] !== 'undefined' ? self.land[o.land] : self.area[o.area];
			case 3: // level
				return (isNumber(o.level) ? o.level : -1) * 100 + (o.influence || 0);
			case 4: // energy
				return o.energy;
			case 5: // effort
				return o.eff || (o.energy * self.wiki_reps(o));
			case 6: // exp
				return o.exp / o.energy;
			case 7: // reward
				return o.reward / o.energy;
			case 8: // item
				return o.item || 'zzz';
		}
		return 0; // unknown
	}
	this.temp.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (isString(aa) || isString(bb)) {
			return (rev ? (''+bb).localeCompare(aa) : (''+aa).localeCompare(bb));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, 'General');
	th(output, 'Name');
	th(output, 'Area');
	th(output, 'Level');
	th(output, 'Energy');
	th(output, 'Effort', 'title="Energy required per influence level."');
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.temp.order.length; o++) {
		i = this.temp.order[o];
		quest = this.data.id[i];
		output = [];

		// general
		td(output, Generals.get([quest.general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([quest.general, 'img']) + '" alt="' + quest.general + '" title="' + quest.general + '">' : '');

		// name
		vv = quest.name;
		span = cc = '';
		tt = 'id: ' + i;
		if (quest.main) {
			tt += ' | main:';
			if (this.data.id[quest.main] && this.data.id[quest.main].name) {
				tt += ' ' + this.data.id[quest.main].name;
			}
			tt += ' (id: ' + quest.main + ')';
		}
		if (this.runtime.best === i) {
			vv = '<b>' + vv + '</b>';
			cc = 'green';
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		th(output, vv, tt);

		// area
		td(output, isNumber(quest.land) ? this.land[quest.land].replace(' ','&nbsp;') : this.area[quest.area].replace(' ','&nbsp;'));

		// level
		span = vv = tt = cc = '';
		if (isNumber(v = quest.level)) {
			vv = v + '&nbsp;(' + quest.influence + '%)';
			if (v >= 4 && quest.influence >= 100) {
				cc = 'red';
			} else if (this.cost(i)) {
				cc = 'blue';
				if (tt !== '') {
					tt += '; ';
				}
				tt += this.temp.desc;
			} else if (isNumber(quest.influence) && quest.influence < 100) {
				cc = 'green';
			}
		} else if (this.cost(i)) {
			vv = '<i>n/a</i>';
			cc = 'blue';
			if (tt !== '') {
				tt += '; ';
			}
			tt += this.temp.desc;
		}
		if (tt !== '') {
			tt = 'title="' + tt + '"';
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv, tt);

		// energy
		td(output, quest.energy);

		// effort
		vv = tt = cc = span = '';
		if (!isNumber(quest.level)) {
			vv = '<i>' + quest.energy + '</i>';
		} else {
			r = 'reps_' + (isNumber(quest.land) ? (quest.land + 1) : quest.area);
			j = quest.name.toLowerCase();
			vv = quest.eff || (quest.energy * this.wiki_reps(quest));
			tt = 'effort ' + vv;
			if (0 < quest.influence && quest.influence < 100) {
				v = Math.round(vv * (100 - quest.influence) / 100);
				tt += ' (' + v + ')';
			}
			if ((v = quest.reps)) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'reps ' + v;
				if (quest.m_d && quest.m_c) {
					var v1 = 100 * quest.m_c / quest.m_d;
					var v2 = 2 / quest.m_c;
					var lo = Math.ceil(v1 - v2);
					var hi = Math.ceil(v1 + v2);
					if (lo < hi) {
						tt += ' [' + lo + ',' + hi + ']';
					}
					v = this.wiki_reps(quest, true);
					if (!v || Math.ceil(lo) > v || Math.ceil(hi) < v) {
						tt += ' wiki[' + (v || '?') + ']';
						if (lo + 1 >= hi) {
							cc = 'purple';
						}
					} else if (lo + 1 >= hi) {
						cc = 'green';
					}
				}
			} else if ((v = this.wiki_reps(quest, true))) {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'wiki reps ' + v;
			} else {
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'assuming reps 16';
				cc = 'blue';
			}
			if (quest.m_d || quest.m_c) {
				vv = '<b>' + vv + '</b>';
				if (tt !== '') {
					tt += ', ';
				}
				tt += 'effort metrics ' + (quest.m_d || '?') + '/' + (quest.m_c || '?');
			}
			if (tt !== '') {
				tt = 'title="' + tt + '"';
			}
		}
		if (cc !== '') {
			span += ' style="color:' + cc + '"';
		}
		if (span !== '') {
			vv = '<span' + span + '>' + vv + '</span>';
		}
		td(output, vv, tt);

		// exp
		td(output, (quest.exp / quest.energy).round(2), 'title="' + quest.exp + ' total, ' + (quest.exp / quest.energy * 12).round(2) + ' per hour"');

		// reward
		td(output, '$' + (quest.reward / quest.energy).addCommas(0), 'title="$' + quest.reward.addCommas() + ' total, $' + (quest.reward / quest.energy * 12).addCommas(0) + ' per hour"');

		// item
		td(output, quest.itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + quest.itemimg + '" alt="' + quest.item + '" title="' + quest.item + '">' : '');

		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

Quest.cost = function(id) {
	/*jslint onevar:false*/
	var quest = this.get('data.id');
	var gens = Generals.get('data');
	var town = Town.get('data');
	var artifact = Player.get('data.artifact');
	var c, i, j, k, n, cost, upkeep, desc, ccount, ucount;
	/*jslint onevar:true*/

	this.temp.cost = 1e99;
	this.temp.upkeep = 1e99;
	this.temp.desc = '(n/a)';

	cost = ccount = 0;
	upkeep = ucount = 0;
	desc = '';

	if (id && quest[id]) {
		if ((i = quest[id].general)) {
			if (!gens || !gens[i] || !gens[i].own) {
				cost += 1e99;
				if (desc !== '') {
					desc += '; ';
				}
				desc += '(n/a)';
			}
		}

		if (quest[id].units) {
			for (i in quest[id].units) {
				n = quest[id].units[i];
				c = j = 0;
				k = 1e99;
				if (town && town[i]) {
					c = town[i].own || 0;
					if (town[i].buy && town[i].buy.length) {
						j = town[i].upkeep || 0;
						k = town[i].cost || 0;
					}
				} else if (artifact && artifact[i]) {
					c = 1;
					j = k = 0;
				}
				if (c < n) {
					cost += (n - c) * k;
					upkeep += (n - c) * j;
					if (desc !== '') {
						desc += '; ';
					}
					desc += (n - c) + '/' + n + ' ' + i;
					if (k >= 1e99) {
						desc += ' (n/a)';
						ccount++;
					} else if (k) {
						desc += ' $' + ((n - c) * k).SI();
						ccount++;
					}
					if (j) {
						desc += ' (upkeep $' + ((n - c) * j).SI() + ')';
						ucount++;
					}
				}
			}
		}

		if (ccount > 1 && cost) {
			desc += '; total ';
			if (cost < 1e99) {
				desc += '$' + cost.SI();
			} else {
				desc += '(n/a)';
			}
		}

		if (ucount > 1 && upkeep) {
			desc += '; upkeep $' + upkeep.SI();
		}

		this.temp.cost = cost;
		this.temp.upkeep = upkeep;
		this.temp.desc = desc;
	}

	return this.temp.cost;
};

Quest.wiki_reps = function(quest, pure) {
	var reps = 0, rdata;
	if (isObject(quest)) {
		if (!isNumber(quest.level)) {
			reps = 1;
		} else if ((rdata = this.rdata[(quest.name || '').toLowerCase()])) {
			reps = rdata['reps_' + quest.area[0] + ((quest.land || 0) + 1).toString()] || 0;
		}
	}
	return pure ? reps : reps || 16;
};

Quest.rts = 1302453435;	// Sun Apr 10 16:37:15 2011 UTC
Quest.rdata =			// #419
{
	'a demonic transformation':			{ 'reps_q4':  40 },
	'a forest in peril':				{ 'reps_d4':   9 },
	'a kidnapped princess':				{ 'reps_d1':  10 },
	'a new dawn':						{ 'reps_q12':  7 },
	'a surprise from terra':			{ 'reps_q12': 12 },
	'across the sea':					{ 'reps_q11':  8 },
	'aid corvintheus':					{ 'reps_d3':   9 },
	'aid the angels':					{ 'reps_q9':  17 },
	'approach the prayer chamber':		{ 'reps_d1':  12 },
	'approach the tree of life':		{ 'reps_d4':  12 },
	'ascent to the skies':				{ 'reps_q8':  14 },
	'attack from above':				{ 'reps_q9':  17 },
	'attack undead guardians':			{ 'reps_q6':  24 },
	'aurelius':							{ 'reps_q11': 11 },
	'aurelius outpost':					{ 'reps_q11':  9 },
	'avoid detection':					{ 'reps_q12':  0 },
	'avoid ensnarements':				{ 'reps_q3':  34 },
	'avoid fungal poison':				{ 'reps_q12':  0 },
	'avoid poison':						{ 'reps_q12':  0 },
	'avoid shades':						{ 'reps_q12':  0 },
	'avoid the guards':					{ 'reps_q8':   0 },
	'avoid the patrols':				{ 'reps_q9':  17 },
	'banish the horde':					{ 'reps_q9':  17 },
	'battle a wraith':					{ 'reps_q2':  16 },
	'battle earth and fire demons':		{ 'reps_q4':  16 },
	'battle gang of bandits':			{ 'reps_q1':  10 },
	'battle orc captain':				{ 'reps_q3':  15 },
	'battle the black dragon':			{ 'reps_q4':  14 },
	'battle the ent':					{ 'reps_d4':  12 },
	'battling the demons':				{ 'reps_q9':  17 },
	'being followed':					{ 'reps_q7':  15 },
	'blood wing king of the dragons':	{ 'reps_d2':  20 },
	'breach prison':					{ 'reps_q12':  0 },
	'breach the barrier':				{ 'reps_q8':  14 },
	'breach the keep entrance':			{ 'reps_d3':  12 },
	'breaching the gates':				{ 'reps_q7':  15 },
	'break aurelius guard':				{ 'reps_q11':  0 },
	'break evil seal':					{ 'reps_q7':  17 },
	'break the lichs spell':			{ 'reps_d3':  12 },
	'break the line':					{ 'reps_q10':  0 },
	'breaking through the guard':		{ 'reps_q9':  17 },
	'bridge of elim':					{ 'reps_q8':  11 },
	'burning gates':					{ 'reps_q7':   0 },
	'call of arms':						{ 'reps_q6':  25 },
	'calm before the storm':			{ 'reps_q13':  0 },
	'cast aura of night':				{ 'reps_q5':  32 },
	'cast blizzard':					{ 'reps_q10':  0 },
	'cast fire aura':					{ 'reps_q6':  24 },
	'cast holy light':					{ 'reps_q6':  24 },
	'cast holy light spell':			{ 'reps_q5':  24 },
	'cast holy shield':					{ 'reps_d3':  12 },
	'cast meteor':						{ 'reps_q5':  32 },
    'cast poison shield':				{ 'reps_q13':  0 },
    'cast regrowth':					{ 'reps_q13':  0 },
	'castle of the black lion':			{ 'reps_d5':  13 },
	'castle of the damn':				{ 'reps_d3':  21 },
	'channel excalibur':				{ 'reps_q8':   0 },
	'channel runestones':				{ 'reps_q12':  0 },
	'charge ahead':						{ 'reps_q10':  0 },
	'charge the castle':				{ 'reps_q7':  15 },
	'chasm of fire':					{ 'reps_q10': 10 },
	'city of clouds':					{ 'reps_q8':  11 },
    'clear haze':						{ 'reps_q13':  0 },
	'clear the rocks':					{ 'reps_q11':  0 },
	'climb castle cliffs':				{ 'reps_q11':  0 },
	'climb the mountain':				{ 'reps_q8':   0 },
	'close the black portal':			{ 'reps_d1':  12 },
    'collect artifact shards':			{ 'reps_q13':  0 },
	'collect astral souls':				{ 'reps_q12':  0 },
	'collect runestones':				{ 'reps_q12':  0 },
	'confront the black lion':			{ 'reps_d5':  12 },
	'confront the rebels':				{ 'reps_q10': 10 },
	'consult aurora':					{ 'reps_d4':  12 },
	'corruption of nature':				{ 'reps_d4':  20 },
	'cover tracks':						{ 'reps_q7':  19 },
    'create artifact relic':			{ 'reps_q13':  0 },
	'create wall':						{ 'reps_q12':  0 },
	'cross lava river':					{ 'reps_q7':  20 },
	'cross the bridge':					{ 'reps_q8':   0, 'reps_q10':  0 },
    'cross the falls':					{ 'reps_q13':  0 },
	'cross the moat':					{ 'reps_q11':  0 },
	'crossing the chasm':				{ 'reps_q2':  13, 'reps_q8':   0 },
	'cure infested soldiers':			{ 'reps_q6':  25 },
	'dark heart of the woods':			{ 'reps_q12':  9 },
	'deal final blow to bloodwing':		{ 'reps_d2':  12 },
	'death of a forest':				{ 'reps_q13':  0 },
	'deathrune castle':					{ 'reps_q7':  12 },
	'decipher the clues':				{ 'reps_q9':  17 },
	'defeat and heal feral animals':	{ 'reps_d4':  12 },
	'defeat angelic sentinels':			{ 'reps_q8':  14 },
	'defeat astral wolves':				{ 'reps_q12':  0 },
	'defeat bear form':					{ 'reps_q11':  0 },
	'defeat bloodwing':					{ 'reps_d2':  12 },
	'defeat chimerus':					{ 'reps_d1':  12 },
	'defeat darien woesteel':			{ 'reps_d5':   9 },
	'defeat demonic guards':			{ 'reps_q7':  17 },
	'defeat fire elementals':			{ 'reps_q10':  0 },
	'defeat frost minions':				{ 'reps_q3':  40 },
	'defeat guardian':					{ 'reps_q12':  0 },
	'defeat guards':					{ 'reps_q12':  0 },
	'defeat lion defenders':			{ 'reps_q11':  0 },
	'defeat lothar':					{ 'reps_q12':  0 },
	'defeat orc patrol':				{ 'reps_q8':   0 },
	'defeat rebels':					{ 'reps_q10':  0 },
    'defeat rock elementals':			{ 'reps_q13':  0 },
	'defeat snow giants':				{ 'reps_q3':  24 },
	'defeat spirits':					{ 'reps_q12':  0 },
	'defeat the bandit leader':			{ 'reps_q1':   6 },
	'defeat the banshees':				{ 'reps_q5':  25 },
	'defeat the black lion army':		{ 'reps_d5':  12 },
	'defeat the demonic guards':		{ 'reps_d1':  12 },
	'defeat the demons':				{ 'reps_q9':  17 },
	'defeat the kobolds':				{ 'reps_q10':  0 },
	'defeat the patrols':				{ 'reps_q9':  17 },
	'defeat the seraphims':				{ 'reps_q8':   0 },
	'defeat tiger form':				{ 'reps_q11':  0 },
	'defeat treants':					{ 'reps_q12':  0 },
    'defeat wolverines':				{ 'reps_q13':  0 },
	'defend the village':				{ 'reps_d3':  12 },
	'desert temple':					{ 'reps_q11': 12 },
	'destroy black oozes':				{ 'reps_q11':  0 },
	'destroy fire dragon':				{ 'reps_q4':  10 },
	'destroy fire elemental':			{ 'reps_q4':  16 },
	'destroy horde of ghouls & trolls':	{ 'reps_q4':   9 },
    'destroy mushrooms':				{ 'reps_q13':  0 },
    'destroy scourge':					{ 'reps_q13':  0 },
	'destroy spores':					{ 'reps_q12':  0 },
	'destroy the black gate':			{ 'reps_d1':  12 },
	'destroy the black portal':			{ 'reps_d1':  12 },
	'destroy the bolted door':			{ 'reps_d3':  12 },
	'destroy undead crypt':				{ 'reps_q1':   5 },
	'destruction abound':				{ 'reps_q8':  11 },
	'determine cause of corruption':	{ 'reps_d5':  12 },
	'dig up star metal':				{ 'reps_d3':  12 },
	'disarm townspeople':				{ 'reps_q11':  0 },
	'discover cause of corruption':		{ 'reps_d4':  12 },
	'dismantle orc patrol':				{ 'reps_q3':  32 },
    'dispatch corrupted soldiers':		{ 'reps_q13':  0 },
	'dispatch lothar':					{ 'reps_q12':  0 },
	'dispatch more cultist guards':		{ 'reps_d1':  12 },
	'distract the demons':				{ 'reps_q9':  17 },
	'dragon slayer':					{ 'reps_d2':  14 },
	'druidic prophecy':					{ 'reps_q11':  9 },
	"duel cefka's knight champion":		{ 'reps_q4':  10 },
	'duel with guards':					{ 'reps_q12':  0 },
	'dwarven stronghold':				{ 'reps_q10': 10 },
	'eastern corridor':					{ 'reps_q11':  0 },
	'elekin the dragon slayer':			{ 'reps_d2':  10 },
	'end of the road':					{ 'reps_q9':  17 },
	'enlist captain morgan':			{ 'reps_q11':  0 },
	'entrance denied':					{ 'reps_q12': 12 },
	'entrance to terra':				{ 'reps_q1':   9 },
	'equip soldiers':					{ 'reps_q6':  25 },
    'eradicate spores':					{ 'reps_q13':  0 },
	'escape from trakan':				{ 'reps_q12':  7 },
	'escape trakan':					{ 'reps_q12':  0 },
	'escape woods':						{ 'reps_q12':  0 },
	'escaping the chaos':				{ 'reps_q9':  17 },
	'escaping the stronghold':			{ 'reps_q9':  10 },
	'explore dead forests':				{ 'reps_q12':  0 },
	'explore merchant plaza':			{ 'reps_q11':  0 },
	'explore mist expanse':				{ 'reps_q12':  0 },
	'explore mist ruins':				{ 'reps_q12':  0 },
	'explore the temple':				{ 'reps_q11':  0 },
	'extinguish desert basilisks':		{ 'reps_q11':  0 },
	'extinguish the fires':				{ 'reps_q8':   0 },
	'falls of jiraya':					{ 'reps_q1':  10 },
	'family ties':						{ 'reps_d5':  11 },
	'felthias fields':					{ 'reps_q12': 14 },
	'fend off demons':					{ 'reps_q7':  20 },
	'fiery awakening':					{ 'reps_q7':  12 },
	"fight cefka's shadow guard":		{ 'reps_q4':  10 },
	'fight demonic worshippers':		{ 'reps_q5':  24 },
	'fight dragon welps':				{ 'reps_q4':  10 },
	'fight ghoul army':					{ 'reps_q1':   5 },
	'fight gildamesh':					{ 'reps_q3':  32 },
	'fight ice beast':					{ 'reps_q3':  40 },
	'fight infested soldiers':			{ 'reps_q6':  25 },
	'fight off demons':					{ 'reps_q5':  21 },
	'fight off zombie infestation':		{ 'reps_d3':  12 },
	'fight snow king':					{ 'reps_q3':  24 },
	'fight the half-giant sephor':		{ 'reps_q4':   9 },
	'fight treants':					{ 'reps_q2':  27 },
	'fight undead zombies':				{ 'reps_q2':  16 },
	'fight water demon lord':			{ 'reps_q2':  31 },
	'fight water demons':				{ 'reps_q2':  30 },
	'fight water spirits':				{ 'reps_q2':  40 },
    'find a way across':				{ 'reps_q13':  0 },
	'find answers':						{ 'reps_q12':  0 },
	'find escape route':				{ 'reps_q12':  0 },
	'find evidence of dragon attack':	{ 'reps_d2':   8 },
	'find hidden path':					{ 'reps_d2':  10 },
	'find nezeals keep':				{ 'reps_d3':  12 },
	'find prison key':					{ 'reps_q12':  0 },
	'find rock worms weakness':			{ 'reps_d2':  10 },
    'find shelter from haze':			{ 'reps_q13':  0 },
	'find source of the attacks':		{ 'reps_d3':  12 },
	'find survivors':					{ 'reps_q8':  14 },
	'find the dark elves':				{ 'reps_d1':  12 },
	'find the demonic army':			{ 'reps_d1':  12 },
	'find the druids':					{ 'reps_d4':  12 },
	'find the entrance':				{ 'reps_q8':   0 },
	'find the exit':					{ 'reps_q9':  17 },
	'find the safest path':				{ 'reps_q10': 14 },
	'find the source of corruption':	{ 'reps_d4':  12 },
	'find the woman? father':			{ 'reps_d5':  12 },
	'find troll weakness':				{ 'reps_q2':  10 },
	'find your way out':				{ 'reps_q7':  15 },
	'fire and brimstone':				{ 'reps_q7':  12 },
	'forest of ash':					{ 'reps_d4':  11 },
	'freeing arielle':					{ 'reps_q12': 10 },
	'furest hellblade':					{ 'reps_d3':  17 },
	'gain access':						{ 'reps_q10':  0 },
	'gain entry':						{ 'reps_q11':  0 },
	'gates to the undead':				{ 'reps_q6':  17 },
	'gateway':							{ 'reps_q8':  11 },
    'gather earth essence':				{ 'reps_q13':  0 },
    'gather life dust':					{ 'reps_q13':  0 },
    'gather nature essence':			{ 'reps_q13':  0 },
    'gather samples':					{ 'reps_q13':  0 },
    'gather supplies':					{ 'reps_q12':  0, 'reps_q13':  0 },
	'get information from the druid':	{ 'reps_d4':  12 },
	'get water for the druid':			{ 'reps_d4':  12 },
	'grim outlook':						{ 'reps_q9':  17 },
	'guard against attack':				{ 'reps_d5':  12 },
	'hakkal woods':						{ 'reps_q13':  0 },
	'heal arielle':						{ 'reps_q12':  0 },
	'heal wounds':						{ 'reps_q7':  20 },
	'heat the villagers':				{ 'reps_q1':   5 },
	'holy fire':						{ 'reps_d4':  11 },
    'hunt for food':					{ 'reps_q13':  0 },
	'impending battle':					{ 'reps_q10': 10 },
	'infiltrate trakan':				{ 'reps_q12':  0 },
	'inspire soldiers':					{ 'reps_q12':  0 },
	'interrogate the prisoners':		{ 'reps_q9':  17 },
    'investigate temple':				{ 'reps_q13':  0 },
	'investigate the gateway':			{ 'reps_q8':   0 },
	'ironfist dwarves':					{ 'reps_q10': 10 },
	'join up with artanis':				{ 'reps_d1':  12 },
	'judgement stronghold':				{ 'reps_q8':  11 },
	'juliean desert':					{ 'reps_q11': 12 },
	'kelp forest':						{ 'reps_a1':  20 },
    'kill diseased treants':			{ 'reps_q13':  0 },
	'kill gildamesh':					{ 'reps_q3':  34 },
	'kill shades':						{ 'reps_q12':  0 },
    'kill slimes':						{ 'reps_q13':  0 },
	'kill vampire bats':				{ 'reps_d3':  10 },
	'koralan coast town':				{ 'reps_q11': 14 },
	'koralan townspeople':				{ 'reps_q11': 10 },
	'learn about death knights':		{ 'reps_d5':  12 },
	'learn aurelius intentions':		{ 'reps_q11':  0 },
	'learn counterspell':				{ 'reps_d1':  12 },
	'learn holy fire':					{ 'reps_d4':  12 },
	'look for clues':					{ 'reps_q8':  14 },
	'lothar the ranger':				{ 'reps_q12':  9 },
    'make camp':						{ 'reps_q13':  0 },
	'marauders!':						{ 'reps_d5':   9 },
	'march into the undead lands':		{ 'reps_q6':  24 },
	'march to the unholy war':			{ 'reps_q6':  25 },
	'mausoleum of triste':				{ 'reps_q3':  17 },
	'misty hills of boralis':			{ 'reps_q3':  20 },
	'mount aretop':						{ 'reps_d2':  25 },
	'nightfall':						{ 'reps_q12':  9 },
	'nightmare':						{ 'reps_q6':  20 },
	'outmaneuver lothar':				{ 'reps_q12':  0 },
	'outpost entrance':					{ 'reps_q11': 12 },
	'path to heaven':					{ 'reps_q8':  11 },
	'persuade terra':					{ 'reps_q12':  0 },
	'pick up the orc trail':			{ 'reps_q1':   6 },
	'plan the attack':					{ 'reps_d5':  12 },
	'portal of atlantis':				{ 'reps_a1':  20 },
	'power of excalibur':				{ 'reps_q8':  11 },
	'prepare for ambush':				{ 'reps_q1':   6 },
	'prepare for battle':				{ 'reps_d2':  12, 'reps_q5':  21 },
    'prepare for dark':					{ 'reps_q13':  0 },
	'prepare for the trials':			{ 'reps_q9':  17 },
	'prepare tactics':					{ 'reps_q10':  0 },
	'prepare troops':					{ 'reps_q10':  0 },
	'prevent dragon? escape':			{ 'reps_d2':  12 },
	'protect temple from raiders':		{ 'reps_q2':  40 },
	'purge forest of evil':				{ 'reps_q2':  27 },
	'pursuing orcs':					{ 'reps_q1':  13 },
	'put out the fires':				{ 'reps_d2':   8 },
	'question dark elf prisoners':		{ 'reps_d1':  12 },
	'question the druidic wolf':		{ 'reps_d4':  12 },
	'question townspeople':				{ 'reps_q11': 17 },
	'question vulcan':					{ 'reps_q8':   0 },
	'ready defenses':					{ 'reps_q12':  0 },
	'ready soldiers':					{ 'reps_q12':  0 },
	'ready the horses':					{ 'reps_q1':   6 },
	'reason with guards':				{ 'reps_q12':  0 },
	'recover the key':					{ 'reps_q9':  17 },
	'recruit allies':					{ 'reps_q10':  0 },
	'recruit elekin to join you':		{ 'reps_d2':   9 },
	'recruit furest to join you':		{ 'reps_d3':  12 },
    'repair bridge':					{ 'reps_q13':  0 },
	'repel gargoyle raid':				{ 'reps_q4':  14 },
	'request council':					{ 'reps_q10':  0 },
	'request entrance':					{ 'reps_q12':  0 },
	'rescue survivors':					{ 'reps_q8':  14 },
	'resist the lost souls':			{ 'reps_q5':  25 },
	'retrieve dragon slayer':			{ 'reps_d2':  10 },
	'retrieve the jeweled heart':		{ 'reps_d5':  12 },
	'ride to aretop':					{ 'reps_d2':  12 },
	'ride towards the palace':			{ 'reps_q9':  17 },
	'river of lava':					{ 'reps_q10': 10 },
	'river of light':					{ 'reps_q1':  10 },
	'save dying creatures':				{ 'reps_q12':  0 },
	'save lost souls':					{ 'reps_q5':  24 },
	'save stranded soldiers':			{ 'reps_q10':  0 },
	'seek out elekin':					{ 'reps_d2':   9 },
	'seek out furest hellblade':		{ 'reps_d3':  12 },
	'seek out jeweled heart':			{ 'reps_d5':  12 },
	'shield of the stars':				{ 'reps_d3':  20 },
	'signs of the scourge':				{ 'reps_q13':  0 },
	'slaughter orcs':					{ 'reps_q3':  15 },
	'slay cave bats':					{ 'reps_d2':  10 },
	'slay the black dragons':			{ 'reps_q5':  32 },
	'slay the guardian':				{ 'reps_q9':  17 },
	'slay the sea serpent':				{ 'reps_d5':  12 },
	'sneak attack on dragon':			{ 'reps_d2':  12 },
	'sneak into the city':				{ 'reps_q8':  14 },
	'sneak up on orcs':					{ 'reps_q1':   7 },
	'soldiers of the black lion':		{ 'reps_d5':  10 },
	'spire of death':					{ 'reps_q5':  20 },
	'sporeguard forest':				{ 'reps_q12': 10 },
	'sporeguard revisited':				{ 'reps_q13':  0 },
	'spring surprise attack':			{ 'reps_d5':  12 },
	'stall for time':					{ 'reps_q12':  0 },
	'stop the wolf from channeling':	{ 'reps_d4':  12 },
	'storm the castle':					{ 'reps_d5':  12 },
	'storm the ivory palace':			{ 'reps_q9':  17 },
	'sulfurous springs':				{ 'reps_q11': 10 },
	'summon legendary defenders':		{ 'reps_q6':  25 },
	'surround rebels':					{ 'reps_q10':  0 },
    'survey area':						{ 'reps_q13':  0 },
	'survey battlefield':				{ 'reps_q10':  0 },
	'survey the surroundings':			{ 'reps_q8':  14 },
	'survive the storm':				{ 'reps_q11':  0 },
	'survive troll ambush':				{ 'reps_q2':  10 },
	'surviving the onslaught':			{ 'reps_q9':  17 },
	'taubourne falls':					{ 'reps_q13':  0 },
	'tenvir summit':					{ 'reps_q13':  0 },
	'tezzari village':					{ 'reps_q12': 12 },
	'the belly of the demon':			{ 'reps_q5':  16 },
	'the betrayed lands':				{ 'reps_q4':  16 },
	'the black portal':					{ 'reps_d1':  15 },
	'the cave of wonder':				{ 'reps_q3':  20 },
	'the crystal caverns':				{ 'reps_d2':  11 },
	'the darkening skies':				{ 'reps_q9':  17 },
	'the dead forests':					{ 'reps_q12': 11 },
	'the deep':							{ 'reps_a1':  20 },
	'the elven sorceress':				{ 'reps_d1':  11 },
	'the fallen druids':				{ 'reps_d4':  12 },
	'the final stretch':				{ 'reps_q9':  17 },
	'the forbidden forest':				{ 'reps_q2':  20 },
	'the forbidden ritual':				{ 'reps_q5':  20 },
	'the gateway':						{ 'reps_q12': 10 },
	'the green haze':					{ 'reps_q13':  0 },
	'the hidden lair':					{ 'reps_d1':  13 },
	'the hollowing moon':				{ 'reps_q6':  17 },
	'the infestation of winterguard':	{ 'reps_d3':  10 },
	'the invasion':						{ 'reps_q8':  11 },
	'the keep of corelan':				{ 'reps_q3':  17 },
	'the keep of isles':				{ 'reps_q4':  16 },
	'the kingdom of alarean':			{ 'reps_d5':  15 },
	'the last gateway':					{ 'reps_q9':  17 },
	"the lich ne'zeal":					{ 'reps_d3':  13 },
	"the lich's keep":					{ 'reps_d3':  15 },
	'the life altar':					{ 'reps_q13':  0 },
	'the life temple':					{ 'reps_q13':  0 },
	'the living gates':					{ 'reps_q5':  20 },
	'the long path':					{ 'reps_q7':  12 },
	'the peaks of draneth':				{ 'reps_d5':  21 },
	'the poison source':				{ 'reps_q11':  0 },
	'the rebellion':					{ 'reps_q10': 10 },
	'the return home':					{ 'reps_q8':  11 },
	'the return of the dragon':			{ 'reps_d2':   9 },
	'the ride south':					{ 'reps_q8':   0 },
	'the river of blood':				{ 'reps_q5':  20 },
	'the scourge':						{ 'reps_q12':  8 },
	'the sea temple':					{ 'reps_a1':  20 },
	'the search for clues':				{ 'reps_d1':  12 },
	'the second temple of water':		{ 'reps_q4':  25 },
	'the smouldering pit':				{ 'reps_q4':  40 },
	'the source of darkness':			{ 'reps_d1':  20 },
	'the source of magic':				{ 'reps_d4':  15 },
	'the southern entrance':			{ 'reps_q12':  9 },
	'the stairs of terra':				{ 'reps_q2':  10 },
	'the stone lake':					{ 'reps_q1':  12 },
	'the sunken city':					{ 'reps_d5':  17 },
	'the tree of life':					{ 'reps_d4':  21 },
	'the vanguard of destruction':		{ 'reps_d1':  21 },
	'the water temple':					{ 'reps_q2':  17 },
	'til morning comes':				{ 'reps_q12': 11 },
	'track down soldiers':				{ 'reps_d5':  12 },
	'track lothar':						{ 'reps_q12':  0 },
	'track sylvana':					{ 'reps_d1':  12 },
	'train with ambrosia':				{ 'reps_d1':  12 },
	'train with aurora':				{ 'reps_d4':  12 },
	'trakan prison':					{ 'reps_q12':  9 },
	'trakan sky bridge':				{ 'reps_q12': 11 },
	'trakan village':					{ 'reps_q12':  7 },
	'travel to the tree of life':		{ 'reps_d4':  12 },
	'travel to winterguard':			{ 'reps_d3':  12 },
	'triste':							{ 'reps_q3':  20 },
	'undead crusade':					{ 'reps_q6':  17 },
	'underground path':					{ 'reps_q12':  8 },
	'underwater ruins':					{ 'reps_a1':  20 },
	'unholy war':						{ 'reps_q6':  20 },
    'unlock altar':						{ 'reps_q13':  0 },
    'use artifact relic':				{ 'reps_q13':  0 },
	'use battering ram':				{ 'reps_q11':  0 },
	'vengeance':						{ 'reps_d2':  17 },
	'vesuv bridge':						{ 'reps_q10': 10 },
	'vesuv lookout':					{ 'reps_q2':  17 },
	'visit the blacksmith':				{ 'reps_q1':  24 },
	'vulcans secret':					{ 'reps_q8':  11 },
	'watch the skies':					{ 'reps_d3':  12 }
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Bank, Battle, Generals, LevelUp, Player, Quest, Land,
	APP, APPID, warn, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser, console,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.temp = null;

Town.settings = {
	taint:true
};

Town.defaults['castle_age'] = {
	pages:'town_soldiers town_blacksmith town_magic keep_stats'
};

Town.option = {
	general:true,
	quest_buy:true,
	number:'None',
	maxcost:'$0',
	units:'Best for Both',
	sell:false,
	upkeep:20
};

Town.runtime = {
	best_buy:null,
	best_sell:null,
	buy:0,
	sell:0,
	cost:0
};

Town.display = [
{
	id:'general',
	label:'Use Best General',
	checkbox:true
},{
	id:'quest_buy',
	label:'Buy Quest Items',
	checkbox:true
},{
	id:'generals_buy',
	label:'Buy Generals Items',
	checkbox:true
},{
	id:'number',
	label:'Buy Number',
	select:['None', 'Minimum', 'Army', 'Army+', 'Max Army'],
	help:'Minimum will only buy items need for quests if enabled.'
		+ ' Army will buy up to your army size (modified by some generals).'
		+ ' Army+ is like Army on purchases and Max Army on sales.'
		+ ' Max Army will buy up to 541 regardless of army size.'
},{
	id:'sell',
	require:'number!="None" && number!="Minimum"',
	label:'Sell Surplus',
	checkbox:true,
	help:'Only keep the best items for selected sets.'
},{
	advanced:true,
	id:'units',
	require:'number!="None"',
	label:'Set Type',
	select:['Best Offense', 'Best Defense', 'Best for Both'],
	help:'Select type of sets to keep. Best for Both will keep a Best Offense and a Best Defense set.'
},{
	advanced:true,
	id:'maxcost',
	require:'number!="None"',
	label:'Maximum Item Cost',
	select:['$0','$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b','$1t','$10t','$100t','INCR'],
	help:'Will buy best item based on Set Type with single item cost below selected value. INCR will start at $10k and work towards max buying at each level (WARNING, not cost effective!)'
},{
	advanced:true,
	require:'number!="None"',
	id:'upkeep',
	label:'Max Upkeep',
	text:true,
	after:'%',
	help:'Enter maximum Total Upkeep in % of Total Income'
}
];

/*
Town.blacksmith = {
	Weapon: /axe|blade|bow|cleaver|cudgel|dagger|edge|grinder|halberd|lance|mace|morningstar|rod|saber|scepter|spear|staff|stave|sword |sword$|talon|trident|wand|^Avenger$|Celestas Devotion|Crystal Rod|Daedalus|Deliverance|Dragonbane|Excalibur|Holy Avenger|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught|Punisher|Soulforge/i,
	Shield:	/aegis|buckler|shield|tome|Defender|Dragon Scale|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought|Purgatory|Zenarean Crest/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil|Virtue of Fortitude/i,
	Gloves:	/gauntlet|glove|hand|bracer|fist|Slayer's Embrace|Soul Crusher|Soul Eater|Virtue of Temperance/i,
	Armor:	/armor|belt|chainmail|cloak|epaulets|gear|garb|pauldrons|plate|raiments|robe|tunic|vestment|Faerie Wings/i,
	Amulet:	/amulet|bauble|charm|crystal|eye|flask|insignia|jewel|lantern|memento|necklace|orb|pendant|shard|signet|soul|talisman|trinket|Heart of Elos|Mark of the Empire|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Terra's Heart|Thawing Star|Transcendence/i
};
*/

  // I know, I know, really verbose, but don't gripe unless it doesn't match
  // better than the short list above.  This is based on a generated list that
  // ensures the list has no outstanding mismatches or conflicts given all
  // known items as of a given date.

  // as of Tue Apr 12 11:25:28 2011 UTC
Town.blacksmith = {
      // Feral Staff is a multi-pass match:
      //   shield.11{Feral Staff}, weapon.5{Staff}
      // Frost Tear Dagger is a multi-pass match:
      //   shield.17{Frost Tear Dagger}, weapon.6{Dagger}
      // Ice Dagger is a multi-pass match:
      //   shield.10{Ice Dagger}, weapon.6{Dagger}
      // Sword of Redemption is a multi-pass match:
      //   shield.19{Sword of Redemption}, weapon.5{Sword}
    Weapon: new RegExp('(' +
      '\\baxe\\b' +				// 13
      '|\\bblades?\\b' +		// 27+1
      '|\\bbow\\b' +			// 8
      '|\\bclaw\\b' +			// 1
      '|\\bcleaver\\b' +		// 1
      '|\\bcudgel\\b' +			// 1
      '|\\bdagger\\b' +			// 8 (mismatches 2)
      '|\\bedge\\b' +			// 1
      '|\\bgreatsword\\b' +		// 2
      '|\\bgrinder\\b' +		// 1
      '|\\bhalberd\\b' +		// 1
      '|\\bhammer\\b' +			// 1
      '|\\bhellblade\\b' +		// 1
      '|\\bkatara\\b' +			// 1
      '|\\bkingblade\\b' +		// 1
      '|\\blance\\b' +			// 2
      '|\\blongsword\\b' +		// 1
      '|\\bmace\\b' +			// 6
      '|\\bmorningstar\\b' +	// 1
      '|\\bpike\\b' +			// 1
      '|\\brapier\\b' +			// 1
      '|\\brod\\b' +			// 2
      '|\\bsaber\\b' +			// 4
      '|\\bscepter\\b' +		// 1
      '|\\bshortsword\\b' +		// 1
      '|\\bspear\\b' +			// 3
      '|\\bstaff\\b' +			// 9 (mismatches 1)
      '|\\bstaves\\b' +			// 1
      '|\\bsword\\b' +			// 17 (mismatches 1)
      '|\\btalon\\b' +			// 1
      '|\\btrident\\b' +		// 2
      '|\\bwand\\b' +			// 3
      '|^Arachnid Slayer$' +
      '|^Atonement$' +
      '|^Avenger$' +
      '|^Bloodblade$' +
      '|^Bonecrusher$' +
      '|^Celestas Devotion$' +
      '|^Daedalus$' +
      '|^Death Dealer$' +
      '|^Deathbellow$' +
      '|^Deliverance$' +
      '|^Draganblade$' +
      '|^Dragonbane$' +
      '|^Excalibur$' +
      '|^Exsanguinator$' +
      '|^Heart of the Woods$' +
      '|^Holy Avenger$' +
      '|^Incarnation$' +
      '|^Inoculator$' +
      "|^Ironhart's Might$" +
      '|^Judgement$' +
      '|^Justice$' +
      '|^Lifebane$' +
      '|^Lightbringer$' +
      '|^Lion Fang$' +
      '|^Moonclaw$' +
      '|^Oathkeeper$' +
      "|^Oberon's Might$" +
      '|^Onslaught$' +
      '|^Path of the Tower$' +
      '|^Punisher$' +
      '|^Righteousness$' +
      '|^Scytheblade$' +
      '|^Soul Siphon$' +
      '|^Soulforge$' +
      '|^Stormcrusher$' +
      '|^Syrens Call$' +
      '|^The Disemboweler$' +
      '|^The Galvanizer$' +
      '|^The Reckoning$' +
      '|^Virtue of Justice$' +
      ')', 'i'),
    Shield: new RegExp('(' +
      '\\baegis\\b' +			// 4
      '|\\bbuckler\\b' +		// 1
      '|\\bdeathshield\\b' +	// 1
      '|\\bdefender\\b' +		// 5
      '|\\bprotector\\b' +		// 1
      '|\\bshield\\b' +			// 22
      '|\\btome\\b' +			// 4
      '|^Absolution$' +
      '|^Crest of the Griffin$' +
      '|^Dragon Scale$' +
      '|^Feral Staff$' +
      '|^Frost Tear Dagger$' +
      '|^Harmony$' +
      '|^Heart of the Pride$' +
      '|^Hour Glass$' +
      '|^Ice Dagger$' +
      '|^Illvasan Crest$' +
 	  '|^Impenetrable Ice$' +
      '|^Purgatory$' +
      '|^Serenes Arrow$' +
      '|^Sword of Redemption$' +
      "|^Terra's Guard$" +
      '|^The Dreadnought$' +
      '|^Zenarean Crest$' +
      ')', 'i'),
    Armor: new RegExp('(' +
      '\\barmguard\\b' +		// 1
      '|\\barmor\\b' +			// 22
      '|\\bbattlegarb\\b' +		// 1
      '|\\bbattlegear\\b' +		// 4
      '|\\bbelt\\b' +			// 1
      '|\\bcarapace\\b' +		// 1
      '|\\bchainmail\\b' +		// 2
      '|\\bcloak\\b' +			// 7
      '|\\bepaulets\\b' +		// 1
      '|\\bgarb\\b' +			// 1
      '|\\bpauldrons\\b' +		// 1
      '|\\bplate\\b' +			// 32
      '|\\bplatemail\\b' +		// 2
      '|\\braiments\\b' +		// 5
      '|\\brobes?\\b' +			// 3+7
      '|\\btunic\\b' +			// 1
      '|\\bvestment\\b' +		// 1
      '|^Braving the Storm$' +
      '|^Castle Rampart$' +
      '|^Death Ward$' +
      '|^Deathrune Hellplate$' +
      '|^Faerie Wings$' +
      '|^Innocence$' +
      '|^Plated Earth$' +
      ')', 'i'),
    Helmet: new RegExp('(' +
      '\\bcowl\\b' +			// 1
      '|\\bcrown\\b' +			// 13
      '|\\bdoomhelm\\b' +		// 1
      '|\\bhelm\\b' +			// 38
      '|\\bhelmet\\b' +			// 2
      '|\\bhorns\\b' +			// 1
      '|\\bmane\\b' +			// 1
      '|\\bmask\\b' +			// 2
      '|\\btiara\\b' +			// 1
      '|\\bveil\\b' +			// 1
      '|^Virtue of Fortitude$' +
      ')', 'i'),
    Amulet: new RegExp('(' +
      '\\bamulet\\b' +			// 18
      '|\\bband\\b' +			// 2
      '|\\bbauble\\b' +			// 1
      '|\\bcharm\\b' +			// 2
      '|\\bcross\\b' +			// 1
      '|\\bearrings\\b' +		// 1
      '|\\beye\\b' +			// 3
      '|\\bflask\\b' +			// 1
      '|\\bheirloom\\b' +		// 1
      '|\\binsignia\\b' +		// 3
      '|\\bjewel\\b' +			// 3
      '|\\blantern\\b' +		// 1
      '|\\blocket\\b' +			// 2
      '|\\bmark\\b' +			// 1
      '|\\bmedallion\\b' +		// 1
      '|\\bmemento\\b' +		// 1
      '|\\bnecklace\\b' +		// 4
      '|\\bpendant\\b' +		// 11
      '|\\brelic\\b' +			// 1
      '|\\bring\\b' +			// 8
      '|\\bruby\\b' +			// 1
      '|\\bseal\\b' +			// 4
      '|\\bshard\\b' +			// 6
      '|\\bsignet\\b' +			// 8
      '|\\bsunstone\\b' +		// 1
      '|\\btalisman\\b' +		// 1
      '|\\btrinket\\b' +		// 2
      '|^Air Orb$' +
      '|^Blue Lotus Petal$' +
      '|^Crystal of Lament$' +
      '|^Dragon Ashes$' +
      '|^Earth Orb$' +
      '|^Force of Nature$' +
      '|^Gold Bar$' +
      '|^Heart of Elos$' +
      '|^Ice Orb$' +
      "|^Keira's Soul$" +
      '|^Lava Orb$' +
      '|^Magic Mushrooms$' +
      "|^Paladin's Oath$" +
      '|^Poseidons Horn$' +
      '|^Shadowmoon$' +
      '|^Silver Bar$' +
      '|^Soul Catcher$' +
      '|^Temptations Lure$' +
      "|^Terra's Heart$" +
      '|^Thawing Star$' +
      '|^Tooth of Gehenna$' +
      '|^Transcendence$' +
      '|^Tribal Crest$' +
      '|^Vincents Soul$' +
      ')', 'i'),
    Gloves: new RegExp('(' +
      '\\bbracer\\b' +			// 1
      '|\\bfists?\\b' +			// 1+1
      '|\\bgauntlets?\\b' +		// 10+4
      '|\\bgloves?\\b' +		// 2+2
      '|\\bhandguards\\b' +		// 1
      '|\\bhands?\\b' +			// 5+3
      '|^Natures Reach$' +
      '|^Poisons Touch$' +
      "|^Slayer's Embrace$" +
      '|^Soul Crusher$' +
      '|^Soul Eater$' +
      '|^Stormbinder$' +
      '|^Stormbringer$' +
      '|^Tempered Steel$' +
      '|^Virtue of Temperance$' +
      ')', 'i')
};

Town.setup = function() {
	Resources.use('Gold');
};

Town.init = function() {
	var now = Date.now(), i;

	this._watch(Player, 'data.worth');			// cash available
	this._watch(Player, 'data.army');			// current army size
	this._watch(Player, 'data.armymax');		// capped army size (player)
	this._watch(Generals, 'runtime.armymax');	// capped army size (generals)
	this._watch(Generals, 'data');				// general stats
	this._watch(Land, 'option.save_ahead');		// land reservation flag
	this._watch(Land, 'runtime.save_amount');	// land reservation amount
	this._watch(Page, 'data.town_soldiers');	// page freshness
	this._watch(Page, 'data.town_blacksmith');	// page freshness
	this._watch(Page, 'data.town_magic');		// page freshness
	this.set('runtime.cost_incr', 4);

	// map old local stale page variables to Page values
	if (!isUndefined(i = this.runtime.soldiers)) {
		if (isNumber(i) && i) {
			Page.setStale('town_soldiers', now);
		}
		this.set('runtime.soldiers');
	}
	if (!isUndefined(i = this.runtime.blacksmith)) {
		if (isNumber(i) && i) {
			Page.setStale('town_blacksmith', now);
		}
		this.set('runtime.blacksmith');
	}
	if (!isUndefined(i = this.runtime.magic)) {
		if (isNumber(i) && i) {
			Page.setStale('town_magic', now);
		}
		this.set('runtime.magic');
	}
};

  // .layout td >div:contains("Owned Items:")
  // .layout td >div div[style*="town_unit_bar."]
  // .layout td >div div[style*="town_unit_bar_owned."]
Town.parse = function(change) {
	var i, el, tmp, img, filename, name, count, now = Date.now(), self = this, modify = false, tmp;
	if (Page.page === 'keep_stats') {
		// Only when it's our own keep and not someone elses
		if ($('.keep_attribute_section').length) {
			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*UNITS\\s*$)').parent());
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				img = $('a img[src]', el);
				filename = ($(img).attr('src') || '').filepart();
				name = this.qualify(($(img).attr('title') || $(img).attr('alt') || '').trim(), filename);
				count = $(el).text().regex(/\bX\s*(\d+)\b/im);
				if (!this.data[name]) {
					//log(LOG_WARN, 'missing unit: ' + name + ' (' + filename + ')');
					Page.setStale('town_soldiers', now);
					break;
				} else if (isNumber(count)) {
					this.set(['data', name, 'own'], count);
				}
			}

			tmp = $('.statsT2 .statsTTitle:regex(^\\s*ITEMS\\s*$)');
			tmp = $('.statUnit', $('.statsT2 .statsTTitle:regex(^\\s*ITEMS\\s*$)').parent());
			for (i=0; i<tmp.length; i++) {
				el = tmp[i];
				img = $('a img[src]', el);
				filename = ($(img).attr('src') || '').filepart();
				name = this.qualify(($(img).attr('title') || $(img).attr('alt') || '').trim(), filename); // names aren't unique for items
				count = $(el).text().regex(/\bX\s*(\d+)\b/im);
				if (!this.data[name] || this.data[name].img !== filename) {
					//log(LOG_WARN, 'missing item: ' + name + ' (' + i + ')' + (this.data[name] ? ' img[' + this.data[name].img + ']' : ''));
					Page.setStale('town_blacksmith', now);
					Page.setStale('town_magic', now);
					break;
				} else if (isNumber(count)) {
					this.set(['data', name, 'own'], count);
				}
			}
		}
	} else if (change && Page.page === 'town_blacksmith') {
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(i,el) {
			var name = ($('div img[alt]', el).attr('alt') || '').trim(),
				icon = ($('div img[src]', el).attr('src') || '').filepart();
			name = self.qualify(name, icon);
			if (self.data[name] && self.data[name].type) {
				$('div strong:first', el).parent().append('<br>'+self.data[name].type);
			}
		});
	} else if (!change && (Page.page === 'town_soldiers' || Page.page === 'town_blacksmith' || Page.page === 'town_magic')) {
		var unit = this.data, page = Page.page.substr(5), purge = {}, changes = 0, i, j, cost_adj = 1;
		for (i in unit) {
			if (unit[i].page === page) {
				purge[i] = true;
			}
		}
		// undo cost reduction general values on the magic page
		if (page === 'magic' && (i = Generals.get(Player.get('general')))) {
			if (i.stats && isNumber(j = i.stats.cost)) {
				cost_adj = 100 / (100 - j);
			}
		}
		$('div[style*="town_unit_bar."],div[style*="town_unit_bar_owned."]').each(function(a,el) {
			try {
				var i, j, type, match, maxlen = 0,
					name = ($('div img[alt]', el).attr('alt') || '').trim(),
					icon = ($('div img[src]', el).attr('src') || '').filepart(),
					cost = parseInt(($('div strong.gold', el).text() || '').replace(/\D/g, '') || 0, 10),
					own = ($('div div:contains("Owned:")', el).text() || '').regex(/\bOwned:\s*(\d+)\b/i) || 0,
					atk = ($('div div div:contains("Attack")', el).text() || '').regex(/\b(\d+)\s+Attack\b/) || 0,
					def = ($('div div div:contains("Defense")', el).text() || '').regex(/\b(\d+)\s+Defense\b/i) || 0,
					upkeep = parseInt(($('div div:contains("Upkeep:") span.negative', el).text() || '').replace(/\D/g, '') || 0, 10);
				self._transaction(); // BEGIN TRANSACTION
				name = self.qualify(name, icon);
				delete purge[name];
				self.set(['data',name,'page'], page);
				self.set(['data',name,'img'], icon);
				self.set(['data',name,'own'], own);
				Resources.add('_'+name, own, true);
				self.set(['data',name,'att'], atk);
				self.set(['data',name,'def'], def);
				self.set(['data',name,'tot_att'], atk + (0.7 * def));
				self.set(['data',name,'tot_def'], def + (0.7 * atk));
				self.set(['data',name,'cost'], cost ? Math.round(cost_adj * cost) : undefined);
				self.set(['data',name,'upkeep'], upkeep ? upkeep : undefined);
//				self.set(['data',name,'id'], null);
				self.set(['data',name,'buy']);
				if ((tmp = $('form[id*="_itemBuy_"]', el)).length) {
					self.set(['data',name,'id'], tmp.attr('id').regex(/_itemBuy_(\d+)/i), 'number');
					$('select[name="amount"] option', tmp).each(function(b, el) {
						self.push(['data',name,'buy'], parseInt($(el).val(), 10), 'number')
					});
				}
				self.set(['data',name,'sell']);
				if ((tmp = $('form[id*="_itemSell_"]', el)).length) {
					self.set(['data',name,'id'], tmp.attr('id').regex(/_itemSell_(\d+)/i), 'number');
					$('select[name="amount"] option', tmp).each(function(b, el) {
						self.push(['data',name,'sell'], parseInt($(el).val(), 10), 'number')
					});
				}
				if (page === 'blacksmith') {
					for (i in self.blacksmith) {
						if ((match = name.match(self.blacksmith[i]))) {
							if (match[1].length > maxlen) {
								type = i;
								maxlen = match[1].length;
							}
						}
					}
					self.set(['data',name,'type'], type);
				}
				self._transaction(true); // COMMIT TRANSACTION
				changes++; // this must come after the transaction
			} catch(e) {
				self._transaction(false); // ROLLBACK TRANSACTION on any error
				log(LOG_ERROR, e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
			}
		});

		// if nothing at all changed above, something went wrong on the page download
		if (changes) {
			for (i in purge) {
				if (purge[i]) {
					log(LOG_WARN, 'Purge: ' + i);
					this.set(['data',i]);
					changes++;
				}
			}
		}

		// trigger the item type caption pass
		if (Page.page === 'town_blacksmith') {
		    modify = true;
		}
	}

	return modify;
};

Town.getInvade = function(army, suffix) {
	var att = 0, def = 0, data = this.get('data');
	if (!suffix) { suffix = ''; }
	att += getAttDef(data, function(list,i,units){if (units[i].page==='soldiers'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].type && units[i].type !== 'Weapon'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', army, 'invade', suffix);
	def += getAttDef(data, null, 'def', army, 'invade', suffix);
	return {attack:att, defend:def};
};

Town.getDuel = function() {
	var att = 0, def = 0, data = this.get('data');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}}, 'att', 1, 'duel');
	def += getAttDef(data, null, 'def', 1, 'duel');
	return {attack:att, defend:def};
};

Town.getWar = function() {
	var att = 0, def = 0, data = this.get('data');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Shield'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Armor'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Helmet'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Amulet'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Gloves'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', -7, 'war');
	def += getAttDef(data, null, 'def', -7, 'war');
	return {attack:att, defend:def};
};

Town.update = function(event, events) {
	var now = Date.now(), i, j, k, p, u, need, want, have, best_buy = null, buy_pref = 0, best_sell = null, sell_pref = 0, best_quest = false, buy = 0, sell = 0, cost, upkeep,
		data = this.data,
		maxincome = Player.get('maxincome', 1, 'number'), // used as a divisor
		upkeep = Player.get('upkeep', 0, 'number'),
		// largest possible army, including bonus generals
		armymax = Math.max(541, Generals.get('runtime.armymax', 1, 'number')),
		// our army size, capped at the largest possible army size above
		army = Math.min(armymax, Math.max(Generals.get('runtime.army', 1, 'number'), Player.get('armymax', 1, 'number'))),
		max_buy = 0, max_sell = 0, resource, fixed_cost, max_cost, keep,
		land_buffer = (Land.get('option.save_ahead') && Land.get('runtime.save_amount', 0, 'number')) || 0,
		incr = this.runtime.cost_incr || 4,
		info_str, buy_str = '', sell_str = '', net_cost = 0, net_upkeep = 0;

	fixed_cost = ({
	    '$0':   0,
		'$10k': 1e4,
		'$100k':1e5,
		'$1m':  1e6,
		'$10m': 1e7,
		'$100m':1e8,
		'$1b':  1e9,
		'$10b': 1e10,
		'$100b':1e11,
		'$1t':  1e12,
		'$10t': 1e13,
		'$100t':1e14,
		'INCR': Math.pow(10,incr)
	})[this.option.maxcost] || 0;

	switch (this.option.number) {
		case 'Army':
			max_buy = max_sell = army;
			break;
		case 'Army+':
			max_buy = army;
			max_sell = armymax;
			break;
		case 'Max Army':
			max_buy = max_sell = armymax;
			break;
		default:
			max_buy = 0;
			max_sell = army;
			break;
	}

	// These three fill in all the data we need for buying / sellings items
	this.set(['runtime','invade'], this.getInvade(max_buy));
	this.set(['runtime','duel'], this.getDuel());
	this.set(['runtime','war'], this.getWar());

	// Set up a keep set for future army sizes
	keep = {};
	if (army < max_sell) {
		this.getInvade(max_sell, max_sell.toString());
		i = 'invade' + max_sell + '_att';
		j = 'invade' + max_sell + '_def';
		for (u in data) {
			if ((p = Resources.get(['data','_'+u]))) {
				need = 0;
				if (this.option.units !== 'Best Defense') {
					need = Math.max(need, Math.min(max_sell, Math.max(p[i] || 0, p.duel_att || 0, p.war_att || 0)));
				}
				if (this.option.units !== 'Best Offense') {
					need = Math.max(need, Math.min(max_sell, Math.max(p[j] || 0, p.duel_def || 0, p.war_def || 0)));
				}
				if ((keep[u] || 0) < need && data[u].sell && data[u].sell.length) {
					keep[u] = need;
				}
				Resources.set(['data','_'+u,i]);
				Resources.set(['data','_'+u,j]);
			}
		}
	}

	// For all items / units
	// 1. parse through the list of buyable items of each type
	// 2. find the one with Resources.get(_item.invade_att) the highest (that's the number needed to hit 541 items in total)
	// 3. buy enough to get there
	// 4. profit (or something)...
	for (u in data) {
		p = Resources.get(['data','_'+u]) || {};
		want = 0;
		if (p.quest) {
			if (this.option.quest_buy) {
				want = Math.max(want, p.quest);
			}
			// add quest counts to the keep set
			if ((keep[u] || 0) < p.quest) {
				keep[u] = p.quest;
			}
		}
		if (isNumber(p.generals)) {
			if (this.option.generals_buy) {
				want = Math.max(want, p.generals);
			}
			// add general item counts to the keep set
			if ((keep[u] || 0) < (p.generals || 1e99)) {
				// Don't sell them unless we know for sure that the general can't use them all
				keep[u] = p.generals || 1e99;
			}
		}
		have = data[u].own || 0;
		need = 0;
		if (this.option.units !== 'Best Defense') {
			need = Math.range(need, Math.max(p.invade_att || 0, p.duel_att || 0, p.war_att || 0), max_buy);
		}
		if (this.option.units !== 'Best Offense') {
			need = Math.range(need, Math.max(p.invade_def || 0, p.duel_def || 0, p.war_def || 0), max_buy);
		}
		if (want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
			max_cost = 1e99; // arbitrarily high value
			need = want;
		} else {
			max_cost = fixed_cost;
		}

//			log(LOG_WARN, 'Item: '+u+', need: '+need+', want: '+want);
		if (need > have) { // Want to buy more                                
			if (!best_quest && data[u].buy && data[u].buy.length) {
				if (data[u].cost <= max_cost && this.option.upkeep >= (((Player.get('upkeep') + ((data[u].upkeep || 0) * (i = data[u].buy.lower(need - have)))) / Player.get('maxincome')) * 100) && i > 1 && (!best_buy || need > buy)) {
//						log(LOG_WARN, 'Buy: '+need);
					best_buy = u;
					buy = have + i; // this.buy() takes an absolute value
					buy_pref = Math.max(need, want);
					if (want && want > have) {// If we're buying for a quest item then we're only going to buy that item first - though possibly more than specifically needed
						best_quest = true;
					}
				}
			}
		} else if (max_buy && this.option.sell && Math.max(need,want) < have && data[u].sell && data[u].sell.length) {// Want to sell off surplus (but never quest stuff)
			need = data[u].sell.lower(have - (i = Math.max(need,want,keep[u] || 0)));
			if (need > 0 && (!best_sell || data[u].cost > data[best_sell].cost)) {
//				log(LOG_WARN, 'Sell: '+need);
				best_sell = u;
				sell = need;
				sell_pref = i;
			}
		}
	}

	if (best_sell) {// Sell before we buy
		best_buy = null;
		buy = 0;
		upkeep = sell * (data[best_sell].upkeep || 0);
		Dashboard.status(this, (this.option._disabled ? 'Would sell ' : 'Selling ') + sell + ' &times; ' + best_sell + ' for ' + makeImage('gold') + '$' + (sell * data[best_sell].cost / 2).SI() + (upkeep ? ' (Upkeep: -$' + upkeep.SI() + ')': '') + (sell_pref < data[best_sell].own ? ' [' + data[best_sell].own + '/' + sell_pref + ']': ''));
	} else if (best_buy){
		best_sell = null;
		sell = 0;
		cost = (buy - data[best_buy].own) * data[best_buy].cost;
		upkeep = (buy - data[best_buy].own) * (data[best_buy].upkeep || 0);
		if (land_buffer && !Bank.worth(land_buffer)) {
			Dashboard.status(this, '<i>Deferring to Land</i>');
		} else if (Bank.worth(this.runtime.cost + land_buffer)) {
			Dashboard.status(this, (this.option._disabled ? 'Would buy ' : 'Buying ') + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI() + (upkeep ? ' (Upkeep: $' + upkeep.SI() + ')' : '') + (buy_pref > data[best_buy].own ? ' [' + data[best_buy].own + '/' + buy_pref + ']' : ''));
		} else {
			Dashboard.status(this, 'Waiting for ' + makeImage('gold') + '$' + (this.runtime.cost + land_buffer - Bank.worth()).SI() + ' to buy ' + (buy - data[best_buy].own) + ' &times; ' + best_buy + ' for ' + makeImage('gold') + '$' + cost.SI());
		}
	} else {
		if (this.option.maxcost === 'INCR'){
			this.set(['runtime','cost_incr'], incr === 14 ? 4 : incr + 1);
			this.set(['runtime','check'], now + 3600000);
		} else {
			this.set(['runtime','cost_incr'], null);
			this.set(['runtime','check'], null);
		}
		Dashboard.status(this);
	}
	this.set(['runtime','best_buy'], best_buy);
	this.set(['runtime','buy'], best_buy ? data[best_buy].buy.lower(buy - data[best_buy].own) : 0);
	this.set(['runtime','best_sell'], best_sell);
	this.set(['runtime','sell'], sell);
	this.set(['runtime','cost'], best_buy ? this.runtime.buy * data[best_buy].cost : 0);

	this.set(['option','_sleep'],
	  !this.runtime.best_sell &&
	  !(this.runtime.best_buy && Bank.worth(this.runtime.cost + land_buffer)) &&
	  !Page.isStale('town_soldiers') &&
	  !Page.isStale('town_blacksmith') &&
	  !Page.isStale('town_magic'));

	return true;
};

Town.work = function(state) {
	var i;
	if (state) {
		if (this.runtime.best_sell){
			this.sell(this.runtime.best_sell, this.runtime.sell);
		} else if (this.runtime.best_buy && Bank.worth(this.runtime.cost - ((Land.get('option.save_ahead', false) && Land.get('runtime.save_amount', 0)) || 0))){
			this.buy(this.runtime.best_buy, this.runtime.buy);
		} else if (!Page.data[i = 'town_soldiers'] || !Page.data[i = 'town_blacksmith'] || !Page.data[i = 'town_magic']) {
			Page.to(i);
		} else if (!Page.stale('town_soldiers', this.get('runtime.soldiers', 0), true)) {
			this.set('runtime.soldiers', 86400);
		} else if (!Page.stale('town_blacksmith', this.get('runtime.blacksmith', 0), true)) {
			this.set('runtime.blacksmith', 86400);
		} else if (!Page.stale('town_magic', this.get('runtime.magic', 0), true)) {
			this.set('runtime.magic', 86400);
		}
	}
	return QUEUE_CONTINUE;
};

Town.buy = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].buy || !this.data[item].buy.length || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = this.data[item].buy.lower(number);
	var $form = $('form#'+APPID_+'itemBuy_' + this.data[item].id);
	if ($form.length) {
		log(LOG_WARN, 'Buying ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Buy"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

Town.sell = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].id || !this.data[item].sell || !this.data[item].sell.length) {
		return true;
	}
	if (!Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var qty = this.data[item].sell.lower(number);
	var $form = $('form#'+APPID_+'itemSell_' + this.data[item].id);
	if ($form.length) {
		log(LOG_WARN, 'Selling ' + qty + ' x ' + item + ' for $' + (qty * Town.data[item].cost / 2).addCommas());
		$('select[name="amount"]', $form).val(qty);
		Page.click($('input[name="Sell"]', $form));
	}
	this.set(['runtime','cost_incr'], 4);
	return false;
};

format_unit_str = function(name) {
    var i, j, k, n, m, p, s, str;

	if (name && ((p = Town.get(['data',name])) || (p = Generals.get(['data',name])))) {
		str = name;

		j = p.att || 0;
		k = p.def || 0;

		s = '';
		if ((m = (p.stats && p.stats.att) || 0) > 0) {
			s += j + '+' + m;
		} else if (m < 0) {
			s += j + m;
		} else {
			s += j;
		}
		j += m;

		s += '/';
		if ((n = (p.stats && p.stats.def) || 0) > 0) {
			s += k + '+' + n;
		} else if (n < 0) {
			s += k + n;
		} else {
			s += k;
		}
		k += n;

		if (m || n) {
			s = '<span style="color:green;" title="' + s + '">';
		} else {
			s = '';
		}

		str += ' (' + s + j + '/' + k + (s ? '</span>' : '') + ')';

		if ((n = p.cost)) {
			str += ' <span style="color:blue;">$' + n.SI() + '</span>';
		}

		if ((n = p.upkeep)) {
			str += ' <span style="color:red;">$' + n.SI() + '/hr</span>';
		}
	} else {
		log(LOG_WARN, '# format_unit_str(' + name + ') not found!');
    }

    return str;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], i, o, p,
		order = {
			Weapon:1,
			Shield:2,
			Helmet:3,
			Armor:4,
			Amulet:5,
			Gloves:6,
			Magic:7
		};

	if (name) {
		output.push('<div><h3><a>' + name + '</a></h3><div>');
	}

	for (i in list) {
		unitfunc(units, i, list);
	}

	if ((o = list[units[0]])) {
		if (type === 'duel' && o.type) {
			units.sort(function(a,b) {
				return order[list[a].type] - order[list[b].type]
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		} else {
			units.sort(function(a,b) {
				return (list[b]['tot_'+x] - list[a]['tot_'+x])
					|| (list[a].upkeep || 0) - (list[b].upkeep || 0)
					|| (list[a].cost || 0) - (list[b].cost || 0);
			});
		}
	}
	for (i=0; i<(count ? count : units.length); i++) {
		p = list[units[i]];
		if ((o && o.skills) || (p.use && p.use[type+'_'+x])) {
			output.push('<div style="height:25px;margin:1px;">');
			output.push('<img src="' + imagepath + p.img + '"');
			output.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
			output.push(' ');
			if (p.use) {
				output.push(p.use[type+'_'+x]+' &times; ');
			}
			output.push(format_unit_str(units[i]));
			output.push('</div>');
		}
	}

	if (name) {
		output.push('</div></div>');
	}

	return output.join('');
};

Town.dashboard = function() {
	var lset = [], rset = [], generals = Generals.get(), best, tmp,
		fn_own = function(list, i, units) {
			if (units[i].own) {
				list.push(i);
			}
		},
		fn_page_soldiers = function(list, i, units) {
			if (units[i].page === 'soldiers') {
				list.push(i);
			}
		},
		fn_page_blacksmith = function(list, i, units) {
			if (units[i].page === 'blacksmith') {
				list.push(i);
			}
		},
		fn_page_magic = function(list, i, units) {
			if (units[i].page === 'magic') {
				list.push(i);
			}
		},
		fn_type_weapon = function(list, i, units) {
			if (units[i].type === 'Weapon') {
				list.push(i);
			}
		},
		fn_type_not_weapon = function(list, i, units) {
			if (units[i].page === 'blacksmith' && units[i].type !== 'Weapon') {
				list.push(i);
			}
		},
		fn_type_shield = function(list, i, units) {
			if (units[i].type === 'Shield') {
				list.push(i);
			}
		},
		fn_type_armor = function(list, i, units) {
			if (units[i].type === 'Armor') {
				list.push(i);
			}
		},
		fn_type_helmet = function(list, i, units) {
			if (units[i].type === 'Helmet') {
				list.push(i);
			}
		},
		fn_type_amulet = function(list, i, units) {
			if (units[i].type === 'Amulet') {
				list.push(i);
			}
		},
		fn_type_gloves = function(list, i, units) {
			if (units[i].type === 'Gloves') {
				list.push(i);
			}
		};

	// invade

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.invade_att) {
			tmp[i] = this.data[i];
		}
	}

	lset.push('<div><h3><a>Invade - Attack</a></h3><div>');
	lset.push(makeTownDash(generals, fn_own, 'att', 'invade', 'Heroes'));
	lset.push(makeTownDash(tmp, fn_page_soldiers, 'att', 'invade', 'Soldiers'));
	lset.push(makeTownDash(tmp, fn_type_weapon, 'att', 'invade', 'Weapons'));
	lset.push(makeTownDash(tmp, fn_type_not_weapon, 'att', 'invade', 'Equipment'));
	lset.push(makeTownDash(tmp, fn_page_magic, 'att', 'invade', 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.invade_def) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>Invade - Defend</a></h3><div>');
	rset.push(makeTownDash(generals, fn_own, 'def', 'invade', 'Heroes'));
	rset.push(makeTownDash(tmp, fn_page_soldiers, 'def', 'invade', 'Soldiers'));
	rset.push(makeTownDash(tmp, fn_type_weapon, 'def', 'invade', 'Weapons'));
	rset.push(makeTownDash(tmp, fn_type_not_weapon, 'def', 'invade', 'Equipment'));
	rset.push(makeTownDash(tmp, fn_page_magic, 'def', 'invade', 'Magic'));
	rset.push('</div></div>');
	
	// duel

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.duel_att) {
			tmp[i] = this.data[i];
		}
	}

	lset.push('<div><h3><a>Duel - Attack</a></h3><div>');
	if ((best = Generals.best('duel')) !== 'any') {
		lset.push('<div style="height:25px;margin:1px;">');
		lset.push('<img src="' + imagepath + generals[best].img + '"');
		lset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		lset.push(format_unit_str(best));
		lset.push('</div>');
	}
	lset.push(makeTownDash(tmp, fn_page_blacksmith, 'att', 'duel'));
	lset.push(makeTownDash(tmp, fn_page_magic, 'att', 'duel'));
	lset.push('</div></div>');
	
	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.duel_def) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>Duel - Defend</a></h3><div>');
	if ((best = Generals.best('defend')) !== 'any') {
		rset.push('<div style="height:25px;margin:1px;">');
		rset.push('<img src="' + imagepath + generals[best].img + '"');
		rset.push(' style="width:25px;height:25px;float:left;margin-right:4px;">');
		rset.push(format_unit_str(best));
		rset.push('</div>');
	}
	rset.push(makeTownDash(tmp, fn_page_blacksmith, 'def', 'duel'));
	rset.push(makeTownDash(tmp, fn_page_magic, 'def', 'duel'));
	rset.push('</div></div>');

	// war

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.war_att) {
			tmp[i] = this.data[i];
			}
	}

	lset.push('<div><h3><a>War - Attack</a></h3><div>');
	lset.push(makeTownDash(generals, fn_own, 'att', 'war', 'Heroes', 6));
	lset.push(makeTownDash(tmp, fn_type_weapon, 'att', 'war', 'Weapons'));
	lset.push(makeTownDash(tmp, fn_type_shield, 'att', 'war', 'Shield'));
	lset.push(makeTownDash(tmp, fn_type_armor, 'att', 'war', 'Armor'));
	lset.push(makeTownDash(tmp, fn_type_helmet, 'att', 'war', 'Helmet'));
	lset.push(makeTownDash(tmp, fn_type_amulet, 'att', 'war', 'Amulet'));
	lset.push(makeTownDash(tmp, fn_type_gloves, 'att', 'war', 'Gloves'));
	lset.push(makeTownDash(tmp, fn_page_magic, 'att', 'war', 'Magic'));
	lset.push('</div></div>');

	// prepare a short list of items being used
	tmp = {};
	for (i in this.data) {
		if (this.data[i].use && this.data[i].use.war_def) {
			tmp[i] = this.data[i];
		}
	}

	rset.push('<div><h3><a>War - Defend</a></h3><div>');
	rset.push(makeTownDash(generals, fn_own, 'def', 'war', 'Heroes', 6));
	rset.push(makeTownDash(tmp, fn_type_weapon, 'def', 'war', 'Weapons'));
	rset.push(makeTownDash(tmp, fn_type_shield, 'def', 'war', 'Shield'));
	rset.push(makeTownDash(tmp, fn_type_armor, 'def', 'war', 'Armor'));
	rset.push(makeTownDash(tmp, fn_type_helmet, 'def', 'war', 'Helmet'));
	rset.push(makeTownDash(tmp, fn_type_amulet, 'def', 'war', 'Amulet'));
	rset.push(makeTownDash(tmp, fn_type_gloves, 'def', 'war', 'Gloves'));
	rset.push(makeTownDash(tmp, fn_page_magic, 'def', 'war', 'Magic'));
	rset.push('</div></div>');
	
	// div wrappers

	lset.unshift('<div style="float:left;width:50%;">');
	lset.push('</div>');

	rset.unshift('<div style="float:right;width:50%;">');
	rset.push('</div>');

	$('#golem-dashboard-Town').html(lset.join('') + rset.join(''));
	$('#golem-dashboard-Town h3').parent().accordion({
		collapsible: true,
		autoHeight: false,
		active: false,
		clearStyle: true,
		animated: 'blind',
		header: '> h3'
	});

};

Town.qualify = function(name, icon) {
	var p;

	if (isString(name)) {
		// if name already has a qualifier, peel it off
		if ((p = name.search(/\s*\(/m)) >= 0) {
			name = name.substr(0, p).trim();
		}

		// if an icon is provided, use it to further qualify the name
		if (isString(icon)) {
			if (isObject(p = this.dup_map[name]) && (icon in p)) {
				name = p[icon];
			}
		}
	}

	return name;
};

Town.dup_map = {
	'Earth Shard': { // Alchemy
		'gift_earth_1.jpg':	'Earth Shard (1)',
		'gift_earth_2.jpg':	'Earth Shard (2)',
		'gift_earth_3.jpg':	'Earth Shard (3)',
		'gift_earth_4.jpg':	'Earth Shard (4)'
	},
	'Elven Crown': { // Helmet
		'gift_aeris_complete.jpg':	'Elven Crown (Aeris)',
		'eq_sylvanus_crown.jpg':	'Elven Crown (Sylvanas)'
	},
	'Green Emerald Shard': { // Alchemy
		'mystery_armor_emerald_1.jpg': 'Green Emerald Shard (1)',
		'mystery_armor_emerald_2.jpg': 'Green Emerald Shard (2)'
	},
	'Maelstrom': { // Magic
		'magic_maelstrom.jpg':		'Maelstrom (Marina)',
		'eq_valhalla_spell.jpg':	'Maelstrom (Valhalla)'
	}
};
/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade');
Upgrade.data = Upgrade.temp = null;

Upgrade.settings = {
	taint:true
};

Upgrade.defaults['castle_age'] = {
	pages:'keep_stats'
};

Upgrade.option = {
	order:[]
};

Upgrade.runtime = {
	working:false,
	run:0
};

Upgrade.display = [
	{
		label:'Points will be allocated in this order, add multiple entries if wanted (ie, 3x Attack and 1x Defense would put &frac34; on Attack and &frac14; on Defense)'
	},{
		id:'order',
		multiple:['Energy', 'Stamina', 'Attack', 'Defense', 'Health']
	}
];

Upgrade.init = function() {
	this._watch(Player, 'data.upgrade');
};

Upgrade.parse = function(change) {
	var result = $('div.results');
	if (this.runtime.working && result.length && result.text().match(/You just upgraded your/i)) {
		this.set('runtime.working', false);
		this.set(['runtime','run'], this.runtime.run + 1);
	}
	return false;
};

Upgrade.update = function(event) {
	if (this.runtime.run >= this.option.order.length) {
		this.set(['runtime','run'], 0);
	}
	var points = Player.get('upgrade'), args;
	this.set('option._sleep', !this.option.order.length || Player.get('upgrade') < (this.option.order[this.runtime.run]==='Stamina' ? 2 : 1));
};

Upgrade.work = function(state) {
	var args = ({Energy:'energy_max', Stamina:'stamina_max', Attack:'attack', Defense:'defense', Health:'health_max'})[this.option.order[this.runtime.run]];
	if (!args) {
		this.set(['runtime','run'], this.runtime.run + 1);
	} else if (state) {
		this.set(['runtime','working'], true);
		Page.to('keep_stats', {upgrade:args}, true);
	}
	return QUEUE_RELEASE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page, Queue, Resources,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage
*/
/********** Worker.FP **********
* Automatically buys FP refills
*/
var FP = new Worker('FP');
FP.temp = null;

FP.settings = {
	advanced:true,
	taint:true
};

FP.defaults['castle_age'] = {
	pages:'index oracle_oracle'
};

FP.option = {
	type:'stamina',
	general_choice:'any',
	xp:2800,
	times:0,
	fps:100,
	stat:10
};

FP.display = [
	{
		title:'Important!',
		label:'If Times per Level > 0, this will SPEND FAVOR POINTS!  Use with care.  No guarantee of any kind given.  No refunds.'
	},{
		id:'times',
		label:'Times per level ',
		text:true,
		help:'Never refill more than this many times per level.'
	},{
		id:'general',
		label:'Use General',
//		require:'general=="Manual"',
		select:'generals'
	},{
		id:'type',
		label:'Refill ',
		select:['energy','stamina'],
		help:'Select which resource you want to refill.'
	},{
		id:'xp',
		label:'Refill ',
		text:true,
		help:'Refill when more than this much xp needed to level up.'
	},{
		id:'stat',
		label:'When stat under ',
		text:true,
		help:'Refill when stamina/energy under this number'
	},{
		id:'fps',
		label:'Amount of FPs to keep always',
		text:true,
		help:'Only do a refill if you will have over this amount of FP after refill'
	}
];

FP.runtime = {
	points:0
};

FP.init = function() {
	// BEGIN: fix up "under level 4" generals
	if (this.option.general=== 'under level 4') {
	        this.set('option.general', 'under max level');
	}
	// END
};

FP.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.oracleItemSmallBoxGeneral:contains("You have : ")').each(function(i,el){
		FP.set(['runtime','points'], $(el).text().regex(/You have : (\d+) points/i));
	});
	$('.title_action:contains("favor points")').each(function(i,el){
		FP.set(['runtime','points'], $(el).text().regex(/You have (\d+) favor points/i));
	});
	History.set('favor points',this.runtime.points);
	return false;
};

FP.notReady = function() {
	return (Player.get(this.option.type,0) >= this.option.stat 
			|| Player.get('exp_needed', 0) < this.option.xp 
			|| (this.data[Player.get('level',0)] || 0) >= this.option.times 
			|| this.runtime.points < this.option.fps + 10 
			|| LevelUp.get('runtime.running'));
};

FP.update = function(event) {
	Dashboard.status(this, 'You have ' + makeImage('favor') + this.runtime.points + ' favor points.');
	this.set(['option','_sleep'], FP.notReady());
//	log(LOG_WARN, 'a '+(Player.get(this.option.type,0) >= this.option.stat));
//	log(LOG_WARN, 'b '+(Player.get('exp_needed', 0) < this.option.xp));
//	log(LOG_WARN, 'c '+((this.data[Player.get('level',0)] || 0) >= this.option.times));
//	log(LOG_WARN, 'd '+(this.runtime.points < this.option.fps + 10));
};

FP.work = function(state) {
	if (FP.notReady()) {
		return QUEUE_NO_ACTION;
	}
	if (state && Generals.to(this.option.general) && Page.to('oracle_oracle')) {
		Page.click('#'+APPID_+'favorBuy_' + (this.option.type === 'energy' ? '5' : '6') + ' input[name="favor submit"]');
		//this.set(['data', Player.get('level',0).toString()], (parseInt(this.data[Player.get('level',0).toString()] || 0, 10)) + 1); 
		log(LOG_WARN, 'Clicking on ' + this.option.type + ' refill ' + Player.get('level',0));
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, sortObject, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
*//********** Worker.Guild() **********
* Build your guild army
* Auto-attack Guild targets
*/
var Guild = new Worker('Guild');

Guild.settings = {
	taint:true
};

Guild.defaults['castle_age'] = {
	pages:'battle_guild battle_guild_battle'
};

Guild.option = {
	general:true,
	general_choice:'any',
	start:false,
	collect:true,
	tokens:'min',
	safety:60000,
	ignore:'',
	limit:'',
	cleric:false
};

Guild.runtime = {
	tokens:10,
	status:'none',// none, wait, start, fight, collect
	start:0,
	finish:0,
	rank:0,
	points:0,
	burn:false,
	last:null, // name of last target, .data[last] then we've lost so skip them
	stunned:false
};

Guild.temp = {
	status:{
		none:'Unknown',
		wait:'Waiting for Next Battle',
		start:'Entering Battle',
		fight:'In Battle',
		collect:'Collecting Reward'
	}
};

Guild.display = [
	{
		id:'general',
 		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'start',
 		label:'Automatically Start',
		checkbox:true
	},{
		id:'delay',
		label:'Start Delay',
		require:'start',
		select:{0:'None',60000:'1 Minute',120000:'2 Minutes',180000:'3 Minutes',240000:'4 Minutes',300000:'5 Minutes'}
	},{
		id:'collect',
 		label:'Collect Rewards',
		checkbox:true
	},{
		id:'tokens',
		label:'Use Tokens',
		select:{min:'Immediately', healthy:'Save if Stunned', max:'Save Up'}
	},{
		id:'safety',
		label:'Safety Margin',
		require:'tokens!="min"',
		select:{30000:'30 Seconds',45000:'45 Seconds',60000:'60 Seconds',90000:'90 Seconds'}
	},{
		id:'order',
		label:'Attack',
		select:{health:'Lowest Health', level:'Lowest Level', maxhealth:'Lowest Max Health', activity:'Lowest Activity', health2:'Highest Health', level2:'Highest Level', maxhealth2:'Highest Max Health', activity2:'Highest Activity'}
	},{
		advanced:true,
		id:'limit',
		label:'Relative Level',
		text:true,
		help:'Positive values are levels above your own, negative are below. Leave blank for no limit'
	},{
		id:'cleric',
 		label:'Attack Clerics First',
		checkbox:true,
		help:'This will attack any *active* clerics first, which might help prevent the enemy from healing up again...'
	},{
		id:'defeat',
 		label:'Avoid Defeat',
		checkbox:true,
		help:'This will prevent you attacking a target that you have already lost to'
	},{
		advanced:true,
		id:'ignore',
		label:'Ignore Targets',
		text:true,
		help:'Ignore any targets with names containing these tags - use | to separate multiple tags'
	}
];

Guild.init = function() {
	var now = Date.now();

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END

	this._remind(180, 'tokens');// Gain more tokens every 5 minutes
	if (this.runtime.start && this.runtime.start > now) {
		this._remind((this.runtime.start - now) / 1000, 'start');
	}
	if (this.runtime.finish && this.runtime.finish > now) {
		this._remind((this.runtime.finish - now) / 1000, 'finish');
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	this._trigger('#'+APPID_+'guild_token_current_value', 'tokens'); //fix
};

Guild.parse = function(change) {
	var now = Date.now(), tmp, i;
	switch (Page.page) {
		case 'battle_guild':
			if ($('input[src*="dragon_list_btn_2.jpg"]').length) {//fix
				this.set(['runtime','status'], 'collect');
				this._forget('finish');
				this.set(['runtime','start'], 1800000 + now);
				this._remind(1800, 'start');
			} else if ($('input[src*="dragon_list_btn_3.jpg"]').length) {
				if (this.runtime.status !== 'fight' && this.runtime.status !== 'start') {
					this.set(['runtime','status'], 'start');
				}
			} else {
				this._forget('finish');
				this.set(['runtime','start'], 1800000 + now);
				this._remind(1800, 'start');
				this.set(['runtime','status'], 'wait');
			}
			break;
		case 'battle_guild_battle':
			this.set(['runtime','tokens'], ($('#'+APPID_+'guild_token_current_value').text() || '10').regex(/(\d+)/));//fix
			this._remind(($('#'+APPID_+'guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');//fix
			i = $('#'+APPID_+'monsterTicker').text().parseTimer();
			if ($('input[src*="collect_reward_button2.jpg"]').length) {
				this.set(['runtime','status'], 'collect');
			} else if (i === 9999) {
				this._forget('finish');
				this.set(['runtime','start'], 1800000 + now);
				this._remind(1800, 'start');
				this.set(['runtime','status'], 'wait');
			} else {
				this.set(['runtime','status'], 'fight');
				this.set(['runtime','finish'], (i * 1000) + now);
				this._remind(i, 'finish');
			}
			tmp = $('#'+APPID_+'results_main_wrapper');
			if (tmp.length) {
				i = tmp.text().regex(/\+(\d+) \w+ Activity Points/i);
				if (isNumber(i)) {
					History.add('guild', i);
					History.add('guild_count', 1);
					this._notify('data');// Force dashboard update
				}
			}
			if ($('img[src*="battle_defeat"]').length && this.runtime.last) {//fix
				this.set(['data',this.runtime.last], true);
			}
			this.set(['runtime','stunned'], !!$('#'+APPID_+'guild_battle_banner_section:contains("Status: Stunned")').length);//fix
			break;
	}
};

Guild.update = function(event) {
	var now = Date.now();
	if (event.type === 'reminder') {
		if (event.id === 'tokens') {
			this.set(['runtime','tokens'], Math.min(10, this.runtime.tokens + 1));
			if (this.runtime.tokens < 10) {
				this._remind(180, 'tokens');
			}
		} else if (event.id === 'start') {
			this.set(['runtime','status'], 'start');
		} else if (event.id === 'finish') {
			this.set(['runtime','status'], 'collect');
		}
	}
	if (event.type === 'trigger' && event.id === 'tokens') {
		if ($('#'+APPID_+'guild_token_current_value').length) {//fix
			this.set(['runtime','tokens'], $('#'+APPID_+'guild_token_current_value').text().regex(/(\d+)/) || 0);//fix
		}
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	if (!this.runtime.tokens) {
		this.set(['runtime','burn'], false);
	} else if (this.runtime.tokens >= 10 || (this.runtime.finish || 0) - this.option.safety <= now) {
		this.set(['runtime','burn'], true);
	}
	this.set(['option','_sleep'],
		   !(this.runtime.status === 'wait' && this.runtime.start <= now) // Should be handled by an event
		&& !(this.runtime.status === 'start' && Player.get('stamina',0) >= 20 && this.option.start)
		&& !(this.runtime.status === 'fight' && this.runtime.tokens
			&& (!this.option.delay || this.runtime.finish - 3600000  >= now - this.option.delay)
				&& (this.option.tokens === 'min'
					|| (this.option.tokens === 'healthy' && (!this.runtime.stunned || this.runtime.burn))
					|| (this.option.tokens === 'max' && this.runtime.burn)))
		&& !(this.runtime.status === 'collect' && this.option.collect));
	Dashboard.status(this, 'Status: ' + this.temp.status[this.runtime.status] + (this.runtime.status === 'wait' ? ' (' + Page.addTimer('guild_start', this.runtime.start) + ')' : '') + (this.runtime.status === 'fight' ? ' (' + Page.addTimer('guild_start', this.runtime.finish) + ')' : '') + ', Tokens: ' + makeImage('guild', 'Guild Tokens') + ' ' + this.runtime.tokens + ' / 10');
};

Guild.work = function(state) {
	if (state) {
		if (this.runtime.status === 'wait') {
			if (!Page.to('battle_guild')) {
				return QUEUE_FINISH;
			}
		} else if (this.runtime.status !== 'fight' || Generals.to(this.option.general ? 'duel' : this.option.general_choice)) {
			if (Page.page !== 'battle_guild_battle') {
				if (Page.page !== 'battle_guild') {
					Page.to('battle_guild');
				} else {
					Page.click('input[src*="dragon_list_btn"]');
				}
			} else {
				if (this.runtime.status === 'collect') {
					if (!$('input[src*="collect_reward_button2.jpg"]').length) {
						Page.to('battle_guild');
					} else {
						log('Collecting Reward');
						Page.click('input[src*="collect_reward_button2.jpg"]');
					}
				} else if (this.runtime.status === 'fight' || this.runtime.status === 'start') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						log('Entering Battle');
						Page.click('input[src*="guild_enter_battle_button.gif"]');
						this.set(['data'], {}); // Forget old "lose" list
						return QUEUE_CONTINUE;
					}
					var best = null, besttarget, besthealth, ignore = this.option.ignore && this.option.ignore.length ? this.option.ignore.split('|') : [];
					$('#'+APPID_+'enemy_guild_member_list_1 > div, #'+APPID_+'enemy_guild_member_list_2 > div, #'+APPID_+'enemy_guild_member_list_3 > div, #'+APPID_+'enemy_guild_member_list_4 > div').each(function(i,el){
					
						var test = false, cleric = false, i = ignore.length, $el = $(el), txt = $el.text().trim().replace(/\s+/g,' '), target = txt.regex(/^(.*) Level: (\d+) Class: ([^ ]+) Health: (\d+)\/(\d+) Status: ([^ ]+) \w+ Activity Points: (\d+)/i);
						// target = [0:name, 1:level, 2:class, 3:health, 4:maxhealth, 5:status, 6:activity]
						if (!target 
								|| (Guild.option.defeat && Guild.data && Guild.data[target[0]])
								|| (isNumber(Guild.option.limit) 
									&& target[1] > Player.get('level',0) + Guild.option.limit)) {
							return;
						}
						while (i--) {
							if (target[0].indexOf(ignore[i]) >= 0) {
								return;
							}
						}
						if (besttarget) {
							switch(Guild.option.order) {
								case 'level':		test = target[1] < besttarget[1];	break;
								case 'health':		test = target[3] < besttarget[3];	break;
								case 'maxhealth':	test = target[4] < besttarget[4];	break;
								case 'activity':	test = target[6] < besttarget[6];	break;
								case 'level2':		test = target[1] > besttarget[1];	break;
								case 'health2':		test = target[3] > besttarget[3];	break;
								case 'maxhealth2':	test = target[4] > besttarget[4];	break;
								case 'activity2':	test = target[6] > besttarget[6];	break;
							}
						}
						if (Guild.option.cleric) {
							cleric = target[2] === 'Cleric' && target[6] && (!best || besttarget[2] !== 'Cleric');
						}
						if ((target[3] && (!best || cleric)) || (target[3] >= 200 && (besttarget[3] < 200 || test))) {
							best = el;
							besttarget = target;
						}
					});
					if (best) {
						this.set(['runtime','last'], besttarget[0]);
						log('Attacking '+besttarget[0]+' with '+besttarget[3]+' health');
						if ($('input[src*="monster_duel_button.gif"]', best).length) {
							Page.click($('input[src*="monster_duel_button.gif"]', best));
						} else {
							log(LOG_INFO, 'But couldn\'t find button, so backing out.');
							Page.to('battle_guild');
						}
					} else {
						this.set(['runtime','last'], null);
					}
				}
			}
		}
	}
	return QUEUE_CONTINUE;
};

/*jslint browser:true, laxbreak:true, forin:true, sub:true, onevar:true, undef:true, eqeqeq:true, regexp:false */
/*global
	$, Worker, Army, Config, Dashboard, History, Page:true, Queue, Resources, Global,
	Battle, Generals, LevelUp, Player,
	APP, APPID, log, debug, userID, imagepath, isRelease, version, revision, Workers, PREFIX, Images, window, browser,
	QUEUE_CONTINUE, QUEUE_RELEASE, QUEUE_FINISH,
	makeTimer, Divisor, length, sum, findInObject, objectIndex, getAttDef, tr, th, td, isArray, isObject, isFunction, isNumber, isString, isWorker, plural, makeTime,
	makeImage, log, warn, error
*//********** Worker.Festival() **********
* Build your festival army
* Auto-attack Festival targets
*/
var Festival = new Worker('Festival');

Festival.settings = {
	taint:true
};

Festival.defaults['castle_age'] = {
	pages:'festival_guild festival_guild_battle'
};

Festival.option = {
	general:true,
	general_choice:'any',
	start:false,
	collect:true,
	tokens:'min',
	safety:60000,
	ignore:'',
	limit:'',
	cleric:false
};

Festival.runtime = {
	tokens:10,
	status:'start',// wait, start, fight, collect
	start:0,
	finish:0,
	rank:0,
	points:0,
	burn:false,
	last:null, // name of last target, .data[last] then we've lost so skip them
	stunned:false
};

Festival.temp = {
	status:{
		none:'Unknown',
		wait:'Waiting for Next Battle',
		start:'Entering Battle',
		fight:'In Battle',
		collect:'Collecting Reward'
	}
};

Festival.display = [
	{
		id:'general',
 		label:'Use Best General',
		checkbox:true
	},{
		advanced:true,
		id:'general_choice',
		label:'Use General',
		require:'!general',
		select:'generals'
	},{
		id:'start',
 		label:'Automatically Start',
		checkbox:true
	},{
		id:'delay',
		label:'Start Delay',
		require:'start',
		select:{0:'None',60000:'1 Minute',120000:'2 Minutes',180000:'3 Minutes',240000:'4 Minutes',300000:'5 Minutes'}
	},{
		id:'collect',
 		label:'Collect Rewards',
		checkbox:true
	},{
		id:'tokens',
		label:'Use Tokens',
		select:{min:'Immediately', healthy:'Save if Stunned', max:'Save Up'}
	},{
		id:'safety',
		label:'Safety Margin',
		require:'tokens!="min"',
		select:{30000:'30 Seconds',45000:'45 Seconds',60000:'60 Seconds',90000:'90 Seconds'}
	},{
		id:'order',
		label:'Attack',
		select:{health:'Lowest Health', level:'Lowest Level', maxhealth:'Lowest Max Health', activity:'Lowest Activity', health2:'Highest Health', level2:'Highest Level', maxhealth2:'Highest Max Health', activity2:'Highest Activity'}
	},{
		advanced:true,
		id:'limit',
		label:'Relative Level',
		text:true,
		help:'Positive values are levels above your own, negative are below. Leave blank for no limit'
	},{
		id:'cleric',
 		label:'Attack Clerics First',
		checkbox:true,
		help:'This will attack any *active* clerics first, which might help prevent the enemy from healing up again...'
	},{
		id:'defeat',
 		label:'Avoid Defeat',
		checkbox:true,
		help:'This will prevent you attacking a target that you have already lost to'
	},{
		advanced:true,
		id:'ignore',
		label:'Ignore Targets',
		text:true,
		help:'Ignore any targets with names containing these tags - use | to separate multiple tags'
	}
];

Festival.init = function() {
	var now = Date.now();

	// BEGIN: fix up "under level 4" generals
	if (this.option.general_choice === 'under level 4') {
		this.set('option.general_choice', 'under max level');
	}
	// END

	this._remind(180, 'tokens');// Gain more tokens every 5 minutes
	if (this.runtime.start && this.runtime.start > now) {
		this._remind((this.runtime.start - now) / 1000, 'start');
	}
	if (this.runtime.finish && this.runtime.finish > now) {
		this._remind((this.runtime.finish - now) / 1000, 'finish');
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	this._trigger('#'+APPID_+'guild_token_current_value', 'tokens'); //fix
};

Festival.parse = function(change) {
	var now = Date.now(), tmp, i;
	switch (Page.page) {
		case 'festival_guild':
			tmp = $('#'+APPID_+'current_battle_info').text();
			if (tmp.indexOf('BATTLE NOW!') > -1) {
				if (this.runtime.status !== 'fight' && this.runtime.status !== 'start') {
					this.set(['runtime','status'], 'start');
				}
			} else {
				this.set(['runtime','status'], tmp.indexOf('COLLECT') > -1 ? 'collect' : 'wait');
				this._forget('finish');
				i = tmp.indexOf('HOURS') > -1 ? tmp.regex(/(\d+) HOURS/i) * 3600 
						: tmp.indexOf('MINS') > -1 ? tmp.regex(/(\d+) MINS/i) * 60 : 180;
				this._forget('finish');
				this.set(['runtime','start'], i*1000 + now);
				this._remind(i , 'start');
			}
			break;
		case 'festival_guild_battle':
			this.set(['runtime','tokens'], ($('#'+APPID_+'guild_token_current_value').text() || '10').regex(/(\d+)/));//fix
			this._remind(($('#'+APPID_+'guild_token_time_value').text() || '5:00').parseTimer(), 'tokens');//fix
			i = $('#'+APPID_+'monsterTicker').text().parseTimer();
			if ($('input[src*="arena3_collectbutton.gif"]').length) {
				this.set(['runtime','status'], 'collect');
			} else if (i === 9999) {
				this.set(['runtime','status'], 'wait');
				this.set(['runtime','start'], 3600000 + now);
				this._remind(3600 , 'start');
			} else {
				this.set(['runtime','status'], 'fight');
				this.set(['runtime','finish'], (i * 1000) + now);
				this._remind(i, 'finish');
			}
			tmp = $('#'+APPID_+'results_main_wrapper');
			if (tmp.length) {
				i = tmp.text().regex(/\+(\d+) \w+ Activity Points/i);
				if (isNumber(i)) {
					History.add('festival', i);
					History.add('festival_count', 1);
					this._notify('data');// Force dashboard update
				}
			}
			if ($('img[src*="battle_defeat"]').length && this.runtime.last) {//fix
				this.set(['data',this.runtime.last], true);
			}
			this.set(['runtime','stunned'], !!$('#'+APPID_+'guild_battle_banner_section:contains("Status: Stunned")').length);//fix
			break;
	}
};

Festival.update = function(event) {
	var now = Date.now();
	if (event.type === 'reminder') {
		if (event.id === 'tokens') {
			this.set(['runtime','tokens'], Math.min(10, this.runtime.tokens + 1));
			if (this.runtime.tokens < 10) {
				this._remind(180, 'tokens');
			}
		} else if (event.id === 'start') {
			this.set(['runtime','status'], 'start');
		} else if (event.id === 'finish') {
			this.set(['runtime','status'], 'collect');
		}
	}
	if (event.type === 'trigger' && event.id === 'tokens') {
		if ($('#'+APPID_+'guild_token_current_value').length) {//fix
			this.set(['runtime','tokens'], $('#'+APPID_+'guild_token_current_value').text().regex(/(\d+)/) || 0);
		}
	}
	if (this.runtime.status === 'fight' && this.runtime.finish - this.option.safety > now) {
		this._remind((this.runtime.finish - this.option.safety - now) / 1000, 'fight');
	}
	if (!this.runtime.tokens) {
		this.set(['runtime','burn'], false);
	} else if (this.runtime.tokens >= 10 || (this.runtime.finish || 0) - this.option.safety <= now) {
		this.set(['runtime','burn'], true);
	}
	this.set(['option','_sleep'],
		   !(this.runtime.status === 'wait' && this.runtime.start <= now) // Should be handled by an event
		&& !(this.runtime.status === 'start' && Player.get('stamina',0) >= 20 && this.option.start)
		&& !(this.runtime.status === 'fight' && this.runtime.tokens
			&& (!this.option.delay || this.runtime.finish - 3600000 >= now - this.option.delay)
			&& (this.option.tokens === 'min'
			|| (this.option.tokens === 'healthy' && (!this.runtime.stunned || this.runtime.burn))
			|| (this.option.tokens === 'max' && this.runtime.burn)))
		&& !(this.runtime.status === 'collect' && this.option.collect));
	Dashboard.status(this, 'Status: ' + this.temp.status[this.runtime.status] + (this.runtime.status === 'wait' ? ' (' + Page.addTimer('festival_start', this.runtime.start) + ')' : '') + (this.runtime.status === 'fight' ? ' (' + Page.addTimer('festival_start', this.runtime.finish) + ')' : '') + ', Tokens: ' + makeImage('arena', 'Festival Tokens') + ' ' + this.runtime.tokens + ' / 10');
};

Festival.work = function(state) {
	if (state) {
		if (this.runtime.status === 'wait') {
			if (!Page.to('festival_guild')) {
				return QUEUE_FINISH;
			}
		} else if (this.runtime.status !== 'fight' || Generals.to(this.option.general ? 'duel' : this.option.general_choice)) {
			if (Page.page !== 'festival_guild_battle') {
				if (Page.page !== 'festival_guild') {
					Page.to('festival_guild');
				} else {
					Page.click('img.imgButton[src*="festival_arena_enter.jpg"]');
				}
			} else {
				if (this.runtime.status === 'collect') {
					if (!$('input[src*="arena3_collectbutton.gif"]').length) {//fix
						Page.to('festival_guild');
					} else {
						log('Collecting Reward');
						Page.click('input[src*="arena3_collectbutton.gif"]');//fix
					}
				} else if (this.runtime.status === 'start') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						log('Entering Battle');
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					this.set(['data'], {}); // Forget old "lose" list
				} else if (this.runtime.status === 'fight') {
					if ($('input[src*="guild_enter_battle_button.gif"]').length) {
						log('Entering Battle');
						Page.click('input[src*="guild_enter_battle_button.gif"]');
					}
					var best = null, besttarget, besthealth, ignore = this.option.ignore && this.option.ignore.length ? this.option.ignore.split('|') : [];
					$('#'+APPID_+'enemy_guild_member_list_1 > div, #'+APPID_+'enemy_guild_member_list_2 > div, #'+APPID_+'enemy_guild_member_list_3 > div, #'+APPID_+'enemy_guild_member_list_4 > div').each(function(i,el){
					
						var test = false, cleric = false, i = ignore.length, $el = $(el), txt = $el.text().trim().replace(/\s+/g,' '), target = txt.regex(/^(.*) Level: (\d+) Class: ([^ ]+) Health: (\d+)\/(\d+) Status: ([^ ]+) \w+ Activity Points: (\d+)/i);
						// target = [0:name, 1:level, 2:class, 3:health, 4:maxhealth, 5:status, 6:activity]
						if (!target 
								|| (Festival.option.defeat && Festival.data 
									&& Festival.data[target[0]])
								|| (isNumber(Festival.option.limit) 
									&& target[1] > Player.get('level',0) + Festival.option.limit)) {
							return;
						}
						while (i--) {
							if (target[0].indexOf(ignore[i]) >= 0) {
								return;
							}
						}
						if (besttarget) {
							switch(Festival.option.order) {
								case 'level':		test = target[1] < besttarget[1];	break;
								case 'health':		test = target[3] < besttarget[3];	break;
								case 'maxhealth':	test = target[4] < besttarget[4];	break;
								case 'activity':	test = target[6] < besttarget[6];	break;
								case 'level2':		test = target[1] > besttarget[1];	break;
								case 'health2':		test = target[3] > besttarget[3];	break;
								case 'maxhealth2':	test = target[4] > besttarget[4];	break;
								case 'activity2':	test = target[6] > besttarget[6];	break;
							}
						}
						if (Festival.option.cleric) {
							cleric = target[2] === 'Cleric' && target[6] && (!best || besttarget[2] !== 'Cleric');
						}
						//log('cname ' + target[0] + ' cleric ' + cleric + ' test ' + test + ' bh ' + (best ? besttarget[3] : 'none') + ' candidate healt ' + target[3]);
						if ((target[3] && (!best || cleric)) || (target[3] >= 200 && (besttarget[3] < 200 || test))) {
							best = el;
							besttarget = target;
						}
					});
					if (best) {
						this.set(['runtime','last'], besttarget[0]);
						log('Attacking '+besttarget[0]+' with '+besttarget[3]+' health');
						if ($('input[src*="monster_duel_button.gif"]', best).length) {
							Page.click($('input[src*="monster_duel_button.gif"]', best));
						} else {
							log(LOG_INFO, 'But couldn\'t find button, so backing out.');
							Page.to('festival_guild');
						}
					} else {
						this.set(['runtime','last'], null);
					}
				}
			}
		}
	}
	return QUEUE_CONTINUE;
};
}(jQuery.noConflict(true)));