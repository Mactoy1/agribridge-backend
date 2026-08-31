"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            include: { farmer: true },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(products);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch products' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma_1.default.product.findUnique({
            where: { id: req.params.id },
            include: { farmer: true },
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.json(product);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch product' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { name, category, description, price, stock, imageUrl } = req.body;
        if (!name || !category || !price) {
            return res.status(400).json({ message: 'Name, category, and price are required' });
        }
        const product = await prisma_1.default.product.create({
            data: {
                name,
                category,
                description,
                price: Number(price),
                stock: Number(stock || 0),
                imageUrl,
                farmerId: req.user.id,
            },
        });
        return res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create product' });
    }
});
exports.default = router;
//# sourceMappingURL=product.routes.js.map