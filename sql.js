const { ipcMain, app } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();  // Async SQLite
const Database = require("better-sqlite3");   // Sync SQLite

let dbAsync, dbSync;
let appPath;

/**
 *  Open the SQLite database
 */
function openDatabase(dbPath = "database.sqlite") {
    appPath = app.getPath("userData");
    const fullPath = path.join(appPath, dbPath);

    //  Async Database (sqlite3)
    dbAsync = new sqlite3.Database(fullPath, (err) => {
        if (err) console.error("❌ Error opening async DB:", err);
        else console.log(` Async DB connected: ${fullPath}`);
    });

    //  Sync Database (better-sqlite3)
    try {
        dbSync = new Database(fullPath);
        console.log(` Sync DB connected: ${fullPath}`);
    } catch (error) {
        console.error("❌ Error opening sync DB:", error);
    }

    return fullPath;
}

/**
 *  Close the SQLite database
 */
async function closeDatabase() {
    console.log("🔄 Closing database...");

    return new Promise((resolve, reject) => {
        let asyncClosed = false, syncClosed = false;

        if (dbAsync) {
            dbAsync.close((err) => {
                if (err) {
                    console.error("❌ Error closing async DB:", err);
                    reject(err);
                } else {
                    console.log("✅ Async DB closed.");
                    asyncClosed = true;
                    dbAsync = null; // ✅ Explicitly mark as closed
                    if (syncClosed) resolve(true);
                }
            });
        } else {
            asyncClosed = true;
        }

        if (dbSync) {
            try {
                dbSync.close();
                console.log("✅ Sync DB closed.");
                dbSync = null; // ✅ Explicitly mark as closed
                syncClosed = true;
                if (asyncClosed) resolve(true);
            } catch (err) {
                console.error("❌ Error closing sync DB:", err);
                reject(err);
            }
        } else {
            syncClosed = true;
        }

        if (asyncClosed && syncClosed) resolve(true);
    });
}

/**
 *  Execute Any SQL Query (Supports both Sync & Async)
 */
async function executeSQL(query, params = [], isSync = false) {
    try {
        // ✅ Check if the database is closed before executing a query
        if (isSync && !dbSync) {
            throw new Error("❌ Cannot execute query: Database is closed.");
        }
        if (!isSync && !dbAsync) {
            throw new Error("❌ Cannot execute query: Database is closed.");
        }

        if (isSync) {
            const stmt = dbSync.prepare(query);
            return query.trim().toUpperCase().startsWith("SELECT") ? stmt.all(...params) : stmt.run(...params);
        } else {
            return new Promise((resolve, reject) => {
                if (query.trim().toUpperCase().startsWith("SELECT")) {
                    dbAsync.all(query, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                } else {
                    dbAsync.run(query, params, function (err) {
                        if (err) reject(err);
                        else resolve({ changes: this.changes, lastID: this.lastID });
                    });
                }
            });
        }
    } catch (error) {
        console.error("❌ SQL Execution Error:", error);
        throw error; // ✅ Ensure errors propagate correctly
    }
}

/**
 *  Common SQL Functions
 */
async function createTable(tableName, columns) {
    return executeSQL(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(", ")})`);
}

async function insertRow(tableName, values) {
    return executeSQL(`INSERT INTO ${tableName} VALUES (${values.map(() => "?").join(", ")})`, values);
}

async function getRowById(tableName, id) {
    return executeSQL(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
}

async function getAllRows(tableName) {
    return executeSQL(`SELECT * FROM ${tableName}`);
}

async function deleteRowById(tableName, id) {
    return executeSQL(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
}

/**
 *  IPC Handlers
 */
ipcMain.handle("openDatabase", async () => openDatabase());
ipcMain.handle("closeDatabase", async () => closeDatabase());
ipcMain.handle("executeSQL", async (event, query, params = [], isSync = false) => executeSQL(query, params, isSync));
ipcMain.handle("createTable", async (event, tableName, columns) => createTable(tableName, columns));
ipcMain.handle("insertRow", async (event, tableName, values) => insertRow(tableName, values));
ipcMain.handle("getRowById", async (event, tableName, id) => getRowById(tableName, id));
ipcMain.handle("getAllRows", async (event, tableName) => getAllRows(tableName));
ipcMain.handle("deleteRowById", async (event, tableName, id) => deleteRowById(tableName, id));

// Ensure database closes on app exit
app.on("before-quit", () => {
    closeDatabase();
});

module.exports = {
    openDatabase,
    closeDatabase,
    executeSQL,
    createTable,
    insertRow,
    getRowById,
    getAllRows,
    deleteRowById
};