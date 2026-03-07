import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/tryCatch.js";
import Restaurant from "../model/restaurant.js";
import menuItem from "../model/menuItem.js";
import restaurant from "../model/restaurant.js";

export const addMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please login",
    });
  }

  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (!restaurant) {
    return res.status(404).json({
      message: "No Restaurant found",
    });
  }

  const { name, description, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({
      message: "Name and price are required",
    });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: "Please give image.",
    });
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer?.content) {
    return res.status(500).json({
      message: "Failed to create file buffer",
    });
  }

  const { data: uploadResult } = await axios.post(
    `${process.env.UTILS_SERVICE}/api/upload`,
    {
      buffer: fileBuffer.content,
    },
  );

  const item = await menuItem.create({
    name,
    description,
    price,
    restaurantId: restaurant._id,
    image: uploadResult.url,
  });

  res.json({
    message: "Item added successfully",
    item,
  });
});

export const getAllItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      message: "Id is required",
    });
  }

  const items = await menuItem.find({ restaurantId: id });
  res.json(items);
});

export const deleteItem = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please login",
    });
  }

  const { itemId } = req.params;
  if (!itemId) {
    return res.status(400).json({
      message: "Id is required",
    });
  }

  const item = await menuItem.findById(itemId);
  if (!item) {
    return res.status(404).json({
      messsage: "No item.found",
    });
  }

  const Restaurant = await restaurant.findOne({
    _id: item.restaurantId,
    ownerId: req.user._id,
  });
  if (!Restaurant) {
    return res.status(404).json({
      message: "No Restaurant found",
    });
  }
  await item.deleteOne();
  res.json({
    message: "Menu Item delted successfully",
  });
});

export const toggleMenuItemAvailability = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Please login",
      });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({
        message: "Id is required",
      });
    }

    const item = await menuItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        messsage: "No item.found",
      });
    }
    const Restaurant = await restaurant.findOne({
      _id: item.restaurantId,
      ownerId: req.user._id,
    });
    if (!Restaurant) {
      return res.status(404).json({
        message: "No Restaurant found",
      });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(
      {
        message: `Item Marked as ${item.isAvailable ? "Available" : "UnAvailable"}`,
        item, 
      },
    );
  },
);
