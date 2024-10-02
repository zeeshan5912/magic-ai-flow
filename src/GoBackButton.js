// BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const GoBackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Goes back one page in the history stack
  };

  return (
    <button onClick={handleBack}>
      Go Back
    </button>
  );
};

export default GoBackButton;
