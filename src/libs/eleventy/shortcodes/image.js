const path = require('node:path');
const Image = require('@11ty/eleventy-img');
const outdent = require('outdent');

const WIDTHS = [400, 800, 1280];
const FORMATS = ['webp', 'jpeg'];
const SIZES = '100vw';

module.exports = function (
  context,
  src,
  alt,
  className = undefined,
  widths = WIDTHS,
  formats = FORMATS,
  sizes = SIZES,
) {
  const { page } = context;

  const imagePath = `${path.dirname(page.inputPath)}/${src}`;
  let options = {
    widths,
    formats,
    urlPath: page.url,
    outputDir: path.dirname(page.outputPath),
  };

  Image(imagePath, options);
  const metadata = Image.statsSync(imagePath, options);

  const sourceHtmlString = Object.values(metadata)
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
    const images = metadata[format];
    return images[images.length - 1];
  };

  const largestImage = getLargestImage(formats[0]);
  const imgAttributes = stringifyAttributes({
    src: largestImage.url,
    width: largestImage.width,
    height: largestImage.height,
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

  const linkPicture = `<a href="${largestImage.url}" target="_blank" rel="noopener noreferrer">
    ${picture}
  </a>`;

  return outdent`${linkPicture}`;
};

/** Maps a config of attribute-value pairs to an HTML string representing those same attribute-value pairs. */
function stringifyAttributes(attributeMap) {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === 'undefined') return '';
      return `${attribute}="${value}"`;
    })
    .join(' ');
}
