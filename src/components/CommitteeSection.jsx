import React, { memo } from 'react';
import './CommitteeSection.css';

const committeeMembers = [
  { id: 1, name: 'Trishaan Saha', role: 'AI/ML & Quantum Computing' },
  { id: 2, name: 'Akshat R. Chowdhury', role: 'Cybersecurity' },
  { id: 3, name: 'Dhritiman Das', role: 'Agentic Systems' },
  { id: 4, name: 'Arka Adhikary', role: 'Network Engineering' },
];

const CommitteeSection = () => {
  return (
    <div className="committee-container">
      <h2 className="committee-title">Meet the Genesis Council</h2>

      <div className="committee-cards-wrapper">
        {committeeMembers.map((member) => (
          <div key={member.id} className="committee-card">
            <div className="committee-card-top">
              <span className="committee-member-index">[0{member.id}]</span>
              <span className="committee-card-badge">CORE</span>
            </div>
            <div className="committee-card-body">
              <h3 className="member-name">{member.name}</h3>
              <span className="member-role label-caps">{member.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(CommitteeSection);
