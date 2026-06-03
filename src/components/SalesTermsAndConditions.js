import React from 'react';
import { Container } from 'react-bootstrap';

const SalesTermsAndConditions = () => {
  return (
    <div className="bg-white min-vh-100 font-sans"><Container className="py-5">
      <h1 className="display-4 fw-bold text-dark mb-4">Terms & Conditions</h1>

      <div>
        <p>
          These Standard Terms and Conditions, along with the terms specified in
          any quotation from Component Search, constitute the complete agreement
          governing any orders or purchases between Component Search and the
          Buyer or Customer.
        </p>

        <h3 className="display-6 fw-bold text-dark mb-4">Buyer Order Terms & Conditions</h3>
        <p>
          The sale of products and services ("Products") by Component Search,
          LLC (hereinafter referred to as "Component Search" or "we") is subject
          to the following terms and conditions ("Agreement"), which prevail
          over any conflicting or additional terms or conditions in any purchase
          order, document, or other communication ("Order"). The terms and
          conditions outlined herein apply regardless of any preprinted terms
          and conditions on any document provided by the customer ("Customer" or
          "Buyer") such as Purchase Orders or Order Confirmations. Component
          Search's failure to object to conflicting or additional terms does not
          modify or supplement the terms of this Agreement.
        </p>

        <h3 className="display-6 fw-bold text-dark mb-4">Orders</h3>
        <p>
          No order will become legally binding upon Component Search until it is
          accepted in writing (including electronic transmissions) by Component
          Search. Any changes to a purchase order must be communicated in
          writing or electronically in a manner acceptable to Component Search.
          Purchase documents provided by the Customer containing standard
          printed terms of purchase/sale will be considered for administrative
          purposes only and will hold no legal validity. All product orders are
          considered non-cancelable and non-returnable ("NCNR"). However, NCNR
          orders may be accepted as a return with restocking fees at the
          discretion of Component Search. All shipments are made under the Ex
          Works incoterms, unless otherwise agreed to in writing by Component
          Search. No accepted orders can be changed, canceled, or rescheduled
          without the written consent of Component Search (including electronic
          transmissions), which will be granted or withheld at the sole
          discretion of Component Search.
        </p>

        <h3 className="display-6 fw-bold text-dark mb-4">Tariffs and Import Duties</h3>

        <p>
          Customers are responsible for all tariffs, duties, and import taxes
          that may apply to their orders with Component Search. This includes
          any fees resulting from the country of origin of the products, as well
          as any trade-related duties imposed under U.S. or international
          regulations.
        </p>

        <p>
          Component Search reserves the right to adjust pricing to reflect any
          applicable tariffs or duties that arise during the processing and
          fulfillment of an order. Any additional charges shall be communicated
          promptly.
        </p>
      </div>
    </Container></div>
  );
};

export default SalesTermsAndConditions;