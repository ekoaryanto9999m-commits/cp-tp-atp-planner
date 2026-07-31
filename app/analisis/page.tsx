"use client";

import { usePlanner } from "@/context/planner-context";

export default function AnalisisPage() {
  const { formData } = usePlanner();

  if (!formData) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-gray-600">
          Belum ada data. Silakan isi form dari halaman awal dulu.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Data Diterima (Placeholder Analisis CP)
      </h1>
      <pre className="bg-white border rounded-lg p-4 text-sm overflow-auto">
        {JSON.stringify(formData, null, 2)}
      </pre>
    </main>
  );
}