import morphdom from "morphdom";

var name = "cable_ready";

var version = "5.0.0-pre9";

var description = "CableReady helps you create great real-time user experiences by making it simple to trigger client-side DOM changes from server-side Ruby.";

var keywords = [ "ruby", "rails", "websockets", "actioncable", "cable", "ssr", "stimulus_reflex", "client-side", "dom" ];

var homepage = "https://cableready.stimulusreflex.com/";

var bugs = {
  url: "https://github.com/stimulusreflex/cable_ready/issues"
};

var repository = {
  type: "git",
  url: "git+https://github.com:stimulusreflex/cable_ready.git"
};

var license = "MIT";

var author = "Nathan Hopkins <natehop@gmail.com>";

var main = "./dist/cable_ready.umd.min.js";

var module = "./dist/cable_ready.min.js";

var files = [ "dist/*", "javascript/*" ];

var scripts = {
  lint: "yarn run prettier-standard:check",
  format: "yarn run prettier-standard:format",
  "prettier-standard:check": "yarn run prettier-standard --check ./javascript/**/*.js rollup.config.js",
  "prettier-standard:format": "yarn run prettier-standard ./javascript/**/*.js rollup.config.js",
  build: "yarn rollup -c",
  watch: "yarn rollup -wc"
};

var dependencies = {
  "@msgpack/msgpack": "^2.7.2",
  morphdom: "^2.6.1"
};

var devDependencies = {
  "@rollup/plugin-commonjs": "^21.0.3",
  "@rollup/plugin-json": "^4.1.0",
  "@rollup/plugin-node-resolve": "^13.1.3",
  "prettier-standard": "^16.4.1",
  rollup: "^2.70.1",
  "rollup-plugin-terser": "^7.0.2"
};

var packageInfo = {
  name: name,
  version: version,
  description: description,
  keywords: keywords,
  homepage: homepage,
  bugs: bugs,
  repository: repository,
  license: license,
  author: author,
  main: main,
  module: module,
  files: files,
  scripts: scripts,
  dependencies: dependencies,
  devDependencies: devDependencies
};

const inputTags = {
  INPUT: true,
  TEXTAREA: true,
  SELECT: true
};

const mutableTags = {
  INPUT: true,
  TEXTAREA: true,
  OPTION: true
};

const textInputTypes = {
  "datetime-local": true,
  "select-multiple": true,
  "select-one": true,
  color: true,
  date: true,
  datetime: true,
  email: true,
  month: true,
  number: true,
  password: true,
  range: true,
  search: true,
  tel: true,
  text: true,
  textarea: true,
  time: true,
  url: true,
  week: true
};

let activeElement;

var ActiveElement = {
  get element() {
    return activeElement;
  },
  set(element) {
    activeElement = element;
  }
};

const isTextInput = element => inputTags[element.tagName] && textInputTypes[element.type];

const assignFocus = selector => {
  const element = selector && selector.nodeType === Node.ELEMENT_NODE ? selector : document.querySelector(selector);
  const focusElement = element || ActiveElement.element;
  if (focusElement && focusElement.focus) focusElement.focus();
};

const dispatch = (element, name, detail = {}) => {
  const init = {
    bubbles: true,
    cancelable: true,
    detail: detail
  };
  const evt = new CustomEvent(name, init);
  element.dispatchEvent(evt);
  if (window.jQuery) window.jQuery(element).trigger(name, detail);
};

const xpathToElement = xpath => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

const xpathToElementArray = xpath => {
  const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  const elements = [];
  for (let i = 0; i < result.snapshotLength; i++) elements.push(result.snapshotItem(i));
  return elements;
};

const getClassNames = names => Array.from(names).flat();

const processElements = (operation, callback) => {
  Array.from(operation.selectAll ? operation.element : [ operation.element ]).forEach(callback);
};

