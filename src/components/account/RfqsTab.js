import React from 'react';
import DocumentTypeTab from './DocumentTypeTab';
import { RfqsView } from './DocumentPresenters';

const SEARCHABLE_FIELDS = [
  { key: 'partNumber', label: 'Part Number' },
  { key: 'internalPartNumber', label: 'Internal Part Number' }
];

// RFQs are flat records (no nested line items), so both fields live directly
// on the doc rather than inside a lineItems array.
const matchesQuery = (doc, field, query) => doc[field]?.toLowerCase().includes(query);

const RfqsTab = ({ items, error }) => (
  <DocumentTypeTab
    label="RFQs"
    items={items}
    error={error}
    searchableFields={SEARCHABLE_FIELDS}
    matchesQuery={matchesQuery}
    renderBody={(filteredItems) => <RfqsView items={filteredItems} />}
  />
);

export default RfqsTab;
