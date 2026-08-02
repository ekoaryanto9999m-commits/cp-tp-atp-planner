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
  PageOrientation,
} from "docx";
import type { CpAnalysis } from "@/lib/ai/cp-analyzer";
import type { TP } from "@/lib/ai/tp-generator";
import type { CoverageResult } from "@/lib/ai/cp-coverage";
import type { ATPRow } from "@/lib/ai/atp-planner";

export type ExportMode = "lengkap" | "atp_saja";
export type ColumnKey = "elemen" | "cp_reference" | "materi_esensial" | "tp_id";

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
  mode: ExportMode;
  columnOrder: ColumnKey[];
};

const COLUMN_LABELS: Record<ColumnKey, string> = {
  elemen: "Elemen",
  cp_reference: "Analisis CP",
  materi_esensial: "Materi Esensial",
  tp_id: "TP",
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
  const { formData, cpAnalysis, tpList, coverageResult, atpList, mode, columnOrder } =
    data;
  const children: any[] = [];
  const isLengkap = mode === "lengkap";

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
  if (isLengkap && formData.kemampuanAwal?.trim()) {
    identitasRows.push(["Kemampuan Awal", formData.kemampuanAwal]);
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: identitasRows.map(
        ([label, value]) =>
          new TableRow({
            children: [
              cell(label, { header: true, width: 25 }),
              cell(value, { width: 75 }),
            ],
          })
      ),
    })
  );

  children.push(subHeading("Capaian Pembelajaran (CP)"));
  children.push(bodyText(formData.cpText));

  if (isLengkap && formData.materi?.trim()) {
    children.push(subHeading("Materi"));
    children.push(bodyText(formData.materi));
  }

  if (isLengkap && cpAnalysis) {
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

  if (isLengkap && tpList.length > 0) {
    children.push(heading("Tujuan Pembelajaran (TP)"));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              cell("ID", { header: true, width: 8 }),
              cell("Rumusan TP", { header: true, width: 47 }),
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

  if (isLengkap && coverageResult) {
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
              cell("Kompetensi", { header: true, width: 30 }),
              cell("Status", { header: true, width: 12 }),
              cell("TP Terkait", { header: true, width: 13 }),
              cell("Catatan", { header: true, width: 45 }),
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

    const orderedKeys: ColumnKey[] =
      columnOrder && columnOrder.length > 0
        ? columnOrder
        : ["elemen", "cp_reference", "materi_esensial", "tp_id"];

    const widthPerColumn = tampilkanAlokasi ? 18 : 22;

    const headerCells = [
      cell("No", { header: true, width: 5 }),
      ...orderedKeys.map((key) =>
        cell(COLUMN_LABELS[key], { header: true, width: widthPerColumn })
      ),
    ];
    if (tampilkanAlokasi) {
      headerCells.push(cell("Alokasi Waktu", { header: true, width: 10 }));
    }

    function getCellValue(row: ATPRow, key: ColumnKey): string {
      if (key === "tp_id") {
        const tp = tpList.find((t) => t.id === row.tp_id);
        return tp ? `${row.tp_id}: ${tp.statement}` : row.tp_id;
      }
      return (row as any)[key] || "-";
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: headerCells }),
          ...atpList.map((row) => {
            const rowCells = [
              cell(String(row.no)),
              ...orderedKeys.map((key) => cell(getCellValue(row, key))),
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

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 18720, // 13 inci
              height: 12240, // 8.5 inci
              orientation: PageOrientation.LANDSCAPE,
            },
            margin: {
              top: 900,
              bottom: 900,
              left: 900,
              right: 900,
            },
          },
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}