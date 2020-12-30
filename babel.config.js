/** @type {import("@babel/core").TransformOptions} */
const config = {
  env: {
    development: {
      sourceMaps: "both",
      compact: false,
      presets: [["@babel/env", {targets: {node: "current"}}]],
    },
  },
  presets: [["@babel/env", {targets: {node: "current"}}]],
  plugins: ["@babel/plugin-proposal-class-properties"],
  exclude: ["node_modules"],
};

module.exports = config;
