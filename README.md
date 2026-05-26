# 🍩 笑頓偵測器 (The Simpsons Laugh Challenge) & AI 笑聲提取視覺化平台

## 🌟 專案概述
本專案基於 **Interspeech 2024** 發表的先進 AI 深度學習笑聲分割模型，進行了大幅度的**前端重構與遊戲化升級**！
我們融合了**經典辛普森（Simpsons）明亮卡通風格**，打造出一款結合「AI 精準笑聲偵測」與「趣味互動」的 **笑聲聲控挑戰遊戲 Web App**。

除提供強大的語音笑聲區段提取外，您還可以直接在網頁上挑戰憋笑功力、大笑能量，並體驗驚艷的 Canvas 聲波色彩染色與雙向聯動高亮技術！

> [!NOTE]
> 本專案的 AI 推論核心、訓練數據及基礎模型均源自學術論文：
> **[Taisei Omine, Kenta Akita, and Reiji Tsuruno, "Robust Laughter Segmentation with Automatic Diverse Data Synthesis", Interspeech 2024.](https://doi.org/10.21437/Interspeech.2024-1644)**

---

## 🎨 核心特色與亮點功能

### 1. 🎮 「笑頓大挑戰！」AI 聲控挑戰小遊戲
* 🏆 **大笑持久戰 (Laugh Endurance Match)**：在 15 秒內盡情狂笑！AI 背景每 5 秒進行一次自動切片分析，笑得越豪邁、能量條（Power Bar）越往上衝，挑戰 Krusty 級笑料大師並觸發 **「全螢幕甜甜圈雨 (Donut Rain) 粒子下落與旋轉」** 卡通特效！
* 🤫 **憋笑大考驗 (Don't Laugh Challenge)**：挑戰憋笑 15 秒！畫面將每 3.5 秒自動輪播超搞笑的辛普森經典迷因 GIF。AI 每 3 秒背景嚴格監聽，只要笑出聲（大於 0.15 秒），HP 血條瞬間扣光，Homer 大喊 **"D'oh!"** 宣告失敗！

### 📊 2. 雙向色彩高亮波形聯動系統 (Wavesurfer.js v7)
* 💡 **Canvas 聲波色彩染色**：透過 `mix-blend-mode: multiply` 神級色彩融合，笑聲區間的聲波線條會**直接被染色**為卡片對應的粉紅、亮綠、亮藍等卡通色彩，而非笑聲段落則呈現低調淡雅的淺灰色，對比度極其鮮豔醒目！
* 🏷️ **波形 Region 數字標籤**：水平解碼展開後，每個笑聲區段的左上角會帶有與其對應的 `#1`、`#2` 卡通粗邊框數字標籤，一眼即可分辨是哪一段。
* 🔄 **極致的雙向聯動**：
  * **點擊右側卡片**：波形圖對應區段立即套上 **3px 粗黑實心框與立體實心陰影**，並自動定位播放。
  * **點選左側波形**：右側笑聲卡片自動切換為**按鈕下壓（Active）狀態**，並自動平滑滾動（Scroll）至視野正中央。

### 🎬 3. 直接支援 MP4 視訊（自動提取音軌）
* 網頁檔案選取器與拖曳區已完美支援 **`.mp4`** 影片。
* 後端接收到 MP4 視訊後，會自動在背景使用 `librosa` 與 `soundfile` 提取 Mono 音軌並存為高相容性 **`.wav`** 音訊，讓您能直接對影片進行笑聲 AI 分析與波形繪製！

---

## 🛠️ 安裝指南 (Installation)

本專案建議在 Python 3.11 的虛擬環境下運行：

```bash
# 1. 克隆本專案到您的電腦
git clone <您的GitHub倉庫網址>
cd LaughterSegmentation

# 2. 建立並啟動 Python 3.11 虛擬環境 (使用 uv 或是預設 venv)
python -m venv .venv
.venv\Scripts\activate      # Windows 環境
source .venv/bin/activate    # Linux / macOS 環境

# 3. 安裝必要套件與相容性修復 (PySoundFile 降級與 setuptools 降級相容)
python -m pip install -r requirements.txt
python -m pip install setuptools==69.5.1
```

> [!IMPORTANT]
> **下載 AI 預訓練模型**
> 本專案推論需使用約 1.26 GB 的權重檔。請由 [Huggingface 儲存庫](https://huggingface.co/omine-me/LaughterSegmentation/tree/main) 下載 **`model.safetensors`** 檔案，並在專案根目錄下建立 `models` 資料夾，將其放置於：`models/model.safetensors`。

---

## 🚀 運行與使用方式

### 🌐 啟動笑頓偵測器 Web App (推薦)
在專案根目錄下執行以下指令以啟動背景 FastAPI 伺服器：
```bash
.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000
```
啟動成功後，在瀏覽器輸入：
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
即可立刻開始遊玩「笑頓大挑戰」或使用拖曳/麥克風分析音訊影片！

---

### 💻 傳統命令列執行方式 (Command Line)
如果您想直接在命令列執行單一音訊檔案的笑聲區段提取：
```bash
python inference.py --audio_path input.wav --output_dir ./output
```
* 支援常見音訊格式如 `wav`, `mp3`, `opus`, `ogg` 等。
* 分析完成後，會於 `output_dir` 產出對應檔名的 `json` 結果檔案。

---

## 🔬 訓練與評估 (Training & Evaluation)
* 有關模型自定義訓練的詳細說明，請參閱 [train 資料夾中的 README](/train/README.md)。
* 有關本論文評估數據集的說明，請參閱 [evaluation 資料夾中的 README](/evaluation/README.md)。

---

## ⚖️ 授權條款 (License)
* 本 Repository 程式碼採用 **MIT 授權條款** 開源。
* 然而，論文原作者公開提供的[預訓練模型權重檔 (model.safetensors)](https://huggingface.co/omine-me/LaughterSegmentation/tree/main) 目前**僅限於學術與研究用途 (Research use only)**。

---

## 🏆 學術引用 (Citation)
如果您在學術研究中使用了此專案的模型或數據，請引用以下論文：

```text
Omine, T., Akita, K., Tsuruno, R. (2024) Robust Laughter Segmentation with Automatic Diverse Data Synthesis. Proc. Interspeech 2024, 4748-4752, doi: 10.21437/Interspeech.2024-1644
```

或 BibTeX 格式：
```bibtex
@inproceedings{omine24_interspeech,
  title     = {Robust Laughter Segmentation with Automatic Diverse Data Synthesis},
  author    = {Taisei Omine and Kenta Akita and Reiji Tsuruno},
  year      = {2024},
  booktitle = {Interspeech 2024},
  pages     = {4748--4752},
  doi       = {10.21437/Interspeech.2024-1644},
}
```

---

## 📞 聯絡與問題反饋
* 原作者聯絡方式：可使用 GitHub Issues 或前往其 [X (Twitter)](https://x.com/mineBeReal)。
* 本次「笑頓大挑戰」卡通遊戲化與雙向色彩波形重構由 **Antigravity AI 卡通遊戲引擎** 協助開發。
