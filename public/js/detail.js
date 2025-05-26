document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/products/${productId}`);
    if (!response.ok) throw new Error(response.statusText);
    const product = await response.json();
    const imagePath = product.img.replace(/^\.\//, "");
    document.getElementById("product-img").src = `/${imagePath}`;
    document.getElementById("product-img").alt = product.title;
    document.getElementById("product-title").innerText = product.title;
    document.getElementById("product-description").innerText = product.desc;
    document.getElementById("add-cart").addEventListener("click", () => {
      const qty = parseInt(document.getElementById("quantity").value) || 1;
      if (localStorage.getItem("currentuser")) {
        addCart(product.product_id, qty, "");
      } else {
        toast({ title: "Cảnh báo", message: "Bạn chưa đăng nhập!", type: "warning", duration: 3000 });
      }
    });
  } catch (error) {
    console.error("Lỗi khi load chi tiết sản phẩm:", error);
  }

  const reviewSection = document.querySelector(".review-section");
  if (!reviewSection) return;

  const starElems = reviewSection.querySelectorAll("#star-rating i");
  const commentTextarea = reviewSection.querySelector("textarea");
  const submitButton = reviewSection.querySelector("button");
  const commentsContainer = document.getElementById("comments-list");
  const currentUser = JSON.parse(localStorage.getItem("currentuser") || "null");

  if (!currentUser) {
    reviewSection.innerHTML = "<p>Vui lòng <a href='/login'>đăng nhập</a> để đánh giá và bình luận.</p>";
    return;
  }

  let selectedRating = 0;
  starElems.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = +star.dataset.value;
      starElems.forEach(s => {
        const v = +s.dataset.value;
        if (v <= selectedRating) {
          s.classList.add("selected", "fa-solid");
          s.classList.remove("fa-regular");
        } else {
          s.classList.remove("selected", "fa-solid");
          s.classList.add("fa-regular");
        }
      });
    });
  });
  submitButton.addEventListener("click", async e => {
    e.preventDefault();
    const content = commentTextarea.value.trim();
    if (!content) return alert("Vui lòng nhập bình luận trước khi gửi");
    if (selectedRating === 0) return alert("Vui lòng chọn số sao đánh giá");

    const commentData = {
      comment_id: `com_${Date.now()}`,
      account_id: currentUser.account_id,
      product_id: productId,
      content,
      rate: selectedRating,
    };

    try {
      const res = await fetch("http://localhost:8000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(commentData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi gửi bình luận");
      }
      const data = await res.json();
      const div = document.createElement("div");
      div.className = "comment-item";
      div.innerHTML = `
        <div class="rating">Đánh giá: ${selectedRating}/5 sao</div>
        <div class="content"><strong>${currentUser.username}</strong>: ${data.content}</div>
      `;
      commentsContainer.appendChild(div);
      commentTextarea.value = "";
      selectedRating = 0;
      starElems.forEach(s => {
        s.classList.remove("selected", "fa-solid");
        s.classList.add("fa-regular");
      });
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi gửi bình luận.");
    }
  });
});
