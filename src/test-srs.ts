import { calculateNextReview, type ReviewRating } from "./lib/srs-algorithm";

console.log("--- SRS Algorithm Verification ---");

const now = new Date();
console.log("Current Time:", now.toISOString());

function testReview(level: number, rating: ReviewRating, expectedLabel: string) {
    const result = calculateNextReview(level, rating);
    const diffMs = result.nextReview.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    const diffHours = diffMinutes / 60;
    const diffDays = diffHours / 24;

    console.log(`Level ${level} + ${rating} -> New Level: ${result.newLevel}`);
    console.log(`Interval: ${diffMinutes.toFixed(2)} mins / ${diffHours.toFixed(2)} hours / ${diffDays.toFixed(2)} days`);
    console.log(`Expected: ${expectedLabel}`);
    console.log("--------------------------------");
}

// Test Cases
testReview(0, 'fail', "~15 mins (Level 0)");
testReview(2, 'fail', "~15 mins (Level 0)");
testReview(0, 'hard', "~15 mins (Level 0)");
testReview(2, 'hard', "~1 day (Level 2)");

testReview(0, 'good', "~1 day (Level 1)");
testReview(1, 'good', "~3 days (Level 2)");
testReview(2, 'good', "~7 days (Level 3)");
testReview(3, 'good', "~30 days (Level 4)");
testReview(4, 'good', "~30 days (Level 5)");
