const browser = require("webextension-polyfill/dist/browser-polyfill.min");

const { assign, entries } = Object;

const EMPTY_FN = () => {};

const PROPS_EXTRACTORS = {
  callback: {
    check: (props) => isFunction(props),
    value: (props) => props,
    def: EMPTY_FN,
  },
  other: {
    check: (props, index) => isOtherProps(props, index),
    value: (props, index) => props[0] || props,
    def: {},
  },
  submenu: {
    check: (props, index) => isSubmenu(props, index),
    value: (props) => props,
    def: false,
  },
  radio: {
    check: (props) => isRadio(props),
    value: (props) => ({ type: "radio", checked: !!props[0] }),
    def: {},
  },
  checkbox: {
    check: (props) => isBoolean(props),
    value: (props) => ({ type: "checkbox", checked: props }),
    def: {},
  },
};

let LISTENER = EMPTY_FN;

export default async function (menu) {
  await browser.contextMenus.removeAll();
  browser.contextMenus.onClicked.removeListener(LISTENER);

  const callbacks = createMenu(menu);

  LISTENER = (info, tab) => callbacks[info.menuItemId](info, tab);

  browser.contextMenus.onClicked.addListener(LISTENER);
}

function createMenu(menu, parentId) {
  const callbacks = {};

  let idCount = 0;
  for (let [title, options] of entries(menu)) {
    const id = `${parentId || ""}-${idCount++}`;
    const properties = assign(
      { id, contexts: ["all"] },
      parentId ? { parentId } : {},
    );
    if (options === null) {
      browser.contextMenus.create({ ...properties, type: "separator" });
      continue;
    }

    const { submenu, callback, radio, checkbox, other } =
      extractOptionProps(options);
    callbacks[id] = callback;
    [radio, checkbox, other].forEach((props) => assign(properties, props));

    browser.contextMenus.create({ title, ...properties });

    if (submenu) {
      assign(callbacks, createMenu(submenu, id));
    }
  }

  return callbacks;
}

function extractOptionProps(props) {
  const properties = {};

  entries(PROPS_EXTRACTORS).forEach(([type, { check, value, def }]) => properties[type] = check(props) ? value(props) : def);

  if (!isRadio(props) && !isOtherProps(props) && isArray(props)) {
    entries(PROPS_EXTRACTORS).forEach(
      ([type, { check, value }]) => {
        for (let index in props) {
          const prop = props[index];
          if (check(prop, +index)) {
            properties[type] = value(prop);
            return;
          }
        }
      });
  }

  return properties;
}

function isOtherProps(value, index) {
  return (isArray(value) && value.length === 1 && isObject(value[0])) || (isObject(value) && index > 0);
}

function isSubmenu (value, index) {
  return !index && isObject(value); 
}

function isRadio(value) {
  return isArray(value) && (value.length === 0 || value.length === 1 && isBoolean(value[0]));
}

function isBoolean(val) {
  return val === false || val === true;
}

function isObject(obj) {
  return getObjectType(obj) === "[object Object]";
}

function isArray(obj) {
  return getObjectType(obj) === "[object Array]";
}

function isFunction(obj) {
  return getObjectType(obj) === "[object Function]";
}

function getObjectType(obj) {
  return Object.prototype.toString.call(obj);
}
