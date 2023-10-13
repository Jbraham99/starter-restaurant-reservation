const service = require("./tables.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")
const reservationController = require("../reservations/reservations.controller")

async function list(req, res, next) {
    const tables = await service.list();
    res.status(200).json({data: tables});
  }



function dataPropertyHas(property) {
    return (req, res, next) => {
        const newTable = req.body.data;
        if (newTable) {
            const tableProps = Object.keys(newTable)
            if (tableProps.includes(property) && newTable[property] !== "") {
                res.locals.newTable = newTable
                return next()
            }
            return next({
                status: 400,
                message: `table missing ${property} property`
            })             
        }
        next({
            status: 400,
            message: "table data missing"
        })
    }
}

function validTableName(req, res, next) {
    const {newTable} = res.locals
    if (newTable.table_name.length !== 1) {
        return next()
    }
    next({
        status: 400,
        message: `table_name must more than one character`
    })
}

function validTableCapacity(req, res, next) {
    const {newTable} = res.locals
    if (newTable.capacity > 0 && typeof newTable.capacity === "number") {
        return next()
    }
    next({
        status: 400,
        message: `table capacity has to be more than 0`
    })
}

async function create(req, res) {
    const {newTable} = res.locals
    // console.log("%%%%", req.body.data)
    const table = await service.create(newTable)
    res.status(201).json({data: table[0]})
}

async function tableExists(req, res, next) {
    const {table_id} = req.params
    const tableNum = Number(table_id)
    // console.log(typeof tableNum)
    const table = await service.read(tableNum)
    if (table) {
        res.locals.table = table
        return next()
    }
    next({
        status: 404,
        message: `table ${table_id} not found.`
    })
}



//check if table can fit reservation size
async function tableCap(req, res, next) {
    const {table} = res.locals;
    const resData = req.body.data
    // console.log("TABLE CAP TABLES", resData)
    if (!resData) {
        return next({
            status: 400,
            message:`reservation_id missing`
        })
    }
    if (!resData.reservation_id) {
        return next({
            status: 400,
            message: `reservation_id missing`
        })
    }
    const resNum = Number(resData.reservation_id)
    // console.log("resNum: ", resNum)
    const reservation = await service.reservation(resNum)
    if (!reservation) {
        return next({
            status: 404,
            message: `${resData.reservation_id} not a valid reservation_id`
        })
    }
    if (reservation) {
        const capacity = Number(table.capacity)
        const partySize = Number(reservation.people)
        if (reservation.status === "seated") {
            return next({
                status: 400,
                message: "reservation is already seated"
            })
        }
        if (capacity >= partySize ) {
            res.locals.reservation = reservation
            return next()
        } else {
            return next({
                status: 400,
                message: `table capacity met.`
            })
        }
    }
    next({
        status: 404,
        message: `reservation ${resNum} not found`
    })
}

//check if table is occupied or not
function occupiedOrFree(req, res, next) {
    const { table } = res.locals
    // console.log("table status: ", table)
    if (table.reservation_id) {
        return next({
            status: 400,
            message: `This table is occupied`
        })
    }
    next()
}

//function when deleting to check if the table is NOT occupied
function tableNotOccupied(req, res, next) {
    const {table} = res.locals;
    // console.log("TABLE NOT OCCUPIED", table)
    if (table.reservation_id) {
        return next()
    }
    next({
        status: 400,
        message: "table not occupied"
    })
}

async function update(req, res) {
    const {table, reservation} = res.locals
    const newReservation = {
        ...reservation,
        "status": "seated"
    }
    const updatedReservation = await service.updateReservation(newReservation)
    // console.log("UPDATED RESERVATION: !!", newReservation)
    const newTable = {
        ...table,
        "reservation_id": Number(reservation.reservation_id),
        "status": "occupied"
    }
    ("TABLE DATA: ", newTable)
    const changedTable = await service.update(newTable)
    res.status(200).json({data: newReservation})
}

async function destroy(req, res, next) {
    ("TEST*&*&*&*&")
    const {table, reservation} = res.locals
    ("DESTROY: ", table, "RESREVATION: ", reservation)
    const newReservation = {
        // ...reservation,
        "reservation_id": table.reservation_id,
        "status": "finished"
    }
    const updatedReservation = await service.updateReservation(newReservation)
    ("UPDATE RESERVATION: ", updatedReservation)
    const finishedTable = {
        ...table,
        "reservation_id": null
    }
    ("FINISHED TABLE!!", finishedTable)
    const deletingTable = await service.destroyTable(finishedTable)
    ("FINISHED TABLE", finishedTable)
    res.status(200).json({data: [updatedReservation, finishedTable]})
}

function testing(req, res, next) {
    ("*****TEST MIDDLEWARE*****")
    next()
}

module.exports = {
    list: [asyncErrorBoundary(list)],
    create: [
        dataPropertyHas("table_name"),
        dataPropertyHas("capacity"),
        validTableName,
        validTableCapacity,
        asyncErrorBoundary(create)
    ],
    update: [
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(tableCap),
        occupiedOrFree,
        asyncErrorBoundary(update)
    ],
    delete: [
        asyncErrorBoundary(tableExists),
        tableNotOccupied,
        asyncErrorBoundary(destroy)
    ]
}