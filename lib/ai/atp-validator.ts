"use server";

import { callGemini, parseAiJson } from "./client";
import type { ATPRow } from "./atp-planner";

export type ATPValidationIssue = {
  masalah: string;
  alasan: string;
  saran: string;
};
export type ATPValidationResult = {
  status: "valid" | "bermasalah";
  issues: ATPValidationIssue[];
};
export type ATPValidationMap = Record<string, ATPValidationResult>;

export async function validateATP(
  atpRows: ATPRow[],
  cpText: string
): Promise<ATPValidationMap> {
  const systemInstruction = `Kamu adalah validator Alur Tujuan Pembelajaran (ATP) untuk guru di Indonesia.
Periksa daftar ATP berikut, cek untuk setiap baris:
- Kelengkapan: apakah semua TP yang seharusnya ada sudah masuk (tidak ada yang hilang/terlewat)
- Duplikasi: apakah ada TP yang dobel dimasukkan
- Urutan: apakah urutannya logis (prasyarat sebelum lanjutan, sederhana ke kompleks)
- Keselarasan dengan CP: apakah cp_reference dan materi_esensial-nya masuk akal terhadap CP

Jawab HANYA dalam format JSON object valid, tanpa markdown, dengan struktur:
{
  "ATP1": { "status": "valid", "issues": [] },
  "ATP2": { "status": "bermasalah", "issues": [ { "masalah": "...", "alasan": "...", "saran": "..." } ] }
}
Key harus persis sama dengan id ATP yang diberikan.`;

  const userPrompt = `
Teks CP:
"""
${cpText}
"""

Daftar ATP yang perlu divalidasi (urut sesuai field "no"):
${JSON.stringify(atpRows, null, 2)}
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<ATPValidationMap>(rawText);
}