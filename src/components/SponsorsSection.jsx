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
  { id: 'n8n', name: 'n8n', logo: n8nLogo, alt: 'n8n', website: 'https://n8n.io/' },
  { id: 'studyin', name: 'StudyIn', logo: studyinLogo, alt: 'StudyIn', website: 'https://gostudyin.com/' },
  { id: 'friendsfm', name: '91.9 Friends FM', logo: friendsfmLogo, alt: '91.9 Friends FM', website: 'https://www.youtube.com/919friendsfm' },
];

const row2Sponsors = [
  { id: 'xyz', name: '.xyz', logo: xyzLogo, alt: '.xyz', website: 'https://gen.xyz/' },
  { id: 'reactkolkata', name: 'React Kolkata', logo: reactkolkataLogo, alt: 'React Kolkata', website: 'https://reactkolkata.com/en' },
  { id: 'youngmetro', name: 'The Telegraph: Young Metro', logo: youngmetroLogo, alt: 'The Telegraph: Young Metro', website: 'https://www.telegraphindia.com/topic/the-telegraph-young-metro' },
];

// Duplicate items for continuous, uninterrupted marquee looping.
// Each half contains enough repetitions (8 copies = 24 items, ~5,000px width) so that
// the content spans far beyond even 4K ultrawide viewports (3840px), guaranteeing
// zero blank spaces/pauses during transform and a 100% seamless, continuous loop.
const REPEAT_COUNT_PER_HALF = 8;
const row1Half = Array.from({ length: REPEAT_COUNT_PER_HALF }, () => row1Sponsors).flat();
const row2Half = Array.from({ length: REPEAT_COUNT_PER_HALF }, () => row2Sponsors).flat();

const track1Items = [...row1Half, ...row1Half];
const track2Items = [...row2Half, ...row2Half];

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
              <a
                key={`row1-${sponsor.id}-${index}`}
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-item"
                aria-label={`Visit ${sponsor.name} website (opens in new tab)`}
                onClick={(e) => e.currentTarget.blur()}
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.alt}
                  className={`sponsor-logo-img sponsor-${sponsor.id}`}
                  loading="eager"
                  decoding="async"
                  draggable="false"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Continuous Box for Row 2 — moves RIGHT */}
        <div className="sponsors-row-banner" aria-label="Sponsors Row 2">
          <div className="sponsors-track sponsors-track-right">
            {track2Items.map((sponsor, index) => (
              <a
                key={`row2-${sponsor.id}-${index}`}
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-item"
                aria-label={`Visit ${sponsor.name} website (opens in new tab)`}
                onClick={(e) => e.currentTarget.blur()}
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.alt}
                  className={`sponsor-logo-img sponsor-${sponsor.id}`}
                  loading="eager"
                  decoding="async"
                  draggable="false"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(SponsorsSection);
