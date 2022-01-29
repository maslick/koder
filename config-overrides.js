const webpack = require('webpack');

module.exports = function override(config, env) {
  console.log('override!');

  config.resolve.fallback = {
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    util: require.resolve('util/'),
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  return config;
};