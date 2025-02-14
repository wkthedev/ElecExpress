const { ipcRenderer } = require("electron");

const sqlAPI = {
    openDatabase: () => ipcRenderer.invoke("openDatabase"),
    closeDatabase: () => ipcRenderer.invoke("closeDatabase"),
    executeSQL: (query, params = [], isSync = false) => ipcRenderer.invoke("executeSQL", query, params, isSync),
    createTable: (tableName, columns) => ipcRenderer.invoke("createTable", tableName, columns),
    insertRow: (tableName, values) => ipcRenderer.invoke("insertRow", tableName, values),
    getRowById: (tableName, id) => ipcRenderer.invoke("getRowById", tableName, id),
    getAllRows: (tableName) => ipcRenderer.invoke("getAllRows", tableName),
    deleteRowById: (tableName, id) => ipcRenderer.invoke("deleteRowById", tableName, id)
}

module.exports = sqlAPI;