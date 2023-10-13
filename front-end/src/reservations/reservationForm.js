import React, { useState } from "react";
import {Link, useHistory} from "react-router-dom"
import { API_BASE_URL } from "../utils/api";

function ReservationForm({date, reservation}) {
    // console.log("@@@@@", reservation)
    const history = useHistory()
    const [editFormData, setEditFormData] = useState(reservation)
    const [error, setError] = useState(null)
    const [formSubmitted, setFormSubmitted] = useState(false)
    const initFormState = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: 2
    }
    let [form, setForm] = useState(initFormState);
    const editFormHandler = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        })
        // console.log("*&*&*&", editFormData)
    }
    const changeHandler = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        })
    }
    const submitHandler = async (e) => {
        e.preventDefault()
        console.log("^&^&^&", form)
        const resDay = new Date(form.reservation_date).getUTCDay()
        console.log("**", resDay)
        if (reservation) {
            await fetch(`${API_BASE_URL}/reservations/${reservation.reservation_id}/edit`, {
                method: 'PUT',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({data: {...editFormData, "people": Number(editFormData.people)}})
            }).then(async (returned)=> {
                const response = await returned.json()
                console.log("response: ", response)
            })
            history.push(`/dashboard?date=${editFormData.reservation_date}`)
        } else {
            await fetch(`${API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({data: {...form, "people": parseInt(form.people)}})
            }).then(async (returned)=> {
                const response = await returned.json()
                if (response.error) {
                    setFormSubmitted(true)
                    setError(response.error)
                } else {
                    // console.log( "saved form ", response)
                    history.push(`/dashboard?date=${form.reservation_date}`)                    
                }
            })
        }
    }
    return <div>
        {formSubmitted && error ? <div className="alert alert-danger">{error}</div> : ""}
        {!reservation ? <form onSubmit={submitHandler}>
        <label htmlFor="first_name" >First Name</label>
        <input type="text" name="first_name" id="first_name" value={form.first_name} onChange={changeHandler} required/>
        <label htmlFor="last_name">Last Name</label>
        <input type="text" name="last_name" id="last_name" value={form.last_name} onChange={changeHandler} required/>
        <label htmlFor="mobile_number">Mobile Number</label>
        <input type="text" name="mobile_number" id="mobile_number" value={form.mobile_number} onChange={changeHandler} maxLength={13} required/>
        <label htmlFor="reservation_date">Reservation Date</label>
        <input type="date" name="reservation_date" id="date" value={form.reservation_date} onChange={changeHandler} required/>
        <label htmlFor="reservation_time">Reservation Time</label>
        <input type="time" name="reservation_time" id="time" value={form.reservation_time} onChange={changeHandler} required/>
        <label htmlFor="people">People</label>
        <input type="text" name="people" id="people" value={form.people} onChange={changeHandler} required/>
        <Link to={"/dashboard"}><button>cancel</button></Link>
        <button type="submit">Submit</button>
    </form> : <form onSubmit={submitHandler}>
        <label htmlFor="first_name" >First Name</label>
        <input type="text" name="first_name" id="first_name"  value={editFormData.first_name} onChange={editFormHandler} required/>
        <label htmlFor="last_name">Last Name</label>
        <input type="text" name="last_name" id="last_name" value={editFormData.last_name} onChange={editFormHandler} required/>
        <label htmlFor="mobile_number">Mobile Number</label>
        <input type="text" name="mobile_number" id="mobile_number" value={editFormData.mobile_number} onChange={editFormHandler} maxLength={13} required/>
        <label htmlFor="reservation_date">Reservation Date</label>
        <input type="date" name="reservation_date" id="date" min={date} value={editFormData.reservation_date} onChange={editFormHandler} />
        <label htmlFor="reservation_time">Reservation Time</label>
        <input type="time" name="reservation_time" id="time" min="10:30" max="21:30" value={editFormData.reservation_time} onChange={editFormHandler} required/>
        <label htmlFor="people">People</label>
        <input type="text" name="people" id="people" value={editFormData.people} onChange={editFormHandler} required/>
        <Link to={"/dashboard"}><button>cancel</button></Link>
        <button type="submit">Submit</button>
    </form>}
        </div>
}

export default ReservationForm