import {defineType, defineField} from 'sanity'

export const activityType = defineType({
  name: 'activity', title: 'Activity', type: 'document', fields: [
    defineField({
      name: 'title', title: 'Title', type: 'string'}),
    defineField({
      name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'link', title: 'Link', type: 'url'}),
  ]})