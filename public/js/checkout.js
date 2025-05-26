const PHIVANCHUYEN = 0;
let priceFinal = document.getElementById("checkout-cart-price-final");
// Trang thanh toan
function thanhtoanpage(option, product = null) {
    setupNgayGiao();
    handleDeliveryMethod(option, product);
    renderThanhTien(option, product);
    handleCompleteCheckout(option, product);
}
function setupNgayGiao() {
    const today = new Date();
    const yyyyMmDd = today.toISOString().split('T')[0];
    const displayDate = `${today.getDate()}/${today.getMonth() + 1}`;

    // Chỉ hiển thị duy nhất lựa chọn Hôm nay
    const dateOrderHtml = `
        <a href="javascript:;" class="pick-date active" data-date="${yyyyMmDd}">
            <span class="text">Hôm nay</span>
            <span class="date">${displayDate}</span>
        </a>`;

    document.querySelector('.date-order').innerHTML = dateOrderHtml;

    // Gán giá trị mặc định ngày giao là hôm nay
    selectedDeliveryDate = yyyyMmDd;

    // Nếu vẫn muốn bắt sự kiện click (dùng cho trường hợp trong tương lai có thêm lựa chọn)
    document.querySelectorAll('.pick-date').forEach(dateBtn => {
        dateBtn.onclick = () => {
            document.querySelector('.pick-date.active')?.classList.remove('active');
            dateBtn.classList.add('active');
            selectedDeliveryDate = dateBtn.getAttribute("data-date");
            console.log("Ngày giao hàng đã chọn:", selectedDeliveryDate);
        };
    });
}


function handleDeliveryMethod(option, product) {
    const giaotannoi = document.querySelector('#giaotannoi');
    const tudenlay = document.querySelector('#tudenlay');
    const chkShip = document.querySelectorAll(".chk-ship");
    const tudenlayGroup = document.querySelector('#tudenlay-group');
    const deliveryTimeSection = document.querySelector('.delivery-time-section');
    const pickupTimeSection = document.querySelector('.pickup-time-section');

    tudenlay.onclick = () => {
        giaotannoi.classList.remove("active");
        tudenlay.classList.add("active");
        // Ẩn phần giao tận nơi
        chkShip.forEach(i => i.style.display = "none");
        deliveryTimeSection.style.display = "none"; 
        // Hiện phần chọn chi nhánh và thời gian lấy hàng
        tudenlayGroup.style.display = "block";
        pickupTimeSection.style.display = "block";
        selectedDeliveryDate = ""; 
        renderThanhTien(option, product);
    }

    giaotannoi.onclick = () => {
        tudenlay.classList.remove("active");
        giaotannoi.classList.add("active");
        // Hiện giao tận nơi, ẩn phần tự đến lấy
        chkShip.forEach(i => i.style.display = "flex");
        tudenlayGroup.style.display = "none";
        // Ẩn luôn phần chọn thời gian lấy hàng
        pickupTimeSection.style.display = "none";
        deliveryTimeSection.style.display = "block"; 
        renderThanhTien(option, product);
    }
}

function renderThanhTien(option, product = null) {
    const isGiaoTanNoi = document.querySelector('#giaotannoi')?.classList.contains('active');
    const shipFee = isGiaoTanNoi ? PHIVANCHUYEN : 0;
    let tongTien = 0;

    if (option === 1) {
        tongTien = getCartTotal(); 
        showProductCart(); 
    } else if (option === 2 && product) {
        tongTien = product.soluong * product.price;
        showProductBuyNow(product);
    }

    let totalBillOrderHtml = `
        <div class="priceFlx">
            <div class="text">Tiền hàng ${option === 2 ? `<span class="count">${product?.soluong} món</span>` : ''}</div>
            <div class="price-detail">
                <span id="checkout-cart-total">${vnd(tongTien)}</span>
            </div>
        </div>
        <div class="priceFlx chk-ship">
            <div class="text">Phí vận chuyển</div>
            <div class="price-detail chk-free-ship">
                <span>${vnd(shipFee)}</span>
            </div>
        </div>
    `;
    document.querySelector('.total-bill-order').innerHTML = totalBillOrderHtml;
    priceFinal.innerText = vnd(tongTien + shipFee);
}
function handleCompleteCheckout(option, product = null) {
    document.querySelector(".complete-checkout-btn").onclick = () => {
        xulyDathang(option === 1 ? undefined : product);
    };
}
function dathangngay() {
    const currentUser = JSON.parse(localStorage.getItem('currentuser'));
    if (!currentUser) {
        toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        return;
    }

    const productInfo = document.getElementById("product-detail-content");
    const datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
    datHangNgayBtn.onclick = () => {
        const productId = datHangNgayBtn.getAttribute("data-product");
        const soluong = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
        const ghichu = productInfo.querySelector("#popup-detail-note").value || "Không có ghi chú";

        const products = JSON.parse(localStorage.getItem('products'));
        const product = products.find(item => item.id == productId);

        if (product) {
            product.soluong = soluong;
            product.note = ghichu;
            checkoutpage.classList.add('active');
            thanhtoanpage(2, product);
            closeCart();
            body.style.overflow = "hidden";
        }
    };
}


