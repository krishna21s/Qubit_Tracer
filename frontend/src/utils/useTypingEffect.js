import { useState, useEffect } from "react";

/**
 * Typing effect hook
 * @param {string} text - Full text to type
 * @param {number} speed - Delay in ms between typing steps
 * @param {number} step - How many characters to add per step
 */
export function useTypingEffect(text, speed = 50, step = 1) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); // reset

    if (text) {
      let i = 0;

      const typeChar = () => {
        setDisplayedText((prev) => prev + text.slice(i, i + step));
        i += step;
        if (i < text.length) {
          setTimeout(typeChar, speed);
        }
      };

      typeChar();
    }
  }, [text, speed, step]);

  return displayedText;
}
