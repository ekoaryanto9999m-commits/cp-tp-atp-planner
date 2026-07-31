"use server";

import { callGemini, parseAiJson } from "./client";
import type { CpAnalysis } from "./cp-analyzer";
import type { TP } from "./tp-generator";

type BaseInput = {
  cpText: string;
  materi?: string;
  analysis: CpAnalysis;
  sebutan?: string;
  existingTps: TP[];
};

export async function regenerateTP(
  input: BaseInput & { targetId: string }
): Promise<TP> {
  const sebutan = input.sebutan || "Peserta Didik";
  const target = input.existingTps.find((t) => t.id === input.targetId);

  const systemInstruction = `Kamu adalah asisten penyusun Tujuan Pembelajaran (TP) untuk guru di Indonesia.
Tugasmu: buat ULANG SATU TP saja (yang sedang diminta guru untuk diregenerasi), dengan pendekatan/rumusan yang BERBEDA dari versi sebelumnya, tapi tetap mengacu ke CP yang sama.
Aturan:
- Satu TP = satu kemampuan utama.
- WAJIB gunakan istilah "${sebutan}" sebagai subjek di awal rumusan TP.
- JANGAN membuat TP yang isinya mirip dengan TP lain yang sudah ada di daftar (lihat daftar TP lain di bawah untuk dihindari).
- id pada hasil HARUS SAMA PERSIS dengan id yang diminta.

Jawab HANYA dalam format JSON object valid (satu objek TP, bukan array), tanpa markdown, dengan struktur:
{
  "id": "...",
  "statement": "...",
  "kko": "...",
  "competency": "...",
  "material": "...",
  "cp_reference": "...",
  "reason": "..."
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

Hasil analisis CP:
${JSON.stringify(input.analysis, null, 2)}

TP yang mau diregenerasi (id: ${input.targetId}):
${JSON.stringify(target, null, 2)}

Daftar TP lain yang sudah ada (JANGAN dibuat mirip dengan ini):
${JSON.stringify(
  input.existingTps.filter((t) => t.id !== input.targetId),
  null,
  2
)}

Buat ulang TP dengan id "${input.targetId}" sesuai aturan di atas.
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<TP>(rawText);
}

export async function addTpFromAI(input: BaseInput): Promise<TP> {
  const sebutan = input.sebutan || "Peserta Didik";

  const systemInstruction = `Kamu adalah asisten penyusun Tujuan Pembelajaran (TP) untuk guru di Indonesia.
Tugasmu: buat SATU TP TAMBAHAN yang belum ada di daftar TP yang sudah dibuat, untuk melengkapi kompetensi dari CP yang mungkin belum terwakili.
Aturan:
- Satu TP = satu kemampuan utama.
- WAJIB gunakan istilah "${sebutan}" sebagai subjek di awal rumusan TP.
- JANGAN membuat TP yang isinya mirip dengan TP yang sudah ada di daftar.
- Buat id baru yang belum dipakai (lanjutkan penomoran dari TP terakhir).

Jawab HANYA dalam format JSON object valid (satu objek TP, bukan array), tanpa markdown, dengan struktur:
{
  "id": "...",
  "statement": "...",
  "kko": "...",
  "competency": "...",
  "material": "...",
  "cp_reference": "...",
  "reason": "..."
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

Hasil analisis CP:
${JSON.stringify(input.analysis, null, 2)}

Daftar TP yang sudah ada:
${JSON.stringify(input.existingTps, null, 2)}

Buat satu TP tambahan baru sesuai aturan di atas.
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<TP>(rawText);
}