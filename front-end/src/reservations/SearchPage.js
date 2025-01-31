import ReservationCard from "../dashboard/ReservationCard"
import React, {useState} from "react"
import { API_BASE_URL } from "../utils/api"
/**
 * make a GET request with a query using phone number
 * 
 */

function SearchPage() {
    const initForm = {
        mobile_number: ""
    }
    const [reservations, setReservations] = useState([])
    const [form, setForm] = useState(initForm);
    // const [clicked, setClicked] = useState(false)
    const [err, setErr] = useState(null)
    const changeHandler = (e) => {
        setErr(null)
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }
    // console.log(form)
    const searchHandler = async (e) => {
        e.preventDefault()
        // setClicked(true)
        // console.log(form)
        try {
            const abortController = new AbortController()
            const response = await fetch(
                `${API_BASE_URL}/reservations?mobile_number=${form.mobile_number}`,
                {
                    method: 'GET',
                    headers: {
                        "Content-type": "application/json;Charset=UTF-8"
                    },
                    signal: abortController.signal         
                }
            );
            const reservations = await response.json();
            // console.log(";;;;;;;", reservations)
            if (reservations.data.length === 0) {
                setErr("No reservations found")
            } else {
                setReservations(reservations.data)
            }            
        } catch (error) {
            if (error.name === "AbortError") {
              console.log("Request was aborted.")
            } else {
              console.error("An error occurred: ", error)
            }
          }
    }
    // console.log(reservations)
    return (
        <div>
            <div>
            <label htmlFor="mobile_number"><h2>Search reservation by phone number!</h2></label>
            {err? <div className="alert alert-danger">No reservations found</div> : ""}
            <div className="d-flex justify-content-around shadow mb-5 rounded pt-3 pb-3 bg-dark">
            <input type="text" name="mobile_number" id="mobile_number" placeholder="Enter customer's phone number" onChange={changeHandler} value={form.mobile_number} required/>
            <button onClick={searchHandler} value={form} type="submit" className="btn btn-lg btn-success">Find</button>
            </div>
            </div>
            {reservations.length > 0 ? <div>{reservations.map((reservation)=>{
                return <ReservationCard key={reservation.reservation_id} reservation={reservation}/>
            })}</div> : <div className="col"></div>}      
        </div>
    )
}

export default SearchPage