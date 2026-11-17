export default {
  id:     'en-spec-kit',
  topic:  'tech',
  level:  'B2',
  added:  '2026-11-17',
  title:  'Spec Kit: GitHub\'s Toolkit for Spec-Driven Development',
  source: null,
  chapters: [
    {
      title: 'What Spec Kit Is',
      text: `Spec Kit is an open-source toolkit created by GitHub, the code hosting platform that belongs to Microsoft. It was published in 2025, at a time when many developers were trying to find a more reliable way to work with AI coding assistants. Its goal is to make spec-driven development practical: instead of writing one long prompt and hoping for the best, you move through a series of clear steps, and each step leaves a document behind.

It is important to understand what Spec Kit is not. It is not a new AI model, and it is not a separate editor. It works together with the assistant you already use, such as GitHub Copilot, Claude Code, Gemini CLI, Cursor and several others. Spec Kit adds a set of prepared commands and templates to your project. When you run one of these commands in the assistant, it receives detailed instructions about what to do at this stage and in which file to save the result.

The toolkit consists of two parts. The first part is a small command-line program called Specify. You use it once to prepare a project: it asks which assistant you work with, downloads the right templates and creates the folders that Spec Kit needs. The second part is the set of commands and templates themselves, which you use every day while building features.

Because everything is stored as plain text files in the repository, the whole history of decisions travels together with the code. You can review a spec in a pull request, compare two versions of a plan or go back and see why a feature was designed in a certain way. Nothing important is hidden inside a chat that will be closed tomorrow.`,
    },
    {
      title: 'The Constitution',
      text: `The first command most teams run is the one that creates the constitution. The name sounds serious, and that is intentional. The constitution is a short document with the basic principles of the project, the rules that every feature has to respect.

What goes into a constitution depends on the team. It can include rules about quality, for example that every feature must be covered by tests, or that tests are written before the implementation. It can describe the architecture, for instance that the project is split into independent modules that do not import each other. It can set limits, such as a list of approved libraries, a requirement to support old browsers or a promise that the application works offline. It can also describe the style of the user interface or the languages it must support.

The constitution matters because AI assistants have no memory of your earlier discussions. Without it, the assistant might choose a different approach for every new feature, simply because each request is considered on its own. With a constitution, each plan is checked against the same set of principles. If a plan breaks a rule, the assistant has to notice it and either change the plan or explain clearly why an exception is needed.

A good constitution is short and concrete. "Write good code" helps nobody. "Every module keeps its data in its own tables, and deleting the module folder removes the feature completely" is a rule that can actually be checked. Teams usually start with a few principles and add more as they learn what goes wrong in their project.`,
    },
    {
      title: 'From Idea to Tasks',
      text: `After the constitution is ready, the work on a feature follows a fixed path. Each step has its own command, and each command produces a file in a separate folder for that feature.

The specify command takes your description of the feature and turns it into a structured specification. You are encouraged to talk only about what users need and why, without mentioning technologies. The template asks the assistant to write user stories, list functional requirements and describe how success will be measured. Where something is unclear, the assistant does not invent an answer; it marks the place as needing clarification.

The clarify command deals with exactly these marks. The assistant asks a series of focused questions, often with several possible answers to choose from, and writes your decisions back into the spec. This step is optional, but it saves a lot of time, because a misunderstanding found here costs a few minutes, while the same misunderstanding found after implementation can cost days.

The plan command is where technology finally appears. You tell the assistant which stack you want to use, and it produces a technical plan: the architecture, the data model, the interfaces between parts of the system and the reasons for the main decisions. It also checks the plan against the constitution. Sometimes this step creates extra documents, such as a short research note comparing two libraries.

The tasks command breaks the plan into a numbered list of small tasks. Tasks are grouped by user story, ordered by dependencies, and tasks that can be done at the same time are marked as such. Finally, the implement command asks the assistant to work through the list. There are also helper commands that check whether the spec, the plan and the tasks agree with each other, and that create checklists for reviewing the quality of the requirements.`,
    },
    {
      title: 'Using It Wisely',
      text: `People who try Spec Kit often have mixed feelings at first. On one hand, the results are noticeably more predictable than with free-form prompts. The assistant asks better questions, the code follows the agreed structure and it is much easier to review the work in small pieces. On the other hand, the process produces a lot of text. A simple feature can generate several long files, and reading all of them carefully takes time.

The best advice from experienced users is to treat Spec Kit as a framework, not as a ritual. The templates are files in your repository, so you can shorten them, remove sections that never help or add questions that are important for your project. Small changes and bug fixes can usually skip the full process. For big features it is worth slowing down at the beginning, because this is where the most expensive mistakes are made.

Reviewing is still the developer's job. A spec written by an assistant can sound confident and still miss an important case. The plan can choose a technology that does not fit your hosting. The implementation can drift away from the tasks. Spec Kit makes these problems easier to see, because there is always a document to compare with, but it does not remove the need to read and think.

Spec Kit is also a good learning tool. Even if you later decide not to use it every day, going through its steps a few times shows how much hidden thinking lies behind a "simple" feature. Many developers keep the habit after they stop using the toolkit: write down who the feature is for, agree on the rules, make a plan, and only then start writing code.`,
    },
  ],
}
