import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-10 border-t bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3 text-xs text-gray-500">
        <Image
          src="/logo.png"
          alt="Logo PKBM Al Umm Barabai"
          width={40}
          height={40}
          className="rounded object-contain"
        />
        <div>
          <p className="font-medium text-gray-700">
            PKBM Al Umm Barabai — Program Qira&apos;atul Qur&apos;an (Paket A
            Setara SD)
          </p>
          <p>
            © {new Date().getFullYear()} Aplikasi ini dikembangkan untuk PKBM
            Al Umm Barabai.
          </p>
        </div>
      </div>
    </footer>
  );
}