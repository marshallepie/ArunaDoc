import { useState, useRef } from 'react'

interface AudioUploaderProps {
  onFileSelected: (file: File) => void
  onCancel: () => void
}

export const AudioUploader = ({ onFileSelected, onCancel }: AudioUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED_FORMATS = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
  ]
  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

  const validateFile = (file: File): boolean => {
    setError(null)

    if (!ACCEPTED_FORMATS.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)) {
      setError('Invalid file type. Please upload an audio file (MP3, WAV, WebM, OGG, M4A).')
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 500MB.')
      return false
    }

    return true
  }

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelected(selectedFile)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCancel} />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Audio File</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload a recorded audio file of the consultation (MP3, WAV, WebM, OGG, M4A).
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Drop Zone */}
          {!selectedFile && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a"
                onChange={handleChange}
                className="hidden"
              />

              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              <p className="mt-2 text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Click to upload
                </button>
                {' '}or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500">MP3, WAV, WebM, OGG, M4A up to 500MB</p>
            </div>
          )}

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-10 w-10 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatFileSize(selectedFile.size)}
                      {' • '}
                      {selectedFile.type || 'Audio file'}
                    </p>

                    {/* Audio Preview */}
                    <div className="mt-3">
                      <audio
                        controls
                        src={URL.createObjectURL(selectedFile)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-3 bg-blue-50 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-blue-700">
                      The audio will be transcribed and processed by AI after upload. This may take a few minutes
                      depending on the length of the recording.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload & Process
            </button>
            <button
              onClick={onCancel}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
