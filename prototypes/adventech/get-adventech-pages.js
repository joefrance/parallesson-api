import fs from 'fs';
import pos from 'pos';
import syllables from 'syllables';
import natural from 'natural';
import translate from "translate";

//import { readdir } from 'fs/promises';
import YAML from 'yamljs';
import MarkdownIt from 'markdown-it';
import { isNamedType } from 'graphql';

var md = new MarkdownIt();

// Right-to-left languages
// https://www.w3.org/International/questions/qa-html-dir#:~:text=Setting%20up%20a%20right%2Dto,direction%20for%20the%20whole%20document.
// https://en.wikipedia.org/wiki/Right-to-left_script

// TL;DR
// Arabic, Hebrew, Pashto, Persian, Urdu, and Sindhi
// are the most widespread RTL writing systems in modern times.

// More complete list
// https://en.wikipedia.org/wiki/Right-to-left_script#List_of_RTL_scripts

const lslLanguage = 'en';
const lslLangDir = 'ltl';
const rslLanguage = 'ru';
const rslLangDir = 'ltr';
const chapterFolder = '2021-02';
const chapterNumber = '05';
const lslFolder = `/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/${lslLanguage}/${chapterFolder}/${chapterNumber}`;
const rslFolder = `/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/${rslLanguage}/${chapterFolder}/${chapterNumber}`;
const apiEndpoint = "http://localhost:5000/translate"
var lslGlossary = {
  lang: lslLanguage,
  tokens: []
};

var rslGlossary = {
  lang: rslLanguage,
  tokens: []
};

var lslPos = {
  tokens: []
};

var rslPos = {
  tokens: []
};

// async function f() {
//   return Promise.resolve(1);
// }

// f().then(value => {
//   console.log(value)
// });

function getTranslationFromGlossary(word, glossary) {
  var wt = glossary.tokens.find(entry => entry.word.toLowerCase() === word.toLowerCase());
  if(wt !== null) return wt.translation;

  return '';
}


function getHtmlParagraphFromPos(pos) {
  var paragraph = ''; //'<span onmouseover="highlight(this);" onmouseout="unhighlight(this)">';

  if(pos.oringinalSeqence === undefined) return '';

  for(var ox = 0; ox < pos.oringinalSeqence.length; ox++) {
    var wt = pos.oringinalSeqence[ox];
    if(wt.isPunctuation) {
      paragraph += `${wt.word} `;
    } else {
      if(wt.translation !== '') {
        //paragraph += `<span onmouseover="highlight(this, '${wt.word}');" onmouseout="unhighlight(this, '${wt.word}')">${wt.word}</span> `;
        paragraph += `<div class="tooltip">${wt.word}<span class="tooltiptext">${wt.translation}</span></div> `;
      } else {
        paragraph += `${wt.word} `;
      }
    }
  }

  return paragraph;
}

async function translateText(sourceText, sourceLanguage, targetLanguage, apiEndpoint) {

  if(!isNaN(sourceText)) {
    return '';
  }

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

  if(!isNaN(result.translatedText)) {
    return '';
  }

  //console.log(sourceText, result.translatedText)
  return result.translatedText;
}

