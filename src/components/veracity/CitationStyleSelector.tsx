
import React from 'react';
import { CitationStyle } from '@/types/veracity';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CitationStyleSelectorProps {
  value: CitationStyle;
  onChange: (value: CitationStyle) => void;
}

const CitationStyleSelector: React.FC<CitationStyleSelectorProps> = ({ 
  value, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="citation-style">Citation Style</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as CitationStyle)}
      >
        <SelectTrigger id="citation-style" className="w-full">
          <SelectValue placeholder="Select citation style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inline">Inline Link</SelectItem>
          <SelectItem value="apa">APA Format</SelectItem>
          <SelectItem value="mla">MLA Format</SelectItem>
          <SelectItem value="endnote">Endnote</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        {value === 'inline' && "Direct hyperlinks to sources"}
        {value === 'apa' && "American Psychological Association format"}
        {value === 'mla' && "Modern Language Association format"}
        {value === 'endnote' && "Sources as numbered footnotes at report end"}
      </p>
    </div>
  );
};

export default CitationStyleSelector;
