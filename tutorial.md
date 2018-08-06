---
layout: page
title: Tutorial
permalink: /tutorial/
order: 1
nav: true
---

- [About This Tutorial](#about-this-tutorial)
- [What Is Capsula?](#what-is-capsula)
- [Main Concepts](#main-concepts)
	- [Introducing Capsules](#introducing-capsules)
	- [Encapsulation Model](#encapsulation-model)
- [Installation](#installation)
	- [Node.js](#nodejs)
	- [RequireJS](#requirejs)
	- [Plain Old Script Tag](#plain-old-script-tag)
	- [Hello World](#hello-world)
- [Working With Capsules](#working-with-capsules)
	- [Creating Capsule Class](#creating-capsule-class)
	- [Instantiating Capsules](#instantiating-capsules)
	- [Parts](#parts)
	- [Constructor And Arguments](#constructor-and-arguments)
	- [Inheritance](#inheritance)
- [Implementing Behavior](#implementing-behavior)
	- [Methods](#methods)
	- [Operations](#operations)
	- [Error Handling](#error-handling)
- [Protected State](#protected-state)
- [Building User Interfaces](#building-user-interfaces)
	- [Object-Oriented Approach](#object-oriented-approach)
	- [Working with Templates](#working-with-templates)
- [Asynchronous RPC Communication](#asynchronous-rpc-communication)
	- [Performing AJAX Calls](#performing-ajax-calls)
	- [Other Types Of RPC](#other-types-of-rpc)
	- [Custom RPC Types](#custom-rpc-types)

## About This Tutorial

The purpose of this tutorial is to smoothly tune you in on the Capsula development.

You can simply read the tutorial from the beginning till the end and you will get yourself familiar with Capsula library. There is no need to immediately follow links to external resources, however the links are there to help you extend your knowledge and to direct you to the most important points in the API reference.

Important sentences of this tutorial are presented like this:

> This is very important to note.

When a module is introduced, you will see the table that directs you to the API reference and looks like this:

<table class="module">
<thead><tr><th colspan="2">[module] <a style="cursor:pointer">MyModule</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Module description goes here.</td></tr>
</tbody></table>

The same is when a class is introduced:

<table class="class">
<thead><tr><th colspan="2">[class] <a style="cursor:pointer">MyClass</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Class description goes here.</td></tr>
<tr><td>Module</td><td> <a style="cursor:pointer">MyModule</a></td></tr>
</tbody></table>

For methods we follow a similar style:

<table class="method">
<thead><tr><th colspan="2">[method] <a style="cursor:pointer">myMethod</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Method description goes here.</td></tr>
<tr><td>Class or Module</td><td> <a style="cursor:pointer">MyClass</a></td></tr>
</tbody></table>

Instructions related to tutorial usage are presented for example like this:

---
Now it's good time to take a 5-minute break.

---

Please let us know of any issue you run into while reading the tutorial. We would be more than happy to improve the tutorial according to that and help you overcome the problems.

## What Is Capsula?

**Capsula** library lets you build JavaScript applications using highly reusable, flexible, and encapsulated software components called "capsules". With Capsula you can:

- create your application out of **encapsulated components** - capsules.
- have **multi-level architectural views** of your application and **handle complexity better**.
- be **both declarative and imperative** having the best of both worlds. Artifacts developed either way speak the same language and could seamlessly be combined and used together.
- **increase flexibility** of your UI components by managing layout and behavior in quite a unique way.
- **handle asynchronous communication** focusing only on what's essential.
- exploit **really fast dev cycle** of plain JavaScript; no transpiling in the process.
- expect even more, according to our [goals]({{ "/the-goals-of-capsula" | relative_url }}).

Capsula is a sort of dynamic, [object-oriented](https://en.wikipedia.org/wiki/Object-oriented_programming) "language" that accommodates many new and powerful concepts designed to handle complexity and favor abstraction, encapsulation, flexibility, and reuse. It is especially suitable for applications that exploit composite design pattern, i.e. for applications that could be built by recursively composing encapsulated modules into larger modules all the way up to the whole application.

Capsula addresses communication based on the client-server (request-response) paradigm. It provides for decoupling clients from technical details of communication and enables programmers to deal with essential matters only, as well as to easily mock server-side part of communication.

Capsula is quite suitable for building user interfaces since they are usually built by using composition. Capsula provides both for templates and object-oriented way of widget manipulation. By default, Capsula supports building web UIs (relies on the DOM API), however this can be changed by extending it to work with any other JavaScript widget API, both client- or server-side.

Applications built with Capsula are neatly structured, ease to manage, and with clearly visible multi-level architecture.

## Main Concepts

This section explains the main concepts behind Capsula library as well as specifics of Capsula's encapsulation model.

### Introducing Capsules

The base concept of Capsula library is the concept of *Capsule*. Capsules encapsulate pieces of application logic. Capsules are usually built out of other (child) capsules. Hence, capsules form a hierarchy which serves as a backbone of your application.

Capsule class is a simple OO class with special features / properties. Capsules support single inheritance model and polymorphism the way OO classes do. At the same time they are dynamic the way JavaScript language is. They employ rather novel encapsulation model that relies on the above-mentioned hierarchy of capsules.

<table class="class">
<thead><tr><th colspan="2">[class] <a href="{{ "/api-reference/module-capsula.Capsule.html" | relative_url }}" target="_blank">Capsule</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Root class in the hierarchy of capsule classes. Every capsule class implicitly extends Capsule.</td></tr>
<tr><td>Module</td><td> <a href="{{ "/api-reference/module-capsula.html" | relative_url }}" target="_blank">Capsula</a></td></tr>
</tbody></table>

There are multiple types of capsule's properties: methods, operations, parts, hooks, loops, and data.

*Method* is (as anyone would imagine) a simple JavaScript method. *Operation* acts like a method, however it is more powerful. Operations add support for asynchronous calls, declarative wiring to other operations and methods (to specify propagation of calls), etc. *Part* of a capsule represents its child capsule, that is, a capsule instantiated in its context (i.e. constructor, method, or operation). *Hooks* and *loops* provide capsules with a special support for managing widgets and layout in a flexible way. In accordance with the principle of information hiding, capsules also store *protected data*; the data they work with or operate on.

In the following section we define access rules to the above-mentioned properties i.e. how our encapsulation model works.

### Encapsulation Model

In a typical OO encapsulation model accessing fields and methods depends solely on their visibility. Hence, all public fields and methods of all living objects are accessible from anywhere in the code, only a reference to an object is needed. Since everything public is accessible, we still have to carefully manage references to avoid our code becoming "spaghetti". In many cases this encapsulation policy seems not efficient enough.

Capsula proposes stricter policy. The policy relies on both visibility of properties and on the runtime relationship of capsule instances (the relationship between instance whose property is being accessed and the instance from whose context the property is being accessed).

> The code executing a method of a capsule is only allowed to use, access, or call a) public properties of all its child (part) capsules and b) public and protected properties of the capsule itself. "Out of context" error is thrown when trying to access properties against the rules.

Let's elaborate on that using a figure given bellow. Figure shows three nested capsule instances: the ```outer```, the ```middle``` (being part of the ```outer``` capsule), and the ```inner``` (being part of the ```middle``` capsule). Each of them has two properties (one public (+) and one protected (#)) that can be anything from operations, methods, hooks, loops, or data. Now let's see what's accessible from where.

<img src="{{ "/assets/img/encapsulation-capsula.png" | relative_url }}" style="">

From the context (method) of the ```outer``` capsule we are allowed to access property ```p3``` of the ```middle``` capsule (green arrow) since it's public and belongs to its part (i.e. belongs to a capsule instantiated in its context). However, we are disallowed to access the ```middle```'s ```p4``` property (red arrow) since it's protected. From the same context of the ```outer``` capsule, we freely access properties ```p1``` and ```p2``` since they belong to the ```outer``` capsule itself (so it doesn't really matter whether they are public or protected). Then, from the same context, we are disallowed to access any property of the ```inner``` capsule (either ```p5``` or ```p6```), since by doing that we are actually breaking encapsulation of the ```middle``` capsule. Finally, if in the context of the ```middle``` capsule we can access neither property ```p1``` nor ```p2``` since we are not allowed to "look" outside.

On the other hand, the typical encapsulation policy wouldn't mind about context and runtime relationship of the three capsules (i.e. the hierarchy they form). The policy would allow access to ```p1```, ```p3```, and ```p5``` from anywhere in the code since they are public. The access to protected properties (```p2```, ```p4```, and ```p6```) would depend on relationship of packages to which classes of the three capsule instances belong. This is why the arrows are orange, meaning "it depends" (see figure bellow).

<img src="{{ "/assets/img/encapsulation-others.png" | relative_url }}" style="">

To sum up, the Capsula's policy depends on visibility of properties and runtime hierarchy of capsules. On the other hand, the typical encapsulation policy depends of visibility of properties and design-time relationship of packages. We argue that Capsula's policy is much more efficient in enforcing order in your code.

It's essential to understand the encapsulation model since it interweaves with everything you do in Capsula. Now that we've covered it, we can go straight to the coding and explain all other concepts along the way.

## Installation

Capsula library is executable both within the browser and Node.js. At this point it comprises three modules:

- capsula,
- services, and
- html.

<table class="module">
<thead><tr><th colspan="2">[module] <a href="{{ "/api-reference/module-capsula.html" | relative_url }}" target="_blank">capsula</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>The core module of Capsula library.</td></tr>
</tbody></table>

<table class="module">
<thead><tr><th colspan="2">[module] <a href="{{ "/api-reference/module-services.html" | relative_url }}" target="_blank">services</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Optimizes communication based on request-response paradigm between clients and server.</td></tr>
</tbody></table>

<table class="module">
<thead><tr><th colspan="2">[module] <a href="{{ "/api-reference/module-html.html" | relative_url }}" target="_blank">html</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Enables and eases building web pages using capsules.</td></tr>
</tbody></table>

In the following lines we explain how to install Capsula in both of the two environments.

### Node.js

Install Capsula using npm:

```
npm i @solsoftware/capsula
```

Require Capsula modules:

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

In all the code used throughout this tutorial, we use references ```capsula```, ```services```, and ```html``` to refer to root (exported) objects of *capsula*, *services*, and *html* modules, respectively.

---

## Working With Capsules

Once we have Capsula set up, we can start coding things. Let's try to cut into building a messaging application engine that delivers messages and persists successfully delivered ones.

### Creating Capsule Class

To create an empty capsule class try:

```js
var MessageArchive = capsula.defCapsule({}); // {} is the capsule definition object
```

<table class="method">
<thead><tr><th colspan="2">[method] <a href="{{ "/api-reference/module-capsula.html" | relative_url }}#.defCapsule" target="_blank">defCapsule</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Creates and returns a capsule constructor function based on the given capsule (class) definition object.</td></tr>
<tr><td>Module</td><td> <a href="{{ "/api-reference/module-capsula.html" | relative_url }}" target="_blank">Capsula</a></td></tr>
</tbody></table>

### Instantiating Capsules

To instantiate capsule use the ```new``` operator and function returned from the call to ```defCapsule```:

```js
var archive = new MessageArchive();
```

### Parts

Now, let's create *Application* capsule with a message archive inside (that is, with message archive being part of it):

```js
var Application = capsula.defCapsule({
    archive: MessageArchive
});

var app = new Application(); // creates both the application and the archive
```

Here, the ```archive``` capsule is *part* of the ```app``` capsule which is therefore the *owner* of the ```archive``` capsule.

From the inside of the application capsule we can access the archive capsule simply using reference ```this.archive```.

### Constructor And Arguments

Now, let's rewrite the *MessageArchive* capsule (class) to add constructor that sets flag for using encryption in the archiving process.

```js
var MessageArchive = capsula.defCapsule({
    init: function(useEncryption){ // init is the keyword for constructor
        this.useEncryption = useEncryption;
    }
});
```

> Use ```init``` keyword in the capsule definition object to specify constructor function.

Now, since *MessageArchive* requires an argument during construction, the *Application* capsule should follow with:

```js
var Application = capsula.defCapsule({
    archive: {
        capsule: MessageArchive, // capsule: the keyword to use to specify type
        args: true
    }
});
```

> To specify part's type (i.e. constructor function) use the ```capsule``` keyword.

Here, instead of just specifying archive's type, we also specify the arguments using the 'args' keyword.

> To specify arguments use ```args``` and ```arguments``` keywords interchangeably. The arguments can either be a single value or an array of values in cases when part's constructor requires multiple arguments.

The same could be achieved this way as well:

```js
var Application = capsula.defCapsule({
    init: function(){
        this.archive = new MessageArchive(true);
    }
});
```

Here we underline that the ```archive``` becomes part of the ```app``` capsule not because of placing it into ```this.archive```, but because of the fact that it has been instantiated in the context (i.e. constructor) of the ```app``` capsule.

At this point, every application would have an archive module using encryption. Let's make that configurable:

```js
var Application = capsula.defCapsule({
    archive: {
        capsule: MessageArchive,
        args: 'this.args' // 'this.args' refers to Application arguments
    }
});
```

> Use ```this.args``` keyword to tell that arguments of the owner capsule should be used to instantiate part capsule.

Now the *Application* capsule could be instantiated like this:

```js
var app = new Application(true); // the true value gets forwarded to the archive part
```

Finally, part's arguments can be computed at the instantiation point in time by executing function:

```js
var Application = capsula.defCapsule({
    init: function(name, useEncryption){
        this.name = name;
    },
    archive: {
        capsule: MessageArchive,
        deferredArgs: function(name, useEncryption){ // keyword: deferredArgs
            return useEncryption; // or return array for more arguments
        }
    }
});
```

> Use ```deferredArgs``` keyword to specify function that gets called just before part's instantiation to return arguments for part's instantiation. The function would be called with the same arguments as arguments used to instantiate the owner capsule. The function should return either a single value or an array of values in cases when part's constructor requires multiple arguments.

Now, this:

```js
var app = new Application('My application', true);
```

would create inner archive that uses encryption.

> When it comes to ordering of execution, it should be noted that parts are instantiated first and afterwards the owner's constructor (```init```) is called.

### Inheritance

As expected, Capsule class may extend another capsule class. Single-inheritance model is supported.

```js
var MongoDbMessageArchive = capsula.defCapsule({
    base: MessageArchive
});
```

> The sub-capsule inherits all the properties and methods of the super capsule.

Sub-capsule may decide to call the super-type's constructor from within its own constructor:

```js
var MongoDbMessageArchive = capsula.defCapsule({
    base: MessageArchive,
    init: function(useEncryption, port){
        this.superior().init.call(this, useEncryption); // calls the super constructor
        this.port = port;
    }
});
```

> Super-type's constructor doesn't get called implicitly, so if you need it, make sure you call it explicitly (as shown above).

It is also possible to create an abstract capsule:

```js
var Archive = capsula.defCapsule({
    isAbstract: true // isAbstract is the keyword for designating abstract capsules
});

var archive = new Archive(); // Error: Abstract capsules cannot be instantiated
```

> Abstract capsules that cannot be instantiated.

---

So far we have covered the very basic stuff plus parts. Let's continue and add a bit of dynamic with methods and operations.

---

## Implementing Behavior

Dynamic parts of your application are implemented using methods and operations. Let's start with methods, being the concept you already know of.

### Methods

Let's create a MessageArchive capsule with a couple of methods:

```js
var MessageArchive = capsula.defCapsule({
    init: function(useEncryption){ // init is the keyword for constructor
        this.useEncryption = useEncryption;
    },
    persist: function(message){
        // TODO persist the message
        console.log('persisted ' + JSON.stringify(message));
    },
    encrypt: function(message){
        // TODO encrypt the message
        return message;
    },
    '+ process': function(message){
        message.archivingTime = new Date();
        if (this.useEncryption)
            message = this.encrypt(message);
        this.persist(message);
    }
});
```

Protected are the ```persist``` and the ```encrypt``` methods, while the ```process``` is public. 

> Public methods should have a + sign prefix to distinguish them from protected ones.

Now, to archive a message try the following:

```js
var archive = new MessageArchive(true);
archive.process({body: 'Hello World!'}); // console: persisted {"body":"Hello World!"}
```

Great, it works. If however we try:

```js
archive.encrypt({body: 'Hello World!'}); // Error: Out of context...
```

the error is raised since we are calling protected method from the outer context.

### Operations

Now let's go one step further and explain operations. They are like methods but more powerful. Operations are always public.

Firstly, operations can be bound (both declaratively and imperatively) to one another and to methods, to specify propagation of calls. Binding operations is called wiring; bindings are called wires.

Secondly, operation can either be input or output. Input operation serves as a propagator of calls from the outside towards the inside of the capsule that owns the operation. Output operation does the opposite, it serves as a propagator of calls from the inside towards the outside of its owner capsule.

Thirdly, operations can be called both in synchronous and in asynchronous way.

Also, there are other features that are specific to operations like enabling / disabling them, filtering operations' arguments, etc.

Let's go back to our example. Let's imagine our application receives messages from the outside world:

```js
var Application = capsula.defCapsule({
    '> newMessage': 'archive.process', // > means input operation
    archive: {
        capsule: MessageArchive,
        args: 'this.args'
    }
});

var app = new Application(true);
app.newMessage({body: 'Hi!'}); // console: persisted {"body":"Hi!"}
```

Looking from the outside, the ```newMessage``` operation looks the same and is being called the same way as regular methods. From the inside however, we see that our operation has been declaratively bound (wired) to a method ```process``` of the capsule's ```archive``` part.

> Input operations are declared with > sign.

Now the same thing could be done imperatively using the ```wire``` method:

```js
var Application = capsula.defCapsule({
    '> newMessage': null,
    init: function(){
        this.newMessage.wire(this.archive.process); // imperative wiring using wire
    },
    archive: {
        capsule: MessageArchive,
        args: 'this.args'
    }
});
```

<table class="method">
<thead><tr><th colspan="2">[method] <a href="{{ "/api-reference/module-capsula.Operation.html" | relative_url }}#wire" target="_blank">wire</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Wires this operation to the given operations and methods in the current context of execution.</td></tr>
<tr><td>Class</td><td> <a href="{{ "/api-reference/module-capsula.Operation.html" | relative_url }}" target="_blank">Operation</a></td></tr>
</tbody></table>

Now that we have archiving, let's add a delivery module to our application. Let's start by creating new *MessageDelivery* capsule:

```js
var MessageDelivery = capsula.defCapsule({
    '< onDelivered': null, // < means output operation
    '> process': function(message){ // wiring of input operation to a method
        // TODO delivery
		message.delivered = true;
        if (message.delivered)
            this.onDelivered(message);
    }
});
```

> Output operations are declared with < sign.

Delivery module works this way: accepts the message through the ```process``` input operation, tries to deliver it, and signals that to the outside world by calling the output operation ```onDelivered``` in case of successful delivery. We follow the convention of naming output operations using the pattern ```on...```.

Note that the ```process``` input operation has been wired on-spot to a method that would handle all calls to the operation.

Finally, have in mind that output operations never really do anything themselves. They only serve to propagate calls and events to the outside world. Hence, the ```onDelivered``` output operation has been declared with null value. It could have been declared with an empty-body function only to be able to specify operation's signature, but the effect of doing that is the same as simply putting null value. Calling an output operation that hasn't been wired to any other operation or method outside is a *no-op*.

Had we wanted to short-circuit each received message immediately to the ```onDelivered``` output operation we would have done it by simply doing this:

```js
var MessageDelivery = capsula.defCapsule({
    '< onDelivered': function(message){}, // operation's signature provided
    '> process': 'this.onDelivered'
});
```

Now, our application could look like this:

```js
var Application = capsula.defCapsule({
    '> newMessage': 'delivery.process',
    delivery: MessageDelivery,
    archive: {
        capsule: MessageArchive,
        args: 'this.args'
    },
    'delivery.onDelivered': 'archive.process'
});

var app = new Application(true);
app.newMessage({body: 'Hello!'}); // persisted {"body":"Hello!","delivered":true}
```

Implemented like this, the application tries to deliver each message, archiving only successfully delivered ones. According to the console output, the message has been both delivered and persisted.

Operations could be wired to more than one operation (and method). To demonstrate that, let's add the ```onDelivered``` output operation to the *Application* capsule:

```js
var Application = capsula.defCapsule({
    '< onDelivered': function(message){},
    '> newMessage': 'delivery.process',
    delivery: MessageDelivery,
    archive: {
        capsule: MessageArchive,
        args: 'this.args'
    },
    'delivery.onDelivered': ['archive.process', 'this.onDelivered'] // array
});
```

As shown in the last line of the *Application* capsule's body, an output operation of the delivery module has been wired to an input operation of archive module and an output operation of the application capsule itself. The same could be done imperatively:

```js
var Application = capsula.defCapsule({
    '< onDelivered': function(message){},
    '> newMessage': 'delivery.process',
    delivery: MessageDelivery,
    archive: {
        capsule: MessageArchive,
        args: 'this.args'
    },
    init: function(){
        this.delivery.onDelivered.wire(this.archive.process, this.onDelivered);
        // or using an array:
        // this.delivery.onDelivered.wire([this.archive.process, this.onDelivered]);
    }
});
```

In this case, we could say that the ```this.delivery.onDelivered``` output operation acts as source, while the ```this.archive.process``` and the ```this.onDelivered``` act as targets.

> Each source operation could be wired to many targets. Similarly, each target operation could be wired to many source operations. A method can only act as a target when being wired.

Method ```wire``` is sort of "reflexive", meaning that ```a.wire(b)``` is the same as ```b.wire(a)```. ```wire``` is therefore easy to use - no need to think about direction of flow, however it has a small drawback. When looking at the ```a.wire(b)``` you cannot immediately tell which one is the source and which one is the target. That's why there are two additional methods that can be used when you want your code to tell the story about who is who. These two methods are ```source``` and ```target```.

<table class="method">
<thead><tr><th colspan="2">[method] <a href="{{ "/api-reference/module-capsula.Operation.html" | relative_url }}#target" target="_blank">target</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Wires this operation acting as a source in the current context of execution to the given operations and functions (targets).</td></tr>
<tr><td>Class</td><td> <a href="{{ "/api-reference/module-capsula.Operation.html" | relative_url }}" target="_blank">Operation</a></td></tr>
</tbody></table>

<table class="method">
<thead><tr><th colspan="2">[method] <a href="{{ "/api-reference/module-capsula.Operation.html" | relative_url }}#source" target="_blank">source</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Wires this operation acting as a target in the current context of execution to the given operations (sources).</td></tr>
<tr><td>Class</td><td> <a href="{{ "/api-reference/module-capsula.Operation.html" | relative_url }}" target="_blank">Operation</a></td></tr>
</tbody></table>

Obviously where there is collection there is ordering as well. So, where there are multiple targets for a single source operation in some cases it could be significant to specify ordering of targets. In those cases ```wireAt``` and ```targetAt``` methods should be used.

Finally, operations get unwired or rewired as easily as they get wired. Have in mind the following methods: ```unwire```, ```untarget```, ```unsource```, ```rewire```, ```retarget```, ```resource```, ```unwireAll```, ```untargetAll```, and ```unsourceAll```.

Also, you can check whether wiring exist between operations (and methods) with: ```isWiredTo```, ```isSourceOf```, and ```isTargetOf```.

#### Operation Result

As shown above, operation calls are propagated according to the wiring. Wiring network ends where operations are wired to methods. The methods make the final combined effect of an operation call. The result of calling an operation is a combined result of all operation calls downstream. The result of calling an operation is: 

a) an array of method results, if there is more than one downstream method,

b) a method result, if there is only one downstream method (this is by default, but can be changed to return array, see ```setUnpackResult```), 

c) undefined, if there are no downstream methods.

#### Asynchronous Invocation

Calling and operation the same way as calling a regular JavaScript method means synchronous call. That means control is returned to the caller once all of the downstream operations and methods are executed. There is however an asynchronous way of calling an operation. This is done by using the operation's ```send``` method:

```js
app.newMessage.send({body: 'Hello!'}).then(function(result){
    // processing result...
});
```

Call to send returns Promise object which allows for handling the results in both successful and erroneous use cases. In case of an asynchronous operation call, the control is returned to the caller immediately and propagation of calls is done in asynchronous manner at some point in future.

<table class="method">
<thead><tr><th colspan="2">[method] <a href="{{ "/api-reference/module-capsula.Operation.html" | relative_url }}#send" target="_blank">send</a></th></tr></thead>
<tbody>
<tr><td>Description</td><td>Calls this operation in an asynchronous way. Returns control immediately. Returns Promise.</td></tr>
<tr><td>Class</td><td> <a href="{{ "/api-reference/module-capsula.Operation.html" | relative_url }}" target="_blank">Operation</a></td></tr>
</tbody></table>

### Error Handling

Support for error handling in capsules comes down to this. The handle method in capsule class would be called each time an error is thrown in the context of that capsule:

```js
var Application = capsula.defCapsule({
    handle: function(err){
        console.log(err.message);
    },
    '> newMessage': function(message){
        throw new Error('failed');
    }
});

var app = new Application();
app.newMessage({body: 'Hello!'}); // console: failed
```

Make sure you don't have errors popping out of handle method, since that would produce an endless recursion.

## Protected State

Now let's see how to protect data inside capsules.

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

All supported keywords for instance-level data are given here:

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

Finally, we show the most general case to specify protected data. It looks similar to specifying parts. For each datum, you provide a function to be called once for each capsule instance and also arguments for that function. The function could be called with or without new operator, depending on whether you specify it with the *call* or with the *new* keyword.

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

## Building User Interfaces

Apart from the novel encapsulation model which is useful in any application domain, Capsula exhibits concepts specifically dedicated to the domain of user interfaces. These concepts are developed to decouple managing hierarchy of widgets from managing any other behavior.

A capsule is not a widget per se. However, a capsule may represent a widget. What's more, it may represent a group of widgets. The layout of this group of widgets may be fixed inside the capsule or left partly or completely unspecified. In other words, Capsula allows engineers to combine mutually interacting widgets into a larger components (capsules) without necessarily gluing them together in terms of layout. This enables creating extremely rich and complex components that have very high reuse potential.

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

Note that instead of adding one capsule to another, here we've added a loop of one capsule to a hook of another. This is because in general a capsule may represent more that one widget and we have to specify exactly what goes whare. 

Hooks and loops are being added using the tie method. We call this tying while connections we call ties.

Now, let's add a bit of interaction to this example.

```js
button.addEventOutput('click'); // let's listen for the click event

var dialog = new html.Element('dialog'); // create a dialog element
dialog.setInnerHTML('This is a dialog!');
div.hook.tie(dialog.loop); // add dialog to the div

button.click.wire(function(){ // click handler
    dialog.setAttribute('open', null); // opens it; attribute value not important
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
        this.dialog = new html.Element('dialog'); // creates a part in this.dialog
        dialog.setInnerHTML(message);
        div.hook.tie(dialog.loop);
        button.click.wire(this.clickHandler);
        div.loop.tie(this.root); // this is how div gets represented by the root loop
    },
    clickHandler: function(){
        this.dialog.setAttribute('open', null);
    }
});

var info = new ShowInfo('Have a nice day.');
info.root.renderInto(document.body); // let's put our capsule into the page body
```

Note that renderInto method allows you to directly couple the world of DOM elements with the world of capsules.

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
    'button.!click': 'this.clickHandler', // pay attention to ! sign (see bellow)
    clickHandler: function(){
        this.dialog.setAttribute('open', null);
    }
});

var info = new ShowInfo('Have a nice day.');
info.root.renderInto(document.body);
```

As show above, creating parts, tying hooks and loops, and wiring operations (and methods in this case) can all be done in a declarative way.

One thing should be noted here. Declarative wires and ties are being checked during execution of defCapsule so that errors in capsule definition object get discovered as early as possible. In cases when part creates its operation dynamically, for example in constructor, that operation cannot be checked at the time of defCapsule execution of its owner capsule. This is the case with our button. It creates its output click operation dynamically, so we have to designate that this operation should not be checked. We do that by saying ```button.!click``` instead of just ```button.click``` in the wire declaration.

Also note that making the button listen to click events could be done during construction either as shown above where args property contains additional array of events, or in case of imperative construction like this:

```js
var button = new html.Element('button', ['click']); // more events could be added
```

Whether being a fan of imperative or declarative style, at this point you have the ShowInfo capsule encapsulating two interacting widgets. However, the ShowInfo capsule specifies not only how the two widgets interact, but also how they are positioned in terms of layout. That's not really flexible.

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
        this.dialog.setAttribute('open', null);
    }
});

var info = new ShowInfo('Have a nice day.');

// now, let's decide where to put the button and the dialog
info.dialogLoop.renderInto(document.getElementById('div1'));
info.buttonLoop.renderInto(document.getElementById('div2'));
```

Now we have our ShowInfo capsule much more flexible, since it only encapsulates interaction, while the layout of its parts is left for someone else (who is using ShowInfo capsule) to specify. This is the core idea behind the mechanism of hooks and loops.

The mechanism of hooks and loops enables us to decide which layout decisions we want to make inside a capsule and which to leave out of it. This enables us to increase complexity of capsules while preserving the capsule's potential to be reused, because in user interface development most of inflexibility comes from fixing the layout of your components in advance.

#### Working With Native DOM Elements

Sometimes it is useful to have access to low-level APIs in order to be able to achieve your goals. Let's create our ShowInfo capsule using the native (DOM) code.

```js
var ShowInfo = capsula.defCapsule({
    loops: ['buttonLoop', 'dialogLoop'], // one for the button, one for the dialog
    init: function(message){
        // native
        var domButton = document.createElement('button');
        domButton.innerHTML = 'Open';
        domButton.addEventListener('click', capsula.contextualize(this.clickHandler));
		
        this.buttonLoop.render(domButton); // renders our button into its loop
		
        // native
        this.domDialog = document.createElement('dialog');
        this.domDialog.innerHTML = message;
		
        this.dialogLoop.render(this.domDialog); // renders our dialog into its loop
    },
    clickHandler: function(){
        // native
        this.domDialog.setAttribute('open', null);
    }
});

var info = new ShowInfo('Have a nice day.');
info.dialogLoop.renderInto(document.getElementById('div1'));
info.buttonLoop.renderInto(document.getElementById('div2'));
```

Please note that even in cases when you use native code you can easily encapsulate it and then use your capsule like any other regular capsule.

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
var caps = ...; // this is an arbitrary capsule having hook named myHook

// creates template capsule with a loop named loopX
var template = new html.Template(`
    <div id="abc" loop='loopX'>
        <h1>Hello world!</h1>
    </div>
`);

caps.myHook.tie(template.loopX); // places the div with id="abc" into its new parent
```

- attribute *hook* - HTML element (tag) having hook="myHook" attribute would be represented as a parent by a hook named "myHook" of the Template capsule. Any element (tag) of the HTML template code may have the hook attribute. Usually however, the leaf elements of the template code have it, as they expect to be filled with new HTML content when their hooks get tied.

```js
var caps1 = ...; // this is an arbitrary capsule having hook named myHook
var caps2 = ...; // this is an arbitrary capsule having loop named myLoop

// creates template capsule with a loop named loopX and a hook named hookX
var template = new html.Template(`
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
var template = new html.Template(`
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
var template = new html.Template(`
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
var template = new html.Template(`
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
var template = new html.Template(`
    <div loop='loopX'>
        <label get="getLabel">First name:</label>
    </div>
`);
alert(template.getLabel().innerText); // alerts 'First name:'
```

As a final example, we demonstrate how to create template capsule that has more than one root element.

```js
// an arbitrary capsules having hooks named myHook and hk, respectively
var caps1 = ..., caps2 = ...;

// creates template capsule with loops named loopX and loopY
var template = new html.Template(`
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
