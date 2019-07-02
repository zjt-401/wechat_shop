function json2Form(json) {
  
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  console.log(str.join("&"))
  return str.join("&");
  
}
export { json2Form }