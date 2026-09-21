const { Task, User, Lead, Listing } = require('../models');

// @route GET /api/tasks
async function getTasks(req, res, next) {
  try {
    const { status, agentId, priority } = req.query;
    const where = {};
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;
    if (priority) where.priority = priority;

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'agent', attributes: ['id', 'name'] },
        { model: Lead, as: 'lead', attributes: ['id', 'name'] },
        { model: Listing, as: 'listing', attributes: ['id', 'title'] },
      ],
      order: [['dueDate', 'ASC']],
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

// @route POST /api/tasks
async function createTask(req, res, next) {
  try {
    const { title, description, dueDate, priority, leadId, listingId, agentId } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const task = await Task.create({
      title, description, dueDate, priority, leadId, listingId,
      agentId: agentId || req.user.id,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const fields = ['title', 'description', 'dueDate', 'status', 'priority', 'leadId', 'listingId', 'agentId'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };

