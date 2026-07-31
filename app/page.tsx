import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        CP → TP → ATP Planner
      </h1>
      <p className="text-gray-600 max-w-xl mb-8">
        Bantu susun Tujuan Pembelajaran (TP) dan Alur Tujuan Pembelajaran
        (ATP) dari Capaian Pembelajaran (CP), dengan bantuan AI. Guru tetap
        pemegang kendali penuh — tidak perlu daftar akun, langsung pakai.
      </p>
      <Link
        href="/mulai"
        className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition"
      >
        Mulai Sekarang
      </Link>
    </main>
  );
}