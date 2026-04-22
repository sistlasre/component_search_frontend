import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Tab, Nav, Card, Accordion, Button } from 'react-bootstrap';
import { PAGE_DATA } from './InfoPagesData';

const InfoPages = () => {
  // Logic for Deep Linking via URL Hash (#about, #excess, etc.)
  const [activeKey, setActiveKey] = useState('about');

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
              <div className="sticky-top" style={{ top: '2rem' }}>
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
                      <div className="d-flex gap-3">
                        <Button variant="primary" className="rounded-pill px-4 py-2 fw-bold">
                          {page.primaryCta}
                        </Button>
                        <Button variant="outline-dark" className="rounded-pill px-4 py-2 fw-bold">
                          {page.secondaryCta}
                        </Button>
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