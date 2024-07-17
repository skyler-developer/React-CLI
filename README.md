# React-CLI

1. 支持组件级HMR
2. 开启调试map
3. 使用split chunks减小文件体积

这两个插件用于支持react组件级hmr
npm install -D @pmmmwh/react-refresh-webpack-plugin react-refresh

路由懒加载可让webpack单独打包模块，而不是放在main.js里
只有当用户进入相应路由，才会请求响应js文件
splitChunks: {
            chunks: "all",
        },
        demo