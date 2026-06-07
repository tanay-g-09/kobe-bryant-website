# ⚙ EmailJS Setup Guide — Kobe Bryant Tribute Site

This site uses [EmailJS](https://www.emailjs.com) to deliver contact form messages
directly to your inbox — **no backend server needed**.

---

## Step 1 — Create a Free EmailJS Account

1. Go to → **https://www.emailjs.com**
2. Click **Sign Up Free**
3. Verify your email address

Free tier: **200 emails/month** — more than enough.

---

## Step 2 — Add an Email Service (Gmail)

1. In your EmailJS dashboard → **Email Services** → **Add New Service**
2. Choose **Gmail**
3. Click **Connect Account** → sign in with `guttatanay09@gmail.com`
4. Click **Create Service**
5. Copy your **Service ID** (e.g. `service_abc123`)

---

## Step 3 — Create an Email Template

1. Dashboard → **Email Templates** → **Create New Template**
2. Set **To email** → `guttatanay09@gmail.com`
3. Set **Subject** → `{{subject}} — from {{from_name}}`
4. Set **Content** (plain text or HTML):

```
You have a new message from the Kobe Bryant tribute site.

Name:    {{from_name}}
Email:   {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
Sent from: {{sent_from}}
Time: {{sent_at}}
```

5. Click **Save** → copy your **Template ID** (e.g. `template_xyz789`)

---

## Step 4 — Get Your Public Key

1. Dashboard → top-right avatar → **Account**
2. Under **API Keys** → copy your **Public Key** (e.g. `abc123XYZ`)

---

## Step 5 — Paste Into contact.html

Open `contact.html` and find these 3 lines near the top and bottom:

```html
<!-- In <head> -->
emailjs.init({ publicKey: 'user_REPLACE_WITH_YOUR_KEY' });

<!-- In <script> at bottom -->
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
```

Replace with your actual values:

```html
emailjs.init({ publicKey: 'abc123XYZ' });          ← your Public Key

const EMAILJS_SERVICE_ID  = 'service_abc123';       ← your Service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz789';      ← your Template ID
```

---

## ✅ Done!

Once configured:
- Every form submission sends a real email to `guttatanay09@gmail.com`
- The sender's email is set as `reply-to`, so you can reply directly
- The setup note disappears from the contact page automatically

---

## 🔄 Fallback Behaviour (Before Setup)

Even before EmailJS is configured, the form is **not broken**:
- On submit, it opens the user's native email app pre-filled with their message
- The user just hits Send in their mail app — zero friction

---

## 📧 Template Variables Reference

| Variable        | Value                        |
|-----------------|------------------------------|
| `{{from_name}}` | Sender's full name           |
| `{{from_email}}`| Sender's email address       |
| `{{subject}}`   | Message subject              |
| `{{message}}`   | Message body                 |
| `{{reply_to}}`  | Same as from_email           |
| `{{to_name}}`   | "Tanay G."                   |
| `{{sent_from}}` | Page URL                     |
| `{{sent_at}}`   | IST timestamp                |
