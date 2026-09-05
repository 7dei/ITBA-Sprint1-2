// ESTADO GLOBAL DE LA APLICACIÓN
let catalogoProductos = [];
let contadorCarrito = 0;

document.addEventListener('DOMContentLoaded', () => {
    iniciarApp();
});

async function iniciarApp() {
    // 1. Cargar los datos desde el archivo JSON
    catalogoProductos = await cargarDatosJSON();

    // 2. Enrutador simple (Ejecuta lógica según los contenedores que existan en la vista actual)
    if (document.getElementById('destacados-grid')) {
        // En el index.html solo mostramos los primeros 3 productos como destacados
        renderizarGrilla(catalogoProductos.slice(0, 3), 'destacados-grid');
    }

    if (document.getElementById('catalogo-grid')) {
        renderizarGrilla(catalogoProductos, 'catalogo-grid');
        inicializarBuscador();
    }

    if (document.getElementById('contacto-form')) {
        inicializarFormulario();
    }
}

// CAPA DE DATOS (FETCH)
async function cargarDatosJSON() {
    try {
        const respuesta = await fetch('data/productos.json');
        if (!respuesta.ok) {
            throw new Error('Error en la red o archivo no encontrado');
        }
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.error("Hubo un problema al cargar el catálogo:", error);
        return []; // Retorna un array vacío para evitar que se rompa la app
    }
}

// CAPA DE PRESENTACIÓN (UI / DOM)
function renderizarGrilla(arrayProductos, idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    contenedor.innerHTML = '';

    arrayProductos.forEach(producto => {
        // Validación de datos faltantes: se creó a partir de la premisa de que el JSON puede tener campos vacíos o "Desconocido"
        const precioFmt = producto.precio === "Desconocido" ? "Consultar" : `$${Number(producto.precio).toLocaleString('es-AR')}`;
        const imagenUrl = producto.imagen === "Desconocido" ? "https://via.placeholder.com/300x250?text=Falta+Imagen" : producto.imagen;

        const tarjeta = document.createElement('article');
        tarjeta.className = 'product-card';
        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="${producto.nombre}" class="product-card__img">
            <div class="product-card__info">
                <h3 class="product-card__title">${producto.nombre}</h3>
                <p class="product-card__price">${precioFmt}</p>
                <button class="btn btn--primary btn-agregar" data-id="${producto.id}">
                    Añadir al Carrito
                </button>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });

    document.querySelectorAll('.btn-agregar').forEach(boton => {
        boton.addEventListener('click', manejarAgregadoCarrito);
    });
}

// LÓGICA DE NEGOCIO Y EVENTOS

// 1. Carrito Simulado
function manejarAgregadoCarrito(evento) {
    contadorCarrito++;
    document.getElementById('cart-counter').textContent = contadorCarrito;

    // Feedback visual para el usuario en el botón presionado
    const boton = evento.target;
    const textoOriginal = boton.textContent;
    
    boton.textContent = '¡Agregado!';
    boton.style.backgroundColor = 'var(--primary-dark)';

    setTimeout(() => {
        boton.textContent = textoOriginal;
        boton.style.backgroundColor = ''; // Vuelve al estilo CSS original
    }, 1000);
}

// 2. Buscador del Catálogo (Bonus Funcional)
function inicializarBuscador() {
    const inputBusqueda = document.getElementById('search-input');
    const btnBuscar = document.getElementById('search-btn');

    const ejecutarFiltro = () => {
        const termino = inputBusqueda.value.toLowerCase().trim();
        const filtrados = catalogoProductos.filter(prod => 
            prod.nombre.toLowerCase().includes(termino) || 
            prod.categoria.toLowerCase().includes(termino)
        );
        renderizarGrilla(filtrados, 'catalogo-grid');
    };

    btnBuscar.addEventListener('click', ejecutarFiltro);

    inputBusqueda.addEventListener('keyup', (evento) => {
        if (evento.key === 'Enter') ejecutarFiltro();
    });
}

// 3. Validación de Formulario de Contacto
function inicializarFormulario() {
    const formulario = document.getElementById('contacto-form');
    const mensajeExito = document.getElementById('mensaje-exito');

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        let formularioValido = true;

        // Validar Nombre
        const inputNombre = document.getElementById('nombre');
        const errorNombre = document.getElementById('error-nombre');
        if (inputNombre.value.trim().length < 3) {
            errorNombre.textContent = 'El nombre debe tener al menos 3 caracteres.';
            formularioValido = false;
        } else {
            errorNombre.textContent = '';
        }

        // Validar Email con Expresión Regular
        const inputEmail = document.getElementById('email');
        const errorEmail = document.getElementById('error-email');
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(inputEmail.value.trim())) {
            errorEmail.textContent = 'Por favor, ingresa un correo electrónico válido.';
            formularioValido = false;
        } else {
            errorEmail.textContent = '';
        }

        // Validar Mensaje
        const inputMensaje = document.getElementById('mensaje');
        const errorMensaje = document.getElementById('error-mensaje');
        if (inputMensaje.value.trim().length < 10) {
            errorMensaje.textContent = 'El mensaje debe ser más descriptivo (mínimo 10 caracteres).';
            formularioValido = false;
        } else {
            errorMensaje.textContent = '';
        }

        if (formularioValido) {
            mensajeExito.style.display = 'block';
            formulario.reset(); // Limpia los campos

            setTimeout(() => {
                mensajeExito.style.display = 'none';
            }, 4000);
        }
    });
}