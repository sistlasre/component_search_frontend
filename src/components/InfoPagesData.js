import {
  Boxes, BarChart3, ClipboardList, ShieldCheck,
  Search, Recycle, Factory, Phone, Mail, MapPin
} from "lucide-react";

// ---------------------------------------------------------------------------
// CTA configuration
// ---------------------------------------------------------------------------
// Each page's `primaryCta` / `secondaryCta` may be either:
//   * a string — the button label, with no action (legacy behaviour)
//   * an object of shape:
//       {
//         label: string,                // required — button text
//         opensContactModal?: boolean,  // if true, clicking opens the Contact Us modal
//         opensUploadModal?: boolean,   // if true, clicking opens the Upload Inventory modal
//         subject?: string,             // optional subject to pre-fill in the contact form
//         href?: string,                // optional link (used when neither modal flag is set)
//       }
// Precedence: opensUploadModal > opensContactModal > href. InfoPages.js
// reads the object form and wires the modals accordingly.
// ---------------------------------------------------------------------------

export const PAGE_DATA = {
  "about-us": {
    label: "About Us",
    title: "About Component Search",
    intro: "Component Search is an independent stocking distributor focused on helping customers solve sourcing challenges, reduce excess inventory, and keep supply chains moving.",
    description: [
      "We support OEMs, EMS providers, contract manufacturers, and distributors with practical inventory solutions built around responsiveness, transparency, and execution.",
      "Our approach combines market knowledge, operational discipline, and technology-driven processes to help customers source parts, recover value from inventory, and build stronger supply continuity."
    ],
    highlights: [
      { title: "Independent Distribution", text: "We help customers source active and hard-to-find components through an agile independent distribution model.", icon: Boxes },
      { title: "Inventory Recovery", text: "We create recovery paths for excess, consigned, obsolete, and slow-moving electronic inventory.", icon: BarChart3 },
      { title: "Operational Support", text: "Our team works to keep programs organized, visible, and aligned with customer goals.", icon: ClipboardList },
      { title: "Quality Focus", text: "We understand that accountability, communication, and process control matter in every transaction.", icon: ShieldCheck }
    ],
    sections: [
      { title: "Who We Are", text: "Component Search was built around the realities of the electronic components market: changing availability, shifting lead times, excess inventory exposure, and the need for responsive support." },
      { title: "What We Do", text: "We support customers through sourcing, excess recovery, consignment, and e-waste / scrap programs designed to improve inventory outcomes and supply chain flexibility." },
      { title: "Why Companies Work With Us", text: "Customers work with Component Search because they need practical solutions, clear communication, and a team that understands how to move quickly without losing control of the process." }
    ],
    fitTitle: "Who We Support",
    fitItems: ["OEMs", "EMS providers", "Contract manufacturers", "Independent distributors", "Procurement teams", "Supply chain and operations leaders"],
    faqTitle: "Why Component Search",
    faqs: [
      { q: "What kind of company is Component Search?", a: "Component Search is an independent stocking distributor serving customers across sourcing, excess inventory recovery, consignment, and related inventory programs." },
      { q: "Who do you typically work with?", a: "We work with OEMs, EMS providers, contract manufacturers, distributors, and procurement teams looking for responsive support and practical inventory solutions." },
      { q: "What makes your approach different?", a: "We focus on transparency, responsiveness, and structured execution rather than treating programs like black boxes." }
    ],
    ctaTitle: "Looking for a more capable inventory and sourcing partner?",
    ctaText: "Component Search helps customers source components, recover value from inventory, and build more practical supply chain strategies.",
    primaryCta: {
      label: "Contact Us",
      opensContactModal: true,
      subject: "General inquiry — About Us"
    }
  },
  "scheduled-orders": {
    label: "Scheduled Orders",
    title: "Scheduled Orders Program",
    intro: "Secure supply continuity with a structured ordering program designed to reduce market exposure, support forecasted demand, and improve purchasing consistency over time.",
    description: [
      "For many programs, supply should not be managed only as an immediate need. A structured scheduled order strategy can help reduce sourcing pressure, improve planning visibility, and create stronger continuity for recurring demand.",
      "Component Search helps customers build scheduled order programs aligned with forecasted demand, delivery requirements, budget planning, and supply chain priorities."
    ],
    highlights: [
      { title: "Improved Supply Continuity", text: "Planned ordering helps reduce last-minute sourcing pressure and supports more stable fulfillment.", icon: Boxes },
      { title: "Reduced Spot Exposure", text: "A scheduled program can lower reliance on reactive purchasing during volatile market conditions.", icon: BarChart3 },
      { title: "Forecast Alignment", text: "Inventory flow can be structured around expected usage and broader purchasing plans.", icon: ClipboardList },
      { title: "Program Flexibility", text: "Schedules can be designed around different demand patterns, quantities, and delivery needs.", icon: ShieldCheck }
    ],
    sections: [
      { title: "Why This Program Exists", text: "Some parts are too important to leave to spot buying alone. Scheduled Orders provide a more stable procurement model for recurring demand while reducing exposure to short-term market disruption." },
      { title: "How It Works", text: "We review demand, plan the order structure, align inventory and supply requirements, fulfill against the agreed schedule, and provide ongoing support as needs change." },
      { title: "How It Helps", text: "This program is designed for customers who want better predictability in supply without losing flexibility in execution." }
    ],
    fitTitle: "Best Fit",
    fitItems: ["Recurring production demand", "Programs with forecasted part requirements", "Customers seeking reduced supply risk", "Teams looking to lower dependence on spot buying", "Procurement groups needing scheduling visibility", "Programs requiring staged delivery over time"],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      { q: "How is this different from a normal purchase order?", a: "A scheduled order program is structured around recurring demand and planned fulfillment over time rather than a one-time transaction." },
      { q: "Can delivery schedules be adjusted?", a: "Programs can be reviewed and adjusted depending on changing needs, forecasts, and supply conditions." },
      { q: "Is this only for large-volume customers?", a: "Not necessarily. The right fit depends more on demand consistency and planning goals than on size alone." }
    ],
    ctaTitle: "Need a more stable and predictable supply strategy?",
    ctaText: "Component Search can help build a scheduled order program aligned with your operational goals and recurring demand requirements.",
    primaryCta: {
      label: "Discuss Scheduled Orders",
      opensContactModal: true,
      subject: "Scheduled Orders Program inquiry"
    }
  },
  "quality-policy": {
    label: "Quality Policy",
    title: "Quality Policy",
    intro: "Component Search is committed to supporting customer requirements through disciplined processes, clear accountability, and continuous improvement.",
    description: [
      "We are committed to providing products and services that meet customer expectations for quality, responsiveness, and reliability.",
      "This commitment is supported through structured operational processes, supplier oversight, documentation discipline, and a focus on continuous improvement."
    ],
    highlights: [
      { title: "Customer Focus", text: "We work to understand customer requirements and respond with practical, reliable support.", icon: ShieldCheck },
      { title: "Process Discipline", text: "Repeatable and controlled processes are essential to consistent quality performance.", icon: ClipboardList },
      { title: "Supplier Oversight", text: "Supplier evaluation and ongoing monitoring are important parts of maintaining quality outcomes.", icon: Factory },
      { title: "Continuous Improvement", text: "We are committed to improving systems, workflows, and service performance over time.", icon: BarChart3 }
    ],
    sections: [
      { title: "Policy Statement", text: "Component Search is committed to providing products and services that meet customer expectations for quality, responsiveness, and reliability while maintaining consistency and accountability throughout operations." },
      { title: "Operational Commitment", text: "Quality is supported through process control, communication, documentation, supplier oversight, and follow-through across each customer engagement." },
      { title: "Continuous Improvement", text: "We aim to improve systems, workflows, and service performance over time to better support customer requirements." }
    ],
    fitTitle: "Quality Principles",
    fitItems: ["Customer focus", "Process discipline", "Supplier oversight", "Documentation control", "Accountability", "Continuous improvement"],
    faqTitle: "Quality Focus",
    faqs: [
      { q: "Is quality limited to inspection only?", a: "No. Quality also includes communication, process control, documentation, accountability, and consistency across the customer experience." },
      { q: "Why is supplier oversight part of quality?", a: "Supplier evaluation and monitoring help support more consistent outcomes and better operational control." },
      { q: "Why does process discipline matter?", a: "Repeatable, controlled processes help reduce variation and support reliable performance over time." }
    ],
    ctaTitle: "Questions about our quality approach?",
    ctaText: "Component Search is committed to disciplined processes, accountability, and continuous improvement in support of customer requirements.",
    showCerts: true
  },
  "terms-of-service": {
    label: "Terms of Service",
    title: "Terms of Service",
    intro: "These Terms of Service govern the use of the Component Search website and related services.",
    description: [
      "By using this website, submitting information, requesting quotes, or engaging with our services, you agree to these terms.",
      "These terms are intended to provide general guidance regarding use of the site, submissions, product and service information, and related limitations."
    ],
    highlights: [
      { title: "Website Use", text: "Users agree not to misuse the website, interfere with its operation, or attempt unauthorized access.", icon: ShieldCheck },
      { title: "Quotes and Orders", text: "Quotes, listings, and responses do not become final binding agreements unless confirmed by Component Search.", icon: ClipboardList },
      { title: "User Submissions", text: "Users represent that submitted information is accurate and that they have authority to provide it.", icon: Mail },
      { title: "Content Ownership", text: "Website content and branding remain the property of Component Search unless otherwise stated.", icon: Search }
    ],
    sections: [
      { title: "Product and Service Information", text: "Product availability, inventory listings, descriptions, and service information are subject to change without notice and may be updated, revised, or removed at any time." },
      { title: "Limitations and External Links", text: "Component Search is not responsible for indirect damages arising from website use to the fullest extent permitted by law and is not responsible for the content or policies of linked third-party websites." },
      { title: "Changes to Terms", text: "These terms may be updated from time to time. Continued use of the website after updates are posted constitutes acceptance of the revised terms." }
    ],
    fitTitle: "Key Terms Topics",
    fitItems: ["Website use", "Product and service information", "Quotes and orders", "User submissions", "Intellectual property", "Limitation of liability"],
    faqTitle: "Terms Summary",
    faqs: [
      { q: "Do quotes automatically create a final agreement?", a: "No. Quotes and listings do not become final binding agreements unless confirmed by Component Search." },
      { q: "Can website information change?", a: "Yes. Product, service, and listing information may be updated, revised, or removed without notice." },
      { q: "Who should I contact with questions about these terms?", a: "Questions can be directed to sales@componentsearch.com or (800) 974-9947." }
    ],
    ctaTitle: "Questions regarding our terms?",
    ctaText: "For questions regarding these Terms of Service, contact Component Search directly."
  },
  "privacy-policy": {
    label: "Privacy Policy",
    title: "Privacy Policy",
    intro: "Component Search respects your privacy and is committed to handling personal information responsibly.",
    description: [
      "This Privacy Policy explains how we collect, use, and protect information submitted through our website and related services.",
      "It covers information you provide directly, certain technical usage information, how information may be used, and general data protection practices."
    ],
    highlights: [
      { title: "Information We Collect", text: "We may collect contact information, quote details, inventory submission data, and related communications.", icon: ClipboardList },
      { title: "How We Use Information", text: "Information may be used to respond to inquiries, process requests, support operations, and improve site functionality.", icon: BarChart3 },
      { title: "Information Sharing", text: "We do not sell personal information and share it only as reasonably necessary to support operations or legal obligations.", icon: ShieldCheck },
      { title: "Data Protection", text: "We take reasonable administrative and technical measures to help protect submitted information.", icon: Factory }
    ],
    sections: [
      { title: "Cookies and Analytics", text: "Our website may use cookies, analytics tools, and similar technologies to understand usage patterns and improve performance." },
      { title: "Your Choices", text: "You may contact us to update information, request removal from certain communications, or ask questions about how your information is handled." },
      { title: "Changes to This Policy", text: "This Privacy Policy may be updated from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised policy." }
    ],
    fitTitle: "Privacy Topics",
    fitItems: ["Information collection", "Use of information", "Information sharing", "Data protection", "Cookies and analytics", "User choices"],
    faqTitle: "Privacy Summary",
    faqs: [
      { q: "Do you sell personal information?", a: "No. Component Search does not sell personal information." },
      { q: "What types of information may be collected?", a: "We may collect contact information, company information, quote request details, inventory submission data, and certain technical usage information." },
      { q: "How can I ask a privacy-related question?", a: "Privacy-related questions can be directed to sales@componentsearch.com or (800) 974-9947." }
    ],
    ctaTitle: "Questions about privacy practices?",
    ctaText: "Contact Component Search with questions regarding privacy, information handling, or related requests."
  },
  "cookies-and-gdpr": {
    label: "Cookies / GDPR Policy",
    title: "Cookies / GDPR Policy",
    intro: "This page explains how Component Search may use cookies and similar technologies and provides general information about privacy-related data handling principles.",
    description: [
      "Cookies are small text files stored on a user’s device to help websites function properly, remember preferences, and understand how visitors use a site.",
      "Component Search may use cookies and similar technologies to support website functionality, remember settings, improve usability, and understand usage patterns."
    ],
    highlights: [
      { title: "Essential Cookies", text: "Used to support core site functionality.", icon: ShieldCheck },
      { title: "Performance Cookies", text: "Used to understand website usage and improve site performance.", icon: BarChart3 },
      { title: "Preference Cookies", text: "Used to remember user settings where applicable.", icon: ClipboardList },
      { title: "Analytics Cookies", text: "Used to collect aggregated information about how visitors interact with the site.", icon: Search }
    ],
    sections: [
      { title: "Cookie Controls", text: "Users can generally manage or disable cookies through browser settings. Disabling cookies may affect certain site functions." },
      { title: "GDPR-Related Principles", text: "Where applicable, Component Search aims to handle personal data in a manner consistent with core privacy principles, including transparency, data minimization, and reasonable protection of collected information." },
      { title: "Third-Party Services and Policy Updates", text: "Some site functions may involve third-party tools or services that use cookies or similar tracking technologies, and this policy may be updated from time to time as website tools or practices change." }
    ],
    fitTitle: "Policy Topics",
    fitItems: ["Use of cookies", "Types of cookies", "Cookie controls", "GDPR-related principles", "Third-party services", "Policy updates"],
    faqTitle: "Cookies Summary",
    faqs: [
      { q: "Can users disable cookies?", a: "Yes. Users can generally manage or disable cookies through their browser settings, though this may affect site functionality." },
      { q: "What types of cookies may be used?", a: "The website may use essential, performance, preference, and analytics cookies or similar technologies." },
      { q: "Who should I contact with questions about cookies or privacy?", a: "Questions can be directed to sales@componentsearch.com or (800) 974-9947." }
    ],
    ctaTitle: "Questions about cookies or privacy-related practices?",
    ctaText: "Contact Component Search with questions regarding cookies, privacy practices, or related policy topics."
  }
};