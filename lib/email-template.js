/**
 * Generates responsive, beautifully styled HTML email for Daily Scripture delivery.
 */
export function generateDailyVerseEmail({ name, verse, dateStr, unsubscribeUrl }) {
  const greeting = name && name !== 'Friend' && name !== 'Anonymous' ? `Good morning, ${name}` : 'Good morning, friend';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Scripture — Grace & Hope</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fbf9f4; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #142a24;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fbf9f4; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e3eae4; overflow: hidden; box-shadow: 0 4px 20px rgba(20, 42, 36, 0.05);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 20px; text-align: center; border-bottom: 1px solid #f2f5f2;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: auto;">
                <tr>
                  <td style="width: 32px; height: 32px; background-color: #1f6b58; border-radius: 9px; text-align: center; vertical-align: middle; color: #ffffff; font-size: 16px;">
                    🕊️
                  </td>
                  <td style="padding-left: 10px; font-size: 19px; font-weight: 700; color: #142a24; font-family: Georgia, serif;">
                    Grace & Hope
                  </td>
                </tr>
              </table>
              <p style="margin: 8px 0 0; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #1f6b58; font-weight: 700;">
                Daily Scripture • ${dateStr}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 36px 20px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #5e7069; line-height: 1.6;">
                ${greeting},
              </p>
              <p style="margin: 0 0 28px; font-size: 16px; color: #5e7069; line-height: 1.6;">
                Here is a word of encouragement to carry with you throughout your day:
              </p>

              <!-- Quote Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(145deg, #185244 0%, #1f6b58 100%); border-radius: 16px; margin: 0 0 32px; box-shadow: 0 10px 24px rgba(31, 107, 88, 0.15);">
                <tr>
                  <td style="padding: 36px 32px; color: #ffffff; text-align: center;">
                    <div style="font-family: Georgia, serif; font-size: 48px; line-height: 0.8; opacity: 0.35; margin-bottom: 12px;">“</div>
                    <p style="font-family: Georgia, serif; font-size: 21px; line-height: 1.5; font-style: italic; margin: 0 0 18px; color: #ffffff;">
                      ${verse.text}
                    </p>
                    <div style="font-size: 14px; font-weight: 700; letter-spacing: 0.05em; color: #eaf2ed; border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 14px; display: inline-block;">
                      ${verse.ref} (${verse.translation || 'NIV'})
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 28px; font-size: 15px; color: #5e7069; line-height: 1.6; text-align: center;">
                Whatever burdens or decisions you are facing today, remember that you are never walking through them alone.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://grace-and-hope.vercel.app" style="display: inline-block; background-color: #1f6b58; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 13px 26px; border-radius: 12px; box-shadow: 0 4px 14px rgba(31, 107, 88, 0.25);">
                      Visit the Community Wall →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px; border-top: 1px solid #f2f5f2; text-align: center; color: #889b93; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 8px;">
                You are receiving this daily verse because you joined <strong>Grace & Hope</strong>.
              </p>
              <p style="margin: 0;">
                <a href="${unsubscribeUrl || 'https://grace-and-hope.vercel.app'}" style="color: #5e7069; text-decoration: underline;">Manage preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
