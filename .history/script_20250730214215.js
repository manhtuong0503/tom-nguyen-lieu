// Khởi tạo ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Khởi tạo ứng dụng
function initializeApp() {
    setCurrentDate();
    generateInvoiceNumber();
    
    // Thiết lập sự kiện cho các input
    setupEventListeners();
}

// Thiết lập ngày hiện tại
function setCurrentDate() {
    const today = new Date();
    const dateString = formatDate(today);
    document.getElementById('current-date').textContent = dateString;
    
    // Thiết lập ngày cho input date đầu tiên
    const firstDateInput = document.querySelector('input[name="ngay"]');
    if (firstDateInput) {
        firstDateInput.value = today.toISOString().split('T')[0];
    }
}

// Định dạng ngày theo kiểu Việt Nam
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Tạo số chứng từ tự động
function generateInvoiceNumber() {
    const today = new Date();
    const year = today.getFullYear().toString().substr(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const invoiceNumber = `${year}${month}${day}${random}`;
    document.getElementById('soCt').value = invoiceNumber;
}

// Thiết lập các sự kiện
function setupEventListeners() {
    // Tự động tính toán khi thay đổi số lượng hoặc giá
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-input') && 
            (e.target.name === 'soLuong' || e.target.name === 'gia')) {
            calculateRowTotal(e.target);
        }
    });
    
    // Enter để thêm dòng mới
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('item-input')) {
            e.preventDefault();
            addRow();
        }
    });
}

// Tính toán tổng tiền cho một dòng
function calculateRowTotal(input) {
    const row = input.closest('tr');
    const soLuongInput = row.querySelector('input[name="soLuong"]');
    const giaInput = row.querySelector('input[name="gia"]');
    const thanhTienCell = row.querySelector('.thanh-tien');
    
    const soLuong = parseFloat(soLuongInput.value) || 0;
    const gia = parseFloat(giaInput.value) || 0;
    const thanhTien = soLuong * gia;
    
    thanhTienCell.textContent = formatCurrency(thanhTien);
    
    // Tự động tính tổng sau khi cập nhật dòng
    setTimeout(calculateTotal, 100);
}

// Định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

