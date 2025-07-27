import os
import time
import base64
import numpy as np
import cv2
import mediapipe as mp
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image
from io import BytesIO
import logging
from ultralytics import YOLO

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize MediaPipe
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
mp_pose = mp.solutions.pose
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

class AIDetectionService:
    def __init__(self):
        self.face_detection = mp_face_detection.FaceDetection(
            model_selection=0, min_detection_confidence=0.5
        )
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=10,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        self.pose = mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            enable_segmentation=True,
            min_detection_confidence=0.5
        )
        self.hands = mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=2,
            min_detection_confidence=0.5
        )
        
        # Initialize face cascade for backup detection
        try:
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
        except Exception as e:
            logger.warning(f"Could not load Haar cascade: {e}")
            self.face_cascade = None

        # Initialize YOLO model for object detection
        try:
            logger.info("🔄 Loading YOLO model for object detection...")
            self.yolo_model = YOLO('yolov8n.pt')  # Load YOLOv8 nano model
            logger.info("✅ YOLO model loaded successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to load YOLO model: {e}")
            self.yolo_model = None

    def preprocess_image(self, image_data):
        """Preprocess image for detection"""
        try:
            # Convert base64 to image if needed
            if isinstance(image_data, str):
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
                image = Image.open(BytesIO(image_bytes))
                image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            else:
                image = image_data

            # Convert to RGB for MediaPipe
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            return image, rgb_image
        except Exception as e:
            logger.error(f"Image preprocessing error: {e}")
            raise ValueError("Invalid image data")

    def detect_faces(self, rgb_image, bgr_image):
        """Detect faces using MediaPipe and OpenCV"""
        faces = []
        height, width = rgb_image.shape[:2]

        try:
            # MediaPipe face detection
            results = self.face_detection.process(rgb_image)
            
            if results.detections:
                for detection in results.detections:
                    bbox = detection.location_data.relative_bounding_box
                    confidence = detection.score[0]
                    
                    # Convert relative coordinates to absolute
                    x = int(bbox.xmin * width)
                    y = int(bbox.ymin * height)
                    w = int(bbox.width * width)
                    h = int(bbox.height * height)
                    
                    faces.append({
                        'boundingBox': {'x': x, 'y': y, 'width': w, 'height': h},
                        'confidence': float(confidence),
                        'landmarks': [],
                        'emotions': self._analyze_emotions(bgr_image[y:y+h, x:x+w]),
                        'age': None,
                        'gender': None
                    })

            # Fallback to OpenCV Haar cascades if no faces detected
            if not faces and self.face_cascade is not None:
                gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
                cv_faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                )
                
                for (x, y, w, h) in cv_faces:
                    faces.append({
                        'boundingBox': {'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)},
                        'confidence': 0.8,  # Default confidence for Haar cascade
                        'landmarks': [],
                        'emotions': self._analyze_emotions(bgr_image[y:y+h, x:x+w]),
                        'age': None,
                        'gender': None
                    })

            # Get face landmarks
            if faces:
                mesh_results = self.face_mesh.process(rgb_image)
                if mesh_results.multi_face_landmarks:
                    for i, landmarks in enumerate(mesh_results.multi_face_landmarks):
                        if i < len(faces):
                            faces[i]['landmarks'] = self._extract_key_landmarks(landmarks, width, height)

        except Exception as e:
            logger.error(f"Face detection error: {e}")

        return faces

    def detect_body_parts(self, rgb_image):
        """Detect body parts using MediaPipe Pose and Hands"""
        body_parts = []
        height, width = rgb_image.shape[:2]

        try:
            # Pose detection
            pose_results = self.pose.process(rgb_image)
            if pose_results.pose_landmarks:
                keypoints = []
                for i, landmark in enumerate(pose_results.pose_landmarks.landmark):
                    keypoints.append({
                        'x': int(landmark.x * width),
                        'y': int(landmark.y * height),
                        'confidence': float(landmark.visibility),
                        'name': self._get_pose_landmark_name(i)
                    })
                
                # Calculate bounding box for pose
                valid_points = [kp for kp in keypoints if kp['confidence'] > 0.5]
                if valid_points:
                    xs = [kp['x'] for kp in valid_points]
                    ys = [kp['y'] for kp in valid_points]
                    x_min, x_max = min(xs), max(xs)
                    y_min, y_max = min(ys), max(ys)
                    
                    body_parts.append({
                        'name': 'full_body_pose',
                        'keypoints': keypoints,
                        'boundingBox': {
                            'x': x_min,
                            'y': y_min,
                            'width': x_max - x_min,
                            'height': y_max - y_min
                        },
                        'confidence': float(np.mean([kp['confidence'] for kp in valid_points]))
                    })

            # Hand detection
            hand_results = self.hands.process(rgb_image)
            if hand_results.multi_hand_landmarks:
                for i, hand_landmarks in enumerate(hand_results.multi_hand_landmarks):
                    keypoints = []
                    for j, landmark in enumerate(hand_landmarks.landmark):
                        keypoints.append({
                            'x': int(landmark.x * width),
                            'y': int(landmark.y * height),
                            'confidence': 1.0,  # MediaPipe hands doesn't provide confidence per landmark
                            'name': self._get_hand_landmark_name(j)
                        })
                    
                    # Calculate bounding box for hand
                    xs = [kp['x'] for kp in keypoints]
                    ys = [kp['y'] for kp in keypoints]
                    x_min, x_max = min(xs), max(xs)
                    y_min, y_max = min(ys), max(ys)
                    
                    hand_label = hand_results.multi_handedness[i].classification[0].label
                    
                    body_parts.append({
                        'name': f'{hand_label.lower()}_hand',
                        'keypoints': keypoints,
                        'boundingBox': {
                            'x': x_min,
                            'y': y_min,
                            'width': x_max - x_min,
                            'height': y_max - y_min
                        },
                        'confidence': 0.9
                    })

        except Exception as e:
            logger.error(f"Body part detection error: {e}")

        return body_parts

    def detect_objects(self, bgr_image):
        """Detect objects using YOLO model"""
        objects = []
        
        if self.yolo_model is None:
            logger.warning("YOLO model not available for object detection")
            return objects

        try:
            # Run YOLO detection
            results = self.yolo_model(bgr_image, verbose=False)
            
            # Process results
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Get class name
                        class_name = self.yolo_model.names[class_id]
                        
                        # Only include objects with confidence > 0.5
                        if confidence > 0.5:
                            objects.append({
                                'name': class_name,
                                'confidence': float(confidence),
                                'boundingBox': {
                                    'x': int(x1),
                                    'y': int(y1),
                                    'width': int(x2 - x1),
                                    'height': int(y2 - y1)
                                },
                                'class_id': class_id
                            })
            
            logger.info(f"🎯 Detected {len(objects)} objects")
            
        except Exception as e:
            logger.error(f"Object detection error: {e}")

        return objects

    def _analyze_emotions(self, face_roi):
        """Analyze emotions from face ROI using facial landmarks"""
        try:
            if face_roi is None or face_roi.size == 0:
                return self._get_default_emotions()
            
            # Convert face ROI to RGB for MediaPipe
            rgb_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)
            
            # Get face mesh landmarks for this face
            mesh_results = self.face_mesh.process(rgb_face)
            
            if mesh_results.multi_face_landmarks:
                landmarks = mesh_results.multi_face_landmarks[0]
                return self._calculate_emotions_from_landmarks(landmarks, rgb_face.shape)
            else:
                return self._get_default_emotions()
                
        except Exception as e:
            logger.warning(f"Emotion analysis error: {e}")
            return self._get_default_emotions()
    
    def _get_default_emotions(self):
        """Return default neutral emotion state"""
        return {
            'happy': 0.1,
            'sad': 0.1,
            'angry': 0.1,
            'surprised': 0.1,
            'neutral': 0.6,
            'fear': 0.05,
            'disgust': 0.05
        }
    
    def _calculate_emotions_from_landmarks(self, landmarks, image_shape):
        """Calculate emotions based on facial landmark geometry"""
        height, width = image_shape[:2]
        
        # Extract key points for emotion detection
        points = {}
        
        # Mouth corners and center
        points['mouth_left'] = [landmarks.landmark[61].x * width, landmarks.landmark[61].y * height]
        points['mouth_right'] = [landmarks.landmark[291].x * width, landmarks.landmark[291].y * height]
        points['mouth_top'] = [landmarks.landmark[13].x * width, landmarks.landmark[13].y * height]
        points['mouth_bottom'] = [landmarks.landmark[14].x * width, landmarks.landmark[14].y * height]
        
        # Eyes
        points['left_eye_top'] = [landmarks.landmark[159].x * width, landmarks.landmark[159].y * height]
        points['left_eye_bottom'] = [landmarks.landmark[145].x * width, landmarks.landmark[145].y * height]
        points['right_eye_top'] = [landmarks.landmark[386].x * width, landmarks.landmark[386].y * height]
        points['right_eye_bottom'] = [landmarks.landmark[374].x * width, landmarks.landmark[374].y * height]
        
        # Eyebrows
        points['left_eyebrow_inner'] = [landmarks.landmark[70].x * width, landmarks.landmark[70].y * height]
        points['left_eyebrow_outer'] = [landmarks.landmark[107].x * width, landmarks.landmark[107].y * height]
        points['right_eyebrow_inner'] = [landmarks.landmark[300].x * width, landmarks.landmark[300].y * height]
        points['right_eyebrow_outer'] = [landmarks.landmark[336].x * width, landmarks.landmark[336].y * height]
        
        # Calculate features
        emotions = self._get_default_emotions()
        
        # Mouth curvature (smile detection)
        mouth_width = abs(points['mouth_right'][0] - points['mouth_left'][0])
        mouth_height = abs(points['mouth_bottom'][1] - points['mouth_top'][1])
        mouth_curve = (points['mouth_left'][1] + points['mouth_right'][1]) / 2 - points['mouth_top'][1]
        
        # Eye openness
        left_eye_height = abs(points['left_eye_bottom'][1] - points['left_eye_top'][1])
        right_eye_height = abs(points['right_eye_bottom'][1] - points['right_eye_top'][1])
        avg_eye_height = (left_eye_height + right_eye_height) / 2
        
        # Eyebrow position
        left_eyebrow_height = points['left_eyebrow_inner'][1] - points['left_eye_top'][1]
        right_eyebrow_height = points['right_eyebrow_inner'][1] - points['right_eye_top'][1]
        avg_eyebrow_height = (left_eyebrow_height + right_eyebrow_height) / 2
        
        # Emotion detection logic
        if mouth_curve < -5 and mouth_width > 15:  # Smile detected
            emotions['happy'] = min(0.8, 0.3 + abs(mouth_curve) / 20)
            emotions['neutral'] = 0.2
            
        elif mouth_curve > 3:  # Frown detected
            emotions['sad'] = min(0.7, 0.2 + mouth_curve / 15)
            emotions['neutral'] = 0.3
            
        elif avg_eye_height < 3:  # Eyes very wide
            emotions['surprised'] = 0.7
            emotions['neutral'] = 0.3
            
        elif avg_eyebrow_height < -8:  # Eyebrows raised high
            emotions['surprised'] = max(emotions['surprised'], 0.6)
            emotions['neutral'] = 0.4
            
        elif avg_eyebrow_height > -2:  # Eyebrows lowered
            emotions['angry'] = 0.6
            emotions['neutral'] = 0.4
            
        # Normalize emotions to sum to 1
        total = sum(emotions.values())
        if total > 0:
            emotions = {k: v/total for k, v in emotions.items()}
        
        return emotions

    def _extract_key_landmarks(self, landmarks, width, height):
        """Extract key facial landmarks"""
        # Key landmark indices for face mesh
        key_points = [1, 2, 5, 6, 9, 10, 151, 175, 199, 200]  # Eyes, nose, mouth corners
        
        key_landmarks = []
        for i in key_points:
            if i < len(landmarks.landmark):
                landmark = landmarks.landmark[i]
                key_landmarks.append({
                    'x': int(landmark.x * width),
                    'y': int(landmark.y * height),
                    'name': f'landmark_{i}'
                })
        
        return key_landmarks

    def _get_pose_landmark_name(self, index):
        """Get pose landmark name by index"""
        pose_landmarks = [
            'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
            'right_eye_inner', 'right_eye', 'right_eye_outer',
            'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
            'left_index', 'right_index', 'left_thumb', 'right_thumb',
            'left_hip', 'right_hip', 'left_knee', 'right_knee',
            'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
            'left_foot_index', 'right_foot_index'
        ]
        return pose_landmarks[index] if index < len(pose_landmarks) else f'landmark_{index}'

    def _get_hand_landmark_name(self, index):
        """Get hand landmark name by index"""
        hand_landmarks = [
            'wrist', 'thumb_cmc', 'thumb_mcp', 'thumb_ip', 'thumb_tip',
            'index_finger_mcp', 'index_finger_pip', 'index_finger_dip', 'index_finger_tip',
            'middle_finger_mcp', 'middle_finger_pip', 'middle_finger_dip', 'middle_finger_tip',
            'ring_finger_mcp', 'ring_finger_pip', 'ring_finger_dip', 'ring_finger_tip',
            'pinky_mcp', 'pinky_pip', 'pinky_dip', 'pinky_tip'
        ]
        return hand_landmarks[index] if index < len(hand_landmarks) else f'landmark_{index}'

