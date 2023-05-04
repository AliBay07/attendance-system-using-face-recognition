import os
import cv2
import numpy as np
import warnings

from .src.anti_spoof_predict import AntiSpoofPredict
from .src.generate_patches import CropImage
from .src.utility import parse_model_name
warnings.filterwarnings('ignore')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
model_dir = os.path.join(CURRENT_DIR, "resources/anti_spoof_models")

def check_for_spoofing(image, device_id=0):
    model_test = AntiSpoofPredict(device_id)
    image_cropper = CropImage()
    image = cv2.resize(image, (int(image.shape[0] * 3 / 4), image.shape[0]))

    image_bbox = model_test.get_bbox(image)
    prediction = np.zeros((1, 3))
    for model_name in os.listdir(model_dir):
        h_input, w_input, model_type, scale = parse_model_name(model_name)
        param = {
            "org_img": image,
            "bbox": image_bbox,
            "scale": scale,
            "out_w": w_input,
            "out_h": h_input,
            "crop": True,
        }
        if scale is None:
            param["crop"] = False
        img = image_cropper.crop(**param)
        prediction += model_test.predict(img, os.path.join(model_dir, model_name))

    label = np.argmax(prediction)
    
    return label