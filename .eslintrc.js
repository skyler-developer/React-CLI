module.exports = {
    // 继承react官方规则
    extends: ["react-app"],
    parserOptions: {
        babelOptions: {
            presets: [
                // 解决页面报错问题
                ["babel-preset-react-app", false],
                "babel-preset-react-app/prod",
            ],
        },
    },
};
