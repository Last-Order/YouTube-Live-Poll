module.exports = {
    devServer: {
        host: 'localhost',
        disableHostCheck: true
    },
    transpileDependencies: [
        'vue-echarts',
        'resize-detector'
    ],
    pluginOptions: {
        electronBuilder: {
            chainWebpackMainProcess: config => {
                // Chain webpack config for electron main process only
                config.mode('development');
                // config.externals(['uws']);
            },
            builderOptions: {
                appId: 'moe.sound.sora.ylp',
                asar: false,
                artifactName: "ylp-${os}-${version}.${ext}",
                productName: 'YouTube Live Poll',
                win: {
                    target: ['msi'],
                    icon: 'build/icons/icon.ico'
                },
                mac: {
                    category: 'public.app-category.developer-tools',
                    target: ['dmg']
                },
                linux: {
                    target: ['deb', 'appImage']
                }
            }
        }
    }
}