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

describe('capsule methods', function () {
    var sol = window.capsula,
    XCapsule_;

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
    });

    describe('getId()', function () {
        it('should verify getId returns a number', function () {
            expect(
                (new(sol.defCapsule({}))).getId()).toBeNumber();
        });

        it('should verify getId returns different numbers for different capsules', function () {
            expect(
                (new(sol.defCapsule({}))).getId()
                 !=
                (new(sol.defCapsule({}))).getId()).toBeTruthy();
        });

        it('should verify getId returns the same number every time for the same capsule', function () {
            var c = new(sol.defCapsule({}));
            expect(c.getId() === c.getId()).toBeTruthy();
        });
    });

    describe('setName(name)', function () {
        it('should throw error if name is not a string', function () {
            expect(function () {
                var x1 = new XCapsule_();
                x1.setName();
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                var x1 = new XCapsule_();
                x1.setName({});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                var x1 = new XCapsule_();
                x1.setName(23);
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                var x1 = new XCapsule_();
                x1.setName(function () {});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify a name could be set (and returned)', function () {
            var x1 = new XCapsule_();
            expect(function () {
                x1.setName('I am X');
            }).not.toThrowError();
            expect(
                x1.getName() == 'I am X').toBeTruthy();
        });
    });

    describe('getOperations()', function () {
        it('should verify a number of operations', function () {
            expect(
                (new XCapsule_()).getOperations().length).toBe(2);

            expect(
                (new(sol.defCapsule({
                            base: XCapsule_,
                            '> doX': function () {},
                            '< onA': function () {},
                            '< onB': function () {}
                        }))).getOperations().length).toBe(5); // 3 + 2 derived
        });
    });

    describe('getInputs()', function () {
        it('should verify a number of input operations', function () {
            expect(
                (new XCapsule_()).getInputs().length).toBe(1);

            expect(
                (new(sol.defCapsule({
                            base: XCapsule_,
                            '> doX': function () {},
                            '< onA': function () {},
                            '< onB': function () {}
                        }))).getInputs().length).toBe(2); // 1 + 1 derived
        });
    });

    describe('getOutputs()', function () {
        it('should verify a number of output operations', function () {
            expect(
                (new XCapsule_()).getOutputs().length).toBe(1);

            expect(
                (new(sol.defCapsule({
                            base: XCapsule_,
                            '> doX': function () {},
                            '< onA': function () {},
                            '< onB': function () {}
                        }))).getOutputs().length).toBe(3); // 2 + 1 derived
        });
    });

    describe('getOperation(name)', function () {
        it('should verify type of returned operation', function () {
            expect(
                sol.isOperation((new XCapsule_()).getOperation('doThis')) &&
                sol.isOperation((new XCapsule_()).getOperation('onThat'))).toBeTruthy();

            var YCapsule = sol.defCapsule({
                    base: XCapsule_,
                    '> doX': function () {},
                    '< onA': function () {},
                    '< onB': function () {}
                }),
            yCapsule = new YCapsule();
            expect(
                sol.isOperation(yCapsule.getOperation('doThis')) &&
                sol.isOperation(yCapsule.getOperation('onThat')) &&
                sol.isOperation(yCapsule.getOperation('doX')) &&
                sol.isOperation(yCapsule.getOperation('onA')) &&
                sol.isOperation(yCapsule.getOperation('onB'))).toBeTruthy();
        });
    });

    describe('getInput(name)', function () {
        it('should verify type of returned input operation', function () {
            expect(
                sol.isOperation((new XCapsule_()).getInput('doThis'))).toBeTruthy();

            var YCapsule = sol.defCapsule({
                    base: XCapsule_,
                    '> doX': function () {},
                    '< onA': function () {},
                    '< onB': function () {}
                }),
            yCapsule = new YCapsule();
            expect(
                sol.isOperation(yCapsule.getInput('doThis')) &&
                sol.isOperation(yCapsule.getInput('doX'))).toBeTruthy();
        });
		
		it('should verify unnamed input in this is returned by the getInput', function () {
			var C = sol.defCapsule({
				init: function(){
					this.myInput = new sol.Input();
				}
			});
			
			var c = new C();
			
			 expect(
                sol.isOperation(c.getInput('myInput'))).toBeTruthy();
		});
    });

    describe('getOutput(name)', function () {
        it('should verify type of returned output operation', function () {
            expect(
                sol.isOperation((new XCapsule_()).getOutput('onThat'))).toBeTruthy();

            var YCapsule = sol.defCapsule({
                    base: XCapsule_,
                    '> doX': function () {},
                    '< onA': function () {},
                    '< onB': function () {}
                }),
            yCapsule = new YCapsule();
            expect(
                sol.isOperation(yCapsule.getOutput('onThat')) &&
                sol.isOperation(yCapsule.getOutput('onA')) &&
                sol.isOperation(yCapsule.getOutput('onB'))).toBeTruthy();
        });
		
		it('should verify unnamed output in this is returned by the getOutput', function () {
			var C = sol.defCapsule({
				init: function(){
					this.myOutput = new sol.Output();
				}
			});
			
			var c = new C();
			
			expect(
                sol.isOperation(c.getOutput('myOutput'))).toBeTruthy();
		});
    });

    describe('getHooks()', function () {
        it('should verify a number of hooks', function () {
            expect(
                (new XCapsule_()).getHooks().length).toBe(1);

            expect(
                (new(sol.defCapsule({
                            base: XCapsule_,
                            hooks: ['h1', 'h2', 'h3']
                        }))).getHooks().length).toBe(4); // 3 + 1 derived
        });
    });

    describe('getLoops()', function () {
        it('should verify a number of loops', function () {
            expect(
                (new XCapsule_()).getLoops().length).toBe(1);

            expect(
                (new(sol.defCapsule({
                            base: XCapsule_,
                            loops: ['l1', 'l2']
                        }))).getLoops().length).toBe(3); // 2 + 1 derived
        });
    });

    describe('getHook(name)', function () {
        it('should verify type of returned hook', function () {
            expect(
                sol.isHook((new XCapsule_()).getHook('hook'))).toBeTruthy();

            var YCapsule = sol.defCapsule({
                    base: XCapsule_,
                    hooks: ['h1', 'h2']
                }),
            yCapsule = new YCapsule();
            expect(
                sol.isHook(yCapsule.getHook('hook')) &&
                sol.isHook(yCapsule.getHook('h1')) &&
                sol.isHook(yCapsule.getHook('h2'))).toBeTruthy();
        });
		
		it('should verify unnamed hook in this is returned by the getHook', function () {
			var C = sol.defCapsule({
				init: function(){
					this.myHook = new sol.Hook();
				}
			});
			
			var c = new C();
			
			 expect(
                sol.isHook(c.getHook('myHook'))).toBeTruthy();
		});
    });

    describe('getLoop(name)', function () {
        it('should verify type of returned loop', function () {
            expect(
                sol.isLoop((new XCapsule_()).getLoop('loop'))).toBeTruthy();

            var YCapsule = sol.defCapsule({
                    base: XCapsule_,
                    loops: ['l1', 'l2', 'l3']
                }),
            yCapsule = new YCapsule();
            expect(
                sol.isLoop(yCapsule.getLoop('loop')) &&
                sol.isLoop(yCapsule.getLoop('l1')) &&
                sol.isLoop(yCapsule.getLoop('l2')) &&
                sol.isLoop(yCapsule.getLoop('l3'))).toBeTruthy();
        });
		
		it('should verify unnamed loop in this is returned by the getLoop', function () {
			var C = sol.defCapsule({
				init: function(){
					this.myLoop = new sol.Loop();
				}
			});
			
			var c = new C();
			
			 expect(
                sol.isLoop(c.getLoop('myLoop'))).toBeTruthy();
		});
    });

    describe('unwire(var_args)', function () {
        it('should throw error when parameter is not a capsule (instance)', function () {
            expect(function () {
                var x = new XCapsule_();
                x.unwire(2);
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                var x = new XCapsule_();
                x.unwire(function () {});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                var x = new XCapsule_();
                x.unwire({});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                var x = new XCapsule_();
                x.unwire('not a capsule');
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify it doesn\'t complain when called on two not wired capsules', function () {
            expect(function () {
                var x = new XCapsule_(),
                y = new XCapsule_();
                x.unwire(y);
            }).not.toThrowError();
        });

        it('should verify it works on two sibling capsules (i.e. unwires all wires)', function () {
            var x = new XCapsule_(),
            y = new XCapsule_();
            x.onThat.wire(y.doThis);
            y.onThat.wire(x.doThis);
            x.unwire(y);
            expect(
                x.onThat.isWiredTo(y.doThis) ||
                y.onThat.isWiredTo(x.doThis)).toBeFalsy();
        });

        it('should verify it works on parent and child capsules (i.e. unwires all wires)', function () {
            var C = sol.defCapsule({
                    '> doAction': function () {},
                    '> getResult1_': function () {
                        this.unwire(this.part);
                        return this.doAction.isWiredTo(this.part.doThis) || this.part.onThat.isWiredTo(this.onEvent);
                    },
                    '> getResult2_': function () {
                        this.part.unwire(this);
                        return this.doAction.isWiredTo(this.part.doThis) || this.part.onThat.isWiredTo(this.onEvent);
                    },
                    '< onEvent': function () {},
                    part: {
                        capsule: XCapsule_
                    },
                    wires: [
                        ['this.doAction', 'part.doThis'],
                        ['part.onThat', 'this.onEvent'],
                    ]
                });
            var c1 = new C();
            expect(
                c1.getResult1_()).toBeFalsy();
            var c2 = new C();
            expect(
                c2.getResult2_()).toBeFalsy();
        });
    });

    describe('attach()', function () {
        it('should throw error if already attached to a capsule other than the context capsule', function () {
            var C = sol.defCapsule({
                    p: XCapsule_
                });
            var c = new C();
            expect(function () {
                c.p.attach()
            }).toThrowError(errorToRegExp(sol.Errors.CAPSULE_ALREADY_ATTACHED));
        });

        it('should return false if already attached to the context capsule', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        return this.p.attach();
                    },
                    p: XCapsule_
                });
            var c = new C();
            expect(
                c.getResult_()).toBeFalsy();
        });

        it('should return true if not already attached', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        this.p.detach();
                        return this.p.attach();
                    },
                    p: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(
                c.getResult_()).toBeTruthy();
        });

        it('should corectly return the number of parts', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        this.p.detach();
                        this.p.attach();
                        return this.getParts().length;
                    },
                    p: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(
                c.getResult_()).toBe(1);
        });

        it('should not complain when working with detached and then re-attached capsule', function () {
            var C = sol.defCapsule({
                    '> doP': function () {},
                    '> getResult_': function () {
                        this.p.detach();
                        this.p.attach();
                        this.p.onThat.wire(this.onQ);
                        this.doP.wire(this.p.doThis);
                        this.myHook.tie(this.p.hook);
                        this.myLoop.tie(this.p.loop);
                    },
                    '< onQ': function () {},
                    hooks: 'myHook',
                    loops: 'myLoop',
                    p: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(function () {
                c.getResult_()
            }).not.toThrowError();
        });
    });

    describe('detach()', function () {
        it('should throw error when working with detached capsule', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        this.p.detach();
                        this.p.getName();
                    },
                    p: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(function () {
                c.getResult_()
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));
        });

        it('should corectly return the number of parts (0)', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        this.p.detach();
                        return this.getParts().length;
                    },
                    p: XCapsule_
                });
            var c = new C();
            expect(
                c.getResult_()).toBe(0);
        });

        it('should verify that after detach all wires and ties are destroyed', function () {
            var C = sol.defCapsule({
                    '> doP': function () {},
                    '> getResult_': function () {
                        this.p.onThat.wire(this.onQ);
                        this.doP.wire(this.p.doThis);
                        this.myHook.tie(this.p.hook);
                        this.myLoop.tie(this.p.loop);

                        this.p.detach();

                        return this.onQ.getWires().indexOf(this.p.onThat) !== -1 ||
                        this.doP.getWires().indexOf(this.p.doThis) !== -1 ||
                        this.myHook.getParent() === this.p.hook ||
                        this.myLoop.getChildren()[0] === this.p.loop;
                    },
                    '< onQ': function () {},
                    hooks: 'myHook',
                    loops: 'myLoop',
                    p: XCapsule_
                });
            var c = new C();
            expect(
                c.getResult_()).toBeFalsy();
        });
    });

    describe('onAttach() + onDetach()', function () {
        var created = 0,
        detached = 0,
        attached = 0;

        var C = sol.defCapsule({
                init: function (level) {
                    created++;
                    if (level > 0) {
                        this.p1 = new C(level - 1);
                        this.p2 = new C(level - 1);
                    }
                },
                '> detachLeft': function () {
                    this.p1.detach();
                },
                '> detachRight': function () {
                    this.p2.detach();
                },
                '> attachLeft': function () {
                    this.p1.attach();
                },
                '> attachRight': function () {
                    this.p2.attach();
                },
                onAttach: function () {
                    attached++;
                },
                onDetach: function () {
                    detached++;
                }
            });

        it('should verify onDetach is called on every capsule inside the detached capsule', function () {
            var c = new C(10);
            expect(
                created).toEqual(2047);

            expect(
                attached).toEqual(2047);

            c.detachLeft();
            expect(
                detached).toEqual((2047 - 1) / 2);

            c.detachRight();
            expect(
                detached).toEqual(2047 - 1);

            attached = 0;

            c.attachLeft();
            expect(
                attached).toEqual(1023);

            c.attachRight();
            expect(
                attached).toEqual(2046);
        });
    });

    describe('isAttached()', function () {
        it('should verify that part is attached to its parent', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        return this.p.isAttached();
                    },
                    p: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(
                c.getResult_()).toBeTruthy();
        });

        it('should verify that detached part is not attached', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        this.p.detach();
                        return this.p.isAttached();
                    },
                    p: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(
                c.getResult_()).toBeFalsy();
        });
    });

    describe('getParts()', function () {
        it('should verify a number of parts', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        return this.getParts().length;
                    },
                    p: {
                        capsule: XCapsule_
                    }
                });

            expect(
                (new C()).getResult_()).toBe(1);

            expect(
                (new(sol.defCapsule({
                            base: C,
                            myPart: {
                                capsule: XCapsule_
                            }
                        }))).getResult_()).toBe(2); // 1 + 1 derived
        });
    });

    describe('getPart(name)', function () {
        it('should verify type of returned part', function () {
            var C = sol.defCapsule({
                    '> getResult_': function (name) {
                        return this.getPart(name);
                    },
                    p: {
                        capsule: XCapsule_
                    }
                });

            expect(
                sol.isCapsule((new C()).getResult_('p'))).toBeTruthy();

            var cSub = new(sol.defCapsule({
                        base: C,
                        myPart: {
                            capsule: XCapsule_
                        }
                    }));

            expect(
                sol.isCapsule(cSub.getResult_('p')) && sol.isCapsule(cSub.getResult_('myPart'))).toBeTruthy();
        });
		
		it('should verify unnamed part in this is returned by the getPart', function () {
			var P = sol.defCapsule({});
			var C = sol.defCapsule({
				init: function(){
					this.myPart = new P();
				},
				'+ getResult': function(){
					return sol.isCapsule(this.getPart('myPart'));
				}
			});
			
			var c = new C();
			
			expect(
                c.getResult()).toBeTruthy();
		});
    });

    describe('detachAll()', function () {
        it('should throw error when working with detached capsules', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        this.detachAll();
                        this.p.getName();
                    },
                    p: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(function () {
                c.getResult_()
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));
        });

        it('should verify the number of parts is zero after detachAll', function () {
            var C = sol.defCapsule({
                    '> getResult_': function () {
                        this.detachAll();
                        return this.getParts().length;
                    },
                    p1: {
                        capsule: XCapsule_
                    },
                    p2: {
                        capsule: XCapsule_
                    },
                    p3: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(
                c.getResult_()).toBe(0);
        });

        it('should verify that after detachAll all wires and ties are destroyed', function () {
            var C = sol.defCapsule({
                    '> doP': function () {},
                    '> doP2': function () {},
                    '> getResult_': function () {
                        this.p.onThat.wire(this.onQ);
                        this.doP.wire(this.p.doThis);
                        this.myHook.tie(this.p.hook);
                        this.myLoop.tie(this.p.loop);
                        this.p2.onThat.wire(this.onQ2);
                        this.doP2.wire(this.p2.doThis);
                        this.myHook2.tie(this.p2.hook);
                        this.myLoop2.tie(this.p2.loop);

                        this.detachAll();

                        return this.onQ.getWires().indexOf(this.p.onThat) !== -1 ||
                        this.doP.getWires().indexOf(this.p.doThis) !== -1 ||
                        this.myHook.getParent() === this.p.hook ||
                        this.myLoop.getChildren()[0] === this.p.loop ||
                        this.onQ2.getWires().indexOf(this.p2.onThat) !== -1 ||
                        this.doP2.getWires().indexOf(this.p2.doThis) !== -1 ||
                        this.myHook2.getParent() === this.p2.hook ||
                        this.myLoop2.getChildren()[0] === this.p2.loop;
                    },
                    '< onQ': function () {},
                    '< onQ2': function () {},
                    hooks: ['myHook', 'myHook2'],
                    loops: ['myLoop', 'myLoop2'],
                    p: {
                        capsule: XCapsule_
                    },
                    p2: {
                        capsule: XCapsule_
                    }
                });
            var c = new C();
            expect(
                c.getResult_()).toBeFalsy();
        });
    });

    describe('getData(id)', function () {
        var C = sol.defCapsule({
                '> getResult_': function (id) {
                    return this.getData(id);
                }
            });
        var c = new C();
        it('should throw error when id is not a string', function () {
            expect(function () {
                c.getResult_();
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                c.getResult_(null);
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                c.getResult_({});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                c.getResult_(43);
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                c.getResult_(function () {});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify it doesn\'t complain when used properly', function () {
            expect(function () {
                c.getResult_('string');
            }).not.toThrowError();
        });
    });

    describe('setData(id, data)', function () {
        var C = sol.defCapsule({
                '> setData_': function (id, data) {
                    this.setData(id, data);
                },
                '> getData_': function (id) {
                    return this.getData(id);
                }
            });
        var c = new C();
        it('should throw error when id is not a string', function () {
            expect(function () {
                c.setData_();
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                c.setData_(null);
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                c.setData_({});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                c.setData_(43);
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                c.setData_(function () {});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify it doesn\'t complain when used properly', function () {
            expect(function () {
                c.setData_('string', {
                    a: 'A',
                    b: 'B'
                });
            }).not.toThrowError();
        });

        it('should verify it sets the data correctly', function () {
            var id = 'id',
            data = {
                a: 'A',
                b: 'B'
            };
            c.setData_(id, data);
            expect(
                c.getData_(id)).toBe(data);
        });
    });

    it('should verify capsule (class) name on a capsule instance', function () {
        var NAME = 'VerifyMe',
        C = sol.defCapsule({
                name: NAME
            });
        expect(
            (new C).name).toEqual(NAME);
    });
});
