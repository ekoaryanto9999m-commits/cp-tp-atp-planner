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
  kelas?: string;
  semester?: string;
};

export async function generateTP(input: GenerateInput): Promise<TP[]> {
  const sebutan = input.sebutan || "Peserta Didik";

  const systemInstruction = `Kamu adalah asisten penyusun Tujuan Pembelajaran (TP) untuk guru di Indonesia.
Aturan PENTING yang wajib diikuti:
- Jumlah TP TIDAK dibatasi angka tertentu (bukan wajib 6-10). Jumlah TP ditentukan SEPENUHNYA oleh kebutuhan kompetensi yang terkandung dalam CP — boleh sedikit, boleh banyak, sesuai kebutuhan riil.
- Kalau materi diisi guru, pertimbangkan cakupan materi tersebut untuk membantu menentukan seberapa detail/berapa banyak TP yang dibutuhkan agar materi tercakup dengan baik.
- Kalau kelas mencakup lebih dari satu (dipisah koma) dan/atau semester mencakup "Ganjil dan Genap", ini berarti CP berlaku untuk cakupan waktu belajar yang lebih panjang — sesuaikan jumlah dan cakupan TP agar memadai untuk rentang itu (biasanya jadi lebih banyak dibanding kalau hanya untuk 1 kelas/1 semester).
- Satu TP = satu kemampuan utama. Jangan gabungkan beberapa kemampuan berbeda dalam satu TP.
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

Materi (pertimbangkan untuk cakupan/detail TP):
"""
${input.materi || "-"}
"""

Kelas: ${input.kelas || "-"}
Semester: ${input.semester || "-"}

Hasil analisis CP sebelumnya:
${JSON.stringify(input.analysis, null, 2)}

Susun daftar TP sesuai aturan di atas.
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<TP[]>(rawText);
}