function animationCart() {
    document.querySelector(".count-product-cart").style.animation = "slidein ease 1s"
    setTimeout(()=>{
        document.querySelector(".count-product-cart").style.animation = "none"
    },1000)
}
// Doi sang dinh dang tien VND
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Close popup 
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');
let formLogSign = document.querySelector('.forms');

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach(item => {
    item.addEventListener('click', closeModal);
});

modalBox.forEach(item => {
    item.addEventListener('click', function (event) {
        event.stopPropagation();
    })
});

function closeModal() {
    modalContainer.forEach(item => {
        item.classList.remove('open');
    });
    console.log(modalContainer)
    body.style.overflow = "auto";
}

function increasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (parseInt(qty.value) < qty.max) {
        qty.value = parseInt(qty.value) + 1;
    } else {
        qty.value = qty.max;
    }
}

function decreasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (qty.value > qty.min) {
        qty.value = parseInt(qty.value) - 1;
    } else {
        qty.value = qty.min;
    }
}


// Thêm sản phẩm vào giỏ hàng
async function addCart(productId, quantity = 1, note = '') {
    let user = JSON.parse(localStorage.getItem('currentuser'));

    if (!user) {
        toast({ title: 'Thông báo', message: 'Vui lòng đăng nhập để thêm vào giỏ hàng!', type: 'warning', duration: 3000 });
        return;
    }
    try {
        // Nếu chưa có cart_id thì tạo mới
        if (!user.cart_id) {
            const cartId = self.crypto.randomUUID();

            const cartRes = await fetch('/api/carts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    cart_id: cartId,
                    account_id: user.account_id,
                    status: 0
                })
            });

            const cartData = await cartRes.json().catch(() => null);

            if (cartRes.ok && cartData?.cart_id) {
                user.cart_id = cartData.cart_id;
                localStorage.setItem('currentuser', JSON.stringify(user));
            } else {
                let message = cartData?.message || 'Không thể tạo giỏ hàng mới!';
                if (cartData?.errors) {
                    let errorMessages = [];
                    for (let field in cartData.errors) {
                        errorMessages.push(cartData.errors[field][0]);
                    }
                    message = errorMessages.join('<br>') || message;
                }
                toast({ title: 'Lỗi', message: message, type: 'error', duration: 5000 });
                return;
            }
        }

        // Gửi yêu cầu thêm item
        const itemId = self.crypto.randomUUID();
        const safeNote = typeof note === 'string' ? note : '';

        const itemRes = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                item_id: itemId,
                cart_id: user.cart_id,
                product_id:  parseInt(productId),
                quantity,
                note: safeNote
            })
        });

        const itemData = await itemRes.json().catch(() => null);

        if (itemRes.ok) {
            toast({ title: 'Thành công', message: 'Đã thêm vào giỏ hàng!', type: 'success', duration: 3000 });

            // 👉 Cập nhật số lượng sản phẩm trong biểu tượng giỏ hàng
            const countElement = document.querySelector('.count-product-cart');
            if (countElement) {
                const currentCount = parseInt(countElement.innerText) || 0;
                countElement.innerText = currentCount + parseInt(quantity);
            }

            closeCart();
        } else {
            let message = itemData?.message || 'Không thể thêm sản phẩm vào giỏ hàng!';
            if (itemData?.errors) {
                let errorMessages = [];
                for (let field in itemData.errors) {
                    errorMessages.push(itemData.errors[field][0]);
                }
                message = errorMessages.join('<br>') || message;
            }
            toast({ title: 'Lỗi', message: message, type: 'error', duration: 5000 });
        }
    } catch (error) {
        console.error('Lỗi:', error);
        toast({ title: 'Lỗi', message: `Kết nối server thất bại: ${error.message}`, type: 'error', duration: 3000 });
    }
}

async function showCart() {
    const user = JSON.parse(localStorage.getItem('currentuser'));
    if (!user || !user.cart_id) {
        document.querySelector('.gio-hang-trong').style.display = 'flex';
        return;
    }

    try {
        const res = await fetch(`/api/carts/${user.cart_id}`);
        if (!res.ok) {
            throw new Error(`Lỗi server: ${res.status}`);
        }

        const data = await res.json();
        const cartItems = data.items || [];

        if (cartItems.length === 0) {
            document.querySelector('.gio-hang-trong').style.display = 'flex';
            document.querySelector('button.thanh-toan').classList.add('disabled');
            document.querySelector('.cart-list').innerHTML = '';
            updateCartTotal([]);
            updateAmount([]);
            return;
        }

        document.querySelector('.gio-hang-trong').style.display = 'none';
        document.querySelector('button.thanh-toan').classList.remove('disabled');

        let products = JSON.parse(localStorage.getItem('products')) || [];
        let html = '';
        let total = 0;

        cartItems.forEach(item => {
            const product = item.product || products.find(p => p.product_id === item.product_id);
            if (!product) return;

            total += parseInt(item.quantity) * parseInt(product.price);

            html += `<li class="cart-item" data-id="${item.item_id}">
                <div class="cart-item-info">
                    <p class="cart-item-title">${product.title}</p>
                    <span class="cart-item-price price" data-price="${product.price}">
                        ${vnd(product.price)}
                    </span>
                </div>
                <p class="product-note"><i class="fa-light fa-pencil"></i><span>${item.note || ''}</span></p>
                <div class="cart-item-control">
                    <button class="cart-item-delete" onclick="deleteCartItem('${item.item_id}', this)">Xóa</button>
                    <div class="buttons_added">
                        <input class="input-qty" max="100" min="1" type="number" value="${item.quantity}" onchange="updateItemQuantity(this)">
                    </div>
                </div>
            </li>`;
        });

        document.querySelector('.cart-list').innerHTML = html;
        document.querySelector('.text-price').innerText = vnd(total);
        updateAmount(cartItems);
    } catch (error) {
        console.error('Lỗi khi hiển thị giỏ hàng:', error);
        toast({
            title: 'Lỗi',
            message: 'Không thể tải giỏ hàng. Vui lòng thử lại.',
            type: 'error',
            duration: 3000
        });
    }

    document.querySelector('.modal-cart').style.display = 'flex';
    document.querySelector('.modal-cart').onclick = closeCart;
    document.querySelector('.them-mon').onclick = closeCart;
    document.querySelector('.cart-container').onclick = e => e.stopPropagation();
}

