export default {
  id:     'en-algorithms',
  topic:  'tech',
  level:  'B2',
  added:  '2026-11-15',
  title:  'Thinking in Algorithms',
  source: null,
  chapters: [
    {
      title: 'Recipes for Computers',
      text: `The word "algorithm" sounds mysterious, but the idea behind it is very simple. An algorithm is a precise description of how to solve a problem, step by step. A cooking recipe is a kind of algorithm: take two eggs, add sugar, mix for three minutes, bake for twenty minutes. The instructions you give a friend to find your flat are also an algorithm.

There is one important difference, however. People are clever and can guess what you mean. If a recipe says "add some salt", a cook will decide how much. A computer cannot guess. It does exactly what it is told, nothing more and nothing less. That is why an algorithm for a computer must be absolutely clear. Every step has to be defined, and the algorithm must also say what to do in unusual situations: what if the list is empty, what if two numbers are equal, what if the user types a letter instead of a number?

A good algorithm has a few qualities. It must give the correct result for every possible input, not only for the examples we tried. It must finish, rather than run forever. And it should not waste time or memory. The first two qualities are about being right; the third one is about being efficient.

Interestingly, there are often many different algorithms for the same problem. All of them may give the correct answer, but some of them are thousands of times faster than others. A large part of computer science is about finding these better ways and understanding why they are better.`,
    },
    {
      title: 'Searching: Guess the Number',
      text: `Let us look at a classic example. Your friend thinks of a number between one and one hundred, and you have to guess it. After each guess, your friend says only "higher" or "lower". What is the best strategy?

The simplest algorithm is to try every number in order: one, two, three and so on. This is called linear search. It always works, but in the worst case you need one hundred guesses. If the range were one million, you might need a million guesses.

A much better strategy is to start in the middle. You say fifty. If your friend says "higher", you know that the number is between fifty-one and one hundred, so you have removed half of the possibilities with a single question. Next, you guess seventy-five, then the middle of the remaining part, and so on. This method is called binary search. With it you never need more than seven guesses for one hundred numbers, and only about twenty guesses for one million numbers.

There is one condition, though: binary search only works if the data is sorted. That is why computers spend a lot of effort keeping data in order. A phone book, a dictionary and the index of a database are all sorted for exactly this reason. Sorting once costs some time, but then every search becomes dramatically faster.`,
    },
    {
      title: 'How Fast Is Fast?',
      text: `To compare algorithms, computer scientists do not measure time in seconds. A program runs faster on a new computer than on an old one, so seconds tell us more about the machine than about the idea. Instead, they ask a different question: how does the amount of work grow when the input gets bigger?

This is described with a notation called Big O. Linear search, for example, is O of n. This means that if the list becomes ten times longer, the work also becomes about ten times bigger. Binary search is O of log n. Here the work grows extremely slowly: if the list becomes a thousand times longer, we need only about ten more steps.

Some algorithms are much worse. Imagine comparing every person in a room with every other person, for example to find two people with the same birthday. With ten people, there are forty-five pairs. With a thousand people, there are almost half a million. This kind of growth is called O of n squared, and it quickly becomes a problem for large inputs.

The most dangerous algorithms are those that try every possible combination. If you want to find the shortest route through twenty cities by checking every possible order, there are more routes than there are grains of sand on all the beaches of the Earth. Even the fastest computer in the world would never finish. For such problems, programmers look for clever shortcuts or accept a route that is very good, even if it is not perfect.`,
    },
    {
      title: 'Algorithms in Everyday Life',
      text: `Algorithms are not only something for textbooks. They are working around us all the time. When a navigation app finds the fastest way home, it uses algorithms for finding paths in a network of roads. When a music service suggests songs, it uses algorithms that compare your taste with the taste of millions of other listeners. When you search for something on the internet, algorithms decide which pages appear first.

Some of the most important algorithms are completely invisible. Compression algorithms make photos and videos small enough to send quickly. Encryption algorithms protect our passwords and bank details. Error-correcting algorithms make sure that a scratched disc or a weak radio signal still delivers the right data.

Because algorithms make so many decisions, people have started to ask questions about fairness. An algorithm that decides who gets a loan or which job application is read first learns from data, and if the data contains old prejudices, the algorithm may repeat them. A computer can follow instructions perfectly and still produce an unfair result. That is why it is important that people understand what algorithms do and that someone remains responsible for their decisions.

You do not need to be a programmer to think in algorithms. Whenever you split a big task into small clear steps, look for a faster way to do something you repeat every day, or ask yourself what could go wrong in an unusual situation, you are thinking like a computer scientist. And this way of thinking is useful far beyond computers.`,
    },
  ],
}
