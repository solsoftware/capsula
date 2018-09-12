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
 * @file HTML module provides a mechanism to bind the world of capsules to the world of HTML using both templates and object-orientation. Read [more]{@link module:html}.
 * @copyright 2018 SOL Software
 * @license Apache-2.0
 * @version 0.1.0
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./services', './capsula'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./services'), require('./capsula'));
    } else {
        root.html = factory(root.services, root.capsula);
    }
}
    (this, function (services, cps) {

        'use strict';

        cps.setDefaultElementHandlers(
            function onHookDefault_(hookElement, loopElement, afterElement, classes) {
            if (afterElement)
                hookElement.insertBefore(loopElement, afterElement);
            else
                hookElement.appendChild(loopElement);
            for (var i = 0; i < classes.length; i++)
                loopElement.classList.add(classes[i]);
        },
            function offHookDefault_(hookElement, loopElement, classes) {
            if (loopElement.parentElement === hookElement)
                hookElement.removeChild(loopElement);
            for (var i = 0; i < classes.length; i++)
                loopElement.classList.remove(classes[i]);
        },
            function setClassesDefault_(loopElement, classes) {
            var classList = loopElement.classList;
            while (classList.length > 0)
                classList.remove(classList.item(0));
            classList.add.apply(classList, classes);
        });

        /**
         *
         * <p> When creating an instance of Text capsule you either create new Text node or wrap an already existing Text node. In any case, newly created capsule behaves as a wrapper for the underlying Text node. Creating an instance of Text capsule is simple, although there are two different legal ways to do it. See examples bellow for more details.
         *
         * @example <caption>Creating new Text capsule to create and wrap new (DOM) Text node</caption>
         * let text = new html.Text('Hello world!');
         *
         * @example <caption>Creating new Text capsule as a wrapper of an existing (DOM) Text node</caption>
         * let existingTextNode = document.createTextNode('Hello world'); // or document.getElementById or whatever...
         * let text = new html.Text(existingTextNode);
         *
         * @example <caption>Specifying output operations (optional in both ways of instantiation)</caption>
         * let text = new html.Text('Hello world!', ['DOMCharacterDataModified']); // reacts on text modification
         * text.DOMCharacterDataModified.wire(function(e){
         *     alert('Text modified!');
         * });
         *
         * @classdesc
         * <ul>
         * <li> [Capsule]{@link module:capsula.Capsule}
         * </ul>
         * <p> Wrapper capsule for DOM Text nodes. Can be used either to wrap an existing Text node or to create a new one (and wrap it).
         * <p> The Text capsule has one loop named <i>loop</i> that represents the Text node as well as methods that work with the text node.
         *
         * @param {string|Text} textOrTextNode - a) the text content of a Text node to create or b) the text node to wrap
         * @param {Array.<string>} [opt_eventOutputs] - optional array of events (e.g. ['DOMCharacterDataModified']) for which output operations should be created (see [addEventOutput]{@link module:html.Text#addEventOutput})
         *
         * @alias module:html.Text
         * @memberof module:html
         * @class
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:html.Errors.ILLEGAL_ARGUMENT}
         */
        var Text$ = cps.defCapsule({
                name: 'Text',

                /**
                 * @alias Collection of Loops
                 *
                 * @memberof! module:html.Text#
                 * @property {module:capsula.Loop} loop - A loop that represents the DOM Text node of this capsule.
                 * @public
                 * @since 0.1.0
                 */
                loops: 'loop',
                listeners: '*{}',
                myText: {
                    capsule: cps.ElementRef,
                    deferredArgs: function (textOrTextNode) {
                        if (isTextNode_(textOrTextNode))
                            return textOrTextNode;
                        else if (isString_(textOrTextNode))
                            return document.createTextNode(textOrTextNode);
                        else
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the first argument of the Text constructor is String or Text node.'));
                    }
                },

                init: function (textOrTextNode, opt_eventOutputs) {
                    if (opt_eventOutputs != null) {
                        if (!isArray_(opt_eventOutputs))
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure argument opt_eventOutputs, if provided, is an array of Strings.'));
                        for (var i = 0; i < opt_eventOutputs.length; i++)
                            this.addEventOutput(opt_eventOutputs[i]);
                    }
                },

                /**
                 * Returns the text content of the wrapped Text node.
                 *
                 * @alias getText
                 * @memberof! module:html.Text#
                 * @public
                 * @returns {string} the text content of the wrapped Text node
                 * @since 0.1.0
                 */
                '+ getText': function () {
                    return this.myText.getElement().nodeValue;
                },

                /**
                 * Sets the text content to the wrapped Text node.
                 *
                 * @alias setText
                 * @memberof! module:html.Text#
                 * @public
                 * @param {string} txt - the value to set
                 * @since 0.1.0
                 */
                '+ setText': function (txt) {
                    return this.myText.getElement().nodeValue = txt;
                },

                /**
                 * Returns the wrapped Text node.
                 *
                 * @alias getTextNode
                 * @memberof! module:html.Text#
                 * @public
                 * @returns {Text} the wrapped (DOM) Text node
                 * @since 0.1.0
                 */
                '+ getTextNode': function () {
                    return this.myText.getElement();
                },

                /**
                 * Creates new output operation for the given event name (e.g. 'DOMCharacterDataModified'). Each time the event is captured output operation is called with event object as a parameter. If the output name is provided in the second argument, the output operation would take that name, otherwise it would default to the event name.
                 *
                 * @example <caption>Reacting on DOMCharacterDataModified event</caption>
                 * let text = new html.Text('Hello world!');
                 * ...
                 * text.addEventOutput('DOMCharacterDataModified', 'textModified');
                 * ...
                 * text.setText('Hello modified world!');
                 * ...
                 * text.textModified.wire(function(e){
                 *     alert('I have just been modified.');
                 * });
                 *
                 * @alias addEventOutput
                 * @memberof! module:html.Text#
                 * @param {string} eventName - event for which to create output operation, e.g. 'DOMCharacterDataModified'
                 * @param {string} [opt_outputName] - output operation name, if not specified the default value is the eventName
                 * @public
                 * @since 0.1.0
                 * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:html.Errors.ILLEGAL_ARGUMENT}
                 */
                '+ addEventOutput': function (eventName, opt_outputName) {
                    if (!isString_(eventName))
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the eventName argument is a string denoting a legal event, for example like \'click\' (without \'on\' prefix).'));

                    var outputName;
                    if (opt_outputName != null) {
                        if (!isString_(opt_outputName))
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the opt_outputName argument is a string.'));
                        if (this[opt_outputName])
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'' + opt_outputName + '\' is not already existing property of this object.'));
                        outputName = opt_outputName;
                    } else {
                        if (this[eventName])
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'' + eventName + '\' is not already existing property of this object.'));
                        outputName = eventName;
                    }

                    var output = new cps.Output();
					output.setName(outputName);
                    this[outputName] = output;

                    var listener = cps.contextualize(function (e) {
                            output(e);
                        });
                    this.listeners.get()[eventName] = listener;
                    this.getTextNode().addEventListener(eventName, listener);
                },

                onDetach: function () {
                    var listeners = this.listeners.get();
                    for (var i in listeners)
                        this.getTextNode().removeEventListener(i, listeners[i]);
                    this.listeners = new cps.Data({});
                },

                'this.loop': 'myText.loop'
            });

        /**
         * @classdesc
         * <ul>
         * <li> [Capsule]{@link module:capsula.Capsule}
         * <ul>
         * <li> HasRootHTML
         * </ul>
         * </ul>
         * <p> Abstract generalization for all capsules that have single root HTML element. Accordingly, this capsule has one loop named <i>loop</i> that represents the root HTML element as well as a number of methods that work with the root element.
         * <p> To create a specialized concrete capsule (class), extend this capsule and override the [getElement]{@link module:html.HasRootHTML#getElement} method to return the root HTML (DOM) element.
         * <p> Methods provided by this capsule enable both inspection and modification of the root element. For example, to inspect the root element use [getAttribute]{@link module:html.HasRootHTML#getAttribute}, [getStyle]{@link module:html.HasRootHTML#getStyle}, [getInnerHTML]{@link module:html.HasRootHTML#getInnerHTML}, etc. To modify it, use [setAttribute]{@link module:html.HasRootHTML#setAttribute}, [setStyle]{@link module:html.HasRootHTML#setStyle}, [addClass]{@link module:html.HasRootHTML#addClass}, etc.
         *
         * @example <caption>Concrete Specialization Example of HasRootHTML Capsule</caption>
         * let HTMLElement = capsula.defCapsule({
         *     base: html.HasRootHTML,
         *     hooks: 'hook',
         *     root: { // part declaration
         *         capsule: capsula.ElementRef,
         *         deferredArgs: function(htmlTagName){
         *             return document.createElement(htmlTagName);
         *         }
         *     },
         *     '+ getElement': function () { // must override HasRootHTML.getElement method
         *         return this.root.getElement();
         *     },
         *     'this.hook': 'root.hook',
         *     'this.loop': 'root.loop' // this.loop is inherited from HasRootHTML
         * });
         * let span = new HTMLElement('span'), // create an instance of HTMLElement
         * text = new html.Text('Hello world'); // create an instance of Text
         * span.hook.hook(text.loop); // put the text inside the span
         * span.loop.render(document.body); // put the span into the body
         * console.log(span.getInnerHTML()); // Hello world
         *
         * @memberof module:html
         * @abstract
         * @class
         * @public
         * @since 0.1.0
         */
        var HasRootHTML = cps.defCapsule({
                isAbstract: true,

                /**
                 * @alias Collection of Loops
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @property {module:capsula.Loop} loop - A loop that represents the root HTML element of this capsule.
                 * @public
                 * @since 0.1.0
                 */
                loops: 'loop',

                /**
                 * Returns this capsule's root HTML (DOM) element. Meant to be overridden.
                 *
                 * @abstract
                 * @memberof! module:html.HasRootHTML#
                 * @alias getElement
                 * @public
                 * @returns {Element} the root HTML (DOM) element
                 * @since 0.1.0
                 */
                '+ getElement': function () {
                    return null;
                },

                /**
                 * Returns the value of the root element's id attribute.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias getId
                 * @public
                 * @returns {string} the root element's id
                 * @since 0.1.0
                 */
                '+ getId': function () {
                    return this.getElement().getAttribute('id');
                },

                /**
                 * Sets new value to the root element's id attribute.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias setId
                 * @param {String} id - new value for the id attribute
                 * @public
                 * @since 0.1.0
                 */
                '+ setId': function (id) {
                    this.getElement().setAttribute('id', id);
                },

                /**
                 * Returns the value of the root element's attribute specified by the name parameter.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias getAttribute
                 * @param {string} name - the name of the attribute whose value is to be returned
                 * @public
                 * @returns {string} the root element's attribute value
                 * @since 0.1.0
                 */
                '+ getAttribute': function (name) {
                    return this.getElement().getAttribute(name);
                },

                /**
                 * Sets new value to the root element's attribute specified by the name parameter.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias setAttribute
                 * @param {string} name - the name of the attribute to be set
                 * @param {string} value - the value to set
                 * @public
                 * @since 0.1.0
                 */
                '+ setAttribute': function (name, value) {
                    this.getElement().setAttribute(name, value);
                },

                /**
                 * Checks whether the root element has an attribute with the given name.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias hasAttribute
                 * @param {string} name - the name of the attribute to check
                 * @public
                 * @returns {boolean} true if the root element has an attribute with the given name, false otherwise
                 * @since 0.1.0
                 */
                '+ hasAttribute': function (name) {
                    return this.getElement().hasAttribute(name);
                },

                /**
                 * Removes the root element's attribute with the given name.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias removeAttribute
                 * @param {string} name - the name of the attribute to remove
                 * @public
                 * @since 0.1.0
                 */
                '+ removeAttribute': function (name) {
                    this.getElement().removeAttribute(name);
                },

                /**
                 * Returns the value of the root element's (DOM object's) property specified by the name parameter.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias getProperty
                 * @param {string} name - the name of the property whose value is to be returned
                 * @public
                 * @returns {string} the root element's property value
                 * @since 0.1.0
                 */
                '+ getProperty': function (name) {
                    return this.getElement()[name];
                },

                /**
                 * Sets the value to the root element's (DOM object's) property specified by the name parameter.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias setProperty
                 * @param {string} name - the name of the property to be set
                 * @param {string} value - the value to set
                 * @public
                 * @since 0.1.0
                 */
                '+ setProperty': function (name, value) {
                    this.getElement()[name] = value;
                },

                /**
                 * Returns the value of the root element's style specified by the name parameter.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias getStyle
                 * @param {string} name - the style name whose value is to be returned
                 * @public
                 * @returns {string} the root element's style
                 * @since 0.1.0
                 */
                '+ getStyle': function (name) {
                    return this.getElement().style[name];
                },

                /**
                 * Sets the value of style to the given root element's.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias setStyle
                 * @param {string} name - name of the style to be set
                 * @param {string} value - new value to set
                 * @public
                 * @since 0.1.0
                 */
                '+ setStyle': function (name, value) {
                    this.getElement().style[name] = value;
                },

                /**
                 * Adds new class to the root element's class attribute.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias addClass
                 * @param {string} className - the new class to be added
                 * @public
                 * @since 0.1.0
                 */
                '+ addClass': function (className) {
                    this.getElement().classList.add(className);
                },

                /**
                 * Checks whether the root element has a class with the given name.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias hasClass
                 * @param {string} className - the name of the class to check
                 * @public
                 * @returns {boolean} true if the root element has a class with the given name, false otherwise
                 * @since 0.1.0
                 */
                '+ hasClass': function (className) {
                    return this.getElement().classList.contains(className);
                },

                /**
                 * Removes the class from the root element's class attribute.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias removeClass
                 * @param {string} className - the class name to remove
                 * @public
                 * @since 0.1.0
                 */
                '+ removeClass': function (className) {
                    this.getElement().classList.remove(className);
                },

                /**
                 * Returns the root element's inner HTML.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias getInnerHTML
                 * @public
                 * @returns {string} the root element's inner HTML
                 * @since 0.1.0
                 */
                '+ getInnerHTML': function () {
                    return this.getElement().innerHTML;
                },

                /**
                 * Sets the inner HTML to the root element.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias setInnerHTML
                 * @param {string} innerHTML - HTML markup to set into the root element
                 * @public
                 * @since 0.1.0
                 */
                '+ setInnerHTML': function (innerHTML) {
                    this.getElement().innerHTML = innerHTML;
                },

                /**
                 * Returns the root element's tag name.
                 *
                 * @memberof! module:html.HasRootHTML#
                 * @alias getTagName
                 * @public
                 * @returns {string} the root element's tag name
                 * @since 0.1.0
                 */
                '+ getTagName': function () {
                    return this.getElement().tagName;
                },
                init: function () {}
            });

        /**
         * When creating an instance of Element capsule you either create new DOM element or wrap an already existing DOM element. In any case, newly created capsule behaves as a wrapper for the underlying DOM element. Creating an instance of Element capsule is simple, although there are three different legal ways to do it. See examples bellow for more details.
         *
         * @alias module:html.Element
         * @class
         * @classdesc
         * <ul>
         * <li> [Capsule]{@link module:capsula.Capsule}
         * <ul>
         * <li> [HasRootHTML]{@link module:html.HasRootHTML}
         * <ul>
         * <li> Element
         * </ul>
         * </ul>
         * </ul>
         * <p> Wrapper capsule for DOM elements. Can be used either to wrap an existing DOM element or to create a new one (and wrap it).
         * <p> Element capsule has one loop named <i>loop</i> which is inherited from the HasRootHTML capsule. This loop is there to enable this capsule's wrapped DOM element to be included on the page (as a child of another DOM element). Also, this capsule has a hook named <i>hook</i> that enables this capsule's wrapped DOM element include other DOM elements inside itself (as its children).
         *
         * @example <caption>Creating new HTML (DOM) element and new Element capsule as its wrapper</caption>
         * let htmlElement = new html.Element('div'); // using tag name
         *
         * @example <caption>Creating new SVG (DOM) element (needs namespace) and new Element capsule as its wrapper</caption>
         * let svgElement = new html.Element('http://www.w3.org/2000/svg', 'rect'); // using namespace and tag name
         *
         * @example <caption>Creating new Element capsule to wrap an existing DOM element</caption>
         * let existingElement = document.createElement('div'); // or document.getElementById or whatever...
         * let htmlElement = new html.Element(existingElement);
         *
         * @example <caption>Specifying output operations (optional in all three ways of instantiation)</caption>
         * let htmlElement = new html.Element('div', ['click', 'dblclick']); // reacts on click and double click
         * htmlElement.click.wire(function(e){
         *     alert('Clicked!');
         * });
         *
         * @memberof module:html
         * @param {string|Element} tagNameOrNamespaceOrElement - denotes: a) the tag name of the DOM element to be created, or b) the namespace of the DOM element to be created (in case of creating SVG element for example), or c) the DOM element itself (in case you just want to wrap it)
         * @param {string|Array.<string>} [opt_tagNameOrEventOutputs] - if the first parameter is a namespace then this one should be a tag name of the DOM element to be created, otherwise it is an optional array of events (e.g. ['click', 'dbclick']) for which output operations should be created (see [addEventOutput]{@link module:html.Element#addEventOutput})
         * @param {Array.<string>} [opt_eventOutputs] - if the first parameter is a namespace then this one should be an optional array of events (e.g. ['click', 'dbclick']) for which output operations should be created (see [addEventOutput]{@link module:html.Element#addEventOutput}), otherwise this parameter has no meaning
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:html.Errors.ILLEGAL_ARGUMENT}
         */
        var Element$ = cps.defCapsule({ // $ is here to prevent hiding the DOM's Element reference
                base: HasRootHTML,

                /**
                 * @alias Collection of Hooks
                 *
                 * @memberof! module:html.Element#
                 * @property {module:capsula.Hook} hook - A hook that represents the underlying DOM element of this capsule.
                 * @public
                 * @since 0.1.0
                 */
                hooks: 'hook',

                /**
                 * @alias Collection of Loops
                 *
                 * @memberof! module:html.Element#
                 * @property {module:capsula.Loop} loop - (inherited from [HasRootHTML]{@link module:html.HasRootHTML}) A loop that represents the underlying DOM element of this capsule.
                 * @public
                 * @since 0.1.0
                 */
                loops: null,

                listeners: '*{}',

                init: function (tagNameOrNamespaceOrElement, opt_tagNameOrEventOutputs, opt_eventOutputs) {
                    var outputs = null,
                    error = false;
                    if (isElement_(tagNameOrNamespaceOrElement)) {
                        if (isArray_(opt_tagNameOrEventOutputs))
                            outputs = opt_tagNameOrEventOutputs;
                        else if (opt_tagNameOrEventOutputs != null)
                            error = true;
                    } else if (isString_(tagNameOrNamespaceOrElement) && isString_(opt_tagNameOrEventOutputs)) {
                        if (isArray_(opt_eventOutputs))
                            outputs = opt_eventOutputs;
                        else if (opt_eventOutputs != null)
                            error = true;
                    } else if (isString_(tagNameOrNamespaceOrElement)) {
                        if (isArray_(opt_tagNameOrEventOutputs))
                            outputs = opt_tagNameOrEventOutputs;
                        else if (opt_tagNameOrEventOutputs != null)
                            error = true;
                    } else
                        error = true;

                    if (error)
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you call Element constructor with appropriate arguments.'));

                    if (outputs)
                        for (var i = 0; i < outputs.length; i++)
                            this.addEventOutput(outputs[i]);
                },

                /**
                 * Creates new output operation for the given event name (e.g. 'click'). Each time the event is captured output operation is called with event object as an argument. If output name is provided in the second argument, output operation would take that name, otherwise it would default to the event name.
                 *
                 * @example <caption>Reacting on click event</caption>
                 * let htmlElement = new html.Element('div');
                 * ...
                 * htmlElement.addEventOutput('click');
                 * ...
                 * htmlElement.click.wire(function(e){
                 *     alert('I have just been ' + e.type + 'ed.'); // I have just been clicked.
                 * });
                 *
                 * @alias addEventOutput
                 * @memberof! module:html.Element#
                 * @param {string} eventName - event for which to create output operation, e.g. 'click' or 'dblclick'
                 * @param {string} [opt_outputName] - output operation name, if not specified the default value is the eventName
                 * @public
                 * @since 0.1.0
                 * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:html.Errors.ILLEGAL_ARGUMENT}
                 */
                '+ addEventOutput': function (eventName, opt_outputName) {
                    if (!isString_(eventName))
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the eventName argument is a string denoting a legal event, for example like \'click\' (without \'on\' prefix).'));

                    var outputName;
                    if (opt_outputName != null) {
                        if (!isString_(opt_outputName))
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the opt_outputName argument is a string.'));
                        if (this[opt_outputName])
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'' + opt_outputName + '\' is not already existing property of this object.'));
                        outputName = opt_outputName;
                    } else {
                        if (this[eventName])
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'' + eventName + '\' is not already existing property of this object.'));
                        outputName = eventName;
                    }

                    var output = new cps.Output();
					output.setName(outputName);
                    this[outputName] = output;

                    var listener = cps.contextualize(function (e) {
                            output(e);
                        });
                    this.listeners.get()[eventName] = listener;
                    this.getElement().addEventListener(eventName, listener);
                },

                onDetach: function () {
                    var listeners = this.listeners.get();
                    for (var i in listeners)
                        this.getElement().removeEventListener(i, listeners[i]);
                    this.listeners = new cps.Data({});
                },

                root: {
                    capsule: cps.ElementRef,
                    deferredArgs: function (tagNameOrNamespaceOrElement, opt_tagNameOrEventOutputs, opt_eventOutputs) {
                        if (isElement_(tagNameOrNamespaceOrElement))
                            return tagNameOrNamespaceOrElement;
                        else if (isString_(tagNameOrNamespaceOrElement) && isString_(opt_tagNameOrEventOutputs))
                            return document.createElementNS(tagNameOrNamespaceOrElement, opt_tagNameOrEventOutputs);
                        else if (isString_(tagNameOrNamespaceOrElement))
                            return document.createElement(tagNameOrNamespaceOrElement);
                        else
                            throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you call Element constructor with appropriate arguments.'));
                    }
                },

                '+ getElement': function () {
                    return this.root.getElement();
                },

                'this.hook': 'root.hook',
                'this.loop': 'root.loop'
            });

        /**
         * Creates new Template capsule from the given HTML code.
         *
         * @class
         * @classdesc
         * <ul>
         * <li> [Capsule]{@link module:capsula.Capsule}
         * <ul>
         * <li> Template
         * </ul>
         * </ul>
         * <p>Template capsule provides means to easily reuse portions of HTML code enriched with a bit of behavior. It introduces HTML-based templates to the capsules code.
         * <p> Template capsule is easily instantiated from the portion of HTML code: <code>new html.Template(`&lt;div&gt;Hello World!&lt;/div&gt;`);</code>
         * <p> The HTML code (tags) used for instantiating Template capsule may have special attributes, i.e. attribute-based extensions for hooks, loops, and operations. This is a) to enable template sections (root tags) to be included somewhere on the HTML page, b) to enable template to include other HTML content under its tags, and c) to enrich the template with a bit of behavior. The following attributes of HTML elements (tags) inside the template are supported:
         * <ul>
         * <li> attribute loop - HTML element (tag) having loop="myLoop" attribute would be represented by a loop named "myLoop" of the Template capsule. For example, HTML code &lt;div loop="myLoop"&gt;...&lt;/div&gt; would make template capsule have loop named myLoop that represents the div element. Element having loop attribute must be one of the root elements in the templete code. Moreover, root elements have to have loop attribute in order to be displayed on the page. Since HTML code of template capsule may have more than one root element, consequently the template capsule may have more than one loop.
         * <li> attribute hook - HTML element (tag) having hook="myHook" attribute would be represented by a hook named "myHook" of the Template capsule. Any element (tag) of the HTML template code may have the hook attribute. Usually however, the leaf elements of the template code have it, as they expect to be filled with new HTML content when their hooks get tied to the hierarchy of hooks and loops.
         * <li> attribute prop - HTML element (tag) having prop="setProp" attribute would act as a target for "setProp" input operation of the Template capsule. The operation sets new property value for the given property of the target element. The operation has two string arguments: the property name and the property value to be set.
         * <li> attribute getprop - HTML element (tag) having getprop="getProp" attribute would act as a target for "getProp" input operation of the Template capsule. The operation returns the property value of the target element. The operation has one string argument: the property name whose value is to be returned.
         * <li> attribute attr - HTML element (tag) having attr="setAttr" attribute would act as a target for "setAttr" input operation of the Template capsule. The operation sets new attribute value for the given attribute of the target element. The operation has two string arguments: the attribute name and the attribute value to be set.
         * <li> attribute getattr - HTML element (tag) having getattr="getAttr" attribute would act as a target for "getAttr" input operation of the Template capsule. The operation returns the attribute value of the target element. The operation has one string argument: the attribute name whose value is to be read.
         * <li> attribute remattr - HTML element having remattr="removeAttr" attribute would act as a target for "removeAttr" input operation of the Template capsule. The operation removes the attribute from the target element. The operation has one string argument: the attribute name to be removed.
         * <li> attributes on and output - HTML element having on="click" and output="clicked" attributes would have 'click' event listener bound to the "clicked" output operation of the Template capsule. The event object itself would be provided as a parameter to the output operation.
         * <li> attribute get - HTML element having get="getMe" attribute would act as a target for "getMe" input operation of the Template capsule. The operation returns the target (DOM) element itself.
         * </ul>
         * <p> Initially, the Template capsule has no methods, operations, hooks, or loops. However it dynamically creates them during instantiation, depending on how the abovementioned attribures are being used within the template.
         *
         * @memberof module:html
         * @param {string} htmlCode - template HTML code with optional extensions (special attributes). We suggest using template literals for htmlCode instead of single or double quotes so that IDE can visually distinguish templates from regular strings.
         * @public
         * @since 0.1.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:html.Errors.ILLEGAL_ARGUMENT}
         */
        var Template = cps.defCapsule({
                listeners: '*[]',

                init: function (htmlCode) {
                    if (!isString_(htmlCode))
                        throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure you call Template constructor with template literal argument (or String).'));

                    var temp = document.createElement('div');
                    temp.innerHTML = htmlCode;
                    // loops
                    for (var i = 0; i < temp.children.length; i++) {
                        var el = temp.children[i],
                        loopName = el.getAttribute(T_LOOP),
                        part = new cps.ElementRef(el);
                        el.removeAttribute(T_LOOP);
                        this[loopName] = new cps.Loop();
                        this[loopName].tie(part.loop);
                    }

                    // hooks
                    var hookNodeList = temp.querySelectorAll('[' + T_HOOK + ']');
                    for (var h = 0; h < hookNodeList.length; h++) {
                        var hookElement = hookNodeList.item(h),
                        hookRef = new cps.ElementRef(hookElement),
                        hookName = hookElement.getAttribute(T_HOOK);
                        hookElement.removeAttribute(T_HOOK);
                        this[hookName] = new cps.Hook();
                        hookRef.hook.tie(this[hookName]);
                    }

                    // inputs
                    function prop_(propName, propValue) {
                        this[propName] = propValue;
                    }
                    function getprop_(propName) {
                        return this[propName];
                    }
                    function attr_(attrName, attrValue) {
                        this.setAttribute(attrName, attrValue);
                    }
                    function remattr_(attrName) {
                        this.removeAttribute(attrName);
                    }
                    function getattr_(attrName) {
                        return this.getAttribute(attrName);
                    }
                    function get_() {
                        return this;
                    }
                    this.doInputs_(temp, T_PROP, prop_);
                    this.doInputs_(temp, T_GET_PROP, getprop_);
                    this.doInputs_(temp, T_ATTR, attr_);
                    this.doInputs_(temp, T_REM_ATTR, remattr_);
                    this.doInputs_(temp, T_GET_ATTR, getattr_);
                    this.doInputs_(temp, T_GET, get_);

                    // outputs
                    function wrapper_(output) {
                        return function (e) {
                            output(e);
                        }
                    }
                    var outputNodeList = temp.querySelectorAll('[' + T_OUTPUT + ']'),
                    that = this;
                    for (var op = 0; op < outputNodeList.length; op++) {
                        var outputElement = outputNodeList.item(op),
                        outputName = outputElement.getAttribute(T_OUTPUT),
                        eventName = outputElement.getAttribute(T_ON),
                        output = this.getOutput(outputName);
                        if (output == null) {
                            output = new cps.Output();
                            this[outputName] = output;
                        }
                        var listener = cps.contextualize(wrapper_(output));
                        outputElement.addEventListener(eventName, listener);
                        this.listeners.get().push({
                            element: outputElement,
                            event: eventName,
                            handler: listener
                        });
                        outputElement.removeAttribute(T_OUTPUT);
                        outputElement.removeAttribute(T_ON);
                    }
                },

                doInputs_: function (temp, attrName, inputTargetFunction) {
                    var inputNodeList = temp.querySelectorAll('[' + attrName + ']');
                    for (var i = 0; i < inputNodeList.length; i++) {
                        var el = inputNodeList.item(i),
                        inputName = el.getAttribute(attrName),
                        input = this.getInput(inputName);
                        if (input == null) {
                            input = new cps.Input();
                            this[inputName] = input;
                        }
                        input.wire(inputTargetFunction.bind(el));
                        el.removeAttribute(attrName);
                    }
                },

                onDetach: function () {
                    var listeners = this.listeners.get();
                    for (var i = 0; i < listeners.length; i++) {
                        var listener = listeners[i];
                        listener.element.removeEventListener(listener.event, listener.handler);
                    }
                    this.listeners = new cps.Data([]);
                }
            });

        /**
         * The \'loop\' keyword for specifying the loop name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        var T_LOOP = 'loop',

        /**
         * The \'hook\' keyword for specifying the hook name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_HOOK = 'hook',

        /**
         * The \'prop\' keyword for specifying the input operation (property setter) name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_PROP = 'prop',

        /**
         * The \'getprop\' keyword for specifying the input operation (property getter) name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_GET_PROP = 'getprop',

        /**
         * The \'attr\' keyword for specifying the input operation (attribute setter) name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_ATTR = 'attr',

        /**
         * The \'getattr\' keyword for specifying the input operation (attribute getter) name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_GET_ATTR = 'getattr',

        /**
         * The \'remattr\' keyword for specifying the input operation (attribute remover) name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_REM_ATTR = 'remattr',

        /**
         * The \'output\' keyword for specifying the event's output operation name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_OUTPUT = 'output',

        /**
         * The \'on\' keyword for specifying the event name within the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_ON = 'on',

        /**
         * The \'get\' keyword for specifying the element inside the [Template]{@link module:html.Template} capsule.
         *
         * @const
         * @private
         */
        T_GET = 'get';

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
         * Checks whether the given object is a DOM Element or not.
         *
         * @param {Object} obj - object to be checked
         * @returns {boolean} true if obj is actually a DOM Element, false otherwise
         *
         * @private
         */
        function isElement_(obj) {
            return obj instanceof Node && obj instanceof Element;
        }

        /**
         * Checks whether the given object is a string or not.
         *
         * @param {Object} obj - object to be checked
         * @returns {boolean} true if obj is actually a string, false otherwise
         *
         * @private
         */
        function isString_(obj) {
            return typeof obj === 'string';
        }

        /**
         * Checks whether the given object is a Text node or not.
         *
         * @param {Object} obj - object to be checked
         * @returns {boolean} true if the obj is actually a Text node, false otherwise
         *
         * @private
         */
        function isTextNode_(obj) {
            return obj instanceof Node && obj instanceof Text;
        }

        /**
         * A collection of [ErrorMessage]{@link module:services.ErrorMessage} objects to use in appropriate erroneous situations.
         *
         * @memberof module:html
         * @namespace
         * @public
         * @readonly
         * @since 0.1.0
         * @static
         */
        var Errors = {

            /**
             * Usage: when function argument is not according to expectations. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Illegal argument(s). $1 (#1000)' </i>
             */
            ILLEGAL_ARGUMENT: new services.ErrorMessage(1000, 'Illegal argument(s). $1')
        };

        // *****************************
        // Services
        // *****************************

        /**
         * The collection of built-in service types of html.js module.
         *
         * @memberof module:html
         * @namespace
         * @public
         * @readonly
         * @since 0.1.0
         * @static
         */
        var ServiceType = {
            /**
             * Service type that enables delivery of requests from a browser to a server as an AJAX HTTP request. Each service of this type should have the following properties specified in its service config object (the second argument of the service registration [register]{@link module:services.register} function):
             * <p> - (string) type - set to html.ServiceType.AJAX <br>
             * - (string) url - the URL of the server-side service handler <br>
             * - (string) method - the HTTP method to be used <br>
             * - (boolean) async - [optional] whether to send HTTP request synchronously or asynchronously (default async = true) <br>
             * - (string) user - [optional] user performing the action <br>
             * - (string) password - [optional] user's password <br>
             * - (Object) headers - [optional] request headers to add to the HTTP request using setRequestHeader method<br>
             * - (Function) beforeSend - [optional] function that modifies the request prior to sending (request would be provided to it as an argument)
             *
             * @example <caption>Example of ServiceType.AJAX service </caption>
             * services.register('myAjaxService', {
             *     type: html.ServiceType.AJAX,
             *     url: 'services/service-x',
             *     method: 'post',
             *     headers: {
             *         'Cache-Control' : 'no-cache'
             *     },
             *     beforeSend: function(xHttpReq){
             *         xHttpReq.setRequestHeader('Keep-Alive', '300');
             *     }
             * });
             *
             */
            AJAX: 'AJAX',

            /**
             * Service type that enables delivery of requests from a browser to a server as an AJAX HTTP request where all the requests are encoded in a URL's query string (using encodeURIComponent function, in the form of encodedRequests=...). Each service of this type should have the following properties specified in its service config object (the second argument of the service registration [register]{@link module:services.register} function):
             * <p> - (string) type - set to html.ServiceType.AJAX_URL_ENCODED <br>
             * - (string) url - the URL of the server-side service handler <br>
             * - (string) method - the HTTP method to be used <br>
             * - (boolean) async - [optional] whether to send HTTP request synchronously or asynchronously (default async = true) <br>
             * - (string) user - [optional] user performing the action <br>
             * - (string) password - [optional] user's password <br>
             * - (Object) headers - [optional] request headers to add to the HTTP request using setRequestHeader method<br>
             * - (Function) beforeSend - [optional] function that modifies the request prior to sending (request would be provided to it as an argument)
             */
            AJAX_URL_ENCODED: 'AJAX_URL_ENCODED',

            /**
             * Service type that enables ajax-based delivery of requests through the jQuery API. Each service of this type should have the service config object (the second argument of the service registration [register]{@link module:services.register} function) having the type property set to html.ServiceType.AJAX_JQUERY and other properties specified as properties of the settings object in jQuery's ajax function (see {@link http://api.jquery.com/jquery.ajax/}). Note that dataType: 'json' is hardcoded into the jQuery's settings object.
             *
             * @example <caption>Example of jQuery AJAX service </caption>
             * services.register('myJQueryService', {
             *     type: html.ServiceType.AJAX_JQUERY,
             *     // the type is followed by jQuery-specific properties of the 'settings' object
             *     // dataType: 'json' is assumed
             *     url: "some.php",
             *     method: "POST",
             *     accepts: {
             *         mycustomtype: 'application/x-some-custom-type'
             *     }
             * });
             */
            AJAX_JQUERY: 'AJAX_JQUERY'
        };

        services.registerType(ServiceType.AJAX, function (requests, config, serviceName) {
            var arr = [],
            packed,
            responses;
            for (var i = 0; i < requests.length; i++)
                arr.push(requests[i].body);
            packed = JSON.stringify(arr);

            var xhttp = createXMLHTTPRequest_();
            if (config.async !== false)
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && isSuccess_(this.status)) {
                        responses = JSON.parse(this.responseText);
                        if (!isArray_(responses) || responses.length !== requests.length)
                            services.rejectAll(requests, new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));
                        else
                            services.resolveAllSuccessful(requests, responses);
                    } else if (this.readyState == 4) { // Error
                        services.rejectAll(requests, new Error(services.Errors.ERRONEOUS_RESPONSE.toString('Response status code: ' + this.status + '.')));
                    }
                    if (this.readyState == 4) {
                        if (this.status == 0) // timeout
                            services.setServiceStatus(serviceName, 'offline');
                        else
                            services.setServiceStatus(serviceName, 'online');
                    }
                };
            xhttp.open(config.method,
                config.url,
                (config.async === false ? false : true),
                (config.user != null ? config.user : null),
                (config.password != null ? config.password : null));
            for (var header in config.headers)
                xhttp.setRequestHeader(header, config.headers[header]);
            if (typeof config.beforeSend === 'function')
                config.beforeSend(xhttp);
            xhttp.send(packed);
            if (config.async === false) {
                if (isSuccess_(xhttp.status)) {
                    responses = JSON.parse(xhttp.responseText);
                    if (!isArray_(responses) || responses.length !== requests.length)
                        services.rejectAll(requests, new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));
                    else
                        services.resolveAllSuccessful(requests, responses);
                } else {
                    services.rejectAll(requests, new Error(services.Errors.ERRONEOUS_RESPONSE.toString('Response status code: ' + xhttp.status + '.')));
                }
                if (xhttp.status == 0) // timeout
                    services.setServiceStatus(serviceName, 'offline');
                else
                    services.setServiceStatus(serviceName, 'online');
            }
        });

        services.registerType(ServiceType.AJAX_URL_ENCODED, function (requests, config, serviceName) {
            var arr = [],
            packed,
            responses;
            for (var i = 0; i < requests.length; i++)
                arr.push(requests[i].body);
            packed = 'encodedRequests=' + encodeURIComponent(JSON.stringify(arr));

            var xhttp = createXMLHTTPRequest_();
            if (config.async !== false)
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && isSuccess_(this.status)) {
                        responses = JSON.parse(this.responseText);
                        if (!isArray_(responses) || responses.length !== requests.length)
                            services.rejectAll(requests, new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));
                        else
                            services.resolveAllSuccessful(requests, responses);
                    } else if (this.readyState == 4) { // Error
                        services.rejectAll(requests, new Error(services.Errors.ERRONEOUS_RESPONSE.toString('Response status code: ' + this.status + '.')));
                    }
                    if (this.readyState == 4) {
                        if (this.status == 0) // timeout
                            services.setServiceStatus(serviceName, 'offline');
                        else
                            services.setServiceStatus(serviceName, 'online');
                    }
                };
            var index = config.url.indexOf('?'),
            sep;
            if (index === -1)
                sep = '?';
            else if (index === config.url.length - 1)
                sep = '';
            else
                sep = '&';
            xhttp.open(config.method,
                config.url + sep + packed,
                (config.async === false ? false : true),
                (config.user != null ? config.user : null),
                (config.password != null ? config.password : null));

            for (var header in config.headers)
                xhttp.setRequestHeader(header, config.headers[header]);
            if (typeof config.beforeSend === 'function')
                config.beforeSend(xhttp);
            xhttp.send(null);
            if (config.async === false) {
                if (isSuccess_(xhttp.status)) {
                    responses = JSON.parse(xhttp.responseText);
                    if (!isArray_(responses) || responses.length !== requests.length)
                        services.rejectAll(requests, new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));
                    else
                        services.resolveAllSuccessful(requests, responses);
                } else {
                    services.rejectAll(requests, new Error(services.Errors.ERRONEOUS_RESPONSE.toString('Response status code: ' + xhttp.status + '.')));
                }
                if (xhttp.status == 0) // timeout
                    services.setServiceStatus(serviceName, 'offline');
                else
                    services.setServiceStatus(serviceName, 'online');
            }
        });

        services.registerType(ServiceType.AJAX_JQUERY, function (requests, config, serviceName) {
            var arr = [],
            packed;
            for (var i = 0; i < requests.length; i++)
                arr.push(requests[i].body);
            packed = JSON.stringify(arr);

            var settings = Object.assign({}, config);
            settings.data = packed;
            settings.dataType = 'json';
            var jQueryRequest = $.ajax(settings);
            jQueryRequest.done(function (responses) {
                if (!isArray_(responses) || responses.length !== requests.length)
                    services.rejectAll(requests, new Error(services.Errors.ILLEGAL_RESPONSE_SIZE.toString()));
                else
                    services.resolveAllSuccessful(requests, responses);
                services.setServiceStatus(serviceName, 'online');
            });
            jQueryRequest.fail(function (jqXHR, textStatus, errorThrown) {
                services.rejectAll(requests, errorThrown);
                if (jqXHR.status == 0) // timeout
                    services.setServiceStatus(serviceName, 'offline');
                else
                    services.setServiceStatus(serviceName, 'online');
            });
        });

        /**
         * @private
         */
        function isSuccess_(statusCode) {
            return (statusCode >= 200 && statusCode < 300) || statusCode === 304;
        }

        /**
         * @private
         */
        function createXMLHTTPRequest_() {
            var xhttp;
            if (window.XMLHttpRequest) {
                xhttp = new XMLHttpRequest();
            } else {
                // for IE6, IE5
                xhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            return xhttp;
        }

        // Object.assign polyfill for IE
        if (typeof Object.assign !== 'function') {
            // Must be writable: true, enumerable: false, configurable: true
            Object.defineProperty(Object, "assign", {
                value: function assign(target, varArgs) { // .length of function is 2
                    'use strict';
                    if (target == null) { // TypeError if undefined or null
                        throw new TypeError('Cannot convert undefined or null to object');
                    }

                    var to = Object(target);

                    for (var index = 1; index < arguments.length; index++) {
                        var nextSource = arguments[index];

                        if (nextSource != null) { // Skip over if undefined or null
                            for (var nextKey in nextSource) {
                                // Avoid bugs when hasOwnProperty is shadowed
                                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                    to[nextKey] = nextSource[nextKey];
                                }
                            }
                        }
                    }
                    return to;
                },
                writable: true,
                configurable: true
            });
        }

        /**
         * <p> HTML module enables and eases building web pages using capsules.
         * <p> Although [capsula module]{@link module:capsula} already has a mechanism for binding the world of capsules to any external world (see [ElementRef capsule]{@link module:capsula.ElementRef}), HTML module is provided to further improve and extend this mechanism for one specific external world: the world of HTML.
         * <p> There are two different ways to build web pages, using templates or using object-oriented APIs. To build web pages using templates consider using [Template capsule]{@link module:html.Template}. On the other hand, if you prefer object-oriented approach, the [Element]{@link module:html.Element} and [Text]{@link module:html.Text} capsules are the right choice. Since one-sided approaches are not always the best, we suggest combining these two capsules to find a perfect mix of templates and object-orientation in your UI code.
         * <p> For all capsules that have one root HTML element (i.e. one loop), extend the [HasRootHTML capsule]{@link module:html.HasRootHTML}.
         * <p> HTML module is not a complete solution for building web pages. It is just a starting point and a basis for building HTML widget libraries.
         *
         * @exports html
         * @requires module:capsula
         * @requires module:services
         * @version 0.1.0
         */
        var ns = {
            Text: Text$,
            HasRootHTML: HasRootHTML,
            Element: Element$,
            Template: Template,
            Errors: Errors,
            ServiceType: ServiceType
        }

        return ns;
    }));
