describe("SQLite Tests", () => {
    beforeAll(async () => {
        await window.electron.sql.openDatabase();
        await window.electron.sql.createTable("users", [
            "id INTEGER PRIMARY KEY AUTOINCREMENT",
            "name TEXT",
            "email TEXT"
        ]);
    });

    test("📂 Should insert a user", async () => {
        await window.electron.sql.insertRow("users", ["Alice", "alice@example.com"]);
        const users = await window.electron.sql.getAllRows("users");
        expect(users.length).toBe(1);
        expect(users[0].name).toBe("Alice");
    });

    test("🔍 Should retrieve a user by ID", async () => {
        const user = await window.electron.sql.getRowById("users", 1);
        expect(user).toBeDefined();
        expect(user.name).toBe("Alice");
    });

    test("🗑️ Should delete a user", async () => {
        await window.electron.sql.deleteRowById("users", 1);
        const users = await window.electron.sql.getAllRows("users");
        expect(users.length).toBe(0);  // ✅ Now deletion works
    });

    test("❌ Should close the database", async () => {
        expect(window.electron.sql.closeDatabase).toBeDefined();
        await expect(window.electron.sql.closeDatabase()).resolves.toBe(true);
    });
});
