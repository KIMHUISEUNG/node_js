var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
const sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  port     : 3307,
  password : '111111',
  database : 'opentutorials'
});

db.connect();

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
      if (queryData.id === undefined) {
        db.query(`SELECT * FROM topic`, function(error, topics) {
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.List(topics);
          var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      } else {
        /*
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
        */
        db.query(`SELECT * FROM topic`, function(error, topics) {
          if(error){throw error;}
          db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
            if(error2){throw error2;}
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.List(topics);
            var html = template.HTML(title, list,
                `<h2>${title}</h2>${description}`,
                `<a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post" onsubmit="return confirm('삭제하시겠습니까?');">
                   <input type="hidden" name="id" value="${queryData.id}">
                   <input type="submit" value="delete">
                </form>`
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
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title; //post로 받은 data에 접근하여 값을 받아옴.
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                response.writeHead(302, {Location: `/?id=${title}`}); //파일 위치변경 302는 지금 이순간에만 바뀐다는걸 알려줌.
                response.end();
            });
        });
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
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title; //post로 받은 data에 접근하여 값을 받아옴.
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(error){
              fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                  response.writeHead(302, {Location: `/?id=${title}`}); //파일 위치변경 302는 지금 이순간에만 바뀐다는걸 알려줌.
                  response.end();
              });
            })
        });
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
app.listen(8080); //port 번호 3000을 listen함.
