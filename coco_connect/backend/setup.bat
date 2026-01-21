@echo off 
echo ======================================== 
echo   COCO CONNECT - SETUP SCRIPT 
echo ======================================== 
echo. 
echo Step 1: Activating virtual environment... 
call venv\Scripts\activate 
echo. 
echo Step 2: Installing dependencies... 
pip install django 
pip install djangorestframework 
pip install django-cors-headers 
pip install django-filter 
pip install psycopg2-binary 
echo. 
echo Step 3: Running migrations... 
python manage.py makemigrations 
python manage.py migrate 
echo. 
echo Step 4: Creating test data... 
python create_test_data.py 
echo. 
echo Step 5: Starting Django server... 
echo. 
echo ======================================== 
echo   Django server will start on: 
echo   http://127.0.0.1:8000/ 
echo ======================================== 
echo. 
python manage.py runserver 
pause 
