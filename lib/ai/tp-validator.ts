"use server";

import { callGemini, parseAiJson } from "./client";
import type { TP } from "./tp-generator";

export type ValidationIssue = { masalah: string; alasan: string; saran: string };
export type ValidationResult = { status: "valid" | "bermasalah"; issues: ValidationIssue[] };
export type ValidationMap = Record<string, ValidationResult>;

export async function validateTPs(
  tps: TP[],
  cpText: string
): Promise<ValidationMap> {
  const systemInstruction = `Kamu adalah validator Tujuan Pembelajaran (TP) untuk guru di Indonesia.
Periksa setiap TP terhadap CP aslinya. Cek hal-hal berikut untuk setiap TP:
- Apakah TP ini benar-benar mengacu ke CP (tidak menyimpang/tidak terlalu sempit/tidak terlalu luas)
- Apakah satu TP hanya berisi SATU kemampuan utama (bukan gabungan beberapa kemampuan)
- Apakah rumusan TP jelas dan terukur (pakai KKO yang tepat)

Jawab HANYA dalam format JSON object valid, tanpa markdown, dengan struktur:
{
  "TP1": { "status": "valid", "issues": [] },
  "TP2": { "status": "bermasalah", "issues": [ { "masalah": "...", "alasan": "...", "saran": "..." } ] }
}
Key harus persis sama dengan id TP yang diberikan.`;

  const userPrompt = `
Teks CP:
"""
${cpText}
"""

Daftar TP yang perlu divalidasi:
${JSON.stringify(tps, null, 2)}
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<ValidationMap>(rawText);
}