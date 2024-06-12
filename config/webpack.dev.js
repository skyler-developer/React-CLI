const path = require("path");
const EslintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { optimize } = require("webpack");

// 返回处理样式函数
const getStyleLoaders = (pre) => {
    return [
        "style-loader",
        "css-loader",
        {
            // 处理css兼容性问题
            // 配合package.json中browserslist字段来指定兼容性
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: ["postcss-preset-env"],
                },
            },
        },
        pre,
    ].filter(Boolean);
};

module.exports = {
    // webpack入口文件
    entry: "./src/main.js",
    output: {
        // 打包后文件输出路径，开发环境无需输出打包后文件
        path: undefined,

        // js文件名称
        filename: "static/js/[name].js",

        // chunk文件名称（非入口 chunk（即异步加载的模块））
        chunkFilename: "static/js/[name].chunk.js",

        // 静态资源路径及文件名
        assetModuleFilename: "static/media/[hash:10][ext][query]",
    },
    module: {
        rules: [
            // 处理css
            {
                test: /\.css$/,
                use: getStyleLoaders(),
            },
            {
                test: /\.less$/,
                use: getStyleLoaders("less-loader"),
            },
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoaders("sass-loader"),
            },
            {
                test: /\.stylus$/,
                use: getStyleLoaders("stylus-loader"),
            },

            // 处理图片
            {
                test: /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/,

                // Asset Modules 是 Webpack 5 提供的一种处理静态资源的机制，
                // 通过将资源文件复制到输出目录并返回资源的 URL，
                // 方便在应用程序中引用和加载这些静态资源。
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    },
                },
            },

            // 处理其他资源
            {
                test: /\.(woff2?|eot|ttf|otf)$/,
                // Resource Modules 是 Webpack 5 中的另一种处理静态资源的方式。与 Asset Modules 不同，
                // Resource Modules 不会对资源文件进行转换或编译，
                // 而是将它们原样复制到输出目录，并返回资源的 URL。
                type: "asset/resource",
            },

            // 处理js
            {
                test: /\.jsx?$/,
                include: path.resolve(__dirname, "../src"),
                loader: "babel-loader",
                options: {
                    // 缓存babel编译结果，提升编译速度
                    cacheDirectory: true,
                    // 不压缩缓存文件，提升编译速度
                    cacheCompression: false,

                    // 激活js的HMR
                    plugins: ["react-refresh/babel"],
                },
            },
        ],
    },

    // 处理html
    plugins: [
        new EslintWebpackPlugin({
            // __dirname 是 Node.js 中的一个全局变量，表示当前模块的目录路径。
            // path.resolve() 是 Node.js 中的一个方法，用于将多个路径片段解析为绝对路径。
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules",
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html"),
        }),

        // 激活js的HMR
        new ReactRefreshWebpackPlugin(),
    ],

    // 设置为开发模式
    mode: "development",

    // 开启source-map，方便调试
    devtool: "cheap-module-source-map",

    optimization: {
        // 配置代码分割，将共享的模块提取到单独的文件中
        // react组件需开启路由懒加载，可将组件单独打包
        splitChunks: {
            chunks: "all",
        },

        // 将运行时代码拆分到单独的文件中，只有文件改变才会重新加载，以提高缓存效果
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`,
        },
    },

    // webpack解析模块加载选项
    resolve: {
        // 自动补全文件扩展名
        extensions: [".jsx", ".js", ".json"],
    },

    devServer: {
        host: "localhost",
        port: 3001,
        // port: "auto",

        // 启动开发服务器时，自动在浏览器打开应用程序
        open: true,
        // 启用热模块替换HMR
        hot: true,

        // 解决前端路由刷新404问题
        historyApiFallback: true,
    },

    // 多进程打包创建进程时间开销较大，暂不考虑
};
