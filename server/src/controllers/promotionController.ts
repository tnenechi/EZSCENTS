import { Request, Response } from 'express';
import Promotion from '../models/Promotion';

// @desc    Fetch active promotions
// @route   GET /api/promotions
// @access  Public
export const getActivePromotions = async (req: Request, res: Response) => {
  const promotions = await Promotion.find({ isActive: true });
  res.json(promotions);
};

// @desc    Create a promotion
// @route   POST /api/promotions
// @access  Private/Admin
export const createPromotion = async (req: Request, res: Response) => {
  const { title, description, image, products, startDate, endDate } = req.body;

  const promotion = new Promotion({
    title,
    description,
    image,
    products,
    startDate,
    endDate,
  });

  const createdPromotion = await promotion.save();
  res.status(201).json(createdPromotion);
};

// @desc    Update a promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
export const updatePromotion = async (req: Request, res: Response) => {
  const { title, description, image, products, isActive, startDate, endDate } = req.body;

  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    promotion.title = title || promotion.title;
    promotion.description = description || promotion.description;
    promotion.image = image || promotion.image;
    promotion.products = products || promotion.products;
    promotion.isActive = isActive !== undefined ? isActive : promotion.isActive;
    promotion.startDate = startDate || promotion.startDate;
    promotion.endDate = endDate || promotion.endDate;

    const updatedPromotion = await promotion.save();
    res.json(updatedPromotion);
  } else {
    res.status(404).json({ message: 'Promotion not found' });
  }
};

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
export const deletePromotion = async (req: Request, res: Response) => {
  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    await Promotion.deleteOne({ _id: promotion._id });
    res.json({ message: 'Promotion removed' });
  } else {
    res.status(404).json({ message: 'Promotion not found' });
  }
};