async function deleteCartItem(itemId, el) {
    try {
        const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
        if (res.ok) {
            el.closest('.cart-item').remove();
            toast({ title: 'Thành công', message: 'Đã xóa sản phẩm khỏi giỏ hàng', type: 'success', duration: 3000 });
            showCart();
        } else {
            toast({ title: 'Lỗi', message: 'Không thể xóa sản phẩm', type: 'error', duration: 3000 });
        }
    } catch (error) {
        toast({ title: 'Lỗi', message: `Xóa thất bại: ${error.message}`, type: 'error', duration: 3000 });
    }
}

function updateCartTotal(items = []) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    let total = 0;
    items.forEach(item => {
        const product = products.find(p => p.product_id === item.product_id);
        if (product) {
            total += parseInt(product.price) * parseInt(item.quantity);
        }
    });
    document.querySelector('.text-price').innerText = vnd(total);
}

async function updateItemQuantity(inputElement) {
    const itemId = inputElement.closest('.cart-item').dataset.id;
    let newQuantity = parseInt(inputElement.value);

    if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
        inputElement.value = 1;
    }

    try {
        const res = await fetch(`/api/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (!res.ok) throw new Error('Cập nhật thất bại');
        const price = parseInt(
            inputElement.closest('.cart-item').querySelector('.cart-item-price').dataset.price
        );
        const totalEl = document.querySelector('.text-price');

        let allInputs = document.querySelectorAll('.cart-item .input-qty');
        let total = 0;

        allInputs.forEach(input => {
            const item = input.closest('.cart-item');
            const qty = parseInt(input.value);
            const price = parseInt(item.querySelector('.cart-item-price').dataset.price);
            total += qty * price;
        });

        totalEl.innerText = vnd(total);
        updateAmount(); // Cập nhật biểu tượng tổng số item
    } catch (err) {
        console.error('Lỗi khi cập nhật số lượng:', err);
        toast({
            title: 'Lỗi',
            message: 'Không thể cập nhật số lượng',
            type: 'error',
            duration: 3000
        });
    }
}

function openCart() {
    showCart();
    document.querySelector('.modal-cart').classList.add('open');
    body.style.overflow = "hidden";
}

function closeCart() {
    document.querySelector('.modal-cart').classList.remove('open');
    body.style.overflow = "auto";
    updateAmount();
}

async function getCartTotal() {
    const token = localStorage.getItem('token');
    const res = await fetch("/api/cart", {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const cart = await res.json();

    let total = 0;
    for (let item of cart) {
        const productRes = await fetch(`/api/products/${item.product_id}`);
        const product = await productRes.json();
        total += product.price * item.quantity;
    }
    return total;
}

async function getAmountCart() {
    const token = localStorage.getItem('token');
    const res = await fetch("/api/cart", {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const cart = await res.json();
    return cart.length;
}

document.addEventListener('DOMContentLoaded', function() {
    updateAmount(); 
});

async function updateAmount(items = []) {
    const user = JSON.parse(localStorage.getItem('currentuser'));
    if (!user || !user.cart_id) {
        return;
    }

    try {
        const res = await fetch(`/api/carts/${user.cart_id}`);
        if (!res.ok) {
            throw new Error(`Lỗi khi lấy giỏ hàng: ${res.status}`);
        }

        const data = await res.json();
        const cartItems = data.items || [];
        const totalItems = cartItems.length;
        const countElement = document.querySelector('.count-product-cart');
        if (countElement) {
            countElement.innerText = totalItems;
        }

    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng item trong giỏ hàng:', error);
        toast({
            title: 'Lỗi',
            message: 'Không thể cập nhật số lượng giỏ hàng. Vui lòng thử lại.',
            type: 'error',
            duration: 3000
        });
    }
}

// Open Search Advanced
document.querySelector(".filter-btn").addEventListener("click",(e) => {
    e.preventDefault();
    document.querySelector(".advanced-search").classList.toggle("open");
    document.getElementById("home-service").scrollIntoView();
})

document.querySelector(".form-search-input").addEventListener("click",(e) => {
    e.preventDefault();
    document.getElementById("home-service").scrollIntoView();
})

function closeSearchAdvanced() {
    document.querySelector(".advanced-search").classList.toggle("open");
}

//Open Search Mobile 
function openSearchMb() {
    document.querySelector(".header-middle-left").style.display = "none";
    document.querySelector(".header-middle-center").style.display = "block";
    document.querySelector(".header-middle-right-item.close").style.display = "block";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for(let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "none", "important")
    }
}

//Close Search Mobile 
function closeSearchMb() {
    document.querySelector(".header-middle-left").style.display = "block";
    document.querySelector(".header-middle-center").style.display = "none";
    document.querySelector(".header-middle-right-item.close").style.display = "none";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for(let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "block", "important")
    }
}

function getProductInfo(id) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    return products.find(item => item.id == id);
}

// quản lý đơn hàng
async function renderOrderProduct() {
    const currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (!currentUser) return;

    const accountId = currentUser.account_id;
    let orderHtml = "";

    try {
        const res = await fetch(`/api/orders/account/${accountId}`);
        const data = await res.json();

        if (!res.ok || data.length === 0) {
            orderHtml = `<div class="empty-order-section">
                <img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img">
                <p>Chưa có đơn hàng nào</p>
            </div>`;
        } else {
            for (const order of data) {
                let productHtml = `<div class="order-history-group">`;

                order.cart.items.forEach(sp => {
                    productHtml += `<div class="order-history">
                        <div class="order-history-left">
                            <img src="${sp.product.img}" alt="">
                            <div class="order-history-info">
                                <h4>${sp.product.title}</h4>
                                <p class="order-history-note"><i class="fa-light fa-pen"></i> ${order.note || "Không có ghi chú"}</p>
                                <p class="order-history-quantity">x${sp.quantity}</p>
                            </div>
                        </div>
                        <div class="order-history-right">
                            <div class="order-history-price">
                                <span class="order-history-current-price">${vnd(sp.product.price)}</span>
                            </div>                         
                        </div>
                    </div>`;
                });

                // Sử dụng is_payment để xác định trạng thái xử lý
                const textCompl = order.is_payment == 1 ? "Đã xử lý" : "Chưa xử lý";
                const classCompl = order.is_payment == 1 ? "complete" : "no-complete";

                productHtml += `<div class="order-history-control">
                    <div class="order-history-status">
                        <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                        <button id="order-history-detail" onclick="detailOrder('${order.order_id}')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                        ${order.is_payment == 0 ? `<button class="delete-order-btn" onclick="deleteOrder('${order.order_id}')"><i class="fa-regular fa-trash-can"></i> Xóa</button>` : ""}
                    </div>
                    <div class="order-history-total">
                        <span class="order-history-total-desc">Tổng tiền: </span>
                        <span class="order-history-toltal-price">${vnd(order.total_money)}</span>
                    </div>
                </div>`;
                productHtml += `</div>`;
                orderHtml += productHtml;
            }
        }

        document.querySelector(".order-history-section").innerHTML = orderHtml;
    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
    }
}
async function deleteOrder(orderId) {
    try {
        const res = await fetch(`/api/orders/${orderId}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error("Lỗi khi xóa đơn hàng");

        toast({ title: 'Thành công', message: 'Đã xóa đơn hàng', type: 'success' });
        renderOrderProduct(); 
    } catch (error) {
        console.error("Lỗi khi xóa đơn hàng:", error);
    }
}

