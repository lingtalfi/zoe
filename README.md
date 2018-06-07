Zoe
==============
2018-06-07



A minimal js to work with ajax related events.
It's designed to work with [ecp](https://github.com/lingtalfi/Ecp) requests.






request
------------

In the following example, the following uri is called:

- /service/Ekom/ecp/api.php?action=back.morphic

The data array is passed to the script using HTTP POST.
The response is formatted according to the ecp protocol.


```js
zoe.inst().request("Ekom:back.morphic", data, function (response) {
    // now do something with the successful response...
});
```







on, trigger
------

We can define events using the `on` method, and trigger them later using the `trigger` method.

```js
var api = zoe.inst();
api
    .on("myEvent", function () {
        alert("fire");
    })
    .trigger("myEvent");
```


We can also pass an array of event names: 


```js
var api = zoe.inst();


api.on(["myEvent", "anotherEvent"], function (eventName) {
    alert("fire ");
});


api.trigger("anotherEvent"); // alert fire
api.trigger("myEvent"); // alert fire
api.trigger("dumm"); // rien ne se passera ici
```


###### Pass arguments

We can also pass arguments

```js
var api = zoe.inst();


api.on("myEvent", function (name, age) {
    alert("Je m'appelle " + name + " et j'ai " + age + ' ans');
});
api.trigger("myEvent", "Jordi", 4);

```


off
------

We can programmatically remove an event defined with the `on` method.

```js
var api = zoe.inst();


api.on(["myEvent", "anotherEvent"], function (letter) {
    alert("fire " + letter);
});


api.off("myEvent");

api.trigger("anotherEvent", "a"); // alert a
api.trigger("myEvent", "b"); // nothing will happen here
api.trigger("dumm", "c"); // nothing will happen here
```



once
----------

To remove an event after its first execution.

```js
var api = zoe.inst();


api.on("myEvent", function () {
    alert("fire");
});
api.trigger("myEvent"); // fire
api.trigger("myEvent"); // fire


api.once("myEvent2", function () {
    alert("fire2");
});
api.trigger("myEvent2"); // fire2
api.trigger("myEvent2"); // rien ici
```



debounce
----------

Reduce the number of callback calls to 1 within a given (very short) period of time.


```js

// without debounce, the callback is triggered every time the keyboard is touched
jSearch.on('keyup.gui', function () {
    currentSearch = jSearch.val();
    refresh();
});


// with debounce the callback is triggered with a minimal delay of 250ms in-between every call (calls registered during this period are just dropped)
jSearch.on('keyup.gui', zoe.inst().utils.debounce(function () {
    currentSearch = jSearch.val();
    refresh();
}, 250));

```










History Log
------------------
    
- 1.0.0 -- 2018-06-07

    - initial commit
    







