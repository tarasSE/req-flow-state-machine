import './App.css';
import { useRef, useState } from 'react';
import { Tab } from './components/Tab/Tab';
import { LABELS, Stepper } from './components/stepper/Stepper';
import { useParams } from 'react-router-dom';

const read = (id) => {
  const state = localStorage.getItem(id);
  if (!state) return clear();

  return JSON.parse(state);
}

const clear = () => {
  window.history.pushState({}, null, `/`);
  window.location.reload();
}

const STEPS = {
  contact_info: "contact_info",
  details: "details",
  items: "items",
}

const stepMapper = {
  [STEPS.contact_info]: "Contact info",
  [STEPS.details]: "Details",
  [STEPS.items]: "Items",
}

const ACTIONS = {
  changeStep: (step, state, setState) => {
    console.log(state)
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
    if (id) {
      localStorage.removeItem(id);
    }

    clear();
  },
  save: (state) => {
    let id = state.request.id;
    if (!id) {
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
  [STEPS.contact_info]: {
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
  const { requestId } = useParams();
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
      [STEPS.contact_info]: {
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

  if (requestId && firstUpdate.current) {
    initState = read(requestId)
    initState.stepsToValidate = new Set()
      .add(STEPS.contact_info)
      .add(STEPS.details)
      .add(STEPS.items);
    initState.labelState = refreshLabels(initState);
    initState.validation = initValidation;
  }

  const [state, setState] = useState(initState)

  if (state.request.id && firstUpdate.current) {
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
        { label: "Name", name: "name" },
        { label: "Email", name: "email" },
      ]}
    />,
    [STEPS.details]: <Tab state={state} setState={setState} step={STEPS.details}
      fields={[
        { label: "Dog name", name: "dogName" },
        { label: "Cat name", name: "catName" },
      ]}
    />,
    [STEPS.items]: <Tab state={state} setState={setState} step={STEPS.items}
      fields={[
        { label: "Bone", name: "bone" },
        { label: "Box", name: "box" },
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
      <Stepper
        steps={Object.keys(STEPS)}
        state={state}
        setState={setState}
        stepMapper={stepMapper}
        changeStep={ACTIONS.changeStep}
      />
      <div className='right'>
        {tab}
      </div>
    </div>
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
  const labelState = { ...state.labelState };
  stepsToValidate.add(state.step);

  stepsToValidate.forEach(st => {
    const data = { ...state.data[st] };
    if (hasErrors(st, state)) {
      return labelState[st] = LABELS.error;
    }
    if (nonComplete(data)) {
      return labelState[st] = LABELS.missed_info;
    }
    return labelState[st] = LABELS.completed;
  })

  return labelState;
}


export default App;
