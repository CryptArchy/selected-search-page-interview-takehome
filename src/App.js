import React from "react";
import styled from "styled-components";
import { startCase } from "lodash";
import zipcodes from "zipcodes";
import "./index.css";
import {
  PageContainer,
  PageContentContainer,
  PageTitle,
  PanelContainer,
  PanelColumnsContainer,
  PanelMainColumn,
  PanelSideColumn,
  PanelSection,
  PanelSectionTitle,
  StyledTextInput,
  PanelSectionHeader
} from "./StyledComponents";
import Select from "react-select";
import teacherData from "./teacherData";
import { animateScroll as scroll } from "react-scroll";

/*
|--------------------------------------------------------------------------
| Variables
|--------------------------------------------------------------------------
*/

const sortByOptions = [
  {
    label: "Alphabetical (last name)",
    value: "alphabeticalByLastName"
  },
  {
    label: "Years experience (max)",
    value: "maxYearsExperience"
  }
];

/*
|--------------------------------------------------------------------------
| Stateless Components
|--------------------------------------------------------------------------
*/

const TeacherCard = ({ teacher }) => {
  const { firstName, lastName, zipCode, subjects, gradeLevelsTaught } = teacher;
  const { city, state } = zipcodes.lookup(zipCode);
  return (
    <PanelContainer>
      <PanelSection>
        <PanelSectionTitle>
          {firstName} {lastName}
        </PanelSectionTitle>
      </PanelSection>
      <PanelSection>
        {city}, {state} {zipCode}
      </PanelSection>
      <PanelSection>
        <PanelSectionHeader>Grades Levels</PanelSectionHeader>
        <div style={{ marginBottom: "16px" }}>
          {Object.keys(gradeLevelsTaught)
            .map((level) => startCase(level))
            .join(", ")}
        </div>
        <div>
          <PanelSectionHeader>Subjects</PanelSectionHeader>
          {subjects
            .sort((a, b) => b.yrsExp - a.yrsExp)
            .map(({ label, yrsExp }) => {
              return (
                <div>
                  {label}, {yrsExp} years exp.
                </div>
              );
            })}
        </div>
      </PanelSection>
    </PanelContainer>
  );
};

/*
|--------------------------------------------------------------------------
| React Component
|--------------------------------------------------------------------------
*/

export default class App extends React.Component {
  constructor(props) {
    super(props);
    // Bind instance methods

    // Event handlers
    this.handleTextSearchOnChange = this.handleTextSearchOnChange.bind(this);
    this.handleSortByOnChange = this.handleSortByOnChange.bind(this);
    this.handleGradeLevelsOnChange = this.handleGradeLevelsOnChange.bind(this);
    this.handleStatesFilterOnChange = this.handleStatesFilterOnChange.bind(
      this
    );

    // Utility methods
    this.teacherSort = this.teacherSort.bind(this);
    this.teacherFilter = this.teacherFilter.bind(this);
    this.teacherTextFilter = this.teacherTextFilter.bind(this);

    // Set initial state

    // These "states" are the US geopolitical regions.
    // Need to filter out the unique set of states in the teacher data,
    // then construct the "programatic state" object that will track
    // which ones are selected for filtering.
    let teacherStates = {};
    teacherData.forEach((t) => {
      Object.assign(t, { zipInfo: zipcodes.lookup(t.zipCode) });
      teacherStates[t.zipInfo.state] = true;
    });

    // The constructor is the only place that "this.state" should be directly assigned
    this.state = {
      selectedGradeLevels: {
        nursery: true,
        lower: true,
        middle: true,
        upper: true
      },
      sortBy: "alphabeticalByLastName",
      states: teacherStates,
      textSearch: ""
    };
  }

  handleTextSearchOnChange(evt) {
    this.setState({ textSearch: evt.target.value });
  }

  handleSortByOnChange(evt) {
    this.setState({ sortBy: evt.value });
  }

  handleGradeLevelsOnChange(evt) {
    // Copy current state
    let selected = { ...this.state.selectedGradeLevels };
    // Update copy with new changes
    selected[evt.target.value] = !selected[evt.target.value];
    // Handle special case of "lower school" and "nursery school"
    // being considered as one category for filtering
    if (evt.target.value === "lower") {
      selected["nursery"] = selected["lower"];
    }
    // Push changed copy into the merger
    this.setState({ selectedGradeLevels: selected });
  }

  handleStatesFilterOnChange(evt) {
    // Copy current state
    let selected = { ...this.state.states };
    // Update copy with new changes
    selected[evt.target.value] = !selected[evt.target.value];
    // Push changed copy into the merger
    this.setState({ states: selected });
  }

