## How to contribute?

First of all, thank you very much for your time and willingness to participate in this project. Welcome :)

The project is at very early stage of development, as you may guess. Still, we feel this is the moment to show it to the world.

At this stage, the most valuable contribution would be to provide us with both positive and negative feedback on this project. We know instruction materials are scarce at this point, so we do not expect too much. However, any sort of feedback or usage experience is highly appreciated. We will do our best to document as many things as possible and to create tutorials and help pages. Until then, users and contributors would have to rely on API reference (`doc/index.html`) and also on our direct help. Do not hesitate to contact us.

A contribution roadmap that sets direction for further development is to be expected by the end of the June 2018 on this very page.

Additional information for contributors are given in the following lines of this document.

## Issues

Use [Github issues](https://github.com/solsoftware/capsula/issues) to report problems, suggest improvements, etc.

## Source

All modules are located in `src` folder. To create new modules, make sure you put them there.

## Files

This project's files are placed into the following folders:

- `config` - configuration (for contributors)
- `dist` - minified files
- `doc` - documentation
- `draw.io` - source files for images used in documentation
- `jasmine` - tests
- `src` - source code
- `static` - static files that JSDoc uses to generate documentation
- `sandbox` - web project example (for getting started quickly and easily)

## Tests

Tests have been developed using Jasmine: https://jasmine.github.io/index.html

To run tests for capsula module open any of the `jasmine/capsula-*.html` files in your web browser.

Before running tests for services module start the `server.js` (within node) from the root directory:

```
node jasmine/spec/server/server.js 
```

or (in debug mode): <br> 

```
node --inspect jasmine/spec/server/server.js 
```

Then just open `jasmine/services.html` in your web browser.

To run tests for html module open `jasmine/html.html` in your web browser.

To develop more tests open and edit the following files: <br>
`jasmine/spec/capsula-*.js` (for capsula module) <br>
`jasmine/spec/services.js` (for services module; don't forget to turn the server.js on) <br>
`jasmine/spec/html.js` (for html module)

To create your own custom matchers put them in `jasmine/spec/helpers.js`

In case of services module, you may want to modify server-side script which is located here: `jasmine/spec/server/server.js`

## Documentation

Documentation (API reference) has been developed using [JSDoc](http://usejsdoc.org/). Drawings have been developed using [draw.io](https://www.draw.io/).

The "source" of documentation is in the source files, i.e. in the `src` folder. Source (.xml) for drawings is in the `draw.io` folder, while the drawings (png) themselves are in the `static/img` folder.

To generate documentation delete all files from the doc folder and then run the following (from the root directory):

```
jsdoc src -c config/jsdoc/config.json src/README.md
```

To change the layout of documentation files modify `config/jsdoc/layout.tmpl`

To change styling (CSS) of documentation files modify `config/jsdoc/custom.tmpl`

To change configuration of JSDoc modify `config/jsdoc/config.json`

## Code Formatting

The source code is formatted using JSTool for Notepad++ (default configuration), version 1.21.6.0.

## Dist

The source code is minified using JSTool for Notepad++ (default configuration), version 1.21.6.0. The minified files are placed in the `dist` folder.

## Sandbox

For a quick start, just copy the contents of the `sandbox` folder into the root folder of your web app and open the `index.html` file from your web browser ("Hello world"). The source code for the "Hello world" example is in the `sandbox/scripts/main.js` file.

## Release Procedure

Once modifications to the project are sufficient enough to publish a new release, perform the following final steps to make that happen:

1. Format the (modified) source code according to the formatting rules (see [Code Formatting](#code-formatting)).
2. Copy all .js files from `src` folder to `jasmine/src`.
3. Run all the tests (see [Tests](#tests)) and verify that everything works as expected. All tests should pass. If that is the case, continue with this procedure. Otherwise, perform all the necessary corrections and restart this procedure.
4. Copy all .js files from `src` folder to `sandbox/scripts/lib folder`.
5. Generate minified files (see [Dist](#dist)) and place them into the `dist` folder.
6. Generate documentation (see [Documentation](#documentation)).
7. Increase the version in `package.json` file according to the rules of [semantic versioning](https://semver.org/).
8. Commit and push all changes.
9. Create git tag: `git tag -a vX.Y.Z -m 'version X.Y.Z'` and then don't forget to push it: `git push capsula --tags`. Add release notes if necessary.
10. Create npm release by running the: `npm publish --access public` from the root folder.
11. Brag about it.