class ProductosComponent extends HTMLElement {
    constructor() {
        super();
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="componente">
                <h2>Gestión de Productos</h2>
                <form id="form-producto">
                    <input type="text" id="nombre-producto" placeholder="Nombre" required>
                    <input type="text" id="codigo-producto" placeholder="Código" required>
                    <input type="number" id="precio-producto" placeholder="Precio" step="0.01" required>
                    <button type="submit">Registrar Producto</button>
                </form>
                <div id="lista-productos">
                    <h3>Productos Registrados</h3>
                    <ul id="productos-list"></ul>
                </div>
            </div>
        `;
        this.updateProductosList();
    }

    setupEventListeners() {
        this.querySelector('#form-producto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarProducto();
        });
    }

    registrarProducto() {
        const nombre = this.querySelector('#nombre-producto').value;
        const codigo = this.querySelector('#codigo-producto').value;
        const precio = parseFloat(this.querySelector('#precio-producto').value);

        const nuevoProducto = {
            id: Date.now().toString(),
            nombre,
            codigo,
            precio
        };

        this.productos.push(nuevoProducto);
        localStorage.setItem('productos', JSON.stringify(this.productos));
        this.updateProductosList();
        this.querySelector('#form-producto').reset();
        
        // Disparar evento para actualizar facturación
        document.dispatchEvent(new CustomEvent('productosActualizados'));
    }

    updateProductosList() {
        const lista = this.querySelector('#productos-list');
        lista.innerHTML = this.productos.map(producto => `
            <li>
                <strong>${producto.nombre}</strong> - 
                Código: ${producto.codigo}, 
                Precio: $${producto.precio.toFixed(2)}
            </li>
        `).join('');
    }
}

customElements.define('productos-component', ProductosComponent);