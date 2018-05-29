## Capsula

**Capsula** is a JavaScript library for building user interfaces and other types of applications using truly encapsulated software components called *capsules*. In many ways capsules are similar to the typical OO classes. They support single inheritance model and polymorphism the way OO classes do. However, capsules differ from OO classes in many ways as well. They are dynamic the way JavaScript language is. Also, they employ rather novel encapsulation model and accommodate many new and powerful concepts designed to handle complexity and favour encapsulation, flexibility and reuse. Applications built with Capsula are neatly structured, ease to manage, and with clearly visible multi-level architecture.

### The Encapsulation Model

The base concept of Capsula library is the *Capsule* class. The Capsule is a class similar to an OO class with different encapsulation model and many new and powerful concepts.

In a typical OO encapsulation model, all public properties and methods of all living objects are accessible from anywhere in the code, only a reference to an object is needed. Since everything public is accessible, we have to carefully manage references to avoid our code becoming "spaghetti". And this may be a bit too difficult.

Capsula proposes a restriction to the typical OO policy of access rights. The restriction is simple to understand and use while being rather effective. It enables engineers to manage their code effortlessly.

### Decoupling Layout from Behavior

Apart from the novel encapsulation model which is useful in any application domain, Capsula exhibits concepts specifically dedicated to the domain of user interfaces (or more generally, to domains where one of the tasks is to manage a hierarchy). These concepts are developed to decouple managing hierarchy from managing any other behavior. This brings lots of flexibility.

Let's reach out for an example. Imagine a menu widget controlling the visibility of a couple of other widgets. The menu and the widgets are interacting in sense that when a menu item is selected a corresponding widget is displayed. In a typical UI library, if the menu and the widgets are to be promoted into a single reusable component (let's call it a tab), they must all be placed under the same roof, i.e. under the single root widget (root panel, div, or whatever). This way, the functionality of interaction between them is tightly coupled to a specific layout of the tab's root widget. If requested to have the menu rendered in one part of the screen and the widgets in another while preserving their interaction, the whole concept fails short.

The way Capsula handles this is much more flexible and allows engineers to combine interacting widgets into a larger pieces without gluing them together in terms of layout. This particular idea brings huge flexibility and enables engineers to create extremely rich and complex components that have very high potential for reuse because their parts while interacting are not bound to each other in terms of layout.

Read more on encapsulation model and core concepts of Capsula library in the *capsula.js* module.

### Declarative vs Imperative Approach: Templates vs Object-Orientation

Duality of declarative and imperative programming styles is a reality when developing software nowadays. While imperative approach brings more flexibility, control, and easier debugging, declarative styles are more expressive, easier to use, and reduce number of bugs in the program. Capsula provides for both styles, letting the programmer decide when to use which of the two and of course when to combine them. 

For example, this duality becomes obvious when building user interfaces: is it better to use templates (being a declarative approach) or object-oriented style (imperative)? 

Capsula library tries to resolve this by providing means to build user interfaces by using either one of the styles or both. It allows engineers to choose between templates and object-orientation according to their personal preferences or assessment of the tasks to be performed. Although syntactically different, artifacts developed using the two different styles in Capsula are semantically alike and could easily be combined and used together.

Check out the *html.js* module for more information.


### Empowering Communication and Decoupling Communication Parties

It is quite usual for applications to have components that perform a communication based on request-response paradigm. This is especially true when building user interfaces. 

Capsula library provides the concept of *service* to decouple clients from the server and enable them to be more powerful and yet independent and reusable. Service is a named facade that simplifies server's interface and handles communication. For example, a widget that performs communication with the server to display data usually depends on both the communication channel (by using the select communication API) and the server (by using the server's URL). The concept of service helps here to completely decouple the clients (widgets) from the specifics of communication channel or the opposite communication party.

To learn how services empower communication read the *services.js* module for more information.

### Further Reading

To continue reading, please check the capsula.js module to make yourself familiar with all the basic concepts of Capsula library, then proceed to html.js and services.js modules.