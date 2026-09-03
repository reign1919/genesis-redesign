import React, { memo } from 'react';
import './SponsorsSection.css';

// Direct imports from sponsor-logos without changing how assets are supplied
import n8nLogo from '../../sponsor-logos/n8n_pink+white_logo.png';
import studyinLogo from '../../sponsor-logos/study-in.jpeg';
import friendsfmLogo from '../../sponsor-logos/91-9-fm.jpg';
import xyzLogo from '../../sponsor-logos/xyz-logo-color.png';
import reactkolkataLogo from '../../sponsor-logos/react-kolkata-logo-full-dark.png';
import youngmetroLogo from '../../sponsor-logos/young-metro.jpeg';

const row1Sponsors = [
  { id: 'n8n', name: 'n8n', logo: n8nLogo, alt: 'n8n' },
  { id: 'studyin', name: 'Studyin', logo: studyinLogo, alt: 'Studyin' },
  { id: 'friendsfm', name: '91.9 Friends FM', logo: friendsfmLogo, alt: '91.9 Friends FM' },
];

const row2Sponsors = [
  { id: 'xyz', name: '.xyz', logo: xyzLogo, alt: '.xyz' },
  { id: 'reactkolkata', name: 'React Kolkata', logo: reactkolkataLogo, alt: 'React Kolkata' },
  { id: 'youngmetro', name: 'Young Metro', logo: youngmetroLogo, alt: 'Young Metro' },
];

// Duplicate each row to ensure an uninterrupted, seamless infinite marquee loop
const track1Items = [...row1Sponsors, ...row1Sponsors, ...row1Sponsors, ...row1Sponsors];
const track2Items = [...row2Sponsors, ...row2Sponsors, ...row2Sponsors, ...row2Sponsors];

const SponsorsSection = () => {
  return (
    <section className="sponsors-section" aria-label="Meet Our Sponsors">
      <div className="sponsors-header">
        <span className="sponsors-tag label-caps">[OFFICIAL PARTNERS &amp; SPONSORS]</span>
        <h2 className="sponsors-title">MEET OUR SPONSORS</h2>
      </div>

      <div className="sponsors-marquee-container">
        {/* Row 1 Marquee */}
        <div className="sponsors-track-wrapper">
          <div className="sponsors-track sponsors-track-row1">
            {track1Items.map((sponsor, index) => (
              <div 
                key={`row1-${sponsor.id}-${index}`} 
                className="sponsor-card"
                tabIndex={0}
                aria-label={sponsor.name}
              >
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.alt} 
                  className="sponsor-logo-img" 
                  loading="lazy" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 Marquee */}
        <div className="sponsors-track-wrapper">
          <div className="sponsors-track sponsors-track-row2">
            {track2Items.map((sponsor, index) => (
              <div 
                key={`row2-${sponsor.id}-${index}`} 
                className="sponsor-card"
                tabIndex={0}
                aria-label={sponsor.name}
              >
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.alt} 
                  className="sponsor-logo-img" 
                  loading="lazy" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(SponsorsSection);
