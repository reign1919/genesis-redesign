import React, { useState } from 'react';
import CompassSVG from './CompassSVG';
import './FAQCompass.css';

const FAQCompass = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const questions = [
    { id: 'q1', text: 'How it started?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.' },
    { id: 'q2', text: 'Why Genesis?', answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.' },
    { id: 'q3', text: 'Deep question?', answer: 'Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.' },
    { id: 'q4', text: 'Deep question?', answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.' }
  ];

  const handleQuestionClick = (q) => {
    if (activeQuestion?.id === q.id) {
      setActiveQuestion(null); // toggle off if clicking same question
    } else {
      setActiveQuestion(q);
    }
  };

  const closePanel = () => {
    setActiveQuestion(null);
  };

  return (
    <div className={`faq-compass-container ${activeQuestion ? 'panel-open' : ''}`}>
      
      {/* Left side: Interactive Compass */}
      <div className="faq-interactive-zone">
        <div className="faq-rotating-wrapper">
          <CompassSVG size={300} color="var(--accent-mid)" />
          
          {/* Question buttons positioned around compass */}
          {questions.map((q, index) => {
            const positions = ['top', 'right', 'bottom', 'left'];
            const posClass = `pos-${positions[index]}`;
            const isActive = activeQuestion?.id === q.id;
            
            return (
              <button 
                key={q.id} 
                className={`faq-question-btn ${posClass} ${isActive ? 'active' : ''}`}
                onClick={() => handleQuestionClick(q)}
              >
                <span className="faq-question-text">{q.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side: Answer Panel (Sliding in) */}
      <div className={`faq-answer-panel ${activeQuestion ? 'visible' : ''}`}>
        {activeQuestion && (
          <div className="answer-content">
            <button className="close-btn" onClick={closePanel}>×</button>
            <h3 className="answer-title">{activeQuestion.text}</h3>
            <div className="answer-bar"></div>
            <p className="answer-body">{activeQuestion.answer}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default FAQCompass;
