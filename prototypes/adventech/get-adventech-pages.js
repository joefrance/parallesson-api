import fs from 'fs';
//import { readdir } from 'fs/promises';
import YAML from 'yamljs';
import MarkdownIt from 'markdown-it';

var md = new MarkdownIt();


const lslLanguage = 'ru';
const rslLanguage = 'en';
const chapterFolder = '2021-02';
const chapterNumber = '02';

const lslFolder = `/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/${lslLanguage}/${chapterFolder}/${chapterNumber}`;
const rslFolder = `/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/${rslLanguage}/${chapterFolder}/${chapterNumber}`;

// async function f() {
//   return Promise.resolve(1);
// }

// f().then(value => {
//   console.log(value)
// });

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
    console.log(langaugeFolder.language_info.name, langaugeFolder.books.length);
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
console.log(lslChapter)
console.log(rslChapter)

//var lslChapterFilePath = `${lslFolder}/p9n-chapter.html`;
//var rslChapterFilePath = `${rslFolder}/p9n-chapter.html`;
var chapterPath = `./p9n-${lslLanguage}-${rslLanguage}-${chapterFolder}-${chapterNumber}/`;
//fs.mkdirSync(chapterPath);


for(var pgx=0; pgx < lslChapter.pages.length; pgx++) {

  if(lslChapter.pages[pgx].page_title.indexOf('.yml') < 0) {
    var html = '';

    const lslPages = lslChapter.pages[pgx];
    const rslPages = rslChapter.pages[pgx];
  
    var htmlFilePath = `${chapterPath}${lslPages.page_title.replace('.md', '')}.html`;
    
    var parallelGraph = [];
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
  
      if(lslHtml != '' || rslHtml !== '') {
        parallelGraph.push({
          lslHtml: lslHtml,
          rslHtml: rslHtml
        }
        );
      }
    }
  
    html += `
    <html>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
    <style>
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
        <table width="100%" border="1" cellpadding="0" cellspacing="0">
          <tr>
            <th width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;"><a target="_blank" href="">${lslLanguage}</a></th>
            <th width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;"><a target="_blank" href="">${rslLanguage}</a></th>
          </tr>
    `;
  
    for(var parx = 0; parx < parallelGraph.length; parx++) {
      html += `
      <tr>
        <td width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">${parallelGraph[parx].lslHtml.replace('\n', '').replace('&lt;p&gt;', '<b>').replace('&lt;/p&gt;', '</b>')}</td>
        <td width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: 0.55em; vertical-align: top;">${parallelGraph[parx].rslHtml.replace('\n', '').replace('&lt;p&gt;', '<b>').replace('&lt;/p&gt;', '</b>')}</td>
      </tr>
  `;
    }
  
  
  
  html += `
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