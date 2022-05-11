import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { writeBinaryFile } from "@tauri-apps/api/fs";
import { downloadDir } from "@tauri-apps/api/path";
import { dialog } from "@tauri-apps/api";

import "./App.css";

function App() {
  const [grayscaledImage, setGrayscaledImage] = useState(null);
  const [downloadPath, setDownloadPath] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const getPath = async () => {
      const path = await downloadDir();
      setDownloadPath(path);
    };
    getPath().catch(console.error);
  }, []);

  const downloadFile = async () => {
    setIsSaving(true);

    const err = await writeBinaryFile({
      contents: grayscaledImage,
      path: downloadPath + fileName + "bw.png",
    }).catch(console.error);

    if (err == null) {
      const err = await dialog.message(
        "Successfully saved inside the Downloads Folder"
      );

      if (err == null) {
        setGrayscaledImage(null);
        setPreviewImage(null);
        setIsSaving(false);
      }
    }
  };

  const cancelFunction = () => {
    setGrayscaledImage(null);
    setPreviewImage(null);
  };

  const handleFileUpload = (e) => {
    setIsProcessing(true);

    const reader = new FileReader();
    reader.addEventListener(
      "load",
      async function () {
        const result = await invoke("grayscale", {
          encodedFile: reader.result.split(",")[1],
        }).catch(console.error);

        if (result.length > 0) {
          setIsProcessing(false);
          setGrayscaledImage(result[0]);
          setPreviewImage(result[1]);
        }
      },
      false
    );

    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name.split(".")[0]);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="App">
      {previewImage == null && (
        <label className="CustomInput">
          {!isProcessing ? "Upload and Process Image" : "Processing..."}
          <input
            className="Input"
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </label>
      )}
      {previewImage && <img className="PreviewImage" src={previewImage} />}
      {grayscaledImage && (
        <div className="ButtonGroup">
          <button className="Button" onClick={downloadFile} disabled={isSaving}>
            {!isSaving ? "Save image" : "Saving..."}
          </button>
          <button className="Button" onClick={cancelFunction}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
