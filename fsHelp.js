
const fs = require('fs');

function cl(str){
    console.log(str);
}

function dirList( path ){
    let tr = [];
    files = fs.readdirSync( path );
    return files;
}

function fileRead( path ){
    try{
        fc = fs.readFileSync(path);
        return fc.slice(0,fc.length);
    }catch(e){
        cl("[e] Reading file error no file: "+e);
    }
    return undefined;
}

function fileToJson( path ){
    try{
        tr = JSON.parse( fs.readFileSync( path ).toString() );
        //cl(`so for ${path}`);cl(tr);
        return tr;
    }catch(e){

    }
    return undefined;
}

module.exports = { dirList, fileToJson,fileRead };