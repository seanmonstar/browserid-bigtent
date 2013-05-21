var path = require('path');
var child_process = require('child_process');
function node(script) {
  var cp = child_process.spawn('node', [path.join(__dirname, script)]);
  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);
}

node('./create_local_config.js');
node('./generate_keys.js');
