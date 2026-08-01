import { NextRequest, NextResponse } from "next/server";
import { buildDocx, ExportData } from "@/lib/export/docx";

export async function POST(req: NextRequest) {
  try {
    const data: ExportData = await req.json();
    const buffer = await buildDocx(data);

    const namaFile = `Perencanaan-${(
      data.formData.mataPelajaran || "Pembelajaran"
    ).replace(/\s+/g, "-")}.docx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${namaFile}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal membuat file DOCX." },
      { status: 500 }
    );
  }
}