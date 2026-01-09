import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({path: path.join(__dirname, '.env')})

// Initialize Sanity client (read-only for finding documents)
const client = createClient({
  projectId: 'n6ou6qni',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_EDIT_TOKEN,
  apiVersion: '2024-01-01',
})

// Parse CSV line and clean invisible Unicode characters
function parseCSVLine(line) {
  // Handle quoted fields properly
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Push the last field
  result.push(current.trim())
  
  // Clean invisible Unicode characters
  return result.map((field) =>
    field
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
      .replace(/^\uFEFF/, '')
      .replace(/^"|"$/g, '') // Remove surrounding quotes
  )
}

// Find media asset and prepare update
async function prepareUpdate(mediaFilename, description) {
  if (!mediaFilename || mediaFilename === 'Media omessi' || !description || description.trim() === '') {
    return null
  }

  // Clean the filename
  const cleanFilename = mediaFilename
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
    .replace(/^\uFEFF/, '')
    .trim()

  // Determine if it's a video or image
  const isVideo =
    cleanFilename.toLowerCase().endsWith('.mp4') ||
    cleanFilename.toLowerCase().endsWith('.opus') ||
    cleanFilename.toLowerCase().endsWith('.avi') ||
    cleanFilename.toLowerCase().endsWith('.mov')

  const assetType = isVideo ? 'videoAsset' : 'imageAsset'

  // Find the asset by title (filename)
  const query = `*[_type == $assetType && title == $title][0]{_id, title, description}`
  const existingAsset = await client.fetch(query, {
    assetType,
    title: cleanFilename,
  })

  if (!existingAsset) {
    return {
      status: 'not_found',
      filename: cleanFilename,
      assetType
    }
  }

  // Check if description already exists and is the same
  if (existingAsset.description === description) {
    return {
      status: 'already_updated',
      filename: cleanFilename,
      documentId: existingAsset._id
    }
  }

  return {
    status: 'needs_update',
    filename: cleanFilename,
    documentId: existingAsset._id,
    assetType,
    description: description
  }
}

// Main function to generate updates
async function generateUpdates() {
  const csvPath = '/Users/francescobonetti/frabbb/progetti/coding/spotted-comic-sans/result/comic_sans_spots_with_text.csv'

  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter((line) => line.trim())

  // Skip header and process data rows
  const dataLines = lines.slice(1)

  console.log(`Analyzing ${dataLines.length} rows...\n`)

  const updates = []
  const notFound = []
  const alreadyUpdated = []
  const skipped = []

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i]
    const fields = parseCSVLine(line)

    // CSV structure: Member,Date,Hour,Media,Description
    const [member, date, hour, media, description] = fields

    try {
      const result = await prepareUpdate(media, description)
      
      if (result) {
        if (result.status === 'needs_update') {
          updates.push(result)
          console.log(`✓ ${result.filename} -> ${result.documentId}`)
        } else if (result.status === 'not_found') {
          notFound.push(result)
          console.log(`⚠ Not found: ${result.filename}`)
        } else if (result.status === 'already_updated') {
          alreadyUpdated.push(result)
        }
      } else {
        skipped.push({media, description})
      }
    } catch (error) {
      console.error(`✗ Error processing row ${i + 2}:`, error.message)
    }
  }

  // Write updates to JSON file
  const outputPath = path.join(__dirname, 'updates.json')
  fs.writeFileSync(outputPath, JSON.stringify(updates, null, 2))

  console.log('\n' + '='.repeat(50))
  console.log('✅ Analysis completed!')
  console.log(`   Needs update: ${updates.length}`)
  console.log(`   Already updated: ${alreadyUpdated.length}`)
  console.log(`   Not found: ${notFound.length}`)
  console.log(`   Skipped (no description or media): ${skipped.length}`)
  console.log(`\n   Updates saved to: ${outputPath}`)
  console.log('='.repeat(50))

  return updates
}

// Run the analysis
generateUpdates().catch((error) => {
  console.error('Analysis failed:', error)
  process.exit(1)
})




