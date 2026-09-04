import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { FiFileText } from 'react-icons/fi';

// ---- Formatting helpers (shared by all CRM document tabs) ----
export const formatMoney = (value, symbol = '$') => {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `${symbol}${num.toFixed(4)}`;
};

export const formatQty = (value) => {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString();
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

export const partLink = (partNumber) => partNumber || '—';

export const PdfLink = ({ type, number }) => {
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
export const LineItemsTable = ({ items, symbol, showDiscounts, showTotal }) => {
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
export const HeaderField = ({ label, value }) => (
  <span className="me-4 d-inline-block mb-1">
    <span className="text-muted small">{label}:</span> <strong>{value}</strong>
  </span>
);

export const DocumentCard = ({ children }) => (
  <Card className="shadow-sm border-0 mb-3">
    <Card.Body>{children}</Card.Body>
  </Card>
);

export const InvoicesView = ({ items }) => (
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

export const QuotesView = ({ items }) => (
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

export const SalesOrdersView = ({ items }) => (
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
export const RfqsView = ({ items }) => (
  <Card className="shadow-sm border-0">
    <Table responsive hover className="mb-0 align-middle">
      <thead className="bg-light">
        <tr>
          <th>RFQ #</th>
          <th>C-RFQ #</th>
          <th>Created</th>
          <th>Part Number</th>
          <th>Internal PN</th>
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
              <td>{partLink(doc.internalPartNumber)}</td>
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
