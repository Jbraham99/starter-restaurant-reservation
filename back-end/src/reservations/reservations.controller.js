/**
 * List handler for reservation resources
 */
const { first } = require("../db/connection")
const service = require("./reservations.service")

/**
 * get reservation date
 * get current date
 * if reservation date is in past OR on a tuesday(2) => RETURN ERROR
 */

//helperFunction
function getCurrentDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function dateCompare(reservationDate, currentDate) {
  const res = new Date(reservationDate);
  const curr = new Date(currentDate);
  if (res < curr) {
    return true
  }
  return false
}

async function list(req, res) {
  const {date, mobile_number} = req.query
  if (date) {
  const result = await service.list(date)
  const sorted = result.sort((res1, res2) => {
    const today = new Date();
    const time1 = new Date(today.toDateString() + ' ' + res1.reservation_time);
    const time2 = new Date(today.toDateString() + ' ' + res2.reservation_time);
    return time1 - time2;
  });
  res.json({data: sorted})
  } else if (mobile_number) {
    const reservations = await service.listByNum(mobile_number)
    console.log("MOBILE NUMBER QUERY: ", reservations)
    if (reservations) {
      return res.json({data: reservations})
    }
  } else {
    const result = await service.list(getCurrentDate())
    const sorted = result.sort((res1, res2) => {
      const today = new Date();
      const time1 = new Date(today.toDateString() + ' ' + res1.reservation_time);
      const time2 = new Date(today.toDateString() + ' ' + res2.reservation_time);
      return time1 - time2;
    });
    res.json({data: sorted})    
  }


}

function dataPropertyHas(property) {
  return (req, res, next) => {
    const newReservation = req.body.data
    if (newReservation) {
      const reservationProps = Object.keys(newReservation)
      if (reservationProps.includes(property) && newReservation[property] !== "" && newReservation[property] !== null) {
        res.locals.newReservation = newReservation
        return next()
      }
      return next({
        status: 400,
        message: `table missing ${property} property`
      })
    }
    next({
      status: 400,
      message: "reservation data missing"
    })
  }
}

function ValidReservation(req, res, next) {
  const newReservation = req.body.data;
  if (!newReservation) {
    return next({
      status: 400,
      message: "data missing"
    });
  }
  const { first_name, last_name, mobile_number, reservation_date, reservation_time, people, status } = newReservation;
  if (!first_name) {
    return next({
      status: 400,
      message: "missing field: first_name"
    });
  }
  if (!last_name) {
    return next({
      status: 400,
      message: "missing field: last_name"
    });
  }
  if (!mobile_number) {
    return next({
      status: 400,
      message: "missing field: mobile_number"
    });
  }
  if (!reservation_date) {
    return next({
      status: 400,
      message: "missing field: reservation_date"
    });
  }
  if (isNaN(new Date(reservation_date))) {
    return next({
      status: 400,
      message: "reservation_date not a date"
    })
  }
  if (!reservation_time) {
    return next({
      status: 400,
      message: "missing field: reservation_time"
    });
  }
  if (!people) {
    return next({
      status: 400,
      message: "missing field: people"
    });
  }
  if (typeof people !== "number") {
    return next({
      status: 400,
      message: "Value for the key 'people' must be an integer"
    })
  }
  res.locals.newReservation = newReservation;
  return next();
}

//Function to make sure that the reservations booked during opperation hours
function opperationHours(req, res, next) {
  const {newReservation} = res.locals;
  const time = newReservation.reservation_time;
  if (time < "10:30" || time > "21:30") {
    return next({
      status: 400,
      message: `Invalid reservation_time: ${time}, reserve between 10:30AM and 9:30PM.`
    })

  }
  next()
}
//Function that doesnt' allow booking before current date
function noBeforeCurrentDate(req, res, next) {
  const {newReservation} = res.locals;
  const resDate = newReservation.reservation_date;//reservation date
  // console.log("RESDATE - ", resDate)
  const today = getCurrentDate();
  // console.log("currentDate", today)
  if (dateCompare(resDate, today)) {
    return next({
      status: 400,
      message: "Reservation must be in the future."
    })
  }
  next()
}
//Function that doesn't allow booking on Tuesdays
function closedTuesdays(req, res, next) {
  const {newReservation} = res.locals;//reservation date gotten
  const resDate = new Date(newReservation.reservation_date)
  const dayOfWeek = resDate.getDay()
  if (dayOfWeek === 1) {
    return next({
      status: 400,
      message: "closed on Tuesdays, sorry for the inconvenience."
    })
  }
  next()
}

