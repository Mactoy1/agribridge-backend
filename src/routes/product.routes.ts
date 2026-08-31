import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, skip = '0', take = '20', sortBy = 'createdAt', order = 'desc' } = req.query;

    const where = category ? { category: String(category) } : {};
    const orderBy = { [String(sortBy)]: String(order).toLowerCase() };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { farmer: { select: { id: true, name: true, email: true } } },
        orderBy,
        skip: Number(skip),
        take: Math.min(Number(take), 100), // Limit to 100 per request
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      data: products,
      pagination: {
        total,
        skip: Number(skip),
        take: Number(take),
        hasMore: Number(skip) + Number(take) < total,
      },
    });
  } catch (error) {
    console.error('[PRODUCTS_LIST_ERROR]', error);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { farmer: { select: { id: true, name: true, email: true } } },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error('[PRODUCTS_GET_ERROR]', error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Create product (Farmer only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user?.role !== 'FARMER') {
      return res.status(403).json({ message: 'Only farmers can create products' });
    }

    const { name, category, description, price, stock, imageUrl } = req.body;

    // Validation
    if (!name || !category || price === undefined) {
      return res.status(400).json({
        message: 'Name, category, and price are required',
        fields: { name: !name, category: !category, price: price === undefined },
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (typeof stock !== 'undefined' && (typeof stock !== 'number' || stock < 0)) {
      return res.status(400).json({ message: 'Stock must be a positive number' });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({ message: 'Product name must be at least 3 characters' });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        description: description?.trim() || null,
        price: Number(price),
        stock: Number(stock || 0),
        imageUrl: imageUrl?.trim() || null,
        farmerId: req.user!.id,
      },
      include: { farmer: { select: { id: true, name: true, email: true } } },
    });

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('[PRODUCTS_CREATE_ERROR]', error);
    return res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update product (Farmer only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== 'FARMER') {
      return res.status(403).json({ message: 'Only farmers can update products' });
    }

    const id = String(req.params.id);
    const { name, category, description, price, stock, imageUrl } = req.body;

    // Check if product exists and belongs to user
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmerId !== req.user!.id) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    // Update product
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(category && { category: category.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
      },
      include: { farmer: { select: { id: true, name: true, email: true } } },
    });

    return res.json({
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    console.error('[PRODUCTS_UPDATE_ERROR]', error);
    return res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete product (Farmer only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user?.role !== 'FARMER') {
      return res.status(403).json({ message: 'Only farmers can delete products' });
    }

    const id = String(req.params.id);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmerId !== req.user!.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await prisma.product.delete({ where: { id } });

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[PRODUCTS_DELETE_ERROR]', error);
    return res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
