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
  MessageCircleHeart,
  Mail,
  LogOut,
  UserCheck
} from 'lucide-react';
import { TOPICS, VERSES } from '../lib/verses';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function Home() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

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
  const [postAnonymously, setPostAnonymously] = useState(true);
  const [tag, setTag] = useState('Need Encouragement');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  // Show temporary toast message
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  // Check auth state on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            handleUserSignedIn(session.user);
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              handleUserSignedIn(session.user);
            } else {
              setUser(null);
            }
          });

          return () => subscription.unsubscribe();
        } else {
          // Check local storage for mock/preview session
          const savedMock = localStorage.getItem('grace_hope_preview_user');
          if (savedMock) {
            setUser(JSON.parse(savedMock));
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Sync user info and register daily verse subscription
  async function handleUserSignedIn(authUser) {
    const userData = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email.split('@')[0],
      avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null
    };

    setUser(userData);

    // Register / verify daily verse email subscription
    try {
      await fetch('/api/auth/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          avatar_url: userData.avatar_url,
          user_id: userData.id
        })
      });
    } catch (subErr) {
      console.warn('Subscription sync error:', subErr);
    }
  }

  // Google Sign-In Action
  async function handleGoogleSignIn() {
    setAuthError('');
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
          }
        });
        if (error) setAuthError(error.message);
      } catch (err) {
        setAuthError(err.message);
      }
    } else {
      // Prompt for email in local preview mode
      const email = prompt('Enter your Google email to test the sign-in & daily email flow:', 'member@gmail.com');
      if (email && email.includes('@')) {
        const mockUser = {
          id: 'usr_' + Date.now(),
          email: email.trim().toLowerCase(),
          name: email.split('@')[0],
          avatar_url: null
        };
        localStorage.setItem('grace_hope_preview_user', JSON.stringify(mockUser));
        handleUserSignedIn(mockUser);
        showToast('Signed in & subscribed to Daily Scripture emails 🕊️');
      }
    }
  }

  // Sign out
  async function handleSignOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('grace_hope_preview_user');
    }
    setUser(null);
    showToast('Signed out of Grace & Hope.');
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
      name: postAnonymously ? 'Anonymous' : (user?.name || 'Community Member'),
      tag: tag,
      text: text.trim(),
      user_id: user?.id || null
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
  function reportPost() {
    showToast('Note reported. Thank you for keeping this space safe.');
  }

  // ==============================================================================
  // RENDER: LOADING STATE
  // ==============================================================================
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--cream)', color: 'var(--muted)' }}>
        <p>Opening Grace &amp; Hope...</p>
      </div>
    );
  }

  // ==============================================================================
  // RENDER: MANDATORY GOOGLE AUTH GATE (WHEN NOT LOGGED IN)
  // ==============================================================================
  if (!user) {
    return (
      <div className="authGate">
        <header className="authGateNav">
          <div className="brand">
            <div className="logo">
              <Heart size={20} fill="currentColor" />
            </div>
            <span>Grace &amp; Hope</span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
            Safe &bull; Anonymous &bull; Supportive
          </span>
        </header>

        <main className="authContainer">
          <div className="authContent">
            <div className="eyebrow">
              <Sparkles size={14} /> A peaceful sanctuary for your spirit
            </div>
            <h1>You don&apos;t have to walk through it alone.</h1>
            <p>
              Join a quiet community space to share what you&apos;re carrying, receive prayer and
              encouragement, and wake up to a comforting Scripture verse in your inbox every morning.
            </p>

            <div className="authActions">
              <button onClick={handleGoogleSignIn} className="googleBtn">
                <svg className="googleIcon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Continue with Google
              </button>

              {authError && (
                <div style={{ color: '#c84025', fontSize: '13px', marginTop: '6px' }}>
                  {authError}
                </div>
              )}

              <div className="emailPerks">
                <div className="perkItem">
                  <Mail size={16} />
                  <span>Receive 1 comforting Bible verse delivered to your email every morning</span>
                </div>
                <div className="perkItem">
                  <Heart size={16} />
                  <span>Access the anonymous prayer wall and encourage fellow members</span>
                </div>
                <div className="perkItem">
                  <Shield size={16} />
                  <span>100% spam-free. You can post completely anonymously at any time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Email Preview Card */}
          <div className="emailPreviewCard">
            <div className="emailBadge">
              <Mail size={14} /> Morning Scripture Preview
            </div>
            <h3>What arrives in your inbox every day:</h3>
            <div className="emailSample">
              <h4>TODAY&apos;S SCRIPTURE &bull; 6:00 AM</h4>
              <blockquote>
                &ldquo;Come to me, all you who are weary and burdened, and I will give you rest.&rdquo;
              </blockquote>
              <strong>Matthew 11:28 (NIV)</strong>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '14px', textAlign: 'center' }}>
              Delivered daily to inspire rest, courage, and hope before your day begins.
            </p>
          </div>
        </main>

        <section className="notice" style={{ maxWidth: '900px', margin: '20px auto 40px' }}>
          <Shield size={20} />
          <div>
            <strong>A safe, faith-based space</strong>
            <span>
              This is a peer community for spiritual encouragement. If you or someone you know is in
              crisis or distress, please reach out to your local emergency services or a mental health helpline.
            </span>
          </div>
        </section>

        <footer style={{ background: 'transparent' }}>
          <div className="brand">
            <div className="logo">
              <Heart size={16} fill="currentColor" />
            </div>
            <span>Grace &amp; Hope</span>
          </div>
          <span>Built for prayer, encouragement, and daily Scripture.</span>
        </footer>
      </div>
    );
  }

  // ==============================================================================
  // RENDER: MAIN COMMUNITY APP (WHEN SIGNED IN)
  // ==============================================================================
  return (
    <main>
      {/* Toast Notification */}
      {toast && (
        <div className="toast">
          <Sparkles size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Navigation with User Profile */}
      <nav>
        <div className="brand">
          <div className="logo">
            <Heart size={20} fill="currentColor" />
          </div>
          <span>Grace &amp; Hope</span>
        </div>
        <a href="#verses">Scripture Topics</a>
        <a href="#community">Community Wall</a>

        <div className="navProfile">
          <div className="userBadge">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="userAvatar" />
            ) : (
              <div className="avatarInitial">{(user.name || 'U')[0].toUpperCase()}</div>
            )}
            <span>{user.name}</span>
            <span className="dailySubBadge">
              <Mail size={12} /> Daily Verse
            </span>
          </div>

          <button onClick={handleSignOut} className="signOutBtn" title="Sign out">
            <LogOut size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="heroText">
          <div className="eyebrow">
            <UserCheck size={14} /> Signed in as {user.name} &bull; Daily Scripture Active
          </div>
          <h1>You don&apos;t have to carry it alone.</h1>
          <p>
            Share what you are going through, receive prayer from others, and reflect on comforting
            Scripture tailored to what you need today.
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
            You can choose to post with your name or completely anonymously. Treat every person
            here with patience and grace.
          </p>
        </div>

        <form onSubmit={submitPost}>
          {/* Anonymous toggle row */}
          <div className="anonToggleRow">
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={postAnonymously}
                onChange={e => setPostAnonymously(e.target.checked)}
              />
              <span>Post anonymously (hide my Google name)</span>
            </label>
            <span>Posting as: <strong>{postAnonymously ? 'Anonymous' : user.name}</strong></span>
          </div>

          <div className="formRow">
            <select
              className="selectField"
              value={tag}
              onChange={e => setTag(e.target.value)}
              style={{ gridColumn: '1 / -1' }}
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
              {submitting ? 'Sharing...' : (postAnonymously ? 'Share Anonymously' : 'Share Note')} <Send size={16} />
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
                    onClick={() => reportPost()}
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
