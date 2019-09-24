const path = require('path');
const withSass = require('@zeit/next-sass');

module.exports = withSass({
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
