import fs from 'fs';
import pos from 'pos';
import syllables from 'syllables';
import natural from 'natural';
import translate from "translate";

//import { readdir } from 'fs/promises';
import YAML from 'yamljs';
import MarkdownIt from 'markdown-it';

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
const chapterNumber = '04';
const lslFolder = `/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/${lslLanguage}/${chapterFolder}/${chapterNumber}`;
const rslFolder = `/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/${rslLanguage}/${chapterFolder}/${chapterNumber}`;
var nonPosLang = rslLanguage === 'en' ? lslLanguage : rslLanguage;
const apiEndpoint = "http://localhost:5000/translate"
var glossary = {
  nouns: [],
  verbs: []
};

var lslPos = {
  verbs: []
};

var rslPos = {
  verbs: []
};

// async function f() {
//   return Promise.resolve(1);
// }

// f().then(value => {
//   console.log(value)
// });

function getVerbTranslationFromGlossary(word, glossary) {
  var wt = glossary.verbs.find(entry => entry.word.toLowerCase() === word.toLowerCase());
  if(wt !== null) return wt.tx;

  return '';
}

async function translateText(sourceText, sourceLanguage, targetLanguage, apiEndpoint, glossary) {

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
  console.log(sourceText, result.translatedText)
  return result.translatedText;
}

async function getPartsOfSpeech(paragraph, nonPosLang, apiEndpoint, glossary) {
  var punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
  var withoutHtml = paragraph.replace(/(<([^>]+)>)/gi, "");
  
  var oringinalSeqence = [];
  var verbs = [];
  var nouns = [];
  var determiners = [];
  var prepositions = [];
  var others = [];
  var punctuations = [];
  var allTags = [];
  
  var words = new pos.Lexer().lex(withoutHtml);
  var tagger = new pos.Tagger();
  var taggedWords = tagger.tag(words);
  for (var i = 0; i < taggedWords.length; i++ ) {
    var taggedWord = taggedWords[i];
    var syls = syllables(taggedWord[0]);
    // try {
    //     syls = syllables(taggedWord[0])
    //   } catch (error) {
    //     //console.error(error);
    //     // expected output: ReferenceError: nonExistentFunction is not defined
    //     // Note - error messages will vary depending on browser
    //   }

    var key = taggedWord[0].toLowerCase() + "~|~" + taggedWord[1].toLowerCase();
    var stem = natural.PorterStemmer.stem(taggedWord[0]);
    var wt = {
        word: taggedWord[0],
        tag: taggedWord[1],
        stem: stem,
        syllables: syls,
        isPunctuation: punctuation.indexOf(taggedWord[0]) > -1,
        translation: ''
    };
    wt.key = key;


    if(!allTags.includes(wt.tag)) allTags.push(wt.tag);

    oringinalSeqence.push(wt);

    //console.log(wt);
    
    if(wt.isPunctuation) { if(!punctuations.find(element => element.key === key)) punctuations.push(wt); }
    else if(wt.tag.substr(0, 1) === 'V') {
      if(!glossary.verbs.find(element => element.word.toLowerCase() === wt.word.toLowerCase())) {
        wt.tx = await translateText(wt.word.toLowerCase(), 'en', nonPosLang, apiEndpoint);
        if(wt.tx !== undefined) {
          glossary.verbs.push(wt);
        }
      }
      if(!verbs.find(element => element.key === key)) {
        verbs.push(wt);
      }
    }
    else if(wt.tag.substr(0, 1) === 'N') { if(!nouns.find(element => element.key === key)) nouns.push(wt); }
    else if(wt.tag === 'DT') { if(!determiners.find(element => element.key === key)) determiners.push(wt); }
    else if(wt.tag === 'IN') { if(!prepositions.find(element => element.key === key)) prepositions.push(wt); }    
    else if(!others.find(element => element.key === key)) others.push(wt);
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
//fs.mkdirSync(chapterPath);


for(var pgx=0; pgx < lslChapter.pages.length; pgx++) {

  lslPos.verbs = [];
  rslPos.verbs = [];

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

        if(lslParagraphs[parx] !== undefined && lslLanguage === 'en') {
          var lpos = await getPartsOfSpeech(lslParagraphs[parx], nonPosLang, apiEndpoint, glossary);
          for(var vx=0; vx < lpos.verbs.length; vx++) {
            if(!lslPos.verbs.find(element => element.key === lpos.verbs[vx].key)) lslPos.verbs.push(lpos.verbs[vx]);
          }
        }

        if(rslParagraphs[parx] !== undefined && rslLanguage === 'en') {
          var rpos = await getPartsOfSpeech(rslParagraphs[parx], nonPosLang, apiEndpoint, glossary);
          for(var vx=0; vx < rpos.verbs.length; vx++) {
            if(!rslPos.verbs.find(element => element.key === rpos.verbs[vx].key)) rslPos.verbs.push(rpos.verbs[vx]);
          }
        }

        parallelGraph.push({
          lslHtml: lslParagraphs[parx] === undefined ? '' : lslParagraphs[parx],
          rslHtml: rslParagraphs[parx] === undefined ? '' : rslParagraphs[parx]
        }
        );
      }
    }

    //console.log(parallelGraph);

    html += `
    <html>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
    <script>
    function unhighlight(x) {
      x.style.color = "navy"
      x.style.backgroundColor = "transparent"
    }
    
    function highlight(x) {
      x.style.color = "yellow"
      x.style.backgroundColor = "green"
    }
    </script>
    <style>
    
    span {
      color: navy;
      display: inline;
      cursor: hand;
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
  (lslPos.verbs.length > 0)
  ||
  (rslPos.verbs.length > 0)
  )
{
html += `
<tr>
  <td colspan="2" width="100%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">
  <div dir="${lslLangDir}">
  ${lslPos.verbs.length > 0 ? '<u>Verbs:</u><br /><span onmouseover="highlight(this);" onmouseout="unhighlight(this)">' + lslPos.verbs.sort((a, b) => a.word.localeCompare(b.word)).map(wt => wt.word + ': <b><i>' + getVerbTranslationFromGlossary(wt.word, glossary) + '</i></b>').join('</span>, <span onmouseover="highlight(this);" onmouseout="unhighlight(this)">') : ''}
  ${rslPos.verbs.length > 0 ? '<u>Verbs:</u><br /><span onmouseover="highlight(this);" onmouseout="unhighlight(this)">' + rslPos.verbs.sort((a, b) => a.word.localeCompare(b.word)).map(wt => wt.word + ': <b><i>' + getVerbTranslationFromGlossary(wt.word, glossary) + '</i></b>').join('</span>, <span onmouseover="highlight(this);" onmouseout="unhighlight(this)">') : ''}
  </div>
  </td>
</tr>
`;
}
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

// await main();