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

	var ITERATOR$6 = wellKnownSymbol('iterator');

	var nativeUrl = !fails(function () {
	  var url = new URL('b?e=1', 'http://a');
	  var searchParams = url.searchParams;
	  url.pathname = 'c%20d';
	  return (isPure && !url.toJSON)
	    || !searchParams.sort
	    || url.href !== 'http://a/c%20d?e=1'
	    || searchParams.get('e') !== '1'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !searchParams[ITERATOR$6]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('http://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('http://a#б').hash !== '#%D0%B1';
	});

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);
	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  } return anObject(iteratorMethod.call(it));
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

















	var ITERATOR$7 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$3 = internalState.set;
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
	  setInternalState$3(this, {
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
	  var iteratorMethod, iterator, step, entryIterator, first, second, key;

	  setInternalState$3(that, {
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
	        while (!(step = iterator.next()).done) {
	          entryIterator = getIterator(anObject(step.value));
	          if (
	            (first = entryIterator.next()).done ||
	            (second = entryIterator.next()).done ||
	            !entryIterator.next().done
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
	    var boundFunction = bindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
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

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWZpbGxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2xvYmFsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZhaWxzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2Rlc2NyaXB0b3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1wcm9wZXJ0eS1pcy1lbnVtZXJhYmxlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NsYXNzb2YtcmF3LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hhcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pZTgtZG9tLWRlZmluZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FuLW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hpZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2V0LWdsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1wdXJlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NoYXJlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9mdW5jdGlvbi10by1zdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXdlYWstbWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3VpZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zaGFyZWQta2V5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hpZGRlbi1rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlZGVmaW5lLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3BhdGguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWludGVnZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tbGVuZ3RoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWFic29sdXRlLWluZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FycmF5LWluY2x1ZGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2VudW0tYnVnLWtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktc3ltYm9scy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vd24ta2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jb3B5LWNvbnN0cnVjdG9yLXByb3BlcnRpZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtZm9yY2VkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2V4cG9ydC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hLWZ1bmN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2JpbmQtY29udGV4dC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtYXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXN5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1pdGVyYXRpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2xvcHB5LWFycmF5LW1ldGhvZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1mb3ItZWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMuYXJyYXkuZm9yLWVhY2guanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWtleXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWFzc2lnbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMub2JqZWN0LmFzc2lnbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jbGFzc29mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC10by1zdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLm9iamVjdC50by1zdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXByb21pc2UtY29uc3RydWN0b3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcmVkZWZpbmUtYWxsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NldC10by1zdHJpbmctdGFnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NldC1zcGVjaWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FuLWluc3RhbmNlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2l0ZXJhdG9ycy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1hcnJheS1pdGVyYXRvci1tZXRob2QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jYWxsLXdpdGgtc2FmZS1pdGVyYXRpb24tY2xvc2luZy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pdGVyYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NoZWNrLWNvcnJlY3RuZXNzLW9mLWl0ZXJhdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2h0bWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdGFzay5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91c2VyLWFnZW50LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL21pY3JvdGFzay5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9uZXctcHJvbWlzZS1jYXBhYmlsaXR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3Byb21pc2UtcmVzb2x2ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9ob3N0LXJlcG9ydC1lcnJvcnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvcGVyZm9ybS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMucHJvbWlzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMucHJvbWlzZS5maW5hbGx5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3N0cmluZy1tdWx0aWJ5dGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY29ycmVjdC1wcm90b3R5cGUtZ2V0dGVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2l0ZXJhdG9ycy1jb3JlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydGllcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtY3JlYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1pdGVyYXRvci1jb25zdHJ1Y3Rvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hLXBvc3NpYmxlLXByb3RvdHlwZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3Qtc2V0LXByb3RvdHlwZS1vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kZWZpbmUtaXRlcmF0b3IuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLnN0cmluZy5pdGVyYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXNuZXh0LmFnZ3JlZ2F0ZS1lcnJvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMucHJvbWlzZS5hbGwtc2V0dGxlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXNuZXh0LnByb21pc2UuYW55LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lc25leHQucHJvbWlzZS50cnkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZG9tLWl0ZXJhYmxlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmRvbS1jb2xsZWN0aW9ucy5mb3ItZWFjaC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hZGQtdG8tdW5zY29wYWJsZXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5Lml0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIuZG9tLWNvbGxlY3Rpb25zLml0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25hdGl2ZS11cmwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIudXJsLXNlYXJjaC1wYXJhbXMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwiLi4vLi4vc3JjL3V0aWxpdGllcy9lbGVtZW50L21hdGNoZXMuanMiLCIuLi8uLi9zcmMvdXRpbGl0aWVzL2VsZW1lbnQvY2xvc2VzdC5qcyIsIi4uLy4uL3NyYy91dGlsaXRpZXMvZWxlbWVudC9yZW1vdmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIE8gPSAnb2JqZWN0JztcbnZhciBjaGVjayA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgJiYgaXQuTWF0aCA9PSBNYXRoICYmIGl0O1xufTtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbm1vZHVsZS5leHBvcnRzID1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gIGNoZWNrKHR5cGVvZiBnbG9iYWxUaGlzID09IE8gJiYgZ2xvYmFsVGhpcykgfHxcbiAgY2hlY2sodHlwZW9mIHdpbmRvdyA9PSBPICYmIHdpbmRvdykgfHxcbiAgY2hlY2sodHlwZW9mIHNlbGYgPT0gTyAmJiBzZWxmKSB8fFxuICBjaGVjayh0eXBlb2YgZ2xvYmFsID09IE8gJiYgZ2xvYmFsKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxuLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuLy8gTmFzaG9ybiB+IEpESzggYnVnXG52YXIgTkFTSE9STl9CVUcgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgIW5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoeyAxOiAyIH0sIDEpO1xuXG4vLyBgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZWAgbWV0aG9kIGltcGxlbWVudGF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QucHJvdG90eXBlLnByb3BlcnR5aXNlbnVtZXJhYmxlXG5leHBvcnRzLmYgPSBOQVNIT1JOX0JVRyA/IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKFYpIHtcbiAgdmFyIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcywgVik7XG4gIHJldHVybiAhIWRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5lbnVtZXJhYmxlO1xufSA6IG5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYml0bWFwLCB2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGU6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlOiB2YWx1ZVxuICB9O1xufTtcbiIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcblxudmFyIHNwbGl0ID0gJycuc3BsaXQ7XG5cbi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG5tb2R1bGUuZXhwb3J0cyA9IGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgLy8gdGhyb3dzIGFuIGVycm9yIGluIHJoaW5vLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvcmhpbm8vaXNzdWVzLzM0NlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gIHJldHVybiAhT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCk7XG59KSA/IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gY2xhc3NvZihpdCkgPT0gJ1N0cmluZycgPyBzcGxpdC5jYWxsKGl0LCAnJykgOiBPYmplY3QoaXQpO1xufSA6IE9iamVjdDtcbiIsIi8vIGBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlcXVpcmVvYmplY3Rjb2VyY2libGVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCA9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiLy8gdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0Jyk7XG52YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIEluZGV4ZWRPYmplY3QocmVxdWlyZU9iamVjdENvZXJjaWJsZShpdCkpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG4vLyBgVG9QcmltaXRpdmVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9wcmltaXRpdmVcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5wdXQsIFBSRUZFUlJFRF9TVFJJTkcpIHtcbiAgaWYgKCFpc09iamVjdChpbnB1dCkpIHJldHVybiBpbnB1dDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGlucHV0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaW5wdXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgRVhJU1RTID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gRVhJU1RTID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9jdW1lbnQtY3JlYXRlLWVsZW1lbnQnKTtcblxuLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhREVTQ1JJUFRPUlMgJiYgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjcmVhdGVFbGVtZW50KCdkaXYnKSwgJ2EnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9XG4gIH0pLmEgIT0gNztcbn0pO1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaWU4LWRvbS1kZWZpbmUnKTtcblxudmFyIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbi8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5nZXRvd25wcm9wZXJ0eWRlc2NyaXB0b3JcbmV4cG9ydHMuZiA9IERFU0NSSVBUT1JTID8gbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSW5kZXhlZE9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKCFwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoU3RyaW5nKGl0KSArICcgaXMgbm90IGFuIG9iamVjdCcpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pZTgtZG9tLWRlZmluZScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLXByaW1pdGl2ZScpO1xuXG52YXIgbmF0aXZlRGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbi8vIGBPYmplY3QuZGVmaW5lUHJvcGVydHlgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmRlZmluZXByb3BlcnR5XG5leHBvcnRzLmYgPSBERVNDUklQVE9SUyA/IG5hdGl2ZURlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBuYXRpdmVEZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gREVTQ1JJUFRPUlMgPyBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mKG9iamVjdCwga2V5LCBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB0cnkge1xuICAgIGhpZGUoZ2xvYmFsLCBrZXksIHZhbHVlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBnbG9iYWxba2V5XSA9IHZhbHVlO1xuICB9IHJldHVybiB2YWx1ZTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZhbHNlO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBzZXRHbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LWdsb2JhbCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xuXG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCBzZXRHbG9iYWwoU0hBUkVELCB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiAnMy4yLjEnLFxuICBtb2RlOiBJU19QVVJFID8gJ3B1cmUnIDogJ2dsb2JhbCcsXG4gIGNvcHlyaWdodDogJ8KpIDIwMTkgRGVuaXMgUHVzaGthcmV2ICh6bG9pcm9jay5ydSknXG59KTtcbiIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2hhcmVkKCduYXRpdmUtZnVuY3Rpb24tdG8tc3RyaW5nJywgRnVuY3Rpb24udG9TdHJpbmcpO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBuYXRpdmVGdW5jdGlvblRvU3RyaW5nID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Z1bmN0aW9uLXRvLXN0cmluZycpO1xuXG52YXIgV2Vha01hcCA9IGdsb2JhbC5XZWFrTWFwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBXZWFrTWFwID09PSAnZnVuY3Rpb24nICYmIC9uYXRpdmUgY29kZS8udGVzdChuYXRpdmVGdW5jdGlvblRvU3RyaW5nLmNhbGwoV2Vha01hcCkpO1xuIiwidmFyIGlkID0gMDtcbnZhciBwb3N0Zml4ID0gTWF0aC5yYW5kb20oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiAnU3ltYm9sKCcgKyBTdHJpbmcoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSkgKyAnKV8nICsgKCsraWQgKyBwb3N0Zml4KS50b1N0cmluZygzNik7XG59O1xuIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdWlkJyk7XG5cbnZhciBrZXlzID0gc2hhcmVkKCdrZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4ga2V5c1trZXldIHx8IChrZXlzW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcbiIsInZhciBOQVRJVkVfV0VBS19NQVAgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXdlYWstbWFwJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xudmFyIG9iamVjdEhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBzaGFyZWRLZXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkLWtleScpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZGVuLWtleXMnKTtcblxudmFyIFdlYWtNYXAgPSBnbG9iYWwuV2Vha01hcDtcbnZhciBzZXQsIGdldCwgaGFzO1xuXG52YXIgZW5mb3JjZSA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaGFzKGl0KSA/IGdldChpdCkgOiBzZXQoaXQsIHt9KTtcbn07XG5cbnZhciBnZXR0ZXJGb3IgPSBmdW5jdGlvbiAoVFlQRSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGl0KSB7XG4gICAgdmFyIHN0YXRlO1xuICAgIGlmICghaXNPYmplY3QoaXQpIHx8IChzdGF0ZSA9IGdldChpdCkpLnR5cGUgIT09IFRZUEUpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcignSW5jb21wYXRpYmxlIHJlY2VpdmVyLCAnICsgVFlQRSArICcgcmVxdWlyZWQnKTtcbiAgICB9IHJldHVybiBzdGF0ZTtcbiAgfTtcbn07XG5cbmlmIChOQVRJVkVfV0VBS19NQVApIHtcbiAgdmFyIHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgdmFyIHdtZ2V0ID0gc3RvcmUuZ2V0O1xuICB2YXIgd21oYXMgPSBzdG9yZS5oYXM7XG4gIHZhciB3bXNldCA9IHN0b3JlLnNldDtcbiAgc2V0ID0gZnVuY3Rpb24gKGl0LCBtZXRhZGF0YSkge1xuICAgIHdtc2V0LmNhbGwoc3RvcmUsIGl0LCBtZXRhZGF0YSk7XG4gICAgcmV0dXJuIG1ldGFkYXRhO1xuICB9O1xuICBnZXQgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gd21nZXQuY2FsbChzdG9yZSwgaXQpIHx8IHt9O1xuICB9O1xuICBoYXMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gd21oYXMuY2FsbChzdG9yZSwgaXQpO1xuICB9O1xufSBlbHNlIHtcbiAgdmFyIFNUQVRFID0gc2hhcmVkS2V5KCdzdGF0ZScpO1xuICBoaWRkZW5LZXlzW1NUQVRFXSA9IHRydWU7XG4gIHNldCA9IGZ1bmN0aW9uIChpdCwgbWV0YWRhdGEpIHtcbiAgICBoaWRlKGl0LCBTVEFURSwgbWV0YWRhdGEpO1xuICAgIHJldHVybiBtZXRhZGF0YTtcbiAgfTtcbiAgZ2V0ID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIG9iamVjdEhhcyhpdCwgU1RBVEUpID8gaXRbU1RBVEVdIDoge307XG4gIH07XG4gIGhhcyA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiBvYmplY3RIYXMoaXQsIFNUQVRFKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogc2V0LFxuICBnZXQ6IGdldCxcbiAgaGFzOiBoYXMsXG4gIGVuZm9yY2U6IGVuZm9yY2UsXG4gIGdldHRlckZvcjogZ2V0dGVyRm9yXG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgbmF0aXZlRnVuY3Rpb25Ub1N0cmluZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mdW5jdGlvbi10by1zdHJpbmcnKTtcbnZhciBJbnRlcm5hbFN0YXRlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlJyk7XG5cbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXQ7XG52YXIgZW5mb3JjZUludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmVuZm9yY2U7XG52YXIgVEVNUExBVEUgPSBTdHJpbmcobmF0aXZlRnVuY3Rpb25Ub1N0cmluZykuc3BsaXQoJ3RvU3RyaW5nJyk7XG5cbnNoYXJlZCgnaW5zcGVjdFNvdXJjZScsIGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gbmF0aXZlRnVuY3Rpb25Ub1N0cmluZy5jYWxsKGl0KTtcbn0pO1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICB2YXIgdW5zYWZlID0gb3B0aW9ucyA/ICEhb3B0aW9ucy51bnNhZmUgOiBmYWxzZTtcbiAgdmFyIHNpbXBsZSA9IG9wdGlvbnMgPyAhIW9wdGlvbnMuZW51bWVyYWJsZSA6IGZhbHNlO1xuICB2YXIgbm9UYXJnZXRHZXQgPSBvcHRpb25zID8gISFvcHRpb25zLm5vVGFyZ2V0R2V0IDogZmFsc2U7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICh0eXBlb2Yga2V5ID09ICdzdHJpbmcnICYmICFoYXModmFsdWUsICduYW1lJykpIGhpZGUodmFsdWUsICduYW1lJywga2V5KTtcbiAgICBlbmZvcmNlSW50ZXJuYWxTdGF0ZSh2YWx1ZSkuc291cmNlID0gVEVNUExBVEUuam9pbih0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8ga2V5IDogJycpO1xuICB9XG4gIGlmIChPID09PSBnbG9iYWwpIHtcbiAgICBpZiAoc2ltcGxlKSBPW2tleV0gPSB2YWx1ZTtcbiAgICBlbHNlIHNldEdsb2JhbChrZXksIHZhbHVlKTtcbiAgICByZXR1cm47XG4gIH0gZWxzZSBpZiAoIXVuc2FmZSkge1xuICAgIGRlbGV0ZSBPW2tleV07XG4gIH0gZWxzZSBpZiAoIW5vVGFyZ2V0R2V0ICYmIE9ba2V5XSkge1xuICAgIHNpbXBsZSA9IHRydWU7XG4gIH1cbiAgaWYgKHNpbXBsZSkgT1trZXldID0gdmFsdWU7XG4gIGVsc2UgaGlkZShPLCBrZXksIHZhbHVlKTtcbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgZ2V0SW50ZXJuYWxTdGF0ZSh0aGlzKS5zb3VyY2UgfHwgbmF0aXZlRnVuY3Rpb25Ub1N0cmluZy5jYWxsKHRoaXMpO1xufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbiIsInZhciBwYXRoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3BhdGgnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG5cbnZhciBhRnVuY3Rpb24gPSBmdW5jdGlvbiAodmFyaWFibGUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YXJpYWJsZSA9PSAnZnVuY3Rpb24nID8gdmFyaWFibGUgOiB1bmRlZmluZWQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lc3BhY2UsIG1ldGhvZCkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBhRnVuY3Rpb24ocGF0aFtuYW1lc3BhY2VdKSB8fCBhRnVuY3Rpb24oZ2xvYmFsW25hbWVzcGFjZV0pXG4gICAgOiBwYXRoW25hbWVzcGFjZV0gJiYgcGF0aFtuYW1lc3BhY2VdW21ldGhvZF0gfHwgZ2xvYmFsW25hbWVzcGFjZV0gJiYgZ2xvYmFsW25hbWVzcGFjZV1bbWV0aG9kXTtcbn07XG4iLCJ2YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5cbi8vIGBUb0ludGVnZXJgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9pbnRlZ2VyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xuICByZXR1cm4gaXNOYU4oYXJndW1lbnQgPSArYXJndW1lbnQpID8gMCA6IChhcmd1bWVudCA+IDAgPyBmbG9vciA6IGNlaWwpKGFyZ3VtZW50KTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcblxudmFyIG1pbiA9IE1hdGgubWluO1xuXG4vLyBgVG9MZW5ndGhgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9sZW5ndGhcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHJldHVybiBhcmd1bWVudCA+IDAgPyBtaW4odG9JbnRlZ2VyKGFyZ3VtZW50KSwgMHgxRkZGRkZGRkZGRkZGRikgOiAwOyAvLyAyICoqIDUzIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbnRlZ2VyJyk7XG5cbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcblxuLy8gSGVscGVyIGZvciBhIHBvcHVsYXIgcmVwZWF0aW5nIGNhc2Ugb2YgdGhlIHNwZWM6XG4vLyBMZXQgaW50ZWdlciBiZSA/IFRvSW50ZWdlcihpbmRleCkuXG4vLyBJZiBpbnRlZ2VyIDwgMCwgbGV0IHJlc3VsdCBiZSBtYXgoKGxlbmd0aCArIGludGVnZXIpLCAwKTsgZWxzZSBsZXQgcmVzdWx0IGJlIG1pbihsZW5ndGgsIGxlbmd0aCkuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XG4gIHZhciBpbnRlZ2VyID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGludGVnZXIgPCAwID8gbWF4KGludGVnZXIgKyBsZW5ndGgsIDApIDogbWluKGludGVnZXIsIGxlbmd0aCk7XG59O1xuIiwidmFyIHRvSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1hYnNvbHV0ZS1pbmRleCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLnsgaW5kZXhPZiwgaW5jbHVkZXMgfWAgbWV0aG9kcyBpbXBsZW1lbnRhdGlvblxudmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0luZGV4ZWRPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSB7XG4gICAgICBpZiAoKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pICYmIE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXNgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbiAgaW5jbHVkZXM6IGNyZWF0ZU1ldGhvZCh0cnVlKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5pbmRleE9mYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmluZGV4b2ZcbiAgaW5kZXhPZjogY3JlYXRlTWV0aG9kKGZhbHNlKVxufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgaW5kZXhPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1pbmNsdWRlcycpLmluZGV4T2Y7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JbmRleGVkT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSAhaGFzKGhpZGRlbktleXMsIGtleSkgJiYgaGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkgaWYgKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSkge1xuICAgIH5pbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gSUU4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ2NvbnN0cnVjdG9yJyxcbiAgJ2hhc093blByb3BlcnR5JyxcbiAgJ2lzUHJvdG90eXBlT2YnLFxuICAncHJvcGVydHlJc0VudW1lcmFibGUnLFxuICAndG9Mb2NhbGVTdHJpbmcnLFxuICAndG9TdHJpbmcnLFxuICAndmFsdWVPZidcbl07XG4iLCJ2YXIgaW50ZXJuYWxPYmplY3RLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xuXG52YXIgaGlkZGVuS2V5cyA9IGVudW1CdWdLZXlzLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xuXG4vLyBgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmdldG93bnByb3BlcnR5bmFtZXNcbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xuICByZXR1cm4gaW50ZXJuYWxPYmplY3RLZXlzKE8sIGhpZGRlbktleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4iLCJ2YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcbnZhciBnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LW5hbWVzJyk7XG52YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcblxuLy8gYWxsIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBub24tZW51bWVyYWJsZSBhbmQgc3ltYm9sc1xubW9kdWxlLmV4cG9ydHMgPSBnZXRCdWlsdEluKCdSZWZsZWN0JywgJ293bktleXMnKSB8fCBmdW5jdGlvbiBvd25LZXlzKGl0KSB7XG4gIHZhciBrZXlzID0gZ2V0T3duUHJvcGVydHlOYW1lc01vZHVsZS5mKGFuT2JqZWN0KGl0KSk7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUuZjtcbiAgcmV0dXJuIGdldE93blByb3BlcnR5U3ltYm9scyA/IGtleXMuY29uY2F0KGdldE93blByb3BlcnR5U3ltYm9scyhpdCkpIDoga2V5cztcbn07XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIG93bktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb3duLWtleXMnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgdmFyIGtleXMgPSBvd25LZXlzKHNvdXJjZSk7XG4gIHZhciBkZWZpbmVQcm9wZXJ0eSA9IGRlZmluZVByb3BlcnR5TW9kdWxlLmY7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUuZjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgaWYgKCFoYXModGFyZ2V0LCBrZXkpKSBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7XG4gIH1cbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxudmFyIHJlcGxhY2VtZW50ID0gLyN8XFwucHJvdG90eXBlXFwuLztcblxudmFyIGlzRm9yY2VkID0gZnVuY3Rpb24gKGZlYXR1cmUsIGRldGVjdGlvbikge1xuICB2YXIgdmFsdWUgPSBkYXRhW25vcm1hbGl6ZShmZWF0dXJlKV07XG4gIHJldHVybiB2YWx1ZSA9PSBQT0xZRklMTCA/IHRydWVcbiAgICA6IHZhbHVlID09IE5BVElWRSA/IGZhbHNlXG4gICAgOiB0eXBlb2YgZGV0ZWN0aW9uID09ICdmdW5jdGlvbicgPyBmYWlscyhkZXRlY3Rpb24pXG4gICAgOiAhIWRldGVjdGlvbjtcbn07XG5cbnZhciBub3JtYWxpemUgPSBpc0ZvcmNlZC5ub3JtYWxpemUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlcGxhY2VtZW50LCAnLicpLnRvTG93ZXJDYXNlKCk7XG59O1xuXG52YXIgZGF0YSA9IGlzRm9yY2VkLmRhdGEgPSB7fTtcbnZhciBOQVRJVkUgPSBpc0ZvcmNlZC5OQVRJVkUgPSAnTic7XG52YXIgUE9MWUZJTEwgPSBpc0ZvcmNlZC5QT0xZRklMTCA9ICdQJztcblxubW9kdWxlLmV4cG9ydHMgPSBpc0ZvcmNlZDtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKS5mO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgc2V0R2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC1nbG9iYWwnKTtcbnZhciBjb3B5Q29uc3RydWN0b3JQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NvcHktY29uc3RydWN0b3ItcHJvcGVydGllcycpO1xudmFyIGlzRm9yY2VkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLWZvcmNlZCcpO1xuXG4vKlxuICBvcHRpb25zLnRhcmdldCAgICAgIC0gbmFtZSBvZiB0aGUgdGFyZ2V0IG9iamVjdFxuICBvcHRpb25zLmdsb2JhbCAgICAgIC0gdGFyZ2V0IGlzIHRoZSBnbG9iYWwgb2JqZWN0XG4gIG9wdGlvbnMuc3RhdCAgICAgICAgLSBleHBvcnQgYXMgc3RhdGljIG1ldGhvZHMgb2YgdGFyZ2V0XG4gIG9wdGlvbnMucHJvdG8gICAgICAgLSBleHBvcnQgYXMgcHJvdG90eXBlIG1ldGhvZHMgb2YgdGFyZ2V0XG4gIG9wdGlvbnMucmVhbCAgICAgICAgLSByZWFsIHByb3RvdHlwZSBtZXRob2QgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxuICBvcHRpb25zLmZvcmNlZCAgICAgIC0gZXhwb3J0IGV2ZW4gaWYgdGhlIG5hdGl2ZSBmZWF0dXJlIGlzIGF2YWlsYWJsZVxuICBvcHRpb25zLmJpbmQgICAgICAgIC0gYmluZCBtZXRob2RzIHRvIHRoZSB0YXJnZXQsIHJlcXVpcmVkIGZvciB0aGUgYHB1cmVgIHZlcnNpb25cbiAgb3B0aW9ucy53cmFwICAgICAgICAtIHdyYXAgY29uc3RydWN0b3JzIHRvIHByZXZlbnRpbmcgZ2xvYmFsIHBvbGx1dGlvbiwgcmVxdWlyZWQgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxuICBvcHRpb25zLnVuc2FmZSAgICAgIC0gdXNlIHRoZSBzaW1wbGUgYXNzaWdubWVudCBvZiBwcm9wZXJ0eSBpbnN0ZWFkIG9mIGRlbGV0ZSArIGRlZmluZVByb3BlcnR5XG4gIG9wdGlvbnMuc2hhbSAgICAgICAgLSBhZGQgYSBmbGFnIHRvIG5vdCBjb21wbGV0ZWx5IGZ1bGwgcG9seWZpbGxzXG4gIG9wdGlvbnMuZW51bWVyYWJsZSAgLSBleHBvcnQgYXMgZW51bWVyYWJsZSBwcm9wZXJ0eVxuICBvcHRpb25zLm5vVGFyZ2V0R2V0IC0gcHJldmVudCBjYWxsaW5nIGEgZ2V0dGVyIG9uIHRhcmdldFxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMsIHNvdXJjZSkge1xuICB2YXIgVEFSR0VUID0gb3B0aW9ucy50YXJnZXQ7XG4gIHZhciBHTE9CQUwgPSBvcHRpb25zLmdsb2JhbDtcbiAgdmFyIFNUQVRJQyA9IG9wdGlvbnMuc3RhdDtcbiAgdmFyIEZPUkNFRCwgdGFyZ2V0LCBrZXksIHRhcmdldFByb3BlcnR5LCBzb3VyY2VQcm9wZXJ0eSwgZGVzY3JpcHRvcjtcbiAgaWYgKEdMT0JBTCkge1xuICAgIHRhcmdldCA9IGdsb2JhbDtcbiAgfSBlbHNlIGlmIChTVEFUSUMpIHtcbiAgICB0YXJnZXQgPSBnbG9iYWxbVEFSR0VUXSB8fCBzZXRHbG9iYWwoVEFSR0VULCB7fSk7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0ID0gKGdsb2JhbFtUQVJHRVRdIHx8IHt9KS5wcm90b3R5cGU7XG4gIH1cbiAgaWYgKHRhcmdldCkgZm9yIChrZXkgaW4gc291cmNlKSB7XG4gICAgc291cmNlUHJvcGVydHkgPSBzb3VyY2Vba2V5XTtcbiAgICBpZiAob3B0aW9ucy5ub1RhcmdldEdldCkge1xuICAgICAgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSk7XG4gICAgICB0YXJnZXRQcm9wZXJ0eSA9IGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci52YWx1ZTtcbiAgICB9IGVsc2UgdGFyZ2V0UHJvcGVydHkgPSB0YXJnZXRba2V5XTtcbiAgICBGT1JDRUQgPSBpc0ZvcmNlZChHTE9CQUwgPyBrZXkgOiBUQVJHRVQgKyAoU1RBVElDID8gJy4nIDogJyMnKSArIGtleSwgb3B0aW9ucy5mb3JjZWQpO1xuICAgIC8vIGNvbnRhaW5lZCBpbiB0YXJnZXRcbiAgICBpZiAoIUZPUkNFRCAmJiB0YXJnZXRQcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIHNvdXJjZVByb3BlcnR5ID09PSB0eXBlb2YgdGFyZ2V0UHJvcGVydHkpIGNvbnRpbnVlO1xuICAgICAgY29weUNvbnN0cnVjdG9yUHJvcGVydGllcyhzb3VyY2VQcm9wZXJ0eSwgdGFyZ2V0UHJvcGVydHkpO1xuICAgIH1cbiAgICAvLyBhZGQgYSBmbGFnIHRvIG5vdCBjb21wbGV0ZWx5IGZ1bGwgcG9seWZpbGxzXG4gICAgaWYgKG9wdGlvbnMuc2hhbSB8fCAodGFyZ2V0UHJvcGVydHkgJiYgdGFyZ2V0UHJvcGVydHkuc2hhbSkpIHtcbiAgICAgIGhpZGUoc291cmNlUHJvcGVydHksICdzaGFtJywgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICByZWRlZmluZSh0YXJnZXQsIGtleSwgc291cmNlUHJvcGVydHksIG9wdGlvbnMpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFN0cmluZyhpdCkgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xuXG4vLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCB0aGF0LCBsZW5ndGgpIHtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYgKHRoYXQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZuO1xuICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQpO1xuICAgIH07XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgvKiAuLi5hcmdzICovKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuIiwidmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG5cbi8vIGBUb09iamVjdGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b29iamVjdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIE9iamVjdChyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KSk7XG59O1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcblxuLy8gYElzQXJyYXlgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXNhcnJheVxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjbGFzc29mKGFyZykgPT0gJ0FycmF5Jztcbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAhIU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgJiYgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgLy8gQ2hyb21lIDM4IFN5bWJvbCBoYXMgaW5jb3JyZWN0IHRvU3RyaW5nIGNvbnZlcnNpb25cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gIHJldHVybiAhU3RyaW5nKFN5bWJvbCgpKTtcbn0pO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3VpZCcpO1xudmFyIE5BVElWRV9TWU1CT0wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXN5bWJvbCcpO1xuXG52YXIgU3ltYm9sID0gZ2xvYmFsLlN5bWJvbDtcbnZhciBzdG9yZSA9IHNoYXJlZCgnd2tzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9IE5BVElWRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdXG4gICAgfHwgKE5BVElWRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1hcnJheScpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xuXG4vLyBgQXJyYXlTcGVjaWVzQ3JlYXRlYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5c3BlY2llc2NyZWF0ZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3JpZ2luYWxBcnJheSwgbGVuZ3RoKSB7XG4gIHZhciBDO1xuICBpZiAoaXNBcnJheShvcmlnaW5hbEFycmF5KSkge1xuICAgIEMgPSBvcmlnaW5hbEFycmF5LmNvbnN0cnVjdG9yO1xuICAgIC8vIGNyb3NzLXJlYWxtIGZhbGxiYWNrXG4gICAgaWYgKHR5cGVvZiBDID09ICdmdW5jdGlvbicgJiYgKEMgPT09IEFycmF5IHx8IGlzQXJyYXkoQy5wcm90b3R5cGUpKSkgQyA9IHVuZGVmaW5lZDtcbiAgICBlbHNlIGlmIChpc09iamVjdChDKSkge1xuICAgICAgQyA9IENbU1BFQ0lFU107XG4gICAgICBpZiAoQyA9PT0gbnVsbCkgQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIG5ldyAoQyA9PT0gdW5kZWZpbmVkID8gQXJyYXkgOiBDKShsZW5ndGggPT09IDAgPyAwIDogbGVuZ3RoKTtcbn07XG4iLCJ2YXIgYmluZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9iaW5kLWNvbnRleHQnKTtcbnZhciBJbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0Jyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgYXJyYXlTcGVjaWVzQ3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LXNwZWNpZXMtY3JlYXRlJyk7XG5cbnZhciBwdXNoID0gW10ucHVzaDtcblxuLy8gYEFycmF5LnByb3RvdHlwZS57IGZvckVhY2gsIG1hcCwgZmlsdGVyLCBzb21lLCBldmVyeSwgZmluZCwgZmluZEluZGV4IH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoVFlQRSkge1xuICB2YXIgSVNfTUFQID0gVFlQRSA9PSAxO1xuICB2YXIgSVNfRklMVEVSID0gVFlQRSA9PSAyO1xuICB2YXIgSVNfU09NRSA9IFRZUEUgPT0gMztcbiAgdmFyIElTX0VWRVJZID0gVFlQRSA9PSA0O1xuICB2YXIgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNjtcbiAgdmFyIE5PX0hPTEVTID0gVFlQRSA9PSA1IHx8IElTX0ZJTkRfSU5ERVg7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIGNhbGxiYWNrZm4sIHRoYXQsIHNwZWNpZmljQ3JlYXRlKSB7XG4gICAgdmFyIE8gPSB0b09iamVjdCgkdGhpcyk7XG4gICAgdmFyIHNlbGYgPSBJbmRleGVkT2JqZWN0KE8pO1xuICAgIHZhciBib3VuZEZ1bmN0aW9uID0gYmluZChjYWxsYmFja2ZuLCB0aGF0LCAzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIGNyZWF0ZSA9IHNwZWNpZmljQ3JlYXRlIHx8IGFycmF5U3BlY2llc0NyZWF0ZTtcbiAgICB2YXIgdGFyZ2V0ID0gSVNfTUFQID8gY3JlYXRlKCR0aGlzLCBsZW5ndGgpIDogSVNfRklMVEVSID8gY3JlYXRlKCR0aGlzLCAwKSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgdmFsdWUsIHJlc3VsdDtcbiAgICBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKE5PX0hPTEVTIHx8IGluZGV4IGluIHNlbGYpIHtcbiAgICAgIHZhbHVlID0gc2VsZltpbmRleF07XG4gICAgICByZXN1bHQgPSBib3VuZEZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgTyk7XG4gICAgICBpZiAoVFlQRSkge1xuICAgICAgICBpZiAoSVNfTUFQKSB0YXJnZXRbaW5kZXhdID0gcmVzdWx0OyAvLyBtYXBcbiAgICAgICAgZWxzZSBpZiAocmVzdWx0KSBzd2l0Y2ggKFRZUEUpIHtcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgLy8gc29tZVxuICAgICAgICAgIGNhc2UgNTogcmV0dXJuIHZhbHVlOyAgICAgICAgICAgICAvLyBmaW5kXG4gICAgICAgICAgY2FzZSA2OiByZXR1cm4gaW5kZXg7ICAgICAgICAgICAgIC8vIGZpbmRJbmRleFxuICAgICAgICAgIGNhc2UgMjogcHVzaC5jYWxsKHRhcmdldCwgdmFsdWUpOyAvLyBmaWx0ZXJcbiAgICAgICAgfSBlbHNlIGlmIChJU19FVkVSWSkgcmV0dXJuIGZhbHNlOyAgLy8gZXZlcnlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIElTX0ZJTkRfSU5ERVggPyAtMSA6IElTX1NPTUUgfHwgSVNfRVZFUlkgPyBJU19FVkVSWSA6IHRhcmdldDtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxuICBmb3JFYWNoOiBjcmVhdGVNZXRob2QoMCksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUubWFwYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLm1hcFxuICBtYXA6IGNyZWF0ZU1ldGhvZCgxKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maWx0ZXJgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmlsdGVyXG4gIGZpbHRlcjogY3JlYXRlTWV0aG9kKDIpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLnNvbWVgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuc29tZVxuICBzb21lOiBjcmVhdGVNZXRob2QoMyksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZXZlcnlgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZXZlcnlcbiAgZXZlcnk6IGNyZWF0ZU1ldGhvZCg0KSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maW5kYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbmRcbiAgZmluZDogY3JlYXRlTWV0aG9kKDUpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maW5kSW5kZXhcbiAgZmluZEluZGV4OiBjcmVhdGVNZXRob2QoNilcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTUVUSE9EX05BTUUsIGFyZ3VtZW50KSB7XG4gIHZhciBtZXRob2QgPSBbXVtNRVRIT0RfTkFNRV07XG4gIHJldHVybiAhbWV0aG9kIHx8ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtY2FsbCxuby10aHJvdy1saXRlcmFsXG4gICAgbWV0aG9kLmNhbGwobnVsbCwgYXJndW1lbnQgfHwgZnVuY3Rpb24gKCkgeyB0aHJvdyAxOyB9LCAxKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICRmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWl0ZXJhdGlvbicpLmZvckVhY2g7XG52YXIgc2xvcHB5QXJyYXlNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2xvcHB5LWFycmF5LW1ldGhvZCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZCBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZvcmVhY2hcbm1vZHVsZS5leHBvcnRzID0gc2xvcHB5QXJyYXlNZXRob2QoJ2ZvckVhY2gnKSA/IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbiAvKiAsIHRoaXNBcmcgKi8pIHtcbiAgcmV0dXJuICRmb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkKTtcbn0gOiBbXS5mb3JFYWNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1mb3ItZWFjaCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZvcmVhY2hcbiQoeyB0YXJnZXQ6ICdBcnJheScsIHByb3RvOiB0cnVlLCBmb3JjZWQ6IFtdLmZvckVhY2ggIT0gZm9yRWFjaCB9LCB7XG4gIGZvckVhY2g6IGZvckVhY2hcbn0pO1xuIiwidmFyIGludGVybmFsT2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VudW0tYnVnLWtleXMnKTtcblxuLy8gYE9iamVjdC5rZXlzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5rZXlzXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gaW50ZXJuYWxPYmplY3RLZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIG9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktc3ltYm9scycpO1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1wcm9wZXJ0eS1pcy1lbnVtZXJhYmxlJyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbmRleGVkLW9iamVjdCcpO1xuXG52YXIgbmF0aXZlQXNzaWduID0gT2JqZWN0LmFzc2lnbjtcblxuLy8gYE9iamVjdC5hc3NpZ25gIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmFzc2lnblxuLy8gc2hvdWxkIHdvcmsgd2l0aCBzeW1ib2xzIGFuZCBzaG91bGQgaGF2ZSBkZXRlcm1pbmlzdGljIHByb3BlcnR5IG9yZGVyIChWOCBidWcpXG5tb2R1bGUuZXhwb3J0cyA9ICFuYXRpdmVBc3NpZ24gfHwgZmFpbHMoZnVuY3Rpb24gKCkge1xuICB2YXIgQSA9IHt9O1xuICB2YXIgQiA9IHt9O1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgdmFyIHN5bWJvbCA9IFN5bWJvbCgpO1xuICB2YXIgYWxwaGFiZXQgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3QnO1xuICBBW3N5bWJvbF0gPSA3O1xuICBhbHBoYWJldC5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbiAoY2hyKSB7IEJbY2hyXSA9IGNocjsgfSk7XG4gIHJldHVybiBuYXRpdmVBc3NpZ24oe30sIEEpW3N5bWJvbF0gIT0gNyB8fCBvYmplY3RLZXlzKG5hdGl2ZUFzc2lnbih7fSwgQikpLmpvaW4oJycpICE9IGFscGhhYmV0O1xufSkgPyBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2UpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICB2YXIgVCA9IHRvT2JqZWN0KHRhcmdldCk7XG4gIHZhciBhcmd1bWVudHNMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICB2YXIgaW5kZXggPSAxO1xuICB2YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlLmY7XG4gIHZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IHByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlLmY7XG4gIHdoaWxlIChhcmd1bWVudHNMZW5ndGggPiBpbmRleCkge1xuICAgIHZhciBTID0gSW5kZXhlZE9iamVjdChhcmd1bWVudHNbaW5kZXgrK10pO1xuICAgIHZhciBrZXlzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzID8gb2JqZWN0S2V5cyhTKS5jb25jYXQoZ2V0T3duUHJvcGVydHlTeW1ib2xzKFMpKSA6IG9iamVjdEtleXMoUyk7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciBqID0gMDtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChsZW5ndGggPiBqKSB7XG4gICAgICBrZXkgPSBrZXlzW2orK107XG4gICAgICBpZiAoIURFU0NSSVBUT1JTIHx8IHByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoUywga2V5KSkgVFtrZXldID0gU1trZXldO1xuICAgIH1cbiAgfSByZXR1cm4gVDtcbn0gOiBuYXRpdmVBc3NpZ247XG4iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBhc3NpZ24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWFzc2lnbicpO1xuXG4vLyBgT2JqZWN0LmFzc2lnbmAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuYXNzaWduXG4kKHsgdGFyZ2V0OiAnT2JqZWN0Jywgc3RhdDogdHJ1ZSwgZm9yY2VkOiBPYmplY3QuYXNzaWduICE9PSBhc3NpZ24gfSwge1xuICBhc3NpZ246IGFzc2lnblxufSk7XG4iLCJ2YXIgY2xhc3NvZlJhdyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgVE9fU1RSSU5HX1RBRyA9IHdlbGxLbm93blN5bWJvbCgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQ09SUkVDVF9BUkdVTUVOVFMgPSBjbGFzc29mUmF3KGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG4vLyBnZXR0aW5nIHRhZyBmcm9tIEVTNisgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgdGFnLCByZXN1bHQ7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mICh0YWcgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRPX1NUUklOR19UQUcpKSA9PSAnc3RyaW5nJyA/IHRhZ1xuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQ09SUkVDVF9BUkdVTUVOVFMgPyBjbGFzc29mUmF3KE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKHJlc3VsdCA9IGNsYXNzb2ZSYXcoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZicpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgVE9fU1RSSU5HX1RBRyA9IHdlbGxLbm93blN5bWJvbCgndG9TdHJpbmdUYWcnKTtcbnZhciB0ZXN0ID0ge307XG5cbnRlc3RbVE9fU1RSSU5HX1RBR10gPSAneic7XG5cbi8vIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYCBtZXRob2QgaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gU3RyaW5nKHRlc3QpICE9PSAnW29iamVjdCB6XScgPyBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdbb2JqZWN0ICcgKyBjbGFzc29mKHRoaXMpICsgJ10nO1xufSA6IHRlc3QudG9TdHJpbmc7XG4iLCJ2YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciB0b1N0cmluZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtdG8tc3RyaW5nJyk7XG5cbnZhciBPYmplY3RQcm90b3R5cGUgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vLyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nXG5pZiAodG9TdHJpbmcgIT09IE9iamVjdFByb3RvdHlwZS50b1N0cmluZykge1xuICByZWRlZmluZShPYmplY3RQcm90b3R5cGUsICd0b1N0cmluZycsIHRvU3RyaW5nLCB7IHVuc2FmZTogdHJ1ZSB9KTtcbn1cbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsLlByb21pc2U7XG4iLCJ2YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzcmMsIG9wdGlvbnMpIHtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgcmVkZWZpbmUodGFyZ2V0LCBrZXksIHNyY1trZXldLCBvcHRpb25zKTtcbiAgcmV0dXJuIHRhcmdldDtcbn07XG4iLCJ2YXIgZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpLmY7XG52YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgVE9fU1RSSU5HX1RBRyA9IHdlbGxLbm93blN5bWJvbCgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIFRBRywgU1RBVElDKSB7XG4gIGlmIChpdCAmJiAhaGFzKGl0ID0gU1RBVElDID8gaXQgOiBpdC5wcm90b3R5cGUsIFRPX1NUUklOR19UQUcpKSB7XG4gICAgZGVmaW5lUHJvcGVydHkoaXQsIFRPX1NUUklOR19UQUcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogVEFHIH0pO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG52YXIgZGVmaW5lUHJvcGVydHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG5cbnZhciBTUEVDSUVTID0gd2VsbEtub3duU3ltYm9sKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKENPTlNUUlVDVE9SX05BTUUpIHtcbiAgdmFyIENvbnN0cnVjdG9yID0gZ2V0QnVpbHRJbihDT05TVFJVQ1RPUl9OQU1FKTtcbiAgdmFyIGRlZmluZVByb3BlcnR5ID0gZGVmaW5lUHJvcGVydHlNb2R1bGUuZjtcblxuICBpZiAoREVTQ1JJUFRPUlMgJiYgQ29uc3RydWN0b3IgJiYgIUNvbnN0cnVjdG9yW1NQRUNJRVNdKSB7XG4gICAgZGVmaW5lUHJvcGVydHkoQ29uc3RydWN0b3IsIFNQRUNJRVMsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfVxuICAgIH0pO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIENvbnN0cnVjdG9yLCBuYW1lKSB7XG4gIGlmICghKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdJbmNvcnJlY3QgJyArIChuYW1lID8gbmFtZSArICcgJyA6ICcnKSArICdpbnZvY2F0aW9uJyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge307XG4iLCJ2YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycycpO1xuXG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG52YXIgQXJyYXlQcm90b3R5cGUgPSBBcnJheS5wcm90b3R5cGU7XG5cbi8vIGNoZWNrIG9uIGRlZmF1bHQgQXJyYXkgaXRlcmF0b3Jcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCAhPT0gdW5kZWZpbmVkICYmIChJdGVyYXRvcnMuQXJyYXkgPT09IGl0IHx8IEFycmF5UHJvdG90eXBlW0lURVJBVE9SXSA9PT0gaXQpO1xufTtcbiIsInZhciBjbGFzc29mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBJVEVSQVRPUiA9IHdlbGxLbm93blN5bWJvbCgnaXRlcmF0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ICE9IHVuZGVmaW5lZCkgcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcblxuLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgRU5UUklFUykge1xuICB0cnkge1xuICAgIHJldHVybiBFTlRSSUVTID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdmFyIHJldHVybk1ldGhvZCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZiAocmV0dXJuTWV0aG9kICE9PSB1bmRlZmluZWQpIGFuT2JqZWN0KHJldHVybk1ldGhvZC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgaXNBcnJheUl0ZXJhdG9yTWV0aG9kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLWFycmF5LWl0ZXJhdG9yLW1ldGhvZCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWxlbmd0aCcpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYmluZC1jb250ZXh0Jyk7XG52YXIgZ2V0SXRlcmF0b3JNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xudmFyIGNhbGxXaXRoU2FmZUl0ZXJhdGlvbkNsb3NpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2FsbC13aXRoLXNhZmUtaXRlcmF0aW9uLWNsb3NpbmcnKTtcblxudmFyIFJlc3VsdCA9IGZ1bmN0aW9uIChzdG9wcGVkLCByZXN1bHQpIHtcbiAgdGhpcy5zdG9wcGVkID0gc3RvcHBlZDtcbiAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG59O1xuXG52YXIgaXRlcmF0ZSA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZXJhYmxlLCBmbiwgdGhhdCwgQVNfRU5UUklFUywgSVNfSVRFUkFUT1IpIHtcbiAgdmFyIGJvdW5kRnVuY3Rpb24gPSBiaW5kKGZuLCB0aGF0LCBBU19FTlRSSUVTID8gMiA6IDEpO1xuICB2YXIgaXRlcmF0b3IsIGl0ZXJGbiwgaW5kZXgsIGxlbmd0aCwgcmVzdWx0LCBzdGVwO1xuXG4gIGlmIChJU19JVEVSQVRPUikge1xuICAgIGl0ZXJhdG9yID0gaXRlcmFibGU7XG4gIH0gZWxzZSB7XG4gICAgaXRlckZuID0gZ2V0SXRlcmF0b3JNZXRob2QoaXRlcmFibGUpO1xuICAgIGlmICh0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcignVGFyZ2V0IGlzIG5vdCBpdGVyYWJsZScpO1xuICAgIC8vIG9wdGltaXNhdGlvbiBmb3IgYXJyYXkgaXRlcmF0b3JzXG4gICAgaWYgKGlzQXJyYXlJdGVyYXRvck1ldGhvZChpdGVyRm4pKSB7XG4gICAgICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgcmVzdWx0ID0gQVNfRU5UUklFU1xuICAgICAgICAgID8gYm91bmRGdW5jdGlvbihhbk9iamVjdChzdGVwID0gaXRlcmFibGVbaW5kZXhdKVswXSwgc3RlcFsxXSlcbiAgICAgICAgICA6IGJvdW5kRnVuY3Rpb24oaXRlcmFibGVbaW5kZXhdKTtcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQgaW5zdGFuY2VvZiBSZXN1bHQpIHJldHVybiByZXN1bHQ7XG4gICAgICB9IHJldHVybiBuZXcgUmVzdWx0KGZhbHNlKTtcbiAgICB9XG4gICAgaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChpdGVyYWJsZSk7XG4gIH1cblxuICB3aGlsZSAoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKSB7XG4gICAgcmVzdWx0ID0gY2FsbFdpdGhTYWZlSXRlcmF0aW9uQ2xvc2luZyhpdGVyYXRvciwgYm91bmRGdW5jdGlvbiwgc3RlcC52YWx1ZSwgQVNfRU5UUklFUyk7XG4gICAgaWYgKHJlc3VsdCAmJiByZXN1bHQgaW5zdGFuY2VvZiBSZXN1bHQpIHJldHVybiByZXN1bHQ7XG4gIH0gcmV0dXJuIG5ldyBSZXN1bHQoZmFsc2UpO1xufTtcblxuaXRlcmF0ZS5zdG9wID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuICByZXR1cm4gbmV3IFJlc3VsdCh0cnVlLCByZXN1bHQpO1xufTtcbiIsInZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xudmFyIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgY2FsbGVkID0gMDtcbiAgdmFyIGl0ZXJhdG9yV2l0aFJldHVybiA9IHtcbiAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4geyBkb25lOiAhIWNhbGxlZCsrIH07XG4gICAgfSxcbiAgICAncmV0dXJuJzogZnVuY3Rpb24gKCkge1xuICAgICAgU0FGRV9DTE9TSU5HID0gdHJ1ZTtcbiAgICB9XG4gIH07XG4gIGl0ZXJhdG9yV2l0aFJldHVybltJVEVSQVRPUl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10aHJvdy1saXRlcmFsXG4gIEFycmF5LmZyb20oaXRlcmF0b3JXaXRoUmV0dXJuLCBmdW5jdGlvbiAoKSB7IHRocm93IDI7IH0pO1xufSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjLCBTS0lQX0NMT1NJTkcpIHtcbiAgaWYgKCFTS0lQX0NMT1NJTkcgJiYgIVNBRkVfQ0xPU0lORykgcmV0dXJuIGZhbHNlO1xuICB2YXIgSVRFUkFUSU9OX1NVUFBPUlQgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgb2JqZWN0ID0ge307XG4gICAgb2JqZWN0W0lURVJBVE9SXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4geyBkb25lOiBJVEVSQVRJT05fU1VQUE9SVCA9IHRydWUgfTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICAgIGV4ZWMob2JqZWN0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gSVRFUkFUSU9OX1NVUFBPUlQ7XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLWZ1bmN0aW9uJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBTUEVDSUVTID0gd2VsbEtub3duU3ltYm9sKCdzcGVjaWVzJyk7XG5cbi8vIGBTcGVjaWVzQ29uc3RydWN0b3JgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtc3BlY2llc2NvbnN0cnVjdG9yXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBkZWZhdWx0Q29uc3RydWN0b3IpIHtcbiAgdmFyIEMgPSBhbk9iamVjdChPKS5jb25zdHJ1Y3RvcjtcbiAgdmFyIFM7XG4gIHJldHVybiBDID09PSB1bmRlZmluZWQgfHwgKFMgPSBhbk9iamVjdChDKVtTUEVDSUVTXSkgPT0gdW5kZWZpbmVkID8gZGVmYXVsdENvbnN0cnVjdG9yIDogYUZ1bmN0aW9uKFMpO1xufTtcbiIsInZhciBnZXRCdWlsdEluID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dldC1idWlsdC1pbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEJ1aWx0SW4oJ2RvY3VtZW50JywgJ2RvY3VtZW50RWxlbWVudCcpO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2JpbmQtY29udGV4dCcpO1xudmFyIGh0bWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaHRtbCcpO1xudmFyIGNyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9jdW1lbnQtY3JlYXRlLWVsZW1lbnQnKTtcblxudmFyIGxvY2F0aW9uID0gZ2xvYmFsLmxvY2F0aW9uO1xudmFyIHNldCA9IGdsb2JhbC5zZXRJbW1lZGlhdGU7XG52YXIgY2xlYXIgPSBnbG9iYWwuY2xlYXJJbW1lZGlhdGU7XG52YXIgcHJvY2VzcyA9IGdsb2JhbC5wcm9jZXNzO1xudmFyIE1lc3NhZ2VDaGFubmVsID0gZ2xvYmFsLk1lc3NhZ2VDaGFubmVsO1xudmFyIERpc3BhdGNoID0gZ2xvYmFsLkRpc3BhdGNoO1xudmFyIGNvdW50ZXIgPSAwO1xudmFyIHF1ZXVlID0ge307XG52YXIgT05SRUFEWVNUQVRFQ0hBTkdFID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSc7XG52YXIgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XG5cbnZhciBydW4gPSBmdW5jdGlvbiAoaWQpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICBpZiAocXVldWUuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gICAgZm4oKTtcbiAgfVxufTtcblxudmFyIHJ1bm5lciA9IGZ1bmN0aW9uIChpZCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJ1bihpZCk7XG4gIH07XG59O1xuXG52YXIgbGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgcnVuKGV2ZW50LmRhdGEpO1xufTtcblxudmFyIHBvc3QgPSBmdW5jdGlvbiAoaWQpIHtcbiAgLy8gb2xkIGVuZ2luZXMgaGF2ZSBub3QgbG9jYXRpb24ub3JpZ2luXG4gIGdsb2JhbC5wb3N0TWVzc2FnZShpZCArICcnLCBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0KTtcbn07XG5cbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcbmlmICghc2V0IHx8ICFjbGVhcikge1xuICBzZXQgPSBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoZm4pIHtcbiAgICB2YXIgYXJncyA9IFtdO1xuICAgIHZhciBpID0gMTtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICAgICAgKHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nID8gZm4gOiBGdW5jdGlvbihmbikpLmFwcGx5KHVuZGVmaW5lZCwgYXJncyk7XG4gICAgfTtcbiAgICBkZWZlcihjb3VudGVyKTtcbiAgICByZXR1cm4gY291bnRlcjtcbiAgfTtcbiAgY2xlYXIgPSBmdW5jdGlvbiBjbGVhckltbWVkaWF0ZShpZCkge1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gIH07XG4gIC8vIE5vZGUuanMgMC44LVxuICBpZiAoY2xhc3NvZihwcm9jZXNzKSA9PSAncHJvY2VzcycpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhydW5uZXIoaWQpKTtcbiAgICB9O1xuICAvLyBTcGhlcmUgKEpTIGdhbWUgZW5naW5lKSBEaXNwYXRjaCBBUElcbiAgfSBlbHNlIGlmIChEaXNwYXRjaCAmJiBEaXNwYXRjaC5ub3cpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgRGlzcGF0Y2gubm93KHJ1bm5lcihpZCkpO1xuICAgIH07XG4gIC8vIEJyb3dzZXJzIHdpdGggTWVzc2FnZUNoYW5uZWwsIGluY2x1ZGVzIFdlYldvcmtlcnNcbiAgfSBlbHNlIGlmIChNZXNzYWdlQ2hhbm5lbCkge1xuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICBwb3J0ID0gY2hhbm5lbC5wb3J0MjtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpc3RlbmVyO1xuICAgIGRlZmVyID0gYmluZChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBwb3N0TWVzc2FnZSwgc2tpcCBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzICdvYmplY3QnXG4gIH0gZWxzZSBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgdHlwZW9mIHBvc3RNZXNzYWdlID09ICdmdW5jdGlvbicgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzICYmICFmYWlscyhwb3N0KSkge1xuICAgIGRlZmVyID0gcG9zdDtcbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyLCBmYWxzZSk7XG4gIC8vIElFOC1cbiAgfSBlbHNlIGlmIChPTlJFQURZU1RBVEVDSEFOR0UgaW4gY3JlYXRlRWxlbWVudCgnc2NyaXB0JykpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgaHRtbC5hcHBlbmRDaGlsZChjcmVhdGVFbGVtZW50KCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgcnVuKGlkKTtcbiAgICAgIH07XG4gICAgfTtcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcbiAgfSBlbHNlIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgc2V0VGltZW91dChydW5uZXIoaWQpLCAwKTtcbiAgICB9O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IHNldCxcbiAgY2xlYXI6IGNsZWFyXG59O1xuIiwidmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QnVpbHRJbignbmF2aWdhdG9yJywgJ3VzZXJBZ2VudCcpIHx8ICcnO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpLmY7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIG1hY3JvdGFzayA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90YXNrJykuc2V0O1xudmFyIHVzZXJBZ2VudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy91c2VyLWFnZW50Jyk7XG5cbnZhciBNdXRhdGlvbk9ic2VydmVyID0gZ2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgZ2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG52YXIgcHJvY2VzcyA9IGdsb2JhbC5wcm9jZXNzO1xudmFyIFByb21pc2UgPSBnbG9iYWwuUHJvbWlzZTtcbnZhciBJU19OT0RFID0gY2xhc3NvZihwcm9jZXNzKSA9PSAncHJvY2Vzcyc7XG4vLyBOb2RlLmpzIDExIHNob3dzIEV4cGVyaW1lbnRhbFdhcm5pbmcgb24gZ2V0dGluZyBgcXVldWVNaWNyb3Rhc2tgXG52YXIgcXVldWVNaWNyb3Rhc2tEZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGdsb2JhbCwgJ3F1ZXVlTWljcm90YXNrJyk7XG52YXIgcXVldWVNaWNyb3Rhc2sgPSBxdWV1ZU1pY3JvdGFza0Rlc2NyaXB0b3IgJiYgcXVldWVNaWNyb3Rhc2tEZXNjcmlwdG9yLnZhbHVlO1xuXG52YXIgZmx1c2gsIGhlYWQsIGxhc3QsIG5vdGlmeSwgdG9nZ2xlLCBub2RlLCBwcm9taXNlLCB0aGVuO1xuXG4vLyBtb2Rlcm4gZW5naW5lcyBoYXZlIHF1ZXVlTWljcm90YXNrIG1ldGhvZFxuaWYgKCFxdWV1ZU1pY3JvdGFzaykge1xuICBmbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGFyZW50LCBmbjtcbiAgICBpZiAoSVNfTk9ERSAmJiAocGFyZW50ID0gcHJvY2Vzcy5kb21haW4pKSBwYXJlbnQuZXhpdCgpO1xuICAgIHdoaWxlIChoZWFkKSB7XG4gICAgICBmbiA9IGhlYWQuZm47XG4gICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm4oKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChoZWFkKSBub3RpZnkoKTtcbiAgICAgICAgZWxzZSBsYXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9IGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHBhcmVudCkgcGFyZW50LmVudGVyKCk7XG4gIH07XG5cbiAgLy8gTm9kZS5qc1xuICBpZiAoSVNfTk9ERSkge1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG4gIC8vIGJyb3dzZXJzIHdpdGggTXV0YXRpb25PYnNlcnZlciwgZXhjZXB0IGlPUyAtIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8zMzlcbiAgfSBlbHNlIGlmIChNdXRhdGlvbk9ic2VydmVyICYmICEvKGlwaG9uZXxpcG9kfGlwYWQpLiphcHBsZXdlYmtpdC9pLnRlc3QodXNlckFnZW50KSkge1xuICAgIHRvZ2dsZSA9IHRydWU7XG4gICAgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBuZXcgTXV0YXRpb25PYnNlcnZlcihmbHVzaCkub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbmV3XG4gICAgbm90aWZ5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgbm9kZS5kYXRhID0gdG9nZ2xlID0gIXRvZ2dsZTtcbiAgICB9O1xuICAvLyBlbnZpcm9ubWVudHMgd2l0aCBtYXliZSBub24tY29tcGxldGVseSBjb3JyZWN0LCBidXQgZXhpc3RlbnQgUHJvbWlzZVxuICB9IGVsc2UgaWYgKFByb21pc2UgJiYgUHJvbWlzZS5yZXNvbHZlKSB7XG4gICAgLy8gUHJvbWlzZS5yZXNvbHZlIHdpdGhvdXQgYW4gYXJndW1lbnQgdGhyb3dzIGFuIGVycm9yIGluIExHIFdlYk9TIDJcbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgdGhlbiA9IHByb21pc2UudGhlbjtcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGVuLmNhbGwocHJvbWlzZSwgZmx1c2gpO1xuICAgIH07XG4gIC8vIGZvciBvdGhlciBlbnZpcm9ubWVudHMgLSBtYWNyb3Rhc2sgYmFzZWQgb246XG4gIC8vIC0gc2V0SW1tZWRpYXRlXG4gIC8vIC0gTWVzc2FnZUNoYW5uZWxcbiAgLy8gLSB3aW5kb3cucG9zdE1lc3NhZ1xuICAvLyAtIG9ucmVhZHlzdGF0ZWNoYW5nZVxuICAvLyAtIHNldFRpbWVvdXRcbiAgfSBlbHNlIHtcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgICBtYWNyb3Rhc2suY2FsbChnbG9iYWwsIGZsdXNoKTtcbiAgICB9O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcXVldWVNaWNyb3Rhc2sgfHwgZnVuY3Rpb24gKGZuKSB7XG4gIHZhciB0YXNrID0geyBmbjogZm4sIG5leHQ6IHVuZGVmaW5lZCB9O1xuICBpZiAobGFzdCkgbGFzdC5uZXh0ID0gdGFzaztcbiAgaWYgKCFoZWFkKSB7XG4gICAgaGVhZCA9IHRhc2s7XG4gICAgbm90aWZ5KCk7XG4gIH0gbGFzdCA9IHRhc2s7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLWZ1bmN0aW9uJyk7XG5cbnZhciBQcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uIChDKSB7XG4gIHZhciByZXNvbHZlLCByZWplY3Q7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBDKGZ1bmN0aW9uICgkJHJlc29sdmUsICQkcmVqZWN0KSB7XG4gICAgaWYgKHJlc29sdmUgIT09IHVuZGVmaW5lZCB8fCByZWplY3QgIT09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKCdCYWQgUHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIHJlc29sdmUgPSAkJHJlc29sdmU7XG4gICAgcmVqZWN0ID0gJCRyZWplY3Q7XG4gIH0pO1xuICB0aGlzLnJlc29sdmUgPSBhRnVuY3Rpb24ocmVzb2x2ZSk7XG4gIHRoaXMucmVqZWN0ID0gYUZ1bmN0aW9uKHJlamVjdCk7XG59O1xuXG4vLyAyNS40LjEuNSBOZXdQcm9taXNlQ2FwYWJpbGl0eShDKVxubW9kdWxlLmV4cG9ydHMuZiA9IGZ1bmN0aW9uIChDKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZUNhcGFiaWxpdHkoQyk7XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25ldy1wcm9taXNlLWNhcGFiaWxpdHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQywgeCkge1xuICBhbk9iamVjdChDKTtcbiAgaWYgKGlzT2JqZWN0KHgpICYmIHguY29uc3RydWN0b3IgPT09IEMpIHJldHVybiB4O1xuICB2YXIgcHJvbWlzZUNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eS5mKEMpO1xuICB2YXIgcmVzb2x2ZSA9IHByb21pc2VDYXBhYmlsaXR5LnJlc29sdmU7XG4gIHJlc29sdmUoeCk7XG4gIHJldHVybiBwcm9taXNlQ2FwYWJpbGl0eS5wcm9taXNlO1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgdmFyIGNvbnNvbGUgPSBnbG9iYWwuY29uc29sZTtcbiAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5lcnJvcikge1xuICAgIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBjb25zb2xlLmVycm9yKGEpIDogY29uc29sZS5lcnJvcihhLCBiKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4geyBlcnJvcjogZmFsc2UsIHZhbHVlOiBleGVjKCkgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4geyBlcnJvcjogdHJ1ZSwgdmFsdWU6IGVycm9yIH07XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBJU19QVVJFID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLXB1cmUnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgcGF0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wYXRoJyk7XG52YXIgTmF0aXZlUHJvbWlzZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtcHJvbWlzZS1jb25zdHJ1Y3RvcicpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgcmVkZWZpbmVBbGwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUtYWxsJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciBzZXRTcGVjaWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC1zcGVjaWVzJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2EtZnVuY3Rpb24nKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLWluc3RhbmNlJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIGl0ZXJhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0ZScpO1xudmFyIGNoZWNrQ29ycmVjdG5lc3NPZkl0ZXJhdGlvbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jaGVjay1jb3JyZWN0bmVzcy1vZi1pdGVyYXRpb24nKTtcbnZhciBzcGVjaWVzQ29uc3RydWN0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc3BlY2llcy1jb25zdHJ1Y3RvcicpO1xudmFyIHRhc2sgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdGFzaycpLnNldDtcbnZhciBtaWNyb3Rhc2sgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbWljcm90YXNrJyk7XG52YXIgcHJvbWlzZVJlc29sdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcHJvbWlzZS1yZXNvbHZlJyk7XG52YXIgaG9zdFJlcG9ydEVycm9ycyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9ob3N0LXJlcG9ydC1lcnJvcnMnKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uZXctcHJvbWlzZS1jYXBhYmlsaXR5Jyk7XG52YXIgcGVyZm9ybSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wZXJmb3JtJyk7XG52YXIgdXNlckFnZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3VzZXItYWdlbnQnKTtcbnZhciBJbnRlcm5hbFN0YXRlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlJyk7XG52YXIgaXNGb3JjZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtZm9yY2VkJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBTUEVDSUVTID0gd2VsbEtub3duU3ltYm9sKCdzcGVjaWVzJyk7XG52YXIgUFJPTUlTRSA9ICdQcm9taXNlJztcbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXQ7XG52YXIgc2V0SW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuc2V0O1xudmFyIGdldEludGVybmFsUHJvbWlzZVN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXR0ZXJGb3IoUFJPTUlTRSk7XG52YXIgUHJvbWlzZUNvbnN0cnVjdG9yID0gTmF0aXZlUHJvbWlzZTtcbnZhciBUeXBlRXJyb3IgPSBnbG9iYWwuVHlwZUVycm9yO1xudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciAkZmV0Y2ggPSBnbG9iYWwuZmV0Y2g7XG52YXIgdmVyc2lvbnMgPSBwcm9jZXNzICYmIHByb2Nlc3MudmVyc2lvbnM7XG52YXIgdjggPSB2ZXJzaW9ucyAmJiB2ZXJzaW9ucy52OCB8fCAnJztcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlLmY7XG52YXIgbmV3R2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHk7XG52YXIgSVNfTk9ERSA9IGNsYXNzb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnO1xudmFyIERJU1BBVENIX0VWRU5UID0gISEoZG9jdW1lbnQgJiYgZG9jdW1lbnQuY3JlYXRlRXZlbnQgJiYgZ2xvYmFsLmRpc3BhdGNoRXZlbnQpO1xudmFyIFVOSEFORExFRF9SRUpFQ1RJT04gPSAndW5oYW5kbGVkcmVqZWN0aW9uJztcbnZhciBSRUpFQ1RJT05fSEFORExFRCA9ICdyZWplY3Rpb25oYW5kbGVkJztcbnZhciBQRU5ESU5HID0gMDtcbnZhciBGVUxGSUxMRUQgPSAxO1xudmFyIFJFSkVDVEVEID0gMjtcbnZhciBIQU5ETEVEID0gMTtcbnZhciBVTkhBTkRMRUQgPSAyO1xudmFyIEludGVybmFsLCBPd25Qcm9taXNlQ2FwYWJpbGl0eSwgUHJvbWlzZVdyYXBwZXIsIG5hdGl2ZVRoZW47XG5cbnZhciBGT1JDRUQgPSBpc0ZvcmNlZChQUk9NSVNFLCBmdW5jdGlvbiAoKSB7XG4gIC8vIGNvcnJlY3Qgc3ViY2xhc3Npbmcgd2l0aCBAQHNwZWNpZXMgc3VwcG9ydFxuICB2YXIgcHJvbWlzZSA9IFByb21pc2VDb25zdHJ1Y3Rvci5yZXNvbHZlKDEpO1xuICB2YXIgZW1wdHkgPSBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH07XG4gIHZhciBGYWtlUHJvbWlzZSA9IChwcm9taXNlLmNvbnN0cnVjdG9yID0ge30pW1NQRUNJRVNdID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgICBleGVjKGVtcHR5LCBlbXB0eSk7XG4gIH07XG4gIC8vIHVuaGFuZGxlZCByZWplY3Rpb25zIHRyYWNraW5nIHN1cHBvcnQsIE5vZGVKUyBQcm9taXNlIHdpdGhvdXQgaXQgZmFpbHMgQEBzcGVjaWVzIHRlc3RcbiAgcmV0dXJuICEoKElTX05PREUgfHwgdHlwZW9mIFByb21pc2VSZWplY3Rpb25FdmVudCA9PSAnZnVuY3Rpb24nKVxuICAgICYmICghSVNfUFVSRSB8fCBwcm9taXNlWydmaW5hbGx5J10pXG4gICAgJiYgcHJvbWlzZS50aGVuKGVtcHR5KSBpbnN0YW5jZW9mIEZha2VQcm9taXNlXG4gICAgLy8gdjggNi42IChOb2RlIDEwIGFuZCBDaHJvbWUgNjYpIGhhdmUgYSBidWcgd2l0aCByZXNvbHZpbmcgY3VzdG9tIHRoZW5hYmxlc1xuICAgIC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTgzMDU2NVxuICAgIC8vIHdlIGNhbid0IGRldGVjdCBpdCBzeW5jaHJvbm91c2x5LCBzbyBqdXN0IGNoZWNrIHZlcnNpb25zXG4gICAgJiYgdjguaW5kZXhPZignNi42JykgIT09IDBcbiAgICAmJiB1c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lLzY2JykgPT09IC0xKTtcbn0pO1xuXG52YXIgSU5DT1JSRUNUX0lURVJBVElPTiA9IEZPUkNFRCB8fCAhY2hlY2tDb3JyZWN0bmVzc09mSXRlcmF0aW9uKGZ1bmN0aW9uIChpdGVyYWJsZSkge1xuICBQcm9taXNlQ29uc3RydWN0b3IuYWxsKGl0ZXJhYmxlKVsnY2F0Y2gnXShmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH0pO1xufSk7XG5cbi8vIGhlbHBlcnNcbnZhciBpc1RoZW5hYmxlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciB0aGVuO1xuICByZXR1cm4gaXNPYmplY3QoaXQpICYmIHR5cGVvZiAodGhlbiA9IGl0LnRoZW4pID09ICdmdW5jdGlvbicgPyB0aGVuIDogZmFsc2U7XG59O1xuXG52YXIgbm90aWZ5ID0gZnVuY3Rpb24gKHByb21pc2UsIHN0YXRlLCBpc1JlamVjdCkge1xuICBpZiAoc3RhdGUubm90aWZpZWQpIHJldHVybjtcbiAgc3RhdGUubm90aWZpZWQgPSB0cnVlO1xuICB2YXIgY2hhaW4gPSBzdGF0ZS5yZWFjdGlvbnM7XG4gIG1pY3JvdGFzayhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gc3RhdGUudmFsdWU7XG4gICAgdmFyIG9rID0gc3RhdGUuc3RhdGUgPT0gRlVMRklMTEVEO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgLy8gdmFyaWFibGUgbGVuZ3RoIC0gY2FuJ3QgdXNlIGZvckVhY2hcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhciByZWFjdGlvbiA9IGNoYWluW2luZGV4KytdO1xuICAgICAgdmFyIGhhbmRsZXIgPSBvayA/IHJlYWN0aW9uLm9rIDogcmVhY3Rpb24uZmFpbDtcbiAgICAgIHZhciByZXNvbHZlID0gcmVhY3Rpb24ucmVzb2x2ZTtcbiAgICAgIHZhciByZWplY3QgPSByZWFjdGlvbi5yZWplY3Q7XG4gICAgICB2YXIgZG9tYWluID0gcmVhY3Rpb24uZG9tYWluO1xuICAgICAgdmFyIHJlc3VsdCwgdGhlbiwgZXhpdGVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgICBpZiAoIW9rKSB7XG4gICAgICAgICAgICBpZiAoc3RhdGUucmVqZWN0aW9uID09PSBVTkhBTkRMRUQpIG9uSGFuZGxlVW5oYW5kbGVkKHByb21pc2UsIHN0YXRlKTtcbiAgICAgICAgICAgIHN0YXRlLnJlamVjdGlvbiA9IEhBTkRMRUQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYW5kbGVyID09PSB0cnVlKSByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkb21haW4pIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgcmVzdWx0ID0gaGFuZGxlcih2YWx1ZSk7IC8vIGNhbiB0aHJvd1xuICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICBkb21haW4uZXhpdCgpO1xuICAgICAgICAgICAgICBleGl0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmVzdWx0ID09PSByZWFjdGlvbi5wcm9taXNlKSB7XG4gICAgICAgICAgICByZWplY3QoVHlwZUVycm9yKCdQcm9taXNlLWNoYWluIGN5Y2xlJykpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhlbiA9IGlzVGhlbmFibGUocmVzdWx0KSkge1xuICAgICAgICAgICAgdGhlbi5jYWxsKHJlc3VsdCwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9IGVsc2UgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgcmVqZWN0KHZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChkb21haW4gJiYgIWV4aXRlZCkgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc3RhdGUucmVhY3Rpb25zID0gW107XG4gICAgc3RhdGUubm90aWZpZWQgPSBmYWxzZTtcbiAgICBpZiAoaXNSZWplY3QgJiYgIXN0YXRlLnJlamVjdGlvbikgb25VbmhhbmRsZWQocHJvbWlzZSwgc3RhdGUpO1xuICB9KTtcbn07XG5cbnZhciBkaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24gKG5hbWUsIHByb21pc2UsIHJlYXNvbikge1xuICB2YXIgZXZlbnQsIGhhbmRsZXI7XG4gIGlmIChESVNQQVRDSF9FVkVOVCkge1xuICAgIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZXZlbnQucHJvbWlzZSA9IHByb21pc2U7XG4gICAgZXZlbnQucmVhc29uID0gcmVhc29uO1xuICAgIGV2ZW50LmluaXRFdmVudChuYW1lLCBmYWxzZSwgdHJ1ZSk7XG4gICAgZ2xvYmFsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICB9IGVsc2UgZXZlbnQgPSB7IHByb21pc2U6IHByb21pc2UsIHJlYXNvbjogcmVhc29uIH07XG4gIGlmIChoYW5kbGVyID0gZ2xvYmFsWydvbicgKyBuYW1lXSkgaGFuZGxlcihldmVudCk7XG4gIGVsc2UgaWYgKG5hbWUgPT09IFVOSEFORExFRF9SRUpFQ1RJT04pIGhvc3RSZXBvcnRFcnJvcnMoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHJlYXNvbik7XG59O1xuXG52YXIgb25VbmhhbmRsZWQgPSBmdW5jdGlvbiAocHJvbWlzZSwgc3RhdGUpIHtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24gKCkge1xuICAgIHZhciB2YWx1ZSA9IHN0YXRlLnZhbHVlO1xuICAgIHZhciBJU19VTkhBTkRMRUQgPSBpc1VuaGFuZGxlZChzdGF0ZSk7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAoSVNfVU5IQU5ETEVEKSB7XG4gICAgICByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKElTX05PREUpIHtcbiAgICAgICAgICBwcm9jZXNzLmVtaXQoJ3VuaGFuZGxlZFJlamVjdGlvbicsIHZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgfSBlbHNlIGRpc3BhdGNoRXZlbnQoVU5IQU5ETEVEX1JFSkVDVElPTiwgcHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgICAvLyBCcm93c2VycyBzaG91bGQgbm90IHRyaWdnZXIgYHJlamVjdGlvbkhhbmRsZWRgIGV2ZW50IGlmIGl0IHdhcyBoYW5kbGVkIGhlcmUsIE5vZGVKUyAtIHNob3VsZFxuICAgICAgc3RhdGUucmVqZWN0aW9uID0gSVNfTk9ERSB8fCBpc1VuaGFuZGxlZChzdGF0ZSkgPyBVTkhBTkRMRUQgOiBIQU5ETEVEO1xuICAgICAgaWYgKHJlc3VsdC5lcnJvcikgdGhyb3cgcmVzdWx0LnZhbHVlO1xuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgaXNVbmhhbmRsZWQgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlLnJlamVjdGlvbiAhPT0gSEFORExFRCAmJiAhc3RhdGUucGFyZW50O1xufTtcblxudmFyIG9uSGFuZGxlVW5oYW5kbGVkID0gZnVuY3Rpb24gKHByb21pc2UsIHN0YXRlKSB7XG4gIHRhc2suY2FsbChnbG9iYWwsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoSVNfTk9ERSkge1xuICAgICAgcHJvY2Vzcy5lbWl0KCdyZWplY3Rpb25IYW5kbGVkJywgcHJvbWlzZSk7XG4gICAgfSBlbHNlIGRpc3BhdGNoRXZlbnQoUkVKRUNUSU9OX0hBTkRMRUQsIHByb21pc2UsIHN0YXRlLnZhbHVlKTtcbiAgfSk7XG59O1xuXG52YXIgYmluZCA9IGZ1bmN0aW9uIChmbiwgcHJvbWlzZSwgc3RhdGUsIHVud3JhcCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgZm4ocHJvbWlzZSwgc3RhdGUsIHZhbHVlLCB1bndyYXApO1xuICB9O1xufTtcblxudmFyIGludGVybmFsUmVqZWN0ID0gZnVuY3Rpb24gKHByb21pc2UsIHN0YXRlLCB2YWx1ZSwgdW53cmFwKSB7XG4gIGlmIChzdGF0ZS5kb25lKSByZXR1cm47XG4gIHN0YXRlLmRvbmUgPSB0cnVlO1xuICBpZiAodW53cmFwKSBzdGF0ZSA9IHVud3JhcDtcbiAgc3RhdGUudmFsdWUgPSB2YWx1ZTtcbiAgc3RhdGUuc3RhdGUgPSBSRUpFQ1RFRDtcbiAgbm90aWZ5KHByb21pc2UsIHN0YXRlLCB0cnVlKTtcbn07XG5cbnZhciBpbnRlcm5hbFJlc29sdmUgPSBmdW5jdGlvbiAocHJvbWlzZSwgc3RhdGUsIHZhbHVlLCB1bndyYXApIHtcbiAgaWYgKHN0YXRlLmRvbmUpIHJldHVybjtcbiAgc3RhdGUuZG9uZSA9IHRydWU7XG4gIGlmICh1bndyYXApIHN0YXRlID0gdW53cmFwO1xuICB0cnkge1xuICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkgdGhyb3cgVHlwZUVycm9yKFwiUHJvbWlzZSBjYW4ndCBiZSByZXNvbHZlZCBpdHNlbGZcIik7XG4gICAgdmFyIHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKTtcbiAgICBpZiAodGhlbikge1xuICAgICAgbWljcm90YXNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHdyYXBwZXIgPSB7IGRvbmU6IGZhbHNlIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhlbi5jYWxsKHZhbHVlLFxuICAgICAgICAgICAgYmluZChpbnRlcm5hbFJlc29sdmUsIHByb21pc2UsIHdyYXBwZXIsIHN0YXRlKSxcbiAgICAgICAgICAgIGJpbmQoaW50ZXJuYWxSZWplY3QsIHByb21pc2UsIHdyYXBwZXIsIHN0YXRlKVxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaW50ZXJuYWxSZWplY3QocHJvbWlzZSwgd3JhcHBlciwgZXJyb3IsIHN0YXRlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLnZhbHVlID0gdmFsdWU7XG4gICAgICBzdGF0ZS5zdGF0ZSA9IEZVTEZJTExFRDtcbiAgICAgIG5vdGlmeShwcm9taXNlLCBzdGF0ZSwgZmFsc2UpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpbnRlcm5hbFJlamVjdChwcm9taXNlLCB7IGRvbmU6IGZhbHNlIH0sIGVycm9yLCBzdGF0ZSk7XG4gIH1cbn07XG5cbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXG5pZiAoRk9SQ0VEKSB7XG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXG4gIFByb21pc2VDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3IpIHtcbiAgICBhbkluc3RhbmNlKHRoaXMsIFByb21pc2VDb25zdHJ1Y3RvciwgUFJPTUlTRSk7XG4gICAgYUZ1bmN0aW9uKGV4ZWN1dG9yKTtcbiAgICBJbnRlcm5hbC5jYWxsKHRoaXMpO1xuICAgIHZhciBzdGF0ZSA9IGdldEludGVybmFsU3RhdGUodGhpcyk7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWN1dG9yKGJpbmQoaW50ZXJuYWxSZXNvbHZlLCB0aGlzLCBzdGF0ZSksIGJpbmQoaW50ZXJuYWxSZWplY3QsIHRoaXMsIHN0YXRlKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGludGVybmFsUmVqZWN0KHRoaXMsIHN0YXRlLCBlcnJvcik7XG4gICAgfVxuICB9O1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgSW50ZXJuYWwgPSBmdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKSB7XG4gICAgc2V0SW50ZXJuYWxTdGF0ZSh0aGlzLCB7XG4gICAgICB0eXBlOiBQUk9NSVNFLFxuICAgICAgZG9uZTogZmFsc2UsXG4gICAgICBub3RpZmllZDogZmFsc2UsXG4gICAgICBwYXJlbnQ6IGZhbHNlLFxuICAgICAgcmVhY3Rpb25zOiBbXSxcbiAgICAgIHJlamVjdGlvbjogZmFsc2UsXG4gICAgICBzdGF0ZTogUEVORElORyxcbiAgICAgIHZhbHVlOiB1bmRlZmluZWRcbiAgICB9KTtcbiAgfTtcbiAgSW50ZXJuYWwucHJvdG90eXBlID0gcmVkZWZpbmVBbGwoUHJvbWlzZUNvbnN0cnVjdG9yLnByb3RvdHlwZSwge1xuICAgIC8vIGBQcm9taXNlLnByb3RvdHlwZS50aGVuYCBtZXRob2RcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1wcm9taXNlLnByb3RvdHlwZS50aGVuXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgICAgdmFyIHN0YXRlID0gZ2V0SW50ZXJuYWxQcm9taXNlU3RhdGUodGhpcyk7XG4gICAgICB2YXIgcmVhY3Rpb24gPSBuZXdQcm9taXNlQ2FwYWJpbGl0eShzcGVjaWVzQ29uc3RydWN0b3IodGhpcywgUHJvbWlzZUNvbnN0cnVjdG9yKSk7XG4gICAgICByZWFjdGlvbi5vayA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiB0cnVlO1xuICAgICAgcmVhY3Rpb24uZmFpbCA9IHR5cGVvZiBvblJlamVjdGVkID09ICdmdW5jdGlvbicgJiYgb25SZWplY3RlZDtcbiAgICAgIHJlYWN0aW9uLmRvbWFpbiA9IElTX05PREUgPyBwcm9jZXNzLmRvbWFpbiA6IHVuZGVmaW5lZDtcbiAgICAgIHN0YXRlLnBhcmVudCA9IHRydWU7XG4gICAgICBzdGF0ZS5yZWFjdGlvbnMucHVzaChyZWFjdGlvbik7XG4gICAgICBpZiAoc3RhdGUuc3RhdGUgIT0gUEVORElORykgbm90aWZ5KHRoaXMsIHN0YXRlLCBmYWxzZSk7XG4gICAgICByZXR1cm4gcmVhY3Rpb24ucHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIGBQcm9taXNlLnByb3RvdHlwZS5jYXRjaGAgbWV0aG9kXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcHJvbWlzZS5wcm90b3R5cGUuY2F0Y2hcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xuICAgIH1cbiAgfSk7XG4gIE93blByb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwcm9taXNlID0gbmV3IEludGVybmFsKCk7XG4gICAgdmFyIHN0YXRlID0gZ2V0SW50ZXJuYWxTdGF0ZShwcm9taXNlKTtcbiAgICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xuICAgIHRoaXMucmVzb2x2ZSA9IGJpbmQoaW50ZXJuYWxSZXNvbHZlLCBwcm9taXNlLCBzdGF0ZSk7XG4gICAgdGhpcy5yZWplY3QgPSBiaW5kKGludGVybmFsUmVqZWN0LCBwcm9taXNlLCBzdGF0ZSk7XG4gIH07XG4gIG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlLmYgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uIChDKSB7XG4gICAgcmV0dXJuIEMgPT09IFByb21pc2VDb25zdHJ1Y3RvciB8fCBDID09PSBQcm9taXNlV3JhcHBlclxuICAgICAgPyBuZXcgT3duUHJvbWlzZUNhcGFiaWxpdHkoQylcbiAgICAgIDogbmV3R2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5KEMpO1xuICB9O1xuXG4gIGlmICghSVNfUFVSRSAmJiB0eXBlb2YgTmF0aXZlUHJvbWlzZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgbmF0aXZlVGhlbiA9IE5hdGl2ZVByb21pc2UucHJvdG90eXBlLnRoZW47XG5cbiAgICAvLyB3cmFwIG5hdGl2ZSBQcm9taXNlI3RoZW4gZm9yIG5hdGl2ZSBhc3luYyBmdW5jdGlvbnNcbiAgICByZWRlZmluZShOYXRpdmVQcm9taXNlLnByb3RvdHlwZSwgJ3RoZW4nLCBmdW5jdGlvbiB0aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2VDb25zdHJ1Y3RvcihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIG5hdGl2ZVRoZW4uY2FsbCh0aGF0LCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSkudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCk7XG4gICAgfSk7XG5cbiAgICAvLyB3cmFwIGZldGNoIHJlc3VsdFxuICAgIGlmICh0eXBlb2YgJGZldGNoID09ICdmdW5jdGlvbicpICQoeyBnbG9iYWw6IHRydWUsIGVudW1lcmFibGU6IHRydWUsIGZvcmNlZDogdHJ1ZSB9LCB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICAgIGZldGNoOiBmdW5jdGlvbiBmZXRjaChpbnB1dCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoUHJvbWlzZUNvbnN0cnVjdG9yLCAkZmV0Y2guYXBwbHkoZ2xvYmFsLCBhcmd1bWVudHMpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4kKHsgZ2xvYmFsOiB0cnVlLCB3cmFwOiB0cnVlLCBmb3JjZWQ6IEZPUkNFRCB9LCB7XG4gIFByb21pc2U6IFByb21pc2VDb25zdHJ1Y3RvclxufSk7XG5cbnNldFRvU3RyaW5nVGFnKFByb21pc2VDb25zdHJ1Y3RvciwgUFJPTUlTRSwgZmFsc2UsIHRydWUpO1xuc2V0U3BlY2llcyhQUk9NSVNFKTtcblxuUHJvbWlzZVdyYXBwZXIgPSBwYXRoW1BST01JU0VdO1xuXG4vLyBzdGF0aWNzXG4kKHsgdGFyZ2V0OiBQUk9NSVNFLCBzdGF0OiB0cnVlLCBmb3JjZWQ6IEZPUkNFRCB9LCB7XG4gIC8vIGBQcm9taXNlLnJlamVjdGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXByb21pc2UucmVqZWN0XG4gIHJlamVjdDogZnVuY3Rpb24gcmVqZWN0KHIpIHtcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KHRoaXMpO1xuICAgIGNhcGFiaWxpdHkucmVqZWN0LmNhbGwodW5kZWZpbmVkLCByKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcblxuJCh7IHRhcmdldDogUFJPTUlTRSwgc3RhdDogdHJ1ZSwgZm9yY2VkOiBJU19QVVJFIHx8IEZPUkNFRCB9LCB7XG4gIC8vIGBQcm9taXNlLnJlc29sdmVgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1wcm9taXNlLnJlc29sdmVcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSh4KSB7XG4gICAgcmV0dXJuIHByb21pc2VSZXNvbHZlKElTX1BVUkUgJiYgdGhpcyA9PT0gUHJvbWlzZVdyYXBwZXIgPyBQcm9taXNlQ29uc3RydWN0b3IgOiB0aGlzLCB4KTtcbiAgfVxufSk7XG5cbiQoeyB0YXJnZXQ6IFBST01JU0UsIHN0YXQ6IHRydWUsIGZvcmNlZDogSU5DT1JSRUNUX0lURVJBVElPTiB9LCB7XG4gIC8vIGBQcm9taXNlLmFsbGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXByb21pc2UuYWxsXG4gIGFsbDogZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKSB7XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkcHJvbWlzZVJlc29sdmUgPSBhRnVuY3Rpb24oQy5yZXNvbHZlKTtcbiAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgIHZhciByZW1haW5pbmcgPSAxO1xuICAgICAgaXRlcmF0ZShpdGVyYWJsZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gY291bnRlcisrO1xuICAgICAgICB2YXIgYWxyZWFkeUNhbGxlZCA9IGZhbHNlO1xuICAgICAgICB2YWx1ZXMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICByZW1haW5pbmcrKztcbiAgICAgICAgJHByb21pc2VSZXNvbHZlLmNhbGwoQywgcHJvbWlzZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAoYWxyZWFkeUNhbGxlZCkgcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9KTtcbiAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSByZWplY3QocmVzdWx0LnZhbHVlKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9LFxuICAvLyBgUHJvbWlzZS5yYWNlYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcHJvbWlzZS5yYWNlXG4gIHJhY2U6IGZ1bmN0aW9uIHJhY2UoaXRlcmFibGUpIHtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eShDKTtcbiAgICB2YXIgcmVqZWN0ID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIHJlc3VsdCA9IHBlcmZvcm0oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRwcm9taXNlUmVzb2x2ZSA9IGFGdW5jdGlvbihDLnJlc29sdmUpO1xuICAgICAgaXRlcmF0ZShpdGVyYWJsZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgJHByb21pc2VSZXNvbHZlLmNhbGwoQywgcHJvbWlzZSkudGhlbihjYXBhYmlsaXR5LnJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSByZWplY3QocmVzdWx0LnZhbHVlKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xudmFyIE5hdGl2ZVByb21pc2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXByb21pc2UtY29uc3RydWN0b3InKTtcbnZhciBnZXRCdWlsdEluID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dldC1idWlsdC1pbicpO1xudmFyIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zcGVjaWVzLWNvbnN0cnVjdG9yJyk7XG52YXIgcHJvbWlzZVJlc29sdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcHJvbWlzZS1yZXNvbHZlJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcblxuLy8gYFByb21pc2UucHJvdG90eXBlLmZpbmFsbHlgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcHJvbWlzZS5wcm90b3R5cGUuZmluYWxseVxuJCh7IHRhcmdldDogJ1Byb21pc2UnLCBwcm90bzogdHJ1ZSwgcmVhbDogdHJ1ZSB9LCB7XG4gICdmaW5hbGx5JzogZnVuY3Rpb24gKG9uRmluYWxseSkge1xuICAgIHZhciBDID0gc3BlY2llc0NvbnN0cnVjdG9yKHRoaXMsIGdldEJ1aWx0SW4oJ1Byb21pc2UnKSk7XG4gICAgdmFyIGlzRnVuY3Rpb24gPSB0eXBlb2Ygb25GaW5hbGx5ID09ICdmdW5jdGlvbic7XG4gICAgcmV0dXJuIHRoaXMudGhlbihcbiAgICAgIGlzRnVuY3Rpb24gPyBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoQywgb25GaW5hbGx5KCkpLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4geDsgfSk7XG4gICAgICB9IDogb25GaW5hbGx5LFxuICAgICAgaXNGdW5jdGlvbiA/IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZShDLCBvbkZpbmFsbHkoKSkudGhlbihmdW5jdGlvbiAoKSB7IHRocm93IGU7IH0pO1xuICAgICAgfSA6IG9uRmluYWxseVxuICAgICk7XG4gIH1cbn0pO1xuXG4vLyBwYXRjaCBuYXRpdmUgUHJvbWlzZS5wcm90b3R5cGUgZm9yIG5hdGl2ZSBhc3luYyBmdW5jdGlvbnNcbmlmICghSVNfUFVSRSAmJiB0eXBlb2YgTmF0aXZlUHJvbWlzZSA9PSAnZnVuY3Rpb24nICYmICFOYXRpdmVQcm9taXNlLnByb3RvdHlwZVsnZmluYWxseSddKSB7XG4gIHJlZGVmaW5lKE5hdGl2ZVByb21pc2UucHJvdG90eXBlLCAnZmluYWxseScsIGdldEJ1aWx0SW4oJ1Byb21pc2UnKS5wcm90b3R5cGVbJ2ZpbmFsbHknXSk7XG59XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcbnZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xuXG4vLyBgU3RyaW5nLnByb3RvdHlwZS57IGNvZGVQb2ludEF0LCBhdCB9YCBtZXRob2RzIGltcGxlbWVudGF0aW9uXG52YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24gKENPTlZFUlRfVE9fU1RSSU5HKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIHBvcykge1xuICAgIHZhciBTID0gU3RyaW5nKHJlcXVpcmVPYmplY3RDb2VyY2libGUoJHRoaXMpKTtcbiAgICB2YXIgcG9zaXRpb24gPSB0b0ludGVnZXIocG9zKTtcbiAgICB2YXIgc2l6ZSA9IFMubGVuZ3RoO1xuICAgIHZhciBmaXJzdCwgc2Vjb25kO1xuICAgIGlmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gc2l6ZSkgcmV0dXJuIENPTlZFUlRfVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgZmlyc3QgPSBTLmNoYXJDb2RlQXQocG9zaXRpb24pO1xuICAgIHJldHVybiBmaXJzdCA8IDB4RDgwMCB8fCBmaXJzdCA+IDB4REJGRiB8fCBwb3NpdGlvbiArIDEgPT09IHNpemVcbiAgICAgIHx8IChzZWNvbmQgPSBTLmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKSkgPCAweERDMDAgfHwgc2Vjb25kID4gMHhERkZGXG4gICAgICAgID8gQ09OVkVSVF9UT19TVFJJTkcgPyBTLmNoYXJBdChwb3NpdGlvbikgOiBmaXJzdFxuICAgICAgICA6IENPTlZFUlRfVE9fU1RSSU5HID8gUy5zbGljZShwb3NpdGlvbiwgcG9zaXRpb24gKyAyKSA6IChmaXJzdCAtIDB4RDgwMCA8PCAxMCkgKyAoc2Vjb25kIC0gMHhEQzAwKSArIDB4MTAwMDA7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gYFN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXRgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLmNvZGVwb2ludGF0XG4gIGNvZGVBdDogY3JlYXRlTWV0aG9kKGZhbHNlKSxcbiAgLy8gYFN0cmluZy5wcm90b3R5cGUuYXRgIG1ldGhvZFxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLmF0XG4gIGNoYXJBdDogY3JlYXRlTWV0aG9kKHRydWUpXG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRigpIHsgLyogZW1wdHkgKi8gfVxuICBGLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IG51bGw7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YobmV3IEYoKSkgIT09IEYucHJvdG90eXBlO1xufSk7XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLW9iamVjdCcpO1xudmFyIHNoYXJlZEtleSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQta2V5Jyk7XG52YXIgQ09SUkVDVF9QUk9UT1RZUEVfR0VUVEVSID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NvcnJlY3QtcHJvdG90eXBlLWdldHRlcicpO1xuXG52YXIgSUVfUFJPVE8gPSBzaGFyZWRLZXkoJ0lFX1BST1RPJyk7XG52YXIgT2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLy8gYE9iamVjdC5nZXRQcm90b3R5cGVPZmAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuZ2V0cHJvdG90eXBlb2Zcbm1vZHVsZS5leHBvcnRzID0gQ09SUkVDVF9QUk9UT1RZUEVfR0VUVEVSID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gKE8pIHtcbiAgTyA9IHRvT2JqZWN0KE8pO1xuICBpZiAoaGFzKE8sIElFX1BST1RPKSkgcmV0dXJuIE9bSUVfUFJPVE9dO1xuICBpZiAodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvdHlwZSA6IG51bGw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xuXG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG52YXIgQlVHR1lfU0FGQVJJX0lURVJBVE9SUyA9IGZhbHNlO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG5cbi8vIGAlSXRlcmF0b3JQcm90b3R5cGUlYCBvYmplY3Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLSVpdGVyYXRvcnByb3RvdHlwZSUtb2JqZWN0XG52YXIgSXRlcmF0b3JQcm90b3R5cGUsIFByb3RvdHlwZU9mQXJyYXlJdGVyYXRvclByb3RvdHlwZSwgYXJyYXlJdGVyYXRvcjtcblxuaWYgKFtdLmtleXMpIHtcbiAgYXJyYXlJdGVyYXRvciA9IFtdLmtleXMoKTtcbiAgLy8gU2FmYXJpIDggaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gIGlmICghKCduZXh0JyBpbiBhcnJheUl0ZXJhdG9yKSkgQlVHR1lfU0FGQVJJX0lURVJBVE9SUyA9IHRydWU7XG4gIGVsc2Uge1xuICAgIFByb3RvdHlwZU9mQXJyYXlJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvdHlwZU9mKGdldFByb3RvdHlwZU9mKGFycmF5SXRlcmF0b3IpKTtcbiAgICBpZiAoUHJvdG90eXBlT2ZBcnJheUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlKSBJdGVyYXRvclByb3RvdHlwZSA9IFByb3RvdHlwZU9mQXJyYXlJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxufVxuXG5pZiAoSXRlcmF0b3JQcm90b3R5cGUgPT0gdW5kZWZpbmVkKSBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxuaWYgKCFJU19QVVJFICYmICFoYXMoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SKSkgaGlkZShJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IsIHJldHVyblRoaXMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgSXRlcmF0b3JQcm90b3R5cGU6IEl0ZXJhdG9yUHJvdG90eXBlLFxuICBCVUdHWV9TQUZBUklfSVRFUkFUT1JTOiBCVUdHWV9TQUZBUklfSVRFUkFUT1JTXG59O1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgZGVmaW5lUHJvcGVydHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIG9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMnKTtcblxuLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5kZWZpbmVwcm9wZXJ0aWVzXG5tb2R1bGUuZXhwb3J0cyA9IERFU0NSSVBUT1JTID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzID0gb2JqZWN0S2V5cyhQcm9wZXJ0aWVzKTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIGRlZmluZVByb3BlcnR5TW9kdWxlLmYoTywga2V5ID0ga2V5c1tpbmRleCsrXSwgUHJvcGVydGllc1trZXldKTtcbiAgcmV0dXJuIE87XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGRlZmluZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0aWVzJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZGVuLWtleXMnKTtcbnZhciBodG1sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2h0bWwnKTtcbnZhciBkb2N1bWVudENyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9jdW1lbnQtY3JlYXRlLWVsZW1lbnQnKTtcbnZhciBzaGFyZWRLZXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkLWtleScpO1xudmFyIElFX1BST1RPID0gc2hhcmVkS2V5KCdJRV9QUk9UTycpO1xuXG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgRW1wdHkgPSBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5ICovIH07XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBpZnJhbWUgT2JqZWN0IHdpdGggY2xlYXJlZCBwcm90b3R5cGVcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24gKCkge1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gZG9jdW1lbnRDcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdmFyIGxlbmd0aCA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgc2NyaXB0ID0gJ3NjcmlwdCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGpzID0gJ2phdmEnICsgc2NyaXB0ICsgJzonO1xuICB2YXIgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBodG1sLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSBTdHJpbmcoanMpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgc2NyaXB0ICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnLycgKyBzY3JpcHQgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAobGVuZ3RoLS0pIGRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbbGVuZ3RoXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuXG4vLyBgT2JqZWN0LmNyZWF0ZWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuY3JlYXRlXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKE8gIT09IG51bGwpIHtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5KCk7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZGVmaW5lUHJvcGVydGllcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcblxuaGlkZGVuS2V5c1tJRV9QUk9UT10gPSB0cnVlO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIEl0ZXJhdG9yUHJvdG90eXBlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycy1jb3JlJykuSXRlcmF0b3JQcm90b3R5cGU7XG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1jcmVhdGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pdGVyYXRvcnMnKTtcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJdGVyYXRvckNvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KSB7XG4gIHZhciBUT19TVFJJTkdfVEFHID0gTkFNRSArICcgSXRlcmF0b3InO1xuICBJdGVyYXRvckNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSwgeyBuZXh0OiBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoMSwgbmV4dCkgfSk7XG4gIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yQ29uc3RydWN0b3IsIFRPX1NUUklOR19UQUcsIGZhbHNlLCB0cnVlKTtcbiAgSXRlcmF0b3JzW1RPX1NUUklOR19UQUddID0gcmV0dXJuVGhpcztcbiAgcmV0dXJuIEl0ZXJhdG9yQ29uc3RydWN0b3I7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSAmJiBpdCAhPT0gbnVsbCkge1xuICAgIHRocm93IFR5cGVFcnJvcihcIkNhbid0IHNldCBcIiArIFN0cmluZyhpdCkgKyAnIGFzIGEgcHJvdG90eXBlJyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBhUG9zc2libGVQcm90b3R5cGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1wb3NzaWJsZS1wcm90b3R5cGUnKTtcblxuLy8gYE9iamVjdC5zZXRQcm90b3R5cGVPZmAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3Quc2V0cHJvdG90eXBlb2Zcbi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8ICgnX19wcm90b19fJyBpbiB7fSA/IGZ1bmN0aW9uICgpIHtcbiAgdmFyIENPUlJFQ1RfU0VUVEVSID0gZmFsc2U7XG4gIHZhciB0ZXN0ID0ge307XG4gIHZhciBzZXR0ZXI7XG4gIHRyeSB7XG4gICAgc2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0O1xuICAgIHNldHRlci5jYWxsKHRlc3QsIFtdKTtcbiAgICBDT1JSRUNUX1NFVFRFUiA9IHRlc3QgaW5zdGFuY2VvZiBBcnJheTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pIHtcbiAgICBhbk9iamVjdChPKTtcbiAgICBhUG9zc2libGVQcm90b3R5cGUocHJvdG8pO1xuICAgIGlmIChDT1JSRUNUX1NFVFRFUikgc2V0dGVyLmNhbGwoTywgcHJvdG8pO1xuICAgIGVsc2UgTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICByZXR1cm4gTztcbiAgfTtcbn0oKSA6IHVuZGVmaW5lZCk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBjcmVhdGVJdGVyYXRvckNvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1pdGVyYXRvci1jb25zdHJ1Y3RvcicpO1xudmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXNldC1wcm90b3R5cGUtb2YnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG52YXIgSVNfUFVSRSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1wdXJlJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycycpO1xudmFyIEl0ZXJhdG9yc0NvcmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0b3JzLWNvcmUnKTtcblxudmFyIEl0ZXJhdG9yUHJvdG90eXBlID0gSXRlcmF0b3JzQ29yZS5JdGVyYXRvclByb3RvdHlwZTtcbnZhciBCVUdHWV9TQUZBUklfSVRFUkFUT1JTID0gSXRlcmF0b3JzQ29yZS5CVUdHWV9TQUZBUklfSVRFUkFUT1JTO1xudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xudmFyIEtFWVMgPSAna2V5cyc7XG52YXIgVkFMVUVTID0gJ3ZhbHVlcyc7XG52YXIgRU5UUklFUyA9ICdlbnRyaWVzJztcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJdGVyYWJsZSwgTkFNRSwgSXRlcmF0b3JDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRUQpIHtcbiAgY3JlYXRlSXRlcmF0b3JDb25zdHJ1Y3RvcihJdGVyYXRvckNvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcblxuICB2YXIgZ2V0SXRlcmF0aW9uTWV0aG9kID0gZnVuY3Rpb24gKEtJTkQpIHtcbiAgICBpZiAoS0lORCA9PT0gREVGQVVMVCAmJiBkZWZhdWx0SXRlcmF0b3IpIHJldHVybiBkZWZhdWx0SXRlcmF0b3I7XG4gICAgaWYgKCFCVUdHWV9TQUZBUklfSVRFUkFUT1JTICYmIEtJTkQgaW4gSXRlcmFibGVQcm90b3R5cGUpIHJldHVybiBJdGVyYWJsZVByb3RvdHlwZVtLSU5EXTtcbiAgICBzd2l0Y2ggKEtJTkQpIHtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKSB7IHJldHVybiBuZXcgSXRlcmF0b3JDb25zdHJ1Y3Rvcih0aGlzLCBLSU5EKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCkgeyByZXR1cm4gbmV3IEl0ZXJhdG9yQ29uc3RydWN0b3IodGhpcywgS0lORCk7IH07XG4gICAgICBjYXNlIEVOVFJJRVM6IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCkgeyByZXR1cm4gbmV3IEl0ZXJhdG9yQ29uc3RydWN0b3IodGhpcywgS0lORCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IEl0ZXJhdG9yQ29uc3RydWN0b3IodGhpcyk7IH07XG4gIH07XG5cbiAgdmFyIFRPX1NUUklOR19UQUcgPSBOQU1FICsgJyBJdGVyYXRvcic7XG4gIHZhciBJTkNPUlJFQ1RfVkFMVUVTX05BTUUgPSBmYWxzZTtcbiAgdmFyIEl0ZXJhYmxlUHJvdG90eXBlID0gSXRlcmFibGUucHJvdG90eXBlO1xuICB2YXIgbmF0aXZlSXRlcmF0b3IgPSBJdGVyYWJsZVByb3RvdHlwZVtJVEVSQVRPUl1cbiAgICB8fCBJdGVyYWJsZVByb3RvdHlwZVsnQEBpdGVyYXRvciddXG4gICAgfHwgREVGQVVMVCAmJiBJdGVyYWJsZVByb3RvdHlwZVtERUZBVUxUXTtcbiAgdmFyIGRlZmF1bHRJdGVyYXRvciA9ICFCVUdHWV9TQUZBUklfSVRFUkFUT1JTICYmIG5hdGl2ZUl0ZXJhdG9yIHx8IGdldEl0ZXJhdGlvbk1ldGhvZChERUZBVUxUKTtcbiAgdmFyIGFueU5hdGl2ZUl0ZXJhdG9yID0gTkFNRSA9PSAnQXJyYXknID8gSXRlcmFibGVQcm90b3R5cGUuZW50cmllcyB8fCBuYXRpdmVJdGVyYXRvciA6IG5hdGl2ZUl0ZXJhdG9yO1xuICB2YXIgQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlLCBtZXRob2RzLCBLRVk7XG5cbiAgLy8gZml4IG5hdGl2ZVxuICBpZiAoYW55TmF0aXZlSXRlcmF0b3IpIHtcbiAgICBDdXJyZW50SXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90b3R5cGVPZihhbnlOYXRpdmVJdGVyYXRvci5jYWxsKG5ldyBJdGVyYWJsZSgpKSk7XG4gICAgaWYgKEl0ZXJhdG9yUHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlICYmIEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZS5uZXh0KSB7XG4gICAgICBpZiAoIUlTX1BVUkUgJiYgZ2V0UHJvdG90eXBlT2YoQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlKSAhPT0gSXRlcmF0b3JQcm90b3R5cGUpIHtcbiAgICAgICAgaWYgKHNldFByb3RvdHlwZU9mKSB7XG4gICAgICAgICAgc2V0UHJvdG90eXBlT2YoQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlLCBJdGVyYXRvclByb3RvdHlwZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZVtJVEVSQVRPUl0gIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGhpZGUoQ3VycmVudEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICAgIHNldFRvU3RyaW5nVGFnKEN1cnJlbnRJdGVyYXRvclByb3RvdHlwZSwgVE9fU1RSSU5HX1RBRywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBpZiAoSVNfUFVSRSkgSXRlcmF0b3JzW1RPX1NUUklOR19UQUddID0gcmV0dXJuVGhpcztcbiAgICB9XG4gIH1cblxuICAvLyBmaXggQXJyYXkje3ZhbHVlcywgQEBpdGVyYXRvcn0ubmFtZSBpbiBWOCAvIEZGXG4gIGlmIChERUZBVUxUID09IFZBTFVFUyAmJiBuYXRpdmVJdGVyYXRvciAmJiBuYXRpdmVJdGVyYXRvci5uYW1lICE9PSBWQUxVRVMpIHtcbiAgICBJTkNPUlJFQ1RfVkFMVUVTX05BTUUgPSB0cnVlO1xuICAgIGRlZmF1bHRJdGVyYXRvciA9IGZ1bmN0aW9uIHZhbHVlcygpIHsgcmV0dXJuIG5hdGl2ZUl0ZXJhdG9yLmNhbGwodGhpcyk7IH07XG4gIH1cblxuICAvLyBkZWZpbmUgaXRlcmF0b3JcbiAgaWYgKCghSVNfUFVSRSB8fCBGT1JDRUQpICYmIEl0ZXJhYmxlUHJvdG90eXBlW0lURVJBVE9SXSAhPT0gZGVmYXVsdEl0ZXJhdG9yKSB7XG4gICAgaGlkZShJdGVyYWJsZVByb3RvdHlwZSwgSVRFUkFUT1IsIGRlZmF1bHRJdGVyYXRvcik7XG4gIH1cbiAgSXRlcmF0b3JzW05BTUVdID0gZGVmYXVsdEl0ZXJhdG9yO1xuXG4gIC8vIGV4cG9ydCBhZGRpdGlvbmFsIG1ldGhvZHNcbiAgaWYgKERFRkFVTFQpIHtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiBnZXRJdGVyYXRpb25NZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6IElTX1NFVCA/IGRlZmF1bHRJdGVyYXRvciA6IGdldEl0ZXJhdGlvbk1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6IGdldEl0ZXJhdGlvbk1ldGhvZChFTlRSSUVTKVxuICAgIH07XG4gICAgaWYgKEZPUkNFRCkgZm9yIChLRVkgaW4gbWV0aG9kcykge1xuICAgICAgaWYgKEJVR0dZX1NBRkFSSV9JVEVSQVRPUlMgfHwgSU5DT1JSRUNUX1ZBTFVFU19OQU1FIHx8ICEoS0VZIGluIEl0ZXJhYmxlUHJvdG90eXBlKSkge1xuICAgICAgICByZWRlZmluZShJdGVyYWJsZVByb3RvdHlwZSwgS0VZLCBtZXRob2RzW0tFWV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSAkKHsgdGFyZ2V0OiBOQU1FLCBwcm90bzogdHJ1ZSwgZm9yY2VkOiBCVUdHWV9TQUZBUklfSVRFUkFUT1JTIHx8IElOQ09SUkVDVF9WQUxVRVNfTkFNRSB9LCBtZXRob2RzKTtcbiAgfVxuXG4gIHJldHVybiBtZXRob2RzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBjaGFyQXQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc3RyaW5nLW11bHRpYnl0ZScpLmNoYXJBdDtcbnZhciBJbnRlcm5hbFN0YXRlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlJyk7XG52YXIgZGVmaW5lSXRlcmF0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVmaW5lLWl0ZXJhdG9yJyk7XG5cbnZhciBTVFJJTkdfSVRFUkFUT1IgPSAnU3RyaW5nIEl0ZXJhdG9yJztcbnZhciBzZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5zZXQ7XG52YXIgZ2V0SW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZ2V0dGVyRm9yKFNUUklOR19JVEVSQVRPUik7XG5cbi8vIGBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUtQEBpdGVyYXRvclxuZGVmaW5lSXRlcmF0b3IoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24gKGl0ZXJhdGVkKSB7XG4gIHNldEludGVybmFsU3RhdGUodGhpcywge1xuICAgIHR5cGU6IFNUUklOR19JVEVSQVRPUixcbiAgICBzdHJpbmc6IFN0cmluZyhpdGVyYXRlZCksXG4gICAgaW5kZXg6IDBcbiAgfSk7XG4vLyBgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0YCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLSVzdHJpbmdpdGVyYXRvcnByb3RvdHlwZSUubmV4dFxufSwgZnVuY3Rpb24gbmV4dCgpIHtcbiAgdmFyIHN0YXRlID0gZ2V0SW50ZXJuYWxTdGF0ZSh0aGlzKTtcbiAgdmFyIHN0cmluZyA9IHN0YXRlLnN0cmluZztcbiAgdmFyIGluZGV4ID0gc3RhdGUuaW5kZXg7XG4gIHZhciBwb2ludDtcbiAgaWYgKGluZGV4ID49IHN0cmluZy5sZW5ndGgpIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgcG9pbnQgPSBjaGFyQXQoc3RyaW5nLCBpbmRleCk7XG4gIHN0YXRlLmluZGV4ICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHsgdmFsdWU6IHBvaW50LCBkb25lOiBmYWxzZSB9O1xufSk7XG4iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LXByb3RvdHlwZS1vZicpO1xudmFyIHNldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1zZXQtcHJvdG90eXBlLW9mJyk7XG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1jcmVhdGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciBpdGVyYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdGUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcblxudmFyICRBZ2dyZWdhdGVFcnJvciA9IGZ1bmN0aW9uIEFnZ3JlZ2F0ZUVycm9yKGVycm9ycywgbWVzc2FnZSkge1xuICB2YXIgdGhhdCA9IHRoaXM7XG4gIGlmICghKHRoYXQgaW5zdGFuY2VvZiAkQWdncmVnYXRlRXJyb3IpKSByZXR1cm4gbmV3ICRBZ2dyZWdhdGVFcnJvcihlcnJvcnMsIG1lc3NhZ2UpO1xuICBpZiAoc2V0UHJvdG90eXBlT2YpIHtcbiAgICB0aGF0ID0gc2V0UHJvdG90eXBlT2YobmV3IEVycm9yKG1lc3NhZ2UpLCBnZXRQcm90b3R5cGVPZih0aGF0KSk7XG4gIH1cbiAgdmFyIGVycm9yc0FycmF5ID0gW107XG4gIGl0ZXJhdGUoZXJyb3JzLCBlcnJvcnNBcnJheS5wdXNoLCBlcnJvcnNBcnJheSk7XG4gIGhpZGUodGhhdCwgJ2Vycm9ycycsIGVycm9yc0FycmF5KTtcbiAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCkgaGlkZSh0aGF0LCAnbWVzc2FnZScsIFN0cmluZyhtZXNzYWdlKSk7XG4gIHJldHVybiB0aGF0O1xufTtcblxuJEFnZ3JlZ2F0ZUVycm9yLnByb3RvdHlwZSA9IGNyZWF0ZShFcnJvci5wcm90b3R5cGUsIHtcbiAgY29uc3RydWN0b3I6IGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcig1LCAkQWdncmVnYXRlRXJyb3IpLFxuICBuYW1lOiBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoNSwgJ0FnZ3JlZ2F0ZUVycm9yJylcbn0pO1xuXG4kKHsgZ2xvYmFsOiB0cnVlIH0sIHtcbiAgQWdncmVnYXRlRXJyb3I6ICRBZ2dyZWdhdGVFcnJvclxufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25ldy1wcm9taXNlLWNhcGFiaWxpdHknKTtcbnZhciBwZXJmb3JtID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3BlcmZvcm0nKTtcbnZhciBpdGVyYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdGUnKTtcblxuLy8gYFByb21pc2UuYWxsU2V0dGxlZGAgbWV0aG9kXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1wcm9taXNlLWFsbFNldHRsZWRcbiQoeyB0YXJnZXQ6ICdQcm9taXNlJywgc3RhdDogdHJ1ZSB9LCB7XG4gIGFsbFNldHRsZWQ6IGZ1bmN0aW9uIGFsbFNldHRsZWQoaXRlcmFibGUpIHtcbiAgICB2YXIgQyA9IHRoaXM7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZS5mKEMpO1xuICAgIHZhciByZXNvbHZlID0gY2FwYWJpbGl0eS5yZXNvbHZlO1xuICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICB2YXIgcmVzdWx0ID0gcGVyZm9ybShmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcHJvbWlzZVJlc29sdmUgPSBhRnVuY3Rpb24oQy5yZXNvbHZlKTtcbiAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgIHZhciByZW1haW5pbmcgPSAxO1xuICAgICAgaXRlcmF0ZShpdGVyYWJsZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gY291bnRlcisrO1xuICAgICAgICB2YXIgYWxyZWFkeUNhbGxlZCA9IGZhbHNlO1xuICAgICAgICB2YWx1ZXMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICByZW1haW5pbmcrKztcbiAgICAgICAgcHJvbWlzZVJlc29sdmUuY2FsbChDLCBwcm9taXNlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmIChhbHJlYWR5Q2FsbGVkKSByZXR1cm47XG4gICAgICAgICAgYWxyZWFkeUNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgdmFsdWVzW2luZGV4XSA9IHsgc3RhdHVzOiAnZnVsZmlsbGVkJywgdmFsdWU6IHZhbHVlIH07XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmIChhbHJlYWR5Q2FsbGVkKSByZXR1cm47XG4gICAgICAgICAgYWxyZWFkeUNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgdmFsdWVzW2luZGV4XSA9IHsgc3RhdHVzOiAncmVqZWN0ZWQnLCByZWFzb246IGUgfTtcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5lcnJvcikgcmVqZWN0KHJlc3VsdC52YWx1ZSk7XG4gICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9leHBvcnQnKTtcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xudmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGVyZm9ybScpO1xudmFyIGl0ZXJhdGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXRlcmF0ZScpO1xuXG52YXIgUFJPTUlTRV9BTllfRVJST1IgPSAnTm8gb25lIHByb21pc2UgcmVzb2x2ZWQnO1xuXG4vLyBgUHJvbWlzZS5hbnlgIG1ldGhvZFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcHJvbWlzZS1hbnlcbiQoeyB0YXJnZXQ6ICdQcm9taXNlJywgc3RhdDogdHJ1ZSB9LCB7XG4gIGFueTogZnVuY3Rpb24gYW55KGl0ZXJhYmxlKSB7XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZihDKTtcbiAgICB2YXIgcmVzb2x2ZSA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICB2YXIgcmVqZWN0ID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIHJlc3VsdCA9IHBlcmZvcm0oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHByb21pc2VSZXNvbHZlID0gYUZ1bmN0aW9uKEMucmVzb2x2ZSk7XG4gICAgICB2YXIgZXJyb3JzID0gW107XG4gICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICB2YXIgcmVtYWluaW5nID0gMTtcbiAgICAgIHZhciBhbHJlYWR5UmVzb2x2ZWQgPSBmYWxzZTtcbiAgICAgIGl0ZXJhdGUoaXRlcmFibGUsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGNvdW50ZXIrKztcbiAgICAgICAgdmFyIGFscmVhZHlSZWplY3RlZCA9IGZhbHNlO1xuICAgICAgICBlcnJvcnMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICByZW1haW5pbmcrKztcbiAgICAgICAgcHJvbWlzZVJlc29sdmUuY2FsbChDLCBwcm9taXNlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGlmIChhbHJlYWR5UmVqZWN0ZWQgfHwgYWxyZWFkeVJlc29sdmVkKSByZXR1cm47XG4gICAgICAgICAgYWxyZWFkeVJlc29sdmVkID0gdHJ1ZTtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBpZiAoYWxyZWFkeVJlamVjdGVkIHx8IGFscmVhZHlSZXNvbHZlZCkgcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlSZWplY3RlZCA9IHRydWU7XG4gICAgICAgICAgZXJyb3JzW2luZGV4XSA9IGU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVqZWN0KG5ldyAoZ2V0QnVpbHRJbignQWdncmVnYXRlRXJyb3InKSkoZXJyb3JzLCBQUk9NSVNFX0FOWV9FUlJPUikpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgLS1yZW1haW5pbmcgfHwgcmVqZWN0KG5ldyAoZ2V0QnVpbHRJbignQWdncmVnYXRlRXJyb3InKSkoZXJyb3JzLCBQUk9NSVNFX0FOWV9FUlJPUikpO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQuZXJyb3IpIHJlamVjdChyZXN1bHQudmFsdWUpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGVyZm9ybScpO1xuXG4vLyBgUHJvbWlzZS50cnlgIG1ldGhvZFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtcHJvbWlzZS10cnlcbiQoeyB0YXJnZXQ6ICdQcm9taXNlJywgc3RhdDogdHJ1ZSB9LCB7XG4gICd0cnknOiBmdW5jdGlvbiAoY2FsbGJhY2tmbikge1xuICAgIHZhciBwcm9taXNlQ2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlLmYodGhpcyk7XG4gICAgdmFyIHJlc3VsdCA9IHBlcmZvcm0oY2FsbGJhY2tmbik7XG4gICAgKHJlc3VsdC5lcnJvciA/IHByb21pc2VDYXBhYmlsaXR5LnJlamVjdCA6IHByb21pc2VDYXBhYmlsaXR5LnJlc29sdmUpKHJlc3VsdC52YWx1ZSk7XG4gICAgcmV0dXJuIHByb21pc2VDYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pO1xuIiwiLy8gaXRlcmFibGUgRE9NIGNvbGxlY3Rpb25zXG4vLyBmbGFnIC0gYGl0ZXJhYmxlYCBpbnRlcmZhY2UgLSAnZW50cmllcycsICdrZXlzJywgJ3ZhbHVlcycsICdmb3JFYWNoJyBtZXRob2RzXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ1NTUnVsZUxpc3Q6IDAsXG4gIENTU1N0eWxlRGVjbGFyYXRpb246IDAsXG4gIENTU1ZhbHVlTGlzdDogMCxcbiAgQ2xpZW50UmVjdExpc3Q6IDAsXG4gIERPTVJlY3RMaXN0OiAwLFxuICBET01TdHJpbmdMaXN0OiAwLFxuICBET01Ub2tlbkxpc3Q6IDEsXG4gIERhdGFUcmFuc2Zlckl0ZW1MaXN0OiAwLFxuICBGaWxlTGlzdDogMCxcbiAgSFRNTEFsbENvbGxlY3Rpb246IDAsXG4gIEhUTUxDb2xsZWN0aW9uOiAwLFxuICBIVE1MRm9ybUVsZW1lbnQ6IDAsXG4gIEhUTUxTZWxlY3RFbGVtZW50OiAwLFxuICBNZWRpYUxpc3Q6IDAsXG4gIE1pbWVUeXBlQXJyYXk6IDAsXG4gIE5hbWVkTm9kZU1hcDogMCxcbiAgTm9kZUxpc3Q6IDEsXG4gIFBhaW50UmVxdWVzdExpc3Q6IDAsXG4gIFBsdWdpbjogMCxcbiAgUGx1Z2luQXJyYXk6IDAsXG4gIFNWR0xlbmd0aExpc3Q6IDAsXG4gIFNWR051bWJlckxpc3Q6IDAsXG4gIFNWR1BhdGhTZWdMaXN0OiAwLFxuICBTVkdQb2ludExpc3Q6IDAsXG4gIFNWR1N0cmluZ0xpc3Q6IDAsXG4gIFNWR1RyYW5zZm9ybUxpc3Q6IDAsXG4gIFNvdXJjZUJ1ZmZlckxpc3Q6IDAsXG4gIFN0eWxlU2hlZXRMaXN0OiAwLFxuICBUZXh0VHJhY2tDdWVMaXN0OiAwLFxuICBUZXh0VHJhY2tMaXN0OiAwLFxuICBUb3VjaExpc3Q6IDBcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIERPTUl0ZXJhYmxlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb20taXRlcmFibGVzJyk7XG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1mb3ItZWFjaCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZScpO1xuXG5mb3IgKHZhciBDT0xMRUNUSU9OX05BTUUgaW4gRE9NSXRlcmFibGVzKSB7XG4gIHZhciBDb2xsZWN0aW9uID0gZ2xvYmFsW0NPTExFQ1RJT05fTkFNRV07XG4gIHZhciBDb2xsZWN0aW9uUHJvdG90eXBlID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgLy8gc29tZSBDaHJvbWUgdmVyc2lvbnMgaGF2ZSBub24tY29uZmlndXJhYmxlIG1ldGhvZHMgb24gRE9NVG9rZW5MaXN0XG4gIGlmIChDb2xsZWN0aW9uUHJvdG90eXBlICYmIENvbGxlY3Rpb25Qcm90b3R5cGUuZm9yRWFjaCAhPT0gZm9yRWFjaCkgdHJ5IHtcbiAgICBoaWRlKENvbGxlY3Rpb25Qcm90b3R5cGUsICdmb3JFYWNoJywgZm9yRWFjaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgQ29sbGVjdGlvblByb3RvdHlwZS5mb3JFYWNoID0gZm9yRWFjaDtcbiAgfVxufVxuIiwidmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtY3JlYXRlJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRlJyk7XG5cbnZhciBVTlNDT1BBQkxFUyA9IHdlbGxLbm93blN5bWJvbCgndW5zY29wYWJsZXMnKTtcbnZhciBBcnJheVByb3RvdHlwZSA9IEFycmF5LnByb3RvdHlwZTtcblxuLy8gQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUtQEB1bnNjb3BhYmxlc1xuaWYgKEFycmF5UHJvdG90eXBlW1VOU0NPUEFCTEVTXSA9PSB1bmRlZmluZWQpIHtcbiAgaGlkZShBcnJheVByb3RvdHlwZSwgVU5TQ09QQUJMRVMsIGNyZWF0ZShudWxsKSk7XG59XG5cbi8vIGFkZCBhIGtleSB0byBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICBBcnJheVByb3RvdHlwZVtVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRvSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdCcpO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYWRkLXRvLXVuc2NvcGFibGVzJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2l0ZXJhdG9ycycpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcbnZhciBkZWZpbmVJdGVyYXRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZWZpbmUtaXRlcmF0b3InKTtcblxudmFyIEFSUkFZX0lURVJBVE9SID0gJ0FycmF5IEl0ZXJhdG9yJztcbnZhciBzZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5zZXQ7XG52YXIgZ2V0SW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZ2V0dGVyRm9yKEFSUkFZX0lURVJBVE9SKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS5lbnRyaWVzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5lbnRyaWVzXG4vLyBgQXJyYXkucHJvdG90eXBlLmtleXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmtleXNcbi8vIGBBcnJheS5wcm90b3R5cGUudmFsdWVzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS52YWx1ZXNcbi8vIGBBcnJheS5wcm90b3R5cGVbQEBpdGVyYXRvcl1gIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLUBAaXRlcmF0b3Jcbi8vIGBDcmVhdGVBcnJheUl0ZXJhdG9yYCBpbnRlcm5hbCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWNyZWF0ZWFycmF5aXRlcmF0b3Jcbm1vZHVsZS5leHBvcnRzID0gZGVmaW5lSXRlcmF0b3IoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uIChpdGVyYXRlZCwga2luZCkge1xuICBzZXRJbnRlcm5hbFN0YXRlKHRoaXMsIHtcbiAgICB0eXBlOiBBUlJBWV9JVEVSQVRPUixcbiAgICB0YXJnZXQ6IHRvSW5kZXhlZE9iamVjdChpdGVyYXRlZCksIC8vIHRhcmdldFxuICAgIGluZGV4OiAwLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICAgIGtpbmQ6IGtpbmQgICAgICAgICAgICAgICAgICAgICAgICAgLy8ga2luZFxuICB9KTtcbi8vIGAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dGAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy0lYXJyYXlpdGVyYXRvcnByb3RvdHlwZSUubmV4dFxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFN0YXRlKHRoaXMpO1xuICB2YXIgdGFyZ2V0ID0gc3RhdGUudGFyZ2V0O1xuICB2YXIga2luZCA9IHN0YXRlLmtpbmQ7XG4gIHZhciBpbmRleCA9IHN0YXRlLmluZGV4Kys7XG4gIGlmICghdGFyZ2V0IHx8IGluZGV4ID49IHRhcmdldC5sZW5ndGgpIHtcbiAgICBzdGF0ZS50YXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG4gIGlmIChraW5kID09ICdrZXlzJykgcmV0dXJuIHsgdmFsdWU6IGluZGV4LCBkb25lOiBmYWxzZSB9O1xuICBpZiAoa2luZCA9PSAndmFsdWVzJykgcmV0dXJuIHsgdmFsdWU6IHRhcmdldFtpbmRleF0sIGRvbmU6IGZhbHNlIH07XG4gIHJldHVybiB7IHZhbHVlOiBbaW5kZXgsIHRhcmdldFtpbmRleF1dLCBkb25lOiBmYWxzZSB9O1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyVcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWNyZWF0ZXVubWFwcGVkYXJndW1lbnRzb2JqZWN0XG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1jcmVhdGVtYXBwZWRhcmd1bWVudHNvYmplY3Rcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS1AQHVuc2NvcGFibGVzXG5hZGRUb1Vuc2NvcGFibGVzKCdrZXlzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCd2YWx1ZXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ2VudHJpZXMnKTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgRE9NSXRlcmFibGVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMnKTtcbnZhciBBcnJheUl0ZXJhdG9yTWV0aG9kcyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvZXMuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGUnKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIElURVJBVE9SID0gd2VsbEtub3duU3ltYm9sKCdpdGVyYXRvcicpO1xudmFyIFRPX1NUUklOR19UQUcgPSB3ZWxsS25vd25TeW1ib2woJ3RvU3RyaW5nVGFnJyk7XG52YXIgQXJyYXlWYWx1ZXMgPSBBcnJheUl0ZXJhdG9yTWV0aG9kcy52YWx1ZXM7XG5cbmZvciAodmFyIENPTExFQ1RJT05fTkFNRSBpbiBET01JdGVyYWJsZXMpIHtcbiAgdmFyIENvbGxlY3Rpb24gPSBnbG9iYWxbQ09MTEVDVElPTl9OQU1FXTtcbiAgdmFyIENvbGxlY3Rpb25Qcm90b3R5cGUgPSBDb2xsZWN0aW9uICYmIENvbGxlY3Rpb24ucHJvdG90eXBlO1xuICBpZiAoQ29sbGVjdGlvblByb3RvdHlwZSkge1xuICAgIC8vIHNvbWUgQ2hyb21lIHZlcnNpb25zIGhhdmUgbm9uLWNvbmZpZ3VyYWJsZSBtZXRob2RzIG9uIERPTVRva2VuTGlzdFxuICAgIGlmIChDb2xsZWN0aW9uUHJvdG90eXBlW0lURVJBVE9SXSAhPT0gQXJyYXlWYWx1ZXMpIHRyeSB7XG4gICAgICBoaWRlKENvbGxlY3Rpb25Qcm90b3R5cGUsIElURVJBVE9SLCBBcnJheVZhbHVlcyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIENvbGxlY3Rpb25Qcm90b3R5cGVbSVRFUkFUT1JdID0gQXJyYXlWYWx1ZXM7XG4gICAgfVxuICAgIGlmICghQ29sbGVjdGlvblByb3RvdHlwZVtUT19TVFJJTkdfVEFHXSkgaGlkZShDb2xsZWN0aW9uUHJvdG90eXBlLCBUT19TVFJJTkdfVEFHLCBDT0xMRUNUSU9OX05BTUUpO1xuICAgIGlmIChET01JdGVyYWJsZXNbQ09MTEVDVElPTl9OQU1FXSkgZm9yICh2YXIgTUVUSE9EX05BTUUgaW4gQXJyYXlJdGVyYXRvck1ldGhvZHMpIHtcbiAgICAgIC8vIHNvbWUgQ2hyb21lIHZlcnNpb25zIGhhdmUgbm9uLWNvbmZpZ3VyYWJsZSBtZXRob2RzIG9uIERPTVRva2VuTGlzdFxuICAgICAgaWYgKENvbGxlY3Rpb25Qcm90b3R5cGVbTUVUSE9EX05BTUVdICE9PSBBcnJheUl0ZXJhdG9yTWV0aG9kc1tNRVRIT0RfTkFNRV0pIHRyeSB7XG4gICAgICAgIGhpZGUoQ29sbGVjdGlvblByb3RvdHlwZSwgTUVUSE9EX05BTUUsIEFycmF5SXRlcmF0b3JNZXRob2RzW01FVEhPRF9OQU1FXSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBDb2xsZWN0aW9uUHJvdG90eXBlW01FVEhPRF9OQU1FXSA9IEFycmF5SXRlcmF0b3JNZXRob2RzW01FVEhPRF9OQU1FXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xudmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xuXG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHVybCA9IG5ldyBVUkwoJ2I/ZT0xJywgJ2h0dHA6Ly9hJyk7XG4gIHZhciBzZWFyY2hQYXJhbXMgPSB1cmwuc2VhcmNoUGFyYW1zO1xuICB1cmwucGF0aG5hbWUgPSAnYyUyMGQnO1xuICByZXR1cm4gKElTX1BVUkUgJiYgIXVybC50b0pTT04pXG4gICAgfHwgIXNlYXJjaFBhcmFtcy5zb3J0XG4gICAgfHwgdXJsLmhyZWYgIT09ICdodHRwOi8vYS9jJTIwZD9lPTEnXG4gICAgfHwgc2VhcmNoUGFyYW1zLmdldCgnZScpICE9PSAnMSdcbiAgICB8fCBTdHJpbmcobmV3IFVSTFNlYXJjaFBhcmFtcygnP2E9MScpKSAhPT0gJ2E9MSdcbiAgICB8fCAhc2VhcmNoUGFyYW1zW0lURVJBVE9SXVxuICAgIC8vIHRocm93cyBpbiBFZGdlXG4gICAgfHwgbmV3IFVSTCgnaHR0cHM6Ly9hQGInKS51c2VybmFtZSAhPT0gJ2EnXG4gICAgfHwgbmV3IFVSTFNlYXJjaFBhcmFtcyhuZXcgVVJMU2VhcmNoUGFyYW1zKCdhPWInKSkuZ2V0KCdhJykgIT09ICdiJ1xuICAgIC8vIG5vdCBwdW55Y29kZWQgaW4gRWRnZVxuICAgIHx8IG5ldyBVUkwoJ2h0dHA6Ly/RgtC10YHRgicpLmhvc3QgIT09ICd4bi0tZTFheWJjJ1xuICAgIC8vIG5vdCBlc2NhcGVkIGluIENocm9tZSA2Mi1cbiAgICB8fCBuZXcgVVJMKCdodHRwOi8vYSPQsScpLmhhc2ggIT09ICcjJUQwJUIxJztcbn0pO1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGdldEl0ZXJhdG9yTWV0aG9kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dldC1pdGVyYXRvci1tZXRob2QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gZ2V0SXRlcmF0b3JNZXRob2QoaXQpO1xuICBpZiAodHlwZW9mIGl0ZXJhdG9yTWV0aG9kICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoU3RyaW5nKGl0KSArICcgaXMgbm90IGl0ZXJhYmxlJyk7XG4gIH0gcmV0dXJuIGFuT2JqZWN0KGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXQpKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG4vLyBUT0RPOiBpbiBjb3JlLWpzQDQsIG1vdmUgL21vZHVsZXMvIGRlcGVuZGVuY2llcyB0byBwdWJsaWMgZW50cmllcyBmb3IgYmV0dGVyIG9wdGltaXphdGlvbiBieSB0b29scyBsaWtlIGBwcmVzZXQtZW52YFxucmVxdWlyZSgnLi4vbW9kdWxlcy9lcy5hcnJheS5pdGVyYXRvcicpO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgVVNFX05BVElWRV9VUkwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXVybCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlZGVmaW5lJyk7XG52YXIgcmVkZWZpbmVBbGwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUtYWxsJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciBjcmVhdGVJdGVyYXRvckNvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1pdGVyYXRvci1jb25zdHJ1Y3RvcicpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLWluc3RhbmNlJyk7XG52YXIgaGFzT3duID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYmluZC1jb250ZXh0Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgZ2V0SXRlcmF0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yJyk7XG52YXIgZ2V0SXRlcmF0b3JNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgSVRFUkFUT1IgPSB3ZWxsS25vd25TeW1ib2woJ2l0ZXJhdG9yJyk7XG52YXIgVVJMX1NFQVJDSF9QQVJBTVMgPSAnVVJMU2VhcmNoUGFyYW1zJztcbnZhciBVUkxfU0VBUkNIX1BBUkFNU19JVEVSQVRPUiA9IFVSTF9TRUFSQ0hfUEFSQU1TICsgJ0l0ZXJhdG9yJztcbnZhciBzZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5zZXQ7XG52YXIgZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZ2V0dGVyRm9yKFVSTF9TRUFSQ0hfUEFSQU1TKTtcbnZhciBnZXRJbnRlcm5hbEl0ZXJhdG9yU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmdldHRlckZvcihVUkxfU0VBUkNIX1BBUkFNU19JVEVSQVRPUik7XG5cbnZhciBwbHVzID0gL1xcKy9nO1xudmFyIHNlcXVlbmNlcyA9IEFycmF5KDQpO1xuXG52YXIgcGVyY2VudFNlcXVlbmNlID0gZnVuY3Rpb24gKGJ5dGVzKSB7XG4gIHJldHVybiBzZXF1ZW5jZXNbYnl0ZXMgLSAxXSB8fCAoc2VxdWVuY2VzW2J5dGVzIC0gMV0gPSBSZWdFeHAoJygoPzolW1xcXFxkYS1mXXsyfSl7JyArIGJ5dGVzICsgJ30pJywgJ2dpJykpO1xufTtcblxudmFyIHBlcmNlbnREZWNvZGUgPSBmdW5jdGlvbiAoc2VxdWVuY2UpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHNlcXVlbmNlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gc2VxdWVuY2U7XG4gIH1cbn07XG5cbnZhciBkZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgcmVzdWx0ID0gaXQucmVwbGFjZShwbHVzLCAnICcpO1xuICB2YXIgYnl0ZXMgPSA0O1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB3aGlsZSAoYnl0ZXMpIHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHBlcmNlbnRTZXF1ZW5jZShieXRlcy0tKSwgcGVyY2VudERlY29kZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5cbnZhciBmaW5kID0gL1shJygpfl18JTIwL2c7XG5cbnZhciByZXBsYWNlID0ge1xuICAnISc6ICclMjEnLFxuICBcIidcIjogJyUyNycsXG4gICcoJzogJyUyOCcsXG4gICcpJzogJyUyOScsXG4gICd+JzogJyU3RScsXG4gICclMjAnOiAnKydcbn07XG5cbnZhciByZXBsYWNlciA9IGZ1bmN0aW9uIChtYXRjaCkge1xuICByZXR1cm4gcmVwbGFjZVttYXRjaF07XG59O1xuXG52YXIgc2VyaWFsaXplID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoaXQpLnJlcGxhY2UoZmluZCwgcmVwbGFjZXIpO1xufTtcblxudmFyIHBhcnNlU2VhcmNoUGFyYW1zID0gZnVuY3Rpb24gKHJlc3VsdCwgcXVlcnkpIHtcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBxdWVyeS5zcGxpdCgnJicpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIGF0dHJpYnV0ZSwgZW50cnk7XG4gICAgd2hpbGUgKGluZGV4IDwgYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICAgIGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNbaW5kZXgrK107XG4gICAgICBpZiAoYXR0cmlidXRlLmxlbmd0aCkge1xuICAgICAgICBlbnRyeSA9IGF0dHJpYnV0ZS5zcGxpdCgnPScpO1xuICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAga2V5OiBkZXNlcmlhbGl6ZShlbnRyeS5zaGlmdCgpKSxcbiAgICAgICAgICB2YWx1ZTogZGVzZXJpYWxpemUoZW50cnkuam9pbignPScpKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciB1cGRhdGVTZWFyY2hQYXJhbXMgPSBmdW5jdGlvbiAocXVlcnkpIHtcbiAgdGhpcy5lbnRyaWVzLmxlbmd0aCA9IDA7XG4gIHBhcnNlU2VhcmNoUGFyYW1zKHRoaXMuZW50cmllcywgcXVlcnkpO1xufTtcblxudmFyIHZhbGlkYXRlQXJndW1lbnRzTGVuZ3RoID0gZnVuY3Rpb24gKHBhc3NlZCwgcmVxdWlyZWQpIHtcbiAgaWYgKHBhc3NlZCA8IHJlcXVpcmVkKSB0aHJvdyBUeXBlRXJyb3IoJ05vdCBlbm91Z2ggYXJndW1lbnRzJyk7XG59O1xuXG52YXIgVVJMU2VhcmNoUGFyYW1zSXRlcmF0b3IgPSBjcmVhdGVJdGVyYXRvckNvbnN0cnVjdG9yKGZ1bmN0aW9uIEl0ZXJhdG9yKHBhcmFtcywga2luZCkge1xuICBzZXRJbnRlcm5hbFN0YXRlKHRoaXMsIHtcbiAgICB0eXBlOiBVUkxfU0VBUkNIX1BBUkFNU19JVEVSQVRPUixcbiAgICBpdGVyYXRvcjogZ2V0SXRlcmF0b3IoZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZShwYXJhbXMpLmVudHJpZXMpLFxuICAgIGtpbmQ6IGtpbmRcbiAgfSk7XG59LCAnSXRlcmF0b3InLCBmdW5jdGlvbiBuZXh0KCkge1xuICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbEl0ZXJhdG9yU3RhdGUodGhpcyk7XG4gIHZhciBraW5kID0gc3RhdGUua2luZDtcbiAgdmFyIHN0ZXAgPSBzdGF0ZS5pdGVyYXRvci5uZXh0KCk7XG4gIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gIGlmICghc3RlcC5kb25lKSB7XG4gICAgc3RlcC52YWx1ZSA9IGtpbmQgPT09ICdrZXlzJyA/IGVudHJ5LmtleSA6IGtpbmQgPT09ICd2YWx1ZXMnID8gZW50cnkudmFsdWUgOiBbZW50cnkua2V5LCBlbnRyeS52YWx1ZV07XG4gIH0gcmV0dXJuIHN0ZXA7XG59KTtcblxuLy8gYFVSTFNlYXJjaFBhcmFtc2AgY29uc3RydWN0b3Jcbi8vIGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jaW50ZXJmYWNlLXVybHNlYXJjaHBhcmFtc1xudmFyIFVSTFNlYXJjaFBhcmFtc0NvbnN0cnVjdG9yID0gZnVuY3Rpb24gVVJMU2VhcmNoUGFyYW1zKC8qIGluaXQgKi8pIHtcbiAgYW5JbnN0YW5jZSh0aGlzLCBVUkxTZWFyY2hQYXJhbXNDb25zdHJ1Y3RvciwgVVJMX1NFQVJDSF9QQVJBTVMpO1xuICB2YXIgaW5pdCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkO1xuICB2YXIgdGhhdCA9IHRoaXM7XG4gIHZhciBlbnRyaWVzID0gW107XG4gIHZhciBpdGVyYXRvck1ldGhvZCwgaXRlcmF0b3IsIHN0ZXAsIGVudHJ5SXRlcmF0b3IsIGZpcnN0LCBzZWNvbmQsIGtleTtcblxuICBzZXRJbnRlcm5hbFN0YXRlKHRoYXQsIHtcbiAgICB0eXBlOiBVUkxfU0VBUkNIX1BBUkFNUyxcbiAgICBlbnRyaWVzOiBlbnRyaWVzLFxuICAgIHVwZGF0ZVVSTDogZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9LFxuICAgIHVwZGF0ZVNlYXJjaFBhcmFtczogdXBkYXRlU2VhcmNoUGFyYW1zXG4gIH0pO1xuXG4gIGlmIChpbml0ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaXNPYmplY3QoaW5pdCkpIHtcbiAgICAgIGl0ZXJhdG9yTWV0aG9kID0gZ2V0SXRlcmF0b3JNZXRob2QoaW5pdCk7XG4gICAgICBpZiAodHlwZW9mIGl0ZXJhdG9yTWV0aG9kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGl0ZXJhdG9yID0gaXRlcmF0b3JNZXRob2QuY2FsbChpbml0KTtcbiAgICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgICAgIGVudHJ5SXRlcmF0b3IgPSBnZXRJdGVyYXRvcihhbk9iamVjdChzdGVwLnZhbHVlKSk7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKGZpcnN0ID0gZW50cnlJdGVyYXRvci5uZXh0KCkpLmRvbmUgfHxcbiAgICAgICAgICAgIChzZWNvbmQgPSBlbnRyeUl0ZXJhdG9yLm5leHQoKSkuZG9uZSB8fFxuICAgICAgICAgICAgIWVudHJ5SXRlcmF0b3IubmV4dCgpLmRvbmVcbiAgICAgICAgICApIHRocm93IFR5cGVFcnJvcignRXhwZWN0ZWQgc2VxdWVuY2Ugd2l0aCBsZW5ndGggMicpO1xuICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZmlyc3QudmFsdWUgKyAnJywgdmFsdWU6IHNlY29uZC52YWx1ZSArICcnIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgZm9yIChrZXkgaW4gaW5pdCkgaWYgKGhhc093bihpbml0LCBrZXkpKSBlbnRyaWVzLnB1c2goeyBrZXk6IGtleSwgdmFsdWU6IGluaXRba2V5XSArICcnIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJzZVNlYXJjaFBhcmFtcyhlbnRyaWVzLCB0eXBlb2YgaW5pdCA9PT0gJ3N0cmluZycgPyBpbml0LmNoYXJBdCgwKSA9PT0gJz8nID8gaW5pdC5zbGljZSgxKSA6IGluaXQgOiBpbml0ICsgJycpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIFVSTFNlYXJjaFBhcmFtc1Byb3RvdHlwZSA9IFVSTFNlYXJjaFBhcmFtc0NvbnN0cnVjdG9yLnByb3RvdHlwZTtcblxucmVkZWZpbmVBbGwoVVJMU2VhcmNoUGFyYW1zUHJvdG90eXBlLCB7XG4gIC8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmFwcGVudGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jZG9tLXVybHNlYXJjaHBhcmFtcy1hcHBlbmRcbiAgYXBwZW5kOiBmdW5jdGlvbiBhcHBlbmQobmFtZSwgdmFsdWUpIHtcbiAgICB2YWxpZGF0ZUFyZ3VtZW50c0xlbmd0aChhcmd1bWVudHMubGVuZ3RoLCAyKTtcbiAgICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFBhcmFtc1N0YXRlKHRoaXMpO1xuICAgIHN0YXRlLmVudHJpZXMucHVzaCh7IGtleTogbmFtZSArICcnLCB2YWx1ZTogdmFsdWUgKyAnJyB9KTtcbiAgICBzdGF0ZS51cGRhdGVVUkwoKTtcbiAgfSxcbiAgLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuZGVsZXRlYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyNkb20tdXJsc2VhcmNocGFyYW1zLWRlbGV0ZVxuICAnZGVsZXRlJzogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YWxpZGF0ZUFyZ3VtZW50c0xlbmd0aChhcmd1bWVudHMubGVuZ3RoLCAxKTtcbiAgICB2YXIgc3RhdGUgPSBnZXRJbnRlcm5hbFBhcmFtc1N0YXRlKHRoaXMpO1xuICAgIHZhciBlbnRyaWVzID0gc3RhdGUuZW50cmllcztcbiAgICB2YXIga2V5ID0gbmFtZSArICcnO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgd2hpbGUgKGluZGV4IDwgZW50cmllcy5sZW5ndGgpIHtcbiAgICAgIGlmIChlbnRyaWVzW2luZGV4XS5rZXkgPT09IGtleSkgZW50cmllcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgZWxzZSBpbmRleCsrO1xuICAgIH1cbiAgICBzdGF0ZS51cGRhdGVVUkwoKTtcbiAgfSxcbiAgLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuZ2V0YCBtZXRob2RcbiAgLy8gaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyNkb20tdXJsc2VhcmNocGFyYW1zLWdldFxuICBnZXQ6IGZ1bmN0aW9uIGdldChuYW1lKSB7XG4gICAgdmFsaWRhdGVBcmd1bWVudHNMZW5ndGgoYXJndW1lbnRzLmxlbmd0aCwgMSk7XG4gICAgdmFyIGVudHJpZXMgPSBnZXRJbnRlcm5hbFBhcmFtc1N0YXRlKHRoaXMpLmVudHJpZXM7XG4gICAgdmFyIGtleSA9IG5hbWUgKyAnJztcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGZvciAoOyBpbmRleCA8IGVudHJpZXMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBpZiAoZW50cmllc1tpbmRleF0ua2V5ID09PSBrZXkpIHJldHVybiBlbnRyaWVzW2luZGV4XS52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG4gIC8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmdldEFsbGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jZG9tLXVybHNlYXJjaHBhcmFtcy1nZXRhbGxcbiAgZ2V0QWxsOiBmdW5jdGlvbiBnZXRBbGwobmFtZSkge1xuICAgIHZhbGlkYXRlQXJndW1lbnRzTGVuZ3RoKGFyZ3VtZW50cy5sZW5ndGgsIDEpO1xuICAgIHZhciBlbnRyaWVzID0gZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZSh0aGlzKS5lbnRyaWVzO1xuICAgIHZhciBrZXkgPSBuYW1lICsgJyc7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgZm9yICg7IGluZGV4IDwgZW50cmllcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGlmIChlbnRyaWVzW2luZGV4XS5rZXkgPT09IGtleSkgcmVzdWx0LnB1c2goZW50cmllc1tpbmRleF0udmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuICAvLyBgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5oYXNgIG1ldGhvZFxuICAvLyBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI2RvbS11cmxzZWFyY2hwYXJhbXMtaGFzXG4gIGhhczogZnVuY3Rpb24gaGFzKG5hbWUpIHtcbiAgICB2YWxpZGF0ZUFyZ3VtZW50c0xlbmd0aChhcmd1bWVudHMubGVuZ3RoLCAxKTtcbiAgICB2YXIgZW50cmllcyA9IGdldEludGVybmFsUGFyYW1zU3RhdGUodGhpcykuZW50cmllcztcbiAgICB2YXIga2V5ID0gbmFtZSArICcnO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgd2hpbGUgKGluZGV4IDwgZW50cmllcy5sZW5ndGgpIHtcbiAgICAgIGlmIChlbnRyaWVzW2luZGV4KytdLmtleSA9PT0ga2V5KSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICAvLyBgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5zZXRgIG1ldGhvZFxuICAvLyBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI2RvbS11cmxzZWFyY2hwYXJhbXMtc2V0XG4gIHNldDogZnVuY3Rpb24gc2V0KG5hbWUsIHZhbHVlKSB7XG4gICAgdmFsaWRhdGVBcmd1bWVudHNMZW5ndGgoYXJndW1lbnRzLmxlbmd0aCwgMSk7XG4gICAgdmFyIHN0YXRlID0gZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZSh0aGlzKTtcbiAgICB2YXIgZW50cmllcyA9IHN0YXRlLmVudHJpZXM7XG4gICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgdmFyIGtleSA9IG5hbWUgKyAnJztcbiAgICB2YXIgdmFsID0gdmFsdWUgKyAnJztcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBlbnRyeTtcbiAgICBmb3IgKDsgaW5kZXggPCBlbnRyaWVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICAgIGlmIChlbnRyeS5rZXkgPT09IGtleSkge1xuICAgICAgICBpZiAoZm91bmQpIGVudHJpZXMuc3BsaWNlKGluZGV4LS0sIDEpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgZW50cnkudmFsdWUgPSB2YWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFmb3VuZCkgZW50cmllcy5wdXNoKHsga2V5OiBrZXksIHZhbHVlOiB2YWwgfSk7XG4gICAgc3RhdGUudXBkYXRlVVJMKCk7XG4gIH0sXG4gIC8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLnNvcnRgIG1ldGhvZFxuICAvLyBodHRwczovL3VybC5zcGVjLndoYXR3Zy5vcmcvI2RvbS11cmxzZWFyY2hwYXJhbXMtc29ydFxuICBzb3J0OiBmdW5jdGlvbiBzb3J0KCkge1xuICAgIHZhciBzdGF0ZSA9IGdldEludGVybmFsUGFyYW1zU3RhdGUodGhpcyk7XG4gICAgdmFyIGVudHJpZXMgPSBzdGF0ZS5lbnRyaWVzO1xuICAgIC8vIEFycmF5I3NvcnQgaXMgbm90IHN0YWJsZSBpbiBzb21lIGVuZ2luZXNcbiAgICB2YXIgc2xpY2UgPSBlbnRyaWVzLnNsaWNlKCk7XG4gICAgdmFyIGVudHJ5LCBlbnRyaWVzSW5kZXgsIHNsaWNlSW5kZXg7XG4gICAgZW50cmllcy5sZW5ndGggPSAwO1xuICAgIGZvciAoc2xpY2VJbmRleCA9IDA7IHNsaWNlSW5kZXggPCBzbGljZS5sZW5ndGg7IHNsaWNlSW5kZXgrKykge1xuICAgICAgZW50cnkgPSBzbGljZVtzbGljZUluZGV4XTtcbiAgICAgIGZvciAoZW50cmllc0luZGV4ID0gMDsgZW50cmllc0luZGV4IDwgc2xpY2VJbmRleDsgZW50cmllc0luZGV4KyspIHtcbiAgICAgICAgaWYgKGVudHJpZXNbZW50cmllc0luZGV4XS5rZXkgPiBlbnRyeS5rZXkpIHtcbiAgICAgICAgICBlbnRyaWVzLnNwbGljZShlbnRyaWVzSW5kZXgsIDAsIGVudHJ5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGVudHJpZXNJbmRleCA9PT0gc2xpY2VJbmRleCkgZW50cmllcy5wdXNoKGVudHJ5KTtcbiAgICB9XG4gICAgc3RhdGUudXBkYXRlVVJMKCk7XG4gIH0sXG4gIC8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZFxuICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrIC8qICwgdGhpc0FyZyAqLykge1xuICAgIHZhciBlbnRyaWVzID0gZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZSh0aGlzKS5lbnRyaWVzO1xuICAgIHZhciBib3VuZEZ1bmN0aW9uID0gYmluZChjYWxsYmFjaywgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIGVudHJ5O1xuICAgIHdoaWxlIChpbmRleCA8IGVudHJpZXMubGVuZ3RoKSB7XG4gICAgICBlbnRyeSA9IGVudHJpZXNbaW5kZXgrK107XG4gICAgICBib3VuZEZ1bmN0aW9uKGVudHJ5LnZhbHVlLCBlbnRyeS5rZXksIHRoaXMpO1xuICAgIH1cbiAgfSxcbiAgLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUua2V5c2AgbWV0aG9kXG4gIGtleXM6IGZ1bmN0aW9uIGtleXMoKSB7XG4gICAgcmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXNJdGVyYXRvcih0aGlzLCAna2V5cycpO1xuICB9LFxuICAvLyBgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS52YWx1ZXNgIG1ldGhvZFxuICB2YWx1ZXM6IGZ1bmN0aW9uIHZhbHVlcygpIHtcbiAgICByZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtc0l0ZXJhdG9yKHRoaXMsICd2YWx1ZXMnKTtcbiAgfSxcbiAgLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuZW50cmllc2AgbWV0aG9kXG4gIGVudHJpZXM6IGZ1bmN0aW9uIGVudHJpZXMoKSB7XG4gICAgcmV0dXJuIG5ldyBVUkxTZWFyY2hQYXJhbXNJdGVyYXRvcih0aGlzLCAnZW50cmllcycpO1xuICB9XG59LCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG5cbi8vIGBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlW0BAaXRlcmF0b3JdYCBtZXRob2RcbnJlZGVmaW5lKFVSTFNlYXJjaFBhcmFtc1Byb3RvdHlwZSwgSVRFUkFUT1IsIFVSTFNlYXJjaFBhcmFtc1Byb3RvdHlwZS5lbnRyaWVzKTtcblxuLy8gYFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUudG9TdHJpbmdgIG1ldGhvZFxuLy8gaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmxzZWFyY2hwYXJhbXMtc3RyaW5naWZpY2F0aW9uLWJlaGF2aW9yXG5yZWRlZmluZShVUkxTZWFyY2hQYXJhbXNQcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICB2YXIgZW50cmllcyA9IGdldEludGVybmFsUGFyYW1zU3RhdGUodGhpcykuZW50cmllcztcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgZW50cnk7XG4gIHdoaWxlIChpbmRleCA8IGVudHJpZXMubGVuZ3RoKSB7XG4gICAgZW50cnkgPSBlbnRyaWVzW2luZGV4KytdO1xuICAgIHJlc3VsdC5wdXNoKHNlcmlhbGl6ZShlbnRyeS5rZXkpICsgJz0nICsgc2VyaWFsaXplKGVudHJ5LnZhbHVlKSk7XG4gIH0gcmV0dXJuIHJlc3VsdC5qb2luKCcmJyk7XG59LCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG5cbnNldFRvU3RyaW5nVGFnKFVSTFNlYXJjaFBhcmFtc0NvbnN0cnVjdG9yLCBVUkxfU0VBUkNIX1BBUkFNUyk7XG5cbiQoeyBnbG9iYWw6IHRydWUsIGZvcmNlZDogIVVTRV9OQVRJVkVfVVJMIH0sIHtcbiAgVVJMU2VhcmNoUGFyYW1zOiBVUkxTZWFyY2hQYXJhbXNDb25zdHJ1Y3RvclxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBVUkxTZWFyY2hQYXJhbXM6IFVSTFNlYXJjaFBhcmFtc0NvbnN0cnVjdG9yLFxuICBnZXRTdGF0ZTogZ2V0SW50ZXJuYWxQYXJhbXNTdGF0ZVxufTtcbiIsInZhciBzdXBwb3J0ID0ge1xuICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICBibG9iOlxuICAgICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmXG4gICAgJ0Jsb2InIGluIHNlbGYgJiZcbiAgICAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbn1cblxuZnVuY3Rpb24gaXNEYXRhVmlldyhvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBEYXRhVmlldy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihvYmopXG59XG5cbmlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gIHZhciB2aWV3Q2xhc3NlcyA9IFtcbiAgICAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgJ1tvYmplY3QgVWludDMyQXJyYXldJyxcbiAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAnW29iamVjdCBGbG9hdDY0QXJyYXldJ1xuICBdXG5cbiAgdmFyIGlzQXJyYXlCdWZmZXJWaWV3ID1cbiAgICBBcnJheUJ1ZmZlci5pc1ZpZXcgfHxcbiAgICBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgIH1cbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gIH1cbiAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgfVxuICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gIH1cbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG5mdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICB9XG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpdGVyYXRvclxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpdGVyYXRvclxufVxuXG5leHBvcnQgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gIHRoaXMubWFwID0ge31cblxuICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgIH0sIHRoaXMpXG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHRoaXMuYXBwZW5kKGhlYWRlclswXSwgaGVhZGVyWzFdKVxuICAgIH0sIHRoaXMpXG4gIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICB9LCB0aGlzKVxuICB9XG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gIHZhciBvbGRWYWx1ZSA9IHRoaXMubWFwW25hbWVdXG4gIHRoaXMubWFwW25hbWVdID0gb2xkVmFsdWUgPyBvbGRWYWx1ZSArICcsICcgKyB2YWx1ZSA6IHZhbHVlXG59XG5cbkhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXMubWFwW25hbWVdLCBuYW1lLCB0aGlzKVxuICAgIH1cbiAgfVxufVxuXG5IZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpdGVtcyA9IFtdXG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgIGl0ZW1zLnB1c2gobmFtZSlcbiAgfSlcbiAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxufVxuXG5IZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGl0ZW1zID0gW11cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaXRlbXMucHVzaCh2YWx1ZSlcbiAgfSlcbiAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxufVxuXG5IZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpdGVtcyA9IFtdXG4gIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgIGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSlcbiAgfSlcbiAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxufVxuXG5pZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xufVxuXG5mdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICB9XG4gIGJvZHkuYm9keVVzZWQgPSB0cnVlXG59XG5cbmZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICB9XG4gICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICByZXR1cm4gcHJvbWlzZVxufVxuXG5mdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgcmV0dXJuIHByb21pc2Vcbn1cblxuZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgIGNoYXJzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3W2ldKVxuICB9XG4gIHJldHVybiBjaGFycy5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgaWYgKGJ1Zi5zbGljZSkge1xuICAgIHJldHVybiBidWYuc2xpY2UoMClcbiAgfSBlbHNlIHtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKVxuICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZikpXG4gICAgcmV0dXJuIHZpZXcuYnVmZmVyXG4gIH1cbn1cblxuZnVuY3Rpb24gQm9keSgpIHtcbiAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgaWYgKCFib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpXG4gICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgdGhpcy5fYm9keUluaXQgPSBuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSlcbiAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgKEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpIHx8IGlzQXJyYXlCdWZmZXJWaWV3KGJvZHkpKSkge1xuICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5ID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGJvZHkpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgIH1cbiAgfVxuXG4gIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgIH1cbiAgfVxuXG4gIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbnZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICByZXR1cm4gbWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEgPyB1cGNhc2VkIDogbWV0aG9kXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG5cbiAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICB9XG4gICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgdGhpcy5zaWduYWwgPSBpbnB1dC5zaWduYWxcbiAgICBpZiAoIWJvZHkgJiYgaW5wdXQuX2JvZHlJbml0ICE9IG51bGwpIHtcbiAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgfVxuXG4gIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ3NhbWUtb3JpZ2luJ1xuICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gIH1cbiAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICB0aGlzLnNpZ25hbCA9IG9wdGlvbnMuc2lnbmFsIHx8IHRoaXMuc2lnbmFsXG4gIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgfVxuICB0aGlzLl9pbml0Qm9keShib2R5KVxufVxuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywge2JvZHk6IHRoaXMuX2JvZHlJbml0fSlcbn1cblxuZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICBib2R5XG4gICAgLnRyaW0oKVxuICAgIC5zcGxpdCgnJicpXG4gICAgLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gIHJldHVybiBmb3JtXG59XG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVycyhyYXdIZWFkZXJzKSB7XG4gIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKVxuICAvLyBSZXBsYWNlIGluc3RhbmNlcyBvZiBcXHJcXG4gYW5kIFxcbiBmb2xsb3dlZCBieSBhdCBsZWFzdCBvbmUgc3BhY2Ugb3IgaG9yaXpvbnRhbCB0YWIgd2l0aCBhIHNwYWNlXG4gIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MjMwI3NlY3Rpb24tMy4yXG4gIHZhciBwcmVQcm9jZXNzZWRIZWFkZXJzID0gcmF3SGVhZGVycy5yZXBsYWNlKC9cXHI/XFxuW1xcdCBdKy9nLCAnICcpXG4gIHByZVByb2Nlc3NlZEhlYWRlcnMuc3BsaXQoL1xccj9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCc6JylcbiAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKClcbiAgICBpZiAoa2V5KSB7XG4gICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGhlYWRlcnNcbn1cblxuQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1cyA9PT0gdW5kZWZpbmVkID8gMjAwIDogb3B0aW9ucy5zdGF0dXNcbiAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICB0aGlzLnN0YXR1c1RleHQgPSAnc3RhdHVzVGV4dCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzVGV4dCA6ICdPSydcbiAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxufVxuXG5Cb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG5SZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgdXJsOiB0aGlzLnVybFxuICB9KVxufVxuXG5SZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICByZXR1cm4gcmVzcG9uc2Vcbn1cblxudmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cblJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgfVxuXG4gIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxufVxuXG5leHBvcnQgdmFyIERPTUV4Y2VwdGlvbiA9IHNlbGYuRE9NRXhjZXB0aW9uXG50cnkge1xuICBuZXcgRE9NRXhjZXB0aW9uKClcbn0gY2F0Y2ggKGVycikge1xuICBET01FeGNlcHRpb24gPSBmdW5jdGlvbihtZXNzYWdlLCBuYW1lKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB2YXIgZXJyb3IgPSBFcnJvcihtZXNzYWdlKVxuICAgIHRoaXMuc3RhY2sgPSBlcnJvci5zdGFja1xuICB9XG4gIERPTUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSlcbiAgRE9NRXhjZXB0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IERPTUV4Y2VwdGlvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2goaW5wdXQsIGluaXQpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG5cbiAgICBpZiAocmVxdWVzdC5zaWduYWwgJiYgcmVxdWVzdC5zaWduYWwuYWJvcnRlZCkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgRE9NRXhjZXB0aW9uKCdBYm9ydGVkJywgJ0Fib3J0RXJyb3InKSlcbiAgICB9XG5cbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgIGZ1bmN0aW9uIGFib3J0WGhyKCkge1xuICAgICAgeGhyLmFib3J0KClcbiAgICB9XG5cbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJylcbiAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICB9XG5cbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICB9XG5cbiAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgIH1cblxuICAgIHhoci5vbmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZWplY3QobmV3IERPTUV4Y2VwdGlvbignQWJvcnRlZCcsICdBYm9ydEVycm9yJykpXG4gICAgfVxuXG4gICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdvbWl0Jykge1xuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICB9XG5cbiAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgfSlcblxuICAgIGlmIChyZXF1ZXN0LnNpZ25hbCkge1xuICAgICAgcmVxdWVzdC5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydFhocilcblxuICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBET05FIChzdWNjZXNzIG9yIGZhaWx1cmUpXG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgIHJlcXVlc3Quc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRYaHIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICB9KVxufVxuXG5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcblxuaWYgKCFzZWxmLmZldGNoKSB7XG4gIHNlbGYuZmV0Y2ggPSBmZXRjaFxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUG9seWZpbGwgZm9yIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMoKVxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvbWF0Y2hlcyNQb2x5ZmlsbFxuICovXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5pZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpXG4gIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPVxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgRWxlbWVudC5wcm90b3R5cGUub01hdGNoZXNTZWxlY3RvciB8fFxuICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxuICAgIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGxldCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KVxuICAgICAgICAucXVlcnlTZWxlY3RvckFsbChzKTtcbiAgICAgIGxldCBpID0gbWF0Y2hlcy5sZW5ndGg7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZW1wdHlcbiAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IHRoaXMpIHt9XG4gICAgICByZXR1cm4gaSA+IC0xO1xuICAgIH07XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUG9seWZpbGwgZm9yIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QoKVxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvY2xvc2VzdCNQb2x5ZmlsbFxuICovXG5cbmlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3Rvcjtcbn1cblxuaWYgKCFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihzKSB7XG4gICAgdmFyIGVsID0gdGhpcztcblxuICAgIGRvIHtcbiAgICAgIGlmIChlbC5tYXRjaGVzKHMpKSByZXR1cm4gZWw7XG4gICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQgfHwgZWwucGFyZW50Tm9kZTtcbiAgICB9IHdoaWxlIChlbCAhPT0gbnVsbCAmJiBlbC5ub2RlVHlwZSA9PT0gMSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFBvbHlmaWxsIGZvciBFbGVtZW50LnByb3RvdHlwZS5yZW1vdmUoKVxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NoaWxkTm9kZS9yZW1vdmUjUG9seWZpbGxcbiAqL1xuXG4oZnVuY3Rpb24oYXJyKSB7XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICBpZiAoaXRlbS5oYXNPd25Qcm9wZXJ0eSgncmVtb3ZlJykpIHJldHVybjtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdGVtLCAncmVtb3ZlJywge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50Tm9kZSAhPT0gbnVsbClcbiAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSkoW1xuICBFbGVtZW50LnByb3RvdHlwZSxcbiAgQ2hhcmFjdGVyRGF0YS5wcm90b3R5cGUsXG4gIERvY3VtZW50VHlwZS5wcm90b3R5cGVcbl0pO1xuLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuIl0sIm5hbWVzIjpbImdsb2JhbCIsImNsYXNzb2YiLCJJbmRleGVkT2JqZWN0IiwiZG9jdW1lbnQiLCJERVNDUklQVE9SUyIsImNyZWF0ZUVsZW1lbnQiLCJJRThfRE9NX0RFRklORSIsInByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlIiwiZGVmaW5lUHJvcGVydHlNb2R1bGUiLCJuYXRpdmVGdW5jdGlvblRvU3RyaW5nIiwiV2Vha01hcCIsImhhcyIsIk5BVElWRV9XRUFLX01BUCIsIm9iamVjdEhhcyIsIkludGVybmFsU3RhdGVNb2R1bGUiLCJyZXF1aXJlJCQwIiwibWluIiwiaGlkZGVuS2V5cyIsImludGVybmFsT2JqZWN0S2V5cyIsImdldE93blByb3BlcnR5TmFtZXNNb2R1bGUiLCJnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJpc0ZvcmNlZCIsImFGdW5jdGlvbiIsIlN5bWJvbCIsInN0b3JlIiwiTkFUSVZFX1NZTUJPTCIsImNyZWF0ZU1ldGhvZCIsImJpbmQiLCIkIiwiZm9yRWFjaCIsImFyZ3VtZW50cyIsImFzc2lnbiIsIlRPX1NUUklOR19UQUciLCJ0b1N0cmluZyIsIlNQRUNJRVMiLCJJdGVyYXRvcnMiLCJJVEVSQVRPUiIsInNldCIsInJlcXVpcmUkJDEiLCJwcm9jZXNzIiwiUHJvbWlzZSIsInRhc2siLCJOYXRpdmVQcm9taXNlIiwiVHlwZUVycm9yIiwibmV3UHJvbWlzZUNhcGFiaWxpdHkiLCJuZXdQcm9taXNlQ2FwYWJpbGl0eU1vZHVsZSIsIklTX05PREUiLCJJU19QVVJFIiwibm90aWZ5IiwiaXRlcmF0ZSIsIk9iamVjdFByb3RvdHlwZSIsIkNPUlJFQ1RfUFJPVE9UWVBFX0dFVFRFUiIsImdldFByb3RvdHlwZU9mIiwiSUVfUFJPVE8iLCJkZWZpbmVQcm9wZXJ0aWVzIiwiSXRlcmF0b3JQcm90b3R5cGUiLCJyZXR1cm5UaGlzIiwiY3JlYXRlIiwiSXRlcmF0b3JzQ29yZSIsIkJVR0dZX1NBRkFSSV9JVEVSQVRPUlMiLCJzZXRQcm90b3R5cGVPZiIsInNldEludGVybmFsU3RhdGUiLCJnZXRJbnRlcm5hbFN0YXRlIiwiRE9NSXRlcmFibGVzIiwiQXJyYXlQcm90b3R5cGUiLCJBcnJheUl0ZXJhdG9yTWV0aG9kcyIsIkNPTExFQ1RJT05fTkFNRSIsIkNvbGxlY3Rpb24iLCJDb2xsZWN0aW9uUHJvdG90eXBlIiwiaGFzT3duIiwiVVNFX05BVElWRV9VUkwiLCJFbGVtZW50IiwicHJvdG90eXBlIiwibWF0Y2hlcyIsIm1hdGNoZXNTZWxlY3RvciIsIm1vek1hdGNoZXNTZWxlY3RvciIsIm1zTWF0Y2hlc1NlbGVjdG9yIiwib01hdGNoZXNTZWxlY3RvciIsIndlYmtpdE1hdGNoZXNTZWxlY3RvciIsInMiLCJvd25lckRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImkiLCJsZW5ndGgiLCJpdGVtIiwiY2xvc2VzdCIsImVsIiwicGFyZW50RWxlbWVudCIsInBhcmVudE5vZGUiLCJub2RlVHlwZSIsImFyciIsImhhc093blByb3BlcnR5IiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwid3JpdGFibGUiLCJ2YWx1ZSIsInJlbW92ZSIsInJlbW92ZUNoaWxkIiwiQ2hhcmFjdGVyRGF0YSIsIkRvY3VtZW50VHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0NB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
