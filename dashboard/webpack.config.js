const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    dashboard: './src/js/dashboard.js'
    // app: './src/index.js'
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
      template: 'src/estar.ejs'
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

