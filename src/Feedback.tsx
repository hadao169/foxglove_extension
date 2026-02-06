import { CSSProperties } from "react";
import { NavigateToPoseFeedback } from "./type";

export default function FeedbackMsg({ feedback }: { feedback?: NavigateToPoseFeedback }) {

  return (
    <div style={containerStyle}>
      <h1>Feedback Message</h1>
      <div style={feedbackItemStyle}>
        <p>Navigation Time: {feedback?.feedback.navigation_time?.sec}</p>
        <p>Distance Remaining: {feedback?.feedback.distance_remaining?.toFixed(2)}</p>
        <p>Number of Recoveries: {feedback?.feedback.number_of_recoveries}</p>
        <p>Estimated Time Remaining: {feedback?.feedback.estimated_time_remaining?.sec}</p>
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  height: "100%",
  gap: "8px",
};

const feedbackItemStyle: CSSProperties = {
  backgroundColor: "#1e293b",
  padding: "10px",
  borderRadius: "5px",
  width: "100%",
  border: "2px solid #475569",
  fontSize: "14px",
};
