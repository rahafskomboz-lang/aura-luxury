document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    // جلب التصنيفات إذا كنا في الصفحة الرئيسية
    const categoriesContainer = document.getElementById("categories-container");
    if (categoriesContainer) {
        fetchCategories();
    }

    // جلب الكتب إذا كنا في صفحة تصفح الكتب
    const booksContainer = document.getElementById("books-container");
    if (booksContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get("category") || "programming";
        fetchBooks(category);
    }
});

// ==========================
// 1. دوال جلب البيانات من الـ API
// ==========================

function fetchCategories() {
    const categoriesContainer = document.getElementById("categories-container");
    const queries = ["programming", "science", "fiction"];
    categoriesContainer.innerHTML = "";

    queries.forEach(query => {
        fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`)
            .then(res => res.json())
            .then(data => {
                if (data.docs && data.docs.length > 0) {
                    const book = data.docs[0];
                    const title = book.title;
                    const cover = book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : "https://via.placeholder.com/150";

                    let categoryName = query === 'programming' ? 'تكنولوجيا وبرمجيات' : query === 'science' ? 'العلوم العامة' : 'أدب وروايات';

                    categoriesContainer.innerHTML += `
                        <div class="card" onclick="location.href='books.html?category=${query}'" style="cursor: pointer;">
                            <img src="${cover}" alt="${title}">
                            <div class="card-body">
                                <h3>${categoryName}</h3>
                                <p>أحدث الإصدارات والكتب في قسم ${categoryName}، انقر للتصفح.</p>
                            </div>
                        </div>
                    `;
                }
            })
            .catch(err => console.error("خطأ في جلب التصنيفات:", err));
    });
}

function fetchBooks(category) {
    const booksContainer = document.getElementById("books-container");
    booksContainer.innerHTML = "<p style='text-align: center; grid-column: 1/-1;'>جاري جلب الكتب من المكتبة...</p>";

    fetch(`https://openlibrary.org/search.json?q=${category}&limit=6`)
        .then(res => res.json())
        .then(data => {
            booksContainer.innerHTML = "";
            data.docs.forEach((book) => {
                const title = book.title;
                const author = book.author_name ? book.author_name[0] : "مؤلف غير معروف";
                const cover = book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "https://via.placeholder.com/150";

                booksContainer.innerHTML += `
                    <div class="card">
                        <img src="${cover}" alt="${title}">
                        <div class="card-body">
                            <h3>${title}</h3>
                            <p>المؤلف: ${author}</p>
                            <button onclick="addToCart('${title.replace(/'/g, "")}', '${author.replace(/'/g, "")}')" class="btn" style="margin-top: 10px; padding: 5px 15px; font-size: 0.9rem;">إضافة للسلة</button>
                        </div>
                    </div>
                `;
            });
        })
        .catch(err => {
            console.error(err);
            booksContainer.innerHTML = "<p style='text-align: center; grid-column: 1/-1;'>عذراً، حدث خطأ في تحميل الكتب.</p>";
        });
}


// ==========================
// 2. دوال إدارة السلة والنافذة المنبثقة (Modal)
// ==========================

// إضافة كتاب إلى السلة وحفظه في الـ LocalStorage
function addToCart(title, author) {
    let cart = JSON.parse(localStorage.getItem("libraryCart")) || [];
    cart.push({ title, author });
    localStorage.setItem("libraryCart", JSON.stringify(cart));
    updateCartCount();
    alert(`تمت إضافة كتاب "${title}" إلى السلة بنجاح!`);
}

// تحديث عداد السلة في الهيدر
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("libraryCart")) || [];
    const countElement = document.getElementById("cart-count");
    if (countElement) {
        countElement.innerText = cart.length;
    }
}

// فتح وإغلاق نافذة السلة المنبثقة
function toggleCartModal() {
    const modal = document.getElementById("cart-modal");
    if (modal) {
        if (modal.style.display === "flex") {
            modal.style.display = "none";
        } else {
            modal.style.display = "flex";
            displayCartItems(); // عرض الكتب داخل النافذة عند فتحها
        }
    }
}

// عرض عناصر السلة داخل نافذة الـ Modal
function displayCartItems() {
    const cartContainer = document.getElementById("cart-items-container");
    let cart = JSON.parse(localStorage.getItem("libraryCart")) || [];

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p style='text-align: center; color: #7f8c8d;'>السلة فارغة حالياً.</p>";
        return;
    }

    cartContainer.innerHTML = "";
    cart.forEach((item, index) => {
        cartContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div>
                    <strong style="font-size: 0.95rem; color: #2c3e50;">${item.title}</strong>
                    <p style="font-size: 0.8rem; color: #7f8c8d; margin-top: 3px;">${item.author}</p>
                </div>
                <button onclick="removeFromCart(${index})" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">حذف</button>
            </div>
        `;
    });
}

// حذف كتاب محدد من السلة
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("libraryCart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("libraryCart", JSON.stringify(cart));
    displayCartItems(); // تحديث القائمة داخل النافذة
    updateCartCount(); // تحديث العداد في الهيدر
}

// إتمام الطلب وتفريغ السلة
function checkout() {
    let cart = JSON.parse(localStorage.getItem("libraryCart")) || [];
    if (cart.length === 0) {
        alert("السلة فارغة بالفعل!");
        return;
    }
    alert("تم إتمام طلب الكتب بنجاح! شكراً لاستخدامك المكتبة الرقمية.");
    localStorage.removeItem("libraryCart");
    updateCartCount();
    toggleCartModal();
}