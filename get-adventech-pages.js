const testFolder = '/Users/josephfrance/github/Adventech/sabbath-school-lessons/src/en/2021-01/13';
import fs from 'fs';

var pages = [];

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {

    var fullFilePath = `${testFolder}/${file}`;

    var page = {
      page_id: file,
      page_title: file,
      page_path: fullFilePath,
      paragraphs: getParagraphs(fullFilePath, this)
    };
    
    pages.push(page);
  });

  console.log(pages);

});


function getParagraphs(fullFilePath, page) {
    var fileContents = fs.readFileSync(fullFilePath).toString();
    var paragraphSplits = fileContents.split(/\r?\n/);
    var paragraphs = [];

    var px = 1;
    paragraphSplits.forEach(content => {        
        var paragraph = {
            paragraph_id: px.toString(),
            paragraph_content: content,
            paragraph_format: 'markdown',
            page: page
          };     
          paragraphs.push(paragraph);
    });

    return paragraphs;
}