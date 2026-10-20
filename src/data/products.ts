export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  /** Synthetic prices are in integer INR units, not paise. */
  readonly price: number;
  readonly inStock: boolean;
}

// Fixed ID order is the API's ordering contract; requests never sort or mutate it.
export const products: readonly Product[] = [
  { id: 'prod-001', name: 'Quiet Click Wireless Mouse', category: 'Accessories', price: 799, inStock: true },
  { id: 'prod-002', name: 'Compact Mechanical Keyboard', category: 'Accessories', price: 2499, inStock: true },
  { id: 'prod-003', name: 'Braided USB-C Cable', category: 'Accessories', price: 349, inStock: false },
  { id: 'prod-004', name: 'Adjustable Laptop Stand', category: 'Office', price: 1299, inStock: true },
  { id: 'prod-005', name: 'Felt Desk Mat', category: 'Office', price: 599, inStock: true },
  { id: 'prod-006', name: 'Dimmable Task Lamp', category: 'Lighting', price: 1899, inStock: false },
  { id: 'prod-007', name: 'Insulated Travel Mug', category: 'Kitchen', price: 899, inStock: true },
  { id: 'prod-008', name: 'Glass Water Bottle', category: 'Kitchen', price: 649, inStock: true },
  { id: 'prod-009', name: 'Bamboo Drawer Organizer', category: 'Home', price: 749, inStock: false },
  { id: 'prod-010', name: 'Cotton Cushion Cover', category: 'Home', price: 399, inStock: true },
  { id: 'prod-011', name: 'Portable Bluetooth Speaker', category: 'Audio', price: 2199, inStock: true },
  { id: 'prod-012', name: 'Wired Studio Headphones', category: 'Audio', price: 3299, inStock: false },
  { id: 'prod-013', name: 'Clip-On Reading Light', category: 'Lighting', price: 499, inStock: true },
  { id: 'prod-014', name: 'A5 Dotted Notebook', category: 'Stationery', price: 249, inStock: true },
  { id: 'prod-015', name: 'Refillable Rollerball Pen', category: 'Stationery', price: 199, inStock: false },
  { id: 'prod-016', name: 'Cork Notice Board', category: 'Office', price: 1099, inStock: true },
  { id: 'prod-017', name: 'Canvas Everyday Tote', category: 'Travel', price: 549, inStock: true },
  { id: 'prod-018', name: 'Packing Cube Set', category: 'Travel', price: 1199, inStock: false },
  { id: 'prod-019', name: 'Non-Slip Yoga Mat', category: 'Fitness', price: 1399, inStock: true },
  { id: 'prod-020', name: 'Resistance Band Set', category: 'Fitness', price: 699, inStock: true },
  { id: 'prod-021', name: 'Ceramic Planter', category: 'Garden', price: 459, inStock: false },
  { id: 'prod-022', name: 'Indoor Watering Can', category: 'Garden', price: 579, inStock: true },
  { id: 'prod-023', name: 'Microfiber Cleaning Cloth Set', category: 'Home', price: 299, inStock: true },
];
