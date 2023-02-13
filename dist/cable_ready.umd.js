(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("morphdom")) : typeof define === "function" && define.amd ? define([ "exports", "morphdom" ], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
  factory(global.CableReady = {}, global.morphdom));
})(this, (function(exports, morphdom) {
  "use strict";
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
    watch: "yarn rollup -wc",
    test: "web-test-runner javascript/test/**/*.test.js",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  };
  var dependencies = {
    morphdom: "2.6.1"
  };
  var devDependencies = {
    "@open-wc/testing": "^3.1.7",
    "@rollup/plugin-commonjs": "^24.0.1",
    "@rollup/plugin-json": "^6.0.0",
    "@rollup/plugin-node-resolve": "^15.0.1",
    "@web/dev-server-esbuild": "^0.3.3",
    "@web/dev-server-rollup": "^0.3.21",
    "@web/test-runner": "^0.15.0",
    "prettier-standard": "^16.4.1",
    rollup: "^3.15.0",
    "rollup-plugin-terser": "^7.0.2",
    sinon: "^15.0.1",
    vitepress: "^1.0.0-alpha.45"
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
    const event = new CustomEvent(name, init);
    element.dispatchEvent(event);
    if (window.jQuery) window.jQuery(element).trigger(name, detail);
  };
  const xpathToElement = xpath => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  const xpathToElementArray = (xpath, reverse = false) => {
    const snapshotList = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const snapshots = [];
    for (let i = 0; i < snapshotList.snapshotLength; i++) {
      snapshots.push(snapshotList.snapshotItem(i));
    }
    return reverse ? snapshots.reverse() : snapshots;
  };
  const getClassNames = names => Array.from(names).flat();
  const processElements = (operation, callback) => {
    Array.from(operation.selectAll ? operation.element : [ operation.element ]).forEach(callback);
  };
  const kebabize = createCompounder((function(result, word, index) {
    return result + (index ? "-" : "") + word.toLowerCase();
  }));
  function createCompounder(callback) {
    return function(str) {
      return words(str).reduce(callback, "");
    };
  }
  const words = str => {
    str = str == null ? "" : str;
    return str.match(/([A-Z]{2,}|[0-9]+|[A-Z]?[a-z]+|[A-Z])/g) || [];
  };
  const operate = (operation, callback) => {
    if (!operation.cancel) {
      operation.delay ? setTimeout(callback, operation.delay) : callback();
      return true;
    }
    return false;
  };
  const before = (target, operation) => dispatch(target, `cable-ready:before-${kebabize(operation.operation)}`, operation);
  const after = (target, operation) => dispatch(target, `cable-ready:after-${kebabize(operation.operation)}`, operation);
  function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
      const callback = () => fn.apply(this, args);
      if (timer) clearTimeout(timer);
      timer = setTimeout(callback, delay);
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
  function safeStringOrArray(elem) {
    if (elem !== undefined && !Array.isArray(elem) && typeof elem !== "string") console.warn(`Operation expects an Array or a String, but got ${elem} (${typeof elem})`);
    return elem == null ? "" : Array.isArray(elem) ? Array.from(elem) : String(elem);
  }
  function fragmentToString(fragment) {
    return (new XMLSerializer).serializeToString(fragment);
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
    after: after,
    assignFocus: assignFocus,
    before: before,
    debounce: debounce,
    dispatch: dispatch,
    fragmentToString: fragmentToString,
    getClassNames: getClassNames,
    graciouslyFetch: graciouslyFetch,
    handleErrors: handleErrors,
    isTextInput: isTextInput,
    kebabize: kebabize,
    operate: operate,
    processElements: processElements,
    safeArray: safeArray,
    safeObject: safeObject,
    safeScalar: safeScalar,
    safeString: safeString,
    safeStringOrArray: safeStringOrArray,
    xpathToElement: xpathToElement,
    xpathToElementArray: xpathToElementArray
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
    didMorph: didMorph,
    didMorphCallbacks: didMorphCallbacks,
    shouldMorph: shouldMorph,
    shouldMorphCallbacks: shouldMorphCallbacks,
    verifyNotContentEditable: verifyNotContentEditable,
    verifyNotMutable: verifyNotMutable,
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
    outerHtml: operation => {
      processElements(operation, (element => {
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before(element, operation);
        operate(operation, (() => {
          const {html: html, focusSelector: focusSelector} = operation;
          element.outerHTML = safeScalar(html);
          assignFocus(focusSelector);
        }));
        after(parent ? parent.children[idx] : document.documentElement, operation);
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
        const idx = parent && Array.from(parent.children).indexOf(element);
        before(element, operation);
        operate(operation, (() => {
          const {html: html, focusSelector: focusSelector} = operation;
          element.outerHTML = safeScalar(html);
          assignFocus(focusSelector);
        }));
        after(parent ? parent.children[idx] : document.documentElement, operation);
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
          element.classList.add(...getClassNames([ safeStringOrArray(name) ]));
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
          element.classList.remove(...getClassNames([ safeStringOrArray(name) ]));
          if (element.classList.length === 0) element.removeAttribute("class");
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
    setTitle: operation => {
      before(document, operation);
      operate(operation, (() => {
        const {title: title} = operation;
        document.title = safeScalar(title);
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
    },
    morph: operation => {
      processElements(operation, (element => {
        const {html: html} = operation;
        const template = document.createElement("template");
        template.innerHTML = String(safeScalar(html)).trim();
        operation.content = template.content;
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
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
        after(parent ? parent.children[idx] : document.documentElement, operation);
      }));
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
  let missingElement = "warn";
  var MissingElement$1 = {
    get behavior() {
      return missingElement;
    },
    set(value) {
      if ([ "warn", "ignore", "event", "exception" ].includes(value)) missingElement = value; else console.warn("Invalid 'onMissingElement' option. Defaulting to 'warn'.");
    }
  };
  const perform = (operations, options = {
    onMissingElement: MissingElement$1.behavior
  }) => {
    const batches = {};
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
        if (operation.element || options.onMissingElement !== "ignore") {
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
          const warning = `CableReady ${name || ""} operation failed due to missing DOM element for selector: '${operation.selector}'`;
          switch (options.onMissingElement) {
           case "ignore":
            break;

           case "event":
            dispatch(document, "cable-ready:missing-element", {
              warning: warning,
              operation: operation
            });
            break;

           case "exception":
            throw warning;

           default:
            console.warn(warning);
          }
        }
      }
    }));
  };
  const performAsync = (operations, options = {
    onMissingElement: MissingElement$1.behavior
  }) => new Promise(((resolve, reject) => {
    try {
      resolve(perform(operations, options));
    } catch (err) {
      reject(err);
    }
  }));
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
        this.createSubscription(consumer, "CableReady::Stream", this.performOperations.bind(this));
      } else {
        console.error("The `stream_from` helper cannot connect. You must initialize CableReady with an Action Cable consumer.");
      }
    }
    performOperations(data) {
      if (data.cableReady) perform(data.operations, {
        onMissingElement: this.onMissingElement
      });
    }
    get onMissingElement() {
      const value = this.getAttribute("missing") || MissingElement$1.behavior;
      if ([ "warn", "ignore", "event" ].includes(value)) return value; else {
        console.warn("Invalid 'missing' attribute. Defaulting to 'warn'.");
        return "warn";
      }
    }
  }
  let debugging = false;
  var Debug = {
    get enabled() {
      return debugging;
    },
    get disabled() {
      return !debugging;
    },
    get value() {
      return debugging;
    },
    set(value) {
      debugging = !!value;
    },
    set debug(value) {
      debugging = !!value;
    }
  };
  const request = (data, blocks) => {
    if (Debug.disabled) return;
    console.log(`↑ Updatable request affecting ${blocks.length} element(s): `, {
      elements: blocks.map((b => b.element)),
      identifiers: blocks.map((b => b.element.getAttribute("identifier"))),
      data: data
    });
  };
  const cancel = (timestamp, reason) => {
    if (Debug.disabled) return;
    const duration = new Date - timestamp;
    console.log(`❌ Updatable request canceled after ${duration}ms: ${reason}`);
  };
  const response = (timestamp, element, urls) => {
    if (Debug.disabled) return;
    const duration = new Date - timestamp;
    console.log(`↓ Updatable response: All URLs fetched in ${duration}ms`, {
      element: element,
      urls: urls
    });
  };
  const morphStart = (timestamp, element) => {
    if (Debug.disabled) return;
    const duration = new Date - timestamp;
    console.log(`↻ Updatable morph: starting after ${duration}ms`, {
      element: element
    });
  };
  const morphEnd = (timestamp, element) => {
    if (Debug.disabled) return;
    const duration = new Date - timestamp;
    console.log(`↺ Updatable morph: completed after ${duration}ms`, {
      element: element
    });
  };
  var Log = {
    request: request,
    cancel: cancel,
    response: response,
    morphStart: morphStart,
    morphEnd: morphEnd
  };
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
        console.error("The `updates-for` helper cannot connect. You must initialize CableReady with an Action Cable consumer.");
      }
    }
    async update(data) {
      this.lastUpdateTimestamp = new Date;
      const blocks = Array.from(document.querySelectorAll(this.query), (element => new Block(element))).filter((block => block.shouldUpdate(data)));
      Log.request(data, blocks);
      if (blocks.length === 0) {
        Log.cancel(this.lastUpdateTimestamp, "All elements filtered out");
        return;
      }
      if (blocks[0].element !== this) {
        Log.cancel(this.lastUpdateTimestamp, "Update already requested");
        return;
      }
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
      Log.response(this.lastUpdateTimestamp, this, uniqueUrls);
      this.index = {};
      blocks.forEach((block => {
        this.index.hasOwnProperty(block.url) ? this.index[block.url]++ : this.index[block.url] = 0;
        block.process(data, this.html, this.index, this.lastUpdateTimestamp);
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
    async process(data, html, index, startTimestamp) {
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
      Log.morphStart(startTimestamp, this.element);
      morphdom(this.element, fragments[blockIndex], {
        childrenOnly: true,
        onBeforeElUpdated: shouldMorph(operation),
        onElUpdated: _ => {
          this.element.removeAttribute("updating");
          dispatch(this.element, "cable-ready:after-update", operation);
          assignFocus(operation.focusSelector);
        }
      });
      Log.morphEnd(startTimestamp, this.element);
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
        const selector = `turbo-frame#${frame.id}`;
        const frameContent = frameTemplate.content.querySelector(selector);
        const content = frameContent ? frameContent.innerHTML.trim() : "";
        docFragment.querySelector(selector).innerHTML = content;
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
    document.addEventListener("turbo-boost:command:start", (event => {
      recursiveMarkUpdatesForElements(event.target);
    }));
    document.addEventListener("turbo-boost:command:finish", (event => {
      setTimeout((() => {
        recursiveUnmarkUpdatesForElements(event.target);
      }));
    }));
    document.addEventListener("turbo-boost:command:error", (event => {
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
  const defineElements = () => {
    registerInnerUpdates();
    StreamFromElement.define();
    UpdatesForElement.define();
  };
  const initialize = (initializeOptions = {}) => {
    const {consumer: consumer, onMissingElement: onMissingElement, debug: debug} = initializeOptions;
    Debug.set(!!debug);
    if (consumer) {
      CableConsumer.setConsumer(consumer);
    } else {
      console.error("CableReady requires a reference to your Action Cable `consumer` for its helpers to function.\nEnsure that you have imported the `CableReady` package as well as `consumer` from your `channels` folder, then call `CableReady.initialize({ consumer })`.");
    }
    if (onMissingElement) {
      MissingElement.set(onMissingElement);
    }
    defineElements();
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
  exports.MorphCallbacks = morph_callbacks;
  exports.StreamFromElement = StreamFromElement;
  exports.SubscribingElement = SubscribingElement;
  exports.UpdatesForElement = UpdatesForElement;
  exports.Utils = utils;
  exports.default = global;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
}));
