// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyCrI3Rzc-fOnHll28Bu7m8STZCxZluHy38",
    authDomain: "estanteriavirtual-b96a1.firebaseapp.com",
    databaseURL: "https://estanteriavirtual-b96a1-default-rtdb.firebaseio.com",
    projectId: "estanteriavirtual-b96a1",
    storageBucket: "estanteriavirtual-b96a1.firebasestorage.app",
    messagingSenderId: "302200700052",
    appId: "1:302200700052:web:4bac0e3e8e85f0399bc881"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ========================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// ========================================

const GOOGLE_SHEETS_CONFIG = {
    // API Key de Google Cloud Console
    apiKey: "AIzaSyD9h4SH9laGhvh-NRhDjYgbCThVEbM8HTo",
    
    // ID de tu hoja de cálculo (lo encuentras en la URL)
    // URL ejemplo: https://docs.google.com/spreadsheets/d/1ABC123XYZ/edit
    // El ID es: 1cD50d0-oSTogEe9tYo9ABUSP1ONCy3SAV92zsYYIG84
    spreadsheetId: "1cD50d0-oSTogEe9tYo9ABUSP1ONCy3SAV92zsYYIG84",
    
    // Nombre de la hoja (pestaña) donde están los productos
    sheetName: "Lista",
    
    // Rango de celdas a leer (ejemplo: A1:D100 para columnas A-D, filas 1-100)
    range: "A2:Z"
};

// ========================================
// CONFIGURACIÓN DE LA GÓNDOLA
// ========================================

const GONDOLA_CONFIG = {
    // Dimensiones fijas de la góndola (optimizado para móvil)
    defaultColumns: 5,
    defaultShelves: 6,
    
    // Número total de góndolas disponibles
    totalGondolas: 30,
    
    // Configuración específica por góndola (todas con dimensiones 5x6)
    gondolaSettings: {
        1: { name: "Estanteria 1", columns: 5, shelves: 6 },
        2: { name: "Estanteria 2", columns: 5, shelves: 6 },
        3: { name: "Estanteria 3", columns: 5, shelves: 6 },
        4: { name: "Estanteria 4", columns: 5, shelves: 6 },
        5: { name: "Estanteria 5", columns: 5, shelves: 6 },
        6: { name: "Estanteria 6", columns: 5, shelves: 6 },
        7: { name: "Estanteria 7", columns: 5, shelves: 6 },
        8: { name: "Estanteria 8", columns: 5, shelves: 6 },
        9: { name: "Estanteria 9", columns: 5, shelves: 6 },
        10: { name: "Estanteria 10", columns: 5, shelves: 6 },
        11: { name: "Estanteria 11", columns: 5, shelves: 6 },
        12: { name: "Estanteria 12", columns: 5, shelves: 6 },
        13: { name: "Estanteria 13", columns: 5, shelves: 6 },
        14: { name: "Estanteria 14", columns: 5, shelves: 6 },
        15: { name: "Estanteria 15", columns: 5, shelves: 6 },
        16: { name: "Estanteria 16", columns: 5, shelves: 6 },
        17: { name: "Estanteria 17", columns: 5, shelves: 6 },
        18: { name: "Estanteria 18", columns: 5, shelves: 6 },
        19: { name: "Estanteria 19", columns: 5, shelves: 6 },
        20: { name: "Estanteria 20", columns: 5, shelves: 6 },
        21: { name: "Estanteria 21", columns: 5, shelves: 6 },
        22: { name: "Estanteria 22", columns: 5, shelves: 6 },
        23: { name: "Estanteria 23", columns: 5, shelves: 6 },
        24: { name: "Estanteria 24", columns: 5, shelves: 6 },
        25: { name: "Estanteria 25", columns: 5, shelves: 6 },
        26: { name: "Estanteria 26", columns: 5, shelves: 6 },
        27: { name: "Estanteria 27", columns: 5, shelves: 6 },
        28: { name: "Estanteria 28", columns: 5, shelves: 6 },
        29: { name: "Estanteria 29", columns: 5, shelves: 6 },
        30: { name: "Estanteria 30", columns: 5, shelves: 6 }

    },
    
    // Función para obtener la ruta de Firebase según góndola
    getFirebasePath: (gondolaId) => `gondolas/gondola${gondolaId}/positions`
};

// ========================================
// EXPORTAR CONFIGURACIONES
// ========================================

// Hacer disponibles las configuraciones globalmente
window.CONFIG = {
    firebase: firebaseConfig,
    googleSheets: GOOGLE_SHEETS_CONFIG,
    gondola: GONDOLA_CONFIG,
    database: database
};

console.log("✅ Configuración cargada correctamente");
