import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';

/**
 * Shared chrome for a single CRM document type tab (RFQs/Quotes/Sales
 * Orders/Invoices): a search bar plus empty/error states, wrapping whatever
 * `renderBody` renders for the filtered items. Each instance owns its own
 * search field/query state, since every tab is now independently mounted.
 *
 * Props:
 * - label: display label used in empty/error copy (e.g. "RFQs")
 * - items: raw items for this document type
 * - hits: total count (falls back to items.length)
 * - error: error string to surface, if any
 * - searchableFields: [{ key, label }] options for the search dropdown
 * - matchesQuery: (item, fieldKey, lowerCaseQuery) => boolean
 * - renderBody: (filteredItems) => ReactNode
 */
const DocumentTypeTab = ({
  label,
  items,
  error,
  searchableFields,
  matchesQuery,
  renderBody
}) => {
  const fields = searchableFields || [];
  const [searchField, setSearchField] = useState(fields[0]?.key || '');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim() || !searchField) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter((doc) => matchesQuery(doc, searchField, query));
  }, [items, searchField, searchQuery, matchesQuery]);

  return (
    <>
      {fields.length > 0 && (
        <Card className="p-3 mb-3 bg-light border-0 shadow-sm">
          <Row className="g-2 align-items-center">
            <Col xs={12} sm={4} md={3}>
              <Form.Group controlId={`searchField-${label}`}>
                <Form.Select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  size="sm"
                >
                  {fields.map((f) => (
                    <option key={f.key} value={f.key}>
                      Search by {f.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={8} md={9}>
              <Form.Group controlId={`searchQuery-${label}`} className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Type to filter matching results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="sm"
                  className="pe-4"
                />
                {searchQuery && (
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none py-0 px-2"
                    onClick={() => setSearchQuery('')}
                    style={{ fontSize: '0.85rem' }}
                  >
                    ✕
                  </Button>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Card>
      )}

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
      ) : filteredItems.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <p className="text-muted mb-0">No matching documents found for your search criteria.</p>
          </Card.Body>
        </Card>
      ) : (
        renderBody(filteredItems)
      )}
    </>
  );
};

export default DocumentTypeTab;
