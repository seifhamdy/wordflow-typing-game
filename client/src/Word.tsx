import React from 'react'

interface WordProps {
  text: string
  isActive: boolean
}

const Word: React.FC<WordProps> = ({ text, isActive }) => {
    return <span className={isActive ? 'active' : ''}>{text} </span>;
  };
  

export default Word
