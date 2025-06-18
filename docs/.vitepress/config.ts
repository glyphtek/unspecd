import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Unspec'd Framework",
  description: "A declarative UI framework for building internal tools and dashboards with TypeScript",
  base: '/unspecd/',
  
  // Ignore dead links during development
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: "Unspec'd Framework | Declarative UI for Internal Tools" }],
    ['meta', { property: 'og:site_name', content: "Unspec'd Framework" }],
    ['meta', { property: 'og:image', content: 'https://glyphtek.github.io/unspecd/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://glyphtek.github.io/unspecd/' }]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v1.1.0',
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/glyphtek/unspecd/blob/main/CHANGELOG.md'
          },
          {
            text: 'Contributing',
            link: 'https://github.com/glyphtek/unspecd/blob/main/CONTRIBUTING.md'
          }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Unspec\'d?', link: '/guide/what-is-unspecd' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Tool Specifications', link: '/guide/tool-specifications' },
            { text: 'Components', link: '/guide/components' },
            { text: 'Focus Mode vs Normal Mode', link: '/guide/modes' }
          ]
        },
        {
          text: 'Components',
          items: [
            { text: 'Display Record', link: '/guide/components/display-record' },
            { text: 'Editable Table', link: '/guide/components/editable-table' },
            { text: 'Edit Form', link: '/guide/components/edit-form' },
            { text: 'Action Button', link: '/guide/components/action-button' },
            { text: 'Streaming Table', link: '/guide/components/streaming-table' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Library Mode', link: '/guide/library-mode' },
            { text: 'CLI Usage', link: '/guide/cli' },
            { text: 'Server Configuration', link: '/guide/server-config' },
            { text: 'Custom Styling', link: '/guide/styling' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'UnspecdUI', link: '/api/unspecd-ui' },
            { text: 'startServer', link: '/api/start-server' },
            { text: 'ToolSpec', link: '/api/tool-spec' },
            { text: 'Components', link: '/api/components' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'User Role Editor', link: '/examples/user-role-editor' },
            { text: 'Live Dashboard', link: '/examples/live-dashboard' },
            { text: 'Data Tables', link: '/examples/data-tables' },
            { text: 'Forms', link: '/examples/forms' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/glyphtek/unspecd' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 GlyphTek'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/glyphtek/unspecd/edit/main/docs/:path'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
}) 