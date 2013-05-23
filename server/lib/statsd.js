/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
config = require('./configuration'),
logger = require('./logging').logger;

try {
  const StatsD = require('node-statsd').StatsD;
} catch(ex) {
  
}
// Per @fetep browserid.bigtent.somekey
const PREFIX = "browserid." + config.get('process_type') + ".";

var statsd;

// start by exporting a stubbed no-op stats reporter
module.exports = {
  timing: function(s, v) {
    if (statsd) { statsd.timing(PREFIX + s, v); }
  },
  increment: function(s, v) {
    if (statsd) { statsd.increment(PREFIX + s, v); }
  }
};

var statsd_config = config.get('statsd');

if (statsd_config && statsd_config.enabled) {
  if (!StatsD) {
    logger.warn("node-statsd module missing");
    return;
  }
  var options = {};
  options.host = config.host || "localhost";
  options.port = config.port || 8125;

  statsd = new StatsD(options.host, options.port);
}

process.on('uncaughtException', function(err) {
  console.error(err.stack);
  if (statsd) statsd.increment(PREFIX + 'uncaught_exception');
  logger.error(err.stack || err);
});
