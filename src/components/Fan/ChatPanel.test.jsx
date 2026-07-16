import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import ChatPanel from './ChatPanel';
import { QueryProvider } from '../../store/queryStore';

test('ChatPanel renders header and concierge correctly', () => {
  render(
    <QueryProvider>
      <ChatPanel />
    </QueryProvider>
  );
  
  expect(screen.getByText('Stadium Concierge')).toBeInTheDocument();
  expect(screen.getByText('Multilingual AI Active')).toBeInTheDocument();
  expect(screen.getByText(/End-to-end encrypted · Data anonymized/)).toBeInTheDocument();
});
