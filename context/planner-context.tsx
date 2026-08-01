"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
};

const PlannerContext = createContext<PlannerContextType | undefined>(
  undefined
);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [cpAnalysis, setCpAnalysis] = useState<CpAnalysis | null>(null);
  const [tpList, setTpListState] = useState<TP[]>([]);
  const [coverageResult, setCoverageResult] = useState<CoverageResult | null>(
    null
  );
  const [atpList, setAtpList] = useState<ATPRow[]>([]);

  function setTpList(data: TP[]) {
    setTpListState(data);
    setCoverageResult(null);
    setAtpList([]);
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