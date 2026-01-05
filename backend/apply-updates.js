import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({path: path.join(__dirname, '.env')})

// Initialize Sanity client (same as import-script.js)
const client = createClient({
  projectId: 'n6ou6qni',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_EDIT_TOKEN,
  apiVersion: '2024-01-01',
})

// Apply updates in batches
async function applyUpdates() {
  const updatesPath = path.join(__dirname, 'updates.json')
  
  if (!fs.existsSync(updatesPath)) {
    console.error('❌ updates.json not found. Run generate-updates.js first.')
    process.exit(1)
  }

  const updates = JSON.parse(fs.readFileSync(updatesPath, 'utf-8'))
  
  console.log(`Applying ${updates.length} updates...\n`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  // Process in batches of 10 to avoid rate limiting
  const batchSize = 10
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}...`)
    
    const promises = batch.map(async (update) => {
      try {
        await client
          .patch(update.documentId)
          .set({description: update.description})
          .commit()
        
        console.log(`  ✓ ${update.filename}`)
        return {success: true, update}
      } catch (error) {
        console.error(`  ✗ ${update.filename}: ${error.message}`)
        return {success: false, update, error: error.message}
      }
    })

    const results = await Promise.all(promises)
    
    results.forEach(result => {
      if (result.success) {
        successCount++
      } else {
        errorCount++
        errors.push(result)
      }
    })

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < updates.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Update process completed!')
  console.log(`   Successfully updated: ${successCount}`)
  console.log(`   Errors: ${errorCount}`)
  console.log('='.repeat(50))

  if (errors.length > 0) {
    const errorsPath = path.join(__dirname, 'update-errors.json')
    fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2))
    console.log(`\n   Errors saved to: ${errorsPath}`)
  }
}

// Run the updates
applyUpdates().catch((error) => {
  console.error('Update process failed:', error)
  process.exit(1)
})

