import fetch from 'node-fetch';
// https://github.com/uav4geo/LibreTranslate

// Run with Docker
// docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

const sourceText = process.argv[2];
const xlationFromOtherLeadingBrand = ""//"Прошлая неделя закончилась падением человечества из-за греха наших прародителей. Эта неделя представляет собой краткое изложение всего квартала, поскольку мы берем по одному дню, чтобы взглянуть на ранние заветы, те, которые были, по-своему, проявлением истинной истины настоящего завета, завета, ратифицированного на Голгофе. кровь Иисуса, в которую мы, христиане, вливаемся вместе с нашим Господом.";
const apiEndpoint = "http://localhost:5000/translate"
const sourceLanguage = 'en';
const targetLanguage = 'ru';

//console.log(`${sourceText}\r\n`);
var translatedText = await translateText(sourceText, sourceLanguage, targetLanguage, apiEndpoint);

console.log({
    sourceText: sourceText,
    libreTranslation: translatedText,
    otherLeadingBrand: xlationFromOtherLeadingBrand
});

async function translateText(sourceText, sourceLanguage, targetLanguage, apiEndpoint) {

    const res = await fetch(apiEndpoint, {
        method: "POST",
        body: JSON.stringify({
            q: sourceText,
            source: sourceLanguage,
            target: targetLanguage
        }),
        headers: { "Content-Type": "application/json" }
    });

    var result = await res.json();
    return result.translatedText;
}