// Format Date
function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd + '/' + mm + '/' + yyyy;
}

// Xem chi tiet don hang
async function detailOrder(orderId) {
    try {
        const res = await fetch(`/api/orders/${orderId}`);
        const detail = await res.json();

        document.querySelector(".modal.detail-order").classList.add("open");
        const detailOrderHtml = `<ul class="detail-order-group">
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                <span class="detail-order-item-right">${formatDate(detail.created_at)}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                <span class="detail-order-item-right">${detail.payment_method}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian </span>
                <span class="detail-order-item-right">${detail.delivery_time}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-pen"></i> Ghi chú</span>
                <span class="detail-order-item-right">${detail.note || "Không có ghi chú"}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm </span>
                <span class="detail-order-item-right">${detail.address}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
                <span class="detail-order-item-right">${detail.customer}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại </span>
                <span class="detail-order-item-right">${detail.phone}</span>
            </li>
        </ul>`;

        document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    }
}




// Back to top
window.onscroll = () => {
    let backtopTop = document.querySelector(".back-to-top")
    if (document.documentElement.scrollTop > 100) {
        backtopTop.classList.add("active");
    } else {
        backtopTop.classList.remove("active");
    }
}

// Auto hide header on scroll
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    if(lastScrollY < window.scrollY) {
        headerNav.classList.add("hide")
    } else {
        headerNav.classList.remove("hide")
    }
    lastScrollY = window.scrollY;
})







