const express = require("express");
const cors = require("cors");
const koffi = require("koffi");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://memforge-memory-allocator-yrex.vercel.app"
    ]
}));

app.use(express.json());

// Load the C shared library
const lib = koffi.load(
    path.join(__dirname, "liballocator.so")
);

// Connect JavaScript to C functions
const mf_init = lib.func("int mf_init()");
const mf_allocate = lib.func("int mf_allocate(size_t)");
const mf_free = lib.func("int mf_free(int)");
const mf_cleanup = lib.func("void mf_cleanup()");

// Memory statistics functions
const mf_total_memory = lib.func("int mf_total_memory()");
const mf_allocated_memory = lib.func("int mf_allocated_memory()");
const mf_free_memory = lib.func("int mf_free_memory()");
const mf_metadata_overhead = lib.func("int mf_metadata_overhead()");
const mf_allocated_count = lib.func("int mf_allocated_count()");
const mf_free_count = lib.func("int mf_free_count()");

// Memory block functions
const mf_block_count = lib.func("int mf_block_count()");
const mf_block_size = lib.func("int mf_block_size(int)");
const mf_block_is_free = lib.func("int mf_block_is_free(int)");
const mf_block_id = lib.func("int mf_block_id(int)");

// Initialize the C memory allocator
const initialized = mf_init();

if (!initialized) {
    throw new Error("C allocator initialization failed");
}

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "MemForge Backend is running!",
        allocator: "C allocator connected successfully!"
    });
});

// Allocate memory
app.post("/api/allocate", (req, res) => {
    const size = req.body.size;

    if (!Number.isSafeInteger(size) || size <= 0) {
        return res.status(400).json({
            error: "Enter a valid positive allocation size"
        });
    }

    const id = mf_allocate(size);

    if (id === -1) {
        return res.status(400).json({
            error: "Memory allocation failed"
        });
    }

    res.json({
        message: "Memory allocated successfully",
        id,
        requestedSize: size
    });
});

// Free memory
app.post("/api/free", (req, res) => {
    const { id } = req.body;

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            error: "Invalid allocation ID"
        });
    }

    const success = mf_free(id);

    if (!success) {
        return res.status(400).json({
            error: "Invalid ID or memory already freed"
        });
    }

    res.json({
        message: "Memory freed successfully",
        id
    });
});

// Get real-time memory statistics
app.get("/api/stats", (req, res) => {
    res.json({
        totalMemory: mf_total_memory(),
        allocatedMemory: mf_allocated_memory(),
        freeMemory: mf_free_memory(),
        metadataOverhead: mf_metadata_overhead(),
        allocatedBlocks: mf_allocated_count(),
        freeBlocks: mf_free_count()
    });
});

// Get actual memory block information
app.get("/api/blocks", (req, res) => {
    const count = mf_block_count();
    const blocks = [];

    for (let i = 0; i < count; i++) {
        blocks.push({
            index: i,
            size: mf_block_size(i),
            isFree: mf_block_is_free(i) === 1,
            allocationId: mf_block_id(i)
        });
    }

    res.json({ blocks });
});

// Start backend
const server = app.listen(PORT, () => {
    console.log(`MemForge backend running at http://localhost:${PORT}`);
    console.log("C allocator connected successfully!");
});

// Release C memory when backend shuts down
process.on("SIGINT", () => {
    mf_cleanup();
    server.close(() => process.exit(0));
});