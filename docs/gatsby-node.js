/* eslint-env node */

const path = require("path");

const USE_TASK_PATH = path.resolve(__dirname, "../src");
const USE_TASK_TSCONFIG = path.resolve(__dirname, "../tsconfig.json");

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "use-task": USE_TASK_PATH
      }
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          include: [USE_TASK_PATH],
          use: {
            loader: "awesome-typescript-loader",
            options: {
              configFileName: USE_TASK_TSCONFIG
            }
          }
        }
      ]
    }
  });
};
