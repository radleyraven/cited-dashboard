export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}>

      {/* Header */}
      <header style={{ background: '#0A1929', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '5px', color: '#00BFA6' }}>CITED</div>
          </a>
          <div style={{ fontSize: '10px', color: '#4a6380', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '3px' }}>AI Citation Optimization™</div>
        </div>
        <div style={{ fontSize: '11px', color: '#4a6380' }}>Powered by <span style={{ color: '#00BFA6', fontWeight: 700 }}>PRISM™</span></div>
      </header>
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #00BFA6, #D4A830, #00BFA6)' }} />

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px 64px' }}>

        {/* Title */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-block', background: '#0A1929', color: '#D4A830', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px' }}>
            Legal
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0A1929', margin: '0 0 12px', lineHeight: 1.2 }}>Privacy Policy</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Last updated: April 8, 2026</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '40px 36px', border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 32px' }}>
            Cited (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and retain information when you use our AI Citation Optimization™ services at <a href="https://citedagent.com" style={{ color: '#00BFA6' }}>citedagent.com</a>. By using Cited, you agree to the practices described below.
          </p>

          {/* Section 1 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '8px', borderTop: '2px solid #f0f4f8' }}>1. Information We Collect</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 12px' }}>
            We collect information you provide directly when you register or complete our intake form, including:
          </p>
          <ul style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.9, margin: '0 0 12px', paddingLeft: '24px' }}>
            <li><strong>Identity &amp; contact information:</strong> Full name, email address, and phone number.</li>
            <li><strong>Professional information:</strong> Brokerage name, real estate license number, years of experience, primary markets, and transaction history.</li>
            <li><strong>Platform URLs:</strong> Links to your LinkedIn, Zillow, Yelp, Realtor.com, FastExpert, HomeLight, personal website, YouTube, and other professional profiles.</li>
            <li><strong>MLS data files:</strong> Transaction documents or exports you upload for profile optimization purposes. These files are processed and then deleted (see Data Retention).</li>
            <li><strong>PRISM™ scan results:</strong> Foundation Score data, per-model visibility scores, platform status, and competitive gap analysis generated through our scanning process.</li>
            <li><strong>Satellite website data:</strong> If Cited builds and hosts a personal website on your behalf, we store the domain registration, hosting configuration, and website content. You own the content; Cited manages the infrastructure.</li>
            <li><strong>Headshot and photos:</strong> Professional photos you provide for use on platform profiles and your satellite website.</li>
          </ul>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 32px' }}>
            We also collect usage data automatically when you access our dashboard, including login times, pages viewed, and feature interactions. This data is collected via Vercel Analytics and does not identify you individually.
          </p>

          {/* Section 2 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '28px', borderTop: '2px solid #f0f4f8' }}>2. How We Use Your Information</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 12px' }}>
            We use the information we collect exclusively to deliver and improve our services to you. Specifically, your information is used to:
          </p>
          <ul style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.9, margin: '0 0 32px', paddingLeft: '24px' }}>
            <li>Build and optimize your AI citation profile across platforms.</li>
            <li>Write professional bios and authority articles in your voice.</li>
            <li>Submit your profile to relevant directories and citation sources.</li>
            <li>Run monthly PRISM scans across AI models to measure and track your Foundation Score.</li>
            <li>Send service updates, reports, and transactional emails related to your account.</li>
            <li>Authenticate your identity and manage your account access.</li>
          </ul>

          {/* Section 3 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '28px', borderTop: '2px solid #f0f4f8' }}>3. How We Share Your Information</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 12px' }}>
            <strong>We do not sell your personal information to third parties.</strong> We share your information only with the following trusted service providers who help us operate and deliver our services:
          </p>
          <ul style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.9, margin: '0 0 12px', paddingLeft: '24px' }}>
            <li><strong>Supabase</strong> — our database provider. Your profile data and account information is stored securely in Supabase-hosted infrastructure.</li>
            <li><strong>Vercel</strong> — our hosting provider and analytics platform. Vercel hosts the Cited application and collects anonymized usage analytics.</li>
            <li><strong>Resend</strong> — our transactional email delivery provider. Used to send account confirmation, magic link authentication, and service communication emails.</li>
            <li><strong>Foursquare</strong> — used to support venue and location data relevant to your market profile optimization.</li>
            <li><strong>Google</strong> — used for OAuth authentication when you sign in with your Google account.</li>
          </ul>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 32px' }}>
            Each provider is contractually bound to process your data only as necessary to perform their services. We may also disclose information if required by law, legal process, or to protect the safety and rights of Cited or its users.
          </p>

          {/* Section 4 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '28px', borderTop: '2px solid #f0f4f8' }}>4. Data Retention</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 12px' }}>
            We retain your personal information for the duration of your active service with Cited. Following cancellation of your service:
          </p>
          <ul style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.9, margin: '0 0 32px', paddingLeft: '24px' }}>
            <li>Your profile data is retained for <strong>90 days</strong> after your cancellation date, then permanently deleted.</li>
            <li>MLS data files and any uploaded transaction documents are deleted from our systems immediately after they have been processed for your profile optimization.</li>
            <li>Content we have created on your behalf (articles, bios) remains yours and is not subject to deletion by us.</li>
          </ul>

          {/* Section 5 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '28px', borderTop: '2px solid #f0f4f8' }}>5. Your Rights</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 12px' }}>
            You have the right to:
          </p>
          <ul style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.9, margin: '0 0 12px', paddingLeft: '24px' }}>
            <li><strong>Access</strong> the personal information we hold about you.</li>
            <li><strong>Correct</strong> any inaccurate or incomplete information.</li>
            <li><strong>Request deletion</strong> of your personal data (subject to any legal retention obligations).</li>
          </ul>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 32px' }}>
            To exercise any of these rights, contact us at <a href="mailto:hello@citedagent.com" style={{ color: '#00BFA6' }}>hello@citedagent.com</a>. We will respond within 30 days.
          </p>

          {/* Section 6 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '28px', borderTop: '2px solid #f0f4f8' }}>6. Cookies</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 32px' }}>
            Cited uses session cookies solely for authentication purposes — to maintain your logged-in state while using the dashboard. We do not use advertising cookies, tracking pixels, or any cookies for behavioral targeting. You can disable cookies in your browser settings, but doing so will prevent you from logging in to your Cited account.
          </p>

          {/* Section 7 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '28px', borderTop: '2px solid #f0f4f8' }}>7. Data Security</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 32px' }}>
            We use industry-standard security measures including encryption in transit (TLS), secure database hosting through Supabase, and role-based access controls to protect your information. No method of transmission over the internet is 100% secure; however, we take reasonable steps to protect your data from unauthorized access, disclosure, or loss.
          </p>

          {/* Section 8 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '28px', borderTop: '2px solid #f0f4f8' }}>8. Changes to This Policy</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: '0 0 32px' }}>
            We may update this Privacy Policy from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Continued use of Cited after changes constitutes your acceptance of the updated policy. For material changes, we will notify you via email.
          </p>

          {/* Section 9 */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1929', margin: '0 0 12px', paddingTop: '28px', borderTop: '2px solid #f0f4f8' }}>9. Contact</h2>
          <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.8, margin: 0 }}>
            If you have questions or concerns about this Privacy Policy or how your data is handled, please contact us at:
          </p>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', marginTop: '16px' }}>
            <div style={{ fontSize: '14px', color: '#0A1929', fontWeight: 600 }}>Cited</div>
            <div style={{ fontSize: '14px', color: '#4a5568', marginTop: '4px' }}>
              <a href="mailto:hello@citedagent.com" style={{ color: '#00BFA6' }}>hello@citedagent.com</a>
            </div>
            <div style={{ fontSize: '14px', color: '#4a5568' }}>citedagent.com</div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#94a3b8', lineHeight: 2 }}>
          <div>
            <a href="/how-it-works" style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>How It Works</a>
            <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none', marginRight: '16px' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a>
          </div>
          <div style={{ marginTop: '8px' }}>
            Cited · AI Citation Optimization™ for Professionals · <a href="https://citedagent.com" style={{ color: '#94a3b8' }}>citedagent.com</a>
          </div>
        </div>

      </main>
    </div>
  );
}
