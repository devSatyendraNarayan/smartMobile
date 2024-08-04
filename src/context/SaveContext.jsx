import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  serverTimestamp,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

const SaveContext = createContext();

export const useSave = () => {
  const context = useContext(SaveContext);
  if (!context) {
    throw new Error("useSave must be used within a SaveProvider");
  }
  return context;
};

export const SaveProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsyncOperation = async (operation) => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.error("Operation failed:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createDocument = useCallback((collectionName, data) =>
    handleAsyncOperation(async () => {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Document written with ID:", docRef.id);
      return docRef.id;
    }),
  []);

  const updateDocument = useCallback((collectionName, docId, data) =>
    handleAsyncOperation(async () => {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log("Document updated with ID:", docId);
    }),
  []);

  const deleteDocument = useCallback((collectionName, docId) =>
    handleAsyncOperation(async () => {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      console.log("Document deleted with ID:", docId);
    }),
  []);

  const getDocuments = useCallback((collectionName, constraints = []) =>
    handleAsyncOperation(async () => {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }),
  []);

  const subscribeToCollection = useCallback((collectionName, callback, constraints = []) => {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(documents);
    });
  }, []);


  const value = useMemo(() => ({
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    subscribeToCollection,
  }), [loading, error, createDocument, updateDocument, deleteDocument, getDocuments, subscribeToCollection]);

  return (
    <SaveContext.Provider value={value}>
      {children}
    </SaveContext.Provider>
  );
};