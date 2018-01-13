const path = require('path')

module.exports = {
  entry: './src/view/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    index: './index.html',
    inline: true,
    contentBase: './'
  },
  node: {
    fs: 'empty'
  }
}