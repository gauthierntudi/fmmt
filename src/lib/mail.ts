import { Resend } from "resend";

type ParticipantMail = {
  email: string;
  nom: string;
  prenom: string;
  typeInscription: string;
  paysNom: string;
  fonction: string;
  locale: string;
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM;
  if (!from) return null;
  if (from.includes("<")) return from;
  const name =
    process.env.RESEND_FROM_NAME || "Festival Mondial de la Musique et du Tourisme";
  return `${name} <${from}>`;
}

function getAppUrl() {
  return (process.env.APP_URL || "https://fmmt.events").replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function typeLabel(type: string, fr: boolean) {
  const mapFr: Record<string, string> = {
    PARTICIPANT: "Participant",
    ARTISTE: "Artiste",
    OFFICIEL: "Officiel",
    MEDIA: "Média",
  };
  const mapEn: Record<string, string> = {
    PARTICIPANT: "Participant",
    ARTISTE: "Artist",
    OFFICIEL: "Official",
    MEDIA: "Media",
  };
  return (fr ? mapFr : mapEn)[type] || type;
}

function confirmHtml(p: ParticipantMail) {
  const fr = p.locale === "fr";
  const appUrl = getAppUrl();
  const logoUrl = `${appUrl}/img/${fr ? "logo-fr-01.png" : "logo-en-01.png"}`;
  const heroUrl = `${appUrl}/img/fest09.jpg`;
  const prenom = escapeHtml(p.prenom);
  const nom = escapeHtml(p.nom);

  const copy = fr
    ? {
        lang: "fr",
        eyebrow: "Confirmation d'inscription",
        hello: `Bonjour ${prenom} ${nom},`,
        thanks:
          "Nous vous remercions pour votre inscription au Festival Mondial de la Musique et du Tourisme (FMMT). Votre inscription a été enregistrée avec succès.",
        next: "Un membre de notre équipe vous contactera prochainement avec plus de détails concernant l'événement.",
        summary: "Récapitulatif",
        type: "Type",
        country: "Pays",
        role: "Fonction",
        cta: "Visiter le site",
        regards: "Cordialement,",
        org: "Festival Mondial de la Musique et du Tourisme",
        contact: "Nous contacter",
        address: "Ave Likasi 125, Immeuble Mongala — Kinshasa / Gombe, RDC",
      }
    : {
        lang: "en",
        eyebrow: "Registration confirmation",
        hello: `Hello ${prenom} ${nom},`,
        thanks:
          "Thank you for registering for the World Music and Tourism Festival (FMMT). Your registration has been saved successfully.",
        next: "A member of our team will contact you shortly with more details about the event.",
        summary: "Summary",
        type: "Type",
        country: "Country",
        role: "Position",
        cta: "Visit the website",
        regards: "Best regards,",
        org: "World Music and Tourism Festival",
        contact: "Contact us",
        address: "Ave Likasi 125, Mongala Building — Kinshasa / Gombe, DRC",
      };

  return `<!DOCTYPE html>
<html lang="${copy.lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${copy.eyebrow}</title>
</head>
<body style="margin:0;padding:0;background:#f2f0ee;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f0ee;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:28px 24px 18px;">
              <a href="${appUrl}" target="_blank" style="text-decoration:none;">
                <img src="${logoUrl}" width="180" alt="FMMT" style="display:block;border:0;max-width:180px;height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <a href="${appUrl}" target="_blank" style="text-decoration:none;">
                <img src="${heroUrl}" width="600" alt="FMMT" style="display:block;border:0;width:100%;max-width:600px;height:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 8px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 18px;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:#0596ba;font-weight:bold;">
                ${copy.eyebrow}
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#222222;">
                ${copy.hello}
              </p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#444444;">
                ${copy.thanks}
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#444444;">
                ${copy.next}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 28px;font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f3f6;border:1px solid #eadfe6;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:bold;color:#87035c;text-transform:uppercase;letter-spacing:0.03em;">
                      ${copy.summary}
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.6;color:#333333;">
                      <tr>
                        <td style="padding:4px 0;color:#777777;width:110px;">${copy.type}</td>
                        <td style="padding:4px 0;font-weight:bold;">${escapeHtml(typeLabel(p.typeInscription, fr))}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#777777;">${copy.country}</td>
                        <td style="padding:4px 0;font-weight:bold;">${escapeHtml(p.paysNom)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#777777;">${copy.role}</td>
                        <td style="padding:4px 0;font-weight:bold;">${escapeHtml(p.fonction)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 36px 28px;font-family:Arial,Helvetica,sans-serif;">
              <a href="${appUrl}" target="_blank" style="display:inline-block;background:#00a1c1;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:24px;">
                ${copy.cta}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#777777;">
              <p style="margin:0;">
                ${copy.regards}<br /><br />
                <strong style="color:#333333;">${copy.org}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#8a005c;color:#ffffff;padding:26px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;text-align:center;">
              <p style="margin:0 0 12px;">
                <a href="https://web.facebook.com/profile.php?id=61575272762986" target="_blank" style="color:#ffffff;text-decoration:none;margin:0 8px;">Facebook</a>
                <a href="https://x.com/FMMT2025" target="_blank" style="color:#ffffff;text-decoration:none;margin:0 8px;">X</a>
                <a href="https://www.instagram.com/fmmt_festival/" target="_blank" style="color:#ffffff;text-decoration:none;margin:0 8px;">Instagram</a>
                <a href="https://www.linkedin.com/company/fmmt2025/" target="_blank" style="color:#ffffff;text-decoration:none;margin:0 8px;">LinkedIn</a>
              </p>
              <p style="margin:0 0 10px;opacity:0.92;">${copy.address}</p>
              <p style="margin:0;">
                <a href="${appUrl}" target="_blank" style="color:#ffffff;text-decoration:underline;">${appUrl.replace(/^https?:\/\//, "")}</a>
                &nbsp;·&nbsp;
                <a href="mailto:info@fmmt.events" style="color:#ffffff;text-decoration:underline;">${copy.contact}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function adminHtml(p: ParticipantMail) {
  const date = new Date().toLocaleString("fr-FR");
  const appUrl = getAppUrl();
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f4;color:#333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;">
          <tr>
            <td style="background:#87035c;padding:22px 24px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0;font-size:20px;color:#ffffff;">Nouvelle inscription</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 30px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f3f6;border:1px solid #eadfe6;">
                <tr><td style="padding:16px 18px;">
                  <p style="margin:0 0 8px;"><strong>Nom :</strong> ${escapeHtml(p.prenom)} ${escapeHtml(p.nom)}</p>
                  <p style="margin:0 0 8px;"><strong>Email :</strong> ${escapeHtml(p.email)}</p>
                  <p style="margin:0 0 8px;"><strong>Type :</strong> ${escapeHtml(typeLabel(p.typeInscription, true))}</p>
                  <p style="margin:0 0 8px;"><strong>Pays :</strong> ${escapeHtml(p.paysNom)}</p>
                  <p style="margin:0 0 8px;"><strong>Fonction :</strong> ${escapeHtml(p.fonction)}</p>
                  <p style="margin:0;"><strong>Date :</strong> ${escapeHtml(date)}</p>
                </td></tr>
              </table>
              <p style="margin:22px 0 0;text-align:center;">
                <a href="${appUrl}/admin/participants" style="display:inline-block;background:#00a1c1;color:#fff;text-decoration:none;font-weight:bold;padding:11px 22px;border-radius:24px;">
                  Voir dans l'admin
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendConfirmationEmails(participant: ParticipantMail): Promise<boolean> {
  const resend = getResend();
  const from = getFromAddress();

  if (!resend || !from) {
    console.warn("[mail] RESEND_API_KEY or RESEND_FROM missing — emails skipped");
    return false;
  }

  try {
    const fr = participant.locale === "fr";

    const { error: participantError } = await resend.emails.send({
      from,
      to: participant.email,
      subject: fr
        ? "Confirmation inscription - Festival Mondial de la Musique et du Tourisme"
        : "Registration confirmation - World Music and Tourism Festival",
      html: confirmHtml(participant),
      text: fr
        ? `Bonjour ${participant.prenom} ${participant.nom},\n\nNous vous remercions pour votre inscription au FMMT. Votre inscription a été enregistrée avec succès.\n\nUn membre de notre équipe vous contactera prochainement.\n\nCordialement,\nFestival Mondial de la Musique et du Tourisme`
        : `Hello ${participant.prenom} ${participant.nom},\n\nThank you for registering for FMMT. Your registration has been saved successfully.\n\nA member of our team will contact you shortly.\n\nBest regards,\nWorld Music and Tourism Festival`,
    });

    if (participantError) {
      console.error("[mail] participant email failed", participantError);
      return false;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const { error: adminError } = await resend.emails.send({
        from,
        to: adminEmail,
        subject: "Nouvelle inscription - FMMT",
        html: adminHtml(participant),
      });

      if (adminError) {
        console.error("[mail] admin email failed", adminError);
      }
    }

    return true;
  } catch (error) {
    console.error("[mail] send failed", error);
    return false;
  }
}
