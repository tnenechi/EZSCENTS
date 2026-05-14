import { Request, Response } from 'express';
import Product from '../models/Product';
import Promotion from '../models/Promotion';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword as string, $options: 'i' } },
          { brand: { $regex: req.query.keyword as string, $options: 'i' } },
          { category: { $regex: req.query.keyword as string, $options: 'i' } },
        ],
      }
    : {};

  const category = req.query.category ? { category: req.query.category as string } : {};
  const brand = req.query.brand ? { brand: req.query.brand as string } : {};
  const isFeatured = req.query.isFeatured === 'true' ? { isFeatured: true } : {};

  let promotionQuery = {};
  if (req.query.promotionId) {
    const promotion = await Promotion.findById(req.query.promotionId);
    if (promotion) {
      promotionQuery = { _id: { $in: promotion.products } };
    }
  }

  const query = { ...keyword, ...category, ...brand, ...isFeatured, ...promotionQuery };

  // Sort logic
  let sort: any = { createdAt: -1 }; // Default to newest
  if (req.query.sort === 'price-asc') {
    sort = { 'variants.price': 1 };
  } else if (req.query.sort === 'price-desc') {
    sort = { 'variants.price': -1 };
  } else if (req.query.sort === 'newest') {
    sort = { createdAt: -1 };
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Get unique brands and categories
// @route   GET /api/products/filters
// @access  Public
export const getFilters = async (req: Request, res: Response) => {
  const brands = await Product.distinct('brand');
  const categories = await Product.distinct('category');
  res.json({ brands, categories });
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
  const { name, brand, description, category, images, variants, isFeatured } = req.body;

  const product = new Product({
    name,
    brand,
    description,
    category,
    images,
    variants,
    isFeatured,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
  const { name, brand, description, category, images, variants, isFeatured } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.brand = brand || product.brand;
    product.description = description || product.description;
    product.category = category || product.category;
    product.images = images || product.images;
    product.variants = variants || product.variants;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};
