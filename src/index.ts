import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import minimist from 'minimist'
import prompts from 'prompts'
import {
  yellow,
  blue,
  green,

} from 'kolorist'

const cwd = process.cwd()
const renameFiles = {
  '_gitignore': '.gitignore',
}
const defaultTargetDir = path.join(cwd, 'dist')

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

const templates = FRAMEWORKS.map(f => f.variants && f.variants.map(v=> v.name || f.name)).reduce((a, b) => a.concat(b), [])

async function init() {
  
}

function isEmpty(src: string) {
  return fs.readdirSync(src).length === 0
}

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