import React, { Component } from "react";
import "./WeeklySchedule.css";
import TimeSlotBooked from "./time-slots/TimeSlotBooked";
import TimeSlotOpen from "./time-slots/TimeSlotOpen";
import UserOpenTimeSlot from "./time-slots/UserOpenTimeSlot";
import OpenableTimeSlot from "./time-slots/OpenableTimeSlot";
import moment from "moment";
import { connect } from "react-redux";
import {
  convertSingleHoursToTimeSlots, findTimeSlot, removeSlotConflict, convertDateStringsToDates, checkIfAppointmentsConflict,
  combineSingleSlots, displayHour12Format, fallsOnSameDay
} from "../../util/scheduleFunctions.js";
import ArrowBackIosOutlinedIcon from "@material-ui/icons/ArrowBackIosOutlined";
import ArrowForwardIosOutlinedIcon from "@material-ui/icons/ArrowForwardIosOutlined";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import purple from "@material-ui/core/colors/purple";
import Button from "react-bootstrap/Button";
import Slider from '@material-ui/core/Slider';

const customTheme = createMuiTheme({ palette: { primary: purple } });
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function createHours() {
  let hours = [];
  for (let hour = 1; hour <= 23; hour = hour + 3) {
    hours[hour] = { value: hour, label: displayHour12Format(hour) }
  }
  return hours;
}
const sliderHours = createHours();

class WeeklySchedule extends Component {

  state = {
    weekStart: moment().startOf("week"),
    chosenDay: moment(),
    isSaving: false,
    hourRange: [8, 19]
  };

