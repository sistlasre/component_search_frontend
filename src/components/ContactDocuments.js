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
  Button,
} from 'react-bootstrap';
import { apiService } from '../services/userManagementService';
import { useAuth } from '../context/AuthContext';

// The document types we render, in tab order, mapped to display labels.
const DOC_TYPES = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'rfqs', label: 'RFQs' },
  { key: 'sales_orders', label: 'Sales Orders' },
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
  if (!partNumber) return '—';
  return (
    <Link to={`/part/${encodeURIComponent(partNumber)}?pi=${btoa(partNumber)}`}>
      {partNumber}
    </Link>
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
            <HeaderField label="Sales Rep" value={doc.salesRep || '—'} />
            <HeaderField label="Terms" value={doc.terms || '—'} />
            <HeaderField label="Total" value={formatMoney(doc.totalPrice, symbol)} />
            {doc.currencyCode && <Badge bg="light" text="dark">{doc.currencyCode}</Badge>}
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
            <HeaderField label="Quote Date" value={formatDate(doc.quoteDate)} />
            <HeaderField label="Sales Rep" value={doc.salesRep || '—'} />
            <HeaderField label="Total" value={formatMoney(doc.totalPrice, symbol)} />
            {doc.currencyCode && <Badge bg="light" text="dark">{doc.currencyCode}</Badge>}
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
            {doc.currencyCode && <Badge bg="light" text="dark">{doc.currencyCode}</Badge>}
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
  const [typeErrors, setTypeErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(DOC_TYPES[0].key);

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
        const resp = await apiService.getContactDocuments({ email });
        if (!cancelled) {
          setResults(resp.data?.results || {});
          setTypeErrors(resp.data?.errors || {});
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
      <h2 className="mb-1" style={{ fontWeight: 400 }}>My Documents</h2>
      <p className="text-muted">Documents associated with <strong>{email}</strong></p>

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
            const typeError = typeErrors[key];
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
                {typeError && (
                  <Alert variant="warning" className="mb-3">
                    Couldn't load {label.toLowerCase()}: {typeError}
                  </Alert>
                )}
                {items.length === 0 && !typeError ? (
                  <Card className="shadow-sm border-0 text-center py-5">
                    <Card.Body>
                      <p className="text-muted mb-0">No {label.toLowerCase()} found.</p>
                    </Card.Body>
                  </Card>
                ) : (
                  renderTypeBody(key, items)
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
