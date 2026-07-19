import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import MobileBackground from '../../components/mobile/MobileBackground';
import MobileHamburger from '../../components/mobile/MobileHamburger';
import './MobileDocumentationPage.css';

// Import raw markdown files
import privacyPolicy from '../../docs/PRIVACY_POLICY.md?raw';
import codeOfConduct from '../../docs/CODE_OF_CONDUCT.md?raw';
import apiDocs from '../../docs/API_DOCUMENTATION.md?raw';

const documents = [
  { id: 'privacy', title: 'PRIVACY POLICY', content: privacyPolicy },
  { id: 'conduct', title: 'CODE OF CONDUCT', content: codeOfConduct },
  { id: 'api', title: 'API DOCUMENTATION', content: apiDocs },
];

const MobileDocumentationPage = () => {
  const [activeDoc, setActiveDoc] = useState(documents[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mdocs-wrapper">
      <MobileBackground />
      <div className="m-grid-overlay" aria-hidden="true" />
      <MobileHamburger />

      <main className="mdocs-content">
        {/* Top Header */}
        <div className="mdocs-header">
          <Link to="/" className="mdocs-back label-caps">← Return to Base</Link>
          <h1 className="mdocs-title">Documentation</h1>
        </div>

        {/* Doc Selector (Mobile Dropdown/Tabs) */}
        <div className="mdocs-selector">
          <button className="mdocs-selector-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="label-caps">Current File:</span>
            <strong>{activeDoc.title}</strong>
            <span className={`mdocs-chevron ${menuOpen ? 'open' : ''}`}>▼</span>
          </button>
          
          {menuOpen && (
            <div className="mdocs-dropdown">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  className={`mdocs-dropdown-item ${activeDoc.id === doc.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveDoc(doc);
                    setMenuOpen(false);
                  }}
                >
                  {doc.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Markdown Content */}
        <div className="mdocs-markdown-area">
          <ReactMarkdown>{activeDoc.content}</ReactMarkdown>
        </div>
      </main>
    </div>
  );
};

export default MobileDocumentationPage;
