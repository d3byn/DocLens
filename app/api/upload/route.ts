import { NextRequest, NextResponse } from "next/server";
import { extractText } from "@/lib/extract";
import { chunkText } from "@/lib/chunk";
import { embedText } from "@/lib/gemini";
import { chunkStore } from "@/lib/store";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded." },
                { status: 400 });
        }
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (max 10MB)." },
                { status: 400 });
        }

        const text = await extractText(file);
        if (!text || text.trim().length < 20) {
            return NextResponse.json(
                { error: "Couldn't read meaningful text from this file." },
                { status: 400 }
            );
        }

        const chunks = chunkText(text);

        for (let i = 0; i < chunks.length; i++) {
            const embedding = await embedText(chunks[i]);
            chunkStore.push({
                id: `${file.name}-${i}`,
                documentName: file.name,
                text: chunks[i],
                embedding,
            });
        }

        return NextResponse.json({ success: true, chunkCount: chunks.length });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Upload failed." }, { status: 500 });
    }
}