async function getPartsOfSpeech(paragraph, sourceLanguage, targetLanguage, apiEndpoint, glossary) {
  var punctuation = '!"#$%&\'()*+,-–./:;<=>?@[\\]^_`{|}~«»„“”';
  var withoutHtml = paragraph.replace(/(<([^>]+)>)/gi, "");
  
  var oringinalSeqence = [];
  var verbs = [];
  var nouns = [];
  var determiners = [];
  var prepositions = [];
  var others = [];
  var punctuations = [];
  var allTags = [];

  if(sourceLanguage === 'en') {
    var words = new pos.Lexer().lex(withoutHtml);
    var tagger = new pos.Tagger();
    var taggedWords = tagger.tag(words);
    for (var i = 0; i < taggedWords.length; i++ ) {
      var taggedWord = taggedWords[i];
      var syllableCount = syllables(taggedWord[0]);
      var key = taggedWord[0].toLowerCase() + "~|~" + taggedWord[1].toLowerCase();
      var stem = natural.PorterStemmer.stem(taggedWord[0]);
      var translation = '';
  
      var wt = {
          word: taggedWord[0],
          tag: taggedWord[1],
          stem: stem,
          syllableCount: syllableCount,
          isPunctuation: punctuation.indexOf(taggedWord[0]) > -1,
          isNumber: !isNaN(taggedWord[0]),
          translation: ''
      };
      wt.key = key;
  
      //if(sourceLanguage !== lslLanguage && !wt.isPunctuation && isTranslatable(sourceLanguage, targetLanguage)) {
      if(!wt.isPunctuation && isTranslatable(sourceLanguage, targetLanguage)) {
  
        if(!glossary.tokens.find(element => element.word.toLowerCase() === wt.word.toLowerCase())) {
          translation = await translateText(wt.word.toLowerCase(), sourceLanguage, targetLanguage, apiEndpoint);
          if(translation !== undefined && translation !== '') {
            wt.translation = translation;
            console.log(`'${wt.word}' => '${wt.translation}'`)
            glossary.tokens.push(wt);
          }
        }
  
      }
  
      if(!allTags.includes(wt.tag)) allTags.push(wt.tag);
  
      oringinalSeqence.push(wt);
  
      
      if(wt.isPunctuation) { if(!punctuations.find(element => element.key === key)) punctuations.push(wt); }
      else if(wt.tag.substr(0, 1) === 'V') {
        if(!verbs.find(element => element.key === key)) {
          verbs.push(wt);
        }
      }
      else if(wt.tag.substr(0, 1) === 'N') { if(!nouns.find(element => element.key === key)) nouns.push(wt); }
      else if(wt.tag === 'DT') { if(!determiners.find(element => element.key === key)) determiners.push(wt); }
      else if(wt.tag === 'IN') { if(!prepositions.find(element => element.key === key)) prepositions.push(wt); }    
      else if(!others.find(element => element.key === key)) others.push(wt);
    } 
  
  } else {

    var words = new pos.Lexer().lex(withoutHtml);
    for (var i = 0; i < words.length; i++ ) {
      var taggedWord = [ words[i], '' ];
      var syllableCount = 0;

      var key = taggedWord[0].toLowerCase() + "~|~" + taggedWord[1].toLowerCase();
      var stem = '';
      var translation = '';

      var wt = {
          word: taggedWord[0],
          tag: taggedWord[1],
          stem: stem,
          syllableCount: syllableCount,
          isPunctuation: punctuation.indexOf(taggedWord[0]) > -1,
          isNumber: !isNaN(taggedWord[0]),        
          translation: ''
      };
      wt.key = key;

      //if(sourceLanguage !== lslLanguage && !wt.isPunctuation && isTranslatable(sourceLanguage, targetLanguage)) {
      if(!wt.isPunctuation && isTranslatable(sourceLanguage, targetLanguage)) {

        if(!glossary.tokens.find(element => element.word.toLowerCase() === wt.word.toLowerCase())) {
          translation = await translateText(wt.word.toLowerCase(), sourceLanguage, targetLanguage, apiEndpoint);
          if(translation !== undefined && translation !== '') {
            wt.translation = translation;
            console.log(`'${wt.word}' => '${wt.translation}'`)
            glossary.tokens.push(wt);
          }
        }

      }

      if(!allTags.includes(wt.tag)) allTags.push(wt.tag);

      oringinalSeqence.push(wt);

      
      if(wt.isPunctuation) { if(!punctuations.find(element => element.key === key)) punctuations.push(wt); }
      else if(wt.tag.substr(0, 1) === 'V') {
        if(!verbs.find(element => element.key === key)) {
          verbs.push(wt);
        }
      }
      else if(wt.tag.substr(0, 1) === 'N') { if(!nouns.find(element => element.key === key)) nouns.push(wt); }
      else if(wt.tag === 'DT') { if(!determiners.find(element => element.key === key)) determiners.push(wt); }
      else if(wt.tag === 'IN') { if(!prepositions.find(element => element.key === key)) prepositions.push(wt); }    
      else if(!others.find(element => element.key === key)) others.push(wt);
    } 
  }

  var allWords = {
      oringinalSeqence: oringinalSeqence,
      verbs: verbs.sort((a, b) => a.word.localeCompare(b.word)),
      nouns: nouns.sort((a, b) => a.word.localeCompare(b.word)),
      determiners: determiners.sort((a, b) => a.word.localeCompare(b.word)),
      prepositions: prepositions.sort((a, b) => a.word.localeCompare(b.word)),
      others: others.sort((a, b) => a.word.localeCompare(b.word)),
      punctuations: punctuations
  };

  return allWords;

}

