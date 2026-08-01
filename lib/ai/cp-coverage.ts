"use server";

import { callGemini, parseAiJson } from "./client";
import type { CpAnalysis } from "./cp-analyzer";
import type { TP } from "./tp-generator";

export type CoverageItem = {
  kompetensi: string;
  status: "terwakili" | "belum_terwakili";
  tp_ids: string[];
  catatan: string;
};

export type CoverageResult = {
  items: CoverageItem[];
  ringkasan: string;
};

export async function analyzeCoverage(
  analysis: CpAnalysis,
  tps: TP[]
): Promise<CoverageResult> {
  const systemInstruction = `Kamu memeriksa apakah setiap kompetensi utama dari hasil analisis CP sudah terwakili oleh minimal satu Tujuan Pembelajaran (TP).

Untuk setiap kompetensi di daftar "kompetensi_utama", tentukan:
- status "terwakili" kalau ada TP yang jelas mencakup kompetensi itu
- status "belum_terwakili" kalau tidak ada TP yang mencakupnya
- tp_ids: daftar id TP yang mencakup kompetensi itu (kosongkan array jika belum_terwakili)
- catatan: penjelasan singkat

Jawab HANYA dalam format JSON valid, tanpa markdown, dengan struktur:
{
  "items": [
    { "kompetensi": "...", "status": "terwakili", "tp_ids": ["TP1"], "catatan": "..." }
  ],
  "ringkasan": "ringkasan umum kondisi cakupan TP terhadap CP, 1-2 kalimat"
}`;

  const userPrompt = `
Kompetensi utama dari hasil analisis CP:
${JSON.stringify(analysis.kompetensi_utama, null, 2)}

Daftar TP saat ini:
${JSON.stringify(
    tps.map((t) => ({
      id: t.id,
      competency: t.competency,
      statement: t.statement,
      cp_reference: t.cp_reference,
    })),
    null,
    2
  )}
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<CoverageResult>(rawText);
}