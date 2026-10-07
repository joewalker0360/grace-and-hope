'use client';

import { useState, useEffect } from 'react';
import {
  Heart,
  Send,
  BookOpen,
  Shield,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Flag,
  MessageCircleHeart
} from 'lucide-react';
import { TOPICS, VERSES } from '../lib/verses';

export default function Home() {
  // Scripture state
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Filtered verses based on selected topic
  const filteredVerses = selectedTopic === 'all'
    ? VERSES
    : VERSES.filter(v => v.topic === selectedTopic);

  const currentVerse = filteredVerses[activeVerseIndex % filteredVerses.length] || VERSES[0];

  // Community posts state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('Need Encouragement');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  // Show temporary toast message
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // Load posts from API
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    }
    fetchPosts();
  }, []);

  // Next verse in current topic
  function nextVerse() {
    setActiveVerseIndex(prev => (prev + 1) % filteredVerses.length);
  }

  // Random verse picker
  function randomVerse() {
    const randomIndex = Math.floor(Math.random() * filteredVerses.length);
    setActiveVerseIndex(randomIndex);
  }

  // Switch topic
  function handleTopicChange(topicId) {
    setSelectedTopic(topicId);
    setActiveVerseIndex(0);
  }

  // Copy verse to clipboard
  async function copyVerseText() {
    try {
      const formatted = `"${currentVerse.text}" — ${currentVerse.ref} (${currentVerse.translation})`;
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      showToast('Verse copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Unable to copy verse');
    }
  }

  // Submit new post
  async function submitPost(e) {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    const postPayload = {
      name: name.trim() || 'Anonymous',
      tag: tag,
      text: text.trim()
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload)
      });

      if (res.ok) {
        const createdPost = await res.json();
        setPosts(prev => [createdPost, ...prev]);
        setText('');
        setName('');
        showToast('Your note was shared with the community.');
      } else {
        showToast('Could not submit post. Please try again.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      showToast('Network error while posting.');
    } finally {
      setSubmitting(false);
    }
  }

  // React to post (like or prayer)
  async function handleReaction(postId, type) {
    // Optimistic UI update
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes: type === 'like' ? (p.likes || 0) + 1 : (p.likes || 0),
            prayers: type === 'prayer' ? (p.prayers || 0) + 1 : (p.prayers || 0)
          };
        }
        return p;
      })
    );

    if (type === 'prayer') {
      showToast('Prayed for this request 🙏');
    }

    try {
      await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      console.error('Failed to sync reaction:', err);
    }
  }

  // Report post
  function reportPost(postId) {
    showToast('Note reported. Thank you for keeping this space safe.');
  }

  return (
    <main>
      {/* Toast Notification */}
      {toast && (
        <div className="toast">
          <Sparkles size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Navigation */}
      <nav>
        <div className="brand">
          <div className="logo">
            <Heart size={20} fill="currentColor" />
          </div>
          <span>Grace &amp; Hope</span>
        </div>
        <a href="#verses">Scripture Topics</a>
        <a href="#community">Community Wall</a>
        <button
          className="navbtn"
          onClick={() => document.getElementById('share')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Share a Request
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="heroText">
          <div className="eyebrow">
            <Sparkles size={14} /> A gentle place to breathe, pray, and encourage
          </div>
          <h1>You don&apos;t have to carry it alone.</h1>
          <p>
            Share what you are going through, receive prayer from others, and find a comforting
            Scripture verse to hold onto today.
          </p>
          <div className="actions">
            <button
              onClick={() => document.getElementById('share')?.scrollIntoView({ behavior: 'smooth' })}
              className="primary"
            >
              Share what you&apos;re facing <Send size={16} />
            </button>
            <button
              onClick={() => document.getElementById('verses')?.scrollIntoView({ behavior: 'smooth' })}
              className="secondary"
            >
              <BookOpen size={16} /> Explore Scriptures
            </button>
          </div>
        </div>

        {/* Hero Highlight Card */}
        <div className="heroCard">
          <div className="quote">“</div>
          <p>{currentVerse.text}</p>
          <div className="verseMeta">
            <strong>{currentVerse.ref} ({currentVerse.translation})</strong>
            <div className="heroCardActions">
              <button onClick={copyVerseText} title="Copy scripture">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={nextVerse} title="Next verse">
                <RefreshCw size={14} /> Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis / Safety Notice */}
      <section className="notice">
        <Shield size={20} />
        <div>
          <strong>A safe, supportive space</strong>
          <span>
            This is a faith-based peer community for prayer and encouragement, not a replacement for
            professional therapy or emergency care. If you are in immediate distress or crisis,
            please reach out to local emergency services or a dedicated helpline.
          </span>
        </div>
      </section>

      {/* Topic-Based Scripture Explorer */}
      <section id="verses" className="scriptureExplorer">
        <div className="explorerHead">
          <div className="sectionTag">SCRIPTURE BY NEED</div>
          <h2>Find words of comfort today</h2>
        </div>

        <div className="topicPills">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              className={`topicBtn ${selectedTopic === topic.id ? 'active' : ''}`}
              onClick={() => handleTopicChange(topic.id)}
            >
              {topic.label}
            </button>
          ))}
        </div>

        <div className="verseDisplayCard">
          <p>“{currentVerse.text}”</p>
          <div className="verseDisplayMeta">
            <span>{currentVerse.ref} ({currentVerse.translation})</span>
            <span className="badgeTopic">{currentVerse.topic}</span>
          </div>

          <div className="verseControls">
            <button className="pillBtn" onClick={randomVerse}>
              <RefreshCw size={14} /> Random Verse
            </button>
            <button className="pillBtn" onClick={nextVerse}>
              Next in {TOPICS.find(t => t.id === selectedTopic)?.label}
            </button>
            <button className="pillBtn" onClick={copyVerseText}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section id="share" className="share">
        <div>
          <div className="sectionTag">COMMUNITY SUPPORT</div>
          <h2>What is on your heart today?</h2>
          <p>
            You can post completely anonymously. Keep personal contact details private and treat
            every person here with patience and grace.
          </p>
        </div>

        <form onSubmit={submitPost}>
          <div className="formRow">
            <input
              type="text"
              className="inputField"
              placeholder="Name or alias (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
            />
            <select
              className="selectField"
              value={tag}
              onChange={e => setTag(e.target.value)}
            >
              <option value="Need Encouragement">Need Encouragement</option>
              <option value="Prayer Request">Prayer Request</option>
              <option value="Giving Thanks">Giving Thanks</option>
              <option value="Just Sharing">Just Sharing</option>
            </select>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="I'm feeling... / Please pray for... / Grateful today for..."
            maxLength={600}
            required
          />

          <div className="formBottom">
            <span className={`charCount ${text.length > 550 ? 'limitClose' : ''}`}>
              {text.length}/600
            </span>
            <button className="primary" type="submit" disabled={submitting || !text.trim()}>
              {submitting ? 'Sharing...' : 'Share Anonymously'} <Send size={16} />
            </button>
          </div>
        </form>
      </section>

      {/* Community Wall */}
      <section id="community" className="community">
        <div className="communityHead">
          <div>
            <div className="sectionTag">COMMUNITY WALL</div>
            <h2>People lifting each other up</h2>
          </div>
          <div className="online">
            <span /> Community is active
          </div>
        </div>

        <div className="grid">
          {loadingPosts ? (
            <div style={{ color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
              Loading encouragement wall...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
              No notes shared yet today. Be the first to post above.
            </div>
          ) : (
            posts.map(p => (
              <article className="post" key={p.id}>
                <div>
                  <div className="postTop">
                    <div className="authorBlock">
                      <div className="avatar">{(p.name || 'A')[0].toUpperCase()}</div>
                      <div>
                        <strong>{p.name || 'Anonymous'}</strong>
                        <small>{p.time || (p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recently')}</small>
                      </div>
                    </div>
                    <span className="postTag">{p.tag || 'Encouragement'}</span>
                  </div>
                  <p>{p.text}</p>
                </div>

                <div className="postActions">
                  <div className="reactionGroup">
                    <button
                      className="reactionBtn"
                      onClick={() => handleReaction(p.id, 'like')}
                      title="Send encouragement"
                    >
                      <Heart size={15} /> {p.likes || 0}
                    </button>
                    <button
                      className="reactionBtn"
                      onClick={() => handleReaction(p.id, 'prayer')}
                      title="Pray for this request"
                    >
                      <MessageCircleHeart size={15} /> {p.prayers || 0} Prayed
                    </button>
                  </div>
                  <button
                    className="reportBtn"
                    onClick={() => reportPost(p.id)}
                    title="Flag or report inappropriate content"
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="brand">
          <div className="logo">
            <Heart size={16} fill="currentColor" />
          </div>
          <span>Grace &amp; Hope</span>
        </div>
        <span>A quiet sanctuary for prayer, encouragement, and daily Scripture.</span>
      </footer>
    </main>
  );
}
