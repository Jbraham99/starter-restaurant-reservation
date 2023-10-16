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
        // console.log("**", editFormData.reservation_date.slice(0, 10))
    }
    const changeHandler = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        })
    }
    const submitHandler = async (e) => {
        e.preventDefault()
        // console.log("^&^&^&", form)
        // const resDay = new Date(form.reservation_date).getUTCDay()
        // console.log("**", resDay)
        if (reservation) {
            if (!isNaN(Number(editFormData.people))){
                try {
                    const abortController = new AbortController()
                    await fetch(`${API_BASE_URL}/reservations/${reservation.reservation_id}/edit`, {
                        method: 'PUT',
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({data: {...editFormData, "people": Number(editFormData.people), "reservation_date": editFormData.reservation_date.slice(0, 10)}}),
                        signal: abortController.signal
                    }).then(async (returned)=> {
                        const response = await returned.json()
                        if (response.error) {
                            console.log(response.error)
                            setFormSubmitted(true)
                            setError(response.error)
                        } else {
                            console.log("***", editFormData.reservation_date)
                        history.push(`/dashboard?date=${editFormData.reservation_date}`)                             
                        }
                    })
                }  catch (error) {
                    if (error.name === "AbortError") {
                    // console.log("Request was aborted.")
                    } else {
                    console.error("An error occurred: ", error)
                    }
                }                
            } else {
                setFormSubmitted(true)
                setError("people must be a number")
            }
        } else {
            try {
                const abortController = new AbortController()
                await fetch(`${API_BASE_URL}/reservations`, {
                    method: 'POST',
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({data: {...form, "people": parseInt(form.people)}}),
                    signal: abortController.signal
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
            } catch (error) {
                if (error.name === "AbortError") {
                  console.log("Request was aborted.")
                } else {
                  console.error("An error occurred: ", error)
                }
              }
        }
    }
    return <div>
        {!reservation ? <h4 className="mb-3">New Reservation</h4> : ""}
        {formSubmitted && error ? <div className="alert alert-danger">{error}</div> : ""}
        {!reservation ? <form onSubmit={submitHandler} className="shadow p-3 mb-5 rounded text-white bg-dark">
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="first_name" >First Name</label>
        <input className="bg-light" type="text" name="first_name" id="first_name" value={form.first_name} onChange={changeHandler} required/>
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="last_name">Last Name</label>
        <input className="bg-light" type="text" name="last_name" id="last_name" value={form.last_name} onChange={changeHandler} required/>            
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="mobile_number">Mobile Number</label>
        <input className="bg-light" type="text" name="mobile_number" id="mobile_number" value={form.mobile_number} onChange={changeHandler} maxLength={13} required/>
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="reservation_date">Reservation Date</label>
        <input className="bg-light" type="date" name="reservation_date" id="date" value={form.reservation_date} onChange={changeHandler} />
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="reservation_time">Reservation Time</label>
        <input className="bg-light" type="time" name="reservation_time" id="time" value={form.reservation_time} onChange={changeHandler} required/>          
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="people">People</label>
        <input className="bg-light" type="text" name="people" id="people" value={form.people} onChange={changeHandler} required/>       
        </div>
        <div className="d-flex justify-content-around">
        <Link to={"/dashboard"}><button className="btn btn-lg btn-dark">cancel</button></Link>
        <button className="btn btn-lg btn-dark" type="submit">Submit</button>            
        </div>

    </form> : <form onSubmit={submitHandler}>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="first_name" >First Name</label>
        <input type="text" name="first_name" id="first_name"  value={editFormData.first_name} onChange={editFormHandler} required/>
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="last_name">Last Name</label>
        <input type="text" name="last_name" id="last_name" value={editFormData.last_name} onChange={editFormHandler} required/>
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="mobile_number">Mobile Number</label>
        <input type="text" name="mobile_number" id="mobile_number" value={editFormData.mobile_number} onChange={editFormHandler} maxLength={13} required/>
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="reservation_date">Reservation Date</label>
        <input type="date" name="reservation_date" id="date" min={date} value={editFormData.reservation_date} onChange={editFormHandler} />
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="reservation_time">Reservation Time</label>
        <input type="time" name="reservation_time" id="time" min="10:30" max="21:30" value={editFormData.reservation_time} onChange={editFormHandler} required/>
        </div>
        <div className="d-flex justify-content-between mb-3">
        <label htmlFor="people">People</label>
        <input type="text" name="people" id="people" value={editFormData.people} onChange={editFormHandler} required/>
        </div>
        <div className="d-flex justify-content-around">
        <Link to={"/dashboard"}><button className="btn btn-lg btn-dark">cancel</button></Link>
        <button type="submit" className="btn btn-lg btn-dark">Submit</button>
        </div>
    </form>}
        </div>
}

export default ReservationForm