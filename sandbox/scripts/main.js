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

require.config({
    baseUrl: 'scripts/lib',
    waitSeconds: 5
});

requirejs(['capsula', 'html', 'services', 'sm'], function (capsula, html, services, sm) {

    var theSandbox = new capsula.ElementRef(document.getElementById('sandbox'));

    var C = capsula.defCapsule({
            loops: 'loop',

            p: {
                capsule: html.Element,
                args: ['div']
            },
            'this.loop': 'p.loop',

            init: function () {
                this.p.setInnerHTML('Hello world!');
            }
        });

    var c = new C();

    theSandbox.hook.tie(c.loop);
});
