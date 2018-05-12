const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const mkdirp = require('mkdirp')
const { spawn } = require('child-process-promise')

const { prettyln, usageExit } = require('./goqoo')

const createPackageJson = require('../defaultFiles/package-json')
const gitignore = promisify(fs.readFile)(path.join(__dirname, '../defaultFiles/gitignore'), 'utf8')
const eslintrc = promisify(fs.readFile)(path.join(__dirname, '../defaultFiles/eslintrc.yml'), 'utf8')
const prettierrc = promisify(fs.readFile)(path.join(__dirname, '../defaultFiles/prettierrc.yml'), 'utf8')
const webpackConfig = promisify(fs.readFile)(path.join(__dirname, '../defaultFiles/webpack.config.js.txt'), 'utf8')

const validateOptions = async opts => {
  if (!opts.target) {
    usageExit(1)
  }
}

const goqooNew = async opts => {
  validateOptions(opts)
  const projectName = opts.target

  // プロジェクトディレクトリ作成
  const dirPath = path.resolve(projectName)
  mkdirp.sync(dirPath)
  console.log(dirPath)

  // Git初期化
  fs.writeFileSync(path.join(projectName, '.gitignore'), await gitignore)
  console.log('.gitignore: created!')
  const gitInit = spawn('git', ['init'], { cwd: dirPath })
  gitInit.childProcess.stderr.on('data', data => {
    console.error(data.toString())
  })
  gitInit.childProcess.stdout.on('data', data => {
    console.log(data.toString())
  })
  await gitInit
  console.log('`git init`:  done!')

  // npm初期化、パッケージインストール
  const packageJson = createPackageJson(projectName)
  const packageJsonPath = path.resolve(path.join(projectName, 'package.json'))
  fs.writeFileSync(packageJsonPath, prettyln(packageJson))
  console.log('package.json: created!')
  const yarnInstall = spawn('yarn', ['install'], { cwd: dirPath })
  yarnInstall.childProcess.stderr.on('data', data => {
    console.error(data.toString())
  })
  yarnInstall.childProcess.stdout.on('data', data => {
    console.log(data.toString())
  })
  await yarnInstall
  console.log('`yarn install`:  done!')

  // webpack初期設定
  const webpackConfigJsPath = path.resolve(path.join(projectName, 'webpack.config.js'))
  fs.writeFileSync(webpackConfigJsPath, await webpackConfig)
  console.log('webpack.config.js: created!')

  // ESLint初期設定
  const eslintrcPath = path.resolve(path.join(projectName, '.eslintrc.yml'))
  fs.writeFileSync(eslintrcPath, await eslintrc)
  console.log('.eslintrc.yml: created!')

  // Prettier初期設定
  const prettierrcPath = path.resolve(path.join(projectName, '.prettierrc.yml'))
  fs.writeFileSync(prettierrcPath, await prettierrc)
  console.log('.prettierrc.yml: created!')
}

module.exports = {
  goqooNew,
}