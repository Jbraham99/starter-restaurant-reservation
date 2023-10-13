import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { API_BASE_URL } from "../utils/api";
import { useState } from "react";
/**
 * PUT request only works if I prevent default of the anchor tag
 */

// && reservation_date == today()

function ReservationCard({ reservation, loadDashboard }) {
  const history = useHistory();
  const [reservationForCard, setRservationForCard] = useState(reservation)
  const {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = reservationForCard;
  //Event Handlers
  //Updating reservation once they've been seated
  const updateReservation = (e) => {
    e.preventDefault();
    // await fetch(`${API_BASE_URL}/reservations/${e.target.value}/status`, {
    //   method: "DELETE",
    //   body: JSON.stringify({data: { ...reservation, status: "Seated" }}),
    //   headers: {
    //     "Content-type": "application/json;charset=UTF-8",
    //   },
    // }).then(async (returned)=> {
    //   const response = await returned.json()
    //   if (response.error) {
    //     setSeated(true)
    //     setError(response.error)
    //   } else {
    //       // console.log("saved table has been seated");
    //       history.push(`/reservations/${e.target.value}/seat`);        
    //   }
    // })
              history.push(`/reservations/${e.target.value}/seat`);
  };
  //Canceling a reservation
  const cancelReservation = async (e) => {
    e.preventDefault();
    if (window.confirm(`Do you want to cancel this reservation? This cannot be undone.`)) {
      const abortController = new AbortController()
      try {
        await fetch(
            `${API_BASE_URL}/reservations/${reservation_id}/status`,
            {
                method: "PUT",
                body: JSON.stringify({data: {...reservation, "status": "cancelled"}}),
                headers: {
                    "Content-type": "application/json;charset=UTF-8"
                },
                signal: abortController.signal
            }
        ).then( async (returned)=>{
          const response = await returned.json()
          if(!response.error) {
            setRservationForCard(response.data)
            loadDashboard()
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
  return (
    <div>
      {status.toLowerCase? <div className="bg-warning">
        <h2>{`${last_name}, ${first_name}(${people})`}</h2>
        <h5>{reservation_date} @ {reservation_time}</h5>
        <h6 data-reservation-id-status={reservation.reservation_id}>{status.toLowerCase()}</h6>
        <p>Ph#: {mobile_number}</p>
        
          <button ><a href={`/reservations/${reservation_id}/edit`}>Edit</a></button>        
        
        {status.toLowerCase() === "booked" ? 
          <a href={`/reservations/${reservation_id}/seat`}>
            <button onClick={updateReservation} value={reservation_id}>Seat</button>
            </a>: ""}
        {status !== "cancelled" && status.toLowerCase() !== "finished" ? <button data-reservation-id-cancel={reservation.reservation_id} onClick={cancelReservation}>Cancel</button> : ""}
      </div> : ""}
    </div>
  );
}

export default ReservationCard;
