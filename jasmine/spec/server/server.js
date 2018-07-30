/*
Copyright 2018 SOL Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

(function () {
    const HTTP = require('http');
    const URL = require('url');
    const QS = require('querystring');

    const hostname = '127.0.0.1';
    const port = 3000;

    const server = HTTP.createServer((req, res) => {
            const buffers = [];
            req.on('data', function (buffer) {
                buffers.push(buffer);
            });
            req.on('end', function () {
                var response = [],
                logicalRequestsArray;
                if (buffers.length > 0) {
                    console.log(buffers);
                    logicalRequestsArray = JSON.parse(Buffer.concat(buffers));
                } else {
                    const reqUrl = URL.parse(req.url),
                    query = reqUrl.query,
                    qs = QS.parse(query),
                    logicalRequests = qs.encodedRequests;
                    logicalRequestsArray = JSON.parse(logicalRequests);
                }

                for (var i = 0; i < logicalRequestsArray.length; i++) {
                    var r = logicalRequestsArray[i];
                    r.success = true; // important!
                    response.push(r);
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Access-Control-Allow-Origin', '*');
                console.log(JSON.stringify(response));
                res.end(JSON.stringify(response));
            });
        });

    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
})();

(function () {
    const HTTP = require('http');
    const SOAP = require('soap');

    const hostname = '127.0.0.1';
    const port = 4000;

    var testService = {
        'SoapTestService': {
            'SoapTest': {
                'echo': function (args) {
                    args.message += ' Hello main!';
                    args.success = true;
                    return args;
                }
            }
        }
    };

    var wsdl = require('fs').readFileSync('SoapTest.wsdl', 'utf8');

    var server = HTTP.createServer(function (request, response) {
            response.end('404: Not Found: ' + request.url);
        });

    server.listen(port, hostname, function () {
        console.log('Server running at http://' + hostname + ':' + port + '/');
    });

    SOAP.listen(server, '/SoapTest', testService, wsdl);

})();
