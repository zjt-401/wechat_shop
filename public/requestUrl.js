import clientInterface from "/clientInterface.js";

function jsonToStr (json) {

  var returnParam = ""
  var str = ["jsonOnly=1"];
  for (var p in json) {
    str.push((p) + "=" + (json[p]));
  }
  returnParam += str.join("&")
  return returnParam
}

function dellUrl(url, params, method, random, loginToken){
  var post = {
    url: "",
    method: "", 
    params: {}
  }
  if (!params) {
    params = {}
  }
  if (!loginToken){
    loginToken = ''
  } 

  params.loginToken = loginToken
  if (!random || method == 'post'){
    params.__ajax_random__ = Math.random();
  }
  
  params.mini = 1
  params.mini = 1
  if(!method){
    method = "get"
  }
  if(method == "all"){
    method = post;
  }
  
  console.log(params)
  if (url.substring(0, 6) == "Client") {
    post.url =  clientInterface[url].url;
  } else {
    post.url =  url
  }
  if (!method || method == 'get') {
    
    post.params = '?' + jsonToStr(params) +"&apiversion=2"
    post.url = post.url + post.params
  } else {
    post.params = params
    post.params.apiversion = 2
    post.params.jsonOnly = 1
  }
  post.method = method;
  
  console.log(post)
  return post;
}



export { dellUrl }