const kebabize = str => str.split("").map(((letter, idx) => letter.toUpperCase() === letter ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}` : letter)).join("");

const operate = (operation, callback) => {
  if (!operation.cancel) {
    operation.delay ? setTimeout(callback, operation.delay) : callback();
    return true;
  }
  return false;
};

const before = (target, operation) => dispatch(target, `cable-ready:before-${kebabize(operation.operation)}`, operation);

const after = (target, operation) => dispatch(target, `cable-ready:after-${kebabize(operation.operation)}`, operation);

function debounce(func, timeout) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout((() => func.apply(this, args)), timeout);
  };
}

function handleErrors(response) {
  if (!response.ok) throw Error(response.statusText);
  return response;
}

function safeScalar(val) {
  if (val !== undefined && ![ "string", "number", "boolean" ].includes(typeof val)) console.warn(`Operation expects a string, number or boolean, but got ${val} (${typeof val})`);
  return val != null ? val : "";
}

function safeString(str) {
  if (str !== undefined && typeof str !== "string") console.warn(`Operation expects a string, but got ${str} (${typeof str})`);
  return str != null ? String(str) : "";
}

function safeArray(arr) {
  if (arr !== undefined && !Array.isArray(arr)) console.warn(`Operation expects an array, but got ${arr} (${typeof arr})`);
  return arr != null ? Array.from(arr) : [];
}

function safeObject(obj) {
  if (obj !== undefined && typeof obj !== "object") console.warn(`Operation expects an object, but got ${obj} (${typeof obj})`);
  return obj != null ? Object(obj) : {};
}

async function graciouslyFetch(url, additionalHeaders) {
  try {
    const response = await fetch(url, {
      headers: {
        "X-REQUESTED-WITH": "XmlHttpRequest",
        ...additionalHeaders
      }
    });
    if (response == undefined) return;
    handleErrors(response);
    return response;
  } catch (e) {
    console.error(`Could not fetch ${url}`);
  }
}

var utils = Object.freeze({
  __proto__: null,
  isTextInput: isTextInput,
  assignFocus: assignFocus,
  dispatch: dispatch,
  xpathToElement: xpathToElement,
  xpathToElementArray: xpathToElementArray,
  getClassNames: getClassNames,
  processElements: processElements,
  operate: operate,
  before: before,
  after: after,
  debounce: debounce,
  handleErrors: handleErrors,
  graciouslyFetch: graciouslyFetch,
  kebabize: kebabize,
  safeScalar: safeScalar,
  safeString: safeString,
  safeArray: safeArray,
  safeObject: safeObject
});

const shouldMorph = operation => (fromEl, toEl) => !shouldMorphCallbacks.map((callback => typeof callback === "function" ? callback(operation, fromEl, toEl) : true)).includes(false);

const didMorph = operation => el => {
  didMorphCallbacks.forEach((callback => {
    if (typeof callback === "function") callback(operation, el);
  }));
};

const verifyNotMutable = (detail, fromEl, toEl) => {
  if (!mutableTags[fromEl.tagName] && fromEl.isEqualNode(toEl)) return false;
  return true;
};

const verifyNotContentEditable = (detail, fromEl, toEl) => {
  if (fromEl === ActiveElement.element && fromEl.isContentEditable) return false;
  return true;
};

const verifyNotPermanent = (detail, fromEl, toEl) => {
  const {permanentAttributeName: permanentAttributeName} = detail;
  if (!permanentAttributeName) return true;
  const permanent = fromEl.closest(`[${permanentAttributeName}]`);
  if (!permanent && fromEl === ActiveElement.element && isTextInput(fromEl)) {
    const ignore = {
      value: true
    };
    Array.from(toEl.attributes).forEach((attribute => {
      if (!ignore[attribute.name]) fromEl.setAttribute(attribute.name, attribute.value);
    }));
    return false;
  }
  return !permanent;
};

const shouldMorphCallbacks = [ verifyNotMutable, verifyNotPermanent, verifyNotContentEditable ];

const didMorphCallbacks = [];

var morph_callbacks = Object.freeze({
  __proto__: null,
  shouldMorphCallbacks: shouldMorphCallbacks,
  didMorphCallbacks: didMorphCallbacks,
  shouldMorph: shouldMorph,
  didMorph: didMorph,
  verifyNotMutable: verifyNotMutable,
  verifyNotContentEditable: verifyNotContentEditable,
  verifyNotPermanent: verifyNotPermanent
});

var Operations = {
  append: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {html: html, focusSelector: focusSelector} = operation;
        element.insertAdjacentHTML("beforeend", safeScalar(html));
        assignFocus(focusSelector);
      }));
      after(element, operation);
    }));
  },
  graft: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {parent: parent, focusSelector: focusSelector} = operation;
        const parentElement = document.querySelector(parent);
        if (parentElement) {
          parentElement.appendChild(element);
          assignFocus(focusSelector);
        }
      }));
      after(element, operation);
    }));
  },
  innerHtml: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {html: html, focusSelector: focusSelector} = operation;
        element.innerHTML = safeScalar(html);
        assignFocus(focusSelector);
      }));
      after(element, operation);
    }));
  },
  insertAdjacentHtml: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {html: html, position: position, focusSelector: focusSelector} = operation;
        element.insertAdjacentHTML(position || "beforeend", safeScalar(html));
        assignFocus(focusSelector);
      }));
      after(element, operation);
    }));
  },
  insertAdjacentText: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {text: text, position: position, focusSelector: focusSelector} = operation;
        element.insertAdjacentText(position || "beforeend", safeScalar(text));
        assignFocus(focusSelector);
      }));
      after(element, operation);
    }));
  },
  morph: operation => {
    processElements(operation, (element => {
      const {html: html} = operation;
      const template = document.createElement("template");
      template.innerHTML = String(safeScalar(html)).trim();
      operation.content = template.content;
      const parent = element.parentElement;
      const ordinal = Array.from(parent.children).indexOf(element);
      before(element, operation);
      operate(operation, (() => {
        const {childrenOnly: childrenOnly, focusSelector: focusSelector} = operation;
        morphdom(element, childrenOnly ? template.content : template.innerHTML, {
          childrenOnly: !!childrenOnly,
          onBeforeElUpdated: shouldMorph(operation),
          onElUpdated: didMorph(operation)
        });
        assignFocus(focusSelector);
      }));
      after(parent.children[ordinal], operation);
    }));
  },
  outerHtml: operation => {
    processElements(operation, (element => {
      const parent = element.parentElement;
      const ordinal = Array.from(parent.children).indexOf(element);
      before(element, operation);
      operate(operation, (() => {
        const {html: html, focusSelector: focusSelector} = operation;
        element.outerHTML = safeScalar(html);
        assignFocus(focusSelector);
      }));
      after(parent.children[ordinal], operation);
    }));
  },
  prepend: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {html: html, focusSelector: focusSelector} = operation;
        element.insertAdjacentHTML("afterbegin", safeScalar(html));
        assignFocus(focusSelector);
      }));
      after(element, operation);
    }));
  },
  remove: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {focusSelector: focusSelector} = operation;
        element.remove();
        assignFocus(focusSelector);
      }));
      after(document, operation);
    }));
  },
  replace: operation => {
    processElements(operation, (element => {
      const parent = element.parentElement;
      const ordinal = Array.from(parent.children).indexOf(element);
      before(element, operation);
      operate(operation, (() => {
        const {html: html, focusSelector: focusSelector} = operation;
        element.outerHTML = safeScalar(html);
        assignFocus(focusSelector);
      }));
      after(parent.children[ordinal], operation);
    }));
  },
  textContent: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {text: text, focusSelector: focusSelector} = operation;
        element.textContent = safeScalar(text);
        assignFocus(focusSelector);
      }));
      after(element, operation);
    }));
  },
  addCssClass: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {name: name} = operation;
        element.classList.add(...getClassNames([ safeString(name) ]));
      }));
      after(element, operation);
    }));
  },
  removeAttribute: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {name: name} = operation;
        element.removeAttribute(safeString(name));
      }));
      after(element, operation);
    }));
  },
  removeCssClass: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {name: name} = operation;
        element.classList.remove(...getClassNames([ safeString(name) ]));
      }));
      after(element, operation);
    }));
  },
  setAttribute: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {name: name, value: value} = operation;
        element.setAttribute(safeString(name), safeScalar(value));
      }));
      after(element, operation);
    }));
  },
  setDatasetProperty: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {name: name, value: value} = operation;
        element.dataset[safeString(name)] = safeScalar(value);
      }));
      after(element, operation);
    }));
  },
  setProperty: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {name: name, value: value} = operation;
        if (name in element) element[safeString(name)] = safeScalar(value);
      }));
      after(element, operation);
    }));
  },
  setStyle: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {name: name, value: value} = operation;
        element.style[safeString(name)] = safeScalar(value);
      }));
      after(element, operation);
    }));
  },
  setStyles: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {styles: styles} = operation;
        for (let [name, value] of Object.entries(styles)) element.style[safeString(name)] = safeScalar(value);
      }));
      after(element, operation);
    }));
  },
  setValue: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {value: value} = operation;
        element.value = safeScalar(value);
      }));
      after(element, operation);
    }));
  },
  dispatchEvent: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        const {name: name, detail: detail} = operation;
        dispatch(element, safeString(name), safeObject(detail));
      }));
      after(element, operation);
    }));
  },
  invokeMethod: operation => {
    processElements(operation, (element => {
      before(element, operation);
      operate(operation, (() => {
        let firstObjectInChain;
        const {element: element, receiver: receiver, method: method, args: args} = operation;
        const chain = safeString(method).split(".");
        switch (receiver) {
         case "window":
          firstObjectInChain = window;
          break;

         case "document":
          firstObjectInChain = document;
          break;

         default:
          firstObjectInChain = element;
        }
        let lastObjectInChain = firstObjectInChain;
        const foundMethod = chain.reduce(((lastTerm, nextTerm) => {
          lastObjectInChain = lastTerm;
          return lastTerm[nextTerm] || {};
        }), firstObjectInChain);
        if (foundMethod instanceof Function) {
          foundMethod.apply(lastObjectInChain, args || []);
        } else {
          console.warn(`CableReady invoke_method operation failed due to missing '${method}' method for:`, firstObjectInChain);
        }
      }));
      after(element, operation);
    }));
  },
  setMeta: operation => {
    before(document, operation);
    operate(operation, (() => {
      const {name: name, content: content} = operation;
      let meta = document.head.querySelector(`meta[name='${name}']`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = safeString(name);
        document.head.appendChild(meta);
      }
      meta.content = safeScalar(content);
    }));
    after(document, operation);
  },
  clearStorage: operation => {
    before(document, operation);
    operate(operation, (() => {
      const {type: type} = operation;
      const storage = type === "session" ? sessionStorage : localStorage;
      storage.clear();
    }));
    after(document, operation);
  },
  go: operation => {
    before(window, operation);
    operate(operation, (() => {
      const {delta: delta} = operation;
      history.go(delta);
    }));
    after(window, operation);
  },
  pushState: operation => {
    before(window, operation);
    operate(operation, (() => {
      const {state: state, title: title, url: url} = operation;
      history.pushState(safeObject(state), safeString(title), safeString(url));
    }));
    after(window, operation);
  },
  redirectTo: operation => {
    before(window, operation);
    operate(operation, (() => {
      let {url: url, action: action, turbo: turbo} = operation;
      action = action || "advance";
      url = safeString(url);
      if (turbo === undefined) turbo = true;
      if (turbo) {
        if (window.Turbo) window.Turbo.visit(url, {
          action: action
        });
        if (window.Turbolinks) window.Turbolinks.visit(url, {
          action: action
        });
        if (!window.Turbo && !window.Turbolinks) window.location.href = url;
      } else {
        window.location.href = url;
      }
    }));
    after(window, operation);
  },
  reload: operation => {
    before(window, operation);
    operate(operation, (() => {
      window.location.reload();
    }));
    after(window, operation);
  },
  removeStorageItem: operation => {
    before(document, operation);
    operate(operation, (() => {
      const {key: key, type: type} = operation;
      const storage = type === "session" ? sessionStorage : localStorage;
      storage.removeItem(safeString(key));
    }));
    after(document, operation);
  },
  replaceState: operation => {
    before(window, operation);
    operate(operation, (() => {
      const {state: state, title: title, url: url} = operation;
      history.replaceState(safeObject(state), safeString(title), safeString(url));
    }));
    after(window, operation);
  },
  scrollIntoView: operation => {
    const {element: element} = operation;
    before(element, operation);
    operate(operation, (() => {
      element.scrollIntoView(operation);
    }));
    after(element, operation);
  },
  setCookie: operation => {
    before(document, operation);
    operate(operation, (() => {
      const {cookie: cookie} = operation;
      document.cookie = safeScalar(cookie);
    }));
    after(document, operation);
  },
  setFocus: operation => {
    const {element: element} = operation;
    before(element, operation);
    operate(operation, (() => {
      assignFocus(element);
    }));
    after(element, operation);
  },
  setStorageItem: operation => {
    before(document, operation);
    operate(operation, (() => {
      const {key: key, value: value, type: type} = operation;
      const storage = type === "session" ? sessionStorage : localStorage;
      storage.setItem(safeString(key), safeScalar(value));
    }));
    after(document, operation);
  },
  consoleLog: operation => {
    before(document, operation);
    operate(operation, (() => {
      const {message: message, level: level} = operation;
      level && [ "warn", "info", "error" ].includes(level) ? console[level](message) : console.log(message);
    }));
    after(document, operation);
  },
  consoleTable: operation => {
    before(document, operation);
    operate(operation, (() => {
      const {data: data, columns: columns} = operation;
      console.table(data, safeArray(columns));
    }));
    after(document, operation);
  },
  notification: operation => {
    before(document, operation);
    operate(operation, (() => {
      const {title: title, options: options} = operation;
      Notification.requestPermission().then((result => {
        operation.permission = result;
        if (result === "granted") new Notification(safeString(title), safeObject(options));
      }));
    }));
    after(document, operation);
  }
};

let operations = Operations;

const add = newOperations => {
  operations = {
    ...operations,
    ...newOperations
  };
};

const addOperations = operations => {
  add(operations);
};

const addOperation = (name, operation) => {
  const operations = {};
  operations[name] = operation;
  add(operations);
};

var OperationStore = {
  get all() {
    return operations;
  }
};

var UINT32_MAX = 4294967295;

function setInt64(view, offset, value) {
  var high = Math.floor(value / 4294967296);
  var low = value;
  view.setUint32(offset, high);
  view.setUint32(offset + 4, low);
}

function getInt64(view, offset) {
  var high = view.getInt32(offset);
  var low = view.getUint32(offset + 4);
  return high * 4294967296 + low;
}

function getUint64(view, offset) {
  var high = view.getUint32(offset);
  var low = view.getUint32(offset + 4);
  return high * 4294967296 + low;
}

var _a, _b, _c;

var TEXT_ENCODING_AVAILABLE = (typeof process === "undefined" || ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a["TEXT_ENCODING"]) !== "never") && typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined";

var sharedTextEncoder = TEXT_ENCODING_AVAILABLE ? new TextEncoder : undefined;

!TEXT_ENCODING_AVAILABLE ? UINT32_MAX : typeof process !== "undefined" && ((_b = process === null || process === void 0 ? void 0 : process.env) === null || _b === void 0 ? void 0 : _b["TEXT_ENCODING"]) !== "force" ? 200 : 0;

function utf8EncodeTEencode(str, output, outputOffset) {
  output.set(sharedTextEncoder.encode(str), outputOffset);
}

function utf8EncodeTEencodeInto(str, output, outputOffset) {
  sharedTextEncoder.encodeInto(str, output.subarray(outputOffset));
}

(sharedTextEncoder === null || sharedTextEncoder === void 0 ? void 0 : sharedTextEncoder.encodeInto) ? utf8EncodeTEencodeInto : utf8EncodeTEencode;

var CHUNK_SIZE = 4096;

function utf8DecodeJs(bytes, inputOffset, byteLength) {
  var offset = inputOffset;
  var end = offset + byteLength;
  var units = [];
  var result = "";
  while (offset < end) {
    var byte1 = bytes[offset++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      var byte2 = bytes[offset++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      var byte2 = bytes[offset++] & 63;
      var byte3 = bytes[offset++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      var byte2 = bytes[offset++] & 63;
      var byte3 = bytes[offset++] & 63;
      var byte4 = bytes[offset++] & 63;
      var unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= CHUNK_SIZE) {
      result += String.fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += String.fromCharCode.apply(String, units);
  }
  return result;
}

var sharedTextDecoder = TEXT_ENCODING_AVAILABLE ? new TextDecoder : null;

var TEXT_DECODER_THRESHOLD = !TEXT_ENCODING_AVAILABLE ? UINT32_MAX : typeof process !== "undefined" && ((_c = process === null || process === void 0 ? void 0 : process.env) === null || _c === void 0 ? void 0 : _c["TEXT_DECODER"]) !== "force" ? 200 : 0;

function utf8DecodeTD(bytes, inputOffset, byteLength) {
  var stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
  return sharedTextDecoder.decode(stringBytes);
}

var ExtData = function() {
  function ExtData(type, data) {
    this.type = type;
    this.data = data;
  }
  return ExtData;
}();

var __extends = undefined && undefined.__extends || function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function(d, b) {
      d.__proto__ = b;
    } || function(d, b) {
      for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
  };
}();

var DecodeError = function(_super) {
  __extends(DecodeError, _super);
  function DecodeError(message) {
    var _this = _super.call(this, message) || this;
    var proto = Object.create(DecodeError.prototype);
    Object.setPrototypeOf(_this, proto);
    Object.defineProperty(_this, "name", {
      configurable: true,
      enumerable: false,
      value: DecodeError.name
    });
    return _this;
  }
  return DecodeError;
}(Error);

var EXT_TIMESTAMP = -1;

var TIMESTAMP32_MAX_SEC = 4294967296 - 1;

var TIMESTAMP64_MAX_SEC = 17179869184 - 1;

function encodeTimeSpecToTimestamp(_a) {
  var sec = _a.sec, nsec = _a.nsec;
  if (sec >= 0 && nsec >= 0 && sec <= TIMESTAMP64_MAX_SEC) {
    if (nsec === 0 && sec <= TIMESTAMP32_MAX_SEC) {
      var rv = new Uint8Array(4);
      var view = new DataView(rv.buffer);
      view.setUint32(0, sec);
      return rv;
    } else {
      var secHigh = sec / 4294967296;
      var secLow = sec & 4294967295;
      var rv = new Uint8Array(8);
      var view = new DataView(rv.buffer);
      view.setUint32(0, nsec << 2 | secHigh & 3);
      view.setUint32(4, secLow);
      return rv;
    }
  } else {
    var rv = new Uint8Array(12);
    var view = new DataView(rv.buffer);
    view.setUint32(0, nsec);
    setInt64(view, 4, sec);
    return rv;
  }
}

function encodeDateToTimeSpec(date) {
  var msec = date.getTime();
  var sec = Math.floor(msec / 1e3);
  var nsec = (msec - sec * 1e3) * 1e6;
  var nsecInSec = Math.floor(nsec / 1e9);
  return {
    sec: sec + nsecInSec,
    nsec: nsec - nsecInSec * 1e9
  };
}

function encodeTimestampExtension(object) {
  if (object instanceof Date) {
    var timeSpec = encodeDateToTimeSpec(object);
    return encodeTimeSpecToTimestamp(timeSpec);
  } else {
    return null;
  }
}

function decodeTimestampToTimeSpec(data) {
  var view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  switch (data.byteLength) {
   case 4:
    {
      var sec = view.getUint32(0);
      var nsec = 0;
      return {
        sec: sec,
        nsec: nsec
      };
    }

   case 8:
    {
      var nsec30AndSecHigh2 = view.getUint32(0);
      var secLow32 = view.getUint32(4);
      var sec = (nsec30AndSecHigh2 & 3) * 4294967296 + secLow32;
      var nsec = nsec30AndSecHigh2 >>> 2;
      return {
        sec: sec,
        nsec: nsec
      };
    }

   case 12:
    {
      var sec = getInt64(view, 4);
      var nsec = view.getUint32(0);
      return {
        sec: sec,
        nsec: nsec
      };
    }

   default:
    throw new DecodeError("Unrecognized data size for timestamp (expected 4, 8, or 12): ".concat(data.length));
  }
}

function decodeTimestampExtension(data) {
  var timeSpec = decodeTimestampToTimeSpec(data);
  return new Date(timeSpec.sec * 1e3 + timeSpec.nsec / 1e6);
}

var timestampExtension = {
  type: EXT_TIMESTAMP,
  encode: encodeTimestampExtension,
  decode: decodeTimestampExtension
};

var ExtensionCodec = function() {
  function ExtensionCodec() {
    this.builtInEncoders = [];
    this.builtInDecoders = [];
    this.encoders = [];
    this.decoders = [];
    this.register(timestampExtension);
  }
  ExtensionCodec.prototype.register = function(_a) {
    var type = _a.type, encode = _a.encode, decode = _a.decode;
    if (type >= 0) {
      this.encoders[type] = encode;
      this.decoders[type] = decode;
    } else {
      var index = 1 + type;
      this.builtInEncoders[index] = encode;
      this.builtInDecoders[index] = decode;
    }
  };
  ExtensionCodec.prototype.tryToEncode = function(object, context) {
    for (var i = 0; i < this.builtInEncoders.length; i++) {
      var encodeExt = this.builtInEncoders[i];
      if (encodeExt != null) {
        var data = encodeExt(object, context);
        if (data != null) {
          var type = -1 - i;
          return new ExtData(type, data);
        }
      }
    }
    for (var i = 0; i < this.encoders.length; i++) {
      var encodeExt = this.encoders[i];
      if (encodeExt != null) {
        var data = encodeExt(object, context);
        if (data != null) {
          var type = i;
          return new ExtData(type, data);
        }
      }
    }
    if (object instanceof ExtData) {
      return object;
    }
    return null;
  };
  ExtensionCodec.prototype.decode = function(data, type, context) {
    var decodeExt = type < 0 ? this.builtInDecoders[-1 - type] : this.decoders[type];
    if (decodeExt) {
      return decodeExt(data, type, context);
    } else {
      return new ExtData(type, data);
    }
  };
  ExtensionCodec.defaultCodec = new ExtensionCodec;
  return ExtensionCodec;
}();

function ensureUint8Array(buffer) {
  if (buffer instanceof Uint8Array) {
    return buffer;
  } else if (ArrayBuffer.isView(buffer)) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (buffer instanceof ArrayBuffer) {
    return new Uint8Array(buffer);
  } else {
    return Uint8Array.from(buffer);
  }
}

function createDataView(buffer) {
  if (buffer instanceof ArrayBuffer) {
    return new DataView(buffer);
  }
  var bufferView = ensureUint8Array(buffer);
  return new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
}

function prettyByte(byte) {
  return "".concat(byte < 0 ? "-" : "", "0x").concat(Math.abs(byte).toString(16).padStart(2, "0"));
}

var DEFAULT_MAX_KEY_LENGTH = 16;

var DEFAULT_MAX_LENGTH_PER_KEY = 16;

var CachedKeyDecoder = function() {
  function CachedKeyDecoder(maxKeyLength, maxLengthPerKey) {
    if (maxKeyLength === void 0) {
      maxKeyLength = DEFAULT_MAX_KEY_LENGTH;
    }
    if (maxLengthPerKey === void 0) {
      maxLengthPerKey = DEFAULT_MAX_LENGTH_PER_KEY;
    }
    this.maxKeyLength = maxKeyLength;
    this.maxLengthPerKey = maxLengthPerKey;
    this.hit = 0;
    this.miss = 0;
    this.caches = [];
    for (var i = 0; i < this.maxKeyLength; i++) {
      this.caches.push([]);
    }
  }
  CachedKeyDecoder.prototype.canBeCached = function(byteLength) {
    return byteLength > 0 && byteLength <= this.maxKeyLength;
  };
  CachedKeyDecoder.prototype.find = function(bytes, inputOffset, byteLength) {
    var records = this.caches[byteLength - 1];
    FIND_CHUNK: for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
      var record = records_1[_i];
      var recordBytes = record.bytes;
      for (var j = 0; j < byteLength; j++) {
        if (recordBytes[j] !== bytes[inputOffset + j]) {
          continue FIND_CHUNK;
        }
      }
      return record.str;
    }
    return null;
  };
  CachedKeyDecoder.prototype.store = function(bytes, value) {
    var records = this.caches[bytes.length - 1];
    var record = {
      bytes: bytes,
      str: value
    };
    if (records.length >= this.maxLengthPerKey) {
      records[Math.random() * records.length | 0] = record;
    } else {
      records.push(record);
    }
  };
  CachedKeyDecoder.prototype.decode = function(bytes, inputOffset, byteLength) {
    var cachedValue = this.find(bytes, inputOffset, byteLength);
    if (cachedValue != null) {
      this.hit++;
      return cachedValue;
    }
    this.miss++;
    var str = utf8DecodeJs(bytes, inputOffset, byteLength);
    var slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
    this.store(slicedCopyOfBytes, str);
    return str;
  };
  return CachedKeyDecoder;
}();

var __awaiter = undefined && undefined.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P((function(resolve) {
      resolve(value);
    }));
  }
  return new (P || (P = Promise))((function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  }));
};

var __generator = undefined && undefined.__generator || function(thisArg, body) {
  var _ = {
    label: 0,
    sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  }, f, y, t, g;
  return g = {
    next: verb(0),
    throw: verb(1),
    return: verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([ n, v ]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 
      0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [ op[0] & 2, t.value ];
      switch (op[0]) {
       case 0:
       case 1:
        t = op;
        break;

       case 4:
        _.label++;
        return {
          value: op[1],
          done: false
        };

       case 5:
        _.label++;
        y = op[1];
        op = [ 0 ];
        continue;

       case 7:
        op = _.ops.pop();
        _.trys.pop();
        continue;

       default:
        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
          _ = 0;
          continue;
        }
        if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
          _.label = op[1];
          break;
        }
        if (op[0] === 6 && _.label < t[1]) {
          _.label = t[1];
          t = op;
          break;
        }
        if (t && _.label < t[2]) {
          _.label = t[2];
          _.ops.push(op);
          break;
        }
        if (t[2]) _.ops.pop();
        _.trys.pop();
        continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [ 6, e ];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __asyncValues = undefined && undefined.__asyncValues || function(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), 
  i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise((function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      }));
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then((function(v) {
      resolve({
        value: v,
        done: d
      });
    }), reject);
  }
};

var __await = undefined && undefined.__await || function(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
};

var __asyncGenerator = undefined && undefined.__asyncGenerator || function(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function verb(n) {
    if (g[n]) i[n] = function(v) {
      return new Promise((function(a, b) {
        q.push([ n, v, a, b ]) > 1 || resume(n, v);
      }));
    };
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
};

var isValidMapKeyType = function(key) {
  var keyType = typeof key;
  return keyType === "string" || keyType === "number";
};

var HEAD_BYTE_REQUIRED = -1;

var EMPTY_VIEW = new DataView(new ArrayBuffer(0));

var EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);

var DataViewIndexOutOfBoundsError = function() {
  try {
    EMPTY_VIEW.getInt8(0);
  } catch (e) {
    return e.constructor;
  }
  throw new Error("never reached");
}();

var MORE_DATA = new DataViewIndexOutOfBoundsError("Insufficient data");

var sharedCachedKeyDecoder = new CachedKeyDecoder;

var Decoder = function() {
  function Decoder(extensionCodec, context, maxStrLength, maxBinLength, maxArrayLength, maxMapLength, maxExtLength, keyDecoder) {
    if (extensionCodec === void 0) {
      extensionCodec = ExtensionCodec.defaultCodec;
    }
    if (context === void 0) {
      context = undefined;
    }
    if (maxStrLength === void 0) {
      maxStrLength = UINT32_MAX;
    }
    if (maxBinLength === void 0) {
      maxBinLength = UINT32_MAX;
    }
    if (maxArrayLength === void 0) {
      maxArrayLength = UINT32_MAX;
    }
    if (maxMapLength === void 0) {
      maxMapLength = UINT32_MAX;
    }
    if (maxExtLength === void 0) {
      maxExtLength = UINT32_MAX;
    }
    if (keyDecoder === void 0) {
      keyDecoder = sharedCachedKeyDecoder;
    }
    this.extensionCodec = extensionCodec;
    this.context = context;
    this.maxStrLength = maxStrLength;
    this.maxBinLength = maxBinLength;
    this.maxArrayLength = maxArrayLength;
    this.maxMapLength = maxMapLength;
    this.maxExtLength = maxExtLength;
    this.keyDecoder = keyDecoder;
    this.totalPos = 0;
    this.pos = 0;
    this.view = EMPTY_VIEW;
    this.bytes = EMPTY_BYTES;
    this.headByte = HEAD_BYTE_REQUIRED;
    this.stack = [];
  }
  Decoder.prototype.reinitializeState = function() {
    this.totalPos = 0;
    this.headByte = HEAD_BYTE_REQUIRED;
    this.stack.length = 0;
  };
  Decoder.prototype.setBuffer = function(buffer) {
    this.bytes = ensureUint8Array(buffer);
    this.view = createDataView(this.bytes);
    this.pos = 0;
  };
  Decoder.prototype.appendBuffer = function(buffer) {
    if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining(1)) {
      this.setBuffer(buffer);
    } else {
      var remainingData = this.bytes.subarray(this.pos);
      var newData = ensureUint8Array(buffer);
      var newBuffer = new Uint8Array(remainingData.length + newData.length);
      newBuffer.set(remainingData);
      newBuffer.set(newData, remainingData.length);
      this.setBuffer(newBuffer);
    }
  };
  Decoder.prototype.hasRemaining = function(size) {
    return this.view.byteLength - this.pos >= size;
  };
  Decoder.prototype.createExtraByteError = function(posToShow) {
    var _a = this, view = _a.view, pos = _a.pos;
    return new RangeError("Extra ".concat(view.byteLength - pos, " of ").concat(view.byteLength, " byte(s) found at buffer[").concat(posToShow, "]"));
  };
  Decoder.prototype.decode = function(buffer) {
    this.reinitializeState();
    this.setBuffer(buffer);
    var object = this.doDecodeSync();
    if (this.hasRemaining(1)) {
      throw this.createExtraByteError(this.pos);
    }
    return object;
  };
  Decoder.prototype.decodeMulti = function(buffer) {
    return __generator(this, (function(_a) {
      switch (_a.label) {
       case 0:
        this.reinitializeState();
        this.setBuffer(buffer);
        _a.label = 1;

       case 1:
        if (!this.hasRemaining(1)) return [ 3, 3 ];
        return [ 4, this.doDecodeSync() ];

       case 2:
        _a.sent();
        return [ 3, 1 ];

       case 3:
        return [ 2 ];
      }
    }));
  };
  Decoder.prototype.decodeAsync = function(stream) {
    var stream_1, stream_1_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, (function() {
      var decoded, object, buffer, e_1_1, _b, headByte, pos, totalPos;
      return __generator(this, (function(_c) {
        switch (_c.label) {
         case 0:
          decoded = false;
          _c.label = 1;

         case 1:
          _c.trys.push([ 1, 6, 7, 12 ]);
          stream_1 = __asyncValues(stream);
          _c.label = 2;

         case 2:
          return [ 4, stream_1.next() ];

         case 3:
          if (!(stream_1_1 = _c.sent(), !stream_1_1.done)) return [ 3, 5 ];
          buffer = stream_1_1.value;
          if (decoded) {
            throw this.createExtraByteError(this.totalPos);
          }
          this.appendBuffer(buffer);
          try {
            object = this.doDecodeSync();
            decoded = true;
          } catch (e) {
            if (!(e instanceof DataViewIndexOutOfBoundsError)) {
              throw e;
            }
          }
          this.totalPos += this.pos;
          _c.label = 4;

         case 4:
          return [ 3, 2 ];

         case 5:
          return [ 3, 12 ];

         case 6:
          e_1_1 = _c.sent();
          e_1 = {
            error: e_1_1
          };
          return [ 3, 12 ];

         case 7:
          _c.trys.push([ 7, , 10, 11 ]);
          if (!(stream_1_1 && !stream_1_1.done && (_a = stream_1.return))) return [ 3, 9 ];
          return [ 4, _a.call(stream_1) ];

         case 8:
          _c.sent();
          _c.label = 9;

         case 9:
          return [ 3, 11 ];

         case 10:
          if (e_1) throw e_1.error;
          return [ 7 ];

         case 11:
          return [ 7 ];

         case 12:
          if (decoded) {
            if (this.hasRemaining(1)) {
              throw this.createExtraByteError(this.totalPos);
            }
            return [ 2, object ];
          }
          _b = this, headByte = _b.headByte, pos = _b.pos, totalPos = _b.totalPos;
          throw new RangeError("Insufficient data in parsing ".concat(prettyByte(headByte), " at ").concat(totalPos, " (").concat(pos, " in the current buffer)"));
        }
      }));
    }));
  };
  Decoder.prototype.decodeArrayStream = function(stream) {
    return this.decodeMultiAsync(stream, true);
  };
  Decoder.prototype.decodeStream = function(stream) {
    return this.decodeMultiAsync(stream, false);
  };
  Decoder.prototype.decodeMultiAsync = function(stream, isArray) {
    return __asyncGenerator(this, arguments, (function decodeMultiAsync_1() {
      var isArrayHeaderRequired, arrayItemsLeft, stream_2, stream_2_1, buffer, e_2, e_3_1;
      var e_3, _a;
      return __generator(this, (function(_b) {
        switch (_b.label) {
         case 0:
          isArrayHeaderRequired = isArray;
          arrayItemsLeft = -1;
          _b.label = 1;

         case 1:
          _b.trys.push([ 1, 13, 14, 19 ]);
          stream_2 = __asyncValues(stream);
          _b.label = 2;

         case 2:
          return [ 4, __await(stream_2.next()) ];

         case 3:
          if (!(stream_2_1 = _b.sent(), !stream_2_1.done)) return [ 3, 12 ];
          buffer = stream_2_1.value;
          if (isArray && arrayItemsLeft === 0) {
            throw this.createExtraByteError(this.totalPos);
          }
          this.appendBuffer(buffer);
          if (isArrayHeaderRequired) {
            arrayItemsLeft = this.readArraySize();
            isArrayHeaderRequired = false;
            this.complete();
          }
          _b.label = 4;

         case 4:
          _b.trys.push([ 4, 9, , 10 ]);
          _b.label = 5;

         case 5:
          return [ 4, __await(this.doDecodeSync()) ];

         case 6:
          return [ 4, _b.sent() ];

         case 7:
          _b.sent();
          if (--arrayItemsLeft === 0) {
            return [ 3, 8 ];
          }
          return [ 3, 5 ];

         case 8:
          return [ 3, 10 ];

         case 9:
          e_2 = _b.sent();
          if (!(e_2 instanceof DataViewIndexOutOfBoundsError)) {
            throw e_2;
          }
          return [ 3, 10 ];

         case 10:
          this.totalPos += this.pos;
          _b.label = 11;

         case 11:
          return [ 3, 2 ];

         case 12:
          return [ 3, 19 ];

         case 13:
          e_3_1 = _b.sent();
          e_3 = {
            error: e_3_1
          };
          return [ 3, 19 ];

         case 14:
          _b.trys.push([ 14, , 17, 18 ]);
          if (!(stream_2_1 && !stream_2_1.done && (_a = stream_2.return))) return [ 3, 16 ];
          return [ 4, __await(_a.call(stream_2)) ];

         case 15:
          _b.sent();
          _b.label = 16;

         case 16:
          return [ 3, 18 ];

         case 17:
          if (e_3) throw e_3.error;
          return [ 7 ];

         case 18:
          return [ 7 ];

         case 19:
          return [ 2 ];
        }
      }));
    }));
  };
  Decoder.prototype.doDecodeSync = function() {
    DECODE: while (true) {
      var headByte = this.readHeadByte();
      var object = void 0;
      if (headByte >= 224) {
        object = headByte - 256;
      } else if (headByte < 192) {
        if (headByte < 128) {
          object = headByte;
        } else if (headByte < 144) {
          var size = headByte - 128;
          if (size !== 0) {
            this.pushMapState(size);
            this.complete();
            continue DECODE;
          } else {
            object = {};
          }
        } else if (headByte < 160) {
          var size = headByte - 144;
          if (size !== 0) {
            this.pushArrayState(size);
            this.complete();
            continue DECODE;
          } else {
            object = [];
          }
        } else {
          var byteLength = headByte - 160;
          object = this.decodeUtf8String(byteLength, 0);
        }
      } else if (headByte === 192) {
        object = null;
      } else if (headByte === 194) {
        object = false;
      } else if (headByte === 195) {
        object = true;
      } else if (headByte === 202) {
        object = this.readF32();
      } else if (headByte === 203) {
        object = this.readF64();
      } else if (headByte === 204) {
        object = this.readU8();
      } else if (headByte === 205) {
        object = this.readU16();
      } else if (headByte === 206) {
        object = this.readU32();
      } else if (headByte === 207) {
        object = this.readU64();
      } else if (headByte === 208) {
        object = this.readI8();
      } else if (headByte === 209) {
        object = this.readI16();
      } else if (headByte === 210) {
        object = this.readI32();
      } else if (headByte === 211) {
        object = this.readI64();
      } else if (headByte === 217) {
        var byteLength = this.lookU8();
        object = this.decodeUtf8String(byteLength, 1);
      } else if (headByte === 218) {
        var byteLength = this.lookU16();
        object = this.decodeUtf8String(byteLength, 2);
      } else if (headByte === 219) {
        var byteLength = this.lookU32();
        object = this.decodeUtf8String(byteLength, 4);
      } else if (headByte === 220) {
        var size = this.readU16();
        if (size !== 0) {
          this.pushArrayState(size);
          this.complete();
          continue DECODE;
        } else {
          object = [];
        }
      } else if (headByte === 221) {
        var size = this.readU32();
        if (size !== 0) {
          this.pushArrayState(size);
          this.complete();
          continue DECODE;
        } else {
          object = [];
        }
      } else if (headByte === 222) {
        var size = this.readU16();
        if (size !== 0) {
          this.pushMapState(size);
          this.complete();
          continue DECODE;
        } else {
          object = {};
        }
      } else if (headByte === 223) {
        var size = this.readU32();
        if (size !== 0) {
          this.pushMapState(size);
          this.complete();
          continue DECODE;
        } else {
          object = {};
        }
      } else if (headByte === 196) {
        var size = this.lookU8();
        object = this.decodeBinary(size, 1);
      } else if (headByte === 197) {
        var size = this.lookU16();
        object = this.decodeBinary(size, 2);
      } else if (headByte === 198) {
        var size = this.lookU32();
        object = this.decodeBinary(size, 4);
      } else if (headByte === 212) {
        object = this.decodeExtension(1, 0);
      } else if (headByte === 213) {
        object = this.decodeExtension(2, 0);
      } else if (headByte === 214) {
        object = this.decodeExtension(4, 0);
      } else if (headByte === 215) {
        object = this.decodeExtension(8, 0);
      } else if (headByte === 216) {
        object = this.decodeExtension(16, 0);
      } else if (headByte === 199) {
        var size = this.lookU8();
        object = this.decodeExtension(size, 1);
      } else if (headByte === 200) {
        var size = this.lookU16();
        object = this.decodeExtension(size, 2);
      } else if (headByte === 201) {
        var size = this.lookU32();
        object = this.decodeExtension(size, 4);
      } else {
        throw new DecodeError("Unrecognized type byte: ".concat(prettyByte(headByte)));
      }
      this.complete();
      var stack = this.stack;
      while (stack.length > 0) {
        var state = stack[stack.length - 1];
        if (state.type === 0) {
          state.array[state.position] = object;
          state.position++;
          if (state.position === state.size) {
            stack.pop();
            object = state.array;
          } else {
            continue DECODE;
          }
        } else if (state.type === 1) {
          if (!isValidMapKeyType(object)) {
            throw new DecodeError("The type of key must be string or number but " + typeof object);
          }
          if (object === "__proto__") {
            throw new DecodeError("The key __proto__ is not allowed");
          }
          state.key = object;
          state.type = 2;
          continue DECODE;
        } else {
          state.map[state.key] = object;
          state.readCount++;
          if (state.readCount === state.size) {
            stack.pop();
            object = state.map;
          } else {
            state.key = null;
            state.type = 1;
            continue DECODE;
          }
        }
      }
      return object;
    }
  };
  Decoder.prototype.readHeadByte = function() {
    if (this.headByte === HEAD_BYTE_REQUIRED) {
      this.headByte = this.readU8();
    }
    return this.headByte;
  };
  Decoder.prototype.complete = function() {
    this.headByte = HEAD_BYTE_REQUIRED;
  };
  Decoder.prototype.readArraySize = function() {
    var headByte = this.readHeadByte();
    switch (headByte) {
     case 220:
      return this.readU16();

     case 221:
      return this.readU32();

     default:
      {
        if (headByte < 160) {
          return headByte - 144;
        } else {
          throw new DecodeError("Unrecognized array type byte: ".concat(prettyByte(headByte)));
        }
      }
    }
  };
  Decoder.prototype.pushMapState = function(size) {
    if (size > this.maxMapLength) {
      throw new DecodeError("Max length exceeded: map length (".concat(size, ") > maxMapLengthLength (").concat(this.maxMapLength, ")"));
    }
    this.stack.push({
      type: 1,
      size: size,
      key: null,
      readCount: 0,
      map: {}
    });
  };
  Decoder.prototype.pushArrayState = function(size) {
    if (size > this.maxArrayLength) {
      throw new DecodeError("Max length exceeded: array length (".concat(size, ") > maxArrayLength (").concat(this.maxArrayLength, ")"));
    }
    this.stack.push({
      type: 0,
      size: size,
      array: new Array(size),
      position: 0
    });
  };
  Decoder.prototype.decodeUtf8String = function(byteLength, headerOffset) {
    var _a;
    if (byteLength > this.maxStrLength) {
      throw new DecodeError("Max length exceeded: UTF-8 byte length (".concat(byteLength, ") > maxStrLength (").concat(this.maxStrLength, ")"));
    }
    if (this.bytes.byteLength < this.pos + headerOffset + byteLength) {
      throw MORE_DATA;
    }
    var offset = this.pos + headerOffset;
    var object;
    if (this.stateIsMapKey() && ((_a = this.keyDecoder) === null || _a === void 0 ? void 0 : _a.canBeCached(byteLength))) {
      object = this.keyDecoder.decode(this.bytes, offset, byteLength);
    } else if (byteLength > TEXT_DECODER_THRESHOLD) {
      object = utf8DecodeTD(this.bytes, offset, byteLength);
    } else {
      object = utf8DecodeJs(this.bytes, offset, byteLength);
    }
    this.pos += headerOffset + byteLength;
    return object;
  };
  Decoder.prototype.stateIsMapKey = function() {
    if (this.stack.length > 0) {
      var state = this.stack[this.stack.length - 1];
      return state.type === 1;
    }
    return false;
  };
  Decoder.prototype.decodeBinary = function(byteLength, headOffset) {
    if (byteLength > this.maxBinLength) {
      throw new DecodeError("Max length exceeded: bin length (".concat(byteLength, ") > maxBinLength (").concat(this.maxBinLength, ")"));
    }
    if (!this.hasRemaining(byteLength + headOffset)) {
      throw MORE_DATA;
    }
    var offset = this.pos + headOffset;
    var object = this.bytes.subarray(offset, offset + byteLength);
    this.pos += headOffset + byteLength;
    return object;
  };
  Decoder.prototype.decodeExtension = function(size, headOffset) {
    if (size > this.maxExtLength) {
      throw new DecodeError("Max length exceeded: ext length (".concat(size, ") > maxExtLength (").concat(this.maxExtLength, ")"));
    }
    var extType = this.view.getInt8(this.pos + headOffset);
    var data = this.decodeBinary(size, headOffset + 1);
    return this.extensionCodec.decode(data, extType, this.context);
  };
  Decoder.prototype.lookU8 = function() {
    return this.view.getUint8(this.pos);
  };
  Decoder.prototype.lookU16 = function() {
    return this.view.getUint16(this.pos);
  };
  Decoder.prototype.lookU32 = function() {
    return this.view.getUint32(this.pos);
  };
  Decoder.prototype.readU8 = function() {
    var value = this.view.getUint8(this.pos);
    this.pos++;
    return value;
  };
  Decoder.prototype.readI8 = function() {
    var value = this.view.getInt8(this.pos);
    this.pos++;
    return value;
  };
  Decoder.prototype.readU16 = function() {
    var value = this.view.getUint16(this.pos);
    this.pos += 2;
    return value;
  };
  Decoder.prototype.readI16 = function() {
    var value = this.view.getInt16(this.pos);
    this.pos += 2;
    return value;
  };
  Decoder.prototype.readU32 = function() {
    var value = this.view.getUint32(this.pos);
    this.pos += 4;
    return value;
  };
  Decoder.prototype.readI32 = function() {
    var value = this.view.getInt32(this.pos);
    this.pos += 4;
    return value;
  };
  Decoder.prototype.readU64 = function() {
    var value = getUint64(this.view, this.pos);
    this.pos += 8;
    return value;
  };
  Decoder.prototype.readI64 = function() {
    var value = getInt64(this.view, this.pos);
    this.pos += 8;
    return value;
  };
  Decoder.prototype.readF32 = function() {
    var value = this.view.getFloat32(this.pos);
    this.pos += 4;
    return value;
  };
  Decoder.prototype.readF64 = function() {
    var value = this.view.getFloat64(this.pos);
    this.pos += 8;
    return value;
  };
  return Decoder;
}();

var defaultDecodeOptions = {};

function decode(buffer, options) {
  if (options === void 0) {
    options = defaultDecodeOptions;
  }
  var decoder = new Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
  return decoder.decode(buffer);
}

const perform = (operations, options = {
  emitMissingElementWarnings: true
}) => {
  const batches = {};
  operations = decode(operations);
  operations.forEach((operation => {
    if (!!operation.batch) batches[operation.batch] = batches[operation.batch] ? ++batches[operation.batch] : 1;
  }));
  operations.forEach((operation => {
    const name = operation.operation;
    try {
      if (operation.selector) {
        if (operation.xpath) {
          operation.element = operation.selectAll ? xpathToElementArray(operation.selector) : xpathToElement(operation.selector);
        } else {
          operation.element = operation.selectAll ? document.querySelectorAll(operation.selector) : document.querySelector(operation.selector);
        }
      } else {
        operation.element = document;
      }
      if (operation.element || options.emitMissingElementWarnings) {
        ActiveElement.set(document.activeElement);
        const cableReadyOperation = OperationStore.all[name];
        if (cableReadyOperation) {
          cableReadyOperation(operation);
          if (!!operation.batch && --batches[operation.batch] === 0) dispatch(document, "cable-ready:batch-complete", {
            batch: operation.batch
          });
        } else {
          console.error(`CableReady couldn't find the "${name}" operation. Make sure you use the camelized form when calling an operation method.`);
        }
      }
    } catch (e) {
      if (operation.element) {
        console.error(`CableReady detected an error in ${name || "operation"}: ${e.message}. If you need to support older browsers make sure you've included the corresponding polyfills. https://docs.stimulusreflex.com/setup#polyfills-for-ie11.`);
        console.error(e);
      } else {
        console.warn(`CableReady ${name || "operation"} failed due to missing DOM element for selector: '${operation.selector}'`);
      }
    }
  }));
};

