// Calculates the account level based on current ghost points
export const calculateLevel = (points) => {
    if (points >= 500) return "specter";
    if (points >= 200) return "phantom";
    if (points >= 50) return "ghost";
    return "newbie";
};

// Adds points to a user, recalculates their level, and saves
export const addPoints = async (user, amount) => {
    user.ghostPoints += amount;
    user.accountLevel = calculateLevel(user.ghostPoints);
    await user.save();
    return user;
};

// Deducts points from a user, recalculates their level, and saves
export const spendPoints = async (user, amount) => {
    if (user.ghostPoints < amount) {
        return null; // Not enough points
    }
    user.ghostPoints -= amount;
    user.accountLevel = calculateLevel(user.ghostPoints);
    await user.save();
    return user;
};
