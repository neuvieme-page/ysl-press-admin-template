// eslint-disable-next-line
const chalk = require('chalk')
import { configService } from '../config/config.service'

export const errorLog = ({
  title = '',
  description = '',
  extended = null,
  level = 1,
  indentation = 0
} = {}) => {
  if (configService.getLogLevel() < level) return
  console.log(
    " ".repeat(indentation) + chalk.bold.underline.red(title) + chalk.bold.red(': ' + description),
  )
  if (extended) {
    console.log(" ".repeat(indentation) + chalk.red(extended))
  }
}

export const actionLog = ({
  title = '',
  description = '',
  extended = null,
  level = 3,
  indentation = 2
} = {}) => {
  if (configService.getLogLevel() < level) return
  console.log(
    
    " ".repeat(indentation) + chalk.bold.underline.cyan(title) + chalk.bold.cyan(': ' + description),
  )
  if (extended) {
    console.log(" ".repeat(indentation) + chalk.cyan(extended))
  }
}

export const warningLog = ({
  title = '',
  description = '',
  extended = null,
  level = 2,
  indentation = 2
} = {}) => {
  if (configService.getLogLevel() < level) return
  console.log(
    " ".repeat(indentation) + chalk.bold.underline.yellow(title) + chalk.bold.yellow(': ' + description),
  )
  if (extended) {
    console.log(" ".repeat(indentation) + chalk.yellow(extended))
  }
}

export const successLog = ({
  title = '',
  description = '',
  extended = null,
  level = 2,
  indentation = 2
} = {}) => {
  if (configService.getLogLevel() < level) return
  console.log(
    " ".repeat(indentation) + chalk.bold.underline.green(title) + chalk.green(': ' + description),
  )
  if (extended) {
    console.log(" ".repeat(indentation) + chalk.green(extended))
  }
}


export const log = ({
  title = '',
  description = '',
  extended = null,
  level = 4,
  indentation = 4
} = {}) => {
  if (configService.getLogLevel() < level) return
  console.log(
    " ".repeat(indentation) + chalk.bold.underline(title) + (title ? ': ' : '') + description,
  )
  if (extended) {
    console.log(" ".repeat(indentation) + extended)
  }
}
