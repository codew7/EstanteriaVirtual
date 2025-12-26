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
    totalGondolas: 20,
    
    // Configuración específica por góndola (todas con dimensiones 5x6)
    gondolaSettings: {
        1: { name: "Góndola Principal", columns: 5, shelves: 6 },
        2: { name: "Góndola Bebidas", columns: 5, shelves: 6 },
        3: { name: "Góndola Lácteos", columns: 5, shelves: 6 },
        4: { name: "Góndola Limpieza", columns: 5, shelves: 6 },
        5: { name: "Góndola Almacén", columns: 5, shelves: 6 },
        6: { name: "Góndola Higiene", columns: 5, shelves: 6 },
        7: { name: "Góndola Golosinas", columns: 5, shelves: 6 },
        8: { name: "Góndola Panadería", columns: 5, shelves: 6 },
        9: { name: "Góndola Congelados", columns: 5, shelves: 6 },
        10: { name: "Góndola Especial", columns: 5, shelves: 6 }
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
