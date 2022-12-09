const esbuild = require('esbuild');
const sass = require('esbuild-sass-plugin');
const markdownIt = require('markdown-it');

const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const pluginTimeToRead = require('eleventy-plugin-time-to-read');

const filters = require('./src/libs/eleventy/filters');
const transforms = require('./src/libs/eleventy/transforms');

const IS_PROD_ENV = [process.env.NODE_ENV, process.env.ELEVENTY_ENV].includes('production');

module.exports = function (config) {
  // Plugins
  config.addPlugin(pluginRss);
  config.addPlugin(pluginSyntaxHighlight);
  config.addPlugin(pluginNavigation);
  config.addPlugin(pluginTimeToRead, {
    speed: '250 words per minute',
  });

  // Filters
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
  });

  // Transforms when production
  if (IS_PROD_ENV) {
    Object.keys(transforms).forEach((transformName) => {
      config.addTransform(transformName, transforms[transformName]);
    });
  }

  // Markdown
  config.setLibrary(
    'md',
    markdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
    }),
  );

  // Sass => CSS
  config.on('eleventy.before', () => {
    return esbuild.build({
      entryPoints: ['src/assets/sass/index.scss'],
      outfile: 'dist/assets/main.css',
      minify: IS_PROD_ENV,
      sourcemap: IS_PROD_ENV,
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
      minify: IS_PROD_ENV,
      sourcemap: IS_PROD_ENV,
      drop: IS_PROD_ENV ? ['console', 'debugger'] : [],
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
