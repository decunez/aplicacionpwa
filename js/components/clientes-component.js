class ClientesComponent extends HTMLElement {
    constructor() {
        super();
        this.clientes = JSON.parse(localStorage.getItem('clientes')) || [];
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
                    <input type="text" id="nombre-cliente" placeholder="Nombre" required>
                    <input type="text" id="cedula-cliente" placeholder="Cédula" required>
                    <input type="text" id="direccion-cliente" placeholder="Dirección" required>
                    <button type="submit">Registrar Cliente</button>
                </form>
                <div id="lista-clientes">
                    <h3>Clientes Registrados</h3>
                    <ul id="clientes-list"></ul>
                </div>
            </div>
        `;
        this.updateClientesList();
    }

    setupEventListeners() {
        this.querySelector('#form-cliente').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarCliente();
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
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
        this.updateClientesList();
        this.querySelector('#form-cliente').reset();
        
        // Disparar evento para actualizar facturación
        document.dispatchEvent(new CustomEvent('clientesActualizados'));
    }

    updateClientesList() {
        const lista = this.querySelector('#clientes-list');
        lista.innerHTML = this.clientes.map(cliente => `
            <li>
                <strong>${cliente.nombre}</strong> - 
                Cédula: ${cliente.cedula}, 
                Dirección: ${cliente.direccion}
            </li>
        `).join('');
    }
}

customElements.define('clientes-component', ClientesComponent);