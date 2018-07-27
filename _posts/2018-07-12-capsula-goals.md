---
layout: post
title:  "The Goals of Capsula Library"
date:   2018-07-12 16:37:15 +0200
categories: concepts
permalink: /goals-of-capsula/
---

From our own experience and developers' opinions we believe front-end developers are, in two words, "not happy". To change that we've set the following goals before building Capsula library.

> Set Up a Balance Between Declarative and Imperative

Duality of declarative and imperative programming styles is a reality when developing software nowadays. While imperative approach brings more flexibility, control, and easier debugging, declarative styles are more expressive, easier to use, and reduce number of bugs in the program. It would be great to have the best of both worlds. 

However, simply having declarative and imperative APIs is not enough, unless artifacts developed using the two styles are semantically alike (same abstraction level). There must be an easy way to combine them and use them together; in other words, we need them to speak the same language. Once we have that, we can let developers decide (according to the nature of problems they solve) when to use which of the two.

In user interfaces, this duality is reflected in templates (being a declarative approach) versus object-oriented widget manipulation (imperative). We certainly need both. However, whatever of the two we choose to use when building a UI component, there has to be the way to express UI component's interface in terms of the same concepts, so that we can use the component the same way regardless of how it was built.

> Handle Complexity Better

To address complexity we need a concept or mechanism for hierarchical organization of UI code. The concept that could be recursively re-applied starting from high architectural levels down to the lowest levels of simple UI components.

> Never Compromise on Flexibility

There's never enough of flexibility in programming languages and tools. When flexibility is low we fall back to workarounds and hacks much too often. We don't want that. We strive for ultimate flexibility.

Most UI frameworks and libraries fail at flexibility because of the way they conceptualize UI components. In most cases, UI component means single root container (div, panel) and a bit of behavior under that roof. What happens when you have two or more widgets in a mutual interaction that need not be placed under the same container? How to encapsulate that in a single component? We need rethinking in how we conceptualize UI components.

We also want ability to be completely native when needed, because developers feel relaxed when being close enough to the metal.

> Raise the Abstraction Level when Working with Data

In most cases handling data is like: pack it, send it, unpack it, use it. Could this be improved? Could you imagine handling data the way we do server-side: through the high-level object-oriented API with transactions and all that? And without worrying about packing/sending/unpacking? This is what we want to achieve here.

> Relieve the Development Cycle

There are many ways how we get executable JavaScript code nowadays. Most people use transpiling in the process. Some even write Java and then compile it to JavaScript. But is this really necessary?

We want the simplest and shortest possible development cycle from making modification in your code to verification that it works (or not) plus no time spent in setting up transpilers/compilers/whatever.

> No External Dependencies

We want Capsula to be as independent as possible. That means independent of external libraries, development tools, and server-side platforms (Java, Python, PHP, Node.js...). The only acceptable dependency is on the JavaScript.

As a conclusion, we want Capsula to be easy to learn, expressive and powerful, flexible and native, and free from accidental complexity. Capsula should be completely transparent to developers and should enable them to focus only on what's essential.

Ready to try? Let's [get started](/tutorial).