const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
    entry: {
        app: [
            './src/plugins/slick-slider/slick.js',
            './src/plugins/jquery-form-styler/jquery.formstyler.js',
            './src/app.js', 
        ],
    },
    optimization: {
        minimize: false,
        splitChunks: {
            chunks: 'all'
        }
    },
    performance: {
        // hints: false,
        maxEntrypointSize: 2512000,
        maxAssetSize: 2512000,
    },
    output: {
        filename: 'bundle.[chunkhash].js',
        path: path.resolve(__dirname, 'public')
    },
    resolve: {
        alias: {
            '@plugins': path.resolve(__dirname, 'src/plugins'),
            '@fonts': path.resolve(__dirname, 'src/css/fonts'),
            '@img': path.resolve(__dirname, 'src/img'),
            '@news': path.resolve(__dirname, 'src/news'),
            // '@':    path.resolve(__dirname, 'src'),
        },
    },
    devServer: {
        port: 3000,

    },
    plugins: [
        new HTMLPlugin({
            title: 'Уборка жилых помещений',
            template: './src/index.html',
            filename: 'index.html',
        }),
        new HTMLPlugin({
            title: 'Расчет стоимости уборки помещения',
            template: './src/cleaning-calc.html',
            filename: 'cleaning-calc.html',
        }),
        new HTMLPlugin({
            title: 'Заказать уборку помещения',
            template: './src/bookong.html',
            filename: 'bookong.html',
        }),
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                // include: path.resolve(__dirname, 'src/css'),
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                include: path.resolve(__dirname, 'src/img/'),
                type: 'asset/resource',
                generator: {
                    filename: 'img/[hash][ext]'
                },
            },
            // {
            //     test: /\.sass$/i,
            //     use: ["sass-loader"],
            // },
            {
                // test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/i,
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
                include: path.resolve(__dirname, 'src/css/fonts'),
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[hash][ext]'
                },
                // use: ['file-loader'],
            },
        ],
    },
}