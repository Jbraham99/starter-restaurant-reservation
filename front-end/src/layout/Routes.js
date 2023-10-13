import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import ReservationForm from "../reservations/reservationForm";
import useQuery from "../utils/useQuery";
import TablesForm from "../tables/tableForm";
import Seating from "../seating/Seating";
import SearchPage from "../reservations/SearchPage";
import ReservationEditForm from "../reservations/ReservationEditForm";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  const date = query.get("date")
  // console.log("DATE FROM QUERY: ", date)
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>

      <Route path="/reservations/new">
        <ReservationForm date={today()}/>
      </Route>

      <Route path="/dashboard">
        <Dashboard date={date || today()} />
      </Route>

      <Route path="/reservations/:reservation_id/seat">
        <Seating />
      </Route>

      <Route path="/tables/new">
        <TablesForm />
      </Route>

      <Route path="/search">
        <SearchPage />
      </Route>

      <Route path="/reservations/:reservation_id/edit">
        <ReservationEditForm date={today()}/>
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
