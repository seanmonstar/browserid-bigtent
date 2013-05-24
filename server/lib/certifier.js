/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Module is a function which sends requests for certificates to the certifier. */

const
path = require('path'),
fs = require('fs'),
config = require('./configuration'),
statsd = require('./statsd');

const certify = require('browserid-certifier').certify;
const PRIV_KEY = fs.readFileSync(config.get('priv_key_path'));

module.exports = function (pubkey, email, duration_s, cb) {
  statsd.increment('certifier.invoked');
  var start = new Date();
  var options = {
    pubkey: pubkey,
    privkey: PRIV_KEY,
    duration: duration_s,
    email: email,
    hostname: config.get('issuer')
  };
  certify(options, function onCert(err, cert) {
    if (err) statsd.timing('certifier.unavailable.error', new Date() - start);
    else statsd.timing('certifier', new Date() - start);
    cb(err, cert);
  });
};
