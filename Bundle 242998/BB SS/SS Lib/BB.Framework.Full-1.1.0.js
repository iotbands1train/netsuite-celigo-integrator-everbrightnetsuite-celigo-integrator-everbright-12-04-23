/**
* @NModuleScope Public
*/
var define = define || undefined;
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.moment=t()}(this,function(){"use strict";function e(){return Yt.apply(null,arguments)}function t(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function n(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function s(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;var t;for(t in e)if(e.hasOwnProperty(t))return!1;return!0}function i(e){return void 0===e}function r(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function a(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function o(e,t){var n,s=[];for(n=0;n<e.length;++n)s.push(t(e[n],n));return s}function u(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function l(e,t){for(var n in t)u(t,n)&&(e[n]=t[n]);return u(t,"toString")&&(e.toString=t.toString),u(t,"valueOf")&&(e.valueOf=t.valueOf),e}function d(e,t,n,s){return je(e,t,n,s,!0).utc()}function h(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function c(e){return null==e._pf&&(e._pf=h()),e._pf}function f(e){if(null==e._isValid){var t=c(e),n=Ot.call(t.parsedDateParts,function(e){return null!=e}),s=!isNaN(e._d.getTime())&&t.overflow<0&&!t.empty&&!t.invalidMonth&&!t.invalidWeekday&&!t.weekdayMismatch&&!t.nullInput&&!t.invalidFormat&&!t.userInvalidated&&(!t.meridiem||t.meridiem&&n);if(e._strict&&(s=s&&0===t.charsLeftOver&&0===t.unusedTokens.length&&void 0===t.bigHour),null!=Object.isFrozen&&Object.isFrozen(e))return s;e._isValid=s}return e._isValid}function m(e){var t=d(NaN);return null!=e?l(c(t),e):c(t).userInvalidated=!0,t}function _(e,t){var n,s,r;if(i(t._isAMomentObject)||(e._isAMomentObject=t._isAMomentObject),i(t._i)||(e._i=t._i),i(t._f)||(e._f=t._f),i(t._l)||(e._l=t._l),i(t._strict)||(e._strict=t._strict),i(t._tzm)||(e._tzm=t._tzm),i(t._isUTC)||(e._isUTC=t._isUTC),i(t._offset)||(e._offset=t._offset),i(t._pf)||(e._pf=c(t)),i(t._locale)||(e._locale=t._locale),xt.length>0)for(n=0;n<xt.length;n++)i(r=t[s=xt[n]])||(e[s]=r);return e}function y(t){_(this,t),this._d=new Date(null!=t._d?t._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===Tt&&(Tt=!0,e.updateOffset(this),Tt=!1)}function g(e){return e instanceof y||null!=e&&null!=e._isAMomentObject}function p(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function w(e){var t=+e,n=0;return 0!==t&&isFinite(t)&&(n=p(t)),n}function v(e,t,n){var s,i=Math.min(e.length,t.length),r=Math.abs(e.length-t.length),a=0;for(s=0;s<i;s++)(n&&e[s]!==t[s]||!n&&w(e[s])!==w(t[s]))&&a++;return a+r}function M(t){!1===e.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+t)}function k(t,n){var s=!0;return l(function(){if(null!=e.deprecationHandler&&e.deprecationHandler(null,t),s){for(var i,r=[],a=0;a<arguments.length;a++){if(i="","object"==typeof arguments[a]){i+="\n["+a+"] ";for(var o in arguments[0])i+=o+": "+arguments[0][o]+", ";i=i.slice(0,-2)}else i=arguments[a];r.push(i)}M(t+"\nArguments: "+Array.prototype.slice.call(r).join("")+"\n"+(new Error).stack),s=!1}return n.apply(this,arguments)},n)}function S(t,n){null!=e.deprecationHandler&&e.deprecationHandler(t,n),bt[t]||(M(n),bt[t]=!0)}function D(e){return e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}function Y(e,t){var s,i=l({},e);for(s in t)u(t,s)&&(n(e[s])&&n(t[s])?(i[s]={},l(i[s],e[s]),l(i[s],t[s])):null!=t[s]?i[s]=t[s]:delete i[s]);for(s in e)u(e,s)&&!u(t,s)&&n(e[s])&&(i[s]=l({},i[s]));return i}function O(e){null!=e&&this.set(e)}function x(e,t){var n=e.toLowerCase();Ut[n]=Ut[n+"s"]=Ut[t]=e}function T(e){return"string"==typeof e?Ut[e]||Ut[e.toLowerCase()]:void 0}function b(e){var t,n,s={};for(n in e)u(e,n)&&(t=T(n))&&(s[t]=e[n]);return s}function P(e,t){Nt[e]=t}function W(e){var t=[];for(var n in e)t.push({unit:n,priority:Nt[n]});return t.sort(function(e,t){return e.priority-t.priority}),t}function R(e,t,n){var s=""+Math.abs(e),i=t-s.length;return(e>=0?n?"+":"":"-")+Math.pow(10,Math.max(0,i)).toString().substr(1)+s}function C(e,t,n,s){var i=s;"string"==typeof s&&(i=function(){return this[s]()}),e&&(Vt[e]=i),t&&(Vt[t[0]]=function(){return R(i.apply(this,arguments),t[1],t[2])}),n&&(Vt[n]=function(){return this.localeData().ordinal(i.apply(this,arguments),e)})}function F(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function U(e){var t,n,s=e.match(Ht);for(t=0,n=s.length;t<n;t++)Vt[s[t]]?s[t]=Vt[s[t]]:s[t]=F(s[t]);return function(t){var i,r="";for(i=0;i<n;i++)r+=D(s[i])?s[i].call(t,e):s[i];return r}}function N(e,t){return e.isValid()?(t=H(t,e.localeData()),Gt[t]=Gt[t]||U(t),Gt[t](e)):e.localeData().invalidDate()}function H(e,t){var n=5;for(Lt.lastIndex=0;n>=0&&Lt.test(e);)e=e.replace(Lt,function(e){return t.longDateFormat(e)||e}),Lt.lastIndex=0,n-=1;return e}function L(e,t,n){rn[e]=D(t)?t:function(e,s){return e&&n?n:t}}function G(e,t){return u(rn,e)?rn[e](t._strict,t._locale):new RegExp(V(e))}function V(e){return j(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(e,t,n,s,i){return t||n||s||i}))}function j(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function I(e,t){var n,s=t;for("string"==typeof e&&(e=[e]),r(t)&&(s=function(e,n){n[t]=w(e)}),n=0;n<e.length;n++)an[e[n]]=s}function E(e,t){I(e,function(e,n,s,i){s._w=s._w||{},t(e,s._w,s,i)})}function A(e,t,n){null!=t&&u(an,e)&&an[e](t,n._a,n,e)}function z(e){return Z(e)?366:365}function Z(e){return e%4==0&&e%100!=0||e%400==0}function $(t,n){return function(s){return null!=s?(J(this,t,s),e.updateOffset(this,n),this):q(this,t)}}function q(e,t){return e.isValid()?e._d["get"+(e._isUTC?"UTC":"")+t]():NaN}function J(e,t,n){e.isValid()&&!isNaN(n)&&("FullYear"===t&&Z(e.year())?e._d["set"+(e._isUTC?"UTC":"")+t](n,e.month(),Q(n,e.month())):e._d["set"+(e._isUTC?"UTC":"")+t](n))}function B(e,t){return(e%t+t)%t}function Q(e,t){if(isNaN(e)||isNaN(t))return NaN;var n=B(t,12);return e+=(t-n)/12,1===n?Z(e)?29:28:31-n%7%2}function X(e,t,n){var s,i,r,a=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],s=0;s<12;++s)r=d([2e3,s]),this._shortMonthsParse[s]=this.monthsShort(r,"").toLocaleLowerCase(),this._longMonthsParse[s]=this.months(r,"").toLocaleLowerCase();return n?"MMM"===t?-1!==(i=yn.call(this._shortMonthsParse,a))?i:null:-1!==(i=yn.call(this._longMonthsParse,a))?i:null:"MMM"===t?-1!==(i=yn.call(this._shortMonthsParse,a))?i:-1!==(i=yn.call(this._longMonthsParse,a))?i:null:-1!==(i=yn.call(this._longMonthsParse,a))?i:-1!==(i=yn.call(this._shortMonthsParse,a))?i:null}function K(e,t){var n;if(!e.isValid())return e;if("string"==typeof t)if(/^\d+$/.test(t))t=w(t);else if(t=e.localeData().monthsParse(t),!r(t))return e;return n=Math.min(e.date(),Q(e.year(),t)),e._d["set"+(e._isUTC?"UTC":"")+"Month"](t,n),e}function ee(t){return null!=t?(K(this,t),e.updateOffset(this,!0),this):q(this,"Month")}function te(){function e(e,t){return t.length-e.length}var t,n,s=[],i=[],r=[];for(t=0;t<12;t++)n=d([2e3,t]),s.push(this.monthsShort(n,"")),i.push(this.months(n,"")),r.push(this.months(n,"")),r.push(this.monthsShort(n,""));for(s.sort(e),i.sort(e),r.sort(e),t=0;t<12;t++)s[t]=j(s[t]),i[t]=j(i[t]);for(t=0;t<24;t++)r[t]=j(r[t]);this._monthsRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+i.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+s.join("|")+")","i")}function ne(e,t,n,s,i,r,a){var o=new Date(e,t,n,s,i,r,a);return e<100&&e>=0&&isFinite(o.getFullYear())&&o.setFullYear(e),o}function se(e){var t=new Date(Date.UTC.apply(null,arguments));return e<100&&e>=0&&isFinite(t.getUTCFullYear())&&t.setUTCFullYear(e),t}function ie(e,t,n){var s=7+t-n;return-((7+se(e,0,s).getUTCDay()-t)%7)+s-1}function re(e,t,n,s,i){var r,a,o=1+7*(t-1)+(7+n-s)%7+ie(e,s,i);return o<=0?a=z(r=e-1)+o:o>z(e)?(r=e+1,a=o-z(e)):(r=e,a=o),{year:r,dayOfYear:a}}function ae(e,t,n){var s,i,r=ie(e.year(),t,n),a=Math.floor((e.dayOfYear()-r-1)/7)+1;return a<1?s=a+oe(i=e.year()-1,t,n):a>oe(e.year(),t,n)?(s=a-oe(e.year(),t,n),i=e.year()+1):(i=e.year(),s=a),{week:s,year:i}}function oe(e,t,n){var s=ie(e,t,n),i=ie(e+1,t,n);return(z(e)-s+i)/7}function ue(e,t){return"string"!=typeof e?e:isNaN(e)?"number"==typeof(e=t.weekdaysParse(e))?e:null:parseInt(e,10)}function le(e,t){return"string"==typeof e?t.weekdaysParse(e)%7||7:isNaN(e)?null:e}function de(e,t,n){var s,i,r,a=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],s=0;s<7;++s)r=d([2e3,1]).day(s),this._minWeekdaysParse[s]=this.weekdaysMin(r,"").toLocaleLowerCase(),this._shortWeekdaysParse[s]=this.weekdaysShort(r,"").toLocaleLowerCase(),this._weekdaysParse[s]=this.weekdays(r,"").toLocaleLowerCase();return n?"dddd"===t?-1!==(i=yn.call(this._weekdaysParse,a))?i:null:"ddd"===t?-1!==(i=yn.call(this._shortWeekdaysParse,a))?i:null:-1!==(i=yn.call(this._minWeekdaysParse,a))?i:null:"dddd"===t?-1!==(i=yn.call(this._weekdaysParse,a))?i:-1!==(i=yn.call(this._shortWeekdaysParse,a))?i:-1!==(i=yn.call(this._minWeekdaysParse,a))?i:null:"ddd"===t?-1!==(i=yn.call(this._shortWeekdaysParse,a))?i:-1!==(i=yn.call(this._weekdaysParse,a))?i:-1!==(i=yn.call(this._minWeekdaysParse,a))?i:null:-1!==(i=yn.call(this._minWeekdaysParse,a))?i:-1!==(i=yn.call(this._weekdaysParse,a))?i:-1!==(i=yn.call(this._shortWeekdaysParse,a))?i:null}function he(){function e(e,t){return t.length-e.length}var t,n,s,i,r,a=[],o=[],u=[],l=[];for(t=0;t<7;t++)n=d([2e3,1]).day(t),s=this.weekdaysMin(n,""),i=this.weekdaysShort(n,""),r=this.weekdays(n,""),a.push(s),o.push(i),u.push(r),l.push(s),l.push(i),l.push(r);for(a.sort(e),o.sort(e),u.sort(e),l.sort(e),t=0;t<7;t++)o[t]=j(o[t]),u[t]=j(u[t]),l[t]=j(l[t]);this._weekdaysRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+u.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+o.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+a.join("|")+")","i")}function ce(){return this.hours()%12||12}function fe(e,t){C(e,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)})}function me(e,t){return t._meridiemParse}function _e(e){return e?e.toLowerCase().replace("_","-"):e}function ye(e){for(var t,n,s,i,r=0;r<e.length;){for(t=(i=_e(e[r]).split("-")).length,n=(n=_e(e[r+1]))?n.split("-"):null;t>0;){if(s=ge(i.slice(0,t).join("-")))return s;if(n&&n.length>=t&&v(i,n,!0)>=t-1)break;t--}r++}return null}function ge(e){var t=null;if(!Fn[e]&&"undefined"!=typeof module&&module&&module.exports)try{t=Pn._abbr,require("./locale/"+e),pe(t)}catch(e){}return Fn[e]}function pe(e,t){var n;return e&&(n=i(t)?ve(e):we(e,t))&&(Pn=n),Pn._abbr}function we(e,t){if(null!==t){var n=Cn;if(t.abbr=e,null!=Fn[e])S("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),n=Fn[e]._config;else if(null!=t.parentLocale){if(null==Fn[t.parentLocale])return Un[t.parentLocale]||(Un[t.parentLocale]=[]),Un[t.parentLocale].push({name:e,config:t}),null;n=Fn[t.parentLocale]._config}return Fn[e]=new O(Y(n,t)),Un[e]&&Un[e].forEach(function(e){we(e.name,e.config)}),pe(e),Fn[e]}return delete Fn[e],null}function ve(e){var n;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return Pn;if(!t(e)){if(n=ge(e))return n;e=[e]}return ye(e)}function Me(e){var t,n=e._a;return n&&-2===c(e).overflow&&(t=n[un]<0||n[un]>11?un:n[ln]<1||n[ln]>Q(n[on],n[un])?ln:n[dn]<0||n[dn]>24||24===n[dn]&&(0!==n[hn]||0!==n[cn]||0!==n[fn])?dn:n[hn]<0||n[hn]>59?hn:n[cn]<0||n[cn]>59?cn:n[fn]<0||n[fn]>999?fn:-1,c(e)._overflowDayOfYear&&(t<on||t>ln)&&(t=ln),c(e)._overflowWeeks&&-1===t&&(t=mn),c(e)._overflowWeekday&&-1===t&&(t=_n),c(e).overflow=t),e}function ke(e,t,n){return null!=e?e:null!=t?t:n}function Se(t){var n=new Date(e.now());return t._useUTC?[n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate()]:[n.getFullYear(),n.getMonth(),n.getDate()]}function De(e){var t,n,s,i,r=[];if(!e._d){for(s=Se(e),e._w&&null==e._a[ln]&&null==e._a[un]&&Ye(e),null!=e._dayOfYear&&(i=ke(e._a[on],s[on]),(e._dayOfYear>z(i)||0===e._dayOfYear)&&(c(e)._overflowDayOfYear=!0),n=se(i,0,e._dayOfYear),e._a[un]=n.getUTCMonth(),e._a[ln]=n.getUTCDate()),t=0;t<3&&null==e._a[t];++t)e._a[t]=r[t]=s[t];for(;t<7;t++)e._a[t]=r[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[dn]&&0===e._a[hn]&&0===e._a[cn]&&0===e._a[fn]&&(e._nextDay=!0,e._a[dn]=0),e._d=(e._useUTC?se:ne).apply(null,r),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[dn]=24),e._w&&void 0!==e._w.d&&e._w.d!==e._d.getDay()&&(c(e).weekdayMismatch=!0)}}function Ye(e){var t,n,s,i,r,a,o,u;if(null!=(t=e._w).GG||null!=t.W||null!=t.E)r=1,a=4,n=ke(t.GG,e._a[on],ae(Ie(),1,4).year),s=ke(t.W,1),((i=ke(t.E,1))<1||i>7)&&(u=!0);else{r=e._locale._week.dow,a=e._locale._week.doy;var l=ae(Ie(),r,a);n=ke(t.gg,e._a[on],l.year),s=ke(t.w,l.week),null!=t.d?((i=t.d)<0||i>6)&&(u=!0):null!=t.e?(i=t.e+r,(t.e<0||t.e>6)&&(u=!0)):i=r}s<1||s>oe(n,r,a)?c(e)._overflowWeeks=!0:null!=u?c(e)._overflowWeekday=!0:(o=re(n,s,i,r,a),e._a[on]=o.year,e._dayOfYear=o.dayOfYear)}function Oe(e){var t,n,s,i,r,a,o=e._i,u=Nn.exec(o)||Hn.exec(o);if(u){for(c(e).iso=!0,t=0,n=Gn.length;t<n;t++)if(Gn[t][1].exec(u[1])){i=Gn[t][0],s=!1!==Gn[t][2];break}if(null==i)return void(e._isValid=!1);if(u[3]){for(t=0,n=Vn.length;t<n;t++)if(Vn[t][1].exec(u[3])){r=(u[2]||" ")+Vn[t][0];break}if(null==r)return void(e._isValid=!1)}if(!s&&null!=r)return void(e._isValid=!1);if(u[4]){if(!Ln.exec(u[4]))return void(e._isValid=!1);a="Z"}e._f=i+(r||"")+(a||""),Fe(e)}else e._isValid=!1}function xe(e,t,n,s,i,r){var a=[Te(e),vn.indexOf(t),parseInt(n,10),parseInt(s,10),parseInt(i,10)];return r&&a.push(parseInt(r,10)),a}function Te(e){var t=parseInt(e,10);return t<=49?2e3+t:t<=999?1900+t:t}function be(e){return e.replace(/\([^)]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").trim()}function Pe(e,t,n){return!e||Yn.indexOf(e)===new Date(t[0],t[1],t[2]).getDay()||(c(n).weekdayMismatch=!0,n._isValid=!1,!1)}function We(e,t,n){if(e)return En[e];if(t)return 0;var s=parseInt(n,10),i=s%100;return 60*((s-i)/100)+i}function Re(e){var t=In.exec(be(e._i));if(t){var n=xe(t[4],t[3],t[2],t[5],t[6],t[7]);if(!Pe(t[1],n,e))return;e._a=n,e._tzm=We(t[8],t[9],t[10]),e._d=se.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),c(e).rfc2822=!0}else e._isValid=!1}function Ce(t){var n=jn.exec(t._i);null===n?(Oe(t),!1===t._isValid&&(delete t._isValid,Re(t),!1===t._isValid&&(delete t._isValid,e.createFromInputFallback(t)))):t._d=new Date(+n[1])}function Fe(t){if(t._f!==e.ISO_8601)if(t._f!==e.RFC_2822){t._a=[],c(t).empty=!0;var n,s,i,r,a,o=""+t._i,u=o.length,l=0;for(i=H(t._f,t._locale).match(Ht)||[],n=0;n<i.length;n++)r=i[n],(s=(o.match(G(r,t))||[])[0])&&((a=o.substr(0,o.indexOf(s))).length>0&&c(t).unusedInput.push(a),o=o.slice(o.indexOf(s)+s.length),l+=s.length),Vt[r]?(s?c(t).empty=!1:c(t).unusedTokens.push(r),A(r,s,t)):t._strict&&!s&&c(t).unusedTokens.push(r);c(t).charsLeftOver=u-l,o.length>0&&c(t).unusedInput.push(o),t._a[dn]<=12&&!0===c(t).bigHour&&t._a[dn]>0&&(c(t).bigHour=void 0),c(t).parsedDateParts=t._a.slice(0),c(t).meridiem=t._meridiem,t._a[dn]=Ue(t._locale,t._a[dn],t._meridiem),De(t),Me(t)}else Re(t);else Oe(t)}function Ue(e,t,n){var s;return null==n?t:null!=e.meridiemHour?e.meridiemHour(t,n):null!=e.isPM?((s=e.isPM(n))&&t<12&&(t+=12),s||12!==t||(t=0),t):t}function Ne(e){var t,n,s,i,r;if(0===e._f.length)return c(e).invalidFormat=!0,void(e._d=new Date(NaN));for(i=0;i<e._f.length;i++)r=0,t=_({},e),null!=e._useUTC&&(t._useUTC=e._useUTC),t._f=e._f[i],Fe(t),f(t)&&(r+=c(t).charsLeftOver,r+=10*c(t).unusedTokens.length,c(t).score=r,(null==s||r<s)&&(s=r,n=t));l(e,n||t)}function He(e){if(!e._d){var t=b(e._i);e._a=o([t.year,t.month,t.day||t.date,t.hour,t.minute,t.second,t.millisecond],function(e){return e&&parseInt(e,10)}),De(e)}}function Le(e){var t=new y(Me(Ge(e)));return t._nextDay&&(t.add(1,"d"),t._nextDay=void 0),t}function Ge(e){var n=e._i,s=e._f;return e._locale=e._locale||ve(e._l),null===n||void 0===s&&""===n?m({nullInput:!0}):("string"==typeof n&&(e._i=n=e._locale.preparse(n)),g(n)?new y(Me(n)):(a(n)?e._d=n:t(s)?Ne(e):s?Fe(e):Ve(e),f(e)||(e._d=null),e))}function Ve(s){var u=s._i;i(u)?s._d=new Date(e.now()):a(u)?s._d=new Date(u.valueOf()):"string"==typeof u?Ce(s):t(u)?(s._a=o(u.slice(0),function(e){return parseInt(e,10)}),De(s)):n(u)?He(s):r(u)?s._d=new Date(u):e.createFromInputFallback(s)}function je(e,i,r,a,o){var u={};return!0!==r&&!1!==r||(a=r,r=void 0),(n(e)&&s(e)||t(e)&&0===e.length)&&(e=void 0),u._isAMomentObject=!0,u._useUTC=u._isUTC=o,u._l=r,u._i=e,u._f=i,u._strict=a,Le(u)}function Ie(e,t,n,s){return je(e,t,n,s,!1)}function Ee(e,n){var s,i;if(1===n.length&&t(n[0])&&(n=n[0]),!n.length)return Ie();for(s=n[0],i=1;i<n.length;++i)n[i].isValid()&&!n[i][e](s)||(s=n[i]);return s}function Ae(e){for(var t in e)if(-1===yn.call(Zn,t)||null!=e[t]&&isNaN(e[t]))return!1;for(var n=!1,s=0;s<Zn.length;++s)if(e[Zn[s]]){if(n)return!1;parseFloat(e[Zn[s]])!==w(e[Zn[s]])&&(n=!0)}return!0}function ze(e){var t=b(e),n=t.year||0,s=t.quarter||0,i=t.month||0,r=t.week||0,a=t.day||0,o=t.hour||0,u=t.minute||0,l=t.second||0,d=t.millisecond||0;this._isValid=Ae(t),this._milliseconds=+d+1e3*l+6e4*u+1e3*o*60*60,this._days=+a+7*r,this._months=+i+3*s+12*n,this._data={},this._locale=ve(),this._bubble()}function Ze(e){return e instanceof ze}function $e(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function qe(e,t){C(e,0,0,function(){var e=this.utcOffset(),n="+";return e<0&&(e=-e,n="-"),n+R(~~(e/60),2)+t+R(~~e%60,2)})}function Je(e,t){var n=(t||"").match(e);if(null===n)return null;var s=((n[n.length-1]||[])+"").match($n)||["-",0,0],i=60*s[1]+w(s[2]);return 0===i?0:"+"===s[0]?i:-i}function Be(t,n){var s,i;return n._isUTC?(s=n.clone(),i=(g(t)||a(t)?t.valueOf():Ie(t).valueOf())-s.valueOf(),s._d.setTime(s._d.valueOf()+i),e.updateOffset(s,!1),s):Ie(t).local()}function Qe(e){return 15*-Math.round(e._d.getTimezoneOffset()/15)}function Xe(){return!!this.isValid()&&(this._isUTC&&0===this._offset)}function Ke(e,t){var n,s,i,a=e,o=null;return Ze(e)?a={ms:e._milliseconds,d:e._days,M:e._months}:r(e)?(a={},t?a[t]=e:a.milliseconds=e):(o=qn.exec(e))?(n="-"===o[1]?-1:1,a={y:0,d:w(o[ln])*n,h:w(o[dn])*n,m:w(o[hn])*n,s:w(o[cn])*n,ms:w($e(1e3*o[fn]))*n}):(o=Jn.exec(e))?(n="-"===o[1]?-1:(o[1],1),a={y:et(o[2],n),M:et(o[3],n),w:et(o[4],n),d:et(o[5],n),h:et(o[6],n),m:et(o[7],n),s:et(o[8],n)}):null==a?a={}:"object"==typeof a&&("from"in a||"to"in a)&&(i=nt(Ie(a.from),Ie(a.to)),(a={}).ms=i.milliseconds,a.M=i.months),s=new ze(a),Ze(e)&&u(e,"_locale")&&(s._locale=e._locale),s}function et(e,t){var n=e&&parseFloat(e.replace(",","."));return(isNaN(n)?0:n)*t}function tt(e,t){var n={milliseconds:0,months:0};return n.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(n.months,"M").isAfter(t)&&--n.months,n.milliseconds=+t-+e.clone().add(n.months,"M"),n}function nt(e,t){var n;return e.isValid()&&t.isValid()?(t=Be(t,e),e.isBefore(t)?n=tt(e,t):((n=tt(t,e)).milliseconds=-n.milliseconds,n.months=-n.months),n):{milliseconds:0,months:0}}function st(e,t){return function(n,s){var i,r;return null===s||isNaN(+s)||(S(t,"moment()."+t+"(period, number) is deprecated. Please use moment()."+t+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),r=n,n=s,s=r),n="string"==typeof n?+n:n,i=Ke(n,s),it(this,i,e),this}}function it(t,n,s,i){var r=n._milliseconds,a=$e(n._days),o=$e(n._months);t.isValid()&&(i=null==i||i,o&&K(t,q(t,"Month")+o*s),a&&J(t,"Date",q(t,"Date")+a*s),r&&t._d.setTime(t._d.valueOf()+r*s),i&&e.updateOffset(t,a||o))}function rt(e,t){var n,s=12*(t.year()-e.year())+(t.month()-e.month()),i=e.clone().add(s,"months");return n=t-i<0?(t-i)/(i-e.clone().add(s-1,"months")):(t-i)/(e.clone().add(s+1,"months")-i),-(s+n)||0}function at(e){var t;return void 0===e?this._locale._abbr:(null!=(t=ve(e))&&(this._locale=t),this)}function ot(){return this._locale}function ut(e,t){C(0,[e,e.length],0,t)}function lt(e,t,n,s,i){var r;return null==e?ae(this,s,i).year:(r=oe(e,s,i),t>r&&(t=r),dt.call(this,e,t,n,s,i))}function dt(e,t,n,s,i){var r=re(e,t,n,s,i),a=se(r.year,0,r.dayOfYear);return this.year(a.getUTCFullYear()),this.month(a.getUTCMonth()),this.date(a.getUTCDate()),this}function ht(e){return e}function ct(e,t,n,s){var i=ve(),r=d().set(s,t);return i[n](r,e)}function ft(e,t,n){if(r(e)&&(t=e,e=void 0),e=e||"",null!=t)return ct(e,t,n,"month");var s,i=[];for(s=0;s<12;s++)i[s]=ct(e,s,n,"month");return i}function mt(e,t,n,s){"boolean"==typeof e?(r(t)&&(n=t,t=void 0),t=t||""):(n=t=e,e=!1,r(t)&&(n=t,t=void 0),t=t||"");var i=ve(),a=e?i._week.dow:0;if(null!=n)return ct(t,(n+a)%7,s,"day");var o,u=[];for(o=0;o<7;o++)u[o]=ct(t,(o+a)%7,s,"day");return u}function _t(e,t,n,s){var i=Ke(t,n);return e._milliseconds+=s*i._milliseconds,e._days+=s*i._days,e._months+=s*i._months,e._bubble()}function yt(e){return e<0?Math.floor(e):Math.ceil(e)}function gt(e){return 4800*e/146097}function pt(e){return 146097*e/4800}function wt(e){return function(){return this.as(e)}}function vt(e){return function(){return this.isValid()?this._data[e]:NaN}}function Mt(e,t,n,s,i){return i.relativeTime(t||1,!!n,e,s)}function kt(e,t,n){var s=Ke(e).abs(),i=ks(s.as("s")),r=ks(s.as("m")),a=ks(s.as("h")),o=ks(s.as("d")),u=ks(s.as("M")),l=ks(s.as("y")),d=i<=Ss.ss&&["s",i]||i<Ss.s&&["ss",i]||r<=1&&["m"]||r<Ss.m&&["mm",r]||a<=1&&["h"]||a<Ss.h&&["hh",a]||o<=1&&["d"]||o<Ss.d&&["dd",o]||u<=1&&["M"]||u<Ss.M&&["MM",u]||l<=1&&["y"]||["yy",l];return d[2]=t,d[3]=+e>0,d[4]=n,Mt.apply(null,d)}function St(e){return(e>0)-(e<0)||+e}function Dt(){if(!this.isValid())return this.localeData().invalidDate();var e,t,n,s=Ds(this._milliseconds)/1e3,i=Ds(this._days),r=Ds(this._months);t=p((e=p(s/60))/60),s%=60,e%=60;var a=n=p(r/12),o=r%=12,u=i,l=t,d=e,h=s?s.toFixed(3).replace(/\.?0+$/,""):"",c=this.asSeconds();if(!c)return"P0D";var f=c<0?"-":"",m=St(this._months)!==St(c)?"-":"",_=St(this._days)!==St(c)?"-":"",y=St(this._milliseconds)!==St(c)?"-":"";return f+"P"+(a?m+a+"Y":"")+(o?m+o+"M":"")+(u?_+u+"D":"")+(l||d||h?"T":"")+(l?y+l+"H":"")+(d?y+d+"M":"")+(h?y+h+"S":"")}var Yt,Ot;Ot=Array.prototype.some?Array.prototype.some:function(e){for(var t=Object(this),n=t.length>>>0,s=0;s<n;s++)if(s in t&&e.call(this,t[s],s,t))return!0;return!1};var xt=e.momentProperties=[],Tt=!1,bt={};e.suppressDeprecationWarnings=!1,e.deprecationHandler=null;var Pt;Pt=Object.keys?Object.keys:function(e){var t,n=[];for(t in e)u(e,t)&&n.push(t);return n};var Wt={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},Rt={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},Ct=/\d{1,2}/,Ft={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Ut={},Nt={},Ht=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Lt=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Gt={},Vt={},jt=/\d/,It=/\d\d/,Et=/\d{3}/,At=/\d{4}/,zt=/[+-]?\d{6}/,Zt=/\d\d?/,$t=/\d\d\d\d?/,qt=/\d\d\d\d\d\d?/,Jt=/\d{1,3}/,Bt=/\d{1,4}/,Qt=/[+-]?\d{1,6}/,Xt=/\d+/,Kt=/[+-]?\d+/,en=/Z|[+-]\d\d:?\d\d/gi,tn=/Z|[+-]\d\d(?::?\d\d)?/gi,nn=/[+-]?\d+(\.\d{1,3})?/,sn=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,rn={},an={},on=0,un=1,ln=2,dn=3,hn=4,cn=5,fn=6,mn=7,_n=8;C("Y",0,0,function(){var e=this.year();return e<=9999?""+e:"+"+e}),C(0,["YY",2],0,function(){return this.year()%100}),C(0,["YYYY",4],0,"year"),C(0,["YYYYY",5],0,"year"),C(0,["YYYYYY",6,!0],0,"year"),x("year","y"),P("year",1),L("Y",Kt),L("YY",Zt,It),L("YYYY",Bt,At),L("YYYYY",Qt,zt),L("YYYYYY",Qt,zt),I(["YYYYY","YYYYYY"],on),I("YYYY",function(t,n){n[on]=2===t.length?e.parseTwoDigitYear(t):w(t)}),I("YY",function(t,n){n[on]=e.parseTwoDigitYear(t)}),I("Y",function(e,t){t[on]=parseInt(e,10)}),e.parseTwoDigitYear=function(e){return w(e)+(w(e)>68?1900:2e3)};var yn,gn=$("FullYear",!0);yn=Array.prototype.indexOf?Array.prototype.indexOf:function(e){var t;for(t=0;t<this.length;++t)if(this[t]===e)return t;return-1},C("M",["MM",2],"Mo",function(){return this.month()+1}),C("MMM",0,0,function(e){return this.localeData().monthsShort(this,e)}),C("MMMM",0,0,function(e){return this.localeData().months(this,e)}),x("month","M"),P("month",8),L("M",Zt),L("MM",Zt,It),L("MMM",function(e,t){return t.monthsShortRegex(e)}),L("MMMM",function(e,t){return t.monthsRegex(e)}),I(["M","MM"],function(e,t){t[un]=w(e)-1}),I(["MMM","MMMM"],function(e,t,n,s){var i=n._locale.monthsParse(e,s,n._strict);null!=i?t[un]=i:c(n).invalidMonth=e});var pn=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,wn="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),vn="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),Mn=sn,kn=sn;C("w",["ww",2],"wo","week"),C("W",["WW",2],"Wo","isoWeek"),x("week","w"),x("isoWeek","W"),P("week",5),P("isoWeek",5),L("w",Zt),L("ww",Zt,It),L("W",Zt),L("WW",Zt,It),E(["w","ww","W","WW"],function(e,t,n,s){t[s.substr(0,1)]=w(e)});var Sn={dow:0,doy:6};C("d",0,"do","day"),C("dd",0,0,function(e){return this.localeData().weekdaysMin(this,e)}),C("ddd",0,0,function(e){return this.localeData().weekdaysShort(this,e)}),C("dddd",0,0,function(e){return this.localeData().weekdays(this,e)}),C("e",0,0,"weekday"),C("E",0,0,"isoWeekday"),x("day","d"),x("weekday","e"),x("isoWeekday","E"),P("day",11),P("weekday",11),P("isoWeekday",11),L("d",Zt),L("e",Zt),L("E",Zt),L("dd",function(e,t){return t.weekdaysMinRegex(e)}),L("ddd",function(e,t){return t.weekdaysShortRegex(e)}),L("dddd",function(e,t){return t.weekdaysRegex(e)}),E(["dd","ddd","dddd"],function(e,t,n,s){var i=n._locale.weekdaysParse(e,s,n._strict);null!=i?t.d=i:c(n).invalidWeekday=e}),E(["d","e","E"],function(e,t,n,s){t[s]=w(e)});var Dn="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Yn="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),On="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),xn=sn,Tn=sn,bn=sn;C("H",["HH",2],0,"hour"),C("h",["hh",2],0,ce),C("k",["kk",2],0,function(){return this.hours()||24}),C("hmm",0,0,function(){return""+ce.apply(this)+R(this.minutes(),2)}),C("hmmss",0,0,function(){return""+ce.apply(this)+R(this.minutes(),2)+R(this.seconds(),2)}),C("Hmm",0,0,function(){return""+this.hours()+R(this.minutes(),2)}),C("Hmmss",0,0,function(){return""+this.hours()+R(this.minutes(),2)+R(this.seconds(),2)}),fe("a",!0),fe("A",!1),x("hour","h"),P("hour",13),L("a",me),L("A",me),L("H",Zt),L("h",Zt),L("k",Zt),L("HH",Zt,It),L("hh",Zt,It),L("kk",Zt,It),L("hmm",$t),L("hmmss",qt),L("Hmm",$t),L("Hmmss",qt),I(["H","HH"],dn),I(["k","kk"],function(e,t,n){var s=w(e);t[dn]=24===s?0:s}),I(["a","A"],function(e,t,n){n._isPm=n._locale.isPM(e),n._meridiem=e}),I(["h","hh"],function(e,t,n){t[dn]=w(e),c(n).bigHour=!0}),I("hmm",function(e,t,n){var s=e.length-2;t[dn]=w(e.substr(0,s)),t[hn]=w(e.substr(s)),c(n).bigHour=!0}),I("hmmss",function(e,t,n){var s=e.length-4,i=e.length-2;t[dn]=w(e.substr(0,s)),t[hn]=w(e.substr(s,2)),t[cn]=w(e.substr(i)),c(n).bigHour=!0}),I("Hmm",function(e,t,n){var s=e.length-2;t[dn]=w(e.substr(0,s)),t[hn]=w(e.substr(s))}),I("Hmmss",function(e,t,n){var s=e.length-4,i=e.length-2;t[dn]=w(e.substr(0,s)),t[hn]=w(e.substr(s,2)),t[cn]=w(e.substr(i))});var Pn,Wn=/[ap]\.?m?\.?/i,Rn=$("Hours",!0),Cn={calendar:Wt,longDateFormat:Rt,invalidDate:"Invalid date",ordinal:"%d",dayOfMonthOrdinalParse:Ct,relativeTime:Ft,months:wn,monthsShort:vn,week:Sn,weekdays:Dn,weekdaysMin:On,weekdaysShort:Yn,meridiemParse:Wn},Fn={},Un={},Nn=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Hn=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Ln=/Z|[+-]\d\d(?::?\d\d)?/,Gn=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],Vn=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],jn=/^\/?Date\((\-?\d+)/i,In=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,En={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};e.createFromInputFallback=k("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))}),e.ISO_8601=function(){},e.RFC_2822=function(){};var An=k("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=Ie.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:m()}),zn=k("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=Ie.apply(null,arguments);return this.isValid()&&e.isValid()?e>this?this:e:m()}),Zn=["year","quarter","month","week","day","hour","minute","second","millisecond"];qe("Z",":"),qe("ZZ",""),L("Z",tn),L("ZZ",tn),I(["Z","ZZ"],function(e,t,n){n._useUTC=!0,n._tzm=Je(tn,e)});var $n=/([\+\-]|\d\d)/gi;e.updateOffset=function(){};var qn=/^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,Jn=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;Ke.fn=ze.prototype,Ke.invalid=function(){return Ke(NaN)};var Bn=st(1,"add"),Qn=st(-1,"subtract");e.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",e.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var Xn=k("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(e){return void 0===e?this.localeData():this.locale(e)});C(0,["gg",2],0,function(){return this.weekYear()%100}),C(0,["GG",2],0,function(){return this.isoWeekYear()%100}),ut("gggg","weekYear"),ut("ggggg","weekYear"),ut("GGGG","isoWeekYear"),ut("GGGGG","isoWeekYear"),x("weekYear","gg"),x("isoWeekYear","GG"),P("weekYear",1),P("isoWeekYear",1),L("G",Kt),L("g",Kt),L("GG",Zt,It),L("gg",Zt,It),L("GGGG",Bt,At),L("gggg",Bt,At),L("GGGGG",Qt,zt),L("ggggg",Qt,zt),E(["gggg","ggggg","GGGG","GGGGG"],function(e,t,n,s){t[s.substr(0,2)]=w(e)}),E(["gg","GG"],function(t,n,s,i){n[i]=e.parseTwoDigitYear(t)}),C("Q",0,"Qo","quarter"),x("quarter","Q"),P("quarter",7),L("Q",jt),I("Q",function(e,t){t[un]=3*(w(e)-1)}),C("D",["DD",2],"Do","date"),x("date","D"),P("date",9),L("D",Zt),L("DD",Zt,It),L("Do",function(e,t){return e?t._dayOfMonthOrdinalParse||t._ordinalParse:t._dayOfMonthOrdinalParseLenient}),I(["D","DD"],ln),I("Do",function(e,t){t[ln]=w(e.match(Zt)[0],10)});var Kn=$("Date",!0);C("DDD",["DDDD",3],"DDDo","dayOfYear"),x("dayOfYear","DDD"),P("dayOfYear",4),L("DDD",Jt),L("DDDD",Et),I(["DDD","DDDD"],function(e,t,n){n._dayOfYear=w(e)}),C("m",["mm",2],0,"minute"),x("minute","m"),P("minute",14),L("m",Zt),L("mm",Zt,It),I(["m","mm"],hn);var es=$("Minutes",!1);C("s",["ss",2],0,"second"),x("second","s"),P("second",15),L("s",Zt),L("ss",Zt,It),I(["s","ss"],cn);var ts=$("Seconds",!1);C("S",0,0,function(){return~~(this.millisecond()/100)}),C(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),C(0,["SSS",3],0,"millisecond"),C(0,["SSSS",4],0,function(){return 10*this.millisecond()}),C(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),C(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),C(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),C(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),C(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),x("millisecond","ms"),P("millisecond",16),L("S",Jt,jt),L("SS",Jt,It),L("SSS",Jt,Et);var ns;for(ns="SSSS";ns.length<=9;ns+="S")L(ns,Xt);for(ns="S";ns.length<=9;ns+="S")I(ns,function(e,t){t[fn]=w(1e3*("0."+e))});var ss=$("Milliseconds",!1);C("z",0,0,"zoneAbbr"),C("zz",0,0,"zoneName");var is=y.prototype;is.add=Bn,is.calendar=function(t,n){var s=t||Ie(),i=Be(s,this).startOf("day"),r=e.calendarFormat(this,i)||"sameElse",a=n&&(D(n[r])?n[r].call(this,s):n[r]);return this.format(a||this.localeData().calendar(r,this,Ie(s)))},is.clone=function(){return new y(this)},is.diff=function(e,t,n){var s,i,r;if(!this.isValid())return NaN;if(!(s=Be(e,this)).isValid())return NaN;switch(i=6e4*(s.utcOffset()-this.utcOffset()),t=T(t)){case"year":r=rt(this,s)/12;break;case"month":r=rt(this,s);break;case"quarter":r=rt(this,s)/3;break;case"second":r=(this-s)/1e3;break;case"minute":r=(this-s)/6e4;break;case"hour":r=(this-s)/36e5;break;case"day":r=(this-s-i)/864e5;break;case"week":r=(this-s-i)/6048e5;break;default:r=this-s}return n?r:p(r)},is.endOf=function(e){return void 0===(e=T(e))||"millisecond"===e?this:("date"===e&&(e="day"),this.startOf(e).add(1,"isoWeek"===e?"week":e).subtract(1,"ms"))},is.format=function(t){t||(t=this.isUtc()?e.defaultFormatUtc:e.defaultFormat);var n=N(this,t);return this.localeData().postformat(n)},is.from=function(e,t){return this.isValid()&&(g(e)&&e.isValid()||Ie(e).isValid())?Ke({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()},is.fromNow=function(e){return this.from(Ie(),e)},is.to=function(e,t){return this.isValid()&&(g(e)&&e.isValid()||Ie(e).isValid())?Ke({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()},is.toNow=function(e){return this.to(Ie(),e)},is.get=function(e){return e=T(e),D(this[e])?this[e]():this},is.invalidAt=function(){return c(this).overflow},is.isAfter=function(e,t){var n=g(e)?e:Ie(e);return!(!this.isValid()||!n.isValid())&&("millisecond"===(t=T(i(t)?"millisecond":t))?this.valueOf()>n.valueOf():n.valueOf()<this.clone().startOf(t).valueOf())},is.isBefore=function(e,t){var n=g(e)?e:Ie(e);return!(!this.isValid()||!n.isValid())&&("millisecond"===(t=T(i(t)?"millisecond":t))?this.valueOf()<n.valueOf():this.clone().endOf(t).valueOf()<n.valueOf())},is.isBetween=function(e,t,n,s){return("("===(s=s||"()")[0]?this.isAfter(e,n):!this.isBefore(e,n))&&(")"===s[1]?this.isBefore(t,n):!this.isAfter(t,n))},is.isSame=function(e,t){var n,s=g(e)?e:Ie(e);return!(!this.isValid()||!s.isValid())&&("millisecond"===(t=T(t||"millisecond"))?this.valueOf()===s.valueOf():(n=s.valueOf(),this.clone().startOf(t).valueOf()<=n&&n<=this.clone().endOf(t).valueOf()))},is.isSameOrAfter=function(e,t){return this.isSame(e,t)||this.isAfter(e,t)},is.isSameOrBefore=function(e,t){return this.isSame(e,t)||this.isBefore(e,t)},is.isValid=function(){return f(this)},is.lang=Xn,is.locale=at,is.localeData=ot,is.max=zn,is.min=An,is.parsingFlags=function(){return l({},c(this))},is.set=function(e,t){if("object"==typeof e)for(var n=W(e=b(e)),s=0;s<n.length;s++)this[n[s].unit](e[n[s].unit]);else if(e=T(e),D(this[e]))return this[e](t);return this},is.startOf=function(e){switch(e=T(e)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":case"date":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===e&&this.weekday(0),"isoWeek"===e&&this.isoWeekday(1),"quarter"===e&&this.month(3*Math.floor(this.month()/3)),this},is.subtract=Qn,is.toArray=function(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]},is.toObject=function(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}},is.toDate=function(){return new Date(this.valueOf())},is.toISOString=function(){if(!this.isValid())return null;var e=this.clone().utc();return e.year()<0||e.year()>9999?N(e,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):D(Date.prototype.toISOString)?this.toDate().toISOString():N(e,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},is.inspect=function(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var e="moment",t="";this.isLocal()||(e=0===this.utcOffset()?"moment.utc":"moment.parseZone",t="Z");var n="["+e+'("]',s=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",i=t+'[")]';return this.format(n+s+"-MM-DD[T]HH:mm:ss.SSS"+i)},is.toJSON=function(){return this.isValid()?this.toISOString():null},is.toString=function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},is.unix=function(){return Math.floor(this.valueOf()/1e3)},is.valueOf=function(){return this._d.valueOf()-6e4*(this._offset||0)},is.creationData=function(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}},is.year=gn,is.isLeapYear=function(){return Z(this.year())},is.weekYear=function(e){return lt.call(this,e,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)},is.isoWeekYear=function(e){return lt.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)},is.quarter=is.quarters=function(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)},is.month=ee,is.daysInMonth=function(){return Q(this.year(),this.month())},is.week=is.weeks=function(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")},is.isoWeek=is.isoWeeks=function(e){var t=ae(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")},is.weeksInYear=function(){var e=this.localeData()._week;return oe(this.year(),e.dow,e.doy)},is.isoWeeksInYear=function(){return oe(this.year(),1,4)},is.date=Kn,is.day=is.days=function(e){if(!this.isValid())return null!=e?this:NaN;var t=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=e?(e=ue(e,this.localeData()),this.add(e-t,"d")):t},is.weekday=function(e){if(!this.isValid())return null!=e?this:NaN;var t=(this.day()+7-this.localeData()._week.dow)%7;return null==e?t:this.add(e-t,"d")},is.isoWeekday=function(e){if(!this.isValid())return null!=e?this:NaN;if(null!=e){var t=le(e,this.localeData());return this.day(this.day()%7?t:t-7)}return this.day()||7},is.dayOfYear=function(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")},is.hour=is.hours=Rn,is.minute=is.minutes=es,is.second=is.seconds=ts,is.millisecond=is.milliseconds=ss,is.utcOffset=function(t,n,s){var i,r=this._offset||0;if(!this.isValid())return null!=t?this:NaN;if(null!=t){if("string"==typeof t){if(null===(t=Je(tn,t)))return this}else Math.abs(t)<16&&!s&&(t*=60);return!this._isUTC&&n&&(i=Qe(this)),this._offset=t,this._isUTC=!0,null!=i&&this.add(i,"m"),r!==t&&(!n||this._changeInProgress?it(this,Ke(t-r,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,e.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?r:Qe(this)},is.utc=function(e){return this.utcOffset(0,e)},is.local=function(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract(Qe(this),"m")),this},is.parseZone=function(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var e=Je(en,this._i);null!=e?this.utcOffset(e):this.utcOffset(0,!0)}return this},is.hasAlignedHourOffset=function(e){return!!this.isValid()&&(e=e?Ie(e).utcOffset():0,(this.utcOffset()-e)%60==0)},is.isDST=function(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()},is.isLocal=function(){return!!this.isValid()&&!this._isUTC},is.isUtcOffset=function(){return!!this.isValid()&&this._isUTC},is.isUtc=Xe,is.isUTC=Xe,is.zoneAbbr=function(){return this._isUTC?"UTC":""},is.zoneName=function(){return this._isUTC?"Coordinated Universal Time":""},is.dates=k("dates accessor is deprecated. Use date instead.",Kn),is.months=k("months accessor is deprecated. Use month instead",ee),is.years=k("years accessor is deprecated. Use year instead",gn),is.zone=k("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",function(e,t){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,t),this):-this.utcOffset()}),is.isDSTShifted=k("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",function(){if(!i(this._isDSTShifted))return this._isDSTShifted;var e={};if(_(e,this),(e=Ge(e))._a){var t=e._isUTC?d(e._a):Ie(e._a);this._isDSTShifted=this.isValid()&&v(e._a,t.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted});var rs=O.prototype;rs.calendar=function(e,t,n){var s=this._calendar[e]||this._calendar.sameElse;return D(s)?s.call(t,n):s},rs.longDateFormat=function(e){var t=this._longDateFormat[e],n=this._longDateFormat[e.toUpperCase()];return t||!n?t:(this._longDateFormat[e]=n.replace(/MMMM|MM|DD|dddd/g,function(e){return e.slice(1)}),this._longDateFormat[e])},rs.invalidDate=function(){return this._invalidDate},rs.ordinal=function(e){return this._ordinal.replace("%d",e)},rs.preparse=ht,rs.postformat=ht,rs.relativeTime=function(e,t,n,s){var i=this._relativeTime[n];return D(i)?i(e,t,n,s):i.replace(/%d/i,e)},rs.pastFuture=function(e,t){var n=this._relativeTime[e>0?"future":"past"];return D(n)?n(t):n.replace(/%s/i,t)},rs.set=function(e){var t,n;for(n in e)D(t=e[n])?this[n]=t:this["_"+n]=t;this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)},rs.months=function(e,n){return e?t(this._months)?this._months[e.month()]:this._months[(this._months.isFormat||pn).test(n)?"format":"standalone"][e.month()]:t(this._months)?this._months:this._months.standalone},rs.monthsShort=function(e,n){return e?t(this._monthsShort)?this._monthsShort[e.month()]:this._monthsShort[pn.test(n)?"format":"standalone"][e.month()]:t(this._monthsShort)?this._monthsShort:this._monthsShort.standalone},rs.monthsParse=function(e,t,n){var s,i,r;if(this._monthsParseExact)return X.call(this,e,t,n);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),s=0;s<12;s++){if(i=d([2e3,s]),n&&!this._longMonthsParse[s]&&(this._longMonthsParse[s]=new RegExp("^"+this.months(i,"").replace(".","")+"$","i"),this._shortMonthsParse[s]=new RegExp("^"+this.monthsShort(i,"").replace(".","")+"$","i")),n||this._monthsParse[s]||(r="^"+this.months(i,"")+"|^"+this.monthsShort(i,""),this._monthsParse[s]=new RegExp(r.replace(".",""),"i")),n&&"MMMM"===t&&this._longMonthsParse[s].test(e))return s;if(n&&"MMM"===t&&this._shortMonthsParse[s].test(e))return s;if(!n&&this._monthsParse[s].test(e))return s}},rs.monthsRegex=function(e){return this._monthsParseExact?(u(this,"_monthsRegex")||te.call(this),e?this._monthsStrictRegex:this._monthsRegex):(u(this,"_monthsRegex")||(this._monthsRegex=kn),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)},rs.monthsShortRegex=function(e){return this._monthsParseExact?(u(this,"_monthsRegex")||te.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(u(this,"_monthsShortRegex")||(this._monthsShortRegex=Mn),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)},rs.week=function(e){return ae(e,this._week.dow,this._week.doy).week},rs.firstDayOfYear=function(){return this._week.doy},rs.firstDayOfWeek=function(){return this._week.dow},rs.weekdays=function(e,n){return e?t(this._weekdays)?this._weekdays[e.day()]:this._weekdays[this._weekdays.isFormat.test(n)?"format":"standalone"][e.day()]:t(this._weekdays)?this._weekdays:this._weekdays.standalone},rs.weekdaysMin=function(e){return e?this._weekdaysMin[e.day()]:this._weekdaysMin},rs.weekdaysShort=function(e){return e?this._weekdaysShort[e.day()]:this._weekdaysShort},rs.weekdaysParse=function(e,t,n){var s,i,r;if(this._weekdaysParseExact)return de.call(this,e,t,n);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),s=0;s<7;s++){if(i=d([2e3,1]).day(s),n&&!this._fullWeekdaysParse[s]&&(this._fullWeekdaysParse[s]=new RegExp("^"+this.weekdays(i,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[s]=new RegExp("^"+this.weekdaysShort(i,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[s]=new RegExp("^"+this.weekdaysMin(i,"").replace(".",".?")+"$","i")),this._weekdaysParse[s]||(r="^"+this.weekdays(i,"")+"|^"+this.weekdaysShort(i,"")+"|^"+this.weekdaysMin(i,""),this._weekdaysParse[s]=new RegExp(r.replace(".",""),"i")),n&&"dddd"===t&&this._fullWeekdaysParse[s].test(e))return s;if(n&&"ddd"===t&&this._shortWeekdaysParse[s].test(e))return s;if(n&&"dd"===t&&this._minWeekdaysParse[s].test(e))return s;if(!n&&this._weekdaysParse[s].test(e))return s}},rs.weekdaysRegex=function(e){return this._weekdaysParseExact?(u(this,"_weekdaysRegex")||he.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(u(this,"_weekdaysRegex")||(this._weekdaysRegex=xn),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)},rs.weekdaysShortRegex=function(e){return this._weekdaysParseExact?(u(this,"_weekdaysRegex")||he.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(u(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=Tn),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)},rs.weekdaysMinRegex=function(e){return this._weekdaysParseExact?(u(this,"_weekdaysRegex")||he.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(u(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=bn),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)},rs.isPM=function(e){return"p"===(e+"").toLowerCase().charAt(0)},rs.meridiem=function(e,t,n){return e>11?n?"pm":"PM":n?"am":"AM"},pe("en",{dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10;return e+(1===w(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th")}}),e.lang=k("moment.lang is deprecated. Use moment.locale instead.",pe),e.langData=k("moment.langData is deprecated. Use moment.localeData instead.",ve);var as=Math.abs,os=wt("ms"),us=wt("s"),ls=wt("m"),ds=wt("h"),hs=wt("d"),cs=wt("w"),fs=wt("M"),ms=wt("y"),_s=vt("milliseconds"),ys=vt("seconds"),gs=vt("minutes"),ps=vt("hours"),ws=vt("days"),vs=vt("months"),Ms=vt("years"),ks=Math.round,Ss={ss:44,s:45,m:45,h:22,d:26,M:11},Ds=Math.abs,Ys=ze.prototype;return Ys.isValid=function(){return this._isValid},Ys.abs=function(){var e=this._data;return this._milliseconds=as(this._milliseconds),this._days=as(this._days),this._months=as(this._months),e.milliseconds=as(e.milliseconds),e.seconds=as(e.seconds),e.minutes=as(e.minutes),e.hours=as(e.hours),e.months=as(e.months),e.years=as(e.years),this},Ys.add=function(e,t){return _t(this,e,t,1)},Ys.subtract=function(e,t){return _t(this,e,t,-1)},Ys.as=function(e){if(!this.isValid())return NaN;var t,n,s=this._milliseconds;if("month"===(e=T(e))||"year"===e)return t=this._days+s/864e5,n=this._months+gt(t),"month"===e?n:n/12;switch(t=this._days+Math.round(pt(this._months)),e){case"week":return t/7+s/6048e5;case"day":return t+s/864e5;case"hour":return 24*t+s/36e5;case"minute":return 1440*t+s/6e4;case"second":return 86400*t+s/1e3;case"millisecond":return Math.floor(864e5*t)+s;default:throw new Error("Unknown unit "+e)}},Ys.asMilliseconds=os,Ys.asSeconds=us,Ys.asMinutes=ls,Ys.asHours=ds,Ys.asDays=hs,Ys.asWeeks=cs,Ys.asMonths=fs,Ys.asYears=ms,Ys.valueOf=function(){return this.isValid()?this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*w(this._months/12):NaN},Ys._bubble=function(){var e,t,n,s,i,r=this._milliseconds,a=this._days,o=this._months,u=this._data;return r>=0&&a>=0&&o>=0||r<=0&&a<=0&&o<=0||(r+=864e5*yt(pt(o)+a),a=0,o=0),u.milliseconds=r%1e3,e=p(r/1e3),u.seconds=e%60,t=p(e/60),u.minutes=t%60,n=p(t/60),u.hours=n%24,a+=p(n/24),i=p(gt(a)),o+=i,a-=yt(pt(i)),s=p(o/12),o%=12,u.days=a,u.months=o,u.years=s,this},Ys.clone=function(){return Ke(this)},Ys.get=function(e){return e=T(e),this.isValid()?this[e+"s"]():NaN},Ys.milliseconds=_s,Ys.seconds=ys,Ys.minutes=gs,Ys.hours=ps,Ys.days=ws,Ys.weeks=function(){return p(this.days()/7)},Ys.months=vs,Ys.years=Ms,Ys.humanize=function(e){if(!this.isValid())return this.localeData().invalidDate();var t=this.localeData(),n=kt(this,!e,t);return e&&(n=t.pastFuture(+this,n)),t.postformat(n)},Ys.toISOString=Dt,Ys.toString=Dt,Ys.toJSON=Dt,Ys.locale=at,Ys.localeData=ot,Ys.toIsoString=k("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",Dt),Ys.lang=Xn,C("X",0,0,"unix"),C("x",0,0,"valueOf"),L("x",Kt),L("X",nn),I("X",function(e,t,n){n._d=new Date(1e3*parseFloat(e,10))}),I("x",function(e,t,n){n._d=new Date(w(e))}),e.version="2.19.1",function(e){Yt=e}(Ie),e.fn=is,e.min=function(){return Ee("isBefore",[].slice.call(arguments,0))},e.max=function(){return Ee("isAfter",[].slice.call(arguments,0))},e.now=function(){return Date.now?Date.now():+new Date},e.utc=d,e.unix=function(e){return Ie(1e3*e)},e.months=function(e,t){return ft(e,t,"months")},e.isDate=a,e.locale=pe,e.invalid=m,e.duration=Ke,e.isMoment=g,e.weekdays=function(e,t,n){return mt(e,t,n,"weekdays")},e.parseZone=function(){return Ie.apply(null,arguments).parseZone()},e.localeData=ve,e.isDuration=Ze,e.monthsShort=function(e,t){return ft(e,t,"monthsShort")},e.weekdaysMin=function(e,t,n){return mt(e,t,n,"weekdaysMin")},e.defineLocale=we,e.updateLocale=function(e,t){if(null!=t){var n,s=Cn;null!=Fn[e]&&(s=Fn[e]._config),(n=new O(t=Y(s,t))).parentLocale=Fn[e],Fn[e]=n,pe(e)}else null!=Fn[e]&&(null!=Fn[e].parentLocale?Fn[e]=Fn[e].parentLocale:null!=Fn[e]&&delete Fn[e]);return Fn[e]},e.locales=function(){return Pt(Fn)},e.weekdaysShort=function(e,t,n){return mt(e,t,n,"weekdaysShort")},e.normalizeUnits=T,e.relativeTimeRounding=function(e){return void 0===e?ks:"function"==typeof e&&(ks=e,!0)},e.relativeTimeThreshold=function(e,t){return void 0!==Ss[e]&&(void 0===t?Ss[e]:(Ss[e]=t,"s"===e&&(Ss.ss=t-1),!0))},e.calendarFormat=function(e,t){var n=e.diff(t,"days",!0);return n<-6?"sameElse":n<-1?"lastWeek":n<0?"lastDay":n<1?"sameDay":n<2?"nextDay":n<7?"nextWeek":"sameElse"},e.prototype=is,e});

var BB = BB || {};

BB.version = '1.0.1';

BB.libs = {};

BB.transactions = BB.transactions || {};
Boolean.prototype.toNumber = function(){
    return + this;
}
String.prototype.toRegExp = function(){
    var parts = this.split('/'),
        regex = this,
        options = "";
    if (parts.length == 3) {
        regex = parts[1];
        options = parts[2];
    } else {
        return false;
    }
    try {
        return new RegExp(regex, options);
    }
    catch(e) {
        return false;
    }
}
String.prototype.isRegExp = function(){
    return this.toRegExp() instanceof RegExp;
}
Object.isValidType = function(){
    return arguments[0] instanceof arguments[1];
}

Object.compare = function (obj1, obj2) {
    //Loop through properties in object 1
    for (var p in obj1) {
        //Check property exists on both objects
        if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

        switch (typeof (obj1[p])) {
            //Deep compare objects
            case 'object':
                if (!Object.compare(obj1[p], obj2[p])) return false;
                break;
            //Compare function code
            case 'function':
                if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
                break;
            //Compare values
            default:
                if (obj1[p] != obj2[p]) return false;
        }
    }

    //Check object 2 for any extra properties
    for (var p in obj2) {
        if (typeof (obj1[p]) == 'undefined') return false;
    }
    return true;
};

function Environment(){ }
Environment.isSs1 = function(){
    return typeof define !== 'function' && typeof require !== 'function';
}
Environment.isSs2 = function(){
    return typeof define === 'function' && typeof require === 'function';
}

function Converters() {}
Converters.toBase64String = function(str){
    var encrypted = str;
    if(Environment.isSs1()) {
        encrypted = nlapiEncrypt(str, 'base64');
    }
    else if(Environment.isSs2()){
        require(['N/encode'], function(encode){
            encrypted = encode.convert({string: str, inputEncoding: encode.Encoding.UTF_8, outputEncoding: encode.Encoding.BASE_64});
        });
    }
    return encrypted;
}
Converters.toNumber = function(){
    var _number = parseInt(arguments[0]);
    if(isNaN(_number)){
        return 0;
    }
    return _number;
}
function Iso (){}
Object.defineProperties(Iso, {
    'countries': {
        writable: false,
        enumerable: true,
        value: new IsoCountries()
    }
});

function IsoCountries(){
    var _this = this,
        _countries = [
            {
                "name": "Afghanistan",
                "alpha2": "AF",
                "alpha3": "AFG",
                "countrycode": "004",
                "iso": "ISO 3166-2:AF",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Åland Islands",
                "alpha2": "AX",
                "alpha3": "ALA",
                "countrycode": "248",
                "iso": "ISO 3166-2:AX",
                "subregioncode": "154",
                "regioncode": "150",
                "subregion": "Northern Europe",
                "region": "Europe"
            },
            {
                "name": "Albania",
                "alpha2": "AL",
                "alpha3": "ALB",
                "countrycode": "008",
                "iso": "ISO 3166-2:AL",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Algeria",
                "alpha2": "DZ",
                "alpha3": "DZA",
                "countrycode": "012",
                "iso": "ISO 3166-2:DZ",
                "region": "Africa",
                "subregion": "Northern Africa",
                "regioncode": "002",
                "subregioncode": "015"
            },
            {
                "name": "American Samoa",
                "alpha2": "AS",
                "alpha3": "ASM",
                "countrycode": "016",
                "iso": "ISO 3166-2:AS",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "Andorra",
                "alpha2": "AD",
                "alpha3": "AND",
                "countrycode": "020",
                "iso": "ISO 3166-2:AD",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Angola",
                "alpha2": "AO",
                "alpha3": "AGO",
                "countrycode": "024",
                "iso": "ISO 3166-2:AO",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Anguilla",
                "alpha2": "AI",
                "alpha3": "AIA",
                "countrycode": "660",
                "iso": "ISO 3166-2:AI",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Antarctica",
                "alpha2": "AQ",
                "alpha3": "ATA",
                "countrycode": "010",
                "iso": "ISO 3166-2:AQ",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "Antigua and Barbuda",
                "alpha2": "AG",
                "alpha3": "ATG",
                "countrycode": "028",
                "iso": "ISO 3166-2:AG",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Argentina",
                "alpha2": "AR",
                "alpha3": "ARG",
                "countrycode": "032",
                "iso": "ISO 3166-2:AR",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Armenia",
                "alpha2": "AM",
                "alpha3": "ARM",
                "countrycode": "051",
                "iso": "ISO 3166-2:AM",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Aruba",
                "alpha2": "AW",
                "alpha3": "ABW",
                "countrycode": "533",
                "iso": "ISO 3166-2:AW",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Australia",
                "alpha2": "AU",
                "alpha3": "AUS",
                "countrycode": "036",
                "iso": "ISO 3166-2:AU",
                "region": "Oceania",
                "subregion": "Australia and New Zealand",
                "regioncode": "009",
                "subregioncode": "053"
            },
            {
                "name": "Austria",
                "alpha2": "AT",
                "alpha3": "AUT",
                "countrycode": "040",
                "iso": "ISO 3166-2:AT",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "Azerbaijan",
                "alpha2": "AZ",
                "alpha3": "AZE",
                "countrycode": "031",
                "iso": "ISO 3166-2:AZ",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Bahamas",
                "alpha2": "BS",
                "alpha3": "BHS",
                "countrycode": "044",
                "iso": "ISO 3166-2:BS",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Bahrain",
                "alpha2": "BH",
                "alpha3": "BHR",
                "countrycode": "048",
                "iso": "ISO 3166-2:BH",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Bangladesh",
                "alpha2": "BD",
                "alpha3": "BGD",
                "countrycode": "050",
                "iso": "ISO 3166-2:BD",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Barbados",
                "alpha2": "BB",
                "alpha3": "BRB",
                "countrycode": "052",
                "iso": "ISO 3166-2:BB",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Belarus",
                "alpha2": "BY",
                "alpha3": "BLR",
                "countrycode": "112",
                "iso": "ISO 3166-2:BY",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Belgium",
                "alpha2": "BE",
                "alpha3": "BEL",
                "countrycode": "056",
                "iso": "ISO 3166-2:BE",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "Belize",
                "alpha2": "BZ",
                "alpha3": "BLZ",
                "countrycode": "084",
                "iso": "ISO 3166-2:BZ",
                "region": "Americas",
                "subregion": "Central America",
                "regioncode": "019",
                "subregioncode": "013"
            },
            {
                "name": "Benin",
                "alpha2": "BJ",
                "alpha3": "BEN",
                "countrycode": "204",
                "iso": "ISO 3166-2:BJ",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Bermuda",
                "alpha2": "BM",
                "alpha3": "BMU",
                "countrycode": "060",
                "iso": "ISO 3166-2:BM",
                "region": "Americas",
                "subregion": "Northern America",
                "regioncode": "019",
                "subregioncode": "021"
            },
            {
                "name": "Bhutan",
                "alpha2": "BT",
                "alpha3": "BTN",
                "countrycode": "064",
                "iso": "ISO 3166-2:BT",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Bolivia (Plurinational State of)",
                "alpha2": "BO",
                "alpha3": "BOL",
                "countrycode": "068",
                "iso": "ISO 3166-2:BO",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Bonaire, Sint Eustatius and Saba",
                "alpha2": "BQ",
                "alpha3": "BES",
                "countrycode": "535",
                "iso": "ISO 3166-2:BQ",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Bosnia and Herzegovina",
                "alpha2": "BA",
                "alpha3": "BIH",
                "countrycode": "070",
                "iso": "ISO 3166-2:BA",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Botswana",
                "alpha2": "BW",
                "alpha3": "BWA",
                "countrycode": "072",
                "iso": "ISO 3166-2:BW",
                "region": "Africa",
                "subregion": "Southern Africa",
                "regioncode": "002",
                "subregioncode": "018"
            },
            {
                "name": "Bouvet Island",
                "alpha2": "BV",
                "alpha3": "BVT",
                "countrycode": "074",
                "iso": "ISO 3166-2:BV",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "Brazil",
                "alpha2": "BR",
                "alpha3": "BRA",
                "countrycode": "076",
                "iso": "ISO 3166-2:BR",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "British Indian Ocean Territory",
                "alpha2": "IO",
                "alpha3": "IOT",
                "countrycode": "086",
                "iso": "ISO 3166-2:IO",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "Brunei Darussalam",
                "alpha2": "BN",
                "alpha3": "BRN",
                "countrycode": "096",
                "iso": "ISO 3166-2:BN",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Bulgaria",
                "alpha2": "BG",
                "alpha3": "BGR",
                "countrycode": "100",
                "iso": "ISO 3166-2:BG",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Burkina Faso",
                "alpha2": "BF",
                "alpha3": "BFA",
                "countrycode": "854",
                "iso": "ISO 3166-2:BF",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Burundi",
                "alpha2": "BI",
                "alpha3": "BDI",
                "countrycode": "108",
                "iso": "ISO 3166-2:BI",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Cambodia",
                "alpha2": "KH",
                "alpha3": "KHM",
                "countrycode": "116",
                "iso": "ISO 3166-2:KH",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Cameroon",
                "alpha2": "CM",
                "alpha3": "CMR",
                "countrycode": "120",
                "iso": "ISO 3166-2:CM",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Canada",
                "alpha2": "CA",
                "alpha3": "CAN",
                "countrycode": "124",
                "iso": "ISO 3166-2:CA",
                "region": "Americas",
                "subregion": "Northern America",
                "regioncode": "019",
                "subregioncode": "021"
            },
            {
                "name": "Cabo Verde",
                "alpha2": "CV",
                "alpha3": "CPV",
                "countrycode": "132",
                "iso": "ISO 3166-2:CV",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Cayman Islands",
                "alpha2": "KY",
                "alpha3": "CYM",
                "countrycode": "136",
                "iso": "ISO 3166-2:KY",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Central African Republic",
                "alpha2": "CF",
                "alpha3": "CAF",
                "countrycode": "140",
                "iso": "ISO 3166-2:CF",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Chad",
                "alpha2": "TD",
                "alpha3": "TCD",
                "countrycode": "148",
                "iso": "ISO 3166-2:TD",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Chile",
                "alpha2": "CL",
                "alpha3": "CHL",
                "countrycode": "152",
                "iso": "ISO 3166-2:CL",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "China",
                "alpha2": "CN",
                "alpha3": "CHN",
                "countrycode": "156",
                "iso": "ISO 3166-2:CN",
                "region": "Asia",
                "subregion": "Eastern Asia",
                "regioncode": "142",
                "subregioncode": "030"
            },
            {
                "name": "Christmas Island",
                "alpha2": "CX",
                "alpha3": "CXR",
                "countrycode": "162",
                "iso": "ISO 3166-2:CX",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "Cocos (Keeling) Islands",
                "alpha2": "CC",
                "alpha3": "CCK",
                "countrycode": "166",
                "iso": "ISO 3166-2:CC",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "Colombia",
                "alpha2": "CO",
                "alpha3": "COL",
                "countrycode": "170",
                "iso": "ISO 3166-2:CO",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Comoros",
                "alpha2": "KM",
                "alpha3": "COM",
                "countrycode": "174",
                "iso": "ISO 3166-2:KM",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Congo",
                "alpha2": "CG",
                "alpha3": "COG",
                "countrycode": "178",
                "iso": "ISO 3166-2:CG",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Congo (Democratic Republic of the)",
                "alpha2": "CD",
                "alpha3": "COD",
                "countrycode": "180",
                "iso": "ISO 3166-2:CD",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Cook Islands",
                "alpha2": "CK",
                "alpha3": "COK",
                "countrycode": "184",
                "iso": "ISO 3166-2:CK",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "Costa Rica",
                "alpha2": "CR",
                "alpha3": "CRI",
                "countrycode": "188",
                "iso": "ISO 3166-2:CR",
                "region": "Americas",
                "subregion": "Central America",
                "regioncode": "019",
                "subregioncode": "013"
            },
            {
                "name": "Côte d'Ivoire",
                "alpha2": "CI",
                "alpha3": "CIV",
                "countrycode": "384",
                "iso": "ISO 3166-2:CI",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Croatia",
                "alpha2": "HR",
                "alpha3": "HRV",
                "countrycode": "191",
                "iso": "ISO 3166-2:HR",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Cuba",
                "alpha2": "CU",
                "alpha3": "CUB",
                "countrycode": "192",
                "iso": "ISO 3166-2:CU",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Curaçao",
                "alpha2": "CW",
                "alpha3": "CUW",
                "countrycode": "531",
                "iso": "ISO 3166-2:CW",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Cyprus",
                "alpha2": "CY",
                "alpha3": "CYP",
                "countrycode": "196",
                "iso": "ISO 3166-2:CY",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Czech Republic",
                "alpha2": "CZ",
                "alpha3": "CZE",
                "countrycode": "203",
                "iso": "ISO 3166-2:CZ",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Denmark",
                "alpha2": "DK",
                "alpha3": "DNK",
                "countrycode": "208",
                "iso": "ISO 3166-2:DK",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Djibouti",
                "alpha2": "DJ",
                "alpha3": "DJI",
                "countrycode": "262",
                "iso": "ISO 3166-2:DJ",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Dominica",
                "alpha2": "DM",
                "alpha3": "DMA",
                "countrycode": "212",
                "iso": "ISO 3166-2:DM",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Dominican Republic",
                "alpha2": "DO",
                "alpha3": "DOM",
                "countrycode": "214",
                "iso": "ISO 3166-2:DO",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Ecuador",
                "alpha2": "EC",
                "alpha3": "ECU",
                "countrycode": "218",
                "iso": "ISO 3166-2:EC",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Egypt",
                "alpha2": "EG",
                "alpha3": "EGY",
                "countrycode": "818",
                "iso": "ISO 3166-2:EG",
                "region": "Africa",
                "subregion": "Northern Africa",
                "regioncode": "002",
                "subregioncode": "015"
            },
            {
                "name": "El Salvador",
                "alpha2": "SV",
                "alpha3": "SLV",
                "countrycode": "222",
                "iso": "ISO 3166-2:SV",
                "region": "Americas",
                "subregion": "Central America",
                "regioncode": "019",
                "subregioncode": "013"
            },
            {
                "name": "Equatorial Guinea",
                "alpha2": "GQ",
                "alpha3": "GNQ",
                "countrycode": "226",
                "iso": "ISO 3166-2:GQ",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Eritrea",
                "alpha2": "ER",
                "alpha3": "ERI",
                "countrycode": "232",
                "iso": "ISO 3166-2:ER",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Estonia",
                "alpha2": "EE",
                "alpha3": "EST",
                "countrycode": "233",
                "iso": "ISO 3166-2:EE",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Ethiopia",
                "alpha2": "ET",
                "alpha3": "ETH",
                "countrycode": "231",
                "iso": "ISO 3166-2:ET",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Falkland Islands (Malvinas)",
                "alpha2": "FK",
                "alpha3": "FLK",
                "countrycode": "238",
                "iso": "ISO 3166-2:FK",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Faroe Islands",
                "alpha2": "FO",
                "alpha3": "FRO",
                "countrycode": "234",
                "iso": "ISO 3166-2:FO",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Fiji",
                "alpha2": "FJ",
                "alpha3": "FJI",
                "countrycode": "242",
                "iso": "ISO 3166-2:FJ",
                "region": "Oceania",
                "subregion": "Melanesia",
                "regioncode": "009",
                "subregioncode": "054"
            },
            {
                "name": "Finland",
                "alpha2": "FI",
                "alpha3": "FIN",
                "countrycode": "246",
                "iso": "ISO 3166-2:FI",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "France",
                "alpha2": "FR",
                "alpha3": "FRA",
                "countrycode": "250",
                "iso": "ISO 3166-2:FR",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "French Guiana",
                "alpha2": "GF",
                "alpha3": "GUF",
                "countrycode": "254",
                "iso": "ISO 3166-2:GF",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "French Polynesia",
                "alpha2": "PF",
                "alpha3": "PYF",
                "countrycode": "258",
                "iso": "ISO 3166-2:PF",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "French Southern Territories",
                "alpha2": "TF",
                "alpha3": "ATF",
                "countrycode": "260",
                "iso": "ISO 3166-2:TF",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "Gabon",
                "alpha2": "GA",
                "alpha3": "GAB",
                "countrycode": "266",
                "iso": "ISO 3166-2:GA",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Gambia",
                "alpha2": "GM",
                "alpha3": "GMB",
                "countrycode": "270",
                "iso": "ISO 3166-2:GM",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Georgia",
                "alpha2": "GE",
                "alpha3": "GEO",
                "countrycode": "268",
                "iso": "ISO 3166-2:GE",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Germany",
                "alpha2": "DE",
                "alpha3": "DEU",
                "countrycode": "276",
                "iso": "ISO 3166-2:DE",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "Ghana",
                "alpha2": "GH",
                "alpha3": "GHA",
                "countrycode": "288",
                "iso": "ISO 3166-2:GH",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Gibraltar",
                "alpha2": "GI",
                "alpha3": "GIB",
                "countrycode": "292",
                "iso": "ISO 3166-2:GI",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Greece",
                "alpha2": "GR",
                "alpha3": "GRC",
                "countrycode": "300",
                "iso": "ISO 3166-2:GR",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Greenland",
                "alpha2": "GL",
                "alpha3": "GRL",
                "countrycode": "304",
                "iso": "ISO 3166-2:GL",
                "region": "Americas",
                "subregion": "Northern America",
                "regioncode": "019",
                "subregioncode": "021"
            },
            {
                "name": "Grenada",
                "alpha2": "GD",
                "alpha3": "GRD",
                "countrycode": "308",
                "iso": "ISO 3166-2:GD",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Guadeloupe",
                "alpha2": "GP",
                "alpha3": "GLP",
                "countrycode": "312",
                "iso": "ISO 3166-2:GP",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Guam",
                "alpha2": "GU",
                "alpha3": "GUM",
                "countrycode": "316",
                "iso": "ISO 3166-2:GU",
                "region": "Oceania",
                "subregion": "Micronesia",
                "regioncode": "009",
                "subregioncode": "057"
            },
            {
                "name": "Guatemala",
                "alpha2": "GT",
                "alpha3": "GTM",
                "countrycode": "320",
                "iso": "ISO 3166-2:GT",
                "region": "Americas",
                "subregion": "Central America",
                "regioncode": "019",
                "subregioncode": "013"
            },
            {
                "name": "Guernsey",
                "alpha2": "GG",
                "alpha3": "GGY",
                "countrycode": "831",
                "iso": "ISO 3166-2:GG",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Guinea",
                "alpha2": "GN",
                "alpha3": "GIN",
                "countrycode": "324",
                "iso": "ISO 3166-2:GN",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Guinea-Bissau",
                "alpha2": "GW",
                "alpha3": "GNB",
                "countrycode": "624",
                "iso": "ISO 3166-2:GW",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Guyana",
                "alpha2": "GY",
                "alpha3": "GUY",
                "countrycode": "328",
                "iso": "ISO 3166-2:GY",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Haiti",
                "alpha2": "HT",
                "alpha3": "HTI",
                "countrycode": "332",
                "iso": "ISO 3166-2:HT",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Heard Island and McDonald Islands",
                "alpha2": "HM",
                "alpha3": "HMD",
                "countrycode": "334",
                "iso": "ISO 3166-2:HM",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "Holy See",
                "alpha2": "VA",
                "alpha3": "VAT",
                "countrycode": "336",
                "iso": "ISO 3166-2:VA",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Honduras",
                "alpha2": "HN",
                "alpha3": "HND",
                "countrycode": "340",
                "iso": "ISO 3166-2:HN",
                "region": "Americas",
                "subregion": "Central America",
                "regioncode": "019",
                "subregioncode": "013"
            },
            {
                "name": "Hong Kong",
                "alpha2": "HK",
                "alpha3": "HKG",
                "countrycode": "344",
                "iso": "ISO 3166-2:HK",
                "region": "Asia",
                "subregion": "Eastern Asia",
                "regioncode": "142",
                "subregioncode": "030"
            },
            {
                "name": "Hungary",
                "alpha2": "HU",
                "alpha3": "HUN",
                "countrycode": "348",
                "iso": "ISO 3166-2:HU",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Iceland",
                "alpha2": "IS",
                "alpha3": "ISL",
                "countrycode": "352",
                "iso": "ISO 3166-2:IS",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "India",
                "alpha2": "IN",
                "alpha3": "IND",
                "countrycode": "356",
                "iso": "ISO 3166-2:IN",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Indonesia",
                "alpha2": "ID",
                "alpha3": "IDN",
                "countrycode": "360",
                "iso": "ISO 3166-2:ID",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Iran (Islamic Republic of)",
                "alpha2": "IR",
                "alpha3": "IRN",
                "countrycode": "364",
                "iso": "ISO 3166-2:IR",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Iraq",
                "alpha2": "IQ",
                "alpha3": "IRQ",
                "countrycode": "368",
                "iso": "ISO 3166-2:IQ",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Ireland",
                "alpha2": "IE",
                "alpha3": "IRL",
                "countrycode": "372",
                "iso": "ISO 3166-2:IE",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Isle of Man",
                "alpha2": "IM",
                "alpha3": "IMN",
                "countrycode": "833",
                "iso": "ISO 3166-2:IM",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Israel",
                "alpha2": "IL",
                "alpha3": "ISR",
                "countrycode": "376",
                "iso": "ISO 3166-2:IL",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Italy",
                "alpha2": "IT",
                "alpha3": "ITA",
                "countrycode": "380",
                "iso": "ISO 3166-2:IT",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Jamaica",
                "alpha2": "JM",
                "alpha3": "JAM",
                "countrycode": "388",
                "iso": "ISO 3166-2:JM",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Japan",
                "alpha2": "JP",
                "alpha3": "JPN",
                "countrycode": "392",
                "iso": "ISO 3166-2:JP",
                "region": "Asia",
                "subregion": "Eastern Asia",
                "regioncode": "142",
                "subregioncode": "030"
            },
            {
                "name": "Jersey",
                "alpha2": "JE",
                "alpha3": "JEY",
                "countrycode": "832",
                "iso": "ISO 3166-2:JE",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Jordan",
                "alpha2": "JO",
                "alpha3": "JOR",
                "countrycode": "400",
                "iso": "ISO 3166-2:JO",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Kazakhstan",
                "alpha2": "KZ",
                "alpha3": "KAZ",
                "countrycode": "398",
                "iso": "ISO 3166-2:KZ",
                "region": "Asia",
                "subregion": "Central Asia",
                "regioncode": "142",
                "subregioncode": "143"
            },
            {
                "name": "Kenya",
                "alpha2": "KE",
                "alpha3": "KEN",
                "countrycode": "404",
                "iso": "ISO 3166-2:KE",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Kiribati",
                "alpha2": "KI",
                "alpha3": "KIR",
                "countrycode": "296",
                "iso": "ISO 3166-2:KI",
                "region": "Oceania",
                "subregion": "Micronesia",
                "regioncode": "009",
                "subregioncode": "057"
            },
            {
                "name": "Korea (Democratic People's Republic of)",
                "alpha2": "KP",
                "alpha3": "PRK",
                "countrycode": "408",
                "iso": "ISO 3166-2:KP",
                "region": "Asia",
                "subregion": "Eastern Asia",
                "regioncode": "142",
                "subregioncode": "030"
            },
            {
                "name": "Korea (Republic of)",
                "alpha2": "KR",
                "alpha3": "KOR",
                "countrycode": "410",
                "iso": "ISO 3166-2:KR",
                "region": "Asia",
                "subregion": "Eastern Asia",
                "regioncode": "142",
                "subregioncode": "030"
            },
            {
                "name": "Kuwait",
                "alpha2": "KW",
                "alpha3": "KWT",
                "countrycode": "414",
                "iso": "ISO 3166-2:KW",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Kyrgyzstan",
                "alpha2": "KG",
                "alpha3": "KGZ",
                "countrycode": "417",
                "iso": "ISO 3166-2:KG",
                "region": "Asia",
                "subregion": "Central Asia",
                "regioncode": "142",
                "subregioncode": "143"
            },
            {
                "name": "Lao People's Democratic Republic",
                "alpha2": "LA",
                "alpha3": "LAO",
                "countrycode": "418",
                "iso": "ISO 3166-2:LA",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Latvia",
                "alpha2": "LV",
                "alpha3": "LVA",
                "countrycode": "428",
                "iso": "ISO 3166-2:LV",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Lebanon",
                "alpha2": "LB",
                "alpha3": "LBN",
                "countrycode": "422",
                "iso": "ISO 3166-2:LB",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Lesotho",
                "alpha2": "LS",
                "alpha3": "LSO",
                "countrycode": "426",
                "iso": "ISO 3166-2:LS",
                "region": "Africa",
                "subregion": "Southern Africa",
                "regioncode": "002",
                "subregioncode": "018"
            },
            {
                "name": "Liberia",
                "alpha2": "LR",
                "alpha3": "LBR",
                "countrycode": "430",
                "iso": "ISO 3166-2:LR",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Libya",
                "alpha2": "LY",
                "alpha3": "LBY",
                "countrycode": "434",
                "iso": "ISO 3166-2:LY",
                "region": "Africa",
                "subregion": "Northern Africa",
                "regioncode": "002",
                "subregioncode": "015"
            },
            {
                "name": "Liechtenstein",
                "alpha2": "LI",
                "alpha3": "LIE",
                "countrycode": "438",
                "iso": "ISO 3166-2:LI",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "Lithuania",
                "alpha2": "LT",
                "alpha3": "LTU",
                "countrycode": "440",
                "iso": "ISO 3166-2:LT",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Luxembourg",
                "alpha2": "LU",
                "alpha3": "LUX",
                "countrycode": "442",
                "iso": "ISO 3166-2:LU",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "Macao",
                "alpha2": "MO",
                "alpha3": "MAC",
                "countrycode": "446",
                "iso": "ISO 3166-2:MO",
                "region": "Asia",
                "subregion": "Eastern Asia",
                "regioncode": "142",
                "subregioncode": "030"
            },
            {
                "name": "Macedonia (the former Yugoslav Republic of)",
                "alpha2": "MK",
                "alpha3": "MKD",
                "countrycode": "807",
                "iso": "ISO 3166-2:MK",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Madagascar",
                "alpha2": "MG",
                "alpha3": "MDG",
                "countrycode": "450",
                "iso": "ISO 3166-2:MG",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Malawi",
                "alpha2": "MW",
                "alpha3": "MWI",
                "countrycode": "454",
                "iso": "ISO 3166-2:MW",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Malaysia",
                "alpha2": "MY",
                "alpha3": "MYS",
                "countrycode": "458",
                "iso": "ISO 3166-2:MY",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Maldives",
                "alpha2": "MV",
                "alpha3": "MDV",
                "countrycode": "462",
                "iso": "ISO 3166-2:MV",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Mali",
                "alpha2": "ML",
                "alpha3": "MLI",
                "countrycode": "466",
                "iso": "ISO 3166-2:ML",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Malta",
                "alpha2": "MT",
                "alpha3": "MLT",
                "countrycode": "470",
                "iso": "ISO 3166-2:MT",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Marshall Islands",
                "alpha2": "MH",
                "alpha3": "MHL",
                "countrycode": "584",
                "iso": "ISO 3166-2:MH",
                "region": "Oceania",
                "subregion": "Micronesia",
                "regioncode": "009",
                "subregioncode": "057"
            },
            {
                "name": "Martinique",
                "alpha2": "MQ",
                "alpha3": "MTQ",
                "countrycode": "474",
                "iso": "ISO 3166-2:MQ",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Mauritania",
                "alpha2": "MR",
                "alpha3": "MRT",
                "countrycode": "478",
                "iso": "ISO 3166-2:MR",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Mauritius",
                "alpha2": "MU",
                "alpha3": "MUS",
                "countrycode": "480",
                "iso": "ISO 3166-2:MU",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Mayotte",
                "alpha2": "YT",
                "alpha3": "MYT",
                "countrycode": "175",
                "iso": "ISO 3166-2:YT",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Mexico",
                "alpha2": "MX",
                "alpha3": "MEX",
                "countrycode": "484",
                "iso": "ISO 3166-2:MX",
                "region": "Americas",
                "subregion": "Central America",
                "regioncode": "019",
                "subregioncode": "013"
            },
            {
                "name": "Micronesia (Federated States of)",
                "alpha2": "FM",
                "alpha3": "FSM",
                "countrycode": "583",
                "iso": "ISO 3166-2:FM",
                "region": "Oceania",
                "subregion": "Micronesia",
                "regioncode": "009",
                "subregioncode": "057"
            },
            {
                "name": "Moldova (Republic of)",
                "alpha2": "MD",
                "alpha3": "MDA",
                "countrycode": "498",
                "iso": "ISO 3166-2:MD",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Monaco",
                "alpha2": "MC",
                "alpha3": "MCO",
                "countrycode": "492",
                "iso": "ISO 3166-2:MC",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "Mongolia",
                "alpha2": "MN",
                "alpha3": "MNG",
                "countrycode": "496",
                "iso": "ISO 3166-2:MN",
                "region": "Asia",
                "subregion": "Eastern Asia",
                "regioncode": "142",
                "subregioncode": "030"
            },
            {
                "name": "Montenegro",
                "alpha2": "ME",
                "alpha3": "MNE",
                "countrycode": "499",
                "iso": "ISO 3166-2:ME",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Montserrat",
                "alpha2": "MS",
                "alpha3": "MSR",
                "countrycode": "500",
                "iso": "ISO 3166-2:MS",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Morocco",
                "alpha2": "MA",
                "alpha3": "MAR",
                "countrycode": "504",
                "iso": "ISO 3166-2:MA",
                "region": "Africa",
                "subregion": "Northern Africa",
                "regioncode": "002",
                "subregioncode": "015"
            },
            {
                "name": "Mozambique",
                "alpha2": "MZ",
                "alpha3": "MOZ",
                "countrycode": "508",
                "iso": "ISO 3166-2:MZ",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Myanmar",
                "alpha2": "MM",
                "alpha3": "MMR",
                "countrycode": "104",
                "iso": "ISO 3166-2:MM",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Namibia",
                "alpha2": "NA",
                "alpha3": "NAM",
                "countrycode": "516",
                "iso": "ISO 3166-2:NA",
                "region": "Africa",
                "subregion": "Southern Africa",
                "regioncode": "002",
                "subregioncode": "018"
            },
            {
                "name": "Nauru",
                "alpha2": "NR",
                "alpha3": "NRU",
                "countrycode": "520",
                "iso": "ISO 3166-2:NR",
                "region": "Oceania",
                "subregion": "Micronesia",
                "regioncode": "009",
                "subregioncode": "057"
            },
            {
                "name": "Nepal",
                "alpha2": "NP",
                "alpha3": "NPL",
                "countrycode": "524",
                "iso": "ISO 3166-2:NP",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Netherlands",
                "alpha2": "NL",
                "alpha3": "NLD",
                "countrycode": "528",
                "iso": "ISO 3166-2:NL",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "New Caledonia",
                "alpha2": "NC",
                "alpha3": "NCL",
                "countrycode": "540",
                "iso": "ISO 3166-2:NC",
                "region": "Oceania",
                "subregion": "Melanesia",
                "regioncode": "009",
                "subregioncode": "054"
            },
            {
                "name": "New Zealand",
                "alpha2": "NZ",
                "alpha3": "NZL",
                "countrycode": "554",
                "iso": "ISO 3166-2:NZ",
                "region": "Oceania",
                "subregion": "Australia and New Zealand",
                "regioncode": "009",
                "subregioncode": "053"
            },
            {
                "name": "Nicaragua",
                "alpha2": "NI",
                "alpha3": "NIC",
                "countrycode": "558",
                "iso": "ISO 3166-2:NI",
                "region": "Americas",
                "subregion": "Central America",
                "regioncode": "019",
                "subregioncode": "013"
            },
            {
                "name": "Niger",
                "alpha2": "NE",
                "alpha3": "NER",
                "countrycode": "562",
                "iso": "ISO 3166-2:NE",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Nigeria",
                "alpha2": "NG",
                "alpha3": "NGA",
                "countrycode": "566",
                "iso": "ISO 3166-2:NG",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Niue",
                "alpha2": "NU",
                "alpha3": "NIU",
                "countrycode": "570",
                "iso": "ISO 3166-2:NU",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "Norfolk Island",
                "alpha2": "NF",
                "alpha3": "NFK",
                "countrycode": "574",
                "iso": "ISO 3166-2:NF",
                "region": "Oceania",
                "subregion": "Australia and New Zealand",
                "regioncode": "009",
                "subregioncode": "053"
            },
            {
                "name": "Northern Mariana Islands",
                "alpha2": "MP",
                "alpha3": "MNP",
                "countrycode": "580",
                "iso": "ISO 3166-2:MP",
                "region": "Oceania",
                "subregion": "Micronesia",
                "regioncode": "009",
                "subregioncode": "057"
            },
            {
                "name": "Norway",
                "alpha2": "NO",
                "alpha3": "NOR",
                "countrycode": "578",
                "iso": "ISO 3166-2:NO",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Oman",
                "alpha2": "OM",
                "alpha3": "OMN",
                "countrycode": "512",
                "iso": "ISO 3166-2:OM",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Pakistan",
                "alpha2": "PK",
                "alpha3": "PAK",
                "countrycode": "586",
                "iso": "ISO 3166-2:PK",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Palau",
                "alpha2": "PW",
                "alpha3": "PLW",
                "countrycode": "585",
                "iso": "ISO 3166-2:PW",
                "region": "Oceania",
                "subregion": "Micronesia",
                "regioncode": "009",
                "subregioncode": "057"
            },
            {
                "name": "Palestine, State of",
                "alpha2": "PS",
                "alpha3": "PSE",
                "countrycode": "275",
                "iso": "ISO 3166-2:PS",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Panama",
                "alpha2": "PA",
                "alpha3": "PAN",
                "countrycode": "591",
                "iso": "ISO 3166-2:PA",
                "region": "Americas",
                "subregion": "Central America",
                "regioncode": "019",
                "subregioncode": "013"
            },
            {
                "name": "Papua New Guinea",
                "alpha2": "PG",
                "alpha3": "PNG",
                "countrycode": "598",
                "iso": "ISO 3166-2:PG",
                "region": "Oceania",
                "subregion": "Melanesia",
                "regioncode": "009",
                "subregioncode": "054"
            },
            {
                "name": "Paraguay",
                "alpha2": "PY",
                "alpha3": "PRY",
                "countrycode": "600",
                "iso": "ISO 3166-2:PY",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Peru",
                "alpha2": "PE",
                "alpha3": "PER",
                "countrycode": "604",
                "iso": "ISO 3166-2:PE",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Philippines",
                "alpha2": "PH",
                "alpha3": "PHL",
                "countrycode": "608",
                "iso": "ISO 3166-2:PH",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Pitcairn",
                "alpha2": "PN",
                "alpha3": "PCN",
                "countrycode": "612",
                "iso": "ISO 3166-2:PN",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "Poland",
                "alpha2": "PL",
                "alpha3": "POL",
                "countrycode": "616",
                "iso": "ISO 3166-2:PL",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Portugal",
                "alpha2": "PT",
                "alpha3": "PRT",
                "countrycode": "620",
                "iso": "ISO 3166-2:PT",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Puerto Rico",
                "alpha2": "PR",
                "alpha3": "PRI",
                "countrycode": "630",
                "iso": "ISO 3166-2:PR",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Qatar",
                "alpha2": "QA",
                "alpha3": "QAT",
                "countrycode": "634",
                "iso": "ISO 3166-2:QA",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Réunion",
                "alpha2": "RE",
                "alpha3": "REU",
                "countrycode": "638",
                "iso": "ISO 3166-2:RE",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Romania",
                "alpha2": "RO",
                "alpha3": "ROU",
                "countrycode": "642",
                "iso": "ISO 3166-2:RO",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Russian Federation",
                "alpha2": "RU",
                "alpha3": "RUS",
                "countrycode": "643",
                "iso": "ISO 3166-2:RU",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Rwanda",
                "alpha2": "RW",
                "alpha3": "RWA",
                "countrycode": "646",
                "iso": "ISO 3166-2:RW",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Saint Barthélemy",
                "alpha2": "BL",
                "alpha3": "BLM",
                "countrycode": "652",
                "iso": "ISO 3166-2:BL",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Saint Helena, Ascension and Tristan da Cunha",
                "alpha2": "SH",
                "alpha3": "SHN",
                "countrycode": "654",
                "iso": "ISO 3166-2:SH",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Saint Kitts and Nevis",
                "alpha2": "KN",
                "alpha3": "KNA",
                "countrycode": "659",
                "iso": "ISO 3166-2:KN",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Saint Lucia",
                "alpha2": "LC",
                "alpha3": "LCA",
                "countrycode": "662",
                "iso": "ISO 3166-2:LC",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Saint Martin (French part)",
                "alpha2": "MF",
                "alpha3": "MAF",
                "countrycode": "663",
                "iso": "ISO 3166-2:MF",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Saint Pierre and Miquelon",
                "alpha2": "PM",
                "alpha3": "SPM",
                "countrycode": "666",
                "iso": "ISO 3166-2:PM",
                "region": "Americas",
                "subregion": "Northern America",
                "regioncode": "019",
                "subregioncode": "021"
            },
            {
                "name": "Saint Vincent and the Grenadines",
                "alpha2": "VC",
                "alpha3": "VCT",
                "countrycode": "670",
                "iso": "ISO 3166-2:VC",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Samoa",
                "alpha2": "WS",
                "alpha3": "WSM",
                "countrycode": "882",
                "iso": "ISO 3166-2:WS",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "San Marino",
                "alpha2": "SM",
                "alpha3": "SMR",
                "countrycode": "674",
                "iso": "ISO 3166-2:SM",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Sao Tome and Principe",
                "alpha2": "ST",
                "alpha3": "STP",
                "countrycode": "678",
                "iso": "ISO 3166-2:ST",
                "region": "Africa",
                "subregion": "Middle Africa",
                "regioncode": "002",
                "subregioncode": "017"
            },
            {
                "name": "Saudi Arabia",
                "alpha2": "SA",
                "alpha3": "SAU",
                "countrycode": "682",
                "iso": "ISO 3166-2:SA",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Senegal",
                "alpha2": "SN",
                "alpha3": "SEN",
                "countrycode": "686",
                "iso": "ISO 3166-2:SN",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Serbia",
                "alpha2": "RS",
                "alpha3": "SRB",
                "countrycode": "688",
                "iso": "ISO 3166-2:RS",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Seychelles",
                "alpha2": "SC",
                "alpha3": "SYC",
                "countrycode": "690",
                "iso": "ISO 3166-2:SC",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Sierra Leone",
                "alpha2": "SL",
                "alpha3": "SLE",
                "countrycode": "694",
                "iso": "ISO 3166-2:SL",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Singapore",
                "alpha2": "SG",
                "alpha3": "SGP",
                "countrycode": "702",
                "iso": "ISO 3166-2:SG",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Sint Maarten (Dutch part)",
                "alpha2": "SX",
                "alpha3": "SXM",
                "countrycode": "534",
                "iso": "ISO 3166-2:SX",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Slovakia",
                "alpha2": "SK",
                "alpha3": "SVK",
                "countrycode": "703",
                "iso": "ISO 3166-2:SK",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "Slovenia",
                "alpha2": "SI",
                "alpha3": "SVN",
                "countrycode": "705",
                "iso": "ISO 3166-2:SI",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Solomon Islands",
                "alpha2": "SB",
                "alpha3": "SLB",
                "countrycode": "090",
                "iso": "ISO 3166-2:SB",
                "region": "Oceania",
                "subregion": "Melanesia",
                "regioncode": "009",
                "subregioncode": "054"
            },
            {
                "name": "Somalia",
                "alpha2": "SO",
                "alpha3": "SOM",
                "countrycode": "706",
                "iso": "ISO 3166-2:SO",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "South Africa",
                "alpha2": "ZA",
                "alpha3": "ZAF",
                "countrycode": "710",
                "iso": "ISO 3166-2:ZA",
                "region": "Africa",
                "subregion": "Southern Africa",
                "regioncode": "002",
                "subregioncode": "018"
            },
            {
                "name": "South Georgia and the South Sandwich Islands",
                "alpha2": "GS",
                "alpha3": "SGS",
                "countrycode": "239",
                "iso": "ISO 3166-2:GS",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "South Sudan",
                "alpha2": "SS",
                "alpha3": "SSD",
                "countrycode": "728",
                "iso": "ISO 3166-2:SS",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Spain",
                "alpha2": "ES",
                "alpha3": "ESP",
                "countrycode": "724",
                "iso": "ISO 3166-2:ES",
                "region": "Europe",
                "subregion": "Southern Europe",
                "regioncode": "150",
                "subregioncode": "039"
            },
            {
                "name": "Sri Lanka",
                "alpha2": "LK",
                "alpha3": "LKA",
                "countrycode": "144",
                "iso": "ISO 3166-2:LK",
                "region": "Asia",
                "subregion": "Southern Asia",
                "regioncode": "142",
                "subregioncode": "034"
            },
            {
                "name": "Sudan",
                "alpha2": "SD",
                "alpha3": "SDN",
                "countrycode": "729",
                "iso": "ISO 3166-2:SD",
                "region": "Africa",
                "subregion": "Northern Africa",
                "regioncode": "002",
                "subregioncode": "015"
            },
            {
                "name": "Suriname",
                "alpha2": "SR",
                "alpha3": "SUR",
                "countrycode": "740",
                "iso": "ISO 3166-2:SR",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Svalbard and Jan Mayen",
                "alpha2": "SJ",
                "alpha3": "SJM",
                "countrycode": "744",
                "iso": "ISO 3166-2:SJ",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Swaziland",
                "alpha2": "SZ",
                "alpha3": "SWZ",
                "countrycode": "748",
                "iso": "ISO 3166-2:SZ",
                "region": "Africa",
                "subregion": "Southern Africa",
                "regioncode": "002",
                "subregioncode": "018"
            },
            {
                "name": "Sweden",
                "alpha2": "SE",
                "alpha3": "SWE",
                "countrycode": "752",
                "iso": "ISO 3166-2:SE",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "Switzerland",
                "alpha2": "CH",
                "alpha3": "CHE",
                "countrycode": "756",
                "iso": "ISO 3166-2:CH",
                "region": "Europe",
                "subregion": "Western Europe",
                "regioncode": "150",
                "subregioncode": "155"
            },
            {
                "name": "Syrian Arab Republic",
                "alpha2": "SY",
                "alpha3": "SYR",
                "countrycode": "760",
                "iso": "ISO 3166-2:SY",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Taiwan, Province of China",
                "alpha2": "TW",
                "alpha3": "TWN",
                "countrycode": "158",
                "iso": "ISO 3166-2:TW",
                "region": "Asia",
                "subregion": "Eastern Asia",
                "regioncode": "142",
                "subregioncode": "030"
            },
            {
                "name": "Tajikistan",
                "alpha2": "TJ",
                "alpha3": "TJK",
                "countrycode": "762",
                "iso": "ISO 3166-2:TJ",
                "region": "Asia",
                "subregion": "Central Asia",
                "regioncode": "142",
                "subregioncode": "143"
            },
            {
                "name": "Tanzania, United Republic of",
                "alpha2": "TZ",
                "alpha3": "TZA",
                "countrycode": "834",
                "iso": "ISO 3166-2:TZ",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Thailand",
                "alpha2": "TH",
                "alpha3": "THA",
                "countrycode": "764",
                "iso": "ISO 3166-2:TH",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Timor-Leste",
                "alpha2": "TL",
                "alpha3": "TLS",
                "countrycode": "626",
                "iso": "ISO 3166-2:TL",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Togo",
                "alpha2": "TG",
                "alpha3": "TGO",
                "countrycode": "768",
                "iso": "ISO 3166-2:TG",
                "region": "Africa",
                "subregion": "Western Africa",
                "regioncode": "002",
                "subregioncode": "011"
            },
            {
                "name": "Tokelau",
                "alpha2": "TK",
                "alpha3": "TKL",
                "countrycode": "772",
                "iso": "ISO 3166-2:TK",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "Tonga",
                "alpha2": "TO",
                "alpha3": "TON",
                "countrycode": "776",
                "iso": "ISO 3166-2:TO",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "Trinidad and Tobago",
                "alpha2": "TT",
                "alpha3": "TTO",
                "countrycode": "780",
                "iso": "ISO 3166-2:TT",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Tunisia",
                "alpha2": "TN",
                "alpha3": "TUN",
                "countrycode": "788",
                "iso": "ISO 3166-2:TN",
                "region": "Africa",
                "subregion": "Northern Africa",
                "regioncode": "002",
                "subregioncode": "015"
            },
            {
                "name": "Turkey",
                "alpha2": "TR",
                "alpha3": "TUR",
                "countrycode": "792",
                "iso": "ISO 3166-2:TR",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Turkmenistan",
                "alpha2": "TM",
                "alpha3": "TKM",
                "countrycode": "795",
                "iso": "ISO 3166-2:TM",
                "region": "Asia",
                "subregion": "Central Asia",
                "regioncode": "142",
                "subregioncode": "143"
            },
            {
                "name": "Turks and Caicos Islands",
                "alpha2": "TC",
                "alpha3": "TCA",
                "countrycode": "796",
                "iso": "ISO 3166-2:TC",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Tuvalu",
                "alpha2": "TV",
                "alpha3": "TUV",
                "countrycode": "798",
                "iso": "ISO 3166-2:TV",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "Uganda",
                "alpha2": "UG",
                "alpha3": "UGA",
                "countrycode": "800",
                "iso": "ISO 3166-2:UG",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Ukraine",
                "alpha2": "UA",
                "alpha3": "UKR",
                "countrycode": "804",
                "iso": "ISO 3166-2:UA",
                "region": "Europe",
                "subregion": "Eastern Europe",
                "regioncode": "150",
                "subregioncode": "151"
            },
            {
                "name": "United Arab Emirates",
                "alpha2": "AE",
                "alpha3": "ARE",
                "countrycode": "784",
                "iso": "ISO 3166-2:AE",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "United Kingdom of Great Britain and Northern Ireland",
                "alpha2": "GB",
                "alpha3": "GBR",
                "countrycode": "826",
                "iso": "ISO 3166-2:GB",
                "region": "Europe",
                "subregion": "Northern Europe",
                "regioncode": "150",
                "subregioncode": "154"
            },
            {
                "name": "United States of America",
                "alpha2": "US",
                "alpha3": "USA",
                "countrycode": "840",
                "iso": "ISO 3166-2:US",
                "region": "Americas",
                "subregion": "Northern America",
                "regioncode": "019",
                "subregioncode": "021"
            },
            {
                "name": "United States Minor Outlying Islands",
                "alpha2": "UM",
                "alpha3": "UMI",
                "countrycode": "581",
                "iso": "ISO 3166-2:UM",
                "subregioncode": null,
                "regioncode": null,
                "subregion": null,
                "region": null
            },
            {
                "name": "Uruguay",
                "alpha2": "UY",
                "alpha3": "URY",
                "countrycode": "858",
                "iso": "ISO 3166-2:UY",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Uzbekistan",
                "alpha2": "UZ",
                "alpha3": "UZB",
                "countrycode": "860",
                "iso": "ISO 3166-2:UZ",
                "region": "Asia",
                "subregion": "Central Asia",
                "regioncode": "142",
                "subregioncode": "143"
            },
            {
                "name": "Vanuatu",
                "alpha2": "VU",
                "alpha3": "VUT",
                "countrycode": "548",
                "iso": "ISO 3166-2:VU",
                "region": "Oceania",
                "subregion": "Melanesia",
                "regioncode": "009",
                "subregioncode": "054"
            },
            {
                "name": "Venezuela (Bolivarian Republic of)",
                "alpha2": "VE",
                "alpha3": "VEN",
                "countrycode": "862",
                "iso": "ISO 3166-2:VE",
                "region": "Americas",
                "subregion": "South America",
                "regioncode": "019",
                "subregioncode": "005"
            },
            {
                "name": "Viet Nam",
                "alpha2": "VN",
                "alpha3": "VNM",
                "countrycode": "704",
                "iso": "ISO 3166-2:VN",
                "region": "Asia",
                "subregion": "South-Eastern Asia",
                "regioncode": "142",
                "subregioncode": "035"
            },
            {
                "name": "Virgin Islands (British)",
                "alpha2": "VG",
                "alpha3": "VGB",
                "countrycode": "092",
                "iso": "ISO 3166-2:VG",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Virgin Islands (U.S.)",
                "alpha2": "VI",
                "alpha3": "VIR",
                "countrycode": "850",
                "iso": "ISO 3166-2:VI",
                "region": "Americas",
                "subregion": "Caribbean",
                "regioncode": "019",
                "subregioncode": "029"
            },
            {
                "name": "Wallis and Futuna",
                "alpha2": "WF",
                "alpha3": "WLF",
                "countrycode": "876",
                "iso": "ISO 3166-2:WF",
                "region": "Oceania",
                "subregion": "Polynesia",
                "regioncode": "009",
                "subregioncode": "061"
            },
            {
                "name": "Western Sahara",
                "alpha2": "EH",
                "alpha3": "ESH",
                "countrycode": "732",
                "iso": "ISO 3166-2:EH",
                "region": "Africa",
                "subregion": "Northern Africa",
                "regioncode": "002",
                "subregioncode": "015"
            },
            {
                "name": "Yemen",
                "alpha2": "YE",
                "alpha3": "YEM",
                "countrycode": "887",
                "iso": "ISO 3166-2:YE",
                "region": "Asia",
                "subregion": "Western Asia",
                "regioncode": "142",
                "subregioncode": "145"
            },
            {
                "name": "Zambia",
                "alpha2": "ZM",
                "alpha3": "ZMB",
                "countrycode": "894",
                "iso": "ISO 3166-2:ZM",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            },
            {
                "name": "Zimbabwe",
                "alpha2": "ZW",
                "alpha3": "ZWE",
                "countrycode": "716",
                "iso": "ISO 3166-2:ZW",
                "region": "Africa",
                "subregion": "Eastern Africa",
                "regioncode": "002",
                "subregioncode": "014"
            }
        ];
    Object.defineProperties(this, {
        'list': {
            writable: false,
            enumerable: true,
            value: _countries
        }
    });
    return this;
}
IsoCountries.prototype.findBy = function(){
    var _property = arguments[0],
        _value = arguments[1],
        _length = arguments[2],
        _search = undefined,
        _result = undefined;
    if(typeof _property === 'string' && typeof _value === 'string'){
        if(typeof _length === 'number' && _value.length != _length){
            throw new Error('Country code value should be ' + _length + ' chars long.');
        }
        _search = new RegExp(_value, 'i');
        _result = this.list.filter(function(item){
            return item.hasOwnProperty(_property) && _search.test(item[_property]);
        });
        if(_result instanceof Array){
            if(_result.length == 1){
                return  _result[0];
            } else if(_result.length > 1) {
                throw new Error('Multiple countries found for code "' + _value + '".');
            }
        }
    }
    return undefined;
}
IsoCountries.prototype.findByAlpha2 = function(){
    Array.prototype.unshift.call(arguments, 'alpha2');
    Array.prototype.push.call(arguments, 2);
    return this.findBy.apply(this, arguments);
}
IsoCountries.prototype.findByAlpha3 = function(){
    Array.prototype.unshift.call(arguments, 'alpha3');
    Array.prototype.push.call(arguments, 3);
    return this.findBy.apply(this, arguments);
}
function Utils(){};
Utils.isType = function(){
    return typeof arguments[0] === 'function'
        && arguments[0].hasOwnProperty('prototype')
        && arguments[0].hasOwnProperty('name')
        && typeof arguments[0].name === 'string'
        && arguments[0].name.length > 0;
}
var EventEmitter = (function(){
    var _event = {},
        _instances = [];
    function EventEmitterConstructor() {
        _instances.push(this);
    };
    EventEmitterConstructor.prototype.dispatch = function(name) {
        var _this = this,
            _stack = [];
        for(var idx in _event){
            if(_event.hasOwnProperty(idx)) {
                if (typeof idx === 'string' && idx.isRegExp()) {
                    if (idx.toRegExp().test(name)) {
                        _stack = _stack.concat(_event[idx]);
                    }
                }
                if (idx == name) {
                    _stack = _stack.concat(_event[idx])
                }
            }
        }
        _stack.forEach(function(subscription) {
            subscription.fn.call(subscription.target, new ObjectEvent(name, _this));
        });
    };
    EventEmitterConstructor.prototype.add = function(name, action) {
            _event.hasOwnProperty(name) || (_event[name] = []);
            _event[name].push({
                target: this,
                fn: action
            });

            var subscriptionIndex = _event[name].length - 1;

            return function() {
                _event[name].splice(subscriptionIndex, 1);
            };
        };
    return EventEmitterConstructor;
})();

function ObjectEvent(){
    var _this = this,
        _type = typeof arguments[0] === 'string' && arguments[0].replace(/\s/g, '').length > 0
            ? arguments[0]
            : undefined,
        _createDate = new Date(),
        _target = arguments[1] instanceof EventEmitter ? arguments[1] : undefined;
    Object.defineProperties(this, {
        'target': {
            enumerable: true,
            configurable: false,
            get: function(){
                return _target;
            },
            set: function(value) {
                if(value instanceof EventEmitter){
                    _target = value;
                }
                return _this;
            }
        },
        'create_date': {
            enumerable: true,
            configurable: false,
            writable: false,
            value: _createDate
        },
        'type': {
            enumerable: true,
            configurable: false,
            writable: false,
            value: _type
        }
    })
}
ObjectEvent.prototype = Object.create(Object.prototype);
ObjectEvent.prototype.constructor = ObjectEvent;

function Record(){
    var _this = this,
        _type = typeof arguments[0] === 'string' ? arguments[0] : undefined,
        _record = undefined;
    if(_type) {
        if (typeof arguments[1] === 'object') {
            _record = arguments[1];
        }
    }
    Object.defineProperties(this, {
        'class': {
            enumerable: true,
            configurable: false,
            writable: false,
            value: _this.constructor.name
        },
        'record': {
            get: function(){
                return _record;
            },
            set: function(val){
                _record = val;
            }
        },
        'type': {
            enumerable: true,
            configurable: false,
            writable: false,
            value: _type
        },
        'fields': {
            value: {}
        },
        'group': {
            enumerable: true,
            configurable: false,
            value: Record.Group.Default
        }
    });
    Object.defineProperties(this.fields, {
        'name': {
            enumerable: true,
            get: function(){
                return _this.name();
            },
            set: function(val){
                _this.name(val);
            }
        },
        'isInactive': {
            enumerable: true,
            get: function(){
                return _this.isInactive();
            },
            set: function(val){
                _this.isInactive(val);
            }
        }
    });
    EventEmitter.apply(this);
}
Record.prototype = Object.create(EventEmitter.prototype);
Record.prototype.constructor = Record;
Record.prototype.isTrue = function(propertyName){
    return this.value(propertyName) === 'T';
}
Record.prototype.isFalse = function(propertyName){
    return this.value(propertyName) === 'F';
}
Record.prototype.id = function(){
    Array.prototype.unshift.call(arguments, 'id');
    return this.value.apply(this, arguments);
}
Record.prototype.isInactive = function(){
    return this.isTrue('isinactive');
}
Record.prototype.name = function(){
    Array.prototype.unshift.call(arguments, 'name');
    return this.value.apply(this, arguments);
}
Record.prototype.isValidField = function(id){
    return typeof id === 'string' && id.length > 0 && this.getFieldIds().indexOf(id) > -1;
}
Record.prototype.isValidSublist = function(id){
    return typeof id === 'string' && id.length > 0 && this.getSublistIds().indexOf(id) > -1;
}

/**
 * Get value of the field
 * @param {string} propertyName
 */
Record.prototype.value = function(){
    var _optionsRegex = /select|multiselect/gi,
        _propertyName = arguments[0],
        _setterValue = arguments[1],
        _field = undefined,
        _options = undefined;
    if(typeof _propertyName !== 'string' || !this.isValidField(_propertyName)){
        return undefined;
    }
    if(typeof _setterValue !== 'undefined'){
        // if(typeof _setterValue === 'object' && !(_setterValue instanceof Array) && _setterValue != null){
        //     _setterValue = JSON.stringify(_setterValue);
        // }
        this.record.setValue({'fieldId': _propertyName, 'value': _setterValue});
    } else {

    }
    return this.record.getValue({'fieldId': _propertyName});
}
/**
 * Get text of the field
 * @param {string} propertyName
 */
Record.prototype.text = function(){
    var propertyName = arguments[0],
        setterValue = arguments[1];
    if(typeof propertyName !== 'string'){
        return undefined;
    }
    if(typeof setterValue !== 'undefined'){
        setterValue = typeof setterValue === 'object' ? JSON.stringify(setterValue) : setterValue.toString();
        this.record.setText({'fieldId': propertyName, 'text': setterValue});
    }
    return this.record.getText({'fieldId': propertyName});
}
Record.prototype.getFieldIds = function(){
    return this.record.getFields();
}
Record.prototype.getSublistIds = function(){
    return this.record.getSublists();
}
Record.prototype.sublistItemCount = function(id){
    if(!this.isValidSublist(id)){
        throw new Error('Sublist id is required')
    }
    return this.record.getLineCount({sublistId:id})
}


Record.prototype.create = function(){
    var _this = this;
    require(['N/record'], function(record){
        _this.record = record.create({
            'type': _this.type
        });
        _this.dispatch(Record.Events.Create);
    });
}
Record.prototype.save = function () {
    var _this = this,
        _id = undefined;
    require(['N/record'], function(record){
        _this.dispatch(Record.Events.Save.Started)
        _id = _this.record.save();
        _this.dispatch(Record.Events.Save.Completed);
        _this.dispatch(Record.Events.Save);
    });
    return _id;
}
Record.prototype.load = function(id){
    var _this = this;
    require(['N/record'], function(record){
        _this.record = record.load({'type': _this.type, 'id': id});
        _this.dispatch(Record.Events.Load);
    });
    return _this;
}

Object.defineProperties(Record, {
    'Events': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: {}
    },
    'Group': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: {}
    }
});
Object.defineProperties(Record.Group, {
    'Default': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'default'
    },
    'Custom': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'custom'
    },
    'Transaction': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'transaction'
    }
})
Object.defineProperties(Record.Events, {
    'Attach': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.attach'
    },
    'Copy': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.copy'
    },
    'Create': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.create'
    },
    'Delete': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.delete'
    },
    'Detach': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.detach'
    },
    'Load': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.load'
    },
    'Submit': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.submit'
    },
    'Transform': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.transform'
    },
    'Save': {
        writable: false,
        configurable: false,
        enumerable: true,
        value: 'record.save'
    },

});

function SearchItem(){
    var _this = this,
        _type = typeof arguments[0] === 'string' ? arguments[0] : undefined,
        _item = undefined,
        _filters = undefined,
        _columns = undefined;
    if(_type) {
        if (typeof arguments[1] === 'object') {
            _item = arguments[1];
        }
    }
    Object.defineProperties(this, {
        'class': {
            enumerable: true,
            configurable: false,
            writable: false,
            value: _this.constructor.name
        },
        'item': {
            get: function(){
                return _item;
            },
            set: function(val){
                _item = val;
            }
        },
        'type': {
            enumerable: true,
            configurable: false,
            writable: false,
            value: _type
        },
        'filters': {
            get: function(){
                return _filters;
            },
            set: function(val){
                _filters = val;
            }
        },
        'columns': {
            get: function(){
                if(!(_columns instanceof Array)){
                    _columns = Object.keys(_this.fields);
                }
                return _columns;
            },
            set: function(val){
                _columns = val;
            }
        },
        'fields': {
            value: {}
        },
        'custom': {
            enumerable: true,
            configurable: false,
            value: false
        }
    });
    Object.defineProperties(this.fields, {
        'name': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.name();
            },
            set: function(val){
                _this.name(val);
            }
        },
        'isInactive': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isInactive();
            },
            set: function(val){
                _this.isInactive(val);
            }
        }
    });
    EventEmitter.apply(this);
}
SearchItem.prototype = Object.create(EventEmitter.prototype);
SearchItem.prototype.constructor = SearchItem;
SearchItem.DefaultPageCount = 50;

