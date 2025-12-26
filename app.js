// ========================================
// APLICACIÓN PRINCIPAL - GESTIÓN DE GÓNDOLA
// ========================================

class GondolaApp {
    constructor() {
        // Detectar ID de góndola desde URL
        this.gondolaId = this.getGondolaIdFromURL();
        
        // Obtener configuración específica de esta góndola
        const gondolaSettings = window.CONFIG.gondola.gondolaSettings[this.gondolaId] || {
            name: `Góndola ${this.gondolaId}`,
            columns: window.CONFIG.gondola.defaultColumns,
            shelves: window.CONFIG.gondola.defaultShelves
        };
        
        this.gondolaName = gondolaSettings.name;
        this.columns = gondolaSettings.columns;
        this.shelves = gondolaSettings.shelves;
        this.gondolaData = {}; // {position: productId}
        this.productsInGondola = new Set();
        this.draggedProduct = null;
        this.selectedPosition = null; // Para el modal de búsqueda
        
        this.init();
    }
    
    /**
     * Obtener ID de góndola desde parámetro URL
     */
    getGondolaIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const gondolaId = parseInt(urlParams.get('gondola')) || 1;
        
        // Validar que esté en el rango permitido
        if (gondolaId < 1 || gondolaId > window.CONFIG.gondola.totalGondolas) {
            console.warn(`ID de góndola ${gondolaId} fuera de rango. Usando góndola 1.`);
            return 1;
        }
        
