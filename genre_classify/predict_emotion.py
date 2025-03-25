import os
import numpy as np
import librosa
import joblib
import argparse
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

def extract_features(audio_path, duration=5):
    """Extract audio features from a single audio file."""
    try:
        y, sr = librosa.load(audio_path, duration=duration)
        features = []
        
        # Temporal features
        zcr = librosa.feature.zero_crossing_rate(y=y)
        features.extend([np.mean(zcr), np.std(zcr)])
        
        rms = librosa.feature.rms(y=y)
        features.extend([np.mean(rms), np.std(rms)])
        
        # Spectral features
        centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        features.extend([np.mean(centroid), np.std(centroid)])
        
        bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
        features.extend([np.mean(bandwidth), np.std(bandwidth)])
        
        contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        features.extend([np.mean(contrast), np.std(np.mean(contrast, axis=0))])
        
        rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
        features.extend([np.mean(rolloff), np.std(rolloff)])
        
        # MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        for i in range(20):
            features.extend([np.mean(mfccs[i]), np.std(mfccs[i])])
        
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        features.extend([np.mean(chroma), np.std(np.mean(chroma, axis=0))])
        
        # Ensure exactly 94 features
        features = features[:94]
        while len(features) < 94:
            features.append(0)
        
        return features
    
    except Exception as e:
        print(f"Error extracting features from {audio_path}: {e}")
        return [0] * 94

def predict_emotion(audio_path, model_dir='model'):
    """Predict emotion for a single audio file using the trained model."""
    try:
        # Check if model files exist
        required_files = ['model.pkl', 'scaler.pkl', 'pca.pkl', 'label_encoder.pkl']
        if not all(os.path.exists(os.path.join(model_dir, f)) for f in required_files):
            raise FileNotFoundError("Model files not found. Please train the model first.")

        # Load model components
        model = joblib.load(os.path.join(model_dir, 'model.pkl'))
        scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
        pca = joblib.load(os.path.join(model_dir, 'pca.pkl'))
        label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.pkl'))

        # Extract features
        features = extract_features(audio_path)
        features = np.array(features).reshape(1, -1)

        # Preprocess features
        features_scaled = scaler.transform(features)
        features_pca = pca.transform(features_scaled)

        # Make prediction
        prediction_encoded = model.predict(features_pca)[0]
        prediction = label_encoder.inverse_transform([prediction_encoded])[0]

        # Get probabilities
        probabilities = model.predict_proba(features_pca)[0]
        emotion_probs = dict(zip(label_encoder.classes_, probabilities))

        return prediction, emotion_probs

    except Exception as e:
        print(f"Error during prediction: {e}")
        return None, None

def main():
    parser = argparse.ArgumentParser(description='Predict emotion from an audio file')
    parser.add_argument('audio_path', type=str, help='Path to the audio file')
    parser.add_argument('--model_dir', type=str, default='model',
                        help='Directory containing the trained model files (default: model)')
    
    args = parser.parse_args()

    if not os.path.isfile(args.audio_path):
        print("ERROR: File not found")
        return

    prediction, probabilities = predict_emotion(args.audio_path, args.model_dir)
    
    if prediction:
        # Only output the predicted emotion
        print(prediction)
    else:
        print("ERROR: Prediction failed")

if __name__ == "__main__":
    main()