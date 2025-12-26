// ========================================
// GOOGLE SHEETS INTEGRATION
// ========================================

class GoogleSheetsManager {
    constructor() {
        this.products = [];
        this.categories = new Set();
        this.isLoaded = false;
    }

    /**
     * Cargar productos desde Google Sheets
     */
    async loadProducts() {
        const { apiKey, spreadsheetId, sheetName, range } = window.CONFIG.googleSheets;
        
        if (!apiKey || apiKey === "TU_GOOGLE_API_KEY_AQUI") {
            console.warn("⚠️ Google Sheets API Key no configurada. Usando datos de ejemplo...");
            this.loadSampleData();
            return this.products;
        }

        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${range}?key=${apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.values || data.values.length === 0) {
                console.warn("⚠️ No se encontraron datos en Google Sheets");
                this.loadSampleData();
                return this.products;
            }

            // Procesar los datos según la estructura de Google Sheets
            // Columna A=Categoría, B=URL, C=Código, D=Nombre, G=PrecioU, H=PrecioC, K=Stock
            this.products = data.values
                .filter(row => row.length >= 3 && row[2]) // Filtrar filas sin código
                .map(row => ({
                    id: row[2]?.toString().trim() || '',           // Columna C (código)
                    name: row[3]?.toString().trim() || 'Sin nombre', // Columna D (nombre)
                    category: row[0]?.toString().trim() || 'Sin categoría', // Columna A (categoría)
                    price: this.parsePrice(row[6]),                // Columna G (valorU)
                    priceBox: this.parsePrice(row[7]),             // Columna H (valorC)
                    imageUrl: row[1]?.toString().trim() || '',     // Columna B (URL imagen)
                    stock: parseInt(row[10]) || 0                  // Columna K (stock)
                }));

            // Extraer categorías únicas
            this.products.forEach(product => {
                if (product.category) {
                    this.categories.add(product.category);
                }
            });

            this.isLoaded = true;
            console.log(`✅ ${this.products.length} productos cargados desde Google Sheets`);
            
            return this.products;

        } catch (error) {
            console.error("❌ Error al cargar datos de Google Sheets:", error);
            console.log("Usando datos de ejemplo...");
            this.loadSampleData();
            return this.products;
        }
    }

    /**
     * Parsear precio desde texto (mantener solo números, punto decimal y guión)
     */
    parsePrice(priceText) {
        if (!priceText) return 0;
        
        // Eliminar todo excepto números, punto y guión (igual que mayorista.html)
        const cleanPrice = priceText.toString().replace(/[^0-9.-]+/g, '');
        
        const price = parseFloat(cleanPrice);
        return isNaN(price) ? 0 : price;
    }

    /**
     * Formatear precio para mostrar (igual que mayorista.html)
     */
    formatPrice(price) {
        const numero = Math.round(parseFloat(price) || 0);
        return `$ ${numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }

    /**
     * Cargar datos de ejemplo si Google Sheets no está configurado
     */
    loadSampleData() {
        this.products = [
            { id: "001", name: "Coca Cola 2.25L", category: "Bebidas", price: 1500, priceBox: 18000, imageUrl: "", stock: 50 },
            { id: "002", name: "Leche Entera La Serenísima 1L", category: "Lácteos", price: 850, priceBox: 10200, imageUrl: "", stock: 30 },
            { id: "003", name: "Pan Lactal Bimbo", category: "Panadería", price: 950, priceBox: 11400, imageUrl: "", stock: 45 },
            { id: "004", name: "Arroz Gallo Oro 1kg", category: "Almacén", price: 680, priceBox: 8160, imageUrl: "", stock: 100 },
            { id: "005", name: "Aceite Girasol Cocinero 900ml", category: "Almacén", price: 1250, priceBox: 15000, imageUrl: "", stock: 60 },
            { id: "006", name: "Yerba Mate Playadito 1kg", category: "Infusiones", price: 1800, priceBox: 21600, imageUrl: "", stock: 80 },
            { id: "007", name: "Azúcar Ledesma 1kg", category: "Almacén", price: 720, priceBox: 8640, imageUrl: "", stock: 90 },
            { id: "008", name: "Fideos Matarazzo 500g", category: "Pastas", price: 580, priceBox: 6960, imageUrl: "", stock: 120 },
            { id: "009", name: "Mayonesa Hellmann's 500g", category: "Aderezos", price: 1350, priceBox: 16200, imageUrl: "", stock: 40 },
            { id: "010", name: "Café La Virginia 250g", category: "Infusiones", price: 2100, priceBox: 25200, imageUrl: "", stock: 35 },
            { id: "011", name: "Jabón Polvo Ala 800g", category: "Limpieza", price: 1450, priceBox: 17400, imageUrl: "", stock: 55 },
            { id: "012", name: "Papel Higiénico Elite x4", category: "Higiene", price: 980, priceBox: 11760, imageUrl: "", stock: 70 },
            { id: "013", name: "Galletitas Oreo 118g", category: "Golosinas", price: 750, priceBox: 9000, imageUrl: "", stock: 85 },
            { id: "014", name: "Atún La Campagnola x2", category: "Conservas", price: 1680, priceBox: 20160, imageUrl: "", stock: 45 },
            { id: "015", name: "Mermelada Arcor Frutilla 390g", category: "Dulces", price: 890, priceBox: 10680, imageUrl: "", stock: 60 },
            { id: "016", name: "Yogurt Ser Frutilla x4", category: "Lácteos", price: 1250, priceBox: 15000, imageUrl: "", stock: 50 },
            { id: "017", name: "Queso Cremoso La Paulina 300g", category: "Lácteos", price: 1950, priceBox: 23400, imageUrl: "", stock: 30 },
            { id: "018", name: "Cerveza Quilmes 1L", category: "Bebidas", price: 1100, priceBox: 13200, imageUrl: "", stock: 90 },
            { id: "019", name: "Vino Toro Tinto 1L", category: "Bebidas", price: 1600, priceBox: 19200, imageUrl: "", stock: 40 },
            { id: "020", name: "Jugo Baggio Naranja 1L", category: "Bebidas", price: 820, priceBox: 9840, imageUrl: "", stock: 75 },
            { id: "021", name: "Shampoo Sedal 340ml", category: "Higiene", price: 1380, priceBox: 16560, imageUrl: "", stock: 55 },
            { id: "022", name: "Desodorante Axe 150ml", category: "Higiene", price: 1520, priceBox: 18240, imageUrl: "", stock: 65 },
            { id: "023", name: "Detergente Magistral 500ml", category: "Limpieza", price: 680, priceBox: 8160, imageUrl: "", stock: 80 },
            { id: "024", name: "Lavandina Ayudín 1L", category: "Limpieza", price: 550, priceBox: 6600, imageUrl: "", stock: 95 },
            { id: "025", name: "Harina 0000 Morixe 1kg", category: "Almacén", price: 620, priceBox: 7440, imageUrl: "", stock: 110 }
        ];

        // Extraer categorías
        this.products.forEach(product => {
            this.categories.add(product.category);
        });

        this.isLoaded = true;
        console.log(`ℹ️ ${this.products.length} productos de ejemplo cargados`);
    }

    /**
     * Obtener todos los productos
     */
    getProducts() {
        return this.products;
    }

    /**
     * Obtener producto por ID
     */
    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    /**
     * Obtener todas las categorías
     */
    getCategories() {
        return Array.from(this.categories).sort();
    }

    /**
     * Filtrar productos por búsqueda y categoría
     */
    filterProducts(searchTerm = '', category = '') {
        let filtered = this.products;

        // Filtrar por categoría
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) ||
                p.id.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
            );
        }

        return filtered;
    }

    /**
     * Actualizar/refrescar productos desde Google Sheets
     */
    async refreshProducts() {
        console.log("🔄 Actualizando productos...");
        this.products = [];
        this.categories.clear();
        this.isLoaded = false;
        return await this.loadProducts();
    }
}

// Exportar instancia global
window.GoogleSheets = new GoogleSheetsManager();

console.log("✅ Google Sheets Manager inicializado");
