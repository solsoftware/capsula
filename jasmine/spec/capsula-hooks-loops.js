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

describe('hooks & loops', function () {
    var sol = window.capsula,
    XCapsule_,
	Element,
    sandboxDiv = document.createElement('div'),
    sandbox;

    function errorToRegExp(error) {
        return new RegExp(error.desc.replace(/\$\d/g, ".+").replace('(', '\\(').replace(')', '\\)'));
    }

    beforeAll(function () {
        document.body.appendChild(sandboxDiv);
        sandbox = new sol.ElementRef(sandboxDiv);

        XCapsule_ = sol.defCapsule({
                '>doThis': function () {},
                '<onThat': function () {},
                hooks: 'hook',
                loops: 'loop',
            });
		
		Element = sol.defCapsule({
				hooks: 'h',
				loops: 'l',
				p: {
					capsule: sol.ElementRef,
					deferredArgs: function(txt){
						var div = document.createElement('div');
						div.innerHTML = txt;
						return div;
					}
				},
				'this.h': 'p.hook',
				'this.l': 'p.loop'
            });
    });

    describe('containment checks', function () {
        var C;
        beforeAll(function () {
            C = sol.defCapsule({
                    hooks: ['hookA', 'hookB'],
                    loops: 'loop',
                    root: {
                        capsule: sol.ElementRef,
                        deferredArgs: function () {
                            var div = document.createElement('div');
                            div.setAttribute('id', 'root');
                            return div;
                        }
                    },
                    empty: XCapsule_,
                    'this.loop': 'root.loop',
                    'root.hook': ['this.hookA', 'empty.loop', 'this.hookB']
                });
        });

        it('should verify ordering of children is correct', function () {
            sandbox.hook.clear();

            var c = new C();
            sandbox.hook.tie(c.loop);

            var divB = document.createElement('div');
            divB.setAttribute('id', 'B');
            var b = new sol.ElementRef(divB);

            var divA = document.createElement('div');
            divA.setAttribute('id', 'A');
            var a = new sol.ElementRef(divA);

            c.hookB.tie(b.loop);
            c.hookA.tie(a.loop);

            expect(
                sandboxDiv.innerHTML).toBe('<div id="root"><div id="A"></div><div id="B"></div></div>');
        });

        it('should verify ordering of children is correct', function () {
            sandbox.hook.clear();

            var c = new C();
            sandbox.hook.tie(c.loop);

            var divB = document.createElement('div');
            divB.setAttribute('id', 'B');
            var b = new sol.ElementRef(divB);

            var divA = document.createElement('div');
            divA.setAttribute('id', 'A');
            var a = new sol.ElementRef(divA);

            c.hookB.tie(b.loop);
            c.hookA.tie(a.loop);

            expect(
                sandboxDiv.innerHTML).toBe('<div id="root"><div id="A"></div><div id="B"></div></div>');
        });

        it('should throw error when containment is cyclical', function () {
            sandbox.hook.clear();

            var divRef = new sol.ElementRef(document.createElement('div'));

            expect(function () {
                divRef.hook.tie(divRef.loop);
            }).toThrowError();
            expect(function () {
                divRef.hook.add(divRef.loop);
            }).toThrowError();
            expect(function () {
                divRef.hook.addAt(0, divRef.loop);
            }).toThrowError();
            expect(function () {
                divRef.loop.setParent(divRef.hook);
            }).toThrowError();

            var divRef2 = new sol.ElementRef(document.createElement('div'));
            expect(function () {
                divRef.hook.tie(divRef2.loop);
                divRef2.hook.tie(divRef.loop);
            }).toThrowError();
        });

        it('should verify event handlers are called', function () {
            var C = sol.defCapsule({
                    hooks: 'h',
                    init: function () {
                        this.h.setEventHandlers(function () {
                            this.onHookOperation('on hook called');
                        }, function () {
                            this.offHookOperation('off hook called');
                        });
                    },
                    '> setEventHandlers_': function () {
                        this.h.setEventHandlers(function () {
                            this.onHookOperation('on hook called again');
                        }, function () {
                            this.offHookOperation('off hook called again');
                        });
                    },
                    '< onHookOperation': function () {},
                    '< offHookOperation': function () {},
                    p: {
                        capsule: sol.ElementRef,
                        deferredArgs: function () {
                            var div = document.createElement('div');
                            div.setAttribute('id', '0');
                            return div;
                        }
                    },
                    'p.hook': 'this.h'
                });

            var c = new C(),
            el = new sol.ElementRef(document.createElement('div')),
            checkOnHook,
            checkOffHook;

            c.onHookOperation.wire(function (val) {
                checkOnHook = val;
            });
            c.offHookOperation.wire(function (val) {
                checkOffHook = val;
            });

            c.h.tie(el.loop);

            expect(checkOnHook).toBe('on hook called');

            c.h.clear();
            expect(checkOffHook).toBe('off hook called');

            c.setEventHandlers_();

            c.h.tie(el.loop);

            expect(checkOnHook).toBe('on hook called again');

            c.h.clear();
            expect(checkOffHook).toBe('off hook called again');
        });

        it('should verify classes are set and removed', function () {
            var C = sol.defCapsule({
                    hooks: 'hook',
                    init: function () {
                        this.hook.setClass('x');
                    },
                    p: {
                        capsule: sol.ElementRef,
                        deferredArgs: function () {
                            return document.createElement('div');
                        }
                    },
                    'this.hook': 'p.hook'
                });
            var C2 = sol.defCapsule({
                    hooks: 'hook',
                    init: function () {
                        this.hook.setClass('y');
                    },
                    p: C,
                    'this.hook': 'p.hook'
                });
            var c2 = new C2(),
            innerDiv = new sol.ElementRef(document.createElement('div'));
            c2.hook.tie(innerDiv.loop);

            expect(
                innerDiv.getElement().outerHTML).toBe('<div class="x y"></div>');

            c2.hook.remove(innerDiv.loop);

            expect(
                innerDiv.getElement().outerHTML === '<div class=""></div>' ||
                innerDiv.getElement().outerHTML === '<div></div>').toBe(true);
        });
    });

    describe('Hook', function () {
		beforeAll(function () {
			sandboxDiv = document.createElement('div');
			document.body.appendChild(sandboxDiv);
			sandbox = new sol.ElementRef(sandboxDiv);
		});
		
		beforeAll(function () {
			sandbox.hook.clear();
		});
		
        describe('getChildren()', function () {
            it('should verify a number of hooks', function () {
                var C = sol.defCapsule({
                        hooks: ['h1', 'h2'],
                        '> getResult_': function () {
                            return this.p1.hook.getChildren().length;
                        },
                        p1: XCapsule_,
                        p2: XCapsule_,
                        'p1.hook': ['this.h1', 'p2.loop', 'this.h2']
                    });

                var c = new C();
                expect(
                    c.getResult_()).toBe(3);

                var C2 = sol.defCapsule({
                        base: C,
                        hooks: 'h3',
                        'p1.hook': 'this.h3'
                    });

                var c2 = new C2();
                expect(
                    c2.getResult_()).toBe(4); // 1 + 3 derived
            });
        });

        describe('add(var_args)', function () {
            it('should throw error when there are non-hook or non-loop parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.add(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.add(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.add('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.add({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.add(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.add(c.loop, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.add(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify hooks and loops are added', function () {
                sandbox.hook.clear();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> add_': function (var_args) {
                            this.p1.hook.add.apply(this.p1.hook, arguments);
                        },
                        '> removeAll_': function () {
                            this.p1.hook.clear();
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '0');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        'this.l': 'p1.loop'
                    });

                var c = new C(),
                div3 = document.createElement('div'),
                div4 = document.createElement('div'),
                e3 = new sol.ElementRef(div3),
                e4 = new sol.ElementRef(div4);
                div3.setAttribute('id', '3');
                div4.setAttribute('id', '4');

                c.h1.add(e3.loop);
                c.h2.add(e4.loop);
                sandbox.hook.add(c.l);

                c.add_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.add_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.add_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.add_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div><div id="3"></div></div>');

                c.removeAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.add_(c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div></div>');

                c.removeAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.add_([c.h1, c.h2, c.p2.loop, c.p3.loop]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');

                c.add_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');

                c.add_([]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');
            });
        });

        describe('addAt(at, var_args)', function () {
            it('should throw error when at is out of bounds or not even a number', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.addAt(1, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.hook.addAt(-1, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.hook.addAt(c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(null, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(undefined, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt('not a number', c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt({}, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(function () {}, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should throw error when there are non-hook or non-loop parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.addAt(0, undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(0, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(0, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(0, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(0, 4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(0, c.loop, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.addAt(0, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify hooks and loops are added at the correct position', function () {
                sandbox.hook.clear();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> addAt_': function (at, var_args) {
                            this.p1.hook.addAt.apply(this.p1.hook, arguments);
                        },
                        '> removeAll_': function () {
                            this.p1.hook.clear();
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '0');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        'this.l': 'p1.loop'
                    });

                var c = new C(),
                div3 = document.createElement('div'),
                div4 = document.createElement('div'),
                e3 = new sol.ElementRef(div3),
                e4 = new sol.ElementRef(div4);
                div3.setAttribute('id', '3');
                div4.setAttribute('id', '4');

                c.h1.add(e3.loop);
                c.h2.add(e4.loop);
                sandbox.hook.add(c.l);

                c.addAt_(0, c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.addAt_(0, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="4"></div><div id="1"></div></div>');

                c.addAt_(1, c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="4"></div><div id="2"></div><div id="1"></div></div>');

                c.addAt_(3, c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="4"></div><div id="2"></div><div id="1"></div><div id="3"></div></div>');

                c.removeAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.addAt_(0, c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div></div>');

                c.removeAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.addAt_(0, c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.addAt_(1, [c.h1, c.h2]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="3"></div><div id="4"></div></div>');

                c.removeAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.addAt_(0, [c.h1, c.h2, c.p2.loop, c.p3.loop]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');

                c.addAt_(0);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');

                c.addAt_(0, []);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');
            });
        });

		describe('isParentOf(var_args)', function () {
			var Testable, t;
			beforeAll(function () {
				Testable = sol.defCapsule({
					parent: {
						capsule: Element,
						args: ''
					},
					child0: {
						capsule: Element,
						args: 'zero'
					},
					child1: {
						capsule: Element,
						args: 'one'
					},
					child2: {
						capsule: Element,
						args: 'two'
					},
					child3: {
						capsule: Element,
						args: 'three'
					},
					child4: {
						capsule: Element,
						args: 'four'
					},
					loops: 'myLoop',
					hooks: 'myHook',
					'this.myLoop' : 'parent.l',
					'+ isParentOf_': function(){
						return capsula.Hook.prototype.isParentOf.apply(this.parent.h, arguments);
					},
					'+ add_': function(){
						return capsula.Hook.prototype.add.apply(this.parent.h, arguments);
					}
				});
				
				t = new Testable();
				sandbox.hook.add(t.myLoop);
				var hookedElement = new Element('hooked');
				t.myHook.add(hookedElement.l);
			});
		
			it('should throw error when there are non-loop parameters', function () {
				expect(function () {
                    t.isParentOf_(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works', function () {
				t.add_(t.child0.l, t.child1.l, t.child2.l, t.child3.l, t.child4.l/*, t*/);
				
				expect(
					t.isParentOf_()).toBeFalsy();
				expect(
					t.isParentOf_([])).toBeFalsy();
				
				expect(
					t.isParentOf_(t.child0.l)).toBeTruthy();
				expect(
					t.isParentOf_(t.child1.l)).toBeTruthy();
				expect(
					t.isParentOf_(t.child2.l)).toBeTruthy();
				expect(
					t.isParentOf_(t.child3.l)).toBeTruthy();
				expect(
					t.isParentOf_(t.child4.l)).toBeTruthy();
				/*expect(
					t.isParentOf_(t)).toBeTruthy();*/
					
				expect(
					t.isParentOf_(t.child0.l, t.child1.l)).toBeTruthy();
				expect(
					t.isParentOf_([t.child2.l, t.child3.l])).toBeTruthy();
				expect(
					t.isParentOf_(t.child0.l, t.child1.l, t.child2.l, t.child3.l, t.child4.l/*, t*/)).toBeTruthy();
			});
		});
		
        describe('clear()', function () {
            it('should verify all ties are removed', function () {
                sandbox.hook.clear();

                var C = sol.defCapsule({
                        loops: 'l',
                        '> removeAll_': function () {
                            this.p1.hook.clear();
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '0');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        'this.l': 'p1.loop',
                        'p1.hook': ['p2.loop', 'p3.loop']
                    });

                var c = new C();
                sandbox.hook.add(c.l);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div></div>');

                c.removeAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });

        describe('remove(var_args)', function () {
            it('should throw error when there are non-hook or non-loop parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.remove(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.remove(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.remove('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.remove({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.remove(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.remove(c.loop, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.remove(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('shouldn\'t throw error when trying to remove ties that don\'t really exist', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.remove(c.loop);
                }).not.toThrowError();
            });

            it('should verify ties to hooks and loops are removed', function () {
                sandbox.hook.clear();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> add_': function (var_args) {
                            this.p1.hook.add.apply(this.p1.hook, arguments);
                        },
                        '> remove_': function (var_args) {
                            this.p1.hook.remove.apply(this.p1.hook, arguments);
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '0');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        'this.l': 'p1.loop'
                    });

                var c = new C(),
                div3 = document.createElement('div'),
                div4 = document.createElement('div'),
                e3 = new sol.ElementRef(div3),
                e4 = new sol.ElementRef(div4);
                div3.setAttribute('id', '3');
                div4.setAttribute('id', '4');

                c.h1.add(e3.loop);
                c.h2.add(e4.loop);
                sandbox.hook.add(c.l);

                c.add_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.remove_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.add_(c.p2.loop, c.p3.loop, c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');

                c.remove_(c.p3.loop, c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.remove_([c.p2.loop, c.h2]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.add_(c.p2.loop, c.p3.loop, c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');

                c.remove_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');

                c.remove_([]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');
            });
        });

        describe('set(var_args)', function () {
            it('should throw error when there are non-hook or non-loop parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.set(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.set(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.set('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.set({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.set(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.set(c.loop, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.set(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify ties to hooks and loops are re-set', function () {
                sandbox.hook.clear();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> set_': function (var_args) {
                            this.p1.hook.set.apply(this.p1.hook, arguments);
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '0');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        'this.l': 'p1.loop'
                    });

                var c = new C(),
                div3 = document.createElement('div'),
                div4 = document.createElement('div'),
                e3 = new sol.ElementRef(div3),
                e4 = new sol.ElementRef(div4);
                div3.setAttribute('id', '3');
                div4.setAttribute('id', '4');

                c.h1.add(e3.loop);
                c.h2.add(e4.loop);
                sandbox.hook.add(c.l);

                c.set_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.set_(c.p2.loop, c.p3.loop, c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');

                c.set_(c.p3.loop, c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="2"></div><div id="3"></div></div>');

                c.set_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.set_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.set_([]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });

        describe('getParent()', function () {
            it('should verify parent hook is returned when used on child hook or exception thrown when used on parent hook', function () {
                var C = sol.defCapsule({
                        hooks: 'h',
                        '> getResult1_': function () {
                            var res = this.h.getParent() == null;
                            this.h.setParent(this.p.hook);
                            res = res && this.h.getParent() === this.p.hook;
                            return res;
                        },
                        '> getResult2_': function () {
                            this.p.hook.getParent();
                        },
                        p: XCapsule_,
                    });

                var c = new C();

                expect(
                    c.getResult1_()).toBeTruthy();
                expect(function () {
                    c.getResult2_();
                }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));
            });
        });

        describe('setParent(hook)', function () {
            it('should throw error when there is a non-hook parameter', function () {
                var c = new XCapsule_();
                var h = new sol.Hook('h');
                expect(function () {
                    h.setParent('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.setParent({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.setParent(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.setParent(c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.setParent(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify hooks are tied', function () {
                sandbox.hook.clear();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> setParent_': function (hook) {
                            hook.setParent(this.p1.hook);
                        },
                        '> setNullToHook_': function (hook) {
                            hook.setParent(null);
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '0');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        'this.l': 'p1.loop'
                    });

                var c = new C(),
                div3 = document.createElement('div'),
                div4 = document.createElement('div'),
                e3 = new sol.ElementRef(div3),
                e4 = new sol.ElementRef(div4);
                div3.setAttribute('id', '3');
                div4.setAttribute('id', '4');

                c.h1.add(e3.loop);
                c.h2.add(e4.loop);
                sandbox.hook.add(c.l);

                c.setParent_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.setParent_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.setParent_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.setParent_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div><div id="3"></div></div>');

                c.setNullToHook_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div></div>');

                c.setNullToHook_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div></div>');

                c.setNullToHook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="2"></div></div>');

                c.setNullToHook_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });

        describe('tie(var_args)', function () {
            it('should throw error when there is a non-hook or non-loop parameter', function () {
                var c = new XCapsule_();
                var h = new sol.Hook('h2');
                expect(function () {
                    h.tie('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.tie({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.tie(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.tie(c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.tie(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    c.hook.tie(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.tie(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.tie('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.tie({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.tie(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.tie(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify a tie is created', function () {
                sandbox.hook.clear();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> setParent_': function (hook) {
                            hook.tie(this.p1.hook);
                        },
                        '> add_': function (to) {
                            this.p1.hook.tie(to);
                        },
                        '> removeAll_': function () {
                            this.p1.hook.clear();
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '0');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        'this.l': 'p1.loop'
                    });

                var c = new C(),
                div3 = document.createElement('div'),
                div4 = document.createElement('div'),
                e3 = new sol.ElementRef(div3),
                e4 = new sol.ElementRef(div4);
                div3.setAttribute('id', '3');
                div4.setAttribute('id', '4');

                c.h1.add(e3.loop);
                c.h2.add(e4.loop);
                sandbox.hook.add(c.l);

                c.setParent_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.setParent_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.setParent_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.setParent_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div><div id="3"></div></div>');

				c.removeAll_();
				
                c.add_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.add_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.add_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.add_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div><div id="3"></div></div>');

                c.removeAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });
    });

    describe('Loop', function () {
		var Testable, t, sandboxDiv1, sandbox1;
        beforeAll(function () {
			sandboxDiv1 = document.createElement('div');
			document.body.appendChild(sandboxDiv1);
			sandbox1 = new sol.ElementRef(sandboxDiv1);
			
			Testable = sol.defCapsule({
				child0: {
					capsule: Element,
					args: 'zero'
				},
				child1: {
					capsule: Element,
					args: 'one'
				},
				child2: {
					capsule: Element,
					args: 'two'
				},
				child3: {
					capsule: Element,
					args: 'three'
				},
				child4: {
					capsule: Element,
					args: 'four'
				},
				loops: 'myLoop',
				hooks: 'myHook',
				'+ getChildren_': function(){
					return capsula.Loop.prototype.getChildren.apply(this.myLoop, arguments);
				},
				'+ add_': function(){
					return capsula.Loop.prototype.add.apply(this.myLoop, arguments);
				},
				'+ addAt_': function(){
					return capsula.Loop.prototype.addAt.apply(this.myLoop, arguments);
				},
				'+ isParentOf_': function(){
					return capsula.Loop.prototype.isParentOf.apply(this.myLoop, arguments);
				},
				'+ clear_': function(){
					return capsula.Loop.prototype.clear.apply(this.myLoop, arguments);
				},
				'+ remove_': function(){
					return capsula.Loop.prototype.remove.apply(this.myLoop, arguments);
				},
				'+ set_': function(){
					return capsula.Loop.prototype.set.apply(this.myLoop, arguments);
				}
			});
			
			
        });
		
		beforeEach(function () {
			sandbox1.hook.clear();
			
			t = new Testable();
			sandbox1.hook.add(t.myLoop);
			var hookedElement = new Element('hooked');
			t.myHook.add(hookedElement.l);
		});
		
		describe('getChildren()', function () {
			it('should verify it works ', function () {
				t.add_(t.child0.l, t.child1.l, t.child2.l, t.child3.l, t.child4.l);

				expect(
					t.getChildren_().indexOf(t.child0.l) !== -1).toBeTruthy();
				expect(
					t.getChildren_().indexOf(t.child1.l) !== -1).toBeTruthy();
				expect(
					t.getChildren_().indexOf(t.child2.l) !== -1).toBeTruthy();
				expect(
					t.getChildren_().indexOf(t.child3.l) !== -1).toBeTruthy();
				expect(
					t.getChildren_().indexOf(t.child4.l) !== -1).toBeTruthy();
					
				/*t.add_(t, t.myHook);
				expect(
					t.getChildren_().indexOf(t.myHook) !== -1).toBeTruthy();*/
			});
		});
		
		describe('add(var_args)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.add_(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works', function () {
				t.add_();
				t.add_([]);
				t.add_(t.child0.l);
				t.add_(t.child1.l, t.child2.l);
				t.add_([t.child3.l, t.child4.l]);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div>');
					
				/*t.add_(t, t);
				expect(
                    sandboxDiv1.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div><div>hooked</div>');*/
			});
		});
		
		describe('addAt(at, var_args)', function () {
			it('should throw error when at is out of bounds or not even a number', function () {
                expect(function () {
                    t.addAt_(1, t.child0.l);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    t.addAt_(-1, t.child0.l);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    t.addAt_(t.child0.l);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_(null, t.child0.l);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_(undefined, t.child0.l);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_('not a number', t.child0.l);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_({}, t.child0.l);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_(function () {}, t.child0.l);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });
			
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.addAt_(0, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(0, undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(0, 1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(0, t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.addAt_(0);
				t.addAt_(0, []);
				t.addAt_(0, t.child0.l);
				t.addAt_(0, t.child1.l, t.child2.l);
				t.addAt_(1, [t.child3.l, t.child4.l]);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>one</div><div>three</div><div>four</div><div>two</div><div>zero</div>');
					
				/*t.addAt_(t, 0, t);
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>hooked</div><div>one</div><div>three</div><div>four</div><div>two</div><div>zero</div>');*/
			});
		});
		
		describe('isParentOf(var_args)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.isParentOf_(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(t.child0); // loop
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works', function () {
				t.add_(t.child0.l, t.child1.l, t.child2.l, t.child3.l, t.child4.l/*, t*/);
				
				expect(
					t.isParentOf_()).toBeFalsy();
				expect(
					t.isParentOf_([])).toBeFalsy();
				
				expect(
					t.isParentOf_(t.child0.l)).toBeTruthy();
				expect(
					t.isParentOf_(t.child1.l)).toBeTruthy();
				expect(
					t.isParentOf_(t.child2.l)).toBeTruthy();
				expect(
					t.isParentOf_(t.child3.l)).toBeTruthy();
				expect(
					t.isParentOf_(t.child4.l)).toBeTruthy();
					
				/*expect(
					t.isParentOf_(t, t)).toBeTruthy();*/
					
				expect(
					t.isParentOf_(t.child0.l, t.child1.l)).toBeTruthy();
				expect(
					t.isParentOf_([t.child2.l, t.child3.l])).toBeTruthy();
				expect(
					t.isParentOf_(t.child0.l, t.child1.l, t.child2.l, t.child3.l, t.child4.l/*, t*/)).toBeTruthy();
			});
		});
		
		describe('clear()', function () {
			it('should verify it works', function () {
				t.add_(t.child0.l, t.child1.l, t.child2.l, t.child3.l, t.child4.l/*, t*/);
				t.clear_();
				
				expect(
					t.getChildren_().length).toEqual(0);
			});
		});
		
		describe('remove(var_args)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.remove_(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works', function () {
				t.add_(t.child0.l, t.child1.l, t.child2.l, t.child3.l, t.child4.l/*, t*/);
				
				t.remove_();
				t.remove_([]);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div>');
					
				t.remove_(t.child0.l);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>one</div><div>two</div><div>three</div><div>four</div>');
				
				t.remove_(t.child1.l, t.child2.l);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>three</div><div>four</div>');
				
				t.remove_([t.child3.l, t.child4.l/*, t*/]);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('');
			});
		});
		
		describe('set(var_args)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.set_(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.add_(t.child0.l, t.child1.l, t.child2.l, t.child3.l, t.child4.l);
				
				t.set_();
				
				expect(
                    sandboxDiv1.innerHTML).toBe('');
					
				t.set_([t.child3.l, t.child4.l]);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>three</div><div>four</div>');
				
				t.set_([]);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('');
				
				t.set_(t.child0.l);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>zero</div>');
				
				t.set_(t.child1.l, t.child2.l);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div>one</div><div>two</div>');
				
				/*t.set_(t, t);
				
				expect(
                    sandboxDiv1.innerHTML).toBe('<div><div>hooked</div></div>');*/
			});
		});
		
        describe('getParent()', function () {
            it('should verify parent hook or loop or null is returned', function () {
                var C = sol.defCapsule({
                        loops: 'l',
                        '> getResult_': function () {
                            var res = this.p1.loop.getParent() == null;
                            res = res && this.p2.loop.getParent() == null;
                            this.l.tie(this.p2.loop);
                            res = res && this.p2.loop.getParent() === this.l;
                            this.p2.hook.tie(this.p1.loop);
                            res = res && this.p1.loop.getParent() === this.p2.hook;
                            return res;
                        },
                        p1: XCapsule_,
                        p2: XCapsule_,
                    });

                var c = new C();

                expect(
                    c.getResult_()).toBeTruthy();
            });
        });

        describe('setParent(hookOrLoop)', function () {
            it('should throw error when there is a non-loop or non-hook parameter', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.loop.setParent('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setParent({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setParent(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setParent(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify a tie is created', function () {
                sandbox1.hook.clear();

                var C = sol.defCapsule({
                        loops: 'l',
                        '> setParent_': function (child) {
                            child.setParent(this.l);
                        },
                        '> setNullParent_': function (child) {
                            child.setParent(null);
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        }
                    });

                var c = new C();

                c.l.setParent(sandbox1.hook);

                expect(
                    sandboxDiv1.innerHTML).toBe('');

                c.setParent_(c.p1.loop);

                expect(
                    sandboxDiv1.innerHTML).toBe('<div id="1"></div>');

                c.setNullParent_(c.p1.loop);

                expect(
                    sandboxDiv1.innerHTML).toBe('');

                c.setParent_(c.p1.loop);

                expect(
                    sandboxDiv1.innerHTML).toBe('<div id="1"></div>');

                c.l.setParent(null);

                expect(
                    sandboxDiv1.innerHTML).toBe('');

                c.l.setParent(sandbox1.hook);

                expect(
                    sandboxDiv1.innerHTML).toBe('<div id="1"></div>');
            });
        });

        describe('tie(var_args)', function () {
            it('should throw error when there is a non-hook or non-loop parameter', function () {
                var c = new XCapsule_();
                var l = new sol.Loop('l7');
                expect(function () {
                    l.tie('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.tie({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.tie(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.tie(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    c.loop.tie('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				expect(function () {
                    c.loop.tie(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.tie({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.tie(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.tie(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify a tie is created', function () {
                sandbox1.hook.clear();

                var C = sol.defCapsule({
                        loops: ['l1', 'l2'],
                        '> tieP2P1_': function () {
                            this.p2.loop.tie(this.p1.hook);
                        },
                        '> tieP3L2_': function () {
                            this.p3.loop.tie(this.l2);
                        },
                        '> tieL2P3_': function () {
                            this.l2.tie(this.p3.loop);
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '0');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        'this.l1': 'p1.loop'
                    });

                var c = new C();
                sandbox1.hook.add(c.l1, c.l2);

                c.tieP2P1_();

                expect(
                    sandboxDiv1.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.tieP3L2_();

                expect(
                    sandboxDiv1.innerHTML).toBe('<div id="0"><div id="1"></div></div><div id="2"></div>');

                c.tieL2P3_();

                expect(
                    sandboxDiv1.innerHTML).toBe('<div id="0"><div id="1"></div></div><div id="2"></div>');
            });
        });
    });
	
	// TODO za oba slucaja, i kad je parent === ctx i kada je parent === part
	describe('Capsule', function () {
		var Testable, t, sandboxDiv2, sandbox2;
        beforeAll(function () {
			sandboxDiv2 = document.createElement('div');
			document.body.appendChild(sandboxDiv2);
			sandbox2 = new sol.ElementRef(sandboxDiv2);
			
			Testable = sol.defCapsule({
				parent: {
					capsule: Element,
					args: ''
				},
				child0: {
					capsule: Element,
					args: 'zero'
				},
				child1: {
					capsule: Element,
					args: 'one'
				},
				child2: {
					capsule: Element,
					args: 'two'
				},
				child3: {
					capsule: Element,
					args: 'three'
				},
				child4: {
					capsule: Element,
					args: 'four'
				},
				loops: 'myLoop',
				hooks: 'myHook',
				'this.myLoop' : 'parent.l',
				'+ getChildren_': function(parent){
					return capsula.Capsule.prototype.getChildren.apply(parent, Array.prototype.slice.call(arguments, 1));
				},
				'+ add_': function(parent){
					return capsula.Capsule.prototype.add.apply(parent, Array.prototype.slice.call(arguments, 1));
				},
				'+ addAt_': function(parent){
					return capsula.Capsule.prototype.addAt.apply(parent, Array.prototype.slice.call(arguments, 1));
				},
				'+ isParentOf_': function(parent){
					return capsula.Capsule.prototype.isParentOf.apply(parent, Array.prototype.slice.call(arguments, 1));
				},
				'+ clear_': function(parent){
					return capsula.Capsule.prototype.clear.apply(parent, Array.prototype.slice.call(arguments, 1));
				},
				'+ remove_': function(parent){
					return capsula.Capsule.prototype.remove.apply(parent, Array.prototype.slice.call(arguments, 1));
				},
				'+ set_': function(parent){
					return capsula.Capsule.prototype.set.apply(parent, Array.prototype.slice.call(arguments, 1));
				},
				'+ getParent_': function(child){
					return capsula.Capsule.prototype.getParent.apply(child);
				},
				'+ setParent_': function(child, parent){
					return capsula.Capsule.prototype.setParent.call(child, parent);
				}
			});
        });
		
		beforeEach(function () {
			sandbox2.hook.clear();
			
			t = new Testable();
			sandbox2.hook.add(t.myLoop);
			var hookedElement = new Element('hooked');
			t.myHook.add(hookedElement.l);
			
		});
		
		describe('getChildren()', function () {
			it('should verify it works when parent is part (hook)', function () {
				t.add_(t.parent, t.child0, t.child1, t.child2, t.child3, t.child4);
				
				expect(
					t.getChildren_(t.parent).length).toEqual(5);
				expect(
					t.getChildren_(t.parent)[0] === t.child0).toBeTruthy();
				expect(
					t.getChildren_(t.parent)[1] === t.child1).toBeTruthy();
				expect(
					t.getChildren_(t.parent)[2] === t.child2).toBeTruthy();
				expect(
					t.getChildren_(t.parent)[3] === t.child3).toBeTruthy();
				expect(
					t.getChildren_(t.parent)[4] === t.child4).toBeTruthy();
					
				t.add_(t.parent, t);
				expect(
					t.getChildren_(t.parent).length).toEqual(6);
				expect(
					t.getChildren_(t.parent)[5] === t).toBeTruthy();
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.add_(t, t.child0, t.child1, t.child2, t.child3, t.child4);

				expect(
					t.getChildren_(t).indexOf(t.child0) !== -1).toBeTruthy();
				expect(
					t.getChildren_(t).indexOf(t.child1) !== -1).toBeTruthy();
				expect(
					t.getChildren_(t).indexOf(t.child2) !== -1).toBeTruthy();
				expect(
					t.getChildren_(t).indexOf(t.child3) !== -1).toBeTruthy();
				expect(
					t.getChildren_(t).indexOf(t.child4) !== -1).toBeTruthy();
					
				/*t.add_(t, t);
				expect(
					t.getChildren_(t)[5] === t).toBeTruthy();*/
			});
		});
		
		describe('add(var_args)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.add_(t.parent, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(t.parent, undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(t.parent, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(t.parent, function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(t.parent, 1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(t.parent, t.child0.l); // loop
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.add_(t.parent, t.child0.h); // hook
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works when parent is part (hook)', function () {
				t.add_(t.parent, );
				t.add_(t.parent, []);
				t.add_(t.parent, t.child0);
				t.add_(t.parent, t.child1, t.child2);
				t.add_(t.parent, [t.child3, t.child4]);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div></div>');
					
				t.add_(t.parent, t);
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div><div>hooked</div></div>');
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.add_(t, );
				t.add_(t, []);
				t.add_(t, t.child0);
				t.add_(t, t.child1, t.child2);
				t.add_(t, [t.child3, t.child4]);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div>');
					
				/*t.add_(t, t);
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div><div>hooked</div>');*/
			});
		});
		
		describe('addAt(at, var_args)', function () {
			it('should throw error when at is out of bounds or not even a number', function () {

                expect(function () {
                    t.addAt_(t.parent, 1, t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    t.addAt_(t.parent, -1, t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    t.addAt_(t.parent, t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_(t.parent, null, t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_(t.parent, undefined, t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_(t.parent, 'not a number', t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_(t.parent, {}, t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    t.addAt_(t.parent, function () {}, t.child0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });
			
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.addAt_(t.parent, 0, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(t.parent, 0, undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(t.parent, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(t.parent, function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(t.parent, 0, 1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(t.parent, 0, t.child0.l); // loop
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.addAt_(t.parent, 0, t.child0.h); // hook
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works when parent is part (hook)', function () {
				t.addAt_(t.parent, 0);
				t.addAt_(t.parent, 0, []);
				t.addAt_(t.parent, 0, t.child0);
				t.addAt_(t.parent, 0, t.child1, t.child2);
				t.addAt_(t.parent, 1, [t.child3, t.child4]);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>one</div><div>three</div><div>four</div><div>two</div><div>zero</div></div>');
					
				t.addAt_(t.parent, 0, t);
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>hooked</div><div>one</div><div>three</div><div>four</div><div>two</div><div>zero</div></div>');
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.addAt_(t, 0);
				t.addAt_(t, 0, []);
				t.addAt_(t, 0, t.child0);
				t.addAt_(t, 0, t.child1, t.child2);
				t.addAt_(t, 1, [t.child3, t.child4]);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div>one</div><div>three</div><div>four</div><div>two</div><div>zero</div><div></div>');
					
				/*t.addAt_(t, 0, t);
				expect(
                    sandboxDiv2.innerHTML).toBe('<div>hooked</div><div>one</div><div>three</div><div>four</div><div>two</div><div>zero</div>');*/
			});
		});
		
		describe('isParentOf(var_args)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.isParentOf_(t.parent, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(t.parent, undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(t.parent, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(t.parent, function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(t.parent, 1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(t.parent, t.child0.l); // loop
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.isParentOf_(t.parent, t.child0.h); // hook
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works when parent is part (hook)', function () {
				t.add_(t.parent, t.child0, t.child1, t.child2, t.child3, t.child4, t);
				
				expect(
					t.isParentOf_(t.parent, )).toBeFalsy();
				expect(
					t.isParentOf_(t.parent, [])).toBeFalsy();
				
				expect(
					t.isParentOf_(t.parent, t.child0)).toBeTruthy();
				expect(
					t.isParentOf_(t.parent, t.child1)).toBeTruthy();
				expect(
					t.isParentOf_(t.parent, t.child2)).toBeTruthy();
				expect(
					t.isParentOf_(t.parent, t.child3)).toBeTruthy();
				expect(
					t.isParentOf_(t.parent, t.child4)).toBeTruthy();
				expect(
					t.isParentOf_(t.parent, t)).toBeTruthy();
					
				expect(
					t.isParentOf_(t.parent, t.child0, t.child1)).toBeTruthy();
				expect(
					t.isParentOf_(t.parent, [t.child2, t.child3])).toBeTruthy();
				expect(
					t.isParentOf_(t.parent, t.child0, t.child1, t.child2, t.child3, t.child4, t)).toBeTruthy();
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.add_(t, t.child0, t.child1, t.child2, t.child3, t.child4 /*, t*/);
				
				expect(
					t.isParentOf_(t, )).toBeFalsy();
				expect(
					t.isParentOf_(t, [])).toBeFalsy();
				
				expect(
					t.isParentOf_(t, t.child0)).toBeTruthy();
				expect(
					t.isParentOf_(t, t.child1)).toBeTruthy();
				expect(
					t.isParentOf_(t, t.child2)).toBeTruthy();
				expect(
					t.isParentOf_(t, t.child3)).toBeTruthy();
				expect(
					t.isParentOf_(t, t.child4)).toBeTruthy();
					
				/*expect(
					t.isParentOf_(t, t)).toBeTruthy();*/
					
				expect(
					t.isParentOf_(t, t.child0, t.child1)).toBeTruthy();
				expect(
					t.isParentOf_(t, [t.child2, t.child3])).toBeTruthy();
				expect(
					t.isParentOf_(t, t.child0, t.child1, t.child2, t.child3, t.child4/*, t*/)).toBeTruthy();
			});
		});
		
		describe('clear()', function () {
			it('should verify it works when parent is part (hook)', function () {
				t.add_(t.parent, t.child0, t.child1, t.child2, t.child3, t.child4, t);
				t.clear_(t.parent);
				
				expect(
					t.getChildren_(t.parent).length).toEqual(0);
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.add_(t, t.child0, t.child1, t.child2, t.child3, t.child4/*, t*/);
				t.clear_(t);
				
				expect(
					t.getChildren_(t).length).toEqual(0);
				
				t.add_(t, t.parent); // this must be here to recreate the tie cleared in this test.
			});
		});
		
		describe('remove(var_args)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.remove_(t.parent, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(t.parent, undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(t.parent, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(t.parent, function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(t.parent, 1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(t.parent, t.child0.l); // loop
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.remove_(t.parent, t.child0.h); // hook
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works when parent is part (hook)', function () {
				t.add_(t.parent, t.child0, t.child1, t.child2, t.child3, t.child4, t);
				
				t.remove_(t.parent);
				t.remove_(t.parent, []);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div><div>hooked</div></div>');
					
				t.remove_(t.parent, t.child0);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>one</div><div>two</div><div>three</div><div>four</div><div>hooked</div></div>');
				
				t.remove_(t.parent, t.child1, t.child2);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>three</div><div>four</div><div>hooked</div></div>');
				
				t.remove_(t.parent, [t.child3, t.child4, t]);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div>');
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.add_(t, t.child0, t.child1, t.child2, t.child3, t.child4/*, t*/);
				
				t.remove_(t);
				t.remove_(t, []);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div>');
					
				t.remove_(t, t.child0);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>one</div><div>two</div><div>three</div><div>four</div>');
				
				t.remove_(t, t.child1, t.child2);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>three</div><div>four</div>');
				
				t.remove_(t, [t.child3, t.child4/*, t*/]);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div>');
			});
		});
		
		describe('set(var_args)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.set_(t.parent, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(t.parent, undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(t.parent, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(t.parent, function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(t.parent, 1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(t.parent, t.child0.l); // loop
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.set_(t.parent, t.child0.h); // hook
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works when parent is part (hook)', function () {
				t.add_(t.parent, t.child0, t.child1, t.child2, t.child3, t.child4);
				
				t.set_(t.parent);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div>');
					
				t.set_(t.parent, [t.child3, t.child4]);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>three</div><div>four</div></div>');
				
				t.set_(t.parent, []);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div>');
				
				t.set_(t.parent, t.child0);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div></div>');
				
				t.set_(t.parent, t.child1, t.child2);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>one</div><div>two</div></div>');
					
				t.set_(t.parent, t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>hooked</div></div>');
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.add_(t, t.child0, t.child1, t.child2, t.child3, t.child4);
				
				t.set_(t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('');
					
				t.set_(t, [t.child3, t.child4]);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div>three</div><div>four</div>');
				
				t.set_(t, []);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('');
				
				t.set_(t, t.child0);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div>zero</div>');
				
				t.set_(t, t.child1, t.child2);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div>one</div><div>two</div>');
				
				t.set_(t, t.parent); // this is to recreate a tie removed in this test
				
				/*t.set_(t, t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>hooked</div></div>');*/
			});
		});
		
		describe('getParent()', function () {
			it('should verify it works when parent is part (hook)', function () {
				expect(
					t.getParent_(t.child0) == null).toBeTruthy();
				expect(
					t.getParent_(t.child1) == null).toBeTruthy();
				expect(
					t.getParent_(t.child2) == null).toBeTruthy();
				expect(
					t.getParent_(t.child3) == null).toBeTruthy();
				expect(
					t.getParent_(t.child4) == null).toBeTruthy();
				expect(
					t.getParent_(t) == null).toBeTruthy();
					
				t.add_(t.parent, t.child0, t.child1, t.child2, t.child3, t.child4, t);
				
				expect(
					t.getParent_(t.child0) === t.parent).toBeTruthy();
				expect(
					t.getParent_(t.child1) === t.parent).toBeTruthy();
				expect(
					t.getParent_(t.child2) === t.parent).toBeTruthy();
				expect(
					t.getParent_(t.child3) === t.parent).toBeTruthy();
				expect(
					t.getParent_(t.child4) === t.parent).toBeTruthy();
				expect(
					t.getParent_(t) === t.parent).toBeTruthy();
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				expect(
					t.getParent_(t.child0) == null).toBeTruthy();
				expect(
					t.getParent_(t.child1) == null).toBeTruthy();
				expect(
					t.getParent_(t.child2) == null).toBeTruthy();
				expect(
					t.getParent_(t.child3) == null).toBeTruthy();
				expect(
					t.getParent_(t.child4) == null).toBeTruthy();
				/*expect(
					t.getParent_(t) == null).toBeTruthy();*/
					
				t.add_(t, t.child0, t.child1, t.child2, t.child3, t.child4/*, t*/);
				
				expect(
					t.getParent_(t.child0) === t).toBeTruthy();
				expect(
					t.getParent_(t.child1) === t).toBeTruthy();
				expect(
					t.getParent_(t.child2) === t).toBeTruthy();
				expect(
					t.getParent_(t.child3) === t).toBeTruthy();
				expect(
					t.getParent_(t.child4) === t).toBeTruthy();
				/*expect(
					t.getParent_(t) === t.parent).toBeTruthy();*/
					
				t.remove_(t, t.child0, t.child1, t.child2, t.child3, t.child4/*, t*/); // this is to fix what was modified in this test
			});
		});
		
		describe('setParent(capsule)', function () {
			it('should throw error when not provided with the right types of arguments', function () {
				expect(function () {
                    t.setParent_(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.setParent_(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.setParent_({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.setParent_(function(){});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.setParent_(1);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.setParent_(t.child0.l); // loop
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
				
				expect(function () {
                    t.setParent_(t.child0.h); // hook
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
			});
			
			it('should verify it works when parent is part (hook)', function () {
				t.setParent_(t.child0, t.parent);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div></div>');
				
				t.setParent_(t.child1, t.parent);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div></div>');
					
				t.setParent_(t.child2, t.parent);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div><div>two</div></div>');
					
				t.setParent_(t.child3, t.parent);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div><div>two</div><div>three</div></div>');
					
				t.setParent_(t.child4, t.parent);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div></div>');
					
				t.setParent_(t.child4, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div><div>two</div><div>three</div></div>');
					
				t.setParent_(t.child3, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div><div>two</div></div>');
					
				t.setParent_(t.child2, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div><div>one</div></div>');
					
				t.setParent_(t.child1, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>zero</div></div>');
				
				t.setParent_(t.child0, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div>');
					
				t.setParent_(t, t.parent);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>hooked</div></div>');
					
				t.setParent_(t, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div>');
			});
			
			it('should verify it works when parent is owner (loop)', function () {
				t.setParent_(t.child0, t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div>');
				
				t.setParent_(t.child1, t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div>');
					
				t.setParent_(t.child2, t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div>');
					
				t.setParent_(t.child3, t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div><div>three</div>');
					
				t.setParent_(t.child4, t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div><div>three</div><div>four</div>');
					
				t.setParent_(t.child4, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div><div>three</div>');
					
				t.setParent_(t.child3, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div><div>two</div>');
					
				t.setParent_(t.child2, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div><div>one</div>');
					
				t.setParent_(t.child1, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div><div>zero</div>');
				
				t.setParent_(t.child0, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div>');
					
				/*t.setParent_(t, t);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div><div>hooked</div></div>');
					
				t.setParent_(t, null);
				
				expect(
                    sandboxDiv2.innerHTML).toBe('<div></div>');*/
			});
		});
		
		// TODO getDefault Parent/Child Hook/Loop
		
		
	});

	});
