import pos from 'pos';
import natural from 'natural';
import syllables from 'syllables';
import translate from "translate";

// Decliner
// https://www.npmjs.com/package/russian-nouns-js

// https://www.npmjs.com/package/translate#engines

// parts-of-speech color coding

// https://www.brwi.org/blog/2017/7/28/color-coding-sentences

// Russian part-of-speech
// http://www.derczynski.com/sheffield/papers/archive/innopolis/gumarov.pdf
// https://github.com/RinatGumarov/Russian_Pos_Tagger

// https://www.npmjs.com/search?q=syllables

var words = new pos.Lexer().lex(`How many remember distinctly in our childhood a sickness or a touch of pneumonia that made us very sick, with the potential for something even worse? In the long feverish night, we would awaken from a half sleep to see our mother or father sitting in a chair beside our bed in the soft glow of the night-light.`);
var tagger = new pos.Tagger();
var taggedWords = tagger.tag(words);

var oringinalSeqence = [];
var verbs = [];
var nouns = [];
var determiners = [];
var prepositions = [];
var others = [];
var allTags = [];

translate.engine = 'libre';

(async () => {
    for (var i = 0; i < taggedWords.length; i++ ) {
        var taggedWord = taggedWords[i];
        var syls = syllables(taggedWord[0]);
        //var tx = await translateWord('en', taggedWord[0], 'ru'); //translate(taggedWord[0], { to: 'ru', from: 'en' });
        // try {
        //     syls = syllables(taggedWord[0])
        //   } catch (error) {
        //     //console.error(error);
        //     // expected output: ReferenceError: nonExistentFunction is not defined
        //     // Note - error messages will vary depending on browser
        //   }
    
        var key = taggedWord[0] + "~|~" + taggedWord[1];
        var stem = natural.PorterStemmer.stem(taggedWord[0]);
        var wt = {
            word: taggedWord[0],
            tag: taggedWord[1],
            stem: stem,
            syllables: syls,
            //translation: tx
        };
        wt.key = key;

        if(!allTags.includes(wt.tag)) allTags.push(wt.tag);

        oringinalSeqence.push(wt);


        //console.log(wt);
        
        if(wt.tag.substr(0, 1) === 'V' && !verbs.find(element => element.key === key)) verbs.push(wt);
        else if(wt.tag.substr(0, 1) === 'N' && !nouns.find(element => element.key === key)) nouns.push(wt);
        else if(wt.tag === 'DT' && !determiners.find(element => element.key === key)) determiners.push(wt);
        else if(wt.tag === 'IN' && !prepositions.find(element => element.key === key)) prepositions.push(wt);
        else if(!others.find(element => element.key === key)) others.push(wt);
    } 

    var allWords = {
        oringinalSeqence: oringinalSeqence,
        verbs: verbs.sort((a, b) => a.word.localeCompare(b.word)),
        nouns: nouns.sort((a, b) => a.word.localeCompare(b.word)),
        determiners: determiners.sort((a, b) => a.word.localeCompare(b.word)),
        prepositions: prepositions.sort((a, b) => a.word.localeCompare(b.word)),
        others: others.sort((a, b) => a.word.localeCompare(b.word))
    };
    
    console.log(allWords)
    
    let allVerbs = allWords.verbs.map(e => e.word);
    //console.log(allVerbs)
    let uniqueVerbsSorted = [...new Set(allVerbs)].sort((a, b) => a.localeCompare(b));
    var joined = uniqueVerbsSorted.join(' ~ ');

    console.log(`${joined}`)
    //console.log(`to ${allWords.verbs.map(e => e.stem).join('. to ')}.`)    

    //for(var ix = 0; ix < uniqueVerbsSorted.length; ix++) {
        var tx = await translateWord('en', joined, 'ru');
        console.log(tx);
        //console.log(`${uniqueVerbsSorted[ix]} -> ${tx}`);
    //}

    var html = "<html><body>";
    html += `
    <style>    
    .part-of-speech-nnp {
        color: rgb(128, 59, 59);
        background-color: rgb(212, 231, 231);
    }
    

    .part-of-speech-vbz {
        color: navy;
        background-color: rgb(135, 199, 39);
    }
    

    .part-of-speech-vbn {
        color: navy;
        background-color: rgb(102, 118, 78);
    }
    

    .part-of-speech-prp-ds {
        color: rgb(88, 110, 158);
        background-color: rgb(229, 235, 235);
    }
    

    .part-of-speech-nns {
        color: brown;
        background-color: rgb(169, 201, 201);
    }
    

    .part-of-speech-to {
        color: rgb(214, 40, 40);
        background-color: rgb(20, 212, 212);
    }
    

    .part-of-speech-prp {
        color: rgb(59, 81, 128);
        background-color: rgb(194, 212, 212);
    }
    

    .part-of-speech-in {
        color: red;
        background-color: cyan;
    }
    

    .part-of-speech-jj {
        color: blueviolet;
        background-color: burlywood;
    }
    

    .part-of-speech-nn {
        color: brown;
        background-color: lightcyan;
    }
    

    .part-of-speech-cc {
        color: rgb(107, 128, 0);
        background-color: rgb(47, 172, 255);
    }

    .part-of-speech-dt {
        color: white;
        background-color: grey;
    }

    .part-of-speech-jjs {
        color: rgb(174, 109, 235);
        background-color: rgb(221, 193, 156);

    }
    

    .part-of-speech-rb {
        color: greenyellow;
        background-color: navy;
    }
    

    .part-of-speech-md {
        color: navy;
        background-color: greenyellow;
    }
    

    .part-of-speech-vb {
        color: navy;
        background-color: greenyellow;
    }
    

    .part-of-speech-vbd {
        color: navy;
        background-color: greenyellow;
    }
    

    .part-of-speech-vbp {
        color: navy;
        background-color: greenyellow;
    }

    .part-of-speech-vbg {
        color: navy;
        background-color: greenyellow;
    }
   

    .part-of-speech-wp-ds {
        color: rgb(53, 53, 1);
        background-color: rgb(203, 212, 191);
    }
    
    .part-of-speech-wp {
        color: rgb(70, 70, 3);
        background-color: rgb(234, 238, 229);
    }
    </style>
    `;
    html += oringinalSeqence.map(pos => htmlDivFromPos(pos)).join(' ');
    html += "</body></html>"
    console.log(html);

    // allTags.forEach(tag => console.log(`
    // .part-of-speech-${tag.toLowerCase()} {
    //     color: navy;
    //     background-color: greenyellow;
    // }
    // `));

})();

