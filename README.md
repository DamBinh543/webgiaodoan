Cách chạy dự án:
- Mở Git Bash để clone dự án về máy: git clone https://github.com/DamBinh543/webgiaodoan.git
- Mở dự án đã clone, mở terminal chạy: composer install
- Chạy: php artisan key:generate
- Tạo database webgiaodoan1 trên MySQl
- Sửa cấu hình env, thay tên database thành webgiaodoan1
- Mở Terminal chạy lệnh php artisan migrate --seed
- Chạy php artisan serve
