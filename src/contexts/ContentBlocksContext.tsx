import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useProject } from './ProjectContext';

// Define the ContentBlock interface
export interface ContentBlock {
  id: string;
  type: string;
  title: string;
  description?: string;
  notes?: string;
  status?: string;
  duration?: number;
  inStoryArc?: boolean;
  aiSource?: 'chatgpt' | 'claude' | 'gemini' | 'perplexity';
  position?: number;
  sequence?: number;
}

// Other interfaces remain the same
export interface ScriptBlock {
  id: string;
  contentBlockId: string;
  where: string;
  ears: string;
  eyes: string;
  status: string;
  title?: string;
  version?: string;
}

export interface TimelineItem {
  id: string;
  contentBlockId: string;
  date: string;
  startTime: string;
  endTime: string;
  locationId: string;
  status: 'planned' | 'confirmed' | 'in-review' | 'completed';
  notes?: string;
  crewIds: string[];
  equipmentIds: string[];
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'host' | 'guest' | 'camera' | 'sound' | 'producer' | 'director' | 'editor' | 'other';
  contact?: string;
  notes?: string;
  availability?: { date: string; available: boolean; }[];
}

export interface Equipment {
  id: string;
  name: string;
  category: 'camera' | 'lens' | 'audio' | 'lighting' | 'misc';
  quantity: number;
  isPacked: boolean;
  barcode?: string;
  notes?: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  mapLink?: string;
  contactName?: string;
  contactInfo?: string;
  constraints?: string;
  notes?: string;
}

interface ContentBlocksContextType {
  contentBlocks: ContentBlock[];
  scriptBlocks: ScriptBlock[];
  timelineItems: TimelineItem[];
  crewMembers: CrewMember[];
  equipmentList: Equipment[];
  locations: Location[];
  
  addContentBlock: (block: Omit<ContentBlock, 'id'>) => Promise<void>;
  updateContentBlock: (id: string, updates: Partial<ContentBlock>) => Promise<void>;
  removeContentBlock: (id: string) => Promise<void>;
  reorderContentBlocks: (blocks: ContentBlock[]) => void;
  updateContentBlockOrder: (blockId: string, newSequence: number) => void;
  
  addScriptBlock: (block: Omit<ScriptBlock, 'id'>) => void;
  updateScriptBlock: (id: string, updates: Partial<ScriptBlock>) => void;
  removeScriptBlock: (id: string) => void;
  
  addTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  removeTimelineItem: (id: string) => void;
  
  addCrewMember: (member: Omit<CrewMember, 'id'>) => void;
  updateCrewMember: (id: string, updates: Partial<CrewMember>) => void;
  removeCrewMember: (id: string) => void;
  
  addEquipment: (item: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  
  addLocation: (location: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  removeLocation: (id: string) => void;
}

const ContentBlocksContext = createContext<ContentBlocksContextType | undefined>(undefined);

export const ContentBlocksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { currentProject } = useProject();
  
  // Fetch content blocks from Supabase filtered by current project
  const { data: contentBlocks = [], isLoading } = useQuery({
    queryKey: ['content_blocks', currentProject?.id],
    queryFn: async () => {
      let query = supabase
        .from('content_blocks')
        .select('*');
      
      // Filter by project if one is selected
      if (currentProject?.id) {
        query = query.eq('project_id', currentProject.id);
      }
      
      const { data, error } = await query.order('sequence', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(block => ({
        id: block.id,
        type: block.type,
        title: block.title,
        description: block.description || '',
        status: block.status || 'draft',
        duration: block.duration || 5,
        inStoryArc: block.in_story_arc || false,
        aiSource: block.ai_source as 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | undefined,
        sequence: block.sequence || 0
      }));
    }
  });

  // Add content block mutation
  const addBlockMutation = useMutation({
    mutationFn: async (block: Omit<ContentBlock, 'id'>) => {
      const id = crypto.randomUUID();
      const { data, error} = await supabase
        .from('content_blocks')
        .insert([{
          id: id,
          type: block.type,
          title: block.title,
          description: block.description,
          status: block.status || 'draft',
          duration: block.duration || 5,
          in_story_arc: block.inStoryArc || false,
          ai_source: block.aiSource,
          sequence: block.sequence || 0,
          project_id: currentProject?.id || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content_blocks', currentProject?.id] });
      toast.success('Content block added!');
    },
    onError: (error) => {
      console.error('Error adding block:', error);
      toast.error('Failed to add content block');
    }
  });

  // Update content block mutation
  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContentBlock> }) => {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.inStoryArc !== undefined) dbUpdates.in_story_arc = updates.inStoryArc;
      if (updates.sequence !== undefined) dbUpdates.sequence = updates.sequence;
      
      const { error } = await supabase
        .from('content_blocks')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content_blocks'] });
    },
    onError: (error) => {
      console.error('Error updating block:', error);
      toast.error('Failed to update content block');
    }
  });

