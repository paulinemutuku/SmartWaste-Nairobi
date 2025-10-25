const express = require("express");
const router = express.Router();
const mqttController = require("../controller/iotController");

router.get("/subscribe", (req, res) => {
  const latestMqttData = mqttController.getLatestMqttData();

  if (latestMqttData) {
    res.json(latestMqttData);
  } else {
    res.status(404).json({ error: "No MQTT data available" });
  }
});

module.exports = router;
