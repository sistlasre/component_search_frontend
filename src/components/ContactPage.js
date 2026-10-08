import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Spinner, Button, Row, Col } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import {
  FiMail,
  FiPhone,
  FiSmartphone,
  FiPrinter,
  FiGlobe,
  FiMapPin,
  FiDownload,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiLink,
} from 'react-icons/fi';
import SEO from './SEO';
import { parseVCard, isVCard, stripBinaryProperties, getInitials } from '../utils/vcardParser';

// QR codes degrade badly past ~1.2k characters at a scannable module size. If
// the vCard is larger than this we encode the page URL instead, which still
// gets the scanner to the contact.
const MAX_QR_PAYLOAD = 1200;

const BRAND = '#0d6efd';

/** Strip formatting from a phone number so `tel:` links dial correctly. */
const telHref = (value) => {
  const trimmed = value.trim();
  const digits = trimmed.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? `+${digits.slice(1).replace(/\+/g, '')}` : digits;
};

/** Pick an icon based on the phone number's label. */
const telIcon = (label) => {
  const normalized = (label || '').toLowerCase();
  if (normalized.includes('fax')) return FiPrinter;
  if (normalized.includes('mobile') || normalized.includes('cell')) return FiSmartphone;
  return FiPhone;
};

/** A single tappable row in the contact details list. */
const ContactRow = ({ icon: Icon, label, value, href, external }) => {
  const body = (
    <>
      <span
        className="contact-row-icon d-flex align-items-center justify-content-center flex-shrink-0"
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className="flex-grow-1 min-w-0">
        <span className="d-block text-uppercase text-muted fw-semibold contact-row-label">{label}</span>
        <span className="d-block fw-medium text-dark contact-row-value">{value}</span>
      </span>
    </>
  );

  if (!href) {
    return <div className="contact-row d-flex align-items-center gap-3">{body}</div>;
  }

  return (
    <a
      className="contact-row d-flex align-items-center gap-3 text-decoration-none"
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {body}
    </a>
  );
};

