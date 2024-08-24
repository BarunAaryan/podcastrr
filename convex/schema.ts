import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    podcasts: defineTable({
        audioStorageId: v.optional(v.id('_storage')),
        user: v.id('users'), //pointing to the users table
        podcastTitle: v.string(),
        podcastDescription: v.string(),
        audioUrl: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        imageStorageId: v.optional(v.id('_storage')),
        author: v.string(),
        authorId: v.string(),
        authorImageUrl: v.string(),
        voicePrompt: v.string(), //choosing what the AI will be saying
        imagePrompt: v.string(), //to generate ai thumbnail
        voiceType: v.string(), //we can choose between multiple audio types
        audioDuration: v.number(),
        views: v.number(),

    })
    .searchIndex('search_author', {searchField: 'author'})
    .searchIndex('search_title', {searchField: 'podcastTitle'})
    .searchIndex('search_body', {searchField: 'podcastDescription'}),
    //users table
    users: defineTable({
        email: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        name: v.string(),
    })
})