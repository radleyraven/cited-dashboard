import { NextResponse } from 'next/server';

/**
 * DRE License Lookup API
 * GET /api/dre-lookup?licenseId=02041346
 * GET /api/dre-lookup?name=Raven,%20Radley
 *
 * Returns structured license data from CA DRE.
 * brokerageAddress = agent's mailing address (for NAP consistency)
 * broker_address = broker HQ (stored separately, NOT for platform NAP)
 */

function stripHtml(s: string): string {
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  // Decode common HTML entities
  s = s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  return s.trim();
}

function extractField(html: string, label: string): string {
  // Try: <strong>Label:</strong> ... <font size=2>VALUE</font>
  // Use RegExp constructor to support 's' (dotAll) + 'i' flags in older TS targets
  const re1 = new RegExp(
    '<strong>\\s*' + escapeRegExp(label) + '\\s*:?\\s*</strong>.*?(?:size\\s*=\\s*2\\s*>|<td[^>]*>)(.*?)(?:</font>|</td>)',
    'si'
  );
  let m = html.match(re1);
  if (!m) {
    const re2 = new RegExp(
      '<strong>\\s*' + escapeRegExp(label) + '\\s*:?\\s*</strong>\\s*(.*?)(?:<strong>|</tr>|</table>)',
      'si'
    );
    m = html.match(re2);
  }
  if (!m) return '';
  return stripHtml(m[1]);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const licenseId = searchParams.get('licenseId');
  const name = searchParams.get('name');

  if (!licenseId && !name) {
    return NextResponse.json({ error: 'Provide licenseId or name' }, { status: 400 });
  }

  const formData = new URLSearchParams();
  if (licenseId) {
    formData.set('LICENSE_ID', licenseId);
    formData.set('LICENSEE_NAME', '');
  } else {
    formData.set('LICENSEE_NAME', name!);
    formData.set('LICENSE_ID', '');
  }
  formData.set('CITY_STATE', '');

  try {
    const res = await fetch('https://www2.dre.ca.gov/PublicASP/pplinfo.asp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      body: formData.toString(),
    });
    let html = await res.text();

    // If it's a list page (no "License Type:" = no detail), fetch first result
    const isDetail = /License Type\s*:/i.test(html);
    if (!isDetail) {
      const listMatch = html.match(/pplinfo\.asp\?License_id=(\d+)/i);
      if (!listMatch) {
        return NextResponse.json({ error: 'No results found' }, { status: 404 });
      }
      const detailRes = await fetch(
        `https://www2.dre.ca.gov/PublicASP/pplinfo.asp?License_id=${listMatch[1]}`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }
      );
      html = await detailRes.text();
    }

    // Parse fields
    const licenseType = extractField(html, 'License Type').trim();
    const fullName = extractField(html, 'Name').trim();
    const rawAddr = extractField(html, 'Mailing Address');
    const mailingAddress = rawAddr.split('\n').filter(Boolean).map(l => l.trim()).join(', ');
    const parsedLicenseId = extractField(html, 'License ID').trim();
    const expirationDate = extractField(html, 'Expiration Date').trim();
    const licenseStatus = extractField(html, 'License Status').replace(/\s+/g, ' ').trim();

    // Responsible Broker
    let brokerName = '';
    let brokerLicenseId = '';
    let brokerAddress = '';

    const brokerRe = new RegExp('Responsible Broker.*?(?:size\\s*=\\s*2\\s*>|<td[^>]*>)(.*?)(?:</font>|</td>)', 'si');
    let brokerMatch = html.match(brokerRe);
    if (!brokerMatch) {
      const brokerRe2 = new RegExp('<strong>\\s*Responsible Broker\\s*:?\\s*</strong>\\s*(.*?)(?:<strong>|</tr>|</table>)', 'si');
      brokerMatch = html.match(brokerRe2);
    }

    if (brokerMatch) {
      const brokerHtml = brokerMatch[1];
      const idMatch = brokerHtml.match(/License_id=(\d+)/i);
      if (idMatch) brokerLicenseId = idMatch[1];

      const brokerText = stripHtml(brokerHtml);
      const lines = brokerText.split('\n').map(l => l.trim()).filter(Boolean);
      const contentLines = lines.filter(l => !/^License\s+ID\s*:\s*\d+$/i.test(l));

      if (contentLines.length > 0) {
        brokerName = contentLines[0];
        if (contentLines.length > 1) {
          brokerAddress = contentLines.slice(1).join(', ');
        }
      }
    }

    return NextResponse.json({
      license_type: licenseType,
      full_name: fullName,
      license_id: parsedLicenseId,
      license_status: licenseStatus,
      expiration_date: expirationDate,
      // Agent's mailing address — use for brokerageAddress (NAP consistency)
      mailing_address: mailingAddress,
      // Broker info — store separately, do NOT use broker_address for brokerageAddress
      broker_name: brokerName.trim(),
      broker_license_id: brokerLicenseId,
      broker_address: brokerAddress.trim(),
    });
  } catch (err) {
    console.error('DRE lookup error:', err);
    return NextResponse.json({ error: 'DRE lookup failed' }, { status: 500 });
  }
}
