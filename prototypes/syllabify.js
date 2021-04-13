//const syllabify = require('syllabify')
import syllabify from 'syllabify';
import natural from 'natural';

// https://www.npmjs.com/package/natural-ff

// or
// import syllabify from 'syllabify'
// исследовали
 
//var s = syllabify('Вдохновение')
//=> [ 'Вдо', 'хно', 'ве', 'ни', 'е' ]

// https://www.redhenlab.org/home/the-cognitive-core-research-topics-in-red-hen/the-barnyard/russian-nlp

//var s = syllabify(process.argv[2])
//=> [ 'Вдо', 'хно', 'ве', 'ни', 'е' ]

//console.log(s)

console.log(natural.PorterStemmer.stem(process.argv[2])); // stem a single word
//console.log(natural.PorterStemmerRu.stem(process.argv[2]));
//console.log(natural.PorterStemmerEs.stem("jugaría"));

// natural.PorterStemmer.attach();
// console.log("i am waking up to the sounds of chainsaws".tokenizeAndStem());
// console.log("chainsaws".stem());

// natural.LancasterStemmer.attach();
// console.log("i am waking up to the sounds of chainsaws".tokenizeAndStem());
// console.log("chainsaws".stem());
