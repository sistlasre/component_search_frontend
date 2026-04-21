import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Carousel } from 'react-bootstrap';

const ComponentSearchLandingSlides = () => {
  const slides = [
    {
      eyebrow: 'EXCESS PROGRAM',
      title: 'Turn Excess Inventory Into Working Capital',
      description:
        'Market-driven analysis, transparent reporting, and active demand generation to help convert surplus electronic components into cash.',
      points: ['Data Analysis', 'Pricing Optimization', 'Portal Visibility'],
      button: 'Explore Our Excess Program',
      href: '/excess-program',
      image: 'linear-gradient(135deg, rgba(9,33,91,.92), rgba(20,92,255,.82)), url(https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80)',
    },
    {
      eyebrow: 'E-WASTE / SCRAP PROGRAM',
      title: 'Unlock Value From Obsolete and Scrap Inventory',
      description:
        'A structured path to evaluate aging electronic inventory, separate reclaimable value, and reduce waste with a professional disposition process.',
      points: ['Value Recovery', 'Inventory Cleanup', 'Structured Disposition'],
      button: 'Learn About Our E-Waste Program',
      href: '/ewaste-scrap-program',
      image: 'linear-gradient(135deg, rgba(10,24,56,.90), rgba(34,88,120,.78)), url(https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1400&q=80)',
    },
    {
      eyebrow: 'CONSIGNMENT PROGRAM',
      title: 'Consign Inventory With Full Visibility and Control',
      description:
        'Keep control of your inventory while we handle the marketing, exposure, quoting activity, and intake workflows needed to maximize returns.',
      points: ['Operations Portal', 'Inventory Capture', 'Performance-Aligned Model'],
      button: 'See How Consignment Works',
      href: '/consignment-program',
      image: 'linear-gradient(135deg, rgba(8,29,88,.92), rgba(17,118,255,.78)), url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80)',
    },
  ];

  return (
    <div className="bg-light py-5">
      <Container>
        {/* Carousel Component */}
        <Carousel
          interval={5000}
          indicators={true}
          variant="dark"
          className="shadow-lg"
          style={{ borderRadius: '32px', overflow: 'hidden' }}
        >
          {slides.map((slide, index) => (
            <Carousel.Item key={index}>
              <Card className="border-0">
                <Row className="g-0">
                  {/* Left Side: Gradient/Image Visuals */}
                  <Col lg={6}
                    className="d-flex align-items-end p-4 p-md-5 text-white"
                    style={{
                      backgroundImage: slide.image,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      minHeight: '520px'
                    }}
                  >
                    <div className="w-100 mb-4">
                      <div className="mb-4 d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center fw-bold"
                          style={{
                            height: '48px', width: '48px', borderRadius: '12px',
                            backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                        >
                          CS
                        </div>
                        <div>
                          <div className="h5 mb-0 fw-bold">componentsearch</div>
                          <small className="text-uppercase tracking-widest opacity-75" style={{ fontSize: '0.7rem' }}>
                            Program {index + 1}
                          </small>
                        </div>
                      </div>

                      <Badge
                        bg="transparent"
                        className="border border-white border-opacity-25 px-3 py-2 text-uppercase fw-bold mb-4"
                        style={{ letterSpacing: '0.15em', backdropFilter: 'blur(4px)' }}
                      >
                        {slide.eyebrow}
                      </Badge>

                      <h2 className="display-5 fw-bold mb-3">{slide.title}</h2>
                      <p className="fs-5 opacity-90" style={{ maxWidth: '500px' }}>
                        {slide.description}
                      </p>
                    </div>
                  </Col>

                  {/* Right Side: Features and CTA */}
                  <Col lg={6} className="p-4 p-md-5 bg-white d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="text-primary fw-bold mb-4" style={{ letterSpacing: '0.12em' }}>
                        WHY IT MATTERS
                      </h6>

                      <div className="d-grid gap-3">
                        {slide.points.map((point) => (
                          <Card
                            key={point}
                            className="border-0 bg-light p-3"
                            style={{ borderRadius: '16px', border: '1px solid #f1f5f9' }}
                          >
                            <div className="fw-bold text-dark">{point}</div>
                            <small className="text-muted">
                              Professional-grade solutions for electronic supply chain management.
                            </small>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-top d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                      <Button
                        href={slide.href}
                        size="lg"
                        className="px-4 py-2 border-0 shadow-sm fw-bold"
                        style={{ backgroundColor: '#2563eb', borderRadius: '12px' }}
                      >
                        {slide.button}
                      </Button>
                      <div className="small text-muted d-none d-sm-block">
                        Target: <span className="fw-medium text-dark">{slide.href}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Carousel.Item>
          ))}
        </Carousel>

        {/* Global CSS for Carousel Arrows Styling */}
        <style>
          {`
            .carousel-control-prev, .carousel-control-next {
              width: 5%;
            }
            .carousel-indicators [data-bs-target] {
              background-color: #2563eb;
            }
            @media (max-width: 991px) {
              .carousel-control-prev, .carousel-control-next {
                display: none;
              }
            }
          `}
        </style>
      </Container>
    </div>
  );
};

export default ComponentSearchLandingSlides;