import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom/cjs/react-router-dom.min"
import { useParams } from "react-router-dom/cjs/react-router-dom";
import { API_BASE_URL } from "../utils/api";
function Seating() {
    const [selectedTable, setSelectedTable] = useState('')
    const { reservation_id } = useParams();//PARAMETER FROM URL
    const reservation_number = Number(reservation_id)
    const [tables, setTables] = useState(null)
    const [table, setTable] = useState(null)
    const [reservation, setReservation] = useState(null)
    const [err, setErr] = useState(null)
    const [changeCount, setChangeCount] = useState(0)
    const history = useHistory();
    const cancelHandler = (e) => {
        e.preventDefault()
        history.goBack()
    }
    useEffect(async ()=>{
      if (tables !== null) {
      console.log("USE EFFECT TABLES: ", tables)
      setSelectedTable(tables[0])
      }
    }, [tables])
    useEffect(()=>{
      async function getReservation(id){
        const response = await fetch(
          `${API_BASE_URL}/reservations/${id}`,
          {
            method: "GET",
            headers: {
              "Content-type": "application/json;charset=UTF-8"
            }
          }
        );
        const reservation = await response.json();
        // console.log("RESERVATION : ", reservation)
        setReservation(reservation.data)
      }
      getReservation(reservation_id)
    }, [reservation_id])
    // console.log(reservation)
    useEffect(()=> {
        async function getTables() {
          try {
            const response = await fetch(
            `${API_BASE_URL}/tables`,
            {
              method: "GET",
              body: JSON.stringify(),
              headers : {
                "Content-type": "application/json;charset=UTF-8"
              }
            }
          );
          const tables = await response.json()
          // console.log("SEAT TABLES", tables.data)
          setTables(tables.data)
          setSelectedTable(tables.data[0])
          } catch (error) {
            console.error("Error: ", error)
          }
        }
        getTables()
      }, [])
    /**
     * every time you change the option in the select element
     * use FIND method to find table based on the option table_id
     * save retrieved table in a state variable
     */
    const changeHandler = (e) => {
        e.preventDefault();
        setChangeCount(changeCount + 1)
        const tableNum = Number(e.target.value)
        const table = tables.find((table)=> table.table_id === tableNum)
        setTable({
          ...table,
          "reservation_id": reservation_number
        })
        setSelectedTable({
          ...table,
          "reservation_id": reservation_number
        })
    }
    // console.log("STATE VAR TABLE: ", table)
    /**
     * after table saved in a state variable,
     * change 'status' to "Occupied"
     * chenge 'reservation_id' to the ID in the params
     * make a PUT request to save data
     * history.push user to the dashboard
     */
    const submitHandler = async (e) => {
        e.preventDefault();
        if (selectedTable.capacity >= reservation.people) {
          await fetch(
            `${API_BASE_URL}/tables/${selectedTable.table_id}/seat`,
            {
              method: "PUT",
              body: JSON.stringify({data: {...table, "reservation_id": Number(reservation_id)}}),
              headers: {
                "Content-type": "application/json;charset=UTF-8"
              }
            }
          );
          await fetch(`${API_BASE_URL}/reservations/${reservation_id}/status`, {
            method: "DELETE",
            body: JSON.stringify({data: { ...reservation, status: "seated" }}),
            headers: {
              "Content-type": "application/json;charset=UTF-8",
            },
          })
          history.push("/dashboard")          
        } else {
          setErr("This table can't fit that many people.")
        }
    }
    console.log(selectedTable)
    /**
     * HAVE THE VALUE BE THE TABLE ID
     * THEN MAKE A PUT REQUEST TO A TABLE BASED ON ID
     */
    return <div>{tables ? <form onSubmit={submitHandler}>
        <h3>Select a table:</h3>
        {err? <div className="alert alert-danger">{err}</div> : ""}
        <select name="table_id"  value={`${selectedTable}`} onChange={changeHandler}>
          {/* <option value{}>select:</option> */}
            {tables && reservation? <>
            {tables.map((table)=>{
              if (!table.reservation_id) {
                // if (table.capacity >= reservation.people)
                return <option key={table.table_id} value={table.table_id} name={table.capacity}>{`${table.table_name} - ${table.capacity}`}</option>                
              }
              return ""
            })}
            </> : <option>Loading...</option>}
        </select>
        <button onClick={cancelHandler}>Cancel</button>
        <button type="submit">Submit</button>
    </form> : <p>Loading...</p>}</div>
}

export default Seating