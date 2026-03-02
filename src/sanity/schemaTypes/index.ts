import { type SchemaTypeDefinition } from 'sanity'
import { postType } from './postType'
import { memberType } from './memberType'
import { sponsorType } from './sponsorType'
import { projectType } from './projectType'
import { activityType } from './activityType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [postType, memberType, sponsorType, projectType, activityType],
}
