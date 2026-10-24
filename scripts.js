const DEFAULT_MENU = [
    {
        id: 1,
        name: "Seblak Original",
        price: 10000,
        stock: 15,
        description: "Seblak gurih dengan kerupuk dan telur.",
        image: "https://images.unsplash.com/photo-1645696288939-e59ed5e3cfa2?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
    },
    {
        id: 2,
        name: "Seblak complit",
        price: 15000,
        stock: 10,
        description: "Seblak pedas dengan topping melimpah.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTavlcw6NKLcfGWNYREQcTLu85MpxAMKFR_JeUtlD1mRA&s=10"
    },
    {
        id: 3,
        name: "Seblak ceker",
        price: 20000,
        stock: 8,
        description: "Seblak dengan topping ceker.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0QUyhwcoB-3dOj6P0ZXZaG12s23DOMNnyiLZ_276E3w&s=10"
    }
];

const DEFAULT_HOURS = {
    open: "10:00",
    close: "21:00"
};

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        return fallback;
    }
}

let menu = loadData("seblakMenu", DEFAULT_MENU);
let hours = loadData("seblakHours", DEFAULT_HOURS);
let cart = [];

const menuContainer = document.getElementById("menuContainer");
const cartList = document.getElementById("cartList");
const totalElement = document.getElementById("total");
const adminPanel = document.getElementById("adminPanel");

const rupiah = (number) =>
    "Rp" + number.toLocaleString("id-ID");

function saveMenu() {
    localStorage.setItem("seblakMenu", JSON.stringify(menu));
}

function saveHours() {
    localStorage.setItem("seblakHours", JSON.stringify(hours));
}

// Membuat elemen dengan teks aman
function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

// ==========================
// MENAMPILKAN MENU
// ==========================

function renderMenu() {
    menuContainer.replaceChildren();

    menu.forEach((item) => {
        const card = makeElement("article", "menu-card");

        const image = makeElement("img");
        image.src = item.image;
        image.alt = item.name;
        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.alt = "Foto tidak dapat dimuat";
            image.removeAttribute("src");
            image.classList.add("image-error");
        }, { once: true });

        const info = makeElement("div", "menu-info");
        const name = makeElement("h3", "", item.name);
        const description = makeElement(
            "p", "", item.description
        );

        const price = makeElement(
            "div", "price", rupiah(item.price)
        );

        const stock = makeElement(
            "span",
            item.stock > 0 ? "stock" : "stock sold-out",
            item.stock > 0
                ? `Stok tersedia: ${item.stock}`
                : "Stok habis"
        );

        const bottom = makeElement("div", "menu-bottom");

        const button = makeElement(
            "button",
            "button",
            item.stock > 0 ? "Tambah Pesanan" : "Stok Habis"
        );

        button.type = "button";
        button.disabled = item.stock <= 0;

        button.addEventListener("click", () => {
            addToCart(item.id);
        });

        bottom.append(price, stock, button);
        info.append(name, description, bottom);
        card.append(image, info);
        menuContainer.appendChild(card);
    });
}

// ==========================
// KERANJANG PESANAN
// ==========================

function addToCart(id) {
    const item = menu.find((product) => product.id === id);

    if (!item || item.stock <= 0) {
        alert("Maaf, stok menu ini habis.");
        return;
    }

    const cartItem = cart.find((product) => product.id === id);

    if (cartItem) {
        if (cartItem.qty >= item.stock) {
            alert("Jumlah pesanan sudah mencapai batas stok.");
            return;
        }

        cartItem.qty++;
    } else {
        cart.push({
            id: item.id,
            qty: 1
        });
    }

    renderCart();
}

function changeQuantity(id, amount) {
    const cartItem = cart.find((item) => item.id === id);
    const product = menu.find((item) => item.id === id);

    if (!cartItem || !product) return;

    const nextQty = cartItem.qty + amount;

    if (nextQty <= 0) {
        removeFromCart(id);
        return;
    }

    if (nextQty > product.stock) {
        alert("Jumlah melebihi stok yang tersedia.");
        return;
    }

    cartItem.qty = nextQty;
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);
    renderCart();
}

