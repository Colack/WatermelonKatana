//FONT PATH: https://dsco.code.org/assets/font-awesome-pro/1684178876/webfonts/
//CSS PATH: https://studio.code.org/blockly/css/applab.css
// const archiver = require("archiver");
// const archive = archiver("zip");
const request = require('./requests');
const canvas = require("canvas");
const startPath = "https://studio.code.org";
const jsdom = require("jsdom");
//let animations = `${startPath}/v3/animations/`;
canvas.registerFont("./Turbo/dependencies/fonts/fa-brands-400.ttf", { family: "FontAwesome" });
//canvas.registerFont("./fonts/fa-regular-400.ttf", {family: "FontAwesome"}) doesn't seem like this one is used??
canvas.registerFont("./Turbo/dependencies/fonts/fa-solid-900.ttf", { family: "FontAwesome" })
canvas.registerFont("./Turbo/dependencies/fonts/fa-v4compatibility.ttf", { family: "FontAwesome" })

//exportProject("pNfF6pjzbWtCgdsls0ofkSpt0yxmK29_e8iGJJtXWpI")

async function exportProject(id) {
  return new Promise(async (resolve, reject) => {
    let json = await request.send(`${startPath}/v3/sources/${id}/main.json`, 'json');
    resolve(await getHTML(json.html, id, getCode(json)));
  })
}

function getCode(json) {
  let libraries = ``;
  json.libraries = json.libraries || [];
  json.libraries.forEach((library) => {
    let lib = library.name;
    let src = library.source;
    let funcs = library.functions.join("|");
    let pattern = new RegExp(`(?<!\\(\\s*|(?<!\\/\\/.*|\\/\\*[^\\*\\/]*|["'][^'"]*)function\\s+[\\S]+\\s*\\(\\)\\s*{[^}]+)function\\s+(${funcs})\\s*(?=\\()`, "g");
    src = src.replace(pattern, `var $1 = this.$1 = function`);
    libraries += `var ${lib} = window[${JSON.stringify(lib)}] || {};
(function ${lib}() {\n${src}\nreturn(this)\n}).bind(${lib})();\n`;
  });
  return libraries + json.source;
}

