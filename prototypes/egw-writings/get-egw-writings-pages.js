import fs from 'fs';

var result = fs.readFileSync('./README.md');
console.log(result);
