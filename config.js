const config = {
    port: 9090,
    output: './dist',
    htmlTemplate: 'index.template.html',
    devServerConfig: {},
    entryName: 'index',
    root: '/',
    routes: null, //by default, routes use main in package.json
    server: 'http://api.staging.saas.hand-china.com', //api server
    clientid: 'localhost',
    titlename: 'Choerodon', //html title
    favicon: 'favicon.ico', //page favicon
    theme: { // less/sass modify vars
        'primary-color': '#3F51B5',
    },
};

module.exports = config;
