from database import engine

try:
    conn = engine.connect()
    print("✅ Connected to Neon Database")
    conn.close()

except Exception as e:
    print("❌ Error:", e)