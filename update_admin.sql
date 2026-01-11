UPDATE users 
SET is_admin = 1 
WHERE email = 'wlazovskaya@gmail.com';

SELECT email, is_admin, subscription_tier 
FROM users 
WHERE email = 'wlazovskaya@gmail.com';
