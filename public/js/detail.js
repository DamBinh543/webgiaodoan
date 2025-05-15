document.addEventListener("DOMContentLoaded", async () => {

  try {
    const response = await fetch(`http://localhost:8000/api/products/${productId}`);
    if (!response.ok) throw new Error(response.statusText);
    const product = await response.json();

    // Sửa đường dẫn ảnh nếu cần
    const imagePath = product.img.replace(/^\.\//, "");

    // Cập nhật thông tin sản phẩm nếu các phần tử DOM tồn tại
    const imgElem = document.getElementById("product-img");
    if (imgElem) {
      imgElem.src = `/${imagePath}`;
      imgElem.alt = product.title;
    }

    const titleElem = document.getElementById("product-title");
    if (titleElem) titleElem.innerText = product.title;

    const descElem = document.getElementById("product-description");
    if (descElem) descElem.innerText = product.desc;

    // Gán sự kiện cho nút "Thêm vào giỏ hàng"
    const addCartBtn = document.getElementById("add-cart");
    if (addCartBtn) {
      addCartBtn.addEventListener("click", () => {
        const quantityInput = document.getElementById("quantity");
        const quantity = parseInt(quantityInput ? quantityInput.value : "1") || 1;
        if (localStorage.getItem("currentuser")) {
          // Hàm addCart được giả định đã có trong ứng dụng của bạn
          addCart(product.product_id, quantity, "");
        } else {
          toast({
            title: "Cảnh báo",
            message: "Bạn chưa đăng nhập!",
            type: "warning",
            duration: 3000,
          });
        }
      });
    }
  } catch (error) {
    console.error("Lỗi khi load chi tiết sản phẩm:", error);
  }

  // --- Phần bình luận và đánh giá ---
  const reviewSection = document.querySelector(".review-section");
  if (reviewSection) {
    const commentTextarea = reviewSection.querySelector("textarea");
    const submitButton = reviewSection.querySelector("button");
    const starsDiv = reviewSection.querySelector(".stars");
    const commentsContainer = document.getElementById("comments-list");


    const currentUser = JSON.parse(localStorage.getItem("currentuser"));

    function getRatingFromStars(text) {
      const match = text.match(/\((\d+(\.\d+)?)\s*\/\s*5\s*sao\)/i);
      return match ? parseFloat(match[1]) : 0;
    }

    if (submitButton) {
      submitButton.addEventListener("click", (e) => {
        e.preventDefault();
        const content = commentTextarea.value.trim();
        if (content === "") {
          alert("Vui lòng nhập bình luận trước khi gửi");
          return;
        }
        const commentId = "com_" + Date.now();
        const rate = getRatingFromStars(starsDiv.innerText);
        const commentData = {
          comment_id: commentId,
          account_id: currentUser.account_id, 
          product_id: productId,
          content: content,
          rate: rate,
        };

        fetch("http://localhost:8000/api/comments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(commentData),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((err) => {
                throw new Error(err.message || "Lỗi khi gửi bình luận");
              });
            }
            return response.json();
          })
          .then((data) => {
            const commentElement = document.createElement("div");
            commentElement.classList.add("comment-item");

            const ratingElement = document.createElement("div");
            ratingElement.classList.add("rating");
            ratingElement.innerText = "Đánh giá: " + rate + "/5";

            const contentElement = document.createElement("div");
            contentElement.classList.add("content");
            contentElement.innerHTML = `<strong>${currentUser.username}</strong>: ${data.content}`;

            commentElement.appendChild(ratingElement);
            commentElement.appendChild(contentElement);

            if (commentsContainer) {
              commentsContainer.appendChild(commentElement);
            }

            commentTextarea.value = "";
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Có lỗi xảy ra khi gửi bình luận.");
          });
      });
    }
  }
});
