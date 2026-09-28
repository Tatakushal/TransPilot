import sys
from pathlib import Path

# The FastAPI application lives in backend/ while Vercel discovers Python
# functions from the repository root. Add backend/ to the import path so the
# existing application modules remain reusable in local development too.
backend_dir = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(backend_dir))

from main import app  # noqa: E402,F401
