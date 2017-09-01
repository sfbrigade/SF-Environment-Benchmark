const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    estar: './src/estar.js',
    eui: './src/eui.js',
    ghg: './src/ghg.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      // inject: false,
      foo: "asdf",
      filename: 'estar.html',
      template: 'src/estar.ejs',
      chunks: ['estar']
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      foo: "asdf",
      filename: 'eui.html',
      template: 'src/eui.ejs',
      chunks: ['eui']
    }),
    new HtmlWebpackPlugin({
      // inject: false,
      foo: "asdf",
      filename: 'ghg.html',
      template: 'src/ghg.ejs',
      chunks: ['ghg']
    })
  ],
  module: {
    rules: [
      {
      //   test: /\.js$/,
      //   exclude: /(node_modules|bower_components)/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //      presets: ['es2015']
      //     }
      //   }
      // },{
        test: /\.css$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },{
        test: /\.(html)$/,
        use: [{
          loader: 'html-loader',
          options: {
            // attrs: [':data-src']
          }
        }]
      },{
         test: /\.(png|svg|jpg|gif)$/,
         exclude: /(node_modules|bower_components)/,
         use: [
           'file-loader'
         ]
       }
    ]
  }
};

