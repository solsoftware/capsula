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

describe('defCapsule(def)', function () {
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

    describe('full featured defCapsule', function () {
        it('should verify all defCapsule constructs are working', function () {

            var Base = sol.defCapsule({}),

            Part = sol.defCapsule({
                    '> in': null,
                    '< out': null,
                    hooks: 'h',
                    loops: 'l'
                });

            expect(
                sol.defCapsule({
                    isAbstract: false,
                    name: 'TestCapsule',
                    base: Base,
                    init: function () {},
                    handle: function (error) {},
                    hooks: ['h1', 'h2'], // empty array is OK
                    loops: 'l1', // null is OK

                    // inputs

                    '> in1': null,

                    '> in2': function () {
                        return 'Hi';
                    },

                    '> in3': 'this.out1',

                    '> in4': ['this.out1', 'p1.in'],

                    // outputs

                    '< out1': null,

                    '< out2': function (arg1, arg2) {},

                    '+ publicMethod': function () {
                        return 'Hi';
                    },

                    // filters

                    'f this.in1': function () {
                        return [];
                    },

                    'f this.in2': function () {
                        return sol.STOP;
                    },

                    // private methods

                    myPrivateMethod: function () {
                        return 'Hello world';
                    },

                    // parts

                    p1: Part,

                    p2: {
                        capsule: Part
                    },

                    p3: {
                        capsule: Part,
                        args: 'Hi world'
                    },

                    p4: {
                        capsule: Part,
                        args: 'this.args'
                    },

                    p5: {
                        new: Part
                    },

                    p6: {
                        new: Part,
                        arguments: 'Hello world'
                    },

                    p7: {
                        call: Part
                    },

                    p8: {
                        call: Part,
                        deferredArgs: function () {
                            return {
                                message: 'Hello world'
                            };
                        }
                    },

                    // wires
                    'this.in1': ['this.out1', 'p1.in'],
                    'this.in2': 'this.out2',
                    'p2.out': 'this.out1',
                    'p3.out': ['this.out2', 'p4.in'],

                    // ties
                    'this.l1': 'p1.l',
                    'p1.h': ['p2.l', 'p3.l', 'this.h1'],

                    // data
                    ourObject: {},
                    ourArray: [],
                    ourNumber: 100,

                    myObject: '*{}',
                    myArray: '*[]',
                    myMap: '*Map',
                    mySet: '*Set',
                    myWeakMap: '*WeakMap',
                    myWeakSet: '*WeakSet',

                    myData1: {
                        call: function () {
                            return Array.prototype.slice.call(arguments, 0);
                        },
                        args: 'this.args'
                    },

                    myData2: {
                        call: function () {
                            return Array.prototype.slice.call(arguments, 0);
                        },
                        arguments: 'this.args'
                    },

                    myData3: {
                        call: function () {
                            return Array.prototype.slice.call(arguments, 0);
                        },
                        deferredArgs: function () {
                            return 'this.args';
                        }
                    },

                    myData4: {
                        new: function (obj) {
                            this.obj = obj;
                            return this;
                        },
                        args: 'Hi'
                    },

                    myData5: {
                        new: function (obj) {
                            this.obj = obj;
                            return this;
                        },
                        arguments: 'Hello'
                    },

                    myData6: {
                        new: function (obj) {
                            this.obj = obj;
                            return this;
                        },
                        deferredArgs: function () {
                            return {};
                        }
                    }
                })).toBeDefined();
        });
    });

    describe('isAbstract', function () {
        it('should throw error when isAbstract is not a boolean', function () {
            expect(function () {
                sol.defCapsule({
                    isAbstract: 'not a boolean',
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });
    });

    describe('name', function () {
        it('should throw error when capsule (class) name is not a string', function () {
            expect(function () {
                sol.defCapsule({
                    name: 12, // not a string
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });
    });

    describe('base', function () {
        it('should throw error when base is not a capsule constructor', function () {
            expect(function () {
                sol.defCapsule({
                    base: 'not a function, let alone capsule constructor'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    base: function () {}
                    // function yes, but not capsule constructor
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });
        it('should succeed in creating capsule class as a subclass of another class', function () {
            var Super = sol.defCapsule({});
            expect(
                sol.defCapsule({
                    base: Super
                })).toBeDefined();
        });
    });

    describe('init', function () {
        it('should throw error when init is not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    init: 1
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    init: {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    init: []
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    init: 'not a function'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify a capsule class could be created when init function is specified correctly or not specified at all', function () {
            expect(
                // empty
                sol.defCapsule({})).toBeDefined();
            expect(
                sol.defCapsule({
                    init: function () {}
                })).toBeDefined();
        });
    });

    describe('handle', function () {
        it('should throw error when handle is not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    handle: 1
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    handle: {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    handle: []
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    handle: 'not a function'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });
        it('should verify a capsule (class) could be created when handle is specified correctly', function () {
            expect(
                sol.defCapsule({
                    // empty
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    handle: function () {}
                })).toBeDefined();
        });
    });

    describe('data', function () {
        it('should throw error when data are not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    myData: {
                        call: 1
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    myData: {
                        new: {}
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    myData: {
                        call: []
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    myData: {
                        new: function () {},
                        deferredArgs: 'not a function'
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    myData: {
                        call: function () {},
                        deferredArgs: 'not a function'
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify a capsule (class) could be created when data are specified correctly', function () {
            // static data
            expect(
                sol.defCapsule({
                    data: {}
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    data: []
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    data: 1
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    data: 'anything'
                })).toBeDefined();

            // instance data
            expect(
                sol.defCapsule({
                    data: '*{}'
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    data: '*[]'
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    data: '*Map'
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    data: '*Set'
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    data: '*WeakMap'
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    data: '*WeakSet'
                })).toBeDefined();

            function D() {}
            function d() {}

            expect(
                sol.defCapsule({
                    data: {
                        new: D,
                        args: 'anything'
                    }
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    data: {
                        new: D,
                        deferredArgs: function () {
                            return 'anything';
                        }
                    }
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    data: {
                        call: d,
                        args: 'anything'
                    }
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    data: {
                        call: d,
                        deferredArgs: function () {
                            return 'anything';
                        }
                    }
                })).toBeDefined();
        });
    });

    describe('parts', function () {
        it('should throw error when parts are not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    part: {
                        capsule: 1
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    part: {
                        capsule: {}
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    part: {
                        capsule: []
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    part: {
                        capsule: function () {}
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            var C = sol.defCapsule({});

            expect(function () {
                sol.defCapsule({
                    part: {
                        capsule: C,
                        deferredArgs: 'not a function'
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify a capsule (class) could be created when parts are specified correctly', function () {
            var C = sol.defCapsule({});

            expect(
                sol.defCapsule({
                    part: C
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    part: {
                        capsule: C
                    }
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    part: {
                        capsule: C,
                        arguments: 'anything'
                    }
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    part: {
                        capsule: C,
                        args: 'anything'
                    }
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    part: {
                        capsule: C,
                        deferredArgs: function () {
                            return 'anything';
                        }
                    }
                })).toBeDefined();
        });
    });

    describe('hooks', function () {
        it('should throw error when hooks are neither a string nor a string array', function () {
            expect(function () {
                sol.defCapsule({
                    hooks: 1
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    hooks: {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    hooks: [1, 2, 3]
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    hooks: ['hook1', 2, 'hook3']
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });
        it('should verify a capsule (class) could be created when hooks are specified correctly', function () {
            expect(
                sol.defCapsule({
                    hooks: 'hook'
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    hooks: []
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    hooks: ['hook']
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    hooks: ['hook1', 'hook2', 'hook3']
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    hooks: null
                })).toBeDefined();
        });
    });

    describe('loops', function () {
        it('should throw error when loops is neither a string nor a string array', function () {
            expect(function () {
                sol.defCapsule({
                    loops: 1
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    loops: {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    loops: [1, 2, 3]
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    loops: ['loop1', 2, 'loop3']
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });
        it('should verify a capsule (class) could be created when loops are specified correctly', function () {
            expect(
                sol.defCapsule({
                    loops: 'loop'
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    loops: []
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    loops: ['loop']
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    loops: ['loop1', 'loop2', 'loop3']
                })).toBeDefined();
            expect(
                sol.defCapsule({
                    loops: null
                })).toBeDefined();
        });
    });

    describe('input operations', function () {
        it('should throw error when input operation is not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    '> input': 1
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    '> input': true
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    '> input': {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify a capsule (class) could be created when input operations are specified correctly', function () {
            expect(
                sol.defCapsule({
                    '> doX': null
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '> doX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '> doX': 'this.m',
                    m: function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '> doX': 'this.m',
                    '+m': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '> doX': ['this.m', 'this.mp'],
                    '+m': function () {},
                    mp: function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '< onThat': function () {},
                    '> doX': 'this.onThat'
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    p: XCapsule_,
                    '> doX': 'p.doThis',
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    p: XCapsule_,
                    '> doX': ['p.doThis', 'this.m'],
                    '+m': function () {}
                })).toBeDefined();
        });

        it('should verify a capsule (class) could be created when input operations overuse spaces', function () {
            expect(
                sol.defCapsule({
                    '> doX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '>doX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    ' > doX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '             >     doX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '	>	doX': function () {}
                })).toBeDefined();
        });
    });

    describe('output operations', function () {
        it('should throw error when output operation is not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    '< output': 1
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    '< output': []
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    '< output': []
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule({
                    '< output': 'onX'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify a capsule (class) could be created when output operations are specified correctly', function () {
            expect(
                sol.defCapsule({
                    '< onX': null
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '< onX': function () {}
                })).toBeDefined();
        });

        it('should verify a capsule (class) could be created when output operations overuse spaces', function () {
            expect(
                sol.defCapsule({
                    '< onX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '<onX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    ' < onX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '         <     onX': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '	<	onX': function () {}
                })).toBeDefined();
        });
    });

    describe('public methods', function () {
        it('should throw error when public methods are not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    '+ publicMethod': 1
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '+ publicMethod': 'not a function'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '+ publicMethod': []
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '+ publicMethod': {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify a capsule (class) could be created when public methods are specified correctly', function () {
            expect(
                sol.defCapsule({
                    '+ myMethod': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '+myMethod': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    ' + myMethod': function () {}
                })).toBeDefined();

            expect(
                sol.defCapsule({
                    '	+	myMethod': function () {}
                })).toBeDefined();
        });
    });

    describe('private methods', function () {
        it('should verify a capsule (class) could be created when private methods are specified correctly', function () {
            expect(
                sol.defCapsule({
                    myPrivateMethod: function () {}
                })).toBeDefined();
        });
    });

    describe('filters', function () {
        var C,
        f1,
        f2,
        f3;
        beforeAll(function () {
            C = sol.defCapsule({
                    '> doA': function () {},
                    '> doB': function () {},
                    '< onC': function () {},
                    '< onD': function () {}
                });
            f1 = function () {};
            f2 = function () {};
            f3 = function () {};
        });

        it('should throw error when filters are not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'f this.doX': null
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'f this.doX': {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'f this.doX': 'anything'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'f this.doX': [function () {}, function () {}
                    ]
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when non existing operations are used, or non existing filters are used', function () {
            expect(function () {
                sol.defCapsule({
                    'f this.missingOperation': f1
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));
        });

        it('should verify a capsule (class) could be created when filters are specified correctly', function () {
            expect(
                sol.defCapsule({
                    '> doX': function () {},
                    '> doY': function () {},
                    '< onZ': function () {},
                    '< onT': function () {},

                    p: C,

                    'f this.doX': f1,
                    'f this.doX': f2,
                    'f this.doY': f2,
                    'f this.onZ': f1,
                    'f this.onT': f1,
                    'f p.doB': f2,
                    'f p.onC': f1,
                    'f p.!onMissingOperation': f1
                })).toBeDefined();
        });
    });

    describe('wires', function () {
        var C1,
        C2,
        C3;
        beforeAll(function () {
            C1 = sol.defCapsule({
                    '> doA': function () {},
                    '< onC': function () {}
                });
            C2 = sol.defCapsule({
                    '> doB': function () {},
                    '< onD': function () {}
                });
            C3 = sol.defCapsule({
                    hooks: 'h',
                    loops: 'l'
                });
        });

        it('should throw error when wires for input operations are not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    '> doX': ['this.onX', 'this.onX2', function shouldntBeHere() {}
                    ],
                    '< onX': function () {},
                    '< onX2': function () {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when wires are not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'this.doX': null
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'this.doX': {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'this.doX': [1, 2]
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'this.doX': [{}, {}, {}
                    ]
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'this.doX': [[], []]
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when attempting to wire an operation to a hook or loop', function () {
            expect(function () {
                sol.defCapsule({
                    hooks: 'myHook',
                    '> x': function () {},
                    p: C3,
                    'this.x': 'p.h'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));

            expect(function () {
                sol.defCapsule({
                    loops: 'myLoop',
                    '> x': function () {},
                    p: C3,
                    'this.x': 'p.l'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));
        });

        it('should throw error when non existing operations are used', function () {
            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    'this.doX': 'this.missingOperation'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));

            expect(function () {
                sol.defCapsule({
                    '< onX': function () {},
                    'this.missingOperation': 'this.onX'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));
        });

        it('should throw error when wire incompatibility is detected', function () {
            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    '> doY': function () {},
                    'this.doX': 'this.doY'
                });
            }).toThrowError(errorToRegExp(sol.Errors.WIRE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    '< onX': function () {},
                    '< onY': function () {},
                    'this.onX': 'this.onY'
                });
            }).toThrowError(errorToRegExp(sol.Errors.WIRE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    '> doX': function () {},
                    p: C1,
                    'this.doX': 'p.onC'
                });
            }).toThrowError(errorToRegExp(sol.Errors.WIRE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    '< onX': function () {},
                    p: C1,
                    'p.doA': 'this.onX'
                });
            }).toThrowError(errorToRegExp(sol.Errors.WIRE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    '< onX': function () {},
                    m: function () {},
                    'this.onX': 'this.m'
                });
            }).toThrowError(errorToRegExp(sol.Errors.WIRE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    p: C1,
                    m: function () {},
                    'p.doA': 'this.m'
                });
            }).toThrowError(errorToRegExp(sol.Errors.WIRE_INCOMPATIBILITY));
        });

        it('should verify a capsule (class) could be created when wires are specified correctly', function () {
            expect(
                sol.defCapsule({
                    '> doX': function () {},
                    '> doY': function () {},
                    '< onZ': function () {},
                    '< onT': function () {},
                    p1: {
                        capsule: C1
                    },
                    p2: {
                        capsule: C2
                    },

                    m1: function () {},
                    m2: function () {},
                    m3: function () {},

                    'this.doX': 'p1.doA',
                    'this.doY': 'this.m1',
                    'this.doX': 'this.onZ',
                    'p1.onC': 'p2.doB',
                    'p1.onC': 'p2.!doB',
                    'p1.!onC': 'p2.doB',
                    'p1.!onC': 'p2.!doB',
                    'p2.onD': ['this.m2', 'this.onT'],
                    'this.doX': 'p1.!doMissingOperation',
                    'p1.onC': 'p2.!doMissingOperation',
                    'p1.!onMissingOperation': 'p2.doB'
                })).toBeDefined();
        });
    });

    describe('ties', function () {
        var C,
        C1;
        beforeAll(function () {
            C = sol.defCapsule({
                    hooks: 'hook',
                    loops: 'loop'
                });
            C1 = sol.defCapsule({
                    '> x': function () {}
                });
        });

        it('should throw error when ties are not specified correctly', function () {
            expect(function () {
                sol.defCapsule({
                    hooks: 'myHook',
                    'this.myHook': null
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    loops: 'myLoop',
                    'this.myLoop': null
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    hooks: 'myHook',
                    'this.myHook': {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                sol.defCapsule({
                    loops: 'myLoop',
                    'this.myLoop': {}
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should throw error when attempting to tie a hook or loop to an operation', function () {
            expect(function () {
                sol.defCapsule({
                    hooks: 'myHook',
                    p: C1,
                    'this.myHook': 'p.x'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));

            expect(function () {
                sol.defCapsule({
                    loops: 'myLoop',
                    p: C1,
                    'this.myLoop': 'p.x'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));
        });

        it('should throw error when non existing hooks / loops are used', function () {
            expect(function () {
                sol.defCapsule({
                    loops: 'myLoop',
                    'this.myHook': 'this.myLoop'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));

            expect(function () {
                sol.defCapsule({
                    loops: 'myLoop',
                    'this.myLoop': 'this.myHook'
                });
            }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));
        });

        it('should throw error when tie incompatibility is detected', function () {
            expect(function () {
                sol.defCapsule({
                    hooks: ['myHook', 'myHook2'],
                    loops: ['myLoop', 'myLoop2'],
                    'this.myHook': 'this.myHook2'
                });
            }).toThrowError(errorToRegExp(sol.Errors.TIE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    hooks: ['myHook', 'myHook2'],
                    loops: ['myLoop', 'myLoop2'],
                    'this.myLoop': 'this.myLoop2'
                });
            }).toThrowError(errorToRegExp(sol.Errors.TIE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    hooks: ['myHook', 'myHook2'],
                    loops: ['myLoop', 'myLoop2'],
                    p: C,
                    'this.myHook': 'p.loop'
                });
            }).toThrowError(errorToRegExp(sol.Errors.TIE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    hooks: ['myHook', 'myHook2'],
                    loops: ['myLoop', 'myLoop2'],
                    p: C,
                    'p.hook': 'this.myLoop'
                });
            }).toThrowError(errorToRegExp(sol.Errors.TIE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    hooks: ['myHook', 'myHook2'],
                    loops: ['myLoop', 'myLoop2'],
                    p1: {
                        capsule: C
                    },
                    p2: {
                        capsule: C
                    },
                    'p1.hook': 'p2.hook'
                });
            }).toThrowError(errorToRegExp(sol.Errors.TIE_INCOMPATIBILITY));

            expect(function () {
                sol.defCapsule({
                    hooks: ['myHook', 'myHook2'],
                    loops: ['myLoop', 'myLoop2'],
                    p1: {
                        capsule: C
                    },
                    p2: {
                        capsule: C
                    },
                    'p1.loop': 'p2.loop'
                });
            }).toThrowError(errorToRegExp(sol.Errors.TIE_INCOMPATIBILITY));
        });

        it('should verify a capsule (class) could be created when ties are specified correctly', function () {
            expect(
                sol.defCapsule({
                    hooks: 'myHook',
                    loops: 'myLoop',
                    p1: {
                        capsule: C
                    },
                    p2: {
                        capsule: C
                    },
                    p3: {
                        capsule: C
                    },
                    'this.myHook': 'p1.hook',
                    'p1.hook': 'p1.loop',
                    'p2.hook': 'p3.loop',
                    'this.myLoop': 'p2.loop',
                    'p1.hook': 'p2.loop',
                    'p1.hook': 'p2.!loop',
                    'p1.!hook': 'p2.loop',
                    'p1.!hook': 'p2.!loop'
                })).toBeDefined();
        });
    });

    describe('name checks', function () {
        describe('within the same capsule (class)', function () {
            var C = sol.defCapsule({});

            it('should throw error when two inputs share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '> x': function () {},
                        '> x ': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when two outputs share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '< x': function () {},
                        '< x ': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when two hooks share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        hooks: ['x', 'y', 'x']
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when two loops share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        loops: ['x', 'y', 'x']
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when two public methods share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '+ x': function () {},
                        '+ x ': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and output share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '> x': function () {},
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '> x': function () {},
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '> x': function () {},
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '> x': function () {},
                        '+ x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '> x': function () {},
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should verify input and private method could share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '> x': function () {},
                        x: function () {}
                    });
                }).not.toThrowError();
            });

            it('should throw error when input and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '> x': function () {},
                        x: []
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '< x': function () {},
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '< x': function () {},
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '< x': function () {},
                        '+ x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '< x': function () {},
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '< x': function () {},
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '< x': function () {},
                        x: {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        hooks: 'x',
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        hooks: 'x',
                        '+ x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        hooks: 'x',
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        hooks: 'x',
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        hooks: 'x',
                        x: '*{}'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        loops: 'x',
                        '+ x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        loops: 'x',
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        loops: 'x',
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        loops: 'x',
                        x: '*[]'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when public method and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '+ x': function () {},
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when public and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '+ x': function () {},
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when public method and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        '+ x': function () {},
                        x: '*Map'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });
        });

        describe('across the capsule (class) hierarchy', function () {
            var C = sol.defCapsule({}),
            CI = sol.defCapsule({
                    '> x': function () {}
                });

            it('should throw error when two inputs share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CI,
                        '> x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and output share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CI,
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CI,
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CI,
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CI,
                        '+x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when input and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CI,
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should verify input and private method could share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CI,
                        x: function () {}
                    });
                }).not.toThrowError();
            });

            it('should throw error when input and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CI,
                        x: {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            var CO = sol.defCapsule({
                    '< x': function () {}
                });

            it('should throw error when two outputs share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CO,
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and input share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CO,
                        '> x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CO,
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CO,
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CO,
                        '+x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CO,
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CO,
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when output and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CO,
                        x: '*WeakMap'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            var CH = sol.defCapsule({
                    hooks: 'x'
                });

            it('should throw error when two hooks share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CH,
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and input share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CH,
                        '> x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and output share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CH,
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CH,
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CH,
                        '+x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CH,
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CH,
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when hook and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CH,
                        x: []
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            var CL = sol.defCapsule({
                    loops: 'x'
                });

            it('should throw error when two loops share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CL,
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and input share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CL,
                        '> x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and output share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CL,
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CL,
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CL,
                        '+x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CL,
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CL,
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when loop and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CL,
                        x: '*[]'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            var CPM = sol.defCapsule({
                    '+x': function () {}
                });

            it('should throw error when public method and input share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPM,
                        '> x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when public mehtod and output share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPM,
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when public method and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPM,
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when public method and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPM,
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when public method and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPM,
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when public method and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPM,
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_METHODS_VISIBILITY));
            });

            it('should throw error when public method and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPM,
                        x: 'anything'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            var CP = sol.defCapsule({
                    x: C
                });

            it('should throw error when part and input share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CP,
                        '> x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when part and output share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CP,
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when part and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CP,
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when part and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CP,
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when part and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CP,
                        '+x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when part and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CP,
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when part and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CP,
                        x: '*{}'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            var CPRIV = sol.defCapsule({
                    x: function () {}
                });

            it('should verify private method and input could share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPRIV,
                        '> x': function () {}
                    });
                }).not.toThrowError();
            });

            it('should throw error when private method and output share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPRIV,
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when private method and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPRIV,
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when private method and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPRIV,
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when private method and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPRIV,
                        '+x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_METHODS_VISIBILITY));
            });

            it('should throw error when private method and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPRIV,
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when private method and data share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CPRIV,
                        x: []
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            var CD = sol.defCapsule({
                    x: {}
                });

            it('should throw error when data and input share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CD,
                        '> x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when data and output share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CD,
                        '< x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when data and hook share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CD,
                        hooks: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when data and loop share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CD,
                        loops: 'x'
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when data and public method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CD,
                        '+x': function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when data and private method share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CD,
                        x: function () {}
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });

            it('should throw error when data and part share the same name', function () {
                expect(function () {
                    sol.defCapsule({
                        base: CD,
                        x: C
                    });
                }).toThrowError(errorToRegExp(sol.Errors.DUPLICATE_NAME));
            });
        });
    });

    describe('not classified', function () {
        it('should throw error when def parameter is not an object', function () {
            expect(function () {
                sol.defCapsule(function () {});
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule('Not an object');
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
            expect(function () {
                sol.defCapsule([]);
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_ARGUMENT));
        });

        it('should create capsule constructor', function () {
            expect(
                sol.isCapsuleConstructor(
                    sol.defCapsule({}))).toBeTruthy();
        });
    });
    describe('instantiation', function () {
        it('should verify instantiation works the same way with or without new operator', function () {
            var C = sol.defCapsule({
                    '> doA': function () {
                        return 'Hello world'
                    }
                });

            expect(
                new C()).toBeDefined();

            expect(
                new C().doA() === 'Hello world').toBeDefined();

            expect(
                C()).toBeDefined();

            expect(
                C().doA() === 'Hello world').toBeDefined();
        });

        describe('part arguments', function () {
            it('should verify arguments property (arguments, args, deferredArgs) of part defintion object works', function () {
                var P = sol.defCapsule({
                        init: function (arg) {
                            this.setData('arg', arg);
                        },
                        '+ getArg': function () {
                            return this.getData('arg');
                        }
                    });

                var C1 = sol.defCapsule({
                        p: P,
                        '> getArg': 'p.getArg'
                    }),
                C2 = sol.defCapsule({
                        p: {
                            capsule: P
                        },
                        '> getArg': 'p.getArg'
                    }),
                C3 = sol.defCapsule({
                        p: {
                            capsule: P,
                            arguments: null
                        },
                        '> getArg': 'p.getArg'
                    }),
                C4 = sol.defCapsule({
                        p: {
                            capsule: P,
                            args: null
                        },
                        '> getArg': 'p.getArg'
                    }),
                C5 = sol.defCapsule({
                        p: {
                            capsule: P,
                            deferredArgs: function () {
                                return 2;
                            }
                        },
                        '> getArg': 'p.getArg'
                    });
                C6 = sol.defCapsule({
                        p: {
                            capsule: P,
                            arguments: 'this.args'
                        },
                        '> getArg': 'p.getArg'
                    });
                C7 = sol.defCapsule({
                        p: {
                            capsule: P,
                            args: 'this.args'
                        },
                        '> getArg': 'p.getArg'
                    });
                C8 = sol.defCapsule({
                        p: {
                            capsule: P,
                            deferredArgs: function () {
                                return 'this.args';
                            }
                        },
                        '> getArg': 'p.getArg'
                    });

                var c1 = new C1(1),
                c2 = new C2(1),
                c3 = new C3(1),
                c4 = new C4(1),
                c5 = new C5(1),
                c6 = new C6(1),
                c7 = new C7(1),
                c8 = new C8(1);

                expect(
                    c1.getArg()).toEqual(undefined);

                expect(
                    c2.getArg()).toEqual(undefined);

                expect(
                    c3.getArg()).toEqual(null);

                expect(
                    c4.getArg()).toEqual(null);

                expect(
                    c5.getArg()).toEqual(2);

                expect(
                    c6.getArg()).toEqual(1);

                expect(
                    c7.getArg()).toEqual(1);

                expect(
                    c8.getArg()).toEqual(1);
            });
        });

        describe('data functionality', function () {
            describe('static data', function () {
                it('should verify static data works for all instances', function () {
                    var C = sol.defCapsule({
                            myData: {
                                message: 'Hello World!'
                            },
                            '+getResult': function () {
                                return this.getData('myData').message;
                            },
                            '+setResult': function (newMessage) {
                                this.getData('myData').message = newMessage;
                            },
                            '+setNewObject': function () {
                                this.setData('myData', {
                                    message: 'Hello My World!'
                                });
                            }
                        });

                    var c1 = new C(),
                    c2 = new C();

                    expect(
                        c1.getResult() === 'Hello World!').toEqual(true);

                    expect(
                        c2.getResult() === 'Hello World!').toEqual(true);

                    c1.setResult('Hello World of Data!');

                    expect(
                        c1.getResult() === 'Hello World of Data!').toEqual(true);

                    expect(
                        c2.getResult() === 'Hello World of Data!').toEqual(true);

                    c1.setNewObject();

                    expect(
                        c1.getResult() === 'Hello My World!').toEqual(true);

                    expect(
                        c2.getResult() === 'Hello World of Data!').toEqual(true);
                });
            });

            describe('instance data', function () {
                it('should verify supported data types (object, array, map, set, weak map, weak set) work correctly', function () {
                    var C = sol.defCapsule({
                            myObject: '*{}',
                            myArray: '*[]',
                            myMap: '*Map',
                            mySet: '*Set',
                            myWeakMap: '*WeakMap',
                            myWeakSet: '*WeakSet',
                            '+getObject': function () {
                                return this.getData('myObject');
                            },
                            '+getArray': function () {
                                return this.getData('myArray');
                            },
                            '+getMap': function () {
                                return this.getData('myMap');
                            },
                            '+getSet': function () {
                                return this.getData('mySet');
                            },
                            '+getWeakMap': function () {
                                return this.getData('myWeakMap');
                            },
                            '+getWeakSet': function () {
                                return this.getData('myWeakSet');
                            },
                        });

                    var c = new C();

                    expect(
                        typeof c.getObject() === 'object').toEqual(true);

                    expect(
                        c.getArray()instanceof Array).toEqual(true);

                    expect(
                        c.getMap()instanceof Map).toEqual(true);

                    expect(
                        c.getSet()instanceof Set).toEqual(true);

                    expect(
                        c.getWeakMap()instanceof WeakMap).toEqual(true);

                    expect(
                        c.getWeakSet()instanceof WeakSet).toEqual(true);
                });

                it('should verify instance data works for all instances', function () {
                    var C = sol.defCapsule({
                            myData: '*{}',
                            '+getResult': function () {
                                return this.getData('myData').message;
                            },
                            '+setResult': function (newMessage) {
                                this.getData('myData').message = newMessage;
                            }
                        });

                    var c1 = new C(),
                    c2 = new C();

                    c1.setResult('Hello World!');

                    expect(
                        c1.getResult() === 'Hello World!').toEqual(true);

                    expect(
                        c2.getResult() == null).toEqual(true);

                    c2.setResult('Hello World of Data!');

                    expect(
                        c1.getResult() === 'Hello World!').toEqual(true);

                    expect(
                        c2.getResult() === 'Hello World of Data!').toEqual(true);
                });

                it('should verify instance data works for all instances (second form)', function () {
                    var C = sol.defCapsule({
                            myData: {
                                call: function () {
                                    return {};
                                }
                            },
                            '+getResult': function () {
                                return this.getData('myData').message;
                            },
                            '+setResult': function (newMessage) {
                                this.getData('myData').message = newMessage;
                            }
                        });

                    var c1 = new C(),
                    c2 = new C();

                    c1.setResult('Hello World!');

                    expect(
                        c1.getResult() === 'Hello World!').toEqual(true);

                    expect(
                        c2.getResult() == null).toEqual(true);

                    c2.setResult('Hello World of Data!');

                    expect(
                        c1.getResult() === 'Hello World!').toEqual(true);

                    expect(
                        c2.getResult() === 'Hello World of Data!').toEqual(true);
                });

                it('should verify instance data works for all instances (third form)', function () {
                    var C = sol.defCapsule({
                            myData: {
                                new: function () {
                                    return {};
                                }
                            },
                            '+getResult': function () {
                                return this.getData('myData').message;
                            },
                            '+setResult': function (newMessage) {
                                this.getData('myData').message = newMessage;
                            }
                        });

                    var c1 = new C(),
                    c2 = new C();

                    c1.setResult('Hello World!');

                    expect(
                        c1.getResult() === 'Hello World!').toEqual(true);

                    expect(
                        c2.getResult() == null).toEqual(true);

                    c2.setResult('Hello World of Data!');

                    expect(
                        c1.getResult() === 'Hello World!').toEqual(true);

                    expect(
                        c2.getResult() === 'Hello World of Data!').toEqual(true);
                });

                it('should verify instance data could be created using call/new and deferredArgs', function () {
                    var C = sol.defCapsule({
                            myData: {
                                call: function (p) {
                                    return {
                                        message: p
                                    };
                                },
                                deferredArgs: function (p) {
                                    return p;
                                }
                            },
                            '+getResult': function () {
                                return this.getData('myData').message;
                            },
                            '+setResult': function (newMessage) {
                                this.getData('myData').message = newMessage;
                            }
                        });

                    var c1 = new C('Hello World 1!'),
                    c2 = new C('Hello World 2!');

                    expect(
                        c1.getResult() === 'Hello World 1!').toEqual(true);

                    expect(
                        c2.getResult() === 'Hello World 2!').toEqual(true);

                    c2.setResult('new value');

                    expect(
                        c1.getResult() === 'Hello World 1!').toEqual(true);

                    expect(
                        c2.getResult() === 'new value').toEqual(true);
                });

                if (window) {
                    it('should verify call and new work differently', function () {
                        var F = function () {
                            return this;
                        };

                        var C1 = sol.defCapsule({
                                myData: {
                                    call: F
                                },
                                '+get': function () {
                                    return this.getData('myData');
                                }
                            });

                        var C2 = sol.defCapsule({
                                myData: {
                                    new: F
                                },
                                '+get': function () {
                                    return this.getData('myData');
                                }
                            });

                        var c1 = new C1(),
                        c2 = new C2();

                        expect(
                            c1.get() === window).toEqual(true);

                        expect(
                            c2.get() !== window).toEqual(true);
                    });
                }
            });
        });

        describe('wiring', function () {
            it('should verify wires are created as specified in defCapsule', function () {
                var C = sol.defCapsule({
                        '> doX': 'this.onThat',
                        '< onThat': function () {}
                    }),
                c = new C();
                c.onThat.target(function () {
                    return 'Hello world!';
                });

                expect(
                    c.doX() === 'Hello world!').toEqual(true);

                c.onThat.target(function () {
                    return 'Hello second world!';
                });

                expect(
                    c.doX()[0] === 'Hello world!').toEqual(true);

                expect(
                    c.doX()[1] === 'Hello second world!').toEqual(true);
            });
        });

        describe('!-labeled interface elements', function () {
            var C1,
            C2;
            beforeAll(function () {
                C1 = sol.defCapsule({
                        '> doA': function () {},
                        '< onC': function () {},
                        hooks: 'h1',
                        loops: 'l1'
                    });
                C2 = sol.defCapsule({
                        '> doB': function () {},
                        '< onD': function () {},
                        hooks: 'h2',
                        loops: 'l2'
                    });
            });

            it('should throw error when instantiating capsule with !-labeled operations that don\'t really exist', function () {
                var C = sol.defCapsule({
                        p1: C1,
                        p2: C2,
                        'p1.onC': 'p2.!missing'
                    });

                expect(function () {
                    new C();
                }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));

                C = sol.defCapsule({
                        p1: C1,
                        p2: C2,
                        'p1.!missing': 'p2.doB'
                    });

                expect(function () {
                    new C();
                }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));
            });

            it('should verify instantiating capsule with !-labeled operations that do exist does not throw error', function () {
                var C = sol.defCapsule({
                        '> x': 'p1.!doA',
                        '> y': function () {},
                        p1: C1,
                        p2: C2,
                        'p1.!onC': 'p2.!doB'
                    });

                expect(function () {
                    new C();
                }).not.toThrowError();
            });

            it('should throw error when instantiating capsule with !-labeled hooks and loops that don\'t really exist', function () {
                var C = sol.defCapsule({
                        p1: C1,
                        p2: C2,
                        'p1.h1': 'p2.!missing'
                    });

                expect(function () {
                    new C();
                }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));

                C = sol.defCapsule({
                        p1: C1,
                        p2: C2,
                        'p1.!missing': 'p2.l2'
                    });

                expect(function () {
                    new C();
                }).toThrowError(errorToRegExp(sol.Errors.ELEMENT_NOT_FOUND));
            });

            it('should verify instantiating capsule with !-labeled hooks and loops that do exist does not throw error', function () {
                var C = sol.defCapsule({
                        p1: C1,
                        p2: C2,
                        'p1.!h1': 'p2.!l2'
                    });

                expect(function () {
                    new C();
                }).not.toThrowError();
            });
        });

        it('should throw error when instantiating abstract capsule', function () {
            expect(function () {
                var A = sol.defCapsule({
                        isAbstract: true
                    });
                var a = new A();
            }).toThrowError(errorToRegExp(sol.Errors.ABSTRACT_INSTANTIATION));
        });
    });
});
