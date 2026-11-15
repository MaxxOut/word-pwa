export default {
  id:     'en-laravel',
  topic:  'tech',
  level:  'B2',
  added:  '2026-11-15',
  title:  'Laravel: A Framework for Web Artisans',
  source: null,
  chapters: [
    {
      title: 'Why Frameworks Exist',
      text: `Almost every web application has to solve the same basic problems. It has to understand which page the user wants, read and save data, check who the user is, send emails, protect forms from attacks and show error messages in a friendly way. If every team wrote all of this from the beginning, they would spend months on things that have nothing to do with their actual idea.

A framework is a collection of ready-made solutions for these common problems. It gives the project a structure, a set of rules and a lot of code that has already been tested by thousands of other developers. The team can then concentrate on the part that makes their application special.

Laravel is one of the most popular frameworks for PHP. It was created by Taylor Otwell, and the first version appeared in 2011. From the very beginning its goal was not only to be powerful, but also to be pleasant to use. Laravel calls its users "web artisans", people who care about their craft and want their code to be clean and expressive. Many developers say that working with Laravel feels less like fighting with a tool and more like writing a clear story about what the application should do.

The framework follows a popular pattern called MVC, which stands for Model, View and Controller. Models describe the data and the rules around it. Views are templates that turn data into HTML. Controllers sit in the middle: they receive the request, ask the models for data and give the result to a view. When every part of the code has its own place, a new developer can open an unfamiliar project and quickly find what they are looking for.`,
    },
    {
      title: 'Routes, Controllers and Views',
      text: `Everything in a Laravel application starts with a route. A route connects an address, such as the page with all orders, to a piece of code that should handle it. The list of routes works like a table of contents for the whole application. When something goes wrong on a certain page, the developer usually starts by looking at the routes to see which controller is responsible.

The controller is where the main work happens. It reads the data that the user sent, for example the fields of a form. Before using this data, it validates it: is the email address real, is the password long enough, is the date in the future? Laravel has a rich set of validation rules, so the developer only has to describe what correct data looks like. If something is wrong, the framework automatically sends the user back to the form with clear error messages.

When the data is correct, the controller saves it or asks for other data and then returns a response. Very often this response is a view. Laravel uses a template engine called Blade. Blade templates look almost like normal HTML, but they can show variables, repeat a block for every item in a list or include smaller templates such as a header or a footer. Because the templates are separate from the logic, a designer can change the look of a page without touching the code that calculates prices or checks permissions.

Between the route and the controller there can also be middleware. Middleware is like a guard at the door. One guard checks that the user is logged in, another one checks that the user has the right role, and a third one makes sure that forms come from our own site and not from an attacker. Each guard does one small job, and together they protect the application.`,
    },
    {
      title: 'Talking to the Database with Eloquent',
      text: `Most applications store their data in a relational database such as MySQL or PostgreSQL. Databases understand a language called SQL, and writing SQL by hand for every small task is slow and easy to get wrong. Laravel offers a tool called Eloquent, which lets developers work with the database through normal PHP objects.

In Eloquent every table has a model. For example, there may be a model for users, one for orders and one for products. To find all orders of a customer, the developer does not write a long query. They simply ask the customer object for its orders. Eloquent knows how the tables are connected because the relationships are described in the models: a customer has many orders, an order belongs to a customer, a product can appear in many orders.

Changes to the structure of the database are made with migrations. A migration is a small file that describes one step, such as creating a table or adding a column. All migrations are kept together with the code, so every developer in the team, and every server, can build exactly the same database. If a change turns out to be a mistake, a migration can also be rolled back.

Eloquent makes simple things very simple, but it also requires attention. A common problem is the so-called N plus one problem. Imagine a page that shows one hundred orders and the name of the customer for each of them. If the code is careless, the application sends one query to get the orders and then one hundred more queries to get the customers. The page still works, but it becomes slow. Laravel solves this with eager loading: the developer says in advance which related data is needed, and Eloquent loads everything with just two queries.`,
    },
    {
      title: 'Queues, Tests and the Ecosystem',
      text: `Some tasks take a long time. Sending a welcome email, creating a PDF invoice or resizing uploaded photos can take several seconds. If the user had to wait for all of this, the application would feel slow. Laravel solves this with queues. Instead of doing the slow work immediately, the application puts a small job into a queue and answers the user at once. In the background, a separate process called a worker takes jobs from the queue one by one and does the work. If a job fails, for example because the mail server is not available, it can be tried again later.

Laravel also takes testing seriously. A new project already contains everything needed to write automatic tests. A test can pretend to be a user: open a page, fill in a form, press a button and check that the right data appears in the database. Tests can also replace slow or external services with fake ones, so that no real emails are sent while the tests are running. A good set of tests gives the team the confidence to change the code without fear of breaking something.

Around the framework there is a large ecosystem. There are official packages for user authentication, for payments, for real-time notifications and for building administration panels. There are tools for running the application on a local computer and services for deploying it to servers. The documentation is famous for being clear and friendly, and there are many courses, books and conferences.

Laravel is not the right choice for every project. A very small script does not need a full framework, and some teams prefer other tools. But for many web applications, from a simple blog to a large online shop, Laravel offers a good balance: it is quick to start with, it has an answer to most everyday questions, and it helps developers write code that they will still understand next year.`,
    },
  ],
}
