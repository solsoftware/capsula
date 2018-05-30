# Capsula
**Capsula** is a JavaScript library for building user interfaces and other types of event-driven applications using truly encapsulated software components called *capsules*.

## Getting started

Install **Capsula** using npm.

```
npm i @solsoftware/capsula
```

At this point, Capsula comprises three modules: capsula (the core module), services, and html. More modules are coming soon.

### Using Capsula within your web browser

To start in a rather trivial way just take the following lines and put them into your web page:

```html
<script src="yourPathToCapsula/services.js"></script>
<script src="yourPathToCapsula/capsula.js"></script>
<script src="yourPathToCapsula/html.js"></script>
```

Otherwise, to require modules using RequireJS try:

```js
require(['capsula'], function (capsula) {
    ...
});
require(['html'], function (html) {
    ...
});
require(['services'], function (services) {
    ...
});
```

or all in one:

```js
requirejs(['services', 'capsula', 'html'], function (services, capsula, html) {
    ...
});
```

Now that you are ready, try the following "Hello world" examples:

```js
var C = capsula.defCapsule({ // new capsule class
        '> x': function () { // new input operation
            return 'Hello world!';
        }
    });
var c = new C(); // new capsule instance
console.log(c.x()); // Hello world!
```

To play with an existing html element:

```js
var bodyWrapper = new html.Element(document.body, ['click']);
bodyWrapper.click.target(function (e) {
    alert('Clicked!');
});
```

### Using Capsula with Node.js

To require core capsula module and services module try:

```js
var capsula = require('@solsoftware/capsula');
var services = require('@solsoftware/capsula/dist/services');
```

Module html is missing here, since it depends on the DOM API; i.e. it does not really work server side.

## Documentation

To browse documentation open follow the `doc/index.html` URL from the [project's home page](https://github.com/solsoftware/capsula).

## Contributing

Use [Github issues](https://github.com/solsoftware/capsula/issues) to report problems, suggest improvements, etc.

If you are willing to help further develop this project, please read the [our contribution guidelines](https://github.com/solsoftware/capsula/blob/master/CONTRIBUTING.md) file for all the details.

## Versioning

We use [semantic versioning](https://semver.org/).

## Maintainers

- [Zarko Mijailovic](mailto:zarko.mijailovic@sol.rs), SOL Software

## Code of Conduct
Please note that this project is released with a [Contributor Code of Conduct](https://github.com/solsoftware/capsula/blob/master/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Attributions

- Tests have been developed using Jasmine: [https://jasmine.github.io/index.html](https://jasmine.github.io/index.html)
- Documentation has been developed using JSDoc: [http://usejsdoc.org/](http://usejsdoc.org/)
- Drawings have been developed using draw.io: [https://www.draw.io/](https://www.draw.io/)

## License

Copyright (c) 2018 SOL Software. This software is licensed under the Apache-2.0 License.
