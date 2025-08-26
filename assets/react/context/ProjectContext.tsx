import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Project } from '../types/project';
import { ProjectService } from '../services/projectService';

interface ProjectContextValue {
  projects: Project[];
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  loading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);
const STORAGE_KEY = 'tm.selectedProjectId';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await ProjectService.getProjects();
        if (!mounted) return;
        setProjects(list);
        // Restore selection or leave null for first-time users
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? Number(stored) : NaN;
        if (!Number.isNaN(parsed) && list.some(p => p.id === parsed)) {
          setSelectedProjectIdState(parsed);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const refreshProjects = async () => {
    const list = await ProjectService.getProjects();
    setProjects(list);
    // Ensure selection remains valid
    if (selectedProjectId != null && !list.some(p => p.id === selectedProjectId)) {
      const next = list[0]?.id ?? null;
      setSelectedProjectId(next);
    }
  };

  const setSelectedProjectId = (id: number | null) => {
    setSelectedProjectIdState(id);
    if (id == null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, String(id));
    }
  };

  const value = useMemo(
    () => ({ projects, selectedProjectId, setSelectedProjectId, loading, refreshProjects }),
    [projects, selectedProjectId, loading]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
