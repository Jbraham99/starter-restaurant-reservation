import ReservationCard from "../dashboard/ReservationCard"
import React, {useState} from "react"
import {Link} from "react-router-dom"
/**
 * make a GET request with a query using phone number
 * 
 */

function SearchPage() {
    const initForm = {
        mobile_number: ""
    }
    const [reservations, setReservations] = useState(null)
    const [form, setForm] = useState(initForm);
    const [clicked, setClicked] = useState(false)
    const changeHandler = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }
    const searchHandler = async (e) => {
        e.preventDefault()
        setClicked(true)
        console.log(form)
        const response = await fetch(
            `https://restaurant-reservations-back-end-jl5i.onrender.com/reservations?mobile_number=${form.mobile_number}`,
            {
                method: 'GET',
                headers: {
                    "Content-type": "application/json;Charset=UTF-8"
                }                
            }
        );
        const reservation = await response.json();
        setReservations(reservation)
    }
    console.log(reservations)
    return (
        <div>
            <div>
            <label htmlFor="mobile_number"><h2>Search reservation by phone number!</h2></label>
            <input type="text" name="mobile_number" id="mobile_number" placeholder="Enter customer's phone number" maxLength={10} onChange={changeHandler} value={form.mobile_number} required/>
            <button onClick={searchHandler} value={form}>Find</button>
            </div>
            {reservations ? <div>{reservations.map((reservation)=>{
                return <ReservationCard reservation={reservation}/>
            })}</div> : <div>{clicked? <p>No reservations found</p>: ""}</div>}      
        </div>
    )
}

export default SearchPage