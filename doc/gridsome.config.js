// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`
const Prism = require('prismjs')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  siteName: 'Rotala',
  siteUrl: process.env.SITE_URL,
  siteDescription: process.env.SITE_DESCRIPTION,
  chainWebpack(config, { isServer }) {
    if (isServer) {
      config.externals(nodeExternals({
        whitelist: [
          /\.css$/,
          /\?vue&type=style/,
          /vue-instantsearch/,
          /instantsearch.js/,
          /typeface-open-sans/
        ]
      }))
    }

    const postcssConfig = ({ prefix = '', purge = false }) => {
      return {
        map: false,
        plugins: [
          require('postcss-import'),
          require('postcss-nested'),
          require('postcss-simple-vars')({ variables: { prefix } }),
          require('tailwindcss'),
          require('autoprefixer'),
          ...process.env.NODE_ENV === 'production' && purge
            ? [
                require('@fullhuman/postcss-purgecss')({
                  content: [
                    './node_modules/docsearch.js/dist/cdn/docsearch.min.css',
                    './src/assets/style/**/*.pcss',
                    './src/**/*.vue',
                    './docs/*.md',
                    './gridsome.config.js'
                  ],
                  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
                })
              ]
            : []
        ]
      }
    }

    // Process styles for Vue components
    config.module
      .rule('postcss')
      .oneOf('normal')
      .use('postcss-loader')
      .tap(() => postcssConfig({ purge: true }))

    // Process styles for rotala theme default light
    config.module
      .rule('postcss-loader-theme')
      .test(/^(?!.*rotala\.components\.).*\.pcss$/g)
      .use('postcss-loader')
      .loader('postcss-loader')
      .tap(() => postcssConfig({ purge: true, prefix: 'ro-' }))

    // Process styles for only rotala components
    config.module
      .rule('postcss-loader-components')
      .test(/rotala.components.pcss/g)
      .use('postcss-loader')
      .loader('postcss-loader')
      .tap(() => postcssConfig({}))

    // Load SVG images
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  },
  plugins: [
    {
      use: '@gridsome/vue-remark',
      options: {
        index: ['introduction'],
        baseDir: './docs',
        pathPrefix: '/docs',
        typeName: 'Doc',
        template: './src/templates/Doc.vue',
        plugins: [
          '@gridsome/remark-prismjs',
          'remark-attr'
        ],
        remark: {
          autolinkHeadings: {
            behavior: 'append',
            linkProperties: {
              className: ['ro-link ro-link-anchor', 'ml-2']
            },
            content: {
              type: 'text',
              value: '#'
            }
          }
        }
      }
    },
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'examples/*.md',
        typeName: 'Example',
        remark: {
          plugins: [
            '@gridsome/remark-prismjs'
          ]
        }
      }
    },
    {
      use: '@gridsome/plugin-google-analytics',
      options: {
        id: process.env.GA_ID
      }
    },
    {
      use: '@gridsome/plugin-sitemap',
      options: {
        cacheTime: 600000
      }
    },
    {
      use: 'gridsome-plugin-robots-txt',
      options: {
        host: process.env.SITE_URL,
        sitemap: process.env.SITE_URL + '/sitemap.xml',
        policy: [
          {
            userAgent: "Googlebot",
            allow: "/",
            disallow: "/search",
            crawlDelay: 2
          },
          {
            userAgent: "*",
            allow: "/",
            disallow: "/search",
            crawlDelay: 10,
            cleanParam: "ref /docs/"
          }
        ]
      }
    }
  ]
}

