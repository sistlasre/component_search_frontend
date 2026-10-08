/**
 * Minimal, dependency-free vCard (.vcf) parser.
 *
 * Handles the bits that actually show up in real exports from Outlook, Google
 * Contacts, macOS Contacts and phones:
 *   - vCard 2.1 / 3.0 / 4.0
 *   - Folded (continued) lines
 *   - Grouped properties (`item1.TEL:...`)
 *   - Parameters with or without a name (`TEL;CELL:` vs `TEL;TYPE=CELL:`)
 *   - Quoted parameter values (`TYPE="WORK,VOICE"`)
 *   - QUOTED-PRINTABLE and BASE64 encodings
 *   - Escaped characters inside values (\n, \,, \;, \\)
 *   - Structured values (N, ORG, ADR)
 */

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

/**
 * Unfold a raw vCard string into logical lines.
 *
 * Per RFC 6350 a long line may be split by inserting CRLF followed by a single
 * whitespace character. vCard 2.1 additionally allows QUOTED-PRINTABLE soft
 * line breaks, where a line ending in `=` continues on the next line.
 */
function unfoldLines(raw) {
  const physical = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const logical = [];

  physical.forEach((line) => {
    const isFoldedWhitespace = /^[ \t]/.test(line);
    const previous = logical.length ? logical[logical.length - 1] : null;
    const previousIsSoftBreak = previous !== null && /=$/.test(previous);

    if (previous !== null && isFoldedWhitespace) {
      // Standard RFC folding: drop exactly one leading whitespace character.
      logical[logical.length - 1] = previous + line.slice(1);
    } else if (previous !== null && previousIsSoftBreak) {
      // Quoted-printable soft break: drop the trailing `=` and join.
      logical[logical.length - 1] = previous.slice(0, -1) + line;
    } else {
      logical.push(line);
    }
  });

  return logical.filter((line) => line.trim() !== '');
}

/**
 * Split on a delimiter, ignoring delimiters that are backslash-escaped or that
 * appear inside a double-quoted section.
 */
function splitUnescaped(value, delimiter) {
  const parts = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];

    if (char === '\\' && i + 1 < value.length) {
      current += char + value[i + 1];
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === delimiter && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  parts.push(current);
  return parts;
}

/** Reverse vCard value escaping (\n, \,, \;, \\). */
function unescapeValue(value) {
  let out = '';

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];

    if (char !== '\\' || i + 1 >= value.length) {
      out += char;
      continue;
    }

    const next = value[i + 1];
    i += 1;

    if (next === 'n' || next === 'N') out += '\n';
    else if (next === ',') out += ',';
    else if (next === ';') out += ';';
    else if (next === '\\') out += '\\';
    else out += next;
  }

  return out;
}

