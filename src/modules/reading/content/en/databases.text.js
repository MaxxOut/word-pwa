export default {
  id:     'en-databases',
  topic:  'tech',
  level:  'B1',
  added:  '2026-11-15',
  title:  'How Databases Keep Our Data',
  source: null,
  chapters: [
    {
      title: 'Tables, Rows and Columns',
      text: `Every day we use applications that remember things for us. A shop remembers our orders, a bank remembers our money, and a language app remembers the words we have learned. All this information has to be stored somewhere, and it has to be found again quickly. This is the job of a database.

The most common kind of database is called a relational database. It stores data in tables, which look a lot like tables in a spreadsheet. Each table describes one kind of thing. For example, an online shop may have a table for customers, a table for products and a table for orders.

A table has columns and rows. The columns describe what we want to know about each thing: a customer has a name, an email address and a city. The rows are the actual records: one row for Anna from Berlin, another row for Tom from London. Every column has a type. A name is text, a price is a number, and the date of an order is a date. The database checks these types, so nobody can save the word "yesterday" in a column for prices.

Each row also needs something that makes it unique. Two customers can have the same name, so the name is not enough. That is why tables usually have a special column called the primary key, very often a simple number. Customer number 17 is always the same person, even if she changes her name or moves to another city.`,
    },
    {
      title: 'Asking Questions with SQL',
      text: `To work with a relational database we use a language called SQL, which stands for Structured Query Language. SQL is different from many other programming languages. We do not tell the database how to find the data step by step. We only describe what we want, and the database decides how to get it.

A typical question in SQL sounds almost like an English sentence: select the names and emails from the customers table where the city is Berlin, sorted by name. The database reads the question, looks at the data and returns a small table with the answer. With the same language we can add new rows, change existing rows and delete rows that we no longer need.

The real power of relational databases comes from relationships between tables. An order does not copy the name and the address of the customer. It only stores the customer's number. When we need both the order and the customer, we join the two tables: we ask the database to connect every order with the customer who has the same number. This way the address is stored only once. If the customer moves, we change one row, and all old and new orders automatically show the new address.

Splitting data into tables in this careful way is called normalization. It helps to avoid repeated information and contradictions. Of course, it is possible to go too far: a database with a hundred tiny tables can be hard to understand. Good database design is a balance between clean structure and practical use.`,
    },
    {
      title: 'Indexes: Finding Data Fast',
      text: `Imagine a book with a thousand pages and no index at the back. If you want to find every page that mentions databases, you have to read the whole book. A database without indexes has the same problem. To find all orders of one customer, it has to look at every single row in the orders table. With a few hundred rows this is fast, but with a hundred million rows it can take a very long time.

An index is a special structure that the database keeps next to the table. Like the index in a book, it is sorted, so the database can jump directly to the right place instead of reading everything. With a good index, a question that took several seconds can take just a few milliseconds.

So why not create an index for every column? Because indexes are not free. They take extra space on the disk, and every time we add or change a row, the database has to update all the indexes as well. A table with too many indexes is fast to read but slow to write. Developers usually create indexes for the columns that appear most often in their questions, for example the customer number in the orders table or the email in the users table.

When a query is slow, most databases can explain how they plan to run it. The developer can then see whether the database uses an index or reads the whole table. Learning to read these plans is one of the most useful skills for anyone who works with data.`,
    },
    {
      title: 'Transactions and Safety',
      text: `Some operations must happen completely or not at all. Think about moving money from one bank account to another. The database has to take one hundred euros from the first account and add one hundred euros to the second one. If the server crashes after the first step, the money simply disappears. This must never happen.

Databases solve this problem with transactions. A transaction groups several changes into one unit. Either all changes are saved, or, if something goes wrong, the database rolls everything back as if nothing had happened. The famous abbreviation ACID describes the promises of a good transaction: it is atomic, which means all or nothing; it keeps the data consistent; it is isolated from other transactions running at the same time; and it is durable, which means that once the database says "done", the data survives even a power failure.

Databases also have to protect data from people. Users and programs get only the rights they really need: a reporting tool may read data but not change it. Applications must never build queries by simply gluing user input into SQL, because an attacker could type a piece of SQL into a form and change the meaning of the query. Modern tools always pass user data separately from the query itself.

Finally, even the best database needs backups. Disks break, people make mistakes, and sometimes data is deleted by accident. A backup that has never been tested is only a hope, so good teams regularly try to restore their backups. Data is often the most valuable part of an application, and databases are the careful guards that keep it safe.`,
    },
  ],
}
