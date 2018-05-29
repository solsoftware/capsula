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

describe('context', function () {
    var sol = window.capsula;

    function errorToRegExp(error) {
        return new RegExp(error.desc.replace(/\$\d/g, ".+").replace('(', '\\(').replace(')', '\\)'));
    }

    beforeAll(function () {});

    describe('public and private methodes', function () {
        it('should throw error when calling private method anywhere from the outside', function () {
            var C1 = sol.defCapsule({
                    privateMethod: function () {
                        return 'Hello world';
                    }
                });

            var C2 = sol.defCapsule({
                    c1: C1
                });

            var C3 = sol.defCapsule({
                    c2: C2
                });

            expect(function () {
                var c1 = new C1();
                c1.privateMethod();
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));

            expect(function () {
                var c2 = new C2();
                c2.c1.privateMethod();
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));

            expect(function () {
                var c3 = new C3();
                c3.c2.c1.privateMethod();
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));
        });

        it('should throw error when calling private method inside out', function () {
            var C1 = sol.defCapsule({
                    init: function (parentCapsule) {
                        this.setData('parent', parentCapsule);
                    },
                    '+x': function () {
                        this.getData('parent').privateMethod();
                    }
                });

            var C2 = sol.defCapsule({
                    c1: {
                        capsule: C1,
                        deferredArgs: function () {
                            return this;
                        }
                    },
                    '> x': 'c1.x',
                    privateMethod: function () {}
                });

            var c2 = new C2();
            expect(function () {
                c2.x();
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));
        });

        it('should throw error when calling public method far from the outside', function () {
            var C1 = sol.defCapsule({
                    '+publicMethod': function () {
                        return 'Hello world';
                    }
                });

            var C2 = sol.defCapsule({
                    c1: C1
                });

            var C3 = sol.defCapsule({
                    c2: C2
                });

            expect(function () {
                var c2 = new C2();
                c2.c1.publicMethod();
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));

            expect(function () {
                var c3 = new C3();
                c3.c2.c1.publicMethod();
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));
        });

        it('should throw error when calling public method inside out', function () {
            var C1 = sol.defCapsule({
                    init: function (parentCapsule) {
                        this.setData('parent', parentCapsule);
                    },
                    '+x': function () {
                        this.getData('parent').publicMethod();
                    }
                });

            var C2 = sol.defCapsule({
                    c1: {
                        capsule: C1,
                        deferredArgs: function () {
                            return this;
                        }
                    },
                    '> x': 'c1.x',
                    '+publicMethod': function () {}
                });

            var c2 = new C2();
            expect(function () {
                c2.x();
            }).toThrowError(errorToRegExp(sol.Errors.OUT_OF_CONTEXT));
        });

        it('should verify private method could be called from the inside and public method from the owner capsule (outside)', function () {
            var C = sol.defCapsule({
                    privateMethod: function (s1, s2) {
                        return 'Hello world' + s1 + s2;
                    },
                    '+ publicMethod': function (s1, s2) {
                        return this.privateMethod(s1, s2);
                    }
                });

            var c = new C();

            expect(
                c.publicMethod(' ', 'of capsules') === 'Hello world of capsules').toBeTruthy();
        });

        it('should verify public method could be called from the inside', function () {
            var C = sol.defCapsule({
                    '+ x': function (s) {
                        return 'Hello world ' + s;
                    },
                    '+ y': function (s) {
                        return this.x(s);
                    }
                });

            var c = new C();

            expect(
                c.y('of capsules') === 'Hello world of capsules').toBeTruthy();
        });
    });
});
