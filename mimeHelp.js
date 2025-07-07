
function getMimeFromExt(fname){
  var ext = fname.split('.');
  ext = ext[ ext.length-1 ];
  //application/octet-stream
  if( ext == "js" || ext == "map" || ext == "vue" )
      mimeStr = "text/javascript";
  else if( ext == "mjs" )
      mimeStr = "text/javascript";
  else if( ext == "png" )
      mimeStr = "image/png";
  else if( ext == "hdr" )
      mimeStr = "application/octet-stream";
  else if( ext == "ico" )
      mimeStr = "image/png";
  else if( ext == "base64" )
      mimeStr = "image/jpeg";
  else if( ext == "svg" )
      mimeStr = "image/svg+xml";
  else if( ext == "css" )
      mimeStr = "text/css";
  else if( ext == "glb" )
      mimeStr = "application/octet-stream";
  else if( ext == "html" )
      mimeStr = "text/html";
  else{
      mimeStr = "text/html";
  }
  return mimeStr;
}

module.exports = { getMimeFromExt };