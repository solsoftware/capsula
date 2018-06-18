# Capsula
**Capsula** is a JavaScript library for building user interfaces and other types of event-driven applications using truly encapsulated software components called *capsules*.

In many ways capsules are similar to the typical [OO](https://en.wikipedia.org/wiki/Object-oriented_programming) classes. They support single inheritance model and polymorphism the way OO classes do. However, capsules differ from OO classes in many ways as well. They are dynamic the way JavaScript language is. Also, they employ rather novel encapsulation model and accommodate many new and powerful concepts designed to handle complexity and favour encapsulation, flexibility, and reuse.

In a typical OO encapsulation model, all public properties and methods of all living objects are accessible from anywhere in the code, only a reference to an object is needed. Since everything public is accessible, we have to carefully manage references to avoid our code becoming "spaghetti". And this may be a bit too difficult. Capsula proposes a restriction to the typical OO policy of access rights. The restriction is simple to understand and use while being rather effective. It comes down to this: "You access what you create."

Apart from the novel encapsulation model which is useful in any application domain, Capsula exhibits concepts specifically dedicated to the domain of user interfaces (or more generally, to domains where one of the tasks is to manage a hierarchy). These concepts are developed to decouple managing hierarchy from managing any other behavior. This brings lots of flexibility and improves capsules' reuse potential.

Duality of declarative and imperative programming styles is a reality when developing software nowadays. While imperative approach brings more flexibility, control, and easier debugging, declarative styles are more expressive, easier to use, and reduce number of bugs in the program. Capsula provides for both styles, letting the programmer decide when to use which of the two and when to combine them. Although syntactically different, artifacts developed using the two styles are semantically alike and could easily be combined and used together in Capsula.

It is quite usual for applications to have components that perform a communication based on request-response paradigm. Capsula library provides for decoupling clients from both specifics of the communication channel and the server and enables clients to be more powerful and yet independent and reusable.

Check the documentation to make yourself familiar with all the concepts vaguely described above.

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
    alert('Body clicked!');
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

## Release History

Visit [Github releases](https://github.com/solsoftware/capsula/releases) to browse release history.

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
