const { DateTime } = require('luxon');

module.exports = {
  formatDate: function (date) {
    const dt = DateTime.fromJSDate(date, { zone: 'utc' });
    return dt.toLocaleString(DateTime.DATE_FULL);
  },
};
