function checkLogin() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if(currentUser == null || currentUser.userType == 0) {
        document.querySelector("body").innerHTML = `<div class="access-denied-section">
            <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="">
        </div>`
    } else {
        document.getElementById("name-acc").innerHTML = currentUser.username;
    }
}
document.addEventListener('DOMContentLoaded', checkLogin);

//do sidebar open and close
const menuIconButton = document.querySelector(".menu-icon-btn");
const sidebar = document.querySelector(".sidebar");
menuIconButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});


// tab for section
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
const sections = document.querySelectorAll(".section");

for(let i = 0; i < sidebars.length; i++) {
    sidebars[i].onclick = function () {
        document.querySelector(".sidebar-list-item.active").classList.remove("active");
        document.querySelector(".section.active").classList.remove("active");
        sidebars[i].classList.add("active");
        sections[i].classList.add("active");
    };
}

const closeBtn = document.querySelectorAll('.section');
console.log(closeBtn[0])
for(let i=0;i<closeBtn.length;i++){
    closeBtn[i].addEventListener('click',(e) => {
        sidebar.classList.add("open");
    })
}

function vnd(price) {
  return Number(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}
// Hàm load thống kê dashboard
async function loadDashboardStats() {
  try {
    const [accRes, prodRes, orderRes] = await Promise.all([
      fetch('/api/accounts'),
      fetch('/api/products'),
      fetch('/api/orders')
    ]);

    if (!accRes.ok || !prodRes.ok || !orderRes.ok) {
      throw new Error('Lỗi khi fetch dữ liệu thống kê');
    }
    
    const [accounts, products, orders] = await Promise.all([
      accRes.json(),
      prodRes.json(),
      orderRes.json()
    ]);

    // Lọc tài khoản có userType là "user"
    const numUsers = accounts.filter(u => u.userType === "user").length;
    const numProducts = products.length;
    
    // Tính tổng doanh thu từ các đơn hàng đã thanh toán (is_payment = 1)
    const revenue = orders
      .filter(o => o.is_payment == 1)
      .reduce((sum, o) => sum + Number(o.total_money), 0);

    document.getElementById("amount-user").textContent    = numUsers;
    document.getElementById("amount-product").textContent = numProducts;
    document.getElementById("doanh-thu").textContent      = vnd(revenue);

  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkLogin();          
  loadDashboardStats();  
});


// Phân trang 
// ====== CẤU HÌNH PHÂN TRANG ======
let perPage = 12;
let currentPage = 1;
let productAll = [];

// ====== FETCH 1 LẦN TOÀN BỘ SẢN PHẨM ======
async function fetchProducts() {
    try {
        const res = await fetch('/api/products'); 
        productAll = await res.json();  // giả sử API trả mảng JSON
        renderPage();
    } catch (err) {
        console.error("Lỗi khi fetch API sản phẩm:", err);
    }
}

// ====== HIỂN THỊ 1 “TRANG” ======
function renderPage() {
    // slice từ mảng toàn bộ
    let start = (currentPage - 1) * perPage;
    let end = start + perPage;
    let pageItems = productAll.slice(start, end);
    showProductArr(pageItems);
    setupPagination(Math.ceil(productAll.length / perPage));
}

// ====== VẼ PHÂN TRANG ======
function setupPagination(pageCount) {
    const list = document.querySelector('.page-nav-list');
    list.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement("li");
        li.className = 'page-nav-item' + (i === currentPage ? ' active' : '');
        li.innerHTML = `<a href="javascript:;">${i}</a>`;
        li.addEventListener('click', () => {
            currentPage = i;
            renderPage();
        });
        list.appendChild(li);
    }
}

