import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_name, email, primary_market, secondary_market, growth_market } = body;

    // Validate required fields
    if (!client_name || !primary_market || !secondary_market || !growth_market) {
      return NextResponse.json(
        { error: 'Missing required fields: client_name, primary_market, secondary_market, growth_market' },
        { status: 400 }
      );
    }

    // If email is empty, log and skip send (graceful no-op)
    if (!email) {
      console.log('[strategy-confirmed] No email address provided — skipping send for', client_name);
      return NextResponse.json({ success: true, skipped: true, reason: 'no_email' });
    }

    // Derive FirstName from client_name
    const firstName = client_name.trim().split(/\s+/)[0] || client_name;

    // Read HTML template
    const templatePath = path.resolve(process.cwd(), '../../references/emails/cited-strategy-confirmed-email.html');
    let html: string;
    try {
      html = fs.readFileSync(templatePath, 'utf-8');
    } catch (err) {
      console.error('[strategy-confirmed] Failed to read email template:', templatePath, err);
      return NextResponse.json({ error: 'Email template not found' }, { status: 500 });
    }

    // Replace variables
    html = html
      .replace(/\[FirstName\]/g, firstName)
      .replace(/\[PrimaryMarket\]/g, primary_market)
      .replace(/\[SecondaryMarket\]/g, secondary_market)
      .replace(/\[GrowthMarket\]/g, growth_market);

    // Build subject
    const subject = `${firstName} — your strategy is locked in.`;

    // Write html to a temp file to avoid shell escaping issues
    const tmpFile = `/tmp/strategy-confirmed-${Date.now()}.html`;
    fs.writeFileSync(tmpFile, html, 'utf-8');

    try {
      const cmd = [
        'gog gmail send',
        `--to="${email}"`,
        `--subject="${subject}"`,
        `--body-html="$(cat ${tmpFile})"`,
        `--from=radleyraven@gmail.com`,
        `-a radleyraven@gmail.com`,
      ].join(' ');

      execSync(cmd, { timeout: 15000, stdio: 'pipe' });
    } finally {
      // Clean up temp file
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }

    console.log(`[strategy-confirmed] Email sent to ${email} for ${client_name}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[strategy-confirmed] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
