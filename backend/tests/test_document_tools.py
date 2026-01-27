import json
from pathlib import Path

import pytest

from agents.document_tools import (
    tool_analyze_csv_file,
    tool_extract_action_items,
    tool_extract_pdf_text
)
from app.utils import file_storage


def _build_simple_pdf_bytes(text: str) -> bytes:
    header = "%PDF-1.4\n"
    objects = []
    objects.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objects.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objects.append(
        "3 0 obj\n"
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] "
        "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n"
        "endobj\n"
    )
    stream_content = f"BT /F1 24 Tf 100 100 Td ({text}) Tj ET"
    stream_length = len(stream_content) + 1
    objects.append(
        f"4 0 obj\n<< /Length {stream_length} >>\nstream\n{stream_content}\nendstream\nendobj\n"
    )
    objects.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    offsets = []
    current = len(header.encode("utf-8"))
    for obj in objects:
        offsets.append(current)
        current += len(obj.encode("utf-8"))
    xref_offset = current

    xref = "xref\n0 6\n0000000000 65535 f \n"
    for offset in offsets:
        xref += f"{offset:010d} 00000 n \n"

    trailer = f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n"
    pdf_content = header + "".join(objects) + xref + trailer
    return pdf_content.encode("utf-8")


def _save_upload_for_test(
    tmp_path: Path,
    filename: str,
    content: bytes,
    content_type: str = "application/octet-stream"
):
    file_storage.set_upload_base_dir(tmp_path)
    return file_storage.save_upload_bytes(
        original_filename=filename,
        content=content,
        content_type=content_type,
        user_id="test-user"
    )


def test_extract_pdf_text(tmp_path: Path):
    pdf_bytes = _build_simple_pdf_bytes("Hello PDF")
    metadata = _save_upload_for_test(
        tmp_path,
        "sample.pdf",
        pdf_bytes,
        "application/pdf"
    )
    result = tool_extract_pdf_text(metadata["file_id"], max_pages=5, max_chars=2000)
    assert result["success"] is True
    assert "Hello PDF" in result["text"]
    assert result["extracted_pages"] == 1


def test_analyze_csv_file(tmp_path: Path):
    csv_bytes = "name,age\nAlice,30\nBob,25\n".encode("utf-8")
    metadata = _save_upload_for_test(
        tmp_path,
        "sample.csv",
        csv_bytes,
        "text/csv"
    )
    result = tool_analyze_csv_file(metadata["file_id"], max_rows=100, sample_rows=2)
    assert result["success"] is True
    assert result["headers"] == ["name", "age"]
    assert result["row_count"] == 2
    assert "age" in result["numeric_columns"]


def test_extract_action_items():
    text = """
    - 行动项：完成季度预算，负责人：李雷，截止 2026-02-01
    - 需要补充合同条款，Owner: Han
    其他讨论内容
    """
    result = tool_extract_action_items(text, max_items=5)
    assert result["success"] is True
    assert result["count"] == 2
    assert result["items"][0]["due_date"] == "2026-02-01"
