import React, {useState, useEffect, useRef} from 'react';
import {useFormContext, Controller} from 'react-hook-form';

interface Suggestion {
  id?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  languageId?: string;
  caterorId?: string;
  priority?: string;
}

interface SearchInputWithSuggestionsProps {
  name: string;
  label?: string;
  placeholder?: string;
  suggestions: Suggestion[];
  onDishSearch?: (dishId: string, dishName: string) => void;
  onDishClear?: () => void;
  defaultValue?: string; // dishId
}

const SearchInputWithSuggestions: React.FC<SearchInputWithSuggestionsProps> = ({
  name,
  label,
  placeholder,
  suggestions = [],
  onDishSearch,
  onDishClear,
  defaultValue = '',
}) => {
  const {control} = useFormContext();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<Suggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  // 🔁 Sync dish name when dishId (defaultValue) is received
  useEffect(() => {
    if (defaultValue && suggestions.length > 0) {
      const matched = suggestions.find((d) => d.id === defaultValue);
      if (matched?.name) {
        setSearchTerm(matched.name);
      }
    }
  }, [defaultValue, suggestions]);

  // 🔍 Filter suggestions on typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredOptions(suggestions);
      } else {
        const results = suggestions.filter((suggestion) =>
          suggestion.name?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredOptions(results);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, suggestions]);

  const handleSelectSuggestion = (
    id?: string,
    dishName?: string,
    onChange?: (val: string) => void,
  ) => {
    if (dishName && id) {
      setSearchTerm(dishName);
      setFilteredOptions([]);
      if (onDishSearch) onDishSearch(id, dishName);
      if (onChange) onChange(dishName);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!searchTerm.trim()) {
      setFilteredOptions(suggestions);
    } else {
      const results = suggestions.filter((s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredOptions(results);
    }
    if (onDishClear) onDishClear();
  };

  const handleBlur = () => setTimeout(() => setIsFocused(false), 200);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(e.target as Node) &&
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.target as Node)
    ) {
      setIsFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({field}) => (
        <div className="relative">
          {label && (
            <label className="mb-2.5 block text-black dark:text-white">
              {label}
            </label>
          )}

          <input
            {...field}
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              field.onChange(value);
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-2 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            aria-expanded={!!filteredOptions.length}
            aria-haspopup="listbox"
          />

          {isFocused && filteredOptions.length > 0 && (
            <ul
              ref={suggestionsRef}
              className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded border border-stroke bg-white shadow-lg dark:bg-form-input"
              role="listbox"
            >
              {filteredOptions.map((option) => (
                <li
                  key={option.id || Math.random()}
                  onClick={() =>
                    handleSelectSuggestion(
                      option.id,
                      option.name,
                      field.onChange,
                    )
                  }
                  className="hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer p-2"
                  role="option"
                  aria-selected={searchTerm === option.name}
                >
                  {option.name || 'Unnamed Dish'}
                </li>
              ))}
            </ul>
          )}

          {isFocused && filteredOptions.length === 0 && searchTerm && (
            <div className="absolute z-10 mt-2 w-full rounded border border-stroke bg-white shadow-lg dark:bg-form-input">
              <p className="text-gray-600 p-2">No results found</p>
            </div>
          )}
        </div>
      )}
    />
  );
};

export default SearchInputWithSuggestions;
