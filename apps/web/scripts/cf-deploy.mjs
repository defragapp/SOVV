#!/usr/bin/env node
/**
 * Cloudflare Workers deploy script
 * Uploads the built worker and deploys it via CF API
 * Bypasses wrangler's open-next auto-detection
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import https from 'https'

const ACCOUNT_ID = '8b1954d216d65077c6480d62583fe2c2'
const SCRIPT_NAME = 'sovv-web'
const token = process.env.CLOUDFLARE_API_TOKEN

if (!token) {
  console.error('CLOUDFLARE_API_TOKEN not set')
  process.exit(1)
}

// Upload via wrangler versions upload (no open-next detection)
console.log('Uploading worker version...')
let uploadOutput
try {
  uploadOutput = execSync(
    'OPEN_NEXT_DEPLOY=false npx wrangler versions upload --env production --message "CF Build"',
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  )
} catch (e) {
  uploadOutput = (e.stdout || '') + (e.stderr || '')
  console.log('Upload output:', uploadOutput)
}

// Extract version ID
const match = uploadOutput.match(/Version ID:\s*([a-f0-9-]+)/)
if (!match) {
  console.error('Could not find Version ID in output:', uploadOutput)
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