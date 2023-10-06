const knex = require("../db/connection")

function list(date) {
    return knex("reservations")
    .select("*")
    .where({
        reservation_date: date
    })
    .whereNot({
      status: "finished"
    })
}

function create(newReservation) {
    return knex("reservations")
    .insert(newReservation, "*")
    .then(reservation => reservation[0])
}

function read(reservaiton_id) {
    return knex("reservations")
      .select("*")
      .where({
        reservation_id: reservaiton_id
      })
      .then(reservation => reservation[0])
}

function update(resStatus) {
    return knex("reservations")
      .where({
        reservation_id: resStatus.reservation_id
      })
      .update({
        status: resStatus.status
      })
      .then(updated => updated)
}


function listByNum(number) {
    return knex("reservations")
      .select("*")
      .where("mobile_number", "like",  `%${number}%`)

}

function edit(reservation) {
  return knex("reservations")
    .where({
      reservation_id: reservation.reservation_id
    })
    .update({...reservation})
    .then(res => res[0])
}

module.exports = {
    list,
    create,
    read,
    update,
    listByNum,
    edit
}