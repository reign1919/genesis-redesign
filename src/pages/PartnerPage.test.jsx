import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PartnerPage from './PartnerPage';
import MobilePartnerPage from './mobile/MobilePartnerPage';

vi.mock('../components/NeuralBackground', () => ({
  default: () => <div data-testid="neural-bg" />
}));

vi.mock('../components/mobile/MobileBackground', () => ({
  default: () => <div data-testid="mobile-bg" />
}));

vi.mock('../components/mobile/MobileHamburger', () => ({
  default: () => <div data-testid="mobile-nav" />
}));

describe('PartnerPage (Desktop)', () => {
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
        <PartnerPage />
      </BrowserRouter>
    );

  it('renders heading "Partner With Genesis" without 2026', () => {
    renderComponent();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/Partner With Genesis$/i);
    expect(h1).not.toHaveTextContent(/Partner With Genesis 2026/i);
  });

  it('renders categories in order: 1 Stall Setup, 2 Track Partnership, 3 Sponsorship', () => {
    renderComponent();
    const tabs = screen.getAllByRole('button').filter(b => b.className.includes('gateway-tab'));
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent(/STALL SETUP/i);
    expect(tabs[1]).toHaveTextContent(/TRACK PARTNERSHIP/i);
    expect(tabs[2]).toHaveTextContent(/SPONSORSHIP/i);
  });

  it('displays stall setup details under Stall Setup category', () => {
    renderComponent();
    expect(screen.getByText('Saturday, 26th September, 2026')).toBeInTheDocument();
    expect(screen.getByText('Indus Valley World School')).toBeInTheDocument();
    expect(screen.getByText(/Approx 7:00 AM to 4:30 PM/i)).toBeInTheDocument();
    expect(screen.getByText(/13–18 years of age, grades 9 to 12/i)).toBeInTheDocument();
    expect(screen.getByText(/250 \(minimum approx\)/i)).toBeInTheDocument();
    expect(screen.getByText('Electricity and Tables')).toBeInTheDocument();
    expect(screen.getByText('No commissions, or setup fee needed')).toBeInTheDocument();
  });

  it('displays closure note for Genesis 26 and invitation for 27 under Track and Sponsorship', () => {
    renderComponent();
    const tabs = screen.getAllByRole('button').filter(b => b.className.includes('gateway-tab'));
    
    // Switch to Track Partnership
    fireEvent.click(tabs[1]);
    expect(screen.getByText(/Sponsorships and track partnerships for Genesis '26 have closed, but we would love to have you for '27/i)).toBeInTheDocument();

    // Switch to Sponsorship
    fireEvent.click(tabs[2]);
    const closureMsgs = screen.getAllByText(/Sponsorships for Genesis '26 have closed, but we would love to have you for '27/i);
    expect(closureMsgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders unified "Register for Sponsorship/Stall Setup" heading on the transmission interface', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /Register for Sponsorship\/Stall Setup/i })).toBeInTheDocument();

    // Verify it remains unified when switching tabs
    const tabs = screen.getAllByRole('button').filter(b => b.className.includes('gateway-tab'));
    fireEvent.click(tabs[1]);
    expect(screen.getByRole('heading', { name: /Register for Sponsorship\/Stall Setup/i })).toBeInTheDocument();

    fireEvent.click(tabs[2]);
    expect(screen.getByRole('heading', { name: /Register for Sponsorship\/Stall Setup/i })).toBeInTheDocument();
  });
});

describe('MobilePartnerPage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: true,
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

  const renderMobile = () =>
    render(
      <BrowserRouter>
        <MobilePartnerPage />
      </BrowserRouter>
    );

  it('renders mobile heading "Partner With Genesis" without 2026', () => {
    renderMobile();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/Partner With Genesis$/i);
    expect(h1).not.toHaveTextContent(/Partner With Genesis 2026/i);
  });

  it('renders mobile categories in order: 1 Stall Setup, 2 Track, 3 Sponsorship', () => {
    renderMobile();
    const tabs = screen.getAllByRole('button').filter(b => b.className.includes('mp-tab'));
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveTextContent(/STALL SETUP/i);
    expect(tabs[1]).toHaveTextContent(/TRACK/i);
    expect(tabs[2]).toHaveTextContent(/SPONSORSHIP/i);
  });

  it('displays stall setup details on mobile', () => {
    renderMobile();
    expect(screen.getByText('Saturday, 26th September, 2026')).toBeInTheDocument();
    expect(screen.getAllByText('Indus Valley World School').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Approx 7:00 AM to 4:30 PM/i)).toBeInTheDocument();
    expect(screen.getByText(/13–18 years of age, grades 9 to 12/i)).toBeInTheDocument();
    expect(screen.getByText(/250 \(minimum approx\)/i)).toBeInTheDocument();
    expect(screen.getByText('Electricity and Tables')).toBeInTheDocument();
    expect(screen.getByText('No commissions, or setup fee needed')).toBeInTheDocument();
  });

  it('renders unified "Register for Sponsorship/Stall Setup" heading on mobile transmission interface', () => {
    renderMobile();
    expect(screen.getByRole('heading', { name: /Register for Sponsorship\/Stall Setup/i })).toBeInTheDocument();
  });
});
