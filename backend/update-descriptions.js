import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({path: path.resolve(__dirname, '.env')})

const client = createClient({
  projectId: 'n6ou6qni',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_EDIT_TOKEN,
  apiVersion: '2024-01-01',
})

// Transform description according to requirements
function transformDescription(description) {
  if (!description || typeof description !== 'string') {
    return description
  }
  
  return description
    .toLowerCase()
    .replace(/[_,-]/g, ' ')
}

async function updateDescriptions() {
  console.log('Fetching all images and videos...\n')

  // Fetch ALL fields for imageAsset and videoAsset documents
  const query = `*[_type in ["imageAsset", "videoAsset"]]`
  
  const documents = await client.fetch(query)

  if (documents.length === 0) {
    console.log('No images or videos found.')
    return
  }

  console.log(`Found ${documents.length} documents to process.\n`)

  // Filter only documents that need updating (have a description that will change)
  const updates = documents
    .filter(doc => {
      if (!doc.description) return false
      const transformed = transformDescription(doc.description)
      return transformed !== doc.description
    })
    .map(doc => ({
      ...doc,
      oldDescription: doc.description,
      newDescription: transformDescription(doc.description),
    }))

  if (updates.length === 0) {
    console.log('✓ All descriptions are already in the correct format!')
    return
  }

  console.log(`${updates.length} documents need updating.\n`)
  console.log('Preview of changes:')
  console.log('='.repeat(80))
  
  // Show first 5 examples
  updates.slice(0, 5).forEach(update => {
    console.log(`\n📄 ${update.title || 'Untitled'} (${update._type})`)
    console.log(`   Old: "${update.oldDescription}"`)
    console.log(`   New: "${update.newDescription}"`)
  })
  
  if (updates.length > 5) {
    console.log(`\n... and ${updates.length - 5} more`)
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('\nStarting updates...\n')

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
        // Create a new document with updated description
        const updatedDoc = {
          ...update,
          description: update.newDescription,
        }
        
        // Remove the temporary fields
        delete updatedDoc.oldDescription
        delete updatedDoc.newDescription
        
        // Use createOrReplace to update the document
        await client.createOrReplace(updatedDoc)
        
        console.log(`  ✓ ${update.title || 'Untitled'}`)
        return {success: true, update}
      } catch (error) {
        console.error(`  ✗ ${update.title || 'Untitled'}: ${error.message}`)
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

  console.log('\n' + '='.repeat(80))
  console.log('✅ Update process completed!')
  console.log(`   Successfully updated: ${successCount}`)
  console.log(`   Errors: ${errorCount}`)
  console.log('='.repeat(80))

  if (errors.length > 0) {
    console.log('\nErrors:')
    errors.forEach(({update, error}) => {
      console.log(`  - ${update.title || 'Untitled'} (${update._id}): ${error}`)
    })
  }
}

// Run the updates
updateDescriptions().catch((error) => {
  console.error('Update process failed:', error)
  process.exit(1)
})

