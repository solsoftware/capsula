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
    sandboxDiv,
    sandbox;

    function errorToRegExp(error) {
        return new RegExp(error.desc.replace(/\$\d/g, ".+").replace('(', '\\(').replace(')', '\\)'));
    }

    beforeAll(function () {
        XCapsule_ = sol.defCapsule({
                '>doThis': function () {},
                '<onThat': function () {},
                hooks: 'hook',
                loops: 'loop',
            });

        sandboxDiv = document.getElementById('hooks-and-loops-sandbox');
        sandbox = new sol.ElementRef(sandboxDiv);
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
            sandbox.hook.unhookAll();

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
            sandbox.hook.unhookAll();

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
            sandbox.hook.unhookAll();

            var divRef = new sol.ElementRef(document.createElement('div'));

            expect(function () {
                divRef.hook.tie(divRef.loop);
            }).toThrowError();
            expect(function () {
                divRef.hook.hook(divRef.loop);
            }).toThrowError();
            expect(function () {
                divRef.hook.hookAt(0, divRef.loop);
            }).toThrowError();
            expect(function () {
                divRef.loop.setHook(divRef.hook);
            }).toThrowError();
            expect(function () {
                divRef.loop.setParent(divRef.hook);
            }).toThrowError();
            expect(function () {
                divRef.loop.tie(divRef.hook);
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

            c.h.untieAll();
            expect(checkOffHook).toBe('off hook called');

            c.setEventHandlers_();

            c.h.tie(el.loop);

            expect(checkOnHook).toBe('on hook called again');

            c.h.untieAll();
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

            c2.hook.unhook(innerDiv.loop);

            expect(
                innerDiv.getElement().outerHTML === '<div class=""></div>' ||
                innerDiv.getElement().outerHTML === '<div></div>').toBe(true);
        });
    });

    describe('Hook', function () {
        describe('getHooks()', function () {
            it('should verify a number of hooks', function () {
                var C = sol.defCapsule({
                        hooks: ['h1', 'h2'],
                        '> getResult_': function () {
                            return this.p1.hook.getHooks().length;
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

        describe('hook(var_args)', function () {
            it('should throw error when there are non-hook or non-loop parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.hook(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hook(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hook('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hook({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hook(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hook(c.loop, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hook(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify hooks and loops are added', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> hook_': function (var_args) {
                            this.p1.hook.hook.apply(this.p1.hook, arguments);
                        },
                        '> unhookAll_': function () {
                            this.p1.hook.unhookAll();
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

                c.h1.hook(e3.loop);
                c.h2.hook(e4.loop);
                sandbox.hook.hook(c.l);

                c.hook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.hook_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.hook_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.hook_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div><div id="3"></div></div>');

                c.unhookAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.hook_(c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div></div>');

                c.unhookAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.hook_([c.h1, c.h2, c.p2.loop, c.p3.loop]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');

                c.hook_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');

                c.hook_([]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');
            });
        });

        describe('hookAt(at, var_args)', function () {
            it('should throw error when at is out of bounds or not even a number', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.hookAt(1, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.hook.hookAt(-1, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.hook.hookAt(c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(null, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(undefined, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt('not a number', c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt({}, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(function () {}, c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should throw error when there are non-hook or non-loop parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.hookAt(0, undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(0, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(0, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(0, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(0, 4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(0, c.loop, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.hookAt(0, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify hooks and loops are added at the correct position', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> hookAt_': function (at, var_args) {
                            this.p1.hook.hookAt.apply(this.p1.hook, arguments);
                        },
                        '> unhookAll_': function () {
                            this.p1.hook.unhookAll();
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

                c.h1.hook(e3.loop);
                c.h2.hook(e4.loop);
                sandbox.hook.hook(c.l);

                c.hookAt_(0, c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.hookAt_(0, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="4"></div><div id="1"></div></div>');

                c.hookAt_(1, c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="4"></div><div id="2"></div><div id="1"></div></div>');

                c.hookAt_(3, c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="4"></div><div id="2"></div><div id="1"></div><div id="3"></div></div>');

                c.unhookAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.hookAt_(0, c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div></div>');

                c.unhookAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.hookAt_(0, c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.hookAt_(1, [c.h1, c.h2]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="3"></div><div id="4"></div></div>');

                c.unhookAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.hookAt_(0, [c.h1, c.h2, c.p2.loop, c.p3.loop]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');

                c.hookAt_(0);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');

                c.hookAt_(0, []);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="3"></div><div id="4"></div><div id="1"></div><div id="2"></div></div>');
            });
        });

        describe('unhookAll()', function () {
            it('should verify all ties are removed', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        '> unhookAll_': function () {
                            this.p1.hook.unhookAll();
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
                sandbox.hook.hook(c.l);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div></div>');

                c.unhookAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });

        describe('unhook(var_args)', function () {
            it('should throw error when there are non-hook or non-loop parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.unhook(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.unhook(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.unhook('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.unhook({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.unhook(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.unhook(c.loop, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.unhook(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('shouldn\'t throw error when trying to remove ties that don\'t really exist', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.unhook(c.loop);
                }).not.toThrowError();
            });

            it('should verify ties to hooks and loops are removed', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> hook_': function (var_args) {
                            this.p1.hook.hook.apply(this.p1.hook, arguments);
                        },
                        '> unhook_': function (var_args) {
                            this.p1.hook.unhook.apply(this.p1.hook, arguments);
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

                c.h1.hook(e3.loop);
                c.h2.hook(e4.loop);
                sandbox.hook.hook(c.l);

                c.hook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.unhook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.hook_(c.p2.loop, c.p3.loop, c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');

                c.unhook_(c.p3.loop, c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.unhook_([c.p2.loop, c.h2]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.hook_(c.p2.loop, c.p3.loop, c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');

                c.unhook_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');

                c.unhook_([]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');
            });
        });

        describe('rehook(var_args)', function () {
            it('should throw error when there are non-hook or non-loop parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.hook.rehook(undefined);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.rehook(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.rehook('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.rehook({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.rehook(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.rehook(c.loop, 'neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.rehook(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify ties to hooks and loops are re-set', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> rehook_': function (var_args) {
                            this.p1.hook.rehook.apply(this.p1.hook, arguments);
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

                c.h1.hook(e3.loop);
                c.h2.hook(e4.loop);
                sandbox.hook.hook(c.l);

                c.rehook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.rehook_(c.p2.loop, c.p3.loop, c.h1, c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div></div>');

                c.rehook_(c.p3.loop, c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="2"></div><div id="3"></div></div>');

                c.rehook_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.rehook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.rehook_([]);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });

        describe('getHook()', function () {
            it('should verify parent hook is returned when used on child hook or exception thrown when used on parent hook', function () {
                var C = sol.defCapsule({
                        hooks: 'h',
                        '> getResult1_': function () {
                            var res = this.h.getHook() == null;
                            this.h.setHook(this.p.hook);
                            res = res && this.h.getHook() === this.p.hook;
                            return res;
                        },
                        '> getResult2_': function () {
                            this.p.hook.getHook();
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

        describe('setHook(hook)', function () {
            it('should throw error when there is a non-hook parameter', function () {
                var c = new XCapsule_();
                var h = new sol.Hook('h');
                expect(function () {
                    h.setHook('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.setHook({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.setHook(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.setHook(c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.setHook(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify hooks are tied', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> setHook_': function (hook) {
                            hook.setHook(this.p1.hook);
                        },
                        '> setNullToHook_': function (hook) {
                            hook.setHook(null);
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

                c.h1.hook(e3.loop);
                c.h2.hook(e4.loop);
                sandbox.hook.hook(c.l);

                c.setHook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.setHook_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.setHook_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.setHook_(c.h1);

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

            it('should verify a tie is created (or set to null)', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> setHook_': function (hook) {
                            hook.tie(this.p1.hook);
                        },
                        '> setNullToHook_': function (hook) {
                            hook.tie(null);
                        },
                        '> hook_': function (to) {
                            this.p1.hook.tie(to);
                        },
                        '> unhookAll_': function () {
                            this.p1.hook.unhookAll();
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

                c.h1.hook(e3.loop);
                c.h2.hook(e4.loop);
                sandbox.hook.hook(c.l);

                c.setHook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.setHook_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.setHook_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.setHook_(c.h1);

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

                c.hook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.hook_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.hook_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.hook_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div><div id="3"></div></div>');

                c.unhookAll_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });

        describe('tieAt(at, var_args)', function () {
            // TODO
        });

        describe('isTiedTo(var_args)', function () {
            it('should throw error when there are non-loop or non-hook parameters', function () {
                var h = new sol.Loop('h4'),
                c = new XCapsule_();
                expect(function () {
                    h.isTiedTo('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.isTiedTo({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.isTiedTo(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    h.isTiedTo(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    c.hook.isTiedTo('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.isTiedTo({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.isTiedTo(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.hook.isTiedTo(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify correct information is returned', function () {
                var C = sol.defCapsule({
                        hooks: 'h',
                        '> getResult_': function () {
                            var res = this.h.isTiedTo(this.p.hook) === false;
                            res = res && this.p.hook.isTiedTo(this.h) === false;
                            this.h.tie(this.p.hook);
                            res = res && this.h.isTiedTo(this.p.hook) === true;
                            res = res && this.p.hook.isTiedTo(this.h) === true;
                            return res;
                        },
                        p: XCapsule_,
                    });

                var c = new C();

                expect(
                    c.getResult_()).toBeTruthy();
            });
        });

        describe('untieAll()', function () {
            it('should verify hooks are untied', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        hooks: ['h1', 'h2'],
                        '> untieParent_': function () {
                            this.p1.hook.untieAll();
                        },
                        '> setHook_': function (hook) {
                            hook.tie(this.p1.hook);
                        },
                        '> untieChild_': function (hook) {
                            hook.untieAll();
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

                c.h1.hook(e3.loop);
                c.h2.hook(e4.loop);
                sandbox.hook.hook(c.l);

                c.setHook_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.setHook_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div></div>');

                c.setHook_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div></div>');

                c.setHook_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div><div id="3"></div></div>');

                c.untieChild_(c.h2);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div><div id="3"></div></div>');

                c.untieChild_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="2"></div></div>');

                c.untieChild_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="2"></div></div>');

                c.untieChild_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');

                c.setHook_(c.p2.loop);
                c.setHook_(c.h2);
                c.setHook_(c.p3.loop);
                c.setHook_(c.h1);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div><div id="4"></div><div id="2"></div><div id="3"></div></div>');

                c.untieParent_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });
    });

    describe('Loop', function () {
        describe('getHook()', function () {
            it('should verify parent hook or null is returned', function () {
                var C = sol.defCapsule({
                        loops: 'l',
                        '> getResult_': function () {
                            var res = this.p1.loop.getHook() == null;
                            res = res && this.p2.loop.getHook() == null;
                            this.l.tie(this.p2.loop);
                            res = res && this.p2.loop.getHook() == null;
                            this.p2.hook.tie(this.p1.loop);
                            res = res && this.p1.loop.getHook() === this.p2.hook;
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

        describe('setHook(hook)', function () {
            it('should throw error when there is a non-hook parameter', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.loop.setHook('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setHook({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setHook(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setHook(c.loop);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setHook(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify a tie is created', function () {
                sandbox.hook.unhookAll();

                var div1 = document.createElement('div'),
                div2 = document.createElement('div'),
                div3 = document.createElement('div'),
                e1 = new sol.ElementRef(div1),
                e2 = new sol.ElementRef(div2),
                e3 = new sol.ElementRef(div3);
                div1.setAttribute('id', '1');
                div2.setAttribute('id', '2');
                div3.setAttribute('id', '3');

                e1.loop.setHook(sandbox.hook);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');

                e2.loop.setHook(sandbox.hook);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div><div id="2"></div>');

                e3.loop.setHook(sandbox.hook);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div><div id="2"></div><div id="3"></div>');

                e2.loop.setHook(null);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div><div id="3"></div>');

                e3.loop.setHook(null);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');

                e1.loop.setHook(null);

                expect(
                    sandboxDiv.innerHTML).toBe('');
            });
        });

        describe('getPublicLoop()', function () {
            it('should verify public loop or null is returned', function () {
                var C = sol.defCapsule({
                        loops: 'l',
                        '> getResult_': function () {
                            var res = this.p1.loop.getPublicLoop() == null;
                            res = res && this.p2.loop.getPublicLoop() == null;
                            this.p2.hook.tie(this.p1.loop);
                            res = this.p1.loop.getPublicLoop() == null;
                            this.l.tie(this.p2.loop);
                            res = res && this.p2.loop.getPublicLoop() == this.l;
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

        describe('setPublicLoop(loop)', function () {
            it('should throw error when there is a non-loop parameter', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.loop.setPublicLoop('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setPublicLoop({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setPublicLoop(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setPublicLoop(c.hook);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setPublicLoop(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify a tie is created', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        '> setPublicLoop_': function (privateLoop) {
                            privateLoop.setPublicLoop(this.l);
                        },
                        '> setNullToLoop_': function (privateLoop) {
                            privateLoop.setPublicLoop(null);
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '3');
                                return div;
                            }
                        },
                    });

                var c = new C();
                sandbox.hook.tie(c.l);

                expect(
                    sandboxDiv.innerHTML).toBe('');

                c.setPublicLoop_(c.p1.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');

                c.setPublicLoop_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="2"></div>');

                c.setPublicLoop_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="3"></div>');

                c.setNullToLoop_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('');
            });
        });

        describe('getPrivateLoop()', function () {
            it('should verify private loop or null is returned', function () {
                var C = sol.defCapsule({
                        loops: 'l',
                        '> getResult_': function () {
                            var res = this.l.getPrivateLoop() == null;
                            this.p1.loop.tie(this.l);
                            res = res && this.l.getPrivateLoop() === this.p1.loop;
                            return res;
                        },
                        p1: XCapsule_,
                    });

                var c = new C();

                expect(
                    c.getResult_()).toBeTruthy();
            });
        });

        describe('setPrivateLoop(loop)', function () {
            it('should throw error when there is a non-loop parameter', function () {
                var l3 = new sol.Loop('l3'),
                c = new XCapsule_();
                expect(function () {
                    l3.setPrivateLoop('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l3.setPrivateLoop({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l3.setPrivateLoop(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l3.setPrivateLoop(c.hook);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l3.setPrivateLoop(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify a tie is created', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        '> setPrivateLoop_': function (privateLoop) {
                            this.l.setPrivateLoop(privateLoop);
                        },
                        '> setNullToLoop_': function () {
                            this.l.setPrivateLoop(null);
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '3');
                                return div;
                            }
                        },
                    });

                var c = new C();
                sandbox.hook.tie(c.l);

                expect(
                    sandboxDiv.innerHTML).toBe('');

                c.setPrivateLoop_(c.p1.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');

                c.setPrivateLoop_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="2"></div>');

                c.setPrivateLoop_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="3"></div>');

                c.setNullToLoop_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('');
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
                sandbox.hook.unhookAll();

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

                c.l.setParent(sandbox.hook);

                expect(
                    sandboxDiv.innerHTML).toBe('');

                c.setParent_(c.p1.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');

                c.setNullParent_(c.p1.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('');

                c.setParent_(c.p1.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');

                c.l.setParent(null);

                expect(
                    sandboxDiv.innerHTML).toBe('');

                c.l.setParent(sandbox.hook);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');
            });
        });

        describe('getLoop()', function () {
            it('should verify tied loop or null is returned', function () {
                var C = sol.defCapsule({
                        loops: 'l',
                        '> getResult_': function () {
                            var res = this.p1.loop.getLoop() == null;
                            res = res && this.p2.loop.getLoop() == null;
                            res = res && this.l.getLoop() == null;
                            this.l.tie(this.p2.loop);
                            res = res && this.p2.loop.getLoop() === this.l;
                            res = res && this.l.getLoop() === this.p2.loop;
                            this.p2.hook.tie(this.p1.loop);
                            res = res && this.p1.loop.getLoop() == null;
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

        describe('setLoop(loop)', function () {
            it('should throw error when there is a non-loop parameter', function () {
                var l = new sol.Loop('l5'),
                c = new XCapsule_();
                expect(function () {
                    l.setLoop('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.setLoop({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.setLoop(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.setLoop(c.hook);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.setLoop(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    c.loop.setLoop('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setLoop({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setLoop(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setLoop(c.hook);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.setLoop(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify a tie is created', function () {
                sandbox.hook.unhookAll();

                var C = sol.defCapsule({
                        loops: 'l',
                        '> setLoop1_': function (loop) {
                            this.l.setLoop(loop);
                        },
                        '> setLoop2_': function (loop) {
                            loop.setLoop(this.l);
                        },
                        p1: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '1');
                                return div;
                            }
                        },
                        p2: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '2');
                                return div;
                            }
                        },
                        p3: {
                            capsule: sol.ElementRef,
                            deferredArgs: function () {
                                var div = document.createElement('div');
                                div.setAttribute('id', '3');
                                return div;
                            }
                        },
                    });

                var c = new C();
                sandbox.hook.tie(c.l);

                expect(
                    sandboxDiv.innerHTML).toBe('');

                c.setLoop1_(c.p1.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');

                c.setLoop1_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="2"></div>');

                c.setLoop1_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="3"></div>');

                c.setLoop1_(null);

                expect(
                    sandboxDiv.innerHTML).toBe('');

                c.setLoop2_(c.p1.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="1"></div>');

                c.setLoop2_(c.p2.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="2"></div>');

                c.setLoop2_(c.p3.loop);

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="3"></div>');
            });
        });

        describe('getTies()', function () {
            it('should verify tied loop or null is returned', function () {
                var C = sol.defCapsule({
                        loops: 'l',
                        '> getResult_': function () {
                            var res = this.p1.loop.getTies().length === 0;
                            res = res && this.p2.loop.getTies().length === 0;
                            res = res && this.l.getTies().length === 0;
                            this.l.tie(this.p2.loop);
                            res = res && this.p2.loop.getTies()[0] === this.l;
                            res = res && this.l.getTies()[0] === this.p2.loop;
                            this.p2.hook.tie(this.p1.loop);
                            res = res && this.p1.loop.getTies()[0] === this.p2.hook;
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

        describe('isTiedTo(var_args)', function () {
            it('should throw error when there are non-loop or non-hook parameters', function () {
                var l = new sol.Loop('l6'),
                c = new XCapsule_();
                expect(function () {
                    l.isTiedTo('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.isTiedTo({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.isTiedTo(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.isTiedTo(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    c.loop.isTiedTo('neither a hook nor a loop');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.isTiedTo({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.isTiedTo(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.loop.isTiedTo(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify correct information is returned', function () {
                var C = sol.defCapsule({
                        loops: 'l',
                        '> getResult_': function () {
                            var res = this.l.isTiedTo(this.p.loop) === false;
                            res = res && this.p.loop.isTiedTo(this.l) === false;
                            this.l.tie(this.p.loop);
                            res = res && this.l.isTiedTo(this.p.loop) === true;
                            res = res && this.p.loop.isTiedTo(this.l) === true;
                            res = res && this.p2.loop.isTiedTo(this.p2.hook) === false;
                            this.p2.hook.tie(this.p2.loop);
                            res = res && this.p2.loop.isTiedTo(this.p2.hook) === true;
                            return res;
                        },
                        p: XCapsule_,
                        p2: XCapsule_,
                    });

                var c = new C();

                expect(
                    c.getResult_()).toBeTruthy();
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
                    l.tie(c.hook);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    l.tie(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    c.loop.tie('neither a hook nor a loop');
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

            it('should verify a tie is created (or set to null)', function () {
                sandbox.hook.unhookAll();

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
                        '> tieNullP2P1_': function () {
                            this.p2.loop.tie(null);
                        },
                        '> tieNullP3L2_': function () {
                            this.p3.loop.tie(null);
                        },
                        '> tieNullL2P3_': function () {
                            this.l2.tie(null);
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
                sandbox.hook.hook(c.l1, c.l2);

                c.tieP2P1_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.tieP3L2_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div><div id="2"></div>');

                c.tieNullP3L2_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.tieL2P3_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div><div id="2"></div>');

                c.tieNullP2P1_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div><div id="2"></div>');

                c.tieNullL2P3_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });

        describe('untieAll()', function () {
            it('should verify a tie is removed', function () {
                sandbox.hook.unhookAll();

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
                        '> untieP2P1_': function () {
                            this.p2.loop.untieAll();
                        },
                        '> untieP3L2_': function () {
                            this.p3.loop.untieAll();
                        },
                        '> untieL2P3_': function () {
                            this.l2.untieAll();
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
                sandbox.hook.hook(c.l1, c.l2);

                c.tieP2P1_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.tieP3L2_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div><div id="2"></div>');

                c.untieP3L2_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div>');

                c.tieL2P3_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"><div id="1"></div></div><div id="2"></div>');

                c.untieP2P1_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div><div id="2"></div>');

                c.untieL2P3_();

                expect(
                    sandboxDiv.innerHTML).toBe('<div id="0"></div>');
            });
        });
    });
});
