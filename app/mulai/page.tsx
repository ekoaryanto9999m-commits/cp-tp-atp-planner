"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanner } from "@/context/planner-context";

export default function MulaiPage() {
  const router = useRouter();
  const { setFormData } = usePlanner();

  const [jenjang, setJenjang] = useState("");
  const [fase, setFase] = useState("");
  const [kelas, setKelas] = useState("");
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [semester, setSemester] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [cpText, setCpText] = useState("");
  const [materi, setMateri] = useState("");
  const [alokasiWaktu, setAlokasiWaktu] = useState("");
  const [kemampuanAwal, setKemampuanAwal] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cpText.trim()) {
      alert("Capaian Pembelajaran (CP) wajib diisi.");
      return;
    }
    setFormData({
      jenjang,
      fase,
      kelas,
      mataPelajaran,
      semester,
      tahunAjaran,
      cpText,
      materi,
      alokasiWaktu,
      kemampuanAwal,
    });
    router.push("/analisis");
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Identitas Pembelajaran
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenjang
            </label>
            <input
              value={jenjang}
              onChange={(e) => setJenjang(e.target.value)}
              placeholder="mis. SMA"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fase
            </label>
            <input
              value={fase}
              onChange={(e) => setFase(e.target.value)}
              placeholder="mis. Fase E"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
            <input
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="mis. X"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran
            </label>
            <input
              value={mataPelajaran}
              onChange={(e) => setMataPelajaran(e.target.value)}
              placeholder="mis. Biologi"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <input
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="mis. Ganjil"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun Ajaran
            </label>
            <input
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              placeholder="mis. 2026/2027"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capaian Pembelajaran (CP) <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cpText}
            onChange={(e) => setCpText(e.target.value)}
            rows={6}
            placeholder="Tempel/ketik teks CP di sini..."
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Materi (opsional)
          </label>
          <textarea
            value={materi}
            onChange={(e) => setMateri(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alokasi Waktu per Pertemuan (opsional)
            </label>
            <input
              value={alokasiWaktu}
              onChange={(e) => setAlokasiWaktu(e.target.value)}
              placeholder="mis. 2 JP"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kemampuan Awal (opsional)
            </label>
            <input
              value={kemampuanAwal}
              onChange={(e) => setKemampuanAwal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition"
        >
          Lanjut ke Analisis CP
        </button>
      </form>
    </main>
  );
}