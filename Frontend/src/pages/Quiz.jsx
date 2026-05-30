import React from 'react'; 
import { useState, useEffect } from "react";
import "./Quiz.css"

export default function Quiz({
  question,
  timer,
  onSubmitAnswer,
}) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelectedAnswer("");
     setSubmitted(false);
  }, [question]);

  if (!question) {
    return <h2>Waiting for question...</h2>;
  }

  return (
  <div className="quiz-container">
  <div className="quiz-card">

    <h2 className="question-title">
      Quiz Started
    </h2>

    <div className="timer">
      ⏳ {timer}s
    </div>

    <h2>{question.question}</h2>

    <label className="option">
      <input
        type="radio"
        name="answer"
        disabled={submitted}
        value={question.optionA}
        checked={selectedAnswer === question.optionA}
        onChange={(e) =>
          setSelectedAnswer(e.target.value)
        }
      />
      {" "}
      {question.optionA}
    </label>

    <label className="option">
      <input
        type="radio"
        name="answer"
        value={question.optionB}
        checked={selectedAnswer === question.optionB}
        onChange={(e) =>
          setSelectedAnswer(e.target.value)
        }
      />
      {" "}
      {question.optionB}
    </label>

    <label className="option">
      <input
        type="radio"
        name="answer"
        value={question.optionC}
        checked={selectedAnswer === question.optionC}
        onChange={(e) =>
          setSelectedAnswer(e.target.value)
        }
      />
      {" "}
      {question.optionC}
    </label>

    <label className="option">
      <input
        type="radio"
        name="answer"
        value={question.optionD}
        checked={selectedAnswer === question.optionD}
        onChange={(e) =>
          setSelectedAnswer(e.target.value)
        }
      />
      {" "}
      {question.optionD}
    </label>

  <button
  className="submit-btn"
  disabled={!selectedAnswer || submitted}
  onClick={() => {
    onSubmitAnswer(selectedAnswer);
    setSubmitted(true);
  }}
>
  {submitted ? "Answer Submitted ✓" : "Submit Answer"}
</button>

  </div>
</div>
  );
}