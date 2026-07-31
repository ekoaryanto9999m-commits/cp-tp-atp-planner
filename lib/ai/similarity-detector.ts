"use server";

import { callGemini, parseAiJson } from "./client";
import type { TP } from "./tp-generator";

export type SimilarityFlag = {
  tp_id: string;
  similar_to: string[];
  note: string;
};

export async function detectSimilarity(tps: TP[]): Promise<SimilarityFlag[]> {
  const systemInstruction = `Kamu memeriksa kemiripan antar Tujuan Pembelajaran (TP).
Fokus pada kemiripan TARGET KEMAMPUAN, bukan sekadar kata yang dipakai. Contoh: "mengidentifikasi jenis tulang" dan "menyebutkan jenis tulang" tetap dianggap MIRIP walau kata kerjanya beda, karena kemampuan yang diuji sama.

Jawab HANYA dalam format JSON array valid, tanpa markdown. Hanya masukkan TP yang benar-benar terindikasi mirip dengan TP lain (TP yang tidak mirip dengan apapun TIDAK perlu dimasukkan ke array). Struktur tiap elemen:
{
  "tp_id": "TP2",
  "similar_to": ["TP5"],
  "note": "penjelasan singkat kenapa dianggap mirip dan saran (gabung/hapus salah satu/perjelas beda kompetensinya)"
}`;

  const userPrompt = `
Daftar TP:
${JSON.stringify(
    tps.map((t) => ({ id: t.id, statement: t.statement, competency: t.competency })),
    null,
    2
  )}
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<SimilarityFlag[]>(rawText);
}