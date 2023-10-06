import React from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

/**
 * PUT request only works if I prevent default of the anchor tag
 */

function ReservationCard({ reservation }) {
  const history = useHistory();
  const {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = reservation;
  //Event Handlers
  //Updating reservation once they've been seated
  const updateReservation = async (e) => {
    e.preventDefault();
    await fetch(`https://restaurant-reservations-back-end-jl5i.onrender.com/reservations/${e.target.value}/status`, {
      method: "DELETE",
      body: JSON.stringify({data: { ...reservation, status: "Seated" }}),
      headers: {
        "Content-type": "application/json;charset=UTF-8",
      },
    });
    console.log("saved table has been seated");
    history.push(`/reservations/${e.target.value}/seat`);
  };
  //Canceling a reservation
  const cancelReservation = async (e) => {
    e.preventDefault();
    if (window.confirm(`Do you want to cancel this reservation? This cannot be undone.`)) {
        await fetch(
            `https://restaurant-reservations-back-end-jl5i.onrender.com/reservations/${reservation_id}/status`,
            {
                method: "PUT",
                body: JSON.stringify({...reservation, "status": "cancelled"}),
                headers: {
                    "Content-type": "application/json;charset=UTF-8"
                }
            }
        );
        window.location.reload(true)
    }
  }
  return (
    <div>
    <div className="bg-warning">
      <h2>{`${last_name}, ${first_name}(${people})`}</h2>
      <h5>
        {reservation_date} @ {reservation_time}
      </h5>
      <h6 data-reservation-id-status={reservation.reservation_id}>{status}</h6>
      <p>Ph#: {mobile_number}</p>
      <a href={`/reservations/${reservation_id}/edit`}>
        <button >Edit</button>        
      </a>

      {status === "Booked" ? (
        <a href={`/reservations/${reservation_id}/seat`}>
          <button onClick={updateReservation} value={reservation_id}>
            Seat
          </button>
        </a>
      ) : (
        ""
      )}
      
    </div>
    <button data-reservation-id-cancel={reservation.reservation_id} onClick={cancelReservation}>Cancel</button>  
    </div>

  );
}

export default ReservationCard;
