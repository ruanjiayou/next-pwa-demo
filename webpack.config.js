import path from 'path'
import nodeExternals from 'webpack-node-externals'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  //入口文件
  entry: {
    index: "./index.js",
  },
  //出口文件
  output: {
    path: path.resolve(__dirname, "build"),
    module: true,
    filename: "[name].js"
  },
  mode: "production",
  experiments: {
    outputModule: true
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },
  externalsPresets: { node: true },
  externals: [nodeExternals({ importType: 'module' })],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          // Use `.swcrc` to configure swc
          loader: "swc-loader"
        }
      }
    ]
  }
}