const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
const packageName = 'winning-webui-inpatient-clinicalnote-offlinerecords'
module.exports = {
  // 设置打包后用相对路径（设置值为空）
  publicPath: '',

  chainWebpack: (config) => {
    config.externals({
      Bzip2: 'Bzip2',
    })
    //   const oneOfsMap = config.module.rule('scss').oneOfs.store
    //   oneOfsMap.forEach((item) => {
    //     item
    //       .use('sass-resources-loader')
    //       .loader('sass-resources-loader')
    //       .options({ resources: [resolve('./src/style/index.scss')] })
    //       .end()
    //   })
    //   config.module
    //     .rule('svg')
    //     .exclude.add(resolve('src/icons'))
    //     .end()
    //     .use('file-loader')
    //     .options({
    //       name: 'img/[name].[hash:8].[ext]',
    //       publicPath: `/${packageName}/`,
    //     })
    //   config.module
    //     .rule('icons')
    //     .test(/\.svg$/)
    //     .include.add(resolve('src/icons'))
    //     .end()
    //     .use('svg-sprite-loader')
    //     .loader('svg-sprite-loader')
    //     .options({
    //       symbolId: 'icon-[name]',
    //     })
    //   config.module
    //     .rule('fonts')
    //     .use('url-loader')
    //     .loader('url-loader')
    //     .options({
    //       limit: 4096, // 小于4kb将会被打包成 base64
    //       fallback: {
    //         loader: 'file-loader',
    //         options: {
    //           name: 'fonts/[name].[hash:8].[ext]',
    //           publicPath: `/${packageName}/`,
    //         },
    //       },
    //     })
    //     .end()
    //   config.module
    //     .rule('images')
    //     .test(/\.(png|jpe?g|gif|webp)$/i)
    //     .use('url-loader')
    //     .loader('url-loader')
    //     .options({
    //       limit: 4096, // 小于4kb将会被打包成 base64
    //       fallback: {
    //         loader: 'file-loader',
    //         options: {
    //           name: 'img/[name].[hash:8].[ext]',
    //           publicPath: `/${packageName}/`,
    //         },
    //       },
    //     })
  },
}
