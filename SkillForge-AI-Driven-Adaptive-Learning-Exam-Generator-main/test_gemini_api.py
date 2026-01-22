import requests
import json

# Test Gemini API directly
API_KEY = "AIzaSyC8tVqKRquRqlU8L9qa_-rMgLmWZLxD-MA"
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

def test_gemini_api():
    url = f"{API_URL}?key={API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Generate 2 easy multiple-choice questions about Java programming. Return ONLY valid JSON: [{\"questionText\": \"What is...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctAnswer\": \"A\"}]"
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 1000
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("Testing Gemini API...")
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("API Response received!")
            print(json.dumps(result, indent=2))
            
            # Extract the generated text
            if 'candidates' in result and len(result['candidates']) > 0:
                content = result['candidates'][0]['content']
                text = content['parts'][0]['text']
                print(f"\nGenerated Text:\n{text}")
                return True
        else:
            print(f"API Error: {response.status_code}")
            print(f"Error details: {response.text}")
            return False
            
    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    test_gemini_api()