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
window.onload = checkLogin();

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

// Get amount product
function getAmoumtProduct() {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    return products.length;
}

// Get amount user
function getAmoumtUser() {
    let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")) : [];
    return accounts.filter(item => item.userType == 0).length;
}

// Get amount user
function getMoney() {
    let tongtien = 0;
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    orders.forEach(item => {
        tongtien += item.tongtien
    });
    return tongtien;
}

document.getElementById("amount-user").innerHTML = getAmoumtUser();
document.getElementById("amount-product").innerHTML = getAmoumtProduct();
document.getElementById("doanh-thu").innerHTML = vnd(getMoney());

// Doi sang dinh dang tien VND
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}
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
window.addEventListener('load', () => {
  fetchOrders();
});

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
