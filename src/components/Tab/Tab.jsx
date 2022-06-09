import React from "react";
import { Input } from "../Input/Input";

const Tab = ({ step, state, setState, fields }) => {
    const inputs = fields.map(({ name, label }) => <Input
        key={`${step}-${name}`}
        label={label}
        value={state.data[step][name]}
        errors={state.validation[step][name].errors}
        onChange={(event) => setState(updateData(state, name, event.target.value))
        } />);

    return <>
        {inputs}
    </>
}

const updateData = (state, fieldName, value) => {
    const step = state.step;

    return {
        ...state,
        validation: {
            ...state.validation,
            [step]: {
                ...state.validation[step],
                [fieldName]: { dirty: true, errors: [] },
            }
        },
        data: {
            ...state.data,
            [step]: {
                ...state.data[step],
                [fieldName]: value,
            }
        }
    }
}

export { Tab };