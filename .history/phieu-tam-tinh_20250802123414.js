// Biến global
let currentLotNumber = 1;

// Khởi tạo ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Khởi tạo ứng dụng
function initializeApp() {
    setupEventListeners();
    calculateAllTotals();
}

// Thiết lập các sự kiện
function setupEventListeners() {
    // Tự động tính toán khi thay đổi giá trị
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-input')) {
            setTimeout(() => {
                calculateRowTotal(e.target);
                calculateLotTotal(e.target);
                calculateAllTotals();
            }, 100);
        }
    });
    
    // Enter để focus đến ô tiếp theo
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('item-input')) {
            e.preventDefault();
            focusNextInput(e.target);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printInvoice();
        }
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            clearForm();
        }
    });
}

// Focus đến input tiếp theo
function focusNextInput(currentInput) {
    const inputs = Array.from(document.querySelectorAll('.item-input'));
    const currentIndex = inputs.indexOf(currentInput);
    if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
    }
}

// Tính toán thành tiền cho một dòng
function calculateRowTotal(input) {
    const row = input.closest('tr');
    if (!row || row.classList.contains('total-row') || row.classList.contains('phidn-row') || row.classList.contains('thanhtien-row')) {
        return;
    }
    
    const weightInput = row.querySelector('input[name="weight"]');
    const priceInput = row.querySelector('input[name="price"]');
    const thanhTienCell = row.querySelector('.thanh-tien');
    
    if (weightInput && priceInput && thanhTienCell) {
        const weight = parseFloat(weightInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = weight * price;
        
        thanhTienCell.textContent = formatNumber(total);
    }
}

// Tính tổng cho một lô
function calculateLotTotal(input) {
    const row = input.closest('tr');
    const lotRows = getLotRows(row);
    
    if (lotRows.length === 0) return;
    
    let totalPercent = 0;
    let totalWeight = 0;
    let totalAmount = 0;
    
    // Tính tổng cho các dòng thường (không phải total-row)
    lotRows.forEach(lotRow => {
        if (!lotRow.classList.contains('total-row') && 
            !lotRow.classList.contains('phidn-row') && 
            !lotRow.classList.contains('thanhtien-row')) {
            
            const percentInput = lotRow.querySelector('input[name="percent"]');
            const weightInput = lotRow.querySelector('input[name="weight"]');
            const thanhTienCell = lotRow.querySelector('.thanh-tien');
            
            if (percentInput) totalPercent += parseFloat(percentInput.value) || 0;
            if (weightInput) totalWeight += parseFloat(weightInput.value) || 0;
            if (thanhTienCell) {
                const amount = parseFloat(thanhTienCell.textContent.replace(/[,\.]/g, '')) || 0;
                totalAmount += amount;
            }
        }
    });
    
    // Cập nhật dòng tổng cộng
    const totalRow = lotRows.find(r => r.classList.contains('total-row'));
    if (totalRow) {
        const totalPercentCell = totalRow.querySelector('.total-percent');
        const totalWeightCell = totalRow.querySelector('.total-weight');
        const totalAmountCell = totalRow.querySelector('td[style*="background-color: #ffeb3b"]');
        
        if (totalPercentCell) totalPercentCell.textContent = formatNumber(totalPercent, 2);
        if (totalWeightCell) totalWeightCell.textContent = formatNumber(totalWeight, 2);
        if (totalAmountCell) totalAmountCell.innerHTML = `<strong>${formatNumber(totalAmount)}</strong>`;
    }
    
    // Cập nhật dòng thành tiền
    const thanhTienRow = lotRows.find(r => r.classList.contains('thanhtien-row'));
    if (thanhTienRow) {
        const thanhTienCell = thanhTienRow.querySelector('td[style*="background-color: #ffeb3b"]');
        if (thanhTienCell) {
            thanhTienCell.innerHTML = `<strong>${formatNumber(totalAmount)}</strong>`;
        }
    }
}

// Lấy tất cả các dòng của một lô
function getLotRows(currentRow) {
    const tbody = currentRow.closest('tbody');
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const currentIndex = allRows.indexOf(currentRow);
    
    // Tìm dòng đầu tiên của lô hiện tại
    let startIndex = currentIndex;
    while (startIndex > 0 && !allRows[startIndex].querySelector('.lot-number')) {
        startIndex--;
    }
    
    // Tìm dòng cuối cùng của lô hiện tại
    let endIndex = currentIndex;
    while (endIndex < allRows.length - 1 && 
           !allRows[endIndex + 1].querySelector('.lot-number')) {
        endIndex++;
    }
    
    return allRows.slice(startIndex, endIndex + 1);
}

// Tính tổng toàn bộ
function calculateAllTotals() {
    const tbody = document.getElementById('invoice-items');
    const thanhTienRows = tbody.querySelectorAll('.thanhtien-row');
    
    let totalQuantity = 0;
    let totalAmount = 0;
    
    thanhTienRows.forEach(row => {
        // Lấy các dòng của lô này
        const lotRows = getLotRows(row);
        const totalRow = lotRows.find(r => r.classList.contains('total-row'));
        
        if (totalRow) {
            const weightCell = totalRow.querySelector('.total-weight');
            const amountCell = totalRow.querySelector('td[style*="background-color: #ffeb3b"]');
            
            if (weightCell) {
                const weight = parseFloat(weightCell.textContent.replace(/[,\.]/g, '')) || 0;
                totalQuantity += weight;
            }
            
            if (amountCell) {
                const amount = parseFloat(amountCell.textContent.replace(/[,\.<strong>\/]/g, '')) || 0;
                totalAmount += amount;
            }
        }
    });
    
    // Cập nhật tổng cộng
    document.getElementById('total-quantity').textContent = formatNumber(totalQuantity, 2);
    document.getElementById('total-amount').textContent = formatNumber(totalAmount);
    
    // Tính dư (tổng - khấu trừ)
    const deduction = parseFloat(document.getElementById('total-deduction').textContent.replace(/[,\.]/g, '')) || 0;
    const finalTotal = totalAmount - deduction;
    document.getElementById('final-total').textContent = formatNumber(finalTotal);
}

// Format số
function formatNumber(num, decimals = 0) {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

// Thêm lô mới
function addLot() {
    currentLotNumber++;
    const tbody = document.getElementById('invoice-items');
    
    const lotHTML = `
        <tr class="lot-row">
            <td rowspan="6" class="lot-number">${currentLotNumber}</td>
            <td rowspan="6" class="company-name">FM</td>
            <td rowspan="6" class="product-type">GST</td>
            <td><input type="text" class="item-input" name="size" placeholder="Size"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" placeholder="%"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" placeholder="KL"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" placeholder="Giá" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">0</td>
        </tr>
        <tr>
            <td><input type="text" class="item-input" name="size" placeholder="Size"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" placeholder="%"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" placeholder="KL"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" placeholder="Giá" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">0</td>
        </tr>
        <tr>
            <td><input type="text" class="item-input" name="size" placeholder="Size"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" placeholder="%"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" placeholder="KL"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" placeholder="Giá" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">0</td>
        </tr>
        <tr>
            <td><input type="text" class="item-input" name="size" placeholder="Size"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" placeholder="%"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" placeholder="KL"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" placeholder="Giá" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">0</td>
        </tr>
        <tr>
            <td><input type="text" class="item-input" name="size" placeholder="Size"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" placeholder="%"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" placeholder="KL"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" placeholder="Giá" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">0</td>
        </tr>
        <tr class="total-row">
            <td colspan="3"><strong>TỔNG CỘNG</strong></td>
            <td class="total-percent">0.00</td>
            <td class="total-weight">0.00</td>
            <td colspan="1" style="background-color: #ffeb3b;"><strong>0</strong></td>
        </tr>
        <tr class="phidn-row">
            <td colspan="6" style="text-align: center; color: red;"><strong>(-) PHÍ DN</strong></td>
            <td colspan="2" style="background-color: #ffeb3b;">0</td>
        </tr>
        <tr class="thanhtien-row">
            <td colspan="6" style="text-align: center; color: red;"><strong>THÀNH TIỀN</strong></td>
            <td colspan="2" style="background-color: #ffeb3b;"><strong>0</strong></td>
        </tr>
    `;
    
    tbody.insertAdjacentHTML('beforeend', lotHTML);
    
    // Focus vào input đầu tiên của lô mới
    const newRows = tbody.querySelectorAll(`tr:nth-last-child(-n+8)`);
    const firstInput = newRows[0].querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

// Thêm dòng vào lô hiện tại
function addRowToCurrentLot() {
    // Tìm lô cuối cùng
    const tbody = document.getElementById('invoice-items');
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const lastThanhTienRow = allRows.reverse().find(row => row.classList.contains('thanhtien-row'));
    
    if (!lastThanhTienRow) {
        alert('Không tìm thấy lô để thêm dòng!');
        return;
    }
    
    // Tạo dòng mới
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" class="item-input" name="size" placeholder="Size"></td>
        <td><input type="number" class="item-input" name="percent" step="0.01" placeholder="%"></td>
        <td><input type="number" class="item-input" name="weight" step="0.01" placeholder="KL"></td>
        <td><input type="number" class="item-input" name="price" step="0.01" placeholder="Giá" onchange="calculateRowTotal(this)"></td>
        <td class="thanh-tien">0</td>
    `;
    
    // Chèn trước dòng tổng cộng
    const totalRow = getLotRows(lastThanhTienRow).find(r => r.classList.contains('total-row'));
    if (totalRow) {
        tbody.insertBefore(newRow, totalRow);
        
        // Cập nhật rowspan
        const lotRows = getLotRows(newRow);
        const firstRow = lotRows[0];
        const lotNumberCell = firstRow.querySelector('.lot-number');
        const companyNameCell = firstRow.querySelector('.company-name');
        const productTypeCell = firstRow.querySelector('.product-type');
        
        if (lotNumberCell) lotNumberCell.rowSpan = lotRows.filter(r => !r.classList.contains('total-row') && !r.classList.contains('phidn-row') && !r.classList.contains('thanhtien-row')).length;
        if (companyNameCell) companyNameCell.rowSpan = lotRows.filter(r => !r.classList.contains('total-row') && !r.classList.contains('phidn-row') && !r.classList.contains('thanhtien-row')).length;
        if (productTypeCell) productTypeCell.rowSpan = lotRows.filter(r => !r.classList.contains('total-row') && !r.classList.contains('phidn-row') && !r.classList.contains('thanhtien-row')).length;
        
        // Focus vào input đầu tiên
        const firstInput = newRow.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

// Xóa dòng cuối
function removeLastRow() {
    const tbody = document.getElementById('invoice-items');
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    
    // Tìm dòng cuối cùng không phải là dòng tổng
    for (let i = allRows.length - 1; i >= 0; i--) {
        const row = allRows[i];
        if (!row.classList.contains('total-row') && 
            !row.classList.contains('phidn-row') && 
            !row.classList.contains('thanhtien-row') &&
            !row.querySelector('.lot-number')) {
            
            row.remove();
            calculateAllTotals();
            return;
        }
    }
    
    alert('Không thể xóa dòng này!');
}

// In phiếu
function printInvoice() {
    calculateAllTotals();
    
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

// Làm mới form
function clearForm() {
    if (confirm('Bạn có chắc chắn muốn làm mới toàn bộ form? Dữ liệu hiện tại sẽ bị mất.')) {
        // Reset các input header
        document.getElementById('khach-hang').value = '';
        document.getElementById('bang').value = '';
        document.getElementById('document-date').value = new Date().toISOString().split('T')[0];
        
        // Reset bảng về trạng thái ban đầu
        currentLotNumber = 1;
        loadSampleData();
    }
}

// Tải dữ liệu mẫu
function loadSampleData() {
    // Reset bảng
    const tbody = document.getElementById('invoice-items');
    tbody.innerHTML = `
        <tr class="lot-row">
            <td rowspan="6" class="lot-number">1</td>
            <td rowspan="6" class="company-name">FM</td>
            <td rowspan="6" class="product-type">GST</td>
            <td><input type="text" class="item-input" name="size" value="27C"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" value="93.54"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" value="3114.66"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" value="165.00" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">513.918</td>
        </tr>
        <tr>
            <td><input type="text" class="item-input" name="size" value="TRUNG"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" value="5.60"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" value="186.47"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" value="148.50" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">27.690</td>
        </tr>
        <tr>
            <td><input type="text" class="item-input" name="size" value="BM"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" value="0.45"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" value="14.98"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" value="115.50" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">1.731</td>
        </tr>
        <tr>
            <td><input type="text" class="item-input" name="size" value="B"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" value="0.24"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" value="7.99"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" value="35.00" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">280</td>
        </tr>
        <tr>
            <td><input type="text" class="item-input" name="size" value="B"></td>
            <td><input type="number" class="item-input" name="percent" step="0.01" value="0.17"></td>
            <td><input type="number" class="item-input" name="weight" step="0.01" value="5.66"></td>
            <td><input type="number" class="item-input" name="price" step="0.01" value="10.00" onchange="calculateRowTotal(this)"></td>
            <td class="thanh-tien">57</td>
        </tr>
        <tr class="total-row">
            <td colspan="3"><strong>TỔNG CỘNG</strong></td>
            <td class="total-percent">100.00</td>
            <td class="total-weight">3.329.76</td>
            <td colspan="1" style="background-color: #ffeb3b;"><strong>543.676</strong></td>
        </tr>
        <tr class="phidn-row">
            <td colspan="6" style="text-align: center; color: red;"><strong>(-) PHÍ DN</strong></td>
            <td colspan="2" style="background-color: #ffeb3b;">0</td>
        </tr>
        <tr class="thanhtien-row">
            <td colspan="6" style="text-align: center; color: red;"><strong>THÀNH TIỀN</strong></td>
            <td colspan="2" style="background-color: #ffeb3b;"><strong>543.676</strong></td>
        </tr>
    `;
    
    currentLotNumber = 1;
    calculateAllTotals();
}

// Chuyển đến phiếu nhập chính
function goToMainInvoice() {
    window.location.href = 'index.html';
}
