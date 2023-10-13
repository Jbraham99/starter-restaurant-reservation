import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom"
import { listReservations, API_BASE_URL, loadTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationCard from "./ReservationCard";
import { next, previous, today } from "../utils/date-time";
// import TablesList from "../tables/TablesList"
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
  // const [tablesError, setTablesError] = useState(null);

  const [finishedRes, setFinishedRes] = useState(null)
  // useEffect(()=> {
  //   console.log("USE EFFECT TABLES ", tables)
  // }, [tables])
  // useEffect(()=>{
  //   console.log("USE EFFECT RESERVATIONS ", reservations)
  // }, [reservations])
  // console.log(tables)
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
    loadTables(abortController.signal).then(setTables);
    return () => abortController.abort();
  }

  useEffect(()=>{
    async function reservationStatus(){
      const abortController = new AbortController()
      if (finishedRes) {
        try {
        await fetch(
          `${API_BASE_URL}/reservations/${finishedRes.reservation_id}/status`,
          {
            method: "PUT",
            body: JSON.stringify({data: {...finishedRes, "status": "Finished"}}),
            headers: {
              "Content-type": "application/json;charset=UTF-8"
            },
            signal: abortController.signal
          }
        ).then(async (returned)=> {
          await returned.json()
          loadDashboard()
          loadTables()
        })          
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("Request was aborted.")
          } else {
            console.error("An error occurred: ", error)
          }
        }
      }
    }
    reservationStatus()
}, [finishedRes])
  //Event Handlers
  const finishTable = async (e) => {
    e.preventDefault()
    const tableNum = Number(e.target.value)
    const finishedTable = tables.find((table)=> table.table_id === tableNum)

    const finishedReservation = reservations.find((res)=> res.reservation_id === finishedTable.reservation_id)
    if (window.confirm(`Is this table ready to seat new guests? This cannot be undone.`)) {
      setFinishedRes(finishedReservation)
      const abortController = new AbortController()
      try {
          await fetch(
            `${API_BASE_URL}/tables/${tableNum}/seat`,
            {
              method: "DELETE",
              body: JSON.stringify({data: {"reservation_id": null}}),
              headers: {
                "Content-type": "application/json;charset=UTF-8"
              },
              signal: abortController.signal
            }
          ).then(async (returned)=> {
          await returned.json()
          loadDashboard()
        })        
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request was aborted.")
        } else {
          console.error("An error occurred: ", error)
        }
      }
    }
  }
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
                if (reservation.status.toLowerCase() !== "cancelled" && reservation.status.toLowerCase() !== "finished") {
                  return <ReservationCard key={reservation.reservation_id} loadDashboard={loadDashboard} reservation={reservation}/>
                }
                return ""
          })}
        </div>
      )}
      <h3>Tables</h3>
      {tables ? <>
        {/* <div className="col-md-6 col-lg-6 col-sm-12">
          <ErrorAlert error={tablesError} />
          <TablesList onFinish={onFinish} tables={tables} />
        </div> */}
      {tables.length > 0 && tables.map((table)=>{
        return <div className="bg-secondary w-25 p-3" key={table.table_id}>
          <h6>{`${table.table_name}`}</h6>
          {table.reservation_id ? <p data-table-id-status={table.table_id}>occupied<button data-table-id-finish={table.table_id} data-reservation-id-finish={table.reservation_id} value={table.table_id} onClick={finishTable}>finish</button></p> : <p data-table-id-status={`${table.table_id}`}>free</p>}
          <p>{`Capacity: ${table.capacity}`}</p>
          {/* {table.reservation_id ?  : ""} */}
        </div>
        
      })}
      </> : <p>Loading...</p>}
    </main>
  );
}

export default Dashboard;
