import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Card,
  Tabs,
  Tab,
  Table,
  Spinner,
  Alert,
  Badge,
  Button
} from 'react-bootstrap';
import { apiService } from '../services/userManagementService';
import { useAuth } from '../context/AuthContext';
import { FiFileText } from 'react-icons/fi';

// The document types we render, in tab order, mapped to display labels.
const DOC_TYPES = [
  { key: 'rfqs', label: 'RFQs' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'sales_orders', label: 'Sales Orders' },
  { key: 'invoices', label: 'Invoices' }
];

// ---- Formatting helpers (mirroring MyOrders.js conventions) ----
const formatMoney = (value, symbol = '$') => {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${symbol}${num.toFixed(4)}`;
};

const formatQty = (value) => {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString();
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const partLink = (partNumber) => {
  return partNumber || '—';
};

const PdfLink = ({ type, number }) => {
  if (!number) return null;
  // Dynamically generate your download URL
  const pdfUrl = `/api/cc/${type}/${number}/pdf`;
  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center ms-2 py-0 px-2"
      title="Download PDF"
      style={{ fontSize: '0.75rem', height: '22px', gap: '4px' }}
    >
      <FiFileText size={12} />
      <span>PDF</span>
    </a>
  );
};

// Shared line-item table for invoices / quotes / sales orders.
const LineItemsTable = ({ items, symbol, showDiscounts, showTotal }) => {
  if (!items || items.length === 0) {
    return <div className="text-muted small">No line items.</div>;
  }
  return (
    <Table bordered size="sm" className="mb-0">
      <thead>
        <tr>
          <th>Part Number</th>
          <th>Internal Part Number</th>
          <th>Manufacturer</th>
          <th className="text-end">Qty</th>
          <th className="text-end">Unit Price</th>
          {showDiscounts && <th className="text-end">Discounts</th>}
          <th className="text-end">Extra Costs</th>
          <th className="text-end">Extended</th>
          {showTotal && <th className="text-end">Total</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((li, idx) => (
          <tr key={idx}>
            <td>{partLink(li.partNumber)}</td>
            <td>{partLink(li.internalPartNumber)}</td>
            <td>{li.manufacturer || '—'}</td>
            <td className="text-end">{formatQty(li.quantity)}</td>
            <td className="text-end">{formatMoney(li.unitPrice, symbol)}</td>
            {showDiscounts && <td className="text-end">{formatMoney(li.discounts, symbol)}</td>}
            <td className="text-end">{formatMoney(li.extraCosts, symbol)}</td>
            <td className="text-end">{formatMoney(li.extendedPrice, symbol)}</td>
            {showTotal && <td className="text-end">{formatMoney(li.total, symbol)}</td>}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

// A header field shown as a small label/value pair above the line items.
const HeaderField = ({ label, value }) => (
  <span className="me-4 d-inline-block mb-1">
    <span className="text-muted small">{label}:</span> <strong>{value}</strong>
  </span>
);

const DocumentCard = ({ children }) => (
  <Card className="shadow-sm border-0 mb-3">
    <Card.Body>{children}</Card.Body>
  </Card>
);

const InvoicesView = ({ items }) => (
  <>
    {items.map((doc, idx) => {
      const symbol = doc.currencySymbol || '$';
      return (
        <DocumentCard key={doc.invoiceNumber || idx}>
          <div className="mb-2">
            <HeaderField label="Invoice #" value={doc.invoiceNumber || '—'} />
            <HeaderField label="Invoice Date" value={formatDate(doc.invoiceDate)} />
            <HeaderField label="Due Date" value={formatDate(doc.dueDate)} />
            <HeaderField label="PO #" value={doc.purchaseOrderNumber || '—'} />
            <HeaderField label="SO #" value={doc.salesOrderNumber || '—'} />
            <HeaderField label="Sales Rep" value={doc.salesRep || '—'} />
            <HeaderField label="Terms" value={doc.terms || '—'} />
            <HeaderField label="Total" value={formatMoney(doc.totalPrice, symbol)} />
            <HeaderField
              label="Invoice #"
              value={
                <>
                  {doc.invoiceNumber || '—'}
                  <PdfLink type="invoices" number={doc.invoiceNumber} />
                </>
              }
            />
          </div>
          <LineItemsTable items={doc.lineItems} symbol={symbol} />
        </DocumentCard>
      );
    })}
  </>
);

const QuotesView = ({ items }) => (
  <>
    {items.map((doc, idx) => {
      const symbol = doc.currencySymbol || '$';
      return (
        <DocumentCard key={doc.quoteNumber || idx}>
          <div className="mb-2">
            <HeaderField label="Quote #" value={doc.quoteNumber || '—'} />
            <HeaderField label="C-RFQ #" value={doc.customerRfqNumber || '—'} />
            <HeaderField label="Quote Date" value={formatDate(doc.quoteDate)} />
            <HeaderField label="Sales Rep" value={doc.salesRep || '—'} />
            <HeaderField label="Total" value={formatMoney(doc.totalPrice, symbol)} />
            <HeaderField
              label="Quote #"
              value={
                <>
                  {doc.quoteNumber || '—'}
                  <PdfLink type="quotes" number={doc.quoteNumber} />
                </>
              }
            />
          </div>
          <LineItemsTable items={doc.lineItems} symbol={symbol} showDiscounts />
        </DocumentCard>
      );
    })}
  </>
);

const SalesOrdersView = ({ items }) => (
  <>
    {items.map((doc, idx) => {
      const symbol = doc.currencySymbol || '$';
      return (
        <DocumentCard key={doc.salesOrderNumber || idx}>
          <div className="mb-2">
            <HeaderField label="Sales Order #" value={doc.salesOrderNumber || '—'} />
            <HeaderField label="Sales Order Date" value={formatDate(doc.salesOrderDate)} />
            <HeaderField label="Need By" value={formatDate(doc.needByDate)} />
            <HeaderField label="PO #" value={doc.purchaseOrderNumber || '—'} />
            <HeaderField label="Sales Rep" value={doc.salesRep || '—'} />
            <HeaderField label="Terms" value={doc.terms || '—'} />
            <HeaderField label="Total" value={formatMoney(doc.totalPrice, symbol)} />
            <HeaderField
              label="Sales Order #"
              value={
                <>
                  {doc.salesOrderNumber || '—'}
                  <PdfLink type="sales_orders" number={doc.salesOrderNumber} />
                </>
              }
            />
          </div>
          <LineItemsTable items={doc.lineItems} symbol={symbol} showTotal />
        </DocumentCard>
      );
    })}
  </>
);

// RFQs are flat (one row per RFQ, no line items).
const RfqsView = ({ items }) => (
  <Card className="shadow-sm border-0">
    <Table responsive hover className="mb-0 align-middle">
      <thead className="bg-light">
        <tr>
          <th>RFQ #</th>
          <th>C-RFQ #</th>
          <th>Created</th>
          <th>Part Number</th>
          <th>Manufacturer</th>
          <th className="text-end">Qty</th>
          <th className="text-end">Target Price</th>
          <th>Status</th>
          <th>Sales Rep</th>
        </tr>
      </thead>
      <tbody>
        {items.map((doc, idx) => {
          const symbol = doc.currencySymbol || '$';
          return (
            <tr key={doc.rfqNumber || idx}>
              <td>{doc.rfqNumber || '—'}</td>
              <td>{doc.customerRfqNumber || '—'}</td>
              <td>{formatDate(doc.createdAt)}</td>
              <td>{partLink(doc.partNumber)}</td>
              <td>{doc.manufacturer || '—'}</td>
              <td className="text-end">{formatQty(doc.quantity)}</td>
              <td className="text-end">{formatMoney(doc.targetPrice, symbol)}</td>
              <td>{doc.statusType ? <Badge bg="info">{doc.statusType}</Badge> : '—'}</td>
              <td>{doc.salesRep || '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  </Card>
);

const renderTypeBody = (typeKey, items) => {
  switch (typeKey) {
    case 'invoices':
      return <InvoicesView items={items} />;
    case 'quotes':
      return <QuotesView items={items} />;
    case 'sales_orders':
      return <SalesOrdersView items={items} />;
    case 'rfqs':
      return <RfqsView items={items} />;
    default:
      return null;
  }
};

const ContactDocuments = () => {
  const { user } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(DOC_TYPES[0].key);
  // Per-type loading flags while an individual section changes pages.
  const [pageLoading, setPageLoading] = useState({});

  const email = user?.email;

  useEffect(() => {
    if (!user || !email) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    const fetchDocuments = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await apiService.getContactDocuments(email);
        if (!cancelled) {
          setResults(resp?.results || {});
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || err.message || 'Failed to load documents');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDocuments();
    return () => {
      cancelled = true;
    };
  }, [user, email]);

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h3 className="mb-3">Sign in to view your documents</h3>
        <Button as={Link} to="/login" variant="primary">Log In</Button>
      </Container>
    );
  }

  if (!email) {
    return (
      <Container className="py-5 text-center">
        <h3 className="mb-3">No email on file</h3>
        <p className="text-muted">
          Your account does not have an email address associated with it, so we can't
          look up your documents. Please update your account details.
        </p>
        <Button as={Link} to="/account" variant="primary">Go to Account</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-1" style={{ fontWeight: 400 }}>My Orders</h2>
      <p className="text-muted">Orders associated with <strong>{email}</strong></p>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || DOC_TYPES[0].key)}
          className="mb-3"
        >
          {DOC_TYPES.map(({ key, label }) => {
            const typeResult = results[key] || {};
            const items = typeResult.items || [];
            const hits = typeResult.hits ?? items.length;
            return (
              <Tab
                key={key}
                eventKey={key}
                title={
                  <span>
                    {label}{' '}
                    <Badge bg="secondary" pill>{typeResult.hits ?? items.length}</Badge>
                  </span>
                }
              >
                {error && (
                  <Alert variant="warning" className="mb-3">
                    Couldn't load {label.toLowerCase()}: {error}
                  </Alert>
                )}
                {items.length === 0 && !error ? (
                  <Card className="shadow-sm border-0 text-center py-5">
                    <Card.Body>
                      <p className="text-muted mb-0">No {label.toLowerCase()} found.</p>
                    </Card.Body>
                  </Card>
                ) : (
                  <>
                    {renderTypeBody(key, items)}
                  </>
                )}
              </Tab>
            );
          })}
        </Tabs>
      )}
    </Container>
  );
};

export default ContactDocuments;
