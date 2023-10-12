import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom"
import { listReservations, finishTable, API_BASE_URL, loadTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationCard from "./ReservationCard";
import { next, previous, today } from "../utils/date-time";
import TablesList from "../tables/TablesList"
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  //State variables
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [dashDate, setDashDate] = useState(date);
  const [tables, setTables] = useState(null)
  const [tablesError, setTablesError] = useState(null);

  const [finishedRes, setFinishedRes] = useState()
  // useEffect(()=> {
  //   console.log("USE EFFECT TABLES ", tables)
  // }, [tables])
  // useEffect(()=>{
  //   console.log("USE EFFECT RESERVATIONS ", reservations)
  // }, [reservations])
  console.log(tables)
  useEffect(loadDashboard, [date]);
  // useEffect(loadTables, [])

  /**
   * REMINDER TO SELF:
   * -----------------
   * ALREADY FETCHED ALL TABLE DATA!!
   * JUST NEED TO RENDER TABLE DATA ONTO THE DASHBOARD
   * PICK UP ON USER STORY 04 - #2
   */
  // console.log(tables)
  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then((data)=> setReservations(data))
      .catch(setReservationsError)
    loadTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  useEffect(async ()=>{
    if (finishedRes) {
    await fetch(
      `${API_BASE_URL}/reservations/${finishedRes.reservation_id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({data: {...finishedRes, "status": "Finished"}}),
        headers: {
          "Content-type": "application/json;charset=UTF-8"
        }
      }
    ).then(async (returned)=> {
      const response = await returned.json()
      console.log("DELETE: ", response)
      loadDashboard()
      loadTables()
    })      
    }
}, [finishedRes])
  //Event Handlers
  const finishTable = async (e) => {
    e.preventDefault()
    const tableNum = Number(e.target.value)
    const finishedTable = tables.find((table)=> table.table_id === tableNum)

    const finishedReservation = reservations.find((res)=> res.reservation_id === finishedTable.reservation_id)
    if (window.confirm(`Is this table ready to seat new guests? This cannot be undone.`)) {
      setFinishedRes(finishedReservation)
        await fetch(
          `${API_BASE_URL}/tables/${tableNum}/seat`,
          {
            method: "DELETE",
            body: JSON.stringify({data: {"reservation_id": null}}),
            headers: {
              "Content-type": "application/json;charset=UTF-8"
            }
          }
        ).then(async (returned)=> {
        const response = await returned.json()
        console.log("PUT: ", response)
      })
    }
  }
  function onFinish(table_id, reservation_id) {
    finishTable(table_id, reservation_id)
      .then(loadDashboard)
      .catch(setTablesError);
  }
  console.log(reservations)
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {dashDate}</h4>
      </div>
      <Link to={`/dashboard?date=${previous(dashDate)}`}>
        <button onClick={()=> setDashDate(previous(dashDate))}>Previous</button>
      </Link>
      <Link to={`/dashboard`}>
        <button onClick={()=> setDashDate(today())}>Today</button>
      </Link>
      
      <Link to={`/dashboard?date=${next(dashDate)}`}>
        <button onClick={()=> setDashDate(next(dashDate))}>Next</button>
      </Link>
      {!reservations ? <ErrorAlert error={reservationsError} /> : (
        <div>
          {reservations.map((reservation)=> {
                // console.log("RESERVATION DATE LIST", reservation)  
              if (reservation.status === "Booked" || reservation.status === "Seated") {
              
                return <ReservationCard key={reservation.reservation_id} loadDashboard={loadDashboard} reservation={reservation}/> 
              } else {
                  return ""                
              }
          })}
        </div>
      )}
      <h3>Tables</h3>
      {tables ? <>
        {/* <div className="col-md-6 col-lg-6 col-sm-12">
          <ErrorAlert error={tablesError} />
          <TablesList onFinish={onFinish} tables={tables} />
        </div> */}
      {tables.map((table)=>{
        return <div className="bg-secondary w-25 p-3" key={table.table_id}>
          <h6>{`${table.table_name}`}</h6>
          {table.reservation_id ? <h4 data-table-id-status={`${table.table_id}`}>occupied</h4> : <h4 data-table-id-status={`${table.table_id}`}>free</h4>}
          <p>{`Capacity: ${table.capacity}`}</p>
          {table.reservation_id ? <button data-table-id-finish={table.table_id} data-reservation-id-finish={table.reservation_id} value={table.table_id} onClick={finishTable}>Finish</button> : ""}
        </div>
      })}
      </> : <p>Loading...</p>}
    </main>
  );
}

export default Dashboard;
