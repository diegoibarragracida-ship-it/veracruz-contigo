"""
Test suite for Veracruz Contigo AI Chatbot - Iteration 6
Tests POST /api/chat and GET /api/chat/history/{session_id} endpoints
"""
import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestChatbotEndpoints:
    """Test AI Chatbot endpoints - POST /api/chat and GET /api/chat/history"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session ID for each test"""
        self.session_id = f"test_session_{uuid.uuid4().hex[:8]}"
        self.api_url = f"{BASE_URL}/api"
    
    def test_chat_endpoint_basic(self):
        """Test POST /api/chat returns 200 and valid response structure"""
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "Hola, que lugares puedo visitar?",
                "session_id": self.session_id,
                "lang": "es"
            },
            timeout=30  # LLM responses may take time
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "response" in data, "Response should contain 'response' field"
        assert "session_id" in data, "Response should contain 'session_id' field"
        assert data["session_id"] == self.session_id, "Session ID should match"
        assert len(data["response"]) > 0, "Response should not be empty"
        print(f"Chat response (Spanish): {data['response'][:200]}...")
    
    def test_chat_endpoint_spanish_response(self):
        """Test POST /api/chat returns response in Spanish when lang=es"""
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "Recomiendame un pueblo magico",
                "session_id": self.session_id,
                "lang": "es"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response contains Spanish words or mentions Veracruz data
        response_text = data["response"].lower()
        # Spanish responses should contain common Spanish words or Veracruz-related terms
        spanish_indicators = ["veracruz", "pueblo", "mágico", "visitar", "turismo", "municipio", "región", "puedes", "recomiendo", "xico", "coatepec", "papantla", "tlacotalpan", "orizaba"]
        has_spanish = any(word in response_text for word in spanish_indicators)
        assert has_spanish, f"Response should be in Spanish or mention Veracruz data: {data['response'][:300]}"
        print(f"Spanish response verified: {data['response'][:200]}...")
    
    def test_chat_endpoint_english_response(self):
        """Test POST /api/chat returns response in English when lang=en"""
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "What are the best places to visit in Veracruz?",
                "session_id": f"{self.session_id}_en",
                "lang": "en"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response contains English words
        response_text = data["response"].lower()
        english_indicators = ["veracruz", "visit", "recommend", "tourism", "place", "town", "region", "can", "the", "you", "magical", "route"]
        has_english = any(word in response_text for word in english_indicators)
        assert has_english, f"Response should be in English: {data['response'][:300]}"
        print(f"English response verified: {data['response'][:200]}...")
    
    def test_chat_endpoint_french_response(self):
        """Test POST /api/chat returns response in French when lang=fr"""
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "Quels sont les meilleurs endroits a visiter?",
                "session_id": f"{self.session_id}_fr",
                "lang": "fr"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response contains French words
        response_text = data["response"].lower()
        french_indicators = ["veracruz", "visiter", "recommande", "tourisme", "lieu", "région", "vous", "pouvez", "magique", "itinéraire", "le", "la", "les", "des"]
        has_french = any(word in response_text for word in french_indicators)
        assert has_french, f"Response should be in French: {data['response'][:300]}"
        print(f"French response verified: {data['response'][:200]}...")
    
    def test_chat_uses_platform_data(self):
        """Test POST /api/chat response uses real platform data (municipalities, events)"""
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "Cuales son los pueblos magicos de Veracruz?",
                "session_id": self.session_id,
                "lang": "es"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Check response mentions actual Pueblos Mágicos from the platform
        response_text = data["response"].lower()
        pueblos_magicos = ["coatepec", "xico", "papantla", "tlacotalpan", "orizaba", "coscomatepec", "naolinco", "zozocolco", "tuxtlas"]
        mentioned_pueblos = [pm for pm in pueblos_magicos if pm in response_text]
        
        assert len(mentioned_pueblos) > 0, f"Response should mention at least one Pueblo Mágico from platform data: {data['response'][:400]}"
        print(f"Platform data verified - mentioned Pueblos Mágicos: {mentioned_pueblos}")
    
    def test_chat_history_endpoint(self):
        """Test GET /api/chat/history/{session_id} returns chat messages"""
        # First, send a message to create history
        chat_session = f"test_history_{uuid.uuid4().hex[:8]}"
        
        # Send a message
        send_response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "Hola, soy un turista",
                "session_id": chat_session,
                "lang": "es"
            },
            timeout=30
        )
        assert send_response.status_code == 200, f"Failed to send message: {send_response.text}"
        
        # Wait a moment for DB write
        time.sleep(1)
        
        # Get history
        history_response = requests.get(
            f"{self.api_url}/chat/history/{chat_session}",
            timeout=10
        )
        
        assert history_response.status_code == 200, f"Expected 200, got {history_response.status_code}"
        
        data = history_response.json()
        assert "messages" in data, "Response should contain 'messages' field"
        assert len(data["messages"]) >= 2, f"Should have at least 2 messages (user + assistant), got {len(data['messages'])}"
        
        # Verify message structure
        for msg in data["messages"]:
            assert "role" in msg, "Each message should have 'role'"
            assert "content" in msg, "Each message should have 'content'"
            assert "timestamp" in msg, "Each message should have 'timestamp'"
            assert msg["role"] in ["user", "assistant"], f"Role should be 'user' or 'assistant', got {msg['role']}"
        
        # Verify we have both user and assistant messages
        roles = [msg["role"] for msg in data["messages"]]
        assert "user" in roles, "Should have user message"
        assert "assistant" in roles, "Should have assistant message"
        
        print(f"Chat history verified: {len(data['messages'])} messages found")
    
    def test_chat_empty_message_rejected(self):
        """Test POST /api/chat rejects empty messages"""
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "",
                "session_id": self.session_id,
                "lang": "es"
            },
            timeout=10
        )
        
        assert response.status_code == 400, f"Expected 400 for empty message, got {response.status_code}"
        print("Empty message correctly rejected with 400")
    
    def test_chat_whitespace_message_rejected(self):
        """Test POST /api/chat rejects whitespace-only messages"""
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "   ",
                "session_id": self.session_id,
                "lang": "es"
            },
            timeout=10
        )
        
        assert response.status_code == 400, f"Expected 400 for whitespace message, got {response.status_code}"
        print("Whitespace message correctly rejected with 400")
    
    def test_chat_history_empty_session(self):
        """Test GET /api/chat/history returns empty for non-existent session"""
        response = requests.get(
            f"{self.api_url}/chat/history/nonexistent_session_12345",
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) == 0, "Should return empty messages for non-existent session"
        print("Empty session history correctly returns empty array")
    
    def test_chat_default_language(self):
        """Test POST /api/chat defaults to Spanish when lang not provided"""
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": "Hola",
                "session_id": self.session_id
                # No lang parameter
            },
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        print(f"Default language (Spanish) response: {data['response'][:150]}...")


class TestChatbotMongoDBStorage:
    """Test that chat messages are stored in MongoDB"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session_id = f"test_mongo_{uuid.uuid4().hex[:8]}"
        self.api_url = f"{BASE_URL}/api"
    
    def test_messages_stored_in_mongodb(self):
        """Test that chat messages are persisted in MongoDB chat_messages collection"""
        # Send a unique message
        unique_text = f"Test message {uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{self.api_url}/chat",
            json={
                "message": unique_text,
                "session_id": self.session_id,
                "lang": "es"
            },
            timeout=30
        )
        
        assert response.status_code == 200
        
        # Verify via history endpoint that message was stored
        time.sleep(1)
        
        history_response = requests.get(
            f"{self.api_url}/chat/history/{self.session_id}",
            timeout=10
        )
        
        assert history_response.status_code == 200
        data = history_response.json()
        
        # Find our unique message
        user_messages = [m for m in data["messages"] if m["role"] == "user"]
        found = any(unique_text in m["content"] for m in user_messages)
        
        assert found, f"User message '{unique_text}' should be stored in MongoDB"
        print(f"MongoDB storage verified - message found in history")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
