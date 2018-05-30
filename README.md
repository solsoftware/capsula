# Capsula
**Capsula** is a JavaScript library for building user interfaces and other types of event-driven applications using truly encapsulated software components called *capsules*.

## Getting started

Install **Capsula** using npm.

```
npm i @solsoftware/capsula
```

At this point, Capsula consists of three modules: capsula (core module), services, and html. Module services does not have any dependencies. Module capsula depends on services module only, while the html module depends both on capsula and services modules. Module html also depends on the DOM API.

To start using capsula module, try:

```
var capsula = require('@solsoftware/capsula');

var C = capsula.defCapsule({ // new capsule class
	'> x': function(){
		return 'Hello world!';
	}
});

var c = new C(); // new capsule instance

console.log(c.x()); // Hello world!
```

then require services module to implement communication:

```
var services = require('@solsoftware/capsula/dist/services');
```

and finally, require html module if you want to build web pages (within web browser, of course):

```
var html = require('@solsoftware/capsula/dist/html');
```

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
