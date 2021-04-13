import pos from 'pos';
import natural from 'natural';
import syllables from 'syllables';

// https://www.npmjs.com/search?q=syllables

var words = new pos.Lexer().lex(`fair-looking lady. Prestidigitation. We begin with the covenant God made with Noah to spare him and his family destruction. We proceed to the covenant with Abraham, so rich and full of promise for all of us; then to the covenant at Sinai and the importance of what was proclaimed there; and finally we look at the new covenant, the one that all the others pointed toward. All of these, of course, will be studied in more depth in the next several weeks. This week is just a sneak preview.`);
var tagger = new pos.Tagger();
var taggedWords = tagger.tag(words);
for (var i = 0; i < taggedWords.length; i++ ) {
    var taggedWord = taggedWords[i];
    var syls = [];
    try {
        syls = syllables(taggedWord[0])
      } catch (error) {
        //console.error(error);
        // expected output: ReferenceError: nonExistentFunction is not defined
        // Note - error messages will vary depending on browser
      }

    var wt = {
        word: taggedWord[0],
        tag: taggedWord[1],
        stem: natural.PorterStemmer.stem(taggedWord[0]),
        syllables: syls
    };
    if(
        wt.tag !== '.DT'
        && wt.tag !== '.IN'
        ) {
        console.log(wt);
    }
}

// extend the lexicon
tagger.extendLexicon({'Obama': ['NNP']});
tagger.tag(['Mr', 'Obama']);
// --> [[ 'Mr', 'NNP' ], [ 'Obama', 'NNP' ]]