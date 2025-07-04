class ProductosComponent extends HTMLElement {
    constructor() {
        super();
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.editingId = null;
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
                    <input type="hidden" id="producto-id">
                    <input type="text" id="nombre-producto" placeholder="Nombre" required>
                    <input type="text" id="codigo-producto" placeholder="Código" required>
                    <input type="number" id="precio-producto" placeholder="Precio" step="0.01" required>
                    <button type="submit" id="submit-producto">Registrar Producto</button>
                    <button type="button" id="cancel-edit" class="cancel-button" style="display: none;">Cancelar</button>
                </form>
                <div id="lista-productos">
                    <h3>Productos Registrados</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Código</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="productos-list"></tbody>
                    </table>
                </div>
            </div>
        `;
        this.updateProductosList();
    }

    setupEventListeners() {
        this.querySelector('#form-producto').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingId) {
                this.actualizarProducto();
            } else {
                this.registrarProducto();
            }
        });

        this.querySelector('#cancel-edit').addEventListener('click', () => {
            this.cancelEdit();
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
        this.saveProductos();
        this.querySelector('#form-producto').reset();
        this.showNotification('Producto registrado con éxito', 'success');
    }

    actualizarProducto() {
        const id = this.querySelector('#producto-id').value;
        const nombre = this.querySelector('#nombre-producto').value;
        const codigo = this.querySelector('#codigo-producto').value;
        const precio = parseFloat(this.querySelector('#precio-producto').value);

        const productoIndex = this.productos.findIndex(p => p.id === id);
        if (productoIndex !== -1) {
            this.productos[productoIndex] = { id, nombre, codigo, precio };
            this.saveProductos();
            this.cancelEdit();
            this.showNotification('Producto actualizado con éxito', 'success');
        }
    }

    editarProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            this.editingId = id;
            this.querySelector('#producto-id').value = producto.id;
            this.querySelector('#nombre-producto').value = producto.nombre;
            this.querySelector('#codigo-producto').value = producto.codigo;
            this.querySelector('#precio-producto').value = producto.precio;
            
            this.querySelector('#submit-producto').textContent = 'Actualizar Producto';
            this.querySelector('#cancel-edit').style.display = 'inline-block';
        }
    }

    eliminarProducto(id) {
        if (confirm('¿Está seguro que desea eliminar este producto?')) {
            this.productos = this.productos.filter(p => p.id !== id);
            this.saveProductos();
            this.showNotification('Producto eliminado con éxito', 'success');
        }
    }

    cancelEdit() {
        this.editingId = null;
        this.querySelector('#form-producto').reset();
        this.querySelector('#submit-producto').textContent = 'Registrar Producto';
        this.querySelector('#cancel-edit').style.display = 'none';
    }

    updateProductosList() {
        const tbody = this.querySelector('#productos-list');
        tbody.innerHTML = this.productos.map(producto => `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.codigo}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td class="actions">
                    <button class="edit-button" data-id="${producto.id}">Editar</button>
                    <button class="delete-button" data-id="${producto.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Agregar evento listeners a los botones
        this.querySelectorAll('.edit-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editarProducto(e.target.getAttribute('data-id'));
            });
        });

        this.querySelectorAll('.delete-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.eliminarProducto(e.target.getAttribute('data-id'));
            });
        });
    }

    saveProductos() {
        localStorage.setItem('productos', JSON.stringify(this.productos));
        this.updateProductosList();
        document.dispatchEvent(new CustomEvent('productosActualizados'));
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

customElements.define('productos-component', ProductosComponent);