/** Decode a QUOTED-PRINTABLE string into UTF-8 text. */
function decodeQuotedPrintable(value) {
  const withoutSoftBreaks = value.replace(/=\n/g, '');
  const bytes = [];

  for (let i = 0; i < withoutSoftBreaks.length; i += 1) {
    const char = withoutSoftBreaks[i];

    if (char === '=' && /^[0-9A-Fa-f]{2}$/.test(withoutSoftBreaks.substr(i + 1, 2))) {
      bytes.push(parseInt(withoutSoftBreaks.substr(i + 1, 2), 16));
      i += 2;
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }

  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch (error) {
    // Fall back to latin-1 if TextDecoder is unavailable or the bytes are not
    // valid UTF-8.
    return bytes.map((byte) => String.fromCharCode(byte)).join('');
  }
}

/**
 * Parse one logical line into { name, group, params, value }.
 * Returns null if the line is not a valid property.
 */
function parseLine(line) {
  // The value starts at the first colon that is not inside a quoted parameter.
  let colonIndex = -1;
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ':' && !inQuotes) {
      colonIndex = i;
      break;
    }
  }

  if (colonIndex === -1) return null;

  const rawName = line.slice(0, colonIndex);
  let value = line.slice(colonIndex + 1);

  const nameParts = splitUnescaped(rawName, ';');
  let name = nameParts[0].trim();
  let group = null;

  // Grouped property, e.g. `item1.TEL`.
  const dotIndex = name.indexOf('.');
  if (dotIndex > -1) {
    group = name.slice(0, dotIndex);
    name = name.slice(dotIndex + 1);
  }

  const params = {};
  nameParts.slice(1).forEach((rawParam) => {
    const eqIndex = rawParam.indexOf('=');
    let key;
    let rawValues;

    if (eqIndex === -1) {
      // vCard 2.1 shorthand: `TEL;CELL:` means `TEL;TYPE=CELL:`.
      key = 'TYPE';
      rawValues = rawParam;
    } else {
      key = rawParam.slice(0, eqIndex).trim().toUpperCase();
      rawValues = rawParam.slice(eqIndex + 1);
    }

    const values = splitUnescaped(rawValues, ',')
      // Strip surrounding quotes, then split again: a quoted parameter may
      // itself hold a comma-separated list, e.g. TYPE="WORK,VOICE".
      .map((item) => item.trim().replace(/^"(.*)"$/, '$1'))
      .reduce((acc, item) => acc.concat(item.split(',')), [])
      .map((item) => item.trim())
      .filter(Boolean);

    params[key] = (params[key] || []).concat(values);
  });

  const encoding = (params.ENCODING || []).join('').toUpperCase();
  if (encoding.includes('QUOTED-PRINTABLE')) {
    value = decodeQuotedPrintable(value);
  }

  return { name: name.toUpperCase(), group, params, value };
}

