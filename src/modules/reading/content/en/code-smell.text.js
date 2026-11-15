export default {
  id:     'en-code-smell',
  topic:  'tech',
  level:  'B2',
  added:  '2026-11-08',
  title:  'Code Smells',
  source: 'Википедия, статья «Code smell» (en.wikipedia.org), CC BY-SA 4.0; сокращено и адаптировано',
  chapters: [
    {
      title: 'What Is a Code Smell?',
      text: `In computer programming, a code smell is any characteristic of source code that hints at a deeper problem. Determining what a code smell is and is not is subjective, and varies by language, developer, and development methodology.

The term was popularized by Kent Beck on WardsWiki in the late 1990s. Usage of the term increased after it was featured in the 1999 book Refactoring: Improving the Design of Existing Code by Martin Fowler. It is also a term used by agile programmers.

One way to look at smells is with respect to principles and quality: smells are certain structures in the code that indicate violation of fundamental design principles and negatively impact design quality. Code smells are usually not bugs; they are not technically incorrect and do not prevent the program from functioning. Instead, they indicate weaknesses in design that may slow down development or increase the risk of bugs or failures in the future. Bad code smells can be an indicator of factors that contribute to technical debt. Robert C. Martin calls a list of code smells a “value system” for software craftsmanship.

Contrary to these severe interpretations, Cunningham’s original definition was that a smell is a suggestion that something may be wrong, not evidence that there is already a problem.

Often the deeper problem hinted at by a code smell can be uncovered when the code is subjected to a short feedback cycle, where it is refactored in small, controlled steps, and the resulting design is examined to see if there are any further code smells that in turn indicate the need for more refactoring. From the point of view of a programmer charged with refactoring, code smells are heuristics that show when to refactor, and what specific refactoring techniques to use. Thus, a code smell is a driver for refactoring.

How easy the code is to understand and to modify, how easily it can be extended to support functional changes, whether it can be reused in different settings, how testable and how reliable it is: all these factors can be used to identify code smells. Common wisdom suggests that urgent maintenance activities and pressure to deliver features, putting time to market before code quality, are often the causes of such smells. Tools such as Checkstyle, PMD, FindBugs, and SonarQube can identify code smells automatically.`,
    },
    {
      title: 'Common Smells',
      text: `Some smells concern the whole application. Duplicated code is identical or very similar code that exists in more than one location. Shotgun surgery is a single change that needs to be applied to many classes at the same time.

Other smells live at the level of a class. A large class, also known as a god object, is a class that contains too many types or many unrelated methods. A refused bequest is a class that overrides a method of a base class in such a way that the contract of the base class is not honored by the derived class, which violates the Liskov substitution principle.

Excessive use of literals, or magic numbers, is another class-level smell. Such values should be coded as named constants, to improve readability and to avoid programming errors. Literals can and should also be moved into resource files or other data stores where possible, to make it easier to translate the software if it is going to be used in different regions.

Downcasting is a type cast which breaks the abstraction model; the abstraction may have to be refactored or removed. A data clump occurs when a group of variables is passed around together in various parts of the program. In general, this suggests that it would be more appropriate to group the variables together into a single object, and pass around only the new object instead.

Finally, there are smells at the level of a single method. Too many parameters is a typical example: a long list of parameters is hard to read, and makes calling and testing the function complicated. It may indicate that the purpose of the function is poorly thought out and that the code should be refactored so that responsibility is assigned in a cleaner way.`,
    },
  ],
}
