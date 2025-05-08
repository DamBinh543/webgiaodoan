//Signup && Login Form
// Chuyen doi qua lai SignUp & Login 
let signup = document.querySelector('.signup-link');
let login = document.querySelector('.login-link');
let container = document.querySelector('.signup-login .modal-container');
login.addEventListener('click', () => {
    container.classList.add('active');
})

signup.addEventListener('click', () => {
    container.classList.remove('active');
})

let signupbtn = document.getElementById('signup');
let loginbtn = document.getElementById('login');
let formsg = document.querySelector('.modal.signup-login')
signupbtn.addEventListener('click', () => {
    formsg.classList.add('open');
    container.classList.remove('active');
    body.style.overflow = "hidden";
})

loginbtn.addEventListener('click', () => {
    document.querySelector('.form-message-check-login').innerHTML = '';
    formsg.classList.add('open');
    container.classList.add('active');
    body.style.overflow = "hidden";
})

// Dang nhap & Dang ky
// ĐĂNG KÝ
let signupButton = document.getElementById('signup-button');
signupButton.addEventListener('click', async (event) => {
    event.preventDefault();
    let usernameUser = document.getElementById('username').value;
    let phoneUser = document.getElementById('phone').value;
    let passwordUser = document.getElementById('password').value;
    let passwordConfirmation = document.getElementById('password_confirmation').value;
    let checkSignup = document.getElementById('checkbox-signup').checked;

    // Reset lỗi
    document.querySelector('.form-message-name').innerHTML = '';
    document.querySelector('.form-message-phone').innerHTML = '';
    document.querySelector('.form-message-password').innerHTML = '';
    document.querySelector('.form-message-password-confi').innerHTML = '';
    document.querySelector('.form-message-checkbox').innerHTML = '';

    let isValid = true;
    // Kiểm tra các trường thông tin
    if (usernameUser.length < 3) {
        document.querySelector('.form-message-name').innerHTML = 'Họ tên phải lớn hơn 3 ký tự';
        isValid = false;
    }

    if (phoneUser.length !== 10) {
        document.querySelector('.form-message-phone').innerHTML = 'Số điện thoại phải đúng 10 số';
        isValid = false;
    }

    if (passwordUser.length < 6) {
        document.querySelector('.form-message-password').innerHTML = 'Mật khẩu phải từ 6 ký tự trở lên';
        isValid = false;
    }

    if (passwordUser !== passwordConfirmation) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Mật khẩu xác nhận không khớp';
        isValid = false;
    }

    if (!checkSignup) {
        document.querySelector('.form-message-checkbox').innerHTML = 'Bạn phải đồng ý điều khoản';
        isValid = false;
    }

    if (!isValid) return;
    const userData = {
        username: usernameUser,
        phone: phoneUser,
        password: passwordUser,
        password_confirmation: passwordConfirmation,
        address: 'trống',
        userType: 'user',
        join: new Date().toISOString().split('T')[0]
    };

    try {
        const res = await fetch('/api/accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        if (res.ok) {
            toast({ title: 'Thành công', message: 'Tạo tài khoản thành công!', type: 'success' });
            closeModal();
        } else {
            let err = data?.errors || {};
            // Hiển thị lỗi cụ thể cho từng trường
            if (err.username) document.querySelector('.form-message-name').innerHTML = err.username[0];
            if (err.phone) document.querySelector('.form-message-phone').innerHTML = err.phone[0];
            if (err.password) document.querySelector('.form-message-password').innerHTML = err.password[0];
            if (err.password_confirmation) document.querySelector('.form-message-password-confi').innerHTML = err.password_confirmation[0];
            if (data?.message) {
                toast({ title: 'Thất bại', message: data.message, type: 'error' });
            } else {
                toast({ title: 'Thất bại', message: 'Đăng ký không thành công!', type: 'error' });
            }
        }
    } catch (err) {
        console.error('Lỗi kết nối:', err);
    }
});


//Dang nhap
let loginButton = document.getElementById('login-button');

