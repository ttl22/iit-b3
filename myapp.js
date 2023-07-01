const http = require('http');
const url = require('url');
const port = 5000;

const hostname = '127.0.0.1';

const server = http.createServer((req, res) => {
  const queryObject = url.parse(req.url,true).query;
  let result = parseInt(queryObject.a) + parseInt(queryObject.b);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Result: ${result}\n`);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log('ID123 Hello Name');
});
