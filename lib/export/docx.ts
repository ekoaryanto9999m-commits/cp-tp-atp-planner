import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  Packer,
} from "docx";
import type { CpAnalysis } from "@/lib/ai/cp-analyzer";
import type { TP } from "@/lib/ai/tp-generator";
import type { CoverageResult } from "@/lib/ai/cp-coverage";
import type { ATPRow } from "@/lib/ai/atp-planner";

export type ExportData = {
  formData: {
    jenjang: string;
    fase: string;
    kelas: string;
    sebutan: string;
    mataPelajaran: string;
    semester: string;
    tahunAjaran: string;
    cpText: string;
    materi: string;
    alokasiWaktu: string;
    kemampuanAwal: string;
  };
  cpAnalysis: CpAnalysis | null;
  tpList: TP[];
  coverageResult: CoverageResult | null;
  atpList: ATPRow[];
};

function heading(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
  });
}

function subHeading(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
  });
}

function bodyText(text: string) {
  return new Paragraph({
    children: [new TextRun(text)],
    spacing: { after: 100 },
  });
}

function bulletList(items: string[]) {
  return items.map(
    (item) =>
      new Paragraph({
        text: item,
        bullet: { level: 0 },
        spacing: { after: 60 },
      })
  );
}

function cell(text: string, opts?: { header?: boolean; width?: number }) {
  return new TableCell({
    width: opts?.width
      ? { size: opts.width, type: WidthType.PERCENTAGE }
      : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts?.header })],
      }),
    ],
  });
}

export async function buildDocx(data: ExportData): Promise<Buffer> {
  const { formData, cpAnalysis, tpList, coverageResult, atpList } = data;
  const children: any[] = [];

  children.push(
    new Paragraph({
      text: "Perencanaan Pembelajaran",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `${formData.mataPelajaran || "-"} — ${formData.jenjang || "-"} ${
        formData.fase || "-"
      }`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  children.push(heading("Identitas Pembelajaran"));
  const identitasRows: [string, string][] = [
    ["Jenjang", formData.jenjang || "-"],
    ["Fase", formData.fase || "-"],
    ["Kelas", formData.kelas || "-"],
    ["Mata Pelajaran", formData.mataPelajaran || "-"],
    ["Semester", formData.semester || "-"],
    ["Tahun Ajaran", formData.tahunAjaran || "-"],
    ["Sebutan Peserta", formData.sebutan || "-"],
  ];
  if (formData.alokasiWaktu?.trim()) {
    identitasRows.push(["Alokasi Waktu per Pertemuan", formData.alokasiWaktu]);
  }
  if (formData.kemampuanAwal?.trim()) {
    identitasRows.push(["Kemampuan Awal", formData.kemampuanAwal]);
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: identitasRows.map(
        ([label, value]) =>
          new TableRow({
            children: [
              cell(label, { header: true, width: 30 }),
              cell(value, { width: 70 }),
            ],
          })
      ),
    })
  );

  children.push(subHeading("Capaian Pembelajaran (CP)"));
  children.push(bodyText(formData.cpText));

  if (formData.materi?.trim()) {
    children.push(subHeading("Materi"));
    children.push(bodyText(formData.materi));
  }

  if (cpAnalysis) {
    children.push(heading("Hasil Analisis CP"));
    children.push(subHeading("Elemen"));
    children.push(bodyText(cpAnalysis.elemen));
    children.push(subHeading("Kompetensi Utama"));
    children.push(...bulletList(cpAnalysis.kompetensi_utama));
    children.push(subHeading("Lingkup Materi"));
    children.push(...bulletList(cpAnalysis.lingkup_materi));
    children.push(subHeading("Tuntutan Kemampuan"));
    children.push(bodyText(cpAnalysis.tuntutan_kemampuan));
    children.push(subHeading("Informasi Penting"));
    children.push(...bulletList(cpAnalysis.informasi_penting));
    children.push(subHeading("Struktur Kompetensi (Prasyarat)"));
    children.push(
      ...bulletList(
        cpAnalysis.struktur_kompetensi.map((s) =>
          s.prasyarat_dari
            ? `${s.kompetensi} — prasyarat dari: ${s.prasyarat_dari}`
            : s.kompetensi
        )
      )
    );
  }

  if (tpList.length > 0) {
    children.push(heading("Tujuan Pembelajaran (TP)"));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              cell("ID", { header: true, width: 10 }),
              cell("Rumusan TP", { header: true, width: 45 }),
              cell("KKO", { header: true, width: 15 }),
              cell("Kompetensi", { header: true, width: 30 }),
            ],
          }),
          ...tpList.map(
            (tp) =>
              new TableRow({
                children: [
                  cell(tp.id),
                  cell(tp.statement),
                  cell(tp.kko),
                  cell(tp.competency),
                ],
              })
          ),
        ],
      })
    );
  }

  if (coverageResult) {
    children.push(heading("CP → TP Mapping (Cakupan)"));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Catatan: status berikut adalah indikator internal aplikasi, bukan nilai/penilaian resmi kurikulum.",
            italics: true,
          }),
        ],
        spacing: { after: 150 },
      })
    );
    children.push(bodyText(coverageResult.ringkasan));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              cell("Kompetensi", { header: true, width: 35 }),
              cell("Status", { header: true, width: 15 }),
              cell("TP Terkait", { header: true, width: 15 }),
              cell("Catatan", { header: true, width: 35 }),
            ],
          }),
          ...coverageResult.items.map(
            (item) =>
              new TableRow({
                children: [
                  cell(item.kompetensi),
                  cell(
                    item.status === "terwakili"
                      ? "Terwakili"
                      : "Belum Terwakili"
                  ),
                  cell(item.tp_ids.join(", ") || "-"),
                  cell(item.catatan),
                ],
              })
          ),
        ],
      })
    );
  }

  if (atpList.length > 0) {
    children.push(heading("Alur Tujuan Pembelajaran (ATP)"));
    const tampilkanAlokasi = !!formData.alokasiWaktu?.trim();
    const headerCells = [
      cell("No", { header: true, width: 5 }),
      cell("Elemen", { header: true, width: 12 }),
      cell("CP", { header: true, width: 20 }),
      cell("Materi Esensial", { header: true, width: 18 }),
      cell("TP", { header: true, width: tampilkanAlokasi ? 30 : 45 }),
    ];
    if (tampilkanAlokasi) {
      headerCells.push(cell("Alokasi Waktu", { header: true, width: 15 }));
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: headerCells }),
          ...atpList.map((row) => {
            const tp = tpList.find((t) => t.id === row.tp_id);
            const tpText = tp ? `${row.tp_id}: ${tp.statement}` : row.tp_id;
            const rowCells = [
              cell(String(row.no)),
              cell(row.elemen),
              cell(row.cp_reference),
              cell(row.materi_esensial),
              cell(tpText),
            ];
            if (tampilkanAlokasi) {
              rowCells.push(cell(row.alokasi_waktu || "-"));
            }
            return new TableRow({ children: rowCells });
          }),
        ],
      })
    );
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}