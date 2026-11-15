export default {
  id:     'en-technical-debt',
  topic:  'tech',
  level:  'B2',
  added:  '2026-11-08',
  title:  'Technical Debt',
  source: 'Википедия, статья «Technical debt» (en.wikipedia.org), CC BY-SA 4.0; сокращено и адаптировано',
  chapters: [
    {
      title: 'What Is Technical Debt?',
      text: `Technical debt, also known as design debt or code debt, is a qualitative description of the cost to maintain a system that is attributable to choosing an expedient solution for its development. While an expedited solution can accelerate development in the short term, the resulting low quality may increase future costs if left unresolved. The term is often used in the context of information technology and especially software development.

Technical debt is similar to yet differs significantly from monetary debt. Incurring either generally makes future goals more challenging to attain. But unlike monetary debt, technical debt is often incurred without intention. The choice to minimize development time and cost, an ever-present aspect of business, is the primary factor. Technical debt is generally only assessed retroactively, after a development effort.

Properly managing technical debt is essential for maintaining software quality and long-term sustainability. In some cases, taking on technical debt is a strategic choice to meet immediate goals, such as delivering a proof of concept or a quick release. However, failure to prioritize and address the debt can result in reduced maintainability, increased development costs, and risk to production systems.

Ward Cunningham coined the term technical debt in 1992. After reading the book Metaphors We Live By, Cunningham devised this debt metaphor to explain to his boss the need to refactor the financial product they were working on: “Shipping first time code is like going into debt. A little debt speeds development so long as it is paid back promptly with a rewrite. The danger occurs when the debt is not repaid. Every minute spent on not-quite-right code counts as interest on that debt.”

Similar concepts had existed before this. In 1980, Meir “Manny” Lehman had published a similar law using an architectural metaphor for the deteriorating nature of software: “As an evolving program is continually changed, its complexity, reflecting deteriorating structure, increases unless work is done to maintain or reduce it.”`,
    },
    {
      title: 'Causes',
      text: `A common cause of technical debt is pressure to minimize development time, an ever-present aspect of business. Others are unexpected and ill-defined features and changes, such as last-minute specification changes that are insufficiently documented or tested, and gaps in knowledge or skills, which may show up as a lack of process understanding, poor technological leadership, or inadequate mentoring and knowledge sharing. Problems in the development process also play a role: sub-optimal solutions, insufficient or conflicting requirements, and deferred refactoring.

Technical debt can be taken on deliberately or inadvertently. Deliberate debt happens when a team knowingly accepts a short-term compromise, for example to meet a release deadline, with the expectation that the affected code or design will later improve. Inadvertent debt happens when a team doesn’t have enough information, experience, or understanding of the system to realize that a choice will create future maintenance work.

The consequences of either type depend on whether the decision was made carefully, with an assessment of trade-offs and a plan to fix it, or recklessly, without enough consideration for its long-term effects. Examples of the latter include insufficient documentation, poor collaboration practices, lack of ownership, inadequate attention to code quality, tightly coupled components, lack of a test suite, or failure to follow standards.`,
    },
    {
      title: 'Consequences',
      text: `By increasing the cost of ongoing maintenance, technical debt makes it harder to predict release schedules. “Interest payments” result from incomplete work and escalating integration costs. Increases in complexity and in the amount of uncompleted work make it increasingly difficult to estimate effort accurately, resulting in delays, missed deadlines, and stress on engineering teams, which can lead to higher staff turnover and make the problem even worse. Carrying technical debt into production increases the risk of outages, financial losses, and potential legal issues. Future refactoring becomes riskier and costlier.

Failure to address technical debt can cause productivity to decline and slow down the delivery of features. The cumulative effects of technical debt result in increasingly fragile systems that make bold improvements difficult. Incremental changes dominate, critical refactoring is delayed, and the result can be stressed systems with inconsistent design: users suffer from degraded performance and limited functionality while developers struggle to maintain quality.

Empirical studies have shown delivery delay, reduced maintainability, and rework as the most frequently reported effects of technical debt. Debt can also increase the effort needed to understand dependencies, test changes, correct defects, and integrate work across a system. Its effects can therefore go beyond individual code modules, influencing planning accuracy, development speed, and the ability of an organization to respond to changing requirements.`,
    },
    {
      title: 'Managing the Debt',
      text: `Kenny Rubin uses three categories to help manage technical debt. Happened-upon debt is debt the development team was unaware of until it was exposed during normal work on the product. For example, the team is adding a new feature and realizes that a work-around was built into the code years before by someone who has long since left. Known debt is known to the development team and has been made visible. Targeted debt is known and has been planned for fixing.

Technical debt management involves identifying debt items, recording them in an issue tracker or backlog, assessing their effects and the cost of fixing them, and prioritizing them together with feature work. Teams can review debt during design, architecture, sprint, and release reviews, and assign part of their development capacity to paying it back. Measures like the number of open debt items, the proportion of the backlog taken by debt, and the resources spent on quality improvement can make accumulated debt visible.

The concept also has limitations. It presumes that an overly expedient development effort results in additional future costs, and that these costs would be avoided if different decisions were made. However, if the system does not survive long enough to be modified for a later release, then the savings due to the quick choices are true savings, since there is no future development cost. Future events may also make carefully planned long-term designs obsolete, and new tools and techniques might reduce the cost of future rework.`,
    },
  ],
}
