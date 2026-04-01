/*!
* Start Bootstrap - Creative v7.0.7 (https://startbootstrap.com/theme/creative)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-creative/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    // Activate SimpleLightbox plugin for portfolio items
    new SimpleLightbox({
        elements: '#portfolio a.portfolio-box'
    });

});

//========================================================
// CUSTOM MAP SCRIPT
//========================================================

// 1) Choose a default center (Monterrey example). Change to your location.
const center = [25.50124, -103.55115];
const zoom = 15;

const dialog = document.querySelector(".popup");
const buttonCancel = document.querySelector(".button-cancel");
const placeName = document.querySelector(".place-name");
const buttonSave = document.querySelector(".button-save");
const inputLongitude = document.querySelector(".input-longitude");
const inputLatitude = document.querySelector(".input-latitude");
const supaBaseUrl = "https://gsumoyielscmgutddkbx.supabase.co";
const supaBaseKey = "sb_publishable_NMsqJHz4iaaXS5moKgwovQ_hqyxb2gO";
const map = L.map("map").setView(center, zoom);

var myCustomIcon = L.icon({
  iconUrl: "../images/Sol.png",
  shadowUrl: "",
  iconSize: [58, 58],
  shadowSize: [50, 64],
  iconAnchor: [30, 30],
  shadowAnchor: [4, 62],
  popupAnchor: [-3, -76],
});

const supabaseClient = window.supabase.createClient(supaBaseUrl, supaBaseKey);

const v1 = document.querySelector("#title");
if (v1) {
  v1.textContent = "Universidad Tecnologica De La Laguna Durango";
}

// 2) Create the map

async function loadSavedIcons() {
  const { data, error } = await supabaseClient.from("cordinates").select("*");

  if (error) {
    console.log("Error from Supabase", error);
    return;
  }

  data.forEach((element) => {
    L.marker([element.lat, element.lng], {
      icon: myCustomIcon,
    }).bindTooltip(element.placeName).addTo(map);
  });
  // Removed recursive call loadSavedIcons() to prevent infinite loop
}

// Cerrar al hacer click fuera del dialog (en el fondo oscuro)
dialog.addEventListener("click", (e) => {
  const rect = dialog.getBoundingClientRect();
  const isInDialog =
    rect.top <= e.clientY &&
    e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX &&
    e.clientX <= rect.left + rect.width;
  if (!isInDialog) {
    dialog.close();
  }
});

// Limpiar marcador temporal si se cierra el dialog cancelando o por escape
dialog.addEventListener("close", () => {
  if (clickMarker) {
    map.removeLayer(clickMarker);
    clickMarker = null;
  }
});

buttonCancel.addEventListener("click", (e) => {
  e.preventDefault(); // Previene que el formulario se envie
  dialog.close();
});

buttonSave.addEventListener("click", async (e) => {
  e.preventDefault(); // Previene recargar la página

  const lat = parseFloat(inputLatitude.value);
  const lng = parseFloat(inputLongitude.value);
  const pln = placeName.value;

  if (!pln) {
    alert("Por favor escribe un nombre para el lugar antes de guardar.");
    return;
  }

  // 1. Actualización visual instantánea (para que el usuario vea que algo pasó)
  if (clickMarker) {
    clickMarker.bindTooltip(pln);
    clickMarker.bindPopup(pln); // Opcional, por si le dan clic al nuevo marcador
    clickMarker = null; // Lo desvinculamos de la variable para que no desaparezca al cerrar el dialog
  }

  // 2. Limpiar campo y cerrar el popup inmediatamente
  placeName.value = "";
  dialog.close();

  // 3. Guardar en Supabase, sin bloquear la pantalla
  const { error } = await supabaseClient.from("cordinates").insert([
    {
      lat: lat,
      lng: lng,
      placeName: pln,
    },
  ]);

  if (error) {
    console.error("Supabase Error:", error);
    alert("Hubo un problema guardando en tu base de datos: " + error.message);
  }
});

// 3) Add the OpenStreetMap tiles
// Note: respect OSM tile usage policy for production/high traffic.
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// 4) Add a marker + popup
if (v1) {
  L.marker(center).addTo(map).bindPopup(v1.textContent).openPopup();
}

// Parada de autobus (Encima de Sam's Villa Jardín)
const samsCenter = [25.5528, -103.5074];
L.marker(samsCenter).addTo(map).bindPopup("Parada de autobus", { autoClose: false, closeOnClick: false }).openPopup();

// Parada de autobus (Nueva ubicación seleccionada)
const newStopCenter = [25.547113, -103.531750];
L.marker(newStopCenter).addTo(map).bindPopup("Parada de autobus", { autoClose: false, closeOnClick: false }).openPopup();

// 5) Click handler (drops a marker where you click)

let clickMarker = null;

map.on("click", async (e) => {
  const { lat, lng } = e.latlng;

  inputLatitude.value = lat;
  inputLongitude.value = lng;

  dialog.showModal();

  if (clickMarker) map.removeLayer(clickMarker);

  clickMarker = L.marker([lat, lng], { icon: myCustomIcon })
    .addTo(map)
    .bindPopup(`Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`);

  clickMarker.openPopup();
});

// Initial load
loadSavedIcons();
