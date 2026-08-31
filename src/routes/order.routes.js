"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/my-orders', auth_1.authMiddleware, async (req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            where: { userId: req.user.id },
            include: { product: true },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(orders);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch orders' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product id and quantity are required' });
        }
        const product = await prisma_1.default.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const total = product.price * Number(quantity);
        const order = await prisma_1.default.order.create({
            data: {
                userId: req.user.id,
                productId,
                quantity: Number(quantity),
                total,
            },
            include: { product: true },
        });
        return res.status(201).json(order);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create order' });
    }
});
exports.default = router;
//# sourceMappingURL=order.routes.js.map