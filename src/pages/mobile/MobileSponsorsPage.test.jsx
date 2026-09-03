import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MobileSponsorsPage from './MobileSponsorsPage';

vi.mock('../../components/mobile/MobileBackground', () => ({
  default: () => <div data-testid="mobile-bg" />
}));

vi.mock('../../components/mobile/MobileHamburger', () => ({
  default: () => <div data-testid="mobile-hamburger" />
}));

describe('MobileSponsorsPage', () => {
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
        <MobileSponsorsPage />
      </BrowserRouter>
    );

  it('renders mobile sponsor page header and title', () => {
    renderComponent();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/sponsors/i);
    expect(screen.getByText(/partners & sponsors/i)).toBeInTheDocument();
  });

  it('renders all 6 sponsor cards with visit buttons and correct URLs', () => {
    renderComponent();
    expect(screen.getByText('StudyIn')).toBeInTheDocument();
    expect(screen.getByText('n8n')).toBeInTheDocument();
    expect(screen.getByText('.xyz')).toBeInTheDocument();
    expect(screen.getByText('91.9 Friends FM')).toBeInTheDocument();
    expect(screen.getByText('The Telegraph: Young Metro')).toBeInTheDocument();
    expect(screen.getByText('React Kolkata')).toBeInTheDocument();

    const links = screen.getAllByRole('link', { name: /visit.*website/i });
    expect(links).toHaveLength(6);

    const studyinLink = screen.getByRole('link', { name: /visit studyin official website/i });
    expect(studyinLink).toHaveAttribute('href', 'https://gostudyin.com/');
    expect(studyinLink).toHaveAttribute('target', '_blank');
  });

  it('renders mobile partnership banner linking to /partnerships', () => {
    renderComponent();
    const partnerLink = screen.getByRole('link', { name: /become a partner/i });
    expect(partnerLink).toHaveAttribute('href', '/partnerships');
  });
});
