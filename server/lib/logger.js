export function customConsoleLog(message) {
    const formattedDate = new Date().toLocaleString('fr-FR');
    console.log(`[${formattedDate}] ${message}`);
}
