import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');

function readLocalPosts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local posts:', err);
  }
  return [];
}

function writeLocalPosts(posts) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local posts:', err);
  }
}

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, falling back to local:', error.message);
      } else if (data) {
        return NextResponse.json(data);
      }
    }

    const localPosts = readLocalPosts();
    return NextResponse.json(localPosts);
  } catch (err) {
    console.error('GET /api/posts error:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawText = body.text ? body.text.trim() : '';

    if (!rawText || rawText.length < 3) {
      return NextResponse.json({ error: 'Post content must be at least 3 characters.' }, { status: 400 });
    }

    if (rawText.length > 600) {
      return NextResponse.json({ error: 'Post content exceeds 600 characters limit.' }, { status: 400 });
    }

    const newPost = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'post-' + Date.now(),
      name: body.name && body.name.trim() ? body.name.trim() : 'Anonymous',
      tag: body.tag || 'Need Encouragement',
      text: rawText,
      likes: 0,
      prayers: 0,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert error, falling back to local:', error.message);
      } else if (data) {
        return NextResponse.json(data, { status: 201 });
      }
    }

    const localPosts = readLocalPosts();
    const updated = [newPost, ...localPosts];
    writeLocalPosts(updated);

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error('POST /api/posts error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
