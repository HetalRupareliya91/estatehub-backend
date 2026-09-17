const { Notification } = require('../models');

// @route GET /api/notifications
async function getNotifications(req, res, next) {
  try {
    const { unreadOnly } = req.query;
    const where = { userId: req.user.id };
    if (unreadOnly === 'true') where.isRead = false;

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

// @route GET /api/notifications/unread-count
async function getUnreadCount(req, res, next) {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/notifications/read-all
async function markAllAsRead(req, res, next) {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/notifications/:id/read
async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/notifications/:id
async function deleteNotification(req, res, next) {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    await notification.destroy();
    res.json({ message: 'Notification removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  deleteNotification,
};

