//used to define web hook call
//we use webhooks to receive data from external applications such as clerk in our case
// ===== reference links =====
// https://www.convex.dev/templates (open the link and choose for clerk than you will get the github link mentioned below)
// https://github.dev/webdevcody/thumbnail-critique/blob/6637671d72513cfe13d00cb7a2990b23801eb327/convex/schema.ts

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
//svix - to validate web recalls


const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validateRequest(request);
  if (!event) {
    return new Response("Error occured", {
      status: 400,
    });
  } //-> This webhook will be called once we login through clerk login screen, now after that user.ts will insert new user into the database
  switch (event.type) {
    case "user.created": // intentional fallthrough
    await ctx.runMutation(internal.users.createUser, {
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address, //this is how clerk fetches the email address
        imageUrl: event.data.image_url,
        name: event.data.first_name!,
    });
    break;
    case "user.updated":
        await ctx.runMutation(internal.users.updateUser, {
          clerkId: event.data.id,
          imageUrl: event.data.image_url,
          email: event.data.email_addresses[0].email_address,
        });
        break;
      case "user.deleted":
        await ctx.runMutation(internal.users.deleteUser, {
          clerkId: event.data.id as string,
        });
        break;
    }
    return new Response(null, {
      status: 200,
    });
  });
  
  const http = httpRouter();
  
  http.route({
    path: "/clerk",
    method: "POST",
    handler: handleClerkWebhook,
  });
  
  const validateRequest = async (
    req: Request
  ): Promise<WebhookEvent | undefined> => {
    //key note add the webhook secret variable to the environmanment 
    //TODO- update CLERK_WEBHOOK_SECRET
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not defined");
    }
    const payloadString = await req.text();
    const headerPayload = req.headers;
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id")!,
      "svix-timestamp": headerPayload.get("svix-timestamp")!,
      "svix-signature": headerPayload.get("svix-signature")!,
    };
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payloadString, svixHeaders);
    return event as unknown as WebhookEvent;
  };
  
  export default http;
   