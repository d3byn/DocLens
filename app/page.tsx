"use client";

import { useState } from "react";
import Icon from "@/components/icon";

type Source = {
  text: string;
  documentName: string;
  score: number;
};

type Status = "idle" | "loading" | "success" | "error";

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong.";
}

// Shared styles
const card = "rounded-3xl bg-white/50 p-6 ring-1 ring-[#413333]/10 sm:p-8";
const label = "text-xs font-medium uppercase tracking-widest text-[#413333]/50";
const button =
  "flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-[#F5EBDD] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

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
    } catch (err) {
      setError(getErrorMessage(err));
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
    } catch (err) {
      setError(getErrorMessage(err));
      setAskStatus("error");
    }
  }

  function handleAskKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAsk();
  }

  return (
    <div className="space-y-10">
      {/* Intro */}
      <div className="space-y-4">
        <h1 className="font-(family-name:--font-serif) text-4xl leading-tight sm:text-5xl">
          Ask your documents,
          <br />
          <span className="italic text-[#F2765E]">get grounded answers.</span>
        </h1>
        <p className="max-w-md leading-7 text-[#413333]/70">
          Upload a PDF or text file and ask anything. Every answer comes with
          the passages it was drawn from.
        </p>
      </div>

      <div className={`${card} space-y-8`}>
        {/* Upload */}
        <section className="space-y-3">
          <p className={label}>01 · Upload</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#413333]/25 px-4 py-3 text-sm transition hover:border-[#F2765E] hover:bg-[#F2765E]/5">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Icon name="file" className="h-5 w-5 shrink-0 text-[#F2765E]" />
              <span className={`truncate ${file ? "" : "text-[#413333]/50"}`}>
                {file ? file.name : "Choose a PDF or TXT (max 10MB)"}
              </span>
            </label>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploadStatus === "loading"}
              className={`${button} bg-[#F2765E]`}
            >
              <Icon name="upload" />
              {uploadStatus === "loading" ? "Processing..." : "Upload"}
            </button>
          </div>

          {uploadMessage && (
            <p className="flex items-center gap-2 text-sm text-[#315B8C]">
              <Icon name="check" />
              {uploadMessage}
            </p>
          )}
        </section>

        <hr className="border-[#413333]/10" />

        {/* Ask */}
        <section className={`space-y-3 transition ${isReady ? "" : "opacity-50"}`}>
          <p className={label}>
            02 · Ask{chunkCount !== null && ` · ${chunkCount} chunks`}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleAskKeyDown}
              disabled={!isReady}
              placeholder={
                isReady ? "What is the main conclusion?" : "Upload a document first"
              }
              className="flex-1 rounded-2xl border border-[#413333]/15 bg-[#F5EBDD]/60 px-4 py-3 text-sm outline-none transition placeholder:text-[#413333]/40 focus:border-[#315B8C] focus:ring-4 focus:ring-[#315B8C]/10 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={handleAsk}
              disabled={!isReady || askStatus === "loading"}
              className={`${button} bg-[#315B8C]`}
            >
              {askStatus === "loading" ? "Thinking..." : "Ask"}
              <Icon name="arrow" />
            </button>
          </div>
        </section>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-[#F2765E]/10 px-5 py-4 text-sm text-[#413333]">
          <Icon name="alert" className="h-5 w-5 shrink-0 text-[#F2765E]" />
          {error}
        </div>
      )}

      {/* Answer */}
      {answer && (
        <section className={`${card} space-y-4`}>
          <p className={label}>Answer</p>
          <p className="whitespace-pre-wrap font-(family-name:--font-serif) text-lg leading-8">
            {answer}
          </p>
        </section>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <section className="space-y-4">
          <p className={label}>Sources · {sources.length}</p>

          <div className="space-y-3">
            {sources.map((s, i) => (
              <div
                key={i}
                className="space-y-2 border-l-2 border-[#315B8C]/30 py-1 pl-4 text-sm"
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-[#413333]/60">{s.documentName}</span>
                  <span className="shrink-0 rounded-full bg-[#315B8C]/10 px-2.5 py-0.5 font-medium text-[#315B8C]">
                    {(s.score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="leading-6 text-[#413333]/80">{s.text.slice(0, 220)}...</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
