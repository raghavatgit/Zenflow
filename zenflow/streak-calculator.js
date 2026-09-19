/**
 * Focus Streak Progression Engine
 * Computes consecutive calendar day focus streaks with timezone tolerance.
 */

export class StreakCalculator {
  static MS_PER_DAY = 86400000;

  static calculateStreak(sessionTimestamps) {
    if (!sessionTimestamps || sessionTimestamps.length === 0) return 0;

    // Normalize timestamps to unique calendar day strings (YYYY-MM-DD)
    const uniqueDays = Array.from(
      new Set(
        sessionTimestamps.map((ts) => {
          const d = new Date(ts);
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        })
      )
    ).sort();

    if (uniqueDays.length === 0) return 0;

    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDate = new Date(uniqueDays[i - 1]);
      const currDate = new Date(uniqueDays[i]);
      const diffDays = Math.round((currDate - prevDate) / StreakCalculator.MS_PER_DAY);

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }
}
