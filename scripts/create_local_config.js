var path = require('path');
var fs = require('fs');

function cp(from, to) {
  fs.writeFileSync(to, fs.readFileSync(from));
}

var CONFIG = path.join(__dirname, '..', 'server', 'config');
cp(path.join(CONFIG, 'local.json-dist'), path.join(CONFIG, 'local.json'));
