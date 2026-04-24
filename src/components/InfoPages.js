import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Tab, Nav, Card, Accordion, Button } from 'react-bootstrap';
import { PAGE_DATA } from './InfoPagesData';
import ContactUsModal from './ContactUsModal';
import UploadInventoryModal from './UploadInventoryModal';

// Normalise a CTA definition to a consistent shape. Supports legacy string
// values as well as the richer object form documented in InfoPagesData.js.
const normalizeCta = (cta) => {
  if (!cta) return null;
  if (typeof cta === 'string') {
    return { label: cta, opensContactModal: false, opensUploadModal: false };
  }
  if (typeof cta === 'object' && cta.label) {
    return {
      label: cta.label,
      opensContactModal: Boolean(cta.opensContactModal),
      opensUploadModal: Boolean(cta.opensUploadModal),
      subject: cta.subject || '',
      href: cta.href || '',
    };
  }
  return null;
};

const InfoPages = () => {
  // Logic for Deep Linking via URL Hash (#about, #excess, etc.)
  const [activeKey, setActiveKey] = useState('about-us');

  // Contact Us modal state — shared across all pages.
  const [contactModal, setContactModal] = useState({ show: false, subject: '', source: '' });

  // Upload Inventory modal state — also shared across pages.
  const [uploadModal, setUploadModal] = useState({ show: false, source: '' });

  const openContactModal = ({ subject = '', source = '' } = {}) => {
    setContactModal({ show: true, subject, source });
  };

  const closeContactModal = () => {
    setContactModal((prev) => ({ ...prev, show: false }));
  };

  const openUploadModal = ({ source = '' } = {}) => {
    setUploadModal({ show: true, source });
  };

  const closeUploadModal = () => {
    setUploadModal((prev) => ({ ...prev, show: false }));
  };

  const handleCtaClick = (cta, pageKey, pageTitle) => {
    if (!cta) return;
    if (cta.opensUploadModal) {
      openUploadModal({ source: pageTitle || pageKey });
      return;
    }
    if (cta.opensContactModal) {
      openContactModal({
        subject: cta.subject || `Inquiry from ${pageTitle}`,
        source: pageTitle || pageKey,
      });
      return;
    }
    if (cta.href) {
      window.location.href = cta.href;
    }
  };

  useEffect(() => {
    // Check hash on initial load
    const hash = window.location.hash.replace('#', '');
    if (hash && PAGE_DATA[hash]) {
      setActiveKey(hash);
    }

    // Listen for hash changes (if user clicks "back" or "forward")
    const handleHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && PAGE_DATA[newHash]) {
        setActiveKey(newHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelect = (key) => {
    setActiveKey(key);
    window.location.hash = key; // Update URL without reloading
  };

  return (
    <div className="bg-white min-vh-100 font-sans">
      <Container className="py-5">
        <Tab.Container activeKey={activeKey} onSelect={handleSelect}>
          <Row className="g-5">

            {/* Minimalist Sidebar */}
            <Col lg={3}>
              <div className="sticky-pricing-card border rounded-2 p-2 shadow-sm">
                <h6 className="text-uppercase tracking-widest text-muted small fw-bold mb-4 px-2">
                  Resource Navigation
                </h6>
                <Nav variant="pills" className="flex-column gap-1 custom-nav">
                  {Object.entries(PAGE_DATA).map(([key, page]) => (
                    <Nav.Item key={key}>
                      <Nav.Link
                        eventKey={key}
                        className="py-2 px-3 rounded-pill transition-all border-0 fw-medium"
                      >
                        {page.label}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </div>
            </Col>

            {/* Content Area */}
            <Col lg={9}>
              <Tab.Content className="ps-lg-4">
                {Object.entries(PAGE_DATA).map(([key, page]) => (
                  <Tab.Pane eventKey={key} key={key} className="fade show">

                    {/* Header Section */}
                    <div className="mb-5">
                      <h1 className="display-4 fw-bold text-dark mb-4">{page.title}</h1>
                      <p className="fs-5 text-muted mb-4" style={{ lineHeight: '1.6' }}>
                        {page.intro}
                      </p>
                      {page.showCerts && (
                        <div className="d-flex gap-3 justify-content-center">
                            <a target="_blank" rel="noopener noreferrer" href="/certs/component_search_as9120_iso9001.pdf">
                              <img src="/certs/nqa-as9120.jpg" alt="AS 9120 Certification" height="50" className="d-inline-block align-top me-2" />
                            </a>
                            <a target="_blank" rel="noopener noreferrer" href="/certs/component_search_as9120_iso9001.pdf">
                              <img src="/certs/nqa-iso9001.jpg" alt="ISO 9001 Certification" height="50" className="d-inline-block align-top me-2" />
                            </a>
                            <a target="_blank" rel="noopener noreferrer" href="/certs/component_search_as6081.pdf">
                              <img src="/certs/nqa-as6081.jpg" alt="AS 6081 Certification" height="50" className="d-inline-block align-top me-2" />
                            </a>
                            <img src="/certs/itar.png" alt="ITAR Certification" height="50" className="d-inline-block align-top me-2" />
                            <img src="/certs/gidep.png" alt="GIDEP Certification" height="50" className="d-inline-block align-top me-2" />
                        </div>
                      )}
                      <div className="d-flex gap-3">
                        {(() => {
                          const primary = normalizeCta(page.primaryCta);
                          return primary && (
                            <Button
                              variant="primary"
                              className="rounded-pill px-4 py-2 fw-bold"
                              onClick={() => handleCtaClick(primary, key, page.title)}
                            >
                              {primary.label}
                            </Button>
                          );
                        })()}
                        {(() => {
                          const secondary = normalizeCta(page.secondaryCta);
                          return secondary && (
                            <Button
                              variant="outline-dark"
                              className="rounded-pill px-4 py-2 fw-bold"
                              onClick={() => handleCtaClick(secondary, key, page.title)}
                            >
                              {secondary.label}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Features Grid - Clean Cards */}
                    <Row className="g-4 mb-5">
                      {page.highlights.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <Col md={6} key={i}>
                            <Card className="h-100 border-0 bg-light rounded-4 p-2">
                              <Card.Body>
                                <div className="text-primary mb-3">
                                  <Icon size={28} strokeWidth={1.5} />
                                </div>
                                <h5 className="fw-bold mb-2">{item.title}</h5>
                                <Card.Text className="text-muted small">
                                  {item.text}
                                </Card.Text>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>

                    {/* Detail Sections */}
                    <div className="mb-5">
                      {page.sections.map((section, i) => (
                        <div key={i} className="mb-4">
                          <h4 className="fw-bold text-dark mb-2">{section.title}</h4>
                          <p className="text-muted border-start border-3 border-primary ps-4">
                            {section.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Who We Support - Minimalist List */}
                    <div className="bg-dark text-white rounded-4 p-5 mb-5 shadow-lg">
                      <h3 className="fw-bold mb-4 text-center">{page.fitTitle}</h3>
                      <div className="d-flex flex-wrap justify-content-center gap-2">
                        {page.fitItems.map((item, i) => (
                          <span key={i} className="badge rounded-pill bg-secondary bg-opacity-25 px-3 py-2 fw-normal">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* FAQs - Clean Accordion */}
                    <div className="mb-5">
                      <h3 className="fw-bold mb-4">{page.faqTitle}</h3>
                      <Accordion flush className="custom-accordion">
                        {page.faqs.map((faq, i) => (
                          <Accordion.Item eventKey={i.toString()} key={i} className="border-bottom py-2">
                            <Accordion.Header className="fw-semibold">{faq.q}</Accordion.Header>
                            <Accordion.Body className="text-muted">
                              {faq.a}
                            </Accordion.Body>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    </div>

                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>

      <ContactUsModal
        show={contactModal.show}
        onHide={closeContactModal}
        defaultSubject={contactModal.subject}
        source={contactModal.source}
      />

      <UploadInventoryModal
        show={uploadModal.show}
        onHide={closeUploadModal}
        source={uploadModal.source}
      />

      {/* Basic CSS overrides to refine the look */}
      <style>{`
        .custom-nav .nav-link { color: #6c757d; }
        .custom-nav .nav-link.active {
          background-color: #0d6efd !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
        }
        .custom-accordion .accordion-button:not(.collapsed) {
          background-color: transparent;
          color: #0d6efd;
          box-shadow: none;
        }
        .custom-accordion .accordion-button:focus {
          box-shadow: none;
        }
        .transition-all { transition: all 0.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default InfoPages;