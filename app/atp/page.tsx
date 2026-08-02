"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePlanner } from "@/context/planner-context";
import { generateATP, ATPRow } from "@/lib/ai/atp-planner";
import { validateATP, ATPValidationMap } from "@/lib/ai/atp-validator";

type ColumnKey = "elemen" | "cp_reference" | "materi_esensial" | "tp_id";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  elemen: "Elemen",
  cp_reference: "Analisis CP",
  materi_esensial: "Materi Esensial",
  tp_id: "TP",
};

const DEFAULT_ORDER: ColumnKey[] = [
  "elemen",
  "cp_reference",
  "materi_esensial",
  "tp_id",
];

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
  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(DEFAULT_ORDER);

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

  function moveColumnUp(index: number) {
    if (index === 0) return;
    const next = [...columnOrder];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setColumnOrder(next);
  }

  function moveColumnDown(index: number) {
    if (index === columnOrder.length - 1) return;
    const next = [...columnOrder];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setColumnOrder(next);
  }

  function renderCellContent(key: ColumnKey, row: ATPRow, index: number) {
    if (key === "elemen") {
      return (
        <input
          value={row.elemen}
          onChange={(e) => updateAtp(index, "elemen", e.target.value)}
          className="w-28 border rounded px-2 py-1"
        />
      );
    }
    if (key === "cp_reference") {
      return (
        <textarea
          value={row.cp_reference}
          onChange={(e) => updateAtp(index, "cp_reference", e.target.value)}
          rows={3}
          className="w-56 border rounded px-2 py-1"
        />
      );
    }
    if (key === "materi_esensial") {
      return (
        <textarea
          value={row.materi_esensial}
          onChange={(e) =>
            updateAtp(index, "materi_esensial", e.target.value)
          }
          rows={2}
          className="w-36 border rounded px-2 py-1"
        />
      );
    }
    // tp_id
    return (
      <>
        <input
          value={row.tp_id}
          onChange={(e) => updateAtp(index, "tp_id", e.target.value)}
          className="w-20 border rounded px-2 py-1 mb-1"
        />
        <p className="text-xs text-gray-500 w-44">
          {getTpStatement(row.tp_id)}
        </p>
      </>
    );
  }

  async function handleExportDocx(mode: "lengkap" | "atp_saja") {
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
          mode,
          columnOrder,
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
      const suffix = mode === "atp_saja" ? "ATP" : "Lengkap";
      a.download = `Perencanaan-${(
        formData.mataPelajaran || "Pembelajaran"
      ).replace(/\s+/g, "-")}-${suffix}.docx`;
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
      <p className="text-sm text-gray-500 mb-4">
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
          <div className="bg-white border rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Atur Urutan Kolom (Elemen s.d. TP)
            </p>
            <div className="flex flex-wrap gap-2">
              {columnOrder.map((key, i) => (
                <div
                  key={key}
                  className="flex items-center gap-1 border rounded-lg px-2 py-1 text-xs bg-gray-50"
                >
                  <span className="text-gray-400">{i + 1}.</span>
                  <span className="font-medium">{COLUMN_LABELS[key]}</span>
                  <button
                    onClick={() => moveColumnUp(i)}
                    disabled={i === 0}
                    className="disabled:opacity-30"
                    title="Geser ke kiri"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => moveColumnDown(i)}
                    disabled={i === columnOrder.length - 1}
                    className="disabled:opacity-30"
                    title="Geser ke kanan"
                  >
                    ⬇️
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border-b">No</th>
                  {columnOrder.map((key) => (
                    <th key={key} className="p-2 border-b">
                      {COLUMN_LABELS[key]}
                    </th>
                  ))}
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
                      {columnOrder.map((key) => (
                        <td key={key} className="p-2">
                          {renderCellContent(key, row, index)}
                        </td>
                      ))}
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

          <div className="flex gap-3">
            <button
              onClick={() => handleExportDocx("lengkap")}
              disabled={exporting}
              className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {exporting ? "Membuat file..." : "📄 Export Lengkap (dengan Analisis)"}
            </button>
            <button
              onClick={() => handleExportDocx("atp_saja")}
              disabled={exporting}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
            >
              {exporting ? "Membuat file..." : "📄 Export ATP Saja"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}