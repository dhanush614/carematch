/**
 * Calculate compatibility score between a parent and caregiver
 * @param {Object} parent - Parent profile
 * @param {Object} caregiver - Caregiver profile
 * @returns {number} - Compatibility score (0-100)
 */
export function calculateMatchScore(parent, caregiver) {
  let score = 0;
  let maxScore = 0;

  // Match overnight stay requirements (weight: 25)
  if (parent.overnight_stay === caregiver.overnight_ok) {
    score += 25;
  }
  maxScore += 25;

  // Match pet care requirements (weight: 15)
  if (parent.needs_petcare === caregiver.pets_ok) {
    score += 15;
  }
  maxScore += 15;

  // Experience score based on rating (weight: 20)
  if (caregiver.rating) {
    score += (caregiver.rating / 5) * 20;
  }
  maxScore += 20;

  // Verification status (weight: 20)
  if (caregiver.verified) {
    score += 20;
  }
  maxScore += 20;

  // Skills match (weight: 20)
  const caregiverSkills = new Set(caregiver.skills?.toLowerCase().split(',').map(s => s.trim()) || []);
  const parentNeeds = new Set(parent.notes?.toLowerCase().split(',').map(s => s.trim()) || []);
  const matchingSkills = [...parentNeeds].filter(need => 
    [...caregiverSkills].some(skill => skill.includes(need) || need.includes(skill))
  );
  
  if (parentNeeds.size > 0) {
    score += (matchingSkills.length / parentNeeds.size) * 20;
    maxScore += 20;
  }

  // Convert to percentage
  return Math.round((score / maxScore) * 100);
}

/**
 * Filter and sort matches based on criteria
 * @param {Array} parents - List of parent profiles
 * @param {Array} caregivers - List of caregiver profiles
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Sorted matches with scores
 */
export function findMatches(parents, caregivers, filters = {}) {
  const matches = [];

  for (const parent of parents) {
    const parentMatches = caregivers
      .filter(caregiver => {
        // Apply filters
        if (filters.minRating && caregiver.rating < filters.minRating) return false;
        if (filters.verifiedOnly && !caregiver.verified) return false;
        if (filters.maxRate && caregiver.rate > filters.maxRate) return false;
        if (filters.overnight && !caregiver.overnight_ok) return false;
        if (filters.petCare && !caregiver.pets_ok) return false;
        return true;
      })
      .map(caregiver => ({
        parent,
        caregiver,
        score: calculateMatchScore(parent, caregiver)
      }))
      .filter(match => match.score >= (filters.minScore || 0));

    matches.push(...parentMatches);
  }

  // Sort by score in descending order
  return matches.sort((a, b) => b.score - a.score);
}
