import { useState } from "react"
import { useHistory } from "react-router-dom"
import { API_BASE_URL } from "../utils/api";

function TablesForm() {
    const history = useHistory();
    const initFormState = {
        "table_name": "",
        "capacity": "",
        "status": "Free",
        "reservation_id": 0
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
        // console.log("sumbitted")
            await fetch(`${API_BASE_URL}/tables`, {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({data: {...table, "capacity": Number(table.capacity)}})
            }).then(async (returned)=>{
                const response = await returned.json()
                if (response.error) {
                    // console.log("Error response", response)
                    setError(response.error)
                    setFormSubmitted(true)
                } else {
                    // console.log("Saved table: ", response)
                    history.push(`/dashboard`)                     
                }
            })
    }
    return <div>
        <h1>Create a new table</h1>
        {formSubmitted && error ? <div className="alert alert-danger">{error}</div> : ""}
        <form onSubmit={submitHandler}>
        <label htmlFor="table_name">Table name</label>
        <input type="text" id="table_name" name="table_name" value={table.table_name} onChange={changeHandler}/>
        <label htmlFor="capacity">Capacity</label>
        <input type="text" id="capacity" name="capacity" value={table.capacity} onChange={changeHandler}/>
        <button className="btn btn-lg btn-dark" type="cancel" onClick={()=> history.goBack()}>Cancel</button>
        <button className="btn btn-lg btn-primary" type="submit">Submit</button>
    </form></div>
}

export default TablesForm