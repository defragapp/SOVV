import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from './index';

// Mock Lottie as it's heavy and depends on browser APIs not fully available in JSDOM
jest.mock('react-lottie-player', () => {
  return function MockLottie() {
    return <div data-testid="mock-lottie" />;
  };
});

describe('Hero Component', () => {
  it('renders semantic headings and labels', () => {
    render(<Hero />);
    
    // Check for main heading
    const title = screen.getByText(/Where you put your focus is where you go/i);
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');

    // Check for aria-label on section
    expect(screen.getByLabelText(/Sovereign entry/i)).toBeInTheDocument();
  });

  it('renders the wordmark logo', () => {
    render(<Hero />);
    const logo = screen.getByAltText(/Sovereign OS/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/svg/wordmark.svg');
  });

  it('includes accessibility aria-hidden containers for animations', () => {
    const { container } = render(<Hero />);
    const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenElements.length).toBeGreaterThan(0);
  });
});