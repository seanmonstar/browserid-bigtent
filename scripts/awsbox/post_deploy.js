#!/usr/bin/env node

var fs = require('fs'),
    child_process = require('child_process');

var certifierConfig = '/home/app/code/node_modules/browserid-certifier/config/local.json';
var configDist = '/home/app/code/node_modules/browserid-certifier/config/local.json-dist';

process.stdout.write('Deploying config and public key\n');
fs.writeFileSync(certifierConfig, fs.readFileSync(configDist));
process.stdout.write('Updated ' + certifierConfig + '\n');

process.stdout.write('Compressing CSS and JS\n');
var comp = child_process.spawn('/home/app/code/scripts/compress',
                                   [], {cwd: '/home/app/code'});
comp.stdout.pipe(process.stdout);
comp.stderr.pipe(process.stderr);

process.stdout.write('Starting up certifier\n');
var certEnv = Object.create(process.env);
certEnv.CONFIG_FILES = certifierConfig;
var cert = child_process.spawn('forever -a -l /home/app/var/log/certifier.log start /home/app/code/node_modules/browserid-certifier/bin/certifier', [], {
  env: certEnv
});

cert.stdout.pipe(process.stdout);
cert.stderr.pipe(process.stderr);
