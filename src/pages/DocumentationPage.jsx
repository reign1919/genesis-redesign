import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import SEO from '../components/SEO';
import './DocumentationPage.css';
import folderIcon from '../assets/folder.png';

// Import raw markdown files
import privacyPolicy from '../docs/PRIVACY_POLICY.md?raw';
import apiDocs from '../docs/API_DOCUMENTATION.md?raw';

const documents = [
  { id: 'privacy', title: 'PRIVACY POLICY', content: privacyPolicy },
  { id: 'api', title: 'API DOCUMENTATION', content: apiDocs },
];

const DocumentationPage = () => {
  const [activeDoc, setActiveDoc] = useState(documents[0]);

  return (
    <div className="docs-container">
      <SEO
        title="Documentation & Guidelines — Genesis 2026 | Tech Fest Rules & Privacy Policy"
        description="Official documentation, event rules, API details, and privacy policy for Genesis 2026 Tech Fest by Indus Valley World School."
        canonical="/docs"
      />
      <h1 className="sr-only">Genesis 2026 Documentation and Guidelines</h1>
      <header className="docs-tech-header">
        <span className="docs-header-link docs-header-left">GENESIS TECH FEST // DOCUMENTATION</span>
        <Link
          to="/events"
          className="docs-header-link docs-header-right"
          aria-label="Go back to Events"
        >
          RETURN TO EVENTS
        </Link>
      </header>
      <div className="docs-sidebar">
        <h2 className="docs-title">Documentation</h2>
        <div className="docs-list">
          {documents.map((doc) => (
            <button
              key={doc.id}
              className={`doc-item ${activeDoc.id === doc.id ? 'active' : ''}`}
              onClick={() => setActiveDoc(doc)}
            >
              <img src={folderIcon} alt="Documentation Folder Icon" className="folder-icon" />
              <span>{doc.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="docs-content-area">
        <div className="markdown-viewer">
          <ReactMarkdown>{activeDoc.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
