
export interface ApiKeyTabProps {
  apiKey: string;
  isKeySet: boolean;
  onSave: (key: string) => boolean;
  onClear: () => void;
  onStartEdit: () => void;
  editing: boolean;
  onCancelEdit: () => void;
  inputKey: string;
  onInputChange: (key: string) => void;
  showKey: boolean;
  onToggleShow: () => void;
  keyPlaceholder: string;
  keyLabel: string;
  saveButtonText: string;
  docsUrl: string;
  docsText: string;
}
