import os
import shutil
import uuid
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
import librosa
import soundfile as sf

# 匯入專案的 AI 推論核心
from inference import main as run_inference

app = FastAPI(title="Antigravity Laughter Segmentation Web App")

# 確保必要的資料夾存在
UPLOAD_DIR = os.path.join("static", "uploads")
OUTPUT_DIR = os.path.join("static", "output")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/")
async def get_index():
    # 預設重定向到前端首頁
    return RedirectResponse(url="/static/index.html")

@app.post("/api/detect")
async def detect_laughter(file: UploadFile = File(...)):
    # 驗證是否為音訊檔案
    if not file.filename:
        raise HTTPException(status_code=400, detail="無效的檔案名稱")
    
    # 取得副檔名並生成唯一的安全檔名
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".wav", ".mp3", ".ogg", ".opus", ".flac", ".m4a", ".aac", ".webm", ".mp4"]:
        raise HTTPException(status_code=400, detail="不支援的音訊或影片格式，請上傳 wav, mp3, mp4, ogg, opus, flac, webm 等檔案")
    
    unique_id = str(uuid.uuid4())
    unique_filename = f"{unique_id}{ext}"
    saved_audio_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # 儲存上傳的檔案
    try:
        with open(saved_audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"儲存檔案失敗: {str(e)}")
    
    # 如果上傳的是 MP4 視訊，則使用 librosa 與 soundfile 提取其音軌轉為 WAV
    if ext == ".mp4":
        try:
            # 載入 MP4 視訊中的音軌
            y, sr_native = librosa.load(saved_audio_path, sr=16000, mono=True)
            wav_filename = f"{unique_id}.wav"
            wav_audio_path = os.path.join(UPLOAD_DIR, wav_filename)
            # 寫入為高相容性 WAV 檔案給 Wavesurfer 與推論引擎使用
            sf.write(wav_audio_path, y, 16000, format='WAV', subtype='PCM_16')
            
            # 清理原始 MP4 以節省硬碟空間
            if os.path.exists(saved_audio_path):
                os.remove(saved_audio_path)
            
            # 重新定位後續處理目標
            saved_audio_path = wav_audio_path
            unique_filename = wav_filename
            ext = ".wav"
        except Exception as e:
            if os.path.exists(saved_audio_path):
                os.remove(saved_audio_path)
            raise HTTPException(status_code=500, detail=f"MP4 視訊音軌提取失敗: {str(e)}")
    
    # 執行 AI 笑聲偵測推論
    try:
        model_path = "./models/model.safetensors"
        # 呼叫 inference.py 內的 main 函式，會將 json 結果寫入到 OUTPUT_DIR
        run_inference(
            audio_path=saved_audio_path,
            output_dir=OUTPUT_DIR,
            model_path=model_path
        )
    except Exception as e:
        # 如果推論失敗，清理上傳的音訊
        if os.path.exists(saved_audio_path):
            os.remove(saved_audio_path)
        raise HTTPException(status_code=500, detail=f"AI 推論執行失敗: {str(e)}")
    
    # 讀取推論產出的 JSON 結果
    basename = os.path.splitext(unique_filename)[0]
    json_path = os.path.join(OUTPUT_DIR, f"{basename}.json")
    
    if not os.path.exists(json_path):
        raise HTTPException(status_code=500, detail="AI 推論已完成，但未尋找到產出的結果 JSON 檔案")
        
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            laughter_data = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"讀取結果資料失敗: {str(e)}")
        
    # 回傳給前端：音訊的 web 存取路徑與提取出的笑聲區段
    return {
        "success": True,
        "audio_url": f"/static/uploads/{unique_filename}",
        "filename": file.filename,
        "laughter_segments": laughter_data
    }

# 託管 static 靜態檔案（必須放在最後，以免覆蓋其餘路由）
app.mount("/static", StaticFiles(directory="static"), name="static")
