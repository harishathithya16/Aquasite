export const interventions = [
  {
    id: 1,
    type: "Check Dam",
    status: "Verified",
    lat: 18.5204,
    lng: 73.8567, // Pune region dummy data
    ndviChange: "+12%",
    dateUploaded: "2026-08-15",
    integrityScore: 94,
    imageUrl: "https://images.unsplash.com/photo-1544253303-34e83f0f70f8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    type: "Farm Pond",
    status: "Flagged",
    lat: 18.5314,
    lng: 73.8456,
    ndviChange: "-2%",
    dateUploaded: "2026-08-20",
    integrityScore: 45,
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    type: "Afforestation",
    status: "Verified",
    lat: 18.5100,
    lng: 73.8600,
    ndviChange: "+18%",
    dateUploaded: "2026-09-01",
    integrityScore: 98,
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80"
  }
];

export const ndviTrendData = [
  { month: 'Jan', ndvi: 0.2, ndwi: 0.1 },
  { month: 'Mar', ndvi: 0.3, ndwi: 0.2 },
  { month: 'May', ndvi: 0.2, ndwi: 0.1 },
  { month: 'Jul', ndvi: 0.5, ndwi: 0.6 }, // Monsoon spike
  { month: 'Sep', ndvi: 0.7, ndwi: 0.5 },
];