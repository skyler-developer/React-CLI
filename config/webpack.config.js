const path = require("path");
const os = require("os");
const EslintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// css代码压缩
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");

// js代码压缩，webpack默认使用此插件压缩，也可自定义配置
const TerserWebpackPlugin = require("terser-webpack-plugin");

// 图片压缩
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

// 获取cpu核数
const threads = os.cpus().length;

// 获取cross-env定义的环境变量
const isProduction = process.env.NODE_ENV === "production";

// 返回处理样式loader函数
const getStyleLoaders = (pre) => {
    return [
        // 生产环境中，将css提取到单独的文件
        isProduction ? MiniCssExtractPlugin.loader : "style-loader",
        "css-loader",
        {
            // 处理css兼容性问题
            // 配合package.json中browserslist来指定兼容性
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: ["postcss-preset-env"],
                },
            },
        },
        pre && {
            loader: pre,
            options:
                pre === "less-loader"
                    ? {
                          lessOptions: {
                              javascriptEnabled: true,
                          },
                      }
                    : {},
        },
    ].filter(Boolean);
};

module.exports = {
    // 入口文件，相对路径
    entry: "./src/main.js",

    // 输出
    output: {
        // 所有文件的输出路径
        // __dirname nodejs的变量，代表当前文件的文件夹目录
        // 绝对路径
        path: isProduction ? path.resolve(__dirname, "../dist") : undefined,

        // 入口文件打包输出文件名
        filename: isProduction ? "static/js/[name].[contenthash:10].js" : "static/js/[name].js",

        // 非入口chunk文件名
        chunkFilename: isProduction
            ? "static/js/[name].[contenthash:10].chunk.js"
            : "static/js/[name].chunk.js",

        // 资源文件名（图片、字体等）
        assetModuleFilename: "static/media/[hash:10][ext][query]",

        // 自动清空上次打包的内容
        // 原理：在打包前，将path整个目录内容清空，再进行打包
        clean: true,
    },
    module: {
        rules: [
            // loader的配置
            {
                // oneOf只会匹配一个成功的loader
                oneOf: [
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
                        test: /\.styl$/,
                        use: getStyleLoaders("stylus-loader"),
                    },
                    // 处理图片
                    {
                        test: /\.(jpe?g|png|gif|webp|svg)$/,
                        type: "asset",
                        parser: {
                            dataUrlCondition: {
                                maxSize: 10 * 1024,
                            },
                        },
                    },
                    // 处理其他资源
                    {
                        test: /\.(woff2?|ttf)$/,
                        type: "asset/resource",
                    },
                    // 处理js
                    {
                        test: /\.jsx?$/,
                        // include：只包含src下的文件，排除node_modules等文件
                        include: path.resolve(__dirname, "../src"),
                        use: [
                            {
                                // 使用thread-loader来进行多进程打包（每个worker线程运行在独立的进程中）
                                loader: "thread-loader",
                                options: {
                                    // 产生的worker数量,这里设置为了本地电脑cpu核心数
                                    workers: threads,
                                },
                            },
                            {
                                loader: "babel-loader",
                                options: {
                                    // 开启babel缓存
                                    cacheDirectory: true,

                                    // 关闭缓存文件压缩
                                    cacheCompression: false,
                                    plugins: [
                                        !isProduction && "react-refresh/babel", // 激活js的HMR

                                        // 对babel进行tree-shaking,以减少代码体积
                                        "@babel/plugin-transform-runtime",
                                    ].filter(Boolean),
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    // 处理html
    plugins: [
        // eslint代码检查，会将eslintrc.js文件中的检查结果输出到构建信息中
        new EslintWebpackPlugin({
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules",

            // 开启eslint缓存
            cache: true,

            // 指定缓存文件路径
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),

            // 开启多进程
            threads: threads,
        }),

        // 根据指定的html模板文件生成新的html文件，并将打包后的js文件自动引入到此html文件中
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html"),
        }),

        // 开启preloader/prefetch，可在页面进入时/浏览器空闲时加载动态导入的文件
        new PreloadWebpackPlugin({
            rel: "prefetch",
        }),

        // pwa配置插件
        isProduction &&
            new WorkboxPlugin.GenerateSW({
                // 这些选项帮助快速启用 ServiceWorkers
                // 不允许遗留任何“旧的” ServiceWorkers
                clientsClaim: true,
                skipWaiting: true,
            }),

        isProduction &&
            // 将CSS从bundle中提取出来单独打包
            new MiniCssExtractPlugin({
                filename: "static/css/[name].[contenthash:10].css",
                chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
            }),

        isProduction &&
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "../public"),
                        to: path.resolve(__dirname, "../dist"),
                        globOptions: {
                            // 忽略index.html文件
                            ignore: ["**/index.html"],
                        },
                    },
                ],
            }),

        !isProduction && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    optimization: {
        // code split配置
        splitChunks: {
            // 可将依赖node_modules代码分割出来，提高code cache命中率，内部通过splitChunksPlugin实现，已被webpack集成
            chunks: "all",
            cacheGroups: {
                // react react-dom react-router-dom 一起打包成一个js文件
                react: {
                    test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
                    name: "chunk-react",
                    priority: 40,
                },
                // antd 单独打包
                antd: {
                    test: /[\\/]node_modules[\\/]antd[\\/]/,
                    name: "chunk-antd",
                    priority: 30,
                },
                // 剩下node_modules单独打包
                libs: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "chunk-libs",
                    priority: 20,
                },
            },
        },

        // 生成runtime文件，提高缓存命中率，例：main.js中依赖math.js，如果没有runtime.js，
        // 假如math.js改变，main.ja也会改变，无法利用缓存
        // 加入runtime.js，只会改变math.js与runtim.js，main.js不会改变，可以利用缓存
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`,
        },
        // 是否需要进行压缩
        minimize: isProduction,

        // 压缩配置
        minimizer: [
            // 压缩css
            new CssMinimizerWebpackPlugin({
                // 开启多进程和进程数量
                parallel: threads,
            }),

            // 压缩js
            new TerserWebpackPlugin({
                // 开启多进程和进程数量
                parallel: threads,
            }),

            // 压缩图片资源
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ["gifsicle", { interlaced: true }],
                            ["jpegtran", { progressive: true }],
                            ["optipng", { optimizationLevel: 5 }],
                            [
                                "svgo",
                                {
                                    plugins: [
                                        "preset-default",
                                        "prefixIds",
                                        {
                                            name: "sortAttrs",
                                            params: {
                                                xmlnsOrder: "alphabetical",
                                            },
                                        },
                                    ],
                                },
                            ],
                        ],
                    },
                },
            }),
        ],
    },
    // webpack解析模块加载选项
    resolve: {
        // 自动补全文件扩展名
        extensions: [".jsx", ".js", ".json"],
    },
    devServer: {
        host: "localhost",
        port: 3000,
        open: true,
        hot: true, // 开启HMR
        client: {
            logging: "none", // 关闭 HMR 相关信息的输出
        },
        historyApiFallback: true, // 解决前端路由刷新404问题
    },
    performance: false, // 关闭性能分析，提升打包速度
};
