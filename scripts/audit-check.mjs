import { spawn } from 'child_process'

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    let output = ''

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString()
      output += text
      process.stdout.write(text)
    })

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString()
      output += text
      process.stderr.write(text)
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject({
        code,
        command,
        output,
      })
    })
  })
}

function isKnownExternalAuditFailure(output) {
  return (
    output.includes('This endpoint is being retired. Use the bulk advisory endpoint instead') ||
    output.includes('ERR_PNPM_AUDIT_BAD_RESPONSE') ||
    output.includes("Cannot read properties of null (reading 'matches')")
  )
}

try {
  await run('pnpm', ['audit', '--audit-level', 'high'])
} catch (error) {
  if (isKnownExternalAuditFailure(error.output ?? '')) {
    console.warn('\n[warn] Audit check skipped due to external package manager audit failure.')
    console.warn('[warn] This is not treated as a project code failure for pre-push.\n')
    process.exit(0)
  }

  throw new Error(
    `${error.command ?? 'audit command'} failed with exit code ${String(error.code ?? 1)}`,
  )
}
