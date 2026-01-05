import {useEffect} from 'react'
import {useFormValue, set, unset} from 'sanity'

export function useAutoGenerateTitle(props) {
  const {onChange} = props
  const member = useFormValue(['member'])
  const media = useFormValue(['media'])

  useEffect(() => {
    async function generateTitle() {
      if (!member?._ref && !media?._ref) return

      try {
        // Fetch the referenced documents to get their titles
        const {createClient} = await import('@sanity/client')
        const client = createClient({
          projectId: 'n6ou6qni',
          dataset: 'production',
          useCdn: false,
          apiVersion: '2024-01-01',
        })

        const queries = []
        if (member?._ref) {
          queries.push(client.fetch(`*[_id == $id][0]{title}`, {id: member._ref}))
        } else {
          queries.push(Promise.resolve(null))
        }

        if (media?._ref) {
          queries.push(client.fetch(`*[_id == $id][0]{title}`, {id: media._ref}))
        } else {
          queries.push(Promise.resolve(null))
        }

        const [memberDoc, mediaDoc] = await Promise.all(queries)

        console.log('Member doc:', memberDoc)
        console.log('Media doc:', mediaDoc)

        const memberTitle = memberDoc?.title || ''
        const mediaTitle = mediaDoc?.title || ''

        if (memberTitle || mediaTitle) {
          const generatedTitle = [memberTitle, mediaTitle].filter(Boolean).join(' - ')

          console.log('Generated title:', generatedTitle)

          // Use onChange with a patch to set the title
          onChange(set(generatedTitle, ['title']))
        }
      } catch (error) {
        console.error('Error generating title:', error)
      }
    }

    generateTitle()
  }, [member?._ref, media?._ref, onChange])

  return null
}
