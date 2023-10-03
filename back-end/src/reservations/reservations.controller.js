/**
 * List handler for reservation resources
 */
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

/**
 * async function list(req, res) {
  const { date, mobile_number } = req.query;

  try {
    if (date) {
      // If 'date' query parameter is present, list reservations for that date
      const result = await service.list(date);
      const sorted = result.sort((res1, res2) => {
        const today = new Date();
        const time1 = new Date(today.toDateString() + ' ' + res1.reservation_time);
        const time2 = new Date(today.toDateString() + ' ' + res2.reservation_time);
        return time1 - time2;
      });
      res.json({ data: sorted });
    } else if (mobile_number) {
      // If 'mobile_number' query parameter is present, list reservations by mobile number
      const reservations = await service.listByNum(mobile_number);
      if (reservations) {
        res.json(reservations);
      } else {
        res.status(404).json({ error: 'No reservations found for the provided mobile number.' });
      }
    } else {
      // If neither 'date' nor 'mobile_number' query parameters are present,
      // list reservations for the current date as a fallback
      const result = await service.list(getCurrentDate());
      const sorted = result.sort((res1, res2) => {
        const today = new Date();
        const time1 = new Date(today.toDateString() + ' ' + res1.reservation_time);
        const time2 = new Date(today.toDateString() + ' ' + res2.reservation_time);
        return time1 - time2;
      });
      res.json({ data: sorted });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
}
 */

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
    if (reservations) {
      return res.json(reservations)
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

const validResProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status"
]
function ValidReservation(req, res, next) {
  const newReservation = req.body;
  if (newReservation) {
  const invalidProperties = Object.keys(newReservation).filter((key) => !validResProperties.includes(key));
  if (invalidProperties.length) {
    return next({
      status: 400,
      message: `Invalid reservation field(s): ${invalidProperties.join(", ")}`
    })
  }
  res.locals.newReservation = newReservation
  next()  
  }

}

//Function to make sure that the reservations booked during opperation hours
function opperationHours(req, res, next) {
  const {newReservation} = res.locals;
  const time = newReservation.reservation_time;
  if (time < "10:30" || time > "21:30") {
    return next({
      status: 400,
      message: `Invalid time: ${time}, reserve between 10:30AM and 9:30PM.`
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
      message: "Reservation must be on or after current date."
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
      message: "Closed on Tuesdays, sorry for the inconvenience."
    })
  }
  next()
}

async function create(req, res, next) {
  const {newReservation} = res.locals
  const reservation = await service.create(newReservation)
  res.status(201).json({data: reservation})
}

async function reservationExists(req, res, next) {
  const {reservation_id} = req.params;
  const reservation_number = Number(reservation_id)
  const reservation = await service.read(reservation_number)
  if (reservation) {
    res.locals.reservation = reservation
    return next()
  }
  next({
    status: 404,
    message: `Reservation with id: ${reservation_id} not found.`
  })
}

 function read(req, res) {
  const {reservation} = res.locals
  res.status(200).json({data: reservation[0]})
}

async function destroy(req, res, next) {
  const bodyData = req.body
  console.log("REQUEST BODY", bodyData)
  const updated = await service.update(bodyData)
  console.log("updated: ", updated)
  res.status(202).json(updated)
}

async function update(req, res, next) {
  const bodyData = req.body
  console.log("BACKEND UPDATE", bodyData)
  const finish = await service.finish(bodyData)
  res.status(200).json("Successful delete")
}

module.exports = {
  list,
  create: [
    ValidReservation,
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
    update
  ],
  delete: [
    reservationExists,
    destroy
  ]
};
