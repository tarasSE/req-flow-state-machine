import React from "react";
import "./Stepper.css"

const LABELS = {
    none: "none",
    missed_info: "missed_info",
    error: "error",
    completed: "completed",
}

const labelSelector = (label) => {
    const mapper = {
        [LABELS.none]: null,
        [LABELS.missed_info]: <div className={`stepLabel ${label}`}>missed info</div>,
        [LABELS.error]: <div className={`stepLabel ${label}`}>error</div>,
        [LABELS.completed]: <div className={`stepLabel ${label}`}>completed</div>
    }

    return mapper[label];
}


const Stepper = ({ steps, state, setState, stepMapper, changeStep }) => {
    return <>
        <div className='stepper'>
            {steps.map((step, index) => <StepItem
                key={step}
                num={index + 1}
                step={step}
                state={state}
                setState={setState}
                stepMapper={stepMapper}
                changeStep={changeStep}
            />)}
        </div>
    </>
}

const StepItem = ({ num, step, state, setState, changeStep, stepMapper }) => {
    const labelState = state.labelState;

    return <>
        <div
            className={`step ${state.step === step ? "active" : ""}`}
            onClick={() => changeStep(step, state, setState)}>
            <div><span className='stepNum'>{num}</span>{stepMapper[step]}</div>
            {labelSelector(labelState[step])}
        </div>
    </>
}

export { Stepper, LABELS }