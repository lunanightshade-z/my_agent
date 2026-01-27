"""
文档类工具
提供PDF文本提取、CSV概览分析、会议纪要行动项提取
"""
import csv
import re
from typing import Any, Dict, List

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover - 运行环境缺依赖时兜底
    PdfReader = None

from app.infrastructure.logging.setup import get_logger
from app.utils.file_storage import resolve_upload_path

logger = get_logger(__name__)

# ==================== 参数配置 ====================
DEFAULT_PDF_MAX_PAGES = 10
DEFAULT_PDF_MAX_CHARS = 8000
MAX_PDF_PAGES = 50
MAX_PDF_CHARS = 30000

DEFAULT_CSV_MAX_ROWS = 5000
DEFAULT_CSV_SAMPLE_ROWS = 5
MAX_CSV_ROWS = 20000

DEFAULT_ACTION_ITEMS_MAX = 20
MAX_ACTION_ITEMS = 50


def _clamp_int(value: int, min_value: int, max_value: int, default: int) -> int:
    try:
        normalized = int(value)
    except (TypeError, ValueError):
        return default
    return max(min_value, min(max_value, normalized))


def _normalize_bullet(text: str) -> str:
    return re.sub(r"^\s*([-*•]|\d+[.)])\s*", "", text).strip()


