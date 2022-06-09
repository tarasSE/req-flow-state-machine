import React from "react";
import "./Input.css";

const Input = ({ label, onChange, value, errors }) => <>
    <div className='inputGroup'>
        <label>{label}</label><br />
        <input type={"text"} onChange={onChange} value={value} />
        <div className="error">
            {errors.reduce((x, y) => x + y + "; ", "")}
        </div>
    </div>
</>

export { Input };