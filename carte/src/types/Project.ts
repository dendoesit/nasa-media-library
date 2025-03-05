export interface Project {
    id: string
    name: string
    description: string
    createdAt: Date
    updatedAt: Date
    tabs: {
      general: GeneralTab
      technical: TechnicalTab
      financial: FinancialTab
      resources: ResourcesTab
    }
  }
  
  export interface GeneralTab {
    projectType: string
    clientName: string
    startDate: Date
    endDate: Date
    uploadedFile?: {
      name: string
      url: string
      type: string
    }
  }
  
  export interface TechnicalTab {
    technologies: string[]
    complexity: 'Low' | 'Medium' | 'High'
    technicalRequirements: string
    uploadedFile?: {
      name: string
      url: string
      type: string
    }
  }
  
  export interface FinancialTab {
    budget: number
    estimatedCost: number
    currency: string
    profitMargin: number
    uploadedFile?: {
      name: string
      url: string
      type: string
    }
  }
  
  export interface ResourcesTab {
    teamMembers: string[]
    requiredSkills: string[]
    equipmentNeeded: string[]
    uploadedFile?: {
      name: string
      url: string
      type: string
    }
  }