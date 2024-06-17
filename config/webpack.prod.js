const path = require("path");
const EslintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// 提取css为单独文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// 压缩css
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");

// 压缩js
const TerserWebpackPlugin = require("terser-webpack-plugin");

// 图片压缩
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

// 返回处理样式loader函数
const getStyleLoaders = (pre) => {
    return [
        MiniCssExtractPlugin.loader,
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
        pre,
    ].filter(Boolean);
};

module.exports = {
    entry: "./src/main.js",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "static/js/[name].[contenthash:10].js",
        chunkFilename: "static/js/[name].[contenthash:10].chunk.js",
        assetModuleFilename: "static/media/[hash:10][ext][query]",
        // 清空掉之前的打包文件
        clean: true,
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
                include: path.resolve(__dirname, "../src"),
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                },
            },
        ],
    },
    // 处理html
    plugins: [
        new EslintWebpackPlugin({
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules",
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        new MiniCssExtractPlugin({
            filename: "static/css/[name].[contenthash:10].css",
            chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
        }),
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
    ],
    mode: "production",

    // 包含行列信息
    devtool: "source-map",
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`,
        },
        minimizer: [
            new CssMinimizerWebpackPlugin(),
            new TerserWebpackPlugin(),
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
};
