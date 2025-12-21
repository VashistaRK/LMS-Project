@echo off
REM Simple runner for English Tutor MVP
SET PYTHONPATH=%CD%
echo Starting English Tutor backend on http://127.0.0.1:8000
uvicorn main:app --reload --host 127.0.0.1 --port 8000
