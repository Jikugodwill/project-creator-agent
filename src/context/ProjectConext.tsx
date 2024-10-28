"use client"
import React, { createContext, useContext, useReducer, ReactNode } from "react";

interface ProjectState {
  // Define your state structure here
  projectEditor: any; // Replace 'any' with your actual type
}

const initialState: ProjectState = {
  projectEditor: {}, // Initialize your state
};

type Action = { type: "RESET" }; // Define your action types

const projectReducer = (state: ProjectState, action: Action): ProjectState => {
  switch (action.type) {
    case "RESET":
      return initialState; // Reset to initial state
    default:
      return state;
  }
};

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
