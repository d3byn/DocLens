# DocLens

DocLens lets you upload a document and ask questions about it. Answers come only from the document's content, and each one lists the passages it was based on.

## Features

- Upload PDF or plain-text files (up to 10 MB)
- Ask questions in plain language and get answers based only on the document
- See the source passages behind each answer, with similarity scores
- Says so when the document doesn't contain the answer

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router) with React 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [Google Gemini API](https://ai.google.dev) for embeddings and answers
- [unpdf](https://github.com/unjs/unpdf) for reading text from PDFs

## How It Works

1. **Extract:** The uploaded file's text is read.
2. **Chunk:** The text is split into overlapping chunks of about 800 characters, breaking at sentence ends.
3. **Embed:** Each chunk is turned into a vector with `gemini-embedding-2` and kept in memory.
4. **Retrieve:** The question is embedded too, and the 4 chunks most similar to it (by cosine similarity) are picked.
5. **Answer:** If the best chunk scores at least 0.65, those chunks go to `gemini-3.1-flash-lite` with instructions to answer only from them. Otherwise, DocLens replies that it couldn't find the answer.

## Getting Started

### Prerequisites

- Node.js 20 or later
- A [Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
git clone <repository-url>
cd doclens
npm install
```

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                   |
| --------------- | ----------------------------- |
| `npm run dev`   | Start the development server  |
| `npm run build` | Build for production          |
| `npm run start` | Start the production server   |
| `npm run lint`  | Run ESLint                    |

## API

### `POST /api/upload`

Takes a file upload (`multipart/form-data`, field name `file`), then extracts, chunks and embeds the document.

```json
{ "success": true, "chunkCount": 12 }
```

### `POST /api/ask`

Answers a question about the uploaded documents.

```json
// Request
{ "question": "What is the main conclusion?" }

// Response
{
  "answer": "...",
  "sources": [{ "text": "...", "documentName": "report.pdf", "score": 0.82 }]
}
```

## Project Structure

```
app/
  api/
    upload/route.ts   # File upload and indexing
    ask/route.ts      # Retrieval and answer generation
  page.tsx            # Main UI
  layout.tsx
components/
  icon.tsx
lib/
  extract.ts          # PDF/TXT text extraction
  chunk.ts            # Text chunking
  gemini.ts           # Gemini embedding and generation
  similarity.ts       # Cosine similarity
  store.ts            # In-memory chunk store
```

## Limitations

- Chunks are kept in server memory. They are lost when the server restarts and aren't shared between server instances.
- Only PDF and plain-text files are supported.
- Chunks are embedded one at a time, so large documents can take a while to upload.
