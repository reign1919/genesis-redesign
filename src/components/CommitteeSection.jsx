import React from 'react';
import './CommitteeSection.css';

const CommitteeSection = () => {
  const committeeMembers = [
    { id: 1, name: 'Committee Member 1', role: 'Role' },
    { id: 2, name: 'Committee Member 2', role: 'Role' },
    { id: 3, name: 'Committee Member 3', role: 'Role' },
    { id: 4, name: 'Committee Member 4', role: 'Role' }
  ];

  return (
    <div className="committee-container">
      <h2 className="committee-title">The Core Committee</h2>
      
      <div className="committee-cards-wrapper">
        {committeeMembers.map((member, index) => {
          // Add slight alternating rotation to cards for a scattered polaroid feel
          const rotationClass = `rotate-${(index % 4) + 1}`;
          
          return (
            <div key={member.id} className={`committee-card-container ${rotationClass}`}>
              <div className="polaroid-frame">
                {/* Small red dot on polaroid */}
                <div className="polaroid-dot"></div>
                
                {/* Placeholder Image */}
                <div className="polaroid-image-placeholder"></div>
              </div>
              <div className="member-info">
                <h4 className="member-name">{member.name}</h4>
                <span className="member-role label-caps">{member.role}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommitteeSection;
