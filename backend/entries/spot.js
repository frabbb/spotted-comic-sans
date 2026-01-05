import {CommentIcon} from '@sanity/icons'
import {useAutoGenerateTitle} from '../actions/generateTitle'

export default {
  icon: CommentIcon,
  name: 'spot',
  title: 'Spots',
  type: 'document',
  components: {
    input: (props) => {
      useAutoGenerateTitle(props)
      return props.renderDefault(props)
    },
  },
  search: {
    title: {
      field: 'title',
      weight: 10,
    },
    fields: [
      {field: 'title', weight: 10},
      {field: 'member.title', weight: 8},
      {field: 'media.title', weight: 5},
      {field: 'media.description', weight: 3},
    ],
  },
  fields: [
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
      options: {
        filter: ({search}) => {
          return search
            ? {
                filter: '$search match title || $search match description',
                params: {search},
              }
            : {}
        },
      },
    },
    {
      name: 'title',
      title: 'Generated Title',
      type: 'string',
      readOnly: true,
      description: 'Auto-generated from member and media',
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
      memberTitle: 'member.title',
      mediaTitle: 'media.title',
      title: 'member.title',
      subtitle: 'datetime',
    },
    prepare: ({media, title, mediaTitle, memberTitle, subtitle}) => {
      return {
        title: `${memberTitle} ${mediaTitle ? `- ${mediaTitle}` : ''}`,
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