function renderCart() {
    cartList.replaceChildren();

    if (cart.length === 0) {
        cartList.appendChild(
            makeElement("p", "empty-cart", "Belum ada pesanan.")
        );

        totalElement.textContent = rupiah(0);
        return;
    }

    let total = 0;

    cart.forEach((cartItem) => {
        const product = menu.find(
            (item) => item.id === cartItem.id
        );

        if (!product) return;

        const subtotal = product.price * cartItem.qty;
        total += subtotal;

        const row = makeElement("div", "cart-item");
        const detail = makeElement("div");
        const name = makeElement("strong", "", product.name);
        const price = makeElement(
            "p", "", rupiah(subtotal)
        );

        const controls = makeElement("div", "quantity-controls");

        const minus = makeElement("button", "", "−");
        minus.type = "button";
        minus.setAttribute("aria-label", "Kurangi jumlah");
        minus.addEventListener("click", () => {
            changeQuantity(product.id, -1);
        });

        const qty = makeElement(
            "span", "", String(cartItem.qty)
        );

        const plus = makeElement("button", "", "+");
        plus.type = "button";
        plus.setAttribute("aria-label", "Tambah jumlah");
        plus.disabled = cartItem.qty >= product.stock;
        plus.addEventListener("click", () => {
            changeQuantity(product.id, 1);
        });

        controls.append(minus, qty, plus);

        const remove = makeElement(
            "button", "remove-button", "Hapus"
        );

        remove.type = "button";
        remove.addEventListener("click", () => {
            removeFromCart(product.id);
        });

        detail.append(name, price);
        row.append(detail, controls, remove);
        cartList.appendChild(row);
    });

    totalElement.textContent = rupiah(total);
}

// ==========================
// JAM OPERASIONAL
// ==========================

function renderHours() {
    document.getElementById("openingTime").value = hours.open;
    document.getElementById("closingTime").value = hours.close;

    document.getElementById("hoursText").textContent =
        `${hours.open}–${hours.close} WIB`;

    updateOpenStatus();
}

function updateOpenStatus() {
    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const [openHour, openMinute] =
        hours.open.split(":").map(Number);

    const [closeHour, closeMinute] =
        hours.close.split(":").map(Number);

    const opening = openHour * 60 + openMinute;
    const closing = closeHour * 60 + closeMinute;

    // Mendukung jam tutup melewati tengah malam.
    const isOpen = opening === closing
        ? true
        : opening < closing
            ? currentMinutes >= opening &&
              currentMinutes < closing
            : currentMinutes >= opening ||
              currentMinutes < closing;

    const status = document.getElementById("openStatus");

    status.textContent = isOpen
        ? "Buka sekarang"
        : "Tutup sekarang";

    status.style.color = isOpen ? "#287443" : "#c62828";
}

document.getElementById("saveHours").addEventListener(
    "click", () => {
        const open = document.getElementById("openingTime").value;
        const close = document.getElementById("closingTime").value;

        if (!open || !close) {
            alert("Isi jam buka dan jam tutup terlebih dahulu.");
            return;
        }

        hours = { open, close };

        localStorage.setItem(
            "seblakHours",
            JSON.stringify(hours)
        );

        renderHours();
        alert("Jam operasional berhasil disimpan!");
    }
);

// ==========================
// PANEL ADMIN
// ==========================

document.getElementById("adminToggle").addEventListener(
    "click", () => {
        adminPanel.hidden = !adminPanel.hidden;

        if (!adminPanel.hidden) {
            renderAdminMenu();
            adminPanel.scrollIntoView({ behavior: "smooth" });
        }
    }
);

