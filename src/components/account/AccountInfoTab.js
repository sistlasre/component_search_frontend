import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Form,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCheck, faTimes, faPencil, faTruck } from '@fortawesome/free-solid-svg-icons';
import { apiService } from '../../services/userManagementService';

/**
 * Account Information card: view/edit for username, name, email, password,
 * and shipping address. `requestingUser` is owned by the parent AccountPage
 * (it's also needed there for email + vendorId), so saves are reported back
 * via `onSaved` rather than this component re-fetching on its own.
 */
const AccountInfoTab = ({ requestingUser, onSaved }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [editingRequestingUser, setEditingRequestingUser] = useState(false);
  const [requestingUserEditData, setRequestingUserEditData] = useState({});
  const [savingRequestingUser, setSavingRequestingUser] = useState(false);

  const startEditingRequestingUser = () => {
    setRequestingUserEditData({
      password: '',
      email: requestingUser?.email || '',
      originalEmail: requestingUser?.email || '',
      firstName: requestingUser?.first_name || '',
      originalFirstName: requestingUser?.first_name || '',
      lastName: requestingUser?.last_name || '',
      originalLastName: requestingUser?.last_name || '',
      // Initialize shipping address from existing data or empty fields
      shippingAddress: requestingUser?.shipping_address || {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      originalShippingAddress: JSON.stringify(requestingUser?.shipping_address || {})
    });
    setEditingRequestingUser(true);
  };

  const cancelEditingRequestingUser = () => {
    setEditingRequestingUser(false);
    setRequestingUserEditData({});
  };

  const saveRequestingUserChanges = async () => {
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

      // Check if shipping address has changed
      const currentAddressJson = JSON.stringify(requestingUserEditData.shippingAddress);
      if (currentAddressJson !== requestingUserEditData.originalShippingAddress) {
        // Send the address as a JSON string per your requirement
        payload.new_shipping_address = currentAddressJson;
      }

      if (Object.keys(payload).length === 0) {
        cancelEditingRequestingUser();
        return;
      }

      setSavingRequestingUser(true);
      await apiService.updateUser(requestingUser.user_id, payload);

      // Report the change back up so AccountPage's copy of requestingUser
      // (used for email + vendorId elsewhere on the page) stays in sync.
      onSaved({
        ...(payload.new_email ? { email: payload.new_email } : {}),
        ...(payload.new_first_name ? { first_name: payload.new_first_name } : {}),
        ...(payload.new_last_name ? { last_name: payload.new_last_name } : {}),
        // payload.new_shipping_address is currently a string, so parse it for the UI
        ...(payload.new_shipping_address ? { shipping_address: JSON.parse(payload.new_shipping_address) } : {})
      });

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

  if (!requestingUser) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <p className="text-muted mb-0">Unable to load your account information.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Account Information</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="mb-0">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Your Account Details
            </h6>
            {!editingRequestingUser ? (
              <Button variant="outline-primary" size="sm" onClick={startEditingRequestingUser}>
                <FontAwesomeIcon icon={faPencil} className="me-2" /> Edit
              </Button>
            ) : (
              <div className="d-flex gap-2">
                <Button variant="success" size="sm" onClick={saveRequestingUserChanges} disabled={savingRequestingUser}>
                  {savingRequestingUser ? <Spinner as="span" animation="border" size="sm" /> : <><FontAwesomeIcon icon={faCheck} className="me-1" /> Save</>}
                </Button>
                <Button variant="secondary" size="sm" onClick={cancelEditingRequestingUser} disabled={savingRequestingUser}>
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
                      style={{ width: '140px' }}
                    />
                    <Form.Control
                      type="text"
                      placeholder="Last name"
                      value={requestingUserEditData.lastName || ''}
                      onChange={(e) => setRequestingUserEditData(prev => ({...prev, lastName: e.target.value}))}
                      style={{ width: '140px' }}
                    />
                  </div>
                ) : (
                  <span className="ms-2">
                    {`${requestingUser.first_name || ''} ${requestingUser.last_name || ''}`.trim() || 'Not provided'}
                  </span>
                )}
              </div>

              <div className="mb-3">
                <strong>Email:</strong>
                {editingRequestingUser ? (
                  <Form.Control
                    type="email"
                    value={requestingUserEditData.email || ''}
                    onChange={(e) => setRequestingUserEditData(prev => ({...prev, email: e.target.value}))}
                    className="ms-2 d-inline-block"
                    style={{ width: 'auto', minWidth: '250px' }}
                  />
                ) : (
                  <span className="ms-2">{requestingUser.email || <span className="text-muted">Not provided</span>}</span>
                )}
              </div>

              <div className="mb-3">
                <strong>Password:</strong>
                {editingRequestingUser ? (
                  <Form.Control
                    type="password"
                    placeholder="New password (leave blank)"
                    value={requestingUserEditData.password || ''}
                    onChange={(e) => setRequestingUserEditData(prev => ({...prev, password: e.target.value}))}
                    className="ms-2 d-inline-block"
                    style={{ width: 'auto', minWidth: '250px' }}
                  />
                ) : (
                  <span className="ms-2 text-muted">••••••••</span>
                )}
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <h6 className="text-muted border-bottom pb-2">
                  <FontAwesomeIcon icon={faTruck} className="me-2" />
                  Shipping Address
                </h6>
                {editingRequestingUser ? (
                  <div className="mt-2 p-3 border rounded bg-light">
                    <Form.Group className="mb-2">
                      <Form.Label className="small mb-1">Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={requestingUserEditData.shippingAddress?.street || ''}
                        onChange={(e) => setRequestingUserEditData(prev => ({
                          ...prev,
                          shippingAddress: { ...prev.shippingAddress, street: e.target.value }
                        }))}
                      />
                    </Form.Group>
                    <Row>
                      <Col sm={6}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small mb-1">City</Form.Label>
                          <Form.Control
                            type="text"
                            value={requestingUserEditData.shippingAddress?.city || ''}
                            onChange={(e) => setRequestingUserEditData(prev => ({
                              ...prev,
                              shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                            }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small mb-1">State</Form.Label>
                          <Form.Control
                            type="text"
                            value={requestingUserEditData.shippingAddress?.state || ''}
                            onChange={(e) => setRequestingUserEditData(prev => ({
                              ...prev,
                              shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                            }))}
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small mb-1">Zip</Form.Label>
                          <Form.Control
                            type="text"
                            value={requestingUserEditData.shippingAddress?.zip || ''}
                            onChange={(e) => setRequestingUserEditData(prev => ({
                              ...prev,
                              shippingAddress: { ...prev.shippingAddress, zip: e.target.value }
                            }))}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div className="p-2">
                    {requestingUser.shipping_address?.street ? (
                      <address className="mb-0">
                        {requestingUser.shipping_address.street}<br />
                        {requestingUser.shipping_address.city}, {requestingUser.shipping_address.state} {requestingUser.shipping_address.zip}
                      </address>
                    ) : (
                      <span className="text-muted italic">No shipping address provided.</span>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <ToastContainer className="p-3" position="top-end">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          bg={toastMessage?.toLowerCase()?.includes('successfully') ? "success" : "danger"}
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default AccountInfoTab;
