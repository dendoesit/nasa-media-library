import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Save } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useProjects } from '@/context/ProjectContext';
import { Project } from '@/types/Project';

const ProjectView: React.FC = () => {
  const { projectId } = useParams();
  const { projects, updateProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const foundProject = projects.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
    }
  }, [projectId, projects]);

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
        }
        .no-print {
          display: none;
        }
        .page-break {
          page-break-before: always;
        }
      }
    `
  });

  const handleInputChange = (tab: keyof Project['tabs'], field: string, value: any) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      tabs: {
        ...project.tabs,
        [tab]: {
          ...project.tabs[tab],
          [field]: value
        }
      }
    };

    setProject(updatedProject);
  };

  const handleSave = async (tab: keyof Project['tabs']) => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await updateProject(project.id, {
        tabs: {
          ...project.tabs,
          [tab]: project.tabs[tab]
        }
      });
      // Show success message or feedback
    } catch (error) {
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return <div className="container mx-auto p-6">Project not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* PDF Content */}
      <div ref={componentRef} className="hidden">
        {/* Title Page */}
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Cartea Tehnica</h1>
          <h2 className="text-2xl font-semibold mb-8">{project.name}</h2>
          <p className="text-lg text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* General Info */}
        <div className="page-break">
          <h2 className="text-2xl font-bold mb-6">General Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Project Type</h3>
              <p>{project.tabs.general.projectType || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Client Name</h3>
              <p>{project.tabs.general.clientName || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Project Timeline</h3>
              <p>Start Date: {new Date(project.tabs.general.startDate).toLocaleDateString()}</p>
              <p>End Date: {new Date(project.tabs.general.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="page-break">
          <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Technologies</h3>
              <p>{project.tabs.technical.technologies.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Complexity</h3>
              <p>{project.tabs.technical.complexity}</p>
            </div>
            <div>
              <h3 className="font-semibold">Technical Requirements</h3>
              <p className="whitespace-pre-wrap">{project.tabs.technical.technicalRequirements || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="page-break">
          <h2 className="text-2xl font-bold mb-6">Financial Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Budget</h3>
              <p>{project.tabs.financial.budget.toLocaleString()} {project.tabs.financial.currency}</p>
            </div>
            <div>
              <h3 className="font-semibold">Estimated Cost</h3>
              <p>{project.tabs.financial.estimatedCost.toLocaleString()} {project.tabs.financial.currency}</p>
            </div>
            <div>
              <h3 className="font-semibold">Profit Margin</h3>
              <p>{project.tabs.financial.profitMargin}%</p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="page-break">
          <h2 className="text-2xl font-bold mb-6">Resources</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Team Members</h3>
              <p>{project.tabs.resources.teamMembers.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Required Skills</h3>
              <p>{project.tabs.resources.requiredSkills.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Equipment Needed</h3>
              <p>{project.tabs.resources.equipmentNeeded.join(', ') || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="no-print">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="technical">Technical Specs</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <input
                  type="text"
                  value={project.tabs.general.projectType}
                  onChange={(e) => handleInputChange('general', 'projectType', e.target.value)}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter project type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={project.tabs.general.clientName}
                  onChange={(e) => handleInputChange('general', 'clientName', e.target.value)}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter client name"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={new Date(project.tabs.general.startDate).toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('general', 'startDate', new Date(e.target.value))}
                    className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={new Date(project.tabs.general.endDate).toISOString().split('T')[0]}
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
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="mt-6">
            <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                <input
                  type="text"
                  value={project.tabs.technical.technologies.join(', ')}
                  onChange={(e) => handleInputChange('technical', 'technologies', e.target.value.split(',').map(t => t.trim()))}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter technologies (comma-separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
                <select
                  value={project.tabs.technical.complexity}
                  onChange={(e) => handleInputChange('technical', 'complexity', e.target.value)}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technical Requirements</label>
                <textarea
                  value={project.tabs.technical.technicalRequirements}
                  onChange={(e) => handleInputChange('technical', 'technicalRequirements', e.target.value)}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors min-h-[150px]"
                  placeholder="Enter technical requirements"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleSave('technical')}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="mt-6">
            <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="number"
                  value={project.tabs.financial.budget}
                  onChange={(e) => handleInputChange('financial', 'budget', Number(e.target.value))}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter budget"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                <input
                  type="number"
                  value={project.tabs.financial.estimatedCost}
                  onChange={(e) => handleInputChange('financial', 'estimatedCost', Number(e.target.value))}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter estimated cost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={project.tabs.financial.currency}
                  onChange={(e) => handleInputChange('financial', 'currency', e.target.value)}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profit Margin (%)</label>
                <input
                  type="number"
                  value={project.tabs.financial.profitMargin}
                  onChange={(e) => handleInputChange('financial', 'profitMargin', Number(e.target.value))}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter profit margin"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleSave('financial')}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                <input
                  type="text"
                  value={project.tabs.resources.teamMembers.join(', ')}
                  onChange={(e) => handleInputChange('resources', 'teamMembers', e.target.value.split(',').map(t => t.trim()))}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter team members (comma-separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                <input
                  type="text"
                  value={project.tabs.resources.requiredSkills.join(', ')}
                  onChange={(e) => handleInputChange('resources', 'requiredSkills', e.target.value.split(',').map(t => t.trim()))}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter required skills (comma-separated)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Needed</label>
                <input
                  type="text"
                  value={project.tabs.resources.equipmentNeeded.join(', ')}
                  onChange={(e) => handleInputChange('resources', 'equipmentNeeded', e.target.value.split(',').map(t => t.trim()))}
                  className="w-full px-3 py-2 text-base rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter equipment needed (comma-separated)"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleSave('resources')}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectView; 