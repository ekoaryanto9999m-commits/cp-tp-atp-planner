"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePlanner } from "@/context/planner-context";
import { generateATP, ATPRow } from "@/lib/ai/atp-planner";
import { validateATP, ATPValidationMap } from "@/lib/ai/atp-validator";

export default function AtpPage() {
  const {
    formData,
    cpAnalysis,
    tpList,
    coverageResult,
    atpList,
    setAtpList,
  } = usePlanner();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ATPValidationMap>({});
  const [attempted, setAttempted] = useState(false);

  const runCheck = useCallback(
    async (rows: ATPRow[]) => {
      if (!formData || rows.length === 0) return;
      setChecking(true);
      setError(null);
      try {
        const result = await validateATP(rows, formData.cpText);
        setValidation(result);
      } catch (err: any) {
        setError(err.message || "Gagal memeriksa ATP.");
      } finally {
        setChecking(false);
      }
    },
    [formData]
  );

  const runGenerate = useCallback(async () => {
    if (!formData || !cpAnalysis || tpList.length === 0) return;
    setLoading(true);
    setError(null);
    setAttempted(true);
    try {
      const result = await generateATP({
        cpText: formData.cpText,
        materi: formData.materi,
        alokasiWaktu: formData.alokasiWaktu,
        analysis: cpAnalysis,
        tps: tpList,
      });
      setAtpList(result);
      runCheck(result);
    } catch (err: any) {
      setError(err.message || "Gagal menyusun ATP.");
    } finally {
      setLoading(false);
    }
  }, [formData, cpAnalysis, tpList, setAtpList, runCheck]);

  useEffect(() => {
    if (!formData || !cpAnalysis || tpList.length === 0) return;
    if (atpList.length > 0) return;
    if (attempted) return;
    runGenerate();
  }, [formData, cpAnalysis, tpList, atpList.length, attempted, runGenerate]);

  function renumber(rows: ATPRow[]): ATPRow[] {
    return rows.map((r, i) => ({ ...r, no: i + 1 }));
  }

  function updateAtp(index: number, field: keyof ATPRow, value: string) {
    const next = [...atpList];
    next[index] = { ...next[index], [field]: value };
    setAtpList(next);
  }

  function deleteAtp(index: number) {
    setAtpList(renumber(atpList.filter((_, i) => i !== index)));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...atpList];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setAtpList(renumber(next));
  }

  function moveDown(index: number) {
    if (index === atpList.length - 1) return;
    const next = [...atpList];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setAtpList(renumber(next));
  }

  function addAtpManual() {
    const newRow: ATPRow = {
      id: `ATP${atpList.length + 1}`,
      no: atpList.length + 1,
      elemen: "",
      cp_reference: "",
      materi_esensial: "",
      tp_id: "",
      alokasi_waktu: "",
      reason: "Ditambahkan manual oleh guru",
    };
    setAtpList([...atpList, newRow]);
  }

  function getTpStatement(tpId: string): string {
    const found = tpList.find((t) => t.id === tpId);
    return found?.statement || "(TP tidak ditemukan, cek id-nya)";
  }

  async function handleExportDocx() {
    if (!formData) return;
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData,
          cpAnalysis,
          tpList,
          coverageResult,
          atpList,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal export DOCX.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Perencanaan-${(
        formData.mataPelajaran || "Pembelajaran"
      ).replace(/\s+/g, "-")}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Gagal export DOCX.");
    } finally {
      setExporting(false);
    }
  }

  const tampilkanAlokasiWaktu = !!formData?.alokasiWaktu?.trim();

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
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Alur Tujuan Pembelajaran (ATP)
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Urutan disusun AI berdasarkan prasyarat & kesinambungan kompetensi.
        Bisa diedit, diurutkan ulang (⬆️⬇️), dihapus, atau ditambah manual.
      </p>

      {loading && (
        <div className="bg-white border rounded-lg p-6 text-gray-600 mb-4">
          Sedang menyusun ATP dengan AI, mohon tunggu sebentar...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          <p className="font-medium mb-1">Terjadi kesalahan.</p>
          <p className="text-sm mb-3">{error}</p>
          {atpList.length === 0 && (
            <button
              onClick={runGenerate}
              disabled={loading}
              className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}

      {!loading && atpList.length > 0 && (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border-b">No</th>
                  <th className="p-2 border-b">Elemen</th>
                  <th className="p-2 border-b">Analisis CP</th>
                  <th className="p-2 border-b">Materi Esensial</th>
                  <th className="p-2 border-b">TP</th>
                  {tampilkanAlokasiWaktu && (
                    <th className="p-2 border-b">Alokasi Waktu</th>
                  )}
                  <th className="p-2 border-b">Status</th>
                  <th className="p-2 border-b">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {atpList.map((row, index) => {
                  const v = validation[row.id];
                  return (
                    <tr key={row.id} className="align-top border-b">
                      <td className="p-2 font-medium">{row.no}</td>
                      <td className="p-2">
                        <input
                          value={row.elemen}
                          onChange={(e) =>
                            updateAtp(index, "elemen", e.target.value)
                          }
                          className="w-28 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2">
                        <textarea
                          value={row.cp_reference}
                          onChange={(e) =>
                            updateAtp(index, "cp_reference", e.target.value)
                          }
                          rows={3}
                          className="w-56 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2">
                        <textarea
                          value={row.materi_esensial}
                          onChange={(e) =>
                            updateAtp(
                              index,
                              "materi_esensial",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="w-36 border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          value={row.tp_id}
                          onChange={(e) =>
                            updateAtp(index, "tp_id", e.target.value)
                          }
                          className="w-20 border rounded px-2 py-1 mb-1"
                        />
                        <p className="text-xs text-gray-500 w-44">
                          {getTpStatement(row.tp_id)}
                        </p>
                      </td>
                      {tampilkanAlokasiWaktu && (
                        <td className="p-2">
                          <input
                            value={row.alokasi_waktu}
                            onChange={(e) =>
                              updateAtp(
                                index,
                                "alokasi_waktu",
                                e.target.value
                              )
                            }
                            className="w-20 border rounded px-2 py-1"
                          />
                        </td>
                      )}
                      <td className="p-2">
                        {v && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full inline-block ${
                              v.status === "valid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {v.status === "valid" ? "✅" : "⚠️"}
                          </span>
                        )}
                        {v && v.status === "bermasalah" && (
                          <div className="text-xs text-yellow-800 mt-1 max-w-[150px]">
                            {v.issues.map((issue, i) => (
                              <p key={i} className="mb-1">
                                {issue.masalah}: {issue.saran}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <button
                          onClick={() => moveUp(index)}
                          className="text-gray-500 hover:text-gray-900 mr-1"
                          title="Naik"
                        >
                          ⬆️
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          className="text-gray-500 hover:text-gray-900 mr-1"
                          title="Turun"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => deleteAtp(index)}
                          className="text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={addAtpManual}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-100"
            >
              + Tambah Baris ATP Manual
            </button>
            <button
              onClick={() => runCheck(atpList)}
              disabled={checking}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {checking ? "Memeriksa..." : "Periksa ATP"}
            </button>
          </div>

          <button
            onClick={handleExportDocx}
            disabled={exporting}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {exporting ? "Membuat file..." : "📄 Export ke Word (DOCX)"}
          </button>
        </>
      )}
    </main>
  );
}