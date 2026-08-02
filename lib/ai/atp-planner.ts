"use server";

import { callGemini, parseAiJson } from "./client";
import type { CpAnalysis } from "./cp-analyzer";
import type { TP } from "./tp-generator";

export type ATPRow = {
  id: string;
  no: number;
  elemen: string;
  cp_reference: string;
  materi_esensial: string;
  tp_id: string;
  alokasi_waktu: string;
  reason: string;
};

type PlanInput = {
  cpText: string;
  materi?: string;
  alokasiWaktu?: string;
  analysis: CpAnalysis;
  tps: TP[];
};

export async function generateATP(input: PlanInput): Promise<ATPRow[]> {
  const systemInstruction = `Kamu adalah asisten penyusun Alur Tujuan Pembelajaran (ATP) untuk guru di Indonesia.
Tugasmu: urutkan seluruh TP yang diberikan menjadi ATP yang logis, dengan mempertimbangkan:
- Prasyarat kompetensi (lihat struktur_kompetensi dari hasil analisis CP: kompetensi yang jadi prasyarat harus diajarkan lebih dulu)
- Kesinambungan belajar (dari yang sederhana ke kompleks, dari dasar ke penerapan)
- SETIAP TP dari daftar yang diberikan harus muncul tepat satu kali di ATP, jangan ada yang terlewat, jangan ada yang digandakan

ATURAN KHUSUS untuk field "cp_reference":
- HARUS berupa SATU KALIMAT RINGKAS saja (bukan paragraf, bukan penjelasan panjang).
- WAJIB dimulai dengan kata kerja (KKO), TANPA subjek "Peserta didik mampu" di depan.
- Isinya adalah inti kompetensi dari CP yang relevan dengan TP tersebut.
- Contoh gaya yang benar: "Menganalisis hubungan antara Pancasila, UUD NRI Tahun 1945, Bhinneka Tunggal Ika, dan NKRI sebagai landasan kehidupan berbangsa dan bernegara."
- Contoh gaya yang SALAH (jangan seperti ini): "Kompetensi dasar literasi Al-Qur'an berupa kemampuan membaca ayat merupakan fondasi penting yang harus dikuasai peserta didik sebelum..." (terlalu panjang, seperti penjelasan bukan pernyataan kompetensi).

Jawab HANYA dalam format JSON array valid, tanpa markdown, tanpa penjelasan tambahan, mengikuti struktur berikut untuk setiap elemen array:

{
  "id": "ATP1",
  "no": 1,
  "elemen": "elemen/domain terkait",
  "cp_reference": "SATU KALIMAT ringkas dimulai KKO, sesuai aturan khusus di atas",
  "materi_esensial": "materi esensial terkait TP ini",
  "tp_id": "TP3",
  "alokasi_waktu": "alokasi waktu untuk TP ini, atau string kosong jika tidak ada info alokasi waktu",
  "reason": "alasan singkat kenapa TP ini ditempatkan di urutan ini"
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

Alokasi waktu per pertemuan (jika ada): ${input.alokasiWaktu || "-"}

Hasil analisis CP (perhatikan struktur_kompetensi untuk urutan prasyarat, dan gunakan kompetensi_utama/tuntutan_kemampuan sebagai bahan menyusun kalimat ringkas di kolom cp_reference):
${JSON.stringify(input.analysis, null, 2)}

Daftar TP yang harus disusun urutannya (SEMUA harus masuk, tidak boleh ada yang hilang):
${JSON.stringify(input.tps, null, 2)}

Susun ATP sesuai aturan di atas.
`;

  const rawText = await callGemini(systemInstruction, userPrompt);
  return parseAiJson<ATPRow[]>(rawText);
}