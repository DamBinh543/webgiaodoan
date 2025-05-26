
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Favicon -->
  <link href="/assets/img/Binhfood.png" rel="icon" type="image/png" />
  <title>Binhfood</title>
  <link rel="stylesheet" href="/assets/css/home-responsive.css">
  <link rel="stylesheet" href="/assets/css/toast-message.css">
  <link rel="stylesheet" href="/assets/font/font-awesome-pro-v6-6.2.0/css/all.min.css" />
  <link rel="stylesheet" href="/assets/css/product-detail.css">
  <style>
    .site-header {
      display: flex;
      align-items: center;
      padding: 1rem;
      background: #fff;
      border-bottom: 1px solid #eaeaea;
    }
    .site-header .logo {
      height: 40px;
      margin-right: 0.5rem;
    }
    .site-header h1 {
      font-size: 1.5rem;
      margin: 0;
    }
    .stars i {
      font-size: 1.5rem;
      cursor: pointer;
      margin-right: 0.25rem;
    }
    .stars i.selected {
      color: #ffc107;
    }
  </style>
</head>
<body>

  <div class="wrapper">
    <div class="product-container">
      <div class="product-image">
        <img id="product-img" src="" alt="Ảnh sản phẩm">
      </div>
      <div class="product-details">
        <div id="product-title" class="product-title">Tên Sản Phẩm</div>
        <div id="product-description" class="product-description"></div>
        <div class="quantity-control">
          <label for="quantity">Số lượng:</label>
          <input type="number" id="quantity" name="quantity" min="1" value="1">
        </div>
        <button id="add-cart" class="add-to-cart">Thêm vào giỏ hàng</button>
      </div>
    </div>

    <div class="review-section">
      <div class="stars" id="star-rating">
        <i class="far fa-star" data-value="1"></i>
        <i class="far fa-star" data-value="2"></i>
        <i class="far fa-star" data-value="3"></i>
        <i class="far fa-star" data-value="4"></i>
        <i class="far fa-star" data-value="5"></i>
      </div>
      <div class="comment-box">
        <textarea rows="4" placeholder="Viết bình luận của bạn tại đây..."></textarea>
        <button>Gửi bình luận</button>
      </div>
    </div>

    <div id="comments-list"></div>
  </div>

  <div id="toast"></div>

  <script>
    const productId = "{{ $productId }}";
  </script>
  <script src="/js/detail.js"></script>
</body>
</html>
