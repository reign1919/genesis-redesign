import React, { useState, useEffect } from 'react';
import './BrandBlock.css';

import schoolLogo from '../../iconsredesign/icons/schoollogo.png';
import festLogo from '../../iconsredesign/icons/festlogo.png';

const MESSAGES = [
  'git commit -m "innovate, ideate, inspire"',
  'git commit -m "building the future"',
  'init genesis_protocol.sh',
  'sys.boot() --verbose'
];

const BrandBlock = () => {
  const [text, setText] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMsg = MESSAGES[msgIndex];
    const typingSpeed = isDeleting ? 30 : 80;
    
    if (!isDeleting && text === currentMsg) {
      const pause = setTimeout(() => setIsDeleting(true), 2500);
      return () => clearTimeout(pause);
    }
    
    if (isDeleting && text === '') {
      setIsDeleting(false);
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
      return;
    }

    const timeout = setTimeout(() => {
      setText(prev => 
        isDeleting ? currentMsg.substring(0, prev.length - 1) : currentMsg.substring(0, prev.length + 1)
      );
    }, typingSpeed + Math.random() * 30);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, msgIndex]);

  return (
    <div className="brand-block-container">
      <div className="brand-logos">
        <img src={schoolLogo} alt="Indus Valley World School" className="logo-school" />
        <img src={festLogo} alt="Genesis Brain Logo" className="logo-fest" />
      </div>
      
      <div className="brand-tagline">
        <code>{text}<span className="cursor blink">_</span></code>
      </div>
      
      <h1 className="brand-title">
        GENESIS
      </h1>
    </div>
  );
};

export default BrandBlock;
