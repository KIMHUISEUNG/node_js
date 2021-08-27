
var db = require('./db');
const template = require('./template.js');
exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics) { //리스트 표출
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
}
