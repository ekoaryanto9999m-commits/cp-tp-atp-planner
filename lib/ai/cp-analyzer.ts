"use server";

import { callGemini, parseAiJson } from "./client";

export type CpAnalysis = {
  elemen: string;
  kompetensi_utama: string[];
  lingkup_materi: string[];
  tuntutan_kemampuan: string;
  informasi_penting: string[];
  struktur_kompetensi: { kompetensi: string; prasyarat_dari: string }[];
};

type AnalyzeInput = {
  cpText: string;
  materi?: string;
  kemampuanAwal?: string;
  jenjang?: string;
  fase?: string;
  mataPelajaran?: string;
  kelas?: string;
  sebutan?: string;
};

export async function analyzeCP(input: AnalyzeInput): Promise<CpAnalysis> {
  const systemInstruction = `Kamu adalah asisten analisis kurikulum untuk guru di Indonesia.
Tugasmu HANYA menganalisis teks Capaian Pembelajaran (CP) yang diberikan, TIDAK membuat asumsi di luar teks CP tersebut.
Jawab HANYA dalam format JSON valid, tanpa markdown, tanpa penjelasan tambahan, persis mengikuti struktur berikut:

{
  "elemen": "nama elemen/domain dari CP ini",
  "kompetensi_utama": ["daftar kompetensi utama yang tersirat dalam CP"],
  "lingkup_materi": ["daftar lingkup materi yang tersirat dalam CP"],
  "tuntutan_kemampuan": "ringkasan tuntutan kemampuan level kognitif dari CP ini",
  "informasi_penting": ["catatan penting lain yang relevan untuk penyusunan TP"],
  "struktur_kompetensi": [
    { "kompetensi": "nama kompetensi", "prasyarat_dari": "kompetensi lain yang jadi prasyaratnya, atau string kosong jika tidak ada" }
  ]
}`;

  const userPrompt = `
Jenjang: ${input.jenjang || "-"}
Fase: ${input.fase || "-"}
Kelas: ${input.kelas || "-"}
Mata Pelajaran: ${input.mataPelajaran || "-"}
Sebutan untuk peserta pembelajaran: ${input.sebutan || "Peserta Didik"}

Teks CP:
"""
${input.cpText}
"""

Materi (jika ada, hanya sebagai konteks tambahan, bukan penentu utama):
"""
${input.materi || "-"}
"""

Kemampuan awal peserta didik (jika ada):
"""
${input.kemampuanAwal || "-"}
"""

Analisis CP di atas sesuai format JSON yang diminta.
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<CpAnalysis>(rawText);
}