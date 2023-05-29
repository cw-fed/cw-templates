import fs from 'node:fs'
import path from 'node:path'
import minimist from 'minimist'
import prompts from 'prompts'
import {
  yellow,
  blue,
  reset,
  red,
  cyan,
  lightBlue,
} from 'kolorist'
import * as R from 'ramda'

import { Framework } from './types'

const cwd = process.cwd()
// 处理识别不了的文件
const renameFiles = {
  '_gitignore': '.gitignore',
} as any

const defaultTargetDir = 'cwfef-next-app'

const argv = minimist(process.argv.slice(2), { string: ['_'] })

const FRAMEWORKS: Framework[] = makeFrameworks()

const templates = R.map(f => R.is(Array, f.variants) && R.map(v=>v.name || f.name, f.variants), FRAMEWORKS)

async function init() {
  // const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = R.or(argv.template, argv.t)
  const targetDir = R.or(argTemplate, templates)

  const promptsCommand = makePromptsCommand()

  let result: prompts.Answers<'framework' | 'projectName' | 'variants'>
  try {
    result = await prompts(promptsCommand, { onCancel: onPromptCancel})
  } catch (error: any) {
   console.error(error.message) 
   return
  }

  const { framework } = result

  const root = path.join(cwd, targetDir)

  const templateDir = path.resolve(import.meta.url, '../..', `${framework}-template`)
  const files = fs.readdirSync(templateDir)
  const filesToCreate = filesExcludePkgJson(files)
  for (const file of filesToCreate) {
    write(file)
  }

  writePkg()
  
  function write(file: string, content?: string) {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  function getPkg() {
    return fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8')
  }

  function writePkg() {
    const pkg = JSON.parse(getPkg())

    pkg.name = result.projectName || targetDir

    write('package.json', JSON.stringify(pkg, null, 2))
  }

  function onPromptCancel() {
    throw new Error(red('x') + ' operation cancelled.')
  }

  function makePromptsCommand(): Array<prompts.PromptObject<any>> {
    return [
      {
        name: 'projectName',
        type: 'text',
        message: reset('Project name:'),
        initial: defaultTargetDir,
        onState: (state) => {
          state.value = formatTargetDir(state.value) || defaultTargetDir
        }
      },
      {
        name: 'packageName',
        type: () => (isValidPackageName(getProjectName())) ? null : 'text',
        message: reset('Package name:'),
        initial: () => '',
        validate: (dir) => isValidPackageName(dir) || 'Invalid package name.'
      },
      {
        name: 'framework',
        type: argTemplate ? null : 'select',
        message: reset('Select a framework'),
        initial: 0,
        choices: FRAMEWORKS.map(frame => {
          const frameWorkColor = frame.color
          return {
            title: frameWorkColor(frame.display),
            value: frame
          }
        })
      },
      {
        name: 'variants',
        message: reset('Select a variant'),
        type: () => 'text',
      }
    ]
  }
}

function filesExcludePkgJson(files: string[]) {
  return files.filter(file => file !== 'package.json')
}

function formatTargetDir(src: string | undefined) {
  return src?.trim().replace(/^\/|\/$/g, '')
}

// function isDirEmpty(src: string) {
//   return fs.readdirSync(src).length === 0
// }

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

function makeFrameworks(): Framework[] {
  return [
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
    },
    {
      name: 'react',
      display: 'React',
      color: yellow,
      variants: [
        {
          name: 'next',
          display: 'Next',
          color: cyan,
        },
        {
          name: 'react',
          display: 'React',
          color: lightBlue,
        }
      ]
    }
  ]
}

function isValidPackageName(name: string) {
  return /test-/.test(name)
}

function getProjectName(): string {
  return path.basename(cwd)
}

// bootstrap
init().catch(err => {
  console.error(err)
})
