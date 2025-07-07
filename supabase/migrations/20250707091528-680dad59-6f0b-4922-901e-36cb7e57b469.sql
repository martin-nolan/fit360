-- Enable leaked password protection to check against HaveIBeenPwned.org
UPDATE auth.config 
SET leaked_password_protection = true;