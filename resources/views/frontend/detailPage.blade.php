<!-- resources/views/frontend/detailPage.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Binhfood</title>
  <link href='./assets/img/Binhfood.png' rel='icon' type='image/x-icon' />
  <link rel="stylesheet" href="/assets/css/home-responsive.css">
  <link rel="stylesheet" href="/assets/css/toast-message.css">
  <link rel="stylesheet" href="/assets/font/font-awesome-pro-v6-6.2.0/css/all.min.css" />
  <link rel="stylesheet" href="/assets/css/product-detail.css">
</head>
<body>
  

  <div class="wrapper">
    <div class="product-container">
      <div class="product-image">
        <img id="product-img" src="" alt="Ảnh sản phẩm">
      </div>
      <div class="product-details">
        <div id="product-title" class="product-title">Tên Sản Phẩm</div>
        <div id="product-description" class="product-description">
        </div>
        <div class="quantity-control">
          <label for="quantity">Số lượng:</label>
          <input type="number" id="quantity" name="quantity" min="1" value="1">
        </div>
        <button id="add-cart" class="add-to-cart">Thêm vào giỏ hàng</button>
      </div>
    </div>

    <div class="review-section">
  <div class="stars">★★★★☆ (4.0 / 5 sao)</div>
  <div class="comment-box">
    <textarea rows="4" placeholder="Viết bình luận của bạn tại đây..."></textarea>
    <button>Gửi bình luận</button>
  </div>
</div>

<div id="comments-list">

</div>
  
  <div id="toast"></div>
  <script>
    const productId = "{{ $productId }}";
  </script>
  <script src="/js/detail.js"></script>
</body>
</html>
