import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

test('ErrorBoundary renders children when no error occurs', () => {
  render(
    <ErrorBoundary>
      <div data-testid="child">Safe Content</div>
    </ErrorBoundary>
  );
  expect(screen.getByTestId('child')).toBeInTheDocument();
  expect(screen.getByText('Safe Content')).toBeInTheDocument();
});

test('ErrorBoundary catches errors and displays fallback UI', () => {
  // Suppress console.error for this test
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  const ThrowError = () => {
    throw new Error('Test Error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  expect(screen.getByText('FanPulse encountered an unexpected error. For immediate help, please visit the nearest Information Desk or contact stadium staff directly.')).toBeInTheDocument();
  expect(screen.getByText('Try Again')).toBeInTheDocument();

  consoleSpy.mockRestore();
});

test('ErrorBoundary reset button clears the fallback state', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  let shouldThrow = true;

  const SometimesBroken = () => {
    if (shouldThrow) {
      throw new Error('Recoverable Error');
    }
    return <div>Recovered content</div>;
  };

  render(
    <ErrorBoundary>
      <SometimesBroken />
    </ErrorBoundary>
  );

  const button = screen.getByRole('button', { name: /try again/i });
  fireEvent.mouseOver(button);
  expect(button).toHaveStyle({ transform: 'translateY(-1px)' });
  fireEvent.mouseOut(button);
  fireEvent.focus(button);
  expect(button).toHaveStyle({ transform: 'translateY(-1px)' });
  fireEvent.blur(button);

  shouldThrow = false;
  fireEvent.click(button);
  expect(screen.getByText('Recovered content')).toBeInTheDocument();

  consoleSpy.mockRestore();
});