const performAsync = (operations, options = {
  emitMissingElementWarnings: true
}) => new Promise(((resolve, reject) => {
  try {
    resolve(perform(operations, options));
  } catch (err) {
    reject(err);
  }
}));

let consumer;

const BACKOFF = [ 25, 50, 75, 100, 200, 250, 500, 800, 1e3, 2e3 ];

const wait = ms => new Promise((resolve => setTimeout(resolve, ms)));

const getConsumerWithRetry = async (retry = 0) => {
  if (consumer) return consumer;
  if (retry >= BACKOFF.length) {
    throw new Error("Couldn't obtain a Action Cable consumer within 5s");
  }
  await wait(BACKOFF[retry]);
  return await getConsumerWithRetry(retry + 1);
};

var CableConsumer = {
  setConsumer(value) {
    consumer = value;
  },
  get consumer() {
    return consumer;
  },
  async getConsumer() {
    return await getConsumerWithRetry();
  }
};

class CableReadyElement extends HTMLElement {
  static define() {
    if (!customElements.get("cable-ready")) {
      customElements.define("cable-ready", this);
    }
  }
  connectedCallback() {
    setTimeout((() => {
      try {
        const operations = JSON.parse(this.scriptElement.textContent);
        perform(operations);
      } catch (error) {
        console.error(error);
      } finally {
        try {
          this.remove();
        } catch {}
      }
    }));
  }
  get scriptElement() {
    if (this.firstElementChild instanceof HTMLScriptElement && this.firstElementChild.getAttribute("type") === "application/json") {
      return this.firstElementChild;
    }
    throw new Error('First child element in a `<cable-ready>` tag must be `<script type="application/json">`.');
  }
}

