# Capsula
**Capsula** is a JavaScript library for building user interfaces and other types of event-driven applications using truly encapsulated software components called *capsules*.

## Documentation

To browse documentation open `doc/index.html` in your web browser.

## Contributing

If you are willing to help further develop this project, please read the [our contribution guidelines](CONTRIBUTING.md) file for all the details.

## Versioning

We use [semantic versioning](https://semver.org/).

## Files

This project's files are placed into the following folders:

- config: configuration (for contributors)
- dist: minified files
- doc: documentation
- draw.io: source files for images used in documentation
- jasmine: tests
- src: source code
- static: static files that JSDoc uses to generate documentation
- sandbox: web project example (for getting started quickly and easily)

## Running Tests

To run tests for capsula module open any of the `jasmine/capsula-*.html` files in your web browser.

Before running tests for services module start the server.js (within node) from the root directory:

```
node jasmine/spec/server/server.js 
```

or (in debug mode): 

```
node --inspect jasmine/spec/server/server.js 
```

Then just open `jasmine/services.html` in your web browser.

To run tests for html module open `jasmine/html.html` in your web browser.

## Maintainers

- [Zarko Mijailovic](mailto:zarko.mijailovic@sol.rs), SOL Software

## Code of Conduct
Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Attributions

- Tests have been developed using Jasmine: [https://jasmine.github.io/index.html](https://jasmine.github.io/index.html)
- Documentation has been developed using JSDoc: [http://usejsdoc.org/](http://usejsdoc.org/)
- Drawings are developed using draw.io: [https://www.draw.io/](https://www.draw.io/)

## License

Copyright (c) 2018 SOL Software. This software is licensed under the Apache-2.0 License.
