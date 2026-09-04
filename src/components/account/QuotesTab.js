import React from 'react';
import DocumentTypeTab from './DocumentTypeTab';
import { QuotesView } from './DocumentPresenters';

const SEARCHABLE_FIELDS = [
  { key: 'partNumber', label: 'Part Number' },
  { key: 'internalPartNumber', label: 'Internal Part Number' }
];

const matchesQuery = (doc, field, query) =>
  doc.lineItems?.some((lineItem) => lineItem[field]?.toLowerCase().includes(query));

const QuotesTab = ({ items, error }) => (
  <DocumentTypeTab
    label="Quotes"
    items={items}
    error={error}
    searchableFields={SEARCHABLE_FIELDS}
    matchesQuery={matchesQuery}
    renderBody={(filteredItems) => <QuotesView items={filteredItems} />}
  />
);

export default QuotesTab;
