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

export async function addTpFromAI(
  input: BaseInput & { kkoHint?: string; kompetensiHint?: string }
): Promise<TP> {
  const sebutan = input.sebutan || "Peserta Didik";
  const hasHint = !!(input.kkoHint?.trim() || input.kompetensiHint?.trim());

  const hintInstruction = hasHint
    ? `PENTING — Guru sudah menentukan arah TP ini secara spesifik:
${input.kkoHint?.trim() ? `- WAJIB gunakan kata kerja operasional (KKO): "${input.kkoHint.trim()}"` : ""}
${input.kompetensiHint?.trim() ? `- WAJIB fokus pada kompetensi: "${input.kompetensiHint.trim()}"` : ""}
Susun TP yang sesuai persis dengan arahan ini, tetap relevan dengan CP yang diberikan.`
    : `Guru TIDAK memberikan arahan spesifik — kamu bebas menentukan KKO dan kompetensi yang paling relevan dan belum tercakup di TP yang sudah ada.`;

  const systemInstruction = `Kamu adalah asisten penyusun Tujuan Pembelajaran (TP) untuk guru di Indonesia.
Tugasmu: buat SATU TP TAMBAHAN yang belum ada di daftar TP yang sudah dibuat, untuk melengkapi kompetensi dari CP yang mungkin belum terwakili.

${hintInstruction}

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

export async function splitTP(
  input: BaseInput & { targetId: string; validatorNote?: string }
): Promise<TP[]> {
  const sebutan = input.sebutan || "Peserta Didik";
  const target = input.existingTps.find((t) => t.id === input.targetId);

  const systemInstruction = `Kamu adalah asisten penyusun Tujuan Pembelajaran (TP) untuk guru di Indonesia.
Tugasmu: PECAH SATU TP yang terlalu luas/menggabungkan beberapa kemampuan sekaligus, menjadi BEBERAPA TP terpisah, masing-masing hanya berisi SATU kemampuan utama.
Aturan:
- WAJIB gunakan istilah "${sebutan}" sebagai subjek di awal setiap rumusan hasil pecahan.
- Jumlah hasil pecahan menyesuaikan berapa kemampuan berbeda yang tergabung di TP asal (biasanya 2-4 TP).
- JANGAN membuat TP yang isinya mirip dengan TP lain yang sudah ada di daftar (selain TP yang sedang dipecah).
- Field "id" isi bebas/sementara saja, nanti otomatis diganti sistem.

Jawab HANYA dalam format JSON array valid (array berisi 2 TP atau lebih), tanpa markdown, dengan struktur tiap elemen:
{
  "id": "sementara",
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

Hasil analisis CP:
${JSON.stringify(input.analysis, null, 2)}

TP yang perlu dipecah (id: ${input.targetId}):
${JSON.stringify(target, null, 2)}

${
    input.validatorNote
      ? `Catatan dari validator kenapa TP ini bermasalah:\n"""\n${input.validatorNote}\n"""\n`
      : ""
  }
Daftar TP lain yang sudah ada (JANGAN dibuat mirip dengan ini):
${JSON.stringify(
    input.existingTps.filter((t) => t.id !== input.targetId),
    null,
    2
  )}

Pecah TP dengan id "${input.targetId}" sesuai aturan di atas.
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<TP[]>(rawText);
}