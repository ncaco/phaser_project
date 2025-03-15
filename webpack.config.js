const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

// assets 디렉토리 존재 여부 확인
const hasAssetsDir = fs.existsSync(path.resolve(__dirname, 'assets'));

// 플러그인 배열 생성
const plugins = [
  new HtmlWebpackPlugin({
    template: './index.html',
    filename: 'index.html',
  })
];

// assets 디렉토리가 존재하고 비어있지 않은 경우에만 CopyWebpackPlugin 추가
if (hasAssetsDir) {
  plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' }
      ]
    })
  );
}

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    static: [
      {
        directory: path.join(__dirname, './'),
        publicPath: '/'
      },
      {
        directory: path.join(__dirname, 'assets'),
        publicPath: '/assets'
      }
    ],
    hot: true,
    port: 8081,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      logging: 'error',
    },
    open: true,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js'],
  },
}; 