/** Human-readable label from a property's TYPE parameters. */
function typeLabel(params, fallback) {
  const skip = new Set(['PREF', 'VOICE', 'INTERNET', 'OTHER']);
  const types = (params.TYPE || [])
    .map((type) => type.toUpperCase())
    .filter((type) => !skip.has(type));

  if (!types.length) return fallback;

  const pretty = {
    CELL: 'Mobile',
    MOBILE: 'Mobile',
    WORK: 'Work',
    HOME: 'Home',
    FAX: 'Fax',
    MAIN: 'Main',
    IPHONE: 'Mobile',
    TEXT: 'Text',
    VIDEO: 'Video',
    PAGER: 'Pager',
  };

  return types.map((type) => pretty[type] || toTitleCase(type)).join(' · ');
}

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function isPreferred(params) {
  return (params.TYPE || []).some((type) => type.toUpperCase() === 'PREF') || 'PREF' in params;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse vCard text into a normalized contact object.
 *
 * If the file contains multiple vCards, only the first is returned.
 * Throws if the text does not contain a vCard.
 */
export function parseVCard(text) {
  if (!isVCard(text)) {
    throw new Error('Not a valid vCard');
  }

  const lines = unfoldLines(text);
  const properties = [];

  for (let i = 0; i < lines.length; i += 1) {
    const property = parseLine(lines[i]);
    if (!property) continue;
    if (property.name === 'BEGIN') continue;
    // Stop at the end of the first card.
    if (property.name === 'END') break;
    properties.push(property);
  }

  const find = (name) => properties.find((property) => property.name === name);
  const findAll = (name) => properties.filter((property) => property.name === name);
  const textValue = (name) => {
    const property = find(name);
    return property ? unescapeValue(property.value).trim() : '';
  };

  // --- Name ---------------------------------------------------------------
  const nameProperty = find('N');
  const nameParts = nameProperty
    ? splitUnescaped(nameProperty.value, ';').map((part) => unescapeValue(part).trim())
    : [];
  const [family = '', given = '', additional = '', prefix = '', suffix = ''] = nameParts;

  const assembledName = [prefix, given, additional, family, suffix].filter(Boolean).join(' ');
  const fullName = textValue('FN') || assembledName;

  // --- Organization -------------------------------------------------------
  const orgProperty = find('ORG');
  const orgParts = orgProperty
    ? splitUnescaped(orgProperty.value, ';')
        .map((part) => unescapeValue(part).trim())
        .filter(Boolean)
    : [];

  // --- Multi-value properties ---------------------------------------------
  const emails = findAll('EMAIL')
    .map((property) => ({
      value: unescapeValue(property.value).trim(),
      label: typeLabel(property.params, 'Email'),
      preferred: isPreferred(property.params),
    }))
    .filter((entry) => entry.value);

  const tels = findAll('TEL')
    .map((property) => ({
      value: unescapeValue(property.value).trim(),
      label: typeLabel(property.params, 'Phone'),
      preferred: isPreferred(property.params),
    }))
    .filter((entry) => entry.value);

  const urls = findAll('URL')
    .map((property) => {
      const value = unescapeValue(property.value).trim();
      return {
        value,
        href: /^https?:\/\//i.test(value) ? value : `https://${value}`,
        label: typeLabel(property.params, 'Website'),
      };
    })
    .filter((entry) => entry.value);

  const addresses = findAll('ADR')
    .map((property) => {
      const parts = splitUnescaped(property.value, ';').map((part) => unescapeValue(part).trim());
      const [poBox = '', extended = '', street = '', locality = '', region = '', postalCode = '', country = ''] = parts;
      const cityLine = [locality, region].filter(Boolean).join(', ');
      const lines = [
        [poBox, extended, street].filter(Boolean).join(' '),
        [cityLine, postalCode].filter(Boolean).join(' '),
        country,
      ].filter(Boolean);

      return {
        label: typeLabel(property.params, 'Address'),
        lines,
        formatted: lines.join('\n'),
      };
    })
    .filter((entry) => entry.lines.length);

  // --- Photo --------------------------------------------------------------
  const photoProperty = find('PHOTO') || find('LOGO');
  let photo = '';
  if (photoProperty) {
    const raw = photoProperty.value.trim();
    const encoding = (photoProperty.params.ENCODING || []).join('').toUpperCase();
    const isBase64 = encoding.includes('B') || encoding.includes('BASE64');

    if (/^data:/i.test(raw) || /^https?:\/\//i.test(raw)) {
      photo = raw;
    } else if (isBase64 && raw) {
      const mediaType = (photoProperty.params.TYPE || ['JPEG'])[0].toLowerCase();
      photo = `data:image/${mediaType.replace('image/', '')};base64,${raw.replace(/\s/g, '')}`;
    }
  }

  return {
    fullName,
    firstName: given,
    lastName: family,
    prefix,
    suffix,
    nickname: textValue('NICKNAME'),
    title: textValue('TITLE') || textValue('ROLE'),
    organization: orgParts[0] || '',
    department: orgParts.slice(1).join(', '),
    emails,
    tels,
    urls,
    addresses,
    note: textValue('NOTE'),
    birthday: textValue('BDAY'),
    photo,
  };
}

/** Cheap sanity check that a fetched body is actually a vCard. */
export function isVCard(text) {
  return typeof text === 'string' && /BEGIN:VCARD/i.test(text.slice(0, 200));
}

/**
 * Produce a compact copy of the vCard suitable for QR encoding by stripping
 * embedded binary payloads (photos/logos), which blow past the QR size limit.
 */
export function stripBinaryProperties(text) {
  const lines = unfoldLines(text);
  const kept = lines.filter((line) => {
    const property = parseLine(line);
    if (!property) return true;
    if (property.name !== 'PHOTO' && property.name !== 'LOGO' && property.name !== 'SOUND') {
      return true;
    }
    // Keep photo references by URL; drop inline base64 blobs.
    return /^https?:\/\//i.test(property.value.trim());
  });

  return kept.join('\r\n');
}

/** Initials to show when a contact has no photo. */
export function getInitials(contact) {
  const fromName = [contact.firstName, contact.lastName].filter(Boolean);
  const source = fromName.length
    ? fromName
    : (contact.fullName || '').split(/\s+/).filter(Boolean);

  return source
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default parseVCard;
