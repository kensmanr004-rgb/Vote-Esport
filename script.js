window.onload = function() {
    const now = new Date().getTime();
    
    // 1. เช็คว่าเคยโหวตไปหรือยัง (ดึงข้อมูลจากความจำเครื่อง)
    const hasVoted = localStorage.getItem("hasVotedEsports");
    
    // 2. เช็คเวลาปิดโหวต (จากโค้ดเดิม)
    const deadline = new Date("2026-06-01T11:59:59").getTime();

    if (hasVoted === "true") {
        // ถ้าเคยโหวตแล้ว ให้ล็อกหน้าเว็บทันที
        document.getElementById("gameForm").innerHTML = `
            <div class="text-center py-10">
                <h2 class="text-4xl font-bold text-amber-500 mb-4">⚠️ คุณได้ลงคะแนนโหวตไปแล้ว ⚠️</h2>
                <p class="text-gray-600 text-lg">ระบบจำกัดให้โหวตได้เพียง 1 ครั้งต่อเครื่องเท่านั้นครับ</p>
            </div>
        `;
    } else if (now > deadline) {
        // ถ้าหมดเวลาโหวต (โค้ดเดิม)
        document.getElementById("gameForm").innerHTML = `
            <div class="text-center py-10">
                <h2 class="text-4xl font-bold text-red-500 mb-4">❌ ปิดรับโหวตแล้ว ❌</h2>
                <p class="text-gray-600 text-lg">ขอบคุณทุกคนที่ร่วมสนุกเสนอชื่อเกมครับ!</p>
            </div>
        `;
    }
};

// 💡 ตอนที่ส่งข้อมูลสำเร็จ (ในฟังก์ชันที่ใช้ส่ง Fetch/Axios ของคุณ)
// อย่าลืมสั่งให้ระบบบันทึกความจำไว้ด้วย โดยเพิ่มบรรทัดนี้ลงไปหลังจากส่งข้อมูลสำเร็จ:
// localStorage.setItem("hasVotedEsports", "true");
// ------------------------------
// =========================================================
// 🔴 นำ URL ของ Google Apps Script มาใส่ในบรรทัดด้านล่างนี้ 🔴
// =========================================================
// ⚠️ สำคัญมาก: นำ URL ของ Web App ที่ได้จากการ Deploy ใน Google Apps Script มาใส่ตรงนี้
const scriptURL = 'https://script.google.com/macros/s/AKfycbyY7WJIbQrHwiK0o-Ms33bKY2A4MkUpLiab_R8aVNaSC6o0IQfB9cUoXfivRx3Lc9oV/exec'; 

const form = document.getElementById('gameForm');

// เมื่อผู้ใช้งานกดปุ่ม "ส่งคำตอบ" ในฟอร์มหลัก
form.addEventListener('submit', e => {
    e.preventDefault(); // บล็อกไม่ให้หน้าเว็บรีโหลด
    openFormatModal();  // เปิดหน้าต่าง Modal ตัวแรกขึ้นมาถามข้อมูลเพิ่ม
});

function openFormatModal() {
    const modal = document.getElementById('formatModal');
    const content = document.getElementById('formatModalContent');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => content.classList.remove('scale-95'), 10);
}

function closeFormatModal() {
    const modal = document.getElementById('formatModal');
    const content = document.getElementById('formatModalContent');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 150);
}

// ฟังก์ชันรวบรวมข้อมูลและส่งไปยัง Google Sheets ด้านหลังบ้าน
function submitAllData() {
    const confirmBtn = document.getElementById('confirmBtn');
    const originalText = confirmBtn.innerHTML;
    
    // เปลี่ยนสถานะปุ่มเพื่อป้องกันคนกดซ้ำระหว่างส่งข้อมูล
    confirmBtn.innerHTML = '<span>กำลังตรวจสอบข้อมูล... ⏳</span>';
    confirmBtn.disabled = true;

    // มัดรวมข้อมูลจากฟอร์มทั้งหมดอัตโนมัติด้วย FormData
    const formData = new FormData(form);
    
    // ดึงข้อมูลแนวทางการจัดแข่งจากช่องข้อความใน Modal มาแพ็ครวมเข้าไปด้วย
    const formatSuggestion = document.getElementById('formatSuggestion').value;
    formData.append('format', formatSuggestion);

    // ยิงข้อมูลตรงไปยัง Google Apps Script
    fetch(scriptURL, { method: 'POST', body: formData })
        .then(response => response.text())
        .then(result => {
            closeFormatModal(); // ปิดหน้าต่างเลือกรูปแบบการแข่งออกไปก่อน
            
            if (result === 'Success') {
                // เคสที่ 1: ลงคะแนนสำเร็จ
                openSuccessModal();
                form.reset(); // ล้างข้อมูลในฟอร์มให้ว่างเปล่า
                document.getElementById('formatSuggestion').value = '';
            } else if (result === 'Already Voted') {
                // เคสที่ 2: ตรวจสอบพบรหัสนักเรียนซ้ำในระบบ
                alert('⚠️ รหัสนักเรียนนี้เคยลงคะแนนโหวตไปแล้ว ไม่สามารถโหวตซ้ำได้ครับ!');
            } else if (result === 'Voting Closed') {
                // เคสที่ 3: ระบบปิดรับโหวตเนื่องจากเลยกำหนดเวลา
                alert('❌ ขออภัย ปิดรับคะแนนโหวตกิจกรรมนี้เรียบร้อยแล้วครับ');
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึก: ' + result);
            }
        })
        .catch(error => {
            console.error('Error!', error.message);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ กรุณาลองใหม่อีกครั้ง');
        })
        .finally(() => {
            // คืนค่าปุ่มยืนยันให้กลับมาคลิกใหม่ได้ตามปกติ
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
        });
}

function openSuccessModal() {
    const modal = document.getElementById('successModal');
    const content = document.getElementById('successModalContent');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => content.classList.remove('scale-95'), 10);
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    const content = document.getElementById('successModalContent');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 150);
}
