import Image from "next/image";

export default function BrandBar() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-2 text-xs text-gray-500">
        <Image
          src="/logo.png"
          alt="Logo PKBM Al Umm Barabai"
          width={28}
          height={28}
          className="rounded object-contain"
        />
        <span className="font-medium text-gray-700">
          PKBM Al Umm Barabai
        </span>
        <span className="text-gray-400">
          — Program Qira&apos;atul Qur&apos;an (Paket A Setara SD)
        </span>
      </div>
    </div>
  );
}