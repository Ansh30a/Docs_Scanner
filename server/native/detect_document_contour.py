import cv2
import sys
import json
import numpy as np

def order_points(pts):

    rect = np.zeros((4, 2), dtype="float32")

    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]

    return rect

def detect():
    if len(sys.argv) < 2:
        print(json.dumps(None))
        return

    image_path = sys.argv[1]
    img = cv2.imread(image_path)
    
    if img is None:
        print(json.dumps(None))
        return

    orig = img.copy()
    (h, w) = img.shape[:2]
    
    target_h = 500
    r = target_h / float(h)
    dim = (int(w * r), target_h)
    resized = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)

    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    edged = cv2.Canny(blurred, 30, 150)

    kernel = np.ones((5,5), np.uint8)
    dilated = cv2.dilate(edged, kernel, iterations=3)

    contours, _ = cv2.findContours(dilated.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
    
    screenCnt = None
    
    total_area = resized.shape[0] * resized.shape[1]
    min_area = total_area * 0.05

    for c in contours:
        if cv2.contourArea(c) < min_area:
            continue
            
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)

        if len(approx) == 4:
            screenCnt = approx
            break
            
    if screenCnt is None and len(contours) > 0:
         largest_c = contours[0]
         if cv2.contourArea(largest_c) > min_area:
             rect = cv2.minAreaRect(largest_c)
             box = cv2.boxPoints(rect)
             screenCnt = np.int32(box)

    if screenCnt is not None:
        pts = screenCnt.reshape(4, 2)
        ordered = order_points(pts)
        ordered = ordered / r
        print(json.dumps(ordered.tolist()))
    else:
        full_img_pts = [[0, 0], [w, 0], [w, h], [0, h]]
        print(json.dumps(None))

if __name__ == "__main__":
    detect()