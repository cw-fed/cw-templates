import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import minimist from 'minimist'
import prompts from 'prompts'
import {
  yellow,
  blue,
  reset,
  red,
} from 'kolorist'

const cwd = process.cwd()
const renameFiles = {
  '_gitignore': '.gitignore',
}
const defaultTargetDir = 'cw-vite-app'

const argv = minimist(process.argv.slice(2), { string: ['_'] })

const FRAMEWORKS: Framework[] = [
  {
    name: 'vue',
    display: 'Vue',
    color: yellow,
    variants: [
      {
        name: 'vue',
        display: 'Vue',
        color: blue
      }
    ]
  }
]

const promptsCommand:Array<prompts.PromptObject<any>> = [
  {
    name: 'projectName',
    type: 'text',
    message: reset('Project name:'),
    initial: defaultTargetDir,
    onState: (state) => {
      state.value = formatTargetDir(state.value) || defaultTargetDir
    }
  }
]

function onPromptCancel() {
  throw new Error(red('x') + ' operation cancelled.')
}

const templates = FRAMEWORKS.map(f => f.variants && f.variants.map(v=> v.name || f.name)).reduce((a, b) => a.concat(b), [])

async function init() {
  const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = argv.template || argv.t
  const targetDir = argTargetDir || defaultTargetDir

  let result: prompts.Answers<'framework' | 'projectName' | 'variant' | ''>
  try {
    result = await prompts(promptsCommand, { onCancel: onPromptCancel})
  } catch (error: any) {
   console.error(error.message) 
   return
  }

  const { framework } = result

  const root = path.join(cwd, targetDir)
}

function handleArgv() {}

function formatTargetDir(src: string | undefined) {
  return src?.trim().replace(/^\/|\/$/g, '')
}

function isEmpty(src: string) {
  return fs.readdirSync(src).length === 0
}

function write(file: string, content?: string) {

}

function handleCommand() {}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true })
  const files = fs.readdirSync(src)
  files.forEach(file => {
    const srcFile = path.join(src, file)
    const destFile = path.join(dest, file)
    copy(srcFile, destFile)
  })
}

// bootstrap
init().catch(err => {
  console.error(err)
})