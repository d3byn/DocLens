import { PDFParse } from "pdf-parse";

export async function extractText(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (file.type === "application/pdf") {
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        await parser.destroy();

        return result.text;
    }
    if (file.type === "text/plain") {
        return buffer.toString("utf-8");
    }
    throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
}