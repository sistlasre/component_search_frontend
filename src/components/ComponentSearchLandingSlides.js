import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Carousel } from 'react-bootstrap';
import {
  FiClipboard, FiTruck, FiRefreshCw,
  FiSearch, FiTrendingUp, FiShield,
  FiDollarSign, FiZap, FiTarget, FiMonitor
} from 'react-icons/fi';
import './ComponentSearchLandingSlides.css';

const ComponentSearchLandingSlides = () => {
  // Vignette overlay: Dark on the left for text readability, clear on the right for the image
  const vignette = 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)';

  const slides = [
    {
      id: 'consignment',
      eyebrow: 'CONSIGNMENT PROGRAM',
      title: 'Maximize Returns Without Giving Up Control',
      description: 'Our consignment program gives you visibility, flexibility, and operational support to help maximize returns while maintaining full control of your inventory.',
      button: 'Explore Our Consignment Program',
      href: '/excess',
      // Updated: High-end logistics/tech inventory background
      image: `${vignette}, url(https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1400&q=80)`,
      features: [
        { icon: <FiClipboard />, title: "Serialized Receiving With Full Documentation", desc: "We use InventoryCapture to document the condition of your inventory as it is received." },
        { icon: <FiTruck />, title: "All Logistics Costs Covered", desc: "We cover the logistics costs, so there is no out-of-pocket expense to the customer." },
        { icon: <FiRefreshCw />, title: "Liquidate or Recall at Any Time", desc: "Maintain full control of your inventory with the flexibility to liquidate or recall it at any time." }
      ]
    },
    {
      id: 'excess',
      eyebrow: 'EXCESS PROGRAM',
      title: 'Turn Excess Inventory into Working Capital',
      description: 'Market-driven analysis, transparent reporting, and active demand generation to help convert surplus electronic components into cash.',
      button: 'Explore Our Excess Program',
      href: '/excess',
      image: `${vignette}, url(https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80)`,
      features: [
        { icon: <FiMonitor />, title: "Full Transparency, Full Control", desc: "Access our ERP system to view all quotes and maintain full control over pricing decisions." },
        { icon: <FiTrendingUp />, title: "Aggressive Marketing", desc: "Your inventory is marketed under direct MPNs and crosses to maximize advertising exposure on all major platforms and search engines." },
        { icon: <FiSearch />, title: "Market Intelligence", desc: "Proprietary programs analyze market trends to price your inventory for maximum returns." }
      ]
    },
    {
      id: 'scrap',
      eyebrow: 'SCRAP PROGRAM',
      title: 'Unlock Value From Obsolete and Scrap Inventory',
      description: 'Recover more value from obsolete material through higher-than-scrap pricing, on-site component recovery, and flexible deal structures.',
      button: 'Learn About Our Scrap Program',
      href: '/excess',
      image: `${vignette}, url(https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1400&q=80)`,
      features: [
        { icon: <FiDollarSign />, title: "Top Dollar for Scrap", desc: "We pay above traditional scrap value to maximize recovery from your material." },
        { icon: <FiZap />, title: "On-Site Component Recovery", desc: "Our in-house team can remove and refurbish components on-site to recover additional value." },
        { icon: <FiTarget />, title: "Outright Buy or Revenue Split", desc: "Choose an immediate purchase or a revenue-split model based on your goals." }
      ]
    }
  ];

  return (
    <div className="ComponentSearchLandingSlides-wrapper py-3 bg-light">
      <Container>
        <Carousel
          interval={8000}
          indicators={true}
          className="shadow-lg ComponentSearchLandingSlides-carousel"
        >
          {slides.map((slide) => (
            <Carousel.Item key={slide.id}>
              <Card className="border-0 overflow-hidden slide-card">
                <Row className="g-0">
                  {/* Left Column: Image with Vignette Overlay */}
                  <Col lg={6}
                       className="p-4 p-md-5 d-flex flex-column justify-content-center hero-side text-white"
                       style={{
                         background: slide.image,
                         backgroundSize: 'cover',
                         backgroundPosition: 'center'
                       }}>
                    <div className="hero-content">
                      <Badge className="program-badge mb-4 text-uppercase">
                        {slide.eyebrow}
                      </Badge>
                      <h2 className="display-6 fw-bold mb-4">{slide.title}</h2>
                      <p className="lead fs-6 mb-0 opacity-90 slide-desc">
                        {slide.description}
                      </p>
                    </div>
                  </Col>

                  {/* Right Column: White Background with Features */}
                  <Col lg={6} className="p-4 p-md-5 bg-light d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="text-primary fw-bold mb-4 tracking-widest small">WHY IT MATTERS</h6>
                      <div className="feature-stack">
                        {slide.features.map((feature, idx) => (
                          <div key={idx} className="feature-row d-flex gap-3 mb-4">
                            <div className="icon-circle shadow-sm">
                              {feature.icon}
                            </div>
                            <div className="feature-text">
                              <div className="fw-bold text-dark mb-1">{feature.title}</div>
                              <p className="small text-muted mb-0">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-top">
                      <Button
                        href={slide.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-button btn-lg px-5 py-2 fw-bold shadow-sm"
                      >
                        {slide.button} →
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </div>
  );
};

export default ComponentSearchLandingSlides;