"""
Test Iteration 3 Features:
- Municipality photos and content (seed_municipio_photos_and_content)
- Orizaba complete data (prestadores, events, encargado)
- Notifications system for encargados
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
SUPERADMIN_EMAIL = "superadmin@veracruzcontigo.gob.mx"
SUPERADMIN_PASSWORD = "VeracruzAdmin2024!"
ENCARGADO_EMAIL = "encargado.orizaba@veracruzcontigo.gob.mx"
ENCARGADO_PASSWORD = "Orizaba2024!"


class TestMunicipioPhotosAndContent:
    """Test municipality photos and content seeding"""
    
    def test_pueblos_magicos_have_photos(self):
        """GET /api/municipios?pueblo_magico=true should return municipalities with foto_portada_url"""
        response = requests.get(f"{BASE_URL}/api/municipios", params={"pueblo_magico": True})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "municipios" in data, "Response should have 'municipios' key"
        
        municipios = data["municipios"]
        assert len(municipios) > 0, "Should have at least one Pueblo Mágico"
        
        # Check that at least some have foto_portada_url
        with_photos = [m for m in municipios if m.get("foto_portada_url")]
        print(f"Found {len(with_photos)} Pueblos Mágicos with photos out of {len(municipios)}")
        assert len(with_photos) > 0, "At least some Pueblos Mágicos should have photos"
        
        # Check specific municipalities
        names_with_photos = [m["nombre"] for m in with_photos]
        print(f"Municipalities with photos: {names_with_photos}")
    
    def test_orizaba_has_complete_data(self):
        """GET /api/municipios/orizaba should return complete data"""
        response = requests.get(f"{BASE_URL}/api/municipios/orizaba")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        orizaba = response.json()
        
        # Check required fields
        assert orizaba.get("nombre") == "Orizaba", "Should be Orizaba"
        assert orizaba.get("foto_portada_url"), "Should have foto_portada_url"
        assert orizaba.get("descripcion"), "Should have descripcion"
        assert orizaba.get("historia"), "Should have historia"
        assert orizaba.get("que_hacer"), "Should have que_hacer list"
        assert orizaba.get("clima"), "Should have clima"
        assert orizaba.get("altitud"), "Should have altitud"
        assert orizaba.get("como_llegar"), "Should have como_llegar"
        assert orizaba.get("tags"), "Should have tags"
        assert orizaba.get("fotos"), "Should have fotos gallery"
        
        # Validate que_hacer is a list with items
        que_hacer = orizaba.get("que_hacer", [])
        assert isinstance(que_hacer, list), "que_hacer should be a list"
        assert len(que_hacer) >= 5, f"que_hacer should have at least 5 items, got {len(que_hacer)}"
        
        # Validate fotos gallery
        fotos = orizaba.get("fotos", [])
        assert isinstance(fotos, list), "fotos should be a list"
        assert len(fotos) >= 5, f"fotos should have at least 5 photos, got {len(fotos)}"
        
        # Validate tags
        tags = orizaba.get("tags", [])
        assert isinstance(tags, list), "tags should be a list"
        assert len(tags) >= 3, f"tags should have at least 3 items, got {len(tags)}"
        
        print(f"Orizaba data validated:")
        print(f"  - Description length: {len(orizaba.get('descripcion', ''))}")
        print(f"  - History length: {len(orizaba.get('historia', ''))}")
        print(f"  - que_hacer items: {len(que_hacer)}")
        print(f"  - fotos count: {len(fotos)}")
        print(f"  - tags: {tags}")
        
        return orizaba.get("id")


class TestOrizabaPrestadores:
    """Test Orizaba prestadores (service providers)"""
    
    def test_orizaba_has_prestadores(self):
        """GET /api/prestadores?municipio_id={orizaba_id} should return 4 prestadores"""
        # First get Orizaba ID
        orizaba_res = requests.get(f"{BASE_URL}/api/municipios/orizaba")
        assert orizaba_res.status_code == 200
        orizaba_id = orizaba_res.json().get("id")
        assert orizaba_id, "Orizaba should have an ID"
        
        # Get prestadores
        response = requests.get(f"{BASE_URL}/api/prestadores", params={"municipio_id": orizaba_id})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        prestadores = data.get("prestadores", [])
        
        print(f"Found {len(prestadores)} prestadores for Orizaba")
        
        # Should have 4 prestadores
        assert len(prestadores) >= 4, f"Expected at least 4 prestadores, got {len(prestadores)}"
        
        # Validate prestador structure
        for p in prestadores:
            assert p.get("nombre"), "Prestador should have nombre"
            assert p.get("tipo"), "Prestador should have tipo"
            assert p.get("municipio_id") == orizaba_id, "Prestador should belong to Orizaba"
            print(f"  - {p.get('nombre')} ({p.get('tipo')})")


class TestOrizabaEventos:
    """Test Orizaba events"""
    
    def test_orizaba_has_eventos(self):
        """GET /api/eventos?municipio_id={orizaba_id} should return 2 events"""
        # First get Orizaba ID
        orizaba_res = requests.get(f"{BASE_URL}/api/municipios/orizaba")
        assert orizaba_res.status_code == 200
        orizaba_id = orizaba_res.json().get("id")
        assert orizaba_id, "Orizaba should have an ID"
        
        # Get eventos
        response = requests.get(f"{BASE_URL}/api/eventos", params={"municipio_id": orizaba_id})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        eventos = data.get("eventos", [])
        
        print(f"Found {len(eventos)} eventos for Orizaba")
        
        # Should have 2 eventos
        assert len(eventos) >= 2, f"Expected at least 2 eventos, got {len(eventos)}"
        
        # Validate evento structure
        for e in eventos:
            assert e.get("nombre"), "Evento should have nombre"
            assert e.get("fecha_inicio"), "Evento should have fecha_inicio"
            assert e.get("municipio_id") == orizaba_id, "Evento should belong to Orizaba"
            print(f"  - {e.get('nombre')} ({e.get('fecha_inicio')})")


class TestEncargadoOrizabaAuth:
    """Test Encargado Orizaba authentication"""
    
    def test_encargado_login(self):
        """POST /api/auth/login with encargado credentials should work"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ENCARGADO_EMAIL,
            "password": ENCARGADO_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}. Response: {response.text}"
        
        user = response.json()
        assert user.get("email") == ENCARGADO_EMAIL, "Email should match"
        assert user.get("rol") == "encargado", f"Role should be encargado, got {user.get('rol')}"
        assert user.get("municipio_id"), "Should have municipio_id assigned"
        
        print(f"Encargado login successful:")
        print(f"  - Name: {user.get('nombre')}")
        print(f"  - Role: {user.get('rol')}")
        print(f"  - Municipio ID: {user.get('municipio_id')}")
        
        return session, user
    
    def test_encargado_can_access_me(self):
        """GET /api/auth/me should return encargado data"""
        session = requests.Session()
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ENCARGADO_EMAIL,
            "password": ENCARGADO_PASSWORD
        })
        assert login_res.status_code == 200
        
        # Access /auth/me
        me_res = session.get(f"{BASE_URL}/api/auth/me")
        assert me_res.status_code == 200, f"Expected 200, got {me_res.status_code}"
        
        user = me_res.json()
        assert user.get("rol") == "encargado"
        print(f"Auth/me returned: {user.get('nombre')} ({user.get('rol')})")


