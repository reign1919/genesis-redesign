import React, { useState, useRef, memo } from 'react';
import './MobileFAQ.css';

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

const AccordionItem = ({ q, isOpen, onToggle }) => {
  const contentRef = useRef(null);

  return (
    <div className={`m-faq-item ${isOpen ? 'open' : ''}`}>
      <button className="m-faq-question" onClick={onToggle} aria-expanded={isOpen}>
        <span className="m-faq-q-dot" />
        <span className="m-faq-q-text">{q.text}</span>
        <span className="m-faq-chevron">{isOpen ? '−' : '+'}</span>
      </button>
      <div
        className="m-faq-answer-wrapper"
        style={{
          height: isOpen ? contentRef.current?.scrollHeight || 'auto' : 0,
        }}
      >
        <div ref={contentRef} className="m-faq-answer">
          <div className="m-faq-answer-bar" />
          <p>{q.answer}</p>
        </div>
      </div>
    </div>
  );
};

const MobileFAQ = () => {
  const [openId, setOpenId] = useState(null);

  const toggleItem = (id) => {
    setOpenId(prev => prev === id ? null : id);
  };

  return (
    <section className="m-faq-section" id="about">
      <div className="m-faq-header">
        <span className="m-faq-eyebrow label-caps">
          <span className="m-faq-dash">—</span> About Genesis
        </span>
        <h2 className="m-faq-title">About the Festival &amp; Frequently Asked Questions</h2>
      </div>

      <div className="m-faq-list">
        {questions.map((q) => (
          <AccordionItem
            key={q.id}
            q={q}
            isOpen={openId === q.id}
            onToggle={() => toggleItem(q.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default memo(MobileFAQ);
