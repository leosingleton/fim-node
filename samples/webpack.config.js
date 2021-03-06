const nodeExternals = require('webpack-node-externals');
const path = require('path');

const config = {
  target: 'node',
  entry: './src/index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  externals: [
    nodeExternals({
      // webpack-node-externals doesn't automatically find node_modules one level up from samples/
      modulesDir: '../node_modules'
    })
  ],
  output: {
    path: path.resolve(__dirname, '../build/samples'),
    filename: 'samples.js'
  }
};

module.exports = config;