def _extract_due_date(text: str) -> str:
    patterns = [
        r"\d{4}[-/]\d{1,2}[-/]\d{1,2}",
        r"\d{1,2}月\d{1,2}日",
        r"\d{1,2}[-/]\d{1,2}"
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return ""


def _extract_assignee(text: str) -> str:
    patterns = [
        r"负责人[:：]\s*([^\s，,;；]+)",
        r"Owner[:：]\s*([^\s，,;；]+)"
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    return ""


def tool_extract_pdf_text(
    file_id: str,
    max_pages: int = DEFAULT_PDF_MAX_PAGES,
    max_chars: int = DEFAULT_PDF_MAX_CHARS
) -> Dict[str, Any]:
    """
    提取PDF文本内容
    """
    try:
        if PdfReader is None:
            return {
                "success": False,
                "error": "未安装pypdf依赖，无法解析PDF",
                "file_id": file_id
            }
        file_path, metadata = resolve_upload_path(file_id)
        if metadata.get("extension") != ".pdf":
            return {
                "success": False,
                "error": "文件类型不是PDF",
                "file_id": file_id
            }

        reader = PdfReader(str(file_path))
        total_pages = len(reader.pages)
        page_limit = _clamp_int(
            max_pages,
            1,
            min(MAX_PDF_PAGES, total_pages if total_pages > 0 else 1),
            DEFAULT_PDF_MAX_PAGES
        )
        char_limit = _clamp_int(
            max_chars,
            500,
            MAX_PDF_CHARS,
            DEFAULT_PDF_MAX_CHARS
        )

        extracted_pages = 0
        chunks: List[str] = []
        for page_index in range(min(page_limit, total_pages)):
            extracted_pages += 1
            page_text = reader.pages[page_index].extract_text() or ""
            chunks.append(page_text)
            if sum(len(chunk) for chunk in chunks) >= char_limit:
                break

        combined_text = "\n".join(chunks).strip()
        truncated_by_pages = total_pages > extracted_pages
        truncated_by_chars = len(combined_text) > char_limit
        if truncated_by_chars:
            combined_text = combined_text[:char_limit]

        return {
            "success": True,
            "file_id": file_id,
            "file_name": metadata.get("original_filename"),
            "total_pages": total_pages,
            "extracted_pages": extracted_pages,
            "truncated_by_pages": truncated_by_pages,
            "truncated_by_chars": truncated_by_chars,
            "text": combined_text,
            "text_preview": combined_text[:400]
        }
    except Exception as e:
        logger.error("pdf_text_extract_failed", file_id=file_id, error=str(e))
        return {
            "success": False,
            "file_id": file_id,
            "error": str(e)
        }


def tool_analyze_csv_file(
    file_id: str,
    max_rows: int = DEFAULT_CSV_MAX_ROWS,
    sample_rows: int = DEFAULT_CSV_SAMPLE_ROWS
) -> Dict[str, Any]:
    """
    解析CSV并给出概览
    """
    try:
        file_path, metadata = resolve_upload_path(file_id)
        if metadata.get("extension") != ".csv":
            return {
                "success": False,
                "error": "文件类型不是CSV",
                "file_id": file_id
            }

        row_limit = _clamp_int(max_rows, 1, MAX_CSV_ROWS, DEFAULT_CSV_MAX_ROWS)
        sample_limit = _clamp_int(sample_rows, 1, 20, DEFAULT_CSV_SAMPLE_ROWS)

        with open(file_path, "r", encoding="utf-8-sig", newline="") as csv_file:
            reader = csv.reader(csv_file)
            headers = next(reader, [])
            headers = [header.strip() for header in headers]

            numeric_stats = {
                header: {"count": 0, "sum": 0.0, "min": None, "max": None}
                for header in headers
            }
            collected_samples: List[List[str]] = []
            row_count = 0
            truncated = False

            for row in reader:
                if row_count >= row_limit:
                    truncated = True
                    break
                row_count += 1
                if len(collected_samples) < sample_limit:
                    collected_samples.append(row)

                for idx, header in enumerate(headers):
                    value = row[idx] if idx < len(row) else ""
                    value = value.strip()
                    if not value:
                        continue
                    try:
                        number = float(value)
                    except ValueError:
                        continue
                    stats = numeric_stats[header]
                    stats["count"] += 1
                    stats["sum"] += number
                    stats["min"] = number if stats["min"] is None else min(stats["min"], number)
                    stats["max"] = number if stats["max"] is None else max(stats["max"], number)

        numeric_columns = {}
        for header, stats in numeric_stats.items():
            if stats["count"] > 0:
                numeric_columns[header] = {
                    "count": stats["count"],
                    "min": stats["min"],
                    "max": stats["max"],
                    "avg": round(stats["sum"] / stats["count"], 4)
                }

        return {
            "success": True,
            "file_id": file_id,
            "file_name": metadata.get("original_filename"),
            "headers": headers,
            "row_count": row_count,
            "sample_rows": collected_samples,
            "numeric_columns": numeric_columns,
            "truncated": truncated,
            "note": "数值列统计基于可解析为数字的单元格"
        }
    except Exception as e:
        logger.error("csv_analyze_failed", file_id=file_id, error=str(e))
        return {
            "success": False,
            "file_id": file_id,
            "error": str(e)
        }


def tool_extract_action_items(
    text: str,
    max_items: int = DEFAULT_ACTION_ITEMS_MAX
) -> Dict[str, Any]:
    """
    从会议纪要/文本中提取行动项
    """
    if not text or not text.strip():
        return {"success": True, "items": [], "count": 0}

    limit = _clamp_int(max_items, 1, MAX_ACTION_ITEMS, DEFAULT_ACTION_ITEMS_MAX)
    keywords = ["待办", "行动项", "TODO", "Action", "需要", "负责人", "Owner"]
    items = []

    for line in text.splitlines():
        if len(items) >= limit:
            break
        stripped = line.strip()
        if not stripped:
            continue

        is_action = any(keyword in stripped for keyword in keywords)
        if not is_action and re.match(r"^\s*([-*•]|\d+[.)])\s+", line):
            is_action = True

        if not is_action:
            continue

        normalized = _normalize_bullet(stripped)
        items.append({
            "item": normalized,
            "assignee": _extract_assignee(normalized),
            "due_date": _extract_due_date(normalized)
        })

    return {
        "success": True,
        "items": items,
        "count": len(items)
    }


DOCUMENT_TOOLS_DEFINITIONS = [
    {
        "name": "extract_pdf_text",
        "description": "从用户上传的PDF中提取文本，返回可用于摘要/要点整理的内容。需要提供上传返回的file_id。",
        "parameters": {
            "type": "object",
            "properties": {
                "file_id": {
                    "type": "string",
                    "description": "上传文件返回的file_id"
                },
                "max_pages": {
                    "type": "integer",
                    "description": "最多提取的页数，默认10",
                    "default": DEFAULT_PDF_MAX_PAGES,
                    "minimum": 1,
                    "maximum": MAX_PDF_PAGES
                },
                "max_chars": {
                    "type": "integer",
                    "description": "最多提取的字符数，默认8000",
                    "default": DEFAULT_PDF_MAX_CHARS,
                    "minimum": 500,
                    "maximum": MAX_PDF_CHARS
                }
            },
            "required": ["file_id"]
        },
        "function": tool_extract_pdf_text
    },
    {
        "name": "analyze_csv_file",
        "description": "分析CSV文件结构和数值列统计，快速获取表格概览。需要提供上传返回的file_id。",
        "parameters": {
            "type": "object",
            "properties": {
                "file_id": {
                    "type": "string",
                    "description": "上传文件返回的file_id"
                },
                "max_rows": {
                    "type": "integer",
                    "description": "最多解析的行数，默认5000",
                    "default": DEFAULT_CSV_MAX_ROWS,
                    "minimum": 1,
                    "maximum": MAX_CSV_ROWS
                },
                "sample_rows": {
                    "type": "integer",
                    "description": "返回的样例行数，默认5",
                    "default": DEFAULT_CSV_SAMPLE_ROWS,
                    "minimum": 1,
                    "maximum": 20
                }
            },
            "required": ["file_id"]
        },
        "function": tool_analyze_csv_file
    },
    {
        "name": "extract_action_items",
        "description": "从会议纪要/文本中提取行动项、负责人和截止时间，适合快速整理待办。",
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "会议纪要或任务文本"
                },
                "max_items": {
                    "type": "integer",
                    "description": "最多提取的行动项数量，默认20",
                    "default": DEFAULT_ACTION_ITEMS_MAX,
                    "minimum": 1,
                    "maximum": MAX_ACTION_ITEMS
                }
            },
            "required": ["text"]
        },
        "function": tool_extract_action_items
    }
]
