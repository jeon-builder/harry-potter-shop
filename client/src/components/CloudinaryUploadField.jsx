import { useEffect, useRef, useState } from "react";
import { getCloudinaryWidgetOptions, hasCloudinaryConfig } from "../config/cloudinary.js";
import "./CloudinaryUploadField.css";

const WIDGET_SRC = "https://upload-widget.cloudinary.com/latest/global/all.js";

function ensureWidgetScript() {
  if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;

  const script = document.createElement("script");
  script.src = WIDGET_SRC;
  script.async = true;
  document.head.appendChild(script);
}

function CloudinaryUploadField({ value, onChange }) {
  const widgetRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hasCloudinaryConfig()) {
      setError("VITE_CLOUDINARY_CLOUD_NAME과 VITE_CLOUDINARY_UPLOAD_PRESET를 설정하세요.");
      return undefined;
    }

    ensureWidgetScript();

    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (typeof window.cloudinary?.createUploadWidget === "function") {
        clearInterval(timer);
        widgetRef.current = window.cloudinary.createUploadWidget(
          getCloudinaryWidgetOptions(),
          (widgetError, result) => {
            if (widgetError) {
              setError("이미지를 올리지 못했습니다.");
              return;
            }

            if (result?.event === "success") {
              onChangeRef.current(result.info.secure_url);
              setError("");
            }
          },
        );
        setReady(true);
        return;
      }

      if (Date.now() - startedAt > 8000) {
        clearInterval(timer);
        setError("Cloudinary 위젯을 불러오지 못했습니다.");
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  function openWidget() {
    if (!widgetRef.current) {
      setError(error || "Cloudinary 위젯을 아직 불러오지 못했습니다.");
      return;
    }

    widgetRef.current.open();
  }

  return (
    <div className="image-upload">
      <span>이미지 *</span>
      {value ? (
        <div className="image-preview">
          <img src={value} alt="상품 미리보기" />
        </div>
      ) : (
        <div className="image-preview image-preview-empty">선택한 이미지가 여기에 보입니다.</div>
      )}
      <div className="image-upload-actions">
        <button className="button-ghost" type="button" onClick={openWidget} disabled={!ready && !error}>
          {value ? "이미지 변경" : "이미지 올리기"}
        </button>
        {value ? (
          <button className="button-ghost" type="button" onClick={() => onChange("")}>
            이미지 삭제
          </button>
        ) : null}
      </div>
      {error ? <p className="form-message form-message-error">{error}</p> : null}
    </div>
  );
}

export default CloudinaryUploadField;
