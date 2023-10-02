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

module.exports = router;
