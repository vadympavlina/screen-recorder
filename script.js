let mediaRecorder;
let chunks = [];
let finalBlob;
let timerInterval;
let seconds = 0;

// екрани
const instructionScreen = document.getElementById("instructionScreen");
const recordScreen = document.getElementById("recordScreen");
const previewScreen = document.getElementById("previewScreen");

// кнопки
const okBtn = document.getElementById("okBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const saveBtn = document.getElementById("saveBtn");

// Floating
const floatingControls = document.getElementById("floatingControls");
const timerLabel = document.getElementById("timer");

// відео і статус
const preview = document.getElementById("preview");
const status = document.getElementById("status");

// Модальне вікно
const saveModal = document.getElementById("saveModal");
const fileNameInput = document.getElementById("fileNameInput");
const confirmSaveBtn = document.getElementById("confirmSaveBtn");

// --------------------
// Init UI
// --------------------
floatingControls.style.display = "none";
stopBtn.style.display = "none";

// --------------------
// Helpers
// --------------------
function formatTime(sec){
  const m = String(Math.floor(sec/60)).padStart(2,'0');
  const s = String(sec%60).padStart(2,'0');
  return `${m}:${s}`;
}

function showScreen(screen){
  instructionScreen.classList.add("hidden");
  recordScreen.classList.add("hidden");
  previewScreen.classList.add("hidden");
  floatingControls.style.display = "none";
  screen.classList.remove("hidden");
}

// --------------------
// Інструкція → Запис
// --------------------
okBtn.onclick = ()=> showScreen(recordScreen);

// --------------------
// RECORDING
// --------------------
startBtn.onclick = async ()=>{
  try{
    status.textContent = "Йде запуск...";
    startBtn.disabled = true;

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video:true,
      audio:true
    });

    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = e=>{
      if(e.data.size>0) chunks.push(e.data);
    }

    mediaRecorder.onstop = ()=>{
      finalBlob = new Blob(chunks,{type:'video/webm'});
      const url = URL.createObjectURL(finalBlob);
      preview.src = url;
      showScreen(previewScreen);
      startBtn.textContent = "Перезаписати";
      startBtn.disabled = false;
    }

    mediaRecorder.start();

    // UI
    floatingControls.style.display = "flex";
    stopBtn.style.display = "inline-block";
    startBtn.classList.add("hidden");

    // Таймер
    seconds = 0;
    timerLabel.textContent = formatTime(0);
    timerInterval = setInterval(()=>{
      seconds++;
      timerLabel.textContent = formatTime(seconds);
    },1000);

  }catch(err){
    alert("Доступ до екрану відхилено");
    startBtn.disabled = false;
    status.textContent = "Готовий до запису";
  }
}

// Stop через floating controls
stopBtn.onclick = ()=>{
  mediaRecorder.stop();
  clearInterval(timerInterval);
  floatingControls.style.display = "none";
}

// Замість prompt()
saveBtn.onclick = ()=>{
  fileNameInput.value = "my-video";  // дефолтне значення
  saveModal.classList.remove("hidden"); // показуємо overlay з модалкою
};

// Коли натискаємо Зберегти у модальному
confirmSaveBtn.onclick = ()=>{
  const name = fileNameInput.value.trim() || "my-video";

  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name+".webm";
  a.click();

  saveModal.classList.add("hidden"); // ховаємо модалку

  // Повертаємось на екран запису
  showScreen(recordScreen);
  startBtn.classList.remove("hidden");
  startBtn.textContent = "Start";
  status.textContent = "Готовий до запису";
};