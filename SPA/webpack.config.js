const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const root = path.resolve('.');

module.exports = (env) => {
    const deployedAppName = '/nn/';
    console.log(env);

    const currentEnivronment = env.NODE_ENV || env.nodeEnv; // почему-то devServer и обычная сборка по-разному прокидывают аргументы
    const isProduction = currentEnivronment === 'prod';

    const devtool = isProduction ? false : 'eval-cheap-module-source-map'; // false или строка по шаблону
    const productionPlugins = [new MiniCssExtractPlugin()];

    return {
        entry: './src/index.tsx',
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: isProduction ? deployedAppName : '/', // этот путь будет добавляться в пути до каждого бандла внутри html и других бандлов
            filename: 'js/[name].[fullhash].bundle.js',
            chunkFilename: 'js/[name].[fullhash].bundle.js',
        },
        devtool,
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    options: {
                        compilerOptions: {
                            sourceMap: !isProduction,
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.(scss|module.(scss))$/,
                    exclude: /\.$/,
                    use: [
                        !isProduction ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: !isProduction,
                            },
                        },
                    ],
                },
            ],
        },
        devServer: {
            contentBase: path.join(__dirname, 'public'),
            port: 3000,
            watchContentBase: true,
            progress: true,
            compress: true,
            hot: true,
            historyApiFallback: true,
        },
        plugins: [
            new CleanWebpackPlugin(),
            ...productionPlugins,
            new HtmlWebpackPlugin({ template: './public/index.html', filename: 'index.html', inject: 'body' }),
        ],
    };
};
