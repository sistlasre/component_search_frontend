import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  Badge,
  Toast,
  ToastContainer,
  Form,
  InputGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser, faCheck, faTimes, faPencil} from '@fortawesome/free-solid-svg-icons';
import { apiService } from '../services/userManagementService';

const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/gi, "");

const AccountManagement = () => {
  const [requestingUser, setRequestingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Requesting user editing state
  const [editingRequestingUser, setEditingRequestingUser] = useState(false);
  const [requestingUserEditData, setRequestingUserEditData] = useState({});
  const [savingRequestingUser, setSavingRequestingUser] = useState(false);

  // Refs for inline editing inputs
  const passwordInputRefs = useRef({});

  const USER_STATUS_MAPPINGS = {
    'active': { badge_type: 'success', label: 'Active' },
    'inactive': { badge_type: 'danger', label: 'Inactive' },
    'pending': { badge_type: 'warning', label: 'Pending' },
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getUser();
      setRequestingUser(response.data?.requesting_user || null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load user information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Requesting user functions
  const startEditingRequestingUser = () => {
    setRequestingUserEditData({
      password: '',
      email: requestingUser?.email || '',
      originalEmail: requestingUser?.email || '',
      firstName: requestingUser?.first_name || '',
      originalFirstName: requestingUser?.first_name || '',
      lastName: requestingUser?.last_name || '',
      originalLastName: requestingUser?.last_name || '',
      pricingPlan: requestingUser?.pricing_plan || 'free',
      originalPricingPlan: requestingUser?.pricing_plan || 'free'
    });
    setEditingRequestingUser(true);
  };

  const cancelEditingRequestingUser = () => {
    setEditingRequestingUser(false);
    setRequestingUserEditData({});
  };

  const saveRequestingUserChanges = async () => {
    // Track credits for local update only
    let creditsForLocalUpdate = null;

    try {
      const payload = {};
      if (requestingUserEditData.password?.trim()) {
        payload.new_password = requestingUserEditData.password.trim();
      }
      if (requestingUserEditData.email !== requestingUserEditData.originalEmail) {
        payload.new_email = requestingUserEditData.email.trim();
      }
      if (requestingUserEditData.firstName !== requestingUserEditData.originalFirstName) {
        payload.new_first_name = requestingUserEditData.firstName.trim();
      }
      if (requestingUserEditData.lastName !== requestingUserEditData.originalLastName) {
        payload.new_last_name = requestingUserEditData.lastName.trim();
      }

      if (Object.keys(payload).length === 0) {
        cancelEditingRequestingUser();
        return;
      }

      setSavingRequestingUser(true);
      await apiService.updateUser(requestingUser.user_id, payload);

      // Update local state
      setRequestingUser(prev => ({
        ...prev,
        ...(payload.new_email ? { email: payload.new_email } : {}),
        ...(payload.new_first_name ? { first_name: payload.new_first_name } : {}),
        ...(payload.new_last_name ? { last_name: payload.new_last_name } : {}),
        ...(payload.new_pricing_plan ? { pricing_plan: payload.new_pricing_plan } : {}),
        ...(creditsForLocalUpdate !== null ? { num_part_credits: creditsForLocalUpdate } : {})
      }));

      setToastMessage('Your account updated successfully.');
      setShowToast(true);
      cancelEditingRequestingUser();
    } catch (err) {
      console.error('Failed to update requesting user:', err);
      setToastMessage('Failed to update your account. Please try again.');
      setShowToast(true);
    } finally {
      setSavingRequestingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Container fluid className="py-3">
      {/* Requesting User Section */}
      {requestingUser && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Account Information</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Your Account Details
                  </h6>
                  {!editingRequestingUser ? (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={startEditingRequestingUser}
                    >
                      <FontAwesomeIcon icon={faPencil} className="me-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={saveRequestingUserChanges}
                        disabled={savingRequestingUser}
                      >
                        {savingRequestingUser ? (
                          <Spinner as="span" animation="border" size="sm" />
                        ) : (
                          <><FontAwesomeIcon icon={faCheck} className="me-1" /> Save</>
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelEditingRequestingUser}
                        disabled={savingRequestingUser}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-1" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Username:</strong> <span className="ms-2">{requestingUser.username}</span>
                    </div>
                    <div className="mb-3">
                      <strong>Name:</strong>
                      {editingRequestingUser ? (
                        <div className="d-inline-flex gap-2 ms-2">
                          <Form.Control
                            type="text"
                            placeholder="First name"
                            value={requestingUserEditData.firstName || ''}
                            onChange={(e) => setRequestingUserEditData(prev => ({...prev, firstName: e.target.value}))}
                            disabled={savingRequestingUser}
                            style={{ width: '140px' }}
                          />
                          <Form.Control
                            type="text"
                            placeholder="Last name"
                            value={requestingUserEditData.lastName || ''}
                            onChange={(e) => setRequestingUserEditData(prev => ({...prev, lastName: e.target.value}))}
                            disabled={savingRequestingUser}
                            style={{ width: '140px' }}
                          />
                        </div>
                      ) : (
                        <span className="ms-2">
                          {requestingUser.first_name || requestingUser.last_name
                            ? `${requestingUser.first_name || ''} ${requestingUser.last_name || ''}`.trim()
                            : 'Not provided'}
                        </span>
                      )}
                    </div>
                    {requestingUser.share_id && (
                        <div className="mb-3">
                          <strong>Affiliate Link:</strong>
                          <Button
                            variant="link"
                            className="p-0 ms-1"
                            onClick={() => onCopyAffiliateUrl(requestingUser.share_id)}
                          >
                            Share Affiliate URL
                          </Button>
                        </div>
                    )}
                    {requestingUser.affiliate_username && (
                      <div className="mb-3">
                        <strong>Referrer User:</strong> <span className="ms-2">{requestingUser.affiliate_username}</span>
                      </div>
                    )}
                    <div className="mb-3">
                      <strong>Email:</strong>
                      {editingRequestingUser ? (
                        <Form.Control
                          type="email"
                          placeholder="Email address"
                          value={requestingUserEditData.email || ''}
                          onChange={(e) => setRequestingUserEditData(prev => ({...prev, email: e.target.value}))}
                          disabled={savingRequestingUser}
                          className="ms-2 d-inline-block"
                          style={{ width: 'auto', maxWidth: '300px' }}
                        />
                      ) : (
                        <span className="ms-2">{requestingUser.email || 'Not provided'}</span>
                      )}
                    </div>
                    <div className="mb-3">
                      <strong>Password:</strong>
                      {editingRequestingUser ? (
                        <Form.Control
                          type="password"
                          autoComplete="off"
                          placeholder="New password (leave blank to keep current)"
                          value={requestingUserEditData.password || ''}
                          onChange={(e) => setRequestingUserEditData(prev => ({...prev, password: e.target.value}))}
                          disabled={savingRequestingUser}
                          className="ms-2 d-inline-block"
                          style={{ width: 'auto', maxWidth: '300px' }}
                        />
                      ) : (
                        <span className="ms-2 text-muted">••••••••</span>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Toast */}
      <ToastContainer className="p-3" position="top-end">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          bg={toastMessage?.toLowerCase()?.includes('successfully') ? "success" : "danger"}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastMessage?.toLowerCase()?.includes('successfully') ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default AccountManagement;
