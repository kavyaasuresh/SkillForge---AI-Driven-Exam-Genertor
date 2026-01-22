import requests
import json

API_KEY = "AIzaSyCMtmRdbKoekxuo1rpS06b9NgoYQGRzta0"

def list_models():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    
    try:
        print("Fetching available models...")
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Available models:")
            for model in result.get('models', []):
                name = model.get('name', '')
                display_name = model.get('displayName', '')
                supported_methods = model.get('supportedGenerationMethods', [])
                print(f"- {name} ({display_name}) - Methods: {supported_methods}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    list_models()