async function getLanguages(folder) {

  if(!folder.toString().endsWith('/')) {
    folder += '/';
  }

  var langaugeFolders = [];
  const files = fs.readdirSync(folder, { withFileTypes: true });
  files.forEach(file => {
    var langaugeFolder = {
      language_id: `adventech/${file.name}`,
      isDirectory: file.isDirectory(),
      relativePath: `${file.name}`,
      language_info: file.isDirectory() ? getObjectFromYAML(`${folder}${file.name}/info.yml`) : null,
    }

    langaugeFolders.push(langaugeFolder);
  });

  return langaugeFolders;
}

(async () => {
  var basePath = '/Users/josephfrance/github/Adventech/sabbath-school-lessons/src';

  if(!basePath.toString().endsWith('/')) {
    basePath += '/';
  }

  var langaugeFolders = await getLanguages(basePath);
  for(var lx = 0; lx < langaugeFolders.length; lx++) {
    langaugeFolders[lx].books = await getBooks(basePath, `${langaugeFolders[lx].relativePath}`);
  }
  //var count = langaugeFolders.length;
  langaugeFolders.forEach(langaugeFolder => {
    //console.log(langaugeFolder.language_info.name, langaugeFolder.books.length);
  });

  var json = JSON.stringify(langaugeFolders, null, 2);
  fs.writeFileSync('./p9n-language-index-adventech.json', json);
})();

async function getBooks(basePath, bookFolder) {

  if(!bookFolder.toString().endsWith('/')) {
    bookFolder += '/';
  }

  var books = [];
  const files = fs.readdirSync(`${basePath}${bookFolder}`, { withFileTypes: true });
  files.forEach(file => {
    if(file.isDirectory()) {      
      var book = {
        book_id: `adventech/${bookFolder}${file.name}`,
        isDirectory: file.isDirectory(),
        relativePath: `${bookFolder}${file.name}`,
        book_info: getObjectFromYAML(`${basePath}${bookFolder}${file.name}/info.yml`),
        book_cover: {
          name: 'cover.png',
          fileSize: fs.statSync(`${basePath}${bookFolder}${file.name}/cover.png`).size,
          //base64: fs.readFileSync(`${basePath}${bookFolder}${file.name}/cover.png`, {encoding: 'base64'})
        }
      }
  
      books.push(book);  
    }
  });

  return books;
}


var lslChapter = {
  language: lslLanguage,
  folder: lslFolder,
  chapter_info: getObjectFromYAML(`${lslFolder}/info.yml`),
  pages: await getPages(lslFolder)
};

var rslChapter = {
  language: rslLanguage,
  folder: rslFolder,
  chapter_info: getObjectFromYAML(`${rslFolder}/info.yml`),
  pages: await getPages(rslFolder)
};
//console.log(lslChapter)
//console.log(rslChapter)

//var lslChapterFilePath = `${lslFolder}/p9n-chapter.html`;
//var rslChapterFilePath = `${rslFolder}/p9n-chapter.html`;
var chapterPath = `./p9n-${lslLanguage}-${rslLanguage}-${chapterFolder}-${chapterNumber}/`;
if(!fs.existsSync(chapterPath)) {
  fs.mkdirSync(chapterPath);
}


