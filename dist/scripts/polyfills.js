(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  Function('return this')();

	var isPure = false;

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var document$1 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) { return input; }
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) { return val; }
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) { return val; }
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) { return val; }
	  throw TypeError("Can't convert object to primitive value");
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	var f = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) { try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ } }
	  if ('get' in Attributes || 'set' in Attributes) { throw TypeError('Accessors not supported'); }
	  if ('value' in Attributes) { O[P] = Attributes.value; }
	  return O;
	};

	var objectDefineProperty = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store;

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.6.4',
	  mode:  'global',
	  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	});
	});

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol
	  // eslint-disable-next-line no-undef
	  && !Symbol.sham
	  // eslint-disable-next-line no-undef
	  && typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) { WellKnownSymbolsStore[name] = Symbol$1[name]; }
	    else { WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name); }
	  } return WellKnownSymbolsStore[name];
	};

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var test = {};

	test[TO_STRING_TAG] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) { createNonEnumerableProperty(value, 'name', key); }
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }
	  if (O === global_1) {
	    if (simple) { O[key] = value; }
	    else { setGlobal(key, value); }
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) { O[key] = value; }
	  else { createNonEnumerableProperty(O, key, value); }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// `Object.prototype.toString` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// `Object.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
	}

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) { throw TypeError("Can't call method on " + it); }
	  return it;
	};

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) { return CONVERT_TO_STRING ? '' : undefined; }
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod(true)
	};

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
	var f$1 = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f$1
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	var f$2 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) { try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ } }
	  if (has(O, P)) { return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]); }
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$2
	};

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod$1 = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) { while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) { return true; }
	    // Array#indexOf ignores holes, Array#includes - not
	    } } else { for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) { return IS_INCLUDES || index || 0; }
	    } } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod$1(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod$1(false)
	};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) { !has(hiddenKeys, key) && has(O, key) && result.push(key); }
	  // Don't enum bug & hidden keys
	  while (names.length > i) { if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  } }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) { defineProperty(target, key, getOwnPropertyDescriptor(source, key)); }
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) { for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else { targetProperty = target[key]; }
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) { continue; }
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  } }
	};

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO)) { return O[IE_PROTO]; }
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype : null;
	};

	var ITERATOR = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () { return this; };

	// `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) { BUGGY_SAFARI_ITERATORS = true; }
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) { IteratorPrototype = PrototypeOfArrayIteratorPrototype; }
	  }
	}

	if (IteratorPrototype == undefined) { IteratorPrototype = {}; }

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	if ( !has(IteratorPrototype, ITERATOR)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties
	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) { objectDefineProperty.f(O, key = keys[index++], Properties[key]); }
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO$1 = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) { delete NullProtoObject[PROTOTYPE][enumBugKeys[length]]; }
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO$1] = true;

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else { result = NullProtoObject(); }
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var defineProperty = objectDefineProperty.f;



	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG$2)) {
	    defineProperty(it, TO_STRING_TAG$2, { configurable: true, value: TAG });
	  }
	};

	var iterators = {};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





	var returnThis$1 = function () { return this; };

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	// `Object.setPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) { setter.call(O, proto); }
	    else { O.__proto__ = proto; }
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$1 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () { return this; };

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) { return defaultIterator; }
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) { return IterablePrototype[KIND]; }
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$1]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }

	  // define iterator
	  if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
	  }
	  iterators[NAME] = defaultIterator;

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) { for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } } else { _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods); }
	  }

	  return methods;
	};

	var charAt = stringMultibyte.charAt;



	var STRING_ITERATOR = 'String Iterator';
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) { return { value: undefined, done: true }; }
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$1 = internalState.set;
	var getInternalState$1 = internalState.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator
	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState$1(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$1(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') { return { value: index, done: false }; }
	  if (kind == 'values') { return { value: target[index], done: false }; }
	  return { value: [index, target[index]], done: false };
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
	iterators.Arguments = iterators.Array;

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  if (CollectionPrototype) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype[ITERATOR$2] !== ArrayValues) { try {
	      createNonEnumerableProperty(CollectionPrototype, ITERATOR$2, ArrayValues);
	    } catch (error) {
	      CollectionPrototype[ITERATOR$2] = ArrayValues;
	    } }
	    if (!CollectionPrototype[TO_STRING_TAG$3]) {
	      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
	    }
	    if (domIterables[COLLECTION_NAME]) { for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) { try {
	        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      } }
	    } }
	  }
	}

	var nativePromiseConstructor = global_1.Promise;

	var redefineAll = function (target, src, options) {
	  for (var key in src) { redefine(target, key, src[key], options); }
	  return target;
	};

	var SPECIES = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES]) {
	    defineProperty(Constructor, SPECIES, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$3] === it);
	};

	// optional / simple context binding
	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) { return fn; }
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var ITERATOR$4 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) { return it[ITERATOR$4]
	    || it['@@iterator']
	    || iterators[classof(it)]; }
	};

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) { anObject(returnMethod.call(iterator)); }
	    throw error;
	  }
	};

	var iterate_1 = createCommonjsModule(function (module) {
	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	  var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
	  var iterator, iterFn, index, length, result, next, step;

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') { throw TypeError('Target is not iterable'); }
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength(iterable.length); length > index; index++) {
	        result = AS_ENTRIES
	          ? boundFunction(anObject(step = iterable[index])[0], step[1])
	          : boundFunction(iterable[index]);
	        if (result && result instanceof Result) { return result; }
	      } return new Result(false);
	    }
	    iterator = iterFn.call(iterable);
	  }

	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	    if (typeof result == 'object' && result && result instanceof Result) { return result; }
	  } return new Result(false);
	};

	iterate.stop = function (result) {
	  return new Result(true, result);
	};
	});

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$5] = function () {
	    return this;
	  };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) { return false; }
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$5] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	var SPECIES$1 = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$1]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

	var location = global_1.location;
	var set$1 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process = global_1.process;
	var MessageChannel = global_1.MessageChannel;
	var Dispatch = global_1.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;

	var run = function (id) {
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var listener = function (event) {
	  run(event.data);
	};

	var post = function (id) {
	  // old engines have not location.origin
	  global_1.postMessage(id + '', location.protocol + '//' + location.host);
	};

	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!set$1 || !clear) {
	  set$1 = function setImmediate(fn) {
	    var arguments$1 = arguments;

	    var args = [];
	    var i = 1;
	    while (arguments.length > i) { args.push(arguments$1[i++]); }
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clear = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (classofRaw(process) == 'process') {
	    defer = function (id) {
	      process.nextTick(runner(id));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  // except iOS - https://github.com/zloirock/core-js/issues/624
	  } else if (MessageChannel && !engineIsIos) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = functionBindContext(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (global_1.addEventListener && typeof postMessage == 'function' && !global_1.importScripts && !fails(post)) {
	    defer = post;
	    global_1.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	var task = {
	  set: set$1,
	  clear: clear
	};

	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

	var macrotask = task.set;


	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var process$1 = global_1.process;
	var Promise$1 = global_1.Promise;
	var IS_NODE = classofRaw(process$1) == 'process';
	// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
	var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

	var flush, head, last, notify, toggle, node, promise, then;

	// modern engines have queueMicrotask method
	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process$1.domain)) { parent.exit(); }
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (error) {
	        if (head) { notify(); }
	        else { last = undefined; }
	        throw error;
	      }
	    } last = undefined;
	    if (parent) { parent.enter(); }
	  };

	  // Node.js
	  if (IS_NODE) {
	    notify = function () {
	      process$1.nextTick(flush);
	    };
	  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
	  } else if (MutationObserver && !engineIsIos) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true });
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$1.resolve(undefined);
	    then = promise.then;
	    notify = function () {
	      then.call(promise, flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global_1, flush);
	    };
	  }
	}

	var microtask = queueMicrotask || function (fn) {
	  var task = { fn: fn, next: undefined };
	  if (last) { last.next = task; }
	  if (!head) {
	    head = task;
	    notify();
	  } last = task;
	};

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) { throw TypeError('Bad Promise constructor'); }
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$1(resolve);
	  this.reject = aFunction$1(reject);
	};

	// 25.4.1.5 NewPromiseCapability(C)
	var f$5 = function (C) {
	  return new PromiseCapability(C);
	};

	var newPromiseCapability = {
		f: f$5
	};

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) { return x; }
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var hostReportErrors = function (a, b) {
	  var console = global_1.console;
	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform = function (exec) {
	  try {
	    return { error: false, value: exec() };
	  } catch (error) {
	    return { error: true, value: error };
	  }
	};

	var process$2 = global_1.process;
	var versions = process$2 && process$2.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) { version = match[1]; }
	  }
	}

	var engineV8Version = version && +version;

	var task$1 = task.set;










	var SPECIES$2 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState$2 = internalState.get;
	var setInternalState$2 = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$3 = global_1.process;
	var $fetch = getBuiltIn('fetch');
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$3) == 'process';
	var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

	var FORCED = isForced_1(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
	  if (!GLOBAL_CORE_JS_PROMISE) {
	    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	    // We can't detect it synchronously, so just check versions
	    if (engineV8Version === 66) { return true; }
	    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') { return true; }
	  }
	  // We can't use @@species feature detection in V8 since it causes
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) { return false; }
	  // Detect correctness of subclassing with @@species support
	  var promise = PromiseConstructor.resolve(1);
	  var FakePromise = function (exec) {
	    exec(function () { /* empty */ }, function () { /* empty */ });
	  };
	  var constructor = promise.constructor = {};
	  constructor[SPECIES$2] = FakePromise;
	  return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
	});

	var INCORRECT_ITERATION = FORCED || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
	});

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};

	var notify$1 = function (promise, state, isReject) {
	  if (state.notified) { return; }
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0;
	    // variable length - can't use forEach
	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) { onHandleUnhandled(promise, state); }
	            state.rejection = HANDLED;
	          }
	          if (handler === true) { result = value; }
	          else {
	            if (domain) { domain.enter(); }
	            result = handler(value); // can throw
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else { resolve(result); }
	        } else { reject(value); }
	      } catch (error) {
	        if (domain && !exited) { domain.exit(); }
	        reject(error);
	      }
	    }
	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) { onUnhandled(promise, state); }
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;
	  if (DISPATCH_EVENT) {
	    event = document$2.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else { event = { promise: promise, reason: reason }; }
	  if (handler = global_1['on' + name]) { handler(event); }
	  else if (name === UNHANDLED_REJECTION) { hostReportErrors('Unhandled promise rejection', reason); }
	};

	var onUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;
	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE$1) {
	          process$3.emit('unhandledRejection', value, promise);
	        } else { dispatchEvent(UNHANDLED_REJECTION, promise, value); }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) { throw result.value; }
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    if (IS_NODE$1) {
	      process$3.emit('rejectionHandled', promise);
	    } else { dispatchEvent(REJECTION_HANDLED, promise, state.value); }
	  });
	};

	var bind = function (fn, promise, state, unwrap) {
	  return function (value) {
	    fn(promise, state, value, unwrap);
	  };
	};

	var internalReject = function (promise, state, value, unwrap) {
	  if (state.done) { return; }
	  state.done = true;
	  if (unwrap) { state = unwrap; }
	  state.value = value;
	  state.state = REJECTED;
	  notify$1(promise, state, true);
	};

	var internalResolve = function (promise, state, value, unwrap) {
	  if (state.done) { return; }
	  state.done = true;
	  if (unwrap) { state = unwrap; }
	  try {
	    if (promise === value) { throw TypeError$1("Promise can't be resolved itself"); }
	    var then = isThenable(value);
	    if (then) {
	      microtask(function () {
	        var wrapper = { done: false };
	        try {
	          then.call(value,
	            bind(internalResolve, promise, wrapper, state),
	            bind(internalReject, promise, wrapper, state)
	          );
	        } catch (error) {
	          internalReject(promise, wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify$1(promise, state, false);
	    }
	  } catch (error) {
	    internalReject(promise, { done: false }, error, state);
	  }
	};

	// constructor polyfill
	if (FORCED) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$1(executor);
	    Internal.call(this);
	    var state = getInternalState$2(this);
	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    setInternalState$2(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };
	  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) { notify$1(this, state, false); }
	      return reaction.promise;
	    },
	    // `Promise.prototype.catch` method
	    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState$2(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, promise, state);
	    this.reject = bind(internalReject, promise, state);
	  };
	  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };

	  if ( typeof nativePromiseConstructor == 'function') {
	    nativeThen = nativePromiseConstructor.prototype.then;

	    // wrap native Promise#then for native async functions
	    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
	      var that = this;
	      return new PromiseConstructor(function (resolve, reject) {
	        nativeThen.call(that, resolve, reject);
	      }).then(onFulfilled, onRejected);
	    // https://github.com/zloirock/core-js/issues/640
	    }, { unsafe: true });

	    // wrap fetch result
	    if (typeof $fetch == 'function') { _export({ global: true, enumerable: true, forced: true }, {
	      // eslint-disable-next-line no-unused-vars
	      fetch: function fetch(input /* , init */) {
	        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
	      }
	    }); }
	  }
	}

	_export({ global: true, wrap: true, forced: FORCED }, {
	  Promise: PromiseConstructor
	});

	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);

	PromiseWrapper = getBuiltIn(PROMISE);

	// statics
	_export({ target: PROMISE, stat: true, forced: FORCED }, {
	  // `Promise.reject` method
	  // https://tc39.github.io/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});

	_export({ target: PROMISE, stat: true, forced:  FORCED }, {
	  // `Promise.resolve` method
	  // https://tc39.github.io/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve( this, x);
	  }
	});

	_export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
	  // `Promise.all` method
	  // https://tc39.github.io/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) { return; }
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) { reject(result.value); }
	    return capability.promise;
	  },
	  // `Promise.race` method
	  // https://tc39.github.io/ecma262/#sec-promise.race
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      iterate_1(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) { reject(result.value); }
	    return capability.promise;
	  }
	});

	// `Promise.allSettled` method
	// https://github.com/tc39/proposal-promise-allSettled
	_export({ target: 'Promise', stat: true }, {
	  allSettled: function allSettled(iterable) {
	    var C = this;
	    var capability = newPromiseCapability.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) { return; }
	          alreadyCalled = true;
	          values[index] = { status: 'fulfilled', value: value };
	          --remaining || resolve(values);
	        }, function (e) {
	          if (alreadyCalled) { return; }
	          alreadyCalled = true;
	          values[index] = { status: 'rejected', reason: e };
	          --remaining || resolve(values);
	        });
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) { reject(result.value); }
	    return capability.promise;
	  }
	});

	// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
	var NON_GENERIC = !!nativePromiseConstructor && fails(function () {
	  nativePromiseConstructor.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
	});

	// `Promise.prototype.finally` method
	// https://tc39.github.io/ecma262/#sec-promise.prototype.finally
	_export({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
	  'finally': function (onFinally) {
	    var C = speciesConstructor(this, getBuiltIn('Promise'));
	    var isFunction = typeof onFinally == 'function';
	    return this.then(
	      isFunction ? function (x) {
	        return promiseResolve(C, onFinally()).then(function () { return x; });
	      } : onFinally,
	      isFunction ? function (e) {
	        return promiseResolve(C, onFinally()).then(function () { throw e; });
	      } : onFinally
	    );
	  }
	});

	// patch native Promise.prototype for native async functions
	if ( typeof nativePromiseConstructor == 'function' && !nativePromiseConstructor.prototype['finally']) {
	  redefine(nativePromiseConstructor.prototype, 'finally', getBuiltIn('Promise').prototype['finally']);
	}

	var promise$1 = path.Promise;

	var setInternalState$3 = internalState.set;
	var getInternalAggregateErrorState = internalState.getterFor('AggregateError');

	var $AggregateError = function AggregateError(errors, message) {
	  var that = this;
	  if (!(that instanceof $AggregateError)) { return new $AggregateError(errors, message); }
	  if (objectSetPrototypeOf) {
	    that = objectSetPrototypeOf(new Error(message), objectGetPrototypeOf(that));
	  }
	  var errorsArray = [];
	  iterate_1(errors, errorsArray.push, errorsArray);
	  if (descriptors) { setInternalState$3(that, { errors: errorsArray, type: 'AggregateError' }); }
	  else { that.errors = errorsArray; }
	  if (message !== undefined) { createNonEnumerableProperty(that, 'message', String(message)); }
	  return that;
	};

	$AggregateError.prototype = objectCreate(Error.prototype, {
	  constructor: createPropertyDescriptor(5, $AggregateError),
	  message: createPropertyDescriptor(5, ''),
	  name: createPropertyDescriptor(5, 'AggregateError')
	});

	if (descriptors) { objectDefineProperty.f($AggregateError.prototype, 'errors', {
	  get: function () {
	    return getInternalAggregateErrorState(this).errors;
	  },
	  configurable: true
	}); }

	_export({ global: true }, {
	  AggregateError: $AggregateError
	});

	// `Promise.try` method
	// https://github.com/tc39/proposal-promise-try
	_export({ target: 'Promise', stat: true }, {
	  'try': function (callbackfn) {
	    var promiseCapability = newPromiseCapability.f(this);
	    var result = perform(callbackfn);
	    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
	    return promiseCapability.promise;
	  }
	});

	var PROMISE_ANY_ERROR = 'No one promise resolved';

	// `Promise.any` method
	// https://github.com/tc39/proposal-promise-any
	_export({ target: 'Promise', stat: true }, {
	  any: function any(iterable) {
	    var C = this;
	    var capability = newPromiseCapability.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var promiseResolve = aFunction$1(C.resolve);
	      var errors = [];
	      var counter = 0;
	      var remaining = 1;
	      var alreadyResolved = false;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyRejected = false;
	        errors.push(undefined);
	        remaining++;
	        promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyRejected || alreadyResolved) { return; }
	          alreadyResolved = true;
	          resolve(value);
	        }, function (e) {
	          if (alreadyRejected || alreadyResolved) { return; }
	          alreadyRejected = true;
	          errors[index] = e;
	          --remaining || reject(new (getBuiltIn('AggregateError'))(errors, PROMISE_ANY_ERROR));
	        });
	      });
	      --remaining || reject(new (getBuiltIn('AggregateError'))(errors, PROMISE_ANY_ERROR));
	    });
	    if (result.error) { reject(result.value); }
	    return capability.promise;
	  }
	});

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var SPECIES$3 = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) { C = undefined; }
	    else if (isObject(C)) {
	      C = C[SPECIES$3];
	      if (C === null) { C = undefined; }
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
	var createMethod$2 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) { if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) { target[index] = result; } // map
	        else if (result) { switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } } else if (IS_EVERY) { return false; }  // every
	      }
	    } }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$2(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$2(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$2(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$2(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$2(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$2(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$2(6)
	};

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var defineProperty$1 = Object.defineProperty;
	var cache = {};

	var thrower = function (it) { throw it; };

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) { return cache[METHOD_NAME]; }
	  if (!options) { options = {}; }
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;

	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) { return true; }
	    var O = { length: -1 };

	    if (ACCESSORS) { defineProperty$1(O, 1, { enumerable: true, get: thrower }); }
	    else { O[1] = 1; }

	    method.call(O, argument0, argument1);
	  });
	};

	var $forEach = arrayIteration.forEach;



	var STRICT_METHOD = arrayMethodIsStrict('forEach');
	var USES_TO_LENGTH = arrayMethodUsesToLength('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	var arrayForEach = (!STRICT_METHOD || !USES_TO_LENGTH) ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
	  forEach: arrayForEach
	});

	var call = Function.call;

	var entryUnbind = function (CONSTRUCTOR, METHOD, length) {
	  return functionBindContext(call, global_1[CONSTRUCTOR].prototype[METHOD], length);
	};

	var forEach = entryUnbind('Array', 'forEach');

	var nativeAssign = Object.assign;
	var defineProperty$2 = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty$2({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$2(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) { return true; }
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) {
	  var arguments$1 = arguments;
	 // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments$1[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) { T[key] = S[key]; }
	    }
	  } return T;
	} : nativeAssign;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	_export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
	  assign: objectAssign
	});

	var assign = path.Object.assign;

	for (var COLLECTION_NAME$1 in domIterables) {
	  var Collection$1 = global_1[COLLECTION_NAME$1];
	  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype$1 && CollectionPrototype$1.forEach !== arrayForEach) { try {
	    createNonEnumerableProperty(CollectionPrototype$1, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype$1.forEach = arrayForEach;
	  } }
	}

	var ITERATOR$6 = wellKnownSymbol('iterator');

	var nativeUrl = !fails(function () {
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var searchParams = url.searchParams;
	  var result = '';
	  url.pathname = 'c%20d';
	  searchParams.forEach(function (value, key) {
	    searchParams['delete']('b');
	    result += key + value;
	  });
	  return (isPure && !url.toJSON)
	    || !searchParams.sort
	    || url.href !== 'http://a/c%20d?a=1&c=3'
	    || searchParams.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !searchParams[ITERATOR$6]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('http://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('http://a#б').hash !== '#%D0%B1'
	    // fails in Chrome 66-
	    || result !== 'a1c3'
	    // throws in Safari
	    || new URL('http://x', undefined).host !== 'x';
	});

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);
	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  } return anObject(iteratorMethod.call(it));
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`





















	var $fetch$1 = getBuiltIn('fetch');
	var Headers = getBuiltIn('Headers');
	var ITERATOR$7 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$4 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);

	var plus = /\+/g;
	var sequences = Array(4);

	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};

	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};

	var deserialize = function (it) {
	  var result = it.replace(plus, ' ');
	  var bytes = 4;
	  try {
	    return decodeURIComponent(result);
	  } catch (error) {
	    while (bytes) {
	      result = result.replace(percentSequence(bytes--), percentDecode);
	    }
	    return result;
	  }
	};

	var find = /[!'()~]|%20/g;

	var replace = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replace[match];
	};

	var serialize = function (it) {
	  return encodeURIComponent(it).replace(find, replacer);
	};

	var parseSearchParams = function (result, query) {
	  if (query) {
	    var attributes = query.split('&');
	    var index = 0;
	    var attribute, entry;
	    while (index < attributes.length) {
	      attribute = attributes[index++];
	      if (attribute.length) {
	        entry = attribute.split('=');
	        result.push({
	          key: deserialize(entry.shift()),
	          value: deserialize(entry.join('='))
	        });
	      }
	    }
	  }
	};

	var updateSearchParams = function (query) {
	  this.entries.length = 0;
	  parseSearchParams(this.entries, query);
	};

	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) { throw TypeError('Not enough arguments'); }
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$4(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    iterator: getIterator(getInternalParamsState(params).entries),
	    kind: kind
	  });
	}, 'Iterator', function next() {
	  var state = getInternalIteratorState(this);
	  var kind = state.kind;
	  var step = state.iterator.next();
	  var entry = step.value;
	  if (!step.done) {
	    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
	  } return step;
	});

	// `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams
	var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
	  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var that = this;
	  var entries = [];
	  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

	  setInternalState$4(that, {
	    type: URL_SEARCH_PARAMS,
	    entries: entries,
	    updateURL: function () { /* empty */ },
	    updateSearchParams: updateSearchParams
	  });

	  if (init !== undefined) {
	    if (isObject(init)) {
	      iteratorMethod = getIteratorMethod(init);
	      if (typeof iteratorMethod === 'function') {
	        iterator = iteratorMethod.call(init);
	        next = iterator.next;
	        while (!(step = next.call(iterator)).done) {
	          entryIterator = getIterator(anObject(step.value));
	          entryNext = entryIterator.next;
	          if (
	            (first = entryNext.call(entryIterator)).done ||
	            (second = entryNext.call(entryIterator)).done ||
	            !entryNext.call(entryIterator).done
	          ) { throw TypeError('Expected sequence with length 2'); }
	          entries.push({ key: first.value + '', value: second.value + '' });
	        }
	      } else { for (key in init) { if (has(init, key)) { entries.push({ key: key, value: init[key] + '' }); } } }
	    } else {
	      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
	    }
	  }
	};

	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

	redefineAll(URLSearchParamsPrototype, {
	  // `URLSearchParams.prototype.appent` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    validateArgumentsLength(arguments.length, 2);
	    var state = getInternalParamsState(this);
	    state.entries.push({ key: name + '', value: value + '' });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index].key === key) { entries.splice(index, 1); }
	      else { index++; }
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) { return entries[index].value; }
	    }
	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) { result.push(entries[index].value); }
	    }
	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index++].key === key) { return true; }
	    }
	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var found = false;
	    var key = name + '';
	    var val = value + '';
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) { entries.splice(index--, 1); }
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) { entries.push({ key: key, value: val }); }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    // Array#sort is not stable in some engines
	    var slice = entries.slice();
	    var entry, entriesIndex, sliceIndex;
	    entries.length = 0;
	    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
	      entry = slice[sliceIndex];
	      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
	        if (entries[entriesIndex].key > entry.key) {
	          entries.splice(entriesIndex, 0, entry);
	          break;
	        }
	      }
	      if (entriesIndex === sliceIndex) { entries.push(entry); }
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback /* , thisArg */) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });

	// `URLSearchParams.prototype[@@iterator]` method
	redefine(URLSearchParamsPrototype, ITERATOR$7, URLSearchParamsPrototype.entries);

	// `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
	redefine(URLSearchParamsPrototype, 'toString', function toString() {
	  var entries = getInternalParamsState(this).entries;
	  var result = [];
	  var index = 0;
	  var entry;
	  while (index < entries.length) {
	    entry = entries[index++];
	    result.push(serialize(entry.key) + '=' + serialize(entry.value));
	  } return result.join('&');
	}, { enumerable: true });

	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

	_export({ global: true, forced: !nativeUrl }, {
	  URLSearchParams: URLSearchParamsConstructor
	});

	// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
	// https://github.com/zloirock/core-js/issues/674
	if (!nativeUrl && typeof $fetch$1 == 'function' && typeof Headers == 'function') {
	  _export({ global: true, enumerable: true, forced: true }, {
	    fetch: function fetch(input /* , init */) {
	      var args = [input];
	      var init, body, headers;
	      if (arguments.length > 1) {
	        init = arguments[1];
	        if (isObject(init)) {
	          body = init.body;
	          if (classof(body) === URL_SEARCH_PARAMS) {
	            headers = init.headers ? new Headers(init.headers) : new Headers();
	            if (!headers.has('content-type')) {
	              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	            }
	            init = objectCreate(init, {
	              body: createPropertyDescriptor(0, String(body)),
	              headers: createPropertyDescriptor(0, headers)
	            });
	          }
	        }
	        args.push(init);
	      } return $fetch$1.apply(this, args);
	    }
	  });
	}

	var urlSearchParams = path.URLSearchParams;

	var support = {
	  searchParams: 'URLSearchParams' in self,
	  iterable: 'Symbol' in self && 'iterator' in Symbol,
	  blob:
	    'FileReader' in self &&
	    'Blob' in self &&
	    (function() {
	      try {
	        new Blob();
	        return true
	      } catch (e) {
	        return false
	      }
	    })(),
	  formData: 'FormData' in self,
	  arrayBuffer: 'ArrayBuffer' in self
	};

	function isDataView(obj) {
	  return obj && DataView.prototype.isPrototypeOf(obj)
	}

	if (support.arrayBuffer) {
	  var viewClasses = [
	    '[object Int8Array]',
	    '[object Uint8Array]',
	    '[object Uint8ClampedArray]',
	    '[object Int16Array]',
	    '[object Uint16Array]',
	    '[object Int32Array]',
	    '[object Uint32Array]',
	    '[object Float32Array]',
	    '[object Float64Array]'
	  ];

	  var isArrayBufferView =
	    ArrayBuffer.isView ||
	    function(obj) {
	      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
	    };
	}

	function normalizeName(name) {
	  if (typeof name !== 'string') {
	    name = String(name);
	  }
	  if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
	    throw new TypeError('Invalid character in header field name')
	  }
	  return name.toLowerCase()
	}

	function normalizeValue(value) {
	  if (typeof value !== 'string') {
	    value = String(value);
	  }
	  return value
	}

	// Build a destructive iterator for the value list
	function iteratorFor(items) {
	  var iterator = {
	    next: function() {
	      var value = items.shift();
	      return {done: value === undefined, value: value}
	    }
	  };

	  if (support.iterable) {
	    iterator[Symbol.iterator] = function() {
	      return iterator
	    };
	  }

	  return iterator
	}

	function Headers$1(headers) {
	  this.map = {};

	  if (headers instanceof Headers$1) {
	    headers.forEach(function(value, name) {
	      this.append(name, value);
	    }, this);
	  } else if (Array.isArray(headers)) {
	    headers.forEach(function(header) {
	      this.append(header[0], header[1]);
	    }, this);
	  } else if (headers) {
	    Object.getOwnPropertyNames(headers).forEach(function(name) {
	      this.append(name, headers[name]);
	    }, this);
	  }
	}

	Headers$1.prototype.append = function(name, value) {
	  name = normalizeName(name);
	  value = normalizeValue(value);
	  var oldValue = this.map[name];
	  this.map[name] = oldValue ? oldValue + ', ' + value : value;
	};

	Headers$1.prototype['delete'] = function(name) {
	  delete this.map[normalizeName(name)];
	};

	Headers$1.prototype.get = function(name) {
	  name = normalizeName(name);
	  return this.has(name) ? this.map[name] : null
	};

	Headers$1.prototype.has = function(name) {
	  return this.map.hasOwnProperty(normalizeName(name))
	};

	Headers$1.prototype.set = function(name, value) {
	  this.map[normalizeName(name)] = normalizeValue(value);
	};

	Headers$1.prototype.forEach = function(callback, thisArg) {
	  for (var name in this.map) {
	    if (this.map.hasOwnProperty(name)) {
	      callback.call(thisArg, this.map[name], name, this);
	    }
	  }
	};

	Headers$1.prototype.keys = function() {
	  var items = [];
	  this.forEach(function(value, name) {
	    items.push(name);
	  });
	  return iteratorFor(items)
	};

	Headers$1.prototype.values = function() {
	  var items = [];
	  this.forEach(function(value) {
	    items.push(value);
	  });
	  return iteratorFor(items)
	};

	Headers$1.prototype.entries = function() {
	  var items = [];
	  this.forEach(function(value, name) {
	    items.push([name, value]);
	  });
	  return iteratorFor(items)
	};

	if (support.iterable) {
	  Headers$1.prototype[Symbol.iterator] = Headers$1.prototype.entries;
	}

	function consumed(body) {
	  if (body.bodyUsed) {
	    return Promise.reject(new TypeError('Already read'))
	  }
	  body.bodyUsed = true;
	}

	function fileReaderReady(reader) {
	  return new Promise(function(resolve, reject) {
	    reader.onload = function() {
	      resolve(reader.result);
	    };
	    reader.onerror = function() {
	      reject(reader.error);
	    };
	  })
	}

	function readBlobAsArrayBuffer(blob) {
	  var reader = new FileReader();
	  var promise = fileReaderReady(reader);
	  reader.readAsArrayBuffer(blob);
	  return promise
	}

	function readBlobAsText(blob) {
	  var reader = new FileReader();
	  var promise = fileReaderReady(reader);
	  reader.readAsText(blob);
	  return promise
	}

	function readArrayBufferAsText(buf) {
	  var view = new Uint8Array(buf);
	  var chars = new Array(view.length);

	  for (var i = 0; i < view.length; i++) {
	    chars[i] = String.fromCharCode(view[i]);
	  }
	  return chars.join('')
	}

	function bufferClone(buf) {
	  if (buf.slice) {
	    return buf.slice(0)
	  } else {
	    var view = new Uint8Array(buf.byteLength);
	    view.set(new Uint8Array(buf));
	    return view.buffer
	  }
	}

	function Body() {
	  this.bodyUsed = false;

	  this._initBody = function(body) {
	    this._bodyInit = body;
	    if (!body) {
	      this._bodyText = '';
	    } else if (typeof body === 'string') {
	      this._bodyText = body;
	    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	      this._bodyBlob = body;
	    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	      this._bodyFormData = body;
	    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	      this._bodyText = body.toString();
	    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
	      this._bodyArrayBuffer = bufferClone(body.buffer);
	      // IE 10-11 can't handle a DataView body.
	      this._bodyInit = new Blob([this._bodyArrayBuffer]);
	    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
	      this._bodyArrayBuffer = bufferClone(body);
	    } else {
	      this._bodyText = body = Object.prototype.toString.call(body);
	    }

	    if (!this.headers.get('content-type')) {
	      if (typeof body === 'string') {
	        this.headers.set('content-type', 'text/plain;charset=UTF-8');
	      } else if (this._bodyBlob && this._bodyBlob.type) {
	        this.headers.set('content-type', this._bodyBlob.type);
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	      }
	    }
	  };

	  if (support.blob) {
	    this.blob = function() {
	      var rejected = consumed(this);
	      if (rejected) {
	        return rejected
	      }

	      if (this._bodyBlob) {
	        return Promise.resolve(this._bodyBlob)
	      } else if (this._bodyArrayBuffer) {
	        return Promise.resolve(new Blob([this._bodyArrayBuffer]))
	      } else if (this._bodyFormData) {
	        throw new Error('could not read FormData body as blob')
	      } else {
	        return Promise.resolve(new Blob([this._bodyText]))
	      }
	    };

	    this.arrayBuffer = function() {
	      if (this._bodyArrayBuffer) {
	        return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
	      } else {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }
	    };
	  }

	  this.text = function() {
	    var rejected = consumed(this);
	    if (rejected) {
	      return rejected
	    }

	    if (this._bodyBlob) {
	      return readBlobAsText(this._bodyBlob)
	    } else if (this._bodyArrayBuffer) {
	      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
	    } else if (this._bodyFormData) {
	      throw new Error('could not read FormData body as text')
	    } else {
	      return Promise.resolve(this._bodyText)
	    }
	  };

	  if (support.formData) {
	    this.formData = function() {
	      return this.text().then(decode)
	    };
	  }

	  this.json = function() {
	    return this.text().then(JSON.parse)
	  };

	  return this
	}

	// HTTP methods whose capitalization should be normalized
	var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

	function normalizeMethod(method) {
	  var upcased = method.toUpperCase();
	  return methods.indexOf(upcased) > -1 ? upcased : method
	}

	function Request(input, options) {
	  options = options || {};
	  var body = options.body;

	  if (input instanceof Request) {
	    if (input.bodyUsed) {
	      throw new TypeError('Already read')
	    }
	    this.url = input.url;
	    this.credentials = input.credentials;
	    if (!options.headers) {
	      this.headers = new Headers$1(input.headers);
	    }
	    this.method = input.method;
	    this.mode = input.mode;
	    this.signal = input.signal;
	    if (!body && input._bodyInit != null) {
	      body = input._bodyInit;
	      input.bodyUsed = true;
	    }
	  } else {
	    this.url = String(input);
	  }

	  this.credentials = options.credentials || this.credentials || 'same-origin';
	  if (options.headers || !this.headers) {
	    this.headers = new Headers$1(options.headers);
	  }
	  this.method = normalizeMethod(options.method || this.method || 'GET');
	  this.mode = options.mode || this.mode || null;
	  this.signal = options.signal || this.signal;
	  this.referrer = null;

	  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	    throw new TypeError('Body not allowed for GET or HEAD requests')
	  }
	  this._initBody(body);
	}

	Request.prototype.clone = function() {
	  return new Request(this, {body: this._bodyInit})
	};

	function decode(body) {
	  var form = new FormData();
	  body
	    .trim()
	    .split('&')
	    .forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=');
	        var name = split.shift().replace(/\+/g, ' ');
	        var value = split.join('=').replace(/\+/g, ' ');
	        form.append(decodeURIComponent(name), decodeURIComponent(value));
	      }
	    });
	  return form
	}

	function parseHeaders(rawHeaders) {
	  var headers = new Headers$1();
	  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
	  // https://tools.ietf.org/html/rfc7230#section-3.2
	  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
	  preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
	    var parts = line.split(':');
	    var key = parts.shift().trim();
	    if (key) {
	      var value = parts.join(':').trim();
	      headers.append(key, value);
	    }
	  });
	  return headers
	}

	Body.call(Request.prototype);

	function Response(bodyInit, options) {
	  if (!options) {
	    options = {};
	  }

	  this.type = 'default';
	  this.status = options.status === undefined ? 200 : options.status;
	  this.ok = this.status >= 200 && this.status < 300;
	  this.statusText = 'statusText' in options ? options.statusText : 'OK';
	  this.headers = new Headers$1(options.headers);
	  this.url = options.url || '';
	  this._initBody(bodyInit);
	}

	Body.call(Response.prototype);

	Response.prototype.clone = function() {
	  return new Response(this._bodyInit, {
	    status: this.status,
	    statusText: this.statusText,
	    headers: new Headers$1(this.headers),
	    url: this.url
	  })
	};

	Response.error = function() {
	  var response = new Response(null, {status: 0, statusText: ''});
	  response.type = 'error';
	  return response
	};

	var redirectStatuses = [301, 302, 303, 307, 308];

	Response.redirect = function(url, status) {
	  if (redirectStatuses.indexOf(status) === -1) {
	    throw new RangeError('Invalid status code')
	  }

	  return new Response(null, {status: status, headers: {location: url}})
	};

	var DOMException = self.DOMException;
	try {
	  new DOMException();
	} catch (err) {
	  DOMException = function(message, name) {
	    this.message = message;
	    this.name = name;
	    var error = Error(message);
	    this.stack = error.stack;
	  };
	  DOMException.prototype = Object.create(Error.prototype);
	  DOMException.prototype.constructor = DOMException;
	}

	function fetch(input, init) {
	  return new Promise(function(resolve, reject) {
	    var request = new Request(input, init);

	    if (request.signal && request.signal.aborted) {
	      return reject(new DOMException('Aborted', 'AbortError'))
	    }

	    var xhr = new XMLHttpRequest();

	    function abortXhr() {
	      xhr.abort();
	    }

	    xhr.onload = function() {
	      var options = {
	        status: xhr.status,
	        statusText: xhr.statusText,
	        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
	      };
	      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
	      var body = 'response' in xhr ? xhr.response : xhr.responseText;
	      resolve(new Response(body, options));
	    };

	    xhr.onerror = function() {
	      reject(new TypeError('Network request failed'));
	    };

	    xhr.ontimeout = function() {
	      reject(new TypeError('Network request failed'));
	    };

	    xhr.onabort = function() {
	      reject(new DOMException('Aborted', 'AbortError'));
	    };

	    xhr.open(request.method, request.url, true);

	    if (request.credentials === 'include') {
	      xhr.withCredentials = true;
	    } else if (request.credentials === 'omit') {
	      xhr.withCredentials = false;
	    }

	    if ('responseType' in xhr && support.blob) {
	      xhr.responseType = 'blob';
	    }

	    request.headers.forEach(function(value, name) {
	      xhr.setRequestHeader(name, value);
	    });

	    if (request.signal) {
	      request.signal.addEventListener('abort', abortXhr);

	      xhr.onreadystatechange = function() {
	        // DONE (success or failure)
	        if (xhr.readyState === 4) {
	          request.signal.removeEventListener('abort', abortXhr);
	        }
	      };
	    }

	    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
	  })
	}

	fetch.polyfill = true;

	if (!self.fetch) {
	  self.fetch = fetch;
	  self.Headers = Headers$1;
	  self.Request = Request;
	  self.Response = Response;
	}

	/**
	 * Polyfill for Element.prototype.matches()
	 * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
	 */

	/* eslint-disable no-undef */

	if (!Element.prototype.matches) { Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
	  var matches = (this.document || this.ownerDocument).querySelectorAll(s);
	  var i = matches.length; // eslint-disable-next-line no-empty

	  while (--i >= 0 && matches.item(i) !== this) {}

	  return i > -1;
	}; }
	/* eslint-enable no-undef */

	/**
	 * Polyfill for Element.prototype.closest()
	 * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
	 */

	if (!Element.prototype.matches) {
	  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	}

	if (!Element.prototype.closest) {
	  Element.prototype.closest = function (s) {
	    var el = this;

	    do {
	      if (el.matches(s)) { return el; }
	      el = el.parentElement || el.parentNode;
	    } while (el !== null && el.nodeType === 1);

	    return null;
	  };
	}

	/**
	 * Polyfill for Element.prototype.remove()
	 * https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove#Polyfill
	 */

	(function (arr) {
	  arr.forEach(function (item) {
	    if (item.hasOwnProperty('remove')) { return; }
	    Object.defineProperty(item, 'remove', {
	      configurable: true,
	      enumerable: true,
	      writable: true,
	      value: function remove() {
	        if (this.parentNode !== null) { this.parentNode.removeChild(this); }
	      }
	    });
	  });
	})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
	/* eslint-enable no-undef */

	/**
	 * Polyfill for NodeList.prototype.forEach()
	 * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#Polyfill
	 */

	/* eslint-disable no-undef */

	if (window.NodeList && !NodeList.prototype.forEach) {
	  NodeList.prototype.forEach = Array.prototype.forEach;
	}

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWZpbGxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2xvYmFsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLXB1cmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZmFpbHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZGVzY3JpcHRvcnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtb2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2RvY3VtZW50LWNyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2llOC1kb20tZGVmaW5lLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FuLW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1wcmltaXRpdmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jcmVhdGUtcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2V0LWdsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zaGFyZWQtc3RvcmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2hhcmVkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hhcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91aWQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXN5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91c2Utc3ltYm9sLWFzLXVpZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1zdHJpbmctdGFnLXN1cHBvcnQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaW5zcGVjdC1zb3VyY2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXdlYWstbWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NoYXJlZC1rZXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaGlkZGVuLWtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVkZWZpbmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY2xhc3NvZi1yYXcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY2xhc3NvZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtdG8tc3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5vYmplY3QudG8tc3RyaW5nLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWludGVnZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3N0cmluZy1tdWx0aWJ5dGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaW5kZXhlZC1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9wYXRoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2dldC1idWlsdC1pbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1sZW5ndGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tYWJzb2x1dGUtaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktaW5jbHVkZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWtleXMtaW50ZXJuYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZW51bS1idWcta2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1zeW1ib2xzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL293bi1rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NvcHktY29uc3RydWN0b3ItcHJvcGVydGllcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1mb3JjZWQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZXhwb3J0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jb3JyZWN0LXByb3RvdHlwZS1nZXR0ZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1wcm90b3R5cGUtb2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXRlcmF0b3JzLWNvcmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0aWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2h0bWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pdGVyYXRvcnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY3JlYXRlLWl0ZXJhdG9yLWNvbnN0cnVjdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2EtcG9zc2libGUtcHJvdG90eXBlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1zZXQtcHJvdG90eXBlLW9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2RlZmluZS1pdGVyYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuc3RyaW5nLml0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5hcnJheS5pdGVyYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmRvbS1jb2xsZWN0aW9ucy5pdGVyYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9uYXRpdmUtcHJvbWlzZS1jb25zdHJ1Y3Rvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9yZWRlZmluZS1hbGwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2V0LXNwZWNpZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYS1mdW5jdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hbi1pbnN0YW5jZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1hcnJheS1pdGVyYXRvci1tZXRob2QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZnVuY3Rpb24tYmluZC1jb250ZXh0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2dldC1pdGVyYXRvci1tZXRob2QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY2FsbC13aXRoLXNhZmUtaXRlcmF0aW9uLWNsb3NpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXRlcmF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jaGVjay1jb3JyZWN0bmVzcy1vZi1pdGVyYXRpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc3BlY2llcy1jb25zdHJ1Y3Rvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9lbmdpbmUtdXNlci1hZ2VudC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9lbmdpbmUtaXMtaW9zLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3Rhc2suanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbWljcm90YXNrLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25ldy1wcm9taXNlLWNhcGFiaWxpdHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcHJvbWlzZS1yZXNvbHZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hvc3QtcmVwb3J0LWVycm9ycy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9wZXJmb3JtLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2VuZ2luZS12OC12ZXJzaW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5wcm9taXNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5wcm9taXNlLmFsbC1zZXR0bGVkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5wcm9taXNlLmZpbmFsbHkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9lcy9wcm9taXNlL2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lc25leHQuYWdncmVnYXRlLWVycm9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lc25leHQucHJvbWlzZS50cnkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzbmV4dC5wcm9taXNlLmFueS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1hcnJheS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1pdGVyYXRpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktbWV0aG9kLWlzLXN0cmljdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1tZXRob2QtdXNlcy10by1sZW5ndGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktZm9yLWVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5LmZvci1lYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2VudHJ5LXVuYmluZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2VzL2FycmF5L2Zvci1lYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1hc3NpZ24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLm9iamVjdC5hc3NpZ24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9lcy9vYmplY3QvYXNzaWduLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIuZG9tLWNvbGxlY3Rpb25zLmZvci1lYWNoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25hdGl2ZS11cmwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIudXJsLXNlYXJjaC1wYXJhbXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy93ZWIvdXJsLXNlYXJjaC1wYXJhbXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9lbGVtZW50L21hdGNoZXMuanMiLCIuLi8uLi9zcmMvdXRpbGl0aWVzL2VsZW1lbnQvY2xvc2VzdC5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvZWxlbWVudC9yZW1vdmUuanMiLCIuLi8uLi9zcmMvdXRpbGl0aWVzL25vZGVsaXN0L2ZvcmVhY2guanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGNoZWNrID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCAmJiBpdC5NYXRoID09IE1hdGggJiYgaXQ7XG59O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxubW9kdWxlLmV4cG9ydHMgPVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgY2hlY2sodHlwZW9mIGdsb2JhbFRoaXMgPT0gJ29iamVjdCcgJiYgZ2xvYmFsVGhpcykgfHxcbiAgY2hlY2sodHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cpIHx8XG4gIGNoZWNrKHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYpIHx8XG4gIGNoZWNrKHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgMSwgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSlbMV0gIT0gNztcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG52YXIgZG9jdW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBFWElTVFMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBFWElTVFMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudCcpO1xuXG4vLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFERVNDUklQVE9SUyAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGNyZWF0ZUVsZW1lbnQoJ2RpdicpLCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH1cbiAgfSkuYSAhPSA3O1xufSk7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFN0cmluZyhpdCkgKyAnIGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG4vLyBgVG9QcmltaXRpdmVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9wcmltaXRpdmVcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5wdXQsIFBSRUZFUlJFRF9TVFJJTkcpIHtcbiAgaWYgKCFpc09iamVjdChpbnB1dCkpIHJldHVybiBpbnB1dDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGlucHV0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaW5wdXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaWU4LWRvbS1kZWZpbmUnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcblxudmFyIG5hdGl2ZURlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnR5YCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5kZWZpbmVwcm9wZXJ0eVxuZXhwb3J0cy5mID0gREVTQ1JJUFRPUlMgPyBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gbmF0aXZlRGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcykgdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCcpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYml0bWFwLCB2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGU6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlOiB2YWx1ZVxuICB9O1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBERVNDUklQVE9SUyA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5TW9kdWxlLmYob2JqZWN0LCBrZXksIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcigxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB0cnkge1xuICAgIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eShnbG9iYWwsIGtleSwgdmFsdWUpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGdsb2JhbFtrZXldID0gdmFsdWU7XG4gIH0gcmV0dXJuIHZhbHVlO1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgc2V0R2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC1nbG9iYWwnKTtcblxudmFyIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nO1xudmFyIHN0b3JlID0gZ2xvYmFsW1NIQVJFRF0gfHwgc2V0R2xvYmFsKFNIQVJFRCwge30pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0b3JlO1xuIiwidmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1zdG9yZScpO1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IHt9KTtcbn0pKCd2ZXJzaW9ucycsIFtdKS5wdXNoKHtcbiAgdmVyc2lvbjogJzMuNi40JyxcbiAgbW9kZTogSVNfUFVSRSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDIwIERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG4iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG4iLCJ2YXIgaWQgPSAwO1xudmFyIHBvc3RmaXggPSBNYXRoLnJhbmRvbSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJyArIFN0cmluZyhrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5KSArICcpXycgKyAoKytpZCArIHBvc3RmaXgpLnRvU3RyaW5nKDM2KTtcbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAhIU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgJiYgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgLy8gQ2hyb21lIDM4IFN5bWJvbCBoYXMgaW5jb3JyZWN0IHRvU3RyaW5nIGNvbnZlcnNpb25cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gIHJldHVybiAhU3RyaW5nKFN5bWJvbCgpKTtcbn0pO1xuIiwidmFyIE5BVElWRV9TWU1CT0wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXN5bWJvbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5BVElWRV9TWU1CT0xcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICYmICFTeW1ib2wuc2hhbVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJztcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdWlkJyk7XG52YXIgTkFUSVZFX1NZTUJPTCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtc3ltYm9sJyk7XG52YXIgVVNFX1NZTUJPTF9BU19VSUQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdXNlLXN5bWJvbC1hcy11aWQnKTtcblxudmFyIFdlbGxLbm93blN5bWJvbHNTdG9yZSA9IHNoYXJlZCgnd2tzJyk7XG52YXIgU3ltYm9sID0gZ2xvYmFsLlN5bWJvbDtcbnZhciBjcmVhdGVXZWxsS25vd25TeW1ib2wgPSBVU0VfU1lNQk9MX0FTX1VJRCA/IFN5bWJvbCA6IFN5bWJvbCAmJiBTeW1ib2wud2l0aG91dFNldHRlciB8fCB1aWQ7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgaWYgKCFoYXMoV2VsbEtub3duU3ltYm9sc1N0b3JlLCBuYW1lKSkge1xuICAgIGlmIChOQVRJVkVfU1lNQk9MICYmIGhhcyhTeW1ib2wsIG5hbWUpKSBXZWxsS25vd25TeW1ib2xzU3RvcmVbbmFtZV0gPSBTeW1ib2xbbmFtZV07XG4gICAgZWxzZSBXZWxsS25vd25TeW1ib2xzU3RvcmVbbmFtZV0gPSBjcmVhdGVXZWxsS25vd25TeW1ib2woJ1N5bWJvbC4nICsgbmFtZSk7XG4gIH0gcmV0dXJuIFdlbGxLbm93blN5bWJvbHNTdG9yZVtuYW1lXTtcbn07XG4iLCJ2YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBUT19TVFJJTkdfVEFHID0gd2VsbEtub3duU3ltYm9sKCd0b1N0cmluZ1RhZycpO1xudmFyIHRlc3QgPSB7fTtcblxudGVzdFtUT19TVFJJTkdfVEFHXSA9ICd6JztcblxubW9kdWxlLmV4cG9ydHMgPSBTdHJpbmcodGVzdCkgPT09ICdbb2JqZWN0IHpdJztcbiIsInZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQtc3RvcmUnKTtcblxudmFyIGZ1bmN0aW9uVG9TdHJpbmcgPSBGdW5jdGlvbi50b1N0cmluZztcblxuLy8gdGhpcyBoZWxwZXIgYnJva2VuIGluIGAzLjQuMS0zLjQuNGAsIHNvIHdlIGNhbid0IHVzZSBgc2hhcmVkYCBoZWxwZXJcbmlmICh0eXBlb2Ygc3RvcmUuaW5zcGVjdFNvdXJjZSAhPSAnZnVuY3Rpb24nKSB7XG4gIHN0b3JlLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb25Ub1N0cmluZy5jYWxsKGl0KTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdG9yZS5pbnNwZWN0U291cmNlO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpbnNwZWN0U291cmNlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luc3BlY3Qtc291cmNlJyk7XG5cbnZhciBXZWFrTWFwID0gZ2xvYmFsLldlYWtNYXA7XG5cbm1vZHVsZS5leHBvcnRzID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicgJiYgL25hdGl2ZSBjb2RlLy50ZXN0KGluc3BlY3RTb3VyY2UoV2Vha01hcCkpO1xuIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdWlkJyk7XG5cbnZhciBrZXlzID0gc2hhcmVkKCdrZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4ga2V5c1trZXldIHx8IChrZXlzW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcbiIsInZhciBOQVRJVkVfV0VBS19NQVAgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXdlYWstbWFwJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcbnZhciBvYmplY3RIYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgc2hhcmVkS2V5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1rZXknKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGRlbi1rZXlzJyk7XG5cbnZhciBXZWFrTWFwID0gZ2xvYmFsLldlYWtNYXA7XG52YXIgc2V0LCBnZXQsIGhhcztcblxudmFyIGVuZm9yY2UgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGhhcyhpdCkgPyBnZXQoaXQpIDogc2V0KGl0LCB7fSk7XG59O1xuXG52YXIgZ2V0dGVyRm9yID0gZnVuY3Rpb24gKFRZUEUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChpdCkge1xuICAgIHZhciBzdGF0ZTtcbiAgICBpZiAoIWlzT2JqZWN0KGl0KSB8fCAoc3RhdGUgPSBnZXQoaXQpKS50eXBlICE9PSBUWVBFKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ0luY29tcGF0aWJsZSByZWNlaXZlciwgJyArIFRZUEUgKyAnIHJlcXVpcmVkJyk7XG4gICAgfSByZXR1cm4gc3RhdGU7XG4gIH07XG59O1xuXG5pZiAoTkFUSVZFX1dFQUtfTUFQKSB7XG4gIHZhciBzdG9yZSA9IG5ldyBXZWFrTWFwKCk7XG4gIHZhciB3bWdldCA9IHN0b3JlLmdldDtcbiAgdmFyIHdtaGFzID0gc3RvcmUuaGFzO1xuICB2YXIgd21zZXQgPSBzdG9yZS5zZXQ7XG4gIHNldCA9IGZ1bmN0aW9uIChpdCwgbWV0YWRhdGEpIHtcbiAgICB3bXNldC5jYWxsKHN0b3JlLCBpdCwgbWV0YWRhdGEpO1xuICAgIHJldHVybiBtZXRhZGF0YTtcbiAgfTtcbiAgZ2V0ID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIHdtZ2V0LmNhbGwoc3RvcmUsIGl0KSB8fCB7fTtcbiAgfTtcbiAgaGFzID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIHdtaGFzLmNhbGwoc3RvcmUsIGl0KTtcbiAgfTtcbn0gZWxzZSB7XG4gIHZhciBTVEFURSA9IHNoYXJlZEtleSgnc3RhdGUnKTtcbiAgaGlkZGVuS2V5c1tTVEFURV0gPSB0cnVlO1xuICBzZXQgPSBmdW5jdGlvbiAoaXQsIG1ldGFkYXRhKSB7XG4gICAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KGl0LCBTVEFURSwgbWV0YWRhdGEpO1xuICAgIHJldHVybiBtZXRhZGF0YTtcbiAgfTtcbiAgZ2V0ID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIG9iamVjdEhhcyhpdCwgU1RBVEUpID8gaXRbU1RBVEVdIDoge307XG4gIH07XG4gIGhhcyA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiBvYmplY3RIYXMoaXQsIFNUQVRFKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogc2V0LFxuICBnZXQ6IGdldCxcbiAgaGFzOiBoYXMsXG4gIGVuZm9yY2U6IGVuZm9yY2UsXG4gIGdldHRlckZvcjogZ2V0dGVyRm9yXG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgaW5zcGVjdFNvdXJjZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbnNwZWN0LXNvdXJjZScpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcblxudmFyIGdldEludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmdldDtcbnZhciBlbmZvcmNlSW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZW5mb3JjZTtcbnZhciBURU1QTEFURSA9IFN0cmluZyhTdHJpbmcpLnNwbGl0KCdTdHJpbmcnKTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgdmFyIHVuc2FmZSA9IG9wdGlvbnMgPyAhIW9wdGlvbnMudW5zYWZlIDogZmFsc2U7XG4gIHZhciBzaW1wbGUgPSBvcHRpb25zID8gISFvcHRpb25zLmVudW1lcmFibGUgOiBmYWxzZTtcbiAgdmFyIG5vVGFyZ2V0R2V0ID0gb3B0aW9ucyA/ICEhb3B0aW9ucy5ub1RhcmdldEdldCA6IGZhbHNlO1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAodHlwZW9mIGtleSA9PSAnc3RyaW5nJyAmJiAhaGFzKHZhbHVlLCAnbmFtZScpKSBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkodmFsdWUsICduYW1lJywga2V5KTtcbiAgICBlbmZvcmNlSW50ZXJuYWxTdGF0ZSh2YWx1ZSkuc291cmNlID0gVEVNUExBVEUuam9pbih0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8ga2V5IDogJycpO1xuICB9XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBpZiAoc2ltcGxlKSBPW2tleV0gPSB2YWx1ZTtcbiAgICBlbHNlIHNldEdsb2JhbChrZXksIHZhbHVlKTtcbiAgICByZXR1cm47XG4gIH0gZWxzZSBpZiAoIXVuc2FmZSkge1xuICAgIGRlbGV0ZSBPW2tleV07XG4gIH0gZWxzZSBpZiAoIW5vVGFyZ2V0R2V0ICYmIE9ba2V5XSkge1xuICAgIHNpbXBsZSA9IHRydWU7XG4gIH1cbiAgaWYgKHNpbXBsZSkgT1trZXldID0gdmFsdWU7XG4gIGVsc2UgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KE8sIGtleSwgdmFsdWUpO1xuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyAmJiBnZXRJbnRlcm5hbFN0YXRlKHRoaXMpLnNvdXJjZSB8fCBpbnNwZWN0U291cmNlKHRoaXMpO1xufSk7XG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG4iLCJ2YXIgVE9fU1RSSU5HX1RBR19TVVBQT1JUID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLXN0cmluZy10YWctc3VwcG9ydCcpO1xudmFyIGNsYXNzb2ZSYXcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIFRPX1NUUklOR19UQUcgPSB3ZWxsS25vd25TeW1ib2woJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIENPUlJFQ1RfQVJHVU1FTlRTID0gY2xhc3NvZlJhdyhmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxufTtcblxuLy8gZ2V0dGluZyB0YWcgZnJvbSBFUzYrIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYFxubW9kdWxlLmV4cG9ydHMgPSBUT19TVFJJTkdfVEFHX1NVUFBPUlQgPyBjbGFzc29mUmF3IDogZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCB0YWcsIHJlc3VsdDtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKHRhZyA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVE9fU1RSSU5HX1RBRykpID09ICdzdHJpbmcnID8gdGFnXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBDT1JSRUNUX0FSR1VNRU5UUyA/IGNsYXNzb2ZSYXcoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAocmVzdWx0ID0gY2xhc3NvZlJhdyhPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IHJlc3VsdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgVE9fU1RSSU5HX1RBR19TVVBQT1JUID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLXN0cmluZy10YWctc3VwcG9ydCcpO1xudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZicpO1xuXG4vLyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AgbWV0aG9kIGltcGxlbWVudGF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IFRPX1NUUklOR19UQUdfU1VQUE9SVCA/IHt9LnRvU3RyaW5nIDogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnW29iamVjdCAnICsgY2xhc3NvZih0aGlzKSArICddJztcbn07XG4iLCJ2YXIgVE9fU1RSSU5HX1RBR19TVVBQT1JUID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLXN0cmluZy10YWctc3VwcG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgdG9TdHJpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXRvLXN0cmluZycpO1xuXG4vLyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nXG5pZiAoIVRPX1NUUklOR19UQUdfU1VQUE9SVCkge1xuICByZWRlZmluZShPYmplY3QucHJvdG90eXBlLCAndG9TdHJpbmcnLCB0b1N0cmluZywgeyB1bnNhZmU6IHRydWUgfSk7XG59XG4iLCJ2YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5cbi8vIGBUb0ludGVnZXJgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9pbnRlZ2VyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xuICByZXR1cm4gaXNOYU4oYXJndW1lbnQgPSArYXJndW1lbnQpID8gMCA6IChhcmd1bWVudCA+IDAgPyBmbG9vciA6IGNlaWwpKGFyZ3VtZW50KTtcbn07XG4iLCIvLyBgUmVxdWlyZU9iamVjdENvZXJjaWJsZWAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1yZXF1aXJlb2JqZWN0Y29lcmNpYmxlXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgPT0gdW5kZWZpbmVkKSB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW50ZWdlcicpO1xudmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG5cbi8vIGBTdHJpbmcucHJvdG90eXBlLnsgY29kZVBvaW50QXQsIGF0IH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoQ09OVkVSVF9UT19TVFJJTkcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgcG9zKSB7XG4gICAgdmFyIFMgPSBTdHJpbmcocmVxdWlyZU9iamVjdENvZXJjaWJsZSgkdGhpcykpO1xuICAgIHZhciBwb3NpdGlvbiA9IHRvSW50ZWdlcihwb3MpO1xuICAgIHZhciBzaXplID0gUy5sZW5ndGg7XG4gICAgdmFyIGZpcnN0LCBzZWNvbmQ7XG4gICAgaWYgKHBvc2l0aW9uIDwgMCB8fCBwb3NpdGlvbiA+PSBzaXplKSByZXR1cm4gQ09OVkVSVF9UT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBmaXJzdCA9IFMuY2hhckNvZGVBdChwb3NpdGlvbik7XG4gICAgcmV0dXJuIGZpcnN0IDwgMHhEODAwIHx8IGZpcnN0ID4gMHhEQkZGIHx8IHBvc2l0aW9uICsgMSA9PT0gc2l6ZVxuICAgICAgfHwgKHNlY29uZCA9IFMuY2hhckNvZGVBdChwb3NpdGlvbiArIDEpKSA8IDB4REMwMCB8fCBzZWNvbmQgPiAweERGRkZcbiAgICAgICAgPyBDT05WRVJUX1RPX1NUUklORyA/IFMuY2hhckF0KHBvc2l0aW9uKSA6IGZpcnN0XG4gICAgICAgIDogQ09OVkVSVF9UT19TVFJJTkcgPyBTLnNsaWNlKHBvc2l0aW9uLCBwb3NpdGlvbiArIDIpIDogKGZpcnN0IC0gMHhEODAwIDw8IDEwKSArIChzZWNvbmQgLSAweERDMDApICsgMHgxMDAwMDtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgU3RyaW5nLnByb3RvdHlwZS5jb2RlUG9pbnRBdGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUuY29kZXBvaW50YXRcbiAgY29kZUF0OiBjcmVhdGVNZXRob2QoZmFsc2UpLFxuICAvLyBgU3RyaW5nLnByb3RvdHlwZS5hdGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuYXRcbiAgY2hhckF0OiBjcmVhdGVNZXRob2QodHJ1ZSlcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGUgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG4vLyBOYXNob3JuIH4gSkRLOCBidWdcbnZhciBOQVNIT1JOX0JVRyA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiAhbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh7IDE6IDIgfSwgMSk7XG5cbi8vIGBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlYCBtZXRob2QgaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5wcm90b3R5cGUucHJvcGVydHlpc2VudW1lcmFibGVcbmV4cG9ydHMuZiA9IE5BU0hPUk5fQlVHID8gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoVikge1xuICB2YXIgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLCBWKTtcbiAgcmV0dXJuICEhZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmVudW1lcmFibGU7XG59IDogbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGU7XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YtcmF3Jyk7XG5cbnZhciBzcGxpdCA9ICcnLnNwbGl0O1xuXG4vLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xubW9kdWxlLmV4cG9ydHMgPSBmYWlscyhmdW5jdGlvbiAoKSB7XG4gIC8vIHRocm93cyBhbiBlcnJvciBpbiByaGlubywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3JoaW5vL2lzc3Vlcy8zNDZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICByZXR1cm4gIU9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApO1xufSkgPyBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGNsYXNzb2YoaXQpID09ICdTdHJpbmcnID8gc3BsaXQuY2FsbChpdCwgJycpIDogT2JqZWN0KGl0KTtcbn0gOiBPYmplY3Q7XG4iLCIvLyB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIEluZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5kZXhlZC1vYmplY3QnKTtcbnZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gSW5kZXhlZE9iamVjdChyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGl0KSk7XG59O1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaWU4LWRvbS1kZWZpbmUnKTtcblxudmFyIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbi8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5nZXRvd25wcm9wZXJ0eWRlc2NyaXB0b3JcbmV4cG9ydHMuZiA9IERFU0NSSVBUT1JTID8gbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSW5kZXhlZE9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKCFwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xuIiwidmFyIHBhdGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGF0aCcpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcblxudmFyIGFGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICByZXR1cm4gdHlwZW9mIHZhcmlhYmxlID09ICdmdW5jdGlvbicgPyB2YXJpYWJsZSA6IHVuZGVmaW5lZDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWVzcGFjZSwgbWV0aG9kKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGFGdW5jdGlvbihwYXRoW25hbWVzcGFjZV0pIHx8IGFGdW5jdGlvbihnbG9iYWxbbmFtZXNwYWNlXSlcbiAgICA6IHBhdGhbbmFtZXNwYWNlXSAmJiBwYXRoW25hbWVzcGFjZV1bbWV0aG9kXSB8fCBnbG9iYWxbbmFtZXNwYWNlXSAmJiBnbG9iYWxbbmFtZXNwYWNlXVttZXRob2RdO1xufTtcbiIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW50ZWdlcicpO1xuXG52YXIgbWluID0gTWF0aC5taW47XG5cbi8vIGBUb0xlbmd0aGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b2xlbmd0aFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIGFyZ3VtZW50ID4gMCA/IG1pbih0b0ludGVnZXIoYXJndW1lbnQpLCAweDFGRkZGRkZGRkZGRkZGKSA6IDA7IC8vIDIgKiogNTMgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcblxudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xuXG4vLyBIZWxwZXIgZm9yIGEgcG9wdWxhciByZXBlYXRpbmcgY2FzZSBvZiB0aGUgc3BlYzpcbi8vIExldCBpbnRlZ2VyIGJlID8gVG9JbnRlZ2VyKGluZGV4KS5cbi8vIElmIGludGVnZXIgPCAwLCBsZXQgcmVzdWx0IGJlIG1heCgobGVuZ3RoICsgaW50ZWdlciksIDApOyBlbHNlIGxldCByZXN1bHQgYmUgbWluKGludGVnZXIsIGxlbmd0aCkuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XG4gIHZhciBpbnRlZ2VyID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGludGVnZXIgPCAwID8gbWF4KGludGVnZXIgKyBsZW5ndGgsIDApIDogbWluKGludGVnZXIsIGxlbmd0aCk7XG59O1xuIiwidmFyIHRvSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1hYnNvbHV0ZS1pbmRleCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLnsgaW5kZXhPZiwgaW5jbHVkZXMgfWAgbWV0aG9kcyBpbXBsZW1lbnRhdGlvblxudmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0luZGV4ZWRPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSB7XG4gICAgICBpZiAoKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pICYmIE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXNgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbiAgaW5jbHVkZXM6IGNyZWF0ZU1ldGhvZCh0cnVlKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5pbmRleE9mYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmluZGV4b2ZcbiAgaW5kZXhPZjogY3JlYXRlTWV0aG9kKGZhbHNlKVxufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgaW5kZXhPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1pbmNsdWRlcycpLmluZGV4T2Y7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JbmRleGVkT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSAhaGFzKGhpZGRlbktleXMsIGtleSkgJiYgaGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkgaWYgKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSkge1xuICAgIH5pbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gSUU4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ2NvbnN0cnVjdG9yJyxcbiAgJ2hhc093blByb3BlcnR5JyxcbiAgJ2lzUHJvdG90eXBlT2YnLFxuICAncHJvcGVydHlJc0VudW1lcmFibGUnLFxuICAndG9Mb2NhbGVTdHJpbmcnLFxuICAndG9TdHJpbmcnLFxuICAndmFsdWVPZidcbl07XG4iLCJ2YXIgaW50ZXJuYWxPYmplY3RLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xuXG52YXIgaGlkZGVuS2V5cyA9IGVudW1CdWdLZXlzLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xuXG4vLyBgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmdldG93bnByb3BlcnR5bmFtZXNcbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xuICByZXR1cm4gaW50ZXJuYWxPYmplY3RLZXlzKE8sIGhpZGRlbktleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4iLCJ2YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcbnZhciBnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LW5hbWVzJyk7XG52YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcblxuLy8gYWxsIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBub24tZW51bWVyYWJsZSBhbmQgc3ltYm9sc1xubW9kdWxlLmV4cG9ydHMgPSBnZXRCdWlsdEluKCdSZWZsZWN0JywgJ293bktleXMnKSB8fCBmdW5jdGlvbiBvd25LZXlzKGl0KSB7XG4gIHZhciBrZXlzID0gZ2V0T3duUHJvcGVydHlOYW1lc01vZHVsZS5mKGFuT2JqZWN0KGl0KSk7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUuZjtcbiAgcmV0dXJuIGdldE93blByb3BlcnR5U3ltYm9scyA/IGtleXMuY29uY2F0KGdldE93blByb3BlcnR5U3ltYm9scyhpdCkpIDoga2V5cztcbn07XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIG93bktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb3duLWtleXMnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgdmFyIGtleXMgPSBvd25LZXlzKHNvdXJjZSk7XG4gIHZhciBkZWZpbmVQcm9wZXJ0eSA9IGRlZmluZVByb3BlcnR5TW9kdWxlLmY7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUuZjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgaWYgKCFoYXModGFyZ2V0LCBrZXkpKSBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7XG4gIH1cbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxudmFyIHJlcGxhY2VtZW50ID0gLyN8XFwucHJvdG90eXBlXFwuLztcblxudmFyIGlzRm9yY2VkID0gZnVuY3Rpb24gKGZlYXR1cmUsIGRldGVjdGlvbikge1xuICB2YXIgdmFsdWUgPSBkYXRhW25vcm1hbGl6ZShmZWF0dXJlKV07XG4gIHJldHVybiB2YWx1ZSA9PSBQT0xZRklMTCA/IHRydWVcbiAgICA6IHZhbHVlID09IE5BVElWRSA/IGZhbHNlXG4gICAgOiB0eXBlb2YgZGV0ZWN0aW9uID09ICdmdW5jdGlvbicgPyBmYWlscyhkZXRlY3Rpb24pXG4gICAgOiAhIWRldGVjdGlvbjtcbn07XG5cbnZhciBub3JtYWxpemUgPSBpc0ZvcmNlZC5ub3JtYWxpemUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlcGxhY2VtZW50LCAnLicpLnRvTG93ZXJDYXNlKCk7XG59O1xuXG52YXIgZGF0YSA9IGlzRm9yY2VkLmRhdGEgPSB7fTtcbnZhciBOQVRJVkUgPSBpc0ZvcmNlZC5OQVRJVkUgPSAnTic7XG52YXIgUE9MWUZJTEwgPSBpc0ZvcmNlZC5QT0xZRklMTCA9ICdQJztcblxubW9kdWxlLmV4cG9ydHMgPSBpc0ZvcmNlZDtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKS5mO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgY29weUNvbnN0cnVjdG9yUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jb3B5LWNvbnN0cnVjdG9yLXByb3BlcnRpZXMnKTtcbnZhciBpc0ZvcmNlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1mb3JjZWQnKTtcblxuLypcbiAgb3B0aW9ucy50YXJnZXQgICAgICAtIG5hbWUgb2YgdGhlIHRhcmdldCBvYmplY3RcbiAgb3B0aW9ucy5nbG9iYWwgICAgICAtIHRhcmdldCBpcyB0aGUgZ2xvYmFsIG9iamVjdFxuICBvcHRpb25zLnN0YXQgICAgICAgIC0gZXhwb3J0IGFzIHN0YXRpYyBtZXRob2RzIG9mIHRhcmdldFxuICBvcHRpb25zLnByb3RvICAgICAgIC0gZXhwb3J0IGFzIHByb3RvdHlwZSBtZXRob2RzIG9mIHRhcmdldFxuICBvcHRpb25zLnJlYWwgICAgICAgIC0gcmVhbCBwcm90b3R5cGUgbWV0aG9kIGZvciB0aGUgYHB1cmVgIHZlcnNpb25cbiAgb3B0aW9ucy5mb3JjZWQgICAgICAtIGV4cG9ydCBldmVuIGlmIHRoZSBuYXRpdmUgZmVhdHVyZSBpcyBhdmFpbGFibGVcbiAgb3B0aW9ucy5iaW5kICAgICAgICAtIGJpbmQgbWV0aG9kcyB0byB0aGUgdGFyZ2V0LCByZXF1aXJlZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMud3JhcCAgICAgICAgLSB3cmFwIGNvbnN0cnVjdG9ycyB0byBwcmV2ZW50aW5nIGdsb2JhbCBwb2xsdXRpb24sIHJlcXVpcmVkIGZvciB0aGUgYHB1cmVgIHZlcnNpb25cbiAgb3B0aW9ucy51bnNhZmUgICAgICAtIHVzZSB0aGUgc2ltcGxlIGFzc2lnbm1lbnQgb2YgcHJvcGVydHkgaW5zdGVhZCBvZiBkZWxldGUgKyBkZWZpbmVQcm9wZXJ0eVxuICBvcHRpb25zLnNoYW0gICAgICAgIC0gYWRkIGEgZmxhZyB0byBub3QgY29tcGxldGVseSBmdWxsIHBvbHlmaWxsc1xuICBvcHRpb25zLmVudW1lcmFibGUgIC0gZXhwb3J0IGFzIGVudW1lcmFibGUgcHJvcGVydHlcbiAgb3B0aW9ucy5ub1RhcmdldEdldCAtIHByZXZlbnQgY2FsbGluZyBhIGdldHRlciBvbiB0YXJnZXRcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBzb3VyY2UpIHtcbiAgdmFyIFRBUkdFVCA9IG9wdGlvbnMudGFyZ2V0O1xuICB2YXIgR0xPQkFMID0gb3B0aW9ucy5nbG9iYWw7XG4gIHZhciBTVEFUSUMgPSBvcHRpb25zLnN0YXQ7XG4gIHZhciBGT1JDRUQsIHRhcmdldCwga2V5LCB0YXJnZXRQcm9wZXJ0eSwgc291cmNlUHJvcGVydHksIGRlc2NyaXB0b3I7XG4gIGlmIChHTE9CQUwpIHtcbiAgICB0YXJnZXQgPSBnbG9iYWw7XG4gIH0gZWxzZSBpZiAoU1RBVElDKSB7XG4gICAgdGFyZ2V0ID0gZ2xvYmFsW1RBUkdFVF0gfHwgc2V0R2xvYmFsKFRBUkdFVCwge30pO1xuICB9IGVsc2Uge1xuICAgIHRhcmdldCA9IChnbG9iYWxbVEFSR0VUXSB8fCB7fSkucHJvdG90eXBlO1xuICB9XG4gIGlmICh0YXJnZXQpIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIHNvdXJjZVByb3BlcnR5ID0gc291cmNlW2tleV07XG4gICAgaWYgKG9wdGlvbnMubm9UYXJnZXRHZXQpIHtcbiAgICAgIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpO1xuICAgICAgdGFyZ2V0UHJvcGVydHkgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IudmFsdWU7XG4gICAgfSBlbHNlIHRhcmdldFByb3BlcnR5ID0gdGFyZ2V0W2tleV07XG4gICAgRk9SQ0VEID0gaXNGb3JjZWQoR0xPQkFMID8ga2V5IDogVEFSR0VUICsgKFNUQVRJQyA/ICcuJyA6ICcjJykgKyBrZXksIG9wdGlvbnMuZm9yY2VkKTtcbiAgICAvLyBjb250YWluZWQgaW4gdGFyZ2V0XG4gICAgaWYgKCFGT1JDRUQgJiYgdGFyZ2V0UHJvcGVydHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2VQcm9wZXJ0eSA9PT0gdHlwZW9mIHRhcmdldFByb3BlcnR5KSBjb250aW51ZTtcbiAgICAgIGNvcHlDb25zdHJ1Y3RvclByb3BlcnRpZXMoc291cmNlUHJvcGVydHksIHRhcmdldFByb3BlcnR5KTtcbiAgICB9XG4gICAgLy8gYWRkIGEgZmxhZyB0byBub3QgY29tcGxldGVseSBmdWxsIHBvbHlmaWxsc1xuICAgIGlmIChvcHRpb25zLnNoYW0gfHwgKHRhcmdldFByb3BlcnR5ICYmIHRhcmdldFByb3BlcnR5LnNoYW0pKSB7XG4gICAgICBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoc291cmNlUHJvcGVydHksICdzaGFtJywgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICByZWRlZmluZSh0YXJnZXQsIGtleSwgc291cmNlUHJvcGVydHksIG9wdGlvbnMpO1xuICB9XG59O1xuIiwidmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG5cbi8vIGBUb09iamVjdGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b29iamVjdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIE9iamVjdChyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KSk7XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRigpIHsgLyogZW1wdHkgKi8gfVxuICBGLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IG51bGw7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YobmV3IEYoKSkgIT09IEYucHJvdG90eXBlO1xufSk7XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLW9iamVjdCcpO1xudmFyIHNoYXJlZEtleSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQta2V5Jyk7XG52YXIgQ09SUkVDVF9QUk9UT1RZUEVfR0VUVEVSID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NvcnJlY3QtcHJvdG90eXBlLWdldHRlcicpO1xuXG52YXIgSUVfUFJPVE8gPSBzaGFyZWRLZXkoJ0lFX1BST1RPJyk7XG52YXIgT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLy8gYE9iamVjdC5nZXRQcm90b3R5cGVPZmAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuZ2V0cHJvdG90eXBlb2Zcbm1vZHVsZS5leHBvcnRzID0gQ09SUkVDVF9QUk9UT1RZUEVfR0VUVEVSID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gKE8pIHtcbiAgTyA9IHRvT2JqZWN0KE8pO1xuICBpZiAoaGFzKE8sIElFX1BST1RPKSkgcmV0dXJuIE9bSUVfUFJPVE9dO1xuICBpZiAodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvdHlwZSA6IG51bGw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciBJU19QVVJFID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLXB1cmUnKTtcblxudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xudmFyIEJVR0dZX1NBRkFSSV9JVEVSQVRPUlMgPSBmYWxzZTtcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9O1xuXG4vLyBgJUl0ZXJhdG9yUHJvdG90eXBlJWAgb2JqZWN0XG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy0laXRlcmF0b3Jwcm90b3R5cGUlLW9iamVjdFxudmFyIEl0ZXJhdG9yUHJvdG90eXBlLCBQcm90b3R5cGVPZkFycmF5SXRlcmF0b3JQcm90b3R5cGUsIGFycmF5SXRlcmF0b3I7XG5cbmlmIChbXS5rZXlzKSB7XG4gIGFycmF5SXRlcmF0b3IgPSBbXS5rZXlzKCk7XG4gIC8vIFNhZmFyaSA4IGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxuICBpZiAoISgnbmV4dCcgaW4gYXJyYXlJdGVyYXRvcikpIEJVR0dZX1NBRkFSSV9JVEVSQVRPUlMgPSB0cnVlO1xuICBlbHNlIHtcbiAgICBQcm90b3R5cGVPZkFycmF5SXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90b3R5cGVPZihnZXRQcm90b3R5cGVPZihhcnJheUl0ZXJhdG9yKSk7XG4gICAgaWYgKFByb3RvdHlwZU9mQXJyYXlJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSkgSXRlcmF0b3JQcm90b3R5cGUgPSBQcm90b3R5cGVPZkFycmF5SXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cbn1cblxuaWYgKEl0ZXJhdG9yUHJvdG90eXBlID09IHVuZGVmaW5lZCkgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbmlmICghSVNfUFVSRSAmJiAhaGFzKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUikpIHtcbiAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBJdGVyYXRvclByb3RvdHlwZTogSXRlcmF0b3JQcm90b3R5cGUsXG4gIEJVR0dZX1NBRkFSSV9JVEVSQVRPUlM6IEJVR0dZX1NBRkFSSV9JVEVSQVRPUlNcbn07XG4iLCJ2YXIgaW50ZXJuYWxPYmplY3RLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xuXG4vLyBgT2JqZWN0LmtleXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmtleXNcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKSB7XG4gIHJldHVybiBpbnRlcm5hbE9iamVjdEtleXMoTywgZW51bUJ1Z0tleXMpO1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1rZXlzJyk7XG5cbi8vIGBPYmplY3QuZGVmaW5lUHJvcGVydGllc2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuZGVmaW5lcHJvcGVydGllc1xubW9kdWxlLmV4cG9ydHMgPSBERVNDUklQVE9SUyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICB2YXIga2V5cyA9IG9iamVjdEtleXMoUHJvcGVydGllcyk7XG4gIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKGxlbmd0aCA+IGluZGV4KSBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mKE8sIGtleSA9IGtleXNbaW5kZXgrK10sIFByb3BlcnRpZXNba2V5XSk7XG4gIHJldHVybiBPO1xufTtcbiIsInZhciBnZXRCdWlsdEluID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dldC1idWlsdC1pbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEJ1aWx0SW4oJ2RvY3VtZW50JywgJ2RvY3VtZW50RWxlbWVudCcpO1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGRlZmluZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0aWVzJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZGVuLWtleXMnKTtcbnZhciBodG1sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2h0bWwnKTtcbnZhciBkb2N1bWVudENyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9jdW1lbnQtY3JlYXRlLWVsZW1lbnQnKTtcbnZhciBzaGFyZWRLZXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkLWtleScpO1xuXG52YXIgR1QgPSAnPic7XG52YXIgTFQgPSAnPCc7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgU0NSSVBUID0gJ3NjcmlwdCc7XG52YXIgSUVfUFJPVE8gPSBzaGFyZWRLZXkoJ0lFX1BST1RPJyk7XG5cbnZhciBFbXB0eUNvbnN0cnVjdG9yID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xuXG52YXIgc2NyaXB0VGFnID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgcmV0dXJuIExUICsgU0NSSVBUICsgR1QgKyBjb250ZW50ICsgTFQgKyAnLycgKyBTQ1JJUFQgKyBHVDtcbn07XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBBY3RpdmVYIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgTnVsbFByb3RvT2JqZWN0VmlhQWN0aXZlWCA9IGZ1bmN0aW9uIChhY3RpdmVYRG9jdW1lbnQpIHtcbiAgYWN0aXZlWERvY3VtZW50LndyaXRlKHNjcmlwdFRhZygnJykpO1xuICBhY3RpdmVYRG9jdW1lbnQuY2xvc2UoKTtcbiAgdmFyIHRlbXAgPSBhY3RpdmVYRG9jdW1lbnQucGFyZW50V2luZG93Lk9iamVjdDtcbiAgYWN0aXZlWERvY3VtZW50ID0gbnVsbDsgLy8gYXZvaWQgbWVtb3J5IGxlYWtcbiAgcmV0dXJuIHRlbXA7XG59O1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgTnVsbFByb3RvT2JqZWN0VmlhSUZyYW1lID0gZnVuY3Rpb24gKCkge1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gZG9jdW1lbnRDcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdmFyIEpTID0gJ2phdmEnICsgU0NSSVBUICsgJzonO1xuICB2YXIgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBodG1sLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy80NzVcbiAgaWZyYW1lLnNyYyA9IFN0cmluZyhKUyk7XG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUoc2NyaXB0VGFnKCdkb2N1bWVudC5GPU9iamVjdCcpKTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgcmV0dXJuIGlmcmFtZURvY3VtZW50LkY7XG59O1xuXG4vLyBDaGVjayBmb3IgZG9jdW1lbnQuZG9tYWluIGFuZCBhY3RpdmUgeCBzdXBwb3J0XG4vLyBObyBuZWVkIHRvIHVzZSBhY3RpdmUgeCBhcHByb2FjaCB3aGVuIGRvY3VtZW50LmRvbWFpbiBpcyBub3Qgc2V0XG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2VzLXNoaW1zL2VzNS1zaGltL2lzc3Vlcy8xNTBcbi8vIHZhcmlhdGlvbiBvZiBodHRwczovL2dpdGh1Yi5jb20va2l0Y2FtYnJpZGdlL2VzNS1zaGltL2NvbW1pdC80ZjczOGFjMDY2MzQ2XG4vLyBhdm9pZCBJRSBHQyBidWdcbnZhciBhY3RpdmVYRG9jdW1lbnQ7XG52YXIgTnVsbFByb3RvT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIC8qIGdsb2JhbCBBY3RpdmVYT2JqZWN0ICovXG4gICAgYWN0aXZlWERvY3VtZW50ID0gZG9jdW1lbnQuZG9tYWluICYmIG5ldyBBY3RpdmVYT2JqZWN0KCdodG1sZmlsZScpO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBpZ25vcmUgKi8gfVxuICBOdWxsUHJvdG9PYmplY3QgPSBhY3RpdmVYRG9jdW1lbnQgPyBOdWxsUHJvdG9PYmplY3RWaWFBY3RpdmVYKGFjdGl2ZVhEb2N1bWVudCkgOiBOdWxsUHJvdG9PYmplY3RWaWFJRnJhbWUoKTtcbiAgdmFyIGxlbmd0aCA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSBkZWxldGUgTnVsbFByb3RvT2JqZWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbbGVuZ3RoXV07XG4gIHJldHVybiBOdWxsUHJvdG9PYmplY3QoKTtcbn07XG5cbmhpZGRlbktleXNbSUVfUFJPVE9dID0gdHJ1ZTtcblxuLy8gYE9iamVjdC5jcmVhdGVgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmNyZWF0ZVxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlDb25zdHJ1Y3RvcltQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5Q29uc3RydWN0b3IoKTtcbiAgICBFbXB0eUNvbnN0cnVjdG9yW1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IE51bGxQcm90b09iamVjdCgpO1xuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZGVmaW5lUHJvcGVydGllcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcbiIsInZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5JykuZjtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBUT19TVFJJTkdfVEFHID0gd2VsbEtub3duU3ltYm9sKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgVEFHLCBTVEFUSUMpIHtcbiAgaWYgKGl0ICYmICFoYXMoaXQgPSBTVEFUSUMgPyBpdCA6IGl0LnByb3RvdHlwZSwgVE9fU1RSSU5HX1RBRykpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShpdCwgVE9fU1RSSU5HX1RBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBUQUcgfSk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHt9O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIEl0ZXJhdG9yUHJvdG90eXBlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycy1jb3JlJykuSXRlcmF0b3JQcm90b3R5cGU7XG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1jcmVhdGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMnKTtcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJdGVyYXRvckNvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KSB7XG4gIHZhciBUT19TVFJJTkdfVEFHID0gTkFNRSArICcgSXRlcmF0b3InO1xuICBJdGVyYXRvckNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSwgeyBuZXh0OiBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoMSwgbmV4dCkgfSk7XG4gIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yQ29uc3RydWN0b3IsIFRPX1NUUklOR19UQUcsIGZhbHNlLCB0cnVlKTtcbiAgSXRlcmF0b3JzW1RPX1NUUklOR19UQUddID0gcmV0dXJuVGhpcztcbiAgcmV0dXJuIEl0ZXJhdG9yQ29uc3RydWN0b3I7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSAmJiBpdCAhPT0gbnVsbCkge1xuICAgIHRocm93IFR5cGVFcnJvcihcIkNhbid0IHNldCBcIiArIFN0cmluZyhpdCkgKyAnIGFzIGEgcHJvdG90eXBlJyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBhUG9zc2libGVQcm90b3R5cGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1wb3NzaWJsZS1wcm90b3R5cGUnKTtcblxuLy8gYE9iamVjdC5zZXRQcm90b3R5cGVPZmAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3Quc2V0cHJvdG90eXBlb2Zcbi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8ICgnX19wcm90b19fJyBpbiB7fSA/IGZ1bmN0aW9uICgpIHtcbiAgdmFyIENPUlJFQ1RfU0VUVEVSID0gZmFsc2U7XG4gIHZhciB0ZXN0ID0ge307XG4gIHZhciBzZXR0ZXI7XG4gIHRyeSB7XG4gICAgc2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0O1xuICAgIHNldHRlci5jYWxsKHRlc3QsIFtdKTtcbiAgICBDT1JSRUNUX1NFVFRFUiA9IHRlc3QgaW5zdGFuY2VvZiBBcnJheTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pIHtcbiAgICBhbk9iamVjdChPKTtcbiAgICBhUG9zc2libGVQcm90b3R5cGUocHJvdG8pO1xuICAgIGlmIChDT1JSRUNUX1NFVFRFUikgc2V0dGVyLmNhbGwoTywgcHJvdG8pO1xuICAgIGVsc2UgTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICByZXR1cm4gTztcbiAgfTtcbn0oKSA6IHVuZGVmaW5lZCk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBjcmVhdGVJdGVyYXRvckNvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1pdGVyYXRvci1jb25zdHJ1Y3RvcicpO1xudmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXNldC1wcm90b3R5cGUtb2YnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMnKTtcbnZhciBJdGVyYXRvcnNDb3JlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycy1jb3JlJyk7XG5cbnZhciBJdGVyYXRvclByb3RvdHlwZSA9IEl0ZXJhdG9yc0NvcmUuSXRlcmF0b3JQcm90b3R5cGU7XG52YXIgQlVHR1lfU0FGQVJJX0lURVJBVE9SUyA9IEl0ZXJhdG9yc0NvcmUuQlVHR1lfU0FGQVJJX0lURVJBVE9SUztcbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcbnZhciBLRVlTID0gJ2tleXMnO1xudmFyIFZBTFVFUyA9ICd2YWx1ZXMnO1xudmFyIEVOVFJJRVMgPSAnZW50cmllcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoSXRlcmFibGUsIE5BTUUsIEl0ZXJhdG9yQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKSB7XG4gIGNyZWF0ZUl0ZXJhdG9yQ29uc3RydWN0b3IoSXRlcmF0b3JDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG5cbiAgdmFyIGdldEl0ZXJhdGlvbk1ldGhvZCA9IGZ1bmN0aW9uIChLSU5EKSB7XG4gICAgaWYgKEtJTkQgPT09IERFRkFVTFQgJiYgZGVmYXVsdEl0ZXJhdG9yKSByZXR1cm4gZGVmYXVsdEl0ZXJhdG9yO1xuICAgIGlmICghQlVHR1lfU0FGQVJJX0lURVJBVE9SUyAmJiBLSU5EIGluIEl0ZXJhYmxlUHJvdG90eXBlKSByZXR1cm4gSXRlcmFibGVQcm90b3R5cGVbS0lORF07XG4gICAgc3dpdGNoIChLSU5EKSB7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCkgeyByZXR1cm4gbmV3IEl0ZXJhdG9yQ29uc3RydWN0b3IodGhpcywgS0lORCk7IH07XG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpIHsgcmV0dXJuIG5ldyBJdGVyYXRvckNvbnN0cnVjdG9yKHRoaXMsIEtJTkQpOyB9O1xuICAgICAgY2FzZSBFTlRSSUVTOiByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpIHsgcmV0dXJuIG5ldyBJdGVyYXRvckNvbnN0cnVjdG9yKHRoaXMsIEtJTkQpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBJdGVyYXRvckNvbnN0cnVjdG9yKHRoaXMpOyB9O1xuICB9O1xuXG4gIHZhciBUT19TVFJJTkdfVEFHID0gTkFNRSArICcgSXRlcmF0b3InO1xuICB2YXIgSU5DT1JSRUNUX1ZBTFVFU19OQU1FID0gZmFsc2U7XG4gIHZhciBJdGVyYWJsZVByb3RvdHlwZSA9IEl0ZXJhYmxlLnByb3RvdHlwZTtcbiAgdmFyIG5hdGl2ZUl0ZXJhdG9yID0gSXRlcmFibGVQcm90b3R5cGVbSVRFUkFUT1JdXG4gICAgfHwgSXRlcmFibGVQcm90b3R5cGVbJ0BAaXRlcmF0b3InXVxuICAgIHx8IERFRkFVTFQgJiYgSXRlcmFibGVQcm90b3R5cGVbREVGQVVMVF07XG4gIHZhciBkZWZhdWx0SXRlcmF0b3IgPSAhQlVHR1lfU0FGQVJJX0lURVJBVE9SUyAmJiBuYXRpdmVJdGVyYXRvciB8fCBnZXRJdGVyYXRpb25NZXRob2QoREVGQVVMVCk7XG4gIHZhciBhbnlOYXRpdmVJdGVyYXRvciA9IE5BTUUgPT0gJ0FycmF5JyA/IEl0ZXJhYmxlUHJvdG90eXBlLmVudHJpZXMgfHwgbmF0aXZlSXRlcmF0b3IgOiBuYXRpdmVJdGVyYXRvcjtcbiAgdmFyIEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSwgbWV0aG9kcywgS0VZO1xuXG4gIC8vIGZpeCBuYXRpdmVcbiAgaWYgKGFueU5hdGl2ZUl0ZXJhdG9yKSB7XG4gICAgQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoYW55TmF0aXZlSXRlcmF0b3IuY2FsbChuZXcgSXRlcmFibGUoKSkpO1xuICAgIGlmIChJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSAmJiBDdXJyZW50SXRlcmF0b3JQcm90b3R5cGUubmV4dCkge1xuICAgICAgaWYgKCFJU19QVVJFICYmIGdldFByb3RvdHlwZU9mKEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSkgIT09IEl0ZXJhdG9yUHJvdG90eXBlKSB7XG4gICAgICAgIGlmIChzZXRQcm90b3R5cGVPZikge1xuICAgICAgICAgIHNldFByb3RvdHlwZU9mKEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSwgSXRlcmF0b3JQcm90b3R5cGUpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBDdXJyZW50SXRlcmF0b3JQcm90b3R5cGVbSVRFUkFUT1JdICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICAgIHNldFRvU3RyaW5nVGFnKEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSwgVE9fU1RSSU5HX1RBRywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBpZiAoSVNfUFVSRSkgSXRlcmF0b3JzW1RPX1NUUklOR19UQUddID0gcmV0dXJuVGhpcztcbiAgICB9XG4gIH1cblxuICAvLyBmaXggQXJyYXkje3ZhbHVlcywgQEBpdGVyYXRvcn0ubmFtZSBpbiBWOCAvIEZGXG4gIGlmIChERUZBVUxUID09IFZBTFVFUyAmJiBuYXRpdmVJdGVyYXRvciAmJiBuYXRpdmVJdGVyYXRvci5uYW1lICE9PSBWQUxVRVMpIHtcbiAgICBJTkNPUlJFQ1RfVkFMVUVTX05BTUUgPSB0cnVlO1xuICAgIGRlZmF1bHRJdGVyYXRvciA9IGZ1bmN0aW9uIHZhbHVlcygpIHsgcmV0dXJuIG5hdGl2ZUl0ZXJhdG9yLmNhbGwodGhpcyk7IH07XG4gIH1cblxuICAvLyBkZWZpbmUgaXRlcmF0b3JcbiAgaWYgKCghSVNfUFVSRSB8fCBGT1JDRUQpICYmIEl0ZXJhYmxlUHJvdG90eXBlW0lURVJBVE9SXSAhPT0gZGVmYXVsdEl0ZXJhdG9yKSB7XG4gICAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KEl0ZXJhYmxlUHJvdG90eXBlLCBJVEVSQVRPUiwgZGVmYXVsdEl0ZXJhdG9yKTtcbiAgfVxuICBJdGVyYXRvcnNbTkFNRV0gPSBkZWZhdWx0SXRlcmF0b3I7XG5cbiAgLy8gZXhwb3J0IGFkZGl0aW9uYWwgbWV0aG9kc1xuICBpZiAoREVGQVVMVCkge1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6IGdldEl0ZXJhdGlvbk1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogSVNfU0VUID8gZGVmYXVsdEl0ZXJhdG9yIDogZ2V0SXRlcmF0aW9uTWV0aG9kKEtFWVMpLFxuICAgICAgZW50cmllczogZ2V0SXRlcmF0aW9uTWV0aG9kKEVOVFJJRVMpXG4gICAgfTtcbiAgICBpZiAoRk9SQ0VEKSBmb3IgKEtFWSBpbiBtZXRob2RzKSB7XG4gICAgICBpZiAoQlVHR1lfU0FGQVJJX0lURVJBVE9SUyB8fCBJTkNPUlJFQ1RfVkFMVUVTX05BTUUgfHwgIShLRVkgaW4gSXRlcmFibGVQcm90b3R5cGUpKSB7XG4gICAgICAgIHJlZGVmaW5lKEl0ZXJhYmxlUHJvdG90eXBlLCBLRVksIG1ldGhvZHNbS0VZXSk7XG4gICAgICB9XG4gICAgfSBlbHNlICQoeyB0YXJnZXQ6IE5BTUUsIHByb3RvOiB0cnVlLCBmb3JjZWQ6IEJVR0dZX1NBRkFSSV9JVEVSQVRPUlMgfHwgSU5DT1JSRUNUX1ZBTFVFU19OQU1FIH0sIG1ldGhvZHMpO1xuICB9XG5cbiAgcmV0dXJuIG1ldGhvZHM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNoYXJBdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zdHJpbmctbXVsdGlieXRlJykuY2hhckF0O1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcbnZhciBkZWZpbmVJdGVyYXRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZWZpbmUtaXRlcmF0b3InKTtcblxudmFyIFNUUklOR19JVEVSQVRPUiA9ICdTdHJpbmcgSXRlcmF0b3InO1xudmFyIHNldEludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLnNldDtcbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXR0ZXJGb3IoU1RSSU5HX0lURVJBVE9SKTtcblxuLy8gYFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl1gIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS1AQGl0ZXJhdG9yXG5kZWZpbmVJdGVyYXRvcihTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbiAoaXRlcmF0ZWQpIHtcbiAgc2V0SW50ZXJuYWxTdGF0ZSh0aGlzLCB7XG4gICAgdHlwZTogU1RSSU5HX0lURVJBVE9SLFxuICAgIHN0cmluZzogU3RyaW5nKGl0ZXJhdGVkKSxcbiAgICBpbmRleDogMFxuICB9KTtcbi8vIGAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHRgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtJXN0cmluZ2l0ZXJhdG9ycHJvdG90eXBlJS5uZXh0XG59LCBmdW5jdGlvbiBuZXh0KCkge1xuICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFN0YXRlKHRoaXMpO1xuICB2YXIgc3RyaW5nID0gc3RhdGUuc3RyaW5nO1xuICB2YXIgaW5kZXggPSBzdGF0ZS5pbmRleDtcbiAgdmFyIHBvaW50O1xuICBpZiAoaW5kZXggPj0gc3RyaW5nLmxlbmd0aCkgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICBwb2ludCA9IGNoYXJBdChzdHJpbmcsIGluZGV4KTtcbiAgc3RhdGUuaW5kZXggKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4geyB2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlIH07XG59KTtcbiIsIi8vIGl0ZXJhYmxlIERPTSBjb2xsZWN0aW9uc1xuLy8gZmxhZyAtIGBpdGVyYWJsZWAgaW50ZXJmYWNlIC0gJ2VudHJpZXMnLCAna2V5cycsICd2YWx1ZXMnLCAnZm9yRWFjaCcgbWV0aG9kc1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENTU1J1bGVMaXN0OiAwLFxuICBDU1NTdHlsZURlY2xhcmF0aW9uOiAwLFxuICBDU1NWYWx1ZUxpc3Q6IDAsXG4gIENsaWVudFJlY3RMaXN0OiAwLFxuICBET01SZWN0TGlzdDogMCxcbiAgRE9NU3RyaW5nTGlzdDogMCxcbiAgRE9NVG9rZW5MaXN0OiAxLFxuICBEYXRhVHJhbnNmZXJJdGVtTGlzdDogMCxcbiAgRmlsZUxpc3Q6IDAsXG4gIEhUTUxBbGxDb2xsZWN0aW9uOiAwLFxuICBIVE1MQ29sbGVjdGlvbjogMCxcbiAgSFRNTEZvcm1FbGVtZW50OiAwLFxuICBIVE1MU2VsZWN0RWxlbWVudDogMCxcbiAgTWVkaWFMaXN0OiAwLFxuICBNaW1lVHlwZUFycmF5OiAwLFxuICBOYW1lZE5vZGVNYXA6IDAsXG4gIE5vZGVMaXN0OiAxLFxuICBQYWludFJlcXVlc3RMaXN0OiAwLFxuICBQbHVnaW46IDAsXG4gIFBsdWdpbkFycmF5OiAwLFxuICBTVkdMZW5ndGhMaXN0OiAwLFxuICBTVkdOdW1iZXJMaXN0OiAwLFxuICBTVkdQYXRoU2VnTGlzdDogMCxcbiAgU1ZHUG9pbnRMaXN0OiAwLFxuICBTVkdTdHJpbmdMaXN0OiAwLFxuICBTVkdUcmFuc2Zvcm1MaXN0OiAwLFxuICBTb3VyY2VCdWZmZXJMaXN0OiAwLFxuICBTdHlsZVNoZWV0TGlzdDogMCxcbiAgVGV4dFRyYWNrQ3VlTGlzdDogMCxcbiAgVGV4dFRyYWNrTGlzdDogMCxcbiAgVG91Y2hMaXN0OiAwXG59O1xuIiwidmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtY3JlYXRlJyk7XG52YXIgZGVmaW5lUHJvcGVydHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpO1xuXG52YXIgVU5TQ09QQUJMRVMgPSB3ZWxsS25vd25TeW1ib2woJ3Vuc2NvcGFibGVzJyk7XG52YXIgQXJyYXlQcm90b3R5cGUgPSBBcnJheS5wcm90b3R5cGU7XG5cbi8vIEFycmF5LnByb3RvdHlwZVtAQHVuc2NvcGFibGVzXVxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLUBAdW5zY29wYWJsZXNcbmlmIChBcnJheVByb3RvdHlwZVtVTlNDT1BBQkxFU10gPT0gdW5kZWZpbmVkKSB7XG4gIGRlZmluZVByb3BlcnR5TW9kdWxlLmYoQXJyYXlQcm90b3R5cGUsIFVOU0NPUEFCTEVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBjcmVhdGUobnVsbClcbiAgfSk7XG59XG5cbi8vIGFkZCBhIGtleSB0byBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICBBcnJheVByb3RvdHlwZVtVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRvSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdCcpO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYWRkLXRvLXVuc2NvcGFibGVzJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycycpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcbnZhciBkZWZpbmVJdGVyYXRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZWZpbmUtaXRlcmF0b3InKTtcblxudmFyIEFSUkFZX0lURVJBVE9SID0gJ0FycmF5IEl0ZXJhdG9yJztcbnZhciBzZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5zZXQ7XG52YXIgZ2V0SW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZ2V0dGVyRm9yKEFSUkFZX0lURVJBVE9SKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS5lbnRyaWVzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5lbnRyaWVzXG4vLyBgQXJyYXkucHJvdG90eXBlLmtleXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmtleXNcbi8vIGBBcnJheS5wcm90b3R5cGUudmFsdWVzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS52YWx1ZXNcbi8vIGBBcnJheS5wcm90b3R5cGVbQEBpdGVyYXRvcl1gIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLUBAaXRlcmF0b3Jcbi8vIGBDcmVhdGVBcnJheUl0ZXJhdG9yYCBpbnRlcm5hbCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWNyZWF0ZWFycmF5aXRlcmF0b3Jcbm1vZHVsZS5leHBvcnRzID0gZGVmaW5lSXRlcmF0b3IoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uIChpdGVyYXRlZCwga2luZCkge1xuICBzZXRJbnRlcm5hbFN0YXRlKHRoaXMsIHtcbiAgICB0eXBlOiBBUlJBWV9JVEVSQVRPUixcbiAgICB0YXJnZXQ6IHRvSW5kZXhlZE9iamVjdChpdGVyYXRlZCksIC8vIHRhcmdldFxuICAgIGluZGV4OiAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICAgIGtpbmQ6IGtpbmQgICAgICAgICAgICAgICAgICAgICAgICAgLy8ga2luZFxuICB9KTtcbi8vIGAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dGAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy0lYXJyYXlpdGVyYXRvcnByb3RvdHlwZSUubmV4dFxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFN0YXRlKHRoaXMpO1xuICB2YXIgdGFyZ2V0ID0gc3RhdGUudGFyZ2V0O1xuICB2YXIga2luZCA9IHN0YXRlLmtpbmQ7XG4gIHZhciBpbmRleCA9IHN0YXRlLmluZGV4Kys7XG4gIGlmICghdGFyZ2V0IHx8IGluZGV4ID49IHRhcmdldC5sZW5ndGgpIHtcbiAgICBzdGF0ZS50YXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG4gIGlmIChraW5kID09ICdrZXlzJykgcmV0dXJuIHsgdmFsdWU6IGluZGV4LCBkb25lOiBmYWxzZSB9O1xuICBpZiAoa2luZCA9PSAndmFsdWVzJykgcmV0dXJuIHsgdmFsdWU6IHRhcmdldFtpbmRleF0sIGRvbmU6IGZhbHNlIH07XG4gIHJldHVybiB7IHZhbHVlOiBbaW5kZXgsIHRhcmdldFtpbmRleF1dLCBkb25lOiBmYWxzZSB9O1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyVcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWNyZWF0ZXVubWFwcGVkYXJndW1lbnRzb2JqZWN0XG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1jcmVhdGVtYXBwZWRhcmd1bWVudHNvYmplY3Rcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS1AQHVuc2NvcGFibGVzXG5hZGRUb1Vuc2NvcGFibGVzKCdrZXlzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCd2YWx1ZXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ2VudHJpZXMnKTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgRE9NSXRlcmFibGVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMnKTtcbnZhciBBcnJheUl0ZXJhdG9yTWV0aG9kcyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZXMuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcbnZhciBUT19TVFJJTkdfVEFHID0gd2VsbEtub3duU3ltYm9sKCd0b1N0cmluZ1RhZycpO1xudmFyIEFycmF5VmFsdWVzID0gQXJyYXlJdGVyYXRvck1ldGhvZHMudmFsdWVzO1xuXG5mb3IgKHZhciBDT0xMRUNUSU9OX05BTUUgaW4gRE9NSXRlcmFibGVzKSB7XG4gIHZhciBDb2xsZWN0aW9uID0gZ2xvYmFsW0NPTExFQ1RJT05fTkFNRV07XG4gIHZhciBDb2xsZWN0aW9uUHJvdG90eXBlID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgaWYgKENvbGxlY3Rpb25Qcm90b3R5cGUpIHtcbiAgICAvLyBzb21lIENocm9tZSB2ZXJzaW9ucyBoYXZlIG5vbi1jb25maWd1cmFibGUgbWV0aG9kcyBvbiBET01Ub2tlbkxpc3RcbiAgICBpZiAoQ29sbGVjdGlvblByb3RvdHlwZVtJVEVSQVRPUl0gIT09IEFycmF5VmFsdWVzKSB0cnkge1xuICAgICAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KENvbGxlY3Rpb25Qcm90b3R5cGUsIElURVJBVE9SLCBBcnJheVZhbHVlcyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIENvbGxlY3Rpb25Qcm90b3R5cGVbSVRFUkFUT1JdID0gQXJyYXlWYWx1ZXM7XG4gICAgfVxuICAgIGlmICghQ29sbGVjdGlvblByb3RvdHlwZVtUT19TVFJJTkdfVEFHXSkge1xuICAgICAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KENvbGxlY3Rpb25Qcm90b3R5cGUsIFRPX1NUUklOR19UQUcsIENPTExFQ1RJT05fTkFNRSk7XG4gICAgfVxuICAgIGlmIChET01JdGVyYWJsZXNbQ09MTEVDVElPTl9OQU1FXSkgZm9yICh2YXIgTUVUSE9EX05BTUUgaW4gQXJyYXlJdGVyYXRvck1ldGhvZHMpIHtcbiAgICAgIC8vIHNvbWUgQ2hyb21lIHZlcnNpb25zIGhhdmUgbm9uLWNvbmZpZ3VyYWJsZSBtZXRob2RzIG9uIERPTVRva2VuTGlzdFxuICAgICAgaWYgKENvbGxlY3Rpb25Qcm90b3R5cGVbTUVUSE9EX05BTUVdICE9PSBBcnJheUl0ZXJhdG9yTWV0aG9kc1tNRVRIT0RfTkFNRV0pIHRyeSB7XG4gICAgICAgIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eShDb2xsZWN0aW9uUHJvdG90eXBlLCBNRVRIT0RfTkFNRSwgQXJyYXlJdGVyYXRvck1ldGhvZHNbTUVUSE9EX05BTUVdKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIENvbGxlY3Rpb25Qcm90b3R5cGVbTUVUSE9EX05BTUVdID0gQXJyYXlJdGVyYXRvck1ldGhvZHNbTUVUSE9EX05BTUVdO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWwuUHJvbWlzZTtcbiIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0YXJnZXQsIHNyYywgb3B0aW9ucykge1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSByZWRlZmluZSh0YXJnZXQsIGtleSwgc3JjW2tleV0sIG9wdGlvbnMpO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBnZXRCdWlsdEluID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dldC1idWlsdC1pbicpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDT05TVFJVQ1RPUl9OQU1FKSB7XG4gIHZhciBDb25zdHJ1Y3RvciA9IGdldEJ1aWx0SW4oQ09OU1RSVUNUT1JfTkFNRSk7XG4gIHZhciBkZWZpbmVQcm9wZXJ0eSA9IGRlZmluZVByb3BlcnR5TW9kdWxlLmY7XG5cbiAgaWYgKERFU0NSSVBUT1JTICYmIENvbnN0cnVjdG9yICYmICFDb25zdHJ1Y3RvcltTUEVDSUVTXSkge1xuICAgIGRlZmluZVByb3BlcnR5KENvbnN0cnVjdG9yLCBTUEVDSUVTLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH1cbiAgICB9KTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICh0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IFR5cGVFcnJvcihTdHJpbmcoaXQpICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgQ29uc3RydWN0b3IsIG5hbWUpIHtcbiAgaWYgKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ0luY29ycmVjdCAnICsgKG5hbWUgPyBuYW1lICsgJyAnIDogJycpICsgJ2ludm9jYXRpb24nKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMnKTtcblxudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xudmFyIEFycmF5UHJvdG90eXBlID0gQXJyYXkucHJvdG90eXBlO1xuXG4vLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvdHlwZVtJVEVSQVRPUl0gPT09IGl0KTtcbn07XG4iLCJ2YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2EtZnVuY3Rpb24nKTtcblxuLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0KTtcbiAgICB9O1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoLyogLi4uYXJncyAqLykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcbiIsInZhciBjbGFzc29mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ICE9IHVuZGVmaW5lZCkgcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcblxuLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgRU5UUklFUykge1xuICB0cnkge1xuICAgIHJldHVybiBFTlRSSUVTID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdmFyIHJldHVybk1ldGhvZCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZiAocmV0dXJuTWV0aG9kICE9PSB1bmRlZmluZWQpIGFuT2JqZWN0KHJldHVybk1ldGhvZC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgaXNBcnJheUl0ZXJhdG9yTWV0aG9kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLWFycmF5LWl0ZXJhdG9yLW1ldGhvZCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWxlbmd0aCcpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZnVuY3Rpb24tYmluZC1jb250ZXh0Jyk7XG52YXIgZ2V0SXRlcmF0b3JNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xudmFyIGNhbGxXaXRoU2FmZUl0ZXJhdGlvbkNsb3NpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2FsbC13aXRoLXNhZmUtaXRlcmF0aW9uLWNsb3NpbmcnKTtcblxudmFyIFJlc3VsdCA9IGZ1bmN0aW9uIChzdG9wcGVkLCByZXN1bHQpIHtcbiAgdGhpcy5zdG9wcGVkID0gc3RvcHBlZDtcbiAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG59O1xuXG52YXIgaXRlcmF0ZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZXJhYmxlLCBmbiwgdGhhdCwgQVNfRU5UUklFUywgSVNfSVRFUkFUT1IpIHtcbiAgdmFyIGJvdW5kRnVuY3Rpb24gPSBiaW5kKGZuLCB0aGF0LCBBU19FTlRSSUVTID8gMiA6IDEpO1xuICB2YXIgaXRlcmF0b3IsIGl0ZXJGbiwgaW5kZXgsIGxlbmd0aCwgcmVzdWx0LCBuZXh0LCBzdGVwO1xuXG4gIGlmIChJU19JVEVSQVRPUikge1xuICAgIGl0ZXJhdG9yID0gaXRlcmFibGU7XG4gIH0gZWxzZSB7XG4gICAgaXRlckZuID0gZ2V0SXRlcmF0b3JNZXRob2QoaXRlcmFibGUpO1xuICAgIGlmICh0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcignVGFyZ2V0IGlzIG5vdCBpdGVyYWJsZScpO1xuICAgIC8vIG9wdGltaXNhdGlvbiBmb3IgYXJyYXkgaXRlcmF0b3JzXG4gICAgaWYgKGlzQXJyYXlJdGVyYXRvck1ldGhvZChpdGVyRm4pKSB7XG4gICAgICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgcmVzdWx0ID0gQVNfRU5UUklFU1xuICAgICAgICAgID8gYm91bmRGdW5jdGlvbihhbk9iamVjdChzdGVwID0gaXRlcmFibGVbaW5kZXhdKVswXSwgc3RlcFsxXSlcbiAgICAgICAgICA6IGJvdW5kRnVuY3Rpb24oaXRlcmFibGVbaW5kZXhdKTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQgaW5zdGFuY2VvZiBSZXN1bHQpIHJldHVybiByZXN1bHQ7XG4gICAgICB9IHJldHVybiBuZXcgUmVzdWx0KGZhbHNlKTtcbiAgICB9XG4gICAgaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChpdGVyYWJsZSk7XG4gIH1cblxuICBuZXh0ID0gaXRlcmF0b3IubmV4dDtcbiAgd2hpbGUgKCEoc3RlcCA9IG5leHQuY2FsbChpdGVyYXRvcikpLmRvbmUpIHtcbiAgICByZXN1bHQgPSBjYWxsV2l0aFNhZmVJdGVyYXRpb25DbG9zaW5nKGl0ZXJhdG9yLCBib3VuZEZ1bmN0aW9uLCBzdGVwLnZhbHVlLCBBU19FTlRSSUVTKTtcbiAgICBpZiAodHlwZW9mIHJlc3VsdCA9PSAnb2JqZWN0JyAmJiByZXN1bHQgJiYgcmVzdWx0IGluc3RhbmNlb2YgUmVzdWx0KSByZXR1cm4gcmVzdWx0O1xuICB9IHJldHVybiBuZXcgUmVzdWx0KGZhbHNlKTtcbn07XG5cbml0ZXJhdGUuc3RvcCA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgcmV0dXJuIG5ldyBSZXN1bHQodHJ1ZSwgcmVzdWx0KTtcbn07XG4iLCJ2YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcbnZhciBTQUZFX0NMT1NJTkcgPSBmYWxzZTtcblxudHJ5IHtcbiAgdmFyIGNhbGxlZCA9IDA7XG4gIHZhciBpdGVyYXRvcldpdGhSZXR1cm4gPSB7XG4gICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHsgZG9uZTogISFjYWxsZWQrKyB9O1xuICAgIH0sXG4gICAgJ3JldHVybic6IGZ1bmN0aW9uICgpIHtcbiAgICAgIFNBRkVfQ0xPU0lORyA9IHRydWU7XG4gICAgfVxuICB9O1xuICBpdGVyYXRvcldpdGhSZXR1cm5bSVRFUkFUT1JdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdGhyb3ctbGl0ZXJhbFxuICBBcnJheS5mcm9tKGl0ZXJhdG9yV2l0aFJldHVybiwgZnVuY3Rpb24gKCkgeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2ggKGVycm9yKSB7IC8qIGVtcHR5ICovIH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYywgU0tJUF9DTE9TSU5HKSB7XG4gIGlmICghU0tJUF9DTE9TSU5HICYmICFTQUZFX0NMT1NJTkcpIHJldHVybiBmYWxzZTtcbiAgdmFyIElURVJBVElPTl9TVVBQT1JUID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIG9iamVjdCA9IHt9O1xuICAgIG9iamVjdFtJVEVSQVRPUl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogSVRFUkFUSU9OX1NVUFBPUlQgPSB0cnVlIH07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgICBleGVjKG9iamVjdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7IC8qIGVtcHR5ICovIH1cbiAgcmV0dXJuIElURVJBVElPTl9TVVBQT1JUO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xuXG4vLyBgU3BlY2llc0NvbnN0cnVjdG9yYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXNwZWNpZXNjb25zdHJ1Y3RvclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywgZGVmYXVsdENvbnN0cnVjdG9yKSB7XG4gIHZhciBDID0gYW5PYmplY3QoTykuY29uc3RydWN0b3I7XG4gIHZhciBTO1xuICByZXR1cm4gQyA9PT0gdW5kZWZpbmVkIHx8IChTID0gYW5PYmplY3QoQylbU1BFQ0lFU10pID09IHVuZGVmaW5lZCA/IGRlZmF1bHRDb25zdHJ1Y3RvciA6IGFGdW5jdGlvbihTKTtcbn07XG4iLCJ2YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRCdWlsdEluKCduYXZpZ2F0b3InLCAndXNlckFnZW50JykgfHwgJyc7XG4iLCJ2YXIgdXNlckFnZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VuZ2luZS11c2VyLWFnZW50Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gLyhpcGhvbmV8aXBvZHxpcGFkKS4qYXBwbGV3ZWJraXQvaS50ZXN0KHVzZXJBZ2VudCk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZnVuY3Rpb24tYmluZC1jb250ZXh0Jyk7XG52YXIgaHRtbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9odG1sJyk7XG52YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudCcpO1xudmFyIElTX0lPUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbmdpbmUtaXMtaW9zJyk7XG5cbnZhciBsb2NhdGlvbiA9IGdsb2JhbC5sb2NhdGlvbjtcbnZhciBzZXQgPSBnbG9iYWwuc2V0SW1tZWRpYXRlO1xudmFyIGNsZWFyID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciBNZXNzYWdlQ2hhbm5lbCA9IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbDtcbnZhciBEaXNwYXRjaCA9IGdsb2JhbC5EaXNwYXRjaDtcbnZhciBjb3VudGVyID0gMDtcbnZhciBxdWV1ZSA9IHt9O1xudmFyIE9OUkVBRFlTVEFURUNIQU5HRSA9ICdvbnJlYWR5c3RhdGVjaGFuZ2UnO1xudmFyIGRlZmVyLCBjaGFubmVsLCBwb3J0O1xuXG52YXIgcnVuID0gZnVuY3Rpb24gKGlkKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgaWYgKHF1ZXVlLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgIHZhciBmbiA9IHF1ZXVlW2lkXTtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICAgIGZuKCk7XG4gIH1cbn07XG5cbnZhciBydW5uZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBydW4oaWQpO1xuICB9O1xufTtcblxudmFyIGxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHJ1bihldmVudC5kYXRhKTtcbn07XG5cbnZhciBwb3N0ID0gZnVuY3Rpb24gKGlkKSB7XG4gIC8vIG9sZCBlbmdpbmVzIGhhdmUgbm90IGxvY2F0aW9uLm9yaWdpblxuICBnbG9iYWwucG9zdE1lc3NhZ2UoaWQgKyAnJywgbG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgbG9jYXRpb24uaG9zdCk7XG59O1xuXG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBvdGhlcndpc2U6XG5pZiAoIXNldCB8fCAhY2xlYXIpIHtcbiAgc2V0ID0gZnVuY3Rpb24gc2V0SW1tZWRpYXRlKGZuKSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICB2YXIgaSA9IDE7XG4gICAgd2hpbGUgKGFyZ3VtZW50cy5sZW5ndGggPiBpKSBhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgICAgICh0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJyA/IGZuIDogRnVuY3Rpb24oZm4pKS5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xuICAgIH07XG4gICAgZGVmZXIoY291bnRlcik7XG4gICAgcmV0dXJuIGNvdW50ZXI7XG4gIH07XG4gIGNsZWFyID0gZnVuY3Rpb24gY2xlYXJJbW1lZGlhdGUoaWQpIHtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICB9O1xuICAvLyBOb2RlLmpzIDAuOC1cbiAgaWYgKGNsYXNzb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2socnVubmVyKGlkKSk7XG4gICAgfTtcbiAgLy8gU3BoZXJlIChKUyBnYW1lIGVuZ2luZSkgRGlzcGF0Y2ggQVBJXG4gIH0gZWxzZSBpZiAoRGlzcGF0Y2ggJiYgRGlzcGF0Y2gubm93KSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIERpc3BhdGNoLm5vdyhydW5uZXIoaWQpKTtcbiAgICB9O1xuICAvLyBCcm93c2VycyB3aXRoIE1lc3NhZ2VDaGFubmVsLCBpbmNsdWRlcyBXZWJXb3JrZXJzXG4gIC8vIGV4Y2VwdCBpT1MgLSBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvNjI0XG4gIH0gZWxzZSBpZiAoTWVzc2FnZUNoYW5uZWwgJiYgIUlTX0lPUykge1xuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICBwb3J0ID0gY2hhbm5lbC5wb3J0MjtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpc3RlbmVyO1xuICAgIGRlZmVyID0gYmluZChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBwb3N0TWVzc2FnZSwgc2tpcCBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzICdvYmplY3QnXG4gIH0gZWxzZSBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgdHlwZW9mIHBvc3RNZXNzYWdlID09ICdmdW5jdGlvbicgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzICYmICFmYWlscyhwb3N0KSkge1xuICAgIGRlZmVyID0gcG9zdDtcbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyLCBmYWxzZSk7XG4gIC8vIElFOC1cbiAgfSBlbHNlIGlmIChPTlJFQURZU1RBVEVDSEFOR0UgaW4gY3JlYXRlRWxlbWVudCgnc2NyaXB0JykpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgaHRtbC5hcHBlbmRDaGlsZChjcmVhdGVFbGVtZW50KCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgcnVuKGlkKTtcbiAgICAgIH07XG4gICAgfTtcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcbiAgfSBlbHNlIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgc2V0VGltZW91dChydW5uZXIoaWQpLCAwKTtcbiAgICB9O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IHNldCxcbiAgY2xlYXI6IGNsZWFyXG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpLmY7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIG1hY3JvdGFzayA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90YXNrJykuc2V0O1xudmFyIElTX0lPUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbmdpbmUtaXMtaW9zJyk7XG5cbnZhciBNdXRhdGlvbk9ic2VydmVyID0gZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgZ2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG52YXIgcHJvY2VzcyA9IGdsb2JhbC5wcm9jZXNzO1xudmFyIFByb21pc2UgPSBnbG9iYWwuUHJvbWlzZTtcbnZhciBJU19OT0RFID0gY2xhc3NvZihwcm9jZXNzKSA9PSAncHJvY2Vzcyc7XG4vLyBOb2RlLmpzIDExIHNob3dzIEV4cGVyaW1lbnRhbFdhcm5pbmcgb24gZ2V0dGluZyBgcXVldWVNaWNyb3Rhc2tgXG52YXIgcXVldWVNaWNyb3Rhc2tEZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGdsb2JhbCwgJ3F1ZXVlTWljcm90YXNrJyk7XG52YXIgcXVldWVNaWNyb3Rhc2sgPSBxdWV1ZU1pY3JvdGFza0Rlc2NyaXB0b3IgJiYgcXVldWVNaWNyb3Rhc2tEZXNjcmlwdG9yLnZhbHVlO1xuXG52YXIgZmx1c2gsIGhlYWQsIGxhc3QsIG5vdGlmeSwgdG9nZ2xlLCBub2RlLCBwcm9taXNlLCB0aGVuO1xuXG4vLyBtb2Rlcm4gZW5naW5lcyBoYXZlIHF1ZXVlTWljcm90YXNrIG1ldGhvZFxuaWYgKCFxdWV1ZU1pY3JvdGFzaykge1xuICBmbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGFyZW50LCBmbjtcbiAgICBpZiAoSVNfTk9ERSAmJiAocGFyZW50ID0gcHJvY2Vzcy5kb21haW4pKSBwYXJlbnQuZXhpdCgpO1xuICAgIHdoaWxlIChoZWFkKSB7XG4gICAgICBmbiA9IGhlYWQuZm47XG4gICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm4oKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChoZWFkKSBub3RpZnkoKTtcbiAgICAgICAgZWxzZSBsYXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9IGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHBhcmVudCkgcGFyZW50LmVudGVyKCk7XG4gIH07XG5cbiAgLy8gTm9kZS5qc1xuICBpZiAoSVNfTk9ERSkge1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG4gIC8vIGJyb3dzZXJzIHdpdGggTXV0YXRpb25PYnNlcnZlciwgZXhjZXB0IGlPUyAtIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8zMzlcbiAgfSBlbHNlIGlmIChNdXRhdGlvbk9ic2VydmVyICYmICFJU19JT1MpIHtcbiAgICB0b2dnbGUgPSB0cnVlO1xuICAgIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZmx1c2gpLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG5vZGUuZGF0YSA9IHRvZ2dsZSA9ICF0b2dnbGU7XG4gICAgfTtcbiAgLy8gZW52aXJvbm1lbnRzIHdpdGggbWF5YmUgbm9uLWNvbXBsZXRlbHkgY29ycmVjdCwgYnV0IGV4aXN0ZW50IFByb21pc2VcbiAgfSBlbHNlIGlmIChQcm9taXNlICYmIFByb21pc2UucmVzb2x2ZSkge1xuICAgIC8vIFByb21pc2UucmVzb2x2ZSB3aXRob3V0IGFuIGFyZ3VtZW50IHRocm93cyBhbiBlcnJvciBpbiBMRyBXZWJPUyAyXG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIHRoZW4gPSBwcm9taXNlLnRoZW47XG4gICAgbm90aWZ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhlbi5jYWxsKHByb21pc2UsIGZsdXNoKTtcbiAgICB9O1xuICAvLyBmb3Igb3RoZXIgZW52aXJvbm1lbnRzIC0gbWFjcm90YXNrIGJhc2VkIG9uOlxuICAvLyAtIHNldEltbWVkaWF0ZVxuICAvLyAtIE1lc3NhZ2VDaGFubmVsXG4gIC8vIC0gd2luZG93LnBvc3RNZXNzYWdcbiAgLy8gLSBvbnJlYWR5c3RhdGVjaGFuZ2VcbiAgLy8gLSBzZXRUaW1lb3V0XG4gIH0gZWxzZSB7XG4gICAgbm90aWZ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gc3RyYW5nZSBJRSArIHdlYnBhY2sgZGV2IHNlcnZlciBidWcgLSB1c2UgLmNhbGwoZ2xvYmFsKVxuICAgICAgbWFjcm90YXNrLmNhbGwoZ2xvYmFsLCBmbHVzaCk7XG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHF1ZXVlTWljcm90YXNrIHx8IGZ1bmN0aW9uIChmbikge1xuICB2YXIgdGFzayA9IHsgZm46IGZuLCBuZXh0OiB1bmRlZmluZWQgfTtcbiAgaWYgKGxhc3QpIGxhc3QubmV4dCA9IHRhc2s7XG4gIGlmICghaGVhZCkge1xuICAgIGhlYWQgPSB0YXNrO1xuICAgIG5vdGlmeSgpO1xuICB9IGxhc3QgPSB0YXNrO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xuXG52YXIgUHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbiAoQykge1xuICB2YXIgcmVzb2x2ZSwgcmVqZWN0O1xuICB0aGlzLnByb21pc2UgPSBuZXcgQyhmdW5jdGlvbiAoJCRyZXNvbHZlLCAkJHJlamVjdCkge1xuICAgIGlmIChyZXNvbHZlICE9PSB1bmRlZmluZWQgfHwgcmVqZWN0ICE9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcignQmFkIFByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICByZXNvbHZlID0gJCRyZXNvbHZlO1xuICAgIHJlamVjdCA9ICQkcmVqZWN0O1xuICB9KTtcbiAgdGhpcy5yZXNvbHZlID0gYUZ1bmN0aW9uKHJlc29sdmUpO1xuICB0aGlzLnJlamVjdCA9IGFGdW5jdGlvbihyZWplY3QpO1xufTtcblxuLy8gMjUuNC4xLjUgTmV3UHJvbWlzZUNhcGFiaWxpdHkoQylcbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiAoQykge1xuICByZXR1cm4gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uZXctcHJvbWlzZS1jYXBhYmlsaXR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEMsIHgpIHtcbiAgYW5PYmplY3QoQyk7XG4gIGlmIChpc09iamVjdCh4KSAmJiB4LmNvbnN0cnVjdG9yID09PSBDKSByZXR1cm4geDtcbiAgdmFyIHByb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkuZihDKTtcbiAgdmFyIHJlc29sdmUgPSBwcm9taXNlQ2FwYWJpbGl0eS5yZXNvbHZlO1xuICByZXNvbHZlKHgpO1xuICByZXR1cm4gcHJvbWlzZUNhcGFiaWxpdHkucHJvbWlzZTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBjb25zb2xlID0gZ2xvYmFsLmNvbnNvbGU7XG4gIGlmIChjb25zb2xlICYmIGNvbnNvbGUuZXJyb3IpIHtcbiAgICBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gY29uc29sZS5lcnJvcihhKSA6IGNvbnNvbGUuZXJyb3IoYSwgYik7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IGZhbHNlLCB2YWx1ZTogZXhlYygpIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgZXJyb3I6IHRydWUsIHZhbHVlOiBlcnJvciB9O1xuICB9XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciB1c2VyQWdlbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW5naW5lLXVzZXItYWdlbnQnKTtcblxudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciB2ZXJzaW9ucyA9IHByb2Nlc3MgJiYgcHJvY2Vzcy52ZXJzaW9ucztcbnZhciB2OCA9IHZlcnNpb25zICYmIHZlcnNpb25zLnY4O1xudmFyIG1hdGNoLCB2ZXJzaW9uO1xuXG5pZiAodjgpIHtcbiAgbWF0Y2ggPSB2OC5zcGxpdCgnLicpO1xuICB2ZXJzaW9uID0gbWF0Y2hbMF0gKyBtYXRjaFsxXTtcbn0gZWxzZSBpZiAodXNlckFnZW50KSB7XG4gIG1hdGNoID0gdXNlckFnZW50Lm1hdGNoKC9FZGdlXFwvKFxcZCspLyk7XG4gIGlmICghbWF0Y2ggfHwgbWF0Y2hbMV0gPj0gNzQpIHtcbiAgICBtYXRjaCA9IHVzZXJBZ2VudC5tYXRjaCgvQ2hyb21lXFwvKFxcZCspLyk7XG4gICAgaWYgKG1hdGNoKSB2ZXJzaW9uID0gbWF0Y2hbMV07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2ZXJzaW9uICYmICt2ZXJzaW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgSVNfUFVSRSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1wdXJlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG52YXIgTmF0aXZlUHJvbWlzZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtcHJvbWlzZS1jb25zdHJ1Y3RvcicpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgcmVkZWZpbmVBbGwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUtYWxsJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciBzZXRTcGVjaWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC1zcGVjaWVzJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2EtZnVuY3Rpb24nKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLWluc3RhbmNlJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIGluc3BlY3RTb3VyY2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5zcGVjdC1zb3VyY2UnKTtcbnZhciBpdGVyYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdGUnKTtcbnZhciBjaGVja0NvcnJlY3RuZXNzT2ZJdGVyYXRpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2hlY2stY29ycmVjdG5lc3Mtb2YtaXRlcmF0aW9uJyk7XG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciB0YXNrID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3Rhc2snKS5zZXQ7XG52YXIgbWljcm90YXNrID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL21pY3JvdGFzaycpO1xudmFyIHByb21pc2VSZXNvbHZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3Byb21pc2UtcmVzb2x2ZScpO1xudmFyIGhvc3RSZXBvcnRFcnJvcnMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaG9zdC1yZXBvcnQtZXJyb3JzJyk7XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGVyZm9ybScpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcbnZhciBpc0ZvcmNlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1mb3JjZWQnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciBWOF9WRVJTSU9OID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VuZ2luZS12OC12ZXJzaW9uJyk7XG5cbnZhciBTUEVDSUVTID0gd2VsbEtub3duU3ltYm9sKCdzcGVjaWVzJyk7XG52YXIgUFJPTUlTRSA9ICdQcm9taXNlJztcbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXQ7XG52YXIgc2V0SW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuc2V0O1xudmFyIGdldEludGVybmFsUHJvbWlzZVN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXR0ZXJGb3IoUFJPTUlTRSk7XG52YXIgUHJvbWlzZUNvbnN0cnVjdG9yID0gTmF0aXZlUHJvbWlzZTtcbnZhciBUeXBlRXJyb3IgPSBnbG9iYWwuVHlwZUVycm9yO1xudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciAkZmV0Y2ggPSBnZXRCdWlsdEluKCdmZXRjaCcpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZjtcbnZhciBuZXdHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eTtcbnZhciBJU19OT0RFID0gY2xhc3NvZihwcm9jZXNzKSA9PSAncHJvY2Vzcyc7XG52YXIgRElTUEFUQ0hfRVZFTlQgPSAhIShkb2N1bWVudCAmJiBkb2N1bWVudC5jcmVhdGVFdmVudCAmJiBnbG9iYWwuZGlzcGF0Y2hFdmVudCk7XG52YXIgVU5IQU5ETEVEX1JFSkVDVElPTiA9ICd1bmhhbmRsZWRyZWplY3Rpb24nO1xudmFyIFJFSkVDVElPTl9IQU5ETEVEID0gJ3JlamVjdGlvbmhhbmRsZWQnO1xudmFyIFBFTkRJTkcgPSAwO1xudmFyIEZVTEZJTExFRCA9IDE7XG52YXIgUkVKRUNURUQgPSAyO1xudmFyIEhBTkRMRUQgPSAxO1xudmFyIFVOSEFORExFRCA9IDI7XG52YXIgSW50ZXJuYWwsIE93blByb21pc2VDYXBhYmlsaXR5LCBQcm9taXNlV3JhcHBlciwgbmF0aXZlVGhlbjtcblxudmFyIEZPUkNFRCA9IGlzRm9yY2VkKFBST01JU0UsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIEdMT0JBTF9DT1JFX0pTX1BST01JU0UgPSBpbnNwZWN0U291cmNlKFByb21pc2VDb25zdHJ1Y3RvcikgIT09IFN0cmluZyhQcm9taXNlQ29uc3RydWN0b3IpO1xuICBpZiAoIUdMT0JBTF9DT1JFX0pTX1BST01JU0UpIHtcbiAgICAvLyBWOCA2LjYgKE5vZGUgMTAgYW5kIENocm9tZSA2NikgaGF2ZSBhIGJ1ZyB3aXRoIHJlc29sdmluZyBjdXN0b20gdGhlbmFibGVzXG4gICAgLy8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9ODMwNTY1XG4gICAgLy8gV2UgY2FuJ3QgZGV0ZWN0IGl0IHN5bmNocm9ub3VzbHksIHNvIGp1c3QgY2hlY2sgdmVyc2lvbnNcbiAgICBpZiAoVjhfVkVSU0lPTiA9PT0gNjYpIHJldHVybiB0cnVlO1xuICAgIC8vIFVuaGFuZGxlZCByZWplY3Rpb25zIHRyYWNraW5nIHN1cHBvcnQsIE5vZGVKUyBQcm9taXNlIHdpdGhvdXQgaXQgZmFpbHMgQEBzcGVjaWVzIHRlc3RcbiAgICBpZiAoIUlTX05PREUgJiYgdHlwZW9mIFByb21pc2VSZWplY3Rpb25FdmVudCAhPSAnZnVuY3Rpb24nKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICAvLyBXZSBuZWVkIFByb21pc2UjZmluYWxseSBpbiB0aGUgcHVyZSB2ZXJzaW9uIGZvciBwcmV2ZW50aW5nIHByb3RvdHlwZSBwb2xsdXRpb25cbiAgaWYgKElTX1BVUkUgJiYgIVByb21pc2VDb25zdHJ1Y3Rvci5wcm90b3R5cGVbJ2ZpbmFsbHknXSkgcmV0dXJuIHRydWU7XG4gIC8vIFdlIGNhbid0IHVzZSBAQHNwZWNpZXMgZmVhdHVyZSBkZXRlY3Rpb24gaW4gVjggc2luY2UgaXQgY2F1c2VzXG4gIC8vIGRlb3B0aW1pemF0aW9uIGFuZCBwZXJmb3JtYW5jZSBkZWdyYWRhdGlvblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvNjc5XG4gIGlmIChWOF9WRVJTSU9OID49IDUxICYmIC9uYXRpdmUgY29kZS8udGVzdChQcm9taXNlQ29uc3RydWN0b3IpKSByZXR1cm4gZmFsc2U7XG4gIC8vIERldGVjdCBjb3JyZWN0bmVzcyBvZiBzdWJjbGFzc2luZyB3aXRoIEBAc3BlY2llcyBzdXBwb3J0XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZUNvbnN0cnVjdG9yLnJlc29sdmUoMSk7XG4gIHZhciBGYWtlUHJvbWlzZSA9IGZ1bmN0aW9uIChleGVjKSB7XG4gICAgZXhlYyhmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH0sIGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfSk7XG4gIH07XG4gIHZhciBjb25zdHJ1Y3RvciA9IHByb21pc2UuY29uc3RydWN0b3IgPSB7fTtcbiAgY29uc3RydWN0b3JbU1BFQ0lFU10gPSBGYWtlUHJvbWlzZTtcbiAgcmV0dXJuICEocHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfSkgaW5zdGFuY2VvZiBGYWtlUHJvbWlzZSk7XG59KTtcblxudmFyIElOQ09SUkVDVF9JVEVSQVRJT04gPSBGT1JDRUQgfHwgIWNoZWNrQ29ycmVjdG5lc3NPZkl0ZXJhdGlvbihmdW5jdGlvbiAoaXRlcmFibGUpIHtcbiAgUHJvbWlzZUNvbnN0cnVjdG9yLmFsbChpdGVyYWJsZSlbJ2NhdGNoJ10oZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9KTtcbn0pO1xuXG4vLyBoZWxwZXJzXG52YXIgaXNUaGVuYWJsZSA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgdGhlbjtcbiAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiB0eXBlb2YgKHRoZW4gPSBpdC50aGVuKSA9PSAnZnVuY3Rpb24nID8gdGhlbiA6IGZhbHNlO1xufTtcblxudmFyIG5vdGlmeSA9IGZ1bmN0aW9uIChwcm9taXNlLCBzdGF0ZSwgaXNSZWplY3QpIHtcbiAgaWYgKHN0YXRlLm5vdGlmaWVkKSByZXR1cm47XG4gIHN0YXRlLm5vdGlmaWVkID0gdHJ1ZTtcbiAgdmFyIGNoYWluID0gc3RhdGUucmVhY3Rpb25zO1xuICBtaWNyb3Rhc2soZnVuY3Rpb24gKCkge1xuICAgIHZhciB2YWx1ZSA9IHN0YXRlLnZhbHVlO1xuICAgIHZhciBvayA9IHN0YXRlLnN0YXRlID09IEZVTEZJTExFRDtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCA+IGluZGV4KSB7XG4gICAgICB2YXIgcmVhY3Rpb24gPSBjaGFpbltpbmRleCsrXTtcbiAgICAgIHZhciBoYW5kbGVyID0gb2sgPyByZWFjdGlvbi5vayA6IHJlYWN0aW9uLmZhaWw7XG4gICAgICB2YXIgcmVzb2x2ZSA9IHJlYWN0aW9uLnJlc29sdmU7XG4gICAgICB2YXIgcmVqZWN0ID0gcmVhY3Rpb24ucmVqZWN0O1xuICAgICAgdmFyIGRvbWFpbiA9IHJlYWN0aW9uLmRvbWFpbjtcbiAgICAgIHZhciByZXN1bHQsIHRoZW4sIGV4aXRlZDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgaWYgKCFvaykge1xuICAgICAgICAgICAgaWYgKHN0YXRlLnJlamVjdGlvbiA9PT0gVU5IQU5ETEVEKSBvbkhhbmRsZVVuaGFuZGxlZChwcm9taXNlLCBzdGF0ZSk7XG4gICAgICAgICAgICBzdGF0ZS5yZWplY3Rpb24gPSBIQU5ETEVEO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFuZGxlciA9PT0gdHJ1ZSkgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoZG9tYWluKSBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGhhbmRsZXIodmFsdWUpOyAvLyBjYW4gdGhyb3dcbiAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgZXhpdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gcmVhY3Rpb24ucHJvbWlzZSkge1xuICAgICAgICAgICAgcmVqZWN0KFR5cGVFcnJvcignUHJvbWlzZS1jaGFpbiBjeWNsZScpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoZW4gPSBpc1RoZW5hYmxlKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHRoZW4uY2FsbChyZXN1bHQsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHJlamVjdCh2YWx1ZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoZG9tYWluICYmICFleGl0ZWQpIGRvbWFpbi5leGl0KCk7XG4gICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICAgIHN0YXRlLnJlYWN0aW9ucyA9IFtdO1xuICAgIHN0YXRlLm5vdGlmaWVkID0gZmFsc2U7XG4gICAgaWYgKGlzUmVqZWN0ICYmICFzdGF0ZS5yZWplY3Rpb24pIG9uVW5oYW5kbGVkKHByb21pc2UsIHN0YXRlKTtcbiAgfSk7XG59O1xuXG52YXIgZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIChuYW1lLCBwcm9taXNlLCByZWFzb24pIHtcbiAgdmFyIGV2ZW50LCBoYW5kbGVyO1xuICBpZiAoRElTUEFUQ0hfRVZFTlQpIHtcbiAgICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIGV2ZW50LnByb21pc2UgPSBwcm9taXNlO1xuICAgIGV2ZW50LnJlYXNvbiA9IHJlYXNvbjtcbiAgICBldmVudC5pbml0RXZlbnQobmFtZSwgZmFsc2UsIHRydWUpO1xuICAgIGdsb2JhbC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfSBlbHNlIGV2ZW50ID0geyBwcm9taXNlOiBwcm9taXNlLCByZWFzb246IHJlYXNvbiB9O1xuICBpZiAoaGFuZGxlciA9IGdsb2JhbFsnb24nICsgbmFtZV0pIGhhbmRsZXIoZXZlbnQpO1xuICBlbHNlIGlmIChuYW1lID09PSBVTkhBTkRMRURfUkVKRUNUSU9OKSBob3N0UmVwb3J0RXJyb3JzKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24nLCByZWFzb24pO1xufTtcblxudmFyIG9uVW5oYW5kbGVkID0gZnVuY3Rpb24gKHByb21pc2UsIHN0YXRlKSB7XG4gIHRhc2suY2FsbChnbG9iYWwsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmFsdWUgPSBzdGF0ZS52YWx1ZTtcbiAgICB2YXIgSVNfVU5IQU5ETEVEID0gaXNVbmhhbmRsZWQoc3RhdGUpO1xuICAgIHZhciByZXN1bHQ7XG4gICAgaWYgKElTX1VOSEFORExFRCkge1xuICAgICAgcmVzdWx0ID0gcGVyZm9ybShmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChJU19OT0RFKSB7XG4gICAgICAgICAgcHJvY2Vzcy5lbWl0KCd1bmhhbmRsZWRSZWplY3Rpb24nLCB2YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSBkaXNwYXRjaEV2ZW50KFVOSEFORExFRF9SRUpFQ1RJT04sIHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgLy8gQnJvd3NlcnMgc2hvdWxkIG5vdCB0cmlnZ2VyIGByZWplY3Rpb25IYW5kbGVkYCBldmVudCBpZiBpdCB3YXMgaGFuZGxlZCBoZXJlLCBOb2RlSlMgLSBzaG91bGRcbiAgICAgIHN0YXRlLnJlamVjdGlvbiA9IElTX05PREUgfHwgaXNVbmhhbmRsZWQoc3RhdGUpID8gVU5IQU5ETEVEIDogSEFORExFRDtcbiAgICAgIGlmIChyZXN1bHQuZXJyb3IpIHRocm93IHJlc3VsdC52YWx1ZTtcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIGlzVW5oYW5kbGVkID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gIHJldHVybiBzdGF0ZS5yZWplY3Rpb24gIT09IEhBTkRMRUQgJiYgIXN0YXRlLnBhcmVudDtcbn07XG5cbnZhciBvbkhhbmRsZVVuaGFuZGxlZCA9IGZ1bmN0aW9uIChwcm9taXNlLCBzdGF0ZSkge1xuICB0YXNrLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKElTX05PREUpIHtcbiAgICAgIHByb2Nlc3MuZW1pdCgncmVqZWN0aW9uSGFuZGxlZCcsIHByb21pc2UpO1xuICAgIH0gZWxzZSBkaXNwYXRjaEV2ZW50KFJFSkVDVElPTl9IQU5ETEVELCBwcm9taXNlLCBzdGF0ZS52YWx1ZSk7XG4gIH0pO1xufTtcblxudmFyIGJpbmQgPSBmdW5jdGlvbiAoZm4sIHByb21pc2UsIHN0YXRlLCB1bndyYXApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGZuKHByb21pc2UsIHN0YXRlLCB2YWx1ZSwgdW53cmFwKTtcbiAgfTtcbn07XG5cbnZhciBpbnRlcm5hbFJlamVjdCA9IGZ1bmN0aW9uIChwcm9taXNlLCBzdGF0ZSwgdmFsdWUsIHVud3JhcCkge1xuICBpZiAoc3RhdGUuZG9uZSkgcmV0dXJuO1xuICBzdGF0ZS5kb25lID0gdHJ1ZTtcbiAgaWYgKHVud3JhcCkgc3RhdGUgPSB1bndyYXA7XG4gIHN0YXRlLnZhbHVlID0gdmFsdWU7XG4gIHN0YXRlLnN0YXRlID0gUkVKRUNURUQ7XG4gIG5vdGlmeShwcm9taXNlLCBzdGF0ZSwgdHJ1ZSk7XG59O1xuXG52YXIgaW50ZXJuYWxSZXNvbHZlID0gZnVuY3Rpb24gKHByb21pc2UsIHN0YXRlLCB2YWx1ZSwgdW53cmFwKSB7XG4gIGlmIChzdGF0ZS5kb25lKSByZXR1cm47XG4gIHN0YXRlLmRvbmUgPSB0cnVlO1xuICBpZiAodW53cmFwKSBzdGF0ZSA9IHVud3JhcDtcbiAgdHJ5IHtcbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHRocm93IFR5cGVFcnJvcihcIlByb21pc2UgY2FuJ3QgYmUgcmVzb2x2ZWQgaXRzZWxmXCIpO1xuICAgIHZhciB0aGVuID0gaXNUaGVuYWJsZSh2YWx1ZSk7XG4gICAgaWYgKHRoZW4pIHtcbiAgICAgIG1pY3JvdGFzayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3cmFwcGVyID0geyBkb25lOiBmYWxzZSB9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoZW4uY2FsbCh2YWx1ZSxcbiAgICAgICAgICAgIGJpbmQoaW50ZXJuYWxSZXNvbHZlLCBwcm9taXNlLCB3cmFwcGVyLCBzdGF0ZSksXG4gICAgICAgICAgICBiaW5kKGludGVybmFsUmVqZWN0LCBwcm9taXNlLCB3cmFwcGVyLCBzdGF0ZSlcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGludGVybmFsUmVqZWN0KHByb21pc2UsIHdyYXBwZXIsIGVycm9yLCBzdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS52YWx1ZSA9IHZhbHVlO1xuICAgICAgc3RhdGUuc3RhdGUgPSBGVUxGSUxMRUQ7XG4gICAgICBub3RpZnkocHJvbWlzZSwgc3RhdGUsIGZhbHNlKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaW50ZXJuYWxSZWplY3QocHJvbWlzZSwgeyBkb25lOiBmYWxzZSB9LCBlcnJvciwgc3RhdGUpO1xuICB9XG59O1xuXG4vLyBjb25zdHJ1Y3RvciBwb2x5ZmlsbFxuaWYgKEZPUkNFRCkge1xuICAvLyAyNS40LjMuMSBQcm9taXNlKGV4ZWN1dG9yKVxuICBQcm9taXNlQ29uc3RydWN0b3IgPSBmdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKSB7XG4gICAgYW5JbnN0YW5jZSh0aGlzLCBQcm9taXNlQ29uc3RydWN0b3IsIFBST01JU0UpO1xuICAgIGFGdW5jdGlvbihleGVjdXRvcik7XG4gICAgSW50ZXJuYWwuY2FsbCh0aGlzKTtcbiAgICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFN0YXRlKHRoaXMpO1xuICAgIHRyeSB7XG4gICAgICBleGVjdXRvcihiaW5kKGludGVybmFsUmVzb2x2ZSwgdGhpcywgc3RhdGUpLCBiaW5kKGludGVybmFsUmVqZWN0LCB0aGlzLCBzdGF0ZSkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpbnRlcm5hbFJlamVjdCh0aGlzLCBzdGF0ZSwgZXJyb3IpO1xuICAgIH1cbiAgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gIEludGVybmFsID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuICAgIHNldEludGVybmFsU3RhdGUodGhpcywge1xuICAgICAgdHlwZTogUFJPTUlTRSxcbiAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgbm90aWZpZWQ6IGZhbHNlLFxuICAgICAgcGFyZW50OiBmYWxzZSxcbiAgICAgIHJlYWN0aW9uczogW10sXG4gICAgICByZWplY3Rpb246IGZhbHNlLFxuICAgICAgc3RhdGU6IFBFTkRJTkcsXG4gICAgICB2YWx1ZTogdW5kZWZpbmVkXG4gICAgfSk7XG4gIH07XG4gIEludGVybmFsLnByb3RvdHlwZSA9IHJlZGVmaW5lQWxsKFByb21pc2VDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHtcbiAgICAvLyBgUHJvbWlzZS5wcm90b3R5cGUudGhlbmAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcHJvbWlzZS5wcm90b3R5cGUudGhlblxuICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICAgIHZhciBzdGF0ZSA9IGdldEludGVybmFsUHJvbWlzZVN0YXRlKHRoaXMpO1xuICAgICAgdmFyIHJlYWN0aW9uID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoc3BlY2llc0NvbnN0cnVjdG9yKHRoaXMsIFByb21pc2VDb25zdHJ1Y3RvcikpO1xuICAgICAgcmVhY3Rpb24ub2sgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogdHJ1ZTtcbiAgICAgIHJlYWN0aW9uLmZhaWwgPSB0eXBlb2Ygb25SZWplY3RlZCA9PSAnZnVuY3Rpb24nICYmIG9uUmVqZWN0ZWQ7XG4gICAgICByZWFjdGlvbi5kb21haW4gPSBJU19OT0RFID8gcHJvY2Vzcy5kb21haW4gOiB1bmRlZmluZWQ7XG4gICAgICBzdGF0ZS5wYXJlbnQgPSB0cnVlO1xuICAgICAgc3RhdGUucmVhY3Rpb25zLnB1c2gocmVhY3Rpb24pO1xuICAgICAgaWYgKHN0YXRlLnN0YXRlICE9IFBFTkRJTkcpIG5vdGlmeSh0aGlzLCBzdGF0ZSwgZmFsc2UpO1xuICAgICAgcmV0dXJuIHJlYWN0aW9uLnByb21pc2U7XG4gICAgfSxcbiAgICAvLyBgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2hgIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXByb21pc2UucHJvdG90eXBlLmNhdGNoXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gIH0pO1xuICBPd25Qcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBJbnRlcm5hbCgpO1xuICAgIHZhciBzdGF0ZSA9IGdldEludGVybmFsU3RhdGUocHJvbWlzZSk7XG4gICAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgICB0aGlzLnJlc29sdmUgPSBiaW5kKGludGVybmFsUmVzb2x2ZSwgcHJvbWlzZSwgc3RhdGUpO1xuICAgIHRoaXMucmVqZWN0ID0gYmluZChpbnRlcm5hbFJlamVjdCwgcHJvbWlzZSwgc3RhdGUpO1xuICB9O1xuICBuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZS5mID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbiAoQykge1xuICAgIHJldHVybiBDID09PSBQcm9taXNlQ29uc3RydWN0b3IgfHwgQyA9PT0gUHJvbWlzZVdyYXBwZXJcbiAgICAgID8gbmV3IE93blByb21pc2VDYXBhYmlsaXR5KEMpXG4gICAgICA6IG5ld0dlbmVyaWNQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgfTtcblxuICBpZiAoIUlTX1BVUkUgJiYgdHlwZW9mIE5hdGl2ZVByb21pc2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgIG5hdGl2ZVRoZW4gPSBOYXRpdmVQcm9taXNlLnByb3RvdHlwZS50aGVuO1xuXG4gICAgLy8gd3JhcCBuYXRpdmUgUHJvbWlzZSN0aGVuIGZvciBuYXRpdmUgYXN5bmMgZnVuY3Rpb25zXG4gICAgcmVkZWZpbmUoTmF0aXZlUHJvbWlzZS5wcm90b3R5cGUsICd0aGVuJywgZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlQ29uc3RydWN0b3IoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBuYXRpdmVUaGVuLmNhbGwodGhhdCwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpO1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy82NDBcbiAgICB9LCB7IHVuc2FmZTogdHJ1ZSB9KTtcblxuICAgIC8vIHdyYXAgZmV0Y2ggcmVzdWx0XG4gICAgaWYgKHR5cGVvZiAkZmV0Y2ggPT0gJ2Z1bmN0aW9uJykgJCh7IGdsb2JhbDogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgZm9yY2VkOiB0cnVlIH0sIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgZmV0Y2g6IGZ1bmN0aW9uIGZldGNoKGlucHV0IC8qICwgaW5pdCAqLykge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoUHJvbWlzZUNvbnN0cnVjdG9yLCAkZmV0Y2guYXBwbHkoZ2xvYmFsLCBhcmd1bWVudHMpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4kKHsgZ2xvYmFsOiB0cnVlLCB3cmFwOiB0cnVlLCBmb3JjZWQ6IEZPUkNFRCB9LCB7XG4gIFByb21pc2U6IFByb21pc2VDb25zdHJ1Y3RvclxufSk7XG5cbnNldFRvU3RyaW5nVGFnKFByb21pc2VDb25zdHJ1Y3RvciwgUFJPTUlTRSwgZmFsc2UsIHRydWUpO1xuc2V0U3BlY2llcyhQUk9NSVNFKTtcblxuUHJvbWlzZVdyYXBwZXIgPSBnZXRCdWlsdEluKFBST01JU0UpO1xuXG4vLyBzdGF0aWNzXG4kKHsgdGFyZ2V0OiBQUk9NSVNFLCBzdGF0OiB0cnVlLCBmb3JjZWQ6IEZPUkNFRCB9LCB7XG4gIC8vIGBQcm9taXNlLnJlamVjdGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXByb21pc2UucmVqZWN0XG4gIHJlamVjdDogZnVuY3Rpb24gcmVqZWN0KHIpIHtcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KHRoaXMpO1xuICAgIGNhcGFiaWxpdHkucmVqZWN0LmNhbGwodW5kZWZpbmVkLCByKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcblxuJCh7IHRhcmdldDogUFJPTUlTRSwgc3RhdDogdHJ1ZSwgZm9yY2VkOiBJU19QVVJFIHx8IEZPUkNFRCB9LCB7XG4gIC8vIGBQcm9taXNlLnJlc29sdmVgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1wcm9taXNlLnJlc29sdmVcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSh4KSB7XG4gICAgcmV0dXJuIHByb21pc2VSZXNvbHZlKElTX1BVUkUgJiYgdGhpcyA9PT0gUHJvbWlzZVdyYXBwZXIgPyBQcm9taXNlQ29uc3RydWN0b3IgOiB0aGlzLCB4KTtcbiAgfVxufSk7XG5cbiQoeyB0YXJnZXQ6IFBST01JU0UsIHN0YXQ6IHRydWUsIGZvcmNlZDogSU5DT1JSRUNUX0lURVJBVElPTiB9LCB7XG4gIC8vIGBQcm9taXNlLmFsbGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXByb21pc2UuYWxsXG4gIGFsbDogZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKSB7XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkcHJvbWlzZVJlc29sdmUgPSBhRnVuY3Rpb24oQy5yZXNvbHZlKTtcbiAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgIHZhciByZW1haW5pbmcgPSAxO1xuICAgICAgaXRlcmF0ZShpdGVyYWJsZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gY291bnRlcisrO1xuICAgICAgICB2YXIgYWxyZWFkeUNhbGxlZCA9IGZhbHNlO1xuICAgICAgICB2YWx1ZXMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICByZW1haW5pbmcrKztcbiAgICAgICAgJHByb21pc2VSZXNvbHZlLmNhbGwoQywgcHJvbWlzZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAoYWxyZWFkeUNhbGxlZCkgcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9KTtcbiAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSByZWplY3QocmVzdWx0LnZhbHVlKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9LFxuICAvLyBgUHJvbWlzZS5yYWNlYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcHJvbWlzZS5yYWNlXG4gIHJhY2U6IGZ1bmN0aW9uIHJhY2UoaXRlcmFibGUpIHtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgICB2YXIgcmVqZWN0ID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIHJlc3VsdCA9IHBlcmZvcm0oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRwcm9taXNlUmVzb2x2ZSA9IGFGdW5jdGlvbihDLnJlc29sdmUpO1xuICAgICAgaXRlcmF0ZShpdGVyYWJsZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgJHByb21pc2VSZXNvbHZlLmNhbGwoQywgcHJvbWlzZSkudGhlbihjYXBhYmlsaXR5LnJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSByZWplY3QocmVzdWx0LnZhbHVlKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLWZ1bmN0aW9uJyk7XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGVyZm9ybScpO1xudmFyIGl0ZXJhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0ZScpO1xuXG4vLyBgUHJvbWlzZS5hbGxTZXR0bGVkYCBtZXRob2Rcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLXByb21pc2UtYWxsU2V0dGxlZFxuJCh7IHRhcmdldDogJ1Byb21pc2UnLCBzdGF0OiB0cnVlIH0sIHtcbiAgYWxsU2V0dGxlZDogZnVuY3Rpb24gYWxsU2V0dGxlZChpdGVyYWJsZSkge1xuICAgIHZhciBDID0gdGhpcztcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlLmYoQyk7XG4gICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBwcm9taXNlUmVzb2x2ZSA9IGFGdW5jdGlvbihDLnJlc29sdmUpO1xuICAgICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IDE7XG4gICAgICBpdGVyYXRlKGl0ZXJhYmxlLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICB2YXIgaW5kZXggPSBjb3VudGVyKys7XG4gICAgICAgIHZhciBhbHJlYWR5Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICBwcm9taXNlUmVzb2x2ZS5jYWxsKEMsIHByb21pc2UpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGFscmVhZHlDYWxsZWQpIHJldHVybjtcbiAgICAgICAgICBhbHJlYWR5Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0geyBzdGF0dXM6ICdmdWxmaWxsZWQnLCB2YWx1ZTogdmFsdWUgfTtcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKGFscmVhZHlDYWxsZWQpIHJldHVybjtcbiAgICAgICAgICBhbHJlYWR5Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0geyBzdGF0dXM6ICdyZWplY3RlZCcsIHJlYXNvbjogZSB9O1xuICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSByZWplY3QocmVzdWx0LnZhbHVlKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xudmFyIE5hdGl2ZVByb21pc2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXByb21pc2UtY29uc3RydWN0b3InKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciBwcm9taXNlUmVzb2x2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wcm9taXNlLXJlc29sdmUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xuXG4vLyBTYWZhcmkgYnVnIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0yMDA4MjlcbnZhciBOT05fR0VORVJJQyA9ICEhTmF0aXZlUHJvbWlzZSAmJiBmYWlscyhmdW5jdGlvbiAoKSB7XG4gIE5hdGl2ZVByb21pc2UucHJvdG90eXBlWydmaW5hbGx5J10uY2FsbCh7IHRoZW46IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfSB9LCBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH0pO1xufSk7XG5cbi8vIGBQcm9taXNlLnByb3RvdHlwZS5maW5hbGx5YCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXByb21pc2UucHJvdG90eXBlLmZpbmFsbHlcbiQoeyB0YXJnZXQ6ICdQcm9taXNlJywgcHJvdG86IHRydWUsIHJlYWw6IHRydWUsIGZvcmNlZDogTk9OX0dFTkVSSUMgfSwge1xuICAnZmluYWxseSc6IGZ1bmN0aW9uIChvbkZpbmFsbHkpIHtcbiAgICB2YXIgQyA9IHNwZWNpZXNDb25zdHJ1Y3Rvcih0aGlzLCBnZXRCdWlsdEluKCdQcm9taXNlJykpO1xuICAgIHZhciBpc0Z1bmN0aW9uID0gdHlwZW9mIG9uRmluYWxseSA9PSAnZnVuY3Rpb24nO1xuICAgIHJldHVybiB0aGlzLnRoZW4oXG4gICAgICBpc0Z1bmN0aW9uID8gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlKEMsIG9uRmluYWxseSgpKS50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHg7IH0pO1xuICAgICAgfSA6IG9uRmluYWxseSxcbiAgICAgIGlzRnVuY3Rpb24gPyBmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoQywgb25GaW5hbGx5KCkpLnRoZW4oZnVuY3Rpb24gKCkgeyB0aHJvdyBlOyB9KTtcbiAgICAgIH0gOiBvbkZpbmFsbHlcbiAgICApO1xuICB9XG59KTtcblxuLy8gcGF0Y2ggbmF0aXZlIFByb21pc2UucHJvdG90eXBlIGZvciBuYXRpdmUgYXN5bmMgZnVuY3Rpb25zXG5pZiAoIUlTX1BVUkUgJiYgdHlwZW9mIE5hdGl2ZVByb21pc2UgPT0gJ2Z1bmN0aW9uJyAmJiAhTmF0aXZlUHJvbWlzZS5wcm90b3R5cGVbJ2ZpbmFsbHknXSkge1xuICByZWRlZmluZShOYXRpdmVQcm9taXNlLnByb3RvdHlwZSwgJ2ZpbmFsbHknLCBnZXRCdWlsdEluKCdQcm9taXNlJykucHJvdG90eXBlWydmaW5hbGx5J10pO1xufVxuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lcy5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzLnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy93ZWIuZG9tLWNvbGxlY3Rpb25zLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzLnByb21pc2UnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXMucHJvbWlzZS5hbGwtc2V0dGxlZCcpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lcy5wcm9taXNlLmZpbmFsbHknKTtcbnZhciBwYXRoID0gcmVxdWlyZSgnLi4vLi4vaW50ZXJuYWxzL3BhdGgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXRoLlByb21pc2U7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXNldC1wcm90b3R5cGUtb2YnKTtcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZScpO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciBpdGVyYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdGUnKTtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG52YXIgSW50ZXJuYWxTdGF0ZU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbnRlcm5hbC1zdGF0ZScpO1xuXG52YXIgc2V0SW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuc2V0O1xudmFyIGdldEludGVybmFsQWdncmVnYXRlRXJyb3JTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZ2V0dGVyRm9yKCdBZ2dyZWdhdGVFcnJvcicpO1xuXG52YXIgJEFnZ3JlZ2F0ZUVycm9yID0gZnVuY3Rpb24gQWdncmVnYXRlRXJyb3IoZXJyb3JzLCBtZXNzYWdlKSB7XG4gIHZhciB0aGF0ID0gdGhpcztcbiAgaWYgKCEodGhhdCBpbnN0YW5jZW9mICRBZ2dyZWdhdGVFcnJvcikpIHJldHVybiBuZXcgJEFnZ3JlZ2F0ZUVycm9yKGVycm9ycywgbWVzc2FnZSk7XG4gIGlmIChzZXRQcm90b3R5cGVPZikge1xuICAgIHRoYXQgPSBzZXRQcm90b3R5cGVPZihuZXcgRXJyb3IobWVzc2FnZSksIGdldFByb3RvdHlwZU9mKHRoYXQpKTtcbiAgfVxuICB2YXIgZXJyb3JzQXJyYXkgPSBbXTtcbiAgaXRlcmF0ZShlcnJvcnMsIGVycm9yc0FycmF5LnB1c2gsIGVycm9yc0FycmF5KTtcbiAgaWYgKERFU0NSSVBUT1JTKSBzZXRJbnRlcm5hbFN0YXRlKHRoYXQsIHsgZXJyb3JzOiBlcnJvcnNBcnJheSwgdHlwZTogJ0FnZ3JlZ2F0ZUVycm9yJyB9KTtcbiAgZWxzZSB0aGF0LmVycm9ycyA9IGVycm9yc0FycmF5O1xuICBpZiAobWVzc2FnZSAhPT0gdW5kZWZpbmVkKSBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkodGhhdCwgJ21lc3NhZ2UnLCBTdHJpbmcobWVzc2FnZSkpO1xuICByZXR1cm4gdGhhdDtcbn07XG5cbiRBZ2dyZWdhdGVFcnJvci5wcm90b3R5cGUgPSBjcmVhdGUoRXJyb3IucHJvdG90eXBlLCB7XG4gIGNvbnN0cnVjdG9yOiBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoNSwgJEFnZ3JlZ2F0ZUVycm9yKSxcbiAgbWVzc2FnZTogY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKDUsICcnKSxcbiAgbmFtZTogY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKDUsICdBZ2dyZWdhdGVFcnJvcicpXG59KTtcblxuaWYgKERFU0NSSVBUT1JTKSBkZWZpbmVQcm9wZXJ0eS5mKCRBZ2dyZWdhdGVFcnJvci5wcm90b3R5cGUsICdlcnJvcnMnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnZXRJbnRlcm5hbEFnZ3JlZ2F0ZUVycm9yU3RhdGUodGhpcykuZXJyb3JzO1xuICB9LFxuICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG4kKHsgZ2xvYmFsOiB0cnVlIH0sIHtcbiAgQWdncmVnYXRlRXJyb3I6ICRBZ2dyZWdhdGVFcnJvclxufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uZXctcHJvbWlzZS1jYXBhYmlsaXR5Jyk7XG52YXIgcGVyZm9ybSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wZXJmb3JtJyk7XG5cbi8vIGBQcm9taXNlLnRyeWAgbWV0aG9kXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1wcm9taXNlLXRyeVxuJCh7IHRhcmdldDogJ1Byb21pc2UnLCBzdGF0OiB0cnVlIH0sIHtcbiAgJ3RyeSc6IGZ1bmN0aW9uIChjYWxsYmFja2ZuKSB7XG4gICAgdmFyIHByb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZih0aGlzKTtcbiAgICB2YXIgcmVzdWx0ID0gcGVyZm9ybShjYWxsYmFja2ZuKTtcbiAgICAocmVzdWx0LmVycm9yID8gcHJvbWlzZUNhcGFiaWxpdHkucmVqZWN0IDogcHJvbWlzZUNhcGFiaWxpdHkucmVzb2x2ZSkocmVzdWx0LnZhbHVlKTtcbiAgICByZXR1cm4gcHJvbWlzZUNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xudmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGVyZm9ybScpO1xudmFyIGl0ZXJhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0ZScpO1xuXG52YXIgUFJPTUlTRV9BTllfRVJST1IgPSAnTm8gb25lIHByb21pc2UgcmVzb2x2ZWQnO1xuXG4vLyBgUHJvbWlzZS5hbnlgIG1ldGhvZFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcHJvbWlzZS1hbnlcbiQoeyB0YXJnZXQ6ICdQcm9taXNlJywgc3RhdDogdHJ1ZSB9LCB7XG4gIGFueTogZnVuY3Rpb24gYW55KGl0ZXJhYmxlKSB7XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZihDKTtcbiAgICB2YXIgcmVzb2x2ZSA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICB2YXIgcmVqZWN0ID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIHJlc3VsdCA9IHBlcmZvcm0oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHByb21pc2VSZXNvbHZlID0gYUZ1bmN0aW9uKEMucmVzb2x2ZSk7XG4gICAgICB2YXIgZXJyb3JzID0gW107XG4gICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICB2YXIgcmVtYWluaW5nID0gMTtcbiAgICAgIHZhciBhbHJlYWR5UmVzb2x2ZWQgPSBmYWxzZTtcbiAgICAgIGl0ZXJhdGUoaXRlcmFibGUsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGNvdW50ZXIrKztcbiAgICAgICAgdmFyIGFscmVhZHlSZWplY3RlZCA9IGZhbHNlO1xuICAgICAgICBlcnJvcnMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICByZW1haW5pbmcrKztcbiAgICAgICAgcHJvbWlzZVJlc29sdmUuY2FsbChDLCBwcm9taXNlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmIChhbHJlYWR5UmVqZWN0ZWQgfHwgYWxyZWFkeVJlc29sdmVkKSByZXR1cm47XG4gICAgICAgICAgYWxyZWFkeVJlc29sdmVkID0gdHJ1ZTtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBpZiAoYWxyZWFkeVJlamVjdGVkIHx8IGFscmVhZHlSZXNvbHZlZCkgcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlSZWplY3RlZCA9IHRydWU7XG4gICAgICAgICAgZXJyb3JzW2luZGV4XSA9IGU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVqZWN0KG5ldyAoZ2V0QnVpbHRJbignQWdncmVnYXRlRXJyb3InKSkoZXJyb3JzLCBQUk9NSVNFX0FOWV9FUlJPUikpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgLS1yZW1haW5pbmcgfHwgcmVqZWN0KG5ldyAoZ2V0QnVpbHRJbignQWdncmVnYXRlRXJyb3InKSkoZXJyb3JzLCBQUk9NSVNFX0FOWV9FUlJPUikpO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQuZXJyb3IpIHJlamVjdChyZXN1bHQudmFsdWUpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pO1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcblxuLy8gYElzQXJyYXlgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXNhcnJheVxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjbGFzc29mKGFyZykgPT0gJ0FycmF5Jztcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1hcnJheScpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xuXG4vLyBgQXJyYXlTcGVjaWVzQ3JlYXRlYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5c3BlY2llc2NyZWF0ZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3JpZ2luYWxBcnJheSwgbGVuZ3RoKSB7XG4gIHZhciBDO1xuICBpZiAoaXNBcnJheShvcmlnaW5hbEFycmF5KSkge1xuICAgIEMgPSBvcmlnaW5hbEFycmF5LmNvbnN0cnVjdG9yO1xuICAgIC8vIGNyb3NzLXJlYWxtIGZhbGxiYWNrXG4gICAgaWYgKHR5cGVvZiBDID09ICdmdW5jdGlvbicgJiYgKEMgPT09IEFycmF5IHx8IGlzQXJyYXkoQy5wcm90b3R5cGUpKSkgQyA9IHVuZGVmaW5lZDtcbiAgICBlbHNlIGlmIChpc09iamVjdChDKSkge1xuICAgICAgQyA9IENbU1BFQ0lFU107XG4gICAgICBpZiAoQyA9PT0gbnVsbCkgQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIG5ldyAoQyA9PT0gdW5kZWZpbmVkID8gQXJyYXkgOiBDKShsZW5ndGggPT09IDAgPyAwIDogbGVuZ3RoKTtcbn07XG4iLCJ2YXIgYmluZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mdW5jdGlvbi1iaW5kLWNvbnRleHQnKTtcbnZhciBJbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0Jyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgYXJyYXlTcGVjaWVzQ3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LXNwZWNpZXMtY3JlYXRlJyk7XG5cbnZhciBwdXNoID0gW10ucHVzaDtcblxuLy8gYEFycmF5LnByb3RvdHlwZS57IGZvckVhY2gsIG1hcCwgZmlsdGVyLCBzb21lLCBldmVyeSwgZmluZCwgZmluZEluZGV4IH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoVFlQRSkge1xuICB2YXIgSVNfTUFQID0gVFlQRSA9PSAxO1xuICB2YXIgSVNfRklMVEVSID0gVFlQRSA9PSAyO1xuICB2YXIgSVNfU09NRSA9IFRZUEUgPT0gMztcbiAgdmFyIElTX0VWRVJZID0gVFlQRSA9PSA0O1xuICB2YXIgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNjtcbiAgdmFyIE5PX0hPTEVTID0gVFlQRSA9PSA1IHx8IElTX0ZJTkRfSU5ERVg7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIGNhbGxiYWNrZm4sIHRoYXQsIHNwZWNpZmljQ3JlYXRlKSB7XG4gICAgdmFyIE8gPSB0b09iamVjdCgkdGhpcyk7XG4gICAgdmFyIHNlbGYgPSBJbmRleGVkT2JqZWN0KE8pO1xuICAgIHZhciBib3VuZEZ1bmN0aW9uID0gYmluZChjYWxsYmFja2ZuLCB0aGF0LCAzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIGNyZWF0ZSA9IHNwZWNpZmljQ3JlYXRlIHx8IGFycmF5U3BlY2llc0NyZWF0ZTtcbiAgICB2YXIgdGFyZ2V0ID0gSVNfTUFQID8gY3JlYXRlKCR0aGlzLCBsZW5ndGgpIDogSVNfRklMVEVSID8gY3JlYXRlKCR0aGlzLCAwKSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgdmFsdWUsIHJlc3VsdDtcbiAgICBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKE5PX0hPTEVTIHx8IGluZGV4IGluIHNlbGYpIHtcbiAgICAgIHZhbHVlID0gc2VsZltpbmRleF07XG4gICAgICByZXN1bHQgPSBib3VuZEZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgTyk7XG4gICAgICBpZiAoVFlQRSkge1xuICAgICAgICBpZiAoSVNfTUFQKSB0YXJnZXRbaW5kZXhdID0gcmVzdWx0OyAvLyBtYXBcbiAgICAgICAgZWxzZSBpZiAocmVzdWx0KSBzd2l0Y2ggKFRZUEUpIHtcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgLy8gc29tZVxuICAgICAgICAgIGNhc2UgNTogcmV0dXJuIHZhbHVlOyAgICAgICAgICAgICAvLyBmaW5kXG4gICAgICAgICAgY2FzZSA2OiByZXR1cm4gaW5kZXg7ICAgICAgICAgICAgIC8vIGZpbmRJbmRleFxuICAgICAgICAgIGNhc2UgMjogcHVzaC5jYWxsKHRhcmdldCwgdmFsdWUpOyAvLyBmaWx0ZXJcbiAgICAgICAgfSBlbHNlIGlmIChJU19FVkVSWSkgcmV0dXJuIGZhbHNlOyAgLy8gZXZlcnlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIElTX0ZJTkRfSU5ERVggPyAtMSA6IElTX1NPTUUgfHwgSVNfRVZFUlkgPyBJU19FVkVSWSA6IHRhcmdldDtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxuICBmb3JFYWNoOiBjcmVhdGVNZXRob2QoMCksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUubWFwYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLm1hcFxuICBtYXA6IGNyZWF0ZU1ldGhvZCgxKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maWx0ZXJgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmlsdGVyXG4gIGZpbHRlcjogY3JlYXRlTWV0aG9kKDIpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLnNvbWVgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuc29tZVxuICBzb21lOiBjcmVhdGVNZXRob2QoMyksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZXZlcnlgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZXZlcnlcbiAgZXZlcnk6IGNyZWF0ZU1ldGhvZCg0KSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maW5kYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbmRcbiAgZmluZDogY3JlYXRlTWV0aG9kKDUpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maW5kSW5kZXhcbiAgZmluZEluZGV4OiBjcmVhdGVNZXRob2QoNilcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTUVUSE9EX05BTUUsIGFyZ3VtZW50KSB7XG4gIHZhciBtZXRob2QgPSBbXVtNRVRIT0RfTkFNRV07XG4gIHJldHVybiAhIW1ldGhvZCAmJiBmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtY2FsbCxuby10aHJvdy1saXRlcmFsXG4gICAgbWV0aG9kLmNhbGwobnVsbCwgYXJndW1lbnQgfHwgZnVuY3Rpb24gKCkgeyB0aHJvdyAxOyB9LCAxKTtcbiAgfSk7XG59O1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbnZhciBjYWNoZSA9IHt9O1xuXG52YXIgdGhyb3dlciA9IGZ1bmN0aW9uIChpdCkgeyB0aHJvdyBpdDsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTUVUSE9EX05BTUUsIG9wdGlvbnMpIHtcbiAgaWYgKGhhcyhjYWNoZSwgTUVUSE9EX05BTUUpKSByZXR1cm4gY2FjaGVbTUVUSE9EX05BTUVdO1xuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcbiAgdmFyIG1ldGhvZCA9IFtdW01FVEhPRF9OQU1FXTtcbiAgdmFyIEFDQ0VTU09SUyA9IGhhcyhvcHRpb25zLCAnQUNDRVNTT1JTJykgPyBvcHRpb25zLkFDQ0VTU09SUyA6IGZhbHNlO1xuICB2YXIgYXJndW1lbnQwID0gaGFzKG9wdGlvbnMsIDApID8gb3B0aW9uc1swXSA6IHRocm93ZXI7XG4gIHZhciBhcmd1bWVudDEgPSBoYXMob3B0aW9ucywgMSkgPyBvcHRpb25zWzFdIDogdW5kZWZpbmVkO1xuXG4gIHJldHVybiBjYWNoZVtNRVRIT0RfTkFNRV0gPSAhIW1ldGhvZCAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIGlmIChBQ0NFU1NPUlMgJiYgIURFU0NSSVBUT1JTKSByZXR1cm4gdHJ1ZTtcbiAgICB2YXIgTyA9IHsgbGVuZ3RoOiAtMSB9O1xuXG4gICAgaWYgKEFDQ0VTU09SUykgZGVmaW5lUHJvcGVydHkoTywgMSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IHRocm93ZXIgfSk7XG4gICAgZWxzZSBPWzFdID0gMTtcblxuICAgIG1ldGhvZC5jYWxsKE8sIGFyZ3VtZW50MCwgYXJndW1lbnQxKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICRmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWl0ZXJhdGlvbicpLmZvckVhY2g7XG52YXIgYXJyYXlNZXRob2RJc1N0cmljdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1tZXRob2QtaXMtc3RyaWN0Jyk7XG52YXIgYXJyYXlNZXRob2RVc2VzVG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktbWV0aG9kLXVzZXMtdG8tbGVuZ3RoJyk7XG5cbnZhciBTVFJJQ1RfTUVUSE9EID0gYXJyYXlNZXRob2RJc1N0cmljdCgnZm9yRWFjaCcpO1xudmFyIFVTRVNfVE9fTEVOR1RIID0gYXJyYXlNZXRob2RVc2VzVG9MZW5ndGgoJ2ZvckVhY2gnKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS5mb3JFYWNoYCBtZXRob2QgaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5mb3JlYWNoXG5tb2R1bGUuZXhwb3J0cyA9ICghU1RSSUNUX01FVEhPRCB8fCAhVVNFU19UT19MRU5HVEgpID8gZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qICwgdGhpc0FyZyAqLykge1xuICByZXR1cm4gJGZvckVhY2godGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQpO1xufSA6IFtdLmZvckVhY2g7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWZvci1lYWNoJyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxuJCh7IHRhcmdldDogJ0FycmF5JywgcHJvdG86IHRydWUsIGZvcmNlZDogW10uZm9yRWFjaCAhPSBmb3JFYWNoIH0sIHtcbiAgZm9yRWFjaDogZm9yRWFjaFxufSk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZnVuY3Rpb24tYmluZC1jb250ZXh0Jyk7XG5cbnZhciBjYWxsID0gRnVuY3Rpb24uY2FsbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ09OU1RSVUNUT1IsIE1FVEhPRCwgbGVuZ3RoKSB7XG4gIHJldHVybiBiaW5kKGNhbGwsIGdsb2JhbFtDT05TVFJVQ1RPUl0ucHJvdG90eXBlW01FVEhPRF0sIGxlbmd0aCk7XG59O1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lcy5hcnJheS5mb3ItZWFjaCcpO1xudmFyIGVudHJ5VW5iaW5kID0gcmVxdWlyZSgnLi4vLi4vaW50ZXJuYWxzL2VudHJ5LXVuYmluZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVudHJ5VW5iaW5kKCdBcnJheScsICdmb3JFYWNoJyk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIG9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktc3ltYm9scycpO1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1wcm9wZXJ0eS1pcy1lbnVtZXJhYmxlJyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbmRleGVkLW9iamVjdCcpO1xuXG52YXIgbmF0aXZlQXNzaWduID0gT2JqZWN0LmFzc2lnbjtcbnZhciBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuLy8gYE9iamVjdC5hc3NpZ25gIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmFzc2lnblxubW9kdWxlLmV4cG9ydHMgPSAhbmF0aXZlQXNzaWduIHx8IGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgLy8gc2hvdWxkIGhhdmUgY29ycmVjdCBvcmRlciBvZiBvcGVyYXRpb25zIChFZGdlIGJ1ZylcbiAgaWYgKERFU0NSSVBUT1JTICYmIG5hdGl2ZUFzc2lnbih7IGI6IDEgfSwgbmF0aXZlQXNzaWduKGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgZGVmaW5lUHJvcGVydHkodGhpcywgJ2InLCB7XG4gICAgICAgIHZhbHVlOiAzLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgfSk7XG4gICAgfVxuICB9KSwgeyBiOiAyIH0pKS5iICE9PSAxKSByZXR1cm4gdHJ1ZTtcbiAgLy8gc2hvdWxkIHdvcmsgd2l0aCBzeW1ib2xzIGFuZCBzaG91bGQgaGF2ZSBkZXRlcm1pbmlzdGljIHByb3BlcnR5IG9yZGVyIChWOCBidWcpXG4gIHZhciBBID0ge307XG4gIHZhciBCID0ge307XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICB2YXIgc3ltYm9sID0gU3ltYm9sKCk7XG4gIHZhciBhbHBoYWJldCA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCc7XG4gIEFbc3ltYm9sXSA9IDc7XG4gIGFscGhhYmV0LnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChjaHIpIHsgQltjaHJdID0gY2hyOyB9KTtcbiAgcmV0dXJuIG5hdGl2ZUFzc2lnbih7fSwgQSlbc3ltYm9sXSAhPSA3IHx8IG9iamVjdEtleXMobmF0aXZlQXNzaWduKHt9LCBCKSkuam9pbignJykgIT0gYWxwaGFiZXQ7XG59KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHZhciBUID0gdG9PYmplY3QodGFyZ2V0KTtcbiAgdmFyIGFyZ3VtZW50c0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHZhciBpbmRleCA9IDE7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUuZjtcbiAgdmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUuZjtcbiAgd2hpbGUgKGFyZ3VtZW50c0xlbmd0aCA+IGluZGV4KSB7XG4gICAgdmFyIFMgPSBJbmRleGVkT2JqZWN0KGFyZ3VtZW50c1tpbmRleCsrXSk7XG4gICAgdmFyIGtleXMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPyBvYmplY3RLZXlzKFMpLmNvbmNhdChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoUykpIDogb2JqZWN0S2V5cyhTKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIGogPSAwO1xuICAgIHZhciBrZXk7XG4gICAgd2hpbGUgKGxlbmd0aCA+IGopIHtcbiAgICAgIGtleSA9IGtleXNbaisrXTtcbiAgICAgIGlmICghREVTQ1JJUFRPUlMgfHwgcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChTLCBrZXkpKSBUW2tleV0gPSBTW2tleV07XG4gICAgfVxuICB9IHJldHVybiBUO1xufSA6IG5hdGl2ZUFzc2lnbjtcbiIsInZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGFzc2lnbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtYXNzaWduJyk7XG5cbi8vIGBPYmplY3QuYXNzaWduYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5hc3NpZ25cbiQoeyB0YXJnZXQ6ICdPYmplY3QnLCBzdGF0OiB0cnVlLCBmb3JjZWQ6IE9iamVjdC5hc3NpZ24gIT09IGFzc2lnbiB9LCB7XG4gIGFzc2lnbjogYXNzaWduXG59KTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXMub2JqZWN0LmFzc2lnbicpO1xudmFyIHBhdGggPSByZXF1aXJlKCcuLi8uLi9pbnRlcm5hbHMvcGF0aCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGguT2JqZWN0LmFzc2lnbjtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgRE9NSXRlcmFibGVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMnKTtcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWZvci1lYWNoJyk7XG52YXIgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eScpO1xuXG5mb3IgKHZhciBDT0xMRUNUSU9OX05BTUUgaW4gRE9NSXRlcmFibGVzKSB7XG4gIHZhciBDb2xsZWN0aW9uID0gZ2xvYmFsW0NPTExFQ1RJT05fTkFNRV07XG4gIHZhciBDb2xsZWN0aW9uUHJvdG90eXBlID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgLy8gc29tZSBDaHJvbWUgdmVyc2lvbnMgaGF2ZSBub24tY29uZmlndXJhYmxlIG1ldGhvZHMgb24gRE9NVG9rZW5MaXN0XG4gIGlmIChDb2xsZWN0aW9uUHJvdG90eXBlICYmIENvbGxlY3Rpb25Qcm90b3R5cGUuZm9yRWFjaCAhPT0gZm9yRWFjaCkgdHJ5IHtcbiAgICBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoQ29sbGVjdGlvblByb3RvdHlwZSwgJ2ZvckVhY2gnLCBmb3JFYWNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBDb2xsZWN0aW9uUHJvdG90eXBlLmZvckVhY2ggPSBmb3JFYWNoO1xuICB9XG59XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciBJU19QVVJFID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLXB1cmUnKTtcblxudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHZhciB1cmwgPSBuZXcgVVJMKCdiP2E9MSZiPTImYz0zJywgJ2h0dHA6Ly9hJyk7XG4gIHZhciBzZWFyY2hQYXJhbXMgPSB1cmwuc2VhcmNoUGFyYW1zO1xuICB2YXIgcmVzdWx0ID0gJyc7XG4gIHVybC5wYXRobmFtZSA9ICdjJTIwZCc7XG4gIHNlYXJjaFBhcmFtcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgc2VhcmNoUGFyYW1zWydkZWxldGUnXSgnYicpO1xuICAgIHJlc3VsdCArPSBrZXkgKyB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiAoSVNfUFVSRSAmJiAhdXJsLnRvSlNPTilcbiAgICB8fCAhc2VhcmNoUGFyYW1zLnNvcnRcbiAgICB8fCB1cmwuaHJlZiAhPT0gJ2h0dHA6Ly9hL2MlMjBkP2E9MSZjPTMnXG4gICAgfHwgc2VhcmNoUGFyYW1zLmdldCgnYycpICE9PSAnMydcbiAgICB8fCBTdHJpbmcobmV3IFVSTFNlYXJjaFBhcmFtcygnP2E9MScpKSAhPT0gJ2E9MSdcbiAgICB8fCAhc2VhcmNoUGFyYW1zW0lURVJBVE9SXVxuICAgIC8vIHRocm93cyBpbiBFZGdlXG4gICAgfHwgbmV3IFVSTCgnaHR0cHM6Ly9hQGInKS51c2VybmFtZSAhPT0gJ2EnXG4gICAgfHwgbmV3IFVSTFNlYXJjaFBhcmFtcyhuZXcgVVJMU2VhcmNoUGFyYW1zKCdhPWInKSkuZ2V0KCdhJykgIT09ICdiJ1xuICAgIC8vIG5vdCBwdW55Y29kZWQgaW4gRWRnZVxuICAgIHx8IG5ldyBVUkwoJ2h0dHA6Ly/RgtC10YHRgicpLmhvc3QgIT09ICd4bi0tZTFheWJjJ1xuICAgIC8vIG5vdCBlc2NhcGVkIGluIENocm9tZSA2Mi1cbiAgICB8fCBuZXcgVVJMKCdodHRwOi8vYSPQsScpLmhhc2ggIT09ICcjJUQwJUIxJ1xuICAgIC8vIGZhaWxzIGluIENocm9tZSA2Ni1cbiAgICB8fCByZXN1bHQgIT09ICdhMWMzJ1xuICAgIC8vIHRocm93cyBpbiBTYWZhcmlcbiAgICB8fCBuZXcgVVJMKCdodHRwOi8veCcsIHVuZGVmaW5lZCkuaG9zdCAhPT0gJ3gnO1xufSk7XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgZ2V0SXRlcmF0b3JNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgaXRlcmF0b3JNZXRob2QgPSBnZXRJdGVyYXRvck1ldGhvZChpdCk7XG4gIGlmICh0eXBlb2YgaXRlcmF0b3JNZXRob2QgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IFR5cGVFcnJvcihTdHJpbmcoaXQpICsgJyBpcyBub3QgaXRlcmFibGUnKTtcbiAgfSByZXR1cm4gYW5PYmplY3QoaXRlcmF0b3JNZXRob2QuY2FsbChpdCkpO1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIFRPRE86IGluIGNvcmUtanNANCwgbW92ZSAvbW9kdWxlcy8gZGVwZW5kZW5jaWVzIHRvIHB1YmxpYyBlbnRyaWVzIGZvciBiZXR0ZXIgb3B0aW1pemF0aW9uIGJ5IHRvb2xzIGxpa2UgYHByZXNldC1lbnZgXG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzLmFycmF5Lml0ZXJhdG9yJyk7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBnZXRCdWlsdEluID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dldC1idWlsdC1pbicpO1xudmFyIFVTRV9OQVRJVkVfVVJMID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25hdGl2ZS11cmwnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIHJlZGVmaW5lQWxsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lLWFsbCcpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgY3JlYXRlSXRlcmF0b3JDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtaXRlcmF0b3ItY29uc3RydWN0b3InKTtcbnZhciBJbnRlcm5hbFN0YXRlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlJyk7XG52YXIgYW5JbnN0YW5jZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1pbnN0YW5jZScpO1xudmFyIGhhc093biA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Z1bmN0aW9uLWJpbmQtY29udGV4dCcpO1xudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZicpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtY3JlYXRlJyk7XG52YXIgY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG52YXIgZ2V0SXRlcmF0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yJyk7XG52YXIgZ2V0SXRlcmF0b3JNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgJGZldGNoID0gZ2V0QnVpbHRJbignZmV0Y2gnKTtcbnZhciBIZWFkZXJzID0gZ2V0QnVpbHRJbignSGVhZGVycycpO1xudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xudmFyIFVSTF9TRUFSQ0hfUEFSQU1TID0gJ1VSTFNlYXJjaFBhcmFtcyc7XG52YXIgVVJMX1NFQVJDSF9QQVJBTVNfSVRFUkFUT1IgPSBVUkxfU0VBUkNIX1BBUkFNUyArICdJdGVyYXRvcic7XG52YXIgc2V0SW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuc2V0O1xudmFyIGdldEludGVybmFsUGFyYW1zU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmdldHRlckZvcihVUkxfU0VBUkNIX1BBUkFNUyk7XG52YXIgZ2V0SW50ZXJuYWxJdGVyYXRvclN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXR0ZXJGb3IoVVJMX1NFQVJDSF9QQVJBTVNfSVRFUkFUT1IpO1xuXG52YXIgcGx1cyA9IC9cXCsvZztcbnZhciBzZXF1ZW5jZXMgPSBBcnJheSg0KTtcblxudmFyIHBlcmNlbnRTZXF1ZW5jZSA9IGZ1bmN0aW9uIChieXRlcykge1xuICByZXR1cm4gc2VxdWVuY2VzW2J5dGVzIC0gMV0gfHwgKHNlcXVlbmNlc1tieXRlcyAtIDFdID0gUmVnRXhwKCcoKD86JVtcXFxcZGEtZl17Mn0peycgKyBieXRlcyArICd9KScsICdnaScpKTtcbn07XG5cbnZhciBwZXJjZW50RGVjb2RlID0gZnVuY3Rpb24gKHNlcXVlbmNlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzZXF1ZW5jZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHNlcXVlbmNlO1xuICB9XG59O1xuXG52YXIgZGVzZXJpYWxpemUgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIHJlc3VsdCA9IGl0LnJlcGxhY2UocGx1cywgJyAnKTtcbiAgdmFyIGJ5dGVzID0gNDtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgd2hpbGUgKGJ5dGVzKSB7XG4gICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShwZXJjZW50U2VxdWVuY2UoYnl0ZXMtLSksIHBlcmNlbnREZWNvZGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuXG52YXIgZmluZCA9IC9bIScoKX5dfCUyMC9nO1xuXG52YXIgcmVwbGFjZSA9IHtcbiAgJyEnOiAnJTIxJyxcbiAgXCInXCI6ICclMjcnLFxuICAnKCc6ICclMjgnLFxuICAnKSc6ICclMjknLFxuICAnfic6ICclN0UnLFxuICAnJTIwJzogJysnXG59O1xuXG52YXIgcmVwbGFjZXIgPSBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgcmV0dXJuIHJlcGxhY2VbbWF0Y2hdO1xufTtcblxudmFyIHNlcmlhbGl6ZSA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGl0KS5yZXBsYWNlKGZpbmQsIHJlcGxhY2VyKTtcbn07XG5cbnZhciBwYXJzZVNlYXJjaFBhcmFtcyA9IGZ1bmN0aW9uIChyZXN1bHQsIHF1ZXJ5KSB7XG4gIGlmIChxdWVyeSkge1xuICAgIHZhciBhdHRyaWJ1dGVzID0gcXVlcnkuc3BsaXQoJyYnKTtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBhdHRyaWJ1dGUsIGVudHJ5O1xuICAgIHdoaWxlIChpbmRleCA8IGF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgICBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2luZGV4KytdO1xuICAgICAgaWYgKGF0dHJpYnV0ZS5sZW5ndGgpIHtcbiAgICAgICAgZW50cnkgPSBhdHRyaWJ1dGUuc3BsaXQoJz0nKTtcbiAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgIGtleTogZGVzZXJpYWxpemUoZW50cnkuc2hpZnQoKSksXG4gICAgICAgICAgdmFsdWU6IGRlc2VyaWFsaXplKGVudHJ5LmpvaW4oJz0nKSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgdXBkYXRlU2VhcmNoUGFyYW1zID0gZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gIHRoaXMuZW50cmllcy5sZW5ndGggPSAwO1xuICBwYXJzZVNlYXJjaFBhcmFtcyh0aGlzLmVudHJpZXMsIHF1ZXJ5KTtcbn07XG5cbnZhciB2YWxpZGF0ZUFyZ3VtZW50c0xlbmd0aCA9IGZ1bmN0aW9uIChwYXNzZWQsIHJlcXVpcmVkKSB7XG4gIGlmIChwYXNzZWQgPCByZXF1aXJlZCkgdGhyb3cgVHlwZUVycm9yKCdOb3QgZW5vdWdoIGFyZ3VtZW50cycpO1xufTtcblxudmFyIFVSTFNlYXJjaFBhcmFtc0l0ZXJhdG9yID0gY3JlYXRlSXRlcmF0b3JDb25zdHJ1Y3RvcihmdW5jdGlvbiBJdGVyYXRvcihwYXJhbXMsIGtpbmQpIHtcbiAgc2V0SW50ZXJuYWxTdGF0ZSh0aGlzLCB7XG4gICAgdHlwZTogVVJMX1NFQVJDSF9QQVJBTVNfSVRFUkFUT1IsXG4gICAgaXRlcmF0b3I6IGdldEl0ZXJhdG9yKGdldEludGVybmFsUGFyYW1zU3RhdGUocGFyYW1zKS5lbnRyaWVzKSxcbiAgICBraW5kOiBraW5kXG4gIH0pO1xufSwgJ0l0ZXJhdG9yJywgZnVuY3Rpb24gbmV4dCgpIHtcbiAgdmFyIHN0YXRlID0gZ2V0SW50ZXJuYWxJdGVyYXRvclN0YXRlKHRoaXMpO1xuICB2YXIga2luZCA9IHN0YXRlLmtpbmQ7XG4gIHZhciBzdGVwID0gc3RhdGUuaXRlcmF0b3IubmV4dCgpO1xuICB2YXIgZW50cnkgPSBzdGVwLnZhbHVlO1xuICBpZiAoIXN0ZXAuZG9uZSkge1xuICAgIHN0ZXAudmFsdWUgPSBraW5kID09PSAna2V5cycgPyBlbnRyeS5rZXkgOiBraW5kID09PSAndmFsdWVzJyA/IGVudHJ5LnZhbHVlIDogW2VudHJ5LmtleSwgZW50cnkudmFsdWVdO1xuICB9IHJldHVybiBzdGVwO1xufSk7XG5cbi8vIGBVUkxTZWFyY2hQYXJhbXNgIGNvbnN0cnVjdG9yXG4vLyBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI2ludGVyZmFjZS11cmxzZWFyY2hwYXJhbXNcbnZhciBVUkxTZWFyY2hQYXJhbXNDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uIFVSTFNlYXJjaFBhcmFtcygvKiBpbml0ICovKSB7XG4gIGFuSW5zdGFuY2UodGhpcywgVVJMU2VhcmNoUGFyYW1zQ29uc3RydWN0b3IsIFVSTF9TRUFSQ0hfUEFSQU1TKTtcbiAgdmFyIGluaXQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZDtcbiAgdmFyIHRoYXQgPSB0aGlzO1xuICB2YXIgZW50cmllcyA9IFtdO1xuICB2YXIgaXRlcmF0b3JNZXRob2QsIGl0ZXJhdG9yLCBuZXh0LCBzdGVwLCBlbnRyeUl0ZXJhdG9yLCBlbnRyeU5leHQsIGZpcnN0LCBzZWNvbmQsIGtleTtcblxuICBzZXRJbnRlcm5hbFN0YXRlKHRoYXQsIHtcbiAgICB0eXBlOiBVUkxfU0VBUkNIX1BBUkFNUyxcbiAgICBlbnRyaWVzOiBlbnRyaWVzLFxuICAgIHVwZGF0ZVVSTDogZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9LFxuICAgIHVwZGF0ZVNlYXJjaFBhcmFtczogdXBkYXRlU2VhcmNoUGFyYW1zXG4gIH0pO1xuXG4gIGlmIChpbml0ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaXNPYmplY3QoaW5pdCkpIHtcbiAgICAgIGl0ZXJhdG9yTWV0aG9kID0gZ2V0SXRlcmF0b3JNZXRob2QoaW5pdCk7XG4gICAgICBpZiAodHlwZW9mIGl0ZXJhdG9yTWV0aG9kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGl0ZXJhdG9yID0gaXRlcmF0b3JNZXRob2QuY2FsbChpbml0KTtcbiAgICAgICAgbmV4dCA9IGl0ZXJhdG9yLm5leHQ7XG4gICAgICAgIHdoaWxlICghKHN0ZXAgPSBuZXh0LmNhbGwoaXRlcmF0b3IpKS5kb25lKSB7XG4gICAgICAgICAgZW50cnlJdGVyYXRvciA9IGdldEl0ZXJhdG9yKGFuT2JqZWN0KHN0ZXAudmFsdWUpKTtcbiAgICAgICAgICBlbnRyeU5leHQgPSBlbnRyeUl0ZXJhdG9yLm5leHQ7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKGZpcnN0ID0gZW50cnlOZXh0LmNhbGwoZW50cnlJdGVyYXRvcikpLmRvbmUgfHxcbiAgICAgICAgICAgIChzZWNvbmQgPSBlbnRyeU5leHQuY2FsbChlbnRyeUl0ZXJhdG9yKSkuZG9uZSB8fFxuICAgICAgICAgICAgIWVudHJ5TmV4dC5jYWxsKGVudHJ5SXRlcmF0b3IpLmRvbmVcbiAgICAgICAgICApIHRocm93IFR5cGVFcnJvcignRXhwZWN0ZWQgc2VxdWVuY2Ugd2l0aCBsZW5ndGggMicpO1xuICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZmlyc3QudmFsdWUgKyAnJywgdmFsdWU6IHNlY29uZC52YWx1ZSArICcnIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgZm9yIChrZXkgaW4gaW5pdCkgaWYgKGhhc093bihpbml0LCBrZXkpKSBlbnRyaWVzLnB1c2goeyBrZXk6IGtleSwgdmFsdWU6IGluaXRba2V5XSArICcnIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJzZVNlYXJjaFBhcmFtcyhlbnRyaWVzLCB0eXBlb2YgaW5pdCA9PT0gJ3N0cmluZycgPyBpbml0LmNoYXJBdCgwKSA9PT0gJz8nID8gaW5pdC5zbGljZSgxKSA6IGluaXQgOiBpbml0ICsgJycpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIFVSTFNlYXJjaFBhcmFtc1Byb3RvdHlwZSA9IFVSTFNlYXJjaFBhcmFtc0NvbnN0cnVjdG9yLnByb3RvdHlwZTtcblxucmVkZWZpbmVBbGwoVVJMU2VhcmNoUGFyYW1zUHJvdG90eXBlLCB7XG4gIC8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmFwcGVudGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jZG9tLXVybHNlYXJjaHBhcmFtcy1hcHBlbmRcbiAgYXBwZW5kOiBmdW5jdGlvbiBhcHBlbmQobmFtZSwgdmFsdWUpIHtcbiAgICB2YWxpZGF0ZUFyZ3VtZW50c0xlbmd0aChhcmd1bWVudHMubGVuZ3RoLCAyKTtcbiAgICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFBhcmFtc1N0YXRlKHRoaXMpO1xuICAgIHN0YXRlLmVudHJpZXMucHVzaCh7IGtleTogbmFtZSArICcnLCB2YWx1ZTogdmFsdWUgKyAnJyB9KTtcbiAgICBzdGF0ZS51cGRhdGVVUkwoKTtcbiAgfSxcbiAgLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuZGVsZXRlYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyNkb20tdXJsc2VhcmNocGFyYW1zLWRlbGV0ZVxuICAnZGVsZXRlJzogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YWxpZGF0ZUFyZ3VtZW50c0xlbmd0aChhcmd1bWVudHMubGVuZ3RoLCAxKTtcbiAgICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFBhcmFtc1N0YXRlKHRoaXMpO1xuICAgIHZhciBlbnRyaWVzID0gc3RhdGUuZW50cmllcztcbiAgICB2YXIga2V5ID0gbmFtZSArICcnO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgd2hpbGUgKGluZGV4IDwgZW50cmllcy5sZW5ndGgpIHtcbiAgICAgIGlmIChlbnRyaWVzW2luZGV4XS5rZXkgPT09IGtleSkgZW50cmllcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgZWxzZSBpbmRleCsrO1xuICAgIH1cbiAgICBzdGF0ZS51cGRhdGVVUkwoKTtcbiAgfSxcbiAgLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuZ2V0YCBtZXRob2RcbiAgLy8gaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyNkb20tdXJsc2VhcmNocGFyYW1zLWdldFxuICBnZXQ6IGZ1bmN0aW9uIGdldChuYW1lKSB7XG4gICAgdmFsaWRhdGVBcmd1bWVudHNMZW5ndGgoYXJndW1lbnRzLmxlbmd0aCwgMSk7XG4gICAgdmFyIGVudHJpZXMgPSBnZXRJbnRlcm5hbFBhcmFtc1N0YXRlKHRoaXMpLmVudHJpZXM7XG4gICAgdmFyIGtleSA9IG5hbWUgKyAnJztcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGZvciAoOyBpbmRleCA8IGVudHJpZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBpZiAoZW50cmllc1tpbmRleF0ua2V5ID09PSBrZXkpIHJldHVybiBlbnRyaWVzW2luZGV4XS52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG4gIC8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmdldEFsbGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jZG9tLXVybHNlYXJjaHBhcmFtcy1nZXRhbGxcbiAgZ2V0QWxsOiBmdW5jdGlvbiBnZXRBbGwobmFtZSkge1xuICAgIHZhbGlkYXRlQXJndW1lbnRzTGVuZ3RoKGFyZ3VtZW50cy5sZW5ndGgsIDEpO1xuICAgIHZhciBlbnRyaWVzID0gZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZSh0aGlzKS5lbnRyaWVzO1xuICAgIHZhciBrZXkgPSBuYW1lICsgJyc7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgZm9yICg7IGluZGV4IDwgZW50cmllcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGlmIChlbnRyaWVzW2luZGV4XS5rZXkgPT09IGtleSkgcmVzdWx0LnB1c2goZW50cmllc1tpbmRleF0udmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuICAvLyBgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5oYXNgIG1ldGhvZFxuICAvLyBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI2RvbS11cmxzZWFyY2hwYXJhbXMtaGFzXG4gIGhhczogZnVuY3Rpb24gaGFzKG5hbWUpIHtcbiAgICB2YWxpZGF0ZUFyZ3VtZW50c0xlbmd0aChhcmd1bWVudHMubGVuZ3RoLCAxKTtcbiAgICB2YXIgZW50cmllcyA9IGdldEludGVybmFsUGFyYW1zU3RhdGUodGhpcykuZW50cmllcztcbiAgICB2YXIga2V5ID0gbmFtZSArICcnO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgd2hpbGUgKGluZGV4IDwgZW50cmllcy5sZW5ndGgpIHtcbiAgICAgIGlmIChlbnRyaWVzW2luZGV4KytdLmtleSA9PT0ga2V5KSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICAvLyBgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5zZXRgIG1ldGhvZFxuICAvLyBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI2RvbS11cmxzZWFyY2hwYXJhbXMtc2V0XG4gIHNldDogZnVuY3Rpb24gc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgdmFsaWRhdGVBcmd1bWVudHNMZW5ndGgoYXJndW1lbnRzLmxlbmd0aCwgMSk7XG4gICAgdmFyIHN0YXRlID0gZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZSh0aGlzKTtcbiAgICB2YXIgZW50cmllcyA9IHN0YXRlLmVudHJpZXM7XG4gICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgdmFyIGtleSA9IG5hbWUgKyAnJztcbiAgICB2YXIgdmFsID0gdmFsdWUgKyAnJztcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBlbnRyeTtcbiAgICBmb3IgKDsgaW5kZXggPCBlbnRyaWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICAgIGlmIChlbnRyeS5rZXkgPT09IGtleSkge1xuICAgICAgICBpZiAoZm91bmQpIGVudHJpZXMuc3BsaWNlKGluZGV4LS0sIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgZW50cnkudmFsdWUgPSB2YWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFmb3VuZCkgZW50cmllcy5wdXNoKHsga2V5OiBrZXksIHZhbHVlOiB2YWwgfSk7XG4gICAgc3RhdGUudXBkYXRlVVJMKCk7XG4gIH0sXG4gIC8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLnNvcnRgIG1ldGhvZFxuICAvLyBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI2RvbS11cmxzZWFyY2hwYXJhbXMtc29ydFxuICBzb3J0OiBmdW5jdGlvbiBzb3J0KCkge1xuICAgIHZhciBzdGF0ZSA9IGdldEludGVybmFsUGFyYW1zU3RhdGUodGhpcyk7XG4gICAgdmFyIGVudHJpZXMgPSBzdGF0ZS5lbnRyaWVzO1xuICAgIC8vIEFycmF5I3NvcnQgaXMgbm90IHN0YWJsZSBpbiBzb21lIGVuZ2luZXNcbiAgICB2YXIgc2xpY2UgPSBlbnRyaWVzLnNsaWNlKCk7XG4gICAgdmFyIGVudHJ5LCBlbnRyaWVzSW5kZXgsIHNsaWNlSW5kZXg7XG4gICAgZW50cmllcy5sZW5ndGggPSAwO1xuICAgIGZvciAoc2xpY2VJbmRleCA9IDA7IHNsaWNlSW5kZXggPCBzbGljZS5sZW5ndGg7IHNsaWNlSW5kZXgrKykge1xuICAgICAgZW50cnkgPSBzbGljZVtzbGljZUluZGV4XTtcbiAgICAgIGZvciAoZW50cmllc0luZGV4ID0gMDsgZW50cmllc0luZGV4IDwgc2xpY2VJbmRleDsgZW50cmllc0luZGV4KyspIHtcbiAgICAgICAgaWYgKGVudHJpZXNbZW50cmllc0luZGV4XS5rZXkgPiBlbnRyeS5rZXkpIHtcbiAgICAgICAgICBlbnRyaWVzLnNwbGljZShlbnRyaWVzSW5kZXgsIDAsIGVudHJ5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGVudHJpZXNJbmRleCA9PT0gc2xpY2VJbmRleCkgZW50cmllcy5wdXNoKGVudHJ5KTtcbiAgICB9XG4gICAgc3RhdGUudXBkYXRlVVJMKCk7XG4gIH0sXG4gIC8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZFxuICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrIC8qICwgdGhpc0FyZyAqLykge1xuICAgIHZhciBlbnRyaWVzID0gZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZSh0aGlzKS5lbnRyaWVzO1xuICAgIHZhciBib3VuZEZ1bmN0aW9uID0gYmluZChjYWxsYmFjaywgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIGVudHJ5O1xuICAgIHdoaWxlIChpbmRleCA8IGVudHJpZXMubGVuZ3RoKSB7XG4gICAgICBlbnRyeSA9IGVudHJpZXNbaW5kZXgrK107XG4gICAgICBib3VuZEZ1bmN0aW9uKGVudHJ5LnZhbHVlLCBlbnRyeS5rZXksIHRoaXMpO1xuICAgIH1cbiAgfSxcbiAgLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUua2V5c2AgbWV0aG9kXG4gIGtleXM6IGZ1bmN0aW9uIGtleXMoKSB7XG4gICAgcmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXNJdGVyYXRvcih0aGlzLCAna2V5cycpO1xuICB9LFxuICAvLyBgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS52YWx1ZXNgIG1ldGhvZFxuICB2YWx1ZXM6IGZ1bmN0aW9uIHZhbHVlcygpIHtcbiAgICByZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtc0l0ZXJhdG9yKHRoaXMsICd2YWx1ZXMnKTtcbiAgfSxcbiAgLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuZW50cmllc2AgbWV0aG9kXG4gIGVudHJpZXM6IGZ1bmN0aW9uIGVudHJpZXMoKSB7XG4gICAgcmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXNJdGVyYXRvcih0aGlzLCAnZW50cmllcycpO1xuICB9XG59LCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG5cbi8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlW0BAaXRlcmF0b3JdYCBtZXRob2RcbnJlZGVmaW5lKFVSTFNlYXJjaFBhcmFtc1Byb3RvdHlwZSwgSVRFUkFUT1IsIFVSTFNlYXJjaFBhcmFtc1Byb3RvdHlwZS5lbnRyaWVzKTtcblxuLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUudG9TdHJpbmdgIG1ldGhvZFxuLy8gaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmxzZWFyY2hwYXJhbXMtc3RyaW5naWZpY2F0aW9uLWJlaGF2aW9yXG5yZWRlZmluZShVUkxTZWFyY2hQYXJhbXNQcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICB2YXIgZW50cmllcyA9IGdldEludGVybmFsUGFyYW1zU3RhdGUodGhpcykuZW50cmllcztcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgZW50cnk7XG4gIHdoaWxlIChpbmRleCA8IGVudHJpZXMubGVuZ3RoKSB7XG4gICAgZW50cnkgPSBlbnRyaWVzW2luZGV4KytdO1xuICAgIHJlc3VsdC5wdXNoKHNlcmlhbGl6ZShlbnRyeS5rZXkpICsgJz0nICsgc2VyaWFsaXplKGVudHJ5LnZhbHVlKSk7XG4gIH0gcmV0dXJuIHJlc3VsdC5qb2luKCcmJyk7XG59LCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG5cbnNldFRvU3RyaW5nVGFnKFVSTFNlYXJjaFBhcmFtc0NvbnN0cnVjdG9yLCBVUkxfU0VBUkNIX1BBUkFNUyk7XG5cbiQoeyBnbG9iYWw6IHRydWUsIGZvcmNlZDogIVVTRV9OQVRJVkVfVVJMIH0sIHtcbiAgVVJMU2VhcmNoUGFyYW1zOiBVUkxTZWFyY2hQYXJhbXNDb25zdHJ1Y3RvclxufSk7XG5cbi8vIFdyYXAgYGZldGNoYCBmb3IgY29ycmVjdCB3b3JrIHdpdGggcG9seWZpbGxlZCBgVVJMU2VhcmNoUGFyYW1zYFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzY3NFxuaWYgKCFVU0VfTkFUSVZFX1VSTCAmJiB0eXBlb2YgJGZldGNoID09ICdmdW5jdGlvbicgJiYgdHlwZW9mIEhlYWRlcnMgPT0gJ2Z1bmN0aW9uJykge1xuICAkKHsgZ2xvYmFsOiB0cnVlLCBlbnVtZXJhYmxlOiB0cnVlLCBmb3JjZWQ6IHRydWUgfSwge1xuICAgIGZldGNoOiBmdW5jdGlvbiBmZXRjaChpbnB1dCAvKiAsIGluaXQgKi8pIHtcbiAgICAgIHZhciBhcmdzID0gW2lucHV0XTtcbiAgICAgIHZhciBpbml0LCBib2R5LCBoZWFkZXJzO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGluaXQgPSBhcmd1bWVudHNbMV07XG4gICAgICAgIGlmIChpc09iamVjdChpbml0KSkge1xuICAgICAgICAgIGJvZHkgPSBpbml0LmJvZHk7XG4gICAgICAgICAgaWYgKGNsYXNzb2YoYm9keSkgPT09IFVSTF9TRUFSQ0hfUEFSQU1TKSB7XG4gICAgICAgICAgICBoZWFkZXJzID0gaW5pdC5oZWFkZXJzID8gbmV3IEhlYWRlcnMoaW5pdC5oZWFkZXJzKSA6IG5ldyBIZWFkZXJzKCk7XG4gICAgICAgICAgICBpZiAoIWhlYWRlcnMuaGFzKCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICAgICAgICBoZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbml0ID0gY3JlYXRlKGluaXQsIHtcbiAgICAgICAgICAgICAgYm9keTogY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKDAsIFN0cmluZyhib2R5KSksXG4gICAgICAgICAgICAgIGhlYWRlcnM6IGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcigwLCBoZWFkZXJzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFyZ3MucHVzaChpbml0KTtcbiAgICAgIH0gcmV0dXJuICRmZXRjaC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVVJMU2VhcmNoUGFyYW1zOiBVUkxTZWFyY2hQYXJhbXNDb25zdHJ1Y3RvcixcbiAgZ2V0U3RhdGU6IGdldEludGVybmFsUGFyYW1zU3RhdGVcbn07XG4iLCJyZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi51cmwtc2VhcmNoLXBhcmFtcycpO1xudmFyIHBhdGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGF0aCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGguVVJMU2VhcmNoUGFyYW1zO1xuIiwidmFyIHN1cHBvcnQgPSB7XG4gIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gIGJsb2I6XG4gICAgJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiZcbiAgICAnQmxvYicgaW4gc2VsZiAmJlxuICAgIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxufVxuXG5mdW5jdGlvbiBpc0RhdGFWaWV3KG9iaikge1xuICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbn1cblxuaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gIF1cblxuICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPVxuICAgIEFycmF5QnVmZmVyLmlzVmlldyB8fFxuICAgIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB2aWV3Q2xhc3Nlcy5pbmRleE9mKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSA+IC0xXG4gICAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgfVxuICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5eX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICB9XG4gIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgfVxuICByZXR1cm4gdmFsdWVcbn1cblxuLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbmZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gIHZhciBpdGVyYXRvciA9IHtcbiAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGl0ZXJhdG9yXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdGhpcy5tYXAgPSB7fVxuXG4gIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgfSwgdGhpcylcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdGhpcy5hcHBlbmQoaGVhZGVyWzBdLCBoZWFkZXJbMV0pXG4gICAgfSwgdGhpcylcbiAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgIH0sIHRoaXMpXG4gIH1cbn1cblxuSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlICsgJywgJyArIHZhbHVlIDogdmFsdWVcbn1cblxuSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbn1cblxuSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgfVxuICB9XG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGl0ZW1zID0gW11cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgaXRlbXMucHVzaChuYW1lKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaXRlbXMgPSBbXVxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpdGVtcy5wdXNoKHZhbHVlKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGl0ZW1zID0gW11cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbmlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG59XG5cbmZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gIH1cbiAgYm9keS5ib2R5VXNlZCA9IHRydWVcbn1cblxuZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgIH1cbiAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gIHJldHVybiBwcm9taXNlXG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICByZXR1cm4gcHJvbWlzZVxufVxuXG5mdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gIH1cbiAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICB9IGVsc2Uge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgfVxufVxuXG5mdW5jdGlvbiBCb2R5KCkge1xuICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICBpZiAoIWJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcilcbiAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYm9keSlcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIGNvbnN1bWVkKHRoaXMpIHx8IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgIHJldHVybiByZWplY3RlZFxuICAgIH1cblxuICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlYWRBcnJheUJ1ZmZlckFzVGV4dCh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpKVxuICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgfVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxudmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gIHJldHVybiBtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSA/IHVwY2FzZWQgOiBtZXRob2Rcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcblxuICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgIH1cbiAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbFxuICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KVxuICB9XG5cbiAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnc2FtZS1vcmlnaW4nXG4gIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgfVxuICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gIHRoaXMuc2lnbmFsID0gb3B0aW9ucy5zaWduYWwgfHwgdGhpcy5zaWduYWxcbiAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICB9XG4gIHRoaXMuX2luaXRCb2R5KGJvZHkpXG59XG5cblJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7Ym9keTogdGhpcy5fYm9keUluaXR9KVxufVxuXG5mdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gIGJvZHlcbiAgICAudHJpbSgpXG4gICAgLnNwbGl0KCcmJylcbiAgICAuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgcmV0dXJuIGZvcm1cbn1cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gIC8vIFJlcGxhY2UgaW5zdGFuY2VzIG9mIFxcclxcbiBhbmQgXFxuIGZvbGxvd2VkIGJ5IGF0IGxlYXN0IG9uZSBzcGFjZSBvciBob3Jpem9udGFsIHRhYiB3aXRoIGEgc3BhY2VcbiAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcyMzAjc2VjdGlvbi0zLjJcbiAgdmFyIHByZVByb2Nlc3NlZEhlYWRlcnMgPSByYXdIZWFkZXJzLnJlcGxhY2UoL1xccj9cXG5bXFx0IF0rL2csICcgJylcbiAgcHJlUHJvY2Vzc2VkSGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgIHZhciBrZXkgPSBwYXJ0cy5zaGlmdCgpLnRyaW0oKVxuICAgIGlmIChrZXkpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfVxuICB9KVxuICByZXR1cm4gaGVhZGVyc1xufVxuXG5Cb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbmV4cG9ydCBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzID09PSB1bmRlZmluZWQgPyAyMDAgOiBvcHRpb25zLnN0YXR1c1xuICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG59XG5cbkJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cblJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICB1cmw6IHRoaXMudXJsXG4gIH0pXG59XG5cblJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gIHJldHVybiByZXNwb25zZVxufVxuXG52YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG59XG5cbmV4cG9ydCB2YXIgRE9NRXhjZXB0aW9uID0gc2VsZi5ET01FeGNlcHRpb25cbnRyeSB7XG4gIG5ldyBET01FeGNlcHRpb24oKVxufSBjYXRjaCAoZXJyKSB7XG4gIERPTUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UsIG5hbWUpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHZhciBlcnJvciA9IEVycm9yKG1lc3NhZ2UpXG4gICAgdGhpcy5zdGFjayA9IGVycm9yLnN0YWNrXG4gIH1cbiAgRE9NRXhjZXB0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKVxuICBET01FeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRE9NRXhjZXB0aW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaChpbnB1dCwgaW5pdCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcblxuICAgIGlmIChyZXF1ZXN0LnNpZ25hbCAmJiByZXF1ZXN0LnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBET01FeGNlcHRpb24oJ0Fib3J0ZWQnLCAnQWJvcnRFcnJvcicpKVxuICAgIH1cblxuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgZnVuY3Rpb24gYWJvcnRYaHIoKSB7XG4gICAgICB4aHIuYWJvcnQoKVxuICAgIH1cblxuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgfVxuICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgIH1cblxuICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgIH1cblxuICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgfVxuXG4gICAgeGhyLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdChuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydGVkJywgJ0Fib3J0RXJyb3InKSlcbiAgICB9XG5cbiAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ29taXQnKSB7XG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgIH1cblxuICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICB9KVxuXG4gICAgaWYgKHJlcXVlc3Quc2lnbmFsKSB7XG4gICAgICByZXF1ZXN0LnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0WGhyKVxuXG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIERPTkUgKHN1Y2Nlc3Mgb3IgZmFpbHVyZSlcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgcmVxdWVzdC5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydFhocilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gIH0pXG59XG5cbmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxuXG5pZiAoIXNlbGYuZmV0Y2gpIHtcbiAgc2VsZi5mZXRjaCA9IGZldGNoXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2Vcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQb2x5ZmlsbCBmb3IgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcygpXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9tYXRjaGVzI1BvbHlmaWxsXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcylcbiAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgZnVuY3Rpb24ocykge1xuICAgICAgbGV0IG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpXG4gICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKHMpO1xuICAgICAgbGV0IGkgPSBtYXRjaGVzLmxlbmd0aDtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lbXB0eVxuICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gdGhpcykge31cbiAgICAgIHJldHVybiBpID4gLTE7XG4gICAgfTtcbi8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQb2x5ZmlsbCBmb3IgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCgpXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9jbG9zZXN0I1BvbHlmaWxsXG4gKi9cblxuaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xufVxuXG5pZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uKHMpIHtcbiAgICB2YXIgZWwgPSB0aGlzO1xuXG4gICAgZG8ge1xuICAgICAgaWYgKGVsLm1hdGNoZXMocykpIHJldHVybiBlbDtcbiAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudCB8fCBlbC5wYXJlbnROb2RlO1xuICAgIH0gd2hpbGUgKGVsICE9PSBudWxsICYmIGVsLm5vZGVUeXBlID09PSAxKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUG9seWZpbGwgZm9yIEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZSgpXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ2hpbGROb2RlL3JlbW92ZSNQb2x5ZmlsbFxuICovXG5cbihmdW5jdGlvbihhcnIpIHtcbiAgYXJyLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KCdyZW1vdmUnKSkgcmV0dXJuO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0ZW0sICdyZW1vdmUnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnROb2RlICE9PSBudWxsKVxuICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KShbXG4gIEVsZW1lbnQucHJvdG90eXBlLFxuICBDaGFyYWN0ZXJEYXRhLnByb3RvdHlwZSxcbiAgRG9jdW1lbnRUeXBlLnByb3RvdHlwZVxuXSk7XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUG9seWZpbGwgZm9yIE5vZGVMaXN0LnByb3RvdHlwZS5mb3JFYWNoKClcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlTGlzdC9mb3JFYWNoI1BvbHlmaWxsXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmlmICh3aW5kb3cuTm9kZUxpc3QgJiYgIU5vZGVMaXN0LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gIE5vZGVMaXN0LnByb3RvdHlwZS5mb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG59Il0sIm5hbWVzIjpbImdsb2JhbCIsImRvY3VtZW50IiwiREVTQ1JJUFRPUlMiLCJjcmVhdGVFbGVtZW50IiwiSUU4X0RPTV9ERUZJTkUiLCJkZWZpbmVQcm9wZXJ0eU1vZHVsZSIsInN0b3JlIiwiTkFUSVZFX1NZTUJPTCIsIlN5bWJvbCIsIlVTRV9TWU1CT0xfQVNfVUlEIiwiV2Vha01hcCIsImhhcyIsIk5BVElWRV9XRUFLX01BUCIsIm9iamVjdEhhcyIsIkludGVybmFsU3RhdGVNb2R1bGUiLCJUT19TVFJJTkdfVEFHIiwiVE9fU1RSSU5HX1RBR19TVVBQT1JUIiwidG9TdHJpbmciLCJjbGFzc29mIiwiSW5kZXhlZE9iamVjdCIsInByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlIiwibWluIiwiY3JlYXRlTWV0aG9kIiwicmVxdWlyZSQkMCIsImhpZGRlbktleXMiLCJpbnRlcm5hbE9iamVjdEtleXMiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiaXNGb3JjZWQiLCJDT1JSRUNUX1BST1RPVFlQRV9HRVRURVIiLCJnZXRQcm90b3R5cGVPZiIsIklFX1BST1RPIiwiZGVmaW5lUHJvcGVydGllcyIsIkl0ZXJhdG9yUHJvdG90eXBlIiwicmV0dXJuVGhpcyIsImNyZWF0ZSIsIkl0ZXJhdG9ycyIsIkl0ZXJhdG9yc0NvcmUiLCJCVUdHWV9TQUZBUklfSVRFUkFUT1JTIiwiSVRFUkFUT1IiLCJzZXRQcm90b3R5cGVPZiIsIiQiLCJzZXRJbnRlcm5hbFN0YXRlIiwiZ2V0SW50ZXJuYWxTdGF0ZSIsIkFycmF5SXRlcmF0b3JNZXRob2RzIiwiRE9NSXRlcmFibGVzIiwiQXJyYXlQcm90b3R5cGUiLCJhRnVuY3Rpb24iLCJiaW5kIiwiU1BFQ0lFUyIsInVzZXJBZ2VudCIsInNldCIsImFyZ3VtZW50cyIsIklTX0lPUyIsInJlcXVpcmUkJDEiLCJwcm9jZXNzIiwiUHJvbWlzZSIsInRhc2siLCJOYXRpdmVQcm9taXNlIiwiVHlwZUVycm9yIiwibmV3UHJvbWlzZUNhcGFiaWxpdHkiLCJuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZSIsIklTX05PREUiLCJWOF9WRVJTSU9OIiwibm90aWZ5IiwiaXRlcmF0ZSIsImRlZmluZVByb3BlcnR5IiwiZm9yRWFjaCIsImFzc2lnbiIsIkNPTExFQ1RJT05fTkFNRSIsIkNvbGxlY3Rpb24iLCJDb2xsZWN0aW9uUHJvdG90eXBlIiwiSVNfUFVSRSIsIiRmZXRjaCIsImhhc093biIsIlVTRV9OQVRJVkVfVVJMIiwiSGVhZGVycyIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtYXRjaGVzIiwibWF0Y2hlc1NlbGVjdG9yIiwibW96TWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwid2Via2l0TWF0Y2hlc1NlbGVjdG9yIiwicyIsIm93bmVyRG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaSIsImxlbmd0aCIsIml0ZW0iLCJjbG9zZXN0IiwiZWwiLCJwYXJlbnRFbGVtZW50IiwicGFyZW50Tm9kZSIsIm5vZGVUeXBlIiwiYXJyIiwiaGFzT3duUHJvcGVydHkiLCJPYmplY3QiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwid3JpdGFibGUiLCJ2YWx1ZSIsInJlbW92ZSIsInJlbW92ZUNoaWxkIiwiQ2hhcmFjdGVyRGF0YSIsIkRvY3VtZW50VHlwZSIsIndpbmRvdyIsIk5vZGVMaXN0IiwiQXJyYXkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztDQUFBLElBQUksS0FBSyxHQUFHLFVBQVUsRUFBRSxFQUFFO0NBQzFCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDO0NBQ3JDLENBQUMsQ0FBQztBQUNGO0NBQ0E7Q0FDQSxZQUFjO0NBQ2Q7Q0FDQSxFQUFFLEtBQUssQ0FBQyxPQUFPLFVBQVUsSUFBSSxRQUFRLElBQUksVUFBVSxDQUFDO0NBQ3BELEVBQUUsS0FBSyxDQUFDLE9BQU8sTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUM7Q0FDNUMsRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQztDQUN4QyxFQUFFLEtBQUssQ0FBQyxPQUFPQSxjQUFNLElBQUksUUFBUSxJQUFJQSxjQUFNLENBQUM7Q0FDNUM7Q0FDQSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTs7Q0NaM0IsVUFBYyxHQUFHLEtBQUs7O0NDQXRCLFNBQWMsR0FBRyxVQUFVLElBQUksRUFBRTtDQUNqQyxFQUFFLElBQUk7Q0FDTixJQUFJLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3BCLEdBQUcsQ0FBQyxPQUFPLEtBQUssRUFBRTtDQUNsQixJQUFJLE9BQU8sSUFBSSxDQUFDO0NBQ2hCLEdBQUc7Q0FDSCxDQUFDOztDQ0pEO0NBQ0EsZUFBYyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVk7Q0FDcEMsRUFBRSxPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEYsQ0FBQyxDQUFDOztDQ0xGLFlBQWMs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
