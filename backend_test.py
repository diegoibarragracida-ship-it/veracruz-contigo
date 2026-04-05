#!/usr/bin/env python3

import requests
import sys
import json
import time
from datetime import datetime

class VeracruzContigoAPITester:
    def __init__(self, base_url="https://explora-veracruz.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def log_result(self, test_name, success, details="", expected=None, actual=None):
        """Log test result with details"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
            if details:
                print(f"   {details}")
        else:
            print(f"❌ {test_name} - FAILED")
            if details:
                print(f"   {details}")
            if expected and actual:
                print(f"   Expected: {expected}, Got: {actual}")
            self.failed_tests.append({
                "test": test_name,
                "details": details,
                "expected": expected,
                "actual": actual
            })

    def test_health_check(self):
        """Test backend health check endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.log_result("Health Check", True, f"Status: {data.get('status', 'unknown')}")
            else:
                self.log_result("Health Check", False, f"Status code: {response.status_code}")
            
            return success
        except Exception as e:
            self.log_result("Health Check", False, f"Error: {str(e)}")
            return False

    def test_municipios_endpoint(self):
        """Test municipios endpoint - should return 199 unique municipalities"""
        try:
            response = self.session.get(f"{self.api_url}/municipios", params={"limit": 300}, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                municipios = data.get('municipios', [])
                total = data.get('total', 0)
                
                # Check if we have the expected number of municipalities
                expected_count = 199  # Based on seeding logic removing duplicates
                actual_count = len(municipios)
                
                if actual_count >= expected_count:
                    self.log_result("Municipios Endpoint", True, 
                                  f"Found {actual_count} municipios (total: {total})")
                else:
                    self.log_result("Municipios Endpoint", False, 
                                  f"Expected at least {expected_count} municipios", 
                                  expected_count, actual_count)
                    success = False
            else:
                self.log_result("Municipios Endpoint", False, f"Status code: {response.status_code}")
            
            return success
        except Exception as e:
            self.log_result("Municipios Endpoint", False, f"Error: {str(e)}")
            return False

    def test_pueblos_magicos(self):
        """Test Pueblos Mágicos filter - should return 9 Pueblos Mágicos"""
        try:
            response = self.session.get(f"{self.api_url}/municipios", 
                                      params={"pueblo_magico": True}, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                pueblos = data.get('municipios', [])
                expected_count = 9
                actual_count = len(pueblos)
                
                if actual_count == expected_count:
                    self.log_result("Pueblos Mágicos Filter", True, 
                                  f"Found {actual_count} Pueblos Mágicos")
                else:
                    self.log_result("Pueblos Mágicos Filter", False, 
                                  f"Expected {expected_count} Pueblos Mágicos", 
                                  expected_count, actual_count)
                    success = False
            else:
                self.log_result("Pueblos Mágicos Filter", False, f"Status code: {response.status_code}")
            
            return success
        except Exception as e:
            self.log_result("Pueblos Mágicos Filter", False, f"Error: {str(e)}")
            return False

    def test_eventos_endpoint(self):
        """Test eventos endpoint - should return 5 sample events"""
        try:
            response = self.session.get(f"{self.api_url}/eventos", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                eventos = data.get('eventos', [])
                expected_count = 5
                actual_count = len(eventos)
                
                if actual_count == expected_count:
                    self.log_result("Eventos Endpoint", True, 
                                  f"Found {actual_count} sample events")
                else:
                    self.log_result("Eventos Endpoint", False, 
                                  f"Expected {expected_count} events", 
                                  expected_count, actual_count)
                    success = False
            else:
                self.log_result("Eventos Endpoint", False, f"Status code: {response.status_code}")
            
            return success
        except Exception as e:
            self.log_result("Eventos Endpoint", False, f"Error: {str(e)}")
            return False

    def test_prestadores_endpoint(self):
        """Test prestadores endpoint - should return 4 sample verified providers"""
        try:
            response = self.session.get(f"{self.api_url}/prestadores", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                prestadores = data.get('prestadores', [])
                expected_count = 4
                actual_count = len(prestadores)
                
                if actual_count == expected_count:
                    verified_count = sum(1 for p in prestadores if p.get('verificado', False))
                    self.log_result("Prestadores Endpoint", True, 
                                  f"Found {actual_count} prestadores ({verified_count} verified)")
                else:
                    self.log_result("Prestadores Endpoint", False, 
                                  f"Expected {expected_count} prestadores", 
                                  expected_count, actual_count)
                    success = False
            else:
                self.log_result("Prestadores Endpoint", False, f"Status code: {response.status_code}")
            
            return success
        except Exception as e:
            self.log_result("Prestadores Endpoint", False, f"Error: {str(e)}")
            return False

    def test_super_admin_login(self):
        """Test Super Admin login with provided credentials"""
        try:
            login_data = {
                "email": "superadmin@veracruzcontigo.gob.mx",
                "password": "VeracruzAdmin2024!"
            }
            
            response = self.session.post(f"{self.api_url}/auth/login", 
                                       json=login_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                user_role = data.get('rol')
                if user_role == 'superadmin':
                    self.log_result("Super Admin Login", True, 
                                  f"Logged in as {data.get('nombre', 'Unknown')} (role: {user_role})")
                    # Store cookies for subsequent requests
                    self.session.cookies.update(response.cookies)
                else:
                    self.log_result("Super Admin Login", False, 
                                  f"Expected superadmin role", 'superadmin', user_role)
                    success = False
            else:
                self.log_result("Super Admin Login", False, 
                              f"Status code: {response.status_code}, Response: {response.text}")
            
            return success
        except Exception as e:
            self.log_result("Super Admin Login", False, f"Error: {str(e)}")
            return False

    def test_admin_stats(self):
        """Test admin stats endpoint (requires authentication)"""
        try:
            response = self.session.get(f"{self.api_url}/admin/stats", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.log_result("Admin Stats", True, 
                              f"Retrieved stats: {json.dumps(data, indent=2)}")
            else:
                self.log_result("Admin Stats", False, 
                              f"Status code: {response.status_code}, Response: {response.text}")
            
            return success
        except Exception as e:
            self.log_result("Admin Stats", False, f"Error: {str(e)}")
            return False

    def test_search_endpoint(self):
        """Test search endpoint with 'Veracruz' query"""
        try:
            response = self.session.get(f"{self.api_url}/search", 
                                      params={"q": "Veracruz"}, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                results_count = len(data.get('results', []))
                self.log_result("Search Endpoint", True, 
                              f"Search for 'Veracruz' returned {results_count} results")
            else:
                self.log_result("Search Endpoint", False, f"Status code: {response.status_code}")
            
            return success
        except Exception as e:
            self.log_result("Search Endpoint", False, f"Error: {str(e)}")
            return False

    def test_analytics_track_endpoint(self):
        """Test POST /api/analytics/track endpoint"""
        try:
            # Get a municipio ID for testing
            municipios_response = self.session.get(f"{self.api_url}/municipios?limit=1", timeout=10)
            if municipios_response.status_code != 200:
                self.log_result("Analytics Track Setup", False, "Could not get municipio for testing")
                return False
            
            municipios_data = municipios_response.json()
            if not municipios_data.get('municipios'):
                self.log_result("Analytics Track Setup", False, "No municipios available for testing")
                return False
            
            municipio_id = municipios_data['municipios'][0]['id']
            
            # Test valid tracking request
            track_data = {
                "event_type": "view",
                "target_type": "municipio", 
                "target_id": municipio_id
            }
            
            response = self.session.post(f"{self.api_url}/analytics/track", json=track_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.log_result("Analytics Track - Valid Request", True, f"Status: {data.get('status')}")
            else:
                self.log_result("Analytics Track - Valid Request", False, f"Status code: {response.status_code}")
            
            # Test invalid request (missing fields)
            invalid_data = {"event_type": "view"}  # Missing target_type and target_id
            response2 = self.session.post(f"{self.api_url}/analytics/track", json=invalid_data, timeout=10)
            invalid_success = response2.status_code == 400
            
            if invalid_success:
                self.log_result("Analytics Track - Invalid Request", True, "Correctly rejected invalid data")
            else:
                self.log_result("Analytics Track - Invalid Request", False, f"Expected 400, got {response2.status_code}")
            
            return success and invalid_success
            
        except Exception as e:
            self.log_result("Analytics Track Endpoint", False, f"Error: {str(e)}")
            return False

    def test_analytics_search_endpoint(self):
        """Test POST /api/analytics/search endpoint"""
        try:
            # Test valid search tracking
            search_data = {"term": "veracruz turismo"}
            response = self.session.post(f"{self.api_url}/analytics/search", json=search_data, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.log_result("Analytics Search - Valid Term", True, f"Status: {data.get('status')}")
            else:
                self.log_result("Analytics Search - Valid Term", False, f"Status code: {response.status_code}")
            
            # Test short search term (should be ignored)
            short_search_data = {"term": "a"}
            response2 = self.session.post(f"{self.api_url}/analytics/search", json=short_search_data, timeout=10)
            short_success = response2.status_code == 200
            
            if short_success:
                data2 = response2.json()
                if data2.get('status') == 'ignored':
                    self.log_result("Analytics Search - Short Term", True, "Short term correctly ignored")
                else:
                    self.log_result("Analytics Search - Short Term", False, f"Expected 'ignored', got {data2.get('status')}")
            else:
                self.log_result("Analytics Search - Short Term", False, f"Status code: {response2.status_code}")
            
            return success and short_success
            
        except Exception as e:
            self.log_result("Analytics Search Endpoint", False, f"Error: {str(e)}")
            return False

    def test_global_analytics_endpoint(self):
        """Test GET /api/analytics/global endpoint (requires admin auth)"""
        try:
            # Check if we have admin session (cookies from login)
            if 'access_token' not in self.session.cookies:
                self.log_result("Global Analytics", False, "No admin session available")
                return False
            
            response = self.session.get(f"{self.api_url}/analytics/global?days=7", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Check required fields
                required_fields = ['period_days', 'totals', 'top_municipios', 'views_by_day']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("Global Analytics - Structure", True, "All required fields present")
                else:
                    self.log_result("Global Analytics - Structure", False, f"Missing fields: {missing_fields}")
                
                # Check totals structure
                totals = data.get('totals', {})
                if 'views' in totals and 'contacts' in totals and 'searches' in totals:
                    self.log_result("Global Analytics - Totals", True, f"Views: {totals['views']}, Contacts: {totals['contacts']}, Searches: {totals['searches']}")
                else:
                    self.log_result("Global Analytics - Totals", False, "Missing totals fields")
            else:
                self.log_result("Global Analytics", False, f"Status code: {response.status_code}")
            
            # Test without authentication (should fail) - create new session without cookies
            no_auth_session = requests.Session()
            response_no_auth = no_auth_session.get(f"{self.api_url}/analytics/global", timeout=10)
            no_auth_success = response_no_auth.status_code == 401
            
            if no_auth_success:
                self.log_result("Global Analytics - No Auth", True, "Correctly rejected unauthenticated request")
            else:
                self.log_result("Global Analytics - No Auth", False, f"Expected 401, got {response_no_auth.status_code}")
            
            return success and no_auth_success
            
        except Exception as e:
            self.log_result("Global Analytics Endpoint", False, f"Error: {str(e)}")
            return False

    def test_municipio_analytics_endpoint(self):
        """Test GET /api/analytics/municipio/{id} endpoint"""
        try:
            # Check if we have admin session (cookies from login)
            if 'access_token' not in self.session.cookies:
                self.log_result("Municipio Analytics", False, "No admin session available")
                return False
            
            # Get a municipio ID for testing
            municipios_response = self.session.get(f"{self.api_url}/municipios?limit=1", timeout=10)
            if municipios_response.status_code != 200:
                self.log_result("Municipio Analytics Setup", False, "Could not get municipio for testing")
                return False
            
            municipios_data = municipios_response.json()
            if not municipios_data.get('municipios'):
                self.log_result("Municipio Analytics Setup", False, "No municipios available for testing")
                return False
            
            municipio_id = municipios_data['municipios'][0]['id']
            
            response = self.session.get(f"{self.api_url}/analytics/municipio/{municipio_id}?days=30", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Check required fields
                required_fields = ['municipio_id', 'municipio_nombre', 'total_views', 'views_by_day']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("Municipio Analytics - Structure", True, f"Analytics for {data.get('municipio_nombre')}")
                else:
                    self.log_result("Municipio Analytics - Structure", False, f"Missing fields: {missing_fields}")
            else:
                self.log_result("Municipio Analytics", False, f"Status code: {response.status_code}")
            
            # Test with invalid municipio ID
            response_invalid = self.session.get(f"{self.api_url}/analytics/municipio/invalid-id", timeout=10)
            invalid_success = response_invalid.status_code == 404
            
            if invalid_success:
                self.log_result("Municipio Analytics - Invalid ID", True, "Correctly rejected invalid municipio ID")
            else:
                self.log_result("Municipio Analytics - Invalid ID", False, f"Expected 404, got {response_invalid.status_code}")
            
            return success and invalid_success
            
        except Exception as e:
            self.log_result("Municipio Analytics Endpoint", False, f"Error: {str(e)}")
            return False

    def test_analytics_integration_flow(self):
        """Test complete analytics tracking flow"""
        try:
            # Get test data
            municipios_response = self.session.get(f"{self.api_url}/municipios?limit=1", timeout=10)
            if municipios_response.status_code != 200:
                self.log_result("Analytics Integration Setup", False, "Could not get test data")
                return False
            
            municipios_data = municipios_response.json()
            if not municipios_data.get('municipios'):
                self.log_result("Analytics Integration Setup", False, "No test data available")
                return False
            
            municipio_id = municipios_data['municipios'][0]['id']
            
            # Track some events
            events_tracked = 0
            
            # Track municipio views
            for i in range(3):
                track_data = {
                    "event_type": "view",
                    "target_type": "municipio",
                    "target_id": municipio_id
                }
                response = self.session.post(f"{self.api_url}/analytics/track", json=track_data, timeout=10)
                if response.status_code == 200:
                    events_tracked += 1
            
            # Track search
            search_data = {"term": "integration test search"}
            search_response = self.session.post(f"{self.api_url}/analytics/search", json=search_data, timeout=10)
            if search_response.status_code == 200:
                events_tracked += 1
            
            # Wait a moment for data processing
            time.sleep(2)
            
            # Verify data in analytics (if admin session available)
            if 'access_token' in self.session.cookies:
                analytics_response = self.session.get(f"{self.api_url}/analytics/global?days=1", timeout=10)
                
                if analytics_response.status_code == 200:
                    analytics_data = analytics_response.json()
                    totals = analytics_data.get('totals', {})
                    
                    if totals.get('views', 0) > 0:
                        self.log_result("Analytics Integration - Views", True, f"Views tracked: {totals['views']}")
                    else:
                        self.log_result("Analytics Integration - Views", False, "No views found in analytics")
                    
                    if totals.get('searches', 0) > 0:
                        self.log_result("Analytics Integration - Searches", True, f"Searches tracked: {totals['searches']}")
                    else:
                        self.log_result("Analytics Integration - Searches", False, "No searches found in analytics")
                else:
                    self.log_result("Analytics Integration - Verification", False, "Could not verify tracked data")
            
            success = events_tracked >= 4  # 3 views + 1 search
            self.log_result("Analytics Integration Flow", success, f"Tracked {events_tracked}/4 events")
            return success
            
        except Exception as e:
            self.log_result("Analytics Integration Flow", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Veracruz Contigo Backend API Tests")
        print("=" * 60)
        
        # Test basic endpoints first
        self.test_health_check()
        self.test_municipios_endpoint()
        self.test_pueblos_magicos()
        self.test_eventos_endpoint()
        self.test_prestadores_endpoint()
        
        # Test authentication
        login_success = self.test_super_admin_login()
        
        # Test analytics endpoints (focus of this testing session)
        print("\n🔍 ANALYTICS SYSTEM TESTS")
        print("-" * 40)
        self.test_analytics_track_endpoint()
        self.test_analytics_search_endpoint()
        
        # Test authenticated analytics endpoints
        if login_success:
            self.test_global_analytics_endpoint()
            self.test_municipio_analytics_endpoint()
            self.test_analytics_integration_flow()
            self.test_admin_stats()
        else:
            print("⚠️  Skipping authenticated analytics tests due to login failure")
        
        # Test search
        self.test_search_endpoint()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = VeracruzContigoAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())