for(var pgx=0; pgx < lslChapter.pages.length; pgx++) {

  lslPos.tokens = [];
  rslPos.tokens = [];

  if(lslChapter.pages[pgx].page_title.indexOf('.yml') < 0) {
    var html = '';

    const lslPages = lslChapter.pages[pgx];
    const rslPages = rslChapter.pages[pgx];
    if(lslPages === undefined || rslPages === undefined) {
      continue;
    }
  
    var htmlFilePath = `${chapterPath}${lslPages.page_title.replace('.md', '')}.html`;
    
    var lslParagraphs = [];
    var rslParagraphs = [];
    var maxLength = Math.max(lslPages.paragraphs.length, rslPages.paragraphs.length);
    for(var parx = 0; parx < maxLength; parx++) {
      var lslHtml = '';
      var rslHtml = '';
      var lslParagraph = lslPages.paragraphs.length < parx ? {} : lslPages.paragraphs[parx];
      var rslParagraph = rslPages.paragraphs.length < parx ? {} : rslPages.paragraphs[parx];
  
      if(
          lslParagraph
          &&
          (
          lslParagraph.paragraph_type === 'header:title'
          || lslParagraph.paragraph_type === 'header:date'
          || lslParagraph.paragraph_type === 'body'
          )
        ) {
          lslHtml += lslParagraph.paragraph_html;
      }
  
      if(
        rslParagraph
        &&
        (
          rslParagraph.paragraph_type === 'header:title'
          || rslParagraph.paragraph_type === 'header:date'
          || rslParagraph.paragraph_type === 'body'
        )
        ) {
          rslHtml += rslParagraph.paragraph_html;
      }
  
      if(lslHtml != '') {
        lslParagraphs.push(lslHtml);
      }

      if(rslHtml !== '') {
        rslParagraphs.push(rslHtml);
      }
    }
    var parallelGraph = [];
    maxLength = Math.max(lslParagraphs.length, rslParagraphs.length);
    for(var parx = 0; parx < maxLength; parx++) {
      
      if(lslParagraphs[parx] !== '' || rslParagraphs[parx] !== '') {

        var lpos = [];
        var rpos = [];

        if(lslParagraphs[parx] !== undefined) {
          lpos = await getPartsOfSpeech(lslParagraphs[parx], lslLanguage, rslLanguage, apiEndpoint, lslGlossary);
          for(var ox=0; ox < lpos.oringinalSeqence.length; ox++) {
            if(
              !lpos.oringinalSeqence[ox].isPunctuation
              && !lpos.oringinalSeqence[ox].isNumber
              && !lslPos.tokens.find(element => element.word.toLowerCase() === lpos.oringinalSeqence[ox].word.toLowerCase())) lslPos.tokens.push(lpos.oringinalSeqence[ox]);
          }
        }

        if(rslParagraphs[parx] !== undefined) {
          rpos = await getPartsOfSpeech(rslParagraphs[parx], rslLanguage, lslLanguage, apiEndpoint, rslGlossary);
          for(var ox=0; ox < rpos.oringinalSeqence.length; ox++) {
            if(
              !rpos.oringinalSeqence[ox].isPunctuation
              && !rpos.oringinalSeqence[ox].isNumber
              && !rslPos.tokens.find(element => element.word.toLowerCase() === rpos.oringinalSeqence[ox].word.toLowerCase())) rslPos.tokens.push(rpos.oringinalSeqence[ox]);
          }
        }

        var lslParagraph = lslParagraphs[parx] === undefined ? '' : lslParagraphs[parx];
        var rslParagraph = rslParagraphs[parx] === undefined ? '' : rslParagraphs[parx];

        //if(rslLanguage === 'en') {
          rslParagraph = getHtmlParagraphFromPos(rpos);
        //} else {
          lslParagraph = getHtmlParagraphFromPos(lpos);
        //}

        parallelGraph.push({
          lslHtml: lslParagraph,
          rslHtml: rslParagraph
        });
      }
    }

    //console.log(parallelGraph);

    html += `
    <html>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
    <script>
    function unhighlight(x, word) {
      x.style.color = "navy"
      x.style.backgroundColor = "transparent"
      console.log(word)
    }
    
    function highlight(x, word) {
      x.style.color = "yellow"
      x.style.backgroundColor = "green"
    }
    </script>
    <style>
    
    .tooltip {
      position: relative;
      display: inline-block;
      border-bottom: 1px dotted black;
      cursor: hand;
    }
    
    .tooltip .tooltiptext {
      visibility: hidden;
      width: 120px;
      background-color: #555;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px 0;
      position: absolute;
      z-index: 1;
      bottom: 125%;
      left: 50%;
      margin-left: -60px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .tooltip .tooltiptext::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: #555 transparent transparent transparent;
    }
    
    .tooltip:hover .tooltiptext {
      visibility: visible;
      opacity: 1;
    }    

    .fulljustify {
      text-align: justify;
    }
    .fulljustify:after {
      content: "";
      display: inline-block;
      width: 100%;
    }
    </style>
      <body>
        <table width="100%" border="1" cellpadding="2" cellspacing="2">
    `;
  
    for(var parx = 0; parx < parallelGraph.length; parx++) {
      html += `
      <tr>
        <td width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">
        <div dir="${lslLangDir}">
        ${parallelGraph[parx].lslHtml.replace('\n', '').replace('&lt;p&gt;', '<b>').replace('&lt;/p&gt;', '</b>')}
        </div>
        </td>
        <td width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">
        <div dir="${rslLangDir}">
        ${parallelGraph[parx].rslHtml.replace('\n', '').replace('&lt;p&gt;', '<b>').replace('&lt;/p&gt;', '</b>')}
        </div>
        </td>
      </tr>
  `;
}

if(
  (lslPos.tokens.length > 0)
  ||
  (rslPos.tokens.length > 0)
  )
{
var pageGlossaryHtml = `
<tr>
  <td width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">
  <div dir="${lslLangDir}">
  ${lslPos.tokens.length > 0 ? '<u>Glossary:</u><br /><span>' + lslPos.tokens.sort((a, b) => a.word.localeCompare(b.word)).map(wt => wt.word + ': <b><i>' + wt.translation + '</i></b>').join('</span>, <span>') : ''}
  </div>
  </td>
  <td width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">
  <div dir="${rslLangDir}">
  ${rslPos.tokens.length > 0 ? '<u>Glossary:</u><br /><span>' + rslPos.tokens.sort((a, b) => a.word.localeCompare(b.word)).map(wt => wt.word + ': <b><i>' + wt.translation + '</i></b>').join('</span>, <span>') : ''}
  </div>
  </td>
</tr>
`;
}

  html += pageGlossaryHtml;

  html += `

  <tr>
  <td width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">
    NOTES: <a target="_blank" href="">${lslLanguage}</a>
    <div style="height: 10px;"><hr/></div>
    <div style="height: 10px;"><hr/></div>
    <div style="height: 10px;"><hr/></div>
  </td>
  <td width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">
    NOTES: <a target="_blank" href="">${rslLanguage}</a>
    <div style="height: 10px;"><hr/></div>
    <div style="height: 10px;"><hr/></div>
    <div style="height: 10px;"><hr/></div>
  </td>
</tr>

    </table>
  </body>
  </html>
  `;
  
  console.log(htmlFilePath);
  fs.writeFileSync(htmlFilePath, html);
  
  }

}


