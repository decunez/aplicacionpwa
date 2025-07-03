class FacturacionComponent extends HTMLElement {
    constructor() {
        super();
        this.facturas = JSON.parse(localStorage.getItem('facturas')) || [];
        this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        this.productos = JSON.parse(localStorage.getItem('productos')) || [];
        this.productosSeleccionados = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        
        // Escuchar eventos de actualización
        document.addEventListener('clientesActualizados', () => {
            this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
            this.updateClienteSelect();
        });
        
        document.addEventListener('productosActualizados', () => {
            this.productos = JSON.parse(localStorage.getItem('productos')) || [];
            this.updateProductoSelect();
        });
    }

    render() {
        this.innerHTML = `
            <div class="componente">
                <h2>Facturación</h2>
                <div class="factura-form">
                    <div class="form-group">
                        <label for="cliente-select">Cliente:</label>
                        <select id="cliente-select"></select>
                    </div>
                    
                    <div class="form-group">
                        <label for="producto-select">Producto:</label>
                        <select id="producto-select"></select>
                        <input type="number" id="producto-cantidad" placeholder="Cantidad" min="1" value="1">
                        <button id="agregar-producto">Agregar</button>
                    </div>
                    
                    <div id="productos-factura">
                        <h3>Productos en Factura</h3>
                        <table id="productos-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Subtotal</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody id="productos-factura-body"></tbody>
                        </table>
                    </div>
                    
                    <div class="resumen-factura">
                        <h3>Resumen de Factura</h3>
                        <p>Subtotal: $<span id="subtotal">0.00</span></p>
                        <p>Total: $<span id="total">0.00</span></p>
                        <button id="generar-factura">Generar Factura</button>
                    </div>
                </div>
                
                <div id="lista-facturas">
                    <h3>Facturas Generadas</h3>
                    <div id="facturas-list"></div>
                </div>
            </div>
        `;
        
        this.updateClienteSelect();
        this.updateProductoSelect();
        this.updateFacturasList();
    }

    setupEventListeners() {
        this.querySelector('#agregar-producto').addEventListener('click', () => {
            this.agregarProductoAFactura();
        });
        
        this.querySelector('#generar-factura').addEventListener('click', () => {
            this.generarFactura();
        });
    }

    updateClienteSelect() {
        const select = this.querySelector('#cliente-select');
        select.innerHTML = this.clientes.map(cliente => 
            `<option value="${cliente.id}">${cliente.nombre} (${cliente.cedula})</option>`
        ).join('');
    }

    updateProductoSelect() {
        const select = this.querySelector('#producto-select');
        select.innerHTML = this.productos.map(producto => 
            `<option value="${producto.id}">${producto.nombre} ($${producto.precio.toFixed(2)})</option>`
        ).join('');
    }

    agregarProductoAFactura() {
        const productoId = this.querySelector('#producto-select').value;
        const cantidad = parseInt(this.querySelector('#producto-cantidad').value);
        
        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) return;
        
        const productoExistente = this.productosSeleccionados.find(p => p.id === productoId);
        
        if (productoExistente) {
            productoExistente.cantidad += cantidad;
            productoExistente.subtotal = productoExistente.cantidad * producto.precio;
        } else {
            this.productosSeleccionados.push({
                id: productoId,
                nombre: producto.nombre,
                cantidad,
                precio: producto.precio,
                subtotal: cantidad * producto.precio
            });
        }
        
        this.updateProductosFactura();
    }

    updateProductosFactura() {
        const tbody = this.querySelector('#productos-factura-body');
        tbody.innerHTML = this.productosSeleccionados.map(producto => `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>$${producto.subtotal.toFixed(2)}</td>
                <td><button class="eliminar-producto" data-id="${producto.id}">Eliminar</button></td>
            </tr>
        `).join('');
        
        // Agregar event listeners a los botones de eliminar
        this.querySelectorAll('.eliminar-producto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.productosSeleccionados = this.productosSeleccionados.filter(p => p.id !== id);
                this.updateProductosFactura();
            });
        });
        
        this.calcularTotales();
    }

    calcularTotales() {
        const subtotal = this.productosSeleccionados.reduce((sum, producto) => sum + producto.subtotal, 0);
        const total = subtotal; // Aquí podrías agregar impuestos si fuera necesario
        
        this.querySelector('#subtotal').textContent = subtotal.toFixed(2);
        this.querySelector('#total').textContent = total.toFixed(2);
    }

    generarFactura() {
        if (this.productosSeleccionados.length === 0) {
            alert('Debe agregar al menos un producto a la factura');
            return;
        }
        
        const clienteId = this.querySelector('#cliente-select').value;
        const cliente = this.clientes.find(c => c.id === clienteId);
        
        if (!cliente) {
            alert('Seleccione un cliente válido');
            return;
        }
        
        const nuevaFactura = {
            id: Date.now().toString(),
            clienteId: cliente.id,
            clienteNombre: cliente.nombre,
            productos: this.productosSeleccionados.map(p => ({
                idProducto: p.id,
                nombre: p.nombre,
                cantidad: p.cantidad,
                precioUnitario: p.precio,
                subtotal: p.subtotal
            })),
            subtotal: parseFloat(this.querySelector('#subtotal').textContent),
            total: parseFloat(this.querySelector('#total').textContent),
            fecha: new Date().toISOString().split('T')[0]
        };
        
        this.facturas.push(nuevaFactura);
        localStorage.setItem('facturas', JSON.stringify(this.facturas));
        
        this.productosSeleccionados = [];
        this.updateProductosFactura();
        this.updateFacturasList();
    }

    updateFacturasList() {
        const container = this.querySelector('#facturas-list');
        container.innerHTML = this.facturas.map(factura => `
            <div class="factura-card">
                <h4>Factura #${factura.id}</h4>
                <p><strong>Cliente:</strong> ${factura.clienteNombre}</p>
                <p><strong>Fecha:</strong> ${factura.fecha}</p>
                <p><strong>Total:</strong> $${factura.total.toFixed(2)}</p>
                <button class="ver-detalle" data-id="${factura.id}">Ver Detalle</button>
                <div class="detalle-factura" id="detalle-${factura.id}" style="display:none;">
                    <h5>Detalle de Factura</h5>
                    <ul>
                        ${factura.productos.map(p => `
                            <li>${p.nombre} - ${p.cantidad} x $${p.precioUnitario.toFixed(2)} = $${p.subtotal.toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners a los botones de ver detalle
        this.querySelectorAll('.ver-detalle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const detalle = this.querySelector(`#detalle-${id}`);
                detalle.style.display = detalle.style.display === 'none' ? 'block' : 'none';
            });
        });
    }
}

customElements.define('facturacion-component', FacturacionComponent);