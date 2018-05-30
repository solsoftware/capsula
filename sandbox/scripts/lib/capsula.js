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
 * @version 0.1.0
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
             * The private data of this capsule. This object acts as a collection of name-value pairs where name is the id of data and value is the data itself.
             *
             * @type {Object}
             */
            this.data = {};

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
             * The children collection of hooks and loops of this hook.
             *
             * @type {Array.<Hook|Loop>}
             */
            this.children = [];

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

            /**
             * The child loop of this loop.
             *
             * @type {Loop}
             */
            this.down = null;

            /**
             * ElementRef capsule created in loop.render.
             *
             * @type {ElementRef}
             */
            this.ref = null;
        }

        LoopData_.prototype = Object.create(HookLoopData_.prototype);

        /**
         * @classdesc
        <p> Capsule class is an abstract base class in the hierarchy of (built-in and user-defined) capsule classes. In many ways capsule classes are similar to the typical OO classes. They support single inheritance model and polymorphism the way OO classes do. However, capsules differ from OO classes in many ways as well. They are dynamic the way JavaScript language is. Also, they enforce a special encapsulation model and accommodate several new concepts which are explained in the lines that follow.
         * <h3>Capsule Properties</h3>
         * <p> There are five types of capsule properties: parts, operations, methods, hooks, and loops.
         * <p> Part is a property of capsule instance that represents another capsule instance that "belongs" to it, i.e. part capsule is basically a child capsule. Child capsule is always created in the context of its parent and accessible only from within that context. Next section explains the term capsule context more precisely.
         * <p> An operation is a capsule's property that acts like a very powerful method. It can be used as a regular method, however operation adds support for asynchronous calls, argumetns filtering, declarative wiring to other operations to specify propagation of calls, etc. There are input and output operations. Read more on what can be achieved using [operations]{@link module:capsula.Operation}.
         * <p> Method is a capsule property that behaves as anyone would imagine, that is, as a simple JavaScript method. Methods can be either public or protected.
         * <p> [Hooks]{@link module:capsula.Hook} and [loops]{@link module:capsula.Loop} provide capsule with a special support for managing hierarchy of external elements (widgets for example) in a flexible way.
         * <p>When creating a capsule class, one must define which and how many of these properties should be present in it (see [defCapsule]{@link module:capsula.defCapsule}). Once created, capsule class cannot be modified afterwards. All instances of that class would then have the properties as defined in the class. However, once an instance of capsule class is created, it can be dynamically modified (by adding new properties for example, or removing existing ones); just as anyone would expect from a JavaScript object.
         * <p> Table bellow specifies characteristics of capsule properties (like: are they visible?, do they get inherited?, and are they dynamically addable / removable in runtime?):
         * <table>
         * <thead><tr><td>property type</td><td>visibility</td><td>inheritable</td><td>addable</td><td>removable</td></tr></thead>
         * <tbody><tr><th>part</th><td>protected</td><td>true</td><td>true</td><td>true</td></tr>
         * <tr><th>operation</th><td>public</td><td>true</td><td>true</td><td>false</td></tr>
         * <tr><th>method</th><td>protected or public</td><td>true</td><td>false</td><td>false</td></tr>
         * <tr><th>hook</th><td>public</td><td>true</td><td>true</td><td>false</td></tr>
         * <tr><th>loop</th><td>public</td><td>true</td><td>true</td><td>false</td></tr>
         * </tbody></table>
         * <p> Behind its interface made up of operations, public methods, hooks, and loops, capsules hide:
         * <ul>
         * <li> parts <br>
         * <li> the way parts' and capsule's operations are connected (wired) between one another, <br>
         * <li> the way parts' and capsule's hooks and loops are connected (tied) between one another, <br>
         * <li> protected methods (i.e. protected behavior), and <br>
         * <li> protected data.
         * </ul>
         * <p> Private properties are not supported.
         * <p>
         * <h3>Encapsulation Model and the "Current Context of Execution"</h3>
         * <p> As a reminder, in a typical OO encapsulation model, all public properties and methods of all living objects are accessible from anywhere in the code, only a reference to an object is needed. Since everything public is accessible, we have to carefully manage references. Effectively managing references can be a bit too difficult and that is why capsules introduce quite a novel encapsulation model which is a restriction to the <i>"everything public is accessible"</i> policy.
         * <p> To understand the policy of our encapsulation model, it is fundamentally important to understand the notion of <i>"current context of execution"</i>. Current context of execution is specified with respect to the given point in time and it always represents a capsule instance:
         * <p> <i> For the given point in time t and the given capsule instance x, x is the current context of execution at t, if and only if the call stack at t lists a method of x and no method of capsule instance other than x deeper in the call stack.</i>
         * <p> If x is the current context of execution, we informally say that <i>"we are in the context of x"</i>.
         * <p> Now we can define "is part of" relation between capsules instances:
         * <p> <i> Two capsule instances x and y are in "is part of" relation (x is part of y) if and only if y was the current context of execution at the moment of instantiation of x.</i>
         * <p> Note that "is part of" relation is neither symmetric, nor transitive, nor reflexive.
         * <p> For these two capsule instances we informally say that x is part of y. If x is part of y, we also informally say that "y is the owner of x". At any point in time a capsule instance can have zero or more parts (part properties) and zero or one owner.
         * <p> Now, our policy could easily be expressed: when we are in the context of y, it is allowed to use (access, call) a) public properties of capsule instance x if and only if x is a part of y and b) protected properties of capsule instance y.
         * <p> When trying to use a properties against these rules, an [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT} error is going to be thrown.
         * <h3>How to create a capsule class?</h3>
         * <p> To create a capsule class call the [defCapsule]{@link module:capsula.defCapsule} method:
         * <pre class="prettyprint"><code>var MyCapsuleClass = capsula.defCapsule(capsule_definition_object);</code></pre>
         * <h3>How to create a capsule instance?</h3>
         * <p> To instantiate capsule class (i.e. to obtain a capsule instance or capsule) use one of the two possible ways: <br>
         * <p> a) instantiate imperatively using the <i>new</i> operator and a function returned from the call to defCapsule:
         * <pre class="prettyprint"><code>var myCapsuleInstance = new MyCapsuleClass(optional_arguments);</code></pre>
         * In this case, myCapsuleInstance capsule implicitly becomes a part property of the capsule which represents the current context of execution.
         * <p> b) instantiate declaratively using the capsule definition object in defCapsule:
         * <pre class="prettyprint"><code>var OwnerClass = capsula.defCapsule({
         *     ...
         *     myCapsuleInstance: {
         *         capsule: MyCapsuleClass,
         *         args: [optional_arguments]
         *     }
         *     ...
         * });
         * </code></pre>
         * In this case, we declare that every instance of the OwnerClass would have an instance of MyCapsuleClass (myCapsuleInstance) as its part property.
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
        function Operation_(name, func, isInput) {
            if (name)
                checkName_(name);
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
            if (!name)
                name = 'o_' + privateData.id;
            privateData.name = name;
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
         * <p> To call operation, wire two operations, or wire operation to a capsule's method one must take into consideration the following: a) type(s) of each operation (input or output) or method (always input) involved, b) relationship of their owning capsules (in terms of are they sibling capsules or one capsule is part of another), and c) the current context of execution.
         * <p> For example, let capsule c be the capsule of the current context of execution. Let c1 and c2 be its part capsules, o1, o2, ..., o5 their operations, and m1 and m2 methods (see figure bellow).
         * <p> <img src="img/operations.png">
         * <p> Operations eligible to be called in the current context of execution (c) are c2.o3 and c.o5 (the same as this.o5). It is illegal to call c1.o1, c2.o4, c.o2 (the same as this.o2).
         * <p> The following operations are wired to one another and to methods: <br>
         * 1) input operation o2 of capsule c to input operation o3 of capsule c2, <br>
         * 2) output operation o4 of capsule c2 to output operation o5 of capsule c, <br>
         * 3) output operation o1 of capsule c1 to input operation o3 of capsule c2, <br>
         * 4) input operation o2 of capsule c to output operation o5 of capsule c, <br>
         * 5) input operation o2 of capsule c to method m2 of capsule c, and <br>
         * 6) output operation o1 of capsule c1 to method m1 of capsule c.
         * <p> It is said that operations o2, o4, and o1 act as "source" operations while operations o3 and o5 and methods m1 and m2 act as "targets" in these wires. Note that each source operation (for example o2) could be wired to many targets (o3, o5, and m2). Similarly, each target operation or method (for example operation o5) could be wired to many source operations (o4 and o2). A method can only act as a target when being wired. Wiring of operations is either done declaratively (in [defCapsule]{@link module:capsula.defCapsule}) or by calling methods on operations (see [wire]{@link module:capsula.Operation#wire}, [source]{@link module:capsula.Operation#source}, [target]{@link module:capsula.Operation#target}, and all related methods from there).
         * <p> Input operation can be used (depending on the context) either:
         * <p> 1) as a target if used from the outside of its capsule or <br>
         * 2) as a source if used from the inside.
         * <p> Output operation can be used (depending on the context) either:
         * <p> 1) as a source if used from the outside of its capsule or <br>
         * 2) as a target if used from the inside.
         * <p> As stated above, operations' wiring defines propagation of operation calls. For example, calling:
         * <pre class="prettyprint"><code>c.o2('something');</code></pre>
         * <p> would effectively mean calling:
         * <pre class="prettyprint"><code>
         * c.m2('something');
         * c2.o3('something');
         * c.o5('something');
         * </code></pre>
         * In other words, operation calls are being propagated according to the wiring. Wiring network ends where operations are wired to methods. The methods make the final combined effect of an operation call. When calling an operation, if there is more than one downstream method an array of method results is returned. If however there is only one downstream method its result is returned (this is by default, but can be changed, see [setUnpackResult]{@link module:capsula.Operation#setUnpackResult}). If there is no downstream methods for it, undefined is returned.
         * <p> Operations are by default enabled but could be disabled in which case the propagation of calls does not work and undefined is returned when disabled operation is called. See [setEnabled]{@link module:capsula.Operation#setEnabled}.
         * <p> As mentioned above, calling an operation o is done by <code>o(optional_arguments)</code>. This is a synchronous operation call. It means control is returned to the caller once all of the downstream operations and methods are executed. There is however an asynchronous way of calling an operation. For operation o this is done by <code>o.send(optional_arguments)</code>. This returns Promise object which allows for handling the results in both successful and erroneous use cases. In case of an async operation call, the control is returned to the caller immediately and propagation of calls is done in asynchronous manner at some point in future. See [send]{@link module:capsula.Operation#send}.
         * <p> Operations could have a filter set to modify operation arguments before further propagation of operation call or even to completely filter out (disable) individual operation calls. Since each operation is in a way on a boundary between two contexts (context of a capsule that owns the operation and its outer context), filters can be set to operation in both contexts. See [setFilter]{@link module:capsula.Operation#setFilter} for more details.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         */
        function Operation() {}
        // This is just for documentation purposes, to tell JSDoc about Input/Output methods using Operation.prototype.
        Operation.prototype = oProto_;

        /**
         * Creates new input operation as a property of the capsule that represents the current context of execution, with the given name and implementation function (if provided). The given name can later be used to obtain a reference to this operation from its owner capsule using [getInput]{@link module:capsula.Capsule#getInput} or [getOperation]{@link module:capsula.Capsule#getOperation}.
         *
         * @param {string} [opt_name] - optional name of input operation to create
         * @param {Function} [opt_function] - optional function that gets called every time input operation gets called, i.e. it is a sort of implementation of the input operation to be created
         * @class
         * @classdesc
         * <ul>
         * <li> [Operation]{@link module:capsula.Operation}
         * <ul>
         * <li> Input
         * </ul>
         * </ul>
         * <p> Input operation is a specific public property of a [capsule]{@link module:capsula.Capsule}. Input operations go along with output operations; they are complementary concepts that cannot be explained in separation. This is why input and output operations' essentials are given in one place and that is the [operations' page]{@link module:capsula.Operation}.
         *
         * @memberof module:capsula
         * @see {@link module:capsula.Operation}
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        function Input(opt_name, opt_function) {
            return Operation_(opt_name, opt_function, true);
        }

        /**
         * Creates new output operation as a property of the capsule that represents the current context of execution, with the given name (if provided). The given name can later be used to obtain a reference to this operation from its owner capsule using [getOutput]{@link module:capsula.Capsule#getOutput} or [getOperation]{@link module:capsula.Capsule#getOperation}.
         *
         * @param {string} [opt_name] - optional name of the output operation to create
         * @class
         * @classdesc
         * <ul>
         * <li> [Operation]{@link module:capsula.Operation}
         * <ul>
         * <li> Output
         * </ul>
         * </ul>
         * <p> Output operation is a specific public property of a [capsule]{@link module:capsula.Capsule}. Output operations go along with input operations; they are complementary concepts that cannot be explained in separation. This is why input and output operations' essentials are given in one place and that is the [operations' page]{@link module:capsula.Operation}.
         *
         * @memberof module:capsula
         * @see {@link module:capsula.Operation}
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        function Output(opt_name) {
            return Operation_(opt_name, null, false);
        }

        /**
         * Creates new hook as a property of the capsule that represents the current context of execution, with the given name (if provided). The given name can later be used to obtain a reference to this hook from its owner capsule using [getHook]{@link module:capsula.Capsule#getHook}.
         *
         * @class
         * @classdesc Hook is a specific public property of a [capsule]{@link module:capsula.Capsule}. It is a representation of a parent element in a hierarchical structure of elements (e.x. widgets). In other words, it represents a parent in a parent-child relationship.
         * <p> Hooks always go along with loops; they are complementary concepts that cannot be explained in separation. This is why loops' essentials are also given here, on the hooks' page. For all the details about loops there is a dedicated [loops' page]{@link module:capsula.Loop}.
         * <p> Similarly to hook, a loop is a specific public property of a capsule. Unlike hook which represents a parent element, loop is a representation of a child element in a hierarchical structure of elements (e.x. widgets).
         * <p> A capsule may have as many hooks and as many loops as necessary. Hence, a capsule may represent more than one parent element and more than one child element (at the same time).
         * <p> In the <i>Capsula</i> library, element hierarchy is built by managing hierarchies of hooks and loops instead of dealing with elements directly. As will be shown, this brings lots of flexibility and at the same time makes the code less dependent on the external API (like for example the DOM API).
         * <p> The following short example shows what can be done with hooks and loops and how it is better than today's common practice. Then, it is explained exactly how to create and modify hierarchy of elements by managing hierarchies of hooks and loops more formally.
         * <h3>The Example</h3>
         * <p> Capsula framework does not impose what elements mentined above must be; in this example elements are UI widgets. This example shows how to design really flexible and highly reusable tab UI component.
         * <p> Imagine a typical tab UI component (see the figure just bellow). Tab has a menu that reacts on user clicks and makes sure the corresponding page is displayed bellow. Tab capsule (also shown bellow) implements this behavior internally.
         * <p> Tab has two roles. It acts as a parent widget for its contents. This role is represented by the <i>pages</i> hook of the tab capsule, i.e. the pages hook represents the tab as a parent in tab's parent-child relationships with its children.
         * <p> On the other hand, tab acts as a child widget for its container. This role is represented by the loop named <i>loop</i> of the tab capsule, i.e. the loop represents the tab as a child in the tab's parent-child relationship with its parent.
         * <p> At this point, the tab capsule is not too good in terms of reusability because although we can reuse the tab as it is, in terms of layout the tab menu and its contents are bound to one another which is quite inflexible. How can that be improved then?
         * <p> <img src="img/tab-2.png" style="margin-right:5em"><img src="img/tab-1.png">
         * <p> It is not difficult to imagine a requirement to have an ads section between the tab menu and the tab contents (see bellow). In that case, our tab capsule won't do the job. However, we improve it by introducing additional hook named <i>ads</i> in the tab capsule. Now, if we use the ads hook (i.e. put somthing in it) we are able to meet the given requirement, otherwise the tab looks the same as before. This improves flexibility of the tab because the ads hook allows us to put anything we want between the tab menu and the tab contents and that is done outside of the tab capsule. So, instead of ads, we can have the breaking news section in between, or anything else. This is better, but still one could ask for more flexibility.
         * <p> <img src="img/tab-4.png" style="margin-right:5em"><img src="img/tab-3.png">
         * <p> Let's forget the ads hook, reset to the original tab capsule, and redesign it from scratch. Instead of a single loop, let's create two loops: <i>tabMenu</i> and <i>tabContents</i>. The tabMenu loop represents the tabMenu widget as a child in its parent-child relationship with its parent. The tabContents loop represents the container of tab pages as a child in its parent-child relationship with its parent. Now, the programmer can decide where in the page to put the tab menu and where to put the tab contents (see the figure bellow). In this example, the tab contents is displayed first on the page, then there is some arbitrary contents (designated with three dots), and finally there is the tab menu. Still, wherever the tab menu and the tab contents are placed on the page, they continue to work together so when the tab menu item is clicked, the corresponding page is displayed.
         * <p> Decisions on where to put the menu and the contents are left to the programmer that uses the tab capsule, i.e. they are extracted from the tab capsule and now belong to the outside of the tab capsule. This is why the tab capsule as it is now is much more flexible (and because of that much more reusable) than before. The interaction between the tab menu and the tab contents is however left inside the capsule, which makes sense because the two are logically related. This is the most flexible solution one could ask for.
         * <p> <img src="img/tab-6.png" style="margin-right:5em"><img src="img/tab-5.png">
         * <p> As shown in this example, a capsule is a logical unit of work; what the logic of a capsule is, is left to programmers to decide. The logic may or may not include layout decisions, again according to the requirements. Hooks and loops allow for decoupling the layout from other concers in an effective way. This brings lots of flexibility and improves capsules' potential for reuse.
         * <h3>Hooks&Loops Hierarchies and Paths</h3>
         * <p> This section explains how to create and modify hierarchy of elements by managing hierarchies of hooks and loops. How to create a valid hierarchy of hooks and loops is explained first. Then, we explain how it maps to an element structure.
         * <p> Hierarchy of hooks and loops is a tree made up of hooks and loops according to the rules that follow. Hooks and loops are connected (tied) to one another using so called "ties" (ties are actually the branches in the tree).
         * <p> There are two types of hooks and loops: a) connector hooks and loops and b) connecting hooks and loops.
         * <p> <i> A connector hook directly represents parent element in a parent-child relationship of elements. A connector loop directly represents child element in a parent-child relationship of elements.</i>
         * <p> (To obtain a connector hook (or loop) check [ElementRef capsule]{@link module:capsula.ElementRef}.)
         * <p> <i> A connecting hook represents parent element indirectly, through a connector hook it is (directly or indirectly) tied to. A connecting loop represents child element indirectly, through a connector loop it is (directly or indirectly) tied to. A connecting hook (loop) may or may not be directly or indirectly tied to a connector hook (loop). </i>
         * <p> So, a tree of hooks and loops is made up of connector hooks and loops and connecting hooks and loops. Hooks and loops form the tree according to the following rules:
         * <ul>
         * <li> Hook may have many children (or none). Each child must either be a hook or a loop. The ordering of hook's children is significant since it represents the ordering of elements in the corresponding section of the element structure.
         * <li> Hook can either be unparented or have exactly one parent. The parent can only be another hook.
         * <li> A connector hook must not have a parent. If it exists in the tree, it must be the root node.
         * <li> Loop can either be unparented or have exactly one parent. The parent can be another loop or a hook.
         * <li> Loop may have zero or one child. A child, if it exists, must be another loop.
         * <li> A connector loop must not have a child. If it exists in the tree, it must be a leaf node in the tree.
         * </ul>
         * <p> The same rules could be expressed more formally. Let's consider a tree of hooks and loops to be a collection of paths from the root node of the tree to each of the leaf nodes.
         * <p> <i> A valid hierarchy (tree) of hooks and loops is a collection of valid paths only. </i>
         * <p> <i>A valid path is a chain of hooks and loops that a) spans from the root node towards the leaf node over the nodes and ties that exist between them and b) is formed according to the following rules:
         * <ul>
         * <li> Connector hook, if it exists in the chain, can only be the first (root) node in the chain.
         * <li> Connector loop, if it exists in the chain, can only be the last (leaf) node in the chain.
         * <li> A pair of hook h and loop l where d(h) > d(l) does not exist. Here, d(n) is the distance of node n from the first (root) node of the chain.
         * </ul></i>
         * <p> <i>A path is complete if the following holds:
         * <ul>
         * <li> It is a valid path.
         * <li> The root node is a connector hook.
         * <li> The leaf node is a connector loop.
         * </ul></i>
         * <p> The following paths are complete (the root node is the leftmost node) (J represents a connecting hook, J' represents a connector hook, O - represents a connecting loop, O' - represents a connector loop):
         * <ul>
         * <li> J' - O'
         * <li> J' - J - O'
         * <li> J' - O - O'
         * <li> J' - J - ... - J - O - ... - O'
         * </ul>
         * <p> A complete path represents an existing completed relationship between the parent element (represented by the connector hook) and the child element (represented by a connector loop).
         * <p> The following paths are valid, but not complete:
         * <ul>
         * <li> J
         * <li> J - ... - J
         * <li> J' - J - ... - J
         * <li> O
         * <li> O - ... - O
         * <li> O - ... - O'
         * <li> J - O
         * <li> J - ... - J - O - ... - O
         * <li> J' - J - ... - J - O - ... - O
         * <li> J - ... - J - O - ... - O'
         * </ul>
         * <p> A valid yet incomplete path represents an incomplete relationship between the parent and the child element (when either one or both of them are missing). Incomplete path would become completed as soon as it obtains both a connector hook and a connector loop. At that point the element represented by a connector hook and the element represented by the connector loop would establish a parent-child relationship.
         * <p> The following paths are not valid (* represents hook, loop, or nothing at all):
         * <ul>
         * <li> * - O - * - J - *
         * <li> * - O' - * - J - *
         * <li> * - O - * - J' - *
         * <li> * - O' - * - J' - *
         * </ul>
         * <p> Modifications in the structure of a path may or may not affect the structure of actual elements:
         * <p> <i> If a modification results in a new complete path (or paths) being formed, the elements' structure gets extended with corresponding new child element(s). If a modification results in an existing complete path (or paths) becoming incomplete, the element structure gets corresponding child element(s) removed. </i>
         * <h3>Creating Hooks</h3>
         * <p> To create a connecting hook use one of the two ways: <br>
         * a) instantiate imperatively using the <i>new</i> operator and a Hook constructor:
         * <pre class="prettyprint"><code>let myHook = new capsula.Hook('myHook');</code></pre>
         * In this case, myHook implicitly becomes a hook of the capsule which represents the current context of execution.
         * <p> b) instantiate declaratively using the capsule definition object in defCapsule:
         * <pre class="prettyprint"><code>let MyCapsuleClass = capsula.defCapsule({
         *     ...
         *     hooks: ['myHook', ...]
         *     ...
         * });
         * </code></pre>
         * In this case, we declare that every instance of the MyCapsuleClass would have a hook named 'myHook'.
         * <p> To obtain a connector hook use the ElementRef capsule:
         * <pre class="prettyprint"><code>let pRef = new capsula.ElementRef(parentElement), // pRef wraps parentElement
         * connectorHook = pRef.hook; // connectorHook represents the wrapped parentElement</code></pre>
         * <h3>Creating Loops</h3>
         * <p> To create a connecting loop use one of the two possible ways: <br>
         * a) instantiate imperatively using the <i>new</i> operator and a Loop constructor:
         * <pre class="prettyprint"><code>let myLoop = new capsula.Loop('myLoop');</code></pre>
         * In this case, myLoop implicitly becomes a loop of the capsule which represents the current context of execution.
         * <p> b) instantiate declaratively using the capsule definition object in defCapsule:
         * <pre class="prettyprint"><code>var MyCapsuleClass = capsula.defCapsule({
         *     ...
         *     loops: ['myLoop', ...]
         *     ...
         * });
         * </code></pre>
         * In this case, we declare that every instance of the MyCapsuleClass would have a loop named 'myLoop'.
         * <p> To obtain a connector loop use the ElementRef capsule:
         * <pre class="prettyprint"><code>let cRef = new capsula.ElementRef(childElement), // cRef wraps childElement
         * connectorLoop = cRef.loop; // connectorLoop represents the wrapped childElement</code></pre>
         * <h3>Tying Hooks and Loops</h3>
         * Hooks and loops are connected to one another according to the rules explained above. This can be done in two ways, imperatively using [tie]{@link module:capsula.Hook#tie} (or one of the many other hook's and loop's methods that create ties):
         * <pre class="prettyprint"><code>hook.tie(loop);</code></pre>
         * <p> or declaratively (see [defCapsule]{@link module:capsula.defCapsule}).
         * <p> Ties could also be destroyed using [untie]{@link module:capsula.Hook#untie} (or one of the many other hook's and loop's methods that destroy ties):
         * <pre class="prettyprint"><code>hook.untie(loop);</code></pre>
         *
         * @param {string} [opt_name] - the name of the hook to create
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        function Hook(opt_name) {
            if (opt_name)
                checkName_(opt_name);
            var that = Object.create(Hook.prototype);

            var privateData = new HookData_();
            if (!opt_name)
                opt_name = 'h_' + privateData.id;
            privateData.name = opt_name;
            privateData.owner = ctx_;
            privateData.owner._.hooks.push(that);
            that._ = privateData;
            return that;
        }

        /**
         * Creates new loop as a property of the capsule that represents the current context of execution, with the given name (if provided). The given name can later be used to obtain a reference to this loop from its owner capsule using [getLoop]{@link module:capsula.Capsule#getLoop}.
         *
         * @class
         * @classdesc Loop is a specific public property of a [capsule]{@link module:capsula.Capsule}. It is a representation of a child element in a hierarchical structure of elements (e.x. widgets). In other words, it represents a child in a parent-child relationship.
         * <p> Loops always go along with hooks; they are complementary concepts that cannot be explained in separation. This is why hooks' and loops' essentials are given in one place and that is the [hooks' page]{@link module:capsula.Hook}. The loops' API however is presented here.
         *
         * @param {string} [opt_name] - the name of the loop to create
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [FORBIDDEN_NAME]{@link module:capsula.Errors.FORBIDDEN_NAME}
         */
        function Loop(opt_name) {
            if (opt_name)
                checkName_(opt_name);
            var that = Object.create(Loop.prototype);
            var privateData = new LoopData_();
            if (!opt_name)
                opt_name = 'l_' + privateData.id;
            privateData.name = opt_name;
            privateData.owner = ctx_;
            privateData.owner._.loops.push(that);
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
         * Creates and returns new contextualized function that "remembers" the context in which this function (contextualize) is called; when called, the returned (contextualized) function executes the given (in argument) function in that ("remembered") context. More on contexts is given [here]{@link module:capsula.Capsule}.
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
         *     p5: {                 // arguments created "on spot" using function
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

                var args = arguments;
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
                    that.init.apply(that, args);
                }, that);

                if (ctx_) {
                    that._.owner = ctx_;
                    ctx_._.parts.push(that);
                    if (typeof that.onAttach === 'function')
                        executeInContext_(that.onAttach, that, that);
                }

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
                el = new Cotr(name);
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
                    var input = getByNameAndType_(capsule._.pins, inputName, 'isInput');
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
                capsule.setData(name, datum);
            }
        }

        /**
         * @private
         */
        function newFilters_(capsule, compiledFilters) {
            for (var i = 0; i < compiledFilters.length; i++) {
                var compiledFilter = compiledFilters[i],
                owner = getSelf_(capsule, compiledFilter.owner),
                operation = getByNameAndType_(owner._.pins, compiledFilter.name);
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
                operation1 = getByNameAndType_(owner1._.pins, compiledWire.name1);
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
                operation1 = getByNameAndType_(owner1._.pins, compiledBinding.name1),
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
                lp.untieAll();
            }
            var hooks = this.getHooks();
            for (i = 0; i < hooks.length; i++) {
                var hk = hooks[i];
                hk.untieAll();
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
            return getByNameAndType_(this._.pins, name);
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
            return getByNameAndType_(this._.pins, name, 'isInput');
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
            return getByNameAndType_(this._.pins, name, 'isOutput');
        };

        /**
         * Returns a hook (of this capsule) with the given name, or null if there is no such a hook.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - the name of the hook to return
         * @returns {module:capsula.Operation} a hook (of this capsule) with the given name, or null if there is no such a hook
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getHook = function (name) {
            checkCapsuleAsThis_(this);
            return getByNameAndType_(this._.hooks, name);
        };

        /**
         * Returns a loop (of this capsule) with the given name, or null if there is no such a loop.
         *
         * @public
         * @since 0.1.0
         * @param {string} name - the name of the loop to return
         * @returns {module:capsula.Operation} a loop (of this capsule) with the given name, or null if there is no such a loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getLoop = function (name) {
            checkCapsuleAsThis_(this);
            return getByNameAndType_(this._.loops, name);
        };

        // *****************************
        // Protected Capsule's Methods
        // *****************************

        /**
         * Returns this capsule's protected data (an object) associated with the given id, or null if there is no such data.
         *
         * @public
         * @since 0.1.0
         * @param {string} id - the id of the data to return
         * @returns {Object} the data associated with the given id, or null if there is no such data
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Capsule.prototype.getData = function (id) {
            checkCapsuleAsOwner_(this);
            if (!isString_(id))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure id is a string.'));
            return this._.data[id];
        };

        /**
         * Associates the given data to the given id in the (protected) context of this capsule.
         *
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
            this._.data[id] = data;
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
            return getByNameAndType_(this._.parts, name);
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
         * Unwires (breaks the wire between) the two given [operations]{@link module:capsula.Operation} (if the wire exists) according to the current context of execution. At least one of the two arguments must be an operation. There is no requirement in terms of ordering of the two arguments.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param oper1 {module:capsula.Operation | Function} - operation or function to be unwired
         * @param oper2 {module:capsula.Operation | Function} - operation or function to be unwired
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        function unwire(oper1, oper2) {
            if (isOperation(oper1))
                oper1.unwire(oper2);
            else if (isOperation(oper2))
                oper2.unwire(oper1);
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
            var result = true;
            for (var i = 0; i < arguments.length; i++)
                result = result && arguments[i]._.targets.indexOf(this) !== -1;
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
            var result = true;
            for (var i = 0; i < arguments.length; i++)
                result = result && this._.targets.indexOf(arguments[i]) !== -1;
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
        function getFirstLeaveLoopOfLoop_(currLoop) {
            var down = currLoop._.down;
            if (down)
                return getFirstLeaveLoopOfLoop_(down);
            else if (currLoop._.el)
                return currLoop;
            else
                return null;
        }

        /**
         * @private
         */
        function getFirstLeaveLoopOfHook_(currHook) {
            for (var i = 0; i < currHook._.children.length; i++) {
                var child = currHook._.children[i];
                var result = getFirstLeaveLoop_(child);
                if (result)
                    return result;
            }
            return null;
        }

        /**
         * @private
         */
        function getFirstLeaveLoop_(hkLp) {
            if (isLoop(hkLp))
                return getFirstLeaveLoopOfLoop_(hkLp);
            else
                return getFirstLeaveLoopOfHook_(hkLp);
        }

        /**
         * @private
         */
        function getLeaveLoopsOfLoop_(currLoop, loops) {
            var down = currLoop._.down;
            if (down)
                getLeaveLoopsOfLoop_(down, loops);
            else if (currLoop._.el)
                loops.push(currLoop);
            else
                return;
        }

        /**
         * @private
         */
        function getLeaveLoopsOfHook_(currHook, loops) {
            for (var i = 0; i < currHook._.children.length; i++) {
                var child = currHook._.children[i];
                getLeaveLoops_(child, loops);
            }
        }

        /**
         * @private
         */
        function getLeaveLoops_(hkLp, loops) {
            if (isLoop(hkLp))
                return getLeaveLoopsOfLoop_(hkLp, loops);
            else
                return getLeaveLoopsOfHook_(hkLp, loops);
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

            return getNextLoop_(top._.up, top, isHook(top._.up) ? top._.up._.children.indexOf(top) + 1
                 : null);
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
        function getClasses_(loop) {
            var classes = [],
            hkLp = loop;
            for (; hkLp._.up; hkLp = hkLp._.up) {
                if (isHook(hkLp) && isString_(hkLp._.cls))
                    classes.splice(0, 0, hkLp._.cls);
            }
            return classes;
        }

        /**
         * @private
         */
        function tieTopBot_(top, bot, at) {
            var nextLoop = getNextLoop_(top, bot, at); // nextLoop must be found before the structure is modified bellow.

            if (isLoop(top) && isLoop(bot)) {
                top._.down = bot;
            } else if (isHook(top) && (isLoop(bot) || isHook(bot)) && typeof at === 'number') {
                top._.children.splice(at, 0, bot);
            } else {
                top._.children.push(bot);
            }
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
            if (isLoop(top) && isLoop(bot) && top._.down === bot && bot._.up === top) {
                top._.down = null;
            } else if (isHook(top) && (isLoop(bot) || isHook(bot)) && top._.children.indexOf(bot) >= 0 && bot._.up === top) {
                top._.children.splice(top._.children.indexOf(bot), 1);
            } else
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

            if (isLoop(bot)) {
                var ref = bot._.ref;
                if (ref)
                    ref.detach(); // detaches ElementRef created in render
                bot._.ref = null;
            }
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
         * Unties (breaks the tie between) the two given [hooks]{@link module:capsula.Hook} or [loops]{@link module:capsula.Loop} according to the current context of execution. There is no requirement in terms of ordering of the two arguments.
         *
         * @memberof module:capsula
         * @public
         * @since 0.1.0
         * @static
         * @param hkLp1 {module:capsula.Hook | module:capsula.Loop} - hook or loop to be untied
         * @param hkLp2 {module:capsula.Hook | module:capsula.Loop} - hook or loop to be untied
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        function untie(hkLp1, hkLp2) {
            checkHookLoop_(hkLp1);
            hkLp1.untie(hkLp2);
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
         * Sets the class to this hook. When class is set to a hook, each element represented by a loop from a completed path of a subtree of this hook would be flagged by this class. To understand how this flagging works [setDefaultElementHandlers]{@link module:capsula.setDefaultElementHandlers} should be consulted.
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

        /*
        -----------------------------
        |                           |
        |       -----------         |
        |       |         |         |
        |       |         |         |
        |       |     1   |         |
        |       -----J-----         |
        |            /\             |
        |           /  \            |
        |          /    \           |
        |         /      \          |
        |   -----O-----   \         |
        |   |         |    \        |
        |   |         |     \       |
        |   |         |      \      |
        |   -----------       \     |
        |                      \ 2  |
        ------------------------J----
         */

        // 1

        /**
         * Returns an array of hooks and loops this hook is tied to acting as a parent in the current context of execution; or an empty array if it is not tied to any hook or loop. It is assumed that this hook belongs to a part capsule of the capsule that represents the current context of execution; otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Hook | module:capsula.Loop>} an array of hooks and loops this hook is tied to acting as a parent in the current context of execution; or an empty array
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getHooks = function () {
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
        Hook.prototype.hook = function (var_args) {
            checkHook_(this);
            Hook.prototype.hookAt.apply(this, [this._.children.length].concat(Array.prototype.slice.call(arguments, 0)));
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
        Hook.prototype.hookAt = function (at, var_args) {
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
        Hook.prototype.isHookOf = function (var_args) {
            checkHookAsParent_(this);
            var arr = arguments[0];
            if (!isArray_(arr))
                arr = arguments;
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
        Hook.prototype.unhookAll = function () {
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
        Hook.prototype.unhook = function (var_args) {
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
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to retie this parent hook to (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.rehook = function (var_args) {
            Hook.prototype.unhookAll.apply(this);
            Hook.prototype.hook.apply(this, arguments);
        };

        // 2

        /**
         * <p> Returns the hook (of a part capsule of this hook's owner capsule) this hook is tied to; or null if it is not tied to such a hook. The tying is checked in the current context of execution only.
         * <p> Assumes this hook belongs to the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Hook} the hook this hook is tied to (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getHook = function () {
            checkHookAsChild_(this);
            return this._.up;
        };

        /**
         * <p> Ties this hook to the given hook which has to be the hook of a part capsule of this hook's owner capsule (throws error if not).
         * <p> Assumes this hook belongs to the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook} hook - the hook to tie this hook to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.setHook = function (hook) {
            checkHookAsChild_(this);
            var oldParent = this._.up;
            if (oldParent)
                untieTopBot_(oldParent, this);
            if (hook) {
                checkHookAsParent_(hook);
                tieTopBot_(hook, this);
            }
        };

        // 1, 2

        /**
         * Returns an array of hooks and loops this hook is tied to in the current context of execution; or an empty array if it is not tied to any hook or loop.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Hook | module:capsula.Loop>} an array of hooks and loops this hook is tied to in the current context of execution; or an empty array
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.getTies = function () {
            checkHook_(this);
            var that = this;
            return doInContext_(function () {
                return that._.up ? [that._.up] : [];
            }, Hook.prototype.getHooks, this, arguments);
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
                if (arg != null)
                    checkHook_(arg);
                that.setHook(arg);
            }, Hook.prototype.hook, this, arguments);
        };

        /**
         * Ties this hook to the given hooks and loops according to the given <i>at</i> index and the current context of execution. Note that having multiple arguments makes sense only when this hook acts as a parent in the current context of execution i.e. when it belongs to a part capsule of the capsule that represents the current context of execution. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {number} at - the index to use when tying this hook to the given hooks and loops
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to tie this hook to (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [INDEX_OUT_OF_BOUNDS]{@link module:capsula.Errors.INDEX_OUT_OF_BOUNDS}
         */
        Hook.prototype.tieAt = function (at, var_args) {
            checkHook_(this);
            var that = this,
            arg = arguments[1];
            if (isArray_(arg))
                arg = arg[0];
            doInContext_(function () {
                checkHook_(arg);
                arg.hookAt(at, that);
            }, Hook.prototype.hookAt, this, arguments);
        };

        /**
         * Checks whether this hook is tied to all the given hooks and loops in the current context of execution. Note that having multiple arguments makes sense only when this hook acts as a parent in the current context of execution i.e. when it belongs to a part capsule of the capsule that represents the current context of execution. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to check (an array of hooks and loops also accepted)
         * @returns {boolean} whether this hook is tied to all the given hooks and loops (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.isTiedTo = function (var_args) {
            checkHook_(this);
            var args = arguments[0],
            that = this;
            if (!isArray_(args))
                args = arguments;
            return doInContext_(function () {
                var arg = args[0];
                if (arg != null)
                    checkHook_(arg);
                return that._.up === arg;
            }, function () {
                var result = true;
                for (var i = 0; i < args.length; i++) {
                    checkHookLoop_(args[i]);
                    result = result && args[i]._.up === that;
                }
                return result;
            }, this, arguments);
        };

        /**
         * Unties this hook from all the hooks and loops it is tied to in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.untieAll = function () {
            checkHook_(this);
            doInContext_(Hook.prototype.setHook, Hook.prototype.unhookAll, this, [null]);
        };

        /**
         * Unties this hook from the given hooks and loops in the current context of execution. Note that having multiple arguments makes sense only when this hook acts as a parent in the current context of execution i.e. when it belongs to a part capsule of the capsule that represents the current context of execution. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to untie this hook from (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.untie = function (var_args) {
            checkHook_(this);
            var args = arguments[0],
            that = this;
            if (!isArray_(args))
                args = arguments;
            doInContext_(function () {
                var arg = args[0];
                if (arg != null) {
                    checkHook_(arg);
                    if (that._.up === arg)
                        that.setHook(null);
                }
            }, Hook.prototype.unhook, this, arguments);
        };

        /**
         * First, unties this hook from all the hooks and loops it is tied to in the current context of execution and then ties this hook to the given hooks and loops in the current context of execution. Note that having multiple arguments makes sense only when this hook acts as a parent in the current context of execution i.e. when it belongs to a part capsule of the capsule that represents the current context of execution. The function accepts both comma separated list of hooks and loops and an array of hooks and loops.
         *
         * @public
         * @since 0.1.0
         * @param {...(module:capsula.Hook | module:capsula.Loop)} var_args - hooks and loops to retie this hook to (an array of hooks and loops also accepted)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Hook.prototype.retie = function (var_args) {
            checkHook_(this);
            var args = arguments[0],
            that = this;
            if (!isArray_(args))
                args = arguments;
            doInContext_(function () {
                var arg = args[0];
                if (arg != null)
                    checkHook_(arg);
                that.setHook(arg);
            }, Hook.prototype.rehook, this, arguments);
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
            checkHookAsChild_(this);
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
         * <p> Renders this loop (i.e. the DOM element this loop represents) as a child of the given DOM element.
         *
         * @public
         * @since 0.1.0
         * @param {Element} to - the DOM element into which to render this loop
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.render = function (to) {
            checkLoopAsChild_(this);
            var ref = this._.ref;
            if (ref)
                ref.detach();
            var newRef = new ElementRef(to);
            this._.ref = newRef;
            newRef.hook.hook(this);
        };

        /*
        -------------------------O---------
        |                        | 3      |
        |   -----------          |        |
        |   |         |          |        |
        |   |         |          | 2      |
        |   |         |     -----O-----   |
        |   -----J-----     |         |   |
        |        |          |         |   |
        |        |          |         |   |
        |        | 1        -----------   |
        |   -----O-----                   |
        |   |         |                   |
        |   |         |                   |
        |   |         |                   |
        |   -----------                   |
        |                                 |
        -----------------------------------
         */

        // 1

        /**
         * <p> Returns the hook (of a sibling capsule of this loop's owner capsule) this loop is tied to; or null if it is not tied to such a hook. The tying is checked in the current context of execution only.
         * <p> Assumes this loop belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Hook} the hook this loop is tied to (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getHook = function () {
            checkLoopAsChild_(this);
            var up = this._.up;
            if (isHook(up))
                return up;
            return null;
        };

        /**
         * <p> Ties this loop to the given hook which has to be the hook of a sibling capsule of this loop's owner capsule (throws error if not).
         * <p> Assumes this loop belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook} hook - the hook to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.setHook = function (hook) {
            checkLoopAsChild_(this);
            if (hook)
                checkHookAsParent_(hook);
            untieTopBot_(this._.up, this);
            if (hook)
                tieTopBot_(hook, this);
        };

        // 2

        /**
         * <p> Returns the loop (of the owner capsule of this loop's owner capsule) this loop is tied to; or null if it is not tied to such a loop. The tying is checked in the current context of execution only.
         * <p> Assumes this loop belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Loop} the public loop this loop is tied to (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getPublicLoop = function () {
            checkLoopAsChild_(this);
            var up = this._.up;
            if (isLoop(up))
                return up;
            return null;
        };

        /**
         * <p> Ties this loop to the given loop which has to be the loop of the owner capsule of this loop's owner capsule (throws error if not).
         * <p> Assumes this loop belongs to a part capsule of the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Loop} loop - the public loop to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.setPublicLoop = function (loop) {
            checkLoopAsChild_(this);
            if (loop)
                checkLoopAsParent_(loop);
            untieTopBot_(this._.up, this);
            if (loop) {
                untieTopBot_(loop, loop._.down);
                tieTopBot_(loop, this);
            }
        };

        // 3

        /**
         * <p> Returns the loop (of the part capsule of this loop's owner capsule) this loop is tied to; or null if it is not tied to such a loop. The tying is checked in the current context of execution only.
         * <p> Assumes this loop belongs to the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Loop} the private loop this loop is tied to (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getPrivateLoop = function () {
            checkLoopAsParent_(this);
            return this._.down;
        };

        /**
         * <p> Ties this loop to the given loop which has to be the loop of a sibling capsule of this loop's owner capsule (throws error if not).
         * <p> Assumes this loop belongs to the capsule that represents the current context of execution. Otherwise it throws error.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Loop} loop - the private loop to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.setPrivateLoop = function (loop) {
            checkLoopAsParent_(this);
            if (loop)
                checkLoopAsChild_(loop);
            untieTopBot_(this, this._.down);
            if (loop) {
                untieTopBot_(loop._.up, loop);
                tieTopBot_(this, loop);
            }
        };

        // 1, 2
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
            if (parent) {
                if (isLoop(parent))
                    untieTopBot_(parent, parent._.down);
                tieTopBot_(parent, this);
            }
        };

        // 2, 3
        /**
         * <p> Returns the loop this loop is tied to; or null if it is not tied to a loop in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @returns {module:capsula.Loop} the loop this loop is tied to (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getLoop = function () {
            checkLoop_(this);
            return doInContext_(Loop.prototype.getPrivateLoop, Loop.prototype.getPublicLoop, this, arguments);
        };

        /**
         * <p> Ties this loop to the given loop in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Loop} loop - the loop to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.setLoop = function (loop) {
            checkLoop_(this);
            doInContext_(Loop.prototype.setPrivateLoop, Loop.prototype.setPublicLoop, this, arguments);
        };

        // 1, 2, 3
        /**
         * Returns (an array with) the hook or the loop this loop is tied to in the current context of execution; or an empty array if it is not tied to any hook or loop. The returned hook or loop is packaged into an array before returning for the compatibility reasons with hook's [getTies]{@link module:capsula.Hook#getTies}.
         *
         * @public
         * @since 0.1.0
         * @returns {Array.<module:capsula.Hook | module:capsula.Loop>} an array with the hook or the loop this loop is tied to in the current context of execution; or an empty array
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.getTies = function () {
            checkLoop_(this);
            var that = this;
            return doInContext_(function () {
                return that._.down ? [that._.down] : [];
            }, function () {
                return that._.up ? [that._.up] : [];
            }, this);
        };

        /**
         * Ties this loop to the given hook or loop in the current context of execution. The function accepts the given hook or loop in an array as well.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook | module:capsula.Loop | Array.<module:capsula.Hook | module:capsula.Loop>} hookOrLoop - hook or loop to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.tie = function (hookOrLoop) {
            checkLoop_(this);
            var that = this,
            arg = arguments[0];
            if (isArray_(arg))
                arg = arg[0];
            doInContext_(function () {
                if (arg != null)
                    checkLoop_(arg);
                that.setPrivateLoop(arg);
            }, function () {
                if (arg != null)
                    checkHookLoop_(arg);
                that.setParent(arg);
            }, this, arguments);
        };

        /**
         * Ties this loop to the given hook or loop according to the given <i>at</i> index and the current context of execution. The at index is taken into consideration only when tying this loop to a hook since only hooks can have more than one child; otherwise it is ignored. The function accepts the given hook or loop in an array as well.
         *
         * @public
         * @since 0.1.0
         * @param {number} at - the index to use when tying this loop to the given hook or loop
         * @param {module:capsula.Hook | module:capsula.Loop | Array.<module:capsula.Hook | module:capsula.Loop>} hookOrLoop - hook or loop to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}, [INDEX_OUT_OF_BOUNDS]{@link module:capsula.Errors.INDEX_OUT_OF_BOUNDS}
         */
        Loop.prototype.tieAt = function (at, hookOrLoop) {
            checkLoop_(this);
            var that = this,
            arg = arguments[1];
            if (isArray_(arg))
                arg = arg[0];
            doInContext_(function () {
                if (at !== 0)
                    throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'at\' is zero since you should be tying two loops.'));
                if (arg != null)
                    checkLoop_(arg);
                that.setPrivateLoop(arg);
            }, function () {
                if (arg != null)
                    checkHookLoop_(arg);
                if (isLoop(arg) && at !== 0)
                    throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'at\' is zero since you are tying two loops.'));
                if (isHook(arg))
                    arg.hookAt(at, that);
                else
                    that.setPublicLoop(arg);
            }, this, arguments);
        };

        /**
         * Checks whether this loop is tied to the given hook or loop in the current context of execution. The function accepts the given hook or loop in an array as well.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook | module:capsula.Loop | Array.<module:capsula.Hook | module:capsula.Loop>} hookOrLoop - hook or loop to check
         * @returns {boolean} whether this loop is tied to the given hook or loop (in the current context of execution)
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.isTiedTo = function (hookOrLoop) {
            checkLoop_(this);
            var that = this,
            arg = arguments[0];
            if (isArray_(arg))
                arg = arg[0];
            return doInContext_(function () {
                if (arg != null)
                    checkLoop_(arg);
                return that._.down === arg;
            }, function () {
                if (arg != null)
                    checkHookLoop_(arg);
                return that._.up === arg;
            }, this, arguments);
        };

        /**
         * Unties this loop from the hook or the loop it is tied to in the current context of execution.
         *
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.untieAll = function () {
            checkLoop_(this);
            doInContext_(Loop.prototype.setPrivateLoop, Loop.prototype.setParent, this, [null]);
        };

        /**
         * Unties this loop from the given hook or loop in the current context of execution. The function accepts the given hook or loop in an array as well.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook | module:capsula.Loop | Array.<module:capsula.Hook | module:capsula.Loop>} hookOrLoop - hook or loop to untie this loop from
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.untie = function (hookOrLoop) {
            checkLoop_(this);
            var that = this,
            arg = arguments[0];
            if (isArray_(arg))
                arg = arg[0];
            doInContext_(function () {
                if (arg != null) {
                    checkLoop_(arg);
                    if (that._.down === arg)
                        that.setPrivateLoop(null);
                }
            }, function () {
                if (arg != null) {
                    checkHookLoop_(arg);
                    if (that._.up === arg)
                        that.setParent(null);
                }
            }, this, arguments);
        };

        /**
         * First, it unties this loop from any hook or loop it may be tied to in the current context of execution and then ties this loop to the given hook or loop in the current context of execution. The function accepts the given hook or loop in an array as well.
         *
         * @public
         * @since 0.1.0
         * @param {module:capsula.Hook | module:capsula.Loop | Array.<module:capsula.Hook | module:capsula.Loop>} hookOrLoop - hook or loop to tie this loop to
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:capsula.Errors.ILLEGAL_ARGUMENT}, [OUT_OF_CONTEXT]{@link module:capsula.Errors.OUT_OF_CONTEXT}
         */
        Loop.prototype.retie = function (hookOrLoop) {
            checkLoop_(this);
            var that = this,
            arg = arguments[0];
            if (isArray_(arg))
                arg = arg[0];
            doInContext_(function () {
                if (arg != null)
                    checkLoop_(arg);
                that.setPrivateLoop(arg);
            }, function () {
                if (arg != null)
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
         * @param {object} subject - the variable that is tested for Array identity check
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

        function getPieceType_(owner, name, compiled, in1, in2) {
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
            else
                return ElementType.OTHER;
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
                args = initArgs; // forward owner's arguments
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
            return ownerName === 'this' ? self : getByNameAndType_(self._.parts, ownerName);
        }

        /**
         * @private
         */
        function getSelfHookOrLoop_(self, name) {
            var result = getByNameAndType_(self._.hooks, name);
            if (isNothing_(result))
                return getByNameAndType_(self._.loops, name);
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
            var result = getByNameAndType_(self._.pins, name);
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
                    return this.getData('element');
                },
                setElement_: function (el) {
                    this.setData('element', el);
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

        services.registerType(ServiceType.OPERATION, function (requests, config) {
            var packed = [];
            for (var i = 0; i < requests.length; i++)
                packed.push(requests[i].body);

            if (config.async === true) {
                config.operation._.send(packed).then(function (responses) {
                    if (!isArray_(responses) || responses.length !== requests.length)
                        services.rejectAll(requests, new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));
                    else
                        services.resolveAllSuccessful(requests, responses);
                }, function (err) {
                    services.rejectAll(requests, err);
                });
            } else {
                var responses;
                try {
                    responses = config.operation._.call(packed);
                    if (!isArray_(responses) || responses.length !== requests.length)
                        throw new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString());
                } catch (err) {
                    services.rejectAll(requests, err);
                    return;

                }
                services.resolveAllSuccessful(requests, responses);
            }
        });

        // *****************************
        // Public Section
        // *****************************

        /**
         * <p> Capsula.js is the core module of Capsula library. The base concept of Capsula library is the <i>Capsule</i>, a class similar to an OO class with different encapsulation model and many new and powerful concepts. Start learning by reading the documentation for [the Capsule class]{@link module:capsula.Capsule}. Then carefully cover the concepts of [Operations]{@link module:capsula.Operation}, [Hooks]{@link module:capsula.Hook}, and [Loops]{@link module:capsula.Loop}.
         * <p> To create new Capsule class, use [defCapsule]{@link module:capsula.defCapsule} method.
         * <p> To wrap any external element and use it as a capsule instance, check out [ElementRef]{@link module:capsula.ElementRef} capsule.
         * @exports capsula
         * @requires module:services
         * @version 0.1.0
         */
        var ns = {
            // define capsule
            defCapsule: defCapsule,

            // constructors
            Input: Input,
            Output: Output,
            Hook: Hook,
            Loop: Loop,

            // capsules
            Capsule: Capsule,
            ElementRef: ElementRef,

            // "is" methods (instanceof, etc.)
            isCapsule: isCapsule,
            isOperation: isOperation,
            isHook: isHook,
            isLoop: isLoop,
            isCapsuleConstructor: isCapsuleConstructor,

            // API
            wire: wire,
            unwire: unwire,
            tie: tie,
            untie: untie,

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
