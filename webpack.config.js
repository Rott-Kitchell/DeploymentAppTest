// Generated using webpack-cli https://github.com/webpack/webpack-cli

import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./src/server.js",
  experiments: {
    topLevelAwait: true,
  },
  resolve: {
    fallback: {
      fs: false,
      os: false,
      path: false,
      tls: false,
      child_process: false,
      dns: false,
      net: false,
      http2: false,
      async_hooks: false,
      fsevents: false,
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
    globalObject: "this",
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new NodePolyfillPlugin(),
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
    ],
  },
};

export default () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
