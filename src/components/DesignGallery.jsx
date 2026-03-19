import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage, ensureAuth } from "../firebase";
import DesignCard from "./DesignCard";
import { isVotingOpen } from "./Countdown";

export default function DesignGallery() {
  const [designs, setDesigns] = useState([]);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureAuth().then((user) => setUid(user.uid));
  }, []);

  useEffect(() => {
    const q = query(collection(db, "designs"), orderBy("votes", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setDesigns(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleDelete(design) {
    if (!confirm(`Delete "${design.title}"?`)) return;

    try {
      // Delete voter subcollection docs
      const voterSnap = await getDocs(
        collection(db, "designs", design.id, "voters")
      );
      for (const v of voterSnap.docs) {
        await deleteDoc(v.ref);
      }

      // Delete image from Storage
      try {
        const imageRef = ref(storage, design.imageUrl);
        await deleteObject(imageRef);
      } catch {
        // Image may already be gone — that's fine
      }

      // Delete the design doc
      await deleteDoc(doc(db, "designs", design.id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete design.");
    }
  }

  if (loading) {
    return (
      <p className="text-center text-gray-400 py-12">Loading designs...</p>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No designs yet.</p>
        <p className="text-gray-400 mt-1">
          Be the first — click <strong>+ Submit Design</strong> above!
        </p>
      </div>
    );
  }

  const votingOpen = isVotingOpen();
  const topVotes = designs[0]?.votes ?? 0;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design, i) => (
        <DesignCard
          key={design.id}
          design={design}
          uid={uid}
          rank={i + 1}
          isWinner={!votingOpen && topVotes > 0 && design.votes === topVotes}
          onDelete={
            design.uploadedBy === uid ? () => handleDelete(design) : null
          }
        />
      ))}
    </div>
  );
}
