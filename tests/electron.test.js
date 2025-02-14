const fs = require("fs");
const path = require("path");

describe("Electron API Tests", () => {
    const testFilePath = path.join(__dirname, "test.txt");

    beforeAll(() => {
        // Ensure test file is removed before starting
        if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    });

    afterAll(() => {
        // Cleanup test file
        if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    });

    test("📂 Should write to a file", () => {
        const result = window.electron.file.writeFile(testFilePath, "Hello, World!");
        expect(result).toBe(true);
        expect(window.electron.file.readFile(testFilePath)).toBe("Hello, World!"); // ✅ Check in-memory
    });

    test("📂 Should read from a file", () => {
        const content = window.electron.file.readFile(testFilePath);
        expect(content).toBe("Hello, World!");
    });

    test("📋 Should write to clipboard", () => {
        window.electron.clipboard.writeText("Copied Text!");
        const text = window.electron.clipboard.readText();
        expect(text).toBe("Copied Text!");
    });

    test("🌐 Should open an external URL", () => {
        const mockOpenExternal = jest.spyOn(window.electron, "openExternal").mockImplementation(() => {});
        window.electron.openExternal("https://example.com");
        expect(mockOpenExternal).toHaveBeenCalledWith("https://example.com");
        mockOpenExternal.mockRestore();
    });

    test("🔔 Should show a notification", () => {
        const mockNotification = jest.spyOn(window.electron.notification, "show").mockImplementation(() => {});
        window.electron.notification.show("Hello", "This is a test notification!");
        expect(mockNotification).toHaveBeenCalledWith("Hello", "This is a test notification!");
        mockNotification.mockRestore();
    });

    test("📁 Should get and open serve folder", async () => {
        const mockGetServeFolder = jest.spyOn(window.electron.serveFolder, "get").mockResolvedValue("/mock/path");
        const mockOpenServeFolder = jest.spyOn(window.electron.serveFolder, "open").mockImplementation(() => {});

        const folderPath = await window.electron.serveFolder.get();
        expect(folderPath).toBe("/mock/path");

        window.electron.serveFolder.open();
        expect(mockOpenServeFolder).toHaveBeenCalled();

        mockGetServeFolder.mockRestore();
        mockOpenServeFolder.mockRestore();
    });
});
