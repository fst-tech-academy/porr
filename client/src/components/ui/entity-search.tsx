import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Search, X } from 'lucide-react';

interface EntityOption {
  _id: string;
  display: string;
  type?: string;
}

interface EntitySearchProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<EntityOption[]>;
  error?: string;
  disabled?: boolean;
  className?: string;
  initialLoad?: boolean;
}

const EntitySearch: React.FC<EntitySearchProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSearch,
  error,
  disabled = false,
  className = '',
  initialLoad = true
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<EntityOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<EntityOption | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Load initial suggestions when component mounts
  useEffect(() => {
    if (initialLoad && !hasSearched) {
      loadInitialSuggestions();
    }
  }, [initialLoad, hasSearched]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInitialSuggestions = async () => {
    try {
      setLoading(true);
      const results = await onSearch('');
      setSuggestions(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Failed to load initial suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await onSearch(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
        setHasSearched(true);
      } catch (error) {
        console.error('Search failed:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.trim() === '') {
      setSelectedOption(null);
      onChange('');
      if (initialLoad) {
        loadInitialSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      debouncedSearch(newQuery);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (initialLoad && !hasSearched) {
      loadInitialSuggestions();
    }
  };

  const handleOptionSelect = (option: EntityOption) => {
    setSelectedOption(option);
    setQuery(option.display);
    onChange(option._id);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedOption(null);
    onChange('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const displayValue = selectedOption ? selectedOption.display : query;

  return (
    <div className={`relative ${className}`}>
      <Label htmlFor="entity-search" className="text-black dark:text-white">
        {label}
      </Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
          <Input
            ref={inputRef}
            id="entity-search"
            type="text"
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            disabled={disabled}
            className={`pl-10 pr-10 bg-white text-black dark:bg-slate-800 dark:text-white border-gray-200 dark:border-slate-700 ${
              error ? 'border-red-500' : ''
            }`}
          />
          {displayValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-3 text-center text-slate-500 dark:text-slate-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                <span className="ml-2">Searching...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-3 text-center text-slate-500 dark:text-slate-400">
                No results found
              </div>
            ) : (
              suggestions.map((option) => (
                <div
                  key={option._id}
                  onClick={() => handleOptionSelect(option)}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {option.display}
                    </span>
                    {option.type && (
                      <Badge variant="secondary" className="text-xs">
                        {option.type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default EntitySearch;