// async function main() {

//   var lslPages = await getPages(lslFolder);
//   var rslPages = await getPages(rslFolder);
  
//   console.log(lslPages);
//   console.log(rslPages);
  
// }

function getObjectFromYAML(yamlPath) {
  var yamlString = fs.readFileSync(yamlPath, 'utf8');
  // parse YAML string
  return YAML.parse(yamlString);
}

async function getPages(folder) {
  var pages = [];

  const files = fs.readdirSync(folder);

  files.forEach(file => {
  
    var fullFilePath = `${folder}/${file}`;

    var page = {
      page_id: `adventech/${file}`,
      page_title: file,
      page_path: fullFilePath,
      paragraphs: getParagraphs(fullFilePath, this)
    };
    
    pages.push(page);
  });

  //console.log(pages);
  return pages;

  
}

function getParagraphs(fullFilePath, page) {
    var fileContents = fs.readFileSync(fullFilePath).toString();
    var paragraphSplits = fileContents.split(/\r?\n/);
    var paragraphs = [];

    var px = 1;
    var hr_count = 0;
    paragraphSplits.forEach(content => {        
        var paragraph_type;

        if(hr_count < 2){
          paragraph_type = 'header';
        } else if(hr_count < 3) {
          paragraph_type = 'body';
        } else {
          paragraph_type = 'further-reading';
        }

        if(content.indexOf('title:') === 0) {
          paragraph_type += ':title';
          content = content.replace('title:', '').trim();
        } else if(content.indexOf('date:') === 0) {
          paragraph_type += ':date';
          content = content.replace('date:', '').trim();
        } else if(content === '---') {
          hr_count++;
          paragraph_type += ':hr';
          content = content.replace('---', '').trim();
        }

        var paragraph = {
            paragraph_id: `adventech/${(px++)}`,
            paragraph_content: content,
            paragraph_html: md.render(content),
            paragraph_type: paragraph_type,
            paragraph_format: 'markdown',
            page: page
          };     
          paragraphs.push(paragraph);
    });

    return paragraphs;
}


function isTranslatable(sourceLanguage, targetLanguage) {
  var translatableLangs = [
    'ar',
    'de',
    'en',
    'es',
    'fr',
    'it',
    'pt',
    'ru',
    'zh',
    'ja',
    'hi',
    'ga',
    'pl',
    'ko',
    'tr'
  ];

  if(
    !translatableLangs.includes(sourceLanguage)
    || !translatableLangs.includes(targetLanguage)
  ) return false;

  return true;
}

// await main();