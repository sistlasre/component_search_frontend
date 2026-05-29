
const COMPLIANCE_FIELDS = {
  "htsus": "HTSUS",
  "eccn": "ECCN",
  "rohs_status": "RoHS Status",
  "reach_status": "REACH Status",
  "moisture_sensitivity_level_msl": "Moisture Sensitivity Level (MSL)"
};
/**
 * Convert snake_case to Title Case
 * @param {string} str - The snake_case string
 * @returns {string} Title Case string
 */
export const snakeToTitleCase = (str) => {
  if (str in COMPLIANCE_FIELDS) {
    return COMPLIANCE_FIELDS[str];
  }
  return str
    // Split where a letter is followed by a digit,
    // a digit is followed by a letter, or at an underscore
    .split(/(?=[0-9])|(?<=[0-9])|_/)
    // Filter out empty strings that might result from double separators (e.g., _1)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace("I O", "I/O")
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
      'base_product_number',
      'operating_temperature'
    ],
    'Environmental & Compliance': [
      'htsus',
      'eccn',
      'rohs_status',
      'reach_status',
      'moisture_sensitivity_level_msl'
    ]
  };

  // Fields to exclude from specifications display
  const excludeFields = ['url', 'created_at', 'updated_at', 'id', 'category1', 'category2'];

  // 1. Gather all explicitly mapped keys across both categories
  const mappedKeys = Object.values(categoryMappings).flat();
  // Helper function to validate values
  const isValidValue = (value) => value !== null && value !== undefined && value !== '' && value !== '-';
  // 2. Process the defined categories first to maintain exact specified order
  Object.entries(categoryMappings).forEach(([category, fields]) => {
    fields.forEach(fieldKey => {
      const value = partData[fieldKey];

      if (!isValidValue(value)) return;

      if (!specifications[category]) {
        specifications[category] = [];
      }

      specifications[category].push({
        key: fieldKey,
        label: snakeToTitleCase(fieldKey),
        value: value,
      });
    });
  });
  // 3. Find any remaining keys in partData that aren't mapped, excluded, or invalid
  const generalCategorySpec = specifications['General'] || [];

  Object.keys(partData).forEach(fieldKey => {
    // If it's already mapped, excluded, or invalid, skip it
    if (mappedKeys.includes(fieldKey) || excludeFields.includes(fieldKey)) {
      return;
    }

    const value = partData[fieldKey];
    if (!isValidValue(value)) return;

    // Initialize General category array if it didn't exist (e.g., if all defined general fields were empty)
    if (!specifications['General']) {
      specifications['General'] = [];
    }

    // Append to the end of the General category
    specifications['General'].push({
      key: fieldKey,
      label: snakeToTitleCase(fieldKey),
      value: value,
    });
  });

  return specifications;
};

/**
 * Transform raw part data from API to the format expected by the component
 * @param {Object} apiResponse - The full API response object
 * @returns {Object} Transformed part data
 */
export const transformPartData = (apiResponse, partNumberFallback = '') => {
  const rawData = apiResponse.part_data || apiResponse;
  const pricingInfoList = apiResponse.part_pricing_info || [];
  const pricingType = apiResponse.part_pricing_type || null;
  const imageUrl = apiResponse.part_image_url || '';

  // Use price_breaks from the first element
  const priceBreaks = pricingInfoList.length > 0 ? (pricingInfoList[0].price_breaks || []) : [];

  // Sum quantities across all entries
  const totalQuantity = pricingInfoList.reduce((sum, entry) => sum + (entry.qty || 0), 0);
  let description = '';
  if (rawData.category2) {
    description = rawData.category2;
  }
  if (rawData.series) {
    if (rawData.category2) {
      description += ` - ${rawData.series} Series`;
    } else {
      description = `${rawData.series} Series`;
    }

  }

  return {
    partNumber: rawData.part_number || partNumberFallback,
    manufacturer: rawData.manufacturer,
    description: description,
    category: rawData.category1,
    subcategory: rawData.category2,
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
    rawData: rawData,
    doesPartExist: apiResponse.part_data && Object.keys(apiResponse.part_data).length > 0
  };
};
