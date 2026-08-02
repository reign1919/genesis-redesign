import React, { memo } from 'react';
import './MobileCommittee.css';

const committeeMembers = [
  { id: 1, name: 'Trishaan Saha', role: 'AI/ML & Quantum Computing' },
  { id: 2, name: 'Akshat R. Chowdhury', role: 'Cybersecurity' },
  { id: 3, name: 'Dhritiman Das', role: 'Agentic Systems' },
  { id: 4, name: 'Arka Adhikary', role: 'Network Engineering' },
];

const MobileCommittee = () => {
  return (
    <section className="m-committee">
      <div className="m-committee-header">
        <span className="m-committee-eyebrow label-caps">
          <span className="m-committee-dash">—</span> The People
        </span>
        <h2 className="m-committee-title">Core Committee</h2>
      </div>

      <div className="m-committee-scroll">
        {committeeMembers.map((member) => (
          <div key={member.id} className="m-committee-card">
            <div className="m-committee-card-top">
              <span className="m-member-index">[0{member.id}]</span>
              <span className="m-committee-badge">CORE</span>
            </div>
            <div className="m-member-info">
              <h4 className="m-member-name">{member.name}</h4>
              <span className="m-member-role label-caps">{member.role}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="m-scroll-hint label-caps">
        <span>← swipe →</span>
      </div>
    </section>
  );
};

export default memo(MobileCommittee);
