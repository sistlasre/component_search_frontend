import React from 'react';
import { Container } from 'react-bootstrap';

const PurchaseOrderTermsAndConditions = () => {
  return (
    <div className="bg-white min-vh-100 font-sans"><Container className="py-5">
      <h1 className="fw-bold text-dark mb-4 text-center">Component Search Purchase Order Terms and Conditions</h1>
      <div>
        <ol>
          {/* 1 */}
          <li className="mb-3">
            Component Search reserves the right of final approval of product, procedures, processes and equipment.
          </li>

          {/* 2 */}
          <li className="mb-3">
            All special processes required by this PO must be performed by qualified personnel.
          </li>

          {/* 3 */}
          <li className="mb-3">
            Component Search reserves the right to review and approve the Vendor’s Quality Management System, if applicable. Standard QMS Requirements which may Include:
            <ol type="a" className="mt-2 ps-4">
              <li className="mb-2">
                Vendors providing special processing must maintain a system for validating processes.
              </li>
              <li className="mb-2">
                Customer Directed sources must operate in accordance with approved specifications and standards as dictated and controlled by the customer in question.
              </li>
              <li className="mb-2">
                Vendors registered / certified to (ISO9001, AS9100, AS9120, etc.) must notify Component Search of any changes to that certification.
              </li>
            </ol>
          </li>

          {/* 4 */}
          <li className="mb-3">
            If specified in the PO, the Vendor shall maintain the proper identification and revision status of specifications, drawings, process requirements, inspection/verification instructions and other relevant technical data. Unless noted otherwise on the face of this order, the latest revision level is to be used.
          </li>

          {/* 5 */}
          <li className="mb-3">
            Component Search reserves the right to flow down and approve any tests, inspection plans, verifications, use of statistical techniques for product acceptance, and any applicable critical items including key characteristics.
          </li>

          {/* 6 */}
          <li className="mb-3">
            Component Search reserves the right to designate requirements for inspection/verification, investigation or auditing.
          </li>

          {/* 7 */}
          <li className="mb-3">
            The Vendor is required to:
            <ol type="a" className="mt-2 ps-4">
              <li className="mb-2">
                Implement and maintain processes that ensures delivery of conforming product.
              </li>
              <li className="mb-2">
                Notify Component Search of nonconforming product.
              </li>
              <li className="mb-2">
                Obtain Component Search approval for nonconforming product disposition.
              </li>
              <li className="mb-2">
                Prevent use of suspected counterfeit parts and/or suspected unapproved parts.
              </li>
              <li className="mb-2">
                Notify Component Search of changes in product and/or process, changes of sub-tier Vendors, and changes of manufacturing and/or repair/overhaul facility locations.
              </li>
              <li className="mb-2">
                Flow down to external providers all applicable requirements, including customer requirements.
              </li>
              <li className="mb-2">
                Ensure their personnel are aware of the contribution to product conformity, product safety, and the importance of ethical behavior.
              </li>
              <li className="mb-2">
                The Vendor is required to retain all Records associated with the Purchase Order for a period of no less than 5 years, unless otherwise specified.
              </li>
            </ol>
          </li>

          {/* 8 */}
          <li className="mb-3">
            All Vendors are subject to monitoring for On Time Delivery and Quality Performance.
          </li>

          {/* 9 */}
          <li className="mb-3">
            Right of access by Component Search, our customer and regulatory authorities to the applicable areas of all facilities, at any level of the supply chain, involved in the order and to all applicable records.
          </li>

          {/* 10 */}
          <li className="mb-3">
            All Vendors providing Calibration Services must:
            <ol type="a" className="mt-2 ps-4">
              <li className="mb-2">
                Maintain Certification to ISO17025, ISO10012-1, ANSI Z540-1 (or equivalent) or be otherwise approved by Component Search.
              </li>
              <li className="mb-2">
                Provide reporting of “As Found” and “As Left” status if the item is found to be out of tolerance.
              </li>
              <li className="mb-2">
                Identify Calibration Standards used.
              </li>
              <li className="mb-2">
                Utilize Calibration Standards traceable to NIST.
              </li>
            </ol>
          </li>
        </ol>
      </div>
      <div className="pt-4">
        <h2>Tariffs and Import Duties</h2>
        <p>
        The Country of Origin (COO) and Harmonized Tariff Schedule of the United States (HTSUS) classification information
        must be provided prior to shipment. Failure to provide this information in advance may result in additional tariff
        charges, duties, or other trade-related costs. In such cases, the Supplier agrees to compensate Component Search for
        any costs incurred due to the Supplier's failure to declare this information before the issuance of this purchase order.
        </p>
      </div>
    </Container></div>
  );
};

export default PurchaseOrderTermsAndConditions;