// Thêm dòng mới
function addRow() {
    const tbody = document.getElementById('invoice-items');
    const currentRows = tbody.querySelectorAll('tr').length;
    const newRowNumber = currentRows + 1;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${newRowNumber}</td>
        <td><input type="text" class="item-input" name="soCt"></td>
        <td><input type="date" class="item-input" name="ngay" value="${new Date().toISOString().split('T')[0]}"></td>
        <td><input type="text" class="item-input" name="dienGiai" placeholder="Phiếu nhập mua tôm nguyên liệu"></td>
        <td><input type="text" class="item-input" name="dvt" placeholder="KG"></td>
        <td><input type="number" class="item-input" name="soLuong" step="0.01" onchange="calculateRowTotal(this)"></td>
        <td><input type="number" class="item-input" name="gia" step="0.01" onchange="calculateRowTotal(this)"></td>
        <td class="thanh-tien">0</td>
    `;
    
    tbody.appendChild(newRow);
    
    // Focus vào input đầu tiên của dòng mới
    const firstInput = newRow.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

// Xóa dòng cuối
function removeRow() {
    const tbody = document.getElementById('invoice-items');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length > 1) {
        tbody.removeChild(rows[rows.length - 1]);
        calculateTotal();
    } else {
        alert('Không thể xóa dòng cuối cùng!');
    }
}

// Tính tổng toàn bộ hóa đơn
function calculateTotal() {
    const thanhTienCells = document.querySelectorAll('.thanh-tien');
    let tongCong = 0;
    
    thanhTienCells.forEach(cell => {
        const value = parseFloat(cell.textContent.replace(/[,\.]/g, '')) || 0;
        tongCong += value;
    });
    
    // Cập nhật các trường tổng
    document.getElementById('tong-cong').textContent = formatCurrency(tongCong);
    
    // Tính thuế VAT (10%)
    const tienThue = tongCong * 0.1;
    document.getElementById('tien-thue').textContent = formatCurrency(tienThue);
    
    // Cộng thêm hàng (có thể để trống hoặc nhập thủ công)
    const congThemHang = 0; // Có thể thêm input để nhập
    document.getElementById('cong-them-hang').textContent = formatCurrency(congThemHang);
    
    // Tổng thanh toán
    const tongThanhToan = tongCong + tienThue + congThemHang;
    document.getElementById('tong-thanh-toan').textContent = formatCurrency(tongThanhToan);
}

// In hóa đơn
function printInvoice() {
    // Kiểm tra dữ liệu trước khi in
    if (!validateInvoiceData()) {
        return;
    }
    
    // Tính toán lại trước khi in
    calculateTotal();
    
    // Ẩn các nút điều khiển khi in
    const actionButtons = document.querySelector('.action-buttons');
    const printButtons = document.querySelector('.print-buttons');
    
    actionButtons.style.display = 'none';
    printButtons.style.display = 'none';
    
    // In
    window.print();
    
    // Hiện lại các nút sau khi in
    setTimeout(() => {
        actionButtons.style.display = 'block';
        printButtons.style.display = 'block';
    }, 1000);
}

// Kiểm tra dữ liệu hóa đơn
function validateInvoiceData() {
    const donVi = document.getElementById('donVi').value.trim();
    const diaChi = document.getElementById('diaChi').value.trim();
    
    if (!donVi) {
        alert('Vui lòng nhập đơn vị!');
        document.getElementById('donVi').focus();
        return false;
    }
    
    if (!diaChi) {
        alert('Vui lòng nhập địa chỉ!');
        document.getElementById('diaChi').focus();
        return false;
    }
    
    // Kiểm tra ít nhất một dòng có dữ liệu
    const rows = document.querySelectorAll('#invoice-items tr');
    let hasData = false;
    
    rows.forEach(row => {
        const soLuong = row.querySelector('input[name="soLuong"]');
        const gia = row.querySelector('input[name="gia"]');
        
        if (soLuong && gia && soLuong.value && gia.value) {
            hasData = true;
        }
    });
    
    if (!hasData) {
        alert('Vui lòng nhập ít nhất một mặt hàng với số lượng và giá!');
        return false;
    }
    
    return true;
}

// Làm mới form
function clearForm() {
    if (confirm('Bạn có chắc chắn muốn làm mới toàn bộ form? Dữ liệu hiện tại sẽ bị mất.')) {
        // Xóa các input thông tin chung
        document.getElementById('donVi').value = '';
        document.getElementById('diaChi').value = '';
        document.getElementById('dienThoai').value = '';
        document.getElementById('maSoThue').value = '';
        
        // Xóa tất cả dòng trừ dòng đầu tiên
        const tbody = document.getElementById('invoice-items');
        tbody.innerHTML = `
            <tr>
                <td>1</td>
                <td><input type="text" class="item-input" name="soCt"></td>
                <td><input type="date" class="item-input" name="ngay" value="${new Date().toISOString().split('T')[0]}"></td>
                <td><input type="text" class="item-input" name="dienGiai" placeholder="Phiếu nhập mua tôm nguyên liệu"></td>
                <td><input type="text" class="item-input" name="dvt" placeholder="KG"></td>
                <td><input type="number" class="item-input" name="soLuong" step="0.01" onchange="calculateRowTotal(this)"></td>
                <td><input type="number" class="item-input" name="gia" step="0.01" onchange="calculateRowTotal(this)"></td>
                <td class="thanh-tien">0</td>
            </tr>
        `;
        
        // Reset tổng tiền
        document.getElementById('tong-cong').textContent = '0';
        document.getElementById('cong-them-hang').textContent = '0';
        document.getElementById('tien-thue').textContent = '0';
        document.getElementById('tong-thanh-toan').textContent = '0';
        
        // Tạo số chứng từ mới
        generateInvoiceNumber();
        
        // Focus vào đơn vị
        document.getElementById('donVi').focus();
    }
}

// Xuất dữ liệu ra JSON (để lưu trữ)
function exportToJSON() {
    const data = {
        thongTinChung: {
            donVi: document.getElementById('donVi').value,
            diaChi: document.getElementById('diaChi').value,
            dienThoai: document.getElementById('dienThoai').value,
            maSoThue: document.getElementById('maSoThue').value,
            soCt: document.getElementById('soCt').value,
            cmnd: document.getElementById('cmnd').value,
            ngayTao: new Date().toISOString()
        },
        danhSachHang: [],
        tongKet: {
            tongCong: document.getElementById('tong-cong').textContent,
            congThemHang: document.getElementById('cong-them-hang').textContent,
            tienThue: document.getElementById('tien-thue').textContent,
            tongThanhToan: document.getElementById('tong-thanh-toan').textContent
        }
    };
    
    // Lấy dữ liệu từ bảng
    const rows = document.querySelectorAll('#invoice-items tr');
    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length > 0) {
            const rowData = {
                stt: index + 1,
                soCt: inputs[0].value,
                ngay: inputs[1].value,
                dienGiai: inputs[2].value,
                dvt: inputs[3].value,
                soLuong: parseFloat(inputs[4].value) || 0,
                gia: parseFloat(inputs[5].value) || 0,
                thanhTien: row.querySelector('.thanh-tien').textContent
            };
            
            if (rowData.soLuong > 0 || rowData.gia > 0) {
                data.danhSachHang.push(rowData);
            }
        }
    });
    
    return data;
}

// Tải dữ liệu từ JSON
function loadFromJSON(jsonData) {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    // Điền thông tin chung
    document.getElementById('donVi').value = data.thongTinChung.donVi || '';
    document.getElementById('diaChi').value = data.thongTinChung.diaChi || '';
    document.getElementById('dienThoai').value = data.thongTinChung.dienThoai || '';
    document.getElementById('maSoThue').value = data.thongTinChung.maSoThue || '';
    document.getElementById('soCt').value = data.thongTinChung.soCt || '';
    document.getElementById('cmnd').value = data.thongTinChung.cmnd || '';
    
    // Xóa bảng hiện tại
    const tbody = document.getElementById('invoice-items');
    tbody.innerHTML = '';
    
    // Điền dữ liệu hàng hóa
    data.danhSachHang.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" class="item-input" name="soCt" value="${item.soCt}"></td>
            <td><input type="date" class="item-input" name="ngay" value="${item.ngay}"></td>
            <td><input type="text" class="item-input" name="dienGiai" value="${item.dienGiai}"></td>
            <td><input type="text" class="item-input" name="dvt" value="${item.dvt}"></td>
            <td><input type="number" class="item-input" name="soLuong" step="0.01" value="${item.soLuong}" onchange="calculateRowTotal(this)"></td>
            <td><input type="number" class="item-input" name="gia" step="0.01" value="${item.gia}" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">${item.thanhTien}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Cập nhật tổng kết
    calculateTotal();
}

// Lưu dữ liệu vào Local Storage
function saveToLocalStorage() {
    const data = exportToJSON();
    const key = `invoice_${data.thongTinChung.soCt}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(data));
    alert(`Đã lưu hóa đơn với mã: ${key}`);
}

// Tải dữ liệu từ Local Storage
function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    if (data) {
        loadFromJSON(data);
        alert('Đã tải dữ liệu thành công!');
    } else {
        alert('Không tìm thấy dữ liệu!');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + P để in
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printInvoice();
    }
    
    // Ctrl + S để lưu
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveToLocalStorage();
    }
    
    // Ctrl + N để tạo mới
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        clearForm();
    }
});
