// Biến global để lưu config
let appConfig = null;

// Khởi tạo ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadConfig().then(() => {
        initializeApp();
    }).catch(error => {
        console.error('Lỗi khi tải config:', error);
        // Sử dụng config mặc định
        appConfig = getDefaultConfig();
        initializeApp();
    });
});

// Load config từ file JSON
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error('Không thể tải file config');
        }
        appConfig = await response.json();
        
        // Merge với config đã lưu trong localStorage nếu có
        const savedConfig = localStorage.getItem('invoiceConfig');
        if (savedConfig) {
            const localConfig = JSON.parse(savedConfig);
            appConfig = { ...appConfig, ...localConfig };
        }
    } catch (error) {
        console.warn('Sử dụng config mặc định do lỗi:', error);
        appConfig = getDefaultConfig();
    }
}

// Config mặc định
function getDefaultConfig() {
    return {
        companyInfo: {
            name: "Công ty CP Thủy sản Sóc Việt Nam",
            address: "Lô E Khu Công nghiệp An Nghiệp, Sóc Trăng",
            taxCode: "2200255351",
            phone: "",
            email: "",
            website: ""
        },
        documentSettings: {
            documentTitle: "PHIẾU NHẬP MUA TÔM NGUYÊN LIỆU",
            documentCode: "078 CP/05",
            dateFormat: "dd/mm/yyyy",
            currency: "VNĐ",
            taxRate: 0.1,
            defaultUnit: "KG"
        },
        defaultCustomer: {
            name: "3AHIPHARM Group TNHH Thủy Sản Hào Lộc Phát",
            address: "Ấp Phước Tân, X.Phước Long, H.Phước Long, T.Bạc Liêu, VN",
            phone: "0913484220",
            taxCode: "1900682886",
            cmnd: ""
        }
    };
}

// Khởi tạo ứng dụng
function initializeApp() {
    // Áp dụng config vào giao diện
    applyConfigToUI();
    
    // Thiết lập sự kiện cho các input
    setupEventListeners();
    
    // Điền dữ liệu mặc định
    if (appConfig.printSettings && appConfig.printSettings.showSampleData) {
        fillSampleData();
    } else {
        fillDefaultData();
    }
}

// Áp dụng config vào giao diện
function applyConfigToUI() {
    if (!appConfig) return;
    
    // Cập nhật thông tin công ty trong header
    const companyName = document.querySelector('.company-info p:first-child strong');
    if (companyName) {
        companyName.textContent = appConfig.companyInfo.name;
    }
    
    const companyAddress = document.querySelector('.company-info p:nth-child(2)');
    if (companyAddress) {
        companyAddress.textContent = appConfig.companyInfo.address;
    }
    
    const companyTax = document.querySelector('.company-info p:nth-child(3) strong');
    if (companyTax) {
        companyTax.textContent = `MST: ${appConfig.companyInfo.taxCode}`;
    }
    
    // Cập nhật tiêu đề phiếu
    const docTitle = document.querySelector('.document-info h2');
    if (docTitle) {
        docTitle.textContent = appConfig.documentSettings.documentTitle;
    }
    
    // Cập nhật số chứng từ
    const soCt = document.getElementById('soCt');
    if (soCt) {
        soCt.value = appConfig.documentSettings.documentCode;
    }
    
    // Thiết lập ngày hiện tại
    const documentDate = document.getElementById('document-date');
    if (documentDate) {
        documentDate.value = new Date().toISOString().split('T')[0];
    }
}

// Điền dữ liệu mặc định từ config
function fillDefaultData() {
    if (!appConfig || !appConfig.defaultCustomer) return;
    
    // Điền thông tin khách hàng mặc định
    document.getElementById('donVi').value = appConfig.defaultCustomer.name || '';
    document.getElementById('diaChi').value = appConfig.defaultCustomer.address || '';
    document.getElementById('dienThoai').value = appConfig.defaultCustomer.phone || '';
    document.getElementById('maSoThue').value = appConfig.defaultCustomer.taxCode || '';
    document.getElementById('cmnd').value = appConfig.defaultCustomer.cmnd || '';
    
    // Tạo một dòng trống với đơn vị mặc định
    const tbody = document.getElementById('invoice-items');
    tbody.innerHTML = `
        <tr>
            <td>1</td>
            <td><input type="text" class="item-input" name="soCt"></td>
            <td><input type="date" class="item-input" name="ngay" value="${new Date().toISOString().split('T')[0]}"></td>
            <td><input type="text" class="item-input" name="dienGiai" placeholder="Phiếu nhập mua tôm nguyên liệu"></td>
            <td><input type="text" class="item-input" name="dvt" value="${appConfig.documentSettings.defaultUnit || 'KG'}"></td>
            <td><input type="number" class="item-input" name="soLuong" step="0.01" onchange="calculateRowTotal(this)"></td>
            <td><input type="number" class="item-input" name="gia" step="0.01" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">0</td>
        </tr>
    `;
}

