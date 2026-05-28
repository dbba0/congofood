/**
 * Seed MongoDB — données réalistes pour le MVP Wapi à Kinshasa
 *
 * Usage : cd backend && npm run seed
 * Vide les collections Restaurant + Product avant insertion.
 */
import mongoose from 'mongoose';
import { env } from '../config/env';
import { RestaurantModel } from '../models/Restaurant';
import { ProductModel } from '../models/Product';

// ─── Types utilitaires ───────────────────────────────────────────────

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  category: string;
}

interface SeedRestaurant {
  name: string;
  description: string;
  category: 'food' | 'grocery' | 'pharmacy' | 'other';
  address: {
    label: string;
    coords: { lat: number; lng: number };
    quartier: string;
  };
  isOpen: boolean;
  estimatedPrepTime: number;
  rating: { avg: number; count: number };
  deliveryRadius: number;
  minOrderAmount: number;
  products: SeedProduct[];
}

// ─── Données ─────────────────────────────────────────────────────────

const RESTAURANTS: SeedRestaurant[] = [
  // ── 1. Chez Ntemba ────────────────────────────────────────────────
  {
    name: 'Chez Ntemba',
    description: 'Congolais',
    category: 'food',
    address: { label: 'Avenue du Commerce, Gombe', coords: { lat: -4.3217, lng: 15.3222 }, quartier: 'Gombe' },
    isOpen: true,
    estimatedPrepTime: 30,
    rating: { avg: 4.8, count: 287 },
    deliveryRadius: 5,
    minOrderAmount: 5000,
    products: [
      { name: 'Poulet à la moambe', price: 18000, category: 'Plats principaux', description: 'Poulet mijoté dans une sauce de noix de palme, servi avec riz et chikwangue' },
      { name: 'Saka-saka au poisson', price: 15000, category: 'Plats principaux', description: 'Feuilles de manioc pilées au poisson salé et huile de palme rouge' },
      { name: 'Liboke de poisson', price: 20000, category: 'Plats principaux', description: 'Poisson entier cuit en papillote de feuilles de bananier avec épices locales' },
      { name: 'Chikwangue + sauce', price: 8000, category: 'Accompagnements', description: 'Pâte de manioc fermentée accompagnée d\'une sauce maison' },
      { name: 'Fanta orange 50cl', price: 2000, category: 'Boissons', description: 'Fanta orange bien fraîche' },
      { name: 'Eau Bel\'Eau 75cl', price: 1500, category: 'Boissons', description: 'Eau minérale naturelle' },
    ],
  },

  // ── 2. Maman Lola ────────────────────────────────────────────────
  {
    name: 'Maman Lola',
    description: 'Congolais',
    category: 'food',
    address: { label: 'Boulevard du 30 Juin, Gombe', coords: { lat: -4.3198, lng: 15.3156 }, quartier: 'Gombe' },
    isOpen: true,
    estimatedPrepTime: 25,
    rating: { avg: 4.6, count: 412 },
    deliveryRadius: 4,
    minOrderAmount: 5000,
    products: [
      { name: 'Poulet rôti entier', price: 22000, category: 'Plats principaux', description: 'Poulet fermier rôti aux épices congolaises, servi avec frites et sauce pili-pili' },
      { name: 'Bibwita grillé', price: 16000, category: 'Plats principaux', description: 'Poisson fumé grillé servi avec banane plantain et légumes' },
      { name: 'Banane plantain frite', price: 5000, category: 'Accompagnements', description: 'Bananes plantains mûres frites à la perfection' },
      { name: 'Pondu au poulet', price: 14000, category: 'Plats principaux', description: 'Feuilles de manioc cuisinées avec morceaux de poulet' },
      { name: 'Jus de bissap', price: 3000, category: 'Boissons', description: 'Jus d\'hibiscus frais fait maison' },
      { name: 'Eau Tembo 1L', price: 2000, category: 'Boissons', description: 'Eau purifiée Tembo grand format' },
    ],
  },

  // ── 3. Pili-Pili Grillades ────────────────────────────────────────
  {
    name: 'Pili-Pili Grillades',
    description: 'Grillades',
    category: 'food',
    address: { label: 'Avenue de la Libération, Gombe', coords: { lat: -4.3245, lng: 15.3189 }, quartier: 'Gombe' },
    isOpen: true,
    estimatedPrepTime: 20,
    rating: { avg: 4.7, count: 356 },
    deliveryRadius: 4,
    minOrderAmount: 8000,
    products: [
      { name: 'Brochettes de chèvre (6 pics)', price: 12000, category: 'Grillades', description: 'Brochettes de chèvre marinées, grillées au charbon de bois' },
      { name: 'Poulet braisé demi', price: 15000, category: 'Grillades', description: 'Demi-poulet braisé au charbon, sauce pili-pili maison' },
      { name: 'Brochettes mixtes (bœuf+chèvre)', price: 14000, category: 'Grillades', description: 'Assortiment de brochettes bœuf et chèvre avec sauce tomate piquante' },
      { name: 'Frites maison', price: 4000, category: 'Accompagnements', description: 'Frites de pommes de terre fraîches' },
      { name: 'Bière Primus 65cl', price: 4000, category: 'Boissons', description: 'Bière locale Primus bien glacée' },
      { name: 'Coca-Cola 50cl', price: 2000, category: 'Boissons', description: 'Coca-Cola classique' },
    ],
  },

  // ── 4. Chez Philo ────────────────────────────────────────────────
  {
    name: 'Chez Philo',
    description: 'Congolais',
    category: 'food',
    address: { label: 'Avenue du Colonel Ebeya, Gombe', coords: { lat: -4.3232, lng: 15.3201 }, quartier: 'Gombe' },
    isOpen: true,
    estimatedPrepTime: 35,
    rating: { avg: 4.5, count: 198 },
    deliveryRadius: 5,
    minOrderAmount: 5000,
    products: [
      { name: 'Moambe de poulet', price: 17000, category: 'Plats principaux', description: 'Poulet traditionnel en sauce moambe épaisse, riz blanc' },
      { name: 'Poisson braisé + pondu', price: 19000, category: 'Plats principaux', description: 'Poisson du fleuve braisé accompagné de feuilles de manioc' },
      { name: 'Riz sauce gombo', price: 10000, category: 'Plats principaux', description: 'Riz blanc servi avec sauce gombo aux crevettes séchées' },
      { name: 'Mbisi ya mabele', price: 16000, category: 'Plats principaux', description: 'Viande de chèvre en sauce rouge épicée' },
      { name: 'Jus de maracuja', price: 3500, category: 'Boissons', description: 'Jus de fruit de la passion frais' },
      { name: 'Eau minérale 50cl', price: 1500, category: 'Boissons', description: 'Eau minérale naturelle' },
    ],
  },

  // ── 5. Chez Bibi Fast Food ────────────────────────────────────────
  {
    name: 'Chez Bibi Fast Food',
    description: 'Fast-food',
    category: 'food',
    address: { label: 'Boulevard du 30 Juin, Gombe', coords: { lat: -4.3178, lng: 15.3134 }, quartier: 'Gombe' },
    isOpen: true,
    estimatedPrepTime: 15,
    rating: { avg: 4.3, count: 523 },
    deliveryRadius: 6,
    minOrderAmount: 3000,
    products: [
      { name: 'Poulet frit 2 morceaux', price: 9000, category: 'Fast food', description: '2 morceaux de poulet frit croustillant, sauce ketchup' },
      { name: 'Burger Kinois', price: 10000, category: 'Fast food', description: 'Burger avec steak haché local, crudités, sauce spéciale maison' },
      { name: 'Frites + poulet (menu)', price: 12000, category: 'Fast food', description: 'Menu complet : frites + 2 morceaux poulet + boisson' },
      { name: 'Sandwich poulet', price: 7000, category: 'Fast food', description: 'Sandwich chaud au poulet effiloché et légumes' },
      { name: 'Jus d\'orange pressé', price: 3000, category: 'Boissons', description: 'Jus d\'orange fraîchement pressé' },
      { name: 'Eau 50cl', price: 1500, category: 'Boissons', description: 'Eau minérale 50cl' },
    ],
  },

  // ── 6. Chez Maman Colonel Grillades ───────────────────────────────
  {
    name: 'Chez Maman Colonel Grillades',
    description: 'Grillades',
    category: 'food',
    address: { label: 'Avenue Bokassa, Lingwala', coords: { lat: -4.3089, lng: 15.3267 }, quartier: 'Lingwala' },
    isOpen: true,
    estimatedPrepTime: 25,
    rating: { avg: 4.7, count: 634 },
    deliveryRadius: 5,
    minOrderAmount: 8000,
    products: [
      { name: 'Poulet braisé entier', price: 28000, category: 'Grillades', description: 'Poulet entier braisé au charbon, marinade secrète de Maman Colonel' },
      { name: 'Côtes de porc grillées', price: 20000, category: 'Grillades', description: 'Côtes de porc marinées et grillées au charbon vif' },
      { name: 'Brochettes mixtes 8 pics', price: 16000, category: 'Grillades', description: '8 brochettes assorties viandes et légumes' },
      { name: 'Salade de crudités', price: 5000, category: 'Accompagnements', description: 'Salade fraîche tomates, concombre, oignon et vinaigrette' },
      { name: 'Bière Mutzig 65cl', price: 4500, category: 'Boissons', description: 'Bière Mutzig premium bien glacée' },
      { name: 'Fanta citron 50cl', price: 2000, category: 'Boissons', description: 'Fanta citron fraîche' },
    ],
  },

  // ── 7. Madelia Fast Food ──────────────────────────────────────────
  {
    name: 'Madelia Fast Food',
    description: 'Fast-food',
    category: 'food',
    address: { label: 'Avenue Kasaï, Gombe', coords: { lat: -4.3156, lng: 15.3098 }, quartier: 'Gombe' },
    isOpen: true,
    estimatedPrepTime: 12,
    rating: { avg: 4.2, count: 445 },
    deliveryRadius: 4,
    minOrderAmount: 3000,
    products: [
      { name: 'Burger Classic', price: 9000, category: 'Fast food', description: 'Burger bœuf, fromage fondu, salade, tomate' },
      { name: 'Chicken wings (6 pcs)', price: 10000, category: 'Fast food', description: 'Ailes de poulet croustillantes sauce barbecue' },
      { name: 'Hot-dog maison', price: 7000, category: 'Fast food', description: 'Saucisse grillée dans pain brioche, moutarde et ketchup' },
      { name: 'Frites grandes', price: 4500, category: 'Accompagnements', description: 'Grande portion de frites croustillantes' },
      { name: 'Milkshake chocolat', price: 5000, category: 'Boissons', description: 'Milkshake épais au chocolat' },
      { name: 'Eau 50cl', price: 1500, category: 'Boissons', description: 'Eau minérale 50cl' },
    ],
  },
];

