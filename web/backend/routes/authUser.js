const express = require("express");
const { loginUser, singupUser } = require("../controller/authUserController");

const router = express.Router();

router.post("/register", singupUser);
router.post("/signup", singupUser);

router.post("/login", loginUser);

module.exports = router;
