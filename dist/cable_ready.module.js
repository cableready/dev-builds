import morphdom from 'morphdom';

var version = "5.0.0-pre8";

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
  'datetime-local': true,
  'select-multiple': true,
  'select-one': true,
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
  get element () {
    return activeElement
  },
  set (element) {
    activeElement = element;
  }
};

// Indicates if the passed element is considered a text input.
//
const isTextInput = element => {
  return inputTags[element.tagName] && textInputTypes[element.type]
};

// Assigns focus to the appropriate element... preferring the explicitly passed selector
//
// * selector - a CSS selector for the element that should have focus
//
const assignFocus = selector => {
  const element =
    selector && selector.nodeType === Node.ELEMENT_NODE
      ? selector
      : document.querySelector(selector);
  const focusElement = element || ActiveElement.element;
  if (focusElement && focusElement.focus) focusElement.focus();
};

// Dispatches an event on the passed element
//
// * element - the element
// * name - the name of the event
// * detail - the event detail
//
const dispatch = (element, name, detail = {}) => {
  const init = { bubbles: true, cancelable: true, detail: detail };
  const evt = new CustomEvent(name, init);
  element.dispatchEvent(evt);
  if (window.jQuery) window.jQuery(element).trigger(name, detail);
};

// Accepts an xPath query and returns the element found at that position in the DOM
//
const xpathToElement = xpath => {
  return document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
};

// Return an array with the class names to be used
//
// * names - could be a string or an array of strings for multiple classes.
//
const getClassNames = names => Array(names).flat();

// Perform operation for either the first or all of the elements returned by CSS selector
//
// * operation - the instruction payload from perform
// * callback - the operation function to run for each element
//
const processElements = (operation, callback) => {
  Array.from(
    operation.selectAll ? operation.element : [operation.element]
  ).forEach(callback);
};

// camelCase to kebab-case
//
const kebabize = str => {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
        : letter
    })
    .join('')
};

// Provide a standardized pipeline of checks and modifications to all operations based on provided options
// Currently skips execution if cancelled and implements an optional delay
//
const operate = (operation, callback) => {
  if (!operation.cancel) {
    operation.delay ? setTimeout(callback, operation.delay) : callback();
    return true
  }
  return false
};

// Dispatch life-cycle events with standardized naming
const before = (target, operation) =>
  dispatch(
    target,
    `cable-ready:before-${kebabize(operation.operation)}`,
    operation
  );

const after = (target, operation) =>
  dispatch(
    target,
    `cable-ready:after-${kebabize(operation.operation)}`,
    operation
  );

function debounce (func, timeout) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  }
}

function handleErrors (response) {
  if (!response.ok) throw Error(response.statusText)
  return response
}

// A proxy method to wrap a fetch call in error handling
//
// * url - the URL to fetch
// * additionalHeaders - an object of additional headers passed to fetch
//
async function graciouslyFetch (url, additionalHeaders) {
  try {
    const response = await fetch(url, {
      headers: {
        'X-REQUESTED-WITH': 'XmlHttpRequest',
        ...additionalHeaders
      }
    });
    if (response == undefined) return

    handleErrors(response);

    return response
  } catch (e) {
    console.error(`Could not fetch ${url}`);
  }
}

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  isTextInput: isTextInput,
  assignFocus: assignFocus,
  dispatch: dispatch,
  xpathToElement: xpathToElement,
  getClassNames: getClassNames,
  processElements: processElements,
  operate: operate,
  before: before,
  after: after,
  debounce: debounce,
  handleErrors: handleErrors,
  graciouslyFetch: graciouslyFetch
});

// Indicates whether or not we should morph an element via onBeforeElUpdated callback
// SEE: https://github.com/patrick-steele-idem/morphdom#morphdomfromnode-tonode-options--node
//
const shouldMorph = operation => (fromEl, toEl) => {
  return !shouldMorphCallbacks
    .map(callback => {
      return typeof callback === 'function'
        ? callback(operation, fromEl, toEl)
        : true
    })
    .includes(false)
};

