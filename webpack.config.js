const MinimizerPlugin = require("minimizer-webpack-plugin");

module.exports = (env) => {
  const options = {
    entry: "./src/index.js",
    output: {
      filename: "webextension-contextmenu.js",
      library: "WebextensionContextMenu",
      libraryTarget: "umd",
      libraryExport: "default",
      globalObject: "this",
    },
    mode: "development",
    watch: true,

    stats: {
      colors: true,
    },

    devtool: false,
  };

  if (env.production) {
    options.optimization = {
      minimize: true,
      minimizer: [new MinimizerPlugin()],
    };
    options.output.filename = "webextension-contextmenu.min.js";
  }

  return options;
};
