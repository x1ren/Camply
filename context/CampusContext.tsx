"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
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
  const userSchoolRef = useRef<string | undefined>(undefined);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Always initialize with default value for SSR consistency
  const [selectedCampus, setSelectedCampusState] = useState<string>(
    "Cebu Institute of Technology – University"
  );

  // Hydrate from localStorage after mount
  useEffect(() => {
    const savedCampus = localStorage.getItem("selectedCampus");
    if (savedCampus) {
      setSelectedCampusState(savedCampus);
    }
    setIsHydrated(true);
  }, []);

  // Track user school to detect changes
  useEffect(() => {
    if (user?.school) {
      userSchoolRef.current = user.school;
    }
  }, [user?.school]);

  // Set user's school as default if no saved campus (only once)
  useEffect(() => {
    if (!isHydrated) return;
    
    const savedCampus = localStorage.getItem("selectedCampus");
    
    // Only set user's school if there's no saved campus
    if (!savedCampus && user?.school && selectedCampus !== user.school) {
      console.log("Setting user school as default:", user.school);
      setSelectedCampusState(user.school);
      localStorage.setItem("selectedCampus", user.school);
    }
  }, [user?.school, isHydrated, selectedCampus]); // Run when user.school becomes available

  const setSelectedCampus = (campus: string) => {
    setSelectedCampusState(campus);
    localStorage.setItem("selectedCampus", campus);
  };

  // Memoize isBrowsingOtherCampus using ref to prevent flickering from user changes
  const isBrowsingOtherCampus = useMemo(() => {
    const userSchool = userSchoolRef.current;
    return !!(userSchool && selectedCampus && selectedCampus !== userSchool);
  }, [selectedCampus]);

  return (
    <CampusContext.Provider
      value={{
        selectedCampus,
        setSelectedCampus,
        isBrowsingOtherCampus,
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
