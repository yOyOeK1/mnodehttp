#!/usr/bin/env node

function cl(str){
  console.log(str);
}
cl("hello");

cl(`dirname:`+__dirname);
cl(`file: `+__filename);
const path = require('node:path');

const filePath = path.join(__dirname, 'mySubdirectory', 'myFile.txt');
console.log(filePath); // Example: /path/to/script/mySubdirectory/myFile.txt

cl( __dirname+'/node_modules/node-yss/yss' );