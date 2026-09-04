import React from 'react';
import { Alert } from 'react-bootstrap';
import { VendorDocumentSection } from '../VendorManagement';

const ExcessTab = ({ vendorId }) => {
  if (!vendorId) {
    return (
      <Alert variant="info" className="mb-0">
        No vendor account associated with your account.
      </Alert>
    );
  }

  return <VendorDocumentSection vendorId={vendorId} kind="excess" />;
};

export default ExcessTab;
