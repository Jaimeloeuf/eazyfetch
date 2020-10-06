/**
 * Webpack configuration file for compiling relayer server into a single output file
 * @author JJ
 *
 * This config file is built with references to:
 * @link https://medium.com/code-oil/webpack-javascript-bundling-for-both-front-end-and-back-end-b95f1b429810
 * @link https://www.codementor.io/@lawwantsin/compiling-our-express-server-with-webpack-lds4xof0y
 */

const path = require("path");

module.exports = {
  mode: "production",
  target: "web",
  entry: "./src/index.ts",
  // https://webpack.js.org/guides/author-libraries/#expose-the-library
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "index.js",
    library: "easyfetch",
    libraryTarget: "umd",
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add ".ts" as resolvable extensions.
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      // All files with ".ts" extension will be handled by "ts-loader".
      { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/ },

      // All output ".js" files will have any sourcemaps re-processed by "source-map-loader".
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },
};
