"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePlanner } from "@/context/planner-context";
import { analyzeCoverage } from "@/lib/ai/cp-coverage";

export default function MappingPage() {
  const { formData, cpAnalysis, tpList, coverageResult, setCoverageResult } =
    usePlanner();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const runAnalyze = useCallback(async () => {
    if (!cpAnalysis || tpList.length === 0) return;
    setLoading(true);
    setError(null);
    setAttempted(true);
    try {
      const result = await analyzeCoverage(cpAnalysis, tpList);
      setCoverageResult(result);
    } catch (err: any) {
      setError(err.message || "Gagal memeriksa cakupan CP.");
    } finally {
      setLoading(false);
    }
  }, [cpAnalysis, tpList, setCoverageResult]);

  useEffect(() => {
    if (!cpAnalysis || tpList.length === 0) return;
    if (coverageResult) return;
    if (attempted) return;
    runAnalyze();
  }, [cpAnalysis, tpList, coverageResult, attempted, runAnalyze]);

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

  if (!cpAnalysis || tpList.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-gray-600 mb-4">
          TP belum tersedia. Silakan buka halaman TP dulu.
        </p>
        <Link href="/tp" className="text-blue-600 underline">
          Ke halaman TP
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        CP → TP Mapping
      </h1>
      <p className="text-xs text-gray-500 bg-gray-100 border rounded-lg px-3 py-2 mb-6">
        Catatan: status di bawah adalah indikator internal aplikasi untuk
        membantu guru, BUKAN nilai atau penilaian resmi kurikulum.
      </p>

      {loading && (
        <div className="bg-white border rounded-lg p-6 text-gray-600 mb-4">
          Sedang memeriksa cakupan TP terhadap CP, mohon tunggu sebentar...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          <p className="font-medium mb-1">Terjadi kesalahan.</p>
          <p className="text-sm mb-3">{error}</p>
          <button
            onClick={runAnalyze}
            disabled={loading}
            className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {coverageResult && !loading && (
        <>
          <div className="bg-white border rounded-lg p-4 mb-4 text-sm text-gray-700">
            {coverageResult.ringkasan}
          </div>

          <div className="space-y-3 mb-6">
            {coverageResult.items.map((item, i) => (
              <div key={i} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {item.kompetensi}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "terwakili"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status === "terwakili"
                      ? "✅ Terwakili"
                      : "⚠️ Belum Terwakili"}
                  </span>
                </div>
                {item.tp_ids.length > 0 && (
                  <p className="text-xs text-gray-500 mb-1">
                    Terkait: {item.tp_ids.join(", ")}
                  </p>
                )}
                <p className="text-sm text-gray-600">{item.catatan}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={runAnalyze}
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Periksa Ulang Coverage
            </button>
            <Link
              href="/tp"
              className="flex-1 text-center border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-100"
            >
              Kembali ke TP
            </Link>
          </div>

          <Link
            href="/atp"
            className="block text-center w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition"
          >
            Lanjut Susun ATP
          </Link>
        </>
      )}
    </main>
  );
}