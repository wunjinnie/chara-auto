import React from 'react';
import { Project } from '../types';
import { LogoIcon } from './icons';

interface ProjectsListProps {
  projects: Project[];
  onCreateNew: () => void;
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, onCreateNew, onLoadProject, onDeleteProject }) => {
  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the project "${title}"? This action cannot be undone.`)) {
      onDeleteProject(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <LogoIcon />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              MV Director AI
            </h1>
          </div>
        </header>

        <main className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">My Projects</h2>
            <button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold py-2 px-4 rounded-md hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105"
            >
              Create New Project
            </button>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">You have no saved projects.</p>
                <p className="text-slate-500 text-sm">Click "Create New Project" to get started.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {projects.map((project) => (
                  <li key={project.id} className="bg-slate-900/70 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-slate-800/90 transition-colors">
                    <div className="flex-1 text-center sm:text-left">
                      <p className="font-bold text-lg text-slate-100">{project.songTitle}</p>
                      <p className="text-xs text-slate-500">Last saved: {new Date(project.lastSaved).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => onLoadProject(project.id)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md transition-colors"
                      >
                        Load
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id, project.songTitle)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-colors"
                        aria-label={`Delete project ${project.songTitle}`}
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectsList;
