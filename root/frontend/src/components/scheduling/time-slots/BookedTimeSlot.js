import React, { Component } from "react";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { store } from "../../../store/configureStore.js";
import { APPOINTMENT_CANCELED } from "../../../store/user/userActions";
import { displayHour12Format } from "../../../util/scheduleFunctions";

export default class BookedTimeSlot extends Component {

  render() {
    return (
      <OverlayTrigger trigger="click" placement="bottom" overlay={this.popover}>
        <td
          rowSpan={
            parseInt(this.props.end.hours()) -
            parseInt(this.props.start.hours())
          }
          className="booked"
        >
          {displayHour12Format(this.props.start.hours()) + "-" + displayHour12Format(this.props.end.hours())}
          PM
        </td>
      </OverlayTrigger>
    );
  }

  popover = (
    <Popover id="popover-basic">
      <Popover.Title>
        <div className="popoverTitleContainer">
          <div>
            <img
              className="timeIcon"
              src={require("../../../images/time-icon.png")}
            ></img>
            {displayHour12Format(this.props.start.hours()) + "-" + displayHour12Format(this.props.end.hours())}
          </div>
          <img
            className="cancelIcon"
            src={require("../../../images/cancel-icon.png")}
            onClick={() => this.cancelAppointment()}
          ></img>
        </div>
      </Popover.Title>
      <Popover.Content>
        Tutor: <strong>{this.props.name}</strong>
        <br />
        Subject: <strong>{this.props.subject}</strong>
        <br />
        Notes: <strong>{this.props.note}</strong>
      </Popover.Content>
    </Popover>
  );

  cancelAppointment() {
    store.dispatch({
      type: APPOINTMENT_CANCELED,
      payload: {
        tutorID: this.props._id,
        time: {
          start: this.props.start,
          end: this.props.end,
        },
      },
    });
  }
}