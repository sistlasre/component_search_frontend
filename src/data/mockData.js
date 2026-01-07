// Mock data for electronic components

export const categories = [
  { id: 1, name: "Semiconductors", icon: "faMicrochip", count: "2.5M+" },
  { id: 2, name: "Passive Components", icon: "faMemory", count: "1.8M+" },
  { id: 3, name: "Connectors", icon: "faPlug", count: "950K+" },
  { id: 4, name: "Sensors", icon: "faSatelliteDish", count: "450K+" },
  { id: 5, name: "Power Management", icon: "faBatteryFull", count: "380K+" },
  { id: 6, name: "RF & Wireless", icon: "faWifi", count: "290K+" },
  { id: 7, name: "Optoelectronics", icon: "faLightbulb", count: "220K+" },
  { id: 8, name: "Development Tools", icon: "faTools", count: "180K+" }
];

export const featuredManufacturers = [
  "Texas Instruments", "Analog Devices", "STMicroelectronics", "Microchip",
  "NXP", "Infineon", "Broadcom", "Intel", "AMD", "Qualcomm"
];

export const featuredParts = [
  {
    id: 1,
    partNumber: "STM32F103C8T6",
    manufacturer: "STMicroelectronics",
    description: "ARM Cortex-M3 32-bit Microcontroller, 64KB Flash, 20KB RAM, 72MHz",
    category: "Microcontrollers",
    image: "https://via.placeholder.com/200x150/f0f0f0/666?text=STM32F103",
    price: "$2.85",
    stock: 15420,
    leadTime: "In Stock",
    datasheet: "/datasheets/STM32F103C8T6.pdf"
  },
  {
    id: 2,
    partNumber: "LM358N",
    manufacturer: "Texas Instruments",
    description: "Dual Operational Amplifier, DIP-8 Package",
    category: "Amplifiers",
    image: "https://via.placeholder.com/200x150/f0f0f0/666?text=LM358N",
    price: "$0.45",
    stock: 42300,
    leadTime: "In Stock",
    datasheet: "/datasheets/LM358N.pdf"
  },
  {
    id: 3,
    partNumber: "ESP32-WROOM-32",
    manufacturer: "Espressif",
    description: "Wi-Fi+BT+BLE MCU Module, 4MB Flash",
    category: "RF Modules",
    image: "https://via.placeholder.com/200x150/f0f0f0/666?text=ESP32",
    price: "$3.20",
    stock: 8950,
    leadTime: "In Stock",
    datasheet: "/datasheets/ESP32-WROOM-32.pdf"
  },
  {
    id: 4,
    partNumber: "1N4148",
    manufacturer: "Multiple",
    description: "Small Signal Fast Switching Diode, DO-35",
    category: "Diodes",
    image: "https://via.placeholder.com/200x150/f0f0f0/666?text=1N4148",
    price: "$0.02",
    stock: 185000,
    leadTime: "In Stock",
    datasheet: "/datasheets/1N4148.pdf"
  },
  {
    id: 5,
    partNumber: "ATMEGA328P-PU",
    manufacturer: "Microchip",
    description: "8-bit AVR Microcontroller, 32KB Flash, DIP-28",
    category: "Microcontrollers",
    image: "https://via.placeholder.com/200x150/f0f0f0/666?text=ATMEGA328",
    price: "$3.50",
    stock: 6780,
    leadTime: "In Stock",
    datasheet: "/datasheets/ATMEGA328P.pdf"
  },
  {
    id: 6,
    partNumber: "NE555P",
    manufacturer: "Texas Instruments",
    description: "Precision Timer IC, DIP-8",
    category: "Timers",
    image: "https://via.placeholder.com/200x150/f0f0f0/666?text=NE555",
    price: "$0.35",
    stock: 52100,
    leadTime: "In Stock",
    datasheet: "/datasheets/NE555.pdf"
  },
  {
    id: 7,
    partNumber: "74HC595",
    manufacturer: "NXP",
    description: "8-bit Serial-In/Parallel-Out Shift Register",
    category: "Logic ICs",
    image: "https://via.placeholder.com/200x150/f0f0f0/666?text=74HC595",
    price: "$0.28",
    stock: 31500,
    leadTime: "In Stock",
    datasheet: "/datasheets/74HC595.pdf"
  },
  {
    id: 8,
    partNumber: "LM7805",
    manufacturer: "STMicroelectronics",
    description: "5V 1A Positive Voltage Regulator, TO-220",
    category: "Voltage Regulators",
    image: "https://via.placeholder.com/200x150/f0f0f0/666?text=LM7805",
    price: "$0.48",
    stock: 28900,
    leadTime: "In Stock",
    datasheet: "/datasheets/LM7805.pdf"
  }
];

