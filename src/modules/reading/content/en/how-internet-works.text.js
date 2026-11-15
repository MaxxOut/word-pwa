export default {
  id:     'en-how-internet-works',
  topic:  'tech',
  level:  'B1',
  added:  '2026-11-15',
  title:  'How the Internet Works',
  source: null,
  chapters: [
    {
      title: 'A Network of Networks',
      text: `We use the internet so often that we rarely think about it. We send messages, watch videos and read the news, and everything seems to arrive by magic. In reality, the internet is not one big machine. It is a huge number of smaller networks that agree to work together. Home networks, office networks, university networks and the networks of large companies are all connected to each other, and together they form a network of networks.

The idea started in the late 1960s with a research project in the United States. Scientists wanted computers in different cities to share information, and they wanted the network to keep working even if some of its parts broke. Over the next decades more and more networks joined, and in the 1990s the internet became available to ordinary people.

Physically, the internet is made of cables, radio signals and a lot of special computers. Under the oceans there are thick cables that connect continents. In cities, cables run under the streets to buildings. The last part of the way is often wireless: your phone talks to a mobile tower, and your laptop talks to the Wi-Fi router in your flat.

Every device on the internet needs an address so that other devices can find it. This is called an IP address. It is a set of numbers, a bit like a postal address for computers. When you send a message, it does not travel directly to the other person. It goes from your device to your router, then to your internet provider, and then through many other networks until it reaches its destination.`,
    },
    {
      title: 'Packets and Routes',
      text: `Large pieces of data, like a photo or a video, are not sent in one piece. They are cut into many small parts called packets. Each packet carries a small part of the data and a label with the address of the sender and the receiver. You can imagine it like sending a long letter as a hundred postcards, each with a number, so that the receiver can put them back in the right order.

Special computers called routers forward the packets. A router does not know the whole way to the destination. It only knows which neighbour is a good next step. Each router looks at the address on the packet, chooses a direction and sends it on. After a number of such steps, the packet arrives. Packets from the same message may even travel along different roads and arrive in a different order.

This design makes the internet very robust. If a cable is damaged or a router stops working, the other routers simply find another way. That is exactly what the first designers wanted: a network without a single point that can break everything.

Of course, packets can sometimes get lost. To deal with this, computers use rules called protocols. The most important one, TCP, checks that every packet has arrived. If one is missing, it is sent again. Only when everything is complete does your program receive the data. For things like video calls, where speed is more important than perfection, other protocols allow a few lost packets, so that the conversation does not stop.`,
    },
    {
      title: 'Names and Addresses',
      text: `People are not good at remembering long numbers, so we do not type IP addresses into our browsers. We use names like wikipedia.org. But the computers still need numbers. The system that translates names into numbers is called DNS, the Domain Name System. It works like a huge phone book for the internet.

When you type a name, your computer first asks a DNS server: what is the address of this name? If that server does not know, it asks other servers. The question goes from the servers that know about endings like ".org" to the servers that know about a specific domain. Finally, the answer comes back, and your computer can connect to the right address. All this usually takes less than a second.

To make things faster, the answers are saved for some time in many places: in your browser, in your operating system and at your internet provider. This is called caching. The next time you visit the same site, your computer already knows the address and does not need to ask again.

DNS is so important that problems with it can make large parts of the internet look broken, even when the websites themselves are working perfectly. If you have ever seen a message like "server not found", there is a good chance that the problem was not the website, but the translation of its name.`,
    },
    {
      title: 'What Happens When You Open a Page',
      text: `Let us put everything together and follow one simple action: you type the name of a website and press Enter. First, your browser finds the IP address of the site with the help of DNS. Then it opens a connection to the server at this address. Because most sites today use HTTPS, the browser and the server first agree on secret keys. From this moment on, everything they send is encrypted, so that nobody on the way can read or change it.

Next, the browser sends a request written in the language of the web, HTTP. The request says, in short: please give me this page. The server reads the request, maybe asks a database for some information, and prepares an answer. The answer contains a status code, for example 200 for "everything is fine" or the famous 404 for "page not found", and the content of the page itself.

The first answer is usually an HTML document. While the browser reads it, it discovers that it needs more files: styles that describe colours and fonts, scripts that make the page interactive, images and fonts. For each of these files the browser sends new requests, often to different servers. Many large sites use content delivery networks, which keep copies of these files on servers all over the world, so that every user can download them from a place nearby.

Finally, the browser puts everything together and draws the page on your screen. All of this, from typing the name to seeing the page, often takes less than a second. Hundreds of computers in different countries may have helped, and none of them knew the whole story. That is perhaps the most amazing thing about the internet: it works because millions of independent parts follow the same simple rules.`,
    },
  ],
}
