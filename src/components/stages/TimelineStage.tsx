
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsItem } from '@/components/ui/tabs';
import EpisodeOverview from '@/components/timeline/EpisodeOverview';
import ProductionTimelineFixed from '@/components/timeline/ProductionTimelineFixed';

const TimelineStage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Content block types for styling - matching the color scheme from Ideas Lab
  const contentBlockTypes = [
    { type: 'interview', label: 'Interview', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { type: 'piece-to-camera', label: 'Piece to Camera', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { type: 'b-roll', label: 'B-Roll', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    { type: 'demo', label: 'Demo', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { type: 'location', label: 'Location', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    { type: 'narration', label: 'Narration', color: 'bg-lime-100 text-lime-800 border-lime-300' },
    { type: 'graphics', label: 'Graphics', color: 'bg-pink-100 text-pink-800 border-pink-300' },
    { type: 'transition', label: 'Transition', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    { type: 'title', label: 'Title', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { type: 'credits', label: 'Credits', color: 'bg-orange-100 text-orange-800 border-orange-300' }
  ];

  return (
    <div className="flex-1 bg-white">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Timeline</h2>
          <p className="text-gray-600">Plan and manage your episode production schedule and content overview.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border border-gray-400 rounded-lg p-2 shadow-md">
          <TabsItem 
            value="overview"
            className="timeline-refined-tab data-[state=active]:bg-softGold data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-600 hover:bg-lushGreen/10 hover:text-starryBlue transition-all duration-200 text-gray-700 font-semibold"
          >
            Episode Overview
          </TabsItem>
          <TabsItem 
            value="timeline"
            className="timeline-refined-tab data-[state=active]:bg-softGold data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-600 hover:bg-lushGreen/10 hover:text-starryBlue transition-all duration-200 text-gray-700 font-semibold"
          >
            Production Timeline
          </TabsItem>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <EpisodeOverview contentBlockTypes={contentBlockTypes} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <ProductionTimelineFixed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimelineStage;
