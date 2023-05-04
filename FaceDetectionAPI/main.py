import face_recognition_model as frm
import anti_spoofing_model as asm
import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
import json
import numpy as np

app = FastAPI()

# Set up CORS
origins = [    "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a request model to accept base64 encoded image data
class ImageRequest(BaseModel):
    image_base64: str

# Define a request model to accept face embedding and base64 encoded image data
class FaceMatchRequest(BaseModel):
    image_base64: str
    known_face_embeddings: str
    known_names: list

# Probably change to get not post
@app.post("/getFaceEmbedding")
async def get_face_embedding(image_request: ImageRequest):
    # Decode the base64 encoded image data
    image_bytes = base64.b64decode(image_request.image_base64)
    # Load the image as a numpy array
    image = frm.load_image_file(image_bytes)
    # Detect faces in the image
    face_locations = frm.face_locations(image)
    if not face_locations:
        # No faces detected
        return {"msg": "no faces detected"}
    # Get the face embeddings of the detected faces
    face_embeddings = frm.face_encodings(image, face_locations, num_jitters=10)
    # Return the face embeddings
    return {"face_embeddings": json.dumps([emb.tolist() for emb in face_embeddings])}

@app.post("/compareFaces")
async def compare_faces(face_match_request: FaceMatchRequest):
    # Decode the base64 encoded image data
    image_bytes = base64.b64decode(face_match_request.image_base64)
    # Load the image as a numpy array
    image = frm.load_image_file(image_bytes)
    # Detect faces in the image
    face_locations = frm.face_locations(image)

    if not face_locations:
        # No faces detected
        return {"msg": "no faces detected"}
    
    # Get the face embeddings of the detected faces
    new_face_embeddings = frm.face_encodings(image, face_locations, num_jitters=10)

    stored_face_embedding = face_match_request.known_face_embeddings
    stored_face_embedding = stored_face_embedding[1:-1]
    stored_face_embedding = np.array(eval(stored_face_embedding))

    if len(stored_face_embedding.shape) == 1:
        stored_face_embedding = np.array([stored_face_embedding])

    stored_face_embedding = stored_face_embedding.tolist()
    stored_face_embedding = np.array(stored_face_embedding)

    # Compare the face embeddings
    match_results = frm.compare_faces(new_face_embeddings, stored_face_embedding)

    face_distances = frm.face_distance(new_face_embeddings, stored_face_embedding)
    best_match_index = np.argmin(face_distances)

    name = "none"
    if match_results[best_match_index]:
        name = face_match_request.known_names[best_match_index]

    if True in match_results:
        # Faces match
        return {"msg": "faces match", "name": str(name), "index": str(best_match_index)}
    else:
        # Faces don't match
        return {"msg": "faces don't match", "name": str(name), "index": "-1"}

    
@app.post("/checkForSpoofing")
async def check_for_spoofing(image_request: ImageRequest):
    # Decode the base64 encoded image data
    image_bytes = base64.b64decode(image_request.image_base64)

    # Load the image as a numpy array
    image = frm.load_image_file(image_bytes)

    # Detect faces in the image
    face_locations = frm.face_locations(image)

    if not face_locations:
        # No faces detected
        return {"msg": "no faces detected"}
    
    # Crop the image to show only the face
    top, right, bottom, left = face_locations[0]
    image = image[top:bottom, left:right]

    label = asm.check_for_spoofing(image)

    return {"label" : str(label)}
    
    
# @app.post("/checkForSpoofing")
# async def check_for_spoofing(image_request: ImageRequest):

#     # Decode the base64 encoded image data
#     image_bytes = base64.b64decode(image_request.image_base64)

#     # Load the image as a numpy array
#     image = frm.load_image_file(image_bytes)

#     # Detect faces in the image
#     face_locations = frm.face_locations(image)

#     if not face_locations:
#         # No faces detected
#         return {"msg": "no faces detected"}
    
#     # Crop the image to show only the face
#     top, right, bottom, left = face_locations[0]
#     image = image[top:bottom, left:right]

#     # Checking for spoofing
#     fake_prob = asm.check_for_spoofing(image)

#     if fake_prob >= 0.7:
#         return {"msg" : "Spoofing Alert!", "fake_prob" : str(fake_prob)}
    
#     return {"msg" : "No Spoofing!", "fake_prob" : str(fake_prob)}