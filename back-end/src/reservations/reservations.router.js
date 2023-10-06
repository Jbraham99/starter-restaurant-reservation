/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed")

router.route("/:reservation_id/status").delete(controller.delete).put(controller.update);

router.route("/:reservation_id/edit").get(controller.read)

router.route("/:reservation_id").get(controller.read).put(controller.edit)

router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed)

module.exports = router;