process.env.NODE_ENV = 'development';
let env;
switch (process.env.NODE_ENV) {
    case ('development'):
        env = {
            'process.env.AGILE_HOST': JSON.stringify(`${process.env.AGILE_HOST}` || 'http://minio.staging.saas.hand-china.com/agile-service/')
        };
        break;
    case ('production'):
        env = {
            'process.env.AGILE_HOST': JSON.stringify(`${process.env.AGILE_HOST}` || 'http://minio.staging.saas.hand-china.com/agile-service/')
        };
        break;
    default:
        break;
}

const config = {
    port: 9090,
    output: './dist',
    htmlTemplate: 'index.template.html',
    devServerConfig: {},
    webpackConfig(config) {
        const webpack = require('./agile/node_modules/webpack');
        config.plugins.push(new webpack.DefinePlugin(env));
        return config;
    },
    entryName: 'index',
    root: '/',
    routes: null, //by default, routes use main in package.json
    server: 'http://api.staging.saas.hand-china.com/', //api server
    // server: 'http://10.211.97.242:8080',
    clientid: 'localhost',
    titlename: 'Choerodon', //html title
    favicon: 'favicon.ico', //page favicon
    theme: { // less/sass modify vars
        'primary-color': '#3F51B5',
    },
};

module.exports = config;
