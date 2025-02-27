const Pagination = ({ totalPages, currentPage, onPageChange }) => {
    const generatePageNumbers = () => {
      const pages = [];
      const maxPagesToShow = 5; // Số lượng trang hiển thị xung quanh trang hiện tại
  
      if (totalPages <= 7) {
        // Nếu tổng trang nhỏ, hiển thị tất cả
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
  
      // Luôn hiển thị trang đầu tiên
      pages.push(1);
  
      if (currentPage > 4) {
        pages.push("...");
      }
  
      // Hiển thị các trang gần currentPage
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
  
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
  
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
  
      // Luôn hiển thị trang cuối cùng
      pages.push(totalPages);
  
      return pages;
    };
  
    const pages = generatePageNumbers();
  
    return (
      <div className="flex items-center gap-2 justify-center mt-4">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="px-3 py-2 border rounded disabled:opacity-50"
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
  
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-3 py-2">
              ...
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 border rounded ${
                currentPage === page ? "bg-black text-white" : ""
              }`}
            >
              {page}
            </button>
          )
        )}
  
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="px-3 py-2 border rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
      </div>
    );
  };
  
  export default Pagination;
  