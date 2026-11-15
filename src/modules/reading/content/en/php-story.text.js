export default {
  id:     'en-php-story',
  topic:  'tech',
  level:  'B1',
  added:  '2026-11-15',
  title:  'PHP: The Language Behind the Web',
  source: null,
  chapters: [
    {
      title: 'A Small Tool That Grew',
      text: `In 1994 a programmer named Rasmus Lerdorf wanted to know who was visiting his personal web page. He wrote a few small programs to count visitors and to show some information on the page. He called this set of tools "Personal Home Page Tools". He did not plan to create a programming language. He only wanted to solve a small problem.

Other people liked his tools and asked for a copy. Lerdorf shared the code, and people started to add new features. They wanted to work with forms, to send emails and to connect to databases. Step by step, the small set of tools became a real language. Later the name changed to "PHP: Hypertext Preprocessor". It is a strange name, because the first letters of the name are the name itself, but programmers like jokes like this.

At the end of the nineties the web was growing very fast. Many companies wanted their own website, and most of these sites were not just simple pages. They had shops, guest books, news and comments. PHP was easy to learn, it was free, and almost every hosting company supported it. You could write a few lines, upload a file to a server and see the result in your browser at once. For many people PHP was the first language they ever learned.

Because of this, PHP became one of the most popular languages on the internet. Big projects like WordPress, Wikipedia and the first versions of Facebook were written in PHP. Even today a large part of all websites uses PHP in some way. Many people say that PHP is old and not beautiful, but it is still everywhere, and it still does its job.`,
    },
    {
      title: 'How PHP Works',
      text: `To understand PHP, it is important to know what happens when you open a web page. Your browser sends a request to a server. The server is just a computer that waits for requests and sends answers. If the page is a simple file, the server sends this file back. But if the page is a PHP file, the server does something more.

First, the server gives the file to the PHP interpreter. The interpreter reads the code line by line and runs it. The code can do many things: it can read data from a database, check if the user is logged in, calculate prices or choose the right language. At the end, the code produces normal HTML, the language that browsers understand. The server sends this HTML to the browser, and the browser shows the page.

This is why we call PHP a server-side language. The user never sees the PHP code. The user only sees the result. If you open the source of a page in your browser, you will find HTML, but not a single line of PHP. This is good for security, because secret things like passwords for the database stay on the server.

Another important idea is that PHP starts from zero for every request. When the page is ready, PHP forgets everything. If you open the next page, the whole process starts again. This sounds slow, but it makes life simple: one broken request does not break the next one. To remember things between requests, for example the contents of a shopping cart, PHP uses sessions, cookies and databases.`,
    },
    {
      title: 'Modern PHP',
      text: `For many years PHP had a bad reputation. Old code was often messy. HTML, database queries and business logic were mixed in one long file. It was easy to write code that worked, but it was also easy to write code that was slow, unsafe and very hard to change. Some programmers laughed at PHP and said that serious projects need serious languages.

The language, however, did not stand still. Version 7, released in 2015, was about two times faster than the version before. Version 8 added many features that programmers know from other modern languages: a just-in-time compiler, named arguments, enums and readonly properties. Types became much more important. Today a PHP developer can say exactly what kind of data a function expects and what it returns, and many mistakes are found before the code even runs.

The way people organize their work has changed too. Most projects use Composer, a tool that installs libraries and keeps their versions in order. Instead of writing everything from scratch, developers use well-tested packages. They follow common standards, so code written by different teams looks similar and is easier to read. They write automatic tests that check the code every time something changes.

Frameworks like Laravel and Symfony give projects a clear structure. They help with routing, databases, security and many other everyday tasks. Thanks to them, a small team can build a large application quickly and keep it in good shape for years.

So is PHP still worth learning? For many developers the answer is yes. It is not the newest or the most fashionable language, but it is stable, fast enough for most websites and supported by a huge community. And the best thing about PHP is the same as in 1994: you can write a few lines, open your browser and see the result.`,
    },
  ],
}
