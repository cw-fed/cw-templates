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
import { fileURLToPath } from 'node:url'

const cwd = process.cwd()
// 处理识别不了的文件
const renameFiles = {
  '_gitignore': '.gitignore',
  '_eslintrc': '.eslintrc',
} as any

const defaultTargetDir = 'cwfef-vue-app'

const argv = minimist(process.argv.slice(2), { string: ['_'] })

const FRAMEWORKS: Framework[] = makeFrameworks()

const getFrameName = (): unknown[] => R.map(f => f.variants && R.map(v=>v.name || f.name, f.variants), FRAMEWORKS)
const getFrameNameFlatten = (names: unknown[]) => R.flatten(names)
const makeTemplates = R.compose(getFrameNameFlatten, getFrameName)
const templates = makeTemplates()

async function init() {
  const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = R.or(argv.template, argv.t)
  let targetDir = R.or(argTargetDir, defaultTargetDir)

  const promptsCommand = makePromptsCommand()

  let result: prompts.Answers<'framework' | 'packageName' | 'variant'>
  try {
    result = await prompts(promptsCommand, { onCancel: onPromptCancel})
  } catch (e) {
    const error = e as Error
    console.error(error.message) 
    return
  }

  const { framework, packageName, variant } = result
  const root = path.join(cwd, targetDir)
  const template = variant || framework?.name || argTemplate
  const templateDir = path.resolve(fileURLToPath(import.meta.url), '../..', `template-${template}`)

  // 如果没有文件夹，则创建一个
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir)
  }

  const files = fs.readdirSync(templateDir)
  const filesToCreate = filesExcludePkgJson(files)

  // 递归写入文件
  for (const file of filesToCreate) {
    write(file)
  }

  const writePkg = () => {
    const pkg = JSON.parse(getPkg())
    pkg.name = packageName || targetDir
    write('package.json', JSON.stringify(pkg, null, 2))
  }

  writePkg()

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'
  // const isYarn1 = pkgManager === 'yarn' && pkgInfo?.version.startsWith('1.')

  const swichCase = R.cond([
    [
      R.equals('yarn'), () => {
        console.log('yarn')
      }
    ],
    [
      R.equals('npm'), () => {
        console.log('npm install')
      }
    ]
  ])

  swichCase(pkgManager)
  
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
          targetDir = formatTargetDir(state.value) || defaultTargetDir
        }
      },
      {
        name: 'packageName',
        type: () => (isValidPackageName(getProjectName(argTargetDir))) ? null : 'text',
        message: reset('Package name:'),
        initial: () => '',
        validate: (dir) => isValidPackageName(dir) || 'Invalid package name.'
      },
      {
        name: 'framework',
        type: argTemplate && templates.includes(argTemplate) ? null : 'select',
        message:
        typeof argTemplate === 'string' && !(templates.includes(argTemplate))
          ? reset(
              `"${argTemplate}" isn't a valid template. Please choose from below: `,
            )
          : reset('Select a framework:'),
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
        name: 'variant',
        message: reset('Select a variant'),
        type: (framework: Framework) => framework && framework.variants? 'select' : null,
        choices: (framework: Framework) => framework.variants?.map(variant => {
          const variantColor = variant.color
          return {
            title: variantColor(variant.display || variant.name),
            value: variant.name
          }
        })
      }
    ]
  }
}

function filesExcludePkgJson(files: string[]) {
  return files.filter(file => file !== 'package.json')
}

function formatTargetDir(src: string | undefined): string {
  return src?.trim().replace(/^\/|\/$/g, '') || ''
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  const isDir = stat.isDirectory()
  if (isDir) {
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
  return /cw-activity-/.test(name)
}

function getProjectName(targetDir: string): string {
  return targetDir === '.' ? path.basename(path.resolve()) : targetDir
}

function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined
  const pkgSpec = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}
// bootstrap
init().catch(err => {
  console.error(err)
})
