#!/usr/bin/env node
/**
 * Cloudflare Workers deploy script
 * Called after opennextjs-cloudflare build completes
 * Uploads worker via wrangler versions upload, then deploys via CF API
 */

import { execSync } from 'child_process'
import https from 'https'

const ACCOUNT_ID = '8b1954d216d65077c6480d62583fe2c2'
const SCRIPT_NAME = 'sovv-web'
const token = process.env.CLOUDFLARE_API_TOKEN

if (!token) {
  console.error('CLOUDFLARE_API_TOKEN not set')
  process.exit(1)
}

console.log('Uploading worker via wrangler versions upload...')

let uploadOutput = ''
try {
  // Use wrangler versions upload - doesn't trigger route registration
  uploadOutput = execSync(
    'OPEN_NEXT_DEPLOY=false pnpm exec wrangler versions upload --message "CF Build"',
    { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, OPEN_NEXT_DEPLOY: 'false' }
    }
  )
  console.log('Upload output:', uploadOutput.slice(-500))
} catch (e) {
  uploadOutput = (e.stdout || '') + (e.stderr || '')
  console.log('Upload output:', uploadOutput.slice(-1000))
  if (!uploadOutput.includes('Version ID')) {
    console.error('Upload failed')
    process.exit(1)
  }
}

// Extract version ID
const match = uploadOutput.match(/Version ID:\s*([a-f0-9-]{36})/i)
if (!match) {
  console.error('Could not find Version ID in:', uploadOutput.slice(-500))
  process.exit(1)
}

const versionId = match[1]
console.log('Version ID:', versionId)

// Deploy via CF API
const body = JSON.stringify({
  versions: [{ version_id: versionId, percentage: 100 }],
  strategy: 'percentage',
  annotations: { 'workers/message': 'CF Build deploy' }
})

const options = {
  hostname: 'api.cloudflare.com',
  path: `/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${SCRIPT_NAME}/deployments`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}

console.log('Deploying version to production...')
const req = https.request(options, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    const result = JSON.parse(data)
    if (result.success) {
      console.log('✓ Deployed successfully!')
      process.exit(0)
    } else {
      console.error('Deploy failed:', JSON.stringify(result.errors))
      process.exit(1)
    }
  })
})
req.on('error', e => { console.error(e); process.exit(1) })
req.write(body)
req.end()
