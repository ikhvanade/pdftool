const pool = require('../config/db');
const { ok, fail } = require('../utils/response');

async function list(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100);
    const offset = (page - 1) * pageSize;

    const filters = ['user_id = ?'];
    const params = [req.user.id];

    if (req.query.tool_type) {
      filters.push('tool_type = ?');
      params.push(req.query.tool_type);
    }
    if (req.query.from) {
      filters.push('created_at >= ?');
      params.push(req.query.from);
    }
    if (req.query.to) {
      filters.push('created_at <= ?');
      params.push(req.query.to);
    }

    const whereClause = filters.join(' AND ');

    const [rows] = await pool.query(
      `SELECT id, tool_type, file_name, action, created_at FROM activity_log
       WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM activity_log WHERE ${whereClause}`,
      params
    );

    return ok(res, { items: rows, page, pageSize, total });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      'DELETE FROM activity_log WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (result.affectedRows === 0) return fail(res, 'NOT_FOUND_OR_NOT_YOURS', 404);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, remove };