// Execute any pluggable functions that modify elements after morphing via onElUpdated callback
//
const didMorph = operation => el => {
  didMorphCallbacks.forEach(callback => {
    if (typeof callback === 'function') callback(operation, el);
  });
};

const verifyNotMutable = (detail, fromEl, toEl) => {
  // Skip nodes that are equal:
  // https://github.com/patrick-steele-idem/morphdom#can-i-make-morphdom-blaze-through-the-dom-tree-even-faster-yes
  if (!mutableTags[fromEl.tagName] && fromEl.isEqualNode(toEl)) return false
  return true
};

const verifyNotContentEditable = (detail, fromEl, toEl) => {
  if (fromEl === ActiveElement.element && fromEl.isContentEditable) return false
  return true
};

const verifyNotPermanent = (detail, fromEl, toEl) => {
  const { permanentAttributeName } = detail;
  if (!permanentAttributeName) return true

  const permanent = fromEl.closest(`[${permanentAttributeName}]`);

  // only morph attributes on the active non-permanent text input
  if (!permanent && fromEl === ActiveElement.element && isTextInput(fromEl)) {
    const ignore = { value: true };
    Array.from(toEl.attributes).forEach(attribute => {
      if (!ignore[attribute.name])
        fromEl.setAttribute(attribute.name, attribute.value);
    });
    return false
  }

  return !permanent
};

const shouldMorphCallbacks = [
  verifyNotMutable,
  verifyNotPermanent,
  verifyNotContentEditable
];
const didMorphCallbacks = [];

var morph_callbacks = /*#__PURE__*/Object.freeze({
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
  // DOM Mutations

  append: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { html, focusSelector } = operation;
        element.insertAdjacentHTML('beforeend', html || '');
        assignFocus(focusSelector);
      });
      after(element, operation);
    });
  },

  graft: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { parent, focusSelector } = operation;
        const parentElement = document.querySelector(parent);
        if (parentElement) {
          parentElement.appendChild(element);
          assignFocus(focusSelector);
        }
      });
      after(element, operation);
    });
  },

  innerHtml: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { html, focusSelector } = operation;
        element.innerHTML = html || '';
        assignFocus(focusSelector);
      });
      after(element, operation);
    });
  },

  insertAdjacentHtml: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { html, position, focusSelector } = operation;
        element.insertAdjacentHTML(position || 'beforeend', html || '');
        assignFocus(focusSelector);
      });
      after(element, operation);
    });
  },

  insertAdjacentText: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { text, position, focusSelector } = operation;
        element.insertAdjacentText(position || 'beforeend', text || '');
        assignFocus(focusSelector);
      });
      after(element, operation);
    });
  },

  morph: operation => {
    processElements(operation, element => {
      const { html } = operation;
      const template = document.createElement('template');
      template.innerHTML = String(html).trim();
      operation.content = template.content;
      const parent = element.parentElement;
      const ordinal = Array.from(parent.children).indexOf(element);
      before(element, operation);
      operate(operation, () => {
        const { childrenOnly, focusSelector } = operation;
        morphdom(
          element,
          childrenOnly ? template.content : template.innerHTML,
          {
            childrenOnly: !!childrenOnly,
            onBeforeElUpdated: shouldMorph(operation),
            onElUpdated: didMorph(operation)
          }
        );
        assignFocus(focusSelector);
      });
      after(parent.children[ordinal], operation);
    });
  },

  outerHtml: operation => {
    processElements(operation, element => {
      const parent = element.parentElement;
      const ordinal = Array.from(parent.children).indexOf(element);
      before(element, operation);
      operate(operation, () => {
        const { html, focusSelector } = operation;
        element.outerHTML = html || '';
        assignFocus(focusSelector);
      });
      after(parent.children[ordinal], operation);
    });
  },

  prepend: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { html, focusSelector } = operation;
        element.insertAdjacentHTML('afterbegin', html || '');
        assignFocus(focusSelector);
      });
      after(element, operation);
    });
  },

  remove: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { focusSelector } = operation;
        element.remove();
        assignFocus(focusSelector);
      });
      after(document, operation);
    });
  },

  replace: operation => {
    processElements(operation, element => {
      const parent = element.parentElement;
      const ordinal = Array.from(parent.children).indexOf(element);
      before(element, operation);
      operate(operation, () => {
        const { html, focusSelector } = operation;
        element.outerHTML = html || '';
        assignFocus(focusSelector);
      });
      after(parent.children[ordinal], operation);
    });
  },

  textContent: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { text, focusSelector } = operation;
        element.textContent = text || '';
        assignFocus(focusSelector);
      });
      after(element, operation);
    });
  },

  // Element Property Mutations

  addCssClass: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { name } = operation;
        element.classList.add(...getClassNames(name || ''));
      });
      after(element, operation);
    });
  },

  removeAttribute: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { name } = operation;
        element.removeAttribute(name);
      });
      after(element, operation);
    });
  },

  removeCssClass: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { name } = operation;
        element.classList.remove(...getClassNames(name));
      });
      after(element, operation);
    });
  },

  setAttribute: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { name, value } = operation;
        element.setAttribute(name, value || '');
      });
      after(element, operation);
    });
  },

  setDatasetProperty: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { name, value } = operation;
        element.dataset[name] = value || '';
      });
      after(element, operation);
    });
  },

  setProperty: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { name, value } = operation;
        if (name in element) element[name] = value || '';
      });
      after(element, operation);
    });
  },

  setStyle: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { name, value } = operation;
        element.style[name] = value || '';
      });
      after(element, operation);
    });
  },

  setStyles: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { styles } = operation;
        for (let [name, value] of Object.entries(styles))
          element.style[name] = value || '';
      });
      after(element, operation);
    });
  },

  setValue: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { value } = operation;
        element.value = value || '';
      });
      after(element, operation);
    });
  },

  // DOM Events

  dispatchEvent: operation => {
    processElements(operation, element => {
      before(element, operation);
      operate(operation, () => {
        const { name, detail } = operation;
        dispatch(element, name, detail);
      });
      after(element, operation);
    });
  },

  setMeta: operation => {
    before(document, operation);
    operate(operation, () => {
      const { name, content } = operation;
      let meta = document.head.querySelector(`meta[name='${name}']`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
    after(document, operation);
  },

  // Browser Manipulations

  clearStorage: operation => {
    before(document, operation);
    operate(operation, () => {
      const { type } = operation;
      const storage = type === 'session' ? sessionStorage : localStorage;
      storage.clear();
    });
    after(document, operation);
  },

  go: operation => {
    before(window, operation);
    operate(operation, () => {
      const { delta } = operation;
      history.go(delta);
    });
    after(window, operation);
  },

  pushState: operation => {
    before(window, operation);
    operate(operation, () => {
      const { state, title, url } = operation;
      history.pushState(state || {}, title || '', url);
    });
    after(window, operation);
  },

  redirectTo: operation => {
    before(window, operation);
    operate(operation, () => {
      let { url, action } = operation;
      action = action || 'advance';
      if (window.Turbo) window.Turbo.visit(url, { action });
      if (window.Turbolinks) window.Turbolinks.visit(url, { action });
      if (!window.Turbo && !window.Turbolinks) window.location.href = url;
    });
    after(window, operation);
  },

  reload: operation => {
    before(window, operation);
    operate(operation, () => {
      window.location.reload();
    });
    after(window, operation);
  },

  removeStorageItem: operation => {
    before(document, operation);
    operate(operation, () => {
      const { key, type } = operation;
      const storage = type === 'session' ? sessionStorage : localStorage;
      storage.removeItem(key);
    });
    after(document, operation);
  },

  replaceState: operation => {
    before(window, operation);
    operate(operation, () => {
      const { state, title, url } = operation;
      history.replaceState(state || {}, title || '', url);
    });
    after(window, operation);
  },

  scrollIntoView: operation => {
    const { element } = operation;
    before(element, operation);
    operate(operation, () => {
      element.scrollIntoView(operation);
    });
    after(element, operation);
  },

  setCookie: operation => {
    before(document, operation);
    operate(operation, () => {
      const { cookie } = operation;
      document.cookie = cookie || '';
    });
    after(document, operation);
  },

  setFocus: operation => {
    const { element } = operation;
    before(element, operation);
    operate(operation, () => {
      assignFocus(element);
    });
    after(element, operation);
  },

  setStorageItem: operation => {
    before(document, operation);
    operate(operation, () => {
      const { key, value, type } = operation;
      const storage = type === 'session' ? sessionStorage : localStorage;
      storage.setItem(key, value || '');
    });
    after(document, operation);
  },

  // Notifications

  consoleLog: operation => {
    before(document, operation);
    operate(operation, () => {
      const { message, level } = operation;
      level && ['warn', 'info', 'error'].includes(level)
        ? console[level](message || '')
        : console.log(message || '');
    });
    after(document, operation);
  },

  consoleTable: operation => {
    before(document, operation);
    operate(operation, () => {
      const { data, columns } = operation;
      console.table(data, columns || []);
    });
    after(document, operation);
  },

  notification: operation => {
    before(document, operation);
    operate(operation, () => {
      const { title, options } = operation;
      Notification.requestPermission().then(result => {
        operation.permission = result;
        if (result === 'granted') new Notification(title || '', options);
      });
    });
    after(document, operation);
  }
};

let operations = Operations;

const add = newOperations => {
  operations = { ...operations, ...newOperations };
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
  get all () {
    return operations
  }
};

const perform = (
  operations,
  options = { emitMissingElementWarnings: true }
) => {
  const batches = {};
  operations.forEach(operation => {
    if (!!operation.batch)
      batches[operation.batch] = batches[operation.batch]
        ? ++batches[operation.batch]
        : 1;
  });
  operations.forEach(operation => {
    const name = operation.operation;
    try {
      if (operation.selector) {
        operation.element = operation.xpath
          ? xpathToElement(operation.selector)
          : document[
              operation.selectAll ? 'querySelectorAll' : 'querySelector'
            ](operation.selector);
      } else {
        operation.element = document;
      }
      if (operation.element || options.emitMissingElementWarnings) {
        ActiveElement.set(document.activeElement);
        const cableReadyOperation = OperationStore.all[name];

        if (cableReadyOperation) {
          cableReadyOperation(operation);
          if (!!operation.batch && --batches[operation.batch] === 0)
            dispatch(document, 'cable-ready:batch-complete', {
              batch: operation.batch
            });
        } else {
          console.error(
            `CableReady couldn't find the "${name}" operation. Make sure you use the camelized form when calling an operation method.`
          );
        }
      }
    } catch (e) {
      if (operation.element) {
        console.error(
          `CableReady detected an error in ${name || 'operation'}: ${
            e.message
          }. If you need to support older browsers make sure you've included the corresponding polyfills. https://docs.stimulusreflex.com/setup#polyfills-for-ie11.`
        );
        console.error(e);
      } else {
        console.warn(
          `CableReady ${name ||
            'operation'} failed due to missing DOM element for selector: '${
            operation.selector
          }'`
        );
      }
    }
  });
};

const performAsync = (
  operations,
  options = { emitMissingElementWarnings: true }
) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(perform(operations, options));
    } catch (err) {
      reject(err);
    }
  })
};