// Hiển thị giỏ hàng
async function showProductCart() {
    const currentuser = JSON.parse(localStorage.getItem('currentuser'));
    const listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = '';

    if (!currentuser || !currentuser.cart_id) {
        listOrder.innerHTML = '<p>Giỏ hàng trống</p>';
        priceFinal.innerText = vnd(0);
        return;
    }

    try {
        const res = await fetch(`/api/carts/${currentuser.cart_id}`);
        if (!res.ok) throw new Error(`Lỗi server: ${res.status}`);

        const data = await res.json();
        const cartItems = data.items || [];
        const localProducts = JSON.parse(localStorage.getItem('products')) || [];

        let tongtien = 0;

        if (cartItems.length === 0) {
            listOrder.innerHTML = '<p>Giỏ hàng trống</p>';
            priceFinal.innerText = vnd(0);
            return;
        }

        cartItems.forEach(item => {
            const product = item.product || localProducts.find(p => p.product_id === item.product_id);
            if (product) {
                const quantity = item.quantity || 0;
                const price = parseFloat(product.price || 0);
                tongtien += quantity * price;

                listOrderHtml += `
                  <div class="food-total">
                      <div class="count">${quantity}x</div>
                      <div class="info-food">
                          <div class="name-food">${product.title}</div>
                      </div>
                  </div>
              `;
            }
        });

        listOrder.innerHTML = listOrderHtml;

        // Kiểm tra hình thức giao hàng để cộng phí vận chuyển nếu cần
        const isGiaoTanNoi = document.querySelector('#giaotannoi')?.classList.contains('active');
        const total = tongtien + (isGiaoTanNoi ? PHIVANCHUYEN : 0);

        // Cập nhật cả Tiền hàng và Tổng tiền
        document.getElementById('checkout-cart-total').innerText = vnd(tongtien);
        priceFinal.innerText = vnd(total);
    } catch (error) {
        console.error('Lỗi khi hiển thị giỏ hàng:', error);
        listOrder.innerHTML = '<p>Không thể tải giỏ hàng</p>';
        priceFinal.innerText = vnd(0);
    }
}

