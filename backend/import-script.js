import {createClient} from '@sanity/client'
import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({path: path.join(__dirname, '.env')})

// Initialize Sanity client
const client = createClient({
  projectId: 'n6ou6qni',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_EDIT_TOKEN,
  apiVersion: '2024-01-01',
})

// Parse CSV line and clean invisible Unicode characters
function parseCSVLine(line) {
  const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/
  return line.split(regex).map((field) =>
    field
      .trim()
      // Remove all Unicode direction marks and invisible characters
      .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '')
      // Remove BOM
      .replace(/^\uFEFF/, ''),
  )
}

// Parse Italian date format (DD/MM/YYYY HH:MM)
function parseDate(dateStr, timeStr) {
  const [day, month, year] = dateStr.split('/')
  const [hours, minutes] = timeStr.split(':')
  return new Date(year, month - 1, day, hours, minutes).toISOString()
}

// Find or create member
async function findOrCreateMember(memberName) {
  // Clean member name (remove emojis and extra characters)
  const cleanName = memberName.replace(/[^\w\s+\-]/g, '').trim()

  // Check if member exists
  const query = '*[_type == "member" && title == $title][0]'
  const existingMember = await client.fetch(query, {title: memberName})

  if (existingMember) {
    console.log(`  ✓ Found existing member: ${memberName}`)
    return existingMember._id
  }

  // Create new member
  console.log(`  → Creating new member: ${memberName}`)
  const member = await client.create({
    _type: 'member',
    title: memberName,
  })

  return member._id
}

// Upload image asset
async function uploadImageAsset(filename, mediaPath) {
  const filePath = path.join(mediaPath, filename)

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ Image file not found: ${filename}`)
    return null
  }

  // Check if imageAsset with this title already exists
  const existingQuery = '*[_type == "imageAsset" && title == $title][0]'
  const existingAsset = await client.fetch(existingQuery, {title: filename})

  if (existingAsset) {
    console.log(`  ✓ Found existing image asset: ${filename}`)
    return existingAsset._id
  }

  console.log(`  → Uploading image: ${filename}`)

  try {
    // Upload image to Sanity
    const imageAssetBuffer = fs.readFileSync(filePath)
    const uploadedImage = await client.assets.upload('image', imageAssetBuffer, {
      filename: filename,
    })
    console.log(`  ✓ Image uploaded to Sanity: ${uploadedImage._id}`)

    // Create imageAsset document
    const imageDoc = await client.create({
      _type: 'imageAsset',
      title: filename,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: uploadedImage._id,
        },
      },
    })

    console.log(`  ✓ Created image asset document: ${imageDoc._id}`)
    return imageDoc._id
  } catch (error) {
    console.log(`  ✗ Error uploading image: ${error.message}`)
    return null
  }
}

// Upload video asset
async function uploadVideoAsset(filename, mediaPath) {
  const filePath = path.join(mediaPath, filename)

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ Video file not found: ${filename}`)
    return null
  }

  // Check if videoAsset with this title already exists
  const existingQuery = '*[_type == "videoAsset" && title == $title][0]'
  const existingAsset = await client.fetch(existingQuery, {title: filename})

  if (existingAsset) {
    console.log(`  ✓ Found existing video asset: ${filename}`)
    return existingAsset._id
  }

  console.log(`  → Uploading video: ${filename}`)

  try {
    // Upload video to Sanity
    const videoAssetBuffer = fs.readFileSync(filePath)
    const uploadedVideo = await client.assets.upload('file', videoAssetBuffer, {
      filename: filename,
    })
    console.log(`  ✓ Video uploaded to Sanity: ${uploadedVideo._id}`)

    // Create videoAsset document
    const videoDoc = await client.create({
      _type: 'videoAsset',
      title: filename,
      file: {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: uploadedVideo._id,
        },
      },
    })

    console.log(`  ✓ Created video asset document: ${videoDoc._id}`)
    return videoDoc._id
  } catch (error) {
    console.log(`  ✗ Error uploading video: ${error.message}`)
    return null
  }
}

// Create spot document
async function createSpot(memberName, dateStr, timeStr, mediaFilename, mediaPath) {
  console.log(`\nProcessing spot: ${memberName} - ${dateStr} ${timeStr}`)

  // Get or create member
  const memberId = await findOrCreateMember(memberName)

  // Parse datetime
  const datetime = parseDate(dateStr, timeStr)

  // Handle media first to get the media ID for duplicate check
  let mediaId = null
  if (mediaFilename && mediaFilename !== 'Media omessi') {
    const isVideo =
      mediaFilename.toLowerCase().endsWith('.mp4') || mediaFilename.toLowerCase().endsWith('.opus')

    if (isVideo) {
      mediaId = await uploadVideoAsset(mediaFilename, mediaPath)
    } else {
      mediaId = await uploadImageAsset(mediaFilename, mediaPath)
    }
  } else {
    console.log('  → No media to upload (Media omessi)')
  }

  // Check if spot with same member, datetime AND media already exists
  let existingSpotQuery
  let queryParams

  if (mediaId) {
    // If there's media, check for member + datetime + media combination
    existingSpotQuery = `*[_type == "spot" && member._ref == $memberId && datetime == $datetime && media._ref == $mediaId][0]`
    queryParams = {memberId, datetime, mediaId}
  } else {
    // If no media, check for member + datetime + no media
    existingSpotQuery = `*[_type == "spot" && member._ref == $memberId && datetime == $datetime && !defined(media)][0]`
    queryParams = {memberId, datetime}
  }

  const existingSpot = await client.fetch(existingSpotQuery, queryParams)

  if (existingSpot) {
    // Skip if exact spot already exists (same member + datetime + media)
    console.log(`  ℹ Spot already exists, skipping: ${existingSpot._id}`)
    return existingSpot
  }

  // Create new spot document
  const spotData = {
    _type: 'spot',
    title: `${memberName} - ${dateStr}`,
    member: {
      _type: 'reference',
      _ref: memberId,
    },
    datetime: datetime,
  }

  // Add media reference if exists
  if (mediaId) {
    spotData.media = {
      _type: 'reference',
      _ref: mediaId,
    }
  }

  const spot = await client.create(spotData)
  console.log(`  ✓ Created spot: ${spot._id}`)

  return spot
}

// Main import function
async function importSpots() {
  const csvPath = path.join(__dirname, 'data.csv')
  const mediaPath = path.join(__dirname, '../../data')

  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter((line) => line.trim())

  // Skip header and process ALL data rows
  const dataLines = lines.slice(1)

  console.log(`Starting import of ${dataLines.length} rows...\n`)

  for (const line of dataLines) {
    const [member, date, time, media] = parseCSVLine(line)

    try {
      await createSpot(member, date, time, media, mediaPath)
    } catch (error) {
      console.error(`  ✗ Error processing row:`, error.message)
    }
  }

  console.log('\n✅ Import completed!')
}

// Run the import
importSpots().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
