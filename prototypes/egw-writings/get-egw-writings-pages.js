import fs from 'fs';
import cheerio from 'cheerio';
import axios from 'axios';

var source_id = 'egwwritings';
var baseUrl = "https://m.egwwritings.org";
//var pageRef = '/en/book/108.21';
var pageRef = '/languages';

(async () => {
  
    var langaugeFolders = await getLanguages(baseUrl);
    for(var lx = 0; lx < langaugeFolders.length; lx++) {
      langaugeFolders[lx].books = [];//await getBooks(basePath, `${langaugeFolders[lx].relativePath}`);
    }
    //var count = langaugeFolders.length;
    langaugeFolders.forEach(langaugeFolder => {
      console.log(langaugeFolder.language_info.name, langaugeFolder.books.length);
    });
  
    var json = JSON.stringify(langaugeFolders, null, 2);
    fs.writeFileSync(`./p9n-language-index-${source_id}.json`, json);
  })();

  async function getHtml(url) {
    const response = await axios.get(`${baseUrl}${pageRef}`);

    const results = {
        url: url,
        htmlSource: response.data,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
    };
    
    //console.log(results);    

    return results;
}

async function getLanguages(baseUrl) {
    var indexUrl = `${baseUrl}/languages`;
    var languageResponse = await getHtml(indexUrl);


    const $ = cheerio.load(languageResponse.htmlSource);
    //var a = $('a[class="language noajax "]');
    var a = $('ul[class="languages-list clearfix"]').find('li > a');

    // var list = [];
    // $('ul[class="languages-list clearfix"]').find('li > a').each(function (index, element) {
    //     list.push($(element).attr('href'));
    // });

    var langaugeFolders = [];
    // en class = 'language noajax highlighted'
    // langaugeFolders.push({
    //     language_id: `${source_id}/en`,
    //     isDirectory: true,
    //     relativePath: `en`,
    //     href: "/en",
    //     url: "https://m.egwwritings.org/en",
    //     language_info: {
    //         code: "en",
    //         name: "English"
    //     }
    // });

    for (let index = 0; index < a.length; index++) {
        const element = a[index];

        const lang = element.attribs['href'];

        //console.log(element);
        var langaugeFolder = {
            language_id: `egwwritings${lang}`,
            isDirectory: true,
            relativePath: `${lang.replace('/', '')}`,
            href: `${lang}`,
            url: `${baseUrl}${lang}`,
            language_info: {
                name: element.firstChild.data,
                code: lang
            }
        };

        langaugeFolders.push(langaugeFolder);
    }
    
    return langaugeFolders;    
}

async function getFolders(baseUrl, folder) {
    var a = $('div[class="thumbnail transition"]').find('a');

    for (let index = 0; index < a.length; index++) {
        const element = a[index];

        const folder = element.attribs['href'];

        //console.log(element);
        var langaugeFolder = {
            language_id: `egwwritings${lang}`,
            isDirectory: true,
            relativePath: `${lang.replace('/', '')}`,
            href: `${lang}`,
            url: `${baseUrl}${lang}`,
            language_info: {
                name: element.firstChild.data,
                code: lang
            }
        };

        langaugeFolders.push(langaugeFolder);
    }


}

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