SearchItem.prototype.isTrue = function(propertyName){
    return this.value(propertyName) === 'T';
}
SearchItem.prototype.isFalse = function(propertyName){
    return this.value(propertyName) === 'F';
}

/**
 * Get value of the search item
 * @param {string} propertyName
 * @param {*} [newValue]
 * @return {|*} value
 */
SearchItem.prototype.value = function(){
    var propertyName = arguments[0];
    if(typeof propertyName !== 'string'){
        return undefined;
    }
    return this.item.getValue({'name': propertyName});
}
/**
 * Get text of the search item
 * @param {string} propertyName
 * @param {string} [newValue]
 * @return {|string} text
 */
SearchItem.prototype.text = function(){
    var propertyName = arguments[0];
    if(typeof propertyName !== 'string'){
        return undefined;
    }
    return this.item.getText({'name': propertyName});
}
/**
 * Get id of the search item
 * @return {number} id
 */
SearchItem.prototype.id = function(){
    return this.item.id;
}

SearchItem.prototype.isInactive = function(){
    return this.isTrue('isinactive');
}
SearchItem.prototype.name = function(){
    Array.prototype.unshift.call(arguments, 'name');
    return this.value.apply(this, arguments);
}

/**
 * @param {string} column
 * @param {string} operator
 * @param {string | Date | number | string[] | Date[]} [values]
 */
