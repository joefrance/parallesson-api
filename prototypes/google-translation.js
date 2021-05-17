
import cld from "cld";
import translate from "translate";
import dotenv from "dotenv";
import syllabify from 'syllabify';
import natural from 'natural';
import fs from 'fs';
import parse from 'csv-parse';
//console.log(cld);

// https://en.openrussian.org/dictionary

dotenv.config();

// Check your balance
// https://stackoverflow.com/questions/53335286/api-to-check-my-remaining-balance-in-google-translation-api

async function translateWord(sourceLang, sourceWords, targetLang) {
    translate.engine = "google";
    translate.key = "mykey";
    translate.from = sourceLang;
    translate.to = targetLang;
    return await translate(sourceWords, { to: targetLang, from: sourceLang });
}

async function translateTextViaGoogle(sourceText, sourceLanguage, targetLanguage, apiEndpoint = "https://translation.googleapis.com/language/translate/v2") {

    try
    {

        var apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

        const res = await fetch(apiEndpoint, {
            method: "POST",
            body: JSON.stringify({
                q: sourceText,
                source: sourceLanguage,
                target: targetLanguage
            }),
            headers: { "Authorization": `Bearer ${apiKey}` }
            //headers: { "Content-Type": "application/json" }
        });
    
        var result = await res.json();
        if(result.data === undefined || result.data === null) {
            return null;
        }
        return result.data.translations;
    
    }
    catch(ex)
    {
        console.log(ex);
    }
}

