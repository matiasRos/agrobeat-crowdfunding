'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface StoriesViewerContextType {
  isOpen: boolean;
  initialIndex: number;
  openStories: (index?: number) => void;
  closeStories: () => void;
}

const StoriesViewerContext = createContext<StoriesViewerContextType | undefined>(undefined);

export function StoriesViewerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openStories = (index: number = 0) => {
    setInitialIndex(index);
    setIsOpen(true);
  };

  const closeStories = () => {
    setIsOpen(false);
  };

  return (
    <StoriesViewerContext.Provider value={{ isOpen, initialIndex, openStories, closeStories }}>
      {children}
    </StoriesViewerContext.Provider>
  );
}

export function useStoriesViewer() {
  const context = useContext(StoriesViewerContext);
  if (!context) {
    throw new Error('useStoriesViewer must be used within StoriesViewerProvider');
  }
  return context;
}

