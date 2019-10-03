(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var O = 'object';
	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == O && globalThis) ||
	  check(typeof window == O && window) ||
	  check(typeof self == O && self) ||
	  check(typeof commonjsGlobal == O && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
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

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
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

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) { throw TypeError("Can't call method on " + it); }
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
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

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
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

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) { try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ } }
	  if (has(O, P)) { return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]); }
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
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
		f: f$2
	};

	var hide = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    hide(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var isPure = false;

	var shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.2.1',
	  mode:  'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var functionToString = shared('native-function-to-string', Function.toString);

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(functionToString.call(WeakMap));

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

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
	  var store = new WeakMap$1();
	  var wmget = store.get;
	  var wmhas = store.has;
	  var wmset = store.set;
	  set = function (it, metadata) {
	    wmset.call(store, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    hide(it, STATE, metadata);
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
	var TEMPLATE = String(functionToString).split('toString');

	shared('inspectSource', function (it) {
	  return functionToString.call(it);
	});

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) { hide(value, 'name', key); }
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
	  else { hide(O, key, value); }
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || functionToString.call(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
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
	// If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
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
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
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
	      hide(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  } }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	// optional / simple context binding
	var bindContext = function (fn, that, length) {
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

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var Symbol$1 = global_1.Symbol;
	var store$1 = shared('wks');

	var wellKnownSymbol = function (name) {
	  return store$1[name] || (store$1[name] = nativeSymbol && Symbol$1[name]
	    || (nativeSymbol ? Symbol$1 : uid)('Symbol.' + name));
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) { C = undefined; }
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) { C = undefined; }
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = bindContext(callbackfn, that, 3);
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
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var sloppyArrayMethod = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !method || !fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var $forEach = arrayIteration.forEach;


	// `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	var arrayForEach = sloppyArrayMethod('forEach') ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
	  forEach: arrayForEach
	});

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	var nativeAssign = Object.assign;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	// should work with symbols and should have deterministic property order (V8 bug)
	var objectAssign = !nativeAssign || fails(function () {
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

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	var test = {};

	test[TO_STRING_TAG$1] = 'z';

	// `Object.prototype.toString` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	var objectToString = String(test) !== '[object z]' ? function toString() {
	  return '[object ' + classof(this) + ']';
	} : test.toString;

	var ObjectPrototype = Object.prototype;

	// `Object.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	if (objectToString !== ObjectPrototype.toString) {
	  redefine(ObjectPrototype, 'toString', objectToString, { unsafe: true });
	}

	var nativePromiseConstructor = global_1.Promise;

	var redefineAll = function (target, src, options) {
	  for (var key in src) { redefine(target, key, src[key], options); }
	  return target;
	};

	var defineProperty = objectDefineProperty.f;



	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG$2)) {
	    defineProperty(it, TO_STRING_TAG$2, { configurable: true, value: TAG });
	  }
	};

	var SPECIES$1 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$1]) {
	    defineProperty(Constructor, SPECIES$1, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var iterators = {};

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayPrototype = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR] === it);
	};

	var ITERATOR$1 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) { return it[ITERATOR$1]
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
	  var boundFunction = bindContext(fn, that, AS_ENTRIES ? 2 : 1);
	  var iterator, iterFn, index, length, result, step;

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

	  while (!(step = iterator.next()).done) {
	    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	    if (result && result instanceof Result) { return result; }
	  } return new Result(false);
	};

	iterate.stop = function (result) {
	  return new Result(true, result);
	};
	});

	var ITERATOR$2 = wellKnownSymbol('iterator');
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
	  iteratorWithReturn[ITERATOR$2] = function () {
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
	    object[ITERATOR$2] = function () {
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

	var SPECIES$2 = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$2]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var html = getBuiltIn('document', 'documentElement');

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
	  } else if (MessageChannel) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = bindContext(port.postMessage, port, 1);
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

	var userAgent = getBuiltIn('navigator', 'userAgent') || '';

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
	  } else if (MutationObserver && !/(iphone|ipod|ipad).*applewebkit/i.test(userAgent)) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
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

	var task$1 = task.set;










	var SPECIES$3 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState = internalState.get;
	var setInternalState = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$2 = global_1.process;
	var $fetch = global_1.fetch;
	var versions = process$2 && process$2.versions;
	var v8 = versions && versions.v8 || '';
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$2) == 'process';
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
	  // correct subclassing with @@species support
	  var promise = PromiseConstructor.resolve(1);
	  var empty = function () { /* empty */ };
	  var FakePromise = (promise.constructor = {})[SPECIES$3] = function (exec) {
	    exec(empty, empty);
	  };
	  // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	  return !((IS_NODE$1 || typeof PromiseRejectionEvent == 'function')
	    && (!isPure || promise['finally'])
	    && promise.then(empty) instanceof FakePromise
	    // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	    // we can't detect it synchronously, so just check versions
	    && v8.indexOf('6.6') !== 0
	    && userAgent.indexOf('Chrome/66') === -1);
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
	          process$2.emit('unhandledRejection', value, promise);
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
	      process$2.emit('rejectionHandled', promise);
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
	    var state = getInternalState(this);
	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    setInternalState(this, {
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
	      reaction.domain = IS_NODE$1 ? process$2.domain : undefined;
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
	    var state = getInternalState(promise);
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
	    });

	    // wrap fetch result
	    if (typeof $fetch == 'function') { _export({ global: true, enumerable: true, forced: true }, {
	      // eslint-disable-next-line no-unused-vars
	      fetch: function fetch(input) {
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

	PromiseWrapper = path[PROMISE];

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

	// `Promise.prototype.finally` method
	// https://tc39.github.io/ecma262/#sec-promise.prototype.finally
	_export({ target: 'Promise', proto: true, real: true }, {
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

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod$2 = function (CONVERT_TO_STRING) {
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
	  codeAt: createMethod$2(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$2(true)
	};

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO = sharedKey('IE_PROTO');
	var ObjectPrototype$1 = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO)) { return O[IE_PROTO]; }
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype$1 : null;
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');
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
	if ( !has(IteratorPrototype, ITERATOR$3)) { hide(IteratorPrototype, ITERATOR$3, returnThis); }

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
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

	var IE_PROTO$1 = sharedKey('IE_PROTO');

	var PROTOTYPE = 'prototype';
	var Empty = function () { /* empty */ };

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var length = enumBugKeys.length;
	  var lt = '<';
	  var script = 'script';
	  var gt = '>';
	  var js = 'java' + script + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  iframe.src = String(js);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (length--) { delete createDict[PROTOTYPE][enumBugKeys[length]]; }
	  return createDict();
	};

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else { result = createDict(); }
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	hiddenKeys[IE_PROTO$1] = true;

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
	var ITERATOR$4 = wellKnownSymbol('iterator');
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
	  var nativeIterator = IterablePrototype[ITERATOR$4]
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
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$4] != 'function') {
	          hide(CurrentIteratorPrototype, ITERATOR$4, returnThis$2);
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
	  if ( IterablePrototype[ITERATOR$4] !== defaultIterator) {
	    hide(IterablePrototype, ITERATOR$4, defaultIterator);
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
	var setInternalState$1 = internalState.set;
	var getInternalState$1 = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$1(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$1(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) { return { value: undefined, done: true }; }
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	var $AggregateError = function AggregateError(errors, message) {
	  var that = this;
	  if (!(that instanceof $AggregateError)) { return new $AggregateError(errors, message); }
	  if (objectSetPrototypeOf) {
	    that = objectSetPrototypeOf(new Error(message), objectGetPrototypeOf(that));
	  }
	  var errorsArray = [];
	  iterate_1(errors, errorsArray.push, errorsArray);
	  hide(that, 'errors', errorsArray);
	  if (message !== undefined) { hide(that, 'message', String(message)); }
	  return that;
	};

	$AggregateError.prototype = objectCreate(Error.prototype, {
	  constructor: createPropertyDescriptor(5, $AggregateError),
	  name: createPropertyDescriptor(5, 'AggregateError')
	});

	_export({ global: true }, {
	  AggregateError: $AggregateError
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

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) { try {
	    hide(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  } }
	}

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype$1 = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
	  hide(ArrayPrototype$1, UNSCOPABLES, objectCreate(null));
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables = function (key) {
	  ArrayPrototype$1[UNSCOPABLES][key] = true;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$2 = internalState.set;
	var getInternalState$2 = internalState.getterFor(ARRAY_ITERATOR);

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
	  setInternalState$2(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$2(this);
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

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME$1 in domIterables) {
	  var Collection$1 = global_1[COLLECTION_NAME$1];
	  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
	  if (CollectionPrototype$1) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype$1[ITERATOR$5] !== ArrayValues) { try {
	      hide(CollectionPrototype$1, ITERATOR$5, ArrayValues);
	    } catch (error) {
	      CollectionPrototype$1[ITERATOR$5] = ArrayValues;
	    } }
	    if (!CollectionPrototype$1[TO_STRING_TAG$3]) { hide(CollectionPrototype$1, TO_STRING_TAG$3, COLLECTION_NAME$1); }
	    if (domIterables[COLLECTION_NAME$1]) { for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) { try {
	        hide(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      } }
	    } }
	  }
	}

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

	function Headers(headers) {
	  this.map = {};

	  if (headers instanceof Headers) {
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

	Headers.prototype.append = function(name, value) {
	  name = normalizeName(name);
	  value = normalizeValue(value);
	  var oldValue = this.map[name];
	  this.map[name] = oldValue ? oldValue + ', ' + value : value;
	};

	Headers.prototype['delete'] = function(name) {
	  delete this.map[normalizeName(name)];
	};

	Headers.prototype.get = function(name) {
	  name = normalizeName(name);
	  return this.has(name) ? this.map[name] : null
	};

	Headers.prototype.has = function(name) {
	  return this.map.hasOwnProperty(normalizeName(name))
	};

	Headers.prototype.set = function(name, value) {
	  this.map[normalizeName(name)] = normalizeValue(value);
	};

	Headers.prototype.forEach = function(callback, thisArg) {
	  for (var name in this.map) {
	    if (this.map.hasOwnProperty(name)) {
	      callback.call(thisArg, this.map[name], name, this);
	    }
	  }
	};

	Headers.prototype.keys = function() {
	  var items = [];
	  this.forEach(function(value, name) {
	    items.push(name);
	  });
	  return iteratorFor(items)
	};

	Headers.prototype.values = function() {
	  var items = [];
	  this.forEach(function(value) {
	    items.push(value);
	  });
	  return iteratorFor(items)
	};

	Headers.prototype.entries = function() {
	  var items = [];
	  this.forEach(function(value, name) {
	    items.push([name, value]);
	  });
	  return iteratorFor(items)
	};

	if (support.iterable) {
	  Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
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
	      this.headers = new Headers(input.headers);
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
	    this.headers = new Headers(options.headers);
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
	  var headers = new Headers();
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
	  this.headers = new Headers(options.headers);
	  this.url = options.url || '';
	  this._initBody(bodyInit);
	}

	Body.call(Response.prototype);

	Response.prototype.clone = function() {
	  return new Response(this._bodyInit, {
	    status: this.status,
	    statusText: this.statusText,
	    headers: new Headers(this.headers),
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
	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;
	}

	/**
	 * Polyfill for Element.prototype.matches()
	 * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
	 */

	/* eslint-disable no-undef */

	if (!Element.prototype.matches) {
	  Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
	    var matches = (this.document || this.ownerDocument).querySelectorAll(s);
	    var i = matches.length; // eslint-disable-next-line no-empty

	    while (--i >= 0 && matches.item(i) !== this) {}

	    return i > -1;
	  };
	}
	/* eslint-enable no-undef */

	/**
	 * Polyfill for Element.prototype.remove()
	 * https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove#Polyfill
	 */

	(function (arr) {
	  arr.forEach(function (item) {
	    if (item.hasOwnProperty('remove')) {
	      return;
	    }

	    Object.defineProperty(item, 'remove', {
	      configurable: true,
	      enumerable: true,
	      writable: true,
	      value: function remove() {
	        if (this.parentNode !== null) {
	          this.parentNode.removeChild(this);
	        }
	      }
	    });
	  });
	})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
	/* eslint-enable no-undef */

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWZpbGxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2xvYmFsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZhaWxzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2Rlc2NyaXB0b3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1wcm9wZXJ0eS1pcy1lbnVtZXJhYmxlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NsYXNzb2YtcmF3LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hhcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pZTgtZG9tLWRlZmluZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FuLW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hpZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2V0LWdsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1wdXJlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NoYXJlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9mdW5jdGlvbi10by1zdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXdlYWstbWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3VpZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zaGFyZWQta2V5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hpZGRlbi1rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlZGVmaW5lLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3BhdGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWludGVnZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tbGVuZ3RoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWFic29sdXRlLWluZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FycmF5LWluY2x1ZGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2VudW0tYnVnLWtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktc3ltYm9scy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vd24ta2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jb3B5LWNvbnN0cnVjdG9yLXByb3BlcnRpZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtZm9yY2VkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2V4cG9ydC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hLWZ1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2JpbmQtY29udGV4dC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtYXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXN5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1pdGVyYXRpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2xvcHB5LWFycmF5LW1ldGhvZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1mb3ItZWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuYXJyYXkuZm9yLWVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWFzc2lnbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMub2JqZWN0LmFzc2lnbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jbGFzc29mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC10by1zdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLm9iamVjdC50by1zdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXByb21pc2UtY29uc3RydWN0b3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVkZWZpbmUtYWxsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NldC10by1zdHJpbmctdGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NldC1zcGVjaWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FuLWluc3RhbmNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2l0ZXJhdG9ycy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1hcnJheS1pdGVyYXRvci1tZXRob2QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jYWxsLXdpdGgtc2FmZS1pdGVyYXRpb24tY2xvc2luZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pdGVyYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NoZWNrLWNvcnJlY3RuZXNzLW9mLWl0ZXJhdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2h0bWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdGFzay5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91c2VyLWFnZW50LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL21pY3JvdGFzay5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9uZXctcHJvbWlzZS1jYXBhYmlsaXR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3Byb21pc2UtcmVzb2x2ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9ob3N0LXJlcG9ydC1lcnJvcnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcGVyZm9ybS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMucHJvbWlzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMucHJvbWlzZS5maW5hbGx5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3N0cmluZy1tdWx0aWJ5dGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY29ycmVjdC1wcm90b3R5cGUtZ2V0dGVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2l0ZXJhdG9ycy1jb3JlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydGllcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtY3JlYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1pdGVyYXRvci1jb25zdHJ1Y3Rvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hLXBvc3NpYmxlLXByb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3Qtc2V0LXByb3RvdHlwZS1vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kZWZpbmUtaXRlcmF0b3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLnN0cmluZy5pdGVyYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXNuZXh0LmFnZ3JlZ2F0ZS1lcnJvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMucHJvbWlzZS5hbGwtc2V0dGxlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXNuZXh0LnByb21pc2UuYW55LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lc25leHQucHJvbWlzZS50cnkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZG9tLWl0ZXJhYmxlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmRvbS1jb2xsZWN0aW9ucy5mb3ItZWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hZGQtdG8tdW5zY29wYWJsZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5Lml0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIuZG9tLWNvbGxlY3Rpb25zLml0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvZWxlbWVudC9tYXRjaGVzLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9lbGVtZW50L3JlbW92ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgTyA9ICdvYmplY3QnO1xudmFyIGNoZWNrID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCAmJiBpdC5NYXRoID09IE1hdGggJiYgaXQ7XG59O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxubW9kdWxlLmV4cG9ydHMgPVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgY2hlY2sodHlwZW9mIGdsb2JhbFRoaXMgPT0gTyAmJiBnbG9iYWxUaGlzKSB8fFxuICBjaGVjayh0eXBlb2Ygd2luZG93ID09IE8gJiYgd2luZG93KSB8fFxuICBjaGVjayh0eXBlb2Ygc2VsZiA9PSBPICYmIHNlbGYpIHx8XG4gIGNoZWNrKHR5cGVvZiBnbG9iYWwgPT0gTyAmJiBnbG9iYWwpIHx8XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xuXG4vLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGUgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG4vLyBOYXNob3JuIH4gSkRLOCBidWdcbnZhciBOQVNIT1JOX0JVRyA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiAhbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh7IDE6IDIgfSwgMSk7XG5cbi8vIGBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlYCBtZXRob2QgaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5wcm90b3R5cGUucHJvcGVydHlpc2VudW1lcmFibGVcbmV4cG9ydHMuZiA9IE5BU0hPUk5fQlVHID8gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoVikge1xuICB2YXIgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLCBWKTtcbiAgcmV0dXJuICEhZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmVudW1lcmFibGU7XG59IDogbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGU7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xuXG52YXIgc3BsaXQgPSAnJy5zcGxpdDtcblxuLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3Ncbm1vZHVsZS5leHBvcnRzID0gZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyB0aHJvd3MgYW4gZXJyb3IgaW4gcmhpbm8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9yaGluby9pc3N1ZXMvMzQ2XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgcmV0dXJuICFPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKTtcbn0pID8gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjbGFzc29mKGl0KSA9PSAnU3RyaW5nJyA/IHNwbGl0LmNhbGwoaXQsICcnKSA6IE9iamVjdChpdCk7XG59IDogT2JqZWN0O1xuIiwiLy8gYFJlcXVpcmVPYmplY3RDb2VyY2libGVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVxdWlyZW9iamVjdGNvZXJjaWJsZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG4iLCIvLyB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIEluZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5kZXhlZC1vYmplY3QnKTtcbnZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gSW5kZXhlZE9iamVjdChyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGl0KSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG5cbi8vIGBUb1ByaW1pdGl2ZWAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b3ByaW1pdGl2ZVxuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbnB1dCwgUFJFRkVSUkVEX1NUUklORykge1xuICBpZiAoIWlzT2JqZWN0KGlucHV0KSkgcmV0dXJuIGlucHV0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYgKFBSRUZFUlJFRF9TVFJJTkcgJiYgdHlwZW9mIChmbiA9IGlucHV0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGlucHV0KSkpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgKGZuID0gaW5wdXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICBpZiAoIVBSRUZFUlJFRF9TVFJJTkcgJiYgdHlwZW9mIChmbiA9IGlucHV0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGlucHV0KSkpIHJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07XG4iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG52YXIgZG9jdW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBFWElTVFMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBFWElTVFMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudCcpO1xuXG4vLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFERVNDUklQVE9SUyAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGNyZWF0ZUVsZW1lbnQoJ2RpdicpLCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH1cbiAgfSkuYSAhPSA3O1xufSk7XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtcHJvcGVydHktaXMtZW51bWVyYWJsZScpO1xudmFyIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyIHRvSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLXByaW1pdGl2ZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pZTgtZG9tLWRlZmluZScpO1xuXG52YXIgbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuLy8gYE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmdldG93bnByb3BlcnR5ZGVzY3JpcHRvclxuZXhwb3J0cy5mID0gREVTQ1JJUFRPUlMgPyBuYXRpdmVHZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCkge1xuICBPID0gdG9JbmRleGVkT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIGlmIChoYXMoTywgUCkpIHJldHVybiBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoIXByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlLmYuY2FsbChPLCBQKSwgT1tQXSk7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkge1xuICAgIHRocm93IFR5cGVFcnJvcihTdHJpbmcoaXQpICsgJyBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2llOC1kb20tZGVmaW5lJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlJyk7XG5cbnZhciBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0eWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuZGVmaW5lcHJvcGVydHlcbmV4cG9ydHMuZiA9IERFU0NSSVBUT1JTID8gbmF0aXZlRGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIG5hdGl2ZURlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgaWYgKCd2YWx1ZScgaW4gQXR0cmlidXRlcykgT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBERVNDUklQVE9SUyA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5TW9kdWxlLmYob2JqZWN0LCBrZXksIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcigxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgaGlkZShnbG9iYWwsIGtleSwgdmFsdWUpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGdsb2JhbFtrZXldID0gdmFsdWU7XG4gIH0gcmV0dXJuIHZhbHVlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZmFsc2U7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgSVNfUFVSRSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1wdXJlJyk7XG5cbnZhciBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJztcbnZhciBzdG9yZSA9IGdsb2JhbFtTSEFSRURdIHx8IHNldEdsb2JhbChTSEFSRUQsIHt9KTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246ICczLjIuMScsXG4gIG1vZGU6IElTX1BVUkUgPyAncHVyZScgOiAnZ2xvYmFsJyxcbiAgY29weXJpZ2h0OiAnwqkgMjAxOSBEZW5pcyBQdXNoa2FyZXYgKHpsb2lyb2NrLnJ1KSdcbn0pO1xuIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaGFyZWQoJ25hdGl2ZS1mdW5jdGlvbi10by1zdHJpbmcnLCBGdW5jdGlvbi50b1N0cmluZyk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZnVuY3Rpb24tdG8tc3RyaW5nJyk7XG5cbnZhciBXZWFrTWFwID0gZ2xvYmFsLldlYWtNYXA7XG5cbm1vZHVsZS5leHBvcnRzID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicgJiYgL25hdGl2ZSBjb2RlLy50ZXN0KG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcuY2FsbChXZWFrTWFwKSk7XG4iLCJ2YXIgaWQgPSAwO1xudmFyIHBvc3RmaXggPSBNYXRoLnJhbmRvbSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJyArIFN0cmluZyhrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5KSArICcpXycgKyAoKytpZCArIHBvc3RmaXgpLnRvU3RyaW5nKDM2KTtcbn07XG4iLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy91aWQnKTtcblxudmFyIGtleXMgPSBzaGFyZWQoJ2tleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBrZXlzW2tleV0gfHwgKGtleXNba2V5XSA9IHVpZChrZXkpKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHt9O1xuIiwidmFyIE5BVElWRV9XRUFLX01BUCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtd2Vhay1tYXAnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG52YXIgb2JqZWN0SGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHNoYXJlZEtleSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQta2V5Jyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG52YXIgV2Vha01hcCA9IGdsb2JhbC5XZWFrTWFwO1xudmFyIHNldCwgZ2V0LCBoYXM7XG5cbnZhciBlbmZvcmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBoYXMoaXQpID8gZ2V0KGl0KSA6IHNldChpdCwge30pO1xufTtcblxudmFyIGdldHRlckZvciA9IGZ1bmN0aW9uIChUWVBFKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoaXQpIHtcbiAgICB2YXIgc3RhdGU7XG4gICAgaWYgKCFpc09iamVjdChpdCkgfHwgKHN0YXRlID0gZ2V0KGl0KSkudHlwZSAhPT0gVFlQRSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCdJbmNvbXBhdGlibGUgcmVjZWl2ZXIsICcgKyBUWVBFICsgJyByZXF1aXJlZCcpO1xuICAgIH0gcmV0dXJuIHN0YXRlO1xuICB9O1xufTtcblxuaWYgKE5BVElWRV9XRUFLX01BUCkge1xuICB2YXIgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICB2YXIgd21nZXQgPSBzdG9yZS5nZXQ7XG4gIHZhciB3bWhhcyA9IHN0b3JlLmhhcztcbiAgdmFyIHdtc2V0ID0gc3RvcmUuc2V0O1xuICBzZXQgPSBmdW5jdGlvbiAoaXQsIG1ldGFkYXRhKSB7XG4gICAgd21zZXQuY2FsbChzdG9yZSwgaXQsIG1ldGFkYXRhKTtcbiAgICByZXR1cm4gbWV0YWRhdGE7XG4gIH07XG4gIGdldCA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiB3bWdldC5jYWxsKHN0b3JlLCBpdCkgfHwge307XG4gIH07XG4gIGhhcyA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiB3bWhhcy5jYWxsKHN0b3JlLCBpdCk7XG4gIH07XG59IGVsc2Uge1xuICB2YXIgU1RBVEUgPSBzaGFyZWRLZXkoJ3N0YXRlJyk7XG4gIGhpZGRlbktleXNbU1RBVEVdID0gdHJ1ZTtcbiAgc2V0ID0gZnVuY3Rpb24gKGl0LCBtZXRhZGF0YSkge1xuICAgIGhpZGUoaXQsIFNUQVRFLCBtZXRhZGF0YSk7XG4gICAgcmV0dXJuIG1ldGFkYXRhO1xuICB9O1xuICBnZXQgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gb2JqZWN0SGFzKGl0LCBTVEFURSkgPyBpdFtTVEFURV0gOiB7fTtcbiAgfTtcbiAgaGFzID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIG9iamVjdEhhcyhpdCwgU1RBVEUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBzZXQsXG4gIGdldDogZ2V0LFxuICBoYXM6IGhhcyxcbiAgZW5mb3JjZTogZW5mb3JjZSxcbiAgZ2V0dGVyRm9yOiBnZXR0ZXJGb3Jcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgc2V0R2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC1nbG9iYWwnKTtcbnZhciBuYXRpdmVGdW5jdGlvblRvU3RyaW5nID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Z1bmN0aW9uLXRvLXN0cmluZycpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcblxudmFyIGdldEludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmdldDtcbnZhciBlbmZvcmNlSW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZW5mb3JjZTtcbnZhciBURU1QTEFURSA9IFN0cmluZyhuYXRpdmVGdW5jdGlvblRvU3RyaW5nKS5zcGxpdCgndG9TdHJpbmcnKTtcblxuc2hhcmVkKCdpbnNwZWN0U291cmNlJywgZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBuYXRpdmVGdW5jdGlvblRvU3RyaW5nLmNhbGwoaXQpO1xufSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBrZXksIHZhbHVlLCBvcHRpb25zKSB7XG4gIHZhciB1bnNhZmUgPSBvcHRpb25zID8gISFvcHRpb25zLnVuc2FmZSA6IGZhbHNlO1xuICB2YXIgc2ltcGxlID0gb3B0aW9ucyA/ICEhb3B0aW9ucy5lbnVtZXJhYmxlIDogZmFsc2U7XG4gIHZhciBub1RhcmdldEdldCA9IG9wdGlvbnMgPyAhIW9wdGlvbnMubm9UYXJnZXRHZXQgOiBmYWxzZTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT0gJ3N0cmluZycgJiYgIWhhcyh2YWx1ZSwgJ25hbWUnKSkgaGlkZSh2YWx1ZSwgJ25hbWUnLCBrZXkpO1xuICAgIGVuZm9yY2VJbnRlcm5hbFN0YXRlKHZhbHVlKS5zb3VyY2UgPSBURU1QTEFURS5qb2luKHR5cGVvZiBrZXkgPT0gJ3N0cmluZycgPyBrZXkgOiAnJyk7XG4gIH1cbiAgaWYgKE8gPT09IGdsb2JhbCkge1xuICAgIGlmIChzaW1wbGUpIE9ba2V5XSA9IHZhbHVlO1xuICAgIGVsc2Ugc2V0R2xvYmFsKGtleSwgdmFsdWUpO1xuICAgIHJldHVybjtcbiAgfSBlbHNlIGlmICghdW5zYWZlKSB7XG4gICAgZGVsZXRlIE9ba2V5XTtcbiAgfSBlbHNlIGlmICghbm9UYXJnZXRHZXQgJiYgT1trZXldKSB7XG4gICAgc2ltcGxlID0gdHJ1ZTtcbiAgfVxuICBpZiAoc2ltcGxlKSBPW2tleV0gPSB2YWx1ZTtcbiAgZWxzZSBoaWRlKE8sIGtleSwgdmFsdWUpO1xuLy8gYWRkIGZha2UgRnVuY3Rpb24jdG9TdHJpbmcgZm9yIGNvcnJlY3Qgd29yayB3cmFwcGVkIG1ldGhvZHMgLyBjb25zdHJ1Y3RvcnMgd2l0aCBtZXRob2RzIGxpa2UgTG9EYXNoIGlzTmF0aXZlXG59KShGdW5jdGlvbi5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyAmJiBnZXRJbnRlcm5hbFN0YXRlKHRoaXMpLnNvdXJjZSB8fCBuYXRpdmVGdW5jdGlvblRvU3RyaW5nLmNhbGwodGhpcyk7XG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xuIiwidmFyIHBhdGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGF0aCcpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcblxudmFyIGFGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICByZXR1cm4gdHlwZW9mIHZhcmlhYmxlID09ICdmdW5jdGlvbicgPyB2YXJpYWJsZSA6IHVuZGVmaW5lZDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWVzcGFjZSwgbWV0aG9kKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGFGdW5jdGlvbihwYXRoW25hbWVzcGFjZV0pIHx8IGFGdW5jdGlvbihnbG9iYWxbbmFtZXNwYWNlXSlcbiAgICA6IHBhdGhbbmFtZXNwYWNlXSAmJiBwYXRoW25hbWVzcGFjZV1bbWV0aG9kXSB8fCBnbG9iYWxbbmFtZXNwYWNlXSAmJiBnbG9iYWxbbmFtZXNwYWNlXVttZXRob2RdO1xufTtcbiIsInZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcblxuLy8gYFRvSW50ZWdlcmAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b2ludGVnZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHJldHVybiBpc05hTihhcmd1bWVudCA9ICthcmd1bWVudCkgPyAwIDogKGFyZ3VtZW50ID4gMCA/IGZsb29yIDogY2VpbCkoYXJndW1lbnQpO1xufTtcbiIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW50ZWdlcicpO1xuXG52YXIgbWluID0gTWF0aC5taW47XG5cbi8vIGBUb0xlbmd0aGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b2xlbmd0aFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIGFyZ3VtZW50ID4gMCA/IG1pbih0b0ludGVnZXIoYXJndW1lbnQpLCAweDFGRkZGRkZGRkZGRkZGKSA6IDA7IC8vIDIgKiogNTMgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcblxudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIG1pbiA9IE1hdGgubWluO1xuXG4vLyBIZWxwZXIgZm9yIGEgcG9wdWxhciByZXBlYXRpbmcgY2FzZSBvZiB0aGUgc3BlYzpcbi8vIExldCBpbnRlZ2VyIGJlID8gVG9JbnRlZ2VyKGluZGV4KS5cbi8vIElmIGludGVnZXIgPCAwLCBsZXQgcmVzdWx0IGJlIG1heCgobGVuZ3RoICsgaW50ZWdlciksIDApOyBlbHNlIGxldCByZXN1bHQgYmUgbWluKGxlbmd0aCwgbGVuZ3RoKS5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcbiAgdmFyIGludGVnZXIgPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW50ZWdlciA8IDAgPyBtYXgoaW50ZWdlciArIGxlbmd0aCwgMCkgOiBtaW4oaW50ZWdlciwgbGVuZ3RoKTtcbn07XG4iLCJ2YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgdG9BYnNvbHV0ZUluZGV4ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWFic29sdXRlLWluZGV4Jyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUueyBpbmRleE9mLCBpbmNsdWRlcyB9YCBtZXRob2RzIGltcGxlbWVudGF0aW9uXG52YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24gKElTX0lOQ0xVREVTKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIGVsLCBmcm9tSW5kZXgpIHtcbiAgICB2YXIgTyA9IHRvSW5kZXhlZE9iamVjdCgkdGhpcyk7XG4gICAgdmFyIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICB2YXIgaW5kZXggPSB0b0Fic29sdXRlSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpO1xuICAgIHZhciB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgIGlmIChJU19JTkNMVURFUyAmJiBlbCAhPSBlbCkgd2hpbGUgKGxlbmd0aCA+IGluZGV4KSB7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICBpZiAodmFsdWUgIT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I2luZGV4T2YgaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yICg7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICAgIGlmICgoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTykgJiYgT1tpbmRleF0gPT09IGVsKSByZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5pbmNsdWRlc2AgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xuICBpbmNsdWRlczogY3JlYXRlTWV0aG9kKHRydWUpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmluZGV4T2ZgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5kZXhvZlxuICBpbmRleE9mOiBjcmVhdGVNZXRob2QoZmFsc2UpXG59O1xuIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciBpbmRleE9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWluY2x1ZGVzJykuaW5kZXhPZjtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGRlbi1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0luZGV4ZWRPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pICFoYXMoaGlkZGVuS2V5cywga2V5KSAmJiBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBJRTgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gW1xuICAnY29uc3RydWN0b3InLFxuICAnaGFzT3duUHJvcGVydHknLFxuICAnaXNQcm90b3R5cGVPZicsXG4gICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG4gICd0b0xvY2FsZVN0cmluZycsXG4gICd0b1N0cmluZycsXG4gICd2YWx1ZU9mJ1xuXTtcbiIsInZhciBpbnRlcm5hbE9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzJyk7XG5cbnZhciBoaWRkZW5LZXlzID0gZW51bUJ1Z0tleXMuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7XG5cbi8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuZ2V0b3ducHJvcGVydHluYW1lc1xuZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhPKSB7XG4gIHJldHVybiBpbnRlcm5hbE9iamVjdEtleXMoTywgaGlkZGVuS2V5cyk7XG59O1xuIiwiZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcbiIsInZhciBnZXRCdWlsdEluID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dldC1idWlsdC1pbicpO1xudmFyIGdldE93blByb3BlcnR5TmFtZXNNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktbmFtZXMnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktc3ltYm9scycpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xuXG4vLyBhbGwgb2JqZWN0IGtleXMsIGluY2x1ZGVzIG5vbi1lbnVtZXJhYmxlIGFuZCBzeW1ib2xzXG5tb2R1bGUuZXhwb3J0cyA9IGdldEJ1aWx0SW4oJ1JlZmxlY3QnLCAnb3duS2V5cycpIHx8IGZ1bmN0aW9uIG93bktleXMoaXQpIHtcbiAgdmFyIGtleXMgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlLmYoYW5PYmplY3QoaXQpKTtcbiAgdmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IGdldE93blByb3BlcnR5U3ltYm9sc01vZHVsZS5mO1xuICByZXR1cm4gZ2V0T3duUHJvcGVydHlTeW1ib2xzID8ga2V5cy5jb25jYXQoZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KSkgOiBrZXlzO1xufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgb3duS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vd24ta2V5cycpO1xudmFyIGdldE93blByb3BlcnR5RGVzY3JpcHRvck1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG52YXIgZGVmaW5lUHJvcGVydHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuICB2YXIga2V5cyA9IG93bktleXMoc291cmNlKTtcbiAgdmFyIGRlZmluZVByb3BlcnR5ID0gZGVmaW5lUHJvcGVydHlNb2R1bGUuZjtcbiAgdmFyIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvck1vZHVsZS5mO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICBpZiAoIWhhcyh0YXJnZXQsIGtleSkpIGRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTtcbiAgfVxufTtcbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xuXG52YXIgcmVwbGFjZW1lbnQgPSAvI3xcXC5wcm90b3R5cGVcXC4vO1xuXG52YXIgaXNGb3JjZWQgPSBmdW5jdGlvbiAoZmVhdHVyZSwgZGV0ZWN0aW9uKSB7XG4gIHZhciB2YWx1ZSA9IGRhdGFbbm9ybWFsaXplKGZlYXR1cmUpXTtcbiAgcmV0dXJuIHZhbHVlID09IFBPTFlGSUxMID8gdHJ1ZVxuICAgIDogdmFsdWUgPT0gTkFUSVZFID8gZmFsc2VcbiAgICA6IHR5cGVvZiBkZXRlY3Rpb24gPT0gJ2Z1bmN0aW9uJyA/IGZhaWxzKGRldGVjdGlvbilcbiAgICA6ICEhZGV0ZWN0aW9uO1xufTtcblxudmFyIG5vcm1hbGl6ZSA9IGlzRm9yY2VkLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgcmV0dXJuIFN0cmluZyhzdHJpbmcpLnJlcGxhY2UocmVwbGFjZW1lbnQsICcuJykudG9Mb3dlckNhc2UoKTtcbn07XG5cbnZhciBkYXRhID0gaXNGb3JjZWQuZGF0YSA9IHt9O1xudmFyIE5BVElWRSA9IGlzRm9yY2VkLk5BVElWRSA9ICdOJztcbnZhciBQT0xZRklMTCA9IGlzRm9yY2VkLlBPTFlGSUxMID0gJ1AnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRm9yY2VkO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpLmY7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciBzZXRHbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LWdsb2JhbCcpO1xudmFyIGNvcHlDb25zdHJ1Y3RvclByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY29weS1jb25zdHJ1Y3Rvci1wcm9wZXJ0aWVzJyk7XG52YXIgaXNGb3JjZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtZm9yY2VkJyk7XG5cbi8qXG4gIG9wdGlvbnMudGFyZ2V0ICAgICAgLSBuYW1lIG9mIHRoZSB0YXJnZXQgb2JqZWN0XG4gIG9wdGlvbnMuZ2xvYmFsICAgICAgLSB0YXJnZXQgaXMgdGhlIGdsb2JhbCBvYmplY3RcbiAgb3B0aW9ucy5zdGF0ICAgICAgICAtIGV4cG9ydCBhcyBzdGF0aWMgbWV0aG9kcyBvZiB0YXJnZXRcbiAgb3B0aW9ucy5wcm90byAgICAgICAtIGV4cG9ydCBhcyBwcm90b3R5cGUgbWV0aG9kcyBvZiB0YXJnZXRcbiAgb3B0aW9ucy5yZWFsICAgICAgICAtIHJlYWwgcHJvdG90eXBlIG1ldGhvZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMuZm9yY2VkICAgICAgLSBleHBvcnQgZXZlbiBpZiB0aGUgbmF0aXZlIGZlYXR1cmUgaXMgYXZhaWxhYmxlXG4gIG9wdGlvbnMuYmluZCAgICAgICAgLSBiaW5kIG1ldGhvZHMgdG8gdGhlIHRhcmdldCwgcmVxdWlyZWQgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxuICBvcHRpb25zLndyYXAgICAgICAgIC0gd3JhcCBjb25zdHJ1Y3RvcnMgdG8gcHJldmVudGluZyBnbG9iYWwgcG9sbHV0aW9uLCByZXF1aXJlZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMudW5zYWZlICAgICAgLSB1c2UgdGhlIHNpbXBsZSBhc3NpZ25tZW50IG9mIHByb3BlcnR5IGluc3RlYWQgb2YgZGVsZXRlICsgZGVmaW5lUHJvcGVydHlcbiAgb3B0aW9ucy5zaGFtICAgICAgICAtIGFkZCBhIGZsYWcgdG8gbm90IGNvbXBsZXRlbHkgZnVsbCBwb2x5ZmlsbHNcbiAgb3B0aW9ucy5lbnVtZXJhYmxlICAtIGV4cG9ydCBhcyBlbnVtZXJhYmxlIHByb3BlcnR5XG4gIG9wdGlvbnMubm9UYXJnZXRHZXQgLSBwcmV2ZW50IGNhbGxpbmcgYSBnZXR0ZXIgb24gdGFyZ2V0XG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucywgc291cmNlKSB7XG4gIHZhciBUQVJHRVQgPSBvcHRpb25zLnRhcmdldDtcbiAgdmFyIEdMT0JBTCA9IG9wdGlvbnMuZ2xvYmFsO1xuICB2YXIgU1RBVElDID0gb3B0aW9ucy5zdGF0O1xuICB2YXIgRk9SQ0VELCB0YXJnZXQsIGtleSwgdGFyZ2V0UHJvcGVydHksIHNvdXJjZVByb3BlcnR5LCBkZXNjcmlwdG9yO1xuICBpZiAoR0xPQkFMKSB7XG4gICAgdGFyZ2V0ID0gZ2xvYmFsO1xuICB9IGVsc2UgaWYgKFNUQVRJQykge1xuICAgIHRhcmdldCA9IGdsb2JhbFtUQVJHRVRdIHx8IHNldEdsb2JhbChUQVJHRVQsIHt9KTtcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQgPSAoZ2xvYmFsW1RBUkdFVF0gfHwge30pLnByb3RvdHlwZTtcbiAgfVxuICBpZiAodGFyZ2V0KSBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICBzb3VyY2VQcm9wZXJ0eSA9IHNvdXJjZVtrZXldO1xuICAgIGlmIChvcHRpb25zLm5vVGFyZ2V0R2V0KSB7XG4gICAgICBkZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KTtcbiAgICAgIHRhcmdldFByb3BlcnR5ID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnZhbHVlO1xuICAgIH0gZWxzZSB0YXJnZXRQcm9wZXJ0eSA9IHRhcmdldFtrZXldO1xuICAgIEZPUkNFRCA9IGlzRm9yY2VkKEdMT0JBTCA/IGtleSA6IFRBUkdFVCArIChTVEFUSUMgPyAnLicgOiAnIycpICsga2V5LCBvcHRpb25zLmZvcmNlZCk7XG4gICAgLy8gY29udGFpbmVkIGluIHRhcmdldFxuICAgIGlmICghRk9SQ0VEICYmIHRhcmdldFByb3BlcnR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2Ygc291cmNlUHJvcGVydHkgPT09IHR5cGVvZiB0YXJnZXRQcm9wZXJ0eSkgY29udGludWU7XG4gICAgICBjb3B5Q29uc3RydWN0b3JQcm9wZXJ0aWVzKHNvdXJjZVByb3BlcnR5LCB0YXJnZXRQcm9wZXJ0eSk7XG4gICAgfVxuICAgIC8vIGFkZCBhIGZsYWcgdG8gbm90IGNvbXBsZXRlbHkgZnVsbCBwb2x5ZmlsbHNcbiAgICBpZiAob3B0aW9ucy5zaGFtIHx8ICh0YXJnZXRQcm9wZXJ0eSAmJiB0YXJnZXRQcm9wZXJ0eS5zaGFtKSkge1xuICAgICAgaGlkZShzb3VyY2VQcm9wZXJ0eSwgJ3NoYW0nLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxuICAgIHJlZGVmaW5lKHRhcmdldCwga2V5LCBzb3VyY2VQcm9wZXJ0eSwgb3B0aW9ucyk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoU3RyaW5nKGl0KSArICcgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLWZ1bmN0aW9uJyk7XG5cbi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIHRoYXQsIGxlbmd0aCkge1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZiAodGhhdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZm47XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCk7XG4gICAgfTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG4iLCJ2YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcblxuLy8gYFRvT2JqZWN0YCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvb2JqZWN0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xuICByZXR1cm4gT2JqZWN0KHJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpKTtcbn07XG4iLCJ2YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xuXG4vLyBgSXNBcnJheWAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pc2FycmF5XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgcmV0dXJuIGNsYXNzb2YoYXJnKSA9PSAnQXJyYXknO1xufTtcbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICEhT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyBDaHJvbWUgMzggU3ltYm9sIGhhcyBpbmNvcnJlY3QgdG9TdHJpbmcgY29udmVyc2lvblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgcmV0dXJuICFTdHJpbmcoU3ltYm9sKCkpO1xufSk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdWlkJyk7XG52YXIgTkFUSVZFX1NZTUJPTCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtc3ltYm9sJyk7XG5cbnZhciBTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xudmFyIHN0b3JlID0gc2hhcmVkKCd3a3MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID0gTkFUSVZFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV1cbiAgICB8fCAoTkFUSVZFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLWFycmF5Jyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBTUEVDSUVTID0gd2VsbEtub3duU3ltYm9sKCdzcGVjaWVzJyk7XG5cbi8vIGBBcnJheVNwZWNpZXNDcmVhdGVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXlzcGVjaWVzY3JlYXRlXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcmlnaW5hbEFycmF5LCBsZW5ndGgpIHtcbiAgdmFyIEM7XG4gIGlmIChpc0FycmF5KG9yaWdpbmFsQXJyYXkpKSB7XG4gICAgQyA9IG9yaWdpbmFsQXJyYXkuY29uc3RydWN0b3I7XG4gICAgLy8gY3Jvc3MtcmVhbG0gZmFsbGJhY2tcbiAgICBpZiAodHlwZW9mIEMgPT0gJ2Z1bmN0aW9uJyAmJiAoQyA9PT0gQXJyYXkgfHwgaXNBcnJheShDLnByb3RvdHlwZSkpKSBDID0gdW5kZWZpbmVkO1xuICAgIGVsc2UgaWYgKGlzT2JqZWN0KEMpKSB7XG4gICAgICBDID0gQ1tTUEVDSUVTXTtcbiAgICAgIGlmIChDID09PSBudWxsKSBDID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSByZXR1cm4gbmV3IChDID09PSB1bmRlZmluZWQgPyBBcnJheSA6IEMpKGxlbmd0aCA9PT0gMCA/IDAgOiBsZW5ndGgpO1xufTtcbiIsInZhciBiaW5kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2JpbmQtY29udGV4dCcpO1xudmFyIEluZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciBhcnJheVNwZWNpZXNDcmVhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktc3BlY2llcy1jcmVhdGUnKTtcblxudmFyIHB1c2ggPSBbXS5wdXNoO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLnsgZm9yRWFjaCwgbWFwLCBmaWx0ZXIsIHNvbWUsIGV2ZXJ5LCBmaW5kLCBmaW5kSW5kZXggfWAgbWV0aG9kcyBpbXBsZW1lbnRhdGlvblxudmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uIChUWVBFKSB7XG4gIHZhciBJU19NQVAgPSBUWVBFID09IDE7XG4gIHZhciBJU19GSUxURVIgPSBUWVBFID09IDI7XG4gIHZhciBJU19TT01FID0gVFlQRSA9PSAzO1xuICB2YXIgSVNfRVZFUlkgPSBUWVBFID09IDQ7XG4gIHZhciBJU19GSU5EX0lOREVYID0gVFlQRSA9PSA2O1xuICB2YXIgTk9fSE9MRVMgPSBUWVBFID09IDUgfHwgSVNfRklORF9JTkRFWDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgY2FsbGJhY2tmbiwgdGhhdCwgc3BlY2lmaWNDcmVhdGUpIHtcbiAgICB2YXIgTyA9IHRvT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgc2VsZiA9IEluZGV4ZWRPYmplY3QoTyk7XG4gICAgdmFyIGJvdW5kRnVuY3Rpb24gPSBiaW5kKGNhbGxiYWNrZm4sIHRoYXQsIDMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChzZWxmLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgY3JlYXRlID0gc3BlY2lmaWNDcmVhdGUgfHwgYXJyYXlTcGVjaWVzQ3JlYXRlO1xuICAgIHZhciB0YXJnZXQgPSBJU19NQVAgPyBjcmVhdGUoJHRoaXMsIGxlbmd0aCkgOiBJU19GSUxURVIgPyBjcmVhdGUoJHRoaXMsIDApIDogdW5kZWZpbmVkO1xuICAgIHZhciB2YWx1ZSwgcmVzdWx0O1xuICAgIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoTk9fSE9MRVMgfHwgaW5kZXggaW4gc2VsZikge1xuICAgICAgdmFsdWUgPSBzZWxmW2luZGV4XTtcbiAgICAgIHJlc3VsdCA9IGJvdW5kRnVuY3Rpb24odmFsdWUsIGluZGV4LCBPKTtcbiAgICAgIGlmIChUWVBFKSB7XG4gICAgICAgIGlmIChJU19NQVApIHRhcmdldFtpbmRleF0gPSByZXN1bHQ7IC8vIG1hcFxuICAgICAgICBlbHNlIGlmIChyZXN1bHQpIHN3aXRjaCAoVFlQRSkge1xuICAgICAgICAgIGNhc2UgMzogcmV0dXJuIHRydWU7ICAgICAgICAgICAgICAvLyBzb21lXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsdWU7ICAgICAgICAgICAgIC8vIGZpbmRcbiAgICAgICAgICBjYXNlIDY6IHJldHVybiBpbmRleDsgICAgICAgICAgICAgLy8gZmluZEluZGV4XG4gICAgICAgICAgY2FzZSAyOiBwdXNoLmNhbGwodGFyZ2V0LCB2YWx1ZSk7IC8vIGZpbHRlclxuICAgICAgICB9IGVsc2UgaWYgKElTX0VWRVJZKSByZXR1cm4gZmFsc2U7ICAvLyBldmVyeVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogdGFyZ2V0O1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5mb3JlYWNoXG4gIGZvckVhY2g6IGNyZWF0ZU1ldGhvZCgwKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5tYXBgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUubWFwXG4gIG1hcDogY3JlYXRlTWV0aG9kKDEpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmZpbHRlcmAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maWx0ZXJcbiAgZmlsdGVyOiBjcmVhdGVNZXRob2QoMiksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuc29tZWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5zb21lXG4gIHNvbWU6IGNyZWF0ZU1ldGhvZCgzKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5ldmVyeWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5ldmVyeVxuICBldmVyeTogY3JlYXRlTWV0aG9kKDQpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmZpbmRgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmluZFxuICBmaW5kOiBjcmVhdGVNZXRob2QoNSksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4YCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbmRJbmRleFxuICBmaW5kSW5kZXg6IGNyZWF0ZU1ldGhvZCg2KVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChNRVRIT0RfTkFNRSwgYXJndW1lbnQpIHtcbiAgdmFyIG1ldGhvZCA9IFtdW01FVEhPRF9OQU1FXTtcbiAgcmV0dXJuICFtZXRob2QgfHwgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1jYWxsLG5vLXRocm93LWxpdGVyYWxcbiAgICBtZXRob2QuY2FsbChudWxsLCBhcmd1bWVudCB8fCBmdW5jdGlvbiAoKSB7IHRocm93IDE7IH0sIDEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJGZvckVhY2ggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktaXRlcmF0aW9uJykuZm9yRWFjaDtcbnZhciBzbG9wcHlBcnJheU1ldGhvZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zbG9wcHktYXJyYXktbWV0aG9kJyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kIGltcGxlbWVudGF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxubW9kdWxlLmV4cG9ydHMgPSBzbG9wcHlBcnJheU1ldGhvZCgnZm9yRWFjaCcpID8gZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qICwgdGhpc0FyZyAqLykge1xuICByZXR1cm4gJGZvckVhY2godGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQpO1xufSA6IFtdLmZvckVhY2g7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWZvci1lYWNoJyk7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxuJCh7IHRhcmdldDogJ0FycmF5JywgcHJvdG86IHRydWUsIGZvcmNlZDogW10uZm9yRWFjaCAhPSBmb3JFYWNoIH0sIHtcbiAgZm9yRWFjaDogZm9yRWFjaFxufSk7XG4iLCJ2YXIgaW50ZXJuYWxPYmplY3RLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xuXG4vLyBgT2JqZWN0LmtleXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmtleXNcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKSB7XG4gIHJldHVybiBpbnRlcm5hbE9iamVjdEtleXMoTywgZW51bUJ1Z0tleXMpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cycpO1xudmFyIGdldE93blByb3BlcnR5U3ltYm9sc01vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1zeW1ib2xzJyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1vYmplY3QnKTtcbnZhciBJbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0Jyk7XG5cbnZhciBuYXRpdmVBc3NpZ24gPSBPYmplY3QuYXNzaWduO1xuXG4vLyBgT2JqZWN0LmFzc2lnbmAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuYXNzaWduXG4vLyBzaG91bGQgd29yayB3aXRoIHN5bWJvbHMgYW5kIHNob3VsZCBoYXZlIGRldGVybWluaXN0aWMgcHJvcGVydHkgb3JkZXIgKFY4IGJ1Zylcbm1vZHVsZS5leHBvcnRzID0gIW5hdGl2ZUFzc2lnbiB8fCBmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHZhciBBID0ge307XG4gIHZhciBCID0ge307XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICB2YXIgc3ltYm9sID0gU3ltYm9sKCk7XG4gIHZhciBhbHBoYWJldCA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCc7XG4gIEFbc3ltYm9sXSA9IDc7XG4gIGFscGhhYmV0LnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChjaHIpIHsgQltjaHJdID0gY2hyOyB9KTtcbiAgcmV0dXJuIG5hdGl2ZUFzc2lnbih7fSwgQSlbc3ltYm9sXSAhPSA3IHx8IG9iamVjdEtleXMobmF0aXZlQXNzaWduKHt9LCBCKSkuam9pbignJykgIT0gYWxwaGFiZXQ7XG59KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHZhciBUID0gdG9PYmplY3QodGFyZ2V0KTtcbiAgdmFyIGFyZ3VtZW50c0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gIHZhciBpbmRleCA9IDE7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUuZjtcbiAgdmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUuZjtcbiAgd2hpbGUgKGFyZ3VtZW50c0xlbmd0aCA+IGluZGV4KSB7XG4gICAgdmFyIFMgPSBJbmRleGVkT2JqZWN0KGFyZ3VtZW50c1tpbmRleCsrXSk7XG4gICAgdmFyIGtleXMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPyBvYmplY3RLZXlzKFMpLmNvbmNhdChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoUykpIDogb2JqZWN0S2V5cyhTKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIGogPSAwO1xuICAgIHZhciBrZXk7XG4gICAgd2hpbGUgKGxlbmd0aCA+IGopIHtcbiAgICAgIGtleSA9IGtleXNbaisrXTtcbiAgICAgIGlmICghREVTQ1JJUFRPUlMgfHwgcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChTLCBrZXkpKSBUW2tleV0gPSBTW2tleV07XG4gICAgfVxuICB9IHJldHVybiBUO1xufSA6IG5hdGl2ZUFzc2lnbjtcbiIsInZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGFzc2lnbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtYXNzaWduJyk7XG5cbi8vIGBPYmplY3QuYXNzaWduYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5hc3NpZ25cbiQoeyB0YXJnZXQ6ICdPYmplY3QnLCBzdGF0OiB0cnVlLCBmb3JjZWQ6IE9iamVjdC5hc3NpZ24gIT09IGFzc2lnbiB9LCB7XG4gIGFzc2lnbjogYXNzaWduXG59KTtcbiIsInZhciBjbGFzc29mUmF3ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YtcmF3Jyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBUT19TVFJJTkdfVEFHID0gd2VsbEtub3duU3ltYm9sKCd0b1N0cmluZ1RhZycpO1xuLy8gRVMzIHdyb25nIGhlcmVcbnZhciBDT1JSRUNUX0FSR1VNRU5UUyA9IGNsYXNzb2ZSYXcoZnVuY3Rpb24gKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG4vLyBmYWxsYmFjayBmb3IgSUUxMSBTY3JpcHQgQWNjZXNzIERlbmllZCBlcnJvclxudmFyIHRyeUdldCA9IGZ1bmN0aW9uIChpdCwga2V5KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGl0W2tleV07XG4gIH0gY2F0Y2ggKGVycm9yKSB7IC8qIGVtcHR5ICovIH1cbn07XG5cbi8vIGdldHRpbmcgdGFnIGZyb20gRVM2KyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2Bcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCB0YWcsIHJlc3VsdDtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKHRhZyA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVE9fU1RSSU5HX1RBRykpID09ICdzdHJpbmcnID8gdGFnXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBDT1JSRUNUX0FSR1VNRU5UUyA/IGNsYXNzb2ZSYXcoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAocmVzdWx0ID0gY2xhc3NvZlJhdyhPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IHJlc3VsdDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBUT19TVFJJTkdfVEFHID0gd2VsbEtub3duU3ltYm9sKCd0b1N0cmluZ1RhZycpO1xudmFyIHRlc3QgPSB7fTtcblxudGVzdFtUT19TVFJJTkdfVEFHXSA9ICd6JztcblxuLy8gYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgIG1ldGhvZCBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBTdHJpbmcodGVzdCkgIT09ICdbb2JqZWN0IHpdJyA/IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ1tvYmplY3QgJyArIGNsYXNzb2YodGhpcykgKyAnXSc7XG59IDogdGVzdC50b1N0cmluZztcbiIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIHRvU3RyaW5nID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC10by1zdHJpbmcnKTtcblxudmFyIE9iamVjdFByb3RvdHlwZSA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8vIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmdcbmlmICh0b1N0cmluZyAhPT0gT2JqZWN0UHJvdG90eXBlLnRvU3RyaW5nKSB7XG4gIHJlZGVmaW5lKE9iamVjdFByb3RvdHlwZSwgJ3RvU3RyaW5nJywgdG9TdHJpbmcsIHsgdW5zYWZlOiB0cnVlIH0pO1xufVxuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWwuUHJvbWlzZTtcbiIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh0YXJnZXQsIHNyYywgb3B0aW9ucykge1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSByZWRlZmluZSh0YXJnZXQsIGtleSwgc3JjW2tleV0sIG9wdGlvbnMpO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcbiIsInZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5JykuZjtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBUT19TVFJJTkdfVEFHID0gd2VsbEtub3duU3ltYm9sKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgVEFHLCBTVEFUSUMpIHtcbiAgaWYgKGl0ICYmICFoYXMoaXQgPSBTVEFUSUMgPyBpdCA6IGl0LnByb3RvdHlwZSwgVE9fU1RSSU5HX1RBRykpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShpdCwgVE9fU1RSSU5HX1RBRywgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBUQUcgfSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcblxudmFyIFNQRUNJRVMgPSB3ZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ09OU1RSVUNUT1JfTkFNRSkge1xuICB2YXIgQ29uc3RydWN0b3IgPSBnZXRCdWlsdEluKENPTlNUUlVDVE9SX05BTUUpO1xuICB2YXIgZGVmaW5lUHJvcGVydHkgPSBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mO1xuXG4gIGlmIChERVNDUklQVE9SUyAmJiBDb25zdHJ1Y3RvciAmJiAhQ29uc3RydWN0b3JbU1BFQ0lFU10pIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShDb25zdHJ1Y3RvciwgU1BFQ0lFUywge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9XG4gICAgfSk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgQ29uc3RydWN0b3IsIG5hbWUpIHtcbiAgaWYgKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ0luY29ycmVjdCAnICsgKG5hbWUgPyBuYW1lICsgJyAnIDogJycpICsgJ2ludm9jYXRpb24nKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcbiIsInZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzJyk7XG5cbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcbnZhciBBcnJheVByb3RvdHlwZSA9IEFycmF5LnByb3RvdHlwZTtcblxuLy8gY2hlY2sgb24gZGVmYXVsdCBBcnJheSBpdGVyYXRvclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b3R5cGVbSVRFUkFUT1JdID09PSBpdCk7XG59O1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZicpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgIT0gdW5kZWZpbmVkKSByZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xuXG4vLyBjYWxsIHNvbWV0aGluZyBvbiBpdGVyYXRvciBzdGVwIHdpdGggc2FmZSBjbG9zaW5nIG9uIGVycm9yXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVyYXRvciwgZm4sIHZhbHVlLCBFTlRSSUVTKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEVOVFJJRVMgPyBmbihhbk9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgLy8gNy40LjYgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgY29tcGxldGlvbilcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB2YXIgcmV0dXJuTWV0aG9kID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICAgIGlmIChyZXR1cm5NZXRob2QgIT09IHVuZGVmaW5lZCkgYW5PYmplY3QocmV0dXJuTWV0aG9kLmNhbGwoaXRlcmF0b3IpKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBpc0FycmF5SXRlcmF0b3JNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtYXJyYXktaXRlcmF0b3ItbWV0aG9kJyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9iaW5kLWNvbnRleHQnKTtcbnZhciBnZXRJdGVyYXRvck1ldGhvZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG52YXIgY2FsbFdpdGhTYWZlSXRlcmF0aW9uQ2xvc2luZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jYWxsLXdpdGgtc2FmZS1pdGVyYXRpb24tY2xvc2luZycpO1xuXG52YXIgUmVzdWx0ID0gZnVuY3Rpb24gKHN0b3BwZWQsIHJlc3VsdCkge1xuICB0aGlzLnN0b3BwZWQgPSBzdG9wcGVkO1xuICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbn07XG5cbnZhciBpdGVyYXRlID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlcmFibGUsIGZuLCB0aGF0LCBBU19FTlRSSUVTLCBJU19JVEVSQVRPUikge1xuICB2YXIgYm91bmRGdW5jdGlvbiA9IGJpbmQoZm4sIHRoYXQsIEFTX0VOVFJJRVMgPyAyIDogMSk7XG4gIHZhciBpdGVyYXRvciwgaXRlckZuLCBpbmRleCwgbGVuZ3RoLCByZXN1bHQsIHN0ZXA7XG5cbiAgaWYgKElTX0lURVJBVE9SKSB7XG4gICAgaXRlcmF0b3IgPSBpdGVyYWJsZTtcbiAgfSBlbHNlIHtcbiAgICBpdGVyRm4gPSBnZXRJdGVyYXRvck1ldGhvZChpdGVyYWJsZSk7XG4gICAgaWYgKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJykgdGhyb3cgVHlwZUVycm9yKCdUYXJnZXQgaXMgbm90IGl0ZXJhYmxlJyk7XG4gICAgLy8gb3B0aW1pc2F0aW9uIGZvciBhcnJheSBpdGVyYXRvcnNcbiAgICBpZiAoaXNBcnJheUl0ZXJhdG9yTWV0aG9kKGl0ZXJGbikpIHtcbiAgICAgIGZvciAoaW5kZXggPSAwLCBsZW5ndGggPSB0b0xlbmd0aChpdGVyYWJsZS5sZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKykge1xuICAgICAgICByZXN1bHQgPSBBU19FTlRSSUVTXG4gICAgICAgICAgPyBib3VuZEZ1bmN0aW9uKGFuT2JqZWN0KHN0ZXAgPSBpdGVyYWJsZVtpbmRleF0pWzBdLCBzdGVwWzFdKVxuICAgICAgICAgIDogYm91bmRGdW5jdGlvbihpdGVyYWJsZVtpbmRleF0pO1xuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdCBpbnN0YW5jZW9mIFJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gcmV0dXJuIG5ldyBSZXN1bHQoZmFsc2UpO1xuICAgIH1cbiAgICBpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKGl0ZXJhYmxlKTtcbiAgfVxuXG4gIHdoaWxlICghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpIHtcbiAgICByZXN1bHQgPSBjYWxsV2l0aFNhZmVJdGVyYXRpb25DbG9zaW5nKGl0ZXJhdG9yLCBib3VuZEZ1bmN0aW9uLCBzdGVwLnZhbHVlLCBBU19FTlRSSUVTKTtcbiAgICBpZiAocmVzdWx0ICYmIHJlc3VsdCBpbnN0YW5jZW9mIFJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcbiAgfSByZXR1cm4gbmV3IFJlc3VsdChmYWxzZSk7XG59O1xuXG5pdGVyYXRlLnN0b3AgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG4gIHJldHVybiBuZXcgUmVzdWx0KHRydWUsIHJlc3VsdCk7XG59O1xuIiwidmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG52YXIgU0FGRV9DTE9TSU5HID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciBjYWxsZWQgPSAwO1xuICB2YXIgaXRlcmF0b3JXaXRoUmV0dXJuID0ge1xuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7IGRvbmU6ICEhY2FsbGVkKysgfTtcbiAgICB9LFxuICAgICdyZXR1cm4nOiBmdW5jdGlvbiAoKSB7XG4gICAgICBTQUZFX0NMT1NJTkcgPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgaXRlcmF0b3JXaXRoUmV0dXJuW0lURVJBVE9SXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRocm93LWxpdGVyYWxcbiAgQXJyYXkuZnJvbShpdGVyYXRvcldpdGhSZXR1cm4sIGZ1bmN0aW9uICgpIHsgdGhyb3cgMjsgfSk7XG59IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMsIFNLSVBfQ0xPU0lORykge1xuICBpZiAoIVNLSVBfQ0xPU0lORyAmJiAhU0FGRV9DTE9TSU5HKSByZXR1cm4gZmFsc2U7XG4gIHZhciBJVEVSQVRJT05fU1VQUE9SVCA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICBvYmplY3RbSVRFUkFUT1JdID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB7IGRvbmU6IElURVJBVElPTl9TVVBQT1JUID0gdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gICAgZXhlYyhvYmplY3QpO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBJVEVSQVRJT05fU1VQUE9SVDtcbn07XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2EtZnVuY3Rpb24nKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIFNQRUNJRVMgPSB3ZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKTtcblxuLy8gYFNwZWNpZXNDb25zdHJ1Y3RvcmAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zcGVjaWVzY29uc3RydWN0b3Jcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIGRlZmF1bHRDb25zdHJ1Y3Rvcikge1xuICB2YXIgQyA9IGFuT2JqZWN0KE8pLmNvbnN0cnVjdG9yO1xuICB2YXIgUztcbiAgcmV0dXJuIEMgPT09IHVuZGVmaW5lZCB8fCAoUyA9IGFuT2JqZWN0KEMpW1NQRUNJRVNdKSA9PSB1bmRlZmluZWQgPyBkZWZhdWx0Q29uc3RydWN0b3IgOiBhRnVuY3Rpb24oUyk7XG59O1xuIiwidmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QnVpbHRJbignZG9jdW1lbnQnLCAnZG9jdW1lbnRFbGVtZW50Jyk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYmluZC1jb250ZXh0Jyk7XG52YXIgaHRtbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9odG1sJyk7XG52YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudCcpO1xuXG52YXIgbG9jYXRpb24gPSBnbG9iYWwubG9jYXRpb247XG52YXIgc2V0ID0gZ2xvYmFsLnNldEltbWVkaWF0ZTtcbnZhciBjbGVhciA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZTtcbnZhciBwcm9jZXNzID0gZ2xvYmFsLnByb2Nlc3M7XG52YXIgTWVzc2FnZUNoYW5uZWwgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWw7XG52YXIgRGlzcGF0Y2ggPSBnbG9iYWwuRGlzcGF0Y2g7XG52YXIgY291bnRlciA9IDA7XG52YXIgcXVldWUgPSB7fTtcbnZhciBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJztcbnZhciBkZWZlciwgY2hhbm5lbCwgcG9ydDtcblxudmFyIHJ1biA9IGZ1bmN0aW9uIChpZCkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gIGlmIChxdWV1ZS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgICBmbigpO1xuICB9XG59O1xuXG52YXIgcnVubmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcnVuKGlkKTtcbiAgfTtcbn07XG5cbnZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCkge1xuICBydW4oZXZlbnQuZGF0YSk7XG59O1xuXG52YXIgcG9zdCA9IGZ1bmN0aW9uIChpZCkge1xuICAvLyBvbGQgZW5naW5lcyBoYXZlIG5vdCBsb2NhdGlvbi5vcmlnaW5cbiAgZ2xvYmFsLnBvc3RNZXNzYWdlKGlkICsgJycsIGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3QpO1xufTtcblxuLy8gTm9kZS5qcyAwLjkrICYgSUUxMCsgaGFzIHNldEltbWVkaWF0ZSwgb3RoZXJ3aXNlOlxuaWYgKCFzZXQgfHwgIWNsZWFyKSB7XG4gIHNldCA9IGZ1bmN0aW9uIHNldEltbWVkaWF0ZShmbikge1xuICAgIHZhciBhcmdzID0gW107XG4gICAgdmFyIGkgPSAxO1xuICAgIHdoaWxlIChhcmd1bWVudHMubGVuZ3RoID4gaSkgYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICBxdWV1ZVsrK2NvdW50ZXJdID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gICAgICAodHlwZW9mIGZuID09ICdmdW5jdGlvbicgPyBmbiA6IEZ1bmN0aW9uKGZuKSkuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9O1xuICAgIGRlZmVyKGNvdW50ZXIpO1xuICAgIHJldHVybiBjb3VudGVyO1xuICB9O1xuICBjbGVhciA9IGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGlkKSB7XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgfTtcbiAgLy8gTm9kZS5qcyAwLjgtXG4gIGlmIChjbGFzc29mKHByb2Nlc3MpID09ICdwcm9jZXNzJykge1xuICAgIGRlZmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKHJ1bm5lcihpZCkpO1xuICAgIH07XG4gIC8vIFNwaGVyZSAoSlMgZ2FtZSBlbmdpbmUpIERpc3BhdGNoIEFQSVxuICB9IGVsc2UgaWYgKERpc3BhdGNoICYmIERpc3BhdGNoLm5vdykge1xuICAgIGRlZmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBEaXNwYXRjaC5ub3cocnVubmVyKGlkKSk7XG4gICAgfTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBNZXNzYWdlQ2hhbm5lbCwgaW5jbHVkZXMgV2ViV29ya2Vyc1xuICB9IGVsc2UgaWYgKE1lc3NhZ2VDaGFubmVsKSB7XG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIHBvcnQgPSBjaGFubmVsLnBvcnQyO1xuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGlzdGVuZXI7XG4gICAgZGVmZXIgPSBiaW5kKHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xuICAvLyBCcm93c2VycyB3aXRoIHBvc3RNZXNzYWdlLCBza2lwIFdlYldvcmtlcnNcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgJ29iamVjdCdcbiAgfSBlbHNlIGlmIChnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiB0eXBlb2YgcG9zdE1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJyAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMgJiYgIWZhaWxzKHBvc3QpKSB7XG4gICAgZGVmZXIgPSBwb3N0O1xuICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIsIGZhbHNlKTtcbiAgLy8gSUU4LVxuICB9IGVsc2UgaWYgKE9OUkVBRFlTVEFURUNIQU5HRSBpbiBjcmVhdGVFbGVtZW50KCdzY3JpcHQnKSkge1xuICAgIGRlZmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBodG1sLmFwcGVuZENoaWxkKGNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICBydW4oaWQpO1xuICAgICAgfTtcbiAgICB9O1xuICAvLyBSZXN0IG9sZCBicm93c2Vyc1xuICB9IGVsc2Uge1xuICAgIGRlZmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBzZXRUaW1lb3V0KHJ1bm5lcihpZCksIDApO1xuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogc2V0LFxuICBjbGVhcjogY2xlYXJcbn07XG4iLCJ2YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRCdWlsdEluKCduYXZpZ2F0b3InLCAndXNlckFnZW50JykgfHwgJyc7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJykuZjtcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YtcmF3Jyk7XG52YXIgbWFjcm90YXNrID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3Rhc2snKS5zZXQ7XG52YXIgdXNlckFnZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3VzZXItYWdlbnQnKTtcblxudmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbnZhciBwcm9jZXNzID0gZ2xvYmFsLnByb2Nlc3M7XG52YXIgUHJvbWlzZSA9IGdsb2JhbC5Qcm9taXNlO1xudmFyIElTX05PREUgPSBjbGFzc29mKHByb2Nlc3MpID09ICdwcm9jZXNzJztcbi8vIE5vZGUuanMgMTEgc2hvd3MgRXhwZXJpbWVudGFsV2FybmluZyBvbiBnZXR0aW5nIGBxdWV1ZU1pY3JvdGFza2BcbnZhciBxdWV1ZU1pY3JvdGFza0Rlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZ2xvYmFsLCAncXVldWVNaWNyb3Rhc2snKTtcbnZhciBxdWV1ZU1pY3JvdGFzayA9IHF1ZXVlTWljcm90YXNrRGVzY3JpcHRvciAmJiBxdWV1ZU1pY3JvdGFza0Rlc2NyaXB0b3IudmFsdWU7XG5cbnZhciBmbHVzaCwgaGVhZCwgbGFzdCwgbm90aWZ5LCB0b2dnbGUsIG5vZGUsIHByb21pc2UsIHRoZW47XG5cbi8vIG1vZGVybiBlbmdpbmVzIGhhdmUgcXVldWVNaWNyb3Rhc2sgbWV0aG9kXG5pZiAoIXF1ZXVlTWljcm90YXNrKSB7XG4gIGZsdXNoID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwYXJlbnQsIGZuO1xuICAgIGlmIChJU19OT0RFICYmIChwYXJlbnQgPSBwcm9jZXNzLmRvbWFpbikpIHBhcmVudC5leGl0KCk7XG4gICAgd2hpbGUgKGhlYWQpIHtcbiAgICAgIGZuID0gaGVhZC5mbjtcbiAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICB0cnkge1xuICAgICAgICBmbigpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGhlYWQpIG5vdGlmeSgpO1xuICAgICAgICBlbHNlIGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0gbGFzdCA9IHVuZGVmaW5lZDtcbiAgICBpZiAocGFyZW50KSBwYXJlbnQuZW50ZXIoKTtcbiAgfTtcblxuICAvLyBOb2RlLmpzXG4gIGlmIChJU19OT0RFKSB7XG4gICAgbm90aWZ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gICAgfTtcbiAgLy8gYnJvd3NlcnMgd2l0aCBNdXRhdGlvbk9ic2VydmVyLCBleGNlcHQgaU9TIC0gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzMzOVxuICB9IGVsc2UgaWYgKE11dGF0aW9uT2JzZXJ2ZXIgJiYgIS8oaXBob25lfGlwb2R8aXBhZCkuKmFwcGxld2Via2l0L2kudGVzdCh1c2VyQWdlbnQpKSB7XG4gICAgdG9nZ2xlID0gdHJ1ZTtcbiAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgIG5ldyBNdXRhdGlvbk9ic2VydmVyKGZsdXNoKS5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBub2RlLmRhdGEgPSB0b2dnbGUgPSAhdG9nZ2xlO1xuICAgIH07XG4gIC8vIGVudmlyb25tZW50cyB3aXRoIG1heWJlIG5vbi1jb21wbGV0ZWx5IGNvcnJlY3QsIGJ1dCBleGlzdGVudCBQcm9taXNlXG4gIH0gZWxzZSBpZiAoUHJvbWlzZSAmJiBQcm9taXNlLnJlc29sdmUpIHtcbiAgICAvLyBQcm9taXNlLnJlc29sdmUgd2l0aG91dCBhbiBhcmd1bWVudCB0aHJvd3MgYW4gZXJyb3IgaW4gTEcgV2ViT1MgMlxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICB0aGVuID0gcHJvbWlzZS50aGVuO1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoZW4uY2FsbChwcm9taXNlLCBmbHVzaCk7XG4gICAgfTtcbiAgLy8gZm9yIG90aGVyIGVudmlyb25tZW50cyAtIG1hY3JvdGFzayBiYXNlZCBvbjpcbiAgLy8gLSBzZXRJbW1lZGlhdGVcbiAgLy8gLSBNZXNzYWdlQ2hhbm5lbFxuICAvLyAtIHdpbmRvdy5wb3N0TWVzc2FnXG4gIC8vIC0gb25yZWFkeXN0YXRlY2hhbmdlXG4gIC8vIC0gc2V0VGltZW91dFxuICB9IGVsc2Uge1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIHN0cmFuZ2UgSUUgKyB3ZWJwYWNrIGRldiBzZXJ2ZXIgYnVnIC0gdXNlIC5jYWxsKGdsb2JhbClcbiAgICAgIG1hY3JvdGFzay5jYWxsKGdsb2JhbCwgZmx1c2gpO1xuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBxdWV1ZU1pY3JvdGFzayB8fCBmdW5jdGlvbiAoZm4pIHtcbiAgdmFyIHRhc2sgPSB7IGZuOiBmbiwgbmV4dDogdW5kZWZpbmVkIH07XG4gIGlmIChsYXN0KSBsYXN0Lm5leHQgPSB0YXNrO1xuICBpZiAoIWhlYWQpIHtcbiAgICBoZWFkID0gdGFzaztcbiAgICBub3RpZnkoKTtcbiAgfSBsYXN0ID0gdGFzaztcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2EtZnVuY3Rpb24nKTtcblxudmFyIFByb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKEMpIHtcbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdGhpcy5wcm9taXNlID0gbmV3IEMoZnVuY3Rpb24gKCQkcmVzb2x2ZSwgJCRyZWplY3QpIHtcbiAgICBpZiAocmVzb2x2ZSAhPT0gdW5kZWZpbmVkIHx8IHJlamVjdCAhPT0gdW5kZWZpbmVkKSB0aHJvdyBUeXBlRXJyb3IoJ0JhZCBQcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgcmVzb2x2ZSA9ICQkcmVzb2x2ZTtcbiAgICByZWplY3QgPSAkJHJlamVjdDtcbiAgfSk7XG4gIHRoaXMucmVzb2x2ZSA9IGFGdW5jdGlvbihyZXNvbHZlKTtcbiAgdGhpcy5yZWplY3QgPSBhRnVuY3Rpb24ocmVqZWN0KTtcbn07XG5cbi8vIDI1LjQuMS41IE5ld1Byb21pc2VDYXBhYmlsaXR5KEMpXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gKEMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKTtcbn07XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDLCB4KSB7XG4gIGFuT2JqZWN0KEMpO1xuICBpZiAoaXNPYmplY3QoeCkgJiYgeC5jb25zdHJ1Y3RvciA9PT0gQykgcmV0dXJuIHg7XG4gIHZhciBwcm9taXNlQ2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5LmYoQyk7XG4gIHZhciByZXNvbHZlID0gcHJvbWlzZUNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgcmVzb2x2ZSh4KTtcbiAgcmV0dXJuIHByb21pc2VDYXBhYmlsaXR5LnByb21pc2U7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYSwgYikge1xuICB2YXIgY29uc29sZSA9IGdsb2JhbC5jb25zb2xlO1xuICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGNvbnNvbGUuZXJyb3IoYSkgOiBjb25zb2xlLmVycm9yKGEsIGIpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiB7IGVycm9yOiBmYWxzZSwgdmFsdWU6IGV4ZWMoKSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiB7IGVycm9yOiB0cnVlLCB2YWx1ZTogZXJyb3IgfTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBwYXRoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3BhdGgnKTtcbnZhciBOYXRpdmVQcm9taXNlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25hdGl2ZS1wcm9taXNlLWNvbnN0cnVjdG9yJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciByZWRlZmluZUFsbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZS1hbGwnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIHNldFNwZWNpZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LXNwZWNpZXMnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xudmFyIGFuSW5zdGFuY2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4taW5zdGFuY2UnKTtcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YtcmF3Jyk7XG52YXIgaXRlcmF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRlJyk7XG52YXIgY2hlY2tDb3JyZWN0bmVzc09mSXRlcmF0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NoZWNrLWNvcnJlY3RuZXNzLW9mLWl0ZXJhdGlvbicpO1xudmFyIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zcGVjaWVzLWNvbnN0cnVjdG9yJyk7XG52YXIgdGFzayA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90YXNrJykuc2V0O1xudmFyIG1pY3JvdGFzayA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9taWNyb3Rhc2snKTtcbnZhciBwcm9taXNlUmVzb2x2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wcm9taXNlLXJlc29sdmUnKTtcbnZhciBob3N0UmVwb3J0RXJyb3JzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hvc3QtcmVwb3J0LWVycm9ycycpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25ldy1wcm9taXNlLWNhcGFiaWxpdHknKTtcbnZhciBwZXJmb3JtID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3BlcmZvcm0nKTtcbnZhciB1c2VyQWdlbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdXNlci1hZ2VudCcpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcbnZhciBpc0ZvcmNlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1mb3JjZWQnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIFNQRUNJRVMgPSB3ZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKTtcbnZhciBQUk9NSVNFID0gJ1Byb21pc2UnO1xudmFyIGdldEludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmdldDtcbnZhciBzZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5zZXQ7XG52YXIgZ2V0SW50ZXJuYWxQcm9taXNlU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmdldHRlckZvcihQUk9NSVNFKTtcbnZhciBQcm9taXNlQ29uc3RydWN0b3IgPSBOYXRpdmVQcm9taXNlO1xudmFyIFR5cGVFcnJvciA9IGdsb2JhbC5UeXBlRXJyb3I7XG52YXIgZG9jdW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQ7XG52YXIgcHJvY2VzcyA9IGdsb2JhbC5wcm9jZXNzO1xudmFyICRmZXRjaCA9IGdsb2JhbC5mZXRjaDtcbnZhciB2ZXJzaW9ucyA9IHByb2Nlc3MgJiYgcHJvY2Vzcy52ZXJzaW9ucztcbnZhciB2OCA9IHZlcnNpb25zICYmIHZlcnNpb25zLnY4IHx8ICcnO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZjtcbnZhciBuZXdHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eTtcbnZhciBJU19OT0RFID0gY2xhc3NvZihwcm9jZXNzKSA9PSAncHJvY2Vzcyc7XG52YXIgRElTUEFUQ0hfRVZFTlQgPSAhIShkb2N1bWVudCAmJiBkb2N1bWVudC5jcmVhdGVFdmVudCAmJiBnbG9iYWwuZGlzcGF0Y2hFdmVudCk7XG52YXIgVU5IQU5ETEVEX1JFSkVDVElPTiA9ICd1bmhhbmRsZWRyZWplY3Rpb24nO1xudmFyIFJFSkVDVElPTl9IQU5ETEVEID0gJ3JlamVjdGlvbmhhbmRsZWQnO1xudmFyIFBFTkRJTkcgPSAwO1xudmFyIEZVTEZJTExFRCA9IDE7XG52YXIgUkVKRUNURUQgPSAyO1xudmFyIEhBTkRMRUQgPSAxO1xudmFyIFVOSEFORExFRCA9IDI7XG52YXIgSW50ZXJuYWwsIE93blByb21pc2VDYXBhYmlsaXR5LCBQcm9taXNlV3JhcHBlciwgbmF0aXZlVGhlbjtcblxudmFyIEZPUkNFRCA9IGlzRm9yY2VkKFBST01JU0UsIGZ1bmN0aW9uICgpIHtcbiAgLy8gY29ycmVjdCBzdWJjbGFzc2luZyB3aXRoIEBAc3BlY2llcyBzdXBwb3J0XG4gIHZhciBwcm9taXNlID0gUHJvbWlzZUNvbnN0cnVjdG9yLnJlc29sdmUoMSk7XG4gIHZhciBlbXB0eSA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcbiAgdmFyIEZha2VQcm9taXNlID0gKHByb21pc2UuY29uc3RydWN0b3IgPSB7fSlbU1BFQ0lFU10gPSBmdW5jdGlvbiAoZXhlYykge1xuICAgIGV4ZWMoZW1wdHksIGVtcHR5KTtcbiAgfTtcbiAgLy8gdW5oYW5kbGVkIHJlamVjdGlvbnMgdHJhY2tpbmcgc3VwcG9ydCwgTm9kZUpTIFByb21pc2Ugd2l0aG91dCBpdCBmYWlscyBAQHNwZWNpZXMgdGVzdFxuICByZXR1cm4gISgoSVNfTk9ERSB8fCB0eXBlb2YgUHJvbWlzZVJlamVjdGlvbkV2ZW50ID09ICdmdW5jdGlvbicpXG4gICAgJiYgKCFJU19QVVJFIHx8IHByb21pc2VbJ2ZpbmFsbHknXSlcbiAgICAmJiBwcm9taXNlLnRoZW4oZW1wdHkpIGluc3RhbmNlb2YgRmFrZVByb21pc2VcbiAgICAvLyB2OCA2LjYgKE5vZGUgMTAgYW5kIENocm9tZSA2NikgaGF2ZSBhIGJ1ZyB3aXRoIHJlc29sdmluZyBjdXN0b20gdGhlbmFibGVzXG4gICAgLy8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9ODMwNTY1XG4gICAgLy8gd2UgY2FuJ3QgZGV0ZWN0IGl0IHN5bmNocm9ub3VzbHksIHNvIGp1c3QgY2hlY2sgdmVyc2lvbnNcbiAgICAmJiB2OC5pbmRleE9mKCc2LjYnKSAhPT0gMFxuICAgICYmIHVzZXJBZ2VudC5pbmRleE9mKCdDaHJvbWUvNjYnKSA9PT0gLTEpO1xufSk7XG5cbnZhciBJTkNPUlJFQ1RfSVRFUkFUSU9OID0gRk9SQ0VEIHx8ICFjaGVja0NvcnJlY3RuZXNzT2ZJdGVyYXRpb24oZnVuY3Rpb24gKGl0ZXJhYmxlKSB7XG4gIFByb21pc2VDb25zdHJ1Y3Rvci5hbGwoaXRlcmFibGUpWydjYXRjaCddKGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfSk7XG59KTtcblxuLy8gaGVscGVyc1xudmFyIGlzVGhlbmFibGUgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIHRoZW47XG4gIHJldHVybiBpc09iamVjdChpdCkgJiYgdHlwZW9mICh0aGVuID0gaXQudGhlbikgPT0gJ2Z1bmN0aW9uJyA/IHRoZW4gOiBmYWxzZTtcbn07XG5cbnZhciBub3RpZnkgPSBmdW5jdGlvbiAocHJvbWlzZSwgc3RhdGUsIGlzUmVqZWN0KSB7XG4gIGlmIChzdGF0ZS5ub3RpZmllZCkgcmV0dXJuO1xuICBzdGF0ZS5ub3RpZmllZCA9IHRydWU7XG4gIHZhciBjaGFpbiA9IHN0YXRlLnJlYWN0aW9ucztcbiAgbWljcm90YXNrKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmFsdWUgPSBzdGF0ZS52YWx1ZTtcbiAgICB2YXIgb2sgPSBzdGF0ZS5zdGF0ZSA9PSBGVUxGSUxMRUQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICAvLyB2YXJpYWJsZSBsZW5ndGggLSBjYW4ndCB1c2UgZm9yRWFjaFxuICAgIHdoaWxlIChjaGFpbi5sZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFyIHJlYWN0aW9uID0gY2hhaW5baW5kZXgrK107XG4gICAgICB2YXIgaGFuZGxlciA9IG9rID8gcmVhY3Rpb24ub2sgOiByZWFjdGlvbi5mYWlsO1xuICAgICAgdmFyIHJlc29sdmUgPSByZWFjdGlvbi5yZXNvbHZlO1xuICAgICAgdmFyIHJlamVjdCA9IHJlYWN0aW9uLnJlamVjdDtcbiAgICAgIHZhciBkb21haW4gPSByZWFjdGlvbi5kb21haW47XG4gICAgICB2YXIgcmVzdWx0LCB0aGVuLCBleGl0ZWQ7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICAgIGlmICghb2spIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZWplY3Rpb24gPT09IFVOSEFORExFRCkgb25IYW5kbGVVbmhhbmRsZWQocHJvbWlzZSwgc3RhdGUpO1xuICAgICAgICAgICAgc3RhdGUucmVqZWN0aW9uID0gSEFORExFRDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhbmRsZXIgPT09IHRydWUpIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRvbWFpbikgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyKHZhbHVlKTsgLy8gY2FuIHRocm93XG4gICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgICAgIGV4aXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXN1bHQgPT09IHJlYWN0aW9uLnByb21pc2UpIHtcbiAgICAgICAgICAgIHJlamVjdChUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGVuID0gaXNUaGVuYWJsZShyZXN1bHQpKSB7XG4gICAgICAgICAgICB0aGVuLmNhbGwocmVzdWx0LCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSByZWplY3QodmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGRvbWFpbiAmJiAhZXhpdGVkKSBkb21haW4uZXhpdCgpO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdGF0ZS5yZWFjdGlvbnMgPSBbXTtcbiAgICBzdGF0ZS5ub3RpZmllZCA9IGZhbHNlO1xuICAgIGlmIChpc1JlamVjdCAmJiAhc3RhdGUucmVqZWN0aW9uKSBvblVuaGFuZGxlZChwcm9taXNlLCBzdGF0ZSk7XG4gIH0pO1xufTtcblxudmFyIGRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiAobmFtZSwgcHJvbWlzZSwgcmVhc29uKSB7XG4gIHZhciBldmVudCwgaGFuZGxlcjtcbiAgaWYgKERJU1BBVENIX0VWRU5UKSB7XG4gICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICBldmVudC5wcm9taXNlID0gcHJvbWlzZTtcbiAgICBldmVudC5yZWFzb24gPSByZWFzb247XG4gICAgZXZlbnQuaW5pdEV2ZW50KG5hbWUsIGZhbHNlLCB0cnVlKTtcbiAgICBnbG9iYWwuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gIH0gZWxzZSBldmVudCA9IHsgcHJvbWlzZTogcHJvbWlzZSwgcmVhc29uOiByZWFzb24gfTtcbiAgaWYgKGhhbmRsZXIgPSBnbG9iYWxbJ29uJyArIG5hbWVdKSBoYW5kbGVyKGV2ZW50KTtcbiAgZWxzZSBpZiAobmFtZSA9PT0gVU5IQU5ETEVEX1JFSkVDVElPTikgaG9zdFJlcG9ydEVycm9ycygnVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgcmVhc29uKTtcbn07XG5cbnZhciBvblVuaGFuZGxlZCA9IGZ1bmN0aW9uIChwcm9taXNlLCBzdGF0ZSkge1xuICB0YXNrLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gc3RhdGUudmFsdWU7XG4gICAgdmFyIElTX1VOSEFORExFRCA9IGlzVW5oYW5kbGVkKHN0YXRlKTtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGlmIChJU19VTkhBTkRMRUQpIHtcbiAgICAgIHJlc3VsdCA9IHBlcmZvcm0oZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoSVNfTk9ERSkge1xuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xuICAgICAgICB9IGVsc2UgZGlzcGF0Y2hFdmVudChVTkhBTkRMRURfUkVKRUNUSU9OLCBwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIC8vIEJyb3dzZXJzIHNob3VsZCBub3QgdHJpZ2dlciBgcmVqZWN0aW9uSGFuZGxlZGAgZXZlbnQgaWYgaXQgd2FzIGhhbmRsZWQgaGVyZSwgTm9kZUpTIC0gc2hvdWxkXG4gICAgICBzdGF0ZS5yZWplY3Rpb24gPSBJU19OT0RFIHx8IGlzVW5oYW5kbGVkKHN0YXRlKSA/IFVOSEFORExFRCA6IEhBTkRMRUQ7XG4gICAgICBpZiAocmVzdWx0LmVycm9yKSB0aHJvdyByZXN1bHQudmFsdWU7XG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBpc1VuaGFuZGxlZCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICByZXR1cm4gc3RhdGUucmVqZWN0aW9uICE9PSBIQU5ETEVEICYmICFzdGF0ZS5wYXJlbnQ7XG59O1xuXG52YXIgb25IYW5kbGVVbmhhbmRsZWQgPSBmdW5jdGlvbiAocHJvbWlzZSwgc3RhdGUpIHtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24gKCkge1xuICAgIGlmIChJU19OT0RFKSB7XG4gICAgICBwcm9jZXNzLmVtaXQoJ3JlamVjdGlvbkhhbmRsZWQnLCBwcm9taXNlKTtcbiAgICB9IGVsc2UgZGlzcGF0Y2hFdmVudChSRUpFQ1RJT05fSEFORExFRCwgcHJvbWlzZSwgc3RhdGUudmFsdWUpO1xuICB9KTtcbn07XG5cbnZhciBiaW5kID0gZnVuY3Rpb24gKGZuLCBwcm9taXNlLCBzdGF0ZSwgdW53cmFwKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBmbihwcm9taXNlLCBzdGF0ZSwgdmFsdWUsIHVud3JhcCk7XG4gIH07XG59O1xuXG52YXIgaW50ZXJuYWxSZWplY3QgPSBmdW5jdGlvbiAocHJvbWlzZSwgc3RhdGUsIHZhbHVlLCB1bndyYXApIHtcbiAgaWYgKHN0YXRlLmRvbmUpIHJldHVybjtcbiAgc3RhdGUuZG9uZSA9IHRydWU7XG4gIGlmICh1bndyYXApIHN0YXRlID0gdW53cmFwO1xuICBzdGF0ZS52YWx1ZSA9IHZhbHVlO1xuICBzdGF0ZS5zdGF0ZSA9IFJFSkVDVEVEO1xuICBub3RpZnkocHJvbWlzZSwgc3RhdGUsIHRydWUpO1xufTtcblxudmFyIGludGVybmFsUmVzb2x2ZSA9IGZ1bmN0aW9uIChwcm9taXNlLCBzdGF0ZSwgdmFsdWUsIHVud3JhcCkge1xuICBpZiAoc3RhdGUuZG9uZSkgcmV0dXJuO1xuICBzdGF0ZS5kb25lID0gdHJ1ZTtcbiAgaWYgKHVud3JhcCkgc3RhdGUgPSB1bndyYXA7XG4gIHRyeSB7XG4gICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB0aHJvdyBUeXBlRXJyb3IoXCJQcm9taXNlIGNhbid0IGJlIHJlc29sdmVkIGl0c2VsZlwiKTtcbiAgICB2YXIgdGhlbiA9IGlzVGhlbmFibGUodmFsdWUpO1xuICAgIGlmICh0aGVuKSB7XG4gICAgICBtaWNyb3Rhc2soZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgd3JhcHBlciA9IHsgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsXG4gICAgICAgICAgICBiaW5kKGludGVybmFsUmVzb2x2ZSwgcHJvbWlzZSwgd3JhcHBlciwgc3RhdGUpLFxuICAgICAgICAgICAgYmluZChpbnRlcm5hbFJlamVjdCwgcHJvbWlzZSwgd3JhcHBlciwgc3RhdGUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBpbnRlcm5hbFJlamVjdChwcm9taXNlLCB3cmFwcGVyLCBlcnJvciwgc3RhdGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUudmFsdWUgPSB2YWx1ZTtcbiAgICAgIHN0YXRlLnN0YXRlID0gRlVMRklMTEVEO1xuICAgICAgbm90aWZ5KHByb21pc2UsIHN0YXRlLCBmYWxzZSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGludGVybmFsUmVqZWN0KHByb21pc2UsIHsgZG9uZTogZmFsc2UgfSwgZXJyb3IsIHN0YXRlKTtcbiAgfVxufTtcblxuLy8gY29uc3RydWN0b3IgcG9seWZpbGxcbmlmIChGT1JDRUQpIHtcbiAgLy8gMjUuNC4zLjEgUHJvbWlzZShleGVjdXRvcilcbiAgUHJvbWlzZUNvbnN0cnVjdG9yID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuICAgIGFuSW5zdGFuY2UodGhpcywgUHJvbWlzZUNvbnN0cnVjdG9yLCBQUk9NSVNFKTtcbiAgICBhRnVuY3Rpb24oZXhlY3V0b3IpO1xuICAgIEludGVybmFsLmNhbGwodGhpcyk7XG4gICAgdmFyIHN0YXRlID0gZ2V0SW50ZXJuYWxTdGF0ZSh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgZXhlY3V0b3IoYmluZChpbnRlcm5hbFJlc29sdmUsIHRoaXMsIHN0YXRlKSwgYmluZChpbnRlcm5hbFJlamVjdCwgdGhpcywgc3RhdGUpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaW50ZXJuYWxSZWplY3QodGhpcywgc3RhdGUsIGVycm9yKTtcbiAgICB9XG4gIH07XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICBJbnRlcm5hbCA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3IpIHtcbiAgICBzZXRJbnRlcm5hbFN0YXRlKHRoaXMsIHtcbiAgICAgIHR5cGU6IFBST01JU0UsXG4gICAgICBkb25lOiBmYWxzZSxcbiAgICAgIG5vdGlmaWVkOiBmYWxzZSxcbiAgICAgIHBhcmVudDogZmFsc2UsXG4gICAgICByZWFjdGlvbnM6IFtdLFxuICAgICAgcmVqZWN0aW9uOiBmYWxzZSxcbiAgICAgIHN0YXRlOiBQRU5ESU5HLFxuICAgICAgdmFsdWU6IHVuZGVmaW5lZFxuICAgIH0pO1xuICB9O1xuICBJbnRlcm5hbC5wcm90b3R5cGUgPSByZWRlZmluZUFsbChQcm9taXNlQ29uc3RydWN0b3IucHJvdG90eXBlLCB7XG4gICAgLy8gYFByb21pc2UucHJvdG90eXBlLnRoZW5gIG1ldGhvZFxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXByb21pc2UucHJvdG90eXBlLnRoZW5cbiAgICB0aGVuOiBmdW5jdGlvbiB0aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFByb21pc2VTdGF0ZSh0aGlzKTtcbiAgICAgIHZhciByZWFjdGlvbiA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KHNwZWNpZXNDb25zdHJ1Y3Rvcih0aGlzLCBQcm9taXNlQ29uc3RydWN0b3IpKTtcbiAgICAgIHJlYWN0aW9uLm9rID0gdHlwZW9mIG9uRnVsZmlsbGVkID09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IHRydWU7XG4gICAgICByZWFjdGlvbi5mYWlsID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT0gJ2Z1bmN0aW9uJyAmJiBvblJlamVjdGVkO1xuICAgICAgcmVhY3Rpb24uZG9tYWluID0gSVNfTk9ERSA/IHByb2Nlc3MuZG9tYWluIDogdW5kZWZpbmVkO1xuICAgICAgc3RhdGUucGFyZW50ID0gdHJ1ZTtcbiAgICAgIHN0YXRlLnJlYWN0aW9ucy5wdXNoKHJlYWN0aW9uKTtcbiAgICAgIGlmIChzdGF0ZS5zdGF0ZSAhPSBQRU5ESU5HKSBub3RpZnkodGhpcywgc3RhdGUsIGZhbHNlKTtcbiAgICAgIHJldHVybiByZWFjdGlvbi5wcm9taXNlO1xuICAgIH0sXG4gICAgLy8gYFByb21pc2UucHJvdG90eXBlLmNhdGNoYCBtZXRob2RcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1wcm9taXNlLnByb3RvdHlwZS5jYXRjaFxuICAgICdjYXRjaCc6IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XG4gICAgfVxuICB9KTtcbiAgT3duUHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHByb21pc2UgPSBuZXcgSW50ZXJuYWwoKTtcbiAgICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFN0YXRlKHByb21pc2UpO1xuICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gICAgdGhpcy5yZXNvbHZlID0gYmluZChpbnRlcm5hbFJlc29sdmUsIHByb21pc2UsIHN0YXRlKTtcbiAgICB0aGlzLnJlamVjdCA9IGJpbmQoaW50ZXJuYWxSZWplY3QsIHByb21pc2UsIHN0YXRlKTtcbiAgfTtcbiAgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZiA9IG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKEMpIHtcbiAgICByZXR1cm4gQyA9PT0gUHJvbWlzZUNvbnN0cnVjdG9yIHx8IEMgPT09IFByb21pc2VXcmFwcGVyXG4gICAgICA/IG5ldyBPd25Qcm9taXNlQ2FwYWJpbGl0eShDKVxuICAgICAgOiBuZXdHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gIH07XG5cbiAgaWYgKCFJU19QVVJFICYmIHR5cGVvZiBOYXRpdmVQcm9taXNlID09ICdmdW5jdGlvbicpIHtcbiAgICBuYXRpdmVUaGVuID0gTmF0aXZlUHJvbWlzZS5wcm90b3R5cGUudGhlbjtcblxuICAgIC8vIHdyYXAgbmF0aXZlIFByb21pc2UjdGhlbiBmb3IgbmF0aXZlIGFzeW5jIGZ1bmN0aW9uc1xuICAgIHJlZGVmaW5lKE5hdGl2ZVByb21pc2UucHJvdG90eXBlLCAndGhlbicsIGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZUNvbnN0cnVjdG9yKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgbmF0aXZlVGhlbi5jYWxsKHRoYXQsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9KS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKTtcbiAgICB9KTtcblxuICAgIC8vIHdyYXAgZmV0Y2ggcmVzdWx0XG4gICAgaWYgKHR5cGVvZiAkZmV0Y2ggPT0gJ2Z1bmN0aW9uJykgJCh7IGdsb2JhbDogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgZm9yY2VkOiB0cnVlIH0sIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgZmV0Y2g6IGZ1bmN0aW9uIGZldGNoKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZShQcm9taXNlQ29uc3RydWN0b3IsICRmZXRjaC5hcHBseShnbG9iYWwsIGFyZ3VtZW50cykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbiQoeyBnbG9iYWw6IHRydWUsIHdyYXA6IHRydWUsIGZvcmNlZDogRk9SQ0VEIH0sIHtcbiAgUHJvbWlzZTogUHJvbWlzZUNvbnN0cnVjdG9yXG59KTtcblxuc2V0VG9TdHJpbmdUYWcoUHJvbWlzZUNvbnN0cnVjdG9yLCBQUk9NSVNFLCBmYWxzZSwgdHJ1ZSk7XG5zZXRTcGVjaWVzKFBST01JU0UpO1xuXG5Qcm9taXNlV3JhcHBlciA9IHBhdGhbUFJPTUlTRV07XG5cbi8vIHN0YXRpY3NcbiQoeyB0YXJnZXQ6IFBST01JU0UsIHN0YXQ6IHRydWUsIGZvcmNlZDogRk9SQ0VEIH0sIHtcbiAgLy8gYFByb21pc2UucmVqZWN0YCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcHJvbWlzZS5yZWplY3RcbiAgcmVqZWN0OiBmdW5jdGlvbiByZWplY3Qocikge1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkodGhpcyk7XG4gICAgY2FwYWJpbGl0eS5yZWplY3QuY2FsbCh1bmRlZmluZWQsIHIpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pO1xuXG4kKHsgdGFyZ2V0OiBQUk9NSVNFLCBzdGF0OiB0cnVlLCBmb3JjZWQ6IElTX1BVUkUgfHwgRk9SQ0VEIH0sIHtcbiAgLy8gYFByb21pc2UucmVzb2x2ZWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXByb21pc2UucmVzb2x2ZVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKHgpIHtcbiAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoSVNfUFVSRSAmJiB0aGlzID09PSBQcm9taXNlV3JhcHBlciA/IFByb21pc2VDb25zdHJ1Y3RvciA6IHRoaXMsIHgpO1xuICB9XG59KTtcblxuJCh7IHRhcmdldDogUFJPTUlTRSwgc3RhdDogdHJ1ZSwgZm9yY2VkOiBJTkNPUlJFQ1RfSVRFUkFUSU9OIH0sIHtcbiAgLy8gYFByb21pc2UuYWxsYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcHJvbWlzZS5hbGxcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpIHtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgICB2YXIgcmVzb2x2ZSA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICB2YXIgcmVqZWN0ID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIHJlc3VsdCA9IHBlcmZvcm0oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRwcm9taXNlUmVzb2x2ZSA9IGFGdW5jdGlvbihDLnJlc29sdmUpO1xuICAgICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IDE7XG4gICAgICBpdGVyYXRlKGl0ZXJhYmxlLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICB2YXIgaW5kZXggPSBjb3VudGVyKys7XG4gICAgICAgIHZhciBhbHJlYWR5Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICAkcHJvbWlzZVJlc29sdmUuY2FsbChDLCBwcm9taXNlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmIChhbHJlYWR5Q2FsbGVkKSByZXR1cm47XG4gICAgICAgICAgYWxyZWFkeUNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQuZXJyb3IpIHJlamVjdChyZXN1bHQudmFsdWUpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH0sXG4gIC8vIGBQcm9taXNlLnJhY2VgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1wcm9taXNlLnJhY2VcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSkge1xuICAgIHZhciBDID0gdGhpcztcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICB2YXIgcmVzdWx0ID0gcGVyZm9ybShmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHByb21pc2VSZXNvbHZlID0gYUZ1bmN0aW9uKEMucmVzb2x2ZSk7XG4gICAgICBpdGVyYXRlKGl0ZXJhYmxlLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICAkcHJvbWlzZVJlc29sdmUuY2FsbChDLCBwcm9taXNlKS50aGVuKGNhcGFiaWxpdHkucmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQuZXJyb3IpIHJlamVjdChyZXN1bHQudmFsdWUpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgSVNfUFVSRSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1wdXJlJyk7XG52YXIgTmF0aXZlUHJvbWlzZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtcHJvbWlzZS1jb25zdHJ1Y3RvcicpO1xudmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciBwcm9taXNlUmVzb2x2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wcm9taXNlLXJlc29sdmUnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xuXG4vLyBgUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1wcm9taXNlLnByb3RvdHlwZS5maW5hbGx5XG4kKHsgdGFyZ2V0OiAnUHJvbWlzZScsIHByb3RvOiB0cnVlLCByZWFsOiB0cnVlIH0sIHtcbiAgJ2ZpbmFsbHknOiBmdW5jdGlvbiAob25GaW5hbGx5KSB7XG4gICAgdmFyIEMgPSBzcGVjaWVzQ29uc3RydWN0b3IodGhpcywgZ2V0QnVpbHRJbignUHJvbWlzZScpKTtcbiAgICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiBvbkZpbmFsbHkgPT0gJ2Z1bmN0aW9uJztcbiAgICByZXR1cm4gdGhpcy50aGVuKFxuICAgICAgaXNGdW5jdGlvbiA/IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZShDLCBvbkZpbmFsbHkoKSkudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiB4OyB9KTtcbiAgICAgIH0gOiBvbkZpbmFsbHksXG4gICAgICBpc0Z1bmN0aW9uID8gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlKEMsIG9uRmluYWxseSgpKS50aGVuKGZ1bmN0aW9uICgpIHsgdGhyb3cgZTsgfSk7XG4gICAgICB9IDogb25GaW5hbGx5XG4gICAgKTtcbiAgfVxufSk7XG5cbi8vIHBhdGNoIG5hdGl2ZSBQcm9taXNlLnByb3RvdHlwZSBmb3IgbmF0aXZlIGFzeW5jIGZ1bmN0aW9uc1xuaWYgKCFJU19QVVJFICYmIHR5cGVvZiBOYXRpdmVQcm9taXNlID09ICdmdW5jdGlvbicgJiYgIU5hdGl2ZVByb21pc2UucHJvdG90eXBlWydmaW5hbGx5J10pIHtcbiAgcmVkZWZpbmUoTmF0aXZlUHJvbWlzZS5wcm90b3R5cGUsICdmaW5hbGx5JywgZ2V0QnVpbHRJbignUHJvbWlzZScpLnByb3RvdHlwZVsnZmluYWxseSddKTtcbn1cbiIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW50ZWdlcicpO1xudmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG5cbi8vIGBTdHJpbmcucHJvdG90eXBlLnsgY29kZVBvaW50QXQsIGF0IH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoQ09OVkVSVF9UT19TVFJJTkcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgcG9zKSB7XG4gICAgdmFyIFMgPSBTdHJpbmcocmVxdWlyZU9iamVjdENvZXJjaWJsZSgkdGhpcykpO1xuICAgIHZhciBwb3NpdGlvbiA9IHRvSW50ZWdlcihwb3MpO1xuICAgIHZhciBzaXplID0gUy5sZW5ndGg7XG4gICAgdmFyIGZpcnN0LCBzZWNvbmQ7XG4gICAgaWYgKHBvc2l0aW9uIDwgMCB8fCBwb3NpdGlvbiA+PSBzaXplKSByZXR1cm4gQ09OVkVSVF9UT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBmaXJzdCA9IFMuY2hhckNvZGVBdChwb3NpdGlvbik7XG4gICAgcmV0dXJuIGZpcnN0IDwgMHhEODAwIHx8IGZpcnN0ID4gMHhEQkZGIHx8IHBvc2l0aW9uICsgMSA9PT0gc2l6ZVxuICAgICAgfHwgKHNlY29uZCA9IFMuY2hhckNvZGVBdChwb3NpdGlvbiArIDEpKSA8IDB4REMwMCB8fCBzZWNvbmQgPiAweERGRkZcbiAgICAgICAgPyBDT05WRVJUX1RPX1NUUklORyA/IFMuY2hhckF0KHBvc2l0aW9uKSA6IGZpcnN0XG4gICAgICAgIDogQ09OVkVSVF9UT19TVFJJTkcgPyBTLnNsaWNlKHBvc2l0aW9uLCBwb3NpdGlvbiArIDIpIDogKGZpcnN0IC0gMHhEODAwIDw8IDEwKSArIChzZWNvbmQgLSAweERDMDApICsgMHgxMDAwMDtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgU3RyaW5nLnByb3RvdHlwZS5jb2RlUG9pbnRBdGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUuY29kZXBvaW50YXRcbiAgY29kZUF0OiBjcmVhdGVNZXRob2QoZmFsc2UpLFxuICAvLyBgU3RyaW5nLnByb3RvdHlwZS5hdGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRoaWFzYnluZW5zL1N0cmluZy5wcm90b3R5cGUuYXRcbiAgY2hhckF0OiBjcmVhdGVNZXRob2QodHJ1ZSlcbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBGKCkgeyAvKiBlbXB0eSAqLyB9XG4gIEYucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gbnVsbDtcbiAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihuZXcgRigpKSAhPT0gRi5wcm90b3R5cGU7XG59KTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgc2hhcmVkS2V5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1rZXknKTtcbnZhciBDT1JSRUNUX1BST1RPVFlQRV9HRVRURVIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY29ycmVjdC1wcm90b3R5cGUtZ2V0dGVyJyk7XG5cbnZhciBJRV9QUk9UTyA9IHNoYXJlZEtleSgnSUVfUFJPVE8nKTtcbnZhciBPYmplY3RQcm90b3R5cGUgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vLyBgT2JqZWN0LmdldFByb3RvdHlwZU9mYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5nZXRwcm90b3R5cGVvZlxubW9kdWxlLmV4cG9ydHMgPSBDT1JSRUNUX1BST1RPVFlQRV9HRVRURVIgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiAoTykge1xuICBPID0gdG9PYmplY3QoTyk7XG4gIGlmIChoYXMoTywgSUVfUFJPVE8pKSByZXR1cm4gT1tJRV9QUk9UT107XG4gIGlmICh0eXBlb2YgTy5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xuICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG90eXBlIDogbnVsbDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1wcm90b3R5cGUtb2YnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG52YXIgSVNfUFVSRSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1wdXJlJyk7XG5cbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcbnZhciBCVUdHWV9TQUZBUklfSVRFUkFUT1JTID0gZmFsc2U7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxuLy8gYCVJdGVyYXRvclByb3RvdHlwZSVgIG9iamVjdFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtJWl0ZXJhdG9ycHJvdG90eXBlJS1vYmplY3RcbnZhciBJdGVyYXRvclByb3RvdHlwZSwgUHJvdG90eXBlT2ZBcnJheUl0ZXJhdG9yUHJvdG90eXBlLCBhcnJheUl0ZXJhdG9yO1xuXG5pZiAoW10ua2V5cykge1xuICBhcnJheUl0ZXJhdG9yID0gW10ua2V5cygpO1xuICAvLyBTYWZhcmkgOCBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgaWYgKCEoJ25leHQnIGluIGFycmF5SXRlcmF0b3IpKSBCVUdHWV9TQUZBUklfSVRFUkFUT1JTID0gdHJ1ZTtcbiAgZWxzZSB7XG4gICAgUHJvdG90eXBlT2ZBcnJheUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoZ2V0UHJvdG90eXBlT2YoYXJyYXlJdGVyYXRvcikpO1xuICAgIGlmIChQcm90b3R5cGVPZkFycmF5SXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUpIEl0ZXJhdG9yUHJvdG90eXBlID0gUHJvdG90eXBlT2ZBcnJheUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG59XG5cbmlmIChJdGVyYXRvclByb3RvdHlwZSA9PSB1bmRlZmluZWQpIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5pZiAoIUlTX1BVUkUgJiYgIWhhcyhJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IpKSBoaWRlKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBJdGVyYXRvclByb3RvdHlwZTogSXRlcmF0b3JQcm90b3R5cGUsXG4gIEJVR0dZX1NBRkFSSV9JVEVSQVRPUlM6IEJVR0dZX1NBRkFSSV9JVEVSQVRPUlNcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cycpO1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnRpZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmRlZmluZXByb3BlcnRpZXNcbm1vZHVsZS5leHBvcnRzID0gREVTQ1JJUFRPUlMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBvYmplY3RLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsZW5ndGggPiBpbmRleCkgZGVmaW5lUHJvcGVydHlNb2R1bGUuZihPLCBrZXkgPSBrZXlzW2luZGV4KytdLCBQcm9wZXJ0aWVzW2tleV0pO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgZGVmaW5lUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnRpZXMnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzJyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xudmFyIGh0bWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaHRtbCcpO1xudmFyIGRvY3VtZW50Q3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudCcpO1xudmFyIHNoYXJlZEtleSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQta2V5Jyk7XG52YXIgSUVfUFJPVE8gPSBzaGFyZWRLZXkoJ0lFX1BST1RPJyk7XG5cbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcbnZhciBFbXB0eSA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSBkb2N1bWVudENyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICB2YXIgbGVuZ3RoID0gZW51bUJ1Z0tleXMubGVuZ3RoO1xuICB2YXIgbHQgPSAnPCc7XG4gIHZhciBzY3JpcHQgPSAnc2NyaXB0JztcbiAgdmFyIGd0ID0gJz4nO1xuICB2YXIganMgPSAnamF2YScgKyBzY3JpcHQgKyAnOic7XG4gIHZhciBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGh0bWwuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lLnNyYyA9IFN0cmluZyhqcyk7XG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUobHQgKyBzY3JpcHQgKyBndCArICdkb2N1bWVudC5GPU9iamVjdCcgKyBsdCArICcvJyArIHNjcmlwdCArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlIChsZW5ndGgtLSkgZGVsZXRlIGNyZWF0ZURpY3RbUFJPVE9UWVBFXVtlbnVtQnVnS2V5c1tsZW5ndGhdXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbi8vIGBPYmplY3QuY3JlYXRlYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5jcmVhdGVcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcykge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoTyAhPT0gbnVsbCkge1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkZWZpbmVQcm9wZXJ0aWVzKHJlc3VsdCwgUHJvcGVydGllcyk7XG59O1xuXG5oaWRkZW5LZXlzW0lFX1BST1RPXSA9IHRydWU7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgSXRlcmF0b3JQcm90b3R5cGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzLWNvcmUnKS5JdGVyYXRvclByb3RvdHlwZTtcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZScpO1xudmFyIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycycpO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEl0ZXJhdG9yQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpIHtcbiAgdmFyIFRPX1NUUklOR19UQUcgPSBOQU1FICsgJyBJdGVyYXRvcic7XG4gIEl0ZXJhdG9yQ29uc3RydWN0b3IucHJvdG90eXBlID0gY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7IG5leHQ6IGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcigxLCBuZXh0KSB9KTtcbiAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JDb25zdHJ1Y3RvciwgVE9fU1RSSU5HX1RBRywgZmFsc2UsIHRydWUpO1xuICBJdGVyYXRvcnNbVE9fU1RSSU5HX1RBR10gPSByZXR1cm5UaGlzO1xuICByZXR1cm4gSXRlcmF0b3JDb25zdHJ1Y3Rvcjtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpICYmIGl0ICE9PSBudWxsKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3Qgc2V0IFwiICsgU3RyaW5nKGl0KSArICcgYXMgYSBwcm90b3R5cGUnKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGFQb3NzaWJsZVByb3RvdHlwZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLXBvc3NpYmxlLXByb3RvdHlwZScpO1xuXG4vLyBgT2JqZWN0LnNldFByb3RvdHlwZU9mYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5zZXRwcm90b3R5cGVvZlxuLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gZnVuY3Rpb24gKCkge1xuICB2YXIgQ09SUkVDVF9TRVRURVIgPSBmYWxzZTtcbiAgdmFyIHRlc3QgPSB7fTtcbiAgdmFyIHNldHRlcjtcbiAgdHJ5IHtcbiAgICBzZXR0ZXIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQ7XG4gICAgc2V0dGVyLmNhbGwodGVzdCwgW10pO1xuICAgIENPUlJFQ1RfU0VUVEVSID0gdGVzdCBpbnN0YW5jZW9mIEFycmF5O1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90bykge1xuICAgIGFuT2JqZWN0KE8pO1xuICAgIGFQb3NzaWJsZVByb3RvdHlwZShwcm90byk7XG4gICAgaWYgKENPUlJFQ1RfU0VUVEVSKSBzZXR0ZXIuY2FsbChPLCBwcm90byk7XG4gICAgZWxzZSBPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgIHJldHVybiBPO1xuICB9O1xufSgpIDogdW5kZWZpbmVkKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGNyZWF0ZUl0ZXJhdG9yQ29uc3RydWN0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLWl0ZXJhdG9yLWNvbnN0cnVjdG9yJyk7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1wcm90b3R5cGUtb2YnKTtcbnZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qtc2V0LXByb3RvdHlwZS1vZicpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcbnZhciBJU19QVVJFID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLXB1cmUnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzJyk7XG52YXIgSXRlcmF0b3JzQ29yZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMtY29yZScpO1xuXG52YXIgSXRlcmF0b3JQcm90b3R5cGUgPSBJdGVyYXRvcnNDb3JlLkl0ZXJhdG9yUHJvdG90eXBlO1xudmFyIEJVR0dZX1NBRkFSSV9JVEVSQVRPUlMgPSBJdGVyYXRvcnNDb3JlLkJVR0dZX1NBRkFSSV9JVEVSQVRPUlM7XG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG52YXIgS0VZUyA9ICdrZXlzJztcbnZhciBWQUxVRVMgPSAndmFsdWVzJztcbnZhciBFTlRSSUVTID0gJ2VudHJpZXMnO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEl0ZXJhYmxlLCBOQU1FLCBJdGVyYXRvckNvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFRCkge1xuICBjcmVhdGVJdGVyYXRvckNvbnN0cnVjdG9yKEl0ZXJhdG9yQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuXG4gIHZhciBnZXRJdGVyYXRpb25NZXRob2QgPSBmdW5jdGlvbiAoS0lORCkge1xuICAgIGlmIChLSU5EID09PSBERUZBVUxUICYmIGRlZmF1bHRJdGVyYXRvcikgcmV0dXJuIGRlZmF1bHRJdGVyYXRvcjtcbiAgICBpZiAoIUJVR0dZX1NBRkFSSV9JVEVSQVRPUlMgJiYgS0lORCBpbiBJdGVyYWJsZVByb3RvdHlwZSkgcmV0dXJuIEl0ZXJhYmxlUHJvdG90eXBlW0tJTkRdO1xuICAgIHN3aXRjaCAoS0lORCkge1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpIHsgcmV0dXJuIG5ldyBJdGVyYXRvckNvbnN0cnVjdG9yKHRoaXMsIEtJTkQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiBuZXcgSXRlcmF0b3JDb25zdHJ1Y3Rvcih0aGlzLCBLSU5EKTsgfTtcbiAgICAgIGNhc2UgRU5UUklFUzogcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKSB7IHJldHVybiBuZXcgSXRlcmF0b3JDb25zdHJ1Y3Rvcih0aGlzLCBLSU5EKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgSXRlcmF0b3JDb25zdHJ1Y3Rvcih0aGlzKTsgfTtcbiAgfTtcblxuICB2YXIgVE9fU1RSSU5HX1RBRyA9IE5BTUUgKyAnIEl0ZXJhdG9yJztcbiAgdmFyIElOQ09SUkVDVF9WQUxVRVNfTkFNRSA9IGZhbHNlO1xuICB2YXIgSXRlcmFibGVQcm90b3R5cGUgPSBJdGVyYWJsZS5wcm90b3R5cGU7XG4gIHZhciBuYXRpdmVJdGVyYXRvciA9IEl0ZXJhYmxlUHJvdG90eXBlW0lURVJBVE9SXVxuICAgIHx8IEl0ZXJhYmxlUHJvdG90eXBlWydAQGl0ZXJhdG9yJ11cbiAgICB8fCBERUZBVUxUICYmIEl0ZXJhYmxlUHJvdG90eXBlW0RFRkFVTFRdO1xuICB2YXIgZGVmYXVsdEl0ZXJhdG9yID0gIUJVR0dZX1NBRkFSSV9JVEVSQVRPUlMgJiYgbmF0aXZlSXRlcmF0b3IgfHwgZ2V0SXRlcmF0aW9uTWV0aG9kKERFRkFVTFQpO1xuICB2YXIgYW55TmF0aXZlSXRlcmF0b3IgPSBOQU1FID09ICdBcnJheScgPyBJdGVyYWJsZVByb3RvdHlwZS5lbnRyaWVzIHx8IG5hdGl2ZUl0ZXJhdG9yIDogbmF0aXZlSXRlcmF0b3I7XG4gIHZhciBDdXJyZW50SXRlcmF0b3JQcm90b3R5cGUsIG1ldGhvZHMsIEtFWTtcblxuICAvLyBmaXggbmF0aXZlXG4gIGlmIChhbnlOYXRpdmVJdGVyYXRvcikge1xuICAgIEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvdHlwZU9mKGFueU5hdGl2ZUl0ZXJhdG9yLmNhbGwobmV3IEl0ZXJhYmxlKCkpKTtcbiAgICBpZiAoSXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlLm5leHQpIHtcbiAgICAgIGlmICghSVNfUFVSRSAmJiBnZXRQcm90b3R5cGVPZihDdXJyZW50SXRlcmF0b3JQcm90b3R5cGUpICE9PSBJdGVyYXRvclByb3RvdHlwZSkge1xuICAgICAgICBpZiAoc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgICAgICBzZXRQcm90b3R5cGVPZihDdXJyZW50SXRlcmF0b3JQcm90b3R5cGUsIEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlW0lURVJBVE9SXSAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaGlkZShDdXJyZW50SXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgICAgc2V0VG9TdHJpbmdUYWcoQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlLCBUT19TVFJJTkdfVEFHLCB0cnVlLCB0cnVlKTtcbiAgICAgIGlmIChJU19QVVJFKSBJdGVyYXRvcnNbVE9fU1RSSU5HX1RBR10gPSByZXR1cm5UaGlzO1xuICAgIH1cbiAgfVxuXG4gIC8vIGZpeCBBcnJheSN7dmFsdWVzLCBAQGl0ZXJhdG9yfS5uYW1lIGluIFY4IC8gRkZcbiAgaWYgKERFRkFVTFQgPT0gVkFMVUVTICYmIG5hdGl2ZUl0ZXJhdG9yICYmIG5hdGl2ZUl0ZXJhdG9yLm5hbWUgIT09IFZBTFVFUykge1xuICAgIElOQ09SUkVDVF9WQUxVRVNfTkFNRSA9IHRydWU7XG4gICAgZGVmYXVsdEl0ZXJhdG9yID0gZnVuY3Rpb24gdmFsdWVzKCkgeyByZXR1cm4gbmF0aXZlSXRlcmF0b3IuY2FsbCh0aGlzKTsgfTtcbiAgfVxuXG4gIC8vIGRlZmluZSBpdGVyYXRvclxuICBpZiAoKCFJU19QVVJFIHx8IEZPUkNFRCkgJiYgSXRlcmFibGVQcm90b3R5cGVbSVRFUkFUT1JdICE9PSBkZWZhdWx0SXRlcmF0b3IpIHtcbiAgICBoaWRlKEl0ZXJhYmxlUHJvdG90eXBlLCBJVEVSQVRPUiwgZGVmYXVsdEl0ZXJhdG9yKTtcbiAgfVxuICBJdGVyYXRvcnNbTkFNRV0gPSBkZWZhdWx0SXRlcmF0b3I7XG5cbiAgLy8gZXhwb3J0IGFkZGl0aW9uYWwgbWV0aG9kc1xuICBpZiAoREVGQVVMVCkge1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6IGdldEl0ZXJhdGlvbk1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogSVNfU0VUID8gZGVmYXVsdEl0ZXJhdG9yIDogZ2V0SXRlcmF0aW9uTWV0aG9kKEtFWVMpLFxuICAgICAgZW50cmllczogZ2V0SXRlcmF0aW9uTWV0aG9kKEVOVFJJRVMpXG4gICAgfTtcbiAgICBpZiAoRk9SQ0VEKSBmb3IgKEtFWSBpbiBtZXRob2RzKSB7XG4gICAgICBpZiAoQlVHR1lfU0FGQVJJX0lURVJBVE9SUyB8fCBJTkNPUlJFQ1RfVkFMVUVTX05BTUUgfHwgIShLRVkgaW4gSXRlcmFibGVQcm90b3R5cGUpKSB7XG4gICAgICAgIHJlZGVmaW5lKEl0ZXJhYmxlUHJvdG90eXBlLCBLRVksIG1ldGhvZHNbS0VZXSk7XG4gICAgICB9XG4gICAgfSBlbHNlICQoeyB0YXJnZXQ6IE5BTUUsIHByb3RvOiB0cnVlLCBmb3JjZWQ6IEJVR0dZX1NBRkFSSV9JVEVSQVRPUlMgfHwgSU5DT1JSRUNUX1ZBTFVFU19OQU1FIH0sIG1ldGhvZHMpO1xuICB9XG5cbiAgcmV0dXJuIG1ldGhvZHM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNoYXJBdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zdHJpbmctbXVsdGlieXRlJykuY2hhckF0O1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcbnZhciBkZWZpbmVJdGVyYXRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZWZpbmUtaXRlcmF0b3InKTtcblxudmFyIFNUUklOR19JVEVSQVRPUiA9ICdTdHJpbmcgSXRlcmF0b3InO1xudmFyIHNldEludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLnNldDtcbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXR0ZXJGb3IoU1RSSU5HX0lURVJBVE9SKTtcblxuLy8gYFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl1gIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS1AQGl0ZXJhdG9yXG5kZWZpbmVJdGVyYXRvcihTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbiAoaXRlcmF0ZWQpIHtcbiAgc2V0SW50ZXJuYWxTdGF0ZSh0aGlzLCB7XG4gICAgdHlwZTogU1RSSU5HX0lURVJBVE9SLFxuICAgIHN0cmluZzogU3RyaW5nKGl0ZXJhdGVkKSxcbiAgICBpbmRleDogMFxuICB9KTtcbi8vIGAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHRgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtJXN0cmluZ2l0ZXJhdG9ycHJvdG90eXBlJS5uZXh0XG59LCBmdW5jdGlvbiBuZXh0KCkge1xuICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFN0YXRlKHRoaXMpO1xuICB2YXIgc3RyaW5nID0gc3RhdGUuc3RyaW5nO1xuICB2YXIgaW5kZXggPSBzdGF0ZS5pbmRleDtcbiAgdmFyIHBvaW50O1xuICBpZiAoaW5kZXggPj0gc3RyaW5nLmxlbmd0aCkgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICBwb2ludCA9IGNoYXJBdChzdHJpbmcsIGluZGV4KTtcbiAgc3RhdGUuaW5kZXggKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4geyB2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlIH07XG59KTtcbiIsInZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXNldC1wcm90b3R5cGUtb2YnKTtcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZScpO1xudmFyIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyIGl0ZXJhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0ZScpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xuXG52YXIgJEFnZ3JlZ2F0ZUVycm9yID0gZnVuY3Rpb24gQWdncmVnYXRlRXJyb3IoZXJyb3JzLCBtZXNzYWdlKSB7XG4gIHZhciB0aGF0ID0gdGhpcztcbiAgaWYgKCEodGhhdCBpbnN0YW5jZW9mICRBZ2dyZWdhdGVFcnJvcikpIHJldHVybiBuZXcgJEFnZ3JlZ2F0ZUVycm9yKGVycm9ycywgbWVzc2FnZSk7XG4gIGlmIChzZXRQcm90b3R5cGVPZikge1xuICAgIHRoYXQgPSBzZXRQcm90b3R5cGVPZihuZXcgRXJyb3IobWVzc2FnZSksIGdldFByb3RvdHlwZU9mKHRoYXQpKTtcbiAgfVxuICB2YXIgZXJyb3JzQXJyYXkgPSBbXTtcbiAgaXRlcmF0ZShlcnJvcnMsIGVycm9yc0FycmF5LnB1c2gsIGVycm9yc0FycmF5KTtcbiAgaGlkZSh0aGF0LCAnZXJyb3JzJywgZXJyb3JzQXJyYXkpO1xuICBpZiAobWVzc2FnZSAhPT0gdW5kZWZpbmVkKSBoaWRlKHRoYXQsICdtZXNzYWdlJywgU3RyaW5nKG1lc3NhZ2UpKTtcbiAgcmV0dXJuIHRoYXQ7XG59O1xuXG4kQWdncmVnYXRlRXJyb3IucHJvdG90eXBlID0gY3JlYXRlKEVycm9yLnByb3RvdHlwZSwge1xuICBjb25zdHJ1Y3RvcjogY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKDUsICRBZ2dyZWdhdGVFcnJvciksXG4gIG5hbWU6IGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcig1LCAnQWdncmVnYXRlRXJyb3InKVxufSk7XG5cbiQoeyBnbG9iYWw6IHRydWUgfSwge1xuICBBZ2dyZWdhdGVFcnJvcjogJEFnZ3JlZ2F0ZUVycm9yXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLWZ1bmN0aW9uJyk7XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGVyZm9ybScpO1xudmFyIGl0ZXJhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0ZScpO1xuXG4vLyBgUHJvbWlzZS5hbGxTZXR0bGVkYCBtZXRob2Rcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLXByb21pc2UtYWxsU2V0dGxlZFxuJCh7IHRhcmdldDogJ1Byb21pc2UnLCBzdGF0OiB0cnVlIH0sIHtcbiAgYWxsU2V0dGxlZDogZnVuY3Rpb24gYWxsU2V0dGxlZChpdGVyYWJsZSkge1xuICAgIHZhciBDID0gdGhpcztcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlLmYoQyk7XG4gICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBwcm9taXNlUmVzb2x2ZSA9IGFGdW5jdGlvbihDLnJlc29sdmUpO1xuICAgICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IDE7XG4gICAgICBpdGVyYXRlKGl0ZXJhYmxlLCBmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgICAgICB2YXIgaW5kZXggPSBjb3VudGVyKys7XG4gICAgICAgIHZhciBhbHJlYWR5Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICBwcm9taXNlUmVzb2x2ZS5jYWxsKEMsIHByb21pc2UpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGFscmVhZHlDYWxsZWQpIHJldHVybjtcbiAgICAgICAgICBhbHJlYWR5Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0geyBzdGF0dXM6ICdmdWxmaWxsZWQnLCB2YWx1ZTogdmFsdWUgfTtcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKGFscmVhZHlDYWxsZWQpIHJldHVybjtcbiAgICAgICAgICBhbHJlYWR5Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0geyBzdGF0dXM6ICdyZWplY3RlZCcsIHJlYXNvbjogZSB9O1xuICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSByZWplY3QocmVzdWx0LnZhbHVlKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLWZ1bmN0aW9uJyk7XG52YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uZXctcHJvbWlzZS1jYXBhYmlsaXR5Jyk7XG52YXIgcGVyZm9ybSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wZXJmb3JtJyk7XG52YXIgaXRlcmF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRlJyk7XG5cbnZhciBQUk9NSVNFX0FOWV9FUlJPUiA9ICdObyBvbmUgcHJvbWlzZSByZXNvbHZlZCc7XG5cbi8vIGBQcm9taXNlLmFueWAgbWV0aG9kXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1wcm9taXNlLWFueVxuJCh7IHRhcmdldDogJ1Byb21pc2UnLCBzdGF0OiB0cnVlIH0sIHtcbiAgYW55OiBmdW5jdGlvbiBhbnkoaXRlcmFibGUpIHtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZS5mKEMpO1xuICAgIHZhciByZXNvbHZlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICB2YXIgcmVzdWx0ID0gcGVyZm9ybShmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcHJvbWlzZVJlc29sdmUgPSBhRnVuY3Rpb24oQy5yZXNvbHZlKTtcbiAgICAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgIHZhciByZW1haW5pbmcgPSAxO1xuICAgICAgdmFyIGFscmVhZHlSZXNvbHZlZCA9IGZhbHNlO1xuICAgICAgaXRlcmF0ZShpdGVyYWJsZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gY291bnRlcisrO1xuICAgICAgICB2YXIgYWxyZWFkeVJlamVjdGVkID0gZmFsc2U7XG4gICAgICAgIGVycm9ycy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICBwcm9taXNlUmVzb2x2ZS5jYWxsKEMsIHByb21pc2UpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGFscmVhZHlSZWplY3RlZCB8fCBhbHJlYWR5UmVzb2x2ZWQpIHJldHVybjtcbiAgICAgICAgICBhbHJlYWR5UmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmIChhbHJlYWR5UmVqZWN0ZWQgfHwgYWxyZWFkeVJlc29sdmVkKSByZXR1cm47XG4gICAgICAgICAgYWxyZWFkeVJlamVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvcnNbaW5kZXhdID0gZTtcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZWplY3QobmV3IChnZXRCdWlsdEluKCdBZ2dyZWdhdGVFcnJvcicpKShlcnJvcnMsIFBST01JU0VfQU5ZX0VSUk9SKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICAtLXJlbWFpbmluZyB8fCByZWplY3QobmV3IChnZXRCdWlsdEluKCdBZ2dyZWdhdGVFcnJvcicpKShlcnJvcnMsIFBST01JU0VfQU5ZX0VSUk9SKSk7XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5lcnJvcikgcmVqZWN0KHJlc3VsdC52YWx1ZSk7XG4gICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uZXctcHJvbWlzZS1jYXBhYmlsaXR5Jyk7XG52YXIgcGVyZm9ybSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wZXJmb3JtJyk7XG5cbi8vIGBQcm9taXNlLnRyeWAgbWV0aG9kXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1wcm9taXNlLXRyeVxuJCh7IHRhcmdldDogJ1Byb21pc2UnLCBzdGF0OiB0cnVlIH0sIHtcbiAgJ3RyeSc6IGZ1bmN0aW9uIChjYWxsYmFja2ZuKSB7XG4gICAgdmFyIHByb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZih0aGlzKTtcbiAgICB2YXIgcmVzdWx0ID0gcGVyZm9ybShjYWxsYmFja2ZuKTtcbiAgICAocmVzdWx0LmVycm9yID8gcHJvbWlzZUNhcGFiaWxpdHkucmVqZWN0IDogcHJvbWlzZUNhcGFiaWxpdHkucmVzb2x2ZSkocmVzdWx0LnZhbHVlKTtcbiAgICByZXR1cm4gcHJvbWlzZUNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7XG4iLCIvLyBpdGVyYWJsZSBET00gY29sbGVjdGlvbnNcbi8vIGZsYWcgLSBgaXRlcmFibGVgIGludGVyZmFjZSAtICdlbnRyaWVzJywgJ2tleXMnLCAndmFsdWVzJywgJ2ZvckVhY2gnIG1ldGhvZHNcbm1vZHVsZS5leHBvcnRzID0ge1xuICBDU1NSdWxlTGlzdDogMCxcbiAgQ1NTU3R5bGVEZWNsYXJhdGlvbjogMCxcbiAgQ1NTVmFsdWVMaXN0OiAwLFxuICBDbGllbnRSZWN0TGlzdDogMCxcbiAgRE9NUmVjdExpc3Q6IDAsXG4gIERPTVN0cmluZ0xpc3Q6IDAsXG4gIERPTVRva2VuTGlzdDogMSxcbiAgRGF0YVRyYW5zZmVySXRlbUxpc3Q6IDAsXG4gIEZpbGVMaXN0OiAwLFxuICBIVE1MQWxsQ29sbGVjdGlvbjogMCxcbiAgSFRNTENvbGxlY3Rpb246IDAsXG4gIEhUTUxGb3JtRWxlbWVudDogMCxcbiAgSFRNTFNlbGVjdEVsZW1lbnQ6IDAsXG4gIE1lZGlhTGlzdDogMCxcbiAgTWltZVR5cGVBcnJheTogMCxcbiAgTmFtZWROb2RlTWFwOiAwLFxuICBOb2RlTGlzdDogMSxcbiAgUGFpbnRSZXF1ZXN0TGlzdDogMCxcbiAgUGx1Z2luOiAwLFxuICBQbHVnaW5BcnJheTogMCxcbiAgU1ZHTGVuZ3RoTGlzdDogMCxcbiAgU1ZHTnVtYmVyTGlzdDogMCxcbiAgU1ZHUGF0aFNlZ0xpc3Q6IDAsXG4gIFNWR1BvaW50TGlzdDogMCxcbiAgU1ZHU3RyaW5nTGlzdDogMCxcbiAgU1ZHVHJhbnNmb3JtTGlzdDogMCxcbiAgU291cmNlQnVmZmVyTGlzdDogMCxcbiAgU3R5bGVTaGVldExpc3Q6IDAsXG4gIFRleHRUcmFja0N1ZUxpc3Q6IDAsXG4gIFRleHRUcmFja0xpc3Q6IDAsXG4gIFRvdWNoTGlzdDogMFxufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgRE9NSXRlcmFibGVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMnKTtcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWZvci1lYWNoJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG5cbmZvciAodmFyIENPTExFQ1RJT05fTkFNRSBpbiBET01JdGVyYWJsZXMpIHtcbiAgdmFyIENvbGxlY3Rpb24gPSBnbG9iYWxbQ09MTEVDVElPTl9OQU1FXTtcbiAgdmFyIENvbGxlY3Rpb25Qcm90b3R5cGUgPSBDb2xsZWN0aW9uICYmIENvbGxlY3Rpb24ucHJvdG90eXBlO1xuICAvLyBzb21lIENocm9tZSB2ZXJzaW9ucyBoYXZlIG5vbi1jb25maWd1cmFibGUgbWV0aG9kcyBvbiBET01Ub2tlbkxpc3RcbiAgaWYgKENvbGxlY3Rpb25Qcm90b3R5cGUgJiYgQ29sbGVjdGlvblByb3RvdHlwZS5mb3JFYWNoICE9PSBmb3JFYWNoKSB0cnkge1xuICAgIGhpZGUoQ29sbGVjdGlvblByb3RvdHlwZSwgJ2ZvckVhY2gnLCBmb3JFYWNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBDb2xsZWN0aW9uUHJvdG90eXBlLmZvckVhY2ggPSBmb3JFYWNoO1xuICB9XG59XG4iLCJ2YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1jcmVhdGUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcblxudmFyIFVOU0NPUEFCTEVTID0gd2VsbEtub3duU3ltYm9sKCd1bnNjb3BhYmxlcycpO1xudmFyIEFycmF5UHJvdG90eXBlID0gQXJyYXkucHJvdG90eXBlO1xuXG4vLyBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS1AQHVuc2NvcGFibGVzXG5pZiAoQXJyYXlQcm90b3R5cGVbVU5TQ09QQUJMRVNdID09IHVuZGVmaW5lZCkge1xuICBoaWRlKEFycmF5UHJvdG90eXBlLCBVTlNDT1BBQkxFUywgY3JlYXRlKG51bGwpKTtcbn1cblxuLy8gYWRkIGEga2V5IHRvIEFycmF5LnByb3RvdHlwZVtAQHVuc2NvcGFibGVzXVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIEFycmF5UHJvdG90eXBlW1VOU0NPUEFCTEVTXVtrZXldID0gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgYWRkVG9VbnNjb3BhYmxlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hZGQtdG8tdW5zY29wYWJsZXMnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzJyk7XG52YXIgSW50ZXJuYWxTdGF0ZU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbnRlcm5hbC1zdGF0ZScpO1xudmFyIGRlZmluZUl0ZXJhdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RlZmluZS1pdGVyYXRvcicpO1xuXG52YXIgQVJSQVlfSVRFUkFUT1IgPSAnQXJyYXkgSXRlcmF0b3InO1xudmFyIHNldEludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLnNldDtcbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXR0ZXJGb3IoQVJSQVlfSVRFUkFUT1IpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmVudHJpZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmVudHJpZXNcbi8vIGBBcnJheS5wcm90b3R5cGUua2V5c2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUua2V5c1xuLy8gYEFycmF5LnByb3RvdHlwZS52YWx1ZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLnZhbHVlc1xuLy8gYEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUtQEBpdGVyYXRvclxuLy8gYENyZWF0ZUFycmF5SXRlcmF0b3JgIGludGVybmFsIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtY3JlYXRlYXJyYXlpdGVyYXRvclxubW9kdWxlLmV4cG9ydHMgPSBkZWZpbmVJdGVyYXRvcihBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24gKGl0ZXJhdGVkLCBraW5kKSB7XG4gIHNldEludGVybmFsU3RhdGUodGhpcywge1xuICAgIHR5cGU6IEFSUkFZX0lURVJBVE9SLFxuICAgIHRhcmdldDogdG9JbmRleGVkT2JqZWN0KGl0ZXJhdGVkKSwgLy8gdGFyZ2V0XG4gICAgaW5kZXg6IDAsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4gICAga2luZDoga2luZCAgICAgICAgICAgICAgICAgICAgICAgICAvLyBraW5kXG4gIH0pO1xuLy8gYCVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0YCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLSVhcnJheWl0ZXJhdG9ycHJvdG90eXBlJS5uZXh0XG59LCBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdGF0ZSA9IGdldEludGVybmFsU3RhdGUodGhpcyk7XG4gIHZhciB0YXJnZXQgPSBzdGF0ZS50YXJnZXQ7XG4gIHZhciBraW5kID0gc3RhdGUua2luZDtcbiAgdmFyIGluZGV4ID0gc3RhdGUuaW5kZXgrKztcbiAgaWYgKCF0YXJnZXQgfHwgaW5kZXggPj0gdGFyZ2V0Lmxlbmd0aCkge1xuICAgIHN0YXRlLnRhcmdldCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cbiAgaWYgKGtpbmQgPT0gJ2tleXMnKSByZXR1cm4geyB2YWx1ZTogaW5kZXgsIGRvbmU6IGZhbHNlIH07XG4gIGlmIChraW5kID09ICd2YWx1ZXMnKSByZXR1cm4geyB2YWx1ZTogdGFyZ2V0W2luZGV4XSwgZG9uZTogZmFsc2UgfTtcbiAgcmV0dXJuIHsgdmFsdWU6IFtpbmRleCwgdGFyZ2V0W2luZGV4XV0sIGRvbmU6IGZhbHNlIH07XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJVxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtY3JlYXRldW5tYXBwZWRhcmd1bWVudHNvYmplY3Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWNyZWF0ZW1hcHBlZGFyZ3VtZW50c29iamVjdFxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLUBAdW5zY29wYWJsZXNcbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBET01JdGVyYWJsZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9tLWl0ZXJhYmxlcycpO1xudmFyIEFycmF5SXRlcmF0b3JNZXRob2RzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9lcy5hcnJheS5pdGVyYXRvcicpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG52YXIgVE9fU1RSSU5HX1RBRyA9IHdlbGxLbm93blN5bWJvbCgndG9TdHJpbmdUYWcnKTtcbnZhciBBcnJheVZhbHVlcyA9IEFycmF5SXRlcmF0b3JNZXRob2RzLnZhbHVlcztcblxuZm9yICh2YXIgQ09MTEVDVElPTl9OQU1FIGluIERPTUl0ZXJhYmxlcykge1xuICB2YXIgQ29sbGVjdGlvbiA9IGdsb2JhbFtDT0xMRUNUSU9OX05BTUVdO1xuICB2YXIgQ29sbGVjdGlvblByb3RvdHlwZSA9IENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGU7XG4gIGlmIChDb2xsZWN0aW9uUHJvdG90eXBlKSB7XG4gICAgLy8gc29tZSBDaHJvbWUgdmVyc2lvbnMgaGF2ZSBub24tY29uZmlndXJhYmxlIG1ldGhvZHMgb24gRE9NVG9rZW5MaXN0XG4gICAgaWYgKENvbGxlY3Rpb25Qcm90b3R5cGVbSVRFUkFUT1JdICE9PSBBcnJheVZhbHVlcykgdHJ5IHtcbiAgICAgIGhpZGUoQ29sbGVjdGlvblByb3RvdHlwZSwgSVRFUkFUT1IsIEFycmF5VmFsdWVzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgQ29sbGVjdGlvblByb3RvdHlwZVtJVEVSQVRPUl0gPSBBcnJheVZhbHVlcztcbiAgICB9XG4gICAgaWYgKCFDb2xsZWN0aW9uUHJvdG90eXBlW1RPX1NUUklOR19UQUddKSBoaWRlKENvbGxlY3Rpb25Qcm90b3R5cGUsIFRPX1NUUklOR19UQUcsIENPTExFQ1RJT05fTkFNRSk7XG4gICAgaWYgKERPTUl0ZXJhYmxlc1tDT0xMRUNUSU9OX05BTUVdKSBmb3IgKHZhciBNRVRIT0RfTkFNRSBpbiBBcnJheUl0ZXJhdG9yTWV0aG9kcykge1xuICAgICAgLy8gc29tZSBDaHJvbWUgdmVyc2lvbnMgaGF2ZSBub24tY29uZmlndXJhYmxlIG1ldGhvZHMgb24gRE9NVG9rZW5MaXN0XG4gICAgICBpZiAoQ29sbGVjdGlvblByb3RvdHlwZVtNRVRIT0RfTkFNRV0gIT09IEFycmF5SXRlcmF0b3JNZXRob2RzW01FVEhPRF9OQU1FXSkgdHJ5IHtcbiAgICAgICAgaGlkZShDb2xsZWN0aW9uUHJvdG90eXBlLCBNRVRIT0RfTkFNRSwgQXJyYXlJdGVyYXRvck1ldGhvZHNbTUVUSE9EX05BTUVdKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIENvbGxlY3Rpb25Qcm90b3R5cGVbTUVUSE9EX05BTUVdID0gQXJyYXlJdGVyYXRvck1ldGhvZHNbTUVUSE9EX05BTUVdO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwidmFyIHN1cHBvcnQgPSB7XG4gIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gIGJsb2I6XG4gICAgJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiZcbiAgICAnQmxvYicgaW4gc2VsZiAmJlxuICAgIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxufVxuXG5mdW5jdGlvbiBpc0RhdGFWaWV3KG9iaikge1xuICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbn1cblxuaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gIF1cblxuICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPVxuICAgIEFycmF5QnVmZmVyLmlzVmlldyB8fFxuICAgIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB2aWV3Q2xhc3Nlcy5pbmRleE9mKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSA+IC0xXG4gICAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgfVxuICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5eX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICB9XG4gIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgfVxuICByZXR1cm4gdmFsdWVcbn1cblxuLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbmZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gIHZhciBpdGVyYXRvciA9IHtcbiAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGl0ZXJhdG9yXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdGhpcy5tYXAgPSB7fVxuXG4gIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgfSwgdGhpcylcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdGhpcy5hcHBlbmQoaGVhZGVyWzBdLCBoZWFkZXJbMV0pXG4gICAgfSwgdGhpcylcbiAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgIH0sIHRoaXMpXG4gIH1cbn1cblxuSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlICsgJywgJyArIHZhbHVlIDogdmFsdWVcbn1cblxuSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbn1cblxuSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgfVxuICB9XG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGl0ZW1zID0gW11cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgaXRlbXMucHVzaChuYW1lKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaXRlbXMgPSBbXVxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpdGVtcy5wdXNoKHZhbHVlKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGl0ZW1zID0gW11cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbmlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG59XG5cbmZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gIH1cbiAgYm9keS5ib2R5VXNlZCA9IHRydWVcbn1cblxuZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgIH1cbiAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gIHJldHVybiBwcm9taXNlXG59XG5cbmZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICByZXR1cm4gcHJvbWlzZVxufVxuXG5mdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gIH1cbiAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICB9IGVsc2Uge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgfVxufVxuXG5mdW5jdGlvbiBCb2R5KCkge1xuICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICBpZiAoIWJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcilcbiAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYm9keSlcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIGNvbnN1bWVkKHRoaXMpIHx8IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgIHJldHVybiByZWplY3RlZFxuICAgIH1cblxuICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlYWRBcnJheUJ1ZmZlckFzVGV4dCh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpKVxuICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgfVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgfVxuICB9XG5cbiAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxudmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gIHJldHVybiBtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSA/IHVwY2FzZWQgOiBtZXRob2Rcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcblxuICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgIH1cbiAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbFxuICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KVxuICB9XG5cbiAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnc2FtZS1vcmlnaW4nXG4gIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgfVxuICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gIHRoaXMuc2lnbmFsID0gb3B0aW9ucy5zaWduYWwgfHwgdGhpcy5zaWduYWxcbiAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICB9XG4gIHRoaXMuX2luaXRCb2R5KGJvZHkpXG59XG5cblJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7Ym9keTogdGhpcy5fYm9keUluaXR9KVxufVxuXG5mdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gIGJvZHlcbiAgICAudHJpbSgpXG4gICAgLnNwbGl0KCcmJylcbiAgICAuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgcmV0dXJuIGZvcm1cbn1cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gIC8vIFJlcGxhY2UgaW5zdGFuY2VzIG9mIFxcclxcbiBhbmQgXFxuIGZvbGxvd2VkIGJ5IGF0IGxlYXN0IG9uZSBzcGFjZSBvciBob3Jpem9udGFsIHRhYiB3aXRoIGEgc3BhY2VcbiAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcyMzAjc2VjdGlvbi0zLjJcbiAgdmFyIHByZVByb2Nlc3NlZEhlYWRlcnMgPSByYXdIZWFkZXJzLnJlcGxhY2UoL1xccj9cXG5bXFx0IF0rL2csICcgJylcbiAgcHJlUHJvY2Vzc2VkSGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgIHZhciBrZXkgPSBwYXJ0cy5zaGlmdCgpLnRyaW0oKVxuICAgIGlmIChrZXkpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfVxuICB9KVxuICByZXR1cm4gaGVhZGVyc1xufVxuXG5Cb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbmV4cG9ydCBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0ge31cbiAgfVxuXG4gIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzID09PSB1bmRlZmluZWQgPyAyMDAgOiBvcHRpb25zLnN0YXR1c1xuICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG59XG5cbkJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cblJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICB1cmw6IHRoaXMudXJsXG4gIH0pXG59XG5cblJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gIHJldHVybiByZXNwb25zZVxufVxuXG52YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICB9XG5cbiAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG59XG5cbmV4cG9ydCB2YXIgRE9NRXhjZXB0aW9uID0gc2VsZi5ET01FeGNlcHRpb25cbnRyeSB7XG4gIG5ldyBET01FeGNlcHRpb24oKVxufSBjYXRjaCAoZXJyKSB7XG4gIERPTUV4Y2VwdGlvbiA9IGZ1bmN0aW9uKG1lc3NhZ2UsIG5hbWUpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHZhciBlcnJvciA9IEVycm9yKG1lc3NhZ2UpXG4gICAgdGhpcy5zdGFjayA9IGVycm9yLnN0YWNrXG4gIH1cbiAgRE9NRXhjZXB0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKVxuICBET01FeGNlcHRpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRE9NRXhjZXB0aW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaChpbnB1dCwgaW5pdCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcblxuICAgIGlmIChyZXF1ZXN0LnNpZ25hbCAmJiByZXF1ZXN0LnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KG5ldyBET01FeGNlcHRpb24oJ0Fib3J0ZWQnLCAnQWJvcnRFcnJvcicpKVxuICAgIH1cblxuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgZnVuY3Rpb24gYWJvcnRYaHIoKSB7XG4gICAgICB4aHIuYWJvcnQoKVxuICAgIH1cblxuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgfVxuICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgIH1cblxuICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgIH1cblxuICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgfVxuXG4gICAgeGhyLm9uYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdChuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydGVkJywgJ0Fib3J0RXJyb3InKSlcbiAgICB9XG5cbiAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgIH0gZWxzZSBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ29taXQnKSB7XG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgIH1cblxuICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICB9KVxuXG4gICAgaWYgKHJlcXVlc3Quc2lnbmFsKSB7XG4gICAgICByZXF1ZXN0LnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0WGhyKVxuXG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIERPTkUgKHN1Y2Nlc3Mgb3IgZmFpbHVyZSlcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgcmVxdWVzdC5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydFhocilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gIH0pXG59XG5cbmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxuXG5pZiAoIXNlbGYuZmV0Y2gpIHtcbiAgc2VsZi5mZXRjaCA9IGZldGNoXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2Vcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQb2x5ZmlsbCBmb3IgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcygpXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9tYXRjaGVzI1BvbHlmaWxsXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcylcbiAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgZnVuY3Rpb24ocykge1xuICAgICAgbGV0IG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpXG4gICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKHMpO1xuICAgICAgbGV0IGkgPSBtYXRjaGVzLmxlbmd0aDtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lbXB0eVxuICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gdGhpcykge31cbiAgICAgIHJldHVybiBpID4gLTE7XG4gICAgfTtcbi8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQb2x5ZmlsbCBmb3IgRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlKClcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DaGlsZE5vZGUvcmVtb3ZlI1BvbHlmaWxsXG4gKi9cblxuKGZ1bmN0aW9uKGFycikge1xuICBhcnIuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoJ3JlbW92ZScpKSByZXR1cm47XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3JlbW92ZScsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudE5vZGUgIT09IG51bGwpXG4gICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pKFtcbiAgRWxlbWVudC5wcm90b3R5cGUsXG4gIENoYXJhY3RlckRhdGEucHJvdG90eXBlLFxuICBEb2N1bWVudFR5cGUucHJvdG90eXBlXG5dKTtcbi8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiJdLCJuYW1lcyI6WyJnbG9iYWwiLCJjbGFzc29mIiwiSW5kZXhlZE9iamVjdCIsImRvY3VtZW50IiwiREVTQ1JJUFRPUlMiLCJjcmVhdGVFbGVtZW50IiwiSUU4X0RPTV9ERUZJTkUiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZSIsImRlZmluZVByb3BlcnR5TW9kdWxlIiwibmF0aXZlRnVuY3Rpb25Ub1N0cmluZyIsIldlYWtNYXAiLCJoYXMiLCJOQVRJVkVfV0VBS19NQVAiLCJvYmplY3RIYXMiLCJJbnRlcm5hbFN0YXRlTW9kdWxlIiwicmVxdWlyZSQkMCIsIm1pbiIsImhpZGRlbktleXMiLCJpbnRlcm5hbE9iamVjdEtleXMiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiaXNGb3JjZWQiLCJhRnVuY3Rpb24iLCJTeW1ib2wiLCJzdG9yZSIsIk5BVElWRV9TWU1CT0wiLCJjcmVhdGVNZXRob2QiLCJiaW5kIiwiJCIsImZvckVhY2giLCJhcmd1bWVudHMiLCJhc3NpZ24iLCJUT19TVFJJTkdfVEFHIiwidG9TdHJpbmciLCJTUEVDSUVTIiwiSXRlcmF0b3JzIiwiSVRFUkFUT1IiLCJzZXQiLCJyZXF1aXJlJCQxIiwicHJvY2VzcyIsIlByb21pc2UiLCJ0YXNrIiwiTmF0aXZlUHJvbWlzZSIsIlR5cGVFcnJvciIsIm5ld1Byb21pc2VDYXBhYmlsaXR5IiwibmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUiLCJJU19OT0RFIiwiSVNfUFVSRSIsIm5vdGlmeSIsIml0ZXJhdGUiLCJPYmplY3RQcm90b3R5cGUiLCJDT1JSRUNUX1BST1RPVFlQRV9HRVRURVIiLCJnZXRQcm90b3R5cGVPZiIsIklFX1BST1RPIiwiZGVmaW5lUHJvcGVydGllcyIsIkl0ZXJhdG9yUHJvdG90eXBlIiwicmV0dXJuVGhpcyIsImNyZWF0ZSIsIkl0ZXJhdG9yc0NvcmUiLCJCVUdHWV9TQUZBUklfSVRFUkFUT1JTIiwic2V0UHJvdG90eXBlT2YiLCJzZXRJbnRlcm5hbFN0YXRlIiwiZ2V0SW50ZXJuYWxTdGF0ZSIsIkRPTUl0ZXJhYmxlcyIsIkFycmF5UHJvdG90eXBlIiwiQXJyYXlJdGVyYXRvck1ldGhvZHMiLCJDT0xMRUNUSU9OX05BTUUiLCJDb2xsZWN0aW9uIiwiQ29sbGVjdGlvblByb3RvdHlwZSIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtYXRjaGVzIiwibWF0Y2hlc1NlbGVjdG9yIiwibW96TWF0Y2hlc1NlbGVjdG9yIiwibXNNYXRjaGVzU2VsZWN0b3IiLCJvTWF0Y2hlc1NlbGVjdG9yIiwid2Via2l0TWF0Y2hlc1NlbGVjdG9yIiwicyIsImxldCIsIm93bmVyRG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaSIsImxlbmd0aCIsIml0ZW0iLCJhcnIiLCJoYXNPd25Qcm9wZXJ0eSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwidmFsdWUiLCJyZW1vdmUiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJDaGFyYWN0ZXJEYXRhIiwiRG9jdW1lbnRUeXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Q0FBQSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7Q0FDakIsSUFBSSxLQUFLLEdBQUcsVUFBVSxFQUFFLEVBQUU7R0FDeEIsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDO0VBQ3BDLENBQUM7OztDQUdGLFlBQWM7O0dBRVosS0FBSyxDQUFDLE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUM7R0FDM0MsS0FBSyxDQUFDLE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUM7R0FDbkMs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
