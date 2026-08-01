"use client";

import { useRouter } from "next/navigation";
import { usePlanner } from "@/context/planner-context";

export default function TopBar() {
  const { formData, resetAll } = usePlanner();
  const router = useRouter();

  if (!formData) return null;

  function handleReset() {
    const yakin = window.confirm(
      "Yakin mau mulai ulang dari awal? Semua data yang sedang dikerjakan (CP, TP, ATP) akan dihapus."
    );
    if (!yakin) return;
    resetAll();
    router.push("/");
  }

  return (
    <div className="bg-gray-900 text-white text-xs px-4 py-2 flex items-center justify-between">
      <span className="truncate">
        Sedang mengerjakan: {formData.mataPelajaran || "-"}{" "}
        {formData.jenjang && `(${formData.jenjang})`} — pekerjaan tersimpan
        otomatis di perangkat ini
      </span>
      <button
        onClick={handleReset}
        className="text-red-300 hover:text-red-200 underline whitespace-nowrap ml-3"
      >
        Mulai Ulang dari Awal
      </button>
    </div>
  );
}