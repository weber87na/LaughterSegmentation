document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 🏛️ 1. UI 元件參照
    // ==========================================
    const lobbySection = document.getElementById("lobby-section");
    const uploadSection = document.getElementById("upload-section");
    const loadingSection = document.getElementById("loading-section");
    const workspaceSection = document.getElementById("workspace-section");
    const gamePlaySection = document.getElementById("game-play-section");
    const gameResultSection = document.getElementById("game-result-section");
    
    // 大廳按鈕
    const logoHome = document.getElementById("logo-home");
    const selectEnduranceBtn = document.getElementById("select-endurance-btn");
    const select憋笑Btn = document.getElementById("select-憋笑-btn");
    const selectToolBtn = document.getElementById("select-tool-btn");
    const toolBackBtn = document.getElementById("tool-back-btn");
    
    // 一般上傳模式元件
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const selectBtn = document.getElementById("select-btn");
    const displayFilename = document.getElementById("display-filename");
    const resetBtn = document.getElementById("reset-btn");
    const uploadDefaultUi = document.getElementById("upload-default-ui");
    const uploadRecordingUi = document.getElementById("upload-recording-ui");
    const startRecBtn = document.getElementById("start-rec-btn");
    const stopRecBtn = document.getElementById("stop-rec-btn");
    const cancelRecBtn = document.getElementById("cancel-rec-btn");
    const recTimer = document.getElementById("rec-timer");
    const recMiniLoader = document.getElementById("rec-mini-loader");
    
    // 遊戲進行中元件
    const gameModeTitle = document.getElementById("game-mode-title");
    const gameTimerNum = document.getElementById("game-timer-num");
    const gameMemeBox = document.getElementById("game-meme-box");
    const gameMemeImg = document.getElementById("game-meme-img");
    const gameMemeCaption = document.getElementById("game-meme-caption");
    const gameEnduranceBox = document.getElementById("game-endurance-box");
    const gameHpContainer = document.getElementById("game-hp-container");
    const gameHpFill = document.getElementById("game-hp-fill");
    const gamePowerContainer = document.getElementById("game-power-container");
    const gamePowerFill = document.getElementById("game-power-fill");
    const gameStopBtn = document.getElementById("game-stop-btn");
    const gameCancelBtn = document.getElementById("game-cancel-btn");
    
    // 遊戲結算元件
    const resultModeBadge = document.getElementById("result-mode-badge");
    const resultStatusTitle = document.getElementById("result-status-title");
    const resultBadgeIcon = document.getElementById("result-badge-icon");
    const resultBadgeTitle = document.getElementById("result-badge-title");
    const resultBadgeDesc = document.getElementById("result-badge-desc");
    const statScore = document.getElementById("stat-score");
    const statSeconds = document.getElementById("stat-seconds");
    const statSecondsLbl = document.getElementById("stat-seconds-lbl");
    const resultReplayBtn = document.getElementById("result-replay-btn");
    const resultViewWavesurferBtn = document.getElementById("result-view-wavesurfer-btn");
    const resultLobbyBtn = document.getElementById("result-lobby-btn");
    const donutRainContainer = document.getElementById("donut-rain-container");
    
    // Wavesurfer 控制元件
    const playBtn = document.getElementById("play-btn");
    const stopBtn = document.getElementById("stop-btn");
    const timeDisplay = document.getElementById("time-display");
    const muteBtn = document.getElementById("mute-btn");
    const volumeSlider = document.getElementById("volume-slider");
    const segmentCount = document.getElementById("segment-count");
    const segmentsList = document.getElementById("segments-list");
    
    // ==========================================
    // 📦 2. 全域狀態變數
    // ==========================================
    let wavesurfer = null;
    let wsRegions = null;
    let currentLaughterSegments = [];
    
    // 麥克風錄音變數
    let mediaRecorder = null;
    let audioChunks = [];
    let recInterval = null;
    let recSeconds = 0;
    let isBackgroundAnalysisPending = false;
    let isRecordingActive = false;
    
    // 遊戲專屬變數
    let currentGameMode = ""; // "endurance" 或 "dont_laugh"
    let gameTimerInterval = null;
    let gameTimeRemaining = 15;
    let gameHPLose = false;
    let lastSavedGameData = null; // 用於隨後波形導覽分析
    let currentMemeInterval = null;

    // 辛普森卡通高飽和度配色清單
    const colors = [
        { region: "rgba(255, 105, 180, 0.6)", border: "#000000", badgeBg: "#ff69b4", badgeText: "#ffffff" }, // 甜甜圈粉
        { region: "rgba(76, 175, 80, 0.6)", border: "#000000", badgeBg: "#4caf50", badgeText: "#ffffff" },  // 亮綠
        { region: "rgba(0, 162, 232, 0.6)", border: "#000000", badgeBg: "#00a2e8", badgeText: "#ffffff" },  // 亮藍
        { region: "rgba(255, 152, 0, 0.6)", border: "#000000", badgeBg: "#ff9800", badgeText: "#ffffff" },  // 亮橘
        { region: "rgba(244, 67, 54, 0.6)", border: "#000000", badgeBg: "#f44336", badgeText: "#ffffff" },  // 亮紅
        { region: "rgba(156, 39, 176, 0.6)", border: "#000000", badgeBg: "#9c27b0", badgeText: "#ffffff" }   // 卡通紫
    ];

    // 辛普森憋笑搞笑迷因梗圖庫
    const memes = [
        { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3VpdjBpdXZ4Nm8xbDJnMXR2MnB2a3d0bnI5OGtyYWRiMTk4amZtayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6MbdDgPPdxri6m7S/giphy.gif", caption: "Homer 瘋狂甜甜圈吃法！千萬別笑！" },
        { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Bma2szamNqenY4cmthNjhxZnJwdXoxMWsybmwweXBrd2FhZzJmbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMuV5idipnMxxEf/giphy.gif", caption: "Homer 撞牆：D'oh! 憋住啊！" },
        { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjdpcXB5djA3dTF5dTZkdm9rbTZscWhmdjF0Ymg2dHdvd3oyc3prMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cPfEPdpHmrcnAgVKp2/giphy.gif", caption: "Bart 頑皮的經典嘲諷舞！冷靜！" },
        { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGsyYXB0djAya3k3a3M1MWdtam1uMW1oMXo0azA4dzBrbm90MWsyZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10H1sYo9npxB4s/giphy.gif", caption: "Mr. Burns 邪惡微笑：Excellent..." },
        { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTIwdms4NHB2bHJ6dWxrdGk3ZzBhODlmc2l3OHg0dmdmMGphMW51OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2JdUCgC79UA954H6/giphy.gif", caption: "Homer 的大腦探測雷達逼逼作響..." }
    ];

    // ==========================================
    // 🏢 3. 狀態與視窗切換邏輯
    // ==========================================
    function showSection(sectionToShow) {
        const sections = [lobbySection, uploadSection, loadingSection, workspaceSection, gamePlaySection, gameResultSection];
        sections.forEach(sec => {
            if (sec === sectionToShow) {
                sec.classList.remove("hidden");
            } else {
                sec.classList.add("hidden");
            }
        });
    }

    // 大廳入口切換
    selectToolBtn.addEventListener("click", () => showSection(uploadSection));
    toolBackBtn.addEventListener("click", () => showSection(lobbySection));
    logoHome.addEventListener("click", () => {
        // 如果正在錄音或玩遊戲，取消它
        abortEverything();
        showSection(lobbySection);
    });

    // 放棄錄音或遊戲的重置清空
    function abortEverything() {
        if (recInterval) clearInterval(recInterval);
        if (gameTimerInterval) clearInterval(gameTimerInterval);
        if (currentMemeInterval) clearInterval(currentMemeInterval);
        isRecordingActive = false;
        audioChunks = [];
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
        if (wavesurfer) {
            wavesurfer.destroy();
            wavesurfer = null;
        }
    }

    // ==========================================
    // 🍩 4. 甜甜圈下雨粒子引擎 (Donut Rain)
    // ==========================================
    function triggerDonutRain(intensity = "high") {
        donutRainContainer.innerHTML = "";
        const count = intensity === "high" ? 60 : 25;
        const items = ["🍩", "🍬", "🍭", "🎉", "🔥", "🎨"];
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement("div");
            particle.className = "donut-particle";
            particle.textContent = items[Math.floor(Math.random() * items.length)];
            
            // 隨機屬性
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            particle.style.fontSize = `${Math.random() * 20 + 20}px`;
            
            donutRainContainer.appendChild(particle);
            
            // 3.2 秒後自動清除
            setTimeout(() => {
                particle.remove();
            }, 5500);
        }
    }

    // ==========================================
    // 🎮 5. 遊戲主邏輯實作 (The Game Loop)
    // ==========================================

    // 啟動「大笑持久戰」
    selectEnduranceBtn.addEventListener("click", () => startSimpsonsGame("endurance"));
    // 啟動「憋笑大考驗」
    select憋笑Btn.addEventListener("click", () => startSimpsonsGame("dont_laugh"));

    async function startSimpsonsGame(mode) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("您的瀏覽器不支援麥克風錄音，無法遊玩！請使用 Chrome 或 Edge 瀏覽器。");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 1. 初始化狀態
            currentGameMode = mode;
            gameTimeRemaining = 15;
            gameHPLose = false;
            audioChunks = [];
            isRecordingActive = true;
            lastSavedGameData = null;
            
            // 2. 切換 UI 顯示
            showSection(gamePlaySection);
            gameTimerNum.textContent = gameTimeRemaining;
            
            if (mode === "endurance") {
                gameModeTitle.innerHTML = `<i class="fa-solid fa-face-grin-tears text-pink"></i> 大笑持久戰`;
                gameEnduranceBox.classList.remove("hidden");
                gameMemeBox.classList.add("hidden");
                gameHpContainer.classList.add("hidden");
                gamePowerContainer.classList.remove("hidden");
                gamePowerFill.style.width = "0%";
            } else {
                gameModeTitle.innerHTML = `<i class="fa-solid fa-face-expression-less text-blue"></i> 憋笑大考驗`;
                gameEnduranceBox.classList.add("hidden");
                gameMemeBox.classList.remove("hidden");
                gameHpContainer.classList.remove("hidden");
                gamePowerContainer.classList.add("hidden");
                gameHpFill.style.width = "100%";
                
                // 啟動迷因切換輪播
                changeMeme();
                currentMemeInterval = setInterval(changeMeme, 3500);
            }

            // 3. 配置錄音格式
            let options = { mimeType: "audio/webm" };
            if (!MediaRecorder.isTypeSupported("audio/webm")) {
                options = { mimeType: "audio/ogg" };
            }
            
            mediaRecorder = new MediaRecorder(stream, options);
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
                
                // 如果是背景切片監聽
                if (isBackgroundAnalysisPending) {
                    isBackgroundAnalysisPending = false;
                    performGameBackgroundAnalysis(options.mimeType);
                }
            };
            
            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                isRecordingActive = false;
                if (currentMemeInterval) clearInterval(currentMemeInterval);
                
                // 如果是正常停止，進行最終結算
                if (!gameHPLose && audioChunks.length > 0) {
                    performGameFinalSettlement(options.mimeType);
                }
            };
            
            // 4. 開始錄製
            mediaRecorder.start();
            
            // 5. 啟動遊戲 15 秒計時器
            gameTimerInterval = setInterval(() => {
                gameTimeRemaining--;
                gameTimerNum.textContent = gameTimeRemaining;
                
                // 遊戲每 3秒(憋笑) 或 5秒(持久) 在背景快照分析一次
                const sliceSec = currentGameMode === "dont_laugh" ? 3 : 5;
                if (gameTimeRemaining > 0 && (15 - gameTimeRemaining) % sliceSec === 0) {
                    isBackgroundAnalysisPending = true;
                    mediaRecorder.requestData();
                }
                
                // 倒數結束
                if (gameTimeRemaining <= 0) {
                    clearInterval(gameTimerInterval);
                    if (mediaRecorder && mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                    }
                }
            }, 1000);
            
        } catch (err) {
            alert(`啟動遊戲失敗: ${err.message}\n請確認您的麥克風已連接並允許瀏覽器麥克風權限！`);
            showSection(lobbySection);
        }
    }

    // 迷因梗圖切換輔助
    function changeMeme() {
        const rand = memes[Math.floor(Math.random() * memes.length)];
        gameMemeImg.src = rand.url;
        gameMemeCaption.textContent = rand.caption;
    }

    // 遊戲中：停止按鈕
    gameStopBtn.addEventListener("click", () => {
        if (gameTimerInterval) clearInterval(gameTimerInterval);
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    });

    // 遊戲中：放棄按鈕
    gameCancelBtn.addEventListener("click", () => {
        abortEverything();
        showSection(lobbySection);
    });

    // ==========================================
    // 🧠 6. 遊戲背景分析與 AI 互動 (HP 扣血 & 能量增加)
    // ==========================================
    function performGameBackgroundAnalysis(mimeType) {
        if (audioChunks.length === 0 || !isRecordingActive) return;
        
        const currentBlob = new Blob(audioChunks, { type: mimeType });
        const fileExt = mimeType.includes("webm") ? ".webm" : ".ogg";
        const tempFile = new File([currentBlob], `game_temp${fileExt}`, { type: mimeType });
        
        const formData = new FormData();
        formData.append("file", tempFile);
        
        fetch("/api/detect", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error("偵測失敗");
            return response.json();
        })
        .then(data => {
            if (!data.success || !isRecordingActive) return;
            
            // 存入臨時數據，以供結算使用
            lastSavedGameData = data;
            
            const segments = parseLaughterSegments(data.laughter_segments);
            
            // A. 大笑持久戰 ➔ 更新能量條
            if (currentGameMode === "endurance") {
                let totalLaughterSec = 0;
                segments.forEach(seg => {
                    totalLaughterSec += seg.duration;
                });
                
                const recTimePassed = 15 - gameTimeRemaining;
                const ratio = recTimePassed > 0 ? (totalLaughterSec / recTimePassed) : 0;
                const powerPercent = Math.min(Math.round(ratio * 120), 100); // 放大倍率提高回饋感
                
                gamePowerFill.style.width = `${powerPercent}%`;
                
                // 每次笑聲能量增加時，噴少量甜甜圈
                if (powerPercent > 20) {
                    triggerDonutRain("low");
                }
            } 
            // B. 憋笑大考驗 ➔ 即時扣血判定
            else if (currentGameMode === "dont_laugh") {
                let hasLaughed = false;
                // 只要有大於 0.15 秒的笑聲就被抓到
                segments.forEach(seg => {
                    if (seg.duration >= 0.15) {
                        hasLaughed = true;
                    }
                });
                
                if (hasLaughed) {
                    // 扣光血，宣告失敗！
                    gameHPLose = true;
                    gameHpFill.style.width = "0%";
                    
                    clearInterval(gameTimerInterval);
                    if (currentMemeInterval) clearInterval(currentMemeInterval);
                    
                    if (mediaRecorder && mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                    }
                    
                    // 觸發 Homer 憋笑失敗的「D'oh!」結算畫面
                    triggerBustedSettlement();
                }
            }
        })
        .catch(err => {
            console.error("遊戲即時分析出錯:", err);
        });
    }

    // ==========================================
    // 🥇 7. 遊戲結算面板資料渲染 (HP/Score & 甜甜圈雨)
    // ==========================================

    // 憋笑中途笑場的「失敗結算」
    function triggerBustedSettlement() {
        showSection(loadingSection);
        
        // 模擬 Homer 嘲笑加載
        setTimeout(() => {
            showSection(gameResultSection);
            
            resultModeBadge.textContent = "憋笑大考驗";
            resultModeBadge.style.background = varColor("donut");
            resultStatusTitle.textContent = "憋笑失敗！ D'oh!";
            resultStatusTitle.style.color = "#f44336";
            
            resultBadgeIcon.innerHTML = `<i class="fa-solid fa-face-dizzy"></i>`;
            resultBadgeIcon.style.background = "#f44336";
            
            resultBadgeTitle.textContent = "Homer 級憋笑失敗者 🍩";
            resultBadgeDesc.textContent = "你被辛普森迷因逗笑了！在第 " + (15 - gameTimeRemaining) + " 秒笑防線崩潰！再接再厲！";
            
            statScore.textContent = "0";
            statSeconds.textContent = `${(15 - gameTimeRemaining)}s`;
            statSecondsLbl.textContent = "撐過時間";
            
            triggerDonutRain("low");
        }, 1000);
    }

    // 正常倒數結束的「最終結算」
    function performGameFinalSettlement(mimeType) {
        showSection(loadingSection);
        
        const finalBlob = new Blob(audioChunks, { type: mimeType });
        const fileExt = mimeType.includes("webm") ? ".webm" : ".ogg";
        const recordedFile = new File([finalBlob], `game_final${fileExt}`, { type: mimeType });
        
        const formData = new FormData();
        formData.append("file", recordedFile);
        
        fetch("/api/detect", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error("結算失敗");
            return response.json();
        })
        .then(data => {
            if (!data.success) throw new Error("結算資料錯誤");
            
            lastSavedGameData = data;
            showSection(gameResultSection);
            
            const segments = parseLaughterSegments(data.laughter_segments);
            let totalLaughterSec = 0;
            segments.forEach(seg => {
                totalLaughterSec += seg.duration;
            });
            
            // A. 大笑持久戰結算
            if (currentGameMode === "endurance") {
                resultModeBadge.textContent = "大笑持久戰";
                resultModeBadge.style.background = varColor("donut");
                resultStatusTitle.textContent = "挑戰結束！";
                resultStatusTitle.style.color = "#000000";
                
                const ratio = totalLaughterSec / 15.0;
                const score = Math.min(Math.round(ratio * 100), 100);
                
                statScore.textContent = score;
                statSeconds.textContent = `${totalLaughterSec.toFixed(1)}s`;
                statSecondsLbl.textContent = "笑聲總長度";
                
                // 決定稱號徽章與噴灑甜甜圈
                if (score >= 85) {
                    resultBadgeIcon.innerHTML = `<i class="fa-solid fa-face-grin-squint-tears"></i>`;
                    resultBadgeIcon.style.background = varColor("yellow");
                    resultBadgeTitle.textContent = "Krusty 級笑料大師 🤡";
                    resultBadgeDesc.textContent = `太神了！大笑占比高達 ${score}%！你簡直就是春田鎮的小丑巨星！`;
                    triggerDonutRain("high");
                } else if (score >= 50) {
                    resultBadgeIcon.innerHTML = `<i class="fa-solid fa-cookie-bite"></i>`;
                    resultBadgeIcon.style.background = varColor("donut");
                    resultBadgeTitle.textContent = "Homer 級狂笑怪人 🍩";
                    resultBadgeDesc.textContent = `很不錯！大笑占比 ${score}%！笑得非常豪邁，快吃個甜甜圈慶祝吧！`;
                    triggerDonutRain("medium");
                } else if (score >= 20) {
                    resultBadgeIcon.innerHTML = `<i class="fa-solid fa-guitar"></i>`;
                    resultBadgeIcon.style.background = varColor("blue");
                    resultBadgeTitle.textContent = "Lisa 級理智微笑 🎷";
                    resultBadgeDesc.textContent = `大笑占比 ${score}%！笑得相當有氣質，像 Lisa 的薩克斯風一樣優雅。`;
                } else {
                    resultBadgeIcon.innerHTML = `<i class="fa-solid fa-briefcase"></i>`;
                    resultBadgeIcon.style.background = "#9e9e9e";
                    resultBadgeTitle.textContent = "Mr. Burns 級冷酷無情 💼";
                    resultBadgeDesc.textContent = `大笑占比僅 ${score}%... 你的嘴角幾乎沒有動過，像 Mr. Burns 一樣冷淡！`;
                }
            } 
            // B. 憋笑成功結算
            else {
                resultModeBadge.textContent = "憋笑大考驗";
                resultModeBadge.style.background = varColor("blue");
                resultStatusTitle.textContent = "挑戰成功！";
                resultStatusTitle.style.color = "#4caf50";
                
                resultBadgeIcon.innerHTML = `<i class="fa-solid fa-mask"></i>`;
                resultBadgeIcon.style.background = "#4caf50";
                resultBadgeTitle.textContent = "Homer 級面癱忍者 🤫";
                resultBadgeDesc.textContent = "太不可思議了！你成功憋笑了整整 15 秒！辛普森迷因完全奈何不了你！";
                
                statScore.textContent = "100";
                statSeconds.textContent = "15s";
                statSecondsLbl.textContent = "憋笑時間";
                
                triggerDonutRain("high");
            }
        })
        .catch(err => {
            alert(`結算失敗: ${err.message}`);
            showSection(lobbySection);
        });
    }

    // 輔助獲取 CSS 變數顏色
    function varColor(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(`--simpsons-${name}`).trim();
    }

    // ==========================================
    // 🔄 8. 遊戲結束後的跳轉按鈕事件綁定
    // ==========================================
    
    // 再玩一次
    resultReplayBtn.addEventListener("click", () => {
        startSimpsonsGame(currentGameMode);
    });
    
    // 返回大廳
    resultLobbyBtn.addEventListener("click", () => {
        abortEverything();
        showSection(lobbySection);
    });

    // 跳轉 Wavesurfer 進行詳細分析
    resultViewWavesurferBtn.addEventListener("click", () => {
        if (lastSavedGameData) {
            showSection(workspaceSection);
            initAudioWorkspace(lastSavedGameData, false); // 以非錄音狀態載入，啟用播放控制鍵
        }
    });

    // ==========================================
    // 📂 9. 原有一般分析模式的按鈕事件綁定
    // ==========================================
    
    // 一般模式返回大廳
    resetBtn.addEventListener("click", () => {
        abortEverything();
        showSection(lobbySection);
    });

    // 拖曳上傳中麥克風按鈕
    startRecBtn.addEventListener("click", async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("您的瀏覽器不支援麥克風錄音，請使用 Chrome、Edge 或 Firefox 瀏覽器。");
            return;
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            isRecordingActive = true;
            uploadDefaultUi.classList.add("hidden");
            uploadRecordingUi.classList.remove("hidden");
            
            audioChunks = [];
            recSeconds = 0;
            recTimer.textContent = "00:00";
            recMiniLoader.classList.add("hidden");
            
            let options = { mimeType: "audio/webm" };
            if (!MediaRecorder.isTypeSupported("audio/webm")) {
                options = { mimeType: "audio/ogg" };
            }
            
            mediaRecorder = new MediaRecorder(stream, options);
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
                
                if (isBackgroundAnalysisPending) {
                    isBackgroundAnalysisPending = false;
                    performNormalBackgroundAnalysis(options.mimeType);
                }
            };
            
            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                isRecordingActive = false;
                
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: options.mimeType });
                    const fileExt = options.mimeType.includes("webm") ? ".webm" : ".ogg";
                    const recordedFile = new File([audioBlob], `recording${fileExt}`, { type: options.mimeType });
                    handleFileUpload(recordedFile);
                }
                resetRecordingUi();
            };
            
            mediaRecorder.start();
            
            recInterval = setInterval(() => {
                recSeconds++;
                recTimer.textContent = formatTime(recSeconds);
                
                if (recSeconds > 0 && recSeconds % 7 === 0) {
                    isBackgroundAnalysisPending = true;
                    mediaRecorder.requestData();
                }
            }, 1000);
            
        } catch (err) {
            alert(`取得麥克風權限失敗: ${err.message}`);
            resetRecordingUi();
        }
    });

    stopRecBtn.addEventListener("click", () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            clearInterval(recInterval);
            mediaRecorder.stop();
        }
    });

    cancelRecBtn.addEventListener("click", () => {
        if (mediaRecorder) {
            clearInterval(recInterval);
            audioChunks = [];
            if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();
            }
        }
        resetRecordingUi();
        if (wavesurfer) {
            wavesurfer.destroy();
            wavesurfer = null;
        }
        workspaceSection.classList.add("hidden");
    });

    function resetRecordingUi() {
        if (recInterval) clearInterval(recInterval);
        uploadRecordingUi.classList.add("hidden");
        uploadDefaultUi.classList.remove("hidden");
        recTimer.textContent = "00:00";
        recSeconds = 0;
        isRecordingActive = false;
        recMiniLoader.classList.add("hidden");
    }

    function performNormalBackgroundAnalysis(mimeType) {
        if (audioChunks.length === 0 || !isRecordingActive) return;
        recMiniLoader.classList.remove("hidden");
        
        const currentBlob = new Blob(audioChunks, { type: mimeType });
        const fileExt = mimeType.includes("webm") ? ".webm" : ".ogg";
        const tempFile = new File([currentBlob], `temp_recording${fileExt}`, { type: mimeType });
        
        const formData = new FormData();
        formData.append("file", tempFile);
        
        fetch("/api/detect", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error("背景偵測失敗");
            return response.json();
        })
        .then(data => {
            if (data.success && isRecordingActive) {
                workspaceSection.classList.remove("hidden");
                initAudioWorkspace(data, true);
            }
            recMiniLoader.classList.add("hidden");
        })
        .catch(err => {
            console.error("背景即時笑聲分析失敗:", err);
            recMiniLoader.classList.add("hidden");
        });
    }

    // ==========================================
    // 🎛️ 10. Wavesurfer 基礎播放器控制綁定
    // ==========================================
    playBtn.addEventListener("click", () => {
        if (wavesurfer && !isRecordingActive) wavesurfer.playPause();
    });
    
    stopBtn.addEventListener("click", () => {
        if (wavesurfer && !isRecordingActive) {
            wavesurfer.stop();
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            updateTimeDisplay();
        }
    });
    
    muteBtn.addEventListener("click", () => {
        if (!wavesurfer) return;
        const isMuted = wavesurfer.getMuted();
        wavesurfer.setMuted(!isMuted);
        if (!isMuted) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    });
    
    volumeSlider.addEventListener("input", (e) => {
        if (wavesurfer) {
            wavesurfer.setVolume(e.target.value);
        }
    });

    // ==========================================
    // 📂 9.1 原有一般上傳 Drag & Drop 與選取檔案綁定
    // ==========================================
    selectBtn.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    // ==========================================
    // 🧠 11. 缺失之關鍵輔助與 Wavesurfer 初始化函數
    // ==========================================
    function parseLaughterSegments(rawSegments) {
        if (!rawSegments) return [];
        let segments = [];
        if (typeof rawSegments === 'object' && !Array.isArray(rawSegments)) {
            Object.keys(rawSegments).forEach(key => {
                const seg = rawSegments[key];
                const start = parseFloat(seg.start_sec !== undefined ? seg.start_sec : seg.start || 0);
                const end = parseFloat(seg.end_sec !== undefined ? seg.end_sec : seg.end || 0);
                segments.push({
                    start: start,
                    end: end,
                    duration: Math.max(0, end - start)
                });
            });
        } else if (Array.isArray(rawSegments)) {
            segments = rawSegments.map(seg => {
                const start = parseFloat(seg.start_sec !== undefined ? seg.start_sec : seg.start || 0);
                const end = parseFloat(seg.end_sec !== undefined ? seg.end_sec : seg.end || 0);
                return {
                    start: start,
                    end: end,
                    duration: Math.max(0, end - start)
                };
            });
        }
        return segments.sort((a, b) => a.start - b.start);
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function handleFileUpload(file) {
        if (!file) return;
        
        // 顯示 AI 運算載入畫面
        showSection(loadingSection);
        
        const formData = new FormData();
        formData.append("file", file);
        
        fetch("/api/detect", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.detail || "AI 偵測失敗");
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showSection(workspaceSection);
                initAudioWorkspace(data, false);
            } else {
                throw new Error("伺服器傳回成功標記為 false");
            }
        })
        .catch(err => {
            alert(`AI 處理失敗: ${err.message}`);
            showSection(lobbySection);
        });
    }

    function initAudioWorkspace(data, isRecording) {
        if (!data) return;
        
        displayFilename.textContent = data.filename || "recorded_audio.webm";
        
        // 銷毀舊的播放器
        if (wavesurfer) {
            wavesurfer.destroy();
            wavesurfer = null;
            wsRegions = null;
        }
        
        // 建立 Wavesurfer v7 實例
        wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#e4e4e7', // 使用低調優雅的淡灰色，讓彩色聲波染色效果拔群！
            progressColor: '#d4d4d8',
            cursorColor: '#000000',
            url: data.audio_url,
            height: 120,
            barWidth: 4,
            barGap: 3,
            barRadius: 4,
            interact: !isRecording // 如果是即時錄音分析，先禁用點擊
        });
        
        // 註冊 Regions 插件
        wsRegions = wavesurfer.registerPlugin(WaveSurfer.Regions.create());
        
        // 監聽播放事件更新圖標
        wavesurfer.on('play', () => {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        });
        
        wavesurfer.on('pause', () => {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        });
        
        wavesurfer.on('timeupdate', (currentTime) => {
            updateTimeDisplay(currentTime);
        });
        
        wavesurfer.on('ready', () => {
            updateTimeDisplay(0);
        });
        
        // 關鍵核心：必須在解碼 (decode) 完成後，長度不為 0 時，才在水平方向精確繪製 Regions 與卡片！
        wavesurfer.on('decode', () => {
            const segments = parseLaughterSegments(data.laughter_segments);
            currentLaughterSegments = segments;
            segmentCount.textContent = `${segments.length} 段笑聲`;
            
            // 清空右側面板
            segmentsList.innerHTML = "";
            
            if (segments.length === 0) {
                segmentsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-circle-info"></i>
                        <p>此音訊中未偵測到明顯笑聲</p>
                    </div>`;
            } else {
                segments.forEach((seg, index) => {
                    const colorSet = colors[index % colors.length];
                    
                    // 建立 Region 標籤元素 (辛普森Neobrutalism粗邊框卡片風)
                    const contentEl = document.createElement("div");
                    contentEl.textContent = `#${index + 1}`;
                    contentEl.style.background = colorSet.badgeBg;
                    contentEl.style.color = colorSet.badgeText;
                    contentEl.style.fontWeight = "900";
                    contentEl.style.fontSize = "0.7rem";
                    contentEl.style.fontFamily = "var(--font-mono)";
                    contentEl.style.padding = "2px 6px";
                    contentEl.style.border = "2px solid #000000";
                    contentEl.style.borderRadius = "4px";
                    contentEl.style.boxShadow = "2px 2px 0px #000000";
                    contentEl.style.position = "absolute";
                    contentEl.style.top = "4px";
                    contentEl.style.left = "4px";
                    contentEl.style.pointerEvents = "none";
                    contentEl.style.zIndex = "10";
                    
                    // 添加 Region 高亮
                    const region = wsRegions.addRegion({
                        id: `seg-${index}`,
                        start: seg.start,
                        end: seg.end,
                        color: colorSet.region,
                        content: contentEl,
                        drag: false,
                        resize: false
                    });
                    
                    // 延遲 50ms 確保 DOM element 建立完成，套用 z-index 與 mix-blend-mode 實現 Canvas 聲波色彩染色！
                    setTimeout(() => {
                        if (region.element) {
                            region.element.style.background = colorSet.region;
                            region.element.style.borderLeft = `3px dashed ${colorSet.badgeBg}`;
                            region.element.style.borderRight = `3px dashed ${colorSet.badgeBg}`;
                            region.element.style.zIndex = "10"; // 強制置於 Canvas 波形之上
                            region.element.style.mixBlendMode = "multiply"; // 神級色彩融合，將 Canvas 聲波渲染成不同顏色！
                            region.element.style.pointerEvents = "auto"; // 允許點擊
                            region.element.style.transition = "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                        }
                    }, 50);
                    
                    // 建立右側卡片 (使用 CSS 對應的 HTML 結構)
                    const card = document.createElement("div");
                    card.className = "segment-card";
                    card.id = `card-${index}`;
                    card.style.borderLeft = `8px solid ${colorSet.badgeBg}`;
                    
                    card.innerHTML = `
                        <div class="seg-left">
                            <div class="seg-index-circle" style="background: ${colorSet.badgeBg}; color: ${colorSet.badgeText}; font-weight:900;">
                                ${index + 1}
                            </div>
                            <div class="seg-time-details">
                                <span class="seg-duration">持續 ${seg.duration.toFixed(2)}s</span>
                                <span class="seg-timestamp">${seg.start.toFixed(2)}s - ${seg.end.toFixed(2)}s</span>
                            </div>
                        </div>
                        <div class="seg-play-icon" style="color: ${colorSet.badgeBg};">
                            <i class="fa-solid fa-play"></i>
                        </div>
                    `;
                    
                    // 點擊卡片高亮並播放對應時間
                    card.addEventListener("click", () => {
                        if (wavesurfer) {
                            wavesurfer.setTime(seg.start);
                            wavesurfer.play();
                        }
                        highlightRegionAndCard(index);
                    });
                    
                    segmentsList.appendChild(card);
                });
                
                // 監聽波形圖 Region 的點擊事件
                wsRegions.on('region-clicked', (region) => {
                    const index = parseInt(region.id.replace('seg-', ''));
                    if (wavesurfer) {
                        wavesurfer.setTime(region.start);
                        wavesurfer.play();
                    }
                    highlightRegionAndCard(index);
                });
            }
        });
    }
    
    // 雙向聯動高亮處理函數
    function highlightRegionAndCard(index) {
        // 1. 卡片高亮切換
        const cards = document.querySelectorAll(".segment-card");
        cards.forEach(c => c.classList.remove("active"));
        const targetCard = document.getElementById(`card-${index}`);
        if (targetCard) {
            targetCard.classList.add("active");
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // 2. 波形 Region 高亮切換 (為選取的 Region 加上粗黑框與立體陰影，其餘清除並恢復彩色虛邊框)
        if (wsRegions) {
            const regions = wsRegions.getRegions();
            regions.forEach((r, idx) => {
                const colorSet = colors[idx % colors.length];
                if (r.element) {
                    if (r.id === `seg-${index}`) {
                        // 選中的 Region：經典粗黑實線框與實心立體陰影
                        r.element.style.borderLeft = "3px solid #000000";
                        r.element.style.borderRight = "3px solid #000000";
                        r.element.style.borderTop = "3px solid #000000";
                        r.element.style.borderBottom = "3px solid #000000";
                        r.element.style.boxShadow = "4px 4px 0px #000000";
                        r.element.style.zIndex = "20"; // 提起層級
                    } else {
                        // 未選中的 Region：恢復成專屬顏色的虛線邊框，無陰影
                        r.element.style.borderLeft = `3px dashed ${colorSet.badgeBg}`;
                        r.element.style.borderRight = `3px dashed ${colorSet.badgeBg}`;
                        r.element.style.borderTop = "none";
                        r.element.style.borderBottom = "none";
                        r.element.style.boxShadow = "none";
                        r.element.style.zIndex = "10";
                    }
                }
            });
        }
    }
    
    function updateTimeDisplay(currentTime) {
        if (!wavesurfer) return;
        const cur = currentTime !== undefined ? currentTime : wavesurfer.getCurrentTime();
        const dur = wavesurfer.getDuration() || 0;
        timeDisplay.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
    }
});
