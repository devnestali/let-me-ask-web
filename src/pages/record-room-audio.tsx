/** biome-ignore-all lint/suspicious/noConsole: al empezar gravación y terminar grabación */
import { useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const isRecordingSupported =
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function' &&
  typeof window.MediaRecorder === 'function'

type RecordRoomParams = {
  roomId: string
}

export function RecordRoomAudio() {
  const [isRecording, setIsRecording] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)
  const params = useParams<RecordRoomParams>()
  const intervalRef = useRef<NodeJS.Timeout>(null)

  if (!params.roomId) {
    return <Navigate replace to="/" />
  }

  async function uploadAudio(audio: Blob) {
    const formData = new FormData()

    formData.append('file', audio, 'audio.webm')

    const response = await fetch(
      `http://localhost:3333/rooms/${params.roomId}/audio`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const result = await response.json()

    return result
  }

  function createRecorder(audio: MediaStream) {
    recorder.current = new MediaRecorder(audio, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 64_000,
    })

    recorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        uploadAudio(event.data)
      }
    }

    recorder.current.onstart = () => {
      console.log('Grabacion Iniciada.')
    }

    recorder.current.onstop = () => {
      console.log('Grabación encerrada')
    }

    recorder.current.start()
  }

  async function startRecording() {
    if (!isRecordingSupported) {
      return toast.error('Su navegador no soporta grabación')
    }

    setIsRecording(true)
    toast('Grabación Iniciada.')

    const audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44_100,
      },
    })

    createRecorder(audio)

    intervalRef.current = setInterval(() => {
      recorder.current?.stop()

      createRecorder(audio)
    }, 5000)
  }

  function stopRecording() {
    setIsRecording(false)
    toast('Grabación terminada.')

    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop()
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      {isRecording ? (
        <Button className="cursor-pointer" onClick={stopRecording}>
          Pausar grabación
        </Button>
      ) : (
        <Button className="cursor-pointer" onClick={startRecording}>
          Grabar audio
        </Button>
      )}
      {isRecording ? <p>Grabando...</p> : <p>Pausado</p>}
    </div>
  )
}
