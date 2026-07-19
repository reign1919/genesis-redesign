import React, { useState, useRef, memo } from 'react';
import './MobileFAQ.css';

const questions = [
  { id: 'q1', text: 'How it started?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.' },
  { id: 'q2', text: 'Why Genesis?', answer: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.' },
  { id: 'q3', text: 'Deep question?', answer: 'Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.' },
  { id: 'q4', text: 'Deep question?', answer: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.' }
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
        <h2 className="m-faq-title">Frequently Asked</h2>
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
