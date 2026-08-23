import { useState, useEffect, createContext, useContext, useCallback } from 'react';

export interface ContentSettings {
  showMusic: boolean;
  showMovies: boolean;
  showSeries: boolean;
  explicitContent: boolean;
  spanishOnly?: boolean;
}

interface ContentContextType {
  content: ContentSettings;
  setContent: (content: ContentSettings) => void;
  persistContent: () => void;
}

const DEFAULT_CONTENT: ContentSettings = {
  showMusic: true,
  showMovies: true,
  showSeries: true,
  explicitContent: false,
  spanishOnly: false,
};

const ContentContext = createContext<ContentContextType>({
  content: DEFAULT_CONTENT,
  setContent: () => {},
  persistContent: () => {},
});

export const useContent = () => useContext(ContentContext);

function loadContent(): ContentSettings {
  try {
    const saved = localStorage.getItem('resona_content');
    return saved ? { ...DEFAULT_CONTENT, ...JSON.parse(saved) } : DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContentState] = useState<ContentSettings>(loadContent);

  const setContent = (newContent: ContentSettings) => {
    setContentState(newContent);
  };

  const persistContent = useCallback(() => {
    localStorage.setItem('resona_content', JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    const handler = () => {
      const saved = loadContent();
      setContentState(saved);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ContentContext.Provider value={{ content, setContent, persistContent }}>
      {children}
    </ContentContext.Provider>
  );
}