SearchItem.getQueryData = function(){
    var _column = arguments[0],
        _operator = arguments[1],
        _values = arguments[2],
        _query = undefined;
    if(typeof _column === 'string' && typeof _operator === 'string'){
        _query = [_column, _operator];
        if(typeof _values !== 'undefined'){
            _query.push(_values);
        }
    }
    return _query;
}
/**
 * @param {string} column
 * @param {string} operator
 * @param {string | Date | number | string[] | Date[]} [values]
 */
SearchItem.prototype.where =  function(){
    var _query = SearchItem.getQueryData.apply(this, arguments);
    if(typeof _query !== 'undefined'){
        this.filters = _query;
    }
    return this;
}
/**
 * @param {string} column
 * @param {string} operator
 * @param {string | Date | number | string[] | Date[]} [values]
 */
SearchItem.prototype.and = function(){
    if(!(this.filters instanceof Array)){
        throw new Error('SearchItem.where need to be called prior SearchItem.and function!');
    }
    var _query = SearchItem.getQueryData.apply(this, arguments);
    if(typeof _query !== 'undefined'){
        this.filters.push('and');
        this.filters.push(_query);
    }
    return this;
}
/**
 * @param {string} column
 * @param {string} operator
 * @param {string | Date | number | string[] | Date[]} [values]
 */
