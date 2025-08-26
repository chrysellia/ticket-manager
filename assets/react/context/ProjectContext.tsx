import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Project } from '../types/project';
import { ProjectService } from '../services/projectService';

interface ProjectContextValue {
  projects: Project[];
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  loading: boolean;
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
        // Restore selection or default to first project
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? Number(stored) : NaN;
        if (!Number.isNaN(parsed) && list.some(p => p.id === parsed)) {
          setSelectedProjectIdState(parsed);
        } else if (list.length > 0) {
          setSelectedProjectIdState(list[0].id);
          window.localStorage.setItem(STORAGE_KEY, String(list[0].id));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const setSelectedProjectId = (id: number | null) => {
    setSelectedProjectIdState(id);
    if (id == null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, String(id));
    }
  };

  const value = useMemo(() => ({ projects, selectedProjectId, setSelectedProjectId, loading }), [projects, selectedProjectId, loading]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
