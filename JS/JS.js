document.addEventListener("DOMContentLoaded", function () {
  const qrCodeContainer = document.getElementById("qrcode-container");
  const menuContainer = document.getElementById("menu");
  const favoritesContainer = document.getElementById("favoritesList");
  const favoritesCheckbox = document.getElementById("favoritesCheckbox");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const veganCheckbox = document.getElementById("veganCheckbox");
  const celiacCheckbox = document.getElementById("celiacCheckbox");
  const lactoseIntolerantCheckbox = document.getElementById("lactoseIntolerantCheckbox");
  const categoryDropdown = document.getElementById("categoria");
  const orderDropdown = document.getElementById("orden");
  const filtersContainer = document.getElementById("filters"); // Corregido

  // Obtener los filtros y favoritos almacenados en localStorage
  const storedFilters = JSON.parse(localStorage.getItem("filters")) || {};
  const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // Restablecer los valores de los filtros desde localStorage
  veganCheckbox.checked = storedFilters.vegan || false;
  celiacCheckbox.checked = storedFilters.celiac || false;
  lactoseIntolerantCheckbox.checked = storedFilters.lactoseIntolerant || false;
  categoryDropdown.value = storedFilters.category || "all";
  orderDropdown.value = storedFilters.order || "";

  applyFiltersBtn.addEventListener("click", handleFilterChange);

  // Simulación de datos con un archivo JSON
  const apiUrl = "https://raw.githubusercontent.com/Ikergotelin13/Archivo-JSON/main/Comida.json";

  // Función para obtener los datos de la API
  async function getMenuData() {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  }

  // Función para renderizar la carta en la página
  async function renderMenu() {
    const menuData = await getMenuData();
    menuContainer.innerHTML = "";

    let filteredData = menuData;

    // Aplicar filtros
    if (favoritesCheckbox.checked) {
      // Mostrar solo favoritos
      filteredData = storedFavorites;
    } else {
      // Mostrar según otros filtros
      filteredData = menuData.filter((item) => {
        const isVegan = !veganCheckbox.checked || (veganCheckbox.checked && item.vegan);
        const isCeliac = !celiacCheckbox.checked || (celiacCheckbox.checked && item.celiac);
        const isLactoseIntolerant = !lactoseIntolerantCheckbox.checked || (lactoseIntolerantCheckbox.checked && item.lactoseIntolerant);
        const selectedCategory = categoryDropdown.value;
        const isCategoryMatch = selectedCategory === "all" || item.category === selectedCategory;

        return isVegan && isCeliac && isLactoseIntolerant && isCategoryMatch;
      });
    }

    let sortedData;

    if (orderDropdown.value === "asc") {
      sortedData = filteredData.sort((a, b) => a.price - b.price);
    } else if (orderDropdown.value === "desc") {
      sortedData = filteredData.sort((a, b) => b.price - a.price);
    } else {
      // No aplicar ordenación
      sortedData = filteredData;
    }

    sortedData.forEach((item) => {
      const card = createCard(item);
      menuContainer.appendChild(card);
    });
  }

  // Función para crear una tarjeta de plato
  function createCard(item) {
    const card = document.createElement("div");
    card.classList.add("card");

    const image = document.createElement("img");
    image.src = item.photo;
    image.alt = item.name;

    const name = document.createElement("h3");
    name.textContent = item.name;

    const ingredients = document.createElement("p");
    ingredients.textContent = `Ingredientes: ${item.ingredients.join(", ")}`;

    const price = document.createElement("p");
    price.textContent = `Precio: ${item.price} €`;

    const addToFavoritesButton = document.createElement("button");
    addToFavoritesButton.textContent = "Añadir a Favoritos";
    addToFavoritesButton.addEventListener("click", () => addToFavorites(item, addToFavoritesButton));

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(ingredients);
    card.appendChild(price);
    card.appendChild(addToFavoritesButton);

    return card;
  }

  // Función para añadir o quitar plato de favoritos
  function addToFavorites(item, button) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isAlreadyFavorite = favorites.some((favorite) => favorite.name === item.name);

    if (!isAlreadyFavorite) {
      favorites.push(item);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      button.classList.add("favorite");
      console.log(`Añadido a favoritos: ${item.name}`);
    } else {
      const updatedFavorites = favorites.filter((favorite) => favorite.name !== item.name);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      button.classList.remove("favorite");
      console.log(`Eliminado de favoritos: ${item.name}`);
    }

    // Renderizar la lista de favoritos actualizada
    renderFavorites();

    // Renderizar el menú actualizado
    renderMenu();
  }

  // Función para renderizar la lista de favoritos
  function renderFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favoritesContainer.innerHTML = "";

    if (favorites.length > 0) {
      favorites.forEach((favorite) => {
        const favoriteItem = createFavoriteItem(favorite);
        favoritesContainer.appendChild(favoriteItem);
      });
    }
  }

  // Función para crear un elemento de la lista de favoritos
  function createFavoriteItem(item) {
    const favoriteItem = createCard(item);  // Reutilizar la función createCard
    const removeFromFavoritesButton = document.createElement("button");
    removeFromFavoritesButton.textContent = "Eliminar de Favoritos";
    removeFromFavoritesButton.addEventListener("click", () => removeFromFavorites(item, removeFromFavoritesButton));

    // Quitar el botón "Añadir a Favoritos" de la tarjeta de favoritos
    favoriteItem.removeChild(favoriteItem.querySelector("button"));

    favoriteItem.appendChild(removeFromFavoritesButton);

    return favoriteItem;
  }

  // Función para eliminar un plato de la lista de favoritos
  function removeFromFavorites(item, button) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const updatedFavorites = favorites.filter((favorite) => favorite.name !== item.name);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    button.parentElement.remove();
    console.log(`Eliminado de favoritos: ${item.name}`);

    // Si la lista de favoritos está vacía, desactivar el filtro de favoritos
    if (updatedFavorites.length === 0) {
      favoritesCheckbox.checked = false;
    }

    // Renderizar el menú actualizado
    renderMenu();
  }

  // Event listeners para los checkboxes y el menú desplegable
  veganCheckbox.addEventListener("change", handleFilterChange);
  celiacCheckbox.addEventListener("change", handleFilterChange);
  lactoseIntolerantCheckbox.addEventListener("change", handleFilterChange);
  categoryDropdown.addEventListener("change", handleFilterChange);
  orderDropdown.addEventListener("change", handleFilterChange);
  favoritesCheckbox.addEventListener("change", handleFilterChange);

  // Inicializar la página mostrando solo el código QR
  renderMenu();  // No renderizará el menú, solo configurará los eventos
  renderFavorites();  // No renderizará la lista de favoritos

  // Mostrar el menú después de escanear el código QR
  function showMenu() {
    qrCodeContainer.style.display = "none";
    menuContainer.style.display = "block";
    filtersContainer.style.display = "flex"; // Ajustado a "flex" ya que en tu CSS usas flexbox
  }

  // Agregar evento al código QR para mostrar el menú
  qrCodeContainer.addEventListener("click", showMenu);
});

var qrcode = new QRCode(document.getElementById("qrcode"), {
  text: "https://ikergotelin13.github.io/Carta-Restaurante-QR/",
  width: 256,
  height: 256,
  colorDark: "#000000",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.H
});
