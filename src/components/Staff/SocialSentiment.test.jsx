import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SocialSentiment from './SocialSentiment';
import { computeSentimentStats } from '../../data/socialData';

const posts = [
  {
    id: 'p1',
    username: 'fan_one',
    platform: 'twitter',
    sentiment: 'positive',
    text: 'Great crowd flow today #FanPulse',
    timestamp: '2026-07-16T18:00:00.000Z',
    likes: 10,
    retweets: 3,
    zoneName: 'Gate A',
  },
  {
    id: 'p2',
    username: 'fan_two',
    platform: 'instagram',
    sentiment: 'negative',
    text: 'Lines are long #GateA',
    timestamp: '2026-07-16T17:30:00.000Z',
    likes: 4,
    retweets: 1,
    zoneName: 'Food Court',
  },
  {
    id: 'p3',
    username: 'fan_three',
    platform: 'tiktok',
    sentiment: 'neutral',
    text: 'Kickoff soon #WorldCup',
    timestamp: '2026-07-16T16:00:00.000Z',
    likes: 8,
    retweets: 2,
    zoneName: 'Section 108',
  },
];

vi.mock('../../data/socialData', () => ({
  generateSocialBatch: vi.fn(() => posts),
  generateSocialPost: vi.fn(() => ({
    ...posts[0],
    id: 'p4',
    text: 'Fresh post',
    timestamp: new Date().toISOString(),
  })),
  computeSentimentStats: vi.fn(),
}));

describe('SocialSentiment', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T18:00:00.000Z'));
    computeSentimentStats.mockReturnValue({
      total: 3,
      positive: 65,
      neutral: 20,
      negative: 15,
      moodScore: 8,
      topHashtags: [{ tag: '#FanPulse', count: 4 }, { tag: '#GateA', count: 2 }],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders positive mood, hashtags, and live feed metadata', () => {
    render(<SocialSentiment />);

    expect(screen.getByText(/3 posts analyzed/i)).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getAllByText(/#FanPulse/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('@fan_one')).toBeInTheDocument();
    expect(screen.getByText(/𝕏 · now/i)).toBeInTheDocument();
    expect(screen.getByText(/📷 · 30m/i)).toBeInTheDocument();
    expect(screen.getByText(/🎵 · 2h/i)).toBeInTheDocument();
  });

  it('renders alternate mood labels and adds live posts on interval', () => {
    computeSentimentStats.mockReturnValue({
      total: 3,
      positive: 30,
      neutral: 25,
      negative: 45,
      moodScore: 3,
      topHashtags: [],
    });

    render(<SocialSentiment />);
    expect(screen.getByText('Concerning')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByText('Fresh post')).toBeInTheDocument();
  });
});
