import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-[calc(100vh-50px)] flex-col items-center justify-center px-6 text-center py-10">
      <p className="text-base text-gray-500 mb-6">
        © {new Date().getFullYear()} PKBM Al Umm Barabai — Seluruh hak
        terkait konten pembelajaran pada aplikasi ini
      </p>

      <Image
        src="/logo.png"
        alt="Logo PKBM Al Umm Barabai"
        width={120}
        height={120}
        className="object-contain mb-4"
      />
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        PKBM Al Umm Barabai
      </h2>
      <p className="text-sm text-gray-500 mb-10">
        Program Qira&apos;atul Qur&apos;an — Paket A Setara SD
      </p>

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