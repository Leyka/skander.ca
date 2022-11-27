const esbuild = require('esbuild');
const sass = require('esbuild-sass-plugin');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const filters = require('./libs/eleventy/filters');

const isProdEnv = process.env.ELEVENTY_ENV === 'production';

module.exports = function (config) {
  // Plugins
  config.addPlugin(pluginRss);
  // Filters
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
  });
  // Esbuild: Sass => CSS
  config.on('afterBuild', () => {
    return esbuild.build({
      entryPoints: ['src/assets/sass/app.scss'],
      outdir: 'dist/assets/css',
      minify: isProdEnv,
      sourcemap: isProdEnv,
      plugins: [sass.sassPlugin()],
    });
  });
  config.addWatchTarget('./src/assets/sass');

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
