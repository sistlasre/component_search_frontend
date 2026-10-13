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

const BRAND = '#0d6efd';

/**
 * Map a URL id to its static .vcf path. The id maps 1:1 to the file in
 * `public/contacts/`, so `/contact/foo` reads `public/contacts/foo.vcf`.
 * Returns '' for ids that look like path traversal attempts.
 */
export const contactVcfPath = (contactId) => {
  if (!contactId) return '';
  const trimmed = contactId.trim();
  // react-router already blocks `/` in a single segment; this covers the rest.
  if (!trimmed || trimmed.includes('..') || trimmed.includes('\\')) return '';
  const name = trimmed.toLowerCase().endsWith('.vcf') ? trimmed : `${trimmed}.vcf`;
  return `${process.env.PUBLIC_URL || ''}/contacts/${encodeURIComponent(name)}`;
};

/**
 * Handler for `/contact/:contactId/download`: sends the visitor to the static
 * .vcf. Not used for `/contact/:contactId` itself, which is device-routed on
 * the server (see vercel.json).
 */
export const ContactDownloadRedirect = () => {
  const { contactId } = useParams();

  useEffect(() => {
    window.location.replace(contactVcfPath(contactId) || '/');
  }, [contactId]);

  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '40vh' }}>
      <Spinner animation="grow" variant="primary" />
    </div>
  );
};

/**
 * The contact webpage.
 *
 * On Vercel, `/contact/:contactId` only reaches React for Android visitors;
 * everyone else is served the raw vCard by `api/contact-download.js`. Under the
 * CRA dev server there is no such routing, so all devices see this page.
 */
const ContactPage = () => {
  const { contactId } = useParams();

  const [state, setState] = useState({ status: 'loading', contact: null, raw: '' });
  const [copied, setCopied] = useState(false);

  const fileUrl = useMemo(() => contactVcfPath(contactId), [contactId]);

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
              </div>
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

        .min-w-0 {
          min-width: 0;
        }
      `}</style>
    </Container>
  );
};

export default ContactPage;
