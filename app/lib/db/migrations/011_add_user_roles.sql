-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'investor');

-- Add role column to users table
ALTER TABLE "User" 
ADD COLUMN role user_role DEFAULT 'investor';

-- Set first user as admin (assuming user with id 1 is admin)
UPDATE "User" 
SET role = 'admin' 
WHERE id = 1;
