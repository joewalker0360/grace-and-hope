import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../../lib/supabase';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');

function readLocalPosts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading local posts:', err);
  }
  return [];
}

function writeLocalPosts(posts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local posts:', err);
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const type = body.type; // 'like' or 'prayer'

    if (type !== 'like' && type !== 'prayer') {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      // In Supabase, increment via RPC or fetch & update
      const { data: currentPost, error: fetchErr } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (!fetchErr && currentPost) {
        const updateField = type === 'prayer' ? 'prayers' : 'likes';
        const newVal = (currentPost[updateField] || 0) + 1;

        const { data: updated, error: updErr } = await supabase
          .from('posts')
          .update({ [updateField]: newVal })
          .eq('id', id)
          .select()
          .single();

        if (!updErr && updated) {
          return NextResponse.json(updated);
        }
      }
    }

    // Local fallback
    const posts = readLocalPosts();
    let updatedPost = null;
    const updatedPosts = posts.map(p => {
      if (p.id === id) {
        const updated = {
          ...p,
          likes: type === 'like' ? (p.likes || 0) + 1 : (p.likes || 0),
          prayers: type === 'prayer' ? (p.prayers || 0) + 1 : (p.prayers || 0)
        };
        updatedPost = updated;
        return updated;
      }
      return p;
    });

    if (updatedPost) {
      writeLocalPosts(updatedPosts);
      return NextResponse.json(updatedPost);
    }

    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  } catch (err) {
    console.error('POST /api/posts/[id]/react error:', err);
    return NextResponse.json({ error: 'Failed to record reaction' }, { status: 500 });
  }
}