  teacherSort(a, b) {
    if (this.state.sortBy === "alphabeticalByLastName") {
      return a.lastName.localeCompare(b.lastName);
    } else if (this.state.sortBy === "maxYearsExperience") {
      const aMax = a.subjects.reduce(
        (max, cur) => (max > cur.yrsExp ? max : cur.yrsExp),
        0
      );
      const bMax = b.subjects.reduce(
        (max, cur) => (max > cur.yrsExp ? max : cur.yrsExp),
        0
      );
      return bMax - aMax;
    } else {
      console.error(`Sort By is not implemented for ${this.state.sortBy}`);
      return 1;
    }
  }

  teacherFilter(t) {
    return (
      this.teacherStateFilter(t) &&
      this.teacherGradeFilter(t) &&
      this.teacherTextFilter(t)
    );
  }

  teacherTextFilter(t) {
    if (t instanceof Object) {
      return Object.values(t).some((value) => this.teacherTextFilter(value));
    } else if (t instanceof Array) {
      return t.some((value) => this.teacherTextFilter(value));
    } else if (t instanceof String) {
      return t.includes(this.state.textSearch);
    } else {
      return JSON.stringify(t).includes(this.state.textSearch);
    }
  }

  teacherGradeFilter(t) {
    let keys = Object.keys(t.gradeLevelsTaught);
    let results = keys.map(
      (key) => this.state.selectedGradeLevels[key] === t.gradeLevelsTaught[key]
    );
    return results.some((t) => t);
  }

  teacherStateFilter(t) {
    return this.state.states[t.zipInfo.state];
  }

  render() {
    const { sortBy } = this.state;
    return (
      <PageContainer>
        <PageContentContainer>
          <PageTitle>Teacher Search</PageTitle>
          <PanelColumnsContainer>
            <PanelSideColumn marginRight>
              <PanelContainer>
                <PanelSection>
                  <PanelSectionTitle>Text Search</PanelSectionTitle>
                </PanelSection>
                <PanelSection>
                  <StyledTextInput onChange={this.handleTextSearchOnChange} />
                </PanelSection>
                <PanelSection>
                  <PanelSectionTitle>Sort By</PanelSectionTitle>
                </PanelSection>
                <PanelSection>
                  <Select
                    onChange={this.handleSortByOnChange}
                    value={sortByOptions.find(({ value }) => value === sortBy)}
                    options={sortByOptions}
                  />
                </PanelSection>
                <PanelSection>
                  <PanelSectionTitle>Filters</PanelSectionTitle>
                </PanelSection>
                <PanelSection>
                  <label style={{ display: "block", marginBottom: "14px" }}>
                    Grade Levels
                  </label>
                  <div>
                    <input
                      type="checkbox"
                      value="lower"
                      onChange={this.handleGradeLevelsOnChange}
                      checked={this.state.selectedGradeLevels.lower}
                    />
                    <label>Nursery & Lower School</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      value="middle"
                      onChange={this.handleGradeLevelsOnChange}
                      checked={this.state.selectedGradeLevels.middle}
                    />
                    <label>Middle-School</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      value="upper"
                      onChange={this.handleGradeLevelsOnChange}
                      checked={this.state.selectedGradeLevels.upper}
                    />
                    <label>High-School</label>
                  </div>
                </PanelSection>
                <PanelSection>
                  <label style={{ display: "block", marginBottom: "14px" }}>
                    States
                  </label>
                  {Object.keys(this.state.states)
                    .sort(String.localeCompare)
                    .map((stKey) => (
                      <div>
                        <input
                          type="checkbox"
                          value={stKey}
                          onChange={this.handleStatesFilterOnChange}
                          checked={this.state.states[stKey]}
                        />
                        <label>{stKey}</label>
                      </div>
                    ))}
                </PanelSection>
              </PanelContainer>
            </PanelSideColumn>
            <PanelMainColumn>
              {teacherData
                .filter(this.teacherFilter)
                .sort(this.teacherSort)
                .map((teacher) => (
                  <TeacherCard teacher={teacher} />
                ))}
              <button
                onClick={() => {
                  scroll.scrollToTop({
                    duration: 1600,
                    delay: 100,
                    smooth: true
                  });
                }}
              >
                Scroll To Top
              </button>
            </PanelMainColumn>
          </PanelColumnsContainer>
        </PageContentContainer>
      </PageContainer>
    );
  }
}

/*
|--------------------------------------------------------------------------
| React Component
|--------------------------------------------------------------------------
*/
