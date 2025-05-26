// Page
let productAll = [];
let perPage = 12;
let currentPage = 1;

// Gọi API lấy danh sách sản phẩm
async function fetchProductsFromAPI() {
    try {
        const response = await fetch('http://localhost:8000/api/products'); 
        const data = await response.json();
        productAll = data.filter(item => item.status == 1);
        showHomeProduct(productAll);
    } catch (error) {
        console.error("Lỗi khi fetch API sản phẩm:", error);
    }
}

// Render danh sách sản phẩm ra giao diện
function renderProducts(showProduct) {
    let productHtml = '';
    if (showProduct.length == 0) {
        document.getElementById("home-title").style.display = "none";
        productHtml = `<div class="no-result"><div class="no-result-h">Tìm kiếm không có kết quả</div><div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div></div>`;
    } else {
        document.getElementById("home-title").style.display = "block";
        showProduct.forEach((product) => {
            productHtml += `<div class="col-product">
                <article class="card-product">
                    <div class="card-header">
                        <a href="#" class="card-image-link" onclick="detailProduct('${product.product_id}')">
                            <img class="card-image" src="${product.img}" alt="${product.title}">
                        </a>
                    </div>
                    <div class="food-info">
                        <div class="card-content">
                            <div class="card-title">
                                <a href="#" class="card-title-link" onclick="detailProduct('${product.product_id}')">${product.title}</a>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="product-price">
                                <span class="current-price">${vnd(product.price)}</span>
                            </div>
                            <div class="product-buy">
                                <button onclick="detailProduct('${product.product_id}')" class="card-button order-item">
                                    <i class="fa-regular fa-cart-shopping-fast"></i> Đặt món
                                </button>
                            </div> 
                        </div>
                    </div>
                </article>
            </div>`;
        });
    }
    document.getElementById('home-products').innerHTML = productHtml;
}

// Hiển thị phân trang và danh sách
function displayList(productList, perPage, currentPage) {
    let start = (currentPage - 1) * perPage;
    let end = start + perPage;
    let productShow = productList.slice(start, end);
    renderProducts(productShow);
}

function showHomeProduct(products) {
    let filtered = products.filter(item => item.status == 1);
    displayList(filtered, perPage, currentPage);
    setupPagination(filtered, perPage);
}

function setupPagination(productList, perPage) {
    document.querySelector('.page-nav-list').innerHTML = '';
    let page_count = Math.ceil(productList.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        let li = paginationChange(i, productList);
        document.querySelector('.page-nav-list').appendChild(li);
    }
}

function paginationChange(page, productList) {
    let node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="javascript:;">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productList, perPage, currentPage);
        document.querySelectorAll('.page-nav-item').forEach(el => el.classList.remove('active'));
        node.classList.add('active');
        document.getElementById("home-service").scrollIntoView();
    });
    return node;
}

// Tìm kiếm sản phẩm
function searchProducts(mode) {
    let searchInput = document.querySelector('.form-search-input').value.trim();
    let category = document.getElementById("advanced-search-category-select").value;
    let minPrice = document.getElementById("min-price").value;
    let maxPrice = document.getElementById("max-price").value;

    if (parseInt(minPrice) > parseInt(maxPrice) && minPrice !== "" && maxPrice !== "") {
        alert("Giá đã nhập sai!");
        return;
    }

    let result = category === "Tất cả" ? [...productAll] : productAll.filter(item => item.category === category);

    if (searchInput !== "") {
        result = result.filter(item =>
            item.title.toUpperCase().includes(searchInput.toUpperCase())
        );
    }

    if (minPrice !== "" && maxPrice !== "") {
        result = result.filter(item => item.price >= minPrice && item.price <= maxPrice);
    } else if (minPrice !== "") {
        result = result.filter(item => item.price >= minPrice);
    } else if (maxPrice !== "") {
        result = result.filter(item => item.price <= maxPrice);
    }

    switch (mode) {
        case 0:
            document.querySelector('.form-search-input').value = "";
            document.getElementById("advanced-search-category-select").value = "Tất cả";
            document.getElementById("min-price").value = "";
            document.getElementById("max-price").value = "";
            result = [...productAll];
            break;
        case 1:
            result.sort((a, b) => a.price - b.price);
            break;
        case 2:
            result.sort((a, b) => b.price - a.price);
            break;
    }

    document.getElementById("home-service").scrollIntoView();
    showHomeProduct(result);
}

