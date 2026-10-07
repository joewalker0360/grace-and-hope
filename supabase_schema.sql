-- SQL schema for Supabase
-- Copy and run this in your Supabase Project -> SQL Editor

CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Anonymous',
    tag TEXT NOT NULL DEFAULT 'Need Encouragement',
    text TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    prayers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access"
ON public.posts
FOR SELECT
USING (true);

-- Allow anonymous insert access
CREATE POLICY "Allow public insert access"
ON public.posts
FOR INSERT
WITH CHECK (true);

-- Allow anonymous reaction updates
CREATE POLICY "Allow public reaction updates"
ON public.posts
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Optional: Initial seed posts
INSERT INTO public.posts (id, name, tag, text, likes, prayers, created_at)
VALUES
  ('seed-1', 'Grace', 'Need Encouragement', 'I have been feeling overwhelmed with university exams and family responsibilities. I could really use some encouragement and peace right now.', 8, 5, NOW()),
  ('seed-2', 'Anonymous', 'Prayer Request', 'Please pray for me as I make an important career decision this week. I want to trust God instead of being paralyzed by anxiety.', 12, 9, NOW()),
  ('seed-3', 'Daniel', 'Just Sharing', 'Going through a difficult season of loss, but I am trying to remember that I am not walking through the valley alone.', 14, 11, NOW())
ON CONFLICT (id) DO NOTHING;