loginButton.addEventListener('click', async (event) => {
    event.preventDefault();

    let phonelog = document.getElementById('phone-login').value;
    let passlog = document.getElementById('password-login').value;

    // Reset lỗi
    document.querySelector('.form-message.phonelog').innerHTML = '';
    document.querySelector('.form-message-check-login').innerHTML = '';

    let isValid = true;

    if (phonelog.length === 0) {
        document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại';
        isValid = false;
    } else if (phonelog.length !== 10) {
        document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        isValid = false;
    }

    if (passlog.length === 0) {
        document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu';
        isValid = false;
    } else if (passlog.length < 6) {
        document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        isValid = false;
    }

    if (!isValid) return;

    try {
        const response = await fetch('/api/accounts/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                phone: phonelog,
                password: passlog
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('currentuser', JSON.stringify(data));
            toast({ title: 'Success', message: 'Đăng nhập thành công', type: 'success', duration: 3000 });
            closeModal();
            kiemtradangnhap();
            checkAdmin();
            updateAmount();
        } else {
            toast({ title: 'Error', message: data.message || 'Đăng nhập thất bại', type: 'error', duration: 3000 });
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
    }
});
// Hiển thị menu nếu là admin
function checkAdmin() {
    const user = JSON.parse(localStorage.getItem('currentuser'));
    if (user && user.userType === 'admin') {
        const node = document.createElement('li');
        node.innerHTML = `<a href="./admin"><i class="fa-light fa-gear"></i> Quản lý cửa hàng</a>`;
        document.querySelector('.header-middle-right-menu').prepend(node);
    }
}

// Kiểm tra trạng thái đăng nhập và hiển thị thông tin tài khoản
function kiemtradangnhap() {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    if (currentUser != null) {
        let nameToShow = currentUser.username || currentUser.username || 'Tài khoản';
        document.querySelector('.auth-container').innerHTML = `
            <span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${nameToShow} <i class="fa-sharp fa-solid fa-caret-down"></i></span>`;
        
        document.querySelector('.header-middle-right-menu').innerHTML = `
            <li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i> Tài khoản của tôi</a></li>
            <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-bags-shopping"></i> Đơn hàng đã mua</a></li>
            <li class="border"><a id="logout" href="javascript:;"><i class="fa-light fa-right-from-bracket"></i> Thoát tài khoản</a></li>`;
        
        document.querySelector('#logout').addEventListener('click', logOut);
    }
}


// Đăng xuất
function logOut() {
    localStorage.removeItem('currentuser');
    toast({ title: 'Đăng xuất', message: 'Bạn đã đăng xuất khỏi tài khoản', type: 'success', duration: 3000 });
    window.location.reload();
}

// Cập nhật thông tin người dùng qua API
async function changeInformation() {
    const user = JSON.parse(localStorage.getItem('currentuser'));
    const infoname = document.getElementById('infoname');
    const infoemail = document.getElementById('infoemail');
    const infoaddress = document.getElementById('infoaddress');

    let isValid = true;

    if (isValid) {
        const updatedUser = {
            username: infoname.value,
            address: infoaddress.value,
        };

        try {
            const res = await fetch(`/api/accounts/${user.account_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(updatedUser)
            });
            const data = await res.json();
            if (res.ok) {
                // Giữ lại cart_id cũ nếu không có trong response
                const newUser = data.data || {};
                if (user.cart_id && !newUser.cart_id) {
                    newUser.cart_id = user.cart_id;
                }
                localStorage.setItem('currentuser', JSON.stringify(newUser));
                toast({ title: 'Thành công', message: 'Thông tin đã được cập nhật', type: 'success', duration: 3000 });
                kiemtradangnhap();
            } else {
                toast({ title: 'Lỗi', message: data.message || 'Không thể cập nhật thông tin', type: 'error', duration: 3000 });
            }
        } catch (error) {
            toast({ title: 'Lỗi', message: 'Không thể kết nối đến server!', type: 'error', duration: 3000 });
        }
    }
}

// Đổi mật khẩu người dùng
async function changePassword() {
    const currentUser = JSON.parse(localStorage.getItem("currentuser"));
    const passwordAfter = document.getElementById('password-after-info').value;
    const passwordConfirm = document.getElementById('password-comfirm-info').value;

    let isValid = true;
    if (!passwordAfter) {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
        isValid = false;
    } else {
        document.querySelector('.password-after-info-error').innerHTML = '';
    }

    if (!passwordConfirm) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng nhập mật khẩu xác nhận';
        isValid = false;
    } else {
        document.querySelector('.password-after-comfirm-error').innerHTML = '';
    }

    if (isValid) {
        if (passwordAfter !== passwordConfirm || passwordAfter.length < 6) {
            document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu không trùng khớp hoặc quá ngắn!';
            return;
        }

        try {
            const res = await fetch(`/api/accounts/${currentUser.account_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    password: passwordAfter,
                    password_confirmation: passwordConfirm
                })
            });

            const data = await res.json();

            if (res.ok) {
                const newUser = data.data || {};
                if (currentUser.cart_id && !newUser.cart_id) {
                    newUser.cart_id = currentUser.cart_id;
                }

                localStorage.setItem('currentuser', JSON.stringify(newUser));
                toast({ title: 'Thành công', message: 'Đổi mật khẩu thành công!', type: 'success', duration: 3000 });
            } else {
                toast({ title: 'Lỗi', message: data.message || 'Không thể đổi mật khẩu', type: 'error', duration: 3000 });
            }
        } catch (err) {
            toast({ title: 'Lỗi', message: 'Không thể kết nối đến server!', type: 'error', duration: 3000 });
        }
    }
}

// Hiển thị giao diện tài khoản
function myAccount() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.remove('open');
    document.getElementById('account-user').classList.add('open');
    fetchUserInfo();
}

// Hiển thị giao diện đơn hàng
function orderHistory() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.add('open');
    renderOrderProduct();
}

// Gọi API lấy thông tin người dùng
function fetchUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentuser'));
    if (!currentUser) {
        alert("Bạn chưa đăng nhập.");
        return;
    }

    fetch(`/api/accounts/${currentUser.account_id}`)
        .then(res => {
            if (!res.ok) throw new Error("Không thể lấy thông tin người dùng");
            return res.json();
        })
        .then(user => {
            document.getElementById('infoname').value = user.username ?? '';
            document.getElementById('infophone').value = user.phone ?? '';
            document.getElementById('infoaddress').value = user.address ?? '';
        })
        .catch(err => {
            console.error(err);
            alert("Đã có lỗi xảy ra khi lấy thông tin người dùng.");
        });
}

// Sự kiện khởi động
document.addEventListener('DOMContentLoaded', function() {
    kiemtradangnhap();
    checkAdmin();
});