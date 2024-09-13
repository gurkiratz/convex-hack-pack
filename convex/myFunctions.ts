import { ConvexError, v } from 'convex/values'
import { query, mutation, action } from './_generated/server'
import { api } from './_generated/api'

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query function:
export const listIdeas = query({
  // Validators for arguments.
  args: {
    includeRandom: v.boolean(),
  },

  // Query function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    if (args.includeRandom) {
      return await ctx.db.query('ideas').collect()
    } else {
      return await ctx.db
        .query('ideas')
        .filter((q) => q.neq(q.field('random'), true))
        .collect()
    }
  },
})

export const removeIdea = mutation({
  args: { ideaId: v.id('ideas') },
  handler: async (ctx, { ideaId }) => {
    await ctx.db.delete(ideaId)
  },
})

export const newQuery = query({
  args: { name: v.optional(v.string()) },
  handler: (_, { name = 'Gurkirat' }) => {
    return `Hello ${name}. This is a brand new query`
  },
})

// You can write data to the database via a mutation function:
export const saveIdea = mutation({
  args: {
    idea: v.string(),
    random: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existingIdea = await ctx.db
      .query('ideas')
      .filter((q) => q.eq(q.field('idea'), args.idea.toLowerCase()))
      .collect()

    if (existingIdea.length === 0) {
      const newIdeaId = await ctx.db.insert('ideas', args)
      return newIdeaId
    }
    throw new ConvexError('Idea already exists! Think of a new one💡')
  },
})

// You can fetch data from and send data to third-party APIs via an action:
export const fetchRandomIdea = action({
  // Validators for arguments.
  args: {},

  // Action implementation.
  handler: async (ctx) => {
    // Use the browser-like `fetch` API to send HTTP requests.
    // See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    const response = await fetch('https://appideagenerator.com/call.php')
    const idea = await response.text()

    // Write or query data by running Convex mutations/queries from within an action
    await ctx.runMutation(api.myFunctions.saveIdea, {
      idea: idea.trim(),
      random: true,
    })

    // Optionally, return a value from your action
    return idea
  },
})
