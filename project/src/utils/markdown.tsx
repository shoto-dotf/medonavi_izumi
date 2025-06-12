import React from 'react';
import ReactMarkdown from 'react-markdown';

export const parseMarkdown = (text: string): React.ReactElement | null => {
  if (!text) return null;
  
  return <ReactMarkdown>{text}</ReactMarkdown>;
};