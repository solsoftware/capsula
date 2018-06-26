## Capsula

**Capsula** is a JavaScript library for building user interfaces and other event-driven software using highly reusable, flexible, and encapsulated software components called *capsules*. Capsula is executable both within the browser and node.js.

Capsula is a sort of dynamic, general-purpose, [object-oriented](https://en.wikipedia.org/wiki/Object-oriented_programming) "language" that accommodates many new and powerful concepts designed to handle complexity and favour abstraction, encapsulation, flexibility, and reuse. It also provides for both declarative and imperative programming styles, letting the programmer decide when to use which of the two and when to combine them.

Capsula exhibits concepts specifically dedicated to the domain of user interfaces. By default, Capsula supports building web UIs (relies on the DOM API), however this can be changed by extending it to work with any other JavaScript widget API, both client- or server-side.

It is quite usual for applications to have components that perform a communication based on the client-server (request-response) paradigm. Capsula provides for decoupling clients from specifics of the server, communication channel, and implementation APIs, and enables clients to become more powerful and yet independent and reusable.

Continue reading to make yourself familiar with all the concepts of Capsula library.

### Capsule Class and the Encapsulation Model

The base concept of Capsula library is the *Capsule* class. In many ways capsules are similar to the typical OO classes. They support single inheritance model and polymorphism the way OO classes do. However, capsules differ from OO classes in many ways as well. They are dynamic the way JavaScript language is. They employ rather novel encapsulation model and provide many new and powerful concepts. Applications built with Capsula are neatly structured, ease to manage, and with clearly visible multi-level architecture.

As already stated, Capsule is a class similar to an OO class with different encapsulation model. In a typical OO encapsulation model, all public properties and methods of all living objects are accessible from anywhere in the code, only a reference to an object is needed. Since everything public is accessible, we have to carefully manage references to avoid our code becoming "spaghetti". And this may be a bit too difficult.

Capsula proposes a restriction to the typical OO policy of access rights. The restriction is simple to understand and use while being rather effective: capsule instance *ca* is allowed to access public properties of capsule instance *cb* if and only if *cb* is created (instantiated) in the context of *ca*. In other words, the policy is "you access what you create".

Learn more about capsules, their properties, and the encapsulation model [here]{@link module:capsula.Capsule}.

### Decoupling Layout from Behavior

Apart from the novel encapsulation model which is useful in any application domain, Capsula exhibits concepts specifically dedicated to the domain of user interfaces (or more generally, to domains where one of the tasks is to manage a hierarchy). These concepts are developed to decouple managing hierarchy from managing any other behavior. This brings lots of flexibility.

Let's reach out for an example. Imagine a menu widget controlling the visibility of a couple of other widgets. The menu and the widgets are interacting in sense that when a menu item is selected a corresponding widget is displayed. In a typical UI library, if the menu and the widgets are to be promoted into a single reusable component (let's call it a tab), they must all be placed under the same roof, i.e. under the single root widget (root panel, div, or whatever). This way, the functionality of interaction between them is tightly coupled to a specific layout of the tab's root widget. If requested to have the menu rendered in one part of the screen and the widgets in another while preserving their interaction, the whole concept fails short.

The way Capsula handles this is much more flexible and allows engineers to combine interacting widgets into a larger pieces without gluing them together in terms of layout. This particular idea brings huge flexibility and enables engineers to create extremely rich and complex components that have very high potential for reuse because their parts while interacting are not bound to each other in terms of layout.

Learn more about decoupling layout and behavior [here]{@link module:capsula.Hook}.

### Declarative vs Imperative Approach: Templates vs Object-Orientation

Duality of declarative and imperative programming styles is a reality when developing software nowadays. While imperative approach brings more flexibility, control, and easier debugging, declarative styles are more expressive, easier to use, and reduce number of bugs in the program. Capsula provides for both styles, letting the programmer decide when to use which of the two and of course when to combine them. 

For example, this duality becomes obvious when building user interfaces: is it better to use templates (being a declarative approach) or object-oriented style (imperative)? 

Capsula library tries to resolve this by providing means to build user interfaces by using either one of the styles or both. It allows engineers to choose between templates and object-orientation according to their personal preferences or assessment of the tasks to be performed. Although syntactically different, artifacts developed using the two different styles in Capsula are semantically alike and could easily be combined and used together.

Check out the [Element]{@link module:html.Element} and the [Template]{@link module:html.Template} built-in capsules to get informed on both object-oriented and template-based ways of building user interfaces using Capsula library, respectively.

### Empowering Communication and Decoupling Communication Parties

It is quite usual for applications to have components that perform a communication based on client-server (request-response) paradigm. This is especially true when building user interfaces. 

Capsula library provides the concept of *service* to decouple clients from the server and enable them to be more powerful and yet independent and reusable. Service is a named facade that simplifies server's interface and handles communication. For example, a widget that performs communication with the server to display data usually depends on both the communication channel (by using the select communication API) and the server (by using the server's URL). The concept of service helps here to completely decouple the clients (widgets) from the specifics of communication channel or the opposite communication party.

To learn how services empower communication read the [services module]{@link module:services} for more information.

### Further Reading

Make sure you have covered all of the following articles:

- [Capsule class and the basic concepts]{@link module:capsula.Capsule}
- [The concepts of input and output operations]{@link module:capsula.Operation}
- [Managing layout using hooks and loops]{@link module:capsula.Hook}
- [Creating capsule class with defCapsule]{@link module:capsula.defCapsule}
- [ElementRef capsule]{@link module:capsula.ElementRef}
- [Element capsule]{@link module:html.Element}
- [Template capsule]{@link module:html.Template}
- [The services module page]{@link module:services}
- [HasRootHTML capsule]{@link module:html.HasRootHTML}

