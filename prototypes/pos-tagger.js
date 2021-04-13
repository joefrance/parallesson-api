import natural from 'natural';

// https://www.npmjs.com/package/natural-ff

// POS Tagger
https://github.com/NaturalNode/natural/tree/master/lib/natural/brill_pos_tagger/data/English
// https://github.com/NaturalNode/natural/blob/master/lib/natural/brill_pos_tagger/data/English/tr_from_posjs.txt

//var natural = require("natural");
//var path = require("path");
 
var base_folder = './natural/lib/natural/brill_pos_tagger';//  path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = 'NN';
 
var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);
 
var txt = `Last week left off with the fall of humanity, due to our first parents’ sin. This week is a quick summary of the whole quarter, as we take one day each to look at the early covenants, the ones that were all, in their own way, present-truth manifestations of the true covenant, the one ratified at Calvary by the blood of Jesus, the one that we, as Christians, enter into with our Lord.`;
var splitText = txt.split(' ');
console.log(tagger.tag(splitText));

var sentence = ["I", "see", "the", "man", "with", "the", "telescope"];
console.log(tagger.tag(sentence));
