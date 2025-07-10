import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const isRecordingSupported =
  !!navigator.mediaDevices &&
  typeof navigator.mediaDevices.getUserMedia === 'function' &&
  typeof window.MediaRecorder === 'function'

export function RecordRoomAudio() {
  const [isRecording, setIsRecording] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)

  async function startRecording() {
    if (!isRecordingSupported) {
      return toast.error('Su navegador no soporta grabación')
    }

    setIsRecording(true)

    const audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44_100,
      },
    })

    recorder.current = new MediaRecorder(audio, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 64_000,
    })

    recorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        // biome-ignore lint/suspicious/noConsole: para verificar se ha algum evento
        console.log(event.data)
      }
    }

    recorder.current.onstart = () => {
      // biome-ignore lint/suspicious/noConsole: ao iniciar a gravacao
      console.log('Grabacion Iniciada.')
    }

    recorder.current.onstop = () => {
      // biome-ignore lint/suspicious/noConsole: ao parar a gravacao
      console.log('Grabación encerrada')
    }

    recorder.current.start()
  }

  function stopRecording() {
    setIsRecording(false)

    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop()
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
