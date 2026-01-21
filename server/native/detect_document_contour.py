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

def enhance_edges(gray):
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    return enhanced

def multi_scale_detect(img, resized, r):
    h, w = img.shape[:2]
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    
    enhanced = enhance_edges(gray)
    
    edges_list = []
    blurred1 = cv2.GaussianBlur(enhanced, (5, 5), 0)
    edges1 = cv2.Canny(blurred1, 30, 150)
    edges_list.append(edges1)
    
    blurred2 = cv2.bilateralFilter(enhanced, 9, 75, 75)
    edges2 = cv2.Canny(blurred2, 50, 200)
    edges_list.append(edges2)
    
    morph_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    edges3 = cv2.morphologyEx(edges1, cv2.MORPH_CLOSE, morph_kernel)
    edges_list.append(edges3)
    
    best_contour = None
    best_score = 0
    
    total_area = resized.shape[0] * resized.shape[1]
    min_area = total_area * 0.1
    max_area = total_area * 0.95
    
    for edges in edges_list:
        kernel = np.ones((3,3), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=2)
        
        contours, _ = cv2.findContours(dilated, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        
        for c in sorted(contours, key=cv2.contourArea, reverse=True)[:10]:
            area = cv2.contourArea(c)
            
            if area < min_area or area > max_area:
                continue
            
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)
            
            if len(approx) == 4:
                x, y, cw, ch = cv2.boundingRect(approx)
                aspect_ratio = float(cw) / ch if ch > 0 else 0
                
                if aspect_ratio < 0.2 or aspect_ratio > 5:
                    continue
                
                hull_area = cv2.contourArea(cv2.convexHull(approx))
                solidity = area / hull_area if hull_area > 0 else 0
                
                if solidity < 0.7:
                    continue
                
                pts = approx.reshape(4, 2)
                ordered = order_points(pts)
                
                widths = [
                    np.linalg.norm(ordered[1] - ordered[0]),
                    np.linalg.norm(ordered[2] - ordered[3])
                ]
                heights = [
                    np.linalg.norm(ordered[3] - ordered[0]),
                    np.linalg.norm(ordered[2] - ordered[1])
                ]
                
                width_diff = abs(widths[0] - widths[1]) / max(widths)
                height_diff = abs(heights[0] - heights[1]) / max(heights)
                
                if width_diff > 0.3 or height_diff > 0.3:
                    continue
                
                score = area * solidity / (1 + width_diff + height_diff)
                
                if score > best_score:
                    best_score = score
                    best_contour = approx
    
    if best_contour is not None:
        pts = best_contour.reshape(4, 2)
        ordered = order_points(pts)
        ordered = ordered / r
        return ordered.tolist()
    
    return None

def detect():
    if len(sys.argv) < 2:
        print(json.dumps(None))
        return

    image_path = sys.argv[1]
    img = cv2.imread(image_path)
    
    if img is None:
        print(json.dumps(None))
        return

    h, w = img.shape[:2]
    
    target_h = 800
    r = target_h / float(h)
    dim = (int(w * r), target_h)
    resized = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)
    
    result = multi_scale_detect(img, resized, r)
    print(json.dumps(result))

if __name__ == "__main__":
    detect()