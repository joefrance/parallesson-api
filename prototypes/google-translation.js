
import translate from "translate";
import dotenv from "dotenv";
import syllabify from 'syllabify';
import natural from 'natural';
import fs from 'fs';
import parse from 'csv-parse';
console.log(parse);

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
    return result.data.translations;
}

function uniqueWords(text) {
    var punctuation = '!"#$%*&\'<>()\[\]*—+,-–./:;<=>?@[\\]^_`{|}~«»„“”';
    var withoutHtml = text.replace(/(<([^>]+)>)/gi, "");

    //var s = "This «»„“” ., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation";
    var punctuationless = text
                            .toLowerCase()
                            .replace(/ /g," ")
                            .replace(/\n/g," ")
                            .replace(/[.\<>[\]"*«»?„“”,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    var finalString = punctuationless.replace(/\s{2,}/g," ");

    var allWords = finalString.split(' ');
    console.log("allWords: ", allWords.length)

    let words = allWords;// [...new Set(allWords)];    
    console.log("words: ", words.length)

    var stemTokens = [];
    var tokens = [];
    for(var wx=0; wx < words.length; wx++) {
        var word = words[wx];
        //console.log(word);
        var iscyrallic = isCyrralic(word);

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
            var stem = natural.PorterStemmerRu.stem(word)
            var searchStem = stemTokens.filter(s => s.stem === stem);

            var token = {
                seq: wx,
                stem: stem,
                word: word,
                jointSyllables: syllables === null ? null : syllables.join('-'),
                iscyrallic: iscyrallic,
                syllables: syllables,
                syllableCount:  syllableCount,
            }
           
            tokens.push(token)

            if(!searchStem === null) {
                searchStem.tokens.push(token)
            } else {
                searchStem = { stem: stem, tokens: [] };
            }

        }
    }

    let uniqueStems = [...new Set(tokens.map(t => t.stem))];
    console.log("uniqueStems: ", uniqueStems.length)


    return tokens;//.sort((a, b) => a.stem.localeCompare(b.stem));
}

(async () => {

    // const fileContent = fs.readFileSync('/Users/joefrance/Downloads/openrussian-csv/words.tsv', 'utf8');
    //  const records = parse(fileContent, {columns: true}, (e) => { console.log(e); });
    // console.log(records[0], records[1], records[2])

    var text = `
    ### Библейские тексты для исследования
    Втор. 1:29–31; Ос. 11:1; Откр. 5:9; Втор. 29:10–13; Исх. 19:5, 6; Рим. 6:1, 2; Откр. 14:12; Рим. 10:3.
    
    > Памятный стих
    > «Вы видели, что Я сделал Египтянам, и как Я носил вас _как бы_ на орлиных крыльях, и принес вас к Себе» (Исх. 19:4).
    
    **Ключевые вопросы:**
    
    Какие образы использовал Господь, чтобы описать Свои отношения с Израилем? Какие существуют параллели между историей об исходе и Синае и нашим личным спасением? Какова была роль закона в синайском завете?
    
    «С маленьким мальчиком, одним из семи детей в многодетной семье, произошел несчастный случай, и его доставили в больницу. В его доме редко бывало чего-либо в достатке. Ему никогда не доставалось больше, чем половина стакана молока. Если стакан был полон, его делили на двоих детей, и тот, кто пил первым, должен был быть осторожным, чтобы не выпить слишком много. Когда малыша устроили в больнице, медсестра принесла ему большой стакан молока. Несколько мгновений он тоскливо смотрел на него, а затем, помня о нужде, царившей дома, спросил: „Сколько мне можно отпить?“ Медсестра со слезами на глазах и с комом в горле сказала: „Выпей весь, малыш, выпей весь!“» (H. Richards, «Free Grace», _Voice of Prophecy News,_ June 1950, p. 4).
    
    Подобно этому мальчику, у древнего Израиля, как и у нас, было преимущество — пить вдоволь из колодца спасения. Избавление Израиля от многовекового рабства и угнетения было чудесным проявлением благодати Божьей. Подобным же образом благодать Божья участвует в нашем собственном освобождении от греха.
    
    #### Для дополнительного чтения: Избранные цитаты Эллен Уайт
    
    Церковь по замыслу Божьему призвана сотрудничать с Ним в деле спасения людей. Она создана для служения, и ее задача — нести Евангелие миру. Изначально план Господа заключался в том, чтобы Церковь отражала в мире Его полноту и совершенство. Членам ее, людям, которых Он вывел из тьмы в чудный Свой свет, надлежит являть Его славу. Церковь — хранительница сокровищ благодати Христовой, и через нее в конечном счете должна открыться даже «начальствам и властям на небесах» вся полнота любви Божьей (Ефесянам 3:10). {ДА 10.1}
    
    Mне был показан народ Божий в связи с его деятельностью в эти последние дни. Я видела, что многие, соблюдающие субботу, лишатся вечной жизни, так как они не извлекают уроков из печальных опытов сынов Израилевых и их порабощают те же самые пороки. Если они не избавятся от своих грехов, то падут, как и израильтяне, и никогда не войдут в Небесный Ханаан. «Все это происходило с ними, как образы; а описано в наставление нам, достигшим последних веков» (1 Коринфянам 10:11). {1СЦ 533.2}
    `;

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

    var tokens = uniqueWords(text);
    // console.log(tokens);
    console.log(tokens.filter(element => !element.iscyrallic));
    console.log(tokens.filter(element => element.iscyrallic));
    // console.log(tokens.filter(element => element.syllableCount === 0));
    // console.log(tokens.filter(element => element.syllableCount > 2));
    // console.log([...tokens.filter(element => element.iscyrallic === true).map(t => t.stem)]);

    //var translatedText = await translateWord('ru', text, 'en');
    console.log(text);
    var tokenDictionaryPath = './data/p9n-ru-en-token-dictionary.json';
    var dict = {};
    if(fs.existsSync(tokenDictionaryPath)) {
        dict = JSON.parse(fs.readFileSync(tokenDictionaryPath, 'utf8'));
    }
    //console.log(dict.length);
    var newTokensAdded = 0;
    for(var ix=0; ix < tokens.length; ix++) {
        if(tokens[ix].iscyrallic) {
            var txWord = '';
            if(dict[tokens[ix].word.toLowerCase()] === undefined) {
                newTokensAdded++;
                var tx = await translateTextViaGoogle(tokens[ix].word, 'ru', 'en');
                tokens[ix].googleTranslation = tx[0].translatedText;
                txWord = tokens[ix].googleTranslation;
                dict[tokens[ix].word.toLowerCase()] = tokens[ix];
            } else {
                txWord = dict[tokens[ix].word.toLowerCase()].googleTranslation;
            }
            // if(tokens[ix].stem !== tokens[ix].word) {
            //     var txStem = await translateText(tokens[ix].stem, 'ru', 'en');
            //     tokens[ix].translatedStem = txStem[0].translatedText;
            // }    
        }
        console.log(`${ix + 1}/${tokens.length}. ${tokens[ix].word} (${txWord}) `)
    }

    // Store dict
    if(newTokensAdded > 0) {
        console.log(dict.length);
        var json = JSON.stringify(dict, null, 2);
        fs.writeFileSync(tokenDictionaryPath, json);
    }
    console.log(tokens);
    //var translatedText = await translateTextViaGoogle(text, 'ru', 'en');
    //console.log(translatedText[0]);
})();

function isCyrralic(term) {
    return /[а-яА-ЯЁё]/.test(term)
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