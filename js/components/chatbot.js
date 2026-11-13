/**
 * AI SMARTATTEND ĐỒNG NAI - CHATBOT COMPONENT (REMOVED)
 * Nút nổi "Hỏi AI SmartAttend" và widget chatbot đã được loại bỏ hoàn toàn theo yêu cầu.
 * Giữ lại export rỗng an toàn để bảo đảm tương thích hệ thống.
 */
(function () {
  function renderChatbot() {
    // Dọn dẹp triệt để nếu còn tồn tại phần tử chatbot trong DOM
    const root = document.getElementById('chatbot-root');
    if (root) {
      root.innerHTML = '';
      root.remove();
    }
  }

  window.SA = window.SA || { Views: {} };
  window.SA.Chatbot = { renderChatbot };
})();
