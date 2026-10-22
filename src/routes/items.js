const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

// CREATE a lost or found report (login required)
router.post("/", authenticateToken, async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            category,
            location,
            item_date
        } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof location !== "string" || !location.trim() ||
            !["lost", "found"].includes(type)
        ) {
            return res.status(400).json({
                error: "Valid title, location and type (lost/found) are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO items
             (title, description, type, category, location, item_date, user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                title.trim(),
                description ?? null,
                type,
                category ?? null,
                location.trim(),
                item_date || null,
                req.user.id
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// LIST, SEARCH and FILTER reports (public)
router.get("/", async (req, res) => {
    try {
        const { search, type, category, status } = req.query;
        const conditions = [];
        const values = [];

        function addCondition(sql, value) {
            values.push(value);
            conditions.push(sql.replace("?", `$${values.length}`));
        }

        if (search) {
            values.push(`%${search}%`);
            const first = values.length;
            values.push(`%${search}%`);
            const second = values.length;

            conditions.push(
                `(title ILIKE $${first} OR description ILIKE $${second})`
            );
        }

        if (type) {
            if (!["lost", "found"].includes(type)) {
                return res.status(400).json({
                    error: "type must be lost or found"
                });
            }
            addCondition("type = ?", type);
        }

        if (category) {
            addCondition("category = ?", category);
        }

        if (status) {
            if (!["active", "recovered"].includes(status)) {
                return res.status(400).json({
                    error: "status must be active or recovered"
                });
            }
            addCondition("status = ?", status);
        }

        const where = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const result = await pool.query(
            `SELECT id, title, description, type, category,
                    location, item_date, status, user_id, created_at, updated_at
             FROM items ${where}
             ORDER BY created_at DESC`,
            values
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// VIEW details (public)
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "Invalid item ID" });
        }

        const result = await pool.query(
            "SELECT * FROM items WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// UPDATE own report (login and ownership required)
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "Invalid item ID" });
        }

        const {
            title, description, type, category, location, item_date
        } = req.body;

        if (type !== undefined && !["lost", "found"].includes(type)) {
            return res.status(400).json({
                error: "type must be lost or found"
            });
        }

        if (title !== undefined &&
            (typeof title !== "string" || !title.trim())) {
            return res.status(400).json({
                error: "title cannot be empty"
            });
        }

        if (location !== undefined &&
            (typeof location !== "string" || !location.trim())) {
            return res.status(400).json({
                error: "location cannot be empty"
            });
        }

        const result = await pool.query(
            `UPDATE items
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 type = COALESCE($3, type),
                 category = COALESCE($4, category),
                 location = COALESCE($5, location),
                 item_date = COALESCE($6, item_date),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 AND user_id = $8
             RETURNING *`,
            [
                title === undefined ? null : title.trim(),
                description ?? null,
                type ?? null,
                category ?? null,
                location === undefined ? null : location.trim(),
                item_date || null,
                id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Item not found or you do not own this report"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// MARK own report as recovered (login and ownership required)
router.patch("/:id/recover", authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: "Invalid item ID" });
        }

        const result = await pool.query(
            `UPDATE items
             SET status = 'recovered',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Item not found or you do not own this report"
            });
        }

        res.json({
            message: "Item marked as recovered",
            item: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;