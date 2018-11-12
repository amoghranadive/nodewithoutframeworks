/*
 * Primary file for the API 
 */

// Dependencies
const http = require('http');

var server = http.createServer(function(req, res){
     res.end("Hello World \n");
})

// start the server
server.listen(3000, function() {
    console.log("Server is now up and running on port 3000");
})