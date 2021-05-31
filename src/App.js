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
    this.handleTextSearchOnChange = this.handleTextSearchOnChange.bind(this);
    this.handleSortByOnChange = this.handleSortByOnChange.bind(this);
    this.handleGradeLevelsOnChange = this.handleGradeLevelsOnChange.bind(this);
    this.teacherTextSearch = this.teacherTextSearch.bind(this);
    this.teacherFilter = this.teacherFilter.bind(this);
    this.teacherSort = this.teacherSort.bind(this);
    // Set initial state
    this.state = {
      selectedGradeLevels: {
        nursery: true,
        lower: true,
        middle: true,
        upper: true
      },
      sortBy: "alphabeticalByLastName",
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
    let selected = { ...this.state.selectedGradeLevels };
    selected[evt.target.value] = !selected[evt.target.value];
    if (evt.target.value === "lower") {
      selected["nursery"] = selected["lower"];
    }
    console.log(selected);
    this.setState({ selectedGradeLevels: selected });
  }

  teacherFilter(t) {
    let keys = Object.keys(t.gradeLevelsTaught);
    let results = keys.map(
      (key) => this.state.selectedGradeLevels[key] === t.gradeLevelsTaught[key]
    );

    return results.some((t) => t) && this.teacherTextSearch(t);
  }

  teacherTextSearch(t) {
    if (t instanceof Object) {
      return Object.values(t).some((value) => this.teacherTextSearch(value));
    } else if (t instanceof Array) {
      return t.some((value) => this.teacherTextSearch(value));
    } else if (t instanceof String) {
      return t.includes(this.state.textSearch);
    } else {
      return JSON.stringify(t).includes(this.state.textSearch);
    }
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
