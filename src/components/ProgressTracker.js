import React from 'react';

/**
 * ProgressTracker provides a high-level overview of the story structure
 * progress. For the MVP we display hard-coded percentages for a three-act
 * structure. In future iterations you can make these dynamic based on
 * completed chapters or sections.
 */
const ProgressTracker = () => {
  return (
    <div className="progress-tracker">
      <h2>Story Progress</h2>
      <ul>
        <li>Act 1: 0% completed</li>
        <li>Act 2: 0% completed</li>
        <li>Act 3: 0% completed</li>
      </ul>
    </div>
  );
};

export default ProgressTracker;