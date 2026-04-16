# Trading Card Grader (TCG)

AI-powered PSA grade predictions for Pokemon and trading cards. 
Upload photos of your card and get a full condition analysis, 
grade prediction, ROI estimate, and submission tips — completely free.

**Live app:** https://tradingcardgrader.lovable.app

## Features
- AI card identification from photos
- PSA grade prediction with probability breakdown  
- Live TCGPlayer market pricing
- Full financial analysis including grading costs and ROI
- Grading history saved to your account
- Works on mobile and desktop

## Built with
- React + Vite + TypeScript
- Tailwind CSS
- OpenAI GPT-4o Vision
- Supabase (auth + database + storage)
- Pokemon TCG API

## Self-hosting
Clone the repo, add your OpenAI key as VITE_OPENAI_API_KEY 
in your build secrets, connect Supabase, and deploy.