function checkReservationStatus(req, res, next) {
  const {status} = res.locals.newReservation
  console.log(status)
  if(status === "seated" || status === "finished") {
    return next({
      status: 400,
      message: `reservation is already ${status}`
    })
  }
  next()
}

async function create(req, res, next) {
  const newReservation = req.body.data
  // console.log("NEW RESERVATION: ", newReservation)
  const reservation = await service.create(newReservation)
  res.status(201).json({data: newReservation})
}

async function reservationExists(req, res, next) {
  console.log("TESTING!!!")
  const {reservation_id} = req.params;
  console.log("RESERVATION_ID: ", reservation_id)
  if (!reservation_id) {
    return next({
      status: 404,
      message: "reservation_id needed to find reservation"
    })
  }
  const reservation_number = Number(reservation_id)
  const reservation = await service.read(reservation_number)
  if (!reservation) {
    return next({
      status: 404,
      message: `reservation_id: ${reservation_id} missing`
    })
  }
  if (reservation) {
    res.locals.reservation = reservation
    return next()
  }
}

function validStatus(req, res, next) {
  const {status} = req.body.data
  if (status === "unknown") {
    return next({
      status: 400,
      message: "reservation status unknown"
    })
  }
  next()
}

 function read(req, res) {
  const {reservation} = res.locals
  res.status(200).json({data: reservation})
}

async function destroy(req, res, next) {
  const bodyData = req.body
  // console.log("REQUEST BODY", bodyData)
  const updated = await service.update(bodyData)
  // console.log("updated: ", updated)
  res.status(202).json(updated)
}

async function update(req, res, next) {
  const {reservation} = res.locals
  // console.log("reservation", reservation)
  const {status} = req.body.data
  console.log("STATUS:!! ", status)
  const updatedReservation = {
    ...reservation,
    "status": status
  }
  // console.log("BACKEND UPDATE", updatedReservation)
  const finish = await service.update(updatedReservation)
  res.status(200).json({data: updatedReservation})
}

function isValidTime(time) {
  const parts = time.split(":");
  if (parts.length === 2) {
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    // Check if hours and minutes are valid
    if (!isNaN(hours) && !isNaN(minutes) &&
        hours >= 0 && hours <= 23 &&
        minutes >= 0 && minutes <= 59) {
      return true;
    }
  }
  return false;
}

function ifFinished(req, res, next) {
  const {reservation} = res.locals
  if (reservation.status === "finished") {
    return next({
      status: 400,
      message: "reservation is already finished"
    })
  }
  next()
}

function validChanges(req, res, next) {
  const editData = req.body.data
  if (!editData) {
    return next({
      status: 400,
      message: "edit data missing"
    })
  }
  const {first_name, last_name, mobile_number, reservation_date, reservation_time, people} = editData
  if (!first_name || first_name === "") {
    return next({
      status: 400,
      message: "first_name missing or empty"
    })
  }
  if (!last_name || last_name === "") {
    return next({
      status: 400,
      message: "last_name missing or empty"
    })
  }
  if (!mobile_number || mobile_number === "") {
    return next({
      status: 400,
      message: "mobile_number missing or empty"
    })
  }
  if (!reservation_date || reservation_date === "") {
    return next({
      status: 400,
      message: "reservation_date missing or empty"
    })
  }
  if (isNaN(new Date(reservation_date))) {
    return next({
      status: 400,
      message: "reservation_date must be a date object"
    })
  }
  if (!reservation_time || reservation_time === "") {
    return next({
      status: 400,
      message: "reservation_time missing or empty"
    })
  }
  if (!isValidTime(reservation_time)) {
    return next({
      status: 400,
      message: "reservation_time must be a valid time in the format HH:mm"
    });
  }
  if (!people || people === "") {
    return next({
      status: 400,
      message: "people missing or empty"
    })
  }
  if (typeof people !== "number") {
    return next({
      status: 400,
      message: "people must be a number"
    })
  }
  console.log("EDIT DATA: ", editData)
  next()
}

async function edit(req, res, next) {
  const bodyData = req.body.data
  // console.log("res w/ edits: ", bodyData)
  const update = await service.edit(bodyData)
  res.status(200).json({data: bodyData})
}

module.exports = {
  list,
  create: [
    ValidReservation,
    checkReservationStatus,
    noBeforeCurrentDate,
    closedTuesdays,
    opperationHours,
    create
  ],
  read: [
    reservationExists,
    read
  ],
  update: [
    reservationExists,
    ifFinished,
    validStatus,
    update
  ],
  delete: [
    reservationExists,
    ifFinished,
    destroy
  ],
  edit: [
    reservationExists,
    ifFinished,
    validChanges,
    edit
  ]
};
