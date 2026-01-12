-- Migration: Remove extra_services table and update appointment_extra_services to use services
-- Date: 2025
-- Description: Consolidates extra_services into services table

-- Step 1: Add service_id column to appointment_extra_services
ALTER TABLE appointment_extra_services
ADD service_id INT NULL;

-- Step 2: Add foreign key constraint to services
ALTER TABLE appointment_extra_services
ADD CONSTRAINT FK_appointment_extra_services_service 
FOREIGN KEY (service_id) REFERENCES services(id);

-- Step 3: Drop extra_services table (if it exists)
-- Note: Make sure to backup data before running this in production
-- IF EXISTS (SELECT * FROM sys.tables WHERE name = 'extra_services')
-- BEGIN
--     DROP TABLE extra_services;
-- END

-- Note: You may need to manually migrate existing data from extra_services to services
-- before dropping the extra_services table