function htmlDivFromPos(pos) {

    return `<span class="part-of-speech-${pos.tag.replace('$', 'ds') .toLowerCase()}">${pos.word}</span>`;
}

async function translateWord(sourceLang, sourceWords, targetLang) {
    translate.from = sourceLang;
    translate.to = targetLang;
    return await translate(sourceWords, { to: targetLang, from: sourceLang });
}


// extend the lexicon
//tagger.extendLexicon({'Obama': ['NNP']});
//tagger.tag(['Mr', 'Obama']);
// --> [[ 'Mr', 'NNP' ], [ 'Obama', 'NNP' ]]

// https://huggingface.co/flair/pos-english
/*

tag	meaning
--- -------
ADD	Email
AFX	Affix
CC	Coordinating conjunction
CD	Cardinal number
DT	Determiner
EX	Existential there
FW	Foreign word
HYPH	Hyphen
IN	Preposition or subordinating conjunction
JJ	Adjective
JJR	Adjective, comparative
JJS	Adjective, superlative
LS	List item marker
MD	Modal
NFP	Superfluous punctuation
NN	Noun, singular or mass
NNP	Proper noun, singular
NNPS	Proper noun, plural
NNS	Noun, plural
PDT	Predeterminer
POS	Possessive ending
PRP	Personal pronoun
PRP$	Possessive pronoun
RB	Adverb
RBR	Adverb, comparative
RBS	Adverb, superlative
RP	Particle
SYM	Symbol
TO	to
UH	Interjection
VB	Verb, base form
VBD	Verb, past tense
VBG	Verb, gerund or present participle
VBN	Verb, past participle
VBP	Verb, non-3rd person singular present
VBZ	Verb, 3rd person singular present
WDT	Wh-determiner
WP	Wh-pronoun
WP$	Possessive wh-pronoun
WRB	Wh-adverb
XX	Unknown
*/