import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';

const HOUSEHOLD_ID = 'default'; // Single household

export const useFirebaseMeals = () => {
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth before starting Firestore listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const mealsRef = collection(db, 'households', HOUSEHOLD_ID, 'mealEntries');
      const unsubscribeFirestore = onSnapshot(
        mealsRef,
        (snapshot) => {
          const mealsData = {};
          snapshot.forEach((doc) => {
            const { date, mealType, member, state } = doc.data();
            const key = `${date}-${member}-${mealType}`;
            mealsData[key] = state;
          });
          setMeals(mealsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching meals:', error);
          setLoading(false);
        }
      );

      return unsubscribeFirestore;
    });

    return unsubscribeAuth;
  }, []);

  const saveMeal = async (date, member, mealType, state) => {
    const docId = `${date}-${member}-${mealType}`;
    try {
      await setDoc(doc(db, 'households', HOUSEHOLD_ID, 'mealEntries', docId), {
        date,
        member,
        mealType,
        state,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  return { meals, loading, saveMeal };
};

export const useFirebaseMembers = () => {
  const [members, setMembers] = useState([]);
  const [memberDietary, setMemberDietary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth before starting Firestore listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const membersRef = collection(db, 'households', HOUSEHOLD_ID, 'members');
      const unsubscribeFirestore = onSnapshot(
        membersRef,
        (snapshot) => {
          const membersData = [];
          const dietaryData = {};
          snapshot.forEach((doc) => {
            const { name, dietary } = doc.data();
            membersData.push(name);
            dietaryData[name] = dietary;
          });
          setMembers(membersData.sort());
          setMemberDietary(dietaryData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching members:', error);
          setLoading(false);
        }
      );

      return unsubscribeFirestore;
    });

    return unsubscribeAuth;
  }, []);

  const addMember = async (name, dietary) => {
    try {
      await setDoc(doc(db, 'households', HOUSEHOLD_ID, 'members', name), {
        name,
        dietary,
        joinedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const removeMember = async (name) => {
    try {
      await deleteDoc(doc(db, 'households', HOUSEHOLD_ID, 'members', name));
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error removing member: ' + error.message);
    }
  };

  return { members, memberDietary, loading, addMember, removeMember };
};
