const moment = require('moment')
const Handlebars = require('handlebars')

module.exports = {
  formatDate: function (date, format) {
    return moment(date).utc().format(format)
  },
  truncate: function (str, len) {
    if (str.length > len && str.length > 0) {
      let new_str = str + ' '
      new_str = str.substr(0, len)
      new_str = str.substr(0, new_str.lastIndexOf(' '))
      new_str = new_str.length > 0 ? new_str : str.substr(0, len)
      return new_str + '...'
    }
    return str
  },
  stripTags: function (input) {
    return input.replace(/<(?:.|\n)*?>/gm, '')
  },
  select: function (selected, options) {
    return options
      .fn(this)
      .replace(
        new RegExp(' value="' + selected + '"'),
        '$& selected="selected"'
      )
      .replace(
        new RegExp('>' + selected + '</option>'),
        ' selected="selected"$&'
      )
  },
  ifCond: function (v1, operator, v2, options) {
    switch (operator) {
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this)
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this)
      default:
        return options.inverse(this)
    }
  },
  toUpperCase: function(str) {
    return str.toUpperCase()
  },
  formatStatus: function (status) {
    let color
    switch (status.toLowerCase()) {
      case 'pending':
        color = 'yellow'
        break
      case 'accepted':
        color = 'green'
        break
      case 'rejected':
        color = 'red'
        break
      default:
        color = 'grey'
    }
    return new Handlebars.SafeString (`<span style="color: ${color}; font-weight: bold; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;">${status.toUpperCase()}</span>`)
  },
}