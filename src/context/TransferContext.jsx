import React, { createContext, useContext, useCallback } from "react";
import { useSave } from "./SaveContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const TransferContext = createContext();

export const TransferProvider = ({ children }) => {
  const { createDocument, getDocuments } = useSave();

  const addToToday = useCallback(async (collectionName, document) => {
    try {
      const todayCollectionRef = collection(db, "Today");
      const q = query(todayCollectionRef, where("docId", "==", document.id));
      const querySnapshot = await getDocs(q);
      const docToSave = {
        ...document,
        updatedAt: serverTimestamp(),
      };

      if (!querySnapshot.empty) {
        // Document exists, update it
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "Today", existingDoc.id), docToSave);
      } else {
        // Document doesn't exist, add it
        await addDoc(todayCollectionRef, {
          ...docToSave,
          collectionName,
          createdAt: serverTimestamp(),
          docId: document.id,
        });
      }
    } catch (error) {
      console.error(
        "Error adding/updating document in Today collection:",
        error
      );
      throw error;
    }
  }, []);

  const moveToPreviousDays = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const previousDaysCollectionRef = collection(db, "Previous Days");
    const todayCollectionRef = collection(db, "Today");

    const todayDocs = await getDocs(todayCollectionRef);
    todayDocs.forEach(async (docSnapshot) => {
      const docData = docSnapshot.data();
      if (
        new Date(docData.createdAt.toDate()).toISOString().split("T")[0] ===
        today
      ) {
        await addDoc(previousDaysCollectionRef, {
          ...docData,
          movedAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "Today", docSnapshot.id), {
          movedAt: serverTimestamp(),
        });
      }
    });
  }, []);

  return (
    <TransferContext.Provider value={{ addToToday, moveToPreviousDays }}>
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error("useTransfer must be used within a TransferProvider");
  }
  return context;
};
