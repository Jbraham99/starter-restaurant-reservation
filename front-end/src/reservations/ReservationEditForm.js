import { useEffect, useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import ReservationForm from "./reservationForm";
import { API_BASE_URL } from "../utils/api";
function ReservationEditForm({date}) {
    const {reservation_id} = useParams()
    // console.log(reservation_id)
    const [reservation, setReservation] = useState(null)
    useEffect(()=>{
        async function getReservation(id){
            const result = await fetch(
                `${API_BASE_URL}/reservations/${id}/edit`,
                {
                    method: "GET",
                    body: JSON.stringify(),
                    headers: {
                        "Content-type": "application/json;charset=UTF-8"
                    }
                }
            )
            const reservation = await result.json()
            // console.log("FETCHED: ", reservation.data)
            setReservation(reservation.data)
        }
        getReservation(reservation_id)
    }, [reservation_id])
    return <div>
        {reservation ? <div><h2>Edit Reservation</h2>
        <ReservationForm date={date} reservation={reservation}/></div> : <p>Loading Reservation</p>}
        
    </div>
}

export default ReservationEditForm