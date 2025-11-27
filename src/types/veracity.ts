
export type VeracityType = 'fact' | 'tone';
export type VeracityStatus = 'accepted' | 'dismissed' | 'needs-rewrite';
export type CitationStyle = 'inline' | 'apa' | 'mla' | 'endnote';

export interface TextPosition {
  start: number;
  end: number;
}

export interface SourceReference {
  title: string;
  url: string;
  source: string; // e.g., "NIH", "WHO", "Mayo Clinic"
}

export interface VeracityFlag {
  id: string;
  type: VeracityType;
  issue: string;
  flaggedText: string;
  position: TextPosition;
  suggestion?: string;
  sources?: SourceReference[];
  status?: VeracityStatus;
  comment?: string;
  confidenceRating?: number; // 0-100 confidence rating
  citationSummary?: string; // 2-3 sentence summary of the citation context
}

export type FactCheckResult = VeracityFlag;

export interface ExportOptions {
  includeScriptText: boolean;
  includeSourceLinks: boolean;
  includeComments: boolean;
  citationStyle: CitationStyle;
  episodeTitle?: string;
  scriptVersion?: string;
  reviewerName?: string;
}
