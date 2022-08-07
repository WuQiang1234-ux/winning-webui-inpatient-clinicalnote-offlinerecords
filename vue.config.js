module.exports = {
  // 设置打包后用相对路径（设置值为空）
  publicPath: '',

  chainWebpack: (config) => {
    config.externals({
      Bzip2: 'Bzip2',
    })
  },
}
