// vue.config.js
const { defineConfig } = require('@vue/cli-service');
const config = require('./app.config');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: config.devServer,
});