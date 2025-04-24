function fetchProducts() {
    fetch('http://localhost:8000/api/products')  // Địa chỉ API của bạn
        .then(response => {
            if (!response.ok) {  // Kiểm tra nếu có lỗi khi gọi API
                throw new Error('Lỗi khi lấy dữ liệu');
            }
            return response.json();  // Chuyển đổi dữ liệu từ JSON
        })
        .then(products => {
            // Xử lý dữ liệu trả về ở đây
            console.log('Dữ liệu sản phẩm:', products);  // In ra dữ liệu sản phẩm trong console
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error);  // Xử lý lỗi nếu có
        });
}