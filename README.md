# Notely

A simple, privacy-focused journaling app.

Notely runs entirely in your web browser, loading markdown files directly from a local folder you choose. Write your notes in markdown.

## Key Features

1. Daily Prompts: Get a journaling prompt each day to inspire your writing.
2. Note Retrospectives: Reflect on your recent notes with a summarized overview. Use this feature to analyze, plan, and organize your thoughts effectively.
3. Privacy Matters: Notely doesn’t save anything on external servers—it only works with your local files.
4. By default, Notely uses OpenAI’s GPT-4o to analyze your notes. To use this feature, you’ll need to provide your API key.

[Coming Soon]: Support for connecting to a locally hosted AI model is on the way!

## Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
