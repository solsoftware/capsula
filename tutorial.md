---
layout: page
title: Tutorial
permalink: /tutorial/
order: 1
nav: true
---

- [What Is Capsula?](#what-is-capsula)
- [Installation](#installation)
	- [Node.js](#nodejs)
	- [RequireJS](#requirejs)
	- [Plain Old Script Tag](#plain-old-script-tag)
	- [Hello World](#hello-world)
- [Main Concepts](#main-concepts)
	- [Introducing Capsules](#introducing-capsules)
	- [Encapsulation Model](#encapsulation-model)
- [Working With Capsules](#working-with-capsules)
	- [Creating Capsule Class](#creating-capsule-class)
	- [Instantiating Capsules](#instantiating-capsules)
	- [Constructor](#constructor)
	- [Parts](#parts)
	- [Inheritance](#inheritance)
- [Implementing Behavior](#implementing-behavior)
	- [Methods](#methods)
	- [Operations](#operations)
	- [Error Handling](#error-handling)
- [Building User Interfaces](#building-user-interfaces)
	- [Object-Oriented Approach](#object-oriented-approach)
	- [Working with Templates](#working-with-templates)
- [Asynchronous RPC Communication](#asynchronous-rpc-communication)
	- [Performing AJAX Calls](#performing-ajax-calls)
	- [Other Types Of RPC](#other-types-of-rpc)
	- [Custom RPC Types](#custom-rpc-types)
- [Protected State](#protected-state)

## What Is Capsula?

**Capsula** library lets you build JavaScript applications using highly reusable, flexible, and encapsulated software components called "capsules". With Capsula you can:

- create your application out of **encapsulated components** - capsules.
- have **multi-level architectural views** of your application.
- be **both declarative and imperative** having the best of both worlds. Artifacts developed either way speak the same language and could seamlessly be combined and used together.
- **increase flexibility** of your UI components by managing layout and behavior in quite a unique way.
- **handle asynchronous communication** focusing only on what's essential.
- exploit **really fast dev cycle** of plain JavaScript; no transpiling in the process.

In other words, Capsula is a sort of dynamic, general-purpose, [object-oriented](https://en.wikipedia.org/wiki/Object-oriented_programming) "language" that accommodates many new and powerful concepts designed to handle complexity and favor abstraction, encapsulation, flexibility, and reuse. 

Capsula is quite suitable for building user interfaces. It provides both for templates and object-oriented way of widget manipulation. By default, Capsula supports building web UIs (relies on the DOM API), however this can be changed by extending it to work with any other JavaScript widget API, both client- or server-side.

Capsula also addresses asynchronous communication based on the client-server (request-response) paradigm. It provides for decoupling clients from technical details of communication and enables programmers to deal with substantial matters only, as well as to easily mock server-side part of communication.

Applications built with Capsula are neatly structured, ease to manage, and with clearly visible multi-level architecture.

Capsula is still under construction, so many more interesting things are yet to come. Keep following.

## Installation

Capsula library is executable both within the browser and Node.js. At this point it comprises three modules:

- capsula,
- services, and
- html.

In the following lines we explain how to install Capsula in both of the two environments.

### Node.js

Install Capsula using npm:

```
npm i @solsoftware/capsula
```

Require capsula modules:

```js
var capsula = require('@solsoftware/capsula');
var services = require('@solsoftware/capsula/dist/services');
var html = require('@solsoftware/capsula/dist/html');
```

Have in mind that html module depends on the DOM API.

### RequireJS

To require modules using RequireJS try:

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

### Plain old script tag

To start in a rather trivial way just take the following lines and put them into your web page:

```html
<script src="yourPathToCapsula/services.js"></script>
<script src="yourPathToCapsula/capsula.js"></script>
<script src="yourPathToCapsula/html.js"></script>
```

### Hello World

Assuming you have successfully installed Capsula let's try the following "Hello world" example:

```js
var HelloWorld = capsula.defCapsule({ // new capsule class
    init: function(){ // init: keyword for constructor
        console.log('Hello World!');
    }
});
var example = new HelloWorld(); // new capsule instance, console: Hello world!
```

---

In all the code used throughout this tutorial, we use references ```capsula```, ```services```, and ```html``` to refer to root (exported) objects of capsula, services, and html modules, respectively.

---

## Main Concepts

This section explains the main concepts and ideas behind Capsula library.

### Introducing Capsules

The base concept of Capsula library is *Capsule* class. Capsule class encapsulates a piece of application logic. Encapsulated logic can be anything at all: UI-related or not. Capsule's logic is composed out of other capsules and/or a bit of it's own logic. This way, the hierarchy of capsules forms multiple architectural layers of application.

Capsule class is a simple OO class with special features / properties.

A capsule is not a widget per se. However, a capsule may represent a widget, what's more, it may represent a group of (usually related) widgets, with their layout fixed inside the capsule or left unspecified (this brings lot's of flexibility!).

In many ways capsules are similar to the typical OO classes. They support single inheritance model and polymorphism the way OO classes do. However, capsules differ from OO classes in many ways as well. They are dynamic the way JavaScript language is. They employ rather novel encapsulation model and provide many new and powerful concepts.

Capsule may have multiple properties. There are five types of capsule properties: parts, operations, methods, hooks, and loops. Properties can either be public or protected. Private properties are not supported.

The *part* is a property of a capsule. It represents child capsule. Child capsule is always created in the context of its parent and accessible only from within that context. That is essential premise of Capsula's encapsulation model. Parts are protected properties.

The *operation* is capsule's property that acts like a method, only more powerful. It can be used as a regular method, however operation adds support for asynchronous calls, declarative wiring to other operations to specify propagation of calls, arguments filtering, etc. Operations are public properties.

The method is capsule's property that behaves as anyone would imagine, that is, as a simple JavaScript method. Methods can be either public or protected.

Hooks and loops provide capsules with a special support for managing widgets and layout in a flexible way. Hooks and loops are always public.

In accordance with the principle of information hiding, capsules can store protected data; the data they work with or operate on.

When creating a capsule class, one must define which and how many of these properties should be present in it. Once created, capsule class cannot be modified afterwards. All instances of that class would then have the properties as defined in the class. However, once an instance of capsule class is created, it can be dynamically modified (by adding new properties for example, or removing existing ones); just as anyone would expect from a JavaScript object.

Table bellow specifies characteristics of capsule properties (like: are they visible?, do they get inherited?, and are they dynamically addable / removable in runtime?):

<table>
<thead><tr><td></td><th>visibility</th><th>inheritable</th><th>addable</th><th>removable</th></tr></thead>
<tbody><tr><th>part</th><td>protected</td><td>true</td><td>true</td><td>true</td></tr>
<tr><th>operation</th><td>public</td><td>true</td><td>true</td><td>false</td></tr>
<tr><th>method</th><td>protected or public</td><td>true</td><td>false</td><td>false</td></tr>
<tr><th>hook</th><td>public</td><td>true</td><td>true</td><td>false</td></tr>
<tr><th>loop</th><td>public</td><td>true</td><td>true</td><td>false</td></tr>
</tbody></table>

Behind its interface made up of operations, public methods, hooks, and loops, capsules hide:

- parts 
- the way parts' and capsule's operations are connected (wired) between one another, 
- the way parts' and capsule's hooks and loops are connected (tied) between one another, 
- protected methods (i.e. protected behavior), and 
- protected data.

### Encapsulation Model

As already stated, Capsule is a class similar to an OO class with different encapsulation model. In a typical OO encapsulation model, all public properties and methods of all living objects are accessible from anywhere in the code, only a reference to an object is needed. Since everything public is accessible, we have to carefully manage references to avoid our code becoming "spaghetti". And this may be a bit too difficult.

To understand the policy of our encapsulation model, it is fundamentally important to understand the notion of *the current context of execution*. The current context of execution is specified with respect to the given point in time and it always represents a capsule (instance):

> For the given point in time t and the given capsule instance x, x is the current context of execution at t, if and only if the call stack at t lists a method of x and no method of capsule instance other than x deeper in the call stack.

In other words, "this" reference of the deepest method (that belongs to a capsule) in the call stack determines the current context of execution. If there is no such a method, there is a default "main" capsule that acts as a top-level context.

If x is the current context of execution, we informally say that "we are in the context of x".

Now with respect to that, Capsula proposes a restriction to the typical OO policy of access rights. The restriction is simple to understand and use while being rather effective. It is defined by the following two: 

a) the code executing in the context of capsule instance x (e.x. executing a method of x) is allowed to access public properties of capsule instance y if and only if y is created (instantiated) in the context of x, that is, if and only if y is part (child) of x.

b) the code executing in the context of capsule instance x is allowed to access protected properties of capsule instance y if and only if y is actually x.

In other words, the policy boils down to this:

> At any point in time, the code executing in the context of capsule x is only allowed to use (access, call) public properties of part capsules of capsule x and protected properties of capsule x itself.

"Out of context" error is thrown when trying to use properties against these rules.

## Working With Capsules

### Creating Capsule Class

To create an empty capsule class:

```js
var Section = capsula.defCapsule({}); // {} is the capsule definition object
```

### Instantiating Capsules

To instantiate capsule use the new operator and function returned from the call to defCapsule:

```js
var section = new Section();
```

In this case, section capsule implicitly becomes a part of the capsule which represents the current context of execution.

### Constructor

Let's add constructor function to the Section capsule (class).

```js
var Section = capsula.defCapsule({
    init: function(title){ // init is the keyword
        this.title = title;
    }
});
```

Instantiating Section would now look like this:

```js
var section = new Section('Hello World!');
```

### Parts

Now, let's create Page capsule with a single main section inside:

```js
var Page = capsula.defCapsule({
    main: Section
});

var page = new Page(); // creates both page and inner section capsule
```

Here, the section capsule is *part* of the page capsule. Page capsule is therefore the *owner* of the section capsule.

Now, assuming every Section requires title to be set immediately, let's create Page capsule with respect to that:

```js
var Page = capsula.defCapsule({
    main: {
        capsule: Section,
        args: 'Hello World!' // or return array for multiple arguments
    }
});
```

The same result would be achieved this way as well:

```js
var Page = capsula.defCapsule({
    init: function(){
        this.main = new Section('Hello World!');
    }
});
```

It is very important to note that the main section object becomes part of the page capsule not because of placing it into *this.main*, but because of the fact that it has been instantiated in the context of the page capsule (in this case, in the page capsule's constructor). So, references to parts are not relevant when access rules are enforced. What is relevant is to whom the capsule belongs as a part and that is defined by the current context of execution in the moment of instantiation.

Have in mind that parts are instantiated first (if they exist) and the constructor is called afterwards.

At this point, every page would have a main section with 'Hello World!' title. Let's make that configurable:

```js
var Page = capsula.defCapsule({
    init: function(title){
        // deliberately empty
    },
    main: {
        capsule: Section,
        args: 'this.args' // 'this.args' tells that page arguments should be used here
    }
});
```

Now we can instantiate Page like this, and the inner section would get its constructor argument properly:

```js
var page = new Page('Tutorial');
```

Finally, part arguments can be calculated at the instantiation point in time using function:

```js
var Page = capsula.defCapsule({
    main: {
        capsule: Section,
        deferredArgs: function(pageNumber, title){ // page arguments are provided here
            return title; // or return array for multiple arguments
        }
    }
});
```

Now, this:

```js
var page = new Page(3, 'Tutorial');
```

would create inner main section with 'Tutorial' title.

### Inheritance

As expected, Capsule class may extend another capsule class. Single-inheritance model is supported.

```js
var Article = capsula.defCapsule({
    base: Section
});
```

The Article capsule inherits all the properties and methods of the Section capsule. Also, it may decide to call the super-type's constructor from within its own constructor:

```js
var Article = capsula.defCapsule({
    base: Section,
    init: function(title, date){
        this.superior().init.call(this, title);
        this.date = date;
    }
});
```

Super-type's constructor would not be called implicitly, so if you need it, make sure to call it as shown above.

It is also possible to create abstract capsule (class):

```js
var Container = capsula.defCapsule({
    isAbstract: true
});

var c = new Container(); // Error: Oops! Abstract capsules cannot be instantiated...
```

## Implementing Behavior

There are many ways to implement dynamic parts of your application. Let's go one step at a time.

### Methods

Let's create a capsule (class) with two methods, one public and one protected:

```js
var Article = capsula.defCapsule({
    base: Section,
    init: function(title, date){
        this.superior().init.call(this, title);
        this.date = date;
    },
    calcAge: function(){ // protected method
        return Math.round((new Date() - this.date) / (1000 * 60 * 60 * 24));
    },
    '+ getAge': function(){ // + means public method
        return this.calcAge();
    }
});
```

The protected method is calcAge, the public one is getAge. Now, let's try the following:

```js
var article = new Article('Tutorial', new Date('May 7, 2018'));
console.log(article.getAge() + ' days');
```

Great. The console logs article's age in days, which is fine. If however we try:

```js
article.calcAge(); // Error: Oops! Make sure you do this in the right context.
```

the error is raised since we are calling protected method from the outside of the article capsule context.

### Operations

Now let's go further and explain operations. Operation is capsule's public property. It is like a method but more powerful. 

Firstly, unlike regular methods, operations can be called (invoked) both in synchronous and in asynchronous way. 

Secondly, operations can be bound (both declaratively and imperatively) to one another and to methods, to specify propagation of calls. Binding operations is called wiring; bindings are called wires.

Thirdly, operation can either be input or output. Input operation serves as a propagator of calls from the outside towards the inside of the capsule that owns the operation. Output operation does the opposite, it serves as a propagator of calls from the inside towards the outside of its owner capsule.

Finally, there are other features that are specific to operations: enabling / disabling them, setting filters, etc.

Let's reach out for examples starting with input operations:

```js
var Page = capsula.defCapsule({
    '> addComment': function(comment, user){ // > means input operation
        // ...
    }
});

var page = new Page();
page.addComment('This looks good.', 'userX'); // calling an input operation
```

Now let's introduce output operation to signal changes inside the page to the outside world.

```js
var Page = capsula.defCapsule({
    '< onChange': function(changeDescription){}, // < means output operation
    '> addComment': function(comment, user){
        // ...
        this.onChange('comment added'); // calling an output operation
    }
});
```

The following should be noted here. *onChange* operation has empty body since it is unknown inside the page capsule what should happen on change. Basically, it is just a signal for the page's exterior. The body would simply be ignored even if wasn't empty. The function is used there just to specify output operation's signature (however, if you wish not to specify it, simply use null instead of a function). So, all output operations have empty body.

But, if the body is empty, what happens when we call output operation? Well, that depends on what operations, methods, or functions the output operation is wired to. For example:

```js
var page = new Page();
page.onChange.wire(function(changeDescription){ // wiring to a function
    console.log(changeDescription);
});

page.addComment('This looks good.', 'userX'); // console: 'comment added'
```

In the example above, *onChange* is wired to a simple function. However, it could be wired to an input operation or method of another sibling capsule, or even to an output operation of the owner capsule. The wiring here is done imperatively, by calling the wire method of output operation. However, the wiring of operations could be done declaratively as well:

```js
var Article = capsula.defCapsule({
    '> addComment': function(comment, user){
        // ...
        console.log('Adding comment...');
    }
});

var Page = capsula.defCapsule({
    main: Article,
    '> addComment': 'main.addComment' // or use array when wiring multiple targets
});

var page = new Page();
page.addComment('New comment', 'me'); // console: Adding comment...
```

If however, we need in addition to do something with the comment inside the page capsule itself, we can simply do the following:

```js
var Page = capsula.defCapsule({
    main: Article,
    '> addComment': function(comment, user){
        // ...
        console.log('Additional...');
    },
    'this.addComment': 'main.addComment'
});

var page = new Page();
page.addComment('New comment', 'me'); // console: Additional... Adding comment...
```

In this case, the *addComment* input operation of page capsule is wired to both method of page capsule and to input operation *addComment* of the article capsule. Hence, it could be said that *addComment* operation of page capsule is source, while *addComment* operation of article capsule and the method of page capsule are both targets in the wiring of page capsule.

Obviously, each source operation could be wired to many targets. Similarly, each target operation (or method, or function) could be wired to many source operations. A method or function can only act as a target when being wired. Wiring of operations is either done declaratively or by calling methods on operations themselves (see wire, source, target, and all related methods from there).

#### Operation Result

As shown above, operation calls are propagated according to the wiring. Wiring network ends where operations are wired to methods. The methods make the final combined effect of an operation call. The result of calling an operation is a combined result of all operation calls downstream. The result of calling an operation is: 

a) an array of method results, if there is more than one downstream method,

b) a method result, if there is only one downstream method (this is by default, but can be changed to return array, see setUnpackResult), 

c) undefined, if there are no downstream methods.

#### Asynchronous Invocation

Calling and operation the same way as calling a regular JavaScript method means synchronous call. That means control is returned to the caller once all of the downstream operations and methods are executed. There is however an asynchronous way of calling an operation. This is done by using the operation's send method:

```js
page.addComment.send('New comment', 'me').then(function(result){
    // processing result...
});
```

Call to send returns Promise object which allows for handling the results in both successful and erroneous use cases. In case of an asynchronous operation call, the control is returned to the caller immediately and propagation of calls is done in asynchronous manner at some point in future.

### Error Handling

Support for error handling in capsules comes down to this. The handle method in capsule class would be called each time an error is thrown in the context of that capsule:

```js
var Page = capsula.defCapsule({
    handle: function(err){
        console.log(err.message);
    },
    '> addComment': function(comment, user){
        throw new Error('failed');
    }
});

var page = new Page();
page.addComment('New comment', 'me'); // console: failed
```

Make sure you don't have errors popping out of handle method, since that would produce an endless recursion.

## Building User Interfaces

Apart from the novel encapsulation model which is useful in any application domain, Capsula exhibits concepts specifically dedicated to the domain of user interfaces. These concepts are developed to decouple managing hierarchy of widgets from managing any other behavior.

Capsula allows engineers to combine mutually interacting widgets into a larger components (capsules) without necessarily gluing them together in terms of layout. This enables creating extremely rich and complex components that have very high reuse potential.

Capsula provides both object-oriented and template-based way of building user interfaces. Anyhow, the same concepts are used in both ways. Let's say a few words on these concepts first and then proceed to explaining both of the supported ways of building user interfaces.

In the Capsula library, widget hierarchy is built by managing hierarchies of hooks and loops instead of dealing with widgets directly.

Hook is a public property of a capsule. It is a representation of parent widget in the parent-child relationship. Loop is also a public property of a capsule. Unlike hook which represents parent widget, loop is a representation of child widget in the parent-child relationship. 

A capsule may have as many hooks and as many loops as necessary. Hence, a capsule may represent more than one parent widget and more than one child widget, all at the same time. 

### Object-Oriented Approach

To work with DOM elements in an object-oriented way, we've provided Element capsule in the html module. Basically, it's a wrapper capsule for DOM elements and can be used either to wrap an existing DOM element or to create a new one (and wrap it).

Element capsule has one loop named *loop*. This loop enables wrapped DOM element to be included on the page (as a child of another DOM element); in other words, this loop represents wrapped DOM element as a child widget. 

Element capsule has one hook named *hook*. This hook enables wrapped DOM element to include other DOM elements inside itself (as its children); in other words, this hook represents wrapped DOM element as a parent widget.

Element capsule also has many public methods that enable us to work with wrapped element's attributes, properties, CSS classes, inner HTML, etc.

To create new HTML (DOM) element and new Element capsule as its wrapper:

```js
// using tag name
var div = new html.Element('div');
```

To create new Element capsule to wrap an existing DOM element:

```js
var div = new html.Element(document.getElementById('myDiv'));
```

Now let's create one button and put it inside the div:

```js
var button = new html.Element('button');
button.setInnerHTML('Open');
div.hook.tie(button.loop);
```

Note that instead of adding one capsule to another, here we've added a loop of one capsule to a hook of another. This is because in general a capsule may represent more that one widget and we have to specify exactly what goes whare. Hooks and loops are being added using the tie method. We call this tying while connections we call ties.

Now, let's add a bit of interaction to this example.

```js
button.addEventOutput('click'); // let's listen for click event

var dialog = new html.Element('dialog'); // create a dialog element
dialog.setInnerHTML('This is a dialog!');
div.hook.tie(dialog.loop); // add dialog to the div

button.click.wire(function(){ // open the dialog handler
    dialog.setAttribute('open');
});
```

So now we have a div with two interacting widgets inside. Let's try to encapsulate all this into a *ShowInfo* capsule that accepts info message as a constructor parameter that should appear inside the dialog.

```js
var ShowInfo = capsula.defCapsule({
    loops: 'root', // this is the loop that would represent inner div as a child
    init: function(message){
        var div = new html.Element('div'); // creates a part
        var button = new html.Element('button'); // creates a part
        button.setInnerHTML('Open');
        button.addEventOutput('click');
        div.hook.tie(button.loop);
        var dialog = new html.Element('dialog'); // creates a part
        dialog.setInnerHTML(message);
        div.hook.tie(dialog.loop);
        button.click.wire(this.clickHandler);
        div.loop.tie(this.root); // this is how div gets represented by the root loop
    },
    clickHandler: function(){
        this.dialog.setAttribute('open');
    }
});

var info = new ShowInfo('Have a nice day.');
info.root.render(document.body); // let's put our capsule into the page body
```

Here, the click handler is created as a protected method of ShowInfo capsule, representing a sort of its internal behavior.

Now, the same thing could be achieved in a much more declarative way:

```js
var ShowInfo = capsula.defCapsule({
    loops: 'root',
    div: {
        capsule: html.Element,
        args: 'div'
    },
    button: {
        capsule: html.Element,
        args: ['button', ['click']] // reacts on click event
    },
    dialog: {
        capsule: html.Element,
        args: 'dialog'
    },
    init: function(message){
        this.button.setInnerHTML('Open');
        this.dialog.setInnerHTML(message);
    },
    'div.hook': ['button.loop', 'dialog.loop'],
    'this.root': 'div.loop',
    'button.!click': 'this.clickHandler',
    clickHandler: function(){
        this.dialog.setAttribute('open');
    }
});

var info = new ShowInfo('Have a nice day.');
info.root.render(document.body);
```

As show above, creating parts, tying hooks and loops, and wiring operations (and methods in this case) can all be done in a declarative way.

Also note that making the button listen to click events could be done during construction either as shown above where args property contains additional array of events, or in case of imperative construction like this:

```js
let button = new html.Element('button', ['click']); // more events could be added
```

Whether being a fan of imperative or declarative style, at this point you have the ShowInfo capsule encapsulating two interacting widgets. However, the ShowInfo capsule specifies not only how the two widgtes interact, but also how they are positioned in terms of layout. That's not really flexible.

Let's try to keep interaction encapsulated while leaving the layout of interacting widgets unspecified. We no longer need the div part, since we are not going to render button and dialog inside it. We are going to leave the layout decisions outside of the ShowInfo capsule.

```js
var ShowInfo = capsula.defCapsule({
    loops: ['buttonLoop', 'dialogLoop'], // two loops: one for button, one for dialog
    button: {
        capsule: html.Element,
        args: ['button', ['click']]
    },
    dialog: {
        capsule: html.Element,
        args: 'dialog'
    },
    init: function(message){
        this.button.setInnerHTML('Open');
        this.dialog.setInnerHTML(message);
    },
    'this.buttonLoop': 'button.loop', // tying the button to the buttonLoop
    'this.dialogLoop': 'dialog.loop', // tying the dialog to the dialogLoop
    'button.!click': 'this.clickHandler',
    clickHandler: function(){
        this.dialog.setAttribute('open');
    }
});

var info = new ShowInfo('Have a nice day.');

// now, let's decide where to put button and dialog
info.dialogLoop.render(document.getElementById('div1'));
info.buttonLoop.render(document.getElementById('div2'));
```

Now we have our ShowInfo capsule much more flexible, since it only encapsulates interaction, while the layout of its parts is left for someone else (who is using ShowInfo capsule) to decide. This is the core idea behind the mechanism of hooks and loops.

The mechanism of hooks and loops enables us to decide which layout decisions we want to make inside a capsule and which to leave out of it. This enables us to increase complexity of capsules while preserving the capsule's potential to be reused, because in user interface development most of inflexibility comes from fixing the layout of your components inside.

### Working with Templates

To build portions of user interface using templates, we've provided Templae capsule in the html module. 

Template capsule provides means to easily reuse portions of HTML code enriched with a bit of behavior. It introduces HTML-based templates to the capsules code. By doing so, it provides a coupling between capsules and HTML code and allows for making a perfect mix of template-based and object-oriented code, i.e. for having the benefits of both worlds.

Template capsule helps in situations when creating a portion of user interface is easier using templates over object-orientation. Still, the template capsule preserves semantics of capsules and acts as any other capsule with input and output operations, hooks, and loops which makes it easy to combine with other capsules. In other words, the world of templates and the world of capsules are perfectly compatible and semantically coupled.

Template capsule is easily instantiated from the portion of HTML code: 

```js
var template = new html.Template(`<div>HTML code here</div>`);
```

The HTML code of your template may have more root elements (tags), i.e. there is no requirement for it to be rooted in a single HTML element.

The HTML code used for instantiating Template capsule may have special attributes, i.e. attribute-based extensions for hooks, loops, and operations. This is a) to enable template sections (root tags) to be included somewhere on the HTML page, b) to enable template to include other HTML content under its tags, and c) to enrich the template with a bit of behavior.

Initially, the Template capsule has no methods, operations, hooks, or loops. However it dynamically creates them during instantiation, depending on how the abovementioned attribures are being used within the template.

The following attributes of HTML elements (tags) inside the template are supported:

- attribute *loop* - HTML element (tag) having loop="myLoop" attribute would be represented by a loop named "myLoop" of the Template capsule. For example, HTML code ```<div loop="myLoop">...</div>``` would make template capsule have loop named myLoop that represents the div element as a child. Element having loop attribute must be one of the root elements in the templete code. Moreover, root elements have to have loop attribute in order to be displayed on the page. Since HTML code of template capsule may have more than one root element, consequently the template capsule may have more than one loop.

```js
let caps = ...; // this is an arbitrary capsule having hook named myHook

// creates template capsule with a loop named loopX
let template = new html.Template(`
    <div id="abc" loop='loopX'>
        <h1>Hello world!</h1>
    </div>
`);

caps.myHook.tie(template.loopX); // places the div with id="abc" into its new parent
```

- attribute *hook* - HTML element (tag) having hook="myHook" attribute would be represented as a parent by a hook named "myHook" of the Template capsule. Any element (tag) of the HTML template code may have the hook attribute. Usually however, the leaf elements of the template code have it, as they expect to be filled with new HTML content when their hooks get tied.

```js
let caps1 = ...; // this is an arbitrary capsule having hook named myHook
let caps2 = ...; // this is an arbitrary capsule having loop named myLoop

// creates template capsule with a loop named loopX and a hook named hookX
let template = new html.Template(`
    <div loop='loopX'>
        <h1>Hello world!</h1>
        <div id="abc" hook="hookX"></div>
    </div>
`);

caps1.myHook.tie(template.loopX); // places the whole template into its new parent

// places an arbitrary content (represented by caps2.myLoop) 
// into the template's hook (i.e. into the div with id="abc")
template.hookX.tie(caps2.myLoop);
```

- attribute *prop* - HTML element (tag) having prop="setProp" attribute would act as a target for "setProp" input operation of the Template capsule. The operation sets new property value for the given property of the target element. The operation has two string arguments: the property name and the property value to be set.
- attribute *getprop* - HTML element (tag) having getprop="getProp" attribute would act as a target for "getProp" input operation of the Template capsule. The operation returns the property value of the target element. The operation has one string argument: the property name whose value is to be returned.

```js
// creates template capsule with input operations to get and set h1's properties
let template = new html.Template(`
    <div loop='loopX'>
        <h1 prop='setH1Prop' getprop='getH1Prop'>Hello world!</h1>
    </div>
`);
if (template.getH1Prop('dir') === 'rtl') // checks the property value
    template.setH1Prop('dir', 'ltr'); // sets the property value
```

- attribute *attr* - HTML element (tag) having attr="setAttr" attribute would act as a target for "setAttr" input operation of the Template capsule. The operation sets new attribute value for the given attribute of the target element. The operation has two string arguments: the attribute name and the attribute value to be set.
- attribute *getattr* - HTML element (tag) having getattr="getAttr" attribute would act as a target for "getAttr" input operation of the Template capsule. The operation returns the attribute value of the target element. The operation has one string argument: the attribute name whose value is to be read.
- attribute *remattr* - HTML element having remattr="removeAttr" attribute would act as a target for "removeAttr" input operation of the Template capsule. The operation removes the attribute from the target element. The operation has one string argument: the attribute name to be removed.

```js
// creates template capsule with input operations to handle attributes
let template = new html.Template(`
    <div loop='loopX'>
        <input type='text' attr='setInputAttr' getattr='getInputAttr' remattr='removeInputAttr'>
    </div>
`);
if (template.getInputAttr('disabled')) // checks the attribute value
    template.removeInputAttr('disabled'); // removes the attribute
else
    template.setInputAttr('disabled', false); // sets the attribute value
```

- attributes *on* and *output* - HTML element having on="click" and output="clicked" attributes would have 'click' event listener bound to the "clicked" output operation of the Template capsule. The event object itself would be provided as a parameter to the output operation.

```js
// creates template capsule with output operation to signal the 'click' event
let template = new html.Template(`
    <div loop='loopX'>
        <button on="click" output="clicked"></button>
    </div>
`);

template.clicked.wire(function(e){
    alert('Button ' + e.type + 'ed!'); // alerts 'Button clicked!'
});
```

- attribute *get* - HTML element having get="getMe" attribute would act as a target for "getMe" input operation of the Template capsule. The operation returns the target (DOM) element itself.

```js
// creates template capsule with input operation that returns the label element
let template = new html.Template(`
    <div loop='loopX'>
        <label get="getLabel">First name:</label>
    </div>
`);
alert(template.getLabel().innerText); // alerts 'First name:'
```

As a final example, we demonstrate how to create template capsule that has more than one root element.

```js
// an arbitrary capsules having hooks named myHook and hk, respectively
let caps1 = ..., caps2 = ...;

// creates template capsule with loops named loopX and loopY
let template = new html.Template(`
    <div id="abc" loop='loopX'>
        <h1>Hello world!</h1>
    </div>
    <div id="cba" loop='loopY'>
        <h1>Hello world again!</h1>
    </div>
`);

// places the template's div with id="abc" into its new parent
caps1.myHook.tie(template.loopX);

// places the template's div with id="cba" into its new parent
caps2.hk.tie(template.loopY);
```

## Asynchronous RPC Communication

It is quite usual for applications to have components that perform remote procedure calls (RPC), i.e. communication based on the client-server (request-response) paradigm. This is especially true when building user interfaces.

The key concept that handles this is *service*: a named facade that simplifies clients' code and handles communication. It handles all RPC asynchronously.

Each service is of a certain type. A service type depends on the type of the server or the type of channel used in communication, or both. Server can be an HTTP server, a Worker, a Capsule, a JavaScript function, or anything else able to handle clients' requests. Whatever the server is, the clients' code looks the same which is great because you can easily alter server side without ever affecting clients.

It is quite possible and very easy to create custom service types as will be shown later. But let's go one step at a time.

### Performing AJAX Calls

Let's demonstrate using services on AJAX service type.

To use service you must first register it. This is one-time operation and means configuring service plus assigning it to an arbitrary name for later reference. Configuring service assumes selecting service type to use plus setting parameters specific to that service type. For example, to set up an AJAX service one has to select AJAX service type plus additional parameters like URL, HTTP method, etc.:

```js
services.register('myService', { // registration of service 'myService'
    type: html.ServiceType.AJAX, // the type of service
    url: 'services/service-x',
    method: 'post',
    headers: {
        'Cache-Control' : 'no-cache'
    },
    beforeSend: function(xHttpReq){
        xHttpReq.setRequestHeader('Keep-Alive', '300');
    }
});
```

After service registration you can use it from anywhere in your code by just specifying its name (myService in this case). In other words, there is no need (nor is it possible) to keep a service reference. Just remember its name.

Clients that use service are unaware of type of service that they use. They can focus only on what's essential for them and that is to send their requests and receive responses. So, no matter what the service type is the client code looks the same:

```js
services.send('myService', { /*...the request goes here... */ })
.then(function(response){
    alert('success');
}, function(error){
    alert('error');
});
```

The send function returns Promise object which you know how to use, right? 

Now, you can imagine how to change service type (and/or service parameters) without affecting clients' code: just modify service configuration object provided to the *services.register* method. And yes, don't tell that to the clients.

It is very important to note here that send method does not immediately send the given request over the "wire" to the server. It only puts it into a dedicated buffer. Then, another client may send its own request to the same service; it ends up in the same buffer as well. Finally, when the buffer is flushed, all requests go along to the server within the same physical request:

```js
services.flush('myService');
```

This may seem like a bit of an overhead, but in fact it brings one key advantage: the logical communication between clients and the server is decoupled from the physical. You can have multiple clients logically communicating with the server as if they were alone. At the same time physical communication can be tuned to fit anywhere between the following two edge cases (inclusive): 1) all logical requests in a single physical request and 2) each logical request in its own physical request.

Again, the clients need to know neither the service type used in communication nor if other clients are participating in the communication or not.

This has one very important consequence. Clients or client components (capsules) are now able to take over their part of communication from a communication agent that would otherwise exist in order to orchestrate all client components' communication with the server. This makes client components more powerful and yet independent and reusable while the agent existence is no longer necessary.

### Other Types Of RPC

Apart from AJAX service type, Capsula provides a few more. And yes, you can create your own easily (check the next chapter). The following service types are provided in html module:

- [html.ServiceType.AJAX](/api-reference/module-html.ServiceType.html#.AJAX){:target="_blank"} - AJAX communication with HTTP server using request body
- [html.ServiceType.AJAX_URL_ENCODED](/api-reference/module-html.ServiceType.html#.AJAX_URL_ENCODED){:target="_blank"} - AJAX communication with HTTP server using URL (query parameters) only
- [html.ServiceType.AJAX_JQUERY](/api-reference/module-html.ServiceType.html#.AJAX_JQUERY){:target="_blank"} - AJAX communication with HTTP server over jQuery

Services module provides three of its own types:

- [services.ServiceType.FUNCTION](/api-reference/module-services.ServiceType.html#.FUNCTION){:target="_blank"} - communication with simple JavaScript function acting as a server (good for mocking server in the early stage of development)
- [services.ServiceType.ASYNC_FUNCTION](/api-reference/module-services.ServiceType.html#.ASYNC_FUNCTION){:target="_blank"} - communication with a JavaScript function that returns results as a Promise
- [services.ServiceType.WORKER](/api-reference/module-services.ServiceType.html#.WORKER){:target="_blank"} - communication with a JavaScript Worker acting as a server

Finally, capsula module provides its own service type for operations:

- [capsula.ServiceType.OPERATION](/api-reference/module-capsula.ServiceType.html#.OPERATION){:target="_blank"} - communication with an operation acting as a server

Remember, whatever the service type you choose to use, the client code remains the same.

### Custom RPC Types

When neither one of the provided service types is suitable for your async RPC, a new service type could easily be created by calling registerType function of the services module:

```js
services.registerType('myType', function (requests, serviceConfig, serviceName) {
    // ...
});
```

The first parameter is a the new service type's name. This is what should be provided in the type property of service configuration object when creating service of this newly created type. For example:

```js
services.register('myService', { // registration of service 'myService'
    type: 'myType', // must match existing service type's name
    // ...
});
```

The second parameter of registerType function is a function that actually handles physical transfer of clients requests to the server (whatever the server is). This function has three parameters:

The first (requests) argument would be an array of objects each of which contains the client's request in its body property and resolve and reject functions in its resolve and reject properties. Like this:

```js
{
    body: { /* this is what the client has sent by calling the send function */ },
    resolve: resolve, // the function to call in case of success
    reject: reject // the function to call in case of failure
}
```

The second argument (serviceConfig) would be the configuration object of the particular service (the second argument of the register function). In other words, the service configuration object provided when service is being registered would appear here when it comes to sending requests over that service.

The third argument (serviceName) would be the name of the particular service (the first argument of the register function). In other words, the service name provided when service is being registered would appear here when it comes to sending requests over that service.

Now that we know all the parameters of this function, we can approach its implementation to create new service type. The function should perform all necessary actions in order to send requests to their destination and receive and handle responses. More precisely, it needs to pack all clients' requests into a single physical request, send that physical request to its destination, wait for the physical response, unpack the physical response into individual responses, and handle each individual response (by calling the corresponding request's resolve or reject function).

For example, the complete implementation of service type that handles communication with a simple JavaScript function could look like this:

```js
services.registerType('myType', function (requests, serviceConfig, serviceName) {
    // packing
    var packed = []; // let's pack requests into an array
    for (var i = 0; i < requests.length; i++)
        packed.push(requests[i].body); // we take the client's request from the body

    // sending
    // Let's assume the target function is provided 
    // in the func property of the serviceConfig object
    var responses = serviceConfig.func(packed);

    // unpacking & handling
    for (var i = 0; i < responses.length; i++){
        var request = requests[i],
        response = responses[i];
        // let's assume successfully handled request has 
        // success property set to true in the response
        if (response != null && response.success)
            request.resolve(response); // call the Promise's resolve function
        else
            request.reject(response.error); // call the Promise's reject function
    }
});
```

Now we can create service of the newly created type and use it to send requests over to the target function that acts like a server:

```js
services.register('myService', {
    type: 'myType',
    func: function(requestsArr){
        var responses = [];
        // TODO handle requests and prepare responses
        return responses;
    }
});

services.send('myService', { /* my request */ }).then(function(response){
    // process the response
});

services.flush('myService');
```

## Protected State

So far we've learned how capsules enforce access protection for operations, methods, parts, etc. Now we move to protecting data inside capsules.

One way to protect and use protected data inside capsule is shown here:

```js
var Page = capsula.defCapsule({
    init: function(title){
        this.setData('myTitle', title); // anything goes as a second argument
    },
    '+ getTitle': function(){
        return this.getData('myTitle'); // returns protected data
    }
});

var page = new Page('Protected page title');
page.getData('myTitle'); // Error: Oops! Make sure you do this in the right context.
page.myTitle; // undefined
page.getTitle(); // Success: 'Protected page title'
```

Methods *getData* and *setData* are protected methods inherited from the root Capsule class. They allow for storing any sort of data under the given id inside the capsule.

Creating protected data could be done declaratively as well. For example:

```js
var Page = capsula.defCapsule({
    myTitle: 'Protected page title',
    '+ getTitle': function(){
        return this.getData('myTitle');
    }
});

var page = new Page();
page.getData('myTitle'); // Error: Oops! Make sure you do this in the right context.
page.myTitle; // undefined
page.getTitle(); // Success: 'Protected page title'
```

Note however that in this case all pages would have the same value for myTitle: the value provided in the Page capsule definition object.

Imagine the following similar example:

```js
var Page = capsula.defCapsule({
    myContent: [],
    '+ getContent': function(){
        return JSON.stringify(this.getData('myContent'));
    },
    '+ addParagraph': function(text){
        this.getData('myContent').push(text);
    }
});

var page1 = new Page();
var page2 = new Page();

console.log(page1.getContent()); // []
console.log(page2.getContent()); // []

page1.addParagraph('Paragraph 1');

console.log(page1.getContent()); // ["Paragraph 1"]
console.log(page2.getContent()); // ["Paragraph 1"] !
```

According to this, we could conclude that myContent is a static reference. However, it is not. It is an instance-level reference, like all others, however, the trick here is that both of these references (for page1 and page2) have been initialized with the same array: the one provided in the Page capsule definition object. This way, static data could be achieved if we ever need it. 

To have a new array for each page instance, try this:

```js
var Page = capsula.defCapsule({
    myContent: '*[]', // the keyword meaning new array for each instance
    '+ getContent': function(){
        return JSON.stringify(this.getData('myContent'));
    },
    '+ addParagraph': function(text){
        this.getData('myContent').push(text);
    }
});

var page1 = new Page();
var page2 = new Page();

console.log(page1.getContent()); // []
console.log(page2.getContent()); // []

page1.addParagraph('Paragraph 1');

console.log(page1.getContent()); // ["Paragraph 1"]
console.log(page2.getContent()); // []
```

All supported values for instance-level data are given here:

```js
var Page = capsula.defCapsule({
    myObject: '*{}',        // each page gets new Object in this.getData('myObject')
    myArray: '*[]',         // each page gets new Array in this.getData('myArray')
    myMap: '*Map',          // each page gets new Map in this.getData('myMap')
    mySet: '*Set',          // each page gets new Set in this.getData('mySet')
    myWeakMap: '*WeakMap',  // each page gets new WeakMap in this.getData('myWeakMap')
    myWeakSet: '*WeakSet',  // each page gets new WeakSet in this.getData('myWeakSet')
});
```

and they are all protected.

Finally, we show the most general case to specify protected data. It looks similar to specifying parts. For each datum, you provide a function to be called once for each capsule instance and also arguments for that function. The function could be called with or without new operator, depending on whether you specify it with *call* or with the *new* keyword.

```js
var Page = capsula.defCapsule({
    myTitle: {
        call: function(text){ // "call" or "new"
            return '---' + text + '---'; // myTitle becomes what is returned here
        },
        args: 'this.args' // (args / arguments / deferredArgs); the same as with parts
    },
    '+ getTitle': function(){
        return this.getData('myTitle');
    }
});

var page = new Page('hi');
page.getData('myTitle'); // Error: Oops! Make sure you do this in the right context.
page.myTitle; // undefined
page.getTitle(); // Success: '---hi---'
```
