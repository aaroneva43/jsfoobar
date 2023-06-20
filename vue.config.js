module.exports = {
  lintOnSave: true,

  // 基本路径
  publicPath: "./",

  // 输出文件目录
  outputDir: "dist",

  // 静态资源目(js, css, img, fonts)
  assetsDir: "assets",

  // 生产环境是否生成 sourceMap 文件
  productionSourceMap: false,

  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,

    // 开CSS source maps?是否在构建样式地图，false将提高构建速度
    sourceMap: false,

    loaderOptions: {},
  },

  chainWebpack: (config) => {
    config.performance.set("hints", false);
    config.module
      .rule('worker-loader')
      .test(/\.worker\.js$/)
      .use({
        loader: 'worker-loader',
        options: {
          inline: true
        }
      })
      .loader('worker-loader')
      .end()
     config.devServer.set('compress', true);
  },
};
