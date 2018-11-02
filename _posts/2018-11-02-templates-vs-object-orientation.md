---
layout: post
title:  "Front-end Programming: Templates vs Object Orientation?"
date:   2018-11-02 16:45:15 +0200
categories: programming ui
tags: templates object-orientation
---

Duality of declarative and imperative programming styles is a reality when developing software nowadays. While imperative approach brings more flexibility, control, and easier debugging, declarative styles are more expressive, easier to use, and reduce number of bugs in the program. This duality becomes obvious when building user interfaces: is it better to use templates (being a declarative approach) or (imperative) object-oriented style?

Well, it depends on specifics of the particular task and partly even on personal preference. [Capsula]({{ "/tutorial" | relative_url }}) allows engineers to choose between [templates]({{ "/tutorial#working-with-templates" | relative_url }}) and [object-orientation]({{ "/tutorial#object-oriented-approach" | relative_url }}). Although syntactically different, artifacts developed using the two different styles in Capsula are semantically alike and could easily be combined and used together. Let'see how exactly.

For example, imagine a select box and a deck of divs each presenting information specific to a single value from the select box. According to selection in the select box, the corresponding div should be made visible (while all others being invisible).

Let's first implement the deck of divs. Since it has a bit dynamics inside, we opt for OO approach.

```js
var Deck = capsula.defCapsule({
    loops: 'root',
    hooks: 'content',

    // the container div for inner divs (that represent conditionally visible content)
    contentWrapper: {
        capsule: html.Element,
        args: 'div'
    },

    // declarative ties to tell what is mapped to this capsule's hooks and loops
    'this.content': 'contentWrapper.hook',
    'this.root': 'contentWrapper.loop',

    // setVisible makes sure the inner div with the given index is made visible
    '+ setVisible': function(index){
        var cwElement = this.contentWrapper.getElement(); // returns the DOM element
        for (var i = 0; i < cwElement.children.length; i++) {
            var childElement = cwElement.children.item(i);
            if (i == index)
                childElement.style.display = 'block';
            else
                childElement.style.display = 'none';
        }
    },

    // constructor (makes sure when new child is added the first child gets visible)
    init: function(){
        this.content.setEventHandlers(function onHook(){
            this.setVisible(0);
        });
    }
});
```

> Before we explain the code above, please note that all Capsula modules are imported on this very page, so you can simply open the browser's console (F12) and copy or type the code of this article and everything should work immediatelly; no additional setup needed. By the way, this holds for all pages of this website.

Now, let's get back to our deck. In the first lines we create the ```root``` loop and the ```content``` hook. These two will be used by deck's clients to put the deck somewhere on the page and to add content to it, respectively. 

Then we create the ```contentWrapper``` part, a wrapper for the deck's content, i.e. the deck's root element. Then, we immediatelly declare that deck's hook and loop are basically the same as the ```contentWrapper```'s hook and loop. 

After that, we create ```setVisible``` public method responsible for making visible deck's child with the given index. And finnaly, we call the [setEventHandlers]({{ "/api-reference/module-capsula.Hook.html" | relative_url }}#setEventHandlers){:target="_blank"} method on the ```content``` hook to react each time new child is added to deck.

Now let's instantiate our deck and add some content to it.

```js
var deck = new Deck();

var defaultContent = new html.Element('div'); // the content to display by default
defaultContent.setInnerHTML('Nothing selected');

var animal = new html.Element('div'); // the content related to animals
animal.setInnerHTML('A living organism that feeds on organic matter...');

var car = new html.Element('div'); // the content related to cars
car.setInnerHTML('A road vehicle, typically with four wheels...');

deck.content.add(defaultContent.loop);
deck.content.add(animal.loop);
deck.content.add(car.loop); // or simply deck.add(defaultContent, animal, car);
```

So our deck is filled with content, but still not displayed on the page. Let's fix that.

> For the purpose of this tutorial, we have created the ```sandbox``` div which you can use in your browser's console to put content in it. It gets visible only after you start using it. The ```sandbox``` is available on all pages of this website.

So, let's put the ```deck``` into the ```sandbox```.

```js
sandbox.add(deck); // Or in non-abbreviated way: sandbox.content.add(deck.root);
```

Now the ```sandbox``` and the ```deck``` should both be visible in the top-left corner of this web page.

If you prefer not to use the ```sandbox``` you can simply take any DOM element of this page and put our deck in it: ```deck.root.renderInto(document.body)```.

Now that we have our deck ready, let's focus on our select box. Creating select box using the OO approach would require creating a select element and a number of option elements, plus setting all the attributes and inner texts. Creating it using templates seems much easier and more natural.

```js
var selectBox = new html.Template(`
    <select loop="root" on="change" output="onChange">
        <option value="0">-- choose an option --</option>
        <option value="1">animal</option>
        <option value="2">car</option>
    </select>
`);

sandbox.addAt(0, selectBox); // or sandbox.content.addAt(0, selectBox.root);
```

Now, our select box is ready as well. It displays all the options and reacts on change (thanks to the ```on``` and the ```output``` attributes). However, there is no one listening. Before we make our select box and our deck work together, let's just make a small adjustment.

Output operations of template capsules provide the DOM event object as their argument. In this case however, we need to signal the ```selectBox```'s value (0, 1, or 2) instead of the event itself. For that purpose, we will add a filter to the output ```onChange``` operation.

```js
selectBox.onChange.setFilter(function(event){
    return [event.target.value]; // should return a new array of filtered arguments
});
```

Now, the ```selectBox``` template reacts on change and signals the selected value through its ```onChange``` output operation. This is also a small demonstration on how to use operation's [setFilter]({{ "/api-reference/module-capsula.Operation.html" | relative_url }}#setFilter){:target="_blank"} method to modify or filter out its actual arguments.

Finally, we have both parts ready, and there is only one thing we should do: we need to make them work together, i.e. we need to make our deck resposive in terms of changes in the select box. So, how do we do that? Well, very simple:

```js
selectBox.onChange.target(deck.setVisible);
```

Now it's obvious how easily it is to combine parts of your user interface even though they have been developed using different programming styles. This is because they are semantically aligned; their interfaces are made out of the same types of objects (operations, methods, hooks, and loops) regardless of the way we've built them. This makes Capsula truly powerful.

So, in reference to the headline question, a short answer would be: 

*"if they speak the same language, then certainly both"*.



