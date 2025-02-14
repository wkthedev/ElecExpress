const fs = require("fs");

// Detect if we are running integration tests (by checking the test filename)
const isIntegrationTest = process.env.TEST_TYPE === "integration";

if (!isIntegrationTest) {
    // Declare the mock file system
    const mockFileSystem = {};

    global.window = global; // Ensure `window` is globally accessible

    global.window.electron = {
        file: {
            readFile: jest.fn((filePath) => {
                return mockFileSystem[filePath] || null;
            }),
            writeFile: jest.fn((filePath, content) => {
                mockFileSystem[filePath] = content;
                return true; // Simulate successful write
            })
        },
        clipboard: {
            writeText: jest.fn(),
            readText: jest.fn(() => "Copied Text!")
        },
        openExternal: jest.fn(),
        notification: {
            show: jest.fn()
        },
        serveFolder: {
            get: jest.fn(async () => "/mock/path"),
            open: jest.fn()
        }
    };

    // Declare the mock database
    let isDatabaseClosed = false;
    const mockDatabase = {
        users: []
    };

    global.window.electron.sql = {
        openDatabase: jest.fn(() => {
            isDatabaseClosed = false;
        }),
        
        closeDatabase: jest.fn(async () => {
            isDatabaseClosed = true;
            return true;
        }),

        executeSQL: jest.fn(async (query) => {
            if (isDatabaseClosed) {
                throw new Error("❌ Cannot execute query: Database is closed.");
            }
            if (query.includes("DELETE")) {
                const id = parseInt(query.match(/id = (\d+)/)[1]); // Extract ID from query
                mockDatabase.users = mockDatabase.users.filter(user => user.id !== id);
                return { changes: 1 };
            }
            return [];
        }),

        createTable: jest.fn(),
        
        insertRow: jest.fn(async (table, values) => {
            if (isDatabaseClosed) {
                throw new Error("❌ Cannot insert: Database is closed.");
            }
            if (table === "users") {
                mockDatabase.users.push({
                    id: mockDatabase.users.length + 1,
                    name: values[0],
                    email: values[1]
                });
            }
        }),

        getRowById: jest.fn(async (table, id) => {
            if (isDatabaseClosed) {
                throw new Error("❌ Cannot fetch: Database is closed.");
            }
            return mockDatabase[table].find(user => user.id === id) || null;
        }),

        getAllRows: jest.fn(async (table) => {
            if (isDatabaseClosed) {
                throw new Error("❌ Cannot execute query: Database is closed.");
            }
            return mockDatabase[table] || [];
        }),

        deleteRowById: jest.fn(async (table, id) => {
            if (isDatabaseClosed) {
                throw new Error("❌ Cannot delete: Database is closed.");
            }
            const initialLength = mockDatabase[table].length;
            mockDatabase[table] = mockDatabase[table].filter(user => user.id !== id);
            return { changes: initialLength - mockDatabase[table].length };
        })
    };
}