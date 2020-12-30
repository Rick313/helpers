/**
 * @typedef Config
 * @type {import("@jest/types").Config.InitialOptions}
 */

/** @type {Config} */
const config = {
  verbose: true,
  transform: {"\\.[jt]sx?$": "babel-jest"},
  testMatch: ["**/?(*.)+(spec).js"],
};

module.exports = config;
