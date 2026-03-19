import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, ensureAuth } from "../firebase";

export default function UploadForm({ onUploaded }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `designs/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Save metadata to Firestore
      const user = await ensureAuth();
      await addDoc(collection(db, "designs"), {
        title: title.trim() || "Untitled Design",
        imageUrl,
        votes: 0,
        uploadedBy: user.uid,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setTitle("");
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploaded?.();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md p-6 max-w-lg mx-auto border border-sma-gold/20"
    >
      <h2 className="text-xl font-bold text-sma-blue mb-4">
        Submit a Design
      </h2>

      <input
        type="text"
        placeholder="Design title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-sma-blue"
      />

      <label className="block w-full border-2 border-dashed border-sma-gold/40 rounded-lg p-6 text-center cursor-pointer hover:border-sma-gold transition mb-3">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 mx-auto rounded-lg object-contain"
          />
        ) : (
          <span className="text-gray-400">
            Click to choose an image (JPG / PNG)
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full bg-sma-blue text-white font-bold py-2.5 rounded-lg hover:bg-sma-blue-light disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {uploading ? "Uploading..." : "Upload Design"}
      </button>
    </form>
  );
}
