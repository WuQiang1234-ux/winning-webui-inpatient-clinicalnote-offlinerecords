const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
const packageName = 'webui-inpatient-clinicalnote'
module.exports = {
  // 设置打包后用相对路径（设置值为空）
  publicPath: '',

  chainWebpack: (config) => {
    config.externals({
      Bzip2: 'Bzip2',
    })
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
      .use('file-loader')
      .options({
        name: 'img/[name].[hash:8].[ext]',
        publicPath: `/${packageName}/`,
      })
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
  },
}
