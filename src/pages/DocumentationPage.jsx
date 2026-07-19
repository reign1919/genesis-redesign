import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './DocumentationPage.css';
import folderIcon from '../assets/folder.png';

// Import raw markdown files
import privacyPolicy from '../docs/PRIVACY_POLICY.md?raw';
import codeOfConduct from '../docs/CODE_OF_CONDUCT.md?raw';
import apiDocs from '../docs/API_DOCUMENTATION.md?raw';

const documents = [
  { id: 'privacy', title: 'PRIVACY POLICY', content: privacyPolicy },
  { id: 'conduct', title: 'CODE OF CONDUCT', content: codeOfConduct },
  { id: 'api', title: 'API DOCUMENTATION', content: apiDocs },
];

const DocumentationPage = () => {
  const [activeDoc, setActiveDoc] = useState(documents[0]);

  return (
    <div className="docs-container">
      <div className="docs-sidebar">
        <h2 className="docs-title">Documentation</h2>
        <div className="docs-list">
          {documents.map((doc) => (
            <button
              key={doc.id}
              className={`doc-item ${activeDoc.id === doc.id ? 'active' : ''}`}
              onClick={() => setActiveDoc(doc)}
            >
              <img src={folderIcon} alt="Folder" className="folder-icon" />
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