async function getHTML(html, id, code) {
  const dependency = "/turbowarp/applab";
  html = html.replace(/["'](\/v3\/assets\/[^'"]+)['"]/g, startPath + "$1");
  html = `<html>
  <head>
    <title>${(await request.send(`${startPath}/v3/channels/${id}`, "json")).name}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preload" href="${dependency}/fa-brands-400.woff2" as="font">
    <link rel="preload" href="${dependency}/fa-solid-900.woff2" as="font">
    <link rel="preload" href="${dependency}/fa-regular-400.woff2" as="font">
    <link rel="preload" href="${dependency}/fa-v4compatibility.woff2" as="font">
    <script src="https://code.jquery.com/jquery-1.12.1.min.js"></script>
    <script>
      window.EXPORT_OPTIONS = {channel: "${id}", useDatablockStorage: true};
      function setExportConfig(config) { window.EXPORT_OPTIONS = Object.assign(config, EXPORT_OPTIONS)}
    </script>
    <script src="https://studio.code.org/projects/applab/${id}/export_config?script_call=setExportConfig"></script>
    <script>
    window.inject = function() {
      (function(){const id="${id}";const api=function(t,r,n){let x=new XMLHttpRequest(),v;x.onreadystatechange=function(){if(this.readyState===4){if(x.status>199&&x.status<400){r=typeof x.response==="string"?JSON.parse(x.response):x.response;v=r===null?void 0:r}else{throw x.status}}};x.onerror=function(){throw x};if(r.toUpperCase()==="GET"){x.open("GET",\`/datablock_storage/${ id }/${ t }?${ new URLSearchParams(n)}\`,false);x.send()}else{x.open(r,\`/datablock_storage/${ id }/${ t }\`,false);x.setRequestHeader("Content-Type","application/json");x.setRequestHeader("X-Requested-With","XMLHttpRequest");x.setRequestHeader("X-CSRF-Token",localStorage.userId);x.withCredentials=true;x.send(JSON.stringify(n))}return v};const handleSuccess=function(v){typeof this==="function"&&this(v)};const handleError=function(e){(typeof this==="function"?this:console.warn)(e)};Object.defineProperties(window,{setKeyValueSync:{value:function(k,v,c,e){t=handleSuccess.bind(c);r=handleError.bind(e);try{if(typeof k!=="string"){throw "invalid param: key unreachable"}t(api("set_key_value","POST",{key:k,value:JSON.stringify(v)}))}catch(e){r(e)}},writable:false},getKeyValueSync:{value:function(k,c,e){t=handleSuccess.bind(c);r=handleError.bind(e);try{if(typeof k!=="string"){throw "invalid param: key unreachable"}t(api("get_key_value","GET",{key:k}))}catch(e){r(e)}},writable:false},getColumn:{value:function(t,c,y,n){x=handleSuccess.bind(y);z=handleError.bind(n);try{if(typeof t!=="string"||typeof c!=="string"){throw "invalad param(s): table or column is not a string"}let column=api("get_column","GET",{table_name:t,column_name:c});if(column===void 0){throw "table or column has not been added to the dataset"}return x(column),column}catch(e){z(e)}},writable:false},createRecordSync:{value:function(t,r,y,n){x=handleSuccess.bind(y);z=handleError.bind(n);try{if(typeof t!=="string"||typeof r!=="object"||r===null){throw "invalid param(s): table <string> or record <object> is an invalid type"}x(api("create_record","POST",{table_name:t,record_json:JSON.stringify(r)}))}catch(e){z(e)}},writable:false},readRecordsSync:{value:function(t,y,n){x=handleSuccess.bind(y);z=handleError.bind(n);try{if(typeof t!=="string"){throw "invalid param: table <string> is invalid"}x(api("read_records","GET",{table_name:t,is_shared_table:false}))}catch(e){z(e)}},writtable:false},updateRecordSync:{value:function(t,r,y,n){x=handleSuccess.bind(y);z=handleError.bind(n);try{if(typeof t!=="string"||typeof r!=="object"||r===null){throw "invalid param(s): table <string>, record <object>"}if(typeof r.id!=="number"&&r.id>-1&&r.id<Infinity){throw "invalid record entry id"}x(api("update_record","PUT",{table_name:t,record_id:r.id,record_json:JSON.stringify(r)}))}catch(e){z(e)}},writable:false},deleteRecordSync:{value:function(t,r,y,n){x=handleSuccess.bind(y);z=handleError.bind(n);try{if(typeof t!=="string"||typeof r!=="object"||r===null){throw "invalid param(s): table <string>, record <object>"}if(typeof r.id!=="number"&&r.id>-1&&r.id<Infinity){throw "invalid record entry id"}x(api("delete_record","DELETE",{table_name:t,record_id:r.id}))}catch(e){z(e)}},writable:false},startWebRequestSync:{value:function(u,c,e){let x=new XMLHttpRequest(),y=handleSuccess.bind(c),z=handleError.bind(e);x.onreadystatechange=function(){if(this.readyState===4){if(x.status>199&&x.status<400){y(x.response)}else{y(\`Request Responded With: ${x.status }, Is not a safe range\`)}}};x.onerror=function(){z(x)};x.open("GET","/xhr?u="+u,true);x.send()}}})})();
      let iframe = document.createElement("iframe");
      iframe.addEventListener("load",()=>{
      iframe.addEventListener = function (element, event, callback) {return document.body.addEventListener(element, event, callback)};
      for(var global in window.Global){iframe.contentWindow[global]=window[global]};
      ;(function() {
        return fetch("/api/auth/check").then(r => {
              if (r.status === 200) {
                  return r.json();
              } else {
                  return {auth: false};
              }
          }).then(d => {
              if(d.user !== undefined) {
                  return "accountUser:" + d.user.id;
              } else {
                  return getUserId();
              }
          }).then(id => {
              if(localStorage.userId === undefined || id.startsWith("accountUser:")) {
                localStorage.userId = id;
              }
              let script=iframe.contentDocument.createElement("script");
              script.text=${JSON.stringify(`Object.defineProperties(Object.prototype,{apply:{value:function(fn,args){if(typeof this==="object"&&"length"in this){return Function.prototype.apply.call(this,fn,args)}},enumerable:false,configurable:true,writable:true},concat:{value:function(){if(typeof this==="object"&&"length"in this){return Array.prototype.concat.apply(this,arguments)}return[]},enumerable:false,configurable:true,writable:true},every:{value:function(cb,_this){if(typeof this==="object"&&"length"in this){return Array.prototype.every.call(this,cb,_this)}return false},enumerable:false,configurable:true,writable:true},indexOf:{value:function(search,fromIndex){if(typeof this==="object"&&"length"in this){return Array.prototype.indexOf.call(this,search,fromIndex)}return -1},enumerable:false,configurable:true,writable:true},filter:{value:function(cb,_this){if(typeof this==="object"&&"length"in this){return Array.prototype.filter.call(this,cb,_this)}return[]},enumerable:false,configurable:true,writable:true},forEach:{value:function(cb,_this){if(typeof this==="object"&&"length"in this){return Array.prototype.forEach.call(this,cb,_this)}},enumerable:false,configurable:true,writable:true},join:{value:function(separator){if(typeof this==="object"&&"length"in this){return Array.prototype.join.call(this,separator)}return ""},enumerable:false,configurable:true,writable:true},lastIndexOf:{value:function(search,fromIndex){if(typeof this==="object"&&"length"in this){return Array.prototype.lastIndexOf.call(this,search,fromIndex)}return -1},enumerable:false,configurable:true,writable:true},map:{value:function(cb,_this){if(typeof this==="object"&&"length"in this){const mapped=[];for(let i in this){mapped.push(cb.call(_this,this[i],Number(i)))}return mapped}},enumerable:false,configurable:true,writable:true},push:{value:function(){if(typeof this==="object"&&"length"in this){return Array.prototype.push.apply(this,arguments)}return 0},enumerable:false,configurable:true,writable:true},pop:{value:function(){if(typeof this==="object"&&"length"in this){return Array.prototype.pop.apply(this)}return undefined},enumerable:false,configurable:true,writable:true},reduce:{value:function(cb,startValue){if(typeof this==="object"&&"length"in this){return Array.prototype.reduce.call(this,cb,startValue)}throw new TypeError("Cannot call reduce on a non-array object")},enumerable:false,configurable:true,writable:true},some:{value:function(cb,_this){if(typeof this==="object"&&"length"in this){return Array.prototype.some.call(this,cb,_this)}return false},enumerable:false,configurable:true,writable:true},shift:{value:function(){if(typeof this==="object"&&"length"in this){return Array.prototype.shift.call(this)}return undefined},enumerable:false,configurable:true,writable:true},splice:{value:function(start,amount,...items){if(typeof this==="object"&&"length"in this){return Array.prototype.splice.call(this,start,amount,...items)}return[]},enumerable:false,configurable:true,writable:true},unshift:{value:function(){if(typeof this==="object"&&"length"in this){return Array.prototype.unshift.apply(this,arguments)}return 0},enumerable:false,configurable:true,writable:true},reverse:{value:function(){if(typeof this==="object"&&"length"in this){return Array.prototype.reverse.call(this)}return this},enumerable:false,configurable:true,writable:true},slice:{value:function(){if(typeof this==="object"&&"length"in this){return Array.prototype.slice.apply(this,arguments)}},enumerable:false,configurable:true,writable:true},sort:{value:function(cb){if(typeof this==="object"&&"length"in this){return Array.prototype.sort.call(this,cb)}return this},enumerable:false,configurable:true,writable:true}});` + code)};
              iframe.contentDocument.head.appendChild(script);
              let element = document.getElementById("divApplab");
              let width = "320px";
              let height = "450px";
              let scaling = "scale(" + (Math.min(window.innerWidth, window.innerHeight) / 450) + ")";
              if(element.style.width === width && element.style.height === height) {
                element.style["transform"] = scaling;
              }
              element.style["transform-origin"] = "top left";
              const observer = new MutationObserver((mutations, observe) => {
                for(let mutation of mutations) {
                  let targetStyle = mutation.target.style;
                  if(mutation.attributeName === "style") {
                    if((targetStyle.width !== width || targetStyle.height !== height) && targetStyle.transform !== "") {
                      targetStyle.transform = "";
                    } else if (((targetStyle.width === width && targetStyle.height === height) || targetStyle.position === "relative") && targetStyle.transform === "") {
                      targetStyle.width = width;
                      targetStyle.height = height;
                      targetStyle.transform = scaling; 
                    }
                  }
                }
              });
              observer.observe(element, {attributes: true});
          })
          .catch(err => {
              throw new Error(err);
          })
      })();
    });
    document.head.appendChild(iframe);
      }
    </script>
    <script src="${dependency}/applab-api.js"></script>
    <script src="https://www.google.com/jsapi"></script>
    <link rel="stylesheet" href="${dependency}/CSS/applab.css">
    <link rel="stylesheet" href="${dependency}/CSS/style.css">
    <link rel="stylesheet" media="all" href="${dependency}/CSS/fonts.css">
  </head>
  <body>
  <div id="divApplab" class="appModern running" tabindex="1" style="width: 320px; height: 450px; display: block;">
  ${html.match(/<div class="screen".*/g)[0]}
  </body>
  </html>`;
  let page = new jsdom.JSDOM(html);
  let icons = page.window.document.querySelectorAll('[data-canonical-image-url]');
  icons.forEach((icon) => {
    if (icon.getAttribute('data-image-type') === 'icon') {
      if (icon.matches("button")) {
        icon.style['background-image'] = `url('${renderIconToString(icon.getAttribute('data-canonical-image-url'), icon)}')`;
      }
      if (icon.matches("img")) {
        icon.src = `${renderIconToString(icon.getAttribute('data-canonical-image-url'), icon)}`;
      }
    }
  });
  return page.serialize();
}


function renderIconToString(value, element) {
  let unicode = { music: 'f001', search: 'f002', 'envelope-o': 'f003', heart: 'f004', star: 'f005', 'star-o': 'f006', user: 'f007', film: 'f008', 'th-large': 'f009', th: 'f00a', 'th-list': 'f00b', check: 'f00c', times: 'f00d', 'search-plus': 'f00e', 'search-minus': 'f010', 'power-off': 'f011', signal: 'f012', cog: 'f013', 'trash-o': 'f014', home: 'f015', 'file-o': 'f016', 'clock-o': 'f017', road: 'f018', download: 'f019', 'arrow-circle-o-down': 'f01a', 'arrow-circle-o-up': 'f01b', inbox: 'f01c', 'play-circle-o': 'f01d', repeat: 'f01e', refresh: 'f021', 'list-alt': 'f022', lock: 'f023', flag: 'f024', headphones: 'f025', 'volume-off': 'f026', 'volume-down': 'f027', 'volume-up': 'f028', qrcode: 'f029', barcode: 'f02a', tag: 'f02b', tags: 'f02c', book: 'f02d', bookmark: 'f02e', print: 'f02f', camera: 'f030', font: 'f031', bold: 'f032', italic: 'f033', 'text-height': 'f034', 'text-width': 'f035', 'align-left': 'f036', 'align-center': 'f037', 'align-right': 'f038', 'align-justify': 'f039', list: 'f03a', outdent: 'f03b', indent: 'f03c', 'video-camera': 'f03d', 'picture-o': 'f03e', pencil: 'f040', 'map-marker': 'f041', adjust: 'f042', tint: 'f043', 'pencil-square-o': 'f044', 'share-square-o': 'f045', 'check-square-o': 'f046', arrows: 'f047', 'step-backward': 'f048', 'fast-backward': 'f049', backward: 'f04a', play: 'f04b', pause: 'f04c', stop: 'f04d', forward: 'f04e', 'fast-forward': 'f050', 'step-forward': 'f051', eject: 'f052', 'chevron-left': 'f053', 'chevron-right': 'f054', 'plus-circle': 'f055', 'minus-circle': 'f056', 'times-circle': 'f057', 'check-circle': 'f058', 'question-circle': 'f059', 'info-circle': 'f05a', 'times-circle-o': 'f05c', 'check-circle-o': 'f05d', ban: 'f05e', 'arrow-left': 'f060', 'arrow-right': 'f061', 'arrow-up': 'f062', 'arrow-down': 'f063', share: 'f064', expand: 'f065', compress: 'f066', plus: 'f067', minus: 'f068', asterisk: 'f069', 'exclamation-circle': 'f06a', gift: 'f06b', leaf: 'f06c', fire: 'f06d', eye: 'f06e', 'eye-slash': 'f070', 'exclamation-triangle': 'f071', plane: 'f072', calendar: 'f073', random: 'f074', comment: 'f075', magnet: 'f076', 'chevron-up': 'f077', 'chevron-down': 'f078', retweet: 'f079', 'shopping-cart': 'f07a', folder: 'f07b', 'folder-open': 'f07c', 'arrows-v': 'f07d', 'arrows-h': 'f07e', 'bar-chart': 'f080', 'twitter-square': 'f081', 'facebook-square': 'f082', 'camera-retro': 'f083', key: 'f084', cogs: 'f085', comments: 'f086', 'thumbs-o-up': 'f087', 'thumbs-o-down': 'f088', 'star-half': 'f089', 'heart-o': 'f08a', 'sign-out': 'f08b', 'linkedin-square': 'f08c', 'thumb-tack': 'f08d', 'external-link': 'f08e', 'sign-in': 'f090', trophy: 'f091', 'github-square': 'f092', upload: 'f093', 'lemon-o': 'f094', phone: 'f095', 'square-o': 'f096', 'bookmark-o': 'f097', 'phone-square': 'f098', twitter: 'f099', facebook: 'f09a', github: 'f09b', unlock: 'f09c', 'credit-card': 'f09d', rss: 'f09e', 'hdd-o': 'f0a0', bullhorn: 'f0a1', bell: 'f0f3', certificate: 'f0a3', 'hand-o-right': 'f0a4', 'hand-o-left': 'f0a5', 'hand-o-up': 'f0a6', 'hand-o-down': 'f0a7', 'arrow-circle-left': 'f0a8', 'arrow-circle-right': 'f0a9', 'arrow-circle-up': 'f0aa', 'arrow-circle-down': 'f0ab', globe: 'f0ac', wrench: 'f0ad', tasks: 'f0ae', filter: 'f0b0', briefcase: 'f0b1', 'arrows-alt': 'f0b2', users: 'f0c0', link: 'f0c1', cloud: 'f0c2', flask: 'f0c3', scissors: 'f0c4', 'files-o': 'f0c5', paperclip: 'f0c6', 'floppy-o': 'f0c7', square: 'f0c8', bars: 'f0c9', 'list-ul': 'f0ca', 'list-ol': 'f0cb', strikethrough: 'f0cc', underline: 'f0cd', table: 'f0ce', magic: 'f0d0', truck: 'f0d1', pinterest: 'f0d2', 'pinterest-square': 'f0d3', 'google-plus-square': 'f0d4', 'google-plus': 'f0d5', money: 'f0d6', 'caret-down': 'f0d7', 'caret-up': 'f0d8', 'caret-left': 'f0d9', 'caret-right': 'f0da', columns: 'f0db', sort: 'f0dc', 'sort-desc': 'f0dd', 'sort-asc': 'f0de', envelope: 'f0e0', linkedin: 'f0e1', undo: 'f0e2', gavel: 'f0e3', tachometer: 'f0e4', 'comment-o': 'f0e5', 'comments-o': 'f0e6', bolt: 'f0e7', sitemap: 'f0e8', umbrella: 'f0e9', clipboard: 'f0ea', 'lightbulb-o': 'f0eb', exchange: 'f0ec', 'cloud-download': 'f0ed', 'cloud-upload': 'f0ee', 'user-md': 'f0f0', stethoscope: 'f0f1', suitcase: 'f0f2', 'bell-o': 'f0a2', coffee: 'f0f4', cutlery: 'f0f5', 'file-text-o': 'f0f6', 'building-o': 'f0f7', 'hospital-o': 'f0f8', ambulance: 'f0f9', medkit: 'f0fa', 'h-square': 'f0fd', 'plus-square': 'f0fe', 'angle-double-left': 'f100', 'angle-double-right': 'f101', 'angle-double-up': 'f102', 'angle-double-down': 'f103', 'angle-left': 'f104', 'angle-right': 'f105', 'angle-up': 'f106', 'angle-down': 'f107', desktop: 'f108', laptop: 'f109', tablet: 'f10a', mobile: 'f10b', 'circle-o': 'f10c', 'quote-left': 'f10d', 'quote-right': 'f10e', spinner: 'f110', circle: 'f111', reply: 'f112', 'github-alt': 'f113', 'folder-o': 'f114', 'folder-open-o': 'f115', 'smile-o': 'f118', 'frown-o': 'f119', 'meh-o': 'f11a', gamepad: 'f11b', 'keyboard-o': 'f11c', 'flag-o': 'f11d', 'flag-checkered': 'f11e', terminal: 'f120', code: 'f121', 'reply-all': 'f122', 'star-half-o': 'f123', 'location-arrow': 'f124', crop: 'f125', 'code-fork': 'f126', 'chain-broken': 'f127', question: 'f128', info: 'f129', exclamation: 'f12a', superscript: 'f12b', subscript: 'f12c', eraser: 'f12d', 'puzzle-piece': 'f12e', microphone: 'f130', 'microphone-slash': 'f131', shield: 'f132', 'calendar-o': 'f133', 'fire-extinguisher': 'f134', rocket: 'f135', maxcdn: 'f136', 'chevron-circle-left': 'f137', 'chevron-circle-right': 'f138', 'chevron-circle-up': 'f139', 'chevron-circle-down': 'f13a', html5: 'f13b', css3: 'f13c', anchor: 'f13d', 'unlock-alt': 'f13e', bullseye: 'f140', 'ellipsis-h': 'f141', 'ellipsis-v': 'f142', 'rss-square': 'f143', 'play-circle': 'f144', ticket: 'f145', 'minus-square': 'f146', 'minus-square-o': 'f147', 'level-up': 'f148', 'level-down': 'f149', 'check-square': 'f14a', 'pencil-square': 'f14b', 'external-link-square': 'f14c', 'share-square': 'f14d', compass: 'f14e', 'caret-square-o-down': 'f150', 'caret-square-o-up': 'f151', 'caret-square-o-right': 'f152', eur: 'f153', gbp: 'f154', usd: 'f155', inr: 'f156', jpy: 'f157', rub: 'f158', krw: 'f159', btc: 'f15a', file: 'f15b', 'file-text': 'f15c', 'sort-alpha-asc': 'f15d', 'sort-alpha-desc': 'f15e', 'sort-amount-asc': 'f160', 'sort-amount-desc': 'f161', 'sort-numeric-asc': 'f162', 'sort-numeric-desc': 'f163', 'thumbs-up': 'f164', 'thumbs-down': 'f165', 'youtube-square': 'f166', youtube: 'f167', xing: 'f168', 'xing-square': 'f169', 'youtube-play': 'f16a', dropbox: 'f16b', 'stack-overflow': 'f16c', instagram: 'f16d', flickr: 'f16e', adn: 'f170', bitbucket: 'f171', 'bitbucket-square': 'f172', tumblr: 'f173', 'tumblr-square': 'f174', 'long-arrow-down': 'f175', 'long-arrow-up': 'f176', 'long-arrow-left': 'f177', 'long-arrow-right': 'f178', apple: 'f179', windows: 'f17a', android: 'f17b', linux: 'f17c', dribbble: 'f17d', skype: 'f17e', foursquare: 'f180', trello: 'f181', female: 'f182', male: 'f183', gratipay: 'f184', 'sun-o': 'f185', 'moon-o': 'f186', archive: 'f187', bug: 'f188', vk: 'f189', weibo: 'f18a', renren: 'f18b', pagelines: 'f18c', 'stack-exchange': 'f18d', 'arrow-circle-o-right': 'f18e', 'arrow-circle-o-left': 'f190', 'caret-square-o-left': 'f191', 'dot-circle-o': 'f192', wheelchair: 'f193', 'vimeo-square': 'f194', try: 'f195', 'plus-square-o': 'f196', 'space-shuttle': 'f197', slack: 'f198', 'envelope-square': 'f199', wordpress: 'f19a', openid: 'f19b', university: 'f19c', 'graduation-cap': 'f19d', yahoo: 'f19e', google: 'f1a0', reddit: 'f1a1', 'reddit-square': 'f1a2', 'stumbleupon-circle': 'f1a3', stumbleupon: 'f1a4', delicious: 'f1a5', digg: 'f1a6', 'pied-piper': 'f1a7', 'pied-piper-alt': 'f1a8', drupal: 'f1a9', joomla: 'f1aa', language: 'f1ab', fax: 'f1ac', building: 'f1ad', child: 'f1ae', paw: 'f1b0', spoon: 'f1b1', cube: 'f1b2', cubes: 'f1b3', behance: 'f1b4', 'behance-square': 'f1b5', steam: 'f1b6', 'steam-square': 'f1b7', recycle: 'f1b8', car: 'f1b9', taxi: 'f1ba', tree: 'f1bb', spotify: 'f1bc', deviantart: 'f1bd', soundcloud: 'f1be', database: 'f1c0', 'file-pdf-o': 'f1c1', 'file-word-o': 'f1c2', 'file-excel-o': 'f1c3', 'file-powerpoint-o': 'f1c4', 'file-image-o': 'f1c5', 'file-archive-o': 'f1c6', 'file-audio-o': 'f1c7', 'file-video-o': 'f1c8', 'file-code-o': 'f1c9', vine: 'f1ca', codepen: 'f1cb', jsfiddle: 'f1cc', 'life-ring': 'f1cd', 'circle-o-notch': 'f1ce', rebel: 'f1d0', empire: 'f1d1', 'git-square': 'f1d2', git: 'f1d3', 'hacker-news': 'f1d4', 'tencent-weibo': 'f1d5', qq: 'f1d6', weixin: 'f1d7', 'paper-plane': 'f1d8', 'paper-plane-o': 'f1d9', history: 'f1da', 'circle-thin': 'f1db', header: 'f1dc', paragraph: 'f1dd', sliders: 'f1de', 'share-alt': 'f1e0', 'share-alt-square': 'f1e1', 'futbol-o': 'f1e3', tty: 'f1e4', binoculars: 'f1e5', plug: 'f1e6', slideshare: 'f1e7', twitch: 'f1e8', yelp: 'f1e9', 'newspaper-o': 'f1ea', wifi: 'f1eb', calculator: 'f1ec', paypal: 'f1ed', 'google-wallet': 'f1ee', 'cc-visa': 'f1f0', 'cc-mastercard': 'f1f1', 'cc-discover': 'f1f2', 'cc-amex': 'f1f3', 'cc-paypal': 'f1f4', 'cc-stripe': 'f1f5', 'bell-slash': 'f1f6', 'bell-slash-o': 'f1f7', trash: 'f1f8', copyright: 'f1f9', at: 'f1fa', eyedropper: 'f1fb', 'paint-brush': 'f1fc', 'birthday-cake': 'f1fd', 'area-chart': 'f1fe', 'pie-chart': 'f200', 'line-chart': 'f201', lastfm: 'f202', 'lastfm-square': 'f203', 'toggle-off': 'f204', 'toggle-on': 'f205', bicycle: 'f206', bus: 'f207', ioxhost: 'f208', angellist: 'f209', cc: 'f20a', ils: 'f20b', meanpath: 'f20c', buysellads: 'f20d', connectdevelop: 'f20e', dashcube: 'f210', forumbee: 'f211', leanpub: 'f212', sellsy: 'f213', shirtsinbulk: 'f214', simplybuilt: 'f215', skyatlas: 'f216', 'cart-plus': 'f217', 'cart-arrow-down': 'f218', diamond: 'f219', ship: 'f21a', 'user-secret': 'f21b', motorcycle: 'f21c', 'street-view': 'f21d', heartbeat: 'f21e', 'facebook-official': 'f230', 'pinterest-p': 'f231', whatsapp: 'f232', server: 'f233', 'user-plus': 'f234', 'user-times': 'f235', bed: 'f236', viacoin: 'f237', train: 'f238', subway: 'f239', medium: 'f23a', 'y-combinator': 'f23b', 'optin-monster': 'f23c', opencart: 'f23d', expeditedssl: 'f23e', 'battery-full': 'f240', 'battery-three-quarters': 'f241', 'battery-half': 'f242', 'battery-quarter': 'f243', 'battery-empty': 'f244', 'mouse-pointer': 'f245', 'i-cursor': 'f246', 'object-group': 'f247', 'object-ungroup': 'f248', 'sticky-note': 'f249', 'sticky-note-o': 'f24a', 'cc-jcb': 'f24b', 'cc-diners-club': 'f24c', clone: 'f24d', 'balance-scale': 'f24e', 'hourglass-o': 'f250', 'hourglass-start': 'f251', 'hourglass-half': 'f252', 'hourglass-end': 'f253', hourglass: 'f254', 'hand-rock-o': 'f255', 'hand-paper-o': 'f256', 'hand-scissors-o': 'f257', 'hand-lizard-o': 'f258', 'hand-spock-o': 'f259', 'hand-pointer-o': 'f25a', 'hand-peace-o': 'f25b', trademark: 'f25c', registered: 'f25d', 'creative-commons': 'f25e', gg: 'f260', 'gg-circle': 'f261', tripadvisor: 'f262', odnoklassniki: 'f263', 'odnoklassniki-square': 'f264', 'get-pocket': 'f265', 'wikipedia-w': 'f266', safari: 'f267', chrome: 'f268', firefox: 'f269', opera: 'f26a', 'internet-explorer': 'f26b', television: 'f26c', contao: 'f26d', '500px': 'f26e', amazon: 'f270', 'calendar-plus-o': 'f271', 'calendar-minus-o': 'f272', 'calendar-times-o': 'f273', 'calendar-check-o': 'f274', industry: 'f275', 'map-pin': 'f276', 'map-signs': 'f277', 'map-o': 'f278', map: 'f279', commenting: 'f27a', 'commenting-o': 'f27b', houzz: 'f27c', vimeo: 'f27d', 'black-tie': 'f27e', fonticons: 'f280', 'reddit-alien': 'f281', edge: 'f282', 'credit-card-alt': 'f283', codiepie: 'f284', modx: 'f285', 'fort-awesome': 'f286', usb: 'f287', 'product-hunt': 'f288', mixcloud: 'f289', scribd: 'f28a', 'pause-circle': 'f28b', 'pause-circle-o': 'f28c', 'stop-circle': 'f28d', 'stop-circle-o': 'f28e', 'shopping-bag': 'f290', 'shopping-basket': 'f291', hashtag: 'f292', bluetooth: 'f293', 'bluetooth-b': 'f294', percent: 'f295' }
  //element = {getAttribute: function(){return undefined}}
  let surface = canvas.createCanvas(400, 400);
  let ctx = surface.getContext('2d');
  ctx.font = '300px FontAwesome, serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = element.getAttribute('data-icon-color') || '#000';
  let regex = new RegExp('^icon://fa-');
  let character = '0x' + unicode[value.replace(regex, '')];
  ctx.fillText(String.fromCharCode(character), 200, 200);
  return surface.toDataURL();
}

module.exports = { exportProject };
