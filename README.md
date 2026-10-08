# Grace & Hope 🕊️

> A gentle, anonymous digital sanctuary for prayer requests, words of encouragement, and comforting daily Scripture.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Live-success?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)

**🌐 Live Demo:** [https://grace-and-hope.vercel.app](https://grace-and-hope.vercel.app)

---

## ✨ Overview

**Grace & Hope** is an empathetic, minimal peer-support space built with Next.js and React. In seasons of stress, grief, or uncertainty, it offers people a quiet corner on the internet to unburden what they are carrying, receive support and prayers from others, and reflect on comforting verses tailored to their emotional need.

---

## 🌟 Key Features

* **🔐 Mandatory Google Sign-In Gate:**
  * Clean, peaceful entrance ensuring authenticated community access and zero spam.
  * Automatically registers each member for daily Scripture morning delivery.
  * Preserves full user privacy: toggle to post anonymously or with your Google name.

* **📬 Automated Daily Scripture Emails:**
  * Every morning at 6:00 AM, a beautifully styled HTML email with the day's verse is dispatched via **Resend**.
  * Scheduled seamlessly through **Vercel Cron Jobs** (`vercel.json`).
  * Features an uplifting quote card, Scripture reference, and 1-click visit link.

* **🙏 Community Encouragement Wall:**
  * Post thoughts, prayers, or burdens with full anonymity options.
  * Tag notes by intent: *Need Encouragement*, *Prayer Request*, *Giving Thanks*, or *Just Sharing*.
  * Built-in character counter (max 600 chars) for concise, thoughtful notes.

* **❤️ Multi-Reaction System:**
  * **❤️ Encouraged:** Let someone know they are seen and supported.
  * **🙏 Prayed:** Let the author know someone took a moment to pray for them.
  * Instant, optimistic UI updates with sound server-side persistence.

* **📖 Topic-Filtered Scripture Explorer:**
  * Curated Bible verses categorized by real emotional needs:
    * *Anxiety & Worry*
    * *Peace & Rest*
    * *Strength & Courage*
    * *Hope & Future*
    * *Grief & Healing*
  * **One-Click Copy:** Copy scriptures to clipboard with instant visual confirmation.
  * **Random & Next Mode:** Shuffle or cycle through scriptures seamlessly.

* **🛡️ Thoughtful Safety Notice:**
  * Prominent crisis hotline and safety banner distinguishing peer encouragement from professional mental health and emergency services.
  * Flag/report button on all community posts.

* **⚡ Hybrid Persistent Storage:**
  * **Zero-Setup Local Mode:** Persists notes and reactions locally via server-side JSON storage out of the box.
  * **Cloud Supabase Integration:** Connects seamlessly to a real PostgreSQL database in 2 minutes when environment variables are supplied.

* **🎨 Editorial Aesthetic:**
  * Calming color palette with sage greens, warm creams, and paper textures.
  * Elegant typography pairing **Playfair Display** (editorial serifs) and **DM Sans**.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
* **Library:** [React 19](https://react.dev/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Database & Auth:** [Supabase](https://supabase.com/) (Optional cloud persistence)
* **Styling:** Custom CSS with CSS variables and responsive design
* **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+ installed

### 2. Installation

```bash
git clone https://github.com/joewalker0360/grace-and-hope.git
cd grace-and-hope
npm install
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup (Optional)

If you'd like to sync community posts live across all users on the internet:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard and run the SQL code in [`supabase_schema.sql`](./supabase_schema.sql).
3. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart your development server (`npm run dev`). The app will automatically switch from local storage to live Supabase synchronization.

---

## 🌐 Deploy to Vercel

Deploy instantly with the Vercel CLI:

```bash
vercel --prod
```

If using Supabase, remember to add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel Project Settings $\rightarrow$ **Environment Variables**.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

