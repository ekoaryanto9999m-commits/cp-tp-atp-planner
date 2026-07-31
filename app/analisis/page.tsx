"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlanner } from "@/context/planner-context";
import { analyzeCP, CpAnalysis } from "@/lib/ai/cp-analyzer";

export default function AnalisisPage() {
  const { formData } = usePlanner();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CpAnalysis | null>(null);

  useEffect(() => {
    if (!formData) return;
    setLoading(true);
    setError(null);

    analyzeCP({
      cpText: formData.cpText,
      materi: formData.materi,
      kemampuanAwal: formData.kemampuanAwal,
      jenjang: formData.jenjang,
      fase: formData.fase,
      mataPelajaran: formData.mataPelajaran,
    })
      .then((result) => setAnalysis(result))
      .catch((err) =>
        setError(err.message || "Terjadi kesalahan saat menganalisis CP.")
      )
      .finally(() => setLoading(false));
  }, [formData]);

  if (!formData) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-gray-600 mb-4">
          Belum ada data. Silakan isi form dari halaman awal dulu.
        </p>
        <Link href="/mulai" className="text-blue-600 underline">
          Ke halaman form
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Hasil Analisis CP
      </h1>

      {loading && (
        <div className="bg-white border rounded-lg p-6 text-gray-600">
          Sedang menganalisis CP dengan AI, mohon tunggu sebentar...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          <p className="font-medium mb-1">Gagal menganalisis CP.</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <Section title="Elemen">
            <p>{analysis.elemen}</p>
          </Section>

          <Section title="Kompetensi Utama">
            <ul className="list-disc list-inside space-y-1">
              {analysis.kompetensi_utama.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Lingkup Materi">
            <ul className="list-disc list-inside space-y-1">
              {analysis.lingkup_materi.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Tuntutan Kemampuan">
            <p>{analysis.tuntutan_kemampuan}</p>
          </Section>

          <Section title="Informasi Penting">
            <ul className="list-disc list-inside space-y-1">
              {analysis.informasi_penting.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Struktur Kompetensi (Prasyarat)">
            <ul className="space-y-1">
              {analysis.struktur_kompetensi.map((item, i) => (
                <li key={i}>
                  <span className="font-medium">{item.kompetensi}</span>
                  {item.prasyarat_dari && (
                    <span className="text-gray-500">
                      {" "}
                      — prasyarat dari: {item.prasyarat_dari}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          <button
            disabled
            className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-medium cursor-not-allowed"
            title="Fitur ini akan aktif di FASE 5"
          >
            Lanjut ke Generate TP (segera hadir — FASE 5)
          </button>
        </div>
      )}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <h2 className="font-semibold text-gray-900 mb-2">{title}</h2>
      <div className="text-gray-700 text-sm">{children}</div>
    </div>
  );
}