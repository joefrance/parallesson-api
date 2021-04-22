
import translate from "translate";
import dotenv from "dotenv";

dotenv.config();

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

(async () => {

    var text = `
    Почему Господь назвал Себя щитом Аврама? Как «все племена земные» должны были быть благословлены через Авраама? Какое из всех обетований завета можно назвать величайшим?

    «Отец и его десятилетняя дочь отдыхали на побережье. Однажды они вышли поплавать в океане, и, хотя оба были хорошими пловцами, на некотором расстоянии от берега они оказались далеко друг от друга. Отец, понимая, что течением их уносит в море, крикнул ребенку: „Мэри, я отправляюсь на берег за помощью. Если ты устанешь, перевернись на спину. Так ты сможешь плавать целый день. Я вернусь за тобой“.

    Вскоре множество поисковиков и лодок сновало по поверхности воды, пытаясь найти одну маленькую девочку. Сотни людей на берегу, услышав эту новость, с тревогой ждали конца. Прошло четыре часа, прежде чем ее нашли далеко от берега. Она спокойно плавала на спине и совсем не была напугана. Возгласы „Ура!“ и слезы радости встретили спасателей, когда те вернулись на сушу со своим драгоценным грузом, но ребенок воспринял все это спокойно. Девочка, очевидно, думала, что они ведут себя странно. Она сказала: „Папа сказал, что я могу весь день плавать на спине и что он вернется за мной, поэтому я просто плавала на спине, потому что знала, что он вернется“» (H. Richards, «When Jesus Comes Back», _Voice of_ _Prophecy News_, March 1949, p. 5).
    `;

    //var translatedText = await translateWord('ru', text, 'en');
    var translatedText = await translateText(text, 'ru', 'en');
    console.log(translatedText[0]);
})();