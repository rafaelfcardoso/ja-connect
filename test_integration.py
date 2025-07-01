#!/usr/bin/env python3
"""
Quick test script to verify the complete integration works.
"""

import sys
import os
import json
import requests

# Test the API endpoints
API_BASE = "http://localhost:8000"

def test_health():
    """Test the health endpoint."""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed: {data['active_products']} active products")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_products():
    """Test the products endpoint."""
    print("\n🔍 Testing products endpoint...")
    try:
        response = requests.get(f"{API_BASE}/api/products", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print(f"✓ Products retrieved: {data['count']} products")
                # Show first product as sample
                if data['products']:
                    product = data['products'][0]
                    print(f"   Sample: {product['nome'][:50]}...")
                return True
            else:
                print(f"❌ Products request failed: {data}")
                return False
        else:
            print(f"❌ Products request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Products request error: {e}")
        return False

def test_frontend():
    """Test if frontend is accessible."""
    print("\n🔍 Testing frontend accessibility...")
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✓ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def main():
    print("🚀 JA Distribuidora Integration Test")
    print("=" * 50)
    
    # Test API
    health_ok = test_health()
    products_ok = test_products()
    frontend_ok = test_frontend()
    
    print("\n📋 Test Summary:")
    print(f"   API Health: {'✓' if health_ok else '❌'}")
    print(f"   Products API: {'✓' if products_ok else '❌'}")
    print(f"   Frontend: {'✓' if frontend_ok else '❌'}")
    
    if all([health_ok, products_ok, frontend_ok]):
        print("\n🎉 All tests passed! Integration is working correctly.")
        print("\n📱 Next steps:")
        print("   1. Open http://localhost:5173 to access the frontend")
        print("   2. Navigate to 'Catálogo' to see the real product data")
        print("   3. Select products and test catalog generation")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()