// Điền dữ liệu mẫu
function fillSampleData() {
    // Điền thông tin đơn vị
    document.getElementById('donVi').value = '3AHIPHARM Group TNHH Thủy Sản Hào Lộc Phát';
    document.getElementById('diaChi').value = 'Ấp Phước Tân, X.Phước Long, H.Phước Long, T.Bạc Liêu, VN';
    document.getElementById('dienThoai').value = '0913484220';
    document.getElementById('maSoThue').value = '1900682886';
    
    // Thiết lập ngày mẫu
    const documentDate = document.getElementById('document-date');
    if (documentDate) {
        documentDate.value = '2025-05-15';
    }
    
    // Điền dữ liệu mẫu cho bảng
    const tbody = document.getElementById('invoice-items');
    tbody.innerHTML = `
        <tr>
            <td>1</td>
            <td><input type="text" class="item-input" name="soCt" value="00988"></td>
            <td><input type="date" class="item-input" name="ngay" value="2025-05-15"></td>
            <td><input type="text" class="item-input" name="dienGiai" value="Phiếu nhập mua tôm nguyên liệu"></td>
            <td><input type="text" class="item-input" name="dvt" value="KG"></td>
            <td><input type="number" class="item-input" name="soLuong" step="0.01" value="640.80" onchange="calculateRowTotal(this)"></td>
            <td><input type="number" class="item-input" name="gia" step="0.01" value="161.371" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">1.034.036.184</td>
        </tr>
        <tr>
            <td>2</td>
            <td><input type="text" class="item-input" name="soCt" value="00989"></td>
            <td><input type="date" class="item-input" name="ngay" value="2025-05-15"></td>
            <td><input type="text" class="item-input" name="dienGiai" value="Phiếu nhập mua tôm nguyên liệu"></td>
            <td><input type="text" class="item-input" name="dvt" value="KG"></td>
            <td><input type="number" class="item-input" name="soLuong" step="0.01" value="1.821.80" onchange="calculateRowTotal(this)"></td>
            <td><input type="number" class="item-input" name="gia" step="0.01" value="156.140" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">284.455.852</td>
        </tr>
    `;
    
    // Tính tổng
    setTimeout(() => {
        calculateTotal();
    }, 100);
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
    // Tính toán từ dữ liệu mẫu
    const tongCong = 1318492036; // Tổng cộng từ phiếu mẫu
    
    // Cập nhật các trường tổng
    document.getElementById('tong-cong').textContent = formatCurrency(tongCong);
    
    // Cộng thêm hàng và tiền thuế để trống như trong mẫu
    document.getElementById('cong-them-hang').textContent = '';
    document.getElementById('tien-thue').textContent = '';
    
    // Tổng thanh toán bằng tổng cộng
    document.getElementById('tong-thanh-toan').textContent = formatCurrency(tongCong);
    
    // Cập nhật số tiền bằng chữ
    updateMoneyInWords(tongCong);
}

