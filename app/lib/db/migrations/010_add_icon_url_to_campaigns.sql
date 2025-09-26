-- Add icon_url column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN icon_url VARCHAR(500);

-- Set default icon_url for existing campaigns (using the same as imageUrl initially)
UPDATE campaigns 
SET icon_url = image_url 
WHERE icon_url IS NULL;
