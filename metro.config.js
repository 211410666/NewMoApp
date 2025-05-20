// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  http: path.resolve(__dirname, 'node_modules/http-browserify'),
  https: path.resolve(__dirname, 'node_modules/https-browserify'),
  stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
  crypto: path.resolve(__dirname, 'node_modules/crypto-browserify'),
  net: path.resolve(__dirname, 'node_modules/net-browserify'),
  tls: path.resolve(__dirname, 'node_modules/tls-browserify'),
  url: path.resolve(__dirname, 'node_modules/url'),
  zlib: path.resolve(__dirname, 'node_modules/browserify-zlib'),
  util: path.resolve(__dirname, 'node_modules/util'),
  assert: path.resolve(__dirname, 'node_modules/assert'),
  timers: path.resolve(__dirname, 'node_modules/timers-browserify'),
};

module.exports = defaultConfig;
