import React from 'react';
import "./index.css"

interface WordProps {
  text: string;
  isActive: boolean;
  typedInput: string;
  currentLetterIndex: number;
  className?: string;
}

const Word: React.FC<WordProps> = ({ text, isActive, typedInput, currentLetterIndex, className }) => {
  const getLetterColor = (index: number) => {
    if (!isActive) {
      return 'text-gray-400';
    }

    const typedWord = typedInput.trim();
    const currentCorrectWord = text.trim();
    const typedLetters = typedWord.split('');
    const correctLetters = currentCorrectWord.split('');

    if (typedLetters.length <= index) {
      if (index === currentLetterIndex) {
        return 'text-white cursor-blink'; // Add the 'cursor-blink' class to make the cursor visible
      } else {
        return 'text-white';
      }
    } else if (typedLetters[index] === correctLetters[index]) {
      return 'text-green-500';
    } else {
      return 'text-red-500';
    }
  };

  const getDisplayedLetters = () => {
    const typedWord = typedInput.trim();
    const currentCorrectWord = text.trim();
    const displayedLetters = [...currentCorrectWord];

    if (isActive) {
      for (let i = 0; i < typedWord.length; i++) {
        if (typedWord[i] !== currentCorrectWord[i]) {
          if (i < currentCorrectWord.length) {
            displayedLetters[i] = typedWord[i];
          } else {
            displayedLetters.push(typedWord[i]);
          }
        }
      }
    }

    return displayedLetters.join('');
  };

  return (
    <span className={className}>
      {getDisplayedLetters().split('').map((letter, index) => (
        <span
          key={index}
          className={getLetterColor(index)}
        >
          {letter}
        </span>
      ))}
    </span>
  );
};

export default Word;