class SubscribingElement extends HTMLElement {
  disconnectedCallback() {
    if (this.channel) this.channel.unsubscribe();
  }
  createSubscription(consumer, channel, receivedCallback) {
    this.channel = consumer.subscriptions.create({
      channel: channel,
      identifier: this.identifier
    }, {
      received: receivedCallback
    });
  }
  get preview() {
    return document.documentElement.hasAttribute("data-turbolinks-preview") || document.documentElement.hasAttribute("data-turbo-preview");
  }
  get identifier() {
    return this.getAttribute("identifier");
  }
}

class StreamFromElement extends SubscribingElement {
  static define() {
    if (!customElements.get("stream-from")) {
      customElements.define("stream-from", this);
    }
  }
  async connectedCallback() {
    if (this.preview) return;
    const consumer = await CableConsumer.getConsumer();
    if (consumer) {
      this.createSubscription(consumer, "CableReady::Stream", this.performOperations);
    } else {
      console.error("The `stream_from` helper cannot connect without an ActionCable consumer.\nPlease run `rails generate cable_ready:helpers` to fix this.");
    }
  }
  performOperations(data) {
    if (data.cableReady) perform(data.operations);
  }
}

const template = `\n<style>\n  :host {\n    display: block;\n  }\n</style>\n<slot></slot>\n`;

