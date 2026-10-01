import type { StorybookConfig } from '@storybook/angular'

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  framework: {
    name: '@storybook/angular',
    options: {}
  },
  // Serve Angular Material's prebuilt theme to the preview iframe via a
  // <link> tag in preview-head.html — avoids pulling CSS through webpack.
  staticDirs: [
    {
      from: '../../../node_modules/@angular/material/prebuilt-themes',
      to: '/material-theme'
    }
  ]
}

export default config
