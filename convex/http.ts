import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'
import type { WebhookEvent } from '@clerk/backend'
import { Webhook } from 'svix'

const http = httpRouter()

http.route({
  path: '/hello',
  method: 'POST',
  handler: httpAction(async () => {
    return new Response('hello world')
  }),
})

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {

    const event = await validateRequest(request)
    if (!event) {
      return new Response('Error occured', { status: 400 })
    }
    console.log(event.type)
    switch (event.type) {
      
      case 'user.created':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        })
        break
      case 'user.updated':
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        })
        break

      case 'user.deleted': {
        const clerkUserId = event.data.id!
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId })
        break
      }
      default:
        console.log('Ignored Clerk webhook event', event.type)
    }

    return new Response(null, { status: 200 })
  }),
})

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payload = await req.json()
  const payloadString = JSON.stringify(payload)
  // const payloadString = await req.text()
  const svixHeaders = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  }
  // const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  const wh = new Webhook(import.meta.env.VITE_CLERK_WEBHOOK_SECRET!)
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent
  } catch (error) {
    console.error('Error verifying webhook event', error)
    return null
  }
}

export default http
