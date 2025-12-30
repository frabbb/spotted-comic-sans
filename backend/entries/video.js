import {VideoIcon} from '@sanity/icons'

export default {
  icon: VideoIcon,
  name: 'videoAsset',
  title: 'Videos',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'file',
      title: 'File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
}