class UpdatesForElement extends SubscribingElement {
  static define() {
    if (!customElements.get("updates-for")) {
      customElements.define("updates-for", this);
    }
  }
  constructor() {
    super();
    const shadowRoot = this.attachShadow({
      mode: "open"
    });
    shadowRoot.innerHTML = template;
  }
  async connectedCallback() {
    if (this.preview) return;
    this.update = debounce(this.update.bind(this), this.debounce);
    const consumer = await CableConsumer.getConsumer();
    if (consumer) {
      this.createSubscription(consumer, "CableReady::Stream", this.update);
    } else {
      console.error("The `updates-for` helper cannot connect without an ActionCable consumer.\nPlease run `rails generate cable_ready:helpers` to fix this.");
    }
  }
  async update(data) {
    const blocks = Array.from(document.querySelectorAll(this.query), (element => new Block(element)));
    if (blocks[0].element !== this) return;
    ActiveElement.set(document.activeElement);
    this.html = {};
    const uniqueUrls = [ ...new Set(blocks.map((block => block.url))) ];
    await Promise.all(uniqueUrls.map((async url => {
      if (!this.html.hasOwnProperty(url)) {
        const response = await graciouslyFetch(url, {
          "X-Cable-Ready": "update"
        });
        this.html[url] = await response.text();
      }
    })));
    this.index = {};
    blocks.forEach((block => {
      this.index.hasOwnProperty(block.url) ? this.index[block.url]++ : this.index[block.url] = 0;
      block.process(data, this.html, this.index);
    }));
  }
  get query() {
    return `updates-for[identifier="${this.identifier}"]`;
  }
  get identifier() {
    return this.getAttribute("identifier");
  }
  get debounce() {
    return this.hasAttribute("debounce") ? parseInt(this.getAttribute("debounce")) : 20;
  }
}

