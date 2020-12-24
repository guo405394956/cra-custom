import * as path from 'path'
import paths from 'react-scripts/config/paths'
import * as customizeCra from "customize-cra"

const {
  disableChunk,
  adjustStyleLoaders,
  addWebpackExternals
} = customizeCra as any


customizeCra.customBuildConfig = () => (config: any) => {
  const modes: ModesType = {
    cjs: 'cjs',
    umd: 'umd'
  }
  const isProdMode = process.env.NODE_ENV === 'production'
  if (!isProdMode) { return config }

  let mode: string|undefined = process.env.MODE || process.env.mode || process.env.Mode || ''
  if (mode) {
    mode = modes[mode.toLowerCase()]
  } else {
    mode = process.argv.find(arg => arg.indexOf(modes.cjs) !== -1 || arg.indexOf(modes.umd) !== -1)
  }

  if (!mode) {
    return config
  }
  mode = mode.replace(/^-*/, '')

  if (!config.output) {
    config.output = {};
  }
  const outputDir = `dist/${mode}`
  config.output.filename = 'index.js'
  config.output.libraryTarget = mode === modes.cjs ? 'commonjs2' : modes.umd
  paths.appBuild = path.join(path.dirname(paths.appBuild), outputDir)
  config.output.path = path.join(path.dirname(config.output.path), outputDir)
  config.plugins = []
  adjustStyleLoaders((loader:any) => {
    loader.use = loader.use.filter((it: any) => it.loader.indexOf('mini-css-extract-plugin') === -1)
  })(config)
  disableChunk()(config)
  if (mode === modes.cjs) {
    addWebpackExternals([
      '@mcfed/components',
      '@mcfed/core',
      '@mcfed/crud',
      '@mcfed/utils',
      '@mcf/components',
      '@mcf/core',
      '@mcf/crud',
      '@mcf/utils',
      'antd',
      'history',
      'lodash',
      'mcf-components',
      'mcf-crud',
      'mcf-module',
      'mcf-utils',
      'moment',
      'react',
      'react-dom',
      'react-intl',
      'react-redux',
      'react-router',
      'react-router-config',
      'react-router-dom',
      'redux',
      'redux-logger',
      'redux-saga',
      'redux-orm',
      'serviceWorker'
    ])(config)
  }

  return config
}

customizeCra.customEntryConfig = () => (config:any) => {
  // const isDev = process.env.NODE_ENV === 'development'
  // if (!isDev) {
  //   return config
  // }
  const appIndex = path.join(paths.appSrc, 'app')

  // 增加入口文件
  config.entry = [appIndex]

  // // 修改babel-loader的include
  // if (!config.module) {
  //   config.module = {}
  // }
  // if (!config.module.rules || !config.module.rules.length) {
  //   config.module.rules = []
  // }
  // for (const item of (config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf || [])) {
  //   if (item.loader && 
  //       item.loader.indexOf('babel-loader') !== -1 && 
  //       item.options &&
  //       item.options.customize &&
  //       item.options.customize.indexOf('babel-preset-react-app') !== -1
  //     ) {
  //       if (!item.include) {
  //         item.include = []
  //       }
  //       if (!Array.isArray(item.include)) {
  //         item.include = [item.include]
  //       }
  //       item.include.push(app)
  //       item.include.push(appIndex)
  //   }
  // }

  return config
}

customizeCra.customKeepFunctionNameConfig = () => (config: any) => {
  if (!config.optimization || !config.optimization.minimizer) {
    console.error('请启用customkeepFunctionNameConfig的前置配置optimization')
    process.exit(1)
  }
  if (!Array.isArray(config.optimization.minimizer)) {
    config.optimization.minimizer = [config.optimization.minimizer]
  }
  for (const item of config.optimization.minimizer) {
    if (item.constructor && item.constructor.name && item.constructor.name === 'TerserPlugin') {
      if (!item.options || !item.options.terserOptions || !item.options.terserOptions) {
        console.error('请启用customkeepFunctionNameConfig的前置配置TerserPlugin')
        process.exit(1)
      }
      item.options.terserOptions.keep_classnames = true
      item.options.terserOptions.keep_fnames = true
    }
  }
  return config
}

customizeCra.customBabelLoaderInclude = (includePathArray=[]) => (config: any) => {
  
  if (!Array.isArray(includePathArray) || !includePathArray.length) {
    return config
  }

  // 修改babel-loader的include
  if (!config.module) {
    config.module = {}
  }
  if (!config.module.rules || !config.module.rules.length) {
    config.module.rules = []
  }
  for (const item of (config.module.rules.find((rule:any) => Array.isArray(rule.oneOf)).oneOf || [])) {
    if (item.loader && 
        item.loader.indexOf('babel-loader') !== -1 && 
        item.options &&
        item.options.customize &&
        item.options.customize.indexOf('babel-preset-react-app') !== -1
      ) {
        if (!item.include) {
          item.include = []
        }
        if (!Array.isArray(item.include)) {
          item.include = [item.include]
        }
        for (const babelIncluedPath of includePathArray) {
          // const incluePath = path.resolve(paths.appPath, babelIncluedPath)
          item.include.push(babelIncluedPath)
        }
    }
  }
  
  return config
}
customizeCra.customProxyConfig = (proxy:any) => (config:any) => {
  return {
    ...config,
    proxy
  }
}

module.exports = customizeCra