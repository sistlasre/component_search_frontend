import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { apiService } from '../services/userManagementService';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = {
  open: { label: 'Open', variant: 'primary' },
  work_in_progress: { label: 'Work in Progress', variant: 'warning' },
  complete: { label: 'Complete', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

const TYPE_LABELS = {
  order: { label: 'Order', variant: 'info' },
  request: { label: 'Request', variant: 'dark' },
};

const formatDate = (epochSec) => {
  if (!epochSec) return '';
  return new Date(epochSec * 1000).toLocaleString();
};

const MyOrders = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | order | request
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const handleViewPurchaseOrder = async (recordId) => {
    try {
      const resp = await apiService.getPurchaseOrderDownloadUrl(recordId);
      const url = resp.data?.presigned_url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      // Surface the error inline so users know why nothing opened.
      setError(err.response?.data?.error || err.message || 'Failed to open purchase order');
    }
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await apiService.getMyOrders({ sort: 'desc', limit: 100 });
        if (!cancelled) setRecords(resp.data?.records || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || err.message || 'Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRecords();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (typeFilter !== 'all' && r.record_type !== typeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [records, typeFilter, statusFilter]);

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h3 className="mb-3">Sign in to view your orders</h3>
        <Button as={Link} to="/login" variant="primary">Log In</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ fontWeight: 400 }}>My Orders &amp; Requests</h2>

      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Label className="small text-muted mb-1">Type</Form.Label>
              <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="order">Orders</option>
                <option value="request">Requests</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="small text-muted mb-1">Status</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} className="text-md-end">
              <small className="text-muted">{filtered.length} record{filtered.length === 1 ? '' : 's'}</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : filtered.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <p className="text-muted mb-3">No orders or requests yet.</p>
            <Button as={Link} to="/" variant="primary">Continue Shopping</Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm border-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Status</th>
                <th>Items</th>
                <th>Submitted</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const status = STATUS_LABELS[r.status] || { label: r.status, variant: 'secondary' };
                const typ = TYPE_LABELS[r.record_type] || { label: r.record_type, variant: 'secondary' };
                const isOpen = expandedId === r.record_id;
                return (
                  <React.Fragment key={r.record_id}>
                    <tr>
                      <td><code>{r.record_id}</code></td>
                      <td><Badge bg={typ.variant}>{typ.label}</Badge></td>
                      <td><Badge bg={status.variant}>{status.label}</Badge></td>
                      <td>{(r.items || []).length}</td>
                      <td>{formatDate(r.created_at)}</td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => setExpandedId(isOpen ? null : r.record_id)}
                        >
                          {isOpen ? 'Hide' : 'View'}
                        </Button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="bg-light">
                          {r.public_note && (
                            <Alert variant="info" className="mb-3">
                              <strong>Note from our team:</strong>
                              <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{r.public_note}</div>
                            </Alert>
                          )}
                          {r.notes && (
                            <div className="mb-3">
                              <strong>Your notes:</strong>
                              <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{r.notes}</div>
                            </div>
                          )}
                          {r.purchase_order?.key && (
                            <div className="mb-3">
                              <strong>Purchase Order:</strong>{' '}
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleViewPurchaseOrder(r.record_id)}
                              >
                                View Purchase Order
                              </Button>
                              {r.purchase_order.filename && (
                                <span className="text-muted ms-2 small">({r.purchase_order.filename})</span>
                              )}
                            </div>
                          )}
                          <Table bordered size="sm" className="mb-0">
                            <thead>
                              <tr>
                                <th>Part Number</th>
                                <th>Manufacturer</th>
                                <th className="text-end">Qty</th>
                                <th className="text-end">Unit Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(r.items || []).map((it, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <Link to={`/part/${encodeURIComponent(it.part_number)}`}>{it.part_number}</Link>
                                  </td>
                                  <td>{it.manufacturer}</td>
                                  <td className="text-end">{Number(it.quantity).toLocaleString()}</td>
                                  <td className="text-end">{it.unit_price != null ? `$${Number(it.unit_price).toFixed(2)}` : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
};

export default MyOrders;
