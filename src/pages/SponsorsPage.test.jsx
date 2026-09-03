import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SponsorsPage from './SponsorsPage';

vi.mock('../components/NeuralBackground', () => ({
  default: () => <div data-testid="neural-bg" />
}));

describe('SponsorsPage (Desktop)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <SponsorsPage />
      </BrowserRouter>
    );

  it('renders page heading and subtitle', () => {
    renderComponent();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/empowering the next generation of builders/i);
    expect(screen.getByText(/official partners & sponsors/i)).toBeInTheDocument();
  });

  it('renders all 6 sponsor names and briefs', () => {
    renderComponent();
    expect(screen.getByText('StudyIn')).toBeInTheDocument();
    expect(screen.getByText('n8n')).toBeInTheDocument();
    expect(screen.getByText('.xyz')).toBeInTheDocument();
    expect(screen.getByText('91.9 Friends FM')).toBeInTheDocument();
    expect(screen.getByText('The Telegraph: Young Metro')).toBeInTheDocument();
    expect(screen.getByText('React Kolkata')).toBeInTheDocument();

    expect(screen.getByText(/Premier global education and overseas admissions consultancy/i)).toBeInTheDocument();
    expect(screen.getByText(/Fair-code workflow automation platform/i)).toBeInTheDocument();
    expect(screen.getByText(/boundary-pushing domain registry/i)).toBeInTheDocument();
  });

  it('renders external links with target="_blank" and rel="noopener noreferrer"', () => {
    renderComponent();
    const link = screen.getByRole('link', { name: /visit studyin official website/i });
    expect(link).toHaveAttribute('href', 'https://gostudyin.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders partner CTA banner linking to /partnerships', () => {
    renderComponent();
    const partnerCta = screen.getByRole('link', { name: /become a partner/i });
    expect(partnerCta).toHaveAttribute('href', '/partnerships');
  });

  it('renders all 6 sponsor logos with alt text', () => {
    renderComponent();
    expect(screen.getByAltText('StudyIn logo')).toBeInTheDocument();
    expect(screen.getByAltText('n8n logo')).toBeInTheDocument();
    expect(screen.getByAltText('.xyz logo')).toBeInTheDocument();
    expect(screen.getByAltText('91.9 Friends FM logo')).toBeInTheDocument();
    expect(screen.getByAltText('The Telegraph: Young Metro logo')).toBeInTheDocument();
    expect(screen.getByAltText('React Kolkata logo')).toBeInTheDocument();
  });
});