// ====== HIỂN THỊ DỮ LIỆU SẢN PHẨM ======
function showProductArr(arr) {
    let html = "";
    if (arr.length === 0) {
        html = `
        <div class="no-result">
          <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
          <div class="no-result-h">Không có sản phẩm để hiển thị</div>
        </div>`;
    } else {
        arr.forEach(p => {
            const btnCtl = p.status == 1
                ? `<button class="btn-delete" onclick="deleteProduct(${p.id})"><i class="fa-regular fa-trash"></i></button>`
                : `<button class="btn-delete" onclick="changeStatusProduct(${p.id})"><i class="fa-regular fa-eye"></i></button>`;
            html += `
            <div class="list">
              <div class="list-left">
                <img src="${p.img}" alt="">
                <div class="list-info">
                  <h4>${p.title}</h4>
                  <p class="list-note">${p.desc}</p>
                  <span class="list-category">${p.category}</span>
                </div>
              </div>
              <div class="list-right">
                <div class="list-price">
                  <span class="list-current-price">${vnd(p.price)}</span>
                </div>
                <div class="list-control">
                  <div class="list-tool">
                    <button class="btn-edit" onclick="editProduct(${p.id})"><i class="fa-light fa-pen-to-square"></i></button>
                    ${btnCtl}
                  </div>
                </div>
              </div>
            </div>`;
        });
    }
    document.getElementById("show-product").innerHTML = html;
}

// ====== TÌM KIẾM & LỌC ======
function searchAndFilter() {
    const category = document.getElementById('the-loai').value;
    const keyword  = document.getElementById('form-search-product').value.trim().toUpperCase();

    let filtered = productAll.filter(p => {
        // lọc theo status/category
        if (category === 'Đã xóa')       { if (p.status != 0) return false; }
        else if (category !== 'Tất cả')  { if (p.category !== category) return false; }
        // status = 1 cho Tất cả và chuyên mục thường
        else                              { if (p.status != 1) return false; }
        // lọc theo từ khoá
        if (keyword && !p.title.toUpperCase().includes(keyword)) return false;
        return true;
    });

    // reset trang
    currentPage = 1;
    // tạm gán productAll để paginate & show
    const oldAll = productAll;
    productAll = filtered;
    renderPage();
    // sau khi vẽ xong, khôi phục productAll gốc để các thao tác CRUD không mất dữ liệu
    productAll = oldAll;
}

// ====== HỦY TÌM KIẾM ======
function cancelSearchProduct() {
    document.getElementById('the-loai').value = 'Tất cả';
    document.getElementById('form-search-product').value = '';
    currentPage = 1;
    renderPage();
}

// ====== XÓA SẢN PHẨM ======
async function deleteProduct(id) {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    try {
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        toast({ title: 'Success', message: 'Xóa thành công!', type: 'success', duration: 3000 });
        await fetchProducts();
    } catch (err) {
        console.error("Lỗi xoá:", err);
    }
}
// ====== KHÔI PHỤC ======
async function changeStatusProduct(id) {
    if (!confirm("Bạn có chắc muốn khôi phục?")) return;
    try {
        await fetch(`/api/products/${id}/restore`, { method: "PUT" });
        toast({ title: 'Success', message: 'Khôi phục thành công!', type: 'success', duration: 3000 });
        await fetchProducts();
    } catch (err) {
        console.error("Lỗi khôi phục:", err);
    }
}

// ====== HIỂN THỊ DỮ LIỆU SẢN PHẨM ======
function showProductArr(arr) {
    let html = "";
    if (arr.length === 0) {
        html = `
        <div class="no-result">
          <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
          <div class="no-result-h">Không có sản phẩm để hiển thị</div>
        </div>`;
    } else {
        arr.forEach(p => {
            // gọi đúng product_id
            const id = p.product_id;
            const btnCtl = p.status == 1
                ? `<button class="btn-delete" onclick="deleteProduct(${id})"><i class="fa-regular fa-trash"></i></button>`
                : `<button class="btn-delete" onclick="changeStatusProduct(${id})"><i class="fa-regular fa-eye"></i></button>`;
            html += `
            <div class="list">
              <div class="list-left">
                <img src="${p.img}" alt="">
                <div class="list-info">
                  <h4>${p.title}</h4>
                  <p class="list-note">${p.desc}</p>
                  <span class="list-category">${p.category}</span>
                </div>
              </div>
              <div class="list-right">
                <div class="list-price">
                  <span class="list-current-price">${vnd(p.price)}</span>
                </div>
                <div class="list-control">
                  <div class="list-tool">
                    <button class="btn-edit" onclick="editProduct(${id})"><i class="fa-light fa-pen-to-square"></i></button>
                    ${btnCtl}
                  </div>
                </div>
              </div>
            </div>`;
        });
    }
    document.getElementById("show-product").innerHTML = html;
}

