import { useState } from "react"
import { useHistory } from "react-router-dom"
import { API_BASE_URL } from "../utils/api";

function TablesForm() {
    const history = useHistory();
    const initFormState = {
        "table_name": "",
        "capacity": "",
        "status": "free",
        "reservation_id": null
    }
    const [table, setTable] = useState(initFormState)
    const [error, setError] = useState(null)
    const [formSubmitted, setFormSubmitted] = useState(false)
    const changeHandler = (e) => {
        setTable({
            ...table,
            [e.target.name]: e.target.value
        })
    }
    const submitHandler = async (e) => {
        e.preventDefault()
        try {
            const abortController = new AbortController()
            await fetch(`${API_BASE_URL}/tables`, {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({data: {...table, "capacity": Number(table.capacity)}}),
                signal: abortController.signal
            }).then(async (returned)=>{
                const response = await returned.json()
                if (response.error) {

                    setError(response.error)
                    setFormSubmitted(true)
                } else {
                    history.push(`/dashboard`)                     
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
    return <div>
        <h1>Create a new table</h1>
        {formSubmitted && error ? <div className="alert alert-danger">{error}</div> : ""}
        <form onSubmit={submitHandler}>
            <div className="d-flex justify-content-between mb-4">
        <label htmlFor="table_name">Table name</label>
        <input type="text" id="table_name" name="table_name" value={table.table_name} onChange={changeHandler}/>
            </div>
            <div className="d-flex justify-content-between mb-4">
        <label htmlFor="capacity">Capacity</label>
        <input type="text" id="capacity" name="capacity" value={table.capacity} onChange={changeHandler}/>
            </div>
            <div className="d-flex justify-content-around mb-4">
        <button className="btn btn-lg btn-dark" type="button" onClick={()=> history.goBack()}>Cancel</button>
        <button className="btn btn-lg btn-primary" type="submit">Submit</button>
            </div>
    </form></div>
}

export default TablesForm