// ─── Script principal ────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Démarrage du seed Wapi...\n');

  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ MongoDB connecté');

  // Vider les collections
  await RestaurantModel.deleteMany({});
  await ProductModel.deleteMany({});
  console.log('🗑️  Collections Restaurant + Product vidées\n');

  // Créer un owner factice pour les restaurants (champ obligatoire)
  const fakeOwnerId = new mongoose.Types.ObjectId();

  let totalProducts = 0;

  for (const data of RESTAURANTS) {
    // Créer le restaurant
    const restaurant = await RestaurantModel.create({
      owner: fakeOwnerId,
      name: data.name,
      description: data.description,
      category: data.category,
      address: data.address,
      isOpen: data.isOpen,
      estimatedPrepTime: data.estimatedPrepTime,
      rating: data.rating,
      deliveryRadius: data.deliveryRadius,
      minOrderAmount: data.minOrderAmount,
      isVerified: true,
    });

    // Créer les produits liés
    const products = await ProductModel.insertMany(
      data.products.map((p) => ({
        restaurant: restaurant._id,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: 'CDF',
        category: p.category,
        isAvailable: true,
      }))
    );

    totalProducts += products.length;
    console.log(`  🍽️  ${data.name} — ${products.length} produits`);
  }

  console.log(`\n✅ Seed terminé ! ${RESTAURANTS.length} restaurants, ${totalProducts} produits créés.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erreur seed :', err);
  process.exit(1);
});
