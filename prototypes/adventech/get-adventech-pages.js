import fs from 'fs';
import { readdir } from 'fs/promises';
import YAML from 'yamljs';
import MarkdownIt from 'markdown-it';

var md = new MarkdownIt();


const lslLanguage = 'en';
const rslLanguage = 'ru';

const lslFolder = `/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/${lslLanguage}/2021-01/13`;
const rslFolder = `/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/${rslLanguage}/2021-01/13`;

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
  const files = await readdir(folder, { withFileTypes: true });
  files.forEach(file => {
    var langaugeFolder = {
      name: file.name,
      isDirectory: file.isDirectory(),
      fullPath: `${folder}${file.name}`,
      language_info: file.isDirectory() ? getObjectFromYAML(`${folder}${file.name}/info.yml`) : null,
    }

    langaugeFolders.push(langaugeFolder);
  });

  return langaugeFolders;
}

(async () => {
  var langaugeFolders = await getLanguages('/Users/josephfrance/github/Adventech/sabbath-school-lessons/src');
  for(var lx = 0; lx < langaugeFolders.length; lx++) {
    langaugeFolders[lx].books = await getBooks(langaugeFolders[lx].fullPath);
  }
  //var count = langaugeFolders.length;
  langaugeFolders.forEach(langaugeFolder => {
    console.log(langaugeFolder.language_info.name, langaugeFolder.books.length);
  });
})();

async function getBooks(bookFolder) {

  if(!bookFolder.toString().endsWith('/')) {
    bookFolder += '/';
  }

  var books = [];
  const files = await readdir(bookFolder, { withFileTypes: true });
  files.forEach(file => {
    if(file.isDirectory()) {      
      var book = {
        name: file.name,
        isDirectory: file.isDirectory(),
        fullPath: `${bookFolder}${file.name}`,
        book_info: getObjectFromYAML(`${bookFolder}${file.name}/info.yml`),
        book_cover: {
          name: 'cover.png',
          fileSize: fs.statSync(`${bookFolder}${file.name}/cover.png`).size,
          base64: fs.readFileSync(`${bookFolder}${file.name}/cover.png`, {encoding: 'base64'})
        }
      }
  
      books.push(book);  
    }
  });

  return books;
}


// var lslChapter = {
//   language: lslLanguage,
//   folder: lslFolder,
//   chapter_info: getObjectFromYAML(`${lslFolder}/info.yml`),
//   pages: await getPages(lslFolder)
// };

// var rslChapter = {
//   language: rslLanguage,
//   folder: rslFolder,
//   chapter_info: getObjectFromYAML(`${rslFolder}/info.yml`),
//   pages: await getPages(rslFolder)
// };
// console.log(lslChapter)
// console.log(rslChapter)

// var parallelGraph = [];

// for(var pgx=0; pgx < lslPages.length; pgx++) {
//   var html = '';

//   var htmlFilePath = `${lslPages[pgx].page_id}`;

//   httml += `
//   <html>
//   <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
//   <style>
//   .fulljustify {
//     text-align: justify;
//   }
//   .fulljustify:after {
//     content: "";
//     display: inline-block;
//     width: 100%;
//   }
//   </style>
//     <body>
//       <table width="100%" border="1" cellpadding="0" cellspacing="0">
//         <tr>
//           <th width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: x-small; vertical-align: top;"><a target="_blank" href="">${lslLanguage}</a></th>
//           <th width="50%" style="font-family: Arial, Helvetica, sans-serif; font-size: x-small; vertical-align: top;"><a target="_blank" href="">${rslLanguage}</a></th>
//         </tr>
//   `;

// httml += `
//   </table>
// </body>
// </html>
// `;
// }


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

  const files = await readdir(folder);

  files.forEach(file => {
  
    var fullFilePath = `${folder}/${file}`;

    var page = {
      page_id: file,
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
            paragraph_id: (px++).toString(),
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