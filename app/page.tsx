"use client";

import { useState } from "react";

type Source = {
  text: string;
  documentName: string;
  score: number;
};

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  // --- Upload state ---
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Status>("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [chunkCount, setChunkCount] = useState<number | null>(null);

  // --- Ask state ---
  const [question, setQuestion] = useState("");
  const [askStatus, setAskStatus] = useState<Status>("idle");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);

  // --- Shared error ---
  const [error, setError] = useState("");

  const isReady = uploadStatus === "success";

  async function handleUpload() {
    if (!file) return;

    setUploadStatus("loading");
    setError("");
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setChunkCount(data.chunkCount);
      setUploadMessage(`Processed "${file.name}" into ${data.chunkCount} chunks.`);
      setUploadStatus("success");
    } catch (err: any) {
      setError(err.message);
      setUploadStatus("error");
    }
  }

  async function handleAsk() {
    if (!question.trim()) {
      setError("Please type a question before asking.");
      return;
    }

    setAskStatus("loading");
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setAnswer(data.answer);
      setSources(data.sources || []);
      setAskStatus("success");
    } catch (err: any) {
      setError(err.message);
      setAskStatus("error");
    }
  }

  function handleAskKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAsk();
  }

  return (
    <div className="space-y-8">
      {/* STEP 1 — Upload */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium">
            1
          </span>
          <h2 className="font-medium">Upload a document</h2>
          <span className="text-xs text-gray-400 ml-auto">PDF or TXT, max 10MB</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {file ? file.name : "Click to choose a file..."}
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || uploadStatus === "loading"}
            className="bg-black text-white text-sm font-medium px-5 py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition"
          >
            {uploadStatus === "loading" ? "Processing..." : "Upload"}
          </button>
        </div>

        {uploadMessage && (
          <p className="text-green-600 text-sm mt-3">✓ {uploadMessage}</p>
        )}
      </section>

      {/* STEP 2 — Ask */}
      <section
        className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${!isReady ? "opacity-60" : ""
          }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium">
            2
          </span>
          <h2 className="font-medium">Ask a question</h2>
          {chunkCount !== null && (
            <span className="text-xs text-gray-400 ml-auto">
              Searching {chunkCount} chunks
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleAskKeyDown}
            disabled={!isReady}
            placeholder={
              isReady ? "e.g. What is the main conclusion?" : "Upload a document first"
            }
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            onClick={handleAsk}
            disabled={!isReady || askStatus === "loading"}
            className="bg-blue-600 text-white text-sm font-medium px-5 py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          >
            {askStatus === "loading" ? "Thinking..." : "Ask"}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Answer */}
      {answer && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-2">
          <h2 className="font-medium">Answer</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{answer}</p>
        </section>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-medium text-sm text-gray-500">
            Sources used ({sources.length})
          </h2>
          <div className="space-y-2">
            {sources.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4 text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500 text-xs">{s.documentName}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {(s.score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="text-gray-700">{s.text.slice(0, 220)}...</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}