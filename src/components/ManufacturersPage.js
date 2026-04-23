import React, { useEffect, useState } from 'react';
import { Container, Row, Col, ListGroup, Spinner, Badge } from 'react-bootstrap';
import { fetchManufacturers } from '../services/api';

const ManufacturersPage = () => {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchManufacturers(300);
        const grouped = data.reduce((acc, item) => {
          const char = item.manufacturer.charAt(0).toUpperCase();
          const key = /[A-Z]/.test(char) ? char : '#';
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
        setGroups(grouped);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="grow" variant="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white min-vh-100 font-sans">
      <Container className="py-4">

        {/* Modern Header Section */}
        <div className="mb-2 border-bottom pb-2">
          <h1 className="display-5 fw-bold text-dark mb-3">Manufacturers</h1>
        </div>

        {/* The Grid Layout */}
        <Row className="g-4">
          {Object.keys(groups).sort().map(letter => (
            <Col xs={12} md={6} lg={4} xl={3} key={letter} className="mb-4">

              {/* Section Letter Heading */}
              <div className="d-flex align-items-center mb-3">
                <span className="display-6 fw-bold text-primary me-3">{letter}</span>
                <div className="flex-grow-1 bg-light" style={{ height: '2px' }}></div>
              </div>

              {/* Minimalist List */}
              <ListGroup variant="flush" className="custom-list-group">
                {groups[letter]
                  .sort((a, b) => a.manufacturer.localeCompare(b.manufacturer))
                  .map(mfr => (
                    <ListGroup.Item
                      key={mfr.manufacturer}
                      action
                      href={`/search?manufacturer=${encodeURIComponent(mfr.manufacturer)}`}
                      className="px-2 py-2 border-0 d-flex justify-content-between align-items-center rounded-2 transition-all manufacturer-item"
                    >
                      <span className="fw-medium text-dark">{mfr.manufacturer}</span>
                      <Badge bg="light" text="muted" className="fw-normal border small">
                        {mfr.count}
                      </Badge>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Styles to remove the "clunky" feel */}
      <style>{`
        .font-sans {
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
        }

        /* Remove the thick borders and padding from Bootstrap's default ListGroup */
        .custom-list-group .list-group-item {
          background-color: transparent;
          font-size: 0.95rem;
          margin-bottom: 2px;
        }

        /* Subtle hover effect that doesn't feel heavy */
        .manufacturer-item:hover {
          background-color: #f8f9fa !important;
          color: #0d6efd !important;
          padding-left: 12px !important; /* Gentle slide effect */
        }

        .manufacturer-item:hover span {
          color: #0d6efd !important;
        }

        .transition-all {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .text-muted { color: #6c757d !important; }

        /* Make the letter "stuck" to the top of its column if scrolling is long */
        @media (min-width: 992px) {
          .display-6 {
            position: sticky;
            top: 20px;
            z-index: 10;
            background: white;
          }
        }
      `}</style>
    </div>
  );
};

export default ManufacturersPage;