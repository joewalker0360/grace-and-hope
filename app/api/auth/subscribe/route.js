import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Resend } from 'resend';
import { VERSES } from '@/lib/verses';
import { generateDailyVerseEmail } from '@/lib/email-template';
import fs from 'fs';
import path from 'path';

const LOCAL_SUBS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

function saveLocalSubscriber(sub) {
  try {
    let subs = [];
    const dir = path.dirname(LOCAL_SUBS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(LOCAL_SUBS_FILE)) {
      subs = JSON.parse(fs.readFileSync(LOCAL_SUBS_FILE, 'utf-8'));
    }

    const existingIndex = subs.findIndex(s => s.email === sub.email);
    if (existingIndex >= 0) {
      subs[existingIndex] = { ...subs[existingIndex], ...sub, active: true };
    } else {
      subs.push({ ...sub, active: true, created_at: new Date().toISOString() });
    }

    fs.writeFileSync(LOCAL_SUBS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local subscriber:', err);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, avatar_url, user_id } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const subscriberData = {
      email: email.trim().toLowerCase(),
      name: name ? name.trim() : 'Friend',
      avatar_url: avatar_url || null,
      user_id: user_id || null,
      active: true,
      created_at: new Date().toISOString()
    };

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('subscribers')
        .upsert(
          {
            email: subscriberData.email,
            name: subscriberData.name,
            avatar_url: subscriberData.avatar_url,
            user_id: subscriberData.user_id,
            active: true
          },
          { onConflict: 'email' }
        );

      if (error) {
        console.warn('Supabase subscriber upsert error:', error.message);
      }
    }

    // 2. Also record in local storage fallback
    saveLocalSubscriber(subscriberData);

    // 3. Send welcome daily verse email if Resend API key is present
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const senderEmail = process.env.RESEND_FROM_EMAIL || 'Grace & Hope <onboarding@resend.dev>';
        const welcomeVerse = VERSES[0]; // Matthew 11:28
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        const html = generateDailyVerseEmail({
          name: subscriberData.name,
          verse: welcomeVerse,
          dateStr
        });

        await resend.emails.send({
          from: senderEmail,
          to: subscriberData.email,
          subject: 'Welcome to Grace & Hope — Your First Daily Scripture 🕊️',
          html
        });
      } catch (emailErr) {
        console.warn('Welcome email error (non-fatal):', emailErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed to daily Scripture emails',
      subscriber: subscriberData
    });
  } catch (err) {
    console.error('POST /api/auth/subscribe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
