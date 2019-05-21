module.exports = {
    devServer: {
        host: 'localhost',
        disableHostCheck: true
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                appId: 'moe.sound.sora.ylp',
                artifactName: "ylp-${os}-${version}.${ext}",
                productName: 'YouTube Live Poll',
                win: {
                    target: ['msi', 'portable'],
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