function renderAdminMenu() {
    const container = document.getElementById("adminMenuList");
    container.replaceChildren();

    menu.forEach((item) => {
        const section = makeElement("div", "admin-item");

        section.appendChild(
            makeElement("h4", "", item.name)
        );

        const grid = makeElement("div", "admin-item-grid");

        function addField(labelText, type, value, min) {
            const label = makeElement("label", "", labelText);
            const input = makeElement("input");

            input.type = type;
            input.value = value;

            if (min !== undefined) input.min = String(min);
            if (type === "number") input.step = "1";

            label.appendChild(input);
            grid.appendChild(label);

            return input;
        }

        const nameInput = addField("Nama menu", "text", item.name);
        const priceInput = addField(
            "Harga (rupiah)", "number", item.price, 1
        );
        const stockInput = addField(
            "Stok", "number", item.stock, 0
        );
        const imageInput = addField(
            "URL foto", "url", item.image
        );
        const descriptionInput = addField(
            "Deskripsi", "text", item.description
        );

        const saveButton = makeElement(
            "button", "button", "Simpan Menu"
        );
        saveButton.type = "button";

        saveButton.addEventListener("click", () => {
            const name = nameInput.value.trim();
            const price = Number(priceInput.value);
            const stock = Number(stockInput.value);
            const image = imageInput.value.trim();
            const description = descriptionInput.value.trim();

            if (
                !name ||
                !Number.isSafeInteger(price) ||
                price < 1 ||
                !Number.isSafeInteger(stock) ||
                stock < 0 ||
                !description
            ) {
                alert("Periksa nama, harga, stok, dan deskripsi.");
                return;
            }

            if (
                !image ||
                !/^https?:\/\//i.test(image)
            ) {
                alert("Masukkan URL foto yang diawali http:// atau https://.");
                return;
            }

            item.name = name;
            item.price = price;
            item.stock = stock;
            item.image = image;
            item.description = description;

            // Pesanan tidak boleh melebihi stok terbaru.
            cart = cart.filter((cartItem) => {
                const product = menu.find(
                    (entry) => entry.id === cartItem.id
                );

                if (!product || product.stock <= 0) return false;

                if (cartItem.qty > product.stock) {
                    cartItem.qty = product.stock;
                }

                return true;
            });

            saveMenu();
            renderMenu();
            renderCart();
            renderAdminMenu();

            alert("Data menu berhasil diperbarui!");
        });

        const deleteButton = makeElement(
            "button", "delete-menu-button", "Hapus Menu"
        );
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            const confirmDelete = confirm(
                `Hapus menu "${item.name}"?`
            );

            if (!confirmDelete) return;

            menu = menu.filter(
                (product) => product.id !== item.id
            );

            cart = cart.filter(
                (cartItem) => cartItem.id !== item.id
            );

            saveMenu();
            renderMenu();
            renderCart();
            renderAdminMenu();
        });

        section.append(grid, saveButton, deleteButton);
        container.appendChild(section);
    });
}

// Menambahkan menu baru
document.getElementById("addMenuForm").addEventListener(
    "submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("newName").value.trim();
        const price = Number(document.getElementById("newPrice").value);
        const stock = Number(document.getElementById("newStock").value);
        const image = document.getElementById("newImage").value.trim();
        const description = document.getElementById(
            "newDescription"
        ).value.trim();

        if (
            !name ||
            !Number.isSafeInteger(price) ||
            price < 1 ||
            !Number.isSafeInteger(stock) ||
            stock < 0 ||
            !description ||
            !/^https?:\/\//i.test(image)
        ) {
            alert("Periksa kembali semua data menu.");
            return;
        }

        const nextId = menu.length
            ? Math.max(...menu.map((item) => item.id)) + 1
            : 1;

        menu.push({
            id: nextId,
            name,
            price,
            stock,
            image,
            description
        });

        saveMenu();
        renderMenu();
        renderAdminMenu();
        event.target.reset();

        document.getElementById("newStock").value = 10;

        alert("Menu baru berhasil ditambahkan!");
    }
);

// ==========================
// WHATSAPP
// ==========================

document.getElementById("orderBtn").addEventListener(
    "click", () => {
        if (cart.length === 0) {
            alert("Pilih menu terlebih dahulu!");
            return;
        }

        const phone = "6281234567890";

        // Ganti dengan nomor WhatsApp penjual yang sebenarnya.
        const lines = ["Halo, saya mau pesan:"];

        let total = 0;

        for (const cartItem of cart) {
            const product = menu.find(
                (item) => item.id === cartItem.id
            );

            if (!product) continue;

            if (cartItem.qty > product.stock) {
                alert(`Stok ${product.name} tidak mencukupi.`);
                return;
            }

            const subtotal = product.price * cartItem.qty;
            total += subtotal;

            lines.push(
                `${product.name} x${cartItem.qty} = ${rupiah(subtotal)}`
            );
        }

        lines.push("");
        lines.push(`Total: ${rupiah(total)}`);
        lines.push("Mohon konfirmasi pesanan saya. Terima kasih.");

        const url =
            `https://wa.me/${phone}?text=` +
            encodeURIComponent(lines.join("\n"));

        window.open(url, "_blank");
    }
);

// Jalankan saat halaman pertama dibuka
renderMenu();
renderCart();
renderHours();

