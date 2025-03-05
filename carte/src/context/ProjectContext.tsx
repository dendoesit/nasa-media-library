import React, { createContext, useState, useContext, ReactNode } from 'react'
import { Project } from '@/types/Project'

interface ProjectContextType {
  projects: Project[]
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Project
  updateProject: (id: string, updatedProject: Partial<Project>) => void
  deleteProject: (id: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([])

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt'>): Project => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      ...projectData
    }
    setProjects(prev => [...prev, newProject])
    return newProject
  }

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id ? { ...project, ...updatedProject } : project
      )
    )
  }

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id))
  }

  return (
    <ProjectContext.Provider value={{ projects, createProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}