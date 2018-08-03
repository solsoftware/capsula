## How to contribute?

Thank you very much for your time and willingness to participate in this project. Welcome :)

The project is at very early stage of development, as you may guess. Still, we feel this is the moment to show it to the world.

At this stage, the most valuable contribution would be to provide us with both positive and negative feedback on this project. Any sort of feedback or usage experience is highly appreciated. Do not hesitate to contact us.

Also, check the [projects page](https://github.com/solsoftware/capsula/projects) to get informed on the status of development, plans, etc.

Additional information for contributors are given in the following lines of this document.

## Chat

To discuss anything related to contributions, try to reach us through our specialized contributions chat room:

[![Join the chat at https://gitter.im/capsula-js/Contributions](https://badges.gitter.im/capsula-js/Contributions.svg)](https://gitter.im/capsula-js/Contributions?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Issues

Use [Github issues](https://github.com/solsoftware/capsula/issues) to report problems, suggest improvements, etc.

## Source

All modules are located in `src` folder. To create new modules, make sure you put them there.

## Files

This project's files are placed into the following folders:

- `config` - configuration (for contributors)
- `dist` - minified files
- `docs` - documentation
- `draw.io` - source files for images used in documentation
- `jasmine` - tests
- `src` - source code
- `static` - static files that JSDoc uses to generate documentation
- `sandbox` - web project example (for getting started quickly and easily)

## Tests

Tests have been developed using Jasmine: https://jasmine.github.io/index.html.

To develop more tests edit the following files:

- `jasmine/spec/capsula-*.js` (for capsula module)
- `jasmine/spec/services.js` (for services module)
- `jasmine/spec/html.js` (for html module)

To create your own custom matchers put them in `jasmine/spec/helpers.js`.

In case of services module, you may want to modify server-side script which is located here: `jasmine/spec/server/server.js`.

Before running tests start the `server.js` (within node) from the root directory:

```
node jasmine/spec/server/server.js 
```

or (in debug mode):

```
node --inspect jasmine/spec/server/server.js 
```

To run tests against the source files:

```
grunt test
```

To compress source files and run tests against compressed files:

```
grunt testdist
```

To run tests (of source files - src folder) within web browser open any of the `jasmine/*.html` files in your web browser.

## Documentation

Documentation (API reference) has been developed using [JSDoc](http://usejsdoc.org/). Drawings have been developed using [draw.io](https://www.draw.io/).

The "source" of documentation is in the source files, i.e. in the `src` folder. Source (.xml) for drawings is in the `draw.io` folder, while the drawings (png) themselves are in the `static/img` folder.

To generate documentation:

```
grunt docs
```

To change the layout of documentation files modify `config/jsdoc/layout.tmpl`

To change styling (CSS) of documentation files modify `static/css/custom.css`

To change configuration of JSDoc modify `config/jsdoc/config.json`

## Code Formatting

The source code is formatted using JSTool for Notepad++ (default configuration), version 1.21.6.0.

## Dist

The source code is minified using grunt-contrib-uglify plugin. The minified files are placed in the `dist` folder. To minify source files (and perform tests against the minified files) run:

```
grunt testdist
```

## Release

Once modifications to the project are sufficient enough to publish new release, perform the following final steps to make that happen:

```
grunt release --relver=X.Y.Z
```

where X.Y.Z is a version number for the new release that you are making (should be according to the rules of [semantic versioning](https://semver.org/)).

Then, commit and push all changes. Make sure your commit is [frequent, descriptive, atomic, decentralized, and immutable](https://dev.to/sublimegeek/do-your-commits-pass-this-simple-test-4ak2).

Create git tag: 

```
git tag -a vX.Y.Z -m 'version X.Y.Z'
```

and then don't forget to push it: 

```
git push origin --tags
```

Add release notes if necessary.

Create npm release by running the following from the root folder: 

```
npm publish --access public
```

Brag about it.