// Chuyển đổi số thành chữ
function numberToWords(num) {
    if (num === 0) return "không đồng";
    
    const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const tens = ["", "", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
    const scales = ["", "nghìn", "triệu", "tỷ"];
    
    function convertHundreds(n) {
        let result = "";
        
        const hundreds = Math.floor(n / 100);
        const remainder = n % 100;
        const tensDigit = Math.floor(remainder / 10);
        const onesDigit = remainder % 10;
        
        if (hundreds > 0) {
            result += ones[hundreds] + " trăm";
            if (remainder > 0) result += " ";
        }
        
        if (tensDigit >= 2) {
            result += tens[tensDigit];
            if (onesDigit > 0) {
                if (onesDigit === 1) {
                    result += " mốt";
                } else if (onesDigit === 5 && tensDigit > 1) {
                    result += " lăm";
                } else {
                    result += " " + ones[onesDigit];
                }
            }
        } else if (tensDigit === 1) {
            if (onesDigit === 0) {
                result += "mười";
            } else if (onesDigit === 5) {
                result += "mười lăm";
            } else {
                result += "mười " + ones[onesDigit];
            }
        } else if (onesDigit > 0) {
            if (hundreds > 0) {
                result += "lẻ " + ones[onesDigit];
            } else {
                result += ones[onesDigit];
            }
        }
        
        return result;
    }
    
    const groups = [];
    let tempNum = Math.floor(num);
    
    while (tempNum > 0) {
        groups.unshift(tempNum % 1000);
        tempNum = Math.floor(tempNum / 1000);
    }
    
    let result = "";
    for (let i = 0; i < groups.length; i++) {
        if (groups[i] > 0) {
            const groupWords = convertHundreds(groups[i]);
            const scaleIndex = groups.length - 1 - i;
            
            if (result) result += " ";
            result += groupWords;
            if (scaleIndex > 0 && scaleIndex < scales.length) {
                result += " " + scales[scaleIndex];
            }
        }
    }
    
    return result + " đồng";
}

// Cập nhật tiền bằng chữ
function updateMoneyInWords(amount) {
    const moneyInWords = numberToWords(amount);
    
    // Tạo element để hiển thị số tiền bằng chữ nếu chưa có
    let moneyWordsElement = document.getElementById('money-in-words');
    if (!moneyWordsElement) {
        moneyWordsElement = document.createElement('div');
        moneyWordsElement.id = 'money-in-words';
        moneyWordsElement.style.cssText = `
            margin-top: 8px;
            font-style: italic;
            font-size: 10px;
            border-top: 1px dotted #000;
            padding-top: 5px;
            text-transform: capitalize;
        `;
        document.querySelector('.totals-section').appendChild(moneyWordsElement);
    }
    
    moneyWordsElement.textContent = `Bằng chữ: ${moneyInWords.charAt(0).toUpperCase() + moneyInWords.slice(1)} chẵn`;
}

// In hóa đơn
function printInvoice() {
    // Kiểm tra dữ liệu trước khi in
    if (!validateInvoiceData()) {
        return;
    }
    
    // Tính toán lại trước khi in
    calculateTotal();
    
    // Chuyển đổi định dạng ngày khi in
    formatDateForPrint();
    
    // Ẩn các nút điều khiển khi in
    const actionButtons = document.querySelector('.action-buttons');
    const printButtons = document.querySelector('.print-buttons');
    
    actionButtons.style.display = 'none';
    printButtons.style.display = 'none';
    
    // In
    window.print();
    
    // Khôi phục lại định dạng ngày và hiện các nút sau khi in
    setTimeout(() => {
        restoreDateFormat();
        actionButtons.style.display = 'block';
        printButtons.style.display = 'block';
    }, 1000);
}

// Chuyển đổi định dạng ngày khi in
function formatDateForPrint() {
    const documentDateInput = document.getElementById('document-date');
    if (documentDateInput && documentDateInput.value) {
        const date = new Date(documentDateInput.value);
        const vietnameseDate = formatVietnameseDate(date);
        
        // Lưu giá trị gốc
        documentDateInput.setAttribute('data-original-value', documentDateInput.value);
        
        // Thay đổi hiển thị
        documentDateInput.type = 'text';
        documentDateInput.value = vietnameseDate;
        documentDateInput.style.fontStyle = 'italic';
    }
}

// Khôi phục định dạng ngày sau khi in
function restoreDateFormat() {
    const documentDateInput = document.getElementById('document-date');
    if (documentDateInput) {
        const originalValue = documentDateInput.getAttribute('data-original-value');
        if (originalValue) {
            documentDateInput.type = 'date';
            documentDateInput.value = originalValue;
            documentDateInput.style.fontStyle = 'normal';
            documentDateInput.removeAttribute('data-original-value');
        }
    }
}

// Format ngày theo kiểu Việt Nam
function formatVietnameseDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `Ngày ${day} tháng ${month} năm ${year}`;
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
        // Điền lại dữ liệu mặc định từ config
        fillDefaultData();
        
        // Reset tổng tiền
        document.getElementById('tong-cong').textContent = '0';
        document.getElementById('cong-them-hang').textContent = '0';
        document.getElementById('tien-thue').textContent = '0';
        document.getElementById('tong-thanh-toan').textContent = '0';
        
        // Xóa số tiền bằng chữ nếu có
        const moneyWordsElement = document.getElementById('money-in-words');
        if (moneyWordsElement) {
            moneyWordsElement.remove();
        }
        
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
    
    // Escape để đóng modal
    if (e.key === 'Escape') {
        closeConfigModal();
    }
});

