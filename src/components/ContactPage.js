import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, Row } from 'react-bootstrap';

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

/** Public download URL. Served by `api/contact-download.js` in production. */
export const contactDownloadPath = (contactId) =>
  contactVcfPath(contactId) ? `/contact/${encodeURIComponent(contactId)}/download` : '';

/**
 * Fallback handler for `/contact/:contactId/download`.
 *
 * In production Vercel rewrites that path to the serverless function before
 * React ever loads, so this never runs. It exists for the CRA dev server,
 * which has no serverless runtime and would otherwise render the SPA shell.
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
