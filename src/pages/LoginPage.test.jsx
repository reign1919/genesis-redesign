import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPage from './LoginPage';
import MobileLoginPage from './mobile/MobileLoginPage';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInSchool: vi.fn(),
  loadSchoolCredentials: vi.fn(),
}));

vi.mock('../components/NeuralBackground', () => ({
  default: () => <div data-testid="neural-bg" />,
}));

vi.mock('../components/mobile/MobileBackground', () => ({
  default: () => <div data-testid="mobile-bg" />,
}));

vi.mock('../components/mobile/MobileHamburger', () => ({
  default: () => <div data-testid="mobile-nav" />,
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
  },
}));

vi.mock('../lib/auth', () => ({
  signInSchool: mocks.signInSchool,
}));

vi.mock('../lib/edgeFunctions', () => ({
  loadSchoolCredentials: mocks.loadSchoolCredentials,
}));

vi.mock('../lib/authContext', () => ({
  useAuth: () => ({
    school: null,
    isLoggedIn: false,
    isLoaded: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('LoginPage (Desktop)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: null } });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

  it('renders login form by default with school code and password inputs', () => {
    renderComponent();
    expect(screen.getByLabelText(/School Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ENTER/i })).toBeInTheDocument();
  });

  it('switches to register mode and displays registration form', () => {
    renderComponent();
    const registerToggle = screen.getByRole('button', { name: /^REGISTER$/i });
    fireEvent.click(registerToggle);

    expect(screen.getByLabelText(/School Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/WhatsApp/i)).toBeInTheDocument();
  });
});

describe('MobileLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: null } });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <MobileLoginPage />
      </BrowserRouter>
    );

  it('renders mobile login form by default', () => {
    renderComponent();
    expect(screen.getByLabelText(/School Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ENTER/i })).toBeInTheDocument();
  });

  it('switches to register tab and shows registration inputs on mobile', () => {
    renderComponent();
    const registerTab = screen.getByRole('button', { name: /^REGISTER$/i });
    fireEvent.click(registerTab);

    expect(screen.getByLabelText(/School Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/WhatsApp/i)).toBeInTheDocument();
  });
});
