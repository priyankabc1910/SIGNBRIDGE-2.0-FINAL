import * as tf from '@tensorflow/tfjs';

class GestureRecognitionModel {
  constructor() {
    this.model = null;
    this.labels = ['A', 'B', 'C', 'D', 'E', 'HELLO', 'THANK_YOU', 'PLEASE', 'HELP', 'LOVE'];
  }

  async loadModel() {
    try {
      // Load a pre-trained model (you'll need to train this separately)
      this.model = await tf.loadLayersModel('/models/sign-language-model.json');
      console.log('Model loaded successfully - gestureModel.js:13');
    } catch (error) {
      console.error('Error loading model: - gestureModel.js:15', error);
      // Fallback to rule-based recognition
      this.useRuleBasedRecognition = true;
    }
  }

  async predict(landmarks) {
    if (!this.model || this.useRuleBasedRecognition) {
      return this.ruleBasedRecognition(landmarks);
    }

    // Preprocess landmarks for the model
    const processed = this.preprocessLandmarks(landmarks);
    const prediction = await this.model.predict(processed).data();
    
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    const confidence = prediction[maxIndex];
    
    return {
      gesture: this.labels[maxIndex],
      confidence: confidence
    };
  }

  preprocessLandmarks(landmarks) {
    // Flatten landmarks array and normalize
    const flattened = [];
    landmarks.forEach(point => {
      flattened.push(point.x, point.y, point.z || 0);
    });
    
    return tf.tensor2d([flattened], [1, flattened.length]);
  }

  ruleBasedRecognition(landmarks) {
    // Implement basic rule-based gesture recognition
    // This is a simplified version - enhance based on your needs
    
    if (!landmarks || landmarks.length < 21) {
      return { gesture: 'UNKNOWN', confidence: 0 };
    }

    // Example: Detect thumbs up
    const thumbTip = landmarks[4];
    const thumbBase = landmarks[2];
    const indexTip = landmarks[8];
    
    if (thumbTip.y < thumbBase.y - 0.1 && indexTip.y > thumbBase.y) {
      return { gesture: 'THUMBS_UP', confidence: 0.8 };
    }
    
    // Add more gesture rules here
    
    return { gesture: 'UNKNOWN', confidence: 0 };
  }
}

export default new GestureRecognitionModel();