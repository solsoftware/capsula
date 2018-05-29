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

describe('static functions', function () {
    var sol = window.capsula;

    function errorToRegExp(error) {
        return new RegExp(error.desc.replace(/\$\d/g, ".+").replace('(', '\\(').replace(')', '\\)'));
    }

    beforeAll(function () {});

    describe('isCapsule(object)', function () {
        it('should return false when object is not a capsule instance', function () {
            expect(sol.isCapsule(2)).toBeFalsy();
            expect(sol.isCapsule('not a capsule instance')).toBeFalsy();
            expect(sol.isCapsule({})).toBeFalsy();
            expect(sol.isCapsule(function () {})).toBeFalsy();
            expect(sol.isCapsule(
                    sol.defCapsule({}))).toBeFalsy();
            expect(sol.isCapsule(
                    (new(sol.defCapsule({
                                '> m1': function () {}
                            }))).m1)).toBeFalsy();
            expect(sol.isCapsule(
                    (new(sol.defCapsule({
                                '< onX': function () {}
                            }))).onX)).toBeFalsy();
            expect(sol.isCapsule(
                    (new(sol.defCapsule({
                                hooks: 'hook'
                            }))).hook)).toBeFalsy();
            expect(sol.isCapsule(
                    (new(sol.defCapsule({
                                loops: 'loop'
                            }))).loop)).toBeFalsy();
        });

        it('should return true when object is a capsule instance', function () {
            expect(sol.isCapsule(
                    new(sol.defCapsule({})))).toBeTruthy();
            var C = sol.defCapsule({});
            expect(sol.isCapsule(
                    (new(sol.defCapsule({
                                p: C
                            }))).p)).toBeTruthy();
        });
    });

    describe('isCapsuleConstructor(object)', function () {
        it('should return false when object is not a capsule class', function () {
            expect(sol.isCapsuleConstructor(2)).toBeFalsy();
            expect(sol.isCapsuleConstructor('not a capsule class')).toBeFalsy();
            expect(sol.isCapsuleConstructor({})).toBeFalsy();
            expect(sol.isCapsuleConstructor(function () {})).toBeFalsy();
            expect(sol.isCapsuleConstructor(
                    (new(sol.defCapsule({
                                '> m1': function () {}
                            }))).m1)).toBeFalsy();
            expect(sol.isCapsuleConstructor(
                    (new(sol.defCapsule({
                                '< onX': function () {}
                            }))).onX)).toBeFalsy();
            expect(sol.isCapsuleConstructor(
                    (new(sol.defCapsule({
                                hooks: 'hook'
                            }))).hook)).toBeFalsy();
            expect(sol.isCapsuleConstructor(
                    (new(sol.defCapsule({
                                loops: 'loop'
                            }))).loop)).toBeFalsy();
            expect(sol.isCapsuleConstructor(
                    new(sol.defCapsule({})))).toBeFalsy();
        });

        it('should return true when object is a capsule class', function () {
            expect(sol.isCapsuleConstructor(
                    sol.defCapsule({}))).toBeTruthy();
        });
    });

    describe('isOperation(object)', function () {
        it('should return false when object is not an operation', function () {
            expect(sol.isOperation()).toBeFalsy();
            expect(sol.isOperation(null)).toBeFalsy();
            expect(sol.isOperation(2)).toBeFalsy();
            expect(sol.isOperation('not a capsule')).toBeFalsy();
            expect(sol.isOperation({})).toBeFalsy();
            expect(sol.isOperation(function () {})).toBeFalsy();
            expect(sol.isOperation(
                    sol.defCapsule({}))).toBeFalsy();
            expect(sol.isOperation(
                    new(sol.defCapsule({})))).toBeFalsy();
            expect(sol.isOperation(
                    (new(sol.defCapsule({
                                hooks: 'hook'
                            }))).hook)).toBeFalsy();
            expect(sol.isOperation(
                    (new(sol.defCapsule({
                                loops: 'loop'
                            }))).loop)).toBeFalsy();
        });

        it('should return true when object is an operation', function () {
            expect(sol.isOperation(
                    (new(sol.defCapsule({
                                '> m1': function () {}
                            }))).m1)).toBeTruthy();
            expect(sol.isOperation(
                    (new(sol.defCapsule({
                                '< onX': function () {}
                            }))).onX)).toBeTruthy();
        });
    });

    describe('isHook(object)', function () {
        it('should return false when object is not a hook', function () {
            expect(sol.isHook(2)).toBeFalsy();
            expect(sol.isHook('not a hook')).toBeFalsy();
            expect(sol.isHook({})).toBeFalsy();
            expect(sol.isHook(function () {})).toBeFalsy();
            expect(sol.isHook(
                    sol.defCapsule({}))).toBeFalsy();
            expect(sol.isHook(
                    new(sol.defCapsule({})))).toBeFalsy();
            expect(sol.isHook(
                    (new(sol.defCapsule({
                                '> m1': function () {}
                            }))).m1)).toBeFalsy();
            expect(sol.isHook(
                    (new(sol.defCapsule({
                                '< onX': function () {}
                            }))).onX)).toBeFalsy();
            expect(sol.isHook(
                    (new(sol.defCapsule({
                                loops: 'loop'
                            }))).loop)).toBeFalsy();
        });

        it('should return true when object is a hook', function () {
            expect(sol.isHook(
                    (new(sol.defCapsule({
                                hooks: 'hook'
                            }))).hook)).toBeTruthy();
        });
    });

    describe('isLoop(object)', function () {
        it('should return false when object is not a loop', function () {
            expect(sol.isLoop(2)).toBeFalsy();
            expect(sol.isLoop('not a loop')).toBeFalsy();
            expect(sol.isLoop({})).toBeFalsy();
            expect(sol.isLoop(function () {})).toBeFalsy();
            expect(sol.isLoop(
                    sol.defCapsule({}))).toBeFalsy();
            expect(sol.isLoop(
                    new(sol.defCapsule({})))).toBeFalsy();
            expect(sol.isLoop(
                    (new(sol.defCapsule({
                                '> m1': function () {}
                            }))).m1)).toBeFalsy();
            expect(sol.isLoop(
                    (new(sol.defCapsule({
                                '< onX': function () {}
                            }))).onX)).toBeFalsy();
            expect(sol.isLoop(
                    (new(sol.defCapsule({
                                hooks: 'hook'
                            }))).hook)).toBeFalsy();
        });

        it('should return true when object is a loop', function () {
            expect(sol.isLoop(
                    (new(sol.defCapsule({
                                loops: 'loop'
                            }))).loop)).toBeTruthy();
        });
    });
});
