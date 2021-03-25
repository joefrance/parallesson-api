# parallesson-api

This project will provide the  GraphQL-based API for the [Parallesson project](https://github.com/joefrance/parallesson) which project will develop and online and offline model to facilitate reading and listening in parallel languages.

The online site will be available as an SPA mutli-device solution and limited in some functionality. The offline model will either be implemented as an Electron app. This will allow for the end-user to purchase Google Translation credits to use in the advanced features of the app.

### GrapQL queries

```gql
# Write some queries
query sources {
  getsources {
    source_id
    source_name
    source_url
    source_repo
    source_desc
  }
}

query sourceById($id: ID!) {
  getsource(id: $id) {
    source_id
    source_name
    source_url
    source_repo
    source_desc
  }
}
```

#### Query Variables

```
{
  "id": 1
}
```

#### Mutation
```
# coming soon
```

### Access various "book" listings

- Sabbath School Lessons
  - [Sabbath School API v1](https://adventech-sabbath-school.api-docs.io/v1/getting-started/introduction)
  - [Sabbath School Lessons](https://sabbath-school.adventech.io/language/)
    - [adventech github repo](https://github.com/Adventech)
    - [How to Contribute Sabbath School Lessons to Adventech
](https://medium.com/@imasaru/how-to-contribute-sabbath-school-lessons-to-adventech-6818aaca56c7)
- [E.G. White Estate Books](https://m.egwwritings.org/languages)
- gutenberg
  - [gutenberg-http A simple API for books](https://justamouse.com/gutenberg-http/)
  - [Gutenberg](https://github.com/c-w/gutenberg/)
  - [Gutenberg-HTTP](https://github.com/c-w/gutenberg-http/)

- [Create Electron App](https://www.leveluptutorials.com/tutorials/level-1-electron)
  - [Part 1](https://www.youtube.com/watch?v=GwxSkNkP67o)


Idea, use text-to-speech to read text alternately from one language to the next.

- [English Audio Speech-to-Text Transcript with Hugging Face | Python NLP](https://www.youtube.com/watch?v=dJAoK5zK36M)

### NLP

- [Multilingual BERT - Part 1 - Intro and Concepts](https://www.youtube.com/watch?v=rpuAZ8Ja0KE)
- [MBart](https://www.youtube.com/watch?v=oO7k5lH8Oe8)
- [Hugging Face](https://github.com/huggingface)
- [node-nlp](https://www.npmjs.com/package/node-nlp)
- [Language translation with HuggingFace](https://www.youtube.com/watch?v=fxZtz0LPJLE)
- [Question Answering for Node.js](https://github.com/huggingface/node-question-answering)

Create Parallel Audiobooks indexed to the text

- [Step-By-Step: How to Create an Audiobook From MP3 Files](https://naturallyvoice.com/step-by-step-how-to-create-an-audiobook-from-mp3-files/)

See the EPUB format. Possibly produce output in this format.

- [EPUB Wikipedia](https://en.wikipedia.org/wiki/EPUB#:~:text=EPUB%20is%20an%20e%2Dbook,smartphones%2C%20tablets%2C%20and%20computers.)
- [Creating ePub Files with Node.js](https://thecodebarbarian.com/creating-epub-files-with-node-js.html)
- [How to Turn a Microsoft Word Document Into an Ebook (EPUB)](https://www.janefriedman.com/word-epub/)
- [tutorial to create e-book read application - epub file formate [duplicate]](https://stackoverflow.com/questions/3193294/tutorial-to-create-e-book-read-application-epub-file-formate)

Goals:

- Produce a side-by-side readable dual-language viewer/printer
- Allow user to load/drag-and-drop two PDFs
- Audio?
- Notes lines?

First steps
- GitHub repo - public
- Stack
  - Node
  - React (Native?)
  - PWA
  - PostgreSQL?/MongoDB
- PDF reader/"stitcher"

Dictionary for "parts of speech" and definitions
https://github.com/meetDeveloper/googleDictionaryAPI
- Find "language codes".
  - [Codes for the Representation of Names of Languages - ISO 639-2 Code](https://www.loc.gov/standards/iso639-2/php/code_list.php)
