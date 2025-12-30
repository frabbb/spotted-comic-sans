import {CommentIcon} from '@sanity/icons'

export default {
  icon: CommentIcon,
  name: 'spot',
  title: 'Spots',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'member',
      title: 'Member',
      type: 'reference',
      to: [{type: 'member'}],
    },
    {
      name: 'media',
      title: 'Media',
      type: 'reference',
      to: [{type: 'imageAsset'}, {type: 'videoAsset'}],
    },
    {
      name: 'datetime',
      title: 'Date & Time',
      type: 'datetime',
    },
  ],
  preview: {
    select: {
      media: 'media.image',
      title: 'member.title',
      subtitle: 'datetime',
    },
    prepare: ({media, title, subtitle}) => {
      return {
        title: title,
        subtitle: new Date(subtitle).toLocaleDateString('it-IT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        media: media,
      }
    },
  },
  // preview: {
  //   select: {
  //     title: 'title',
  //     member: 'member.title',
  //     media: 'media.image.0.title',
  //     datetime: 'datetime',
  //   },
  //   prepare: ({title, member, media, datetime}) => {
  //     console.log(media)
  //     return {
  //       title: member,
  //       subtitle: datetime,
  //     }
  //   },
  // },
}
