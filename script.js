// ⚠️ สำคัญมาก: นำ URL ของ Web App ที่ได้จากการ Deploy ใน Google Apps Script มาใส่ตรงนี้
const scriptURL = 'https://script.google.com/macros/s/AKfycbyY7WJIbQrHwiK0o-Ms33bKY2A4MkUpLiab_R8aVNaSC6o0IQfB9cUoXfivRx3Lc9oV/exec'; 

const form = document.getElementById('gameForm');

// เมื่อผู้ใช้งานกดปุ่ม "ส่งคำตอบ" ในฟอร์มหลัก
form.addEventListener('submit', e => {
    e.preventDefault(); // บล็อกไม่ให้หน้าเว็บรีโหลด
    
    // 1. ดึงค่าชื่อเกมมาตัดช่องว่าง (Trim) และแปลงเป็นตัวพิมพ์เล็กทั้งหมด (toLowerCase) เพื่อป้องกันการกรอกซ้ำแบบเลี่ยงคำ
    const g1 = document.getElementById('game1').value.trim().toLowerCase();
    const g2 = document.getElementById('game2').value.trim().toLowerCase();
    const g3 = document.getElementById('game3').value.trim().toLowerCase();

    // 2. เลือกเก็บเฉพาะช่องที่มีการพิมพ์ข้อความเข้ามาจริงๆ (ช่องที่ปล่อยว่างไว้จะไม่เอามานับ)
    const filledGames = [];
    if (g1) filledGames.push(g1);
    if (g2) filledGames.push(g2);
    if (g3) filledGames.push(g3);

    // 3. ใช้ Set ในการตรวจสอบตัวซ้ำ (Set จะมีคุณสมบัติพิเศษคือเก็บเฉพาะค่าที่ไม่ซ้ำกันเท่านั้น)
    const uniqueGames = new Set(filledGames);

    // 4. เปรียบเทียบจำนวนข้อมูล ถ้าจำนวนข้อมูลที่กรอก ไม่เท่ากับจำนวนใน Set แสดงว่ามีเกมซ้ำ!
    if (filledGames.length !== uniqueGames.size) {
        alert('⚠️ กรุณากรอกชื่อเกมให้ไม่ซ้ำกันในแต่ละช่องนะครับ (ห้ามพิมพ์ชื่อเกมเดิมซ้ำๆ เพื่อปั๊มคะแนนนะน้า 😅)');
        return; // สั่งหยุดทำงานตรงนี้เลย ไม่เปิดหน้าต่างถัดไป และไม่ส่งข้อมูลเข้าระบบ
    }

    // ถ้าตรวจสอบแล้วผ่าน ไม่มีเกมซ้ำกันเลย จึงจะยอมให้เปิดหน้าต่าง Modal ถามแนวทางจัดแข่ง
    openFormatModal();  
});

// ฟังก์ชันเปิด Modal ถามแนวทางการจัดแข่ง
function openFormatModal() {
    const modal = document.getElementById('formatModal');
    const content = document.getElementById('formatModalContent');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => content.classList.remove('scale-95'), 10);
}

// ฟังก์ชันปิด Modal ถามแนวทางการจัดแข่ง
function closeFormatModal() {
    const modal = document.getElementById('formatModal');
    const content = document.getElementById('formatModalContent');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 150);
}

// ฟังก์ชันรวบรวมข้อมูลทั้งหมดและส่งไปยัง Google Sheets หลังบ้าน
function submitAllData() {
    const confirmBtn = document.getElementById('confirmBtn');
    const originalText = confirmBtn.innerHTML;
    
    // เปลี่ยนสถานะปุ่มเพื่อป้องกันคนกดซ้ำรัวๆ ระหว่างส่งข้อมูล
    confirmBtn.innerHTML = '<span>กำลังตรวจสอบข้อมูล... ⏳</span>';
    confirmBtn.disabled = true;

    // มัดรวมข้อมูลจากฟอร์มทั้งหมดอัตโนมัติด้วย FormData (ดึงรหัสนักเรียน และเกม 1, 2, 3 ไปพร้อมกัน)
    const formData = new FormData(form);
    
    // ดึงข้อมูลแนวทางการจัดแข่งจากช่องข้อความใน Modal มาแพ็ครวมเข้าไปเพิ่ม
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
                form.reset(); // ล้างข้อมูลในฟอร์มให้ว่างเปล่าเตรียมรับคนถัดไป
                document.getElementById('formatSuggestion').value = '';
            } else if (result === 'Already Voted') {
                // เคสที่ 2: ตรวจสอบพบรหัสนักเรียนนี้เคยโหวตไปแล้วใน Sheet
                alert('⚠️ เคยลงคะแนนโหวตไปแล้ว ไม่สามารถโหวตซ้ำได้ครับ!');
            } else if (result === 'Voting Closed') {
                // เคสที่ 3: ระบบปิดรับโหวตเนื่องจากเลยวัน-เวลาที่กำหนด (วันพุธ)
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

// ฟังก์ชันเปิด Modal แจ้งเตือนส่งสำเร็จ
function openSuccessModal() {
    const modal = document.getElementById('successModal');
    const content = document.getElementById('successModalContent');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => content.classList.remove('scale-95'), 10);
}

// ฟังก์ชันปิด Modal แจ้งเตือนส่งสำเร็จ
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    const content = document.getElementById('successModalContent');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 150);
}
