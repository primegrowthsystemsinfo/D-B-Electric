# D & B Electric website — client setup

## Where quote requests go

Every "Get My Free Quote" submission is emailed through **Web3Forms**
(https://web3forms.com), a hosted form-to-email service. Both settings live in
one file:

    app/src/site.config.ts
      BUSINESS_OWNER_EMAIL  = the inbox that receives inquiries (for reference)
      WEB3FORMS_ACCESS_KEY  = the Web3Forms key created for that inbox

The access key decides the recipient: Web3Forms emails every submission to the
inbox the key was created for. Nothing a visitor types can change that. The key
is designed to be public (it stands in for the email address, it isn't a
password), so there are no secrets in the site.

The notification email:
- Subject: `New Free Quote Request — D & B Electric`
- From name: `D & B Electric Website`
- Lines for: business, submission time (Las Vegas time + UTC), name, email,
  phone, preferred contact, service requested, neighborhood/ZIP, project
  details and the page it was sent from.
- Reply-To is the customer's (validated) email, so pressing Reply answers the
  customer. The customer is never a recipient.

## Getting the access key (one time per client)

1. Go to https://web3forms.com and create an access key using
   BUSINESS_OWNER_EMAIL. Web3Forms emails the key to that inbox.
2. Paste the key into `WEB3FORMS_ACCESS_KEY` and redeploy.
3. Submit a test inquiry on the live site and confirm it arrives.

If the key is empty or wrong, customers see "Your request didn't go through"
with the call button, and nothing is sent.

## Reusing the site for another client

1. Set the new `BUSINESS_OWNER_EMAIL`, create a NEW Web3Forms key with that
   email, paste it into `WEB3FORMS_ACCESS_KEY`, and update the business facts
   in `SITE` (same file).
2. Run the tests from `app/`: `bun scripts/test-inquiry.ts`.
3. Rebuild, redeploy and send a test inquiry.

Never copy one client's key to another client's site: the key, not the code,
decides whose inbox receives the inquiries.

## Limits to know

- Free plan: 250 submissions per month. CC recipients, file uploads,
  autoresponders, webhooks and domain restriction are paid (Pro) features.
- Spam protection: a hidden honeypot field. Captcha options are paid or need
  extra setup.
- Web3Forms only accepts submissions from a real browser; server-side sending
  needs a paid plan.
