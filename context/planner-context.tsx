"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import type { CpAnalysis } from "@/lib/ai/cp-analyzer";
import type { TP } from "@/lib/ai/tp-generator";
import type { CoverageResult } from "@/lib/ai/cp-coverage";
import type { ATPRow } from "@/lib/ai/atp-planner";

export type FormData = {
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

type StoredState = {
  formData: FormData | null;
  cpAnalysis: CpAnalysis | null;
  tpList: TP[];
  coverageResult: CoverageResult | null;
  atpList: ATPRow[];
};

const STORAGE_KEY = "cp-tp-atp-planner-data";

type PlannerContextType = {
  formData: FormData | null;
  setFormData: (data: FormData) => void;
  cpAnalysis: CpAnalysis | null;
  setCpAnalysis: (data: CpAnalysis | null) => void;
  tpList: TP[];
  setTpList: (data: TP[]) => void;
  coverageResult: CoverageResult | null;
  setCoverageResult: (data: CoverageResult | null) => void;
  atpList: ATPRow[];
  setAtpList: (data: ATPRow[]) => void;
  resetAll: () => void;
};

const PlannerContext = createContext<PlannerContextType | undefined>(
  undefined
);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<FormData | null>(null);
  const [cpAnalysis, setCpAnalysis] = useState<CpAnalysis | null>(null);
  const [tpList, setTpListState] = useState<TP[]>([]);
  const [coverageResult, setCoverageResult] = useState<CoverageResult | null>(
    null
  );
  const [atpList, setAtpList] = useState<ATPRow[]>([]);
  const hasLoaded = useRef(false);

  // Muat data tersimpan (kalau ada) begitu aplikasi pertama dibuka
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredState = JSON.parse(raw);
        if (parsed.formData) setFormDataState(parsed.formData);
        if (parsed.cpAnalysis) setCpAnalysis(parsed.cpAnalysis);
        if (parsed.tpList) setTpListState(parsed.tpList);
        if (parsed.coverageResult) setCoverageResult(parsed.coverageResult);
        if (parsed.atpList) setAtpList(parsed.atpList);
      }
    } catch {
      // kalau data tersimpan rusak/tidak valid, abaikan saja, mulai dari kosong
    } finally {
      hasLoaded.current = true;
    }
  }, []);

  // Simpan otomatis setiap kali ada perubahan (setelah proses muat awal selesai)
  useEffect(() => {
    if (!hasLoaded.current) return;
    const data: StoredState = {
      formData,
      cpAnalysis,
      tpList,
      coverageResult,
      atpList,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // kalau gagal simpan (mis. localStorage penuh/nonaktif), abaikan saja
    }
  }, [formData, cpAnalysis, tpList, coverageResult, atpList]);

  function setFormData(data: FormData) {
    setFormDataState(data);
  }

  // Kalau TP berubah (edit/hapus/tambah), hasil Coverage & ATP lama jadi tidak akurat lagi
  function setTpList(data: TP[]) {
    setTpListState(data);
    setCoverageResult(null);
    setAtpList([]);
  }

  function resetAll() {
    setFormDataState(null);
    setCpAnalysis(null);
    setTpListState([]);
    setCoverageResult(null);
    setAtpList([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // abaikan kalau gagal
    }
  }

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (formData) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData]);

  return (
    <PlannerContext.Provider
      value={{
        formData,
        setFormData,
        cpAnalysis,
        setCpAnalysis,
        tpList,
        setTpList,
        coverageResult,
        setCoverageResult,
        atpList,
        setAtpList,
        resetAll,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlanner harus dipakai di dalam PlannerProvider");
  }
  return context;
}