class TestNotificationsSystem:
    """Test notifications system for encargados"""
    
    def test_notifications_endpoint_requires_auth(self):
        """GET /api/notifications should require authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_encargado_can_get_notifications(self):
        """GET /api/notifications should work for authenticated encargado"""
        session = requests.Session()
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ENCARGADO_EMAIL,
            "password": ENCARGADO_PASSWORD
        })
        assert login_res.status_code == 200
        
        # Get notifications
        notif_res = session.get(f"{BASE_URL}/api/notifications")
        assert notif_res.status_code == 200, f"Expected 200, got {notif_res.status_code}"
        
        notifications = notif_res.json()
        assert isinstance(notifications, list), "Notifications should be a list"
        
        print(f"Found {len(notifications)} notifications for encargado")
        for n in notifications[:5]:  # Show first 5
            print(f"  - {n.get('titulo')} (leida: {n.get('leida')})")
    
    def test_mark_notification_read_requires_auth(self):
        """PUT /api/notifications/{id}/read should require authentication"""
        response = requests.put(f"{BASE_URL}/api/notifications/fake-id/read")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"


class TestSuperAdminAuth:
    """Test Super Admin authentication"""
    
    def test_superadmin_login(self):
        """POST /api/auth/login with superadmin credentials should work"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}. Response: {response.text}"
        
        user = response.json()
        assert user.get("email") == SUPERADMIN_EMAIL, "Email should match"
        assert user.get("rol") == "superadmin", f"Role should be superadmin, got {user.get('rol')}"
        
        print(f"SuperAdmin login successful:")
        print(f"  - Name: {user.get('nombre')}")
        print(f"  - Role: {user.get('rol')}")
        
        return session, user
    
    def test_superadmin_can_trigger_spike_check(self):
        """POST /api/admin/check-spikes should work for superadmin"""
        session = requests.Session()
        login_res = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": SUPERADMIN_EMAIL,
            "password": SUPERADMIN_PASSWORD
        })
        assert login_res.status_code == 200
        
        # Trigger spike check
        spike_res = session.post(f"{BASE_URL}/api/admin/check-spikes")
        assert spike_res.status_code == 200, f"Expected 200, got {spike_res.status_code}"
        
        data = spike_res.json()
        assert "spikes_detected" in data, "Response should have spikes_detected"
        print(f"Spike check result: {data.get('spikes_detected')} spikes detected")


class TestHomepageMunicipios:
    """Test homepage municipality data"""
    
    def test_homepage_municipios_have_photos(self):
        """GET /api/municipios with estado=publicado should return municipalities with photos"""
        response = requests.get(f"{BASE_URL}/api/municipios", params={"estado": "publicado", "limit": 10})
        assert response.status_code == 200
        
        data = response.json()
        municipios = data.get("municipios", [])
        
        # Check how many have photos
        with_photos = [m for m in municipios if m.get("foto_portada_url")]
        print(f"Homepage municipios: {len(with_photos)}/{len(municipios)} have photos")
        
        # List them
        for m in municipios[:10]:
            has_photo = "✓" if m.get("foto_portada_url") else "✗"
            print(f"  {has_photo} {m.get('nombre')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
