import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import Word from "./Word";

const App: React.FC = () => {
  const [input, setInput] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    fetchRandomWord();
  }, []);

  const fetchRandomWord = async () => {
    try {
      const response = await fetch("https://random-word-api.herokuapp.com/word");
      const data = await response.json();
      setCurrentWord(data[0]);
    } catch (error) {
      console.log("Error fetching random word:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (e.target.value.trim() === currentWord && e.target.value.endsWith(" ")) {
      setInput("");
      setScore((prevScore) => prevScore + 1);
      fetchRandomWord();
    }
  };

  return (
    <div className="App">
      <h1>Typing Game</h1>
      <p>Score: {score}</p>
      <p>
        <Word text={currentWord} isActive={true} />
      </p>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default App;
