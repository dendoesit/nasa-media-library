import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProjectProvider } from '@/context/ProjectContext'
import router from './router'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <RouterProvider router={router} />
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App