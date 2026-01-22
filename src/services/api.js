// API Service for Component Search
const API_BASE_URL = 'https://obkg1pw61g.execute-api.us-west-2.amazonaws.com/prod/cs';

/**
 * Fetch all categories with their counts
 * @returns {Promise<Array>} Array of category objects with 'category' and 'count' fields
 */
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetch subcategories for a specific category
 * @param {string} category - The category name
 * @returns {Promise<Array>} Array of subcategory objects with 'subcategory' and 'count' fields
 */
export const fetchSubcategories = async (category) => {
  try {
    const encodedCategory = encodeURIComponent(category);
    const response = await fetch(`${API_BASE_URL}/category/${encodedCategory}/subcategories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subcategories: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching subcategories for ${category}:`, error);
    throw error;
  }
};

/**
 * Map category names to appropriate icons
 * @param {string} categoryName - The category name
 * @returns {string} Icon name for FontAwesome
 */
export const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Integrated Circuits ICs': 'faMicrochip',
    'Electromechanical': 'faGears',
    'Circuit Protection': 'faShieldAlt',
    'Power Products': 'faBatteryFull',
    'Discrete Semiconductors': 'faMemory',
    'Optoelectronics': 'faLightbulb',
    'Sensors': 'faSatelliteDish',
    'Passive Components': 'faMemory',
    'Connectors': 'faPlug',
    'RF & Wireless': 'faWifi',
    'Development Tools': 'faTools'
  };
  
  return iconMap[categoryName] || 'faMicrochip'; // Default icon
};
