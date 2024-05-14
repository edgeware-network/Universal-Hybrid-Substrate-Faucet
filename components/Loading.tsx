import React from "react";
import HashLoader from "react-spinners/HashLoader";

export default function Loading() {
  return (
    <div className="flex items-center min-h-96">
      <HashLoader
        color="#FC72FF"
        loading={true}
        size={50}
        speedMultiplier={1}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}