let consumer;

const BACKOFF = [25, 50, 75, 100, 200, 250, 500, 800, 1000, 2000];

const retryGetConsumer = (retry) => {
  if (consumer) return consumer

  if (retry >= BACKOFF.length) {
    throw new Error("Couldn't obtain a Action Cable consumer within 5s")
  }

  setTimeout(() => {
    return retryGetConsumer(retry + 1)
  }, BACKOFF[retry]);
};

var CableConsumer = {
  setConsumer (value) {
    consumer = value;
  },

  getConsumer () {
    return retryGetConsumer(0)
  }
};

class SubscribingElement extends HTMLElement {
  disconnectedCallback () {
    if (this.channel) this.channel.unsubscribe();
  }

  createSubscription (consumer, channel, receivedCallback) {
    this.channel = consumer.subscriptions.create(
      {
        channel,
        identifier: this.identifier
      },
      {
        received: receivedCallback
      }
    );
  }

  get preview () {
    return (
      document.documentElement.hasAttribute('data-turbolinks-preview') ||
      document.documentElement.hasAttribute('data-turbo-preview')
    )
  }

  get identifier () {
    return this.getAttribute('identifier')
  }
}

class StreamFromElement extends SubscribingElement {
  async connectedCallback () {
    if (this.preview) return

    const consumer = CableConsumer.getConsumer();

    if (consumer) {
      this.createSubscription(
        consumer,
        'CableReady::Stream',
        this.performOperations
      );
    } else {
      console.error(
        'The `stream_from` helper cannot connect without an ActionCable consumer.\nPlease run `rails generate cable_ready:helpers` to fix this.'
      );
    }
  }

