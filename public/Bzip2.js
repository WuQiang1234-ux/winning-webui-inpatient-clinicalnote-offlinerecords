!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).Bzip2=t()}(this,(function(){"use strict";var e=Object.freeze?Object.freeze:function(e){return e},t=function(){};t.prototype.readByte=function(){var e=[0];return 0===this.read(e,0,1)?(this._eof=!0,-1):e[0]},t.prototype.read=function(e,t,r){for(var n,o=0;o<r;){if(-1===(n=this.readByte())){this._eof=!0;break}e[t+o++]=n}return o},t.prototype.eof=function(){return!!this._eof},t.prototype.seek=function(e){throw new Error("Stream is not seekable.")},t.prototype.tell=function(){throw new Error("Stream is not seekable.")},t.prototype.writeByte=function(e){var t=[e];this.write(t,0,1)},t.prototype.write=function(e,t,r){var n;for(n=0;n<r;n++)this.writeByte(e[t+n]);return r},t.prototype.flush=function(){},t.EOF=-1;var r=e(t),n=function(e){(function(){var t=256;this.readBit=function(){if(0==(255&t)){var n=e.readByte();if(n===r.EOF)return this._eof=!0,n;t=n<<1|1}var o=256&t?1:0;return t<<=1,o},this.seekBit=function(e){var t=e>>>3,r=e-8*t;this.seek(t),this._eof=!1,this.readBits(r)},this.tellBit=function(){for(var r=8*e.tell(),n=t;0!=(255&n);)r--,n<<=1;return r},this.readByte=function(){return 0==(255&t)?e.readByte():this.readBits(8)},this.seek=function(r){e.seek(r),t=256}}).call(this),function(){var t=1;this.writeBit=function(r){t<<=1,r&&(t|=1),256&t&&(e.writeByte(255&t),t=1)},this.writeByte=function(r){1===t?e.writeByte(r):e.writeBits(8,r)},this.flush=function(){for(;1!==t;)this.writeBit(0);e.flush&&e.flush()}}.call(this)};function o(e){return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o(e)}n.EOF=r.EOF,(n.prototype=Object.create(r.prototype)).readBits=function(e){var t,r=0;if(e>31)return(r=65536*this.readBits(e-16))+this.readBits(16);for(t=0;t<e;t++)r<<=1,this.readBit()>0&&r++;return r},n.prototype.writeBits=function(e,t){if(e>32){var r=65535&t,n=(t-r)/65536;return this.writeBits(e-16,n),void this.writeBits(16,r)}var o;for(o=e-1;o>=0;o--)this.writeBit(t>>>o&1)};var i=Object.create(null),f=r.EOF;i.coerceInputStream=function(e,t){if("readByte"in e){if(t&&!("read"in e)){var n=e;(e=new r).readByte=function(){var e=n.readByte();return e===f&&(this._eof=!0),e},"size"in n&&(e.size=n.size),"seek"in n&&(e.seek=function(e){n.seek(e),this._eof=!1}),"tell"in n&&(e.tell=n.tell.bind(n))}}else{var o=e;(e=new r).size=o.length,e.pos=0,e.readByte=function(){return this.pos>=this.size?f:o[this.pos++]},e.read=function(e,t,r){for(var n=0;n<r&&this.pos<o.length;)e[t++]=o[this.pos++],n++;return n},e.seek=function(e){this.pos=e},e.tell=function(){return this.pos},e.eof=function(){return this.pos>=o.length}}return e};var a=function(e,t){this.buffer=e,this.resizeOk=t,this.pos=0};(a.prototype=Object.create(r.prototype)).writeByte=function(e){if(this.resizeOk&&this.pos>=this.buffer.length){var t=i.makeU8Buffer(2*this.buffer.length);t.set(this.buffer),this.buffer=t}this.buffer[this.pos++]=e},a.prototype.getBuffer=function(){if(this.pos!==this.buffer.length){if(!this.resizeOk)throw new TypeError("outputsize does not match decoded input");var e=i.makeU8Buffer(this.pos);e.set(this.buffer.subarray(0,this.pos)),this.buffer=e}return this.buffer},i.coerceOutputStream=function(e,t){var r={stream:e,retval:e};if(e){if("object"===o(e)&&"writeByte"in e)return r;"number"==typeof t?(console.assert(t>=0),r.stream=new a(i.makeU8Buffer(t),!1)):r.stream=new a(e,!1)}else r.stream=new a(i.makeU8Buffer(16384),!0);return Object.defineProperty(r,"retval",{get:r.stream.getBuffer.bind(r.stream)}),r},i.compressFileHelper=function(e,t,r){return function(n,o,f){n=i.coerceInputStream(n);var a,u,s=i.coerceOutputStream(o,o);for(o=s.stream,a=0;a<e.length;a++)o.writeByte(e.charCodeAt(a));if(u="size"in n&&n.size>=0?n.size:-1,r){var c=i.coerceOutputStream([]);for(i.writeUnsignedNumber(c.stream,u+1),c=c.retval,a=0;a<c.length-1;a++)o.writeByte(c[a]);r=c[c.length-1]}else i.writeUnsignedNumber(o,u+1);return t(n,o,u,f,r),s.retval}},i.decompressFileHelper=function(e,t){return function(r,n){var o;for(r=i.coerceInputStream(r),o=0;o<e.length;o++)if(e.charCodeAt(o)!==r.readByte())throw new Error("Bad magic");var f=i.readUnsignedNumber(r)-1,a=i.coerceOutputStream(n,f);return n=a.stream,t(r,n,f),a.retval}},i.compressWithModel=function(e,t,r){for(var n=0;n!==t;){var o=e.readByte();if(o===f){r.encode(256);break}r.encode(o),n++}},i.decompressWithModel=function(e,t,r){for(var n=0;n!==t;){var o=r.decode();if(256===o)break;e.writeByte(o),n++}},i.writeUnsignedNumber=function(e,t){console.assert(t>=0);var r,n=[];do{n.push(127&t),t=Math.floor(t/128)}while(0!==t);for(n[0]|=128,r=n.length-1;r>=0;r--)e.writeByte(n[r]);return e},i.readUnsignedNumber=function(e){for(var t,r=0;;){if(128&(t=e.readByte())){r+=127&t;break}r=128*(r+t)}return r};var u=function(e){for(var t=0,r=e.length;t<r;t++)e[t]=0;return e},s=function(e){return u(new Array(e))},c=function(e){return e};"undefined"!=typeof process&&Array.prototype.some.call(new Uint32Array(128),(function(e){return 0!==e}))&&(c=u),i.makeU8Buffer="undefined"!=typeof Uint8Array?function(e){return c(new Uint8Array(e))}:"undefined"!=typeof Buffer?function(e){var t=new Buffer(e);return t.fill(0),t}:s,i.makeU16Buffer="undefined"!=typeof Uint16Array?function(e){return c(new Uint16Array(e))}:s,i.makeU32Buffer="undefined"!=typeof Uint32Array?function(e){return c(new Uint32Array(e))}:s,i.makeS32Buffer="undefined"!=typeof Int32Array?function(e){return c(new Int32Array(e))}:s,i.arraycopy=function(e,t){console.assert(e.length>=t.length);for(var r=0,n=t.length;r<n;r++)e[r]=t[r];return e};var h=[0,1,2,2,3,3,3,3,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8];console.assert(256===h.length);var l=i.fls=function(e){return console.assert(e>=0),e>4294967295?32+l(Math.floor(e/4294967296)):0!=(4294901760&e)?0!=(4278190080&e)?24+h[e>>>24&255]:16+h[e>>>16]:0!=(65280&e)?8+h[e>>>8]:h[e]};i.log2c=function(e){return 0===e?-1:l(e-1)};var d=e(i),p=console.assert.bind(console),B=function(e,t,r,n){var o;for(o=0;o<n;o++)t[o]=0;for(o=0;o<r;o++)t[e[o]]++},m=function(e,t,r,n){var o,i=0;if(n)for(o=0;o<r;o++)i+=e[o],t[o]=i;else for(o=0;o<r;o++)i+=e[o],t[o]=i-e[o]},v=function e(t,r,n,o,i,f){var a,u,s,c,h,l,v,w,E,g,y,b,_=0,R=0;for(i<=256?(a=d.makeS32Buffer(i),i<=n?(u=r.subarray(o+n-i),R=1):(u=d.makeS32Buffer(i),R=3)):i<=n?(a=r.subarray(o+n-i),i<=n-i?(u=r.subarray(o+n-2*i),R=0):i<=1024?(u=d.makeS32Buffer(i),R=2):(u=a,R=8)):(a=u=d.makeS32Buffer(i),R=12),B(t,a,o,i),m(a,u,i,!0),s=0;s<o;s++)r[s]=0;h=-1,s=o-1,c=o,l=0,y=t[o-1];do{b=y}while(--s>=0&&(y=t[s])>=b);for(;s>=0;){do{b=y}while(--s>=0&&(y=t[s])<=b);if(s>=0){h>=0&&(r[h]=c),h=--u[b],c=s,++l;do{b=y}while(--s>=0&&(y=t[s])>=b)}}if(l>1?(!function(e,t,r,n,o,i){var f,a,u,s,c;for(r===n&&B(e,r,o,i),m(r,n,i,!1),f=n[c=e[u=o-1]],u--,t[f++]=e[u]<c?~u:u,a=0;a<o;a++)(u=t[a])>0?(p(e[u]>=e[u+1]),(s=e[u])!==c&&(n[c]=f,f=n[c=s]),p(a<f),u--,t[f++]=e[u]<c?~u:u,t[a]=0):u<0&&(t[a]=~u);for(r===n&&B(e,r,o,i),m(r,n,i,1),a=o-1,f=n[c=0];a>=0;a--)(u=t[a])>0&&(p(e[u]<=e[u+1]),(s=e[u])!==c&&(n[c]=f,f=n[c=s]),p(f<=a),u--,t[--f]=e[u]>c?~(u+1):u,t[a]=0)}(t,r,a,u,o,i),E=function(e,t,r,n){var o,i,f,a,u,s,c,h,l,d;for(p(r>0),o=0;(f=t[o])<0;o++)t[o]=~f,p(o+1<r);if(o<n)for(i=o,o++;p(o<r),!((f=t[o])<0&&(t[i++]=~f,t[o]=0,i===n));o++);h=e[o=i=r-1];do{l=h}while(--o>=0&&(h=e[o])>=l);for(;o>=0;){do{l=h}while(--o>=0&&(h=e[o])<=l);if(o>=0){t[n+(o+1>>>1)]=i-o,i=o+1;do{l=h}while(--o>=0&&(h=e[o])>=l)}}for(o=0,c=0,a=r,s=0;o<n;o++){if(d=!0,(u=t[n+((f=t[o])>>>1)])===s&&a+u<r){for(i=0;i<u&&e[f+i]===e[a+i];)i++;i===u&&(d=!1)}d&&(c++,a=f,s=u),t[n+(f>>>1)]=c}return c}(t,r,o,l)):1===l?(r[h]=c+1,E=1):E=0,E<l){for(0!=(4&R)&&(a=null,u=null),0!=(2&R)&&(u=null),g=o+n-2*l,0==(13&R)&&(i+E<=g?g-=i:R|=8),p(o>>>1<=g+l),s=l+(o>>>1)-1,c=2*l+g-1;l<=s;s--)0!==r[s]&&(r[c--]=r[s]-1);e(r.subarray(l+g),r,g,l,E,!1),null,s=o-1,c=2*l-1,y=t[o-1];do{b=y}while(--s>=0&&(y=t[s])>=b);for(;s>=0;){do{b=y}while(--s>=0&&(y=t[s])<=b);if(s>=0){r[c--]=s+1;do{b=y}while(--s>=0&&(y=t[s])>=b)}}for(s=0;s<l;s++)r[s]=r[l+r[s]];0!=(4&R)&&(a=u=d.makeS32Buffer(i)),0!=(2&R)&&(u=d.makeS32Buffer(i))}if(0!=(8&R)&&B(t,a,o,i),l>1){m(a,u,i,!0),s=l-1,c=o,b=t[v=r[l-1]];do{for(w=u[y=b];w<c;)r[--c]=0;do{if(r[--c]=v,--s<0)break;v=r[s]}while((b=t[v])===y)}while(s>=0);for(;c>0;)r[--c]=0}return f?_=function(e,t,r,n,o,i){var f,a,u,s,c,h=-1;for(r===n&&B(e,r,o,i),m(r,n,i,!1),f=n[c=e[u=o-1]],t[f++]=u>0&&e[u-1]<c?~u:u,a=0;a<o;a++)(u=t[a])>0?(u--,p(e[u]>=e[u+1]),t[a]=~(s=e[u]),s!==c&&(n[c]=f,f=n[c=s]),p(a<f),t[f++]=u>0&&e[u-1]<c?~u:u):0!==u&&(t[a]=~u);for(r===n&&B(e,r,o,i),m(r,n,i,!0),a=o-1,f=n[c=0];a>=0;a--)(u=t[a])>0?(u--,p(e[u]<=e[u+1]),t[a]=s=e[u],s!==c&&(n[c]=f,f=n[c=s]),p(f<=a),t[--f]=u>0&&e[u-1]>c?~e[u-1]:u):0!==u?t[a]=~u:h=a;return h}(t,r,a,u,o,i):function(e,t,r,n,o,i){var f,a,u,s,c;for(r===n&&B(e,r,o,i),m(r,n,i,!1),f=n[c=e[u=o-1]],t[f++]=u>0&&e[u-1]<c?~u:u,a=0;a<o;a++)u=t[a],t[a]=~u,u>0&&(u--,p(e[u]>=e[u+1]),(s=e[u])!==c&&(n[c]=f,f=n[c=s]),p(a<f),t[f++]=u>0&&e[u-1]<c?~u:u);for(r===n&&B(e,r,o,i),m(r,n,i,!0),a=o-1,f=n[c=0];a>=0;a--)(u=t[a])>0?(u--,p(e[u]<=e[u+1]),(s=e[u])!==c&&(n[c]=f,f=n[c=s]),p(f<=a),t[--f]=0===u||e[u-1]>c?~u:u):t[a]=~u}(t,r,a,u,o,i),a=null,u=null,_},w=Object.create(null);w.suffixsort=function(e,t,r,n){if(p(e&&t&&e.length>=r&&t.length>=r),r<=1)return 1===r&&(t[0]=0),0;if(!n)if(1===e.BYTES_PER_ELEMENT)n=256;else{if(2!==e.BYTES_PER_ELEMENT)throw new Error("Need to specify alphabetSize");n=65536}return p(n>0),e.BYTES_PER_ELEMENT&&p(n<=1<<8*e.BYTES_PER_ELEMENT),v(e,t,0,r,n,!1)},w.bwtransform=function(e,t,r,n,o){var i,f;if(p(e&&t&&r),p(e.length>=n&&t.length>=n&&r.length>=n),n<=1)return 1===n&&(t[0]=e[0]),n;if(!o)if(1===e.BYTES_PER_ELEMENT)o=256;else{if(2!==e.BYTES_PER_ELEMENT)throw new Error("Need to specify alphabetSize");o=65536}for(p(o>0),e.BYTES_PER_ELEMENT&&p(o<=1<<8*e.BYTES_PER_ELEMENT),f=v(e,r,0,n,o,!0),t[0]=e[n-1],i=0;i<f;i++)t[i+1]=r[i];for(i+=1;i<n;i++)t[i]=r[i];return f+1},w.unbwtransform=function(e,t,r,n,o){var i,f,a=d.makeU32Buffer(256);for(i=0;i<256;i++)a[i]=0;for(i=0;i<n;i++)r[i]=a[e[i]]++;for(i=0,f=0;i<256;i++)f+=a[i],a[i]=f-a[i];for(i=n-1,f=0;i>=0;i--)f=r[f]+a[t[i]=e[f]],f+=f<o?1:0;a=null},w.bwtransform2=function(e,t,r,n){var o,i,f,a=0;if(p(e&&t),p(e.length>=r&&t.length>=r),r<=1)return 1===r&&(t[0]=e[0]),0;if(!n)if(1===e.BYTES_PER_ELEMENT)n=256;else{if(2!==e.BYTES_PER_ELEMENT)throw new Error("Need to specify alphabetSize");n=65536}if(p(n>0),e.BYTES_PER_ELEMENT&&p(n<=1<<8*e.BYTES_PER_ELEMENT),(f=e.length>=2*r?e:n<=256?d.makeU8Buffer(2*r):n<=65536?d.makeU16Buffer(2*r):d.makeU32Buffer(2*r))!==e)for(o=0;o<r;o++)f[o]=e[o];for(o=0;o<r;o++)f[r+o]=f[o];var u=d.makeS32Buffer(2*r);for(v(f,u,0,2*r,n,!1),o=0,i=0;o<2*r;o++){var s=u[o];s<r&&(0===s&&(a=i),--s<0&&(s=r-1),t[i++]=e[s])}return p(i===r),a};var E=e(w),g=d.arraycopy(d.makeU32Buffer(256),[0,79764919,159529838,222504665,319059676,398814059,445009330,507990021,638119352,583659535,797628118,726387553,890018660,835552979,1015980042,944750013,1276238704,1221641927,1167319070,1095957929,1595256236,1540665371,1452775106,1381403509,1780037320,1859660671,1671105958,1733955601,2031960084,2111593891,1889500026,1952343757,2552477408,2632100695,2443283854,2506133561,2334638140,2414271883,2191915858,2254759653,3190512472,3135915759,3081330742,3009969537,2905550212,2850959411,2762807018,2691435357,3560074640,3505614887,3719321342,3648080713,3342211916,3287746299,3467911202,3396681109,4063920168,4143685023,4223187782,4286162673,3779000052,3858754371,3904687514,3967668269,881225847,809987520,1023691545,969234094,662832811,591600412,771767749,717299826,311336399,374308984,453813921,533576470,25881363,88864420,134795389,214552010,2023205639,2086057648,1897238633,1976864222,1804852699,1867694188,1645340341,1724971778,1587496639,1516133128,1461550545,1406951526,1302016099,1230646740,1142491917,1087903418,2896545431,2825181984,2770861561,2716262478,3215044683,3143675388,3055782693,3001194130,2326604591,2389456536,2200899649,2280525302,2578013683,2640855108,2418763421,2498394922,3769900519,3832873040,3912640137,3992402750,4088425275,4151408268,4197601365,4277358050,3334271071,3263032808,3476998961,3422541446,3585640067,3514407732,3694837229,3640369242,1762451694,1842216281,1619975040,1682949687,2047383090,2127137669,1938468188,2001449195,1325665622,1271206113,1183200824,1111960463,1543535498,1489069629,1434599652,1363369299,622672798,568075817,748617968,677256519,907627842,853037301,1067152940,995781531,51762726,131386257,177728840,240578815,269590778,349224269,429104020,491947555,4046411278,4126034873,4172115296,4234965207,3794477266,3874110821,3953728444,4016571915,3609705398,3555108353,3735388376,3664026991,3290680682,3236090077,3449943556,3378572211,3174993278,3120533705,3032266256,2961025959,2923101090,2868635157,2813903052,2742672763,2604032198,2683796849,2461293480,2524268063,2284983834,2364738477,2175806836,2238787779,1569362073,1498123566,1409854455,1355396672,1317987909,1246755826,1192025387,1137557660,2072149281,2135122070,1912620623,1992383480,1753615357,1816598090,1627664531,1707420964,295390185,358241886,404320391,483945776,43990325,106832002,186451547,266083308,932423249,861060070,1041341759,986742920,613929101,542559546,756411363,701822548,3316196985,3244833742,3425377559,3370778784,3601682597,3530312978,3744426955,3689838204,3819031489,3881883254,3928223919,4007849240,4037393693,4100235434,4180117107,4259748804,2310601993,2373574846,2151335527,2231098320,2596047829,2659030626,2470359227,2550115596,2947551409,2876312838,2788305887,2733848168,3165939309,3094707162,3040238851,2985771188]),y=function(){var e=4294967295;this.getCRC=function(){return~e>>>0},this.updateCRC=function(t){e=e<<8^g[255&(e>>>24^t)]},this.updateCRCRun=function(t,r){for(;r-- >0;)e=e<<8^g[255&(e>>>24^t)]}},b=function(e,t,r){for(var n=e.length,o=t,i=e.length-2;t>=r&&e[t]%n>o;)i=t,t-=o-t+1;for(t=Math.max(r-1,t);i>t+1;){var f=t+i>>1;e[f]%n>o?i=f:t=f}return i},_=e({allocateHuffmanCodeLengths:function(e,t){switch(e.length){case 2:e[1]=1;case 1:return void(e[0]=1)}!function(e){var t,r,n,o,i=e.length;for(e[0]+=e[1],t=0,r=1,n=2;r<i-1;r++)n>=i||e[t]<e[n]?(o=e[t],e[t++]=r):o=e[n++],n>=i||t<r&&e[t]<e[n]?(o+=e[t],e[t++]=r+i):o+=e[n++],e[r]=o}(e);var r=function(e,t){var r,n=e.length-2;for(r=1;r<t-1&&n>1;r++)n=b(e,n-1,0);return n}(e,t);e[0]%e.length>=r?function(e){var t,r,n,o,i=e.length-2,f=e.length-1;for(t=1,r=2;r>0;t++){for(o=r-((n=i)-(i=b(e,n-1,0)));o>0;o--)e[f--]=t;r=n-i<<1}}(e):function(e,t,r){var n,o,i,f,a=e.length-2,u=e.length-1,s=1==r?2:1,c=1==r?t-2:t;for(n=s<<1;n>0;s++){for(o=a,a=a<=t?a:b(e,o-1,t),i=0,s>=r?i=Math.min(c,1<<s-r):s==r-1&&(i=1,e[a]==o&&a++),f=n-(o-a+i);f>0;f--)e[u--]=s;c-=i,n=o-a+i<<1}}(e,r,t-d.fls(r-1))}}),R=20,k=50,C=54156738319193,T=25779555029136,O=r.EOF,S=function(e,t){var r,n=e[t];for(r=t;r>0;r--)e[r]=e[r-1];return e[0]=n,n},A={OK:0,LAST_BLOCK:-1,NOT_BZIP_DATA:-2,UNEXPECTED_INPUT_EOF:-3,UNEXPECTED_OUTPUT_EOF:-4,DATA_ERROR:-5,OUT_OF_MEMORY:-6,OBSOLETE_INPUT:-7,END_OF_BLOCK:-8},U={};U[A.LAST_BLOCK]="Bad file checksum",U[A.NOT_BZIP_DATA]="Not bzip data",U[A.UNEXPECTED_INPUT_EOF]="Unexpected input EOF",U[A.UNEXPECTED_OUTPUT_EOF]="Unexpected output EOF",U[A.DATA_ERROR]="Data error",U[A.OUT_OF_MEMORY]="Out of memory",U[A.OBSOLETE_INPUT]="Obsolete (pre 0.9.5) bzip format not supported.";var z=function(e,t){var r=U[e]||"unknown error";t&&(r+=": "+t);var n=new TypeError(r);throw n.errorCode=e,n},N=function(e,t){this.writePos=this.writeCurrent=this.writeCount=0,this._start_bunzip(e,t)};N.prototype._init_block=function(){return this._get_next_block()?(this.blockCRC=new y,!0):(this.writeCount=-1,!1)},N.prototype._start_bunzip=function(e,t){var r=d.makeU8Buffer(4);4===e.read(r,0,4)&&"BZh"===String.fromCharCode(r[0],r[1],r[2])||z(A.NOT_BZIP_DATA,"bad magic");var o=r[3]-48;(o<1||o>9)&&z(A.NOT_BZIP_DATA,"level out of range"),this.reader=new n(e),this.dbufSize=1e5*o,this.nextoutput=0,this.outputStream=t,this.streamCRC=0},N.prototype._get_next_block=function(){var e,t,r,n=this.reader,o=n.readBits(48);if(o===T)return!1;o!==C&&z(A.NOT_BZIP_DATA),this.targetBlockCRC=n.readBits(32),this.streamCRC=(this.targetBlockCRC^(this.streamCRC<<1|this.streamCRC>>>31))>>>0,n.readBits(1)&&z(A.OBSOLETE_INPUT);var i=n.readBits(24);i>this.dbufSize&&z(A.DATA_ERROR,"initial position out of bounds");var f=n.readBits(16),a=d.makeU8Buffer(256),u=0;for(e=0;e<16;e++)if(f&1<<15-e){var s=16*e;for(r=n.readBits(16),t=0;t<16;t++)r&1<<15-t&&(a[u++]=s+t)}var c=n.readBits(3);(c<2||c>6)&&z(A.DATA_ERROR);var h=n.readBits(15);0===h&&z(A.DATA_ERROR);var l=d.makeU8Buffer(256);for(e=0;e<c;e++)l[e]=e;var p=d.makeU8Buffer(h);for(e=0;e<h;e++){for(t=0;n.readBits(1);t++)t>=c&&z(A.DATA_ERROR);p[e]=S(l,t)}var B,m=u+2,v=[];for(t=0;t<c;t++){var w,E,g=d.makeU8Buffer(m),y=d.makeU16Buffer(21);for(f=n.readBits(5),e=0;e<m;e++){for(;(f<1||f>R)&&z(A.DATA_ERROR),n.readBits(1);)n.readBits(1)?f--:f++;g[e]=f}for(w=E=g[0],e=1;e<m;e++)g[e]>E?E=g[e]:g[e]<w&&(w=g[e]);B={},v.push(B),B.permute=d.makeU16Buffer(258),B.limit=d.makeU32Buffer(22),B.base=d.makeU32Buffer(21),B.minLen=w,B.maxLen=E;var b=0;for(e=w;e<=E;e++)for(y[e]=B.limit[e]=0,f=0;f<m;f++)g[f]===e&&(B.permute[b++]=f);for(e=0;e<m;e++)y[g[e]]++;for(b=f=0,e=w;e<E;e++)b+=y[e],B.limit[e]=b-1,b<<=1,f+=y[e],B.base[e+1]=b-f;B.limit[E+1]=Number.MAX_VALUE,B.limit[E]=b+y[E]-1,B.base[w]=0}var _=d.makeU32Buffer(256);for(e=0;e<256;e++)l[e]=e;var k,O=0,U=0,N=0,L=this.dbuf=d.makeU32Buffer(this.dbufSize);for(m=0;;){for(m--||(m=49,N>=h&&z(A.DATA_ERROR),B=v[p[N++]]),e=B.minLen,t=n.readBits(e);e>B.maxLen&&z(A.DATA_ERROR),!(t<=B.limit[e]);e++)t=t<<1|n.readBits(1);((t-=B.base[e])<0||t>=258)&&z(A.DATA_ERROR);var P=B.permute[t];if(0!==P&&1!==P){if(O)for(O=0,U+f>this.dbufSize&&z(A.DATA_ERROR),_[k=a[l[0]]]+=f;f--;)L[U++]=k;if(P>u)break;U>=this.dbufSize&&z(A.DATA_ERROR),_[k=a[k=S(l,e=P-1)]]++,L[U++]=k}else O||(O=1,f=0),f+=0===P?O:2*O,O<<=1}for((i<0||i>=U)&&z(A.DATA_ERROR),t=0,e=0;e<256;e++)r=t+_[e],_[e]=t,t=r;for(e=0;e<U;e++)L[_[k=255&L[e]]]|=e<<8,_[k]++;var M=0,D=0,x=0;return U&&(D=255&(M=L[i]),M>>=8,x=-1),this.writePos=M,this.writeCurrent=D,this.writeCount=U,this.writeRun=x,!0},N.prototype._read_bunzip=function(e,t){var r,n,o;if(this.writeCount<0)return 0;var i=this.dbuf,f=this.writePos,a=this.writeCurrent,u=this.writeCount;this.outputsize;for(var s=this.writeRun;u;){for(u--,n=a,a=255&(f=i[f]),f>>=8,3==s++?(r=a,o=n,a=-1):(r=1,o=a),this.blockCRC.updateCRCRun(o,r);r--;)this.outputStream.writeByte(o),this.nextoutput++;a!=n&&(s=0)}return this.writeCount=u,this.blockCRC.getCRC()!==this.targetBlockCRC&&z(A.DATA_ERROR,"Bad block CRC (got "+this.blockCRC.getCRC().toString(16)+" expected "+this.targetBlockCRC.toString(16)+")"),this.nextoutput},N.Err=A,N.decode=function(e,t,r){for(var n=d.coerceInputStream(e),o=d.coerceOutputStream(t,t),i=o.stream,f=new N(n,i);!("eof"in n)||!n.eof();)if(f._init_block())f._read_bunzip();else{var a=f.reader.readBits(32);if(a!==f.streamCRC&&z(A.DATA_ERROR,"Bad stream CRC (got "+f.streamCRC.toString(16)+" expected "+a.toString(16)+")"),!r||!("eof"in n)||n.eof())break;f._start_bunzip(n,i)}return o.retval},N.decodeBlock=function(e,t,r){var n=d.coerceInputStream(e),o=d.coerceOutputStream(r,r),i=o.stream,f=new N(n,i);return f.reader.seekBit(t),f._get_next_block()&&(f.blockCRC=new y,f.writeCopies=0,f._read_bunzip()),o.retval},N.table=function(e,t,n){var o=new r;o.delegate=d.coerceInputStream(e),o.pos=0,o.readByte=function(){return this.pos++,this.delegate.readByte()},o.tell=function(){return this.pos},o.delegate.eof&&(o.eof=o.delegate.eof.bind(o.delegate));var i=new r;i.pos=0,i.writeByte=function(){this.pos++};for(var f=new N(o,i),a=f.dbufSize;!("eof"in o)||!o.eof();){var u=f.reader.tellBit();if(f._init_block()){var s=i.pos;f._read_bunzip(),t(u,i.pos-s)}else{if(f.reader.readBits(32),!n||!("eof"in o)||o.eof())break;f._start_bunzip(o,i),console.assert(f.dbufSize===a,"shouldn't change block size within multistream file")}}};var L=function(e,t){var r,n=[];for(r=0;r<t;r++)n[r]=e[r]<<9|r;n.sort((function(e,t){return e-t}));var o=n.map((function(e){return e>>>9}));for(_.allocateHuffmanCodeLengths(o,R),this.codeLengths=d.makeU8Buffer(t),r=0;r<t;r++){var i=511&n[r];this.codeLengths[i]=o[r]}};L.prototype.computeCanonical=function(){var e,t=this.codeLengths.length,r=[];for(e=0;e<t;e++)r[e]=this.codeLengths[e]<<9|e;r.sort((function(e,t){return e-t})),this.code=d.makeU32Buffer(t);var n=0,o=0;for(e=0;e<t;e++){var i=r[e]>>>9,f=511&r[e];console.assert(o<=i),n<<=i-o,this.code[f]=n++,o=i}},L.prototype.cost=function(e,t,r){var n,o=0;for(n=0;n<r;n++)o+=this.codeLengths[e[t+n]];return o},L.prototype.emit=function(e){var t,r=this.codeLengths[0];for(e.writeBits(5,r),t=0;t<this.codeLengths.length;t++){var n,o,i=this.codeLengths[t];for(console.assert(i>0&&i<=R),r<i?(n=2,o=i-r):(n=3,o=r-i);o-- >0;)e.writeBits(2,n);e.writeBit(0),r=i}},L.prototype.encode=function(e,t){e.writeBits(this.codeLengths[t],this.code[t])};var P=function(e,t,r,n){for(var o=0,i=-1,f=0;o<r&&!(4===f&&(t[o++]=0,o>=r));){var a=e.readByte();if(a===O)break;if(n.updateCRC(a),a!==i)i=a,f=1;else if(++f>4){if(f<256){t[o-1]++;continue}f=1}t[o++]=a}return o},M=function(e,t,r){var n,o,i;for(n=0,i=0;n<r.length;n+=k){var f=Math.min(k,r.length-n),a=0,u=t[0].cost(r,n,f);for(o=1;o<t.length;o++){var s=t[o].cost(r,n,f);s<u&&(a=o,u=s)}e[i++]=a}},D=function(e,t,r){var n,o,i,f,a=d.makeU8Buffer(t),u=E.bwtransform2(e,a,t,256);r.writeBit(0),r.writeBits(24,u);var s=[],c=[];for(o=0;o<t;o++)s[n=e[o]]=!0,c[n>>>4]=!0;for(o=0;o<16;o++)r.writeBit(!!c[o]);for(o=0;o<16;o++)if(c[o])for(i=0;i<16;i++)r.writeBit(!!s[o<<4|i]);var h=0;for(o=0;o<256;o++)s[o]&&h++;var l=d.makeU16Buffer(t+1),p=h+1,B=[];for(o=0;o<=p;o++)B[o]=0;var m=d.makeU8Buffer(h);for(o=0,i=0;o<256;o++)s[o]&&(m[i++]=o);s=null,c=null;var v=0,w=0,g=function(e){l[v++]=e,B[e]++},y=function(){for(;0!==w;)1&w?(g(0),w-=1):(g(1),w-=2),w>>>=1};for(o=0;o<a.length;o++){for(n=a[o],i=0;i<h&&m[i]!==n;i++);console.assert(i!==h),S(m,i),0===i?w++:(y(),g(i+1),w=0)}y(),g(p),l=l.subarray(0,v);var b,_=[];for(b=v>=2400?6:v>=1200?5:v>=600?4:v>=200?3:2,_.push(new L(B,p+1)),o=0;o<=p;o++)B[o]=1;_.push(new L(B,p+1)),B=null;var R=d.makeU8Buffer(Math.ceil(v/k));for(function(e,t,r,n,o){for(var i,f,a,u=[];e.length<t;){for(M(n,e,r),i=0;i<e.length;i++)u[i]=0;for(i=0;i<n.length;i++)u[n[i]]++;var s=u.indexOf(Math.max.apply(Math,u)),c=[];for(i=0,f=0;i<n.length;i++)if(n[i]===s){var h=i*k,l=Math.min(h+k,r.length);c.push({index:i,cost:e[s].cost(r,h,l-h)})}for(c.sort((function(e,t){return e.cost-t.cost})),i=c.length>>>1;i<c.length;i++)n[c[i].index]=e.length;e.push(null);var d,p=[];for(i=0;i<e.length;i++)for(d=p[i]=[],f=0;f<o;f++)d[f]=0;for(i=0,f=0;i<r.length;)for(d=p[n[f++]],a=0;a<k&&i<r.length;a++)d[r[i++]]++;for(i=0;i<e.length;i++)e[i]=new L(p[i],o)}}(_,b,l,R,p+1),M(R,_,l),console.assert(_.length>=2&&_.length<=6),r.writeBits(3,_.length),r.writeBits(15,R.length),o=0;o<_.length;o++)m[o]=o;for(o=0;o<R.length;o++){var C=R[o];for(i=0;i<_.length&&m[i]!==C;i++);for(console.assert(i<_.length),S(m,i);i>0;i--)r.writeBit(1);r.writeBit(0)}for(o=0;o<_.length;o++)_[o].emit(r),_[o].computeCanonical();for(o=0,f=0;o<v;){var T=_[R[f++]];for(i=0;i<k&&o<v;i++)T.encode(r,l[o++])}},x=Object.create(null);return x.compressFile=function(e,t,r){e=d.coerceInputStream(e);var o=d.coerceOutputStream(t,t);t=new n(o.stream);var i=9;if("number"==typeof r&&(i=r),i<1||i>9)throw new Error("Invalid block size multiplier");var f=1e5*i;f-=19,t.writeByte("B".charCodeAt(0)),t.writeByte("Z".charCodeAt(0)),t.writeByte("h".charCodeAt(0)),t.writeByte("0".charCodeAt(0)+i);var a,u=d.makeU8Buffer(f),s=0;do{var c=new y;(a=P(e,u,f,c))>0&&(s=((s<<1|s>>>31)^c.getCRC())>>>0,t.writeBits(48,C),t.writeBits(32,c.getCRC()),D(u,a,t))}while(a===f);return t.writeBits(48,T),t.writeBits(32,s),t.flush(),o.retval},x.decompressFile=N.decode,x.decompressBlock=N.decodeBlock,x.table=N.table,x}));