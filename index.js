#! /usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const argv = require('minimist')(process.argv.slice(2))
const git = require('simple-git')
const exec = require('child_process').exec
const CLI = require('clui')
const Spinner = CLI.Spinner

const files = require('./lib/files')
const messages = require('./lib/messages')

const targetDirectory = argv._[0]

const exitWithError = msg => {
  console.log(messages.error(msg))
  process.exit()
}

clear()
console.log(
  chalk.yellow(figlet.textSync('Hacksaw', { horizontalLayout: 'full' }))
)

if (!targetDirectory) {
  exitWithError('No destination specified')
}

if (files.directoryExists(targetDirectory)) {
  exitWithError('Target destination already exists')
}

const status = new Spinner(
  `Cloning from Github into directory ${targetDirectory}, please wait...`
)

git()
  .exec(() => {
    status.start()
  })
  .clone('https://github.com/sambeevors/Hacksaw', targetDirectory)
  .exec(() => {
    if (!files.directoryExists(targetDirectory)) {
      exitWithError('Something went wrong')
    }
    git(`./${targetDirectory}`)
      .removeRemote('origin')
      .raw(['checkout', '--orphan', 'latest_branch'])
      .raw(['add', '-A'])
      .raw(['commit', '-am', '"Initialised with Hacksaw CLI"'])
      .raw(['branch', '-D', 'master'])
      .raw(['branch', '-m', 'master'])
      .exec(() => {
        clear()
        status.message('Installing composer dependencies')
        try {
          process.chdir(targetDirectory)
          exec(`composer install`, err => {
            if (err) exitWithError(err)
            clear()
            status.message('Installing node dependencies')
            exec(`yarn`, err => {
              if (err) exitWithError(err)
              clear()
              status.message('Running initial build')
              exec(`yarn`, err => {
                if (err) exitWithError(err)
                status.stop()
                console.log(messages.info('Done'))
                process.exit()
              })
            })
          })
        } catch (err) {
          if (err) exitWithError(err)
        }
      })
  })