// ====== EDIT FORM ======
async function editProduct(id) {
    try {
        const res = await fetch(`/api/products/${id}`);
        const p   = await res.json();
        indexCur = id;
        // Ẩn nút Thêm, hiện nút Lưu
        document.querySelectorAll(".add-product-e").forEach(e => e.style.display = "none");
        document.querySelectorAll(".edit-product-e").forEach(e => e.style.display = "block");
        // Mở modal
        document.querySelector(".add-product").classList.add("open");
        // Điền dữ liệu vào form
        document.querySelector(".upload-image-preview").src = p.img;
        document.getElementById("ten-mon").value    = p.title;
        document.getElementById("gia-moi").value     = p.price;
        document.getElementById("mo-ta").value       = p.desc;
        document.getElementById("chon-mon").value    = p.category;
    } catch (err) {
        console.error("Lỗi load chi tiết:", err);
    }
}

// ====== CẬP NHẬT SẢN PHẨM ======
document.getElementById("update-product-button")
  .addEventListener("click", async e => {
    e.preventDefault();
    const payload = {
        title:    document.getElementById("ten-mon").value,
        price:    parseInt(document.getElementById("gia-moi").value),
        desc:     document.getElementById("mo-ta").value,
        category: document.getElementById("chon-mon").value,
        img:      getPathImage(document.querySelector(".upload-image-preview").src),
        status:   1    // giữ trạng thái Hiển thị
    };
    try {
        await fetch(`/api/products/${indexCur}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        toast({ title: "Success", message: "Sửa thành công!", type: "success", duration: 3000 });
        document.querySelector(".add-product").classList.remove("open");
        setDefaultValue();
        await fetchProducts();
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
    }
});

// ====== THÊM SẢN PHẨM ======
document.getElementById("add-product-button")
  .addEventListener("click", async e => {
    e.preventDefault();
    const payload = {
        title:    document.getElementById("ten-mon").value,
        price:    parseInt(document.getElementById("gia-moi").value),
        desc:     document.getElementById("mo-ta").value,
        category: document.getElementById("chon-mon").value,
        img:      getPathImage(document.querySelector(".upload-image-preview").src),
        status:   1   
    };
    if (!payload.title || !payload.price || !payload.desc) {
        return toast({ title:"Chú ý", message:"Nhập đủ thông tin!", type:"warning", duration:3000 });
    }
    if (isNaN(payload.price)) {
        return toast({ title:"Chú ý", message:"Giá phải là số!", type:"warning", duration:3000 });
    }
    try {
        await fetch('/api/products', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        toast({ title:"Success", message:"Thêm thành công!", type:"success", duration:3000 });
        document.querySelector(".add-product").classList.remove("open");
        setDefaultValue();
        await fetchProducts();
    } catch (err) {
        console.error("Lỗi thêm:", err);
    }
});

// ====== HỖ TRỢ ======
function getPathImage(path) {
    const parts = path.split("/");
    return "./assets/img/products/" + parts.pop();
}
function setDefaultValue() {
    document.querySelector(".upload-image-preview").src = "./assets/img/blank-image.png";
    document.getElementById("ten-mon").value = "";
    document.getElementById("gia-moi").value = "";
    document.getElementById("mo-ta").value = "";
    document.getElementById("chon-mon").value = "Món chay";
}
document.querySelector(".modal-close.product-form")
  .addEventListener("click", setDefaultValue);

document.getElementById('the-loai')
  .addEventListener('change', searchAndFilter);
document.getElementById('form-search-product')
  .addEventListener('input', searchAndFilter);
window.addEventListener('DOMContentLoaded', fetchProducts);

// Open Popup Modal
let btnAddProduct = document.getElementById("btn-add-product");
btnAddProduct.addEventListener("click", () => {
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "block";
    })
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "none";
    })
    document.querySelector(".add-product").classList.add("open");
});

// Close Popup Modal
let closePopup = document.querySelectorAll(".modal-close");
let modalPopup = document.querySelectorAll(".modal");

for (let i = 0; i < closePopup.length; i++) {
    closePopup[i].onclick = () => {
        modalPopup[i].classList.remove("open");
    };
}

// On change Image
function uploadImage(el) {
    let path = "./assets/img/products/" + el.value.split("\\")[2];
    document.querySelector(".upload-image-preview").setAttribute("src", path);
}


// Constants
const API_BASE = '/api';
const PHIVANCHUYEN = 0;
let priceFinal = document.getElementById("checkout-cart-price-final");

// State
let orders = [];

// On load, fetch orders
document.addEventListener('DOMContentLoaded', fetchOrders);

/** Fetch all orders and normalize fields */
async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error(`Error fetching orders: ${res.status}`);
    const data = await res.json();
    orders = data.map(o => ({
      // Map order_id thành id để dùng chung
      id: o.order_id,
      ...o,
      thongtien: o.total_money,
      thoigiandat: o.created_at,
      is_payment: o.is_payment ?? false
    }));
    showOrder(orders);
  } catch (err) {
    console.error(err);
    document.getElementById("showOrder").innerHTML =
      '<tr><td colspan="6">Không thể tải đơn hàng</td></tr>';
  }
}

/** Format number to VND */
function vnd(num) {
  const n = num != null ? Number(num) : 0;
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

/** Change order payment status via API */
async function changeStatus(orderId, btnEl) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_payment: true })
    });
    if (!res.ok) throw new Error(`Error updating payment: ${res.status}`);
    btnEl.classList.replace("btn-chuaxuly", "btn-daxuly");
    btnEl.textContent = "Đã xử lý";

    // Cập nhật state cục bộ
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) orders[idx].is_payment = true;
    showOrder(orders);
  } catch (err) {
    console.error(err);
    alert('Không thể cập nhật trạng thái trả tiền');
  }
}

/** Render orders table */
function showOrder(arr) {
  const rows = arr.length
    ? arr.map(item => {
        const date = formatDate(item.thoigiandat);
        const status = item.is_payment
          ? `<span class="status-complete">Đã xử lý</span>`
          : `<span class="status-no-complete">Chưa xử lý</span>`;
        const detailBtn = `
          <button class="btn-detail" onclick="detailOrder('${item.id}')">
            <i class="fa-regular fa-eye"></i> Chi tiết
          </button>`;
        return `
          <tr>
            <td>${item.id}</td>
            <td>${item.customer || ''}</td>
            <td>${date}</td>
            <td>${vnd(item.thongtien)}</td>
            <td>${status}</td>
            <td class="control">${detailBtn}</td>
          </tr>`;
      }).join('')
    : `<tr><td colspan="6">Không có dữ liệu</td></tr>`;

  document.getElementById("showOrder").innerHTML = rows;
}

/** Format date to dd/mm/yyyy */
function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Show order detail */
async function detailOrder(orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error(`Error fetching order: ${res.status}`);
    const order = await res.json();
    renderOrderDetailModal(order);
  } catch (err) {
    console.error(err);
    alert('Không thể tải chi tiết đơn hàng');
  }
}


/** Render modal hiển thị chi tiết đơn hàng */
function renderOrderDetailModal(order) {
    const modal = document.querySelector(".modal.detail-order");
    const detailContainer = modal.querySelector('.modal-detail-order');
    const bottomContainer = modal.querySelector('.modal-detail-bottom');

    // Hiện modal
    modal.classList.add("open");

    // Chuẩn bị danh sách sản phẩm trong đơn
    const items = order.items?.length
      ? order.items
      : (order.cart?.items || []);

    // Xây dựng HTML cho phần LEFT (sản phẩm)
    let leftHtml = `<div class="modal-detail-left"><div class="order-item-group">`;
    items.forEach(item => {
        const product = item.product || {};
        // Xử lý đường dẫn ảnh: dùng product.img nếu có, ngược lại dùng ảnh mặc định
        const imgSrc = product.img
          ? product.img
          : './assets/img/no-image.png';

        leftHtml += `
        <div class="order-product">
          <div class="order-product-left">
            <img src="${imgSrc}" alt="${product.title || 'Sản phẩm'}" />
            <div class="order-product-info">
              <h4>${product.title || ''}</h4>
              <p class="order-product-note">
                <i class="fa-light fa-pen"></i>
                ${item.note || 'Không có ghi chú'}
              </p>
              <p class="order-product-quantity">SL: ${item.quantity}</p>
            </div>
          </div>
          <div class="order-product-right">
            <div class="order-product-price">
              <span class="order-product-current-price">${vnd(product.price)}</span>
            </div>
          </div>
        </div>`;
    });
    leftHtml += `</div></div>`;

    // Xây dựng HTML cho phần RIGHT (thông tin đơn)
    const rightHtml = `
    <div class="modal-detail-right">
      <ul class="detail-order-group">
        <li class="detail-order-item">
          <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
          <span class="detail-order-item-right">${formatDate(order.created_at)}</span>
        </li>
        <li class="detail-order-item">
          <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
          <span class="detail-order-item-right">${order.payment_method || ''}</span>
        </li>
        <li class="detail-order-item">
          <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
          <span class="detail-order-item-right">${order.customer || ''}</span>
        </li>
        <li class="detail-order-item">
          <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
          <span class="detail-order-item-right">${order.phone || ''}</span>
        </li>
        <li class="detail-order-item tb">
          <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
          <p class="detail-order-item-b">
            ${(order.delivery_time ? order.delivery_time + " - " : "") +
               formatDate(order.delivery_date || order.created_at)}
          </p>
        </li>
        <li class="detail-order-item tb">
          <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
          <p class="detail-order-item-b">${order.address || ''}</p>
        </li>
        <li class="detail-order-item tb">
          <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
          <p class="detail-order-item-b">${order.note || 'Không có ghi chú'}</p>
        </li>
      </ul>
    </div>`;

    // Gán vào container
    detailContainer.innerHTML = leftHtml + rightHtml;

    // Phần bottom (tổng tiền + nút trạng thái)
    const isPaid = order.is_payment;
    bottomContainer.innerHTML = `
      <div class="modal-detail-bottom-left">
        <div class="price-total">
          <span class="thanhtien">Thành tiền</span>
          <span class="price">${vnd(order.total_money)}</span>
        </div>
      </div>
      <div class="modal-detail-bottom-right">
        <button class="modal-detail-btn ${isPaid ? 'btn-daxuly' : 'btn-chuaxuly'}"
                onclick="changeStatus('${order.order_id}', this)">
          ${isPaid ? 'Đã xử lý' : 'Chưa xử lý'}
        </button>
      </div>`;
}

/** Filter UI */
function findOrder() {
  const tinhTrang = parseInt(document.getElementById("tinh-trang").value);
  const ct = document.getElementById("form-search-order").value.trim().toLowerCase();
  const timeStart = document.getElementById("time-start").value;
  const timeEnd = document.getElementById("time-end").value;
  if (timeEnd && timeStart && timeEnd < timeStart) {
    return alert("Lựa chọn thời gian sai!");
  }

  let result = [...orders];
  if (tinhTrang !== 2) {
    result = result.filter(o => o.is_payment === (tinhTrang === 1));
  }
  if (ct) {
    result = result.filter(o =>
      (o.customer || '').toLowerCase().includes(ct) ||
      o.id.includes(ct)
    );
  }
  if (timeStart) {
    result = result.filter(o => new Date(o.thoigiandat) >= new Date(timeStart));
  }
  if (timeEnd) {
    result = result.filter(o => new Date(o.thoigiandat) <= new Date(timeEnd));
  }

  showOrder(result);
}

function cancelSearchOrder() {
  document.getElementById("tinh-trang").value = 2;
  document.getElementById("form-search-order").value = "";
  document.getElementById("time-start").value = "";
  document.getElementById("time-end").value = "";
  showOrder(orders);
}




// DOM selectors
const addAccountBtn = document.getElementById('signup-button');
const updateAccountBtn = document.getElementById('btn-update-account');
const closeModalBtn = document.querySelector('.modal.signup .modal-close');
const modalSignup = document.querySelector('.signup');
const usernameInput = document.getElementById('username');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const showUserTable = document.getElementById('show-user');
const searchStatus = document.getElementById('tinh-trang-user');
const searchText = document.getElementById('form-search-user');
const searchStart = document.getElementById('time-start-user');
const searchEnd = document.getElementById('time-end-user');
const searchBtn = document.getElementById('search-user-btn');
const resetBtn = document.getElementById('cancel-search-btn');
const logoutBtn = document.getElementById("logout-acc");

const formMessageName = document.querySelector('.form-message-name');
const formMessagePhone = document.querySelector('.form-message-phone');
const formMessagePassword = document.querySelector('.form-message-password');

let allAccounts = [];
let currentEditId = null;

// Reset lại form nhập liệu và thông báo lỗi (nếu có)
function signUpFormReset() {
  usernameInput.value = "";
  phoneInput.value = "";
  passwordInput.value = "";
  formMessageName.textContent = "";
  formMessagePhone.textContent = "";
  formMessagePassword.textContent = "";
}

// Đóng modal => reset form
closeModalBtn.addEventListener("click", () => {
  signUpFormReset();
  modalSignup.classList.remove("open");
});

// Mở modal thêm tài khoản mới
function openCreateAccount() {
  modalSignup.classList.add("open");
  // Ẩn các phần tử dành riêng cho chỉnh sửa, hiện phần thêm mới
  document.querySelectorAll(".edit-account-e").forEach(el => el.style.display = "none");
  document.querySelectorAll(".add-account-e").forEach(el => el.style.display = "block");
  signUpFormReset();
}

// Hiển thị danh sách người dùng vào bảng
function showUserArr(arr) {
  let html = "";
  if (!arr.length) {
    html = `<tr><td colspan="6">Không có dữ liệu</td></tr>`;
  } else {
    arr.forEach((acc, idx) => {
      let statusLabel = acc.status == 0 
        ? '<span class="status-no-complete">Bị khóa</span>'
        : '<span class="status-complete">Hoạt động</span>';
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td>${acc.username}</td>
          <td>${acc.phone}</td>
          <td>${formatDate(acc.join)}</td>
          <td>${statusLabel}</td>
          <td class="control control-table">
            <button class="btn-delete" data-id="${acc.id}"><i class="fa-regular fa-trash"></i></button>
          </td>
        </tr>
      `;
    });
  }
  showUserTable.innerHTML = html;

  // Gắn sự kiện cho nút sửa và xóa sau khi đã được render
  document.querySelectorAll('.btn-edit').forEach(btn =>
    btn.addEventListener('click', () => editAccount(btn.dataset.id))
  );
  document.querySelectorAll('.btn-delete').forEach(btn =>
    btn.addEventListener('click', () => deleteAccount(btn.dataset.id))
  );
}

