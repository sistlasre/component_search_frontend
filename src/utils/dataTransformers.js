/**
 * Convert snake_case to Title Case
 * @param {string} str - The snake_case string
 * @returns {string} Title Case string
 */
export const snakeToTitleCase = (str) => {
  return str
    .split('_')
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
      'series', 
      'packaging', 
      'product_status',
      'category1',
      'category2',
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
    ],
    'Availability & Pricing': [
      'quantity_available',
      'price',
      'minimum_order_quantity',
      'lead_time'
    ]
  };

  // Fields to exclude from specifications display
  const excludeFields = ['url', 'created_at', 'updated_at', 'id'];

  // Categorize each field
  Object.entries(partData).forEach(([key, value]) => {
    // Skip excluded fields
    if (excludeFields.includes(key)) {
      return;
    }

    // Skip null or undefined values
    if (value === null || value === undefined || value === '' || value === '-') {
      return;
    }

    let categorized = false;
    
    // Find the appropriate category for this field
    for (const [category, fields] of Object.entries(categoryMappings)) {
      if (fields.includes(key)) {
        if (!specifications[category]) {
          specifications[category] = {};
        }
        specifications[category][snakeToTitleCase(key)] = value;
        categorized = true;
        break;
      }
    }

    // If not categorized, put in "Other Specifications"
    if (!categorized) {
      if (!specifications['Other Specifications']) {
        specifications['Other Specifications'] = {};
      }
      specifications['Other Specifications'][snakeToTitleCase(key)] = value;
    }
  });

  // Remove empty categories
  Object.keys(specifications).forEach(key => {
    if (Object.keys(specifications[key]).length === 0) {
      delete specifications[key];
    }
  });

  return specifications;
};

/**
 * Transform raw part data from API to the format expected by the component
 * @param {Object} rawData - The raw part data from API
 * @returns {Object} Transformed part data
 */
export const transformPartData = (rawData) => {
  return {
    partNumber: rawData.part_number,
    manufacturer: rawData.manufacturer || 'Unknown',
    description: `${rawData.category2 || ''} - ${rawData.series || ''} Series`.trim(),
    category: rawData.category1 || 'Electronic Components',
    subcategory: rawData.category2 || '',
    image: 'https://via.placeholder.com/400x300/f0f0f0/666?text=' + encodeURIComponent(rawData.part_number),
    stock: rawData.quantity_available ? parseInt(rawData.quantity_available.split('\\n')[0]) || 0 : 0,
    leadTime: rawData.quantity_available && rawData.quantity_available.includes('In Stock') ? 'In Stock' : 'Check Lead Time',
    specifications: categorizeSpecifications(rawData),
    // Preserve mock data for sections we'll integrate later
    suppliers: [],
    documents: [],
    relatedParts: [],
    // Store raw data for reference
    rawData: rawData
  };
};