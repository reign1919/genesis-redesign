import React, { memo } from 'react';
import './MobileCommittee.css';

const committeeMembers = [
  { id: 1, name: 'Committee Member 1', role: 'Role' },
  { id: 2, name: 'Committee Member 2', role: 'Role' },
  { id: 3, name: 'Committee Member 3', role: 'Role' },
  { id: 4, name: 'Committee Member 4', role: 'Role' }
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
            <div className="m-polaroid">
              <div className="m-polaroid-dot" />
              <div className="m-polaroid-image" />
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
