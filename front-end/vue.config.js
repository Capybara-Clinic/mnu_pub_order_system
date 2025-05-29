module.exports = {
  transpileDependencies: true,
  chainWebpack: config => {
    // 이미지 로더에 image-webpack-loader 추가
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        mozjpeg: { progressive: true, quality: 70 },
        optipng: { enabled: true },
        pngquant: { quality: [0.65, 0.9], speed: 4 },
        gifsicle: { interlaced: false },
        webp: { quality: 75 }
      })
      .end();
  },
  // 개발 서버 설정 (옵션)
  devServer: {
    // proxy: 'http://localhost:8000', // 필요시 수정
    port: 5000,
  },
}
