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

describe('error handling', function () {
    var sol = window.capsula;

    function errorToRegExp(error) {
        return new RegExp(error.desc.replace(/\$\d/g, ".+").replace('(', '\\(').replace(')', '\\)'));
    }

    describe('handle method', function () {
        it('should verify handle method catches the error', function () {
            var C = sol.defCapsule({
                    '+ throwsError': function () {
                        throw new Error('Something went wrong!');
                    },
                    handle: function (error) {}
                });

            var c = new C();

            expect(function () {
                c.throwsError();
            }).not.toThrowError();
        });

        it('should verify parent\'s capsule handle method catches the error', function () {
            var C = sol.defCapsule({
                    '+ throwsError': function () {
                        throw new Error('Something went wrong!');
                    }
                });

            var CNoHandle = sol.defCapsule({
                    p: C,
                    '> throwsError': 'p.throwsError'
                });

            var cnh = new CNoHandle();

            expect(function () {
                cnh.throwsError();
            }).toThrowError();

            var CHandle = sol.defCapsule({
                    base: CNoHandle,
                    handle: function (error) {}
                });

            var ch = new CHandle();

            expect(function () {
                ch.throwsError();
            }).not.toThrowError();
        });

        it('should verify the right handle method is called', function () {
            var C1 = sol.defCapsule({
                    name: 'C1',
                    '+ throwsError': function () {
                        throw new Error('Something went wrong!');
                    }
                });

            var C1H = sol.defCapsule({
                    name: 'C1H',
                    base: C1,
                    handle: function () {
                        return 1;
                    }
                });

            var C2 = sol.defCapsule({
                    name: 'C2',
                    p: C1,
                    h: C1H,
                    '> ip': 'p.throwsError',
                    '> ih': 'h.throwsError'
                });

            var C2H = sol.defCapsule({
                    name: 'C2H',
                    base: C2,
                    handle: function () {
                        return 2;
                    }
                });

            var C3 = sol.defCapsule({
                    name: 'C3',
                    p: C2,
                    h: C2H,
                    '> ipp': 'p.ip',
                    '> iph': 'p.ih',
                    '> ihp': 'h.ip',
                    '> ihh': 'h.ih'
                });

            var C3H = sol.defCapsule({
                    name: 'C3H',
                    base: C3,
                    handle: function () {
                        return 3;
                    }
                });

            var C4 = sol.defCapsule({
                    name: 'C4',
                    p: C3,
                    h: C3H,
                    '> ippp': 'p.ipp',
                    '> ipph': 'p.iph',
                    '> iphp': 'p.ihp',
                    '> iphh': 'p.ihh',
                    '> ihpp': 'h.ipp',
                    '> ihph': 'h.iph',
                    '> ihhp': 'h.ihp',
                    '> ihhh': 'h.ihh'
                });

            var C4H = sol.defCapsule({
                    name: 'C4H',
                    base: C4,
                    handle: function () {
                        return 4;
                    }
                });

            var c4 = new C4(),
            c4h = new C4H();

            expect(function () {
                c4.ippp();
            }).toThrowError();
            expect(
                c4.ipph()).toEqual(1);
            expect(
                c4.iphp()).toEqual(2);
            expect(
                c4.iphh()).toEqual(1);
            expect(
                c4.ihpp()).toEqual(3);
            expect(
                c4.ihph()).toEqual(1);
            expect(
                c4.ihhp()).toEqual(2);
            expect(
                c4.ihhh()).toEqual(1);
            expect(
                c4h.ippp()).toEqual(4);
            expect(
                c4h.ipph()).toEqual(1);
            expect(
                c4h.iphp()).toEqual(2);
            expect(
                c4h.iphh()).toEqual(1);
            expect(
                c4h.ihpp()).toEqual(3);
            expect(
                c4h.ihph()).toEqual(1);
            expect(
                c4h.ihhp()).toEqual(2);
            expect(
                c4h.ihhh()).toEqual(1);
        });

        it('should verify recursion happens when handle throws error unconditionally', function () {
            var C = sol.defCapsule({
                    '+ throwsError': function () {
                        throw new Error('Something went wrong!');
                    },
                    handle: function () {
                        throw new Error('Something went wrong in handle!');
                    }
                });

            var c = new C();

            expect(function () {
                c.throwsError();
            }).toThrowError();
        });
    });
});
