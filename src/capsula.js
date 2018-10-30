/*
Copyright 2018 SOL Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

/**
 * @file Capsula.js module introduces the encapsulation model and all the essential concepts of the Capsula library. Read [more]{@link module:capsula}.
 * @copyright 2018 SOL Software
 * @license Apache-2.0
 * @since 0.1.0
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./services'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./services'));
    } else {
        root.capsula = factory(root.services); // File name and the exported global should have matching names.
    }
}
    (this, function (services) {

        'use strict';

        /**
         * ID generator for all types of entities (Capsules, Operations, Hooks, and Loops).
         *
         * @private
         */
        var idGen_ = 0;

        /**
         * Base class for storing private information for all types of entities.
         *
         * @class
         * @memberof module:capsula
         * @private
         */
        function PrivateData_() {
            /**
             * The id of this entity.
             *
             * @type {number}
             */
            this.id = ++idGen_;

            /**
             * The name of this entity (operation, hook, loop, or part (capsule)).
             *
             * @type {string}
             */
            this.name = null;

            /**
             * The owner of this entity (operations, hooks, and loops all belong to a capsule, while capsules also belong (as parts) to thier parent capsule).
             *
             * @type {module:capsula.Capsule}
             */
            this.owner = null;
        }

        /**
         * Capsule-specific private information.
         *
         * @class
         * @memberof module:capsula
         * @private
         */
        function CapsuleData_() {
            PrivateData_.call(this);

            /**
             * The collection of part capsules of this capsule.
             *
             * @type {Capsule[]}
             */
            this.parts = [];

            /**
             * The collection of operations of this capsule.
             *
             * @type {Input[]|Output[]}
             */
            this.pins = [];

            /**
             * The collection of hooks of this capsule.
             *
             * @type {Hook[]}
             */
            this.hooks = [];

            /**
             * The collection of loops of this capsule.
             *
             * @type {Loop[]}
             */
            this.loops = [];

            /**
             * Currently executing operation.
             *
             * @type {Operation}
             */
            this.currentOperation = null;

            /**
             * Currently valid super prototype.
             *
             * @type {Object}
             */
            this.superPrototype = null;
        }

        CapsuleData_.prototype = Object.create(PrivateData_.prototype);

        /**
         * Operation-specific private information.
         *
         * @class
         * @memberof module:capsula
         * @private
         */
        function OperationData_() {
            PrivateData_.call(this);

            /**
             * Is this operation an input or an output?
             *
             * @type {boolean}
             */
            this.isInput = false;

            /**
             * The collection of target operations.
             *
             * @type {Input[]|Output[]}
             */
            this.targets = [];

            /**
             * Is this operation enabled on entry?
             *
             * @type {boolean}
             */
            this.entryEnabled = true;

            /**
             * Is this operation enabled on exit?
             *
             * @type {boolean}
             */
            this.exitEnabled = true;

            /**
             * This operation's entry filter.
             *
             * @type {Function|Object[]|STOP}
             */
            this.entryPipe = null;

            /**
             * This operation's exit filter.
             *
             * @type {Function|Object[]|STOP}
             */
            this.exitPipe = null;

            /**
             * This operation's last received value on entry.
             *
             * @type {Object[]}
             */
            this.entryLastVal = null;

            /**
             * This operation's last sent exit value.
             *
             * @type {Object[]}
             */
            this.exitLastVal = null;

            /**
             * Result of calling this operation could be a single value or multiple values. In case of a single value, the value could be unpacked or packed (returned inside an array, just like in the case of multiple values). This flag specifies the way single value is returned.
             *
             * @type {boolean}
             */
            this.unpack = true;
        }

        OperationData_.prototype = Object.create(PrivateData_.prototype);

        /**
         * Hook- and Loop-specific private information.
         *
         * @class
         * @memberof module:capsula
         * @private
         */
        function HookLoopData_() {
            PrivateData_.call(this);

            /**
             * The parent hook or loop of this hook or loop.
             *
             * @type {Hook|Loop}
             */
            this.up = null;

            /**
             * The children collection of hooks and loops.
             *
             * @type {Array.<Hook|Loop>}
             */
            this.children = [];

            /**
             * The element of this hook or loop.
             *
             * @type {Object}
             */
            this.el = null;

            /**
             * The handler function called when the chain of this hook or loop is completed.
             *
             * @type {Function}
             */
            this.onHook = null;

            /**
             * The handler function called when the chain of this hook or loop is destructured.
             *
             * @type {Function}
             */
            this.offHook = null;

            /**
             * ElementRef capsule created in renderInto.
             *
             * @type {ElementRef}
             */
            this.parentRef = null;
        }

        HookLoopData_.prototype = Object.create(PrivateData_.prototype);

        /**
         * Hook-specific private information.
         *
         * @class
         * @memberof module:capsula
         * @private
         */
        function HookData_() {
            HookLoopData_.call(this);

            /**
             * The class of this hook. In HTML domain, this is the CSS class which is being added to all child elements when the chain is completed and removed when the chain is destructured.
             *
             * @type {string}
             */
            this.cls = null;
        }

        HookData_.prototype = Object.create(HookLoopData_.prototype);

        /**
         * Loop-specific private information.
         *
         * @class
         * @memberof module:capsula
         * @private
         */
        function LoopData_() {
            HookLoopData_.call(this);
        }

        LoopData_.prototype = Object.create(HookLoopData_.prototype);

        /**
         * Capsule-specific private information.
         *
         * @class
         * @memberof module:capsula
         * @private
         */
        function DataData_() {
            PrivateData_.call(this);

            /**
             * The private information of this data.
             *
             * @type {Object}
             */
            this.data;
        }

        DataData_.prototype = Object.create(PrivateData_.prototype);

        /**
         * @classdesc Capsule class is an abstract base class in the hierarchy of capsule classes.
         *
         * @abstract
         * @class
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         */
        function Capsule() {
            var privateData = new CapsuleData_();
            privateData.name = 'c_' + privateData.id;
            this._ = privateData;
        }

        /**
         * @private
         */
        function Operation_(func, isInput) {
            var that;
            if (isInput)
                that = function Input() {
                    return operationImpl_(that, arguments);
                };
            else
                that = function Output() {
                    return operationImpl_(that, arguments);
                };
            Object.setPrototypeOf(that, oProto_);

            var privateData = new OperationData_();
            privateData.name = 'o_' + privateData.id;
            privateData.owner = ctx_;
            privateData.owner._.pins.push(that);
            privateData.isInput = isInput ? true : false;
            if (typeof func === 'function')
                privateData.targets.push(func);
            privateData.call = function (var_args) { // calls operation without context check
                return operationImplNoContextCheck_(that, arguments);
            };
            privateData.send = function (var_args) {
                return sendNoCheck_(that, arguments);
            };
            that._ = privateData;
            return that;
        }

        var oProto_ = Object.create(Function.prototype);

        /**
         * @abstract
         * @class
         * @classdesc Operation is [capsule's]{@link module:capsula.Capsule} public property. It is like a method (or function) and much more. It can be used either by calling it (just like a method) or by calling methods on it (to exploit its additional features). For example, if o is an operation it is meant to be called like this: <code>o(optional_arguments)</code>. But it can also be used as an object to call methods on it, for example <code>o.getName()</code>. By default, calling an operation does nothing, but this can be changed by "wiring" (connecting) operation to other operations or methods that do something. Wiring operation to other operations or methods actually specifies propagation of operation (method) calls. The result of calling an operation is a combined result of all operations and methods downstream.
         * <p> Operation can either be [input]{@link module:capsula.Input} or [output]{@link module:capsula.Output}. Input operation serves as a propagator of calls from the outside towards the inside of the capsule the operation is property of. Output operation does the opposite, it serves as a propagator of calls from the inside towards the outside of its capsule.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         */
        function Operation() {}
        // This is just for documentation purposes, to tell JSDoc about Input/Output methods using Operation.prototype.
        Operation.prototype = oProto_;

        /**
         * Creates new input operation as a property of the capsule that represents the current context of execution.
         *
         * @param {Function} [opt_function] - optional function that gets called every time input operation gets called, i.e. it is a sort of implementation of the input operation to be created
         * @class
         * @classdesc
         * <ul>
         * <li> [Operation]{@link module:capsula.Operation}
         * <ul>
         * <li> Input
         * </ul>
         * </ul>
         * <p> Input operation is a specific public property of a [capsule]{@link module:capsula.Capsule}. Input operation serves as a propagator of calls from the outside towards the inside of the capsule that owns the operation. Input operations go along with output operations; they are complementary concepts.
         *
         * @memberof module:capsula
         * @see {@link module:capsula.Operation}
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}
         */
        function Input(opt_function) {
            return Operation_(opt_function, true);
        }

        /**
         * Creates new output operation as a property of the capsule that represents the current context of execution.
         *
         * @class
         * @classdesc
         * <ul>
         * <li> [Operation]{@link module:capsula.Operation}
         * <ul>
         * <li> Output
         * </ul>
         * </ul>
         * <p> Output operation is a specific public property of a [capsule]{@link module:capsula.Capsule}. Output operation serves as a propagator of calls from the inside towards the outside of its owner capsule. Output operations go along with input operations; they are complementary concepts.
         *
         * @memberof module:capsula
         * @see {@link module:capsula.Operation}
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}
         */
        function Output() {
            return Operation_(null, false);
        }

        /**
         * Creates new hook as a property of the capsule that represents the current context of execution.
         *
         * @class
         * @classdesc Hook is a specific public property of a [capsule]{@link module:capsula.Capsule}. It is a representation of a parent element in a hierarchical structure of elements (e.x. widgets). In other words, it represents a parent in a parent-child relationship.
         * <p> Hooks always go along with loops; they are complementary concepts.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}
         */
        function Hook() {
            var that = Object.create(Hook.prototype);
            var privateData = new HookData_();
            privateData.name = 'h_' + privateData.id;
            privateData.owner = ctx_;
            privateData.owner._.hooks.push(that);
            that._ = privateData;
            return that;
        }

        /**
         * Creates new loop as a property of the capsule that represents the current context of execution.
         *
         * @class
         * @classdesc Loop is a specific public property of a [capsule]{@link module:capsula.Capsule}. It is a representation of a child element in a hierarchical structure of elements (e.x. widgets). In other words, it represents a child in a parent-child relationship.
         * <p> Loops always go along with hooks; they are complementary concepts.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}
         */
        function Loop() {
            var that = Object.create(Loop.prototype);
            var privateData = new LoopData_();
            privateData.name = 'l_' + privateData.id;
            privateData.owner = ctx_;
            privateData.owner._.loops.push(that);
            that._ = privateData;
            return that;
        }

        /**
         * Creates new data as a property of the capsule that represents the current context of execution.
         *
         * @class
         * @classdesc Data is a specific public property of a [capsule]{@link module:capsula.Capsule}. It serves to store the given information and to protect them from illegal access.
         *
         * @param {Object} [opt_data] - information to store and protect
         * @memberof module:capsula
         * @public
         * @since 0.2.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        function Data(opt_data) {
            var that = Object.create(Data.prototype);
            var privateData = new DataData_();
            privateData.name = 'd_' + privateData.id;
            privateData.owner = ctx_;
            privateData.data = opt_data;
            that._ = privateData;
            return that;
        }

        // *****************************
        // Context
        // *****************************

        /**
         * Context is a Capsule instance that is currently running. Fundamental
         * rule: the interior of a Capsule instance cannot be affected outside the
         * context of the same instance. Current context reference.
         * @private
         */
        var ctx_;

        /**
         * @private
         */
        function switchContext_(newCtx, oldCtx) {
            if (newCtx === oldCtx)
                return;

            ctx_ = newCtx;
        }

        /**
         * Executes a given function in the context of a given capsule.
         * @private
         */
        function executeInContext_(fn, newCtx, self, args) {
            var oldCtx = ctx_;
            switchContext_(newCtx, oldCtx);
            try {
                return fn.apply(self, args);
            } catch (e) {
                return handleError_(e);
            }
            finally {
                switchContext_(oldCtx, newCtx);
            }
        }

        /**
         * @private
         */
        function doInContext_(f1, f2, obj, args) {
            if (obj._.owner === ctx_)
                if (typeof f1 === 'function')
                    return f1.apply(obj, args);
                else
                    return f1;
            else if (obj._.owner._.owner === ctx_)
                if (typeof f2 === 'function')
                    return f2.apply(obj, args);
                else
                    return f2;
            else
                checkContextOrSubProperty_(obj);
        }

        /**
         * Creates and returns new contextualized function that "remembers" the context in which this function (contextualize) is called. When called, the returned function executes the function being an argument of contextualize within that "remembered" context.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param f {Function} - function to be executed by the returned contextualized function in the context in which contextualize is called
         * @returns {Function} contextualized function that executes the given function in the context in which contextualize is called
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}
         */
        function contextualize(f) {
            if (typeof f !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure f is a function.'));
            return contextWrapper_(f, ctx_);
        }

        // *****************************
        // When capsule class is created (defCapsule({...}))
        // *****************************

        /**
         * @private
         */
        var defaultInit_ = function init() {
            var superiorPrototype = this.superior();
            if (superiorPrototype !== Capsule.prototype)
                superiorPrototype.init.apply(this, arguments);
        };

        /**
         * Creates and returns a capsule constructor function based on the given capsule (class) definition object.
         *
         * @example <caption>The simplest possible capsule (class)</caption>
         * let TheSimplest = sol.defCapsule({}); // creates capsule class
         * let capsule = new TheSimplest();      // creates capsule object
         *
         * @example <caption>Simple capsule (class) with two operations, hook, and loop</caption>
         * let Simple = sol.defCapsule({
         *     '> in': null,  // an input operation named in
         *     '< out': null, // an output operation named out
         *     hooks: 'h',    // a hook named h
         *     loops: 'l'     // a loop named l
         * });
         *
         * @example <caption>Full-featured capsule (class)</caption>
         * var FullFeatured = sol.defCapsule({
         *     isAbstract: false, // or true (to prevent creation of direct instances)
         *     base: TheSimplest, // inherit from TheSimplest
         *     init: function(){  // the constructor function
         *         // ...
         *     },
         *     handle: function(error){ // error handler function, for all errors thrown inside this capsule
         *         // ...
         *     },
         *
         *     // hooks and loops
         *     hooks: ['h1', 'h2'], // an array of hooks, or a single string in case of a single hook
         *     loops: 'l1',         // an array of loops, or a single string in case of a single loop
         *
         *     // input declarations
         *
         *     '> in1': null,       // declaration of an input operation
         *     '> in2': function(){ // input operation wired to a protected method with the same name
         *         return 'Hi';
         *     },
         *     '> in3': 'this.out1',            // input operation wired to an existing output operation
         *     '> in4': ['this.out1', 'p1.in'], // input operation wired to several existing output operations
         *
         *     // output declarations
         *
         *     '< out1': null,                   // declaration of an output operation
         *     '< out2': function(arg1, arg2){}, // operation parameters declaratively listed, the body does not count
         *
         *     // filters
         *
         *     'f this.in1': function(){ // operation filter returning an array of filtered values
         *         return [...];
         *     },
         *     'f this.in2': function(){ // operation filter preventing propagation of operation calls
         *         return sol.STOP;
         *     },
         *
         *     // public and protected methods
         *
         *     '+ publicMethod': function(){ // declaration of public method
         *         return 'Hi';
         *     },
         *     privateMethod: function(){    // declaration of protected method
         *         return 'Hello world';
         *     },
         *
         *     // part declarations
         *     p1: Part,             // no arguments
         *     p2: {                 // the same as above
         *         capsule: Part
         *     },
         *     p3: {                 // fixed arguments
         *         capsule: Part,
         *         args: 'Hi world'  // args or arguments (can be used interchangeably)
         *     },
         *     p4: {                 // the same arguments used for instantiation of this (FullFeatured) capsule
         *         capsule: Part,
         *         args: 'this.args'
         *     },
         *     p5: {                 // the FullFeatured capsule instance (this) given as an argument
         *         capsule: Part,
         *         args: 'this'
         *     },
         *     p6: {                 // arguments created "on spot" using function
         *         capsule: Part,
         *         deferredArgs: function(){
         *             return {message: 'Hello world'};
         *         }
         *     },
         *
         *     // wires
         *
         *     'this.in1': ['this.out1', 'p1.in'],
         *     'this.in2': 'this.out2',
         *     'p2.out': 'this.out1',
         *     'p3.out': ['this.out2', 'p4.in'],
         *
         *     // ties
         *
         *     'this.l1': 'p1.l',
         *     'p1.h': ['p2.l', 'p3.l', 'this.h1'],
         *
         *     // data
         *
         *     sharedInitialValue: {...}, // all instances share the same value (object, array, or whatever), but the reference is not static, it is just initialized with the same value for each FullFeatured capsule
         *
         *     myObject: '*{}',        // each capsule gets its own Object in myObject
         *     myArray: '*[]',         // each capsule gets its own Array in myArray
         *     myMap: '*Map',          // each capsule gets its own Map in myMap
         *     mySet: '*Set',          // each capsule gets its own Set in mySet
         *     myWeakMap: '*WeakMap',  // each capsule gets its own WeakMap in myWeakMap
         *     myWeakSet: '*WeakSet',  // each capsule gets its own WeakSet in myWeakSet
         *
         *     myData: {               // general case for data
         *         call: function(){   // "call" can be replaced with "new" if the function is to be called using the "new" operator
         *             return ...;     // myData becomes what is returned here
         *         },
         *         args: ...           // (arguments / deferredArgs) arguments for the function above it; the same as with parts (see above)
         *     },
         * });
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param def {Object} - capsule (class) definition object
         * @returns {Function} capsule constructor function
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [DUPLICATE_NAME]{@link module:capsula.Errors.DUPLICATE_NAME}, [ILLEGAL_METHODS_VISIBILITY]{@link module:capsula.Errors.ILLEGAL_METHODS_VISIBILITY}, [ELEMENT_NOT_FOUND]{@link module:capsula.Errors.ELEMENT_NOT_FOUND}, [WIRE_INCOMPATIBILITY]{@link module:capsula.Errors.WIRE_INCOMPATIBILITY}, [TIE_INCOMPATIBILITY]{@link module:capsula.Errors.TIE_INCOMPATIBILITY}
         */
        function defCapsule(def) {
            var CapsuleClass = function CapsuleClass() {
                var that,
                cd = CapsuleClass.compiledDef;
                if (!this || !this.isCapsuleConstructed) {
                    if (cd.isAbstract)
                        throw new Error(Errors.ABSTRACT_INSTANTIATION.toString());
                    that = Object.create(CapsuleClass.prototype);
                    Object.defineProperty(that, 'isCapsuleConstructed', {
                        value: true,
                        writeable: false,
                        enumerable: false
                    });
                } else {
                    throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'this\' is not an already constructed capsule.'));
                }

                Capsule.apply(that, arguments);

                var args = arguments,
                c = ctx_;
                executeInContext_(function () {
                    newInterface_(that, cd.inputs, Input);
                    newInterface_(that, cd.outputs, Output);
                    newInterface_(that, cd.hooks, Hook);
                    newInterface_(that, cd.loops, Loop);
                    newPublicMethods_(that, cd.publicMethods);
                    newTargets_(that, cd.inputs);
                    newParts_(that, cd.parts, args);
                    newData_(that, cd.data, args);
                    newFilters_(that, cd.filters);
                    newWires_(that, cd.wires);
                    newTies_(that, cd.ties);
                    newUnclassified_(that, cd.unclassified);
                    if (c != null) { // this should be done before init is called
                        that._.owner = c;
                        c._.parts.push(that);
                    }
                    that.init.apply(that, args);
                    if (c != null && typeof that.onAttach === 'function')
                        executeInContext_(that.onAttach, that, that);
                }, that);

                return that;
            };

            var compiledDef = compileDef_(def);
            CapsuleClass.compiledDef = compiledDef;
            extend(CapsuleClass, compiledDef.base ? compiledDef.base : Capsule);
            CapsuleClass.prototype.name = compiledDef.name;

            for (var name in compiledDef.ownedPrivateMethods)
                CapsuleClass.prototype[name] = privateWrapper_(compiledDef.ownedPrivateMethods[name], CapsuleClass.super$.prototype);

            for (var name in compiledDef.ownedPublicMethods)
                CapsuleClass.prototype[name] = publicWrapper_(compiledDef.ownedPublicMethods[name], CapsuleClass.super$.prototype);

            return CapsuleClass;
        }

        /**
         * @private
         */
        function compileDef_(def) {
            if (!isObject_(def))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'def\' argument is an object.'));

            var compiled = {
                inputs: [],
                outputs: [],
                hooks: [],
                loops: [],
                methodsVisibility: {},
                publicMethods: {},
                privateMethods: {},
                parts: {},
                data: {},
                wires: [],
                ties: [],
                filters: [],
                unclassified: [],

                ownedMethods: [],
                ownedPrivateMethods: {},
                ownedPublicMethods: {},
            };

            // inherited stuff
            var base = def.base;
            if (base && (typeof base !== 'function' || !isCapsuleConstructor(base)))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'base\' is a function (capsule constructor).'));
            compiled.base = base;
            if (!isNothing_(base)) {
                var compiledBaseDef = base.compiledDef;
                Array.prototype.push.apply(compiled.inputs, compiledBaseDef.inputs);
                Array.prototype.push.apply(compiled.outputs, compiledBaseDef.outputs);
                Array.prototype.push.apply(compiled.hooks, compiledBaseDef.hooks);
                Array.prototype.push.apply(compiled.loops, compiledBaseDef.loops);
                for (var v in compiledBaseDef.methodsVisibility)
                    compiled.methodsVisibility[v] = compiledBaseDef.methodsVisibility[v];
                for (var m in compiledBaseDef.publicMethods)
                    compiled.publicMethods[m] = compiledBaseDef.publicMethods[m];
                for (var pm in compiledBaseDef.privateMethods)
                    compiled.privateMethods[pm] = compiledBaseDef.privateMethods[pm];
                for (var d in compiledBaseDef.data)
                    compiled.data[d] = compiledBaseDef.data[d];
                for (var p in compiledBaseDef.parts)
                    compiled.parts[p] = compiledBaseDef.parts[p];
                Array.prototype.push.apply(compiled.wires, base.compiledDef.wires);
                Array.prototype.push.apply(compiled.ties, base.compiledDef.ties);
                Array.prototype.push.apply(compiled.filters, base.compiledDef.filters);
                Array.prototype.push.apply(compiled.unclassified, base.compiledDef.unclassified);
            }

            var bindings = [];
            for (var key in def) {
                var value = def[key],
                trimmedKey = key.trim(),
                isInput = trimmedKey.indexOf('>') === 0,
                isOutput = trimmedKey.indexOf('<') === 0,
                isPublic = trimmedKey.indexOf('+') === 0,
                isFilter = trimmedKey.indexOf('f ') === 0 || trimmedKey.indexOf('F ') === 0,
                isDot = trimmedKey.indexOf('.') !== -1;

                if (trimmedKey === 'isAbstract') {
                    if (!isNothing_(value) && typeof value !== 'boolean')
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'isAbstract\' is a boolean value.'));
                    compiled.isAbstract = value;
                    continue;
                } else if (trimmedKey === 'name') {
                    if (!isNothing_(value) && typeof value !== 'string')
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'name\' is a string value.'));
                    compiled.name = value;
                    continue;
                } else if (trimmedKey === 'base') {
                    // already processed above
                    continue;
                } else if (trimmedKey === 'init') {
                    if (value) {
                        if (typeof value !== 'function')
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure init is a function.'));
                        compiled.ownedPrivateMethods.init = value;
                    }
                    continue;
                } else if (trimmedKey === 'handle') {
                    if (value) {
                        if (typeof value !== 'function')
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure handle is a function.'));
                        compiled.ownedPrivateMethods.handle = value;
                    }
                    continue;
                } else if (trimmedKey === 'hooks' || trimmedKey === 'loops') {
                    if (isString_(value)) {
                        compiled[trimmedKey].push(value);
                    } else if (isArray_(value)) {
                        if (!areAllStrings_(value))
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure ' + trimmedKey + ' is an array of strings.'));
                        Array.prototype.push.apply(compiled[trimmedKey], value);
                    } else if (value != null) { // null is OK
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure ' + trimmedKey + ' is a string or an array of strings.'));
                    }
                    continue;
                } else if (isInput || isOutput) {
                    var operation = trimmedKey.substring(1).trim(); // trim is to remove the space immediately after the angle bracket
                    if (operation.length === 0)
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'' + key + '\' contains at least one real character after the angle bracket.'));
                    (isInput ? compiled.inputs : compiled.outputs).push(operation);
                    if (isNothing_(value) || typeof value === 'function') {
                        if (typeof value === 'function' && isInput)
                            compiled.ownedPrivateMethods[operation] = value;
                    } else if (isString_(value)) {
                        if (isInput)
                            bindings.push(['this.' + operation, value]);
                        else
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you don\'t wire output operations in declaration.'));
                    } else if (isArray_(value)) {
                        if (isInput) {
                            for (var opi = 0; opi < value.length; opi++) {
                                var valueOpi = value[opi];
                                if (!isString_(valueOpi))
                                    throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure array for operation ' + operation + ' contains strings only.'));
                                bindings.push(['this.' + operation, valueOpi]);
                            }
                        } else
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you don\'t wire output operations in declaration.'));
                    } else {
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure operation is declared using null, string, or javascript function in: \'' + key + '\'.'));
                    }
                    continue;
                } else if (isPublic) {
                    if (typeof value !== 'function')
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure public method is declared using javascript function in: \'' + key + '\'.'));
                    var method = trimmedKey.substring(1).trim(); // trim is to remove the space immediately after the + sign
                    if (method.length === 0)
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'' + key + '\' contains at least one real character after the + sign.'));
                    if (compiled.ownedMethods.indexOf(method) !== -1)
                        throw new Error(Errors.DUPLICATE_NAME.toString(method));
                    var visibility = compiled.methodsVisibility[method];
                    if (!isNothing_(visibility)) {
                        if (visibility === VisibilityType.PRIVATE)
                            throw new Error(Errors.ILLEGAL_METHODS_VISIBILITY.toString(method, 'private'));
                    } else {
                        compiled.methodsVisibility[method] = VisibilityType.PUBLIC;
                    }
                    compiled.ownedMethods.push(method);
                    compiled.ownedPublicMethods[method] = value;
                    compiled.publicMethods[method] = value;
                    continue;
                } else if (isFilter) {
                    if (typeof value !== 'function')
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure filter is declared using function in: \'' + key + '\'.'));
                    var operationSpec = trimmedKey.substring(1).trim(); // trim is to remove the space immediately after the 'f' (or 'F') sign
                    if (operationSpec.length === 0)
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'' + key + '\' points to an operation.'));
                    var filter = [operationSpec, value];
                    filter.filter = true;
                    bindings.push(filter);
                } else if (isCapsuleConstructor(value)) {
                    compiled.parts[trimmedKey] = {
                        capsule: value
                    };
                    continue;
                } else if (isDot) {
                    if (isString_(value))
                        bindings.push([trimmedKey, value]);
                    else if (isArray_(value)) {
                        for (var bi = 0; bi < value.length; bi++) {
                            var valueBi = value[bi];
                            if (!isString_(valueBi))
                                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure ' + trimmedKey + ' array contains only strings.'));
                            bindings.push([trimmedKey, valueBi]);
                        }
                    } else
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure value of ' + trimmedKey + ' is a string or an array of strings.'));
                    continue;
                } else if (typeof value === 'function') {
                    if (compiled.ownedMethods.indexOf(trimmedKey) !== -1)
                        throw new Error(Errors.DUPLICATE_NAME.toString(trimmedKey));
                    var visibility = compiled.methodsVisibility[trimmedKey];
                    if (!isNothing_(visibility)) {
                        if (visibility === VisibilityType.PUBLIC)
                            throw new Error(Errors.ILLEGAL_METHODS_VISIBILITY.toString(trimmedKey, 'public'));
                    } else {
                        compiled.methodsVisibility[trimmedKey] = VisibilityType.PRIVATE;
                    }
                    compiled.ownedMethods.push(trimmedKey);
                    compiled.ownedPrivateMethods[trimmedKey] = value;
                    compiled.privateMethods[trimmedKey] = true;
                    continue;
                } else if (isObject_(value)) {
                    if (!isNothing_(value.capsule) || !isNothing_(value.new) || !isNothing_(value.call)) {
                        if (!isNothing_(value.capsule)) {
                            if (!isCapsuleConstructor(value.capsule))
                                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure part \'' + trimmedKey + '\' is a capsule constructor (function).'));
                        } else if (!isNothing_(value.new)) {
                            if (typeof value.new !== 'function')
                                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure data \'' + trimmedKey + '\' is a constructor (function).'));
                        } else { // if (!isNothing_(value.call))
                            if (typeof value.call !== 'function')
                                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure data \'' + trimmedKey + '\' is a function.'));
                        }
                        if (!isNothing_(value.deferredArgs) && typeof value.deferredArgs !== 'function')
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure deferredArgs of \'' + trimmedKey + '\' is a function.'));

                        var f = value.capsule || value.new || value.call;
                        if (isCapsuleConstructor(f)) {
                            compiled.parts[trimmedKey] = value;
                            continue;
                        }
                    }
                    compiled.data[trimmedKey] = value;
                } else {
                    compiled.data[trimmedKey] = value;
                }
            }

            var temp = {};
            checkDuplicates_(temp, compiled.inputs);
            var pm = Object.keys(compiled.privateMethods);
            for (var pmi = 0; pmi < pm.length; pmi++)
                temp[pm[pmi]] = true;
            checkDuplicates_(temp, compiled.outputs);
            checkDuplicates_(temp, compiled.hooks);
            checkDuplicates_(temp, compiled.loops);
            checkDuplicates_(temp, Object.keys(compiled.publicMethods));
            checkDuplicates_(temp, Object.keys(compiled.parts));
            checkDuplicates_(temp, Object.keys(compiled.data));

            if (!compiled.ownedPrivateMethods.init && !compiled.ownedPublicMethods.init)
                compiled.ownedPrivateMethods.init = defaultInit_;

            for (var w = 0; w < bindings.length; w++) {
                var binding = bindings[w],
                srcOwner,
                srcPieceType,
                srcName;
                for (var ww = 0; ww < binding.length; ww++) {
                    var bindingEnd = binding[ww],
                    pieceType,
                    name,
                    owner;

                    if (ww === 0 && !isString_(bindingEnd))
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure ' + bindingEnd + ' is a string.'));

                    if (ww !== 0 && binding.filter === true)
                        pieceType = ElementType.FILTER;

                    if (isString_(bindingEnd)) {
                        owner = getDefOwner_(bindingEnd);
                        if (!owner || !isString_(owner))
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure owner in ' + bindingEnd + ' is a non-empty string.'));
                        if (owner !== 'this' && !compiled.parts[owner])
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure owner in ' + bindingEnd + ' is a part name or \'this\'.'));

                        name = getDefName_(bindingEnd);
                        if (!isString_(name) || name.length === 0 || name === DYNAMIC)
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure name in ' + bindingEnd + ' is a non-empty string.'));
                        if (owner === 'this' && name.indexOf(DYNAMIC) !== -1)
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('It doesn\'t really make sense to use \'!\' with \'this\'. That is because declarative statements (like the one with \'' + bindingEnd + '\') get processed before the constructor.'));

                        if (name.indexOf(DYNAMIC) === 0) {
                            name = name.substring(DYNAMIC.length); // skip DYNAMIC
                            pieceType = ElementType.UNKNOWN;
                        } else if (ww === 0 || binding.filter !== true) {
                            pieceType = getPieceType_(owner, name, compiled);
                        }
                    }

                    if (ww === 0) {
                        if (pieceType !== ElementType.INPUT && pieceType !== ElementType.OUTPUT &&
                            pieceType !== ElementType.HOOK && pieceType !== ElementType.LOOP &&
                            pieceType !== ElementType.UNKNOWN)
                            throw new Error(Errors.ELEMENT_NOT_FOUND.toString('Element ' + bindingEnd, 'neither input and output operations nor hooks and loops'));

                        srcOwner = owner;
                        srcPieceType = pieceType;
                        srcName = name;
                    } else {
                        if (pieceType === ElementType.FILTER) {
                            var compiledFilter = {};
                            compiledFilter.owner = srcOwner;
                            compiledFilter.name = srcName;
                            compiledFilter.func = bindingEnd;
                            compiled.filters.push(compiledFilter);
                        } else {
                            var compiledBinding = {};
                            compiledBinding.owner1 = srcOwner;
                            compiledBinding.name1 = srcName;
                            compiledBinding.owner2 = owner;
                            compiledBinding.name2 = name;

                            if (srcPieceType === ElementType.INPUT || srcPieceType === ElementType.OUTPUT) {
                                if (pieceType !== ElementType.INPUT && pieceType !== ElementType.OUTPUT && pieceType !== ElementType.METHOD && pieceType !== ElementType.UNKNOWN)
                                    throw new Error(Errors.ELEMENT_NOT_FOUND.toString(bindingEnd, 'neither operations nor methods'));

                                if ((srcOwner === 'this' && srcPieceType === ElementType.OUTPUT && pieceType === ElementType.METHOD) ||
                                    (srcOwner !== 'this' && srcPieceType === ElementType.INPUT && pieceType === ElementType.METHOD) ||
                                    (srcOwner === 'this' && owner === 'this' && srcPieceType === pieceType) ||
                                    (srcOwner !== 'this' && owner !== 'this' && srcPieceType === pieceType) ||
                                    (srcOwner === 'this' && owner !== 'this' && srcPieceType === ElementType.INPUT && pieceType === ElementType.OUTPUT) ||
                                    (srcOwner === 'this' && owner !== 'this' && srcPieceType === ElementType.OUTPUT && pieceType === ElementType.INPUT) ||
                                    (srcOwner !== 'this' && owner === 'this' && srcPieceType === ElementType.INPUT && pieceType === ElementType.OUTPUT) ||
                                    (srcOwner !== 'this' && owner === 'this' && srcPieceType === ElementType.OUTPUT && pieceType === ElementType.INPUT))
                                    throw new Error(Errors.WIRE_INCOMPATIBILITY.toString(binding[0], bindingEnd));

                                compiled.wires.push(compiledBinding);
                            } else if (srcPieceType === ElementType.HOOK || srcPieceType === ElementType.LOOP) {
                                if (pieceType !== ElementType.HOOK && pieceType !== ElementType.LOOP && pieceType !== ElementType.UNKNOWN)
                                    throw new Error(Errors.ELEMENT_NOT_FOUND.toString(bindingEnd, 'neither hooks nor loops'));

                                if ((srcOwner === 'this' && owner === 'this') ||
                                    (srcOwner === 'this' && owner !== 'this' && srcPieceType !== pieceType) ||
                                    (srcOwner !== 'this' && owner === 'this' && srcPieceType !== pieceType) ||
                                    (srcOwner !== 'this' && owner !== 'this' && srcPieceType === pieceType))
                                    throw new Error(Errors.TIE_INCOMPATIBILITY.toString(binding[0], bindingEnd));

                                compiled.ties.push(compiledBinding);
                            } else { // srcPieceType === ElementType.UNKNOWN
                                if (pieceType === ElementType.OTHER)
                                    throw new Error(Errors.ELEMENT_NOT_FOUND.toString('Element ' + bindingEnd, 'neither input and output operations nor hooks and loops nor methods'));

                                if (pieceType === ElementType.UNKNOWN)
                                    compiled.unclassified.push(compiledBinding);
                                else if (pieceType === ElementType.INPUT || pieceType === ElementType.OUTPUT || pieceType === ElementType.METHOD)
                                    compiled.wires.push(compiledBinding);
                                else // if (pieceType === ElementType.HOOK || pieceType === ElementType.LOOP)
                                    compiled.ties.push(compiledBinding);
                            }
                        }
                    }
                }
            }
            return compiled;
        }

        function checkDuplicates_(temp, arr) {
            for (var i = 0; i < arr.length; i++) {
                var name = arr[i];
                if (temp[name])
                    throw new Error(Errors.DUPLICATE_NAME.toString(name));
                else
                    temp[name] = true;
            }
        }

        // *****************************
        // When capsule object is created (new Capsule())
        // *****************************

        /**
         * @private
         */
        function newInterface_(capsule, interfaceElements, Cotr) {
            for (var i = 0; i < interfaceElements.length; i++) {
                var name = interfaceElements[i],
                el = new Cotr();
                el._.name = name;
                capsule[name] = el;
            }
        }

        /**
         * @private
         */
        function publicMethod_(capsule, var_args) {
            checkContextOrSubCapsule_(capsule);
            return executeInContext_(this, capsule, capsule, Array.prototype.slice.call(arguments, 1));
        }

        /**
         * @private
         */
        function newPublicMethods_(capsule, methods) {
            for (var name in methods)
                capsule[name] = publicMethod_.bind(methods[name], capsule);
        }

        /**
         * @private
         */
        function newTargets_(capsule, inputNames) {
            for (var i = 0; i < inputNames.length; i++) {
                var inputName = inputNames[i],
                method = capsule.constructor.prototype[inputName];
                if (method) {
                    var input = getByThisNameAndType_(capsule, isInput_, 'pins', inputName, 'isInput');
                    input._.targets.push(method);
                }
            }
        }

        /**
         * @private
         */
        function newParts_(capsule, parts, initArgs) {
            for (var name in parts) {
                var partDef = parts[name],
                fnCapsule = partDef.capsule || partDef.call || partDef.new,
                args = getArguments_(partDef, capsule, initArgs),
                part = fnCapsule.apply(null, args);
                part._.name = name;
                capsule[name] = part;
            }
        }

        /**
         * @private
         */
        function newData_(capsule, data, initArgs) {
            for (var name in data) {
                var dataDef = data[name],
                datum = dataDef;
                if (isObject_(dataDef)) {
                    var fnData = dataDef.call || dataDef.new;
                    if (typeof fnData === 'function') {
                        var args = getArguments_(dataDef, capsule, initArgs),
                        that = null;
                        if (dataDef.new)
                            that = Object.create(fnData.prototype);
                        datum = fnData.apply(that, args);
                    }
                } else if (isString_(dataDef) && dataDef.indexOf(NEW) === 0) {
                    if (dataDef === New.OBJECT) {
                        datum = {};
                    } else if (dataDef === New.ARRAY) {
                        datum = [];
                    } else if (dataDef === New.MAP) {
                        datum = new Map();
                    } else if (dataDef === New.SET) {
                        datum = new Set();
                    } else if (dataDef === New.WEAKMAP) {
                        datum = new WeakMap();
                    } else if (dataDef === New.WEAKSET) {
                        datum = new WeakSet();
                    }
                }
                var d = new Data(datum);
                d.setName(name);
                capsule[name] = d;
            }
        }

        /**
         * @private
         */
        function newFilters_(capsule, compiledFilters) {
            for (var i = 0; i < compiledFilters.length; i++) {
                var compiledFilter = compiledFilters[i],
                owner = getSelf_(capsule, compiledFilter.owner),
                operation = getByThisNameAndType_(owner, isOperation, 'pins', compiledFilter.name);
                if (isNothing_(operation))
                    throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledFilter.owner + '.' + compiledFilter.name, 'operations'));
                doInContextAndDirection_(function (pipe) {
                    this._.exitPipe = pipe;
                }, function (pipe) {
                    this._.entryPipe = pipe;
                }, operation, [compiledFilter.func]);
            }
        }

        /**
         * @private
         */
        function newWires_(capsule, compiledWires) {
            for (var i = 0; i < compiledWires.length; i++) {
                var compiledWire = compiledWires[i],
                owner1 = getSelf_(capsule, compiledWire.owner1),
                operation1 = getByThisNameAndType_(owner1, isOperation, 'pins', compiledWire.name1);
                if (isNothing_(operation1))
                    throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledWire.owner1 + '.' + compiledWire.name1, 'operations'));

                var owner2 = getSelf_(capsule, compiledWire.owner2),
                operation2 = getSelfOperationOrMethod_(owner2, compiledWire.name2);
                if (isNothing_(operation2))
                    throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledWire.owner2 + '.' + compiledWire.name2, 'neither operations nor methods'));

                operation1.wire(operation2);
            }
        }

        /**
         * @private
         */
        function newTies_(capsule, compiledTies) {
            for (var i = 0; i < compiledTies.length; i++) {
                var compiledTie = compiledTies[i],
                owner1 = getSelf_(capsule, compiledTie.owner1),
                hookLoop1 = getSelfHookOrLoop_(owner1, compiledTie.name1);
                if (isNothing_(hookLoop1))
                    throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledTie.owner1 + '.' + compiledTie.name1, 'neither hooks nor loops'));

                var owner2 = getSelf_(capsule, compiledTie.owner2),
                hookLoop2 = getSelfHookOrLoop_(owner2, compiledTie.name2);
                if (isNothing_(hookLoop2))
                    throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledTie.owner2 + '.' + compiledTie.name2, 'neither hooks nor loops'));

                hookLoop1.tie(hookLoop2);
            }
        }

        /**
         * @private
         */
        function newUnclassified_(capsule, compiledBindings) {
            for (var i = 0; i < compiledBindings.length; i++) {
                var compiledBinding = compiledBindings[i],
                owner1 = getSelf_(capsule, compiledBinding.owner1),
                operation1 = getByThisNameAndType_(owner1, isOperation, 'pins', compiledBinding.name1),
                hookLoop1,
                owner2,
                operation2,
                hookLoop2;

                if (isNothing_(operation1)) {
                    hookLoop1 = getSelfHookOrLoop_(owner1, compiledBinding.name1);
                    if (isNothing_(hookLoop1))
                        throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledBinding.owner1 + '.' + compiledBinding.name1, 'neither operations nor hooks and loops'));
                    // it's a tie
                    owner2 = getSelf_(capsule, compiledBinding.owner2),
                    hookLoop2 = getSelfHookOrLoop_(owner2, compiledBinding.name2);
                    if (isNothing_(hookLoop2))
                        throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledBinding.owner2 + '.' + compiledBinding.name2, 'neither hooks nor loops'));
                    hookLoop1.tie(hookLoop2);
                } else {
                    // it's a wire
                    owner2 = getSelf_(capsule, compiledBinding.owner2),
                    operation2 = getSelfOperationOrMethod_(owner2, compiledBinding.name2);
                    if (isNothing_(operation2))
                        throw new Error(Errors.ELEMENT_NOT_FOUND.toString(compiledBinding.owner2 + '.' + compiledBinding.name2, 'neither operations nor methods'));
                    operation1.wire(operation2);
                }
            }
        }

        // *****************************
        // Error Handling
        // *****************************

        /**
         * Handles all exceptions caught in Capsules.
         * @private
         */
        function handleError_(error) {
            var ctxCaps = ctx_;
            for (; ctxCaps; ctxCaps = ctxCaps._.owner) {
                if (typeof ctxCaps.handle === 'function') {
                    // if handeled, then stop propagating upwards
                    return executeInContext_(function () {
                        return ctxCaps.handle(error);
                    }, ctxCaps);
                } else
                    continue;
            }
            throw error; // if nobody handles it, let's throw it again
        }

        // *****************************
        // Capsule
        // *****************************

        /**
         * Returns the super prototype object to enable calls to a method that is just being overridden.
         *
         * @example <caption>Example of using superior</caption>
         * capsula.defCapsule({
         *     base: BaseCapsule,
         *     '+ myMethod': function(){
         *         this.superior().myMethod.call(...); // calling a method that is just being overridden
         *     }
         * });
         *
         * @public
         * @since 0.1.0
         * @returns {Object} the super prototype object
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.superior = function () {
            checkCapsuleAsOwner_(this);
            return this._.superPrototype;
        };

        /**
         * Accepts visitor object and calls its visit method for each visited capsule in the subtree of this capsule: visit(this). Parameters for and results of calling visit method could be placed in the visitor object itself. To prevent capsule from being visited, override this (accept) method to do nothing.
         *
         * @param visitor {Object} - the visitor object
         * @param opt_postorder {boolean} - whether to use postorder (true) or preorder (false) approach when traversing the tree of capsules
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.accept = function (visitor, opt_postorder) {
            checkCapsuleAsThis_(this);
            if (isNothing_(visitor) || typeof visitor.visit !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure visitor is an object having visit method.'));

            if (!opt_postorder)
                visitor.visit(this);

            var parts = this._.parts;
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (typeof part.accept === 'function')
                    executeInContext_(function (v) {
                        this.accept(v);
                    }, part, part, [visitor]);
            }

            if (opt_postorder)
                visitor.visit(this);
        };

        /**
         * Returns the id of this capsule.
         *
         * @returns {number} the id of this capsule
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getId = function () {
            checkCapsuleAsThis_(this);
            return this._.id;
        };

        /**
         * Returns the name of this capsule; i.e. the name of this capsule in the context of its owner capsule (whose part is this capsule).
         *
         * @public
         * @since 0.1.0
         * @returns {string} the name of this capsule
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getName = function () {
            checkCapsuleAsThis_(this);
            return this._.name;
        };

        /**
         * Sets a new name to this capsule in the context of its owner capsule. New name can later be used to obtain a reference to this capsule from its owner capsule using [getPart]{@link module:capsula.Capsule#getPart}.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - a new name of this capsule
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        Capsule.prototype.setName = function (name) {
            checkCapsuleAsThis_(this);
            checkName_(name);
            this._.name = name;
        };

        /**
         * Returns an array of input and output operations (inherited ones included) of this capsule.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Operation>} an array of input and output operations (inherited ones included)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getOperations = function () {
            checkCapsuleAsThis_(this);
            return this._.pins.slice(0); // new array
        };

        /**
         * Returns an array of input operations (inherited ones included) of this capsule.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Input>} an array of input operations (inherited ones included)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getInputs = function () {
            checkCapsuleAsThis_(this);
            var inputPins = [],
            pins = this._.pins;
            for (var i = 0; i < pins.length; i++) {
                if (pins[i]._.isInput)
                    inputPins.push(pins[i]);
            }
            return inputPins;
        };

        /**
         * Returns an array of output operations (inherited ones included) of this capsule.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Output>} an array of output operations (inherited ones included)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getOutputs = function () {
            checkCapsuleAsThis_(this);
            var outputPins = [],
            pins = this._.pins;
            for (var i = 0; i < pins.length; i++) {
                if (!pins[i]._.isInput)
                    outputPins.push(pins[i]);
            }
            return outputPins;
        };

        /**
         * Returns an array of hooks (inherited ones included) of this capsule.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Hook>} an array of hooks (inherited ones included)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getHooks = function () {
            checkCapsuleAsThis_(this);
            return this._.hooks.slice(0); // new array
        };

        /**
         * Returns an array of loops (inherited ones included) of this capsule.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Loop>} an array of loops (inherited ones included)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getLoops = function () {
            checkCapsuleAsThis_(this);
            return this._.loops.slice(0); // new array
        };

        /**
         * <p> Attaches this capsule to be a part of the capsule that represents the current context of execution. Creates an implicit reference between the two capsules.
         * <p> Recursively calls onAttach method (or operation) on this capsule and all its descendent capsules if they have that method.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [CAPSULE_ALREADY_ATTACHED]{@link module:capsula.Errors.CAPSULE_ALREADY_ATTACHED}
         */
        Capsule.prototype.attach = function () {
            // This is not a place to compare context to 'this', because 'this' is not yet attached.
            checkCapsule_(this);

            var owner = this._.owner;
            if (owner) {
                if (owner === ctx_)
                    return false; // already attached, returns false
                else
                    throw new Error(Errors.CAPSULE_ALREADY_ATTACHED.toString(this._.name));
            }

            this._.owner = ctx_;
            ctx_._.parts.push(this);

            // let everyone inside know they are being (re)attached
            onWhat_(this, 'onAttach');

            // let 'this' know it's being (re)attached
            if (typeof this.onAttach === 'function')
                executeInContext_(this.onAttach, this, this);

            return true;
        };

        /**
         * Returns whether this capsule is attached to the capsule that represents the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @returns whether this capsule is attached to the capsule that represents the current context of execution
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.isAttached = function () {
            // This is not a place to compare context to 'this', because 'this' is not yet attached.
            checkCapsule_(this);

            var owner = this._.owner;
            if (owner) {
                checkContextCapsule_(owner);
                return true;
            } else
                return false;
        };

        /**
         * <p> Detaches this capsule as a part of the capsule that represents the current context of execution. Destroys an implicit reference between the two capsules. Detaching the capsule also means destroying all the wires and ties that exist between that capsule and all other sibling capsules (including itself) as well as between that capsule and its owner capsule.
         * <p> Recursively calls onDetach method (or operation) on this capsule and all its descendent capsules if they have that method (this is to release resources and prevent memory leak).
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.detach = function () {
            checkCapsule_(this);

            var owner = this._.owner;
            if (!owner)
                return false; // already detached, returns false
            checkContextCapsule_(owner);

            // detach all hooks and loops
            var loops = this.getLoops();
            for (var i = 0; i < loops.length; i++) {
                var lp = loops[i];
                lp.setParent(null);
            }
            var hooks = this.getHooks();
            for (i = 0; i < hooks.length; i++) {
                var hk = hooks[i];
                hk.clear();
            }

            // unwire all pins between this and sibling capsules (including this!)
            var parts = owner.getParts();
            for (i = 0; i < parts.length; i++)
                this.unwire(parts[i]);

            // ... between this and the owner capsule
            owner.unwire(this);

            // let everyone inside know they are being detached
            onWhat_(this, 'onDetach');

            // let 'this' know it's being detached
            if (typeof this.onDetach === 'function')
                executeInContext_(this.onDetach, this, this);

            var ownerData = owner._;
            this._.owner = null;

            var ind = ownerData.parts.indexOf(this);
            if (ind >= 0)
                ownerData.parts.splice(ind, 1);

            return true;
        };

        /**
         * Unwires all the operations of this capsule (including inherited ones) from all the operations and functions they are wired to in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.unwireAll = function () {
            checkCapsuleAsThis_(this);
            var operations = this._.pins;
            for (var i = 0; i < operations.length; i++) {
                var op = operations[i];
                if (!op || !isOperation(op))
                    continue;
                op.unwireAll();
            }
        };

        /**
         * Unwires all the operations of this capsule (including inherited ones) from the operations and functions of the given capsules they are wired to in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Capsule)} var_args - capsules to unwire this capsule from (an array of capsules also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.unwire = function (var_args) {
            checkCapsuleAsThis_(this);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++) {
                var c = arr[i];
                checkCapsuleAsThis_(c);
                var areSame = this === c,
                isThisContext = this === ctx_,
                caps1Pins = this._.pins,
                caps2Pins = c._.pins;
                for (var i = 0; i < caps1Pins.length; i++) {
                    var pin1 = caps1Pins[i],
                    isPin1Input = pin1._.isInput;
                    for (var j = 0; j < caps2Pins.length; j++) {
                        var pin2 = caps2Pins[j];
                        if (!areSame) {
                            remove_.call(pin1._.targets, pin2);
                            remove_.call(pin2._.targets, pin1);
                        } else {
                            if (isThisContext) {
                                if (isPin1Input)
                                    remove_.call(pin1._.targets, pin2);
                            } else {
                                if (!isPin1Input)
                                    remove_.call(pin1._.targets, pin2);
                            }
                        }
                    }
                }
            }
        };

        /**
         * Unties all the hooks and loops of this capsule (including inherited ones) from all the hooks and loops they are tied to in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.untieAll = function () {
            checkCapsuleAsThis_(this);
            var hooksAndLoops = this._.hooks.concat(this._.loops);
            for (var i = 0; i < hooksAndLoops.length; i++) {
                hooksAndLoops[i].untieAll();
            }
        };

        /**
         * Unties all the hooks and loops of this capsule (including inherited ones) from the hooks and loops of the given capsules they are tied to in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Capsule)} var_args - capsules to untie this capsule from (an array of capsules also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.untie = function (var_args) {
            checkCapsuleAsThis_(this);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++) {
                var c = arr[i];
                checkCapsuleAsThis_(c);
                var hooks1 = this._.hooks,
                hooks2 = c._.hooks,
                loops1 = this._.loops,
                loops2 = c._.loops,
                areSiblings = this._.up !== c && c._.up !== this;
                if (this._.up === c) {
                    unwireCollections_(loops2, loops1);
                    unwireCollections_(hooks1, hooks2);
                } else if (c._.up === this) {
                    unwireCollections_(loops1, loops2);
                    unwireCollections_(hooks2, hooks1);
                } else {
                    unwireCollections_(hooks2, loops1);
                    unwireCollections_(hooks1, loops2);
                }
            }
        };

        /**
         * <p> Returns the fully qualified name of this capsule, using the given separator if provided (if not, the :: is used by default).
         * <p> The fully qualified name comprises the name of this capsule (in the context of its owner capsule), the name of the owner capsule of this capsule, and so on all the way up the capsule hierarchy.
         *
         * @public
         * @since 0.1.0
         * @param {string} [opt_sep] the separator to use to separate names in the returned fully qualified name
         * @returns {string} the fully qualified name of this capsule
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getFQName = function (sep) {
            checkCapsuleAsThis_(this);
            return getFQName_(this, sep);
        };

        /**
         * Returns an operation (of this capsule) with the given name, or null if there is no such an operation.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - the name of the operation to return
         * @returns {module:capsula.Operation} an operation (of this capsule) with the given name, or null if there is no such an operation
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getOperation = function (name) {
            checkCapsuleAsThis_(this);
            return getByThisNameAndType_(this, isOperation, 'pins', name);
        };

        /**
         * Returns an input operation (of this capsule) with the given name, or null if there is no such an operation.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - the name of the input operation to return
         * @returns {module:capsula.Operation} an input operation (of this capsule) with the given name, or null if there is no such an operation
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getInput = function (name) {
            checkCapsuleAsThis_(this);
            return getByThisNameAndType_(this, isInput_, 'pins', name, 'isInput');
        };

        /**
         * Returns an output operation (of this capsule) with the given name, or null if there is no such an operation.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - the name of the output operation to return
         * @returns {module:capsula.Operation} an output operation (of this capsule) with the given name, or null if there is no such an operation
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getOutput = function (name) {
            checkCapsuleAsThis_(this);
            return getByThisNameAndType_(this, isOutput_, 'pins', name, 'isOutput');
        };

        /**
         * Returns a hook (of this capsule) with the given name, or null if there is no such a hook.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - the name of the hook to return
         * @returns {module:capsula.Hook} a hook (of this capsule) with the given name, or null if there is no such a hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getHook = function (name) {
            checkCapsuleAsThis_(this);
            return getByThisNameAndType_(this, isHook, 'hooks', name);
        };

        /**
         * Returns a loop (of this capsule) with the given name, or null if there is no such a loop.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - the name of the loop to return
         * @returns {module:capsula.Loop} a loop (of this capsule) with the given name, or null if there is no such a loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getLoop = function (name) {
            checkCapsuleAsThis_(this);
            return getByThisNameAndType_(this, isLoop, 'loops', name);
        };

        /**
         * Returns an array of capsules (children) whose select hooks or loops are children of a select hook or loop of this capsule (parent). The parent's hook or loop is determined like this:
         * <p> If this capsule represents the current context of execution, then its loop returned by the [getDefaultParentLoop]{@link module:capsula.Capsule#getDefaultParentLoop} method is considered as a parent here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its hook returned by the [getDefaultParentHook]{@link module:capsula.Capsule#getDefaultParentHook} method is considered as a parent here.
         *
         * @public
         * @returns {Array.<module:capsula.Capsule>} an array of child capsules depending on the current context of execution
         * @since 0.2.0
         * @throws {Error} [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getChildren = function () {
            checkCapsuleAsThis_(this);
            var par = getParentHoop_(this);

            var childrenHoops;
            if (this === ctx_)
                childrenHoops = Loop.prototype.getChildren.apply(par);
            else
                childrenHoops = Hook.prototype.getChildren.apply(par);

            var children = [];
            for (var i = 0; i < childrenHoops.length; i++)
                children.push(childrenHoops[i]._.owner);
            return children;
        };

        /**
         * Ties select hooks or loops of the given capsules (children) to a select hook or loop of this capsule (parent). The parent's hook or loop is first determined:
         * <p> If this capsule represents the current context of execution, then its loop returned by the [getDefaultParentLoop]{@link module:capsula.Capsule#getDefaultParentLoop} method is considered as a parent here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its hook returned by the [getDefaultParentHook]{@link module:capsula.Capsule#getDefaultParentHook} method is considered as a parent here.
         * <p> For each of the given capsules, the child hook or loop is determined like this:
         * <p> If the given capsule represents the current context of execution, then its hook returned by the [getDefaultChildHook]{@link module:capsula.Capsule#getDefaultChildHook} method is considered as a child here.
         * <p> If the given capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its loop returned by the [getDefaultChildLoop]{@link module:capsula.Capsule#getDefaultChildLoop} method is considered as a child here.
         *
         * @param {...(module:capsula.Capsule)} var_args - child capsules whose hooks or loops would be added to their new parent (an array of capsules also accepted)
         * @public
         * @since 0.2.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.add = function (var_args) {
            checkCapsuleAsThis_(this);
            var par = getParentHoop_(this); // par means parent
            var children = getChildrenHoops_.apply(this, arguments);

            if (this === ctx_)
                Loop.prototype.add.apply(par, children);
            else
                Hook.prototype.add.apply(par, children);
        };

        /**
         *
         * Ties select hooks or loops of the given capsules (children) to a select hook or loop of this capsule (parent) according to the given <i>at</i> index. The parent's hook or loop is first determined:
         * <p> If this capsule represents the current context of execution, then its loop returned by the [getDefaultParentLoop]{@link module:capsula.Capsule#getDefaultParentLoop} method is considered as a parent here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its hook returned by the [getDefaultParentHook]{@link module:capsula.Capsule#getDefaultParentHook} method is considered as a parent here.
         * <p> For each of the given capsules, the child hook or loop is determined like this:
         * <p> If the given capsule represents the current context of execution, then its hook returned by the [getDefaultChildHook]{@link module:capsula.Capsule#getDefaultChildHook} method is considered as a child here.
         * <p> If the given capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its loop returned by the [getDefaultChildLoop]{@link module:capsula.Capsule#getDefaultChildLoop} method is considered as a child here.
         *
         * @param {number} at - the index at which the child hooks or loops should be added to their new parent
         * @param {...(module:capsula.Capsule)} var_args - child capsules whose hooks or loops would be added to their new parent (an array of capsules also accepted)
         * @public
         * @since 0.2.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [INDEX_OUT_OF_BOUNDS]{@link module:capsula.Errors.INDEX_OUT_OF_BOUNDS}
         */
        Capsule.prototype.addAt = function (at, var_args) {
            checkCapsuleAsThis_(this);
            var par = getParentHoop_(this);
            var children = getChildrenHoops_.apply(this, Array.prototype.slice.call(arguments, 1));

            if (this === ctx_)
                Loop.prototype.addAt.apply(par, [at].concat(children));
            else
                Hook.prototype.addAt.apply(par, [at].concat(children));
        };

        /**
         * Returns whether all the select hooks or loops of the given capsules (children) are tied to a select hook or loop of this capsule (parent). The parent's hook or loop is first determined:
         * <p> If this capsule represents the current context of execution, then its loop returned by the [getDefaultParentLoop]{@link module:capsula.Capsule#getDefaultParentLoop} method is considered as a parent here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its hook returned by the [getDefaultParentHook]{@link module:capsula.Capsule#getDefaultParentHook} method is considered as a parent here.
         * <p> For each of the given capsules, the child hook or loop is determined like this:
         * <p> If the given capsule represents the current context of execution, then its hook returned by the [getDefaultChildHook]{@link module:capsula.Capsule#getDefaultChildHook} method is considered as a child here.
         * <p> If the given capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its loop returned by the [getDefaultChildLoop]{@link module:capsula.Capsule#getDefaultChildLoop} method is considered as a child here.
         *
         * @param {...(module:capsula.Capsule)} var_args - child capsules whose hooks or loops would be checked (an array of capsules also accepted)
         * @public
         * @since 0.2.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.isParentOf = function (var_args) {
            checkCapsuleAsThis_(this);
            var par = getParentHoop_(this); // par means parent
            var children = getChildrenHoops_.apply(this, arguments);

            if (this === ctx_)
                return Loop.prototype.isParentOf.apply(par, children);
            else
                return Hook.prototype.isParentOf.apply(par, children);
        };

        /**
         * Clears child hooks or loops of a select hook or loop of this capsule (parent). The parent's hook or loop is determined like this:
         * <p> If this capsule represents the current context of execution, then its loop returned by the [getDefaultParentLoop]{@link module:capsula.Capsule#getDefaultParentLoop} method is considered as a parent here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its hook returned by the [getDefaultParentHook]{@link module:capsula.Capsule#getDefaultParentHook} method is considered as a parent here.
         *
         * @public
         * @since 0.2.0
         * @throws {Error} [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.clear = function () {
            checkCapsuleAsThis_(this);
            var par = getParentHoop_(this);

            if (this === ctx_)
                Loop.prototype.clear.apply(par);
            else
                Hook.prototype.clear.apply(par);
        };

        /**
         * Removes select hooks or loops of the given capsules (children) from the hook or loop of this capsule (parent). The parent's hook or loop is first determined:
         * <p> If this capsule represents the current context of execution, then its loop returned by the [getDefaultParentLoop]{@link module:capsula.Capsule#getDefaultParentLoop} method is considered as a parent here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its hook returned by the [getDefaultParentHook]{@link module:capsula.Capsule#getDefaultParentHook} method is considered as a parent here.
         * <p> For each of the given capsules, the child hook or loop is determined like this:
         * <p> If the given capsule represents the current context of execution, then its hook returned by the [getDefaultChildHook]{@link module:capsula.Capsule#getDefaultChildHook} method is considered as a child here.
         * <p> If the given capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its loop returned by the [getDefaultChildLoop]{@link module:capsula.Capsule#getDefaultChildLoop} method is considered as a child here.
         *
         * @param {...(module:capsula.Capsule)} var_args - child capsules whose hooks or loops would be removed from their old parent (an array of capsules also accepted)
         * @public
         * @since 0.2.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.remove = function (var_args) {
            checkCapsuleAsThis_(this);
            var par = getParentHoop_(this);
            var children = getChildrenHoops_.apply(this, arguments);

            if (this === ctx_)
                Loop.prototype.remove.apply(par, children);
            else
                Hook.prototype.remove.apply(par, children);
        };

        /**
         * Sets select hooks or loops of the given capsules (children) to the hook or loop of this capsule (parent). The parent's hook or loop is first determined:
         * <p> If this capsule represents the current context of execution, then its loop returned by the [getDefaultParentLoop]{@link module:capsula.Capsule#getDefaultParentLoop} method is considered as a parent here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its hook returned by the [getDefaultParentHook]{@link module:capsula.Capsule#getDefaultParentHook} method is considered as a parent here.
         * <p> For each of the given capsules, the child hook or loop is determined like this:
         * <p> If the given capsule represents the current context of execution, then its hook returned by the [getDefaultChildHook]{@link module:capsula.Capsule#getDefaultChildHook} method is considered as a child here.
         * <p> If the given capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its loop returned by the [getDefaultChildLoop]{@link module:capsula.Capsule#getDefaultChildLoop} method is considered as a child here.
         *
         * @param {...(module:capsula.Capsule)} var_args - child capsules whose hooks or loops would be set to their new parent (an array of capsules also accepted)
         * @public
         * @since 0.2.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.set = function (var_args) {
            checkCapsuleAsThis_(this);
            var par = getParentHoop_(this);
            var children = getChildrenHoops_.apply(this, arguments);

            if (this === ctx_)
                Loop.prototype.set.apply(par, children);
            else
                Hook.prototype.set.apply(par, children);
        };

        /**
         * Returns a capsule whose hook or loop is a parent of a select hook or loop of this capsule (child). The child's hook or loop is determined like this:
         * <p> If this capsule represents the current context of execution, then its hook returned by the [getDefaultChildHook]{@link module:capsula.Capsule#getDefaultChildHook} method is considered as a child here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its loop returned by the [getDefaultChildLoop]{@link module:capsula.Capsule#getDefaultChildLoop} method is considered as a child here.
         *
         * @public
         * @since 0.2.0
         * @throws {Error} [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getParent = function () {
            checkCapsuleAsThis_(this);
            var chd = getChildHoop_(this);

            var parentHoop;
            if (this === ctx_)
                parentHoop = Hook.prototype.getParent.apply(chd);
            else
                parentHoop = Loop.prototype.getParent.apply(chd);

            if (parentHoop != null)
                return parentHoop._.owner;
            else
                return null;
        };

        /**
         * Sets a select hook or loop of the given capsule (parent) as a parent of a select hook or loop of this capsule (child). The child's hook or loop is determined like this:
         * <p> If the given capsule represents the current context of execution, then its loop returned by the [getDefaultParentLoop]{@link module:capsula.Capsule#getDefaultParentLoop} method is considered as a parent here.
         * <p> If the given capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its hook returned by the [getDefaultParentHook]{@link module:capsula.Capsule#getDefaultParentHook} method is considered as a parent here.
         * <p> If this capsule represents the current context of execution, then its hook returned by the [getDefaultChildHook]{@link module:capsula.Capsule#getDefaultChildHook} method is considered as a child here.
         * <p> If this capsule represents a capsule which is a part of the capsule that represents the current context of execution, then its loop returned by the [getDefaultChildLoop]{@link module:capsula.Capsule#getDefaultChildLoop} method is considered as a child here.
         *
         * @param {module:capsula.Capsule} capsule - a capsule whose select hook or loop would be set as a new parent to this capsule's select hook or loop.
         * @public
         * @since 0.2.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.setParent = function (capsule) {
            checkCapsuleAsThis_(this);
            var par = null;
            if (capsule != null)
                par = getParentHoop_(capsule);
            var chd = getChildHoop_(this);

            if (this === ctx_)
                Hook.prototype.setParent.call(chd, par);
            else
                Loop.prototype.setParent.call(chd, par);
        };

        /**
         * Returns the default loop of this capsule, a loop that can act as a child in the current context of execution.
         * <p> By default this method works this way: when there is only one loop in this capsule, that loop is returned. When there is none or when there are more than one loop, an error is thrown.
         * <p> The method is meant to be overridden in cases when capsule has more than one loop.
         *
         * @public
         * @since 0.2.0
         * @throws {Error} [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [DEFAULT_NOT_FOUND]{@link module:capsula.Errors.DEFAULT_NOT_FOUND}
         */
        Capsule.prototype.getDefaultChildLoop = function () {
            checkCapsuleAsThis_(this);
            if (this._.loops.length !== 1)
                throw new Error(Errors.DEFAULT_NOT_FOUND.toString('child loop'));
            return this._.loops[0];
        };

        /**
         * Returns the default hook of this capsule, a hook that can act as a parent in the current context of execution.
        <p> By default this method works this way: when there is only one hook in this capsule, that hook is returned. When there is none or when there are more than one hook, an error is thrown.
         * <p> The method is meant to be overridden in cases when capsule has more than one hook.
         *
         * @public
         * @since 0.2.0
         * @throws {Error} [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [DEFAULT_NOT_FOUND]{@link module:capsula.Errors.DEFAULT_NOT_FOUND}
         */
        Capsule.prototype.getDefaultParentHook = function () {
            checkCapsuleAsThis_(this);
            if (this._.hooks.length !== 1)
                throw new Error(Errors.DEFAULT_NOT_FOUND.toString('parent hook'));
            return this._.hooks[0];
        };

        // *****************************
        // Protected Capsule's Methods
        // *****************************

        /**
         * Returns the default hook of this capsule, a hook that can act as a child in the current context of execution.
        <p> By default this method works this way: when there is only one hook in this capsule, that hook is returned. When there is none or when there are more than one hook, an error is thrown.
         * <p> The method is meant to be overridden in cases when capsule has more than one hook.
         * <p> This method could only be called from the capsule's interior, i.e. only with "this".
         *
         * @protected
         * @since 0.2.0
         * @throws {Error} [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [DEFAULT_NOT_FOUND]{@link module:capsula.Errors.DEFAULT_NOT_FOUND}
         */
        Capsule.prototype.getDefaultChildHook = function () {
            checkCapsuleAsOwner_(this);
            if (this._.hooks.length !== 1)
                throw new Error(Errors.DEFAULT_NOT_FOUND.toString('child hook'));
            return this._.hooks[0];
        };

        /**
         * Returns the default loop of this capsule, a loop that can act as a parent in the current context of execution.
        <p> By default this method works this way: when there is only one loop in this capsule, that loop is returned. When there is none or when there are more than one loop, an error is thrown.
         * <p> The method is meant to be overridden in cases when capsule has more than one loop.
         * <p> This method could only be called from the capsule's interior, i.e. only with "this".
         *
         * @protected
         * @since 0.2.0
         * @throws {Error} [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [DEFAULT_NOT_FOUND]{@link module:capsula.Errors.DEFAULT_NOT_FOUND}
         */
        Capsule.prototype.getDefaultParentLoop = function () {
            checkCapsuleAsOwner_(this);
            if (this._.loops.length !== 1)
                throw new Error(Errors.DEFAULT_NOT_FOUND.toString('parent loop'));
            return this._.loops[0];
        };

        /**
         * Returns this capsule's protected data associated with the given id (from this[id]), or null if there is no such data.
         *
         * @deprecated since version 0.2.0: instead of this.getData('x') write this.x.get()
         * @protected
         * @since 0.1.0
         * @param {string} id - the id of the data to return
         * @returns {Object} the data associated with the given id, or null if there is no such data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getData = function (id) {
            if (!isString_(id))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure id is a string.'));
            var data = this[id];
            return data != null ? data.get() : null;
        };

        /**
         * Associates the given data to the given id. Overwrites existing data associated with the same id if it exists. Puts new data into this[id].
         *
         * @deprecated since version 0.2.0: instead of this.setData('x', 'hello!') write this.x = new Data('hello!')
         * @protected
         * @since 0.1.0
         * @param {string} id - the id under which to store the given data in the (protected) context of this capsule
         * @param {Object} data - the data to store in the (protected) context of this capsule
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.setData = function (id, data) {
            checkCapsuleAsOwner_(this);
            if (!isString_(id))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure id is a string.'));
            var d = this[id];
            if (d != null)
                d.set(data);
            else
                this[id] = new Data(data);
        };

        /**
         * Detaches all the parts of this capsule (inherited ones included) one by one using [detach]{@link module:capsula.Capsule#detach}. It is assumed that this capsule represents the current context of execution; otherwise an error is thrown.
         *
         * @protected
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.detachAll = function () {
            checkCapsuleAsOwner_(this);
            var parts = this.getParts();
            if (isArray_(parts))
                for (var i = 0; i < parts.length; i++) {
                    parts[i].detach();
                }
        };

        /**
         * Returns a part (of this capsule) with the given name, or null if there is no such a part.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - the name of the part to return
         * @returns {module:capsula.Operation} a part (of this capsule) with the given name, or null if there is no such a part
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getPart = function (name) {
            checkCapsuleAsOwner_(this);
            return getByThisNameAndType_(this, isCapsule, 'parts', name);
        };

        /**
         * Returns an array of parts (inherited ones included) of this capsule.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Capsule>} an array of parts (inherited ones included)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getParts = function () {
            checkCapsuleAsOwner_(this);
            return this._.parts.slice(0); // new array
        };

        /**
         * Returns the currently executing operation.
         *
         * @protected
         * @since 0.1.0
         * @returns {module:capsula.Operation} the currently executing operation
         */
        Capsule.prototype.getCurrentOperation = function () {
            checkCapsuleAsOwner_(this);
            return this._.currentOperation;
        }

        // *****************************
        // Operations
        // *****************************

        /**
         * Main message queue (FIFO buffer) for asynchronous messages
         * @private
         */
        var msgQue_ = {
            head: null,
            tail: null,
        },

        /**
         * Auxiliary message queue (FIFO buffer) for asynchronous messages sent
         * during processing of one message; ensures a breath-first order of
         * processing messages
         * @private
         */
        msgQueAux_ = {
            head: null,
            tail: null,
        },

        /**
         * @private
         */
        postProcessingList_ = [],

        /**
         * @private
         */
        messagesTimeoutID_ = null;

        /**
         * @private
         */
        function getBackwardOperations_(pin) {
            var results = [],
            candidates = ctx_.getInputs(),
            parts = ctx_.getParts(),
            candidate,
            i;

            for (i = 0; i < parts.length; i++) {
                [].push.apply(candidates, parts[i].getOutputs());
            }
            for (i = 0; i < candidates.length; i++) {
                candidate = candidates[i];
                if (candidate._.targets.indexOf(pin) !== -1)
                    results.push(candidate);
            }
            return results;
        }

        /**
         * @private
         */
        function doInContextAndDirection_(srcFunction, dstFunction, operation, args) {
            if (operation._.owner === ctx_) {
                if (operation._.isInput) {
                    return srcFunction.apply(operation, args);
                } else {
                    return dstFunction.apply(operation, args);
                }
            } else if (operation._.owner._.owner === ctx_) {
                if (operation._.isInput) {
                    return dstFunction.apply(operation, args);
                } else {
                    return srcFunction.apply(operation, args);
                }
            } else {
                checkOperationAsThis_(operation);
            }
        }

        /**
         * @private
         */
        function wireThisToSourcesAt_(at, var_args) {
            if (typeof at !== 'number')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure at is a number.'));
            for (var i = 1; i < arguments.length; i++) {
                oProto_.targetAt.apply(arguments[i], [at, this]);
            }
        }

        /**
         * @private
         */
        function applyPipe_(arrPipe, args, context) {
            if (isNothing_(arrPipe))
                return args;
            else if (arrPipe === STOP)
                return STOP;
            else if (isArray_(arrPipe)) {
                return arrPipe.slice(0); // new array
            } else if (typeof arrPipe === 'function') {
                args = executeInContext_(function () {
                        return arrPipe.apply(ctx_, args);
                    }, context);
                if (args !== STOP && !isArray_(args))
                    throw new Error(Errors.ILLEGAL_FILTERS_RETURN_VALUE.toString());
                return args;
            } else
                throw new Error(Errors.ERROR.toString(' (1)'));
        }

        /**
         * <p> <i>Experimental feature. </i>
         * <p> Adds the given function to the list of callbacks that will be called each time asynhronous propagation of [operation]{@link module:capsula.Operation} calls is completed.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param fn {Function} - function to be added
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}
         */
        function signOnForPostProcessing(fn) {
            if (typeof fn !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'fn\' argument is a function.'));
            postProcessingList_.push(fn);
        }

        /**
         * <p> <i>Experimental feature. </i>
         * <p> Removes the given function from the list of callbacks that will be called each time asynhronous propagation of [operation]{@link module:capsula.Operation} calls is completed.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param fn {Function} - function to be removed
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}
         */
        function signOffForPostProcessing(fn) {
            if (typeof fn !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'fn\' argument is a function.'));
            postProcessingList_.splice(postProcessingList_.indexOf(fn), 1);
        }

        /**
         * Processes the list of call backs in postProcessing.
         * @private
         */
        function postProcessing_() {
            var arr = postProcessingList_;
            for (var i = 0; i < arr.length; i++) {
                var fn = arr[i];
                if (typeof fn === 'function')
                    fn();
            }
        }

        /**
         * @private
         */
        function setTimeoutForMessages_() {
            if (!messagesTimeoutID_)
                messagesTimeoutID_ = setTimeout(function () {
                        clearTimeout(messagesTimeoutID_);
                        messagesTimeoutID_ = null;
                        processMessageQueue_(); // this must be at the end
                    }, 0);
        }

        /**
         * @private
         */
        function processMessageQueue_() {
            var msgExists;
            do {
                msgExists = processOneMsg_();
            } while (msgExists);

            postProcessing_();
        }

        /**
         * Processes one message from the message queue, if exists - forwards the
         * message to the recipient operation. Returns false if the queue was empty and no
         * messages have been processed, and true if a message has been processed.
         * @private
         */
        function processOneMsg_() {
            // Add msgQueAux_ at the beginning of msgQue_ and clear it:
            if (msgQueAux_.tail) {
                msgQueAux_.tail.next = msgQue_.head;
                msgQue_.head = msgQueAux_.head;
                if (!msgQue_.tail)
                    msgQue_.tail = msgQueAux_.tail;
            }
            msgQueAux_.head = msgQueAux_.tail = null;
            // Take one message from msgQue_:
            if (!msgQue_.head)
                return false;
            var msg = msgQue_.head;
            msgQue_.head = msg.next;
            if (!msg.next)
                msgQue_.tail = null;
            msg.next = null;
            // And process it:
            if (!msg.pin || !isOperation(msg.pin))
                throw new Error(Errors.ERROR.toString(' (2)'));

            try {
                msg.resolve(operationImplNoContextCheck_(msg.pin, msg.msg)); // fulfills promise
            } catch (e) {
                msg.reject(e); // rejects promise
            }

            return true;
        }

        /**
         * Receives the given message on a given pin and (recursively) forwards it
         * to all targets of that pin
         * @private
         */
        function receive_(pin, args, retVal) {
            if (!pin._.entryEnabled)
                return;

            // Determine contexts.
            var newContext,
            curContext;
            if (pin._.isInput) {
                newContext = pin._.owner;
                curContext = newContext._.owner;
            } else {
                curContext = pin._.owner;
                newContext = curContext._.owner;
            }

            pin._.entryLastVal = args;
            args = applyPipe_(pin._.entryPipe, args, curContext);
            if (args === STOP || args[0] === STOP)
                return;

            if (!pin._.exitEnabled)
                return;

            args = applyPipe_(pin._.exitPipe, args, newContext);
            if (args === STOP || args[0] === STOP)
                return;
            pin._.exitLastVal = args;

            var targets = pin._.targets;
            if (!targets || !isArray_(targets))
                throw new Error(Errors.ERROR.toString(' (3)'));
            if (targets.length === 0)
                return;
            targets = targets.slice(0); // new array because the original might get modified during iteration

            for (var i = 0; i < targets.length; i++) {
                var r = targets[i];
                if (isOperation(r)) {
                    receive_(r, args, retVal);
                } else if (typeof r === 'function') {
                    ctx_._.currentOperation = pin;
                    var result = executeInContext_(function () {
                            return r.apply(ctx_, args);
                        }, newContext);
                    ctx_._.currentOperation = null;
                    retVal.push(result);
                } else
                    throw new Error(Errors.ERROR.toString(' (4)'));
            }
        }

        /**
         * Wires the two given [operations]{@link module:capsula.Operation} or the given operation and function according to the current context of execution. At least one of the two arguments must be an operation. There is no requirement in terms of ordering of the two arguments.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param oper1 {module:capsula.Operation | Function} - operation or function to be wired
         * @param oper2 {module:capsula.Operation | Function} - operation or function to be wired
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        function wire(oper1, oper2) {
            if (isOperation(oper1))
                oper1.wire(oper2);
            else if (isOperation(oper2))
                oper2.wire(oper1);
            else
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure either oper1 or oper2 is an operation.'));
        }

        /**
         * @private
         */
        function operationImpl_(operation, args) {
            if (!operation._.isInput)
                checkContextProperty_(operation);
            else
                checkContextOrSubProperty_(operation);

            return operationImplNoContextCheck_(operation, args);
        }

        /**
         * @private
         */
        function operationImplNoContextCheck_(operation, args) {
            var retVal = [];

            receive_(operation, args, retVal);

            if (operation._.unpack && retVal.length < 2)
                return retVal.length === 1 ? retVal[0] : undefined;
            else
                return retVal;
        }

        /**
         * @private
         */
        function sendNoCheck_(operation, args) {
            return new Promise(function (resolve, reject) {
                var m = {
                    pin: operation,
                    msg: args,
                    context: ctx_,
                    resolve: resolve,
                    reject: reject
                };
                var que = msgQueAux_;
                if (!que.tail)
                    que.head = m;
                else
                    que.tail.next = m;
                que.tail = m;
                m.next = null;
                setTimeoutForMessages_();
            });
        }

        /**
         * Returns the id of this operation.
         *
         * @public
         * @since 0.1.0
         * @returns {number} the id of this operation
         */
        Operation.prototype.getId = function () {
            checkOperationAsThis_(this);
            return this._.id;
        };

        /**
         * Returns the owner capsule of this operation.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Capsule} the owner capsule of this operation
         */
        Operation.prototype.getOwner = function () {
            checkOperationAsThis_(this);
            return this._.owner;
        };

        /**
         * Returns the name of this operation.
         *
         * @public
         * @since 0.1.0
         * @returns {string} the name of this operation
         */
        Operation.prototype.getName = function () {
            checkOperationAsThis_(this);
            return this._.name;
        };

        /**
         * Sets a new name to this operation. New name can later be used to obtain a reference to this operation from its owner capsule using [getOperation]{@link module:capsula.Capsule#getOperation}.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - a new name of this operation
         */
        Operation.prototype.setName = function (name) {
            checkOperation_(this);
            checkContextProperty_(this);
            checkName_(name);
            this._.name = name;
        };

        /**
         * <p> Returns the fully qualified name of this operation, using the given separator if provided (if not, the :: is used by default).
         * <p> The fully qualified name comprises the name of this operation, the name of the owner capsule of this operation, the name of its owner, and so on all the way up the capsule hierarchy.
         *
         * @public
         * @since 0.1.0
         * @param {string} [opt_sep] the separator to use to separate names in the returned fully qualified name
         * @returns {string} the fully qualified name of this operation
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.getFQName = function (sep) {
            checkOperationAsThis_(this);
            return getFQName_(this, sep);
        };

        /**
         * Returns whether this operation is input or not.
         *
         * @public
         * @since 0.1.0
         * @returns {boolean} whether this operation is input or not
         */
        Operation.prototype.isInput = function () {
            checkOperationAsThis_(this);
            return this._.isInput;
        };

        /**
         * Returns whether this operation is output or not.
         *
         * @public
         * @since 0.1.0
         * @returns {boolean} whether this operation is output or not
         */
        Operation.prototype.isOutput = function () {
            checkOperationAsThis_(this);
            return !(this._.isInput);
        };

        /**
         * <p> Returns whether this operation belongs to the capsule which represents the current context of execution.
         * <p> In other words, returns whether this.getOwner() === "current context of execution".
         *
         * @public
         * @since 0.1.0
         * @returns {boolean} whether this operation belongs to the capsule which represents the current context of execution
         */
        Operation.prototype.isPublic = function () {
            checkOperation_(this);
            return doInContext_(true, false, this, arguments);
        };

        /**
         * Returns the arguments of the last call to this operation. By default arguments are returned as they were after filtering; unless opt_beforeFiltering is true, in which case the arguments are returned as they were before filtering is applied. For more information on filtering see [operation's documentation]{@link module:capsula.Operation}).
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<Object>} the arguments of the last call to this operation
         */
        Operation.prototype.getLastArguments = function (opt_beforeFiltering) {
            checkOperationAsThis_(this);
            if (opt_beforeFiltering)
                return this._.entryLastVal;
            else
                return this._.exitLastVal;
        };

        /**
         * <p> Sets whether to turn on the unpacking (from array) of a single operation result or not.
         * <p> Since operation call may return multiple results (if it propagates to more than one method), in general the results are returned in an array. However, when there is only one result, it makes sense to unpack it from the array, which is the default behavior.
         * <p> This method sets the behavior of this operation in terms of unpacking of single operation result.
         *
         * @example <caption>Examples of packing and unpacking operation results</caption>
         * var result = myCapsule.myOperation(); // result is "Hello world!"
         *
         * myCapsule.myOperation.setUnpackResult(false); // no unpacking
         *
         * result = myCapsule.myOperation(); // result is ["Hello world!"]
         *
         * @public
         * @since 0.1.0
         * @param {boolean} unpack - whether to turn on the unpacking (from array) of a single operation result or not
         */
        Operation.prototype.setUnpackResult = function (unpack) {
            checkOperationAsThis_(this);
            this._.unpack = unpack;
        };

        /**
         * <p> Returns whether the unpacking (from array) of a single operation result is turned on (default) or not.
         * <p> Since operation call may return multiple results (if it propagates to more than one function), in general the results are returned in an array. However, when there is only one result, it makes sense to unpack it from the array, which is the default behavior.
         *
         * @public
         * @since 0.1.0
         * @returns {boolean} whether the unpacking (from array) of a single operation result is turned on (default) or not
         */
        Operation.prototype.isUnpackResult = function () {
            checkOperationAsThis_(this);
            return this._.unpack;
        };

        /**
         * Returns the filter associated with this operation, if it exists; or null otherwise. The filter can be one of the following: a filter function, an array of objects, or the [STOP constant]{@link module:capsula.STOP}.
         *
         * @public
         * @since 0.1.0
         * @returns {Function | Array.<Object> | module:capsula.STOP} the filter associated with this operation, or null if there is no such a filter
         * @see [setFilter]{@link module:capsula.Operation#setFilter}
         */
        Operation.prototype.getFilter = function () {
            checkOperationAsThis_(this);
            return doInContextAndDirection_(function () {
                return this._.exitPipe;
            }, function () {
                return this._.entryPipe;
            }, this);
        };

        /**
         * Associates the given filter with this operation. The filter can be one of the following: a filter function, a comma-separated list of objects, the [STOP constant]{@link module:capsula.STOP}, or null.
         *
         * @example <caption>Examples of using filters</caption>
         * myCapsule.myOperation.setFilter(capsula.STOP); // stops propagation (execution) of calls to myCapsule.myOperation()
         *
         * myCapsule.myOperation.setFilter('Hello', 'world', 'of', 'filters'); // each call to myCapsule.myOperation() would have these 4 arguments, regardless of the actual arguments
         *
         * myCapsule.myOperation.setFilter(function(){
         *     return []; // each call to myCapsule.myOperation() would have arguments as returned here, regardless of the actual arguments
         * });
         *
         * myCapsule.myOperation.setFilter(null); // removes the fiter from this operation
         *
         * @public
         * @since 0.1.0
         * @param {...Object} var_args - the filter to associate with this operation. The filter can be one of the following: a filter function, a comma-separated list of objects, the [STOP constant]{@link module:capsula.STOP}, or null.
         * @see [operation's documentation]{@link module:capsula.Operation}
         */
        Operation.prototype.setFilter = function (var_args) {
            checkOperationAsThis_(this);
            var pipe;
            if (arguments.length === 1) {
                if (isNothing_(arguments[0]) || typeof arguments[0] === 'function' || arguments[0] === STOP)
                    pipe = arguments[0];
                else
                    pipe = [arguments[0]];
            } else {
                pipe = [];
                for (var i = 0; i < arguments.length; i++)
                    pipe[i] = arguments[i];
            }
            doInContextAndDirection_(function () {
                this._.exitPipe = pipe;
            }, function () {
                this._.entryPipe = pipe;
            }, this);
        };

        /**
         * Returns whether this operation is enabled or not. If disabled, this operation simply does not work, i.e. returns undefined.
         *
         * @public
         * @since 0.1.0
         * @returns {boolean} whether this operation is enabled (working) or not
         */
        Operation.prototype.isEnabled = function () {
            checkOperationAsThis_(this);
            return doInContextAndDirection_(function () {
                return this._.exitEnabled;
            }, function () {
                return this._.entryEnabled;
            }, this);
        };

        /**
         * Enables or disables this operation. If disabled, this operation simply does not work, i.e. returns undefined. Each operation is enabled by default.
         *
         * @public
         * @since 0.1.0
         * @param {boolean} enabled - true to enable this operation, false to disable it
         */
        Operation.prototype.setEnabled = function (enabled) {
            checkOperationAsThis_(this);
            doInContextAndDirection_(function () {
                this._.exitEnabled = !!enabled;
            }, function () {
                this._.entryEnabled = !!enabled;
            }, this);
        };

        /**
         * <p> Creates a new operation of the same type (input or output) as this operation for the capsule that represents the current context of execution (with the given name, if provided). Then, wires that newly created operation to this operation. Returns the newly created operation.
         * <p> In other words, it discloses (publishes) this operation to the interface of the capsule that represents the current context of execution.
         * <p> Assumes this operation belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {string} [opt_name] - the name of the operation to create
         * @returns {module:capsula.Input | module:capsula.Output} the newly created operation
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        Operation.prototype.disclose = function (opt_name) {
            checkOperation_(this);
            checkContextSubProperty_(this);
            var newPin;
            if (this._.isInput)
                newPin = new Input(opt_name);
            else
                newPin = new Output(opt_name);
            newPin.wire(this);
            if (opt_name)
                ctx_[opt_name] = newPin;
            return newPin;
        };

        /**
         * Wires this operation to the given operations and functions in the current context of execution. The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation | Function)} var_args - operations and functions to wire this operation to (an array of operations and functions also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.wire = function (var_args) {
            checkOperation_(this);
            doInContextAndDirection_(oProto_.target, oProto_.source, this, arguments);
        };

        /**
         * Wires this operation to the given operations and functions according to the given <i>at</i> index and the current context of execution. The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {number} at - the index to use when tying this operation to the given operations and functions
         * @param {...(module:capsula.Operation | Function)} var_args - operations and functions to wire this operation to (an array of operations and functions also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [INDEX_OUT_OF_BOUNDS]{@link module:capsula.Errors.INDEX_OUT_OF_BOUNDS}
         */
        Operation.prototype.wireAt = function (at, var_args) {
            checkOperation_(this);
            doInContextAndDirection_(oProto_.targetAt, wireThisToSourcesAt_, this, arguments);
        };

        /**
         * Checks whether this operation is wired to all the given operations and functions in the current context of execution. The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation | Function)} var_args - operations and functions to check (an array of operations and functions also accepted)
         * @returns {boolean} whether this operation is wired to all the given operations and functions (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.isWiredTo = function (var_args) {
            checkOperation_(this);
            return doInContextAndDirection_(oProto_.isSourceOf, oProto_.isTargetOf, this, arguments);
        };

        /**
         * Returns an array of operations and functions this operation is wired to in the current context of execution; or an empty array if it is not wired to any.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<(module:capsula.Operation|Function)>} an array of operations and functions this operation is wired to in the current context of execution; or an empty array
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.getWires = function () {
            checkOperation_(this);
            return doInContextAndDirection_(oProto_.getTargets, oProto_.getSources, this, arguments);
        };

        /**
         * Unwires this operation from all the operations and functions it is wired to in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.unwireAll = function () {
            checkOperation_(this);
            doInContextAndDirection_(oProto_.untargetAll, oProto_.unsourceAll, this, arguments);
        };

        /**
         * Unwires this operation from the given operations and functions in the current context of execution. The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation | Function)} var_args - operations and functions to unwire this operation from (an array of operations and functions also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.unwire = function (var_args) {
            checkOperation_(this);
            doInContextAndDirection_(oProto_.untarget, oProto_.unsource, this, arguments);
        };

        /**
         * First, unwires this operation from all the operations and functions it is wired to in the current context of execution and then wires this operation to the given operations and functions in the current context of execution. The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation | Function)} var_args - operations and functions to rewire this operation to (an array of operations and functions also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.rewire = function (var_args) {
            checkOperation_(this);
            doInContextAndDirection_(oProto_.retarget, oProto_.resource, this, arguments);
        };

        /*
        ------------------------------------------
        |                                        |
        |      -----------                       |
        |      |         |                       |
        |      |         >\                      |
        |      |         | \                     |
        |      -----------  \                    |
        |                    \                   |
        |                     \ -----------      |
        |                      \|         |      |
        >-----------------------> 1       >\     |
        |                       |         | \    |
        |                       -----------  \   |
        |                                     \  |
        |                                      \ |
        |                                       \|
        >---------------------------------------->
        |                                      2 |
        |                                        |
        ------------------------------------------
         */

        // 1, 2

        /**
         * Returns an array of operations (sources) this operation is wired to acting as a target in the current context of execution; or an empty array if it is not wired to any operation (as a target).
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Operation>} an array of operations this operation is wired to acting as a target in the current context of execution; or an empty array
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.getSources = function () {
            checkOperationFunAsTarget_(this);
            return getBackwardOperations_(this);
        };

        /**
         * Checks whether this operation acting as a target in the current context of execution is wired to all the given operations (sources). The function accepts both comma separated list of operations and an array of operations.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation)} var_args - operations to check (an array of operations also accepted)
         * @returns {boolean} whether this target operation is wired to all the given operations (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.isTargetOf = function (var_args) {
            checkOperationAsTarget_(this);
            checkOperationsAsSources_.apply(this, arguments);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            if (arr.length === 0)
                return false;
            var result = true;
            for (var i = 0; i < arr.length; i++)
                result = result && arr[i]._.targets.indexOf(this) !== -1;
            return result;
        };

        /**
         * Wires this operation acting as a target in the current context of execution to the given operations (sources). The function accepts both comma separated list of operations and an array of operations.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation)} var_args - operations to wire this target operation to (an array of operations also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.source = function (var_args) {
            checkOperationAsTarget_(this);
            checkOperationsAsSources_.apply(this, arguments);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++)
                add_.call(arr[i]._.targets, this);
        };

        /**
         * Unwires this operation acting as a target in the current context of execution from all the operations (sources) it is wired to.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.unsourceAll = function () {
            checkOperationAsTarget_(this);
            var sources = getBackwardOperations_(this);
            for (var i = 0; i < sources.length; i++)
                remove_.call(sources[i]._.targets, this);
        };

        /**
         * Unwires this operation acting as a target in the current context of execution from the given operations (sources). The function accepts both comma separated list of operations and an array of operations.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation)} var_args - operations to unwire this target operation from (an array of operations also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.unsource = function (var_args) {
            checkOperationAsTarget_(this);
            checkOperationsAsSources_.apply(this, arguments);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++)
                remove_.call(arr[i]._.targets, this);
        };

        /**
         * First, unwires this operation acting as a target in the current context of execution from all the operations (sources) it is wired to and then wires this operation to the given operations (sources). The function accepts both comma separated list of operations and an array of operations.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation)} var_args - operations to resource this target operation to (an array of operations also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.resource = function (var_args) {
            oProto_.unsourceAll.call(this);
            oProto_.source.apply(this, arguments);
        };

        /*
        ------------------------------------------
        |                                        |
        |      -----------                       |
        |      |         |                       |
        |      |       1 > ---------------------->
        |      |         | \                     |
        |      -----------  \                    |
        |                    \                   |
        |                     \ -----------      |
        |                      \|         |      |
        |     ------------------>         |      |
        |    /                  |         |      |
        |   /                   -----------      |
        |  /                                     |
        | /                                      |
        >---------------------------------------->
        | 2                                      |
        |                                        |
        ------------------------------------------
         */

        // 1, 2

        /**
         * Returns an array of operations and functions (targets) this operation is wired to acting as a source in the current context of execution; or an empty array if it is not wired to any operation (as a source).
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Operation|Function>} an array of operations and functions this operation is wired to acting as a source in the current context of execution; or an empty array
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.getTargets = function () {
            checkOperationAsSource_(this);
            return get_.apply(this._.targets);
        };

        /**
         * Checks whether this operation acting as a source in the current context of execution is wired to all the given operations and functions (targets). The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation|Function)} var_args - operations and functions to check (an array of operations and functions also accepted)
         * @returns {boolean} whether this source operation is wired to all the given operations and functions (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.isSourceOf = function (var_args) {
            checkOperationAsSource_(this);
            checkOperationsFunsAsTargets_.apply(this, arguments);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            if (arr.length === 0)
                return false;
            var result = true;
            for (var i = 0; i < arr.length; i++)
                result = result && this._.targets.indexOf(arr[i]) !== -1;
            return result;
        };

        /**
         * Wires this operation acting as a source in the current context of execution to the given operations and functions (targets). The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation|Function)} var_args - operations and functions to wire this source operation to (an array of operations and functions also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.target = function (var_args) {
            checkOperationAsSource_(this);
            checkOperationsFunsAsTargets_.apply(this, arguments);
            add_.apply(this._.targets, arguments);
        };

        /**
         * Wires this operation acting as a source in the current context of execution to the given operations and functions (targets) according to the given <i>at</i> index. The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {number} at - the index to use when wiring this source operation to the given target operations and functions
         * @param {...(module:capsula.Operation | Function)} var_args - operations and functions to wire this source operation to (an array of operations and functions also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [INDEX_OUT_OF_BOUNDS]{@link module:capsula.Errors.INDEX_OUT_OF_BOUNDS}
         */
        Operation.prototype.targetAt = function (at, var_args) {
            checkOperationAsSource_(this);
            checkOperationsFunsAsTargets_.apply(this, Array.prototype.slice.call(arguments, 1));
            addAt_.apply(this._.targets, arguments);
        };

        /**
         * Unwires this operation acting as a source in the current context of execution from all the operations and functions (targets) it is wired to.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.untargetAll = function () {
            checkOperationAsSource_(this);
            clear_.apply(this._.targets);
        };

        /**
         * Unwires this operation acting as a source in the current context of execution from the given operations and functions (targets). The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation|Function)} var_args - target operations and function to unwire this source operation from (an array of operations and functions also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.untarget = function (var_args) {
            checkOperationAsSource_(this);
            checkOperationsFunsAsTargets_.apply(this, arguments);
            remove_.apply(this._.targets, arguments);
        };

        /**
         * First, unwires this operation acting as a source in the current context of execution from all the operations and functions (targets) it is wired to and then wires this operation to the given operations and functions (targets). The function accepts both comma separated list of operations and functions and an array of operations and functions.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Operation|Function)} var_args - target operations and functions to resource this source operation to (an array of operations and functions also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Operation.prototype.retarget = function (var_args) {
            checkOperationAsSource_(this);
            checkOperationsFunsAsTargets_.apply(this, arguments);
            clear_.apply(this._.targets);
            add_.apply(this._.targets, arguments);
        };

        /**
         * Calls this operation in an asynchronous way. Returns control immediately. Returns Promise.
         *
         * @async
         * @public
         * @since 0.1.0
         * @param {...Object} var_args - operation arguments, as if it was called in a synchronous way
         * @returns {Promise} the promise object
         */
        Operation.prototype.send = function (var_args) {
            checkOperation_(this);

            if (!this._.isInput)
                checkContextProperty_(this);
            else
                checkContextOrSubProperty_(this);

            return sendNoCheck_(this, arguments);
        };

        // *****************************
        // Hook & Loops
        // *****************************

        var onHookDefault_ = function (hookElement, loopElement, afterElement, classes) {},
        offHookDefault_ = function (hookElement, loopElement, classes) {},
        setClassesDefault_ = function (loopElement, classes) {};

        /**
         * @private
         */
        function disclose_(hkLp, name) {
            var newHkLp;
            if (isLoop(hkLp)) {
                newHkLp = new Loop(name);
            } else {
                newHkLp = new Hook(name);
            }
            hkLp.tie(newHkLp);
            if (name)
                ctx_[name] = newHkLp;
            return newHkLp;
        }

        /**
         * <p> This function gives the (domain-specific) meaning to connecting hooks and loops. Before reading this, one should be familiar with [information on hooks and loops]{@link module:capsula.Hook}.
         * <p> Function setDefaultElementHandlers injects onHook, offHook, and setClasses functions into the framework, later to be called by the framework when certain events occur. Events that trigger calls to onHook, offHook, and setClasses functions are related to paths of hooks and loops.
         * <p> onHook, offHook, and setClasses functions are therefore always called with respect to a path that changed: when a path of hooks and loops gets completed onHook function is called; when completed path of hooks and loops gets broken (fragmented) offHook is called; when [setClass]{@link module:capsula.Hook#setClass} is called on a hook that sits on a complete path of hooks and loops setClasses is called. In each of the cases the function may be called more than once, depending on a number of affected elements.
         * <p> onHook and offHook functions should actually modify the hierarchy of (external) elements. onHook function should create a parent-child relationship between two elements. offHook function should break a parent-child relationship between two elements.
         * <p> onHook function is called by the framework with the following arguments: <br>
         * - hookElement - parent element in the parent-child relationship to be created by the onHook function; this element is represented by the connector hook of the path that just got completed <br>
         * - loopElement - child element in the parent-child relationship to be created by the onHook function; this element is represented by the connector loop of the path that just got completed <br>
         * - afterElement - the element before which the loopElement should be placed in a collection of child elements of the hookElement <br>
         * - classes - a collection of classes to add to the loopElement (interpretation of classes is left undefined and depends on the domain); (see hook's [setClass method]{@link module:capsula.Hook#setClass}) <br>
         * <p> offHook function is called by the framework with the following arguments: <br>
         * - hookElement - parent element in the parent-child relationship to be broken by the offHook function; this element is represented by the connector hook of the path that just got broken <br>
         * - loopElement - child element in the parent-child relationship to be broken by the offHook function; this element is represented by the connector loop of the path that just got broken <br>
         * - classes - a collection of classes to remove from the loopElement <br>
         * <p> setClasses function should apply the list of classes to an element.
         * <p> setClasses function is called by the framework with the following arguments: <br>
         * - loopElement - this element is represented by the connector loop of the complete path in which any of the hooks got its class modified (by setClass) <br>
         * - classes - a collection of classes to set to the loopElement <br>
         * <p> The example bellow shows how to implement onHook, offHook, and setClasses functions for DOM elements. This example is exactly how [html.js module]{@link module:html} injects these functions into the framework to handle hierarchy of HTML (DOM) elements.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param {Function} onHook - function that creates a parent-child relationship between two (external) elements
         * @param {Function} offHook - function that breaks a parent-child relationship between two (external) elements
         * @param {Function} setClasses - function that updates classes of an element
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}
         *
         * @example <caption>Example of setting onHook and offHook functions when elements are assumed to be the DOM elements</caption>
         * capsula.setDefaultElementHandlers(
         *     function onHook(hookElement, loopElement, afterElement, classes) {
         *         if (afterElement)
         *             hookElement.insertBefore(loopElement, afterElement); // DOM's insertBefore
         *         else
         *             hookElement.appendChild(loopElement); // DOM's appendChild
         *         for (var i = 0; i < classes.length; i++)
         *             loopElement.classList.add(classes[i]); // DOM's classList and add
         *     },
         *     function offHook(hookElement, loopElement, classes) {
         *         if (loopElement.parentElement === hookElement)
         *             hookElement.removeChild(loopElement); // DOM's removeChild
         *         for (var i = 0; i < classes.length; i++)
         *             loopElement.classList.remove(classes[i]); // DOM's classList and remove
         *     },
         *     function setClasses(loopElement, classes){
         *         var classList = loopElement.classList;
         *         while (classList.length > 0)
         *             classList.remove(classList.item(0));
         *         classList.add.apply(classList, classes);
         *     }
         * );
         *
         */
        function setDefaultElementHandlers(onHook, offHook, setClasses) {
            if (typeof onHook !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'onHook\' is a function.'));
            if (typeof offHook !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'offHook\' is a function.'));
            if (typeof setClasses !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'setClasses\' is a function.'));
            onHookDefault_ = onHook;
            offHookDefault_ = offHook;
            setClassesDefault_ = setClasses;
        }

        /**
         * @private
         */
        function getTopmost_(hkLp) {
            for (; hkLp._.up; hkLp = hkLp._.up) {}
            return hkLp;
        }

        /**
         * @private
         */
        function getFirstLeaveLoop_(hkLp) {
            var children = hkLp._.children;
            if (children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    var result = getFirstLeaveLoop_(child);
                    if (result)
                        return result;
                }
            } else if (hkLp._.el != null) {
                return hkLp;
            }
            return null;
        }

        /**
         * @private
         */
        function getLeaveLoops_(hkLp, loops) {
            var children = hkLp._.children;
            if (children.length > 0) {
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (isLoop(child) && child._.children.length === 0) {
                        if (child._.el != null)
                            loops.push(child);
                    } else {
                        getLeaveLoops_(child, loops);
                    }
                }
            } else if (isLoop(hkLp) && hkLp._.el != null) {
                loops.push(hkLp);
            }
        }

        /**
         * @private
         */
        function getNextLoop_(top, bot, at) {
            if (!top || !bot)
                return null;

            if (typeof at === 'number') {
                for (var i = at; i < top._.children.length; i++) {
                    var result = getFirstLeaveLoop_(top._.children[i]);
                    if (result)
                        return result;
                }
            }

            return getNextLoop_(top._.up, top, top._.up != null ? top._.up._.children.indexOf(top) + 1 : null);
        }

        /**
         * @private
         */
        function propagateEvent_(hkLp, eventType) {
            for (; hkLp._.up; hkLp = hkLp._.up) {
                var fnToExecute = hkLp._[eventType];
                if (fnToExecute)
                    executeInContext_(fnToExecute, hkLp._.owner, hkLp._.owner);
            }
        }

        /**
         * @private
         */
        function getClasses_(hkLp) {
            var classes = [];
            for (; hkLp._.up; hkLp = hkLp._.up) {
                if (isString_(hkLp._.cls))
                    classes.splice(0, 0, hkLp._.cls);
            }
            return classes;
        }

        /**
         * @private
         */
        function tieTopBot_(top, bot, at) {
            var nextLoop = getNextLoop_(top, bot, at); // nextLoop must be found before the structure is modified bellow.

            if (typeof at === 'number')
                top._.children.splice(at, 0, bot);
            else
                top._.children.push(bot);
            bot._.up = top;

            var loops = [];
            getLeaveLoops_(bot, loops);
            var topmost = getTopmost_(top);
            if (isHook(topmost) && topmost._.el) {
                for (var i = 0; i < loops.length; i++) {
                    onHookDefault_(topmost._.el, loops[i]._.el, nextLoop ? nextLoop._.el : null, getClasses_(loops[i]));
                    propagateEvent_(loops[i], 'onHook');
                }
            }
        }

        /**
         * @private
         */
        function untieTopBot_(top, bot) {
            if (!top || !bot)
                return;

            var botIndex = top._.children.indexOf(bot);
            if (botIndex >= 0 && bot._.up === top)
                top._.children.splice(botIndex, 1);
            else
                return;
            bot._.up = null;

            var loops = [];
            getLeaveLoops_(bot, loops);
            var topmost = getTopmost_(top);
            if (isHook(topmost) && topmost._.el) {
                for (var i = 0; i < loops.length; i++) {
                    offHookDefault_(topmost._.el, loops[i]._.el, getClasses_(loops[i]).concat(getClasses_(top)));
                    propagateEvent_(loops[i], 'offHook');
                    propagateEvent_(top, 'offHook');
                }
            }

            var parentRef = bot._.parentRef;
            if (parentRef)
                parentRef.detach(); // detaches ElementRef created in renderInto
            bot._.parentRef = null;
        }

        /**
         * @private
         */
        function unwireCollections_(parents, children) {
            var i,
            j;
            for (i = 0; i < children.length; i++) {
                var c = children[i];
                for (j = 0; j < parents.length; j++) {
                    var p = parents[j];
                    if (c._.up === p)
                        untieTopBot_(p, c);
                }
            }
        }

        /**
         * Ties the two given [hooks]{@link module:capsula.Hook} or [loops]{@link module:capsula.Loop} according to the current context of execution. There is no requirement in terms of ordering of the two arguments.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param hkLp1 {module:capsula.Hook | module:capsula.Loop} - hook or loop to be tied
         * @param hkLp2 {module:capsula.Hook | module:capsula.Loop} - hook or loop to be tied
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        function tie(hkLp1, hkLp2) {
            checkHookLoop_(hkLp1);
            hkLp1.tie(hkLp2);
        }

        /**
         * Returns the id of this hook.
         *
         * @public
         * @since 0.1.0
         * @returns {number} the id of this hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getId = function () {
            checkHookAsThis_(this);
            return this._.id;
        };

        /**
         * <p> Sets onHook and offHook callbacks to be called each time the path of this hook is completed or broken.
         * <p> onHook and offHook callbacks are always called with respect to a path that changed: when a path of this hook gets completed onHook function is called; when completed path of this hook is broken (fragmented) offHook is called.
         * <p> The callbacks are called in the context of the owner capsule of this hook; reference "this" in callbacks points again to the owner of this hook.
         *
         * @public
         * @since 0.1.0
         * @param {Function} onHook - callback function to be called each time a path of this hook gets completed
         * @param {Function} offHook - callback function to be called each time a complete path of this hook gets broken (fragmented)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.setEventHandlers = function (onHook, offHook) {
            if (onHook && typeof onHook !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'onHook\' is a function or null.'));
            if (offHook && typeof offHook !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'offHook\' is a function or null.'));
            checkHookAsChild_(this);
            this._.onHook = onHook;
            this._.offHook = offHook;
        };

        /**
         * Sets a class to this hook. When a class is set to a hook, each element represented by this hook's subtree would be flagged by this class. To understand how this flagging works [setDefaultElementHandlers]{@link module:capsula.setDefaultElementHandlers} should be consulted.
         *
         * @param {string} cls - the class to set to this hook
         * @see [setDefaultElementHandlers]{@link module:capsula.setDefaultElementHandlers}
         * @public
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.setClass = function (cls) {
            if (!isNothing_(cls) && (!isString_(cls) || cls.length === 0))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure if not null \'cls\' is a non-empty string.'));
            checkHookAsChild_(this);

            this._.cls = cls;

            var topmost = getTopmost_(this);
            if (isHook(topmost) && topmost._.el) {
                var loops = [];
                getLeaveLoops_(this, loops);
                for (var i = 0; i < loops.length; i++)
                    setClassesDefault_(loops[i]._.el, getClasses_(loops[i]));
            }
        };

        /**
         * Returns the owner capsule of this hook.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Capsule} the owner capsule of this hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getOwner = function () {
            checkHookAsThis_(this);
            return this._.owner;
        };

        /**
         * Returns the name of this hook.
         *
         * @public
         * @since 0.1.0
         * @returns {string} the name of this hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getName = function () {
            checkHookAsThis_(this);
            return this._.name;
        };

        /**
         * Sets a new name to this hook. New name can later be used to obtain a reference to this hook from its owner capsule using [getHook]{@link module:capsula.Capsule#getHook}.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - a new name of this hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        Hook.prototype.setName = function (name) {
            checkHookAsChild_(this);
            checkName_(name);
            this._.name = name;
        };

        /**
         * <p> Returns the fully qualified name of this hook, using the given separator if provided (if not, the :: is used by default).
         * <p> The fully qualified name comprises the name of this hook, the name of the owner capsule of this hook, the name of its owner, and so on all the way up the capsule hierarchy.
         *
         * @public
         * @since 0.1.0
         * @param {string} [opt_sep] the separator to use to separate names in the returned fully qualified name
         * @returns {string} the fully qualified name of this hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getFQName = function (sep) {
            checkHookAsThis_(this);
            return getFQName_(this, sep);
        };

        /**
         * <p> Returns whether this hook belongs to the capsule which is the current context of execution.
         * <p> In other words, returns whether this.getOwner() === current context of execution.
         *
         * @public
         * @since 0.1.0
         * @returns {boolean} whether this hook belongs to the capsule which is the current context of execution
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.isPublic = function () {
            checkHook_(this);
            return doInContext_(true, false, this, arguments);
        };

        /**
         * <p> Renders this hook (i.e. the DOM elements it represents) into the given DOM element.
         *
         * @public
         * @since 0.2.0
         * @param {Element} el - the DOM element into which to render this hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.renderInto = function (el) {
            checkHookAsChild_(this);
            var parentRef = this._.parentRef;
            if (parentRef)
                parentRef.detach();
            var newRef = new ElementRef(el);
            this._.parentRef = newRef;
            newRef.hook.add(this);
        };

        /**
         * <p> Returns the parent hook this hook is tied to; or null if it is not tied to a parent hook in the current context of execution.
         * <p> Assumes this hook belongs to the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Hook} the parent hook this hook is tied to (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getParent = function () {
            checkHookAsChild_(this);
            return this._.up;
        };

        /**
         * <p> Ties this hook to the given parent hook in the current context of execution.
         * <p> Assumes this hook belongs to the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook} parent - a parent hook to tie this hook to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.setParent = function (parent) {
            checkHookAsChild_(this);
            if (parent)
                checkHookAsParent_(parent);
            untieTopBot_(this._.up, this);
            if (parent)
                tieTopBot_(parent, this);
        };

        /**
         * Returns an array of hooks and loops this hook is tied to acting as a parent in the current context of execution; or an empty array if it is not tied to any hook or loop. It is assumed that this hook belongs to a part capsule of the capsule that represents the current context of execution; otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Hook | module:capsula.Loop>} an array of hooks and loops this hook is tied to acting as a parent in the current context of execution; or an empty array
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getChildren = function () {
            checkHookAsParent_(this);
            return get_.apply(this._.children);
        };

        /**
         * Ties this hook acting as a parent in the current context of execution to the given hooks and loops. It is assumed that this hook belongs to a part capsule of the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to tie this parent hook to (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.add = function (var_args) {
            checkHook_(this);
            Hook.prototype.addAt.apply(this, [this._.children.length].concat(Array.prototype.slice.call(arguments, 0)));
        };

        /**
         * Ties this hook acting as a parent in the current context of execution to the given hooks and loops according to the given <i>at</i> index. It is assumed that this hook belongs to a part capsule of the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {number} at - the index to use when tying this parent hook to the given hooks and loops
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to tie this parent hook to (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [INDEX_OUT_OF_BOUNDS]{@link module:capsula.Errors.INDEX_OUT_OF_BOUNDS}
         */
        Hook.prototype.addAt = function (at, var_args) {
            checkHookAsParent_(this);
            checkBounds_(at, this._.children.length, 'at');
            checkHookLoopAsChildren_.apply(this, Array.prototype.slice.call(arguments, 1));

            var skip = 0,
            arr = arguments[1];
            if (!isArray_(arr)) {
                skip = 1;
                arr = arguments;
            }
            for (var i = arr.length - 1; i >= skip; i--) {
                untieTopBot_(arr[i]._.up, arr[i]);
                tieTopBot_(this, arr[i], at);
            }
        };

        /**
         * Checks whether this hook acting as a parent in the current context of execution is tied to all the given hooks and loops. It is assumed that this hook belongs to a part capsule of the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to check (an array of hooks and loops also accepted)
         * @returns {boolean} whether this parent hook is tied to all the given hooks and loops (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.isParentOf = function (var_args) {
            checkHookAsParent_(this);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            if (arr.length === 0)
                return false;
            var result = true;
            for (var i = 0; i < arr.length; i++) {
                checkHookLoopAsChild_(arr[i]);
                result = result && arr[i]._.up === this;
            }
            return result;
        };

        /**
         * Unties this hook acting as a parent in the current context of execution from all the hooks and loops it is tied to. It is assumed that this hook belongs to a part capsule of the capsule that represents the current context of execution; otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.clear = function () {
            checkHookAsParent_(this);
            var children = this._.children.slice(0); // new array
            for (var i = 0; i < children.length; i++)
                untieTopBot_(this, children[i]);
        };

        /**
         * Unties this hook acting as a parent in the current context of execution from the given hooks and loops. It is assumed that this hook belongs to a part capsule of the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to untie this parent hook from (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.remove = function (var_args) {
            checkHookAsParent_(this);
            checkHookLoopAsChildren_.apply(this, arguments);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++)
                untieTopBot_(this, arr[i]);
        };

        /**
         * First, unties this hook acting as a parent in the current context of execution from all the hooks and loops it is tied to and then ties this hook to the given hooks and loops. It is assumed that this hook belongs to a part capsule of the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to re-tie this parent hook to (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.set = function (var_args) {
            Hook.prototype.clear.apply(this);
            Hook.prototype.add.apply(this, arguments);
        };

        /**
         * Ties this hook to the given hooks and loops in the current context of execution. Note that having multiple arguments makes sense only when this hook acts as a parent in the current context of execution i.e. when it belongs to a part capsule of the capsule that represents the current context of execution. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to tie this hook to (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.tie = function (var_args) {
            checkHook_(this);
            var args = arguments[0],
            that = this;
            if (!isArray_(args))
                args = arguments;
            doInContext_(function () {
                var arg = args[0];
                checkHook_(arg);
                arg.add(that);
            }, Hook.prototype.add, this, arguments);
        };

        /**
         * <p> Creates a new hook for the capsule that represents the current context of execution (with the given name, if provided). Then, ties that newly created hook to this hook. Returns the newly created hook.
         * <p> In other words, it discloses (publishes) this hook to the interface of the capsule that represents the current context of execution.
         * <p> Assumes this hook belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {string} [opt_name] - the name of the newly created hook
         * @returns {module:capsula.Hook} the newly created hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        Hook.prototype.disclose = function (opt_name) {
            checkHookAsParent_(this);
            return disclose_(this, opt_name);
        };

        /**
         * Returns the id of this loop.
         *
         * @public
         * @since 0.1.0
         * @returns {number} the id of this loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getId = function () {
            checkLoopAsThis_(this);
            return this._.id;
        };

        /**
         * <p> Sets onHook and offHook callbacks to be called each time the path of this loop is completed or broken.
         * <p> onHook and offHook callbacks are always called with respect to a path that changed: when a path of this loop gets completed onHook function is called; when completed path of this loop is broken (fragmented) offHook is called.
         * <p> The callbacks are called in the context of the owner capsule of this loop; reference "this" in callbacks points again to the owner of this loop.
         *
         * @public
         * @since 0.1.0
         * @param {Function} onHook - callback function to be called each time a path of this loop gets completed
         * @param {Function} offHook - callback function to be called each time a complete path of this loop gets broken (fragmented)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.setEventHandlers = function (onHook, offHook) {
            if (onHook && typeof onHook !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'onHook\' is a function or null.'));
            if (offHook && typeof offHook !== 'function')
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'offHook\' is a function or null.'));
            checkLoopAsParent_(this);
            this._.onHook = onHook;
            this._.offHook = offHook;
        };

        /**
         * Sets a class to this loop. When a class is set to a loop, each element represented by this loop's subtree would be flagged by this class. To understand how this flagging works [setDefaultElementHandlers]{@link module:capsula.setDefaultElementHandlers} should be consulted.
         *
         * @param {string} cls - the class to set to this loop
         * @see [setDefaultElementHandlers]{@link module:capsula.setDefaultElementHandlers}
         * @public
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.setClass = function (cls) {
            if (!isNothing_(cls) && (!isString_(cls) || cls.length === 0))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure if not null \'cls\' is a non-empty string.'));
            checkLoopAsParent_(this);

            this._.cls = cls;

            var topmost = getTopmost_(this);
            if (isHook(topmost) && topmost._.el) {
                var loops = [];
                getLeaveLoops_(this, loops);
                for (var i = 0; i < loops.length; i++)
                    setClassesDefault_(loops[i]._.el, getClasses_(loops[i]));
            }
        };

        /**
         * Returns the owner capsule of this loop.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Capsule} the owner capsule of this loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getOwner = function () {
            checkLoopAsThis_(this);
            return this._.owner;
        };

        /**
         * Returns the name of this loop.
         *
         * @public
         * @since 0.1.0
         * @returns {string} the name of this loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getName = function () {
            checkLoopAsThis_(this);
            return this._.name;
        };

        /**
         * Sets a new name to this loop. New name can later be used to obtain a reference to this loop from its owner capsule using [getLoop]{@link module:capsula.Capsule#getLoop}.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - a new name of this loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        Loop.prototype.setName = function (name) {
            checkLoopAsParent_(this);
            checkName_(name);
            this._.name = name;
        };

        /**
         * <p> Returns the fully qualified name of this loop, using the given separator if provided (if not, the :: is used by default).
         * <p> The fully qualified name comprises the name of this loop, the name of the owner capsule of this loop, the name of its owner, and so on all the way up the capsule hierarchy.
         *
         * @public
         * @since 0.1.0
         * @param {string} [opt_sep] the separator to use to separate names in the returned fully qualified name
         * @returns {string} the fully qualified name of this loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getFQName = function (opt_sep) {
            checkLoopAsThis_(this);
            return getFQName_(this, opt_sep);
        };

        /**
         * <p> Returns whether this loop belongs to the capsule which is the current context of execution.
         * <p> In other words, returns whether this.getOwner() === current context of execution.
         *
         * @public
         * @since 0.1.0
         * @returns {boolean} whether this loop belongs to the capsule which is the current context of execution
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.isPublic = function () {
            checkLoop_(this);
            return doInContext_(true, false, this, arguments);
        };

        /**
         * <p> Renders this loop (i.e. the DOM element this loop represents) into the given DOM element.
         *
         * @public
         * @since 0.1.0
         * @param {Element} el - the DOM element into which to render this loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.renderInto = function (el) {
            checkLoopAsChild_(this);
            var parentRef = this._.parentRef;
            if (parentRef)
                parentRef.detach();
            var newRef = new ElementRef(el);
            this._.parentRef = newRef;
            newRef.hook.add(this);
        };

        /**
         * <p> Returns the parent hook or loop this loop is tied to; or null if it is not tied to a parent hook or loop in the current context of execution.
         * <p> Assumes this loop belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Hook | module:capsula.Loop} the parent hook or loop this loop is tied to (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getParent = function () {
            checkLoopAsChild_(this);
            return this._.up;
        };

        /**
         * <p> Ties this loop to the given parent hook or loop in the current context of execution.
         * <p> Assumes this loop belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook | module:capsula.Loop} parent - a parent hook or loop to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.setParent = function (parent) {
            checkLoopAsChild_(this);
            if (parent)
                checkHookLoopAsParent_(parent);
            untieTopBot_(this._.up, this);
            if (parent)
                tieTopBot_(parent, this);
        };

        /**
         * Returns an array of loops this loop is tied to acting as a parent in the current context of execution; or an empty array if it is not tied to any loop. It is assumed that this loop belongs to the capsule that represents the current context of execution; otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Loop>} an array of loops this loop is tied to acting as the current context of execution; or an empty array
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getChildren = function () {
            checkLoopAsParent_(this);
            return get_.apply(this._.children);
        };

        /**
         * Ties this loop acting as a parent in the current context of execution to the given loops. It is assumed that this loop belongs to the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of loops and an array of loops.
         *
         * @public
         * @since 0.1.0
         * @param {...module:capsula.Loop} var_args - loops to tie this parent loop to (an array of loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.add = function (var_args) {
            checkLoop_(this);
            Loop.prototype.addAt.apply(this, [this._.children.length].concat(Array.prototype.slice.call(arguments, 0)));
        };

        /**
         * Ties this loop acting as a parent in the current context of execution to the given loops according to the given <i>at</i> index. It is assumed that this loop belongs to the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of loops and an array of loops.
         *
         * @public
         * @since 0.1.0
         * @param {number} at - the index to use when tying this parent loop to the given loops
         * @param {...module:capsula.Loop} var_args - loops to tie this parent loop to (an array of loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [INDEX_OUT_OF_BOUNDS]{@link module:capsula.Errors.INDEX_OUT_OF_BOUNDS}
         */
        Loop.prototype.addAt = function (at, var_args) {
            checkLoopAsParent_(this);
            checkBounds_(at, this._.children.length, 'at');
            checkHookLoopAsChildren_.apply(this, Array.prototype.slice.call(arguments, 1));

            var skip = 0,
            arr = arguments[1];
            if (!isArray_(arr)) {
                skip = 1;
                arr = arguments;
            }
            for (var i = arr.length - 1; i >= skip; i--) {
                untieTopBot_(arr[i]._.up, arr[i]);
                tieTopBot_(this, arr[i], at);
            }
        };

        /**
         * Checks whether this loop acting as a parent in the current context of execution is tied to all the given loops. It is assumed that this loop belongs to the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of loops and an array of loops.
         *
         * @public
         * @since 0.1.0
         * @param {...module:capsula.Loop} var_args - loops to check (an array of loops also accepted)
         * @returns {boolean} whether this parent loop is tied to all the given loops (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.isParentOf = function (var_args) {
            checkLoopAsParent_(this);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            if (arr.length === 0)
                return false;
            var result = true;
            for (var i = 0; i < arr.length; i++) {
                checkHookLoopAsChild_(arr[i]);
                result = result && arr[i]._.up === this;
            }
            return result;
        };

        /**
         * Unties this loop acting as a parent in the current context of execution from all the loops it is tied to. It is assumed that this loop belongs to the capsule that represents the current context of execution; otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.clear = function () {
            checkLoopAsParent_(this);
            var children = this._.children.slice(0); // new array
            for (var i = 0; i < children.length; i++)
                untieTopBot_(this, children[i]);
        };

        /**
         * Unties this loop acting as a parent in the current context of execution from the given loops. It is assumed that this loop belongs to the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of loops and an array of loops.
         *
         * @public
         * @since 0.1.0
         * @param {...module:capsula.Loop} var_args - loops to untie this parent loop from (an array of loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.remove = function (var_args) {
            checkLoopAsParent_(this);
            checkHookLoopAsChildren_.apply(this, arguments);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++)
                untieTopBot_(this, arr[i]);
        };

        /**
         * First, unties this loop acting as a parent in the current context of execution from all the loops it is tied to and then ties this loop to the given loops. It is assumed that this loop belongs to the capsule that represents the current context of execution; otherwise it throws error. The function accepts both comma separated list of loops and an array of loops.
         *
         * @public
         * @since 0.1.0
         * @param {...module:capsula.Loop} var_args - loops to re-tie this parent loop to (an array of loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.set = function (var_args) {
            Loop.prototype.clear.apply(this);
            Loop.prototype.add.apply(this, arguments);
        };

        /**
         * Ties this loop to the given parent hook or loop or the given child loops in the current context of execution. The function accepts loops in an array as well.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook | module:capsula.Loop | Array.<module:capsula.Loop>} var_args - hook, loop, or an array of loops to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.tie = function (var_args) {
            checkLoop_(this);

            var args = arguments[0],
            that = this;
            if (!isArray_(args))
                args = arguments;

            doInContext_(Loop.prototype.add, function () {
                var arg = args[0];
                checkHookLoop_(arg);
                that.setParent(arg);
            }, this, arguments);
        };

        /**
         * <p> Creates a new loop for the capsule that represents the current context of execution (with the given name, if provided). Then, ties that newly created loop to this loop. Returns the newly created loop.
         * <p> In other words, it discloses (publishes) this loop to the interface of the capsule that represents the current context of execution.
         * <p> Assumes this loop belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {string} [opt_name] - the name of the newly created loop
         * @returns {module:capsula.Loop} the newly created loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        Loop.prototype.disclose = function (opt_name) {
            checkLoopAsChild_(this);
            return disclose_(this, opt_name);
        };

        /**
         * Returns the id of this data.
         *
         * @public
         * @since 0.2.0
         * @returns {number} the id of this data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Data.prototype.getId = function () {
            checkDataAsThis_(this);
            return this._.id;
        };

        /**
         * Returns the owner capsule of this data.
         *
         * @public
         * @since 0.2.0
         * @returns {module:capsula.Capsule} the owner capsule of this data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Data.prototype.getOwner = function () {
            checkDataAsThis_(this);
            return this._.owner;
        };

        /**
         * Returns the name of this data.
         *
         * @public
         * @since 0.2.0
         * @returns {string} the name of this data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Data.prototype.getName = function () {
            checkDataAsThis_(this);
            return this._.name;
        };

        /**
         * Sets a new name to this data.
         *
         * @public
         * @since 0.2.0
         * @param {string} name - a new name of this data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        Data.prototype.setName = function (name) {
            checkDataAsThis_(this);
            checkName_(name);
            this._.name = name;
        };

        /**
         * <p> Returns the fully qualified name of this data, using the given separator if provided (if not, the :: is used by default).
         * <p> The fully qualified name comprises the name of this data, the name of the owner capsule of this data, the name of its owner, and so on all the way up the capsule hierarchy.
         *
         * @public
         * @since 0.2.0
         * @param {string} [opt_sep] the separator to use to separate names in the returned fully qualified name
         * @returns {string} the fully qualified name of this data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Data.prototype.getFQName = function (opt_sep) {
            checkDataAsThis_(this);
            return getFQName_(this, opt_sep);
        };

        /**
         * Returns protected information of this data.
         *
         * @public
         * @since 0.2.0
         * @returns {Object} protected information (data) of this data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Data.prototype.get = function () {
            checkDataAsThis_(this);
            return this._.data;
        };

        /**
         * Sets protected information to this data.
         *
         * @public
         * @since 0.2.0
         * @param {Object} data - protected information of this data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Data.prototype.set = function (data) {
            checkDataAsThis_(this);
            return this._.data = data;
        };

        // *****************************
        // 'is' / 'are' / 'has' / 'does' methods (return true or false)
        // *****************************

        /**
         * @private
         */
        function areAllStrings_(arr) {
            for (var i = 0; i < arr.length; i++) {
                if (!isString_(arr[i]))
                    return false;
            }
            return true;
        }

        /**
         * @private
         */
        function isArguments_(obj) {
            return Object.prototype.toString.call(obj) === '[object Arguments]';
        }

        /**
         * Checks whether an object is Array or not.
         *
         * @private
         * @param {Object} subject - the variable that is tested for Array identity check
         * @returns weather the variable is an Array or not
         *
         * Attribution: https://shamasis.net/2011/08/infinite-ways-to-detect-array-in-javascript/
         */
        var isArray_ = (function () {
            // Use compiler's own isArray when available
            if (Array.isArray) {
                return Array.isArray;
            }

            // Retain references to variables for performance
            // optimization
            var objectToStringFn = Object.prototype.toString,
            arrayToStringResult = objectToStringFn.call([]);

            return function (subject) {
                return objectToStringFn.call(subject) === arrayToStringResult;
            };
        }
            ());

        /**
         * Checks whether the given object is (instance of) capsule or not.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param {Object} obj - object to be checked
         * @returns {boolean} whether the given object is (instance of) capsule or not
         */
        function isCapsule(obj) {
            return obj instanceof Capsule;
        }

        /**
         * Checks whether the given function is capsule constructor (i.e. created using [defCapsule]{@link module:capsula.defCapsule}) or not.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param {Function} func - function to be checked
         * @returns {boolean} whether the given function is capsule constructor or not
         */
        function isCapsuleConstructor(func) {
            for (var f = func; f; f = f.super$)
                if (f !== Capsule)
                    continue;
                else
                    return true;
            return false;
        }

        /**
         * @const
         * @private
         */
        var CONTEXT_CHECK_ENABLED = true;

        /**
         * @private
         */
        function isContext_(capsule) {
            return CONTEXT_CHECK_ENABLED && ctx_ === capsule;
        }

        /**
         * @private
         */
        function isForbidden_(str) {
            return str && (str.indexOf('.') !== -1 || str.indexOf(SEP) !== -1);
        }

        /**
         * @private
         */
        function isFunction_(fnName, def, Base) {
            if (def && typeof def[fnName] === 'function')
                return true;
            if (Base)
                return typeof Base.prototype[fnName] === 'function'; // goes up the __proto__ chain
            return false;
        }

        /**
         * Checks whether the given object is [hook]{@link module:capsula.Hook} or not.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param {Object} obj - object to be checked
         * @returns {boolean} whether the given object is hook or not
         */
        function isHook(hook) {
            return hook instanceof Hook;
        }

        /**
         * @private
         */
        function isHookOrLoop_(obj) {
            return isLoop(obj) || isHook(obj);
        }

        /**
         * @private
         */
        function isInput_(obj) {
            return isOperation(obj) && obj.isInput();
        }

        /**
         * Checks whether the given object is [loop]{@link module:capsula.Loop} or not.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param {Object} obj - object to be checked
         * @returns {boolean} whether the given object is loop or not
         */
        function isLoop(loop) {
            return loop instanceof Loop;
        }

        /**
         * Checks whether the given object is [data]{@link module:capsula.Data} or not.
         *
         * @memberof module:capsula
         * @public
         * @since 0.2.0
         * @static
         * @param {Object} obj - object to be checked
         * @returns {boolean} whether the given object is data or not
         */
        function isData(obj) {
            return obj instanceof Data;
        }

        /**
         * @private
         */
        function isNothing_(obj) {
            return obj === null || obj === undefined;
        }

        /**
         * @private
         */
        function isNumber_(obj) {
            return typeof obj === 'number';
        }

        /**
         * @private
         */
        function isObject_(obj) {
            return obj && typeof obj === 'object' && !isArray_(obj);
        }

        /**
         * Checks whether the given object is [operation]{@link module:capsula.Operation} or not.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param {Object} obj - object to be checked
         * @returns {boolean} whether the given object is operation or not
         */
        function isOperation(obj) {
            return typeof obj === 'function' && isObject_(obj._);
        }

        /**
         * @private
         */
        function isOutput_(obj) {
            return isOperation(obj) && (!obj.isInput());
        }

        /**
         * @private
         */
        function isString_(obj) {
            return typeof obj === 'string';
        }

        // *****************************
        // Check Functions (throw Exceptions)
        // *****************************

        /**
         * @private
         */
        function checkBounds_(val, boundInclusive, valStr) {
            if (typeof val === 'number') {
                if (val < 0 || val > boundInclusive)
                    throw new Error(Errors.INDEX_OUT_OF_BOUNDS.toString(valStr, val, boundInclusive));
            } else if (val)
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure' + valStr + ' is a number.'));
            else
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure ' + valStr + ' is provided.'));
        }

        /**
         * @private
         */
        function checkCapsule_(obj) {
            if (!isCapsule(obj))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'this\' is a capsule.'));
        }

        /**
         * @private
         */
        function checkCapsuleAsOwner_(obj) {
            checkCapsule_(obj);
            checkContextCapsule_(obj);
        }

        /**
         * @private
         */
        function checkCapsuleAsThis_(obj) {
            checkCapsule_(obj);
            checkContextOrSubCapsule_(obj);
        }

        /**
         * @private
         */
        function checkContextCapsule_(capsule) {
            if (!isContext_(capsule))
                throw new Error(Errors.OUT_OF_CONTEXT.toString());
        }

        /**
         * @private
         */
        function checkContextSubCapsule_(capsule) {
            checkContextCapsule_(getOwner_(capsule));
        }

        /**
         * @private
         */
        function checkContextOrSubCapsule_(capsule) {
            if (isContext_(capsule))
                return;
            checkContextSubCapsule_(capsule);
        }

        /**
         * @private
         */
        function checkContextProperty_(prop) {
            checkContextCapsule_(getOwner_(prop));
        }

        /**
         * @private
         */
        function checkContextSubProperty_(prop) {
            checkContextSubCapsule_(getOwner_(prop));
        }

        /**
         * @private
         */
        function checkContextOrSubProperty_(prop) {
            checkContextOrSubCapsule_(getOwner_(prop));
        }

        /**
         * @private
         */
        function checkData_(obj) {
            if (!isData(obj))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use data here.'));
        }

        /**
         * @private
         */
        function checkDataAsThis_(obj) {
            checkData_(obj);
            checkContextProperty_(obj);
        }

        /**
         * @private
         */
        function checkFilters_() {
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++)
                if (typeof arr[i] !== 'function')
                    throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the argument is a function.'));
        }

        /**
         * @private
         */
        function checkHook_(obj) {
            if (!isHook(obj))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use hook here.'));
        }

        /**
         * @private
         */
        function checkHookAsChild_(hook) {
            checkHook_(hook);
            checkContextProperty_(hook);
        }

        /**
         * @private
         */
        function checkHookAsParent_(hook) {
            checkHook_(hook);
            checkContextSubProperty_(hook);
        }

        /**
         * @private
         */
        function checkHookAsThis_(obj) {
            checkHook_(obj);
            checkContextOrSubProperty_(obj);
        }

        /**
         * @private
         */
        function checkHookLoop_(obj) {
            if (!isHookOrLoop_(obj))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use hook or loop here.'));
        }

        /**
         * @private
         */
        function checkHookLoopAsChild_(hkLp) {
            if (isHook(hkLp))
                checkContextProperty_(hkLp);
            else if (isLoop(hkLp))
                checkContextSubProperty_(hkLp);
            else
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use either a hook or a loop here.'));
        }

        /**
         * @private
         */
        function checkHookLoopAsChildren_() {
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++) {
                checkHookLoopAsChild_(arr[i]);
            }
        }

        /**
         * @private
         */
        function checkHookLoopAsParent_(hkLp) {
            if (isLoop(hkLp))
                checkContextProperty_(hkLp);
            else if (isHook(hkLp))
                checkContextSubProperty_(hkLp);
            else
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use either a hook or a loop here.'));
        }

        /**
         * @private
         */
        function checkLoop_(obj) {
            if (!isLoop(obj))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use loop here.'));
        }

        /**
         * @private
         */
        function checkLoopAsChild_(loop) {
            checkLoop_(loop);
            checkContextSubProperty_(loop);
        }

        /**
         * @private
         */
        function checkLoopsAsChildren_() {
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++) {
                checkLoopAsChild_(arr[i]);
            }
        }

        /**
         * @private
         */
        function checkLoopAsParent_(loop) {
            checkLoop_(loop);
            checkContextProperty_(loop);
        }

        /**
         * @private
         */
        function checkLoopAsThis_(obj) {
            checkLoop_(obj);
            checkContextOrSubProperty_(obj);
        }

        /**
         * @private
         */
        function checkName_(name) {
            if (!isString_(name))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the name argument is a string.'));
            if (isForbidden_(name))
                throw new Error(Errors.FORBIDDEN_NAME.toString('the name argument'));
        }

        /**
         * @private
         */
        function checkOperation_(obj) {
            if (!isOperation(obj))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you use operation here.'));
        }

        /**
         * @private
         */
        function checkOperationAsSource_(pin) {
            checkOperation_(pin);
            checkContextOrSubProperty_(pin);
            if ((ctx_ === pin._.owner && !pin._.isInput) ||
                (ctx_ === pin._.owner._.owner && pin._.isInput))
                throw new Error(Errors.ILLEGAL_OPERATION_TYPE.toString(pin._.name, 'source'));
        }

        /**
         * @private
         */
        function checkOperationsAsSources_() {
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++) {
                checkOperationAsSource_(arr[i]);
            }
        }

        /**
         * @private
         */
        function checkOperationAsTarget_(op) {
            checkOperation_(op);
            checkContextOrSubProperty_(op);
            checkTarget_(op);
        }

        /**
         * @private
         */
        function checkOperationAsThis_(obj) {
            checkOperation_(obj);
            checkContextOrSubProperty_(obj);
        }

        /**
         * @private
         */
        function checkOperationFunAsTarget_(pinFun) {
            if (isOperation(pinFun)) {
                checkContextOrSubProperty_(pinFun);
                checkTarget_(pinFun);
            } else if (typeof pinFun !== 'function') {
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the argument is either an operation or a function.'));
            }
        }

        /**
         * @private
         */
        function checkOperationsFunsAsTargets_() {
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++) {
                checkOperationFunAsTarget_(arr[i]);
            }
        }

        /**
         * @private
         */
        function checkTarget_(op) {
            if ((ctx_ === op._.owner && op._.isInput) ||
                (ctx_ === op._.owner._.owner && !op._.isInput))
                throw new Error(Errors.ILLEGAL_OPERATION_TYPE.toString(op._.name, 'target'));
        }

        // *****************************
        // Utility Functions
        // *****************************

        function getPieceType_(owner, name, compiled) {
            var targetCompiledDef;
            if (owner === 'this') {
                targetCompiledDef = compiled;
            } else {
                var part = compiled.parts[owner];
                if (isCapsuleConstructor(part))
                    targetCompiledDef = part.compiledDef;
                else if (isCapsuleConstructor(part.capsule))
                    targetCompiledDef = part.capsule.compiledDef;
                else if (isCapsuleConstructor(part.new))
                    targetCompiledDef = part.new.compiledDef;
                else // if (isCapsuleConstructor(part.call))
                    targetCompiledDef = part.call.compiledDef;
            }

            if (targetCompiledDef['inputs'].indexOf(name) > -1)
                return ElementType.INPUT;
            else if (targetCompiledDef['outputs'].indexOf(name) > -1)
                return ElementType.OUTPUT;
            else if (targetCompiledDef['hooks'].indexOf(name) > -1)
                return ElementType.HOOK;
            else if (targetCompiledDef['loops'].indexOf(name) > -1)
                return ElementType.LOOP;
            else if (Object.keys(targetCompiledDef['privateMethods']).indexOf(name) > -1)
                return ElementType.METHOD;
            else if (Object.keys(targetCompiledDef['publicMethods']).indexOf(name) > -1)
                return ElementType.METHOD;
            else if (owner === 'this')
                return ElementType.OTHER;
            else
                return ElementType.UNKNOWN;
        }

        /**
         * @private
         */
        function getArguments_(def, capsule, initArgs) {
            var args;
            if (def.hasOwnProperty('arguments')) { // arguments have precedence
                args = def.arguments;
            } else if (def.hasOwnProperty('args')) {
                args = def.args;
            } else if (def.hasOwnProperty('deferredArgs')) {
                args = def.deferredArgs.apply(capsule, initArgs);
            }
            if (args === INIT_ARGS)
                args = initArgs; // use owner's arguments
            else if (args === THIS)
                args = capsule; // use owner capsule
            if (!isArray_(args) && !isArguments_(args))
                args = [args]; // make it array
            return args;
        }

        /**
         * @private
         */
        function getByNameAndType_(collection, name, typeFn) {
            var i,
            p;
            for (i = 0; i < collection.length; i++) {
                p = collection[i];
                if ((!typeFn || p[typeFn]()) && p._.name === name)
                    return p;
            }
            return null;
        }

        /**
         * @private
         */
        function getByThisNameAndType_(that, isFunction, collectionName, name, typeFn) {
            var result = that[name];
            if (!isNothing_(result) && isFunction(result))
                return result;
            else
                return getByNameAndType_(that._[collectionName], name, typeFn);
        }

        /**
         * @private
         */
        function getChildHoop_(capsule) {
            if (capsule === ctx_)
                return capsule.getDefaultChildHook();
            else
                return capsule.getDefaultChildLoop();
        }

        /**
         * @private
         */
        function getChildrenHoops_(var_args) {
            var children = [];
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++) {
                var capsule = arr[i],
                chd;
                checkCapsule_(capsule);
                if (this === ctx_) {
                    chd = capsule.getDefaultChildLoop();
                } else {
                    if (arr[i] === ctx_)
                        chd = capsule.getDefaultChildHook();
                    else
                        chd = capsule.getDefaultChildLoop();
                }
                children.push(chd);
            }
            return children;
        }

        /**
         * @private
         */
        function getDefName_(def) {
            return getPropertyOf_(def, def.substring(0, def.indexOf('.')));
        }

        /**
         * @private
         */
        function getDefOwner_(def) {
            var dotIndex = def.indexOf('.');
            if (dotIndex > -1)
                return def.substring(0, dotIndex);
            else
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure ' + def + ' has dot that separates element owner from its name.'));
        }

        /**
         * @private
         */
        function getFQName_(on, sep) {
            var own = on._.owner;
            return own ? getFQName_(own, sep) + (isString_(sep) ? sep : SEP) + on._.name : on._.name;
        }

        /**
         * @private
         */
        function getOwner_(obj) {
            return obj ? obj._.owner : null;
        }

        /**
         * @private
         */
        function getParentHoop_(capsule) {
            if (capsule === ctx_)
                return capsule.getDefaultParentLoop();
            else
                return capsule.getDefaultParentHook();
        }

        /**
         * @private
         */
        function getPropertyOf_(propStr, owner) {
            owner = owner + '.';
            var i = propStr.indexOf(owner);
            if (i > -1)
                if (propStr.length > i + owner.length)
                    return propStr.substring(i + owner.length);
                else
                    return '';
            else
                return propStr;
        }

        /**
         * @private
         */
        function getSelf_(self, ownerName) {
            return ownerName === 'this' ? self : self[ownerName];
        }

        /**
         * @private
         */
        function getSelfHookOrLoop_(self, name) {
            var result = getByThisNameAndType_(self, isHook, 'hooks', name);
            if (isNothing_(result))
                return getByThisNameAndType_(self, isLoop, 'loops', name);
            return result;
        }

        /**
         * @private
         */
        function getSelfMethod_(self, name) {
            var prop = self[name];
            return typeof prop === 'function' ? prop : null;
        }

        /**
         * @private
         */
        function getSelfOperationOrMethod_(self, name) {
            var result = getByThisNameAndType_(self, isOperation, 'pins', name);
            if (isNothing_(result))
                return getSelfMethod_(self, name);
            return result;
        }

        /**
         * @private
         */
        function onWhat_(capsule, what) {
            var parts = capsule._.parts;
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (typeof part[what] === 'function')
                    executeInContext_(part[what], part, part);
                onWhat_(part, what);
            }
        }

        // *****************************
        // Wrappers
        // *****************************

        /**
         * @private
         */
        function contextWrapper_(fn, context) {
            return function contextWrapper_() {
                return executeInContext_(fn, context, context, arguments);
            };
        }

        /**
         * @private
         */
        function privateWrapper_(fn, superPrototype) {
            return function () {
                checkContextCapsule_(this);
                this._.superPrototype = superPrototype;
                return fn.apply(this, arguments);
            };
        }

        /**
         * @private
         */
        function publicWrapper_(fn, superPrototype) {
            return function () {
                this._.superPrototype = superPrototype;
                return fn.apply(this, arguments);
            };
        }

        // *****************************
        // Collection Management Functions (Collection is 'this')
        // *****************************

        /**
         * @private
         */
        function add_(var_args) {
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
            for (var i = 0; i < arr.length; i++)
                this.push(arr[i]);
        }

        /**
         * @private
         */
        function addAt_(at, var_args) {
            checkBounds_(at, this.length, 'at');
            var skip = 0,
            arr = arguments[1];
            if (!isArray_(arr)) {
                skip = 1;
                arr = arguments;
            }
            for (var i = arr.length - 1; i >= skip; i--)
                this.splice(at, 0, arr[i]);
        }

        /**
         * @private
         */
        function clear_() {
            this.length = 0;
        }

        /**
         * @private
         */
        function get_() {
            return this.slice(0); // new array
        }

        /**
         * @private
         */
        function remove_(var_args) {
            var arr = arguments[0];
            if (!isArray_(arr)) {
                arr = arguments;
            }
            for (var i = 0; i < arr.length; i++) {
                var index = this.indexOf(arr[i]);
                while (index !== -1) {
                    this.splice(index, 1);
                    index = this.indexOf(arr[i]);
                }
            }
        }

        // *****************************
        // Class-Model Methods
        // *****************************

        /**
         * <p> Not meant to be used by regular users; only by those who work on the framework itself.
         * <p> Declares that the derived class Sub (i.e. its constructor function) inherits the base class Base. Sets the prototype chain so that instanceof operator and constructor property work correctly. Also, provides the access to the base class constructor via super$ property of the Sub constructor.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param {Function} Sub - function that acts as a sub-class constructor
         * @param {Function} Base - function constructor that acts as a base class constructor
         */
        function extend(Sub, Base) {
            Sub.prototype = Object.create(Base.prototype);
            Sub.prototype.constructor = Sub;
            Sub.super$ = Base;
        }

        // *****************************
        // Constants
        // *****************************

        /**
         * @const
         * @private
         */
        var SEP = '::',

        /**
         * @const
         * @private
         */
        DYNAMIC = '!',

        /**
         * @const
         * @private
         */
        INIT_ARGS = 'this.args',

        /**
         * @const
         * @private
         */
        THIS = 'this',

        /**
         * @const
         * @private
         */
        NEW = '*',

        /**
         * @const
         * @private
         */
        New = {
            OBJECT: '*{}',
            ARRAY: '*[]',
            MAP: '*Map',
            SET: '*Set',
            WEAKMAP: '*WeakMap',
            WEAKSET: '*WeakSet'
        },

        /**
         * @const
         * @private
         */
        VisibilityType = {
            PRIVATE: 0,
            PUBLIC: 1
        },

        /**
         * @const
         * @private
         */
        ElementType = {
            UNKNOWN: -1,
            OTHER: 0,
            INPUT: 1,
            OUTPUT: 2,
            METHOD: 3,
            HOOK: 4,
            LOOP: 5,
            FILTER: 6
        };

        // *****************************
        // Error Codes
        // *****************************

        /**
         * A collection of [ErrorMessage]{@link module:services.ErrorMessage} objects to use in appropriate erroneous situations.
         *
         * @memberof module:capsula
         * @namespace
         * @public
         * @readonly
         * @since 0.1.0
         * @static
         */
        var Errors = {
            /**
             * Usage: when there is an illegal attempt to break the boundaries of the current context. Error message (with the error code):
             * <p><i> 'Oops! Make sure you do this in the right context. (#100)' </i>
             */
            OUT_OF_CONTEXT: new services.ErrorMessage(100, 'Make sure you do this in the right context.'),

            /**
             * Usage: when function argument is not according to expectations. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Illegal argument(s). $1 (#200)' </i>
             */
            ILLEGAL_ARGUMENT: new services.ErrorMessage(200, 'Illegal argument(s). $1'),

            /**
             * Usage: when specified element (like operation, method, hook, or loop) does not exist. Error message (without $1 and $2 placeholders replaced and with the error code):
             * <p><i> 'Oops! $1 could not be found among $2. (#201)' </i>
             */
            ELEMENT_NOT_FOUND: new services.ErrorMessage(201, '$1 could not be found among $2.'),

            /**
             * Usage: when there is an attempt to access a collection outside of its bounds. Error message (without $1, $2, and $3 placeholders replaced and with the error code):
             * <p><i> 'Oops! $1 value of $2 exceeded the bounds: 0, $3. (#202)' </i>
             * <p> Error message example (with placeholders replaced and with the error code):
             * <p><i> 'Oops! 'at' value of 7 exceeded the bounds: 0, 5. (#202)' </i>
             */
            INDEX_OUT_OF_BOUNDS: new services.ErrorMessage(202, '\'$1\' value of $2 exceeded the bounds: 0, $3.'),

            /**
             * Usage: when the given name breaks the naming rules (i.e. contains dots or separators). Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Make sure $1 contains neither :: nor dot. (#203)' </i>
             */
            FORBIDDEN_NAME: new services.ErrorMessage(203, 'Make sure $1 contains neither ' + SEP + ' nor dot.'),

            /**
             * Usage: when the given name has already been occupied. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Duplicate name found: $1. Make sure operations, methods, hooks, loops, parts, and data all have unique names (inherited ones included). (#204)' </i>
             */
            DUPLICATE_NAME: new services.ErrorMessage(204, 'Duplicate name found: $1. Make sure operations, methods, hooks, loops, parts, and data all have unique names (inherited ones included).'),

            /**
             * Usage: when a filter does not return a proper value. Error message (with the error code):
             * <p><i> 'Oops! Make sure filter returns an array or the STOP message. (#205)' </i>
             */
            ILLEGAL_FILTERS_RETURN_VALUE: new services.ErrorMessage(205, 'Make sure filter returns an array or the STOP message.'),

            /**
             * Usage: when visibility of a method is changed in a subclass (subcapsule). Error message (without $1 and $2 placeholders replaced and with the error code):
             * <p><i> 'Oops! Changing inherited method's visibility is not allowed. Make sure the visibility of method $1 is $2. (#207)' </i>
             */
            ILLEGAL_METHODS_VISIBILITY: new services.ErrorMessage(207, 'Changing inherited method\'s visibility is not allowed. Make sure the visibility of method $1 is $2.'),

            /**
             * Usage: when there is an attempt to instantiate an abstract capsule. Error message (with the error code):
             * <p><i> 'Oops! Abstract capsules cannot be instantiated. Make sure you instantiate the right one. (#300)' </i>
             */
            ABSTRACT_INSTANTIATION: new services.ErrorMessage(300, 'Abstract capsules cannot be instantiated. Make sure you instantiate the right one.'),

            /**
             * Usage: when trying to attach already attached capsule. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Capsule $1 has already been attached in a different context. Make sure you detach it there before attaching it again. (#301)' </i>
             */
            CAPSULE_ALREADY_ATTACHED: new services.ErrorMessage(301, 'Capsule $1 has already been attached in a different context. Make sure you detach it there before attaching it again.'),

            /**
             * Usage: When using capsule that has no default property in place where this is required. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Default $1 could not be found. (#302)' </i>
             */
            DEFAULT_NOT_FOUND: new services.ErrorMessage(302, 'Default $1 could not be found.'),

            /**
             * Usage: when input operation is used in context where output is expected or vice versa. Error message (without $1 and $2 placeholders replaced and with the error code):
             * <p><i> 'Oops! Operation $1 cannot act as a $2 in this context. Make sure you pick the one that can. (#400)' </i>
             */
            ILLEGAL_OPERATION_TYPE: new services.ErrorMessage(400, 'Operation \'$1\' cannot act as a $2 in this context. Make sure you pick the one that can.'),

            /**
             * Usage: when operations of incompatible types are being wired (for example wiring two output operations of sibling capsules). Error message (without $1 and $2 placeholders replaced and with the error code):
             * <p><i> 'Oops! The pair $1 and $2 is incompatible in the current context. Make sure you wire compatible operations. (#401)' </i>
             */
            WIRE_INCOMPATIBILITY: new services.ErrorMessage(401, 'The pair \'$1\' and \'$2\' is incompatible in the current context. Make sure you wire compatible operations.'),

            /**
             * Usage: when incompatible hooks and/or loops are being tied (for example tying two hooks of sibling capsules). Error message (without $1 and $2 placeholders replaced and with the error code):
             * <p><i> 'Oops! The pair $1 and $2 is incompatible in the current context. Make sure you tie compatible hooks/loops. (#500)' </i>
             */
            TIE_INCOMPATIBILITY: new services.ErrorMessage(500, 'The pair \'$1\' and \'$2\' is incompatible in the current context. Make sure you tie compatible hooks/loops.'),

            /**
             * Usage: when somthing really bad happens. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Something went wrong unexpectedly. Have you been monkeying with capsules' internal structures / mechnisms? If not, please let us know about this (and don't forget the stack trace). Thank you. $1 (#666)' </i>
             */
            ERROR: new services.ErrorMessage(666, 'Something went wrong unexpectedly. Have you been monkeying with capsules\' internal structures / mechnisms? If not, please let us know about this (and don\'t forget the stack trace). Thank you. $1')
        };

        // *****************************
        // Setup
        // *****************************

        /**
         * The main capsule implicitly defined as the topmost context of entire
         * execution.
         * @private
         */
        var main_ = new(
                defCapsule({
                    name: 'Main'
                }))();

        main_._.name = 'main'; // so it doesn't end up unnamed

        /**
         * @private
         */
        var ctx_ = main_,

        /**
         * Constant to return from operation's filter function or to use as an argument in operation's [setFilter]{@link module:capsula.Operation#setFilter} to stop propagation of operation call (read more on filters in [setFilter]{@link module:capsula.Operation#setFilter}, [getFilter]{@link module:capsula.Operation#getFilter}, and [operation's documentation]{@link module:capsula.Operation}).
         *
         * @const
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         */
        STOP = {};

        // *****************************
        // Capsules
        // *****************************

        /**
         * Creates an instance of ElementRef capsule around the given element (object).
         *
         * @classdesc
         * <ul>
         * <li> [Capsule]{@link module:capsula.Capsule}
         * </ul>
         * <p> ElementRef capsule wraps (and references) an external element (object) to prepare it to participate in a hierarchy of similar elements. In other words, the ElementRef capsule provides an API around the wrapped element; an API that serves the purpose of [managing hierarchical structures of elements]{@link module:capsula.Hook}.
         * <p> ElementRef capsule wraps a single element and creates one hook and one loop, i.e. the hook and the loop that directly represent the wrapped element. The hook represents it as a parent while the loop represents it as a child in its future parent-child relationships.
         * <p> Connecting hooks and loops only make sense once the element handlers functions are set using the [setDefaultElementHandlers function]{@link module:capsula.setDefaultElementHandlers}.
         *
         * @example <caption>Creating a hierarchy of two elements (widgets in this case)</caption>
         * var divElement = document.getElementById(...); // or document.createElement('div')
         * var labelElement = document.getElementById(...); // or document.createElement('label')
         * var divCapsule = new capsula.ElementRef(divElement);
         * var labelCapsule = new capsula.ElementRef(labelElement);
         *
         * divCapsule.hook.tie(labelCapsule.loop); // this is where the divElement becomes the parent of the labelElement
         *
         * @memberof module:capsula
         * @class
         * @param {Object} el - the element to wrap
         * @public
         * @since 0.1.0
         */
        var ElementRef = defCapsule({
                name: 'ElementRef',

                /**
                 * @alias Collection of Hooks
                 *
                 * @memberof! module:capsula.ElementRef#
                 * @property {module:capsula.Hook} hook - A hook that represents the wrapped element (object).
                 * @public
                 * @since 0.1.0
                 */
                hooks: 'hook',

                /**
                 * @alias Collection of Loops
                 *
                 * @memberof! module:capsula.ElementRef#
                 * @property {module:capsula.Loop} loop - A loop that represents the wrapped object (element).
                 * @public
                 * @since 0.1.0
                 */
                loops: 'loop',
                init: function (el) {
                    this.setElement_(el);
                },
                /**
                 * Returns the wrapped object (element).
                 *
                 * @alias getElement
                 * @memberof! module:capsula.ElementRef#
                 * @public
                 * @returns {Object} the wrapped object (element)
                 * @since 0.1.0
                 */
                '+ getElement': function () {
                    return this.element.get();
                },
                setElement_: function (el) {
                    this.element = new Data(el);
                    this.hook._.el = el;
                    this.loop._.el = el;
                }
            });

        // *****************************
        // Services
        // *****************************

        /**
         * The collection of built-in service types of capsula.js module.
         *
         * @memberof module:capsula
         * @namespace
         * @public
         * @readonly
         * @since 0.1.0
         * @static
         */
        var ServiceType = {
            /**
             * Service type that enables delivery of requests to an [operation]{@link module:capsula.Operation} of the target [capsule]{@link module:capsula.Capsule}. Each service of this type should have the following properties specified in its service config object (the second argument of the service registration [register]{@link module:services.register} function):
             * <p> - (string) type - set to capsula.ServiceType.OPERATION <br>
             * - operation - target operation to which to deliver the package (of requests) <br>
             * - async - [optional] whether to call target operation synchronously or asynchronously (default async = false)
             *
             * @example <caption>Example of ServiceType.OPERATION service </caption>
             * services.register('myOperationService', {
             *     type: capsula.ServiceType.OPERATION,
             *     operation: myCapsule.operationX
             * });
             */
            OPERATION: 'OPERATION'
        };

        services.registerType(ServiceType.OPERATION, function (requests, config, serviceName) {
            var packed = [];
            for (var i = 0; i < requests.length; i++)
                packed.push(requests[i].body);

            if (config.async === true) {
                config.operation._.send(packed).then(function (responses) {
                    if (!isArray_(responses) || responses.length !== requests.length)
                        services.rejectAll(requests, new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));
                    else
                        services.resolveAllSuccessful(requests, responses);
                    services.setServiceStatus(serviceName, 'online');
                }, function (err) {
                    services.rejectAll(requests, err);
                    services.setServiceStatus(serviceName, 'offline');
                });
            } else {
                var responses;
                try {
                    responses = config.operation._.call(packed);
                    if (!isArray_(responses) || responses.length !== requests.length)
                        throw new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString());
                    services.setServiceStatus(serviceName, 'online');
                } catch (err) {
                    services.rejectAll(requests, err);
                    services.setServiceStatus(serviceName, 'offline');
                    return;

                }
                services.resolveAllSuccessful(requests, responses);
            }
        });

        // *****************************
        // Polyfills
        // *****************************

        // Object.setPrototypeOf, only works in Chrome and FireFox, does not work in IE:
        Object.setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
            obj.__proto__ = proto;
            return obj;
        };

        // *****************************
        // Public Section
        // *****************************

        /**
         * <p> Capsula.js is the core module of Capsula library. The base concept of Capsula library is the [Capsule class]{@link module:capsula.Capsule}, a class similar to an OO class with different encapsulation model and many new and powerful concepts like [operations]{@link module:capsula.Operation}, [hooks]{@link module:capsula.Hook}, [loops]{@link module:capsula.Loop}, and many more.
         * <p> To create new Capsule class, use [defCapsule]{@link module:capsula.defCapsule} method.
         * @exports capsula
         * @requires module:services
         * @since 0.1.0
         */
        var ns = {
            // define capsule
            defCapsule: defCapsule,

            // constructors
            Input: Input,
            Output: Output,
            Hook: Hook,
            Loop: Loop,
            Data: Data,

            // capsules
            Capsule: Capsule,
            ElementRef: ElementRef,

            // "is" methods (instanceof, etc.)
            isCapsule: isCapsule,
            isOperation: isOperation,
            isHook: isHook,
            isLoop: isLoop,
            isData: isData,
            isCapsuleConstructor: isCapsuleConstructor,

            // API
            wire: wire,
            tie: tie,

            // context
            contextualize: contextualize,

            // post processing
            signOnForPostProcessing: signOnForPostProcessing,
            signOffForPostProcessing: signOffForPostProcessing,

            // on and off hook
            setDefaultElementHandlers: setDefaultElementHandlers,

            // extend
            extend: extend,

            // error codes
            Errors: Errors,

            // constants
            STOP: STOP,

            // services
            ServiceType: ServiceType
        };

        return ns;
    }));
