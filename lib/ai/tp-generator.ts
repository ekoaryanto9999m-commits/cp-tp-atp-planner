"use server";

import { callGemini, parseAiJson } from "./client";
import type { CpAnalysis } from "./cp-analyzer";

export type TP = {
  id: string;
  statement: string;
  kko: string;
  competency: string;
  material: string;
  cp_reference: string;
  reason: string;
};

type GenerateInput = {
  cpText: string;
  materi?: string;
  analysis: CpAnalysis;
  sebutan?: string;
};

export async function generateTP(input: GenerateInput): Promise<TP[]> {
  const sebutan = input.sebutan || "Peserta Didik";

  const systemInstruction = `Kamu adalah asisten penyusun Tujuan Pembelajaran (TP) untuk guru di Indonesia.
Aturan PENTING yang wajib diikuti:
- 6-10 TP adalah REKOMENDASI, bukan kuota mutlak. Jumlah TP mengikuti kebutuhan kompetensi dalam CP, boleh kurang dari 6 atau lebih dari 10 kalau memang itu yang tepat.
- Satu TP = satu kemampuan utama. Jangan gabungkan beberapa kemampuan berbeda dalam satu TP.
- Materi hanya konteks pendukung, TIDAK menentukan jumlah TP.
- Setiap TP harus jelas mengacu ke kompetensi_utama dari hasil analisis CP yang diberikan.
- WAJIB gunakan istilah "${sebutan}" sebagai subjek di awal setiap rumusan TP.

Jawab HANYA dalam format JSON array valid, tanpa markdown, tanpa penjelasan tambahan, mengikuti struktur berikut untuk setiap elemen array:

{
  "id": "TP1",
  "statement": "rumusan lengkap Tujuan Pembelajaran",
  "kko": "kata kerja operasional yang dipakai",
  "competency": "kompetensi utama yang dituju",
  "material": "materi terkait TP ini",
  "cp_reference": "bagian CP yang jadi acuan TP ini",
  "reason": "alasan singkat kenapa TP ini disusun seperti ini"
}`;

  const userPrompt = `
Teks CP:
"""
${input.cpText}
"""

Materi (konteks tambahan):
"""
${input.materi || "-"}
"""

Hasil analisis CP sebelumnya:
${JSON.stringify(input.analysis, null, 2)}

Susun daftar TP sesuai aturan di atas.
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<TP[]>(rawText);
}