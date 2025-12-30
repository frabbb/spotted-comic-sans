import {UserIcon} from '@sanity/icons'

export default {
  icon: UserIcon,
  name: 'member',
  title: 'Members',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
  ],
}
