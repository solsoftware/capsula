## How to contribute?

First of all, thank you very much for your time and willingness to participate in this project. Welcome :)

The project is at very early stage of development, as you may guess. Still, we feel this is the moment to show it to the world.

At this stage, the most valuable contribution would be to provide us with both positive and negative feedback on this project. We know instruction materials are scarce at this point, so we do not expect too much. However, any sort of feedback or usage experience is highly appreciated. We will do our best to document as many things as possible and to create tutorials and help pages. Until then, users and contributors would have to rely on API reference (`doc/index.html`) and also on our direct help. Do not hesitate to contact us.

Additional information for contributors are given in the following lines of this document.

## Source

All modules are located in src folder. To create new modules, make sure you put them there.

## Tests

Tests have been developed using Jasmine: https://jasmine.github.io/index.html

To run tests for capsula module open any of the `jasmine/capsula-*.html` files in your web browser.

Before running tests for services module start the server.js (within node) from the root directory:

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

The "source" of documentation is in the source files, i.e. in the `src` folder. Source (.xml) for drawings is in the draw.io folder, while the drawings (png) themselves are in the static/img folder.

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

The source code is minified using JSTool for Notepad++ (default configuration), version 1.21.6.0. The minified files are placed in the dist folder.

## Sandbox

For a quick start, just copy the contents of the sandbox folder into the root folder of your web app and open the index.html file from your web browser ("Hello world"). The source code for the "Hello world" example is in the sandbox/scripts/main.js file.

## New Release Procedure

1. Modify source code (src folder) or tests (jasmine and jasmine/spec folders) or anything else (documentation, drawings, configuration, etc.) which makes up your contribution.
2. Run all tests (see [Tests](#tests)) and verify that everything works as expected. All tests should pass. If that is the case, continue with this procedure. Otherwise, go back to the point 1 and do all the necessary corrections.
3. Format the source code according to the formatting rules (see [Code Formatting](#code-formatting)).
4. Copy all .js files from src folder to jasmine/src and sandbox/scripts/lib folders.
5. Generate minified files (see [Dist](#dist)) and place them into the dist folder.
6. Generate documentation (see [Documentation](#documentation)). 
7. Increase the version in package.json file according to the rules of [semantic versioning](https://semver.org/).