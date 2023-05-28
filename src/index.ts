import * as fs from 'node:fs'
import * as path from 'node:path'
import minirist from 'minimist'
import prompts from 'prompts'

const workDir = process.cwd()

const renameFiles = {
  '_gitignore': '.gitignore',
}
const defaultTargetDir = path.join(workDir, 'dist')

async function init() {}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    copy(src, dest)
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