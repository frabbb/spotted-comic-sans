import {ImageIcon} from '@sanity/icons'

export default {
  icon: ImageIcon,
  name: 'imageAsset',
  title: 'Images',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
}
