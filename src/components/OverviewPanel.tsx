
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ProjectOverview, OverviewPanelProps } from './overview/types';
import OverviewPanelHeader from './overview/OverviewPanelHeader';
import OverviewTab from './overview/OverviewTab';
import ToneGuideTab from './overview/ToneGuideTab';

// Apple Blue Glassmorphism Styles
const panelStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(4px)',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    borderRadius: '24px',
  },
};

const OverviewPanel: React.FC<OverviewPanelProps> = ({ isOpen, onClose }) => {
  // Load initial data from localStorage or use defaults
  const loadStoredOverview = (): ProjectOverview => {
    const stored = localStorage.getItem('project-overview');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored overview:', error);
      }
    }
    
    return {
      showTitle: "It's a Jungle",
      presenters: ['Alex Chen', 'Maya Rodriguez'],
      recurringSets: ['Studio Main', 'Kitchen Lab', 'Garden Corner'],
      productionDefaults: {
        episodeLength: '45 minutes',
        tone: 'Educational & Entertaining',
        targetAudience: 'Health-conscious adults 25-45'
      }
    };
  };

  const [overview, setOverview] = useState<ProjectOverview>(loadStoredOverview);
  const [savedOverview, setSavedOverview] = useState<ProjectOverview>(loadStoredOverview);
  const [isEditing, setIsEditing] = useState(false);
  const [newPresenter, setNewPresenter] = useState('');
  const [newSet, setNewSet] = useState('');
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Save to localStorage whenever savedOverview changes
  useEffect(() => {
    localStorage.setItem('project-overview', JSON.stringify(savedOverview));
  }, [savedOverview]);

  const handleSave = () => {
    setSavedOverview(overview);
    setIsEditing(false);
    toast({
      title: "Changes saved",
      description: "Your project overview has been updated successfully.",
      duration: 3000,
    });
  };

  const handleCancel = () => {
    setOverview(savedOverview);
    setNewPresenter('');
    setNewSet('');
    setIsEditing(false);
  };

  const addPresenter = () => {
    if (newPresenter.trim()) {
      setOverview(prev => ({
        ...prev,
        presenters: [...prev.presenters, newPresenter.trim()]
      }));
      setNewPresenter('');
    }
  };

  const removePresenter = (index: number) => {
    setOverview(prev => ({
      ...prev,
      presenters: prev.presenters.filter((_, i) => i !== index)
    }));
  };

  const addSet = () => {
    if (newSet.trim()) {
      setOverview(prev => ({
        ...prev,
        recurringSets: [...prev.recurringSets, newSet.trim()]
      }));
      setNewSet('');
    }
  };

  const removeSet = (index: number) => {
    setOverview(prev => ({
      ...prev,
      recurringSets: prev.recurringSets.filter((_, i) => i !== index)
    }));
  };

  const updateProductionDefaults = (field: keyof ProjectOverview['productionDefaults'], value: string) => {
    setOverview(prev => ({
      ...prev,
      productionDefaults: { ...prev.productionDefaults, [field]: value }
    }));
  };

  if (!isOpen) return null;

  const hasChanges = JSON.stringify(overview) !== JSON.stringify(savedOverview);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={panelStyles.overlay}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={panelStyles.card}
      >
        <div className="p-6">
          <OverviewPanelHeader
            isEditing={isEditing}
            hasChanges={hasChanges}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            onClose={onClose}
          />

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tone-guide">Tone Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <OverviewTab
                overview={overview}
                isEditing={isEditing}
                newPresenter={newPresenter}
                newSet={newSet}
                onShowTitleChange={(value) => setOverview(prev => ({ ...prev, showTitle: value }))}
                onAddPresenter={addPresenter}
                onRemovePresenter={removePresenter}
                onNewPresenterChange={setNewPresenter}
                onAddSet={addSet}
                onRemoveSet={removeSet}
                onNewSetChange={setNewSet}
                onProductionDefaultsUpdate={updateProductionDefaults}
              />
            </TabsContent>
            
            <TabsContent value="tone-guide" className="space-y-6">
              <ToneGuideTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
