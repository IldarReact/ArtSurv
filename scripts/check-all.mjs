import { spawn } from 'child_process'

const scripts = [
  { name: 'lint', command: 'pnpm', args: ['lint'] },
  { name: 'typecheck', command: 'pnpm', args: ['typecheck'] },
  { name: 'arch:check', command: 'pnpm', args: ['arch:check'] },
  { name: 'test:coverage', command: 'pnpm', args: ['test:coverage'] },
  { name: 'test:e2e', command: 'pnpm', args: ['test:e2e'] },
  { name: 'dry:check', command: 'pnpm', args: ['dry:check'] },
  { name: 'spell:check', command: 'pnpm', args: ['spell:check'] },
  { name: 'knip', command: 'pnpm', args: ['knip'], softFail: true },
  { name: 'audit:check', command: 'pnpm', args: ['audit:check'], softFail: true },
  { name: 'format:check', command: 'pnpm', args: ['format:check'] },
]

console.log(`Starting ${scripts.length} checks in parallel...\n`)
const startTime = Date.now()

const promises = scripts.map((script) => {
  return new Promise((resolve, reject) => {
    const child = spawn(script.command, script.args, {
      stdio: 'inherit',
      shell: true,
    })

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${script.name} completed successfully.`)
        resolve(code)
      } else if (script.softFail) {
        console.warn(
          `⚠️ ${script.name} failed with exit code ${code}, but is configured as non-blocking.`,
        )
        resolve(code)
      } else {
        console.error(`❌ ${script.name} failed with exit code ${code}.`)
        reject(code)
      }
    })
  })
})

try {
  await Promise.all(promises)
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\n✨ All checks passed successfully in ${duration}s!`)
  process.exit(0)
} catch (error) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.error(`\n💥 One or more checks failed after ${duration}s.`)
  process.exit(1)
}
