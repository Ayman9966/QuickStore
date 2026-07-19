import { Product, StoreSettings } from '../types';

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "La Dolce Vita Cafe",
  logoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&h=150&fit=crop&q=80",
  primaryColor: "#f59e0b", // Amber
  currencySymbol: "$",
  whatsappNumber: "+1234567890",
  businessType: 'food',
  language: 'en',
  viewMode: 'cards',
  isSubscribed: false,
  adminPasscode: '1234'
};

export const SAMPLE_PRODUCTS: Product[] = [
  // Espresso & Beverages
  {
    id: "1",
    name: "Tuscan Cappuccino",
    price: 4.50,
    description: "Rich espresso topped with deep layer of warm frothy milk, dusted with organic cocoa powder.",
    category: "Espresso & Beverages",
    image_url: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "2",
    name: "Iced Caramel Macchiato",
    price: 5.25,
    description: "Chilled milk with vanilla syrup, marked with espresso and drizzled with buttery caramel sauce.",
    category: "Espresso & Beverages",
    image_url: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "3",
    name: "Sicilian Orange Lemonade",
    price: 3.75,
    description: "Freshly squeezed Sicilian lemons and blood oranges with sparkling spring water and fresh mint.",
    category: "Espresso & Beverages",
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "4",
    name: "Classic Espresso Shot",
    price: 2.75,
    description: "Full-bodied single shot of our signature house blend with a thick, golden crema.",
    category: "Espresso & Beverages",
    image_url: "https://images.unsplash.com/photo-1510707577719-0d158551984c?w=500&auto=format&fit=crop&q=80"
  },
  
  // Pizzas & Paninis
  {
    id: "5",
    name: "Margherita Basilico Pizza",
    price: 12.99,
    description: "Stone-baked thin crust, San Marzano tomato sauce, fresh buffalo mozzarella, extra virgin olive oil, and sweet basil leaves.",
    category: "Pizzas & Paninis",
    image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "6",
    name: "Prosciutto & Arugula Panini",
    price: 10.50,
    description: "Crispy ciabatta bread stuffed with premium cured prosciutto, baby arugula, sliced tomatoes, and creamy pesto aioli.",
    category: "Pizzas & Paninis",
    image_url: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "7",
    name: "Truffle Mushroom Pizza",
    price: 14.50,
    description: "Wild portobello and cremini mushrooms, white truffle oil, fontina cheese, caramelized onions, and fresh thyme.",
    category: "Pizzas & Paninis",
    image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "8",
    name: "Grilled Caprese Panini",
    price: 9.25,
    description: "Thick sourdough, ripe vine tomatoes, fresh mozzarella rounds, basil leaves, and balsamic reduction glaze, pressed until melted.",
    category: "Pizzas & Paninis",
    image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80"
  },

  // Dolci (Desserts)
  {
    id: "9",
    name: "Espresso Tiramisu Classico",
    price: 6.99,
    description: "Layers of espresso-soaked ladyfingers and velvety mascarpone cream, heavily dusted with premium dark cocoa powder.",
    category: "Dolci (Desserts)",
    image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "10",
    name: "Warm Chocolate Lava Cake",
    price: 7.50,
    description: "Decadent dark chocolate cake with a rich liquid warm center, served with fresh raspberries and powdered sugar.",
    category: "Dolci (Desserts)",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "11",
    name: "Strawberry Panna Cotta",
    price: 5.99,
    description: "Silky, chilled vanilla bean cream custard topped with a sweet, vibrant strawberry coulis and fresh strawberry slices.",
    category: "Dolci (Desserts)",
    image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80"
  }
];

export const CSV_TEMPLATE_STRING = `name,price,description,category,image_url
Tuscan Cappuccino,4.50,Rich espresso topped with deep layer of warm frothy milk dusted with organic cocoa powder,Espresso & Beverages,https://images.unsplash.com/photo-1534778101976-62847782c213?w=500
Iced Caramel Macchiato,5.25,Chilled milk with vanilla syrup marked with espresso and drizzled with caramel,Espresso & Beverages,https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500
Margherita Basilico Pizza,12.99,Stone-baked thin crust San Marzano tomato sauce fresh buffalo mozzarella and fresh basil,Pizzas & Paninis,https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500
Prosciutto & Arugula Panini,10.50,Crispy ciabatta stuffed with premium cured prosciutto arugula tomato and pesto aioli,Pizzas & Paninis,https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500
Espresso Tiramisu Classico,6.99,Layers of espresso-soaked ladyfingers and velvety mascarpone cream dusted with cocoa,Dolci (Desserts),https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500
`;
