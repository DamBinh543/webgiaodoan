function fetchProducts() {
    fetch('http://localhost:8000/api/products') 
        .then(response => {
            if (!response.ok) {  
                throw new Error('Lỗi khi lấy dữ liệu');
            }
            return response.json(); 
        })
        .then(products => {
            console.log('Dữ liệu sản phẩm:', products);  
        })
        .catch(error => {
            console.error('Lỗi khi gọi API:', error);  
        });
}