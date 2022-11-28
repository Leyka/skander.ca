const esbuild = require('esbuild');
const sass = require('esbuild-sass-plugin');

const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

const filters = require('./libs/eleventy/filters');

const iProdEnv = [process.env.NODE_ENV, process.env.ELEVENTY_ENV].includes('production');

module.exports = function (config) {
  // Plugins
  config.addPlugin(pluginRss);
  config.addPlugin(pluginSyntaxHighlight);

  // Filters
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
  });

  // Sass => CSS
  config.on('eleventy.before', () => {
    return esbuild.build({
      entryPoints: ['src/assets/sass/app.scss'],
      outfile: 'dist/assets/main.css',
      minify: iProdEnv,
      sourcemap: iProdEnv,
      plugins: [sass.sassPlugin()],
    });
  });
  config.addWatchTarget('./src/assets/sass');

  // Bundle JS
  config.on('eleventy.before', async () => {
    await esbuild.build({
      entryPoints: ['src/assets/js/index.js'],
      outfile: 'dist/assets/bundle.js',
      bundle: true,
      minify: iProdEnv,
      sourcemap: iProdEnv,
    });
  });
  config.addWatchTarget('./src/assets/js');

  // Add vendor assets to the dist folder
  config.addPassthroughCopy('./src/assets/vendors/**');

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
