import { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  increment,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { isVotingOpen } from "./Countdown";

export default function DesignCard({ design, uid, rank, onDelete, isWinner }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [animating, setAnimating] = useState(false);

  const voteRef = uid
    ? doc(db, "designs", design.id, "voters", uid)
    : null;

  useEffect(() => {
    if (!voteRef) return;
    getDoc(voteRef).then((snap) => {
      if (snap.exists()) setHasVoted(true);
    });
  }, [uid, design.id]);

  const votingOpen = isVotingOpen();

  async function toggleVote() {
    if (!voteRef || !votingOpen) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    const designRef = doc(db, "designs", design.id);

    try {
      if (hasVoted) {
        setHasVoted(false);
        await deleteDoc(voteRef);
        await updateDoc(designRef, { votes: increment(-1) });
      } else {
        setHasVoted(true);
        await setDoc(voteRef, { votedAt: new Date() });
        await updateDoc(designRef, { votes: increment(1) });
      }
    } catch (err) {
      console.error("Vote failed:", err);
      setHasVoted(!hasVoted);
    }
  }

  const rankLabel =
    rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`;

  return (
    <div className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col relative ${isWinner ? "ring-4 ring-sma-gold" : ""}`}>
      <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-lg ${isWinner ? "bg-sma-gold" : "bg-sma-blue/80"}`}>
        {isWinner ? "Winner!" : rankLabel}
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 bg-sma-blue/80 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600 transition"
          title="Delete your design"
        >
          Delete
        </button>
      )}
      <img
        src={design.imageUrl}
        alt={design.title}
        className="w-full h-64 object-contain bg-gray-50 p-2"
      />
      <div className="p-4 flex items-center justify-between mt-auto border-t border-sma-gold/10">
        <div>
          <h3 className="font-semibold text-sma-blue">{design.title}</h3>
          <p className="text-sm text-gray-400">
            {design.votes ?? 0} {design.votes === 1 ? "vote" : "votes"}
          </p>
        </div>
        <button
          onClick={toggleVote}
          disabled={!votingOpen}
          className={`text-2xl transition-transform ${animating ? "scale-125" : ""} ${
            hasVoted
              ? "text-sma-gold hover:text-sma-gold-dark"
              : "text-gray-300 hover:text-sma-gold"
          } ${!votingOpen ? "opacity-50 cursor-not-allowed" : ""}`}
          title={!votingOpen ? "Voting has ended" : hasVoted ? "Remove vote" : "Vote for this design"}
        >
          {hasVoted ? "\u2764\uFE0F" : "\u2661"}
        </button>
      </div>
    </div>
  );
}
