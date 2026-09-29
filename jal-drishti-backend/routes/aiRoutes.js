const express = require('express');
const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { problem } = req.body;
  
  if (!problem) {
    return res.status(400).json({ error: "Problem description is required" });
  }

  // Simulate AI processing delay (1.5 seconds) to make it feel real
  setTimeout(() => {
    let solution = "";
    const lowercaseProblem = problem.toLowerCase();

    // Keyword-based simulated AI logic
    if (lowercaseProblem.includes('ndvi') || lowercaseProblem.includes('vegetation')) {
      solution = "🔹 **Diagnostic Analysis:** The drop in NDVI suggests a localized failure in soil moisture retention.\n\n🔹 **Recommended Action:**\n1. Dispatch a field team to verify structural integrity of nearby check dams.\n2. Cross-reference with SRISHTI 30m resolution data for illegal water diversion.\n3. Recommend localized desilting of the nearest farm pond to increase percolation.";
    } 
    else if (lowercaseProblem.includes('pond') || lowercaseProblem.includes('dam')) {
      solution = "🔹 **Diagnostic Analysis:** Potential structural anomaly detected in the watershed asset.\n\n🔹 **Recommended Action:**\n1. Review the latest uploaded Bhuvan Drishti geo-tagged images for cracks or overflow.\n2. Compare pre-monsoon and post-monsoon NDWI (Water Index) to check for leakage.\n3. Schedule immediate maintenance if integrity score drops below 60%.";
    } 
    else {
      solution = "🔹 **Diagnostic Analysis:** General environmental stress detected in the queried sector.\n\n🔹 **Recommended Action:**\n1. Monitor multi-temporal satellite imagery for the next 15 days.\n2. Integrate localized rainfall data to determine if the anomaly is climate-driven or structural.\n3. Alert the local Gram Panchayat for a manual ground-truth survey.";
    }

    res.json({ solution });
  }, 1500);
});

module.exports = router;