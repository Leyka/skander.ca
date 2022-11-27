const pluginRss = require('@11ty/eleventy-plugin-rss');

const filters = require('./utils/filters.utils');

module.exports = function (config) {
  // Plugins
  config.addPlugin(pluginRss);

  // Pass through files
  config.addPassthroughCopy('./src/style.css');

  // Filters
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
