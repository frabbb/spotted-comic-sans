import {createClient} from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({path: path.join(__dirname, '.env')})

const client = createClient({
  projectId: 'n6ou6qni',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_EDIT_TOKEN,
  apiVersion: '2024-01-01',
})

async function deleteAllSpots() {
  console.log('Fetching all spots...\n')

  // Fetch all spot document IDs
  const spots = await client.fetch('*[_type == "spot"]._id')

  if (spots.length === 0) {
    console.log('No spots found to delete.')
    return
  }

  console.log(`Found ${spots.length} spots. Deleting...\n`)

  // Delete all spots
  for (const spotId of spots) {
    try {
      await client.delete(spotId)
      console.log(`✓ Deleted spot: ${spotId}`)
    } catch (error) {
      console.log(`✗ Error deleting spot ${spotId}: ${error.message}`)
    }
  }

  console.log(`\n✅ Deleted ${spots.length} spots!`)
}

deleteAllSpots().catch((error) => {
  console.error('Delete failed:', error)
  process.exit(1)
})

