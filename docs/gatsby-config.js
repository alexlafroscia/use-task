/* eslint-env node */

module.exports = {
  siteMetadata: {
    title: `useTask`,
    description: `Documentation for useTask`,
    author: `@alexlafroscia`
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png` // This path is relative to the root of the site.
      }
    },
    {
      resolve: `gatsby-plugin-material-ui`,
      options: {
        theme: {
          typography: {
            useNextVariants: true,
            h1: {
              fontSize: "3rem"
            },
            h2: {
              fontSize: "2rem"
            },
            h3: {
              fontSize: "1.5rem"
            }
          }
        }
      }
    },
    `gatsby-plugin-typescript`,
    `gatsby-mdx`,
    `gatsby-plugin-offline`
  ]
};
