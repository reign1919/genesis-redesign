import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SponsorsSection from './SponsorsSection';

describe('SponsorsSection', () => {
  it('renders the sponsors section heading and landmark', () => {
    render(
      <MemoryRouter>
        <SponsorsSection />
      </MemoryRouter>
    );
    const section = screen.getByRole('region', { name: /meet our sponsors/i });
    expect(section).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 2, name: /meet our sponsors/i });
    expect(heading).toBeInTheDocument();

    const dirLink = screen.getByRole('link', { name: /view all sponsors & briefs/i });
    expect(dirLink).toHaveAttribute('href', '/sponsors');
  });

  it('renders all 6 unique sponsors in the marquee tracks', () => {
    render(
      <MemoryRouter>
        <SponsorsSection />
      </MemoryRouter>
    );

    // Check alt texts
    const n8nLogos = screen.getAllByAltText(/n8n/i);
    const studyinLogos = screen.getAllByAltText(/studyin/i);
    const friendsfmLogos = screen.getAllByAltText(/friends\s*fm/i);
    const xyzLogos = screen.getAllByAltText(/\.xyz|xyz/i);
    const reactkolkataLogos = screen.getAllByAltText(/react\s*kolkata/i);
    const youngmetroLogos = screen.getAllByAltText(/young\s*metro/i);

    // Each should be duplicated for the seamless loop
    expect(n8nLogos.length).toBeGreaterThanOrEqual(2);
    expect(studyinLogos.length).toBeGreaterThanOrEqual(2);
    expect(friendsfmLogos.length).toBeGreaterThanOrEqual(2);
    expect(xyzLogos.length).toBeGreaterThanOrEqual(2);
    expect(reactkolkataLogos.length).toBeGreaterThanOrEqual(2);
    expect(youngmetroLogos.length).toBeGreaterThanOrEqual(2);
  });
});
