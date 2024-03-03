import face_recognition_model as frm
import anti_spoofing_model as asm
import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
import json
import numpy as np

app = FastAPI()

origins = [    "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    image_base64: str

class FaceMatchRequest(BaseModel):
    image_base64: str
    known_face_embeddings: str
    known_names: list

@app.post("/getFaceEmbedding")
async def get_face_embedding(image_request: ImageRequest):
    image_bytes = base64.b64decode(image_request.image_base64)
    image = frm.load_image_file(image_bytes)
    face_locations = frm.face_locations(image)

    if not face_locations:
        return {"msg": "no faces detected"}
        
    face_embeddings = frm.face_encodings(image, face_locations, num_jitters=10)
    return {"face_embeddings": json.dumps([emb.tolist() for emb in face_embeddings])}

@app.post("/compareFaces")
async def compare_faces(face_match_request: FaceMatchRequest):
    image_bytes = base64.b64decode(face_match_request.image_base64)
    image = frm.load_image_file(image_bytes)
    face_locations = frm.face_locations(image)

    if not face_locations:
        return {"msg": "no faces detected"}
    
    new_face_embeddings = frm.face_encodings(image, face_locations, num_jitters=10)

    stored_face_embedding = face_match_request.known_face_embeddings
    stored_face_embedding = stored_face_embedding[1:-1]
    stored_face_embedding = np.array(eval(stored_face_embedding))

    if len(stored_face_embedding.shape) == 1:
        stored_face_embedding = np.array([stored_face_embedding])

    stored_face_embedding = stored_face_embedding.tolist()
    stored_face_embedding = np.array(stored_face_embedding)

    match_results = frm.compare_faces(new_face_embeddings, stored_face_embedding)

    face_distances = frm.face_distance(new_face_embeddings, stored_face_embedding)
    best_match_index = np.argmin(face_distances)

    name = "none"
    if match_results[best_match_index]:
        name = face_match_request.known_names[best_match_index]

    if True in match_results:
        return {"msg": "faces match", "name": str(name), "index": str(best_match_index)}
    else:
        return {"msg": "faces don't match", "name": str(name), "index": "-1"}

    
@app.post("/checkForSpoofing")
async def check_for_spoofing(image_request: ImageRequest):
    image_bytes = base64.b64decode(image_request.image_base64)

    image = frm.load_image_file(image_bytes)

    face_locations = frm.face_locations(image)

    if not face_locations:
        return {"msg": "no faces detected"}
    
    top, right, bottom, left = face_locations[0]
    image = image[top:bottom, left:right]

    label = asm.check_for_spoofing(image)

    return {"label" : str(label)}
