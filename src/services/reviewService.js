/**
 * Review Service
 * Handles all review and rating operations
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create a new review for equipment
 */
export const createReview = async (reviewData) => {
  try {
    const { userId, equipmentId, rentalId, rating, comment, equipmentName } = reviewData;

    // Validate required fields
    if (!userId || !equipmentId || !rentalId || !rating) {
      throw new Error('Missing required review fields');
    }

    // Create review document
    const reviewDoc = {
      reviewerId: userId,
      equipmentId,
      rentalId,
      equipmentName,
      rating: Number(rating),
      comment: comment || '',
      equipmentCondition: reviewData.equipmentCondition || rating,
      serviceRating: reviewData.serviceRating || rating,
      wouldRecommend: reviewData.wouldRecommend || true,
      feedback: reviewData.feedback || comment || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      helpful: 0,
      reported: false,
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'reviews'), reviewDoc);

    // Update equipment average rating
    await updateEquipmentRating(equipmentId);

    console.log('✅ Review created successfully:', docRef.id);

    return {
      success: true,
      reviewId: docRef.id,
    };
  } catch (error) {
    console.error('❌ Error creating review:', error);
    throw error;
  }
};

/**
 * Get all reviews for specific equipment
 */
export const getEquipmentReviews = async (equipmentId) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('equipmentId', '==', equipmentId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(reviewsQuery);

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));

    console.log(`✅ Found ${reviews.length} reviews for equipment ${equipmentId}`);

    return reviews;
  } catch (error) {
    console.error('❌ Error fetching equipment reviews:', error);
    return [];
  }
};

/**
 * Get all reviews by a specific user
 */
export const getUserReviews = async (userId) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('reviewerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(reviewsQuery);

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));

    console.log(`✅ Found ${reviews.length} reviews by user ${userId}`);

    return reviews;
  } catch (error) {
    console.error('❌ Error fetching user reviews:', error);
    return [];
  }
};

/**
 * Check if user has already reviewed a rental
 */
export const hasUserReviewedRental = async (userId, rentalId) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('reviewerId', '==', userId),
      where('rentalId', '==', rentalId)
    );

    const snapshot = await getDocs(reviewsQuery);

    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Error checking existing review:', error);
    return false;
  }
};

/**
 * Calculate and update equipment average rating
 */
export const updateEquipmentRating = async (equipmentId) => {
  try {
    // Get all reviews for this equipment
    const reviews = await getEquipmentReviews(equipmentId);

    if (reviews.length === 0) {
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / reviews.length;

    // Update equipment document
    const equipmentRef = doc(db, 'equipment', equipmentId);
    await updateDoc(equipmentRef, {
      rating: Number(averageRating.toFixed(1)),
      reviewCount: reviews.length,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Updated equipment ${equipmentId} rating to ${averageRating.toFixed(1)}`);

    return averageRating;
  } catch (error) {
    console.error('❌ Error updating equipment rating:', error);
    throw error;
  }
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      helpful: increment(1),
    });

    console.log(`✅ Marked review ${reviewId} as helpful`);

    return { success: true };
  } catch (error) {
    console.error('❌ Error marking review as helpful:', error);
    throw error;
  }
};

/**
 * Report a review
 */
export const reportReview = async (reviewId, reason) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      reported: true,
      reportReason: reason,
      reportedAt: serverTimestamp(),
    });

    console.log(`✅ Reported review ${reviewId}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Error reporting review:', error);
    throw error;
  }
};

/**
 * Get review statistics for equipment
 */
export const getReviewStats = async (equipmentId) => {
  try {
    const reviews = await getEquipmentReviews(equipmentId);

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendationRate: 0,
      };
    }

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let recommendCount = 0;

    reviews.forEach(review => {
      const rating = Math.floor(review.rating || 0);
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
      }
      if (review.wouldRecommend) {
        recommendCount++;
      }
    });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / reviews.length;

    // Calculate recommendation rate
    const recommendationRate = (recommendCount / reviews.length) * 100;

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      ratingDistribution,
      recommendationRate: Number(recommendationRate.toFixed(0)),
    };
  } catch (error) {
    console.error('❌ Error getting review stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      recommendationRate: 0,
    };
  }
};

export default {
  createReview,
  getEquipmentReviews,
  getUserReviews,
  hasUserReviewedRental,
  updateEquipmentRating,
  markReviewHelpful,
  reportReview,
  getReviewStats,
};
