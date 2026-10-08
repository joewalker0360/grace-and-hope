-- SQL schema for Supabase
-- Copy and run this in your Supabase Project -> SQL Editor

-- ==============================================================================
-- 1. COMMUNITY POSTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Anonymous',
    tag TEXT NOT NULL DEFAULT 'Need Encouragement',
    text TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    prayers INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
ON public.posts FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access"
ON public.posts FOR INSERT WITH CHECK (true);

-- Allow public reaction updates
CREATE POLICY "Allow public reaction updates"
ON public.posts FOR UPDATE USING (true) WITH CHECK (true);


-- ==============================================================================
-- 2. DAILY BIBLE VERSE EMAIL SUBSCRIBERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow users to view & update their own subscription
CREATE POLICY "Allow users to view own subscription"
ON public.subscribers FOR SELECT
USING (true);

CREATE POLICY "Allow public subscriber upsert"
ON public.subscribers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow subscriber update"
ON public.subscribers FOR UPDATE
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- 3. INITIAL SEED POSTS
-- ==============================================================================
INSERT INTO public.posts (id, name, tag, text, likes, prayers, created_at)
VALUES
  ('seed-1', 'Grace', 'Need Encouragement', 'I have been feeling overwhelmed with university exams and family responsibilities. I could really use some encouragement and peace right now.', 8, 5, NOW()),
  ('seed-2', 'Anonymous', 'Prayer Request', 'Please pray for me as I make an important career decision this week. I want to trust God instead of being paralyzed by anxiety.', 12, 9, NOW()),
  ('seed-3', 'Daniel', 'Just Sharing', 'Going through a difficult season of loss, but I am trying to remember that I am not walking through the valley alone.', 14, 11, NOW())
ON CONFLICT (id) DO NOTHING;
