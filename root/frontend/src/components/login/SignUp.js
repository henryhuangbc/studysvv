import React from "react";
import { createAccount } from "../../util/apiCallFunctions";
import "./Login.css";
import CustomButton from "./CustomButton.js";
import { Component } from "react";
import { Form, Modal } from "react-bootstrap";

const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);
const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach((val) => val.length > 0 && (valid = false));
  return valid;
};
const userType = "";
class SingUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      password: "",
      userType: "",
      showModal: false,
      errors: {
        email: "",
        password: "",
        login: "",
      },
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleInputChange(event) {
    event.preventDefault();
    const { name, value } = event.target;
    let errors = this.state.errors;
    // console.log(name, value);

    switch (name) {
      case "email":
        errors.email = !this.state.email ? "email can't be empty!" : "";
        if (this.state.email) {
          errors.email = validEmailRegex.test(value)
            ? ""
            : "email is not valid!";
        }
        if (value.length > 30) {
          errors.email = "email is to long!";
        }
        break;
      case "password":
        errors.password =
          value.length < 4 ? "password can't be shotrer then 4 characters" : "";
        if (value.length > 30) {
          errors.password = "password can be maximum 30 characters";
        }
        break;

      default:
        break;
    }

    this.setState({ errors, [name]: value }, () => {
      //console.log(errors);
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    let errors = this.state.errors;
    console.log(
      "Handle Submit says: this is a user type: " + this.state.userType
    );
    if (
      validateForm(this.state.errors) &&
      this.state.email &&
      this.state.password
    ) {
      console.info("HANDLE SUBMIT SAYS: Valid Form");
      let login = await createAccount(
        this.state.name,
        this.state.email,
        this.state.password,
        this.state.userType
      );
      console.log("value of LOGIN returned is: ", login);
      if (!login) {
        this.setState({...this.state, showModal: true})
        
        console.log("success!!!!!!!!!!!!");
        //window.location.href = "/profile";
      } else {
        document.getElementById("submittion-error").innerHTML = login;
        // await this.setState({ ...this.state, errors: { login: login } }, () => {
        //   console.log(errors);
        // });
        console.error("HANDLE SUBMIT SAYS: invalid Form");
      }
    }
  }
  render() {
    //modal
    const { errors } = this.state;
    //  console.log("xxxxxxxxxxxxxxxxxxxxxx", this.state); 
    return (
      <>
      <Modal centered = 'true' show={this.state.showModal} onHide={()=>{this.setState({...this.state, showModal: false}); window.location.href = "/login";}}>
        <Modal.Header closeButton>
          <Modal.Title>You are almost done!</Modal.Title>
        </Modal.Header>
        <Modal.Body>your request was accepted, check your emai to confirm your account!</Modal.Body>
      </Modal>
    
      <form
        className="parentLoginFormBoxContainer"
        onSubmit={this.handleSubmit}
      >
        <div className="loginFormBoxContainer">
          <h3 style={{ textAlign: "center" }}>Sign Up</h3>

          <div className="form-group">
            <label> Name</label>
            <input
              onBlur={this.handleInputChange}
              onChange={this.handleInputChange}
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label>Email address</label>
            <input
              onBlur={this.handleInputChange}
              onChange={this.handleInputChange}
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter email"
            />
            {errors.email.length > 0 && (
              <Form.Text className="error">{errors.email}</Form.Text>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              onBlur={this.handleInputChange}
              onChange={this.handleInputChange}
              name="password"
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
            />
            {errors.password.length > 0 && (
              <Form.Text className="error">{errors.password}</Form.Text>
            )}
          </div>
          <Form.Text id="submittion-error" className="error">
            {errors.login}
          </Form.Text>
          <CustomButton
            name="login"
            onClick={() => {
              console.log("random message");
              this.setState({ ...this.state, userType: "tutor" });
            }}
          >
            Sign Up as a tutor
          </CustomButton>
          <CustomButton
              name="login"
              onClick={() => {
                this.setState({ ...this.state, userType: "tutee" });
              }}
            >
              Sign up as a tutee
            </CustomButton>
          <p className="forgot-password text-right">
            Already registered <a href="/Login">sign in?</a>
            {/* props.flip() */}
            
          </p>
        </div>
      </form>
      </>
    );
  }
}

export default SingUp;
