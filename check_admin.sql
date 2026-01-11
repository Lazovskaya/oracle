-- Check if admin user exists and verify is_admin flag
SELECT email, is_admin, subscription_tier FROM users WHERE email = 'admin@go.go';
