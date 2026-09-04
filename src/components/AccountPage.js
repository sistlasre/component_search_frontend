import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Tabs, Tab, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { apiService } from '../services/userManagementService';
import { useAuth } from '../context/AuthContext';
import AccountInfoTab from './account/AccountInfoTab';
import RfqsTab from './account/RfqsTab';
import QuotesTab from './account/QuotesTab';
import SalesOrdersTab from './account/SalesOrdersTab';
import InvoicesTab from './account/InvoicesTab';
import ExcessTab from './account/ExcessTab';
import ConsignmentTab from './account/ConsignmentTab';

// vendor_id may arrive as a number or a string; treat blank/whitespace as absent.
const normalizeVendorId = (value) => {
  if (value == null) return '';
  return String(value).trim();
};

// CRM document types, in tab order, mapped to their tab component.
const DOC_TYPES = [
  { key: 'rfqs', label: 'RFQs', Component: RfqsTab },
  { key: 'quotes', label: 'Quotes', Component: QuotesTab },
  { key: 'sales_orders', label: 'Sales Orders', Component: SalesOrdersTab },
  { key: 'invoices', label: 'Invoices', Component: InvoicesTab }
];

const AccountPage = () => {
  const { user } = useAuth();

  // Single source of truth for the full profile record: needed for the
  // Account tab itself, plus email (CRM document lookups) and vendor_id
  // (Excess/Consignment tabs) used elsewhere on this page.
  const [requestingUser, setRequestingUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState('');

  const [documents, setDocuments] = useState({});
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState('');

  const [activeTab, setActiveTab] = useState('account');

  const fetchRequestingUser = async () => {
    try {
      setUserLoading(true);
      setUserError('');
      const response = await apiService.getUser();
      const userData = response.data?.requesting_user || null;
      // Handle stringified JSON from the database
      if (userData && typeof userData.shipping_address === 'string') {
        try {
          userData.shipping_address = JSON.parse(userData.shipping_address);
        } catch (e) {
          console.error('Failed to parse shipping address', e);
          userData.shipping_address = { street: '', city: '', state: '', zip: '' };
        }
      }
      setRequestingUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUserError('Failed to load your account information.');
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setUserLoading(false);
      return;
    }
    fetchRequestingUser();
  }, [user]);

  // Prefer the freshly-fetched profile's email; fall back to the auth
  // context copy while that fetch is still in flight.
  const email = requestingUser?.email || user?.email || '';

  useEffect(() => {
    if (!user || !email) {
      setDocumentsLoading(false);
      return undefined;
    }
    let cancelled = false;
    const fetchDocuments = async () => {
      setDocumentsLoading(true);
      setDocumentsError('');
      try {
        const resp = await apiService.getContactDocuments(email);
        if (!cancelled) {
          setDocuments(resp?.results || {});
        }
      } catch (err) {
        if (!cancelled) {
          setDocumentsError(err.response?.data?.error || err.message || 'Failed to load documents');
        }
      } finally {
        if (!cancelled) setDocumentsLoading(false);
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
        <h3 className="mb-3">Sign in to view your account</h3>
        <Button as={Link} to="/login" variant="primary">Log In</Button>
      </Container>
    );
  }

  const vendorId = normalizeVendorId(requestingUser?.vendor_id);
  const noEmailOnFile = !userLoading && !email;

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ fontWeight: 400 }}>My Account</h2>

      {userError && <Alert variant="danger">{userError}</Alert>}

      <Tabs
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key || 'account')}
        className="mb-3"
        mountOnEnter
      >
        <Tab key="account" eventKey="account" title="Account">
          {userLoading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <AccountInfoTab
              requestingUser={requestingUser}
              onSaved={(changes) => setRequestingUser((prev) => ({ ...prev, ...changes }))}
            />
          )}
        </Tab>

        {DOC_TYPES.map(({ key, label, Component }) => {
          const typeResult = documents[key] || {};
          const items = typeResult.items || [];
          const totalCount = typeResult.hits ?? items.length;
          return (
            <Tab
              key={key}
              eventKey={key}
              title={
                <span>
                  {label}{' '}
                  <Badge bg="secondary" pill>{totalCount}</Badge>
                </span>
              }
            >
              {documentsLoading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : noEmailOnFile ? (
                <Alert variant="info" className="mb-0">
                  Your account does not have an email address associated with it, so we
                  can't look up your {label.toLowerCase()}. Add one from the Account tab.
                </Alert>
              ) : (
                <Component items={items} error={documentsError} />
              )}
            </Tab>
          );
        })}

        <Tab key="excess" eventKey="excess" title="Excess">
          {userLoading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <ExcessTab vendorId={vendorId} />
          )}
        </Tab>

        <Tab key="consignment" eventKey="consignment" title="Consignment">
          {userLoading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <ConsignmentTab vendorId={vendorId} />
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AccountPage;
