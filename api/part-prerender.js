const fs = require('fs');
const path = require('path');

const API_BASE = 'https://obkg1pw61g.execute-api.us-west-2.amazonaws.com/prod/cs';
const BASE_URL = 'https://www.componentsearch.com';

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = async (req, res) => {
  // Read the CRA-built index.html template.
  const htmlPath = path.join(process.cwd(), 'build', 'index.html');
  let html;
  try {
    html = fs.readFileSync(htmlPath, 'utf8');
  } catch {
    res.status(500).send('index.html not found');
    return;
  }

  const { partId } = req.query;
  if (!partId) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  try {
    const apiRes = await fetch(
      `${API_BASE}/part/${encodeURIComponent(partId)}`
    );
    if (!apiRes.ok) throw new Error(`API responded ${apiRes.status}`);
    const apiData = await apiRes.json();

    const raw = apiData.part_data || {};
    const pricingInfo = apiData.part_pricing_info || [];
    const imageUrl = apiData.part_image_url || '';

    const partNumber = raw.part_number || partId.split('__')[0];
    const manufacturer = raw.manufacturer || '';
    const category = raw.category1 || '';
    const subcategory = raw.category2 || '';
    const series = raw.series || '';

    let description = subcategory;
    if (series) {
      description = description
        ? `${description} - ${series} Series`
        : `${series} Series`;
    }

    const priceBreaks =
      pricingInfo.length > 0 ? pricingInfo[0].price_breaks || [] : [];
    const totalQty = pricingInfo.reduce((sum, e) => sum + (e.qty || 0), 0);

    // --- SEO strings ---
    const seoTitle = manufacturer
      ? `${partNumber} - ${manufacturer} | Component Search`
      : `${partNumber} | Component Search`;

    const seoDescription = description
      ? `${partNumber} by ${manufacturer} — ${description}. Check pricing, availability & specs.`
      : `${partNumber} by ${manufacturer}. Check pricing, availability & specs on Component Search.`;

    const seoKeywords = [
      partNumber,
      manufacturer,
      category,
      subcategory,
      'electronic components',
      'buy',
      'datasheet',
      'price',
      'in stock',
    ]
      .filter(Boolean)
      .join(', ');

    const pageUrl = `${BASE_URL}/part/${encodeURIComponent(partId)}`;
    const fullImageUrl = imageUrl
      ? imageUrl.startsWith('http')
        ? imageUrl
        : `${BASE_URL}${imageUrl}`
      : `${BASE_URL}/og-image.jpg`;

    // --- JSON-LD: Product ---
    const validBreaks = priceBreaks.filter(
      (pb) => pb && Number(pb.price) > 0
    );
    const prices = validBreaks.map((pb) => Number(pb.price));

    const product = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: partNumber,
      sku: partNumber,
      mpn: partNumber,
      description: description || `${partNumber} by ${manufacturer}`,
      image: imageUrl ? fullImageUrl : undefined,
      url: pageUrl,
      brand: manufacturer
        ? { '@type': 'Brand', name: manufacturer }
        : undefined,
      category:
        [category, subcategory].filter(Boolean).join(' > ') || undefined,
    };

    if (prices.length > 1) {
      product.offers = {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: Math.min(...prices).toFixed(4),
        highPrice: Math.max(...prices).toFixed(4),
        offerCount: validBreaks.length,
        availability:
          totalQty > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'Component Search' },
      };
    } else if (prices.length === 1) {
      product.offers = {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: prices[0].toFixed(4),
        availability:
          totalQty > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'Component Search' },
      };
    }

    // --- JSON-LD: BreadcrumbList ---
    const crumbs = [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Search', url: `${BASE_URL}/search` },
    ];
    if (category) {
      crumbs.push({
        name: category,
        url: `${BASE_URL}/search?category=${encodeURIComponent(category)}`,
      });
    }
    if (subcategory) {
      crumbs.push({
        name: subcategory,
        url: `${BASE_URL}/search?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`,
      });
    }
    crumbs.push({ name: partNumber, url: pageUrl });

    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    };

    // --- Replace default meta tags in index.html ---
    html = html
      .replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeHtml(seoTitle)}</title>`
      )
      .replace(
        /<meta name="description" content="[^"]*"/,
        `<meta name="description" content="${escapeAttr(seoDescription)}"`
      )
      .replace(
        /<meta name="keywords" content="[^"]*"/,
        `<meta name="keywords" content="${escapeAttr(seoKeywords)}"`
      )
      .replace(
        /<meta property="og:type" content="[^"]*"/,
        `<meta property="og:type" content="product"`
      )
      .replace(
        /<meta property="og:title" content="[^"]*"/,
        `<meta property="og:title" content="${escapeAttr(seoTitle)}"`
      )
      .replace(
        /<meta property="og:description" content="[^"]*"/,
        `<meta property="og:description" content="${escapeAttr(seoDescription)}"`
      )
      .replace(
        /<meta property="twitter:title" content="[^"]*"/,
        `<meta property="twitter:title" content="${escapeAttr(seoTitle)}"`
      )
      .replace(
        /<meta property="twitter:description" content="[^"]*"/,
        `<meta property="twitter:description" content="${escapeAttr(seoDescription)}"`
      );

    // Inject additional tags (OG image, canonical, JSON-LD) before </head>.
    const injected = [
      `<meta property="og:image" content="${escapeAttr(fullImageUrl)}" />`,
      `<meta property="og:url" content="${escapeAttr(pageUrl)}" />`,
      `<meta property="twitter:image" content="${escapeAttr(fullImageUrl)}" />`,
      `<link rel="canonical" href="${escapeAttr(pageUrl)}" />`,
      `<script type="application/ld+json">${JSON.stringify(product)}</script>`,
      `<script type="application/ld+json">${JSON.stringify(breadcrumbList)}</script>`,
    ].join('\n    ');

    html = html.replace('</head>', `    ${injected}\n  </head>`);
  } catch (err) {
    // On any failure, serve the unmodified SPA HTML so the page still works
    // client-side. The meta tags will just be the defaults.
    console.error('Part prerender error:', err);
  }

  // Cache on Vercel's CDN for 1 hour, serve stale up to 24h while revalidating.
  res.setHeader(
    'Cache-Control',
    's-maxage=3600, stale-while-revalidate=86400'
  );
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
