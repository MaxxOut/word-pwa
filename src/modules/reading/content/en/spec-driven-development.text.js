export default {
  id:     'en-spec-driven-development',
  topic:  'tech',
  level:  'B2',
  added:  '2026-11-17',
  title:  'Spec-Driven Development: Writing the Plan Before the Code',
  source: null,
  chapters: [
    {
      title: 'The Problem with "Just Ask the AI"',
      text: `When AI coding assistants became popular, many developers started working in a new way. They opened a chat, described what they wanted in one or two sentences and watched the assistant produce hundreds of lines of code. For small experiments this felt like magic. People even invented a name for it: "vibe coding", where you follow the feeling of the moment instead of a plan.

The problems appeared when projects grew. A short request leaves a lot of room for guessing. If you ask for "a page where users can register", the assistant has to decide many things on its own. Which fields are required? What happens if the email is already taken? Should the password have rules? Do we send a confirmation letter? The model makes a choice for every open question, and those choices are often reasonable, but they are not necessarily yours.

Each guess is small, but together they add up. After a few days the code base is full of decisions that nobody really made. The next request to the assistant is based on this code, so the guesses start to build on each other. At some point the developer no longer knows why the application behaves the way it does, and fixing one thing quietly breaks another.

There is a second problem. A chat is not a good place to keep knowledge. The important details live in a long conversation that disappears when the session ends. A new team member, or even the same assistant a week later, cannot easily find out what was agreed and why.

Spec-driven development, often shortened to SDD, is an answer to these problems. Its main idea is simple: before anyone writes code, people and AI agree on a written description of what should be built. This description is called a specification, or simply a spec. The code is then produced from the spec, checked against it and changed together with it.`,
    },
    {
      title: 'The Spec as the Source of Truth',
      text: `In traditional development the code is the final truth. Documents are written at the beginning, but they quickly become outdated, because changing the code is the real work and updating the documents is an extra task that people forget. Spec-driven development tries to turn this around. The spec becomes the main artifact, and the code is treated more like its result.

A good spec describes the problem from the point of view of the user. It explains who will use the feature, what they want to achieve and how we will know that it works. It usually contains user stories, such as "As a reader, I want to save a word from a text, so that I can study it later." It also contains acceptance criteria: concrete, testable statements like "If the word is already in the dictionary, the app shows a message and does not create a copy."

What a spec usually does not contain is the technical solution. It does not say which database or framework to use. This separation is important. The "what" and the "why" belong to the spec, while the "how" belongs to a separate technical plan. Because of this, you can change the technology without rewriting the description of the product, and you can discuss the product with people who do not read code.

For an AI assistant, a clear spec is extremely valuable. Language models are good at following detailed instructions and bad at reading your mind. When the assistant has a document that lists the rules, the edge cases and the limits of the task, it has far fewer things to guess. The quality of the result depends less on luck and more on the quality of the thinking that went into the spec.

The spec also helps humans. Writing things down forces you to notice gaps in your own understanding. Many teams discover that the hardest part of a feature is not the code at all, but deciding what should happen in unusual situations.`,
    },
    {
      title: 'How the Process Works',
      text: `Different tools describe spec-driven development in slightly different ways, but most of them follow the same four steps.

The first step is to specify. You describe the feature in plain language and let the assistant turn it into a structured spec. A good assistant does not simply accept your words; it marks the places that are unclear and asks questions. Answering these questions early is much cheaper than discovering the misunderstanding after the code is written.

The second step is to plan. Now the technical decisions are made: the architecture, the data model, the libraries, the way the new feature connects to the existing code. Many teams also keep a short set of project-wide principles, for example "every feature must have tests" or "we do not add new dependencies without a reason". The plan is checked against these principles, so that each new feature follows the same rules.

The third step is to break the plan into tasks. A task should be small enough to be implemented and checked on its own. Tasks have an order, because some depend on others, and some of them can be done in parallel. A list of small tasks is much easier to control than one huge request.

The fourth step is to implement. The assistant works through the tasks one by one, and the developer reviews the result after each step. Since every task refers back to the plan and the spec, it is easy to see whether the code does what was intended.

The most important rule is that the process does not stop after the first release. When requirements change, you change the spec first and then regenerate or adjust the plan, the tasks and the code. In this way the documents stay alive instead of becoming a forgotten folder.`,
    },
    {
      title: 'Tools, Criticism and Common Sense',
      text: `Several tools have appeared to support this way of working. GitHub released Spec Kit, an open-source toolkit that adds special commands for each step to popular AI assistants. Amazon built the idea into Kiro, a development environment where every feature gets its own requirements, design and task files. Other projects go even further and imagine a future where specs are the only thing people maintain, while code is generated again whenever it is needed.

Not everyone is enthusiastic. Some experienced developers say that spec-driven development looks suspiciously like the old "waterfall" model, where months were spent on documents before any software existed. Others point out that writing and reviewing long markdown files can take more time than writing the code itself, especially for small changes. And a spec does not guarantee correctness: the assistant can still misunderstand it or ignore part of it, so careful review remains necessary.

There is some truth in all of these points. The answer is probably not to choose between "always write specs" and "never write specs", but to match the effort to the task. Fixing a typo or changing a button color does not need a formal process. A new feature with many rules, or a change that touches several parts of the system, often does.

It also helps to remember that the cycle can be short. A spec does not have to be a fifty-page document. For many features one page with user stories, acceptance criteria and a list of open questions is enough. The goal is not to produce paperwork, but to make decisions on purpose, in a place where everyone can see them.

In a sense, spec-driven development is not a new idea at all. Good engineers have always thought before typing. What has changed is that the "typing" part has become very cheap, while clear thinking has become the most valuable thing a developer can bring to the work.`,
    },
  ],
}
