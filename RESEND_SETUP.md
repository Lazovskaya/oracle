# Resend Email Integration Setup

## Overview
Magic link emails are now sent via [Resend](https://resend.com) - a modern email API for developers.

## Setup Steps

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### 2. Get API Key
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click **"Create API Key"**
3. Name it: `Market Oracle Production` (or `Development`)
4. Copy the API key (starts with `re_`)

### 3. Configure Domain (Production Only)
For production emails, you need to verify your domain:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `marketoracle.com`)
4. Add DNS records as shown:
   - **SPF** record
   - **DKIM** records
   - **DMARC** record (optional but recommended)
5. Wait for verification (usually 5-30 minutes)

### 4. Update Environment Variables
Add to your `.env.local` file:

```env
# Resend API
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**For Development (before domain verification):**
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**For Production (after domain verification):**
```env
RESEND_FROM_EMAIL=noreply@marketoracle.com
# Or: hello@marketoracle.com, support@marketoracle.com, etc.
```

### 5. Deploy to Vercel
Add environment variables in Vercel dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - `RESEND_API_KEY` = `re_your_key`
   - `RESEND_FROM_EMAIL` = `noreply@yourdomain.com`
4. Redeploy your application

## Email Template

The magic link email includes:
- **Clean design** with Inter font (matches app aesthetic)
- **Prominent CTA button** ("Access Market Oracle")
- **15-minute expiry notice**
- **Security message** (ignore if you didn't request)
- **Professional footer**

## Testing

### Development Mode
```bash
npm run dev
```

1. Go to `/login`
2. Enter your email
3. Check terminal for magic link (fallback if Resend fails)
4. Check your inbox for professional email

### Production Mode
1. User enters email
2. Email sent via Resend
3. User clicks link in email
4. Automatically logged in

## Email Deliverability Tips

### For Development
- Use `onboarding@resend.dev` (Resend's test domain)
- Check spam folder if email doesn't arrive
- Use terminal fallback link for testing

### For Production
- **Verify domain** (required for production usage)
- Add **SPF, DKIM, DMARC** records
- Use a professional from address (e.g., `noreply@`, `hello@`, `support@`)
- Avoid spam trigger words in subject line
- Keep email content clean and simple

## Resend Pricing

- **Free Tier**: 100 emails/day, 3,000/month
- **Pro Tier**: $20/month for 50,000 emails
- **More**: Custom pricing for higher volumes

Perfect for your use case! Most startups stay on free tier for months.

## API Rate Limits

- **Free**: 10 requests/second
- **Pro**: 50 requests/second
- **Enterprise**: Custom

## Monitoring & Analytics

View email stats in Resend Dashboard:
- Sent emails
- Delivery rate
- Open rate (if tracking enabled)
- Bounce rate
- Failed deliveries

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify RESEND_API_KEY is correct
3. Check Resend logs: [resend.com/emails](https://resend.com/emails)
4. In development, use terminal fallback link

### Domain Not Verified
1. Check DNS records are correct
2. Wait 30 minutes for DNS propagation
3. Use DNS checker: [whatsmydns.net](https://whatsmydns.net)
4. Contact Resend support if issues persist

### Rate Limit Errors
- Free tier: Max 100 emails/day
- Upgrade to Pro if needed
- Implement rate limiting on your end

### Invalid From Email
- Must be from verified domain
- Use `onboarding@resend.dev` for testing
- Format: `Name <email@domain.com>` or just `email@domain.com`

## Security Notes

✅ **API Key**: Keep secret, never commit to git  
✅ **HTTPS**: Magic links use HTTPS in production  
✅ **Expiry**: Links expire after 15 minutes  
✅ **One-time use**: Links can only be used once  
✅ **Rate limiting**: Consider adding rate limits to prevent abuse  

## Next Steps

1. ✅ Install Resend: `npm install resend` (done)
2. ✅ Update magic link API (done)
3. ⏳ Get Resend API key
4. ⏳ Add to `.env.local`
5. ⏳ Test in development
6. ⏳ Verify domain for production
7. ⏳ Deploy to Vercel with env vars

## Support

- Resend Docs: [resend.com/docs](https://resend.com/docs)
- Resend Discord: [discord.gg/resend](https://discord.gg/resend)
- Email: support@resend.com