SearchItem.prototype.or = function(){
    if(!(this.filters instanceof Array)){
        throw new Error('SearchItem.where need to be called prior SearchItem.and function!');
    }
    var _query = SearchItem.getQueryData.apply(this, arguments);
    if(typeof _query !== 'undefined'){
        this.filters.push('or');
        this.filters.push(_query);
    }
    return this;
}
/**
 * @param {string | string[]} columns
 */
SearchItem.prototype.select = function(){
    var _fields = arguments[0];
    if(_fields instanceof Array){
        this.columns = _fields;
    } else if(typeof _fields === 'string'){
        this.columns = [_fields];
    }
    return this;
}
SearchItem.prototype.search = function(){
    var _this = this,
        _search = undefined;
    require(['N/search'], function (search) {
        try {
            _search = search.create({
                type: _this.type,
                filters: _this.filters,
                columns: _this.columns,
                isPublic: false
            });
        } catch (e) {
            throw new Error('SearchItem.search search creation failed.')
        }
    });
    return _search;
}

/**
 * @param {number} [page]
 * @param {number} [count]
 */
SearchItem.prototype.query = function(){
    var _this = this,
        _page = parseInt(arguments[0]),
        _count = parseInt(arguments[1]),
        _paged = !isNaN(_page),
        _search = undefined,
        _data = [];
    if(_page < 1){
        _page = 1;
    }
    if(_paged && isNaN(_count)){
        _count = SearchItem.DefaultPageCount;
    }
    require(['N/search'], function (search) {
        try{
            _search = search.create({
                type: _this.type,
                filters: _this.filters,
                columns: _this.columns,
                isPublic: false
            });
        } catch (e) {
            throw new Error('SearchItem.query search creation failed.')
        }

        if(_paged){
            _search
                .runPaged({pageSize: _count})
                .fetch({index: _page - 1})
                .data
                .forEach(function(item){
                    _data.push(new _this.constructor(item));
                })
            _this.dispatch(SearchItem.Events.RunPaged);
            _this.dispatch(SearchItem.Events.Fetch);
        } else {
            _search
                .run()
                .each(function(item){
                    _data.push(new _this.constructor(item));
                    return true;
                });
            _this.dispatch(SearchItem.Events.Each);
        }
    });
    return _data;
}

Object.defineProperties(SearchItem, {
    'Events': {
        value: {}
    }
});
Object.defineProperties(SearchItem.Events, {
    'RunPaged': {
        writable: false,
        value: 'search.paged'
    },
    'Save': {
        writable: false,
        value: 'search.save'
    },
    'GetRange': {
        writable: false,
        value: 'search.range'
    },
    'Each': {
        writable: false,
        value: 'search.each'
    },
    'Fetch': {
        writable: false,
        value: 'search.fetch'
    },
    'Load': {
        writable: false,
        value: 'search.load'
    },
    'Delete': {
        writable: false,
        value: 'search.delete'
    },
    'Duplicate': {
        writable: false,
        value: 'search.duplicate'
    },
    'Global': {
        writable: false,
        value: 'search.global'
    },
    'Lookup': {
        writable: false,
        value: 'search.lookup'
    },
    'Next': {
        writable: false,
        value: 'search.next'
    },
    'Prev': {
        writable: false,
        value: 'search.prev'
    }
});

function EventProcessor(){
    var _this = this,
        _events = [];
    EventEmitter.apply(this);
    Object.defineProperties(this, {
        'events': {
            enumerable: true,
            writable: false,
            value: _events
        }
    });
}
EventProcessor.prototype =  Object.create(EventEmitter.prototype);
EventProcessor.prototype.constructor = EventProcessor;
EventProcessor.prototype.register = function(target){}

function Sublist(id, record){
    var _this = this,
        _id = id,
        _record = record;
    if(!_record.isValidSublist(_id)){
        throw new Error('sublist id is required')
    }
    if(!(_record instanceof Record)){
        throw new Error('Sublist should have a valid record to be associated with.');
    }
    Object.defineProperties(this, {
        'items': {
            value: []
        },
        'record': {
            get: function() {
                return _record;
            }
        },
        'id': {
            get: function(){
                return _id;
            }
        }
    });
}
Sublist.prototype.load = function(){
    throw new Error('Sublist.load is an abstract method and must be implemented by subclass');
}
Sublist.prototype.sublistItemCount = function(){
    return this.record.sublistItemCount(this.id);
}

function Transaction(){
    Object.defineProperties(this, {
        'id': {
            configurable: false,
            enumerable: true,
            value: 'transaction-' + Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
        },
        'processors': {
            value: []
        },
        'completed': {
            enumerable: true,
            configurable: false,
            value: true
        }
    });
    Array.prototype.unshift.call(arguments, this.id);
    EventEmitter.apply(this, arguments);
}
Transaction.prototype =  Object.create(EventEmitter.prototype);
Transaction.prototype.constructor = Transaction;
Transaction.prototype.exec = function(callback){
    var _this = this;
    if(typeof callback === 'function'){
        callback.target = _this;
        try {
            callback.apply(_this);
            _this.dispatch(Transaction.Events.Completed);
        } catch (e) {
            _this.completed = false;
            _this.dispatch(Transaction.Events.Failed);
        }
    }
}
Transaction.prototype.addEventProcessor = function(eventProcessor){
    var _this = this;
    if(eventProcessor instanceof EventProcessor) {
        _this.processors.push(eventProcessor);
        eventProcessor.register(_this);
    }
}

