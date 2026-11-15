export default {
  id:     'en-vue-reactivity',
  topic:  'tech',
  level:  'C1',
  added:  '2026-11-08',
  title:  'Vue: Reactivity in Depth',
  source: 'Документация Vue.js, «Reactivity in Depth» (vuejs.org), CC BY 4.0, © Evan You и авторы документации; без примеров кода, адаптировано',
  chapters: [
    {
      title: 'What Is Reactivity?',
      text: `One of Vue’s most distinctive features is the unobtrusive reactivity system. Component state consists of reactive JavaScript objects. When you modify them, the view updates. It makes state management simple and intuitive, but it’s also important to understand how it works to avoid some common gotchas. In this section, we are going to dig into some of the lower-level details of Vue’s reactivity system.

This term comes up in programming quite a bit these days, but what do people mean when they say it? Reactivity is a programming paradigm that allows us to adjust to changes in a declarative manner. The canonical example that people usually show, because it’s a great one, is an Excel spreadsheet.

Imagine that cell A2 is defined via a formula of A0 + A1, so the spreadsheet gives us 3. No surprises there. But if you update A0 or A1, you’ll notice that A2 automagically updates too.

JavaScript doesn’t usually work like this. If we wrote something comparable in JavaScript and then changed A0, A2 would not change automatically.

So how would we do this in JavaScript? First, in order to re-run the code that updates A2, let’s wrap it in a function called update. Then, we need to define a few terms.

The update function produces a side effect, or effect for short, because it modifies the state of the program. A0 and A1 are considered dependencies of the effect, as their values are used to perform the effect. The effect is said to be a subscriber to its dependencies.

What we need is a magic function that can invoke the effect whenever A0 or A1, the dependencies, change. This function has the following tasks.

First, track when a variable is read. For example, when evaluating the expression A0 + A1, both A0 and A1 are read.

Second, if a variable is read when there is a currently running effect, make that effect a subscriber to that variable. Because A0 and A1 are read when update is being executed, update becomes a subscriber to both A0 and A1 after the first call.

Third, detect when a variable is mutated. For example, when A0 is assigned a new value, notify all its subscriber effects to re-run.`,
    },
    {
      title: 'How Reactivity Works in Vue',
      text: `We can’t really track the reading and writing of local variables like in the example. There’s just no mechanism for doing that in vanilla JavaScript. What we can do though, is intercept the reading and writing of object properties.

There are two ways of intercepting property access in JavaScript: getters and setters, and Proxies. Vue 2 used getters and setters exclusively due to browser support limitations. In Vue 3, Proxies are used for reactive objects and getters and setters are used for refs.

This explains a few limitations of reactive objects. When you assign or destructure a reactive object’s property to a local variable, accessing or assigning to that variable is non-reactive, because it no longer triggers the get and set proxy traps on the source object. Note this disconnect only affects the variable binding: if the variable points to a non-primitive value such as an object, mutating the object would still be reactive. Also, the proxy returned from reactive, although behaving just like the original, has a different identity if we compare it to the original object.

When a property is read, Vue checks whether there is a currently running effect. If there is one, it looks up the subscriber effects, stored in a Set, for the property being tracked, and adds the effect to the Set. Effect subscriptions are stored in a global data structure: a WeakMap of targets, each holding a Map of keys, each holding a Set of effects. If no Set of subscribing effects is found for a property, because it is being tracked for the first time, it will be created.

When a property is changed, Vue again looks up the subscriber effects for the property. But this time it invokes them instead.

The magic function wraps the raw update function in an effect that sets itself as the current active effect before running the actual update. This enables tracking during the update to locate the current active effect.

At this point, we have created an effect that automatically tracks its dependencies, and re-runs whenever a dependency changes. We call this a reactive effect.

Vue provides an API that allows you to create reactive effects: watchEffect. In fact, it works pretty similarly to the magic function in our example. Using a reactive effect to mutate a ref isn’t the most interesting use case, though. A computed property makes it more declarative. Internally, computed manages its invalidation and re-computation using a reactive effect.

So what’s an example of a common and useful reactive effect? Well, updating the DOM! In fact, this is pretty close to how a Vue component keeps the state and the DOM in sync: each component instance creates a reactive effect to render and update the DOM. Of course, Vue components use much more efficient ways to update the DOM than simply replacing its HTML.

The ref, computed and watchEffect APIs are all part of the Composition API. If you have only been using the Options API with Vue so far, you’ll notice that the Composition API is closer to how Vue’s reactivity system works under the hood. In fact, in Vue 3 the Options API is implemented on top of the Composition API. All property access on the component instance triggers getters and setters for reactivity tracking, and options like watch and computed invoke their Composition API equivalents internally.`,
    },
    {
      title: 'Runtime vs. Compile-time Reactivity',
      text: `Vue’s reactivity system is primarily runtime-based: the tracking and triggering are all performed while the code is running directly in the browser. The pros of runtime reactivity are that it can work without a build step, and there are fewer edge cases. On the other hand, this makes it constrained by the syntax limitations of JavaScript, leading to the need of value containers like Vue refs.

Some frameworks, such as Svelte, choose to overcome such limitations by implementing reactivity during compilation. The framework analyzes and transforms the code in order to simulate reactivity. The compilation step allows the framework to alter the semantics of JavaScript itself, for example, implicitly injecting code that performs dependency analysis and effect triggering around access to locally defined variables. The downside is that such transforms require a build step, and altering JavaScript semantics is essentially creating a language that looks like JavaScript but compiles into something else.

The Vue team did explore this direction via an experimental feature called Reactivity Transform, but in the end decided that it would not be a good fit for the project.

It’s great that Vue’s reactivity system automatically tracks dependencies, but in some cases we may want to figure out exactly what is being tracked, or what is causing a component to re-render. For this, Vue offers special debugging hooks for components, computed properties and watchers. They tell you which dependencies were tracked and which mutation triggered an update. These hooks only work in development mode.`,
    },
    {
      title: 'Integration with External State',
      text: `Vue’s reactivity system works by deeply converting plain JavaScript objects into reactive proxies. The deep conversion can be unnecessary or sometimes unwanted when integrating with external state management systems, for example if an external solution also uses Proxies.

The general idea of integrating Vue’s reactivity system with an external state management solution is to hold the external state in a shallow ref. A shallow ref is only reactive when its value property is accessed: the inner value is left intact. When the external state changes, replace the ref value to trigger updates.

If you are implementing an undo and redo feature, you likely want to take a snapshot of the application’s state on every user edit. However, Vue’s mutable reactivity system isn’t best suited for this if the state tree is large, because serializing the entire state object on every update can be expensive in terms of both CPU and memory costs.

Immutable data structures solve this by never mutating the state objects. Instead, they create new objects that share the same, unchanged parts with old ones. There are different ways of using immutable data in JavaScript, but the Vue team recommends Immer, because it allows you to use immutable data while keeping the more ergonomic, mutable syntax.

A state machine is a model for describing all the possible states an application can be in, and all the possible ways it can transition from one state to another. While it may be overkill for simple components, it can help make complex state flows more robust and manageable. One of the most popular state machine implementations in JavaScript is XState, and it can be connected to Vue with a small composable.`,
    },
    {
      title: 'Connection to Signals',
      text: `Quite a few other frameworks have introduced reactivity primitives similar to refs from Vue’s Composition API, under the term “signals”: Solid, Angular, Preact and Qwik all have their own signals.

Fundamentally, signals are the same kind of reactivity primitive as Vue refs. A signal is a value container that provides dependency tracking on access, and side-effect triggering on mutation. This paradigm isn’t a particularly new concept in the frontend world: it dates back to implementations like Knockout observables and Meteor Tracker from more than a decade ago. The Vue Options API and the React state management library MobX are also based on the same principles, but hide the primitives behind object properties.

Although not a necessary trait for something to qualify as signals, today the concept is often discussed alongside the rendering model where updates are performed through fine-grained subscriptions. Due to the use of Virtual DOM, Vue currently relies on compilers to achieve similar optimizations. However, the team is also exploring a new Solid-inspired compilation strategy, called Vapor Mode, that does not rely on Virtual DOM and takes more advantage of Vue’s built-in reactivity system.

The design of Preact and Qwik’s signals is very similar to Vue’s shallow ref: all three provide a mutable interface via a value property. Solid’s API design, by contrast, emphasizes read and write segregation. Signals are exposed as a read-only getter and a separate setter. This means a signal can be passed down without the setter, which ensures that the state can never be mutated unless the setter is also explicitly exposed. Whether this safety guarantee justifies the more verbose syntax depends on the requirements of the project and personal taste.

Angular is undergoing some fundamental changes by giving up dirty-checking and introducing its own implementation of a reactivity primitive. Compared to Vue refs, the getter-based style of Solid and Angular provides some interesting trade-offs. Calling a function is slightly less verbose than reading a value property, but updating the value is more verbose. There is no ref unwrapping: accessing values always requires a function call. This makes value access consistent everywhere, and it also means you can pass raw signals down as component props.

Whether these API styles suit you is to some extent subjective. The goal here is to show the underlying similarity and trade-offs between these different API designs, and that Vue is flexible: you are not really locked into the existing APIs. Should it be necessary, you can create your own reactivity primitive API to suit more specific needs.`,
    },
  ],
}
