/* eslint-env node */

const path = require("path");
const withTypescript = require("@zeit/next-typescript");

const USE_TASK_PATH = path.resolve(__dirname, "../src");
const USE_TASK_TSCONFIG = path.resolve(__dirname, "../tsconfig.json");

function ensure(object, prop) {
  object[prop] = object[prop] || {};
}

module.exports = withTypescript({
  target: "serverless",
  webpack(config) {
    ensure(config, "resolve");
    ensure(config.resolve, "alias");

    config.resolve.alias["use-task"] = USE_TASK_PATH;

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: [USE_TASK_PATH],
      use: {
        loader: "awesome-typescript-loader",
        options: {
          configFileName: USE_TASK_TSCONFIG
        }
      }
    });

    return config;
  }
});
