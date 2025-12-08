let itemsBD = [];

// Cargar ítems desde la base de datos
async function cargarItems() {
  try {
    const response = await fetch('/api/get_items');
    if (!response.ok) throw new Error('Error al cargar ítems');
    itemsBD = await response.json();
  } catch (error) {
    console.error('⚠️ Error:', error);
    alert('No se pudieron cargar los ítems.');
  }
}

// Funciones auxiliares
function obtenerSeleccionados(selectActual = null) {
  return Array.from(document.querySelectorAll('.descripcion'))
    .filter(s => s !== selectActual)
    .map(s => s.value)
    .filter(v => v !== '');
}

function crearOpcionesHTML(selectActual = null) {
  const seleccionados = obtenerSeleccionados(selectActual);
  return itemsBD
    .filter(item => !seleccionados.includes(item.itm_descripcion))
    .map(item => `<option value="${item.itm_descripcion}" data-precio="${item.itm_precio}">${item.itm_descripcion}</option>`)
    .join('');
}

function renumerarItems() {
  document.querySelectorAll('#itemsBody tr').forEach((row, index) => {
    row.cells[0].textContent = index + 1;
  });
}

function actualizarSelects() {
  document.querySelectorAll('.descripcion').forEach(select => {
    const valorAnterior = select.value;
    select.innerHTML = `<option value="" disabled>Seleccionar...</option>` + crearOpcionesHTML(select);
    select.value = valorAnterior || '';
  });
}

function getSiguienteNumeroItem() {
  const numeros = Array.from(document.querySelectorAll('#itemsBody td:first-child'))
    .map(td => parseInt(td.textContent))
    .filter(n => !isNaN(n));
  let num = 1;
  while (numeros.includes(num)) num++;
  return num;
}

function actualizarTotal() {
  let total = 0;
  document.querySelectorAll('#itemsBody tr').forEach(row => {
    const cant = parseFloat(row.querySelector('.cantidad')?.value) || 0;
    const precio = parseFloat(row.querySelector('.precio')?.value) || 0;
    total += cant * precio;
  });
  document.getElementById('totalAmount').textContent = total.toFixed(2);
}

// Agregar ítem
function agregarItem() {
  const tbody = document.getElementById('itemsBody');
  const row = document.createElement('tr');
  const numero = getSiguienteNumeroItem();

  row.innerHTML = `
    <td>${numero}</td>
    <td><select class="descripcion"><option value="" disabled selected>Seleccionar...</option>${crearOpcionesHTML()}</select></td>
    <td><input type="number" class="cantidad" value="1" min="1"></td>
    <td><input type="number" class="precio" value="0" step="0.01" readonly></td>
  `;

  const select = row.querySelector('.descripcion');
  const precioInput = row.querySelector('.precio');
  const cantidadInput = row.querySelector('.cantidad');

  select.addEventListener('change', () => {
    const option = select.options[select.selectedIndex];
    const precio = option?.getAttribute('data-precio');
    precioInput.value = precio ? parseFloat(precio).toFixed(2) : '0.00';
    actualizarTotal();
    actualizarSelects();
  });

  precioInput.addEventListener('input', actualizarTotal);
  cantidadInput.addEventListener('input', actualizarTotal);

  tbody.appendChild(row);
  actualizarTotal();
}

// Administración de ítems
async function cargarItemsAdmin() {
  try {
    const res = await fetch('/api/get_items');
    const items = await res.json();
    const body = document.getElementById('adminItemsBody');
    body.innerHTML = items.map(item => `
      <tr>
        <td>${item.itm_id}</td>
        <td><input type="text" class="edit-desc" value="${item.itm_descripcion}" data-id="${item.itm_id}"></td>
        <td><input type="number" class="edit-precio" value="${item.itm_precio}" data-id="${item.itm_id}" step="0.01"></td>
        <td><button class="guardar-item" data-id="${item.itm_id}">Guardar</button></td>
      </tr>
    `).join('');

    document.querySelectorAll('.guardar-item').forEach(btn => {
      btn.addEventListener('click', async function () {
        const id = this.dataset.id;
        const desc = document.querySelector(`.edit-desc[data-id="${id}"]`).value;
        const precio = parseFloat(document.querySelector(`.edit-precio[data-id="${id}"]`).value);

        if (!desc || isNaN(precio)) {
          alert('⚠️ Completa todos los campos.');
          return;
        }

        const res = await fetch(`/api/update_item/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itm_descripcion: desc, itm_precio: precio })
        });

        if (res.ok) {
          const indice = itemsBD.findIndex(item => item.itm_id == id);
          if (indice !== -1) {
            itemsBD[indice].itm_descripcion = desc;
            itemsBD[indice].itm_precio = precio;
          }
          actualizarSelects();
          alert('Ítem actualizado');
        } else {
          alert('Error al guardar');
        }
      });
    });
  } catch (err) {
    console.error(err);
    document.getElementById('adminItemsBody').innerHTML = '<tr><td colspan="4">Error al cargar</td></tr>';
  }
}

// Iniciar app
document.addEventListener('DOMContentLoaded', async () => {
  await cargarItems();
  agregarItem();

  // BOTÓN: Agregar ítem
  document.getElementById('agregarItem')?.addEventListener('click', agregarItem);

  // BOTÓN: Imprimir
  document.getElementById('imprimirCotizacion')?.addEventListener('click', () => {
    window.print();
  });

  // BOTÓN: Abrir administración
  document.getElementById('adminItemsBtn')?.addEventListener('click', () => {
    document.getElementById('adminPanel').style.display = 'block';
    cargarItemsAdmin();
  });

  // BOTÓN: Cerrar administración
  document.getElementById('cerrarAdminBtn')?.addEventListener('click', () => {
    document.getElementById('adminPanel').style.display = 'none';
  });
});
