import { Request, Response } from 'express';
import { prisma } from '../../utils/prisma';

export const getListings = async (req: Request, res: Response) => {
  try {
    const items = await prisma.marketplaceItem.findMany({
      where: { status: 'AVAILABLE' },
      include: { seller: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const sellerId = (req as any).user.id;
    const { title, description, price, category, images } = req.body;

    const item = await prisma.marketplaceItem.create({
      data: {
        sellerId,
        title,
        description,
        price: parseFloat(price),
        category,
        images: images || []
      }
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to create listing" });
  }
};
