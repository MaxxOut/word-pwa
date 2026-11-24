export default {
  id:     'en-claude-skills',
  topic:  'tech',
  level:  'B2',
  added:  '2026-11-17',
  review: '2027-11',
  title:  'Teaching Claude New Tricks: Agent Skills',
  source: null,
  chapters: [
    {
      title: 'What a Skill Is',
      text: `A large language model knows a lot about the world, but it does not know how your team works. It does not know that your company has a template for reports, that your commit messages are always written in a certain style or that every new text in your app must be checked by a special script. You can explain all of this in every conversation, but repeating the same instructions again and again is boring and easy to forget.

Anthropic introduced Agent Skills to solve this problem. A skill is simply a folder. Inside the folder there is a main file called SKILL.md, written in ordinary markdown. At the top of this file there are two short fields: the name of the skill and a description that explains when it should be used. Below them come the actual instructions, written the way you would explain a task to a new colleague. The folder can also contain extra materials: example documents, templates, reference notes and small scripts that Claude can run.

The clever part is how skills are loaded. At the start of a session Claude sees only the names and descriptions of the available skills, which takes very little space. When a request matches a description, for example when you ask for a presentation and there is a skill about presentations, Claude opens the full instructions. If those instructions mention another file, it reads that file only when it needs it. This approach is called progressive disclosure. It means you can install many skills without filling the model's memory with text it does not need right now.

Skills work in the Claude apps, in Claude Code and through the API. The format was later published as an open standard, so other AI tools can read the same folders. A skill you write once can be shared with your team, stored in a repository or published for anyone to use.`,
    },
    {
      title: 'Skills for Documents and Design',
      text: `Some of the most useful skills come from Anthropic itself. Its public repository contains a collection of examples, and a few of them are used by millions of people every day, often without knowing it.

The document skills teach Claude to work with real office files: Word documents, Excel spreadsheets, PowerPoint presentations and PDFs. Creating such files is harder than it looks. A Word file is actually a compressed folder full of XML, and a spreadsheet with working formulas has its own rules. The skills contain detailed notes about these formats and scripts that do the difficult parts, so Claude can fill in a form, add a chart to a table, merge several PDFs or produce a presentation that opens correctly in Office.

The frontend design skill is popular with people who build websites. Without guidance, AI-generated pages tend to look the same: similar fonts, similar purple gradients, similar cards with rounded corners. This skill asks Claude to choose a clear visual direction first, to pay attention to typography, color and spacing, and to avoid the typical "AI look". The difference in the results is often surprising.

There are also more playful examples, such as a skill for creating generative art with code and another for making small animated pictures for chat messages. They are less important for daily work, but they are excellent examples of how much a few pages of good instructions can change the behaviour of the same model.

Finally, there are skills for companies, for example one that applies brand guidelines, with the right colors, fonts and tone of voice, to every document Claude creates. For a business this is often the first skill worth writing, because it removes a lot of manual correction.`,
    },
    {
      title: 'Skills for Developers',
      text: `For programmers, skills are especially interesting in Claude Code, where the assistant can read files, run commands and make changes in a real project.

One of the most important examples is the skill creator. It is a skill whose job is to help you write other skills. It asks what the new skill should do, suggests a structure, writes the description so that Claude will actually use the skill at the right moment and can even help you test whether the skill improves the results. If you are going to write only one skill by hand, it may as well be this one.

The web application testing skill gives Claude a way to check its own work in a browser. With its help Claude can start a local server, open the page with an automated browser, click buttons, take screenshots and read the console for errors. Instead of saying "the page should work now", it can actually look. The MCP builder skill helps developers create servers for the Model Context Protocol, the standard way of connecting AI assistants to external services.

The community has added much more. One of the best-known collections is called Superpowers. It contains skills that describe good engineering habits: brainstorming a design before coding, writing a plan with small steps, following test-driven development, debugging systematically instead of guessing, and checking that work is really finished before saying so. None of these ideas is new, but written as skills they become something the assistant follows every time, not only when you remember to ask.

Many teams also write small skills for their own projects: how to release a new version, how to add a text to the app, how to update the documentation at the end of the day. Such skills are rarely impressive, but they save time every single week.`,
    },
    {
      title: 'Installing and Choosing Skills',
      text: `There are several ways to add a skill. In the Claude apps you can turn on the built-in skills in the settings and upload your own as a zip archive. In Claude Code a skill is a folder in a special directory: either in your home folder, so it works in all projects, or inside a project, so that everybody who works on the repository gets it automatically. Claude Code also supports plugins and marketplaces, which make it possible to install whole collections of skills with a single command and update them later.

Because a skill can contain scripts, it is worth being careful. Installing a skill from an unknown author is similar to running a program from the internet. Before you add one, read its SKILL.md and look at the scripts it includes. Good skills are usually short, clear and easy to understand. If you cannot tell what a skill does, it is better not to install it.

It is also not a good idea to install everything at once. Each description takes a little space, and if many skills have similar descriptions, Claude may choose the wrong one. Start with a few skills that solve real problems: the document skills if you work with office files, a design skill if you build interfaces, a testing skill if you develop web applications, and the skill creator for your own needs.

The most valuable skills are often the ones you write yourself. Whenever you notice that you explain the same thing to Claude for the third time, that is a sign that the explanation should become a skill. Write it down once, give it a precise description, and from then on the assistant will remember it for you.`,
    },
  ],
}
