// Style
import { FunctionComponent, useMemo, useState } from "react";
import "./index.scss";
import uniwiseBrand from "./images/uniwise_logo.png";

const Task1: FunctionComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const isValid = useMemo(() => {
    const hasEmail = /\S+@\S+\.\S+/.test(email.trim());
    const hasPw = password.trim().length >= 6;
    return hasEmail && hasPw;
  }, [email, password]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    alert(
      `Email: ${email}\nPassword: ${password}\nRemember me: ${remember ? "Yes" : "No"}`
    );
  };

  return (
    <div id="task-1">
      <div className="auth-card">
        {/* Brand */}
        <div className="brand">
          <img
            src={uniwiseBrand}
            alt="UNIwise"
            className="brand-img"
            loading="eager"
            decoding="async"
          />
        </div>

        <h1 className="title">Log in</h1>
        <p className="subtitle">Welcome back. Please enter your details.</p>

        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <input
              id="email"
              name="email"
              type="email"
              placeholder=" "
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="form-group">
            <input
              id="password"
              name="password"
              type="password"
              placeholder=" "
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <label htmlFor="password">Password</label>
          </div>

          {/* Remember me checkbox */}
          <div className="form-remember">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.currentTarget.checked)}
              />
              <span className="checkmark" />
              Remember me
            </label>
          </div>

          <div className="actions">
            <a className="link" href="#" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
            <button className="btn" type="submit" disabled={!isValid}>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Task1;