Object.defineProperties(Transaction, {
    'Events': {
        enumerable: true,
        configurable: false,
        writable: false,
        value: {}
    }
});
Object.defineProperties(Transaction.Events, {
    'Completed': {
        enumerable: true,
        configurable: false,
        writable: false,
        value: 'transaction.completed'
    },
    'Failed': {
        enumerable: true,
        configurable: false,
        writable: false,
        value: 'transaction.failed'
    }
});

var BB = BB || {};
Object.defineProperties(BB, {
    'transaction': {
        enumerable: true,
        configurable: false,
        writable: false,
        value: new Transaction()
    }
})
function AddressBookSublist(record){
    var _this = this;
    Sublist.call(this, 'addressbook', record)
}
AddressBookSublist.prototype = Object.create(Sublist.prototype);
AddressBookSublist.prototype.constructor = AddressBookSublist;
AddressBookSublist.prototype.load = function(){
    var lines = this.sublistItemCount();
    if(this.items.length > 0){
        this.items.splice(0, this.items.length);
    }
    for (var i = 0; i < lines; i++) {
        this.items.push(new AddressBookSublistItemRecord(i, this, false));
    }
}
AddressBookSublist.prototype.add = function(){
    var _index = this.sublistItemCount(),
        _lineRecord = this.record.record.insertLine({sublistId: this.id, line: _index}),
        _item = new AddressBookSublistItemRecord(_index, this, true);
    this.items.push(_item);
    return this.items[_index];
}
function AddressBookSublistItemRecord(index, sublist, isNew){
    var _this = this,
        _index = index,
        _sublist = sublist,
        _isNew = typeof isNew === 'boolean' ? isNew : true;
    if(!(_sublist instanceof Sublist)){
        throw new Error('Sublist is required');
    }
    Object.defineProperties(this, {
        'isNew': {
            get: function(){
                return _isNew;
            }
        },
        'index': {
            get: function(){
                return  _index;
            }
        },
        'sublist': {
            get: function(){
                return _sublist;
            }
        }
    })
}
AddressBookSublistItemRecord.prototype = Object.create(Record.prototype);
AddressBookSublistItemRecord.prototype.constructor = AddressBookSublistItemRecord;
AddressBookSublistItemRecord.prototype.addressbookaddress = function(){
    var _addressRecord = undefined;
    var r = this.sublist.record.record.getSublistSubrecord({sublistId: this.sublist.id, fieldId: 'addressbookaddress', line: this.index});
    return new AddressRecord(r);
}

function AddressRecord(record){
    var _this = this;
    Record.call(this, 'address', record);
}
AddressRecord.prototype = Object.create(Record.prototype);
AddressRecord.prototype.constructor = AddressRecord;
AddressRecord.prototype.addr1 = function(){
    Array.prototype.unshift.call(arguments, 'addr1');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.addr2 = function(){
    Array.prototype.unshift.call(arguments, 'addr2');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.addr3 = function(){
    Array.prototype.unshift.call(arguments, 'addr3');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.addressee = function(){
    Array.prototype.unshift.call(arguments, 'addressee');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.addressformat = function(){
    Array.prototype.unshift.call(arguments, 'addressformat');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.addrphone = function(){
    Array.prototype.unshift.call(arguments, 'addrphone');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.addrtext = function(){
    Array.prototype.unshift.call(arguments, 'addrtext');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.attention = function(){
    Array.prototype.unshift.call(arguments, 'attention');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.city = function(){
    Array.prototype.unshift.call(arguments, 'city');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.country = function(){
    Array.prototype.unshift.call(arguments, 'country');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.customform = function(){
    Array.prototype.unshift.call(arguments, 'customform');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.externalid = function(){
    Array.prototype.unshift.call(arguments, 'externalid');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.override = function(){
    Array.prototype.unshift.call(arguments, 'override');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.state = function(){
    Array.prototype.unshift.call(arguments, 'state');
    return this.value.apply(this, arguments);
}
AddressRecord.prototype.zip = function(){
    Array.prototype.unshift.call(arguments, 'zip');
    return this.value.apply(this, arguments);
}



function CustomerRecord(record){
    var _this = this;
    Record.call(this, 'customer', record);
    if(typeof this.fields === 'undefined'){
        Object.defineProperties(this, {
            'fields': {
                value: {}
            }
        });
    }
    Object.defineProperties(this.fields, {
        'firstname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.firstname();
            },
            set: function(val){
                _this.firstname(val);
            }
        },
        'lastname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastname();
            },
            set: function(val){
                _this.lastname(val);
            }
        },
        'email': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.email();
            },
            set: function(val){
                _this.email(val);
            }
        },
        'phone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.phone();
            },
            set: function(val){
                _this.phone(val);
            }
        },
        'mobilephone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.mobilephone();
            },
            set: function(val){
                _this.mobilephone(val);
            }
        },
        'altphone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.altphone();
            },
            set: function(val){
                _this.altphone(val);
            }
        },
        'category': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.category();
            },
            set: function(val){
                _this.category(val);
            }
        },
        'subsidiary': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.subsidiary();
            },
            set: function(val){
                _this.subsidiary(val);
            }
        }
    });
}
CustomerRecord.Fields = {

}
CustomerRecord.prototype = Object.create(Record.prototype);
CustomerRecord.prototype.constructor = CustomerRecord;
CustomerRecord.prototype.firstname = function(){
    Array.prototype.unshift.call(arguments, 'firstname');
    return this.value.apply(this, arguments);
}
CustomerRecord.prototype.lastname = function(){
    Array.prototype.unshift.call(arguments, 'lastname');
    return this.value.apply(this, arguments);
}
CustomerRecord.prototype.email = function(){
    Array.prototype.unshift.call(arguments, 'email');
    return this.value.apply(this, arguments);
}
CustomerRecord.prototype.phone = function(){
    Array.prototype.unshift.call(arguments, 'phone');
    return this.value.apply(this, arguments);
}
CustomerRecord.prototype.mobilephone = function(){
    Array.prototype.unshift.call(arguments, 'mobilephone');
    return this.value.apply(this, arguments);
}
CustomerRecord.prototype.altphone = function(){
    Array.prototype.unshift.call(arguments, 'altphone');
    return this.value.apply(this, arguments);
}
CustomerRecord.prototype.category = function() {
    Array.prototype.unshift.call(arguments, 'category');
    return this.value.apply(this, arguments);
}
CustomerRecord.prototype.subsidiary = function() {
    Array.prototype.unshift.call(arguments, 'subsidiary');
    return this.value.apply(this, arguments);
}
CustomerRecord.prototype.addressbook = function(){
    var _addressbook = new AddressBookSublist(this);
    _addressbook.load();
    return _addressbook;
}