// Lấy dữ liệu tài khoản từ API và hiển thị ra bảng
async function loadAccounts() {
  try {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    allAccounts = data;
    showUserArr(allAccounts);
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu tài khoản:", err);
  }
}

// Lọc dữ liệu theo trạng thái, tên/SDT, và khoảng thời gian bắt đầu/tháng kết thúc
function filterAccounts() {
  const statusVal = parseInt(searchStatus.value);
  const text = searchText.value.trim().toLowerCase();
  const startDate = searchStart.value;
  const endDate = searchEnd.value;

  let filteredAccounts = allAccounts.filter(account => {
    let matchStatus = (statusVal === 2) || (account.status === statusVal);
    let matchText = (!text) || (account.username.toLowerCase().includes(text)) || (account.phone.includes(text));
    let matchStart = (!startDate) || (new Date(account.join) >= new Date(startDate));
    let matchEnd = (!endDate) || (new Date(account.join) <= new Date(endDate));

    return matchStatus && matchText && matchStart && matchEnd;
  });

  showUserArr(filteredAccounts);
}

// Reset ô tìm kiếm và hiển thị lại toàn bộ danh sách
function resetSearch() {
  searchStatus.value = 2;
  searchText.value = "";
  searchStart.value = "";
  searchEnd.value = "";
  showUserArr(allAccounts);
}

