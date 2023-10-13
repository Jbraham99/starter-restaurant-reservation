const router = require("express").Router({mergeParams: true})
const reservationsRouter = require("../reservations/reservations.router")
const controller = require("./tables.controller")

router.route("/:table_id/seat").put(controller.update).delete(controller.delete)

router.route("/").get(controller.list).post(controller.create)

module.exports = router