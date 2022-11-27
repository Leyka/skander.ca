const esbuild = require('esbuild');
const sass = require('esbuild-sass-plugin');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const filters = require('./libs/eleventy/filters');

const isProdEnv = process.env.NODE_ENV === 'production';

module.exports = function (config) {
  // Plugins
  config.addPlugin(pluginRss);
  // Filters
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
  });
  // Sass => CSS
  config.on('afterBuild', () => {
    return esbuild.build({
      entryPoints: ['src/assets/sass/app.scss'],
      outfile: 'dist/assets/css/main.css',
      minify: isProdEnv,
      sourcemap: isProdEnv,
      plugins: [sass.sassPlugin()],
    });
  });
  config.addWatchTarget('./src/assets/sass');

  // Bundle JS
  config.on('eleventy.before', async () => {
    await esbuild.build({
      entryPoints: ['src/assets/js/index.js'],
      outfile: 'dist/assets/js/bundle.js',
      bundle: true,
      minify: isProdEnv,
      sourcemap: isProdEnv,
    });
  });
  config.addWatchTarget('./src/assets/js');

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
