import React from 'react';

interface WordProps {
  text: string;
  isActive: boolean;
  typedInput: string;
  className?: string;
}

const Word: React.FC<WordProps> = ({ text, isActive, typedInput, className }) => {
  const getLetterColor = (index: number) => {
    if (!isActive) {
      return 'text-gray-400';
    }

    const typedWord = typedInput.trim();
    const currentCorrectWord = text.trim();
    const typedLetters = typedWord.split('');
    const correctLetters = currentCorrectWord.split('');

    if (typedLetters.length <= index) {
      return 'text-white';
    } else if (typedLetters[index] === correctLetters[index]) {
      return 'text-green-500';
    } else {
      return 'text-red-500';
    }
  };

  const getDisplayedLetters = () => {
    const typedWord = typedInput.trim();
    const currentCorrectWord = text.trim();

    if (!isActive) {
      return text;
    } else {
      return typedWord.length >= currentCorrectWord.length ? typedWord : currentCorrectWord;
    }
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
