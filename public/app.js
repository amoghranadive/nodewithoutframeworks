/**
 * Frontend logic for the application
 */

 var app = {};

 app.config = {
    'sessionToken': false
 };

 app.client = {};

 // AJAX client for the restful API
 app.client.request =  function(headers, path, method, queryStringObject, payload, callback) {

    header = typeof(headers) == 'object' && headers !== null ? headers: {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) != -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;

    // for each query string parameter sent, add it to the path
    var requestURL = path + '?';
    var counter = 0;

    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;
            if (counter > 1) {
                requestURL += '&';
            } 
            requestURL += queryKey + '=' + queryStringObject[queryKey];
        }
    }

    // form the http request as a JSON type
    var xhr = new XMLHttpRequest();
    xhr.open(method, requestURL, true);
    xhr.setRequestHeader("Content-type", "application/json");

    // for each header sent, add it to the request
    for (let headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    // if there is current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.sessionToken.id);
    }

    // when the request comes back, handle the response
    xhr.onreadystatechange = function() {

        if (xhr.readyState == XMLHttpRequest.DONE) {

            var statusCode = xhr.status;
            var responseReturned = xhr.responseText;

            // callback, if required
            if (callback) {
                
                try {
                    var parsedResponse = JSON.parse(responseReturned);                   
                    callback(statusCode, parsedResponse);

                } catch(err) {
                    callback(statusCode, false);
                }
            }
        }
    };

    //set the payload as JSON
    var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}

