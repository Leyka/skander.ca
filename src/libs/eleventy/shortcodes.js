const Image = require('@11ty/eleventy-img');

const IMAGE_WIDTHS = [300, 600, 1280];
const IMAGE_FORMATS = ['jpeg', 'webp'];

module.exports = {
  image: async function (
    src,
    alt,
    className = undefined,
    widths = IMAGE_WIDTHS,
    formats = IMAGE_FORMATS,
    sizes = '100vw',
  ) {
    console.log({ src, alt, className, widths, formats, sizes });
    const metadata = await Image(src, {
      widths: [...widths, null],
      formats: [...formats, null],
      urlPath: 'src/assets/images',
      outputDir: 'dist/assets/images',
    });
    console.log({ metadata });
  },
};
