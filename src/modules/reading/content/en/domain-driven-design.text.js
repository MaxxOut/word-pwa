export default {
  id:     'en-domain-driven-design',
  topic:  'tech',
  level:  'B2',
  added:  '2026-11-14',
  title:  'Domain-Driven Design',
  source: 'Википедия, статья «Domain-driven design» (en.wikipedia.org), CC BY-SA 4.0; сокращено и адаптировано',
  chapters: [
    {
      title: 'What Is Domain-Driven Design?',
      text: `Domain-driven design, or DDD, is an approach to software design. Its main idea is simple: the software should be a model of the domain it works with, and this model should be built together with the people who know the domain best — the domain experts.

A domain is the subject area where people use a program. For a bank, the domain is loans, accounts and payments. For a hospital, it is patients, doctors and appointments. In DDD, the structure and the language of the code should match this domain. If a program processes loan applications, it should have classes such as "loan application" and "customer", and methods such as "accept offer" or "withdraw".

DDD has three main goals. First, the project should focus on the core domain and its logic, not on technical details. Second, complex designs should be based on a model of the domain. Third, developers and domain experts should work together creatively and improve this model step by step.

DDD does not believe in one big model for the whole system. Instead, it divides a large system into smaller parts called bounded contexts, and each of them has its own model.

The term was introduced by Eric Evans in his book Domain-Driven Design, published in 2003. Critics say that DDD asks developers to put a lot of effort into isolating the model and keeping it clean. Even Microsoft recommends DDD only for complex domains, where a shared model brings clear benefits.`,
    },
    {
      title: 'A Common Language and Its Models',
      text: `At the centre of DDD is the domain model: a set of ideas that describes the important parts of a domain and helps to solve its problems. Around this model, the team builds a common language shared by domain experts, users and developers. Evans calls it the ubiquitous language. The same words are used in conversations, in the requirements and in the code. Together with strategic design and tactical design, this language is one of the pillars of DDD.

DDD describes several kinds of objects in a model. An entity is defined not by its attributes but by its identity. For example, airlines give every seat on every flight a unique number: this number is the identity of the seat. A value object, on the other hand, has attributes but no identity, and it never changes. When people exchange business cards, they care only about the information on the card, not about which exact card they are holding.

A model can also describe events — things that happened in the past. A domain event is an event that domain experts care about, for example "order placed" or "payment received".

Several objects can be joined together under one root entity. This group is called an aggregate. Objects outside the aggregate may refer only to the root, never to the other objects inside it, and the root checks that every change keeps the aggregate consistent. A car is a good example: a driver does not control each wheel separately, they simply drive the car. The car is an aggregate of many objects — the engine, the brakes, the headlights and so on.`,
    },
    {
      title: 'Working with the Model',
      text: `In DDD, creating and storing objects is usually separated from the objects themselves. A repository is an object that finds domain objects in a data store, such as a database, and gives them back to the program. A factory is an object whose job is to create new domain objects. When some behaviour does not naturally belong to any object, it is usually placed in a service.

Events also come in different kinds. Domain events describe important things inside one bounded context. They carry only the information that is needed, because the code that listens to them usually lives in the same service and its needs are well understood.

Integration events, by contrast, tell other bounded contexts about a change. They keep data consistent across the whole system. Because their listeners can need very different things, integration events often carry more data — sometimes more than any single listener really needs.`,
    },
    {
      title: 'Bounded Contexts',
      text: `A bounded context is an area of the system where one model is valid and consistent. The word "customer", for example, may mean slightly different things to the sales team and to the support team, so each context keeps its own clear meaning.

Context mapping describes how these contexts relate to each other. Evans lists several patterns. In a partnership, two teams plan their work together because they will succeed or fail together. In a shared kernel, teams agree to share a small part of the model and keep it small. In a customer–supplier relationship, one team depends on the other, and the relationship is made clear. A conformist team simply accepts the other team's model, because a special interface for them is not going to happen.

An anticorruption layer is a separate layer that translates another system's model into your own terms, so that the other model does not "leak" into yours. An open-host service offers a set of services to many other systems at once, and a published language — for example, a data exchange standard in some industry — gives everyone a common, well-documented way to talk. Sometimes the best choice is to go separate ways and not connect two contexts at all. And when an old system has no real boundaries, it can only be described as a "big ball of mud".

Today bounded contexts are often mapped to microservices. One context per microservice is usually ideal: the boundaries stay clear, parts depend less on each other, and each service can be deployed and scaled on its own. Sometimes, however, one context is split into several services, or several small contexts live in one service to keep things simple. The choice should balance DDD principles with business goals and technical limits.`,
    },
    {
      title: 'Related Ideas',
      text: `DDD does not require object-oriented programming, but in practice it uses it a lot: entities and aggregate roots receive commands, keep their state hidden inside, and bounded contexts organise the system at a higher level. The idea is that domain objects should be defined by the behaviour of the business, not by a particular technology or framework.

Command Query Responsibility Segregation, or CQRS, is a pattern that separates reading data (a query) from changing data (a command). Commands change the state, queries only read it. CQRS does not need DDD, but the two work well together: a command is handled by a method of an aggregate root, which checks the rules and either reports a failure or changes its state.

Event storming is a workshop where domain experts, stakeholders and developers model the domain together. They put coloured sticky notes on a wall to show what happens in the domain, why it happens and what follows from it. This helps a team find subdomains, bounded contexts and the boundaries of aggregates before writing any code.

Event sourcing is a pattern in which an object does not store its current state directly. Instead, it stores every event that has happened to it, and the state is rebuilt from these events. Combined with CQRS and DDD, an aggregate root receives a command, checks it and produces one or more events. These events are saved and then often sent to other parts of the system that are interested in them.`,
    },
  ],
}
