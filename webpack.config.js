var path = require('path');
var webpack = require('webpack');

var HtmlWebpackPlugin = require("html-webpack-plugin");

var dev_mode = 'development';

module.exports = {
  entry: {
    app: './src/main.js',
    vendor: [
    ],
  },
  output: {
    path: './dist/js/',
    filename:  'js.min.js',
    pathinfo: true
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|forge\.js)/,
      loader: 'babel-loader',
      query: {
        compact: true,
        presets: ['es2015']
      }
    },
  { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
   { test: /\.png$/, loader: "url-loader?limit=100000" }
]
  },
  alias: {
    forge: 'forge.js'
  },
  resolve: {
    root: [
      path.resolve('./src/'),
      path.resolve('./node_modules/emailjs-imap-client/src/'),
      path.resolve('./node_modules/emailjs-imap-handler/src/'),
      path.resolve('./node_modules/emailjs-tcp-socket/src/'),
      path.resolve('./node_modules/emailjs-smtp-client/src/'),
      path.resolve('./node_modules/emailjs-stringencoding/src/'),
    ]
  },
  devtool: "eval-cheap-module-source-map",
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("vendor", (dev_mode == 'development') ? "vendor.js" : "[name].[hash].js"),
    new HtmlWebpackPlugin({
      title: "test title",
      filename: "../index.html",
      template: 'src/index.html'
    })
  ],
  node: {
    fs: "empty"
  }
};
