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

describe('HTML', function () {

    const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

    function errorToRegExp(error) {
        return new RegExp(error.desc.replace(/\$\d/g, ".+").replace('(', '\\(').replace(')', '\\)'));
    }

    beforeAll(function () {
        // pollyfill for IE
        (function () {
            if (typeof window.CustomEvent === "function")
                return false;
            function CustomEvent(event, params) {
                params = params || {
                    bubbles: false,
                    cancelable: false,
                    detail: undefined
                };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }
            CustomEvent.prototype = window.Event.prototype;
            window.CustomEvent = CustomEvent;
        })();
    });

    describe('Text', function () {
        it('should throw error when instantiating Text using illegal arguments', function () {
            expect(function () {
                new html.Text();
            }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                new html.Text(null);
            }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                new html.Text({});
            }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                new html.Text(1);
            }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

            expect(function () {
                new html.Text([]);
            }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));
        });

        it('should verify Text is created from String', function () {
            expect(function () {
                new html.Text('Hello world!');
            }).not.toThrowError();
        });

        it('should verify Text is created from an existing Text node', function () {
            expect(function () {
                new html.Text(document.createTextNode('Hello world!'));
            }).not.toThrowError();
        });

        it('should verify text\'s output operations (given in constructor) are working', function (done) {
            var txt = new html.Text('Hello world!', ['DOMCharacterDataModified']);
            txt.DOMCharacterDataModified.wire(function (e) {
                expect(e.type).toEqual('DOMCharacterDataModified');
                done();
            });
            txt.setText('Hello modified world!');
        });

        it('should create Text as a wrapper of a newly created DOM text node', function () {
            var txt = new html.Text('Hello world!');
            expect(txt.getTextNode()instanceof Text).toBe(true);
            expect(txt.getTextNode().nodeValue).toEqual('Hello world!');
        });

        it('should verify getText is working', function () {
            var txt = new html.Text('Hello world!');
            expect(txt.getText()).toEqual('Hello world!');
        });

        it('should verify setText is working', function () {
            var txt = new html.Text('Hello world!');
            expect(txt.getText()).toEqual('Hello world!');
            txt.setText('Hello modified world!');
            expect(txt.getText()).toEqual('Hello modified world!');
        });

        it('should verify Text could be tied', function () {
            var txt = new html.Text('Hello world!'),
            el = new html.Element('div');
            el.hook.hook(txt.loop);

            expect(el.getInnerHTML()).toEqual('Hello world!');
            expect(el.getElement().outerHTML).toEqual('<div>Hello world!</div>');

            txt.setText('Hello modified world!');

            expect(el.getInnerHTML()).toEqual('Hello modified world!');
            expect(el.getElement().outerHTML).toEqual('<div>Hello modified world!</div>');
        });

        it('should verify text\'s added output operations are working', function (done) {
            var txt = new html.Text('Hello world!');
            txt.addEventOutput('DOMCharacterDataModified');
            txt.DOMCharacterDataModified.wire(function (e) {
                expect(e.type).toEqual('DOMCharacterDataModified');
                done();
            });
            txt.setText('Hello modified world!');

            var txt2 = new html.Text('Hello world!');
            txt2.addEventOutput('DOMCharacterDataModified', 'charModified');
            txt2.charModified.wire(function (e) {
                expect(e.type).toEqual('DOMCharacterDataModified');
                done();
            });
            txt2.setText('Hello modified world!');
        });
    });

    describe('HasRootHTML', function () {

        describe('getElement()', function () {
            it('should verify getElement is working', function () {
                var el = new html.Element('div');
                expect(el.getElement()instanceof Element && el.getElement()instanceof Node).toBe(true);
            });
        });

        describe('getId()', function () {
            it('should verify getId is working', function () {
                var el = new html.Element('div');
                el.getElement().id = 'xyz';
                expect(el.getId()).toEqual('xyz');
            });
        });

        describe('setId(id)', function () {
            it('should verify setId is working', function () {
                var el = new html.Element('div');
                el.setId('xyz');
                expect(el.getElement().id).toEqual('xyz');
            });
        });

        describe('getAttribute(attrName)', function () {
            it('should verify getAttribute is working', function () {
                var el = new html.Element('div');
                el.getElement().setAttribute('class', 'xyz');
                expect(el.getAttribute('class')).toEqual('xyz');
            });
        });

        describe('setAttribute(attrName, attrValue)', function () {
            it('should verify setAttribute is working', function () {
                var el = new html.Element('div');
                el.setAttribute('class', 'xyz');
                expect(el.getElement().getAttribute('class')).toEqual('xyz');
            });
        });

        describe('removeAttribute(attrName)', function () {
            it('should verify removeAttribute is working', function () {
                var el = new html.Element('div');
                el.setAttribute('class', 'xyz');
                expect(el.getElement().getAttribute('class')).toEqual('xyz');
                el.removeAttribute('class');
                expect(el.getElement().getAttribute('class')).toBe(null);
            });
        });

        describe('hasAttribute(attrName)', function () {
            it('should verify removeAttribute is working', function () {
                var el = new html.Element('div');
                expect(el.hasAttribute('class')).toBe(false);
                el.setAttribute('class', 'xyz');
                expect(el.hasAttribute('class')).toBe(true);
            });
        });

        describe('getProperty(propName)', function () {
            it('should verify getProperty is working', function () {
                var el = new html.Element('div');
                expect(el.getProperty('enabled')).toBe(undefined);
                el.getElement().enabled = true;
                expect(el.getProperty('enabled')).toEqual(true);
            });
        });

        describe('setProperty(propName, propValue)', function () {
            it('should verify setProperty is working', function () {
                var el = new html.Element('div');
                el.setProperty('enabled', true);
                expect(el.getElement().enabled).toBe(true);
            });
        });

        describe('getStyle(styleName)', function () {
            it('should verify getStyle is working', function () {
                var el = new html.Element('div');
                expect(el.getStyle('display')).toEqual('');
                el.getElement().style.display = 'none';
                expect(el.getStyle('display')).toEqual('none');
            });
        });

        describe('setStyle(styleName, styleValue)', function () {
            it('should verify setStyle is working', function () {
                var el = new html.Element('div');
                el.setStyle('display', 'none');
                expect(el.getElement().style.display).toEqual('none');
            });
        });

        describe('addClass(className)', function () {
            it('should verify addClass is working', function () {
                var el = new html.Element('div');
                el.addClass('xyz');
                expect(el.getElement().classList.contains('xyz')).toBe(true);
            });
        });

        describe('removeClass(className)', function () {
            it('should verify removeClass is working', function () {
                var el = new html.Element('div');
                el.addClass('xyz');
                expect(el.getElement().classList.contains('xyz')).toBe(true);
                el.removeClass('xyz');
                expect(el.getElement().classList.contains('xyz')).toBe(false);
            });
        });

        describe('hasClass(className)', function () {
            it('should verify hasClass is working', function () {
                var el = new html.Element('div');
                expect(el.hasClass('xyz')).toBe(false);
                el.addClass('xyz');
                expect(el.hasClass('xyz')).toBe(true);
                el.removeClass('xyz');
                expect(el.hasClass('xyz')).toBe(false);
            });
        });

        describe('getInnerHTML()', function () {
            it('should verify getInnerHTML is working', function () {
                var template = new html.Template('<div loop="myLoop"><div>Hello World!</div></div>'),
                el = new html.Element('div');
                el.hook.hook(template.myLoop);
                expect(el.getInnerHTML()).toEqual('<div><div>Hello World!</div></div>'); // loop="myLoop" should be removed
            });
        });

        describe('setInnerHTML(innerHTML)', function () {
            it('should verify setInnerHTML is working', function () {
                var innerHTML = '<div><div>Hello World!</div></div>',
                el = new html.Element('div');
                el.setInnerHTML(innerHTML);
                expect(el.getElement().innerHTML).toEqual(innerHTML);
            });
        });

        describe('getTagName()', function () {
            it('should verify getTagName is working', function () {
                var el1 = new html.Element('div'),
                el2 = new html.Element(SVG_NAMESPACE, 'rect'),
                el3 = new html.Element(document.createElement('label'));
                expect(el1.getTagName()).toEqual('DIV'); // in HTML tagName returned is in uppercase
                expect(el2.getTagName()).toEqual('rect');
                expect(el3.getTagName()).toEqual('LABEL'); // in HTML tagName returned is in uppercase
            });
        });
    });

    describe('Element', function () {

        describe('new Element(tagNameOrNamespaceOrElement, opt_tagNameOrEventOutputs, opt_eventOutputs)', function () {
            it('should throw error when instantiating Element using illegal arguments', function () {
                // no args
                expect(function () {
                    new html.Element();
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                // one argument
                expect(function () {
                    new html.Element(null);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element({});
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(1);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element([]);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                // two arguments
                expect(function () {
                    new html.Element('div', {});
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element({}, 'div');
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element('div', 3);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(3, 'div');
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(document.createElement('div'), {});
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(document.createElement('div'), 5);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element({}, document.createElement('div'));
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(5, document.createElement('div'));
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                // three arguments
                expect(function () {
                    new html.Element(SVG_NAMESPACE, 'rect', {});
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(SVG_NAMESPACE, 'rect', 4);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(SVG_NAMESPACE, 'rect', [null]);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(SVG_NAMESPACE, 'rect', [{}
                        ]);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(SVG_NAMESPACE, 'rect', [1]);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Element(SVG_NAMESPACE, 'rect', [[]]);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));
            });

            it('should create Element as a wrapper of the DOM element', function () {
                expect(function () {
                    new html.Element(document.createElement('div'));
                }).not.toThrowError();

                expect(function () {
                    new html.Element(document.createElement('div'), ['click']);
                }).not.toThrowError();
            });

            it('should create Element as a wrapper of a newly created DOM element', function () {
                expect(function () {
                    new html.Element('div');
                }).not.toThrowError();

                expect(function () {
                    new html.Element('div', ['click']);
                }).not.toThrowError();
            });

            it('should create Element as a wrapper of a newly created SVG element', function () {
                expect(function () {
                    new html.Element(SVG_NAMESPACE, 'rect');
                }).not.toThrowError();

                expect(function () {
                    new html.Element(SVG_NAMESPACE, 'rect', ['click']);
                }).not.toThrowError();
            });

            it('should verify HTMLElement is created', function () {
                var htmlElement = new html.Element('div');
                expect(htmlElement.getElement()instanceof HTMLElement).toBe(true);
            });

            it('should verify SVGElement is created', function () {
                var svgElement = new html.Element(SVG_NAMESPACE, 'rect');
                expect(svgElement.getElement()instanceof SVGElement).toBe(true);
            });

            it('should verify element\'s output operations (given in constructor) are working', function (done) {
                var btn = new html.Element('button', ['click', 'dblclick']);
                btn.click.wire(function (e) {
                    expect(e.type).toEqual('click');
                    btn.getElement().dispatchEvent(new CustomEvent('dblclick'));
                });
                btn.dblclick.wire(function (e) {
                    expect(e.type).toEqual('dblclick');
                    done();
                });
                btn.getElement().dispatchEvent(new CustomEvent('click'));
            });
        });

        describe('addEventOutput(type)', function () {
            it('should verify element\'s added output operations are working', function (done) {
                var btn = new html.Element('button');
                btn.addEventOutput('click');
                btn.addEventOutput('dblclick', 'doubleClick');
                btn.click.wire(function (e) {
                    expect(e.type).toEqual('click');
                    btn.getElement().dispatchEvent(new CustomEvent('dblclick'));
                });
                btn.doubleClick.wire(function (e) {
                    expect(e.type).toEqual('dblclick');
                    done();
                });
                btn.getElement().dispatchEvent(new CustomEvent('click'));
            });
        });
    });

    describe('Template', function () {

        describe('new Template(template)', function () {
            it('should throw error when instantiating Template using illegal arguments', function () {
                // no args
                expect(function () {
                    new html.Template();
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                // one argument
                expect(function () {
                    new html.Template(null);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Template({});
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Template(1);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));

                expect(function () {
                    new html.Template([]);
                }).toThrowError(errorToRegExp(html.Errors.ILLEGAL_ARGUMENT));
            });

            it('should verify Template could be instantiated with regular arguments', function () {
                expect(function () {
                    new html.Template('');
                }).not.toThrowError();

                expect(function () {
                    new html.Template('Hello World!');
                }).not.toThrowError();

                expect(function () {
                    new html.Template('<div>Hello World!</div>');
                }).not.toThrowError();
            });
        });

        describe('Loops', function () {

            var t = new html.Template('<div loop="myLoop1">1</div><div loop="myLoop2">2</div><div loop="myLoop3">3</div>');

            it('should verify loops are being created as expected', function () {
                expect(capsula.isLoop(t.myLoop1)).toBe(true);
                expect(capsula.isLoop(t.myLoop2)).toBe(true);
                expect(capsula.isLoop(t.myLoop3)).toBe(true);
            });

            it('should verify creted loops are working as expected', function () {
                var el = new html.Element('div');
                el.hook.hook(t.myLoop3, t.myLoop2, t.myLoop1);
                expect(el.getInnerHTML()).toEqual('<div>3</div><div>2</div><div>1</div>');
            });
        });

        describe('Hooks', function () {
            var t = new html.Template('<div hook="myHook1" loop="myLoop1"></div><div loop="myLoop2"><div hook="myHook2"></div></div><div hook="myHook3" loop="myLoop3"></div>');

            it('should verify hooks are being created as expected', function () {
                expect(capsula.isHook(t.myHook1)).toBe(true);
                expect(capsula.isHook(t.myHook2)).toBe(true);
                expect(capsula.isHook(t.myHook3)).toBe(true);
            });

            it('should verify creted hooks are working as expected', function () {
                var container = new html.Element('div'),
                el1 = new html.Element('div'),
                el2 = new html.Element('div'),
                el3 = new html.Element('div');
                el1.setInnerHTML('1');
                el2.setInnerHTML('2');
                el3.setInnerHTML('3');
                t.myHook1.hook(el1.loop);
                t.myHook2.hook(el2.loop);
                t.myHook3.hook(el3.loop);
                container.hook.hook(t.myLoop1, t.myLoop2, t.myLoop3);
                expect(container.getInnerHTML()).toEqual('<div><div>1</div></div><div><div><div>2</div></div></div><div><div>3</div></div>');
            });
        });

        describe('Input operations', function () {

            describe('Properties', function () {

                var t = new html.Template('<div prop="setMyProp" getprop="getMyProp"></div>');

                it('should verify input operations are being created as expected', function () {
                    expect(capsula.isOperation(t.setMyProp)).toBe(true);
                    expect(capsula.isOperation(t.getMyProp)).toBe(true);
                });

                it('should verify creted operations are working as expected', function () {
                    t.setMyProp('id', 'xyz');
                    expect(t.getMyProp('id')).toEqual('xyz');
                });
            });

            describe('Attributes', function () {
                var t = new html.Template('<div attr="setMyAttr" getattr="getMyAttr"></div>');

                it('should verify input operations are being created as expected', function () {
                    expect(capsula.isOperation(t.setMyAttr)).toBe(true);
                    expect(capsula.isOperation(t.getMyAttr)).toBe(true);
                });

                it('should verify creted operations are working as expected', function () {
                    t.setMyAttr('class', 'xyz');
                    expect(t.getMyAttr('class')).toEqual('xyz');
                });
            });

            describe('Elements', function () {
                var t = new html.Template('<div id="outer" get="getOuter"><div id="inner" get="getInner"></div></div>');

                it('should verify input operations are being created as expected', function () {
                    expect(capsula.isOperation(t.getOuter)).toBe(true);
                    expect(capsula.isOperation(t.getInner)).toBe(true);
                });

                var outer = t.getOuter(),
                inner = t.getInner();
                it('should verify creted operations are working as expected', function () {
                    expect(outer.id).toEqual('outer');
                    expect(inner.id).toEqual('inner');
                });
            });
        });

        describe('Output operations', function () {

            describe('Events', function () {
                var t = new html.Template('<button loop="yesLoop" output="onClickYes" on="click">YES</button><button loop="noLoop" output="onClickNo" on="click">NO</button>');

                it('should verify output operations are being created as expected', function () {
                    expect(capsula.isOperation(t.onClickYes)).toBe(true);
                    expect(capsula.isOperation(t.onClickNo)).toBe(true);
                });

                it('should verify creted operations are working as expected', function (done) {
                    var el = new html.Element('div');
                    el.hook.hook(t.yesLoop, t.noLoop);
                    t.onClickNo.wire(function (e) {
                        el.getElement().children[0].dispatchEvent(new CustomEvent('click')); // click YES
                    });
                    t.onClickYes.wire(function (e) {
                        expect(e.type).toBe('click');
                        done();
                    });
                    el.getElement().children[1].dispatchEvent(new CustomEvent('click')); // click NO
                });
            });
        });
    });
});