class Block {
  constructor(element) {
    this.element = element;
  }
  async process(data, html, index) {
    if (!this.shouldUpdate(data)) return;
    const blockIndex = index[this.url];
    const template = document.createElement("template");
    this.element.setAttribute("updating", "updating");
    template.innerHTML = String(html[this.url]).trim();
    await this.resolveTurboFrames(template.content);
    const fragments = template.content.querySelectorAll(this.query);
    if (fragments.length <= blockIndex) {
      console.warn(`Update aborted due to insufficient number of elements. The offending url is ${this.url}.`);
      return;
    }
    const operation = {
      element: this.element,
      html: fragments[blockIndex],
      permanentAttributeName: "data-ignore-updates"
    };
    dispatch(this.element, "cable-ready:before-update", operation);
    morphdom(this.element, fragments[blockIndex], {
      childrenOnly: true,
      onBeforeElUpdated: shouldMorph(operation),
      onElUpdated: _ => {
        this.element.removeAttribute("updating");
        dispatch(this.element, "cable-ready:after-update", operation);
        assignFocus(operation.focusSelector);
      }
    });
  }
  async resolveTurboFrames(documentFragment) {
    const reloadingTurboFrames = [ ...documentFragment.querySelectorAll('turbo-frame[src]:not([loading="lazy"])') ];
    return Promise.all(reloadingTurboFrames.map((frame => new Promise((async resolve => {
      const frameResponse = await graciouslyFetch(frame.getAttribute("src"), {
        "Turbo-Frame": frame.id,
        "X-Cable-Ready": "update"
      });
      const frameTemplate = document.createElement("template");
      frameTemplate.innerHTML = await frameResponse.text();
      await this.resolveTurboFrames(frameTemplate.content);
      documentFragment.querySelector(`turbo-frame#${frame.id}`).innerHTML = String(frameTemplate.content.querySelector(`turbo-frame#${frame.id}`).innerHTML).trim();
      resolve();
    })))));
  }
  shouldUpdate(data) {
    return !this.ignoresInnerUpdates && this.hasChangesSelectedForUpdate(data);
  }
  hasChangesSelectedForUpdate(data) {
    const only = this.element.getAttribute("only");
    return !(only && data.changed && !only.split(" ").some((attribute => data.changed.includes(attribute))));
  }
  get ignoresInnerUpdates() {
    return this.element.hasAttribute("ignore-inner-updates") && this.element.hasAttribute("performing-inner-update");
  }
  get url() {
    return this.element.hasAttribute("url") ? this.element.getAttribute("url") : location.href;
  }
  get identifier() {
    return this.element.identifier;
  }
  get query() {
    return this.element.query;
  }
}

