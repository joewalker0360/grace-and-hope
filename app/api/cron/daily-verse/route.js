import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { VERSES } from '@/lib/verses';
import { generateDailyVerseEmail } from '@/lib/email-template';
import fs from 'fs';
import path from 'path';

const LOCAL_SUBS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

function getLocalSubscribers() {
  try {
    if (fs.existsSync(LOCAL_SUBS_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_SUBS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading local subscribers:', err);
  }
  return [];
}

export async function GET(request) {
  try {
    // 1. Verify cron authorization if CRON_SECRET is configured
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Select today's verse (day-of-year rotation)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const todaysVerse = VERSES[dayOfYear % VERSES.length];

    // Formatted date string (e.g. October 8, 2026)
    const dateStr = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // 3. Fetch active subscribers
    let subscribers = [];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('active', true);

      if (!error && data) {
        subscribers = data;
      }
    }

    // Fallback to local subscribers if Supabase not yet populated
    if (!subscribers || subscribers.length === 0) {
      subscribers = getLocalSubscribers().filter(s => s.active !== false);
    }

    if (subscribers.length === 0) {
      return NextResponse.json({
        message: 'Cron executed, but no active subscribers found.',
        verse: todaysVerse.ref
      });
    }

    // 4. Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Emails were logged but not dispatched.');
      return NextResponse.json({
        message: 'RESEND_API_KEY is missing. Add it to .env.local to enable live delivery.',
        recipientCount: subscribers.length,
        verse: todaysVerse.ref
      });
    }

    const resend = new Resend(resendApiKey);
    const results = [];

    // 5. Send daily email to each subscriber
    // Use onboarding@resend.dev (default free testing sender) or user's custom domain
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'Grace & Hope <onboarding@resend.dev>';

    for (const sub of subscribers) {
      try {
        const html = generateDailyVerseEmail({
          name: sub.name,
          verse: todaysVerse,
          dateStr
        });

        const sendResult = await resend.emails.send({
          from: senderEmail,
          to: sub.email,
          subject: `Daily Scripture: ${todaysVerse.ref} 🕊️`,
          html
        });

        results.push({ email: sub.email, id: sendResult?.data?.id || 'sent' });
      } catch (sendErr) {
        console.error(`Failed to send to ${sub.email}:`, sendErr);
        results.push({ email: sub.email, error: sendErr.message });
      }
    }

    return NextResponse.json({
      status: 'success',
      verse: todaysVerse.ref,
      date: dateStr,
      delivered: results.length,
      details: results
    });
  } catch (err) {
    console.error('Daily verse cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Allow POST as well for testing triggers
export async function POST(request) {
  return GET(request);
}
