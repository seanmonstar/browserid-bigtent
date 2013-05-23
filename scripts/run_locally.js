const path = require('path');
const spawn = require('child_process').spawn;

const HOST = process.env.IP_ADDRESS || process.env.HOST || '127.0.0.1';
const CERTIFIER_PORT = 3040;
const PUB_KEY = path.join(__dirname, '..', 'var', 'key.publickey');

process.env.LOG_TO_CONSOLE = 1;

// use the "local" configuration
var configFiles = [];
if (process.env.CONFIG_FILES) {
  var configFiles = process.env.CONFIG_FILES.split(',');
}
configFiles.push(path.join(__dirname, '..', 'server', 'config', 'local.json'));
const CONFIG_FILES = configFiles.join(',');

const daemonsToRun = {
  bigtent: {
    path: path.join(__dirname, '..', 'server', 'bin', 'bigtent'),
    IP_ADDRESS: HOST,
    PORT: 3030,
    CERTIFIER_PORT: CERTIFIER_PORT,
    PUB_KEY_PATH: PUB_KEY,
    CONFIG_FILES: CONFIG_FILES
  }
};

const daemons = {};

function runDaemon(daemon, cb) {
  var env = Object.create(process.env);
  Object.keys(daemonsToRun[daemon]).forEach(function(ek) {
    if (ek === 'path') return; // this blows away the Window PATH
    env[ek] = daemonsToRun[daemon][ek];
  });

  var pathToScript = daemonsToRun[daemon].path || path.join(__dirname, "..", "bin", daemon);
  var args = [ pathToScript ];

  var p = spawn('node', args, { env: env });

  function dump(d) {
    d.toString().split('\n').forEach(function(d) {
      if (d.length === 0) return;
      console.log(daemon, '(' + p.pid + '):', d);

      // when we find a line that looks like 'running on <url>' then we've
      // fully started up and can run the next daemon.  see issue #556
      if (cb && /^.*running on http:\/\/.*:[0-9]+$/.test(d)) {
        cb();
        cb = undefined;
      }
    });
  }

  p.stdout.on('data', dump);
  p.stderr.on('data', dump);

  console.log("spawned", daemon, "("+pathToScript+") with pid", p.pid);
  Object.keys(daemonsToRun[daemon]).forEach(function(ek) {
    if (ek === 'path') return; // don't kill the Windows PATH
    delete process.env[ek];
  });

  daemons[daemon] = p;

  p.on('exit', function (code, signal) {
    console.log(daemon, 'exited(' + code + ') ', (signal ? 'on signal ' + signal : ""));
    delete daemons[daemon];
    Object.keys(daemons).forEach(function (daemon) { daemons[daemon].kill(); });
    if (Object.keys(daemons).length === 0) {
      console.log("all daemons torn down, exiting...");
    }
  });

  if (typeof cb === 'function') {
    setTimeout(cb, 1000);
  }
}

var daemonNames = Object.keys(daemonsToRun);
daemonNames.forEach(runDaemon);
/*runDaemon('certifier', function() {
  runDaemon('bigtent');
});*/
