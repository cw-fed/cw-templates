import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  outDir: 'dist',
  entries: [
    './src/index'
  ],
  declaration: true,
})
