"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(
      (f) => /\.pdf$/i.test(f.name)
    );

    if (files.length + valid.length > 16) {
      console.log("El numero máximo de archivos a subir es 16.");
      return;
    }

    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const handleGenerate = async () => {
    if (!files.length) {
      console.log("Selecciona al menos un archivo.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/lab-results/extract", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", res);

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      console.log("Texto extraído:", data);
    } catch (error) {
      console.error("Error al extraer los archivos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col">

      {/* Main Card */}
      <div className="max-w-xl mx-auto mt-8 mb-8 p-6 bg-white rounded-2xl shadow-lg transition-all">
        <p className="text-gray-700 text-center mb-6">
          Sube 1 o más PDFs con resultados de laboratorio y recibe tu flujograma listo.
        </p>

        {/* Hidden input */}
        <input
          ref={fileInputRef}
          id="fileInput"
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {/* Dropzone */}
        <div
          className="border-2 border-dashed border-gray-400 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-600 transition-all duration-300"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
        >
          <div className="flex justify-center items-center text-blue-400 text-5xl mb-4">
            {/* <FaRegFileAlt  /> */}
          </div>
          <div className="text-gray-600 font-semibold">
            Arrastra archivos aquí o haz clic para seleccionarlos
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center px-4 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition gap-2"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {/* <FaUpload /> */}
            Seleccionar archivos
          </button>
        </div>

        {/* File list */}
        <div className="mt-4 flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {file.name} · {(file.size / 1024).toFixed(0)} KB
              <button
                onClick={() => removeFile(idx)}
                className="ml-1 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center space-y-3">
          {loading && (
            <Image src="/loading.gif" alt="Cargando..." width={32} height={32} unoptimized />
          )}

          {/* Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-900 text-white px-6 py-2 rounded-2xl font-medium hover:bg-blue-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Generar flujograma
            </button>
            <button
              onClick={clearAll}
              className="bg-gray-500 text-white px-6 py-2 rounded-2xl font-medium hover:bg-gray-400 transition-all duration-200"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    
    {/* <Toaster position="top-right" richColors /> */}
    </main>
  );
}