        return gondolaId;
    }

    /**
     * Inicializar la aplicación
     */
    async init() {
        console.log(`🚀 Inicializando ${this.gondolaName} (ID: ${this.gondolaId})...`);
        
        // Actualizar título de la página
        document.title = `Estantería ${this.gondolaId} - Gestión`;
        
        // Actualizar encabezado con nombre de góndola
        const header = document.querySelector('header h1');
        if (header) {
            header.innerHTML = `📍 ${this.gondolaName}`;
        }
        
        // Actualizar título de la góndola
        const gondolaTitle = document.getElementById('gondolaTitle');
        if (gondolaTitle) {
            gondolaTitle.textContent = `Estantería Nro ${this.gondolaId}`;
        }
        
        // Cargar productos
        await this.loadProducts();
        
        // Crear góndola
        this.createGondola();
        
        // Cargar posiciones desde Firebase
        await this.loadGondolaFromFirebase();
        
        // Configurar listeners
        this.setupEventListeners();
        
        // Actualizar estadísticas
        this.updateStats();
        
        console.log("✅ Aplicación lista");
    }

    /**
     * Cargar productos desde Google Sheets
     */
    async loadProducts() {
        const loadingElement = document.getElementById('loadingProducts');
        const productsListElement = document.getElementById('productsList');
        
        loadingElement.style.display = 'block';
        productsListElement.innerHTML = '';
        
        try {
            await window.GoogleSheets.loadProducts();
            this.renderProductsList();
            this.renderCategoryFilter();
        } catch (error) {
            console.error("Error al cargar productos:", error);
            productsListElement.innerHTML = '<p style="color: red;">Error al cargar productos</p>';
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * Renderizar lista de productos
     */
    renderProductsList(searchTerm = '', category = '') {
        const productsListElement = document.getElementById('productsList');
        const products = window.GoogleSheets.filterProducts(searchTerm, category);
        
        if (products.length === 0) {
            productsListElement.innerHTML = '<p style="text-align: center; color: #999;">No se encontraron productos</p>';
            return;
        }
        
        productsListElement.innerHTML = products.map(product => {
            const inGondola = this.productsInGondola.has(product.id);
            const position = this.getProductPosition(product.id);
            
            return `
                <div class="product-item ${inGondola ? 'in-gondola' : ''}" 
                     draggable="true" 
                     data-product-id="${product.id}">
                    <div class="product-name">${product.name}</div>
                    <div class="product-details">
                        ID: ${product.id} | ${product.category}
                    </div>
                    <div class="product-price">
                        ${window.GoogleSheets.formatPrice(product.price)}
                        ${product.priceBox ? ` | Caja: ${window.GoogleSheets.formatPrice(product.priceBox)}` : ''}
                    </div>
                    ${product.stock !== undefined ? `<div class="product-details" style="color: ${product.stock > 0 ? '#2ecc71' : '#e74c3c'};">Stock: ${product.stock}</div>` : ''}
                    ${inGondola ? `<div class="product-details" style="color: #4caf50; font-weight: bold;">📍 ${position}</div>` : ''}
                </div>
            `;
        }).join('');
        
        // Configurar drag & drop en productos
        this.setupProductDragDrop();
    }

    /**
     * Renderizar filtro de categorías
     */
    renderCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = window.GoogleSheets.getCategories();
        
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    /**
     * Crear el grid de la góndola
     */
    createGondola() {
        const gondolaElement = document.getElementById('gondola');
        gondolaElement.innerHTML = '';
        gondolaElement.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
        
        for (let shelf = 1; shelf <= this.shelves; shelf++) {
            for (let col = 1; col <= this.columns; col++) {
                const position = `C${col}-E${shelf}`;
                const cell = document.createElement('div');
                cell.className = 'shelf-cell';
                cell.dataset.position = position;
                
                gondolaElement.appendChild(cell);
            }
        }
        
        // Configurar drop zones
        this.setupDropZones();
    }

    /**
     * Configurar drag & drop en productos
     */
    setupProductDragDrop() {
        const productItems = document.querySelectorAll('.product-item');
        
        productItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const productId = e.target.dataset.productId;
                this.draggedProduct = productId;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', productId);
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                this.draggedProduct = null;
            });
        });
    }

    /**
     * Configurar zonas de drop en la góndola
     */
    setupDropZones() {
        const cells = document.querySelectorAll('.shelf-cell');
        
        cells.forEach(cell => {
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                cell.classList.add('drag-over');
            });
            
            cell.addEventListener('dragleave', (e) => {
                cell.classList.remove('drag-over');
            });
            
            cell.addEventListener('drop', async (e) => {
                e.preventDefault();
                cell.classList.remove('drag-over');
                
                const position = cell.dataset.position;
                const productId = this.draggedProduct;
                
                if (productId) {
                    await this.placeProductInGondola(productId, position);
                }
            });
            
            // Click para ver detalles o seleccionar producto
            cell.addEventListener('click', () => {
                const position = cell.dataset.position;
                const productId = this.gondolaData[position];
                
                if (productId) {
                    // Si hay producto, mostrar detalles
                    this.showProductModal(productId, position);
                } else {
                    // Si está vacía, abrir buscador
                    this.openSearchModal(position);
                }
            });
        });
    }

    /**
     * Colocar producto en la góndola
     */
    async placeProductInGondola(productId, position) {
        // Verificar si el producto ya está en otra posición
        const oldPosition = this.getProductPosition(productId);
        if (oldPosition) {
            delete this.gondolaData[oldPosition];
        }
        
        // Verificar si la posición está ocupada
        if (this.gondolaData[position]) {
            const confirm = window.confirm(`La posición ${position} está ocupada. ¿Deseas reemplazar el producto?`);
            if (!confirm) return;
            
            const oldProductId = this.gondolaData[position];
            this.productsInGondola.delete(oldProductId);
        }
        
        // Colocar producto
        this.gondolaData[position] = productId;
        this.productsInGondola.add(productId);
        
        // Actualizar Firebase
        await this.saveToFirebase(position, productId);
        
        // Actualizar UI
        this.updateCellDisplay(position);
        this.renderProductsList(
            document.getElementById('searchInput').value,
            document.getElementById('categoryFilter').value
        );
        this.updateStats();
        
        console.log(`✅ Producto ${productId} colocado en ${position}`);
    }

    /**
     * Actualizar visualización de una celda
     */
    updateCellDisplay(position) {
        const cell = document.querySelector(`[data-position="${position}"]`);
        const productId = this.gondolaData[position];
        
        if (productId) {
            const product = window.GoogleSheets.getProductById(productId);
            if (product) {
                cell.classList.add('occupied');
                const imageUrl = product.imageUrl ? product.imageUrl.split(',')[0].trim() : '';
                cell.innerHTML = `
                    <div class="product-in-cell">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" class="product-image">` : '<div class="no-image">📦</div>'}
                        <div class="name">${product.name}</div>
                        <div class="price">${window.GoogleSheets.formatPrice(product.price)}</div>
                    </div>
                `;
            }
        } else {
            cell.classList.remove('occupied');
            cell.innerHTML = '';
        }
    }

    /**
     * Obtener posición de un producto
     */
    getProductPosition(productId) {
        for (const [position, id] of Object.entries(this.gondolaData)) {
            if (id === productId) {
                return position;
            }
        }
        return null;
    }

    /**
     * Guardar en Firebase
     */
    async saveToFirebase(position, productId) {
        try {
            const firebasePath = window.CONFIG.gondola.getFirebasePath(this.gondolaId);
            const ref = window.CONFIG.database.ref(`${firebasePath}/${position}`);
            
            if (productId) {
                await ref.set({
                    productId: productId,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
            } else {
                await ref.remove();
            }
            
            console.log(`💾 Firebase actualizado (${this.gondolaName}): ${position} = ${productId || 'vacío'}`);
        } catch (error) {
            console.error("Error al guardar en Firebase:", error);
            alert("Error al guardar los cambios. Verifica tu configuración de Firebase.");
        }
    }

    /**
     * Cargar góndola desde Firebase
     */
    async loadGondolaFromFirebase() {
        try {
            const firebasePath = window.CONFIG.gondola.getFirebasePath(this.gondolaId);
            const ref = window.CONFIG.database.ref(firebasePath);
            
            ref.on('value', (snapshot) => {
                const data = snapshot.val();
                
                if (data) {
                    this.gondolaData = {};
                    this.productsInGondola.clear();
                    
                    Object.entries(data).forEach(([position, info]) => {
                        if (info && info.productId) {
                            this.gondolaData[position] = info.productId;
                            this.productsInGondola.add(info.productId);
                        }
                    });
                    
                    // Actualizar todas las celdas
                    Object.keys(this.gondolaData).forEach(position => {
                        this.updateCellDisplay(position);
                    });
                    
                    // Actualizar lista de productos
                    this.renderProductsList(
                        document.getElementById('searchInput').value,
                        document.getElementById('categoryFilter').value
                    );
                    
                    this.updateStats();
                    console.log(`🔄 ${this.gondolaName} sincronizada desde Firebase`);
                }
            });
            
            console.log(`✅ Escuchando cambios en tiempo real de ${this.gondolaName}`);
        } catch (error) {
            console.error("Error al cargar desde Firebase:", error);
        }
    }

    /**
     * Mostrar modal con detalles del producto
     */
    showProductModal(productId, position) {
        const product = window.GoogleSheets.getProductById(productId);
        if (!product) return;
        
        const modal = document.getElementById('productModal');
        const modalName = document.getElementById('modalProductName');
        const modalDetails = document.getElementById('modalProductDetails');
        const removeBtn = document.getElementById('removeProductBtn');
        
        modalName.textContent = product.name;
        modalDetails.innerHTML = `
            <p><strong>ID:</strong> ${product.id}</p>
            <p><strong>Categoría:</strong> ${product.category}</p>
            <p><strong>Precio Unitario:</strong> ${window.GoogleSheets.formatPrice(product.price)}</p>
            ${product.priceBox ? `<p><strong>Precio por Caja:</strong> ${window.GoogleSheets.formatPrice(product.priceBox)}</p>` : ''}
            ${product.stock !== undefined ? `<p><strong>Stock:</strong> <span style="color: ${product.stock > 0 ? '#2ecc71' : '#e74c3c'};">${product.stock} unidades</span></p>` : ''}
            <p><strong>Posición:</strong> ${position}</p>
        `;
        
        // Configurar botón de eliminar
        removeBtn.onclick = async () => {
            await this.removeProductFromGondola(position);
            modal.style.display = 'none';
        };
        
        modal.style.display = 'block';
    }

    /**
     * Abrir modal de búsqueda para seleccionar producto
     */
    openSearchModal(position) {
        this.selectedPosition = position;
        const modal = document.getElementById('searchModal');
        const input = document.getElementById('searchModalInput');
        const results = document.getElementById('searchModalResults');
        
        modal.classList.add('active');
        input.value = '';
        input.focus();
        
        // Renderizar todos los productos inicialmente
        this.renderSearchResults('');
        
        // Event listener para búsqueda en tiempo real
        input.oninput = (e) => {
            this.renderSearchResults(e.target.value);
        };
    }
    
    /**
     * Renderizar resultados de búsqueda en el modal
     */
    renderSearchResults(query) {
        const results = document.getElementById('searchModalResults');
        const products = window.GoogleSheets.getProducts();
        
        // Filtrar productos
        const filtered = products.filter(product => {
            const searchTerm = query.toLowerCase();
            return product.name.toLowerCase().includes(searchTerm) ||
                   product.id.toLowerCase().includes(searchTerm) ||
                   (product.category && product.category.toLowerCase().includes(searchTerm));
        });
        
        if (filtered.length === 0) {
            results.innerHTML = '<div class="search-no-results">🔍 No se encontraron productos</div>';
            return;
        }
        
        results.innerHTML = filtered.map(product => `
            <div class="search-result-item" onclick="window.app.selectProductFromSearch('${product.id}')">
                <div class="name">${product.name}</div>
                <div class="details">${product.category || 'Sin categoría'} • Código: ${product.id}</div>
                <div class="price">${window.GoogleSheets.formatPrice(product.price)}</div>
            </div>
        `).join('');
    }
    
    /**
     * Seleccionar producto desde el modal de búsqueda
     */
    async selectProductFromSearch(productId) {
        if (this.selectedPosition) {
            await this.placeProductInGondola(productId, this.selectedPosition);
            closeSearchModal();
        }
    }

    /**
     * Remover producto de la góndola
     */
    async removeProductFromGondola(position) {
        const productId = this.gondolaData[position];
        
        if (productId) {
            delete this.gondolaData[position];
            this.productsInGondola.delete(productId);
            
            await this.saveToFirebase(position, null);
            this.updateCellDisplay(position);
            this.renderProductsList(
                document.getElementById('searchInput').value,
                document.getElementById('categoryFilter').value
            );
            this.updateStats();
            
            console.log(`🗑️ Producto ${productId} removido de ${position}`);
        }
    }

    /**
     * Limpiar toda la góndola
     */
    async clearGondola() {
        if (!confirm(`¿Estás seguro de que deseas limpiar toda la ${this.gondolaName}?`)) {
            return;
        }
        
        try {
            const firebasePath = window.CONFIG.gondola.getFirebasePath(this.gondolaId);
            const ref = window.CONFIG.database.ref(firebasePath);
            await ref.remove();
            
            this.gondolaData = {};
            this.productsInGondola.clear();
            
            // Limpiar todas las celdas
            document.querySelectorAll('.shelf-cell').forEach(cell => {
                cell.classList.remove('occupied');
                cell.innerHTML = '';
            });
            
            this.renderProductsList(
                document.getElementById('searchInput').value,
                document.getElementById('categoryFilter').value
            );
            this.updateStats();
            
            console.log(`🗑️ ${this.gondolaName} limpiada completamente`);
        } catch (error) {
            console.error("Error al limpiar góndola:", error);
            alert("Error al limpiar la góndola");
        }
    }



    /**
     * Actualizar estadísticas
     */
    updateStats() {
        const totalProducts = window.GoogleSheets.getProducts().length;
        const productsInGondola = this.productsInGondola.size;
        const totalSpaces = this.columns * this.shelves;
        const availableSpaces = totalSpaces - productsInGondola;
        
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('productsInGondola').textContent = productsInGondola;
        document.getElementById('availableSpaces').textContent = availableSpaces;
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        searchInput.addEventListener('input', (e) => {
            this.renderProductsList(e.target.value, categoryFilter.value);
        });
        
        categoryFilter.addEventListener('change', (e) => {
            this.renderProductsList(searchInput.value, e.target.value);
        });
        
        // Botones de control
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearGondola();
        });
        
        // Modal
        const modal = document.getElementById('productModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GondolaApp();
});

console.log("✅ App.js cargado");