# Initialize detection service
detection_service = AIDetectionService()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Detection Service',
        'timestamp': time.time()
    })

@app.route('/api/detect', methods=['POST'])
def detect():
    """Main detection endpoint for uploaded files"""
    try:
        start_time = time.time()
        
        # Get file and parameters
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        detection_type = request.form.get('detection_type', 'both')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read and process image
        file_bytes = file.read()
        nparr = np.frombuffer(file_bytes, np.uint8)
        bgr_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if bgr_image is None:
            return jsonify({'error': 'Invalid image file'}), 400

        rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)

        # Perform detection based on type
        results = {
            'faces': [],
            'bodyParts': [],
            'objects': [],
            'processingTime': 0,
            'totalDetections': 0
        }

        if detection_type in ['face', 'both', 'all']:
            results['faces'] = detection_service.detect_faces(rgb_image, bgr_image)

        if detection_type in ['body', 'both', 'all']:
            results['bodyParts'] = detection_service.detect_body_parts(rgb_image)

        if detection_type in ['object', 'objects', 'all']:
            results['objects'] = detection_service.detect_objects(bgr_image)

        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)
        results['processingTime'] = processing_time
        results['totalDetections'] = len(results['faces']) + len(results['bodyParts']) + len(results['objects'])

        logger.info(f"Detection completed in {processing_time}ms - Faces: {len(results['faces'])}, Body parts: {len(results['bodyParts'])}, Objects: {len(results['objects'])}")

        return jsonify({
            'success': True,
            'results': results
        })

    except Exception as e:
        logger.error(f"Detection error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/detect-realtime', methods=['POST'])
def detect_realtime():
    """Real-time detection endpoint"""
    try:
        start_time = time.time()
        
        data = request.get_json()
        logger.info(f"🔍 Received realtime detection request")
        logger.info(f"📦 Request data keys: {list(data.keys()) if data else 'No data'}")
        
        if not data:
            logger.error("❌ No JSON data provided")
            return jsonify({'error': 'No JSON data provided', 'success': False}), 400

        # Handle both camelCase and snake_case field names
        image_data = data.get('image_data') or data.get('imageData')
        detection_type = data.get('detection_type') or data.get('detectionType') or 'both'
        
        if not image_data:
            logger.error("❌ No image data provided")
            return jsonify({'error': 'No image data provided', 'success': False}), 400
        
        logger.info(f"📊 Image data length: {len(image_data) if image_data else 0}")
        logger.info(f"🎯 Detection type: {detection_type}")
        
        if image_data:
            logger.info(f"🖼️ Image data preview: {image_data[:100]}...")

        # Preprocess image
        bgr_image, rgb_image = detection_service.preprocess_image(image_data)
        logger.info(f"✅ Image preprocessed successfully. Shape: {rgb_image.shape}")

        # Perform detection
        results = {
            'faces': [],
            'bodyParts': [],
            'objects': [],
            'processingTime': 0
        }

        if detection_type in ['face', 'both', 'all']:
            faces = detection_service.detect_faces(rgb_image, bgr_image)
            results['faces'] = faces
            logger.info(f"👤 Detected {len(faces)} faces")

        if detection_type in ['body', 'both', 'all']:
            body_parts = detection_service.detect_body_parts(rgb_image)
            results['bodyParts'] = body_parts
            logger.info(f"🦴 Detected {len(body_parts)} body parts")

        if detection_type in ['object', 'objects', 'all']:
            objects = detection_service.detect_objects(bgr_image)
            results['objects'] = objects
            logger.info(f"🎯 Detected {len(objects)} objects")

        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)
        results['processingTime'] = processing_time
        
        logger.info(f"⏱️ Processing completed in {processing_time}ms")

        return jsonify({
            'success': True,
            'results': results
        })

    except Exception as e:
        logger.error(f"❌ Real-time detection error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting AI Detection Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
