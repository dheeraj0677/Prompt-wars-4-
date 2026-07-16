// Social Sentiment Tracker — mood gauge, word cloud, feed
import { useState, useEffect, useRef } from 'react';
import { generateSocialBatch, generateSocialPost, computeSentimentStats } from '../../data/socialData';

export default function SocialSentiment() {
  const [posts, setPosts] = useState(() => generateSocialBatch(30));
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const interval = setInterval(() => {
      setPosts(prev => [generateSocialPost(), ...prev].slice(0, 60));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const stats = computeSentimentStats(posts);

  const getMoodEmoji = () => {
    if (stats.positive >= 60) return '😊';
    if (stats.positive >= 45) return '🙂';
    if (stats.negative >= 40) return '😠';
    return '😐';
  };

  const getMoodLabel = () => {
    if (stats.positive >= 60) return 'Positive';
    if (stats.positive >= 45) return 'Mostly Positive';
    if (stats.negative >= 40) return 'Concerning';
    return 'Mixed';
  };

  const platformIcon = { twitter: '𝕏', instagram: '📷', tiktok: '🎵' };
  const sentimentColor = { positive: 'var(--accent-emerald)', neutral: 'var(--text-muted)', negative: 'var(--accent-red)' };

  const formatTime = (ts) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m`;
    return `${Math.floor(diff / 60)}h`;
  };

  return (
    <div className="social-sentiment">
      <div className="section-header">
        <span className="section-title">📱 Social Sentiment</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stats.total} posts analyzed</span>
      </div>

      {/* Mood Gauge */}
      <div className="mood-gauge">
        <div className="mood-gauge-emoji">{getMoodEmoji()}</div>
        <div className="mood-gauge-info">
          <div className="mood-gauge-label">{getMoodLabel()}</div>
          <div className="mood-gauge-bar">
            <div className="mood-bar-segment positive" style={{ width: `${stats.positive}%` }} />
            <div className="mood-bar-segment neutral" style={{ width: `${stats.neutral}%` }} />
            <div className="mood-bar-segment negative" style={{ width: `${stats.negative}%` }} />
          </div>
          <div className="mood-bar-labels">
            <span style={{ color: 'var(--accent-emerald)' }}>😊 {stats.positive}%</span>
            <span style={{ color: 'var(--text-muted)' }}>😐 {stats.neutral}%</span>
            <span style={{ color: 'var(--accent-red)' }}>😠 {stats.negative}%</span>
          </div>
        </div>
      </div>

      {/* Trending Hashtags */}
      <div className="social-hashtags">
        <div className="engagement-header"><span>🔥 Trending</span></div>
        <div className="hashtag-cloud">
          {stats.topHashtags?.map(({ tag, count }) => (
            <span key={tag} className="hashtag-tag" style={{ fontSize: Math.min(16, 10 + count * 0.5) }}>
              {tag} <sup>{count}</sup>
            </span>
          ))}
        </div>
      </div>

      {/* Live Feed */}
      <div className="social-feed">
        <div className="engagement-header"><span>📡 Live Feed</span></div>
        <div className="social-posts">
          {posts.slice(0, 5).map(post => (
            <div key={post.id} className="social-post" style={{ borderLeftColor: sentimentColor[post.sentiment] }}>
              <div className="post-header">
                <span className="post-username">@{post.username}</span>
                <span className="post-meta">{platformIcon[post.platform]} · {formatTime(post.timestamp)}</span>
              </div>
              <div className="post-text">{post.text}</div>
              <div className="post-footer">
                <span>❤️ {post.likes}</span>
                <span>🔁 {post.retweets}</span>
                <span className="post-zone">{post.zoneName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
