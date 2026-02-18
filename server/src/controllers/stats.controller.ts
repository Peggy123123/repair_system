import { Request, Response, NextFunction } from 'express';
import { RepairOrder } from '../models/RepairOrder.js';
import { User } from '../models/User.js';
import { sendSuccess } from '../utils/response.utils.js';

export const getSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get counts by status
    const statusCounts = await RepairOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      repairing: 0,
      completed: 0,
      cancelled: 0,
    };

    let totalOrders = 0;
    for (const item of statusCounts) {
      statusMap[item._id] = item.count;
      totalOrders += item.count;
    }

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await RepairOrder.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get orders by device type
    const deviceTypeCounts = await RepairOrder.aggregate([
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 },
        },
      },
    ]);

    const deviceTypeMap: Record<string, number> = {};
    for (const item of deviceTypeCounts) {
      deviceTypeMap[item._id] = item.count;
    }

    // Get orders by category
    const categoryCounts = await RepairOrder.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const categoryStats = categoryCounts.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    sendSuccess(res, {
      totalOrders,
      totalUsers,
      recentOrders,
      statusCounts: statusMap,
      deviceTypeCounts: deviceTypeMap,
      categoryStats,
    });
  } catch (error) {
    next(error);
  }
};
