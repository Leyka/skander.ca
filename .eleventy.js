const esbuild = require('esbuild');
const sass = require('esbuild-sass-plugin');
const path = require('path');

const Image = require('@11ty/eleventy-img');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

const filters = require('./src/libs/eleventy/filters');
// const transforms = require('./src/libs/eleventy/transforms');
const shortcodes = require('./src/libs/eleventy/shortcodes');

const IS_PROD_ENV = [process.env.NODE_ENV, process.env.ELEVENTY_ENV].includes('production');

module.exports = function (config) {
  // Plugins
  config.addPlugin(pluginRss);
  config.addPlugin(pluginSyntaxHighlight);

  // Filters
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
  });

  function imageShortcode(src, alt, sizes = '(min-width: 1024px) 100vw, 50vw') {
    console.log(`Generating image(s) from:  ${src}`);
    let imageSrc = `${path.dirname(this.page.inputPath)}/${src}`;
    console.log({ imageSrc });
    let options = {
      widths: [300, 600, 1280],
      formats: ['webp', 'jpeg'],
      urlPath: this.page.url,
      outputDir: path.dirname(this.page.outputPath),
    };

    // generate images
    console.log('ok', imageSrc, options);
    Image(imageSrc, options);

    let imageAttributes = {
      alt,
      sizes,
      loading: 'lazy',
      decoding: 'async',
    };
    // get metadata
    metadata = Image.statsSync(imageSrc, options);
    console.log({ metadata });
    return Image.generateHTML(metadata, imageAttributes);
  }
  config.addShortcode('image', imageShortcode);

  // Transforms: when production
  if (IS_PROD_ENV) {
    Object.keys(transforms).forEach((transformName) => {
      config.addTransform(transformName, transforms[transformName]);
    });
  }

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