  performOperations (data) {
    if (data.cableReady) perform(data.operations);
  }
}

const template = `
<style>
  :host {
    display: block;
  }
</style>
<slot></slot>
`;

function url (element) {
  return element.hasAttribute('url')
    ? element.getAttribute('url')
    : location.href
}

class UpdatesForElement extends SubscribingElement {
  constructor () {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = template;
  }

  async connectedCallback () {
    if (this.preview) return
    this.update = debounce(this.update.bind(this), this.debounce);

    const consumer = CableConsumer.getConsumer();

    if (consumer) {
      this.createSubscription(consumer, 'CableReady::Stream', this.update);
    } else {
      console.error(
        'The `updates-for` helper cannot connect without an ActionCable consumer.\nPlease run `rails generate cable_ready:helpers` to fix this.'
      );
    }
  }

  shouldUpdate (data) {
    return (
      !this.ignoringInnerUpdates &&
      this.hasChangesSelectedForUpdate(data) &&
      this.blocks[0] === this
    )
  }

  update (data) {
    ActiveElement.set(document.activeElement);

    if (!this.shouldUpdate(data)) {
      return
    }

    this.html = {};

    this.blocks.forEach(this.processBlock.bind(this));
  }

  async processBlock (block, index) {
    const template = document.createElement('template');
    block.setAttribute('updating', 'updating');

    if (!this.html.hasOwnProperty(url(block))) {
      const response = await graciouslyFetch(url(block), {
        'X-Cable-Ready': 'update'
      });
      this.html[url(block)] = await response.text();
    }

    template.innerHTML = String(this.html[url(block)]).trim();

    await this.resolveTurboFrames(template.content);

    const fragments = template.content.querySelectorAll(this.query);

    if (fragments.length <= index) {
      console.warn('Update aborted due to mismatched number of elements');
      return
    }

    const operation = {
      element: block,
      html: fragments[index],
      permanentAttributeName: 'data-ignore-updates'
    };

    dispatch(block, 'cable-ready:before-update', operation);
    morphdom(block, fragments[index], {
      childrenOnly: true,
      onBeforeElUpdated: shouldMorph(operation),
      onElUpdated: _ => {
        block.removeAttribute('updating');
        dispatch(block, 'cable-ready:after-update', operation);
        assignFocus(operation.focusSelector);
      }
    });
  }

