-- Run this in pgAdmin or psql to setup the database
USE jaldrishti;

CREATE TABLE interventions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    lat DECIMAL(10, 6) NOT NULL,
    lng DECIMAL(10, 6) NOT NULL,
    ndvi_change VARCHAR(10),
    date_uploaded DATE DEFAULT (CURRENT_DATE),
    integrity_score INTEGER,
    image_url TEXT
);

-- Insert dummy data to match your React frontend
INSERT INTO interventions (type, status, lat, lng, ndvi_change, date_uploaded, integrity_score, image_url)
VALUES 
('Check Dam', 'Verified', 18.5204, 73.8567, '+12%', '2026-08-15', 94, 'https://images.unsplash.com/photo-1544253303-34e83f0f70f8?auto=format&fit=crop&w=400&q=80'),
('Farm Pond', 'Flagged', 18.5314, 73.8456, '-2%', '2026-08-20', 45, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'),
('Afforestation', 'Verified', 18.5100, 73.8600, '+18%', '2026-09-01', 98, 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80');