  render() {
    return (
      <div className="weekScheduleContainer">
        <div className="weekControlSection">
          <div className="weekControlSectionTop">
            <ArrowBackIosOutlinedIcon className="weekChangeIcons"
              onClick={() => this.setState({ weekStart: this.state.weekStart.clone().subtract(1, "week").startOf("week"), })} />
            <h5>Week starting on {this.state.weekStart.format("MMM DD YYYY")}</h5>
            <ArrowForwardIosOutlinedIcon className="weekChangeIcons"
              onClick={() => this.setState({ weekStart: this.state.weekStart.clone().add(1, "week").startOf("week"), })} />
            <ThemeProvider theme={customTheme}>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="DD/MM/yyyy"
                  id="date-picker-inline"
                  value={this.state.chosenDay}
                  onChange={(date) => {
                    if (date !== null && date.isValid())
                      this.setState({
                        weekStart: date.clone().startOf("week"),
                        chosenDay: date,
                      });
                  }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider>
            </ThemeProvider>
            <Button
              variant="secondary"
              size="sm"
              disabled={this.state.isSaving}
              onClick={() => {
                if (!this.state.isSaving) {
                  this.setState({ ...this.state, isSaving: true });
                  let sendDate = { hours: this.props.user.availableHours };
                  fetch("/api/tutors/schedule", {
                    method: "POST",
                    headers: {
                      "X-Auth-Token": this.props.token,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(sendDate),
                  }).then((response) => {
                    this.setState({ ...this.state, isSaving: false });
                  });
                }
              }}
            >
              {this.state.isSaving ? "Saving..." : "Save Schedule"}
            </Button>

          </div>


          <h6>Display hour range</h6>
          <ThemeProvider theme={customTheme}>
            <Slider
              value={this.state.hourRange}
              marks={sliderHours}
              min={0}
              max={23}
              valueLabelFormat={(value) => moment().set("minute", 0).set("hour", value).format("ha")}
              onChange={(e, newValue) => this.setState({ ...this.state, hourRange: newValue })}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              getAriaValueText={(value) => `${value}AM`}
            />
          </ThemeProvider>


        </div>


        <div className="scheduleScrollContainer">
          <table className="weeklySchedule">
            <thead>
              <tr>
                <th></th>
                {this.makeDayHeaderCells()}
              </tr>
            </thead>
            <tbody>
              {this.fillRows()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  makeDayHeaderCells() {
    let headerCells = [];
    for (let day = 0; day < DAYS_OF_WEEK.length; day++)
      headerCells[day] = (
        <th>
          {`${DAYS_OF_WEEK[day]}`}
          <br />
          {this.state.weekStart.clone().add(day, "day").format("DD/MM/YYYY")}
        </th>
      );

    return headerCells;
  }

  // This method works but feels bloated I need to simplify it somehow
  fillRows() {
    let userAppointments = convertDateStringsToDates(this.props.user.appointments); // User's appointments (can be tutee or tutor)
    let userAvailableHours = this.props.user.user.type === "tutor" ? convertSingleHoursToTimeSlots(this.props.user.availableHours) : []; // If user is a tutor they might have available hours

    // userAvailableHours = convertDateStringsToDates(userAvailableHours);

    combineSingleSlots(userAvailableHours);


    let viewedTutorAppointments = convertDateStringsToDates(this.props.viewedTutor.appointments);

    let viewedTutorAvailableHours =
      typeof this.props.viewedTutor.availableHours !== "undefined"
        ? convertSingleHoursToTimeSlots(this.props.viewedTutor.availableHours)
        : [];
    viewedTutorAvailableHours = convertDateStringsToDates(viewedTutorAvailableHours);
    combineSingleSlots(viewedTutorAvailableHours);

    removeSlotConflict(viewedTutorAvailableHours, userAppointments); // This will remove any tutor open hours that cant be booked because of pre-existing conflicts

    let table = [];
    for (let hour = this.state.hourRange[0]; hour <= this.state.hourRange[1]; hour++) {
      let row = [];
      for (let day = 0; day < 7; day++) {
        let viewedTutorAppointmentSlot = this.findTimeSlot(day, hour, viewedTutorAppointments);
        let viewedTutorAvailableHourSlot = this.findTimeSlot(day, hour, viewedTutorAvailableHours);
        let userAppointmentSlot = this.findTimeSlot(day, hour, userAppointments);
        let userAvailableHourSlot = this.findTimeSlot(day, hour, userAvailableHours);

        // Display viewed tutor appointments
        if (typeof viewedTutorAppointmentSlot !== "undefined") {
          if (hour === viewedTutorAppointmentSlot.time.start.getHours())
            row[day] = (
              <TimeSlotBooked
                start={viewedTutorAppointmentSlot.time.start.getHours()}
                end={viewedTutorAppointmentSlot.time.end.getHours()}
                name={viewedTutorAppointmentSlot.tutorID}
                subject={viewedTutorAppointmentSlot.subject}
                note={viewedTutorAppointmentSlot.note}
              />
            );
          // Display viewed tutor available hours
        } else if (typeof viewedTutorAvailableHourSlot !== "undefined") {
          if (hour === viewedTutorAvailableHourSlot.time.start.hours())
            row[day] = <TimeSlotOpen tutor={this.props.viewedTutor} timeSlot={viewedTutorAvailableHourSlot} />;
          // Display user appointments
        } else if (typeof userAppointmentSlot !== "undefined") {
          if (hour === userAppointmentSlot.time.start.hours())
            row[day] = (
              <TimeSlotBooked
                start={userAppointmentSlot.time.start}
                end={userAppointmentSlot.time.end}
                name={userAppointmentSlot.tutorID}
                subject={userAppointmentSlot.subject}
                note={userAppointmentSlot.note}
              />
            );
          // Display user available hours (only if user is tutor)
        } else if (typeof userAvailableHourSlot !== "undefined") {
          if (hour === userAvailableHourSlot.time.start.hours() || hour === this.state.hourRange[0])
            row[day] = <UserOpenTimeSlot tutor={this.props.user} timeSlot={userAvailableHourSlot} displayRange={this.state.hourRange} />;
        } else {
          // Need to highlight past cells in a different color
          if (this.state.weekStart.clone().add(day, "day").isBefore(moment())) {
            row[day] = <td className="pastSlot"></td>;
          } else {
            // Tutor's can interact with empty cells and open them, tutees cannot
            row[day] =
              this.props.user.user.type === "tutor" ? (
                <OpenableTimeSlot date={this.state.weekStart.clone().add(day, "days").add(hour, "hours")} />
              ) : (
                  <td></td>
                );
          }
        }
      }
      let displayHour = hour !== this.state.hourRange[0] ? displayHour12Format(hour) : "";
      row.unshift(<td className="time"> {`${displayHour}`} </td>);
      table.push(<tr>{row}</tr>);
    }
    return table;
  }

  // Finds and returns the single point (or undefined) in a collection of slots that meet the condition of day and hour
  findTimeSlot(day, hour, slots) {
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].time.end.hours() === 0) {
        if (fallsOnSameDay(this.state.weekStart.clone().add(day, "day"), moment(slots[i].time.start))
          && hour >= slots[i].time.start.hours() && hour < 24) {
          return slots[i];
        }
      } else {
        if (fallsOnSameDay(this.state.weekStart.clone().add(day, "day"), moment(slots[i].time.start))
          && hour >= slots[i].time.start.hours() && hour < slots[i].time.end.hours()) {
          return slots[i];
        }
      }
    }
  }

}

function mapStateToProps(state) {
  return {
    user: state.userReducer.user,
    viewedTutor: state.viewedTutorReducer,
    token: state.userReducer.token,
  };
}

export default connect(mapStateToProps)(WeeklySchedule);


