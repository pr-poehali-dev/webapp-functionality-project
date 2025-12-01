#!/usr/bin/env python3
"""
Test bcrypt password hashing
"""
import bcrypt

# The password and hash from the database
password = "admin123"
stored_hash = "$2b$10$rW5HAXqXugFqYBVEQNfmVuKqN8YfXKZKBW2fVhZJOEqe4oHKKUJ6W"

print("=" * 60)
print("BCRYPT PASSWORD HASH TESTING")
print("=" * 60)
print(f"\nPassword to test: {password}")
print(f"Stored hash: {stored_hash}")
print(f"\nBcrypt version: {bcrypt.__version__}")

# Test if the stored hash is valid
print("\n" + "-" * 60)
print("TEST 1: Verifying stored hash against password")
print("-" * 60)

try:
    result = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    print(f"Result: {result}")
    
    if result:
        print("✓ SUCCESS: The stored hash is VALID for password 'admin123'")
    else:
        print("✗ FAILED: The stored hash does NOT match password 'admin123'")
except Exception as e:
    print(f"✗ ERROR: {e}")
    result = False

# Generate a new hash
print("\n" + "-" * 60)
print("TEST 2: Generating a NEW hash for password 'admin123'")
print("-" * 60)

try:
    new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_hash_str = new_hash.decode('utf-8')
    print(f"New hash generated: {new_hash_str}")
    
    # Verify the new hash works
    verify_new = bcrypt.checkpw(password.encode('utf-8'), new_hash)
    print(f"Verification of new hash: {verify_new}")
    
    if verify_new:
        print("✓ SUCCESS: New hash verified correctly")
    else:
        print("✗ FAILED: New hash verification failed")
        
except Exception as e:
    print(f"✗ ERROR: {e}")
    new_hash_str = None

# Summary
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

if not result and new_hash_str:
    print("\n⚠️  The stored hash is INVALID!")
    print("\nRECOMMENDATION: Update the database with this new hash:")
    print(f"\nNEW HASH: {new_hash_str}")
    print("\nSQL UPDATE command:")
    print(f"UPDATE users SET password_hash = '{new_hash_str}' WHERE username = 'admin';")
elif result:
    print("\n✓ The stored hash is working correctly. No changes needed.")
else:
    print("\n✗ Unable to generate a valid hash. Check bcrypt installation.")

print("\n" + "=" * 60)