// Detailed part information (for part detail page)
export const getPartDetails = (partNumber) => {
  const basicInfo = featuredParts.find(p => p.partNumber === partNumber);
  
  if (!basicInfo) {
    return null;
  }

  return {
    ...basicInfo,
    specifications: {
      "General": {
        "Manufacturer": basicInfo.manufacturer,
        "Part Number": basicInfo.partNumber,
        "Category": basicInfo.category,
        "Series": "Standard",
        "Packaging": "Tape & Reel",
        "Part Status": "Active"
      },
      "Technical": {
        "Operating Temperature": "-40°C ~ 85°C",
        "Supply Voltage": "2.7V ~ 5.5V",
        "Package / Case": "DIP-8",
        "Mounting Type": "Through Hole",
        "Lead Spacing": "2.54mm",
        "RoHS Status": "RoHS Compliant"
      },
      "Environmental": {
        "Moisture Sensitivity": "MSL 1",
        "Lead Free": "Yes",
        "REACH Status": "Compliant",
        "Export Control": "ECCN 5A992.c"
      }
    },
    suppliers: [
      {
        name: "Digi-Key Electronics",
        partNumber: basicInfo.partNumber,
        stock: Math.floor(basicInfo.stock * 0.3),
        moq: 1,
        price: [
          { qty: 1, price: parseFloat(basicInfo.price.replace('$', '')) },
          { qty: 10, price: parseFloat(basicInfo.price.replace('$', '')) * 0.95 },
          { qty: 100, price: parseFloat(basicInfo.price.replace('$', '')) * 0.85 },
          { qty: 1000, price: parseFloat(basicInfo.price.replace('$', '')) * 0.75 }
        ],
        leadTime: "Ships Today"
      },
      {
        name: "Mouser Electronics",
        partNumber: basicInfo.partNumber,
        stock: Math.floor(basicInfo.stock * 0.25),
        moq: 1,
        price: [
          { qty: 1, price: parseFloat(basicInfo.price.replace('$', '')) * 1.02 },
          { qty: 10, price: parseFloat(basicInfo.price.replace('$', '')) * 0.97 },
          { qty: 100, price: parseFloat(basicInfo.price.replace('$', '')) * 0.87 },
          { qty: 1000, price: parseFloat(basicInfo.price.replace('$', '')) * 0.77 }
        ],
        leadTime: "Ships Today"
      },
      {
        name: "Arrow Electronics",
        partNumber: basicInfo.partNumber,
        stock: Math.floor(basicInfo.stock * 0.2),
        moq: 10,
        price: [
          { qty: 10, price: parseFloat(basicInfo.price.replace('$', '')) * 0.98 },
          { qty: 100, price: parseFloat(basicInfo.price.replace('$', '')) * 0.88 },
          { qty: 1000, price: parseFloat(basicInfo.price.replace('$', '')) * 0.78 }
        ],
        leadTime: "Ships in 2 days"
      },
      {
        name: "Newark",
        partNumber: basicInfo.partNumber,
        stock: Math.floor(basicInfo.stock * 0.15),
        moq: 5,
        price: [
          { qty: 5, price: parseFloat(basicInfo.price.replace('$', '')) * 1.05 },
          { qty: 50, price: parseFloat(basicInfo.price.replace('$', '')) * 0.92 },
          { qty: 500, price: parseFloat(basicInfo.price.replace('$', '')) * 0.82 }
        ],
        leadTime: "Ships in 3 days"
      },
      {
        name: "RS Components",
        partNumber: basicInfo.partNumber,
        stock: Math.floor(basicInfo.stock * 0.1),
        moq: 1,
        price: [
          { qty: 1, price: parseFloat(basicInfo.price.replace('$', '')) * 1.08 },
          { qty: 25, price: parseFloat(basicInfo.price.replace('$', '')) * 0.95 },
          { qty: 250, price: parseFloat(basicInfo.price.replace('$', '')) * 0.85 }
        ],
        leadTime: "Ships in 5 days"
      }
    ],
    relatedParts: featuredParts.filter(p => 
      p.category === basicInfo.category && p.partNumber !== basicInfo.partNumber
    ).slice(0, 4),
    documents: [
      { type: "Datasheet", name: `${basicInfo.partNumber}_Datasheet.pdf`, size: "2.3 MB" },
      { type: "Application Note", name: `${basicInfo.partNumber}_AppNote.pdf`, size: "1.1 MB" },
      { type: "3D Model", name: `${basicInfo.partNumber}_3D.step`, size: "450 KB" },
      { type: "PCB Footprint", name: `${basicInfo.partNumber}_Footprint.zip`, size: "25 KB" }
    ]
  };
};

// Search results
export const searchParts = (query) => {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  return featuredParts.filter(part => 
    part.partNumber.toLowerCase().includes(lowerQuery) ||
    part.description.toLowerCase().includes(lowerQuery) ||
    part.manufacturer.toLowerCase().includes(lowerQuery) ||
    part.category.toLowerCase().includes(lowerQuery)
  );
};