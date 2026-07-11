let teachers = [];
let timetable = {};
let leaveHistory = [];
let editIndex = -1;
const periods = ["1st Period","2nd Period","3rd Period","4th Period","5th Period","6th Period","7th Period","8th Period"];

document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  loadPeriodDropdown();
});

// TAB SWITCH
function showTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btn.classList.add('active');
  if(tabId === 'leave') { loadTeacherDropdown(); loadPeriodDropdown(); }
  if(tabId === 'manage') loadTeacherList();
  if(tabId === 'substitute') loadHistory();
}

// PERIOD DROPDOWN
function loadPeriodDropdown() {
  let sel = document.getElementById('leavePeriod');
  if(!sel) return;
  sel.innerHTML = "";
  periods.forEach(p => sel.innerHTML += `<option>${p}</option>`);
}

// SAMPLE DATA - 8 Periods
function loadSampleData() {
  teachers = [
    {name: "Muhammad Ijaz", phone: "923414844580"},
    {name: "فاطمہ", phone: "923001111"},
    {name: "علی", phone: "923002222"},
    {name: "عائشہ", phone: "923003333"},
    {name: "سارا", phone: "923004444"},
    {name: "خالد", phone: "923005555"},
    {name: "مریم", phone: "923006666"},
    {name: "حسن", phone: "923007777"},
    {name: "زینب", phone: "923008888"}
  ];

  timetable = {};
  teachers.forEach(t => {
    timetable[t.name] = {};
    periods.forEach(p => {
      timetable[t.name][p] = Math.random() > 0.4? "Subject" : "FREE";
    });
  });
  saveData();
  renderTimetable();
  alert("✅ 9 Teachers + 8 Periods Load ہو گئے");
}

function saveData() {
  localStorage.setItem('teachers', JSON.stringify(teachers));
  localStorage.setItem('timetable', JSON.stringify(timetable));
}

function loadData() {
  let data = localStorage.getItem('timetable');
  let teach = localStorage.getItem('teachers');
  if(data) timetable = JSON.parse(data);
  if(teach) teachers = JSON.parse(teach);
}

// RENDER TIMETABLE
function renderTimetable() {
  loadData();
  if(teachers.length === 0) {
    document.getElementById('timetableGrid').innerHTML = "<p>پہلے 'Sample Load کریں' یا 'اساتذہ Add کریں'</p>";
    return;
  }
  let html = "<table><tr><th>Teacher</th>";
  periods.forEach(p => html += `<th>${p}</th>`);
  html += "</tr>";
  teachers.forEach(t => {
    html += `<tr><td><b>${t.name}</b></td>`;
    periods.forEach(p => {
      let cls = timetable[t.name][p] === "FREE"? "free" : "busy";
      html += `<td class="${cls}">${timetable[t.name][p] || 'FREE'}</td>`;
    });
    html += "</tr>";
  });
  html += "</table>";
  document.getElementById('timetableGrid').innerHTML = html;
}

// MANAGE TEACHERS - ADD/EDIT/DELETE
document.getElementById('teacherForm').addEventListener('submit', function(e){
  e.preventDefault();
  let name = document.getElementById('teacherName').value.trim();
  let phone = document.getElementById('teacherPhone').value.trim();
  loadData();

  if(editIndex >= 0) {
    teachers[editIndex] = {name, phone};
    editIndex = -1;
    this.querySelector('button').innerText = "➕ ٹیچر Add کریں";
  } else {
    teachers.push({name, phone});
    timetable[name] = {};
    periods.forEach(p => timetable[name][p] = "FREE");
  }
  saveData();
  renderTimetable();
  loadTeacherList();
  this.reset();
});

function loadTeacherList() {
  loadData();
  let html = "";
  teachers.forEach((t, i) => {
    html += `<div class="teacher-item">
      <span><b>${t.name}</b> - ${t.phone}</span>
      <span>
        <button class="btn-edit" onclick="editTeacher(${i})">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteTeacher(${i})">🗑️ Delete</button>
      </span>
    </div>`;
  });
  document.getElementById('teacherList').innerHTML = html || "<p>کوئی ٹیچر نہیں</p>";
}

