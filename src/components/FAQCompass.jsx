import React, { useState, memo } from 'react';
import CompassSVG from './CompassSVG';
import './FAQCompass.css';

const FAQCompass = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const questions = [
    { 
      id: 'q1', 
      text: 'How do I register?', 
      answer: 'For Schools: You can successfully register by requesting credentials via the "Register" button on the homepage.\n\nFor Students: Individual registration is not permitted. If you would like to participate, please ask your school to register.' 
    },
    { 
      id: 'q2', 
      text: 'When and where?', 
      answer: 'Genesis will be hosted at the Indus Valley World School campus on September 26, 2026.' 
    },
    { 
      id: 'q3', 
      text: 'How did it start?', 
      answer: 'Genesis began a few months ago as the shared vision of two tech-passionate students, Trishaan and Akshat (or popularly known as “Taxat”). We wanted to elevate IVWS in the inter-school community by creating an unparalleled tech fest, turning a simple spark of ambition into the premier platform for innovation you see today.' 
    },
    { 
      id: 'q4', 
      text: 'How is Genesis different?', 
      answer: 'Unlike traditional fests, Genesis is built from the ground up by students who know exactly what modern tech enthusiasts want. Instead of just answering questions, participants tackle cutting-edge domains to build actual solutions staying true to our motto: Ideate, Innovate, Inspire. Because tech isn\'t just for hardcore coders anymore, Genesis blends logic, design, and business, challenging developers and strategists to work together. Ultimately, it’s more than a competition; it’s a networking hub where the brightest minds break out of their silos to connect, create, and inspire one another.' 
    }
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
      <h2 className="sr-only">About the Festival &amp; Frequently Asked Questions</h2>
      
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

export default memo(FAQCompass);
