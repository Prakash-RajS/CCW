

# # fastapi_app/routes/dbconnection.py

# from django.db import close_old_connections, connections
# import logging

# logger = logging.getLogger(__name__)

# def check_db_connection() -> bool:
#     """Check if the default DB connection is alive."""
#     try:
#         conn = connections['default']
#         conn.ensure_connection()
#         return True
#     except Exception:
#         return False

# def ensure_db_connection():
#     """
#     Close stale/broken connections so Django opens fresh ones on next query.
#     Safe to call in both sync and async (threaded) contexts.
#     """
#     try:
#         close_old_connections()
#     except Exception as e:
#         logger.warning(f"ensure_db_connection warning: {e}")

from django.db import close_old_connections, connections
import logging

logger = logging.getLogger(__name__)

def check_db_connection() -> bool:
    """Check if the default DB connection is alive."""
    try:
        conn = connections['default']
        conn.ensure_connection()  # This forces reconnect if needed in newer Django
        return True
    except Exception:
        return False

def ensure_db_connection():
    """
    Safe database connection handler for FastAPI + Django + async endpoints.
    Works reliably even with sync_to_async.
    """
    try:
        close_old_connections()                    # Clean stale connections
        conn = connections['default']
        conn.ensure_connection()                   # Force healthy connection
    except Exception as e:
        logger.warning(f"DB connection refresh failed, forcing reconnect: {e}")
        try:
            conn.close()                           # Hard close if needed
            conn.cursor()                          # Force reopen
        except:
            pass