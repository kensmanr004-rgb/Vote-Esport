// =========================================================
// 🔴 นำ URL ของ Google Apps Script มาใส่ในบรรทัดด้านล่างนี้ 🔴
// =========================================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykXDYJJ_aUkawQZhECWrdJSEaPFbjM4SlYB94M-gC5Q3UJRIyQ9GD1RGRdXE2PSZWetw/exec'; 

const form = document.getElementById('gameForm');
const formatModal = document.getElementById('formatModal');
const formatModalContent = document.getElementById('formatModalContent');
const successModal = document.getElementById('successModal');
const successModalContent = document.getElementById('successModalContent');

// ขั้นตอนที่ 1: ตรวจสอบข้อมูลเมื่อกดส่งคำตอบ
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const g1 = document.getElementById('game1').value.trim().toLowerCase();
    const g2 = document.getElementById('game2').value.trim().toLowerCase();
    const g3 = document.getElementById('game3').value.trim().toLowerCase();

    // กรองเอาเฉพาะช่องที่มีการกรอกข้อความ
    const filledGames = [g1, g2, g3].filter(game => game !== '');
    const uniqueGames = new Set(filledGames);

    // เช็คว่ามีเกมซ้ำกันหรือไม่
    if(filledGames.length !== uniqueGames.size) {
        showCustomError("กรุณากรอกชื่อเกมให้ไม่ซ้ำกันนะครับ 😅");
        return;
    }
    
    // ถ้าผ่าน ให้เปิดหน้าต่างถามแนวทางจัดแข่ง
    openFormatModal();
});

// ขั้นตอนที่ 2: กดปุ่มยืนยันเพื่อส่งเข้า Google Sheet
function submitAllData() {
    // --- เพิ่มส่วนนี้: เช็คว่าเคยส่งไปแล้วหรือยัง ---
    if (localStorage.getItem('hasSubmitted')) {
        showCustomError("คุณได้ส่งข้อมูลไปแล้ว ไม่สามารถส่งซ้ำได้ครับ 😅");
        return; 
    }
    // ------------------------------------------

    const confirmBtn = document.getElementById('confirmBtn');
    
    // ... โค้ดเดิมของคุณ ...
    
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    })
    .then(() => {
        // --- เพิ่มส่วนนี้: เมื่อส่งสำเร็จ ให้บันทึกว่าส่งแล้วลงในเครื่องผู้ใช้ ---
        localStorage.setItem('hasSubmitted', 'true');
        // -------------------------------------------------------------
        
        closeFormatModal();
        showSuccessModal();
        form.reset();
        document.getElementById('formatSuggestion').value = '';
    })
    // ... โค้ดที่เหลือของคุณ ...
}
function submitAllData() {
    const confirmBtn = document.getElementById('confirmBtn');

    // ถ้ายังไม่ใส่ลิงก์ Google Sheet ให้แค่โชว์สถานะสำเร็จจำลองไปก่อน
    if(SCRIPT_URL === 'ใส่_URL_ที่ได้จาก_Google_Apps_Script_ที่นี่') {
        closeFormatModal();
        showSuccessModal();
        form.reset();
        document.getElementById('formatSuggestion').value = '';
        return;
    }

    // เปลี่นปุ่มเป็นสถานะโหลด
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="animate-spin text-xl">⏳</span> กำลังบันทึกข้อมูล...';
    confirmBtn.classList.replace('bg-purple-500', 'bg-gray-400');
    confirmBtn.classList.replace('hover:bg-purple-600', 'hover:bg-gray-400');

    // รวมข้อมูลทั้งหมด
    const formData = new FormData();
    formData.append('game1', document.getElementById('game1').value.trim());
    formData.append('game2', document.getElementById('game2').value.trim());
    formData.append('game3', document.getElementById('game3').value.trim());
    formData.append('reason', document.getElementById('reason').value.trim());
    formData.append('format', document.getElementById('formatSuggestion').value.trim());

    // ส่งข้อมูล
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    })
    .then(() => {
        closeFormatModal();
        showSuccessModal();
        form.reset();
        document.getElementById('formatSuggestion').value = '';
    })
    .catch(error => {
        console.error('Error!', error.message);
        showCustomError("เกิดข้อผิดพลาดในการส่งข้อมูล ลองใหม่อีกครั้งนะครับ");
    })
    .finally(() => {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<span>ยืนยันเพื่อส่งข้อมูล ✅</span>';
        confirmBtn.classList.replace('bg-gray-400', 'bg-purple-500');
        confirmBtn.classList.replace('hover:bg-gray-400', 'hover:bg-purple-600');
    });
}

// -----------------------------------------------------
// ฟังก์ชันจัดการเปิด-ปิด Modal และแสดง Error
// -----------------------------------------------------

function openFormatModal() {
    formatModal.classList.remove('hidden');
    formatModal.classList.add('flex');
    setTimeout(() => { formatModalContent.classList.remove('scale-95'); formatModalContent.classList.add('scale-100'); }, 10);
}

function closeFormatModal() {
    formatModalContent.classList.remove('scale-100');
    formatModalContent.classList.add('scale-95');
    setTimeout(() => { formatModal.classList.add('hidden'); formatModal.classList.remove('flex'); }, 200);
}

function showSuccessModal() {
    successModal.classList.remove('hidden');
    successModal.classList.add('flex');
    setTimeout(() => { successModalContent.classList.remove('scale-95'); successModalContent.classList.add('scale-100'); }, 10);
}

function closeSuccessModal() {
    successModalContent.classList.remove('scale-100');
    successModalContent.classList.add('scale-95');
    setTimeout(() => { successModal.classList.add('hidden'); successModal.classList.remove('flex'); }, 200);
}

function showCustomError(msg) {
    const errDiv = document.createElement('div');
    errDiv.className = "fixed top-5 right-5 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 transition-all transform translate-x-full";
    errDiv.innerHTML = `<p class="font-bold">แจ้งเตือน</p><p>${msg}</p>`;
    document.body.appendChild(errDiv);
    
    setTimeout(() => errDiv.classList.remove('translate-x-full'), 10);
    setTimeout(() => { errDiv.classList.add('translate-x-full'); setTimeout(() => errDiv.remove(), 300); }, 3000);
}