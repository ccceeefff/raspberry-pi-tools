var path = require('path')
var webpack = require('webpack')

module.exports = {

  devtool: 'eval',

  entry: [
    './client/index.js'
  ],

  output: {
    path: path.join(__dirname, 'assets', 'scripts'),
    filename: 'bundle.js',
    publicPath: '/assets/scripts/'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]

}
