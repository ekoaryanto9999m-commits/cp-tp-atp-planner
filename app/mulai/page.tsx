"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanner } from "@/context/planner-context";

const OPSI_SEBUTAN = ["Peserta Didik", "Murid", "Warga Belajar", "Lainnya"];
const OPSI_SEMESTER = ["Ganjil", "Genap", "Ganjil dan Genap"];

export default function MulaiPage() {
  const router = useRouter();
  const { setFormData } = usePlanner();

  const [jenjang, setJenjang] = useState("");
  const [fase, setFase] = useState("");
  const [kelas, setKelas] = useState("");
  const [sebutanPilihan, setSebutanPilihan] = useState("Peserta Didik");
  const [sebutanCustom, setSebutanCustom] = useState("");
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [semester, setSemester] = useState("Ganjil");
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

    const sebutanFinal =
      sebutanPilihan === "Lainnya" && sebutanCustom.trim()
        ? sebutanCustom.trim()
        : sebutanPilihan;

    setFormData({
      jenjang,
      fase,
      kelas,
      sebutan: sebutanFinal,
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
            <input
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              placeholder="mis. X  (boleh lebih dari satu, pisahkan koma, contoh: VII, VIII, IX)"
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Karena CP disusun per Fase, boleh isi satu kelas atau beberapa
              kelas sekaligus.
            </p>
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
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              {OPSI_SEMESTER.map((opsi) => (
                <option key={opsi} value={opsi}>
                  {opsi}
                </option>
              ))}
            </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sebutan untuk Peserta Belajar
            </label>
            <select
              value={sebutanPilihan}
              onChange={(e) => setSebutanPilihan(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              {OPSI_SEBUTAN.map((opsi) => (
                <option key={opsi} value={opsi}>
                  {opsi}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sebutanPilihan === "Lainnya" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tulis Sebutan Sendiri
            </label>
            <input
              value={sebutanCustom}
              onChange={(e) => setSebutanCustom(e.target.value)}
              placeholder="mis. Santri, Siswa, dll"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        )}

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