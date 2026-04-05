#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class VeracruzContigoAPITester:
    def __init__(self, base_url="https://veracruz-contigo.preview.emergentagent.com"):
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
        
        # Test authenticated endpoints
        if login_success:
            self.test_admin_stats()
        else:
            print("⚠️  Skipping authenticated tests due to login failure")
        
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