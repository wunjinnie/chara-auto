import { Project } from '../types';

const PROJECTS_KEY = 'mvDirectorAiProjects';

export const getProjects = (): Project[] => {
  try {
    const projectsJson = localStorage.getItem(PROJECTS_KEY);
    // Sort by most recently saved
    return projectsJson ? JSON.parse(projectsJson).sort((a: Project, b: Project) => b.lastSaved - a.lastSaved) : [];
  } catch (error) {
    console.error("Error loading projects from localStorage", error);
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Error saving projects to localStorage", error);
  }
};