// Thêm mới tài khoản
async function addAccount(e) {
  e.preventDefault(); 
  formMessageName.textContent = "";
  formMessagePhone.textContent = "";
  formMessagePassword.textContent = "";
  
  const username = usernameInput.value.trim();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value.trim();

  // Kiểm tra đầu vào
  if (username.length < 3) {
    formMessageName.textContent = 'Họ tên phải có ít nhất 3 ký tự';
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    formMessagePhone.textContent = 'Số điện thoại phải có 10 số';
    return;
  }
  if (password.length < 6) {
    formMessagePassword.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
    return;
  }

  try {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        phone: phone,
        password: password,
        password_confirmation: password,
        status: 1,
        userType: 'user',
        join: new Date().toISOString().split('T')[0]
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Tạo tài khoản thành công!");
      modalSignup.classList.remove('open');
      loadAccounts();
    } else {
      alert(data.message ? data.message : "Có lỗi khi tạo tài khoản!");
    }
  } catch (err) {
    console.error("Lỗi khi thêm tài khoản:", err);
  }
}
addAccountBtn.addEventListener('click', addAccount);

// Xóa tài khoản
async function deleteAccount(id) {
  if (!confirm('Xác nhận xóa tài khoản?')) return;
  try {
    const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert("Xóa tài khoản thành công!");
      loadAccounts();
    } else {
      alert("Có lỗi xảy ra khi xóa tài khoản!");
    }
  } catch (err) {
    console.error("Lỗi khi xóa tài khoản:", err);
  }
}




