/**
 * Convert snake_case to Title Case
 * @param {string} str - The snake_case string
 * @returns {string} Title Case string
 */
export const snakeToTitleCase = (str) => {
  return str
    // Split where a letter is followed by a digit,
    // a digit is followed by a letter, or at an underscore
    .split(/(?=[0-9])|(?<=[0-9])|_/)
    // Filter out empty strings that might result from double separators (e.g., _1)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Categorize specifications based on their keys
 * @param {Object} partData - The raw part data from API
 * @returns {Object} Categorized specifications
 */
export const categorizeSpecifications = (partData) => {
  const specifications = {};
  
  // Define categories and their associated fields
  const categoryMappings = {
    'General': [
      'part_number',
      'manufacturer',
      'category3',
      'category4',
      'category5',
      'series',
      'packaging',
      'supplier_device_package'
    ],
    'Electrical Characteristics': [
      'resistance',
      'power_watts',
      'tolerance',
      'temperature_coefficient',
      'voltage_rating',
      'current_rating',
      'capacitance',
      'inductance'
    ],
    'Physical Characteristics': [
      'size_dimension',
      'package_case',
      'height_seated_max',
      'number_of_terminations',
      'mounting_type',
      'lead_spacing',
      'weight',
      'color'
    ],
    'Environmental & Compliance': [
      'operating_temperature',
      'storage_temperature',
      'moisture_sensitivity',
      'ratings',
      'failure_rate',
      'rohs_status',
      'reach_status',
      'lead_free'
    ],
    'Features': [
      'features',
      'composition',
      'technology',
      'interface',
      'applications'
    ]
  };

  // Fields to exclude from specifications display
  const excludeFields = ['url', 'created_at', 'updated_at', 'id'];
  Object.entries(categoryMappings).forEach(([category, fields]) => {
    fields.forEach(fieldKey => {
      const value = partData[fieldKey];

      // Original validation logic
      if (value === null || value === undefined || value === '' || value === '-') {
        return;
      }

      if (!specifications[category]) {
        specifications[category] = {};
      }

      specifications[category][snakeToTitleCase(fieldKey)] = value;
    });
  });

  // Handle "Other Specifications" and Uncategorized fields
  const categorizedKeys = Object.values(categoryMappings).flat();

  return specifications;
};

/**
 * Transform raw part data from API to the format expected by the component
 * @param {Object} apiResponse - The full API response object
 * @returns {Object} Transformed part data
 */
export const transformPartData = (apiResponse) => {
  const rawData = apiResponse.part_data || apiResponse;
  const pricingInfoList = apiResponse.part_pricing_info || [];
  const pricingType = apiResponse.part_pricing_type || null;
  const imageUrl = apiResponse.part_image_url || '';

  // Use price_breaks from the first element
  const priceBreaks = pricingInfoList.length > 0 ? (pricingInfoList[0].price_breaks || []) : [];

  // Sum quantities across all entries
  const totalQuantity = pricingInfoList.reduce((sum, entry) => sum + (entry.qty || 0), 0);

  return {
    partNumber: rawData.part_number,
    manufacturer: rawData.manufacturer || 'Unknown',
    description: `${rawData.category2 || ''} - ${rawData.series || ''} Series`.trim(),
    category: rawData.category1 || 'Electronic Components',
    subcategory: rawData.category2 || '',
    image: imageUrl,
    specifications: categorizeSpecifications(rawData),
    // Pricing info
    priceBreaks: priceBreaks,
    totalQuantity: totalQuantity,
    pricingType: pricingType,
    // Preserve mock data for sections we'll integrate later
    suppliers: [],
    documents: [],
    relatedParts: [],
    // Store raw data for reference
    rawData: rawData
  };
};
