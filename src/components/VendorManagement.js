import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Spinner,
  Alert,
  Button,
  Badge,
  Modal,
  Tabs,
  Tab
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faBoxesStacked,
  faHandshake,
  faChevronDown,
  faChevronRight,
  faLocationDot,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { apiService } from '../services/userManagementService';

const DASH = '—';
const DEFAULT_PAGE_SIZE = 25;

// ---- Formatting helpers (mirroring ContactDocuments.js / MyOrders.js conventions) ----
const formatMoney = (value, symbol = '$', digits = 4) => {
  if (value == null || value === '') return DASH;
  const num = Number(value);
  if (Number.isNaN(num)) return DASH;
  return `${symbol}${num.toFixed(digits)}`;
};

const formatQty = (value) => {
  if (value == null || value === '') return DASH;
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString();
};

const formatDate = (value) => {
  if (!value) return DASH;
  // The API returns naive timestamps like "2026-02-18 00:02:41.547170".
  // Safari won't parse the space-separated form, so normalise it first.
  const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const textOrDash = (value) => {
  if (value == null) return DASH;
  const str = String(value).trim();
  return str === '' ? DASH : str;
};

// Reduce an API timestamp to the YYYY-MM-DD form the history endpoints expect.
// Timestamps arrive as "2026-02-18 00:02:41.589665" or already as "2026-02-18";
// slicing the leading date avoids the UTC shift a Date round-trip would cause.
const toDateParam = (value) => {
  if (!value) return '';
  const match = String(value).trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
};

// The API answers 404 when a vendor simply has no records of a given kind
// (consignment in particular), which is an empty state rather than a failure.
const isNotFound = (err) => err?.response?.status === 404;

const errorMessage = (err, fallback) =>
  err?.response?.data?.error || err?.message || fallback;

// Excess and consignment are structurally identical apart from their key names
// and endpoints, so both sections are driven from this config.
const SECTIONS = {
  excess: {
    label: 'Excess',
    icon: faBoxesStacked,
    numberKey: 'excessNumber',
    nameKey: 'excessName',
    numberLabel: 'Excess #',
    nameLabel: 'Excess Name',
    // Excess lines carry a vendor quote number; consignment lines do not.
    showQuoteNumber: true,
    emptyText: 'No excess submissions found for this vendor.',
    fetchList: (vendorId, page) => apiService.getVendorExcess(vendorId, { page }),
    fetchLines: (vendorId, number, page) =>
      apiService.getVendorExcessLines(vendorId, number, { page })
  },
  consignment: {
    label: 'Consignment',
    icon: faHandshake,
    numberKey: 'consignmentNumber',
    nameKey: 'consignmentName',
    numberLabel: 'Consignment #',
    nameLabel: 'Consignment Name',
    showQuoteNumber: false,
    emptyText: 'No consignments found for this vendor.',
    fetchList: (vendorId, page) => apiService.getVendorConsignment(vendorId, { page }),
    fetchLines: (vendorId, number, page) =>
      apiService.getVendorConsignmentLines(vendorId, number, { page })
  }
};

// Small label/value pair used throughout the vendor information panel.
const InfoField = ({ label, value }) => (
  <div className="mb-2">
    <span className="text-muted small">{label}:</span>{' '}
    <strong>{value}</strong>
  </div>
);

// "Showing 1–25 of 65" plus prev/next controls, shared by lists and line tables.
const Pager = ({ page, pageSize, hits, loading, onPageChange }) => {
  const size = pageSize || DEFAULT_PAGE_SIZE;
  const total = hits || 0;
  const totalPages = Math.max(1, Math.ceil(total / size));
  if (total <= size) return null;

  const first = (page - 1) * size + 1;
  const last = Math.min(page * size, total);

  return (
    <div className="d-flex justify-content-between align-items-center mt-2">
      <small className="text-muted">
        Showing {first}–{last} of {total.toLocaleString()}
      </small>
      <div className="d-flex align-items-center gap-2">
        {loading && <Spinner animation="border" size="sm" />}
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <small className="text-muted">
          Page {page} of {totalPages}
        </small>
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Past RFQ / Quote history for a part. Both endpoints return the same envelope
// ({ hits, page, pageSize, items }) but name their date and price fields
// differently, so each tab declares its own accessors.
const HISTORY_TABS = [
  {
    key: 'rfqs',
    label: 'Past RFQs',
    dateKey: 'createdAt',
    priceKey: 'targetPrice',
    priceLabel: 'Target Price',
    emptyText: 'No previous RFQs found for this part.',
    fetch: (mpn, uploadDate, page) =>
      apiService.getVendorPreviousRfqs(mpn, uploadDate, { page })
  },
  {
    key: 'quotes',
    label: 'Past Quotes',
    dateKey: 'quoteDate',
    priceKey: 'unitPrice',
    priceLabel: 'Unit Price',
    emptyText: 'No previous quotes found for this part.',
    fetch: (mpn, uploadDate, page) =>
      apiService.getVendorPreviousQuotes(mpn, uploadDate, { page })
  }
];

const PartHistoryTable = ({ tab, mpn, uploadDate }) => {
  const [state, setState] = useState({
    items: null,
    hits: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    loading: true,
    error: ''
  });

  const load = useCallback(async (page) => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const resp = await tab.fetch(mpn, uploadDate, page);
      const data = resp.data || {};
      setState({
        items: data.items || [],
        hits: data.hits ?? (data.items || []).length,
        page: data.page || page,
        pageSize: data.pageSize || DEFAULT_PAGE_SIZE,
        loading: false,
        error: ''
      });
    } catch (err) {
      if (isNotFound(err)) {
        setState({
          items: [],
          hits: 0,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          loading: false,
          error: ''
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage(err, `Failed to load ${tab.label.toLowerCase()}.`)
        }));
      }
    }
  }, [tab, mpn, uploadDate]);

  useEffect(() => {
    load(1);
  }, [load]);

  if (state.loading && state.items === null) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (state.error) {
    return <Alert variant="warning" className="mb-0">{state.error}</Alert>;
  }

  const items = state.items || [];
  if (items.length === 0) {
    return <p className="text-muted mb-0 py-2">{tab.emptyText}</p>;
  }

  return (
    <>
      <div className="table-responsive">
        <Table bordered hover size="sm" className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Company Type</th>
              <th>Company Country</th>
              <th>MPN</th>
              <th>Manufacturer</th>
              <th className="text-end">{tab.priceLabel}</th>
              <th className="text-end">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={row.rfqNumber || row.quoteNumber || idx}>
                <td>{formatDate(row[tab.dateKey])}</td>
                <td>{textOrDash(row.companyType)}</td>
                <td>{textOrDash(row.country)}</td>
                <td className="fw-semibold">{textOrDash(row.partNumber)}</td>
                <td>{textOrDash(row.manufacturer)}</td>
                <td className="text-end">
                  {formatMoney(row[tab.priceKey], row.currencySymbol || '$')}
                </td>
                <td className="text-end">{formatQty(row.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <Pager
        page={state.page}
        pageSize={state.pageSize}
        hits={state.hits}
        loading={state.loading}
        onPageChange={load}
      />
    </>
  );
};

// Modal shown when a user clicks an excess/consignment line, surfacing prior
// RFQ and quote activity for that part as of the line's created date.
const PartHistoryModal = ({ line, onHide }) => {
  const [activeTab, setActiveTab] = useState(HISTORY_TABS[0].key);

  // Always reopen on the first tab so the modal is not showing a stale
  // selection from the previously inspected line.
  useEffect(() => {
    if (line) setActiveTab(HISTORY_TABS[0].key);
  }, [line]);

  if (!line) return null;

  const mpn = String(line.partNumber || '').trim();
  const uploadDate = toDateParam(line.createdAt);
  const canLookUp = Boolean(mpn && uploadDate);

  return (
    <Modal show onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <div>
          <Modal.Title as="h5" className="mb-0">
            {mpn || 'Part history'}
          </Modal.Title>
          <small className="text-muted">
            {line.manufacturer ? `${line.manufacturer} · ` : ''}
            {uploadDate ? `As of ${uploadDate}` : 'No date on this line'}
          </small>
        </div>
      </Modal.Header>
      <Modal.Body>
        {!canLookUp ? (
          <Alert variant="warning" className="mb-0">
            This line is missing a {mpn ? 'created date' : 'part number'}, so past
            RFQs and quotes cannot be looked up.
          </Alert>
        ) : (
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => setActiveTab(key || HISTORY_TABS[0].key)}
            className="mb-3"
            // Defer each tab's request until it is actually opened, but keep it
            // mounted afterwards so switching back does not refetch.
            mountOnEnter
          >
            {HISTORY_TABS.map((tab) => (
              <Tab key={tab.key} eventKey={tab.key} title={tab.label}>
                <PartHistoryTable tab={tab} mpn={mpn} uploadDate={uploadDate} />
              </Tab>
            ))}
          </Tabs>
        )}
      </Modal.Body>
    </Modal>
  );
};

// Line items for a single excess/consignment document.
const LinesTable = ({ state, showQuoteNumber, onPageChange, onLineClick }) => {
  if (!state || (state.loading && !state.items)) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (state.error) {
    return <Alert variant="warning" className="mb-0">{state.error}</Alert>;
  }

  const items = state.items || [];
  if (items.length === 0) {
    return <div className="text-muted small">No line items.</div>;
  }

  return (
    <>
      <div className="text-muted small mb-2">
        Select a line to view past RFQs and quotes for that part.
      </div>
      <div className="table-responsive">
        <Table bordered hover size="sm" className="mb-0 bg-white">
          <thead>
            <tr>
              <th>Date</th>
              <th>Part Number</th>
              <th>Manufacturer</th>
              <th>Quantity</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {items.map((li, idx) => {
              const symbol = li.currencySymbol || '$';
              return (
                <tr
                  key={li.consignmentLineID || li.vendorQuoteNumber || `${li.partNumber}-${idx}`}
                  onClick={() => onLineClick?.(li)}
                  style={{ cursor: 'pointer' }}
                  title="View past RFQs and quotes for this part"
                >
                  <td>{new Date(li.createdAt).toLocaleDateString()}</td>
                  <td>
                    {/* Keep the search link navigable without also opening the modal. */}
                    <a
                      href={`/search?q=${li.partNumber}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {li.partNumber}
                    </a>
                  </td>
                  <td>{textOrDash(li.manufacturer)}</td>
                  <td className="text-end">{formatQty(li.quantity)}</td>
                  <td className="text-end">{formatMoney(li.price, symbol)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <Pager
        page={state.page || 1}
        pageSize={state.pageSize}
        hits={state.hits}
        loading={state.loading}
        onPageChange={onPageChange}
      />
    </>
  );
};

/**
 * Renders one of the two document sections (Excess or Consignment): a paginated
 * list of documents whose line items are fetched lazily when a row is expanded.
 */
const VendorDocumentSection = ({ vendorId, kind }) => {
  const config = SECTIONS[kind];

  const [list, setList] = useState({ items: [], hits: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  // Line-item state cached per document number so collapsing/re-expanding a row
  // does not re-fetch what we already have.
  const [lines, setLines] = useState({});
  // The line whose past RFQ/quote history is currently open in the modal.
  const [historyLine, setHistoryLine] = useState(null);

  const loadList = useCallback(async (page) => {
    setLoading(true);
    setError('');
    try {
      const resp = await config.fetchList(vendorId, page);
      const data = resp.data || {};
      setList({
        items: data.items || [],
        hits: data.hits ?? (data.items || []).length,
        page: data.page || page,
        pageSize: data.pageSize || DEFAULT_PAGE_SIZE
      });
    } catch (err) {
      if (isNotFound(err)) {
        // No records of this kind for the vendor - render the empty state.
        setList({ items: [], hits: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE });
      } else {
        setError(errorMessage(err, `Failed to load ${config.label.toLowerCase()}.`));
      }
    } finally {
      setLoading(false);
    }
  }, [vendorId, config]);

  useEffect(() => {
    let cancelled = false;
    // Reset section state whenever the vendor changes.
    setExpanded(null);
    setLines({});
    setHistoryLine(null);
    if (!cancelled) loadList(1);
    return () => { cancelled = true; };
  }, [loadList]);

  const loadLines = useCallback(async (number, page) => {
    setLines((prev) => ({
      ...prev,
      [number]: { ...(prev[number] || {}), loading: true, error: '' }
    }));
    try {
      const resp = await config.fetchLines(vendorId, number, page);
      const data = resp.data || {};
      setLines((prev) => ({
        ...prev,
        [number]: {
          items: data.items || [],
          hits: data.hits ?? (data.items || []).length,
          page: data.page || page,
          pageSize: data.pageSize || DEFAULT_PAGE_SIZE,
          loading: false,
          error: ''
        }
      }));
    } catch (err) {
      setLines((prev) => ({
        ...prev,
        [number]: {
          items: isNotFound(err) ? [] : (prev[number]?.items || null),
          hits: 0,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
          loading: false,
          error: isNotFound(err) ? '' : errorMessage(err, 'Failed to load line items.')
        }
      }));
    }
  }, [vendorId, config]);

  const toggleRow = (number) => {
    if (expanded === number) {
      setExpanded(null);
      return;
    }
    setExpanded(number);
    if (!lines[number]) {
      loadLines(number, 1);
    }
  };

  const colSpan = 4;

  return (
    <div className="mb-4">
      <h6 className="text-muted border-bottom pb-2">
        <FontAwesomeIcon icon={config.icon} className="me-2" />
        {config.label}
        {!loading && !error && (
          <Badge bg="secondary" pill className="ms-2">{list.hits}</Badge>
        )}
      </h6>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" />
        </div>
      ) : error ? (
        <Alert variant="warning" className="mb-0">{error}</Alert>
      ) : list.items.length === 0 ? (
        <p className="text-muted mb-0 py-2">{config.emptyText}</p>
      ) : (
        <>
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>{config.numberLabel}</th>
                  <th>{config.nameLabel}</th>
                  <th>Created</th>
                  <th className="text-end">Line Items</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((doc, idx) => {
                  const number = doc[config.numberKey];
                  const isOpen = expanded === number;
                  const lineState = lines[number];
                  return (
                    <React.Fragment key={number || idx}>
                      <tr>
                        <td className="fw-semibold">{textOrDash(number)}</td>
                        <td>{textOrDash(doc[config.nameKey])}</td>
                        <td>{formatDate(doc.createdAt)}</td>
                        <td className="text-end">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => toggleRow(number)}
                            aria-expanded={isOpen}
                          >
                            <FontAwesomeIcon
                              icon={isOpen ? faChevronDown : faChevronRight}
                              className="me-2"
                            />
                            {isOpen ? 'Hide' : 'View'}
                            {lineState?.hits ? ` (${lineState.hits})` : ''}
                          </Button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={colSpan} className="bg-light">
                            <LinesTable
                              state={lineState}
                              showQuoteNumber={config.showQuoteNumber}
                              onPageChange={(nextPage) => loadLines(number, nextPage)}
                              onLineClick={setHistoryLine}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <Pager
            page={list.page}
            pageSize={list.pageSize}
            hits={list.hits}
            loading={loading}
            onPageChange={(nextPage) => {
              setExpanded(null);
              loadList(nextPage);
            }}
          />
        </>
      )}

      <PartHistoryModal line={historyLine} onHide={() => setHistoryLine(null)} />
    </div>
  );
};

// Vendor profile panel (supplier name, type, contact details, address).
const VendorInformation = ({ vendorId }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchVendor = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await apiService.getVendor(vendorId);
        if (!cancelled) setVendor(resp.data || null);
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err, 'Failed to load vendor information.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchVendor();
    return () => { cancelled = true; };
  }, [vendorId]);

  const hasAddress = vendor && (
    vendor.address1 || vendor.address2 || vendor.city ||
    vendor.state || vendor.postalCode || vendor.country
  );

  return (
    <div className="mb-4">
      <h6 className="text-muted border-bottom pb-2">
        <FontAwesomeIcon icon={faBuilding} className="me-2" />
        Vendor Information
      </h6>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" />
        </div>
      ) : error ? (
        <Alert variant="warning" className="mb-0">{error}</Alert>
      ) : !vendor ? (
        <p className="text-muted mb-0 py-2">No vendor information available.</p>
      ) : (
        <Row className="pt-2">
          <Col md={6}>
            <InfoField label="Supplier" value={textOrDash(vendor.supplier)} />
            <InfoField label="Vendor ID" value={textOrDash(vendorId)} />
            <InfoField label="Vendor Type" value={textOrDash(vendor.vendorType)} />
            <InfoField
              label="Phone"
              value={
                vendor.phoneNumber
                  ? (
                    <a href={`tel:${vendor.phoneNumber}`} className="text-decoration-none">
                      <FontAwesomeIcon icon={faPhone} className="me-1" size="sm" />
                      {vendor.phoneNumber}
                    </a>
                  )
                  : DASH
              }
            />
            <InfoField label="Timezone" value={textOrDash(vendor.timezone)} />
          </Col>
          <Col md={6}>
            <div className="mb-2">
              <span className="text-muted small">
                <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                Address:
              </span>
            </div>
            {hasAddress ? (
              <address className="mb-0">
                {vendor.address1 && <>{vendor.address1}<br /></>}
                {vendor.address2 && <>{vendor.address2}<br /></>}
                {[vendor.city, vendor.state].filter(Boolean).join(', ')}
                {vendor.postalCode ? ` ${vendor.postalCode}` : ''}
                {vendor.country && <><br />{vendor.country}</>}
              </address>
            ) : (
              <span className="text-muted">No address on file.</span>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

/**
 * Vendor section of the account page. Only rendered for users that have a
 * vendor_id associated with their account.
 */
const VendorManagement = ({ vendorId }) => {
  if (!vendorId) return null;

  return (
    <Row className="mb-4">
      <Col>
        <Card className="shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Vendor</h5>
          </Card.Header>
          <Card.Body>
            <VendorInformation vendorId={vendorId} />
            <VendorDocumentSection vendorId={vendorId} kind="excess" />
            <VendorDocumentSection vendorId={vendorId} kind="consignment" />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default VendorManagement;
