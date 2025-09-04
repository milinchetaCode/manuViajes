const express = require("express");
const router = express.Router();
const {
  loadPackagesJSON,
  loadDestacadosJSON,
} = require("../services/gistStorage");

// HOME PAGE
router.get("/", async (req, res) => {
  try {
    const packagesObj = await loadPackagesJSON();
    const events = await loadDestacadosJSON();

    // Convert object to array
    const packages = Object.keys(packagesObj).map((key) => ({
      id: key,
      ...packagesObj[key],
    }));

    res.render("index", {
      packages,
      events,
    });
  } catch (err) {
    console.error("Error loading data!", err);
    res.status(500).send("Error loading site data");
  }
});

module.exports = router;
