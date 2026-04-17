export const config = { runtime: 'edge' };

const SUPA_URL = 'https://cggujadkrrrbeuuxitmm.supabase.co';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { competitor_id, competitor_name, competitor_email, scans } = body;

  if (!competitor_id || !competitor_name || !competitor_email || !Array.isArray(scans) || scans.length === 0) {
    return new Response('Missing required fields', { status: 400 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!RESEND_API_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Server misconfiguration', { status: 500 });
  }

  // Generate signed URLs for each scan (7 days = 604800 seconds)
  const signedScans = [];
  for (const scan of scans) {
    const res = await fetch(
      `${SUPA_URL}/storage/v1/object/sign/scans/${scan.file_path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ expiresIn: 604800 }),
      }
    );

    if (!res.ok) {
      return new Response(`Failed to sign URL for ${scan.judge_label}`, { status: 502 });
    }

    const { signedURL } = await res.json();
    signedScans.push({
      label: scan.judge_label,
      url: `${SUPA_URL}/storage/v1${signedURL}`,
    });
  }

  // Build HTML email
  const linksHtml = signedScans.map(s =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8eef5;">
        <span style="font-family:'Courier New',monospace;font-size:13px;color:#1a2332;">${s.label}</span>
      </td>
      <td style="padding:10px 0 10px 20px;border-bottom:1px solid #e8eef5;text-align:right;">
        <a href="${s.url}"
           style="display:inline-block;background:#1e6ab4;color:#ffffff;text-decoration:none;
                  padding:7px 16px;border-radius:6px;font-size:13px;font-weight:600;">
          Download
        </a>
      </td>
    </tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Barista Roku 2026 — Your scoresheets</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:12px;border:1px solid #c8d6e5;
                    box-shadow:0 4px 24px rgba(30,106,180,.10);overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1e6ab4;padding:28px 36px;">
            <div style="font-size:26px;font-weight:700;color:#ffffff;letter-spacing:2px;">
              BARISTA ROKU
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:4px;">
              Czech Barista Championship 2026
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 8px;font-size:15px;color:#1a2332;">
              Hi <strong>${competitor_name}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7c93;line-height:1.6;">
              Your scoresheets from the competition are ready. The download links below are
              valid for <strong>7 days</strong>. Please save the files to your device.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              ${linksHtml}
            </table>

            <p style="margin:28px 0 0;font-size:12px;color:#6b7c93;line-height:1.5;">
              If you have any questions, please contact the competition organisers.<br>
              This email was sent automatically — please do not reply.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f4f8;padding:16px 36px;border-top:1px solid #c8d6e5;">
            <div style="font-size:11px;color:#6b7c93;">
              Czech Barista Championship 2026 · Barista Roku
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Send via Resend
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Barista Roku <noreply@uctotom.cz>',
      to: [competitor_email],
      subject: 'Barista Roku 2026 — Your scoresheets',
      html,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    return new Response(`Resend error: ${err}`, { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