// Hiển thị sản phẩm theo chuyên mục
function showCategory(category) {
    document.getElementById('trangchu').classList.remove('hide');
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('order-history').classList.remove('open');

    let productSearch = productAll.filter(value =>
        value.category.toUpperCase().includes(category.toUpperCase())
    );

    currentPage = 1;
    displayList(productSearch, perPage, currentPage);
    setupPagination(productSearch, perPage);
    document.getElementById("home-title").scrollIntoView();
}

// Gọi API khi trang vừa load
document.addEventListener('DOMContentLoaded', fetchProductsFromAPI);


//Xem chi tiet san pham
async function detailProduct(productId) {
    const modal = document.querySelector('.modal.product-detail');
    event.preventDefault();

    try {
        const response = await fetch(`http://localhost:8000/api/products/${productId}`);
        const infoProduct = await response.json();

        const modalHtml = `
            <div class="modal-header">
                <img class="product-image" src="${infoProduct.img}" alt="">
            </div>
            <div class="modal-body">
                <h2 class="product-title">${infoProduct.title}</h2>
                <div class="product-control">
                    <div class="priceBox">
                        <span class="current-price">${vnd(infoProduct.price)}</span>
                    </div>
                    <div class="buttons_added">
                        <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                        <input class="input-qty" max="100" min="1" type="number" value="1">
                        <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                    </div>
                </div>
                <p class="product-description">${infoProduct.desc}</p>
            </div>
            <div class="notebox">
                <p class="notebox-title">Ghi chú</p>
                <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
            </div>
            <div class="modal-footer">
                <div class="price-total">
                    <span class="thanhtien">Thành tiền</span>
                    <span class="price">${vnd(infoProduct.price)}</span>
                </div>
                <div class="modal-footer-control">
                    <button class="button-dat" id="add-cart"><i class="fa-light fa-basket-shopping"></i></button>
                </div>
            </div>
        `;

        // Gán HTML vào modal
        document.querySelector('#product-detail-content').innerHTML = modalHtml;
        modal.classList.add('open');
        document.body.style.overflow = "hidden";

        // Cập nhật thành tiền khi thay đổi số lượng
        const qtyInput = document.querySelector('.input-qty');
        const priceElement = document.querySelector('.price-total .price');

        const updateTotal = () => {
            const qty = parseInt(qtyInput.value) || 1;
            const total = qty * parseInt(infoProduct.price);
            priceElement.innerText = vnd(total);
        };

        document.querySelectorAll('.is-form').forEach(btn => {
            btn.addEventListener('click', updateTotal);
        });

        qtyInput.addEventListener('change', () => {
            if (parseInt(qtyInput.value) < 1 || isNaN(parseInt(qtyInput.value))) {
                qtyInput.value = 1;
            }
            updateTotal();
        });

        // Thêm sản phẩm vào giỏ hàng
        document.querySelector('.button-dat').addEventListener('click', () => {
            if (localStorage.getItem('currentuser')) {
                const quantity = parseInt(qtyInput.value) || 1;
                const note = document.querySelector('#popup-detail-note').value || '';
                addCart(infoProduct.product_id, quantity, note);
            } else {
                toast({
                    title: 'Warning',
                    message: 'Chưa đăng nhập tài khoản!',
                    type: 'warning',
                    duration: 3000
                });
            }
        });

    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        toast({
            title: 'Lỗi',
            message: 'Không thể hiển thị chi tiết sản phẩm!',
            type: 'error',
            duration: 3000
        });
    }
}
function detailPage(productId) {
    window.location.href = `/product/${productId}`;
}