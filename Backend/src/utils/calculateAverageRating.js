export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) {
    return { averageRating: 0, totalRatings: 0 };
  }
  const totalRatings = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Number((sum / totalRatings).toFixed(1)),
    totalRatings,
  };
};