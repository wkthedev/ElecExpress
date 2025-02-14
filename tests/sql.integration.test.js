const fs = require("fs");
const path = require("path");

describe("SQLite Integration Tests", () => {
    const dbPath = path.join(__dirname, "test_database.sqlite");

    beforeAll(async () => {
        // Ensure old test database is deleted before starting
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

        await window.electron.sql.openDatabase(dbPath);
        await window.electron.sql.createTable("users", [
            "id INTEGER PRIMARY KEY AUTOINCREMENT",
            "name TEXT",
            "email TEXT"
        ]);
    });

    test("📂 Should actually insert a user into a real database", async () => {
        await window.electron.sql.insertRow("users", ["Alice", "alice@example.com"]);
        const users = await window.electron.sql.getAllRows("users");
        
        expect(users.length).toBe(1);
        expect(users[0].name).toBe("Alice");
    });

    test("🔍 Should retrieve a user by ID from a real database", async () => {
        const user = await window.electron.sql.getRowById("users", 1);
        expect(user).toBeDefined();
        expect(user.name).toBe("Alice");
    });

    test("🗑️ Should delete a user from a real database", async () => {
        await window.electron.sql.deleteRowById("users", 1);
        const users = await window.electron.sql.getAllRows("users");
        expect(users.length).toBe(0);
    });

    test("❌ Should actually close the database", async () => {
        await expect(window.electron.sql.closeDatabase()).resolves.toBe(true);
    
        // ✅ Wait a bit to ensure DB is fully closed
        await new Promise((r) => setTimeout(r, 100));
    
        // ✅ Ensure trying to query after closing throws an error
        await expect(window.electron.sql.getAllRows("users"))
            .rejects.toThrow(/Cannot execute query: Database is closed/i);
    });    

    afterAll(async () => {
        // Clean up test database
        if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    });
});
