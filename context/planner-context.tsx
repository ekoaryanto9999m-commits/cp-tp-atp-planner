"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type FormData = {
  jenjang: string;
  fase: string;
  kelas: string;
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
};

const PlannerContext = createContext<PlannerContextType | undefined>(
  undefined
);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData | null>(null);

  return (
    <PlannerContext.Provider value={{ formData, setFormData }}>
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