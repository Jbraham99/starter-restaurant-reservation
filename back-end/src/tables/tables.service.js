const knex = require("../db/connection")

function create(newTable) {
    return knex("tables")
      .insert(newTable)
      .returning("*")
}

function list() {
    return knex("tables")
      .select("*")
      .orderBy("table_name", "asc")
}

function read(tableId) {
  return knex("tables")
    .select("*")
    .where({
      "table_id": tableId
    })
    .then(table => table[0])
}

function update(newTable) {
  return knex("tables")
    .select("*")
    .where({
      "table_id": newTable.table_id
    })
    .update(newTable, "*")
}

function destroy(table) {
  return knex("reservations")
    .where({
      "reservation_id": table.reservation_id
    })
    .update({
      "status": table.status
    })
}

//RESERVATIONS
function updateReservation(reservation) {
  return knex("reservations")
    .where({
      "reservation_id": reservation.reservation_id
    })
    .update({
      status: reservation.status
    })
}
function reservation(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({
      "reservation_id": reservation_id
    })
    .then(reservation => reservation[0])
}
module.exports = {
    list,
    create,
    read,
    update,
    destroy,
    reservation,
    updateReservation
}