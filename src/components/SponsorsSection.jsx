import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import './SponsorsSection.css';

// Direct imports from sponsor-logos with updated transparent assets
import n8nLogo from '../../sponsor-logos/n8n_pink+white_logo.png';
import studyinLogo from '../../sponsor-logos/study-in-removebg-preview.png';
import friendsfmLogo from '../../sponsor-logos/91-9-fm-removebg-preview.png';
import xyzLogo from '../../sponsor-logos/xyz-logo-color.png';
import reactkolkataLogo from '../../sponsor-logos/raact-kolkata-logo-full-light.png';
import youngmetroLogo from '../../sponsor-logos/young-metro-removebg-preview.png';

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

// Duplicate items for continuous, uninterrupted marquee looping
const track1Items = [...row1Sponsors, ...row1Sponsors, ...row1Sponsors, ...row1Sponsors];
const track2Items = [...row2Sponsors, ...row2Sponsors, ...row2Sponsors, ...row2Sponsors];

const SponsorsSection = () => {
  return (
    <section className="sponsors-section" aria-label="Meet Our Sponsors">
      <div className="sponsors-header">
        <span className="sponsors-tag label-caps">[OFFICIAL PARTNERS &amp; SPONSORS]</span>
        <h2 className="sponsors-title">MEET OUR SPONSORS</h2>
        <Link to="/sponsors" className="sponsors-view-directory-btn label-caps">
          <span>VIEW ALL SPONSORS &amp; BRIEFS</span>
          <span className="btn-arrow" aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="sponsors-marquee-container">
        {/* Continuous Box for Row 1 — moves LEFT */}
        <div className="sponsors-row-banner" aria-label="Sponsors Row 1">
          <div className="sponsors-track sponsors-track-left">
            {track1Items.map((sponsor, index) => (
              <div 
                key={`row1-${sponsor.id}-${index}`} 
                className="sponsor-item"
                tabIndex={0}
                aria-label={sponsor.name}
              >
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.alt} 
                  className={`sponsor-logo-img sponsor-${sponsor.id}`} 
                  loading="lazy" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Continuous Box for Row 2 — moves RIGHT */}
        <div className="sponsors-row-banner" aria-label="Sponsors Row 2">
          <div className="sponsors-track sponsors-track-right">
            {track2Items.map((sponsor, index) => (
              <div 
                key={`row2-${sponsor.id}-${index}`} 
                className="sponsor-item"
                tabIndex={0}
                aria-label={sponsor.name}
              >
                <img 
                  src={sponsor.logo} 
                  alt={sponsor.alt} 
                  className={`sponsor-logo-img sponsor-${sponsor.id}`} 
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
