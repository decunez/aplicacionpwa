class ClientesComponent extends HTMLElement {
    constructor() {
        super();
        this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        this.editingId = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="componente">
                <h2>Gestión de Clientes</h2>
                <form id="form-cliente">
                    <input type="hidden" id="cliente-id">
                    <input type="text" id="nombre-cliente" placeholder="Nombre" required>
                    <input type="text" id="cedula-cliente" placeholder="Cédula" required>
                    <input type="text" id="direccion-cliente" placeholder="Dirección" required>
                    <button type="submit" id="submit-cliente">Registrar Cliente</button>
                    <button type="button" id="cancel-edit" class="cancel-button" style="display: none;">Cancelar</button>
                </form>
                <div id="lista-clientes">
                    <h3>Clientes Registrados</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cédula</th>
                                <th>Dirección</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="clientes-list"></tbody>
                    </table>
                </div>
            </div>
        `;
        this.updateClientesList();
    }

    setupEventListeners() {
        this.querySelector('#form-cliente').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingId) {
                this.actualizarCliente();
            } else {
                this.registrarCliente();
            }
        });

        this.querySelector('#cancel-edit').addEventListener('click', () => {
            this.cancelEdit();
        });
    }

    registrarCliente() {
        const nombre = this.querySelector('#nombre-cliente').value;
        const cedula = this.querySelector('#cedula-cliente').value;
        const direccion = this.querySelector('#direccion-cliente').value;

        const nuevoCliente = {
            id: Date.now().toString(),
            nombre,
            cedula,
            direccion
        };

        this.clientes.push(nuevoCliente);
        this.saveClientes();
        this.querySelector('#form-cliente').reset();
        this.showNotification('Cliente registrado con éxito', 'success');
    }

    actualizarCliente() {
        const id = this.querySelector('#cliente-id').value;
        const nombre = this.querySelector('#nombre-cliente').value;
        const cedula = this.querySelector('#cedula-cliente').value;
        const direccion = this.querySelector('#direccion-cliente').value;

        const clienteIndex = this.clientes.findIndex(c => c.id === id);
        if (clienteIndex !== -1) {
            this.clientes[clienteIndex] = { id, nombre, cedula, direccion };
            this.saveClientes();
            this.cancelEdit();
            this.showNotification('Cliente actualizado con éxito', 'success');
        }
    }

    editarCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            this.editingId = id;
            this.querySelector('#cliente-id').value = cliente.id;
            this.querySelector('#nombre-cliente').value = cliente.nombre;
            this.querySelector('#cedula-cliente').value = cliente.cedula;
            this.querySelector('#direccion-cliente').value = cliente.direccion;
            
            this.querySelector('#submit-cliente').textContent = 'Actualizar Cliente';
            this.querySelector('#cancel-edit').style.display = 'inline-block';
        }
    }

    eliminarCliente(id) {
        if (confirm('¿Está seguro que desea eliminar este cliente?')) {
            this.clientes = this.clientes.filter(c => c.id !== id);
            this.saveClientes();
            this.showNotification('Cliente eliminado con éxito', 'success');
        }
    }

    cancelEdit() {
        this.editingId = null;
        this.querySelector('#form-cliente').reset();
        this.querySelector('#submit-cliente').textContent = 'Registrar Cliente';
        this.querySelector('#cancel-edit').style.display = 'none';
    }

    updateClientesList() {
        const tbody = this.querySelector('#clientes-list');
        tbody.innerHTML = this.clientes.map(cliente => `
            <tr>
                <td>${cliente.nombre}</td>
                <td>${cliente.cedula}</td>
                <td>${cliente.direccion}</td>
                <td class="actions">
                    <button class="edit-button" data-id="${cliente.id}">Editar</button>
                    <button class="delete-button" data-id="${cliente.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Agregar evento listeners a los botones
        this.querySelectorAll('.edit-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editarCliente(e.target.getAttribute('data-id'));
            });
        });

        this.querySelectorAll('.delete-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.eliminarCliente(e.target.getAttribute('data-id'));
            });
        });
    }

    saveClientes() {
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
        this.updateClientesList();
        document.dispatchEvent(new CustomEvent('clientesActualizados'));
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

customElements.define('clientes-component', ClientesComponent);