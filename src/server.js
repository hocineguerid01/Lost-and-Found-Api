const express = require("express");
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Lost and Found API is running"
    });
});

app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS server_time");

        res.json({
            message: "PostgreSQL connection successful",
            time: result.rows[0].server_time
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            error: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});