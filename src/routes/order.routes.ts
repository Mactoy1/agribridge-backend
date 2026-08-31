import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const validOrderStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
    const skip = req.query.skip ? String(req.query.skip) : '0';
    const take = req.query.take ? String(req.query.take) : '20';

    const where: any = {
      userId: req.user!.id,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          product: { include: { farmer: { select: { id: true, name: true } } } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Math.min(Number(take), 100),
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      data: orders,
      pagination: {
        total,
        skip: Number(skip),
        take: Number(take),
        hasMore: Number(skip) + Number(take) < total,
      },
    });
  } catch (error) {
    console.error('[ORDERS_GET_MY_ERROR]', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: { include: { farmer: { select: { id: true, name: true, email: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.userId !== req.user!.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You do not have access to this order' });
    }

    return res.json(order);
  } catch (error) {
    console.error('[ORDERS_GET_ERROR]', error);
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validation
    if (!productId || !quantity) {
      return res.status(400).json({
        message: 'Product ID and quantity are required',
        fields: { productId: !productId, quantity: !quantity },
      });
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: 'Insufficient stock',
        available: product.stock,
        requested: quantity,
      });
    }

    // Calculate total
    const total = product.price * quantity;

    // Create order and update stock
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          productId,
          quantity,
          total,
        },
        include: {
          product: { include: { farmer: { select: { id: true, name: true } } } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // Update stock
      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });

      return newOrder;
    });

    return res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('[ORDERS_CREATE_ERROR]', error);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

// Update order status (Admin or product owner)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!status || !validOrderStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validOrderStatuses.join(', ')}`,
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: only admin or farmer who owns the product can update status
    if (req.user?.role !== 'ADMIN' && (order.product as any)?.farmerId !== req.user!.id) {
      return res.status(403).json({ message: 'You cannot update this order' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        product: { include: { farmer: { select: { id: true, name: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({
      message: 'Order status updated successfully',
      order: updated,
    });
  } catch (error) {
    console.error('[ORDERS_UPDATE_STATUS_ERROR]', error);
    return res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Cancel order
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.user!.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You cannot cancel this order' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Cancel order and restore stock
    const cancelled = await prisma.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { product: true, user: { select: { id: true, name: true, email: true } } },
      });

      // Restore stock
      await tx.product.update({
        where: { id: order.productId },
        data: { stock: { increment: order.quantity } },
      });

      return cancelledOrder;
    });

    return res.json({
      message: 'Order cancelled successfully',
      order: cancelled,
    });
  } catch (error) {
    console.error('[ORDERS_CANCEL_ERROR]', error);
    return res.status(500).json({ message: 'Failed to cancel order' });
  }
});

export default router;
