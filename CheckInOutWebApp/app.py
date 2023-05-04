import streamlit as st
import cv2
import time
import base64
import requests
import mysql.connector
import datetime


conn = mysql.connector.connect(
    host="localhost",
    database="attendance_system",
    user="root",
    password="oracle"
)

print("Successful connection to DB!")

def load_face_embeddings():
    cursor = conn.cursor()

    # Retrieve the face embeddings from the database
    cursor.execute("SELECT first_name, last_name, email, face_embedding FROM employees")
    results = cursor.fetchall()

    known_face_embeddings = []
    known_names = []
    known_emails = []
    for row in results:
        first_name, last_name, email, face_embedding = row
        name = f"{first_name.capitalize()} {last_name.capitalize()}"
        known_names.append(name)
        known_emails.append(email)
        known_face_embeddings.append(face_embedding)

    # Don't forget to close the cursor
    cursor.close()

    known_face_embeddings = str(known_face_embeddings).replace("\'", "")
    return known_face_embeddings, known_names, known_emails

def handle_new_log(username, email):
    cursor = conn.cursor()

    # Get the user's last log entry for the current day
    today = datetime.date.today()
    current_year = today.year
    current_month = today.month
    if current_month < 10:
        current_month = "0" + str(current_month)
    cursor.execute(f"SELECT id, status, time, year, month FROM logs WHERE email='{email}' AND DATE(time) = '{today}' ORDER BY time DESC LIMIT 1")
    result = cursor.fetchone()

    # Determine the status of the new log entry
    if result is None:
        # The user doesn't have a log for the current day, so this is a check-in
        check_in_time = datetime.datetime.combine(today, datetime.time(9, 0))
        if datetime.datetime.now().time() > datetime.time(9, 0):
            check_in_time = datetime.datetime.now()

        # Insert the new log entry into the database
        cursor.execute("INSERT INTO logs (email, name, status, time, year, month) VALUES (%s, %s, %s, %s, %s, %s)", (email, username, "in", check_in_time, current_year, current_month))

        # Commit the changes to the database
        conn.commit()

        # Return the new log entry
        print(cursor.lastrowid, "check-in", check_in_time, current_year, current_month)
    else:
        # The user has a log for the current day, so this is a check-out
        log_id, status, time, year, month = result
        if status == "in":
            # If the user's last log is a check-in, set the new log to check-out
            check_out_time = datetime.datetime.now()
            if datetime.datetime.now().time() > datetime.time(18, 0):
                check_out_time = datetime.datetime.combine(today, datetime.time(18, 0))

            # Update the last log in the database
            cursor.execute("INSERT INTO logs (email, name, status, time, year, month) VALUES (%s, %s, %s, %s, %s, %s)", (email, username, "out", check_out_time, current_year, current_month))

            # Commit the changes to the database
            conn.commit()

            print(log_id, "out", check_out_time, year, month)
        else:
            # If the user's last log is a check-out, update the time of the last log
            check_out_time = datetime.datetime.now()
            if datetime.datetime.now().time() > datetime.time(18, 0):
                check_out_time = datetime.datetime.combine(today, datetime.time(18, 0))

            # Update the last log in the database
            cursor.execute(f"UPDATE logs SET time='{check_out_time}' WHERE id={log_id}")

            # Commit the changes to the database
            conn.commit()

            print(log_id, "check-out", check_out_time, year, month)
            
    cursor.close()


def convert_frame_to_base64(frame):
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')


def check_for_spoofing(frame):
    # Convert the frame to base64
    frame_base64 = convert_frame_to_base64(frame)

    # Prepare the request body
    data = {"image_base64": frame_base64}

    # Send the request to the API endpoint
    response = requests.post("http://127.0.0.1:1234/checkForSpoofing", json=data)

    # Parse the response JSON
    json_data = response.json()
    label = json_data.get("label")

    if not label:
        return None

    return label

def compare_faces(frame, known_face_embeddings, known_names):
    # Convert the frame to base64
    frame_base64 = convert_frame_to_base64(frame)
    
    # Prepare the request body
    data = {"image_base64": frame_base64, "known_face_embeddings": str(known_face_embeddings), "known_names" : known_names}

    # Send the request to the API endpoint
    response = requests.post("http://127.0.0.1:1234/compareFaces", json=data)

    # Parse the response JSON
    json_data = response.json()
    msg = json_data.get("msg")
    name = json_data.get("name")
    index = int(json_data.get("index"))

    return msg, name, index


def main():
    st.title("Check In/Out App")
    button_clicked = st.button("Check In/Out")
    stop_button_clicked = False
    stop_button = st.button("Stop Camera")
    check_list = []
    if button_clicked:
        known_face_embeddings, known_names, known_emails = load_face_embeddings()
        st.write("Starting camera...")
        st_frame = st.empty()
        cap = cv2.VideoCapture(0)
        t_start = time.time()
        last_api_call = time.time()
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            st_frame.image(frame)
            if time.time() - t_start > 30 or stop_button_clicked:
                break
            if time.time() - last_api_call > 0.5:
                label = check_for_spoofing(frame)
                if not label:
                    continue
                check_list.append(label)
                if len(check_list) >= 6:
                    if len(check_list) == 7:
                        check_list.pop(0)  
                    # st.write(check_list)
                    if check_list.count("1") == 4:
                        msg, name, index = compare_faces(frame, known_face_embeddings, known_names)
                        if msg and msg == "faces match":
                            st.success(f"Welcome {name}")
                            email = known_emails[index]
                            handle_new_log(name, email)
                            stop_button_clicked = True
                            break
                        else:
                            check_list = []
                last_api_call = time.time()
        cap.release()
        st.write("Stopping camera...")
        st_frame.empty()

if __name__ == "__main__":
    main()
