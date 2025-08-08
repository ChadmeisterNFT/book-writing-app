import React from 'react';

/**
 * Dashboard component shows a simple overview of the writer's goals and
 * progress. In this MVP the values are placeholders; you can extend
 * these values by connecting them to real data sources such as the
 * Firebase database or local storage.
 */
const Dashboard = () => {
  // Placeholder values for demonstration purposes.
  const dailyGoal = 500; // daily word count goal
  const wordsWrittenToday = 0; // track the user's progress today

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p><strong>Daily Goal:</strong> {dailyGoal} words</p>
      <p><strong>Words Written Today:</strong> {wordsWrittenToday}</p>
      <p>
        As you write in the <em>Write</em> section, you can come back here to
        see how close you are to your daily goal.
      </p>
    </div>
  );
};

export default Dashboard;