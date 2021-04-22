
import translate from "translate";
import dotenv from "dotenv";
import syllabify from 'syllabify';
import natural from 'natural';

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

async function translateText(sourceText, sourceLanguage, targetLanguage, apiEndpoint = "https://translation.googleapis.com/language/translate/v2") {

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
    var punctuation = '!"#$%&\'()*—+,-–./:;<=>?@[\\]^_`{|}~«»„“”';
    var withoutHtml = text.replace(/(<([^>]+)>)/gi, "");

    //var s = "This «»„“” ., -/ is #! an $ % ^ & * example ;: {} of a = -_ string with `~)() punctuation";
    var punctuationless = text
                            .replace(/ /g," ")
                            .replace(/[.«»?„“”,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    var finalString = punctuationless.replace(/\s{2,}/g," ");

    let words = [...new Set(finalString.split(' '))];
    
    console.log("words: ", words.length)

    var tokens = [];
    for(var wx=0; wx < words.length; wx++) {
        var word = words[wx];

        if(word !== null && word !== '' && isNaN(word)) {
            var stem = natural.PorterStemmerRu.stem(word)
            var syllables = word.length === 1 ? [ word ] : null;
            var syllableCount = word.length === 1 ? 1 : 0;
            if(word.length > 1) {
                try
                {
                    syllables = syllabify(word)
                    syllables === null ? 0 : syllables.length;
                }
                catch(ex)
                {
                    console.log(`${word}`, ex)
                }    
            }
            var token = {
                stem: stem,
                word: word,
                syllables: syllables,
                syllableCount:  syllableCount,
                jointSyllables: syllables === null ? null : syllables.join('-'),
            }
            tokens.push(token)    
        }
    }

    return tokens.sort((a, b) => a.stem.localeCompare(b.stem));
}

(async () => {

    var text = `
    «После сих происшествий было слово Господа к Авраму в видении, и сказано: не бойся, Аврам; Я твой щит; награда твоя весьма велика» (Быт. 15:1).

    Прочитайте Быт. 15:1–3. Поразмышляйте о контексте, в котором была дана эта весть. Почему первое, что Господь говорит Авраму, — «не бойся»? Чего мог бояться Аврам?
    
    Здесь особенно интересно то, что Господь говорит Авраму: «Я твой щит». Использование личного местоимения показывает личную природу взаимоотношений. Бог установит с Аврамом очень близкие личные отношения — так, как Он сделает это со всеми нами.
    
    Быт. 15:1 — первый и единственный раз в Библии, когда Бог использует слово «щит», чтобы открыть Себя. Другие библейские авторы используют этот образ, говоря о Боге, но Бог больше нигде так не говорит (см. Втор. 33:29; Пс. 17:31; 83:12; 143:2).
    
    Когда Бог называет Себя чьим-либо щитом, что это означает? Значило ли это для Аврама нечто, что может не значить для нас теперь? Можем ли мы претендовать на это обетование? Означает ли оно, что нам не будет причинен физический вред? В отношении чего Бог является щитом? Как вы понимаете этот образ?
    
    «Христос питает к нам не случайный интерес. Он любит нас сильнее, чем мать любит свое дитя… Наш Спаситель, находясь в человеческой плоти, искупил нас Своими страданиями, скорбью, поношением, отвержением, позором, насмешками и смертью. Он бодрствует над тобою, трепещущее дитя Божье. Под Его защитой ты обретешь уверенность... Наша слабость, заключенная в человеческой плоти, не преградит нам доступ к Небесному Отцу, ибо Он [Христос] умер, чтобы ходатайствовать за нас» (Э. Уайт. Сыновья и дочери Божьи, с. 77).
    
    Один человек был верным последователем Господа. Затем он внезапно умер. Что произошло с Богом как с его щитом? Должны ли мы понимать идею Бога как нашего щита иначе? Поясните свой ответ. От чего Бог всегда обещает защитить нас? (См. 1 Кор. 10:13.)
    `;

    //console.log(text.length * 6);

    var tokens = uniqueWords(text);
    console.log(tokens.filter(element => element.syllableCount === 1));
    console.log([...tokens.map(t => t.stem)]);

    //var translatedText = await translateWord('ru', text, 'en');
    //var translatedText = await translateText(text, 'ru', 'en');
    //console.log(translatedText[0]);
})();