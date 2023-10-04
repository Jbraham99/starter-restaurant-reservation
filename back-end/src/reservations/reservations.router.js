/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router({mergeParams: true});
const controller = require("./reservations.controller");

router.route("/").get(controller.list);

router.route("/new").post(controller.create)

router.route("/:reservation_id/seat").get(controller.read)

router.route("/:reservation_id/status").delete(controller.delete).put(controller.update);

router.route("/:reservation_id/edit").get(controller.read).put(controller.edit)

module.exports = router;
