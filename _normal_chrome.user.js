// ==UserScript==
// @name		Rycochet's Castle Age Golem
// @namespace	golem
// @description	Auto player for castle age game
// @license		GNU Lesser General Public License; http://www.gnu.org/licenses/lgpl.html
// @version		31.1
// @include		http://apps.facebook.com/castle_age/*
// @include		http://apps.facebook.com/reqs.php
// @require		http://cloutman.com/jquery-latest.min.js
// @require		http://cloutman.com/jquery-ui-latest.min.js
// ==/UserScript==
// 
// For the source code please check the sourse repository
// - http://code.google.com/p/game-golem/
// 
// For the unshrunk Work In Progress version (which may introduce new bugs)
// - http://game-golem.googlecode.com/svn/trunk/_normal.user.js
/*!
 * jQuery JavaScript Library v1.4.2
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Sat Feb 13 22:33:48 2010 -0500
 */
(function(A,w){function ma(){if(!c.isReady){try{s.documentElement.doScroll("left")}catch(a){setTimeout(ma,1);return}c.ready()}}function Qa(a,b){b.src?c.ajax({url:b.src,async:false,dataType:"script"}):c.globalEval(b.text||b.textContent||b.innerHTML||"");b.parentNode&&b.parentNode.removeChild(b)}function X(a,b,d,f,e,j){var i=a.length;if(typeof b==="object"){for(var o in b)X(a,o,b[o],f,e,d);return a}if(d!==w){f=!j&&f&&c.isFunction(d);for(o=0;o<i;o++)e(a[o],b,f?d.call(a[o],o,e(a[o],b)):d,j);return a}return i?
e(a[0],b):w}function J(){return(new Date).getTime()}function Y(){return false}function Z(){return true}function na(a,b,d){d[0].type=a;return c.event.handle.apply(b,d)}function oa(a){var b,d=[],f=[],e=arguments,j,i,o,k,n,r;i=c.data(this,"events");if(!(a.liveFired===this||!i||!i.live||a.button&&a.type==="click")){a.liveFired=this;var u=i.live.slice(0);for(k=0;k<u.length;k++){i=u[k];i.origType.replace(O,"")===a.type?f.push(i.selector):u.splice(k--,1)}j=c(a.target).closest(f,a.currentTarget);n=0;for(r=
j.length;n<r;n++)for(k=0;k<u.length;k++){i=u[k];if(j[n].selector===i.selector){o=j[n].elem;f=null;if(i.preType==="mouseenter"||i.preType==="mouseleave")f=c(a.relatedTarget).closest(i.selector)[0];if(!f||f!==o)d.push({elem:o,handleObj:i})}}n=0;for(r=d.length;n<r;n++){j=d[n];a.currentTarget=j.elem;a.data=j.handleObj.data;a.handleObj=j.handleObj;if(j.handleObj.origHandler.apply(j.elem,e)===false){b=false;break}}return b}}function pa(a,b){return"live."+(a&&a!=="*"?a+".":"")+b.replace(/\./g,"`").replace(/ /g,
"&")}function qa(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function ra(a,b){var d=0;b.each(function(){if(this.nodeName===(a[d]&&a[d].nodeName)){var f=c.data(a[d++]),e=c.data(this,f);if(f=f&&f.events){delete e.handle;e.events={};for(var j in f)for(var i in f[j])c.event.add(this,j,f[j][i],f[j][i].data)}}})}function sa(a,b,d){var f,e,j;b=b&&b[0]?b[0].ownerDocument||b[0]:s;if(a.length===1&&typeof a[0]==="string"&&a[0].length<512&&b===s&&!ta.test(a[0])&&(c.support.checkClone||!ua.test(a[0]))){e=
true;if(j=c.fragments[a[0]])if(j!==1)f=j}if(!f){f=b.createDocumentFragment();c.clean(a,b,f,d)}if(e)c.fragments[a[0]]=j?f:1;return{fragment:f,cacheable:e}}function K(a,b){var d={};c.each(va.concat.apply([],va.slice(0,b)),function(){d[this]=a});return d}function wa(a){return"scrollTo"in a&&a.document?a:a.nodeType===9?a.defaultView||a.parentWindow:false}var c=function(a,b){return new c.fn.init(a,b)},Ra=A.jQuery,Sa=A.$,s=A.document,T,Ta=/^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,Ua=/^.[^:#\[\.,]*$/,Va=/\S/,
Wa=/^(\s|\u00A0)+|(\s|\u00A0)+$/g,Xa=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,P=navigator.userAgent,xa=false,Q=[],L,$=Object.prototype.toString,aa=Object.prototype.hasOwnProperty,ba=Array.prototype.push,R=Array.prototype.slice,ya=Array.prototype.indexOf;c.fn=c.prototype={init:function(a,b){var d,f;if(!a)return this;if(a.nodeType){this.context=this[0]=a;this.length=1;return this}if(a==="body"&&!b){this.context=s;this[0]=s.body;this.selector="body";this.length=1;return this}if(typeof a==="string")if((d=Ta.exec(a))&&
(d[1]||!b))if(d[1]){f=b?b.ownerDocument||b:s;if(a=Xa.exec(a))if(c.isPlainObject(b)){a=[s.createElement(a[1])];c.fn.attr.call(a,b,true)}else a=[f.createElement(a[1])];else{a=sa([d[1]],[f]);a=(a.cacheable?a.fragment.cloneNode(true):a.fragment).childNodes}return c.merge(this,a)}else{if(b=s.getElementById(d[2])){if(b.id!==d[2])return T.find(a);this.length=1;this[0]=b}this.context=s;this.selector=a;return this}else if(!b&&/^\w+$/.test(a)){this.selector=a;this.context=s;a=s.getElementsByTagName(a);return c.merge(this,
a)}else return!b||b.jquery?(b||T).find(a):c(b).find(a);else if(c.isFunction(a))return T.ready(a);if(a.selector!==w){this.selector=a.selector;this.context=a.context}return c.makeArray(a,this)},selector:"",jquery:"1.4.2",length:0,size:function(){return this.length},toArray:function(){return R.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this.slice(a)[0]:this[a]},pushStack:function(a,b,d){var f=c();c.isArray(a)?ba.apply(f,a):c.merge(f,a);f.prevObject=this;f.context=this.context;if(b===
"find")f.selector=this.selector+(this.selector?" ":"")+d;else if(b)f.selector=this.selector+"."+b+"("+d+")";return f},each:function(a,b){return c.each(this,a,b)},ready:function(a){c.bindReady();if(c.isReady)a.call(s,c);else Q&&Q.push(a);return this},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(R.apply(this,arguments),"slice",R.call(arguments).join(","))},map:function(a){return this.pushStack(c.map(this,
function(b,d){return a.call(b,d,b)}))},end:function(){return this.prevObject||c(null)},push:ba,sort:[].sort,splice:[].splice};c.fn.init.prototype=c.fn;c.extend=c.fn.extend=function(){var a=arguments[0]||{},b=1,d=arguments.length,f=false,e,j,i,o;if(typeof a==="boolean"){f=a;a=arguments[1]||{};b=2}if(typeof a!=="object"&&!c.isFunction(a))a={};if(d===b){a=this;--b}for(;b<d;b++)if((e=arguments[b])!=null)for(j in e){i=a[j];o=e[j];if(a!==o)if(f&&o&&(c.isPlainObject(o)||c.isArray(o))){i=i&&(c.isPlainObject(i)||
c.isArray(i))?i:c.isArray(o)?[]:{};a[j]=c.extend(f,i,o)}else if(o!==w)a[j]=o}return a};c.extend({noConflict:function(a){A.$=Sa;if(a)A.jQuery=Ra;return c},isReady:false,ready:function(){if(!c.isReady){if(!s.body)return setTimeout(c.ready,13);c.isReady=true;if(Q){for(var a,b=0;a=Q[b++];)a.call(s,c);Q=null}c.fn.triggerHandler&&c(s).triggerHandler("ready")}},bindReady:function(){if(!xa){xa=true;if(s.readyState==="complete")return c.ready();if(s.addEventListener){s.addEventListener("DOMContentLoaded",
L,false);A.addEventListener("load",c.ready,false)}else if(s.attachEvent){s.attachEvent("onreadystatechange",L);A.attachEvent("onload",c.ready);var a=false;try{a=A.frameElement==null}catch(b){}s.documentElement.doScroll&&a&&ma()}}},isFunction:function(a){return $.call(a)==="[object Function]"},isArray:function(a){return $.call(a)==="[object Array]"},isPlainObject:function(a){if(!a||$.call(a)!=="[object Object]"||a.nodeType||a.setInterval)return false;if(a.constructor&&!aa.call(a,"constructor")&&!aa.call(a.constructor.prototype,
"isPrototypeOf"))return false;var b;for(b in a);return b===w||aa.call(a,b)},isEmptyObject:function(a){for(var b in a)return false;return true},error:function(a){throw a;},parseJSON:function(a){if(typeof a!=="string"||!a)return null;a=c.trim(a);if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return A.JSON&&A.JSON.parse?A.JSON.parse(a):(new Function("return "+
a))();else c.error("Invalid JSON: "+a)},noop:function(){},globalEval:function(a){if(a&&Va.test(a)){var b=s.getElementsByTagName("head")[0]||s.documentElement,d=s.createElement("script");d.type="text/javascript";if(c.support.scriptEval)d.appendChild(s.createTextNode(a));else d.text=a;b.insertBefore(d,b.firstChild);b.removeChild(d)}},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,b,d){var f,e=0,j=a.length,i=j===w||c.isFunction(a);if(d)if(i)for(f in a){if(b.apply(a[f],
d)===false)break}else for(;e<j;){if(b.apply(a[e++],d)===false)break}else if(i)for(f in a){if(b.call(a[f],f,a[f])===false)break}else for(d=a[0];e<j&&b.call(d,e,d)!==false;d=a[++e]);return a},trim:function(a){return(a||"").replace(Wa,"")},makeArray:function(a,b){b=b||[];if(a!=null)a.length==null||typeof a==="string"||c.isFunction(a)||typeof a!=="function"&&a.setInterval?ba.call(b,a):c.merge(b,a);return b},inArray:function(a,b){if(b.indexOf)return b.indexOf(a);for(var d=0,f=b.length;d<f;d++)if(b[d]===
a)return d;return-1},merge:function(a,b){var d=a.length,f=0;if(typeof b.length==="number")for(var e=b.length;f<e;f++)a[d++]=b[f];else for(;b[f]!==w;)a[d++]=b[f++];a.length=d;return a},grep:function(a,b,d){for(var f=[],e=0,j=a.length;e<j;e++)!d!==!b(a[e],e)&&f.push(a[e]);return f},map:function(a,b,d){for(var f=[],e,j=0,i=a.length;j<i;j++){e=b(a[j],j,d);if(e!=null)f[f.length]=e}return f.concat.apply([],f)},guid:1,proxy:function(a,b,d){if(arguments.length===2)if(typeof b==="string"){d=a;a=d[b];b=w}else if(b&&
!c.isFunction(b)){d=b;b=w}if(!b&&a)b=function(){return a.apply(d||this,arguments)};if(a)b.guid=a.guid=a.guid||b.guid||c.guid++;return b},uaMatch:function(a){a=a.toLowerCase();a=/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version)?[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||!/compatible/.test(a)&&/(mozilla)(?:.*? rv:([\w.]+))?/.exec(a)||[];return{browser:a[1]||"",version:a[2]||"0"}},browser:{}});P=c.uaMatch(P);if(P.browser){c.browser[P.browser]=true;c.browser.version=P.version}if(c.browser.webkit)c.browser.safari=
true;if(ya)c.inArray=function(a,b){return ya.call(b,a)};T=c(s);if(s.addEventListener)L=function(){s.removeEventListener("DOMContentLoaded",L,false);c.ready()};else if(s.attachEvent)L=function(){if(s.readyState==="complete"){s.detachEvent("onreadystatechange",L);c.ready()}};(function(){c.support={};var a=s.documentElement,b=s.createElement("script"),d=s.createElement("div"),f="script"+J();d.style.display="none";d.innerHTML="   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
var e=d.getElementsByTagName("*"),j=d.getElementsByTagName("a")[0];if(!(!e||!e.length||!j)){c.support={leadingWhitespace:d.firstChild.nodeType===3,tbody:!d.getElementsByTagName("tbody").length,htmlSerialize:!!d.getElementsByTagName("link").length,style:/red/.test(j.getAttribute("style")),hrefNormalized:j.getAttribute("href")==="/a",opacity:/^0.55$/.test(j.style.opacity),cssFloat:!!j.style.cssFloat,checkOn:d.getElementsByTagName("input")[0].value==="on",optSelected:s.createElement("select").appendChild(s.createElement("option")).selected,
parentNode:d.removeChild(d.appendChild(s.createElement("div"))).parentNode===null,deleteExpando:true,checkClone:false,scriptEval:false,noCloneEvent:true,boxModel:null};b.type="text/javascript";try{b.appendChild(s.createTextNode("window."+f+"=1;"))}catch(i){}a.insertBefore(b,a.firstChild);if(A[f]){c.support.scriptEval=true;delete A[f]}try{delete b.test}catch(o){c.support.deleteExpando=false}a.removeChild(b);if(d.attachEvent&&d.fireEvent){d.attachEvent("onclick",function k(){c.support.noCloneEvent=
false;d.detachEvent("onclick",k)});d.cloneNode(true).fireEvent("onclick")}d=s.createElement("div");d.innerHTML="<input type='radio' name='radiotest' checked='checked'/>";a=s.createDocumentFragment();a.appendChild(d.firstChild);c.support.checkClone=a.cloneNode(true).cloneNode(true).lastChild.checked;c(function(){var k=s.createElement("div");k.style.width=k.style.paddingLeft="1px";s.body.appendChild(k);c.boxModel=c.support.boxModel=k.offsetWidth===2;s.body.removeChild(k).style.display="none"});a=function(k){var n=
s.createElement("div");k="on"+k;if(n.wrappedJSObject)n=n.wrappedJSObject;var r=k in n;if(!r){n.setAttribute(k,"return;");r=typeof n[k]==="function"}return r};c.support.submitBubbles=a("submit");c.support.changeBubbles=a("change");a=b=d=e=j=null}})();c.props={"for":"htmlFor","class":"className",readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",colspan:"colSpan",tabindex:"tabIndex",usemap:"useMap",frameborder:"frameBorder"};var G="jQuery"+J(),Ya=0,za={};c.extend({cache:{},expando:G,noData:{embed:true,object:true,
applet:true},data:function(a,b,d){if(!(a.nodeName&&c.noData[a.nodeName.toLowerCase()])){a=a==A?za:a;var f=a[G],e=c.cache;if(!f&&typeof b==="string"&&d===w)return null;f||(f=++Ya);if(typeof b==="object"){a[G]=f;e[f]=c.extend(true,{},b)}else if(!e[f]){a[G]=f;e[f]={}}a=e[f];if(d!==w)a[b]=d;return typeof b==="string"?a[b]:a}},removeData:function(a,b){if(!(a.nodeName&&c.noData[a.nodeName.toLowerCase()])){a=a==A?za:a;var d=a[G],f=c.cache,e=f[d];if(b){if(e){delete e[b];c.isEmptyObject(e)&&c.removeData(a)}}else{if(c.support.deleteExpando)delete a[c.expando];
else a.removeAttribute&&a.removeAttribute(c.expando);delete f[d]}}}});c.fn.extend({data:function(a,b){if(typeof a==="undefined"&&this.length)return c.data(this[0]);else if(typeof a==="object")return this.each(function(){c.data(this,a)});var d=a.split(".");d[1]=d[1]?"."+d[1]:"";if(b===w){var f=this.triggerHandler("getData"+d[1]+"!",[d[0]]);if(f===w&&this.length)f=c.data(this[0],a);return f===w&&d[1]?this.data(d[0]):f}else return this.trigger("setData"+d[1]+"!",[d[0],b]).each(function(){c.data(this,
a,b)})},removeData:function(a){return this.each(function(){c.removeData(this,a)})}});c.extend({queue:function(a,b,d){if(a){b=(b||"fx")+"queue";var f=c.data(a,b);if(!d)return f||[];if(!f||c.isArray(d))f=c.data(a,b,c.makeArray(d));else f.push(d);return f}},dequeue:function(a,b){b=b||"fx";var d=c.queue(a,b),f=d.shift();if(f==="inprogress")f=d.shift();if(f){b==="fx"&&d.unshift("inprogress");f.call(a,function(){c.dequeue(a,b)})}}});c.fn.extend({queue:function(a,b){if(typeof a!=="string"){b=a;a="fx"}if(b===
w)return c.queue(this[0],a);return this.each(function(){var d=c.queue(this,a,b);a==="fx"&&d[0]!=="inprogress"&&c.dequeue(this,a)})},dequeue:function(a){return this.each(function(){c.dequeue(this,a)})},delay:function(a,b){a=c.fx?c.fx.speeds[a]||a:a;b=b||"fx";return this.queue(b,function(){var d=this;setTimeout(function(){c.dequeue(d,b)},a)})},clearQueue:function(a){return this.queue(a||"fx",[])}});var Aa=/[\n\t]/g,ca=/\s+/,Za=/\r/g,$a=/href|src|style/,ab=/(button|input)/i,bb=/(button|input|object|select|textarea)/i,
cb=/^(a|area)$/i,Ba=/radio|checkbox/;c.fn.extend({attr:function(a,b){return X(this,a,b,true,c.attr)},removeAttr:function(a){return this.each(function(){c.attr(this,a,"");this.nodeType===1&&this.removeAttribute(a)})},addClass:function(a){if(c.isFunction(a))return this.each(function(n){var r=c(this);r.addClass(a.call(this,n,r.attr("class")))});if(a&&typeof a==="string")for(var b=(a||"").split(ca),d=0,f=this.length;d<f;d++){var e=this[d];if(e.nodeType===1)if(e.className){for(var j=" "+e.className+" ",
i=e.className,o=0,k=b.length;o<k;o++)if(j.indexOf(" "+b[o]+" ")<0)i+=" "+b[o];e.className=c.trim(i)}else e.className=a}return this},removeClass:function(a){if(c.isFunction(a))return this.each(function(k){var n=c(this);n.removeClass(a.call(this,k,n.attr("class")))});if(a&&typeof a==="string"||a===w)for(var b=(a||"").split(ca),d=0,f=this.length;d<f;d++){var e=this[d];if(e.nodeType===1&&e.className)if(a){for(var j=(" "+e.className+" ").replace(Aa," "),i=0,o=b.length;i<o;i++)j=j.replace(" "+b[i]+" ",
" ");e.className=c.trim(j)}else e.className=""}return this},toggleClass:function(a,b){var d=typeof a,f=typeof b==="boolean";if(c.isFunction(a))return this.each(function(e){var j=c(this);j.toggleClass(a.call(this,e,j.attr("class"),b),b)});return this.each(function(){if(d==="string")for(var e,j=0,i=c(this),o=b,k=a.split(ca);e=k[j++];){o=f?o:!i.hasClass(e);i[o?"addClass":"removeClass"](e)}else if(d==="undefined"||d==="boolean"){this.className&&c.data(this,"__className__",this.className);this.className=
this.className||a===false?"":c.data(this,"__className__")||""}})},hasClass:function(a){a=" "+a+" ";for(var b=0,d=this.length;b<d;b++)if((" "+this[b].className+" ").replace(Aa," ").indexOf(a)>-1)return true;return false},val:function(a){if(a===w){var b=this[0];if(b){if(c.nodeName(b,"option"))return(b.attributes.value||{}).specified?b.value:b.text;if(c.nodeName(b,"select")){var d=b.selectedIndex,f=[],e=b.options;b=b.type==="select-one";if(d<0)return null;var j=b?d:0;for(d=b?d+1:e.length;j<d;j++){var i=
e[j];if(i.selected){a=c(i).val();if(b)return a;f.push(a)}}return f}if(Ba.test(b.type)&&!c.support.checkOn)return b.getAttribute("value")===null?"on":b.value;return(b.value||"").replace(Za,"")}return w}var o=c.isFunction(a);return this.each(function(k){var n=c(this),r=a;if(this.nodeType===1){if(o)r=a.call(this,k,n.val());if(typeof r==="number")r+="";if(c.isArray(r)&&Ba.test(this.type))this.checked=c.inArray(n.val(),r)>=0;else if(c.nodeName(this,"select")){var u=c.makeArray(r);c("option",this).each(function(){this.selected=
c.inArray(c(this).val(),u)>=0});if(!u.length)this.selectedIndex=-1}else this.value=r}})}});c.extend({attrFn:{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true},attr:function(a,b,d,f){if(!a||a.nodeType===3||a.nodeType===8)return w;if(f&&b in c.attrFn)return c(a)[b](d);f=a.nodeType!==1||!c.isXMLDoc(a);var e=d!==w;b=f&&c.props[b]||b;if(a.nodeType===1){var j=$a.test(b);if(b in a&&f&&!j){if(e){b==="type"&&ab.test(a.nodeName)&&a.parentNode&&c.error("type property can't be changed");
a[b]=d}if(c.nodeName(a,"form")&&a.getAttributeNode(b))return a.getAttributeNode(b).nodeValue;if(b==="tabIndex")return(b=a.getAttributeNode("tabIndex"))&&b.specified?b.value:bb.test(a.nodeName)||cb.test(a.nodeName)&&a.href?0:w;return a[b]}if(!c.support.style&&f&&b==="style"){if(e)a.style.cssText=""+d;return a.style.cssText}e&&a.setAttribute(b,""+d);a=!c.support.hrefNormalized&&f&&j?a.getAttribute(b,2):a.getAttribute(b);return a===null?w:a}return c.style(a,b,d)}});var O=/\.(.*)$/,db=function(a){return a.replace(/[^\w\s\.\|`]/g,
function(b){return"\\"+b})};c.event={add:function(a,b,d,f){if(!(a.nodeType===3||a.nodeType===8)){if(a.setInterval&&a!==A&&!a.frameElement)a=A;var e,j;if(d.handler){e=d;d=e.handler}if(!d.guid)d.guid=c.guid++;if(j=c.data(a)){var i=j.events=j.events||{},o=j.handle;if(!o)j.handle=o=function(){return typeof c!=="undefined"&&!c.event.triggered?c.event.handle.apply(o.elem,arguments):w};o.elem=a;b=b.split(" ");for(var k,n=0,r;k=b[n++];){j=e?c.extend({},e):{handler:d,data:f};if(k.indexOf(".")>-1){r=k.split(".");
k=r.shift();j.namespace=r.slice(0).sort().join(".")}else{r=[];j.namespace=""}j.type=k;j.guid=d.guid;var u=i[k],z=c.event.special[k]||{};if(!u){u=i[k]=[];if(!z.setup||z.setup.call(a,f,r,o)===false)if(a.addEventListener)a.addEventListener(k,o,false);else a.attachEvent&&a.attachEvent("on"+k,o)}if(z.add){z.add.call(a,j);if(!j.handler.guid)j.handler.guid=d.guid}u.push(j);c.event.global[k]=true}a=null}}},global:{},remove:function(a,b,d,f){if(!(a.nodeType===3||a.nodeType===8)){var e,j=0,i,o,k,n,r,u,z=c.data(a),
C=z&&z.events;if(z&&C){if(b&&b.type){d=b.handler;b=b.type}if(!b||typeof b==="string"&&b.charAt(0)==="."){b=b||"";for(e in C)c.event.remove(a,e+b)}else{for(b=b.split(" ");e=b[j++];){n=e;i=e.indexOf(".")<0;o=[];if(!i){o=e.split(".");e=o.shift();k=new RegExp("(^|\\.)"+c.map(o.slice(0).sort(),db).join("\\.(?:.*\\.)?")+"(\\.|$)")}if(r=C[e])if(d){n=c.event.special[e]||{};for(B=f||0;B<r.length;B++){u=r[B];if(d.guid===u.guid){if(i||k.test(u.namespace)){f==null&&r.splice(B--,1);n.remove&&n.remove.call(a,u)}if(f!=
null)break}}if(r.length===0||f!=null&&r.length===1){if(!n.teardown||n.teardown.call(a,o)===false)Ca(a,e,z.handle);delete C[e]}}else for(var B=0;B<r.length;B++){u=r[B];if(i||k.test(u.namespace)){c.event.remove(a,n,u.handler,B);r.splice(B--,1)}}}if(c.isEmptyObject(C)){if(b=z.handle)b.elem=null;delete z.events;delete z.handle;c.isEmptyObject(z)&&c.removeData(a)}}}}},trigger:function(a,b,d,f){var e=a.type||a;if(!f){a=typeof a==="object"?a[G]?a:c.extend(c.Event(e),a):c.Event(e);if(e.indexOf("!")>=0){a.type=
e=e.slice(0,-1);a.exclusive=true}if(!d){a.stopPropagation();c.event.global[e]&&c.each(c.cache,function(){this.events&&this.events[e]&&c.event.trigger(a,b,this.handle.elem)})}if(!d||d.nodeType===3||d.nodeType===8)return w;a.result=w;a.target=d;b=c.makeArray(b);b.unshift(a)}a.currentTarget=d;(f=c.data(d,"handle"))&&f.apply(d,b);f=d.parentNode||d.ownerDocument;try{if(!(d&&d.nodeName&&c.noData[d.nodeName.toLowerCase()]))if(d["on"+e]&&d["on"+e].apply(d,b)===false)a.result=false}catch(j){}if(!a.isPropagationStopped()&&
f)c.event.trigger(a,b,f,true);else if(!a.isDefaultPrevented()){f=a.target;var i,o=c.nodeName(f,"a")&&e==="click",k=c.event.special[e]||{};if((!k._default||k._default.call(d,a)===false)&&!o&&!(f&&f.nodeName&&c.noData[f.nodeName.toLowerCase()])){try{if(f[e]){if(i=f["on"+e])f["on"+e]=null;c.event.triggered=true;f[e]()}}catch(n){}if(i)f["on"+e]=i;c.event.triggered=false}}},handle:function(a){var b,d,f,e;a=arguments[0]=c.event.fix(a||A.event);a.currentTarget=this;b=a.type.indexOf(".")<0&&!a.exclusive;
if(!b){d=a.type.split(".");a.type=d.shift();f=new RegExp("(^|\\.)"+d.slice(0).sort().join("\\.(?:.*\\.)?")+"(\\.|$)")}e=c.data(this,"events");d=e[a.type];if(e&&d){d=d.slice(0);e=0;for(var j=d.length;e<j;e++){var i=d[e];if(b||f.test(i.namespace)){a.handler=i.handler;a.data=i.data;a.handleObj=i;i=i.handler.apply(this,arguments);if(i!==w){a.result=i;if(i===false){a.preventDefault();a.stopPropagation()}}if(a.isImmediatePropagationStopped())break}}}return a.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),
fix:function(a){if(a[G])return a;var b=a;a=c.Event(b);for(var d=this.props.length,f;d;){f=this.props[--d];a[f]=b[f]}if(!a.target)a.target=a.srcElement||s;if(a.target.nodeType===3)a.target=a.target.parentNode;if(!a.relatedTarget&&a.fromElement)a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement;if(a.pageX==null&&a.clientX!=null){b=s.documentElement;d=s.body;a.pageX=a.clientX+(b&&b.scrollLeft||d&&d.scrollLeft||0)-(b&&b.clientLeft||d&&d.clientLeft||0);a.pageY=a.clientY+(b&&b.scrollTop||
d&&d.scrollTop||0)-(b&&b.clientTop||d&&d.clientTop||0)}if(!a.which&&(a.charCode||a.charCode===0?a.charCode:a.keyCode))a.which=a.charCode||a.keyCode;if(!a.metaKey&&a.ctrlKey)a.metaKey=a.ctrlKey;if(!a.which&&a.button!==w)a.which=a.button&1?1:a.button&2?3:a.button&4?2:0;return a},guid:1E8,proxy:c.proxy,special:{ready:{setup:c.bindReady,teardown:c.noop},live:{add:function(a){c.event.add(this,a.origType,c.extend({},a,{handler:oa}))},remove:function(a){var b=true,d=a.origType.replace(O,"");c.each(c.data(this,
"events").live||[],function(){if(d===this.origType.replace(O,""))return b=false});b&&c.event.remove(this,a.origType,oa)}},beforeunload:{setup:function(a,b,d){if(this.setInterval)this.onbeforeunload=d;return false},teardown:function(a,b){if(this.onbeforeunload===b)this.onbeforeunload=null}}}};var Ca=s.removeEventListener?function(a,b,d){a.removeEventListener(b,d,false)}:function(a,b,d){a.detachEvent("on"+b,d)};c.Event=function(a){if(!this.preventDefault)return new c.Event(a);if(a&&a.type){this.originalEvent=
a;this.type=a.type}else this.type=a;this.timeStamp=J();this[G]=true};c.Event.prototype={preventDefault:function(){this.isDefaultPrevented=Z;var a=this.originalEvent;if(a){a.preventDefault&&a.preventDefault();a.returnValue=false}},stopPropagation:function(){this.isPropagationStopped=Z;var a=this.originalEvent;if(a){a.stopPropagation&&a.stopPropagation();a.cancelBubble=true}},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=Z;this.stopPropagation()},isDefaultPrevented:Y,isPropagationStopped:Y,
isImmediatePropagationStopped:Y};var Da=function(a){var b=a.relatedTarget;try{for(;b&&b!==this;)b=b.parentNode;if(b!==this){a.type=a.data;c.event.handle.apply(this,arguments)}}catch(d){}},Ea=function(a){a.type=a.data;c.event.handle.apply(this,arguments)};c.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){c.event.special[a]={setup:function(d){c.event.add(this,b,d&&d.selector?Ea:Da,a)},teardown:function(d){c.event.remove(this,b,d&&d.selector?Ea:Da)}}});if(!c.support.submitBubbles)c.event.special.submit=
{setup:function(){if(this.nodeName.toLowerCase()!=="form"){c.event.add(this,"click.specialSubmit",function(a){var b=a.target,d=b.type;if((d==="submit"||d==="image")&&c(b).closest("form").length)return na("submit",this,arguments)});c.event.add(this,"keypress.specialSubmit",function(a){var b=a.target,d=b.type;if((d==="text"||d==="password")&&c(b).closest("form").length&&a.keyCode===13)return na("submit",this,arguments)})}else return false},teardown:function(){c.event.remove(this,".specialSubmit")}};
if(!c.support.changeBubbles){var da=/textarea|input|select/i,ea,Fa=function(a){var b=a.type,d=a.value;if(b==="radio"||b==="checkbox")d=a.checked;else if(b==="select-multiple")d=a.selectedIndex>-1?c.map(a.options,function(f){return f.selected}).join("-"):"";else if(a.nodeName.toLowerCase()==="select")d=a.selectedIndex;return d},fa=function(a,b){var d=a.target,f,e;if(!(!da.test(d.nodeName)||d.readOnly)){f=c.data(d,"_change_data");e=Fa(d);if(a.type!=="focusout"||d.type!=="radio")c.data(d,"_change_data",
e);if(!(f===w||e===f))if(f!=null||e){a.type="change";return c.event.trigger(a,b,d)}}};c.event.special.change={filters:{focusout:fa,click:function(a){var b=a.target,d=b.type;if(d==="radio"||d==="checkbox"||b.nodeName.toLowerCase()==="select")return fa.call(this,a)},keydown:function(a){var b=a.target,d=b.type;if(a.keyCode===13&&b.nodeName.toLowerCase()!=="textarea"||a.keyCode===32&&(d==="checkbox"||d==="radio")||d==="select-multiple")return fa.call(this,a)},beforeactivate:function(a){a=a.target;c.data(a,
"_change_data",Fa(a))}},setup:function(){if(this.type==="file")return false;for(var a in ea)c.event.add(this,a+".specialChange",ea[a]);return da.test(this.nodeName)},teardown:function(){c.event.remove(this,".specialChange");return da.test(this.nodeName)}};ea=c.event.special.change.filters}s.addEventListener&&c.each({focus:"focusin",blur:"focusout"},function(a,b){function d(f){f=c.event.fix(f);f.type=b;return c.event.handle.call(this,f)}c.event.special[b]={setup:function(){this.addEventListener(a,
d,true)},teardown:function(){this.removeEventListener(a,d,true)}}});c.each(["bind","one"],function(a,b){c.fn[b]=function(d,f,e){if(typeof d==="object"){for(var j in d)this[b](j,f,d[j],e);return this}if(c.isFunction(f)){e=f;f=w}var i=b==="one"?c.proxy(e,function(k){c(this).unbind(k,i);return e.apply(this,arguments)}):e;if(d==="unload"&&b!=="one")this.one(d,f,e);else{j=0;for(var o=this.length;j<o;j++)c.event.add(this[j],d,i,f)}return this}});c.fn.extend({unbind:function(a,b){if(typeof a==="object"&&
!a.preventDefault)for(var d in a)this.unbind(d,a[d]);else{d=0;for(var f=this.length;d<f;d++)c.event.remove(this[d],a,b)}return this},delegate:function(a,b,d,f){return this.live(b,d,f,a)},undelegate:function(a,b,d){return arguments.length===0?this.unbind("live"):this.die(b,null,d,a)},trigger:function(a,b){return this.each(function(){c.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0]){a=c.Event(a);a.preventDefault();a.stopPropagation();c.event.trigger(a,b,this[0]);return a.result}},
toggle:function(a){for(var b=arguments,d=1;d<b.length;)c.proxy(a,b[d++]);return this.click(c.proxy(a,function(f){var e=(c.data(this,"lastToggle"+a.guid)||0)%d;c.data(this,"lastToggle"+a.guid,e+1);f.preventDefault();return b[e].apply(this,arguments)||false}))},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}});var Ga={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};c.each(["live","die"],function(a,b){c.fn[b]=function(d,f,e,j){var i,o=0,k,n,r=j||this.selector,
u=j?this:c(this.context);if(c.isFunction(f)){e=f;f=w}for(d=(d||"").split(" ");(i=d[o++])!=null;){j=O.exec(i);k="";if(j){k=j[0];i=i.replace(O,"")}if(i==="hover")d.push("mouseenter"+k,"mouseleave"+k);else{n=i;if(i==="focus"||i==="blur"){d.push(Ga[i]+k);i+=k}else i=(Ga[i]||i)+k;b==="live"?u.each(function(){c.event.add(this,pa(i,r),{data:f,selector:r,handler:e,origType:i,origHandler:e,preType:n})}):u.unbind(pa(i,r),e)}}return this}});c.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "),
function(a,b){c.fn[b]=function(d){return d?this.bind(b,d):this.trigger(b)};if(c.attrFn)c.attrFn[b]=true});A.attachEvent&&!A.addEventListener&&A.attachEvent("onunload",function(){for(var a in c.cache)if(c.cache[a].handle)try{c.event.remove(c.cache[a].handle.elem)}catch(b){}});(function(){function a(g){for(var h="",l,m=0;g[m];m++){l=g[m];if(l.nodeType===3||l.nodeType===4)h+=l.nodeValue;else if(l.nodeType!==8)h+=a(l.childNodes)}return h}function b(g,h,l,m,q,p){q=0;for(var v=m.length;q<v;q++){var t=m[q];
if(t){t=t[g];for(var y=false;t;){if(t.sizcache===l){y=m[t.sizset];break}if(t.nodeType===1&&!p){t.sizcache=l;t.sizset=q}if(t.nodeName.toLowerCase()===h){y=t;break}t=t[g]}m[q]=y}}}function d(g,h,l,m,q,p){q=0;for(var v=m.length;q<v;q++){var t=m[q];if(t){t=t[g];for(var y=false;t;){if(t.sizcache===l){y=m[t.sizset];break}if(t.nodeType===1){if(!p){t.sizcache=l;t.sizset=q}if(typeof h!=="string"){if(t===h){y=true;break}}else if(k.filter(h,[t]).length>0){y=t;break}}t=t[g]}m[q]=y}}}var f=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
e=0,j=Object.prototype.toString,i=false,o=true;[0,0].sort(function(){o=false;return 0});var k=function(g,h,l,m){l=l||[];var q=h=h||s;if(h.nodeType!==1&&h.nodeType!==9)return[];if(!g||typeof g!=="string")return l;for(var p=[],v,t,y,S,H=true,M=x(h),I=g;(f.exec(""),v=f.exec(I))!==null;){I=v[3];p.push(v[1]);if(v[2]){S=v[3];break}}if(p.length>1&&r.exec(g))if(p.length===2&&n.relative[p[0]])t=ga(p[0]+p[1],h);else for(t=n.relative[p[0]]?[h]:k(p.shift(),h);p.length;){g=p.shift();if(n.relative[g])g+=p.shift();
t=ga(g,t)}else{if(!m&&p.length>1&&h.nodeType===9&&!M&&n.match.ID.test(p[0])&&!n.match.ID.test(p[p.length-1])){v=k.find(p.shift(),h,M);h=v.expr?k.filter(v.expr,v.set)[0]:v.set[0]}if(h){v=m?{expr:p.pop(),set:z(m)}:k.find(p.pop(),p.length===1&&(p[0]==="~"||p[0]==="+")&&h.parentNode?h.parentNode:h,M);t=v.expr?k.filter(v.expr,v.set):v.set;if(p.length>0)y=z(t);else H=false;for(;p.length;){var D=p.pop();v=D;if(n.relative[D])v=p.pop();else D="";if(v==null)v=h;n.relative[D](y,v,M)}}else y=[]}y||(y=t);y||k.error(D||
g);if(j.call(y)==="[object Array]")if(H)if(h&&h.nodeType===1)for(g=0;y[g]!=null;g++){if(y[g]&&(y[g]===true||y[g].nodeType===1&&E(h,y[g])))l.push(t[g])}else for(g=0;y[g]!=null;g++)y[g]&&y[g].nodeType===1&&l.push(t[g]);else l.push.apply(l,y);else z(y,l);if(S){k(S,q,l,m);k.uniqueSort(l)}return l};k.uniqueSort=function(g){if(B){i=o;g.sort(B);if(i)for(var h=1;h<g.length;h++)g[h]===g[h-1]&&g.splice(h--,1)}return g};k.matches=function(g,h){return k(g,null,null,h)};k.find=function(g,h,l){var m,q;if(!g)return[];
for(var p=0,v=n.order.length;p<v;p++){var t=n.order[p];if(q=n.leftMatch[t].exec(g)){var y=q[1];q.splice(1,1);if(y.substr(y.length-1)!=="\\"){q[1]=(q[1]||"").replace(/\\/g,"");m=n.find[t](q,h,l);if(m!=null){g=g.replace(n.match[t],"");break}}}}m||(m=h.getElementsByTagName("*"));return{set:m,expr:g}};k.filter=function(g,h,l,m){for(var q=g,p=[],v=h,t,y,S=h&&h[0]&&x(h[0]);g&&h.length;){for(var H in n.filter)if((t=n.leftMatch[H].exec(g))!=null&&t[2]){var M=n.filter[H],I,D;D=t[1];y=false;t.splice(1,1);if(D.substr(D.length-
1)!=="\\"){if(v===p)p=[];if(n.preFilter[H])if(t=n.preFilter[H](t,v,l,p,m,S)){if(t===true)continue}else y=I=true;if(t)for(var U=0;(D=v[U])!=null;U++)if(D){I=M(D,t,U,v);var Ha=m^!!I;if(l&&I!=null)if(Ha)y=true;else v[U]=false;else if(Ha){p.push(D);y=true}}if(I!==w){l||(v=p);g=g.replace(n.match[H],"");if(!y)return[];break}}}if(g===q)if(y==null)k.error(g);else break;q=g}return v};k.error=function(g){throw"Syntax error, unrecognized expression: "+g;};var n=k.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
CLASS:/\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(g){return g.getAttribute("href")}},
relative:{"+":function(g,h){var l=typeof h==="string",m=l&&!/\W/.test(h);l=l&&!m;if(m)h=h.toLowerCase();m=0;for(var q=g.length,p;m<q;m++)if(p=g[m]){for(;(p=p.previousSibling)&&p.nodeType!==1;);g[m]=l||p&&p.nodeName.toLowerCase()===h?p||false:p===h}l&&k.filter(h,g,true)},">":function(g,h){var l=typeof h==="string";if(l&&!/\W/.test(h)){h=h.toLowerCase();for(var m=0,q=g.length;m<q;m++){var p=g[m];if(p){l=p.parentNode;g[m]=l.nodeName.toLowerCase()===h?l:false}}}else{m=0;for(q=g.length;m<q;m++)if(p=g[m])g[m]=
l?p.parentNode:p.parentNode===h;l&&k.filter(h,g,true)}},"":function(g,h,l){var m=e++,q=d;if(typeof h==="string"&&!/\W/.test(h)){var p=h=h.toLowerCase();q=b}q("parentNode",h,m,g,p,l)},"~":function(g,h,l){var m=e++,q=d;if(typeof h==="string"&&!/\W/.test(h)){var p=h=h.toLowerCase();q=b}q("previousSibling",h,m,g,p,l)}},find:{ID:function(g,h,l){if(typeof h.getElementById!=="undefined"&&!l)return(g=h.getElementById(g[1]))?[g]:[]},NAME:function(g,h){if(typeof h.getElementsByName!=="undefined"){var l=[];
h=h.getElementsByName(g[1]);for(var m=0,q=h.length;m<q;m++)h[m].getAttribute("name")===g[1]&&l.push(h[m]);return l.length===0?null:l}},TAG:function(g,h){return h.getElementsByTagName(g[1])}},preFilter:{CLASS:function(g,h,l,m,q,p){g=" "+g[1].replace(/\\/g,"")+" ";if(p)return g;p=0;for(var v;(v=h[p])!=null;p++)if(v)if(q^(v.className&&(" "+v.className+" ").replace(/[\t\n]/g," ").indexOf(g)>=0))l||m.push(v);else if(l)h[p]=false;return false},ID:function(g){return g[1].replace(/\\/g,"")},TAG:function(g){return g[1].toLowerCase()},
CHILD:function(g){if(g[1]==="nth"){var h=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(g[2]==="even"&&"2n"||g[2]==="odd"&&"2n+1"||!/\D/.test(g[2])&&"0n+"+g[2]||g[2]);g[2]=h[1]+(h[2]||1)-0;g[3]=h[3]-0}g[0]=e++;return g},ATTR:function(g,h,l,m,q,p){h=g[1].replace(/\\/g,"");if(!p&&n.attrMap[h])g[1]=n.attrMap[h];if(g[2]==="~=")g[4]=" "+g[4]+" ";return g},PSEUDO:function(g,h,l,m,q){if(g[1]==="not")if((f.exec(g[3])||"").length>1||/^\w/.test(g[3]))g[3]=k(g[3],null,null,h);else{g=k.filter(g[3],h,l,true^q);l||m.push.apply(m,
g);return false}else if(n.match.POS.test(g[0])||n.match.CHILD.test(g[0]))return true;return g},POS:function(g){g.unshift(true);return g}},filters:{enabled:function(g){return g.disabled===false&&g.type!=="hidden"},disabled:function(g){return g.disabled===true},checked:function(g){return g.checked===true},selected:function(g){return g.selected===true},parent:function(g){return!!g.firstChild},empty:function(g){return!g.firstChild},has:function(g,h,l){return!!k(l[3],g).length},header:function(g){return/h\d/i.test(g.nodeName)},
text:function(g){return"text"===g.type},radio:function(g){return"radio"===g.type},checkbox:function(g){return"checkbox"===g.type},file:function(g){return"file"===g.type},password:function(g){return"password"===g.type},submit:function(g){return"submit"===g.type},image:function(g){return"image"===g.type},reset:function(g){return"reset"===g.type},button:function(g){return"button"===g.type||g.nodeName.toLowerCase()==="button"},input:function(g){return/input|select|textarea|button/i.test(g.nodeName)}},
setFilters:{first:function(g,h){return h===0},last:function(g,h,l,m){return h===m.length-1},even:function(g,h){return h%2===0},odd:function(g,h){return h%2===1},lt:function(g,h,l){return h<l[3]-0},gt:function(g,h,l){return h>l[3]-0},nth:function(g,h,l){return l[3]-0===h},eq:function(g,h,l){return l[3]-0===h}},filter:{PSEUDO:function(g,h,l,m){var q=h[1],p=n.filters[q];if(p)return p(g,l,h,m);else if(q==="contains")return(g.textContent||g.innerText||a([g])||"").indexOf(h[3])>=0;else if(q==="not"){h=
h[3];l=0;for(m=h.length;l<m;l++)if(h[l]===g)return false;return true}else k.error("Syntax error, unrecognized expression: "+q)},CHILD:function(g,h){var l=h[1],m=g;switch(l){case "only":case "first":for(;m=m.previousSibling;)if(m.nodeType===1)return false;if(l==="first")return true;m=g;case "last":for(;m=m.nextSibling;)if(m.nodeType===1)return false;return true;case "nth":l=h[2];var q=h[3];if(l===1&&q===0)return true;h=h[0];var p=g.parentNode;if(p&&(p.sizcache!==h||!g.nodeIndex)){var v=0;for(m=p.firstChild;m;m=
m.nextSibling)if(m.nodeType===1)m.nodeIndex=++v;p.sizcache=h}g=g.nodeIndex-q;return l===0?g===0:g%l===0&&g/l>=0}},ID:function(g,h){return g.nodeType===1&&g.getAttribute("id")===h},TAG:function(g,h){return h==="*"&&g.nodeType===1||g.nodeName.toLowerCase()===h},CLASS:function(g,h){return(" "+(g.className||g.getAttribute("class"))+" ").indexOf(h)>-1},ATTR:function(g,h){var l=h[1];g=n.attrHandle[l]?n.attrHandle[l](g):g[l]!=null?g[l]:g.getAttribute(l);l=g+"";var m=h[2];h=h[4];return g==null?m==="!=":m===
"="?l===h:m==="*="?l.indexOf(h)>=0:m==="~="?(" "+l+" ").indexOf(h)>=0:!h?l&&g!==false:m==="!="?l!==h:m==="^="?l.indexOf(h)===0:m==="$="?l.substr(l.length-h.length)===h:m==="|="?l===h||l.substr(0,h.length+1)===h+"-":false},POS:function(g,h,l,m){var q=n.setFilters[h[2]];if(q)return q(g,l,h,m)}}},r=n.match.POS;for(var u in n.match){n.match[u]=new RegExp(n.match[u].source+/(?![^\[]*\])(?![^\(]*\))/.source);n.leftMatch[u]=new RegExp(/(^(?:.|\r|\n)*?)/.source+n.match[u].source.replace(/\\(\d+)/g,function(g,
h){return"\\"+(h-0+1)}))}var z=function(g,h){g=Array.prototype.slice.call(g,0);if(h){h.push.apply(h,g);return h}return g};try{Array.prototype.slice.call(s.documentElement.childNodes,0)}catch(C){z=function(g,h){h=h||[];if(j.call(g)==="[object Array]")Array.prototype.push.apply(h,g);else if(typeof g.length==="number")for(var l=0,m=g.length;l<m;l++)h.push(g[l]);else for(l=0;g[l];l++)h.push(g[l]);return h}}var B;if(s.documentElement.compareDocumentPosition)B=function(g,h){if(!g.compareDocumentPosition||
!h.compareDocumentPosition){if(g==h)i=true;return g.compareDocumentPosition?-1:1}g=g.compareDocumentPosition(h)&4?-1:g===h?0:1;if(g===0)i=true;return g};else if("sourceIndex"in s.documentElement)B=function(g,h){if(!g.sourceIndex||!h.sourceIndex){if(g==h)i=true;return g.sourceIndex?-1:1}g=g.sourceIndex-h.sourceIndex;if(g===0)i=true;return g};else if(s.createRange)B=function(g,h){if(!g.ownerDocument||!h.ownerDocument){if(g==h)i=true;return g.ownerDocument?-1:1}var l=g.ownerDocument.createRange(),m=
h.ownerDocument.createRange();l.setStart(g,0);l.setEnd(g,0);m.setStart(h,0);m.setEnd(h,0);g=l.compareBoundaryPoints(Range.START_TO_END,m);if(g===0)i=true;return g};(function(){var g=s.createElement("div"),h="script"+(new Date).getTime();g.innerHTML="<a name='"+h+"'/>";var l=s.documentElement;l.insertBefore(g,l.firstChild);if(s.getElementById(h)){n.find.ID=function(m,q,p){if(typeof q.getElementById!=="undefined"&&!p)return(q=q.getElementById(m[1]))?q.id===m[1]||typeof q.getAttributeNode!=="undefined"&&
q.getAttributeNode("id").nodeValue===m[1]?[q]:w:[]};n.filter.ID=function(m,q){var p=typeof m.getAttributeNode!=="undefined"&&m.getAttributeNode("id");return m.nodeType===1&&p&&p.nodeValue===q}}l.removeChild(g);l=g=null})();(function(){var g=s.createElement("div");g.appendChild(s.createComment(""));if(g.getElementsByTagName("*").length>0)n.find.TAG=function(h,l){l=l.getElementsByTagName(h[1]);if(h[1]==="*"){h=[];for(var m=0;l[m];m++)l[m].nodeType===1&&h.push(l[m]);l=h}return l};g.innerHTML="<a href='#'></a>";
if(g.firstChild&&typeof g.firstChild.getAttribute!=="undefined"&&g.firstChild.getAttribute("href")!=="#")n.attrHandle.href=function(h){return h.getAttribute("href",2)};g=null})();s.querySelectorAll&&function(){var g=k,h=s.createElement("div");h.innerHTML="<p class='TEST'></p>";if(!(h.querySelectorAll&&h.querySelectorAll(".TEST").length===0)){k=function(m,q,p,v){q=q||s;if(!v&&q.nodeType===9&&!x(q))try{return z(q.querySelectorAll(m),p)}catch(t){}return g(m,q,p,v)};for(var l in g)k[l]=g[l];h=null}}();
(function(){var g=s.createElement("div");g.innerHTML="<div class='test e'></div><div class='test'></div>";if(!(!g.getElementsByClassName||g.getElementsByClassName("e").length===0)){g.lastChild.className="e";if(g.getElementsByClassName("e").length!==1){n.order.splice(1,0,"CLASS");n.find.CLASS=function(h,l,m){if(typeof l.getElementsByClassName!=="undefined"&&!m)return l.getElementsByClassName(h[1])};g=null}}})();var E=s.compareDocumentPosition?function(g,h){return!!(g.compareDocumentPosition(h)&16)}:
function(g,h){return g!==h&&(g.contains?g.contains(h):true)},x=function(g){return(g=(g?g.ownerDocument||g:0).documentElement)?g.nodeName!=="HTML":false},ga=function(g,h){var l=[],m="",q;for(h=h.nodeType?[h]:h;q=n.match.PSEUDO.exec(g);){m+=q[0];g=g.replace(n.match.PSEUDO,"")}g=n.relative[g]?g+"*":g;q=0;for(var p=h.length;q<p;q++)k(g,h[q],l);return k.filter(m,l)};c.find=k;c.expr=k.selectors;c.expr[":"]=c.expr.filters;c.unique=k.uniqueSort;c.text=a;c.isXMLDoc=x;c.contains=E})();var eb=/Until$/,fb=/^(?:parents|prevUntil|prevAll)/,
gb=/,/;R=Array.prototype.slice;var Ia=function(a,b,d){if(c.isFunction(b))return c.grep(a,function(e,j){return!!b.call(e,j,e)===d});else if(b.nodeType)return c.grep(a,function(e){return e===b===d});else if(typeof b==="string"){var f=c.grep(a,function(e){return e.nodeType===1});if(Ua.test(b))return c.filter(b,f,!d);else b=c.filter(b,f)}return c.grep(a,function(e){return c.inArray(e,b)>=0===d})};c.fn.extend({find:function(a){for(var b=this.pushStack("","find",a),d=0,f=0,e=this.length;f<e;f++){d=b.length;
c.find(a,this[f],b);if(f>0)for(var j=d;j<b.length;j++)for(var i=0;i<d;i++)if(b[i]===b[j]){b.splice(j--,1);break}}return b},has:function(a){var b=c(a);return this.filter(function(){for(var d=0,f=b.length;d<f;d++)if(c.contains(this,b[d]))return true})},not:function(a){return this.pushStack(Ia(this,a,false),"not",a)},filter:function(a){return this.pushStack(Ia(this,a,true),"filter",a)},is:function(a){return!!a&&c.filter(a,this).length>0},closest:function(a,b){if(c.isArray(a)){var d=[],f=this[0],e,j=
{},i;if(f&&a.length){e=0;for(var o=a.length;e<o;e++){i=a[e];j[i]||(j[i]=c.expr.match.POS.test(i)?c(i,b||this.context):i)}for(;f&&f.ownerDocument&&f!==b;){for(i in j){e=j[i];if(e.jquery?e.index(f)>-1:c(f).is(e)){d.push({selector:i,elem:f});delete j[i]}}f=f.parentNode}}return d}var k=c.expr.match.POS.test(a)?c(a,b||this.context):null;return this.map(function(n,r){for(;r&&r.ownerDocument&&r!==b;){if(k?k.index(r)>-1:c(r).is(a))return r;r=r.parentNode}return null})},index:function(a){if(!a||typeof a===
"string")return c.inArray(this[0],a?c(a):this.parent().children());return c.inArray(a.jquery?a[0]:a,this)},add:function(a,b){a=typeof a==="string"?c(a,b||this.context):c.makeArray(a);b=c.merge(this.get(),a);return this.pushStack(qa(a[0])||qa(b[0])?b:c.unique(b))},andSelf:function(){return this.add(this.prevObject)}});c.each({parent:function(a){return(a=a.parentNode)&&a.nodeType!==11?a:null},parents:function(a){return c.dir(a,"parentNode")},parentsUntil:function(a,b,d){return c.dir(a,"parentNode",
d)},next:function(a){return c.nth(a,2,"nextSibling")},prev:function(a){return c.nth(a,2,"previousSibling")},nextAll:function(a){return c.dir(a,"nextSibling")},prevAll:function(a){return c.dir(a,"previousSibling")},nextUntil:function(a,b,d){return c.dir(a,"nextSibling",d)},prevUntil:function(a,b,d){return c.dir(a,"previousSibling",d)},siblings:function(a){return c.sibling(a.parentNode.firstChild,a)},children:function(a){return c.sibling(a.firstChild)},contents:function(a){return c.nodeName(a,"iframe")?
a.contentDocument||a.contentWindow.document:c.makeArray(a.childNodes)}},function(a,b){c.fn[a]=function(d,f){var e=c.map(this,b,d);eb.test(a)||(f=d);if(f&&typeof f==="string")e=c.filter(f,e);e=this.length>1?c.unique(e):e;if((this.length>1||gb.test(f))&&fb.test(a))e=e.reverse();return this.pushStack(e,a,R.call(arguments).join(","))}});c.extend({filter:function(a,b,d){if(d)a=":not("+a+")";return c.find.matches(a,b)},dir:function(a,b,d){var f=[];for(a=a[b];a&&a.nodeType!==9&&(d===w||a.nodeType!==1||!c(a).is(d));){a.nodeType===
1&&f.push(a);a=a[b]}return f},nth:function(a,b,d){b=b||1;for(var f=0;a;a=a[d])if(a.nodeType===1&&++f===b)break;return a},sibling:function(a,b){for(var d=[];a;a=a.nextSibling)a.nodeType===1&&a!==b&&d.push(a);return d}});var Ja=/ jQuery\d+="(?:\d+|null)"/g,V=/^\s+/,Ka=/(<([\w:]+)[^>]*?)\/>/g,hb=/^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,La=/<([\w:]+)/,ib=/<tbody/i,jb=/<|&#?\w+;/,ta=/<script|<object|<embed|<option|<style/i,ua=/checked\s*(?:[^=]|=\s*.checked.)/i,Ma=function(a,b,d){return hb.test(d)?
a:b+"></"+d+">"},F={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};F.optgroup=F.option;F.tbody=F.tfoot=F.colgroup=F.caption=F.thead;F.th=F.td;if(!c.support.htmlSerialize)F._default=[1,"div<div>","</div>"];c.fn.extend({text:function(a){if(c.isFunction(a))return this.each(function(b){var d=
c(this);d.text(a.call(this,b,d.text()))});if(typeof a!=="object"&&a!==w)return this.empty().append((this[0]&&this[0].ownerDocument||s).createTextNode(a));return c.text(this)},wrapAll:function(a){if(c.isFunction(a))return this.each(function(d){c(this).wrapAll(a.call(this,d))});if(this[0]){var b=c(a,this[0].ownerDocument).eq(0).clone(true);this[0].parentNode&&b.insertBefore(this[0]);b.map(function(){for(var d=this;d.firstChild&&d.firstChild.nodeType===1;)d=d.firstChild;return d}).append(this)}return this},
wrapInner:function(a){if(c.isFunction(a))return this.each(function(b){c(this).wrapInner(a.call(this,b))});return this.each(function(){var b=c(this),d=b.contents();d.length?d.wrapAll(a):b.append(a)})},wrap:function(a){return this.each(function(){c(this).wrapAll(a)})},unwrap:function(){return this.parent().each(function(){c.nodeName(this,"body")||c(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,true,function(a){this.nodeType===1&&this.appendChild(a)})},
prepend:function(){return this.domManip(arguments,true,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,false,function(b){this.parentNode.insertBefore(b,this)});else if(arguments.length){var a=c(arguments[0]);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,false,function(b){this.parentNode.insertBefore(b,
this.nextSibling)});else if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,c(arguments[0]).toArray());return a}},remove:function(a,b){for(var d=0,f;(f=this[d])!=null;d++)if(!a||c.filter(a,[f]).length){if(!b&&f.nodeType===1){c.cleanData(f.getElementsByTagName("*"));c.cleanData([f])}f.parentNode&&f.parentNode.removeChild(f)}return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++)for(b.nodeType===1&&c.cleanData(b.getElementsByTagName("*"));b.firstChild;)b.removeChild(b.firstChild);
return this},clone:function(a){var b=this.map(function(){if(!c.support.noCloneEvent&&!c.isXMLDoc(this)){var d=this.outerHTML,f=this.ownerDocument;if(!d){d=f.createElement("div");d.appendChild(this.cloneNode(true));d=d.innerHTML}return c.clean([d.replace(Ja,"").replace(/=([^="'>\s]+\/)>/g,'="$1">').replace(V,"")],f)[0]}else return this.cloneNode(true)});if(a===true){ra(this,b);ra(this.find("*"),b.find("*"))}return b},html:function(a){if(a===w)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(Ja,
""):null;else if(typeof a==="string"&&!ta.test(a)&&(c.support.leadingWhitespace||!V.test(a))&&!F[(La.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Ka,Ma);try{for(var b=0,d=this.length;b<d;b++)if(this[b].nodeType===1){c.cleanData(this[b].getElementsByTagName("*"));this[b].innerHTML=a}}catch(f){this.empty().append(a)}}else c.isFunction(a)?this.each(function(e){var j=c(this),i=j.html();j.empty().append(function(){return a.call(this,e,i)})}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&
this[0].parentNode){if(c.isFunction(a))return this.each(function(b){var d=c(this),f=d.html();d.replaceWith(a.call(this,b,f))});if(typeof a!=="string")a=c(a).detach();return this.each(function(){var b=this.nextSibling,d=this.parentNode;c(this).remove();b?c(b).before(a):c(d).append(a)})}else return this.pushStack(c(c.isFunction(a)?a():a),"replaceWith",a)},detach:function(a){return this.remove(a,true)},domManip:function(a,b,d){function f(u){return c.nodeName(u,"table")?u.getElementsByTagName("tbody")[0]||
u.appendChild(u.ownerDocument.createElement("tbody")):u}var e,j,i=a[0],o=[],k;if(!c.support.checkClone&&arguments.length===3&&typeof i==="string"&&ua.test(i))return this.each(function(){c(this).domManip(a,b,d,true)});if(c.isFunction(i))return this.each(function(u){var z=c(this);a[0]=i.call(this,u,b?z.html():w);z.domManip(a,b,d)});if(this[0]){e=i&&i.parentNode;e=c.support.parentNode&&e&&e.nodeType===11&&e.childNodes.length===this.length?{fragment:e}:sa(a,this,o);k=e.fragment;if(j=k.childNodes.length===
1?(k=k.firstChild):k.firstChild){b=b&&c.nodeName(j,"tr");for(var n=0,r=this.length;n<r;n++)d.call(b?f(this[n],j):this[n],n>0||e.cacheable||this.length>1?k.cloneNode(true):k)}o.length&&c.each(o,Qa)}return this}});c.fragments={};c.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){c.fn[a]=function(d){var f=[];d=c(d);var e=this.length===1&&this[0].parentNode;if(e&&e.nodeType===11&&e.childNodes.length===1&&d.length===1){d[b](this[0]);
return this}else{e=0;for(var j=d.length;e<j;e++){var i=(e>0?this.clone(true):this).get();c.fn[b].apply(c(d[e]),i);f=f.concat(i)}return this.pushStack(f,a,d.selector)}}});c.extend({clean:function(a,b,d,f){b=b||s;if(typeof b.createElement==="undefined")b=b.ownerDocument||b[0]&&b[0].ownerDocument||s;for(var e=[],j=0,i;(i=a[j])!=null;j++){if(typeof i==="number")i+="";if(i){if(typeof i==="string"&&!jb.test(i))i=b.createTextNode(i);else if(typeof i==="string"){i=i.replace(Ka,Ma);var o=(La.exec(i)||["",
""])[1].toLowerCase(),k=F[o]||F._default,n=k[0],r=b.createElement("div");for(r.innerHTML=k[1]+i+k[2];n--;)r=r.lastChild;if(!c.support.tbody){n=ib.test(i);o=o==="table"&&!n?r.firstChild&&r.firstChild.childNodes:k[1]==="<table>"&&!n?r.childNodes:[];for(k=o.length-1;k>=0;--k)c.nodeName(o[k],"tbody")&&!o[k].childNodes.length&&o[k].parentNode.removeChild(o[k])}!c.support.leadingWhitespace&&V.test(i)&&r.insertBefore(b.createTextNode(V.exec(i)[0]),r.firstChild);i=r.childNodes}if(i.nodeType)e.push(i);else e=
c.merge(e,i)}}if(d)for(j=0;e[j];j++)if(f&&c.nodeName(e[j],"script")&&(!e[j].type||e[j].type.toLowerCase()==="text/javascript"))f.push(e[j].parentNode?e[j].parentNode.removeChild(e[j]):e[j]);else{e[j].nodeType===1&&e.splice.apply(e,[j+1,0].concat(c.makeArray(e[j].getElementsByTagName("script"))));d.appendChild(e[j])}return e},cleanData:function(a){for(var b,d,f=c.cache,e=c.event.special,j=c.support.deleteExpando,i=0,o;(o=a[i])!=null;i++)if(d=o[c.expando]){b=f[d];if(b.events)for(var k in b.events)e[k]?
c.event.remove(o,k):Ca(o,k,b.handle);if(j)delete o[c.expando];else o.removeAttribute&&o.removeAttribute(c.expando);delete f[d]}}});var kb=/z-?index|font-?weight|opacity|zoom|line-?height/i,Na=/alpha\([^)]*\)/,Oa=/opacity=([^)]*)/,ha=/float/i,ia=/-([a-z])/ig,lb=/([A-Z])/g,mb=/^-?\d+(?:px)?$/i,nb=/^-?\d/,ob={position:"absolute",visibility:"hidden",display:"block"},pb=["Left","Right"],qb=["Top","Bottom"],rb=s.defaultView&&s.defaultView.getComputedStyle,Pa=c.support.cssFloat?"cssFloat":"styleFloat",ja=
function(a,b){return b.toUpperCase()};c.fn.css=function(a,b){return X(this,a,b,true,function(d,f,e){if(e===w)return c.curCSS(d,f);if(typeof e==="number"&&!kb.test(f))e+="px";c.style(d,f,e)})};c.extend({style:function(a,b,d){if(!a||a.nodeType===3||a.nodeType===8)return w;if((b==="width"||b==="height")&&parseFloat(d)<0)d=w;var f=a.style||a,e=d!==w;if(!c.support.opacity&&b==="opacity"){if(e){f.zoom=1;b=parseInt(d,10)+""==="NaN"?"":"alpha(opacity="+d*100+")";a=f.filter||c.curCSS(a,"filter")||"";f.filter=
Na.test(a)?a.replace(Na,b):b}return f.filter&&f.filter.indexOf("opacity=")>=0?parseFloat(Oa.exec(f.filter)[1])/100+"":""}if(ha.test(b))b=Pa;b=b.replace(ia,ja);if(e)f[b]=d;return f[b]},css:function(a,b,d,f){if(b==="width"||b==="height"){var e,j=b==="width"?pb:qb;function i(){e=b==="width"?a.offsetWidth:a.offsetHeight;f!=="border"&&c.each(j,function(){f||(e-=parseFloat(c.curCSS(a,"padding"+this,true))||0);if(f==="margin")e+=parseFloat(c.curCSS(a,"margin"+this,true))||0;else e-=parseFloat(c.curCSS(a,
"border"+this+"Width",true))||0})}a.offsetWidth!==0?i():c.swap(a,ob,i);return Math.max(0,Math.round(e))}return c.curCSS(a,b,d)},curCSS:function(a,b,d){var f,e=a.style;if(!c.support.opacity&&b==="opacity"&&a.currentStyle){f=Oa.test(a.currentStyle.filter||"")?parseFloat(RegExp.$1)/100+"":"";return f===""?"1":f}if(ha.test(b))b=Pa;if(!d&&e&&e[b])f=e[b];else if(rb){if(ha.test(b))b="float";b=b.replace(lb,"-$1").toLowerCase();e=a.ownerDocument.defaultView;if(!e)return null;if(a=e.getComputedStyle(a,null))f=
a.getPropertyValue(b);if(b==="opacity"&&f==="")f="1"}else if(a.currentStyle){d=b.replace(ia,ja);f=a.currentStyle[b]||a.currentStyle[d];if(!mb.test(f)&&nb.test(f)){b=e.left;var j=a.runtimeStyle.left;a.runtimeStyle.left=a.currentStyle.left;e.left=d==="fontSize"?"1em":f||0;f=e.pixelLeft+"px";e.left=b;a.runtimeStyle.left=j}}return f},swap:function(a,b,d){var f={};for(var e in b){f[e]=a.style[e];a.style[e]=b[e]}d.call(a);for(e in b)a.style[e]=f[e]}});if(c.expr&&c.expr.filters){c.expr.filters.hidden=function(a){var b=
a.offsetWidth,d=a.offsetHeight,f=a.nodeName.toLowerCase()==="tr";return b===0&&d===0&&!f?true:b>0&&d>0&&!f?false:c.curCSS(a,"display")==="none"};c.expr.filters.visible=function(a){return!c.expr.filters.hidden(a)}}var sb=J(),tb=/<script(.|\s)*?\/script>/gi,ub=/select|textarea/i,vb=/color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,N=/=\?(&|$)/,ka=/\?/,wb=/(\?|&)_=.*?(&|$)/,xb=/^(\w+:)?\/\/([^\/?#]+)/,yb=/%20/g,zb=c.fn.load;c.fn.extend({load:function(a,b,d){if(typeof a!==
"string")return zb.call(this,a);else if(!this.length)return this;var f=a.indexOf(" ");if(f>=0){var e=a.slice(f,a.length);a=a.slice(0,f)}f="GET";if(b)if(c.isFunction(b)){d=b;b=null}else if(typeof b==="object"){b=c.param(b,c.ajaxSettings.traditional);f="POST"}var j=this;c.ajax({url:a,type:f,dataType:"html",data:b,complete:function(i,o){if(o==="success"||o==="notmodified")j.html(e?c("<div />").append(i.responseText.replace(tb,"")).find(e):i.responseText);d&&j.each(d,[i.responseText,o,i])}});return this},
serialize:function(){return c.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?c.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||ub.test(this.nodeName)||vb.test(this.type))}).map(function(a,b){a=c(this).val();return a==null?null:c.isArray(a)?c.map(a,function(d){return{name:b.name,value:d}}):{name:b.name,value:a}}).get()}});c.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),
function(a,b){c.fn[b]=function(d){return this.bind(b,d)}});c.extend({get:function(a,b,d,f){if(c.isFunction(b)){f=f||d;d=b;b=null}return c.ajax({type:"GET",url:a,data:b,success:d,dataType:f})},getScript:function(a,b){return c.get(a,null,b,"script")},getJSON:function(a,b,d){return c.get(a,b,d,"json")},post:function(a,b,d,f){if(c.isFunction(b)){f=f||d;d=b;b={}}return c.ajax({type:"POST",url:a,data:b,success:d,dataType:f})},ajaxSetup:function(a){c.extend(c.ajaxSettings,a)},ajaxSettings:{url:location.href,
global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:A.XMLHttpRequest&&(A.location.protocol!=="file:"||!A.ActiveXObject)?function(){return new A.XMLHttpRequest}:function(){try{return new A.ActiveXObject("Microsoft.XMLHTTP")}catch(a){}},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},etag:{},ajax:function(a){function b(){e.success&&
e.success.call(k,o,i,x);e.global&&f("ajaxSuccess",[x,e])}function d(){e.complete&&e.complete.call(k,x,i);e.global&&f("ajaxComplete",[x,e]);e.global&&!--c.active&&c.event.trigger("ajaxStop")}function f(q,p){(e.context?c(e.context):c.event).trigger(q,p)}var e=c.extend(true,{},c.ajaxSettings,a),j,i,o,k=a&&a.context||e,n=e.type.toUpperCase();if(e.data&&e.processData&&typeof e.data!=="string")e.data=c.param(e.data,e.traditional);if(e.dataType==="jsonp"){if(n==="GET")N.test(e.url)||(e.url+=(ka.test(e.url)?
"&":"?")+(e.jsonp||"callback")+"=?");else if(!e.data||!N.test(e.data))e.data=(e.data?e.data+"&":"")+(e.jsonp||"callback")+"=?";e.dataType="json"}if(e.dataType==="json"&&(e.data&&N.test(e.data)||N.test(e.url))){j=e.jsonpCallback||"jsonp"+sb++;if(e.data)e.data=(e.data+"").replace(N,"="+j+"$1");e.url=e.url.replace(N,"="+j+"$1");e.dataType="script";A[j]=A[j]||function(q){o=q;b();d();A[j]=w;try{delete A[j]}catch(p){}z&&z.removeChild(C)}}if(e.dataType==="script"&&e.cache===null)e.cache=false;if(e.cache===
false&&n==="GET"){var r=J(),u=e.url.replace(wb,"$1_="+r+"$2");e.url=u+(u===e.url?(ka.test(e.url)?"&":"?")+"_="+r:"")}if(e.data&&n==="GET")e.url+=(ka.test(e.url)?"&":"?")+e.data;e.global&&!c.active++&&c.event.trigger("ajaxStart");r=(r=xb.exec(e.url))&&(r[1]&&r[1]!==location.protocol||r[2]!==location.host);if(e.dataType==="script"&&n==="GET"&&r){var z=s.getElementsByTagName("head")[0]||s.documentElement,C=s.createElement("script");C.src=e.url;if(e.scriptCharset)C.charset=e.scriptCharset;if(!j){var B=
false;C.onload=C.onreadystatechange=function(){if(!B&&(!this.readyState||this.readyState==="loaded"||this.readyState==="complete")){B=true;b();d();C.onload=C.onreadystatechange=null;z&&C.parentNode&&z.removeChild(C)}}}z.insertBefore(C,z.firstChild);return w}var E=false,x=e.xhr();if(x){e.username?x.open(n,e.url,e.async,e.username,e.password):x.open(n,e.url,e.async);try{if(e.data||a&&a.contentType)x.setRequestHeader("Content-Type",e.contentType);if(e.ifModified){c.lastModified[e.url]&&x.setRequestHeader("If-Modified-Since",
c.lastModified[e.url]);c.etag[e.url]&&x.setRequestHeader("If-None-Match",c.etag[e.url])}r||x.setRequestHeader("X-Requested-With","XMLHttpRequest");x.setRequestHeader("Accept",e.dataType&&e.accepts[e.dataType]?e.accepts[e.dataType]+", */*":e.accepts._default)}catch(ga){}if(e.beforeSend&&e.beforeSend.call(k,x,e)===false){e.global&&!--c.active&&c.event.trigger("ajaxStop");x.abort();return false}e.global&&f("ajaxSend",[x,e]);var g=x.onreadystatechange=function(q){if(!x||x.readyState===0||q==="abort"){E||
d();E=true;if(x)x.onreadystatechange=c.noop}else if(!E&&x&&(x.readyState===4||q==="timeout")){E=true;x.onreadystatechange=c.noop;i=q==="timeout"?"timeout":!c.httpSuccess(x)?"error":e.ifModified&&c.httpNotModified(x,e.url)?"notmodified":"success";var p;if(i==="success")try{o=c.httpData(x,e.dataType,e)}catch(v){i="parsererror";p=v}if(i==="success"||i==="notmodified")j||b();else c.handleError(e,x,i,p);d();q==="timeout"&&x.abort();if(e.async)x=null}};try{var h=x.abort;x.abort=function(){x&&h.call(x);
g("abort")}}catch(l){}e.async&&e.timeout>0&&setTimeout(function(){x&&!E&&g("timeout")},e.timeout);try{x.send(n==="POST"||n==="PUT"||n==="DELETE"?e.data:null)}catch(m){c.handleError(e,x,null,m);d()}e.async||g();return x}},handleError:function(a,b,d,f){if(a.error)a.error.call(a.context||a,b,d,f);if(a.global)(a.context?c(a.context):c.event).trigger("ajaxError",[b,a,f])},active:0,httpSuccess:function(a){try{return!a.status&&location.protocol==="file:"||a.status>=200&&a.status<300||a.status===304||a.status===
1223||a.status===0}catch(b){}return false},httpNotModified:function(a,b){var d=a.getResponseHeader("Last-Modified"),f=a.getResponseHeader("Etag");if(d)c.lastModified[b]=d;if(f)c.etag[b]=f;return a.status===304||a.status===0},httpData:function(a,b,d){var f=a.getResponseHeader("content-type")||"",e=b==="xml"||!b&&f.indexOf("xml")>=0;a=e?a.responseXML:a.responseText;e&&a.documentElement.nodeName==="parsererror"&&c.error("parsererror");if(d&&d.dataFilter)a=d.dataFilter(a,b);if(typeof a==="string")if(b===
"json"||!b&&f.indexOf("json")>=0)a=c.parseJSON(a);else if(b==="script"||!b&&f.indexOf("javascript")>=0)c.globalEval(a);return a},param:function(a,b){function d(i,o){if(c.isArray(o))c.each(o,function(k,n){b||/\[\]$/.test(i)?f(i,n):d(i+"["+(typeof n==="object"||c.isArray(n)?k:"")+"]",n)});else!b&&o!=null&&typeof o==="object"?c.each(o,function(k,n){d(i+"["+k+"]",n)}):f(i,o)}function f(i,o){o=c.isFunction(o)?o():o;e[e.length]=encodeURIComponent(i)+"="+encodeURIComponent(o)}var e=[];if(b===w)b=c.ajaxSettings.traditional;
if(c.isArray(a)||a.jquery)c.each(a,function(){f(this.name,this.value)});else for(var j in a)d(j,a[j]);return e.join("&").replace(yb,"+")}});var la={},Ab=/toggle|show|hide/,Bb=/^([+-]=)?([\d+-.]+)(.*)$/,W,va=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];c.fn.extend({show:function(a,b){if(a||a===0)return this.animate(K("show",3),a,b);else{a=0;for(b=this.length;a<b;a++){var d=c.data(this[a],"olddisplay");
this[a].style.display=d||"";if(c.css(this[a],"display")==="none"){d=this[a].nodeName;var f;if(la[d])f=la[d];else{var e=c("<"+d+" />").appendTo("body");f=e.css("display");if(f==="none")f="block";e.remove();la[d]=f}c.data(this[a],"olddisplay",f)}}a=0;for(b=this.length;a<b;a++)this[a].style.display=c.data(this[a],"olddisplay")||"";return this}},hide:function(a,b){if(a||a===0)return this.animate(K("hide",3),a,b);else{a=0;for(b=this.length;a<b;a++){var d=c.data(this[a],"olddisplay");!d&&d!=="none"&&c.data(this[a],
"olddisplay",c.css(this[a],"display"))}a=0;for(b=this.length;a<b;a++)this[a].style.display="none";return this}},_toggle:c.fn.toggle,toggle:function(a,b){var d=typeof a==="boolean";if(c.isFunction(a)&&c.isFunction(b))this._toggle.apply(this,arguments);else a==null||d?this.each(function(){var f=d?a:c(this).is(":hidden");c(this)[f?"show":"hide"]()}):this.animate(K("toggle",3),a,b);return this},fadeTo:function(a,b,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,d)},
animate:function(a,b,d,f){var e=c.speed(b,d,f);if(c.isEmptyObject(a))return this.each(e.complete);return this[e.queue===false?"each":"queue"](function(){var j=c.extend({},e),i,o=this.nodeType===1&&c(this).is(":hidden"),k=this;for(i in a){var n=i.replace(ia,ja);if(i!==n){a[n]=a[i];delete a[i];i=n}if(a[i]==="hide"&&o||a[i]==="show"&&!o)return j.complete.call(this);if((i==="height"||i==="width")&&this.style){j.display=c.css(this,"display");j.overflow=this.style.overflow}if(c.isArray(a[i])){(j.specialEasing=
j.specialEasing||{})[i]=a[i][1];a[i]=a[i][0]}}if(j.overflow!=null)this.style.overflow="hidden";j.curAnim=c.extend({},a);c.each(a,function(r,u){var z=new c.fx(k,j,r);if(Ab.test(u))z[u==="toggle"?o?"show":"hide":u](a);else{var C=Bb.exec(u),B=z.cur(true)||0;if(C){u=parseFloat(C[2]);var E=C[3]||"px";if(E!=="px"){k.style[r]=(u||1)+E;B=(u||1)/z.cur(true)*B;k.style[r]=B+E}if(C[1])u=(C[1]==="-="?-1:1)*u+B;z.custom(B,u,E)}else z.custom(B,u,"")}});return true})},stop:function(a,b){var d=c.timers;a&&this.queue([]);
this.each(function(){for(var f=d.length-1;f>=0;f--)if(d[f].elem===this){b&&d[f](true);d.splice(f,1)}});b||this.dequeue();return this}});c.each({slideDown:K("show",1),slideUp:K("hide",1),slideToggle:K("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(a,b){c.fn[a]=function(d,f){return this.animate(b,d,f)}});c.extend({speed:function(a,b,d){var f=a&&typeof a==="object"?a:{complete:d||!d&&b||c.isFunction(a)&&a,duration:a,easing:d&&b||b&&!c.isFunction(b)&&b};f.duration=c.fx.off?0:typeof f.duration===
"number"?f.duration:c.fx.speeds[f.duration]||c.fx.speeds._default;f.old=f.complete;f.complete=function(){f.queue!==false&&c(this).dequeue();c.isFunction(f.old)&&f.old.call(this)};return f},easing:{linear:function(a,b,d,f){return d+f*a},swing:function(a,b,d,f){return(-Math.cos(a*Math.PI)/2+0.5)*f+d}},timers:[],fx:function(a,b,d){this.options=b;this.elem=a;this.prop=d;if(!b.orig)b.orig={}}});c.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this);(c.fx.step[this.prop]||
c.fx.step._default)(this);if((this.prop==="height"||this.prop==="width")&&this.elem.style)this.elem.style.display="block"},cur:function(a){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];return(a=parseFloat(c.css(this.elem,this.prop,a)))&&a>-10000?a:parseFloat(c.curCSS(this.elem,this.prop))||0},custom:function(a,b,d){function f(j){return e.step(j)}this.startTime=J();this.start=a;this.end=b;this.unit=d||this.unit||"px";this.now=this.start;
this.pos=this.state=0;var e=this;f.elem=this.elem;if(f()&&c.timers.push(f)&&!W)W=setInterval(c.fx.tick,13)},show:function(){this.options.orig[this.prop]=c.style(this.elem,this.prop);this.options.show=true;this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur());c(this.elem).show()},hide:function(){this.options.orig[this.prop]=c.style(this.elem,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(a){var b=J(),d=true;if(a||b>=this.options.duration+this.startTime){this.now=
this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;for(var f in this.options.curAnim)if(this.options.curAnim[f]!==true)d=false;if(d){if(this.options.display!=null){this.elem.style.overflow=this.options.overflow;a=c.data(this.elem,"olddisplay");this.elem.style.display=a?a:this.options.display;if(c.css(this.elem,"display")==="none")this.elem.style.display="block"}this.options.hide&&c(this.elem).hide();if(this.options.hide||this.options.show)for(var e in this.options.curAnim)c.style(this.elem,
e,this.options.orig[e]);this.options.complete.call(this.elem)}return false}else{e=b-this.startTime;this.state=e/this.options.duration;a=this.options.easing||(c.easing.swing?"swing":"linear");this.pos=c.easing[this.options.specialEasing&&this.options.specialEasing[this.prop]||a](this.state,e,0,1,this.options.duration);this.now=this.start+(this.end-this.start)*this.pos;this.update()}return true}};c.extend(c.fx,{tick:function(){for(var a=c.timers,b=0;b<a.length;b++)a[b]()||a.splice(b--,1);a.length||
c.fx.stop()},stop:function(){clearInterval(W);W=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){c.style(a.elem,"opacity",a.now)},_default:function(a){if(a.elem.style&&a.elem.style[a.prop]!=null)a.elem.style[a.prop]=(a.prop==="width"||a.prop==="height"?Math.max(0,a.now):a.now)+a.unit;else a.elem[a.prop]=a.now}}});if(c.expr&&c.expr.filters)c.expr.filters.animated=function(a){return c.grep(c.timers,function(b){return a===b.elem}).length};c.fn.offset="getBoundingClientRect"in s.documentElement?
function(a){var b=this[0];if(a)return this.each(function(e){c.offset.setOffset(this,a,e)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return c.offset.bodyOffset(b);var d=b.getBoundingClientRect(),f=b.ownerDocument;b=f.body;f=f.documentElement;return{top:d.top+(self.pageYOffset||c.support.boxModel&&f.scrollTop||b.scrollTop)-(f.clientTop||b.clientTop||0),left:d.left+(self.pageXOffset||c.support.boxModel&&f.scrollLeft||b.scrollLeft)-(f.clientLeft||b.clientLeft||0)}}:function(a){var b=
this[0];if(a)return this.each(function(r){c.offset.setOffset(this,a,r)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return c.offset.bodyOffset(b);c.offset.initialize();var d=b.offsetParent,f=b,e=b.ownerDocument,j,i=e.documentElement,o=e.body;f=(e=e.defaultView)?e.getComputedStyle(b,null):b.currentStyle;for(var k=b.offsetTop,n=b.offsetLeft;(b=b.parentNode)&&b!==o&&b!==i;){if(c.offset.supportsFixedPosition&&f.position==="fixed")break;j=e?e.getComputedStyle(b,null):b.currentStyle;
k-=b.scrollTop;n-=b.scrollLeft;if(b===d){k+=b.offsetTop;n+=b.offsetLeft;if(c.offset.doesNotAddBorder&&!(c.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(b.nodeName))){k+=parseFloat(j.borderTopWidth)||0;n+=parseFloat(j.borderLeftWidth)||0}f=d;d=b.offsetParent}if(c.offset.subtractsBorderForOverflowNotVisible&&j.overflow!=="visible"){k+=parseFloat(j.borderTopWidth)||0;n+=parseFloat(j.borderLeftWidth)||0}f=j}if(f.position==="relative"||f.position==="static"){k+=o.offsetTop;n+=o.offsetLeft}if(c.offset.supportsFixedPosition&&
f.position==="fixed"){k+=Math.max(i.scrollTop,o.scrollTop);n+=Math.max(i.scrollLeft,o.scrollLeft)}return{top:k,left:n}};c.offset={initialize:function(){var a=s.body,b=s.createElement("div"),d,f,e,j=parseFloat(c.curCSS(a,"marginTop",true))||0;c.extend(b.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"});b.innerHTML="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
a.insertBefore(b,a.firstChild);d=b.firstChild;f=d.firstChild;e=d.nextSibling.firstChild.firstChild;this.doesNotAddBorder=f.offsetTop!==5;this.doesAddBorderForTableAndCells=e.offsetTop===5;f.style.position="fixed";f.style.top="20px";this.supportsFixedPosition=f.offsetTop===20||f.offsetTop===15;f.style.position=f.style.top="";d.style.overflow="hidden";d.style.position="relative";this.subtractsBorderForOverflowNotVisible=f.offsetTop===-5;this.doesNotIncludeMarginInBodyOffset=a.offsetTop!==j;a.removeChild(b);
c.offset.initialize=c.noop},bodyOffset:function(a){var b=a.offsetTop,d=a.offsetLeft;c.offset.initialize();if(c.offset.doesNotIncludeMarginInBodyOffset){b+=parseFloat(c.curCSS(a,"marginTop",true))||0;d+=parseFloat(c.curCSS(a,"marginLeft",true))||0}return{top:b,left:d}},setOffset:function(a,b,d){if(/static/.test(c.curCSS(a,"position")))a.style.position="relative";var f=c(a),e=f.offset(),j=parseInt(c.curCSS(a,"top",true),10)||0,i=parseInt(c.curCSS(a,"left",true),10)||0;if(c.isFunction(b))b=b.call(a,
d,e);d={top:b.top-e.top+j,left:b.left-e.left+i};"using"in b?b.using.call(a,d):f.css(d)}};c.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),d=this.offset(),f=/^body|html$/i.test(b[0].nodeName)?{top:0,left:0}:b.offset();d.top-=parseFloat(c.curCSS(a,"marginTop",true))||0;d.left-=parseFloat(c.curCSS(a,"marginLeft",true))||0;f.top+=parseFloat(c.curCSS(b[0],"borderTopWidth",true))||0;f.left+=parseFloat(c.curCSS(b[0],"borderLeftWidth",true))||0;return{top:d.top-
f.top,left:d.left-f.left}},offsetParent:function(){return this.map(function(){for(var a=this.offsetParent||s.body;a&&!/^body|html$/i.test(a.nodeName)&&c.css(a,"position")==="static";)a=a.offsetParent;return a})}});c.each(["Left","Top"],function(a,b){var d="scroll"+b;c.fn[d]=function(f){var e=this[0],j;if(!e)return null;if(f!==w)return this.each(function(){if(j=wa(this))j.scrollTo(!a?f:c(j).scrollLeft(),a?f:c(j).scrollTop());else this[d]=f});else return(j=wa(e))?"pageXOffset"in j?j[a?"pageYOffset":
"pageXOffset"]:c.support.boxModel&&j.document.documentElement[d]||j.document.body[d]:e[d]}});c.each(["Height","Width"],function(a,b){var d=b.toLowerCase();c.fn["inner"+b]=function(){return this[0]?c.css(this[0],d,false,"padding"):null};c.fn["outer"+b]=function(f){return this[0]?c.css(this[0],d,false,f?"margin":"border"):null};c.fn[d]=function(f){var e=this[0];if(!e)return f==null?null:this;if(c.isFunction(f))return this.each(function(j){var i=c(this);i[d](f.call(this,j,i[d]()))});return"scrollTo"in
e&&e.document?e.document.compatMode==="CSS1Compat"&&e.document.documentElement["client"+b]||e.document.body["client"+b]:e.nodeType===9?Math.max(e.documentElement["client"+b],e.body["scroll"+b],e.documentElement["scroll"+b],e.body["offset"+b],e.documentElement["offset"+b]):f===w?c.css(e,d):this.css(d,typeof f==="string"?f:f+"px")}});A.jQuery=A.$=c})(window);
/*!
 * jQuery UI 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */
jQuery.ui||function(c){c.ui={version:"1.8.1",plugin:{add:function(a,b,d){a=c.ui[a].prototype;for(var e in d){a.plugins[e]=a.plugins[e]||[];a.plugins[e].push([b,d[e]])}},call:function(a,b,d){if((b=a.plugins[b])&&a.element[0].parentNode)for(var e=0;e<b.length;e++)a.options[b[e][0]]&&b[e][1].apply(a.element,d)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(a,b){if(c(a).css("overflow")=="hidden")return false;
b=b&&b=="left"?"scrollLeft":"scrollTop";var d=false;if(a[b]>0)return true;a[b]=1;d=a[b]>0;a[b]=0;return d},isOverAxis:function(a,b,d){return a>b&&a<b+d},isOver:function(a,b,d,e,f,g){return c.ui.isOverAxis(a,d,f)&&c.ui.isOverAxis(b,e,g)},keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,
PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38}};c.fn.extend({_focus:c.fn.focus,focus:function(a,b){return typeof a==="number"?this.each(function(){var d=this;setTimeout(function(){c(d).focus();b&&b.call(d)},a)}):this._focus.apply(this,arguments)},enableSelection:function(){return this.attr("unselectable","off").css("MozUserSelect","")},disableSelection:function(){return this.attr("unselectable","on").css("MozUserSelect","none")},scrollParent:function(){var a;a=c.browser.msie&&/(static|relative)/.test(this.css("position"))||
/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(c.curCSS(this,"position",1))&&/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0);return/fixed/.test(this.css("position"))||!a.length?c(document):a},zIndex:function(a){if(a!==
undefined)return this.css("zIndex",a);if(this.length){a=c(this[0]);for(var b;a.length&&a[0]!==document;){b=a.css("position");if(b=="absolute"||b=="relative"||b=="fixed"){b=parseInt(a.css("zIndex"));if(!isNaN(b)&&b!=0)return b}a=a.parent()}}return 0}});c.extend(c.expr[":"],{data:function(a,b,d){return!!c.data(a,d[3])},focusable:function(a){var b=a.nodeName.toLowerCase(),d=c.attr(a,"tabindex");return(/input|select|textarea|button|object/.test(b)?!a.disabled:"a"==b||"area"==b?a.href||!isNaN(d):!isNaN(d))&&
!c(a)["area"==b?"parents":"closest"](":hidden").length},tabbable:function(a){var b=c.attr(a,"tabindex");return(isNaN(b)||b>=0)&&c(a).is(":focusable")}})}(jQuery);
;/*!
 * jQuery UI Widget 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b){var j=b.fn.remove;b.fn.remove=function(a,c){return this.each(function(){if(!c)if(!a||b.filter(a,[this]).length)b("*",this).add(this).each(function(){b(this).triggerHandler("remove")});return j.call(b(this),a,c)})};b.widget=function(a,c,d){var e=a.split(".")[0],f;a=a.split(".")[1];f=e+"-"+a;if(!d){d=c;c=b.Widget}b.expr[":"][f]=function(h){return!!b.data(h,a)};b[e]=b[e]||{};b[e][a]=function(h,g){arguments.length&&this._createWidget(h,g)};c=new c;c.options=b.extend({},c.options);b[e][a].prototype=
b.extend(true,c,{namespace:e,widgetName:a,widgetEventPrefix:b[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);b.widget.bridge(a,b[e][a])};b.widget.bridge=function(a,c){b.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),h=this;d=!e&&f.length?b.extend.apply(null,[true,d].concat(f)):d;if(e&&d.substring(0,1)==="_")return h;e?this.each(function(){var g=b.data(this,a),i=g&&b.isFunction(g[d])?g[d].apply(g,f):g;if(i!==g&&i!==undefined){h=i;return false}}):this.each(function(){var g=
b.data(this,a);if(g){d&&g.option(d);g._init()}else b.data(this,a,new c(d,this))});return h}};b.Widget=function(a,c){arguments.length&&this._createWidget(a,c)};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(a,c){this.element=b(c).data(this.widgetName,this);this.options=b.extend(true,{},this.options,b.metadata&&b.metadata.get(c)[this.widgetName],a);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()});this._create();
this._init()},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled ui-state-disabled")},widget:function(){return this.element},option:function(a,c){var d=a,e=this;if(arguments.length===0)return b.extend({},e.options);if(typeof a==="string"){if(c===undefined)return this.options[a];d={};d[a]=c}b.each(d,function(f,
h){e._setOption(f,h)});return e},_setOption:function(a,c){this.options[a]=c;if(a==="disabled")this.widget()[c?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",c);return this},enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(a,c,d){var e=this.options[a];c=b.Event(c);c.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();d=d||{};if(c.originalEvent){a=
b.event.props.length;for(var f;a;){f=b.event.props[--a];c[f]=c.originalEvent[f]}}this.element.trigger(c,d);return!(b.isFunction(e)&&e.call(this.element[0],c,d)===false||c.isDefaultPrevented())}}})(jQuery);
;/*!
 * jQuery UI Mouse 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function(c){c.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var a=this;this.element.bind("mousedown."+this.widgetName,function(b){return a._mouseDown(b)}).bind("click."+this.widgetName,function(b){if(a._preventClickEvent){a._preventClickEvent=false;b.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+this.widgetName)},_mouseDown:function(a){a.originalEvent=a.originalEvent||{};if(!a.originalEvent.mouseHandled){this._mouseStarted&&
this._mouseUp(a);this._mouseDownEvent=a;var b=this,e=a.which==1,f=typeof this.options.cancel=="string"?c(a.target).parents().add(a.target).filter(this.options.cancel).length:false;if(!e||f||!this._mouseCapture(a))return true;this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet)this._mouseDelayTimer=setTimeout(function(){b.mouseDelayMet=true},this.options.delay);if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)){this._mouseStarted=this._mouseStart(a)!==false;if(!this._mouseStarted){a.preventDefault();
return true}}this._mouseMoveDelegate=function(d){return b._mouseMove(d)};this._mouseUpDelegate=function(d){return b._mouseUp(d)};c(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);c.browser.safari||a.preventDefault();return a.originalEvent.mouseHandled=true}},_mouseMove:function(a){if(c.browser.msie&&!a.button)return this._mouseUp(a);if(this._mouseStarted){this._mouseDrag(a);return a.preventDefault()}if(this._mouseDistanceMet(a)&&
this._mouseDelayMet(a))(this._mouseStarted=this._mouseStart(this._mouseDownEvent,a)!==false)?this._mouseDrag(a):this._mouseUp(a);return!this._mouseStarted},_mouseUp:function(a){c(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=false;this._preventClickEvent=a.target==this._mouseDownEvent.target;this._mouseStop(a)}return false},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-
a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return true}})})(jQuery);
;/*
 * jQuery UI Position 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Position
 */
(function(c){c.ui=c.ui||{};var m=/left|center|right/,n=/top|center|bottom/,p=c.fn.position,q=c.fn.offset;c.fn.position=function(a){if(!a||!a.of)return p.apply(this,arguments);a=c.extend({},a);var b=c(a.of),d=(a.collision||"flip").split(" "),e=a.offset?a.offset.split(" "):[0,0],g,h,i;if(a.of.nodeType===9){g=b.width();h=b.height();i={top:0,left:0}}else if(a.of.scrollTo&&a.of.document){g=b.width();h=b.height();i={top:b.scrollTop(),left:b.scrollLeft()}}else if(a.of.preventDefault){a.at="left top";g=h=
0;i={top:a.of.pageY,left:a.of.pageX}}else{g=b.outerWidth();h=b.outerHeight();i=b.offset()}c.each(["my","at"],function(){var f=(a[this]||"").split(" ");if(f.length===1)f=m.test(f[0])?f.concat(["center"]):n.test(f[0])?["center"].concat(f):["center","center"];f[0]=m.test(f[0])?f[0]:"center";f[1]=n.test(f[1])?f[1]:"center";a[this]=f});if(d.length===1)d[1]=d[0];e[0]=parseInt(e[0],10)||0;if(e.length===1)e[1]=e[0];e[1]=parseInt(e[1],10)||0;if(a.at[0]==="right")i.left+=g;else if(a.at[0]==="center")i.left+=
g/2;if(a.at[1]==="bottom")i.top+=h;else if(a.at[1]==="center")i.top+=h/2;i.left+=e[0];i.top+=e[1];return this.each(function(){var f=c(this),k=f.outerWidth(),l=f.outerHeight(),j=c.extend({},i);if(a.my[0]==="right")j.left-=k;else if(a.my[0]==="center")j.left-=k/2;if(a.my[1]==="bottom")j.top-=l;else if(a.my[1]==="center")j.top-=l/2;j.left=parseInt(j.left);j.top=parseInt(j.top);c.each(["left","top"],function(o,r){c.ui.position[d[o]]&&c.ui.position[d[o]][r](j,{targetWidth:g,targetHeight:h,elemWidth:k,
elemHeight:l,offset:e,my:a.my,at:a.at})});c.fn.bgiframe&&f.bgiframe();f.offset(c.extend(j,{using:a.using}))})};c.ui.position={fit:{left:function(a,b){var d=c(window);b=a.left+b.elemWidth-d.width()-d.scrollLeft();a.left=b>0?a.left-b:Math.max(0,a.left)},top:function(a,b){var d=c(window);b=a.top+b.elemHeight-d.height()-d.scrollTop();a.top=b>0?a.top-b:Math.max(0,a.top)}},flip:{left:function(a,b){if(b.at[0]!=="center"){var d=c(window);d=a.left+b.elemWidth-d.width()-d.scrollLeft();var e=b.my[0]==="left"?
-b.elemWidth:b.my[0]==="right"?b.elemWidth:0,g=-2*b.offset[0];a.left+=a.left<0?e+b.targetWidth+g:d>0?e-b.targetWidth+g:0}},top:function(a,b){if(b.at[1]!=="center"){var d=c(window);d=a.top+b.elemHeight-d.height()-d.scrollTop();var e=b.my[1]==="top"?-b.elemHeight:b.my[1]==="bottom"?b.elemHeight:0,g=b.at[1]==="top"?b.targetHeight:-b.targetHeight,h=-2*b.offset[1];a.top+=a.top<0?e+b.targetHeight+h:d>0?e+g+h:0}}}};if(!c.offset.setOffset){c.offset.setOffset=function(a,b){if(/static/.test(c.curCSS(a,"position")))a.style.position=
"relative";var d=c(a),e=d.offset(),g=parseInt(c.curCSS(a,"top",true),10)||0,h=parseInt(c.curCSS(a,"left",true),10)||0;e={top:b.top-e.top+g,left:b.left-e.left+h};"using"in b?b.using.call(a,e):d.css(e)};c.fn.offset=function(a){var b=this[0];if(!b||!b.ownerDocument)return null;if(a)return this.each(function(){c.offset.setOffset(this,a)});return q.call(this)}}})(jQuery);
;/*
 * jQuery UI Draggable 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
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
this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);return false},_mouseStop:function(a){var b=false;if(d.ui.ddmanager&&!this.options.dropBehaviour)b=d.ui.ddmanager.drop(this,a);if(this.dropped){b=this.dropped;this.dropped=false}if(!this.element[0]||!this.element[0].parentNode)return false;if(this.options.revert=="invalid"&&!b||this.options.revert=="valid"&&b||this.options.revert===true||d.isFunction(this.options.revert)&&this.options.revert.call(this.element,
b)){var c=this;d(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){c._trigger("stop",a)!==false&&c._clear()})}else this._trigger("stop",a)!==false&&this._clear();return false},cancel:function(){this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear();return this},_getHandle:function(a){var b=!this.options.handle||!d(this.options.handle,this.element).length?true:false;d(this.options.handle,this.element).find("*").andSelf().each(function(){if(this==
a.target)b=true});return b},_createHelper:function(a){var b=this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a])):b.helper=="clone"?this.element.clone():this.element;a.parents("body").length||a.appendTo(b.appendTo=="parent"?this.element[0].parentNode:b.appendTo);a[0]!=this.element[0]&&!/(fixed|absolute)/.test(a.css("position"))&&a.css("position","absolute");return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||
0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],
this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-
(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment==
"parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,d(a.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)&&
a.containment.constructor!=Array){var b=d(a.containment)[0];if(b){a=d(a.containment).offset();var c=d(b).css("overflow")!="hidden";this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0)-this.margins.left,a.top+(parseInt(d(b).css("borderTopWidth"),10)||0)+(parseInt(d(b).css("paddingTop"),10)||0)-this.margins.top,a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),
10)||0)-this.helperProportions.width-this.margins.left,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}}else if(a.containment.constructor==Array)this.containment=a.containment},_convertPositionTo:function(a,b){if(!b)b=this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],
this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName);return{top:b.top+this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():
f?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName),e=a.pageX,g=a.pageY;if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0])e=this.containment[0]+this.offset.click.left;if(a.pageY-this.offset.click.top<this.containment[1])g=this.containment[1]+
this.offset.click.top;if(a.pageX-this.offset.click.left>this.containment[2])e=this.containment[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>this.containment[3])g=this.containment[3]+this.offset.click.top}if(b.grid){g=this.originalPageY+Math.round((g-this.originalPageY)/b.grid[1])*b.grid[1];g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;e=this.originalPageX+
Math.round((e-this.originalPageX)/b.grid[0])*b.grid[0];e=this.containment?!(e-this.offset.click.left<this.containment[0]||e-this.offset.click.left>this.containment[2])?e:!(e-this.offset.click.left<this.containment[0])?e-b.grid[0]:e+b.grid[0]:e}}return{top:g-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop()),left:e-this.offset.click.left-
this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:c.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging");this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove();this.helper=null;this.cancelHelperRemoval=false},_trigger:function(a,b,c){c=c||this._uiHash();d.ui.plugin.call(this,a,[b,c]);if(a=="drag")this.positionAbs=
this._convertPositionTo("absolute");return d.Widget.prototype._trigger.call(this,a,b,c)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}});d.extend(d.ui.draggable,{version:"1.8.1"});d.ui.plugin.add("draggable","connectToSortable",{start:function(a,b){var c=d(this).data("draggable"),f=c.options,e=d.extend({},b,{item:c.element});c.sortables=[];d(f.connectToSortable).each(function(){var g=d.data(this,"sortable");
if(g&&!g.options.disabled){c.sortables.push({instance:g,shouldRevert:g.options.revert});g._refreshItems();g._trigger("activate",a,e)}})},stop:function(a,b){var c=d(this).data("draggable"),f=d.extend({},b,{item:c.element});d.each(c.sortables,function(){if(this.instance.isOver){this.instance.isOver=0;c.cancelHelperRemoval=true;this.instance.cancelHelperRemoval=false;if(this.shouldRevert)this.instance.options.revert=true;this.instance._mouseStop(a);this.instance.options.helper=this.instance.options._helper;
c.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})}else{this.instance.cancelHelperRemoval=false;this.instance._trigger("deactivate",a,f)}})},drag:function(a,b){var c=d(this).data("draggable"),f=this;d.each(c.sortables,function(){this.instance.positionAbs=c.positionAbs;this.instance.helperProportions=c.helperProportions;this.instance.offset.click=c.offset.click;if(this.instance._intersectsWith(this.instance.containerCache)){if(!this.instance.isOver){this.instance.isOver=
1;this.instance.currentItem=d(f).clone().appendTo(this.instance.element).data("sortable-item",true);this.instance.options._helper=this.instance.options.helper;this.instance.options.helper=function(){return b.helper[0]};a.target=this.instance.currentItem[0];this.instance._mouseCapture(a,true);this.instance._mouseStart(a,true,true);this.instance.offset.click.top=c.offset.click.top;this.instance.offset.click.left=c.offset.click.left;this.instance.offset.parent.left-=c.offset.parent.left-this.instance.offset.parent.left;
this.instance.offset.parent.top-=c.offset.parent.top-this.instance.offset.parent.top;c._trigger("toSortable",a);c.dropped=this.instance.element;c.currentItem=c.element;this.instance.fromOutside=c}this.instance.currentItem&&this.instance._mouseDrag(a)}else if(this.instance.isOver){this.instance.isOver=0;this.instance.cancelHelperRemoval=true;this.instance.options.revert=false;this.instance._trigger("out",a,this.instance._uiHash(this.instance));this.instance._mouseStop(a,true);this.instance.options.helper=
this.instance.options._helper;this.instance.currentItem.remove();this.instance.placeholder&&this.instance.placeholder.remove();c._trigger("fromSortable",a);c.dropped=false}})}});d.ui.plugin.add("draggable","cursor",{start:function(){var a=d("body"),b=d(this).data("draggable").options;if(a.css("cursor"))b._cursor=a.css("cursor");a.css("cursor",b.cursor)},stop:function(){var a=d(this).data("draggable").options;a._cursor&&d("body").css("cursor",a._cursor)}});d.ui.plugin.add("draggable","iframeFix",{start:function(){var a=
d(this).data("draggable").options;d(a.iframeFix===true?"iframe":a.iframeFix).each(function(){d('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1E3}).css(d(this).offset()).appendTo("body")})},stop:function(){d("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)})}});d.ui.plugin.add("draggable","opacity",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;
if(a.css("opacity"))b._opacity=a.css("opacity");a.css("opacity",b.opacity)},stop:function(a,b){a=d(this).data("draggable").options;a._opacity&&d(b.helper).css("opacity",a._opacity)}});d.ui.plugin.add("draggable","scroll",{start:function(){var a=d(this).data("draggable");if(a.scrollParent[0]!=document&&a.scrollParent[0].tagName!="HTML")a.overflowOffset=a.scrollParent.offset()},drag:function(a){var b=d(this).data("draggable"),c=b.options,f=false;if(b.scrollParent[0]!=document&&b.scrollParent[0].tagName!=
"HTML"){if(!c.axis||c.axis!="x")if(b.overflowOffset.top+b.scrollParent[0].offsetHeight-a.pageY<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop+c.scrollSpeed;else if(a.pageY-b.overflowOffset.top<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop-c.scrollSpeed;if(!c.axis||c.axis!="y")if(b.overflowOffset.left+b.scrollParent[0].offsetWidth-a.pageX<c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft+c.scrollSpeed;else if(a.pageX-
b.overflowOffset.left<c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft-c.scrollSpeed}else{if(!c.axis||c.axis!="x")if(a.pageY-d(document).scrollTop()<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()-c.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()+c.scrollSpeed);if(!c.axis||c.axis!="y")if(a.pageX-d(document).scrollLeft()<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()-
c.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()+c.scrollSpeed)}f!==false&&d.ui.ddmanager&&!c.dropBehaviour&&d.ui.ddmanager.prepareOffsets(b,a)}});d.ui.plugin.add("draggable","snap",{start:function(){var a=d(this).data("draggable"),b=a.options;a.snapElements=[];d(b.snap.constructor!=String?b.snap.items||":data(draggable)":b.snap).each(function(){var c=d(this),f=c.offset();this!=a.element[0]&&a.snapElements.push({item:this,
width:c.outerWidth(),height:c.outerHeight(),top:f.top,left:f.left})})},drag:function(a,b){for(var c=d(this).data("draggable"),f=c.options,e=f.snapTolerance,g=b.offset.left,n=g+c.helperProportions.width,m=b.offset.top,o=m+c.helperProportions.height,h=c.snapElements.length-1;h>=0;h--){var i=c.snapElements[h].left,k=i+c.snapElements[h].width,j=c.snapElements[h].top,l=j+c.snapElements[h].height;if(i-e<g&&g<k+e&&j-e<m&&m<l+e||i-e<g&&g<k+e&&j-e<o&&o<l+e||i-e<n&&n<k+e&&j-e<m&&m<l+e||i-e<n&&n<k+e&&j-e<o&&
o<l+e){if(f.snapMode!="inner"){var p=Math.abs(j-o)<=e,q=Math.abs(l-m)<=e,r=Math.abs(i-n)<=e,s=Math.abs(k-g)<=e;if(p)b.position.top=c._convertPositionTo("relative",{top:j-c.helperProportions.height,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:l,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:i-c.helperProportions.width}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:k}).left-c.margins.left}var t=
p||q||r||s;if(f.snapMode!="outer"){p=Math.abs(j-m)<=e;q=Math.abs(l-o)<=e;r=Math.abs(i-g)<=e;s=Math.abs(k-n)<=e;if(p)b.position.top=c._convertPositionTo("relative",{top:j,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:l-c.helperProportions.height,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:i}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:k-c.helperProportions.width}).left-c.margins.left}if(!c.snapElements[h].snapping&&
(p||q||r||s||t))c.options.snap.snap&&c.options.snap.snap.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[h].item}));c.snapElements[h].snapping=p||q||r||s||t}else{c.snapElements[h].snapping&&c.options.snap.release&&c.options.snap.release.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[h].item}));c.snapElements[h].snapping=false}}}});d.ui.plugin.add("draggable","stack",{start:function(){var a=d(this).data("draggable").options;a=d.makeArray(d(a.stack)).sort(function(c,f){return(parseInt(d(c).css("zIndex"),
10)||0)-(parseInt(d(f).css("zIndex"),10)||0)});if(a.length){var b=parseInt(a[0].style.zIndex)||0;d(a).each(function(c){this.style.zIndex=b+c});this[0].style.zIndex=b+a.length}}});d.ui.plugin.add("draggable","zIndex",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("zIndex"))b._zIndex=a.css("zIndex");a.css("zIndex",b.zIndex)},stop:function(a,b){a=d(this).data("draggable").options;a._zIndex&&d(b.helper).css("zIndex",a._zIndex)}})})(jQuery);
;/*
 * jQuery UI Droppable 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
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
a,this.ui(c));return this.element}return false},ui:function(a){return{draggable:a.currentItem||a.element,helper:a.helper,position:a.position,offset:a.positionAbs}}});d.extend(d.ui.droppable,{version:"1.8.1"});d.ui.intersect=function(a,b,c){if(!b.offset)return false;var e=(a.positionAbs||a.position.absolute).left,g=e+a.helperProportions.width,f=(a.positionAbs||a.position.absolute).top,h=f+a.helperProportions.height,i=b.offset.left,k=i+b.proportions.width,j=b.offset.top,l=j+b.proportions.height;
switch(c){case "fit":return i<e&&g<k&&j<f&&h<l;case "intersect":return i<e+a.helperProportions.width/2&&g-a.helperProportions.width/2<k&&j<f+a.helperProportions.height/2&&h-a.helperProportions.height/2<l;case "pointer":return d.ui.isOver((a.positionAbs||a.position.absolute).top+(a.clickOffset||a.offset.click).top,(a.positionAbs||a.position.absolute).left+(a.clickOffset||a.offset.click).left,j,i,b.proportions.height,b.proportions.width);case "touch":return(f>=j&&f<=l||h>=j&&h<=l||f<j&&h>l)&&(e>=i&&
e<=k||g>=i&&g<=k||e<i&&g>k);default:return false}};d.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(a,b){var c=d.ui.ddmanager.droppables[a.options.scope]||[],e=b?b.type:null,g=(a.currentItem||a.element).find(":data(droppable)").andSelf(),f=0;a:for(;f<c.length;f++)if(!(c[f].options.disabled||a&&!c[f].accept.call(c[f].element[0],a.currentItem||a.element))){for(var h=0;h<g.length;h++)if(g[h]==c[f].element[0]){c[f].proportions.height=0;continue a}c[f].visible=c[f].element.css("display")!=
"none";if(c[f].visible){c[f].offset=c[f].element.offset();c[f].proportions={width:c[f].element[0].offsetWidth,height:c[f].element[0].offsetHeight};e=="mousedown"&&c[f]._activate.call(c[f],b)}}},drop:function(a,b){var c=false;d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(this.options){if(!this.options.disabled&&this.visible&&d.ui.intersect(a,this,this.options.tolerance))c=c||this._drop.call(this,b);if(!this.options.disabled&&this.visible&&this.accept.call(this.element[0],a.currentItem||
a.element)){this.isout=1;this.isover=0;this._deactivate.call(this,b)}}});return c},drag:function(a,b){a.options.refreshPositions&&d.ui.ddmanager.prepareOffsets(a,b);d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(!(this.options.disabled||this.greedyChild||!this.visible)){var c=d.ui.intersect(a,this,this.options.tolerance);if(c=!c&&this.isover==1?"isout":c&&this.isover==0?"isover":null){var e;if(this.options.greedy){var g=this.element.parents(":data(droppable):eq(0)");if(g.length){e=
d.data(g[0],"droppable");e.greedyChild=c=="isover"?1:0}}if(e&&c=="isover"){e.isover=0;e.isout=1;e._out.call(e,b)}this[c]=1;this[c=="isout"?"isover":"isout"]=0;this[c=="isover"?"_over":"_out"].call(this,b);if(e&&c=="isout"){e.isout=0;e.isover=1;e._over.call(e,b)}}}})}}})(jQuery);
;/*
 * jQuery UI Resizable 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Resizables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.resizable",d.ui.mouse,{widgetEventPrefix:"resize",options:{alsoResize:false,animate:false,animateDuration:"slow",animateEasing:"swing",aspectRatio:false,autoHide:false,containment:false,ghost:false,grid:false,handles:"e,s,se",helper:false,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1E3},_create:function(){var b=this,a=this.options;this.element.addClass("ui-resizable");d.extend(this,{_aspectRatio:!!a.aspectRatio,aspectRatio:a.aspectRatio,originalElement:this.element,
_proportionallyResizeElements:[],_helper:a.helper||a.ghost||a.animate?a.helper||"ui-resizable-helper":null});if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)){/relative/.test(this.element.css("position"))&&d.browser.opera&&this.element.css({position:"relative",top:"auto",left:"auto"});this.element.wrap(d('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),
top:this.element.css("top"),left:this.element.css("left")}));this.element=this.element.parent().data("resizable",this.element.data("resizable"));this.elementIsWrapper=true;this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")});this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0});this.originalResizeStyle=
this.originalElement.css("resize");this.originalElement.css("resize","none");this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"}));this.originalElement.css({margin:this.originalElement.css("margin")});this._proportionallyResize()}this.handles=a.handles||(!d(".ui-resizable-handle",this.element).length?"e,s,se":{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",
nw:".ui-resizable-nw"});if(this.handles.constructor==String){if(this.handles=="all")this.handles="n,e,s,w,se,sw,ne,nw";var c=this.handles.split(",");this.handles={};for(var e=0;e<c.length;e++){var g=d.trim(c[e]),f=d('<div class="ui-resizable-handle '+("ui-resizable-"+g)+'"></div>');/sw|se|ne|nw/.test(g)&&f.css({zIndex:++a.zIndex});"se"==g&&f.addClass("ui-icon ui-icon-gripsmall-diagonal-se");this.handles[g]=".ui-resizable-"+g;this.element.append(f)}}this._renderAxis=function(h){h=h||this.element;for(var i in this.handles){if(this.handles[i].constructor==
String)this.handles[i]=d(this.handles[i],this.element).show();if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var j=d(this.handles[i],this.element),l=0;l=/sw|ne|nw|se|n|s/.test(i)?j.outerHeight():j.outerWidth();j=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join("");h.css(j,l);this._proportionallyResize()}d(this.handles[i])}};this._renderAxis(this.element);this._handles=d(".ui-resizable-handle",this.element).disableSelection();
this._handles.mouseover(function(){if(!b.resizing){if(this.className)var h=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);b.axis=h&&h[1]?h[1]:"se"}});if(a.autoHide){this._handles.hide();d(this.element).addClass("ui-resizable-autohide").hover(function(){d(this).removeClass("ui-resizable-autohide");b._handles.show()},function(){if(!b.resizing){d(this).addClass("ui-resizable-autohide");b._handles.hide()}})}this._mouseInit()},destroy:function(){this._mouseDestroy();var b=function(c){d(c).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};
if(this.elementIsWrapper){b(this.element);var a=this.element;a.after(this.originalElement.css({position:a.css("position"),width:a.outerWidth(),height:a.outerHeight(),top:a.css("top"),left:a.css("left")})).remove()}this.originalElement.css("resize",this.originalResizeStyle);b(this.originalElement);return this},_mouseCapture:function(b){var a=false;for(var c in this.handles)if(d(this.handles[c])[0]==b.target)a=true;return!this.options.disabled&&a},_mouseStart:function(b){var a=this.options,c=this.element.position(),
e=this.element;this.resizing=true;this.documentScroll={top:d(document).scrollTop(),left:d(document).scrollLeft()};if(e.is(".ui-draggable")||/absolute/.test(e.css("position")))e.css({position:"absolute",top:c.top,left:c.left});d.browser.opera&&/relative/.test(e.css("position"))&&e.css({position:"relative",top:"auto",left:"auto"});this._renderProxy();c=m(this.helper.css("left"));var g=m(this.helper.css("top"));if(a.containment){c+=d(a.containment).scrollLeft()||0;g+=d(a.containment).scrollTop()||0}this.offset=
this.helper.offset();this.position={left:c,top:g};this.size=this._helper?{width:e.outerWidth(),height:e.outerHeight()}:{width:e.width(),height:e.height()};this.originalSize=this._helper?{width:e.outerWidth(),height:e.outerHeight()}:{width:e.width(),height:e.height()};this.originalPosition={left:c,top:g};this.sizeDiff={width:e.outerWidth()-e.width(),height:e.outerHeight()-e.height()};this.originalMousePosition={left:b.pageX,top:b.pageY};this.aspectRatio=typeof a.aspectRatio=="number"?a.aspectRatio:
this.originalSize.width/this.originalSize.height||1;a=d(".ui-resizable-"+this.axis).css("cursor");d("body").css("cursor",a=="auto"?this.axis+"-resize":a);e.addClass("ui-resizable-resizing");this._propagate("start",b);return true},_mouseDrag:function(b){var a=this.helper,c=this.originalMousePosition,e=this._change[this.axis];if(!e)return false;c=e.apply(this,[b,b.pageX-c.left||0,b.pageY-c.top||0]);if(this._aspectRatio||b.shiftKey)c=this._updateRatio(c,b);c=this._respectSize(c,b);this._propagate("resize",
b);a.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"});!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize();this._updateCache(c);this._trigger("resize",b,this.ui());return false},_mouseStop:function(b){this.resizing=false;var a=this.options,c=this;if(this._helper){var e=this._proportionallyResizeElements,g=e.length&&/textarea/i.test(e[0].nodeName);e=g&&d.ui.hasScroll(e[0],"left")?0:c.sizeDiff.height;
g={width:c.size.width-(g?0:c.sizeDiff.width),height:c.size.height-e};e=parseInt(c.element.css("left"),10)+(c.position.left-c.originalPosition.left)||null;var f=parseInt(c.element.css("top"),10)+(c.position.top-c.originalPosition.top)||null;a.animate||this.element.css(d.extend(g,{top:f,left:e}));c.helper.height(c.size.height);c.helper.width(c.size.width);this._helper&&!a.animate&&this._proportionallyResize()}d("body").css("cursor","auto");this.element.removeClass("ui-resizable-resizing");this._propagate("stop",
b);this._helper&&this.helper.remove();return false},_updateCache:function(b){this.offset=this.helper.offset();if(k(b.left))this.position.left=b.left;if(k(b.top))this.position.top=b.top;if(k(b.height))this.size.height=b.height;if(k(b.width))this.size.width=b.width},_updateRatio:function(b){var a=this.position,c=this.size,e=this.axis;if(b.height)b.width=c.height*this.aspectRatio;else if(b.width)b.height=c.width/this.aspectRatio;if(e=="sw"){b.left=a.left+(c.width-b.width);b.top=null}if(e=="nw"){b.top=
a.top+(c.height-b.height);b.left=a.left+(c.width-b.width)}return b},_respectSize:function(b){var a=this.options,c=this.axis,e=k(b.width)&&a.maxWidth&&a.maxWidth<b.width,g=k(b.height)&&a.maxHeight&&a.maxHeight<b.height,f=k(b.width)&&a.minWidth&&a.minWidth>b.width,h=k(b.height)&&a.minHeight&&a.minHeight>b.height;if(f)b.width=a.minWidth;if(h)b.height=a.minHeight;if(e)b.width=a.maxWidth;if(g)b.height=a.maxHeight;var i=this.originalPosition.left+this.originalSize.width,j=this.position.top+this.size.height,
l=/sw|nw|w/.test(c);c=/nw|ne|n/.test(c);if(f&&l)b.left=i-a.minWidth;if(e&&l)b.left=i-a.maxWidth;if(h&&c)b.top=j-a.minHeight;if(g&&c)b.top=j-a.maxHeight;if((a=!b.width&&!b.height)&&!b.left&&b.top)b.top=null;else if(a&&!b.top&&b.left)b.left=null;return b},_proportionallyResize:function(){if(this._proportionallyResizeElements.length)for(var b=this.helper||this.element,a=0;a<this._proportionallyResizeElements.length;a++){var c=this._proportionallyResizeElements[a];if(!this.borderDif){var e=[c.css("borderTopWidth"),
c.css("borderRightWidth"),c.css("borderBottomWidth"),c.css("borderLeftWidth")],g=[c.css("paddingTop"),c.css("paddingRight"),c.css("paddingBottom"),c.css("paddingLeft")];this.borderDif=d.map(e,function(f,h){f=parseInt(f,10)||0;h=parseInt(g[h],10)||0;return f+h})}d.browser.msie&&(d(b).is(":hidden")||d(b).parents(":hidden").length)||c.css({height:b.height()-this.borderDif[0]-this.borderDif[2]||0,width:b.width()-this.borderDif[1]-this.borderDif[3]||0})}},_renderProxy:function(){var b=this.options;this.elementOffset=
this.element.offset();if(this._helper){this.helper=this.helper||d('<div style="overflow:hidden;"></div>');var a=d.browser.msie&&d.browser.version<7,c=a?1:0;a=a?2:-1;this.helper.addClass(this._helper).css({width:this.element.outerWidth()+a,height:this.element.outerHeight()+a,position:"absolute",left:this.elementOffset.left-c+"px",top:this.elementOffset.top-c+"px",zIndex:++b.zIndex});this.helper.appendTo("body").disableSelection()}else this.helper=this.element},_change:{e:function(b,a){return{width:this.originalSize.width+
a}},w:function(b,a){return{left:this.originalPosition.left+a,width:this.originalSize.width-a}},n:function(b,a,c){return{top:this.originalPosition.top+c,height:this.originalSize.height-c}},s:function(b,a,c){return{height:this.originalSize.height+c}},se:function(b,a,c){return d.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},sw:function(b,a,c){return d.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[b,a,c]))},ne:function(b,a,c){return d.extend(this._change.n.apply(this,
arguments),this._change.e.apply(this,[b,a,c]))},nw:function(b,a,c){return d.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[b,a,c]))}},_propagate:function(b,a){d.ui.plugin.call(this,b,[a,this.ui()]);b!="resize"&&this._trigger(b,a,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}});d.extend(d.ui.resizable,
{version:"1.8.1"});d.ui.plugin.add("resizable","alsoResize",{start:function(){var b=d(this).data("resizable").options,a=function(c){d(c).each(function(){d(this).data("resizable-alsoresize",{width:parseInt(d(this).width(),10),height:parseInt(d(this).height(),10),left:parseInt(d(this).css("left"),10),top:parseInt(d(this).css("top"),10)})})};if(typeof b.alsoResize=="object"&&!b.alsoResize.parentNode)if(b.alsoResize.length){b.alsoResize=b.alsoResize[0];a(b.alsoResize)}else d.each(b.alsoResize,function(c){a(c)});
else a(b.alsoResize)},resize:function(){var b=d(this).data("resizable"),a=b.options,c=b.originalSize,e=b.originalPosition,g={height:b.size.height-c.height||0,width:b.size.width-c.width||0,top:b.position.top-e.top||0,left:b.position.left-e.left||0},f=function(h,i){d(h).each(function(){var j=d(this),l=d(this).data("resizable-alsoresize"),p={};d.each((i&&i.length?i:["width","height","top","left"])||["width","height","top","left"],function(n,o){if((n=(l[o]||0)+(g[o]||0))&&n>=0)p[o]=n||null});if(/relative/.test(j.css("position"))&&
d.browser.opera){b._revertToRelativePosition=true;j.css({position:"absolute",top:"auto",left:"auto"})}j.css(p)})};typeof a.alsoResize=="object"&&!a.alsoResize.nodeType?d.each(a.alsoResize,function(h,i){f(h,i)}):f(a.alsoResize)},stop:function(){var b=d(this).data("resizable");if(b._revertToRelativePosition&&d.browser.opera){b._revertToRelativePosition=false;el.css({position:"relative"})}d(this).removeData("resizable-alsoresize-start")}});d.ui.plugin.add("resizable","animate",{stop:function(b){var a=
d(this).data("resizable"),c=a.options,e=a._proportionallyResizeElements,g=e.length&&/textarea/i.test(e[0].nodeName),f=g&&d.ui.hasScroll(e[0],"left")?0:a.sizeDiff.height;g={width:a.size.width-(g?0:a.sizeDiff.width),height:a.size.height-f};f=parseInt(a.element.css("left"),10)+(a.position.left-a.originalPosition.left)||null;var h=parseInt(a.element.css("top"),10)+(a.position.top-a.originalPosition.top)||null;a.element.animate(d.extend(g,h&&f?{top:h,left:f}:{}),{duration:c.animateDuration,easing:c.animateEasing,
step:function(){var i={width:parseInt(a.element.css("width"),10),height:parseInt(a.element.css("height"),10),top:parseInt(a.element.css("top"),10),left:parseInt(a.element.css("left"),10)};e&&e.length&&d(e[0]).css({width:i.width,height:i.height});a._updateCache(i);a._propagate("resize",b)}})}});d.ui.plugin.add("resizable","containment",{start:function(){var b=d(this).data("resizable"),a=b.element,c=b.options.containment;if(a=c instanceof d?c.get(0):/parent/.test(c)?a.parent().get(0):c){b.containerElement=
d(a);if(/document/.test(c)||c==document){b.containerOffset={left:0,top:0};b.containerPosition={left:0,top:0};b.parentData={element:d(document),left:0,top:0,width:d(document).width(),height:d(document).height()||document.body.parentNode.scrollHeight}}else{var e=d(a),g=[];d(["Top","Right","Left","Bottom"]).each(function(i,j){g[i]=m(e.css("padding"+j))});b.containerOffset=e.offset();b.containerPosition=e.position();b.containerSize={height:e.innerHeight()-g[3],width:e.innerWidth()-g[1]};c=b.containerOffset;
var f=b.containerSize.height,h=b.containerSize.width;h=d.ui.hasScroll(a,"left")?a.scrollWidth:h;f=d.ui.hasScroll(a)?a.scrollHeight:f;b.parentData={element:a,left:c.left,top:c.top,width:h,height:f}}}},resize:function(b){var a=d(this).data("resizable"),c=a.options,e=a.containerOffset,g=a.position;b=a._aspectRatio||b.shiftKey;var f={top:0,left:0},h=a.containerElement;if(h[0]!=document&&/static/.test(h.css("position")))f=e;if(g.left<(a._helper?e.left:0)){a.size.width+=a._helper?a.position.left-e.left:
a.position.left-f.left;if(b)a.size.height=a.size.width/c.aspectRatio;a.position.left=c.helper?e.left:0}if(g.top<(a._helper?e.top:0)){a.size.height+=a._helper?a.position.top-e.top:a.position.top;if(b)a.size.width=a.size.height*c.aspectRatio;a.position.top=a._helper?e.top:0}a.offset.left=a.parentData.left+a.position.left;a.offset.top=a.parentData.top+a.position.top;c=Math.abs((a._helper?a.offset.left-f.left:a.offset.left-f.left)+a.sizeDiff.width);e=Math.abs((a._helper?a.offset.top-f.top:a.offset.top-
e.top)+a.sizeDiff.height);g=a.containerElement.get(0)==a.element.parent().get(0);f=/relative|absolute/.test(a.containerElement.css("position"));if(g&&f)c-=a.parentData.left;if(c+a.size.width>=a.parentData.width){a.size.width=a.parentData.width-c;if(b)a.size.height=a.size.width/a.aspectRatio}if(e+a.size.height>=a.parentData.height){a.size.height=a.parentData.height-e;if(b)a.size.width=a.size.height*a.aspectRatio}},stop:function(){var b=d(this).data("resizable"),a=b.options,c=b.containerOffset,e=b.containerPosition,
g=b.containerElement,f=d(b.helper),h=f.offset(),i=f.outerWidth()-b.sizeDiff.width;f=f.outerHeight()-b.sizeDiff.height;b._helper&&!a.animate&&/relative/.test(g.css("position"))&&d(this).css({left:h.left-e.left-c.left,width:i,height:f});b._helper&&!a.animate&&/static/.test(g.css("position"))&&d(this).css({left:h.left-e.left-c.left,width:i,height:f})}});d.ui.plugin.add("resizable","ghost",{start:function(){var b=d(this).data("resizable"),a=b.options,c=b.size;b.ghost=b.originalElement.clone();b.ghost.css({opacity:0.25,
display:"block",position:"relative",height:c.height,width:c.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof a.ghost=="string"?a.ghost:"");b.ghost.appendTo(b.helper)},resize:function(){var b=d(this).data("resizable");b.ghost&&b.ghost.css({position:"relative",height:b.size.height,width:b.size.width})},stop:function(){var b=d(this).data("resizable");b.ghost&&b.helper&&b.helper.get(0).removeChild(b.ghost.get(0))}});d.ui.plugin.add("resizable","grid",{resize:function(){var b=
d(this).data("resizable"),a=b.options,c=b.size,e=b.originalSize,g=b.originalPosition,f=b.axis;a.grid=typeof a.grid=="number"?[a.grid,a.grid]:a.grid;var h=Math.round((c.width-e.width)/(a.grid[0]||1))*(a.grid[0]||1);a=Math.round((c.height-e.height)/(a.grid[1]||1))*(a.grid[1]||1);if(/^(se|s|e)$/.test(f)){b.size.width=e.width+h;b.size.height=e.height+a}else if(/^(ne)$/.test(f)){b.size.width=e.width+h;b.size.height=e.height+a;b.position.top=g.top-a}else{if(/^(sw)$/.test(f)){b.size.width=e.width+h;b.size.height=
e.height+a}else{b.size.width=e.width+h;b.size.height=e.height+a;b.position.top=g.top-a}b.position.left=g.left-h}}});var m=function(b){return parseInt(b,10)||0},k=function(b){return!isNaN(parseInt(b,10))}})(jQuery);
;/*
 * jQuery UI Selectable 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Selectables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(e){e.widget("ui.selectable",e.ui.mouse,{options:{appendTo:"body",autoRefresh:true,distance:0,filter:"*",tolerance:"touch"},_create:function(){var d=this;this.element.addClass("ui-selectable");this.dragged=false;var f;this.refresh=function(){f=e(d.options.filter,d.element[0]);f.each(function(){var c=e(this),b=c.offset();e.data(this,"selectable-item",{element:this,$element:c,left:b.left,top:b.top,right:b.left+c.outerWidth(),bottom:b.top+c.outerHeight(),startselected:false,selected:c.hasClass("ui-selected"),
selecting:c.hasClass("ui-selecting"),unselecting:c.hasClass("ui-unselecting")})})};this.refresh();this.selectees=f.addClass("ui-selectee");this._mouseInit();this.helper=e(document.createElement("div")).css({border:"1px dotted black"}).addClass("ui-selectable-helper")},destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item");this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable");this._mouseDestroy();return this},
_mouseStart:function(d){var f=this;this.opos=[d.pageX,d.pageY];if(!this.options.disabled){var c=this.options;this.selectees=e(c.filter,this.element[0]);this._trigger("start",d);e(c.appendTo).append(this.helper);this.helper.css({"z-index":100,position:"absolute",left:d.clientX,top:d.clientY,width:0,height:0});c.autoRefresh&&this.refresh();this.selectees.filter(".ui-selected").each(function(){var b=e.data(this,"selectable-item");b.startselected=true;if(!d.metaKey){b.$element.removeClass("ui-selected");
b.selected=false;b.$element.addClass("ui-unselecting");b.unselecting=true;f._trigger("unselecting",d,{unselecting:b.element})}});e(d.target).parents().andSelf().each(function(){var b=e.data(this,"selectable-item");if(b){b.$element.removeClass("ui-unselecting").addClass("ui-selecting");b.unselecting=false;b.selecting=true;b.selected=true;f._trigger("selecting",d,{selecting:b.element});return false}})}},_mouseDrag:function(d){var f=this;this.dragged=true;if(!this.options.disabled){var c=this.options,
b=this.opos[0],g=this.opos[1],h=d.pageX,i=d.pageY;if(b>h){var j=h;h=b;b=j}if(g>i){j=i;i=g;g=j}this.helper.css({left:b,top:g,width:h-b,height:i-g});this.selectees.each(function(){var a=e.data(this,"selectable-item");if(!(!a||a.element==f.element[0])){var k=false;if(c.tolerance=="touch")k=!(a.left>h||a.right<b||a.top>i||a.bottom<g);else if(c.tolerance=="fit")k=a.left>b&&a.right<h&&a.top>g&&a.bottom<i;if(k){if(a.selected){a.$element.removeClass("ui-selected");a.selected=false}if(a.unselecting){a.$element.removeClass("ui-unselecting");
a.unselecting=false}if(!a.selecting){a.$element.addClass("ui-selecting");a.selecting=true;f._trigger("selecting",d,{selecting:a.element})}}else{if(a.selecting)if(d.metaKey&&a.startselected){a.$element.removeClass("ui-selecting");a.selecting=false;a.$element.addClass("ui-selected");a.selected=true}else{a.$element.removeClass("ui-selecting");a.selecting=false;if(a.startselected){a.$element.addClass("ui-unselecting");a.unselecting=true}f._trigger("unselecting",d,{unselecting:a.element})}if(a.selected)if(!d.metaKey&&
!a.startselected){a.$element.removeClass("ui-selected");a.selected=false;a.$element.addClass("ui-unselecting");a.unselecting=true;f._trigger("unselecting",d,{unselecting:a.element})}}}});return false}},_mouseStop:function(d){var f=this;this.dragged=false;e(".ui-unselecting",this.element[0]).each(function(){var c=e.data(this,"selectable-item");c.$element.removeClass("ui-unselecting");c.unselecting=false;c.startselected=false;f._trigger("unselected",d,{unselected:c.element})});e(".ui-selecting",this.element[0]).each(function(){var c=
e.data(this,"selectable-item");c.$element.removeClass("ui-selecting").addClass("ui-selected");c.selecting=false;c.selected=true;c.startselected=true;f._trigger("selected",d,{selected:c.element})});this._trigger("stop",d);this.helper.remove();return false}});e.extend(e.ui.selectable,{version:"1.8.1"})})(jQuery);
;/*
 * jQuery UI Sortable 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.sortable",d.ui.mouse,{widgetEventPrefix:"sort",options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1E3},_create:function(){this.containerCache={};this.element.addClass("ui-sortable");
this.refresh();this.floating=this.items.length?/left|right/.test(this.items[0].item.css("float")):false;this.offset=this.element.offset();this._mouseInit()},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");this._mouseDestroy();for(var a=this.items.length-1;a>=0;a--)this.items[a].item.removeData("sortable-item");return this},_setOption:function(a,b){if(a==="disabled"){this.options[a]=b;this.widget()[b?"addClass":"removeClass"]("ui-sortable-disabled")}else d.Widget.prototype._setOption.apply(self,
arguments)},_mouseCapture:function(a,b){if(this.reverting)return false;if(this.options.disabled||this.options.type=="static")return false;this._refreshItems(a);var c=null,e=this;d(a.target).parents().each(function(){if(d.data(this,"sortable-item")==e){c=d(this);return false}});if(d.data(a.target,"sortable-item")==e)c=d(a.target);if(!c)return false;if(this.options.handle&&!b){var f=false;d(this.options.handle,c).find("*").andSelf().each(function(){if(this==a.target)f=true});if(!f)return false}this.currentItem=
c;this._removeCurrentsFromItems();return true},_mouseStart:function(a,b,c){b=this.options;var e=this;this.currentContainer=this;this.refreshPositions();this.helper=this._createHelper(a);this._cacheHelperProportions();this._cacheMargins();this.scrollParent=this.helper.scrollParent();this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");d.extend(this.offset,
{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};this.helper[0]!=this.currentItem[0]&&this.currentItem.hide();this._createPlaceholder();b.containment&&this._setContainment();
if(b.cursor){if(d("body").css("cursor"))this._storedCursor=d("body").css("cursor");d("body").css("cursor",b.cursor)}if(b.opacity){if(this.helper.css("opacity"))this._storedOpacity=this.helper.css("opacity");this.helper.css("opacity",b.opacity)}if(b.zIndex){if(this.helper.css("zIndex"))this._storedZIndex=this.helper.css("zIndex");this.helper.css("zIndex",b.zIndex)}if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML")this.overflowOffset=this.scrollParent.offset();this._trigger("start",
a,this._uiHash());this._preserveHelperProportions||this._cacheHelperProportions();if(!c)for(c=this.containers.length-1;c>=0;c--)this.containers[c]._trigger("activate",a,e._uiHash(this));if(d.ui.ddmanager)d.ui.ddmanager.current=this;d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(a);return true},_mouseDrag:function(a){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");
if(!this.lastPositionAbs)this.lastPositionAbs=this.positionAbs;if(this.options.scroll){var b=this.options,c=false;if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if(this.overflowOffset.top+this.scrollParent[0].offsetHeight-a.pageY<b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop+b.scrollSpeed;else if(a.pageY-this.overflowOffset.top<b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop-b.scrollSpeed;if(this.overflowOffset.left+
this.scrollParent[0].offsetWidth-a.pageX<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft+b.scrollSpeed;else if(a.pageX-this.overflowOffset.left<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft-b.scrollSpeed}else{if(a.pageY-d(document).scrollTop()<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()-b.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()+
b.scrollSpeed);if(a.pageX-d(document).scrollLeft()<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()-b.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()+b.scrollSpeed)}c!==false&&d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a)}this.positionAbs=this._convertPositionTo("absolute");if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+
"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";for(b=this.items.length-1;b>=0;b--){c=this.items[b];var e=c.item[0],f=this._intersectsWithPointer(c);if(f)if(e!=this.currentItem[0]&&this.placeholder[f==1?"next":"prev"]()[0]!=e&&!d.ui.contains(this.placeholder[0],e)&&(this.options.type=="semi-dynamic"?!d.ui.contains(this.element[0],e):true)){this.direction=f==1?"down":"up";if(this.options.tolerance=="pointer"||this._intersectsWithSides(c))this._rearrange(a,
c);else break;this._trigger("change",a,this._uiHash());break}}this._contactContainers(a);d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);this._trigger("sort",a,this._uiHash());this.lastPositionAbs=this.positionAbs;return false},_mouseStop:function(a,b){if(a){d.ui.ddmanager&&!this.options.dropBehaviour&&d.ui.ddmanager.drop(this,a);if(this.options.revert){var c=this;b=c.placeholder.offset();c.reverting=true;d(this.helper).animate({left:b.left-this.offset.parent.left-c.margins.left+(this.offsetParent[0]==
document.body?0:this.offsetParent[0].scrollLeft),top:b.top-this.offset.parent.top-c.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){c._clear(a)})}else this._clear(a,b);return false}},cancel:function(){var a=this;if(this.dragging){this._mouseUp();this.options.helper=="original"?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):this.currentItem.show();for(var b=this.containers.length-1;b>=0;b--){this.containers[b]._trigger("deactivate",
null,a._uiHash(this));if(this.containers[b].containerCache.over){this.containers[b]._trigger("out",null,a._uiHash(this));this.containers[b].containerCache.over=0}}}this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.options.helper!="original"&&this.helper&&this.helper[0].parentNode&&this.helper.remove();d.extend(this,{helper:null,dragging:false,reverting:false,_noFinalSort:null});this.domPosition.prev?d(this.domPosition.prev).after(this.currentItem):
d(this.domPosition.parent).prepend(this.currentItem);return this},serialize:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};d(b).each(function(){var e=(d(a.item||this).attr(a.attribute||"id")||"").match(a.expression||/(.+)[-=_](.+)/);if(e)c.push((a.key||e[1]+"[]")+"="+(a.key&&a.expression?e[1]:e[2]))});return c.join("&")},toArray:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};b.each(function(){c.push(d(a.item||this).attr(a.attribute||"id")||"")});return c},
_intersectsWith:function(a){var b=this.positionAbs.left,c=b+this.helperProportions.width,e=this.positionAbs.top,f=e+this.helperProportions.height,g=a.left,h=g+a.width,i=a.top,k=i+a.height,j=this.offset.click.top,l=this.offset.click.left;j=e+j>i&&e+j<k&&b+l>g&&b+l<h;return this.options.tolerance=="pointer"||this.options.forcePointerForContainers||this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>a[this.floating?"width":"height"]?j:g<b+this.helperProportions.width/
2&&c-this.helperProportions.width/2<h&&i<e+this.helperProportions.height/2&&f-this.helperProportions.height/2<k},_intersectsWithPointer:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left,a.width);b=b&&a;a=this._getDragVerticalDirection();var c=this._getDragHorizontalDirection();if(!b)return false;return this.floating?c&&c=="right"||a=="down"?2:1:a&&(a=="down"?2:1)},_intersectsWithSides:function(a){var b=
d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top+a.height/2,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left+a.width/2,a.width);var c=this._getDragVerticalDirection(),e=this._getDragHorizontalDirection();return this.floating&&e?e=="right"&&a||e=="left"&&!a:c&&(c=="down"&&b||c=="up"&&!b)},_getDragVerticalDirection:function(){var a=this.positionAbs.top-this.lastPositionAbs.top;return a!=0&&(a>0?"down":"up")},_getDragHorizontalDirection:function(){var a=
this.positionAbs.left-this.lastPositionAbs.left;return a!=0&&(a>0?"right":"left")},refresh:function(a){this._refreshItems(a);this.refreshPositions();return this},_connectWith:function(){var a=this.options;return a.connectWith.constructor==String?[a.connectWith]:a.connectWith},_getItemsAsjQuery:function(a){var b=[],c=[],e=this._connectWith();if(e&&a)for(a=e.length-1;a>=0;a--)for(var f=d(e[a]),g=f.length-1;g>=0;g--){var h=d.data(f[g],"sortable");if(h&&h!=this&&!h.options.disabled)c.push([d.isFunction(h.options.items)?
h.options.items.call(h.element):d(h.options.items,h.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),h])}c.push([d.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):d(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]);for(a=c.length-1;a>=0;a--)c[a][0].each(function(){b.push(this)});return d(b)},_removeCurrentsFromItems:function(){for(var a=this.currentItem.find(":data(sortable-item)"),
b=0;b<this.items.length;b++)for(var c=0;c<a.length;c++)a[c]==this.items[b].item[0]&&this.items.splice(b,1)},_refreshItems:function(a){this.items=[];this.containers=[this];var b=this.items,c=[[d.isFunction(this.options.items)?this.options.items.call(this.element[0],a,{item:this.currentItem}):d(this.options.items,this.element),this]],e=this._connectWith();if(e)for(var f=e.length-1;f>=0;f--)for(var g=d(e[f]),h=g.length-1;h>=0;h--){var i=d.data(g[h],"sortable");if(i&&i!=this&&!i.options.disabled){c.push([d.isFunction(i.options.items)?
i.options.items.call(i.element[0],a,{item:this.currentItem}):d(i.options.items,i.element),i]);this.containers.push(i)}}for(f=c.length-1;f>=0;f--){a=c[f][1];e=c[f][0];h=0;for(g=e.length;h<g;h++){i=d(e[h]);i.data("sortable-item",a);b.push({item:i,instance:a,width:0,height:0,left:0,top:0})}}},refreshPositions:function(a){if(this.offsetParent&&this.helper)this.offset.parent=this._getParentOffset();for(var b=this.items.length-1;b>=0;b--){var c=this.items[b],e=this.options.toleranceElement?d(this.options.toleranceElement,
c.item):c.item;if(!a){c.width=e.outerWidth();c.height=e.outerHeight()}e=e.offset();c.left=e.left;c.top=e.top}if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(b=this.containers.length-1;b>=0;b--){e=this.containers[b].element.offset();this.containers[b].containerCache.left=e.left;this.containers[b].containerCache.top=e.top;this.containers[b].containerCache.width=this.containers[b].element.outerWidth();this.containers[b].containerCache.height=
this.containers[b].element.outerHeight()}return this},_createPlaceholder:function(a){var b=a||this,c=b.options;if(!c.placeholder||c.placeholder.constructor==String){var e=c.placeholder;c.placeholder={element:function(){var f=d(document.createElement(b.currentItem[0].nodeName)).addClass(e||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];if(!e)f.style.visibility="hidden";return f},update:function(f,g){if(!(e&&!c.forcePlaceholderSize)){g.height()||g.height(b.currentItem.innerHeight()-
parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10));g.width()||g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||0,10))}}}}b.placeholder=d(c.placeholder.element.call(b.element,b.currentItem));b.currentItem.after(b.placeholder);c.placeholder.update(b,b.placeholder)},_contactContainers:function(a){for(var b=null,c=null,e=this.containers.length-1;e>=0;e--)if(!d.ui.contains(this.currentItem[0],
this.containers[e].element[0]))if(this._intersectsWith(this.containers[e].containerCache)){if(!(b&&d.ui.contains(this.containers[e].element[0],b.element[0]))){b=this.containers[e];c=e}}else if(this.containers[e].containerCache.over){this.containers[e]._trigger("out",a,this._uiHash(this));this.containers[e].containerCache.over=0}if(b)if(this.containers.length===1){this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}else if(this.currentContainer!=this.containers[c]){b=
1E4;e=null;for(var f=this.positionAbs[this.containers[c].floating?"left":"top"],g=this.items.length-1;g>=0;g--)if(d.ui.contains(this.containers[c].element[0],this.items[g].item[0])){var h=this.items[g][this.containers[c].floating?"left":"top"];if(Math.abs(h-f)<b){b=Math.abs(h-f);e=this.items[g]}}if(e||this.options.dropOnEmpty){this.currentContainer=this.containers[c];e?this._rearrange(a,e,null,true):this._rearrange(a,null,this.containers[c].element,true);this._trigger("change",a,this._uiHash());this.containers[c]._trigger("change",
a,this._uiHash(this));this.options.placeholder.update(this.currentContainer,this.placeholder);this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}}},_createHelper:function(a){var b=this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a,this.currentItem])):b.helper=="clone"?this.currentItem.clone():this.currentItem;a.parents("body").length||d(b.appendTo!="parent"?b.appendTo:this.currentItem[0].parentNode)[0].appendChild(a[0]);if(a[0]==
this.currentItem[0])this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")};if(a[0].style.width==""||b.forceHelperSize)a.width(this.currentItem.width());if(a[0].style.height==""||b.forceHelperSize)a.height(this.currentItem.height());return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||
0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],
this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.currentItem.position();return{top:a.top-
(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;
if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,d(a.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)){var b=
d(a.containment)[0];a=d(a.containment).offset();var c=d(b).css("overflow")!="hidden";this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0)-this.margins.left,a.top+(parseInt(d(b).css("borderTopWidth"),10)||0)+(parseInt(d(b).css("paddingTop"),10)||0)-this.margins.top,a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-
this.margins.left,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}},_convertPositionTo:function(a,b){if(!b)b=this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);return{top:b.top+
this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],
this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0]))this.offset.relative=this._getRelativeOffset();var f=a.pageX,g=a.pageY;if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0])f=this.containment[0]+this.offset.click.left;if(a.pageY-this.offset.click.top<this.containment[1])g=this.containment[1]+this.offset.click.top;
if(a.pageX-this.offset.click.left>this.containment[2])f=this.containment[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>this.containment[3])g=this.containment[3]+this.offset.click.top}if(b.grid){g=this.originalPageY+Math.round((g-this.originalPageY)/b.grid[1])*b.grid[1];g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;f=this.originalPageX+Math.round((f-
this.originalPageX)/b.grid[0])*b.grid[0];f=this.containment?!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:!(f-this.offset.click.left<this.containment[0])?f-b.grid[0]:f+b.grid[0]:f}}return{top:g-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+
(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())}},_rearrange:function(a,b,c,e){c?c[0].appendChild(this.placeholder[0]):b.item[0].parentNode.insertBefore(this.placeholder[0],this.direction=="down"?b.item[0]:b.item[0].nextSibling);this.counter=this.counter?++this.counter:1;var f=this,g=this.counter;window.setTimeout(function(){g==f.counter&&f.refreshPositions(!e)},0)},_clear:function(a,b){this.reverting=false;var c=[];!this._noFinalSort&&
this.currentItem[0].parentNode&&this.placeholder.before(this.currentItem);this._noFinalSort=null;if(this.helper[0]==this.currentItem[0]){for(var e in this._storedCSS)if(this._storedCSS[e]=="auto"||this._storedCSS[e]=="static")this._storedCSS[e]="";this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();this.fromOutside&&!b&&c.push(function(f){this._trigger("receive",f,this._uiHash(this.fromOutside))});if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||
this.domPosition.parent!=this.currentItem.parent()[0])&&!b)c.push(function(f){this._trigger("update",f,this._uiHash())});if(!d.ui.contains(this.element[0],this.currentItem[0])){b||c.push(function(f){this._trigger("remove",f,this._uiHash())});for(e=this.containers.length-1;e>=0;e--)if(d.ui.contains(this.containers[e].element[0],this.currentItem[0])&&!b){c.push(function(f){return function(g){f._trigger("receive",g,this._uiHash(this))}}.call(this,this.containers[e]));c.push(function(f){return function(g){f._trigger("update",
g,this._uiHash(this))}}.call(this,this.containers[e]))}}for(e=this.containers.length-1;e>=0;e--){b||c.push(function(f){return function(g){f._trigger("deactivate",g,this._uiHash(this))}}.call(this,this.containers[e]));if(this.containers[e].containerCache.over){c.push(function(f){return function(g){f._trigger("out",g,this._uiHash(this))}}.call(this,this.containers[e]));this.containers[e].containerCache.over=0}}this._storedCursor&&d("body").css("cursor",this._storedCursor);this._storedOpacity&&this.helper.css("opacity",
this._storedOpacity);if(this._storedZIndex)this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex);this.dragging=false;if(this.cancelHelperRemoval){if(!b){this._trigger("beforeStop",a,this._uiHash());for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}return false}b||this._trigger("beforeStop",a,this._uiHash());this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.helper[0]!=this.currentItem[0]&&this.helper.remove();this.helper=null;if(!b){for(e=
0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}this.fromOutside=false;return true},_trigger:function(){d.Widget.prototype._trigger.apply(this,arguments)===false&&this.cancel()},_uiHash:function(a){var b=a||this;return{helper:b.helper,placeholder:b.placeholder||d([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:a?a.element:null}}});d.extend(d.ui.sortable,{version:"1.8.1"})})(jQuery);
;/*
 * jQuery UI Accordion 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(c){c.widget("ui.accordion",{options:{active:0,animated:"slide",autoHeight:true,clearStyle:false,collapsible:false,event:"click",fillSpace:false,header:"> li > :first-child,> :not(li):even",icons:{header:"ui-icon-triangle-1-e",headerSelected:"ui-icon-triangle-1-s"},navigation:false,navigationFilter:function(){return this.href.toLowerCase()==location.href.toLowerCase()}},_create:function(){var a=this.options,b=this;this.running=0;this.element.addClass("ui-accordion ui-widget ui-helper-reset");
this.element[0].nodeName=="UL"&&this.element.children("li").addClass("ui-accordion-li-fix");this.headers=this.element.find(a.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all").bind("mouseenter.accordion",function(){c(this).addClass("ui-state-hover")}).bind("mouseleave.accordion",function(){c(this).removeClass("ui-state-hover")}).bind("focus.accordion",function(){c(this).addClass("ui-state-focus")}).bind("blur.accordion",function(){c(this).removeClass("ui-state-focus")});
this.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");if(a.navigation){var d=this.element.find("a").filter(a.navigationFilter);if(d.length){var f=d.closest(".ui-accordion-header");this.active=f.length?f:d.closest(".ui-accordion-content").prev()}}this.active=this._findActive(this.active||a.active).toggleClass("ui-state-default").toggleClass("ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");this.active.next().addClass("ui-accordion-content-active");
this._createIcons();this.resize();this.element.attr("role","tablist");this.headers.attr("role","tab").bind("keydown",function(g){return b._keydown(g)}).next().attr("role","tabpanel");this.headers.not(this.active||"").attr("aria-expanded","false").attr("tabIndex","-1").next().hide();this.active.length?this.active.attr("aria-expanded","true").attr("tabIndex","0"):this.headers.eq(0).attr("tabIndex","0");c.browser.safari||this.headers.find("a").attr("tabIndex","-1");a.event&&this.headers.bind(a.event+
".accordion",function(g){b._clickHandler.call(b,g,this);g.preventDefault()})},_createIcons:function(){var a=this.options;if(a.icons){c("<span/>").addClass("ui-icon "+a.icons.header).prependTo(this.headers);this.active.find(".ui-icon").toggleClass(a.icons.header).toggleClass(a.icons.headerSelected);this.element.addClass("ui-accordion-icons")}},_destroyIcons:function(){this.headers.children(".ui-icon").remove();this.element.removeClass("ui-accordion-icons")},destroy:function(){var a=this.options;this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role").unbind(".accordion").removeData("accordion");
this.headers.unbind(".accordion").removeClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("tabIndex");this.headers.find("a").removeAttr("tabIndex");this._destroyIcons();var b=this.headers.next().css("display","").removeAttr("role").removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active");if(a.autoHeight||a.fillHeight)b.css("height",
"");return this},_setOption:function(a,b){c.Widget.prototype._setOption.apply(this,arguments);a=="active"&&this.activate(b);if(a=="icons"){this._destroyIcons();b&&this._createIcons()}},_keydown:function(a){var b=c.ui.keyCode;if(!(this.options.disabled||a.altKey||a.ctrlKey)){var d=this.headers.length,f=this.headers.index(a.target),g=false;switch(a.keyCode){case b.RIGHT:case b.DOWN:g=this.headers[(f+1)%d];break;case b.LEFT:case b.UP:g=this.headers[(f-1+d)%d];break;case b.SPACE:case b.ENTER:this._clickHandler({target:a.target},
a.target);a.preventDefault()}if(g){c(a.target).attr("tabIndex","-1");c(g).attr("tabIndex","0");g.focus();return false}return true}},resize:function(){var a=this.options,b;if(a.fillSpace){if(c.browser.msie){var d=this.element.parent().css("overflow");this.element.parent().css("overflow","hidden")}b=this.element.parent().height();c.browser.msie&&this.element.parent().css("overflow",d);this.headers.each(function(){b-=c(this).outerHeight(true)});this.headers.next().each(function(){c(this).height(Math.max(0,
b-c(this).innerHeight()+c(this).height()))}).css("overflow","auto")}else if(a.autoHeight){b=0;this.headers.next().each(function(){b=Math.max(b,c(this).height())}).height(b)}return this},activate:function(a){this.options.active=a;a=this._findActive(a)[0];this._clickHandler({target:a},a);return this},_findActive:function(a){return a?typeof a=="number"?this.headers.filter(":eq("+a+")"):this.headers.not(this.headers.not(a)):a===false?c([]):this.headers.filter(":eq(0)")},_clickHandler:function(a,b){var d=
this.options;if(!d.disabled)if(a.target){a=c(a.currentTarget||b);b=a[0]==this.active[0];d.active=d.collapsible&&b?false:c(".ui-accordion-header",this.element).index(a);if(!(this.running||!d.collapsible&&b)){this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").find(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);if(!b){a.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top").find(".ui-icon").removeClass(d.icons.header).addClass(d.icons.headerSelected);
a.next().addClass("ui-accordion-content-active")}e=a.next();f=this.active.next();g={options:d,newHeader:b&&d.collapsible?c([]):a,oldHeader:this.active,newContent:b&&d.collapsible?c([]):e,oldContent:f};d=this.headers.index(this.active[0])>this.headers.index(a[0]);this.active=b?c([]):a;this._toggle(e,f,g,b,d)}}else if(d.collapsible){this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").find(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);
this.active.next().addClass("ui-accordion-content-active");var f=this.active.next(),g={options:d,newHeader:c([]),oldHeader:d.active,newContent:c([]),oldContent:f},e=this.active=c([]);this._toggle(e,f,g)}},_toggle:function(a,b,d,f,g){var e=this.options,k=this;this.toShow=a;this.toHide=b;this.data=d;var i=function(){if(k)return k._completed.apply(k,arguments)};this._trigger("changestart",null,this.data);this.running=b.size()===0?a.size():b.size();if(e.animated){d={};d=e.collapsible&&f?{toShow:c([]),
toHide:b,complete:i,down:g,autoHeight:e.autoHeight||e.fillSpace}:{toShow:a,toHide:b,complete:i,down:g,autoHeight:e.autoHeight||e.fillSpace};if(!e.proxied)e.proxied=e.animated;if(!e.proxiedDuration)e.proxiedDuration=e.duration;e.animated=c.isFunction(e.proxied)?e.proxied(d):e.proxied;e.duration=c.isFunction(e.proxiedDuration)?e.proxiedDuration(d):e.proxiedDuration;f=c.ui.accordion.animations;var h=e.duration,j=e.animated;if(j&&!f[j]&&!c.easing[j])j="slide";f[j]||(f[j]=function(l){this.slide(l,{easing:j,
duration:h||700})});f[j](d)}else{if(e.collapsible&&f)a.toggle();else{b.hide();a.show()}i(true)}b.prev().attr("aria-expanded","false").attr("tabIndex","-1").blur();a.prev().attr("aria-expanded","true").attr("tabIndex","0").focus()},_completed:function(a){var b=this.options;this.running=a?0:--this.running;if(!this.running){b.clearStyle&&this.toShow.add(this.toHide).css({height:"",overflow:""});this.toHide.removeClass("ui-accordion-content-active");this._trigger("change",null,this.data)}}});c.extend(c.ui.accordion,
{version:"1.8.1",animations:{slide:function(a,b){a=c.extend({easing:"swing",duration:300},a,b);if(a.toHide.size())if(a.toShow.size()){var d=a.toShow.css("overflow"),f=0,g={},e={},k;b=a.toShow;k=b[0].style.width;b.width(parseInt(b.parent().width(),10)-parseInt(b.css("paddingLeft"),10)-parseInt(b.css("paddingRight"),10)-(parseInt(b.css("borderLeftWidth"),10)||0)-(parseInt(b.css("borderRightWidth"),10)||0));c.each(["height","paddingTop","paddingBottom"],function(i,h){e[h]="hide";i=(""+c.css(a.toShow[0],
h)).match(/^([\d+-.]+)(.*)$/);g[h]={value:i[1],unit:i[2]||"px"}});a.toShow.css({height:0,overflow:"hidden"}).show();a.toHide.filter(":hidden").each(a.complete).end().filter(":visible").animate(e,{step:function(i,h){if(h.prop=="height")f=h.end-h.start===0?0:(h.now-h.start)/(h.end-h.start);a.toShow[0].style[h.prop]=f*g[h.prop].value+g[h.prop].unit},duration:a.duration,easing:a.easing,complete:function(){a.autoHeight||a.toShow.css("height","");a.toShow.css("width",k);a.toShow.css({overflow:d});a.complete()}})}else a.toHide.animate({height:"hide"},
a);else a.toShow.animate({height:"show"},a)},bounceslide:function(a){this.slide(a,{easing:a.down?"easeOutBounce":"swing",duration:a.down?1E3:200})}}})})(jQuery);
;/*
 * jQuery UI Autocomplete 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Autocomplete
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.position.js
 */
(function(e){e.widget("ui.autocomplete",{options:{minLength:1,delay:300},_create:function(){var a=this,b=this.element[0].ownerDocument;this.element.addClass("ui-autocomplete-input").attr("autocomplete","off").attr({role:"textbox","aria-autocomplete":"list","aria-haspopup":"true"}).bind("keydown.autocomplete",function(c){var d=e.ui.keyCode;switch(c.keyCode){case d.PAGE_UP:a._move("previousPage",c);break;case d.PAGE_DOWN:a._move("nextPage",c);break;case d.UP:a._move("previous",c);c.preventDefault();
break;case d.DOWN:a._move("next",c);c.preventDefault();break;case d.ENTER:a.menu.active&&c.preventDefault();case d.TAB:if(!a.menu.active)return;a.menu.select(c);break;case d.ESCAPE:a.element.val(a.term);a.close(c);break;case d.LEFT:case d.RIGHT:case d.SHIFT:case d.CONTROL:case d.ALT:break;default:clearTimeout(a.searching);a.searching=setTimeout(function(){a.search(null,c)},a.options.delay);break}}).bind("focus.autocomplete",function(){a.selectedItem=null;a.previous=a.element.val()}).bind("blur.autocomplete",
function(c){clearTimeout(a.searching);a.closing=setTimeout(function(){a.close(c);a._change(c)},150)});this._initSource();this.response=function(){return a._response.apply(a,arguments)};this.menu=e("<ul></ul>").addClass("ui-autocomplete").appendTo("body",b).menu({focus:function(c,d){d=d.item.data("item.autocomplete");false!==a._trigger("focus",null,{item:d})&&/^key/.test(c.originalEvent.type)&&a.element.val(d.value)},selected:function(c,d){d=d.item.data("item.autocomplete");false!==a._trigger("select",
c,{item:d})&&a.element.val(d.value);a.close(c);c=a.previous;if(a.element[0]!==b.activeElement){a.element.focus();a.previous=c}a.selectedItem=d},blur:function(){a.menu.element.is(":visible")&&a.element.val(a.term)}}).zIndex(this.element.zIndex()+1).css({top:0,left:0}).hide().data("menu");e.fn.bgiframe&&this.menu.element.bgiframe()},destroy:function(){this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");
this.menu.element.remove();e.Widget.prototype.destroy.call(this)},_setOption:function(a){e.Widget.prototype._setOption.apply(this,arguments);a==="source"&&this._initSource()},_initSource:function(){var a,b;if(e.isArray(this.options.source)){a=this.options.source;this.source=function(c,d){d(e.ui.autocomplete.filter(a,c.term))}}else if(typeof this.options.source==="string"){b=this.options.source;this.source=function(c,d){e.getJSON(b,c,d)}}else this.source=this.options.source},search:function(a,b){a=
a!=null?a:this.element.val();if(a.length<this.options.minLength)return this.close(b);clearTimeout(this.closing);if(this._trigger("search")!==false)return this._search(a)},_search:function(a){this.term=this.element.addClass("ui-autocomplete-loading").val();this.source({term:a},this.response)},_response:function(a){if(a.length){a=this._normalize(a);this._suggest(a);this._trigger("open")}else this.close();this.element.removeClass("ui-autocomplete-loading")},close:function(a){clearTimeout(this.closing);
if(this.menu.element.is(":visible")){this._trigger("close",a);this.menu.element.hide();this.menu.deactivate()}},_change:function(a){this.previous!==this.element.val()&&this._trigger("change",a,{item:this.selectedItem})},_normalize:function(a){if(a.length&&a[0].label&&a[0].value)return a;return e.map(a,function(b){if(typeof b==="string")return{label:b,value:b};return e.extend({label:b.label||b.value,value:b.value||b.label},b)})},_suggest:function(a){var b=this.menu.element.empty().zIndex(this.element.zIndex()+
1),c;this._renderMenu(b,a);this.menu.deactivate();this.menu.refresh();this.menu.element.show().position({my:"left top",at:"left bottom",of:this.element,collision:"none"});a=b.width("").width();c=this.element.width();b.width(Math.max(a,c))},_renderMenu:function(a,b){var c=this;e.each(b,function(d,f){c._renderItem(a,f)})},_renderItem:function(a,b){return e("<li></li>").data("item.autocomplete",b).append("<a>"+b.label+"</a>").appendTo(a)},_move:function(a,b){if(this.menu.element.is(":visible"))if(this.menu.first()&&
/^previous/.test(a)||this.menu.last()&&/^next/.test(a)){this.element.val(this.term);this.menu.deactivate()}else this.menu[a](b);else this.search(null,b)},widget:function(){return this.menu.element}});e.extend(e.ui.autocomplete,{escapeRegex:function(a){return a.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")},filter:function(a,b){var c=new RegExp(e.ui.autocomplete.escapeRegex(b),"i");return e.grep(a,function(d){return c.test(d.label||d.value||d)})}})})(jQuery);
(function(e){e.widget("ui.menu",{_create:function(){var a=this;this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({role:"listbox","aria-activedescendant":"ui-active-menuitem"}).click(function(b){if(e(b.target).closest(".ui-menu-item a").length){b.preventDefault();a.select(b)}});this.refresh()},refresh:function(){var a=this;this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role","menuitem").children("a").addClass("ui-corner-all").attr("tabindex",
-1).mouseenter(function(b){a.activate(b,e(this).parent())}).mouseleave(function(){a.deactivate()})},activate:function(a,b){this.deactivate();if(this.hasScroll()){var c=b.offset().top-this.element.offset().top,d=this.element.attr("scrollTop"),f=this.element.height();if(c<0)this.element.attr("scrollTop",d+c);else c>f&&this.element.attr("scrollTop",d+c-f+b.height())}this.active=b.eq(0).children("a").addClass("ui-state-hover").attr("id","ui-active-menuitem").end();this._trigger("focus",a,{item:b})},deactivate:function(){if(this.active){this.active.children("a").removeClass("ui-state-hover").removeAttr("id");
this._trigger("blur");this.active=null}},next:function(a){this.move("next",".ui-menu-item:first",a)},previous:function(a){this.move("prev",".ui-menu-item:last",a)},first:function(){return this.active&&!this.active.prev().length},last:function(){return this.active&&!this.active.next().length},move:function(a,b,c){if(this.active){a=this.active[a+"All"](".ui-menu-item").eq(0);a.length?this.activate(c,a):this.activate(c,this.element.children(b))}else this.activate(c,this.element.children(b))},nextPage:function(a){if(this.hasScroll())if(!this.active||
this.last())this.activate(a,this.element.children(":first"));else{var b=this.active.offset().top,c=this.element.height(),d=this.element.children("li").filter(function(){var f=e(this).offset().top-b-c+e(this).height();return f<10&&f>-10});d.length||(d=this.element.children(":last"));this.activate(a,d)}else this.activate(a,this.element.children(!this.active||this.last()?":first":":last"))},previousPage:function(a){if(this.hasScroll())if(!this.active||this.first())this.activate(a,this.element.children(":last"));
else{var b=this.active.offset().top,c=this.element.height();result=this.element.children("li").filter(function(){var d=e(this).offset().top-b+c-e(this).height();return d<10&&d>-10});result.length||(result=this.element.children(":first"));this.activate(a,result)}else this.activate(a,this.element.children(!this.active||this.first()?":last":":first"))},hasScroll:function(){return this.element.height()<this.element.attr("scrollHeight")},select:function(a){this._trigger("selected",a,{item:this.active})}})})(jQuery);
;/*
 * jQuery UI Button 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Button
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(a){var g,i=function(b){a(":ui-button",b.target.form).each(function(){var c=a(this).data("button");setTimeout(function(){c.refresh()},1)})},h=function(b){var c=b.name,d=b.form,e=a([]);if(c)e=d?a(d).find("[name='"+c+"']"):a("[name='"+c+"']",b.ownerDocument).filter(function(){return!this.form});return e};a.widget("ui.button",{options:{text:true,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",i);this._determineButtonType();
this.hasTitle=!!this.buttonElement.attr("title");var b=this,c=this.options,d=this.type==="checkbox"||this.type==="radio",e="ui-state-hover"+(!d?" ui-state-active":"");if(c.label===null)c.label=this.buttonElement.html();if(this.element.is(":disabled"))c.disabled=true;this.buttonElement.addClass("ui-button ui-widget ui-state-default ui-corner-all").attr("role","button").bind("mouseenter.button",function(){if(!c.disabled){a(this).addClass("ui-state-hover");this===g&&a(this).addClass("ui-state-active")}}).bind("mouseleave.button",
function(){c.disabled||a(this).removeClass(e)}).bind("focus.button",function(){a(this).addClass("ui-state-focus")}).bind("blur.button",function(){a(this).removeClass("ui-state-focus")});d&&this.element.bind("change.button",function(){b.refresh()});if(this.type==="checkbox")this.buttonElement.bind("click.button",function(){if(c.disabled)return false;a(this).toggleClass("ui-state-active");b.buttonElement.attr("aria-pressed",b.element[0].checked)});else if(this.type==="radio")this.buttonElement.bind("click.button",
function(){if(c.disabled)return false;a(this).addClass("ui-state-active");b.buttonElement.attr("aria-pressed",true);var f=b.element[0];h(f).not(f).map(function(){return a(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed",false)});else{this.buttonElement.bind("mousedown.button",function(){if(c.disabled)return false;a(this).addClass("ui-state-active");g=this;a(document).one("mouseup",function(){g=null})}).bind("mouseup.button",function(){if(c.disabled)return false;a(this).removeClass("ui-state-active")}).bind("keydown.button",
function(f){if(c.disabled)return false;if(f.keyCode==a.ui.keyCode.SPACE||f.keyCode==a.ui.keyCode.ENTER)a(this).addClass("ui-state-active")}).bind("keyup.button",function(){a(this).removeClass("ui-state-active")});this.buttonElement.is("a")&&this.buttonElement.keyup(function(f){f.keyCode===a.ui.keyCode.SPACE&&a(this).click()})}this._setOption("disabled",c.disabled)},_determineButtonType:function(){this.type=this.element.is(":checkbox")?"checkbox":this.element.is(":radio")?"radio":this.element.is("input")?
"input":"button";if(this.type==="checkbox"||this.type==="radio"){this.buttonElement=this.element.parents().last().find("[for="+this.element.attr("id")+"]");this.element.addClass("ui-helper-hidden-accessible");var b=this.element.is(":checked");b&&this.buttonElement.addClass("ui-state-active");this.buttonElement.attr("aria-pressed",b)}else this.buttonElement=this.element},widget:function(){return this.buttonElement},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible");this.buttonElement.removeClass("ui-button ui-widget ui-state-default ui-corner-all ui-state-hover ui-state-active ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon ui-button-text-only").removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());
this.hasTitle||this.buttonElement.removeAttr("title");a.Widget.prototype.destroy.call(this)},_setOption:function(b,c){a.Widget.prototype._setOption.apply(this,arguments);if(b==="disabled")c?this.element.attr("disabled",true):this.element.removeAttr("disabled");this._resetButton()},refresh:function(){var b=this.element.is(":disabled");b!==this.options.disabled&&this._setOption("disabled",b);if(this.type==="radio")h(this.element[0]).each(function(){a(this).is(":checked")?a(this).button("widget").addClass("ui-state-active").attr("aria-pressed",
true):a(this).button("widget").removeClass("ui-state-active").attr("aria-pressed",false)});else if(this.type==="checkbox")this.element.is(":checked")?this.buttonElement.addClass("ui-state-active").attr("aria-pressed",true):this.buttonElement.removeClass("ui-state-active").attr("aria-pressed",false)},_resetButton:function(){if(this.type==="input")this.options.label&&this.element.val(this.options.label);else{var b=this.buttonElement,c=a("<span></span>").addClass("ui-button-text").html(this.options.label).appendTo(b.empty()).text(),
d=this.options.icons,e=d.primary&&d.secondary;if(d.primary||d.secondary){b.addClass("ui-button-text-icon"+(e?"s":""));d.primary&&b.prepend("<span class='ui-button-icon-primary ui-icon "+d.primary+"'></span>");d.secondary&&b.append("<span class='ui-button-icon-secondary ui-icon "+d.secondary+"'></span>");if(!this.options.text){b.addClass(e?"ui-button-icons-only":"ui-button-icon-only").removeClass("ui-button-text-icons ui-button-text-icon");this.hasTitle||b.attr("title",c)}}else b.addClass("ui-button-text-only")}}});
a.widget("ui.buttonset",{_create:function(){this.element.addClass("ui-buttonset");this._init()},_init:function(){this.refresh()},_setOption:function(b,c){b==="disabled"&&this.buttons.button("option",b,c);a.Widget.prototype._setOption.apply(this,arguments)},refresh:function(){this.buttons=this.element.find(":button, :submit, :reset, :checkbox, :radio, a, :data(button)").filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return a(this).button("widget")[0]}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass("ui-corner-left").end().filter(":last").addClass("ui-corner-right").end().end()},
destroy:function(){this.element.removeClass("ui-buttonset");this.buttons.map(function(){return a(this).button("widget")[0]}).removeClass("ui-corner-left ui-corner-right").end().button("destroy");a.Widget.prototype.destroy.call(this)}})})(jQuery);
;/*
 * jQuery UI Dialog 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
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
(function(c){c.widget("ui.dialog",{options:{autoOpen:true,buttons:{},closeOnEscape:true,closeText:"close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:false,maxWidth:false,minHeight:150,minWidth:150,modal:false,position:"center",resizable:true,show:null,stack:true,title:"",width:300,zIndex:1E3},_create:function(){this.originalTitle=this.element.attr("title");var a=this,b=a.options,d=b.title||a.originalTitle||"&#160;",e=c.ui.dialog.getTitleId(a.element),g=(a.uiDialog=c("<div></div>")).appendTo(document.body).hide().addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+
b.dialogClass).css({zIndex:b.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(i){if(b.closeOnEscape&&i.keyCode&&i.keyCode===c.ui.keyCode.ESCAPE){a.close(i);i.preventDefault()}}).attr({role:"dialog","aria-labelledby":e}).mousedown(function(i){a.moveToTop(false,i)});a.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(g);var f=(a.uiDialogTitlebar=c("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(g),
h=c('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){h.addClass("ui-state-hover")},function(){h.removeClass("ui-state-hover")}).focus(function(){h.addClass("ui-state-focus")}).blur(function(){h.removeClass("ui-state-focus")}).click(function(i){a.close(i);return false}).appendTo(f);(a.uiDialogTitlebarCloseText=c("<span></span>")).addClass("ui-icon ui-icon-closethick").text(b.closeText).appendTo(h);c("<span></span>").addClass("ui-dialog-title").attr("id",
e).html(d).prependTo(f);if(c.isFunction(b.beforeclose)&&!c.isFunction(b.beforeClose))b.beforeClose=b.beforeclose;f.find("*").add(f).disableSelection();b.draggable&&c.fn.draggable&&a._makeDraggable();b.resizable&&c.fn.resizable&&a._makeResizable();a._createButtons(b.buttons);a._isOpen=false;c.fn.bgiframe&&g.bgiframe()},_init:function(){this.options.autoOpen&&this.open()},destroy:function(){var a=this;a.overlay&&a.overlay.destroy();a.uiDialog.hide();a.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");
a.uiDialog.remove();a.originalTitle&&a.element.attr("title",a.originalTitle);return a},widget:function(){return this.uiDialog},close:function(a){var b=this,d;if(false!==b._trigger("beforeClose",a)){b.overlay&&b.overlay.destroy();b.uiDialog.unbind("keypress.ui-dialog");b._isOpen=false;if(b.options.hide)b.uiDialog.hide(b.options.hide,function(){b._trigger("close",a)});else{b.uiDialog.hide();b._trigger("close",a)}c.ui.dialog.overlay.resize();if(b.options.modal){d=0;c(".ui-dialog").each(function(){if(this!==
b.uiDialog[0])d=Math.max(d,c(this).css("z-index"))});c.ui.dialog.maxZ=d}return b}},isOpen:function(){return this._isOpen},moveToTop:function(a,b){var d=this,e=d.options;if(e.modal&&!a||!e.stack&&!e.modal)return d._trigger("focus",b);if(e.zIndex>c.ui.dialog.maxZ)c.ui.dialog.maxZ=e.zIndex;if(d.overlay){c.ui.dialog.maxZ+=1;d.overlay.$el.css("z-index",c.ui.dialog.overlay.maxZ=c.ui.dialog.maxZ)}a={scrollTop:d.element.attr("scrollTop"),scrollLeft:d.element.attr("scrollLeft")};c.ui.dialog.maxZ+=1;d.uiDialog.css("z-index",
c.ui.dialog.maxZ);d.element.attr(a);d._trigger("focus",b);return d},open:function(){if(!this._isOpen){var a=this,b=a.options,d=a.uiDialog;a.overlay=b.modal?new c.ui.dialog.overlay(a):null;d.next().length&&d.appendTo("body");a._size();a._position(b.position);d.show(b.show);a.moveToTop(true);b.modal&&d.bind("keypress.ui-dialog",function(e){if(e.keyCode===c.ui.keyCode.TAB){var g=c(":tabbable",this),f=g.filter(":first");g=g.filter(":last");if(e.target===g[0]&&!e.shiftKey){f.focus(1);return false}else if(e.target===
f[0]&&e.shiftKey){g.focus(1);return false}}});c([]).add(d.find(".ui-dialog-content :tabbable:first")).add(d.find(".ui-dialog-buttonpane :tabbable:first")).add(d).filter(":first").focus();a._trigger("open");a._isOpen=true;return a}},_createButtons:function(a){var b=this,d=false,e=c("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix");b.uiDialog.find(".ui-dialog-buttonpane").remove();typeof a==="object"&&a!==null&&c.each(a,function(){return!(d=true)});if(d){c.each(a,
function(g,f){g=c('<button type="button"></button>').text(g).click(function(){f.apply(b.element[0],arguments)}).appendTo(e);c.fn.button&&g.button()});e.appendTo(b.uiDialog)}},_makeDraggable:function(){function a(f){return{position:f.position,offset:f.offset}}var b=this,d=b.options,e=c(document),g;b.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",handle:".ui-dialog-titlebar",containment:"document",start:function(f,h){g=d.height==="auto"?"auto":c(this).height();c(this).height(c(this).height()).addClass("ui-dialog-dragging");
b._trigger("dragStart",f,a(h))},drag:function(f,h){b._trigger("drag",f,a(h))},stop:function(f,h){d.position=[h.position.left-e.scrollLeft(),h.position.top-e.scrollTop()];c(this).removeClass("ui-dialog-dragging").height(g);b._trigger("dragStop",f,a(h));c.ui.dialog.overlay.resize()}})},_makeResizable:function(a){function b(f){return{originalPosition:f.originalPosition,originalSize:f.originalSize,position:f.position,size:f.size}}a=a===undefined?this.options.resizable:a;var d=this,e=d.options,g=d.uiDialog.css("position");
a=typeof a==="string"?a:"n,e,s,w,se,sw,ne,nw";d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:e.maxWidth,maxHeight:e.maxHeight,minWidth:e.minWidth,minHeight:d._minHeight(),handles:a,start:function(f,h){c(this).addClass("ui-dialog-resizing");d._trigger("resizeStart",f,b(h))},resize:function(f,h){d._trigger("resize",f,b(h))},stop:function(f,h){c(this).removeClass("ui-dialog-resizing");e.height=c(this).height();e.width=c(this).width();d._trigger("resizeStop",
f,b(h));c.ui.dialog.overlay.resize()}}).css("position",g).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var a=this.options;return a.height==="auto"?a.minHeight:Math.min(a.minHeight,a.height)},_position:function(a){var b=[],d=[0,0];a=a||c.ui.dialog.prototype.options.position;if(typeof a==="string"||typeof a==="object"&&"0"in a){b=a.split?a.split(" "):[a[0],a[1]];if(b.length===1)b[1]=b[0];c.each(["left","top"],function(e,g){if(+b[e]===b[e]){d[e]=b[e];b[e]=
g}})}else if(typeof a==="object"){if("left"in a){b[0]="left";d[0]=a.left}else if("right"in a){b[0]="right";d[0]=-a.right}if("top"in a){b[1]="top";d[1]=a.top}else if("bottom"in a){b[1]="bottom";d[1]=-a.bottom}}(a=this.uiDialog.is(":visible"))||this.uiDialog.show();this.uiDialog.css({top:0,left:0}).position({my:b.join(" "),at:b.join(" "),offset:d.join(" "),of:window,collision:"fit",using:function(e){var g=c(this).css(e).offset().top;g<0&&c(this).css("top",e.top-g)}});a||this.uiDialog.hide()},_setOption:function(a,
b){var d=this,e=d.uiDialog,g=e.is(":data(resizable)"),f=false;switch(a){case "beforeclose":a="beforeClose";break;case "buttons":d._createButtons(b);break;case "closeText":d.uiDialogTitlebarCloseText.text(""+b);break;case "dialogClass":e.removeClass(d.options.dialogClass).addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+b);break;case "disabled":b?e.addClass("ui-dialog-disabled"):e.removeClass("ui-dialog-disabled");break;case "draggable":b?d._makeDraggable():e.draggable("destroy");break;
case "height":f=true;break;case "maxHeight":g&&e.resizable("option","maxHeight",b);f=true;break;case "maxWidth":g&&e.resizable("option","maxWidth",b);f=true;break;case "minHeight":g&&e.resizable("option","minHeight",b);f=true;break;case "minWidth":g&&e.resizable("option","minWidth",b);f=true;break;case "position":d._position(b);break;case "resizable":g&&!b&&e.resizable("destroy");g&&typeof b==="string"&&e.resizable("option","handles",b);!g&&b!==false&&d._makeResizable(b);break;case "title":c(".ui-dialog-title",
d.uiDialogTitlebar).html(""+(b||"&#160;"));break;case "width":f=true;break}c.Widget.prototype._setOption.apply(d,arguments);f&&d._size()},_size:function(){var a=this.options,b;this.element.css({width:"auto",minHeight:0,height:0});b=this.uiDialog.css({height:"auto",width:a.width}).height();this.element.css(a.height==="auto"?{minHeight:Math.max(a.minHeight-b,0),height:"auto"}:{minHeight:0,height:Math.max(a.height-b,0)}).show();this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",
this._minHeight())}});c.extend(c.ui.dialog,{version:"1.8.1",uuid:0,maxZ:0,getTitleId:function(a){a=a.attr("id");if(!a){this.uuid+=1;a=this.uuid}return"ui-dialog-title-"+a},overlay:function(a){this.$el=c.ui.dialog.overlay.create(a)}});c.extend(c.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:c.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(a){return a+".dialog-overlay"}).join(" "),create:function(a){if(this.instances.length===0){setTimeout(function(){c.ui.dialog.overlay.instances.length&&
c(document).bind(c.ui.dialog.overlay.events,function(d){return c(d.target).zIndex()>=c.ui.dialog.overlay.maxZ})},1);c(document).bind("keydown.dialog-overlay",function(d){if(a.options.closeOnEscape&&d.keyCode&&d.keyCode===c.ui.keyCode.ESCAPE){a.close(d);d.preventDefault()}});c(window).bind("resize.dialog-overlay",c.ui.dialog.overlay.resize)}var b=(this.oldInstances.pop()||c("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),height:this.height()});c.fn.bgiframe&&
b.bgiframe();this.instances.push(b);return b},destroy:function(a){this.oldInstances.push(this.instances.splice(c.inArray(a,this.instances),1)[0]);this.instances.length===0&&c([document,window]).unbind(".dialog-overlay");a.remove();var b=0;c.each(this.instances,function(){b=Math.max(b,this.css("z-index"))});this.maxZ=b},height:function(){var a,b;if(c.browser.msie&&c.browser.version<7){a=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);b=Math.max(document.documentElement.offsetHeight,
document.body.offsetHeight);return a<b?c(window).height()+"px":a+"px"}else return c(document).height()+"px"},width:function(){var a,b;if(c.browser.msie&&c.browser.version<7){a=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);b=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth);return a<b?c(window).width()+"px":a+"px"}else return c(document).width()+"px"},resize:function(){var a=c([]);c.each(c.ui.dialog.overlay.instances,function(){a=a.add(this)});a.css({width:0,
height:0}).css({width:c.ui.dialog.overlay.width(),height:c.ui.dialog.overlay.height()})}});c.extend(c.ui.dialog.overlay.prototype,{destroy:function(){c.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);
;/*
 * jQuery UI Slider 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
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
else{d(".ui-slider .ui-state-focus").removeClass("ui-state-focus");d(this).addClass("ui-state-focus")}}).blur(function(){d(this).removeClass("ui-state-focus")});this.handles.each(function(c){d(this).data("index.ui-slider-handle",c)});this.handles.keydown(function(c){var e=true,f=d(this).data("index.ui-slider-handle"),g,h,i;if(!b.options.disabled){switch(c.keyCode){case d.ui.keyCode.HOME:case d.ui.keyCode.END:case d.ui.keyCode.PAGE_UP:case d.ui.keyCode.PAGE_DOWN:case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:e=
false;if(!b._keySliding){b._keySliding=true;d(this).addClass("ui-state-active");g=b._start(c,f);if(g===false)return}break}i=b.options.step;g=b.options.values&&b.options.values.length?(h=b.values(f)):(h=b.value());switch(c.keyCode){case d.ui.keyCode.HOME:h=b._valueMin();break;case d.ui.keyCode.END:h=b._valueMax();break;case d.ui.keyCode.PAGE_UP:h=g+(b._valueMax()-b._valueMin())/5;break;case d.ui.keyCode.PAGE_DOWN:h=g-(b._valueMax()-b._valueMin())/5;break;case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:if(g===
b._valueMax())return;h=g+i;break;case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:if(g===b._valueMin())return;h=g-i;break}b._slide(c,f,h);return e}}).keyup(function(c){var e=d(this).data("index.ui-slider-handle");if(b._keySliding){b._keySliding=false;b._stop(c,e);b._change(c,e);d(this).removeClass("ui-state-active")}});this._refreshValue();this._animateOff=false},destroy:function(){this.handles.remove();this.range.remove();this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider");
this._mouseDestroy();return this},_mouseCapture:function(b){var a=this.options,c,e,f,g,h,i;if(a.disabled)return false;this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()};this.elementOffset=this.element.offset();c={x:b.pageX,y:b.pageY};e=this._normValueFromMouse(c);f=this._valueMax()-this._valueMin()+1;h=this;this.handles.each(function(j){var k=Math.abs(e-h.values(j));if(f>k){f=k;g=d(this);i=j}});if(a.range===true&&this.values(1)===a.min){i+=1;g=d(this.handles[i])}if(this._start(b,
i)===false)return false;this._mouseSliding=true;h._handleIndex=i;g.addClass("ui-state-active").focus();a=g.offset();this._clickOffset=!d(b.target).parents().andSelf().is(".ui-slider-handle")?{left:0,top:0}:{left:b.pageX-a.left-g.width()/2,top:b.pageY-a.top-g.height()/2-(parseInt(g.css("borderTopWidth"),10)||0)-(parseInt(g.css("borderBottomWidth"),10)||0)+(parseInt(g.css("marginTop"),10)||0)};e=this._normValueFromMouse(c);this._slide(b,i,e);return this._animateOff=true},_mouseStart:function(){return true},
_mouseDrag:function(b){var a=this._normValueFromMouse({x:b.pageX,y:b.pageY});this._slide(b,this._handleIndex,a);return false},_mouseStop:function(b){this.handles.removeClass("ui-state-active");this._mouseSliding=false;this._stop(b,this._handleIndex);this._change(b,this._handleIndex);this._clickOffset=this._handleIndex=null;return this._animateOff=false},_detectOrientation:function(){this.orientation=this.options.orientation==="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(b){var a;
if(this.orientation==="horizontal"){a=this.elementSize.width;b=b.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)}else{a=this.elementSize.height;b=b.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)}a=b/a;if(a>1)a=1;if(a<0)a=0;if(this.orientation==="vertical")a=1-a;b=this._valueMax()-this._valueMin();return this._trimAlignValue(this._valueMin()+a*b)},_start:function(b,a){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=
this.values(a);c.values=this.values()}return this._trigger("start",b,c)},_slide:function(b,a,c){var e;if(this.options.values&&this.options.values.length){e=this.values(a?0:1);if(this.options.values.length===2&&this.options.range===true&&(a===0&&c>e||a===1&&c<e))c=e;if(c!==this.values(a)){e=this.values();e[a]=c;b=this._trigger("slide",b,{handle:this.handles[a],value:c,values:e});this.values(a?0:1);b!==false&&this.values(a,c,true)}}else if(c!==this.value()){b=this._trigger("slide",b,{handle:this.handles[a],
value:c});b!==false&&this.value(c)}},_stop:function(b,a){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(a);c.values=this.values()}this._trigger("stop",b,c)},_change:function(b,a){if(!this._keySliding&&!this._mouseSliding){var c={handle:this.handles[a],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(a);c.values=this.values()}this._trigger("change",b,c)}},value:function(b){if(arguments.length){this.options.value=
this._trimAlignValue(b);this._refreshValue();this._change(null,0)}return this._value()},values:function(b,a){var c,e,f;if(arguments.length>1){this.options.values[b]=this._trimAlignValue(a);this._refreshValue();this._change(null,b)}if(arguments.length)if(d.isArray(arguments[0])){c=this.options.values;e=arguments[0];for(f=0;f<c.length;f+=1){c[f]=this._trimAlignValue(e[f]);this._change(null,f)}this._refreshValue()}else return this.options.values&&this.options.values.length?this._values(b):this.value();
else return this._values()},_setOption:function(b,a){var c,e=0;if(d.isArray(this.options.values))e=this.options.values.length;d.Widget.prototype._setOption.apply(this,arguments);switch(b){case "disabled":if(a){this.handles.filter(".ui-state-focus").blur();this.handles.removeClass("ui-state-hover");this.handles.attr("disabled","disabled");this.element.addClass("ui-disabled")}else{this.handles.removeAttr("disabled");this.element.removeClass("ui-disabled")}break;case "orientation":this._detectOrientation();
this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation);this._refreshValue();break;case "value":this._animateOff=true;this._refreshValue();this._change(null,0);this._animateOff=false;break;case "values":this._animateOff=true;this._refreshValue();for(c=0;c<e;c+=1)this._change(null,c);this._animateOff=false;break}},_value:function(){var b=this.options.value;return b=this._trimAlignValue(b)},_values:function(b){var a,c;if(arguments.length){a=this.options.values[b];
return a=this._trimAlignValue(a)}else{a=this.options.values.slice();for(c=0;c<a.length;c+=1)a[c]=this._trimAlignValue(a[c]);return a}},_trimAlignValue:function(b){if(b<this._valueMin())return this._valueMin();if(b>this._valueMax())return this._valueMax();var a=this.options.step,c=b%a;b=b-c;if(c>=a/2)b+=a;return parseFloat(b.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var b=this.options.range,a=this.options,c=this,
e=!this._animateOff?a.animate:false,f,g={},h,i,j,k;if(this.options.values&&this.options.values.length)this.handles.each(function(l){f=(c.values(l)-c._valueMin())/(c._valueMax()-c._valueMin())*100;g[c.orientation==="horizontal"?"left":"bottom"]=f+"%";d(this).stop(1,1)[e?"animate":"css"](g,a.animate);if(c.options.range===true)if(c.orientation==="horizontal"){if(l===0)c.range.stop(1,1)[e?"animate":"css"]({left:f+"%"},a.animate);if(l===1)c.range[e?"animate":"css"]({width:f-h+"%"},{queue:false,duration:a.animate})}else{if(l===
0)c.range.stop(1,1)[e?"animate":"css"]({bottom:f+"%"},a.animate);if(l===1)c.range[e?"animate":"css"]({height:f-h+"%"},{queue:false,duration:a.animate})}h=f});else{i=this.value();j=this._valueMin();k=this._valueMax();f=k!==j?(i-j)/(k-j)*100:0;g[c.orientation==="horizontal"?"left":"bottom"]=f+"%";this.handle.stop(1,1)[e?"animate":"css"](g,a.animate);if(b==="min"&&this.orientation==="horizontal")this.range.stop(1,1)[e?"animate":"css"]({width:f+"%"},a.animate);if(b==="max"&&this.orientation==="horizontal")this.range[e?
"animate":"css"]({width:100-f+"%"},{queue:false,duration:a.animate});if(b==="min"&&this.orientation==="vertical")this.range.stop(1,1)[e?"animate":"css"]({height:f+"%"},a.animate);if(b==="max"&&this.orientation==="vertical")this.range[e?"animate":"css"]({height:100-f+"%"},{queue:false,duration:a.animate})}}});d.extend(d.ui.slider,{version:"1.8.1"})})(jQuery);
;/*
 * jQuery UI Tabs 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(d){var s=0,u=0;d.widget("ui.tabs",{options:{add:null,ajaxOptions:null,cache:false,cookie:null,collapsible:false,disable:null,disabled:[],enable:null,event:"click",fx:null,idPrefix:"ui-tabs-",load:null,panelTemplate:"<div></div>",remove:null,select:null,show:null,spinner:"<em>Loading&#8230;</em>",tabTemplate:'<li><a href="#{href}"><span>#{label}</span></a></li>'},_create:function(){this._tabify(true)},_setOption:function(c,e){if(c=="selected")this.options.collapsible&&e==this.options.selected||
this.select(e);else{this.options[c]=e;this._tabify()}},_tabId:function(c){return c.title&&c.title.replace(/\s/g,"_").replace(/[^A-Za-z0-9\-_:\.]/g,"")||this.options.idPrefix+ ++s},_sanitizeSelector:function(c){return c.replace(/:/g,"\\:")},_cookie:function(){var c=this.cookie||(this.cookie=this.options.cookie.name||"ui-tabs-"+ ++u);return d.cookie.apply(null,[c].concat(d.makeArray(arguments)))},_ui:function(c,e){return{tab:c,panel:e,index:this.anchors.index(c)}},_cleanup:function(){this.lis.filter(".ui-state-processing").removeClass("ui-state-processing").find("span:data(label.tabs)").each(function(){var c=
d(this);c.html(c.data("label.tabs")).removeData("label.tabs")})},_tabify:function(c){function e(g,f){g.css({display:""});!d.support.opacity&&f.opacity&&g[0].style.removeAttribute("filter")}this.list=this.element.find("ol,ul").eq(0);this.lis=d("li:has(a[href])",this.list);this.anchors=this.lis.map(function(){return d("a",this)[0]});this.panels=d([]);var a=this,b=this.options,h=/^#.+/;this.anchors.each(function(g,f){var j=d(f).attr("href"),l=j.split("#")[0],p;if(l&&(l===location.toString().split("#")[0]||
(p=d("base")[0])&&l===p.href)){j=f.hash;f.href=j}if(h.test(j))a.panels=a.panels.add(a._sanitizeSelector(j));else if(j!="#"){d.data(f,"href.tabs",j);d.data(f,"load.tabs",j.replace(/#.*$/,""));j=a._tabId(f);f.href="#"+j;f=d("#"+j);if(!f.length){f=d(b.panelTemplate).attr("id",j).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").insertAfter(a.panels[g-1]||a.list);f.data("destroy.tabs",true)}a.panels=a.panels.add(f)}else b.disabled.push(g)});if(c){this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all");
this.list.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.lis.addClass("ui-state-default ui-corner-top");this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");if(b.selected===undefined){location.hash&&this.anchors.each(function(g,f){if(f.hash==location.hash){b.selected=g;return false}});if(typeof b.selected!="number"&&b.cookie)b.selected=parseInt(a._cookie(),10);if(typeof b.selected!="number"&&this.lis.filter(".ui-tabs-selected").length)b.selected=
this.lis.index(this.lis.filter(".ui-tabs-selected"));b.selected=b.selected||(this.lis.length?0:-1)}else if(b.selected===null)b.selected=-1;b.selected=b.selected>=0&&this.anchors[b.selected]||b.selected<0?b.selected:0;b.disabled=d.unique(b.disabled.concat(d.map(this.lis.filter(".ui-state-disabled"),function(g){return a.lis.index(g)}))).sort();d.inArray(b.selected,b.disabled)!=-1&&b.disabled.splice(d.inArray(b.selected,b.disabled),1);this.panels.addClass("ui-tabs-hide");this.lis.removeClass("ui-tabs-selected ui-state-active");
if(b.selected>=0&&this.anchors.length){this.panels.eq(b.selected).removeClass("ui-tabs-hide");this.lis.eq(b.selected).addClass("ui-tabs-selected ui-state-active");a.element.queue("tabs",function(){a._trigger("show",null,a._ui(a.anchors[b.selected],a.panels[b.selected]))});this.load(b.selected)}d(window).bind("unload",function(){a.lis.add(a.anchors).unbind(".tabs");a.lis=a.anchors=a.panels=null})}else b.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"));this.element[b.collapsible?"addClass":
"removeClass"]("ui-tabs-collapsible");b.cookie&&this._cookie(b.selected,b.cookie);c=0;for(var i;i=this.lis[c];c++)d(i)[d.inArray(c,b.disabled)!=-1&&!d(i).hasClass("ui-tabs-selected")?"addClass":"removeClass"]("ui-state-disabled");b.cache===false&&this.anchors.removeData("cache.tabs");this.lis.add(this.anchors).unbind(".tabs");if(b.event!="mouseover"){var k=function(g,f){f.is(":not(.ui-state-disabled)")&&f.addClass("ui-state-"+g)},n=function(g,f){f.removeClass("ui-state-"+g)};this.lis.bind("mouseover.tabs",
function(){k("hover",d(this))});this.lis.bind("mouseout.tabs",function(){n("hover",d(this))});this.anchors.bind("focus.tabs",function(){k("focus",d(this).closest("li"))});this.anchors.bind("blur.tabs",function(){n("focus",d(this).closest("li"))})}var m,o;if(b.fx)if(d.isArray(b.fx)){m=b.fx[0];o=b.fx[1]}else m=o=b.fx;var q=o?function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.hide().removeClass("ui-tabs-hide").animate(o,o.duration||"normal",function(){e(f,o);a._trigger("show",
null,a._ui(g,f[0]))})}:function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.removeClass("ui-tabs-hide");a._trigger("show",null,a._ui(g,f[0]))},r=m?function(g,f){f.animate(m,m.duration||"normal",function(){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");e(f,m);a.element.dequeue("tabs")})}:function(g,f){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");a.element.dequeue("tabs")};this.anchors.bind(b.event+".tabs",
function(){var g=this,f=d(this).closest("li"),j=a.panels.filter(":not(.ui-tabs-hide)"),l=d(a._sanitizeSelector(this.hash));if(f.hasClass("ui-tabs-selected")&&!b.collapsible||f.hasClass("ui-state-disabled")||f.hasClass("ui-state-processing")||a._trigger("select",null,a._ui(this,l[0]))===false){this.blur();return false}b.selected=a.anchors.index(this);a.abort();if(b.collapsible)if(f.hasClass("ui-tabs-selected")){b.selected=-1;b.cookie&&a._cookie(b.selected,b.cookie);a.element.queue("tabs",function(){r(g,
j)}).dequeue("tabs");this.blur();return false}else if(!j.length){b.cookie&&a._cookie(b.selected,b.cookie);a.element.queue("tabs",function(){q(g,l)});a.load(a.anchors.index(this));this.blur();return false}b.cookie&&a._cookie(b.selected,b.cookie);if(l.length){j.length&&a.element.queue("tabs",function(){r(g,j)});a.element.queue("tabs",function(){q(g,l)});a.load(a.anchors.index(this))}else throw"jQuery UI Tabs: Mismatching fragment identifier.";d.browser.msie&&this.blur()});this.anchors.bind("click.tabs",
function(){return false})},destroy:function(){var c=this.options;this.abort();this.element.unbind(".tabs").removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible").removeData("tabs");this.list.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.anchors.each(function(){var e=d.data(this,"href.tabs");if(e)this.href=e;var a=d(this).unbind(".tabs");d.each(["href","load","cache"],function(b,h){a.removeData(h+".tabs")})});this.lis.unbind(".tabs").add(this.panels).each(function(){d.data(this,
"destroy.tabs")?d(this).remove():d(this).removeClass("ui-state-default ui-corner-top ui-tabs-selected ui-state-active ui-state-hover ui-state-focus ui-state-disabled ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide")});c.cookie&&this._cookie(null,c.cookie);return this},add:function(c,e,a){if(a===undefined)a=this.anchors.length;var b=this,h=this.options;e=d(h.tabTemplate.replace(/#\{href\}/g,c).replace(/#\{label\}/g,e));c=!c.indexOf("#")?c.replace("#",""):this._tabId(d("a",e)[0]);e.addClass("ui-state-default ui-corner-top").data("destroy.tabs",
true);var i=d("#"+c);i.length||(i=d(h.panelTemplate).attr("id",c).data("destroy.tabs",true));i.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide");if(a>=this.lis.length){e.appendTo(this.list);i.appendTo(this.list[0].parentNode)}else{e.insertBefore(this.lis[a]);i.insertBefore(this.panels[a])}h.disabled=d.map(h.disabled,function(k){return k>=a?++k:k});this._tabify();if(this.anchors.length==1){h.selected=0;e.addClass("ui-tabs-selected ui-state-active");i.removeClass("ui-tabs-hide");
this.element.queue("tabs",function(){b._trigger("show",null,b._ui(b.anchors[0],b.panels[0]))});this.load(0)}this._trigger("add",null,this._ui(this.anchors[a],this.panels[a]));return this},remove:function(c){var e=this.options,a=this.lis.eq(c).remove(),b=this.panels.eq(c).remove();if(a.hasClass("ui-tabs-selected")&&this.anchors.length>1)this.select(c+(c+1<this.anchors.length?1:-1));e.disabled=d.map(d.grep(e.disabled,function(h){return h!=c}),function(h){return h>=c?--h:h});this._tabify();this._trigger("remove",
null,this._ui(a.find("a")[0],b[0]));return this},enable:function(c){var e=this.options;if(d.inArray(c,e.disabled)!=-1){this.lis.eq(c).removeClass("ui-state-disabled");e.disabled=d.grep(e.disabled,function(a){return a!=c});this._trigger("enable",null,this._ui(this.anchors[c],this.panels[c]));return this}},disable:function(c){var e=this.options;if(c!=e.selected){this.lis.eq(c).addClass("ui-state-disabled");e.disabled.push(c);e.disabled.sort();this._trigger("disable",null,this._ui(this.anchors[c],this.panels[c]))}return this},
select:function(c){if(typeof c=="string")c=this.anchors.index(this.anchors.filter("[href$="+c+"]"));else if(c===null)c=-1;if(c==-1&&this.options.collapsible)c=this.options.selected;this.anchors.eq(c).trigger(this.options.event+".tabs");return this},load:function(c){var e=this,a=this.options,b=this.anchors.eq(c)[0],h=d.data(b,"load.tabs");this.abort();if(!h||this.element.queue("tabs").length!==0&&d.data(b,"cache.tabs"))this.element.dequeue("tabs");else{this.lis.eq(c).addClass("ui-state-processing");
if(a.spinner){var i=d("span",b);i.data("label.tabs",i.html()).html(a.spinner)}this.xhr=d.ajax(d.extend({},a.ajaxOptions,{url:h,success:function(k,n){d(e._sanitizeSelector(b.hash)).html(k);e._cleanup();a.cache&&d.data(b,"cache.tabs",true);e._trigger("load",null,e._ui(e.anchors[c],e.panels[c]));try{a.ajaxOptions.success(k,n)}catch(m){}},error:function(k,n){e._cleanup();e._trigger("load",null,e._ui(e.anchors[c],e.panels[c]));try{a.ajaxOptions.error(k,n,c,b)}catch(m){}}}));e.element.dequeue("tabs");return this}},
abort:function(){this.element.queue([]);this.panels.stop(false,true);this.element.queue("tabs",this.element.queue("tabs").splice(-2,2));if(this.xhr){this.xhr.abort();delete this.xhr}this._cleanup();return this},url:function(c,e){this.anchors.eq(c).removeData("cache.tabs").data("load.tabs",e);return this},length:function(){return this.anchors.length}});d.extend(d.ui.tabs,{version:"1.8.1"});d.extend(d.ui.tabs.prototype,{rotation:null,rotate:function(c,e){var a=this,b=this.options,h=a._rotate||(a._rotate=
function(i){clearTimeout(a.rotation);a.rotation=setTimeout(function(){var k=b.selected;a.select(++k<a.anchors.length?k:0)},c);i&&i.stopPropagation()});e=a._unrotate||(a._unrotate=!e?function(i){i.clientX&&a.rotate(null)}:function(){t=b.selected;h()});if(c){this.element.bind("tabsshow",h);this.anchors.bind(b.event+".tabs",e);h()}else{clearTimeout(a.rotation);this.element.unbind("tabsshow",h);this.anchors.unbind(b.event+".tabs",e);delete this._rotate;delete this._unrotate}return this}})})(jQuery);
;/*
 * jQuery UI Datepicker 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Datepicker
 *
 * Depends:
 *	jquery.ui.core.js
 */
(function(d){function J(){this.debug=false;this._curInst=null;this._keyEvent=false;this._disabledInputs=[];this._inDialog=this._datepickerShowing=false;this._mainDivId="ui-datepicker-div";this._inlineClass="ui-datepicker-inline";this._appendClass="ui-datepicker-append";this._triggerClass="ui-datepicker-trigger";this._dialogClass="ui-datepicker-dialog";this._disableClass="ui-datepicker-disabled";this._unselectableClass="ui-datepicker-unselectable";this._currentClass="ui-datepicker-current-day";this._dayOverClass=
"ui-datepicker-days-cell-over";this.regional=[];this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su",
"Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:""};this._defaults={showOn:"focus",showAnim:"show",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:false,hideIfNoPrevNext:false,navigationAsDateFormat:false,gotoCurrent:false,changeMonth:false,changeYear:false,yearRange:"c-10:c+10",showOtherMonths:false,selectOtherMonths:false,showWeek:false,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",
minDate:null,maxDate:null,duration:"_default",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:true,showButtonPanel:false,autoSize:false};d.extend(this._defaults,this.regional[""]);this.dpDiv=d('<div id="'+this._mainDivId+'" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all ui-helper-hidden-accessible"></div>')}function E(a,b){d.extend(a,
b);for(var c in b)if(b[c]==null||b[c]==undefined)a[c]=b[c];return a}d.extend(d.ui,{datepicker:{version:"1.8.1"}});var y=(new Date).getTime();d.extend(J.prototype,{markerClassName:"hasDatepicker",log:function(){this.debug&&console.log.apply("",arguments)},_widgetDatepicker:function(){return this.dpDiv},setDefaults:function(a){E(this._defaults,a||{});return this},_attachDatepicker:function(a,b){var c=null;for(var e in this._defaults){var f=a.getAttribute("date:"+e);if(f){c=c||{};try{c[e]=eval(f)}catch(h){c[e]=
f}}}e=a.nodeName.toLowerCase();f=e=="div"||e=="span";if(!a.id)a.id="dp"+ ++this.uuid;var i=this._newInst(d(a),f);i.settings=d.extend({},b||{},c||{});if(e=="input")this._connectDatepicker(a,i);else f&&this._inlineDatepicker(a,i)},_newInst:function(a,b){return{id:a[0].id.replace(/([^A-Za-z0-9_])/g,"\\\\$1"),input:a,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:b,dpDiv:!b?this.dpDiv:d('<div class="'+this._inlineClass+' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>')}},
_connectDatepicker:function(a,b){var c=d(a);b.append=d([]);b.trigger=d([]);if(!c.hasClass(this.markerClassName)){this._attachments(c,b);c.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp).bind("setData.datepicker",function(e,f,h){b.settings[f]=h}).bind("getData.datepicker",function(e,f){return this._get(b,f)});this._autoSize(b);d.data(a,"datepicker",b)}},_attachments:function(a,b){var c=this._get(b,"appendText"),e=this._get(b,"isRTL");b.append&&
b.append.remove();if(c){b.append=d('<span class="'+this._appendClass+'">'+c+"</span>");a[e?"before":"after"](b.append)}a.unbind("focus",this._showDatepicker);b.trigger&&b.trigger.remove();c=this._get(b,"showOn");if(c=="focus"||c=="both")a.focus(this._showDatepicker);if(c=="button"||c=="both"){c=this._get(b,"buttonText");var f=this._get(b,"buttonImage");b.trigger=d(this._get(b,"buttonImageOnly")?d("<img/>").addClass(this._triggerClass).attr({src:f,alt:c,title:c}):d('<button type="button"></button>').addClass(this._triggerClass).html(f==
""?c:d("<img/>").attr({src:f,alt:c,title:c})));a[e?"before":"after"](b.trigger);b.trigger.click(function(){d.datepicker._datepickerShowing&&d.datepicker._lastInput==a[0]?d.datepicker._hideDatepicker():d.datepicker._showDatepicker(a[0]);return false})}},_autoSize:function(a){if(this._get(a,"autoSize")&&!a.inline){var b=new Date(2009,11,20),c=this._get(a,"dateFormat");if(c.match(/[DM]/)){var e=function(f){for(var h=0,i=0,g=0;g<f.length;g++)if(f[g].length>h){h=f[g].length;i=g}return i};b.setMonth(e(this._get(a,
c.match(/MM/)?"monthNames":"monthNamesShort")));b.setDate(e(this._get(a,c.match(/DD/)?"dayNames":"dayNamesShort"))+20-b.getDay())}a.input.attr("size",this._formatDate(a,b).length)}},_inlineDatepicker:function(a,b){var c=d(a);if(!c.hasClass(this.markerClassName)){c.addClass(this.markerClassName).append(b.dpDiv).bind("setData.datepicker",function(e,f,h){b.settings[f]=h}).bind("getData.datepicker",function(e,f){return this._get(b,f)});d.data(a,"datepicker",b);this._setDate(b,this._getDefaultDate(b),
true);this._updateDatepicker(b);this._updateAlternate(b)}},_dialogDatepicker:function(a,b,c,e,f){a=this._dialogInst;if(!a){a="dp"+ ++this.uuid;this._dialogInput=d('<input type="text" id="'+a+'" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');this._dialogInput.keydown(this._doKeyDown);d("body").append(this._dialogInput);a=this._dialogInst=this._newInst(this._dialogInput,false);a.settings={};d.data(this._dialogInput[0],"datepicker",a)}E(a.settings,e||{});b=b&&b.constructor==Date?
this._formatDate(a,b):b;this._dialogInput.val(b);this._pos=f?f.length?f:[f.pageX,f.pageY]:null;if(!this._pos)this._pos=[document.documentElement.clientWidth/2-100+(document.documentElement.scrollLeft||document.body.scrollLeft),document.documentElement.clientHeight/2-150+(document.documentElement.scrollTop||document.body.scrollTop)];this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px");a.settings.onSelect=c;this._inDialog=true;this.dpDiv.addClass(this._dialogClass);this._showDatepicker(this._dialogInput[0]);
d.blockUI&&d.blockUI(this.dpDiv);d.data(this._dialogInput[0],"datepicker",a);return this},_destroyDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();d.removeData(a,"datepicker");if(e=="input"){c.append.remove();c.trigger.remove();b.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp)}else if(e=="div"||e=="span")b.removeClass(this.markerClassName).empty()}},
_enableDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();if(e=="input"){a.disabled=false;c.trigger.filter("button").each(function(){this.disabled=false}).end().filter("img").css({opacity:"1.0",cursor:""})}else if(e=="div"||e=="span")b.children("."+this._inlineClass).children().removeClass("ui-state-disabled");this._disabledInputs=d.map(this._disabledInputs,function(f){return f==a?null:f})}},_disableDatepicker:function(a){var b=
d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();if(e=="input"){a.disabled=true;c.trigger.filter("button").each(function(){this.disabled=true}).end().filter("img").css({opacity:"0.5",cursor:"default"})}else if(e=="div"||e=="span")b.children("."+this._inlineClass).children().addClass("ui-state-disabled");this._disabledInputs=d.map(this._disabledInputs,function(f){return f==a?null:f});this._disabledInputs[this._disabledInputs.length]=a}},_isDisabledDatepicker:function(a){if(!a)return false;
for(var b=0;b<this._disabledInputs.length;b++)if(this._disabledInputs[b]==a)return true;return false},_getInst:function(a){try{return d.data(a,"datepicker")}catch(b){throw"Missing instance data for this datepicker";}},_optionDatepicker:function(a,b,c){var e=this._getInst(a);if(arguments.length==2&&typeof b=="string")return b=="defaults"?d.extend({},d.datepicker._defaults):e?b=="all"?d.extend({},e.settings):this._get(e,b):null;var f=b||{};if(typeof b=="string"){f={};f[b]=c}if(e){this._curInst==e&&
this._hideDatepicker();var h=this._getDateDatepicker(a,true);E(e.settings,f);this._attachments(d(a),e);this._autoSize(e);this._setDateDatepicker(a,h);this._updateDatepicker(e)}},_changeDatepicker:function(a,b,c){this._optionDatepicker(a,b,c)},_refreshDatepicker:function(a){(a=this._getInst(a))&&this._updateDatepicker(a)},_setDateDatepicker:function(a,b){if(a=this._getInst(a)){this._setDate(a,b);this._updateDatepicker(a);this._updateAlternate(a)}},_getDateDatepicker:function(a,b){(a=this._getInst(a))&&
!a.inline&&this._setDateFromField(a,b);return a?this._getDate(a):null},_doKeyDown:function(a){var b=d.datepicker._getInst(a.target),c=true,e=b.dpDiv.is(".ui-datepicker-rtl");b._keyEvent=true;if(d.datepicker._datepickerShowing)switch(a.keyCode){case 9:d.datepicker._hideDatepicker();c=false;break;case 13:c=d("td."+d.datepicker._dayOverClass,b.dpDiv).add(d("td."+d.datepicker._currentClass,b.dpDiv));c[0]?d.datepicker._selectDay(a.target,b.selectedMonth,b.selectedYear,c[0]):d.datepicker._hideDatepicker();
return false;case 27:d.datepicker._hideDatepicker();break;case 33:d.datepicker._adjustDate(a.target,a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M");break;case 34:d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M");break;case 35:if(a.ctrlKey||a.metaKey)d.datepicker._clearDate(a.target);c=a.ctrlKey||a.metaKey;break;case 36:if(a.ctrlKey||a.metaKey)d.datepicker._gotoToday(a.target);c=a.ctrlKey||
a.metaKey;break;case 37:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,e?+1:-1,"D");c=a.ctrlKey||a.metaKey;if(a.originalEvent.altKey)d.datepicker._adjustDate(a.target,a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M");break;case 38:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,-7,"D");c=a.ctrlKey||a.metaKey;break;case 39:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,e?-1:+1,"D");c=a.ctrlKey||a.metaKey;if(a.originalEvent.altKey)d.datepicker._adjustDate(a.target,
a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M");break;case 40:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,+7,"D");c=a.ctrlKey||a.metaKey;break;default:c=false}else if(a.keyCode==36&&a.ctrlKey)d.datepicker._showDatepicker(this);else c=false;if(c){a.preventDefault();a.stopPropagation()}},_doKeyPress:function(a){var b=d.datepicker._getInst(a.target);if(d.datepicker._get(b,"constrainInput")){b=d.datepicker._possibleChars(d.datepicker._get(b,"dateFormat"));
var c=String.fromCharCode(a.charCode==undefined?a.keyCode:a.charCode);return a.ctrlKey||c<" "||!b||b.indexOf(c)>-1}},_doKeyUp:function(a){a=d.datepicker._getInst(a.target);if(a.input.val()!=a.lastVal)try{if(d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),a.input?a.input.val():null,d.datepicker._getFormatConfig(a))){d.datepicker._setDateFromField(a);d.datepicker._updateAlternate(a);d.datepicker._updateDatepicker(a)}}catch(b){d.datepicker.log(b)}return true},_showDatepicker:function(a){a=a.target||
a;if(a.nodeName.toLowerCase()!="input")a=d("input",a.parentNode)[0];if(!(d.datepicker._isDisabledDatepicker(a)||d.datepicker._lastInput==a)){var b=d.datepicker._getInst(a);d.datepicker._curInst&&d.datepicker._curInst!=b&&d.datepicker._curInst.dpDiv.stop(true,true);var c=d.datepicker._get(b,"beforeShow");E(b.settings,c?c.apply(a,[a,b]):{});b.lastVal=null;d.datepicker._lastInput=a;d.datepicker._setDateFromField(b);if(d.datepicker._inDialog)a.value="";if(!d.datepicker._pos){d.datepicker._pos=d.datepicker._findPos(a);
d.datepicker._pos[1]+=a.offsetHeight}var e=false;d(a).parents().each(function(){e|=d(this).css("position")=="fixed";return!e});if(e&&d.browser.opera){d.datepicker._pos[0]-=document.documentElement.scrollLeft;d.datepicker._pos[1]-=document.documentElement.scrollTop}c={left:d.datepicker._pos[0],top:d.datepicker._pos[1]};d.datepicker._pos=null;b.dpDiv.css({position:"absolute",display:"block",top:"-1000px"});d.datepicker._updateDatepicker(b);c=d.datepicker._checkOffset(b,c,e);b.dpDiv.css({position:d.datepicker._inDialog&&
d.blockUI?"static":e?"fixed":"absolute",display:"none",left:c.left+"px",top:c.top+"px"});if(!b.inline){c=d.datepicker._get(b,"showAnim");var f=d.datepicker._get(b,"duration"),h=function(){d.datepicker._datepickerShowing=true;var i=d.datepicker._getBorders(b.dpDiv);b.dpDiv.find("iframe.ui-datepicker-cover").css({left:-i[0],top:-i[1],width:b.dpDiv.outerWidth(),height:b.dpDiv.outerHeight()})};b.dpDiv.zIndex(d(a).zIndex()+1);d.effects&&d.effects[c]?b.dpDiv.show(c,d.datepicker._get(b,"showOptions"),f,
h):b.dpDiv[c||"show"](c?f:null,h);if(!c||!f)h();b.input.is(":visible")&&!b.input.is(":disabled")&&b.input.focus();d.datepicker._curInst=b}}},_updateDatepicker:function(a){var b=this,c=d.datepicker._getBorders(a.dpDiv);a.dpDiv.empty().append(this._generateHTML(a)).find("iframe.ui-datepicker-cover").css({left:-c[0],top:-c[1],width:a.dpDiv.outerWidth(),height:a.dpDiv.outerHeight()}).end().find("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a").bind("mouseout",function(){d(this).removeClass("ui-state-hover");
this.className.indexOf("ui-datepicker-prev")!=-1&&d(this).removeClass("ui-datepicker-prev-hover");this.className.indexOf("ui-datepicker-next")!=-1&&d(this).removeClass("ui-datepicker-next-hover")}).bind("mouseover",function(){if(!b._isDisabledDatepicker(a.inline?a.dpDiv.parent()[0]:a.input[0])){d(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");d(this).addClass("ui-state-hover");this.className.indexOf("ui-datepicker-prev")!=-1&&d(this).addClass("ui-datepicker-prev-hover");
this.className.indexOf("ui-datepicker-next")!=-1&&d(this).addClass("ui-datepicker-next-hover")}}).end().find("."+this._dayOverClass+" a").trigger("mouseover").end();c=this._getNumberOfMonths(a);var e=c[1];e>1?a.dpDiv.addClass("ui-datepicker-multi-"+e).css("width",17*e+"em"):a.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");a.dpDiv[(c[0]!=1||c[1]!=1?"add":"remove")+"Class"]("ui-datepicker-multi");a.dpDiv[(this._get(a,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl");
a==d.datepicker._curInst&&d.datepicker._datepickerShowing&&a.input&&a.input.is(":visible")&&!a.input.is(":disabled")&&a.input.focus()},_getBorders:function(a){var b=function(c){return{thin:1,medium:2,thick:3}[c]||c};return[parseFloat(b(a.css("border-left-width"))),parseFloat(b(a.css("border-top-width")))]},_checkOffset:function(a,b,c){var e=a.dpDiv.outerWidth(),f=a.dpDiv.outerHeight(),h=a.input?a.input.outerWidth():0,i=a.input?a.input.outerHeight():0,g=document.documentElement.clientWidth+d(document).scrollLeft(),
k=document.documentElement.clientHeight+d(document).scrollTop();b.left-=this._get(a,"isRTL")?e-h:0;b.left-=c&&b.left==a.input.offset().left?d(document).scrollLeft():0;b.top-=c&&b.top==a.input.offset().top+i?d(document).scrollTop():0;b.left-=Math.min(b.left,b.left+e>g&&g>e?Math.abs(b.left+e-g):0);b.top-=Math.min(b.top,b.top+f>k&&k>f?Math.abs(f+i):0);return b},_findPos:function(a){for(var b=this._get(this._getInst(a),"isRTL");a&&(a.type=="hidden"||a.nodeType!=1);)a=a[b?"previousSibling":"nextSibling"];
a=d(a).offset();return[a.left,a.top]},_hideDatepicker:function(a){var b=this._curInst;if(!(!b||a&&b!=d.data(a,"datepicker")))if(this._datepickerShowing){a=this._get(b,"showAnim");var c=this._get(b,"duration"),e=function(){d.datepicker._tidyDialog(b);this._curInst=null};d.effects&&d.effects[a]?b.dpDiv.hide(a,d.datepicker._get(b,"showOptions"),c,e):b.dpDiv[a=="slideDown"?"slideUp":a=="fadeIn"?"fadeOut":"hide"](a?c:null,e);a||e();if(a=this._get(b,"onClose"))a.apply(b.input?b.input[0]:null,[b.input?b.input.val():
"",b]);this._datepickerShowing=false;this._lastInput=null;if(this._inDialog){this._dialogInput.css({position:"absolute",left:"0",top:"-100px"});if(d.blockUI){d.unblockUI();d("body").append(this.dpDiv)}}this._inDialog=false}},_tidyDialog:function(a){a.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")},_checkExternalClick:function(a){if(d.datepicker._curInst){a=d(a.target);a[0].id!=d.datepicker._mainDivId&&a.parents("#"+d.datepicker._mainDivId).length==0&&!a.hasClass(d.datepicker.markerClassName)&&
!a.hasClass(d.datepicker._triggerClass)&&d.datepicker._datepickerShowing&&!(d.datepicker._inDialog&&d.blockUI)&&d.datepicker._hideDatepicker()}},_adjustDate:function(a,b,c){a=d(a);var e=this._getInst(a[0]);if(!this._isDisabledDatepicker(a[0])){this._adjustInstDate(e,b+(c=="M"?this._get(e,"showCurrentAtPos"):0),c);this._updateDatepicker(e)}},_gotoToday:function(a){a=d(a);var b=this._getInst(a[0]);if(this._get(b,"gotoCurrent")&&b.currentDay){b.selectedDay=b.currentDay;b.drawMonth=b.selectedMonth=b.currentMonth;
b.drawYear=b.selectedYear=b.currentYear}else{var c=new Date;b.selectedDay=c.getDate();b.drawMonth=b.selectedMonth=c.getMonth();b.drawYear=b.selectedYear=c.getFullYear()}this._notifyChange(b);this._adjustDate(a)},_selectMonthYear:function(a,b,c){a=d(a);var e=this._getInst(a[0]);e._selectingMonthYear=false;e["selected"+(c=="M"?"Month":"Year")]=e["draw"+(c=="M"?"Month":"Year")]=parseInt(b.options[b.selectedIndex].value,10);this._notifyChange(e);this._adjustDate(a)},_clickMonthYear:function(a){a=this._getInst(d(a)[0]);
a.input&&a._selectingMonthYear&&!d.browser.msie&&a.input.focus();a._selectingMonthYear=!a._selectingMonthYear},_selectDay:function(a,b,c,e){var f=d(a);if(!(d(e).hasClass(this._unselectableClass)||this._isDisabledDatepicker(f[0]))){f=this._getInst(f[0]);f.selectedDay=f.currentDay=d("a",e).html();f.selectedMonth=f.currentMonth=b;f.selectedYear=f.currentYear=c;this._selectDate(a,this._formatDate(f,f.currentDay,f.currentMonth,f.currentYear))}},_clearDate:function(a){a=d(a);this._getInst(a[0]);this._selectDate(a,
"")},_selectDate:function(a,b){a=this._getInst(d(a)[0]);b=b!=null?b:this._formatDate(a);a.input&&a.input.val(b);this._updateAlternate(a);var c=this._get(a,"onSelect");if(c)c.apply(a.input?a.input[0]:null,[b,a]);else a.input&&a.input.trigger("change");if(a.inline)this._updateDatepicker(a);else{this._hideDatepicker();this._lastInput=a.input[0];typeof a.input[0]!="object"&&a.input.focus();this._lastInput=null}},_updateAlternate:function(a){var b=this._get(a,"altField");if(b){var c=this._get(a,"altFormat")||
this._get(a,"dateFormat"),e=this._getDate(a),f=this.formatDate(c,e,this._getFormatConfig(a));d(b).each(function(){d(this).val(f)})}},noWeekends:function(a){a=a.getDay();return[a>0&&a<6,""]},iso8601Week:function(a){a=new Date(a.getTime());a.setDate(a.getDate()+4-(a.getDay()||7));var b=a.getTime();a.setMonth(0);a.setDate(1);return Math.floor(Math.round((b-a)/864E5)/7)+1},parseDate:function(a,b,c){if(a==null||b==null)throw"Invalid arguments";b=typeof b=="object"?b.toString():b+"";if(b=="")return null;
for(var e=(c?c.shortYearCutoff:null)||this._defaults.shortYearCutoff,f=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,h=(c?c.dayNames:null)||this._defaults.dayNames,i=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort,g=(c?c.monthNames:null)||this._defaults.monthNames,k=c=-1,l=-1,u=-1,j=false,o=function(p){(p=z+1<a.length&&a.charAt(z+1)==p)&&z++;return p},m=function(p){o(p);p=new RegExp("^\\d{1,"+(p=="@"?14:p=="!"?20:p=="y"?4:p=="o"?3:2)+"}");p=b.substring(s).match(p);if(!p)throw"Missing number at position "+
s;s+=p[0].length;return parseInt(p[0],10)},n=function(p,w,G){p=o(p)?G:w;for(w=0;w<p.length;w++)if(b.substr(s,p[w].length)==p[w]){s+=p[w].length;return w+1}throw"Unknown name at position "+s;},r=function(){if(b.charAt(s)!=a.charAt(z))throw"Unexpected literal at position "+s;s++},s=0,z=0;z<a.length;z++)if(j)if(a.charAt(z)=="'"&&!o("'"))j=false;else r();else switch(a.charAt(z)){case "d":l=m("d");break;case "D":n("D",f,h);break;case "o":u=m("o");break;case "m":k=m("m");break;case "M":k=n("M",i,g);break;
case "y":c=m("y");break;case "@":var v=new Date(m("@"));c=v.getFullYear();k=v.getMonth()+1;l=v.getDate();break;case "!":v=new Date((m("!")-this._ticksTo1970)/1E4);c=v.getFullYear();k=v.getMonth()+1;l=v.getDate();break;case "'":if(o("'"))r();else j=true;break;default:r()}if(c==-1)c=(new Date).getFullYear();else if(c<100)c+=(new Date).getFullYear()-(new Date).getFullYear()%100+(c<=e?0:-100);if(u>-1){k=1;l=u;do{e=this._getDaysInMonth(c,k-1);if(l<=e)break;k++;l-=e}while(1)}v=this._daylightSavingAdjust(new Date(c,
k-1,l));if(v.getFullYear()!=c||v.getMonth()+1!=k||v.getDate()!=l)throw"Invalid date";return v},ATOM:"yy-mm-dd",COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925))*24*60*60*1E7,formatDate:function(a,b,c){if(!b)return"";var e=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,f=(c?
c.dayNames:null)||this._defaults.dayNames,h=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort;c=(c?c.monthNames:null)||this._defaults.monthNames;var i=function(o){(o=j+1<a.length&&a.charAt(j+1)==o)&&j++;return o},g=function(o,m,n){m=""+m;if(i(o))for(;m.length<n;)m="0"+m;return m},k=function(o,m,n,r){return i(o)?r[m]:n[m]},l="",u=false;if(b)for(var j=0;j<a.length;j++)if(u)if(a.charAt(j)=="'"&&!i("'"))u=false;else l+=a.charAt(j);else switch(a.charAt(j)){case "d":l+=g("d",b.getDate(),2);break;
case "D":l+=k("D",b.getDay(),e,f);break;case "o":l+=g("o",(b.getTime()-(new Date(b.getFullYear(),0,0)).getTime())/864E5,3);break;case "m":l+=g("m",b.getMonth()+1,2);break;case "M":l+=k("M",b.getMonth(),h,c);break;case "y":l+=i("y")?b.getFullYear():(b.getYear()%100<10?"0":"")+b.getYear()%100;break;case "@":l+=b.getTime();break;case "!":l+=b.getTime()*1E4+this._ticksTo1970;break;case "'":if(i("'"))l+="'";else u=true;break;default:l+=a.charAt(j)}return l},_possibleChars:function(a){for(var b="",c=false,
e=function(h){(h=f+1<a.length&&a.charAt(f+1)==h)&&f++;return h},f=0;f<a.length;f++)if(c)if(a.charAt(f)=="'"&&!e("'"))c=false;else b+=a.charAt(f);else switch(a.charAt(f)){case "d":case "m":case "y":case "@":b+="0123456789";break;case "D":case "M":return null;case "'":if(e("'"))b+="'";else c=true;break;default:b+=a.charAt(f)}return b},_get:function(a,b){return a.settings[b]!==undefined?a.settings[b]:this._defaults[b]},_setDateFromField:function(a,b){if(a.input.val()!=a.lastVal){var c=this._get(a,"dateFormat"),
e=a.lastVal=a.input?a.input.val():null,f,h;f=h=this._getDefaultDate(a);var i=this._getFormatConfig(a);try{f=this.parseDate(c,e,i)||h}catch(g){this.log(g);e=b?"":e}a.selectedDay=f.getDate();a.drawMonth=a.selectedMonth=f.getMonth();a.drawYear=a.selectedYear=f.getFullYear();a.currentDay=e?f.getDate():0;a.currentMonth=e?f.getMonth():0;a.currentYear=e?f.getFullYear():0;this._adjustInstDate(a)}},_getDefaultDate:function(a){return this._restrictMinMax(a,this._determineDate(a,this._get(a,"defaultDate"),new Date))},
_determineDate:function(a,b,c){var e=function(h){var i=new Date;i.setDate(i.getDate()+h);return i},f=function(h){try{return d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),h,d.datepicker._getFormatConfig(a))}catch(i){}var g=(h.toLowerCase().match(/^c/)?d.datepicker._getDate(a):null)||new Date,k=g.getFullYear(),l=g.getMonth();g=g.getDate();for(var u=/([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,j=u.exec(h);j;){switch(j[2]||"d"){case "d":case "D":g+=parseInt(j[1],10);break;case "w":case "W":g+=parseInt(j[1],
10)*7;break;case "m":case "M":l+=parseInt(j[1],10);g=Math.min(g,d.datepicker._getDaysInMonth(k,l));break;case "y":case "Y":k+=parseInt(j[1],10);g=Math.min(g,d.datepicker._getDaysInMonth(k,l));break}j=u.exec(h)}return new Date(k,l,g)};if(b=(b=b==null?c:typeof b=="string"?f(b):typeof b=="number"?isNaN(b)?c:e(b):b)&&b.toString()=="Invalid Date"?c:b){b.setHours(0);b.setMinutes(0);b.setSeconds(0);b.setMilliseconds(0)}return this._daylightSavingAdjust(b)},_daylightSavingAdjust:function(a){if(!a)return null;
a.setHours(a.getHours()>12?a.getHours()+2:0);return a},_setDate:function(a,b,c){var e=!b,f=a.selectedMonth,h=a.selectedYear;b=this._restrictMinMax(a,this._determineDate(a,b,new Date));a.selectedDay=a.currentDay=b.getDate();a.drawMonth=a.selectedMonth=a.currentMonth=b.getMonth();a.drawYear=a.selectedYear=a.currentYear=b.getFullYear();if((f!=a.selectedMonth||h!=a.selectedYear)&&!c)this._notifyChange(a);this._adjustInstDate(a);if(a.input)a.input.val(e?"":this._formatDate(a))},_getDate:function(a){return!a.currentYear||
a.input&&a.input.val()==""?null:this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay))},_generateHTML:function(a){var b=new Date;b=this._daylightSavingAdjust(new Date(b.getFullYear(),b.getMonth(),b.getDate()));var c=this._get(a,"isRTL"),e=this._get(a,"showButtonPanel"),f=this._get(a,"hideIfNoPrevNext"),h=this._get(a,"navigationAsDateFormat"),i=this._getNumberOfMonths(a),g=this._get(a,"showCurrentAtPos"),k=this._get(a,"stepMonths"),l=i[0]!=1||i[1]!=1,u=this._daylightSavingAdjust(!a.currentDay?
new Date(9999,9,9):new Date(a.currentYear,a.currentMonth,a.currentDay)),j=this._getMinMaxDate(a,"min"),o=this._getMinMaxDate(a,"max");g=a.drawMonth-g;var m=a.drawYear;if(g<0){g+=12;m--}if(o){var n=this._daylightSavingAdjust(new Date(o.getFullYear(),o.getMonth()-i[0]*i[1]+1,o.getDate()));for(n=j&&n<j?j:n;this._daylightSavingAdjust(new Date(m,g,1))>n;){g--;if(g<0){g=11;m--}}}a.drawMonth=g;a.drawYear=m;n=this._get(a,"prevText");n=!h?n:this.formatDate(n,this._daylightSavingAdjust(new Date(m,g-k,1)),this._getFormatConfig(a));
n=this._canAdjustMonth(a,-1,m,g)?'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_'+y+".datepicker._adjustDate('#"+a.id+"', -"+k+", 'M');\" title=\""+n+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"e":"w")+'">'+n+"</span></a>":f?"":'<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+n+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"e":"w")+'">'+n+"</span></a>";var r=this._get(a,"nextText");r=!h?r:this.formatDate(r,this._daylightSavingAdjust(new Date(m,
g+k,1)),this._getFormatConfig(a));f=this._canAdjustMonth(a,+1,m,g)?'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_'+y+".datepicker._adjustDate('#"+a.id+"', +"+k+", 'M');\" title=\""+r+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"w":"e")+'">'+r+"</span></a>":f?"":'<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+r+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"w":"e")+'">'+r+"</span></a>";k=this._get(a,"currentText");r=this._get(a,"gotoCurrent")&&
a.currentDay?u:b;k=!h?k:this.formatDate(k,r,this._getFormatConfig(a));h=!a.inline?'<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_'+y+'.datepicker._hideDatepicker();">'+this._get(a,"closeText")+"</button>":"";e=e?'<div class="ui-datepicker-buttonpane ui-widget-content">'+(c?h:"")+(this._isInRange(a,r)?'<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_'+
y+".datepicker._gotoToday('#"+a.id+"');\">"+k+"</button>":"")+(c?"":h)+"</div>":"";h=parseInt(this._get(a,"firstDay"),10);h=isNaN(h)?0:h;k=this._get(a,"showWeek");r=this._get(a,"dayNames");this._get(a,"dayNamesShort");var s=this._get(a,"dayNamesMin"),z=this._get(a,"monthNames"),v=this._get(a,"monthNamesShort"),p=this._get(a,"beforeShowDay"),w=this._get(a,"showOtherMonths"),G=this._get(a,"selectOtherMonths");this._get(a,"calculateWeek");for(var K=this._getDefaultDate(a),H="",C=0;C<i[0];C++){for(var L=
"",D=0;D<i[1];D++){var M=this._daylightSavingAdjust(new Date(m,g,a.selectedDay)),t=" ui-corner-all",x="";if(l){x+='<div class="ui-datepicker-group';if(i[1]>1)switch(D){case 0:x+=" ui-datepicker-group-first";t=" ui-corner-"+(c?"right":"left");break;case i[1]-1:x+=" ui-datepicker-group-last";t=" ui-corner-"+(c?"left":"right");break;default:x+=" ui-datepicker-group-middle";t="";break}x+='">'}x+='<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix'+t+'">'+(/all|left/.test(t)&&C==0?c?
f:n:"")+(/all|right/.test(t)&&C==0?c?n:f:"")+this._generateMonthYearHeader(a,g,m,j,o,C>0||D>0,z,v)+'</div><table class="ui-datepicker-calendar"><thead><tr>';var A=k?'<th class="ui-datepicker-week-col">'+this._get(a,"weekHeader")+"</th>":"";for(t=0;t<7;t++){var q=(t+h)%7;A+="<th"+((t+h+6)%7>=5?' class="ui-datepicker-week-end"':"")+'><span title="'+r[q]+'">'+s[q]+"</span></th>"}x+=A+"</tr></thead><tbody>";A=this._getDaysInMonth(m,g);if(m==a.selectedYear&&g==a.selectedMonth)a.selectedDay=Math.min(a.selectedDay,
A);t=(this._getFirstDayOfMonth(m,g)-h+7)%7;A=l?6:Math.ceil((t+A)/7);q=this._daylightSavingAdjust(new Date(m,g,1-t));for(var N=0;N<A;N++){x+="<tr>";var O=!k?"":'<td class="ui-datepicker-week-col">'+this._get(a,"calculateWeek")(q)+"</td>";for(t=0;t<7;t++){var F=p?p.apply(a.input?a.input[0]:null,[q]):[true,""],B=q.getMonth()!=g,I=B&&!G||!F[0]||j&&q<j||o&&q>o;O+='<td class="'+((t+h+6)%7>=5?" ui-datepicker-week-end":"")+(B?" ui-datepicker-other-month":"")+(q.getTime()==M.getTime()&&g==a.selectedMonth&&
a._keyEvent||K.getTime()==q.getTime()&&K.getTime()==M.getTime()?" "+this._dayOverClass:"")+(I?" "+this._unselectableClass+" ui-state-disabled":"")+(B&&!w?"":" "+F[1]+(q.getTime()==u.getTime()?" "+this._currentClass:"")+(q.getTime()==b.getTime()?" ui-datepicker-today":""))+'"'+((!B||w)&&F[2]?' title="'+F[2]+'"':"")+(I?"":' onclick="DP_jQuery_'+y+".datepicker._selectDay('#"+a.id+"',"+q.getMonth()+","+q.getFullYear()+', this);return false;"')+">"+(B&&!w?"&#xa0;":I?'<span class="ui-state-default">'+q.getDate()+
"</span>":'<a class="ui-state-default'+(q.getTime()==b.getTime()?" ui-state-highlight":"")+(q.getTime()==u.getTime()?" ui-state-active":"")+(B?" ui-priority-secondary":"")+'" href="#">'+q.getDate()+"</a>")+"</td>";q.setDate(q.getDate()+1);q=this._daylightSavingAdjust(q)}x+=O+"</tr>"}g++;if(g>11){g=0;m++}x+="</tbody></table>"+(l?"</div>"+(i[0]>0&&D==i[1]-1?'<div class="ui-datepicker-row-break"></div>':""):"");L+=x}H+=L}H+=e+(d.browser.msie&&parseInt(d.browser.version,10)<7&&!a.inline?'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>':
"");a._keyEvent=false;return H},_generateMonthYearHeader:function(a,b,c,e,f,h,i,g){var k=this._get(a,"changeMonth"),l=this._get(a,"changeYear"),u=this._get(a,"showMonthAfterYear"),j='<div class="ui-datepicker-title">',o="";if(h||!k)o+='<span class="ui-datepicker-month">'+i[b]+"</span>";else{i=e&&e.getFullYear()==c;var m=f&&f.getFullYear()==c;o+='<select class="ui-datepicker-month" onchange="DP_jQuery_'+y+".datepicker._selectMonthYear('#"+a.id+"', this, 'M');\" onclick=\"DP_jQuery_"+y+".datepicker._clickMonthYear('#"+
a.id+"');\">";for(var n=0;n<12;n++)if((!i||n>=e.getMonth())&&(!m||n<=f.getMonth()))o+='<option value="'+n+'"'+(n==b?' selected="selected"':"")+">"+g[n]+"</option>";o+="</select>"}u||(j+=o+(h||!(k&&l)?"&#xa0;":""));if(h||!l)j+='<span class="ui-datepicker-year">'+c+"</span>";else{g=this._get(a,"yearRange").split(":");var r=(new Date).getFullYear();i=function(s){s=s.match(/c[+-].*/)?c+parseInt(s.substring(1),10):s.match(/[+-].*/)?r+parseInt(s,10):parseInt(s,10);return isNaN(s)?r:s};b=i(g[0]);g=Math.max(b,
i(g[1]||""));b=e?Math.max(b,e.getFullYear()):b;g=f?Math.min(g,f.getFullYear()):g;for(j+='<select class="ui-datepicker-year" onchange="DP_jQuery_'+y+".datepicker._selectMonthYear('#"+a.id+"', this, 'Y');\" onclick=\"DP_jQuery_"+y+".datepicker._clickMonthYear('#"+a.id+"');\">";b<=g;b++)j+='<option value="'+b+'"'+(b==c?' selected="selected"':"")+">"+b+"</option>";j+="</select>"}j+=this._get(a,"yearSuffix");if(u)j+=(h||!(k&&l)?"&#xa0;":"")+o;j+="</div>";return j},_adjustInstDate:function(a,b,c){var e=
a.drawYear+(c=="Y"?b:0),f=a.drawMonth+(c=="M"?b:0);b=Math.min(a.selectedDay,this._getDaysInMonth(e,f))+(c=="D"?b:0);e=this._restrictMinMax(a,this._daylightSavingAdjust(new Date(e,f,b)));a.selectedDay=e.getDate();a.drawMonth=a.selectedMonth=e.getMonth();a.drawYear=a.selectedYear=e.getFullYear();if(c=="M"||c=="Y")this._notifyChange(a)},_restrictMinMax:function(a,b){var c=this._getMinMaxDate(a,"min");a=this._getMinMaxDate(a,"max");b=c&&b<c?c:b;return b=a&&b>a?a:b},_notifyChange:function(a){var b=this._get(a,
"onChangeMonthYear");if(b)b.apply(a.input?a.input[0]:null,[a.selectedYear,a.selectedMonth+1,a])},_getNumberOfMonths:function(a){a=this._get(a,"numberOfMonths");return a==null?[1,1]:typeof a=="number"?[1,a]:a},_getMinMaxDate:function(a,b){return this._determineDate(a,this._get(a,b+"Date"),null)},_getDaysInMonth:function(a,b){return 32-(new Date(a,b,32)).getDate()},_getFirstDayOfMonth:function(a,b){return(new Date(a,b,1)).getDay()},_canAdjustMonth:function(a,b,c,e){var f=this._getNumberOfMonths(a);
c=this._daylightSavingAdjust(new Date(c,e+(b<0?b:f[0]*f[1]),1));b<0&&c.setDate(this._getDaysInMonth(c.getFullYear(),c.getMonth()));return this._isInRange(a,c)},_isInRange:function(a,b){var c=this._getMinMaxDate(a,"min");a=this._getMinMaxDate(a,"max");return(!c||b.getTime()>=c.getTime())&&(!a||b.getTime()<=a.getTime())},_getFormatConfig:function(a){var b=this._get(a,"shortYearCutoff");b=typeof b!="string"?b:(new Date).getFullYear()%100+parseInt(b,10);return{shortYearCutoff:b,dayNamesShort:this._get(a,
"dayNamesShort"),dayNames:this._get(a,"dayNames"),monthNamesShort:this._get(a,"monthNamesShort"),monthNames:this._get(a,"monthNames")}},_formatDate:function(a,b,c,e){if(!b){a.currentDay=a.selectedDay;a.currentMonth=a.selectedMonth;a.currentYear=a.selectedYear}b=b?typeof b=="object"?b:this._daylightSavingAdjust(new Date(e,c,b)):this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay));return this.formatDate(this._get(a,"dateFormat"),b,this._getFormatConfig(a))}});d.fn.datepicker=
function(a){if(!d.datepicker.initialized){d(document).mousedown(d.datepicker._checkExternalClick).find("body").append(d.datepicker.dpDiv);d.datepicker.initialized=true}var b=Array.prototype.slice.call(arguments,1);if(typeof a=="string"&&(a=="isDisabled"||a=="getDate"||a=="widget"))return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this[0]].concat(b));if(a=="option"&&arguments.length==2&&typeof arguments[1]=="string")return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this[0]].concat(b));
return this.each(function(){typeof a=="string"?d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this].concat(b)):d.datepicker._attachDatepicker(this,a)})};d.datepicker=new J;d.datepicker.initialized=false;d.datepicker.uuid=(new Date).getTime();d.datepicker.version="1.8.1";window["DP_jQuery_"+y]=d})(jQuery);
;/*
 * jQuery UI Progressbar 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function(b){b.widget("ui.progressbar",{options:{value:0},_create:function(){this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({role:"progressbar","aria-valuemin":this._valueMin(),"aria-valuemax":this._valueMax(),"aria-valuenow":this._value()});this.valueDiv=b("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element);this._refreshValue()},destroy:function(){this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");
this.valueDiv.remove();b.Widget.prototype.destroy.apply(this,arguments)},value:function(a){if(a===undefined)return this._value();this._setOption("value",a);return this},_setOption:function(a,c){switch(a){case "value":this.options.value=c;this._refreshValue();this._trigger("change");break}b.Widget.prototype._setOption.apply(this,arguments)},_value:function(){var a=this.options.value;if(typeof a!=="number")a=0;if(a<this._valueMin())a=this._valueMin();if(a>this._valueMax())a=this._valueMax();return a},
_valueMin:function(){return 0},_valueMax:function(){return 100},_refreshValue:function(){var a=this.value();this.valueDiv[a===this._valueMax()?"addClass":"removeClass"]("ui-corner-right").width(a+"%");this.element.attr("aria-valuenow",a)}});b.extend(b.ui.progressbar,{version:"1.8.1"})})(jQuery);
;/*
 * jQuery UI Effects 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/
 */
jQuery.effects||function(f){function k(c){var a;if(c&&c.constructor==Array&&c.length==3)return c;if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c))return[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10)];if(a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c))return[parseFloat(a[1])*2.55,parseFloat(a[2])*2.55,parseFloat(a[3])*2.55];if(a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c))return[parseInt(a[1],
16),parseInt(a[2],16),parseInt(a[3],16)];if(a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c))return[parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16),parseInt(a[3]+a[3],16)];if(/rgba\(0, 0, 0, 0\)/.exec(c))return l.transparent;return l[f.trim(c).toLowerCase()]}function q(c,a){var b;do{b=f.curCSS(c,a);if(b!=""&&b!="transparent"||f.nodeName(c,"body"))break;a="backgroundColor"}while(c=c.parentNode);return k(b)}function m(){var c=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,
a={},b,d;if(c&&c.length&&c[0]&&c[c[0]])for(var e=c.length;e--;){b=c[e];if(typeof c[b]=="string"){d=b.replace(/\-(\w)/g,function(g,h){return h.toUpperCase()});a[d]=c[b]}}else for(b in c)if(typeof c[b]==="string")a[b]=c[b];return a}function n(c){var a,b;for(a in c){b=c[a];if(b==null||f.isFunction(b)||a in r||/scrollbar/.test(a)||!/color/i.test(a)&&isNaN(parseFloat(b)))delete c[a]}return c}function s(c,a){var b={_:0},d;for(d in a)if(c[d]!=a[d])b[d]=a[d];return b}function j(c,a,b,d){if(typeof c=="object"){d=
a;b=null;a=c;c=a.effect}if(f.isFunction(a)){d=a;b=null;a={}}if(f.isFunction(b)){d=b;b=null}if(typeof a=="number"||f.fx.speeds[a]){d=b;b=a;a={}}a=a||{};b=b||a.duration;b=f.fx.off?0:typeof b=="number"?b:f.fx.speeds[b]||f.fx.speeds._default;d=d||a.complete;return[c,a,b,d]}f.effects={};f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(c,a){f.fx.step[a]=function(b){if(!b.colorInit){b.start=q(b.elem,a);b.end=k(b.end);b.colorInit=
true}b.elem.style[a]="rgb("+Math.max(Math.min(parseInt(b.pos*(b.end[0]-b.start[0])+b.start[0],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[1]-b.start[1])+b.start[1],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[2]-b.start[2])+b.start[2],10),255),0)+")"}});var l={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,
183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,
165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]},o=["add","remove","toggle"],r={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};f.effects.animateClass=function(c,a,b,d){if(f.isFunction(b)){d=b;b=null}return this.each(function(){var e=f(this),g=e.attr("style")||" ",h=n(m.call(this)),p,t=e.attr("className");f.each(o,function(u,
i){c[i]&&e[i+"Class"](c[i])});p=n(m.call(this));e.attr("className",t);e.animate(s(h,p),a,b,function(){f.each(o,function(u,i){c[i]&&e[i+"Class"](c[i])});if(typeof e.attr("style")=="object"){e.attr("style").cssText="";e.attr("style").cssText=g}else e.attr("style",g);d&&d.apply(this,arguments)})})};f.fn.extend({_addClass:f.fn.addClass,addClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{add:c},a,b,d]):this._addClass(c)},_removeClass:f.fn.removeClass,removeClass:function(c,a,b,d){return a?
f.effects.animateClass.apply(this,[{remove:c},a,b,d]):this._removeClass(c)},_toggleClass:f.fn.toggleClass,toggleClass:function(c,a,b,d,e){return typeof a=="boolean"||a===undefined?b?f.effects.animateClass.apply(this,[a?{add:c}:{remove:c},b,d,e]):this._toggleClass(c,a):f.effects.animateClass.apply(this,[{toggle:c},a,b,d])},switchClass:function(c,a,b,d,e){return f.effects.animateClass.apply(this,[{add:a,remove:c},b,d,e])}});f.extend(f.effects,{version:"1.8.1",save:function(c,a){for(var b=0;b<a.length;b++)a[b]!==
null&&c.data("ec.storage."+a[b],c[0].style[a[b]])},restore:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.css(a[b],c.data("ec.storage."+a[b]))},setMode:function(c,a){if(a=="toggle")a=c.is(":hidden")?"show":"hide";return a},getBaseline:function(c,a){var b;switch(c[0]){case "top":b=0;break;case "middle":b=0.5;break;case "bottom":b=1;break;default:b=c[0]/a.height}switch(c[1]){case "left":c=0;break;case "center":c=0.5;break;case "right":c=1;break;default:c=c[1]/a.width}return{x:c,y:b}},createWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent();
var a={width:c.outerWidth(true),height:c.outerHeight(true),"float":c.css("float")},b=f("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0});c.wrap(b);b=c.parent();if(c.css("position")=="static"){b.css({position:"relative"});c.css({position:"relative"})}else{f.extend(a,{position:c.css("position"),zIndex:c.css("z-index")});f.each(["top","left","bottom","right"],function(d,e){a[e]=c.css(e);if(isNaN(parseInt(a[e],10)))a[e]="auto"});
c.css({position:"relative",top:0,left:0})}return b.css(a).show()},removeWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent().replaceWith(c);return c},setTransition:function(c,a,b,d){d=d||{};f.each(a,function(e,g){unit=c.cssUnit(g);if(unit[0]>0)d[g]=unit[0]*b+unit[1]});return d}});f.fn.extend({effect:function(c){var a=j.apply(this,arguments);a={options:a[1],duration:a[2],callback:a[3]};var b=f.effects[c];return b&&!f.fx.off?b.call(this,a):this},_show:f.fn.show,show:function(c){if(!c||
typeof c=="number"||f.fx.speeds[c])return this._show.apply(this,arguments);else{var a=j.apply(this,arguments);a[1].mode="show";return this.effect.apply(this,a)}},_hide:f.fn.hide,hide:function(c){if(!c||typeof c=="number"||f.fx.speeds[c])return this._hide.apply(this,arguments);else{var a=j.apply(this,arguments);a[1].mode="hide";return this.effect.apply(this,a)}},__toggle:f.fn.toggle,toggle:function(c){if(!c||typeof c=="number"||f.fx.speeds[c]||typeof c=="boolean"||f.isFunction(c))return this.__toggle.apply(this,
arguments);else{var a=j.apply(this,arguments);a[1].mode="toggle";return this.effect.apply(this,a)}},cssUnit:function(c){var a=this.css(c),b=[];f.each(["em","px","%","pt"],function(d,e){if(a.indexOf(e)>0)b=[parseFloat(a),e]});return b}});f.easing.jswing=f.easing.swing;f.extend(f.easing,{def:"easeOutQuad",swing:function(c,a,b,d,e){return f.easing[f.easing.def](c,a,b,d,e)},easeInQuad:function(c,a,b,d,e){return d*(a/=e)*a+b},easeOutQuad:function(c,a,b,d,e){return-d*(a/=e)*(a-2)+b},easeInOutQuad:function(c,
a,b,d,e){if((a/=e/2)<1)return d/2*a*a+b;return-d/2*(--a*(a-2)-1)+b},easeInCubic:function(c,a,b,d,e){return d*(a/=e)*a*a+b},easeOutCubic:function(c,a,b,d,e){return d*((a=a/e-1)*a*a+1)+b},easeInOutCubic:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a+b;return d/2*((a-=2)*a*a+2)+b},easeInQuart:function(c,a,b,d,e){return d*(a/=e)*a*a*a+b},easeOutQuart:function(c,a,b,d,e){return-d*((a=a/e-1)*a*a*a-1)+b},easeInOutQuart:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a+b;return-d/2*((a-=2)*a*a*a-2)+
b},easeInQuint:function(c,a,b,d,e){return d*(a/=e)*a*a*a*a+b},easeOutQuint:function(c,a,b,d,e){return d*((a=a/e-1)*a*a*a*a+1)+b},easeInOutQuint:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a*a+b;return d/2*((a-=2)*a*a*a*a+2)+b},easeInSine:function(c,a,b,d,e){return-d*Math.cos(a/e*(Math.PI/2))+d+b},easeOutSine:function(c,a,b,d,e){return d*Math.sin(a/e*(Math.PI/2))+b},easeInOutSine:function(c,a,b,d,e){return-d/2*(Math.cos(Math.PI*a/e)-1)+b},easeInExpo:function(c,a,b,d,e){return a==0?b:d*Math.pow(2,
10*(a/e-1))+b},easeOutExpo:function(c,a,b,d,e){return a==e?b+d:d*(-Math.pow(2,-10*a/e)+1)+b},easeInOutExpo:function(c,a,b,d,e){if(a==0)return b;if(a==e)return b+d;if((a/=e/2)<1)return d/2*Math.pow(2,10*(a-1))+b;return d/2*(-Math.pow(2,-10*--a)+2)+b},easeInCirc:function(c,a,b,d,e){return-d*(Math.sqrt(1-(a/=e)*a)-1)+b},easeOutCirc:function(c,a,b,d,e){return d*Math.sqrt(1-(a=a/e-1)*a)+b},easeInOutCirc:function(c,a,b,d,e){if((a/=e/2)<1)return-d/2*(Math.sqrt(1-a*a)-1)+b;return d/2*(Math.sqrt(1-(a-=2)*
a)+1)+b},easeInElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g))+b},easeOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*a)*Math.sin((a*e-c)*2*Math.PI/g)+d+b},easeInOutElastic:function(c,
a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e/2)==2)return b+d;g||(g=e*0.3*1.5);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);if(a<1)return-0.5*h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)+b;return h*Math.pow(2,-10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)*0.5+d+b},easeInBack:function(c,a,b,d,e,g){if(g==undefined)g=1.70158;return d*(a/=e)*a*((g+1)*a-g)+b},easeOutBack:function(c,a,b,d,e,g){if(g==undefined)g=1.70158;return d*((a=a/e-1)*a*((g+1)*a+g)+1)+b},easeInOutBack:function(c,
a,b,d,e,g){if(g==undefined)g=1.70158;if((a/=e/2)<1)return d/2*a*a*(((g*=1.525)+1)*a-g)+b;return d/2*((a-=2)*a*(((g*=1.525)+1)*a+g)+2)+b},easeInBounce:function(c,a,b,d,e){return d-f.easing.easeOutBounce(c,e-a,0,d,e)+b},easeOutBounce:function(c,a,b,d,e){return(a/=e)<1/2.75?d*7.5625*a*a+b:a<2/2.75?d*(7.5625*(a-=1.5/2.75)*a+0.75)+b:a<2.5/2.75?d*(7.5625*(a-=2.25/2.75)*a+0.9375)+b:d*(7.5625*(a-=2.625/2.75)*a+0.984375)+b},easeInOutBounce:function(c,a,b,d,e){if(a<e/2)return f.easing.easeInBounce(c,a*2,0,
d,e)*0.5+b;return f.easing.easeOutBounce(c,a*2-e,0,d,e)*0.5+d*0.5+b}})}(jQuery);
;/*
 * jQuery UI Effects Blind 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Blind
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.blind=function(c){return this.queue(function(){var a=b(this),g=["position","top","left"],f=b.effects.setMode(a,c.options.mode||"hide"),d=c.options.direction||"vertical";b.effects.save(a,g);a.show();var e=b.effects.createWrapper(a).css({overflow:"hidden"}),h=d=="vertical"?"height":"width";d=d=="vertical"?e.height():e.width();f=="show"&&e.css(h,0);var i={};i[h]=f=="show"?d:0;e.animate(i,c.duration,c.options.easing,function(){f=="hide"&&a.hide();b.effects.restore(a,g);b.effects.removeWrapper(a);
c.callback&&c.callback.apply(a[0],arguments);a.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Bounce 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Bounce
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(e){e.effects.bounce=function(b){return this.queue(function(){var a=e(this),l=["position","top","left"],h=e.effects.setMode(a,b.options.mode||"effect"),d=b.options.direction||"up",c=b.options.distance||20,m=b.options.times||5,i=b.duration||250;/show|hide/.test(h)&&l.push("opacity");e.effects.save(a,l);a.show();e.effects.createWrapper(a);var f=d=="up"||d=="down"?"top":"left";d=d=="up"||d=="left"?"pos":"neg";c=b.options.distance||(f=="top"?a.outerHeight({margin:true})/3:a.outerWidth({margin:true})/
3);if(h=="show")a.css("opacity",0).css(f,d=="pos"?-c:c);if(h=="hide")c/=m*2;h!="hide"&&m--;if(h=="show"){var g={opacity:1};g[f]=(d=="pos"?"+=":"-=")+c;a.animate(g,i/2,b.options.easing);c/=2;m--}for(g=0;g<m;g++){var j={},k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing);c=h=="hide"?c*2:c/2}if(h=="hide"){g={opacity:0};g[f]=(d=="pos"?"-=":"+=")+c;a.animate(g,i/2,b.options.easing,function(){a.hide();e.effects.restore(a,l);e.effects.removeWrapper(a);
b.callback&&b.callback.apply(this,arguments)})}else{j={};k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing,function(){e.effects.restore(a,l);e.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments)})}a.queue("fx",function(){a.dequeue()});a.dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Clip 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Clip
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.clip=function(e){return this.queue(function(){var a=b(this),i=["position","top","left","height","width"],f=b.effects.setMode(a,e.options.mode||"hide"),c=e.options.direction||"vertical";b.effects.save(a,i);a.show();var d=b.effects.createWrapper(a).css({overflow:"hidden"});d=a[0].tagName=="IMG"?d:a;var g={size:c=="vertical"?"height":"width",position:c=="vertical"?"top":"left"};c=c=="vertical"?d.height():d.width();if(f=="show"){d.css(g.size,0);d.css(g.position,c/2)}var h={};h[g.size]=
f=="show"?c:0;h[g.position]=f=="show"?0:c/2;d.animate(h,{queue:false,duration:e.duration,easing:e.options.easing,complete:function(){f=="hide"&&a.hide();b.effects.restore(a,i);b.effects.removeWrapper(a);e.callback&&e.callback.apply(a[0],arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Drop 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Drop
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.drop=function(d){return this.queue(function(){var a=c(this),h=["position","top","left","opacity"],e=c.effects.setMode(a,d.options.mode||"hide"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a);var f=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var g=d.options.distance||(f=="top"?a.outerHeight({margin:true})/2:a.outerWidth({margin:true})/2);if(e=="show")a.css("opacity",0).css(f,b=="pos"?-g:g);var i={opacity:e=="show"?1:
0};i[f]=(e=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+g;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){e=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Explode 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
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
 * jQuery UI Effects Fold 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Fold
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.fold=function(a){return this.queue(function(){var b=c(this),j=["position","top","left"],d=c.effects.setMode(b,a.options.mode||"hide"),g=a.options.size||15,h=!!a.options.horizFirst,k=a.duration?a.duration/2:c.fx.speeds._default/2;c.effects.save(b,j);b.show();var e=c.effects.createWrapper(b).css({overflow:"hidden"}),f=d=="show"!=h,l=f?["width","height"]:["height","width"];f=f?[e.width(),e.height()]:[e.height(),e.width()];var i=/([0-9]+)%/.exec(g);if(i)g=parseInt(i[1],10)/100*
f[d=="hide"?0:1];if(d=="show")e.css(h?{height:0,width:g}:{height:g,width:0});h={};i={};h[l[0]]=d=="show"?f[0]:g;i[l[1]]=d=="show"?f[1]:0;e.animate(h,k,a.options.easing).animate(i,k,a.options.easing,function(){d=="hide"&&b.hide();c.effects.restore(b,j);c.effects.removeWrapper(b);a.callback&&a.callback.apply(b[0],arguments);b.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Highlight 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Highlight
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.highlight=function(c){return this.queue(function(){var a=b(this),e=["backgroundImage","backgroundColor","opacity"],d=b.effects.setMode(a,c.options.mode||"show"),f={backgroundColor:a.css("backgroundColor")};if(d=="hide")f.opacity=0;b.effects.save(a,e);a.show().css({backgroundImage:"none",backgroundColor:c.options.color||"#ffff99"}).animate(f,{queue:false,duration:c.duration,easing:c.options.easing,complete:function(){d=="hide"&&a.hide();b.effects.restore(a,e);d=="show"&&!b.support.opacity&&
this.style.removeAttribute("filter");c.callback&&c.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Pulsate 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Pulsate
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(d){d.effects.pulsate=function(a){return this.queue(function(){var b=d(this),c=d.effects.setMode(b,a.options.mode||"show");times=(a.options.times||5)*2-1;duration=a.duration?a.duration/2:d.fx.speeds._default/2;isVisible=b.is(":visible");animateTo=0;if(!isVisible){b.css("opacity",0).show();animateTo=1}if(c=="hide"&&isVisible||c=="show"&&!isVisible)times--;for(c=0;c<times;c++){b.animate({opacity:animateTo},duration,a.options.easing);animateTo=(animateTo+1)%2}b.animate({opacity:animateTo},duration,
a.options.easing,function(){animateTo==0&&b.hide();a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()}).dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Scale 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Scale
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.puff=function(b){return this.queue(function(){var a=c(this),e=c.effects.setMode(a,b.options.mode||"hide"),g=parseInt(b.options.percent,10)||150,h=g/100,i={height:a.height(),width:a.width()};c.extend(b.options,{fade:true,mode:e,percent:e=="hide"?g:100,from:e=="hide"?i:{height:i.height*h,width:i.width*h}});a.effect("scale",b.options,b.duration,b.callback);a.dequeue()})};c.effects.scale=function(b){return this.queue(function(){var a=c(this),e=c.extend(true,{},b.options),g=c.effects.setMode(a,
b.options.mode||"effect"),h=parseInt(b.options.percent,10)||(parseInt(b.options.percent,10)==0?0:g=="hide"?0:100),i=b.options.direction||"both",f=b.options.origin;if(g!="effect"){e.origin=f||["middle","center"];e.restore=true}f={height:a.height(),width:a.width()};a.from=b.options.from||(g=="show"?{height:0,width:0}:f);h={y:i!="horizontal"?h/100:1,x:i!="vertical"?h/100:1};a.to={height:f.height*h.y,width:f.width*h.x};if(b.options.fade){if(g=="show"){a.from.opacity=0;a.to.opacity=1}if(g=="hide"){a.from.opacity=
1;a.to.opacity=0}}e.from=a.from;e.to=a.to;e.mode=g;a.effect("size",e,b.duration,b.callback);a.dequeue()})};c.effects.size=function(b){return this.queue(function(){var a=c(this),e=["position","top","left","width","height","overflow","opacity"],g=["position","top","left","overflow","opacity"],h=["width","height","overflow"],i=["fontSize"],f=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"],k=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"],p=c.effects.setMode(a,
b.options.mode||"effect"),n=b.options.restore||false,m=b.options.scale||"both",l=b.options.origin,j={height:a.height(),width:a.width()};a.from=b.options.from||j;a.to=b.options.to||j;if(l){l=c.effects.getBaseline(l,j);a.from.top=(j.height-a.from.height)*l.y;a.from.left=(j.width-a.from.width)*l.x;a.to.top=(j.height-a.to.height)*l.y;a.to.left=(j.width-a.to.width)*l.x}var d={from:{y:a.from.height/j.height,x:a.from.width/j.width},to:{y:a.to.height/j.height,x:a.to.width/j.width}};if(m=="box"||m=="both"){if(d.from.y!=
d.to.y){e=e.concat(f);a.from=c.effects.setTransition(a,f,d.from.y,a.from);a.to=c.effects.setTransition(a,f,d.to.y,a.to)}if(d.from.x!=d.to.x){e=e.concat(k);a.from=c.effects.setTransition(a,k,d.from.x,a.from);a.to=c.effects.setTransition(a,k,d.to.x,a.to)}}if(m=="content"||m=="both")if(d.from.y!=d.to.y){e=e.concat(i);a.from=c.effects.setTransition(a,i,d.from.y,a.from);a.to=c.effects.setTransition(a,i,d.to.y,a.to)}c.effects.save(a,n?e:g);a.show();c.effects.createWrapper(a);a.css("overflow","hidden").css(a.from);
if(m=="content"||m=="both"){f=f.concat(["marginTop","marginBottom"]).concat(i);k=k.concat(["marginLeft","marginRight"]);h=e.concat(f).concat(k);a.find("*[width]").each(function(){child=c(this);n&&c.effects.save(child,h);var o={height:child.height(),width:child.width()};child.from={height:o.height*d.from.y,width:o.width*d.from.x};child.to={height:o.height*d.to.y,width:o.width*d.to.x};if(d.from.y!=d.to.y){child.from=c.effects.setTransition(child,f,d.from.y,child.from);child.to=c.effects.setTransition(child,
f,d.to.y,child.to)}if(d.from.x!=d.to.x){child.from=c.effects.setTransition(child,k,d.from.x,child.from);child.to=c.effects.setTransition(child,k,d.to.x,child.to)}child.css(child.from);child.animate(child.to,b.duration,b.options.easing,function(){n&&c.effects.restore(child,h)})})}a.animate(a.to,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){a.to.opacity===0&&a.css("opacity",a.from.opacity);p=="hide"&&a.hide();c.effects.restore(a,n?e:g);c.effects.removeWrapper(a);b.callback&&
b.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Shake 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Shake
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(d){d.effects.shake=function(a){return this.queue(function(){var b=d(this),j=["position","top","left"];d.effects.setMode(b,a.options.mode||"effect");var c=a.options.direction||"left",e=a.options.distance||20,l=a.options.times||3,f=a.duration||a.options.duration||140;d.effects.save(b,j);b.show();d.effects.createWrapper(b);var g=c=="up"||c=="down"?"top":"left",h=c=="up"||c=="left"?"pos":"neg";c={};var i={},k={};c[g]=(h=="pos"?"-=":"+=")+e;i[g]=(h=="pos"?"+=":"-=")+e*2;k[g]=(h=="pos"?"-=":"+=")+
e*2;b.animate(c,f,a.options.easing);for(e=1;e<l;e++)b.animate(i,f,a.options.easing).animate(k,f,a.options.easing);b.animate(i,f,a.options.easing).animate(c,f/2,a.options.easing,function(){d.effects.restore(b,j);d.effects.removeWrapper(b);a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()});b.dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Slide 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.slide=function(d){return this.queue(function(){var a=c(this),h=["position","top","left"],e=c.effects.setMode(a,d.options.mode||"show"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a).css({overflow:"hidden"});var f=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var g=d.options.distance||(f=="top"?a.outerHeight({margin:true}):a.outerWidth({margin:true}));if(e=="show")a.css(f,b=="pos"?-g:g);var i={};i[f]=(e=="show"?b=="pos"?
"+=":"-=":b=="pos"?"-=":"+=")+g;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){e=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Transfer 1.8.1
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Transfer
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(e){e.effects.transfer=function(a){return this.queue(function(){var b=e(this),c=e(a.options.to),d=c.offset();c={top:d.top,left:d.left,height:c.innerHeight(),width:c.innerWidth()};d=b.offset();var f=e('<div class="ui-effects-transfer"></div>').appendTo(document.body).addClass(a.options.className).css({top:d.top,left:d.left,height:b.innerHeight(),width:b.innerWidth(),position:"absolute"}).animate(c,a.duration,a.options.easing,function(){f.remove();a.callback&&a.callback.apply(b[0],arguments);
b.dequeue()})})}})(jQuery);
;// User changeable
var show_debug = true;

// Shouldn't touch
var VERSION = 31.1;
var script_started = Date.now();

// Automatically filled
var userID = 0;
var imagepath = '';
var isGreasemonkey = (navigator.userAgent.toLowerCase().indexOf('chrome') === -1);

// Decide which facebook app we're in...
if (window.location.hostname === 'apps.facebook.com' || window.location.hostname === 'apps.new.facebook.com') {
	var applications = {
		'reqs.php':['','Gifts'], // For gifts etc
		'castle_age':['46755028429', 'Castle Age']
	};

	for (var i in applications) {
		if (window.location.pathname.indexOf(i) === 1) {
			var APP = i;
			var APPID = applications[i][0];
			var APPNAME = applications[i][1];
			var PREFIX = 'golem'+APPID+'_';
			break;
		}
	}
	if (typeof APP !== 'undefined') {
		var log = function(txt){
			console.log('[' + (new Date).toLocaleTimeString() + '] ' + (WorkerStack && WorkerStack.length ? WorkerStack[WorkerStack.length-1].name + ': ' : '') + txt);
		}

		if (show_debug) {
			var debug = function(txt) {
				console.log('[' + (new Date).toLocaleTimeString() + '] ' + (WorkerStack && WorkerStack.length ? WorkerStack[WorkerStack.length-1].name + ': ' : '') + txt);
			};
		} else {
			var debug = function(){};
		}

		if (typeof unsafeWindow === 'undefined') {
			var unsafeWindow = window;
		}

		var document_ready = function() {
			var i;
			userID = $('head').html().regex(/user:([0-9]+),/i);
			if (!userID || typeof userID !== 'number' || userID === 0) {
				log('ERROR: No Facebook UserID!!!');
				window.location.href = window.location.href; // Force reload without retrying
				return
			}
			if (APP === 'reqs.php') { // Let's get the next gift we can...
				return;
			}
			try {
				imagepath = $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
			} catch(e) {
				log('ERROR: Bad Page Load!!!');
				Page.reload();
				return;
			}
			do_css();
			Page.identify();
			for (i=0; i<Workers.length; i++) {
				Workers[i]._setup();
			}
			for (i=0; i<Workers.length; i++) {
				Workers[i]._init();
			}
			for (i=0; i<Workers.length; i++) {
				Workers[i]._update();
				Workers[i]._flush();
			}
			Page.parse_all(); // Call once to get the ball rolling...
		};

		if (typeof jQuery !== 'undefined') {
			$(document).ready(document_ready);
		} else {
			var head = document.getElementsByTagName('head')[0] || document.documentElement, a = document.createElement('script'), b = document.createElement('script');
			a.type = b.type = 'text/javascript';
			a.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js';
			b.src = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.1/jquery-ui.min.js';
			head.appendChild(a);
			head.appendChild(b);
			log('Loading jQuery & jQueryUI');
			(function jQwait() {
				log('...loading... jQuery: '+typeof jQuery+', window.jQuery: '+typeof unsafewindow.jQuery);
				if (typeof window.jQuery === 'undefined') {
					window.setTimeout(jQwait, 10000);
				} else {
					log('jQuery Loaded...');
					$(document).ready(document_ready);
				}
			})();
		}
	}
}

/********** CSS code **********
* Gets pushed into the <head> on loading
*/
function do_css(){
$('head').append("<style type=\"text/css\">\
.red { background: red !important; }\
.golem-config { float: none; margin-right: 0; }\
.golem-config > div { position: static; width: 196px; margin: 0; padding: 0; overflow: hidden; overflow-y: auto; }\
.golem-config #golem_fixed { float:right; margin:-2px; width:16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00.IDATx%DAb%60A%03%0Cd%0B03%81%18LH%02%10%80%2C%C0%84%24%00%96d%C2%A7%02%AB%19L%8C%A8%B6P%C3%E9%08%00%10%60%00%00z%03%C7%24%170%91%00%00%00%00IEND%AEB%60%82') no-repeat; }\
.golem-config-fixed { float: right; margin-right: 200px; }\
.golem-config-fixed > div { position: fixed; }\
.golem-config-fixed #golem_fixed { background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%DE%DE%DE%DD%DD%DDcccUUU%00%00%00%23%06%7B1%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%005IDATx%DAb%60A%03%0C%C4%0901%83%00%13%92%0A%B0%00%0B)%02%8C%CCLLL%CC%0Cx%0CefF%E8%81%B9%83%19%DDa%84%05H%F0%1C%40%80%01%00%FE9%03%C7%D4%8CU%A3%00%00%00%00IEND%AEB%60%82') no-repeat; }\
#golem-dashboard { position: absolute; width: 600px; height: 185px; margin: 0; border-left: 1px solid black; border-right:1px solid black; overflow: hidden; background: white; z-index: 1; }\
#golem-dashboard thead th { cursor: pointer }\
#golem-dashboard thead th.golem-sort:after { content: '&darr;'; }\
#golem-dashboard thead th.golem-sort-reverse:after { content: '&uarr;'; }\
#golem-dashboard tbody tr:nth-child(odd) { background: #eeeeee; }\
#golem-dashboard tbody th { text-align: left; font-weight: normal; }\
#golem-dashboard td, #golem-dashboard th { margin: 2px; text-align: center; padding: 0 8px; }\
#golem-dashboard > div { height: 163px; overflow: hidden; overflow-y: scroll; border-top: 1px solid #d3d3d3; }\
#golem-dashboard > div > div { padding: 2px; }\
#golem-dashboard .golem-status { width: 100%; }\
#golem-dashboard .golem-status tbody th { text-align: right; padding: 2px; font-weight: bold; }\
#golem-dashboard .golem-status tbody td { text-align: left; }\
#golem-dashboard .overlay { position: absolute; left:10px; margin: 3px; color: white; text-shadow: black 0px 0px 2px; }\
table.golem-graph { height: 100px }\
table.golem-graph tbody th, table.golem-graph tbody td { border-top: 1px solid #dddddd; border-bottom: 1px solid #dddddd; }\
table.golem-graph tbody th { max-width: 75px; }\
table.golem-graph tbody th:first-child { text-align: right; border-left: 1px solid #dddddd; border-right: 1px solid #cccccc; }\
table.golem-graph tbody th:first-child div { line-height: 60px; height: 60px; }\
table.golem-graph tbody th:first-child div:first-child, table.golem-graph tbody th:first-child div:last-child { line-height: 20px; height: 20px; }\
table.golem-graph tbody th:last-child { text-align: left; border-right: 1px solid #dddddd; vertical-align: bottom; }\
table.golem-graph tbody th:last-child div { position: relative; height: 10px; margin: -10px 0 0; }\
table.golem-graph tbody th:last-child div:nth-last-child(1) { color: #ff0000; }\
table.golem-graph tbody th:last-child div:nth-last-child(2) { color: #0000ff; }\
table.golem-graph tbody th:last-child div:nth-last-child(3) { color: #00ffff; }\
table.golem-graph tbody th:last-child div:nth-last-child(4) { color: #aa00aa; }\
table.golem-graph tbody td { margin: 0; padding: 0 !important; vertical-align: bottom; width: 5px; border-right: 1px solid #dddddd; }\
table.golem-graph tbody td:nth-child(12n+1) { border-right: 1px solid #cccccc; }\
table.golem-graph tbody td div div { margin: 0; padding: 0; width: 5px; }\
table.golem-graph tbody td div.bars div:nth-last-child(1) { background: #00ff00; }\
table.golem-graph tbody td div.bars div:nth-last-child(2) { background: #00aa00; }\
table.golem-graph tbody td div.bars div:nth-last-child(3) { background: #ffff00; }\
table.golem-graph tbody td div.bars div:nth-last-child(4) { background: #ff00ff; }\
table.golem-graph tbody td div.goal div { position: relative; height: 1px; margin: -1px 0 0; }\
table.golem-graph tbody td div.goal div:nth-last-child(1) { background: #ff0000; }\
table.golem-graph tbody td div.goal div:nth-last-child(2) { background: #0000ff; }\
table.golem-graph tbody td div.goal div:nth-last-child(3) { background: #00ffff; }\
table.golem-graph tbody td div.goal div:nth-last-child(4) { background: #aa00aa; }\
.golem-button, .golem-button-active { border: 1px solid #d3d3d3; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; font-weight: normal; font-size: 13px; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-button:hover, .golem-button-active { border: 1px solid #aaaaaa; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
img.golem-button, img.golem-button-active { margin-bottom: -2px }\
.golem-tab-header { position: relative; top: 1px; border: 1px solid #d3d3d3; display: inline-block; cursor: pointer; margin-left: 1px; margin-right: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 1px 2px; -moz-border-radius-topleft: 3px; -webkit-border-top-left-radius: 3px; border-top-left-radius: 3px; -moz-border-radius-topright: 3px; -webkit-border-top-right-radius: 3px; border-top-right-radius: 3px; }\
.golem-tab-header-active { border: 1px solid #aaaaaa; border-bottom: 0 !important; padding: 2px; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; }\
.golem-title { padding: 4px; overflow: hidden; border-bottom: 1px solid #aaaaaa; background: #cccccc url(http://cloutman.com/css/base/images/ui-bg_highlight-soft_75_cccccc_1x100.png) 50% 50% repeat-x; color: #222222; font-weight: bold; }\
.golem-panel > .golem-panel-header, .golem-panel > * > .golem-panel-header { border: 1px solid #d3d3d3; cursor: pointer; margin-top: 1px; background: #e6e6e6 url(http://cloutman.com/css/base/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; padding: 2px 2px 2px 2px; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }\
.golem-panel > .golem-panel-content, .golem-panel > * > .golem-panel-content { border: 1px solid #aaaaaa; border-top: 0 !important; padding: 2px 6px; background: #ffffff url(http://cloutman.com/css/base/images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #212121; display: none; -moz-border-radius-bottomleft: 3px; -webkit-border-bottom-left-radius: 3px; border-bottom-left-radius: 3px; -moz-border-radius-bottomright: 3px; -webkit-border-bottom-right-radius: 3px; border-bottom-right-radius: 3px; }\
.golem-panel-show > .golem-panel-header, .golem-panel-show > * > .golem-panel-header { border: 1px solid #aaaaaa; border-bottom: 0 !important; background: #dadada url(http://cloutman.com/css/base/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; -moz-border-radius-bottomleft: 0 !important; -webkit-border-bottom-left-radius: 0 !important; border-bottom-left-radius: 0 !important; -moz-border-radius-bottomright: 0 !important; -webkit-border-bottom-right-radius: 0 !important; border-bottom-right-radius: 0 !important; }\
.golem-panel-show > .golem-panel-content, .golem-panel-show > * > .golem-panel-content { display: block; }\
.golem-panel-sortable .golem-lock { display: none; }\
.golem-panel-content br:last-child { clear: both; }\
.golem-panel .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%22IDATx%DAb%60D%03%0C%D4%13%60%C0%10%60%C0%10%60%C0%10%60%20%A4%82%90-%149%1D%20%C0%00%81%0E%00%F1%DE%25%95%BE%00%00%00%00IEND%AEB%60%82') no-repeat; }\
.golem-panel .golem-panel-header .golem-lock { float: right; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%001IDATx%DAb%60D%03%0CD%0B000%A0%0800%C0D%E0%02%8C(%02%0C%0Cp%25%B8%05%18%09%0A%A0j%C1%B4%96%1C%BF%C0%01%40%80%01%00n%11%00%CF%7D%2Bk%9B%00%00%00%00IEND%AEB%60%82') no-repeat;}\
.golem-panel-show .golem-panel-header .golem-icon { float: left; width: 16px; height: 16px; background: url('data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTEUUU%00%00%00%F5%04%9F%A0%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%22IDATx%DAb%60D%03%0C4%13%60%80%00%24%15%08%3EL%0B%9C%CF%88N%D3%D0a%C8%00%20%C0%00%7F%DE%00%F1%CCc%A6b%00%00%00%00IEND%AEB%60%82') no-repeat; }\
</style>");
}
// Utility functions

// Prototypes to ease functionality

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
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
	var a = this.match(r), i;
	if (a) {
		a.shift();
		for (i=0; i<a.length; i++) {
			if (a[i] && a[i].search(/^[-+]?[0-9]*\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i]);
			}
		}
		if (a.length===1) {
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

Number.prototype.round = function(dec) {
	return result = Math.round(this*Math.pow(10,(dec||0))) / Math.pow(10,(dec||0));
};

Math.range = function(min, num, max) {
	return Math.max(min, Math.min(num, max));
};

//Array.prototype.unique = function() { var o = {}, i, l = this.length, r = []; for(i=0; i<l;i++) o[this[i]] = this[i]; for(i in o) r.push(o[i]); return r; };
//Array.prototype.inArray = function(value) {for (var i in this) if (this[i] === value) return true;return false;};

var makeTimer = function(sec) {
	var h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = Math.floor(sec % 60);
	return (h ? h+':'+(m>9 ? m : '0'+m) : m) + ':' + (s>9 ? s : '0'+s);
};

var WorkerByName = function(name) { // Get worker object by Worker.name
	for (var i=0; i<Workers.length; i++) {
		if (Workers[i].name.toLowerCase() === name.toLowerCase()) {
			return Workers[i];
		}
	}
	return null;
};

var WorkerById = function(id) { // Get worker object by panel id
	for (var i=0; i<Workers.length; i++) {
		if (Workers[i].id === id) {
			return Workers[i];
		}
	}
	return null;
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
	var l = 0, i;
	if (typeof obj === 'object') {
		for(i in obj) {
			l++;
		}
	} else if (typeof obj === 'array') {
		l = obj.length;
	}
	return l;
};

var unique = function (a) { // Return an array with no duplicates
	var o = {}, i, l = a.length, r = [];
	for(i = 0; i < l; i++) {
		o[a[i]] = a[i];
	}
	for(i in o) {
		r.push(o[i]);
	}
	return r;
};

var deleteElement = function(list, value) { // Removes matching elements from an array
	while (value in list) {
		list.splice(list.indexOf(value), 1);
	}
}
			
var sum = function (a) { // Adds the values of all array entries together
	var i, t = 0;
	if (isArray(a)) {
		for(i=0; i<a.length; i++) {
			t += sum(a[i] || 0);
		}
	} else if (typeof a === 'object') {
		for(i in a) {
			t += sum(a[i]);
		}
	} else if (typeof a === 'number') {
		t = a;
	} else if (typeof a === 'string' && a.search(/^[-+]?[0-9]*\.?[0-9]*$/) >= 0) {
		t = parseFloat(a);
	}
	return t;
};

var addCommas = function(s) { // Adds commas into a string, ignore any number formatting
	var a=s ? s.toString() : '0', r=new RegExp('(-?[0-9]+)([0-9]{3})');
	while(r.test(a)) {
		a = a.replace(r, '$1,$2');
	}
	return a;
};

var findInArray = function(list, value) {
	if (typeof list === 'array' || typeof list === 'object') {
		for (var i in list) {
			if (list[i] === value) {
				return true;
			}
		}
	}
	return false;
};

var arrayIndexOf = function(list, value) {
	if (isArray(list)) {
		for (var i=0; i<list.length; i++) {
			if (list[i] === value) {
				return i;
			}
		}
	}
	return -1;
};

var arrayLastIndexOf = function(list, value) {
	if (isArray(list)) {
		for (var i=list.length-1; i>=0; i--) {
			if (list[i] === value) {
				return i;
			}
		}
	}
	return -1;
};


var sortObject = function(object, sortfunc) {
	var list = [], output = {};
	for (i in object) {
		list.push(i);
	}
	list.sort(sortfunc);
	for (i=0; i<list.length; i++) {
		output[list[i]] = object[list[i]];
	}
	return output;
};

var getAttDefList = [];
var getAttDef = function(list, unitfunc, x, count, user) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], attack = 0, defend = 0, x2 = (x==='att'?'def':'att'), i, own;
	if (unitfunc) {
		for (i in list) {
			unitfunc(units, i, list);
		}
	} else {
		units = getAttDefList;
	}
	units.sort(function(a,b) {
		return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
	});
	for (i=0; i<units.length; i++) {
		own = typeof list[units[i]].own === 'number' ? list[units[i]].own : 1;
		if (user) {
			if (Math.min(count, own) > 0) {
//				debug('Utility','Using: '+Math.min(count, own)+' x '+units[i]+' = '+JSON.stringify(list[units[i]]));
				if (!list[units[i]].use) {
					list[units[i]].use = {};
				}
				list[units[i]].use[(user+'_'+x)] = Math.min(count, own);
			} else if (length(list[units[i]].use)) {
				delete list[units[i]].use[(user+'_'+x)];
				if (!length(list[units[i]].use)) {
					delete list[units[i]].use;
				}
			}
		}
//		if (count <= 0) {break;}
		own = Math.min(count, own);
		attack += own * list[units[i]].att;
		defend += own * list[units[i]].def;
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

var isArray = function(obj) {   
    return obj && typeof obj === 'object' && !(obj.propertyIsEnumerable('length')) && typeof obj.length === 'number';
};

var isNumber = function(num) {
	return num && typeof num === 'number';
};

var isWorker = function(obj) {
	return obj && findInArray(Workers,obj); // Only a worker if it's an active worker
};

var plural = function(i) {
	return (i === 1 ? '' : 's');
};

// Simulates PHP's date function
Date.prototype.format = function(format) {
	var returnStr = '';
	var replace = Date.replaceChars;
	for (var i = 0; i < format.length; i++) {
		var curChar = format.charAt(i);
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
	S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
	w: function() { return this.getDay(); },
	z: function() { return "Not Yet Supported"; },
	// Week
	W: function() { return "Not Yet Supported"; },
	// Month
	F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
	m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
	M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
	n: function() { return this.getMonth() + 1; },
	t: function() { return "Not Yet Supported"; },
	// Year
	L: function() { return (((this.getFullYear()%4==0)&&(this.getFullYear()%100 != 0)) || (this.getFullYear()%400==0)) ? '1' : '0'; },
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
	// Timezone
	e: function() { return "Not Yet Supported"; },
	I: function() { return "Not Supported"; },
	O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
	P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60)); },
	T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
	Z: function() { return -this.getTimezoneOffset() * 60; },
	// Full Date/Time
	c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
	r: function() { return this.toString(); },
	U: function() { return this.getTime() / 1000; }
};

var iscaap = function() {
	return (typeof caap != 'undefined');
};
/* Worker Prototype
   ----------------
new Worker(name, pages, settings)

*** User data***
.id			     - If we have a .display then this is the html #id of the worker
.name		   - String, the same as our class name.
.pages		  - String, list of pages that we want in the form "town.soldiers keep.stats"
.data		   - Object, for public reading, automatically saved
.option		 - Object, our options, changed from outide ourselves
.settings	       - Object, various values for various sections, default is always false / blank
				system (true/false) - exists for all games
				unsortable (true/false) - stops a worker being sorted in the queue, prevents this.work(true)
				advanced (true/false) - only visible when "Advanced" is checked
				before (array of worker names) - never let these workers get before us when sorting
				after (array of worker names) - never let these workers get after us when sorting
				keep (true/false) - without this data is flushed when not used - only keep if other workers regularly access you
				important (true/false) - can interrupt stateful workers [false]
				stateful (true/false) - only interrupt when we return QUEUE_RELEASE from work(true)
.display		- Create the display object for the settings page.

*** User functions ***
.init()		 - After the script has loaded, but before anything else has run. Data has been filled, but nothing has been run.
				This is the bext place to put default actions etc...
				Cannot rely on other workers having their data filled out...
.parse(change)  - This can read data from the current page and cannot perform any actions.
				change = false - Not allowed to change *anything*, cannot read from other Workers.
				change = true - Can now change inline and read from other Workers.
				return true - We need to run again with status=1
				return QUEUE_RELEASE - We want to run again with status=1, but feel free to interrupt (makes us stateful)
				return false - We're finished
.work(state)    - Do anything we need to do when it's our turn - this includes page changes.
				state = false - It's not our turn, don't start anything if we can't finish in this one call
				state = true - It's our turn, do everything - Only true if not interrupted
				return true if we need to keep working (after a delay etc)
				return false when someone else can work
.update(type)   - Called when the data or options have been changed (even on this._load()!). If !settings.data and !settings.option then call on data, otherwise whichever is set.
				type = "data" or "option"
.get(what)	      - Calls this._get(what)
				Official way to get any information from another worker
				Overload for "special" data, and pass up to _get if basic data
.set(what,value)- Calls this._set(what,value)
				Official way to set any information for another worker
				Overload for "special" data, and pass up to _set if basic data

NOTE: If there is a work() but no display() then work(false) will be called before anything on the queue, but it will never be able to have focus (ie, read only)

*** Private data ***
._loaded		- true once ._init() has run
._working		- Prevent recursive calling of various private functions
._changed		- Timestamp of the last time this.data changed
._watching		- List of other workers that want to have .update() after this.update()

*** Private functions ***
._get(what)				- Returns the data requested, auto-loads if needed, what is 'path.to.data'
._set(what,val)			- Sets this.data[what] to value, auto-loading if needed

._setup()				- Only ever called once - might even remove us from the list of workers, otherwise loads the data...
._init(keep)			- Calls .init(), loads then saves data (for default values), delete this.data if !nokeep and settings.nodata, then removes itself from use

._load(type)			- Loads data / option from storage, merges with current values, calls .update(type) on change
._save(type)			- Saves data / option to storage, calls .update(type) on change

._flush()				- Calls this._save() then deletes this.data if !this.settings.keep
._unflush()				- Loads .data if it's not there already

._parse(change)			- Calls this.parse(change) inside a try / catch block
._work(state)			- Calls this.work(state) inside a try / catch block

._update(type,worker)	- Calls this.update(type,worker), loading and flushing .data if needed. worker is "null" unless a watched worker.
._watch(worker)			- Add a watcher to worker - so this.update() gets called whenever worker.update() does
._unwatch(worker)		- Removes a watcher from worker (safe to call if not watching).
._remind(secs)			- Calls this._update('reminder') after a specified delay
*/
var Workers = [];
var WorkerStack = []; // Use "WorkerStack.length && WorkerStack[WorkerStack.length-1].name" for current worker name...
/*
if (typeof GM_getValue !== 'undefined') {
	var setItem = function(n,v){GM_setValue(n, v);}
	var getItem = function(n){return GM_getValue(n);}
} else {
	if (typeof localStorage !== 'undefined') {
		var setItem = function(n,v){localStorage.setItem('golem.' + APP + n, v);}
		var getItem = function(n){return localStorage.getItem('golem.' + APP + n);}
	} else if (typeof window.localStorage !== 'undefined') {
		var setItem = function(n,v){window.localStorage.setItem('golem.' + APP + n, v);}
		var getItem = function(n){return window.localStorage.getItem('golem.' + APP + n);}
	} else if (typeof globalStorage !== 'undefined') {
		var setItem = function(n,v){globalStorage[location.hostname].setItem('golem.' + APP + n, v);}
		var getItem = function(n){return globalStorage[location.hostname].getItem('golem.' + APP + n);}
	}
}
*/
if (isGreasemonkey) {
	var setItem = function(n,v){GM_setValue(n, v);}
	var getItem = function(n){return GM_getValue(n);}
} else {
	var setItem = function(n,v){localStorage.setItem('golem.' + APP + '.' + n, v);}
	var getItem = function(n){return localStorage.getItem('golem.' + APP + '.' + n);}
}

function Worker(name,pages,settings) {
	Workers.push(this);

	// User data
	this.id = null;
	this.name = name;
	this.pages = pages;

	this.defaults = null; // {app:{data:{}, options:{}} - replaces with app-specific data, can be used for any this.* wanted...

	this.settings = settings || {};

	this.data = {};
	this.option = {};
	this.runtime = null;// {} - set to default runtime values in your worker!
	this.display = null;

	// User functions
	this.init = null; //function() {};
	this.parse = null; //function(change) {return false;};
	this.work = null; //function(state) {return false;};
	this.update = null; //function(type,worker){};
	this.get = function(what) {return this._get(what);}; // Overload if needed
	this.set = function(what,value) {return this._set(what,value);}; // Overload if needed

	// Private data
	this._rootpath = true; // Override save path, replaces userID + '.' with ''
	this._loaded = false;
	this._working = {data:false, option:false, runtime:false, update:false};
	this._changed = Date.now();
	this._watching = [];
}

// Private functions - only override if you know exactly what you're doing
Worker.prototype._flush = function() {
	WorkerStack.push(this);
	this._save();
	if (!this.settings.keep) {
		delete this.data;
	}
	WorkerStack.pop();
};

Worker.prototype._get = function(what) { // 'path.to.data'
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data;
	if (!x.length || (x[0] !== 'data' && x[0] !== 'option' && x[0] !== 'runtime')) {
		x.unshift('data');
	}
	if (x[0] === 'data') {
		!this._loaded && this._init();
		this._unflush();
	}
	data = this[x.shift()];
	try {
		switch(x.length) {
			case 0: return data;
			case 1: return data[x[0]];
			case 2: return data[x[0]][x[1]];
			case 3: return data[x[0]][x[1]][x[2]];
			case 4: return data[x[0]][x[1]][x[2]][x[3]];
			case 5: return data[x[0]][x[1]][x[2]][x[3]][x[4]];
			case 6: return data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]];
			case 7: return data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]];
			default:break;
		}
	} catch(e) {
		WorkerStack.push(this);
		debug(this.name,e.name + ' in ' + this.name + '.get('+what+'): ' + e.message);
		WorkerStack.pop();
	}
	return null;
};

Worker.prototype._init = function() {
	if (this._loaded) {
		return;
	}
	WorkerStack.push(this);
	this._loaded = true;
	try {
		this.init && this.init();
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.init(): ' + e.message);
	}
	WorkerStack.pop();
};

Worker.prototype._load = function(type) {
	if (type !== 'data' && type !== 'option' && type !== 'runtime') {
		this._load('data');
		this._load('option');
		this._load('runtime');
		return;
	}
	WorkerStack.push(this);
	var v = getItem((this._rootpath ? userID + '.' : '') + type + '.' + this.name);
	if (v) {
		try {
			v = JSON.parse(v);
		} catch(e) {
			debug(this.name + '._load(' + type + '): Not JSON data, should only appear once for each type...');
			v = eval(v); // We used to save our data in non-JSON format...
		}
		this[type] = $.extend(true, {}, this[type], v);
	}
	WorkerStack.pop();
};

Worker.prototype._parse = function(change) {
	WorkerStack.push(this);
	var result = false;
	try {
		result = this.parse && this.parse(change);
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.parse(' + change + '): ' + e.message);
	}
	WorkerStack.pop();
	return result;
};

Worker.prototype._remind = function(seconds) {
	var me = this;
	window.setTimeout(function(){me._update('reminder', null);}, seconds * 1000);
};

Worker.prototype._save = function(type) {
	if (type !== 'data' && type !== 'option' && type !== 'runtime') {
		return this._save('data') + this._save('option') + this._save('runtime');
	}
	if (typeof this[type] === 'undefined' || !this[type] || this._working[type]) {
		return false;
	}
	var n = (this._rootpath ? userID + '.' : '') + type + '.' + this.name, v = JSON.stringify(this[type]);
	if (getItem(n) === 'undefined' || getItem(n) !== v) {
		WorkerStack.push(this);
		this._working[type] = true;
		this._changed = Date.now();
		this._update(type, null);
		setItem(n, v);
		this._working[type] = false;
		WorkerStack.pop();
		return true;
	}
	return false;
};

Worker.prototype._set = function(what, value) {
	WorkerStack.push(this);
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), data;
	if (!x.length || (x[0] !== 'data' && x[0] !== 'option' && x[0] !== 'runtime')) {
		x.unshift('data');
	}
	if (x[0] === 'data') {
		!this._loaded && this._init();
		this._unflush();
	}
	data = this[x.shift()];
	try {
		switch(x.length) {
			case 0: data = value; break; // Nobody should ever do this!!
			case 1: data[x[0]] = value; break;
			case 2: data[x[0]][x[1]] = value; break;
			case 3: data[x[0]][x[1]][x[2]] = value; break;
			case 4: data[x[0]][x[1]][x[2]][x[3]] = value; break;
			case 5: data[x[0]][x[1]][x[2]][x[3]][x[4]] = value; break;
			case 6: data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]] = value; break;
			case 7: data[x[0]][x[1]][x[2]][x[3]][x[4]][x[5]][x[6]] = value; break;
			default:break;
		}
//	      this._save();
	} catch(e) {
		debug(e.name + ' in ' + this.name + '.set('+what+', '+value+'): ' + e.message);
	}
	WorkerStack.pop();
	return null;
};

Worker.prototype._setup = function() {
	WorkerStack.push(this);
	if (this.defaults && this.defaults[APP]) {
		for (var i in this.defaults[APP]) {
			this[i] = this.defaults[APP][i];
		}
	}
	if (this.settings.system || !this.defaults || this.defaults[APP]) {
		this._load();
	} else { // Get us out of the list!!!
		Workers.splice(Workers.indexOf(this), 1);
	}
	WorkerStack.pop();
};

Worker.prototype._unflush = function() {
	WorkerStack.push(this);
	!this._loaded && this._init();
	!this.settings.keep && !this.data && this._load('data');
	iscaap() && (typeof this.caap_load == 'function') && this.caap_load();
	WorkerStack.pop();
};

Worker.prototype._unwatch = function(worker) {
	deleteElement(worker._watching,this);
};

Worker.prototype._update = function(type, worker) {
	if (this._loaded && (this.update || this._watching.length)) {
		WorkerStack.push(this);
		var i, flush = false;
		this._working.update = true;
		if (typeof this.data === 'undefined') {
			flush = true;
			this._unflush();
		}
		try {
			this.update && this.update(type, worker);
		}catch(e) {
			debug(e.name + ' in ' + this.name + '.update(' + (type ? type : 'null') + ', ' + (worker ? worker.name : 'null') + '): ' + e.message);
		}
		if (!worker) {
			for (i=0; i<this._watching.length; i++) {
				this._watching[i]._update(type, this);
			}
		}
		flush && this._flush();
		this._working.update = false;
		WorkerStack.pop();
	}
};

Worker.prototype._watch = function(worker) {
	!findInArray(worker._watching,this) && worker._watching.push(this);
};

Worker.prototype._work = function(state) {
	WorkerStack.push(this);
	var result = false;
	try {
		result = this.work && this.work(state);
	}catch(e) {
		debug(e.name + ' in ' + this.name + '.work(' + state + '): ' + e.message);
	}
	WorkerStack.pop();
	return result;
};

/********** Worker.Config **********
* Has everything to do with the config
*/
var Config = new Worker('Config');

Config.settings = {
	system:true,
	keep:true
};

Config.option = {
	display:'block',
	fixed:true,
	advanced:false,
	exploit:false
};

Config.init = function() {
	if (iscaap()) {
		return false;
	}
	$('head').append('<link rel="stylesheet" href="http://cloutman.com/css/base/jquery-ui.css" type="text/css" />');
	var $btn, $golem_config, $newPanel, i, j, k;
	$('div.UIStandardFrame_Content').after('<div class="golem-config' + (Config.option.fixed?' golem-config-fixed':'') + '"><div class="ui-widget-content"><div class="golem-title">Castle Age Golem v' + VERSION + '<img id="golem_fixed"></div><div id="golem_buttons" style="margin:4px;"><img class="golem-button' + (Config.option.display==='block'?'-active':'') + '" id="golem_options" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%E2%E2%E2%8A%8A%8A%AC%AC%AC%FF%FF%FFUUU%1C%CB%CE%D3%00%00%00%04tRNS%FF%FF%FF%00%40*%A9%F4%00%00%00%3DIDATx%DA%A4%8FA%0E%00%40%04%03%A9%FE%FF%CDK%D2%B0%BBW%BD%CD%94%08%8B%2F%B6%10N%BE%A2%18%97%00%09pDr%A5%85%B8W%8A%911%09%A8%EC%2B%8CaM%60%F5%CB%11%60%00%9C%F0%03%07%F6%BC%1D%2C%00%00%00%00IEND%AEB%60%82"></div><div style="display:'+Config.option.display+';"><div id="golem_config" style="margin:0 4px;overflow:hidden;overflow-y:auto;"></div><div style="text-align:right;"><label>Advanced <input type="checkbox" id="golem-config-advanced"' + (Config.option.advanced ? ' checked' : '') + '></label></div></div></div></div>');
	$('#golem_options').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Config.option.display = Config.option.display==='block' ? 'none' : 'block';
		$('#golem_config').parent().toggle('blind'); //Config.option.fixed?null:
		Config._save('option');
	});
	$('#golem_fixed').click(function(){
		Config.option.fixed ^= true;
		$(this).closest('.golem-config').toggleClass('golem-config-fixed');
		Config._save('option');
	});
	$golem_config = $('#golem_config');
	for (i in Workers) {
		$golem_config.append(Config.makePanel(Workers[i]));
	}
	$golem_config.sortable({axis:"y"}); //, items:'div', handle:'h3' - broken inside GM
	$('.golem-config .golem-panel > h3').click(function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){
				$(this).parent().toggleClass('golem-panel-show');
				Config.option.active = [];
				$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
				Config._save('option');
			});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
			Config.option.active = [];
			$('.golem-panel-show').each(function(i,el){Config.option.active.push($(this).attr('id'));});
			Config._save('option');
		}
	});
	$golem_config.children('.golem-panel-sortable')
		.draggable({ connectToSortable:'#golem_config', axis:'y', distance:5, scroll:false, handle:'h3', helper:'clone', opacity:0.75, zIndex:100,
refreshPositions:true, stop:function(){Config.updateOptions();} })
		.droppable({ tolerance:'pointer', over:function(e,ui) {
			var i, order = Config.getOrder(), me = WorkerByName($(ui.draggable).attr('name')), newplace = arrayIndexOf(order, $(this).attr('name'));
			if (arrayIndexOf(order, 'Idle') >= newplace) {
				if (me.settings.before) {
					for(i=0; i<me.settings.before.length; i++) {
						if (arrayIndexOf(order, me.settings.before[i]) <= newplace) {
							return;
						}
					}
				}
				if (me.settings.after) {
					for(i=0; i<me.settings.after.length; i++) {
						if (arrayIndexOf(order, me.settings.after[i]) >= newplace) {
							return;
						}
					}
				}
			}
			if (newplace < arrayIndexOf(order, $(ui.draggable).attr('name'))) {
				$(this).before(ui.draggable);
			} else {
				$(this).after(ui.draggable);
			}
		} });
	for (i in Workers) { // Propagate all before and after settings
		if (Workers[i].settings.before) {
			for (j=0; j<Workers[i].settings.before.length; j++) {
				k = WorkerByName(Workers[i].settings.before[j]);
				if (k) {
					k.settings.after = k.settings.after || [];
					k.settings.after.push(Workers[i].name);
					k.settings.after = unique(k.settings.after);
//					debug('Pushing '+k.name+' after '+Workers[i].name+' = '+k.settings.after);
				}
			}
		}
		if (Workers[i].settings.after) {
			for (j=0; j<Workers[i].settings.after.length; j++) {
				k = WorkerByName(Workers[i].settings.after[j]);
				if (k) {
					k.settings.before = k.settings.before || [];
					k.settings.before.push(Workers[i].name);
					k.settings.before = unique(k.settings.before);
//					debug('Pushing '+k.name+' before '+Workers[i].name+' = '+k.settings.before);
				}
			}
		}
	}
	$.expr[':'].golem = function(obj, index, meta, stack) { // $('input:golem(worker,id)') - selects correct id
		var args = meta[3].toLowerCase().split(',');
		if ($(obj).attr('id') === PREFIX + args[0].trim().replace(/[^0-9a-z]/g,'-') + '_' + args[1].trim()) {
			return true;
		}
		return false;
	};
	$('input.golem_addselect').live('click', function(){
		var i, value, values = $('.golem_select', $(this).parent()).val().split(',');
		for (i=0; i<values.length; i++) {
			value = values[i].trim();
			if (value) {
				$('select.golem_multiple', $(this).parent()).append('<option>' + value + '</option>');
			}
		}
		Config.updateOptions();
	});
	$('input.golem_delselect').live('click', function(){
		$('select.golem_multiple option[selected=true]', $(this).parent()).each(function(i,el){$(el).remove();})
		Config.updateOptions();
	});
	$('input,textarea,select', $golem_config).change( function(){
		Config.updateOptions();
	});
	$('#golem-config-advanced').click(function(){
		Config.updateOptions();
		$('.golem-advanced').css('display', Config.option.advanced ? '' : 'none');}
	);
};

Config.makePanel = function(worker) {
	var i, o, x, id, step, show, $head, $panel, display = worker.display, panel = [], txt = [], list = [], options = {
		before: '',
		after: '',
		suffix: '',
		className: '',
		between: 'to',
		size: 7,
		min: 0,
		max: 100
	};
	if (!display) {
		return false;
	}
	worker.id = 'golem_panel_'+worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-');
	show = findInArray(this.option.active, worker.id);
	$head = $('<div id="' + worker.id + '" class="golem-panel' + (worker.settings.unsortable?'':' golem-panel-sortable') + (show?' golem-panel-show':'') + (worker.settings.advanced ? ' golem-advanced' : '') + '"' + ((worker.settings.advanced && !this.option.advanced) || (worker.settings.exploit && !this.option.exploit) ? ' style="display:none;"' : '') + ' name="' + worker.name + '"><h3 class="golem-panel-header "><img class="golem-icon" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%00%00%00%00%00%00%A5g%B9%CF%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%0FIDATx%DAb%60%18%05%C8%00%20%C0%00%01%10%00%01%3BBBK%00%00%00%00IEND%AEB%60%82">' + worker.name + '<img class="golem-lock" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%00%00%00%00%00%00%A5g%B9%CF%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%0FIDATx%DAb%60%18%05%C8%00%20%C0%00%01%10%00%01%3BBBK%00%00%00%00IEND%AEB%60%82"></h3></div>');
	switch (typeof display) {
		case 'array':
		case 'object':
			for (i in display) {
				txt = [];
				list = [];
				o = $.extend(true, {}, options, display[i]);
				o.real_id = PREFIX + worker.name.toLowerCase().replace(/[^0-9a-z]/g,'-') + '_' + o.id;
				o.value = worker.get('option.'+o.id) || null;
				o.alt = (o.alt ? ' alt="'+o.alt+'"' : '');
				if (o.hr) {
					txt.push('<br><hr style="clear:both;margin:0;">');
				}
				if (o.title) {
					txt.push('<div style="text-align:center;font-size:larger;font-weight:bold;">'+o.title.replace(' ','&nbsp;')+'</div>');
				}
				if (o.label) {
					txt.push('<span style="float:left;margin-top:2px;">'+o.label.replace(' ','&nbsp;')+'</span>');
					if (o.text || o.checkbox || o.select) {
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
						txt.push('<span style="float:right" id="' + o.real_id + '">' + (o.value || o.info) + '</span>');
					} else {
						txt.push(o.info);
					}
				} else if (o.text) {
					txt.push('<input type="text" id="' + o.real_id + '" size="' + o.size + '" value="' + (o.value || '') + '">');
				} else if (o.checkbox) {
					txt.push('<input type="checkbox" id="' + o.real_id + '"' + (o.value ? ' checked' : '') + '>');
				} else if (o.select) {
					switch (typeof o.select) {
						case 'number':
							step = Divisor(o.select);
							for (x=0; x<=o.select; x+=step) {
								list.push('<option' + (o.value==x ? ' selected' : '') + '>' + x + '</option>');
							}
							break;
						case 'string':
							o.className = ' class="golem_'+o.select+'"';
							if (this.data && this.data[o.select] && (typeof this.data[o.select] === 'array' || typeof this.data[o.select] === 'object')) {
								o.select = this.data[o.select];
							} else {
								break; // deliberate fallthrough
							}
						case 'array':
						case 'object':
							if (isArray(o.select)) {
								for (x=0; x<o.select.length; x++) {
									list.push('<option value="' + o.select[x] + '"' + (o.value==o.select[x] ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
								}
							} else {
								for (x in o.select) {
									list.push('<option value="' + x + '"' + (o.value==x ? ' selected' : '') + '>' + o.select[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
								}
							}
							break;
					}
					txt.push('<select id="' + o.real_id + '"' + o.className + o.alt + '>' + list.join('') + '</select>');
				} else if (o.multiple) {
					if (typeof o.value === 'array' || typeof o.value === 'object') {
						for (i in o.value) {
							list.push('<option value="'+o.value[i]+'">'+o.value[i]+'</option>');
						}
					}
					txt.push('<select style="width:100%;clear:both;" class="golem_multiple" multiple id="' + o.real_id + '">' + list.join('') + '</select><br>');
					if (typeof o.multiple === 'string') {
						txt.push('<input class="golem_select" type="text" size="' + o.size + '">');
					} else {
						list = [];
						switch (typeof o.multiple) {
							case 'number':
								step = Divisor(o.select);
								for (x=0; x<=o.multiple; x+=step) {
									list.push('<option>' + x + '</option>');
								}
								break;
							case 'array':
							case 'object':
								if (isArray(o.multiple)) {
									for (x=0; x<o.multiple.length; x++) {
										list.push('<option value="' + o.multiple[x] + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
									}
								} else {
									for (x in o.multiple) {
										list.push('<option value="' + x + '">' + o.multiple[x] + (o.suffix ? ' '+o.suffix : '') + '</option>');
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
				panel.push('<div' + (o.advanced  ? ' class="golem-advanced"' : '') + (o.advanced || o.exploit ? ' style="' + ((o.advanced && !this.option.advanced) || (o.exploit && !this.option.exploit) ? 'display:none;' : '') + (o.exploit ? 'border:1px solid red;background:#ffeeee;' : '') + '"' : '') + (o.help ? ' title="' + o.help + '"' : '') + '>' + txt.join('') + '<br></div>');
			}
			$head.append('<div class="golem-panel-content" style="font-size:smaller;">' + panel.join('') + '</div>');
			return $head;
//		case 'function':
//			$panel = display();
//			if ($panel) {
//				$head.append($panel);
//				return $head;
//			}
//			return null;
		default:
			return null;
	}
};

Config.set = function(key, value) {
	if (iscaap()) {
		return false;
	}
	this._unflush();
	if (!this.data[key] || JSON.stringify(this.data[key]) !== JSON.stringify(value)) {
		this.data[key] = value;
		$('select.golem_' + key).each(function(i,el){
			var worker = WorkerById($(el).closest('div.golem-panel').attr('id')), val = worker ? worker.get(['option', $(el).attr('id').regex(/_([^_]*)$/i)]) : null, list = Config.data[key], options = [];
			if (isArray(list)) {
				for (i=0; i<list.length; i++) {
					options.push('<option value="' + list[i] + '">' + list[i] + '</option>');//' + (val===i ? ' selected' : '') + '
				}
			} else {
				for (i in list) {
					options.push('<option value="' + i + '">' + list[i] + '</option>');//' + (val===i ? ' selected' : '') + '
				}
			}
			$(el).html(options.join('')).val(val);
		});
		this._save();
		return true;
	}
	return false;
};

Config.updateOptions = function() {
//	debug('Options changed');
	// Get order of panels first
	Queue.option.queue = this.getOrder();
	// Now can we see the advanced stuff
	this.option.advanced = $('#golem-config-advanced').attr('checked');
	// Now save the contents of all elements with the right id style
	$('#golem_config :input').each(function(i,el){
		if ($(el).attr('id')) {
			var val, tmp = $(el).attr('id').slice(PREFIX.length).regex(/([^_]*)_(.*)/i);
			if (!tmp) {
				return;
			}
			if ($(el).attr('type') === 'checkbox') {
				val = $(el).attr('checked');
			} else if ($(el).attr('multiple')) {
				val = [];
				$('option', el).each(function(i,el){ val.push($(el).text()); });
			} else {
				val = $(el).attr('value') || ($(el).val() || null);
				if (val && val.search(/[^0-9.]/) === -1) {
					val = parseFloat(val);
				}
			}
			try {
				WorkerByName(tmp[0]).set('option.'+tmp[1], val);
			} catch(e) {
				debug(e.name + ' in Config.updateOptions(): ' + $(el).attr('id') + '(' + JSON.stringify(tmp) + ') = ' + e.message);
			}
		}
	});
	for (i=0; i<Workers.length; i++) {
		Workers[i]._save('option');
	}
};

Config.getOrder = function() {
	var order = [];
	$('#golem_config > div').each(function(i,el){
		order.push($(el).attr('name'));
	});
	return unique(order);
};

/********** Worker.Dashboard **********
* Displays statistics and other useful info
*/
var Dashboard = new Worker('Dashboard');

Dashboard.settings = {
	keep:true
};

Dashboard.defaults = {
	castle_age:{
		pages:'*'
	}
};

Dashboard.option = {
	display:'block',
	active:null
};

Dashboard.init = function() {
	var id, $btn, tabs = [], divs = [], active = this.option.active;
	for (i=0; i<Workers.length; i++) {
		if (Workers[i].dashboard) {
			id = 'golem-dashboard-'+Workers[i].name;
			if (!active) {
				this.option.active = active = id;
			}
			tabs.push('<h3 name="'+id+'" class="golem-tab-header' + (active===id ? ' golem-tab-header-active' : '') + '">' + (Workers[i] === this ? '&nbsp;*&nbsp;' : Workers[i].name) + '</h3>');
			divs.push('<div id="'+id+'"'+(active===id ? '' : ' style="display:none;"')+'></div>');
			this._watch(Workers[i]);
		}
	}
	if (iscaap()) {
		return false;
	}
	$('<div id="golem-dashboard" style="top:' + $('#app'+APPID+'_main_bn').offset().top+'px;display:' + this.option.display+';">' + tabs.join('') + '<div>' + divs.join('') + '</div></div>').prependTo('.UIStandardFrame_Content');
	$('.golem-tab-header').click(function(){
		if ($(this).hasClass('golem-tab-header-active')) {
			return;
		}
		if (Dashboard.option.active) {
			$('h3[name="'+Dashboard.option.active+'"]').removeClass('golem-tab-header-active');
			$('#'+Dashboard.option.active).hide();
		}
		Dashboard.option.active = $(this).attr('name');
		$(this).addClass('golem-tab-header-active');
		Dashboard.update();
		$('#'+Dashboard.option.active).show();
		Dashboard._save('option');
	});
	$('#golem-dashboard .golem-panel > h3').live('click', function(event){
		if ($(this).parent().hasClass('golem-panel-show')) {
			$(this).next().hide('blind',function(){$(this).parent().toggleClass('golem-panel-show');});
		} else {
			$(this).parent().toggleClass('golem-panel-show');
			$(this).next().show('blind');
		}
	});
	$('#golem-dashboard thead th').live('click', function(event){
		var worker = WorkerByName(Dashboard.option.active.substr(16));
		worker._unflush();
		worker.dashboard($(this).prevAll().length, $(this).attr('name')==='sort');
	});

	$('#golem_buttons').append('<img class="golem-button' + (Dashboard.option.display==='block'?'-active':'') + '" id="golem_toggle_dash" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%1EPLTE%BA%BA%BA%EF%EF%EF%E5%E5%E5%D4%D4%D4%D9%D9%D9%E3%E3%E3%F8%F8%F8%40%40%40%FF%FF%FF%00%00%00%83%AA%DF%CF%00%00%00%0AtRNS%FF%FF%FF%FF%FF%FF%FF%FF%FF%00%B2%CC%2C%CF%00%00%00EIDATx%DA%9C%8FA%0A%00%20%08%04%B5%CC%AD%FF%7F%B8%0D%CC%20%E8%D20%A7AX%94q!%7FA%10H%04%F4%00%19*j%07Np%9E%3B%C9%A0%0C%BA%DC%A1%91B3%98%85%AF%D9%E1%5C%A1%FE%F9%CB%14%60%00D%1D%07%E7%0AN(%89%00%00%00%00IEND%AEB%60%82">');
	$('#golem_toggle_dash').click(function(){
		$(this).toggleClass('golem-button golem-button-active');
		Dashboard.option.display = Dashboard.option.display==='block' ? 'none' : 'block';
		if (Dashboard.option.display === 'block' && !$('#'+Dashboard.option.active).children().length) {
			WorkerByName(Dashboard.option.active.substr(16)).dashboard();
		}
		$('#golem-dashboard').toggle('drop');
		Dashboard._save('option');
	});
	window.setInterval(function(){
		$('.golem-timer').each(function(i,el){
			var time = $(el).text().parseTimer();
			if (time && time > 0) {
				$(el).text(makeTimer($(el).text().parseTimer() - 1));
			} else {
				$(el).removeClass('golem-timer').text('now?');
			}
		});
		$('.golem-time').each(function(i,el){
			var time = parseInt($(el).attr('name')) - Date.now();
			if (time && time > 0) {
				$(el).text(makeTimer(time / 1000));
			} else {
				$(el).removeClass('golem-time').text('now?');
			}
		});
	},1000);
};

Dashboard.parse = function(change) {
	if (iscaap()) {
		return false;
	}
	$('#golem-dashboard').css('top', $('#app'+APPID+'_main_bn').offset().top+'px');
};

Dashboard.update = function(type, worker) {
	if (!this._loaded || !worker) { // we only care about updating the dashboard when something we're *watching* changes (including ourselves)
		return;
	}
	worker = WorkerByName(Dashboard.option.active.substr(16));
	var id = 'golem-dashboard-'+worker.name;
	if (this.option.active === id && this.option.display === 'block') {
		try {
			worker._unflush();
			worker.dashboard();
		}catch(e) {
			debug(e.name + ' in ' + worker.name + '.dashboard(): ' + e.message);
		}
	} else {
		$('#'+id).empty();
	}
};

Dashboard.dashboard = function() {
	var i, list = [];
	for (i=0; i<Workers.length; i++) {
		if (this.data[Workers[i].name]) {
			list.push('<tr><th>' + Workers[i].name + ':</th><td id="golem-status-' + Workers[i].name + '">' + this.data[Workers[i].name] + '</td></tr>');
		}
	}
	list.sort(); // Ok with plain text as first thing that can change is name
	$('#golem-dashboard-Dashboard').html('<table cellspacing="0" cellpadding="0" class="golem-status">' + list.join('') + '</table>');
};

Dashboard.status = function(worker, html) {
	if (html) {
		this.data[worker.name] = html;
	} else {
		delete this.data[worker.name];
	}
	this._save();
};

/********** Worker.Page() **********
* All navigation including reloading
*/
var Page = new Worker('Page');

Page.settings = {
	system:true,
	unsortable:true,
	keep:true
};

Page.option = {
	timeout: 15,
	retry: 5
};

Page.page = '';
Page.last = null; // Need to have an "auto retry" after a period
Page.lastclick = null;
Page.when = null;
Page.retry = 0;
Page.checking = true;
Page.node_trigger = null;
Page.loading = false;

Page.display = [
	{
		id:'timeout',
		label:'Retry after',
		select:[10, 15, 30, 60],
		after:'seconds'
	}
];

Page.defaults = {
	'castle_age':{
		pageNames:{
			index:					{url:'index.php', selector:'#app'+APPID+'_indexNewFeaturesBox'},
			quests_quest:			{url:'quests.php', image:'tab_quest_on.gif'}, // If we ever get this then it means a new land...
			quests_quest1:			{url:'quests.php?land=1', image:'land_fire_sel.gif'},
			quests_quest2:			{url:'quests.php?land=2', image:'land_earth_sel.gif'},
			quests_quest3:			{url:'quests.php?land=3', image:'land_mist_sel.gif'},
			quests_quest4:			{url:'quests.php?land=4', image:'land_water_sel.gif'},
			quests_quest5:			{url:'quests.php?land=5', image:'land_demon_realm_sel.gif'},
			quests_quest6:			{url:'quests.php?land=6', image:'land_undead_realm_sel.gif'},
			quests_quest7:			{url:'quests.php?land=7', image:'tab_underworld_big.gif'},
			quests_quest8:			{url:'quests.php?land=8', image:'tab_heaven_big2.gif'},
			quests_demiquests:		{url:'symbolquests.php', image:'demi_quest_on.gif'},
			quests_atlantis:		{url:'monster_quests.php', image:'tab_atlantis_on.gif'},
			battle_battle:			{url:'battle.php', image:'battle_on.gif'},
			battle_training:		{url:'battle_train.php', image:'training_grounds_on_new.gif'},
			battle_rank:			{url:'battlerank.php', image:'tab_battle_rank_on.gif'},
			battle_raid:			{url:'raid.php', image:'tab_raid_on.gif'},
			battle_arena:			{url:'arena.php', image:'tab_arena_on.gif'},
			heroes_heroes:			{url:'mercenary.php', image:'tab_heroes_on.gif'},
			heroes_generals:		{url:'generals.php', image:'tab_generals_on.gif'},
			town_soldiers:			{url:'soldiers.php', image:'tab_soldiers_on.gif'},
			town_blacksmith:		{url:'item.php', image:'tab_black_smith_on.gif'},
			town_magic:				{url:'magic.php', image:'tab_magic_on.gif'},
			town_land:				{url:'land.php', image:'tab_land_on.gif'},
			oracle_oracle:			{url:'oracle.php', image:'oracle_on.gif'},
			oracle_demipower:		{url:'symbols.php', image:'demi_on.gif'},
			oracle_treasurealpha:	{url:'treasure_chest.php', image:'tab_treasure_alpha_on.gif'},
			oracle_treasurevanguard:{url:'treasure_chest.php?treasure_set=alpha', image:'tab_treasure_vanguard_on.gif'},
			oracle_treasureonslaught:{url:'treasure_chest.php?treasure_set=onslaught', image:'tab_treasure_onslaught_on.gif'},
			keep_stats:				{url:'keep.php?user='+userID, image:'tab_stats_on.gif'},
			keep_eliteguard:		{url:'party.php?user='+userID, image:'tab_elite_guard_on.gif'},
			keep_achievements:		{url:'achievements.php', image:'tab_achievements_on.gif'},
			keep_alchemy:			{url:'alchemy.php', image:'tab_alchemy_on.gif'},
			keep_monster:			{url:'battle_monster.php', image:'tab_monster_on.jpg'},
			keep_monster_active2:	{url:'battle_monster.php', selector:'div[style*="nm_monster_list_button.gif"]'},
			keep_monster_active:	{url:'raid.php', image:'dragon_view_more.gif'},
			army_invite:			{url:'army.php', image:'invite_on.gif'},
			army_gifts:				{url:'gift.php', selector:'#app'+APPID+'_giftContainer'},
			army_viewarmy:			{url:'army_member.php', image:'view_army_on.gif'},
			army_sentinvites:		{url:'army_reqs.php', image:'sent_invites_on.gif'},
			army_newsfeed:			{url:'army_news_feed.php', selector:'#app'+APPID+'_army_feed_header'},
			apprentice_collect:		{url:'apprentice.php?collect=true', image:'ma_view_progress2.gif'}
		}
	}
};

Page.init = function() {
	// Only perform the check on the two id's referenced in get_cached_ajax()
	// Give a short delay due to multiple children being added at once, 0.1 sec should be more than enough
	$('body').bind('DOMNodeInserted', function(event){
		if (!Page.node_trigger && ($(event.target).attr('id') === 'app'+APPID+'_app_body_container' || $(event.target).attr('id') === 'app'+APPID+'_globalContainer')) {
			Page.node_trigger = window.setTimeout(function(){Page.node_trigger=null;Page.parse_all();},100);
		}
	});
};

Page.parse_all = function() {
	WorkerStack.push(this);
	Page.identify();
	var i, list = [];
	for (i=0; i<Workers.length; i++) {
		if (Workers[i].parse && Workers[i].pages && (Workers[i].pages.indexOf('*')>=0 || (Page.page && Workers[i].pages.indexOf(Page.page)>=0))) {
			Workers[i]._unflush();
			if (Workers[i]._parse(false)) {
				list.push(Workers[i]);
			}
		}
	}
	for (i in list) {
		list[i]._parse(true);
	}
	for (i=0; i<Workers.length; i++) {
		Workers[i]._flush();
	}
	WorkerStack.pop();
};

Page.work = function(state) {
	if (!this.checking) {
		return false;
	}
	var i, l, list, found = null;
	for (i=0; i<Workers.length && !found; i++) {
		if (Workers[i].pages) {
			list = Workers[i].pages.split(' ');
			for (l=0; l<list.length; l++) {
				if (list[l] !== '*' && this.pageNames[list[l]] && !this.data[list[l]] && list[l].indexOf('_active') === -1) {
					found = list[l];
					break;
				}
			}
		}
	}
	if (!state) {
		if (found) {
			return true;
		}
		this.checking = false;
		return false;
	}
	if (found && !this.to(found)) {
		this.data[found] = Date.now(); // Even if it's broken, we need to think we've been there!
		return true;
	}
	return false;
};

Page.identify = function() {
	WorkerStack.push(this);
	this.page = '';
	if (!$('#app_content_'+APPID).length) {
		this.reload();
		return null;
	}
	var app_body = $('#app'+APPID+'_app_body'), p;
	$('img', app_body).each(function(i,el){
		var filename = $(el).attr('src').filepart();
		for (p in Page.pageNames) {
			if (Page.pageNames[p].image && filename === Page.pageNames[p].image) {
				Page.page = p;
				return;
			}
		}
	});
	if (!this.page) {
		for (p in Page.pageNames) {
			if (Page.pageNames[p].selector && $(Page.pageNames[p].selector).length) {
				Page.page = p;
			}
		}
	}
	if (this.page !== '') {
		this.data[this.page] = Date.now();
	}
	//debug('this.identify("'+Page.page+'")');
	WorkerStack.pop();
	return this.page;
};

Page.to = function(page, args, force) {
	if (Queue.option.pause) {
		debug('Trying to load page when paused...');
		return true;
	}
	if (page === this.page && (force || typeof args === 'undefined')) {
		return true;
	}
	WorkerStack.push(this);
	if (!args) {
		args = '';
	}
	if (page && this.pageNames[page] && this.pageNames[page].url) {
		this.clear();
		this.last = this.pageNames[page].url;
		this.when = Date.now();
		if (args.indexOf('?') === 0 && this.last.indexOf('?') > 0) {
			this.last = this.last.substr(0, this.last.indexOf('?')) + args;
		} else {
			this.last = this.last + args;
		}
		debug('Navigating to ' + page + ' (' + (force ? 'FORCE: ' : '') + this.last + ')');
		if (force) {
//			this.loading=true;
			window.location.href = this.last;
		} else {
			this.ajaxload();
		}               
	}
	WorkerStack.pop();
	return false;
};

Page.ajaxload = function() {
	$.ajax({
		cache:false,
		dataType:'text',
		timeout:this.option.timeout * 1000,
		url:'http://apps.facebook.com/castle_age/'+this.last,
		error:function() {
			debug('Page not loaded correctly, reloading.');
			Page.ajaxload();
		},
		success:function(data){
		if (data.indexOf('app'+APPID+'_results_container') !== -1 && data.indexOf('</html>') !== -1 && data.indexOf('single_popup') !== -1 && data.indexOf('app'+APPID+'_index') !== -1) { // Last things in source if loaded correctly...
				Page.loading = false;
				data = data.substring(data.indexOf('<div id="app'+APPID+'_globalContainer"'), data.indexOf('<div class="UIStandardFrame_SidebarAds"'));
				$('#app'+APPID+'_AjaxLoadIcon').css('display', 'none');
				$('#app'+APPID+'_globalContainer').empty().append(data);
			} else {
				debug('Page not loaded correctly, reloading.');
				Page.ajaxload();
			}
		}
	});
	this.loading = true;
	setTimeout(function() { if (Page.loading) {$('#app'+APPID+'_AjaxLoadIcon').css('display', 'block');} }, 1500);
};

Page.reload = function() {
	debug('Page.reload()');
	window.location.href = window.location.href;
};

Page.click = function(el) {
	if (!$(el).length) {
		log('Page.click: Unable to find element - '+el);
		return false;
	}
	var e = document.createEvent("MouseEvents");
	e.initEvent("click", true, true);
	isGreasemonkey ? $(el).get(0).wrappedJSObject.dispatchEvent(e) : $(el).get(0).dispatchEvent(e);
	this.clear();
	this.lastclick = el;
	this.when = Date.now();
	return true;
};

Page.clear = function() {
	this.last = this.lastclick = this.when = null;
	this.retry = 0;
};

/********** Worker.Queue() **********
* Keeps track of the worker queue
*/
var Queue = new Worker('Queue', '*');
Queue.data = null;

var QUEUE_RELEASE = -1;

Queue.settings = {
	system:true,
	unsortable:true,
	keep:true
};

Queue.runtime = {
	reminder:{},
	current:null
};

Queue.option = {
	delay: 5,
	clickdelay: 5,
	queue: ['Page', 'Queue', 'Settings', 'Title', 'Income', 'LevelUp', 'Elite', 'Quest', 'Monster', 'Battle', 'Heal', 'Land', 'Town', 'Bank', 'Alchemy', 'Blessing', 'Gift', 'Upgrade', 'Potions', 'Idle'],
	start_stamina: 0,
	stamina: 0,
	start_energy: 0,
	energy: 0,
	pause: false
};

Queue.caap_load = function() {
	this.option.pause = false;
};

Queue.display = [
	{
		label:'Drag the unlocked panels into the order you wish them run.'
	},{
		id:'delay',
		label:'Delay Between Events',
		text:true,
		after:'secs',
		size:3
	},{
		id:'clickdelay',
		label:'Delay After Mouse Click',
		text:true,
		after:'secs',
		size:3,
		help:'This should be a multiple of Event Delay'
	},{
		id:'start_stamina',
		before:'Save',
		select:'stamina',
		after:'Stamina Before Using'
	},{
		id:'stamina',
		before:'Always Keep',
		select:'stamina',
		after:'Stamina'
	},{
		id:'start_energy',
		before:'Save',
		select:'energy',
		after:'Energy Before Using'
	},{
		id:'energy',
		before:'Always Keep',
		select:'energy',
		after:'Energy'
	}
];

Queue.runfirst = [];
Queue.lastclick = Date.now();	// Last mouse click - don't interrupt the player
Queue.lastrun = Date.now();		// Last time we ran
Queue.burn = {stamina:false, energy:false};
Queue.timer = null;

Queue.lasttimer = 0;
Queue.lastpause = false;

Queue.init = function() {
	if (iscaap()) {
		return false;
	}
	var i, worker, play = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%0FPLTE%A7%A7%A7%C8%C8%C8YYY%40%40%40%00%00%00%9F0%E7%C0%00%00%00%05tRNS%FF%FF%FF%FF%00%FB%B6%0ES%00%00%00%2BIDATx%DAb%60A%03%0CT%13%60fbD%13%60%86%0B%C1%05%60BH%02%CC%CC%0CxU%A0%99%81n%0BeN%07%080%00%03%EF%03%C6%E9%D4%E3)%00%00%00%00IEND%AEB%60%82', pause = 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%40%40%40%00%00%00i%D8%B3%D7%00%00%00%02tRNS%FF%00%E5%B70J%00%00%00%1AIDATx%DAb%60D%03%0CT%13%60%60%80%60%3A%0BP%E6t%80%00%03%00%7B%1E%00%E5E%89X%9D%00%00%00%00IEND%AEB%60%82';
	this.option.queue = unique(this.option.queue);
	for (i in Workers) {// Add any new workers that have a display (ie, sortable)
		if (Workers[i].work && Workers[i].display && !findInArray(this.option.queue, Workers[i].name)) {
			log('Adding '+Workers[i].name+' to Queue');
			if (Workers[i].settings.unsortable) {
				this.option.queue.unshift(Workers[i].name);
			} else {
				this.option.queue.push(Workers[i].name);
			}
		}
	}
	for (i=0; i<this.option.queue.length; i++) {// Then put them in saved order
		worker = WorkerByName(this.option.queue[i]);
		if (worker && worker.id) {
			if (this.runtime.current && worker.name === this.runtime.current) {
				debug('Trigger '+worker.name+' (continue after load)');
				$('#'+worker.id+' > h3').css('font-weight', 'bold');
			}
			$('#golem_config').append($('#'+worker.id));
		}
	}
	$(document).click(function(){Queue.lastclick=Date.now();});

	Queue.lastpause = this.option.pause;
	$btn = $('<img class="golem-button' + (this.option.pause?' red':'') + '" id="golem_pause" src="' + (this.option.pause?play:pause) + '">').click(function() {
		Queue.option.pause ^= true;
		debug('Queue','State: '+((Queue.option.pause)?"paused":"running"));
		$(this).toggleClass('red').attr('src', (Queue.option.pause?play:pause));
		Page.clear();
		Config.updateOptions();
	});
	$('#golem_buttons').prepend($btn); // Make sure it comes first
	// Running the queue every second, options within it give more delay
};

Queue.update = function(type) {
	if (iscaap()) {
		return false;
	}
	if (!this.option.pause && this.option.delay !== this.lasttimer) {
		window.clearInterval(this.timer);
		this.timer = window.setInterval(function(){Queue.run();}, this.option.delay * 1000);
		this.lasttimer = this.option.delay;
	} else if (this.option.pause && this.option.pause !== this.lastpause) {
		window.clearInterval(this.timer);
		this.lasttimer = -1;
	}
	this.lastpause = this.option.pause;
};

Queue.run = function() {
	var i, worker, current, result, now = Date.now(), next = null, release = false;
	if (this.option.pause || now - this.lastclick < this.option.clickdelay * 1000) {
		return;
	}
	if (Page.loading) {
		return; // We want to wait xx seconds after the page has loaded
	}
	WorkerStack.push(this);
//	debug('Start Queue');
	this.burn.stamina = this.burn.energy = 0;
	if (this.option.burn_stamina || Player.get('stamina') >= this.option.start_stamina) {
		this.burn.stamina = Math.max(0, Player.get('stamina') - this.option.stamina);
		this.option.burn_stamina = this.burn.stamina > 0;
	}
	if (this.option.burn_energy || Player.get('energy') >= this.option.start_energy) {
		this.burn.energy = Math.max(0, Player.get('energy') - this.option.energy);
		this.option.burn_energy = this.burn.energy > 0;
	}
	// We don't want to stay at max any longer than we have to because it is wasteful.  Burn a bit to start the countdown timer.
/*	if (Player.get('energy') >= Player.get('maxenergy')){
		this.burn.stamina = 0;	// Focus on burning energy
		debug('At max energy, burning energy first.');
	} else if (Player.get('stamina') >= Player.get('maxstamina')){
		this.burn.energy = 0;	// Focus on burning stamina
		debug('At max stamina, burning stamina first.');
	}
*/	
	for (i=0; i<Workers.length; i++) { // Run any workers that don't have a display, can never get focus!!
		if (Workers[i].work && !Workers[i].display) {
//			debug(Workers[i].name + '.work(false);');
			Workers[i]._unflush();
			Workers[i]._work(false);
		}
	}
	for (i=0; i<this.option.queue.length; i++) {
		worker = WorkerByName(this.option.queue[i]);
		if (!worker || !worker.work || !worker.display) {
			continue;
		}
//		debug(worker.name + '.work(' + (this.runtime.current === worker.name) + ');');
		if (this.runtime.current === worker.name) {
			worker._unflush();
			result = worker._work(true);
			if (result === QUEUE_RELEASE) {
				worker.settings.stateful = true;
				release = true;
			} else if (!result) {
				this.runtime.current = null;
				worker.id && $('#'+worker.id+' > h3').css('font-weight', 'normal');
				debug('End '+worker.name);
			}
		} else {
			result = worker._work(false);
		}
		if (!next && result) {
			next = worker; // the worker who wants to take over
		}
	}
	current = this.runtime.current ? WorkerByName(this.runtime.current) : null;
	if (next !== current && (!current || !current.settings.stateful || next.settings.important || release)) {// Something wants to interrupt...
		if (current) {
			debug('Interrupt ' + current.name + ' with ' + next.name);
			current.id && $('#'+current.id+' > h3').css('font-weight', 'normal');
		} else {
			debug('Trigger ' + next.name);
		}
		this.runtime.current = next.name;
		next.id && $('#'+next.id+' > h3').css('font-weight', 'bold');
	}
//	debug('End Queue');
	for (i=0; i<Workers.length; i++) {
		Workers[i]._flush();
	}
	WorkerStack.pop();
};

/********** Worker.Settings **********
* Save and Load settings by name - never does anything to CA beyond Page.reload()
*/
var Settings = new Worker('Settings');
Settings._rootpath = false; // Override save path so we don't get limited to per-user

Settings.settings = {
	system:true,
	unsortable:true,
	advanced:true
};

Settings.option = {
	action:'None',
	which:'- default -',
	name:'- default -',
	confirm:false
};

Settings.display = [
	{
		title:'IMPORTANT!',
		label:'This will backup and restore your current options.<br>There is no confirmation dialog!'
	},{
		id:'action',
		label:'Action (<b>Immediate!!</b>)',
		select:['None', 'Load', 'Save', 'Delete']
	},{
		id:'which',
		label:'Which',
		select:'settings'
	},{
		id:'name',
		label:'New Name',
		text:true
	}
];

Settings.oldwhich = null;

Settings.init = function() {
	if (!this.data['- default -']) {
		this.set('- default -');
	}
	Settings.oldwhich = this.option.which;
};

Settings.update = function(type) {
	if (type === 'option') {
		var i, list = [];
		if (this.oldwhich !== this.option.which) {
			$('input:golem(settings,name)').val(this.option.which);
			this.option.name = this.option.which;
			this.oldwhich = this.option.which;
		}
		switch (this.option.action) {
			default:
			case 'None':
				break;
			case 'Load':
				debug('Loading ' + this.option.which);
				this.get(this.option.which);
				break;
			case 'Save':
				debug('Saving ' + this.option.name);
				this.set(this.option.name);
				this.option.which = this.option.name;
				break;
			case 'Delete':
				if (this.option.which !== '- default -') {
					delete this.data[this.option.which];
				}
				this.option.which = '- default -';
				this.option.name = '- default -';
				break;
		}
		$('select:golem(settings,action)').val('None');
		this.option.action = 'None';
		for (i in this.data) {
			list.push(i);
		}
		Config.set('settings', list.sort());
	}
};

Settings.set = function(what, value) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (x[0] === 'option' || x[0] === 'runtime')) {
		return this._set(what, value);
	}
	this._unflush();
	this.data[what] = {};
	for (var i in Workers) {
		if (Workers[i] !== this && Workers[i].option) {
			this.data[what][Workers[i].name] = $.extend(true, {}, Workers[i].option);
		}
	}
};

Settings.get = function(what) {
	var x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (x[0] === 'option' || x[0] === 'runtime')) {
		return this._get(what);
	}
	this._unflush();
	if (this.data[what]) {
		for (var i in Workers) {
			if (Workers[i] !== this && Workers[i].option && this.data[what][Workers[i].name]) {
				Workers[i].option = $.extend(true, {}, this.data[what][Workers[i].name]);
				Workers[i]._save('option');
			}
		}
		Page.reload();
	}
	return;
};

/********** Worker.Update **********
* Checks if there's an update to the script, and lets the user update if there is.
*/
var Update = new Worker('Update');
Update.data = null;
Update.option = null;

Update.settings = {
	system:true
};

Update.runtime = {
	lastcheck:0,// Date.now() = time since last check
	force:false,// Have we clicked a button, or is it an automatic check
	last:0,
	revision:0,
	beta:0,
	found:false// Have we found a new version
};

/***** Update.init() *****
1. Add a "Update Now" button to the button bar at the top of Config
1a. On clicking the button check if we've already found an update
1b. If an update was found then get GM to install it
1c. If no update was found then set the lastcheck to 0 to force the next check to come in 5 seconds
2. Add an (Advanced) "WIP" button to the button bar at the top of Config
2a. On clicking the button offer to install the latest WIP version
*/
Update.init = function() {
	var $btn = $('<img class="golem-button" name="Script Update" id="golem_update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C7%C7%C7UUU%7B%7B%7B%BF%BF%BF%A6%A6%A6%FF%FF%FF%40%40%40%FF%FF%FFk5%D0%FB%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00UIDATx%DAt%8F%5B%12%800%08%03%23%8Fx%FF%1B%5B%C0%96%EA%E8~%95%9D%C0%A48_%E0S%A8p%20%3A%85%F1%C6Jh%3C%DD%FD%205E%E4%3D%18%5B)*%9E%82-%24W6Q%F3Cp%09%E1%A2%8E%A2%13%E8b)lVGU%C7%FF%E7v.%01%06%005%D6%06%07%F9%3B(%D0%00%00%00%00IEND%AEB%60%82">').click(function(){if (Update.get('runtime.found')){window.location.href = 'http://game-golem.googlecode.com/svn/trunk/_release.user.js';} else {Update.set('runtime.force', true);Update.set('runtime.lastcheck', 0);}});
	$('#golem_buttons').append($btn);
	$btn = $('<img class="golem-button golem-advanced"' + (Config.get('option.advanced') ? '' : ' style="display:none;"') + ' name="Beta Update" src="data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%06PLTE%FF%FF%FFiii%92%95*%C3%00%00%00%01tRNS%00%40%E6%D8f%00%00%00%2FIDATx%DAb%60%C0%00%8CP%8CO%80%91%90%00%08%80H%14%25h%C60%10%2B%80l%0E%98%C3%88%AE%0ES%80%91%91T%8B%C0%00%20%C0%00%17G%00(%A6%C6G%AA%00%00%00%00IEND%AEB%60%82">').click(function(){
		$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>This will update to the latest Work-In-Progress version of Castle Age Golem.<br><br>Are you sure you wish to run a potentially buggy update?<br><br>You must reload the page after installing to use the new version.</div>');
		$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close").remove();window.location.href='http://game-golem.googlecode.com/svn/trunk/_normal.user.js';}, "Skip":function(){$(this).dialog("close").remove();}} });
	});
	$('#golem_buttons').append($btn);
};

/***** Update.work() *****
1a. Check that we've not already found an update
1b. Check that it's been more than 6 hours since the last update
2a. Use AJAX to get the google trunk source webpage (list of files and revisions)
2b. Parse out the revision string for both release and beta

5. Compare with our own version
6. Remember it if we have an update
7. Notify the user -
7a. Change the update button image
7b. Show a requester to the user asking if they'd like to update
*/
Update.work = function(state) {
	if (!this.runtime.found && Date.now() - this.runtime.lastcheck > 21600000) {// 6+ hours since last check (60x60x6x1000ms)
		this.runtime.lastcheck = Date.now();
		/*
		debug('Checking trunk revisions');
		GM_xmlhttpRequest({ // Cross-site ajax, only via GreaseMonkey currently...
			method: "GET",
			url: 'http://code.google.com/p/game-golem/source/browse/#svn/trunk',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var release = evt.responseText.regex(/"_release.user.js":\["[^"]*","([0-9]+)"/i), beta = evt.responseText.regex(/"_normal.user.js":\["[^"]*","([0-9]+)"/i);
					debug('Version: '+release+', Beta: '+beta);
				}
			}
		});
		*/
		GM_xmlhttpRequest({
			method: "GET",
			url: 'http://game-golem.googlecode.com/svn/trunk/_normal.user.js',
			onload: function(evt) {
				if (evt.readyState === 4 && evt.status === 200) {
					var remoteVersion = evt.responseText.regex(/@version[^0-9.]+([0-9.]+)/i);
					if (Update.get('runtime.force')) {
						$('#golem_request').remove();
					}
					if (remoteVersion>VERSION) {
						Update.set('runtime.found', true);
						$('#golem_update').attr('src', 'data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%03%00%00%00(-%0FS%00%00%00%18PLTE%C8%C8%C8%C1%C1%C1%BA%BA%BA%F1%F1%F1ggg%FF%FF%FF%40%40%40%FF%FF%FF%7D%5C%EC%14%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00OIDATx%DA%8C%8FA%0A%C0%20%0C%04W%8D%EB%FF%7F%AC1%5BQi%A1s%0A%C3%24%10%B4%0B%7C%89%9COa%A4%ED%22q%906a%2CE%09%14%D4%AA%04%BA0%8AH%5C%80%02%12%3E%FB%0A%19b%06%BE2%13D%F0%F0.~%3E%B7%E8%02%0C%00Z%03%06Q9dE%25%00%00%00%00IEND%AEB%60%82').toggleClass('golem-button golem-button-active');
						if (Update.get('runtime.force')) {
							$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There is a new version of Castle Age Golem available.</p><p>Current&nbsp;version:&nbsp;'+VERSION+', New&nbsp;version:&nbsp;'+remoteVersion+'</p></div>');
							$('#golem_request').dialog({ modal:true, buttons:{"Install":function(){$(this).dialog("close");window.location.href='http://game-golem.googlecode.com/svn/trunk/_release.user.js';}, "Skip":function(){$(this).dialog("close");}} });
						}
						log('New version available: '+remoteVersion);
					} else if (Update.get('runtime.force')) {
						$('#golem_config').after('<div id="golem_request" title="Castle Age Golem"><p>There are no new versions available.</p></div>');
						$('#golem_request').dialog({ modal:true, buttons:{"Ok":function(){$(this).dialog("close");}} });
					}
					Update.set('runtime.force', false);
				}
			}
		});
	}
};

/********** Worker.Alchemy **********
* Get all ingredients and recipes
*/
var Alchemy = new Worker('Alchemy');

Alchemy.defaults = {
	castle_age:{
		pages:'keep_alchemy'
	}
};

Alchemy.data = {
	ingredients:{},
	summons:{},
	recipe:{}
};

Alchemy.option = {
	perform:true,
	hearts:false,
	summon:false
};

Alchemy.runtime = {
	best:null
};

Alchemy.display = [
	{
		id:'perform',
		label:'Automatically Perform',
		checkbox:true
	},{
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
	var ingredients = this.data.ingredients = {}, recipe = this.data.recipe = {};
	$('div.ingredientUnit').each(function(i,el){
		var name = $('img', el).attr('src').filepart();
		ingredients[name] = $(el).text().regex(/x([0-9]+)/);
	});
	$('div.alchemyQuestBack,div.alchemyRecipeBack,div.alchemyRecipeBackMonster').each(function(i,el){
		var me = {}, title = $('div.recipeTitle', el).text().trim().replace('RECIPES: ','');
		if (title.indexOf(' (')>0) {
			title = title.substr(0, title.indexOf(' ('));
		}
		if ($(el).hasClass('alchemyQuestBack')) {
			me.type = 'Quest';
		} else if ($(el).hasClass('alchemyRecipeBack')) {
			me.type = 'Recipe';
		} else if ($(el).hasClass('alchemyRecipeBackMonster')) {
			me.type = 'Summons';
		}
		me.ingredients = {};
		$('div.recipeImgContainer', el).parent().each(function(i,el){
			var name = $('img', el).attr('src').filepart();
			me.ingredients[name] = ($(el).text().regex(/x([0-9]+)/) || 1);
		});
		recipe[title] = me;
	});
};

Alchemy.update = function() {
	var best = null, recipe = this.data.recipe, r, i;
	for (r in recipe) {
		if (recipe[r].type === 'Summons') {
			for (i in recipe[r].ingredients) {
				this.data.summons[i] = true;
			}
		}
	}
	for (r in recipe) {
		if (recipe[r].type === 'Recipe') {
			best = r;
			for (i in recipe[r].ingredients) {
				if ((!this.option.hearts && i === 'raid_hearts.gif') || (!this.option.summon && this.data.summons[i]) || recipe[r].ingredients[i] > (this.data.ingredients[i] || 0)) {
					best = null;
					break;
				}
			}
			if (best) {break;}
		}
	}
	this.runtime.best = best;
};

Alchemy.work = function(state) {
	if (!this.option.perform || !this.runtime.best) {
		return false;
	}
	if (!state || !Page.to('keep_alchemy')) {
		return true;
	}
	debug('Perform - ' + this.runtime.best);
	if (!Page.click($('input[type="image"]', $('div.recipeTitle:contains("' + this.runtime.best + '")').next()))) {
		Page.reload(); // Can't find the recipe we just parsed when coming here...
	}
	return true;
};

/********** Worker.Bank **********
* Auto-banking
*/
var Bank = new Worker('Bank');
Bank.data = null;

Bank.settings = {
	after:['Land','Town']
};

Bank.defaults = {
	castle_age:{}
};

Bank.option = {
	general: true,
	above: 10000,
	hand: 0,
	keep: 10000
};

Bank.caap_load = function() {
	valuesList = {'above':'MaxInCash','hand':'MinInCash','keep':'minInStore'};
	for (i in valuesList) {
		this.option[i] = gm.getValue(valuesList[i]);
	}
};

Bank.display = [
	{
		id:'general',
		label:'Use Best General',
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

Bank.work = function(state) {
	if (iscaap() && this.option.above === '') {
		return false;
	}
	if (Player.get('cash') <= 10 || Player.get('cash') <= this.option.above) {
		return false;
	} else {
		this.stash(Player.get('cash') - this.option.hand);
		return true;
	}
};

Bank.stash = function(amount) {
	if (!amount || !Player.get('cash') || Math.min(Player.get('cash'),amount) <= 10) {
		return true;
	}
	if ((this.option.general && !Generals.to('bank')) || !Page.to('keep_stats')) {
		return false;
	}
	$('input[name="stash_gold"]').val(Math.min(Player.get('cash'), amount));
	Page.click('input[value="Stash"]');
	return true;
};

Bank.retrieve = function(amount) {
	WorkerByName(Queue.get('runtime.current')).settings.bank = true;
	amount -= Player.get('cash');
	if (amount <= 0 || (Player.get('bank') - this.option.keep) < amount) {
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
	var worth = Player.get('cash') + Math.max(0,Player.get('bank') - this.option.keep);
	if (typeof amount === 'number') {
		return (amount <= worth);
	}
	return worth;
};

/********** Worker.Battle **********
* Battling other players (NOT raid or Arena)
*/
var Battle = new Worker('Battle');

Battle.settings = {
	stateful:true
};

Battle.defaults = {
	castle_age:{
		pages:'battle_rank battle_battle'
	}
};

Battle.data = {
	user: {},
	rank: {},
	points: {}
};

Battle.option = {
	general:true,
	points:true,
	monster:true,
	arena:false,
	losses:5,
	type:'Invade',
	bp:'Always',
	army:1.1,
	level:1.1,
	preferonly:'Sometimes',
	prefer:[]
};

Battle.runtime = {
	attacking:null
};

Battle.symbol = { // Demi-Power symbols
	1:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%17%90%B3%1AIn%99%AD%B0%3F%5Erj%7F%8A4%40J%22*1%FF%FF%FFm%0F%82%CD%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%ABIDATx%DAl%91%0B%0E%04!%08CAh%E7%FE7%DE%02%BA3%FBib%A2O%A8%02vm%91%00xN%B6%A1%10%EB%86O%0C%22r%AD%0Cmn%0C%8A%8Drxa%60-%B3p%AF%8C%05%0C%06%15d%E6-%5D%90%8D%E5%90~%B0x%A20e%117%0E%D9P%18%A1%60w%F3%B0%1D%1E%18%1C%85m'D%B9%08%E7%C6%FE%0F%B7%CF%13%C77%1Eo%F4%93%05%AA%24%3D%D9%3F%E1%DB%25%8E%07%BB%CA%D8%9C%8E%FE6%A6J%B9%1F%FB%DAa%8A%BFNW3%B5%9ANc%D5%FEn%9El%F7%20%F6tt%8C%12%F01%B4%CE%F8%9D%E5%B7%5E%02%0C%00n%97%07%B1AU%81%B7%00%00%00%00IEND%AEB%60%82",
	2:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%E0%0D%0CZ%5B%5Bv%13%0F%2F%1A%16%7Byx%8941DB%3F%FF%FF%FFOmpc%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B4IDATx%DAT%D1%5B%12%C5%20%08%03P%08%C2%DD%FF%8Eo%12%EB%D8%F2%D1%C7%C1%01%C5%F8%3DQ%05T%9D%BFxP%C6%07%EA%CDF%07p%998%B9%14%C3%C4aj%AE%9CI%A5%B6%875zFL%0F%C8%CD%19vrG%AC%CD%5C%BC%C6nM%D57'%EB%CA%AD%EC%C2%E5b%B5%93%5B%E9%97%99%40D%CC%97sw%DB%FByqwF%83u%FA%F2%C8%A3%93u%A0%FD%8C%B8%BA%96NAn%90%17%C1%C7%E1'%D7%F2%85%01%D4%DC%A7d%16%EDM2%1A%C3%C5%1E%15%7DX%C7%23%19%EB%1El%F5h%B2lV%5B%CF%ED%A0w%89~%AE'%CE%ED%01%F7%CA%5E%FC%8D%BF%00%03%00%AA%CE%08%23%FB4h%C4%00%00%00%00IEND%AEB%60%82",
	3:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%B1%98g%DE%BCyqpq%8CnF%12%11%0EME7y8%0B%FF%FF%FF6%A1%E73%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B7IDATx%DA%5C%91Y%16C!%0CB%C9%40%BA%FF%1D%17%7Cz%9Em%BE%F4%8A%19%08%3E%3BX%40%F1%DC%B0%A1%99_xcT%EF(%BC8%D8%CC%9A%A9%D4!%0E%0E%8Bf%863%FE%16%0F%06%5BR%22%02%1C%A0%89%07w%E6T%AC%A8A%F6%C2%251_%9CPG%C2%A1r7N%CB%E1%1CtN%E7%06%86%7F%B85%8B%1A%22%2F%AC%3E%D4%B2_.%9C%C6%EA%B3%E2%C6%BB%24%CA%25uY%98%D5H%0D%EE%922%40b%19%09%CFNs%99%C8Y%E2XS%D2%F3*%0F7%B5%B9%B6%AA%16_%0E%9A%D61V%DCu-%E5%A2g%3BnO%C1%B3%1E%9C%EDiax%94%3F%F87%BE%02%0C%00%98%F2%07%E0%CE%8C%E4%B1%00%00%00%00IEND%AEB%60%82",
	4:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%90%CA%3CSTRq%9B5On*%10%13%0Dx%7Ct6B'%FF%FF%FFx%0A%94%CE%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%B2IDATx%DAT%D1A%16%C4%20%08%03P%20%92%B9%FF%8D'%80%B5%96%85%AF~%95*%D8o%07%09%90%CF%CC6%96%F5%CA%CD%E0%DAA%BC%0CM%B3C%CBxX%9A%E9%15Z%18%B7QW%E2%DB%9B%3D%E0%CD%99%11%18V%3AM%02%CD%FA%08.%8A%B5%D95%B1%A0%A7%E9Ci%D0%9Cb3%034D%F8%CB(%EE%F8%F0%F1%FA%C5ae9%BB%FD%B0%A7%CF%F9%1Au%9FfR%DB%A3%A19%179%CFa%B1%8E%EB*%91%BE_%B9*M%A9S%B7%97%AE)%15%B5%3F%BAX%A9%0Aw%C9m%9A%A0%CA%AA%20%5Eu%E5%D5%1DL%23%D4%9Eu7%AD%DBvZv%F17%FE%02%0C%00%D3%0A%07%E1%0961%CF%00%00%00%00IEND%AEB%60%82",
	5:"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%16%00%00%00%16%08%03%00%00%00%F3j%9C%09%00%00%00%18PLTE%F2%F2%EF!!%20%A5%A5%A3vvv%5BZZ%3D%3D%3B%00%00%00%FF%FF%FF.%C4%F9%B3%00%00%00%08tRNS%FF%FF%FF%FF%FF%FF%FF%00%DE%83%BDY%00%00%00%BEIDATx%DA%5C%91Q%92%C30%08C%11B%DE%FB%DFx%25%C7n3%E5%23%E3%3Cd%01%A6%FEN%00%12p%FF%EA%40%A3%05%A7%F0%C6%C2%0A%CCW_%AC%B5%C4%1D9%5D%EC39%09'%B0y%A5%D8%E2H%5D%D53%DDH%E1%E05%A6%9A2'%9Bkcw%40%E9%C5e%5Ev%B6g%E4%B1)%DA%DF%EEQ%D3%A0%25Vw%EC%B9%D5)%C8%5Cob%9C%1E%E2%E2%D8%16%F1%94%F8%E0-%AF%B9%F8x%CB%F2%FE%C8g%1Eo%A03w%CA%86%13%DB%C4%1D%CA%7C%B7%E8w%E4d%FAL%E9%CE%9B%F3%F0%D0g%F8%F0%AD%CFSyD%DC%875%87%3B%B0%D1%5D%C4%D9N%5C%13%3A%EB%A9%F7.%F5%BB%CB%DF%F8%17%60%00%EF%2F%081%0F%2BNZ%00%00%00%00IEND%AEB%60%82"
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
		id:'type',
		label:'Battle Type',
		select:['Invade', 'Duel']
	},{
		id:'losses',
		label:'Attack Until',
		select:['Ignore',1,2,3,4,5,6,7,8,9,10],
		after:'Losses'
	},{
		id:'points',
		label:'Always Get Demi-Points',
		checkbox:true
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
		id:'cache',
		label:'Limit Cache Length',
		select:[100,200,300,400,500]
	},{
		id:'army',
		label:'Target Army Ratio<br>(Only needed for Invade)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
	},{
		id:'level',
		label:'Target Level Ratio<br>(Mainly used for Duel)',
		select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
		help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
	},{
		advanced:true,
		hr:true,
		title:'Preferred Targets'
	},{
		advanced:true,
		id:'preferonly',
		label:'Fight Preferred',
		select:['Never', 'Sometimes', 'Only', 'Until Dead']
	},{
		advanced:true,
		id:'prefer',
		multiple:'userid'
	}
];

/***** Battle.init() *****
1. Watch Arena and Monster for changes so we can update our target if needed
*/
Battle.init = function() {
//	this._watch(Arena);
	this._watch(Monster);
	this.option.arena = false;// ARENA!!!!!!
};

/***** Battle.parse() *****
1. On the Battle Rank page parse out our current Rank and Battle Points
2. On the Battle page
2a. Check if we've just attacked someone and parse out the results
2b. Parse the current Demi-Points
2c. Check every possible target and if they're eligable then add them to the target list
*/
Battle.parse = function(change) {
	var data, uid, tmp;
	if (Page.page === 'battle_rank') {
		data = {0:{name:'Newbie',points:0}};
		$('tr[height="23"]').each(function(i,el){
			var info = $(el).text().regex(/Rank ([0-9]+) - (.*)\s*([0-9]+)/i);
			data[info[0]] = {name:info[1], points:info[2]};
		});
		this.data.rank = data;
		this.data.bp = $('span:contains("Battle Points.")', 'div:contains("You are a Rank")').text().replace(/,/g, '').regex(/with ([0-9]+) Battle Points/i);
	} else if (Page.page === 'battle_battle') {
		data = this.data.user;
		if (this.runtime.attacking) {
			uid = this.runtime.attacking;
			this.runtime.attacking = null;
			if ($('div.results').text().match(/You cannot battle someone in your army/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/This trainee is too weak. Challenge someone closer to your level/i)) {
				delete data[uid];
			} else if ($('div.results').text().match(/Your opponent is dead or too weak/i)) {
				data[uid].hide = (data[uid].hide || 0) + 1;
				data[uid].dead = Date.now();
			} else if ($('img[src*="battle_victory"]').length) {
				this.data.bp = $('span.result_body:contains("Battle Points.")').text().replace(/,/g, '').regex(/total of ([0-9]+) Battle Points/i);
				data[uid].win = (data[uid].win || 0) + 1;
				History.add('battle+win',1);
			} else if ($('img[src*="battle_defeat"]').length) {
				data[uid].loss = (data[uid].loss || 0) + 1;
				History.add('battle+loss',-1);
			} else {
				this.runtime.attacking = uid; // Don't remove target as we've not hit them...
			}
		}
		tmp = $('#app'+APPID+'_app_body table.layout table div div:contains("Once a day you can")').text().replace(/[^0-9\/]/g ,'').regex(/([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10([0-9]+)\/10/);
		if (tmp) {
			this.data.points = tmp;
		}
		$('#app'+APPID+'_app_body table.layout table table tr:even').each(function(i,el){
			var uid = $('img[uid!==""]', el).attr('uid'), info = $('td.bluelink', el).text().trim().regex(/Level ([0-9]+) (.*)/i), rank;
			if (!uid || !info) {
				return;
			}
			rank = Battle.rank(info[1]);
			if ((Battle.option.bp === 'Always' && Player.get('rank') - rank > 5) || (!Battle.option.bp === 'Never' && Player.get('rank') - rank <= 5)) {
				return;
			}
			if (!data[uid]) {
				data[uid] = {};
			}
			data[uid].name = $('a', el).text().trim();
			data[uid].level = info[0];
			data[uid].rank = rank;
			data[uid].army = $('td.bluelink', el).next().text().regex(/([0-9]+)/);
			data[uid].align = $('img[src*="graphics/symbol_"]', el).attr('src').regex(/symbol_([0-9])/i);
		});
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
Battle.update = function(type) {
	var i, j, data = this.data.user, list = [], points = false, status = [], army = Player.get('army'), level = Player.get('level'), rank = Player.get('rank'), count = 0;

	status.push('Rank ' + Player.get('rank') + ' ' + (Player.get('rank') && this.data.rank[Player.get('rank')].name) + ' with ' + addCommas(this.data.bp || 0) + ' Battle Points, Targets: ' + length(data) + ' / ' + this.option.cache);
	status.push('Demi Points Earned Today: '
	+ '<img src="' + this.symbol[1] +'" alt=" " title="'+this.demi[1]+'" style="width:11px;height:11px;"> ' + (this.data.points[0] || 0) + '/10 '
	+ '<img src="' + this.symbol[2] +'" alt=" " title="'+this.demi[2]+'" style="width:11px;height:11px;"> ' + (this.data.points[1] || 0) + '/10 '
	+ '<img src="' + this.symbol[3] +'" alt=" " title="'+this.demi[3]+'" style="width:11px;height:11px;"> ' + (this.data.points[2] || 0) + '/10 '
	+ '<img src="' + this.symbol[4] +'" alt=" " title="'+this.demi[4]+'" style="width:11px;height:11px;"> ' + (this.data.points[3] || 0) + '/10 '
	+ '<img src="' + this.symbol[5] +'" alt=" " title="'+this.demi[5]+'" style="width:11px;height:11px;"> ' + (this.data.points[4] || 0) + '/10');

	// First make check our target list doesn't need reducing
	for (i in data) { // Forget low or high rank - no points or too many points
		if ((this.option.bp === 'Always' && rank - (data[i].rank || 0) >= 4) || (!this.option.bp === 'Never' && rank - (data[i].rank || 6) <= 5)) { // unknown rank never deleted
			delete data[i];
		}
	}
	if (length(data) > this.option.cache) { // Need to prune our target cache
//		debug('Pruning target cache');
		list = [];
		for (i in data) {
			list.push(i);
		}
		list.sort(function(a,b) {
			var weight = 0;
				 if (((data[a].win || 0) - (data[a].loss || 0)) < ((data[b].win || 0) - (data[b].loss || 0))) { weight += 10; }
			else if (((data[a].win || 0) - (data[a].loss || 0)) > ((data[b].win || 0) - (data[b].loss || 0))) { weight -= 10; }
			if (Battle.option.bp === 'Always') { weight += ((data[b].rank || 0) - (data[a].rank || 0)) / 2; }
			if (Battle.option.bp === 'Never') { weight += ((data[a].rank || 0) - (data[b].rank || 0)) / 2; }
			weight += Math.range(-1, (data[b].hide || 0) - (data[a].hide || 0), 1);
			weight += Math.range(-10, (((data[a].army || 0) - (data[b].army || 0)) / 10), 10);
			weight += Math.range(-10, (((data[a].level || 0) - (data[b].level || 0)) / 10), 10);
			return weight;
		});
		while (list.length > this.option.cache) {
			delete data[list.pop()];
		}
	}
	// Check if we need Demi-points
	points = (this.option.points && this.data.points && sum(this.data.points) < 50);
	// Second choose our next target
/*	if (!points.length && this.option.arena && Arena.option.enabled && Arena.runtime.attacking) {
		this.runtime.attacking = null;
		status.push('Battling in the Arena');
	} else*/
	if (!points && this.option.monster && Monster.get('runtime.uid') && Monster.get('runtime.type')) {
		this.runtime.attacking = null;
		status.push('Attacking Monsters');
	} else {
		if (!this.runtime.attacking || !data[this.runtime.attacking]
		|| (this.option.army !== 'Any' && (data[this.runtime.attacking].army / army) > this.option.army)
		|| (this.option.level !== 'Any' && (data[this.runtime.attacking].level / level) > this.option.level)) {
			this.runtime.attacking = null;
		}
		list = [];
		for(j=0; j<this.option.prefer.length; j++) {
			i = this.option.prefer[j];
			if (!/[^0-9]/g.test(i)) {
				data[i] = data[i] || {};
				if ((data[i].dead && data[i].dead + 300000 >= Date.now()) // If they're dead ignore them for 1hp = 5 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				list.push(i,i,i,i,i,i,i,i,i,i); // If on the list then they're worth at least 10 ;-)
				count++;
			}
		}
		if (this.option.preferonly === 'Never' || this.option.preferonly === 'Sometimes' || (this.option.preferonly === 'Only' && !this.option.prefer.length) || (this.option.preferonly === 'Until Dead' && !list.length)) {
			for (i in data) {
				if ((data[i].dead && data[i].dead + 1800000 >= Date.now()) // If they're dead ignore them for 3m * 10hp = 30 mins
				|| (typeof this.option.losses === 'number' && (data[i].loss || 0) - (data[i].win || 0) >= this.option.losses) // Don't attack someone who wins more often
				|| (this.option.army !== 'Any' && ((data[i].army || 0) / army) > this.option.army)
				|| (this.option.level !== 'Any' && ((data[i].level || 0) / level) > this.option.level)
				|| (points && (!data[i].align || this.data.points[data[i].align - 1] >= 10))) {
					continue;
				}
				for (j=Math.range(1,(data[i].rank || 0)-rank+1,5); j>0; j--) { // more than 1 time if it's more than 1 difference
					list.push(i);
				}
				count++;
			}
		}
		if (!this.runtime.attacking && list.length) {
			this.runtime.attacking = list[Math.floor(Math.random() * list.length)];
		}
		if (this.runtime.attacking) {
			i = this.runtime.attacking;
			status.push('Next Target: ' + data[i].name + ' (Level ' + data[i].level + ' ' + this.data.rank[data[i].rank].name + ' with ' + data[i].army + ' army)' + (count ? ', ' + count + ' valid target' + plural(count) : ''));
		} else {
			this.runtime.attacking = null;
			status.push('No valid targets found');
			this._remind(60); // No targets, so check again in 1 minute...
		}
	}
	Dashboard.status(this, status.join('<br>'));
}

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
	if (!this.runtime.attacking || Player.get('health') < 13 || Queue.burn.stamina < 1) {
//		debug('Not attacking because: ' + (this.runtime.attacking ? '' : 'No Target, ') + 'Health: ' + Player.get('health') + ' (must be >=10), Burn Stamina: ' + Queue.burn.stamina + ' (must be >=1)');
		return false;
	}
	if (!state || (this.option.general && !Generals.to(Generals.best(this.option.type))) || !Page.to('battle_battle')) {
		return true;
	}
	var $form = $('form input[alt="'+this.option.type+'"]').first().parents('form');
	if (!$form.length) {
		debug('Unable to find attack buttons, forcing reload');
		Page.to('index');
	} else {
		log('Battle: Attacking ' + this.data.user[this.runtime.attacking].name + ' (' + this.runtime.attacking + ')');
		$('input[name="target_id"]', $form).attr('value', this.runtime.attacking);
		Page.click($('input[type="image"]', $form));
	}
	return QUEUE_RELEASE;
};

Battle.rank = function(name) {
	for (var i in Battle.data.rank) {
		if (Battle.data.rank[i].name === name) {
			return parseInt(i, 10);
		}
	}
	return 0;
};

Battle.order = [];
Battle.dashboard = function(sort, rev) {
	var i, o, points = [0, 0, 0, 0, 0, 0], list = [], output = [], sorttype = ['align', 'name', 'level', 'rank', 'army', 'win', 'loss', 'hide'], data = this.data.user, army = Player.get('army'), level = Player.get('level');
	for (i in data) {
		points[data[i].align]++;
	}
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
		this.order.sort(function(a,b) {
			var aa = (data[a][sorttype[sort]] || 0), bb = (data[b][sorttype[sort]] || 0);
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	list.push('<div style="text-align:center;"><strong>Rank:</strong> ' + this.data.rank[Player.get('rank')].name + ' (' + Player.get('rank') + '), <strong>Targets:</strong> ' + length(data) + ' / ' + this.option.cache + ', <strong>By Alignment:</strong>');
	for (i=1; i<6; i++ ) {
		list.push(' <img src="' + this.symbol[i] +'" alt="'+this.demi[i]+'" title="'+this.demi[i]+'" style="width:11px;height:11px;"> ' + points[i]);
	}
	list.push('</div><hr>');
	th(output, 'Align');
	th(output, 'Name');
	th(output, 'Level');
	th(output, 'Rank');
	th(output, 'Army');
	th(output, 'Wins');
	th(output, 'Losses');
	th(output, 'Hides');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		data = this.data.user[this.order[o]];
		output = [];
		td(output, '<img src="' + this.symbol[data.align] + '" alt="' + this.demi[data.align] + '">', 'title="' + this.demi[data.align] + '"');
		th(output, data.name, 'title="'+i+'"');
		td(output, (this.option.level !== 'Any' && (data.level / level) > this.option.level) ? '<i>'+data.level+'</i>' : data.level);
		td(output, this.data.rank[data.rank] ? this.data.rank[data.rank].name : '');
		td(output, (this.option.army !== 'Any' && (data.army / army) > this.option.army) ? '<i>'+data.army+'</i>' : data.army);
		td(output, data.win || '');
		td(output, data.loss || '');
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

/********** Worker.Blessing **********
* Automatically receive blessings
*/
var Blessing = new Worker('Blessing');
Blessing.data = null;

Blessing.defaults = {
	castle_age:{
		pages:'oracle_demipower'
	}
};

Blessing.option = {
	which:'Stamina',
        display: false
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
    },{
        id:'display',
        label:'Display in Blessing info on *',
        checkbox:true
    }
];

Blessing.parse = function(change) {
	var result = $('div.results'), time;
	if (result.length) {
		time = result.text().regex(/Please come back in: ([0-9]+) hours and ([0-9]+) minutes/i);
		if (time && time.length) {
			this.runtime.when = Date.now() + (((time[0] * 60) + time[1] + 1) * 60000);
		} else if (result.text().match(/You have paid tribute to/i)) {
			this.runtime.when = Date.now() + 86460000; // 24 hours and 1 minute
		}
	}
	return false;
};

Blessing.update = function(){
    var d, demi;
     if (this.option.display && this.option.which !== 'None'){
         d = new Date(this.runtime.when);
         switch(this.option.which){
             case 'Energy':
                 demi = 'Ambrosia (' + this.option.which + ')';
                 break;
             case 'Attack':
                 demi = 'Malekus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = 'Corvintheus (' + this.option.which + ')';
                 break;
             case 'Defense':
                 demi = 'Corvintheus (' + this.option.which + ')';
                 break;
             case 'Health':
                 demi = 'Aurora (' + this.option.which + ')';
                 break;
             case 'Stamina':
                 demi = 'Azeron (' + this.option.which + ')';
                 break;
             default:
                 demi = 'Unknown';
                 break;
         }
         Dashboard.status(this, '<span title="Next Blessing">' + 'Next Blessing performed on ' + d.format('l g:i a') + ' to ' + demi + ' </span>');
     } else {
         Dashboard.status(this);
     }
};

Blessing.work = function(state) {
	if (!this.option.which || this.option.which === 'None' || Date.now() <= this.runtime.when) {
		return false;
	}
	if (!state || !Page.to('oracle_demipower')) {
		return true;
	}
	Page.click('#app'+APPID+'_symbols_form_'+this.which.indexOf(this.option.which)+' input.imgButton');
	return true;
};

/********** Worker.Elite() **********
* Build your elite army
*/
var Elite = new Worker('Elite', 'keep_eliteguard army_viewarmy battle_arena');
Elite.data = {};

Elite.defaults = {
	castle_age:{
		pages:'keep_eliteguard army_viewarmy battle_arena'
	}
};

Elite.option = {
	elite:true,
	arena:false,
	every:24,
	prefer:[],
	armyperpage:25 // Read only, but if they change it and I don't notice...
};

Elite.caap_load = function() {
	this.option.prefer = gm.getListFromText('EliteArmyList');
	this.option.elite = gm.getValue('AutoElite', false);
	this.option.every = 1;
};

Elite.runtime = {
	armylastpage:1,
	armyextra:0,
	waitelite:0,
	nextelite:0,
	waitarena:0,
	nextarena:0
};

Elite.display = [
	{
//		id:'arena',
//		label:'Fill Arena Guard',
//		checkbox:true
//	},{
		id:'elite',
		label:'Fill Elite Guard',
		checkbox:true
	},{
		id:'every',
		label:'Every',
		select:[1, 2, 3, 6, 12, 24],
		after:'hours'
	},{
		advanced:true,
		label:'Add UserIDs to prefer them over random army members. These <b>must</b> be in your army to be checked.',
		id:'prefer',
		multiple:'userid'
	}
];

Elite.init = function() { // Convert old elite guard list
	for(i in this.data) {
		if (typeof this.data[i] === 'number') {
			this.data[i] = {elite:this.data[i]};
		}
	}
	this.option.arena = false; // ARENA!!!!!!
};

Elite.parse = function(change) {
	$('span.result_body').each(function(i,el){
		if (Elite.runtime.nextarena) {
			if ($(el).text().match(/has not joined in the Arena!/i)) {
				Elite.data[Elite.runtime.nextarena].arena = -1;
			} else if ($(el).text().match(/Arena Guard, and they have joined/i)) {
				Elite.data[Elite.runtime.nextarena].arena = Date.now() + 86400000; // 24 hours
			} else if ($(el).text().match(/'s Arena Guard is FULL/i)) {
				Elite.data[Elite.runtime.nextarena].arena = Date.now() + 3600000; // 1 hour
			} else if ($(el).text().match(/YOUR Arena Guard is FULL/i)) {
				Elite.runtime.waitarena = Date.now();
				debug(this + 'Arena guard full, wait '+Elite.option.every+' hours');
			}
		}
		if ($(el).text().match(/Elite Guard, and they have joined/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 86400000; // 24 hours
		} else if ($(el).text().match(/'s Elite Guard is FULL!/i)) {
			Elite.data[$('img', el).attr('uid')].elite = Date.now() + 3600000; // 1 hour
		} else if ($(el).text().match(/YOUR Elite Guard is FULL!/i)) {
			Elite.runtime.waitelite = Date.now();
			debug('Elite guard full, wait '+Elite.option.every+' hours');
		}
	});
	if (Page.page === 'army_viewarmy') {
		var count = 0;
		$('img[linked="true"][size="square"]').each(function(i,el){
			var uid = $(el).attr('uid'), who = $(el).parent().parent().next();
			count++;
			Elite.data[uid] = Elite.data[uid] || {};
			Elite.data[uid].name = $('a', who).text();
			Elite.data[uid].level = $(who).text().regex(/([0-9]+) Commander/i);
		});
		if (count < 25) {
			this.runtime.armyextra = Player.get('armymax') - length(this.data) - 1;
		}
	}
	return false;
};

Elite.update = function() {
	var i, j, tmp = [], now = Date.now(), check;
	this.runtime.nextelite = this.runtime.nextarena = 0;
	for(j=0; j<this.option.prefer.length; j++) {
		i = this.option.prefer[j];
		if (!/[^0-9]/g.test(i) && this.data[i]) {
			if (!this.runtime.nextelite && (typeof this.data[i].elite !== 'number' || this.data[i].elite < Date.now())) {
				this.runtime.nextelite = i;
			}
			if (!this.runtime.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
				this.runtime.nextarena = i;
			}
		}
	}
	for(i in this.data) {
		if (!this.runtime.nextelite && (typeof this.data[i].elite !== 'number' || this.data[i].elite < Date.now())) {
			this.runtime.nextelite = i;
		}
		if (!this.runtime.nextarena && (typeof this.data[i].arena !== 'number' || (this.data[i].arena !== -1 && this.data[i].arena < Date.now()))) {
			this.runtime.nextarena = i;
		}
	}
	if (this.option.elite || this.option.arena) {
		if (this.option.arena) {
			check = (this.runtime.waitarena + (this.option.every * 3600000));
			tmp.push('Arena Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>'));
		}
		if (this.option.elite) {
			check = (this.runtime.waitelite + (this.option.every * 3600000));
			tmp.push('Elite Guard: Check' + (check < now ? 'ing now' : ' in <span class="golem-time" name="' + check + '">' + makeTimer((check - now) / 1000) + '</span>'));
		}
		Dashboard.status(this, tmp.join(', '));
	} else {
		Dashboard.status(this);
	}
};

Elite.work = function(state) {
	var i, j, found = null;
	if (Math.ceil((Player.get('armymax') - this.runtime.armyextra - 1) / this.option.armyperpage) > this.runtime.armylastpage) {
		if (state) {
			debug('Filling army list');
			this.runtime.armylastpage = Math.max(this.runtime.armylastpage + 1, Math.ceil((length(this.data) + 1) / this.option.armyperpage));
			Page.to('army_viewarmy', '?page=' + this.runtime.armylastpage);
		}
		return true;
	}
	if ((!this.option.elite || !this.runtime.nextelite || (this.runtime.waitelite + (this.option.every * 3600000)) > Date.now()) && (!this.option.arena || !this.runtime.nextarena || (this.runtime.waitarena + (this.option.every * 3600000)) > Date.now())) {
		return false;
	}
	if (!state) {
		return true;
	}
	if (!this.runtime.nextelite && !this.runtime.nextarena && !length(this.data) && !Page.to('army_viewarmy')) {
		return true;
	}
	if ((this.runtime.waitelite + (this.option.every * 3600000)) <= Date.now()) {
		debug('Add Elite Guard member '+this.runtime.nextelite);
		if (!Page.to('keep_eliteguard', '?twt=jneg&jneg=true&user=' + this.runtime.nextelite)) {
			return true;
		}
	}
	if ((this.runtime.waitarena + (this.option.every * 3600000)) <= Date.now()) {
		debug('Add Arena Guard member '+this.runtime.nextarena);
		if (!Page.to('battle_arena', '?user=' + this.runtime.nextarena + '&lka=' + this.runtime.nextarena + '&agtw=1&ref=nf')) {
			return true;
		}
	}
	return false;
};

/********** Worker.Generals **********
* Updates the list of Generals
* Finds best General for other classes
* *** Need to take into account army size and real stats for attack and defense
*/
var Generals = new Worker('Generals');
Generals.option = null;
Generals.data = {};

Generals.defaults = {
	castle_age:{
		pages:'* heroes_generals'
	}
};

Generals.runtime = {
	disabled:false // Nobody should touch this except LevelUp!!!
};

Generals.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
	this._watch(Town);
};

Generals.parse = function(change) {
	if ($('div.results').text().match(/has gained a level!/i)) {
		this.data[Player.get('general')].level++; // Our stats have changed but we don't care - they'll update as soon as we see the Generals page again...
	}
	if (Page.page === 'heroes_generals') {
		var $elements = $('.generalSmallContainer2'), data = this.data;
		if ($elements.length < length(data)) {
			debug('Different number of generals, have '+$elements.length+', want '+length(data));
	//		Page.to('heroes_generals', ''); // Force reload
			return false;
		}
		$elements.each(function(i,el){
			var name = $('.general_name_div3_padding', el).text().trim(), level = parseInt($(el).text().regex(/Level ([0-9]+)/i));
			var progress = parseInt($('div.generals_indv_stats', el).next().children().children().children().next().attr('style').regex(/width: ([0-9]*\.*[0-9]*)%/i));
			if (name && name.indexOf('\t') === -1 && name.length < 30) { // Stop the "All generals in one box" bug
				if (!data[name] || data[name].level !== level || data[name].progress !== progress) {
					data[name] = data[name] || {};
					data[name].img		= $('.imgButton', el).attr('src').filepart();
					data[name].att		= $('.generals_indv_stats_padding div:eq(0)', el).text().regex(/([0-9]+)/);
					data[name].def		= $('.generals_indv_stats_padding div:eq(1)', el).text().regex(/([0-9]+)/);
					data[name].progress	= progress;
					data[name].level	= level; // Might only be 4 so far, however...
					data[name].skills	= $('table div', el).html().replace(/\<[^>]*\>|\s+|\n/g,' ').trim();
					if (level >= 4){	// If we just leveled up to level 4, remove the priority
						if (data[name].priority) {
							delete data[name].priority;
						}
					}
				}
			}
		});
	}
	return false;
};

Generals.update = function(type, worker) {
	var data = this.data, i, priority_list = [], list = [], invade = Town.get('runtime.invade'), duel = Town.get('runtime.duel'), attack, attack_bonus, defend, defense_bonus, army, gen_att, gen_def, attack_potential, defense_potential, att_when_att_potential, def_when_att_potential, att_when_att = 0, def_when_att = 0, monster_att = 0, iatt = 0, idef = 0, datt = 0, ddef = 0, listpush = function(list,i){list.push(i);};
	if (!type || type === 'data') {
		for (i in Generals.data) {
			list.push(i);
		}
		Config.set('generals', ['any'].concat(list.sort()));
	}
	
	// Take all existing priorities and change them to rank starting from 1 and keeping existing order.
	for (i in data) {
		if (data[i].level < 4) {
			priority_list.push([i, data[i].priority]);
		}
	}
	priority_list.sort(function(a,b) {
		return (a[1] - b[1]);
	});
	for (i in priority_list){
		data[priority_list[i][0]].priority = parseInt(i)+1;
	}
	this.runtime.max_priority = priority_list.length;
	// End Priority Stuff
	
	if ((type === 'data' || worker === Town) && invade && duel) {
		for (i in data) {
			attack_bonus = Math.floor(sum(data[i].skills.regex(/([-+]?[0-9]*\.?[0-9]*) Player Attack|Increase Player Attack by ([0-9]+)|Convert ([-+]?[0-9]*\.?[0-9]*) Attack/i)) + ((data[i].skills.regex(/Increase ([-+]?[0-9]*\.?[0-9]*) Player Attack for every Hero Owned/i) || 0) * (length(data)-1)));
			defense_bonus = Math.floor(sum(data[i].skills.regex(/([-+]?[0-9]*\.?[0-9]*) Player Defense|Increase Player Defense by ([0-9]+)/i))	+ ((data[i].skills.regex(/Increase ([-+]?[0-9]*\.?[0-9]*) Player Defense for every Hero Owned/i) || 0) * (length(data)-1)));
			attack = Player.get('attack') + attack_bonus;
			defend = Player.get('defense') + defense_bonus;
			attack_potential = Player.get('attack') + (attack_bonus * 4) / data[i].level;	// Approximation
			defense_potential = Player.get('defense') + (defense_bonus * 4) / data[i].level;	// Approximation
			army = Math.min(Player.get('armymax'),(data[i].skills.regex(/Increases? Army Limit to ([0-9]+)/i) || 501));
			gen_att = getAttDef(data, listpush, 'att', Math.floor(army / 5));
			gen_def = getAttDef(data, listpush, 'def', Math.floor(army / 5));
			att_when_att = (data[i].skills.regex(/Increase Player Attack when Defending by ([-+]?[0-9]+)/i) || 0);
			def_when_att = (data[i].skills.regex(/([-+]?[0-9]+) Defense when attacked/i) || 0);
			att_when_att_potential = (att_when_att * 4) / data[i].level;	// Approximation
			def_when_att_potential = (def_when_att * 4) / data[i].level;	// Approximation
			monster_att = (data[i].skills.regex(/([-+]?[0-9]+) Monster attack/i) || 0);
			data[i].invade = {
				att: Math.floor(invade.attack + data[i].att + (data[i].def * 0.7) + ((attack + (defend * 0.7)) * army) + gen_att),
				def: Math.floor(invade.defend + data[i].def + (data[i].att * 0.7) + ((defend + def_when_att + ((attack + att_when_att) * 0.7)) * army) + gen_def)
			};
			data[i].duel = {
				att: Math.floor(duel.attack + data[i].att + (data[i].def * 0.7) + attack + (defend * 0.7)),
				def: Math.floor(duel.defend + data[i].def + (data[i].att * 0.7) + defend + def_when_att + ((attack + att_when_att) * 0.7))
			};
			data[i].monster = {
				att: Math.floor(duel.attack + data[i].att + attack + monster_att),
				def: Math.floor(duel.defend + data[i].def + defend) // Fortify, so no def_when_att
			};
			data[i].potential = {
				bank: (data[i].skills.regex(/Bank Fee/i) ? 1 : 0),
				defense: Math.floor(duel.defend + (data[i].def + 4 - data[i].level) + ((data[i].att + 4 - data[i].level) * 0.7) + defense_potential + def_when_att_potential + ((attack_potential + att_when_att_potential) * 0.7)),
				income: (data[i].skills.regex(/Increase Income by ([0-9]+)/i) * 4) / data[i].level,
				invade: Math.floor(invade.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + ((attack_potential + (defense_potential * 0.7)) * army) + gen_att),
				duel: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + ((data[i].def + 4 - data[i].level) * 0.7) + attack_potential + (defense_potential * 0.7)),
				monster: Math.floor(duel.attack + (data[i].att + 4 - data[i].level) + attack_potential + (monster_att * 4) / data[i].level),
				raid_invade: 0,
				raid_duel: 0,
				influence: (data[i].skills.regex(/Influence ([0-9]+)% Faster/i) || 0),
				drops: (data[i].skills.regex(/Chance ([0-9]+)% Drops/i) || 0),
				demi: (data[i].skills.regex(/Extra Demi Points/i) ? 1 : 0),
				cash: (data[i].skills.regex(/Bonus ([0-9]+) Gold/i) || 0)
			};
			data[i].potential.raid_invade = (data[i].potential.defense + data[i].potential.invade);
			data[i].potential.raid_duel = (data[i].potential.defense + data[i].potential.duel);
		}
	}
};

Generals.to = function(name) {
	if (this.runtime.disabled) {
		return true;
	}
	this._unflush();
	if (name && !this.data[name]) {
		name = this.best(name);
	}
	if (!name || Player.get('general') === name || name === 'any') {
		return true;
	}
	if (!name || !this.data[name]) {
		log('General "'+name+'" requested but not found!');
		return true; // Not found, so fake it
	}
	if (!Page.to('heroes_generals')) {
		return false;
	}
	debug('Changing to General '+name);
	Page.click('input[src$="' + this.data[name].img + '"]');
	this.data[name].used = (this.data[name].used || 0) + 1;
	return false;
};

Generals.best = function(type) {
	this._unflush();
	var rx = '', best = null, bestval = 0, i, value, list = [];
	if (iscaap()) {
		var caapGenerals = {
			'BuyGeneral':			'cost',
			'LevelUpGeneral':		'stamina',
			'IncomeGeneral':		'income',
			'SubQuestGeneral':		'influence',
			'MonsterGeneral':		'cash',
			'BankingGeneral':		'bank',
			'BattleGeneral':		'invade',
			'MonsterGeneral':		'monster',
			'FortifyGeneral':		'dispel',
			'IdleGeneral':			'defense'
		};
		//gm.log('which ' + type + ' lookup ' + caapGenerals[type]);
		if (caapGenerals[type]) {
			var caapGeneral = gm.getValue(type,'best');
			if (/under level 4/i.test(caapGeneral)) {
				type = 'under level 4';
			} else if (/use current/i.test(caapGeneral)) {
				return 'any';
			} else if (!/^best$/i.test(caapGeneral)) {
				return caapGeneral;
			} else {
				type = caapGenerals[type];
			}
		}
		// Need to add reverse lookup for when golem code calls something set in caap
	}
	switch(type.toLowerCase()) {
		case 'cost':		rx = /Decrease Soldier Cost by ([0-9]+)/i; break;
		case 'stamina':		rx = /Increase Max Stamina by ([0-9]+)|\+([0-9]+) Max Stamina/i; break;
		case 'energy':		rx = /Increase Max Energy by ([0-9]+)|\+([0-9]+) Max Energy/i; break;
		case 'income':		rx = /Increase Income by ([0-9]+)/i; break;
		case 'item':		rx = /([0-9]+)% Drops for Quest/i; break;
		case 'influence':	rx = /Bonus Influence ([0-9]+)/i; break;
		case 'attack':		rx = /([-+]?[0-9]+) Player Attack/i; break;
		case 'defense':		rx = /([-+]?[0-9]+) Player Defense/i; break;
		case 'cash':		rx = /Bonus ([0-9]+) Gold/i; break;
		case 'bank':		return 'Aeris';
		case 'invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && Generals.data[i].invade.att > Generals.data[best].invade.att) || (Generals.data[i].invade && Generals.data[i].invade.att === Generals.data[best].invade.att && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.att > Generals.data[best].duel.att) || (Generals.data[i].duel && Generals.data[i].duel.att === Generals.data[best].duel.att && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-invade':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].invade && (Generals.data[i].invade.att) > (Generals.data[best].invade.att))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'raid-duel':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && (Generals.data[i].duel.att) > (Generals.data[best].duel.att))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'monster':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].monster && Generals.data[i].monster.att > Generals.data[best].monster.att)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'dispel':
		case 'fortify':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].monster && Generals.data[i].monster.def > Generals.data[best].monster.def)) {
					best = i;
				}
			}
			return (best || 'any');
		case 'defend':
			for (i in Generals.data) {
				if (!best || (Generals.data[i].duel && Generals.data[i].duel.def > Generals.data[best].duel.def) || (Generals.data[i].duel && Generals.data[i].duel.def === Generals.data[best].duel.def && best !== Player.get('general'))) {
					best = i;
				}
			}
			return (best || 'any');
		case 'under level 4':
/*			if (Generals.data[Player.get('general')] && Generals.data[Player.get('general')].level < 4) {
				return Player.get('general');
			}
			best = 0;
			for (i in Generals.data) {
				if (Generals.data[i].level < 4) {
					best = Math.max(best, (this.data[i].used || 0));
				}
			}
			for (i in Generals.data) {
				if ((Generals.data[i].used || 0) === best) {
					list.push(i);
				}
			}
			return list.length ? list[Math.floor(Math.random()*list.length)] : 'any';*/
			for (i in Generals.data){
				if (Generals.data[i].priority == 1){
					return i;
				}
			}
		default:
			return 'any';
	}
	for (i in Generals.data) {
		value = Generals.data[i].skills.regex(rx);
		if (value) {
			if (!best || value>bestval) {
				best = i;
				bestval = value;
			}
		}
	}
//	if (best) {
//		debug('Best general found: '+best);
//	}
	return (best || 'any');
};

Generals.order = [];
Generals.dashboard = function(sort, rev) {
	var i, o, output = [], list = [], iatt = 0, idef = 0, datt = 0, ddef = 0, matt = 0, mdef = 0;

	if (typeof sort === 'undefined') {
		Generals.order = [];
		for (i in Generals.data) {
			Generals.order.push(i);
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
	if (typeof sort !== 'undefined') {
		Generals.order.sort(function(a,b) {
			var aa, bb, type, x;
			if (sort == 1) {
				aa = a;
				bb = b;
			} else if (sort == 2) {
				aa = (Generals.data[a].level || 0);
				bb = (Generals.data[b].level || 0);
			} else if (sort == 3) {
				aa = (Generals.data[a].priority || 999999);
				bb = (Generals.data[b].priority || 999999);
			} else {
				type = (sort<6 ? 'invade' : (sort<8 ? 'duel' : 'monster'));
				x = (sort%2 ? 'def' : 'att');
				aa = (Generals.data[a][type][x] || 0);
				bb = (Generals.data[b][type][x] || 0);
			}
			if (typeof aa === 'string' || typeof bb === 'string') {
				return (rev ? bb > aa : bb < aa);
			}
			return (rev ? aa - bb : bb - aa);
		});
	}
	for (i in Generals.data) {
		iatt = Math.max(iatt, Generals.data[i].invade ? Generals.data[i].invade.att : 1);
		idef = Math.max(idef, Generals.data[i].invade ? Generals.data[i].invade.def : 1);
		datt = Math.max(datt, Generals.data[i].duel ? Generals.data[i].duel.att : 1);
		ddef = Math.max(ddef, Generals.data[i].duel ? Generals.data[i].duel.def : 1);
		matt = Math.max(matt, Generals.data[i].monster ? Generals.data[i].monster.att : 1);
		mdef = Math.max(mdef, Generals.data[i].monster ? Generals.data[i].monster.def : 1);
	}
	list.push('<table cellspacing="0" style="width:100%"><thead><tr><th></th><th>General</th><th>Level</th><th>Quest<br>Rank</th><th>Invade<br>Attack</th><th>Invade<br>Defend</th><th>Duel<br>Attack</th><th>Duel<br>Defend</th><th>Monster<br>Attack</th><th>Fortify<br>Dispel</th></tr></thead><tbody>');
	for (o=0; o<Generals.order.length; o++) {
		i = Generals.order[o];
		output = [];
		output.push('<img src="' + imagepath + Generals.data[i].img+'" style="width:25px;height:25px;" title="' + Generals.data[i].skills + '">');
		output.push(i);
		output.push('<div'+(isNumber(Generals.data[i].progress) ? ' title="'+Generals.data[i].progress+'%"' : '')+'>'+Generals.data[i].level+'</div><div style="background-color: #9ba5b1; height: 2px; width=100%;"><div style="background-color: #1b3541; float: left; height: 2px; width: '+(Generals.data[i].progress || 0)+'%;"></div></div>');
		output.push(Generals.data[i].priority ? ((Generals.data[i].priority != 1 ? '<a class="golem-moveup" name='+Generals.data[i].priority+'>&uarr</a> ' : '&nbsp;&nbsp; ') + Generals.data[i].priority + (Generals.data[i].priority != this.runtime.max_priority ? ' <a class="golem-movedown" name='+Generals.data[i].priority+'>&darr</a>' : ' &nbsp;&nbsp;')) : '');
		output.push(Generals.data[i].invade ? (iatt == Generals.data[i].invade.att ? '<strong>' : '') + addCommas(Generals.data[i].invade.att) + (iatt == Generals.data[i].invade.att ? '</strong>' : '') : '?')
		output.push(Generals.data[i].invade ? (idef == Generals.data[i].invade.def ? '<strong>' : '') + addCommas(Generals.data[i].invade.def) + (idef == Generals.data[i].invade.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (datt == Generals.data[i].duel.att ? '<strong>' : '') + addCommas(Generals.data[i].duel.att) + (datt == Generals.data[i].duel.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].duel ? (ddef == Generals.data[i].duel.def ? '<strong>' : '') + addCommas(Generals.data[i].duel.def) + (ddef == Generals.data[i].duel.def ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (matt == Generals.data[i].monster.att ? '<strong>' : '') + addCommas(Generals.data[i].monster.att) + (matt == Generals.data[i].monster.att ? '</strong>' : '') : '?');
		output.push(Generals.data[i].monster ? (mdef == Generals.data[i].monster.def ? '<strong>' : '') + addCommas(Generals.data[i].monster.def) + (mdef == Generals.data[i].monster.def ? '</strong>' : '') : '?');
		list.push('<tr><td>' + output.join('</td><td>') + '</td></tr>');
	}
	list.push('</tbody></table>');
	$('a.golem-moveup').live('click', function(event){
		var gdown = null, gup = null, x = parseInt($(this).attr('name'));
		Generals._unflush();
		for(var i in Generals.data){
			if (Generals.data[i].priority == x){
				gup = i;
			}
			if (Generals.data[i].priority == (x-1)){
				gdown = i;
			}
		}
		if (gdown && gup) {
			debug('Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
		return false;
	});
	$('a.golem-movedown').live('click', function(event){
		var gdown = null, gup = null, x = parseInt($(this).attr('name'));
		Generals._unflush();
		for(var i in Generals.data){
			if (Generals.data[i].priority == x){
				gdown = i;
			}
			if (Generals.data[i].priority == (x+1)){
				gup = i;
			}
		}
		if (gdown && gup) {
			debug('Priority: Swapping '+gup+' with '+gdown);
			Generals.data[gdown].priority++;
			Generals.data[gup].priority--;
		}
		Generals.dashboard(sort,rev);
		return false;
	});
	$('#golem-dashboard-Generals').html(list.join(''));
	$('#golem-dashboard-Generals tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Generals thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
}

/********** Worker.Gift() **********
* Auto accept gifts and return if needed
* *** Needs to talk to Alchemy to work out what's being made
*/
var Gift = new Worker('Gift');

Gift.settings = {
	keep:true
};

Gift.defaults = {
	castle_age:{
		pages:'* index army_invite army_gifts'
	}
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
		var gift_ids = [];
		for (var j in this.data.gifts) {
			gift_ids.push(j);
		}
		for (var i in this.data.todo) {
			if (!(/[^0-9]/g).test(i)) {	// If we have an old entry
				var random_gift_id = Math.floor(Math.random() * gift_ids.length);
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
	if (change) {
		return false;
	}
	var gifts = this.data.gifts, todo = this.data.todo, received = this.data.received, sender_id;
	//alert('Gift.parse running');
	if (Page.page === 'index') {
		// We need to get the image of the gift from the index page.
//		debug('Checking for a waiting gift and getting the id of the gift.');
		if ($('span.result_body').text().indexOf('has sent you a gift') >= 0) {
			this.runtime.gift.sender_ca_name = $('span.result_body').text().regex(/[\t\n]*(.+) has sent you a gift/i);
			this.runtime.gift.name = $('span.result_body').text().regex(/has sent you a gift:\s+(.+)!/i);
			this.runtime.gift.id = $('span.result_body img').attr('src').filepart();
			debug(this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you. (' + this.runtime.gift.id + ')');
			this.runtime.gift_waiting = true;
			return true
		} else if ($('span.result_body').text().indexOf('warrior wants to join your Army') >= 0) {
			this.runtime.gift.sender_ca_name = 'A Warrior';
			this.runtime.gift.name = 'Random Soldier';
			this.runtime.gift.id = 'random_soldier';
			debug(this.runtime.gift.sender_ca_name + ' has a ' + this.runtime.gift.name + ' waiting for you.');
			this.runtime.gift_waiting = true;
			return true
		}
	} else if (Page.page === 'army_invite') {
		// Check for sent
//		debug('Checking for sent gifts.');
		if (this.runtime.sent_id && $('div.result').text().indexOf('request sent') >= 0) {
			debug(gifts[this.runtime.sent_id].name+' sent.');
			for (j=0; j < Math.min(todo[this.runtime.sent_id].length, 30); j++) {	// Remove the IDs from the list because we have sent them
				todo[this.runtime.sent_id].shift();
			}
			if (!todo[this.runtime.sent_id].length) {
				delete todo[this.runtime.sent_id];
			}
			this.runtime.sent_id = null;
			if (todo.length == 0) {
				this.runtime.work = false;
			}
		}
		
		// Accepted gift first
//		debug('Checking for accepted gift.');
		if (this.runtime.gift.sender_id) { // if we have already determined the ID of the sender
			if ($('div.game').text().indexOf('accepted the gift') >= 0 || $('div.game').text().indexOf('have been awarded the gift') >= 0) { // and we have just accepted a gift
				debug('Accepted ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
				received.push(this.runtime.gift); // add the gift to our list of received gifts.  We will use this to clear facebook notifications and possibly return gifts
				this.runtime.work = true;	// We need to clear our facebook notifications and/or return gifts
				this.runtime.gift = {}; // reset our runtime gift tracker
			}
		}
		// Check for gifts
//		debug('Checking for waiting gifts and getting the id of the sender if we already have the sender\'s name.');
		if ($('div.messages').text().indexOf('gift') >= 0) { // This will trigger if there are gifts waiting
			this.runtime.gift_waiting = true;
			if (!this.runtime.gift.id) { // We haven't gotten the info from the index page yet.
				return false;	// let the work function send us to the index page to get the info.
			}
//			debug('Sender Name: ' + $('div.messages img[title*="' + this.runtime.gift.sender_ca_name + '"]').first().attr('title'));
			this.runtime.gift.sender_id = $('div.messages img[uid]').first().attr('uid'); // get the ID of the gift sender. (The sender listed on the index page should always be the first sender listed on the army page.)
			if (this.runtime.gift.sender_id) {
				this.runtime.gift.sender_fb_name = $('div.messages img[uid]').first().attr('title');
//				debug('Found ' + this.runtime.gift.sender_fb_name + "'s ID. (" + this.runtime.gift.sender_id + ')');
			} else {
				log("Can't find the gift sender's ID.");
			}
		} else {
//			debug('No more waiting gifts. Did we miss the gift accepted page?');
			this.runtime.gift_waiting = false;
			this.runtime.gift = {}; // reset our runtime gift tracker
		}
		
	} else if (Page.page === 'army_gifts') { // Parse for the current available gifts
//		debug('Parsing gifts.');
//		debug('Found: '+$('#app'+APPID+'_giftContainer div[id^="app'+APPID+'_gift"]').length);
		this.data.gifts = {};
		gifts = this.data.gifts;
		$('div[id*="_giftContainer"] div[id*="_gift"]').each(function(i,el){
			var id = $('img', el).attr('src').filepart(), name = $(el).text().trim().replace('!',''), slot = $(el).attr('id').regex(/_gift([0-9]+)/);
//			debug('Adding: '+name+'('+id+') to slot '+slot);
			gifts[id] = {};
			gifts[id].name = name;
			gifts[id].slot = slot;
		});
	} else {
		if ($('div.result').text().indexOf('have exceed') !== -1){
			debug('We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
		}
	}
	return false;
};

Gift.work = function(state) {
	if (length(todo) && (this.runtime.gift_delay < Date.now())) {
		this.runtime.work = true;
		return true;
	}
	if (!state) {
		if (this.runtime.gift_waiting || this.runtime.work) {	// We need to get our waiting gift or return gifts.
			return true;
		}
		return false;
	}
	if (!this.runtime.gift_waiting && !this.runtime.work) {
		return false;
	}
	if(this.runtime.gift_waiting && !this.runtime.gift.id) {	// We have a gift waiting, but we don't know the id.
		if (!Page.to('index')) {	// Get the gift id from the index page.
			return true;
		}
	}
	if(this.runtime.gift.id && !this.runtime.gift.sender_id) {	// We have a gift id, but no sender id.
		if (!Page.to('army_invite')) {	// Get the sender id from the army_invite page.
			return true;
		}
	}
	if (this.runtime.gift.sender_id) { // We have the sender id so we can receive the gift.
		if (!Page.to('army_invite')) {
			return true;
		}
//		debug('Accepting ' + this.runtime.gift.name + ' from ' + this.runtime.gift.sender_ca_name + '(id:' + this.runtime.gift.sender_id + ')');
		if (!Page.to('army_invite', '?act=acpt&rqtp=gift&uid=' + this.runtime.gift.sender_id) || this.runtime.gift.sender_id.length > 0) {	// Shortcut to accept gifts without going through Facebook's confirmation page
			return true;
		}
	}
	
	var i, j, k, todo = this.data.todo, received = this.data.received, gift_ids = [], random_gift_id;

	if (!received.length && (!length(todo) || (this.runtime.gift_delay > Date.now()))) {
		this.runtime.work = false;
		Page.to('keep_alchemy');
		return false;
	}
	
	// We have received gifts so we need to figure out what to send back.
	if (received.length) {
		Page.to('army_gifts');
		// Fill out our todo list with gifts to send, or not.
		for (i in received){
			var temptype = this.option.type;
			if (typeof this.data.gifts[received[i].id] === 'undefined' && this.option.type != 'None') {
				debug(received[i].id+' was not found in our sendable gift list.');
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
						debug('Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' to ' + received[i].sender_ca_name);
						if (!todo[gift_ids[random_gift_id]]) {
							todo[gift_ids[random_gift_id]] = [];
						}
						todo[gift_ids[random_gift_id]].push(received[i].sender_id);
					}
					this.runtime.work = true;
					break;
				case 'Same as Received':
					debug('Will return a ' + received[i].name + ' to ' + received[i].sender_ca_name);
					if (!todo[received[i].id]) {
						todo[received[i].id] = [];
					}
					todo[received[i].id].push(received[i].sender_id);
					this.runtime.work = true;
					break;
				case 'None':
				default:
					this.runtime.work = false;	// Since we aren't returning gifts, we don't need to do any more work.
					break;
			}
		}
		
		// Clear the facebook notifications and empty the received list.
		for (i in received) {
			// Go to the facebook page and click the "ignore" button for this entry
			
			// Then delete the entry from the received list.
			received.shift();
		}
		
	}
	
	if (this.runtime.gift_sent > Date.now()) {	// We have sent gift(s) and are waiting for the fb popup
//		debug('Waiting for FB popup.');
		if ($('div.dialog_buttons input[name="sendit"]').length){
			this.runtime.gift_sent = null;
			Page.click('div.dialog_buttons input[name="sendit"]');
		} else if ($('span:contains("Out of requests")')) {
			debug('We have run out of gifts to send.  Waiting one hour to retry.');
			this.runtime.gift_delay = Date.now() + 3600000;	// Wait an hour and try to send again.
			Page.click('div.dialog_buttons input[name="ok"]');
		}
		return true;
	} else if (this.runtime.gift_sent) {
		this.runtime.gift_sent = null;
	}
	
	// Give some gifts back
	if (length(todo) && (!this.runtime.gift_delay || (this.runtime.gift_delay < Date.now()))) {
		for (i in todo) {
			if (!Page.to('army_gifts')){
				return true;
			}
			if (typeof this.data.gifts[i] === 'undefined') {  // Unknown gift in todo list
				gift_ids = [];
				for (j in this.data.gifts) {
					gift_ids.push(j);
				}
				random_gift_id = Math.floor(Math.random() * gift_ids.length);
				debug('Unavaliable gift ('+i+') found in todo list. Will randomly send a ' + this.data.gifts[gift_ids[random_gift_id]].name + ' instead.');
				if (!todo[gift_ids[random_gift_id]]) {
					todo[gift_ids[random_gift_id]] = [];
				}
				for (j in todo[i]) {
					todo[gift_ids[random_gift_id]].push(todo[i][j]);
				}
				delete todo[i];
				return true;
			}
			if ($('div[style*="giftpage_select"] div a[href*="giftSelection='+this.data.gifts[i].slot+'"]').length){
				if ($('img[src*="gift_invite_castle_on"]').length){
					if ($('div.unselected_list').children().length) {
						debug('Sending out ' + this.data.gifts[i].name);
						k = 0;
						for (j in todo[i]) {
							if (k< 30) {	// Need to limit to 30 at a time
								if (!$('div.unselected_list input[value=\'' + todo[i][j] + '\']').length){
//									debug('User '+todo[i][j]+' wasn\'t in the CA friend list.');
									continue;
								}
								Page.click('div.unselected_list input[value="' + todo[i][j] + '"]');
								k++;
							}
						}
						if (k == 0) {
						delete todo[i];
							return true;
						}
						this.runtime.sent_id = i;
						this.runtime.gift_sent = Date.now() + (60000);	// wait max 60 seconds for the popup.
						Page.click('input[name="send"]');
						return true;
					} else {
						return true;
					}
				} else if ($('div.tabBtn img.imgButton[src*="gift_invite_castle_off"]').length) {
					Page.click('div.tabBtn img.imgButton[src*="gift_invite_castle_off"]');
					return true;
				} else {
					return true;
				}
			} else if ($('div[style*="giftpage_select"]').length) {
				Page.click('a[href*="giftSelection='+this.data.gifts[i].slot+'"]:parent');
				return true;
			} else {
				return true;
			}
		}
	}
	
	return false;
};

/********** Worker.Heal **********
* Auto-Heal above a stamina level
* *** Needs to check if we have enough money (cash and bank)
*/
var Heal = new Worker('Heal');
Heal.data = null;

Heal.defaults = {
	castle_age:{}
};

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

Heal.work = function(state) {
	if (Player.get('health') >= Player.get('maxhealth') || Player.get('stamina') < Heal.option.stamina || Player.get('health') >= Heal.option.health) {
		return false;
	}
	if (!state) {
		return true;
	}
	return this.me();
};

Heal.me = function() {
	if (!Page.to('keep_stats')) {
		return true;
	}
	debug('Healing...');
	if ($('input[value="Heal Wounds"]').length) {
		Page.click('input[value="Heal Wounds"]');
	} else {
		log('Danger Danger Will Robinson... Unable to heal!');
	}
	return false;
};

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
History.option = null;

History.defaults = {
	castle_age:{
		init: function() {
			if (Player.data.history) {
				this.data = Player.data.history;
				delete Player.data.history;
			}
		}
	}
};

History.dashboard = function() {
	var i, max = 0, list = [], output = [];
	list.push('<table cellspacing="0" cellpadding="0" class="golem-graph"><thead><tr><th></th><th colspan="73"><span style="float:left;">&lArr; Older</span>72 Hour History<span style="float:right;">Newer &rArr;</span><th></th></th></tr></thead><tbody>');
	list.push(this.makeGraph(['land', 'income'], 'Income', true, {'Average Income':this.get('land.mean') + this.get('income.mean')}));
	list.push(this.makeGraph('bank', 'Bank', true, Land.runtime.best ? {'Next Land':Land.runtime.cost} : null)); // <-- probably not the best way to do this, but is there a function to get options like there is for data?
	list.push(this.makeGraph('exp', 'Experience', false, {'Next Level':Player.get('maxexp')}));
	list.push(this.makeGraph('exp.change', 'Exp Gain', false, {'Average':this.get('exp.average.change'), 'Standard Deviation':this.get('exp.stddev.change'), 'Ignore entries above':(this.get('exp.mean.change') + (2 * this.get('exp.stddev.change')))} )); // , 'Harmonic Average':this.get('exp.harmonic.change') ,'Median Average':this.get('exp.median.change') ,'Mean Average':this.get('exp.mean.change')
	list.push('</tbody></table>');
	$('#golem-dashboard-History').html(list.join(''));
}


History.update = function(type) {
	var i, hour = Math.floor(Date.now() / 3600000) - 168;
	for (i in this.data) {
		if (i < hour) {
			delete this.data[i];
		}
	}
//	debug('Exp: '+this.get('exp'));
//	debug('Exp max: '+this.get('exp.max'));
//	debug('Exp max change: '+this.get('exp.max.change'));
//	debug('Exp min: '+this.get('exp.min'));
//	debug('Exp min change: '+this.get('exp.min.change'));
//	debug('Exp change: '+this.get('exp.change'));
//	debug('Exp mean: '+this.get('exp.mean.change'));
//	debug('Exp harmonic: '+this.get('exp.harmonic.change'));
//	debug('Exp geometric: '+this.get('exp.geometric.change'));
//	debug('Exp mode: '+this.get('exp.mode.change'));
//	debug('Exp median: '+this.get('exp.median.change'));
//	debug('Average Exp = weighted average: ' + this.get('exp.average.change') + ', mean: ' + this.get('exp.mean.change') + ', geometric: ' + this.get('exp.geometric.change') + ', harmonic: ' + this.get('exp.harmonic.change') + ', mode: ' + this.get('exp.mode.change') + ', median: ' + this.get('exp.median.change'));
};

History.set = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000), x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
		hour = x.shift();
	}
	this.data[hour] = this.data[hour] || {}
	this.data[hour][x[0]] = value;
};

History.add = function(what, value) {
	if (!value) {
		return;
	}
	this._unflush();
	var hour = Math.floor(Date.now() / 3600000), x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []);
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
		hour = x.shift();
	}
	this.data[hour] = this.data[hour] || {}
	this.data[hour][x[0]] = (this.data[hour][x[0]] || 0) + value;
};

History.math = {
	stddev: function(list) {
		var i, listsum = 0, mean = this.mean(list);
		for (i in list) {
			listsum += Math.pow(list[i] - mean, 2);
		}
		listsum /= list.length;
		return Math.sqrt(listsum);
	},
	average: function(list) {
		var i, mean = this.mean(list), stddev = this.stddev(list);
		for (i in list) {
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
		var i, num = [];
		for (i in list) {
			if (list[i]) {
				num.push(1/list[i])
			}
		}
		return num.length / sum(num);
	},
	geometric: function(list) {
		var i, num = 1;
		for (i in list) {
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
		var i, j = 0, count = 0, num = {};
		for (i in list) {
			num[list[i]] = (num[list[i]] || 0) + 1
		}
		num = sortObject(num, function(a,b){return num[b]-num[a];});
		for (i in num) {
			if (num[i] === num[0]) {
				j += parseInt(num[i]);
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
	var i, j, value, last = null, list = [], data = this.data, x = typeof what === 'string' ? what.split('.') : (typeof what === 'object' ? what : []), hour = Math.floor(Date.now() / 3600000), exact = false, past = 168, change = false;
	if (x.length && (typeof x[0] === 'number' || !x[0].regex(/[^0-9]/gi))) {
		hour = x.shift();
	}
	if (x.length && (typeof x[x.length-1] === 'number' || !x[x.length-1].regex(/[^0-9]/gi))) {
		past = Math.range(1, parseInt(x.pop()), 168);
	}
	if (!x.length) {
		return data;
	}
	for (i in data) {
		if (typeof data[i][x[0]] === 'number') {
			exact = true;
			break;
		}
	}
	if (x.length === 1) { // only the current value
		if (exact) {
			return data[hour][x[0]];
		}
		for (j in data[hour]) {
			if (j.indexOf(x[0] + '+') === 0 && typeof data[hour][j] === 'number') {
				value = (value || 0) + data[hour][j];
			}
		}
		return value;
	}
	if (x.length === 2 && x[1] === 'change') {
		if (data[hour] && data[hour-1]) {
			i = this.get([hour, x[0]]);
			j = this.get([hour - 1, x[0]]);
			if (typeof i === 'number' && typeof j === 'number') {
				return i - j;
			}
			return 0;
		}
		return 0;
	}
	if (x.length > 2 && x[2] === 'change') {
		change = true;
	}
	for (i=hour-past; i<=hour; i++) {
		if (data[i]) {
			value = null;
			if (exact) {
				if (typeof data[i][x[0]] === 'number') {
					value = data[i][x[0]];
				}
			} else {
				for (j in data[i]) {
					if (j.indexOf(x[0] + '+') === 0 && typeof data[i][j] === 'number') {
						value = (value || 0) + data[i][j];
					}
				}
			}
			if (change) {
				if (value !== null && last !== null) {
					list.push(value - last);
					if (isNaN(list[list.length - 1])) {
						debug('NaN: '+value+' - '+last);
					}
				}
				last = value;
			} else {
				if (value !== null) {
					list.push(value);
				}
			}
		}
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

History.makeGraph = function(type, title, iscash, goal) {
	var i, j, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, max_s, min_s, goal_s = [], list = [], bars = [], output = [], value = {}, goalbars = '', divide = 1, suffix = '', hour = Math.floor(Date.now() / 3600000), title, numbers;
	if (typeof goal === 'number') {
		goal = [goal];
	} else if (typeof goal !== 'array' && typeof goal !== 'object') {
		goal = null;
	}
	if (goal && length(goal)) {
		for (i in goal) {
			min = Math.min(min, goal[i]);
			max = Math.max(max, goal[i]);
		}
	}
	if (typeof type === 'string') {
		type = [type];
	}
	for (i=hour-72; i<=hour; i++) {
		value[i] = [0];
		if (this.data[i]) {
			for (j in type) {
				value[i][j] = this.get(i + '.' + type[j]);
			}
			if (sum(value[i])) {min = Math.min(min, sum(value[i]));}
			max = Math.max(max, sum(value[i]));
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
	max_s = (iscash ? '$' : '') + addCommas(max / divide) + suffix;
	min = Math.floor(min / divide) * divide;
	min_s = (iscash ? '$' : '') + addCommas(min / divide) + suffix;
	if (goal && length(goal)) {
		for (i in goal) {
			bars.push('<div style="bottom:' + Math.max(Math.floor((goal[i] - min) / (max - min) * 100), 0) + 'px;"></div>');
			goal_s.push('<div' + (typeof i !== 'number' ? ' title="'+i+'"' : '') + ' style="bottom:' + Math.range(2, Math.ceil((goal[i] - min) / (max - min) * 100)-2, 92) + 'px;">' + (iscash ? '$' : '') + addCommas((goal[i] / divide).round(1)) + suffix + '</div>');
		}
		goalbars = '<div class="goal">' + bars.reverse().join('') + '</div>';
		goal_s.reverse();
	}
	th(list, '<div>' + max_s + '</div><div>' + title + '</div><div>' + min_s + '</div>')
	for (i=hour-72; i<=hour; i++) {
		bars = []
		output = [];
		numbers = [];
		title = (hour - i) + ' hour' + ((hour - i)==1 ? '' : 's') +' ago';
		var count = 0;
		for (j in value[i]) {
			bars.push('<div style="height:' + Math.max(Math.ceil(100 * (value[i][j] - (!count ? min : 0)) / (max - min)), 0) + 'px;"></div>');
			count++;
			if (value[i][j]) {
				numbers.push((value[i][j] ? (iscash ? '$' : '') + addCommas(value[i][j]) : ''));
			}
		}
		output.push('<div class="bars">' + bars.reverse().join('') + '</div>' + goalbars);
		numbers.reverse();
		title = title + (numbers.length ? ', ' : '') + numbers.join(' + ') + (numbers.length > 1 ? ' = ' + (iscash ? '$' : '') + addCommas(sum(value[i])) : '');
		td(list, output.join(''), 'title="' + title + '"');
	}
	th(list, goal_s.join(''));
	return '<tr>' + list.join('') + '</tr>';
}

/********** Worker.Idle **********
* Set the idle general
* Keep focus for disabling other workers
*/
var Idle = new Worker('Idle');
Idle.defaults = {
	castle_age:{}
};
Idle.settings ={
    after:['LevelUp']
};

Idle.data = null;
Idle.option = {
	general: 'any',
	index: 'Daily',
	alchemy: 'Daily',
	quests: 'Never',
	town: 'Never',
	battle: 'Quarterly',
	monsters: 'Hourly',
        collect: 'Never'
};

Idle.when = ['Never', 'Quarterly', 'Hourly', '2 Hours', '6 Hours', '12 Hours', 'Daily', 'Weekly'];
Idle.display = [
	{
		label:'<strong>NOTE:</strong> Any workers below this will <strong>not</strong> run!<br>Use this for disabling workers you do not use.'
	},{
		id:'general',
		label:'Idle General',
		select:'generals'
	},{
		label:'Check Pages:'
	},{
		id:'index',
		label:'Home Page',
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
		id:'battle',
		label:'Battle',
		select:Idle.when
	},{
		id:'monsters',
		label:'Monsters',
		select:Idle.when
	},{
		id:'collect',
		label:'Apprentice Reward',
		select:Idle.when
	}
];

Idle.work = function(state) {
	if (!state) {
		return true;
	}
	var i, p, time, pages = {
		index:['index'],
		alchemy:['keep_alchemy'],
		quests:['quests_quest1', 'quests_quest2', 'quests_quest3', 'quests_quest4', 'quests_quest5', 'quests_quest6', 'quests_quest7', 'quests_quest8', 'quests_demiquests', 'quests_atlantis'],
		town:['town_soldiers', 'town_blacksmith', 'town_magic', 'town_land'],
		battle:['battle_battle'], //, 'battle_arena'
		monsters:['keep_monster', 'battle_raid'],
                collect:['apprentice_collect']
	}, when = { 'Never':0, 'Quarterly':900000, 'Hourly':3600000, '2 Hours':7200000, '6 Hours':21600000, '12 Hours':43200000, 'Daily':86400000, 'Weekly':604800000 };
	if (!Generals.to(this.option.general)) {
		return true;
	}
	for (i in pages) {
		if (!when[this.option[i]]) {
			continue;
		}
		time = Date.now() - when[this.option[i]];
		for (p=0; p<pages[i].length; p++) {
			if (!Page.get(pages[i][p]) || Page.get(pages[i][p]) < time) {
				if (!Page.to(pages[i][p])) {
					Page.set(pages[i][p], Date.now())
					return true;
				}
			}
		}
	}
	return true;
};

/********** Worker.Income **********
* Auto-general for Income, also optional bank
* User selectable safety margin - at default 5 sec trigger it can take up to 14 seconds (+ netlag) to change
*/
var Income = new Worker('Income');
Income.data = null;

Income.settings = {
	important:true
};

Income.defaults = {
	castle_age:{}
};

Income.option = {
	general:true,
	bank:true,
	margin:45
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

Income.work = function(state) {
	if (!Income.option.margin) {
		return false;
	}
//	debug(when + ', Margin: ' + Income.option.margin);
	if (Player.get('cash_timer') > this.option.margin) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return false;
	}
	if (!state) {
		return true;
	}
	if (this.option.general && !Generals.to(Generals.best('income'))) {
		return true;
	}
	debug('Waiting for Income... (' + Player.get('cash_timer') + ' seconds)');
	return true;
};

/********** Worker.Land **********
* Auto-buys property
*/
var Land = new Worker('Land');

Land.defaults = {
	castle_age:{
		pages:'town_land'
	}
};
Land.settings = {
    stateful:true
};

Land.option = {
	enabled:true,
//	wait:48,
	onlyten:false,
	sell:false,
	land_exp:false
};

Land.caap_load = function() {
	valuesList = {'enabled':'autoBuyLand','sell':'SellLands'};
	for (i in valuesList) {
		this.option[i] = gm.getValue(valuesList[i]);
	}
};

Land.runtime = {
	lastlevel:0,
	best:null,
	buy:0,
	cost:0
};

Land.display = [
	{
		id:'enabled',
		label:'Auto-Buy Land',
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
//	},{
/*		id:'wait',
		label:'Maximum Wait Time',
		select:[0, 24, 36, 48],
		suffix:'hours',
		help:'There has been a lot of testing in this code, it is the fastest way to increase your income despite appearances!'
	},{*/
/*		advanced:true,
		id:'onlyten',
		label:'Only buy 10x<br>NOTE: This is slower!!!',
		checkbox:true,
		help:'The standard method is guaranteed to be the most efficient.  Choosing this option will slow down your income.'
*/	}
];

Land.parse = function(change) {
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		var name = $('img', el).attr('alt'), tmp;
		if (!change) {
			// Fix for broken land page!!
			!$('.land_buy_image_int', el).length && $('.land_buy_image', el).prepend('<div class="land_buy_image_int"></div>').children('.land_buy_image_int').append($('.land_buy_image >[class!="land_buy_image_int"]', el));
			!$('.land_buy_info_int', el).length && $('.land_buy_info', el).prepend('<div class="land_buy_info_int"></div>').children('.land_buy_info_int').append($('.land_buy_info >[class!="land_buy_info_int"]', el));
			Land.data[name] = {};
			Land.data[name].income = $('.land_buy_info .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			Land.data[name].max = $('.land_buy_info', el).text().regex(/Max Allowed For your level: ([0-9]+)/i);
			Land.data[name].cost = $('.land_buy_costs .gold', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
			tmp = $('option', $('.land_buy_costs .gold', el).parent().next()).last().attr('value');
			if (tmp) {
				Land.data[name].buy = tmp;
			}
			Land.data[name].own = $('.land_buy_costs span', el).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
		} else {
			iscaap() &&	$('.land_buy_info strong:first', el).after('<strong title="Daily Return On Investment - higher is better"> | ROI ' + ((Land.data[name].own < Land.data[name].max) ? (Land.data[name].income * 2400) / Land.data[name].cost : 0).round(3) + '%</strong>');
			!iscaap() && $('.land_buy_info strong:first', el).after(' - (<strong title="Return On Investment - higher is better">ROI</strong>: ' + ((Land.data[name].income * 100) / Land.data[name].cost).round(3) + '%)');
		}
	});
	return true;
};

Land.update = function() {
	var i, worth = Bank.worth(), income = Player.get('income') + History.get('income.mean'), best, buy = 0;
	
	if (this.option.land_exp) {
		$('input:golem(land,sell)').attr('checked',true);
		this.option.sell = true;
	}
	
	for (i in this.data) {
		if (this.option.sell && this.data[i].own > this.data[i].max) {
			best = i;
			buy = this.data[i].max - this.data[i].own;// Negative number means sell
			if (this.option.land_exp) {
				buy = -10;
			}
			break;
		}
		if (this.data[i].buy) {
			if (!best || ((this.data[best].cost / income) + (this.data[i].cost / (income + this.data[best].income))) > ((this.data[i].cost / income) + (this.data[best].cost / (income + this.data[i].income)))) {
				best = i;
			}
		}
	}
	if (best) {
		if (!buy) {
	/*		if (this.option.onlyten || (this.data[best].cost * 10) <= worth || (this.data[best].cost * 10 / income < this.option.wait)) {
				buy = Math.min(this.data[best].max - this.data[best].own, 10);
			} else if ((this.data[best].cost * 5) <= worth || (this.data[best].cost * 5 / income < this.option.wait)) {
				buy = Math.min(this.data[best].max - this.data[best].own, 5);
			} else {
				buy = 1;
			}*/
			
			//	This calculates the perfect time to switch the amounts to buy.
			//	If the added income from a smaller purchase will pay for the increase in price before you can afford to buy again, buy small.
			//	In other words, make the smallest purchase where the time to make the purchase is larger than the time to payoff the increased cost with the extra income.
			//	It's different for each land because each land has a different "time to payoff the increased cost".
			
			var cost_increase = this.data[best].cost / (10 + this.data[best].own);		// Increased cost per purchased land.  (Calculated from the current price and the quantity owned, knowing that the price increases by 10% of the original price per purchase.)
			var time_limit = cost_increase / this.data[best].income;		// How long it will take to payoff the increased cost with only the extra income from the purchase.  (This is constant per property no matter how many are owned.)
			time_limit = time_limit * 1.5;		// fudge factor to take into account that most of the time we won't be buying the same property twice in a row, so we will have a bit more time to recoup the extra costs.
//			if (this.option.onlyten || (this.data[best].cost * 10) <= worth) {			// If we can afford 10, buy 10.  (Or if people want to only buy 10.)
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
		this.runtime.buy = buy;
		this.runtime.cost = buy * this.data[best].cost; // May be negative if we're making money by selling
		Dashboard.status(this, (buy>0 ? (this.runtime.buy ? 'Buying ' : 'Want to buy ') : (this.runtime.buy ? 'Selling ' : 'Want to sell ')) + Math.abs(buy) + 'x ' + best + ' for $' + addCommas(Math.abs(this.runtime.cost)));
	} else {
		Dashboard.status(this);
	}
	this.runtime.best = best;
}

Land.work = function(state) {
	if (!this.option.enabled || !this.runtime.best || !this.runtime.buy || !Bank.worth(this.runtime.cost)) {
		if (!this.runtime.best && this.runtime.lastlevel < Player.get('level')) {
			if (!state || !Page.to('town_land')) {
				return true;
			}
			this.runtime.lastlevel = Player.get('level');
		}
		return false;
	}
	if (!state || !Bank.retrieve(this.runtime.cost) || !Page.to('town_land')) {
		return true;
	}
//	var el = $('tr.land_buy_row:contains("'+this.runtime.best+'"),tr.land_buy_row_unique:contains("'+this.runtime.best+'")');
	$('tr.land_buy_row,tr.land_buy_row_unique').each(function(i,el){
		if ($('img', el).attr('alt') === Land.runtime.best) {
			if (Land.runtime.buy > 0) {
				$('select', $('.land_buy_costs .gold', el).parent().next()).val(Land.runtime.buy > 5 ? 10 : (Land.runtime.buy > 1 ? 5 : 1));
			} else {
				$('select', $('.land_buy_costs .gold', el).parent().parent().next()).val(Land.runtime.buy <= -10 ? 10 : (Land.runtime.buy <= -5 ? 5 : 1));
			}
			debug('Land',(Land.runtime.buy > 0 ? 'Buy' : 'Sell') + 'ing ' + Math.abs(Land.runtime.buy) + ' x ' + Land.runtime.best + ' for $' + addCommas(Math.abs(Land.runtime.cost)));
			Page.click($('.land_buy_costs input[name="' + (Land.runtime.buy > 0 ? 'Buy' : 'Sell') + '"]', el));
		}
	});
	return QUEUE_RELEASE;
};

/********** Worker.LevelUp **********
* Will give us a quicker level-up, optionally changing the general to gain extra stats
* 1. Switches generals to specified general
* 2. Changes the best Quest to the one that will get the most exp (rinse and repeat until no energy left) - and set Queue.burn.energy to max available
* 3. Will call Heal.me() function if current health is under 10 and there is any stamina available (So Battle/Arena/Monster can automatically use up the stamina.)
* 4. Will set Queue.burn.stamina to max available
*/

var LevelUp = new Worker('LevelUp');
LevelUp.data = null;

LevelUp.settings = {
	before:['Idle','Battle','Monster','Quest']
};

LevelUp.defaults = {
	castle_age:{
		pages:'*'
	}
};

LevelUp.option = {
	enabled:false,
	income:true,
	general:'any',
	order:'stamina',
	algorithm:'Per Action'
};

LevelUp.runtime = {
	level:0,// set when we start, compare to end
	heal_me:false,// we're active and want healing...
	battle_monster:false,// remember whether we're doing monsters first or not or not...
	old_quest:null,// save old quest, if it's not null and we're working then push it back again...
	old_quest_energy:0,
	running:false,// set when we change
	energy:0,
	stamina:0,
	exp:0,
	exp_possible:0,
	energy_samples:0,
	exp_per_energy:1,
	stamina_samples:0,
	exp_per_stamina:1,
	quests:[] // quests[energy] = [experience, [quest1, quest2, quest3]]
};

LevelUp.display = [
	{
		title:'Important!',
		label:'This will spend Energy and Stamina to force you to level up quicker.'
	},{
		id:'enabled',
		label:'Enabled',
		checkbox:true
	},{
		id:'income',
		label:'Allow Income General',
		checkbox:true
	},{
		id:'general',
		label:'Best General',
		select:['any', 'Energy', 'Stamina'],
		help:'Select which type of general to use when leveling up.'
	},{
		id:'order',
		label:'Spend first ',
		select:['Energy','Stamina'],
		help:'Select which resource you want to spend first when leveling up.'
	},{
		id:'algorithm',
		label:'Estimation Method',
		select:['Per Action', 'Per Hour'],
		help:"'Per Hour' uses your gain per hour. 'Per Action' uses your gain per action."
	}
];

LevelUp.init = function() {
	this._watch(Player);
	this._watch(Quest);
	this.runtime.exp = this.runtime.exp || Player.get('exp'); // Make sure we have a default...
	this.runtime.level = this.runtime.level || Player.get('level'); // Make sure we have a default...
};

LevelUp.parse = function(change) {
	if (change) {
		$('#app'+APPID+'_st_2_5 strong').attr('title', Player.get('exp') + '/' + Player.get('maxexp') + ' at ' + addCommas(this.get('exp_average').round(1)) + ' per hour').html(addCommas(Player.get('exp_needed')) + '<span style="font-weight:normal;"> in <span class="golem-time" style="color:rgb(25,123,48);" name="' + this.get('level_time') + '">' + makeTimer(this.get('level_timer')) + '</span></span>');
	} else {
		$('.result_body').each(function(i,el){
			if (!$('img[src$="battle_victory.gif"]', el).length) {
				return;
			}
			var txt = $(el).text().replace(/,|\t/g, ''), x;
			x = txt.regex(/([+-][0-9]+) Experience/i);
			if (x) { History.add('exp+battle', x); }
			x = (txt.regex(/\+\$([0-9]+)/i) || 0) - (txt.regex(/\-\$([0-9]+)/i) || 0);
			if (x) { History.add('income+battle', x); }
			x = txt.regex(/([+-][0-9]+) Battle Points/i);
			if (x) { History.add('bp+battle', x); }
			x = txt.regex(/([+-][0-9]+) Stamina/i);
			if (x) { History.add('stamina+battle', x); }
			x = txt.regex(/([+-][0-9]+) Energy/i);
			if (x) { History.add('energy+battle', x); }
		});
	}
	return true;
}

LevelUp.update = function(type,worker) {
	var d, i, j, k, quests, energy = Player.get('energy'), stamina = Player.get('stamina'), exp = Player.get('exp'), runtime = this.runtime, quest_data;
	if (worker === Player || !length(runtime.quests)) {
		if (exp !== runtime.exp) { // Experience has changed...
			if (runtime.stamina > stamina) {
				runtime.exp_per_stamina = ((runtime.exp_per_stamina * Math.min(runtime.stamina_samples, 49)) + ((exp - runtime.exp) / (runtime.stamina - stamina))) / Math.min(runtime.stamina_samples + 1, 50); // .round(3)
				runtime.stamina_samples = Math.min(runtime.stamina_samples + 1, 50); // More samples for the more variable stamina
			} else if (runtime.energy > energy) {
				runtime.exp_per_energy = ((runtime.exp_per_energy * Math.min(runtime.energy_samples, 9)) + ((exp - runtime.exp) / (runtime.energy - energy))) / Math.min(runtime.energy_samples + 1, 10); // .round(3)
				runtime.energy_samples = Math.min(runtime.energy_samples + 1, 10); // fewer samples for the more consistent energy
			}
		}
		runtime.energy = energy;
		runtime.stamina = stamina;
		runtime.exp = exp;
	}
	if (worker === Quest || !length(runtime.quests)) { // Now work out the quickest quests to level up
		quest_data = Quest.get();
		runtime.quests = quests = [[0]];// quests[energy] = [experience, [quest1, quest2, quest3]]
		for (i in quest_data) { // Fill out with the best exp for every energy cost
			if (!quests[quest_data[i].energy] || quest_data[i].exp > quests[quest_data[i].energy][0]) {
				quests[quest_data[i].energy] = [quest_data[i].exp, [i]];
			}
		}
		j = 1;
		k = [0];
		for (i=1; i<quests.length; i++) { // Fill in the blanks and replace using the highest exp per energy ratios
			if (quests[i] && quests[i][0] / i >= k[0] / j) {
				j = i;
				k = quests[i];
			} else {
				quests[i] = [k[0], [k[1][0]]];
			}
		}
		while (quests.length > 1 && quests[quests.length-1][0] === quests[quests.length-2][0]) { // Delete entries at the end that match (no need to go beyond our best ratio quest)
			quests.pop();
		}
// No need to merge quests as we're only interested in the first one...
//		for (i=1; i<quests.length; i++) { // Merge lower value quests to use up all the energy
//			if (quest_data[quests[i][1][0]].energy < i) {
//				quests[i][0] += quests[i - quest_data[quests[i][1][0]].energy][0];
//				quests[i][1] = quests[i][1].concat(quests[i - quest_data[quests[i][1][0]].energy][1])
//			}
//		}
//		debug('Quickest '+quests.length+' Quests: '+JSON.stringify(quests));
	}
	if (!this.runtime.quests.length) { // No known quests yet...
		runtime.exp_possible = 1;
	} else if (energy < this.runtime.quests.length) { // Energy from questing
		runtime.exp_possible = this.runtime.quests[Math.min(energy, this.runtime.quests.length - 1)][0];
	} else {
		runtime.exp_possible = (this.runtime.quests[this.runtime.quests.length-1][0] * Math.floor(energy / (this.runtime.quests.length - 1))) + this.runtime.quests[energy % (this.runtime.quests.length - 1)][0];
	}
	runtime.exp_possible += Math.floor(stamina * runtime.exp_per_stamina); // Stamina estimate (when we can spend it)
	d = new Date(this.get('level_time'));
	if (this.option.enabled) {
		if (runtime.running) {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.runtime.exp_possible + ', per Hour: ' + addCommas(this.get('exp_average').round(1)) + ', per Energy: ' + this.runtime.exp_per_energy.round(2) + ', per Stamina: ' + this.runtime.exp_per_stamina.round(2) + '">LevelUp Running Now!</span>');
		} else {
			Dashboard.status(this, '<span title="Exp Possible: ' + this.runtime.exp_possible + ', per Energy: ' + this.runtime.exp_per_energy.round(2) + ', per Stamina: ' + this.runtime.exp_per_stamina.round(2) + '">' + d.format('l g:i a') + ' (at ' + addCommas(this.get('exp_average').round(1)) + ' exp per hour)</span>');
		}
	} else {
		Dashboard.status(this);
	}
}

LevelUp.work = function(state) {
	var i, runtime = this.runtime, general, energy = Player.get('energy'), stamina = Player.get('stamina');
	if (runtime.running && this.option.income) {
		if (Queue.get('runtime.current') === Income) {
			Generals.set('runtime.disabled', false);
		}
	}
	if (runtime.old_quest) {
		Quest.runtime.best = runtime.old_quest;
		Quest.runtime.energy = runtime.old_quest_energy;
		runtime.old_quest = null;
		runtime.old_quest_energy = 0;
	}
	if (!this.option.enabled || runtime.exp_possible < Player.get('exp_needed')) {
		if (runtime.running && runtime.level < Player.get('level')) { // We've just levelled up
			if ($('#app'+APPID+'_energy_current_value').next().css('color') === 'rgb(25, 123, 48)' &&  energy >= Player.get('maxenergy')) {
				Queue.burn.energy = energy;
				Queue.burn.stamina = 0;
				return false;
			}
			if ($('#app'+APPID+'_stamina_current_value').next().css('color') === 'rgb(25, 123, 48)' &&  stamina >= Player.get('maxstamina')) {
				Queue.burn.energy = 0;
				Queue.burn.stamina = stamina;
				return false;
			}
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
//			debug('running '+runtime.running);
		} else if (runtime.running && runtime.level == Player.get('level')) { //We've gotten less exp per stamina than we hoped and can't reach the next level.
			Generals.set('runtime.disabled', false);
			Queue.burn.stamina = Math.max(0, stamina - Queue.get('option.stamina'));
			Queue.burn.energy = Math.max(0, energy - Queue.get('option.energy'));
			Battle.set('option.monster', runtime.battle_monster);
			runtime.running = false;
//			debug('Running '+runtime.running);
		}
		return false;
	}
	if (state && runtime.heal_me) {
		if (Heal.me()) {
			return true;
		}
		runtime.heal_me = false;
	}
	if (!runtime.running || state) { // We're not running yet, or we have focus
		runtime.level = Player.get('level');
		runtime.battle_monster = Battle.get('option.monster');
		runtime.running = true;
//		debug('Running '+runtime.running);
		Battle.set('option.monster', false);
	}
	general = Generals.best(this.option.general); // Get our level up general
	if (general && general !== 'any' && Player.get('exp_needed') < 100) { // If we want to change...
		Generals.set('runtime.disabled', false);	// make sure changing Generals is not disabled
		if (general === Player.get('general') || Generals.to(general)) { // ...then change if needed
//			debug('Disabling Generals because we are within 25 XP from leveling.');
			Generals.set('runtime.disabled', true);	// and lock the General se we can level up.
		} else {
			return true;	// Try to change generals again
		}
	}
	// We don't have focus, but we do want to level up quicker
    if (this.option.order !== 'Stamina' || !stamina || (stamina < 5 && Battle.option.monster && !Battle.option.points)){
        debug('Running Energy Burn');
	if (Player.get('energy')) { // Only way to burn energy is to do quests - energy first as it won't cost us anything
		runtime.old_quest = Quest.runtime.best;
		runtime.old_quest_energy = Quest.runtime.energy;
		Queue.burn.energy = energy;
		Queue.burn.stamina = 0;
		Quest.runtime.best = runtime.quests[Math.min(runtime.energy, runtime.quests.length-1)][1][0]; // Access directly as Quest.set() would force a Quest.update and overwrite this again
		Quest.runtime.energy = energy; // Ok, we're lying, but it works...
		return false;
	}}
        else
            {debug('Running Stamina Burn');}
    
	Quest._update('data'); // Force Quest to decide it's best quest again...
	// Got to have stamina left to get here, so burn it all
	if (runtime.level === Player.get('level') && Player.get('health') < 13 && stamina) { // If we're still trying to level up and we don't have enough health and we have stamina to burn then heal us up...
		runtime.heal_me = true;
		return true;
	}
	Queue.burn.energy = 0; // Will be 0 anyway, but better safe than sorry
	Queue.burn.stamina = stamina; // Make sure we can burn everything, even the stuff we're saving
	return false;
};

LevelUp.get = function(what) {
	var now = Date.now();
	switch(what) {
		case 'timer':		return makeTimer(this.get('level_timer'));
		case 'time':		return (new Date(this.get('level_time'))).format('l g:i a');
		case 'level_timer':	return Math.floor((this.get('level_time') - now) / 1000);
		case 'level_time':	return now + Math.floor(3600000 * ((Player.get('exp_needed') - this.runtime.exp_possible) / (this.get('exp_average') || 10)));
		case 'exp_average':
			if (this.option.algorithm == 'Per Hour') {
				return History.get('exp.average.change');
			} else {
				return (12 * (this.runtime.exp_per_stamina + this.runtime.exp_per_energy));
			}
		default: return this._get(what);
	}
}/********** Worker.Monster **********
 * Automates Monster
 */
var Monster = new Worker('Monster');
Monster.data = {};

Monster.settings = {
    stateful:true
};

Monster.defaults = {
    castle_age:{
        pages:'keep_monster keep_monster_active keep_monster_active2 battle_raid'
    }
};

Monster.option = {
    fortify: 30,
    //	quest_over: 90,
    min_to_attack: 0,
    //	dispel: 50,
    fortify_active:false,
    choice: 'Any',
    ignore_stats:true,
    stop: 'Never',
    own: true,
    armyratio: 1,
    levelratio: 'Any',
    force1: true,
    raid: 'Invade x5',
    assist: true,
    maxstamina: 5,
    minstamina: 5,
    maxenergy: 10,
    minenergy: 10,
    monster_check:'Hourly',
    check_interval:3600000,
    avoid_behind:false,
    avoid_hours:5,
    behind_override:false
};

Monster.runtime = {
    check:false, // got monster pages to visit and parse
    uid:null,
    type:null,
    fortify:false, // true if we can fortify / defend / etc
    attack:false, // true to attack
    stamina:5, // stamina to burn
    health:10 // minimum health to attack
};

Monster.display = [
{
    title:'Fortification'
},{
    id:'fortify',
    label:'Fortify Below (AB)',
    text:30,
    help:'Fortify if ATT BONUS is under this value. Range of -50% to +50%.',
    after:'%'
},{
    /*	id:'quest_over',
	label:'Quest if Over',
	text:90,
	after:'%'
},{*/
    id:'min_to_attack',
    label:'Attack Over (AB)',
	text:1,
    help:'Attack if ATT BONUS is over this value. Range of -50% to +50%.',
    after:'%'
},{	
    id:'fortify_active',
    label:'Fortify Active',
    checkbox:true,
    help:'Must be checked to fortify.'
},{
    title:'Who To Fight'
},{
    advanced:true,
    id:'ignore_stats',
    label:'Ignore Player Stats',
    checkbox:true,
    help:'Do not use the current health or stamina as criteria for choosing monsters.'
},{
    id:'choice',
    label:'Attack',
    select:['Any', 'Strongest', 'Weakest', 'Shortest ETD', 'Longest ETD', 'Spread', 'Max Damage', 'Mim Damage','ETD Maintain']
},{
    id:'stop',
    label:'Stop',
    select:['Never', 'Achievement', 'Loot'],
    help:'Select when to stop attacking a target.'
},{
    id:'maxstamina',
    label:'Max Stamina Cost',
    select:[1,5,10,20,50],
    help:'Select the maximum stamina for a single attack'
},{
    id:'minstamina',
    label:'Min Stamina Cost',
    select:[1,5,10,20,50],
    help:'Select the minimum stamina for a single attack'
},{
    id:'maxenergy',
    label:'Max Energy Cost',
    select:[10,20,40,100],
    help:'Select the maximum energy for a single energy action'
},{
    id:'minenergy',
    label:'Min Energy Cost',
    select:[10,20,40,100],
    help:'Select the minimum energy for a single energy action'
},{
    advanced:true,
    id:'own',
    label:'Never stop on Your Monsters',
    checkbox:true,
    help:'Never stop attacking your own summoned monsters (Ignores Stop option).'
},{
    advanced:true,
    id:'avoid_behind',
    label:'Avoid Upside-Down Monsters',
    checkbox:true,
    help:'Avoid Monsters that behind in ETD as compared to CA Timer.'
},{
    advanced:true,
    id:'avoid_hours',
    label:'Upside-Down Hours',
    text:true,
    help:'# of Hours Monster must be behind before preventing attacks.'
},{
    advanced:true,
    id:'behind_override',
    label:'Stop Override',
    checkbox:true,
    help:'Continue attacking monsters that meet Stop option but are upside-down (Kill In greater than Time Left). Attempts to bring Kill In below Time Left if damage is at or above Stop Option. Works in coordination with Avoid Upside-Down Monsters)'
},{
    title:'Raids'
},{
    id:'raid',
    label:'Raid',
    select:['Invade', 'Invade x5', 'Duel', 'Duel x5']
},{
    id:'armyratio',
    label:'Target Army Ratio<br>(Only needed for Invade)',
    select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
    help:'Smaller number for smaller target army. Reduce this number if you\'re losing in Invade'
},{
    id:'levelratio',
    label:'Target Level Ratio<br>(Mainly used for Duel)',
    select:['Any', 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5],
    help:'Smaller number for lower target level. Reduce this number if you\'re losing a lot'
},{
    id:'force1',
    label:'Force +1',
    checkbox:true,
    help:'Force the first player in the list to aid.'
},{
    title:'Siege Assist Options'
},{
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
    id:'monster_check',
    label:'Monster Review',
    select:['Quarterly','1/2 Hour','Hourly','2 Hours','6 Hours','12 Hours','Daily','Weekly'],
    help:'Sets how ofter to check Monster Stats.'
}
];

Monster.types = {
    // Special (level 5) - not under Monster tab
    //	kull: {
    //		name:'Kull, the Orc Captain',
    //		timer:259200 // 72 hours
    //	},
    // Raid

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
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    gildamesh: {
        name:'Gildamesh, the Orc King',
        list:'orc_boss_list.jpg',
        image:'orc_boss.jpg',
        dead:'orc_boss_dead.jpg',
        achievement:15000,
        timer:259200, // 72 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    keira: {
        name:'Keira the Dread Knight',
        list:'boss_keira_list.jpg',
        image:'boss_keira.jpg',
        dead:'boss_keira_dead.jpg',
        achievement:30000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    lotus: {
        name:'Lotus Ravenmoore',
        list:'boss_lotus_list.jpg',
        image:'boss_lotus.jpg',
        dead:'boss_lotus_big_dead.jpg',
        achievement:500000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    mephistopheles: {
        name:'Mephistopheles',
        list:'boss_mephistopheles_list.jpg',
        image:'boss_mephistopheles_large.jpg',
        dead:'boss_mephistopheles_dead.jpg',
        achievement:100000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    skaar: {
        name:'Skaar Deathrune',
        list:'death_list.jpg',
        image:'death_large.jpg',
        dead:'death_dead.jpg',
        achievement:1000000,
        timer:345000, // 95 hours, 50 minutes
        mpool:1,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="dispel"]',
        defends:[10,20,40,100]
    },
    sylvanus: {
        name:'Sylvana the Sorceress Queen',
        list:'boss_sylvanus_list.jpg',
        image:'boss_sylvanus_large.jpg',
        dead:'boss_sylvanus_dead.jpg',
        achievement:50000,
        timer:172800, // 48 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
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
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_frost: {
        name:'Frost Dragon',
        list:'dragon_list_blue.jpg',
        image:'dragon_monster_blue.jpg',
        dead:'dead_dragon_image_blue.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_gold: {
        name:'Gold Dragon',
        list:'dragon_list_yellow.jpg',
        image:'dragon_monster_gold.jpg',
        dead:'dead_dragon_image_gold.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    dragon_red: {
        name:'Ancient Red Dragon',
        list:'dragon_list_red.jpg',
        image:'dragon_monster_red.jpg',
        dead:'dead_dragon_image_red.jpg',
        achievement:100000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5]
    },
    serpent_amethyst: { // DEAD image Verified and enabled.
        name:'Amethyst Sea Serpent',
        list:'seamonster_list_purple.jpg',
        image:'seamonster_purple.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_amethyst.jpg',
        achievement:250000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_ancient: { // DEAD image Verified and enabled.
        name:'Ancient Sea Serpent',
        list:'seamonster_list_red.jpg',
        image:'seamonster_red.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_ancient.jpg',
        achievement:250000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_emerald: { // DEAD image Verified and enabled.
        name:'Emerald Sea Serpent',
        list:'seamonster_list_green.jpg',
        image:'seamonster_green.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_emerald.jpg', //Guesswork. Needs verify.
        achievement:250000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
    },
    serpent_sapphire: { // DEAD image guesswork based on others and enabled.
        name:'Sapphire Sea Serpent',
        list:'seamonster_list_blue.jpg',
        image:'seamonster_blue.jpg',
        dead:'seamonster_dead.jpg',
        title:'seamonster_title_sapphire.jpg',
        achievement:250000,
        timer:259200, // 72 hours
        mpool:2,
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5],
        def_btn:'input[name="Defend against Monster"]',
        defends:[10]
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
        atk_btn:'input[name="Attack Dragon"]',
        attacks:[1,5,10,20,50]
    },
    legion: {
        name:'Battle of the Dark Legion',
        list:'castle_siege_list.jpg',
        image:'castle_siege_large.jpg',
        dead:'castle_siege_dead.jpg',
        achievement:1000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="fortify"]',
        defends:[10,20,40,100],
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
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="fortify"]',
        defends:[10,20,40,100]
    },
    ragnarok: {
        name:'Ragnarok, The Ice Elemental',
        list:'water_list.jpg',
        image:'water_large.jpg',
        dead:'water_dead.jpg',
        achievement:1000000,
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="attack"]',
        attacks:[1,5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="dispel"]',
        defends:[10,20,40,100]
    },
    bahamut: {
        name:'Bahamut, the Volcanic Dragon',
        list:'nm_volcanic_list.jpg',
        image:'nm_volcanic_large.jpg',
        dead:'nm_volcanic_dead.jpg',
        achievement:1000000, // Guesswork
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
        attacks:[5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
        defends:[10,20,40,100]
    },
    alpha_bahamut: {
        name:'Alpha Bahamut, the Volcanic Dragon',
        list:'nm_volcanic_list_2.jpg',
        image:'nm_volcanic_large_2.jpg',
        dead:'nm_volcanic_dead_2.jpg', //Guesswork
        achievement:2000000, // Guesswork
        timer:604800, // 168 hours
        mpool:3,
        atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
        attacks:[5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
        defends:[10,20,40,100]
    },
    azriel: {
        name:'Azriel, the Angel of Wrath',
        list:'nm_azriel_list.jpg',
        image:'nm_azriel_large2.jpg',
        dead:'nm_azriel_dead.jpg', //Guesswork
        achievement:2000000, // Guesswork
        timer:604800, // 168 hours
        mpool:1,
        atk_btn:'input[name="Attack Dragon"][src*="stab"],input[name="Attack Dragon"][src*="bolt"],input[name="Attack Dragon"][src*="smite"],input[name="Attack Dragon"][src*="bash"]',
        attacks:[5,10,20,50],
        def_btn:'input[name="Attack Dragon"][src*="cripple"],input[name="Attack Dragon"][src*="deflect"],input[name="Attack Dragon"][src*="heal"],input[name="Attack Dragon"][src*="strengthen"]',
        defends:[10,20,40,100]
    }
};

Monster.health_img = ['img[src$="nm_red.jpg"]', 'img[src$="monster_health_background.jpg"]'];
Monster.shield_img = ['img[src$="bar_dispel.gif"]'];
Monster.defense_img = ['img[src$="nm_green.jpg"]', 'img[src$="seamonster_ship_health.jpg"]'];
Monster.secondary_img = ['img[src$="nm_stun_bar.gif"]'];
Monster.class_img = ['div[style*="nm_bottom"] img[src$="nm_class_warrior.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_cleric.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_rogue.jpg"]', 'div[style*="nm_bottom"] img[src$="nm_class_mage.jpg"]'];
Monster.class_name = ['Warrior', 'Cleric', 'Rogue', 'Mage'];
Monster.class_off = ['', '', 'img[src$="nm_s_off_cripple.gif"]', 'img[src$="nm_s_off_deflect.gif"]'];

Monster.init = function() {
    var i, j;
    this.runtime.count = 0;
    for (i in this.data) {
        for (j in this.data[i]) {
            if (this.data[i][j].state === 'engage') {
                this.runtime.count++;
            }
            if (typeof this.data[i][j].ignore === 'unknown'){
                this.data[i][j].ignore = false;
            }
            if (typeof this.data[i][j].dispel !== 'undefined') {
                this.data[i][j].defense = 100 - this.data[i][j].dispel;
                delete this.data[i][j].dispel;
            }
        }
    }
    this._watch(Player);
    $('#golem-dashboard-Monster tbody td a').live('click', function(event){
        var url = $(this).attr('href');
        Page.to((url.indexOf('raid') > 0 ? 'battle_raid' : 'keep_monster'), url.substr(url.indexOf('?')));
        return false;
    });
}

Monster.parse = function(change) {
    var i, j, k, new_id, id_list = [], battle_list = Battle.get('user'), uid, type, tmp, $health, $defense, $dispel, $secondary, dead = false, monster, timer;
    var data = Monster.data, types = Monster.types;	//Is there a better way?  "this." doesn't seem to work.
    if (Page.page === 'keep_monster_active' || Page.page === 'keep_monster_active2') { // In a monster or raid
        uid = $('img[linked][size="square"]').attr('uid');
        for (i in types) {
            if (types[i].dead && $('img[src$="'+types[i].dead+'"]').length  && !types[i].title) {
                //debug('Found a dead '+i);
                type = i;
                timer = types[i].timer;
                dead = true;
            } else if (types[i].dead && $('img[src$="'+types[i].dead+'"]').length && types[i].title && $('div[style*="'+types[i].title+'"]').length){
                //debug('Found a dead '+i);
                type = i;
                timer = types[i].timer;
                dead = true;
            } else if (types[i].image && ($('img[src$="'+types[i].image+'"]').length || $('div[style*="'+types[i].image+'"]').length)) {
                //debug('Parsing '+i);
                type = i;
                timer = types[i].timer;
            } else if (types[i].image2 && ($('img[src$="'+types[i].image2+'"]').length || $('div[style*="'+types[i].image2+'"]').length)) {
                //debug('Parsing second stage '+i);
                type = i;
                timer = types[i].timer2 || types[i].timer;
            }
        }
        if (!uid || !type) {
            debug('Unknown monster (probably dead)');
            return false;
        }
        data[uid] = data[uid] || {};
        data[uid][type] = data[uid][type] || {};
        monster = data[uid][type];
        monster.last = Date.now();
        if ($('input[src*="collect_reward_button.jpg"]').length) {
            monster.state = 'reward';
            return false;
        }
        if (dead && monster.state === 'assist') {
            monster.state = null;
        } else if (dead && monster.state === 'engage') {
            monster.state = 'reward';
        } else {
            if (!monster.state && $('span.result_body').text().match(/for your help in summoning|You have already assisted on this objective|You don't have enough stamina assist in summoning/i)) {
                if ($('span.result_body').text().match(/for your help in summoning/i)) {
                    monster.assist = Date.now();
                }
                monster.state = 'assist';
            }
            if ($('img[src$="battle_victory.gif"],img[src$="battle_defeat.gif"],span["result_body"] a:contains("Attack Again")').length)	{ //	img[src$="icon_weapon.gif"],
                monster.battle_count = (monster.battle_count || 0) + 1;
            //debug('Setting battle count to ' + monster.battle_count);
            }
            if ($('img[src$="battle_victory"]').length){
                History.add('raid+win',1);
            }
            if ($('img[src$="battle_defeat"]').length){
                History.add('raid+loss',-1);
            }
            if (!monster.name) {
                tmp = $('img[linked][size="square"]').parent().parent().next().text().trim().replace(/[\s\n\r]{2,}/g, ' ');
                //				monster.name = tmp.substr(0, tmp.length - Monster.types[type].name.length - 3);
                monster.name = tmp.regex(/(.+)'s /i);
            }
            // Need to also parse what our class is for Bahamut.  (Can probably just look for the strengthen button to find warrior class.)
            for (i in Monster['class_img']){
                if ($(Monster['class_img'][i]).length){
                    monster.mclass = i;
                //debug('Monster class : '+Monster['class_name'][i]);
                }
            }
            if (monster.mclass > 1){	// If we are a Rogue or Mage
                // Attempt to check if we are in the wrong phase
                if ($(Monster['class_off'][monster.mclass]).length === 0){
                    for(i in Monster['secondary_img']) {
                        $secondary = $(Monster['secondary_img'][i]);
                        if ($secondary.length) {
                            monster.secondary = (100 * $secondary.width() / $secondary.parent().width());
                            //debug(Monster['class_name'][monster.mclass]+" phase. Bar at "+monster.secondary+"%");
                            break;
                        }
                    }
                }
                else {
            //debug("We aren't in "+Monster['class_name'][monster.mclass]+" phase. Skip fortify.");
            }
            }
            for (i in Monster['health_img']){
                if ($(Monster['health_img'][i]).length){
                    $health = $(Monster['health_img'][i]).parent();
                    monster.health = $health.length ? (100 * $health.width() / $health.parent().width()) : 0;
                    break;
                }
            }
            for (i in Monster['shield_img']){
                if ($(Monster['shield_img'][i]).length){
                    $dispel = $(Monster['shield_img'][i]).parent();
                    monster.defense = 100 * (1 - ($dispel.width() / ($dispel.next().length ? $dispel.width() + $dispel.next().width() : $dispel.parent().width())));
                    monster.attackbonus = (monster.defense * (isNumber(monster.strength) ? (monster.strength/100) : 1)) - 50;
                    break;
                }
            }
            for (i in Monster['defense_img']){
                if ($(Monster['defense_img'][i]).length){
                    $defense = $(Monster['defense_img'][i]).parent();
                    monster.defense = ($defense.width() / ($defense.next().length ? $defense.width() + $defense.next().width() : $defense.parent().width()) * 100);
                    if ($defense.parent().width() < $defense.parent().parent().width()){
                        monster.strength = 100 * $defense.parent().width() / $defense.parent().parent().width();
                    } else {
                        monster.strength = 100;
                    }
                    monster.attackbonus = (monster.defense * (isNumber(monster.strength) ? (monster.strength/100) : 1)) - 50;
                    break;
                }
            }
            monster.timer = $('#app'+APPID+'_monsterTicker').text().parseTimer();
            monster.finish = Date.now() + (monster.timer * 1000);
            monster.damage_total = 0;
            monster.damage_siege = 0;
            monster.damage_players = 0;
            monster.fortify = 0;
            monster.damage = {};
            $('img[src*="siege_small"]').each(function(i,el){
                var siege = $(el).parent().next().next().next().children().eq(0).text();
                var tmp = $(el).parent().next().next().next().children().eq(1).text().replace(/[^0-9]/g,'');
                var dmg = tmp.regex(/([0-9]+)/);
                //debug('Monster Siege',siege + ' did ' + addCommas(dmg) + ' amount of damage.');
                monster.damage[siege]  = [dmg];
                monster.damage_siege += dmg;
            });
            $('td.dragonContainer table table a[href^="http://apps.facebook.com/castle_age/keep.php?user="]').each(function(i,el){
                var user = $(el).attr('href').regex(/user=([0-9]+)/i);
                var tmp = null;
                if (types[type].raid){
                    tmp = $(el).parent().next().text().replace(/[^0-9\/]/g,'');
                } else {
                    tmp = $(el).parent().parent().next().text().replace(/[^0-9\/]/g,'');
                }
                var dmg = tmp.regex(/([0-9]+)/), fort = tmp.regex(/\/([0-9]+)/);
                monster.damage[user]  = (fort ? [dmg, fort] : [dmg]);
                if (user === userID){
                    if (monster.battle_count && monster.damage_user){
                        monster.damage_avg = Math.ceil(monster.damage_user / monster.battle_count);
                    //debug('Monster Damage','(1) Setting Avg Damage to ' + monster.damage_avg);
                    } else {
                        monster.damage_avg = monster.damage_user;
                    //debug('Monster Damage','(2) Setting Avg Damage to ' + monster.damage_avg);
                    }
                    if ((monster.damage_avg > ((dmg - monster.damage_user) * 1.3)  || monster.damage_avg < ((dmg - monster.damage_user) * 1.3) )&& dmg !== monster.damage_user){
                        //debug('Monster Damage','Last Attack was ' + (dmg - monster.damage_user));
                        monster.damage_avg = Math.ceil(((dmg - monster.damage_user) + monster.damage_avg) /2);
                    //debug('Monster Damage','(3) Setting Avg Damage to ' + monster.damage_avg);
                    }
                    
                    monster.damage_user = dmg;
                    while (monster.damage_avg * monster.battle_count < monster.damage_user){
                        //debug('Monster Damage','Battle count was ' + monster.battle_count);
                        monster.battle_count++;
                    //debug('Monster Damage','Setting battle count to ' + monster.battle_count);
                    }
                    while (monster.damage_avg * monster.battle_count > monster.damage_user * 1.2){
                        //debug('Monster Damage','Battle count was ' + monster.battle_count);
                        monster.battle_count--;
                    //debug('Monster Damage','Setting battle count to ' + monster.battle_count);
                    }
                }
                monster.damage_players += dmg;
                if (fort) {
                    monster.fortify += fort;
                }
            });
            if(types[type].orcs) {
                monster.damage_total = Math.ceil(monster.damage_siege / 1000) + monster.damage_players
            } else {
                monster.damage_total = monster.damage_siege + monster.damage_players;
            }
            monster.dps = monster.damage_players / (timer - monster.timer);
            if (types[type].raid) {
                monster.total = monster.damage_total + $('div[style*="monster_health_back.jpg"] div:nth-child(2)').text().regex(/([0-9]+)/);
            } else {
                monster.total = Math.ceil((1 + 100 * monster.damage_total) / (monster.health == 100 ? 0.1 : (100 - monster.health)));
            }
            monster.eta = Date.now() + (Math.floor((monster.total - monster.damage_total) / monster.dps) * 1000);
        }
    } else if (Page.page === 'keep_monster' || Page.page === 'battle_raid') { // Check monster / raid list
        if (!$('#app'+APPID+'_app_body div.imgButton').length) {
            return false;
        }
        if (Page.page === 'battle_raid') {
            raid = true;
        }
        for (uid in data) {
            for (type in data[uid]) {
                if (((Page.page === 'battle_raid' && this.types[type].raid) || (Page.page === 'keep_monster' && !this.types[type].raid)) && (data[uid][type].state === 'complete' || (data[uid][type].state === 'assist' && data[uid][type].finish < Date.now()))) {
                    data[uid][type].state = null;
                }
            }
        }
        $('#app'+APPID+'_app_body div.imgButton').each(function(i,el){
            var i, uid = $('a', el).attr('href').regex(/user=([0-9]+)/i), tmp = $(el).parent().parent().children().eq(1).html().regex(/graphics\/([^.]*\....)/i), type = 'unknown';
            for (i in types) {
                if (tmp == types[i].list) {
                    type = i;
                    break;
                }
            }
            if (!uid || type === 'unknown') {
                return;
            }
            data[uid] = data[uid] || {};
            data[uid][type] = data[uid][type] || {};
            if (uid === userID) {
                data[uid][type].name = 'You';
            } else {
                tmp = $(el).parent().parent().children().eq(2).text().trim();
                data[uid][type].name = tmp.regex(/(.+)'s /i);
            }
            switch($('img', el).attr('src').regex(/dragon_list_btn_([0-9])/)) {
                case 2:
                    data[uid][type].state = 'reward';
                    break;
                case 3:
                    data[uid][type].state = 'engage';
                    break;
                case 4:
                    //if (this.types[type].raid && data[uid][type].health) {
                    //data[uid][type].state = 'engage'; // Fix for page cache issues in 2-part raids
                    //} else {
                    data[uid][type].state = 'complete';
                    //}
                    break;
                default:
                    data[uid][type].state = 'unknown';
                    break; // Should probably delete, but keep it on the list...
            }
        });
    }
    return false;
};

Monster.update = function(what) {
    var i, j, list = [], uid = this.runtime.uid, type = this.runtime.type, best = null, req_stamina, req_health
    this.runtime.count = 0;
    for (i in this.data) { // Flush unknown monsters
        for (j in this.data[i]) {
            if (!this.data[i][j].state || this.data[i][j].state === null) {
                log('Found Invalid Monster State=(' + this.data[i][j].state + ')');
                delete this.data[i][j];
            } else if (this.data[i][j].state === 'engage') {
                this.runtime.count++;
            }
        }
        if (!length(this.data[i])) { // Delete uid's without an active monster
            log('Found Invalid Monster ID=(' + this.data[i] + ')');
            delete this.data[i];
        }
    }
    if (!uid || !type || !this.data[uid] || !this.data[uid][type] || (this.data[uid][type].state !== 'engage' && this.data[uid][type].state !== 'assist')) { // If we've not got a valid target...
        this.runtime.uid = uid = null;
        this.runtime.type = type = null;
    }
    // Testing this out
    uid = null;
    type = null;
	
    //this.runtime.check = false;
    switch (this.option.monster_check){
        case 'Quarterly':
            if (this.option.check_interval !== 900000){
                this.option.check_interval = 900000;
            }
            break;
        case '1/2 Hour':
            if (this.option.check_interval !== 1800000){
                this.option.check_interval = 1800000;
            }
            break;
        case 'Hourly':
            if (this.option.check_interval !== 3600000){
                this.option.check_interval = 3600000;
            }
            break;
        case '2 Hours':
            if (this.option.check_interval !== 7200000){
                this.option.check_interval = 7200000;
            }
            break;
        case '6 Hours':
            if (this.option.check_interval !== 21600000){
                this.option.check_interval = 21600000;
            }
            break;
        case '12 Hours':
            if (this.option.check_interval !== 43200000){
                this.option.check_interval = 43200000;
            }
            break;
        case 'Daily':
            if (this.option.check_interval !== 86400000){
                this.option.check_interval = 86400000;
            }
            break;
        case 'Weekly':
            if (this.option.check_interval !== 604800000){
                this.option.check_interval = 604800000;
            }
            break;
    }
    for (i in this.data) {
        // Look for a new target...
        for (j in this.data[i]) {
            if (((!this.data[i][j].health && this.data[i][j].state === 'engage') || typeof this.data[i][j].last === 'undefined' || (this.data[i][j].last < (Date.now() - this.option.check_interval))) && (typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore && this.data[i][j].state !== 'complete') && !this.runtime.check) {
                // Check monster progress every hour
                this.runtime.check = true; // Do we need to parse info from a blank monster?
                break;
            }
            req_stamina = (this.types[j].raid && this.option.raid.search('x5') == -1) ? 1 : (this.types[j].raid) ? 5 : (this.option.minstamina < Math.min.apply( Math, this.types[j].attacks) || this.option.maxstamina < Math.min.apply( Math, this.types[j].attacks)) ? Math.min.apply( Math, this.types[j].attacks): (this.option.minstamina > Math.max.apply( Math, this.types[j].attacks)) ? Math.max.apply( Math, this.types[j].attacks) : (this.option.minstamina > this.option.maxstamina) ? this.option.maxstamina : this.option.minstamina;
            req_energy = this.types[j].def_btn ? this.option.minenergy : null;
            req_health = this.types[j].raid ? 13 : 10; // Don't want to die when attacking a raid
            if ((typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore) && this.data[i][j].state === 'engage' && this.data[i][j].finish > Date.now() && (this.option.ignore_stats || Player.get('health') >= req_health) && ((Queue.burn.energy >= req_energy) || ((this.option.ignore_stats || Queue.burn.stamina >= req_stamina) && (typeof this.data[i][j].attackbonus === 'undefined' || this.data[i][j].attackbonus >= this.option.min_to_attack)))) {
                if (!this.data[i][j].battle_count){
                    this.data[i][j].battle_count = 0;
                }
                if (this.data[i][j].name === 'You' && this.option.own){
                    list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                    break;
                } else if (this.option.behind_override && (this.data[i][j].eta >= this.data[i][j].finish) && sum(this.data[i][j].damage[userID]) > this.types[j].achievement){
                    //debug('Adding behind monster. ' + this.data[i][j].name + '\'s ' + this.types[j].name);
                    list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                    break;
                } else {
                    switch(this.option.stop) {
                        default:
                        case 'Never':
                            list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            break;
                        case 'Achievement':
                            if (isNumber(this.types[j].achievement) && (typeof this.data[i][j].damage[userID] === 'undefined' || sum(this.data[i][j].damage[userID]) < this.types[j].achievement)) {
                                list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            }
                            break;
                        case 'Loot':
                            if (isNumber(this.types[j].achievement) && (typeof this.data[i][j].damage[userID] === 'undefined' || sum(this.data[i][j].damage[userID]) < ((i == userID && j === 'keira') ? 200000 : 2 * this.types[j].achievement))) {
                                // Special case for your own Keira to get her soul.
                                list.push([i, j, this.data[i][j].health, this.data[i][j].eta, this.data[i][j].battle_count,((sum(this.data[i][j].damage[userID]) || 0) / this.data[i][j].damage_total * 100).round(4),this.data[i][j].finish,(this.data[i][j].eta - this.data[i][j].finish)/3600000]);
                            }
                            break;
                    }
                }
            }
        }
    }
    if (list.length){
        list.sort( function(a,b){
            switch(Monster.option.choice) {
                case 'Any':
                    return (Math.random()-0.5);
                    break;
                case 'Strongest':
                    return b[2] - a[2];
                    break;
                case 'Weakest':
                    return a[2] - b[2];
                    break;
                case 'Shortest ETD':
                    return a[3] - b[3];
                    break;
                case 'Longest ETD':
                    return b[3] - a[3];
                    break;
                case 'Spread':
                    return a[4] - b[4];
                    break;
                case 'Max Damage':
                    return b[5] - a[5];
                    break;
                case 'Min Damage':
                    return a[5] - b[5];
                    break;
                case 'ETD Maintain':
                    if (a[7] < b[7]){
                        return 1;
                    } else if (a[7] > b[7]){
                        return -1;
                    } else {
                        return 0;
                    }
                    break;
            }
        });    
        if (!this.option.avoid_behind){
            best = list[0];
        } else {
            for (i=0; i <= list.length - 1; i++){
                if (((list[i][3]/3600000) - (list[i][6]/3600000)).round(0) <= this.option.avoid_hours ){
                    best = list[i];
                    break;
                }
            }
        }
    }
    delete list;
    if (best) {
        uid  = best[0];
        type = best[1];
    }

    this.runtime.uid = uid;
    this.runtime.type = type;
    if (uid && type) {        
        this.runtime.stamina = (this.types[type].raid && this.option.raid.search('x5') == -1) ? 1 : (this.types[type].raid) ? 5 : (this.option.minstamina < Math.min.apply( Math, this.types[type].attacks) || this.option.maxstamina < Math.min.apply( Math, this.types[type].attacks)) ? Math.min.apply( Math, this.types[type].attacks): (this.option.minstamina > Math.max.apply( Math, this.types[type].attacks)) ? Math.max.apply( Math, this.types[type].attacks) : (this.option.minstamina > this.option.maxstamina) ? this.option.maxstamina : this.option.minstamina;
        this.runtime.health = this.types[type].raid ? 13 : 10; // Don't want to die when attacking a raid        
        this.runtime.energy = (!this.types[type].defends) ? 10 : (this.option.minenergy < Math.min.apply( Math, this.types[type].defends) || this.option.maxenergy < Math.min.apply( Math, this.types[type].defends)) ? Math.min.apply( Math, this.types[type].defends) : (this.option.minenergy > Math.max.apply( Math, this.types[type].defends)) ? Math.max.apply( Math, this.types[type].defends) : (this.option.minenergy > this.option.maxenergy) ? this.option.maxenergy : this.option.minenergy;
        if(this.option.fortify_active && (typeof this.data[uid][type].mclass === 'undefined' || this.data[uid][type].mclass < 2) && ((typeof this.data[uid][type].attackbonus !== 'undefined' && this.data[uid][type].attackbonus < this.option.fortify && this.data[uid][type].defense < 100))) {
            this.runtime.fortify = true;
        } else if (this.option.fortify_active && typeof this.data[uid][type].mclass !== 'undefined' && this.data[uid][type].mclass > 1 && typeof this.data[uid][type].secondary !== 'undefined' && this.data[uid][type].secondary < 100){
            this.runtime.fortify = true;
        } else {
            this.runtime.fortify = false;
        }
        if (Queue.burn.energy < this.runtime.energy) {
            this.runtime.fortify = false;
        }
        this.runtime.attack = true;        
        if ((Player.get('health') > this.runtime.health) && ((Queue.burn.stamina > this.runtime.stamina) || (this.runtime.fortify && Queue.burn.energy > this.runtime.energy ))){
            Dashboard.status(this, (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (this.runtime.fortify && Queue.burn.energy < this.runtime.energy ){
            Dashboard.status(this,'Waiting for ' + ((LevelUp.runtime.running && LevelUp.option.enabled) ? (this.runtime.energy - Queue.burn.energy) : Math.max(((this.runtime.energy - Queue.burn.energy),(this.runtime.energy + Queue.option.energy - Player.get('energy')),(Queue.option.start_energy - Player.get('energy'))))) + ' energy to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (Queue.burn.stamina < this.runtime.stamina){
            Dashboard.status(this,'Waiting for ' + ((LevelUp.runtime.running && LevelUp.option.enabled) ? (this.runtime.stamina - Queue.burn.stamina) : Math.max((this.runtime.stamina - Queue.burn.stamina),(this.runtime.stamina + Queue.option.stamina - Player.get('stamina')),(Queue.option.start_stamina - Player.get('stamina')))) + ' stamina to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        } else if (Player.get('health') < this.runtime.health){
            Dashboard.status(this,'Waiting for ' + (this.runtime.health - Player.get('health')) + ' health to ' + (this.runtime.fortify ? 'Fortify' : 'Attack') + ' ' + this.data[uid][type].name + '\'s ' + this.types[type].name + ' (Min Stamina = ' + this.runtime.stamina + ' & Min Energy = ' + this.runtime.energy + ')');
        }
    } else {
        this.runtime.attack = false;
        this.runtime.fortify = false;
        Dashboard.status(this, 'Nothing to do.');
    }
};

Monster.work = function(state) {
    var i, j, target_info = [], battle_list, list = [], uid = this.runtime.uid, type = this.runtime.type, btn = null, b, max;

    if (!this.runtime.check && ((!this.runtime.fortify || Queue.burn.energy < this.runtime.energy || Player.get('health') < 10) && (!this.runtime.attack || Queue.burn.stamina < this.runtime.stamina || Player.get('health') < this.runtime.health))) {
        return false;
    }
    if (!state) {
        return true;
    }
    if (this.runtime.check) { // Parse pages of monsters we've not got the info for
        for (i in this.data) {
            for (j in this.data[i]) {
                if (((!this.data[i][j].health && this.data[i][j].state === 'engage') || typeof this.data[i][j].last === 'undefined' || this.data[i][j].last < Date.now() - this.option.check_interval) && (typeof this.data[i][j].ignore === 'undefined' || !this.data[i][j].ignore)) {
                    debug( 'Reviewing ' + this.data[i][j].name + '\'s ' + this.types[j].name)
                    Page.to(this.types[j].raid ? 'battle_raid' : 'keep_monster', '?user=' + i + (this.types[j].mpool ? '&mpool='+this.types[j].mpool : ''));
                    return true;
                }
            }
        }
        this.runtime.check = false;
        debug( 'Finished Monster / Raid review')
        return QUEUE_RELEASE;
    }
    if (this.types[type].raid) { // Raid has different buttons and generals
        if (!Generals.to(Generals.best((this.option.raid.search('Invade') == -1) ? 'raid-duel' : 'raid-invade'))) {
            return true;
        }       
        switch(this.option.raid) {
            case 'Invade':
                btn = $('input[src$="raid_attack_button.gif"]:first');
                break;
            case 'Invade x5':
                btn = $('input[src$="raid_attack_button3.gif"]:first');
                break;
            case 'Duel':
                btn = $('input[src$="raid_attack_button2.gif"]:first');
                break;
            case 'Duel x5':
                btn = $('input[src$="raid_attack_button4.gif"]:first');
                break;
        }
    } else {
        if (this.data[uid][type].button_fail <= 10 || !this.data[uid][type].button_fail){
            //Primary method of finding button.
            j = (this.runtime.fortify && Queue.burn.energy >= this.runtime.energy) ? 'fortify' : 'attack';
           
            if (!Generals.to(Generals.best(j))) {
                return true;
            }
            debug('Try to ' + j + ' [UID=' + uid + ']' + this.data[uid][type].name + '\'s ' + this.types[type].name);
            switch(j){
                case 'fortify':
                    if (!btn && this.option.maxenergy < this.types[type].defends[0]){
                        btn = $(this.types[type].def_btn).eq(0);
                    } else {
                        b = $(this.types[type].def_btn).length - 1;
                        for (i=b; i >= 0; i--){                            
                            //debug('Burn Energy is ' + Queue.burn.energy);
                            if (this.types[type].defends[i] <= this.option.maxenergy && Queue.burn.energy >= this.types[type].defends[i] ){
                                //debug('Button cost is ' + this.types[type].defends[i]);
                                btn = $(this.types[type].def_btn).eq(i);
                                break;
                            }
                        }
                    }
                    break;
                                      
                case 'attack':
                    if (!btn && this.option.maxstamina < Math.min.apply( Math, this.types[type].attacks)){
                        btn = $(this.types[type].atk_btn).eq(0).name;
                    } else {                        
                        b = $(this.types[type].atk_btn).length - 1;
                        //debug('B = ' + b);
                        for (i=b; i >= 0; i--){                           
                            //debug('Burn Stamina is ' + Queue.burn.stamina);
                            if (this.types[type].attacks[i] <= this.option.maxstamina && Queue.burn.stamina >= this.types[type].attacks[i]){
                                //debug('Button cost is ' + this.types[type].attacks[i]);
                                btn = $(this.types[type].atk_btn).eq(i);
                                break;
                            }
                        }
                    }
                    break;
                default:
            }
        }
        if (!btn || !btn.length){
            this.data[uid][type].button_fail = this.data[uid][type].button_fail + 1;
        }
        if (this.data[uid][type].button_fail > 10){
            log('Ignoring Monster ' + this.data[uid][type].name + '\'s ' + this.types[type].name + this.data[uid][type] + ': Unable to locate ' + j + ' button ' + this.data[uid][type].button_fail + ' times!');
            this.data[uid][type].ignore = true;
            this.data[uid][type].button_fail = 0
        }
    }
    if (!btn || !btn.length || (Page.page !== 'keep_monster_active' && Page.page !== 'keep_monster_active2') || ($('div[style*="dragon_title_owner"] img[linked]').attr('uid') != uid && $('div[style*="nm_top"] img[linked]').attr('uid') != uid)) {
        //debug('Reloading page. Button = ' + btn.attr('name'));
        //debug('Reloading page. Page.page = '+ Page.page);
        //debug('Reloading page. Monster Owner UID is ' + $('div[style*="dragon_title_owner"] img[linked]').attr('uid') + ' Expecting UID : ' + uid);
        Page.to('keep_monster');
        Page.to(this.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + (this.types[type].mpool ? '&mpool='+this.types[type].mpool : ''));
        return true; // Reload if we can't find the button or we're on the wrong page
    }
    if (this.option.assist && typeof $('input[name*="help with"]') !== 'undefined' && (typeof this.data[uid][type].phase === 'undefined' || $('input[name*="help with"]').attr('title').regex(/ (.*)/i) !== this.data[uid][type].phase)){
        debug('Current Siege Phase is: '+ this.data[uid][type].phase);
        this.data[uid][type].phase = $('input[name*="help with"]').attr('title').regex(/ (.*)/i);
        debug('Found a new siege phase ('+this.data[uid][type].phase+'), assisting now.');
        Page.to(this.types[type].raid ? 'battle_raid' : 'keep_monster', '?user=' + uid + '&action=doObjective' + (this.types[type].mpool ? '&mpool=' + this.types[type].mpool : '') + '&lka=' + i + '&ref=nf');
        return QUEUE_RELEASE;
    }
    if (this.types[type].raid) {
        battle_list = Battle.get('user')
        if (this.option.force1) { // Grab a list of valid targets from the Battle Worker to substitute into the Raid buttons for +1 raid attacks.
            for (i in battle_list) {
                list.push(i);
            }
            $('input[name*="target_id"]').val((list[Math.floor(Math.random() * (list.length))] || 0)); // Changing the ID for the button we're gonna push.
        }
        target_info = $('div[id*="raid_atk_lst0"] div div').text().regex(/Lvl\s*([0-9]+).*Army: ([0-9]+)/);
        if ((this.option.armyratio !== 'Any' && ((target_info[1]/Player.get('army')) > this.option.armyratio)) || (this.option.levelratio !== 'Any' && ((target_info[0]/Player.get('level')) > this.option.levelratio))){ // Check our target (first player in Raid list) against our criteria - always get this target even with +1
            log('No valid Raid target!');
            Page.to('battle_raid', ''); // Force a page reload to change the targets
            return true;
        }
    }
    this.runtime.uid = this.runtime.type = null; // Force us to choose a new target...
    //debug('Clicking Button ' + btn.attr('name'));
    Page.click(btn);
    this.data[uid][type].button_fail = 0;
    return QUEUE_RELEASE;
};

Monster.order = null;
Monster.dashboard = function(sort, rev) {
    var i, j, o, monster, url, list = [], output = [], sorttype = [null, 'name', 'health', 'defense', null, 'timer', 'eta'], state = {
        engage:0,
        assist:1,
        reward:2,
        complete:3
    }, blank;
    if (typeof sort === 'undefined') {
        this.order = [];
        for (i in this.data) {
            for (j in this.data[i]) {
                this.order.push([i, j]);
            }
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
        var aa, bb;
        if (state[Monster.data[a[0]][a[1]].state] > state[Monster.data[b[0]][b[1]].state]) {
            return 1;
        }
        if (state[Monster.data[a[0]][a[1]].state] < state[Monster.data[b[0]][b[1]].state]) {
            return -1;
        }
        if (typeof sorttype[sort] === 'string') {
            aa = Monster.data[a[0]][a[1]][sorttype[sort]];
            bb = Monster.data[b[0]][b[1]][sorttype[sort]];
        } else if (sort == 4) { // damage
            //			aa = Monster.data[a[0]][a[1]].damage ? Monster.data[a[0]][a[1]].damage[userID] : 0;
            //			bb = Monster.data[b[0]][b[1]].damage ? Monster.data[b[0]][b[1]].damage[userID] : 0;
            if (typeof Monster.data[a[0]][a[1]].damage !== 'undefined' && typeof Monster.data[b[0]][b[1]].total !== 'undefined' ){
                aa = sum((Monster.data[a[0]][a[1]].damage[userID] / Monster.data[a[0]][a[1]].total));
            }
            if (typeof Monster.data[b[0]][b[1]].damage !== 'undefined' && typeof Monster.data[b[0]][b[1]].total !== 'undefined' ){
                bb = sum((Monster.data[b[0]][b[1]].damage[userID] / Monster.data[b[0]][b[1]].total));
            }
        }
        if (typeof aa === 'undefined') {
            return 1;
        } else if (typeof bb === 'undefined') {
            return -1;
        }
        if (typeof aa === 'string' || typeof bb === 'string') {
            return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
        }
        return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
    });
    th(output, '');
    th(output, 'User');
    th(output, 'Health', 'title="(estimated)"');
    th(output, 'Att Bonus', 'title="Composite of Fortification or Dispel into an approximate attack bonus (+50%...-50%)."');
    //	th(output, 'Shield');
    th(output, 'Damage');
    th(output, 'Time Left');
    th(output, 'Kill In (ETD)', 'title="(estimated)"');
    th(output, '');
    list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
    for (o=0; o<this.order.length; o++) {
        i = this.order[o][0];
        j = this.order[o][1];
        if (!this.types[j]) {
            continue;
        }
        output = [];
        monster = this.data[i][j];
        blank = !((monster.state === 'engage' || monster.state === 'assist') && monster.total);
        // http://apps.facebook.com/castle_age/battle_monster.php?user=00000&mpool=3
        // http://apps.facebook.com/castle_age/battle_monster.php?twt2=earth_1&user=00000&action=doObjective&mpool=3&lka=00000&ref=nf
        // http://apps.facebook.com/castle_age/raid.php?user=00000
        // http://apps.facebook.com/castle_age/raid.php?twt2=deathrune_adv&user=00000&action=doObjective&lka=00000&ref=nf
        if (Monster.option.assist_link && (monster.state === 'engage' || monster.state === 'assist')) {
            url = '?user=' + i + '&action=doObjective' + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '') + '&lka=' + i + '&ref=nf';
        } else {
            url = '?user=' + i + (Monster.types[j].mpool ? '&mpool=' + Monster.types[j].mpool : '');
        }
        td(output, '<a href="http://apps.facebook.com/castle_age/' + (Monster.types[j].raid ? 'raid.php' : 'battle_monster.php') + url + '"><img src="' + imagepath + Monster.types[j].list + '" style="width:72px;height:20px; position: relative; left: -8px; opacity:.7;" alt="' + j + '"><strong class="overlay">' + monster.state + '</strong></a>', 'title="' + Monster.types[j].name + '"');
        var image_url = imagepath + Monster.types[j].list;
        //debug(image_url);
        th(output, '<a class="golem-monster-ignore" name="'+i+'+'+j+'" title="Toggle Active/Inactive"'+(Monster.data[i][j].ignore ? ' style="text-decoration: line-through;"' : '')+'>'+Monster.data[i][j].name+'</a>');
        td(output, blank ? '' : monster.health === 100 ? '100%' : addCommas(monster.total - monster.damage_total) + ' (' + monster.health.round(1) + '%)');
        td(output, blank ? '' : isNumber(monster.attackbonus) ? (monster.attackbonus.round(1))+'%' : '', (isNumber(monster.strength) ? 'title="Max: '+((monster.strength-50).round(1))+'%"' : ''));
        td(output, blank ? '' : monster.state !== 'engage' ? '' : (typeof monster.damage[userID] === 'undefined') ? '' : addCommas(monster.damage[userID][0] || 0) + ' (' + ((monster.damage[userID][0] || 0) / monster.total * 100).round(2) + '%)', blank ? '' : 'title="In ' + (monster.battle_count || 'an unknown number of') + ' attacks"');
        td(output, blank ? '' : monster.timer ? '<span class="golem-timer">' + makeTimer((monster.finish - Date.now()) / 1000) + '</span>' : '?');
        td(output, blank ? '' : '<span class="golem-timer">' + (monster.health === 100 ? makeTimer((monster.finish - Date.now()) / 1000) : makeTimer((monster.eta - Date.now()) / 1000)) + '</span>');
        th(output, '<a class="golem-monster-delete" name="'+i+'+'+j+'" title="Delete this Monster from the dashboard">[x]</a>');
        tr(list, output.join(''));
    }
    list.push('</tbody></table>');
    $('#golem-dashboard-Monster').html(list.join(''));
    $('a.golem-monster-delete').live('click', function(event){
        var x = $(this).attr('name').split('+');
        Monster._unflush();
        delete Monster.data[x[0]][x[1]];
        if (!length(Monster.data[x[0]])) {
            delete Monster.data[x[0]];
        }
        Monster.dashboard();
        return false;
    });
    $('a.golem-monster-ignore').live('click', function(event){
        var x = $(this).attr('name').split('+');
        Monster._unflush();
        Monster.data[x[0]][x[1]].ignore = !Monster.data[x[0]][x[1]].ignore;
        Monster.dashboard();
        if (Page.page !== 'keep_monster'){
            Page.to('keep_monster');
        } else {
            Page.to('index');
        }
        return false;
    });
    if (typeof sort !== 'undefined') {
        $('#golem-dashboard-Monster thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
    }
};

/********** Worker.News **********
* Aggregate the news feed
*/
var News = new Worker('News');
News.data = null;
News.option = null;

News.defaults = {
	castle_age:{
		pages:'index'
	}
};

News.runtime = {
	last:0
};

News.parse = function(change) {
	if (change) {
		var xp = 0, bp = 0, win = 0, lose = 0, deaths = 0, cash = 0, i, j, list = [], user = {}, order, last_time = this.runtime.last;
		News.runtime.last = Date.now();
		$('#app'+APPID+'_battleUpdateBox .alertsContainer .alert_content').each(function(i,el) {
			var uid, txt = $(el).text().replace(/,/g, ''), title = $(el).prev().text(), days = title.regex(/([0-9]+) days/i), hours = title.regex(/([0-9]+) hours/i), minutes = title.regex(/([0-9]+) minutes/i), seconds = title.regex(/([0-9]+) seconds/i), time, my_xp = 0, my_bp = 0, my_cash = 0;
			time = Date.now() - ((((((((days || 0) * 24) + (hours || 0)) * 60) + (minutes || 59)) * 60) + (seconds || 59)) * 1000);
			if (txt.regex(/You were killed/i)) {
				deaths++;
			} else {
				uid = $('a:eq(0)', el).attr('href').regex(/user=([0-9]+)/i);
				user[uid] = user[uid] || {name:$('a:eq(0)', el).text(), win:0, lose:0}
				var result = null;
				if (txt.regex(/Victory!/i)) {
					win++;
					user[uid].lose++;
					my_xp = txt.regex(/([0-9]+) experience/i);
					my_bp = txt.regex(/([0-9]+) Battle Points!/i);
					my_cash = txt.regex(/\$([0-9]+)/i);
					result = 'win';
				} else {
					lose++;
					user[uid].win++;
					my_xp = 0 - txt.regex(/([0-9]+) experience/i);
					my_bp = 0 - txt.regex(/([0-9]+) Battle Points!/i);
					my_cash = 0 - txt.regex(/\$([0-9]+)/i);
					result = 'loss';
				}
				if (time > last_time) {
//					debug('Add to History (+battle): exp = '+my_xp+', bp = '+my_bp+', income = '+my_cash);
					time = Math.floor(time / 3600000);
					History.add([time, 'exp+battle'], my_xp);
					History.add([time, 'bp+battle'], my_bp);
					History.add([time, 'income+battle'], my_cash);
					switch (result) {
						case 'win':
							History.add([time, 'battle+win'], 1);
							break;
						case 'loss':
							History.add([time, 'battle+loss'], -1)
							break;
					}
				}
				xp += my_xp;
				bp += my_bp;
				cash += my_cash;
				
			}
		});
		if (win || lose) {
			list.push('You were challenged <strong>' + (win + lose) + '</strong> times, winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
			list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(xp)) + '</span> experience points.');
			list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + addCommas(Math.abs(cash)) + '</b></span>.');
			list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + addCommas(Math.abs(bp)) + '</span> Battle Points.');
			list.push('');
			user = sortObject(user, function(a,b){return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));});
			for (i in user) {
				list.push('<strong title="' + i + '">' + user[i].name + '</strong> ' + (user[i].win ? 'beat you <span class="negative">' + user[i].win + '</span> time' + (user[i].win>1?'s':'') : '') + (user[i].lose ? (user[i].win ? ' and ' : '') + 'was beaten <span class="positive">' + user[i].lose + '</span> time' + (user[i].lose>1?'s':'') : '') + '.');
			}
			if (deaths) {
				list.push('You died ' + (deaths>1 ? deaths+' times' : 'once') + '!');
			}
			$('#app'+APPID+'_battleUpdateBox  .alertsContainer').prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
		}
	}
	return true;
};

/********** Worker.Player **********
* Gets all current stats we can see
*/
var Player = new Worker('Player');
Player.option = null;

Player.settings = {
	keep:true
};

Player.defaults = {
	castle_age:{
		pages:'*'
	}
};

Player.runtime = {
	cash_timeout:null,
	energy_timeout:null,
	health_timeout:null,
	stamina_timeout:null
};

var use_average_level = false;

Player.init = function() {
	// Get the gold timer from within the page - should really remove the "official" one, and write a decent one, but we're about playing and not fixing...
	// gold_increase_ticker(1418, 6317, 3600, 174738470, 'gold', true);
	// function gold_increase_ticker(ticks_left, stat_current, tick_time, increase_value, first_call)
	var when = new Date(script_started + ($('*').html().regex(/gold_increase_ticker\(([0-9]+),/) * 1000));
	this.data.cash_time = when.getSeconds() + (when.getMinutes() * 60);
	this.runtime.cash_timeout = null;
	this.runtime.energy_timeout = null;
	this.runtime.health_timeout = null;
	this.runtime.stamina_timeout = null;
};

Player.parse = function(change) {
	var data = this.data, keep, stats, tmp, energy_used = 0, stamina_used = 0;
	if ($('#app'+APPID+'_energy_current_value').length) {
		tmp = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.energy		= tmp[0] || 0;
//		data.maxenergy	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_health_current_value').length) {
		tmp = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.health		= tmp[0] || 0;
//		data.maxhealth	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_stamina_current_value').length) {
		tmp = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.stamina	= tmp[0] || 0;
//		data.maxstamina	= tmp[1] || 0;
	}
	if ($('#app'+APPID+'_st_2_5 strong:not([title])').length) {
		tmp = $('#app'+APPID+'_st_2_5').text().regex(/([0-9]+)\s*\/\s*([0-9]+)/);
		data.exp		= tmp[0] || 0;
		data.maxexp		= tmp[1] || 0;
	}
	data.cash		= parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10);
	data.level		= $('#app'+APPID+'_st_5').text().regex(/Level: ([0-9]+)!/i);
	data.armymax	= $('a[href*=army.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/);
	data.army		= Math.min(data.armymax, 501); // XXX Need to check what max army is!
	data.upgrade	= ($('a[href*=keep.php]', '#app'+APPID+'_main_bntp').text().regex(/([0-9]+)/) || 0);
	data.general	= $('div.general_name_div3').first().text().trim();
	data.imagepath	= $('#app'+APPID+'_globalContainer img:eq(0)').attr('src').pathpart();
	if (Page.page==='keep_stats') {
		keep = $('div.keep_attribute_section').first(); // Only when it's our own keep and not someone elses
		if (keep.length) {
			data.myname = $('div.keep_stat_title > span', keep).text().regex(/"(.*)"/);
			data.rank = $('td.statsTMainback img[src*=rank_medals]').attr('src').filepart().regex(/([0-9]+)/);
			stats = $('div.attribute_stat_container', keep);
			data.maxenergy = $(stats).eq(0).text().regex(/([0-9]+)/);
			data.maxstamina = $(stats).eq(1).text().regex(/([0-9]+)/);
			data.attack = $(stats).eq(2).text().regex(/([0-9]+)/);
			data.defense = $(stats).eq(3).text().regex(/([0-9]+)/);
			data.maxhealth = $(stats).eq(4).text().regex(/([0-9]+)/);
			data.bank = parseInt($('td.statsTMainback b.money').text().replace(/[^0-9]/g,''), 10);
			stats = $('.statsTB table table:contains("Total Income")').text().replace(/[^0-9$]/g,'').regex(/([0-9]+)\$([0-9]+)\$([0-9]+)/);
			data.maxincome = stats[0];
			data.upkeep = stats[1];
			data.income = stats[2];
		}
	}
	if (Page.page==='town_land') {
		stats = $('.mContTMainback div:last-child');
		data.income = stats.eq(stats.length - 4).text().replace(/[^0-9]/g,'').regex(/([0-9]+)/);
	}
	$('span.result_body').each(function(i,el){
		var txt = $(el).text().replace(/,|\s+|\n/g, '');
		History.add('income', sum(txt.regex(/Gain.*\$([0-9]+).*Cost|stealsGold:\+\$([0-9]+)|Youreceived\$([0-9]+)|Yougained\$([0-9]+)/i)));
		if (txt.regex(/incomepaymentof\$([0-9]+)gold/i)){
			History.set('land', sum(txt.regex(/incomepaymentof\$([0-9]+)gold|backinthemine:Extra([0-9]+)Gold/i)));
		}
	});
	if ($('#app'+APPID+'_energy_time_value').length) {
		window.clearTimeout(this.runtime.energy_timeout);
		this.runtime.energy_timeout = window.setTimeout(function(){Player.get('energy');}, $('#app'+APPID+'_energy_time_value').text().parseTimer() * 1000);
	}
	if ($('#app'+APPID+'_health_time_value').length) {
		window.clearTimeout(this.runtime.health_timeout);
		this.runtime.health_timeout = window.setTimeout(function(){Player.get('health');}, $('#app'+APPID+'_health_time_value').text().parseTimer() * 1000);
	}
	if ($('#app'+APPID+'_stamina_time_value').length) {
		window.clearTimeout(this.runtime.stamina_timeout);
		this.runtime.stamina_timeout = window.setTimeout(function(){Player.get('stamina');}, $('#app'+APPID+'_stamina_time_value').text().parseTimer() * 1000);
	}
	return false;
};

Player.update = function(type) {
	if (type !== 'option') {
		var i, j, types = ['stamina', 'energy', 'health'], list, step;
		for (j=0; j<types.length; j++) {
			list = [];
			step = Divisor(Player.data['max'+types[j]])
			for (i=0; i<=Player.data['max'+types[j]]; i+=step) {
				list.push(i);
			}
			Config.set(types[j], list);
		}
		History.set('bank', this.data.bank);
		History.set('exp', this.data.exp);
	}
	Dashboard.status(this, 'Income: $' + addCommas(Math.max(this.data.income, (History.get('land.average.1') + History.get('income.average.24')).round())) + ' per hour (currently $' + addCommas(History.get('land.average.1')) + ' from land)');
};

Player.get = function(what) {
	var i, j = 0, low = Number.POSITIVE_INFINITY, high = Number.NEGATIVE_INFINITY, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY, data = this.data, now = Date.now();
	switch(what) {
		case 'cash':			return (this.data.cash = parseInt($('strong#app'+APPID+'_gold_current_value').text().replace(/[^0-9]/g, ''), 10));
		case 'cash_timer':		return $('#app'+APPID+'_gold_time_value').text().parseTimer();
//		case 'cash_timer':		var when = new Date();
//								return (3600 + data.cash_time - (when.getSeconds() + (when.getMinutes() * 60))) % 3600;
		case 'energy':			return (this.data.energy = $('#app'+APPID+'_energy_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'energy_timer':	return $('#app'+APPID+'_energy_time_value').text().parseTimer();
		case 'health':			return (this.data.health = $('#app'+APPID+'_health_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'health_timer':	return $('#app'+APPID+'_health_time_value').text().parseTimer();
		case 'stamina':			return (this.data.stamina = $('#app'+APPID+'_stamina_current_value').parent().text().regex(/([0-9]+)\s*\/\s*[0-9]+/));
		case 'stamina_timer':	return $('#app'+APPID+'_stamina_time_value').text().parseTimer();
		case 'exp_needed':		return data.maxexp - data.exp;
		case 'pause':			return (Queue.get('option.pause') ? '(Paused) ' : '');
		default: return this._get(what);
	}
};

/********** Worker.Potions **********
* Automatically drinks potions
*/
var Potions = new Worker('Potions');

Potions.defaults = {
	castle_age:{
		pages:'*'
	}
};

Potions.option = {
	energy:35,
	stamina:35
};

Potions.runtime = {
	drink:false
};

Potions.display = [
	{
		id:'energy',
		label:'Maximum Energy Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,40:40,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	},{
		id:'stamina',
		label:'Maximum Stamina Potions',
		select:{0:0,5:5,10:10,15:15,20:20,25:25,30:30,35:35,40:40,infinite:'&infin;'},
		help:'Will use them when you have to many, if you collect more than 40 they will be lost anyway'
	}
];

Potions.parse = function(change) {
	// No need to parse out Income potions as about to visit the Keep anyway...
	$('.result_body:contains("You have acquired the Energy Potion!")').each(function(i,el){
		Potions.data['Energy'] = (Potions.data['Energy'] || 0) + 1;
	});
	if (Page.page === 'keep_stats') {
		this.data = {}; // Reset potion count completely at the keep
		$('.statsT2:eq(2) .statUnit').each(function(i,el){
			var info = $(el).text().replace(/\s+/g, ' ').trim().regex(/(.*) Potion x ([0-9]+)/i);
			if (info && info[0] && info[1]) {
				Potions.data[info[0]] = info[1];
			}
		});
	}
	return false;
};

Potions.update = function(type) {
	var txt = [], levelup = LevelUp.get('runtime.running');
	this.runtime.drink = false;
	for(var i in this.data) {
		if (this.data[i]) {
			txt.push(i + ': ' + this.data[i] + '/' + this.option[i.toLowerCase()]);
		}
		if (!levelup && typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()] && (Player.get(i.toLowerCase()) || 0) < (Player.get('max' + i.toLowerCase()) || 0)) {
			this.runtime.drink = true;
		}
	}
	Dashboard.status(this, txt.join(', '));
};

Potions.work = function(state) {
	if (!this.runtime.drink) {
		return false;
	}
	if (!state || !Page.to('keep_stats')) {
		return true;
	}
	for(var i in this.data) {
		if (typeof this.option[i.toLowerCase()] === 'number' && this.data[i] > this.option[i.toLowerCase()]) {
			debug('Wanting to drink a ' + i + ' potion');
			Page.click('.statUnit:contains("' + i + '") form .imgButton input');
			break;
		}
	}
	return true;
};

/********** Worker.Quest **********
* Completes quests with a choice of general
*/
// Should also look for quests_quest but that should never be used unless there's a new area
var Quest = new Worker('Quest');

Quest.settings = {
	stateful:true
};

Quest.defaults = {
	castle_age:{
		pages:'quests_quest1 quests_quest2 quests_quest3 quests_quest4 quests_quest5 quests_quest6 quests_quest7 quests_quest8 quests_demiquests quests_atlantis'
	}
};

Quest.option = {
	general:true,
	what:'Influence',
	unique:true,
	monster:true,
	bank:true
};

Quest.runtime = {
	best:null,
	energy:0
};

Quest.land = ['Land of Fire', 'Land of Earth', 'Land of Mist', 'Land of Water', 'Demon Realm', 'Undead Realm', 'Underworld', 'Kingdom of Heaven'];
Quest.area = {quest:'Quests', demiquest:'Demi Quests', atlantis:'Atlantis'};
Quest.current = null;
Quest.display = [
	{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'what',
		label:'Quest for',
		select:'quest_reward',
		help:'Once you have unlocked all areas (Advancement) it will switch to Influence. Once you have 100% Influence it will switch to Experience'
	},{
		id:'unique',
		label:'Get Unique Items First',
		checkbox:true
	},{
		id:'monster',
		label:'Fortify Monsters First',
		checkbox:true
	},{
		id:'bank',
		label:'Automatically Bank',
		checkbox:true
	}
];

Quest.init = function() {
	for (var i in this.data) {
		if (i.indexOf('\t') !== -1) { // Fix bad page loads...
			delete this.data[i];
		}
	}
};

Quest.parse = function(change) {
	var quest = this.data, area = null, land = null, i;
	if (Page.page === 'quests_quest') {
		return false; // This is if we're looking at a page we don't have access to yet...
	} else if (Page.page === 'quests_demiquests') {
		area = 'demiquest';
	} else if (Page.page === 'quests_atlantis') {
		area = 'atlantis';
	} else {
		area = 'quest';
		land = Page.page.regex(/quests_quest([0-9]+)/i) - 1;
	}
	for (i in quest) {
		if (quest[i].area === area && (area !== 'quest' || quest[i].land === land)) {
//			debug('Deleting ' + i + '(' + (Quest.land[quest[i].land] || quest[i].area) + ')');
			delete quest[i];
		}
	}
	if ($('div.quests_background,div.quests_background_sub').length !== $('div.quests_background .quest_progress,div.quests_background_sub .quest_sub_progress').length) {
		Page.to(Page.page, '');// Force a page reload as we're pretty sure it's a bad page load!
		return false;
	}
	$('div.quests_background,div.quests_background_sub,div.quests_background_special').each(function(i,el){
		var name, level, influence, reward, units, energy, tmp, type = 0;
		if ($(el).hasClass('quests_background_sub')) { // Subquest
			name = $('.quest_sub_title', el).text().trim();
			reward = $('.qd_2_sub', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.qd_3_sub', el).text().regex(/([0-9]+)/);
			level = $('.quest_sub_progress', el).text().regex(/LEVEL ([0-9]+)/i);
			influence = $('.quest_sub_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
			type = 2;
		} else {
			name = $('.qd_1 b', el).text().trim();
			reward = $('.qd_2', el).text().replace(/[^0-9$]/g, '').regex(/^([0-9]+)\$([0-9]+)\$([0-9]+)$/);
			energy = $('.quest_req b', el).text().regex(/([0-9]+)/);
			if ($(el).hasClass('quests_background')) { // Main quest
				level = $('.quest_progress', el).text().regex(/LEVEL ([0-9]+)/i);
				influence = $('.quest_progress', el).text().regex(/INFLUENCE: ([0-9]+)%/i);
				type = 1;
			} else { // Special / boss Quest
				type = 3;
			}
		}
		if (!name || name.indexOf('\t') !== -1) { // Hopefully stop it finding broken page load quests
			return;
		}
		quest[name] = {};
		quest[name].area = area;
		quest[name].type = type;
		if (typeof land === 'number') {
			quest[name].land = land;
		}
		if (typeof influence === 'number') {
			quest[name].level = (level || 0);
			quest[name].influence = influence;
		}
		quest[name].exp = reward[0];
		quest[name].reward = (reward[1] + reward[2]) / 2;
		quest[name].energy = energy;
		if (type !== 2) { // That's everything for subquests
			if (type === 3) { // Special / boss quests create unique items
				quest[name].unique = true;
			}
			tmp = $('.qd_1 img', el).last();
			if (tmp.length && tmp.attr('title')) {
				quest[name].item	= tmp.attr('title').trim();
				quest[name].itemimg	= tmp.attr('src').filepart();
			}
			units = {};
			$('.quest_req >div >div >div', el).each(function(i,el){
				var title = $('img', el).attr('title');
				units[title] = $(el).text().regex(/([0-9]+)/);
			});
			if (length(units)) {
				quest[name].units = units;
			}
			tmp = $('.quest_act_gen img', el);
			if (tmp.length && tmp.attr('title')) {
				quest[name].general = tmp.attr('title');
			}
		}
	});
	this.data = sortObject(quest, function(a,b){return a > b;});// So they always appear in the same order
	return false;
};

Quest.update = function(type,worker) {
	if (worker === Town && type !== 'data') {
		return; // Missing quest requirements
	}
	// First let's update the Quest dropdown list(s)...
	var i, unit, own, need, best = null, best_advancement = null, best_influence = null, best_experience = null, best_land = 0, list = [], quests = this.data;
	if (!type || type === 'data') {
		for (i in quests) {
			if (quests[i].item && !quests[i].unique) {
				list.push(quests[i].item);
			}
		}
		Config.set('quest_reward', ['Nothing', 'Influence', 'Advancement', 'Experience', 'Cash'].concat(unique(list).sort()));
	}
	// Now choose the next quest...
	if (this.option.unique && Alchemy._changed > this.lastunique) {// Only checking for unique if the Alchemy data has changed - saves CPU
		for (i in quests) {
			if (quests[i].unique) {
				if (!Alchemy.get(['ingredients', quests[i].itemimg]) && (!best || quests[i].energy < quests[best].energy)) {
					best = i;
				}
			}
		}
		this.lastunique = Date.now();
	}
	if (!best && this.option.what !== 'Nothing') {
//		debug('option = ' + this.option.what);
//		best = (this.runtime.best && quests[this.runtime.best] && (quests[this.runtime.best].influence < 100) ? this.runtime.best : null);
		for (i in quests) {
			if (quests[i].units && (typeof quests[i].own === 'undefined' || (quests[i].own === false && worker === Town))) {// Only check for requirements if we don't already know about them
				own = 0, need = 0;
				for (unit in quests[i].units) {
					own += Town.get([unit, 'own']) || 0;
					need += quests[i].units[unit];
				}
				quests[i].own = (own >= need);
				if (!quests[i].own) { // Can't do a quest because we don't have all the items...
//					debug('Can\'t do "'+i+'" because we don\'t have the items...');
					this._watch(Town); // Watch Town for updates...
					continue;
				}
			}
			switch(this.option.what) { // Automatically fallback on type - but without changing option
				case 'Advancement': // Complete all required main / boss quests in an area to unlock the next one (type === 2 means subquest)
					if (quests[i].type !== 2 && typeof quests[i].land === 'number' && quests[i].land >= best_land && (quests[i].influence < 100 || (quests[i].unique && !Alchemy.get(['ingredients', quests[i].itemimg]))) && (!best_advancement || quests[i].land > (quests[best_advancement].land || 0) || (quests[i].land === quests[best_advancement].land && (quests[i].unique && !length(Player.data[quests[i].item]))))) {
						best_land = Math.max(best_land, quests[i].land);
						best_advancement = i;
					}
				case 'Influence': // Find the cheapest energy cost quest with influence under 100%
					if (typeof quests[i].influence !== 'undefined' && quests[i].influence < 100 && (!best_influence || quests[i].energy < quests[best_influence].energy)) {
						best_influence = i;
					}
				case 'Experience': // Find the best exp per energy quest
					if (!best_experience || (quests[i].energy / quests[i].exp) < (quests[best_experience].energy / quests[best_experience].exp)) {
						best_experience = i;
					}
					break;
				case 'Cash': // Find the best (average) cash per energy quest
					if (!best || (quests[i].energy / quests[i].reward) < (quests[best].energy / quests[best].reward)) {
						best = i;
					}
					break;
				default: // For everything else, there's (cheap energy) items...
					if (quests[i].item === this.option.what && (!best || quests[i].energy < quests[best].energy)) {
						best = i;
					}
					break;
			}
		}
		switch(this.option.what) { // Automatically fallback on type - but without changing option
			case 'Advancement':	best = best_advancement || best_influence || best_experience;break;
			case 'Influence':	best = best_influence || best_experience;break;
			case 'Experience':	best = best_experience;break;
			default:break;
		}
	}
	if (best !== this.runtime.best) {
		this.runtime.best = best;
		if (best) {
			this.runtime.energy = quests[best].energy;
			debug('Wanting to perform - ' + best + ' in ' + (typeof quests[best].land === 'number' ? this.land[quests[best].land] : this.area[quests[best].area]) + ' (energy: ' + quests[best].energy + ', experience: ' + quests[best].exp + ', reward: $' + addCommas(quests[best].reward) + ')');
		}
	}
	if (best) {
		Dashboard.status(this, (typeof quests[best].land === 'number' ? this.land[quests[best].land] : this.area[quests[best].area]) + ': ' + best + ' (energy: ' + quests[best].energy + ', experience: ' + quests[best].exp + ', reward: $' + addCommas(quests[best].reward) + (typeof quests[best].influence !== 'undefined' ? (', influence: ' + quests[best].influence + '%)') : ''));
	} else {
		Dashboard.status(this);
	}
};

Quest.work = function(state) {
	var i, j, general = null, best = this.runtime.best;
	if (!best || this.runtime.energy > Queue.burn.energy) {
		if (state && this.option.bank) {
			return Bank.work(true);
		}
		return false;
	}
	if (this.option.monster && Monster.data) {
		for (i in Monster.data) {
			for (j in Monster.data[i]) {
				if (Monster.data[i][j].state === 'engage' && typeof Monster.data[i][j].defense === 'number' && Monster.data[i][j].defense < Monster.option.fortify) {
					return false;
				}
				if (Monster.data[i][j].state === 'engage' && typeof Monster.data[i][j].dispel === 'number' && Monster.data[i][j].dispel > Monster.option.dispel) {
					return false;
				}
			}
		}
	}
	if (!state) {
		return true;
	}
	if (this.option.general) {
		if (this.data[best].general && typeof this.data[best].influence === 'number' && this.data[best].influence < 100) {
			if (!Generals.to(this.data[best].general)) 
			{
				return true;
			}
		} else {
			switch(this.option.what) {
				case 'Influence':
				case 'Advancement':
				case 'Experience':
					general = Generals.best('under level 4');
					if (general === 'any' && this.data[best].influence < 100) {
						general = Generals.best('influence');
					}
					break;
				case 'Cash':
					general = Generals.best('cash');
					break;
				default:
					general = Generals.best('item');
					break;
			}
			if (!Generals.to(general)) {
				return true;
			}
		}
	}
	switch(this.data[best].area) {
		case 'quest':
			if (!Page.to('quests_quest' + (this.data[best].land + 1))) {
				return true;
			}
			break;
		case 'demiquest':
			if (!Page.to('quests_demiquests')) {
				return true;
			}
			break;
		case 'atlantis':
			if (!Page.to('quests_atlantis')) {
				return true;
			}
			break;
		default:
			log('Can\'t get to quest area!');
			return false;
	}
	debug('Performing - ' + best + ' (energy: ' + this.data[best].energy + ')');
	if (!Page.click('div.action[title^="' + best + ':"] input[type="image"], div.action[title^="' + best + ' :"] input[type="image"]')) { // Can't find the quest, so either a bad page load, or bad data - delete the quest and reload, which should force it to update ok...
		debug('Can\'t find button for ' + best + ', so deleting and re-visiting page...');
		delete this.data[best];
		Page.reload();
	}
	if (this.option.unique && this.data[best].unique && !Alchemy.get(['ingredients', this.data[i].itemimg])) {
		Alchemy.set(['ingredients', this.data[i].itemimg], 1)
	}
	if (this.option.what === 'Advancement' && this.data[best].unique) { // If we just completed a boss quest, check for a new quest land.
		if (this.data[best].land < 6) {	// There are still lands to explore
			Page.to('quests_quest' + (this.data[best].land + 2));
		}
	}
	return QUEUE_RELEASE;
};

Quest.order = [];
Quest.dashboard = function(sort, rev) {
	var i, o, list = [], output = [];
	if (typeof sort === 'undefined') {
		this.order = [];
		for (i in this.data) {
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
	function getValue(q){
		switch(sort) {
			case 0:	// general
				return Quest.data[q].general || 'zzz';
			case 1: // name
				return q;
			case 2: // area
				return typeof Quest.data[q].land === 'number' && typeof Quest.land[Quest.data[q].land] !== 'undefined' ? Quest.land[Quest.data[q].land] : Quest.area[Quest.data[q].area];
			case 3: // level
				return (typeof Quest.data[q].level !== 'undefined' ? Quest.data[q].level : -1) * 100 + (Quest.data[q].influence || 0);
			case 4: // energy
				return Quest.data[q].energy;
			case 5: // exp
				return Quest.data[q].exp / Quest.data[q].energy;
			case 6: // reward
				return Quest.data[q].reward / Quest.data[q].energy;
			case 7: // item
				return Quest.data[q].item || 'zzz';
		}
		return 0; // unknown
	}
	this.order.sort(function(a,b) {
		var aa = getValue(a), bb = getValue(b);
		if (typeof aa === 'string' || typeof bb === 'string') {
			return (rev ? (bb || '') > (aa || '') : (bb || '') < (aa || ''));
		}
		return (rev ? (aa || 0) - (bb || 0) : (bb || 0) - (aa || 0));
	});
	th(output, 'General');
	th(output, 'Name');
	th(output, 'Area');
	th(output, 'Level');
	th(output, 'Energy');
	th(output, '@&nbsp;Exp');
	th(output, '@&nbsp;Reward');
	th(output, 'Item');
	list.push('<table cellspacing="0" style="width:100%"><thead><tr>' + output.join('') + '</tr></thead><tbody>');
	for (o=0; o<this.order.length; o++) {
		i = this.order[o];
		output = [];
		td(output, Generals.get([this.data[i].general]) ? '<img style="width:25px;height:25px;" src="' + imagepath + Generals.get([this.data[i].general, 'img']) + '" alt="' + this.data[i].general + '" title="' + this.data[i].general + '">' : '');
		th(output, i);
		td(output, typeof this.data[i].land === 'number' ? this.land[this.data[i].land].replace(' ','&nbsp;') : this.area[this.data[i].area].replace(' ','&nbsp;'));
		td(output, typeof this.data[i].level !== 'undefined' ? this.data[i].level + '&nbsp;(' + this.data[i].influence + '%)' : '');
		td(output, this.data[i].energy);
		td(output, (this.data[i].exp / this.data[i].energy).round(2), 'title="' + this.data[i].exp + ' total, ' + (this.data[i].exp / this.data[i].energy * 12).round(2) + ' per hour"');
		td(output, '$' + addCommas((this.data[i].reward / this.data[i].energy).round()), 'title="$' + addCommas(this.data[i].reward) + ' total, $' + addCommas((this.data[i].reward / this.data[i].energy * 12).round()) + ' per hour"');
		td(output, this.data[i].itemimg ? '<img style="width:25px;height:25px;" src="' + imagepath + this.data[i].itemimg + '" alt="' + this.data[i].item + '" title="' + this.data[i].item + '">' : '');
		tr(list, output.join(''), 'style="height:25px;"');
	}
	list.push('</tbody></table>');
	$('#golem-dashboard-Quest').html(list.join(''));
	$('#golem-dashboard-Quest tbody tr td:nth-child(2)').css('text-align', 'left');
	if (typeof sort !== 'undefined') {
		$('#golem-dashboard-Quest thead th:eq('+sort+')').attr('name',(rev ? 'reverse' : 'sort')).append('&nbsp;' + (rev ? '&uarr;' : '&darr;'));
	}
};

/********** Worker.Title **********
* Changes the window title to user defined data.
* String may contain {stamina} or {Player:stamina} using the worker name (default Player)
*/
var Title = new Worker('Title');
Title.data = null;

Title.settings = {
	system:true,
	unsortable:true,
	advanced:true
};

Title.option = {
	enabled:false,
	title:"CA: {Queue:runtime.current} | {energy}e | {stamina}s | {exp_needed}xp by {LevelUp:time}"
};

Title.display = [
	{
		id:'enabled',
		label:'Change Window Title',
		checkbox:true
	},{
		id:'title',
		text:true,
		size:24
	},{
		title:'Useful Values',
		info:'{energy} / {maxenergy}<br>{health} / {maxhealth}<br>{stamina} / {maxstamina}<br>{level}<br>{pause} - "(Paused) " when paused<br>{LevelUp:time} - Next level time<br>{Queue:runtime.current} - Activity'
	}
];

Title.old = null; // Old title, in case we ever have to change back

Title.init = function() {
	this._watch(Player);
};

/***** Title.update() *****
* 1. Split option.title into sections containing at most one bit of text and one {value}
* 2. Output the plain text first
* 3. Split the {value} in case it's really {worker:value}
* 4. Output worker.get(value)
* 5. Watch worker for changes
*/
Title.update = function(type) {
	if (this.option.enabled && this.option.title) {
		var i, tmp, what, worker, value, output = '', parts = this.option.title.match(/([^}]+\}?)/g);// split into "text {option}"
		for (i in parts) {
			tmp = parts[i].regex(/([^{]*)\{?([^}]*)\}?/);// now split to "text" "option"
			output += tmp[0];
			if (tmp[1]) {
				worker = Player;
				what = tmp[1].split(':');// if option is "worker:value" then deal with it here
				if (what[1]) {
					worker = WorkerByName(what.shift());
				}
				if (worker) {
					value = worker.get(what[0]);
					output += typeof value === 'number' ? addCommas(value) : typeof value === 'string' ? value : '';
					this._watch(worker); // Doesn't matter how often we add, it's only there once...
				} else {
					debug('Bad worker specified = "' + tmp[1] + '"');
				}
			}
		}
		if (!this.old) {
			this.old = document.title;
		}
		document.title = output;
	} else if (this.old) {
		document.title = this.old;
		this.old = null;
	}
};

/********** Worker.Town **********
* Sorts and auto-buys all town units (not property)
*/
var Town = new Worker('Town');
Town.data = {};

Town.defaults = {
	castle_age:{
		pages:'town_soldiers town_blacksmith town_magic'
	}
};
Town.settings = {
    stateful:true
};

Town.option = {
	general:true,
	number:'Minimum',
	maxcost:'$100k',
	units:'All',
	sell:false
};

Town.runtime = {
	best:null,
	buy:0,
	cost:0
};

Town.display = [
	{
		label:'Work in progress...'
	},{
		id:'general',
		label:'Use Best General',
		checkbox:true
	},{
		id:'number',
		label:'Buy Number',
		select:['None', 'Minimum', 'Match Army', 'Maximum'],
		help:'Minimum will buy before any quests (otherwise only bought when needed), Maximum will buy 501 (depending on generals)'
	},{
		advanced:true,
		id:'maxcost',
		label:'Maximum Buy Cost',
		select:['$10k','$100k','$1m','$10m','$100m','$1b','$10b','$100b']
	},{
		advanced:true,
		id:'units',
		label:'Buy Type',
		select:['All', 'Best Offense', 'Best Defense', 'Best of Both']
	},{
		advanced:true,
		id:'sell',
		label:'Auto-Sell<br>(Not enabled)',
		checkbox:true
	}
];

Town.blacksmith = { // Shield must come after armor (currently)
	Weapon:	/avenger|axe|blade|bow|cleaver|cudgel|dagger|halberd|mace|morningstar|rod|saber|spear|staff|stave|sword|talon|trident|wand|Daedalus|Dragonbane|Dreadnought Greatsword|Excalibur|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught/i,
	Shield:	/buckler|shield|tome|Defender|Dragon Scale|Frost Dagger|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought/i,
	Helmet:	/cowl|crown|helm|horns|mask|veil/i,
	Gloves:	/gauntlet|glove|hand|bracer|Slayer's Embrace/i,
	Armor:	/armor|chainmail|cloak|pauldrons|plate|raiments|robe|Blood Vestment|Garlans Battlegear|Faerie Wings/i,
	Amulet:	/amulet|bauble|charm|crystal|eye|heart|insignia|jewel|lantern|memento|orb|shard|soul|talisman|trinket|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Thawing Star/i
};

Town.init = function() {
	if (this.data.soldiers || this.data.blacksmith || this.data.magic) { // Need to reparse with new code...
		this.data = {};
		Page.set('town_soldiers', 0);
		Page.set('town_blacksmith', 0);
		Page.set('town_magic', 0);
	}
};

Town.parse = function(change) {
	if (!change) {
		var unit = Town.data, page = Page.page.substr(5);
		$('tr.eq_buy_row,tr.eq_buy_row2').each(function(a,el){
			// Fix for broken magic page!!
			!$('div.eq_buy_costs_int', el).length && $('div.eq_buy_costs', el).prepend('<div class="eq_buy_costs_int"></div>').children('div.eq_buy_costs_int').append($('div.eq_buy_costs >[class!="eq_buy_costs_int"]', el));
			!$('div.eq_buy_stats_int', el).length && $('div.eq_buy_stats', el).prepend('<div class="eq_buy_stats_int"></div>').children('div.eq_buy_stats_int').append($('div.eq_buy_stats >[class!="eq_buy_stats_int"]', el));
			!$('div.eq_buy_txt_int', el).length && $('div.eq_buy_txt', el).prepend('<div class="eq_buy_txt_int"></div>').children('div.eq_buy_txt_int').append($('div.eq_buy_txt >[class!="eq_buy_txt_int"]', el));
			var i, stats = $('div.eq_buy_stats', el), name = $('div.eq_buy_txt strong:first', el).text().trim(), costs = $('div.eq_buy_costs', el), cost = $('strong:first-child', costs).text().replace(/[^0-9]/g, '');
			unit[name] = unit[name] || {};
			unit[name].page = page;
			unit[name].img = $('div.eq_buy_image img', el).attr('src').filepart();
			unit[name].own = $('span:first-child', costs).text().regex(/Owned: ([0-9]+)/i);
			unit[name].att = $('div.eq_buy_stats_int div:eq(0)', stats).text().regex(/([0-9]+)\s*Attack/);
			unit[name].def = $('div.eq_buy_stats_int div:eq(1)', stats).text().regex(/([0-9]+)\s*Defense/);
			if (cost) {
				unit[name].cost = parseInt(cost, 10);
				unit[name].buy = [];
				$('select[name="amount"]:first option', costs).each(function(i,el){
					unit[name].buy.push(parseInt($(el).val(), 10));
				});
			}
			if (page === 'blacksmith') {
				for (i in Town.blacksmith) {
					if (name.match(Town.blacksmith[i])) {
						unit[name].type = i;
					}
				}
			}
		});
	} else if (Page.page==='town_blacksmith') {
		$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
			var $el = $('div.eq_buy_txt strong:first-child', el), name = $el.text().trim();
			if (Town.data[name].type) {
				$el.parent().append('<br>'+Town.data[name].type);
			}
		});
	}
	return true;
};

Town.getInvade = function(army) {
	var att = 0, def = 0, data = this.data;
	att += getAttDef(data, function(list,i,units){if (units[i].page==='soldiers'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].type && units[i].type !== 'Weapon'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].type === 'Weapon'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	att += getAttDef(data, function(list,i,units){if (units[i].page === 'magic'){list.push(i);}}, 'att', army, 'invade');
	def += getAttDef(data, null, 'def', army, 'invade');
	return {attack:att, defend:def};
};

Town.getDuel = function() {
	var att = 0, def = 0, data = this.data;
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

Town.update = function(type) {
	var i, u, best = null, buy = 0, data = this.data, quests, army = Player.get('army'), max = (this.option.number === 'Match Army' ? army : (this.option.number === 'Maximum' ? 501 : 0));
	this.runtime.invade = this.getInvade(army);
	this.runtime.duel = this.getDuel();
	if (this.option.number !== 'None') {
		quests = Quest.get();
		for (i in quests) {
			if (quests[i].units) {
				for (u in quests[i].units) {
					if (data[u] && data[u].cost && data[u].own < quests[i].units[u]) {
						best = u;
						buy = quests[i].units[u] - data[u].own;
					}
				}
			}
		}
	}
	/*
//		if (!units[i].cost || units[i].own >= max || (best && Town.option.units === 'Best Offense' && units[i].att <= best.att) || (best && Town.option.units === 'Best Defense' && units[i].def <= best.def) || (best && Town.option.units === 'Best of Both' && (units[i].att <= best.att || units[i].def <= best.def))) {
	if (max && !best) {
		for (i in data) {
			if (data[i].cost && data[i].own < max) {
				best = Math.max(data[u].need, max - data[u].own);
			}
		}
	}
	*/
	this.runtime.best = best;
	if (best) {
		this.runtime.buy = buy;
		this.runtime.cost = buy * data[best].cost;
		Dashboard.status(this, 'Want to buy ' + buy + ' x ' + best + ' for $' + addCommas(this.runtime.cost));
	} else {
		Dashboard.status(this);
	}
};

Town.work = function(state) {
	var qty;
	if (!this.runtime.best || !this.runtime.buy || !Bank.worth(this.runtime.cost)) {
		return false;
	}
	if (!state || !this.buy(this.runtime.best, this.runtime.buy)) {
		return QUEUE_RELEASE;
	}
	return false;
};

Town.buy = function(item, number) { // number is absolute including already owned
	this._unflush();
	if (!this.data[item] || !this.data[item].buy || !Bank.worth(this.runtime.cost)) {
		return true; // We (pretend?) we own them
	}
	if (!Generals.to(this.option.general ? 'cost' : 'any') || !Bank.retrieve(this.runtime.cost) || (this.data[item].page === 'soldiers' && !Generals.to('cost')) || !Page.to('town_'+this.data[item].page)) {
		return false;
	}
	var i, qty = 0;
	for (i=0; i<this.data[item].buy.length && this.data[item].buy[i] <= number; i++) {
		qty = this.data[item].buy[i];
	}
	$('tr.eq_buy_row,tr.eq_buy_row2').each(function(i,el){
		if ($('div.eq_buy_txt strong:first', el).text().trim() === item) {
			debug('Buying ' + qty + ' x ' + item + ' for $' + addCommas(qty * Town.data[item].cost));
			$('div.eq_buy_costs select[name="amount"]:eq(0)', el).val(qty);
			Page.click($('div.eq_buy_costs input[name="Buy"]', el));
		}
	});
	return false;
};

var makeTownDash = function(list, unitfunc, x, type, name, count) { // Find total att(ack) or def(ense) value from a list of objects (with .att and .def)
	var units = [], output = [], x2 = (x==='att'?'def':'att'), i, order = {Weapon:1, Shield:2, Helmet:3, Armor:4, Amulet:5, Gloves:6, Magic:7};
	if (name) {
		output.push('<div class="golem-panel"><h3 class="golem-panel-header">'+name+'</h3><div class="golem-panel-content">');
	}
	for (i in list) {
		unitfunc(units, i, list);
	}
	if (list[units[0]]) {
		if (type === 'duel' && list[units[0]].type) {
			units.sort(function(a,b) {
				return order[list[a].type] - order[list[b].type];
			});
		} else if (list[units[0]] && list[units[0]].skills && list[units[0]][type]) {
			units.sort(function(a,b) {
				return (list[b][type][x] || 0) - (list[a][type][x] || 0);
			});
		} else {
			units.sort(function(a,b) {
				return (list[b][x] + (0.7 * list[b][x2])) - (list[a][x] + (0.7 * list[a][x2]));
			});
		}
	}
	for (i=0; i<(count ? count : units.length); i++) {
		if ((list[units[0]] && list[units[0]].skills) || (list[units[i]].use && list[units[i]].use[type+'_'+x])) {
			output.push('<div style="height:25px;margin:1px;"><img src="' + imagepath + list[units[i]].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + (list[units[i]].use ? list[units[i]].use[type+'_'+x]+' x ' : '') + units[i] + ' (' + list[units[i]].att + ' / ' + list[units[i]].def + ')' + (list[units[i]].cost?'<br>$'+addCommas(list[units[i]].cost):'') + '</div>');
		}
	}
	if (name) {
		output.push('</div></div>');
	}
	return output.join('');
};

Town.dashboard = function() {
	var left, right, generals = Generals.get(), duel = {}, best;
	best = Generals.best('duel');
	left = '<div style="float:left;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(generals, function(list,i){list.push(i);}, 'att', 'invade', 'Heroes')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'att', 'invade', 'Soldiers')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'att', 'invade', 'Weapons')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'att', 'invade', 'Equipment')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Attack</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'att', 'duel')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'att', 'duel')
			+'</div></div></div>';
	best = Generals.best('defend');
	right = '<div style="float:right;width:50%;"><div class="golem-panel"><h3 class="golem-panel-header">Invade - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	makeTownDash(generals, function(list,i){list.push(i);}, 'def', 'invade', 'Heroes')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='soldiers' && units[i].use){list.push(i);}}, 'def', 'invade', 'Soldiers')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].use && units[i].type === 'Weapon'){list.push(i);}}, 'def', 'invade', 'Weapons')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use && units[i].type !== 'Weapon'){list.push(i);}}, 'def', 'invade', 'Equipment')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'invade', 'Magic')
			+	'</div></div><div class="golem-panel"><h3 class="golem-panel-header">Duel - Defend</h3><div class="golem-panel-content" style="padding:8px;">'
			+	(best !== 'any' ? '<div style="height:25px;margin:1px;"><img src="' + imagepath + generals[best].img + '" style="width:25px;height:25px;float:left;margin-right:4px;">' + best + ' (' + generals[best].att + ' / ' + generals[best].def + ')</div>' : '')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='blacksmith' && units[i].use){list.push(i);}}, 'def', 'duel')
			+	makeTownDash(this.data, function(list,i,units){if (units[i].page==='magic' && units[i].use){list.push(i);}}, 'def', 'duel')
			+'</div></div></div>';

	$('#golem-dashboard-Town').html(left+right);
};

/********** Worker.Upgrade **********
* Spends upgrade points
*/
var Upgrade = new Worker('Upgrade');
Upgrade.data = null;

Upgrade.defaults = {
	castle_age:{
		pages:'keep_stats'
	}
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
	if (this.option.run) {
		this.runtime.run = this.option.run;
		delete this.option.run;
	}
	if (this.option.working) {
		this.runtime.working = this.option.working;
		delete this.option.working;
	}
};

Upgrade.parse = function(change) {
	var result = $('div.results');
	if (this.runtime.working && result.length && result.text().match(/You just upgraded your/i)) {
		this.runtime.working = false;
		this.runtime.run++;
	}
	return false;
};

Upgrade.work = function(state) {
	var points = Player.get('upgrade'), btn;
	if (this.runtime.run >= this.option.order.length) {
		this.runtime.run = 0;
	}
	if (!this.option.order.length || !points || (this.option.order[this.runtime.run]==='Stamina' && points<2)) {
		return false;
	}
	if (!state || !Page.to('keep_stats')) {
		return true;
	}
	switch (this.option.order[this.runtime.run]) {
		case 'Energy':	btn = 'a[href$="?upgrade=energy_max"]';	break;
		case 'Stamina':	btn = 'a[href$="?upgrade=stamina_max"]';break;
		case 'Attack':	btn = 'a[href$="?upgrade=attack"]';		break;
		case 'Defense':	btn = 'a[href$="?upgrade=defense"]';	break;
		case 'Health':	btn = 'a[href$="?upgrade=health_max"]';	break;
		default: this.runtime.run++; return true; // Should never happen
	}
	if (Page.click(btn)) {
		this.runtime.working = true;
	} else {
		Page.reload(); // Only get here if we can't click!
	}
	return true;
};

