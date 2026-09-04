import React from 'react';
import DocumentTypeTab from './DocumentTypeTab';
import { InvoicesView } from './DocumentPresenters';

const SEARCHABLE_FIELDS = [
  { key: 'partNumber', label: 'Part Number' },
  { key: 'internalPartNumber', label: 'Internal Part Number' },
  { key: 'purchaseOrderNumber', label: 'PO #' }
];

const matchesQuery = (doc, field, query) => {
  if (field === 'purchaseOrderNumber') {
    return doc.purchaseOrderNumber?.toLowerCase().includes(query);
  }
  return doc.lineItems?.some((lineItem) => lineItem[field]?.toLowerCase().includes(query));
};

const InvoicesTab = ({ items, error }) => (
  <DocumentTypeTab
    label="Invoices"
    items={items}
    error={error}
    searchableFields={SEARCHABLE_FIELDS}
    matchesQuery={matchesQuery}
    renderBody={(filteredItems) => <InvoicesView items={filteredItems} />}
  />
);

export default InvoicesTab;
