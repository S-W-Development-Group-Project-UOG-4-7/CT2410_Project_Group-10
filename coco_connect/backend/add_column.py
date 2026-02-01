import os 
import django 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coco_connect.settings') 
django.setup() 
ECHO is on.
from django.db import connection 
ECHO is on.
print("Adding total_units column to connect_investmentproject...") 
try: 
    with connection.cursor() as cursor: 
        # Check if column exists 
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'connect_investmentproject' 
            AND column_name = 'total_units' 
        exists = cursor.fetchone() 
        if exists: 
            print("Column already exists") 
        else: 
            # Add the column 
                ALTER TABLE connect_investmentproject 
                ADD COLUMN total_units INTEGER DEFAULT 100 
            print("Column added successfully!") 
except Exception as e: 
    print(f"Error: {e}") 
