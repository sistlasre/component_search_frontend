const fs = require('fs');
const path = require('path');

// Contact cards live in `public/contacts/`, which CRA copies to `build/contacts/`.
const CONTACTS_DIR = path.join(process.cwd(), 'build', 'contacts');

// Ids map 1:1 to filenames, so they must be strictly validated before touching
// the filesystem. Anything outside this set is rejected rather than sanitized.
const SAFE_ID = /^[A-Za-z0-9._-]+$/;

/**
 * Decode a QUOTED-PRINTABLE value (vCard 2.1 / Outlook exports) to UTF-8.
 */
function decodeQuotedPrintable(value) {
  const bytes = [];
  const input = value.replace(/=\r?\n/g, '');

  for (let i = 0; i < input.length; i += 1) {
    if (input[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(input.substr(i + 1, 2))) {
      bytes.push(parseInt(input.substr(i + 1, 2), 16));
      i += 2;
    } else {
      bytes.push(input.charCodeAt(i));
    }
  }

  return Buffer.from(bytes).toString('utf8');
}

/**
 * Pull the display name (FN) out of a vCard so the download gets a filename a
 * human recognises. Returns '' when FN is missing or unparseable.
 */
function extractFormattedName(vcf) {
  // Unfold continuation lines before matching.
  const unfolded = vcf
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '');

  const match = unfolded.match(/^FN((?:;[^:\n]*)?):(.*)$/im);
  if (!match) return '';

  const params = match[1] || '';
  let value = match[2] || '';

  if (/quoted-printable/i.test(params)) {
    value = decodeQuotedPrintable(value);
  }

  return value
    .replace(/\\n/gi, ' ')
    .replace(/\\([,;\\])/g, '$1')
    .trim();
}

/**
 * Build an ASCII-safe filename. Header values cannot carry raw newlines or
 * quotes (injection risk) and non-ASCII bytes are not portable in the plain
 * `filename` parameter, so accents are folded away for the fallback.
 */
function toAsciiFilename(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining accents
    .replace(/[^\x20-\x7E]/g, '') // drop anything still non-ASCII
    .replace(/["\\\r\n]/g, '') // header-injection characters
    .replace(/[/:*?<>|]/g, '-') // characters filesystems dislike
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = async (req, res) => {
  const { contactId } = req.query;

  const respondNotFound = () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.end('Contact not found');
  };

  if (!contactId || Array.isArray(contactId) || !SAFE_ID.test(contactId) || contactId.includes('..')) {
    return respondNotFound();
  }

  // `path.basename` is belt-and-braces on top of the SAFE_ID check above.
  const fileName = `${path.basename(contactId)}.vcf`;
  const filePath = path.join(CONTACTS_DIR, fileName);

  // Final guard: the resolved path must stay inside the contacts directory.
  if (!filePath.startsWith(CONTACTS_DIR + path.sep)) {
    return respondNotFound();
  }

  let vcf;
  try {
    vcf = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return respondNotFound();
  }

  if (!/BEGIN:VCARD/i.test(vcf.slice(0, 200))) {
    return respondNotFound();
  }

  const displayName = extractFormattedName(vcf) || contactId;
  const asciiName = toAsciiFilename(displayName) || contactId;
  const asciiFile = `${asciiName}.vcf`;
  // RFC 5987 form preserves the original (possibly accented) name for clients
  // that understand it; the plain `filename` is the ASCII fallback.
  const utf8File = encodeURIComponent(`${displayName}.vcf`);

  // Content-Type is the header that actually makes iOS and Android offer
  // "Add to Contacts" rather than rendering the card as plain text.
  res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${asciiFile}"; filename*=UTF-8''${utf8File}`
  );
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  // `/contact/:id` serves different content per device (Android gets the web
  // page via a rewrite in vercel.json, everything else lands here), so this
  // response must never sit in a shared cache where it could be handed to an
  // Android visitor. `private` keeps it out of the CDN; Vary covers any
  // intermediary that caches anyway.
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
  res.setHeader('Vary', 'User-Agent');

  const body = Buffer.from(vcf, 'utf8');
  // Set the byte length explicitly. A character-count Content-Length (the
  // classic mistake with multi-byte names) makes iOS Safari fail to parse the
  // response entirely.
  res.setHeader('Content-Length', body.length);

  if (req.method === 'HEAD') {
    return res.end();
  }

  return res.end(body);
};
