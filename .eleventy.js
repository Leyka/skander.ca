const path = require('node:path');

const esbuild = require('esbuild');
const sass = require('esbuild-sass-plugin');
const markdownIt = require('markdown-it');
const outdent = require('outdent');

const Image = require('@11ty/eleventy-img');
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
    speed: '238 words per minute',
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

  // Image shortcode
  // TODO: Move to another file (pass this as context in function())
  config.addShortcode('image', image);

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

async function image(
  src,
  alt,
  className = undefined,
  widths = [400, 800, 1280],
  formats = ['webp', 'jpeg'],
  sizes = '100vw',
) {
  // Fetch image from the blog article folder
  const imageSrc = `${path.dirname(this.page.inputPath)}/${src}`;
  let options = {
    widths,
    formats,
    urlPath: this.page.url,
    outputDir: path.dirname(this.page.outputPath),
  };

  Image(imageSrc, options);

  const imageMetadata = Image.statsSync(imageSrc, options);

  const sourceHtmlString = Object.values(imageMetadata)
    // Map each format to the source HTML markup
    .map((images) => {
      // The first entry is representative of all the others
      // since they each have the same shape
      const { sourceType } = images[0];

      // Use our util from earlier to make our lives easier
      const sourceAttributes = stringifyAttributes({
        type: sourceType,
        // srcset needs to be a comma-separated attribute
        srcset: images.map((image) => image.srcset).join(', '),
        sizes,
      });

      // Return one <source> per format
      return `<source ${sourceAttributes}>`;
    })
    .join('\n');

  const getLargestImage = (format) => {
    const images = imageMetadata[format];
    return images[images.length - 1];
  };

  const largestUnoptimizedImg = getLargestImage(formats[0]);
  const imgAttributes = stringifyAttributes({
    src: largestUnoptimizedImg.url,
    width: largestUnoptimizedImg.width,
    height: largestUnoptimizedImg.height,
    alt,
    loading: 'lazy',
    decoding: 'async',
  });
  const imgHtmlString = `<img ${imgAttributes}>`;

  const pictureAttributes = stringifyAttributes({
    class: className,
  });
  const picture = `<picture ${pictureAttributes}>
    ${sourceHtmlString}
    ${imgHtmlString}
  </picture>`;

  const linkPicture = `<a href="${largestUnoptimizedImg.url}" target="_blank" rel="noopener noreferrer">
    ${picture}
  </a>`;

  return outdent`${linkPicture}`;
}

/** Maps a config of attribute-value pairs to an HTML string
 * representing those same attribute-value pairs.
 */
const stringifyAttributes = (attributeMap) => {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === 'undefined') return '';
      return `${attribute}="${value}"`;
    })
    .join(' ');
};
