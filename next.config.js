const path = require('path');
const withCss = require('@zeit/next-css');

module.exports = withCss({
  webpack(config) {
    config.resolve.alias['@components'] = path.join(__dirname, 'components');
    config.resolve.alias['@styles'] = path.join(__dirname, 'styles');
    config.resolve.alias['styles'] = path.join(__dirname, 'styles');
    config.resolve.alias['@actions'] = path.join(__dirname, 'actions');
    config.resolve.alias['@utils'] = path.join(__dirname, 'utils');
    config.resolve.alias['@'] = path.join(__dirname, '/');

    return config;
  },
});
