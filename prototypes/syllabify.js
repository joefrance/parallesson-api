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

var word = process.argv[2];
var syllables = syllabify(word)
//=> [ 'Вдо', 'хно', 'ве', 'ни', 'е' ]


//console.log(natural.PorterStemmer.stem(process.argv[2])); // stem a single word
var stem = natural.PorterStemmerRu.stem(word)
var token = {
    word: word,
    stem: stem,
    syllables: syllables,
    jointSyllables: syllables.join('-'),
}
console.log(token);
//console.log(natural.PorterStemmerEs.stem("jugaría"));

// natural.PorterStemmer.attach();
// console.log("i am waking up to the sounds of chainsaws".tokenizeAndStem());
// console.log("chainsaws".stem());

// natural.LancasterStemmer.attach();
// console.log("i am waking up to the sounds of chainsaws".tokenizeAndStem());
// console.log("chainsaws".stem());
