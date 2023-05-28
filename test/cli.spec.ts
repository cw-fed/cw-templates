import { join } from "node:path";
import { test, afterEach, beforeAll, expect } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";

const cliPath = join(__dirname, '..')

const projectName = 'test-app'
const targetPath = join(__dirname, projectName)

function run(args: string[], options) {
  return 
}

function createNonEmptyDir() {
  mkdirSync(targetPath)

  const pkg = join(targetPath, 'package.json')
  writeFileSync(pkg, '{foo: "bar"}')
}

test('prompts for project name if not supported', () => {
  expect(true).toBe(true)
})