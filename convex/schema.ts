import { defineSchema, defineTable } from 'convex/server'
import { Infer, v } from 'convex/values'
import { Id } from './_generated/dataModel'
import { authTables } from '@convex-dev/auth/server'

export const todoFields = v.object({
  title: v.string(),
  status: v.optional(
    v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done'))
  ),
  updatedTime: v.optional(v.number()),
  userId: v.id('users'),
})

export const todoArgs = {
  title: v.string(),
  status: v.optional(
    v.union(v.literal('todo'), v.literal('in-progress'), v.literal('done'))
  ),
  updatedTime: v.optional(v.number()),
}

export type TodoType = Infer<typeof todoFields> & {
  _id: Id<'todos'>
  _creationTime: number
}

export default defineSchema(
  {
    ...authTables,

    ideas: defineTable({
      idea: v.string(),
      random: v.boolean(),
    }),

    todos: defineTable(todoFields).index('byUserId', ['userId']),

    users: defineTable({
      name: v.string(),
      // this is the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
    }).index('byExternalId', ['externalId']),
  },
  { schemaValidation: true }
)
