import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { todoArgs } from './schema'
import { getCurrentUserOrThrow } from './users'

export const addTodo = mutation({
  args: todoArgs,
  handler: async (
    ctx,
    { status = 'todo', updatedTime = Date.now(), ...args }
  ) => {
    const user = await getCurrentUserOrThrow(ctx)
    await ctx.db.insert('todos', {
      status,
      updatedTime,
      userId: user._id,
      ...args,
    })
  },
})

export const listTodos = query({
  args: {
    status: todoArgs.status,
    order: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
  },
  handler: async (ctx) => {
    const todos = await ctx.db.query('todos').collect()
    return Promise.all(
      todos.map(async (todo) => {
        // For each todo in this channel, fetch the `User` who wrote it and
        // insert their name into the `author` field.
        const user = await ctx.db.get(todo.userId)
        return {
          user: user?.name ?? 'Anonymous',
          ...todo,
        }
      })
    )
  },
})

export const updateTodo = mutation({
  args: {
    id: v.id('todos'),
    ...todoArgs,
    title: v.optional(todoArgs.title),
  },
  handler: async (ctx, args) => {
    const { id, ...properties } = args

    await ctx.db.patch(id, properties)
  },
})

export const deleteTodo = mutation({
  args: { id: v.id('todos') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
