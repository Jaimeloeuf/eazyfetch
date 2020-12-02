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
