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
 * @file State machines module provides support for implementing behavior using state machines. Read [more]{@link module:sm}.
 * @copyright 2018 SOL Software
 * @license Apache-2.0
 * @since 0.2.0
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.sm = factory();
    }
}
    (this, function () {

        'use strict';

        var TOP_STATE_NAME = 'TOP',
        SEP = '.',
        TRIGGERLESS = 'next',
        INITIAL = 'initial',
        FINAL = 'final',
        TARGET = 'target',
        GUARD = 'guard',
        EFFECT = 'effect',
		STEADY = 'steady';

		/**
         * Stores all information about a state.
         *
         * @class
         * @memberof module:sm
         * @private
         */
        function State_(name, definition, parent) {
            this.name = name;
            this.definition = definition;
            this.parent = parent;
            this.initial = null;
            this.isComposite = null;
            this.isFinal = null;
            this.isInitial = null;
			this.isSteady = null;
            this.triggerless = [];
        }

		/**
         * Private data for the state machine instance. Stores the host object and its state.
         *
         * @class
         * @memberof module:sm
         * @private
         */
        function StateMachineInstanceData_(host, state) {
            this.host = host;
            this.state = state;
        }

		/**
         * Stores all information about the whole state machine.
         *
         * @class
         * @memberof module:sm
         * @private
         */
        function StateMachineClassData_() {
            this.states = {}; // all states (name - value pairs)
        }

		/**
         * Recursively processes the state machine definition and creates internal representation of the state machine.
		 * 
		 * @private
         */
        StateMachineClassData_.prototype.processDefinition = function (name, defKey, definition, parent) {
            var state = new State_(name, definition, parent);
            if (defKey === INITIAL && !isNothing_(parent))
                parent.initial = state;
            this.states[name] = state;
            var isComposite = false,
			isSteadyFlagSet = false,
			steadyFlag = null,
            numInitial = 0,
            numFinal = 0,
			hasTransitions = false;
            for (var key in definition) {
                var value = definition[key]; // order: 1
                key = key.trim(); // order: 2
                if (key === TRIGGERLESS) {
                    if (!isObject_(value) && !isArray_(value))
                        throw new Error(Errors.ILLEGAL_DESIGN.toString('The ' + TRIGGERLESS + ' property for state ' + state.name + ' should either be a transition object or an array of transition objects.'));
					if (isArray_(value)){
						for (var i = 0; i < value.length; i++){
							if (isNothing_(value[i][TARGET]))
								throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure triggerless transitions all have \'target\' property. State: ' + state.name));
							state.triggerless.push(value[i]);
						}
					} else {
						if (isNothing_(value[TARGET]))
							throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure triggerless transitions all have \'target\' property. State: ' + state.name));
						state.triggerless.push(value);
					}
					hasTransitions = true;
                } else if (key === STEADY) {
					isSteadyFlagSet = true;
					steadyFlag = !!value;
				} else if (isObject_(value)) {
                    if (isNothing_(value[TARGET])) { // (sub) state
                        isComposite = true;
                        if (key === INITIAL)
                            numInitial++;
                        if (key === FINAL)
                            numFinal++;
                        this.processDefinition(name + SEP + key, key, value, state);
                    } else { // transition
						hasTransitions = true;
					}
                }
            }
            if (isComposite && numInitial !== 1)
                throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure composite state ' + state.name + ' has exactly one initial state.'));
            if (isComposite && numFinal > 1)
                throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure composite state ' + state.name + ' has at most one final state.'));

            state.isComposite = isComposite;
            state.isFinal = defKey === FINAL;
            state.isInitial = defKey === INITIAL;
			
			if (state.isFinal && hasTransitions)
                throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure final states don\'t have transitions of their own. State: ' + state.name));
			
			if (isSteadyFlagSet){
				if (steadyFlag){
					if (state.isInitial || state.isComposite)
						throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure composite and initial states are never steady. State: ' + state.name));
				} else {
					if (state.isFinal)
						throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure final states are always steady. State: ' + state.name));
				}
				state.isSteady = steadyFlag;
			} else {
				state.isSteady = !state.isComposite && !state.isInitial;
			}

            if (state.isComposite && (state.isFinal || state.isInitial))
                throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure the composite state ' + state.name + ' is neither initial nor final.'));
            if (state.isInitial && state.triggerless.length === 0)
                throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure the initial state ' + state.name + ' has at least one outgoing triggerless transition.'));
            if (state.isFinal && state.triggerless.length > 0)
                throw new Error(Errors.ILLEGAL_DESIGN.toString('Make sure the final state ' + state.name + ' has no outgoing transitions at all.'));
            if (state.isFinal) {
                state.triggerless = parent.triggerless;
            }
        };

		/**
         * @classdesc Holds the the host object and the state of the host object. Runs the host object through the lifecycle according to the state machine definition. The root class for all SM classes.
         *
         * @abstract
         * @class
         * @memberof module:sm
         * @public
         * @since 0.2.0
         */
        function StateMachine(host) {
            var privateData = new StateMachineInstanceData_(host, this.constructor.compiledDef.states[TOP_STATE_NAME]);
            this._ = privateData;
        }

		/**
         * Starts the lifecycle of the host object, i.e. "pushes" the host object into the initial state of this state machine (and further from there).
         *
         * @public
         * @since 0.2.0
         * @throws {Error} [RUNTIME_ERROR]{@link module:sm.Errors.RUNTIME_ERROR}
         */
        StateMachine.prototype.init = function () {
            proceeed_(this, null, null);
        };

		/**
         * Returns the state of its corresponding host object.
         *
         * @public
         * @since 0.2.0
         * @returns {string} the state of its corresponding host object
         */
        StateMachine.prototype.getState = function () {
            return this._.state.name;
        };

		/**
         * Executes the state machine according to the given trigger. 
         *
		 * @param {string} trigger - event that triggers state machine execution
         * @public
         * @since 0.2.0
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:sm.Errors.ILLEGAL_ARGUMENT}, [RUNTIME_ERROR]{@link module:sm.Errors.RUNTIME_ERROR}
         */
        StateMachine.prototype.process = function (trigger) {
            if (!isString_(trigger) || trigger.trim().length === 0)
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'trigger\' argument is a non-empty string.'));

            proceeed_(this, null, trigger);
        };

		/**
         * Creates and returns a state machine constructor function based on the given state machine definition object. Using the returned constructor function one can create state machine instances one for each host object that needs to be handled by the given state machine definition.
         * 
		 * @memberof module:sm
         * @public
         * @static
         * @since 0.2.0
		 * @param {object} definition - specification of the state machine
		 * @returns {Function} state machine constructor function
         * @throws {Error} [ILLEGAL_ARGUMENT]{@link module:sm.Errors.ILLEGAL_ARGUMENT}, [ILLEGAL_DESIGN]{@link module:sm.Errors.ILLEGAL_DESIGN}
         */
        function defSM(definition) {
            if (!isObject_(definition))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'definition\' argument is an object.'));

            var StateMachineClass = function StateMachineClass(host) {
				if (!isObject_(host))
					throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure the \'host\' argument is provided.'));
                var sm;
                if (!this || !this.isSMConstructed) {
                    sm = Object.create(StateMachineClass.prototype);
                    Object.defineProperty(sm, 'isSMConstructed', {
                        value: true,
                        writeable: false,
                        enumerable: false
                    });
                } else {
                    throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure \'this\' is not an already constructed state machine.'));
                }
                StateMachine.apply(sm, arguments);
                return sm;
            };

            StateMachineClass.def = definition;
            var smData = new StateMachineClassData_();
            smData.processDefinition(TOP_STATE_NAME, '', definition, null);
            StateMachineClass.compiledDef = smData;
            extend_(StateMachineClass, StateMachine);
            return StateMachineClass;
        }

        /**
         * @private
         */
        function proceeed_(sm, commonOwner, trigger) {
            var host = sm._.host,
            state = sm._.state,
            smClass = sm.constructor;
            var transitions = findTransitions_(state, commonOwner, trigger);
            var isLeft = false;
            for (var i = 0; i < transitions.length; i++) {
                var t = transitions[i];
                if (isNothing_(t[GUARD]) || execute_(host, t[GUARD], sm)) {
                    var target = smClass.compiledDef.states[t[TARGET]];
                    if (isNothing_(target))
                        throw new Error(Errors.RUNTIME_ERROR.toString('Make sure the \'target\' property (' + t.target + ') points to an existing state.'));
                    isLeft = true;
                    var newCommonOwner = getCommonOwner_(state, target),
                    exitArr = getExitActions_(state, newCommonOwner),
                    entryArr = getEntryActions_(target, newCommonOwner);

                    for (var ex = 0; ex < exitArr.length; ex++)
                        execute_(host, exitArr[ex], sm);

                    execute_(host, t[EFFECT], sm);

                    for (var en = 0; en < entryArr.length; en++)
                        execute_(host, entryArr[en], sm);

                    sm._.state = target;

                    proceeed_(sm, newCommonOwner, null);
                    break;
                }
            }
            if (!isLeft && !state.isSteady)
                throw new Error(Errors.RUNTIME_ERROR.toString('Make sure the state machine never stops (completes) in a not steady state, such as: ' + state.name));
        }

        /**
         * @private
         */
        function findTransitions_(state, commonOwner, trigger) {
            if (state.isComposite)
                return [{
                        target: state.initial.name
                    }
                ];

            var transitions = [];
			if (isNothing_(trigger)){ // triggerless
				for (; state != null && state != commonOwner; state = state.parent)
					Array.prototype.push.apply(transitions, state.triggerless);
			} else {
				for (; state != null; state = state.parent)
					if (!isNothing_(state.definition[trigger]))
						transitions.push(state.definition[trigger]);
			}
            return transitions;
        }

        /**
         * @private
         */
        function getCommonOwner_(state1, state2) {
            for (var s1 = state1; s1 != null; s1 = s1.parent) {
                var candidate = s1;
                for (var s2 = state2; s2 != null; s2 = s2.parent) {
                    if (s2 === candidate)
                        return s2;
                }
            }
            return null; // this should never happen
        }

        /**
         * @private
         */
        function getExitActions_(s, owner) {
            var actions = [];
            for (; s != owner; s = s.parent)
                if (!isNothing_(s.definition.exit))
                    actions.push(s.definition.exit);
            return actions;
        }

        /**
         * @private
         */
        function getEntryActions_(s, owner) {
            var actions = [];
            for (; s != owner; s = s.parent)
                if (!isNothing_(s.definition.entry))
                    actions.splice(0, 0, s.definition.entry); // reverse order
            return actions;
        }

        /**
         * @private
         */
        function execute_(host, func, sm) {
            if (isNothing_(func))
                return;
            if (typeof func === 'function')
                return func.call(host, sm);
            else
                return host[func].call(host, sm);
        }

        /**
         * @private
         */
        function extend_(Sub, Base) {
            Sub.prototype = Object.create(Base.prototype);
            Sub.prototype.constructor = Sub;
            Sub.super$ = Base;
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
         * @private
         */
        function isString_(obj) {
            return typeof obj === 'string';
        }

		/**
         * @private
         */
        function ErrorMessage_(code, desc) {
            if (!isNumber_(code))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure code is a number.'));
            if (!isString_(desc))
                throw new Error(Errors.ILLEGAL_ARGUMENT.toString('Make sure desc is a string.'));
            this.code = code;
            this.desc = desc;
        }

        /**
         * @private
         */
        ErrorMessage_.prototype.toString = function (var_args) {
            var desc = this.desc;
            for (var i = 0; i < arguments.length; i++)
                desc = desc.replace('$' + (i + 1), arguments[i]);
            return 'Oops! ' + desc + ' (#' + this.code + ')';
        };
		
		/**
         * A collection of messages to use in appropriate erroneous situations.
         *
         * @memberof module:sm
         * @namespace
         * @public
         * @readonly
         * @since 0.2.0
         * @static
         */
        var Errors = {
			/**
             * Usage: when function argument is not according to expectations. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Illegal argument(s). $1 (#3000)' </i>
             */
			ILLEGAL_ARGUMENT: new ErrorMessage_(3000, 'Illegal argument(s). $1'),
			/**
             * Usage: when state machine has obvious problem visible in the design-time. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Illegal design of state machine. $1 (#3001)' </i>
             */
			ILLEGAL_DESIGN: new ErrorMessage_(3001, 'Illegal design of state machine. $1'),
			/**
             * Usage: when runtime error occurs during the execution of state machine. Error message (without $1 placeholder replaced and with the error code):
             * <p><i> 'Oops! Runtime error. $1 (#3002)' </i>
             */
			RUNTIME_ERROR: new ErrorMessage_(3002, 'Runtime error. $1'),
		}
		
        /**
         * <p> sm.js module provides means to create and use <a href="https://en.wikipedia.org/wiki/Finite-state_machine" target="_blank">state machines</a>. State machines are very powerful tool for handling behavior and dynamic aspects of any software.
         *
         * @exports sm
         * @since 0.2.0
         */
        var ns = {
            defSM: defSM
        };

        return ns;
    }));