const ContactPage = () => {
  const { contactId } = useParams();

  const [state, setState] = useState({ status: 'loading', contact: null, raw: '' });
  const [copied, setCopied] = useState(false);

  // Normalize the URL segment to a filename. The id maps 1:1 to the file in
  // `public/contacts/`, so `/contact/foo` serves `public/contacts/foo.vcf`.
  const fileName = useMemo(() => {
    if (!contactId) return '';
    const trimmed = contactId.trim();
    // Guard against path traversal; react-router already blocks `/`.
    if (!trimmed || trimmed.includes('..') || trimmed.includes('\\')) return '';
    return trimmed.toLowerCase().endsWith('.vcf') ? trimmed : `${trimmed}.vcf`;
  }, [contactId]);

  const fileUrl = fileName
    ? `${process.env.PUBLIC_URL || ''}/contacts/${encodeURIComponent(fileName)}`
    : '';

  useEffect(() => {
    if (!fileUrl) {
      setState({ status: 'notfound', contact: null, raw: '' });
      return undefined;
    }

    let cancelled = false;
    setState({ status: 'loading', contact: null, raw: '' });

    const load = async () => {
      try {
        const response = await fetch(fileUrl, { headers: { Accept: 'text/vcard,text/plain' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        // A dev server / SPA fallback answers unknown paths with index.html and
        // a 200, so validate the payload rather than trusting the status.
        if (!isVCard(text)) throw new Error('Not a vCard');

        const contact = parseVCard(text);
        if (!cancelled) setState({ status: 'ready', contact, raw: text });
      } catch (error) {
        if (!cancelled) setState({ status: 'notfound', contact: null, raw: '' });
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  const { status, contact, raw } = state;

  // Prefer encoding the vCard itself so a scan offers "Add Contact" directly.
  const qrValue = useMemo(() => {
    if (!raw) return '';
    const compact = stripBinaryProperties(raw);
    if (compact.length <= MAX_QR_PAYLOAD) return compact;
    return typeof window !== 'undefined' ? window.location.href : '';
  }, [raw]);

  const handleCopyLink = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <Container className="py-5">
        <SEO title="Contact not found" description="This contact card is not available." noindex />
        <div className="text-center py-5">
          <h1 className="h3 fw-bold text-dark mb-3">Contact not found</h1>
          <p className="text-muted mb-4">
            We couldn&rsquo;t find a contact card at this address. The link may be incorrect or no longer active.
          </p>
          <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
            Go to homepage
          </Link>
        </div>
      </Container>
    );
  }

  const initials = getInitials(contact);
  const downloadName = `${contact.fullName || contactId}.vcf`;

  const seoDescription = [contact.fullName, contact.title, contact.organization]
    .filter(Boolean)
    .join(', ') || 'Contact card';

  return (
    <Container className="py-4 py-md-5 contact-page">
      <SEO
        title={contact.fullName || 'Contact'}
        description={`Contact details for ${seoDescription}. Save the contact card or scan the QR code.`}
        type="profile"
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        noindex
      />

      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={7} xl={6}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            {/* Header */}
            <div className="contact-hero text-center px-4 pt-5 pb-4">
              <div className="contact-avatar mx-auto mb-3">
                {contact.photo ? (
                  <img src={contact.photo} alt={contact.fullName} className="w-100 h-100 object-fit-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <h1 className="h3 fw-bold text-dark mb-1">{contact.fullName}</h1>

              {contact.title && <div className="text-primary fw-semibold">{contact.title}</div>}

              {contact.organization && (
                <div className="text-muted d-flex align-items-center justify-content-center gap-2 mt-1">
                  <FiBriefcase size={15} strokeWidth={1.75} />
                  <span>
                    {contact.organization}
                    {contact.department ? ` — ${contact.department}` : ''}
                  </span>
                </div>
              )}
            </div>

            <Card.Body className="px-4 pb-4 pt-0">
              {/* Primary action */}
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-4">
                <Button
                  as="a"
                  href={fileUrl}
                  download={downloadName}
                  variant="primary"
                  className="rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center justify-content-center gap-2"
                >
                  <FiDownload size={18} strokeWidth={2} />
                  Save contact
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleCopyLink}
                  className="rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center justify-content-center gap-2"
                >
                  {copied ? <FiCheck size={18} strokeWidth={2} /> : <FiLink size={18} strokeWidth={2} />}
                  {copied ? 'Copied' : 'Copy link'}
                </Button>
              </div>

              {/* Details */}
              <div className="contact-rows">
                {contact.tels.map((tel, index) => (
                  <ContactRow
                    key={`tel-${index}`}
                    icon={telIcon(tel.label)}
                    label={tel.label}
                    value={tel.value}
                    href={`tel:${telHref(tel.value)}`}
                  />
                ))}

                {contact.emails.map((email, index) => (
                  <ContactRow
                    key={`email-${index}`}
                    icon={FiMail}
                    label={email.label}
                    value={email.value}
                    href={`mailto:${email.value}`}
                  />
                ))}

                {contact.urls.map((url, index) => (
                  <ContactRow
                    key={`url-${index}`}
                    icon={FiGlobe}
                    label={url.label}
                    value={url.value}
                    href={url.href}
                    external
                  />
                ))}

                {contact.addresses.map((address, index) => (
                  <ContactRow
                    key={`adr-${index}`}
                    icon={FiMapPin}
                    label={address.label}
                    value={address.lines.join(', ')}
                    href={`https://maps.google.com/?q=${encodeURIComponent(address.lines.join(', '))}`}
                    external
                  />
                ))}

                {contact.birthday && (
                  <ContactRow icon={FiCalendar} label="Birthday" value={contact.birthday} />
                )}
              </div>

              {contact.note && (
                <p className="text-muted small mt-4 mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {contact.note}
                </p>
              )}

              {/* QR */}
              {qrValue && (
                <div className="text-center mt-4 pt-4 border-top">
                  <div className="d-inline-block bg-white border rounded-4 p-3">
                    <QRCodeSVG
                      value={qrValue}
                      size={168}
                      level="M"
                      marginSize={0}
                      bgColor="#ffffff"
                      fgColor="#1a1d20"
                    />
                  </div>
                  <div className="text-muted small mt-2">Scan to save this contact</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .contact-page {
          font-family: -apple-system, BlinkMacSystemFont, "IBM Plex Sans", "Inter", "Segoe UI", Roboto, sans-serif;
        }

        .contact-hero {
          background: linear-gradient(180deg, rgba(13, 110, 253, 0.08) 0%, rgba(13, 110, 253, 0) 100%);
        }

        .contact-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          overflow: hidden;
          background: ${BRAND};
          color: #fff;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(13, 110, 253, 0.25);
        }

        .contact-avatar img {
          object-fit: cover;
        }

        .contact-rows {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .contact-row {
          padding: 12px;
          border-radius: 12px;
          color: inherit;
          transition: background-color 0.18s ease, transform 0.18s ease;
        }

        a.contact-row:hover {
          background-color: #f8f9fa;
          transform: translateX(2px);
        }

        a.contact-row:hover .contact-row-value {
          color: ${BRAND} !important;
        }

        .contact-row-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(13, 110, 253, 0.1);
          color: ${BRAND};
        }

        .contact-row-label {
          font-size: 0.68rem;
          letter-spacing: 0.06em;
        }

        .contact-row-value {
          font-size: 0.98rem;
          word-break: break-word;
        }

        .min-w-0 {
          min-width: 0;
        }
      `}</style>
    </Container>
  );
};

export default ContactPage;
