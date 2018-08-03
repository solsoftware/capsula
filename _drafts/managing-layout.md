---
layout: post
title:  "A New Way to Manage Layout of Widgets Using JavaScript and Capsula"
date:   2018-07-26 16:37:15 +0200
categories: ui
---

Imagine a typical tab UI component (see the figure just bellow). Tab has a menu that reacts on user clicks and makes sure the corresponding page is displayed bellow. Tab capsule (also shown bellow) implements this behavior internally.

<img src="{{ "/assets/img/tab-2.png" | relative_url }}" style="margin-right:5em"><img src="{{ "/assets/img/tab-1.png" | relative_url }}">

Tab has two roles. It acts as a parent widget for its contents. This role is represented by the pages hook of the tab capsule, i.e. the pages hook represents the tab as a parent in tab's parent-child relationships with its children.

On the other hand, tab acts as a child widget for its container. This role is represented by the loop named loop of the tab capsule, i.e. the loop represents the tab as a child in the tab's parent-child relationship with its parent.

At this point, the tab capsule is not too good in terms of reusability because although we can reuse the tab as it is, in terms of layout the tab menu and its contents are bound to one another which is quite inflexible. How can that be improved then?

It is not difficult to imagine a requirement to have an ads section between the tab menu and the tab contents (see bellow). In that case, our tab capsule won't do the job. However, we improve it by introducing additional hook named ads in the tab capsule. Now, if we use the ads hook (i.e. put something in it) we are able to meet the given requirement, otherwise the tab looks the same as before. This improves flexibility of the tab because the ads hook allows us to put anything we want between the tab menu and the tab contents and that is done outside of the tab capsule. So, instead of ads, we can have the breaking news section in between, or anything else. This is better, but still one could ask for more flexibility.

<img src="{{ "/assets/img/tab-4.png" | relative_url }}" style="margin-right:5em"><img src="{{ "/assets/img/tab-3.png" | relative_url }}">

Let's forget the ads hook, reset to the original tab capsule, and redesign it from scratch. Instead of a single loop, let's create two loops: tabMenu and tabContents. The tabMenu loop represents the tabMenu widget as a child in its parent-child relationship with its parent. The tabContents loop represents the container of tab pages as a child in its parent-child relationship with its parent. Now, the programmer can decide where in the page to put the tab menu and where to put the tab contents (see the figure bellow). In this example, the tab contents is displayed first on the page, then there is some arbitrary contents (designated with three dots), and finally there is the tab menu. Still, wherever the tab menu and the tab contents are placed on the page, they continue to work together so when the tab menu item is clicked, the corresponding page is displayed.

Decisions on where to put the menu and the contents are left to the programmer that uses the tab capsule, i.e. they are extracted from the tab capsule and now belong to the outside of the tab capsule. This is why the tab capsule as it is now is much more flexible (and because of that much more reusable) than before. The interaction between the tab menu and the tab contents is however left inside the capsule, which makes sense because the two are logically related. This is the most flexible solution one could ask for.

<img src="{{ "/assets/img/tab-6.png" | relative_url }}" style="margin-right:5em"><img src="{{ "/assets/img/tab-5.png" | relative_url }}">

As shown in this example, a capsule is a logical unit of work; what the logic of a capsule is, is left to programmers to decide. The logic may or may not include layout decisions, again according to the requirements. Hooks and loops allow for decoupling the layout from other concerns in an effective way. This brings lots of flexibility and improves capsules' potential for reuse.