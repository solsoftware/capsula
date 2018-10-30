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

describe('operations', function () {
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

    describe('filters', function () {
        describe('filters operation checks', function () {
            it('should verify a filter chain\'s returned value is correct', function () {
                var C = sol.defCapsule({
                        '> doThis': 'this.onThat',
                        '< onThat': function () {},
                        'f this.doThis': function f1(val) {
                            return [val + 10];
                        },
                        'f this.onThat': function f3(val) {
                            return [val + 100];
                        }
                    });

                var c = new C();
                c.doThis.setFilter(function f0(val) {
                    return [val + 1];
                });
                c.onThat.setFilter(function f5(val) {
                    return [val + 1000];
                });

                c.onThat.wire(function (val) {
                    return val;
                });

                expect(
                    c.doThis(0)).toBe(1111);
                expect(
                    c.doThis(-1111)).toBe(0);
                expect(
                    c.doThis(1)).toBe(1112);

                c.doThis.setFilter(function f0(val) {
                    return sol.STOP;
                });

                expect(
                    c.doThis(0)).toBe(undefined);

                c.doThis.setFilter(function f0(val) {
                    return [sol.STOP];
                });

                expect(
                    c.doThis(0)).toBe(undefined);

                c.doThis.setFilter(sol.STOP);

                expect(
                    c.doThis(0)).toBe(undefined);
            })

            it('should throw error when filter does not return neither array nor STOP message', function () {
                var C = sol.defCapsule({
                        '> doThis': function () {}
                    });

                var c = new C();
                c.doThis.setFilter(function f(val) {
                    return val + 1;
                });

                expect(function () {
                    c.doThis(0);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_FILTERS_RETURN_VALUE));
            });
        });

        describe('getFilter()', function () {
            it('should varify returned value is correct', function () {
                function f1() {}
                function f2() {}
                var C = sol.defCapsule({
                        '> doThis': function () {},
                        '> getResult1_': function () {
                            return this.doThis.getFilter();
                        },
                        '> getResult2_': function () {
                            return this.onThat.getFilter();
                        },
                        '< onThat': function () {},
                        'f this.doThis': f1,
                        'f this.onThat': f2
                    });

                var c = new C();

                expect(
                    typeof c.getResult1_()).toBe('function');
                expect(
                    typeof c.getResult2_()).toBe('function');

                c.doThis.setFilter(null);
                expect(
                    c.doThis.getFilter()).toBe(null);

                c.doThis.setFilter(sol.STOP);
                expect(
                    c.doThis.getFilter()).toEqual(sol.STOP);

                c.doThis.setFilter(1, 2, 'something');
                expect(
                    c.doThis.getFilter()).toEqual([1, 2, 'something']);
            });
        });

        describe('setFilter(var_args)', function () {
            it('should verify filter is set', function () {
                var C = sol.defCapsule({
                        '> doThis': function () {
                            var sum = 0;
                            for (var i = 0; i < arguments.length; i++)
                                sum = sum + arguments[i];
                            return sum;
                        },
                        '> doThis2': function (val) {
                            return val;
                        }
                    }),
                c = new C();

                var f1 = function (val) {
                    return [val + 1];
                },
                f2 = function (val) {
                    return [val + 10];
                },
                f3 = function (val) {
                    return [val + 100];
                };

                c.doThis.setFilter(f1);
                expect(
                    c.doThis(0)).toBe(1);

                c.doThis.setFilter(f2);
                expect(
                    c.doThis(0)).toBe(10);

                c.doThis.setFilter(f3);
                expect(
                    c.doThis(0)).toBe(100);

                c.doThis2.setFilter();
                expect(
                    c.doThis2(0)).toBe(undefined);

                c.doThis.setFilter(sol.STOP);
                expect(
                    c.doThis(0)).toBe(undefined);

                c.doThis.setFilter(150);
                expect(
                    c.doThis(0)).toBe(150);

                c.doThis.setFilter(150, 160);
                expect(
                    c.doThis(0)).toEqual(310);

                c.doThis2.setFilter([]);
                expect(
                    c.doThis2(0)).toEqual([]);

                c.doThis2.setFilter(f1);
                expect(
                    c.doThis2(0)).toBe(1);

                c.doThis2.setFilter(f1, 'second argument');
                expect(
                    c.doThis2(0)).toBe(f1);
            });
        });

        describe('throw error in filter', function () {
            it('should verify error in filter get processed in handle', function () {
                var C = sol.defCapsule({
                        '> x': function (value) {
                            return value + '-operation';
                        },
                        'f this.x': function (value) {
                            throw new Error(value + '-filter');
                        },
                        handle: function (error) { // handle actually replaces filter
                            return [error.message + '-handle']
                        }
                    });

                var c = new C();
                expect(
                    c.x('argument')).toEqual('argument-filter-handle-operation');
            });
        });
    });

    describe('sources (wires)', function () {
        describe('checks operations dealing with sources', function () {
            it('should verify an operation chain\'s returned value is correct', function () {
                var C = sol.defCapsule({
                        '> doThis': null,
                        '< onThat': null,
                        init: function () {
                            this.onThat.source(this.doThis);
                        }
                    });

                var c1 = new C(),
                c2 = new C(),
                c3 = new C();
                c3.doThis.source(c2.onThat);
                c2.doThis.source(c1.onThat);
                c3.onThat.wire(function (val) {
                    return val;
                });

                expect(
                    c1.doThis(15)).toBe(15);
                expect(
                    c1.doThis(true)).toBe(true);
                expect(
                    c1.doThis('message')).toBe('message');
                expect(
                    c1.doThis([1, '2', true, false])).toEqual([1, '2', true, false]);

                c1.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c1.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);

                c2.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c2.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);

                c3.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c3.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);
            })
        });

        describe('getSources()', function () {
            it('should verify a number of sources', function () {
                var C = sol.defCapsule({
                        '> do1': function () {},
                        '> do2': function () {},
                        '> getResult_': function () {
                            return this.on.getSources().length;
                        },
                        '< on': function () {},
                        'this.do1': 'this.on',
                        'this.do2': 'this.on'
                    });

                expect(
                    (new C()).getResult_()).toBe(2);

                expect(
                    (new(sol.defCapsule({
                                base: C,
                                '> do3': function () {},
                                'this.do3': 'this.on'
                            }))).getResult_()).toBe(3); // 1 + 2 derived

                expect(
                    (new(sol.defCapsule({
                                base: C,
                                '> do3': function () {},
                                '> do4': function () {},
                                init: function () {
                                    this.on.source(this.do4);
                                },
                                'this.do3': 'this.on'
                            }))).getResult_()).toBe(4); // 1 + 2 derived + 1 imperative

                expect(
                    (new(sol.defCapsule({
                                '> do1': function () {},
                                '> getResult_': function () {
                                    return this.p.doThis.getSources().length;
                                },
                                p: {
                                    capsule: XCapsule_
                                },
                                'this.do1': 'p.doThis'
                            }))).getResult_()).toBe(1);
            });
        });

        describe('source(var_args)', function () {
            it('should throw error when there are non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.source(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.source('not a function');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.source({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.source(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.source(function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.source(c.onThat, function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify sources are added', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> do2': null,
                        '> do3': null,
                        '> addSource_': function (num) {
                            if (num === 1)
                                this.on.source(this.do1);
                            else if (num === 2)
                                this.on.source(this.do2);
                            else if (num === 3)
                                this.on.source(this.do3);
                        },
                        '> addSources_': function () {
                            this.on.source(this.do1, this.do2, this.do3);
                        },
                        '< on': function () {}
                    }),
                c = new C();
                c.on.wire(function (val) {
                    return val;
                });
                c.addSource_(1);
                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);

                c.addSource_(2);
                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(undefined);

                c.addSource_(3);
                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c2 = new C();
                c2.on.wire(function (val) {
                    return val;
                });
                c2.addSources_();
                expect(
                    c2.do1(1)).toBe(1);
                expect(
                    c2.do2(1)).toBe(1);
                expect(
                    c2.do3(1)).toBe(1);
            });
        });

        describe('unsourceAll()', function () {
            it('should verify all sources are removed', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> do2': null,
                        '> do3': null,
                        '> removeSources_': function () {
                            this.on.unsourceAll();
                        },
                        '< on': function () {},
                        'this.do1': 'this.on',
                        'this.do2': 'this.on',
                        'this.do3': 'this.on'
                    }),
                c = new C();
                c.on.wire(function (val) {
                    return val;
                });

                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.removeSources_();

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);
            });
        });

        describe('unsource(var_args)', function () {
            it('should throw error when there are non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.unsource(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unsource('not an operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unsource({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unsource(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unsource(function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unsource(c.onThat, function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('shouldn\'t throw error when trying to remove sources that don\'t really exist', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.unsource(c.onThat);
                }).not.toThrowError();
            });

            it('should verify a source(s) is removed', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> do2': null,
                        '> do3': null,
                        '> removeSource_': function (var_args) {
                            this.on.unsource.apply(this.on, arguments);
                        },
                        '> addSource_': function (var_args) {
                            this.on.source.apply(this.on, arguments);
                        },
                        '< on': function () {},
                        'this.do1': 'this.on',
                        'this.do2': 'this.on',
                        'this.do3': 'this.on'
                    }),
                c = new C();
                c.on.wire(function (val) {
                    return val;
                });

                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.removeSource_();

                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.removeSource_([]);

                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.removeSource_(c.do1);

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.removeSource_(c.do2, c.do3);

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);

                c.addSource_(c.do2, c.do3, c.do2);

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toEqual([1, 1]);
                expect(
                    c.do3(1)).toBe(1);

                c.removeSource_(c.do2);

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toEqual(undefined);
                expect(
                    c.do3(1)).toBe(1);
            });
        });

        describe('resource(var_args)', function () {
            it('should throw error when there are non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.resource(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.resource('not an operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.resource({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.resource(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.resource(function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.resource(c.onThat, function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify sources are set', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> do2': null,
                        '> do3': null,
                        '> setSources_': function () {
                            this.on.resource.apply(this.on, arguments);
                        },
                        '< on': function () {}
                    }),
                c = new C();
                c.on.wire(function (val) {
                    return val;
                });
                c.setSources_(c.do1);
                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);

                c.setSources_(c.do2);
                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(undefined);

                c.setSources_(c.do3);
                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(1);

                c.setSources_(c.do2, c.do3);
                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.setSources_();
                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);

                c.setSources_(c.do1, c.do2, c.do3);
                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.setSources_([]);
                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);
            });
        });

        describe('isTargetOf(var_args)', function () {
            it('should throw error when there are non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.isTargetOf(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isTargetOf('not an operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isTargetOf({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isTargetOf(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isTargetOf(function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.isTargetOf(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
                expect(function () {
                    c.doThis.isTargetOf(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
                var C = sol.defCapsule({
                        '> in1': function () {},
                        '> getResult_': function () {
                            return this.in1.isTargetOf(this.out1);
                        },
                        '> getResult2_': function () {
                            return this.out1.isTargetOf(this.out1);
                        },
                        '< out1': function () {}
                    }),
                c = new C();
                expect(function () {
                    c.getResult_();
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
                expect(function () {
                    c.getResult2_();
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
            });

            it('should verify it works correctly', function () {
                var C1 = sol.defCapsule({
                        '> in1': function () {},
                        '< out1': function () {},
                        '< out2': function () {}
                    });

                var C2 = sol.defCapsule({
                        '> in1': function () {},
                        '> in2': function () {},
                        '> getResult1_': function () {
                            return this.out1.isTargetOf(this.p.out1) ||
                            this.p.in1.isTargetOf(this.in2) ||
                            this.out1.isTargetOf(this.in2) ||
                            this.out1.isTargetOf(this.in1, this.p.out1);
                        },
                        '> getResult2_': function () {
                            return this.out1.isTargetOf(this.p.out2) &&
                            this.p.in1.isTargetOf(this.in1) &&
                            this.out1.isTargetOf(this.in1) &&
                            this.out1.isTargetOf(this.in1, this.p.out2);
                        },
                        '< out1': function () {},
                        p: C1,
                        'this.in1': ['p.in1', 'this.out1'],
                        'p.out2': 'this.out1'
                    });

                var c2 = new C2();

                expect(
                    c2.getResult1_()).toBeFalsy();
                expect(
                    c2.getResult2_()).toBeTruthy();
					
				expect(
					c2.getResult1_.isTargetOf()).toBeFalsy();
				expect(
					c2.getResult1_.isTargetOf([])).toBeFalsy();
            });
        });
    });

    describe('targets (wires)', function () {
        describe('checks operations dealing with targets', function () {
            it('should verify an operation chain\'s returned value is correct', function () {
                var C = sol.defCapsule({
                        '> doThis': null,
                        '< onThat': function () {},
                        init: function () {
                            this.doThis.target(this.onThat);
                        }
                    });

                var c1 = new C(),
                c2 = new C(),
                c3 = new C();
                c1.onThat.target(c2.doThis);
                c2.onThat.target(c3.doThis);
                c3.onThat.target(function (val) {
                    return val;
                });

                expect(
                    c1.doThis(15)).toBe(15);
                expect(
                    c1.doThis(true)).toBe(true);
                expect(
                    c1.doThis('message')).toBe('message');
                expect(
                    c1.doThis([1, '2', true, false])).toEqual([1, '2', true, false]);

                c1.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c1.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);

                c2.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c2.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);

                c3.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c3.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);
            })
        });

        describe('getTargets()', function () {
            it('should verify a number of targets', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> getResult_': function () {
                            return this.do1.getTargets().length;
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        'this.do1': ['this.on1', 'this.on2']
                    });

                expect(
                    (new C()).getResult_()).toBe(2);

                expect(
                    (new(sol.defCapsule({
                                base: C,
                                '< on3': function () {},
                                'this.do1': 'this.on3'
                            }))).getResult_()).toBe(3); // 1 + 2 derived

                expect(
                    (new(sol.defCapsule({
                                base: C,
                                '< on3': function () {},
                                '< on4': function () {},
                                init: function () {
                                    this.do1.target(this.on4);
                                },
                                'this.do1': 'this.on3'
                            }))).getResult_()).toBe(4); // 1 + 2 derived + 1 imperative

                expect(
                    (new(sol.defCapsule({
                                '> getResult_': function () {
                                    return this.p.onThat.getTargets().length;
                                },
                                '< on': function () {},
                                p: {
                                    capsule: XCapsule_
                                },
                                'p.onThat': 'this.on'
                            }))).getResult_()).toBe(1);
            });
        });

        describe('target(var_args)', function () {
            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.target(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.target('neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.target({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.target(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.target(c.doThis, function () {}, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify targets are added', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> addTarget_': function (num) {
                            if (num === 1)
                                this.do1.target(this.on1);
                            else if (num === 2)
                                this.do1.target(this.on2);
                            else if (num === 3)
                                this.do1.target(this.on3);
                        },
                        '> addTargets_': function () {
                            this.do1.target(this.on1, this.on2, this.on3);
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {}
                    }),
                c = new C(),
                f = function (val) {
                    return val;
                };

                c.on1.target(f);
                c.on2.target(f);
                c.on3.target(f);

                c.addTarget_(1);
                expect(
                    c.do1(1)).toBe(1);

                c.addTarget_(2);
                expect(
                    c.do1(1)).toEqual([1, 1]);

                c.addTarget_(3);
                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c2 = new C();
                c2.on1.target(f);
                c2.on2.target(f);
                c2.on3.target(f);

                c2.addTargets_();
                expect(
                    c2.do1(1)).toEqual([1, 1, 1]);
            });
        });

        describe('targetAt(at, var_args)', function () {
            it('should throw error when at is out of bounds or not even a number', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.targetAt(1, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.onThat.targetAt(-1, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.onThat.targetAt(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt(null, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt(undefined, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt('not a number', c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt({}, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt(function () {}, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.targetAt(0, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt(0, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt(0, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt(0, 4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.targetAt(0, c.doThis, function () {}, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify targets are added at specified position', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> targetAt_': function (at, var_args) {
                            this.do1.targetAt.apply(this.do1, arguments);
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {}
                    }),
                c = new C(),
                fa = function (val) {
                    return val + 'A';
                };
                fb = function (val) {
                    return val + 'B';
                };
                fc = function (val) {
                    return val + 'C';
                };

                c.on1.target(fa);
                c.on2.target(fb);
                c.on3.target(fc);

                c.targetAt_(0, c.on1);
                c.targetAt_(1, c.on2);
                c.targetAt_(2, c.on3);

                expect(
                    c.do1('')).toEqual(['A', 'B', 'C']);

                c = new C();
                c.on1.target(fa);
                c.on2.target(fb);
                c.on3.target(fc);

                c.targetAt_(0, c.on1);
                c.targetAt_(0, c.on2);
                c.targetAt_(0, c.on3);

                expect(
                    c.do1('')).toEqual(['C', 'B', 'A']);

                c = new C();
                c.on1.target(fa);
                c.on2.target(fb);
                c.on3.target(fc);

                c.targetAt_(0, c.on1);
                c.targetAt_(0, c.on2, c.on3);

                expect(
                    c.do1('')).toEqual(['B', 'C', 'A']);

                c = new C();
                c.on1.target(fa);
                c.on2.target(fb);
                c.on3.target(fc);

                c.targetAt_(0, c.on1);
                c.targetAt_(0, c.on2, c.on3, c.on1);

                expect(
                    c.do1('')).toEqual(['B', 'C', 'A', 'A']);
            });
        });

        describe('untargetAll()', function () {
            it('should verify all targets are removed', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> removeTargets_': function () {
                            this.do1.untargetAll();
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {},
                        'this.do1': ['this.on1', 'this.on2', 'this.on3']
                    }),
                c = new C(),
                f = function (val) {
                    return val;
                };
                c.on1.wire(f);
                c.on2.wire(f);
                c.on3.wire(f);

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.removeTargets_();

                expect(
                    c.do1(1)).toBe(undefined);
            });
        });

        describe('untarget(var_args)', function () {
            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.untarget(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.untarget('neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.untarget({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.untarget(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.untarget(function () {}, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('shouldn\'t throw error when trying to remove targets that don\'t really exist', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.untarget(c.doThis);
                }).not.toThrowError();
            });

            it('should verify a target(s) is removed', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> removeTarget_': function () {
                            this.do1.untarget.apply(this.do1, arguments);
                        },
                        '> addTarget_': function () {
                            this.do1.target.apply(this.do1, arguments);
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {},
                        'this.do1': ['this.on1', 'this.on2', 'this.on3']
                    }),
                c = new C(),
                f = function (val) {
                    return val;
                };
                c.on1.wire(f);
                c.on2.wire(f);
                c.on3.wire(f);

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.removeTarget_();

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.removeTarget_([]);

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.removeTarget_(c.on1);

                expect(
                    c.do1(1)).toEqual([1, 1]);

                c.removeTarget_(c.on2, c.on3);

                expect(
                    c.do1(1)).toEqual(undefined);

                c.addTarget_(c.on2, c.on3, c.on2);

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.removeTarget_(c.on2);

                expect(
                    c.do1(1)).toBe(1);
            });
        });

        describe('retarget(var_args)', function () {
            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.retarget(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.retarget('neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.retarget({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.retarget(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.retarget(c.doThis, function () {}, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify targets are added', function () {
                var C = sol.defCapsule({
                        '> do1': function () {},
                        '> setTargets_': function () {
                            this.do1.retarget.apply(this.do1, arguments);
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {}
                    }),
                c = new C(),
                f = function (val) {
                    return val;
                };

                c.on1.target(f);
                c.on2.target(f);
                c.on3.target(f);

                c.setTargets_(c.on1);
                expect(
                    c.do1(1)).toBe(1);

                c.setTargets_(c.on2);
                expect(
                    c.do1(1)).toBe(1);

                c.setTargets_(c.on3);
                expect(
                    c.do1(1)).toBe(1);

                c.setTargets_(c.on1, c.on3);
                expect(
                    c.do1(1)).toEqual([1, 1]);

                c.setTargets_();
                expect(
                    c.do1(1)).toEqual(undefined);

                c.setTargets_(c.on1, c.on2, c.on3);
                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.setTargets_([]);
                expect(
                    c.do1(1)).toEqual(undefined);
            });
        });

        describe('isSourceOf(var_args)', function () {
            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.isSourceOf(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.isSourceOf('neither function nor an operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.isSourceOf({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.isSourceOf(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isSourceOf(c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
                expect(function () {
                    c.onThat.isSourceOf(c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
                var C = sol.defCapsule({
                        '> in1': function () {},
                        '> getResult_': function () {
                            return this.out1.isSourceOf(this.in1);
                        },
                        '> getResult2_': function () {
                            return this.in1.isSourceOf(this.in1);
                        },
                        '< out1': function () {}
                    }),
                c = new C();
                expect(function () {
                    c.getResult_();
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
                expect(function () {
                    c.getResult2_();
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
            });

            it('should verify it works correctly', function () {
                var C1 = sol.defCapsule({
                        '> in1': function () {},
                        '> in2': function () {},
                        '< out1': function () {}
                    });

                var C2 = sol.defCapsule({
                        '> in1': function () {},
                        '> getResult1_': function () {
                            return this.in1.isSourceOf(this.p.in2) &&
                            this.in1.isSourceOf(this.out1) &&
                            this.p.out1.isSourceOf(this.out1) &&
                            this.in1.isSourceOf(this.p.in2, this.out1);
                        },
                        '> getResult2_': function () {
                            return this.in1.isSourceOf(this.p.in1) ||
                            this.in1.isSourceOf(this.out2) ||
                            this.p.out1.isSourceOf(this.out2) ||
                            this.in1.isSourceOf(this.p.in2, this.p.in1) ||
                            this.in1.isSourceOf(this.p.in1, this.p.in2);
                        },
                        '> getResult3_': function () {},
                        '> getResult4_': function () {},
                        '< out1': function () {},
                        '< out2': function () {},
                        p: C1,
                        'this.in1': ['p.in2', 'this.out1'],
                        'p.out1': 'this.out1'
                    });

                var c2 = new C2();

                expect(
                    c2.getResult1_()).toBeTruthy();
                expect(
                    c2.getResult2_()).toBeFalsy();
					
				expect(
					c2.out1.isSourceOf()).toBeFalsy();
				expect(
					c2.out1.isSourceOf([])).toBeFalsy();
            });
        });
    });

    describe('wires', function () {
        describe('checks operations dealing with wires', function () {
            it('should verify an operation chain\'s returned value is correct', function () {
                var C = sol.defCapsule({
                        '> doThis': null,
                        '< onThat': function () {},
                        init: function () {
                            this.doThis.wire(this.onThat);
                        }
                    });

                var c1 = new C(),
                c2 = new C(),
                c3 = new C();
                c1.onThat.wire(c2.doThis);
                c2.onThat.wire(c3.doThis);
                c3.onThat.wire(function (val) {
                    return val;
                });

                expect(
                    c1.doThis(15)).toBe(15);
                expect(
                    c1.doThis(true)).toBe(true);
                expect(
                    c1.doThis('message')).toBe('message');
                expect(
                    c1.doThis([1, '2', true, false])).toEqual([1, '2', true, false]);

                c1.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c1.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);

                c2.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c2.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);

                c3.doThis.setEnabled(false);
                expect(
                    c1.doThis(15)).toBe(undefined);

                c3.doThis.setEnabled(true);
                expect(
                    c1.doThis(15)).toBe(15);
            })
        });

        describe('getWires() - on input operation', function () {
            it('should verify a number of wired operations', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> getResult_': function () {
                            return this.do1.getWires().length;
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        'this.do1': ['this.on1', 'this.on2']
                    });

                expect(
                    (new C()).getResult_()).toBe(2);

                expect(
                    (new(sol.defCapsule({
                                base: C,
                                '< on3': function () {},
                                'this.do1': 'this.on3'
                            }))).getResult_()).toBe(3); // 1 + 2 derived

                expect(
                    (new(sol.defCapsule({
                                base: C,
                                '< on3': function () {},
                                '< on4': function () {},
                                init: function () {
                                    this.do1.wire(this.on4);
                                },
                                'this.do1': 'this.on3'
                            }))).getResult_()).toBe(4); // 1 + 2 derived + 1 imperative

                expect(
                    (new(sol.defCapsule({
                                '> do1': function () {},
                                '> getResult_': function () {
                                    return this.p.doThis.getWires().length;
                                },
                                p: {
                                    capsule: XCapsule_
                                },
                                'this.do1': 'p.doThis'
                            }))).getResult_()).toBe(1);
            });
        });

        describe('getWires() - on output operation', function () {
            it('should verify a number of wired operations', function () {
                var C = sol.defCapsule({
                        '> do1': function () {},
                        '> do2': function () {},
                        '> getResult_': function () {
                            return this.on.getWires().length;
                        },
                        '< on': function () {},
                        'this.do1': 'this.on',
                        'this.do2': 'this.on'
                    });

                expect(
                    (new C()).getResult_()).toBe(2);

                expect(
                    (new(sol.defCapsule({
                                base: C,
                                '> do3': function () {},
                                'this.do3': 'this.on'
                            }))).getResult_()).toBe(3); // 1 + 2 derived

                expect(
                    (new(sol.defCapsule({
                                base: C,
                                '> do3': function () {},
                                '> do4': function () {},
                                init: function () {
                                    this.on.source(this.do4);
                                },
                                'this.do3': 'this.on'
                            }))).getResult_()).toBe(4); // 1 + 2 derived + 1 imperative

                expect(
                    (new(sol.defCapsule({
                                '> getResult_': function () {
                                    return this.p.onThat.getWires().length;
                                },
                                '< on': function () {},
                                p: {
                                    capsule: XCapsule_
                                },
                                'p.onThat': 'this.on'
                            }))).getResult_()).toBe(1);
            });
        });

        describe('wire(var_args) - on input operation', function () {
            it('should throw error when there are non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.wire(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wire('not a function');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wire({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wire(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wire(function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wire(c.onThat, function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify wires are created', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> addWire_': function (num) {
                            if (num === 1)
                                this.do1.wire(this.on1);
                            else if (num === 2)
                                this.do1.wire(this.on2);
                            else if (num === 3)
                                this.do1.wire(this.on3);
                        },
                        '> addWires_': function () {
                            this.do1.wire(this.on1, this.on2, this.on3);
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {}
                    }),
                c = new C(),
                f = function (val) {
                    return val;
                };

                c.on1.wire(f);
                c.on2.wire(f);
                c.on3.wire(f);

                c.addWire_(1);
                expect(
                    c.do1(1)).toBe(1);

                c.addWire_(2);
                expect(
                    c.do1(1)).toEqual([1, 1]);

                c.addWire_(3);
                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c2 = new C();
                c2.on1.wire(f);
                c2.on2.wire(f);
                c2.on3.wire(f);

                c2.addWires_();
                expect(
                    c2.do1(1)).toEqual([1, 1, 1]);
            });
        });

        describe('wire(var_args) - on output operation', function () {
            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.wire(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wire('neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wire({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wire(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wire(c.doThis, function () {}, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify wires are created', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> do2': null,
                        '> do3': null,
                        '> addWire_': function (num) {
                            if (num === 1)
                                this.on.wire(this.do1);
                            else if (num === 2)
                                this.on.wire(this.do2);
                            else if (num === 3)
                                this.on.wire(this.do3);
                        },
                        '> addWires_': function () {
                            this.on.wire(this.do1, this.do2, this.do3);
                        },
                        '< on': function () {}
                    }),
                c = new C();
                c.on.wire(function (val) {
                    return val;
                });
                c.addWire_(1);
                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);

                c.addWire_(2);
                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(undefined);

                c.addWire_(3);
                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c2 = new C();
                c2.on.wire(function (val) {
                    return val;
                });
                c2.addWires_();
                expect(
                    c2.do1(1)).toBe(1);
                expect(
                    c2.do2(1)).toBe(1);
                expect(
                    c2.do3(1)).toBe(1);
            });
        });

        describe('wireAt(at, var_args) - on input operation', function () {
            it('should throw error when at is out of bounds or not even a number', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.wireAt();
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt(1, c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.doThis.wireAt(-1, c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.doThis.wireAt(c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt(null, c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt(undefined, c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt('not a number', c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt({}, c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt(function () {}, c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.wireAt(0, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt(0, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt(0, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt(0, 4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.wireAt(0, c.onThat, function () {}, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify targets are added at specified position', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> targetAt_': function (at, var_args) {
                            this.do1.wireAt.apply(this.do1, arguments);
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {}
                    }),
                c = new C(),
                fa = function (val) {
                    return val + 'A';
                };
                fb = function (val) {
                    return val + 'B';
                };
                fc = function (val) {
                    return val + 'C';
                };

                c.on1.target(fa);
                c.on2.target(fb);
                c.on3.target(fc);

                c.targetAt_(0, c.on1);
                c.targetAt_(1, c.on2);
                c.targetAt_(2, c.on3);

                expect(
                    c.do1('')).toEqual(['A', 'B', 'C']);

                c = new C();
                c.on1.target(fa);
                c.on2.target(fb);
                c.on3.target(fc);

                c.targetAt_(0, c.on1);
                c.targetAt_(0, c.on2);
                c.targetAt_(0, c.on3);

                expect(
                    c.do1('')).toEqual(['C', 'B', 'A']);

                c = new C();
                c.on1.target(fa);
                c.on2.target(fb);
                c.on3.target(fc);

                c.targetAt_(0, c.on1);
                c.targetAt_(0, c.on2, c.on3);

                expect(
                    c.do1('')).toEqual(['B', 'C', 'A']);

                c = new C();
                c.on1.target(fa);
                c.on2.target(fb);
                c.on3.target(fc);

                c.targetAt_(0, c.on1);
                c.targetAt_(0, c.on2, c.on3, c.on1);

                expect(
                    c.do1('')).toEqual(['B', 'C', 'A', 'A']);
            });
        });

        describe('wireAt(at, var_args) - on output operation', function () {
            it('should throw error when at is out of bounds or not even a number', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.wireAt();
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt(1, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.onThat.wireAt(-1, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.INDEX_OUT_OF_BOUNDS));
                expect(function () {
                    c.onThat.wireAt(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt(null, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt(undefined, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt('not a number', c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt({}, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt(function () {}, c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.wireAt(0, null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt(0, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt(0, {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt(0, 4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.wireAt(0, c.doThis, function () {}, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify targets are added at specified position', function () {
                var C = sol.defCapsule({
                        '> getResult_': function () {
                            return this.on('');
                        },
                        '> do1': function (val) {
                            return val + 'A';
                        },
                        '> do2': function (val) {
                            return val + 'B';
                        },
                        '> do3': function (val) {
                            return val + 'C';
                        },
                        '< on': function () {}
                    }),
                c = new C();
                c.on.wireAt(0, c.do1);
                c.on.wireAt(1, c.do2);
                c.on.wireAt(2, c.do3);

                expect(
                    c.getResult_()).toEqual(['A', 'B', 'C']);

                c = new C();
                c.on.wireAt(0, c.do1);
                c.on.wireAt(0, c.do2);
                c.on.wireAt(0, c.do3);

                expect(
                    c.getResult_()).toEqual(['C', 'B', 'A']);

                c = new C();
                c.on.wireAt(0, c.do1);
                c.on.wireAt(0, c.do2, c.do3);

                expect(
                    c.getResult_()).toEqual(['B', 'C', 'A']);

                c = new C();
                c.on.wireAt(0, c.do1);
                c.on.wireAt(0, c.do2, c.do3, c.do1);

                expect(
                    c.getResult_()).toEqual(['B', 'C', 'A', 'A']);
            });
        });

        describe('unwireAll() - on input operation', function () {
            it('should verify all wires are removed', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> unwire_': function () {
                            this.do1.unwireAll();
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {},
                        'this.do1': ['this.on1', 'this.on2', 'this.on3']
                    }),
                c = new C(),
                f = function (val) {
                    return val;
                };
                c.on1.wire(f);
                c.on2.wire(f);
                c.on3.wire(f);

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.unwire_();

                expect(
                    c.do1(1)).toBe(undefined);
            });
        });

        describe('unwireAll() - on output operation', function () {
            it('should verify all wires are removed', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> do2': null,
                        '> do3': null,
                        '> unwire_': function () {
                            this.on.unwireAll();
                        },
                        '< on': function () {},
                        'this.do1': 'this.on',
                        'this.do2': 'this.on',
                        'this.do3': 'this.on'
                    }),
                c = new C();
                c.on.wire(function (val) {
                    return val;
                });

                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.unwire_();

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);
            });
        });

        describe('unwire(var_args) - on input operation', function () {
            it('should throw error when there are non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.unwire(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unwire('not an operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unwire({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unwire(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unwire(function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.unwire(c.onThat, function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('shouldn\'t throw error when trying to remove wires that don\'t really exist', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.unwire(c.onThat);
                }).not.toThrowError();
            });

            it('should verify a target(s) is removed', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> unwireFrom_': function () {
                            this.do1.unwire.apply(this.do1, arguments);
                        },
                        '> wire_': function () {
                            this.do1.target.apply(this.do1, arguments);
                        },
                        '< on1': function () {},
                        '< on2': function () {},
                        '< on3': function () {},
                        'this.do1': ['this.on1', 'this.on2', 'this.on3']
                    }),
                c = new C(),
                f = function (val) {
                    return val;
                };
                c.on1.wire(f);
                c.on2.wire(f);
                c.on3.wire(f);

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.unwireFrom_();

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.unwireFrom_([]);

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.unwireFrom_(c.on1);

                expect(
                    c.do1(1)).toEqual([1, 1]);

                c.unwireFrom_(c.on2, c.on3);

                expect(
                    c.do1(1)).toEqual(undefined);

                c.wire_(c.on2, c.on3, c.on2);

                expect(
                    c.do1(1)).toEqual([1, 1, 1]);

                c.unwireFrom_(c.on2);

                expect(
                    c.do1(1)).toBe(1);
            });
        });

        describe('unwire(var_args) - on output operation', function () {
            it('should throw error when there are non-function or non-operation parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.unwire(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.unwire('neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.unwire({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.unwire(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.unwire(function () {}, 'neither a function nor operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            });

            it('shouldn\'t throw error when trying to remove wires that don\'t really exist', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.unwire(c.doThis);
                }).not.toThrowError();
            });

            it('should verify a source(s) is removed', function () {
                var C = sol.defCapsule({
                        '> do1': null,
                        '> do2': null,
                        '> do3': null,
                        '> unwireFrom_': function (var_args) {
                            this.on.unsource.apply(this.on, arguments);
                        },
                        '> wire_': function (var_args) {
                            this.on.source.apply(this.on, arguments);
                        },
                        '< on': null,
                        'this.do1': 'this.on',
                        'this.do2': 'this.on',
                        'this.do3': 'this.on'
                    }),
                c = new C();
                c.on.wire(function (val) {
                    return val;
                });

                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.unwireFrom_();

                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.unwireFrom_([]);

                expect(
                    c.do1(1)).toBe(1);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.unwireFrom_(c.do1);

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(1);
                expect(
                    c.do3(1)).toBe(1);

                c.unwireFrom_(c.do2, c.do3);

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toBe(undefined);
                expect(
                    c.do3(1)).toBe(undefined);

                c.wire_(c.do2, c.do3, c.do2);

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toEqual([1, 1]);
                expect(
                    c.do3(1)).toBe(1);

                c.unwireFrom_(c.do2);

                expect(
                    c.do1(1)).toBe(undefined);
                expect(
                    c.do2(1)).toEqual(undefined);
                expect(
                    c.do3(1)).toBe(1);
            });
        });

        describe('isWiredTo(var_args) - on input operation', function () {
            it('should throw error when there are non-adequate parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.doThis.isWiredTo(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isWiredTo('neither a function nor an operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isWiredTo({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isWiredTo(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isWiredTo(function () {});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.doThis.isWiredTo(c.doThis);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
                var C = sol.defCapsule({
                        '> in1': function () {},
                        '> getResult_': function () {
                            return this.in1.isWiredTo(this.in1);
                        }
                    }),
                c = new C();
                expect(function () {
                    c.getResult_();
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
            });

            it('should verify it works correctly', function () {
                var C1 = sol.defCapsule({
                        '> in1': function () {},
                        '< out1': function () {},
                        '< out2': function () {}
                    });

                var C2 = sol.defCapsule({
                        '> in1': function () {},
                        '> in2': function () {},
                        '> getResult1_': function () {
                            return this.p.in1.isWiredTo(this.in2) ||
                            this.in2.isWiredTo(this.out1) ||
                            this.out1.isWiredTo(this.in1, this.p.out1);
                        },
                        '> getResult2_': function () {
                            return this.p.in1.isWiredTo(this.in1) &&
                            this.in1.isWiredTo(this.out1) &&
                            this.in1.isWiredTo(this.p.in1, this.out1);
                        },
                        '< out1': function () {},
                        p: C1,
                        'this.in1': ['p.in1', 'this.out1'],
                        'p.out2': 'this.out1'
                    });

                var c2 = new C2();

                expect(
                    c2.getResult1_()).toBeFalsy();
                expect(
                    c2.getResult2_()).toBeTruthy();
            });
        });

        describe('isWiredTo(var_args) - on output operation', function () {
            it('should throw error when there are non-adequate parameters', function () {
                var c = new XCapsule_();
                expect(function () {
                    c.onThat.isWiredTo(null);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.isWiredTo('neither function nor an operation');
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.isWiredTo({});
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.isWiredTo(4);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
                expect(function () {
                    c.onThat.isWiredTo(c.onThat);
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
                var C = sol.defCapsule({
                        '> getResult_': function () {
                            return this.out1.isWiredTo(this.out1);
                        },
                        '< out1': function () {}
                    }),
                c = new C();
                expect(function () {
                    c.getResult_();
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_OPERATION_TYPE));
            });

            it('should verify it works correctly', function () {
                var C1 = sol.defCapsule({
                        '> in1': function () {},
                        '> in2': function () {},
                        '< out1': function () {}
                    });

                var C2 = sol.defCapsule({
                        '> in1': function () {},
                        '> getResult1_': function () {
                            return this.in1.isWiredTo(this.p.in2) &&
                            this.p.out1.isWiredTo(this.out1) &&
                            this.out1.isWiredTo(this.p.out1, this.in1);
                        },
                        '> getResult2_': function () {
                            return this.out2.isWiredTo(this.p.out1) ||
                            this.p.out1.isWiredTo(this.p.in1) ||
                            this.p.in2.isWiredTo(this.in1, this.p.out1);
                        },
                        '< out1': function () {},
                        '< out2': function () {},
                        p: C1,
                        'this.in1': ['p.in2', 'this.out1'],
                        'p.out1': 'this.out1'
                    });

                var c2 = new C2();

                expect(
                    c2.getResult1_()).toBeTruthy();
                expect(
                    c2.getResult2_()).toBeFalsy();
            });
        });
    });

    describe('async mode', function () {
        var C = sol.defCapsule({
                '> x': function (outcome) {
                    if (outcome)
                        return true;
                    else
                        throw new Error('Bad outcome!');
                }
            }),
        c = new C();

        it('should verify operation.send returns Promise', function () {
            expect(
                c.x.send()instanceof Promise).toEqual(true);
        });

        it('should verify async mode of calling operations works for successful scenario', function (done) {
            c.x.send(true).then(function (result) {
                expect(result).toEqual(true);
                done();
            }, function () {
                fail('too bad');
                done();
            });
        });

        it('should verify async mode of calling operations works for erroneous scenario', function (done) {
            c.x.send(false).then(function (result) {
                fail('too bad');
                done();
            }, function (err) {
                expect(err.message).toEqual('Bad outcome!');
                done();
            });
        });
    });

    describe('dynamic instantiation of operations using new operator', function () {
        var C = sol.defCapsule({
                '> newPairOfOperations': function (name) {
                    var i = new sol.Input(),
                    o = new sol.Output();
                    i.setName('i' + name);
                    o.setName('o' + name);
                    i.target(o);
                },
                '> newPairOfNonameOperations': function (name) {
                    var i = new sol.Input(),
                    o = new sol.Output();
                    this['i' + name] = i;
                    this['o' + name] = o;
                    i.target(o);
                },
                '> newInput': function (name) {
                    var input = new sol.Input(function () {
                            return 'Hi';
                        });
                    input.setName('i' + name);
                },
            }),
        c = new C(),
		c2 = new C();

        it('should verify dynamically created input operations with function work as expected', function () {
            c.newInput('A');
            expect(c.getInput('iA')()).toEqual('Hi');
        });

        it('should verify dynamically created operations with name work as expected', function () {
            c.newPairOfOperations('X');
            c.newPairOfOperations('Y');
            c.getOutput('oX').target(c.getInput('iY'));
            c.getOutput('oY').target(function () {
                return 'Hi';
            });

            expect(c.getInput('iY')()).toEqual('Hi');
            expect(c.getInput('iX')()).toEqual('Hi');
        });

        it('should verify dynamically created operations without name work as expected', function () {
            c2.newPairOfNonameOperations('X');
            c2.newPairOfNonameOperations('Y');
            c2.oX.target(c2.iY);
            c2.oY.target(function () {
                return 'Hi';
            });

            expect(c2.iY()).toEqual('Hi');
            expect(c2.iX()).toEqual('Hi');
        });
    });
	
	describe('calling output operation directly from init (constructor)', function () {
		it('should verify calling output operation from constructor works', function () {
			var result = '';
			var f = sol.contextualize(function(c){
				c.out.target(function(){
					return 'hi';
				});
			});
            var C = sol.defCapsule({
				'< out': function (){},
				init: function(){
					f(this); // to wire output operation to something before we call it.
					result = this.out();
				}
			});
			
			expect(function () {
				new C();
			}).not.toThrowError();
			
			expect(result).toEqual('hi');
        });
	});
});
