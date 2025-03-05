import React, { useState, useEffect } from 'react'
import { useProjects } from '@/context/ProjectContext'
import { useAuth } from '@/context/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  FolderIcon, 
  LogOutIcon, 
  UserIcon,
  EyeIcon,
  PencilIcon,
  Download,
  Save,
  Upload
} from 'lucide-react'
import { Project } from '@/types/Project'
import { useReactToPrint } from 'react-to-print';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Dashboard: React.FC = () => {
  const { projects, createProject, updateProject } = useProjects()
  const { user, logout } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [pdfContents, setPdfContents] = useState<Record<string, string>>({});
  const [constructionName, setConstructionName] = useState('');
  const [address, setAddress] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [designer, setDesigner] = useState('');
  const [builder, setBuilder] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const componentRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 2cm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background: white;
        }
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-before: always;
        }
        .pdf-content {
          display: block !important;
          visibility: visible !important;
          position: static !important;
          left: auto !important;
          top: auto !important;
          width: 100% !important;
          height: auto !important;
        }
        object {
          display: block !important;
          visibility: visible !important;
          width: 100% !important;
          height: 800px !important;
          margin: 20px 0 !important;
        }
      }
    `
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setProjectName(project.name)
      setProjectDescription(project.description)
      setConstructionName(project.constructionName || '');
      setAddress(project.address || '');
      setBeneficiary(project.beneficiary || '');
      setDesigner(project.designer || '');
      setBuilder(project.builder || '');
      setStartDate(new Date(project.startDate || ''));
      setEndDate(new Date(project.endDate || ''));
    } else {
      setEditingProject(null)
      setProjectName('')
      setProjectDescription('')
      setConstructionName('');
      setAddress('');
      setBeneficiary('');
      setDesigner('');
      setBuilder('');
      setStartDate(new Date());
      setEndDate(new Date());
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProject(null)
    setProjectName('')
    setProjectDescription('')
    setConstructionName('');
    setAddress('');
    setBeneficiary('');
    setDesigner('');
    setBuilder('');
    setStartDate(new Date());
    setEndDate(new Date());
  }

  const handleSubmit = () => {
    if (!projectName) return

    if (editingProject) {
      updateProject(editingProject.id, {
        name: projectName,
        description: projectDescription,
        constructionName: constructionName,
        address: address,
        beneficiary: beneficiary,
        designer: designer,
        builder: builder,
        startDate: startDate,
        endDate: endDate,
        tabs: {
          general: {
            projectType: '',
            clientName: '',
            startDate: new Date(),
            endDate: new Date()
          },
          technical: {
            technologies: [],
            complexity: 'Low',
            technicalRequirements: ''
          },
          financial: {
            budget: 0,
            estimatedCost: 0,
            currency: 'USD',
            profitMargin: 0
          },
          resources: {
            teamMembers: [],
            requiredSkills: [],
            equipmentNeeded: []
          }
        }
      })
    } else {
      createProject({
        name: projectName,
        description: projectDescription,
        constructionName: constructionName,
        address: address,
        beneficiary: beneficiary,
        designer: designer,
        builder: builder,
        startDate: startDate,
        endDate: endDate,
        tabs: {
          general: {
            projectType: '',
            clientName: '',
            startDate: new Date(),
            endDate: new Date()
          },
          technical: {
            technologies: [],
            complexity: 'Low',
            technicalRequirements: ''
          },
          financial: {
            budget: 0,
            estimatedCost: 0,
            currency: 'USD',
            profitMargin: 0
          },
          resources: {
            teamMembers: [],
            requiredSkills: [],
            equipmentNeeded: []
          }
        }
      })
    }

    handleCloseModal()
  }

  const handleInputChange = (tab: keyof Project['tabs'], field: string, value: any) => {
    if (!selectedProject) return;

    const updatedProject = {
      ...selectedProject,
      tabs: {
        ...selectedProject.tabs,
        [tab]: {
          ...selectedProject.tabs[tab],
          [field]: value
        }
      }
    };

    setSelectedProject(updatedProject);
  };

  const handleSave = async (tab: keyof Project['tabs']) => {
    if (!selectedProject) return;
    
    setIsSaving(true);
    try {
      await updateProject(selectedProject.id, {
        tabs: {
          ...selectedProject.tabs,
          [tab]: selectedProject.tabs[tab]
        }
      });
      // Show success message or feedback
    } catch (error) {
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  // Function to extract text from PDF
  const extractPdfText = async (file: File, tab: keyof Project['tabs']) => {
    try {
      setPdfContents(prev => ({
        ...prev,
        [tab]: 'Extracting text from PDF...'
      }));

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `Page ${i}:\n${pageText}\n\n`;
      }

      if (!fullText.trim()) {
        throw new Error('No text content found in the PDF');
      }

      setPdfContents(prev => ({
        ...prev,
        [tab]: fullText
      }));
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      setPdfContents(prev => ({
        ...prev,
        [tab]: `Error extracting PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  };

  // Update handleFileUpload to handle errors better
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, tab: keyof Project['tabs']) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProject) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size should be less than 10MB');
      return;
    }

    setIsUploading(prev => ({ ...prev, [tab]: true }));

    try {
      const fileUrl = URL.createObjectURL(file);
      
      // Extract text from PDF
      await extractPdfText(file, tab);
      
      // Update the project with the file information
      await updateProject(selectedProject.id, {
        tabs: {
          ...selectedProject.tabs,
          [tab]: {
            ...selectedProject.tabs[tab],
            uploadedFile: {
              name: file.name,
              url: fileUrl,
              type: file.type
            }
          }
        }
      });

      // Update the selected project state
      setSelectedProject({
        ...selectedProject,
        tabs: {
          ...selectedProject.tabs,
          [tab]: {
            ...selectedProject.tabs[tab],
            uploadedFile: {
              name: file.name,
              url: fileUrl,
              type: file.type
            }
          }
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
      // Clear the file input
      event.target.value = '';
    } finally {
      setIsUploading(prev => ({ ...prev, [tab]: false }));
    }
  };

  // Update handleRemoveFile to clear PDF content
  const handleRemoveFile = async (tab: keyof Project['tabs']) => {
    if (!selectedProject) return;

    try {
      await updateProject(selectedProject.id, {
        tabs: {
          ...selectedProject.tabs,
          [tab]: {
            ...selectedProject.tabs[tab],
            uploadedFile: undefined
          }
        }
      });

      setSelectedProject({
        ...selectedProject,
        tabs: {
          ...selectedProject.tabs,
          [tab]: {
            ...selectedProject.tabs[tab],
            uploadedFile: undefined
          }
        }
      });

      // Clear the PDF content
      setPdfContents(prev => {
        const newContents = { ...prev };
        delete newContents[tab];
        return newContents;
      });
    } catch (error) {
      console.error('Error removing file:', error);
      alert('Error removing file');
    }
  };

  const renderFileUpload = (tab: keyof Project['tabs']) => (
    <div className="mt-6 border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-700">Additional Documents</h3>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileUpload(e, tab)}
            className="hidden"
            id={`file-upload-${tab}`}
            disabled={isUploading[tab]}
          />
          <label
            htmlFor={`file-upload-${tab}`}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            {isUploading[tab] ? 'Uploading...' : 'Upload PDF'}
          </label>
        </div>
      </div>
      {selectedProject?.tabs[tab].uploadedFile && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-gray-600">
                {selectedProject.tabs[tab].uploadedFile?.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={selectedProject.tabs[tab].uploadedFile?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View PDF
              </a>
              <button
                onClick={() => handleRemoveFile(tab)}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPdfContent = () => (
    <div ref={componentRef} className="pdf-content hidden">
      {/* Title Page */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Cartea Tehnica</h1>
        <h2 className="text-2xl font-semibold mb-8">{selectedProject?.name}</h2>
        <p className="text-lg text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* General Info */}
      <div className="page-break">
        <h2 className="text-2xl font-bold mb-6">General Information</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Project Type</h3>
            <p>{selectedProject?.tabs.general.projectType || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Client Name</h3>
            <p>{selectedProject?.tabs.general.clientName || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Project Timeline</h3>
            <p>Start Date: {new Date(selectedProject?.tabs.general.startDate || '').toLocaleDateString()}</p>
            <p>End Date: {new Date(selectedProject?.tabs.general.endDate || '').toLocaleDateString()}</p>
          </div>
        </div>
        {selectedProject?.tabs.general.uploadedFile && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Additional Documents</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium mb-2">{selectedProject.tabs.general.uploadedFile.name}</h4>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {pdfContents['general'] || 'Loading PDF content...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Technical Specs */}
      <div className="page-break">
        <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Technologies</h3>
            <p>{selectedProject?.tabs.technical.technologies.join(', ') || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Complexity</h3>
            <p>{selectedProject?.tabs.technical.complexity}</p>
          </div>
          <div>
            <h3 className="font-semibold">Technical Requirements</h3>
            <p className="whitespace-pre-wrap">{selectedProject?.tabs.technical.technicalRequirements || 'Not specified'}</p>
          </div>
        </div>
        {selectedProject?.tabs.technical.uploadedFile && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Additional Documents</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium mb-2">{selectedProject.tabs.technical.uploadedFile.name}</h4>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {pdfContents['technical'] || 'Loading PDF content...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial */}
      <div className="page-break">
        <h2 className="text-2xl font-bold mb-6">Financial Information</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Budget</h3>
            <p>{selectedProject?.tabs.financial.budget.toLocaleString()} {selectedProject?.tabs.financial.currency}</p>
          </div>
          <div>
            <h3 className="font-semibold">Estimated Cost</h3>
            <p>{selectedProject?.tabs.financial.estimatedCost.toLocaleString()} {selectedProject?.tabs.financial.currency}</p>
          </div>
          <div>
            <h3 className="font-semibold">Profit Margin</h3>
            <p>{selectedProject?.tabs.financial.profitMargin}%</p>
          </div>
        </div>
        {selectedProject?.tabs.financial.uploadedFile && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Additional Documents</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium mb-2">{selectedProject.tabs.financial.uploadedFile.name}</h4>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {pdfContents['financial'] || 'Loading PDF content...'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="page-break">
        <h2 className="text-2xl font-bold mb-6">Resources</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Team Members</h3>
            <p>{selectedProject?.tabs.resources.teamMembers.join(', ') || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Required Skills</h3>
            <p>{selectedProject?.tabs.resources.requiredSkills.join(', ') || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Equipment Needed</h3>
            <p>{selectedProject?.tabs.resources.equipmentNeeded.join(', ') || 'Not specified'}</p>
          </div>
        </div>
        {selectedProject?.tabs.resources.uploadedFile && (
          <div className="mt-8">
            <h3 className="font-semibold mb-4">Additional Documents</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium mb-2">{selectedProject.tabs.resources.uploadedFile.name}</h4>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {pdfContents['resources'] || 'Loading PDF content...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProjectCreationForm = () => (
    <div className="space-y-4">
      <input 
        type="text"
        placeholder="Denumirea construcției"
        value={constructionName}
        onChange={(e) => setConstructionName(e.target.value)}
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
      />
      <input 
        type="text"
        placeholder="Adresa și localizarea"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
      />
      <input 
        type="text"
        placeholder="Beneficiarul"
        value={beneficiary}
        onChange={(e) => setBeneficiary(e.target.value)}
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
      />
      <input 
        type="text"
        placeholder="Proiectantul"
        value={designer}
        onChange={(e) => setDesigner(e.target.value)}
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
      />
      <input 
        type="text"
        placeholder="Constructorul"
        value={builder}
        onChange={(e) => setBuilder(e.target.value)}
        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
      />
      <div className="grid grid-cols-2 gap-4">
        <input 
          type="date"
          placeholder="Data începerii lucrărilor"
          value={startDate.toISOString().split('T')[0]}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
        />
        <input 
          type="date"
          placeholder="Data finalizării lucrărilor"
          value={endDate.toISOString().split('T')[0]}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-2 rounded-full">
              <UserIcon className="text-primary-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{user?.username}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <button 
            onClick={() => handleOpenModal()}
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition"
          >
            <PlusIcon size={20} />
            <span>New Project</span>
          </button>
        </div>

        <nav className="mt-4">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Your Projects
          </h3>
          <div className="mt-2 space-y-1">
            {projects.map(project => (
              <div 
                key={project.id} 
                className={`flex items-center px-4 py-2 text-sm cursor-pointer transition-colors ${
                  selectedProject?.id === project.id 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <FolderIcon className="mr-3 text-primary-500" size={20} />
                {project.name}
              </div>
            ))}
          </div>
        </nav>

        <div className="mt-auto p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <LogOutIcon size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {selectedProject ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
                <div className="flex items-center gap-4">
                  <Button onClick={handlePrint} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
              </div>

              {renderPdfContent()}

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Informații Generale</TabsTrigger>
                  <TabsTrigger value="technical">Specificații Tehnice</TabsTrigger>
                  <TabsTrigger value="financial">Informații Financiare</TabsTrigger>
                  <TabsTrigger value="resources">Resurse</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                  <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Denumirea Produsului</label>
                      <input
                        type="text"
                        value={selectedProject.tabs.general.projectType}
                        onChange={(e) => handleInputChange('general', 'projectType', e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți denumirea produsului"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cod Produs</label>
                      <input
                        type="text"
                        value={selectedProject.tabs.general.clientName}
                        onChange={(e) => handleInputChange('general', 'clientName', e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți codul produsului"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categorie Produs</label>
                      <select
                        value={selectedProject.tabs.general.projectType}
                        onChange={(e) => handleInputChange('general', 'projectType', e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="">Selectați categoria</option>
                        <option value="electronice">Produse Electronice</option>
                        <option value="mecanice">Produse Mecanice</option>
                        <option value="software">Software</option>
                        <option value="altele">Altele</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Emiterii</label>
                        <input
                          type="date"
                          value={new Date(selectedProject.tabs.general.startDate).toISOString().split('T')[0]}
                          onChange={(e) => handleInputChange('general', 'startDate', new Date(e.target.value))}
                          className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Revizuirii</label>
                        <input
                          type="date"
                          value={new Date(selectedProject.tabs.general.endDate).toISOString().split('T')[0]}
                          onChange={(e) => handleInputChange('general', 'endDate', new Date(e.target.value))}
                          className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => handleSave('general')}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Se salvează...' : 'Salvează Modificările'}
                      </Button>
                    </div>
                    {renderFileUpload('general')}
                  </div>
                </TabsContent>

                <TabsContent value="technical" className="mt-6">
                  <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrierea Produsului</label>
                      <textarea
                        value={selectedProject.tabs.technical.technicalRequirements}
                        onChange={(e) => handleInputChange('technical', 'technicalRequirements', e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[150px]"
                        placeholder="Introduceți descrierea detaliată a produsului"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caracteristici Tehnice</label>
                      <textarea
                        value={selectedProject.tabs.technical.technicalRequirements}
                        onChange={(e) => handleInputChange('technical', 'technicalRequirements', e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[150px]"
                        placeholder="Specificați caracteristicile tehnice principale"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cerințe de Calitate</label>
                      <textarea
                        value={selectedProject.tabs.technical.technicalRequirements}
                        onChange={(e) => handleInputChange('technical', 'technicalRequirements', e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[150px]"
                        placeholder="Specificați cerințele de calitate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Norme și Standarde Aplicate</label>
                      <input
                        type="text"
                        value={selectedProject.tabs.technical.technologies.join(', ')}
                        onChange={(e) => handleInputChange('technical', 'technologies', e.target.value.split(',').map(t => t.trim()))}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți normele și standardele aplicabile"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => handleSave('technical')}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Se salvează...' : 'Salvează Modificările'}
                      </Button>
                    </div>
                    {renderFileUpload('technical')}
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="mt-6">
                  <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost de Producție</label>
                      <input
                        type="number"
                        value={selectedProject.tabs.financial.budget}
                        onChange={(e) => handleInputChange('financial', 'budget', Number(e.target.value))}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți costul de producție"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preț de Vânzare Recomandat</label>
                      <input
                        type="number"
                        value={selectedProject.tabs.financial.estimatedCost}
                        onChange={(e) => handleInputChange('financial', 'estimatedCost', Number(e.target.value))}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți prețul de vânzare recomandat"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                      <select
                        value={selectedProject.tabs.financial.currency}
                        onChange={(e) => handleInputChange('financial', 'currency', e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="RON">RON</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marja de Profit (%)</label>
                      <input
                        type="number"
                        value={selectedProject.tabs.financial.profitMargin}
                        onChange={(e) => handleInputChange('financial', 'profitMargin', Number(e.target.value))}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți marja de profit"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => handleSave('financial')}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Se salvează...' : 'Salvează Modificările'}
                      </Button>
                    </div>
                    {renderFileUpload('financial')}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                  <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Echipamente Necesare</label>
                      <input
                        type="text"
                        value={selectedProject.tabs.resources.equipmentNeeded.join(', ')}
                        onChange={(e) => handleInputChange('resources', 'equipmentNeeded', e.target.value.split(',').map(t => t.trim()))}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți echipamentele necesare (separate prin virgulă)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Personal Necesar</label>
                      <input
                        type="text"
                        value={selectedProject.tabs.resources.teamMembers.join(', ')}
                        onChange={(e) => handleInputChange('resources', 'teamMembers', e.target.value.split(',').map(t => t.trim()))}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți personalul necesar (separat prin virgulă)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calificări Necesare</label>
                      <input
                        type="text"
                        value={selectedProject.tabs.resources.requiredSkills.join(', ')}
                        onChange={(e) => handleInputChange('resources', 'requiredSkills', e.target.value.split(',').map(t => t.trim()))}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Introduceți calificările necesare (separate prin virgulă)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condiții de Producție</label>
                      <textarea
                        value={selectedProject.tabs.resources.technicalRequirements}
                        onChange={(e) => handleInputChange('resources', 'technicalRequirements', e.target.value)}
                        className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[150px]"
                        placeholder="Descrieți condițiile necesare pentru producție"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => handleSave('resources')}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Se salvează...' : 'Salvează Modificările'}
                      </Button>
                    </div>
                    {renderFileUpload('resources')}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {project.name}
                      </h3>
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <FolderIcon size={16} />
                        <span className="text-xs">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <UserIcon size={16} />
                        <span className="text-xs">0 Members</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t p-4 flex justify-between">
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="text-gray-600 hover:text-primary-600 text-sm flex items-center space-x-1"
                    >
                      <EyeIcon size={16} />
                      <span>View Project</span>
                    </button>
                    <button 
                      onClick={() => handleOpenModal(project)}
                      className="text-gray-600 hover:text-primary-600 text-sm flex items-center space-x-1"
                    >
                      <PencilIcon size={16} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            {renderProjectCreationForm()}
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard