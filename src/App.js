import './App.css';
import { useRef, useState } from 'react';
import { clear } from '@testing-library/user-event/dist/clear';

const read = (id) => {
  const state = localStorage.getItem(id);
  if(!state) return clear();

  return JSON.parse(state);
}

clear = () => {
  window.history.pushState({}, null, `/`);
  window.location.reload();
}

const STEPS = {
  contact_info: "contact_info",
  details: "details",
  items: "items",
}

const LABELS = {
  none: "none",
  missed_info: "missed_info",
  error: "error",
  completed: "completed",
}

const stepMapper = {
  [STEPS.contact_info]: "Contact info",
  [STEPS.details]: "Details",
  [STEPS.items]: "Items",
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

const ACTIONS = {
  changeStep: (step, state, setState) => {
    const currStep = state.step;
    const stepsToValidate = new Set(state.stepsToValidate);
    stepsToValidate.add(currStep);
    
    checkErrors(state, setState);

    const labelState = refreshLabels(state);

    const newState = {
      ...state,
      step: step,
      labelState: labelState,
      stepsToValidate: stepsToValidate,
    }

    setState(newState);
  },
  remove: (state) => {
    const id = state.request.id;
    if(id){
      localStorage.removeItem(id);
    }

    clear(); 
  },
  save: (state) => {
    let id = state.request.id;
    if(!id){
      id = Math.random().toString(16).slice(2);
      state.request.id = id;
    }

    state.validation = initValidation;
    state.step = STEPS.contact_info;
  
    localStorage.setItem(id, JSON.stringify(state));
    window.history.pushState({}, null, `/${id}`);
  }
}

const initValidation = {
  [STEPS.contact_info]:{
    name: {
      errors: [],
      dirty: false,
    },
    email: {
      errors: [],
      dirty: false,
    },
  },
  [STEPS.details]: {
    dogName: {
      errors: [],
      dirty: false,
    },
    catName: {
      errors: [],
      dirty: false,
    },
  },
  [STEPS.items]: {
    bone: {
      errors: [],
      dirty: false,
    },
    box: {
      errors: [],
      dirty: false,
    },
  }
};

function App() {
  const firstUpdate = useRef(true);
  const id = window.location.pathname.replace('/', '')
  let initState = {
    request: {
      id: null,
    },
    step: STEPS.contact_info,
    stepsToValidate: new Set([STEPS.contact_info]),
    labelState: {
      [STEPS.contact_info]: LABELS.none,
      [STEPS.details]: LABELS.none,
      [STEPS.items]: LABELS.none,
    },
    validation: initValidation,
    data: {
      [STEPS.contact_info]:{
        name: "",
        email: "",
      },
      [STEPS.details]: {
        dogName: "",
        catName: "",
      },
      [STEPS.items]: {
        bone: "",
        box: "",
      }
    }
  }

  if(id && firstUpdate.current) {
    initState = read(id) 
    initState.stepsToValidate = new Set()
                            .add(STEPS.contact_info)
                            .add(STEPS.details)
                            .add(STEPS.items);
    initState.labelState = refreshLabels(initState);
    initState.validation = initValidation;
  }

  const [state, setState] = useState(initState)

  if(state.request.id && firstUpdate.current){
    firstUpdate.current = false;
    const validation = getValidation(state, true);
    const labelState = refreshLabels(state);

    setState({
      ...state,
      validation: validation,
      labelState: labelState,
    });
  }

  let tab = {
    [STEPS.contact_info]: <Tab state={state} setState={setState} step={STEPS.contact_info}
                                fields={[
                                  {label: "Name", name: "name"},
                                  {label: "Email", name: "email"},
                                ]}
                          />,
    [STEPS.details]: <Tab state={state} setState={setState} step={STEPS.details}
                          fields={[
                            {label: "Dog name", name: "dogName"},
                            {label: "Cat name", name: "catName"},
                          ]}
    />,
    [STEPS.items]: <Tab state={state} setState={setState} step={STEPS.items}
                        fields={[
                                  {label: "Bone", name: "bone"},
                                  {label: "Box", name: "box"},
                                ]}
    />,
  }[state.step];
  
  return (<>
    <div className='container'>
      <div className='buttons'>
        <button onClick={() => ACTIONS.save(state)}>Save</button>
        <button>Submit</button>
        <button onClick={() => ACTIONS.remove(state)}>Remove</button>
      </div>
      <div className='left'>
        <StepItem num={1} step={STEPS.contact_info} state={state} setState={setState} />
        <StepItem num={2} step={STEPS.details}  state={state} setState={setState} />
        <StepItem num={3} step={STEPS.items}  state={state} setState={setState}  />
      </div>
      <div className='right'>
          {tab}
      </div>
    </div>

    <details>
      <summary>
        Debug
        <span className="icon">👇</span>
      </summary>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </details>
    </>
  );
}

function getValidation(state, checkAll) {
  const validation = { ...state.validation };

  Object.values(STEPS).forEach(step => {
    if (step === STEPS.contact_info &&
      (validation[step].name.dirty || checkAll) &&
      !state.data[step].name) {
      validation[step].name.errors = ["Name can't be empty"];
    }
  });
  return validation;
}

const checkErrors = (state, setState, checkAll) => {
  const validation = getValidation(state, checkAll);

  setState({
    ...state, 
    validation: {
      ...validation
    }
  });
}

const hasErrors = (step, state) => {
  return Object.values(state.validation[step])
  .filter(field => field.errors.length > 0)
  .length > 0
}

const nonComplete = (dataTab) => Object.values(dataTab).map(x => !x).some(x => x);

const refreshLabels = (state) => {
  const stepsToValidate = state.stepsToValidate;
  const labelState = {...state.labelState};
  stepsToValidate.add(state.step);

  stepsToValidate.forEach(st => {
    const data = {...state.data[st]};
    if(hasErrors(st, state)){
      return labelState[st] = LABELS.error;
    }
    if(nonComplete(data)){
      return labelState[st] = LABELS.missed_info;
    }
    return labelState[st] = LABELS.completed;
  })

  return labelState;
}

const updateData = (state, fieldName, value) => { 
  const step = state.step;

  return {
    ...state, 
    validation: {
      ...state.validation,
      [step]: {
        ...state.validation[step], 
        [fieldName]: {dirty: true, errors: []},
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

const Tab = ({step, state, setState, fields}) => {
  const inputs = fields.map(({name, label}) => <Input  
            key={`${step}-${name}`}
            label={label} 
            value={state.data[step][name]}
            errors={state.validation[step][name].errors}
            onChange={(event) => setState(updateData(state, name, event.target.value))
          }/>);

  return  <>
  {inputs}
</>
}

const Details = ({state, setState}) =>  <>
  <Input  label={"Dog name"} 
          value={state.data[STEPS.details].dogName}
          onChange={(event) => setState(updateData(state, "dogName", event.target.value))
          }/>
  <Input  label={"Cat name"} 
          value={state.data[STEPS.details].catName}
          onChange={(event) => setState(updateData(state, "catName", event.target.value))
          }/>
</>

const Items = ({state, setState}) =>  <>
  <Input  label={"Bone name"} 
          value={state.data[STEPS.items].bone}
          onChange={(event) => setState(updateData(state, "bone", event.target.value))
          }/>
  <Input  label={"Box name"} 
          value={state.data[STEPS.items].box}
          onChange={(event) => setState(updateData(state, "box", event.target.value))
          }/>
</>

const Input = ({label, onChange, value, errors}) => <>
  <div className='inputGroup'>
    <label>{label}</label><br/>
    <input type={"text"} onChange={onChange} value={value}/>
    <div class="error">
      {errors.reduce((x, y) => x + y + "; ", "")}
    </div>
  </div>
</>

const StepItem = ({num, step, state, setState}) => {
const labelState = state.labelState;

return <>
  <div 
    className={`step ${state.step === step ? "active" : ""}`}
    onClick={() => ACTIONS.changeStep(step, state, setState)}>
    <div><span className='stepNum'>{num}</span>{stepMapper[step]}</div>
    {labelSelector(labelState[step])}
  </div>  
</>
}

export default App;