const registerInnerUpdates = () => {
  document.addEventListener("stimulus-reflex:before", (event => {
    recursiveMarkUpdatesForElements(event.detail.element);
  }));
  document.addEventListener("stimulus-reflex:after", (event => {
    setTimeout((() => {
      recursiveUnmarkUpdatesForElements(event.detail.element);
    }));
  }));
  document.addEventListener("turbo:submit-start", (event => {
    recursiveMarkUpdatesForElements(event.target);
  }));
  document.addEventListener("turbo:submit-end", (event => {
    setTimeout((() => {
      recursiveUnmarkUpdatesForElements(event.target);
    }));
  }));
};

const recursiveMarkUpdatesForElements = leaf => {
  const closestUpdatesFor = leaf && leaf.parentElement && leaf.parentElement.closest("updates-for");
  if (closestUpdatesFor) {
    closestUpdatesFor.setAttribute("performing-inner-update", "");
    recursiveMarkUpdatesForElements(closestUpdatesFor);
  }
};

const recursiveUnmarkUpdatesForElements = leaf => {
  const closestUpdatesFor = leaf && leaf.parentElement && leaf.parentElement.closest("updates-for");
  if (closestUpdatesFor) {
    closestUpdatesFor.removeAttribute("performing-inner-update");
    recursiveUnmarkUpdatesForElements(closestUpdatesFor);
  }
};

