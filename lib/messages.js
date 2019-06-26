const chalk = require('chalk')

module.exports = {
  error: msg => `${chalk.bgRed('ERROR')} ${chalk.red(msg)}`,
  warning: msg => `${chalk.bgYellow('WARNING')} ${chalk.yellow(msg)}`,
  info: msg => `${chalk.bgGreen('INFO')} ${chalk.green(msg)}`
}
