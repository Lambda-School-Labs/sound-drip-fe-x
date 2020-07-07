// modules
import React from "react";

// styles
import { LoadContainer } from "./loading.styles";


// assets
import Loader from "../../assets/loader.gif";

const LoaderContainer = ({dsError}) => {
  return (
    <div>
      <LoadContainer>
        {localStorage.getItem('premium_error') ? <h1>Please Log In With Premium User</h1> : <img src={Loader} alt="waiting animation" />}
        {/* {localStorage.getItem('premium_error') && <h1>Please Log In With Premium User</h1>} */}
      </LoadContainer>
    </div>
  );
};

export default LoaderContainer;
