import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
  Table,
} from 'react-bootstrap';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { apiService } from '../services/userManagementService';

// Column mappings we ask the user to confirm. `mpn` is required; the
// backend validates this as well but we also enforce it client-side so we
// can surface a helpful error message before the PUT attempt.
const MAPPING_OPTIONS = [
  { value: 'mpn', label: 'Part Number (MPN)' },
  { value: 'mfr', label: 'Manufacturer' },
  { value: 'quantity', label: 'Quantity' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_STATE = {
  email: '',
  companyName: '',
  file: null,
  preview: null, // { headers: string[], rows: object[] }
  mappings: {}, // columnHeader -> 'mpn' | 'mfr' | 'quantity'
};

// Reusable file parser for CSV/XLSX; returns { headers, rows } (first 5 rows).
const parseFilePreview = (file) => new Promise((resolve, reject) => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('The file appears to be empty.'));
          return;
        }
        const headers = Object.keys(results.data[0]);
        resolve({ headers, rows: results.data.slice(0, 5) });
      },
      error: (err) => reject(new Error(`Error parsing CSV: ${err.message}`)),
    });
    return;
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (!json.length) {
          reject(new Error('The file appears to be empty.'));
          return;
        }
        const headers = json[0].map((h) => String(h));
        const rows = json.slice(1, 6).map((row) => {
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = row[i] ?? '';
          });
          return obj;
        });
        resolve({ headers, rows });
      } catch (err) {
        reject(new Error(`Error parsing Excel file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the selected file.'));
    reader.readAsArrayBuffer(file);
    return;
  }
  reject(new Error('Please select a CSV (.csv) or Excel (.xlsx) file.'));
});

/**
 * Reusable Upload Inventory modal.
 *
 * Props:
 *  - show: boolean — visibility
 *  - onHide: () => void — called when the modal should close
 *  - source?: string — free-form label identifying where the modal was opened
 *    from (kept for parity with ContactUsModal; not currently sent to the
 *    backend but handy for future analytics)
 */
const UploadInventoryModal = ({ show, onHide, source = '' }) => {
  const [state, setState] = useState(INITIAL_STATE);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset whenever the modal opens so stale selections from a previous
  // invocation don't bleed into the new one.
  useEffect(() => {
    if (show) {
      setState(INITIAL_STATE);
      setError('');
      setSuccess(false);
      setUploading(false);
    }
  }, [show]);

  const handleChange = (field) => (e) => {
    setState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      setError('Please select a CSV (.csv) or Excel (.xlsx) file.');
      setState((prev) => ({ ...prev, file: null, preview: null, mappings: {} }));
      return;
    }
    setError('');
    setState((prev) => ({ ...prev, file, preview: null, mappings: {} }));
    try {
      const preview = await parseFilePreview(file);
      setState((prev) => ({ ...prev, preview }));
    } catch (err) {
      setError(err.message);
      setState((prev) => ({ ...prev, preview: null }));
    }
  };

  // Each mapping type can only be assigned to one column. Picking a
  // mapping for a new column steals it from whichever column used to have it.
  const handleMappingChange = (columnName, mappingType) => {
    setState((prev) => {
      const next = { ...prev.mappings };
      Object.keys(next).forEach((key) => {
        if (next[key] === mappingType) {
          delete next[key];
        }
      });
      if (mappingType && mappingType !== 'none') {
        next[columnName] = mappingType;
      } else {
        delete next[columnName];
      }
      return { ...prev, mappings: next };
    });
  };

  const validateForm = () => {
    if (!state.email.trim()) return 'Email address is required.';
    if (!EMAIL_REGEX.test(state.email.trim())) return 'Please enter a valid email address.';
    if (!state.companyName.trim()) return 'Company name is required.';
    if (!state.file) return 'Please select a file to upload.';
    if (!state.preview) return 'Waiting for file preview — please reselect the file.';
    if (!Object.values(state.mappings).includes('mpn')) {
      return 'Part Number (MPN) column mapping is required.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError('');
    try {
      const mpnField = Object.entries(state.mappings).find(([, v]) => v === 'mpn')?.[0] || '';
      const mfrField = Object.entries(state.mappings).find(([, v]) => v === 'mfr')?.[0] || '';
      const quantityField = Object.entries(state.mappings).find(([, v]) => v === 'quantity')?.[0] || '';

      const name = state.file.name.toLowerCase();
      const fileExtension = name.endsWith('.xlsx') || name.endsWith('.xls') ? 'xlsx' : 'csv';
      const contentType = fileExtension === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';

      const { data } = await apiService.getUserInventoryUploadUrl({
        email_address: state.email.trim(),
        company_name: state.companyName.trim(),
        mpn_field: mpnField,
        mfr_field: mfrField,
        quantity_field: quantityField,
        file_extension: fileExtension,
        content_type: contentType,
        source: source || '',
      });

      if (!data?.presigned_url) {
        throw new Error('Backend did not return a presigned URL');
      }

      // PUT directly to S3. Using bare axios here (not apiService.api) so we
      // don't pollute the S3 request with our API-specific headers.
      await axios.put(data.presigned_url, state.file, {
        headers: { 'Content-Type': contentType },
      });

      setSuccess(true);
    } catch (err) {
      console.error('Inventory upload error:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Something went wrong uploading your inventory. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop={uploading ? 'static' : true}>
      <Modal.Header closeButton={!uploading}>
        <Modal.Title className="fw-bold">Upload Your Inventory</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {success ? (
          <Alert variant="success" className="mb-0">
            <h5 className="fw-bold">Thanks — your inventory is uploaded.</h5>
            <p className="mb-0">
              We&apos;ll reach out to{' '}
              <strong>{state.email || 'the email you provided'}</strong> once our team has
              reviewed the file.
            </p>
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <p className="text-muted mb-3">
              Submit a CSV or Excel file containing your inventory. You&apos;ll map
              the <strong>Part Number</strong>, <strong>Manufacturer</strong>,
              and <strong>Quantity</strong> columns below so we know what to look at.
            </p>

            <Row className="g-3 mb-2">
              <Col md={6}>
                <Form.Group controlId="inventoryEmail">
                  <Form.Label>Email<span className="text-danger"> *</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={state.email}
                    onChange={handleChange('email')}
                    disabled={uploading}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="inventoryCompany">
                  <Form.Label>Company Name<span className="text-danger"> *</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={state.companyName}
                    onChange={handleChange('companyName')}
                    disabled={uploading}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2" controlId="inventoryFile">
              <Form.Label>Inventory File<span className="text-danger"> *</span></Form.Label>
              <Form.Control
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {state.file && (
                <Form.Text className="text-success d-block mt-1">
                  Selected: {state.file.name} ({(state.file.size / 1024).toFixed(1)} KB)
                </Form.Text>
              )}
              <Form.Text className="text-muted">
                Accepted formats: CSV (.csv) and Excel (.xlsx). The first row must be
                column headers.
              </Form.Text>
            </Form.Group>

            {state.preview && (
              <div className="mb-3">
                <h6 className="fw-semibold mb-2">File Preview &amp; Column Mapping</h6>
                <p className="text-muted small mb-2">
                  For each column you want us to use, pick what it represents below.
                  Part Number is required; Manufacturer and Quantity are optional but
                  helpful.
                </p>
                <div className="table-responsive border rounded">
                  <Table striped hover size="sm" className="mb-0">
                    <thead>
                      <tr>
                        {state.preview.headers.map((header) => (
                          <th key={header} className="align-top" style={{ minWidth: '160px' }}>
                            <Form.Select
                              size="sm"
                              className="mb-2"
                              value={state.mappings[header] || 'none'}
                              onChange={(e) => handleMappingChange(header, e.target.value)}
                              disabled={uploading}
                            >
                              <option value="none">-- Skip --</option>
                              {MAPPING_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Form.Select>
                            <div className="fw-normal text-muted small">{header}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {state.preview.rows.map((row, idx) => (
                        <tr key={idx}>
                          {state.preview.headers.map((header) => (
                            <td key={header} className="small">
                              {row[header] === undefined || row[header] === ''
                                ? <span className="text-muted">-</span>
                                : String(row[header])}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {state.preview.rows.length === 0 && (
                        <tr>
                          <td colSpan={state.preview.headers.length} className="text-center text-muted">
                            No data rows found in the file
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                {Object.keys(state.mappings).length > 0 && (
                  <div className="mt-2 small text-muted">
                    <strong>Current mappings:</strong>{' '}
                    {Object.entries(state.mappings).map(([col, type], i) => {
                      const label = MAPPING_OPTIONS.find((o) => o.value === type)?.label || type;
                      return (
                        <span key={col}>
                          {i > 0 && ', '}
                          <span className="text-primary">{col}</span> → {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        {success ? (
          <Button variant="primary" onClick={onHide}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline-secondary" onClick={onHide} disabled={uploading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={uploading}>
              {uploading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Uploading…
                </>
              ) : (
                'Upload Inventory'
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default UploadInventoryModal;
