/* eslint-env node */

const withTypescript = require("@zeit/next-typescript");

module.exports = withTypescript({
  target: "serverless"
});
