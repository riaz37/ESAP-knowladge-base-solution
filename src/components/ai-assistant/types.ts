// Core interface types
export interface AIInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export type QueryType = 'database' | 'file';

// Business Rules types
export interface BusinessRulesState {
  content: string;
  status: "loading" | "loaded" | "error" | "none";
  error?: string;
}

// Query History types
export interface QueryHistoryItem {
  query: string;
  result: any;
  timestamp: Date;
  type: QueryType;
}

// Component prop types
export interface UserConfigurationStatusProps {
  userId: string | null;
  databaseId: string | null;
  databaseName: string | null;
  businessRules: BusinessRulesState;
}

export interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export interface QueryStatusProps {
  loading: boolean;
  error: string | null;
}

export interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onSelect: (item: QueryHistoryItem) => void;
  onClear: () => void;
}

// Tab component types
export interface QueryTabProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  suggestions: string[];
}

export interface DatabaseQueryTabProps extends QueryTabProps {
  loading: boolean;
} 