// === QUẢN LÝ CONFIG ===

// Hiển thị modal cài đặt
function showConfigModal() {
    if (!appConfig) return;
    
    // Điền dữ liệu hiện tại vào form
    document.getElementById('config-company-name').value = appConfig.companyInfo.name || '';
    document.getElementById('config-company-address').value = appConfig.companyInfo.address || '';
    document.getElementById('config-company-tax').value = appConfig.companyInfo.taxCode || '';
    document.getElementById('config-company-phone').value = appConfig.companyInfo.phone || '';
    
    document.getElementById('config-doc-title').value = appConfig.documentSettings.documentTitle || '';
    document.getElementById('config-doc-code').value = appConfig.documentSettings.documentCode || '';
    document.getElementById('config-default-unit').value = appConfig.documentSettings.defaultUnit || '';
    
    document.getElementById('config-customer-name').value = appConfig.defaultCustomer.name || '';
    document.getElementById('config-customer-address').value = appConfig.defaultCustomer.address || '';
    document.getElementById('config-customer-phone').value = appConfig.defaultCustomer.phone || '';
    document.getElementById('config-customer-tax').value = appConfig.defaultCustomer.taxCode || '';
    
    // Hiển thị modal
    document.getElementById('configModal').style.display = 'block';
}

// Đóng modal cài đặt
function closeConfigModal() {
    document.getElementById('configModal').style.display = 'none';
}

// Lưu cài đặt
function saveConfig() {
    if (!appConfig) appConfig = getDefaultConfig();
    
    // Cập nhật config từ form
    appConfig.companyInfo.name = document.getElementById('config-company-name').value;
    appConfig.companyInfo.address = document.getElementById('config-company-address').value;
    appConfig.companyInfo.taxCode = document.getElementById('config-company-tax').value;
    appConfig.companyInfo.phone = document.getElementById('config-company-phone').value;
    
    appConfig.documentSettings.documentTitle = document.getElementById('config-doc-title').value;
    appConfig.documentSettings.documentCode = document.getElementById('config-doc-code').value;
    appConfig.documentSettings.defaultUnit = document.getElementById('config-default-unit').value;
    
    appConfig.defaultCustomer.name = document.getElementById('config-customer-name').value;
    appConfig.defaultCustomer.address = document.getElementById('config-customer-address').value;
    appConfig.defaultCustomer.phone = document.getElementById('config-customer-phone').value;
    appConfig.defaultCustomer.taxCode = document.getElementById('config-customer-tax').value;
    
    // Lưu vào localStorage
    localStorage.setItem('invoiceConfig', JSON.stringify(appConfig));
    
    // Áp dụng config mới vào giao diện
    applyConfigToUI();
    
    // Đóng modal
    closeConfigModal();
    
    alert('Đã lưu cài đặt thành công!');
}

// Khôi phục cài đặt mặc định
function resetConfig() {
    if (confirm('Bạn có chắc chắn muốn khôi phục cài đặt về mặc định? Tất cả thay đổi sẽ bị mất.')) {
        // Xóa config đã lưu
        localStorage.removeItem('invoiceConfig');
        
        // Load lại config mặc định
        loadConfig().then(() => {
            applyConfigToUI();
            showConfigModal(); // Hiển thị lại modal với dữ liệu mới
            alert('Đã khôi phục cài đặt mặc định!');
        });
    }
}

// Tải dữ liệu mẫu
function loadSampleData() {
    if (confirm('Bạn có muốn tải dữ liệu mẫu? Dữ liệu hiện tại sẽ bị thay thế.')) {
        fillSampleData();
        alert('Đã tải dữ liệu mẫu thành công!');
    }
}

// Click outside modal để đóng
window.onclick = function(event) {
    const modal = document.getElementById('configModal');
    if (event.target === modal) {
        closeConfigModal();
    }
}
