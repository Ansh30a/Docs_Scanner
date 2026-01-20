import cv2
import sys
import json
import numpy as np

image_path = sys.argv[1]
points_json = sys.argv[2]
output_path = sys.argv[3]

pts = np.array(json.loads(points_json), dtype="float32")

def order_points(pts):
    s = pts.sum(axis=1)
    diff = np.diff(pts, axis=1)

    return np.array([
        pts[np.argmin(s)],
        pts[np.argmin(diff)],
        pts[np.argmax(s)],
        pts[np.argmax(diff)]
    ], dtype="float32")

rect = order_points(pts)
(tl, tr, br, bl) = rect

widthA = np.linalg.norm(br - bl)
widthB = np.linalg.norm(tr - tl)
maxWidth = int(max(widthA, widthB))

heightA = np.linalg.norm(tr - br)
heightB = np.linalg.norm(tl - bl)
maxHeight = int(max(heightA, heightB))

dst = np.array([
    [0, 0],
    [maxWidth - 1, 0],
    [maxWidth - 1, maxHeight - 1],
    [0, maxHeight - 1]
], dtype="float32")

M = cv2.getPerspectiveTransform(rect, dst)
image = cv2.imread(image_path)

warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
cv2.imwrite(output_path, warped)

print(json.dumps({
    "width": maxWidth,
    "height": maxHeight
}))
