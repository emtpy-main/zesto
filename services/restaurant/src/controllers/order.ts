import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/tryCatch.js";
import Address from "../model/Address.js";
import Cart from "../model/Cart.js";
import { IMenuItem } from "../model/menuItem.js";
import Order from "../model/Order.js";
import Restaurant, { type IRestaurant } from "../model/restaurant.js";
import { publishEvent } from "../config/order.publish.js";
import restaurant from "../model/restaurant.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const { paymentMethod, addressId } = req.body;

  if (!addressId) {
    return res.status(400).json({
      message: "Address is required",
    });
  }

  const address = await Address.findOne({
    _id: addressId,
    userId: user._id,
  });

  if (!address) {
    return res.status(404).json({
      message: "Address not found",
    });
  }

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    console.log(
      `distance of order at latitude and longitude ${lat1} ${typeof lat1} : ${lon1} ${typeof lon1} :${lat2} ${typeof lat2} :${lon2} ${typeof lon2}`,
    );
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      throw new Error("Invalid coordinates passed to distance calculator");
    }
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLon / 2) +
      Math.cos((lat1 * Math.PI) / 100) *
        Math.cos((lat2 * Math.PI) / 100) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const cartItems = await Cart.find({
    userId: user._id,
  })
    .populate<{ itemId: IMenuItem }>("itemId")
    .populate<{ restaurantId: IRestaurant }>("restaurantId");

  if (cartItems.length === 0) {
    return res.status(400).json({
      message: "Cart is empty",
    });
  }

  const firstCartItem = cartItems[0];
  if (!firstCartItem || !firstCartItem.restaurantId) {
    return res.status(400).json({
      message: "Invalid Cart data",
    });
  }

  const restaurantId = firstCartItem.restaurantId._id;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      message: "No restaurant with this id",
    });
  }

  if (!restaurant.isOpen) {
    return res.status(400).json({
      message: "Sorry this restaurant is closed for now",
    });
  }
  const addressCoords = address.location?.coordinates;
  const restaurantCoords = restaurant.autoLocation?.coordinates;
  if (
    !addressCoords ||
    addressCoords.length < 2 ||
    !restaurantCoords ||
    restaurantCoords.length < 2
  ) {
    return res.status(400).json({
      message:
        "Delivery distance cannot be calculated. The restaurant or delivery address is missing GPS coordinates.",
    });
  }
  const distance = getDistanceKm(
    address.location.coordinates[1], // delivery address ka latitudes
    address.location.coordinates[0], // longitude
    restaurant.autoLocation.coordinates[1], // restaurant ka latitudes
    restaurant.autoLocation.coordinates[0], // restaurant ka longitudes
  );

  if (isNaN(distance)) {
    return res.status(400).json({
      message:
        "An error occurred while calculating the delivery distance. Please verify your address details.",
    });
  }

  console.log(`${restaurant.name} at distance ${distance}`);

  let subTotal = 0;
  const orderItems = cartItems.map((cart) => {
    const item = cart.itemId;
    if (!item) {
      throw new Error("Invalid Cart item");
    }

    const itemTotal = item.price * cart.quantity;
    subTotal += itemTotal;
    return {
      itemId: item._id.toString(),
      name: item.name,
      price: item.price,
      quantity: cart.quantity,
    };
  });

  const deliveryFee = subTotal < 250 ? 49 : (0 as number);
  const platformFee = 7 as number;
  const totalAmount = (subTotal + deliveryFee + platformFee) as number;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const [longitude, latitude] = address.location.coordinates;
  const riderAmount = (Math.ceil(distance) * 17) as number;

  const order = await Order.create({
    userId: user._id.toString(),
    restaurantId: restaurantId.toString(),
    restaurantName: restaurant.name,
    riderId: null,
    distance,
    riderAmount,
    items: orderItems,
    subTotal,
    deliveryFee,
    platformFee,
    totalAmount,
    addressId: address._id.toString(),
    deliveryAddress: {
      formattedAddress: address.formattedAddress,
      mobile: address.mobile,
      latitude,
      longitude,
    },
    paymentMethod,
    paymentStatus: "pending",
    status: "placed",
    expiresAt,
  });

  await Cart.deleteMany({ userId: user._id });
  res.json({
    message: "Order created successfully",
    orderId: order._id.toString(),
    amount: totalAmount,
  });
});