  // Delete content block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content_blocks'] });
      toast.success('Content block deleted');
    },
    onError: (error) => {
      console.error('Error deleting block:', error);
      toast.error('Failed to delete content block');
    }
  });

  // Fetch script blocks from Supabase
  const { data: scriptBlocks = [] } = useQuery({
    queryKey: ['script_blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('script_blocks')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(block => ({
        id: block.id,
        contentBlockId: block.content_block_id,
        where: block.where_location || '',
        ears: block.ears || '',
        eyes: block.eyes || '',
        status: block.status || 'draft',
        title: block.title,
        version: block.version
      }));
    }
  });

  // Fetch timeline items from Supabase
  const { data: timelineItems = [] } = useQuery({
    queryKey: ['timeline_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_items')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        contentBlockId: item.content_block_id,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        locationId: item.location_id,
        status: item.status as 'planned' | 'confirmed' | 'in-review' | 'completed',
        notes: item.notes,
        crewIds: item.crew_ids || [],
        equipmentIds: item.equipment_ids || []
      }));
    }
  });

  // Fetch crew members from Supabase
  const { data: crewMembers = [] } = useQuery({
    queryKey: ['crew_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(member => ({
        id: member.id,
        name: member.name,
        role: member.role as CrewMember['role'],
        contact: member.contact,
        notes: member.notes,
        availability: member.availability
      }));
    }
  });

  // Fetch equipment from Supabase
  const { data: equipmentList = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category as Equipment['category'],
        quantity: item.quantity,
        isPacked: item.is_packed,
        barcode: item.barcode,
        notes: item.notes
      }));
    }
  });

  // Fetch locations from Supabase
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(location => ({
        id: location.id,
        name: location.name,
        address: location.address,
        mapLink: location.map_link,
        contactName: location.contact_name,
        contactInfo: location.contact_info,
        constraints: location.constraints,
        notes: location.notes
      }));
    }
  });

  const addContentBlock = async (block: Omit<ContentBlock, 'id'>) => {
    await addBlockMutation.mutateAsync(block);
  };

  const updateContentBlock = async (id: string, updates: Partial<ContentBlock>) => {
    await updateBlockMutation.mutateAsync({ id, updates });
  };

  const removeContentBlock = async (id: string) => {
    await deleteBlockMutation.mutateAsync(id);
  };

  const reorderContentBlocks = (blocks: ContentBlock[]) => {
    blocks.forEach((block, index) => {
      updateContentBlock(block.id, { sequence: index });
    });
  };

  const updateContentBlockOrder = (blockId: string, newSequence: number) => {
    updateContentBlock(blockId, { sequence: newSequence });
  };

  // Script block mutations
  const addScriptBlockMutation = useMutation({
    mutationFn: async (block: Omit<ScriptBlock, 'id'>) => {
      const { data, error } = await supabase
        .from('script_blocks')
        .insert([{
          content_block_id: block.contentBlockId,
          where_location: block.where,
          ears: block.ears,
          eyes: block.eyes,
          status: block.status,
          title: block.title,
          version: block.version
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script_blocks'] });
      toast.success('Script block added!');
    },
    onError: (error) => {
      console.error('Error adding script block:', error);
      toast.error('Failed to add script block');
    }
  });

  const updateScriptBlockMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ScriptBlock> }) => {
      const dbUpdates: any = {};
      if (updates.where !== undefined) dbUpdates.where_location = updates.where;
      if (updates.ears !== undefined) dbUpdates.ears = updates.ears;
      if (updates.eyes !== undefined) dbUpdates.eyes = updates.eyes;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.version !== undefined) dbUpdates.version = updates.version;
      
      const { error } = await supabase
        .from('script_blocks')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script_blocks'] });
    },
    onError: (error) => {
      console.error('Error updating script block:', error);
      toast.error('Failed to update script block');
    }
  });

  const deleteScriptBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('script_blocks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script_blocks'] });
      toast.success('Script block deleted');
    },
    onError: (error) => {
      console.error('Error deleting script block:', error);
      toast.error('Failed to delete script block');
    }
  });

  const addScriptBlock = (block: Omit<ScriptBlock, 'id'>) => {
    addScriptBlockMutation.mutate(block);
  };
  
  const updateScriptBlock = (id: string, updates: Partial<ScriptBlock>) => {
    updateScriptBlockMutation.mutate({ id, updates });
  };
  
  const removeScriptBlock = (id: string) => {
    deleteScriptBlockMutation.mutate(id);
  };

  // Timeline item mutations
  const addTimelineItemMutation = useMutation({
    mutationFn: async (item: Omit<TimelineItem, 'id'>) => {
      const { data, error } = await supabase
        .from('timeline_items')
        .insert([{
          content_block_id: item.contentBlockId,
          date: item.date,
          start_time: item.startTime,
          end_time: item.endTime,
          location_id: item.locationId,
          status: item.status,
          notes: item.notes,
          crew_ids: item.crewIds,
          equipment_ids: item.equipmentIds
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline_items'] });
      toast.success('Timeline item added!');
    },
    onError: (error) => {
      console.error('Error adding timeline item:', error);
      toast.error('Failed to add timeline item');
    }
  });

  const addTimelineItem = (item: Omit<TimelineItem, 'id'>) => {
    addTimelineItemMutation.mutate(item);
  };
  
  const updateTimelineItem = (id: string, updates: Partial<TimelineItem>) => {
    const dbUpdates: any = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.locationId !== undefined) dbUpdates.location_id = updates.locationId;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.crewIds !== undefined) dbUpdates.crew_ids = updates.crewIds;
    if (updates.equipmentIds !== undefined) dbUpdates.equipment_ids = updates.equipmentIds;
    
    supabase
      .from('timeline_items')
      .update(dbUpdates)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating timeline item:', error);
          toast.error('Failed to update timeline item');
        } else {
          queryClient.invalidateQueries({ queryKey: ['timeline_items'] });
        }
      });
  };
  
  const removeTimelineItem = (id: string) => {
    supabase
      .from('timeline_items')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting timeline item:', error);
          toast.error('Failed to delete timeline item');
        } else {
          queryClient.invalidateQueries({ queryKey: ['timeline_items'] });
          toast.success('Timeline item deleted');
        }
      });
  };

  // Crew, Equipment, and Location mutations (simplified for now)
  const addCrewMember = (member: Omit<CrewMember, 'id'>) => {
    supabase
      .from('crew_members')
      .insert([member])
      .then(({ error }) => {
        if (error) {
          console.error('Error adding crew member:', error);
          toast.error('Failed to add crew member');
        } else {
          queryClient.invalidateQueries({ queryKey: ['crew_members'] });
          toast.success('Crew member added!');
        }
      });
  };
  
  const updateCrewMember = (id: string, updates: Partial<CrewMember>) => {
    supabase
      .from('crew_members')
      .update(updates)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating crew member:', error);
          toast.error('Failed to update crew member');
        } else {
          queryClient.invalidateQueries({ queryKey: ['crew_members'] });
        }
      });
  };
  
  const removeCrewMember = (id: string) => {
    supabase
      .from('crew_members')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting crew member:', error);
          toast.error('Failed to delete crew member');
        } else {
          queryClient.invalidateQueries({ queryKey: ['crew_members'] });
          toast.success('Crew member deleted');
        }
      });
  };

  const addEquipment = (item: Omit<Equipment, 'id'>) => {
    supabase
      .from('equipment')
      .insert([{ ...item, is_packed: item.isPacked }])
      .then(({ error }) => {
        if (error) {
          console.error('Error adding equipment:', error);
          toast.error('Failed to add equipment');
        } else {
          queryClient.invalidateQueries({ queryKey: ['equipment'] });
          toast.success('Equipment added!');
        }
      });
  };
  
  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    const dbUpdates: any = { ...updates };
    if (updates.isPacked !== undefined) {
      dbUpdates.is_packed = updates.isPacked;
      delete dbUpdates.isPacked;
    }
    
    supabase
      .from('equipment')
      .update(dbUpdates)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating equipment:', error);
          toast.error('Failed to update equipment');
        } else {
          queryClient.invalidateQueries({ queryKey: ['equipment'] });
        }
      });
  };
  
  const removeEquipment = (id: string) => {
    supabase
      .from('equipment')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting equipment:', error);
          toast.error('Failed to delete equipment');
        } else {
          queryClient.invalidateQueries({ queryKey: ['equipment'] });
          toast.success('Equipment deleted');
        }
      });
  };

  const addLocation = (location: Omit<Location, 'id'>) => {
    supabase
      .from('locations')
      .insert([{
        name: location.name,
        address: location.address,
        map_link: location.mapLink,
        contact_name: location.contactName,
        contact_info: location.contactInfo,
        constraints: location.constraints,
        notes: location.notes
      }])
      .then(({ error }) => {
        if (error) {
          console.error('Error adding location:', error);
          toast.error('Failed to add location');
        } else {
          queryClient.invalidateQueries({ queryKey: ['locations'] });
          toast.success('Location added!');
        }
      });
  };
  
  const updateLocation = (id: string, updates: Partial<Location>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.mapLink !== undefined) dbUpdates.map_link = updates.mapLink;
    if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName;
    if (updates.contactInfo !== undefined) dbUpdates.contact_info = updates.contactInfo;
    if (updates.constraints !== undefined) dbUpdates.constraints = updates.constraints;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    
    supabase
      .from('locations')
      .update(dbUpdates)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating location:', error);
          toast.error('Failed to update location');
        } else {
          queryClient.invalidateQueries({ queryKey: ['locations'] });
        }
      });
  };
  
  const removeLocation = (id: string) => {
    supabase
      .from('locations')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting location:', error);
          toast.error('Failed to delete location');
        } else {
          queryClient.invalidateQueries({ queryKey: ['locations'] });
          toast.success('Location deleted');
        }
      });
  };

  const value: ContentBlocksContextType = {
    contentBlocks,
    scriptBlocks,
    timelineItems,
    crewMembers,
    equipmentList,
    locations,
    addContentBlock,
    updateContentBlock,
    removeContentBlock,
    reorderContentBlocks,
    updateContentBlockOrder,
    addScriptBlock,
    updateScriptBlock,
    removeScriptBlock,
    addTimelineItem,
    updateTimelineItem,
    removeTimelineItem,
    addCrewMember,
    updateCrewMember,
    removeCrewMember,
    addEquipment,
    updateEquipment,
    removeEquipment,
    addLocation,
    updateLocation,
    removeLocation,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <ContentBlocksContext.Provider value={value}>
      {children}
    </ContentBlocksContext.Provider>
  );
};

export const useContentBlocks = () => {
  const context = useContext(ContentBlocksContext);
  if (!context) {
    throw new Error('useContentBlocks must be used within ContentBlocksProvider');
  }
  return context;
};