function EmployeeRecord(){
    var _this = this;
    Array.prototype.unshift.call(arguments, 'employee');
    Record.apply(this, arguments);
    if(typeof this.fields === 'undefined'){
        Object.defineProperties(this, {
            'fields': {
                value: {}
            }
        });
    }
    Object.defineProperties(this.fields, {
        'accountnumber': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.accountnumber();
            },
            set: function(val){
                _this.accountnumber(val);
            }
        },
        'aliennumber': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.aliennumber();
            },
            set: function(val){
                _this.aliennumber(val);
            }
        },
        'approvallimit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.approvallimit();
            },
            set: function(val){
                _this.approvallimit(val);
            }
        },
        'approver': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.approver();
            },
            set: function(val){
                _this.approver(val);
            }
        },
        'authworkdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.authworkdate();
            },
            set: function(val){
                _this.authworkdate(val);
            }
        },
        'autoname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.autoname();
            },
            set: function(val){
                _this.autoname(val);
            }
        },
        'billingclass': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.billingclass();
            },
            set: function(val){
                _this.billingclass(val);
            }
        },
        'billpay': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.billpay();
            },
            set: function(val){
                _this.billpay(val);
            }
        },
        'birthdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.birthdate();
            },
            set: function(val){
                _this.birthdate(val);
            }
        },
        'btemplate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.btemplate();
            },
            set: function(val){
                _this.btemplate(val);
            }
        },
        'class': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.class();
            },
            set: function(val){
                _this.class(val);
            }
        },
        'comments': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.comments();
            },
            set: function(val){
                _this.comments(val);
            }
        },
        'commissionpaymentpreference': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.commissionpaymentpreference();
            },
            set: function(val){
                _this.commissionpaymentpreference(val);
            }
        },
        'currency': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.currency();
            },
            set: function(val){
                _this.currency(val);
            }
        },
        'customform': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.customform();
            },
            set: function(val){
                _this.customform(val);
            }
        },
        'datecreated': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.datecreated();
            },
            set: function(val){
                _this.datecreated(val);
            }
        },
        'defaultaddress': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.defaultaddress();
            },
            set: function(val){
                _this.defaultaddress(val);
            }
        },
        'department': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.department();
            },
            set: function(val){
                _this.department(val);
            }
        },
        'directdeposit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.directdeposit();
            },
            set: function(val){
                _this.directdeposit(val);
            }
        },
        'eligibleforcommission': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.eligibleforcommission();
            },
            set: function(val){
                _this.eligibleforcommission(val);
            }
        },
        'email': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.email();
            },
            set: function(val){
                _this.email(val);
            }
        },
        'empcenterqty': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.empcenterqty();
            },
            set: function(val){
                _this.empcenterqty(val);
            }
        },
        'empcenterqtymax': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.empcenterqtymax();
            },
            set: function(val){
                _this.empcenterqtymax(val);
            }
        },
        'employeestatus': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.employeestatus();
            },
            set: function(val){
                _this.employeestatus(val);
            }
        },
        'employeetype': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.employeetype();
            },
            set: function(val){
                _this.employeetype(val);
            }
        },
        'entityid': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.entityid();
            },
            set: function(val){
                _this.entityid(val);
            }
        },
        'ethnicity': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.ethnicity();
            },
            set: function(val){
                _this.ethnicity(val);
            }
        },
        'expenselimit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.expenselimit();
            },
            set: function(val){
                _this.expenselimit(val);
            }
        },
        'externalid': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.externalid();
            },
            set: function(val){
                _this.externalid(val);
            }
        },
        'fax': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.fax();
            },
            set: function(val){
                _this.fax(val);
            }
        },
        'firstname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.firstname();
            },
            set: function(val){
                _this.firstname(val);
            }
        },
        'fulluserqty': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.fulluserqty();
            },
            set: function(val){
                _this.fulluserqty(val);
            }
        },
        'fulluserqtymax': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.fulluserqtymax();
            },
            set: function(val){
                _this.fulluserqtymax(val);
            }
        },
        'gender': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.gender();
            },
            set: function(val){
                _this.gender(val);
            }
        },
        'giveaccess': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.giveaccess();
            },
            set: function(val){
                _this.giveaccess(val);
            }
        },
        'globalsubscriptionstatus': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.globalsubscriptionstatus();
            },
            set: function(val){
                _this.globalsubscriptionstatus(val);
            }
        },
        'hasofflineaccess': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.hasofflineaccess();
            },
            set: function(val){
                _this.hasofflineaccess(val);
            }
        },
        'hiredate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.hiredate();
            },
            set: function(val){
                _this.hiredate(val);
            }
        },
        'homephone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.homephone();
            },
            set: function(val){
                _this.homephone(val);
            }
        },
        'i9verified': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.i9verified();
            },
            set: function(val){
                _this.i9verified(val);
            }
        },
        'image': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.image();
            },
            set: function(val){
                _this.image(val);
            }
        },
        'inheritiprules': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.inheritiprules();
            },
            set: function(val){
                _this.inheritiprules(val);
            }
        },
        'initials': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.initials();
            },
            set: function(val){
                _this.initials(val);
            }
        },
        'ipaddressrule': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.ipaddressrule();
            },
            set: function(val){
                _this.ipaddressrule(val);
            }
        },
        'isempcenterqtyenforced': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isempcenterqtyenforced();
            },
            set: function(val){
                _this.isempcenterqtyenforced(val);
            }
        },
        'isfulluserqtyenforced': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isfulluserqtyenforced();
            },
            set: function(val){
                _this.isfulluserqtyenforced(val);
            }
        },
        'isinactive': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isinactive();
            },
            set: function(val){
                _this.isinactive(val);
            }
        },
        'isjobresource': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isjobresource();
            },
            set: function(val){
                _this.isjobresource(val);
            }
        },
        'isretailuserqtyenforced': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isretailuserqtyenforced();
            },
            set: function(val){
                _this.isretailuserqtyenforced(val);
            }
        },
        'issalesrep': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.issalesrep();
            },
            set: function(val){
                _this.issalesrep(val);
            }
        },
        'issupportrep': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.issupportrep();
            },
            set: function(val){
                _this.issupportrep(val);
            }
        },
        'job': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.job();
            },
            set: function(val){
                _this.job(val);
            }
        },
        'jobdescription': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.jobdescription();
            },
            set: function(val){
                _this.jobdescription(val);
            }
        },
        'jurisdiction1display': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.jurisdiction1display();
            },
            set: function(val){
                _this.jurisdiction1display(val);
            }
        },
        'jurisdiction2display': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.jurisdiction2display();
            },
            set: function(val){
                _this.jurisdiction2display(val);
            }
        },
        'jurisdiction3display': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.jurisdiction3display();
            },
            set: function(val){
                _this.jurisdiction3display(val);
            }
        },
        'jurisdiction4display': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.jurisdiction4display();
            },
            set: function(val){
                _this.jurisdiction4display(val);
            }
        },
        'jurisdiction5display': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.jurisdiction5display();
            },
            set: function(val){
                _this.jurisdiction5display(val);
            }
        },
        'laborcost': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.laborcost();
            },
            set: function(val){
                _this.laborcost(val);
            }
        },
        'lastmodifieddate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastmodifieddate();
            },
            set: function(val){
                _this.lastmodifieddate(val);
            }
        },
        'lastname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastname();
            },
            set: function(val){
                _this.lastname(val);
            }
        },
        'lastpaiddate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastpaiddate();
            },
            set: function(val){
                _this.lastpaiddate(val);
            }
        },
        'lastreviewdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastreviewdate();
            },
            set: function(val){
                _this.lastreviewdate(val);
            }
        },
        'location': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.location();
            },
            set: function(val){
                _this.location(val);
            }
        },
        'maritalstatus': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.maritalstatus();
            },
            set: function(val){
                _this.maritalstatus(val);
            }
        },
        'middlename': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.middlename();
            },
            set: function(val){
                _this.middlename(val);
            }
        },
        'mobilephone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.mobilephone();
            },
            set: function(val){
                _this.mobilephone(val);
            }
        },
        'nextreviewdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.nextreviewdate();
            },
            set: function(val){
                _this.nextreviewdate(val);
            }
        },
        'officephone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.officephone();
            },
            set: function(val){
                _this.officephone(val);
            }
        },
        'payfrequency': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.payfrequency();
            },
            set: function(val){
                _this.payfrequency(val);
            }
        },
        'phone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.phone();
            },
            set: function(val){
                _this.phone(val);
            }
        },
        'phoneticname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.phoneticname();
            },
            set: function(val){
                _this.phoneticname(val);
            }
        },
        'purchaseorderapprovallimit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.purchaseorderapprovallimit();
            },
            set: function(val){
                _this.purchaseorderapprovallimit(val);
            }
        },
        'purchaseorderapprover': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.purchaseorderapprover();
            },
            set: function(val){
                _this.purchaseorderapprover(val);
            }
        },
        'purchaseorderlimit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.purchaseorderlimit();
            },
            set: function(val){
                _this.purchaseorderlimit(val);
            }
        },
        'releasedate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.releasedate();
            },
            set: function(val){
                _this.releasedate(val);
            }
        },
        'requirepwdchange': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.requirepwdchange();
            },
            set: function(val){
                _this.requirepwdchange(val);
            }
        },
        'residentstatus': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.residentstatus();
            },
            set: function(val){
                _this.residentstatus(val);
            }
        },
        'retailuserqty': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.retailuserqty();
            },
            set: function(val){
                _this.retailuserqty(val);
            }
        },
        'retailuserqtymax': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.retailuserqtymax();
            },
            set: function(val){
                _this.retailuserqtymax(val);
            }
        },
        'salesrole': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.salesrole();
            },
            set: function(val){
                _this.salesrole(val);
            }
        },
        'salutation': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.salutation();
            },
            set: function(val){
                _this.salutation(val);
            }
        },
        'sendemail': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.sendemail();
            },
            set: function(val){
                _this.sendemail(val);
            }
        },
        'socialsecuritynumber': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.socialsecuritynumber();
            },
            set: function(val){
                _this.socialsecuritynumber(val);
            }
        },
        'startdatetimeoffcalc': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.startdatetimeoffcalc();
            },
            set: function(val){
                _this.startdatetimeoffcalc(val);
            }
        },
        'strength': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.strength();
            },
            set: function(val){
                _this.strength(val);
            }
        },
        'subsidiary': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.subsidiary();
            },
            set: function(val){
                _this.subsidiary(val);
            }
        },
        'supervisor': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.supervisor();
            },
            set: function(val){
                _this.supervisor(val);
            }
        },
        'terminationbydeath': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.terminationbydeath();
            },
            set: function(val){
                _this.terminationbydeath(val);
            }
        },
        'timeapprover': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.timeapprover();
            },
            set: function(val){
                _this.timeapprover(val);
            }
        },
        'timeoffplan': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.timeoffplan();
            },
            set: function(val){
                _this.timeoffplan(val);
            }
        },
        'title': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.title();
            },
            set: function(val){
                _this.title(val);
            }
        },
        'unsubscribe': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.unsubscribe();
            },
            set: function(val){
                _this.unsubscribe(val);
            }
        },
        'useperquest': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.useperquest();
            },
            set: function(val){
                _this.useperquest(val);
            }
        },
        'usetimedata': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.usetimedata();
            },
            set: function(val){
                _this.usetimedata(val);
            }
        },
        'visaexpdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.visaexpdate();
            },
            set: function(val){
                _this.visaexpdate(val);
            }
        },
        'visatype': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.visatype();
            },
            set: function(val){
                _this.visatype(val);
            }
        },
        'wasempcenterhasaccess': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.wasempcenterhasaccess();
            },
            set: function(val){
                _this.wasempcenterhasaccess(val);
            }
        },
        'wasfulluserhasaccess': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.wasfulluserhasaccess();
            },
            set: function(val){
                _this.wasfulluserhasaccess(val);
            }
        },
        'wasinactive': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.wasinactive();
            },
            set: function(val){
                _this.wasinactive(val);
            }
        },
        'wasretailuserhasaccess': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.wasretailuserhasaccess();
            },
            set: function(val){
                _this.wasretailuserhasaccess(val);
            }
        },
        'workassignment': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.workassignment();
            },
            set: function(val){
                _this.workassignment(val);
            }
        },
        'workcalendar': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.workcalendar();
            },
            set: function(val){
                _this.workcalendar(val);
            }
        },
        'workplace': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.workplace();
            },
            set: function(val){
                _this.workplace(val);
            }
        }
    });
}
EmployeeRecord.prototype = Object.create(Record.prototype);
EmployeeRecord.prototype.constructor = EmployeeRecord;
EmployeeRecord.prototype.accountnumber = function(){
    Array.prototype.unshift.call(arguments, 'accountnumber');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.aliennumber = function(){
    Array.prototype.unshift.call(arguments, 'aliennumber');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.approvallimit = function(){
    Array.prototype.unshift.call(arguments, 'approvallimit');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.approver = function(){
    Array.prototype.unshift.call(arguments, 'approver');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.authworkdate = function(){
    Array.prototype.unshift.call(arguments, 'authworkdate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.autoname = function(){
    Array.prototype.unshift.call(arguments, 'autoname');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.billingclass = function(){
    Array.prototype.unshift.call(arguments, 'billingclass');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.billpay = function(){
    Array.prototype.unshift.call(arguments, 'billpay');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.birthdate = function(){
    Array.prototype.unshift.call(arguments, 'birthdate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.btemplate = function(){
    Array.prototype.unshift.call(arguments, 'btemplate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.class = function(){
    Array.prototype.unshift.call(arguments, 'class');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.comments = function(){
    Array.prototype.unshift.call(arguments, 'comments');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.commissionpaymentpreference = function(){
    Array.prototype.unshift.call(arguments, 'commissionpaymentpreference');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.currency = function(){
    Array.prototype.unshift.call(arguments, 'currency');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.customform = function(){
    Array.prototype.unshift.call(arguments, 'customform');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.datecreated = function(){
    Array.prototype.unshift.call(arguments, 'datecreated');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.defaultaddress = function(){
    Array.prototype.unshift.call(arguments, 'defaultaddress');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.department = function(){
    Array.prototype.unshift.call(arguments, 'department');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.directdeposit = function(){
    Array.prototype.unshift.call(arguments, 'directdeposit');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.eligibleforcommission = function(){
    Array.prototype.unshift.call(arguments, 'eligibleforcommission');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.email = function(){
    Array.prototype.unshift.call(arguments, 'email');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.empcenterqty = function(){
    Array.prototype.unshift.call(arguments, 'empcenterqty');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.empcenterqtymax = function(){
    Array.prototype.unshift.call(arguments, 'empcenterqtymax');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.employeestatus = function(){
    Array.prototype.unshift.call(arguments, 'employeestatus');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.employeetype = function(){
    Array.prototype.unshift.call(arguments, 'employeetype');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.entityid = function(){
    Array.prototype.unshift.call(arguments, 'entityid');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.ethnicity = function(){
    Array.prototype.unshift.call(arguments, 'ethnicity');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.expenselimit = function(){
    Array.prototype.unshift.call(arguments, 'expenselimit');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.externalid = function(){
    Array.prototype.unshift.call(arguments, 'externalid');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.fax = function(){
    Array.prototype.unshift.call(arguments, 'fax');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.firstname = function(){
    Array.prototype.unshift.call(arguments, 'firstname');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.fulluserqty = function(){
    Array.prototype.unshift.call(arguments, 'fulluserqty');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.fulluserqtymax = function(){
    Array.prototype.unshift.call(arguments, 'fulluserqtymax');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.gender = function(){
    Array.prototype.unshift.call(arguments, 'gender');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.giveaccess = function(){
    Array.prototype.unshift.call(arguments, 'giveaccess');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.globalsubscriptionstatus = function(){
    Array.prototype.unshift.call(arguments, 'globalsubscriptionstatus');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.hasofflineaccess = function(){
    Array.prototype.unshift.call(arguments, 'hasofflineaccess');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.hiredate = function(){
    Array.prototype.unshift.call(arguments, 'hiredate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.homephone = function(){
    Array.prototype.unshift.call(arguments, 'homephone');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.i9verified = function(){
    Array.prototype.unshift.call(arguments, 'i9verified');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.image = function(){
    Array.prototype.unshift.call(arguments, 'image');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.inheritiprules = function(){
    Array.prototype.unshift.call(arguments, 'inheritiprules');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.initials = function(){
    Array.prototype.unshift.call(arguments, 'initials');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.ipaddressrule = function(){
    Array.prototype.unshift.call(arguments, 'ipaddressrule');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.isempcenterqtyenforced = function(){
    Array.prototype.unshift.call(arguments, 'isempcenterqtyenforced');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.isfulluserqtyenforced = function(){
    Array.prototype.unshift.call(arguments, 'isfulluserqtyenforced');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.isinactive = function(){
    Array.prototype.unshift.call(arguments, 'isinactive');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.isjobresource = function(){
    Array.prototype.unshift.call(arguments, 'isjobresource');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.isretailuserqtyenforced = function(){
    Array.prototype.unshift.call(arguments, 'isretailuserqtyenforced');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.issalesrep = function(){
    Array.prototype.unshift.call(arguments, 'issalesrep');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.issupportrep = function(){
    Array.prototype.unshift.call(arguments, 'issupportrep');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.job = function(){
    Array.prototype.unshift.call(arguments, 'job');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.jobdescription = function(){
    Array.prototype.unshift.call(arguments, 'jobdescription');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.jurisdiction1display = function(){
    Array.prototype.unshift.call(arguments, 'jurisdiction1display');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.jurisdiction2display = function(){
    Array.prototype.unshift.call(arguments, 'jurisdiction2display');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.jurisdiction3display = function(){
    Array.prototype.unshift.call(arguments, 'jurisdiction3display');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.jurisdiction4display = function(){
    Array.prototype.unshift.call(arguments, 'jurisdiction4display');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.jurisdiction5display = function(){
    Array.prototype.unshift.call(arguments, 'jurisdiction5display');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.laborcost = function(){
    Array.prototype.unshift.call(arguments, 'laborcost');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.lastmodifieddate = function(){
    Array.prototype.unshift.call(arguments, 'lastmodifieddate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.lastname = function(){
    Array.prototype.unshift.call(arguments, 'lastname');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.lastpaiddate = function(){
    Array.prototype.unshift.call(arguments, 'lastpaiddate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.lastreviewdate = function(){
    Array.prototype.unshift.call(arguments, 'lastreviewdate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.location = function(){
    Array.prototype.unshift.call(arguments, 'location');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.maritalstatus = function(){
    Array.prototype.unshift.call(arguments, 'maritalstatus');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.middlename = function(){
    Array.prototype.unshift.call(arguments, 'middlename');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.mobilephone = function(){
    Array.prototype.unshift.call(arguments, 'mobilephone');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.nextreviewdate = function(){
    Array.prototype.unshift.call(arguments, 'nextreviewdate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.officephone = function(){
    Array.prototype.unshift.call(arguments, 'officephone');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.payfrequency = function(){
    Array.prototype.unshift.call(arguments, 'payfrequency');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.phone = function(){
    Array.prototype.unshift.call(arguments, 'phone');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.phoneticname = function(){
    Array.prototype.unshift.call(arguments, 'phoneticname');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.purchaseorderapprovallimit = function(){
    Array.prototype.unshift.call(arguments, 'purchaseorderapprovallimit');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.purchaseorderapprover = function(){
    Array.prototype.unshift.call(arguments, 'purchaseorderapprover');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.purchaseorderlimit = function(){
    Array.prototype.unshift.call(arguments, 'purchaseorderlimit');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.releasedate = function(){
    Array.prototype.unshift.call(arguments, 'releasedate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.requirepwdchange = function(){
    Array.prototype.unshift.call(arguments, 'requirepwdchange');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.residentstatus = function(){
    Array.prototype.unshift.call(arguments, 'residentstatus');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.retailuserqty = function(){
    Array.prototype.unshift.call(arguments, 'retailuserqty');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.retailuserqtymax = function(){
    Array.prototype.unshift.call(arguments, 'retailuserqtymax');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.salesrole = function(){
    Array.prototype.unshift.call(arguments, 'salesrole');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.salutation = function(){
    Array.prototype.unshift.call(arguments, 'salutation');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.sendemail = function(){
    Array.prototype.unshift.call(arguments, 'sendemail');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.socialsecuritynumber = function(){
    Array.prototype.unshift.call(arguments, 'socialsecuritynumber');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.startdatetimeoffcalc = function(){
    Array.prototype.unshift.call(arguments, 'startdatetimeoffcalc');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.strength = function(){
    Array.prototype.unshift.call(arguments, 'strength');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.subsidiary = function(){
    Array.prototype.unshift.call(arguments, 'subsidiary');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.supervisor = function(){
    Array.prototype.unshift.call(arguments, 'supervisor');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.terminationbydeath = function(){
    Array.prototype.unshift.call(arguments, 'terminationbydeath');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.timeapprover = function(){
    Array.prototype.unshift.call(arguments, 'timeapprover');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.timeoffplan = function(){
    Array.prototype.unshift.call(arguments, 'timeoffplan');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.title = function(){
    Array.prototype.unshift.call(arguments, 'title');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.unsubscribe = function(){
    Array.prototype.unshift.call(arguments, 'unsubscribe');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.useperquest = function(){
    Array.prototype.unshift.call(arguments, 'useperquest');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.usetimedata = function(){
    Array.prototype.unshift.call(arguments, 'usetimedata');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.visaexpdate = function(){
    Array.prototype.unshift.call(arguments, 'visaexpdate');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.visatype = function(){
    Array.prototype.unshift.call(arguments, 'visatype');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.wasempcenterhasaccess = function(){
    Array.prototype.unshift.call(arguments, 'wasempcenterhasaccess');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.wasfulluserhasaccess = function(){
    Array.prototype.unshift.call(arguments, 'wasfulluserhasaccess');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.wasinactive = function(){
    Array.prototype.unshift.call(arguments, 'wasinactive');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.wasretailuserhasaccess = function(){
    Array.prototype.unshift.call(arguments, 'wasretailuserhasaccess');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.workassignment = function(){
    Array.prototype.unshift.call(arguments, 'workassignment');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.workcalendar = function(){
    Array.prototype.unshift.call(arguments, 'workcalendar');
    return this.value.apply(this, arguments);
};
EmployeeRecord.prototype.workplace = function(){
    Array.prototype.unshift.call(arguments, 'workplace');
    return this.value.apply(this, arguments);
};


function NoteRecord(){
    var _this = this;
    Array.prototype.unshift.call(arguments, 'note');
    Record.apply(this, arguments);
    if(typeof this.fields === 'undefined'){
        Object.defineProperties(this, {
            'fields': {
                value: {}
            }
        });
    }
    Object.defineProperties(this.fields, {
        'accountingperiod': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.accountingperiod();
            },
            set: function(val){
                _this.accountingperiod(val);
            }
        },
        'author': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.author();
            },
            set: function(val){
                _this.author(val);
            }
        },
        'direction': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.direction();
            },
            set: function(val){
                _this.direction(val);
            }
        },
        'entity': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.entity();
            },
            set: function(val){
                _this.entity(val);
            }
        },
        'externalid': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.externalid();
            },
            set: function(val){
                _this.externalid(val);
            }
        },
        'folder': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.folder();
            },
            set: function(val){
                _this.folder(val);
            }
        },
        'item': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.item();
            },
            set: function(val){
                _this.item(val);
            }
        },
        'lastmodifieddate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastmodifieddate();
            },
            set: function(val){
                _this.lastmodifieddate(val);
            }
        },
        'media': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.media();
            },
            set: function(val){
                _this.media(val);
            }
        },
        'note': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.note();
            },
            set: function(val){
                _this.note(val);
            }
        },
        'notedate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.notedate();
            },
            set: function(val){
                _this.notedate(val);
            }
        },
        'notetype': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.notetype();
            },
            set: function(val){
                _this.notetype(val);
            }
        },
        'record': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.recordfield();
            },
            set: function(val){
                _this.recordfield(val);
            }
        },
        'recordtype': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.recordtype();
            },
            set: function(val){
                _this.recordtype(val);
            }
        },
        'time': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.time();
            },
            set: function(val){
                _this.time(val);
            }
        },
        'title': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.title();
            },
            set: function(val){
                _this.title(val);
            }
        },
        'topic': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.topic();
            },
            set: function(val){
                _this.topic(val);
            }
        },
        'transaction': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.transaction();
            },
            set: function(val){
                _this.transaction(val);
            }
        },
    });
}
NoteRecord.prototype = Object.create(Record.prototype);
NoteRecord.prototype.constructor = NoteRecord;
NoteRecord.prototype.accountingperiod = function(){
    Array.prototype.unshift.call(arguments, 'accountingperiod');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.author = function(){
    Array.prototype.unshift.call(arguments, 'author');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.direction = function(){
    Array.prototype.unshift.call(arguments, 'direction');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.entity = function(){
    Array.prototype.unshift.call(arguments, 'entity');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.externalid = function(){
    Array.prototype.unshift.call(arguments, 'externalid');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.folder = function(){
    Array.prototype.unshift.call(arguments, 'folder');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.item = function(){
    Array.prototype.unshift.call(arguments, 'item');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.lastmodifieddate = function(){
    Array.prototype.unshift.call(arguments, 'lastmodifieddate');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.media = function(){
    Array.prototype.unshift.call(arguments, 'media');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.note = function(){
    Array.prototype.unshift.call(arguments, 'note');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.notedate = function(){
    Array.prototype.unshift.call(arguments, 'notedate');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.notetype = function(){
    Array.prototype.unshift.call(arguments, 'notetype');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.recordfield = function(){
    Array.prototype.unshift.call(arguments, 'record');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.recordtype = function(){
    Array.prototype.unshift.call(arguments, 'recordtype');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.time = function(){
    Array.prototype.unshift.call(arguments, 'time');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.title = function(){
    Array.prototype.unshift.call(arguments, 'title');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.topic = function(){
    Array.prototype.unshift.call(arguments, 'topic');
    return this.value.apply(this, arguments);
}
NoteRecord.prototype.transaction = function(){
    Array.prototype.unshift.call(arguments, 'transaction');
    return this.value.apply(this, arguments);
}

function ProjectRecord(){
    var _this = this,
        _record = arguments[0];
    Record.call(this, 'project', _record);
}
ProjectRecord.prototype = Object.create(Record.prototype);
ProjectRecord.prototype.constructor = ProjectRecord;
ProjectRecord.prototype.companyname = function(){
    Array.prototype.unshift.call(arguments, 'companyname');
    return this.value.apply(this, arguments);
}
ProjectRecord.prototype.parent = function(){
    Array.prototype.unshift.call(arguments, 'parent');
    return this.value.apply(this, arguments);
}
ProjectRecord.prototype.jobtype = function(){
    Array.prototype.unshift.call(arguments, 'jobtype');
    return this.value.apply(this, arguments);
}
function CustomerSearchItem(item){
    var _this = this;
    SearchItem.call(this, 'customer', item);
    if(typeof this.fields === 'undefined'){
        Object.defineProperties(this, {
            'fields': {
                value: {}
            }
        });
    }
    Object.defineProperties(this.fields, {
        'name': {
            enumerable: false,
            configurable: false
        },
        'firstname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.firstname();
            }
        },
        'lastname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastname();
            }
        },
        'email': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.email();
            }
        },
        'phone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.phone();
            }
        },
        'mobilephone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.mobilephone();
            }
        },
        'altphone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.altphone();
            }
        },
        'category': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.category();
            }
        },
        'address1': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.address1();
            }
        },
        'address2': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.address2();
            }
        },
        'city': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.city();
            }
        },
        'state': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.state();
            }
        },
        'zipcode': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.zipcode();
            }
        },
        'country': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.country();
            }
        }
    });
}
CustomerSearchItem.prototype = Object.create(SearchItem.prototype);
CustomerSearchItem.prototype.constructor = CustomerSearchItem;
CustomerSearchItem.prototype.firstname = function(){
    Array.prototype.unshift.call(arguments, 'firstname');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.lastname = function(){
    Array.prototype.unshift.call(arguments, 'lastname');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.email = function(){
    Array.prototype.unshift.call(arguments, 'email');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.phone = function(){
    Array.prototype.unshift.call(arguments, 'phone');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.mobilephone = function(){
    Array.prototype.unshift.call(arguments, 'mobilephone');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.altphone = function(){
    Array.prototype.unshift.call(arguments, 'altphone');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.category = function() {
    Array.prototype.unshift.call(arguments, 'category');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.address1 = function(){
    Array.prototype.unshift.call(arguments, 'address1');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.address2 = function(){
    Array.prototype.unshift.call(arguments, 'address2');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.city = function(){
    Array.prototype.unshift.call(arguments, 'city');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.state = function(){
    Array.prototype.unshift.call(arguments, 'state');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.zipcode = function(){
    Array.prototype.unshift.call(arguments, 'zipcode');
    return this.value.apply(this, arguments);
}
CustomerSearchItem.prototype.country = function(){
    Array.prototype.unshift.call(arguments, 'country');
    return this.value.apply(this, arguments);
}
function EmployeeSearchItem(){
    var _this = this;
    Array.prototype.unshift.call(arguments, 'employee');
    SearchItem.apply(this, arguments);
    if(typeof this.fields === 'undefined'){
        Object.defineProperties(this, {
            'fields': {
                value: {}
            }
        });
    }
    Object.defineProperties(this.fields, {
        'name': {
            enumerable: false,
            configurable: false
        },
        'accountnumber': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.accountnumber();
            }
        },
        'address': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.address();
            }
        },
        'addressee': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.addressee();
            }
        },
        'addressinternalid': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.addressinternalid();
            }
        },
        'addresslabel': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.addresslabel();
            }
        },
        'addressphone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.addressphone();
            }
        },
        'aliennumber': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.aliennumber();
            }
        },
        'allocation': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.allocation();
            }
        },
        'altemail': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.altemail();
            }
        },
        'altname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.altname();
            }
        },
        'altphone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.altphone();
            }
        },
        'approvallimit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.approvallimit();
            }
        },
        'approver': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.approver();
            }
        },
        'attention': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.attention();
            }
        },
        'authworkdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.authworkdate();
            }
        },
        'billcountrycode': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.billcountrycode();
            }
        },
        'billingclass': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.billingclass();
            }
        },
        'billzipcode': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.billzipcode();
            }
        },
        'birthdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.birthdate();
            }
        },
        'birthday': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.birthday();
            }
        },
        'city': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.city();
            }
        },
        'class': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.class();
            }
        },
        'classnohierarchy': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.classnohierarchy();
            }
        },
        'comments': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.comments();
            }
        },
        'concurrentwebservicesuser': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.concurrentwebservicesuser();
            }
        },
        'country': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.country();
            }
        },
        'countrycode': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.countrycode();
            }
        },
        'datecreated': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.datecreated();
            }
        },
        'department': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.department();
            }
        },
        'departmentnohierarchy': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.departmentnohierarchy();
            }
        },
        'eligibleforcommission': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.eligibleforcommission();
            }
        },
        'email': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.email();
            }
        },
        'employeestatus': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.employeestatus();
            }
        },
        'employeetype': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.employeetype();
            }
        },
        'entityid': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.entityid();
            }
        },
        'entitynumber': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.entitynumber();
            }
        },
        'ethnicity': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.ethnicity();
            }
        },
        'expenselimit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.expenselimit();
            }
        },
        'externalid': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.externalid();
            }
        },
        'fax': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.fax();
            }
        },
        'firstname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.firstname();
            }
        },
        'formulacurrency': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.formulacurrency();
            }
        },
        'formuladate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.formuladate();
            }
        },
        'formuladatetime': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.formuladatetime();
            }
        },
        'formulanumeric': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.formulanumeric();
            }
        },
        'formulapercent': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.formulapercent();
            }
        },
        'formulatext': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.formulatext();
            }
        },
        'gender': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.gender();
            }
        },
        'giveaccess': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.giveaccess();
            }
        },
        'globalsubscriptionstatus': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.globalsubscriptionstatus();
            }
        },
        'hiredate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.hiredate();
            }
        },
        'homephone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.homephone();
            }
        },
        'i9verified': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.i9verified();
            }
        },
        'image': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.image();
            }
        },
        'internalid': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.internalid();
            }
        },
        'isdefaultbilling': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isdefaultbilling();
            }
        },
        'isdefaultshipping': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isdefaultshipping();
            }
        },
        'isinactive': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isinactive();
            }
        },
        'isjobresource': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.isjobresource();
            }
        },
        'issalesrep': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.issalesrep();
            }
        },
        'issupportrep': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.issupportrep();
            }
        },
        'istemplate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.istemplate();
            }
        },
        'job': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.job();
            }
        },
        'laborcost': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.laborcost();
            }
        },
        'language': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.language();
            }
        },
        'lastmodifieddate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastmodifieddate();
            }
        },
        'lastname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastname();
            }
        },
        'lastpaiddate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastpaiddate();
            }
        },
        'lastreviewdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastreviewdate();
            }
        },
        'lastviewed': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.lastviewed();
            }
        },
        'level': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.level();
            }
        },
        'location': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.location();
            }
        },
        'locationnohierarchy': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.locationnohierarchy();
            }
        },
        'maritalstatus': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.maritalstatus();
            }
        },
        'middlename': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.middlename();
            }
        },
        'mobilephone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.mobilephone();
            }
        },
        'nextreviewdate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.nextreviewdate();
            }
        },
        'offlineaccess': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.offlineaccess();
            }
        },
        'payfrequency': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.payfrequency();
            }
        },
        'permchangedate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.permchangedate();
            }
        },
        'permchangelevel': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.permchangelevel();
            }
        },
        'permission': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.permission();
            }
        },
        'permissionchange': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.permissionchange();
            }
        },
        'phone': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.phone();
            }
        },
        'phoneticname': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.phoneticname();
            }
        },
        'positiontitle': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.positiontitle();
            }
        },
        'primaryearningamount': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.primaryearningamount();
            }
        },
        'primaryearningitem': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.primaryearningitem();
            }
        },
        'primaryearningtype': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.primaryearningtype();
            }
        },
        'purchaseorderapprovallimit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.purchaseorderapprovallimit();
            }
        },
        'purchaseorderapprover': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.purchaseorderapprover();
            }
        },
        'purchaseorderlimit': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.purchaseorderlimit();
            }
        },
        'releasedate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.releasedate();
            }
        },
        'representingsubsidiary': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.representingsubsidiary();
            }
        },
        'residentstatus': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.residentstatus();
            }
        },
        'role': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.role();
            }
        },
        'rolechange': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.rolechange();
            }
        },
        'rolechangeaction': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.rolechangeaction();
            }
        },
        'rolechangedate': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.rolechangedate();
            }
        },
        'salesrole': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.salesrole();
            }
        },
        'salutation': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.salutation();
            }
        },
        'shipcountrycode': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.shipcountrycode();
            }
        },
        'socialsecuritynumber': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.socialsecuritynumber();
            }
        },
        'startdatetimeoffcalc': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.startdatetimeoffcalc();
            }
        },
        'state': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.state();
            }
        },
        'statedisplayname': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.statedisplayname();
            }
        },
        'subscription': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.subscription();
            }
        },
        'subscriptiondate': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.subscriptiondate();
            }
        },
        'subscriptionstatus': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.subscriptionstatus();
            }
        },
        'subsidiary': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.subsidiary();
            }
        },
        'subsidiarynohierarchy': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.subsidiarynohierarchy();
            }
        },
        'supervisor': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.supervisor();
            }
        },
        'timeapprover': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.timeapprover();
            }
        },
        'timeoffplan': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.timeoffplan();
            }
        },
        'title': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.title();
            }
        },
        'useperquest': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.useperquest();
            }
        },
        'usetimedata': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.usetimedata();
            }
        },
        'visaexpdate': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.visaexpdate();
            }
        },
        'visatype': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.visatype();
            }
        },
        'workcalendar': {
            enumerable: false,
            configurable: true,
            get: function(){
                return _this.workcalendar();
            }
        },
        'workplace': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.workplace();
            }
        },
        'zipcode': {
            enumerable: true,
            configurable: true,
            get: function(){
                return _this.zipcode();
            }
        }
    });
}
EmployeeSearchItem.prototype = Object.create(SearchItem.prototype);
EmployeeSearchItem.prototype.constructor = EmployeeSearchItem;
EmployeeSearchItem.prototype.accountnumber = function(){
    Array.prototype.unshift.call(arguments, 'accountnumber');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.address = function(){
    Array.prototype.unshift.call(arguments, 'address');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.addressee = function(){
    Array.prototype.unshift.call(arguments, 'addressee');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.addressinternalid = function(){
    Array.prototype.unshift.call(arguments, 'addressinternalid');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.addresslabel = function(){
    Array.prototype.unshift.call(arguments, 'addresslabel');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.addressphone = function(){
    Array.prototype.unshift.call(arguments, 'addressphone');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.aliennumber = function(){
    Array.prototype.unshift.call(arguments, 'aliennumber');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.allocation = function(){
    Array.prototype.unshift.call(arguments, 'allocation');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.altemail = function(){
    Array.prototype.unshift.call(arguments, 'altemail');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.altname = function(){
    Array.prototype.unshift.call(arguments, 'altname');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.altphone = function(){
    Array.prototype.unshift.call(arguments, 'altphone');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.approvallimit = function(){
    Array.prototype.unshift.call(arguments, 'approvallimit');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.approver = function(){
    Array.prototype.unshift.call(arguments, 'approver');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.attention = function(){
    Array.prototype.unshift.call(arguments, 'attention');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.authworkdate = function(){
    Array.prototype.unshift.call(arguments, 'authworkdate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.billcountrycode = function(){
    Array.prototype.unshift.call(arguments, 'billcountrycode');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.billingclass = function(){
    Array.prototype.unshift.call(arguments, 'billingclass');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.billzipcode = function(){
    Array.prototype.unshift.call(arguments, 'billzipcode');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.birthdate = function(){
    Array.prototype.unshift.call(arguments, 'birthdate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.birthday = function(){
    Array.prototype.unshift.call(arguments, 'birthday');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.city = function(){
    Array.prototype.unshift.call(arguments, 'city');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.class = function(){
    Array.prototype.unshift.call(arguments, 'class');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.classnohierarchy = function(){
    Array.prototype.unshift.call(arguments, 'classnohierarchy');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.comments = function(){
    Array.prototype.unshift.call(arguments, 'comments');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.concurrentwebservicesuser = function(){
    Array.prototype.unshift.call(arguments, 'concurrentwebservicesuser');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.country = function(){
    Array.prototype.unshift.call(arguments, 'country');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.countrycode = function(){
    Array.prototype.unshift.call(arguments, 'countrycode');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.datecreated = function(){
    Array.prototype.unshift.call(arguments, 'datecreated');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.department = function(){
    Array.prototype.unshift.call(arguments, 'department');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.departmentnohierarchy = function(){
    Array.prototype.unshift.call(arguments, 'departmentnohierarchy');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.eligibleforcommission = function(){
    Array.prototype.unshift.call(arguments, 'eligibleforcommission');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.email = function(){
    Array.prototype.unshift.call(arguments, 'email');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.employeestatus = function(){
    Array.prototype.unshift.call(arguments, 'employeestatus');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.employeetype = function(){
    Array.prototype.unshift.call(arguments, 'employeetype');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.entityid = function(){
    Array.prototype.unshift.call(arguments, 'entityid');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.entitynumber = function(){
    Array.prototype.unshift.call(arguments, 'entitynumber');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.ethnicity = function(){
    Array.prototype.unshift.call(arguments, 'ethnicity');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.expenselimit = function(){
    Array.prototype.unshift.call(arguments, 'expenselimit');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.externalid = function(){
    Array.prototype.unshift.call(arguments, 'externalid');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.fax = function(){
    Array.prototype.unshift.call(arguments, 'fax');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.firstname = function(){
    Array.prototype.unshift.call(arguments, 'firstname');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.formulacurrency = function(){
    Array.prototype.unshift.call(arguments, 'formulacurrency');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.formuladate = function(){
    Array.prototype.unshift.call(arguments, 'formuladate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.formuladatetime = function(){
    Array.prototype.unshift.call(arguments, 'formuladatetime');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.formulanumeric = function(){
    Array.prototype.unshift.call(arguments, 'formulanumeric');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.formulapercent = function(){
    Array.prototype.unshift.call(arguments, 'formulapercent');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.formulatext = function(){
    Array.prototype.unshift.call(arguments, 'formulatext');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.gender = function(){
    Array.prototype.unshift.call(arguments, 'gender');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.giveaccess = function(){
    Array.prototype.unshift.call(arguments, 'giveaccess');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.globalsubscriptionstatus = function(){
    Array.prototype.unshift.call(arguments, 'globalsubscriptionstatus');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.hiredate = function(){
    Array.prototype.unshift.call(arguments, 'hiredate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.homephone = function(){
    Array.prototype.unshift.call(arguments, 'homephone');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.i9verified = function(){
    Array.prototype.unshift.call(arguments, 'i9verified');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.image = function(){
    Array.prototype.unshift.call(arguments, 'image');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.internalid = function(){
    Array.prototype.unshift.call(arguments, 'internalid');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.isdefaultbilling = function(){
    Array.prototype.unshift.call(arguments, 'isdefaultbilling');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.isdefaultshipping = function(){
    Array.prototype.unshift.call(arguments, 'isdefaultshipping');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.isinactive = function(){
    Array.prototype.unshift.call(arguments, 'isinactive');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.isjobresource = function(){
    Array.prototype.unshift.call(arguments, 'isjobresource');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.issalesrep = function(){
    Array.prototype.unshift.call(arguments, 'issalesrep');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.issupportrep = function(){
    Array.prototype.unshift.call(arguments, 'issupportrep');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.istemplate = function(){
    Array.prototype.unshift.call(arguments, 'istemplate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.job = function(){
    Array.prototype.unshift.call(arguments, 'job');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.laborcost = function(){
    Array.prototype.unshift.call(arguments, 'laborcost');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.language = function(){
    Array.prototype.unshift.call(arguments, 'language');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.lastmodifieddate = function(){
    Array.prototype.unshift.call(arguments, 'lastmodifieddate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.lastname = function(){
    Array.prototype.unshift.call(arguments, 'lastname');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.lastpaiddate = function(){
    Array.prototype.unshift.call(arguments, 'lastpaiddate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.lastreviewdate = function(){
    Array.prototype.unshift.call(arguments, 'lastreviewdate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.lastviewed = function(){
    Array.prototype.unshift.call(arguments, 'lastviewed');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.level = function(){
    Array.prototype.unshift.call(arguments, 'level');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.location = function(){
    Array.prototype.unshift.call(arguments, 'location');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.locationnohierarchy = function(){
    Array.prototype.unshift.call(arguments, 'locationnohierarchy');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.maritalstatus = function(){
    Array.prototype.unshift.call(arguments, 'maritalstatus');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.middlename = function(){
    Array.prototype.unshift.call(arguments, 'middlename');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.mobilephone = function(){
    Array.prototype.unshift.call(arguments, 'mobilephone');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.nextreviewdate = function(){
    Array.prototype.unshift.call(arguments, 'nextreviewdate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.offlineaccess = function(){
    Array.prototype.unshift.call(arguments, 'offlineaccess');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.payfrequency = function(){
    Array.prototype.unshift.call(arguments, 'payfrequency');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.permchangedate = function(){
    Array.prototype.unshift.call(arguments, 'permchangedate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.permchangelevel = function(){
    Array.prototype.unshift.call(arguments, 'permchangelevel');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.permission = function(){
    Array.prototype.unshift.call(arguments, 'permission');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.permissionchange = function(){
    Array.prototype.unshift.call(arguments, 'permissionchange');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.phone = function(){
    Array.prototype.unshift.call(arguments, 'phone');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.phoneticname = function(){
    Array.prototype.unshift.call(arguments, 'phoneticname');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.positiontitle = function(){
    Array.prototype.unshift.call(arguments, 'positiontitle');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.primaryearningamount = function(){
    Array.prototype.unshift.call(arguments, 'primaryearningamount');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.primaryearningitem = function(){
    Array.prototype.unshift.call(arguments, 'primaryearningitem');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.primaryearningtype = function(){
    Array.prototype.unshift.call(arguments, 'primaryearningtype');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.purchaseorderapprovallimit = function(){
    Array.prototype.unshift.call(arguments, 'purchaseorderapprovallimit');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.purchaseorderapprover = function(){
    Array.prototype.unshift.call(arguments, 'purchaseorderapprover');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.purchaseorderlimit = function(){
    Array.prototype.unshift.call(arguments, 'purchaseorderlimit');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.releasedate = function(){
    Array.prototype.unshift.call(arguments, 'releasedate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.representingsubsidiary = function(){
    Array.prototype.unshift.call(arguments, 'representingsubsidiary');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.residentstatus = function(){
    Array.prototype.unshift.call(arguments, 'residentstatus');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.role = function(){
    Array.prototype.unshift.call(arguments, 'role');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.rolechange = function(){
    Array.prototype.unshift.call(arguments, 'rolechange');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.rolechangeaction = function(){
    Array.prototype.unshift.call(arguments, 'rolechangeaction');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.rolechangedate = function(){
    Array.prototype.unshift.call(arguments, 'rolechangedate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.salesrole = function(){
    Array.prototype.unshift.call(arguments, 'salesrole');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.salutation = function(){
    Array.prototype.unshift.call(arguments, 'salutation');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.shipcountrycode = function(){
    Array.prototype.unshift.call(arguments, 'shipcountrycode');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.socialsecuritynumber = function(){
    Array.prototype.unshift.call(arguments, 'socialsecuritynumber');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.startdatetimeoffcalc = function(){
    Array.prototype.unshift.call(arguments, 'startdatetimeoffcalc');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.state = function(){
    Array.prototype.unshift.call(arguments, 'state');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.statedisplayname = function(){
    Array.prototype.unshift.call(arguments, 'statedisplayname');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.subscription = function(){
    Array.prototype.unshift.call(arguments, 'subscription');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.subscriptiondate = function(){
    Array.prototype.unshift.call(arguments, 'subscriptiondate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.subscriptionstatus = function(){
    Array.prototype.unshift.call(arguments, 'subscriptionstatus');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.subsidiary = function(){
    Array.prototype.unshift.call(arguments, 'subsidiary');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.subsidiarynohierarchy = function(){
    Array.prototype.unshift.call(arguments, 'subsidiarynohierarchy');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.supervisor = function(){
    Array.prototype.unshift.call(arguments, 'supervisor');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.timeapprover = function(){
    Array.prototype.unshift.call(arguments, 'timeapprover');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.timeoffplan = function(){
    Array.prototype.unshift.call(arguments, 'timeoffplan');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.title = function(){
    Array.prototype.unshift.call(arguments, 'title');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.useperquest = function(){
    Array.prototype.unshift.call(arguments, 'useperquest');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.usetimedata = function(){
    Array.prototype.unshift.call(arguments, 'usetimedata');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.visaexpdate = function(){
    Array.prototype.unshift.call(arguments, 'visaexpdate');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.visatype = function(){
    Array.prototype.unshift.call(arguments, 'visatype');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.workcalendar = function(){
    Array.prototype.unshift.call(arguments, 'workcalendar');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.workplace = function(){
    Array.prototype.unshift.call(arguments, 'workplace');
    return this.value.apply(this, arguments);
};
EmployeeSearchItem.prototype.zipcode = function(){
    Array.prototype.unshift.call(arguments, 'zipcode');
    return this.value.apply(this, arguments);
};


/**
 *
 * @author Michael Golichenko
 * 
 * version: 0.0.1
 * 
 */

function APIAuthenticationType() {
	this.None = 'None',
	this.Basic = 'Basic',
	this.Token = 'Token',
	this.Custom = 'Custom'
}
APIAuthenticationType.Types = new APIAuthenticationType();
APIAuthenticationType.isValidAuthenticationType = function(type) {
    for (var prop in APIAuthenticationType.Types) {
        if(type === APIAuthenticationType.Types[prop]){
            return true;
        }
    }
    return false;
}

function APIAuthentication(){}

/*
 * Virtual methods
 */
APIAuthentication.none = function () { };

/**
 * @param {APICredentials} credentials
 */
APIAuthentication.basic = function(credentials){
	var _auth = [credentials.getUsername(), credentials.getPassword()].join(':');
	var _encoded = Converters.toBase64String(encodeURIComponent(_auth).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
	credentials.getCustomSettings().getHeader().append('Authorization', ['Basic', _encoded].join(' '));
}
APIAuthentication.token = function(credentials){
	credentials.getCustomSettings().getHeader().append('Authorization', ['Bearer', credentials.getToken()].join(' '));
}
APIAuthentication.custom = function(){};

function APICredentialsSettings(){
	var _this = this,
		_header = new APIRequestHeader(),
		_params = new APIRequestParams(),
		_data = new APIRequestData();

	this.parse = function(obj){
		if(typeof obj === 'object'){
			if(obj.hasOwnProperty('header') && typeof obj['header'] === 'object'){
				_header.set(obj['header']);
			}
            if(obj.hasOwnProperty('params') && typeof obj['params'] === 'object'){
                _params.set(obj['params']);
            }
            if(obj.hasOwnProperty('data') && typeof obj['data'] === 'object'){
                _data.set(obj['data']);
            }
		}
		return _this;
	}

	this.getHeader = function(){
		return _header;
	};
	this.getParams = function () {
		return _params;
    };
	this.getData = function(){
		return _data;
	};
}

APICredentialsSettings.parse = function (obj) {
	var _settings = new APICredentialsSettings();
	_settings.parse(obj);
	return _settings;
}


function APICredentials() {
	var _this = this,
		_system = undefined,
		_credentialsRecord = undefined,
		_customSettings = undefined;
    Object.defineProperties(this, {
        'fields': {
            writable: false,
            value: function(){
                return {};
            }
        }
    });

	Object.defineProperties(this.fields, {
		'system': {
			get: function(){
				return _system;
			},
			set: function(val){
				_system = val;
			}
		}
	});
	this.getSystem = function(){
		return _system;
	};
	this.setSystem = function(system){
		_system = system;
		return this;
	}
	this.setCredentialsRecord = function(credentialsRecord) {
		_credentialsRecord = credentialsRecord;
		return _this;
	};
	this.getCredentialsRecord = function(){
		return _credentialsRecord;
	};
	this.getId = function() {
		return this.getValue('internalId');
	};
	this.getRecordType = function() {
		return this.getValue('recordType');
	};
	this.getBaseUrl = function(){
		return this.getValue('custrecord_system_base_url');
	};
	this.getAuthenticationType = function() {
		return this.getText('custrecord_system_authentication_type');
	};
	this.getUsername = function() {
		return this.getValue('custrecord_system_username');
	};
	this.getPassword = function() {
		return this.getValue('custrecord_system_password');
	};
	this.getToken = function() {
		return this.getValue('custrecord_system_token');
	};
	this.getDefaultSettings = function() {
		 var _json = this.getValue('custrecord_system_default_settings');
		 try {
		 	var _obj = JSON.parse(_json);
			return APICredentialsSettings.parse(_obj);
		 } catch (ex) {
		 	//TODO: error notification json issue
		 }
	};
	this.getCustomSettings = function() {
		if(_customSettings instanceof APICredentialsSettings){
			return _customSettings;
		}
        var _json = this.getValue('custrecord_system_custom_settings');
        try {
            var _obj = JSON.parse(_json);
            _customSettings = APICredentialsSettings.parse(_obj);
        } catch (ex) {
            //TODO: error notification json issue
        }
        return _customSettings;
	};
	this.getCustomExpiryDateTime = function() {
		return this.getValue('custrecord_system_custom_settings_expiry');
	};
	this.setCustomExpiryDateTime = function(value) {
		this.setValue('custrecord_system_custom_settings_expiry', value);
		return this;
	};
	this.getCustomExpiryPeriod = function() {
		return this.getValue('custrecord_system_custom_setting_exp_ms');
	};
};

APICredentials.prototype.isValid = function() {
	return this.getSystem()&& this.getCredentialsRecord();
};

APICredentials.prototype.authenticate = function(request) {
	var _type = this.getAuthenticationType();
	if(typeof _type === 'string' && APIAuthenticationType.isValidAuthenticationType(_type)){
		_type = _type.toLowerCase();
		APIAuthentication[_type].call(undefined, this);
		request.getHeader().append(this.getCustomSettings().getHeader().json());
	}
};

/**
 * @arguments APIRequest
 */
APICredentials.prototype.get = function() {
    var _apiCredentialsFilter = [['name', 'is', this.getSystem()]],
        _apiCredentialsColumns = ['name'],
        _found = undefined,
        _this = this;
    require(['N/record', 'N/search'], function(record, search){
        //
        search.create({
            id: '',
            type: 'customrecord_system_credentials',
            filters: _apiCredentialsFilter,
            columns: _apiCredentialsColumns
        }).run().each(function(result){
            _found = record.load({'type': result.recordType, 'id': result.id});
            if(_found){
                _this.setCredentialsRecord(_found);
            }
        });
        if(!_found){
            var errorBody = {
                'value': _this.getSystem(),
                'message': (_credentialsSearch.length > 1
                    ? 'RECORD: Multiple credentials found with same base URL, please make sure that base URL is unique.'
                    : 'RECORD: No credentials found for specified base URL.')
            };
            //TODO: error logging
        }
    });
}

APICredentials.prototype.save = function () {
    var _this = this;
    require(['N/record'], function(record){
        _this.getCredentialsRecord().save();
    });
}

APICredentials.prototype.getByMethod = function(method, property){
    if(typeof method !== 'string' || typeof property !== 'string') return undefined;
    var _credentials = this.getCredentialsRecord();
    return _credentials && typeof _credentials === 'object' && typeof _credentials[method] === 'function' ? _credentials[method]({fieldId: property}) : undefined;
}

APICredentials.prototype.getValue = function(property) {
    return this.getByMethod('getValue', property);
}

APICredentials.prototype.getText = function(property) {
    return this.getByMethod('getText', property);
}

APICredentials.prototype.setValue = function(property, value) {
    throw new Error('APICredentials.setValue is an abstract method and must be implemented by subclass');
}


/*
 * Virtual methods
 */

APICredentials.prototype.init = function(system) {
	this.setSystem(system).get();
	return this;
}

/**
 *
 * @author Michael Golichenko
 * 
 * version: 0.0.1
 * 
 */

/**
 * @class
 */
function APIRequest() {
	var _this = this,
		_credentials = undefined,
		_baseUrl = undefined,
		_type = undefined,
		_command = undefined,
		_header = new APIRequestHeader(),
		_params = new APIRequestParams(),
		_data = new APIRequestData();

	Object.defineProperties(this, {
		'fields': {
			writable: false,
			value: function(){
				return {};
			}
		}
	});
	Object.defineProperties(this.fields, {
		'credentials': {
			get: function(){
				return _credentials;
			},
			set: function(val){
				_credentials = val;
			}
		}
	});
	this.credentials = function(){
		if(typeof arguments[0] === 'undefined'){
			return this.fields.credentials;
		} else {
			this.fields.credentials = arguments[0];
			return this;
		}
	}

	/**
	 * @param {string} url
	 */
	this.setBaseUrl = function(url) {
		_baseUrl = url;
		return _this;
	};
	/**
	 * @returns {string}
	 */
	this.getBaseUrl = function() {
		return _baseUrl;
	};
	this.setCommand = function(command) {
		_command = command;
		return _this;
	};
	this.getCommand = function(){
		return _command;
	};
	
	function infoSetter(to, from, directSet) {
		if(directSet){
			to = from;
		} else if(typeof from === 'object'){
			to.set(from);
		}
	};
	this.setData = function(data) {
		infoSetter(_data, data, data instanceof APIRequestData);
		return _this;
	};
	this.getData = function(){
		return _data;
	};
	this.setParams = function(params) {
		infoSetter(_params, params, params instanceof APIRequestParams);
		return _this;
	};
	this.getParams = function(){
		return _params;
	};
	this.setHeader = function(header) {
		infoSetter(_header, header, header instanceof APIRequestHeader);
		return _this;
	};
	this.getHeader = function(){
		return _header;
	};
	this.setType = function(type) {
		_type = type;
		return _this;
	}
	this.getType = function() {
		return _type;
	}
}

/*
 * Properties
 */

APIRequest.Type = new APIRequestType();

/*
 * Public Methods
 */

/**
 * @param {string|APICredentials} system
 * @returns {APIRequest}
 */
APIRequest.prototype.loadCredentials = function(system) {
	if(typeof system === 'string') {
        var credentials = new APICredentials().init(system);
        this.fields.credentials = credentials;
    } else if(typeof system === 'object'){
		this.fields.credentials = system;
	}
	this.setBaseUrl(this.fields.credentials.getBaseUrl());
    if(typeof this.fields.credentials.getDefaultSettings() !== 'undefined'){
        var _defaultParams = this.fields.credentials.getDefaultSettings().getParams(),
            _defaultHeaders = this.fields.credentials.getDefaultSettings().getHeader(),
            _defaultData = this.fields.credentials.getDefaultSettings().getData();
        if(typeof _defaultParams !== 'undefined'){
            this.getParams().append(_defaultParams.json());
        }
        if(typeof _defaultHeaders !== 'undefined'){
            this.getHeader().append(_defaultHeaders.json());
        }
        if(typeof _defaultData !== 'undefined'){
            this.getData().append(_defaultData.json());
        }
    }
	return this;
}
/**
 * @param {string} command
 * @param {APIRequestParams|APIRequestHeader} [arg1]
 * @param {APIRequestHeader} [arg2]
 * @returns {APIResponse}
 */
APIRequest.prototype.get = function() {
	this.setType(APIRequest.Type.GET);
	return this.send.apply(this, arguments);
}
/**
 * @param {string} command
 * @param {APIRequestData|APIRequestParams|APIRequestHeader} [arg1]
 * @param {APIRequestParams|APIRequestHeader} [arg2]
 * @param {APIRequestHeader} [arg3]
 * @returns {APIResponse}
 */
APIRequest.prototype.post = function(){
	this.setType(APIRequest.Type.POST);
	return this.send.apply(this, arguments);
}
/**
 * @param {string} command
 * @param {APIRequestData|APIRequestParams|APIRequestHeader} [arg1]
 * @param {APIRequestParams|APIRequestHeader} [arg2]
 * @param {APIRequestHeader} [arg3]
 * @returns {APIResponse}
 */
APIRequest.prototype.put = function() {
	this.setType(APIRequest.Type.PUT);
	return this.send.apply(this, arguments);
}
/**
 * @param {string} type
 * @param {string} command
 * @param {APIRequestData|APIRequestParams|APIRequestHeader} [arg1]
 * @param {APIRequestParams|APIRequestHeader} [arg2]
 * @param {APIRequestHeader} [arg3]
 * @returns {APIResponse}
 */
APIRequest.prototype.send = function() {
	for (var idx in arguments) {
		switch(true){
			case typeof arguments[idx] === 'string':
				if(APIRequestType.isValidRequestType(arguments[idx])){
					this.setType(arguments[idx])
				} else {
					this.setCommand(arguments[idx]);
				}
				break;
			case arguments[idx] instanceof APIRequestData:
				this.setData(arguments[idx]);
				break;
			case arguments[idx] instanceof APIRequestParams:
				this.setParams(arguments[idx]);
				break;
			case arguments[idx] instanceof APIRequestHeader:
				this.setHeader(arguments[idx]);
				break;
			default:
				//TODO: notify unknown argument
				break;
		}
	}
	if(!this.getCommand()){
		//TODO: throw error saying that there is not command initiated
	}
	//TODO: parse json string before returning
	if(this.credentials()){
		this.credentials().authenticate(this);
	}
	if(typeof this.authenticate === 'function'){
		this.authenticate();
	}
	return this.execute();
}
/**
 * @returns {string}
 */
APIRequest.prototype.getUrl = function() {
	var baseUrl = this.getBaseUrl() ? this.getBaseUrl().replace(/^\/+|\/+$/gm,'') : '';
	var commandPath = this.getCommand() ? this.getCommand().replace(/^\/+|\/+$/gm,'') : '';
	commandPath = commandPath.replace(/\/{2,}/gm, '/');
	var parts = [baseUrl, commandPath];
	var url = parts.join('/');
	return APIRequest.isValidUrl(url) ? url : '';
};
/**
 * @returns {string}
 */
APIRequest.prototype.getQueryString = function() {
	var paramsArray = [];
	var paramsData = this.getParams().json();
	for (var param in paramsData) {
		paramsArray.push([param, paramsData[param]].join('='));
	}
	return paramsArray.length > 0 ? paramsArray.join('&') : '';
}
/**
 * @returns {string}
 */
APIRequest.prototype.getUri = function() {
	var baseUrlContainsParams = /\?/g.test(this.getUrl());
	var paramsSeparator = baseUrlContainsParams ? '&' : '?';
	return [this.getUrl(), this.getQueryString()].join(paramsSeparator).replace(/\?+$/g, '');
}

APIRequest.prototype.isHttps = function(){
    var isHttpsRegex = /^https:\/{2}/;
    var url = this.getBaseUrl();
    return typeof url === 'string' && url.length > 0 && isHttpsRegex.test(url);
}

/*
 * Static methods
 */

/**
 * @param {string} url
 */
APIRequest.isValidUrl = function(url) {
	var validHttpHttpsRegex = /^http(|s):\/{2}/g;
	var multipleSlashesInUrl = /\/{2,}/g;
	var urlWithoutProtocol = url.replace(validHttpHttpsRegex, '');
	return typeof url === 'string' && url.length > 0 && validHttpHttpsRegex.test(url) && !multipleSlashesInUrl.test(urlWithoutProtocol);
}
/**
 * @param {string} [baseUrl]
 * @returns {APIRequest}
 */
APIRequest.init = function(baseUrl) {
	var request = new APIRequest();
	if(typeof baseUrl === 'string' && APIRequest.isValidUrl(baseUrl)){
		request.setBaseUrl(baseUrl);
	}
	return request;
}

/**
 * This method executes
 * @arguments APIRequest
 * @returns {APIResponse}
 */
APIRequest.prototype.execute = function() {
    var _header = this.getHeader().json(),
        _body = this.getData().json(),
        _uri = this.getUri(),
        _method = this.getType(),
        _response = undefined,
        _this = this;
    try {
        require(['N/http', 'N/https'], function (http, https) {
            if (_this.isHttps()){
                _response = https.request({method: _method, url: _uri, body: _body, headers: _header});
            } else {
                _response = http.request({method: _method, url: _uri, body: _body, headers: _header});
            }
        });
    } catch (e) {
        return new APIResponse(e);
    }
    return new APIResponse(_response);
}

/*
 * Virtual methods
 */

APIRequest.prototype.authenticate = function(){
	return this;
};
/**
 *
 * @author Michael Golichenko
 *
 * version: 0.0.1
 *
 */

/**
 * @class
 */
function APIRequestInfo(){
    var _data = {};
    var _this = this;
    this.set = function() {
        if(arguments.length == 1 && typeof arguments[0] === 'object'){
            _data = arguments[0];
        } else if(arguments.length == 2 && typeof arguments[0] === 'string'){
            _this.append(arguments);
        }
        return _this;
    };
    this.append = function() {
        if(arguments.length == 1 && typeof arguments[0] === 'object'){
            for(var prop in arguments[0]){
                _this.append(prop, arguments[0][prop]);
            }
        } else if(arguments.length == 2 && typeof arguments[0] === 'string'){
            if(typeof arguments[1] === 'string'){
                _data[arguments[0]] = arguments[1];
            } else {
                _data[arguments[0]] = JSON.stringify(arguments[1]);
            }
        }
        return _this;
    };
    this.remove = function() {
        if(arguments.length == 1 && typeof arguments[0] === 'array'){
            for(var prop in arguments[0]){
                _this.remove(arguments[0][prop]);
            }
        } else if(arguments.length == 1 && typeof arguments[0] === 'string'){
            if(_data.hasOwnProperty(arguments[0])){
                delete _data[arguments[0]];
            }
        }
        return _this;
    };
    this.clear = function(){
        _data = {};
        return _this;
    };
    this.json = function(asString){
        var _jsonString = JSON.stringify(_data);
        if(asString){
            return _jsonString;
        }
        return JSON.parse(_jsonString);
    };
}

/**
 * @class
 * @implements {APIRequestInfo}
 */
function APIRequestHeader(){ APIRequestInfo.call(this); }
APIRequestHeader.prototype = Object.create(APIRequestInfo.prototype);
APIRequestHeader.prototype.constructor = APIRequestHeader;
/**
 * @class
 * @implements {APIRequestInfo}
 */
function APIRequestParams(){ APIRequestInfo.call(this); }
APIRequestParams.prototype = Object.create(APIRequestInfo.prototype);
APIRequestParams.prototype.constructor = APIRequestParams;
/**
 * @class
 * @implements {APIRequestInfo}
 */
function APIRequestData(){ APIRequestInfo.call(this); }
APIRequestData.prototype = Object.create(APIRequestInfo.prototype);
APIRequestData.prototype.constructor = APIRequestData;

/**
 *
 * @author Michael Golichenko
 *
 * version: 0.0.1
 *
 */

/**
 * @class
 */
function APIRequestType() {
    this.GET = "GET";
    this.POST = "POST";
    this.PUT = "PUT";
    this.HEAD = "HEAD";
    this.DELETE = "DELETE";
    this.OPTIONS = "OPTIONS";
    this.CONNECT = "CONNECT";
}
/**
 * @param {string} type APIRequestType (GET, POST, ...)
 * @returns {boolean}
 */
APIRequestType.isValidRequestType = function(type) {
    var requestType = new APIRequestType();
    for (var prop in requestType) {
        if(type === this[prop]){
            return true;
        }
    }
    return false;
}
function APIResponse(response){
    var _this = this,
        _response = response,
        _header = new APIRequestHeader();
    Object.defineProperties(this, {
        'response': {
            get: function(){
                return _response;
            }
        },
        'header': {
            get: function(){
                return _header;
            }
        }
    });
    _header.set(this.getHeader());
}

APIResponse.prototype.isJson = function(){
    for(var prop in this.header.json()){
        if(/content-type/i.test(prop)){
            var value = this.header.json()[prop];
            return typeof value === 'undefined' || !value ? false : /application\/json/i.test(value);
        }
    }
}

APIResponse.prototype.bodyAsJsonString = function(){
    return typeof this.response.body === 'string' && !this.response.body ? this.response.body : undefined;
};
APIResponse.prototype.bodyAsObject = function(){
    return !this.isJson() || typeof this.bodyAsJsonString() === 'undefined' ? JSON.parse(this.bodyAsJsonString()) : undefined;
};
APIResponse.prototype.getHeader = function(){
    return typeof this.response.headers === 'object' && !this.response.headers ? this.response.headers : {};
};
APIResponse.prototype.getCode = function(){
    return typeof this.response.code !== 'undefined' ? this.response.code : undefined;
};
APIResponse.prototype.getDetails = function(){
    return undefined;
};
function RestRequest(){
    var _this = this,
        _id = undefined,
        _payload = [],
        _page = 1,
        _count = 50;
    Object.defineProperties(this, {
        'params': {
            value: {}
        },
        'payload': {
            get: function() {
                return _payload;
            },
            set: function(val){
                _payload = val;
            }
        },
        'isBatch': {
            get: function(){
                return _payload.length > 1;
            }
        }
    });
    Object.defineProperties(this.params, {
        'id': {
            enumerable: true,
            get: function(){
                return _id;
            },
            set: function(val){
                _id = val;
            }
        },
        'page': {
            enumerable: true,
            get: function(){
                return _page;
            },
            set: function(val){
                if(typeof val === 'number'){
                    _page = val;
                } else if(typeof val === 'string' && !isNaN(val)){
                    _page = parseInt(val);
                }
            }
        },
        'count': {
            enumerable: true,
            get: function(){
                return _count;
            },
            set: function(val){
                if(typeof val === 'number'){
                    _count = val;
                } else if(typeof val === 'string' && !isNaN(val)){
                    _count = parseInt(val);
                }
            }
        },
    });
};
RestRequest.prototype.id = function(){
    var _value = arguments[0];
    if(typeof _value !== 'undefined'){
        this.params.id = _value;
    }
    return this.params.id;
}
RestRequest.prototype.count = function(){
    var _value = parseInt(arguments[0]);
    if(!isNaN(_value)){
        this.params.count = _value < 5 ? 5 : _value;
    }
    return this.params.count;
}
RestRequest.prototype.page = function(){
    var _value = parseInt(arguments[0]);
    if(!isNaN(_value)){
        this.params.page = _value < 1 ? 1 : _value;
    }
    return this.params.page;
}
RestRequest.prototype.parseParams = function(){
    var _params = arguments[0];
    if(typeof _params === 'undefined') return this;
    this.id(_params.id)
    this.count(_params.count);
    this.page(_params.page);
    return this;
};
RestRequest.prototype.parseData = function(){
    var _data =  arguments[0];
    if(typeof _data === 'undefined') return this;
    if(!(_data instanceof Array)){
        _data = [_data];
    }
    this.payload = _data;
};
function RestResponse(){
    var _this = this,
        _type = Utils.isType(arguments[0]) ? arguments[0] : undefined,
        _status = RestResponseStatus.Status.Failed,
        _values = undefined,
        _errors = undefined,
        _count = undefined,
        _page = undefined,
        _total = undefined;
    Object.defineProperties(this, {
        'response': {
            writable: false,
            value: {}
        }
    });
    Object.defineProperties(this.response, {
        'type': {
            enumerable: true,
            get: function(){
                return _type;
            },
            set: function(val){
                val = Utils.isType(val) ? val : undefined;
                _type = val;
            }
        },
        'status': {
            enumerable: true,
            get: function(){
                return _status;
            },
            set: function(val){
                _status = val;
            }
        },
        'values': {
            enumerable: true,
            get: function(){
                return _values;
            },
            set: function(val){
                _values = val;
            }
        },
        'errors': {
            enumerable: true,
            get: function(){
                return _errors;
            },
            set: function(val){
                _errors = val;
            }
        },
        'count': {
            enumerable: true,
            get: function(){
                return _count;
            },
            set: function(val){
                _count = val;
            }
        },
        'page': {
            enumerable: true,
            get: function(){
                return _page;
            },
            set: function(val){
                _page = val;
            }
        },
        'total': {
            enumerable: true,
            get: function(){
                return _total;
            },
            set: function(val){
                _total = val;
            }
        }
    });
}
RestResponse.prototype.type = function(){
    var _value = Utils.isType(arguments[0]) ? arguments[0] : undefined;
    if(typeof _value !== 'undefined'){
        this.response.type = _value;
    }
    return this.response.type;
}
RestResponse.prototype.status = function(){
    var _value = typeof arguments[0] === 'string' && RestResponseStatus.isValidRestResponseStatus(arguments[0]) ? arguments[0] : undefined;
    if(typeof _value !== 'undefined'){
        this.response.status = _value;
    }
    return this.response.status;
}
RestResponse.prototype.count = function(){
    var _value = typeof arguments[0] === 'number' ? arguments[0] : undefined;
    if(typeof _value !== 'undefined'){
        this.response.count = _value;
    }
    return this.response.count;
}
RestResponse.prototype.page = function(){
    var _value = typeof arguments[0] === 'number' ? arguments[0] : undefined;
    if(typeof _value !== 'undefined'){
        this.response.page = _value;
    }
    return this.response.page;
}
RestResponse.prototype.total = function(){
    var _value = typeof arguments[0] === 'number' ? arguments[0] : undefined;
    if(typeof _value !== 'undefined'){
        this.response.total = _value;
    }
    return this.response.total;
}
RestResponse.prototype.values = function(){
    var _value = typeof arguments[0] === 'object' ? arguments[0] : undefined;
    if(typeof _value !== 'undefined'){
        this.response.values = [];
        if(_value instanceof Array){
            for(var idx in _value){
                if(this.isValidType(_value[idx])){
                    this.response.values.push(_value[idx]);
                }
            }
        } else {
            if(this.isValidType(_value)){
                this.response.values.push(_value);
            }
        }
    }
    return this.response.values;
}
RestResponse.prototype.errors = function(){
    var _value = typeof arguments[0] === 'object' ? arguments[0] : undefined;
    if(typeof _value !== 'undefined'){
        this.response.errors = [];
        if(_value instanceof Array){
            for(var idx in _value){
                if(Object.isValidType(_value[idx], Error)){
                    this.response.errors.push(_value[idx]);
                }
            }
        } else {
            if(Object.isValidType(_value, Error)){
                this.response.errors.push(_value);
            }
        }
    }
}
RestResponse.prototype.isValidType = function(){
    return Object.isValidType(arguments[0], this.response.type);
}
RestResponse.prototype.parse = function(){
    var _request = arguments[0] instanceof RestRequest ? arguments[0] : undefined;
    if(typeof _request === 'undefined') return this;
    this.count(_request.count());
    this.page(_request.page());
    this.status(RestResponseStatus.Status.Success);
}
RestResponse.prototype.json = function(){
    return JSON.stringify(this.response);
}
function RestResponseStatus(){
    this.Failed = 'failed';
    this.Success = 'success';
}
RestResponseStatus.Status = new RestResponseStatus();
RestResponseStatus.isValidRestResponseStatus = function(status) {
    for (var prop in RestResponseStatus.Status) {
        if(status === RestResponseStatus.Status[prop]){
            return true;
        }
    }
    return false;
}

function BatchItemRecord(){
    var _this = this,
        _batch = Utils.isType(arguments[0]) ? arguments[0].name : undefined,
        _data = arguments[1],
        _status = BatchProcessorStatus.Status.Pending;
    Record.call(this, BatchItemRecord.type);
}
BatchItemRecord.type = 'customrecord_system_batch_item';
BatchItemRecord.prototype = Object.create(Record.prototype);
BatchItemRecord.prototype.constructor = BatchItemRecord;

BatchItemRecord.prototype.action = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_action');
    return this.value.apply(this, arguments);
};
BatchItemRecord.prototype.processorType = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_type');
    return this.value.apply(this, arguments);
};
BatchItemRecord.prototype.data = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_data');
    return this.value.apply(this, arguments);
};
BatchItemRecord.prototype.startdate = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_startdate');
    return this.value.apply(this, arguments);
};
BatchItemRecord.prototype.enddate = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_enddate');
    return this.value.apply(this, arguments);
};
BatchItemRecord.prototype.status = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_status');
    return this.value.apply(this, arguments);
};
BatchItemRecord.prototype.parent = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_id');
    return this.value.apply(this, arguments);
};
BatchItemRecord.prototype.result = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_result');
    return this.value.apply(this, arguments);
};
function BatchItemSearchItem(){
    var _this = this;
    Array.prototype.unshift.call(arguments, BatchItemRecord.type)
    SearchItem.call(this, BatchItemRecord.type);
}
BatchItemSearchItem.prototype = Object.create(SearchItem.prototype);
BatchItemSearchItem.prototype.constructor = BatchItemSearchItem;

BatchItemSearchItem.prototype.action = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_action');
    return this.value.apply(this, arguments);
};
BatchItemSearchItem.prototype.processorType = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_type');
    return this.value.apply(this, arguments);
};
BatchItemSearchItem.prototype.data = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_data');
    return this.value.apply(this, arguments);
};
BatchItemSearchItem.prototype.startdate = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_startdate');
    return this.value.apply(this, arguments);
};
BatchItemSearchItem.prototype.enddate = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_enddate');
    return this.value.apply(this, arguments);
};
BatchItemSearchItem.prototype.status = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_status');
    return this.value.apply(this, arguments);
};
BatchItemSearchItem.prototype.parent = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_id');
    return this.value.apply(this, arguments);
};
BatchItemSearchItem.prototype.result = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_item_result');
    return this.value.apply(this, arguments);
};
function BatchProcessor(){
    var _this = this,
        _type = Utils.isType(arguments[0]) ? arguments[0].name : undefined,
        _status = BatchProcessorStatus.Status.Pending,
        _data = [];
    Record.call(this, 'customrecord_system_batch');
    Object.defineProperties(this, {
        'processorType': {
            get: function(){
                return _type;
            }
        },
        'data': {
            get: function(){
                return _data;
            }
        }
    });
    this.create();
    this.status(_status);
}
BatchProcessor.prototype = Object.create(Record.prototype);
BatchProcessor.prototype.constructor = BatchProcessor;

BatchProcessor.prototype.startdate = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_startdate');
    return this.value.apply(this, arguments);
};
BatchProcessor.prototype.enddate = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_enddate');
    return this.value.apply(this, arguments);
};
BatchProcessor.prototype.status = function(){
    Array.prototype.unshift.call(arguments, 'custrecord_system_batch_status');
    return this.value.apply(this, arguments);
};

BatchProcessor.prototype.configure = function(){
    var _action = arguments[0],
        _data = arguments[1],
        _item = undefined;
    if(!BatchProcessorAction.isValidAction(_action)){
        throw new Error('Action should be a valid BatchProcessorAction');
    }
    if(!(_data instanceof Array)){
        throw new Error('Data array should be provided')
    }
    for(var idx in _data){
        _item = new BatchItemRecord();
        _item.create();
        _item.processorType(this.processorType)
        _item.status(BatchProcessorStatus.Status.Pending);
        _item.data(JSON.stringify(_data[idx]));
        _item.action(_action);
        this.data.push(_item);
    }
    return this;
}
BatchProcessor.prototype.insert = function(){
    Array.prototype.unshift.call(arguments, BatchProcessorAction.Actions.Insert);
    return this.configure.apply(this, arguments);
}
BatchProcessor.prototype.update = function(){
    Array.prototype.unshift.call(arguments, BatchProcessorAction.Actions.Update);
    return this.configure.apply(this, arguments);
}
BatchProcessor.prototype.upsert = function(){
    Array.prototype.unshift.call(arguments, BatchProcessorAction.Actions.Upsert);
    return this.configure.apply(this, arguments);
}
BatchProcessor.prototype['delete'] = function(){
    Array.prototype.unshift.call(arguments, BatchProcessorAction.Actions.Delete);
    return this.configure.apply(this, arguments);
}
BatchProcessor.prototype.getAvailableDeployment = function(script){
    var _script = script,
        _deployments = [],
        _tasks = [],
        _availableDeployments;
    require(['N/record', 'N/search'], function(record, search) {
        search.create({
            type: record.Type.SCRIPT_DEPLOYMENT,
            columns: ['internalid', 'title', 'scriptid'],
            filters: ['script', 'anyof', [_script.id]]
        }).run().each(function (dep) {
            _deployments.push(dep);
            return true;
        });
        _tasks = search.create({
            type: record.Type.SCHEDULED_SCRIPT_INSTANCE,
            filters: [['script.internalid', 'anyof', [_script.id]], 'and', ['status', 'anyof', ['RETRY', 'PROCESSING', 'PENDING']]],
            columns: ['script.internalid', 'scriptdeployment.internalid', 'datecreated', 'enddate', 'formulacurrency', 'formuladate', 'formuladatetime', 'formulanumeric', 'formulapercent', 'formulatext', 'percentcomplete', 'queue', 'queueposition', 'startdate', 'status']
        }).run().getRange({start: 0, end: 1000});
        _availableDeployments = _deployments.filter(function (dep) {
            var takenTask = _tasks.filter(function (task) {
                var deploymentId = task.getValue({name: 'internalid', join: 'scriptdeployment'});
                return deploymentId == dep.id;
            });
            return !(takenTask instanceof Array) || takenTask.length == 0;
        });
        if (!(_availableDeployments instanceof Array) || _availableDeployments.length == 0) {
            var dep = record.create({
                type: record.Type.SCRIPT_DEPLOYMENT,
                defaultValues: {'script': _script.id}
            });
            dep.setValue('scriptid', '_batch_proc_' + new Date().getTime());
            dep.setValue('status', 'NOTSCHEDULED');
            dep.setValue('buffersize', '64');
            dep.setValue('queueallst​a​g​e​s​a​t​o​n​c​e', false);
            dep.setValue('concurrencylimit', '');
            var createdDepId = dep.save();
            var createdDep = record.load({
                type: record.Type.SCRIPT_DEPLOYMENT,
                id: createdDepId
            });
            _availableDeployments = [createdDep];
        }
    });
    log.debug('deployment id', _availableDeployments[0].getValue('scriptid'));
    return _availableDeployments[0];
}
BatchProcessor.prototype.createTask = function(batchId, script, deployment){
    var _batchId = batchId,
        _script = script,
        _deployment = deployment;
    try {
        require(['N/task'], function(task) {
            var t = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: _script.getValue('scriptid'), //'customscript_system_batch_processing',
                deploymentId: _deployment.getValue('scriptid'), //'customdeploy_system_batch_processing',
                params: {custscript_system_batch_id: _batchId}
            });
            t.submit();
        });
    } catch(e){
        return false;
    }
    return true;
}
BatchProcessor.prototype.process =  function(){
    var _this = this,
        _id = undefined,
        _file,
        _script = undefined,
        _deployment,
        _retryMax = 100, // Is there some way to avoid this magic number?
        _retryCount = 0,
        _sleep = function (sleepDuration) {
            var now = new Date().getTime();
            while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
        };
    this.name('Batch ' + new Date().toUTCString());
    _id = this.record.save();
    for(var idx in this.data){
        if(this.data[idx] instanceof BatchItemRecord){
            this.data[idx].parent(_id);
            this.data[idx].name('Batch '+ _id + ', Batch Item #' + (parseInt(idx)+1));
            this.data[idx].record.save();
        }
    }
    require(['N/task', 'N/record', 'N/search'], function(task, record, search){
        _file = search.create({
                type: 'file',
                columns: ['internalid', 'name'],
                filters: [['name', 'is', 'batch_processing.js'], 'and', ['filetype', 'anyof', ['JAVASCRIPT']]]
            }).run().getRange({start: 0, end: 1});
        if(!(_file instanceof Array) || _file.length == 0){
            throw new Error('Batch processing script file is not present in your environment.');
        }
        _file = _file[0];
        _script = search.create({
                type:record.Type.MAP_REDUCE_SCRIPT,
                columns:['internalid', 'name', 'scriptid'],
                filters:['scriptfile', 'anyof', [_file.id]]
            }).run().getRange({start: 0, end: 1});
        if(!(_script instanceof Array) || _script.length == 0){
            throw new Error('Batch processing script is not present in your environment.');
        }
        _script = _script[0];
    });
    if(typeof _script === 'undefined'){
        throw new Error('Batch processing script is not present in your environment.');
    }
    _deployment = _this.getAvailableDeployment(_script);
    while(!_this.createTask(_id, _script, _deployment) && _retryCount < _retryMax){
        _sleep(1000);
        _deployment = _this.getAvailableDeployment(_script);
        _retryCount++;
	}
	if (_retryCount == _retryMax) {
		throw new Error('Unable to process at this time. Please try again.');
	}
}

function BatchProcessorAction() {
    this.Insert = 'Insert',
    this.Update = 'Update',
    this.Upsert = 'Upsert',
    this.Delete = 'Delete'
}
BatchProcessorAction.Actions = new BatchProcessorAction();
BatchProcessorAction.isValidAction = function(action) {
    if(typeof action !== 'string') return false;
    for (var prop in BatchProcessorAction.Actions) {
        if(action === BatchProcessorAction.Actions[prop]){
            return true;
        }
    }
    return false;
}
function BatchProcessorStatus() {
    this.Pending = 'Pending',
        this.Processing = 'Processing',
        this.Completed = 'Completed',
        this.Failed = 'Failed'
}
BatchProcessorStatus.Status = new BatchProcessorStatus();
var BB = BB || {};

/**
 * @fileoverview log4ns is a library for doing robust javascript logging in Netsuite.
  * It is based on Stephan Strittmatter's log4js.
  *
  * This file contains all log4ns code and is the only file required for logging.
  *
  * <h3>Example:</h3>
  * <pre>
  *  var log = new Log4NS.getLogger("some-category-name"); //create logger instance
  *  log.setLevel(Log4NS.Level.DEBUG); //set the Level
  *  // if multiple appenders are set all will log
  *  log.addAppender(new Log4NS.Console(log));
  *  log.addAppender(new Log4NS.FileAppender("somefile.log")); // file appender logs to FileCabinet: somefile.log
  *
  *  ...
  *
  *  //call the log
  *  log.debug(["debug me"]);
  * </pre>
  *
  * @version 0.1.0
  * @author Brendan Boyd
  * @static
 */
BB.Log4NS = BB.Log4NS || {

    /**
      * Current version of log4ns.
      * @static
      * @final
     */
    version: "0.1.0",

    /**
      * Date of logger initialized.
      * @static
      * @final
     */
    applicationStartDate: new Date(),

    /**
      * Hashtable of loggers.
      * @static
      * @final
      * @private
     */
    loggers: {},

    /**
      * Get a logger instance. Instance is cached on categoryName level.
      * @param  {String} categoryName name of category to log to.
      * @return {Logger} instance of logger for the category
      * @static
     */
    getLogger: function(categoryName) {

        // Use default logger if categoryName is not specified or invalid
        if (typeof categoryName !== "string") {
            categoryName = "[default]";
        }

        if (!BB.Log4NS.loggers[categoryName]) {
            // Create the logger for this name if it doesn't already exist
            BB.Log4NS.loggers[categoryName] = new BB.Log4NS.Logger(categoryName);
        }

        return BB.Log4NS.loggers[categoryName];
    },

    /**
      * Get the default logger instance.
      * @return {Logger} instance of default logger
      * @static
     */
    getDefaultLogger: function() {
        return BB.Log4NS.getLogger("[default]");
    },

    /**
      * Atatch an observer function to an elements event browser independent.
      *
      * @private
     */
    attachEvent: function (element, name, observer) {
    }
};

/**
  * Internal object extension (OO) methods.
  *
  * @private
 */
BB.Log4NS.extend = function(destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
};

/**
  * Functions taken from Prototype library,
  * didn't want to require for just few functions.
  * More info at {@link http://prototype.conio.net/}
  * @private
 */
BB.Log4NS.bind = function(fn, object) {
    return function() {
        return fn.apply(object, arguments);
    };
};

/**
  * @private
  * @ignore
 */
if (!Array.prototype.push) {
    /**
      * Functions taken from Prototype library, didn't want to require for just few
      * functions.
      * More info at {@link http://prototype.conio.net/}
      * @private
     */
    Array.prototype.push = function() {
        var startLength = this.length;
        for (var i = 0; i < arguments.length; i++) {
            this[startLength + i] = arguments[i];
        }
        return this.length;
    };
}

/* global Log4NS */

/**
  * Abstract base class for other appenders.
  * It is doing nothing.
  *
  * @constructor
  * @param {Log4NS.Logger} logger Log4NS instance this appender is attached to
  * @author Stephan Strittmatter
 */
BB.Log4NS.Appender = function () {
    /**
      * Reference to calling logger
      * @type Log4NS.Logger
      * @private
     */
    this.logger = null;

};

BB.Log4NS.Appender.prototype = {
    /**
      * appends the given loggingEvent appender specific
      * @param {Log4NS.LoggingEvent} loggingEvent loggingEvent to append
     */
    doAppend: function(loggingEvent) {
        return;

    },
    /**
      * clears the Appender
     */
    doClear: function() {
        return;

    },

    /**
      * Set the Layout for this appender.
      * @param {Log4NS.Layout} layout Layout for formatting loggingEvent
     */
    setLayout: function(layout){
        this.layout = layout;

    },
    /**
      * Set reference to the logger.
      * @param {Log4NS.Logger} the invoking logger
     */
    setLogger: function(logger){
        // add listener to the logger methods
        logger.onlog.addListener(BB.Log4NS.bind(this.doAppend, this));
        logger.onclear.addListener(BB.Log4NS.bind(this.doClear, this));

        this.logger = logger;

    }

}

/* global Log4NS */

/**
  * Log4NS CustomEvent
  * @constructor
  * @author Seth Chisamore - adapted for Log4NS
  * @author Brendan Boyd - adapted for Log4NS
  * @private
 */
BB.Log4NS.CustomEvent = function () {
    this.listeners = [];

};

BB.Log4NS.CustomEvent.prototype = {
    /**
     * @param method method to be added
     */
    addListener: function (method) {
        this.listeners.push(method);
    },
    /**
     * @param method method to be removed
     */
    removeListener: function (method) {
        var foundIndexes = this.findListenerIndexes(method);

        for (var i = 0; i < foundIndexes.length; i++) {
            this.listeners.splice(foundIndexes[i], 1);
        }
    },
    /**
     * @param handler
     */
    dispatch: function (handler) {
        for (var i = 0; i < this.listeners.length; i++) {
            try {
                this.listeners[i](handler);
            } catch (e) {
                throw "Could not run the listener " + this.listeners[i] + ". \n" + e;
            }
        }
    },
    /**
     * @private
     * @param method
     */
    findListenerIndexes: function (method) {
        var indexes = [];
        for (var i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i] === method) {
                indexes.push(i);
            }
        }

        return indexes;
    }
}

/* global Log4NS */

/**
  * Date Formatter
  * addZero() and formatDate() are courtesy of Mike Golding:
  * http://www.mikezilla.com/exp0015.html
  * @constructor
 */
BB.Log4NS.DateFormatter = function() {
    return;

};
/**
  * default format of date (ISO-8601)
  * @static
  * @final
 */
BB.Log4NS.DateFormatter.DEFAULT_DATE_FORMAT = "yyyy-MM-ddThh:mm:ssO";


BB.Log4NS.DateFormatter.prototype = {
    /**
      * Formats the given date by the given pattern.<br />
      * Following switches are supported:
      * <ul>
      * <li>yyyy: The year</li>
      * <li>MM: the month</li>
      * <li>dd: the day of month<li>
      * <li>hh: the hour<li>
      * <li>mm: minutes</li>
      * <li>O: timezone offset</li>
      * </ul>
      * @param {Date} vDate the date to format
      * @param {String} vFormat the format pattern
      * @return {String} formatted date string
      * @static
     */
    formatDate : function(vDate, vFormat) {
        var vDay = this.addZero(vDate.getDate());
        var vMonth = this.addZero(vDate.getMonth()+1);
        var vYearLong = this.addZero(vDate.getFullYear());
        var vYearShort = this.addZero(vDate.getFullYear().toString().substring(3,4));
        var vYear = (vFormat.indexOf("yyyy")>-1?vYearLong:vYearShort);
        var vHour  = this.addZero(vDate.getHours());
        var vMinute = this.addZero(vDate.getMinutes());
        var vSecond = this.addZero(vDate.getSeconds());
        var vTimeZone = this.O(vDate);
        var vDateString = vFormat.replace(/dd/g, vDay).replace(/MM/g, vMonth).replace(/y{1,4}/g, vYear);
        vDateString = vDateString.replace(/hh/g, vHour).replace(/mm/g, vMinute).replace(/ss/g, vSecond);
        vDateString = vDateString.replace(/O/g, vTimeZone);
        return vDateString;

    },
    /**
      * Formats the given date by the given pattern in UTC without timezone specific information.<br />
      * Following switches are supported:
      * <ul>
      * <li>yyyy: The year</li>
      * <li>MM: the month</li>
      * <li>dd: the day of month<li>
      * <li>hh: the hour<li>
      * <li>mm: minutes</li>
      * </ul>
      * @param {Date} vDate the date to format
      * @param {String} vFormat the format pattern
      * @return {String} formatted date string
      * @static
     */
    formatUTCDate : function(vDate, vFormat) {
        var vDay = this.addZero(vDate.getUTCDate());
        var vMonth = this.addZero(vDate.getUTCMonth()+1);
        var vYearLong = this.addZero(vDate.getUTCFullYear());
        var vYearShort = this.addZero(vDate.getUTCFullYear().toString().substring(3,4));
        var vYear = (vFormat.indexOf("yyyy")>-1?vYearLong:vYearShort);
        var vHour = this.addZero(vDate.getUTCHours());
        var vMinute = this.addZero(vDate.getUTCMinutes());
        var vSecond = this.addZero(vDate.getUTCSeconds());
        var vDateString = vFormat.replace(/dd/g, vDay).replace(/MM/g, vMonth).replace(/y{1,4}/g, vYear);
        vDateString = vDateString.replace(/hh/g, vHour).replace(/mm/g, vMinute).replace(/ss/g, vSecond);
        return vDateString;

    },

    /**
      * @private
      * @static
     */
    addZero : function(vNumber) {
        return ((vNumber < 10) ? "0" : "") + vNumber;

    },

    /**
      * Formates the TimeOffest
      * Thanks to http://www.svendtofte.com/code/date_format/
      * @private
     */
    O : function (date) {
        // Difference to Greenwich time (GMT) in hours
        var os = Math.abs(date.getTimezoneOffset());
        var h = String(Math.floor(os/60));
        var m = String(os%60);
        if(h.length == 1) h = "0" + h;
        if(m.length == 1) m = "0" + m;
        return date.getTimezoneOffset() < 0 ? "+"+h+m : "-"+h+m;

    }

}

/* global Log4NS */

/**
  * Interface for Layouts.
  * Use this Layout as "interface" for other Layouts. It is doing nothing.
  *
  * @constructor
  * @author Stephan Strittmatter
 */
BB.Log4NS.Layout = function(){};
BB.Log4NS.Layout.prototype = {
    /**
      * Implement this method to create your own layout format.
      * @param {Log4NS.LoggingEvent} loggingEvent loggingEvent to format
      * @return formatted String
      * @type String
     */
    format: function(loggingEvent) {
        return "";

    },
    /**
      * Returns the content type output by this layout.
      * @return The base class returns "text/plain".
      * @type String
     */
    getContentType: function() {
        return "text/plain";

    },
    /**
      * @return Returns the header for the layout format. The base class returns null.
      * @type String
     */
    getHeader: function() {
        return null;

    },
    /**
      * @return Returns the footer for the layout format. The base class returns null.
      * @type String
     */
    getFooter: function() {
        return null;

    },

    /**
      * @return Separator between events
      * @type String
     */
    getSeparator: function() {
        return "";

    }

}

/* global Log4NS */

/**
  * Log4NS.Level Enumeration. Do not use directly. Use static objects instead.
  * @constructor
  * @param {Number} level number of level
  * @param {String} levelString String representation of level
  * @private
 */
BB.Log4NS.Level = function(level, levelStr) {
    this.level = level;
    this.levelStr = levelStr;
};

BB.Log4NS.Level.prototype =  {
    /**
      * converts given String to corresponding Level
      * @param {String} sArg String value of Level
      * @param {Log4NS.Level} defaultLevel default Level, if no String representation
      * @return Level object
      * @type Log4NS.Level
     */
    toLevel: function(sArg, defaultLevel) {
        if(sArg === null) {
            return defaultLevel;
        }

        if(typeof sArg == "string") {
            var s = sArg.toUpperCase();

            switch(s) {
            case "ALL": return BB.Log4NS.Level.ALL;
            case "DEBUG": return BB.Log4NS.Level.DEBUG;
            case "INFO": return BB.Log4NS.Level.INFO;
            case "WARN": return BB.Log4NS.Level.WARN;
            case "ERROR": return BB.Log4NS.Level.ERROR;
            case "FATAL": return BB.Log4NS.Level.FATAL;
            case "OFF": return BB.Log4NS.Level.OFF;
            case "TRACE": return BB.Log4NS.Level.TRACE;
            default: return defaultLevel;

            }

        } else if(typeof sArg == "number") {
            switch(sArg) {
            case ALL_INT: return BB.Log4NS.Level.ALL;
            case DEBUG_INT: return BB.Log4NS.Level.DEBUG;
            case INFO_INT: return BB.Log4NS.Level.INFO;
            case WARN_INT: return BB.Log4NS.Level.WARN;
            case ERROR_INT: return BB.Log4NS.Level.ERROR;
            case FATAL_INT: return BB.Log4NS.Level.FATAL;
            case OFF_INT: return BB.Log4NS.Level.OFF;
            case TRACE_INT: return BB.Log4NS.Level.TRACE;
            default: return defaultLevel;

            }

        } else {
            return defaultLevel;

        }

    },
    /**
      * @return  converted Level to String
      * @type String
     */
    toString: function() {
        return this.levelStr;

    },
    /**
      * @return internal Number value of Level
      * @type Number
     */
    valueOf: function() {
        return this.level;

    }

};

// Static variables
/**
  * @private
 */
BB.Log4NS.Level.OFF_INT = Number.MAX_VALUE;
/**
  * @private
 */
BB.Log4NS.Level.FATAL_INT = 50000;
/**
  * @private
 */
BB.Log4NS.Level.ERROR_INT = 40000;
/**
  * @private
 */
BB.Log4NS.Level.WARN_INT = 30000;
/**
  * @private
 */
BB.Log4NS.Level.INFO_INT = 20000;
/**
  * @private
 */
BB.Log4NS.Level.DEBUG_INT = 10000;
/**
  * @private
 */
BB.Log4NS.Level.TRACE_INT = 5000;
/**
  * @private
 */
BB.Log4NS.Level.ALL_INT = Number.MIN_VALUE;

/**
  * Logging Level OFF - all disabled
  * @type Log4NS.Level
  * @static
 */
BB.Log4NS.Level.OFF = new BB.Log4NS.Level(BB.Log4NS.Level.OFF_INT, "OFF");
/**
  * Logging Level Fatal
  * @type Log4NS.Level
  * @static
 */
BB.Log4NS.Level.FATAL = new BB.Log4NS.Level(BB.Log4NS.Level.FATAL_INT, "FATAL");
/**
  * Logging Level Error
  * @type Log4NS.Level
  * @static
 */
BB.Log4NS.Level.ERROR = new BB.Log4NS.Level(BB.Log4NS.Level.ERROR_INT, "ERROR");
/**
  * Logging Level Warn
  * @type Log4NS.Level
  * @static
 */
BB.Log4NS.Level.WARN = new BB.Log4NS.Level(BB.Log4NS.Level.WARN_INT, "WARN");
/**
  * Logging Level Info
  * @type Log4NS.Level
  * @static
 */
BB.Log4NS.Level.INFO = new BB.Log4NS.Level(BB.Log4NS.Level.INFO_INT, "INFO");
/**
  * Logging Level Debug
  * @type Log4NS.Level
  * @static
 */
BB.Log4NS.Level.DEBUG = new BB.Log4NS.Level(BB.Log4NS.Level.DEBUG_INT, "DEBUG");
/**
  * Logging Level Trace
  * @type Log4NS.Level
  * @static
 */
BB.Log4NS.Level.TRACE = new BB.Log4NS.Level(BB.Log4NS.Level.TRACE_INT, "TRACE");
/**
  * Logging Level All - All traces are enabled
  * @type Log4NS.Level
  * @static
 */
BB.Log4NS.Level.ALL = new BB.Log4NS.Level(BB.Log4NS.Level.ALL_INT, "ALL");

/* global Log4NS */

/**
  * Logger to log messages to the defined appender.</p>
  * Default appender is Appender, which is ignoring all messages. Please
  * use setAppender() to set a specific appender (e.g. ConsoleAppender).
  * use {@see Log4NS#getLogger(String)} to get an instance.
  * @constructor
  * @param name name of category to log to
  * @author Brendan Boyd
 */
BB.Log4NS.Logger = function(name) {
    this.loggingEvents = [];
    this.appenders = [];
    /** category of logger */
    this.category = name || "";
    /** level to be logged */
    this.level = BB.Log4NS.Level.FATAL;

    this.dateformat = BB.Log4NS.DateFormatter.DEFAULT_DATE_FORMAT;
    this.dateformatter = new BB.Log4NS.DateFormatter();

    this.onlog = new BB.Log4NS.CustomEvent();
    this.onclear = new BB.Log4NS.CustomEvent();

    /** appender to write in */
    this.appenders.push(new BB.Log4NS.Appender(this));
};

BB.Log4NS.Logger.prototype = {

    /**
      * add additional appender. DefaultAppender always is there.
      * @param appender additional wanted appender
     */
    addAppender: function(appender) {
        if (appender instanceof BB.Log4NS.Appender) {
            appender.setLogger(this);
            this.appenders.push(appender);
        } else {
            throw "Not instance of an Appender: " + appender;
        }
    },

    /**
      * set Array of appenders. Previous Appenders are cleared and removed.
      * @param {Array} appenders Array of Appenders
     */
    setAppenders: function(appenders) {
        //clear first all existing appenders
        for(var i = 0; i < this.appenders.length; i++) {
            this.appenders[i].doClear();
        }

        this.appenders = appenders;

        for(var j = 0; j < this.appenders.length; j++) {
            this.appenders[j].setLogger(this);
        }
    },

    /**
      * Set the Loglevel default is LogLEvel.TRACE
      * @param level wanted logging level
     */
    setLevel: function(level) {
        this.level = level;
    },

    /**
      * main log method logging to all available appenders
      * @private
     */
    log: function(logLevel, data) {
        var loggingEvent = new BB.Log4NS.LoggingEvent(this.category, logLevel,
                                                   data, this);
        this.loggingEvents.push(loggingEvent);
        this.onlog.dispatch(loggingEvent);
    },

    /** clear logging */
    clear : function () {
        try{
            this.loggingEvents = [];
            this.onclear.dispatch();

        } catch(e){}

    },
    /** checks if Level Trace is enabled */
    isTraceEnabled: function() {
        if (this.level.valueOf() <= BB.Log4NS.Level.TRACE.valueOf()) {
            return true;

        }
        return false;

    },
    /**
      * Trace data
      * @param data {Array} data to be logged
     */
    trace: function(data) {
        if (this.isTraceEnabled()) {
            this.log(BB.Log4NS.Level.TRACE, data, null);

        }

    },
    /** checks if Level Debug is enabled */
    isDebugEnabled: function() {
        if (this.level.valueOf() <= BB.Log4NS.Level.DEBUG.valueOf()) {
            return true;

        }
        return false;

    },
    /**
      * Debug data
      * @param {Array} data data to be logged
     */
    debug: function(data) {
        if (this.isDebugEnabled()) {
            this.log(BB.Log4NS.Level.DEBUG, data);

        }

    },
    /** checks if Level Info is enabled */
    isInfoEnabled: function() {
        if (this.level.valueOf() <= BB.Log4NS.Level.INFO.valueOf()) {
            return true;

        }
        return false;

    },
    /**
      * logging info data
      * @param {Object} data  data to be logged
     */
    info: function(data) {
        if (this.isInfoEnabled()) {
            this.log(BB.Log4NS.Level.INFO, data);

        }

    },
    /** checks if Level Warn is enabled */
    isWarnEnabled: function() {
        if (this.level.valueOf() <= BB.Log4NS.Level.WARN.valueOf()) {
            return true;

        }
        return false;

    },

    /** logging warn data */
    warn: function(data) {
        if (this.isWarnEnabled()) {
            this.log(BB.Log4NS.Level.WARN, data);

        }

    },
    /** checks if Level Error is enabled */
    isErrorEnabled: function() {
        if (this.level.valueOf() <= BB.Log4NS.Level.ERROR.valueOf()) {
            return true;

        }
        return false;

    },
    /** logging error data */
    error: function(data) {
        if (this.isErrorEnabled()) {
            this.log(BB.Log4NS.Level.ERROR, data);

        }

    },
    /** checks if Level Fatal is enabled */
    isFatalEnabled: function() {
        if (this.level.valueOf() <= BB.Log4NS.Level.FATAL.valueOf()) {
            return true;

        }
        return false;

    },
    /** logging fatal data */
    fatal: function(data) {
        if (this.isFatalEnabled()) {
            this.log(BB.Log4NS.Level.FATAL, data);

        }

    },

    /**
      * Set the date format of logger. Following switches are supported:
      * <ul>
      * <li>yyyy - The year</li>
      * <li>MM - the month</li>
      * <li>dd - the day of month<li>
      * <li>hh - the hour<li>
      * <li>mm - minutes</li>
      * <li>O - timezone offset</li>
      * </ul>
      * @param {String} format format String for the date
      * @see {@getTimestamp}
     */
    setDateFormat: function(format) {
        this.dateformat = format;

    },

    /**
      * Generates a timestamp using the format set in {Log4NS.DateFormatter.formatDate}.
      * @param {Date} date the date to format
      * @see {@setDateFormat}
      * @return A formatted timestamp with the current date and time.
     */
    getFormattedTimestamp: function(date) {
        return this.dateformatter.formatDate(date, this.dateformat);

    }

}

/* global Log4NS */

/**
  * Models a logging event.
  * @constructor
  * @param {String} categoryName name of category
  * @param {Log4NS.Level} level level of message
  * @param {Array} data data to log
  * @param {Log4NS.Logger} logger the associated logger
  * @author Brendan Boyd
 */
BB.Log4NS.LoggingEvent = function(categoryName, level, data, logger) {
    /**
      * the timestamp of the Logging Event
      * @type Date
      * @private
     */
    this.startTime = new Date();
    /**
      * category of event
      * @type String
      * @private
     */
    this.categoryName = categoryName;
    /**
      * the logging data
      * @type Array
      * @private
     */
    this.data = data;
    /**
      * level of log
      * @type Log4NS.Level
      * @private
     */
    this.level = level;
    /**
      * reference to logger
      * @type Log4NS.Logger
      * @private
     */
    this.logger = logger;

};

BB.Log4NS.LoggingEvent.prototype = {
/**
  * get the timestamp formatted as String.
  * @return {String} formatted timestamp
  * @see Log4NS#setDateFormat()
 */
    getFormattedTimestamp: function() {
        if(this.logger) {
            return this.logger.getFormattedTimestamp(this.startTime);

        } else {
            return this.startTime.toGMTString();

        }

    }
}

/**
 * @constructor
 * @extends Log4NS.Appender
 * @param logger log4ns instance this appender is attached to
 * @name ApiStatus.js
 * @author Brendan Boyd
 */
BB.Log4NS.ApiStatus = function(){
    this.layout = new BB.Log4NS.CustomRecord();
    try {
    } catch(e){
        throw e;
    }
};

BB.Log4NS.ApiStatus.prototype = BB.Log4NS.extend(new BB.Log4NS.Appender(), {
    doAppend: function(loggingEvent){
        var _this = this;
        if(Environment.isSs1()){
        } else {
            require(['N/record', 'N/search'], function(record, search){
                var now = new Date();
                var logLevel = _this.mapLoggingLevel(loggingEvent.level.toString());
                var formatOjb = _this.layout.format(loggingEvent);

                var status = record.create({
                    type: 'customrecord_api_status'
                });
                status.setValue({
                    fieldId: 'name',
                    value: [formatOjb['custrecord_api_status_category'], now.toISOString()].join('-')
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_category',
                    value: formatOjb['custrecord_api_status_category']
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_level',
                    value: logLevel
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_request',
                    value: formatOjb['custrecord_api_status_request']
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_response',
                    value: formatOjb['custrecord_api_status_response']
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_transaction',
                    value: formatOjb['custrecord_api_status_transaction']
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_error',
                    value: formatOjb['custrecord_api_status_error']
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_related_item',
                    value: formatOjb['custrecord_api_status_related_item']
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_related_trans',
                    value: formatOjb['custrecord_api_status_related_trans']
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_related_entity',
                    value: formatOjb['custrecord_api_status_related_entity']
                });
                status.setValue({
                    fieldId: 'custrecord_api_status_expiration_date',
                    value: _this.getExpirationDate(search)
                });

                status.save();
            });
        }
    },
    mapLoggingLevel: function(logLevel){
        var levels = {
            TRACE: 1,
            DEBUG: 2,
            INFO: 3,
            WARN: 4,
            ERROR: 5,
            FATAL: 6
        };
        return levels[logLevel];
    },
    getExpirationDate: function(search){
        var retentionCount = 90;
        var results =  search.create({
            type: "customrecord_blue_banyan_config",
            filters: [
                ["name","startswith","Default"],
                "AND",
                ["isinactive","is","F"]
            ],
            columns: [
                search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC
                }),
                "custrecord_api_status_log_retention_cnt"
            ]

        }).run().getRange({start:0, end:100});
        if(results && results.length > 0){
            retentionCount = results[0].getValue({
                name: 'custrecord_api_status_log_retention_cnt'
            });
        }
        var now = new Date();
        var expirationDate = now.setDate(retentionCount);
        return new Date(expirationDate);
    }
});

/**
 * @constructor
 * @extends Log4NS.Appender
 * @param logger log4ns instance this appender is attached to
 * @author Brendan Boyd
 */
BB.Log4NS.Console = function(){
    this.layout = new BB.Log4NS.BasicLayout();
    try {
    } catch(e){
        throw e;
    }
};

BB.Log4NS.Console.prototype = BB.Log4NS.extend(new BB.Log4NS.Appender(), {
    doAppend: function(loggingEvent){
        try{
            if(Environment.isSs1()){
                this.mapSs1Level(loggingEvent);
            } else {
                this.mapSs2Level(loggingEvent);
            }
        } catch(e){
            throw e;
        }
    },

    mapSs1Level: function(loggingEvent){
        switch (loggingEvent.level) {
        case BB.Log4NS.Level.DEBUG:
            nlapiLogExecutions("DEBUG", loggingEvent.categoryName, loggingEvent.data.join(' '));
            break;
        case BB.Log4NS.Level.INFO:
            nlapiLogExecutions("AUDIT", loggingEvent.categoryName, loggingEvent.data.join(' '));
            break;
        case BB.Log4NS.Level.ERROR:
            nlapiLogExecutions("ERROR", loggingEvent.categoryName, loggingEvent.data.join(' '));
            break;
        case BB.Log4NS.Level.FATAL:
            nlapiLogExecutions("EMERGENCY", loggingEvent.categoryName, loggingEvent.data.join(' '));
            break;
        default:
            break;
        }
    },

    mapSs2Level: function(loggingEvent){
        switch (loggingEvent.level) {
        case BB.Log4NS.Level.DEBUG:
            require(['N/log'], function(log){
                log.debug(loggingEvent.categoryName, loggingEvent.data.join(' '));
            });
            break;
        case BB.Log4NS.Level.INFO:
            require(['N/log'], function(log){
                log.audit(loggingEvent.categoryName, loggingEvent.data.join(' '));
            });
            break;
        case BB.Log4NS.Level.ERROR:
            require(['N/log'], function(log){
                log.error(loggingEvent.categoryName, loggingEvent.data.join(' '));
            });
            break;
        case BB.Log4NS.Level.FATAL:
            require(['N/log'], function(log){
                log.emergency(loggingEvent.categoryName, loggingEvent.data.join(' '));
            });
            break;
        default:
            break;
        }
    }
});

/**
 * @fileOverview
 * @name Email.js
 * @author Brendan Boyd
 */

/**
 * @fileOverview
 * @name File.js
 * @author Brendan Boyd
 */

/**
 * @fileOverview
 * @name Slack.js
 * @author Brendan Boyd
 */

/* global Log4NS */

/**
  * BasicLayout is a simple layout for storing the loggs. The loggs are stored
  * in following format:
  * <pre>
  * categoryName~startTime [logLevel] message\n
  * </pre>
  *
  * @constructor
  * @extends Log4NS.Layout
  * @author Stephan Strittmatter
 */
BB.Log4NS.BasicLayout = function() {
    this.LINE_SEP  = "\n";

};

BB.Log4NS.BasicLayout.prototype = BB.Log4NS.extend(new BB.Log4NS.Layout(), /** @lends BB.Log4NS.BasicLayout# */ {
    /**
      * Implement this method to create your own layout format.
      * @param {Log4NS.LoggingEvent} loggingEvent loggingEvent to format
      * @return formatted String
      * @type String
     */
    format: function(loggingEvent) {
        return loggingEvent.categoryName + "~" + loggingEvent.startTime.toLocaleString() + " [" + loggingEvent.level.toString() + "] " + loggingEvent.data.join(' ') + this.LINE_SEP;

    },
    /**
      * Returns the content type output by this layout.
      * @return The base class returns "text/plain".
      * @type String
     */
    getContentType: function() {
        return "text/plain";

    },
    /**
      * @return Returns the header for the layout format. The base class returns null.
      * @type String
     */
    getHeader: function() {
        return "";

    },
    /**
      * @return Returns the footer for the layout format. The base class returns null.
      * @type String
     */
    getFooter: function() {
        return "";

    }

})

/* global Log4NS */

/**
  * CustomRecord is a layout for storing logs in a netsuite logging table.
  *
  * @constructor
  * @extends Log4NS.Layout
  * @author Brendan Boyd
 */
BB.Log4NS.CustomRecord = function() {
    this.LINE_SEP  = "\n";

};

BB.Log4NS.CustomRecord.prototype = BB.Log4NS.extend(new BB.Log4NS.Layout(), /** @lends Log4NS.CustomRecord# */ {
    /**
      * Implement this method to create your own layout format.
      * @param {Log4NS.LoggingEvent} loggingEvent loggingEvent to format
      * @return formatted String
      * @type String
     */
    format: function(loggingEvent) {
        return {
            custrecord_api_status_category: loggingEvent.categoryName,
            custrecord_api_status_level: loggingEvent.level,
            custrecord_api_status_request: loggingEvent.data[0] || null,
            custrecord_api_status_response: loggingEvent.data[1] || null,
            custrecord_api_status_transaction: loggingEvent.data[2] || null,
            //completion_status: loggingEvent.data[0],
            custrecord_api_status_error: loggingEvent.data[3] || null,
            custrecord_api_status_related_item: loggingEvent.data[4] || null,
            custrecord_api_status_related_trans: loggingEvent.data[5] || null,
            custrecord_api_status_related_entity: loggingEvent.data[6] || null
            //related_custom_record:loggingEvent.data[0],
            //related_custom_record_type:loggingEvent.data[0],
        };
    },
    /**
      * Returns the content type output by this layout.
      * @return The base class returns "text/plain".
      * @type String
     */
    getContentType: function() {
        return "application/javascript";

    }
})

/* global Log4NS */

/**
  * SimpleLayout consists of the level of the log statement, followed by " - "
  * and then the log message itself. For example,
  * <code>DEBUG - Hello world</code>
  *
  * @constructor
  * @extends Log4NS.Layout
  * @author Stephan Strittmatter
 */
BB.Log4NS.SimpleLayout = function() {
    this.LINE_SEP  = "\n";
    this.LINE_SEP_LEN = 1;

};

BB.Log4NS.SimpleLayout.prototype = BB.Log4NS.extend(new BB.Log4NS.Layout(), /** @lends Log4NS.SimpleLayout# */ {
    /**
      * Implement this method to create your own layout format.
      * @param {Log4NS.LoggingEvent} loggingEvent loggingEvent to format
      * @return formatted String
      * @type String
     */
    format: function(loggingEvent) {
        return loggingEvent.level.toString() + " - " + loggingEvent.data.join(' ') + this.LINE_SEP;

    },
    /**
      * Returns the content type output by this layout.
      * @return The base class returns "text/plain".
      * @type String
     */
    getContentType: function() {
        return "text/plain";

    },
    /**
      * @return Returns the header for the layout format. The base class returns null.
      * @type String
     */
    getHeader: function() {
        return "";

    },
    /**
      * @return Returns the footer for the layout format. The base class returns null.
      * @type String
     */
    getFooter: function() {
        return "";

    }

})

if (typeof define === 'function') {
    define(function() {
        return BB.Log4NS;
    });
}

function GovernanceEventProcessor(){
    var _this = this;
    EventProcessor.apply(this);
}
GovernanceEventProcessor.prototype =  Object.create(EventProcessor.prototype);
GovernanceEventProcessor.prototype.constructor = GovernanceEventProcessor;
GovernanceEventProcessor.prototype.register = function(emitter){
    var _this = this;
    if(emitter instanceof EventEmitter){
        emitter.add(/^.*$/g, function(e){
            var _event = e;
            if(_event instanceof ObjectEvent){
                _event.governance = GovernanceEventProcessor.Mapping.getGovernance(_event.type, _event.target.group);
                _this.events.push(_event);
            }
        });
    }
}
GovernanceEventProcessor.prototype.summary = function(type){
    var _this = this,
        _type = type,
        _filter = /.*/g,
        _filtered = [],
        _amount = 0;
    if(typeof _type === 'string' && _type.trim().length > 0){
        _filter = new RegExp('^' + _type + '$', 'g');
    } else if(_type instanceof RegExp){
        _filter = _type;
    }
    _filtered = _this.events.filter(function(evt){
        return _filter.test(evt.type);
    });
    _filtered.forEach(function(evt){
        if(typeof evt.governance === 'number'){
            _amount += evt.governance;
        }
    });
    return {
        filter: _filter,
        count: _filtered.length,
        amount: _amount
    }
}
Object.defineProperties(GovernanceEventProcessor, {
    'Mapping': {
        configurable: false,
        writable: false,
        enumerable: true,
        value: (function(){
            var _map = {},
                _mapper =  function(){
                    var _key = arguments[0],
                        _group = arguments[1],
                        _governance = arguments[2];
                    if(typeof _key === 'string'){
                        if(typeof _governance === 'undefined' && typeof _group !== 'string'){
                            _governance = _group;
                            _group = '*';
                        }
                        if(typeof _map[_key] === 'undefined'){
                            Object.defineProperty(_map, _key, {
                                writable: false,
                                configurable: false,
                                enumerable: true,
                                value: {}
                            });
                        }
                        Object.defineProperty(_map[_key], _group, {
                            writable: false,
                            configurable: false,
                            enumerable: true,
                            value: _governance
                        })
                    }
                };
            _mapper(Record.Events.Attach, 10);
            _mapper(Record.Events.Copy, 5);
            _mapper(Record.Events.Copy, Record.Group.Custom, 2);
            _mapper(Record.Events.Copy, Record.Group.Transaction, 10);
            _mapper(Record.Events.Create, 5);
            _mapper(Record.Events.Create, Record.Group.Custom, 2);
            _mapper(Record.Events.Create, Record.Group.Transaction, 10);
            _mapper(Record.Events.Delete, 10);
            _mapper(Record.Events.Delete, Record.Group.Custom, 4);
            _mapper(Record.Events.Delete, Record.Group.Transaction, 20);
            _mapper(Record.Events.Detach, 10);
            _mapper(Record.Events.Load, 5);
            _mapper(Record.Events.Load, Record.Group.Custom, 2);
            _mapper(Record.Events.Load, Record.Group.Transaction, 10);
            _mapper(Record.Events.Submit, 5);
            _mapper(Record.Events.Submit, Record.Group.Custom, 2);
            _mapper(Record.Events.Submit, Record.Group.Transaction, 10);
            _mapper(Record.Events.Transform, 5);
            _mapper(Record.Events.Transform, Record.Group.Custom, 2);
            _mapper(Record.Events.Transform, Record.Group.Transaction, 10);
            _mapper(Record.Events.Save, 10);
            _mapper(Record.Events.Save, Record.Group.Custom, 4);
            _mapper(Record.Events.Save, Record.Group.Transaction, 20);
            _mapper(SearchItem.Events.Load, 5);
            _mapper(SearchItem.Events.Delete, 5);
            _mapper(SearchItem.Events.Duplicate, 10);
            _mapper(SearchItem.Events.Global, 10);
            _mapper(SearchItem.Events.Lookup, 1);
            _mapper(SearchItem.Events.RunPaged, 5);
            _mapper(SearchItem.Events.Save, 5);
            _mapper(SearchItem.Events.GetRange, 10);
            _mapper(SearchItem.Events.Each, 10);
            _mapper(SearchItem.Events.Next, 5);
            _mapper(SearchItem.Events.Prev, 5);
            _mapper(SearchItem.Events.Fetch, 5);

            _map.getGovernance = function(){
                var _key = arguments[0],
                    _group = typeof arguments[1] === 'string' ? arguments[1] : '*';
                if(_map.hasOwnProperty(_key)){
                    if(!_map[_key].hasOwnProperty(_group)){
                       _group = '*';
                    }
                    return _map[_key][_group];
                }
                return undefined;
            }
            return _map;
        })()
    }
});


function LoggingEventProcessor() {
    var _this = this,
        _id = 'logging-' + Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36),
        _logger = BB.Log4NS.getLogger(_id);
    _logger.addAppender(new BB.Log4NS.Console(_logger));
    EventProcessor.apply(this);
    Object.defineProperties(this, {
        'logger': {
            enumerable: true,
            writable: false,
            value: _logger
        }
    });
}
LoggingEventProcessor.prototype = Object.create(EventProcessor.prototype);
LoggingEventProcessor.prototype.constructor = LoggingEventProcessor;
LoggingEventProcessor.prototype.register = function(target){
    var _this = this;
    if(target instanceof EventEmitter){
        target.add(/^.*$/g, function(e){
            var _source = this,
                _event = e;
            if(_event instanceof ObjectEvent){
                _this.logger.debug([JSON.stringify(_event)]);
                _this.events.push(_event);
            }
        });
    }
}