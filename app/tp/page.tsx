"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePlanner } from "@/context/planner-context";
import { generateTP, TP } from "@/lib/ai/tp-generator";
import { validateTPs, ValidationMap } from "@/lib/ai/tp-validator";
import { detectSimilarity, SimilarityFlag } from "@/lib/ai/similarity-detector";
import { regenerateTP, addTpFromAI } from "@/lib/ai/tp-single";

export default function TpPage() {
  const { formData, cpAnalysis, tpList, setTpList } = usePlanner();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [addingFromAI, setAddingFromAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationMap>({});
  const [similarity, setSimilarity] = useState<SimilarityFlag[]>([]);

  const runCheck = useCallback(
    async (tps: TP[]) => {
      if (!formData || tps.length === 0) return;
      setChecking(true);
      setError(null);
      try {
        const [validationResult, similarityResult] = await Promise.all([
          validateTPs(tps, formData.cpText),
          detectSimilarity(tps),
        ]);
        setValidation(validationResult);
        setSimilarity(similarityResult);
      } catch (err: any) {
        setError(err.message || "Gagal memeriksa TP.");
      } finally {
        setChecking(false);
      }
    },
    [formData]
  );

  useEffect(() => {
    if (!formData || !cpAnalysis) return;
    if (tpList.length > 0) return;

    setLoading(true);
    setError(null);
    generateTP({
      cpText: formData.cpText,
      materi: formData.materi,
      analysis: cpAnalysis,
      sebutan: formData.sebutan,
    })
      .then((result) => {
        setTpList(result);
        runCheck(result);
      })
      .catch((err) => setError(err.message || "Gagal membuat TP."))
      .finally(() => setLoading(false));
  }, [formData, cpAnalysis, tpList.length, setTpList, runCheck]);

  function updateTp(index: number, field: keyof TP, value: string) {
    const next = [...tpList];
    next[index] = { ...next[index], [field]: value };
    setTpList(next);
  }

  function deleteTp(index: number) {
    setTpList(tpList.filter((_, i) => i !== index));
  }

  function addTp() {
    const newId = `TP${tpList.length + 1}`;
    setTpList([
      ...tpList,
      {
        id: newId,
        statement: "",
        kko: "",
        competency: "",
        material: "",
        cp_reference: "",
        reason: "Ditambahkan manual oleh guru",
      },
    ]);
  }

  async function handleRegenerate(targetId: string) {
    if (!formData || !cpAnalysis) return;
    setRegeneratingId(targetId);
    setError(null);
    try {
      const newTp = await regenerateTP({
        cpText: formData.cpText,
        materi: formData.materi,
        analysis: cpAnalysis,
        sebutan: formData.sebutan,
        existingTps: tpList,
        targetId,
      });
      const next = tpList.map((t) => (t.id === targetId ? newTp : t));
      setTpList(next);
      runCheck(next);
    } catch (err: any) {
      setError(err.message || "Gagal meregenerasi TP.");
    } finally {
      setRegeneratingId(null);
    }
  }

  async function handleAddFromAI() {
    if (!formData || !cpAnalysis) return;
    setAddingFromAI(true);
    setError(null);
    try {
      const newTp = await addTpFromAI({
        cpText: formData.cpText,
        materi: formData.materi,
        analysis: cpAnalysis,
        sebutan: formData.sebutan,
        existingTps: tpList,
      });
      const next = [...tpList, newTp];
      setTpList(next);
      runCheck(next);
    } catch (err: any) {
      setError(err.message || "Gagal menambah TP dari AI.");
    } finally {
      setAddingFromAI(false);
    }
  }

  function getSimilarityForTp(id: string) {
    return similarity.find((s) => s.tp_id === id);
  }

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

  if (!cpAnalysis) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-gray-600 mb-4">
          Analisis CP belum tersedia. Silakan buka halaman analisis dulu.
        </p>
        <Link href="/analisis" className="text-blue-600 underline">
          Ke halaman analisis
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Tujuan Pembelajaran (TP)
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        6-10 TP adalah rekomendasi, bukan aturan mutlak. Edit, hapus, tambah,
        atau regenerasi TP sesuai kebutuhanmu, lalu klik &quot;Periksa
        TP&quot; untuk validasi ulang.
      </p>

      {loading && (
        <div className="bg-white border rounded-lg p-6 text-gray-600 mb-4">
          Sedang menyusun TP dengan AI, mohon tunggu sebentar...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          <p className="font-medium mb-1">Terjadi kesalahan.</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && tpList.length > 0 && (
        <>
          <div className="space-y-4 mb-6">
            {tpList.map((tp, index) => {
              const v = validation[tp.id];
              const sim = getSimilarityForTp(tp.id);
              const isRegenerating = regeneratingId === tp.id;
              return (
                <div key={tp.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {tp.id}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {v && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            v.status === "valid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {v.status === "valid" ? "✅ Valid" : "⚠️ Bermasalah"}
                        </span>
                      )}
                      {sim && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                          ⚠️ Mirip {sim.similar_to.join(", ")}
                        </span>
                      )}
                      <button
                        onClick={() => handleRegenerate(tp.id)}
                        disabled={isRegenerating}
                        className="text-blue-600 text-sm hover:underline disabled:opacity-50"
                      >
                        {isRegenerating ? "Meregenerasi..." : "🔄 Regenerasi"}
                      </button>
                      <button
                        onClick={() => deleteTp(index)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={tp.statement}
                    onChange={(e) =>
                      updateTp(index, "statement", e.target.value)
                    }
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 mb-2 text-sm"
                  />

                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <input
                      value={tp.kko}
                      onChange={(e) => updateTp(index, "kko", e.target.value)}
                      placeholder="KKO"
                      className="border rounded-lg px-2 py-1"
                    />
                    <input
                      value={tp.competency}
                      onChange={(e) =>
                        updateTp(index, "competency", e.target.value)
                      }
                      placeholder="Kompetensi"
                      className="border rounded-lg px-2 py-1"
                    />
                  </div>

                  {v && v.status === "bermasalah" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 mb-1">
                      {v.issues.map((issue, i) => (
                        <p key={i} className="mb-1">
                          <span className="font-medium">
                            {issue.masalah}:
                          </span>{" "}
                          {issue.alasan} —{" "}
                          <span className="italic">
                            saran: {issue.saran}
                          </span>
                        </p>
                      ))}
                    </div>
                  )}

                  {sim && (
                    <p className="text-xs text-orange-700">{sim.note}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mb-3">
            <button
              onClick={addTp}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-100"
            >
              + Tambah TP Manual
            </button>
            <button
              onClick={handleAddFromAI}
              disabled={addingFromAI}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              {addingFromAI ? "Membuat..." : "+ Tambah TP dari AI"}
            </button>
          </div>

          <button
            onClick={() => runCheck(tpList)}
            disabled={checking}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 mb-6"
          >
            {checking ? "Memeriksa..." : "Periksa TP"}
          </button>

          <button
            disabled
            className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-medium cursor-not-allowed"
            title="Fitur ini akan aktif di FASE 6"
          >
            Lanjut ke Mapping CP (segera hadir — FASE 6)
          </button>
        </>
      )}
    </main>
  );
}