  async resolveTurboFrames (documentFragment) {
    const reloadingTurboFrames = [
      ...documentFragment.querySelectorAll(
        'turbo-frame[src]:not([loading="lazy"])'
      )
    ];

    return Promise.all(
      reloadingTurboFrames.map(frame => {
        return new Promise(async resolve => {
          const frameResponse = await graciouslyFetch(
            frame.getAttribute('src'),
            {
              'Turbo-Frame': frame.id,
              'X-Cable-Ready': 'update'
            }
          );

          const frameTemplate = document.createElement('template');
          frameTemplate.innerHTML = await frameResponse.text();

          // recurse here to get all nested eager loaded frames
          await this.resolveTurboFrames(frameTemplate.content);

          documentFragment.querySelector(
            `turbo-frame#${frame.id}`
          ).innerHTML = String(
            frameTemplate.content.querySelector(`turbo-frame#${frame.id}`)
              .innerHTML
          ).trim();

          resolve();
        })
      })
    )
  }

  hasChangesSelectedForUpdate (data) {
    const only = this.getAttribute('only');

    return !(
      only &&
      data.changed &&
      !only.split(' ').some(attribute => data.changed.includes(attribute))
    )
  }

  get query () {
    return `updates-for[identifier="${this.identifier}"]`
  }

  get blocks () {
    return document.querySelectorAll(this.query)
  }

  get debounce () {
    return this.hasAttribute('debounce')
      ? parseInt(this.getAttribute('debounce'))
      : 20
  }

  get ignoringInnerUpdates () {
    return (
      this.hasAttribute('ignore-inner-updates') &&
      this.hasAttribute('performing-inner-update')
    )
  }
}

const registerInnerUpdates = () => {
  document.addEventListener('stimulus-reflex:before', event => {
    recursiveMarkUpdatesForElements(event.detail.element);
  });

  document.addEventListener('stimulus-reflex:after', event => {
    setTimeout(() => {
      recursiveUnmarkUpdatesForElements(event.detail.element);
    });
  });

  document.addEventListener('turbo:submit-start', event => {
    recursiveMarkUpdatesForElements(event.target);
  });

  document.addEventListener('turbo:submit-end', event => {
    setTimeout(() => {
      recursiveUnmarkUpdatesForElements(event.target);
    });
  });
};

const recursiveMarkUpdatesForElements = leaf => {
  const closestUpdatesFor = leaf.parentElement.closest('updates-for');
  if (closestUpdatesFor) {
    closestUpdatesFor.setAttribute('performing-inner-update', '');
    recursiveMarkUpdatesForElements(closestUpdatesFor);
  }
};

const recursiveUnmarkUpdatesForElements = leaf => {
  const closestUpdatesFor = leaf.parentElement.closest('updates-for');
  if (closestUpdatesFor) {
    closestUpdatesFor.removeAttribute('performing-inner-update');
    recursiveUnmarkUpdatesForElements(closestUpdatesFor);
  }
};

const initialize = (initializeOptions = {}) => {
  const { consumer } = initializeOptions;

  registerInnerUpdates();

  if (consumer) {
    CableConsumer.setConsumer(consumer);
  } else {
    console.error(
      'CableReady requires a reference to your Action Cable `consumer` for its helpers to function.\nEnsure that you have imported the `CableReady` package as well as `consumer` from your `channels` folder, then call `CableReady.initialize({ consumer })`.'
    );
  }

  if (!customElements.get('stream-from')) {
    customElements.define('stream-from', StreamFromElement);
  }

  if (!customElements.get('updates-for')) {
    customElements.define('updates-for', UpdatesForElement);
  }
};

var index = {
  perform,
  performAsync,
  shouldMorphCallbacks,
  didMorphCallbacks,
  initialize,
  addOperation,
  addOperations,
  version,
  get DOMOperations () {
    console.warn(
      'DEPRECATED: Please use `CableReady.operations` instead of `CableReady.DOMOperations`'
    );
    return OperationStore.all
  },
  get operations () {
    return OperationStore.all
  },
  get consumer () {
    return CableConsumer.getConsumer()
  }
};

export { morph_callbacks as MorphCallbacks, StreamFromElement, SubscribingElement, UpdatesForElement, utils as Utils, index as default };
//# sourceMappingURL=cable_ready.module.js.map
