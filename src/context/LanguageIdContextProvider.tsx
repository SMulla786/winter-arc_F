import {createContext, ReactNode, useEffect, useState} from 'react';

// Define the type for your context value
interface LanguageIdContextType {
  languageId: string | null;
  setLanguageId: (id: string) => void;
}

// Create the context with a default value
export const LanguageIdContext = createContext<
  LanguageIdContextType | undefined
>(undefined);

const LanguageIdContextProvider = ({children}: {children: ReactNode}) => {
  const [languageId, setLanguageId] = useState<string | null>(null);

  // Retrieve languageId from localStorage on initial load
  useEffect(() => {
    const localLanguageId = localStorage.getItem('languageId');

    if (localLanguageId) {
      setLanguageId(localLanguageId);
    }
  }, []);

  // Set languageId in localStorage whenever it changes
  const updateLanguageId = (id: string) => {
    setLanguageId(id);
    localStorage.setItem('languageId', id);
  };

  // Value of the context
  const contextValue = {
    languageId,
    setLanguageId: updateLanguageId,
  };

  return (
    <LanguageIdContext.Provider value={contextValue}>
      {children}
    </LanguageIdContext.Provider>
  );
};

export default LanguageIdContextProvider;
