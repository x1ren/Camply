"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";

interface CampusContextType {
  selectedCampus: string;
  setSelectedCampus: (campus: string) => void;
  isBrowsingOtherCampus: boolean;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

// Popular campuses list - can be expanded or fetched from API
const POPULAR_CAMPUSES = [
  "University of San Carlos",
  "University of Cebu",
  "Cebu Institute of Technology – University",
  "University of the Philippines Cebu",
  "University of San Jose–Recoletos",
  "Southwestern University PHINMA",
  "Cebu Normal University",
  "University of the Visayas",
  "Velez College",
  "Cebu Doctors' University",
];

export function CampusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedCampus, setSelectedCampusState] = useState<string>("");

  // Initialize from localStorage or user's school
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCampus = localStorage.getItem("selectedCampus");
      if (savedCampus) {
        setSelectedCampusState(savedCampus);
      } else if (user?.school) {
        setSelectedCampusState(user.school);
        localStorage.setItem("selectedCampus", user.school);
      } else {
        // Set default campus if no saved campus and no user school
        const defaultCampus = "Cebu Institute of Technology – University";
        setSelectedCampusState(defaultCampus);
        localStorage.setItem("selectedCampus", defaultCampus);
      }
    }
  }, [user?.school]);

  const setSelectedCampus = (campus: string) => {
    setSelectedCampusState(campus);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCampus", campus);
    }
  };

  const isBrowsingOtherCampus = user?.school && selectedCampus !== user.school;

  return (
    <CampusContext.Provider
      value={{
        selectedCampus:
          selectedCampus ||
          user?.school ||
          "Cebu Institute of Technology – University",
        setSelectedCampus,
        isBrowsingOtherCampus: !!isBrowsingOtherCampus,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error("useCampus must be used within a CampusProvider");
  }
  return context;
}

export { POPULAR_CAMPUSES };