function editTeacher(i) {
  document.getElementById('teacherName').value = teachers[i].name;
  document.getElementById('teacherPhone').value = teachers[i].phone;
  editIndex = i;
  document.getElementById('teacherForm').querySelector('button').innerText = "💾 Update کریں";
  showTab('manage', document.querySelectorAll('.tab-btn')[1]);
}

function deleteTeacher(i) {
  if(confirm("کیا آپ اس ٹیچر کو Delete کرنا چاہتے ہیں؟")) {
    let name = teachers[i].name;
    delete timetable[name];
    teachers.splice(i,1);
    saveData();
    renderTimetable();
    loadTeacherList();
  }
}

// DROPDOWN
function loadTeacherDropdown() {
  loadData();
  let sel = document.getElementById('leaveTeacher');
  sel.innerHTML = "<option value=''>-- ٹیچر سلیکٹ کریں --</option>";
  teachers.forEach(t => sel.innerHTML += `<option>${t.name}</option>`);
}

// LEAVE SUBMIT
document.getElementById('leaveForm').addEventListener('submit', function(e){
  e.preventDefault();
  let teacher = document.getElementById('leaveTeacher').value;
  let date = document.getElementById('leaveDate').value;
  let period = document.getElementById('leavePeriod').value;
  let reason = document.getElementById('leaveReason').value;
  loadData();

  let freeTeachers = teachers.filter(t => t.name!== teacher && timetable[t.name][period] === "FREE");
  let substitute = freeTeachers.length > 0? freeTeachers[0] : null;

  let record = {date, absent: teacher, period, substitute: substitute? substitute.name : "کوئی نہیں", reason};
  leaveHistory.push(record);
  localStorage.setItem('leaveHistory', JSON.stringify(leaveHistory));

  let html = `<div class="substitute-box"><h3>✅ متبادل لگ گیا</h3>`;
  html += `<p><b>غیر حاضر:</b> ${teacher}</p><p><b>تاریخ:</b> ${date} | <b>Period:</b> ${period}</p>`;
  if(substitute){
    let message = `السلام علیکم ${substitute.name}\nمتبادل ڈیوٹی\nغیر حاضر: ${teacher}\nتاریخ: ${date}\nPeriod: ${period}`;
    let whatsappURL = `https://wa.me/${substitute.phone}?text=${encodeURIComponent(message)}`;
    html += `<p><b>متبادل ٹیچر:</b> ${substitute.name}</p><a href="${whatsappURL}" target="_blank" class="whatsapp-btn">📱 ${substitute.name} کو WhatsApp کریں</a>`;
  } else {
    html += `<p style="color:red;"><b>متبادل ٹیچر:</b> کوئی فری ٹیچر نہیں ملا</p>`;
  }
  html += `</div>`;
  document.getElementById('substituteResult').innerHTML = html;
  this.reset();
  loadHistory();
});

// HISTORY
function loadHistory() {
  leaveHistory = JSON.parse(localStorage.getItem('leaveHistory')) || [];
  let html = "";
  if(leaveHistory.length === 0) html = "<p>ابھی کوئی ریکارڈ نہیں</p>";
  else leaveHistory.reverse().forEach(r => {
    html += `<p>📅 <b>${r.date}</b> - ${r.absent} کی جگہ <b style="color:#2563eb">${r.substitute}</b> - ${r.period}</p>`;
  });
  document.getElementById('historyList').innerHTML = html;
}

// EXPORT & SHARE
function exportData() {
  let data = {teachers, timetable, leaveHistory};
  let blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = "backup.json";
  a.click();
}

function shareData() {
  let data = JSON.stringify({teachers, timetable});
  navigator.clipboard.writeText(data).then(() => {
    alert("📋 Data Copy ہو گیا! اب WhatsApp پر Paste کر دیں");
  });
}

// PWA
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js');
}
