const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kioskPrinter", {
  isElectron: true,
  printTicket: (params) => ipcRenderer.invoke("print-ticket", params),
});
