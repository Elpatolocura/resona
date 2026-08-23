import { useState, useEffect, createContext, useContext } from 'react';

interface ContentSettings {
  showMusic: boolean;
  showMovies: boolean;
  showSeries: boolean;
  explicitContent: boolean;
}

interface ContentContextType {
  content: ContentSettings;
  setContent: (content: ContentSettings) => void;
}

const DEFAULT_CONTENT: ContentSettings = {
  showMusic: true,
  showMovies: true,
  showSeries: true,
  explicitContent: false,
};

const ContentContext = createContext<ContentContextType>({
  content: DEFAULT_CONTENT,
  setContent: () => {},
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
    localStorage.setItem('resona_content', JSON.stringify(newContent));
  };

  useEffect(() => {
    const handler = () => {
      const saved = loadContent();
      setContentState(saved);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ContentContext.Provider value={{ content, setContent }}>
      {children}
    </ContentContext.Provider>
  );
}
