/* eslint-env node */

const React = require("react");
const { default: Layout } = require("./src/components/Layout");

exports.wrapPageElement = function PageElement({ element, props }) {
  return <Layout {...props}>{element}</Layout>;
};
