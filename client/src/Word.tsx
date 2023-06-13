import React from 'react'

interface WordProps {
  text: string;
  isActive: boolean;
  className?: string;
}

const Word: React.FC<WordProps> = ({ text, isActive, className }) => {
  return <span className={`${className} ${isActive ? 'text-white' : 'text-gray-400'}`}>{text}</span>;
}

export default Word;
