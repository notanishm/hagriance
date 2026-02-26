# 🚀 SUPABASE SETUP GUIDE - QUICK START

## Current Status: ⚠️ NOT READY

Your Supabase integration code is complete, but the database is not configured yet.

---

## ✅ STEP-BY-STEP SETUP (5 minutes)

### **Step 1: Get Supabase Credentials** (2 min)

1. Open browser and go to: https://zuczpzcagufmufjpubjo.supabase.co
2. Sign in with your Supabase account
3. Click on **Settings** (gear icon) in the left sidebar
4. Click **API** in the settings menu
5. Find the section **Project API keys**
6. Copy the **`anon public`** key (long string starting with `eyJ...`)

### **Step 2: Update .env File** (30 sec)

Open `.env` file and replace:
```
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

With your real key:
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M... (paste your key)
```

**Save the file!**

### **Step 3: Create Database Tables** (2 min)

1. In Supabase Dashboard, click **SQL Editor** in left sidebar
2. Click **+ New Query** button
3. Open the file `SUPABASE_SETUP.md` in your code editor
4. Copy ALL the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message: "Success. No rows returned"

### **Step 4: Verify Setup** (30 sec)

Run this command in your terminal:
```bash
node test-supabase.js
```

**Expected Output:**
```
✅ Supabase client created
✅ Database connection successful!
🎉 Supabase is fully configured and ready to use!
```

**If you see errors:**
- ❌ "Supabase credentials not configured" → Go back to Step 1
- ❌ "Database tables not created" → Go back to Step 3

---

## 🧪 TEST YOUR APP

Once setup is complete:

```bash
npm run dev
```

Then test:
1. **Register as Farmer**: Fill form → Check data saved in Supabase Dashboard
2. **View Dashboard**: Should load without errors
3. **Create Contract** (Business): Should save to database

---

## 🆘 TROUBLESHOOTING

### Issue: "Invalid API key"
**Solution:** Copy the correct `anon public` key from Settings → API

### Issue: "relation does not exist"
**Solution:** Run the SQL from SUPABASE_SETUP.md in SQL Editor

### Issue: "Network error"
**Solution:** Check if Supabase project is active (not paused)

---

## 📊 VERIFY IN SUPABASE DASHBOARD

After testing the app, check your data:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - `profiles` (user data)
   - `contracts` (farmer-business contracts)
   - `loan_applications` (loan requests)
   - `kyc_documents` (verification docs)
   - `file_metadata` (encrypted files)

3. Click on any table to view data

---

## ⏭️ NEXT STEPS AFTER SETUP

1. ✅ Setup complete → Test all features
2. 🐛 Find bugs → Fix and iterate
3. 🎨 Add polish → Improve UX
4. 🚀 Deploy → Share with users

---

**Need help?** Check the error messages in browser console (F12 → Console tab)
