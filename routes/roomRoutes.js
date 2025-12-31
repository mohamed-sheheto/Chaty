const express = require("express");
const authController = require("../controllers/authController");
const roomController = require("../controllers/roomController");

const router = express.Router();

router.use(authController.protect);

router.route("/").get(roomController.getRooms).post(roomController.createRoom);

router
  .route("/:id")
  .delete(roomController.deleteRoom)
  .get(roomController.getRoom);

router.post("/:id/join", roomController.joinRoom);
router.post("/:id/leave", roomController.leaveRoom);

module.exports = router;