async function uniqueWords(text, languageCodeHint, isHTML) {
    var punctuation = '!"#$%&\'()\[\]—*—+,-–./:;<=>?@[\\]^_`{|}~«»„“”';
    var withoutHtml = text.replace(/(<([^>]+)>)/gi, "");
    //var s = "This «»„“” ., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation";
    // var punctuationless = text
    //                         .toLowerCase()
    //                         .replace(/ /g," ")
    //                         .replace(/\n/g," ")
    //                         .replace(/.\[\]\_\*—-«»?„“”#,\/#!$%\^&\*;:{}=-_`~\(\)]/g,"");
    // var finalString = punctuationless.replace(/\s{2,}/g," ");

    var s = "This., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation";
    var punctuationless = withoutHtml
                            .toLowerCase()
                            .replace(/ /g," ")
                            .replace(/\n/g," ")
                            .replace(/[.,\/#!$<>%\^&\*;:{}=\-_'`~()—«»?„“”]/g," ");
    var finalString = punctuationless.replace(/\s{2,}/g," ");

    var detectedLanguageCode = '';
    try
    {
        var detectionOptions  = {
            isHTML       : isHTML,
            tldHint      : languageCodeHint
        };

        var detectedLanguages = await cld.detect(text, detectionOptions);
        detectedLanguageCode = detectedLanguages.languages[0].code;
        switch(detectedLanguageCode) {
            case 'iw':
                detectedLanguageCode = 'he';
                break;
        }
    }
    catch(ex)
    {
        console.log(ex);
    }    

    var allWords = finalString.split(' ');
    console.log("allWords: ", allWords.length)

    let words = allWords;// [...new Set(allWords)];    
    console.log("words: ", words.length)

    var stemTokens = [];
    var tokens = [];
    for(var wx=0; wx < words.length; wx++) {
        var word = words[wx];
        //console.log(word);
        if(word !== '') {
            var iscyrallic = isCyrralic(word);
            // var ishebrew = isHebrew(word);
            // if(ishebrew) {
            //     detectedLanguageCode = 'he';
            // } else {
            // }  
        }

        if(word !== null && word !== '' && isNaN(word)) {
            var syllables = null; //word.length === 1 ? [ word ] : null;
            var syllableCount = 0; //word.length === 1 ? 1 : 0;
            //if(word.length > 1) {
                try
                {
                    syllables = syllabify(word)
                    syllableCount = syllables === null ? 0 : syllables.length;
                }
                catch(ex)
                {
                    if(word.length === 1) {
                        if(iscyrallic) {
                            var syllables = [ word ]
                            var syllableCount = 1    
                        }
                    } else {
                        syllables = null
                        syllableCount = 0;
                    }
        
                }    
            //}
            var stem = null;
            if(syllables !== null && detectedLanguageCode === 'ru') {
                stem = natural.PorterStemmerRu.stem(word);
            }
            var containsNumbers = hasNumbers(word);

            //var searchStem = stemTokens.filter(s => s.stem === stem);

            var token = {
                seq: wx,
                stem: stem,
                word: word,
                containsNumbers: containsNumbers,
                jointSyllables: syllables === null ? null : syllables.join('-'),
                iscyrallic: iscyrallic,
                syllables: syllables,
                syllableCount:  syllableCount,
                detectedLanguageCode: detectedLanguageCode,
            }
           
            tokens.push(token)

            // if(!searchStem === null) {
            //     searchStem.tokens.push(token)
            // } else {
            //     searchStem = { stem: stem, tokens: [] };
            // }

        }
    }

    //let uniqueStems = [...new Set(tokens.map(t => t.stem))];
    //console.log("uniqueStems: ", uniqueStems.length)


    return tokens;//.sort((a, b) => a.stem.localeCompare(b.stem));
}

(async () => {
    try
    {

        // const fileContent = fs.readFileSync('/Users/joefrance/Downloads/openrussian-csv/words.tsv', 'utf8');
        //  const records = parse(fileContent, {columns: true}, (e) => { console.log(e); });
        // console.log(records[0], records[1], records[2])

        var text = ``;

        //text = 'Какое влияние Божье обетование. Кен, назовите, назовите, пожалуйста, несколько известных книг, которые знают и читали все американцы';
        
    //     text = `
    // ПРИМЕР. Какие дела? У нас делишки. Дела у прокурора.
    // ВЫ ДАЛИ ТАКОЙ ДОСЛОВНЫЙПЕРЕВОД ГУГЛА: How are you?
    // What are you doing? We have some business. Prosecutor's office

    // ПОСМОТРИМ, КАК ГУГЛ ПЕРЕВЕДЁТ ЭТО НА РУССКИЙ: Что делаешь? У нас есть дела. Прокуратура.
    // ПОЛУЧАЕТСЯ ЕРУНДА

    // Делишки – это маленькие, незначительные дела
    // Слово «дело» имеет разные значения. Это также может быть папка, куда помещают различные документы.
    //     `;
        
        //console.log(text.length * 6);
        var sourceLanguageCode = 'en';
        var targetLanguageCode = 'he';

        var basePath = '/Users/josephfrance/github/Adventech/sabbath-school-lessons/src';
        var mdPath = `${basePath}/${sourceLanguageCode}/2021-02/08/02.md`
        text = fs.readFileSync(mdPath, 'utf8')

        var tokens = await uniqueWords(text, sourceLanguageCode, false);
        // console.log(tokens);
        console.log(tokens.filter(element => !element.iscyrallic));
        console.log(tokens.filter(element => element.iscyrallic));
        // console.log(tokens.filter(element => element.syllableCount === 0));
        // console.log(tokens.filter(element => element.syllableCount > 2));
        // console.log([...tokens.filter(element => element.iscyrallic === true).map(t => t.stem)]);

        //var translatedText = await translateWord('ru', text, 'en');
        console.log(text);
        var tokenDictionaryPath = `./data/p9n-${sourceLanguageCode}-${targetLanguageCode}-token-dictionary.json`;
        var dict = {};
        if(fs.existsSync(tokenDictionaryPath)) {
            dict = JSON.parse(fs.readFileSync(tokenDictionaryPath, 'utf8'));
            console.log(`Dictionary contains ${Object.keys(dict).length} entries.`);            
        }
        var newTokensAdded = 0;
        var charsTx = 0;
        for(var ix=0; ix < tokens.length; ix++) {
            var txWord = '';
            var found = '';

            // translate ONLY from the source to the
            // target language as we're paying a per-character
            // fee for Google Translation's API
            if(
                tokens[ix].detectedLanguageCode === sourceLanguageCode
                && tokens[ix].detectedLanguageCode !== targetLanguageCode
            ) {
                if(dict[tokens[ix].word.toLowerCase()] === undefined) {
                    newTokensAdded++;
                    var wordToTx = tokens[ix].word;
                    charsTx += wordToTx.length;
                    var tx = await translateTextViaGoogle(wordToTx, sourceLanguageCode, targetLanguageCode);
                    if(tx === null) {
                        throw "Please check GOOGLE_TRANSLATE_API_KEY";
                    }
                    tokens[ix].googleTranslation = tx[0].translatedText;
                    txWord = tokens[ix].googleTranslation;
                    dict[tokens[ix].word.toLowerCase()] = tokens[ix];
                } else {
                    found = ' found'
                    txWord = dict[tokens[ix].word.toLowerCase()].googleTranslation;
                }
                // if(tokens[ix].stem !== tokens[ix].word) {
                //     var txStem = await translateText(tokens[ix].stem, 'ru', 'en');
                //     tokens[ix].translatedStem = txStem[0].translatedText;
                // }    
            }

            if(txWord === '') {
                console(tokens[ix]);
            }

            console.log(`${ix + 1}/${tokens.length}. ${tokens[ix].word} (${txWord})${found}`)
        }
        // Store dict
        if(newTokensAdded > 0) {
            console.log(`Dictionary now contains ${Object.keys(dict).length} entries.\r\nTranslated ${charsTx} characters.\r\n${charsTx / newTokensAdded} characters per word - average.`);
            var json = JSON.stringify(dict, null, 2);
            fs.writeFileSync(tokenDictionaryPath, json);
        }
        console.log(tokens);
        //var translatedText = await translateTextViaGoogle(text, 'ru', 'en');
        //console.log(translatedText[0]);

    }
    catch(ex)
    {
        console.log(ex);
    }    
})();

// Detect browser language preference
// https://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference

// Detect language with Google API
// https://cloud.google.com/translate/docs/basic/detecting-language#translate_detect_language-nodejs

function hasNumbers(term) {
    return /[0-9]/.test(term)
}

function isCyrralic(term) {
    return /[а-яА-ЯЁё]/.test(term)
}

function isHebrew(term) {
    return false;
    //return /[u0590-\u05FF]/.test(term)
}

function isUnicode(data) {
    if (data.length < 4) {
      return false;
    }
    const firstByte = data[0];
    const secondByte = data[1];
    const thirdByte = data[2];
    const fourthByte = data[3];
    if (firstByte == 0xef && secondByte == 0xbb && thirdByte == 0xbf) {
      return true; // UTF8
    } else if (firstByte == 0xfe && secondByte == 0xff) {
      return true; // Unicode
    } else if (firstByte == 0 && secondByte == 0 && thirdByte == 0xfe && fourthByte == 0xff) {
      return true; // UTF32
    } else if (firstByte == 0x2b && secondByte == 0x2f && thirdByte == 0x76) {
      return true; // UTF7
    }
    return false;
  }

