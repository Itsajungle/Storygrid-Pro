
export interface ProjectOverview {
  showTitle: string;
  presenters: string[];
  recurringSets: string[];
  productionDefaults: {
    episodeLength: string;
    tone: string;
    targetAudience: string;
  };
}

export interface OverviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