const initialize = (initializeOptions = {}) => {
  const {consumer: consumer} = initializeOptions;
  registerInnerUpdates();
  if (consumer) {
    CableConsumer.setConsumer(consumer);
  } else {
    console.error("CableReady requires a reference to your Action Cable `consumer` for its helpers to function.\nEnsure that you have imported the `CableReady` package as well as `consumer` from your `channels` folder, then call `CableReady.initialize({ consumer })`.");
  }
  CableReadyElement.define();
  StreamFromElement.define();
  UpdatesForElement.define();
};

const global = {
  perform: perform,
  performAsync: performAsync,
  shouldMorphCallbacks: shouldMorphCallbacks,
  didMorphCallbacks: didMorphCallbacks,
  initialize: initialize,
  addOperation: addOperation,
  addOperations: addOperations,
  version: packageInfo.version,
  cable: CableConsumer,
  get DOMOperations() {
    console.warn("DEPRECATED: Please use `CableReady.operations` instead of `CableReady.DOMOperations`");
    return OperationStore.all;
  },
  get operations() {
    return OperationStore.all;
  },
  get consumer() {
    return CableConsumer.consumer;
  }
};

window.CableReady = global;

export { CableReadyElement, morph_callbacks as MorphCallbacks, StreamFromElement, SubscribingElement, UpdatesForElement, utils as Utils, global as default };
