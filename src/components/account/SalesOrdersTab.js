import React from 'react';
import DocumentTypeTab from './DocumentTypeTab';
import { SalesOrdersView } from './DocumentPresenters';

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

const SalesOrdersTab = ({ items, error }) => (
  <DocumentTypeTab
    label="Sales Orders"
    items={items}
    error={error}
    searchableFields={SEARCHABLE_FIELDS}
    matchesQuery={matchesQuery}
    renderBody={(filteredItems) => <SalesOrdersView items={filteredItems} />}
  />
);

export default SalesOrdersTab;