// internal api for payment
export const fetchOrderforPayment = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.paymentStatus !== "pending") {
    return res.status(400).json({
      message: "Order already paid",
    });
  }

  res.json({
    orderId: order._id,
    amount: order.totalAmount,
    currency: "INR",
  });
});

export const fetchRestaurantOrders = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { restaurantId } = req.params;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant id is required",
      });
    }
    const limit = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({
      restaurantId,
      paymentStatus: "paid",
    })
      .sort({
        createdAt: -1,
      })
      .limit(limit);

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  },
);

const ALLOWED_STATUS_MODIFY = [
  "accepted",
  "preparing",
  "ready_for_rider",
] as const;

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!ALLOWED_STATUS_MODIFY.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status update",
      });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    if (order.paymentStatus !== "paid") {
      return res.status(404).json({
        message: "Order not completed",
      });
    }
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    if (restaurant.ownerId !== user._id.toString()) {
      return res.status(401).json({
        message:
          "You are not allowed ❌. Only Owner of restaurant are allowed to update his restaurant order status",
      });
    }

    order.status = status;
    await order.save();
    // socket works
    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:update",
        room: `user:${order.userId}`,
        payload: {
          orderId: order._id,
          status: order.status,
        },
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );

    //==========  now assign riders =====================
    if (status === "ready_for_rider") {
      console.log(
        "Publishing order ready for rider in restaurant/controller/order.ts fiel",
        order._id,
      );
      await publishEvent("ORDER_READY_FOR_RIDER", {
        orderId: order._id.toString(),
        restaurantId: restaurant._id.toString(),
        location: restaurant.autoLocation,
      });
      console.log("Event published successfully");
    }

    res.json({
      message: "Order update successfully",
      order,
    });
  },
);

export const getMyOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const orders = await Order.find({
    userId: req.user?._id.toString(),
    paymentStatus: "paid",
  }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const fetchSingleOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are allowed to view this order",
      });
    }

    res.json(order);
  },
);

export const assignRiderToOrder = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId, riderId, riderName, riderPhone } = req.body;

  const orderAvailable = await Order.findOne({
    riderId,
    status: {
      $ne: "delivered",
    },
  });
  if (orderAvailable) {
    return res.status(400).json({
      message: "You already have an order",
    });
  }
  const orderOlder = await Order.findById(orderId);
  if (orderOlder?.riderId !== null) {
    return res.status(400).json({
      message: "Order Already taken",
    });
  }
  const order = await Order.findOneAndUpdate(
    { _id: orderId, riderId: null },
    {
      riderId,
      riderName,
      riderPhone,
      status: "rider_assigned",
    },
    {
      new: true,
    },
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  //======================  update restaurant and user about rider assign in realtime ====================
  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `user:${order.userId}`,
      payload: order,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    },
  );

  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `restaurant:${order.restaurantId}`,
      payload: order,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    },
  );

  res.json({
    message: "Rider assigned sucessfully",
    success: true,
    order,
  });
});

export const getCurrentOrderForRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  const { riderId } = req.params;
  if (!riderId)
    return res.status(400).json({ message: "Rider id is required" });

  const order = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  }).populate("restaurantId");

  if (!order) return res.status(404).json({ message: "Order not found" });

  res.json(order);
});

export const updateOrderStatusRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId } = req.body;

  const order = await Order.findById({ _id: orderId });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const emitEvent = async (room: string) => {
    return axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );
  };

  if (order.status === "rider_assigned") {
    order.status = "picked_up";
    await order.save();

    await Promise.all([
      emitEvent(`user:${order.userId}`),
      emitEvent(`restaurant:${order.restaurantId}`),
    ]);

    return res.json({
      message: "Order updated successfully",
    });
  } else if (order.status === "picked_up") {
    order.status = "delivered";
    await order.save();

    await Promise.all([
      emitEvent(`user:${order.userId}`),
      emitEvent(`restaurant:${order.restaurantId}`),
    ]);

    return res.json({
      message: "Order updated successfully",
    });
  }
});
