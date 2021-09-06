const express = require('express')
const app = express()
const port = 3000
var fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
/*
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
*/
/*
app.get('/', function(request, response) {
    fs.readdir('./data', function(error, filelist) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.List(filelist);
        var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
        );
        response.send(html);
    });
});*/
app.get('/', function(req, res) {
  fs.readdir('./data', function(error, filelist) {
      var title = 'Welcome';
      var description = 'Hello, Node.js';
      var list = template.List(filelist);
      var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
      );
      response.send(html);
  });
});

app.get('/page/:pageId', function(request, response) {
    fs.readdir('./data', function(error, filelist) {
        var filteredId = path.parse(request.params.pageId).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags:['h1']
            });
            var list = template.List(filelist);
            var html = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                ` <a href="/create">create</a>
                    <a href="/update/${sanitizedTitle}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete">
                    </form>`
            );
            response.send(html);
        });
    });
});
app.get('/create', function(request, response) {
    fs.readdir('./data', function(error, filelist) {
        var title = 'WEB - create';
        var list = template.List(filelist);
        var html = template.HTML(title, list, `
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
        `, '');
        response.send(html);
    });
});
app.post('/create_process', function(request, response) {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
        });
    });
});

app.get('/update/:pageId', function(request, response) {
  fs.readdir('./data', function(error, filelist) {
    var fileteredId = path.parse(request.params.pageId).base;
      fs.readFile(`data/${fileteredId}`, 'utf8', function(err, description) {
          var title = request.params.pageId;
          var list = template.List(filelist);
          var html = template.HTML(title, list,
              `
              <form action="/update_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p>
                      <textarea name="description" placeholder="description">${description}</textarea>
                  </p>
                  <p>
                      <input type="submit">
                  </p>
              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.send(html);
      });
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

/*
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
const sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') { //홈
      if (queryData.id === undefined) {
        fs.readdir('./data', function(error, filelist){
          var title ='Welcome';
          var description = 'Hollw Node.js';
          var list = template.List(filelist);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      } else {
          fs.readdir('./data', function(error, filelist){
            var title ='Welcome';
            var description = 'Hollw Node.js';
            var list = template.List(filelist);
            var fileteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${fileteredId}`,'utf8', function(err,description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description);
            var html = template.HTML(title, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              `<a href="/create">create</a>
               <a href="/update?id=${sanitizedTitle}">update</a>
               <form action="delete_process" method="post" onsubmit="return confirm('삭제하시겠습니까?');">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
               </form>
               `
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){
        fs.readdir('./data', function(error, filelist){
          var title ='Web - create';
          var list = template.List(filelist);
          var html = template.HTML(title, list, `
                  <form action="/create_process" method="post">
                      <p><input type="text" name="title" placeholder="title"></p>
                      <p>
                          <textarea name="description" placeholder="description"></textarea>
                      </p>
                      <p>
                          <input type="submit">
                      </p>
                  </form>
              `,'');
          response.writeHead(200);
          response.end(html);
        });
    } else if(pathname === '/create_process') {
        topic.create_process(request, response);
    } else if(pathname === '/update') {
        fs.readdir('./data', function(error, filelist) {
          var fileteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${fileteredId}`, 'utf8', function(err, description) {
                var title = queryData.id;
                var list = template.List(filelist);
                var html = template.HTML(title, list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process'){
        topic.update_process(request, response);
    } else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var fileteredId = path.parse(id).base;
            fs.unlink(`data/${fileteredId}`, function(error){
              response.writeHead(302, {Location: `/`});
              response.end();
            })
        });
    } else {
      response.writeHead(404);
      response.end('Not Found');
    }
});
app.listen(8080); //port 번호 8080을 listen함.
*/