// Hien thi hang mua ngay
function showProductBuyNow(product) {
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${product.title}</div>
        </div>
    </div>`;
    listOrder.innerHTML = listOrderHtml;
}

//Open Page Checkout
let nutthanhtoan = document.querySelector('.thanh-toan')
let checkoutpage = document.querySelector('.checkout-page');
nutthanhtoan.addEventListener('click', () => {
    checkoutpage.classList.add('active');
    thanhtoanpage(1);
    closeCart();
    body.style.overflow = "hidden"
})


// Close Page Checkout
function closecheckout() {
    checkoutpage.classList.remove('active');
    body.style.overflow = "auto"
}

// Thong tin cac don hang da mua - Xu ly khi nhan nut dat hang
async function xulyDathang(product) {
    const currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (!currentUser) {
        toast({ title: "Lỗi", message: "Không tìm thấy thông tin người dùng!", type: "error", duration: 3000 });
        return;
    }

    // Thu thập input
    const tenNguoiNhan = document.querySelector("#tennguoinhan")?.value.trim();
    const sdtNhan      = document.querySelector("#sdtnhan")?.value.trim();
    const note         = document.querySelector(".note-order")?.value.trim() || "Không có ghi chú";

    let diaChiNhan = "";
    let hinhThucGiao = "";
    let deliveryTime = "";

    const isGiaoTanNoi = document.querySelector("#giaotannoi")?.classList.contains("active");
    const isTuDenLay   = document.querySelector("#tudenlay")?.classList.contains("active");

    if (isGiaoTanNoi) {
        // Giao tận nơi
        diaChiNhan = document.querySelector("#diachinhan")?.value.trim();
        hinhThucGiao = "Giao tận nơi";

        const giaoNgay    = document.querySelector("#giaongay")?.checked;
        const giaoVaoGio  = document.querySelector("#deliverytime")?.checked;

        if (giaoNgay) {
            // Lấy giờ hiện tại VN + 1 tiếng
            const nowVN = new Date(
                new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
            );
            nowVN.setHours(nowVN.getHours() + 1);
            deliveryTime = getVNDateTime(nowVN);
        } else if (giaoVaoGio) {
            const chosenTime = document.querySelector(".choise-time")?.value.trim();
            if (!chosenTime) {
                toast({ title: "Lỗi", message: "Vui lòng chọn giờ giao hàng!", type: "error", duration: 3000 });
                return;
            }
            // Ngày hôm nay theo VN
            const todayVN = getVNDateTime().slice(0, 10);
            const sel = new Date(`${todayVN} ${chosenTime}`);
            if (isNaN(sel.getTime())) {
                toast({ title: "Lỗi", message: "Giờ giao hàng không hợp lệ!", type: "error", duration: 3000 });
                return;
            }
            deliveryTime = getVNDateTime(sel);
        }
    }
    else if (isTuDenLay) {
        // Tự đến lấy
        hinhThucGiao = "Tự đến lấy";
        diaChiNhan = document.querySelector("#chinhanh-1")?.checked
            ? "123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
            : "544 Phố Huế, Hai Bà Trưng, Hà Nội";

        const pickupNow      = document.querySelector("#pickuptime-now")?.checked;
        const pickupSchedule = document.querySelector("#pickuptime-schedule")?.checked;

        if (pickupNow) {
            const nowVN = new Date(
                new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
            );
            nowVN.setHours(nowVN.getHours() + 1);
            deliveryTime = getVNDateTime(nowVN);
        } else if (pickupSchedule) {
            const chosenPickupTime = document.querySelector(".pickup-choise-time")?.value.trim();
            if (!chosenPickupTime) {
                toast({ title: "Lỗi", message: "Vui lòng chọn giờ lấy hàng!", type: "error", duration: 3000 });
                return;
            }
            const todayVN = getVNDateTime().slice(0, 10);
            const selPu = new Date(`${todayVN} ${chosenPickupTime}`);
            if (isNaN(selPu.getTime())) {
                toast({ title: "Lỗi", message: "Giờ lấy hàng không hợp lệ!", type: "error", duration: 3000 });
                return;
            }
            deliveryTime = getVNDateTime(selPu);
        } else {
            const nowVN = new Date(
                new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
            );
            nowVN.setHours(nowVN.getHours() + 1);
            deliveryTime = getVNDateTime(nowVN);
        }
    }

    // Validate
    if (!tenNguoiNhan || !sdtNhan || !diaChiNhan) {
        toast({ title: "Chú ý", message: "Vui lòng nhập đầy đủ thông tin!", type: "warning", duration: 4000 });
        return;
    }

    // Lấy danh sách sản phẩm
    let orderItems = [];
    if (!product) {
        try {
            const res = await fetch(`/api/carts/${currentUser.cart_id}`);
            if (!res.ok) throw new Error("Không thể lấy giỏ hàng");
            const cart = await res.json();
            orderItems = cart.items || [];
        } catch {
            toast({ title: "Lỗi", message: "Không thể tải giỏ hàng!", type: "error", duration: 3000 });
            return;
        }
    } else {
        orderItems = [product];
    }

    // Tính tổng
    let tongTien = 0;
    for (const item of orderItems) {
        const qty = item.quantity || item.soluong || 0;
        const price = item.product
            ? parseFloat(item.product.price)
            : parseFloat(await getpriceProduct(item.product_id));
        tongTien += qty * price;
    }
    const total = tongTien + (isGiaoTanNoi ? PHIVANCHUYEN : 0);
    document.getElementById("checkout-cart-total").innerText = vnd(tongTien);
    priceFinal.innerText = vnd(total);

    // Payload đặt hàng
    const orderPayload = {
        order_id: crypto.randomUUID(),
        customer: tenNguoiNhan,
        address: diaChiNhan,
        phone: sdtNhan,
        total_money: total,
        payment_method: hinhThucGiao,
        is_payment: false,
        cart_id: currentUser.cart_id,
        delivery_time: deliveryTime, 
        note: note
    };

    try {
        // Gửi đơn
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });
        const data = await res.json();
        if (!res.ok) {
            const msgs = data.errors
                ? Object.values(data.errors).flat().join("<br>")
                : data.message || "Không thể đặt hàng!";
            throw new Error(msgs);
        }

        // Tạo cart mới
        const newCartRes = await fetch("/api/carts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cart_id: crypto.randomUUID(),
                account_id: currentUser.account_id,
                status: 1
            })
        });
        if (!newCartRes.ok) throw new Error("Không thể tạo giỏ hàng mới");
        const newCart = await newCartRes.json();

        currentUser.cart_id = newCart.cart_id;
        localStorage.setItem("currentuser", JSON.stringify(currentUser));

        toast({ title: "Thành công", message: "Đặt hàng thành công!", type: "success", duration: 2000 });
        setTimeout(() => window.location.href = "/", 2000);
    } catch (err) {
        toast({ title: "Lỗi", message: err.message, type: "error", duration: 5000 });
    }
}
async function getpriceProduct(id) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const sp = products.find(item => item.id == id);
    return sp ? sp.price : 0;
}
function getVNDateTime(date = new Date()) {
    return date.toLocaleString('sv', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).slice(0, 19);
}