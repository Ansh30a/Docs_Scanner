import cv2
import sys
import json

image_path = sys.argv[1]

img = cv2.imread(image_path)
if img is None:
    print(json.dumps(None))
    sys.exit(0)

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (5, 5), 0)
edged = cv2.Canny(blurred, 75, 200)

contours, _ = cv2.findContours(
    edged,
    cv2.RETR_LIST,
    cv2.CHAIN_APPROX_SIMPLE
)

contours = sorted(contours, key=cv2.contourArea, reverse=True)

for contour in contours:
    peri = cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

    if len(approx) == 4:
        points = approx.reshape(4, 2).tolist()
        print(json.dumps(points))
        sys.exit(0)

print(json.dumps(None))
