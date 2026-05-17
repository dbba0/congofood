import express from 'express';
import request from 'supertest';

// ── Mocks ─────────────────────────────────────────────────────────────────

let mockUserRole = 'restaurant';
let mockUserId   = 'owner_123';

jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = { userId: mockUserId, role: mockUserRole as never, phone: '+243000000000', iat: 0, exp: 0 };
    next();
  }),
  requireRole: (...roles: string[]) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (roles.includes(req.user?.role ?? '')) return next();
      res.status(403).json({ success: false, error: 'Accès refusé' });
    },
}));

const mockRestaurantFind       = jest.fn();
const mockRestaurantFindById   = jest.fn();
const mockRestaurantCountDocuments = jest.fn();
const mockRestaurantExists     = jest.fn();
const mockRestaurantSave       = jest.fn();

jest.mock('../models/Restaurant', () => ({
  RestaurantModel: {
    find:           mockRestaurantFind,
    findById:       mockRestaurantFindById,
    exists:         mockRestaurantExists,
    countDocuments: mockRestaurantCountDocuments,
  },
}));

const mockProductFind = jest.fn();

jest.mock('../models/Product', () => ({
  ProductModel: {
    find: mockProductFind,
  },
}));

// ── App de test ────────────────────────────────────────────────────────────

import restaurantRoutes from './restaurants';

const app = express();
app.use(express.json());
app.use('/api/restaurants', restaurantRoutes);

// ── Fixtures ───────────────────────────────────────────────────────────────

function fakeRestaurant(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'resto_001',
    name: 'Poulet Ya Biso',
    category: 'food',
    isOpen: true,
    rating: { avg: 4.5, count: 120 },
    address: { quartier: 'Gombe', label: 'Av. Paix', coords: { lat: -4.3, lng: 15.3 } },
    owner: 'owner_123',
    save: mockRestaurantSave,
    ...overrides,
  };
}

function fakeProducts() {
  return [
    { _id: 'prod_1', name: 'Poulet braisé', category: 'Plats principaux', isAvailable: true, price: 5000 },
    { _id: 'prod_2', name: 'Fanta Orange',  category: 'Boissons',          isAvailable: true, price: 1500 },
    { _id: 'prod_3', name: 'Riz blanc',     category: 'Plats principaux', isAvailable: true, price: 2000 },
  ];
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRestaurantSave.mockResolvedValue(undefined);
});

// ── GET /api/restaurants ───────────────────────────────────────────────────

describe('GET /api/restaurants', () => {
  it('retourne une liste paginée des restaurants ouverts', async () => {
    const restaurants = [fakeRestaurant()];
    mockRestaurantFind.mockReturnValue({
      sort:  jest.fn().mockReturnThis(),
      skip:  jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(restaurants),
    });
    mockRestaurantCountDocuments.mockResolvedValue(1);

    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.restaurants).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.totalPages).toBe(1);

    // Vérifie que le filtre isOpen:true est appliqué
    expect(mockRestaurantFind).toHaveBeenCalledWith(
      expect.objectContaining({ isOpen: true })
    );
  });

  it('filtre par quartier (case-insensitive)', async () => {
    mockRestaurantFind.mockReturnValue({
      sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([fakeRestaurant()]),
    });
    mockRestaurantCountDocuments.mockResolvedValue(1);

    await request(app).get('/api/restaurants?quartier=Gombe');

    expect(mockRestaurantFind).toHaveBeenCalledWith(
      expect.objectContaining({
        'address.quartier': { $regex: 'Gombe', $options: 'i' },
      })
    );
  });

  it('filtre par catégorie food', async () => {
    mockRestaurantFind.mockReturnValue({
      sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    mockRestaurantCountDocuments.mockResolvedValue(0);

    await request(app).get('/api/restaurants?category=food');

    expect(mockRestaurantFind).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'food' })
    );
  });

  it('filtre par search (regex sur le nom)', async () => {
    mockRestaurantFind.mockReturnValue({
      sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    mockRestaurantCountDocuments.mockResolvedValue(0);

    await request(app).get('/api/restaurants?search=poulet');

    expect(mockRestaurantFind).toHaveBeenCalledWith(
      expect.objectContaining({ name: { $regex: 'poulet', $options: 'i' } })
    );
  });
});

// ── GET /api/restaurants/:id ───────────────────────────────────────────────

describe('GET /api/restaurants/:id', () => {
  it('retourne le restaurant avec le menu groupé par catégorie', async () => {
    mockRestaurantFindById.mockResolvedValue(fakeRestaurant());
    mockProductFind.mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeProducts()),
    });

    const res = await request(app).get('/api/restaurants/resto_001');

    expect(res.status).toBe(200);
    expect(res.body.data.restaurant.name).toBe('Poulet Ya Biso');
    expect(res.body.data.menu).toHaveProperty('Plats principaux');
    expect(res.body.data.menu).toHaveProperty('Boissons');
    expect(res.body.data.menu['Plats principaux']).toHaveLength(2);
    expect(res.body.data.menu['Boissons']).toHaveLength(1);
  });

  it('retourne 404 si le restaurant n\'existe pas', async () => {
    mockRestaurantFindById.mockResolvedValue(null);

    const res = await request(app).get('/api/restaurants/inexistant');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ── GET /api/restaurants/:id/products ─────────────────────────────────────

describe('GET /api/restaurants/:id/products', () => {
  it('retourne les produits disponibles du restaurant', async () => {
    mockRestaurantExists.mockResolvedValue(true);
    mockProductFind.mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeProducts()),
    });

    const res = await request(app).get('/api/restaurants/resto_001/products');

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(3);
  });

  it('filtre par catégorie si fournie', async () => {
    mockRestaurantExists.mockResolvedValue(true);
    mockProductFind.mockReturnValue({
      sort: jest.fn().mockResolvedValue([fakeProducts()[0]]),
    });

    await request(app).get('/api/restaurants/resto_001/products?category=Plats+principaux');

    expect(mockProductFind).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Plats principaux' })
    );
  });

  it('retourne 404 si le restaurant n\'existe pas', async () => {
    mockRestaurantExists.mockResolvedValue(null);

    const res = await request(app).get('/api/restaurants/inexistant/products');

    expect(res.status).toBe(404);
  });
});