// Khởi tạo các sự kiện sau khi DOM được tải hoàn chỉnh
document.addEventListener('DOMContentLoaded', () => {
  loadAccounts();
  searchBtn.addEventListener('click', filterAccounts);
  resetBtn.addEventListener('click', resetSearch);
});
document.addEventListener("DOMContentLoaded", () => {
  // Hàm chuyển đổi dữ liệu API từ các endpoint thực có: /api/orders, /api/products và /api/items
  async function createObj() {
    try {
      const ordersResponse = await fetch('/api/orders');
      const orders = await ordersResponse.json();

      const productsResponse = await fetch('/api/products');
      const products = await productsResponse.json();

      // Thay vì api/order-details, sử dụng api/items vì endpoint này có tồn tại
      const itemsResponse = await fetch('/api/items');
      const orderDetails = await itemsResponse.json();

      let result = [];
      orderDetails.forEach(item => {
        // Giả sử item.product_id & item.cart_id được định nghĩa theo model của bạn
        let prod = products.find(product => product.product_id == item.product_id);
        if (!prod) return;
        let order = orders.find(orderObj => orderObj.cart_id == item.cart_id);
        if (!order) return;
        let obj = {
          id: item.product_id,            // Sử dụng product_id để xác định sản phẩm
          madon: item.item_id,            // Sử dụng item_id từ API items làm mã đơn (bạn có thể thay đổi nếu cần)
          price: prod.price,
          quantity: item.quantity,
          category: prod.category,
          title: prod.title,
          img: prod.img,
          time: order.thoigiandat        // Giả sử đơn hàng có thuộc tính thoigiandat
        };
        result.push(obj);
      });
      return result;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ API:", error);
      return [];
    }
  }

  // Hàm lọc dữ liệu theo danh mục, tiêu đề và khoảng thời gian
  async function thongKe(mode) {
    const categoryTkEl = document.getElementById("the-loai-tk");
    const ctEl = document.getElementById("form-search-tk");
    const timeStartEl = document.getElementById("time-start-tk");
    const timeEndEl = document.getElementById("time-end-tk");

    // Kiểm tra tồn tại của các phần tử DOM trước khi truy cập
    if (!categoryTkEl || !ctEl || !timeStartEl || !timeEndEl) {
      console.error("Một hoặc nhiều phần tử DOM không tồn tại");
      return;
    }

    let categoryTk = categoryTkEl.value;
    let ct = ctEl.value;
    let timeStart = timeStartEl.value;
    let timeEnd = timeEndEl.value;

    if (timeEnd < timeStart && timeEnd !== "" && timeStart !== "") {
      alert("Lựa chọn thời gian sai !");
      return;
    }

    let arrDetail = await createObj();

    let result = categoryTk === "Tất cả" ? arrDetail : arrDetail.filter(item => item.category === categoryTk);

    result = ct === "" ? result : result.filter(item => item.title.toLowerCase().includes(ct.toLowerCase()));

    if (timeStart !== "" && timeEnd === "") {
      result = result.filter(item => new Date(item.time) > new Date(timeStart).setHours(0, 0, 0));
    } else if (timeStart === "" && timeEnd !== "") {
      result = result.filter(item => new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59));
    } else if (timeStart !== "" && timeEnd !== "") {
      result = result.filter(item =>
        new Date(item.time) > new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59)
      );
    }
    showThongKe(result, mode);
  }

  // Hàm hiển thị tổng quan
  function showOverview(arr) {
    const quantityProductEl = document.getElementById("quantity-product");
    const quantityOrderEl = document.getElementById("quantity-order");
    const quantitySaleEl = document.getElementById("quantity-sale");

    if (!quantityProductEl || !quantityOrderEl || !quantitySaleEl) {
      console.error("Không tìm thấy phần tử hiển thị tổng quan");
      return;
    }

    quantityProductEl.innerText = arr.length;
    quantityOrderEl.innerText = arr.reduce((sum, cur) => sum + parseInt(cur.quantity), 0);
    quantitySaleEl.innerText = vnd(arr.reduce((sum, cur) => sum + parseInt(cur.doanhthu), 0));
  }

  // Hàm hiển thị bảng thống kê
  async function showThongKe(arr, mode) {
    let orderHtml = "";
    let mergeObj = mergeObjThongKe(arr);

    // Hiển thị tổng quan
    showOverview(mergeObj);

    switch (mode) {
      case 0:
        mergeObj = mergeObjThongKe(await createObj());
        showOverview(mergeObj);
        document.getElementById("the-loai-tk").value = "Tất cả";
        document.getElementById("form-search-tk").value = "";
        document.getElementById("time-start-tk").value = "";
        document.getElementById("time-end-tk").value = "";
        break;
      case 1:
        mergeObj.sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity));
        break;
      case 2:
        mergeObj.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity));
        break;
    }

    mergeObj.forEach((item, index) => {
      orderHtml += `
        <tr>
          <td>${index + 1}</td>
          <td>
            <div class="prod-img-title">
              <img class="prd-img-tbl" src="${item.img}" alt="">
              <p>${item.title}</p>
            </div>
          </td>
          <td>${item.quantity}</td>
          <td>${vnd(item.doanhthu)}</td>
          <td>
            <button class="btn-detail product-order-detail" data-id="${item.id}">
              <i class="fa-regular fa-eye"></i> Chi tiết
            </button>
          </td>
        </tr>
      `;
    });
    const showTkEl = document.getElementById("showTk");
    if (showTkEl) {
      showTkEl.innerHTML = orderHtml;
    } else {
      console.error("Không tìm thấy phần tử để hiển thị thống kê");
    }

    // Gắn sự kiện cho các nút "Chi tiết"
    document.querySelectorAll(".product-order-detail").forEach(button => {
      let idProduct = button.getAttribute("data-id");
      button.addEventListener("click", () => {
        detailOrderProduct(arr, idProduct);
      });
    });
  }

  // Hàm gộp các đối tượng có cùng sản phẩm lại với nhau
  function mergeObjThongKe(arr) {
    let result = [];
    arr.forEach(item => {
      let existing = result.find(i => i.id == item.id);
      if (existing) {
        existing.quantity = parseInt(existing.quantity) + parseInt(item.quantity);
        existing.doanhthu += parseInt(item.price) * parseInt(item.quantity);
      } else {
        const newItem = { ...item };
        newItem.doanhthu = newItem.price * newItem.quantity;
        result.push(newItem);
      }
    });
    return result;
  }

  // Hàm hiển thị chi tiết đơn hàng của sản phẩm được chọn
  function detailOrderProduct(arr, id) {
    let orderHtml = "";
    arr.forEach(item => {
      if (item.id == id) {
        orderHtml += `
          <tr>
            <td>${item.madon}</td>
            <td>${item.quantity}</td>
            <td>${vnd(item.price)}</td>
            <td>${formatDate(item.time)}</td>
          </tr>
        `;
      }
    });
    const detailEl = document.getElementById("show-product-order-detail");
    if (detailEl) {
      detailEl.innerHTML = orderHtml;
    }
    const modalEl = document.querySelector(".modal.detail-order-product");
    if (modalEl) {
      modalEl.classList.add("open");
    }
  }

  // Khởi chạy ban đầu khi trang load
  (async function () {
    const data = await createObj();
    await showThongKe(data);
  })();

});