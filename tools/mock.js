/**
 * simple mock server
 */

var express = require('express');
var app = express();
var proxy = require('http-proxy-middleware');
var http = require('http');
var path = require('path');
var fs = require('fs');

var port = 5001;

//mockdata
/** ATTENTION: the regex won't match params in query */
const rules = {
  default: {
    // [/\/config\/export/]: { method: 'post', fn: 'devices/config_export.js' },
    // [/\/logs\/$/]: { method: 'get', fn: 'logs/attacklog_1d.js' },
    // [/\/logs\/signature\/$/]: { method: 'get', fn: 'logs/signature.js' },
    // [/\/devices\/group\/(\d+)\/device/]: {
    // 	method: "get",
    // 	fn: "devices/devices_ha.js",
    // 	filter: ({ query = {}, payload = {}, groups = {} }) => {
    // 		return query.page === "1";
    // 	},
    // },
  },
};

function mock(rules, server = app) {
  var application = server.options('*', function (req, res) {
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-headers', 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token');
    res.sendStatus(200);
  });
  Object.keys(rules).forEach(function (key) {
    var cfg = rules[key];
    var method = typeof cfg === 'string' ? 'get' : cfg.method.toLowerCase();
    var dataPath = typeof cfg === 'string' ? cfg : cfg.data || cfg.fn;
    var code = cfg.code || 200;

    console.log('MOCK| registering', key, ' :', method);
    const reg = RegExp(key.replace(/^\/|\/$/g, ''));
    application = application[method](reg, function (req, res) {
      console.log('URL matched: ', req.originalUrl, ' URL groups: ', reg.exec(req.originalUrl)?.groups);
      res.setHeader('access-control-allow-origin', '*');
      if (code !== 200) res.status(code);
      if (cfg.data || typeof cfg === 'string') {
        res.sendFile(path.join(__dirname, 'data/mock', dataPath));
      } else if (cfg.fn) {
        var fn = require(path.join(__dirname, 'data/mock', dataPath))[method];
        res.send(
          JSON.stringify(
            fn({
              query: req.query,
              originalUrl: req.originalUrl,
              payload: req.body,
            }),
          ),
        );
      }
    });
  });
}

const formatReq = (req, regex) => {
  return {
    query: req.query || {},
    payload: req.body || {},
    originalUrl: req.originalUrl,
    groups: regex ? regex.exec(req.originalUrl)?.groups : {},
  };
};
// start server
mock(rules.default);

http.createServer(app).listen(port, function () {
  console.log('mock server started on', port);
});

module.exports.rules = rules;
module.exports.port = port;
module.exports.start = () => {
  http.createServer(app).listen(port, function () {
    console.log('mock server started on', port);
  });
};
module.exports.formatReq = formatReq;
module.exports.runFilter = (filter, formattedReq) => {
  if (typeof filter === 'function') {
    return filter(formattedReq);
  }
  return true;
};
