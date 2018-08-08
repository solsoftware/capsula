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

describe('inheritance', function () {
    var sol = window.capsula;

    function errorToRegExp(error) {
        return new RegExp(error.desc.replace(/\$\d/g, ".+").replace('(', '\\(').replace(')', '\\)'));
    }

    beforeAll(function () {});
    describe('instanceof', function () {
        var C1 = sol.defCapsule({}),
        C2 = sol.defCapsule({
                base: C1
            }),
        C3 = sol.defCapsule({
                base: C2
            });

        var c1 = new C1(),
        c2 = new C2(),
        c3 = new C3();

        it('should verify instanceof works with capsules as expected', function () {
            expect(
                c1 instanceof sol.Capsule &&
                c1 instanceof C1 &&
                !(c1 instanceof C2) &&
                !(c1 instanceof C3)).toBeTruthy();

            expect(
                c2 instanceof sol.Capsule &&
                c2 instanceof C1 &&
                c2 instanceof C2 &&
                !(c2 instanceof C3)).toBeTruthy();

            expect(
                c3 instanceof sol.Capsule &&
                c3 instanceof C1 &&
                c3 instanceof C2 &&
                c3 instanceof C3).toBeTruthy();
        });
    });

    describe('data', function () {
        var C1 = sol.defCapsule({
                data: {
                    message: 'Hello World!'
                },
                '+ getResult': function () {
                    return this.getData('data').message;
                }
            });

        var C21 = sol.defCapsule({
                base: C1
            });

        var C22 = sol.defCapsule({
                base: C1,
                data: {
                    message: 'Hello World of Data!'
                }
            });

        var C31 = sol.defCapsule({
                base: C21
            });

        var C32 = sol.defCapsule({
                base: C22
            });

        var c1 = new C1(),
        c21 = new C21(),
        c22 = new C22(),
        c31 = new C31(),
        c32 = new C32();

        it('should verify data inheritance works', function () {
            expect(
                c1.getResult() === 'Hello World!').toBeTruthy();

            expect(
                c21.getResult() === 'Hello World!').toBeTruthy();

            expect(
                c31.getResult() === 'Hello World!').toBeTruthy();
        });

        it('should verify data overriding works', function () {
            expect(
                c22.getResult() === 'Hello World of Data!').toBeTruthy();

            expect(
                c32.getResult() === 'Hello World of Data!').toBeTruthy();
        });
    });

    describe('parts', function () {
        var CA = sol.defCapsule({
                '> input': function (value) {
                    return this.getChar() + value + this.getChar();
                },
                getChar: function () {
                    return '#';
                }
            });

        var CB = sol.defCapsule({
                base: CA,
                getChar: function () {
                    return '$';
                }
            });

        var C1 = sol.defCapsule({
                p: CA,
                '> process': function (value) {
                    return this.p.input(value);
                },
                '+ getPartsNum': function () {
                    return this.getParts().length;
                }
            });

        var C2 = sol.defCapsule({
                base: C1,
                p: CB // let's override part p with CB instance instead of CA
            });

        var C3 = sol.defCapsule({
                base: C1
            });

        var c1 = new C1(),
        c2 = new C2(),
        c3 = new C3();

        it('should verify parts inheritance works', function () {
            expect(
                c1.process('hello') === '#hello#').toBeTruthy();

            expect(
                c3.process('hello') === '#hello#').toBeTruthy();
        });

        it('should verify parts overriding works', function () {
            expect(
                c2.process('hello') === '$hello$').toBeTruthy();
        });

        it('should verify that overriding does not just add new part, but actually replaces the overridden part', function () {
            expect(
                c1.getPartsNum() === 1).toBeTruthy();

            expect(
                c2.getPartsNum() === 1).toBeTruthy();

            expect(
                c3.getPartsNum() === 1).toBeTruthy();
        });
    });

    describe('public and private methods', function () {
        it('should throw error when visibility of a method is modified (reduced)', function () {
            var C = sol.defCapsule({
                    '+ x': function () {
                        return 'Hello world!';
                    }
                });

            expect(function () {
                sol.defCapsule({
                    base: C,
                    x: function () {
                        return 'Hello overriden world!';
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_METHODS_VISIBILITY));
        });

        it('should throw error when visibility of a method is modified (extended)', function () {
            var C = sol.defCapsule({
                    x: function () {
                        return 'Hello world!';
                    }
                });

            expect(function () {
                sol.defCapsule({
                    base: C,
                    '+ x': function () {
                        return 'Hello overriden world!';
                    }
                });
            }).toThrowError(errorToRegExp(sol.Errors.ILLEGAL_METHODS_VISIBILITY));
        });

        it('should verify overrriding works with private methods', function () {
            var C1 = sol.defCapsule({
                    x: function () {
                        return 'Hello world!';
                    },
                    '+ getResult': function () {
                        return this.x();
                    }
                });

            var C2 = sol.defCapsule({
                    base: C1,
                    x: function () {
                        return 'Hello overriden world!';
                    }
                });

            expect(new C1().getResult() === 'Hello world!').toBeTruthy();
            expect(new C2().getResult() === 'Hello overriden world!').toBeTruthy();
        });

        it('should verify overrriding works with public methods', function () {
            var C1 = sol.defCapsule({
                    '+ x': function () {
                        return 'Hello world!';
                    }
                });

            var C2 = sol.defCapsule({
                    base: C1,
                    '+ x': function () {
                        return 'Hello overriden world!';
                    }
                });

            expect(new C1().x() === 'Hello world!').toBeTruthy();
            expect(new C2().x() === 'Hello overriden world!').toBeTruthy();
        });
    });

    describe('superior', function () {
        var C1 = sol.defCapsule({
                '> x': function () {
                    return this.getData('result');
                }
            });

        var C2 = sol.defCapsule({
                base: C1,
                x: function () {
                    return this.superior().x.call(this);
                }
            });

        var C3 = sol.defCapsule({
                base: C2,
                x: function () {
                    return this.superior().x.call(this);
                }
            });

        var C4 = sol.defCapsule({
                base: C3,
                x: function () {
                    return this.superior().x.call(this);
                },
                init: function () {
                    this.setData('result', 'OK');
                },
            });

        it('should verify superior returns the correct prototype object', function () {
            var c = new C4();
            expect(c.x() === 'OK').toBeTruthy();
        });
    });

    describe('default init', function () {
        it('should verify default init is called when init is not specified', function () {
            var C1 = sol.defCapsule({
                    init: function () {
                        this.x = new sol.Input(function () {
                                return 'Hello';
                            });
                        this.x.setName('x');
                    }
                });

            var C2 = sol.defCapsule({
                    base: C1
                });

            var C3 = sol.defCapsule({
                    base: C2
                });

            expect(
                new C2().x() === 'Hello').toBeTruthy();

            expect(
                new C3().x() === 'Hello').toBeTruthy();
        });

        it('should verify default init is NOT called when init is specified', function () {
            var C1 = sol.defCapsule({
                    init: function () {
                        this.x = new sol.Input(function () {
                                return 'Hello';
                            });
                        this.x.setName('x');
                    }
                });

            var C2 = sol.defCapsule({
                    base: C1,
                    init: function () {
                        this.x = new sol.Input(function () {
                                return 'World';
                            });
                        this.x.setName('x');
                    }
                });

            var C3 = sol.defCapsule({
                    base: C2
                });

            expect(
                new C2().x() === 'World').toBeTruthy();

            expect(
                new C3().x() === 'World').toBeTruthy();
        });

        it('should verify default init does nothing for root (baseless) capsules', function () {
            var C1 = sol.defCapsule({});

            var C2 = sol.defCapsule({
                    base: C1
                });

            var C3 = sol.defCapsule({
                    base: C2
                });

            expect(function () {
                new C1();
            }).not.toThrowError();

            expect(function () {
                new C2();
            }).not.toThrowError();

            expect(function () {
                new C3();
            }).not.toThrowError();
        });
    });
});
