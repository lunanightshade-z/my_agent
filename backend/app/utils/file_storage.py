"""
文件存储与元数据管理
用于上传文档的保存、检索与权限隔离
"""
import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)


# ==================== 上传配置 ====================
ALLOWED_UPLOAD_EXTENSIONS = {".pdf", ".csv", ".txt", ".md"}
MAX_UPLOAD_SIZE_MB = 20
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024


def _resolve_base_dir() -> Path:
    if os.getenv("DOCKER_ENV") or os.path.exists("/app"):
        return Path("/app/data/uploads")
    backend_path = Path(__file__).resolve().parents[2]
    return backend_path / "data" / "uploads"


BASE_UPLOAD_DIR = _resolve_base_dir()
BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_upload_base_dir() -> Path:
    return BASE_UPLOAD_DIR


def set_upload_base_dir(base_dir: Path) -> None:
    global BASE_UPLOAD_DIR
    BASE_UPLOAD_DIR = base_dir
    BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _build_metadata(
    file_id: str,
    original_filename: str,
    stored_filename: str,
    content_type: str,
    size_bytes: int,
    user_id: str,
    conversation_id: Optional[int]
) -> Dict[str, Any]:
    return {
        "file_id": file_id,
        "original_filename": original_filename,
        "stored_filename": stored_filename,
        "content_type": content_type,
        "size_bytes": size_bytes,
        "extension": Path(stored_filename).suffix.lower(),
        "user_id": user_id,
        "conversation_id": conversation_id,
        "uploaded_at": datetime.utcnow().isoformat() + "Z"
    }


def _validate_upload(
    original_filename: str,
    content_type: str,
    size_bytes: int
) -> None:
    extension = Path(original_filename).suffix.lower()
    if extension not in ALLOWED_UPLOAD_EXTENSIONS:
        raise ValueError(
            f"不支持的文件类型: {extension}。允许类型: {sorted(ALLOWED_UPLOAD_EXTENSIONS)}"
        )
    if size_bytes <= 0:
        raise ValueError("文件为空或无法读取")
    if size_bytes > MAX_UPLOAD_SIZE_BYTES:
        raise ValueError(f"文件过大，限制 {MAX_UPLOAD_SIZE_MB}MB")
    if not content_type:
        logger.warning("upload_missing_content_type", filename=original_filename)


def save_upload_bytes(
    original_filename: str,
    content: bytes,
    content_type: str,
    user_id: str,
    conversation_id: Optional[int] = None
) -> Dict[str, Any]:
    size_bytes = len(content or b"")
    _validate_upload(original_filename, content_type, size_bytes)

    file_id = uuid.uuid4().hex
    extension = Path(original_filename).suffix.lower()
    stored_filename = f"{file_id}{extension}"
    file_path = BASE_UPLOAD_DIR / stored_filename
    metadata_path = BASE_UPLOAD_DIR / f"{file_id}.json"

    file_path.write_bytes(content)
    metadata = _build_metadata(
        file_id=file_id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        content_type=content_type,
        size_bytes=size_bytes,
        user_id=user_id,
        conversation_id=conversation_id
    )
    metadata_path.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    logger.info(
        "upload_saved",
        file_id=file_id,
        filename=original_filename,
        size_bytes=size_bytes,
        conversation_id=conversation_id,
        user_id=user_id
    )
    return metadata


def get_upload_metadata(file_id: str) -> Dict[str, Any]:
    metadata_path = BASE_UPLOAD_DIR / f"{file_id}.json"
    if not metadata_path.exists():
        raise FileNotFoundError(f"找不到上传记录: {file_id}")
    return json.loads(metadata_path.read_text(encoding="utf-8"))


def resolve_upload_path(file_id: str) -> Tuple[Path, Dict[str, Any]]:
    metadata = get_upload_metadata(file_id)
    file_path = BASE_UPLOAD_DIR / metadata["stored_filename"]
    if not file_path.exists():
        raise FileNotFoundError(f"找不到文件: {metadata['stored_filename']}")
    return file_path, metadata


def list_uploads(user_id: str) -> List[Dict[str, Any]]:
    uploads: List[Dict[str, Any]] = []
    for meta_file in BASE_UPLOAD_DIR.glob("*.json"):
        try:
            metadata = json.loads(meta_file.read_text(encoding="utf-8"))
            if metadata.get("user_id") == user_id:
                uploads.append(metadata)
        except Exception as e:
            logger.warning(
                "upload_metadata_read_failed",
                file=str(meta_file),
                error=str(e)
            )
    uploads.sort(key=lambda item: item.get("uploaded_at", ""), reverse=True)
    return uploads
