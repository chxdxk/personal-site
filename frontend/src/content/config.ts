import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Your Name'),
    tags: z.array(z.string()).default([]),
  }),
});

const travels = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(), // For trips spanning multiple days/months
    location: z.string(),
    country: z.string(),
    featuredImage: z.string(), // URL path relative to site (e.g., /media/travels/paris/hero.jpg)
    images: z.array(z.string()), // Array of URL paths for gallery
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, travels };
