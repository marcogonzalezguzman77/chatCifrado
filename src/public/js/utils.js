function makeAjaxCall(url, methodType){
  var promiseObj = new Promise(function(resolve, reject){
     var xhr = new XMLHttpRequest();
     xhr.open(methodType, url, true);
     xhr.send();
     xhr.onreadystatechange = function(){
     if (xhr.readyState === 4){
        if (xhr.status === 200){
           //console.log("xhr done successfully");
           var resp = xhr.responseText;
           var respJson = JSON.parse(resp);
           resolve(respJson);
        } else {
           reject(xhr.status);
           //console.log("xhr failed");
        }
     } else {
        //console.log("xhr processing going on");
     }
  }
  //console.log("request sent succesfully");
});
return promiseObj;
}

function errorHandler(statusCode){
  console.log("failed with status", status);
 }


// JavaScript Document
function createRequest() {
	//alert("ingreso creat request pagina inicio")
  try {
    request = new XMLHttpRequest();
  } catch (tryMS) {
    try {
      request = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (otherMS) {
      try {
        request = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (failed) {
        request = null;
      }
    }
  }
  return request;
}

function ajaxGet(url, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.send();
  req.onreadystatechange = function(){
    if (req.readyState === 4){
       if (req.status === 200){
          //console.log("req done successfully");
          var resp = req.responseText;
          //var respJson = JSON.parse(resp);
          callback(resp);
       } else {
          //console.log("req failed");
       }
    } else {
       //console.log("req processing going on");
    }
  }
  //console.log("request sent succesfully");
}